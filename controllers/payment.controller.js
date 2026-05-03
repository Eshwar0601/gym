const PaymentDetail = require('../models/payment.model');
const MemberPackageDetails = require('../models/memberPackageDetails.model')
const jwt = require('jsonwebtoken');


// exports.getPaymentDetails = async (req, res) => {
//     const authHeader = req.headers.authorization;

// };

exports.savePaymentDetails = async (req, res) => {
    const authHeader = req.headers.authorization;
    const {
        memberPackageId,
        amount
    } = req.body;
    try {

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'SAMPLE_SECRET');

        if (checkIfValueIsEmpty(memberPackageId)) {
            return res.status(400).json({
                message: "package ID cannot be empty"
            });
        }

        if (checkIfValueIsEmpty(amount)) {
            return res.status(400).json({
                message: "amount cannot be empty"
            });
        }

        const fetchedPackage = await MemberPackageDetails.findOne({
            _id : memberPackageId
        });

        if (!fetchedPackage) {
            return res.status(404).json({
                message: "Package not found"
            });
        }

        // Fetch existing payments for this package
        const existingPayments = await PaymentDetail.find({ memberPackageId });

        // Calculate total paid so far
        const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Check if new payment would exceed discounted price
        if (totalPaid + amount > fetchedPackage.discountedPrice) {
            return res.status(400).json({
                message: "Payment amount exceeds the remaining balance for this package"
            });
        }

        const newPaymentEntry = await PaymentDetail.create({
            memberPackageId,
            amount,
            createdUser: decoded.id,
            createdDate: new Date()
        });

        return res.status(200).json({
            message: "Payment saved successfully",
            data: newPaymentEntry
        });

    } catch(error) {
        return res.status(500).json({
        error: error.message
        });
    }
}

const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);

