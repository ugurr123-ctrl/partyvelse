import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: () => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen11AirlockCaptain: React.FC<Props> = ({ state, onAdvancePhase }) => {
  const { airlock } = state;
  const [transmitted, setTransmitted] = useState(false);

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3000);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Authorization Badge */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // HAVA KİLİDİ PROTOKOLÜ</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Basınç döngüsünü yönet
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Hava kilidi sızdırmazlık prosedürünü mühendise ilet. Adımları yanlış sıralamak kabin basıncını düşürür.
        </p>
      </div>

      {/* Protocol Directive Cards */}
      <div className="p-4 rounded-2xl bg-[#201d30] border border-white/5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#ffb703]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold">ZORUNLU SIRALAMA</span>
          </div>
          <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">KAPTAN DOKÜMANI</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {airlock.rules.map((rule, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0f0c1e] border border-white/5 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#2b273b] text-[#ffb703] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="text-xs text-white leading-relaxed font-medium">
                {rule}
              </span>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-xl bg-[#0f0c1e]/60 border border-white/5 flex items-center justify-between text-xs font-mono">
          <span className="text-[#d5c4ac]">Hedef Basınç Bandı:</span>
          <span className="text-[#00eefc] font-bold">{airlock.targetPressureRange}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleTransmit}
          className="w-full h-12 rounded-xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#00686f] active:translate-y-1 transition-all cursor-pointer uppercase"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>{transmitted ? 'Prosedür Telsizle Aktarıldı' : 'Protokolü Mühendise İlet'}</span>
        </button>

        {airlock.isSolved && (
          <button
            onClick={onAdvancePhase}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>HAVA KİLİDİ AKTİF • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
