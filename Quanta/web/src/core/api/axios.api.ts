import axios, { AxiosError } from "axios";
import { getToken } from "@clerk/react";
import { globalErrorState } from "@/common/storage/globalState";

const apiClient = axios.create({
  baseURL: "https://quantaai-production.up.railway.app/api",
  withCredentials: true,
  timeout: 20000,
});


/* const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
}); */

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; type: string }>) => {
    globalErrorState.getState().setGlobalError({
      code: error.response?.status ?? "UNKNOWN",
      message: error.response?.data?.message ?? error.message,
      type: error.response?.data?.type ?? "ServerError",
    });

    return Promise.reject(error);
  },
);

export { apiClient };
