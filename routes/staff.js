const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }
});

// Get all staff for the authenticated user
router.get('/getStaffDetails', authMiddleware, staffController.getStaffDetails);

// Fetch a specific staff member by uniqueId
router.post('/fetchStaffByUniqueId', authMiddleware, staffController.fetchStaffByUniqueId);

// Update a staff member by uniqueId
router.put('/updateStaffByUniqueId', authMiddleware, staffController.updateStaffByUniqueId);

// Create a new staff record
router.post('/saveStaffDetails', authMiddleware, staffController.saveStaffDetails);

// Delete a staff record
router.delete('/deleteStaffDetail', authMiddleware, staffController.deleteStaffDetail);

router.post('/uploadStaffImage', authMiddleware, upload.single('file'), staffController.uploadStaffImage);
router.post('/deleteStaffImage', authMiddleware, staffController.deleteStaffImage);

module.exports = router;
