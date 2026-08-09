/**
 * Snap Kit (Snapchat Login Kit) Integration Service
 * Official Snapchat OAuth 2.0 Login Implementation
 * 
 * Documentation: https://docs.snap.com/snap-kit/login-kit/
 */

const SNAP_AUTH_ENDPOINT = 'https://accounts.snapchat.com/accounts/oauth2/auth';

const SNAP_SCOPES = [
  'https://auth.snapchat.com/oauth2/api/user.display_name',
  'https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar',
  'https://auth.snapchat.com/oauth2/api/user.external_id',
];

export const snapKitService = {
  /**
   * Get configured Snap Kit Client ID from environment or fallback test client ID
   */
  getClientId() {
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_SNAP_CLIENT_ID) {
      return process.env.EXPO_PUBLIC_SNAP_CLIENT_ID;
    }
    return 'demo-snap-kit-client-id-nextarcher';
  },

  /**
   * Get OAuth Redirect URI for current environment
   */
  getRedirectUri() {
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'https://chat.sai.nextarcher.com';
  },

  /**
   * Build official Snapchat Snap Kit OAuth Authorization URL
   */
  buildAuthUrl(customState = '') {
    const clientId = this.getClientId();
    const redirectUri = this.getRedirectUri();
    const state = customState || `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const scopesEncoded = encodeURIComponent(SNAP_SCOPES.join(' '));

    const authUrl = `${SNAP_AUTH_ENDPOINT}?` +
      `response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopesEncoded}` +
      `&state=${encodeURIComponent(state)}`;

    return { authUrl, state, clientId, redirectUri };
  },

  /**
   * Launch Snap Kit OAuth login popup window or external redirect
   */
  openSnapLoginWindow() {
    const { authUrl } = this.buildAuthUrl();

    if (typeof window !== 'undefined') {
      const width = 480;
      const height = 640;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      const popup = window.open(
        authUrl,
        'SnapchatLogin',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );

      return popup;
    }
    return null;
  },

  /**
   * Process OAuth response parameters
   */
  parseOAuthParams(urlStr) {
    try {
      const url = new URL(urlStr || (typeof window !== 'undefined' ? window.location.href : ''));
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (code) {
        return { success: true, code, state };
      }
      if (error) {
        return { success: false, error };
      }
    } catch (_) {}
    return { success: false };
  }
};

export default snapKitService;
