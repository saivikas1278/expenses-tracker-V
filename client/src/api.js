import axios from 'axios';
import supabase from './supabaseClient';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export async function getTransactions() {
  const response = await api.get('/transactions');
  return response.data;
}

export async function addTransaction(payload) {
  const response = await api.post('/transactions', payload);
  return response.data;
}

export async function deleteTransaction(id) {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
}

export default api;
