const mongoose = require('mongoose');

const staffDetailsSchema = new mongoose.Schema({
  staffCode: {
    type: String,
    unique: true
  },
  staffName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  age: {
    type: Number,
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  joinDate: {
    type: Date
  },
  leftDate: {
    type: Date
  },
  expertise: {
    type: String
  },
  designation: {
    type: String
  },
  address: {
    type: String
  },
  staffRating: {
    type: Number
  },
  userImageUrl : {
    type: String
  },
  userImageId : {
    type: String
  },
  emergencyContactName: {
    type: String
  },
  emergencyContactNumber: {
    type: String
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

module.exports = mongoose.model('StaffDetail', staffDetailsSchema);
