import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onAdvancePhase?: () => void;
  onAction: (actionType: string, data?: any) => void;
}

export const ScreenKarantinaPhase3Bio: React.FC<Props> = ({
  state,
  onAction,
}) => {
  const kData = state.karantinaData || {
    spectralFilterNm: 415,
    selectedBase: 'sitozin-9',
    bioPhase1Transmitted: true,
    selectedUvSector: 3,
    selectedValve: 'B' as const,
    phase1Solved: true,
    polymerPct: 45,
    enzymePct: 30,
    neutroPct: 25,
    bondFreqGhz: 8.4,
    bioPhase2Injected: true,
    centrifugeRpm: 3800,
    coolingValvePct: 75,
    pressureReliefActive: true,
    phase2Solved: true,
    vacuumFlowRate: 6.2,
    bioPhase3Started: false,
    selectedChimney: 'BACA-02' as const,
    chimneyBar: 12.0,
    safetyLatchUnlocked: true,
    phase3Solved: false,
    immunityScore: 10450,
    selinAccuracy: 99.2,
    baranValves: 3,
  };

  const [flowRate, setFlowRate] = useState<number>(kData.vacuumFlowRate || 6.2);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartVacuum = () => {
    onAction('karantina_phase3_bio_start', {
      vacuumFlowRate: flowRate,
    });
  };

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-[calc(100vh-80px)] bg-[#110e1e] text-[#e6dff9] flex flex-col font-sans select-none pb-12 shadow-2xl rounded-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141123]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
            <span className="material-symbols-outlined text-[20px]">biotech</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-cyan-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>LIVE PROTOCOL</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">CRISIS CONTROL // SEC-04</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300">
            <span className="material-symbols-outlined text-[15px]">shield</span>
            <span>%{state.hullIntegrity}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#ffdba0]">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {/* Telemetry Sub-Header */}
        <section className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">ROL PROTOKOLÜ: BAŞ BİYOLOG</span>
              <span className="text-xs font-bold text-white uppercase">KONSOL-03 // GÖREV AKTİF</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">hourglass_bottom</span>
              <span className="font-mono text-xs font-black text-white">{formatTimer(state.timeLeftSeconds)}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">biotech</span>
              <span className="font-mono text-xs font-black text-cyan-300">%{state.hullIntegrity}</span>
            </div>
          </div>
        </section>

        {/* Task Title Banner */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>3. AŞAMA // DEKONTAMİNASYON PROTOKOLÜ</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-[9px] font-mono font-bold text-red-400 uppercase">
              ÖNCELİK: ACİL
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-tight">Toksik Aerosolü Vakumla & Nötralize Et</h2>
          <p className="text-xs text-[#d5c4ac] mt-1 leading-relaxed">
            Sektör 4 hava kilitlerindeki zehirli gaz konsantrasyonunu ölç. Güvenlik Şefine hangi tahliye bacasını açacağını telsizle bildir.
          </p>
        </div>

        {/* Gas Chamber Particle Visualizer */}
        <div className="bg-[#181528] border border-red-500/30 rounded-xl p-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
              <span className="material-symbols-outlined text-[16px]">air</span>
              <span>GAZ ODASI // SEKTÖR-04</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-500/30 text-[9px] font-mono font-bold text-red-300 uppercase">
              ● 820 PPM [KRİTİK]
            </span>
          </div>

          {/* Gas wave display */}
          <div className="relative w-full h-28 bg-[#0a0815] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
            {/* SVG Wave */}
            <svg className="w-full h-full opacity-60" viewBox="0 0 320 100" preserveAspectRatio="none">
              <path 
                d="M 0 50 Q 80 15, 160 50 T 320 50" 
                fill="none" 
                stroke="#ffb703" 
                strokeWidth="2" 
                strokeDasharray="4 3" 
              />
              <path 
                d="M 0 50 Q 80 85, 160 50 T 320 50" 
                fill="none" 
                stroke="#00eefc" 
                strokeWidth="2" 
              />
            </svg>

            {/* Glowing gas cloud overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/15 via-amber-500/10 to-transparent pointer-events-none"></div>

            {/* Readout badge center */}
            <div className="absolute text-center bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/40 shadow-xl">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase tracking-wider block">TOKSİK DERİŞİM</span>
              <span className="text-2xl font-mono font-black text-amber-300 leading-none">820</span>
              <span className="text-[10px] font-mono text-white ml-1">PPM</span>
              <span className="text-[9px] font-mono font-bold text-red-400 block mt-0.5">NÖTRALİZASYON GEREKLİ</span>
            </div>
          </div>
        </div>

        {/* Filter System Statuses */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase">FİLTRE SİSTEMİ STATÜLERİ</span>
            <span className="text-[10px] font-mono text-[#9e8f78]">3 BÖLÜMLÜ DÖNGÜ</span>
          </div>

          {/* 1. Filtre Alfa */}
          <div className="bg-[#201d30] border border-white/5 rounded-lg p-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">1. FİLTRE ALFA</div>
              <div className="text-[10px] text-[#9e8f78]">(Aktif Karbon)</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-mono font-bold text-cyan-400">%65</span>
              <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                <div className="w-[65%] h-full bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* 2. Filtre Beta (ALARM) */}
          <div className="bg-[#201d30] border border-amber-500/40 rounded-lg p-2 flex items-center justify-between shadow-[0_0_10px_rgba(255,183,3,0.15)]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">warning</span>
              <div>
                <div className="text-xs font-bold text-amber-200">2. FİLTRE BETA</div>
                <div className="text-[10px] text-[#9e8f78]">(HEPA-Bio)</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-[#ffb703]">%92</span>
                <span className="text-[9px] font-mono font-bold text-red-400">KRİTİK</span>
              </div>
              <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                <div className="w-[92%] h-full bg-[#ffb703] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* 3. Filtre Gama */}
          <div className="bg-[#201d30] border border-white/5 rounded-lg p-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">3. FİLTRE GAMA</div>
              <div className="text-[10px] text-[#9e8f78]">(UV Katalizör)</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-cyan-400">%40</span>
                <span className="text-[9px] font-mono text-cyan-300">NOMİNAL</span>
              </div>
              <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                <div className="w-[40%] h-full bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Secret Intel Note */}
        <div className="bg-[#1c192c] border-l-4 border-l-[#ffb703] border-y border-r border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[#ffb703] font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>YALNIZCA BİYOLOG // GİZLİ TEŞHİS</span>
          </div>
          <div className="text-xs font-extrabold text-[#ffb703] mt-1">
            TEŞHİS NOTU:
          </div>
          <p className="text-xs font-bold text-white mt-0.5 leading-snug">
            Gaz birikimi <span className="text-amber-300 underline font-black">BACA-02</span> hattında yoğunlaştı. Güvenlik Şefi BACA-02 tahliye sürgüsünü <span className="text-cyan-300 underline font-black">12 Bar</span> basınca ayarlamalı!
          </p>
        </div>

        {/* Vacuum Pump Flow Rate Slider */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">cyclone</span>
              <span>VAKUM POMPA DEBİSİ</span>
            </div>
            <span className="text-sm font-mono font-black text-cyan-400">{flowRate.toFixed(1)} m³/sn</span>
          </div>

          <input 
            type="range"
            min={1.0}
            max={12.0}
            step={0.1}
            value={flowRate}
            onChange={(e) => {
              const val = Number(e.target.value);
              setFlowRate(val);
              onAction('karantina_set_vacuum_flow', { value: val });
            }}
            className="w-full accent-cyan-400 h-2 bg-[#2b273b] rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-[#9e8f78]">
            <span>1.0 MIN</span>
            <span className="text-cyan-300 font-bold">OPTİMAL: 6.2</span>
            <span>12.0 MAX</span>
          </div>
        </div>

        {/* Live Radio Bar */}
        <div className="bg-[#181528] border border-cyan-500/20 rounded-xl p-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-white uppercase truncate">
                TELSİZ FREKANSI // GÜVENLİK ŞEFİ
              </div>
              <p className="text-[11px] text-cyan-200/90 truncate">
                &quot;Şef, Sektör 4 hava kilidini mühürlü tut, BACA-02&apos;yi 12 Bar&apos;a ayarla!&quot;
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 animate-pulse">cell_tower</span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleStartVacuum}
          className={`w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
            kData.bioPhase3Started
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/25'
              : 'bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {kData.bioPhase3Started ? 'check_circle' : 'cyclone'}
          </span>
          <span>
            {kData.bioPhase3Started ? 'VAKUM DÖNGÜSÜ BAŞLATILDI (TAHLİYE BEKLENİYOR)' : 'VAKUM DÖNGÜSÜNÜ BAŞLAT'}
          </span>
        </button>

        {/* Footnote Warning */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#ffb4ab]">
          <span className="material-symbols-outlined text-[14px] text-red-400">shield</span>
          <span>Yanlış baca açılırsa laboratuvar atmosferine virüs sızar.</span>
        </div>
      </main>
    </div>
  );
};
