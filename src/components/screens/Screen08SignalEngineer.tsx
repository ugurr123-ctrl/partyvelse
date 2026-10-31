import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen08SignalEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { signal } = state;
  const [currentFreq, setCurrentFreq] = useState(
    parseFloat(signal.engineerTunedFreq.replace(' MHz', '')) || 140.5
  );
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: signal.isSolved ? 'success' : 'idle',
    msg: signal.isSolved ? `FREKANS KİLİTLENDİ (${signal.engineerTunedFreq}) • SİNYAL YAKALANDI` : '',
  });

  const handleStepDown = () => {
    if (signal.isSolved) return;
    setCurrentFreq((prev) => Math.max(140.0, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleStepUp = () => {
    if (signal.isSolved) return;
    setCurrentFreq((prev) => Math.min(145.0, Math.round((prev + 0.1) * 10) / 10));
  };

  const formattedFreq = currentFreq.toFixed(1);

  const handleLockFrequency = () => {
    if (signal.isSolved) return;

    const tunedString = `${formattedFreq} MHz`;

    if (onAction) {
      onAction('signal_engineer_tune', { freq: tunedString });
      return;
    }

    // Local demo fallback
    const isCorrect = tunedString === signal.correctFrequency;
    if (isCorrect) {
      setFeedback({
        type: 'success',
        msg: `FREKANS KİLİTLENDİ (${tunedString})! Taşıyıcı dalga ile kod eşleşti. Sinyal başarıyla yakalandı!`,
      });
      onUpdate((prev) => ({
        ...prev,
        signal: {
          ...prev.signal,
          engineerTunedFreq: tunedString,
          isLocked: true,
          isSolved: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `FREKANS SAPMASI! ${tunedString} üzerinde aranan şifreli yayın bulunamadı. Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
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
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Background Visual Header */}
      <div className="relative w-full overflow-hidden rounded-b-2xl bg-[#0f0c1e] border border-white/10">
        <div 
          className="bg-cover bg-center w-full h-44 relative opacity-40" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-EHtsE9uXj77YZ38AYAxMAHhNErR6P7K3utAjJIu8w2ZWx4fDahXTu2XjkRsgnFGr5Dq1ASCvsGX0jA3bHuLtp2mpCNHd1CLwJVoik1nKGw-tyetG6Tn5qAwhQY04VhZc4ZQcYw5GdF_YYT6sYunhvE7zOyK2xfZcP-3PITnYzAMrOGzUoDcyqWyfKc9onLhrzhOCVI4kKyaRcH51sShcSdlpECPPJghLNiknmDY')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#141123]/40 via-[#141123]/80 to-[#141123]"></div>

        <div className="relative px-4 -mt-28 pb-4 z-10 flex flex-col gap-1 text-center items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2b273b]/80 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
            <span className="font-mono text-[10px] text-[#00eefc] tracking-widest uppercase font-bold">MÜHENDİS // FREKANS ANALİZİ</span>
          </div>
          <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight">
            Sinyali <span className="text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">yakala</span>
          </h2>
          <p className="text-xs text-[#d5c4ac] max-w-[320px]">
            Kaptandan 4 haneli kodu al. Frekans tablosundaki doğru kanala ayarla ve kilitle.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 -mt-2">
        {/* Frequency & Code Matrix Table */}
        <div className="w-full bg-[#0f0c1e] rounded-2xl p-3 flex flex-col gap-2 shadow-xl border border-white/10">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[10px] text-[#00eefc] uppercase font-bold">RADYO FREKANS MATRİSİ</span>
            <span className="font-mono text-[9px] text-[#d5c4ac]">CANLI KANALLAR</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {signal.frequencies.map((item, idx) => {
              const isCurrent = `${formattedFreq} MHz` === item.freq;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (signal.isSolved) return;
                    setCurrentFreq(parseFloat(item.freq.replace(' MHz', '')));
                  }}
                  className={`p-2 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-[#00eefc]/15 border-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.3)]' 
                      : 'bg-[#201d30] border-white/5 hover:bg-[#2b273b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{item.freq}</span>
                    <span className="text-[9px] font-mono text-[#ffb703] bg-[#ffb703]/10 px-1 rounded">
                      Kod: {item.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#d5c4ac] mt-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine Tuning Slider & Stepper */}
        <div className="w-full bg-[#2b273b] rounded-2xl p-3.5 flex flex-col gap-2 shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-sora text-xs font-bold text-white">İnce Frekans Ayarı</span>
            <span className="font-mono text-xs text-[#ffb703] font-bold bg-[#0f0c1e] px-2 py-0.5 rounded border border-white/10">
              {formattedFreq} MHz
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleStepDown}
              className="w-12 h-12 rounded-xl bg-[#0f0c1e] hover:bg-[#141123] flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_0_#0f0c1e] border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">remove</span>
            </button>

            <div className="flex-1 h-12 bg-[#0f0c1e] rounded-xl flex items-center px-3 relative overflow-hidden shadow-inner border border-white/10">
              <div className="w-full flex justify-between items-center opacity-40 px-1 font-mono text-[8px] text-[#d5c4ac]">
                <span>140</span>
                <span>141</span>
                <span>142</span>
                <span>143</span>
                <span>144</span>
                <span>145</span>
              </div>
              <div 
                className="absolute w-5 h-8 rounded bg-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.8)] flex items-center justify-center transition-all duration-150"
                style={{ left: `${Math.max(6, Math.min(94, ((currentFreq - 140) / 5) * 100))}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-0.5 h-5 bg-[#422c00] rounded-full"></div>
              </div>
            </div>

            <button
              onClick={handleStepUp}
              className="w-12 h-12 rounded-xl bg-[#0f0c1e] hover:bg-[#141123] flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_0_#0f0c1e] border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">add</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {activeFeedback.msg && (
          <div className={`p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
            activeFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {activeFeedback.msg}
          </div>
        )}

        {/* Lock Action Button */}
        <div className="w-full pt-1 flex flex-col gap-2">
          {!signal.isSolved ? (
            <button
              onClick={handleLockFrequency}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.4)] active:translate-y-1 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>Frekansı Kilitle ({formattedFreq} MHz)</span>
            </button>
          ) : (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>FREKANS KİLİTLENDİ • DEVAM ET</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
