import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Zap, Clock, HardDrive, Plus, Search, ArrowRight } from 'lucide-react';
import { fetchStats, fetchDatabases } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  total_databases: number;
  queries_run: number;
  last_active: string | null;
  storage_used: string;
}

interface DB {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

const DB_COLORS: Record<string, string> = {
  PostgreSQL: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  MySQL: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MongoDB: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  SQLite: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [databases, setDatabases] = useState<DB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchDatabases()])
      .then(([s, dbs]) => { setStats(s); setDatabases(dbs.slice(0, 5)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Developer';

  const statCards = [
    { label: 'Total Databases', value: stats?.total_databases ?? '—', icon: Database, color: 'cyan' },
    { label: 'Queries Run', value: stats?.queries_run ?? '—', icon: Zap, color: 'violet' },
    { label: 'Last Active', value: stats?.last_active ? new Date(stats.last_active).toLocaleDateString() : 'Never', icon: Clock, color: 'cyan' },
    { label: 'Storage Used', value: stats?.storage_used ?? '—', icon: HardDrive, color: 'violet' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{displayName}</span>
        </h1>
        <p className="text-gray-500 text-sm">Here's what's happening with your databases</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlassCard className="p-5" glow={card.color as 'cyan' | 'violet'}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  card.color === 'cyan'
                    ? 'bg-cyan-400/10 border border-cyan-400/20'
                    : 'bg-violet-500/10 border border-violet-500/20'
                }`}>
                  <card.icon size={16} className={card.color === 'cyan' ? 'text-cyan-400' : 'text-violet-400'} />
                </div>
              </div>
              <div className={`text-2xl font-black mb-1 ${loading ? 'text-gray-600' : 'text-white'}`}>
                {loading ? '...' : card.value}
              </div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <GlassCard className="p-5 cursor-pointer" hover onClick={() => navigate('/dashboard/create')}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                <Plus size={18} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Create New Database</div>
                <div className="text-gray-500 text-xs">Generate schema with AI</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 ml-auto" />
            </div>
          </GlassCard>
          <GlassCard className="p-5 cursor-pointer" hover onClick={() => navigate('/dashboard/query')}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(155,109,255,0.1)]">
                <Search size={18} className="text-violet-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Open Query Builder</div>
                <div className="text-gray-500 text-xs">Translate natural language to SQL</div>
              </div>
              <ArrowRight size={16} className="text-gray-600 ml-auto" />
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Recent Databases */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Databases</h2>
          <button onClick={() => navigate('/dashboard/databases')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : databases.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Database size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No databases yet</p>
            <GlowButton variant="primary" size="sm" onClick={() => navigate('/dashboard/create')}>
              Create Your First Database
            </GlowButton>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {databases.map((db, i) => (
              <motion.div
                key={db.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-4" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                      <div>
                        <div className="text-white font-medium text-sm">{db.name}</div>
                        <div className="text-gray-600 text-xs">{new Date(db.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${DB_COLORS[db.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                        {db.type}
                      </span>
                      <GlowButton variant="ghost" size="sm" onClick={() => navigate('/dashboard/query')}>
                        Query
                      </GlowButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
