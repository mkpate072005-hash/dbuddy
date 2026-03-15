import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Database, Home, Plus, Search, Download, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Overview', exact: true },
  { path: '/dashboard/databases', icon: Database, label: 'My Databases' },
  { path: '/dashboard/create', icon: Plus, label: 'Create Database' },
  { path: '/dashboard/query', icon: Search, label: 'Query Builder' },
  { path: '/dashboard/export', icon: Download, label: 'Export' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`
      flex flex-col h-full bg-[#0a0a16] border-r border-white/10
      ${mobile ? 'w-full' : collapsed ? 'w-16' : 'w-64'}
      transition-all duration-300
    `}>
      <div className={`flex items-center ${collapsed && !mobile ? 'justify-center' : 'justify-between'} p-4 border-b border-white/10`}>
        {(!collapsed || mobile) && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_12px_rgba(0,245,255,0.4)]">
              <Database size={13} className="text-black" />
            </div>
            <span className="font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              DBuddy
            </span>
          </Link>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${active
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
                ${collapsed && !mobile ? 'justify-center' : ''}
              `}
              title={collapsed && !mobile ? item.label : undefined}
            >
              <item.icon size={18} className={active ? 'text-cyan-400' : ''} />
              {(!collapsed || mobile) && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t border-white/10 ${collapsed && !mobile ? 'flex flex-col items-center gap-2' : ''}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-cyan-400/30 flex items-center justify-center">
              <User size={14} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full
            ${collapsed && !mobile ? 'justify-center' : ''}
          `}
          title={collapsed && !mobile ? 'Sign Out' : undefined}
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 flex flex-col">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080810]/80 backdrop-blur-xl">
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 md:flex-none">
            <h1 className="text-sm font-medium text-gray-400 hidden md:block">
              {navItems.find(item => isActive(item))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 border border-cyan-400/30 flex items-center justify-center">
              <User size={14} className="text-cyan-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a16]/95 backdrop-blur-2xl border-t border-white/10 z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  active ? 'text-cyan-400' : 'text-gray-500'
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
