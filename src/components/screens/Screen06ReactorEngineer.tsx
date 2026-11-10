import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen06ReactorEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { diagnostic } = state;

  // No line selected by default! Starts null unless already selected
  const [selectedLine, setSelectedLine] = useState<'reaktor' | 'sogutucu' | 'anten' | 'yonlendirme' | null>(
    (diagnostic.engineerSuggestedLine as any) || null
  );

  const [coolingValveAngle, setCoolingValveAngle] = useState<number>(diagnostic.engineerValveAngle || 45);
  const [pressureThrottleToggled, setPressureThrottleToggled] = useState<boolean>(
    diagnostic.engineerThrottleActive || false
  );

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: diagnostic.isSolved ? 'success' : 'idle',
    msg: diagnostic.isSolved ? 'Reaktör basınca tahliye edildi! Devreler stabil.' : '',
  });

  const circuitModules = [
    { key: 'reaktor', code: 'CIR-01', name: 'Ana Reaktör', icon: 'cyclone' },
    { key: 'sogutucu', code: 'CIR-02', name: 'Soğutucu Çekirdek', icon: 'mode_fan' },
    { key: 'anten', code: 'CIR-03', name: 'Anten Ünitesi', icon: 'satellite_alt' },
    { key: 'yonlendirme', code: 'CIR-04', name: 'İtki ve Yönlendirme', icon: 'navigation' },
  ] as const;

  const handleSelectLine = (key: 'reaktor' | 'sogutucu' | 'anten' | 'yonlendirme') => {
    if (diagnostic.isSolved) return;
    setSelectedLine(key);

    if (onAction) {
      onAction('diagnostic_engineer_select_line', { line: key });
    } else {
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          engineerSuggestedLine: key,
        },
      }));
    }
  };

  const handlePurgePressure = () => {
    if (diagnostic.isSolved || !selectedLine) return;

    if (onAction) {
      onAction('diagnostic_engineer_purge', {
        line: selectedLine,
        valveAngle: coolingValveAngle,
        throttleActive: pressureThrottleToggled,
      });
      return;
    }

    // Local fallback check
    const isBreakerUnlocked = diagnostic.captainSelectedBreaker === diagnostic.correctBreaker;
    if (!isBreakerUnlocked) {
      setFeedback({
        type: 'error',
        msg: 'Güvenlik kilidi devrede! Kaptan ana şebekeden bu hattın güvenlik kesicisini açmadan tahliye vanası çalıştırılamaz.',
      });
      return;
    }

    if (selectedLine !== diagnostic.faultyLine) {
      setFeedback({
        type: 'error',
        msg: 'Hatalı hat tahliyesi! Seçilen devrede çoklu arıza koşulları oluşmamış. Sağlam devreye müdahale edildi. Bütünlük -%10, Süre -15 sn!',
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
      return;
    }

    if (coolingValveAngle !== diagnostic.targetValveAngle) {
      setFeedback({
        type: 'error',
        msg: 'Müdahale başarısız: Soğutma valfi doğru açıda değil. Termal şok riski nedeniyle tahliye güvenlik sistemi tarafından durduruldu.',
      });
      return;
    }

    if (!pressureThrottleToggled) {
      setFeedback({
        type: 'error',
        msg: 'Müdahale başarısız: Basınç tahliyesi devre dışı. Hat basıncı boşaltılmadan devre açılamaz.',
      });
      return;
    }

    // All successful
    const updatedLines = {
      ...diagnostic.lines,
      [diagnostic.faultyLine]: {
        ...diagnostic.lines[diagnostic.faultyLine],
        temp: 54,
        press: 50,
        noise: 36,
        status: 'stabil' as const,
      },
    };

    setFeedback({
      type: 'success',
      msg: 'MÜDAHALE TAMAMLANDI! Arızalı devre başarıyla tahliye edildi ve soğutuldu. Reaktör dengelendi!',
    });

    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        lines: updatedLines,
        engineerActionTaken: true,
        engineerSuggestedLine: selectedLine,
        engineerValveAngle: coolingValveAngle,
        engineerThrottleActive: pressureThrottleToggled,
        isSolved: true,
      },
    }));
  };

  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const [derinTanks, setDerinTanks] = useState<Record<number, boolean>>({
    1: false,
    2: true,
    3: false,
    4: true,
  });
  const [derinPressure, setDerinPressure] = useState<number>(48);

  const toggleTank = (tankNum: number) => {
    if (diagnostic.isSolved) return;
    setDerinTanks(prev => ({ ...prev, [tankNum]: !prev[tankNum] }));
  };

  const handleActivateValves = () => {
    // Both Tank-2 and Tank-4 must be active, Tank-1 and Tank-3 inactive, pressure must be 48 Bar
    const tanksCorrect = !derinTanks[1] && derinTanks[2] && !derinTanks[3] && derinTanks[4];
    const pressureCorrect = derinPressure === 48;

    if (tanksCorrect && pressureCorrect) {
      if (onAction) {
        onAction('diagnostic_engineer_purge', {
          line: diagnostic.faultyLine,
          valveAngle: diagnostic.targetValveAngle,
          throttleActive: true,
        });
      }
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          engineerActionTaken: true,
          engineerSuggestedLine: prev.diagnostic.faultyLine,
          engineerValveAngle: prev.diagnostic.targetValveAngle,
          engineerThrottleActive: true,
          isSolved: true,
        },
      }));
    } else {
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';
  const [golgeBypassSync, setGolgeBypassSync] = useState(false);
  const [activeNode, setActiveNode] = useState<'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA'>('BETA');

  const handleGolgeBypassSubmit = () => {
    setGolgeBypassSync(true);
    if (onAction) {
      onAction('diagnostic_engineer_purge', {
        line: 'sogutucu',
        valveAngle: 45,
        throttleActive: true,
      });
    }
    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        engineerActionTaken: true,
        engineerSuggestedLine: 'sogutucu',
        unlockedBreaker: 'K2',
        isSolved: true,
      },
    }));
    setFeedback({
      type: 'success',
      msg: 'KÖPRÜ BAŞARIYLA KURULDU! Node-Beta ve Delta frekansı ajanın paneline senkronize edildi.',
    });
  };

  // Gölge Protokolü (Hacker - Güvenlik Duvarı Bypass) UI (Lines 1206-1475 of template)
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Mission Telemetry Ribbon (Top HUD) */}
        <section className="grid grid-cols-4 gap-1.5 pt-1">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider">AŞAMA</span>
            <span className="font-mono text-[11px] text-[#ffb703] font-bold">01 / 04</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider">SESSİZLİK</span>
            <span className="font-mono text-[11px] text-[#00eefc] font-bold">%100 GİZLİ</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider">GERİ SAYIM</span>
            <span className="font-mono text-[11px] text-[#ffb4ab] font-bold tracking-tight">
              {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider">KANAL</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold">CH-01</span>
            </div>
          </div>
        </section>

        {/* Objective Briefing Card */}
        <section className="p-3.5 rounded-xl bg-[#2b273b] border border-white/5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[#ffb703] text-[18px]">terminal</span>
                <span className="font-mono text-[10px] text-[#ffb703] tracking-widest uppercase font-bold">
                  KONSOL AKTİF // PROTOKOL A
                </span>
              </div>
              <h2 className="font-sora text-sm text-white font-bold tracking-tight uppercase">
                SUNUCU GÜVENLİK DUVARINI KIR
              </h2>
              <p className="font-manrope text-[11px] text-[#d5c4ac] mt-1 leading-relaxed">
                Ajanın fiziksel panelde bağlaması gereken IP port sırasını ve voltaj kilidini telsizden aktar.
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0f0c1e] text-[#ffb703] border border-white/5 shadow-inner shrink-0">
              <span className="material-symbols-outlined text-[22px]">vpn_lock</span>
            </div>
          </div>
        </section>

        {/* Visual Asset: Cyber Warfare Operations Grid */}
        <div className="w-full h-28 rounded-xl overflow-hidden relative shadow-md bg-[#0f0c1e] border border-white/5">
          <img 
            className="w-full h-full object-cover opacity-60" 
            alt="Cyber Warfare Grid" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1AwQbef81uM9LVMqePGBnAojMwSpsWdkZhDAFf1CwsppQWrjCmxA5FvRaU0bs1Yq_kxbSfUxqq1_je1q0r7lptjCSSgmAk9fuFC_XZ68b6s_Uthfwdl94lnC-iBrlFStXdf_SazPZP4_KVeM7S_b-HcKrQIFl508k4dYC7g3JUm3cSmVcNboB3gM2ikL9lgKnzevfHo7ucK3hIB7lmDIokpk7l9J4CsEnYiF_Dbg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#0f0c1e]/40 to-transparent p-2.5 flex flex-col justify-end">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#00eefc] tracking-widest uppercase flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                CANLI VERİ AKIŞI: 1.024 GB/SN
              </span>
              <span className="font-mono text-[9px] text-[#9e8f78]">ANOMALİ YOK</span>
            </div>
          </div>
        </div>

        {/* Centerpiece 2.5D Interface: Network Topology & Oscilloscope */}
        <section className="p-3.5 rounded-xl bg-[#201d30] border border-white/5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px]">hub</span>
              <h3 className="font-sora text-xs text-white font-bold uppercase">TOPOLOJİ MATRİSİ</h3>
            </div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#363246] text-[#00eefc] tracking-widest uppercase font-bold">
              4 ALTYAPI DÜĞÜMÜ
            </span>
          </div>

          {/* 4 Subnet Nodes Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Node Alpha */}
            <div 
              onClick={() => setActiveNode('ALPHA')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeNode === 'ALPHA' ? 'bg-[#2b273b] border-[#9e8f78]' : 'bg-[#1c192c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#9e8f78] uppercase">DÜĞÜM-01</span>
                <span className="material-symbols-outlined text-[#ffdba0] text-[14px]">device_hub</span>
              </div>
              <div className="my-1.5">
                <span className="font-sora text-xs text-white block font-bold">NODE-ALPHA</span>
                <span className="font-manrope text-[10px] text-[#9e8f78]">GND // Topraklama</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="font-mono text-[9px] text-[#ffb703]">KORUMALI</span>
                <span className="font-mono text-[9px] text-[#d5c4ac]">0.0V REF</span>
              </div>
            </div>

            {/* Node Beta */}
            <div 
              onClick={() => setActiveNode('BETA')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeNode === 'BETA' ? 'bg-[#0f0c1e] border-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.2)]' : 'bg-[#1c192c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#00eefc] uppercase font-bold">DÜĞÜM-02 (ÖNCELİK)</span>
                <span className="material-symbols-outlined text-[#00eefc] text-[14px]">electric_bolt</span>
              </div>
              <div className="my-1.5">
                <span className="font-sora text-xs text-[#00eefc] block font-bold">NODE-BETA</span>
                <span className="font-manrope text-[10px] text-white">Mavi Terminal (Optik)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="font-mono text-[9px] text-[#00eefc] font-bold">1. BAĞLANTI</span>
                <span className="font-mono text-[9px] text-[#00eefc] font-black">24.5V KİLİT</span>
              </div>
            </div>

            {/* Node Gamma */}
            <div 
              onClick={() => setActiveNode('GAMMA')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeNode === 'GAMMA' ? 'bg-[#2b273b] border-[#9e8f78]' : 'bg-[#1c192c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#9e8f78] uppercase">DÜĞÜM-03</span>
                <span className="material-symbols-outlined text-[#9e8f78] text-[14px]">fence</span>
              </div>
              <div className="my-1.5">
                <span className="font-sora text-xs text-white block font-bold">NODE-GAMMA</span>
                <span className="font-manrope text-[10px] text-[#9e8f78]">Yedek Güvenlik Bloğu</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="font-mono text-[9px] text-[#9e8f78]">ATLANACAK</span>
                <span className="font-mono text-[9px] text-[#9e8f78]">PASİF</span>
              </div>
            </div>

            {/* Node Delta */}
            <div 
              onClick={() => setActiveNode('DELTA')}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                activeNode === 'DELTA' ? 'bg-[#0f0c1e] border-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.2)]' : 'bg-[#1c192c] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#ffb703] uppercase font-bold">DÜĞÜM-04 (İKİNCİL)</span>
                <span className="material-symbols-outlined text-[#ffb703] text-[14px]">bolt</span>
              </div>
              <div className="my-1.5">
                <span className="font-sora text-xs text-[#ffba27] block font-bold">NODE-DELTA</span>
                <span className="font-manrope text-[10px] text-white">Sarı Terminal (Data)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="font-mono text-[9px] text-[#ffdba0] font-bold">2. BAĞLANTI</span>
                <span className="font-mono text-[9px] text-[#ffba27] font-black">BYPASS HAZIR</span>
              </div>
            </div>
          </div>

          {/* Port Frekans Osiloskopu */}
          <div className="p-2.5 rounded-lg bg-[#0f0c1e] border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[16px]">waves</span>
                <span className="font-mono text-[9px] text-[#00eefc] uppercase font-bold">PORT FREKANS OSİLOSKOPU</span>
              </div>
              <span className="font-mono text-[9px] text-[#ffb703] font-bold">88.4 kHz REZONANS</span>
            </div>
            {/* SVG Oscilloscope Line Waveform */}
            <div className="w-full h-12 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" fill="none" viewBox="0 0 300 60">
                <path d="M 0 30 Q 15 10 30 30 T 60 30 T 90 10 T 120 50 T 150 15 T 180 45 T 210 25 T 240 35 T 270 10 T 300 30" fill="transparent" stroke="#00eefc" strokeLinecap="round" strokeWidth="2"></path>
                <path d="M 0 30 Q 15 20 30 30 T 60 30 T 90 20 T 120 40 T 150 22 T 180 38 T 210 28 T 240 32 T 270 20 T 300 30" fill="transparent" opacity="0.6" stroke="#ffb703" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>
        </section>

        {/* Classified Dossier Card - Instructions for Field Partner */}
        <div className="rounded-xl bg-[#0f0c1e] p-3 border border-[#ffb703]/30 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[9px] text-[#ffb703] uppercase tracking-wider font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              GİZLİ TALİMAT // SAHADAKİ AJANA SÖYLE
            </span>
            <span className="font-mono text-[8px] bg-[#201d30] text-[#00eefc] px-1.5 py-0.5 rounded">TELSİZ İLETİŞİMİ</span>
          </div>
          <div className="p-2 rounded-lg bg-[#201d30] border border-white/5 space-y-1 font-mono text-[11px]">
            <p className="text-white">
              1. <span className="text-[#00eefc] font-bold">PORT-BETA</span>: Mavi kabloyu kitle ve voltajı <span className="text-[#ffb703] font-bold">24.5V</span> yap.
            </p>
            <p className="text-white">
              2. <span className="text-[#ffdba0] font-bold">PORT-DELTA</span>: Sarı kabloyu tak ve bypass kilidini vur.
            </p>
          </div>
        </div>

        {/* Feedback Display */}
        {feedback.msg && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-xs font-semibold leading-tight">{feedback.msg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          {diagnostic.isSolved ? (
            <button
              onClick={() => onAdvancePhase({ roundId: state.currentRoundId || 'round1', expectedPhaseIndex: 0 })}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-sora text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] active:translate-y-1 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
              <span>FAZ 01 BYPASS BAŞARILI // AŞAMA 2'YE İLERLE</span>
            </button>
          ) : (
            <button
              onClick={handleGolgeBypassSubmit}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] hover:brightness-110 active:translate-y-1 text-[#271900] font-sora text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,183,3,0.3)] transition-all cursor-pointer select-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
              <span className="truncate">SUBNET KÖPRÜSÜNÜ SENKRONİZE ET</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isDerinBasinc) {
    const activeTankCount = Object.values(derinTanks).filter(Boolean).length;
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Top Sub HUD (Bilateral Telemetry Readout) */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c192c] shadow-md border border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase text-[#d5c4ac]">TELSİZ FREKANS</span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold">CH-02 ON</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="font-mono text-[9px] uppercase text-[#d5c4ac]">SÜRE</span>
              <span className="font-mono text-[11px] text-[#ffba27] font-bold">
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-[9px] uppercase text-[#d5c4ac]">GÖVDE</span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold">%{state.hullIntegrity}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono text-[9px] uppercase text-[#d5c4ac]">DERİNLİK</span>
              <span className="font-mono text-[11px] text-[#ffdba0] font-bold">850m</span>
            </div>
          </div>
        </div>

        {/* Role & Mission Briefing Header */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg bg-[#ffb703]/20 text-[#ffba27] font-mono text-[10px] uppercase font-bold">
              ROL: MAKİNİST
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-[#363246] text-[#00eefc] font-mono text-[10px] uppercase font-bold">
              HİDROLİK BASINÇ KONSOLU
            </span>
          </div>
          <h2 className="font-sora text-xl font-bold text-white">Balastı Dengele &amp; Vanaları Kilitle</h2>
          <p className="text-xs text-[#d5c4ac] leading-relaxed">
            Dümencinin telsizden aktardığı 042° kerteriz ve 48 Bar basınç değerine göre balast tanklarını devreye al.
          </p>
        </div>

        {/* Tactile Control 1: Tank Seçici Matrisi (4-Grid Matrix) */}
        <div className="flex flex-col p-3 rounded-xl bg-[#1c192c] shadow-md border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#00eefc]">valve</span>
              <span className="font-mono text-[10px] uppercase text-white font-bold">TANK SEÇİCİ MATRİSİ</span>
            </div>
            <span className="font-mono text-[11px] text-[#00eefc] font-bold">{activeTankCount}/4 AKTİF</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(tankId => {
              const active = derinTanks[tankId];
              const pct = tankId === 1 ? 12 : tankId === 2 ? 78 : tankId === 3 ? 25 : 82;
              return (
                <button
                  key={tankId}
                  onClick={() => toggleTank(tankId)}
                  className={`flex flex-col p-2.5 rounded-lg transition-all active:scale-95 text-left border ${
                    active
                      ? 'bg-[#363246] border-[#00eefc]/50 shadow-[inset_0_0_12px_rgba(0,238,252,0.15)]'
                      : 'bg-[#2b273b] border-white/5'
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-sora text-sm font-bold ${active ? 'text-[#00eefc]' : 'text-[#d5c4ac]'}`}>
                      Tank-{tankId}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[16px] ${active ? 'text-[#00eefc]' : 'text-zinc-500'}`}
                      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {active ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0f0c1e] mt-2 overflow-hidden">
                    <div
                      className={`h-full ${active ? 'bg-[#00eefc] animate-pulse' : 'bg-zinc-600'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className={`font-mono text-[9px] mt-1 ${active ? 'text-[#00eefc] font-bold' : 'text-zinc-400'}`}>
                    %{pct} {active ? 'DOLU [SEÇİLİ]' : 'BALAST'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactile Control 2: Mekanik Basınç Manometresi & Hassas Çevirme */}
        <div className="flex flex-col p-3 rounded-xl bg-[#1c192c] shadow-md border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#ffba27]">speed</span>
              <span className="font-mono text-[10px] uppercase text-white font-bold">ANA HİDROLİK MANOMETRE</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#ffb703]/20 border border-[#ffb703]/30">
              <span className="font-mono text-[10px] text-[#ffdba0] font-bold">HEDEF: 48 BAR</span>
            </div>
          </div>

          {/* Radial Manometer */}
          <div className="relative flex flex-col items-center justify-center py-1">
            <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-[#0f0c1e] shadow-inner border border-white/10">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#2b273b" strokeDasharray="197 66" strokeLinecap="round" strokeWidth="8"></circle>
                <circle
                  className="transition-all duration-300"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="42"
                  stroke={derinPressure === 48 ? '#00eefc' : '#ffba27'}
                  strokeDasharray={`${Math.round(((derinPressure - 30) / 40) * 197)} 197`}
                  strokeLinecap="round"
                  strokeWidth="8"
                ></circle>
              </svg>
              {/* Dial Center */}
              <div className="absolute flex flex-col items-center">
                <span className={`font-sora text-2xl font-extrabold leading-none ${derinPressure === 48 ? 'text-[#00eefc]' : 'text-[#ffba27]'}`}>
                  {derinPressure}
                </span>
                <span className="font-mono text-[9px] uppercase text-[#d5c4ac] mt-1">BAR BASINÇ</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#2b273b] border border-white/5">
              <span className={`w-2 h-2 rounded-full ${derinPressure === 48 ? 'bg-[#00eefc] animate-ping' : 'bg-[#ffba27]'}`}></span>
              <span className={`font-mono text-[10px] font-bold ${derinPressure === 48 ? 'text-[#00eefc]' : 'text-[#ffba27]'}`}>
                {derinPressure === 48 ? '48 BAR KİLİTLİ • DEĞER STABİL' : `${derinPressure} BAR • HEDEFE AYARLA`}
              </span>
            </div>
          </div>

          {/* Stepper Buttons (+/- 1 Bar) */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setDerinPressure(p => Math.max(30, p - 1))}
              className="flex-1 py-2 rounded-lg bg-[#2b273b] hover:bg-[#363246] active:scale-95 transition-transform flex items-center justify-center gap-1 text-white border border-white/5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
              <span className="font-mono text-[10px] uppercase font-bold">-1 BAR</span>
            </button>
            <button
              onClick={() => setDerinPressure(p => Math.min(70, p + 1))}
              className="flex-1 py-2 rounded-lg bg-[#2b273b] hover:bg-[#363246] active:scale-95 transition-transform flex items-center justify-center gap-1 text-white border border-white/5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="font-mono text-[10px] uppercase font-bold">+1 BAR</span>
            </button>
          </div>
        </div>

        {/* Tactile Control 3: Hidrolik Açı Dümeni */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1c192c] shadow-md border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-[#0f0c1e] flex items-center justify-center border border-white/10 shadow-inner">
              <span className="material-symbols-outlined text-[#00eefc] text-[20px]">explore</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase text-[#d5c4ac]">HİDROLİK AÇI DÜMENİ</span>
              <h3 className="font-sora text-sm text-[#00eefc] font-bold">042° Kerteriz</h3>
              <span className="text-[10px] text-[#d5c4ac]">Dümenci rotasıyla kilitlendi</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-[#00eefc]/20 text-[#00eefc] font-mono text-[10px] font-bold border border-[#00eefc]/30">
            SENKRON
          </span>
        </div>

        {/* Kılavuz Bilgisi */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#201d30] border border-white/5">
          <span className="material-symbols-outlined text-[#ffba27] text-[18px] mt-0.5 shrink-0">info</span>
          <p className="text-[11px] text-[#d5c4ac] leading-tight">
            Dümenci sadece sonar görür, basınç vanalarını sen yönetirsin! Tank-2 ve Tank-4 seçilmeli, basınç 48 Bar olmalıdır.
          </p>
        </div>

        {/* Big Action Push Button */}
        {!diagnostic.isSolved ? (
          <div className="w-full pt-1">
            <button
              onClick={handleActivateValves}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-b from-[#ffba27] to-[#e69500] text-[#271900] flex items-center justify-center gap-2 transition-transform active:translate-y-1 shadow-[0_6px_0_#8f5300,0_12px_24px_rgba(255,186,39,0.3)] font-sora font-extrabold text-sm uppercase tracking-wider cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>power_settings_new</span>
              <span>BALAST VANALARINI DEVREYE SOK</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>BALAST KİLİTLENDİ • DEVAM ET</span>
          </button>
        )}
      </div>
    );
  }

  const selectedMod = circuitModules.find((m) => m.key === selectedLine);
  const selectedTelemetry = selectedLine ? diagnostic.lines[selectedLine] : null;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-header & Role Identification */}
      <div className="pt-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">build</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS KONSOLU</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#2b273b] border border-[#00eefc]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
            <span className="font-mono text-[9px] text-[#00eefc] font-bold uppercase">4 HAT CANLI SENSÖR</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sora text-2xl font-bold text-white tracking-tight">Ölçümleri</span>
          <span className="font-sora text-2xl font-extrabold text-[#00eefc] tracking-tight drop-shadow-[0_0_12px_rgba(0,238,252,0.4)]">
            Karşılaştır
          </span>
        </div>
        <p className="text-xs text-[#d5c4ac] font-mono">
          Sensörleri inceleyin, Kaptana aktarın ve arızalı hattı seçerek tahliye uygulayın.
        </p>
      </div>

      {/* 4 Circuits Live Telemetry Comparative Matrix */}
      <div className="mt-3 w-full rounded-2xl bg-[#0f0c1e] p-3 shadow-2xl border border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00eefc]">table_chart</span>
            DEVRE TELEMETRİ MATRİSİ
          </span>
          <span className="text-[9px] font-mono text-[#d5c4ac]">
            {selectedLine ? `${selectedMod?.code} SEÇİLİ` : 'SEÇİM YOK'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {circuitModules.map((mod) => {
            const data = diagnostic.lines[mod.key];
            const isSelected = selectedLine === mod.key;
            const isSolved = diagnostic.isSolved && data?.status === 'stabil';

            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => handleSelectLine(mod.key)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00eefc]/15 border-[#00eefc] shadow-[0_0_14px_rgba(0,238,252,0.3)] ring-1 ring-[#00eefc]'
                    : isSolved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-[#1c192c] border-white/5 hover:bg-[#25223a]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] font-bold text-[#00eefc]">{mod.code}</span>
                    <span className="text-[10px] text-zinc-300 font-medium truncate max-w-[85px]">{mod.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse"></span>
                  )}
                </div>

                {/* Sensor Metrics Readout - purely neutral numeric telemetries, no spoiler red colors */}
                <div className="grid grid-cols-3 gap-1 my-2 bg-[#120f24] p-1.5 rounded-lg border border-white/5">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-[#d5c4ac]">ISI</span>
                    <span className={`text-[10px] font-mono font-bold ${isSolved ? 'text-emerald-400' : 'text-[#ffdba0]'}`}>
                      {data.temp}°C
                    </span>
                  </div>
                  <div className="flex flex-col items-center border-x border-white/5">
                    <span className="text-[8px] font-mono text-[#d5c4ac]">BASINÇ</span>
                    <span className={`text-[10px] font-mono font-bold ${isSolved ? 'text-emerald-400' : 'text-[#00eefc]'}`}>
                      {data.press} kPa
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-[#d5c4ac]">PARAZİT</span>
                    <span className={`text-[10px] font-mono font-bold ${isSolved ? 'text-emerald-400' : 'text-[#dab5ff]'}`}>
                      {data.noise} dB
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#d5c4ac]">DURUM:</span>
                  <span className={isSolved ? 'text-emerald-400 font-bold' : isSelected ? 'text-[#00eefc] font-bold' : 'text-zinc-400'}>
                    {isSolved ? 'DENGELENDİ' : isSelected ? 'SEÇİLDİ' : 'İNCELE'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Physical Intervention Console (Active when a line is selected) */}
      <div className={`mt-3 rounded-2xl bg-[#1c192c] p-3.5 flex flex-col gap-3 shadow-xl border transition-all ${
        selectedLine ? 'border-[#00eefc]/30' : 'border-white/5 opacity-75'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#00eefc]">tune</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
              TAHLİYE KONTROLLERİ {selectedMod ? `// ${selectedMod.code}` : ''}
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">
            {diagnostic.unlockedBreaker ? (
              <span className="text-emerald-400 font-bold">KESİCİ DEVRE DIŞI</span>
            ) : (
              <span className="text-[#ffb703]">KAPTAN KİLİDİ BEKLENİYOR</span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Soğutma Valfi Açısı (Rotary Selectors) */}
          <div className="rounded-xl bg-[#201d30] p-2.5 flex flex-col justify-between border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#d5c4ac] uppercase font-bold">Soğutma Valfi</span>
              <span className="font-mono text-[10px] text-[#00eefc] font-bold">{coolingValveAngle}°</span>
            </div>

            {/* Valve Angle Dial Buttons */}
            <div className="grid grid-cols-4 gap-1 my-2">
              {[45, 90, 135, 180].map((angle) => (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setCoolingValveAngle(angle)}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    coolingValveAngle === angle
                      ? 'bg-[#00eefc] text-[#002022] shadow-[0_0_8px_rgba(0,238,252,0.4)]'
                      : 'bg-[#2b273b] text-[#d5c4ac] hover:bg-[#353147]'
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>

            <div className="text-[9px] font-mono text-[#d5c4ac] text-center">
              Kaptanın talimatına göre ayarlayın
            </div>
          </div>

          {/* Basınç Tahliyesi Anahtarı */}
          <div className="rounded-xl bg-[#201d30] p-2.5 flex flex-col justify-between border border-white/5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#d5c4ac] uppercase font-bold">Basınç Tahliyesi</span>
              <span className={`font-mono text-[9px] font-bold ${pressureThrottleToggled ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {pressureThrottleToggled ? 'AKTİF' : 'KAPALI'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPressureThrottleToggled(!pressureThrottleToggled)}
              className={`w-full py-2 my-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                pressureThrottleToggled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                  : 'bg-[#2b273b] text-[#d5c4ac] border-white/5 hover:bg-[#353147]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {pressureThrottleToggled ? 'check_circle' : 'toggle_off'}
              </span>
              <span>{pressureThrottleToggled ? 'TAHLİYE AKTİF' : 'TAHLİYE AÇ'}</span>
            </button>

            <div className="text-[9px] font-mono text-[#d5c4ac] text-center">
              Tahliye vanasını devreye sokar
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {(state.feedbackMessage || feedback.msg) && (
        <div className={`mt-3 p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          (state.feedbackState === 'success' || (!state.feedbackState && feedback.type === 'success'))
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {state.feedbackMessage || feedback.msg}
        </div>
      )}

      {/* Action Trigger */}
      <div className="mt-3 flex flex-col gap-1.5">
        {!diagnostic.isSolved ? (
          <>
            <button
              onClick={handlePurgePressure}
              disabled={!selectedLine}
              className={`w-full h-14 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !selectedLine
                  ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 cursor-pointer'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">air</span>
              <span>
                {!selectedLine 
                  ? 'ÖNCE DEVRE / HAT SEÇİN' 
                  : `${selectedMod?.code || ''} İçin Tahliyeyi Uygula`}
              </span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span className="text-[11px] font-mono">
                {!selectedLine 
                  ? 'Sensörleri karşılaştırıp arızalı devreyi işaretleyin' 
                  : 'Kaptan kesiciyi açmadan tahliye uygulanamaz'}
              </span>
            </div>
          </>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
