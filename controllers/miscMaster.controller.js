const MiscMaster = require('../models/miscMaster.model');
const jwt = require('jsonwebtoken');

const mapMiscMasterToResponse = (misc) => ({
  _id: misc._id,
  headerType: misc.headerType,
  keyValuePairs: misc.keyValuePairs || [],
  createdUser: misc.createdUser,
  createdDate: misc.createdDate
});

exports.getMiscMaster = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { headerTypes } = req.body;

  if (!Array.isArray(headerTypes) || headerTypes.length === 0) {
    return res.status(400).json({ message: "headerTypes must be a non-empty array" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const miscMasters = await MiscMaster.find({
      createdUser: decoded.id,
      headerType: { $in: headerTypes }
    }).exec();

    // Map to ensure all fields are present with defaults
    const miscWithDefaults = miscMasters.map(mapMiscMasterToResponse);

    return res.status(200).json({
      data: miscWithDefaults
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.fetchMiscMasterByUniqueId = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { uniqueId } = req.body;

  if (checkIfValueIsEmpty(uniqueId)) {
    return res.status(400).json({ message: "uniqueId cannot be empty" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const miscMaster = await MiscMaster.findOne({ _id: uniqueId, createdUser: decoded.id }).exec();
    if (!miscMaster) {
      return res.status(404).json({ message: "MiscMaster not found" });
    }

    return res.status(200).json({
      data: mapMiscMasterToResponse(miscMaster)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.updateMiscMasterByUniqueId = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { uniqueId, headerType, keyValuePairs } = req.body;

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
    if (headerType !== undefined) updateData.headerType = headerType;
    if (keyValuePairs !== undefined) updateData.keyValuePairs = keyValuePairs;

    const updatedMiscMaster = await MiscMaster.findOneAndUpdate(
      { _id: uniqueId, createdUser: decoded.id },
      updateData,
      { new: true }
    ).exec();

    if (!updatedMiscMaster) {
      return res.status(404).json({ message: "MiscMaster not found" });
    }

    return res.status(200).json({
      data: mapMiscMasterToResponse(updatedMiscMaster)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.saveMiscMaster = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { headerType, keyValuePairs } = req.body;

  if (checkIfValueIsEmpty(headerType)) {
    return res.status(400).json({ message: "headerType cannot be empty" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const newMiscMaster = await MiscMaster.create({
      headerType,
      keyValuePairs: keyValuePairs || [],
      createdUser: decoded.id,
      createdDate: new Date()
    });

    return res.status(200).json({
      message: "MiscMaster saved successfully",
      data: newMiscMaster
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.deleteMiscMaster = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { miscMasterId } = req.body;

  if (checkIfValueIsEmpty(miscMasterId)) {
    return res.status(400).json({ message: "miscMasterId cannot be empty" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const deleted = await MiscMaster.findOneAndDelete({
      _id: miscMasterId,
      createdUser: decoded.id
    }).exec();

    if (!deleted) {
      return res.status(404).json({ message: "MiscMaster not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "MiscMaster deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
