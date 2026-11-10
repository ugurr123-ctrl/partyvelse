import React from 'react';
import { Role, OperationTheme } from '../types/game';
import { Radio, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface Props {
  role?: Role;
  theme?: OperationTheme;
  title?: string;
}

export const ConsoleScreenFallback: React.FC<Props> = ({
  role = 'kaptan',
  theme = 'kayip_sinyal',
  title = 'KONSOL BAĞLANTISI AKTİF',
}) => {
  const isCaptain = role === 'kaptan';
  const isKarantina = theme === 'karantina_2088';
  const accentColor = isKarantina
    ? isCaptain ? '#ffb703' : '#00f0ff'
    : isCaptain ? '#ffb703' : '#00f0ff';

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-130px)] rounded-[32px] bg-[#0d0a1d]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md animate-pulse">
      
      {/* Top Ambient Glow Accent */}
      <div 
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: accentColor }}
      />

      {/* 1. Header Skeleton */}
      <div className="w-full flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-3.5 w-28 bg-white/10 rounded-md" />
          </div>
          <div className="h-5 w-16 bg-white/10 rounded-full" />
        </div>

        {/* Title Bar Placeholder */}
        <div className="mt-2 h-7 w-3/4 bg-white/15 rounded-lg" />
        <div className="h-4 w-1/2 bg-white/10 rounded-md" />
      </div>

      {/* 2. Center Tactical Radar / Console Screen Skeleton */}
      <div className="w-full my-6 flex flex-col items-center justify-center relative z-10">
        
        {/* Radar Ring Scanner */}
        <div className="relative w-36 h-36 rounded-full border border-white/15 flex items-center justify-center">
          <div 
            className="absolute inset-2 rounded-full border border-dashed opacity-40 animate-spin"
            style={{ borderColor: accentColor, animationDuration: '8s' }}
          />
          <div 
            className="w-16 h-16 rounded-full border flex items-center justify-center shadow-lg"
            style={{ borderColor: accentColor, backgroundColor: `${accentColor}15` }}
          >
            <Activity className="w-7 h-7" style={{ color: accentColor }} />
          </div>

          {/* Crosshair telemetry lines */}
          <div className="absolute inset-x-0 h-[1px] bg-white/10" />
          <div className="absolute inset-y-0 w-[1px] bg-white/10" />
        </div>

        {/* Telemetry Status Message */}
        <div className="mt-4 flex flex-col items-center text-center">
          <span 
            className="font-mono text-xs font-bold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {title}
          </span>
          <span className="font-mono text-[10px] text-white/40 mt-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>MODÜL ÖN BELLEKTEN AKTARILIYOR • 0ms</span>
          </span>
        </div>

        {/* Tactical Micro Telemetry Bars */}
        <div className="w-full mt-6 grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="h-2 w-10 bg-white/15 rounded" />
            <div className="h-3 w-16 bg-white/20 rounded" />
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="h-2 w-10 bg-white/15 rounded" />
            <div className="h-3 w-16 bg-white/20 rounded" />
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="h-2 w-10 bg-white/15 rounded" />
            <div className="h-3 w-16 bg-white/20 rounded" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Action Button Skeleton */}
      <div className="w-full relative z-10 flex flex-col gap-2">
        <div 
          className="w-full h-12 rounded-2xl border flex items-center justify-center font-sora text-xs font-bold uppercase tracking-wider"
          style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>KONSOL SENKRONİZE EDİLİYOR</span>
          </span>
        </div>
      </div>
    </div>
  );
};
