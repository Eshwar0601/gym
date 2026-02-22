const mongoose = require('mongoose');

const planDetailsSchema = new mongoose.Schema({
  planName: {
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

module.exports = mongoose.model('PlanDetail', planDetailsSchema);
