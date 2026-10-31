import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen13RadarCaptain: React.FC<Props> = ({ state, onAdvancePhase }) => {
  const { radar } = state;
  const [transmitted, setTransmitted] = useState(false);

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3000);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // ORBİTAL KERTERİZ</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Sinyal Kerterizini Ver
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Radar çanağının kilitlenmesi gereken azimut ve elevasyon açılarını telsizden mühendise söyle.
        </p>
      </div>

      {/* Radar Matrix Display */}
      <div className="p-4 rounded-2xl bg-[#0f0c1e] border border-white/10 shadow-xl flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#00eefc]">
            <span className="material-symbols-outlined text-[18px]">radar</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">HEDEF ŞAMANDIRA</span>
          </div>
          <span className="font-mono text-xs text-[#ffb703] font-bold bg-[#ffb703]/10 px-2 py-0.5 rounded border border-[#ffb703]/30">
            {radar.beaconLabel}
          </span>
        </div>

        {/* Tactical Coordinates Plaque */}
        <div className="w-full grid grid-cols-2 gap-3 mt-1">
          <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">HEDEF AZİMUT</span>
            <span className="font-sora text-2xl font-black text-[#00eefc] mt-1">
              {radar.targetAzimuth}°
            </span>
            <span className="text-[10px] text-[#d5c4ac] mt-0.5">Yatay Çanak Açısı</span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">HEDEF ELEVASYON</span>
            <span className="font-sora text-2xl font-black text-[#ffb703] mt-1">
              +{radar.targetElevation}°
            </span>
            <span className="text-[10px] text-[#d5c4ac] mt-0.5">Dikey Eğim Açısı</span>
          </div>
        </div>

        {/* Polar Graphic Preview */}
        <div className="relative w-48 h-48 rounded-full border border-[#00eefc]/30 flex items-center justify-center my-1 bg-[#141123]">
          <div className="absolute inset-4 rounded-full border border-white/10"></div>
          <div className="absolute inset-10 rounded-full border border-white/10"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-white/10"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-[1px] bg-white/10"></div>
          </div>
          
          {/* Target Pointer Dot */}
          <div 
            className="absolute w-4 h-4 rounded-full bg-[#ffb703] shadow-[0_0_12px_#ffb703] animate-ping"
            style={{
              transform: `rotate(${radar.targetAzimuth - 90}deg) translate(65px)`,
            }}
          ></div>
          <div 
            className="absolute w-3 h-3 rounded-full bg-[#ffb703]"
            style={{
              transform: `rotate(${radar.targetAzimuth - 90}deg) translate(65px)`,
            }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleTransmit}
          className="w-full h-12 rounded-xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#00686f] active:translate-y-1 transition-all cursor-pointer uppercase"
        >
          <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
          <span>{transmitted ? 'Koordinatlar Telsizden Gönderildi' : 'Koordinatları Mühendise Telsizle'}</span>
        </button>

        {radar.isSolved && (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>RADAR KİLİTLENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
