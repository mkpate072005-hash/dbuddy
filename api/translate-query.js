import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(400).json({ error: 'Claude API key required. Add it in Settings.' });

  try {
    const { naturalLanguage, dbType, schemaContext } = req.body;
    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are an expert database query translator. Convert natural language questions into precise database queries.

For SQL databases (PostgreSQL, MySQL, SQLite): Return a valid SQL SELECT/INSERT/UPDATE/DELETE statement.
For MongoDB: Return a valid MongoDB query as a db.collection.find() or aggregate() call.

Rules:
- Return ONLY the query, no explanation, no markdown code blocks
- Use proper syntax for the specific database type
- Use realistic table/collection names from the schema context if provided
- Add proper JOINs, WHERE clauses, ORDER BY, LIMIT as needed
- Use database-appropriate functions (e.g., NOW() for MySQL, CURRENT_TIMESTAMP for SQLite)`;

    const userMessage = `Database type: ${dbType}
${schemaContext ? `Schema context: ${schemaContext}` : ''}

Translate this to a ${dbType} query: "${naturalLanguage}"`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const query = message.content[0].text.trim();
    return res.status(200).json({ query });
  } catch (err) {
    console.error('Translate query error:', err);
    if (err.status === 401) return res.status(401).json({ error: 'Invalid Claude API key' });
    return res.status(500).json({ error: err.message });
  }
}
