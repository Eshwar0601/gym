const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');


router.post('/savePaymentDetails', authMiddleware, paymentController.savePaymentDetails);

module.exports = router;
