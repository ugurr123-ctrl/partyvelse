import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen06ReactorEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const [activeCartridge, setActiveCartridge] = useState<'CIR-01' | 'CIR-02' | 'CIR-03' | 'CIR-04' | 'CIR-05' | 'CIR-06'>('CIR-03');
  const [coolingValveAngle, setCoolingValveAngle] = useState(45);
  const [pressureThrottleToggled, setPressureThrottleToggled] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'reaktor' | 'anten' | 'yasam' | 'kargo'>('reaktor');
  const [feedback, setFeedback] = useState<string>(
    state.diagnostic.isSolved ? 'Reaktör basınca tahliye edildi! Devreler stabil.' : ''
  );

  const handleRotateCooling = () => {
    setCoolingValveAngle((prev) => (prev === 45 ? 135 : prev === 135 ? -45 : 45));
  };

  const handleToggleThrottle = () => {
    setPressureThrottleToggled((prev) => !prev);
  };

  const handlePurgePressure = () => {
    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        engineerSuggestedLine: 'anten',
        isSolved: true,
      },
    }));
    setFeedback('Basınç tahliyesi uygulandı! Kaptanın K3 kesicisini devreden çıkarması bekleniyor / onaylandı.');
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-header & Role Identification */}
      <div className="pt-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">build</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS KONSOLU</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#2b273b] border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping"></span>
            <span className="font-mono text-[9px] text-rose-300 font-bold uppercase">KRİTİK UYARI</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sora text-2xl font-bold text-white tracking-tight">Reaktörü</span>
          <span className="font-sora text-2xl font-extrabold text-[#00eefc] tracking-tight drop-shadow-[0_0_12px_rgba(0,238,252,0.4)]">dengele</span>
        </div>
      </div>

      {/* Reactor Centerpiece & Circuit Array Stage */}
      <div className="relative mt-2">
        <div className="relative w-full rounded-2xl bg-[#0f0c1e] overflow-hidden shadow-2xl p-2 border border-white/10">
          <div 
            className="w-full h-72 rounded-xl bg-cover bg-center relative overflow-hidden flex items-center justify-center shadow-inner" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQp7LKUYjGCeLCIyJBpt6ky7NN_yjlBF0LWkNy8c9HwNVHsUF4hKFGWKFjkaq3gTMS_G6gve35xaOn3HcZexf7iKy8dfbuX9ZiFQUjd8sWUqDFnEZvv3vXt4m4i7pEgX3sa5X7bBE0_0d0ss-pf6RwWTsVBlpurVqKGlINrYlem0nf8Ppqx3iFbouAojK0oQNh98_3VCl2leYdgrnOm6lcYasBaqTjJxp52rSyOl0')" }}
          >
            {/* Particle & Conduit Glow Visual Canvas */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 340 288">
              <defs>
                <radialGradient cx="50%" cy="50%" id="coreGlow" r="50%">
                  <stop offset="0%" stopColor="#ffb703" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#ff8c00" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#141123" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="cyanConduit" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#00eefc" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#00eefc" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="dangerConduit" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#93000a" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Dynamic Conduit Paths radiating from core (170, 144) */}
              <line stroke="url(#cyanConduit)" strokeDasharray="4 2" strokeWidth="3" x1="170" x2="170" y1="144" y2="48" />
              <line stroke="url(#cyanConduit)" strokeWidth="2.5" x1="170" x2="80" y1="144" y2="78" />
              <line className="animate-pulse" stroke="url(#dangerConduit)" strokeWidth="3.5" x1="170" x2="260" y1="144" y2="78" />
              <line stroke="url(#cyanConduit)" strokeWidth="2.5" x1="170" x2="80" y1="144" y2="210" />
              <line stroke="#ffba27" strokeDasharray="3 3" strokeWidth="3" x1="170" x2="170" y1="144" y2="240" />
              <line stroke="url(#cyanConduit)" strokeWidth="2.5" x1="170" x2="260" y1="144" y2="210" />
              <circle className="animate-pulse" cx="170" cy="144" fill="url(#coreGlow)" r="38" />
            </svg>

            {/* 2.5D Core Turbine Center Hub */}
            <div className="relative z-20 w-20 h-20 rounded-full bg-[#2b273b] flex items-center justify-center shadow-[0_0_24px_rgba(255,183,3,0.45)] border border-[#ffb703]/50">
              <div className="w-14 h-14 rounded-full bg-[#0f0c1e] flex items-center justify-center">
                <span className="material-symbols-outlined text-[30px] text-[#ffb703] animate-spin" style={{ animationDuration: '9s' }}>cyclone</span>
              </div>
            </div>

            {/* CIR-01 Top */}
            <button 
              onClick={() => setActiveCartridge('CIR-01')}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-01' ? 'border-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-01</span>
              </div>
            </button>

            {/* CIR-02 Top Left */}
            <button 
              onClick={() => setActiveCartridge('CIR-02')}
              className="absolute top-14 left-4 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-02' ? 'border-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-02</span>
              </div>
            </button>

            {/* CIR-03 Top Right (CRITICAL TARGET) */}
            <button 
              onClick={() => setActiveCartridge('CIR-03')}
              className="absolute top-14 right-4 z-20 flex flex-col items-end cursor-pointer"
            >
              <div className="px-2 py-0.5 rounded bg-rose-900/90 text-rose-200 shadow-[0_0_12px_rgba(255,180,171,0.5)] flex items-center gap-1 animate-bounce border border-rose-500/50">
                <span className="material-symbols-outlined text-[12px]">warning</span>
                <span className="font-mono text-[9px] uppercase font-bold">AŞIRI YÜK</span>
              </div>
              <div className="mt-1 px-2.5 py-0.5 rounded bg-[#2b273b] text-white shadow border border-rose-500">
                <span className="font-mono text-[10px] font-bold text-rose-400">CIR-03</span>
              </div>
            </button>

            {/* CIR-04 Bottom Left */}
            <button 
              onClick={() => setActiveCartridge('CIR-04')}
              className="absolute bottom-14 left-4 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-04' ? 'border-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-04</span>
              </div>
            </button>

            {/* CIR-05 Bottom */}
            <button 
              onClick={() => setActiveCartridge('CIR-05')}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-05' ? 'border-[#ffb703]' : 'border-white/5'}`}>
                <span className="material-symbols-outlined text-[13px] text-[#ffb703]">lock</span>
                <span className="font-mono text-[10px] text-[#ffb703] font-bold">CIR-05</span>
              </div>
            </button>

            {/* CIR-06 Bottom Right */}
            <button 
              onClick={() => setActiveCartridge('CIR-06')}
              className="absolute bottom-14 right-4 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-06' ? 'border-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-06</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Bar: Active Cartridge CIR-03 Readout */}
      <div className="mt-1">
        <div className="w-full rounded-2xl bg-[#1c192c] p-3.5 shadow-md flex flex-col gap-2 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span className="font-sora text-sm font-bold text-white tracking-wide">{activeCartridge} ANALİZ</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 flex items-center gap-1 font-mono text-[9px] uppercase font-bold border border-rose-500/30">
              <span className="material-symbols-outlined text-[12px]">emergency_home</span>
              <span>TEHLİKE LİMİTİ AŞILDI</span>
            </div>
          </div>

          {/* Real-Time Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-0.5 font-mono">
            {/* Sıcaklık */}
            <div className="rounded-xl bg-[#201d30] p-2 flex flex-col items-center justify-center border border-white/5">
              <div className="flex items-center gap-1 text-rose-400 mb-0.5">
                <span className="material-symbols-outlined text-[15px]">device_thermostat</span>
                <span className="text-[9px]">SICAKLIK</span>
              </div>
              <span className="text-sm font-bold text-rose-400">84°C</span>
              <span className="text-[8px] text-[#d5c4ac] mt-0.5">Eşik: ≥80°C</span>
            </div>
            {/* Basınç */}
            <div className="rounded-xl bg-[#201d30] p-2 flex flex-col items-center justify-center border border-white/5">
              <div className="flex items-center gap-1 text-[#00eefc] mb-0.5">
                <span className="material-symbols-outlined text-[15px]">speed</span>
                <span className="text-[9px]">BASINÇ</span>
              </div>
              <span className="text-sm font-bold text-[#00eefc]">36 kPa</span>
              <span className="text-[8px] text-[#d5c4ac] mt-0.5">Eşik: ≤40 kPa</span>
            </div>
            {/* Parazit */}
            <div className="rounded-xl bg-[#201d30] p-2 flex flex-col items-center justify-center border border-white/5">
              <div className="flex items-center gap-1 text-rose-400 mb-0.5">
                <span className="material-symbols-outlined text-[15px]">query_stats</span>
                <span className="text-[9px]">PARAZİT</span>
              </div>
              <span className="text-sm font-bold text-rose-400">69 dB</span>
              <span className="text-[8px] text-[#d5c4ac] mt-0.5">Eşik: ≥65 dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Mechanical Dual Controls */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        {/* Rotary Knob Valve: Soğutma Valfi */}
        <div className="rounded-2xl bg-[#201d30] p-3 flex flex-col justify-between shadow-lg border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[16px]">mode_fan</span>
            </div>
            <span className="font-mono text-[10px] text-white uppercase font-bold">Soğutma Valfi</span>
          </div>

          {/* SVG Tactile Arc Dial */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
              <path d="M 25 95 A 45 45 0 1 1 95 95" fill="none" stroke="#2b273b" strokeLinecap="round" strokeWidth="8"></path>
              <path d="M 25 95 A 45 45 0 0 1 60 15" fill="none" stroke="#00eefc" strokeLinecap="round" strokeWidth="8"></path>
              <path d="M 60 15 A 45 45 0 0 1 95 95" fill="none" opacity="0.6" stroke="#ffb4ab" strokeLinecap="round" strokeWidth="8"></path>
            </svg>

            {/* Tactile Physical Knob */}
            <button 
              onClick={handleRotateCooling}
              aria-label="Valf Pozisyonunu Ayarla" 
              className="absolute w-18 h-18 rounded-full bg-[#2b273b] shadow-[0_6px_0_#0f0c1e] active:translate-y-1 flex items-center justify-center transition-transform cursor-pointer border border-white/10"
            >
              <div className="w-14 h-14 rounded-full bg-[#0f0c1e] flex items-center justify-center relative shadow-inner">
                <div 
                  className="w-3 h-8 rounded-full bg-[#3a374b] flex flex-col items-center justify-start pt-1 shadow transition-transform duration-300"
                  style={{ transform: `rotate(${coolingValveAngle}deg)` }}
                >
                  <div className="w-1.5 h-2 rounded bg-[#00eefc]"></div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between px-1 pt-1 font-mono text-[9px] text-[#d5c4ac]">
            <span>KAPALI</span>
            <span className="text-[#00eefc] font-bold">AÇIK (75%)</span>
          </div>
        </div>

        {/* Vertical Heavy Throttle: Basınç Tahliye */}
        <div className="rounded-2xl bg-[#201d30] p-3 flex flex-col justify-between shadow-lg border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703]">
              <span className="material-symbols-outlined text-[16px]">air</span>
            </div>
            <span className="font-mono text-[10px] text-white uppercase font-bold">Basınç Tahliye</span>
          </div>

          {/* Vertical Slider Well Track */}
          <div 
            onClick={handleToggleThrottle}
            className="relative w-full h-32 my-1 rounded-xl bg-[#0f0c1e] flex justify-center items-center shadow-inner overflow-hidden p-1 cursor-pointer"
          >
            <div className="w-14 h-full relative rounded-md bg-[#2b273b]/40 flex justify-center">
              <div 
                className="absolute w-12 h-14 rounded-lg bg-[#363246] shadow-[0_4px_0_#0f0c1e] flex flex-col items-center justify-center p-1 transition-all duration-300"
                style={{ bottom: pressureThrottleToggled ? '3.5rem' : '0.4rem' }}
              >
                <div className="w-full h-full rounded bg-[#ffb703]/20 flex flex-col items-center justify-center gap-0.5">
                  <span className="material-symbols-outlined text-[#ffb703] text-[18px]">keyboard_double_arrow_up</span>
                  <div className="w-6 h-1 rounded-full bg-[#ffb703]/60"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 font-mono text-[9px] text-[#d5c4ac]">
            <span>0 kPa</span>
            <span className="text-[#ffb703] font-bold">{pressureThrottleToggled ? 'TAHLİYE AKTİF' : 'BEKLEMEDE'}</span>
          </div>
        </div>
      </div>

      {/* Coordination Status & Action Trigger */}
      <div className="mt-1 flex flex-col gap-2">
        <div className="w-full py-2 px-3 rounded-xl bg-[#1c192c] flex items-center justify-center gap-2 text-[#d5c4ac] border border-white/5 text-xs">
          <span className="material-symbols-outlined text-[17px] text-[#ffb703]">lock_clock</span>
          <span className="text-[11px] font-mono">Kaptanın ana güvenlik kilidini açması bekleniyor</span>
        </div>

        {feedback && (
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 text-center font-mono">
            {feedback}
          </div>
        )}

        {!state.diagnostic.isSolved ? (
          <button
            onClick={handlePurgePressure}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-b from-[#ffb703] to-[#ea580c] shadow-[0_5px_0_#8a4b00,0_8px_20px_rgba(255,183,3,0.35)] active:translate-y-1 active:shadow-[0_1px_0_#8a4b00] flex items-center justify-center gap-2 text-[#422c00] font-sora font-extrabold text-sm uppercase tracking-wide cursor-pointer transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">airwave</span>
            <span>Basıncı tahliye et & Teşhisi İlet</span>
          </button>
        ) : (
          <button
            onClick={onAdvancePhase}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>REAKTÖR KARARLI • SONRAKİ AŞAMAYA GEÇ</span>
          </button>
        )}
      </div>

      {/* Bottom Console Navigation Deck */}
      <div className="mt-3">
        <div className="w-full rounded-xl bg-[#1c192c] p-1.5 grid grid-cols-4 gap-1 shadow-md border border-white/5">
          <button 
            onClick={() => setActiveNavTab('reaktor')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'reaktor' ? 'bg-[#201d30] text-[#ffb703] shadow font-bold' : 'text-[#d5c4ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">solar_power</span>
            <span className="font-mono text-[9px] mt-0.5">Reaktör</span>
          </button>
          <button 
            onClick={() => setActiveNavTab('anten')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'anten' ? 'bg-[#201d30] text-[#00eefc] shadow font-bold' : 'text-[#d5c4ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings_input_antenna</span>
            <span className="font-mono text-[9px] mt-0.5">Anten</span>
          </button>
          <button 
            onClick={() => setActiveNavTab('yasam')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'yasam' ? 'bg-[#201d30] text-[#00eefc] shadow font-bold' : 'text-[#d5c4ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">eco</span>
            <span className="font-mono text-[9px] mt-0.5">Yaşam</span>
          </button>
          <button 
            onClick={() => setActiveNavTab('kargo')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeNavTab === 'kargo' ? 'bg-[#201d30] text-[#00eefc] shadow font-bold' : 'text-[#d5c4ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span className="font-mono text-[9px] mt-0.5">Kargo</span>
          </button>
        </div>
      </div>

    </div>
  );
};
