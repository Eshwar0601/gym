const dashboardService = require('../services/dashboard.service');

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { startDate, endDate } = req.query;
    const data = await dashboardService.getDashboardSummary(userId, { startDate, endDate });

    return res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch dashboard summary',
      error: error.message
    });
  }
};
