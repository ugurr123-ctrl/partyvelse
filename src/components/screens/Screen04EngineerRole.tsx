import React from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const Screen04EngineerRole: React.FC<Props> = ({ state, onConfirmRole }) => {
  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[920px] bg-[#120f24] text-white relative flex flex-col justify-between overflow-hidden rounded-[44px] shadow-2xl border border-[#272347] antialiased select-none animate-fadeIn font-sans">
      
      {/* Background Blueprint / Holo Grid Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#00eefc_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Top Cyan Radial Atmospheric Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00eefc]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col flex-1 pb-6 justify-between">
        
        {/* TopBar */}
        <header className="flex items-center justify-between px-6 pt-6 pb-2">
          {/* Brand Logo & Orbital Glyph */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.7)]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <ellipse cx="12" cy="12" rx="7" ry="7"></ellipse>
                <ellipse cx="12" cy="12" rx="11" ry="3.8" transform="rotate(-30 12 12)"></ellipse>
              </svg>
            </div>
            <span className="font-black text-sm tracking-[0.2em] text-white uppercase drop-shadow-sm font-sora">
              PARTYVERSE
            </span>
          </div>

          {/* Top Right Gear */}
          <div className="w-9 h-9 rounded-xl bg-[#1d1938]/80 border border-white/10 flex items-center justify-center text-slate-300">
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </header>

        {/* Hero Character Section */}
        <section className="relative w-full h-[270px] flex items-center justify-center overflow-visible mt-1">
          {/* Deep Space Orbit Background & Holographic Diagrams */}
          <div className="absolute inset-0 mx-4 rounded-3xl overflow-hidden bg-gradient-to-b from-[#14122d] via-[#101c38] to-[#0c0a1a] border border-cyan-500/20">
            {/* Background Celestial Earth/Moon Planet Arc */}
            <div className="absolute -top-12 -right-8 w-56 h-56 rounded-full bg-gradient-to-bl from-cyan-400/30 via-indigo-600/20 to-transparent blur-md"></div>
            {/* Holographic Schematic HUD Rings */}
            <div className="absolute top-8 left-4 w-32 h-32 rounded-full border border-cyan-400/20 pointer-events-none"></div>
            <div className="absolute top-12 left-8 w-24 h-24 rounded-full border border-dashed border-cyan-400/30 animate-spin pointer-events-none" style={{ animationDuration: '30s' }}></div>
            {/* Holographic Circuit Vector Overlays */}
            <svg className="absolute top-2 right-2 w-44 h-44 text-cyan-400/30 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 200 200">
              <rect height="40" rx="4" strokeDasharray="2 3" width="60" x="20" y="20"></rect>
              <circle cx="120" cy="50" r="28"></circle>
              <circle cx="120" cy="50" r="10"></circle>
              <path d="M 80 40 L 92 40 L 100 50 L 120 50"></path>
              <path d="M 120 78 L 120 110 L 150 110"></path>
              <circle cx="150" cy="110" fill="currentColor" r="3"></circle>
              <path d="M 40 60 L 40 100 L 70 130"></path>
              <circle cx="70" cy="130" fill="currentColor" r="2.5"></circle>
            </svg>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#120f24] via-[#120f24]/85 to-transparent"></div>
          </div>

          {/* Stylized Sci-Fi Engineer Illustration */}
          <div className="relative z-10 w-52 h-52 flex items-center justify-center transform translate-y-1">
            <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(0,238,252,0.35)]">
              <img 
                alt="Mühendis Karakteri" 
                className="w-full h-full object-cover object-top select-none" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoeQN2pLWf8Xj8TxKoQJTTjpc9CsSHTF5JxwfmESK0bsLl_Kyh6Iux2FofuEtAWJigxSdB3vVnrkTLj6hpBR59wJ-lzOi-ZYd2q6m5lU7yOlMZ6lvzGFY2r5Tp3yffa2XhDCZ2SykuiFajBooH6M_buYGjfh8bol08jD3Fc0bAjP_jT3sdW2u61qvqBk2uo1DrqLaecld0x7BSi6bHLhJudQW63uoFwue1Te-7sj8" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120f24] via-transparent to-transparent opacity-60 pointer-events-none"></div>
              <div className="absolute inset-0 border border-cyan-300/30 rounded-3xl pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Role Identity Title Section */}
        <section className="flex flex-col items-center text-center -mt-4 z-20 px-6">
          <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-[#2a1d0f] via-[#452e0e] to-[#2a1d0f] border border-[#ffb703]/70 shadow-[0_0_16px_rgba(255,183,3,0.25)] mb-2">
            <svg className="w-3.5 h-3.5 text-[#ffb703]" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 00-7.5 0v3h7.5z" fillRule="evenodd"></path>
            </svg>
            <span className="text-[11px] font-black tracking-widest text-[#ffb703] uppercase font-mono">SANA ÖZEL</span>
          </div>

          <h1 className="text-4xl sm:text-[42px] font-sora font-extrabold uppercase tracking-wide bg-gradient-to-b from-[#f0fdff] via-[#8df9ff] to-[#00c8e0] bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(0,238,252,0.55)] leading-tight">
            MÜHENDİSSİN
          </h1>
          <p className="text-sm font-medium text-slate-300/95 tracking-wide mt-1">
            Ölçümler sende. Prosedürler kaptanda.
          </p>
        </section>

        {/* 3 Structured Responsibility Cards with Glowing Cyan Circular Icons */}
        <section className="mt-3 px-5 space-y-2.5">
          {/* Item 1 */}
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141227]/90 border border-cyan-400/25 backdrop-blur-md shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#0a1e30] border border-cyan-400/50 flex-shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.45)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="text-sm font-bold text-white tracking-wide font-sora">Ölçümleri oku</h2>
              <p className="text-[12px] leading-snug text-slate-300">Sensör, frekans ve reaktör değerlerini kaptana aktar.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141227]/90 border border-cyan-400/25 backdrop-blur-md shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#0a1e30] border border-cyan-400/50 flex-shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.45)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="4" x2="4" y1="21" y2="14"></line>
                <line x1="4" x2="4" y1="10" y2="3"></line>
                <line x1="12" x2="12" y1="21" y2="12"></line>
                <line x1="12" x2="12" y1="8" y2="3"></line>
                <line x1="20" x2="20" y1="21" y2="16"></line>
                <line x1="20" x2="20" y1="12" y2="3"></line>
                <line x1="1" x2="7" y1="14" y2="14"></line>
                <line x1="9" x2="15" y1="8" y2="8"></line>
                <line x1="17" x2="23" y1="16" y2="16"></line>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="text-sm font-bold text-white tracking-wide font-sora">Sistemleri yönet</h2>
              <p className="text-[12px] leading-snug text-slate-300">Kaptanın talimatlarına göre vanaları ve kabloları bağla.</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141227]/90 border border-cyan-400/25 backdrop-blur-md shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#0a1e30] border border-cyan-400/50 flex-shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.45)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="text-sm font-bold text-white tracking-wide font-sora">Enerjiyi paylaştır</h2>
              <p className="text-[12px] leading-snug text-slate-300">Hat kayıplarını hesaplayıp reaktör dengesini kur.</p>
            </div>
          </div>
        </section>

        {/* Captain Status Strip with pulsing dots and helmet outline */}
        <section className="mt-3 px-5">
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#1a162b]/90 border border-amber-500/25 shadow-md">
            <div className="relative w-12 h-12 rounded-full bg-[#201c38] border border-amber-500/40 flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400/90" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2a8 8 0 0 0-8 8v3a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6v-3a8 8 0 0 0-8-8Z"></path>
                <path d="M8 11h8a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-1a2 2 0 0 1 2-2Z"></path>
                <line x1="9" x2="15" y1="22" y2="22"></line>
              </svg>
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#120f24] rounded-full"></span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white tracking-wide font-sora">Kaptanın hazırlanıyor.</h3>
              <p className="text-[11.5px] leading-snug text-slate-300">Telsiz bağlantısı kuruldu, görev brifingi bekleniyor.</p>
              
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]/70 animate-pulse" style={{ animationDelay: '200ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]/40 animate-pulse" style={{ animationDelay: '400ms' }}></span>
              </div>
            </div>
          </div>
        </section>

        {/* Large Arcade Beveled Golden Confirmation Button */}
        <footer className="mt-4 px-5 pt-1">
          <button 
            onClick={onConfirmRole}
            className="w-full h-14 rounded-2xl bg-gradient-to-b from-[#ffcf25] via-[#f59e0b] to-[#d97706] shadow-[0_8px_0_#b45309,0_12px_25px_rgba(251,191,36,0.38),inset_0_2px_2px_rgba(255,255,255,0.6)] active:translate-y-1 active:shadow-[0_4px_0_#b45309] flex items-center justify-center space-x-2 text-stone-950 font-black text-lg tracking-wide uppercase transition-transform select-none cursor-pointer" 
            type="button"
          >
            <span className="drop-shadow-sm font-extrabold tracking-wider font-sora">Rolümü anladım</span>
            <svg className="w-5 h-5 text-stone-950 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </footer>

      </div>

      {/* Bottom Home Indicator Bar (iOS Style) */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mb-2 pointer-events-none"></div>
    </div>
  );
};
