import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen09CableCaptain: React.FC<Props> = ({ state, onAdvancePhase }) => {
  const { cable } = state;
  const [transmitted, setTransmitted] = useState(false);

  const getCableById = (id: string) => cable.cables.find(c => c.id === id);

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3000);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-HUD Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest font-bold uppercase">KAPTAN // KABLO BAĞLANTI ŞEMASI</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">Devreyi doğru eşleştir</h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Mühendisine port soketleri (P1–P4) ile doğru kabloların eşleşmesini telsizden aktar. Yanlış hat kısa devre yaptırır.
        </p>
      </div>

      {/* Guide Schematic Card */}
      <div className="relative bg-[#201d30] p-3.5 rounded-2xl shadow-md overflow-hidden mt-3 border border-white/5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#00eefc] tracking-wider font-bold uppercase">
            GİZLİ DEVRE EŞLEŞTİRME KILAVUZU
          </span>
          <span className="text-[9px] font-mono text-[#ffb703] font-bold">4 PORT</span>
        </div>

        <div className="flex flex-col gap-2">
          {cable.ports.map((port) => {
            const reqCable = getCableById(port.requiredCableId);
            return (
              <div key={port.id} className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#2b273b] font-mono text-xs font-bold text-white flex items-center justify-center border border-white/10">
                    {port.id}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-semibold">{port.functionLabel}</span>
                    <span className="text-[10px] text-[#d5c4ac]">{port.label}</span>
                  </div>
                </div>

                {reqCable && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border" style={{ borderColor: reqCable.color, backgroundColor: `${reqCable.color}15` }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: reqCable.color }}></span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: reqCable.color }}>
                      {reqCable.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transmit Action */}
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleTransmit}
          className="w-full h-12 rounded-xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#00686f] active:translate-y-1 transition-all cursor-pointer uppercase"
        >
          <span className="material-symbols-outlined text-[18px]">cell_tower</span>
          <span>{transmitted ? 'Şema Bilgisi Telsizden Gönderildi' : 'Şemayı Mühendise Telsizle'}</span>
        </button>

        {cable.isSolved && (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>DEVRE KİLİTLENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
