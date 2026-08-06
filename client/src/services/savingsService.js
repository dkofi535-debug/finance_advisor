import api from '../api/axios';

export const getSavingsGoals = async () => {
  const response = await api.get('/savings');
  return response.data;
};
