import api from "../api/axios";

export const getSavings = async () => {
  const response = await api.get("/savings");
  return response.data;
};

export const createSavings = async (data) => {
  const response = await api.post("/savings", data);
  return response.data;
};

export const updateSavings = async (id, data) => {
  const response = await api.put(`/savings/${id}`, data);
  return response.data;
};

export const deleteSavings = async (id) => {
  const response = await api.delete(`/savings/${id}`);
  return response.data;
};

export const getSavingsRecommendation = async (availableAmount) => {
  const response = await api.get('/savings/recommendation', {
    params: { amount: availableAmount },
  });

  return response.data;
};