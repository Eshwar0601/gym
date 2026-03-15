const mongoose = require('mongoose');

const packageDetailsSchema = new mongoose.Schema({
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
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
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
  duration : {
    type: String,
    default: '6 Months'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PackageDetail', packageDetailsSchema);
