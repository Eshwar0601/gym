const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all members for the authenticated user
router.get('/getMemberDetails', authMiddleware, memberController.getMemberDetails);

// Create a new member
router.post('/saveMemberDetails', authMiddleware, memberController.saveMemberDetails);

// Delete a member
router.delete('/deleteMemberDetail', authMiddleware, memberController.deleteMemberDetail);

module.exports = router;
