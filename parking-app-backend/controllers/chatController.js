const { canAcessChat } = require('../utils/chatAuth');
const Message = require('../models/Message');
const Booking = require('../models/Booking');

const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { ok, booking, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || 'Access denied' });

    const messages = await Message.find({ bookingId }).sort('createdAt');
    return res.json(messages);
  } catch (err) {
    console.error('getMessages error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text required' });

    const { ok, booking, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || 'Access denied' });

    const msg = await Message.create({
      bookingId,
      sender: req.user.id,
      senderRole: req.user.role || 'user',
      text,
    });

    const io = req.app.get('io');
    if (io) io.to(`booking_${bookingId}`).emit('newMessage', msg);

    return res.status(201).json(msg);
  } catch (err) {
    console.error('sendMessage error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// admin: list active chats with latest message + unread counts
async function adminActiveChats(req, res) {
  try {
    console.log('adminActiveChats called by user:', req.user.id, 'role:', req.user.role);
    
    // only admin
    if (req.user.role !== 'admin') {
      console.log('Access denied - user is not admin');
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all confirmed bookings first
    const confirmedBookings = await Booking.find({ status: 'confirmed' })
      .populate('user', 'name email')
      .populate('parkingLot', 'name location city')
      .sort({ createdAt: -1 });

    console.log('Found confirmed bookings:', confirmedBookings.length);
    console.log('Confirmed booking details:', confirmedBookings.map(b => ({
      id: b._id,
      user: b.user?.name || b.user?.email,
      parkingLot: b.parkingLot?.name,
      status: b.status
    })));

    // Get messages for these bookings
    const bookingIds = confirmedBookings.map(b => b._id);
    const messages = await Message.find({ bookingId: { $in: bookingIds } })
      .sort({ createdAt: -1 });

    console.log('Found messages:', messages.length);

    // Group messages by bookingId
    const messagesByBooking = {};
    messages.forEach(msg => {
      if (!messagesByBooking[msg.bookingId]) {
        messagesByBooking[msg.bookingId] = [];
      }
      messagesByBooking[msg.bookingId].push(msg);
    });

    // Build results
    const results = confirmedBookings.map(booking => {
      const bookingMessages = messagesByBooking[booking._id] || [];
      const lastMessage = bookingMessages[0]; // Most recent message
      
      // Count unread messages for admin
      const unreadForAdmin = bookingMessages.filter(msg => 
        msg.senderRole !== 'admin' && 
        !msg.readBy.includes(req.user.id)
      ).length;

      return {
        bookingId: booking._id,
        booking,
        lastMessage: lastMessage?.text || 'No messages yet',
        lastCreatedAt: lastMessage?.createdAt || booking.createdAt,
        unreadForAdmin: unreadForAdmin
      };
    });

    console.log('Admin active chats result:', results.length, 'chats prepared');
    console.log('Results:', results.map(r => ({
      bookingId: r.bookingId,
      userName: r.booking.user?.name || r.booking.user?.email,
      lastMessage: r.lastMessage
    })));

    res.json(results);
  } catch (err) {
    console.error('adminActiveChats error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// mark messages read for current user
async function markRead(req, res) {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    await Message.updateMany(
      { bookingId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('markRead error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Test endpoint to check if admin chat system is working
async function testAdminChats(req, res) {
  try {
    console.log('Test admin chats endpoint called');
    const confirmedBookings = await Booking.find({ status: 'confirmed' });
    const allBookings = await Booking.find();
    
    res.json({
      message: 'Test endpoint working',
      confirmedBookings: confirmedBookings.length,
      allBookings: allBookings.length,
      confirmedBookingIds: confirmedBookings.map(b => b._id),
      allBookingStatuses: allBookings.map(b => ({ id: b._id, status: b.status }))
    });
  } catch (err) {
    console.error('Test admin chats error', err);
    res.status(500).json({ message: 'Test error', error: err.message });
  }
}

module.exports = {
  getMessages,
  sendMessage,
  adminActiveChats,
  markRead,
  testAdminChats
};

