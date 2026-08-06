import api from '../api/axios';

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};
