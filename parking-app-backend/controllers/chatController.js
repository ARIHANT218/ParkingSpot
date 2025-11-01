// controllers/chatController.js
const mongoose = require('mongoose');
const { canAcessChat } = require('../utils/chatAuth'); // keep your existing name
const Message = require('../models/Message');
const Booking = require('../models/Booking');

/**
 * Get messages for a booking (only allowed participants).
 */
const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return res.status(400).json({ message: 'bookingId required' });

    const { ok, booking, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || 'Access denied' });

    // Query both ObjectId and string forms to be resilient to schema inconsistencies
    const query = mongoose.Types.ObjectId.isValid(bookingId)
      ? { $or: [{ bookingId: mongoose.Types.ObjectId(bookingId) }, { bookingId }] }
      : { bookingId };

    const messages = await Message.find(query).sort({ createdAt: 1 }).lean();
    return res.json(messages);
  } catch (err) {
    console.error('getMessages error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send a message (only allowed participants).
 */
const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    if (!bookingId) return res.status(400).json({ message: 'bookingId required' });
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text required' });

    const { ok, booking, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || 'Access denied' });

    // Save bookingId as ObjectId when possible (safer if schema expects ObjectId)
    const bookingIdToSave = mongoose.Types.ObjectId.isValid(bookingId)
      ? mongoose.Types.ObjectId(bookingId)
      : bookingId;

    const msg = await Message.create({
      bookingId: bookingIdToSave,
      sender: req.user.id,
      senderRole: req.user.role || 'user',
      text,
      createdAt: new Date()
    });

    // emit to socket room (if io present)
    const io = req.app.get('io');
    if (io) {
      io.to(`booking_${bookingId}`).emit('newMessage', msg);
    }

    return res.status(201).json(msg);
  } catch (err) {
    console.error('sendMessage error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin: list active chats (confirmed bookings) with last message & unread counts.
 */
async function adminActiveChats(req, res) {
  try {
    console.log('adminActiveChats called by user:', req.user?.id, 'role:', req.user?.role);

    // require admin role (case-insensitive)
    if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
      console.log('Access denied - user is not admin or not authenticated', req.user);
      return res.status(403).json({ message: 'Not authorized' });
    }

    // find confirmed bookings (you can expand statuses if needed)
    const confirmedBookings = await Booking.find({ status: 'confirmed' })
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city')
      .sort({ createdAt: -1 })
      .lean();

    // If no bookings, return early
    if (!confirmedBookings || confirmedBookings.length === 0) {
      return res.json([]);
    }

    // Prepare booking id lists (ObjectId and string)
    const bookingObjectIds = confirmedBookings.map(b => b._id).filter(Boolean);
    const bookingIdStrings = bookingObjectIds.map(id => String(id));

    // Query messages that match either ObjectId or string bookingId
    const messages = await Message.find({
      $or: [
        { bookingId: { $in: bookingObjectIds } },
        { bookingId: { $in: bookingIdStrings } }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group messages by bookingId (normalized to string key)
    const messagesByBooking = {};
    messages.forEach(msg => {
      const key = String(msg.bookingId);
      if (!messagesByBooking[key]) messagesByBooking[key] = [];
      messagesByBooking[key].push(msg);
    });

    // Build the results
    const results = confirmedBookings.map(booking => {
      const bid = String(booking._id);
      const bookingMessages = messagesByBooking[bid] || [];
      const lastMessage = bookingMessages[0] || null; // most recent because sorted desc above

      // Count unread messages for admin:
      // - consider message unread for admin when sender is NOT admin and admin's id is not in readBy
      const unreadForAdmin = bookingMessages.reduce((count, msg) => {
        const senderRole = String(msg.senderRole || '').toLowerCase();
        const readBy = Array.isArray(msg.readBy) ? msg.readBy.map(String) : [];
        const adminHasRead = readBy.includes(String(req.user.id));
        if (senderRole !== 'admin' && !adminHasRead) return count + 1;
        return count;
      }, 0);

      return {
        bookingId: bid,
        booking,
        lastMessage: lastMessage ? (lastMessage.text ?? null) : null,
        lastCreatedAt: lastMessage?.createdAt ?? booking.createdAt,
        unreadForAdmin
      };
    });

    console.log('Admin active chats result count:', results.length);
    return res.json(results);
  } catch (err) {
    console.error('adminActiveChats error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Mark messages read for the current user in a booking
 */
async function markRead(req, res) {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    if (!bookingId) return res.status(400).json({ message: 'bookingId required' });
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    // Build booking filter resilient to ObjectId/string mismatch
    const orFilters = [];
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      orFilters.push({ bookingId: mongoose.Types.ObjectId(bookingId) });
    }
    orFilters.push({ bookingId });

    await Message.updateMany(
      { $and: [{ $or: orFilters }, { readBy: { $ne: String(userId) } }] },
      { $addToSet: { readBy: String(userId) } }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('markRead error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Debug/test endpoint for admin chats
 */
async function testAdminChats(req, res) {
  try {
    console.log('Test admin chats endpoint called by user:', req.user?.id);
    const confirmedBookings = await Booking.find({ status: 'confirmed' }).lean();
    const allBookings = await Booking.find().lean();

    res.json({
      message: 'Test endpoint working',
      confirmedBookings: confirmedBookings.length,
      allBookings: allBookings.length,
      confirmedBookingIds: confirmedBookings.map(b => String(b._id)),
      allBookingStatuses: allBookings.map(b => ({ id: String(b._id), status: b.status }))
    });
  } catch (err) {
    console.error('Test admin chats error', err);
    return res.status(500).json({ message: 'Test error', error: err.message });
  }
}

module.exports = {
  getMessages,
  sendMessage,
  adminActiveChats,
  markRead,
  testAdminChats
};
