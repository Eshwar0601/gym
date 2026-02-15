const MemberDetail = require('../models/member.model');
const jwt = require('jsonwebtoken');

exports.getMemberDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');
    
    const listOfMembers = await MemberDetail.find({ createdUser: decoded.id }).exec();
    return res.status(200).json({
      data: listOfMembers
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.saveMemberDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  const {
    memberNo,
    fullName,
    email,
    mobileNumber,
    dateOfBirth,
    gender,
    inquiryDate,
    occupation,
    packageType,
    dueDate,
    remarks,
    joinDate,
    joinWeight,
    joinHeight,
    age,
    period,
    personalTrainer,
    ptAmount,
    maritalStatus,
    address,
    shiftType,
    time,
    paidDate
  } = req.body;

  // Validate required fields
  if (checkIfValueIsEmpty(memberNo)) {
    return res.status(400).json({
      message: "memberNo cannot be empty"
    });
  }

  if (checkIfValueIsEmpty(fullName)) {
    return res.status(400).json({
      message: "fullName cannot be empty"
    });
  }

  if (checkIfValueIsEmpty(email)) {
    return res.status(400).json({
      message: "email cannot be empty"
    });
  }

  if (checkIfValueIsEmpty(mobileNumber)) {
    return res.status(400).json({
      message: "mobileNumber cannot be empty"
    });
  }

  if (checkIfValueIsEmpty(dateOfBirth)) {
    return res.status(400).json({
      message: "dateOfBirth cannot be empty"
    });
  }

  if (checkIfValueIsEmpty(gender)) {
    return res.status(400).json({
      message: "gender cannot be empty"
    });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');
    console.log("token ", decoded);

    // Check if member already exists
    const isMemberExists = await MemberDetail.findOne({ email: email });
    if (isMemberExists) {
      return res.status(400).json({ message: "Member with this email already exists" });
    }

    console.log("created User", decoded.id);

    const newMember = await MemberDetail.create({
      memberNo,
      fullName,
      email,
      mobileNumber,
      dateOfBirth,
      inquiryDate: inquiryDate || new Date(),
      occupation,
      packageType,
      dueDate,
      remarks,
      gender,
      joinDate,
      joinWeight,
      joinHeight,
      age,
      period,
      personalTrainer,
      ptAmount,
      maritalStatus,
      address,
      shiftType,
      time,
      paidDate,
      createdUser: decoded.id,
      createdDate: new Date()
    });

    return res.status(200).json({
      message: "Member saved successfully"
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.deleteMemberDetail = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { memberId } = req.body;

  if (checkIfValueIsEmpty(memberId)) {
    return res.status(400).json({
      message: "memberId cannot be empty"
    });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const deleted = await MemberDetail.findOneAndDelete({ _id: memberId, createdUser: decoded.id }).exec();
    if (!deleted) {
      return res.status(404).json({ message: "Member not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
