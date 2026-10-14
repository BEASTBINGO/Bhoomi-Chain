import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhoomichain_citizen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Citizen Authentication
export const loginCitizen = async (credentials) => {
  const payload = typeof credentials === 'object' && credentials !== null 
    ? credentials 
    : { bcid: credentials, mobile: arguments[1] };
  const response = await api.post('/citizens/login', payload);
  return response.data;
};

export const registerCitizen = async (citizenData) => {
  const response = await api.post('/citizens/register', citizenData);
  return response.data;
};

export const getCitizenProfile = async () => {
  const response = await api.get('/citizens/profile');
  return response.data;
};

// Properties
export const getMyProperties = async () => {
  const response = await api.get('/properties/my');
  return response.data;
};

export const registerProperty = async (data) => {
  const response = await api.post('/properties', data);
  return response.data;
};

export const getPropertyById = async (id) => {
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const getPropertyOwnershipHistory = async (id) => {
  const response = await api.get(`/properties/${id}/ownership-history`);
  return response.data;
};

// Documents
export const uploadDocument = async (formData) => {
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPropertyDocuments = async (propertyId) => {
  const response = await api.get(`/documents/property/${propertyId}`);
  return response.data;
};

export const analyzeDocument = async (documentId) => {
  const response = await api.post(`/documents/${documentId}/analyze`);
  return response.data;
};

// Transfers
export const getMyTransfers = async () => {
  const response = await api.get('/transfers/my');
  return response.data;
};

export const getTransferById = async (id) => {
  const response = await api.get(`/transfers/${id}`);
  return response.data;
};

export const sellerVerifyTransfer = async (id, decision, reason = '') => {
  const response = await api.patch(`/transfers/${id}/seller-verify`, { decision, reason });
  return response.data;
};

export const buyerVerifyTransfer = async (id, decision, reason = '') => {
  const response = await api.patch(`/transfers/${id}/buyer-verify`, { decision, reason });
  return response.data;
};

export const securityConfirmTransfer = async (id, credentials) => {
  const response = await api.patch(`/transfers/${id}/security-confirm`, credentials);
  return response.data;
};

export const submitPaymentProof = async (id, paymentData) => {
  const response = await api.post(`/transfers/${id}/payment-proof`, paymentData);
  return response.data;
};

export default api;
