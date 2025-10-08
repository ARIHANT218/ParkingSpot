const Review = require('../models/Review');
const ParkingLot = require('../models/ParkingLot');

exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = new Review({
            user: req.user.userId,
            parkingLot: req.params.parkingLotId,
            rating,
            comment,
        });
        await review.save();
        await ParkingLot.findByIdAndUpdate(req.params.parkingLotId, { $push: { reviews: review._id } });
        res.status(201).json(review);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getReviewsByParkingLot = async (req, res) => {
    try {
        const reviews = await Review.find({ parkingLot: req.params.parkingLotId }).populate('user', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
