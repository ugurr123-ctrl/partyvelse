import React, { useState, useRef } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen14RadarEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { radar } = state;
  const { isSolved } = radar;

  // Starts from engineer initial settings (which are intentionally NOT the target!)
  const [azimuthAngle, setAzimuthAngle] = useState(radar.engineerAzimuth ?? 45);
  const [elevationAngle, setElevationAngle] = useState(radar.engineerElevation ?? 15);
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
    onAction?.('radar_set_coordinates', { azimuth: deg, elevation: elevationAngle });
  };

  const handleAdjustElevation = (delta: number) => {
    if (isSolved) return;
    const nextElev = Math.max(0, Math.min(90, elevationAngle + delta));
    setElevationAngle(nextElev);
    onAction?.('radar_set_coordinates', { azimuth: azimuthAngle, elevation: nextElev });
  };

  const handleLockAntenna = () => {
    if (isSolved) return;

    if (onAction) {
      onAction('radar_scan', { azimuth: azimuthAngle, elevation: elevationAngle });
      return;
    }

    // Local fallback
    const isAzimuthOk = Math.abs(azimuthAngle - radar.targetAzimuth) <= 5;
    const isElevationOk = Math.abs(elevationAngle - radar.targetElevation) <= 5;

    if (isAzimuthOk && isElevationOk) {
      setFeedback({
        type: 'success',
        msg: `KİLİT SAĞLANDI! Azimut ${azimuthAngle}° ve Elevasyon +${elevationAngle}° ile hedef yakalandı!`,
      });
      onUpdate(prev => ({
        ...prev,
        radar: {
          ...prev.radar,
          engineerAzimuth: azimuthAngle,
          engineerElevation: elevationAngle,
          isScanned: true,
          isSolved: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `HİZALAMA SAPMASI! Sinyal kaybı: Gövde Bütünlüğü -%10, Süre -15 sn!`,
      });
      onUpdate(prev => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const activeFeedback = state.feedbackMessage
    ? {
        type: (state.feedbackState === 'success' ? 'success' : state.feedbackState === 'error' ? 'error' : 'idle') as 'idle' | 'success' | 'error',
        msg: state.feedbackMessage,
      }
    : feedback;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30">
          <span className="material-symbols-outlined text-[15px]">radar</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS // ÇANAK VE ELEVASYON</span>
        </div>
        <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">Anteni yönlendir</h2>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Kaptanından aldığın azimut ve elevasyon açılarına göre döner çanağı ve dikey eğimi ayarla.
        </p>
      </div>

      {/* Main Console Box */}
      <div className="mt-2 bg-[#0f0c1e] p-3.5 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-xl">
        
        {/* Readouts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">MEVCUT AZİMUT</span>
            <span className="font-sora text-2xl font-black text-[#00eefc] mt-1">
              {azimuthAngle}°
            </span>
            <span className="text-[10px] text-[#d5c4ac]">360° Döner Tabla</span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">MEVCUT ELEVASYON</span>
            <span className="font-sora text-2xl font-black text-[#ffb703] mt-1">
              +{elevationAngle}°
            </span>
            <span className="text-[10px] text-[#d5c4ac]">Dikey Açı</span>
          </div>
        </div>

        {/* 360° Turntable Interactive Dial */}
        <div className="flex flex-col items-center justify-center my-2">
          <div 
            ref={turntableRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-48 h-48 rounded-full bg-[#1c192c] border-4 border-[#2b273b] shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          >
            {/* Degree Marks */}
            <div className="absolute top-1 text-[9px] font-mono text-[#d5c4ac]">0° K</div>
            <div className="absolute right-1 text-[9px] font-mono text-[#d5c4ac]">90° D</div>
            <div className="absolute bottom-1 text-[9px] font-mono text-[#d5c4ac]">180° G</div>
            <div className="absolute left-1 text-[9px] font-mono text-[#d5c4ac]">270° B</div>

            {/* Pointer Needle */}
            <div 
              className="absolute w-2 h-20 rounded-full bg-gradient-to-t from-[#ffb703] to-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.8)] transition-transform pointer-events-none"
              style={{
                top: '14px',
                transformOrigin: '50% 82px',
                transform: `rotate(${azimuthAngle}deg)`,
              }}
            ></div>

            {/* Center Cap */}
            <div className="w-16 h-16 rounded-full bg-[#0f0c1e] border border-white/10 flex items-center justify-center shadow-inner pointer-events-none">
              <span className="material-symbols-outlined text-[#00eefc] text-[20px]">sync</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#d5c4ac] mt-2">Döndürmek için çanağı sürükleyin</span>
        </div>

        {/* Elevation Buttons */}
        <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-white font-bold">Elevasyon Ayarı</span>
            <span className="text-[10px] text-[#d5c4ac]">Dikey Eğim: +{elevationAngle}°</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjustElevation(-5)}
              className="w-10 h-10 rounded-xl bg-[#2b273b] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold"
            >
              -5°
            </button>
            <button
              type="button"
              onClick={() => handleAdjustElevation(-1)}
              className="w-10 h-10 rounded-xl bg-[#2b273b] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold"
            >
              -1°
            </button>
            <button
              type="button"
              onClick={() => handleAdjustElevation(1)}
              className="w-10 h-10 rounded-xl bg-[#00eefc]/20 text-[#00eefc] border border-[#00eefc]/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold"
            >
              +1°
            </button>
            <button
              type="button"
              onClick={() => handleAdjustElevation(5)}
              className="w-10 h-10 rounded-xl bg-[#00eefc]/20 text-[#00eefc] border border-[#00eefc]/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold"
            >
              +5°
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {activeFeedback.msg && (
        <div className={`mt-2 p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          activeFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {activeFeedback.msg}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2 flex flex-col gap-2">
        {!isSolved ? (
          <button
            onClick={handleLockAntenna}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            <span>Anten Hizalamasını Kilitle</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>RADAR KİLİTLENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
