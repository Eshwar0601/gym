const mongoose = require('mongoose');

const staffDetailsSchema = new mongoose.Schema({
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
  expertise: {
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
