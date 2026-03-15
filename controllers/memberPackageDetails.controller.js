const PackageDetail = require('../models/memberPackageDetails.model');
const jwt = require('jsonwebtoken');

exports.getMemberPackagePackageDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const listOfPackages = await PackageDetail.find({ createdUser: decoded.id }).exec();
    return res.status(200).json({
      data: listOfPackages
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.saveMemberPackageDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { memberNo,
      memberID,
      packageName,
      fee,
      isActive,
      startDate,
      endDate,
      remarks,
      discount,
      discountedPrice, } = req.body;

  if (checkIfValueIsEmpty(packageName)) {
    return res.status(400).json({
      message: "packageName cannot be empty"
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

    const newPackage = await PackageDetail.create({
      memberNo,
      memberID,
      packageName,
      masterPackageId,
      fee,
      isActive: isActive !== undefined ? isActive : true,
      startDate,
      endDate,
      remarks,
      discount,
      discountedPrice,
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

exports.deleteMemberPackageDetail = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { packageId } = req.body;

  if (checkIfValueIsEmpty(packageId)) {
    return res.status(400).json({
      message: "packageId cannot be empty"
    });
  }

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const deleted = await PackageDetail.findOneAndDelete({ _id: packageId, createdUser: decoded.id }).exec();
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
