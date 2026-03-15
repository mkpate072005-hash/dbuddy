import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, Lock, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchUserSettings, updateUserSettings } from '../../lib/api';
import supabase from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/GlassCard';
import GlowButton from '../../components/GlowButton';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserSettings().then(s => {
      setDisplayName(s.display_name || user?.user_metadata?.display_name || '');
      setClaudeKey(s.claude_api_key || '');
    }).catch(console.error);
  }, [user]);

  const showMsg = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUserSettings(displayName, claudeKey);
      showMsg('Settings saved successfully!');
    } catch (err: unknown) {
      showMsg(err instanceof Error ? err.message : 'Failed to save', true);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { showMsg('Password must be at least 6 characters', true); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) showMsg(error.message, true);
    else { showMsg('Password updated!'); setNewPassword(''); }
    setPwLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (err: unknown) {
      showMsg(err instanceof Error ? err.message : 'Failed to delete account', true);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Settings</span>
        </h1>
        <p className="text-gray-500 text-sm">Manage your account and AI configuration</p>
      </motion.div>

      {(success || error) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${
            success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {success || error}
        </motion.div>
      )}

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <User size={16} className="text-cyan-400" />
            </div>
            <h2 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,245,255,0.1)] transition-all"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Claude API Key */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Key size={16} className="text-violet-400" />
            </div>
            <h2 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Claude API Key</h2>
          </div>

          <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-violet-300 text-xs mb-4 leading-relaxed">
            Your Claude API key is required for AI schema generation and query translation.
            Get yours at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-violet-200">console.anthropic.com</a>.
            Keys are stored securely per-account.
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={claudeKey}
              onChange={e => setClaudeKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_15px_rgba(155,109,255,0.1)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <GlowButton variant="primary" className="mt-4" onClick={handleSaveProfile} loading={loading}>
            Save Settings
          </GlowButton>
        </GlassCard>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <Lock size={16} className="text-cyan-400" />
            </div>
            <h2 className="text-white font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Change Password</h2>
          </div>
          <div className="relative mb-4">
            <input
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(0,245,255,0.1)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <GlowButton variant="secondary" onClick={handleChangePassword} loading={pwLoading}>
            Update Password
          </GlowButton>
        </GlassCard>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <GlassCard className="p-6 border-red-500/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <h2 className="text-red-400 font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Danger Zone</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <GlowButton variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
            Delete Account
          </GlowButton>
        </GlassCard>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <GlassCard className="p-6 max-w-sm w-full border-red-500/30">
                <h3 className="text-white font-bold text-lg mb-2">Delete Account</h3>
                <p className="text-gray-400 text-sm mb-4">
                  This will permanently delete your account and all your databases. Type <strong className="text-red-400">DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-white/[0.03] border border-red-500/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/60 transition-all mb-4"
                />
                <div className="flex gap-3">
                  <GlowButton variant="ghost" size="sm" className="flex-1" onClick={() => { setConfirmDeleteOpen(false); setConfirmText(''); }}>
                    Cancel
                  </GlowButton>
                  <GlowButton
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    disabled={confirmText !== 'DELETE'}
                    loading={deleteLoading}
                    onClick={handleDeleteAccount}
                  >
                    Delete Forever
                  </GlowButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
