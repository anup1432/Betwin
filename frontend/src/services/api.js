import axios from "axios";

const API_BASE = "http://localhost:5000/api"; // Render deploy ke liye change karna

export const getBotHistory = () => axios.get(`${API_BASE}/bots/history`);
export const depositRequest = (token, data) =>
  axios.post(`${API_BASE}/wallet/deposit-request`, data, { headers: { Authorization: `Bearer ${token}` } });
export const withdrawRequest = (token, data) =>
  axios.post(`${API_BASE}/wallet/withdraw-request`, data, { headers: { Authorization: `Bearer ${token}` } });
export const getDeposits = (token) =>
  axios.get(`${API_BASE}/wallet/admin/deposits`, { headers: { Authorization: `Bearer ${token}` } });
export const approveDeposit = (token, id) =>
  axios.post(`${API_BASE}/wallet/admin/deposits/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const rejectDeposit = (token, id) =>
  axios.post(`${API_BASE}/wallet/admin/deposits/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
