const PlanDetail = require('../models/plan.model');
const jwt = require('jsonwebtoken');

exports.getPlanDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const listOfPlans = await PlanDetail.find({ createdUser: decoded.id }).exec();
    return res.status(200).json({
      data: listOfPlans
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.savePlanDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { planName, fee, isActive } = req.body;

  if (checkIfValueIsEmpty(planName)) {
    return res.status(400).json({
      message: "planName cannot be empty"
    });
  }

  if (checkIfValueIsEmpty(fee)) {
    return res.status(400).json({
      message: "fee cannot be empty"
    });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const newPlan = await PlanDetail.create({
      planName,
      fee,
      isActive: isActive !== undefined ? isActive : true,
      createdUser: decoded.id,
      createdDate: new Date()
    });

    return res.status(200).json({
      message: "Plan saved successfully",
      data: newPlan
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.deletePlanDetail = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { planId } = req.body;

  if (checkIfValueIsEmpty(planId)) {
    return res.status(400).json({
      message: "planId cannot be empty"
    });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const deleted = await PlanDetail.findOneAndDelete({ _id: planId, createdUser: decoded.id }).exec();
    if (!deleted) {
      return res.status(404).json({ message: "Plan not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
