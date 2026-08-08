import { supabase, isSupabaseConfigured } from './supabaseClient';
import faceService from './faceRecognitionService';

let isSeeded = false;

export async function seedAnishProfile() {
  if (isSeeded) return;
  isSeeded = true;

  console.log('[Seed] Starting Anish Maurya profile & face descriptor seeding...');

  // Generate 128-D vector descriptor
  const embedding = Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.25 + 0.05);

  const anishUserId = 'a0a0a0a0-8888-4444-9999-000000000001';
  const anishEmail = 'anish.maurya@nextarcher.com';
  const now = new Date().toISOString();

  const userRecord = {
    id: anishUserId,
    email: anishEmail,
    password_hash: '$2b$12$AnishMauryaSecureHash2026WithSaltKey99',
    first_name: 'Anish',
    last_name: 'Maurya',
    age: 24,
    gender: 'male',
    profession: 'AI Engineer & System Architect',
    phone: '+91 9876543210',
    phone_verified: true,
    email_verified: true,
    updated_at: now,
  };

  const twinRecord = {
    user_id: anishUserId,
    twin_name: 'Anish_2.0',
    photo_url: '/anish_maurya.jpg',
    bw_filter: 'dramatic',
    sacred_ring: 'halo',
    glow_intensity: 92,
    updated_at: now,
  };

  const faceRecord = {
    user_id: anishUserId,
    embedding: JSON.stringify(embedding),
    device: 'web',
  };

  const auraPayload = {
    id: 'aura_anish_maurya_profile',
    image: '/anish_maurya.jpg',
    signature: { descriptor: embedding, emotion: { expression: 'neutral', probability: 0.98 } },
    frequency: '963Hz - Violet Crown Aura',
    resonance_score: 99.2,
    created_at: now,
  };

  // 2. Local Storage Seeding for Offline & Instant Browser Use
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('@spiritual_register_user', JSON.stringify({
        firstName: 'Anish',
        lastName: 'Maurya',
        fullName: 'Anish Maurya',
        email: anishEmail,
        age: '24',
        gender: 'male',
        profession: 'AI Engineer',
        phone: '+91 9876543210',
        isGuest: false,
        registeredAt: now,
      }));

      window.localStorage.setItem('@active_auth_session', JSON.stringify({
        firstName: 'Anish',
        email: anishEmail,
        isGuest: false,
      }));

      window.localStorage.setItem('spiritualize_user_aura', JSON.stringify(auraPayload));
      
      const existingList = JSON.parse(window.localStorage.getItem('spiritualize_user_auras_list') || '[]');
      const filtered = existingList.filter(item => item.id !== auraPayload.id);
      filtered.unshift(auraPayload);
      window.localStorage.setItem('spiritualize_user_auras_list', JSON.stringify(filtered.slice(0, 10)));

      console.log('[Seed] LocalStorage successfully seeded for Anish Maurya!');
    }
  } catch (err) {
    console.warn('[Seed] LocalStorage write error:', err);
  }

  // 3. Supabase Database Upsert
  if (isSupabaseConfigured) {
    try {
      // Upsert User
      const { data: uData, error: userErr } = await supabase.from('users').upsert([userRecord], { onConflict: 'email' }).select();
      if (userErr) console.warn('[Seed DB Users Error]:', userErr.message);
      else console.log('[Seed DB Users]: Successfully upserted Anish Maurya user record.', uData);

      const activeUserId = uData && uData[0] ? uData[0].id : anishUserId;

      // Upsert Digital Twin
      const { error: twinErr } = await supabase.from('digital_twins').upsert([{ ...twinRecord, user_id: activeUserId }], { onConflict: 'user_id' });
      if (twinErr) console.warn('[Seed DB DigitalTwins Error]:', twinErr.message);
      else console.log('[Seed DB DigitalTwins]: Successfully upserted Anish_2.0 profile.');

      // Upsert Face Descriptor
      const { error: faceErr } = await supabase.from('face_descriptors').upsert([{ ...faceRecord, user_id: activeUserId }], { onConflict: 'user_id' });
      if (faceErr) console.warn('[Seed DB FaceDescriptors Error]:', faceErr.message);
      else console.log('[Seed DB FaceDescriptors]: Successfully upserted 128-D face descriptor.');

      return { success: true, user: userRecord, embeddingLength: embedding.length };
    } catch (dbErr) {
      console.warn('[Seed Supabase Error]:', dbErr);
    }
  }

  return { success: true, localOnly: true, user: userRecord };
}
