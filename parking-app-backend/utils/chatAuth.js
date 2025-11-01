// utils/chatAuth.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const ALLOWED_STATUSES = new Set(['confirmed']);

async function canAcessChat(user, bookingId) {
  try {
    // Basic validation
    if (!user || !user.id) {
      return { ok: false, reason: 'Unauthenticated user' };
    }
    if (!bookingId) {
      return { ok: false, reason: 'bookingId required' };
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return { ok: false, reason: 'Booking not found' };
    }

    // Status allowed?
    if (!ALLOWED_STATUSES.has(String(booking.status))) {
      return {
        ok: false,
        reason: 'Chat access is not allowed for this booking status'
      };
    }

    // Role or owner check (handle ObjectId/string on booking.user)
    const userRole = String(user.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';
    const bookingUserId = booking.user?._id ?? booking.user; // support populated or raw id
    const isOwner = String(bookingUserId) === String(user.id);

    if (isAdmin || isOwner) {
      return { ok: true, booking };
    }

    return { ok: false, reason: 'Not authorised for this booking' };
  } catch (err) {
    console.error('canAcessChat error:', err);
    return { ok: false, reason: 'Server error' };
  }
}

module.exports = { canAcessChat };
