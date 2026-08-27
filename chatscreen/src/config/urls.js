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
    const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL.trim();
    if (envUrl) return `${envUrl.replace(/\/+$/, '')}${cleanPath}`;
  }

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    // A. If running on HTTPS or deployed on production domain, use live SSL backend
    if (!isLocalhost || protocol === 'https:') {
      return `https://compiledchat-production.up.railway.app${cleanPath}`;
    }

    // B. If testing over LAN from iPhone / other device on same WiFi (192.168.x.x)
    if (hostname && !isLocalhost) {
      return `${protocol}//${hostname}:4000${cleanPath}`;
    }
  }
  
  return `http://localhost:4000${cleanPath}`;
};

export default {
  getMainAppUrl,
  getBackendUrl,
};
