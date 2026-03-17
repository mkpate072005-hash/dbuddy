export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured on server.' });

  try {
    const { naturalLanguage, dbType, schemaContext } = req.body;

    const prompt = `You are an expert database query translator. Convert natural language to a precise database query.
For SQL databases (PostgreSQL, MySQL, SQLite): Return a valid SQL SELECT/INSERT/UPDATE/DELETE statement.
For MongoDB: Return a valid MongoDB query as db.collection.find() or aggregate() call.
Rules:
- Return ONLY the query, no explanation, no markdown code blocks
- Use proper syntax for ${dbType}
- Use realistic table/collection names from the schema context if provided
- Add proper JOINs, WHERE clauses, ORDER BY, LIMIT as needed
${schemaContext ? `Schema context: ${schemaContext}` : ''}
Translate this to a ${dbType} query: "${naturalLanguage}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    let query = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    query = query.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

    return res.status(200).json({ query });
  } catch (err) {
    console.error('Translate query error:', err);
    return res.status(500).json({ error: err.message });
  }
}
