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
    const { description, dbType } = req.body;
    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are an expert database architect. When given a plain English description of an application, you generate a complete, production-ready database schema.

For SQL databases (PostgreSQL, MySQL, SQLite), return:
1. A JSON array of tables with this structure:
{
  "tables": [
    {
      "name": "table_name",
      "fields": [
        { "name": "field_name", "type": "data_type", "constraints": "PRIMARY KEY / NOT NULL / etc", "description": "what this field stores" }
      ],
      "relationships": ["describes relationships to other tables"]
    }
  ],
  "sql": "Complete CREATE TABLE SQL statements"
}

For MongoDB, return:
{
  "collections": [
    {
      "name": "collection_name",
      "fields": [
        { "name": "field_name", "type": "data_type", "required": true/false, "description": "what this field stores" }
      ],
      "relationships": ["describes relationships"]
    }
  ],
  "schema": "MongoDB schema validation JSON"
}

Always include:
- Proper primary keys and foreign keys
- Timestamps (created_at, updated_at) on all tables
- Indexes on frequently queried fields
- Appropriate data types for the database type
- Realistic field names following conventions

Return ONLY valid JSON, no markdown, no explanation.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a complete ${dbType} database schema for: ${description}`
        }
      ]
    });

    const content = message.content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return res.status(200).json({ schema: parsed });
  } catch (err) {
    console.error('Generate schema error:', err);
    if (err.status === 401) return res.status(401).json({ error: 'Invalid Claude API key' });
    return res.status(500).json({ error: err.message });
  }
}
