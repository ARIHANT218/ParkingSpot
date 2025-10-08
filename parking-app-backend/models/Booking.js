const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	parkingLot: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ParkingLot",
		required: true,
	},
	startTime: {
		type: Date,
		required: true,
	},
	endTime: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		enum: ["active", "cancelled", "completed"],
		default: "active",
	},
	qrCode: {
		type: String,
	},
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
