import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ML_URL = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? `Bearer ${session.access_token}` : '';
}

export const api = {
  async getTransactions() {
    const token = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/transactions`, {
      headers: { Authorization: token }
    });
    return res.json();
  },

  async createTransaction(data: Record<string, unknown>) {
    const token = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteTransaction(id: string) {
    const token = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    return res.json();
  },

  async getStats() {
    const token = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/transactions/stats/summary`, {
      headers: { Authorization: token }
    });
    return res.json();
  },

  async uploadCSV(file: File) {
    const token = await getAuthHeader();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/upload/csv`, {
      method: 'POST',
      headers: { Authorization: token },
      body: formData
    });
    return res.json();
  },

  async getInsights() {
    const token = await getAuthHeader();
    const res = await fetch(`${ML_URL}/api/ml/insights`, {
      headers: { Authorization: token }
    });
    return res.json();
  },

  async getForecast() {
    const token = await getAuthHeader();
    const res = await fetch(`${ML_URL}/api/ml/forecast`, {
      headers: { Authorization: token }
    });
    return res.json();
  },
};