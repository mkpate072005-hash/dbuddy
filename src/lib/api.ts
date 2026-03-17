import supabase from './supabase';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`
  };
}

export async function fetchDatabases() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/databases', { headers });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function createDatabase(name: string, type: string, schema_json: object) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/databases', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, type, schema_json })
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function deleteDatabase(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/databases', {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function fetchQueries(database_id?: string) {
  const headers = await getAuthHeaders();
  const url = database_id ? `/api/queries?database_id=${database_id}` : '/api/queries';
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function saveQuery(database_id: string, natural_language: string, generated_query: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/queries', {
    method: 'POST',
    headers,
    body: JSON.stringify({ database_id, natural_language, generated_query })
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function fetchStats() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/stats', { headers });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function fetchUserSettings() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/user-settings', { headers });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function updateUserSettings(display_name: string, claude_api_key: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/user-settings', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ display_name, claude_api_key })
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function generateSchema(description: string, dbType: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/generate-schema', {
    method: 'POST',
    headers,
    body: JSON.stringify({ description, dbType })
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function translateQuery(naturalLanguage: string, dbType: string, schemaContext: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/translate-query', {
    method: 'POST',
    headers,
    body: JSON.stringify({ naturalLanguage, dbType, schemaContext })
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
