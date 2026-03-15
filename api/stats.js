import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    const [{ count: dbCount }, { count: queryCount }, { data: lastQuery }] = await Promise.all([
      supabase.from('databases').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('queries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('queries').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
    ]);

    return res.status(200).json({
      total_databases: dbCount || 0,
      queries_run: queryCount || 0,
      last_active: lastQuery?.[0]?.created_at || null,
      storage_used: `${((dbCount || 0) * 0.024).toFixed(2)} MB`
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
