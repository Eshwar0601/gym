const trainerModel = require('../models/memberTrainerDetais.model');
const jwt = require('jsonwebtoken');

const mapMemberTrainerToResponse = (savedTrainer) => ({
  _id: savedTrainer._id,
  memberNo: savedTrainer.memberNo,
  memberID: savedTrainer.memberID || null,
  duration: savedTrainer.duration || null,
  startDate: savedTrainer.startDate || null,
  endDate: savedTrainer.endDate || null,
  remarks: savedTrainer.remarks || '',
  amount: savedTrainer.amount || '',
  ptName: savedTrainer.ptName || '',
  trainer: savedTrainer.trainer || null,
  createdUser: savedTrainer.createdUser,
  createdDate: savedTrainer.createdDate
});

exports.getMemberTrainerDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const listOfTrainers = await trainerModel.find({ createdUser: decoded.id }).populate('trainer').exec();
    const trainersWithDefaults = listOfTrainers.map(mapMemberTrainerToResponse);
    return res.status(200).json({
      data: trainersWithDefaults
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

exports.updateMemberTrainerByUniqueId = async (req, res) => {
  const authHeader = req.headers.authorization;
  const {
    uniqueId,
    memberNo,
    memberID,
    duration,
    startDate,
    endDate,
    remarks,
    amount,
    ptName
  } = req.body;

  if (checkIfValueIsEmpty(uniqueId)) {
    return res.status(400).json({ message: "uniqueId cannot be empty" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const updateData = {};
    if (memberNo !== undefined) updateData.memberNo = memberNo;
    if (memberID !== undefined) updateData.memberID = memberID;
    if (duration !== undefined) updateData.duration = duration;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (amount !== undefined) updateData.amount = amount;
    if (ptName !== undefined) updateData.ptName = ptName;
    if (req.body.trainer !== undefined) updateData.trainer = req.body.trainer;

    const updatedPackage = await trainerModel.findOneAndUpdate(
      { _id: uniqueId, createdUser: decoded.id },
      updateData,
      { new: true }
    ).exec();

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      data: mapMemberTrainerToResponse(updatedPackage)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.saveMemberTrainerDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  // Set defaults for optional fields to ensure they're always present
  const { 
      memberNo,
      memberID = null,
      duration = null,
      startDate = null,
      endDate = null,
      remarks = '',
      amount = '',
      ptName = ''
    } = req.body;

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const newPackage = await trainerModel.create({
      memberNo,
      memberID,
      trainer: req.body.trainer || null,
      duration,
      startDate,
      endDate,
      remarks,
      amount,
      ptName,
      createdUser: decoded.id,
      createdDate: new Date()
    });

    return res.status(200).json({
      message: "Package saved successfully",
      data: newPackage
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.deleteMemberTrainerDetail = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { memberTrainerId } = req.query;

  if (checkIfValueIsEmpty(memberTrainerId)) {
    return res.status(400).json({
      message: "memberTrainerId cannot be empty"
    });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const deleted = await trainerModel.findOneAndDelete({ _id: memberTrainerId, createdUser: decoded.id }).exec();
    if (!deleted) {
      return res.status(404).json({ message: "Package not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
