const mongoose = require("mongoose");
const { canAcessChat } = require("../utils/chatAuth");
const Message = require("../models/Message");
const Booking = require("../models/Booking");

/**
 * GET messages for a booking (User & Manager only)
 */
const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return res.status(400).json({ message: "bookingId required" });

    const { ok, booking, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || "Access denied" });

    const query = mongoose.Types.ObjectId.isValid(bookingId)
      ? { bookingId: mongoose.Types.ObjectId(bookingId) }
      : { bookingId };

    const messages = await Message.find(query).sort({ createdAt: 1 }).lean();

    return res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * SEND message
 */
const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    if (!bookingId) return res.status(400).json({ message: "bookingId required" });
    if (!text?.trim()) return res.status(400).json({ message: "Message text required" });

    const { ok, reason } = await canAcessChat(req.user, bookingId);
    if (!ok) return res.status(403).json({ message: reason || "Access denied" });

    const msg = await Message.create({
      bookingId,
      sender: req.user.id,
      senderRole: req.user.role,
      text,
      readBy: [req.user.id], // sender always sees message as read
      createdAt: new Date(),
    });

    // socket broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`booking_${bookingId}`).emit("newMessage", msg);
    }

    return res.status(201).json(msg);
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ACTIVE CHATS list for MANAGER dashboard
 */
const managerActiveChats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Managers only see confirmed bookings for their own parking lots
    const confirmedBookings = await Booking.find({
      status: "confirmed",
      manager: req.user.id, // ownership enforced here
    })
      .populate("user", "name email")
      .populate("parkingLot", "name location city")
      .lean();

    if (!confirmedBookings.length) {
      return res.json([]);
    }

    const bookingIds = confirmedBookings.map((b) => b._id.toString());

    const messages = await Message.find({
      bookingId: { $in: bookingIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group messages by booking
    const grouped = {};
    messages.forEach((msg) => {
      const key = String(msg.bookingId);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(msg);
    });

    const results = confirmedBookings.map((booking) => {
      const id = booking._id.toString();
      const msgs = grouped[id] || [];
      const lastMessage = msgs[0] || null;

      const unread = msgs.reduce((count, msg) => {
        const readBy = Array.isArray(msg.readBy) ? msg.readBy.map(String) : [];
        return readBy.includes(String(req.user.id)) || msg.senderRole === "manager"
          ? count
          : count + 1;
      }, 0);

      return {
        bookingId: id,
        booking,
        lastMessage: lastMessage?.text || null,
        lastCreatedAt: lastMessage?.createdAt ?? booking.createdAt,
        unread,
      };
    });

    return res.json(results);
  } catch (err) {
    console.error("managerActiveChats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark messages read for manager/user
 */
const markRead = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    if (!bookingId) return res.status(400).json({ message: "bookingId required" });
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    await Message.updateMany(
      { bookingId, readBy: { $ne: String(userId) } },
      { $addToSet: { readBy: String(userId) } }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`booking_${bookingId}`).emit("readUpdate", { bookingId, userId });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("markRead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  managerActiveChats,
  markRead,
};
