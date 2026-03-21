const PackageDetail = require('../models/memberPackageDetails.model');
const jwt = require('jsonwebtoken');

const mapMemberPackageToResponse = (pkg) => ({
  _id: pkg._id,
  memberNo: pkg.memberNo,
  memberID: pkg.memberID || null,
  masterPackageId: pkg.masterPackageId || null,
  packageName: pkg.packageName,
  fee: pkg.fee,
  isActive: pkg.isActive !== undefined ? pkg.isActive : true,
  startDate: pkg.startDate || null,
  endDate: pkg.endDate || null,
  remarks: pkg.remarks || '',
  createdUser: pkg.createdUser,
  discount: pkg.discount || null,
  discountedPrice: pkg.discountedPrice || null,
  createdDate: pkg.createdDate
});

exports.getMemberPackagePackageDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');

    const listOfPackages = await PackageDetail.find({ createdUser: decoded.id }).exec();
    const packagesWithDefaults = listOfPackages.map(mapMemberPackageToResponse);
    return res.status(200).json({
      data: packagesWithDefaults
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.fetchMemberPackageByUniqueId = async (req, res) => {
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

    const pkg = await PackageDetail.findOne({ _id: uniqueId, createdUser: decoded.id }).exec();
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      data: mapMemberPackageToResponse(pkg)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.updateMemberPackageByUniqueId = async (req, res) => {
  const authHeader = req.headers.authorization;
  const {
    uniqueId,
    memberNo,
    memberID,
    masterPackageId,
    packageName,
    fee,
    isActive,
    startDate,
    endDate,
    remarks,
    discount,
    discountedPrice
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
    if (masterPackageId !== undefined) updateData.masterPackageId = masterPackageId;
    if (packageName !== undefined) updateData.packageName = packageName;
    if (fee !== undefined) updateData.fee = fee;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (discount !== undefined) updateData.discount = discount;
    if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice;

    const updatedPackage = await PackageDetail.findOneAndUpdate(
      { _id: uniqueId, createdUser: decoded.id },
      updateData,
      { new: true }
    ).exec();

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.status(200).json({
      data: mapMemberPackageToResponse(updatedPackage)
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.saveMemberPackageDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  // Set defaults for optional fields to ensure they're always present
  const { memberNo,
      memberID = null,
      packageName,
      masterPackageId,
      fee,
      isActive = true,
      startDate = null,
      endDate = null,
      remarks = '',
      discount = null,
      discountedPrice = null, } = req.body;

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
  const { packageId } = req.query;

  console.log(req.query);
  console.log(req.query.packageId);
  console.log(packageId);

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
