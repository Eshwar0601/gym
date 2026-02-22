const express = require('express');
const router = express.Router();
const planController = require('../controllers/plan.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all plans for the authenticated user
router.get('/getPlanDetails', authMiddleware, planController.getPlanDetails);

// Create a new plan
router.post('/savePlanDetails', authMiddleware, planController.savePlanDetails);

// Delete a plan
router.delete('/deletePlanDetail', authMiddleware, planController.deletePlanDetail);

module.exports = router;
