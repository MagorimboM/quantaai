import axios, { AxiosError } from "axios";
import { globalErrorState } from "@/common/storage/globalState";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 20000,
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
  }
);

export { apiClient };