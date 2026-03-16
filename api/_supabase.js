import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey);
}

export async function getUserFromToken(token) {
  // Create a client with the user's token to verify it
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: { user }, error } = await userClient.auth.getUser(token);
  return { user, error };
}

export default getSupabaseAdmin();
