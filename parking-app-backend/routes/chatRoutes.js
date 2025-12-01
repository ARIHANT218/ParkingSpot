const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getMessages,
  sendMessage,
  markRead,
  managerActiveChats, // 👈 renamed from adminActiveChats
} = require("../controllers/chatController");

// sanity checks (optional but helpful in dev)
if (typeof protect !== "function") {
  throw new Error(
    "protect middleware is not a function — check ../middleware/authMiddleware.js export"
  );
}
if (
  typeof getMessages !== "function" ||
  typeof sendMessage !== "function" ||
  typeof managerActiveChats !== "function" ||
  typeof markRead !== "function"
) {
  throw new Error(
    "chatController exports are invalid — check ../controllers/chatController.js"
  );
}

/**
 * Manager active chats list
 * GET /api/chats/manager/active
 */
router.get("/manager/active", protect, managerActiveChats);

/**
 * Mark messages as read
 * PATCH /api/chats/:bookingId/read
 */
router.patch("/:bookingId/read", protect, markRead);

/**
 * Get messages for a booking
 * GET /api/chats/:bookingId
 */
router.get("/:bookingId", protect, getMessages);

/**
 * Send message in a booking chat
 * POST /api/chats/:bookingId
 */
router.post("/:bookingId", protect, sendMessage);

module.exports = router;
