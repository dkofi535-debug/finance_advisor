import api from '../api/axios';

export const getBudgets = async () => {
  const response = await api.get('/budgets');
  return response.data;
};
