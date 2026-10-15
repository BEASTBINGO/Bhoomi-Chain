import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhoomichain_gov_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────
export const loginRegistrar = async (credentials) => {
  const payload = typeof credentials === 'object' && credentials !== null
    ? credentials
    : { govId: credentials, mobile: arguments[1] };
  const res = await api.post('/government/login', payload);
  return res.data;
};

// ─── Citizen & Property Lookup ─────────────────────────────────────────────
export const lookupCitizen = async (bcid) => {
  const res = await api.get(`/government/lookup-citizen/${encodeURIComponent(bcid)}`);
  return res.data;
};

export const getCitizenProperties = async (bcid) => {
  const res = await api.get(`/government/citizen-properties/${encodeURIComponent(bcid)}`);
  return res.data;
};

// ─── Master Revenue Land Database (100 Records) ─────────────────────────────
export const getMasterRecords = async (params = {}) => {
  const res = await api.get('/government/master-records', { params });
  return res.data;
};

export const checkMasterDatabase = async (data) => {
  const res = await api.post('/government/check-master-database', data);
  return res.data;
};

export const autoCheckRegistration = async (propertyId) => {
  const res = await api.post('/government/auto-check-registration', { propertyId });
  return res.data;
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const res = await api.get('/government/dashboard-stats');
  return res.data;
};

// ─── Properties ────────────────────────────────────────────────────────────
export const getPendingProperties = async () => {
  const res = await api.get('/government/properties/pending');
  return res.data;
};

export const getAllProperties = async (status = '') => {
  const params = status ? { status } : {};
  const res = await api.get('/government/properties/all', { params });
  return res.data;
};

export const getPropertyReviewDetails = async (id) => {
  const res = await api.get(`/government/properties/${id}`);
  return res.data;
};

export const verifyProperty = async (id, decision, rejectionReason = '', remarks = '') => {
  const res = await api.patch(`/government/properties/${id}/verify`, {
    decision,
    rejectionReason,
    remarks,
  });
  return res.data;
};

// ─── Transfers ─────────────────────────────────────────────────────────────
export const getAllTransfers = async (status = '') => {
  const params = status ? { status } : {};
  const res = await api.get('/government/transfers/all', { params });
  return res.data;
};

export const getPendingGovernmentTransfers = async () => {
  const res = await api.get('/transfers/pending-government');
  return res.data;
};

export const getTransferById = async (id) => {
  const res = await api.get(`/transfers/${id}`);
  return res.data;
};

export const createTransferRequest = async (data) => {
  const res = await api.post('/transfers', data);
  return res.data;
};

export const governmentTransferDecision = async (id, decision, remarks = '', rejectionReason = '') => {
  const res = await api.patch(`/transfers/${id}/government-decision`, {
    decision,
    remarks,
    rejectionReason,
  });
  return res.data;
};

// ─── Ledger ────────────────────────────────────────────────────────────────
export const getLedger = async () => {
  const res = await api.get('/government/ledger');
  return res.data;
};

export const verifyLedgerIntegrity = async () => {
  const res = await api.get('/government/ledger/verify');
  return res.data;
};

// ─── Audit Logs ────────────────────────────────────────────────────────────
export const getAuditLogs = async () => {
  const res = await api.get('/government/audit-logs');
  return res.data;
};

// ─── Citizens (for search) ─────────────────────────────────────────────────
export const getPropertyOwnershipHistory = async (id) => {
  const res = await api.get(`/properties/${id}/ownership-history`);
  return res.data;
};

export default api;
