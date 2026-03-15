import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Copy, Check, Clock, ChevronDown, PlayCircle, Table } from 'lucide-react';
import { fetchDatabases, translateQuery, saveQuery, fetchQueries, fetchUserSettings } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import CodeBlock from '../../components/CodeBlock';

interface DB {
  id: string;
  name: string;
  type: string;
  schema_json: { tables?: { name: string; fields: { name: string; type: string }[] }[]; collections?: { name: string; fields: { name: string; type: string }[] }[] };
}

interface QueryHistory {
  id: string;
  natural_language: string;
  generated_query: string;
  created_at: string;
  databases?: { name: string; type: string };
}

const MOCK_RESULTS = [
  { id: 1, email: 'alice@example.com', display_name: 'Alice Johnson', created_at: '2025-01-15' },
  { id: 2, email: 'bob@example.com', display_name: 'Bob Smith', created_at: '2025-01-18' },
  { id: 3, email: 'carol@example.com', display_name: 'Carol White', created_at: '2025-01-22' },
];

export default function QueryBuilder() {
  const [databases, setDatabases] = useState<DB[]>([]);
  const [selectedDb, setSelectedDb] = useState<DB | null>(null);
  const [naturalQuery, setNaturalQuery] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDatabases().then(dbs => {
      setDatabases(dbs);
      if (dbs.length > 0) setSelectedDb(dbs[0]);
    }).catch(console.error);
    fetchQueries().then(setHistory).catch(console.error);
  }, []);

  const buildSchemaContext = (db: DB) => {
    const tables = db.schema_json?.tables || db.schema_json?.collections || [];
    return tables.map((t: { name: string; fields: { name: string; type: string }[] }) =>
      `${t.name}(${t.fields?.map((f: { name: string; type: string }) => `${f.name} ${f.type}`).join(', ')})`
    ).join('\n');
  };

  const handleTranslate = async () => {
    if (!naturalQuery.trim()) { setError('Please enter a query'); return; }
    if (!selectedDb) { setError('Please select a database'); return; }
    setLoading(true);
    setError('');
    setShowResults(false);

    try {
      const settings = await fetchUserSettings();
      if (!settings.claude_api_key) {
        setError('Please add your Claude API key in Settings first.');
        setLoading(false);
        return;
      }
      const schemaCtx = buildSchemaContext(selectedDb);
      const result = await translateQuery(naturalQuery, selectedDb.type, schemaCtx, settings.claude_api_key);
      setGeneratedQuery(result.query);
      await saveQuery(selectedDb.id, naturalQuery, result.query);
      fetchQueries().then(setHistory).catch(console.error);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Query <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Builder</span>
        </h1>
        <p className="text-gray-500 text-sm">Translate natural language to SQL or MongoDB queries</p>
      </motion.div>

      {/* Database Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 shrink-0">Database:</span>
            <div className="relative flex-1 max-w-xs">
              <select
                value={selectedDb?.id || ''}
                onChange={e => setSelectedDb(databases.find(db => db.id === e.target.value) || null)}
                className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 pr-8 text-sm text-gray-300 focus:outline-none focus:border-cyan-400/50 transition-all"
              >
                {databases.length === 0 ? (
                  <option>No databases — create one first</option>
                ) : (
                  databases.map(db => <option key={db.id} value={db.id}>{db.name} ({db.type})</option>)
                )}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Query Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Search size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Natural Language</h2>
            </div>
            <textarea
              value={naturalQuery}
              onChange={e => setNaturalQuery(e.target.value)}
              placeholder="Show me all users who signed up in the last 30 days, ordered by creation date..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.08)] transition-all leading-relaxed placeholder-gray-600 mb-4"
              rows={6}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTranslate(); }}
            />

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            <GlowButton variant="primary" onClick={handleTranslate} loading={loading} className="w-full">
              <span className="flex items-center gap-2 justify-center"><Sparkles size={16} /> Translate Query</span>
            </GlowButton>
            <p className="text-xs text-gray-600 text-center mt-2">⌘+Enter to translate</p>
          </GlassCard>
        </motion.div>

        {/* Output */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Generated Query</h2>
              </div>
              {generatedQuery && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Translating with Claude...</p>
              </div>
            ) : generatedQuery ? (
              <div className="space-y-4">
                <CodeBlock
                  code={generatedQuery}
                  language={selectedDb?.type === 'MongoDB' ? 'javascript' : 'sql'}
                />
                <GlowButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowResults(!showResults)}
                >
                  <span className="flex items-center gap-2 justify-center">
                    <PlayCircle size={16} /> {showResults ? 'Hide' : 'Run'} Query (Demo)
                  </span>
                </GlowButton>

                {showResults && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/10">
                        <Table size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">3 rows returned (demo)</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/10">
                              {Object.keys(MOCK_RESULTS[0]).map(k => (
                                <th key={k} className="text-left px-4 py-2 text-cyan-400 font-medium">{k}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {MOCK_RESULTS.map(row => (
                              <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                {Object.values(row).map((v, i) => (
                                  <td key={i} className="px-4 py-2 text-gray-400">{String(v)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-600">
                <Sparkles size={24} className="text-gray-700" />
                <p className="text-sm">Query will appear here</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Query History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={14} /> Query History
          </h2>
          <div className="space-y-3">
            {history.slice(0, 8).map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard className="p-4" hover>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{q.natural_language}</p>
                      <p className="text-gray-600 text-xs font-mono mt-1 truncate">{q.generated_query}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {q.databases && (
                        <span className="text-xs text-gray-600 hidden sm:block">{q.databases.name}</span>
                      )}
                      <span className="text-xs text-gray-700">{new Date(q.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => { setNaturalQuery(q.natural_language); setGeneratedQuery(q.generated_query); }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Reuse
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
