const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema({
  name: String,
  location: String,
  city: String,
  latitude: Number,
  longitude: Number,
  pricePerHour: Number,
  capacity: Number,
  availableSlots: Number,
  amenities: [String],


  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("ParkingLot", parkingLotSchema);



