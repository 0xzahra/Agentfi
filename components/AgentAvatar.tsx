import React from 'react';
import { AgentMode } from '../types';

interface AgentAvatarProps {
  mode: AgentMode;
  personalityScore: number;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ mode, personalityScore }) => {
  // Determine color based on mode and personality
  // 0 = Gambler (Red/Pink), 100 = Analyst (Blue/Cyan)
  const isTrader = mode === AgentMode.TRADER;
  const isSocial = mode === AgentMode.INFLUENCER;
  
  let coreColor = 'bg-cyan-500';
  let glowColor = 'shadow-cyan-500/50';

  if (personalityScore < 40) {
      coreColor = 'bg-rose-500';
      glowColor = 'shadow-rose-500/50';
  } else if (personalityScore > 70) {
      coreColor = 'bg-blue-600';
      glowColor = 'shadow-blue-600/50';
  }

  if (isTrader) {
      coreColor = 'bg-amber-500';
      glowColor = 'shadow-amber-500/50';
  }

  return (
    <div className="relative flex items-center justify-center h-64 w-64 mx-auto my-8">
      {/* Outer Ring */}
      <div className={`absolute inset-0 border-2 rounded-full border-slate-700 animate-[spin_10s_linear_infinite] opacity-50`}></div>
      <div className={`absolute inset-4 border border-slate-600 rounded-full animate-[spin_15s_linear_infinite_reverse] opacity-30`}></div>
      
      {/* Core */}
      <div className={`relative w-24 h-24 rounded-full ${coreColor} shadow-[0_0_50px_10px] ${glowColor} animate-pulse flex items-center justify-center z-10 transition-all duration-1000`}>
         <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
         {/* Face / Eyes */}
         <div className="flex gap-4">
             <div className={`w-3 h-1 bg-white shadow-[0_0_10px_white] ${isTrader ? 'h-1 w-5' : 'h-3 w-3 rounded-full'}`}></div>
             <div className={`w-3 h-1 bg-white shadow-[0_0_10px_white] ${isTrader ? 'h-1 w-5' : 'h-3 w-3 rounded-full'}`}></div>
         </div>
      </div>

      {/* Holographic Projection Base */}
      <div className="absolute bottom-[-40px] w-48 h-12 bg-cyan-500/10 rounded-[100%] blur-xl"></div>
      
      {/* Status Text */}
      <div className="absolute -bottom-10 text-xs font-mono text-slate-400 tracking-widest uppercase">
          STATUS: {mode}
      </div>
    </div>
  );
};

export default AgentAvatar;