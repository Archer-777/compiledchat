/**
 * Chat Screen URL Configuration & Navigation Endpoints
 * Centralizes all redirections back to the main app & backend API endpoints.
 */

export const getMainAppUrl = (path = '', userTarget = null) => {
  const cleanPath = path ? (path.startsWith('/') || path.startsWith('?') ? path : `/${path}`) : '';
  
  let baseUrl = 'https://sai.nextarcher.com';
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MAIN_APP_URL) {
    baseUrl = process.env.EXPO_PUBLIC_MAIN_APP_URL.replace(/\/+$/, '');
  }

  let finalUrl = `${baseUrl}${cleanPath}`;

  // Automatically attach active user session query parameters to prevent cross-subdomain auth drops
  try {
    let email = userTarget?.email || '';
    let firstName = userTarget?.firstName || userTarget?.fullName || '';

    if (!email && typeof window !== 'undefined' && window.localStorage) {
      const activeAuth = window.localStorage.getItem('@active_auth_session') || window.localStorage.getItem('@spiritual_register_user');
      if (activeAuth) {
        try {
          const parsed = JSON.parse(activeAuth);
          email = parsed.email || '';
          firstName = parsed.firstName || (parsed.fullName ? parsed.fullName.split(' ')[0] : '');
        } catch (e) {}
      }
    }

    if (!email && typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      email = urlParams.get('email') || '';
      firstName = urlParams.get('firstName') || '';
    }

    if (email) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      const cleanEmail = encodeURIComponent(email);
      const cleanFirst = encodeURIComponent(firstName || 'Archer');
      if (!finalUrl.includes('email=')) {
        finalUrl += `${separator}email=${cleanEmail}&firstName=${cleanFirst}`;
      }
    }
  } catch (err) {}

  return finalUrl;
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
