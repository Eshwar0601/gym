const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for Excel files
});

// Get all members for the authenticated user
router.get('/getMemberDetails', authMiddleware, memberController.getMemberDetails);

// Fetch a specific member by uniqueId
router.post('/fetchMemberByUniqueId', authMiddleware, memberController.fetchMemberByUniqueId);

router.post('/uploadMemberData', authMiddleware, upload.single('file'), memberController.uploadMemberData);

router.post('/uploadUserImage', authMiddleware, upload.single('file'), memberController.uploadUserImage);

router.post('/deleteUserImage', authMiddleware, memberController.deleteUserImage);

// Update a member by uniqueId
router.put('/updateMemberByUniqueId', authMiddleware, memberController.updateMemberByUniqueId);

// Create a new member
router.post('/saveMemberDetails', authMiddleware, memberController.saveMemberDetails);

// Delete a member
router.delete('/deleteMemberDetail', authMiddleware, memberController.deleteMemberDetail);

module.exports = router;
