const express = require('express');
const router = express.Router();
const miscMasterController = require('../controllers/miscMaster.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get MiscMaster by headerTypes array
router.post('/getMiscMaster', authMiddleware, miscMasterController.getMiscMaster);

// Fetch a specific MiscMaster record by uniqueId
router.post('/fetchMiscMasterByUniqueId', authMiddleware, miscMasterController.fetchMiscMasterByUniqueId);

// Update a MiscMaster record by uniqueId
router.put('/updateMiscMasterByUniqueId', authMiddleware, miscMasterController.updateMiscMasterByUniqueId);

// Create a new MiscMaster record
router.post('/saveMiscMaster', authMiddleware, miscMasterController.saveMiscMaster);

// Delete a MiscMaster record
router.delete('/deleteMiscMaster', authMiddleware, miscMasterController.deleteMiscMaster);

module.exports = router;
