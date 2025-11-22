import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for large file uploads
});

export const invoiceAPI = {
  processInvoices: async (formData) => {
    try {
      const response = await api.post('/invoices/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downloadExcel: async (filename) => {
    try {
      const response = await api.get(`/invoices/export/${filename}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  healthCheck: async () => {
    try {
      const response = await api.get('/invoices/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
