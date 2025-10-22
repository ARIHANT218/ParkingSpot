const { canAcessChat } = require('../utils/chatAuth');
const Message = require('../models/Message');

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
    // only admin
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

    // Aggregate per booking: latest message + unread count for admin
    const chats = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$bookingId',
          lastMessage: { $first: '$text' },
          lastSender: { $first: '$sender' },
          lastCreatedAt: { $first: '$createdAt' },
          unreadForAdmin: {
            $sum: {
              $cond: [
                { $and: [ { $ne: ['$senderRole', 'admin'] }, { $not: { $in: [ req.user.id ? req.user.id : null, '$readBy' ] } } ] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastCreatedAt: -1 } }
    ]);

    // enrich with booking and user info
    const results = [];
    for (const c of chats) {
      const booking = await Booking.findById(c._id).populate('user', 'name email');
      if (!booking) continue;
      results.push({
        bookingId: c._id,
        booking,
        lastMessage: c.lastMessage,
        lastCreatedAt: c.lastCreatedAt,
        unreadForAdmin: c.unreadForAdmin || 0
      });
    }

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

module.exports = {
  getMessages,
  sendMessage,
  adminActiveChats,
  markRead
};

