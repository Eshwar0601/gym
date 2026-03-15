const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all packages for the authenticated user
router.get('/getPackageDetails', authMiddleware, packageController.getPackageDetails);

// Create a new package
router.post('/savePackageDetails', authMiddleware, packageController.savePackageDetails);

// Delete a package
router.delete('/deletePackageDetail', authMiddleware, packageController.deletePackageDetail);

module.exports = router;
