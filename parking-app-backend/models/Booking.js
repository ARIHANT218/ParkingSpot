const express = require("express");

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  parkingLot: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingLot", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },

  
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

});



module.exports = mongoose.model("Booking", bookingSchema);
