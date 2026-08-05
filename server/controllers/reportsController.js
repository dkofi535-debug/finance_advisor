const {
  getMonthlyReportData,
  getCategoryReportData,
  getBudgetReportData,
  getSavingsReportData,
} = require('../services/reportsService');

const getMonthlyReport = async (req, res, next) => {
  try {
    const data = await getMonthlyReportData(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryReport = async (req, res, next) => {
  try {
    const data = await getCategoryReportData(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBudgetReport = async (req, res, next) => {
  try {
    const data = await getBudgetReportData(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getSavingsReport = async (req, res, next) => {
  try {
    const data = await getSavingsReportData(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReport,
  getCategoryReport,
  getBudgetReport,
  getSavingsReport,
};
