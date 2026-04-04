const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    inquiryDate: {
        type: Date,
        required: false
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Inquiry', inquirySchema)
