import axiosInstance from "./axiosInstance";

export const getWorkersRequest = async () => {
  const response = await axiosInstance.get("/users/workers");
  return response.data;
};

export const createWorkerRequest = async (payload) => {
  const response = await axiosInstance.post("/users/workers", payload);
  return response.data;
};

export const getOfficersRequest = async () => {
  const response = await axiosInstance.get("/users/officers");
  return response.data;
};

export const createOfficerRequest = async (payload) => {
  const response = await axiosInstance.post("/users/officers", payload);
  return response.data;
};

export const toggleUserActiveRequest = async (id) => {
  const response = await axiosInstance.patch(`/users/${id}/toggle-active`);
  return response.data;
};
