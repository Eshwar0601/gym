const mongoose = require('mongoose');

const memberPackageDetailsSchema = new mongoose.Schema({
  memberNo: {
    type: String,
    required: true,
  },
  memberID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemberDetail'
  },
  masterPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackageDetail'
  },
  packageName: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  remarks: {
    type: String
  },
  createdUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  discountedPrice: {
    type: Number,
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MemberPackageDetails', memberPackageDetailsSchema);
