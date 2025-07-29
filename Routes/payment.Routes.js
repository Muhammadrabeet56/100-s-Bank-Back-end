const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');

// Initiate payment endpoint
router.post('/initiate', paymentController.initiatePayment);

// Payment callback/webhook endpoint
router.post('/callback', paymentController.paymentCallback);

module.exports = router;