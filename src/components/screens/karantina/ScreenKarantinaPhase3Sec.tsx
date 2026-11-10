import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onAdvancePhase?: () => void;
  onAction: (actionType: string, data?: any) => void;
}

export const ScreenKarantinaPhase3Sec: React.FC<Props> = ({
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
    bioPhase3Started: true,
    selectedChimney: 'BACA-02' as const,
    chimneyBar: 12.0,
    safetyLatchUnlocked: true,
    phase3Solved: false,
    immunityScore: 10450,
    selinAccuracy: 99.2,
    baranValves: 3,
  };

  const [chimney, setChimney] = useState<'BACA-01' | 'BACA-02' | 'BACA-03'>(kData.selectedChimney || 'BACA-02');
  const [bar, setBar] = useState<number>(kData.chimneyBar || 12.0);
  const [latchUnlocked, setLatchUnlocked] = useState<boolean>(kData.safetyLatchUnlocked ?? true);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdjustBar = (delta: number) => {
    const nextBar = Math.max(0, Math.min(25, Number((bar + delta).toFixed(1))));
    setBar(nextBar);
    onAction('karantina_phase3_sec_adjust_bar', { delta });
  };

  const handleToggleLatch = () => {
    setLatchUnlocked(!latchUnlocked);
    onAction('karantina_phase3_sec_toggle_latch');
  };

  const handleFire = () => {
    onAction('karantina_phase3_sec_solve', {
      chimney,
      bar,
      safetyLatchUnlocked: latchUnlocked,
    });
  };

  // Bar gauge percent: 0 to 25 Bar
  const gaugePercent = bar / 25;
  const strokeDashoffset = 283 - 283 * Math.min(1, Math.max(0, gaugePercent));

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-[calc(100vh-80px)] bg-[#110e1e] text-[#e6dff9] flex flex-col font-sans select-none pb-12 shadow-2xl rounded-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141123]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ffb703] uppercase">
              <span>K2088</span>
              <span className="text-[#9e8f78]">//</span>
              <span className="text-cyan-400 font-bold">SEC-04</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Taktiksel Konsol</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {/* Telemetry Sub-Header */}
        <section className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">GÜVENLİK ŞEFİ // PNÖMATİK TAHLİYE</span>
              <span className="text-xs font-bold text-white uppercase">KONSOL AKTİF #K-88</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">timer</span>
              <span className="font-mono text-xs font-black text-white">{formatTimer(state.timeLeftSeconds)}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">shield</span>
              <span className="font-mono text-xs font-black text-cyan-300">%{state.hullIntegrity}</span>
            </div>
          </div>
        </section>

        {/* Task Title Banner */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffb703] uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-pulse"></span>
              <span>3. AŞAMA // PNÖMATİK TAHLİYE BACALARI</span>
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-tight">Basınç Tahliyesini Ateşle</h2>
          <p className="text-xs text-[#d5c4ac] mt-1 leading-relaxed">
            Biyoloğun bildirdiği <strong className="text-amber-300">BACA-02</strong> sürgüsünü seçip pnömatik basıncı tam <strong className="text-cyan-300">12 Bar</strong>&apos;a kalibre ederek tahliyeyi tetikleyin.
          </p>
        </div>

        {/* Live Radio Callout */}
        <div className="bg-[#181528] border-l-4 border-l-cyan-400 border-y border-r border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <span className="material-symbols-outlined text-[16px]">podcasts</span>
              <span>BAŞ BİYOLOG // CANLI TELSİZ</span>
            </div>
            <span className="text-[10px] font-mono text-[#9e8f78]">FREQ: 142.80 MHZ</span>
          </div>
          <p className="text-xs font-bold text-amber-200 italic bg-[#0f0c1e] p-2 rounded-lg border border-white/5">
            &ldquo;Gaz birikimi BACA-02 hattında yoğunlaştı! Tahliye sürgüsünü tam 12 Bar basınca ayarla!&rdquo;
          </p>
        </div>

        {/* Chimney Vents Selector (3 Units) */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">air</span>
              <span>TAHLİYE BACALARI</span>
            </div>
            <span className="text-[10px] font-mono text-[#ffb703] font-bold">HEDEF: BACA-02</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* BACA-01 */}
            <button
              type="button"
              onClick={() => {
                setChimney('BACA-01');
                onAction('karantina_phase3_sec_select_chimney', { chimney: 'BACA-01' });
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                chimney === 'BACA-01'
                  ? 'bg-cyan-950/40 border-cyan-400'
                  : 'bg-[#201d30] border-white/5 hover:border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] text-slate-400 block mx-auto">heat_pump</span>
              <div className="text-xs font-bold text-white mt-1">BACA-01</div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">KAPALI // 6 Bar</div>
            </button>

            {/* BACA-02 (TARGET) */}
            <button
              type="button"
              onClick={() => {
                setChimney('BACA-02');
                onAction('karantina_phase3_sec_select_chimney', { chimney: 'BACA-02' });
              }}
              className={`p-2.5 rounded-xl border text-center transition-all relative ${
                chimney === 'BACA-02'
                  ? 'bg-amber-950/50 border-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.3)]'
                  : 'bg-[#201d30] border-white/10 hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] text-[#ffb703] block mx-auto">warning</span>
              <div className="text-xs font-bold text-[#ffdba0] mt-1">BACA-02</div>
              <div className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">12 Bar Gerekli</div>
            </button>

            {/* BACA-03 (BLOCKED) */}
            <div className="p-2.5 rounded-xl border border-white/5 bg-[#171424] opacity-50 text-center">
              <span className="material-symbols-outlined text-[22px] text-slate-500 block mx-auto">lock</span>
              <div className="text-xs font-bold text-slate-400 mt-1">BACA-03</div>
              <div className="text-[9px] font-mono text-slate-500 mt-0.5">DEVRE DIŞI</div>
            </div>
          </div>
        </div>

        {/* Pneumatic Bar Manometer Circular Gauge */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-4 flex flex-col items-center shadow-md relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">speed</span>
              <span>PNÖMATİK BAR MANOMETRESİ</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#ffb703] font-bold">
              HEDEF: 12.0 BAR
            </span>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center my-1">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#2b273b"
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset="70"
                strokeLinecap="round"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={Math.abs(bar - 12.0) < 0.1 ? '#00eefc' : '#ffb703'}
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-[10px] font-mono text-[#9e8f78] uppercase tracking-wider">PNÖMATİK BASINÇ</span>
              <span className="text-3xl font-mono font-black text-white tracking-tight">
                {bar.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-300">BAR (ATM)</span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full mt-3">
            <button
              type="button"
              onClick={() => handleAdjustBar(-0.5)}
              className="py-2.5 px-3 rounded-xl bg-[#201d30] border border-white/10 hover:border-white/20 active:scale-95 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
              <span>-0.5 BAR</span>
            </button>

            <button
              type="button"
              onClick={() => handleAdjustBar(0.5)}
              className="py-2.5 px-3 rounded-xl bg-[#201d30] border border-white/10 hover:border-white/20 active:scale-95 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle_outline</span>
              <span>+0.5 BAR</span>
            </button>
          </div>
        </div>

        {/* Safety Latch Toggle */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">lock_open</span>
            <div>
              <div className="text-xs font-bold text-white uppercase">EMNİYET MANDALI</div>
              <div className="text-[10px] font-mono text-[#9e8f78]">GÜVENLİK KİLİDİ KORUMASI</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleLatch}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              latchUnlocked
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,238,252,0.25)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${latchUnlocked ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{latchUnlocked ? 'KİLİT AÇIK' : 'KİLİTLİ'}</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleFire}
          className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
          <span>BACA-02 TAHLİYESİNİ ATEŞLE (12 BAR)</span>
        </button>
      </main>
    </div>
  );
};
