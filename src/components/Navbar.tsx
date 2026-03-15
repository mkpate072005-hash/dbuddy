import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Menu, X } from 'lucide-react';
import GlowButton from './GlowButton';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#080810]/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.4)]">
            <Database size={16} className="text-black" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            DBuddy
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
          <a href="#demo" className="text-sm text-gray-400 hover:text-white transition-colors">Demo</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <GlowButton variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </GlowButton>
              <GlowButton variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </GlowButton>
            </>
          ) : (
            <>
              <GlowButton variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </GlowButton>
              <GlowButton variant="primary" size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </GlowButton>
            </>
          )}
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#080810]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-4 space-y-4">
          <a href="#features" className="block text-gray-400 hover:text-white">Features</a>
          <a href="#how-it-works" className="block text-gray-400 hover:text-white">How It Works</a>
          <a href="#demo" className="block text-gray-400 hover:text-white">Demo</a>
          {user ? (
            <>
              <GlowButton variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="w-full">Dashboard</GlowButton>
              <GlowButton variant="ghost" size="sm" onClick={handleSignOut} className="w-full">Sign Out</GlowButton>
            </>
          ) : (
            <>
              <GlowButton variant="ghost" size="sm" onClick={() => navigate('/login')} className="w-full">Sign In</GlowButton>
              <GlowButton variant="primary" size="sm" onClick={() => navigate('/signup')} className="w-full">Get Started</GlowButton>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
