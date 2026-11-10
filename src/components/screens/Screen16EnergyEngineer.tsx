import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen16EnergyEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const { totalBudget, engineerAllocation, lineLosses, isDraftShared, isLocked } = state.energy;
  
  // Standard mode state
  const [allocation, setAllocation] = useState(engineerAllocation);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Derin Basınç interactive state
  const [k02Position, setK02Position] = useState(90);
  const [valve1Open, setValve1Open] = useState(false);
  const [currentPressure, setCurrentPressure] = useState(28);
  const [isSealed, setIsSealed] = useState(isLocked);

  React.useEffect(() => {
    setAllocation(engineerAllocation);
  }, [engineerAllocation]);

  const totalUsed = allocation.yasamDestegi + allocation.itki + allocation.kalkan;
  const remainingBudget = totalBudget - totalUsed;

  const effectivePower = {
    yasamDestegi: Math.max(0, allocation.yasamDestegi - lineLosses.yasamDestegi),
    itki: Math.max(0, allocation.itki - lineLosses.itki),
    kalkan: Math.max(0, allocation.kalkan - lineLosses.kalkan),
  };

  const handleAdjust = (system: 'yasamDestegi' | 'itki' | 'kalkan', delta: number) => {
    if (isLocked) return;
    const current = allocation[system];
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && remainingBudget <= 0) return;

    const updated = {
      ...allocation,
      [system]: next,
    };
    setAllocation(updated);

    if (onAction) {
      onAction('energy_set_allocation', { allocation: updated });
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: updated,
        isDraftShared: false,
      },
    }));
  };

  const handleShareDraft = () => {
    if (remainingBudget < 0) {
      setFeedbackMsg('Hata: Enerji bütçesi (15 MW) aşıldı!');
      return;
    }

    if (onAction) {
      onAction('energy_share_draft', {});
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: allocation,
        isDraftShared: true,
      },
    }));
    setFeedbackMsg('Enerji taslağı Kaptana başarıyla iletildi! Kaptanın asgari onay verip kilitlemesi bekleniyor.');
  };

  // Derin Basınç Rod Lower handler
  const handleLowerK02 = () => {
    if (k02Position > 20) {
      const nextPos = Math.max(20, k02Position - 35);
      setK02Position(nextPos);
    }
  };

  // Derin Basınç Seal & Activate handler
  const handleSealReactor = () => {
    setIsSealed(true);
    if (onAction) {
      onAction('derin_basinc_seal_reactor', {
        k02Position,
        valve1Open,
        currentPressure,
      });
    }

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        isLocked: true,
      },
    }));
  };

  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';
  const [golgeRingRotation, setGolgeRingRotation] = useState<number>(0);
  const [golgeDecrypted, setGolgeDecrypted] = useState<boolean>(isLocked);

  const handleGolgeDecryptVault = () => {
    setGolgeDecrypted(true);
    if (onAction) {
      onAction('energy_lock', {});
    }
    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        isDraftShared: true,
        isLocked: true,
      },
    }));
    setFeedbackMsg('KASA ŞİFRESİ ÇÖZÜLDÜ! 8-4-2-9 anahtarı üretildi ve telsizden ajana iletildi.');
  };

  // ================= GÖLGE PROTOKOLÜ — KASA ŞİFRE KIRMA (HACKER) =================
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Top Sub-HUD: Telemetry Matrix */}
        <section className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#0f0c1e] border border-white/5 shadow-sm">
          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#1c192c]">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase">AŞAMA</span>
            <span className="font-mono text-[11px] text-[#ffb703] font-bold">03 / 04</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#1c192c]">
            <span className="font-mono text-[9px] text-[#00eefc] uppercase">SESSİZLİK</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold">%{state.stealthLevel ?? 96}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#1c192c]">
            <span className="font-mono text-[9px] text-[#ffb4ab] uppercase">SAYAÇ</span>
            <span className="font-mono text-[11px] text-[#ffb4ab] font-bold tracking-tight">
              {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#1c192c]">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase">KANAL</span>
            <span className="font-mono text-[10px] text-[#00eefc] font-bold">CH-01</span>
          </div>
        </section>

        {/* Hacker Identity & Status Flag */}
        <section className="flex items-center justify-between p-3 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00eefc]/15 flex items-center justify-center text-[#00eefc] border border-[#00eefc]/30">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-[#00eefc] tracking-widest uppercase font-bold">
                ROL: GÖLGE HACKER
              </span>
              <span className="font-sora text-xs text-white font-semibold">Merkezi Kasa Çözümleme</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#93000a]/50 text-[#ffb4ab] font-mono text-[8px] font-black uppercase tracking-wider animate-pulse">
            KRİTİK VERİ
          </span>
        </section>

        {/* Briefing Header */}
        <section className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffb703]"></span>
            <h2 className="font-sora text-sm text-[#ffba27] uppercase tracking-tight font-bold">
              MEGACORP VERİ KASASINI DEŞİFRE ET
            </h2>
          </div>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Sunucu kasasının çok katmanlı kriptografik matrisini kır, ajanın fiziksel terminale gireceği güvenlik bypass PIN kodunu üret.
          </p>
        </section>

        {/* 2.5D Kriptografik Kasa Çekirdeği (Centerpiece) */}
        <section className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0f0c1e] border border-white/5 shadow-xl overflow-hidden min-h-[240px]">
          {/* Radial Neon Grid Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,238,252,0.12)_0%,_rgba(255,183,3,0.05)_50%,_transparent_80%)] pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#00eefc]/50 to-transparent"></div>

          {/* Telemetry Header Inside Orb */}
          <div className="w-full flex justify-between items-center text-[#9e8f78] font-mono text-[9px] mb-2 z-10">
            <span className="flex items-center gap-1 text-[#00eefc]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              KATMAN DEŞİFRE: %100
            </span>
            <span className="text-[#ffb703] font-bold">3 HALKALI MATRİKS</span>
          </div>

          {/* 3 Concentric Vault Decryption Rings */}
          <div className="relative w-44 h-44 flex items-center justify-center my-1">
            {/* Outer Hexadecimal Ring */}
            <svg 
              className="absolute inset-0 w-full h-full transition-transform duration-700"
              style={{ transform: `rotate(${golgeRingRotation}deg)` }}
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" fill="none" r="90" stroke="#363246" strokeDasharray="6 4" strokeWidth="2"></circle>
              <circle cx="100" cy="100" fill="none" r="90" stroke="#ffb703" strokeDasharray="40 140" strokeLinecap="round" strokeWidth="3"></circle>
              <text fill="#ffb703" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" x="100" y="22">HEX 7F</text>
              <text fill="#9e8f78" fontFamily="monospace" fontSize="7" textAnchor="middle" x="175" y="103">A4</text>
              <text fill="#9e8f78" fontFamily="monospace" fontSize="7" textAnchor="middle" x="100" y="185">C9</text>
              <text fill="#9e8f78" fontFamily="monospace" fontSize="7" textAnchor="middle" x="25" y="103">F1</text>
            </svg>

            {/* Middle Binary Ring */}
            <svg 
              className="absolute inset-4 w-36 h-36 transition-transform duration-500"
              style={{ transform: `rotate(-${golgeRingRotation * 1.5}deg)` }}
              viewBox="0 0 160 160"
            >
              <circle cx="80" cy="80" fill="none" r="68" stroke="#2b273b" strokeDasharray="4 3" strokeWidth="2"></circle>
              <circle cx="80" cy="80" fill="none" r="68" stroke="#00eefc" strokeDasharray="30 110" strokeLinecap="round" strokeWidth="3"></circle>
              <text fill="#00eefc" fontFamily="monospace" fontSize="8" fontWeight="bold" textAnchor="middle" x="80" y="24">1011 BIN</text>
              <text fill="#9e8f78" fontFamily="monospace" fontSize="7" textAnchor="middle" x="140" y="83">0100</text>
              <text fill="#9e8f78" fontFamily="monospace" fontSize="7" textAnchor="middle" x="80" y="145">1101</text>
              <text fill="#9e8f78" fontFamily="monospace" fontSize="7" textAnchor="middle" x="20" y="83">0010</text>
            </svg>

            {/* Inner Cipher Core */}
            <div className="relative w-20 h-20 rounded-full bg-[#201d30] border-2 border-[#ffba27]/50 flex flex-col items-center justify-center shadow-[0_0_16px_rgba(255,183,3,0.3)] z-10">
              <span className="material-symbols-outlined text-[#ffba27] text-[24px]">lock_open</span>
              <span className="font-mono text-[9px] text-[#ffdba0] font-black tracking-widest mt-0.5">8 4 2 9</span>
            </div>
          </div>

          {/* Interactive Spin Button */}
          <button
            type="button"
            onClick={() => setGolgeRingRotation(prev => prev + 45)}
            className="mt-2 px-3 py-1 rounded-full bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-[#00eefc] font-mono text-[9px] font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[13px]">rotate_right</span>
            HALKALARI DÖNDÜR & ŞİFREYİ HİZALA
          </button>
        </section>

        {/* 4 Decrypted Key Blocks Bento */}
        <section className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider font-bold">
              DEŞİFRE EDİLEN GÜVENLİK PIN DİZİSİ
            </span>
            <span className="font-mono text-[8px] bg-[#0f0c1e] text-[#00eefc] px-1.5 py-0.5 rounded font-bold">
              KUSURSUZ EŞLEŞME
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg bg-[#0f0c1e] border border-[#ffb703]/50 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="font-mono text-[8px] text-[#9e8f78]">1. HANE</span>
              <span className="font-sora text-xl text-[#ffb703] font-black mt-0.5">8</span>
              <span className="font-mono text-[7px] text-[#ffba27]">0x08</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0f0c1e] border border-[#00eefc]/50 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="font-mono text-[8px] text-[#9e8f78]">2. HANE</span>
              <span className="font-sora text-xl text-[#00eefc] font-black mt-0.5">4</span>
              <span className="font-mono text-[7px] text-[#00eefc]">BIN 0100</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0f0c1e] border border-[#ffb703]/50 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="font-mono text-[8px] text-[#9e8f78]">3. HANE</span>
              <span className="font-sora text-xl text-[#ffb703] font-black mt-0.5">2</span>
              <span className="font-mono text-[7px] text-[#ffba27]">ROT-13</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0f0c1e] border border-[#00eefc]/50 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="font-mono text-[8px] text-[#9e8f78]">4. HANE</span>
              <span className="font-sora text-xl text-[#00eefc] font-black mt-0.5">9</span>
              <span className="font-mono text-[7px] text-[#00eefc]">ÇEKİRDEK</span>
            </div>
          </div>
        </section>

        {/* Telsiz Talimatı Dossier */}
        <div className="rounded-xl bg-[#0f0c1e] p-3 border border-[#ffb703]/30 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] text-[#ffb703] uppercase tracking-wider font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">campaign</span>
              SAHADAKİ AJANA SESLİ TALİMAT
            </span>
            <span className="font-mono text-[8px] bg-[#201d30] text-[#ffba27] px-1.5 py-0.5 rounded">CH-01</span>
          </div>
          <p className="font-manrope text-xs text-white leading-relaxed">
            Ajana telsizden söyle: <span className="text-[#ffb703] font-mono font-bold tracking-widest text-sm">"PIN: 8 4 2 9"</span>. Kodu girdikten sonra diski kitleyip transferi onaylasın!
          </p>
        </div>

        {/* Feedback message if any */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          {state.energy.isLocked ? (
            <button
              onClick={() => onAdvancePhase({ roundId: state.currentRoundId || 'round1', expectedPhaseIndex: 2 })}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-sora text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] active:translate-y-1 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
              <span>FAZ 03 TAMAMLANDI // KAÇIŞ TAHLİYESİNE GEÇ</span>
            </button>
          ) : (
            <button
              onClick={handleGolgeDecryptVault}
              className="w-full py-4 px-3 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#FF8C00] shadow-[0_4px_0_#B26A00] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-[#271900] font-sora text-xs font-black uppercase tracking-tight cursor-pointer select-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
              <span className="truncate">ŞİFREYİ AJANA AKTAR (8429) & KASAYI AÇ ›</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ================= DERİN BASINÇ — REAKTÖR SOĞUTMA (MAKİNİST) =================
  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
        
        {/* Role & Mission Briefing Pod */}
        <div className="bg-[#2b273b] rounded-xl p-space-md shadow-xl flex flex-col space-y-space-xs relative overflow-hidden mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7df4ff] animate-ping"></span>
              <span className="font-mono text-[11px] text-[#7df4ff] tracking-wider font-bold">ROL: MAKİNİST // ENG-04</span>
            </div>
            <div className="bg-[#0f0c1e] px-space-xs py-0.5 rounded flex items-center space-x-1">
              <span className="material-symbols-outlined text-[#ffba27] text-[14px]">tune</span>
              <span className="font-mono text-[10px] text-[#ffba27] uppercase font-bold">GÖREV 05 // 06</span>
            </div>
          </div>
          <div className="flex flex-col mt-space-xs">
            <h2 className="font-sora text-[18px] font-bold text-[#e6dff9]">ÇEKİRDEĞİ SOĞUT & ÇUBUKLARI KİLİTLE</h2>
            <p className="text-[12px] text-[#d5c4ac] leading-relaxed">
              Dümencinin telsizle bildirdiği kademeli çubuk sırasını çek, nitrojen soğutma vanasını ayarla ve reaktörü stabil koda al.
            </p>
          </div>

          {/* Live Radio Transcript Snippet */}
          <div className="bg-[#0f0c1e]/80 rounded-lg p-space-xs mt-space-xs flex items-center space-x-space-sm border border-white/5">
            <div className="w-8 h-8 rounded bg-[#201d30] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#7df4ff] text-[18px]">cell_tower</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-space-xs">
                <span className="font-mono text-[10px] text-[#d3fbff] font-bold">KAPTAN / DÜMENCİ</span>
                <span className="font-mono text-[10px] text-[#9e8f78]">TELSİZ SESİ [CH-02]</span>
              </div>
              <p className="text-[12px] text-[#e6dff9] truncate italic">
                “Makinist! K-02 aşırı ısınıyor! Önce Boru-1 valfini aç, sonra K-02'yi %20'ye bastır!”
              </p>
            </div>
          </div>
        </div>

        {/* Reactor Core Critical Telemetry Bar */}
        <div className="bg-[#201d30] rounded-xl p-space-md shadow-lg flex flex-col space-y-space-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">warning</span>
              <span className="font-mono text-[11px] text-[#ffb4ab] uppercase font-bold">ÇEKİRDEK ISI KRİTİK SEVİYEDE</span>
            </div>
            <span className="font-mono text-[11px] text-[#ffdad6] bg-[#93000a] px-space-xs py-0.5 rounded font-bold">
              ERİME RİSKİ: 01:20
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[#e6dff9]">
              <span className="font-mono text-[10px] text-[#d5c4ac]">ÇEKİRDEK İZOLASYON BÜTÜNLÜĞÜ</span>
              <span className="font-sora text-[18px] text-[#ffb4ab] font-bold">
                {k02Position === 20 ? '%92' : '%32'}
              </span>
            </div>
            <div className="w-full bg-[#0f0c1e] h-3 rounded flex p-0.5 space-x-1">
              <div 
                className={`h-full rounded-sm transition-all duration-500 ${k02Position === 20 ? 'bg-[#00dbe9] w-[92%]' : 'bg-[#ffb4ab] w-[32%]'}`}
              ></div>
              <div className="h-full bg-[#2b273b] rounded-sm flex-1 opacity-60"></div>
            </div>
          </div>
          <div className="flex items-center space-x-space-xs pt-1">
            <span className="material-symbols-outlined text-[#ffb703] text-[16px]">info</span>
            <span className="text-[12px] text-[#ffba27]">
              Taktik İpucu: Dümenci soğutma sırasını onaylamadan K-02 emniyet mandalını kırma!
            </span>
          </div>
        </div>

        {/* 2.5D Reactor Control Rods Console */}
        <div className="bg-[#201d30] rounded-xl p-space-md shadow-2xl flex flex-col space-y-space-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#d3fbff] text-[20px]">tune</span>
              <h3 className="font-sora text-[16px] font-bold text-[#e6dff9]">KONTROL ÇUBUKLARI MEKANİZMASI</h3>
            </div>
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">HIDRO-PNÖMATIK KONSOL</span>
          </div>

          {/* Rods Grid: 4 Vertical Columns */}
          <div className="grid grid-cols-4 gap-space-xs pt-space-xs">
            
            {/* K-01 Rod (Locked, 40%) */}
            <div className="bg-[#1c192c] rounded-lg p-space-xs flex flex-col items-center justify-between min-h-[220px] shadow-inner relative">
              <div className="flex flex-col items-center">
                <span className="font-mono text-[11px] text-[#7df4ff] font-bold">K-01</span>
                <span className="font-mono text-[10px] text-[#9e8f78]">%40</span>
              </div>
              <div className="relative w-8 h-32 bg-[#0f0c1e] rounded-full flex flex-col justify-end p-1">
                <div className="w-full bg-[#00dbe9]/40 rounded-full h-[40%] transition-all"></div>
                <div className="absolute left-1 right-1 bottom-[40%] h-6 bg-[#3a374b] rounded-md shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#d3fbff] text-[14px]">lock</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-mono text-[10px] text-[#d3fbff]">KİLİTLİ</span>
              </div>
            </div>

            {/* K-02 Rod (Active Target / Overheating, 90% down to 20%) */}
            <div 
              onClick={handleLowerK02}
              className={`rounded-lg p-space-xs flex flex-col items-center justify-between min-h-[220px] relative cursor-pointer transition-all ${
                k02Position === 20 
                  ? 'bg-[#2b273b] shadow-[0_4px_16px_rgba(0,238,252,0.3)]' 
                  : 'bg-[#363246] shadow-[0_4px_16px_rgba(255,183,3,0.3)] ring-1 ring-[#ffb703]'
              }`}
            >
              {/* Visual Accent Indicator */}
              <div className={`absolute -top-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shadow-sm ${
                k02Position === 20 
                  ? 'bg-[#00eefc] text-[#002022]' 
                  : 'bg-[#ffb4ab] text-[#690005] animate-pulse'
              }`}>
                {k02Position === 20 ? 'STABİL' : 'AŞIRI ISINMA'}
              </div>

              <div className="flex flex-col items-center mt-2">
                <span className="font-mono text-[11px] text-[#ffb703] font-bold">K-02</span>
                <span className={`font-sora text-[18px] font-bold ${k02Position === 20 ? 'text-[#7df4ff]' : 'text-[#ffb4ab]'}`}>
                  %{k02Position}
                </span>
              </div>

              {/* Lever Track Active Interactive */}
              <div className="relative w-10 h-32 bg-[#0f0c1e] rounded-full flex flex-col justify-end p-1 overflow-hidden">
                <div 
                  className={`w-full rounded-full transition-all duration-300 ${k02Position === 20 ? 'bg-[#00dbe9]/50' : 'bg-[#ffb4ab]/50'}`}
                  style={{ height: `${k02Position}%` }}
                ></div>
                <div 
                  className="absolute left-1 right-1 h-8 bg-[#ffb703] text-[#422c00] rounded-md shadow-[0_4px_0_#9e8f78] flex flex-col items-center justify-center transition-all duration-300 active:translate-y-1"
                  style={{ bottom: `${Math.max(10, k02Position - 15)}%` }}
                >
                  <span className="material-symbols-outlined text-[16px] animate-bounce">
                    {k02Position === 20 ? 'check' : 'arrow_downward'}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                className={`w-full font-mono text-[10px] py-1 rounded text-center uppercase transition-transform active:scale-95 shadow font-bold ${
                  k02Position === 20 
                    ? 'bg-[#00eefc] text-[#002022]' 
                    : 'bg-[#93000a] text-[#ffdad6]'
                }`}
              >
                {k02Position === 20 ? 'MÜHÜRLENDİ' : 'AŞAĞI İNDİR'}
              </button>
            </div>

            {/* K-03 Rod (Idle, 15%) */}
            <div className="bg-[#1c192c] rounded-lg p-space-xs flex flex-col items-center justify-between min-h-[220px] shadow-inner relative">
              <div className="flex flex-col items-center">
                <span className="font-mono text-[11px] text-[#d5c4ac]">K-03</span>
                <span className="font-mono text-[10px] text-[#9e8f78]">%15</span>
              </div>
              <div className="relative w-8 h-32 bg-[#0f0c1e] rounded-full flex flex-col justify-end p-1">
                <div className="w-full bg-[#514532]/30 rounded-full h-[15%]"></div>
                <div className="absolute left-1 right-1 bottom-[15%] h-6 bg-[#363246] rounded-md shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#9e8f78] text-[14px]">pause</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-mono text-[10px] text-[#9e8f78]">BEKLEMEDE</span>
              </div>
            </div>

            {/* K-04 Rod (Locked, 50%) */}
            <div className="bg-[#1c192c] rounded-lg p-space-xs flex flex-col items-center justify-between min-h-[220px] shadow-inner relative">
              <div className="flex flex-col items-center">
                <span className="font-mono text-[11px] text-[#7df4ff] font-bold">K-04</span>
                <span className="font-mono text-[10px] text-[#9e8f78]">%50</span>
              </div>
              <div className="relative w-8 h-32 bg-[#0f0c1e] rounded-full flex flex-col justify-end p-1">
                <div className="w-full bg-[#00dbe9]/40 rounded-full h-[50%]"></div>
                <div className="absolute left-1 right-1 bottom-[50%] h-6 bg-[#3a374b] rounded-md shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#d3fbff] text-[14px]">lock</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-mono text-[10px] text-[#d3fbff]">KİLİTLİ</span>
              </div>
            </div>

          </div>
        </div>

        {/* Nitrogen & Heavy Water Cooling Valves Assembly */}
        <div className="bg-[#201d30] rounded-xl p-space-md shadow-xl flex flex-col space-y-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#00dbe9] text-[20px]">valve</span>
              <h3 className="font-sora text-[16px] font-bold text-[#e6dff9]">NİTROJEN & SOĞUTMA VALFLERİ</h3>
            </div>
            <div className="bg-[#0f0c1e] px-space-xs py-0.5 rounded">
              <span className="font-mono text-[11px] text-[#d3fbff]">AKIŞKAN BASINCI</span>
            </div>
          </div>

          {/* 3 Heavy Industrial Rotary Valves */}
          <div className="grid grid-cols-3 gap-space-xs">
            
            {/* BORU-1: Enjeksiyon Beklemede / Aktif */}
            <div 
              onClick={() => setValve1Open(!valve1Open)}
              className="bg-[#1c192c] rounded-lg p-space-xs flex flex-col items-center space-y-space-xs cursor-pointer select-none hover:bg-[#2b273b] transition-colors"
            >
              <span className="font-mono text-[11px] text-[#e6dff9] font-bold">BORU-1</span>
              <div 
                className={`w-14 h-14 rounded-full bg-[#3a374b] shadow-lg flex items-center justify-center transition-transform duration-300 ${valve1Open ? 'rotate-180 ring-2 ring-[#00eefc]' : ''}`}
              >
                <span className="material-symbols-outlined text-[#ffba27] text-[28px]">autorenew</span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`font-mono text-[10px] uppercase font-bold ${valve1Open ? 'text-[#7df4ff]' : 'text-[#9e8f78]'}`}>
                  {valve1Open ? 'ENJEKSİYON AKTİF' : 'ENJEKSİYON BEKLEMEDE'}
                </span>
                <span className="font-mono text-[11px] text-[#ffba27] font-bold">
                  {valve1Open ? '%85 AÇIK' : '%0 AÇIK'}
                </span>
              </div>
            </div>

            {/* BORU-2: Kapalı & Sabit */}
            <div className="bg-[#1c192c] rounded-lg p-space-xs flex flex-col items-center space-y-space-xs opacity-60">
              <span className="font-mono text-[11px] text-[#e6dff9]">BORU-2</span>
              <div className="w-14 h-14 rounded-full bg-[#363246] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#9e8f78] text-[28px]">lock</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] text-[#9e8f78] uppercase">BASINÇ KİLİTLİ</span>
                <span className="font-mono text-[11px] text-[#9e8f78]">%0 AÇIK</span>
              </div>
            </div>

            {/* BORU-3: Tahliye Modu (%100 Açık) */}
            <div className="bg-[#1c192c] rounded-lg p-space-xs flex flex-col items-center space-y-space-xs">
              <span className="font-mono text-[11px] text-[#7df4ff] font-bold">BORU-3</span>
              <div className="w-14 h-14 rounded-full bg-[#363246] shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00eefc] text-[28px] animate-spin">cyclone</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] text-[#d3fbff] uppercase font-bold">TAHLİYE AKTİF</span>
                <span className="font-mono text-[11px] text-[#7df4ff] font-bold">%100 AÇIK</span>
              </div>
            </div>

          </div>

          {/* Pressure Gauge / Manometer HUD */}
          <div className="bg-[#0f0c1e] rounded-lg p-space-sm flex items-center justify-between mt-space-xs border border-white/5">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#ffb703] text-[20px]">speed</span>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#d5c4ac]">MANOMETRE HEDEF BASINÇ</span>
                <span className="font-mono text-[11px] text-[#e6dff9] font-bold">KİLİTLİ HEDEF: 28 BAR</span>
              </div>
            </div>
            {/* Increment / Decrement Gauge Controls */}
            <div className="flex items-center space-x-space-xs">
              <button 
                type="button"
                onClick={() => setCurrentPressure(prev => Math.max(20, prev - 1))}
                className="w-9 h-9 bg-[#2b273b] text-[#e6dff9] rounded flex items-center justify-center shadow active:translate-y-0.5 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <div className="bg-[#2b273b] px-space-xs py-1 rounded min-w-[50px] text-center">
                <span className="font-sora text-[18px] text-[#ffb703] font-bold">{currentPressure}</span>
                <span className="font-mono text-[10px] text-[#d5c4ac] block">BAR</span>
              </div>
              <button 
                type="button"
                onClick={() => setCurrentPressure(prev => Math.min(36, prev + 1))}
                className="w-9 h-9 bg-[#2b273b] text-[#e6dff9] rounded flex items-center justify-center shadow active:translate-y-0.5 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col pt-space-xs space-y-space-xs">
          {!isSealed ? (
            <button
              onClick={handleSealReactor}
              className="w-full bg-[#ffb703] text-[#422c00] font-sora font-extrabold text-[14px] py-space-md px-space-md rounded-xl shadow-[0_8px_0_#6b4b00] active:shadow-[0_2px_0_#6b4b00] active:translate-y-1.5 transition-all flex items-center justify-center space-x-space-xs text-center select-none cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">mode_fan</span>
              <span className="tracking-tight uppercase">SOĞUTMA POMPASINI ÇALIŞTIR & K-02'Yİ MÜHÜRLE</span>
            </button>
          ) : (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-[14px] py-space-md px-space-md rounded-xl shadow-[0_6px_0_#00686f] active:translate-y-1 transition-all flex items-center justify-center space-x-space-xs text-center select-none cursor-pointer animate-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <span className="tracking-tight uppercase">SOĞUTMA DÖNGÜSÜ BAŞLATILDI • KAÇIŞ ROTASINA GEÇ</span>
            </button>
          )}

          <div className="flex items-center justify-center space-x-space-xs">
            <span className="material-symbols-outlined text-[#9e8f78] text-[14px]">shield</span>
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase tracking-widest text-center">
              GÜVENLİK PİMİ DEVREDE // HİDRO-REAKTÖR DP-9480
            </span>
          </div>
        </div>

      </div>
    );
  }

  // ================= STANDARD (KAYIP SİNYAL) PROTOCOL =================
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px]">bolt</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS // ENERJİ DAĞITIM KONSOLU</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Enerjiyi Sistemlere Böl
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          15 MW toplam bütçeyi paylaştır. Her hattaki 1 MW hat kaybını hesaba katarak taslağı kaptana ilet.
        </p>
      </div>

      {/* 15 MW Total Budget Card */}
      <div className="p-4 rounded-2xl bg-[#0f0c1e] border border-white/10 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#00eefc]/15 text-[#00eefc] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[26px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">TOPLAM REAKTÖR GÜCÜ</span>
            <span className="font-sora text-2xl font-black text-white">
              {totalBudget} <span className="text-[#00eefc] text-sm">MW</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">KALAN BÜTÇE</span>
          <span className={`font-sora text-2xl font-black ${remainingBudget === 0 ? 'text-emerald-400' : remainingBudget > 0 ? 'text-[#ffb703]' : 'text-rose-400'}`}>
            {remainingBudget} <span className="text-xs">MW</span>
          </span>
        </div>
      </div>

      {/* 3 Energy Channel Controls */}
      <div className="flex flex-col gap-2.5">
        
        {/* 1. Yaşam Desteği */}
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">ecg_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">Yaşam Desteği</span>
              <span className="text-[10px] text-[#d5c4ac]">Net Çıkış: {effectivePower.yasamDestegi} MW (-1 kayıp)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust('yasamDestegi', -1)}
              disabled={isLocked || allocation.yasamDestegi <= 0}
              className="w-9 h-9 rounded-xl bg-[#0f0c1e] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center font-sora font-extrabold text-base text-white">
              {allocation.yasamDestegi}
            </span>
            <button
              type="button"
              onClick={() => handleAdjust('yasamDestegi', 1)}
              disabled={isLocked || remainingBudget <= 0}
              className="w-9 h-9 rounded-xl bg-[#00eefc]/20 text-[#00eefc] flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. İtki Motorları */}
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">İtki Motorları</span>
              <span className="text-[10px] text-[#d5c4ac]">Net Çıkış: {effectivePower.itki} MW (-1 kayıp)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust('itki', -1)}
              disabled={isLocked || allocation.itki <= 0}
              className="w-9 h-9 rounded-xl bg-[#0f0c1e] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center font-sora font-extrabold text-base text-white">
              {allocation.itki}
            </span>
            <button
              type="button"
              onClick={() => handleAdjust('itki', 1)}
              disabled={isLocked || remainingBudget <= 0}
              className="w-9 h-9 rounded-xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Gövde Kalkanı */}
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#dab5ff]/20 text-[#dab5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">Gövde Kalkanı</span>
              <span className="text-[10px] text-[#d5c4ac]">Net Çıkış: {effectivePower.kalkan} MW (-1 kayıp)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust('kalkan', -1)}
              disabled={isLocked || allocation.kalkan <= 0}
              className="w-9 h-9 rounded-xl bg-[#0f0c1e] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center font-sora font-extrabold text-base text-white">
              {allocation.kalkan}
            </span>
            <button
              type="button"
              onClick={() => handleAdjust('kalkan', 1)}
              disabled={isLocked || remainingBudget <= 0}
              className="w-9 h-9 rounded-xl bg-[#dab5ff]/20 text-[#dab5ff] flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

      </div>

      {/* Feedback Message */}
      {(state.feedbackMessage || feedbackMsg) && (
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-[#00eefc]/30 text-[#00eefc] text-xs leading-relaxed animate-fadeIn">
          {state.feedbackMessage || feedbackMsg}
        </div>
      )}

      {/* Action Trigger */}
      <div className="mt-2 flex flex-col gap-2">
        {!isLocked ? (
          <button
            onClick={handleShareDraft}
            className="w-full h-14 rounded-2xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>Enerji Taslağını Kaptana İlet</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>KAPTAN KİLİTLEDİ • KURTARMA ROTASI</span>
          </button>
        )}
      </div>

    </div>
  );
};
