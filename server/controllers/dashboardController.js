const { getDashboardSummary } = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await getDashboardSummary(req.user.id);

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
