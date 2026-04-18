 const Inquiry = require('../models/inquiry.model');
 const jwt = require('jsonwebtoken');

 const mapInquiryToResponse = (inq) => ({
    _id: inq._id,
    fullName: inq.fullName,
    email: inq.email || '',
    mobileNumber: inq.mobileNumber,
    gender: inq.gender || '',
    dateOfBirth: inq.dateOfBirth || null,
    inquiryDate: inq.inquiryDate || null,
    occupation: inq.occupation || '',
    packageType: inq.packageType || '',
    followUpDate: inq.followUpDate || null,
    remarks: inq.remarks || '',
    createdUser: inq.createdUser,
    createdDate: inq.createdDate,
    createdTimestamp: inq.createdTimestamp
 });

 exports.getInquiryDetails = async (req, res) => {
    const authHeader = req.headers.authorization;
    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');
        // if(!checkIfValueIsEmpty(decoded) && !checkIfValueIsEmpty(decoded.id)) {
            const listOfInquiries = await Inquiry.find({createdUser: decoded.id}).exec();
            const inquiriesWithDefaults = listOfInquiries.map(mapInquiryToResponse);
            return res.status(200).json({
                data: inquiriesWithDefaults
            })
        // }

    } catch(error) {
        return res.status(500).json({
            error: error.message
        });

    }
}

exports.fetchInquiryByUniqueId = async (req, res) => {
    const authHeader = req.headers.authorization;
    const { uniqueId } = req.body;

    if (checkIfValueIsEmpty(uniqueId)) {
        return res.status(400).json({ message: "uniqueId cannot be empty" });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');

        const inquiry = await Inquiry.findOne({
            createdUser: decoded.id,
            $or: [{ _id: uniqueId }, { mobileNumber: uniqueId }]
        }).exec();

        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        return res.status(200).json({
            data: mapInquiryToResponse(inquiry)
        });
    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

exports.updateInquiryByInquiryId = async (req, res) => {
    const authHeader = req.headers.authorization;
    const {
        inquiryId,
        fullName,
        email,
        mobileNumber,
        gender,
        dateOfBirth,
        occupation,
        packageType,
        followUpDate,
        remarks
    } = req.body;
    console.log("sssssssssssssssssssssssssss", req.body);

    if (checkIfValueIsEmpty(inquiryId)) {
        return res.status(400).json({ message: "inquiryId cannot be empty" });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email;
        if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
        if (gender !== undefined) updateData.gender = gender;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (occupation !== undefined) updateData.occupation = occupation;
        if (packageType !== undefined) updateData.packageType = packageType;
        if (followUpDate !== undefined) updateData.followUpDate = followUpDate;
        if (remarks !== undefined) updateData.remarks = remarks;

        const updatedInquiry = await Inquiry.findOneAndUpdate(
            { createdUser: decoded.id, $or: [{ _id: inquiryId }] },
            updateData,
            { new: true }
        ).exec();

        if (!updatedInquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        return res.status(200).json({
            data: mapInquiryToResponse(updatedInquiry)
        });
    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

exports.saveInquiryDetails = async (req, res) => {
    const authHeader = req.headers.authorization;
    // Set defaults for optional fields to ensure they're always present
    const {fullName, mobileNumber, email = '', gender = '', dateOfBirth = null, occupation = '', packageType = '', followUpDate = null, remarks = ''} = req.body;

    if(checkIfValueIsEmpty(fullName)) {
        return res.status(400).json({
            message : "fullName cannot be empty"
        });
    }

    if(checkIfValueIsEmpty(mobileNumber)) {
        return res.status(400).json({
            message : "mobileNumber cannot be empty"
        });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');
        console.log("token ", decoded);

        console.log("created User", decoded.id)

        const newInquiry = await Inquiry.create({
            fullName: fullName,
            mobileNumber: mobileNumber,
            email: email,
            gender: gender,
            dateOfBirth: dateOfBirth,
            inquiryDate: new Date(),
            occupation: occupation,
            packageType: packageType,
            followUpDate: followUpDate,
            remarks: remarks,
            createdUser: decoded.id,
            createdDate: new Date(),
        });

        return res.status(200).json({
            message : "Inquiry saved successfully",
            data: mapInquiryToResponse(newInquiry)
        })

    } catch(error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

exports.deleteInquiryDetail = async (req, res) => {
    const authHeader = req.headers.authorization;
    const { inquiryId } = req.query;

    if (checkIfValueIsEmpty(inquiryId)) {
        return res.status(400).json({
            message: "inquiryId cannot be empty"
        });
    }

    try {

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');

        const deleted = await Inquiry.findOneAndDelete({ _id: inquiryId, createdUser: decoded.id }).exec();
        if (!deleted) {
            return res.status(404).json({ message: "Inquiry not found or not authorized to delete" });
        }

        return res.status(200).json({ message: "Inquiry deleted successfully" });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
