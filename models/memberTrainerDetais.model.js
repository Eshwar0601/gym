const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    memberNo: {
        type: String,
        required: true,
    },
    memberID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberDetail'
    },
    duration : {
        type: String,
        default: '3 Months'
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
    amount: {
        type: String
    },
    ptName: {
        type: String
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StaffDetail'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

module.exports = mongoose.model('TrainerSchema', trainerSchema);
