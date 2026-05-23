const MemberDetail = require('../models/member.model');
const MemberPackageDetails = require('../models/memberPackageDetails.model');
const MemberTrainerDetails = require('../models/memberTrainerDetais.model');
const Payment = require('../models/payment.model');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const cloudinary = require('./../config/cloudinary');
const streamifier = require('streamifier');

const mapMemberToResponse = (mem, memberPackageDetails = [], memberTrainerDetails = []) => ({
  _id: mem._id,
  memberNo: mem.memberNo,
  fullName: mem.fullName,
  email: mem.email,
  mobileNumber: mem.mobileNumber,
  dateOfBirth: mem.dateOfBirth,
  inquiryDate: mem.inquiryDate,
  occupation: mem.occupation || '',
  memberPackageDetails: memberPackageDetails,
  memberTrainerDetails: memberTrainerDetails,
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
  userImageUrl: mem.userImageUrl || null,
  userImageId: mem.userImageId || null,
  memberDueDate: mem.memberDueDate || null,
  referenceNumber: mem.referenceNumber || null,
  createdUser: mem.createdUser,
  createdDate: mem.createdDate
});

exports.getMemberDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  const limit = req.query.limit;
  const page = req.query.page;
  const skipIndex = (page - 1) * limit;
  const memberNo = req.query.memberNo;
  const fullName = req.query.fullName;
  const email = req.query.email;
  const mobileNumber = req.query.mobileNumber;

  try {
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');
    const query = { createdUser: decoded.id };
    if (memberNo) query.memberNo = memberNo;
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    if (email) query.email = email;
    if (mobileNumber) query.mobileNumber = mobileNumber;

    const listOfMembers = await MemberDetail.find(query).sort({ _id: 1 }).limit(limit).skip(skipIndex);
    
    // Fetch member package details for all members
    const memberIds = listOfMembers.map(mem => mem._id);
    let memberPackageDetails = await MemberPackageDetails.find({
      memberID: { $in: memberIds },
      createdUser: decoded.id
    }).exec();
    
    // Fetch payments for all packages
    const packageIds = memberPackageDetails.map(pkg => pkg._id);
    const payments = await Payment.find({ memberPackageId: { $in: packageIds } }).exec();
    
    // Group payments by packageId
    const paymentMap = {};
    payments.forEach(payment => {
      const pkgId = payment.memberPackageId.toString();
      if (!paymentMap[pkgId]) paymentMap[pkgId] = [];
      paymentMap[pkgId].push(payment);
    });
    
    // Enrich memberPackageDetails with status and paymentDetails
    memberPackageDetails = memberPackageDetails.map(pkg => {
      const pkgId = pkg._id.toString();
      const pkgPayments = paymentMap[pkgId] || [];
      const totalPaid = pkgPayments.reduce((sum, p) => sum + p.amount, 0);
      const plainPkg = pkg.toObject();
      plainPkg.status = plainPkg.discountedPrice && totalPaid === plainPkg.discountedPrice ? 'DONE' : 'PENDING';
      plainPkg.paymentDetails = pkgPayments;
      return plainPkg;
    });
    
    const packageDetailsMap = {};
    memberPackageDetails.forEach(pkg => {
      const memberId = pkg.memberID.toString();
      if (!packageDetailsMap[memberId]) {
        packageDetailsMap[memberId] = [];
      }
      packageDetailsMap[memberId].push(pkg);
    });

    const memberTrainerDetails = await MemberTrainerDetails.find({
      memberID: { $in: memberIds },
      createdUser: decoded.id
    }).exec();

    const trainerDetailsMap = {};
    memberTrainerDetails.forEach(trainer => {
      const memberId = trainer.memberID ? trainer.memberID.toString() : null;
      if (!memberId) return;
      if (!trainerDetailsMap[memberId]) {
        trainerDetailsMap[memberId] = [];
      }
      trainerDetailsMap[memberId].push(trainer);
    });
    
    const membersWithDefaults = listOfMembers.map(mem => {
      const memberId = mem._id.toString();
      const packages = packageDetailsMap[memberId] || [];
      const trainers = trainerDetailsMap[memberId] || [];
      return mapMemberToResponse(mem, packages, trainers);
    });

    const totalItems = await MemberDetail.countDocuments({ createdUser: decoded.id });
    const totalPages = Math.ceil(totalItems / limit);
    
    return res.status(200).json({
      data: membersWithDefaults,
      totalItems,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

exports.uploadMemberData = async(req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if(!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    if(checkIfValueIsEmpty(req.file)) {
      return res.status(400).json({message: "File cannot be empty"});
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, 'SAMPLE_SECRET');
    
    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    
    // Check if there's exactly one sheet
    const sheetNames = workbook.SheetNames;
    if (sheetNames.length !== 1) {
      return res.status(400).json({ message: "Excel file must contain exactly one sheet" });
    }
    
    const sheetName = sheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file contains no data" });
    }
    
    // Define expected columns (only the columns shown in the form)
    const expectedColumns = [
      'memberNo', 'fullName', 'email', 'mobileNumber', 'dateOfBirth', 'occupation',
      'joinDate', 'gender', 'age', 'maritalStatus', 'address', 'shiftType', 'joinWeight'
    ];
    
    // Check if all expected columns are present in the first row
    const firstRow = jsonData[0];
    const missingColumns = expectedColumns.filter(col => !(col in firstRow));
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        message: `Missing required columns: ${missingColumns.join(', ')}` 
      });
    }
    
    // Validate data and prepare for batch processing
    const validMembers = [];
    const errors = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have header
      
      // Validate required fields
      const validationErrors = [];
      
      if (checkIfValueIsEmpty(row.memberNo)) {
        validationErrors.push('memberNo is required');
      }
      
      if (checkIfValueIsEmpty(row.fullName)) {
        validationErrors.push('fullName is required');
      }
      
      if (checkIfValueIsEmpty(row.dateOfBirth)) {
        validationErrors.push('dateOfBirth is required');
      } else {
        const parsedDateOfBirth = parseExcelDateValue(row.dateOfBirth);
        if (!parsedDateOfBirth) {
          validationErrors.push('dateOfBirth must be a valid date');
        }
      }
      
      if (checkIfValueIsEmpty(row.gender)) {
        validationErrors.push('gender is required');
      } else if (!['Male', 'Female'].includes(row.gender)) {
        validationErrors.push('gender must be Male or Female');
      }
      
      if (checkIfValueIsEmpty(row.occupation)) {
        validationErrors.push('occupation is required');
      }
      
      if (checkIfValueIsEmpty(row.joinDate)) {
        validationErrors.push('joinDate is required');
      } else {
        const parsedJoinDate = parseExcelDateValue(row.joinDate);
        if (!parsedJoinDate) {
          validationErrors.push('joinDate must be a valid date');
        }
      }
      
      if (checkIfValueIsEmpty(row.age)) {
        validationErrors.push('age is required');
      } else if (isNaN(parseInt(row.age))) {
        validationErrors.push('age must be a valid number');
      }
      
      if (checkIfValueIsEmpty(row.maritalStatus)) {
        validationErrors.push('maritalStatus is required');
      }
      
      if (checkIfValueIsEmpty(row.address)) {
        validationErrors.push('address is required');
      }
      
      if (checkIfValueIsEmpty(row.shiftType)) {
        validationErrors.push('shiftType is required');
      }
      
      if (checkIfValueIsEmpty(row.joinWeight)) {
        validationErrors.push('joinWeight is required');
      } else if (isNaN(parseFloat(row.joinWeight))) {
        validationErrors.push('joinWeight must be a valid number');
      }
      
      if (validationErrors.length > 0) {
        errors.push({
          row: rowNumber,
          memberNo: row.memberNo || 'N/A',
          errors: validationErrors
        });
      } else {
        // Check for duplicate memberNo in the file
        const duplicateInFile = validMembers.some(m => m.memberNo === row.memberNo);
        if (duplicateInFile) {
          errors.push({
            row: rowNumber,
            memberNo: row.memberNo,
            errors: ['memberNo is duplicated in the file']
          });
        } else {
          // Prepare member data
          const memberData = {
            memberNo: row.memberNo,
            fullName: row.fullName,
            email: row.email || '',
            mobileNumber: row.mobileNumber || '',
            dateOfBirth: parseExcelDateValue(row.dateOfBirth),
            gender: row.gender,
            inquiryDate: new Date(),
            occupation: row.occupation,
            joinDate: parseExcelDateValue(row.joinDate),
            joinWeight: parseFloat(row.joinWeight),
            joinHeight: null,
            age: parseInt(row.age),
            period: '',
            personalTrainer: '',
            ptAmount: null,
            maritalStatus: row.maritalStatus,
            address: row.address,
            shiftType: row.shiftType,
            time: '',
            paidDate: null,
            dueDate: null,
            remarks: '',
            memberDueDate: row.memberDueDate ? parseExcelDateValue(row.memberDueDate) : null,
            createdUser: decoded.id,
            createdDate: new Date()
          };
          
          validMembers.push(memberData);
        }
      }
    }
    
    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Check for duplicate memberNo in database
    const memberNos = validMembers.map(m => m.memberNo);
    const existingMembers = await MemberDetail.find({
      memberNo: { $in: memberNos },
      createdUser: decoded.id
    }).select('memberNo').exec();
    
    const existingMemberNos = existingMembers.map(m => m.memberNo);
    const duplicateErrors = [];
    
    validMembers.forEach((member, index) => {
      if (existingMemberNos.includes(member.memberNo)) {
        duplicateErrors.push({
          row: index + 2,
          memberNo: member.memberNo,
          errors: ['memberNo already exists in database']
        });
      }
    });
    
    if (duplicateErrors.length > 0) {
      return res.status(400).json({
        message: 'Duplicate member numbers found in database',
        errors: duplicateErrors
      });
    }
    
    // Batch process members (100 at a time for performance)
    const batchSize = 100;
    const results = [];
    const batchErrors = [];
    
    for (let i = 0; i < validMembers.length; i += batchSize) {
      const batch = validMembers.slice(i, i + batchSize);
      
      try {
        const savedMembers = await MemberDetail.insertMany(batch, { ordered: false });
        results.push(...savedMembers.map(member => ({
          _id: member._id,
          memberNo: member.memberNo,
          fullName: member.fullName,
          status: 'success'
        })));
      } catch (batchError) {
        // Handle partial batch failures
        if (batchError.writeErrors) {
          batchError.writeErrors.forEach(writeError => {
            const failedMember = batch[writeError.index];
            batchErrors.push({
              memberNo: failedMember.memberNo,
              error: writeError.errmsg
            });
          });
          
          // Add successful inserts from this batch
          const successfulInserts = batch.filter((_, index) => 
            !batchError.writeErrors.some(err => err.index === index)
          );
          results.push(...successfulInserts.map(member => ({
            _id: member._id,
            memberNo: member.memberNo,
            fullName: member.fullName,
            status: 'success'
          })));
        } else {
          // Complete batch failure
          batch.forEach(member => {
            batchErrors.push({
              memberNo: member.memberNo,
              error: batchError.message
            });
          });
        }
      }
    }
    
    return res.status(200).json({
      message: `Processed ${validMembers.length} members`,
      successful: results.length,
      failed: batchErrors.length,
      data: results,
      errors: batchErrors.length > 0 ? batchErrors : undefined
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
};



exports.uploadUserImage = async (req, res) => {
  const authHeader = req.headers.authorization;
  const {uniqueId} = req.body;

  try {
    if(!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    if(checkIfValueIsEmpty(req.file)) {
      return res.status(400).json({message: "File cannot be empty"});
    }

    if(!uniqueId) {
      return res.status(400).json({message: "Unique id cannot be empty"});
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

    // Delete previous image if exists
    if (member.userImageId) {
      await cloudinary.uploader.destroy(member.userImageId);
    }

    const result = await new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) resolve(result); else reject(error);
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const updatedMemberWithImage = await MemberDetail.findOneAndUpdate(
      { _id: member._id, createdUser: decoded.id },
      {
        userImageUrl: result.secure_url,
        userImageId: result.public_id
      },
      { new: true }
    );

    res.status(200).json({
      message: "Profile photo updated!",
      member: updatedMemberWithImage
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.deleteUserImage = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { uniqueId } = req.body;

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

    if (member.userImageId) {
      await cloudinary.uploader.destroy(member.userImageId);
      await MemberDetail.findOneAndUpdate(
        { _id: member._id, createdUser: decoded.id },
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

    const memberTrainerDetails = await MemberTrainerDetails.find({
      memberID: member._id,
      createdUser: decoded.id
    }).exec();

    return res.status(200).json({
      data: mapMemberToResponse(member, memberPackageDetails, memberTrainerDetails)
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
    paidDate,
    memberDueDate,
    referenceNumber,
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
    if (memberDueDate !== undefined) updateData.memberDueDate = memberDueDate;
    if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber;

    // Find the member first
    const member = await MemberDetail.findOne({
      createdUser: decoded.id,
      $or: [{ _id: uniqueId }, { memberNo: uniqueId }]
    }).exec();

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check for duplicate memberNo if it's being updated
    if (memberNo !== undefined && memberNo !== member.memberNo) {
      const existingMember = await MemberDetail.findOne({
        memberNo: memberNo,
        createdUser: decoded.id
      }).exec();
      if (existingMember) {
        return res.status(400).json({ message: "Member number already exists" });
      }
    }

    // Validate referenceNumber if provided - it must match at least one memberNo
    if (referenceNumber !== undefined && referenceNumber !== null && referenceNumber !== '') {
      const refExists = await MemberDetail.findOne({ memberNo: referenceNumber, createdUser: decoded.id }).exec();
      if (!refExists) {
        return res.status(400).json({ message: "referenceNumber must match an existing memberNo" });
      }
    }

    const updatedMember = await MemberDetail.findOneAndUpdate(
      { _id: member._id, createdUser: decoded.id },
      updateData,
      { new: true }
    ).exec();

    // Fetch member package and trainer details for this member
    const memberPackageDetails = await MemberPackageDetails.find({
      memberID: updatedMember._id,
      createdUser: decoded.id
    }).exec();

    const memberTrainerDetails = await MemberTrainerDetails.find({
      memberID: updatedMember._id,
      createdUser: decoded.id
    }).exec();

    return res.status(200).json({
      data: mapMemberToResponse(updatedMember, memberPackageDetails, memberTrainerDetails)
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
    time = '',
    memberDueDate = null,
    referenceNumber = null
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

  // if (checkIfValueIsEmpty(email)) {
  //   return res.status(400).json({
  //     message: "email cannot be empty"
  //   });
  // }

  // if (checkIfValueIsEmpty(mobileNumber)) {
  //   return res.status(400).json({
  //     message: "mobileNumber cannot be empty"
  //   });
  // }

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
    // const isMemberExists = await MemberDetail.findOne({ email: email });
    // if (isMemberExists) {
    //   return res.status(400).json({ message: "Member with this email already exists" });
    // }


    console.log("created User", decoded.id);
    // Validate referenceNumber if provided
    if (referenceNumber !== null && referenceNumber !== undefined && referenceNumber !== '') {
      const refExists = await MemberDetail.findOne({ memberNo: referenceNumber, createdUser: decoded.id }).exec();
      if (!refExists) {
        return res.status(400).json({ message: "referenceNumber must match an existing memberNo" });
      }
    }
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
      memberDueDate,
      referenceNumber,
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
      data: mapMemberToResponse(newMember, [], []),
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
  const { memberId } = req.query;

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

    if (deleted.userImageId) {
      await cloudinary.uploader.destroy(deleted.userImageId);
    }

    await MemberPackageDetails.deleteMany({ memberID: memberId, createdUser: decoded.id});

    await MemberTrainerDetails.deleteMany({ memberID: memberId, createdUser: decoded.id})

    return res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

const parseExcelDateValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Math.floor(value);
    const milliseconds = Math.round((value - days) * 86400000);
    const serialDays = days > 60 ? days - 1 : days; // Excel leap year bug for 1900
    const parsed = new Date(excelEpoch.getTime() + serialDays * 86400000 + milliseconds);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const normalizedValue = String(value).trim();

  const ymdMatch = normalizedValue.match(/^\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s*$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const dmyMatch = normalizedValue.match(/^\s*(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s*$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(normalizedValue);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
