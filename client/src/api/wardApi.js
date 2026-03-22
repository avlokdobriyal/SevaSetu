import axiosInstance from "./axiosInstance";

export const getAllWardsRequest = async () => {
  const response = await axiosInstance.get("/wards");
  return response.data;
};

export const createWardRequest = async (payload) => {
  const response = await axiosInstance.post("/wards", payload);
  return response.data;
};

export const updateWardRequest = async (id, payload) => {
  const response = await axiosInstance.patch(`/wards/${id}`, payload);
  return response.data;
};

export const deleteWardRequest = async (id) => {
  const response = await axiosInstance.delete(`/wards/${id}`);
  return response.data;
};
