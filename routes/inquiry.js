var express = require('express');
var router = express.Router();
const authController = require('./../controllers/inquiry.controller');
const authMiddleware = require('../middleware/auth.middleware')


router.get('/getAllInquiryDetails', authMiddleware, authController.getInquiryDetails);
router.post('/saveInquiryDetails', authMiddleware, authController.saveInquiryDetails);
router.delete('/deleteInquiryDetail', authMiddleware, authController.deleteInquiryDetail);

module.exports = router;