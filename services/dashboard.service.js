const mongoose = require('mongoose');
const MemberDetail = require('../models/member.model');
const MemberPackageDetails = require('../models/memberPackageDetails.model');
const Payment = require('../models/payment.model');
const Inquiry = require('../models/inquiry.model');

const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  return startOfDay(d);
};

const getWeekWindow = (date) => {
  const end = endOfDay(date);
  const start = startOfDay(new Date(date.getTime() - 6 * DAY_MS));
  return { start, end };
};

const getRange = ({ startDate, endDate }) => {
  let rangeStart = startDate ? toDate(startDate) : null;
  let rangeEnd = endDate ? toDate(endDate) : null;
  if (rangeStart) rangeStart = startOfDay(rangeStart);
  if (rangeEnd) rangeEnd = endOfDay(rangeEnd);
  return { rangeStart, rangeEnd };
};

const buildDateRangeMatch = (field, start, end) => {
  if (!start && !end) return {};
  const rangeMatch = {};
  if (start) rangeMatch.$gte = start;
  if (end) rangeMatch.$lte = end;
  return { [field]: rangeMatch };
};

const getBirthdaysThisMonth = async (userId) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const birthdays = await MemberDetail.aggregate([
    { $match: { createdUser: new mongoose.Types.ObjectId(userId), dateOfBirth: { $exists: true, $ne: null } } },
    { $addFields: { birthMonth: { $month: '$dateOfBirth' }, birthDate: { $dayOfMonth: '$dateOfBirth' } } },
    { $match: { birthMonth: month } },
    { $project: { _id: 1, memberName: '$fullName', mobileNumber: 1, dateOfBirth: 1 } },
    { $sort: { dateOfBirth: 1 } }
  ]).exec();
  return birthdays;
};

const getBirthdayToday = async (userId) => {
  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth() + 1;
  const birthdays = await MemberDetail.aggregate([
    { $match: { createdUser: new mongoose.Types.ObjectId(userId), dateOfBirth: { $exists: true, $ne: null } } },
    { $addFields: { birthMonth: { $month: '$dateOfBirth' }, birthDate: { $dayOfMonth: '$dateOfBirth' } } },
    { $match: { birthMonth: month, birthDate: today } },
    { $project: { _id: 1, memberName: '$fullName', mobileNumber: 1, dateOfBirth: 1 } }
  ]).exec();
  return birthdays;
};

const getCountForPeriod = async (Model, field, userId, period) => {
  const now = new Date();
  let start;
  let end = endOfDay(now);

  if (period === 'today') {
    start = startOfDay(now);
  } else if (period === 'week') {
    start = startOfDay(new Date(now.getTime() - 6 * DAY_MS));
  } else if (period === 'month') {
    start = startOfMonth(now);
  }

  return Model.countDocuments({
    createdUser: new mongoose.Types.ObjectId(userId),
    [field]: { $gte: start, $lte: end }
  }).exec();
};

const getNewMembersToday = async (userId) => getCountForPeriod(MemberDetail, 'createdDate', userId, 'today');
const getInquiryCount = async (userId, period) => getCountForPeriod(Inquiry, 'createdDate', userId, period);
const getConversionCount = async (userId, period) => getCountForPeriod(MemberDetail, 'createdDate', userId, period);

const getTotalRevenue = async (userId, rangeStart, rangeEnd) => {
  const match = { createdUser: new mongoose.Types.ObjectId(userId) };
  if (rangeStart || rangeEnd) {
    match.createdDate = {};
    if (rangeStart) match.createdDate.$gte = rangeStart;
    if (rangeEnd) match.createdDate.$lte = rangeEnd;
  }
  const result = await Payment.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).exec();
  return result.length ? result[0].total : 0;
};

