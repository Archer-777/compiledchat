/**
 * Chat Screen URL Configuration & Navigation Endpoints
 * Centralizes all redirections back to the main app & backend API endpoints.
 */

export const getMainAppUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') || path.startsWith('?') ? path : `/${path}`) : '';
  
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MAIN_APP_URL) {
    return `${process.env.EXPO_PUBLIC_MAIN_APP_URL.replace(/\/+$/, '')}${cleanPath}`;
  }
  
  return `https://sai.nextarcher.com${cleanPath}`;
};

export const getBackendUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_BACKEND_URL) {
    return `${process.env.EXPO_PUBLIC_BACKEND_URL.replace(/\/+$/, '')}${cleanPath}`;
  }
  
  return `http://localhost:4000${cleanPath}`;
};

export default {
  getMainAppUrl,
  getBackendUrl,
};
