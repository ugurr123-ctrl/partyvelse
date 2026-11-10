import React, { useState } from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: ((updater: (prev: MissionState) => MissionState) => void) | React.Dispatch<React.SetStateAction<MissionState>>;
  onAdvancePhase?: () => void;
  onAction: (actionType: string, data?: any) => void;
}

export const ScreenKarantinaPhase1Bio: React.FC<Props> = ({
  state,
  onAction,
}) => {
  const kData = state.karantinaData || {
    spectralFilterNm: 415,
    selectedBase: 'sitozin-9',
    bioPhase1Transmitted: false,
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

  const [spectralNm, setSpectralNm] = useState<number>(kData.spectralFilterNm || 415);
  const [selectedBaseKey, setSelectedBaseKey] = useState<string>(kData.selectedBase || 'sitozin-9');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTransmit = () => {
    onAction('karantina_phase1_bio_transmit', {
      base: selectedBaseKey,
      spectralNm,
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#ffb703] uppercase">
                KARANTİNA 2088 // PROTOKOLÜ
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold">
                ● SEC-4
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Acil İletişim Terminali</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#ffdba0]">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {/* Telemetry Sub-Header */}
        <section className="grid grid-cols-3 gap-2">
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-[#9e8f78] tracking-wider uppercase">GÖREV PROTOKOLÜ</span>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-white truncate">1. AŞAMA // HÜCRESEL</span>
            </div>
          </div>

          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-[#9e8f78] tracking-wider uppercase">KALAN SÜRE</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-[15px] text-[#ffb703]">timer</span>
              <span className="text-sm font-mono font-black text-white">
                {formatTimer(state.timeLeftSeconds)}
              </span>
            </div>
          </div>

          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-[#9e8f78] tracking-wider uppercase">BİYO-BÜTÜNLÜK</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-[15px] text-cyan-400">biotech</span>
              <span className="text-sm font-mono font-black text-cyan-300">%{state.hullIntegrity}</span>
            </div>
          </div>
        </section>

        {/* Task Title Banner */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center gap-1.5 text-[#ffb703] text-xs font-bold uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">biotech</span>
            <span>BİYOLOJİK TEŞHİS MASASI</span>
          </div>
          <h2 className="text-lg font-extrabold text-white leading-tight">Mutasyon Zincirini Analiz Et</h2>
          <p className="text-xs text-[#d5c4ac] mt-1 leading-relaxed">
            Örnekteki 3 kritik nükleotid bağını tanımla. Güvenlik Şefine hangi UV kapılarını mühürleyeceğini sesli olarak bildir.
          </p>
        </div>

        {/* Holographic DNA Spectrum Box */}
        <div className="bg-[#181528] border border-cyan-500/20 rounded-xl p-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[16px] animate-spin">coronavirus</span>
              <span>PATOJEN SPEKTRUM // V-2088</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300 font-bold uppercase">
              CANLI TARAMA
            </span>
          </div>

          {/* DNA Double Helix SVG Visualizer */}
          <div className="relative w-full h-24 bg-[#0f0c1e] rounded-lg border border-white/5 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 320 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dnaGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00eefc" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#00eefc" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ffb703" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="dnaGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffb703" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ffb4ab" stopOpacity="1" />
                  <stop offset="100%" stopColor="#00eefc" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Base pair rungs */}
              {[40, 80, 120, 160, 200, 240, 280].map((x, i) => {
                const phase = (x / 320) * Math.PI * 2;
                const y1 = 40 + Math.sin(phase) * 22;
                const y2 = 40 - Math.sin(phase) * 22;
                const isMutation = x === 160;
                return (
                  <g key={x}>
                    <line 
                      x1={x} y1={y1} x2={x} y2={y2} 
                      stroke={isMutation ? '#ffb703' : '#363246'} 
                      strokeWidth={isMutation ? "2.5" : "1.5"}
                      strokeDasharray={isMutation ? "3 2" : undefined}
                    />
                    <circle cx={x} cy={y1} r={isMutation ? "3.5" : "2"} fill={isMutation ? "#ffb703" : "#00eefc"} />
                    <circle cx={x} cy={y2} r={isMutation ? "3.5" : "2"} fill={isMutation ? "#ff5252" : "#eed8ff"} />
                  </g>
                );
              })}

              {/* Helix strand 1 */}
              <path 
                d="M 10 40 Q 50 15, 90 40 T 170 40 T 250 40 T 310 40" 
                fill="none" 
                stroke="url(#dnaGradCyan)" 
                strokeWidth="2.5" 
              />
              {/* Helix strand 2 */}
              <path 
                d="M 10 40 Q 50 65, 90 40 T 170 40 T 250 40 T 310 40" 
                fill="none" 
                stroke="url(#dnaGradAmber)" 
                strokeWidth="2.5" 
              />
            </svg>

            {/* Bottom status badge */}
            <div className="absolute bottom-1.5 left-2 bg-black/70 backdrop-blur-sm border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
              <span className="text-slate-400">BOZULMA DERECESİ: </span>
              <span className="text-red-400 font-bold">KRİTİK %94.2</span>
            </div>
          </div>

          {/* 4 Base Slots (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {/* Baz 01 */}
            <button
              type="button"
              onClick={() => setSelectedBaseKey('adenin-x')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedBaseKey === 'adenin-x'
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_10px_rgba(0,238,252,0.2)]'
                  : 'bg-[#201d30]/70 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase">BAZ 01</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">ADENİN-X</div>
              <div className="text-[10px] text-cyan-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                <span>AKTİF BAĞ</span>
              </div>
            </button>

            {/* Baz 02 */}
            <button
              type="button"
              onClick={() => setSelectedBaseKey('timin-z')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedBaseKey === 'timin-z'
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_10px_rgba(0,238,252,0.2)]'
                  : 'bg-[#201d30]/70 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase">BAZ 02</span>
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">TİMİN-Z</div>
              <div className="text-[10px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>STABİL DÖNGÜ</span>
              </div>
            </button>

            {/* Baz 03 (ALARM - Mutasyon) */}
            <button
              type="button"
              onClick={() => setSelectedBaseKey('sitozin-9')}
              className={`p-2.5 rounded-lg border text-left transition-all relative ${
                selectedBaseKey === 'sitozin-9'
                  ? 'bg-amber-950/50 border-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.3)]'
                  : 'bg-amber-950/30 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">BAZ 03 // ALARM</span>
                <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping"></span>
              </div>
              <div className="text-sm font-bold text-amber-200 mt-0.5">SİTOZİN-9</div>
              <div className="text-[10px] text-[#ffb703] font-bold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px]">warning</span>
                <span>AŞIRI MUTASYON</span>
              </div>
            </button>

            {/* Baz 04 */}
            <div className="p-2.5 rounded-lg border border-white/5 bg-[#171424] opacity-60 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase">BAZ 04</span>
                <span className="material-symbols-outlined text-[12px] text-slate-500">lock</span>
              </div>
              <div className="text-sm font-bold text-slate-400 mt-0.5">GUANİN-K</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">ANALİZ BLOKE</div>
            </div>
          </div>
        </div>

        {/* Secret Intel Card */}
        <div className="bg-[#1c192c] border-l-4 border-l-[#ffb703] border-y border-r border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[#ffb703] font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>GİZLİ İSTİHBARAT PLAKASI // SADECE BİYOLOG</span>
          </div>
          <p className="text-xs font-bold text-white mt-1 leading-snug">
            KRİTİK NOT: Mutasyon Sitozin-9 bağında! UV Sektör 3 ve Vana-B derhal kilitlenmeli.
          </p>
          <p className="text-[11px] text-[#9e8f78] mt-1 italic">
            * Güvenlik Şefi bu veriyi ekranında göremez. Koordinasyonu telsizden sağla.
          </p>
        </div>

        {/* Spectral Filter Slider */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">tune</span>
              <span>SPEKTRAL FİLTRE KALİBRASYONU</span>
            </div>
            <span className="text-sm font-mono font-black text-cyan-400">{spectralNm} nm</span>
          </div>

          <input 
            type="range"
            min={380}
            max={750}
            value={spectralNm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSpectralNm(val);
              onAction('karantina_set_spectral_filter', { value: val });
            }}
            className="w-full accent-cyan-400 h-2 bg-[#2b273b] rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-[#9e8f78]">
            <span>380 nm (UV-Mor)</span>
            <span className="text-cyan-300 font-bold">415 nm (Mavi-Yeşil)</span>
            <span>750 nm (Kızılötesi)</span>
          </div>
        </div>

        {/* Live Radio Transmit Feed */}
        <div className="bg-[#181528] border border-cyan-500/20 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-white uppercase">TELSİZ PROTOKOLÜ #4</span>
              <span className="text-[9px] font-mono text-[#ffb703] font-bold uppercase">CANLI YAYINDA</span>
            </div>
            <p className="text-xs text-cyan-200/90 truncate mt-0.5">
              &quot;Güvenlik, Sektör 3 kapısını kapatıp Vana B&apos;yi aç!&quot;
            </p>
          </div>
        </div>

        {/* Transmit Button */}
        <button
          type="button"
          onClick={handleTransmit}
          className={`w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
            kData.bioPhase1Transmitted
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/25'
              : 'bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {kData.bioPhase1Transmitted ? 'check_circle' : 'cell_tower'}
          </span>
          <span>
            {kData.bioPhase1Transmitted ? 'TEŞHİS İLETİLDİ (GÜVENLİK ONAYI BEKLENİYOR)' : 'GÜVENLİK ŞEFİNE TEŞHİSİ İLET'}
          </span>
        </button>
      </main>
    </div>
  );
};
