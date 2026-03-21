import axiosInstance from "./axiosInstance";

export const loginRequest = async (payload) => {
  const response = await axiosInstance.post("/auth/login", payload);
  return response.data;
};

export const registerRequest = async (payload) => {
  const response = await axiosInstance.post("/auth/register", payload);
  return response.data;
};

export const getMeRequest = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};
