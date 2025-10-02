import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';


const apiClient: AxiosInstance = axios.create({
  // baseURL: 'https://api.routeflex.co.uk/api/v1', 
  baseURL: 'http://localhost:5000/api/v1', 
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
