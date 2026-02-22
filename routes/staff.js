const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all staff for the authenticated user
router.get('/getStaffDetails', authMiddleware, staffController.getStaffDetails);

// Create a new staff record
router.post('/saveStaffDetails', authMiddleware, staffController.saveStaffDetails);

// Delete a staff record
router.delete('/deleteStaffDetail', authMiddleware, staffController.deleteStaffDetail);

module.exports = router;
