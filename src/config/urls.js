/**
 * Application URL Configuration & Redirection Endpoints
 * Centralizes all frontend routing & cross-app URLs for localhost development and deployment.
 */

export const getChatAppUrl = (path = '', userTarget = null) => {
  const cleanPath = path ? (path.startsWith('/') || path.startsWith('?') ? path : `/${path}`) : '';
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHAT_APP_URL)
    ? import.meta.env.VITE_CHAT_APP_URL.replace(/\/+$/, '')
    : 'https://chat.sai.nextarcher.com';
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

export const getMainAppUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') || path.startsWith('?') ? path : `/${path}`) : '';
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAIN_APP_URL)
    ? import.meta.env.VITE_MAIN_APP_URL.replace(/\/+$/, '')
    : 'https://sai.nextarcher.com';
  return `${baseUrl}${cleanPath}`;
};

export const getBackendUrl = (path = '') => {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  // 1. Explicit build-time or runtime environment override
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return `${envUrl.replace(/\/+$/, '')}${cleanPath}`;
  }

  // 2. Client-side runtime detection
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

    // A. If on HTTPS or deployed on production domain (e.g. *.nextarcher.com, *.vercel.app)
    // Always use the live production backend over HTTPS to prevent Safari Mixed Content blocking
    if (!isLocalhost || protocol === 'https:') {
      return `https://compiledchat-production.up.railway.app${cleanPath}`;
    }

    // B. Local network testing (e.g. testing from iPhone or Mac on LAN via 192.168.x.x)
    if (hostname && !isLocalhost) {
      return `${protocol}//${hostname}:4000${cleanPath}`;
    }
  }

  // 3. Local machine desktop fallback
  return `http://localhost:4000${cleanPath}`;
};

export default {
  getChatAppUrl,
  getMainAppUrl,
  getBackendUrl,
};
