const mongoose = require('mongoose');

const memberDetailsSchema = new mongoose.Schema({
  memberNo: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  inquiryDate: {
    type: Date,
    default: Date.now
  },
  occupation: {
    type: String
  },
  packageType: {
    type: String
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlanDetail'
  },
  planStartDate: {
    type: Date
  },
  planEndDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  remarks: {
    type: String
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  joinDate: {
    type: Date
  },
  joinWeight: {
    type: Number
  },
  joinHeight: {
    type: Number
  },
  age: {
    type: Number
  },
  period: {
    type: String
  },
  personalTrainer: {
    type: String
  },
  ptAmount: {
    type: Number
  },
  maritalStatus: {
    type: String
  },
  address: {
    type: String
  },
  shiftType: {
    type: String
  },
  time: {
    type: String
  },
  paidDate: {
    type: Date
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
});

module.exports = mongoose.model('MemberDetail', memberDetailsSchema);
