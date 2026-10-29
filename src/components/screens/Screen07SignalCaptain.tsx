import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen07SignalCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const [selectedGlyph, setSelectedGlyph] = useState<string | null>('odak');
  const [feedbackText, setFeedbackText] = useState('');

  const handleSelectGlyph = (key: string) => {
    setSelectedGlyph(key);
  };

  const handleTransmit = () => {
    if (!selectedGlyph) {
      setFeedbackText('LÜTFEN ÖNCE EKSİK DİZİ GLİFİNİ SEÇİN');
      setTimeout(() => setFeedbackText(''), 2500);
      return;
    }

    setFeedbackText('VERİ İLETİMİ BAŞARILI // MÜHENDİSE AKTARILDI');
    onUpdate((prev) => ({
      ...prev,
      signal: {
        ...prev.signal,
        isLocked: false,
      },
    }));

    setTimeout(() => {
      setFeedbackText('');
    }, 3500);
  };

  const renderGlyphSvg = (key: string | null) => {
    if (key === 'alfa') {
      return (
        <svg className="w-7 h-7 text-[#00eefc]" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="3"></circle>
        </svg>
      );
    }
    if (key === 'odak') {
      return (
        <svg className="w-7 h-7 text-[#ffb703]" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2.5"></circle>
          <circle cx="16" cy="16" fill="currentColor" r="3"></circle>
          <path d="M16 2V7 M16 25V30 M2 16H7 M25 16H30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path>
        </svg>
      );
    }
    if (key === 'prizma') {
      return (
        <svg className="w-7 h-7 text-[#00eefc]" viewBox="0 0 32 32" fill="none">
          <polygon points="16,4 27,10 27,22 16,28 5,22 5,10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"></polygon>
        </svg>
      );
    }
    if (key === 'wave') {
      return (
        <svg className="w-7 h-7 text-[#00eefc]" viewBox="0 0 32 32" fill="none">
          <path d="M4 16 C8 8, 10 8, 14 16 C18 24, 20 24, 28 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path>
        </svg>
      );
    }
    return <span className="font-sora text-xl text-[#ffb703] font-bold">?</span>;
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-HUD Floating Status Telemetry Bar */}
      <div className="pt-1 pb-3 flex items-center justify-between gap-2">
        <div className="flex-1 bg-[#2b273b]/90 rounded-xl px-3 py-2 flex items-center gap-2 shadow-md backdrop-blur-md border border-white/5">
          <span className="material-symbols-outlined text-[18px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm tracking-widest text-[#ffdba0] font-bold">
              03<span className="animate-pulse">:</span>12
            </span>
          </div>
        </div>

        <div className="flex-1 bg-[#2b273b]/90 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-md backdrop-blur-md border border-white/5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-[#00eefc]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-mono text-[10px] text-[#d5c4ac] truncate uppercase">Bütünlük</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-[11px] text-[#00eefc] font-bold">%{state.hullIntegrity}</span>
            <div className="flex items-center gap-0.5">
              <div className="w-1.5 h-3 rounded bg-[#00eefc] shadow-[0_0_6px_rgba(0,238,252,0.8)]"></div>
              <div className="w-1.5 h-3 rounded bg-[#00eefc] shadow-[0_0_6px_rgba(0,238,252,0.8)]"></div>
              <div className="w-1.5 h-3 rounded bg-[#00eefc] shadow-[0_0_6px_rgba(0,238,252,0.8)]"></div>
              <div className="w-1.5 h-3 rounded bg-[#363246]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative & Mission Directive */}
      <div className="pt-1 pb-3 flex flex-col text-center items-center">
        <h2 className="font-sora text-2xl font-bold text-white tracking-tight">
          Mesajı <span className="text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">tamamla</span>
        </h2>
        <p className="text-xs text-[#d5c4ac] max-w-[320px] mt-1">
          Kayıp sinyalin bir kısmı çözüldü. Eksik sembolü bul ve diziyi tamamla.
        </p>
      </div>

      {/* Holographic Observation Terminal Hero */}
      <div className="mb-4">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#0f0c1e] border border-white/10">
          <div 
            className="bg-cover bg-center w-full h-[290px] relative" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDI2W-31llkaN9ktmfQRsTPpmzITOhsQqcuW3sNrE7tLpejdNe6nRPNX7EcDHd9qsGO61j9QbD7_bqF6d4V9iSpUygB0Au-2R0zZSEmNt_2wtI5RJ7w_MLl7MzOLBKl7dSRjPDvT-ezdjqeSXEhkXIl1ISGSIB29OVB68cbEPNGrPpMuH8Y76uEf2mI-cxc6MB9yM1TCfGm4tYeipLMtZGMrqkOJ5PBeS5yhhznL5I')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#141123]/60 to-[#141123]/40"></div>
            
            {/* Floating Holographic Data Surface */}
            <div className="absolute inset-2.5 rounded-xl bg-[#0f0c1e]/85 backdrop-blur-md p-3 flex flex-col justify-between shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]"></span>
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-wider uppercase font-bold">DİNLENEN İLETİM</span>
                </div>
                <span className="font-mono text-[9px] text-[#ffdba0] tracking-widest uppercase font-bold">KAYIP SİNYAL</span>
              </div>

              {/* Sequence Glyph Slots Display */}
              <div className="my-auto py-1 flex items-center justify-between gap-1.5">
                <div className="flex-1 aspect-square rounded-lg bg-[#201d30] flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-[#00eefc] drop-shadow-[0_0_6px_rgba(0,238,252,0.7)]" fill="none" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="3"></circle>
                  </svg>
                </div>
                <div className="flex-1 aspect-square rounded-lg bg-[#201d30] flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-[#ffb703] drop-shadow-[0_0_6px_rgba(255,183,3,0.7)]" fill="none" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2.5"></circle>
                    <circle cx="16" cy="16" fill="currentColor" r="3"></circle>
                    <path d="M16 2V7 M16 25V30 M2 16H7 M25 16H30" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                  </svg>
                </div>
                <div className="flex-1 aspect-square rounded-lg bg-[#201d30] flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-[#00eefc] drop-shadow-[0_0_6px_rgba(0,238,252,0.7)]" fill="none" viewBox="0 0 32 32">
                    <polygon points="16,4 27,10 27,22 16,28 5,22 5,10" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5"></polygon>
                  </svg>
                </div>
                {/* Target Slot (Missing [?]) */}
                <div className="flex-1 aspect-square rounded-lg bg-[#ffb703]/20 border border-[#ffb703] flex flex-col items-center justify-center shadow-[0_0_16px_rgba(255,183,3,0.35)] transition-all">
                  {renderGlyphSvg(selectedGlyph)}
                </div>
                <div className="flex-1 aspect-square rounded-lg bg-[#201d30] flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-[#00eefc] drop-shadow-[0_0_6px_rgba(0,238,252,0.7)]" fill="none" viewBox="0 0 32 32">
                    <path d="M4 16 C8 8, 10 8, 14 16 C18 24, 20 24, 28 16" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                  </svg>
                </div>
              </div>

              {/* Dynamic Waveform Equalizer */}
              <div className="pt-1 pb-1">
                <div className="h-8 w-full flex items-center justify-between gap-[2px] px-1 opacity-90">
                  {[3, 5, 8, 6, 4, 9, 7, 4, 6, 8, 6, 3, 7, 9, 5, 3, 8, 6, 4, 7, 5].map((val, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-[#ffb703]' : 'bg-[#00eefc]'}`}
                      style={{ height: `${val * 3}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Telemetry Metadata Footer */}
              <div className="pt-1 flex items-center justify-between text-left font-mono text-[9px] text-[#d5c4ac]">
                <div className="flex flex-col">
                  <span>KAYNAK: ? ? ?</span>
                  <span className="text-[#00eefc]">KANAL: DERİN UZAY</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#ffb703] font-bold uppercase">SİNYAL PARÇALI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Cipher Key Console (Level 1 Sub-Panel) */}
      <div className="mb-4">
        <div className="bg-[#2b273b] rounded-2xl p-3.5 shadow-lg flex flex-col gap-2.5 border border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#ffdba0]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <span className="font-sora text-xs font-bold text-[#ffdba0]">Sembol anahtarı yalnızca sende</span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono">
            <div className="bg-[#201d30] rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#363246] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00eefc]" fill="none" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="3"></circle>
                </svg>
              </div>
              <span className="text-[10px] text-white uppercase tracking-wider font-bold">ALFA</span>
            </div>

            <div className="bg-[#201d30] rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#363246] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ffb703]" fill="none" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2.5"></circle>
                  <circle cx="16" cy="16" fill="currentColor" r="3"></circle>
                  <path d="M16 2V7 M16 25V30 M2 16H7 M25 16H30" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
              </div>
              <span className="text-[10px] text-[#ffb703] uppercase tracking-wider font-bold">ODAK</span>
            </div>

            <div className="bg-[#201d30] rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#363246] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00eefc]" fill="none" viewBox="0 0 32 32">
                  <polygon points="16,4 27,10 27,22 16,28 5,22 5,10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"></polygon>
                </svg>
              </div>
              <span className="text-[10px] text-white uppercase tracking-wider font-bold">PRİZMA</span>
            </div>
          </div>

          <div className="bg-[#201d30]/70 rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5">
            <span className="material-symbols-outlined text-[17px] text-[#ffdba0] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <p className="text-xs text-[#d5c4ac]">Önce yönü, sonra merkezi bul.</p>
          </div>
        </div>
      </div>

      {/* Dizi Seçimi (Interactive Glyph Selector Rail) */}
      <div className="mb-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono">
          <span className="text-[10px] text-white tracking-wider uppercase font-semibold">Dizi seçimi</span>
          <span className="text-[9px] text-[#00eefc] font-bold">EKSİK GLİFİ SEÇ</span>
        </div>

        <div className="bg-[#2b273b] rounded-2xl p-2 flex items-center justify-between gap-1 shadow-md border border-white/5">
          <div className="flex items-center justify-around flex-1 gap-1.5 px-1">
            {(['alfa', 'odak', 'prizma', 'wave'] as const).map((key) => {
              const isSelected = selectedGlyph === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectGlyph(key)}
                  className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isSelected ? 'bg-[#363246] border border-[#00eefc] shadow-[0_0_10px_rgba(0,238,252,0.4)]' : 'bg-[#201d30] border border-white/5'
                  }`}
                >
                  {renderGlyphSvg(key)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Arcade Transmission Action Trigger */}
      <div className="mt-1 flex flex-col gap-2">
        <button
          onClick={handleTransmit}
          className="w-full h-14 rounded-2xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.4)] active:translate-y-1 transition-all cursor-pointer uppercase tracking-tight"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          <span>Diziyi mühendise ilet</span>
        </button>

        {feedbackText && (
          <div className="text-center font-mono text-[10px] text-[#ffba27] font-bold animate-fadeIn">
            {feedbackText}
          </div>
        )}

        {state.signal.isSolved && (
          <button
            onClick={onAdvancePhase}
            className="w-full py-3.5 px-4 rounded-xl font-bold font-sora text-sm text-black btn-3d-gold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 animate-bounce mt-2"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>MÜHENDİS FREKANSI KİLİTLEDİ • DEVAM ET</span>
          </button>
        )}
      </div>

    </div>
  );
};
