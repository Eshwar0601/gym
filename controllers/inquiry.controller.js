 const Inquiry = require('../models/inquiry.model');
 const jwt = require('jsonwebtoken');

 exports.getInquiryDetails = async (req, res) => {
    const authHeader = req.headers.authorization;
    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');
        // if(!checkIfValueIsEmpty(decoded) && !checkIfValueIsEmpty(decoded.id)) {
            const listOfInquiries = await Inquiry.find({createdUser: decoded.id}).exec();
            return res.status(200).json({
                data: listOfInquiries
            })
        // }

    } catch(error) {
        return res.status(500).json({
            error: error.message
        });

    }
}

exports.saveInquiryDetails = async (req, res) => {
    const authHeader = req.headers.authorization;
    const {fullName, email, mobileNumber, gender, dateOfBirth, occupation, packageType, followUpDate, remarks} = req.body;

    if(checkIfValueIsEmpty(fullName)) {
        return res.status(400).json({
            message : "fullName cannot be empty"
        });
    }

    if(checkIfValueIsEmpty(email)) {
        return res.status(400).json({
            message : "email cannot be empty"
        });
    }

    if(checkIfValueIsEmpty(mobileNumber)) {
        return res.status(400).json({
            message : "mobileNumber cannot be empty"
        });
    }

    if(checkIfValueIsEmpty(gender)) {
        return res.status(400).json({
            message : "gender cannot be empty"
        });
    }

    if(checkIfValueIsEmpty(dateOfBirth)) {
        return res.status(400).json({
            message : "dateOfBirth cannot be empty"
        });
    }
    
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');
        console.log("token ", decoded);

        const isInquiryExists = await Inquiry.findOne({email: email});
        if(isInquiryExists) {
            return res.status(400).json({ message: "Inquiry with this email already exists" })
        }

        console.log("created User", decoded.id)

        const newInquiry = await Inquiry.create({
            fullName: fullName,
            email: email,
            mobileNumber: mobileNumber,
            gender: gender,
            dateOfBirth: dateOfBirth,
            inquiryDate: new Date(),
            occupation: occupation,
            packageType: packageType,
            followUpDate: followUpDate,
            remarks: remarks,
            createdUser: decoded.id,
            createdDate: new Date()
        });

        return res.status(200).json({
            message : "Inquiry saved sucesfully"
        })

    } catch(error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

exports.deleteInquiryDetail = async (req, res) => {
    const authHeader = req.headers.authorization;
    const { inquiryId } = req.body;

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
