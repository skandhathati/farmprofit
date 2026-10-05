import axios from 'axios';
import { DEFAULT_OPTIONS } from './constants';

const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Global response error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.detail || error.message || 'An unknown error occurred';
    return Promise.reject({ ...error, message });
  }
);

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getOptions = async () => {
  const res = await api.get('/options');
  const data = res.data;
  const optionKeys = ['crops', 'locations', 'seasons', 'soil_types', 'irrigation_types', 'risk_levels', 'profit_statuses'];
  if (!data || optionKeys.some(key => !Array.isArray(data[key]))) {
    throw new Error('The options response from the API is invalid.');
  }
  return {
    ...data,
    yield_units: DEFAULT_OPTIONS.yield_units,
    price_units: DEFAULT_OPTIONS.price_units
  };
};

export const getDashboard = async (filters = {}) => {
  // Strip out empty, null, undefined, "All", or "All <Category>" values
  const cleanFilters = {};
  Object.keys(filters).forEach(k => {
    const val = filters[k];
    if (val !== '' && val !== null && val !== undefined) {
      const strVal = String(val).trim();
      if (strVal && strVal.toLowerCase() !== 'all' && !strVal.toLowerCase().startsWith('all ')) {
        cleanFilters[k] = strVal;
      }
    }
  });
  const res = await api.get('/dashboard', { params: cleanFilters });
  const data = res.data;
  if (!data || typeof data.summary !== 'object' || typeof data.charts !== 'object') {
    throw new Error('The dashboard response from the API is invalid.');
  }
  return data;
};

export const calculateProfit = async (farmData) => {
  const res = await api.post('/calculate', farmData);
  return res.data;
};

export const predictProfit = async (farmData) => {
  const res = await api.post('/predict', farmData);
  return res.data;
};

export const runWhatIf = async (currentData, modifiedData) => {
  const res = await api.post('/what-if', {
    current: currentData,
    modified: modifiedData,
  });
  return res.data;
};

export const getCropComparison = async (crops = []) => {
  const cropsParam = crops.length > 0 ? crops.join(',') : '';
  const res = await api.get('/crop-comparison', {
    params: cropsParam ? { crops: cropsParam } : {},
  });
  const data = res.data;
  if (!data || !Array.isArray(data.crops) || typeof data.highlights !== 'object') {
    throw new Error('The crop comparison response from the API is invalid.');
  }
  return data;
};

export const getModelMetrics = async () => {
  const res = await api.get('/model-metrics');
  const data = res.data;
  if (!data || typeof data.regression_metrics !== 'object' || typeof data.classification_metrics !== 'object') {
    throw new Error('The model metrics response from the API is invalid.');
  }
  return data;
};

export default api;
