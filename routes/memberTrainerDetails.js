const express = require('express');
const router = express.Router();
const memberTrainerDetails = require('../controllers/memberTrainerDetails.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all packages for the authenticated user
router.get('/getMemberTrainerDetails', authMiddleware, memberTrainerDetails.getMemberTrainerDetails);

router.put('/updateMemberTrainerByUniqueId', authMiddleware, memberTrainerDetails.updateMemberTrainerByUniqueId);

router.post('/saveMemberTrainerDetils', authMiddleware, memberTrainerDetails.saveMemberTrainerDetails);

router.delete('/deleteMemberTrainerDetils', authMiddleware, memberTrainerDetails.deleteMemberTrainerDetail);

module.exports = router;