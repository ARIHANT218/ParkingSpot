const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const ALLOWED_STATUSES = new Set(['confirmed']);

async function canAcessChat(user, bookingId) {
  try {
    
    if (!user || !user.id) {
      return { ok: false, reason: 'Unauthenticated user' };
    }
    if (!bookingId) {
      return { ok: false, reason: 'bookingId required' };
    }

   
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return { ok: false, reason: 'Booking not found' };
    }

   
    if (!ALLOWED_STATUSES.has(String(booking.status))) {
      return {
        ok: false,
        reason: 'Chat access is not allowed for this booking status'
      };
    }

    
    const userRole = String(user.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';
    const bookingUserId = booking.user?._id ?? booking.user; 
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
