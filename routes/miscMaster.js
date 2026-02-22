const express = require('express');
const router = express.Router();
const miscMasterController = require('../controllers/miscMaster.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get MiscMaster by headerTypes array
router.post('/getMiscMaster', authMiddleware, miscMasterController.getMiscMaster);

// Create a new MiscMaster record
router.post('/saveMiscMaster', authMiddleware, miscMasterController.saveMiscMaster);

// Delete a MiscMaster record
router.delete('/deleteMiscMaster', authMiddleware, miscMasterController.deleteMiscMaster);

module.exports = router;
