/**
 * Unified API Client for NextArcher / Spiritualize AI
 * Connects frontend to local Node Express backend (http://localhost:4000)
 * with graceful fallback to client-side localStorage for guest users.
 */

import { getBackendUrl } from '../config/urls';

const API_BASE_URL = getBackendUrl('/api');

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const apiClient = {
  // 1. Auth Endpoints
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem('jwt_token', data.access_token);
        localStorage.setItem('user_profile', JSON.stringify(data.user));
      }
      return { ok: response.ok, data };
    } catch (err) {
      console.warn('[API Client] Register offline mode fallback:', err.message);
      return { ok: false, error: err.message };
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem('jwt_token', data.access_token);
        localStorage.setItem('user_profile', JSON.stringify(data.user));
      }
      return { ok: response.ok, data };
    } catch (err) {
      console.warn('[API Client] Login error:', err.message);
      return { ok: false, error: err.message };
    }
  },

  async getMe() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  },

  // 2. Chat Endpoints
  async sendMessage(sessionId, message) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      // Guest mode fallback -> stored in localStorage only
      const mockReply = message.toLowerCase().includes('happy') 
        ? "I'm glad you're feeling happy! What made your day enjoyable?"
        : "Thank you for sharing. How does your inner energy center feel right now?";
      return { ok: true, data: { reply: mockReply, message_id: `guest_${Date.now()}` } };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      return { ok: response.ok, data: await response.json() };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  // 3. Dashboard Telemetry Endpoints
  async getTelemetry() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/telemetry`, {
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  },

  async updateWorldBalance(businessPct, familyPct, friendPct) {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/world-balance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          business_pct: businessPct,
          family_pct: familyPct,
          friend_pct: friendPct,
        }),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  },

  // 4. Digital Twin Endpoints
  async getTwinProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/twin/profile`, {
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  },

  async updateTwinProfile(payload) {
    try {
      const response = await fetch(`${API_BASE_URL}/twin/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (err) {
      return null;
    }
  }
};

export default apiClient;
