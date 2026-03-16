import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // Use anon key with user's token for RLS, service key as fallback
  const supabase = createClient(supabaseUrl, serviceKey || anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Verify the token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(data || { user_id: user.id, display_name: '', claude_api_key: '' });
    }

    if (req.method === 'PUT') {
      const { display_name, claude_api_key } = req.body;
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, display_name, claude_api_key, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('User settings error:', err);
    res.status(500).json({ error: err.message });
  }
}
