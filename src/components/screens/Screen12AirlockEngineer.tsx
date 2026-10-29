import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen12AirlockEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { isSolved } = state.airlock;

  // Rotary Dial States: %50 Dengede (0deg), %75 Basınçlı (90deg), %100 Tahliye (180deg), %25 Düşük (270deg)
  const dialLevels = [
    { deg: 0, text: '%50 DENGEDE', val: 50 },
    { deg: 90, text: '%75 BASINÇLI', val: 75 },
    { deg: 180, text: '%100 TAHLİYE', val: 100 },
    { deg: 270, text: '%25 DÜŞÜK', val: 25 },
  ];
  const [dialIndex, setDialIndex] = useState(0);

  // Mechanical Seal Lever (isLocked = true: at top, false: at bottom)
  const [isSealLocked, setIsSealLocked] = useState(true);

  // Vacuum Pump Power (0 - 100)
  const [vacuumPower, setVacuumPower] = useState(45);

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isSolved ? 'success' : 'idle',
    msg: isSolved ? 'Hava kilidi valf ve mandalları başarıyla devreye sokuldu!' : '',
  });

  const handleRotateDial = () => {
    if (isSolved) return;
    setDialIndex((prev) => (prev + 1) % dialLevels.length);
  };

  const handleToggleLever = () => {
    if (isSolved) return;
    setIsSealLocked((prev) => !prev);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSolved) return;
    setVacuumPower(Number(e.target.value));
  };

  // Pressure formula based on vacuum power:
  const calculatedPressure = (1.5 + (vacuumPower / 100) * 1.8).toFixed(2);

  const handleEngageAirlock = () => {
    // Correct setup:
    // 1. Dial is at %50 (index 0)
    // 2. Seal lever is engaged (locked = true)
    // 3. Vacuum power is between 40 and 50 (yielding 2.22 - 2.40 Bar)
    const isDialOk = dialIndex === 0;
    const isLeverOk = isSealLocked === true;
    const isVacuumOk = vacuumPower >= 40 && vacuumPower <= 50;

    if (isDialOk && isLeverOk && isVacuumOk) {
      setFeedback({
        type: 'success',
        msg: 'VALF VE KİLİT SENKRONİZE EDİLDİ! Dış kapak güvenle çözüldü, dekompresyon sağlandı.',
      });
      onUpdate((prev) => ({
        ...prev,
        airlock: {
          ...prev.airlock,
          isSolved: true,
        },
      }));
    } else {
      let reason = 'BASINÇ HATASI! ';
      if (!isDialOk) reason += 'Birincil valfi %50 Dengede konumuna getirin. ';
      if (!isLeverOk) reason += 'Sızdırmazlık mandalını kilitleyin. ';
      if (!isVacuumOk) reason += 'Vakum pompasını 45 nominal seviyesine ayarlayın.';

      setFeedback({
        type: 'error',
        msg: `${reason} Kabin bütünlüğü -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const currentDial = dialLevels[dialIndex];

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe select-none animate-fadeIn text-[#e6dff9]">
      {/* Live Tactical Mission Bar */}
      <div className="px-margin pt-space-sm pb-space-xs flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
            <span className="font-label-telemetry text-label-telemetry text-secondary uppercase tracking-widest">PARTYVERSE // CANLI</span>
          </span>
          <span className="font-label-status text-label-status text-on-surface-variant font-bold">KAYIP SİNYAL CONSOLE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-primary text-[14px]">timer</span>
            <span className="font-label-telemetry text-label-telemetry text-primary font-bold">
              {Math.floor(state.timeLeftSeconds / 60).toString().padStart(2, '0')}:
              {(state.timeLeftSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high shadow-sm">
            <span className="font-label-status text-label-status text-on-surface-variant">BÜTÜNLÜK</span>
            <span className="font-label-telemetry text-label-telemetry text-primary-fixed-dim font-bold">%{state.hullIntegrity}</span>
          </div>
        </div>
      </div>

      {/* Role Badge & Directives */}
      <div className="px-margin pt-space-xs pb-space-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest shadow-sm mb-space-xs">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
          <span className="font-label-telemetry text-label-telemetry text-primary uppercase font-bold">MÜHENDİS // MEKANİK VALF VE KİLİT</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase tracking-tight font-extrabold">Hava kilidini dengele</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Kaptanından gelen adımlara göre fiziksel valfleri çevir ve mandalları kilitle.</p>
      </div>

      {/* Main Telemetry Controls Stack */}
      <div className="px-margin flex flex-col gap-space-md">
        {/* Digital Pressure Barometer Gauge */}
        <div className="p-space-md rounded-xl bg-surface-container-high shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">speed</span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase font-bold">ODA BASINCI (BAROMETRE)</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-lowest">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>
              <span className="font-label-status text-label-status text-secondary font-bold">STABİL SEVİYE</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display-hero-mobile text-display-hero-mobile text-primary tracking-tight font-extrabold" id="pressureValue">
                  {calculatedPressure}
                </span>
                <span className="font-label-telemetry text-label-telemetry text-on-surface-variant font-bold">BAR</span>
              </div>
              <span className="font-label-status text-label-status text-secondary-fixed font-semibold">ATMOSFERİK SİNYAL: %94 DİRENÇ</span>
            </div>
            {/* Inline Barometer Wave Sensor Visual */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-end gap-1 h-8">
                <span className="w-1.5 h-3 rounded-full bg-secondary-fixed-dim/40"></span>
                <span className="w-1.5 h-5 rounded-full bg-secondary-fixed-dim/60"></span>
                <span className="w-1.5 h-7 rounded-full bg-secondary-fixed-dim"></span>
                <span className="w-1.5 h-6 rounded-full bg-secondary-fixed-dim"></span>
                <span className="w-1.5 h-4 rounded-full bg-secondary-fixed-dim/70"></span>
                <span className="w-1.5 h-2 rounded-full bg-secondary-fixed-dim/30"></span>
              </div>
              <span className="font-label-status text-label-status text-on-surface-variant font-medium">DEKOMPRESYON AKTİF</span>
            </div>
          </div>
          {/* Segmented Pressure Gradient Ribbon */}
          <div className="grid grid-cols-12 gap-1 mt-space-sm">
            <div className="h-1.5 rounded-full bg-secondary-fixed-dim"></div>
            <div className="h-1.5 rounded-full bg-secondary-fixed-dim"></div>
            <div className="h-1.5 rounded-full bg-secondary-fixed-dim"></div>
            <div className="h-1.5 rounded-full bg-secondary-fixed-dim"></div>
            <div className="h-1.5 rounded-full bg-secondary-fixed-dim"></div>
            <div className="h-1.5 rounded-full bg-primary-container"></div>
            <div className="h-1.5 rounded-full bg-primary-container"></div>
            <div className="h-1.5 rounded-full bg-primary-container"></div>
            <div className="h-1.5 rounded-full bg-surface-container-highest"></div>
            <div className="h-1.5 rounded-full bg-surface-container-highest"></div>
            <div className="h-1.5 rounded-full bg-surface-container-highest"></div>
            <div className="h-1.5 rounded-full bg-surface-container-highest"></div>
          </div>
        </div>

        {/* Dual Heavy Mechanical Tactile Panel (Dial & Lever) */}
        <div className="grid grid-cols-2 gap-space-sm">
          {/* LEFT: Circular Rotary Valve Dial */}
          <div 
            onClick={handleRotateDial}
            className="p-space-md rounded-xl bg-surface-container-high shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden cursor-pointer hover:bg-surface-container-highest transition-colors"
          >
            <div className="w-full flex items-center justify-between mb-space-xs">
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase font-bold">BİRİNCİL VALF</span>
              <span className="material-symbols-outlined text-secondary text-[16px]">sync</span>
            </div>
            {/* 2.5D Radial Dial Module */}
            <div className="relative w-28 h-28 my-space-xs flex items-center justify-center select-none" id="rotaryDialContainer">
              {/* Outer Ticks Track SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle className="text-surface-container-lowest" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-secondary-fixed-dim" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeDasharray="131 264" strokeWidth="4"></circle>
              </svg>
              {/* Tactile Rotary Core Knob */}
              <div 
                className="w-20 h-20 rounded-full bg-surface-container-lowest shadow-2xl flex items-center justify-center relative transition-transform duration-300"
                style={{ transform: `rotate(${currentDial.deg}deg)` }}
              >
                {/* Center Screw Cap */}
                <div className="w-10 h-10 rounded-full bg-surface-container-highest shadow-inner flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary-fixed text-[18px]">radio_button_checked</span>
                </div>
                {/* Indicator Needle Pointer */}
                <div className="absolute top-1 w-1.5 h-4 rounded-full bg-secondary-container shadow-md"></div>
              </div>
            </div>
            <div className="w-full bg-surface-container-lowest py-1 px-2 rounded-lg flex items-center justify-between">
              <span className="font-label-status text-label-status text-on-surface-variant">KONUM</span>
              <span className="font-label-telemetry text-label-telemetry text-secondary-fixed font-bold">
                {currentDial.text}
              </span>
            </div>
          </div>

          {/* RIGHT: Mechanical Seal Lock Lever */}
          <div 
            onClick={handleToggleLever}
            className="p-space-md rounded-xl bg-surface-container-high shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden cursor-pointer hover:bg-surface-container-highest transition-colors"
          >
            <div className="w-full flex items-center justify-between mb-space-xs">
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase font-bold">SIZDIRMAZLIK</span>
              <span className={`material-symbols-outlined text-[16px] ${isSealLocked ? 'text-primary-container' : 'text-secondary-fixed-dim'}`}>
                {isSealLocked ? 'lock' : 'lock_open'}
              </span>
            </div>
            {/* Heavy Physical Lever Switch Track */}
            <div className="relative w-14 h-28 my-space-xs bg-surface-container-lowest rounded-full p-1.5 flex flex-col justify-between items-center shadow-inner">
              <span className="font-label-status text-label-status text-primary-container font-extrabold uppercase">KİLİT</span>
              <div 
                className={`w-11 h-11 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 ${
                  isSealLocked ? 'bg-primary-container' : 'bg-secondary-fixed-dim translate-y-14'
                }`}
              >
                <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                  {isSealLocked ? 'shield_lock' : 'lock_open'}
                </span>
              </div>
              <span className="font-label-status text-label-status text-on-surface-variant uppercase font-medium">AÇIK</span>
            </div>
            <div className="w-full bg-surface-container-lowest py-1 px-2 rounded-lg flex items-center justify-between">
              <span className="font-label-status text-label-status text-on-surface-variant">DURUM</span>
              <span className={`font-label-telemetry text-label-telemetry font-bold ${
                isSealLocked ? 'text-primary-container' : 'text-secondary-fixed-dim'
              }`}>
                {isSealLocked ? 'KİLİTLİ' : 'DEVRE DIŞI'}
              </span>
            </div>
          </div>
        </div>

        {/* Vacuum Pump Linear Power Console Slider */}
        <div className="p-space-md rounded-xl bg-surface-container-high shadow-xl">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">air</span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase font-bold">VAKUM POMPASI GÜCÜ</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">%{vacuumPower}</span>
              <span className="font-label-status text-label-status text-on-surface-variant">/ 100</span>
            </div>
          </div>
          {/* Tactile Slider Shell Track */}
          <div className="relative py-2">
            <input 
              className="w-full h-3 bg-surface-container-lowest rounded-full appearance-none cursor-pointer accent-amber-400 focus:outline-none" 
              max="100" 
              min="0" 
              type="range" 
              value={vacuumPower}
              onChange={handleSliderChange}
            />
            <div className="flex justify-between items-center px-1 mt-1.5">
              <span className="font-label-status text-label-status text-on-surface-variant">0 BARREL (BOŞTA)</span>
              <span className="font-label-status text-label-status text-primary font-bold">45 NOMİNAL</span>
              <span className="font-label-status text-label-status text-on-surface-variant">100 TAM TAHLİYE</span>
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback.msg && (
          <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed animate-fadeIn ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Interactive Tactical Co-op Mission Push Button */}
        <div className="pt-space-xs">
          {!isSolved ? (
            <button 
              type="button" 
              onClick={handleEngageAirlock}
              className="w-full py-4 px-space-md rounded-xl bg-secondary-container text-on-secondary-container shadow-2xl flex items-center justify-center gap-2 uppercase transition-all duration-150 active:translate-y-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>power_settings_new</span>
              <span className="font-headline-sm text-headline-sm font-extrabold tracking-wider">VALF VE KİLİDİ DEVREYE SOK</span>
            </button>
          ) : (
            <button 
              type="button" 
              onClick={onAdvancePhase}
              className="w-full py-4 px-space-md rounded-xl bg-gradient-to-r from-primary-container to-surface-tint text-on-primary-container shadow-2xl flex items-center justify-center gap-2 uppercase transition-all duration-150 active:translate-y-1 cursor-pointer animate-pulse font-headline-sm text-headline-sm font-extrabold tracking-wider"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              <span>GÖREV TAMAMLANDI • DEVAM ET</span>
            </button>
          )}
        </div>

        {/* Co-op Radio Protocol Status Hint */}
        <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-2.5 mb-space-sm shadow-sm">
          <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">headset_mic</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            Kaptan protokolü onayladıktan sonra dış kapağı güvenle açabilirsin. Bekleme frekansı: <span className="text-secondary-fixed font-bold">KANAL 4</span>.
          </p>
        </div>

        {/* Crew Station Quick Telemetry Row */}
        <div className="grid grid-cols-3 gap-2 pb-space-sm">
          <div className="p-2 rounded-lg bg-surface-container text-center flex flex-col items-center">
            <span className="font-label-status text-label-status text-on-surface-variant">O2 SEVİYESİ</span>
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed mt-0.5 font-bold">%98.4</span>
          </div>
          <div className="p-2 rounded-lg bg-surface-container text-center flex flex-col items-center">
            <span className="font-label-status text-label-status text-on-surface-variant">KAPAK KİLİT #2</span>
            <span className="font-label-telemetry text-label-telemetry text-primary-container mt-0.5 font-bold">KORUMALI</span>
          </div>
          <div className="p-2 rounded-lg bg-surface-container text-center flex flex-col items-center">
            <span className="font-label-status text-label-status text-on-surface-variant">MANUEL BYPASS</span>
            <span className="font-label-telemetry text-label-telemetry text-on-surface mt-0.5 font-bold">HAZIR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
