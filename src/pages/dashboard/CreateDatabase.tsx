import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, AlertCircle, ChevronDown, Table2, Hash, Key, Link2 } from 'lucide-react';
import { generateSchema, createDatabase, fetchUserSettings } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import CodeBlock from '../../components/CodeBlock';

const DB_TYPES = ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'];

interface SchemaTable {
  name: string;
  fields: { name: string; type: string; constraints?: string; description?: string }[];
  relationships?: string[];
}

interface SchemaResult {
  tables?: SchemaTable[];
  collections?: SchemaTable[];
  sql?: string;
  schema?: string;
}

export default function CreateDatabase() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [dbType, setDbType] = useState('PostgreSQL');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [schemaResult, setSchemaResult] = useState<SchemaResult | null>(null);
  const [dbName, setDbName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) { setError('Please describe your database'); return; }
    setLoading(true);
    setError('');
    setSchemaResult(null);
    setSaved(false);

    try {
      const settings = await fetchUserSettings();
      if (!settings.claude_api_key) {
        setError('Please add your Claude API key in Settings first.');
        setLoading(false);
        return;
      }
      const result = await generateSchema(description, dbType, settings.claude_api_key);
      setSchemaResult(result.schema);
      const tables = result.schema.tables || result.schema.collections || [];
      if (tables.length > 0) {
        setDbName(description.slice(0, 40).replace(/[^a-z0-9\s]/gi, '').trim().replace(/\s+/g, '_').toLowerCase() || 'my_database');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate schema');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!schemaResult || !dbName.trim()) return;
    setSaving(true);
    try {
      await createDatabase(dbName, dbType, schemaResult);
      setSaved(true);
      setTimeout(() => navigate('/dashboard/databases'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save database');
    } finally {
      setSaving(false);
    }
  };

  const tables = schemaResult?.tables || schemaResult?.collections || [];
  const codeContent = schemaResult?.sql || schemaResult?.schema || JSON.stringify(schemaResult, null, 2);
  const isSQL = dbType !== 'MongoDB';

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Create <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Database</span>
        </h1>
        <p className="text-gray-500 text-sm">Describe your database in plain English and let AI generate the schema</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Describe your database</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A fitness tracking app with users, workouts, exercises, and progress logs. Users can follow each other, log daily workouts with sets, reps, and weight, and track personal records over time."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.08)] transition-all leading-relaxed placeholder-gray-600"
              rows={5}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <select
                value={dbType}
                onChange={e => setDbType(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-300 focus:outline-none focus:border-cyan-400/50 transition-all cursor-pointer"
              >
                {DB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            <GlowButton variant="primary" onClick={handleGenerate} loading={loading}>
              <span className="flex items-center gap-2"><Sparkles size={16} /> Generate Schema</span>
            </GlowButton>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <Sparkles size={20} className="absolute inset-0 m-auto text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">AI is analyzing your description...</p>
                  <p className="text-gray-500 text-sm mt-1">Generating optimized schema with Claude</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {schemaResult && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Visual Schema */}
            {tables.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Schema Diagram — {tables.length} {dbType === 'MongoDB' ? 'Collections' : 'Tables'}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table: SchemaTable, i: number) => (
                    <motion.div
                      key={table.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <GlassCard className="overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 bg-cyan-400/5 flex items-center gap-2">
                          <Table2 size={14} className="text-cyan-400" />
                          <span className="text-cyan-400 font-mono font-semibold text-sm">{table.name}</span>
                        </div>
                        <div className="p-3 space-y-1.5">
                          {table.fields?.slice(0, 8).map((field, fi: number) => (
                            <div key={fi} className="flex items-center gap-2 text-xs">
                              {field.constraints?.includes('PRIMARY') ? (
                                <Key size={10} className="text-yellow-400 shrink-0" />
                              ) : field.constraints?.includes('REFERENCES') || field.name.endsWith('_id') ? (
                                <Link2 size={10} className="text-violet-400 shrink-0" />
                              ) : (
                                <Hash size={10} className="text-gray-600 shrink-0" />
                              )}
                              <span className="text-gray-300 font-mono">{field.name}</span>
                              <span className="text-gray-600 ml-auto font-mono">{field.type}</span>
                            </div>
                          ))}
                          {(table.fields?.length || 0) > 8 && (
                            <div className="text-xs text-gray-600 pt-1">+{table.fields.length - 8} more fields</div>
                          )}
                        </div>
                        {table.relationships && table.relationships.length > 0 && (
                          <div className="px-3 pb-3">
                            {table.relationships.slice(0, 2).map((rel: string, ri: number) => (
                              <div key={ri} className="text-xs text-violet-400/70 font-mono truncate">{rel}</div>
                            ))}
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SQL/JSON Code */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Generated {isSQL ? 'SQL' : 'Schema'}
              </h2>
              <CodeBlock code={codeContent} language={isSQL ? 'sql' : 'json'} />
            </div>

            {/* Save */}
            <GlassCard className="p-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm text-gray-400 mb-1.5 block">Database Name</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={e => setDbName(e.target.value)}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all w-full sm:w-64"
                    placeholder="my_database"
                  />
                </div>
                <GlowButton
                  variant={saved ? 'secondary' : 'primary'}
                  onClick={handleSave}
                  loading={saving}
                  disabled={saved}
                >
                  <span className="flex items-center gap-2">
                    <Save size={16} />
                    {saved ? '✓ Saved!' : 'Save to My Databases'}
                  </span>
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
