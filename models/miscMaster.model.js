const mongoose = require('mongoose');

const miscMasterSchema = new mongoose.Schema({
  headerType: {
    type: String,
    required: true
  },
  keyValuePairs: [
    {
      key: {
        type: String
      },
      value: {
        type: String
      }
    }
  ],
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

module.exports = mongoose.model('MiscMaster', miscMasterSchema);