const getPackageSummaries = async (userId, rangeStart, rangeEnd) => {
  const packages = await MemberPackageDetails.find({ createdUser: new mongoose.Types.ObjectId(userId), isActive: true })
    .populate('memberID', 'fullName mobileNumber')
    .lean()
    .exec();

  const packageIds = packages.map((pkg) => pkg._id);
  const payments = await Payment.aggregate([
    { $match: { createdUser: new mongoose.Types.ObjectId(userId), memberPackageId: { $in: packageIds } } },
    { $group: { _id: '$memberPackageId', totalPaid: { $sum: '$amount' } } }
  ]).exec();

  const paymentMap = payments.reduce((acc, payment) => {
    acc[payment._id.toString()] = payment.totalPaid;
    return acc;
  }, {});

  const now = new Date();
  const upcomingWindowEnd = new Date(now.getTime() + 7 * DAY_MS);

  const pendingPayments = [];
  const upcomingDues = [];
  const expiringPackages = [];

  packages.forEach((pkg) => {
    const totalPaid = paymentMap[pkg._id.toString()] || 0;
    const totalCost = pkg.discountedPrice || pkg.fee || 0;
    const dueAmount = Math.max(totalCost - totalPaid, 0);
    const dueDate = pkg.endDate || null;
    const packageName = pkg.packageName || '';
    const member = pkg.memberID || {};
    const remainingDays = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS) : null;

    const dueDateMatchesRange = (!rangeStart && !rangeEnd)
      || (dueDate && (!rangeStart || dueDate >= rangeStart) && (!rangeEnd || dueDate <= rangeEnd));

    if (dueDate && dueDateMatchesRange && remainingDays >= 0 && remainingDays <= 7) {
      expiringPackages.push({
        memberId: member._id || null,
        memberName: member.fullName || '',
        packageName,
        endDate: dueDate,
        remainingDays
      });
    }

    if (dueAmount > 0) {
      const common = {
        memberId: member._id || null,
        memberName: member.fullName || '',
        packageId: pkg._id,
        packageName,
        dueAmount,
        dueDate,
        daysOverdue: dueDate && dueDate < now ? Math.ceil((now.getTime() - dueDate.getTime()) / DAY_MS) : 0,
        remainingDays
      };

      if (dueDate && dueDateMatchesRange) {
        pendingPayments.push(common);
      }

      if (dueDate && remainingDays !== null && remainingDays >= 0 && remainingDays <= 7 && dueDateMatchesRange) {
        upcomingDues.push({
          memberId: member._id || null,
          memberName: member.fullName || '',
          packageId: pkg._id,
          packageName,
          dueAmount,
          dueDate,
          remainingDays
        });
      }
    }
  });

  return {
    pendingPayments,
    upcomingDues,
    expiringPackages
  };
};

exports.getDashboardSummary = async (userId, query) => {
  const { rangeStart, rangeEnd } = getRange(query);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfDay(now);

  const [
    newMembersToday,
    totalRevenueThisMonth,
    totalInquiriesThisMonth,
    inquiryCountToday,
    inquiryCountWeek,
    inquiryCountMonth,
    conversionCountToday,
    conversionCountWeek,
    conversionCountMonth,
    birthdaysThisMonth,
    birthdayToday,
    packageSummary
  ] = await Promise.all([
    getNewMembersToday(userId),
    getTotalRevenue(userId, rangeStart || monthStart, rangeEnd || monthEnd),
    Inquiry.countDocuments({
      createdUser: new mongoose.Types.ObjectId(userId),
      createdDate: { $gte: rangeStart || monthStart, $lte: rangeEnd || monthEnd }
    }).exec(),
    getInquiryCount(userId, 'today'),
    getInquiryCount(userId, 'week'),
    getInquiryCount(userId, 'month'),
    getConversionCount(userId, 'today'),
    getConversionCount(userId, 'week'),
    getConversionCount(userId, 'month'),
    getBirthdaysThisMonth(userId),
    getBirthdayToday(userId),
    getPackageSummaries(userId, rangeStart, rangeEnd)
  ]);

  const pendingPaymentsCount = packageSummary.pendingPayments.length;
  const upcomingDuesCount = packageSummary.upcomingDues.length;
  const expiringPackagesThisWeek = packageSummary.expiringPackages.length;

  return {
    summaryCards: {
      newMembersToday,
      totalRevenueThisMonth,
      expiringPackagesThisWeek,
      totalInquiriesThisMonth,
      pendingPaymentsCount,
      upcomingDuesCount,
      conversionCountToday,
      conversionCountWeek,
      conversionCountMonth,
      inquiryCountToday,
      inquiryCountWeek,
      inquiryCountMonth
    },
    birthdaysThisMonth,
    birthdayToday,
    pendingPayments: packageSummary.pendingPayments,
    upcomingDues: packageSummary.upcomingDues,
    expiringPackages: packageSummary.expiringPackages
  };
};
