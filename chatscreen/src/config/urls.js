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
    const isLanIp = /^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname);

    // A. Local network testing (e.g. testing from iPhone or other device on same WiFi)
    if (isLanIp) {
      return `${protocol}//${hostname}:4000${cleanPath}`;
    }

    // B. Localhost desktop browser
    if (isLocalhost) {
      return `http://localhost:4000${cleanPath}`;
    }

    // C. Production deployment (chat.sai.nextarcher.com, *.vercel.app, etc.)
    // Uses same-origin reverse proxy (/api/...) via vercel.json rewrites to Railway.
    // This completely eliminates Indian ISP DNS blocks (NXDOMAIN) on *.up.railway.app.
    if (protocol === 'https:' || hostname.endsWith('.vercel.app') || hostname.endsWith('.nextarcher.com')) {
      return `${window.location.origin}${cleanPath}`;
    }
  }
  
  return `http://localhost:4000${cleanPath}`;
};

export default {
  getMainAppUrl,
  getBackendUrl,
};
