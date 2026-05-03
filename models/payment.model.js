const mongoose = require('mongoose');

const paymentDetailsSchema = mongoose.Schema({
    memberPackageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberPackageDetails'
    },
    amount: {
        type: Number,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('paymentDetails', paymentDetailsSchema);