import React, { useState } from 'react';
import { MissionState, ENVIRONMENTS } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen05ReactorCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { diagnostic, activeEnvironment } = state;
  const envInfo = ENVIRONMENTS[activeEnvironment];

  // No breaker is pre-selected by default! Starts null unless already selected in room state
  const [selectedBreaker, setSelectedBreaker] = useState<'K1' | 'K2' | 'K3' | 'K4' | null>(
    diagnostic.captainSelectedBreaker || null
  );

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: diagnostic.isSolved ? 'success' : 'idle',
    msg: diagnostic.isSolved ? `${diagnostic.captainSelectedBreaker || 'Kesici'} Devre Dışı • Reaktör Kararlı` : '',
  });

  const handleSelectBreaker = (id: 'K1' | 'K2' | 'K3' | 'K4') => {
    if (diagnostic.isSolved) return;
    setSelectedBreaker(id);
    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        captainSelectedBreaker: id,
      },
    }));
  };

  const handleUnlockAction = () => {
    if (diagnostic.isSolved || !selectedBreaker) return;

    if (onAction) {
      onAction('diagnostic_captain_breaker', { breaker: selectedBreaker });
      return;
    }

    if (selectedBreaker === diagnostic.correctBreaker) {
      const willSolve = diagnostic.engineerActionTaken && 
        diagnostic.engineerSuggestedLine === diagnostic.faultyLine;
      setFeedback({
        type: 'success',
        msg: willSolve 
          ? `GÜVENLİK KİLİDİ AÇILDI! ${selectedBreaker} kesicisi devreyi izole etti. Reaktör dengelendi!`
          : `GÜVENLİK KİLİDİ AÇILDI (${selectedBreaker})! Devre akımı kesildi. Mühendisin tahliye müdahalesi bekleniyor.`,
      });
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          captainSelectedBreaker: selectedBreaker,
          unlockedBreaker: selectedBreaker,
          isSolved: willSolve,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `Hatalı kesici seçimi (${selectedBreaker})! İzole edilen hatta aktif bir anomali bulunmuyor; sağlam sistemin enerjisi kesildi. Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
        diagnostic: {
          ...prev.diagnostic,
          captainSelectedBreaker: selectedBreaker,
        },
      }));
    }
  };

  const isUnlocked = diagnostic.unlockedBreaker === selectedBreaker && selectedBreaker !== null;

  // Circuit modules metadata
  const circuitModules = [
    { key: 'reaktor', code: 'CIR-01', name: 'Ana Reaktör', icon: 'cyclone' },
    { key: 'sogutucu', code: 'CIR-02', name: 'Soğutucu Çekirdek', icon: 'mode_fan' },
    { key: 'anten', code: 'CIR-03', name: 'Anten Ünitesi', icon: 'satellite_alt' },
    { key: 'yonlendirme', code: 'CIR-04', name: 'İtki ve Yönlendirme', icon: 'navigation' },
  ] as const;

  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  // Gölge Protokolü Phase 1 (Ajan: Fiziksel Panel) states
  const [golgeSelectedCable, setGolgeSelectedCable] = useState<'SARI' | 'MOR' | null>('SARI');
  const [golgePorts, setGolgePorts] = useState<{
    ALPHA: { status: 'idle' | 'plugged'; cable?: string };
    BETA: { status: 'idle' | 'plugged'; cable?: string };
    GAMMA: { status: 'idle' | 'plugged'; cable?: string };
    DELTA: { status: 'idle' | 'plugged'; cable?: string };
  }>({
    ALPHA: { status: 'idle' },
    BETA: { status: 'plugged', cable: 'MAVİ' }, // Default per template: Mavi is attached to Beta
    GAMMA: { status: 'idle' },
    DELTA: { status: 'idle' },
  });
  const [golgeVoltage, setGolgeVoltage] = useState<number>(24.5);

  const handleGolgePortClick = (portKey: 'ALPHA' | 'BETA' | 'GAMMA' | 'DELTA') => {
    if (diagnostic.isSolved) return;
    if (portKey === 'BETA') return; // Fixed
    if (golgePorts[portKey].status === 'plugged') {
      // Unplug
      setGolgePorts(prev => ({
        ...prev,
        [portKey]: { status: 'idle' }
      }));
    } else if (golgeSelectedCable) {
      // Plug
      setGolgePorts(prev => ({
        ...prev,
        [portKey]: { status: 'plugged', cable: golgeSelectedCable }
      }));
    }
  };

  const handleGolgeExecuteIntervention = () => {
    // If voltage is 24.5V (within 0.5V tolerance) and Delta or Beta has a connection
    const isVoltageTarget = Math.abs(golgeVoltage - 24.5) <= 0.5;
    const isBetaLocked = golgePorts.BETA.status === 'plugged';
    const isDeltaReady = golgePorts.DELTA.status === 'plugged' && golgePorts.DELTA.cable === 'SARI';

    if (isVoltageTarget && (isDeltaReady || isBetaLocked)) {
      if (onAction) {
        onAction('diagnostic_captain_breaker', { breaker: 'K2' });
      }
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          captainSelectedBreaker: 'K2',
          unlockedBreaker: 'K2',
          engineerActionTaken: true,
          isSolved: true,
        },
      }));
      setFeedback({
        type: 'success',
        msg: 'GÜVENLİK DUVARI AŞILDI! Fiziksel panel bypass tamamlandı, faz kilidi açıldı.',
      });
    } else {
      setFeedback({
        type: 'error',
        msg: 'VOLTAJ YA DA SOKET HATALI! Hackerın talimatlarını kontrol edin (24.5V & Port-Delta Sarı).',
      });
      onUpdate((prev) => ({
        ...prev,
        stealthLevel: Math.max(0, (prev.stealthLevel ?? 100) - 5),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 10),
      }));
    }
  };

  // Gölge Protokolü (Ajan - Fiziksel Panel) UI (Lines 406-729 of template)
  if (isGolgeProtokolu) {
    const activePinCount = (golgePorts.ALPHA.status === 'plugged' ? 1 : 0) +
      (golgePorts.BETA.status === 'plugged' ? 1 : 0) +
      (golgePorts.GAMMA.status === 'plugged' ? 1 : 0) +
      (golgePorts.DELTA.status === 'plugged' ? 1 : 0);

    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Live Tactical HUD Micro-strip */}
        <div className="px-3 py-2 flex items-center justify-between gap-1 bg-[#0f0c1e]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping"></span>
            <span className="font-mono text-[10px] text-[#ffdba0] uppercase tracking-wider font-bold">AŞAMA 01 / 04</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#201d30]">
              <span className="material-symbols-outlined text-[13px] text-[#7df4ff]">timer</span>
              <span className="font-mono text-[11px] text-[#7df4ff] font-bold">
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#201d30]">
              <span className="material-symbols-outlined text-[13px] text-[#00eefc]">visibility_off</span>
              <span className="font-mono text-[10px] text-[#00eefc] font-bold">%{state.stealthLevel ?? 100}</span>
            </div>
          </div>
        </div>

        {/* Mission Role & Briefing Card */}
        <div className="flex flex-col gap-1 bg-[#1c192c] p-3.5 rounded-xl shadow-md border border-white/5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ffb703]/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#ffb703]/15 text-[#ffdba0]">
              <span className="material-symbols-outlined text-[14px] text-[#ffb703]">shield_person</span>
              <span className="font-mono text-[9px] font-bold tracking-wider uppercase">ROL: SAHADAKİ AJAN // FİZİKSEL PANEL</span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] bg-[#201d30] px-2 py-0.5 rounded-lg">GİZLİ SIZMA</span>
          </div>
          <h2 className="font-sora text-base text-white font-bold tracking-tight mt-1">
            DAĞITIM KUTUSU KABLOLARINI BAĞLA
          </h2>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Hackerın telsizden bildirdiği porta uygun renkli kablo jakını tak ve voltaj potansiyometresini istenen seviyeye ayarla.
          </p>
        </div>

        {/* Live Comms Audio Transmission Bar */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#201d30] shadow-sm border border-white/5 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#0f0c1e] flex items-center justify-center shrink-0 relative border border-[#00eefc]/20">
            <span className="material-symbols-outlined text-[#00eefc] text-[20px]">headset_mic</span>
            <span className="w-2 h-2 rounded-full bg-[#00eefc] absolute top-1 right-1 animate-pulse"></span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#00eefc] uppercase font-bold truncate">
                {state.engineerName || 'HACKER MERT'} [KONSOL BİLGİSİ]
              </span>
              <span className="font-mono text-[9px] text-[#9e8f78]">CANLI SES</span>
            </div>
            <p className="font-manrope text-xs text-white truncate font-medium mt-0.5">
              “Önce mavi Beta soketini kilitle, voltajı 24.5 volta sabitle!”
            </p>
          </div>
          <div className="flex items-end gap-0.5 h-5 shrink-0 px-1">
            <div className="w-1 bg-[#00eefc] rounded-full animate-bounce h-3"></div>
            <div className="w-1 bg-[#00eefc] rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 bg-[#00eefc] rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 bg-[#00eefc] rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }}></div>
          </div>
        </div>

        {/* Live Situational Viewport */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-lg bg-[#0f0c1e] border border-white/5">
          <img 
            className="w-full h-full object-cover" 
            alt="Fiziksel Panel POV" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6iGDm6P0-WtxdcuvFBI9rfbJbEbBbozUD9ATZLkw92UlG6__KyMXSp504ltUGgHGaGt53VNyeaXjxm2H7YU2bhvjXgqm1uolxDu7e9eXGxnUvsqjlKKmF1A_vs0Az2RadYLzOJyuwDMRziJTjdkO1vL8pz2uAxsEZXpq_ONtR_KK6MpYHKgGX5BRNGkr3fZoFLpkryjEmAzE4RjO2rMjIXQ9D6RO-eTMRyu2aDlY"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-transparent to-transparent"></div>
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#0f0c1e]/80 backdrop-blur-sm border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></span>
            <span className="font-mono text-[9px] text-white uppercase">CANLI SAHA KONSOLU // POV</span>
          </div>
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ffb703]">lock_open</span>
              <span className="font-mono text-[9px] text-white font-bold uppercase">PANEL KİLİDİ DEVRE DIŞI</span>
            </div>
            <span className="font-mono text-[9px] text-[#ffdba0] bg-[#201d30]/90 px-2 py-0.5 rounded-lg border border-white/5">
              FİZİKSEL ERİŞİM TAM
            </span>
          </div>
        </div>

        {/* Tangible Interactive Control 1: Physical Patchbay */}
        <div className="flex flex-col gap-2 bg-[#201d30] p-3 rounded-xl shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[18px]">cable</span>
              <h3 className="font-sora text-xs text-white font-bold">SOKET BAĞLANTILARI</h3>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] bg-[#0f0c1e] px-2 py-0.5 rounded-lg border border-white/5">
              {activePinCount}/4 PIN AKTİF
            </span>
          </div>
          <p className="font-manrope text-[11px] text-[#d5c4ac] -mt-1">
            Junction box içindeki terminal soketlerine doğru sinyal kablolarını takın.
          </p>

          {/* 4 Terminal Ports Grid */}
          <div className="grid grid-cols-2 gap-2 mt-0.5">
            {/* Port Alpha */}
            <button 
              type="button"
              onClick={() => handleGolgePortClick('ALPHA')}
              className={`flex flex-col p-2.5 rounded-lg text-left transition-all border ${
                golgePorts.ALPHA.status === 'plugged'
                  ? 'bg-[#0f0c1e] border-[#00eefc]'
                  : 'bg-[#2b273b] border-white/5 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#d5c4ac] font-bold">PORT-ALPHA</span>
                <span className={`w-2.5 h-2.5 rounded-full ${golgePorts.ALPHA.status === 'plugged' ? 'bg-[#00eefc]' : 'bg-[#3a374b]'}`}></span>
              </div>
              <span className="font-sora text-xs text-white font-semibold mt-1">Topraklama Pini</span>
              <span className="font-mono text-[9px] text-[#9e8f78] mt-0.5">
                {golgePorts.ALPHA.status === 'plugged' ? `${golgePorts.ALPHA.cable} // BAĞLI` : 'GÜVENLİ DEVRE // BOŞTA'}
              </span>
            </button>

            {/* Port Beta */}
            <button 
              type="button"
              onClick={() => handleGolgePortClick('BETA')}
              className="flex flex-col p-2.5 rounded-lg bg-[#0f0c1e] border border-[#00eefc]/50 shadow-inner text-left transition-all"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">PORT-BETA</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_8px_#00eefc]"></span>
              </div>
              <span className="font-sora text-xs text-[#00eefc] font-semibold mt-1">Mavi Optik Hat</span>
              <span className="font-mono text-[9px] text-[#00dbe9] mt-0.5">BAĞLI %100 // KİLİTLİ</span>
            </button>

            {/* Port Gamma */}
            <button 
              type="button"
              onClick={() => handleGolgePortClick('GAMMA')}
              className={`flex flex-col p-2.5 rounded-lg text-left transition-all border ${
                golgePorts.GAMMA.status === 'plugged'
                  ? 'bg-[#0f0c1e] border-[#eed8ff]'
                  : 'bg-[#2b273b] border-white/5 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#d5c4ac] font-bold">PORT-GAMMA</span>
                <span className={`w-2.5 h-2.5 rounded-full ${golgePorts.GAMMA.status === 'plugged' ? 'bg-[#eed8ff]' : 'bg-[#3a374b]'}`}></span>
              </div>
              <span className="font-sora text-xs text-white font-semibold mt-1">Yedek Frekans</span>
              <span className="font-mono text-[9px] text-[#9e8f78] mt-0.5">
                {golgePorts.GAMMA.status === 'plugged' ? `${golgePorts.GAMMA.cable} // BAĞLI` : 'SİNYAL YOK // KAPALI'}
              </span>
            </button>

            {/* Port Delta */}
            <button 
              type="button"
              onClick={() => handleGolgePortClick('DELTA')}
              className={`flex flex-col p-2.5 rounded-lg text-left transition-all border ${
                golgePorts.DELTA.status === 'plugged'
                  ? 'bg-[#0f0c1e] border-[#ffb703] shadow-[0_0_8px_rgba(255,183,3,0.3)]'
                  : 'bg-[#2b273b] border-[#ffb703]/30 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] text-[#ffba27] font-bold">PORT-DELTA</span>
                <span className={`w-2.5 h-2.5 rounded-full ${golgePorts.DELTA.status === 'plugged' ? 'bg-[#ffb703]' : 'bg-[#ffb703] animate-ping'}`}></span>
              </div>
              <span className="font-sora text-xs text-[#ffdba0] font-semibold mt-1">Sarı Data Yolu</span>
              <span className="font-mono text-[9px] text-[#ffba27] mt-0.5">
                {golgePorts.DELTA.status === 'plugged' ? `${golgePorts.DELTA.cable} // KİLİTLENDİ` : 'BAĞLANTI BEKLİYOR'}
              </span>
            </button>
          </div>

          {/* Color-coded Patch Cables Selector */}
          <div className="flex flex-col gap-1 mt-1 pt-2 bg-[#0f0c1e]/60 p-2.5 rounded-lg border border-white/5">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase font-bold">Sahadaki Jak Kablo Seçici:</span>
            <div className="grid grid-cols-3 gap-2">
              {/* Blue Jack (Attached) */}
              <div className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg bg-[#2b273b] opacity-60 cursor-not-allowed">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[9px] text-[#00eefc] truncate font-bold">Mavi [BAĞLI]</span>
              </div>
              {/* Yellow Jack */}
              <button 
                type="button"
                onClick={() => setGolgeSelectedCable('SARI')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-transform active:translate-y-0.5 font-mono text-[9px] font-bold ${
                  golgeSelectedCable === 'SARI'
                    ? 'bg-[#ffb703] text-[#271900] shadow-md font-black'
                    : 'bg-[#2b273b] text-[#ffdba0]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb703]"></span>
                <span className="truncate">{golgeSelectedCable === 'SARI' ? 'Sarı [SEÇİLİ]' : 'Sarı [BOŞTA]'}</span>
              </button>
              {/* Purple Jack */}
              <button 
                type="button"
                onClick={() => setGolgeSelectedCable('MOR')}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-transform active:translate-y-0.5 font-mono text-[9px] font-bold ${
                  golgeSelectedCable === 'MOR'
                    ? 'bg-[#dab5ff] text-[#2c0051] shadow-md font-black'
                    : 'bg-[#2b273b] text-[#eed8ff]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#dab5ff]"></span>
                <span className="truncate">{golgeSelectedCable === 'MOR' ? 'Mor [SEÇİLİ]' : 'Mor [BOŞTA]'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tangible Interactive Control 2: Analog Voltage Potentiometer */}
        <div className="flex flex-col gap-2 bg-[#201d30] p-3 rounded-xl shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[18px]">tune</span>
              <h3 className="font-sora text-xs text-white font-bold">VOLTAJ POTANSİYOMETRESİ</h3>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0f0c1e] border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase">ANOMALİ %0</span>
            </div>
          </div>

          {/* Meter Visual Gauge + Current Readout */}
          <div className="flex items-center justify-between bg-[#0f0c1e] p-3 rounded-lg border border-white/5">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-[#9e8f78] uppercase font-bold">HEDEF VOLTAJ SEVİYESİ</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-sora text-3xl text-[#ffb703] font-extrabold tracking-tight">
                  {golgeVoltage.toFixed(1)}
                </span>
                <span className="font-sora text-sm text-[#ffdba0] font-bold">V</span>
              </div>
            </div>
            {/* Inline Visual Radial Dial (SVG) */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle className="text-[#363246]" cx="24" cy="24" fill="none" r="20" stroke="currentColor" strokeWidth="4"></circle>
                <circle 
                  className="text-[#ffb703] transition-all duration-300" 
                  cx="24" 
                  cy="24" 
                  fill="none" 
                  r="20" 
                  stroke="currentColor" 
                  strokeDasharray="125.6" 
                  strokeDashoffset={Math.max(0, 125.6 - (golgeVoltage / 36) * 125.6)}
                  strokeLinecap="round" 
                  strokeWidth="4"
                ></circle>
              </svg>
              <span className="material-symbols-outlined text-[#ffb703] text-[18px] absolute">bolt</span>
            </div>
          </div>

          {/* Tactile Voltage Adjustment Controls */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setGolgeVoltage(prev => Math.max(12, +(prev - 0.5).toFixed(1)))}
              className="flex-1 py-2 px-3 rounded-lg bg-[#2b273b] hover:bg-[#3a374b] active:bg-[#484459] flex items-center justify-center gap-1 transition-all active:translate-y-0.5 border border-white/5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffba27]">remove</span>
              <span className="font-mono text-[10px] text-white font-bold">-0.5V</span>
            </button>
            <button 
              type="button"
              onClick={() => setGolgeVoltage(prev => Math.min(36, +(prev + 0.5).toFixed(1)))}
              className="flex-1 py-2 px-3 rounded-lg bg-[#2b273b] hover:bg-[#3a374b] active:bg-[#484459] flex items-center justify-center gap-1 transition-all active:translate-y-0.5 border border-white/5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffba27]">add</span>
              <span className="font-mono text-[10px] text-white font-bold">+0.5V</span>
            </button>
          </div>

          {/* Slider Bar */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between font-mono text-[9px] text-[#9e8f78]">
              <span>12.0V MİN</span>
              <span className="text-[#00eefc]">HASSAS POTANS AYARI</span>
              <span>36.0V MAKS</span>
            </div>
            <input 
              type="range"
              min="12"
              max="36"
              step="0.5"
              value={golgeVoltage}
              onChange={(e) => setGolgeVoltage(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg bg-[#0f0c1e] appearance-none cursor-pointer accent-[#ffb703]"
            />
          </div>
        </div>

        {/* Feedback message if any */}
        {feedback.msg && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-xs font-semibold leading-tight">{feedback.msg}</span>
          </div>
        )}

        {/* Confirmation & Lock Bottom Action Button */}
        <div className="flex flex-col gap-1.5 pt-1">
          {diagnostic.isSolved ? (
            <button
              onClick={() => onAdvancePhase({ roundId: state.currentRoundId || 'round1', expectedPhaseIndex: 0 })}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-sora text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] active:translate-y-1 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
              <span>FAZ 01 TAMAMLANDI // AŞAMA 2'YE İLERLE</span>
            </button>
          ) : (
            <button
              onClick={handleGolgeExecuteIntervention}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] hover:brightness-110 active:translate-y-1 text-[#271900] font-sora text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,183,3,0.3)] transition-all cursor-pointer select-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">vpn_key</span>
              <span className="truncate">SOKETLERİ KİLİTLE & GÜVENLİK DUVARINI KIR</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Derin Basınç (Sonar & Açı - Dümenci) UI
  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Top Tactical HUD telemetry strip */}
        <section className="w-full bg-[#1c192c] rounded-xl p-2.5 shadow-md mt-1 border border-white/5">
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="flex flex-col items-center justify-center p-1 bg-[#0f0c1e] rounded-lg">
              <span className="font-mono text-[9px] text-[#d5c4ac] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px] text-[#ffb703]">timer</span> SÜRE
              </span>
              <span className="font-mono text-[11px] text-[#ffb703] font-bold mt-0.5">
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-[#0f0c1e] rounded-lg">
              <span className="font-mono text-[9px] text-[#d5c4ac] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px] text-[#00eefc]">shield</span> GÖVDE
              </span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold mt-0.5">%{state.hullIntegrity}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-[#0f0c1e] rounded-lg">
              <span className="font-mono text-[9px] text-[#d5c4ac] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px] text-[#ffdba0]">south</span> DERİNLİK
              </span>
              <span className="font-mono text-[11px] text-[#ffdba0] font-bold mt-0.5">850m</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-[#0f0c1e] rounded-lg">
              <span className="font-mono text-[9px] text-[#d5c4ac] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px] text-[#eed8ff]">cell_tower</span> TELSİZ
              </span>
              <span className="font-mono text-[9px] text-[#dab5ff] font-bold mt-0.5">CH-02 ON</span>
            </div>
          </div>
        </section>

        {/* Role Tag & Directive Header */}
        <section className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-[#00eefc]/15 text-[#00eefc] font-mono text-[10px] tracking-widest uppercase font-bold">
              DÜMENCİ // SONAR HARİTASI
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
          </div>
          <h2 className="font-sora text-xl font-bold text-white tracking-tight">
            Resifleri Tara &amp; Açıyı Bildir
          </h2>
          <p className="text-xs text-[#d5c4ac] leading-relaxed">
            Sonar ekranındaki güvenli koridor açısını (042°) ve derinlik kademesini makiniste ilet.
          </p>
        </section>

        {/* Circular 360° Tactical Deep Sea Sonar Interactive Display */}
        <section className="relative w-full aspect-square max-w-[320px] mx-auto bg-[#0f0c1e] rounded-full p-2 flex items-center justify-center shadow-xl border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-[#00eefc]/10 via-transparent to-transparent pointer-events-none"></div>
          <svg className="w-full h-full select-none" viewBox="0 0 300 300">
            <defs>
              <linearGradient id="sonarSweepGrad" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="#00eefc" stopOpacity="0.45"></stop>
                <stop offset="60%" stopColor="#00eefc" stopOpacity="0.08"></stop>
                <stop offset="100%" stopColor="#00eefc" stopOpacity="0"></stop>
              </linearGradient>
              <radialGradient id="dangerGlow">
                <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.8"></stop>
                <stop offset="100%" stopColor="#93000a" stopOpacity="0"></stop>
              </radialGradient>
            </defs>
            {/* Range Rings */}
            <circle cx="150" cy="150" fill="none" opacity="0.6" r="135" stroke="#363246" strokeDasharray="4 4" strokeWidth="1.2"></circle>
            <circle cx="150" cy="150" fill="none" opacity="0.7" r="100" stroke="#363246" strokeWidth="1"></circle>
            <circle cx="150" cy="150" fill="none" opacity="0.5" r="65" stroke="#363246" strokeDasharray="2 3" strokeWidth="1"></circle>
            <circle cx="150" cy="150" fill="none" opacity="0.4" r="30" stroke="#00eefc" strokeWidth="1"></circle>
            {/* Crosshairs */}
            <line opacity="0.5" stroke="#363246" strokeWidth="1" x1="150" x2="150" y1="12" y2="288"></line>
            <line opacity="0.5" stroke="#363246" strokeWidth="1" x1="12" x2="288" y1="150" y2="150"></line>
            {/* Degree Ticks */}
            <text fill="#d3fbff" fontFamily="Sora" fontSize="9" fontWeight="700" textAnchor="middle" x="150" y="24">000° K</text>
            <text fill="#9e8f78" fontFamily="Sora" fontSize="8" textAnchor="end" x="282" y="153">090° D</text>
            <text fill="#9e8f78" fontFamily="Sora" fontSize="8" textAnchor="middle" x="150" y="284">180° G</text>
            <text fill="#9e8f78" fontFamily="Sora" fontSize="8" textAnchor="start" x="18" y="153">270° B</text>
            {/* 135° Obstacle Sector */}
            <g transform="translate(150, 150)">
              <circle cx="62" cy="62" fill="url(#dangerGlow)" r="22"></circle>
              <path d="M 45 55 Q 60 48 78 60 Q 72 75 52 72 Z" fill="#93000a" opacity="0.85"></path>
              <path d="M 48 58 L 56 66 L 68 56 L 74 65" fill="none" stroke="#ffb4ab" strokeWidth="1.5"></path>
              <circle cx="62" cy="62" fill="#ffb4ab" r="3"></circle>
              <text fill="#ffb4ab" fontFamily="Sora" fontSize="8" fontWeight="700" textAnchor="middle" x="62" y="92">135° RESİF ENGELİ</text>
            </g>
            {/* 042° Safe Passage Trench */}
            <g transform="translate(150, 150)">
              <line opacity="0.9" stroke="#00eefc" strokeDasharray="3 2" strokeWidth="1.8" x1="0" x2="68" y1="0" y2="-75"></line>
              <circle cx="68" cy="-75" fill="#00eefc" fillOpacity="0.25" r="9"></circle>
              <circle cx="68" cy="-75" fill="#00eefc" r="4"></circle>
              <path d="M 52 -88 L 76 -60" stroke="#ffba27" strokeLinecap="round" strokeWidth="2"></path>
              <text fill="#00eefc" fontFamily="Sora" fontSize="9" fontWeight="800" textAnchor="start" x="76" y="-88">042° KORİDOR</text>
            </g>
            {/* Center Submarine Ping */}
            <circle cx="150" cy="150" fill="#ffb703" r="5"></circle>
            <circle cx="150" cy="150" fill="none" opacity="0.6" r="11" stroke="#ffb703" strokeWidth="1">
              <animate attributeName="r" dur="2s" repeatCount="indefinite" values="6;18;6"></animate>
              <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.8;0;0.8"></animate>
            </circle>
          </svg>
          <div className="absolute bottom-3 left-4 flex items-center gap-1 bg-[#201d30]/90 px-2 py-0.5 rounded-lg border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse"></span>
            <span className="font-mono text-[9px] text-[#00eefc] tracking-widest">360° AKTİF TARAMA</span>
          </div>
        </section>

        {/* Asymmetric Secret Telemetry Box (Visible strictly to Dümenci) */}
        <section className="w-full bg-[#201d30] rounded-xl p-3.5 shadow-xl border border-[#ffb703]/20 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb703] text-[18px]">lock</span>
              <span className="font-mono text-[10px] text-[#ffb703] font-bold uppercase tracking-wider">
                GİZLİ TELEMETRİ // DÜMENCİ ÖZEL
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#93000a]/50 text-[#ffb4ab] font-mono text-[9px] font-bold">
              MAKİNİST GÖREMEZ!
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141123]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[16px]">explore</span>
                <span className="text-xs text-[#d5c4ac]">GÜVENLİ KERTERİZ:</span>
              </div>
              <span className="font-sora text-sm text-[#00eefc] font-bold">042° (KUZEYDOĞU)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141123]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffdba0] text-[16px]">valve</span>
                <span className="text-xs text-[#d5c4ac]">GEREKLİ BALAST TANKI:</span>
              </div>
              <span className="font-mono text-xs text-[#ffdba0] font-bold">TANK-2 VE TANK-4</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141123]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#dab5ff] text-[16px]">speed</span>
                <span className="text-xs text-[#d5c4ac]">HEDEF BASINÇ:</span>
              </div>
              <span className="font-mono text-xs text-[#dcb8ff] font-bold">48 BAR</span>
            </div>
          </div>
        </section>

        {/* Transmit action */}
        <section className="w-full pt-1">
          <button
            onClick={() => {
              if (selectedBreaker) {
                handleUnlockAction();
              } else {
                handleSelectBreaker('K1');
                setTimeout(() => {
                  onAction?.('diagnostic_captain_breaker', { breaker: 'K1' });
                }, 50);
              }
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-xs uppercase tracking-wider shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
            <span>KOORDİNATLARI MAKİNİSTE AKTAR</span>
          </button>
        </section>

        {/* Tactical Communication Alert Callout */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#2b273b]/60 border border-white/5">
          <span className="material-symbols-outlined text-[#ffb703] text-[18px] shrink-0 mt-0.5">tips_and_updates</span>
          <p className="text-[11px] text-[#d5c4ac] leading-tight">
            <span className="text-[#ffdba0] font-semibold">Taktik İpucu:</span> Makinist kadranı <span className="text-[#00eefc] font-bold">042°</span> ve basıncı <span className="text-[#ffb703] font-bold">48 Bar</span> yapana kadar vanaları serbest bırakma.
          </p>
        </div>

        {diagnostic.isSolved && (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>BALAST DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      <div className="w-full flex flex-col gap-3 pt-1">
        
        {/* Sub-header & Role Indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/30 shadow-[0_0_12px_rgba(255,183,3,0.25)]">
              <span className="material-symbols-outlined text-[15px]">military_tech</span>
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN KONSOLU</span>
            </div>
            <span className="text-[10px] font-mono text-[#00eefc] px-2.5 py-0.5 rounded-lg bg-[#00eefc]/10 border border-[#00eefc]/20">
              {envInfo.badge}
            </span>
          </div>
          <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight leading-tight mt-0.5">
            Arızalı Devreyi <span className="text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.5)]">Teşhis Et</span>
          </h2>
          <p className="text-xs text-[#d5c4ac] font-mono">
            Mühendisin sensör ölçümlerini kurallarla karşılaştırın ve doğru kesiciyi açın.
          </p>
        </div>

        {/* Space Station Circuit to Breaker Wiring Matrix */}
        <div className="w-full rounded-2xl bg-[#0f0c1e] p-3.5 flex flex-col gap-2.5 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white">
              <span className="material-symbols-outlined text-[16px] text-[#ffb703]">account_tree</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white font-bold">
                DEVRE – KESİCİ ŞEMASI
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">
              4 MODÜL BAĞLANTISI
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {circuitModules.map((mod) => {
              const breaker = diagnostic.lineBreakerMap[mod.key];
              const isEngineerFocus = diagnostic.engineerSuggestedLine === mod.key;
              const isTargetBreakerSelected = selectedBreaker === breaker;
              const isModuleSolved = diagnostic.isSolved && diagnostic.lines[mod.key]?.status === 'stabil';

              return (
                <div 
                  key={mod.key}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isModuleSolved
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : isTargetBreakerSelected
                      ? 'bg-[#ffb703]/10 border-[#ffb703]/60 shadow-[0_0_10px_rgba(255,183,3,0.2)]'
                      : 'bg-[#1c192c] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#00eefc] font-bold">{mod.code}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      isTargetBreakerSelected 
                        ? 'bg-[#ffb703] text-[#271900]' 
                        : 'bg-[#2b273b] text-white border border-white/10'
                    }`}>
                      {breaker}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 my-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#d5c4ac]">{mod.icon}</span>
                    <span className="text-xs text-white font-medium truncate">{mod.name}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[9px] font-mono text-[#d5c4ac]">DURUM:</span>
                    {isEngineerFocus ? (
                      <span className="text-[9px] font-mono font-bold text-[#ffb703] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping"></span>
                        MÜHENDİS İNCELİYOR
                      </span>
                    ) : isModuleSolved ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-400">STABİL</span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#d5c4ac]">AKTİF</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Protocol & Captain's Purge Instructions */}
        <div className="w-full rounded-2xl bg-[#1c192c] p-3.5 flex flex-col gap-2.5 shadow-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#ffb703]">
              <span className="material-symbols-outlined text-[16px]">rule</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffdba0] font-bold">
                {envInfo.name.toUpperCase()} ARIZA KURALI
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">
              KAPTAN KILAVUZU
            </span>
          </div>

          <div className="text-xs text-[#e6dff9] font-medium leading-relaxed bg-[#201d30] p-2.5 rounded-xl border border-white/5">
            {envInfo.conditionNote}
          </div>

          {/* Reference Criteria */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#ffdba0] text-[16px] mb-0.5">thermostat</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Sıcaklık Eşiği</span>
              <span className="font-sora text-xs text-[#ffdba0] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≤ -10°C' : '≥ 80°C'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px] mb-0.5">speed</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Basınç Eşiği</span>
              <span className="font-sora text-xs text-[#00eefc] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≥ 70 kPa' : '≤ 40 kPa'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#dab5ff] text-[16px] mb-0.5">airwave</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Parazit Eşiği</span>
              <span className="font-sora text-xs text-[#dab5ff] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≥ 60 dB' : '≥ 65 dB'}
              </span>
            </div>
          </div>

          {/* Verbal Instruction for Engineer Valve Angle */}
          <div className="bg-[#26223a] p-2.5 rounded-xl border border-[#ffb703]/20 flex items-start gap-2">
            <span className="material-symbols-outlined text-[#ffb703] text-[18px] mt-0.5 shrink-0">chat</span>
            <div className="flex flex-col gap-0.5 text-[11px] leading-snug">
              <span className="font-bold text-[#ffdba0]">Mühendise İletilecek Tahliye Kuralı:</span>
              <span className="text-[#d5c4ac]">
                Doğru kesici açıldıktan sonra Soğutma Valfi <strong className="text-[#00eefc]">{diagnostic.targetValveAngle}°</strong> konumuna getirilmeli ve <strong className="text-[#ffb703]">Basınç Tahliyesi AKTİF</strong> edilmelidir. Mühendise bu parametreleri sözlü aktarın.
              </span>
            </div>
          </div>
        </div>

        {/* Partner Communication Banner */}
        <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#2b273b] flex items-center justify-between shadow-md border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00eefc]/20 flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[18px]">engineering</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#d5c4ac]">Mühendis İletişimi</span>
              <span className="font-mono text-xs font-bold text-white">
                {diagnostic.engineerActionTaken ? (
                  <span className="text-emerald-400">
                    Fiziksel Tahliye Uygulandı ({diagnostic.engineerSuggestedLine?.toUpperCase() || ''})
                  </span>
                ) : diagnostic.engineerSuggestedLine ? (
                  <span className="text-[#ffb703]">
                    {diagnostic.engineerSuggestedLine.toUpperCase()} devresini bildirdi
                  </span>
                ) : (
                  <span className="text-[#00eefc]">Ölçüm alıyor / İletişim bekleniyor</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#d5c4ac]">
            <span className={`w-2 h-2 rounded-full ${diagnostic.engineerActionTaken ? 'bg-emerald-400' : 'bg-[#00eefc] animate-ping'}`}></span>
          </div>
        </div>

        {/* Breaker Selection Console (K1 - K4) */}
        <div className="w-full rounded-2xl bg-[#0f0c1e] p-3.5 flex flex-col gap-2.5 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase text-[#d5c4ac] tracking-wider font-bold">KESİCİ SEÇİMİ</span>
              <span className="text-[10px] text-zinc-400 font-mono">({selectedBreaker ? `${selectedBreaker} Seçili` : 'Seçim Yapılmadı'})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-emerald-400' : selectedBreaker ? 'bg-[#ffb703]' : 'bg-zinc-500'}`}></span>
              <span className="font-mono text-[9px] text-[#ffb703] font-bold uppercase">
                {isUnlocked ? 'KİLİT AÇIK' : 'GÜVENLİK KİLİDİ'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['K1', 'K2', 'K3', 'K4'] as const).map((id) => {
              const isSelected = selectedBreaker === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectBreaker(id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#ffb703]/25 border-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.4)] scale-102' 
                      : 'bg-[#201d30] border-white/5 text-[#d5c4ac] hover:bg-[#2b273b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#ffb703]">
                    {isSelected ? 'toggle_on' : 'toggle_off'}
                  </span>
                  <span className={`font-mono text-xs font-bold mt-1 uppercase ${isSelected ? 'text-[#ffb703]' : 'text-white'}`}>
                    {id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert if any */}
        {(state.feedbackMessage || feedback.msg) && (
          <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
            (state.feedbackState === 'success' || (!state.feedbackState && feedback.type === 'success'))
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {state.feedbackMessage || feedback.msg}
          </div>
        )}

        {/* Primary Action Button */}
        {!diagnostic.isSolved ? (
          <div className="w-full flex flex-col items-center gap-1.5 pt-1">
            <button
              onClick={handleUnlockAction}
              disabled={!selectedBreaker}
              className={`w-full h-14 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                !selectedBreaker
                  ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#6b4b00] cursor-pointer'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {!selectedBreaker ? 'lock' : isUnlocked ? 'lock_open' : 'key'}
              </span>
              <span>
                {!selectedBreaker 
                  ? 'KESİCİ SEÇİMİ BEKLENİYOR' 
                  : isUnlocked 
                  ? `${selectedBreaker} Açıldı (Mühendis Bekleniyor)` 
                  : `${selectedBreaker} Güvenlik Kilidini Aç`}
              </span>
            </button>
            <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span className="text-[11px] font-mono">
                {!selectedBreaker 
                  ? 'Müdahale için şüpheli devreye bağlı K1–K4 kesicisini seçin' 
                  : 'Yanlış kesici seçimi gövde bütünlüğünü düşürür'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}

      </div>
    </div>
  );
};
