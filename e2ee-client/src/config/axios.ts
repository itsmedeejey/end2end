import axios, { AxiosError, InternalAxiosRequestConfig, } from "axios";

type FailedQueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

type RetryAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

function processQueue(error?: unknown) {

  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
}

api.interceptors.response.use(
  // success response
  (response) => response,

  // error response
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    const isRefreshRequest = originalRequest.url?.includes("/api/auth/refresh");

    // only handle expired auth requests
    if (
      is401 &&
      !alreadyRetried &&
      !isRefreshRequest
    ) {

      // refresh already happening
      if (isRefreshing) {

        return new Promise<void>(
          (resolve, reject) => {

            failedQueue.push({
              resolve,
              reject,
            });
          }
        ).then(() => {
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;

      isRefreshing = true;

      try {

        // refresh tokens
        await api.post("api/auth/refresh");
        // retry waiting requests
        processQueue();
        // retry original request
        return api(originalRequest);
      }

      catch (refreshError) {

        processQueue(refreshError);
        // redirect user to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
