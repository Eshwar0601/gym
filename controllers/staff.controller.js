const StaffDetail = require('../models/staff.model');
const jwt = require('jsonwebtoken');

const mapStaffToResponse = (staff) => ({
  _id: staff._id,
  staffName: staff.staffName,
  email: staff.email,
  phoneNumber: staff.phoneNumber,
  expertise: staff.expertise || '',
  staffRating: staff.staffRating || null,
  createdUser: staff.createdUser,
  createdDate: staff.createdDate
});

exports.getStaffDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const listOfStaff = await StaffDetail.find({ createdUser: decoded.id }).exec();
    const staffWithDefaults = listOfStaff.map(mapStaffToResponse);
    return res.status(200).json({
      data: staffWithDefaults
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.fetchStaffByUniqueId = async (req, res) => {
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

    const staff = await StaffDetail.findOne({
      createdUser: decoded.id,
      $or: [{ _id: uniqueId }, { email: uniqueId }]
    }).exec();

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({
      data: mapStaffToResponse(staff)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateStaffByUniqueId = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { uniqueId, staffName, email, phoneNumber, expertise, staffRating } = req.body;

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
    if (staffName !== undefined) updateData.staffName = staffName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (staffRating !== undefined) updateData.staffRating = staffRating;

    const updatedStaff = await StaffDetail.findOneAndUpdate(
      { createdUser: decoded.id, $or: [{ _id: uniqueId }, { email: uniqueId }] },
      updateData,
      { new: true }
    ).exec();

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({
      data: mapStaffToResponse(updatedStaff)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.saveStaffDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  // Set defaults for optional fields to ensure they're always present
  const { staffName, email, phoneNumber, expertise = '', staffRating = null } = req.body;

  if (checkIfValueIsEmpty(staffName)) {
    return res.status(400).json({ message: "staffName cannot be empty" });
  }

  if (checkIfValueIsEmpty(email)) {
    return res.status(400).json({ message: "email cannot be empty" });
  }

  if (checkIfValueIsEmpty(phoneNumber)) {
    return res.status(400).json({ message: "phoneNumber cannot be empty" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const isStaffExists = await StaffDetail.findOne({ email: email });
    if (isStaffExists) {
      return res.status(400).json({ message: "Staff with this email already exists" });
    }

    await StaffDetail.create({
      staffName,
      email,
      phoneNumber,
      expertise,
      staffRating,
      createdUser: decoded.id,
      createdDate: new Date()
    });

    return res.status(200).json({ message: "Staff saved successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteStaffDetail = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { staffId } = req.body;

  if (checkIfValueIsEmpty(staffId)) {
    return res.status(400).json({ message: "staffId cannot be empty" });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const deleted = await StaffDetail.findOneAndDelete({ _id: staffId, createdUser: decoded.id }).exec();
    if (!deleted) {
      return res.status(404).json({ message: "Staff not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
