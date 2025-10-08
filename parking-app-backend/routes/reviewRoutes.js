const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:parkingLotId', authMiddleware, reviewController.addReview);
router.get('/:parkingLotId', reviewController.getReviewsByParkingLot);

module.exports = router;
