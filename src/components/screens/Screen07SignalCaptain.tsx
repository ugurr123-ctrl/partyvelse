import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen07SignalCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { signal } = state;
  const [feedbackText, setFeedbackText] = useState('');

  const handleTransmit = () => {
    setFeedbackText(`DÖNÜŞÜM KURALI MÜHENDİSE AKTARILDI: "${signal.ruleDescription}"`);
    onUpdate((prev) => ({
      ...prev,
      signal: {
        ...prev.signal,
        isLocked: false,
      },
    }));

    setTimeout(() => {
      setFeedbackText('');
    }, 4000);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Narrative & Mission Directive */}
      <div className="pt-1 pb-3 flex flex-col text-center items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/30 mb-2">
          <span className="material-symbols-outlined text-[15px]">military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // SEMBOL VE KURAL ANAHTARI</span>
        </div>
        <h2 className="font-sora text-2xl font-bold text-white tracking-tight">
          Sinyali <span className="text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">çözümle</span>
        </h2>
        <p className="text-xs text-[#d5c4ac] max-w-[320px] mt-1">
          Gelen sembolleri kuralına göre dönüştür, ortaya çıkan 4 haneli kodu telsizden mühendisine oku!
        </p>
      </div>

      {/* Holographic Observation Terminal Hero */}
      <div className="mb-3">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#0f0c1e] border border-white/10">
          <div 
            className="bg-cover bg-center w-full h-[260px] relative" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDI2W-31llkaN9ktmfQRsTPpmzITOhsQqcuW3sNrE7tLpejdNe6nRPNX7EcDHd9qsGO61j9QbD7_bqF6d4V9iSpUygB0Au-2R0zZSEmNt_2wtI5RJ7w_MLl7MzOLBKl7dSRjPDvT-ezdjqeSXEhkXIl1ISGSIB29OVB68cbEPNGrPpMuH8Y76uEf2mI-cxc6MB9yM1TCfGm4tYeipLMtZGMrqkOJ5PBeS5yhhznL5I')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#141123]/60 to-[#141123]/40"></div>
            
            {/* Floating Holographic Data Surface */}
            <div className="absolute inset-2.5 rounded-xl bg-[#0f0c1e]/85 backdrop-blur-md p-3 flex flex-col justify-between shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]"></span>
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-wider uppercase font-bold">HAM DİZİ GLİFLERİ</span>
                </div>
                <span className="font-mono text-[9px] text-[#ffdba0] tracking-widest uppercase font-bold">KAYIP SİNYAL</span>
              </div>

              {/* 4 Dynamic Symbol Slots Display */}
              <div className="my-auto py-1 grid grid-cols-4 gap-2">
                {signal.symbols.map((glyph, idx) => (
                  <div key={idx} className="aspect-square rounded-xl bg-[#201d30] border border-white/5 flex flex-col items-center justify-center p-1 shadow-inner">
                    <span className="text-2xl font-bold text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.5)]">
                      {glyph}
                    </span>
                    <span className="font-mono text-[10px] text-[#00eefc] mt-0.5 font-bold">
                      ={signal.symbolMap[glyph]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Waveform Visual */}
              <div className="pt-1 pb-1">
                <div className="h-6 w-full flex items-center justify-between gap-[2px] px-1 opacity-90">
                  {[3, 5, 8, 6, 4, 9, 7, 4, 6, 8, 6, 3, 7, 9, 5, 3, 8, 6, 4, 7, 5].map((val, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-[#ffb703]' : 'bg-[#00eefc]'}`}
                      style={{ height: `${val * 2.2}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between font-mono text-[9px] text-[#d5c4ac]">
                <span className="text-[#00eefc]">KOD PROTOKOLÜ: AKTİF</span>
                <span className="text-[#ffb703] font-bold">MÜHENDİSE OKU</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Cipher Rule Plaque */}
      <div className="mb-3">
        <div className="bg-[#2b273b] rounded-2xl p-3.5 shadow-lg flex flex-col gap-2 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ffdba0]">vpn_key</span>
              <span className="font-sora text-xs font-bold text-[#ffdba0]">Dönüşüm Kuralı (Yalnızca Sende)</span>
            </div>
            <span className="text-[9px] font-mono uppercase text-[#00eefc] font-bold">KAPTAN ŞİFRESİ</span>
          </div>

          <div className="bg-[#201d30] p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
            <span className="text-xs text-white font-semibold leading-relaxed">
              {signal.ruleDescription}
            </span>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 font-mono text-xs">
              <span className="text-[#d5c4ac]">Çözümlenmiş Kod:</span>
              <span className="text-[#ffb703] font-extrabold text-sm tracking-widest bg-[#ffb703]/10 px-2 py-0.5 rounded border border-[#ffb703]/30">
                {signal.computedCode}
              </span>
            </div>
          </div>

          <div className="bg-[#201d30]/70 rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5">
            <span className="material-symbols-outlined text-[17px] text-[#ffdba0] shrink-0">info</span>
            <p className="text-[11px] text-[#d5c4ac] leading-relaxed">
              Mühendisin frekans tablosunda bu kodun ({signal.computedCode}) karşılık geldiği frekansı bulup kilitlemesi gerekiyor!
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Trigger */}
      <div className="mt-1 flex flex-col gap-2">
        <button
          onClick={handleTransmit}
          className="w-full h-14 rounded-2xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.4)] active:translate-y-1 transition-all cursor-pointer uppercase tracking-tight"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          <span>Kuralı Mühendise Telsizle</span>
        </button>

        {feedbackText && (
          <div className="text-center font-mono text-[10px] text-[#ffba27] font-bold animate-fadeIn">
            {feedbackText}
          </div>
        )}

        {signal.isSolved && (
          <button
            onClick={onAdvancePhase}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>FREKANS KİLİTLENDİ • DEVAM ET</span>
          </button>
        )}
      </div>

    </div>
  );
};
