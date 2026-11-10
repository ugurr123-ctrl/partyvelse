import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onAdvancePhase?: () => void;
  onAction: (actionType: string, data?: any) => void;
}

export const ScreenKarantinaPhase2Sec: React.FC<Props> = ({
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

  const [rpm, setRpm] = useState<number>(kData.centrifugeRpm || 3800);
  const [coolingPct, setCoolingPct] = useState<number>(kData.coolingValvePct || 75);
  const [reliefActive, setReliefActive] = useState<boolean>(kData.pressureReliefActive ?? true);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdjustRpm = (delta: number) => {
    const nextRpm = Math.max(1000, Math.min(5000, rpm + delta));
    setRpm(nextRpm);
    onAction('karantina_phase2_sec_adjust_rpm', { delta });
  };

  const handleSetCooling = (pct: number) => {
    setCoolingPct(pct);
    onAction('karantina_phase2_sec_set_cooling', { pct });
  };

  const handleToggleRelief = () => {
    setReliefActive(!reliefActive);
    onAction('karantina_phase2_sec_toggle_relief');
  };

  const handleSolve = () => {
    onAction('karantina_phase2_sec_solve', {
      rpm,
      coolingValvePct: coolingPct,
      pressureReliefActive: reliefActive,
    });
  };

  // Circular gauge angle: 1000 RPM -> -120deg, 5000 RPM -> 120deg
  const gaugePercent = (rpm - 1000) / 4000;
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
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">GÜVENLİK ŞEFİ // KİMYASAL İŞLEM</span>
              <span className="text-xs font-bold text-white uppercase">KONSOL AKTİF #K-88</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">timer</span>
              <span className="font-mono text-xs font-black text-white">{formatTimer(state.timeLeftSeconds)}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">shield</span>
              <span className="font-mono text-xs font-black text-cyan-300">%{state.hullIntegrity}</span>
            </div>
          </div>
        </section>

        {/* Task Title Banner */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffb703] uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-pulse"></span>
              <span>2. AŞAMA // MEKANİK KARIŞTIRICI</span>
            </div>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-tight">Santrifüjü ve Soğutmayı Ayarla</h2>
          <p className="text-xs text-[#d5c4ac] mt-1 leading-relaxed">
            Biyoloğun telsizle bildirdiği santrifüj devir hızını (<strong className="text-amber-300">3800 RPM</strong>) ve soğutma seviyesini fiziksel konsolda sabitle.
          </p>
        </div>

        {/* Live Radio Callout */}
        <div className="bg-[#181528] border-l-4 border-l-cyan-400 border-y border-r border-white/5 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <span className="material-symbols-outlined text-[16px]">podcasts</span>
              <span>BAŞ BİYOLOG // CANLI BAĞLANTI</span>
            </div>
            <span className="text-[10px] font-mono text-[#9e8f78]">FREQ: 142.8 MHZ</span>
          </div>
          <p className="text-xs font-bold text-amber-200 italic bg-[#0f0c1e] p-2 rounded-lg border border-white/5">
            &ldquo;Santrifüjü tam 3800 RPM seviyesine getir ve soğutma valfini %75 aç, yoksa reaktör patlar!&rdquo;
          </p>
        </div>

        {/* Rotor Devri (RPM TACH) Circular Arc Gauge */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-4 flex flex-col items-center shadow-md relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">speed</span>
              <span>ROTOR DEVRİ (RPM TACH)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#ffb703] font-bold">
              HEDEF: 3800
            </span>
          </div>

          {/* Circular SVG Gauge */}
          <div className="relative w-44 h-44 flex items-center justify-center my-1">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
              {/* Background track */}
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
              {/* Active colored arc */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={rpm === 3800 ? '#00eefc' : '#ff5252'}
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Gauge readout center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-[10px] font-mono text-[#9e8f78] uppercase tracking-wider">MEVCUT HIZ</span>
              <span className="text-3xl font-mono font-black text-white tracking-tight">
                {rpm.toLocaleString('en-US')}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#ffb703]">D/DK (RPM)</span>
            </div>
          </div>

          {/* Min / Max Labels */}
          <div className="w-full flex items-center justify-between px-6 text-[10px] font-mono text-[#9e8f78]">
            <div className="flex flex-col items-start">
              <span>1000</span>
              <span className="text-[8px] text-slate-500 uppercase">MIN</span>
            </div>
            <div className="flex flex-col items-end">
              <span>5000</span>
              <span className="text-[8px] text-red-400 uppercase">KRİTİK</span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full mt-3">
            <button
              type="button"
              onClick={() => handleAdjustRpm(-100)}
              className="py-2.5 px-3 rounded-xl bg-[#201d30] border border-white/10 hover:border-white/20 active:scale-95 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
              <span>-100 RPM</span>
            </button>

            <button
              type="button"
              onClick={() => handleAdjustRpm(100)}
              className="py-2.5 px-3 rounded-xl bg-[#201d30] border border-white/10 hover:border-white/20 active:scale-95 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle_outline</span>
              <span>+100 RPM</span>
            </button>
          </div>
        </div>

        {/* Cooling Valve Calibration */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">ac_unit</span>
              <span>SOĞUTMA VALFİ KALİBRASYONU</span>
            </div>
            <span className="text-sm font-mono font-black text-[#ffb703]">%{coolingPct}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mt-1">
            {[0, 25, 50, 75, 100].map((val) => {
              const isSelected = coolingPct === val;
              const isOptimal = val === 75;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetCooling(val)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-[#ffb703] text-amber-300 shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                      : 'bg-[#201d30] border-white/5 hover:border-white/10 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold">
                    {val === 0 ? 'KAPALI' : `%${val}`}
                  </div>
                  {isOptimal && (
                    <div className="text-[8px] font-mono text-[#ffb703] font-bold mt-0.5">
                      [OPT]
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pressure Relief Switch */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">published_with_changes</span>
            <div>
              <div className="text-xs font-bold text-white uppercase">BASINÇ TAHLİYE ŞALTERİ</div>
              <div className="text-[10px] font-mono text-cyan-300">KORUMALI ŞALTER: HAZIR</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleRelief}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              reliefActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,238,252,0.25)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${reliefActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{reliefActive ? 'AKTİF' : 'PASİF'}</span>
          </button>
        </div>

        {/* Tactical Note */}
        <div className="flex items-center gap-1.5 px-1 text-[11px] text-[#9e8f78]">
          <span className="material-symbols-outlined text-[15px] text-amber-400">warning</span>
          <span>Taktik not: Hatalı devir antikorun parçalanmasına yol açar.</span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleSolve}
          className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[20px]">cyclone</span>
          <span>SANTRİFÜJÜ KİLİTLE VE BAŞLAT</span>
        </button>
      </main>
    </div>
  );
};
