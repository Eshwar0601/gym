const MemberDetail = require('../models/member.model');
const MemberPackageDetails = require('../models/memberPackageDetails.model');
const jwt = require('jsonwebtoken');

const mapMemberToResponse = (mem, memberPackageDetails = []) => ({
  _id: mem._id,
  memberNo: mem.memberNo,
  fullName: mem.fullName,
  email: mem.email,
  mobileNumber: mem.mobileNumber,
  dateOfBirth: mem.dateOfBirth,
  inquiryDate: mem.inquiryDate,
  occupation: mem.occupation || '',
  memberPackageDetails: memberPackageDetails,
  dueDate: mem.dueDate || null,
  remarks: mem.remarks || '',
  gender: mem.gender,
  joinDate: mem.joinDate || null,
  joinWeight: mem.joinWeight || null,
  joinHeight: mem.joinHeight || null,
  age: mem.age || null,
  period: mem.period || '',
  personalTrainer: mem.personalTrainer || '',
  ptAmount: mem.ptAmount || null,
  maritalStatus: mem.maritalStatus || '',
  address: mem.address || '',
  shiftType: mem.shiftType || '',
  time: mem.time || '',
  paidDate: mem.paidDate || null,
  createdUser: mem.createdUser,
  createdDate: mem.createdDate
});

exports.getMemberDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');
    
    const listOfMembers = await MemberDetail.find({ createdUser: decoded.id }).exec();
    
    // Fetch member package details for all members
    const memberIds = listOfMembers.map(mem => mem._id);
    const memberPackageDetails = await MemberPackageDetails.find({
      memberID: { $in: memberIds },
      createdUser: decoded.id
    }).exec();
    
    const packageDetailsMap = {};
    memberPackageDetails.forEach(pkg => {
      const memberId = pkg.memberID.toString();
      if (!packageDetailsMap[memberId]) {
        packageDetailsMap[memberId] = [];
      }
      packageDetailsMap[memberId].push(pkg);
    });
    
    const membersWithDefaults = listOfMembers.map(mem => {
      const memberId = mem._id.toString();
      const packages = packageDetailsMap[memberId] || [];
      return mapMemberToResponse(mem, packages);
    });
    
    return res.status(200).json({
      data: membersWithDefaults
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.fetchMemberByUniqueId = async (req, res) => {
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

    const member = await MemberDetail.findOne({
      createdUser: decoded.id,
      $or: [{ _id: uniqueId }, { memberNo: uniqueId }]
    }).exec();

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Fetch member package details for this member
    const memberPackageDetails = await MemberPackageDetails.find({
      memberID: member._id,
      createdUser: decoded.id
    }).exec();

    return res.status(200).json({
      data: mapMemberToResponse(member, memberPackageDetails)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.updateMemberByUniqueId = async (req, res) => {
  const authHeader = req.headers.authorization;
  const {
    uniqueId,
    memberNo,
    fullName,
    email,
    mobileNumber,
    dateOfBirth,
    gender,
    inquiryDate,
    occupation,
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
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (inquiryDate !== undefined) updateData.inquiryDate = inquiryDate;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (joinDate !== undefined) updateData.joinDate = joinDate;
    if (joinWeight !== undefined) updateData.joinWeight = joinWeight;
    if (joinHeight !== undefined) updateData.joinHeight = joinHeight;
    if (age !== undefined) updateData.age = age;
    if (period !== undefined) updateData.period = period;
    if (personalTrainer !== undefined) updateData.personalTrainer = personalTrainer;
    if (ptAmount !== undefined) updateData.ptAmount = ptAmount;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (address !== undefined) updateData.address = address;
    if (shiftType !== undefined) updateData.shiftType = shiftType;
    if (time !== undefined) updateData.time = time;
    if (paidDate !== undefined) updateData.paidDate = paidDate;

    const updatedMember = await MemberDetail.findOneAndUpdate(
      { createdUser: decoded.id, $or: [{ _id: uniqueId }, { memberNo: uniqueId }] },
      updateData,
      { new: true }
    ).exec();

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Fetch member package details for this member
    const memberPackageDetails = await MemberPackageDetails.find({
      memberID: updatedMember._id,
      createdUser: decoded.id
    }).exec();

    return res.status(200).json({
      data: mapMemberToResponse(updatedMember, memberPackageDetails)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.saveMemberDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  // Set defaults for optional fields to ensure they're always present
  const {
    memberNo,
    fullName,
    email,
    mobileNumber,
    dateOfBirth,
    gender,
    inquiryDate,
    occupation = '',
    dueDate = null,
    remarks = '',
    joinDate = null,
    joinWeight = null,
    joinHeight = null,
    age = null,
    period = '',
    personalTrainer = '',
    ptAmount = null,
    maritalStatus = '',
    address = '',
    shiftType = '',
    time = ''
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
      createdUser: decoded.id,
      createdDate: new Date()
    });

    // const newMemberDetailsPackage = await MemberPackageDetails.create({
    //   memberNo,
    //   memberID : newMember._id,
    //   masterPackageId: package,
    //   packageName,
    //   fee : packageActualFee,
    //   remarks,
    //   discountedPrice: amount,
    //   createdUser: decoded.id,
    //   createdDate: new Date()
    // });


    return res.status(200).json({
      data: mapMemberToResponse(newMember, []),
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
