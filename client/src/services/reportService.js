import api from '../api/axios';

export const getMonthlyReport = async () => {
  const response = await api.get('/reports/monthly');
  return response.data;
};

export const getCategoryReport = async () => {
  const response = await api.get('/reports/category');
  return response.data;
};

export const getBudgetReport = async () => {
  const response = await api.get('/reports/budget');
  return response.data;
};

export const getSavingsReport = async () => {
  const response = await api.get('/reports/savings');
  return response.data;
};
