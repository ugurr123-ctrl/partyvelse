import React, { useState, useRef } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen14RadarEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { isSolved } = state.radar;

  const [azimuthAngle, setAzimuthAngle] = useState(275);
  const [elevationAngle, setElevationAngle] = useState(42);
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isSolved ? 'success' : 'idle',
    msg: isSolved ? 'Anten hizası kilitlendi! Hedef şamandıra sinyali tam güçte yakalandı.' : '',
  });

  const turntableRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSolved) return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || isSolved) return;
    updateAngle(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const updateAngle = (clientX: number, clientY: number) => {
    if (!turntableRef.current) return;
    const rect = turntableRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    let deg = Math.round(rad * (180 / Math.PI)) + 90;
    if (deg < 0) deg += 360;
    setAzimuthAngle(deg);
  };

  const handleAdjustElevation = (delta: number) => {
    if (isSolved) return;
    setElevationAngle(prev => Math.max(0, Math.min(90, prev + delta)));
  };

  const handleLockAntenna = () => {
    // Target is azimuth ~275 (270-280) and elevation 42 (40-44)
    const isAzimuthOk = Math.abs(azimuthAngle - 275) <= 5;
    const isElevationOk = Math.abs(elevationAngle - 42) <= 2;

    if (isAzimuthOk && isElevationOk) {
      setFeedback({
        type: 'success',
        msg: 'KİLİT SAĞLANDI! Kurtarma koordinatları sisteme başarıyla aktarıldı.',
      });
      onUpdate(prev => ({
        ...prev,
        radar: {
          ...prev.radar,
          isScanned: true,
          isSolved: true,
        },
      }));
    } else {
      let err = 'HİZALAMA SAPMASI! ';
      if (!isAzimuthOk) err += `Azimut açısı ${azimuthAngle}° (Hedef: 275°). `;
      if (!isElevationOk) err += `Elevasyon +${elevationAngle}° (Hedef: +42°).`;
      setFeedback({
        type: 'error',
        msg: `${err} Sinyal kaybı: Gövde Bütünlüğü -%10, Süre -15 sn!`,
      });
      onUpdate(prev => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const isLocked = Math.abs(azimuthAngle - 275) <= 5 && Math.abs(elevationAngle - 42) <= 2;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* HUD Sub-Banner & Status Matrix */}
      <div className="flex flex-col gap-space-xs mt-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs bg-surface-container-high px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></span>
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed uppercase font-bold">Partyverse // Canlı</span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-primary text-[14px]">timer</span>
            <span className="font-label-telemetry text-label-telemetry text-primary tracking-widest font-bold">
              {Math.floor(state.timeLeftSeconds / 60).toString().padStart(2, '0')}:
              {(state.timeLeftSeconds % 60).toString().padStart(2, '0')}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline"></span>
            <span className="font-label-telemetry text-label-telemetry text-secondary font-bold">BÜTÜNLÜK %{state.hullIntegrity}</span>
          </div>
        </div>

        {/* Role Telemetry Pill */}
        <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">build</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-status text-label-status text-primary tracking-widest font-bold">MÜHENDİS // ANTEN KADRANI</span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant font-medium">SİSTEM KONSOLU V3.9</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-highest">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[13px]">cell_tower</span>
            <span className="font-label-status text-label-status text-secondary-fixed-dim font-bold">RESONANS AKTİF</span>
          </div>
        </div>
      </div>

      {/* Hero Briefing Card */}
      <div className="flex flex-col gap-1 bg-surface-container p-space-md rounded-xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-secondary-container/5 blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-2 text-primary font-label-telemetry text-label-telemetry font-bold">
          <span className="material-symbols-outlined text-[16px]">radar</span>
          <span>HEDEF VEKTÖR TALİMATI</span>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold">Radarı hedefe kilitle</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Kaptanından gelen azimut <span className="text-secondary font-bold">(275°)</span> ve yükseliş <span className="text-primary font-bold">(+42°)</span> değerlerine göre çanağı çevir.
        </p>
      </div>

      {/* Interactive Dual-Axis Radar Core (Bento Hub) */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xl flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label-status text-label-status text-on-surface-variant uppercase tracking-widest font-bold">Holografik Telemetri Ayarı</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-label-telemetry px-2 py-0.5 rounded bg-secondary-container/10 text-secondary-fixed font-bold">AZİMUT: 275°</span>
            <span className="text-[10px] font-label-telemetry px-2 py-0.5 rounded bg-primary-container/10 text-primary font-bold">ELEVASYON: +42°</span>
          </div>
        </div>

        {/* Dual Control Array: Left 360 Azimuth Dial, Right Vertical Elevation Gauge */}
        <div className="flex items-center justify-between gap-space-sm">
          {/* Rotary Azimuth Dial Container */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div 
              ref={turntableRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative w-52 h-52 flex items-center justify-center rounded-full bg-surface-container-low shadow-[0_8px_24px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing select-none" 
              id="radar-turntable"
            >
              {/* Outer Compass Markings (SVG Rings) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200">
                <circle cx="100" cy="100" fill="none" r="94" stroke="#2b273b" strokeDasharray="2 6" strokeWidth="1.5"></circle>
                <circle cx="100" cy="100" fill="none" r="88" stroke="#363246" strokeWidth="1"></circle>
                <circle cx="100" cy="100" fill="none" r="68" stroke="#201d30" strokeWidth="8"></circle>
                {/* Degree Ticks */}
                <line stroke="#ffdba0" strokeWidth="2" x1="100" x2="100" y1="6" y2="14"></line>
                <line stroke="#9e8f78" strokeWidth="1.5" x1="194" x2="186" y1="100" y2="100"></line>
                <line stroke="#9e8f78" strokeWidth="1.5" x1="100" x2="100" y1="194" y2="186"></line>
                <line stroke="#00eefc" strokeWidth="2" x1="6" x2="14" y1="100" y2="100"></line>
                {/* Compass labels */}
                <text fill="#ffdba0" fontFamily="Sora" fontSize="8" fontWeight="700" textAnchor="middle" x="100" y="24">K (0°)</text>
                <text fill="#9e8f78" fontFamily="Sora" fontSize="7" textAnchor="middle" x="180" y="103">90°</text>
                <text fill="#9e8f78" fontFamily="Sora" fontSize="7" textAnchor="middle" x="100" y="182">180°</text>
                <text fill="#00eefc" fontFamily="Sora" fontSize="7" fontWeight="700" textAnchor="middle" x="24" y="103">270°</text>
                {/* Locked Beacon Target Sector (Green/Cyan Arc around 275°) */}
                <path d="M 98 12 A 88 88 0 0 0 16 95" fill="none" opacity="0.4" stroke="#00eefc" strokeLinecap="round" strokeWidth="3"></path>
              </svg>
              {/* Middle Beveled Track */}
              <div className="w-36 h-36 rounded-full bg-surface-container flex items-center justify-center shadow-inner relative">
                {/* Target Radar Sweeper Line (Rotates to current azimuth) */}
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-75" 
                  style={{ transform: `rotate(${azimuthAngle}deg)` }}
                >
                  <div className="absolute top-2 flex flex-col items-center">
                    <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim shadow-[0_0_10px_#00eefc] animate-pulse"></span>
                    <div className="w-0.5 h-14 bg-gradient-to-b from-secondary-container to-transparent"></div>
                  </div>
                </div>
                {/* Central Metallic Core Knob */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-surface-bright via-surface-container-high to-surface-container-lowest flex flex-col items-center justify-center shadow-[0_6px_12px_rgba(0,0,0,0.7)] text-center z-10">
                  <span className="material-symbols-outlined text-secondary-fixed-dim text-[20px]">explore</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none mt-0.5">
                    {azimuthAngle}°
                  </span>
                  <span className="font-label-status text-label-status text-primary uppercase font-bold">AZİMUT</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`material-symbols-outlined text-[13px] ${isLocked ? 'text-secondary-fixed' : 'text-outline'}`}>
                {isLocked ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`font-label-status text-label-status tracking-wider font-bold ${
                isLocked ? 'text-secondary-fixed' : 'text-outline'
              }`}>
                {isLocked ? 'HEDEFLE KİLİTLİ' : 'HİZALANIYOR (DOKUN & ÇEVİR)'}
              </span>
            </div>
          </div>

          {/* Right Vertical Elevation Control Slider Node */}
          <div className="flex flex-col items-center justify-between bg-surface-container-low px-3 py-3 rounded-xl w-24 h-56 shadow-inner">
            <div className="flex flex-col items-center text-center">
              <span className="font-label-status text-label-status text-primary font-bold">ELEVASYON</span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface text-[12px] font-bold">+{elevationAngle}°</span>
            </div>
            {/* Vertical Gauge Graphic */}
            <div className="relative w-8 h-32 bg-surface-container-highest rounded-full overflow-hidden flex flex-col justify-end p-0.5">
              <div 
                className="w-full bg-gradient-to-t from-primary-container to-secondary-fixed-dim rounded-full relative transition-all duration-150"
                style={{ height: `${Math.min(100, (elevationAngle / 60) * 100)}%` }}
              >
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-on-primary rounded-full animate-ping"></span>
              </div>
              {/* Gauge Tick Overlays */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none">
                <div className="w-2 h-0.5 bg-on-surface-variant/40"></div>
                <div className="w-3 h-0.5 bg-on-surface-variant/70 self-end"></div>
                <div className="w-2 h-0.5 bg-on-surface-variant/40"></div>
                <div className="w-3 h-0.5 bg-primary self-end"></div>
                <div className="w-2 h-0.5 bg-on-surface-variant/40"></div>
                <div className="w-3 h-0.5 bg-on-surface-variant/70 self-end"></div>
                <div className="w-2 h-0.5 bg-on-surface-variant/40"></div>
              </div>
            </div>
            {/* Micro Step Regulators */}
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => handleAdjustElevation(-1)}
                aria-label="Açıyı Azalt" 
                className="w-7 h-6 rounded bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface text-[11px] font-bold active:scale-95 transition-transform cursor-pointer"
              >
                -1°
              </button>
              <button 
                type="button"
                onClick={() => handleAdjustElevation(1)}
                aria-label="Açıyı Arttır" 
                className="w-7 h-6 rounded bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface text-[11px] font-bold active:scale-95 transition-transform cursor-pointer"
              >
                +1°
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Capture Telemetry & Waveform Bento Box */}
      <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">wifi_tethering</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">SİNYAL YAKALAMA GÜCÜ</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
            <span className="font-label-status text-label-status text-secondary-fixed-dim font-bold">
              {isLocked ? '%98 - KİLİT SAĞLANDI' : '%64 - ZAYIF SİNYAL'}
            </span>
          </div>
        </div>
        {/* Segmented Signal Gauge Indicator */}
        <div className="w-full flex items-center gap-1 py-1">
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className="h-2 flex-1 rounded bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
          <div className={`h-2 flex-1 rounded ${isLocked ? 'bg-secondary-container shadow-[0_0_8px_#00eefc]' : 'bg-surface-container-highest'}`}></div>
          <div className={`h-2 flex-1 rounded ${isLocked ? 'bg-secondary-container shadow-[0_0_8px_#00eefc]' : 'bg-surface-container-highest'}`}></div>
        </div>
        {/* Carrier Wave Visualizer */}
        <div className="w-full h-14 bg-surface-container-lowest rounded-lg p-2 flex items-center relative overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 40">
            <path d="M0,20 Q15,5 30,20 T60,20 T90,20 T120,5 T150,35 T180,20 T210,20 T240,5 T270,35 T300,20" fill="none" stroke="#2b273b" strokeWidth="1.5"></path>
            <path className="opacity-90" d="M0,20 Q12,2 25,20 T50,20 T75,2 T100,38 T125,2 T150,38 T175,20 T200,38 T225,2 T250,38 T275,20 T300,20" fill="none" stroke="#00eefc" strokeLinecap="round" strokeWidth="2">
              <animate attributeName="d" dur="3s" repeatCount="indefinite" values="
                M0,20 Q12,2 25,20 T50,20 T75,2 T100,38 T125,2 T150,38 T175,20 T200,38 T225,2 T250,38 T275,20 T300,20;
                M0,20 Q12,38 25,20 T50,20 T75,38 T100,2 T125,38 T150,2 T175,20 T200,2 T225,38 T250,2 T275,20 T300,20;
                M0,20 Q12,2 25,20 T50,20 T75,2 T100,38 T125,2 T150,38 T175,20 T200,38 T225,2 T250,38 T275,20 T300,20
              "></animate>
            </path>
          </svg>
          <div className="absolute right-2 bottom-1 flex items-center gap-1 bg-surface-container-high/90 px-1.5 py-0.5 rounded">
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed text-[9px] font-bold">433.92 MHz</span>
          </div>
        </div>
        {/* Tactile Audio Feedback Indicator */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[16px] animate-bounce">graphic_eq</span>
            <span className="font-label-status text-label-status text-on-surface-variant font-medium">Ses Geri Bildirimi:</span>
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed font-bold">
              {isLocked ? 'Bip-Bip-Bip (Kilitli)' : 'Cızırtılı Taşıyıcı'}
            </span>
          </div>
          <span className="font-label-status text-label-status text-outline uppercase tracking-wider font-semibold">GECİKME 14ms</span>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback.msg && (
        <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Heavy Push Arcade Action Lock Trigger */}
      <div className="flex flex-col gap-2 mt-space-xs">
        {!isSolved ? (
          <button 
            type="button" 
            onClick={handleLockAntenna}
            className="w-full relative group transition-all duration-75 active:translate-y-1 cursor-pointer" 
            id="lock-btn"
          >
            <div className="w-full bg-[#00686f] rounded-xl h-14 flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 bottom-1 rounded-xl bg-gradient-to-r from-secondary-container via-secondary-fixed to-secondary-container flex items-center justify-center gap-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] group-active:bottom-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[24px]">lock</span>
                <span className="font-headline-sm text-headline-sm text-on-secondary-container font-extrabold uppercase tracking-wide">
                  Anten Hizasını Kilitle
                </span>
              </div>
            </div>
          </button>
        ) : (
          <button 
            type="button" 
            onClick={onAdvancePhase}
            className="w-full relative group transition-all duration-75 active:translate-y-1 cursor-pointer animate-pulse"
          >
            <div className="w-full bg-[#996500] rounded-xl h-14 flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 bottom-1 rounded-xl bg-gradient-to-r from-primary-container to-surface-tint flex items-center justify-center gap-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] group-active:bottom-0">
                <span className="material-symbols-outlined text-on-primary-container text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                <span className="font-headline-sm text-headline-sm text-on-primary-container font-extrabold uppercase tracking-wide">
                  GÖREV TAMAMLANDI // DEVAM ET
                </span>
              </div>
            </div>
          </button>
        )}

        {/* Bottom Status Log Telemetry */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-surface-container-lowest text-center">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>
          <span className="font-body-sm text-body-sm text-secondary font-medium">
            {isSolved ? 'Kilit sağlandı. Kurtarma koordinatları sisteme aktarıldı.' : 'Çanağı çevirerek azimut ve elevasyon açısını ayarlayın.'}
          </span>
        </div>
      </div>
    </div>
  );
};
