// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['user', 'admin'], required: true },
  text: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // who has read this message
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.models && mongoose.models.Message
  ? mongoose.models.Message
  : mongoose.model('Message', messageSchema);


