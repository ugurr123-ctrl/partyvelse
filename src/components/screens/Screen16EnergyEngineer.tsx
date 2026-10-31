import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen16EnergyEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { totalBudget, engineerAllocation, lineLosses, isDraftShared, isLocked } = state.energy;
  const [allocation, setAllocation] = useState(engineerAllocation);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  React.useEffect(() => {
    setAllocation(engineerAllocation);
  }, [engineerAllocation]);

  const totalUsed = allocation.yasamDestegi + allocation.itki + allocation.kalkan;
  const remainingBudget = totalBudget - totalUsed;

  const effectivePower = {
    yasamDestegi: Math.max(0, allocation.yasamDestegi - lineLosses.yasamDestegi),
    itki: Math.max(0, allocation.itki - lineLosses.itki),
    kalkan: Math.max(0, allocation.kalkan - lineLosses.kalkan),
  };

  const handleAdjust = (system: 'yasamDestegi' | 'itki' | 'kalkan', delta: number) => {
    if (isLocked) return;
    const current = allocation[system];
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && remainingBudget <= 0) return;

    const updated = {
      ...allocation,
      [system]: next,
    };
    setAllocation(updated);

    if (onAction) {
      onAction('energy_set_allocation', { allocation: updated });
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: updated,
        isDraftShared: false, // Invalidate draft until re-shared
      },
    }));
  };

  const handleShareDraft = () => {
    if (remainingBudget < 0) {
      setFeedbackMsg('Hata: Enerji bütçesi (15 MW) aşıldı!');
      return;
    }

    if (onAction) {
      onAction('energy_share_draft', {});
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: allocation,
        isDraftShared: true,
      },
    }));
    setFeedbackMsg('Enerji taslağı Kaptana başarıyla iletildi! Kaptanın asgari onay verip kilitlemesi bekleniyor.');
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px]">bolt</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS // ENERJİ DAĞITIM KONSOLU</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Enerjiyi Sistemlere Böl
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          15 MW toplam bütçeyi paylaştır. Her hattaki 1 MW hat kaybını hesaba katarak taslağı kaptana ilet.
        </p>
      </div>

      {/* 15 MW Total Budget Card */}
      <div className="p-4 rounded-2xl bg-[#0f0c1e] border border-white/10 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#00eefc]/15 text-[#00eefc] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[26px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">TOPLAM REAKTÖR GÜCÜ</span>
            <span className="font-sora text-2xl font-black text-white">
              {totalBudget} <span className="text-[#00eefc] text-sm">MW</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">KALAN BÜTÇE</span>
          <span className={`font-sora text-2xl font-black ${remainingBudget === 0 ? 'text-emerald-400' : remainingBudget > 0 ? 'text-[#ffb703]' : 'text-rose-400'}`}>
            {remainingBudget} <span className="text-xs">MW</span>
          </span>
        </div>
      </div>

      {/* 3 Energy Channel Controls */}
      <div className="flex flex-col gap-2.5">
        
        {/* 1. Yaşam Desteği */}
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">ecg_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">Yaşam Desteği</span>
              <span className="text-[10px] text-[#d5c4ac]">Net Çıkış: {effectivePower.yasamDestegi} MW (-1 kayıp)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust('yasamDestegi', -1)}
              disabled={isLocked || allocation.yasamDestegi <= 0}
              className="w-9 h-9 rounded-xl bg-[#0f0c1e] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center font-sora font-extrabold text-base text-white">
              {allocation.yasamDestegi}
            </span>
            <button
              type="button"
              onClick={() => handleAdjust('yasamDestegi', 1)}
              disabled={isLocked || remainingBudget <= 0}
              className="w-9 h-9 rounded-xl bg-[#00eefc]/20 text-[#00eefc] flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. İtki Motorları */}
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">İtki Motorları</span>
              <span className="text-[10px] text-[#d5c4ac]">Net Çıkış: {effectivePower.itki} MW (-1 kayıp)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust('itki', -1)}
              disabled={isLocked || allocation.itki <= 0}
              className="w-9 h-9 rounded-xl bg-[#0f0c1e] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center font-sora font-extrabold text-base text-white">
              {allocation.itki}
            </span>
            <button
              type="button"
              onClick={() => handleAdjust('itki', 1)}
              disabled={isLocked || remainingBudget <= 0}
              className="w-9 h-9 rounded-xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Gövde Kalkanı */}
        <div className="p-3.5 rounded-2xl bg-[#1c192c] border border-white/5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#dab5ff]/20 text-[#dab5ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-bold">Gövde Kalkanı</span>
              <span className="text-[10px] text-[#d5c4ac]">Net Çıkış: {effectivePower.kalkan} MW (-1 kayıp)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust('kalkan', -1)}
              disabled={isLocked || allocation.kalkan <= 0}
              className="w-9 h-9 rounded-xl bg-[#0f0c1e] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center font-sora font-extrabold text-base text-white">
              {allocation.kalkan}
            </span>
            <button
              type="button"
              onClick={() => handleAdjust('kalkan', 1)}
              disabled={isLocked || remainingBudget <= 0}
              className="w-9 h-9 rounded-xl bg-[#dab5ff]/20 text-[#dab5ff] flex items-center justify-center active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

      </div>

      {/* Feedback Message */}
      {(state.feedbackMessage || feedbackMsg) && (
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-[#00eefc]/30 text-[#00eefc] text-xs leading-relaxed animate-fadeIn">
          {state.feedbackMessage || feedbackMsg}
        </div>
      )}

      {/* Action Trigger */}
      <div className="mt-2 flex flex-col gap-2">
        {!isLocked ? (
          <button
            onClick={handleShareDraft}
            className="w-full h-14 rounded-2xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>Enerji Taslağını Kaptana İlet</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>KAPTAN KİLİTLEDİ • KURTARMA ROTASI</span>
          </button>
        )}
      </div>

    </div>
  );
};
