/**
 * Application URL Configuration & Redirection Endpoints
 * Centralizes all frontend routing & cross-app URLs for localhost development and deployment.
 */

export const getChatAppUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') || path.startsWith('?') ? path : `/${path}`) : '';
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHAT_APP_URL)
    ? import.meta.env.VITE_CHAT_APP_URL.replace(/\/+$/, '')
    : 'https://chat.sai.nextarcher.com';
  return `${baseUrl}${cleanPath}`;
};

export const getMainAppUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') || path.startsWith('?') ? path : `/${path}`) : '';
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAIN_APP_URL)
    ? import.meta.env.VITE_MAIN_APP_URL.replace(/\/+$/, '')
    : 'https://sai.nextarcher.com';
  return `${baseUrl}${cleanPath}`;
};

export const getBackendUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
    ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
    : 'http://localhost:4000';
  return `${baseUrl}${cleanPath}`;
};

export default {
  getChatAppUrl,
  getMainAppUrl,
  getBackendUrl,
};
