export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured on server.' });

  try {
    const { description, dbType } = req.body;

    const prompt = `You are an expert database architect. Generate a complete production-ready database schema.
For SQL databases (PostgreSQL, MySQL, SQLite), return this exact JSON:
{"tables":[{"name":"table_name","fields":[{"name":"field_name","type":"data_type","constraints":"PRIMARY KEY etc","description":"what it stores"}],"relationships":["relationship description"]}],"sql":"Complete CREATE TABLE SQL"}
For MongoDB, return this exact JSON:
{"collections":[{"name":"collection_name","fields":[{"name":"field_name","type":"data_type","required":true,"description":"what it stores"}],"relationships":["relationship description"]}],"schema":"MongoDB validation JSON"}
Include primary keys, foreign keys, timestamps (created_at, updated_at), proper data types.
Return ONLY valid JSON. No markdown. No explanation. No code blocks.
Create a complete ${dbType} database schema for: ${description}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error('Failed to parse AI response as JSON');
    }

    return res.status(200).json({ schema: parsed });
  } catch (err) {
    console.error('Generate schema error:', err);
    return res.status(500).json({ error: err.message });
  }
}
