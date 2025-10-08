const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', parkingController.getAllParkingLots);
router.get('/:id', parkingController.getParkingLotById);
router.post('/', authMiddleware, parkingController.createParkingLot); // admin only
router.patch('/:id', authMiddleware, parkingController.updateParkingLot); // admin only
router.delete('/:id', authMiddleware, parkingController.deleteParkingLot); // admin only

module.exports = router;
