// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');

    // ADD TOKEN
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    // FORM DATA
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,

  (error) => {

    console.log("API ERROR =", error.response);

    // ONLY 401 -> LOGIN
    if (error.response?.status === 401) {

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;