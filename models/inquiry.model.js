const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobileNumber: {
        type: Number,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    inquiryDate: {
        type: Date,
        required: true
    },
    occupation: {
        type: String,
        required: false
    },
    packageType: {
        type: String,
        required: false
    },
    followUpDate: {
        type: Date,
        required: false
    },
    remarks: {
        type: String,
        required: false
    },
    createdUser: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Inquiry', inquirySchema)
