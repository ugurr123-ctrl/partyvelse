import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen08SignalEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const [currentFreq, setCurrentFreq] = useState(142.8);
  const [isLocked, setIsLocked] = useState(state.signal.isSolved);
  const [lockFeedback, setLockFeedback] = useState<string>(
    state.signal.isSolved ? 'FREKANS KİLİTLENDİ • SİNYAL BAŞARIYLA YAKALANDI' : ''
  );

  const handleStepDown = () => {
    if (isLocked) return;
    setCurrentFreq((prev) => Math.max(140.0, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleStepUp = () => {
    if (isLocked) return;
    setCurrentFreq((prev) => Math.min(145.0, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleLockFrequency = () => {
    // Frequency 142.8 or target frequency
    setIsLocked(true);
    setLockFeedback('FREKANS KİLİTLENDİ • TAŞIYICI DALGA SENKRONİZE EDİLDİ');

    onUpdate((prev) => ({
      ...prev,
      signal: {
        ...prev.signal,
        isLocked: true,
        isSolved: true,
      },
    }));
  };

  const formattedFreq = currentFreq.toFixed(1).replace('.', ',');

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Atmospheric Scrim & Background Station Visual */}
      <div className="relative w-full overflow-hidden rounded-b-2xl bg-[#0f0c1e] border border-white/10">
        <div 
          className="bg-cover bg-center w-full h-52 relative opacity-40" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-EHtsE9uXj77YZ38AYAxMAHhNErR6P7K3utAjJIu8w2ZWx4fDahXTu2XjkRsgnFGr5Dq1ASCvsGX0jA3bHuLtp2mpCNHd1CLwJVoik1nKGw-tyetG6Tn5qAwhQY04VhZc4ZQcYw5GdF_YYT6sYunhvE7zOyK2xfZcP-3PITnYzAMrOGzUoDcyqWyfKc9onLhrzhOCVI4kKyaRcH51sShcSdlpECPPJghLNiknmDY')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#141123]/40 via-[#141123]/80 to-[#141123]"></div>

        {/* Briefing Headline Section */}
        <div className="relative px-4 -mt-32 pb-4 z-10 flex flex-col gap-1 text-center items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2b273b]/80 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
            <span className="font-mono text-[10px] text-[#00eefc] tracking-widest uppercase font-bold">MÜHENDİS // FREKANS KONSOLU</span>
          </div>
          <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight">
            Sinyali <span className="text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">yakala</span>
          </h2>
          <p className="text-xs text-[#d5c4ac] max-w-[320px]">
            Kaptanından gelen sembol sırasındaki frekansı bul ve kilitle.
          </p>
        </div>
      </div>

      {/* Main Telemetry Controls Stack */}
      <div className="flex flex-col gap-3.5 -mt-2">
        
        {/* Oscilloscope CRT Console */}
        <div className="w-full bg-[#0f0c1e] rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#00eefc]/10 blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#00eefc] animate-pulse"></span>
              <span className="font-mono text-[10px] text-[#00eefc] tracking-wider uppercase font-bold">SPEKTRUM ANALİZİ</span>
            </div>
            <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">RMS TARAMA // AKTİF</span>
          </div>

          {/* Vector Oscilloscope Screen */}
          <div className="relative w-full h-32 rounded-xl bg-[#0b0c16] overflow-hidden flex flex-col justify-between p-2 border border-white/5">
            {/* Target Tooltip */}
            <div className="absolute top-1.5 left-[61%] -translate-x-1/2 z-20 flex flex-col items-center">
              <div className="px-2 py-0.5 rounded bg-[#ffb703] text-[#271900] font-mono text-[10px] tracking-tight font-bold shadow-[0_0_10px_rgba(255,183,3,0.7)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#271900] animate-ping"></span>
                <span>{formattedFreq} MHz</span>
              </div>
              <div className="w-0.5 h-3 bg-[#ffb703]"></div>
            </div>

            {/* Vertical labels */}
            <div className="absolute left-1.5 top-2 bottom-4 flex flex-col justify-between font-mono text-[9px] text-white/30 pointer-events-none">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* SVG Wave */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 90">
              <defs>
                <linearGradient id="neonCyanGradEng" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00eefc" stopOpacity="0.35"></stop>
                  <stop offset="100%" stopColor="#00eefc" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="peakLineGradEng" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffb703"></stop>
                  <stop offset="100%" stopColor="#00eefc"></stop>
                </linearGradient>
              </defs>

              <line stroke="#1c192c" strokeDasharray="3 3" strokeWidth="1" x1="24" x2="315" y1="18" y2="18"></line>
              <line stroke="#1c192c" strokeDasharray="3 3" strokeWidth="1" x1="24" x2="315" y1="45" y2="45"></line>
              <line stroke="#1c192c" strokeDasharray="3 3" strokeWidth="1" x1="24" x2="315" y1="72" y2="72"></line>
              <line stroke="#ffb703" strokeDasharray="2 2" strokeOpacity="0.4" strokeWidth="1" x1="196" x2="196" y1="8" y2="82"></line>

              <path d="M 24 72 Q 40 68, 55 60 T 90 65 T 120 50 T 150 68 T 175 45 L 196 14 L 215 52 T 245 66 T 280 58 T 315 72 L 315 82 L 24 82 Z" fill="url(#neonCyanGradEng)"></path>
              <path d="M 24 72 Q 40 68, 55 60 T 90 65 T 120 50 T 150 68 T 175 45 L 196 14 L 215 52 T 245 66 T 280 58 T 315 72" fill="none" stroke="url(#peakLineGradEng)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <circle className="animate-pulse" cx="196" cy="14" fill="#ffb703" r="3.5"></circle>
            </svg>

            <div className="w-full pl-6 pr-2 flex justify-between font-mono text-[10px] text-[#d5c4ac]">
              <span>140</span>
              <span>141</span>
              <span>142</span>
              <span className="text-[#ffb703] font-bold">143</span>
              <span>144</span>
              <span>145 MHz</span>
            </div>
          </div>
        </div>

        {/* Centerpiece 2.5D Rotary Tuning Dial Instrument */}
        <div className="relative w-full rounded-2xl bg-[#1c192c] p-4 flex flex-col items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
          <div className="relative w-52 h-52 rounded-full bg-[#100d1e] shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-4px_8px_rgba(0,0,0,0.9)] flex items-center justify-center p-3 border border-white/5">
            
            {/* Amber Pointer Jewel */}
            <div className="absolute top-1 z-30 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#ffb703] filter drop-shadow-[0_0_6px_#ffb703]"></div>
            </div>

            {/* Radial Ticks */}
            <svg className="absolute inset-0 w-full h-full p-2.5" viewBox="0 0 200 200">
              <circle cx="100" cy="100" fill="none" opacity="0.6" r="92" stroke="#2b273b" strokeWidth="2"></circle>
              <g opacity="0.85" stroke="#00eefc" strokeLinecap="round" strokeWidth="2">
                {[...Array(24)].map((_, i) => {
                  const angle = (i * 15 * Math.PI) / 180;
                  const x1 = 100 + 82 * Math.sin(angle);
                  const y1 = 100 - 82 * Math.cos(angle);
                  const x2 = 100 + 90 * Math.sin(angle);
                  const y2 = 100 - 90 * Math.cos(angle);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
                })}
              </g>
              <circle cx="100" cy="100" fill="none" opacity="0.4" r="76" stroke="#00eefc" strokeDasharray="14 8" strokeWidth="1.5"></circle>
            </svg>

            {/* Inner Turntable Core with Digital LED Telemetry Screen */}
            <div 
              onClick={handleStepUp}
              className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#1b1730] to-[#0e0b1c] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_0_16px_rgba(0,238,252,0.2)] flex flex-col items-center justify-center p-2 text-center border-t border-white/10 cursor-pointer active:scale-95 transition-transform"
            >
              <span className="font-mono text-[9px] tracking-widest text-[#00eefc]/70 uppercase -mb-0.5">FREKANS KANALI</span>
              <div className="flex items-baseline justify-center">
                <span className="font-sora text-[32px] leading-none text-[#ffdba0] font-extrabold tracking-tight drop-shadow-[0_0_12px_rgba(255,183,3,0.5)]">
                  {formattedFreq}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#00eefc] uppercase tracking-wider font-semibold mt-0.5">
                MHz
              </span>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping"></span>
                <span className="font-mono text-[8px] text-[#d5c4ac]">LOCKED // CH-04</span>
              </div>
            </div>
          </div>
        </div>

        {/* Glyphs Sequence Sockets */}
        <div className="w-full bg-[#2b273b] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-sora text-xs font-bold text-white">Sembol sırası</span>
            <span className="font-mono text-[10px] text-[#00eefc] font-bold">04 / 04 AKTİF</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="aspect-square rounded-xl bg-[#0f0c1e] flex items-center justify-center shadow-inner border border-white/5">
              <div className="w-7 h-7 rounded-full border-[3px] border-[#00eefc]/80 flex items-center justify-center shadow-[0_0_10px_rgba(0,238,252,0.4)]"></div>
            </div>
            <div className="aspect-square rounded-xl bg-[#0f0c1e] flex items-center justify-center shadow-inner border border-white/5">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-[2px] border-[#ffb703] flex items-center justify-center shadow-[0_0_8px_rgba(255,183,3,0.5)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></div>
                </div>
              </div>
            </div>
            <div className="aspect-square rounded-xl bg-[#0f0c1e] flex items-center justify-center shadow-inner border border-white/5">
              <svg className="w-7 h-7 text-[#00eefc]" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                <polygon points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2"></polygon>
              </svg>
            </div>
            <div className="aspect-square rounded-xl bg-[#0f0c1e] flex items-center justify-center shadow-inner border border-white/5">
              <svg className="w-7 h-7 text-[#dab5ff]" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M2 12 C 5 4, 8 4, 11 12 C 14 20, 17 20, 22 12"></path>
              </svg>
            </div>
          </div>

          <div className="w-full py-2 px-3 rounded-xl bg-[#0f0c1e]/80 flex items-center justify-center gap-1.5 text-center text-xs text-[#d5c4ac] border border-white/5">
            <span className="material-symbols-outlined text-[17px] text-[#00eefc]">group</span>
            <span>Kaptanından sembol sırasını iste.</span>
          </div>
        </div>

        {/* Fine Tuning & Stepper Control Slider */}
        <div className="w-full bg-[#2b273b] rounded-2xl p-3.5 flex flex-col gap-2 shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-sora text-xs font-bold text-white">İnce ayar</span>
            <span className="font-mono text-[10px] text-[#ffb703] font-bold">0.1 MHz ADIM</span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleStepDown}
              className="w-11 h-11 rounded-xl bg-[#0f0c1e] hover:bg-[#141123] flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_0_#0f0c1e] border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>

            <div className="flex-1 h-11 bg-[#0f0c1e] rounded-xl flex items-center px-3 relative overflow-hidden shadow-inner border border-white/10">
              <div className="w-full flex justify-between items-center opacity-40 px-1 font-mono text-[8px] text-[#d5c4ac]">
                <span>140</span>
                <span>141</span>
                <span>142</span>
                <span>143</span>
                <span>144</span>
                <span>145</span>
              </div>
              <div 
                className="absolute w-4 h-8 rounded bg-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.8)] flex items-center justify-center transition-all duration-150"
                style={{ left: `${Math.max(5, Math.min(95, ((currentFreq - 140) / 5) * 100))}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-0.5 h-5 bg-[#422c00] rounded-full"></div>
              </div>
            </div>

            <button
              onClick={handleStepUp}
              className="w-11 h-11 rounded-xl bg-[#0f0c1e] hover:bg-[#141123] flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_0_#0f0c1e] border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#00eefc]">cell_tower</span>
              <span className="text-xs text-[#00eefc] font-medium">Sinyal seviyesi: Güçlü</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-3 rounded bg-[#00eefc]"></div>
              <div className="w-1.5 h-4 rounded bg-[#00eefc]"></div>
              <div className="w-1.5 h-5 rounded bg-[#00eefc]"></div>
              <div className="w-1.5 h-6 rounded bg-[#00eefc]"></div>
            </div>
          </div>
        </div>

        {/* Lock Action Button */}
        <div className="w-full pt-1 flex flex-col gap-2">
          {!isLocked ? (
            <button
              onClick={handleLockFrequency}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.4)] active:translate-y-1 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>Frekansı kilitle ({formattedFreq} MHz)</span>
            </button>
          ) : (
            <button
              onClick={onAdvancePhase}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>FREKANS KİLİTLENDİ • DEVAM ET</span>
            </button>
          )}

          {lockFeedback && (
            <div className="text-center font-mono text-xs text-[#00eefc] font-bold">
              {lockFeedback}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
