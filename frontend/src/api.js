import axios from 'axios';
import { getShopifyFeaturedProducts, getShopifyProductByHandle, getShopifyProducts, isShopifyConfigured } from './shopify/storefront';

const api = axios.create({ baseURL: '/api' });
const TOKEN_KEY = 'kioluna_token';
const LEGACY_TOKEN_KEY = 'shopwave_token';
const LEGACY_USER_KEY = 'shopwave_user';

api.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  if (token && !localStorage.getItem(TOKEN_KEY)) localStorage.setItem(TOKEN_KEY, token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem('kioluna_user');
      localStorage.removeItem(LEGACY_USER_KEY);
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile')) {
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productsAPI = {
  getAll: (params) => isShopifyConfigured ? getShopifyProducts(params) : api.get('/products', { params }),
  getFeatured: () => isShopifyConfigured ? getShopifyFeaturedProducts() : api.get('/products/featured'),
  getById: (id) => isShopifyConfigured ? getShopifyProductByHandle(id) : api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id, token) => api.get(`/orders/${id}`, { params: token ? { token } : undefined }),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
