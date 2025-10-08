
const mongoose = require("mongoose");

const parkingLotSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	location: {
		type: {
			lat: Number,
			lng: Number,
		},
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	amenities: [String],
	pricePerHour: {
		type: Number,
		required: true,
	},
	totalSpots: {
		type: Number,
		required: true,
	},
	availableSpots: {
		type: Number,
		required: true,
	},
	ratings: [{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		rating: Number,
		comment: String,
	}],
	reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
}, { timestamps: true });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);