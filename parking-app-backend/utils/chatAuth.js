const Booking = require('../models/Booking');

const Allowed_Statuses = ['confirmed'];

async function canAcessChat(userId, bookingId) {
  const booking = await Booking.findById(bookingId);
  if(!booking){
    return {ok: false, message: 'Booking not found'};
  }
   if(!Allowed_Statuses.includes(booking.status)){
    return {ok: false, message: 'Chat access is not allowed for this booking status'};
  }
  if(user.role === 'admin' || String(booking.user) === String(user.id) ){
    return { ok: true, booking };
  }
   return { ok: false, reason: 'Not authorised for this booking' };
}

module.exports = { canAcessChat };
