import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'violet' | 'none';
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', glow = 'cyan', hover = false, onClick }: GlassCardProps) {
  const glowStyles = {
    cyan: 'border-cyan-400/20 hover:border-cyan-400/50 shadow-[0_0_30px_rgba(0,245,255,0.05)] hover:shadow-[0_0_40px_rgba(0,245,255,0.12)]',
    violet: 'border-violet-500/20 hover:border-violet-500/50 shadow-[0_0_30px_rgba(155,109,255,0.05)] hover:shadow-[0_0_40px_rgba(155,109,255,0.12)]',
    none: 'border-white/10'
  };

  return (
    <div onClick={onClick} className={`
      bg-white/[0.03] backdrop-blur-xl border rounded-2xl
      ${glowStyles[glow]}
      ${hover ? 'transition-all duration-300 cursor-pointer' : 'transition-all duration-300'}
      ${className}
    `}>
      {children}
    </div>
  );
}
