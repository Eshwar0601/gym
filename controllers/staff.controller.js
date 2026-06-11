const StaffDetail = require('../models/staff.model');
const jwt = require('jsonwebtoken');
const cloudinary = require('./../config/cloudinary');
const streamifier = require('streamifier');

const mapStaffToResponse = (staff) => ({
  _id: staff._id,
  staffCode: staff.staffCode,
  staffName: staff.staffName,
  email: staff.email,
  age: staff.age,
  dateOfBirth: staff.dateOfBirth,
  joinDate: staff.joinDate,
  leftDate: staff.leftDate,
  designation: staff.designation,
  address: staff.address,
  phoneNumber: staff.phoneNumber,
  expertise: staff.expertise || '',
  staffRating: staff.staffRating || null,
  userImageUrl: staff.userImageUrl || null,
  userImageId: staff.userImageId || null,
  emergencyContactName: staff.emergencyContactName || '',
  emergencyContactNumber: staff.emergencyContactNumber || '',
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
  const { uniqueId, staffCode, staffName, age, dateOfBirth, joinDate, leftDate, designation, address ,email, phoneNumber, expertise, staffRating, emergencyContactName, emergencyContactNumber } = req.body;

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
    if (staffCode !== undefined) updateData.staffCode = staffCode;
    if (staffName !== undefined) updateData.staffName = staffName;
    if (age !== undefined) updateData.age = age;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (joinDate !== undefined) updateData.joinDate = joinDate;
    if (leftDate !== undefined) updateData.leftDate = leftDate;
    if (designation !== undefined) updateData.designation = designation;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (staffRating !== undefined) updateData.staffRating = staffRating;
    if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) updateData.emergencyContactNumber = emergencyContactNumber;

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
  const { staffCode, staffName, age, dateOfBirth, joinDate, leftDate, designation, address, email, phoneNumber, expertise = '', staffRating = null, emergencyContactName = '', emergencyContactNumber = '' } = req.body;

  if (checkIfValueIsEmpty(staffCode)) {
    return res.status(400).json({ message: "staffCode cannot be empty" });
  }

  if (checkIfValueIsEmpty(age)) {
    return res.status(400).json({ message: "age cannot be empty" });
  }

  if (checkIfValueIsEmpty(dateOfBirth)) {
    return res.status(400).json({ message: "dateOfBirth cannot be empty" });
  }

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

    const newStaff = await StaffDetail.create({
      staffCode,
      staffName,
      age, 
      dateOfBirth, 
      joinDate, 
      leftDate, 
      designation, 
      address,
      email,
      phoneNumber,
      expertise,
      staffRating,
      emergencyContactName,
      emergencyContactNumber,
      createdUser: decoded.id,
      createdDate: new Date()
    });

    return res.status(200).json({ 
      data: mapStaffToResponse(newStaff, [], []),
      message: "Staff saved successfully" 
    });
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

    if (deleted.userImageId) {
      await cloudinary.uploader.destroy(deleted.userImageId);
    }

    return res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.uploadStaffImage = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { uniqueId } = req.body;

  try {
    if(!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    if(checkIfValueIsEmpty(req.file)) {
      return res.status(400).json({message: "File cannot be empty"});
    }

    if(checkIfValueIsEmpty(uniqueId)) {
      return res.status(400).json({message: "Unique id cannot be empty"});
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

    if (staff.userImageId) {
      await cloudinary.uploader.destroy(staff.userImageId);
    }

    const result = await new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) resolve(result); else reject(error);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const updatedStaffWithImage = await StaffDetail.findOneAndUpdate(
      { _id: staff._id, createdUser: decoded.id },
      {
        userImageUrl: result.secure_url,
        userImageId: result.public_id
      },
      { new: true }
    );

    res.status(200).json({
      message: "Staff profile photo updated!",
      staff: updatedStaffWithImage
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.deleteStaffImage = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { uniqueId } = req.body;

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

    if (staff.userImageId) {
      await cloudinary.uploader.destroy(staff.userImageId);
      await StaffDetail.findOneAndUpdate(
        { _id: staff._id, createdUser: decoded.id },
        { userImageUrl: null, userImageId: null },
        { new: true }
      );
      return res.status(200).json({ message: "Image deleted successfully" });
    } else {
      return res.status(400).json({ message: "No image to delete" });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
