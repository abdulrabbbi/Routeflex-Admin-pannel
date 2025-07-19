import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';


const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
