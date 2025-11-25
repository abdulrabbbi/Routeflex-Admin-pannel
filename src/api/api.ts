import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
const craUrl = process.env.REACT_APP_BACKEND_URL

const apiClient: AxiosInstance = axios.create({
  baseURL: craUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Read token from either localStorage or sessionStorage
    // to stay consistent with guards that support both.
    const token =
      (typeof window !== 'undefined' && localStorage.getItem('token')) ||
      (typeof window !== 'undefined' && sessionStorage.getItem('token')) ||
      null;

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      console.error('API Response Error:', error.response.data);
    } else {
      console.error('API Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
