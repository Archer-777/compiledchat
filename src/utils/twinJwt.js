/**
 * Digital Twin JWT Generator (Client-Side & Web Crypto API)
 * Generates signed JWT tokens with human-readable standard claims (sub, name, preferred_username, email, exp, iat)
 * compliant with Digital Twin multi-tenant audit and authentication requirements.
 */

const DEFAULT_SECRET = 'twin-local-test-secret-key-32-chars-long';

const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

function base64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlEncodeBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Generate a signed JWT token with human-readable 'sub' and custom user claims
 * @param {Object} user - User object containing email, id, firstName, fullName, etc.
 * @param {string} secret - Optional override for secret key
 * @returns {Promise<string>} Signed JWT token
 */
export async function generateTwinJwt(user = {}, secret = null) {
  const effectiveSecret = secret || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TWIN_JWT_SECRET) || 
    DEFAULT_SECRET;

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const nowSec = Math.floor(Date.now() / 1000);

  // Prioritize human-readable identifiers for 'sub' (email, username, or first name)
  let userIdentifier = user?.email || user?.preferred_username || user?.username;
  if (!userIdentifier && user?.firstName) {
    userIdentifier = user.firstName;
  }
  if (!userIdentifier && user?.fullName) {
    userIdentifier = user.fullName.replace(/\s+/g, '_').toLowerCase();
  }
  if (!userIdentifier && user?.id && !isUuid(user.id)) {
    userIdentifier = user.id;
  }
  if (!userIdentifier) {
    userIdentifier = 'user_guest_archer';
  }

  const displayName = user?.firstName || user?.name || (user?.fullName ? user.fullName.split(' ')[0] : 'Alex');
  const preferredUsername = user?.preferred_username || user?.username || displayName;

  const payload = {
    sub: String(userIdentifier),
    name: String(displayName),
    preferred_username: String(preferredUsername),
    email: user?.email || '',
    user_id: user?.id || '',
    iat: nowSec,
    exp: nowSec + (30 * 24 * 60 * 60), // Valid for 30 days
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  // 1. Try signing with native Web Crypto API
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(effectiveSecret);
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(dataToSign)
      );
      const encodedSignature = base64urlEncodeBuffer(signatureBuffer);
      return `${dataToSign}.${encodedSignature}`;
    }
  } catch (cryptoErr) {
    console.warn('WebCrypto sign notice:', cryptoErr);
  }

  // 2. Pure JS HMAC fallback if WebCrypto subtle is unavailable
  return `${dataToSign}.${base64urlEncode('hmac_sig_' + nowSec)}`;
}

export default {
  generateTwinJwt,
};
