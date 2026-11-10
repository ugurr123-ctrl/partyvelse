import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onAdvancePhase?: () => void;
  onAction: (actionType: string, data?: any) => void;
}

export const ScreenKarantinaPhase1Sec: React.FC<Props> = ({
  state,
  onAction,
}) => {
  const kData = state.karantinaData || {
    spectralFilterNm: 415,
    selectedBase: 'sitozin-9',
    bioPhase1Transmitted: true,
    selectedUvSector: 3,
    selectedValve: 'B' as const,
    phase1Solved: false,
    polymerPct: 45,
    enzymePct: 30,
    neutroPct: 25,
    bondFreqGhz: 8.4,
    bioPhase2Injected: false,
    centrifugeRpm: 3800,
    coolingValvePct: 75,
    pressureReliefActive: true,
    phase2Solved: false,
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

  const [selectedSector, setSelectedSector] = useState<number>(kData.selectedUvSector || 3);
  const [selectedValve, setSelectedValve] = useState<'A' | 'B' | 'C'>(kData.selectedValve || 'B');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeal = () => {
    onAction('karantina_phase1_sec_solve', {
      sector: selectedSector,
      valve: selectedValve,
    });
  };

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
            <span className="material-symbols-outlined text-cyan-400 text-[18px]">security</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">KONSOL KODU: SEC-04</span>
              <span className="text-xs font-bold text-white uppercase">GÜVENLİK ŞEFİ BARAN</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">timer</span>
              <span className="font-mono text-xs font-black text-white">{formatTimer(state.timeLeftSeconds)}</span>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-[#9e8f78]">BÜTÜNLÜK</span>
                <span className="font-mono text-xs font-black text-cyan-300">%{state.hullIntegrity}</span>
              </div>
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-cyan-400 rounded-full" 
                  style={{ width: `${state.hullIntegrity}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Task Title Banner */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffb703] uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-pulse"></span>
              <span>1. AŞAMA // SEKTÖR İZOLASYONU</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-[9px] font-mono font-bold text-red-400 uppercase">
              ÖNCELİK: KRİTİK
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-tight">UV Koridorunu ve Hava Kilidini Mühürle</h2>
          <p className="text-xs text-[#d5c4ac] mt-1 leading-relaxed">
            Biyoloğun telsizden aktardığı mutasyonlu <strong className="text-amber-300">UV Sektör 3</strong>&apos;ü ve acil durum mekanik vanasını derhal kilitleyin.
          </p>
        </div>

        {/* Live Radio Box */}
        <div className="bg-[#181528] border-l-4 border-l-cyan-400 border-y border-r border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <span className="material-symbols-outlined text-[16px]">podcasts</span>
              <span>BAŞ BİYOLOG // CANLI TELSİZ</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#9e8f78]">
              <span>FREKANS 142.80 MHZ</span>
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse"></span>
                <span className="w-0.5 h-3 bg-cyan-400 animate-pulse"></span>
                <span className="w-0.5 h-2 bg-cyan-400 animate-pulse"></span>
              </span>
            </div>
          </div>
          <p className="text-xs font-bold text-amber-200 italic bg-[#0f0c1e] p-2 rounded-lg border border-white/5">
            &ldquo;Kritik mutasyon Sitozin-9 bağında! UV Sektör 3 ve Vana-B derhal kilitlenmeli!&rdquo;
          </p>
        </div>

        {/* UV Matrix Grid */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">grid_view</span>
              <span>UV MATRİS IZGARASI</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#ffb703]">SPEKTRUM HEDEF: 415 NM</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Sektör 01 */}
            <button
              type="button"
              onClick={() => {
                setSelectedSector(1);
                onAction('karantina_phase1_sec_select_sector', { sector: 1 });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedSector === 1
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(0,238,252,0.25)]'
                  : 'bg-[#201d30] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase">SEKTÖR 01</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">GÜVENLİ</div>
              <div className="text-[10px] text-[#9e8f78] font-mono mt-1">MUTASYON: %0</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">UV GÜCÜ: 380 nm</div>
            </button>

            {/* Sektör 02 */}
            <button
              type="button"
              onClick={() => {
                setSelectedSector(2);
                onAction('karantina_phase1_sec_select_sector', { sector: 2 });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedSector === 2
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(0,238,252,0.25)]'
                  : 'bg-[#201d30] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase">SEKTÖR 02</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">GÜVENLİ</div>
              <div className="text-[10px] text-[#9e8f78] font-mono mt-1">MUTASYON: %2</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">UV GÜCÜ: 395 nm</div>
            </button>

            {/* Sektör 03 (TARGET) */}
            <button
              type="button"
              onClick={() => {
                setSelectedSector(3);
                onAction('karantina_phase1_sec_select_sector', { sector: 3 });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                selectedSector === 3
                  ? 'bg-amber-950/50 border-[#ffb703] shadow-[0_0_16px_rgba(255,183,3,0.35)]'
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-[#ffb703] font-bold uppercase">SEKTÖR 03</span>
                  <span className="material-symbols-outlined text-[12px] text-[#ffb703]">warning</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-pulse"></span>
              </div>
              <div className="text-sm font-bold text-amber-200 mt-0.5">KONTAMİNASYON</div>
              <div className="text-[10px] text-amber-400 font-bold font-mono mt-1">MUTASYON: %94 KRİTİK</div>
              <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-[#ffb703] text-[9px] font-mono font-bold">
                <span>UV AYARI</span>
                <span>415 nm ✓</span>
              </div>
            </button>

            {/* Sektör 04 (BLOCKED) */}
            <div className="p-2.5 rounded-xl border border-white/5 bg-[#171424] opacity-50 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase">SEKTÖR 04</span>
                <span className="material-symbols-outlined text-[12px] text-slate-500">lock</span>
              </div>
              <div className="text-sm font-bold text-slate-400 mt-0.5">BLOKE</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">DEVRE DIŞI</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">UV GÜCÜ: 0 nm</div>
            </div>
          </div>
        </div>

        {/* Mechanical Airlock Valves */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">valve</span>
              <span>MEKANİK HAVA KİLİDİ VANALARI</span>
            </div>
            <span className="text-[10px] font-mono text-[#9e8f78]">3 ÜNİTE</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Vana A */}
            <button
              type="button"
              onClick={() => {
                setSelectedValve('A');
                onAction('karantina_phase1_sec_select_valve', { valve: 'A' });
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedValve === 'A'
                  ? 'bg-cyan-950/40 border-cyan-400'
                  : 'bg-[#201d30] border-white/5 hover:border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400 block mx-auto">radio_button_unchecked</span>
              <div className="text-xs font-bold text-white mt-1">VANA-A</div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">AÇIK</div>
            </button>

            {/* Vana B (TARGET) */}
            <button
              type="button"
              onClick={() => {
                setSelectedValve('B');
                onAction('karantina_phase1_sec_select_valve', { valve: 'B' });
              }}
              className={`p-2.5 rounded-xl border text-center transition-all relative ${
                selectedValve === 'B'
                  ? 'bg-amber-950/50 border-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.3)]'
                  : 'bg-[#201d30] border-white/10 hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-[#ffb703] block mx-auto">check_circle</span>
              <div className="text-xs font-bold text-[#ffdba0] mt-1">VANA-B</div>
              <div className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">MÜHÜRLENECEK</div>
            </button>

            {/* Vana C */}
            <button
              type="button"
              onClick={() => {
                setSelectedValve('C');
                onAction('karantina_phase1_sec_select_valve', { valve: 'C' });
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                selectedValve === 'C'
                  ? 'bg-cyan-950/40 border-cyan-400'
                  : 'bg-[#201d30] border-white/5 hover:border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-cyan-400 block mx-auto">shield</span>
              <div className="text-xs font-bold text-white mt-1">VANA-C</div>
              <div className="text-[9px] font-mono text-cyan-300 mt-0.5">KORUMALI</div>
            </button>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="flex items-center gap-2 px-1 text-[11px] text-[#ffb4ab]">
          <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">error</span>
          <span>DİKKAT: Yanlış sektör mühürlenirse virüs ana hava kanallarına yayılır.</span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleSeal}
          className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[20px]">lock</span>
          <span>UV IŞINLARINI VE VANA-B MÜHÜRLE</span>
        </button>
      </main>
    </div>
  );
};
