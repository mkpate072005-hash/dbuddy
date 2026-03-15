import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileJson, Table, ChevronDown, CheckCircle } from 'lucide-react';
import { fetchDatabases } from '../../lib/api';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';

interface DB {
  id: string;
  name: string;
  type: string;
  schema_json: {
    tables?: { name: string; fields: { name: string; type: string; constraints?: string }[] }[];
    collections?: { name: string; fields: { name: string; type: string; required?: boolean }[] }[];
    sql?: string;
    schema?: string;
  };
}

export default function Export() {
  const [databases, setDatabases] = useState<DB[]>([]);
  const [selectedDb, setSelectedDb] = useState<DB | null>(null);
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabases()
      .then(dbs => { setDatabases(dbs); if (dbs.length > 0) setSelectedDb(dbs[0]); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const generateSQL = (db: DB): string => {
    if (db.schema_json?.sql) return db.schema_json.sql;
    const tables = db.schema_json?.tables || [];
    return tables.map((t: { name: string; fields: { name: string; type: string; constraints?: string }[] }) => {
      const fields = t.fields?.map((f: { name: string; type: string; constraints?: string }) =>
        `  ${f.name} ${f.type}${f.constraints ? ' ' + f.constraints : ''}`
      ).join(',\n');
      return `CREATE TABLE ${t.name} (\n${fields}\n);\n`;
    }).join('\n');
  };

  const generateJSON = (db: DB): string => {
    return JSON.stringify(db.schema_json, null, 2);
  };

  const generateCSV = (db: DB): string => {
    const tables = db.schema_json?.tables || db.schema_json?.collections || [];
    const rows = [['Table/Collection', 'Field Name', 'Data Type', 'Constraints']];
    tables.forEach((t: { name: string; fields: { name: string; type: string; constraints?: string; required?: boolean }[] }) => {
      t.fields?.forEach((f: { name: string; type: string; constraints?: string; required?: boolean }) => {
        rows.push([t.name, f.name, f.type, f.constraints || (f.required ? 'required' : '') || '']);
      });
    });
    return rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  };

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setExported(filename);
    setTimeout(() => setExported(null), 3000);
  };

  const handleExport = (format: 'sql' | 'json' | 'csv') => {
    if (!selectedDb) return;
    const name = selectedDb.name.replace(/\s+/g, '_').toLowerCase();
    if (format === 'sql') {
      download(generateSQL(selectedDb), `${name}.sql`, 'text/plain');
    } else if (format === 'json') {
      download(generateJSON(selectedDb), `${name}_schema.json`, 'application/json');
    } else {
      download(generateCSV(selectedDb), `${name}_schema.csv`, 'text/csv');
    }
  };

  const exportOptions = [
    {
      format: 'sql' as const,
      icon: FileText,
      title: 'SQL File',
      desc: 'Complete CREATE TABLE statements ready for your database',
      ext: '.sql',
      color: 'cyan',
      disabled: selectedDb?.type === 'MongoDB'
    },
    {
      format: 'json' as const,
      icon: FileJson,
      title: 'JSON Schema',
      desc: 'Full schema as structured JSON — ideal for documentation',
      ext: '.json',
      color: 'violet',
      disabled: false
    },
    {
      format: 'csv' as const,
      icon: Table,
      title: 'CSV (Schema)',
      desc: 'Spreadsheet-friendly field listing for all tables',
      ext: '.csv',
      color: 'cyan',
      disabled: false
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Export</span> Schema
        </h1>
        <p className="text-gray-500 text-sm">Download your database schema in multiple formats</p>
      </motion.div>

      {/* Database Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-5">
          <label className="text-sm text-gray-400 mb-2 block">Select Database</label>
          <div className="relative max-w-sm">
            <select
              value={selectedDb?.id || ''}
              onChange={e => setSelectedDb(databases.find(db => db.id === e.target.value) || null)}
              className="w-full appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-300 focus:outline-none focus:border-cyan-400/50 transition-all"
              disabled={loading}
            >
              {loading ? (
                <option>Loading...</option>
              ) : databases.length === 0 ? (
                <option>No databases — create one first</option>
              ) : (
                databases.map(db => <option key={db.id} value={db.id}>{db.name} ({db.type})</option>)
              )}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </GlassCard>
      </motion.div>

      {/* Export Options */}
      <div className="space-y-4">
        {exportOptions.map((opt, i) => (
          <motion.div
            key={opt.format}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
          >
            <GlassCard className={`p-5 ${opt.disabled ? 'opacity-50' : ''}`} glow={opt.color as 'cyan' | 'violet'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    opt.color === 'cyan'
                      ? 'bg-cyan-400/10 border border-cyan-400/20'
                      : 'bg-violet-500/10 border border-violet-500/20'
                  }`}>
                    <opt.icon size={18} className={opt.color === 'cyan' ? 'text-cyan-400' : 'text-violet-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-sm">{opt.title}</h3>
                      <span className="text-xs font-mono text-gray-600">{opt.ext}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{opt.desc}</p>
                    {opt.disabled && <p className="text-orange-400 text-xs mt-0.5">SQL export not available for MongoDB</p>}
                  </div>
                </div>
                <GlowButton
                  variant={opt.color === 'cyan' ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={!selectedDb || opt.disabled}
                  onClick={() => handleExport(opt.format)}
                >
                  <span className="flex items-center gap-1.5">
                    <Download size={14} /> Download
                  </span>
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {exported && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm shadow-[0_0_30px_rgba(52,211,153,0.2)] z-50"
        >
          <CheckCircle size={16} />
          Downloaded {exported}
        </motion.div>
      )}
    </div>
  );
}
