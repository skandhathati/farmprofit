import axios from 'axios';
import { DEFAULT_OPTIONS } from './constants';
import { computeClientDashboard } from './datasetService';

const API_BASE = '/api';

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
  try {
    const res = await api.get('/options');
    if (res.data && Object.keys(res.data).length > 0) {
      return {
        crops: res.data.crops?.length ? res.data.crops : DEFAULT_OPTIONS.crops,
        locations: res.data.locations?.length ? res.data.locations : DEFAULT_OPTIONS.locations,
        seasons: res.data.seasons?.length ? res.data.seasons : DEFAULT_OPTIONS.seasons,
        soil_types: res.data.soil_types?.length ? res.data.soil_types : DEFAULT_OPTIONS.soil_types,
        irrigation_types: res.data.irrigation_types?.length ? res.data.irrigation_types : DEFAULT_OPTIONS.irrigation_types,
        risk_levels: res.data.risk_levels?.length ? res.data.risk_levels : DEFAULT_OPTIONS.risk_levels,
        profit_statuses: res.data.profit_statuses?.length ? res.data.profit_statuses : DEFAULT_OPTIONS.profit_statuses,
        yield_units: DEFAULT_OPTIONS.yield_units,
        price_units: DEFAULT_OPTIONS.price_units
      };
    }
    return DEFAULT_OPTIONS;
  } catch (err) {
    console.warn("Using default options fallback:", err);
    return DEFAULT_OPTIONS;
  }
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
  try {
    const res = await api.get('/dashboard', { params: cleanFilters });
    return res.data;
  } catch (err) {
    console.warn("Backend /dashboard unreachable, using client-side dataset calculation:", err);
    return computeClientDashboard(cleanFilters);
  }
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
  return res.data;
};

import metricsDataFallback from './metricsData.json';

export const getModelMetrics = async () => {
  try {
    const res = await api.get('/model-metrics');
    return res.data;
  } catch (err) {
    console.warn("Backend /model-metrics unreachable, using embedded metrics data:", err);
    return metricsDataFallback;
  }
};

export default api;
