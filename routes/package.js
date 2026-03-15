const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all packages for the authenticated user
router.get('/getPackageDetails', authMiddleware, packageController.getPackageDetails);

// Fetch a specific package by uniqueId
router.post('/fetchPackageByUniqueId', authMiddleware, packageController.fetchPackageByUniqueId);

// Update a package by uniqueId
router.put('/updatePackageByUniqueId', authMiddleware, packageController.updatePackageByUniqueId);

// Create a new package
router.post('/savePackageDetails', authMiddleware, packageController.savePackageDetails);

// Delete a package
router.delete('/deletePackageDetail', authMiddleware, packageController.deletePackageDetail);

module.exports = router;
