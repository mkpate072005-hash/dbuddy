import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, Database, Code2, Download, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import GlowButton from '../components/GlowButton';
import GlassCard from '../components/GlassCard';
import CodeBlock from '../components/CodeBlock';

const DEMO_SCHEMA = `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  workout_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  notes TEXT
);`;

const MARQUEE_ITEMS = [
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MySQL', color: '#00758F' },
  { name: 'MongoDB', color: '#47A248' },
  { name: 'SQLite', color: '#003B57' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MySQL', color: '#00758F' },
  { name: 'MongoDB', color: '#47A248' },
  { name: 'SQLite', color: '#003B57' },
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function Landing() {
  const navigate = useNavigate();
  const [demoInput, setDemoInput] = useState('A fitness tracking app with users, workouts, exercises, and progress logs');
  const [demoGenerating, setDemoGenerating] = useState(false);
  const [demoResult, setDemoResult] = useState('');
  const featuresRef = useInView();
  const howRef = useInView();
  const demoRef = useInView();

  const runDemo = () => {
    setDemoGenerating(true);
    setDemoResult('');
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setDemoResult(DEMO_SCHEMA.slice(0, i));
      if (i >= DEMO_SCHEMA.length) {
        clearInterval(interval);
        setDemoGenerating(false);
        setDemoResult(DEMO_SCHEMA);
      }
    }, 20);
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.04]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <ParticleBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-sm mb-8">
              <Sparkles size={14} />
              <span>AI-Powered Database Design</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Build Databases.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%] animate-[shimmer_3s_linear_infinite]">
                With Just Words.
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Describe your app in plain English. DBuddy generates production-ready schemas,
              translates natural language to SQL, and exports everything instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlowButton variant="primary" size="lg" onClick={() => navigate('/signup')}>
                <span className="flex items-center gap-2">Start Building Free <ArrowRight size={18} /></span>
              </GlowButton>
              <GlowButton variant="secondary" size="lg" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                <span className="flex items-center gap-2">See Live Demo <Zap size={18} /></span>
              </GlowButton>
            </div>
          </motion.div>

          {/* 3D Floating Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 8 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <GlassCard className="p-6 shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(0,245,255,0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 bg-white/5 rounded-md h-6 mx-4 flex items-center px-3">
                  <span className="text-xs text-gray-500 font-mono">dbuddy.ai/dashboard/create</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['users', 'workouts', 'exercises'].map((t, i) => (
                  <div key={t} className={`p-3 rounded-xl border ${i === 0 ? 'border-cyan-400/30 bg-cyan-400/5' : 'border-white/10 bg-white/[0.02]'}`}>
                    <div className={`text-xs font-mono font-semibold ${i === 0 ? 'text-cyan-400' : 'text-gray-400'}`}>{t}</div>
                    <div className="text-xs text-gray-600 mt-1">{['5 fields', '7 fields', '6 fields'][i]}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0d0d1a] rounded-xl p-4 font-mono text-xs text-gray-400 leading-relaxed">
                <span className="text-cyan-400">CREATE TABLE</span> users (<br />
                &nbsp;&nbsp;id <span className="text-violet-400">UUID</span> <span className="text-cyan-400">PRIMARY KEY</span>,<br />
                &nbsp;&nbsp;email <span className="text-violet-400">VARCHAR</span>(255) <span className="text-cyan-400">UNIQUE NOT NULL</span>,<br />
                &nbsp;&nbsp;created_at <span className="text-violet-400">TIMESTAMPTZ</span> <span className="text-cyan-400">DEFAULT NOW</span>()<br />
                );
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-12 border-y border-white/5 overflow-hidden">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-6">Works with your stack</p>
        <div className="flex gap-12 animate-[marquee_20s_linear_infinite]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              <span className="text-gray-400 font-medium whitespace-nowrap">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div ref={featuresRef.ref} className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresRef.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Everything you need
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Three powerful tools in one AI companion</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Schema Generation',
                desc: 'Describe your app in plain English. Get a production-ready database schema with tables, relationships, indexes, and constraints — instantly.',
                color: 'cyan',
                delay: 0
              },
              {
                icon: Code2,
                title: 'Natural Language Queries',
                desc: 'Ask questions in plain English. DBuddy translates them to precise SQL or MongoDB queries with proper JOINs, filters, and aggregations.',
                color: 'violet',
                delay: 0.1
              },
              {
                icon: Download,
                title: 'One-Click Export',
                desc: 'Export your schema as SQL migration files, JSON schema, or CSV. Ready to drop into your project or share with your team.',
                color: 'cyan',
                delay: 0.2
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={featuresRef.inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: f.delay + 0.2 }}
              >
                <GlassCard
                  className={`p-8 h-full ${i === 1 ? 'md:mt-8' : ''}`}
                  glow={f.color as 'cyan' | 'violet'}
                  hover
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    f.color === 'cyan'
                      ? 'bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_20px_rgba(0,245,255,0.15)]'
                      : 'bg-violet-500/10 border border-violet-500/20 shadow-[0_0_20px_rgba(155,109,255,0.15)]'
                  }`}>
                    <f.icon size={22} className={f.color === 'cyan' ? 'text-cyan-400' : 'text-violet-400'} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div ref={howRef.ref} className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={howRef.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              How It <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-400 text-lg">From idea to production schema in seconds</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-cyan-400/30 via-violet-400/30 to-cyan-400/30 -translate-y-1/2" />

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                { step: '01', title: 'Describe', desc: 'Tell DBuddy what you\'re building in plain English. No technical jargon needed.', icon: '✍️' },
                { step: '02', title: 'Generate', desc: 'Claude AI analyzes your description and generates a complete, optimized schema.', icon: '⚡' },
                { step: '03', title: 'Export', desc: 'Download your schema as SQL, JSON, or CSV. Ready to use immediately.', icon: '📦' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={howRef.inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,245,255,0.1)] text-2xl">
                    {step.icon}
                  </div>
                  <div className="text-xs font-mono text-cyan-400 mb-2">{step.step}</div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-24 px-6 border-t border-white/5">
        <div ref={demoRef.ref} className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={demoRef.inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Try It <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Live</span>
            </h2>
            <p className="text-gray-400 text-lg">See DBuddy generate a schema in real-time</p>
          </motion.div>

          <GlassCard className="p-6">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Describe your database</label>
              <textarea
                value={demoInput}
                onChange={e => setDemoInput(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.1)] transition-all"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <select className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-400/50">
                <option>PostgreSQL</option>
              </select>
              <GlowButton
                variant="primary"
                onClick={runDemo}
                loading={demoGenerating}
              >
                <span className="flex items-center gap-2"><Sparkles size={16} /> Generate Schema</span>
              </GlowButton>
            </div>

            {(demoResult || demoGenerating) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <CodeBlock code={demoResult || '...'} language="sql" />
              </motion.div>
            )}

            {!demoResult && !demoGenerating && (
              <div className="text-center py-8 text-gray-600 text-sm">
                Click "Generate Schema" to see DBuddy in action →
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ready to build{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              faster?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">Join developers who design databases with AI.</p>
          <GlowButton variant="primary" size="lg" onClick={() => navigate('/signup')}>
            <span className="flex items-center gap-2">Get Started Free <ChevronRight size={18} /></span>
          </GlowButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
              <Database size={12} className="text-black" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              DBuddy
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-300 transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-gray-300 transition-colors">Demo</a>
          </div>
          <p className="text-xs text-gray-600">© 2025 DBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
