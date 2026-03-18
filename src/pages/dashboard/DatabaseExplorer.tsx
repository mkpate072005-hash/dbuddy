import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Plus, Trash2, Search, History, Eye, BarChart2, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import { fetchDatabases, translateQuery, saveQuery, fetchQueries } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';

interface Field {
  name: string;
  type: string;
  constraints?: string;
  required?: boolean;
}

interface Table {
  name: string;
  fields: Field[];
  relationships?: string[];
}

interface DB {
  id: string;
  name: string;
  type: string;
  schema_json: {
    tables?: Table[];
    collections?: Table[];
    sql?: string;
    schema?: string;
  };
  created_at: string;
}

interface Row {
  [key: string]: string | number | boolean | null;
}

interface QueryRecord {
  id: string;
  natural_language: string;
  generated_query: string;
  created_at: string;
}

const DB_COLORS: Record<string, string> = {
  PostgreSQL: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  MySQL: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MongoDB: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  SQLite: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

export default function DatabaseExplorer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [db, setDb] = useState<DB | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [activeTab, setActiveTab] = useState<'explorer' | 'query' | 'history' | 'schema' | 'optimization'>('explorer');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState('');
  const [copied, setCopied] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryRecord[]>([]);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [newRow, setNewRow] = useState<Row>({});
  const [mockData, setMockData] = useState<Record<string, Row[]>>({});

  useEffect(() => {
    fetchDatabases().then(dbs => {
      const found = dbs.find((d: DB) => d.id === id);
      if (!found) { navigate('/dashboard/databases'); return; }
      setDb(found);
      const t = found.schema_json?.tables || found.schema_json?.collections || [];
      setTables(t);
      if (t.length > 0) setSelectedTable(t[0]);
    }).catch(console.error);

    fetchQueries(id).then(setQueryHistory).catch(console.error);
  }, [id, navigate]);

  useEffect(() => {
    if (selectedTable) {
      setRows(mockData[selectedTable.name] || []);
      setNewRow({});
      setShowInsertForm(false);
    }
  }, [selectedTable]);

  const handleGenerateMockData = () => {
    if (!selectedTable) return;
    const generated: Row[] = Array.from({ length: 5 }, (_, i) => {
      const row: Row = {};
      selectedTable.fields.forEach(f => {
        const n = f.name.toLowerCase();
        if (n === 'id') row[f.name] = i + 1;
        else if (n.includes('email')) row[f.name] = `user${i + 1}@example.com`;
        else if (n.includes('name') && n.includes('first')) row[f.name] = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'][i];
        else if (n.includes('name') && n.includes('last')) row[f.name] = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i];
        else if (n.includes('name')) row[f.name] = `${selectedTable.name}_${i + 1}`;
        else if (n.includes('title')) row[f.name] = `Sample Title ${i + 1}`;
        else if (n.includes('price') || n.includes('salary') || n.includes('amount')) row[f.name] = Math.floor(Math.random() * 1000) + 100;
        else if (n.includes('age')) row[f.name] = Math.floor(Math.random() * 40) + 20;
        else if (n.includes('count') || n.includes('quantity')) row[f.name] = Math.floor(Math.random() * 100);
        else if (n.includes('_at') || n.includes('date')) row[f.name] = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        else if (n.includes('_id')) row[f.name] = i + 1;
        else if (n.includes('active') || n.includes('enabled')) row[f.name] = true;
        else if (f.type?.toLowerCase().includes('int') || f.type?.toLowerCase().includes('number')) row[f.name] = i + 1;
        else if (f.type?.toLowerCase().includes('bool')) row[f.name] = i % 2 === 0;
        else row[f.name] = `${f.name}_value_${i + 1}`;
      });
      return row;
    });
    const updated = { ...mockData, [selectedTable.name]: generated };
    setMockData(updated);
    setRows(generated);
  };

  const handleInsertRow = () => {
    if (!selectedTable) return;
    const updated = [...rows, { ...newRow, id: rows.length + 1 }];
    const updatedMock = { ...mockData, [selectedTable.name]: updated };
    setMockData(updatedMock);
    setRows(updated);
    setNewRow({});
    setShowInsertForm(false);
  };

  const handleDeleteRow = (index: number) => {
    if (!selectedTable) return;
    const updated = rows.filter((_, i) => i !== index);
    const updatedMock = { ...mockData, [selectedTable.name]: updated };
    setMockData(updatedMock);
    setRows(updated);
  };

  const handleTranslate = async () => {
    if (!naturalQuery.trim() || !db) return;
    setQueryLoading(true);
    setQueryError('');
    try {
      const schemaContext = JSON.stringify(db.schema_json).slice(0, 2000);
      const result = await translateQuery(naturalQuery, db.type, schemaContext);
      setGeneratedQuery(result.query);
      await saveQuery(db.id, naturalQuery, result.query).catch(console.error);
      fetchQueries(id).then(setQueryHistory).catch(console.error);
    } catch (err: unknown) {
      setQueryError(err instanceof Error ? err.message : 'Failed to translate');
    } finally {
      setQueryLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOptimizationTips = () => {
    if (!tables.length) return [];
    const tips: { title: string; desc: string; priority: 'high' | 'medium' | 'low' }[] = [];
    tables.forEach(t => {
      const hasIndex = t.fields?.some(f => f.name.endsWith('_id') || f.constraints?.includes('PRIMARY'));
      if (!hasIndex) tips.push({ title: `Add index to ${t.name}`, desc: 'No indexed fields detected. Add indexes on frequently queried columns.', priority: 'high' });
      const hasTimestamp = t.fields?.some(f => f.name.includes('_at'));
      if (!hasTimestamp) tips.push({ title: `Missing timestamps in ${t.name}`, desc: 'Add created_at and updated_at for better data tracking.', priority: 'medium' });
      const hasForeignKey = t.fields?.some(f => f.name.endsWith('_id') && f.name !== 'id');
      if (hasForeignKey) tips.push({ title: `Index foreign keys in ${t.name}`, desc: 'Foreign key columns should be indexed for faster JOIN operations.', priority: 'high' });
    });
    if (tables.length > 5) tips.push({ title: 'Consider database partitioning', desc: 'With many tables, consider partitioning large tables for better performance.', priority: 'low' });
    return tips.slice(0, 6);
  };

  if (!db) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'explorer', label: 'Table Explorer', icon: Database },
    { id: 'query', label: 'Query', icon: Search },
    { id: 'history', label: 'Query History', icon: History },
    { id: 'schema', label: 'View Schema', icon: Eye },
    { id: 'optimization', label: 'Optimization', icon: BarChart2 },
  ];

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/databases')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <Database size={18} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{db.name}</h1>
            <p className="text-xs text-gray-500">{tables.length} {db.type === 'MongoDB' ? 'collections' : 'tables'}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ml-2 ${DB_COLORS[db.type] || ''}`}>{db.type}</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Explorer */}
      {activeTab === 'explorer' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
          {/* Table list */}
          <div className="w-48 shrink-0">
            <GlassCard className="p-2">
              <p className="text-xs text-gray-500 px-2 py-1 mb-1">Tables</p>
              {tables.map(t => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTable?.name === t.name
                      ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </GlassCard>
          </div>

          {/* Table content */}
          <div className="flex-1 space-y-4">
            {selectedTable && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-white font-semibold">{selectedTable.name}</h2>
                    <span className="text-xs text-gray-500">{rows.length} rows</span>
                  </div>
                  <div className="flex gap-2">
                    <GlowButton variant="secondary" size="sm" onClick={handleGenerateMockData}>
                      <span className="flex items-center gap-1.5"><Sparkles size={13} /> Generate Mock Data</span>
                    </GlowButton>
                    <GlowButton variant="primary" size="sm" onClick={() => setShowInsertForm(!showInsertForm)}>
                      <span className="flex items-center gap-1.5"><Plus size={13} /> Insert Row</span>
                    </GlowButton>
                  </div>
                </div>

                {/* Insert form */}
                {showInsertForm && (
                  <GlassCard className="p-4">
                    <h3 className="text-sm font-medium text-white mb-3">Insert New Row</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {selectedTable.fields.filter(f => f.name !== 'id').map(f => (
                        <div key={f.name}>
                          <label className="text-xs text-gray-400 mb-1 block">{f.name}</label>
                          <input
                            type="text"
                            placeholder={f.type}
                            value={String(newRow[f.name] || '')}
                            onChange={e => setNewRow({ ...newRow, [f.name]: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400/50 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <GlowButton variant="primary" size="sm" onClick={handleInsertRow}>Insert</GlowButton>
                      <GlowButton variant="ghost" size="sm" onClick={() => setShowInsertForm(false)}>Cancel</GlowButton>
                    </div>
                  </GlassCard>
                )}

                {/* Table */}
                <GlassCard className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          {selectedTable.fields.map(f => (
                            <th key={f.name} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                              {f.name}
                              <span className="ml-1 text-gray-600 normal-case font-normal">{f.type}</span>
                            </th>
                          ))}
                          <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={selectedTable.fields.length + 1} className="text-center py-12 text-gray-600 text-sm">
                              No records found — click "Insert Row" or "Generate Mock Data"
                            </td>
                          </tr>
                        ) : (
                          rows.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              {selectedTable.fields.map(f => (
                                <td key={f.name} className="px-4 py-3 text-gray-300 font-mono text-xs whitespace-nowrap">
                                  {String(row[f.name] ?? '—')}
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleDeleteRow(i)}
                                  className="text-red-500/50 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Query */}
      {activeTab === 'query' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Ask in plain English</label>
            <textarea
              value={naturalQuery}
              onChange={e => setNaturalQuery(e.target.value)}
              placeholder="Show me all users who registered in the last 7 days..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-cyan-400/50 transition-all placeholder-gray-600"
              rows={3}
            />
            <div className="flex items-center gap-3 mt-3">
              <GlowButton variant="primary" onClick={handleTranslate} loading={queryLoading}>
                <span className="flex items-center gap-2"><Search size={15} /> Translate to {db.type}</span>
              </GlowButton>
              {queryError && <span className="text-red-400 text-xs">{queryError}</span>}
            </div>
          </GlassCard>

          {generatedQuery && (
            <GlassCard className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Generated Query</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors">
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-cyan-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{generatedQuery}</pre>
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* Query History */}
      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {queryHistory.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <History size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No queries yet — use the Query tab to get started</p>
            </GlassCard>
          ) : (
            queryHistory.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <p className="text-gray-300 text-sm mb-2">"{q.natural_language}"</p>
                  <pre className="text-cyan-400 font-mono text-xs bg-white/[0.03] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{q.generated_query}</pre>
                  <p className="text-gray-600 text-xs mt-2">{new Date(q.created_at).toLocaleString()}</p>
                </GlassCard>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Schema */}
      {activeTab === 'schema' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 bg-cyan-400/5 flex items-center gap-2">
                  <Database size={13} className="text-cyan-400" />
                  <span className="text-cyan-400 font-mono font-semibold text-sm">{t.name}</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {t.fields?.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.constraints?.includes('PRIMARY') ? 'bg-yellow-400' : f.name.endsWith('_id') ? 'bg-violet-400' : 'bg-gray-600'}`} />
                      <span className="text-gray-300 font-mono">{f.name}</span>
                      <span className="text-gray-600 ml-auto font-mono">{f.type}</span>
                    </div>
                  ))}
                </div>
                {t.relationships && t.relationships.length > 0 && (
                  <div className="px-3 pb-3 border-t border-white/5 pt-2">
                    {t.relationships.slice(0, 2).map((rel, ri) => (
                      <div key={ri} className="text-xs text-violet-400/70 font-mono truncate">{rel}</div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Optimization */}
      {activeTab === 'optimization' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-4 bg-cyan-400/5 border-cyan-400/20">
            <p className="text-cyan-400 text-sm">💡 AI-powered optimization suggestions based on your schema structure</p>
          </GlassCard>
          {getOptimizationTips().length === 0 ? (
            <GlassCard className="p-12 text-center">
              <BarChart2 size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No optimization tips available</p>
            </GlassCard>
          ) : (
            getOptimizationTips().map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${
                      tip.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      tip.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>{tip.priority}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{tip.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
