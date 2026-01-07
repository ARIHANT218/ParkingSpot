const mongoose = require('mongoose');
const { canAcessChat } = require('../utils/chatAuth');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');


exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const { ok, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || 'Access denied' });

    const messages = await Message.find({ bookingId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const { ok, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || 'Access denied' });

    const message = await Message.create({
      bookingId,
      sender: req.user.id,
      senderRole: req.user.role || 'user',
      text,
    });

    // Send to socket room
    const io = req.app.get('io');
    if (io) {
      io.to(`booking_${bookingId}`).emit('newMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminActiveChats = async (req, res) => {
  try {
    if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const ownerId = req.user.id || req.user._id;

    // Find parking lots owned by admin
    const ownedLots = await ParkingLot.find({ owner: ownerId })
      .select('_id')
      .lean();

    const lotIds = ownedLots.map(lot => lot._id);

    const bookings = await Booking.find({
      status: 'confirmed',
      parkingLot: { $in: lotIds }
    })
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city')
      .sort({ createdAt: -1 })
      .lean();

    if (!bookings.length) return res.json([]);

    const bookingIds = bookings.map(b => b._id);

    // Get messages for these bookings
    const messages = await Message.find({ bookingId: { $in: bookingIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Group messages by bookingId
    const messagesByBooking = {};
    for (const msg of messages) {
      const key = String(msg.bookingId);
      if (!messagesByBooking[key]) messagesByBooking[key] = [];
      messagesByBooking[key].push(msg);
    }

    const results = bookings.map(booking => {
      const bid = String(booking._id);
      const bookingMessages = messagesByBooking[bid] || [];
      const lastMessage = bookingMessages[0] || null;

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
        lastMessage: lastMessage?.text || null,
        lastCreatedAt: lastMessage?.createdAt || booking.createdAt,
        unreadForAdmin
      };
    });

    res.json(results);
  } catch (error) {
    console.error('adminActiveChats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.markRead = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    await Message.updateMany(
      { bookingId, readBy: { $ne: String(userId) } },
      { $addToSet: { readBy: String(userId) } }
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('markRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
