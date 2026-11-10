import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onAdvancePhase?: () => void;
  onAction: (actionType: string, data?: any) => void;
}

export const ScreenKarantinaPhase2Bio: React.FC<Props> = ({
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

  const [bondFreq, setBondFreq] = useState<number>(kData.bondFreqGhz || 8.4);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInject = () => {
    onAction('karantina_phase2_bio_inject', {
      bondFreqGhz: bondFreq,
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
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ffb703] uppercase">
              <span>K2088</span>
              <span className="text-[#9e8f78]">//</span>
              <span className="text-cyan-400 font-bold">SEC-04</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Taktiksel Konsol</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#ffdba0]">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {/* Telemetry Sub-Header */}
        <section className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">ROL PROTOKOLÜ</span>
              <span className="text-xs font-bold text-white uppercase">BAŞ BİYOLOG // KONSOL-03</span>
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
              <span>2. AŞAMA // FORMÜL SENTEZİ</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[9px] font-mono font-bold text-purple-300 uppercase">
              GİZLİLİK: MAKSİMUM
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-tight">Sentetik Panzehiri Sentezle</h2>
          <p className="text-xs text-[#d5c4ac] mt-1 leading-relaxed">
            Patojen nötralizasyonu için 3 kritik kimyasal bileşeni doğru oranda eşleştir. Güvenlik Şefine santrifüj devir frekansını aktar.
          </p>
        </div>

        {/* Bioreactor Fluid Chamber Visualizer */}
        <div className="bg-[#181528] border border-cyan-500/20 rounded-xl p-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
              <span className="material-symbols-outlined text-[16px]">science</span>
              <span>SİLİNDİRİK BİYOREAKTÖR ODASI</span>
            </div>
            <span className="text-[10px] font-mono text-[#9e8f78]">REAKTİF AKIŞI: 1.2 L/SN</span>
          </div>

          {/* Reactor Chamber Vessel */}
          <div className="relative w-44 h-36 mx-auto bg-[#0a0815] border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,238,252,0.15)] flex flex-col justify-end p-1">
            {/* Fluid fill with animated wave */}
            <div className="relative w-full h-[65%] bg-gradient-to-t from-teal-500/80 via-cyan-500/60 to-emerald-400/50 rounded-b-xl overflow-hidden">
              {/* Bubbles */}
              <div className="absolute inset-0 flex justify-around items-end pb-1 pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-200/80 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-200/90 animate-pulse"></span>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_8px_#00eefc]"></div>
            </div>

            {/* Vessel Measurement Ticks */}
            <div className="absolute inset-y-2 right-2 flex flex-col justify-between items-end pointer-events-none opacity-40">
              <span className="w-2 h-0.5 bg-white"></span>
              <span className="w-3 h-0.5 bg-white"></span>
              <span className="w-2 h-0.5 bg-white"></span>
              <span className="w-3 h-0.5 bg-white"></span>
            </div>

            {/* Label in center of vessel */}
            <div className="absolute bottom-1 inset-x-0 text-center pointer-events-none">
              <span className="text-[9px] font-mono font-black tracking-widest text-[#002022] uppercase bg-cyan-300/80 px-2 py-0.5 rounded">
                NÖTRALİZE
              </span>
            </div>
          </div>

          {/* Sub-status */}
          <div className="flex items-center justify-between text-[10px] font-mono mt-3 px-1">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              VİSKOZİTE: 14.8 cP
            </span>
            <span className="text-[#ffb703] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-pulse"></span>
              REAKSİYON: AKTİF
            </span>
          </div>
        </div>

        {/* Chemical Components Breakdown */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase">KİMYASAL BİLEŞEN ORANLARI</span>
            <span className="text-[10px] font-mono text-[#ffb703] font-bold">TOPLAM: %100 DENGE</span>
          </div>

          {/* Polimer-A7 */}
          <div className="bg-[#201d30] border border-white/5 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-[18px]">vaccines</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">POLİMER-A7</span>
                  <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-mono font-bold">STABİL</span>
                </div>
                <div className="text-[10px] text-[#9e8f78]">Hücresel zar bağlayıcı matris</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-mono font-black text-cyan-400">%45</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                <div className="w-[45%] h-full bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Enzim-Neo */}
          <div className="bg-[#201d30] border border-white/5 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb703] text-[18px]">local_fire_department</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">ENZİM-NEO</span>
                  <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[#ffb703] text-[8px] font-mono font-bold">KATALİZÖR</span>
                </div>
                <div className="text-[10px] text-[#9e8f78]">Sentez tetikleyici kofaktör</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-mono font-black text-[#ffb703]">%30</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                <div className="w-[30%] h-full bg-[#ffb703] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Nötro-9 */}
          <div className="bg-[#201d30] border border-white/5 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-300 text-[18px]">hourglass_empty</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">NÖTRO-9</span>
                  <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold">DENGE</span>
                </div>
                <div className="text-[10px] text-[#9e8f78]">Termal aşırı ısınma tamponu</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-mono font-black text-purple-300">%25</span>
              <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                <div className="w-[25%] h-full bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Molecular Bond Frequency Slider */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">graphic_eq</span>
              <span>MOLEKÜLER BAĞ FREKANSI</span>
            </div>
            <span className="text-sm font-mono font-black text-cyan-400">{bondFreq.toFixed(1)} GHz</span>
          </div>

          <input 
            type="range"
            min={1.0}
            max={15.0}
            step={0.1}
            value={bondFreq}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBondFreq(val);
              onAction('karantina_set_bond_freq', { value: val });
            }}
            className="w-full accent-cyan-400 h-2 bg-[#2b273b] rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-[#9e8f78]">
            <span>1.0 GHz (ZAYIF)</span>
            <span className="text-cyan-300 font-bold">OPTİMAL: 8.4 GHz</span>
            <span>15.0 GHz (KRİTİK)</span>
          </div>
        </div>

        {/* Secret Diagnosis Note */}
        <div className="bg-[#1c192c] border-l-4 border-l-[#ffb703] border-y border-r border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[#ffb703] font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>GİZLİ TEŞHİS NOTU (YALNIZCA BİYOLOG)</span>
          </div>
          <p className="text-xs font-bold text-white mt-1 leading-snug">
            Santrifüj devri tam <span className="text-amber-300 underline font-black">3800 RPM</span> olmalı ve Soğutma Valfi <span className="text-cyan-300 underline font-black">%75</span> açılmalı.
          </p>
          <p className="text-[11px] text-[#9e8f78] mt-1 italic">
            Bu hayati operasyon verisini telsizden Güvenlik Şefine hemen sesli bildir.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleInject}
          className={`w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
            kData.bioPhase2Injected
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/25'
              : 'bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {kData.bioPhase2Injected ? 'check_circle' : 'water_drop'}
          </span>
          <span>
            {kData.bioPhase2Injected ? 'PANZEHİR ENJEKTE EDİLDİ (SANTRİFÜJ BEKLENİYOR)' : 'PANZEHİRİ REAKTÖRE ENJEKTE ET'}
          </span>
        </button>

        {/* Live bottom indicator */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#9e8f78]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Güvenlik Şefi santrifüj devrini ayarlıyor... Sinyal ... SEC_CH-4</span>
        </div>
      </main>
    </div>
  );
};
