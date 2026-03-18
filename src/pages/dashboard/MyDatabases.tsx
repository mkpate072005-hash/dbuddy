import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Download, Trash2, Plus, Calendar, ExternalLink } from 'lucide-react';
import { fetchDatabases, deleteDatabase } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';

interface DB {
  id: string;
  name: string;
  type: string;
  schema_json: object;
  created_at: string;
}

const DB_STYLES: Record<string, { badge: string; dot: string; glow: string }> = {
  PostgreSQL: { badge: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', dot: 'bg-cyan-400 shadow-[0_0_6px_rgba(0,245,255,0.6)]', glow: 'hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(0,245,255,0.08)]' },
  MySQL: { badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]', glow: 'hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(52,211,153,0.08)]' },
  MongoDB: { badge: 'text-orange-400 bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.6)]', glow: 'hover:border-orange-400/40 hover:shadow-[0_0_30px_rgba(251,146,60,0.08)]' },
  SQLite: { badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]', glow: 'hover:border-blue-400/40 hover:shadow-[0_0_30px_rgba(96,165,250,0.08)]' },
};

export default function MyDatabases() {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState<DB[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchDatabases().then(setDatabases).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDatabase(id);
      setDatabases(prev => prev.filter(db => db.id !== id));
      setConfirmDelete(null);
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            My <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Databases</span>
          </h1>
          <p className="text-gray-500 text-sm">{databases.length} database{databases.length !== 1 ? 's' : ''} saved</p>
        </div>
        <GlowButton variant="primary" size="sm" onClick={() => navigate('/dashboard/create')}>
          <span className="flex items-center gap-2"><Plus size={16} /> New Database</span>
        </GlowButton>
      </motion.div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />)}
        </div>
      ) : databases.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Database size={28} className="text-gray-700" />
            </div>
            <h3 className="text-white font-semibold mb-2">No databases yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first AI-generated database schema</p>
            <GlowButton variant="primary" onClick={() => navigate('/dashboard/create')}>
              <span className="flex items-center gap-2"><Plus size={16} /> Create Database</span>
            </GlowButton>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {databases.map((db, i) => {
              const style = DB_STYLES[db.type] || DB_STYLES.PostgreSQL;
              const tables = (db.schema_json as { tables?: unknown[]; collections?: unknown[] })?.tables || (db.schema_json as { collections?: unknown[] })?.collections || [];
              return (
                <motion.div key={db.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
                  <div
                    className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 transition-all duration-300 cursor-pointer ${style.glow}`}
                    onClick={() => navigate(`/dashboard/databases/${db.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <h3 className="text-white font-semibold text-sm truncate max-w-[140px]">{db.name}</h3>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${style.badge}`}>{db.type}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-5">
                      <span className="flex items-center gap-1.5"><Calendar size={11} />{new Date(db.created_at).toLocaleDateString()}</span>
                      {tables.length > 0 && (
                        <span className="flex items-center gap-1.5"><Database size={11} />{tables.length} {db.type === 'MongoDB' ? 'collections' : 'tables'}</span>
                      )}
                    </div>

                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <GlowButton variant="primary" size="sm" className="flex-1 text-xs" onClick={() => navigate(`/dashboard/databases/${db.id}`)}>
                        <ExternalLink size={12} className="mr-1" /> Open
                      </GlowButton>
                      <GlowButton variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => navigate('/dashboard/query')}>
                        <Search size={12} className="mr-1" /> Query
                      </GlowButton>
                      <GlowButton variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => navigate('/dashboard/export')}>
                        <Download size={12} className="mr-1" /> Export
                      </GlowButton>
                      <button onClick={() => setConfirmDelete(db.id)} className="w-9 h-9 flex items-center justify-center rounded-full border border-red-500/20 text-red-500/50 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <GlassCard className="p-6 max-w-sm w-full">
                <h3 className="text-white font-bold text-lg mb-2">Delete Database?</h3>
                <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <GlowButton variant="ghost" size="sm" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</GlowButton>
                  <GlowButton variant="danger" size="sm" className="flex-1" loading={deletingId === confirmDelete} onClick={() => handleDelete(confirmDelete)}>Delete</GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
