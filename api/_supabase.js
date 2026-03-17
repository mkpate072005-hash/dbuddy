import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, anonKey);
}

export async function getUserFromToken(token) {
  try {
    // Decode JWT payload without verification to get user ID
    const parts = token.split('.');
    if (parts.length !== 3) return { user: null, error: { message: 'Invalid token format' } };
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.sub) return { user: null, error: { message: 'No user ID in token' } };
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { user: null, error: { message: 'Token expired' } };
    }
    return { user: { id: payload.sub, email: payload.email }, error: null };
  } catch (e) {
    return { user: null, error: { message: e.message } };
  }
}

export default getSupabaseAdmin();
