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
    required: false
  },
  mobileNumber: {
    type: String,
    required: false
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
  // packageStartDate: {
  //   type: Date
  // },
  // packageEndDate: {
  //   type: Date
  // },
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
  userImageUrl : {
    type: String
  },
  userImageId : {
    type: String
  },
  memberDueDate: {
    type: Date
  },
  // paidDate: {
  //   type: Date
  // },
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
