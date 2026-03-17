import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Search } from 'lucide-react';
import { fetchDatabases, saveQuery, translateQuery } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import CodeBlock from '../../components/CodeBlock';

interface DB {
  id: string;
  name: string;
  type: string;
  schema_json: object;
}

export default function QueryBuilder() {
  const [databases, setDatabases] = useState<DB[]>([]);
  const [selectedDb, setSelectedDb] = useState<DB | null>(null);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDatabases().then(data => {
      setDatabases(data);
      if (data.length > 0) setSelectedDb(data[0]);
    }).catch(console.error);
  }, []);

  const handleTranslate = async () => {
    if (!naturalLanguage.trim()) { setError('Please enter a query description'); return; }
    setLoading(true);
    setError('');
    setGeneratedQuery('');

    try {
      const schemaContext = selectedDb ? JSON.stringify(selectedDb.schema_json).slice(0, 2000) : '';
      const dbType = selectedDb?.type || 'PostgreSQL';
      const result = await translateQuery(naturalLanguage, dbType, schemaContext);
      setGeneratedQuery(result.query);
      if (selectedDb) {
        await saveQuery(selectedDb.id, naturalLanguage, result.query).catch(console.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to translate query');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Query <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Builder</span>
        </h1>
        <p className="text-gray-500 text-sm">Write queries in plain English and get SQL instantly</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          {databases.length > 0 && (
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">Select Database</label>
              <select
                value={selectedDb?.id || ''}
                onChange={e => setSelectedDb(databases.find(d => d.id === e.target.value) || null)}
                className="appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-400/50 transition-all cursor-pointer w-full sm:w-auto"
              >
                {databases.map(db => (
                  <option key={db.id} value={db.id}>{db.name} ({db.type})</option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Describe your query</label>
            <textarea
              value={naturalLanguage}
              onChange={e => setNaturalLanguage(e.target.value)}
              placeholder="Show me all users who signed up in the last 30 days and have made at least one purchase"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.08)] transition-all leading-relaxed placeholder-gray-600"
              rows={4}
            />
          </div>

          <GlowButton variant="primary" onClick={handleTranslate} loading={loading}>
            <span className="flex items-center gap-2"><Search size={16} /> Translate Query</span>
          </GlowButton>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {generatedQuery && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Generated Query</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <CodeBlock code={generatedQuery} language={selectedDb?.type === 'MongoDB' ? 'javascript' : 'sql'} />
        </motion.div>
      )}

      {databases.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-12 text-center">
            <Sparkles size={28} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No databases yet</h3>
            <p className="text-gray-500 text-sm">Create a database first to use the query builder</p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
