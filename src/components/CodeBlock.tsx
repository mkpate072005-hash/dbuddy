import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export default function CodeBlock({ code, language = 'sql', className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightSQL = (sql: string) => {
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|NOT NULL|DEFAULT|AUTO_INCREMENT|SERIAL|VARCHAR|TEXT|INTEGER|INT|BIGINT|BOOLEAN|BOOL|TIMESTAMP|TIMESTAMPTZ|DATE|FLOAT|DOUBLE|DECIMAL|NUMERIC|JSON|JSONB|UUID|IF|EXISTS|DROP|ALTER|ADD|COLUMN|CONSTRAINT|CASCADE|DISTINCT|COUNT|SUM|AVG|MAX|MIN|COALESCE|CASE|WHEN|THEN|ELSE|END|WITH|RETURNING)\b/gi;
    const strings = /'[^']*'/g;
    const numbers = /\b\d+\b/g;
    const comments = /--[^\n]*/g;

    return sql
      .replace(comments, m => `<span class="text-gray-500">${m}</span>`)
      .replace(strings, m => `<span class="text-emerald-400">${m}</span>`)
      .replace(keywords, m => `<span class="text-cyan-400 font-semibold">${m.toUpperCase()}</span>`)
      .replace(numbers, m => `<span class="text-violet-400">${m}</span>`);
  };

  const highlightJSON = (json: string) => {
    return json
      .replace(/"([^"]+)":/g, '<span class="text-cyan-400">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="text-violet-400">$1</span>')
      .replace(/: (true|false|null)/g, ': <span class="text-orange-400">$1</span>');
  };

  const highlighted = language === 'json' ? highlightJSON(code) : highlightSQL(code);

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d0d1a] ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">{language}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
