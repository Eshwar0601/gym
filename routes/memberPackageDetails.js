const express = require('express');
const router = express.Router();
const packageController = require('../controllers/memberPackageDetails.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all packages for the authenticated user
router.get('/getMemberPackagePackageDetails', authMiddleware, packageController.getMemberPackagePackageDetails);

// Fetch a specific package by uniqueId
router.post('/fetchMemberPackageByUniqueId', authMiddleware, packageController.fetchMemberPackageByUniqueId);

// Update a package by uniqueId
router.put('/updateMemberPackageByUniqueId', authMiddleware, packageController.updateMemberPackageByUniqueId);

// Create a new package
router.post('/saveMemberPackageDetails', authMiddleware, packageController.saveMemberPackageDetails);

// Delete a package
router.delete('/deleteMemberPackageDetail', authMiddleware, packageController.deleteMemberPackageDetail);

module.exports = router;
