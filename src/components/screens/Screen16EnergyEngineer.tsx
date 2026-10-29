import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen16EnergyEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { totalBudget, engineerAllocation, lineLosses, isDraftShared, isLocked } = state.energy;
  const [allocation, setAllocation] = useState(engineerAllocation);
  const [feedbackMsg, setFeedbackMsg] = useState('');

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

    onUpdate((prev) => ({
      ...prev,
      energy: {
        ...prev.energy,
        engineerAllocation: updated,
        isDraftShared: false,
      },
    }));
  };

  const handleShareDraft = () => {
    if (remainingBudget < 0) {
      setFeedbackMsg('Hata: Enerji bütçesi (12 Birim) aşıldı!');
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
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* Top Telemetry & Role Pill */}
      <div className="flex items-center justify-between gap-space-xs mt-space-sm">
        <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
          <span className="font-label-telemetry text-label-telemetry text-primary tracking-wider uppercase font-bold">MÜHENDİS // REAKTÖR DAĞITIMI</span>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></span>
          <span className="font-label-status text-label-status text-secondary tracking-widest uppercase font-bold">CANLI BAĞLANTI</span>
        </div>
      </div>

      {/* Briefing Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold uppercase">
          Enerjiyi Sistemlere Böl
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
          12 MW toplam bütçeyi paylaştır. Hat kayıplarını hesaplayıp taslağı kaptana ilet.
        </p>
      </div>

      {/* 12 MW Budget Display */}
      <div className="p-space-md rounded-xl bg-surface-container-low shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary-container shadow-inner">
            <span className="material-symbols-outlined text-[28px]">bolt</span>
          </div>
          <div>
            <span className="font-label-status text-label-status text-on-surface-variant uppercase font-bold">TOPLAM REAKTÖR GÜCÜ</span>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold">
              12 <span className="text-secondary-container text-sm">MW</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="font-label-status text-label-status text-on-surface-variant uppercase font-bold">KALAN GÜÇ</span>
          <div className={`font-headline-lg-mobile text-headline-lg-mobile font-black ${
            remainingBudget === 0 ? 'text-secondary-fixed' : remainingBudget < 0 ? 'text-error' : 'text-primary'
          }`}>
            {remainingBudget} <span className="text-xs">MW</span>
          </div>
        </div>
      </div>

      {/* 3 Power Adjustment Bars with Steppers */}
      <div className="flex flex-col gap-space-sm">
        {/* Yaşam */}
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary-container text-[20px]">ecg_heart</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">YAŞAM DESTEĞİ</span>
            </div>
            <span className="font-label-telemetry text-label-telemetry text-error uppercase font-bold">
              HAT KAYBI: -{lineLosses.yasamDestegi} MW
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust('yasamDestegi', -1)}
                disabled={isLocked || allocation.yasamDestegi <= 0}
                className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface font-bold active:scale-95 transition-transform cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="w-12 text-center font-headline-md text-headline-md font-extrabold text-on-surface">
                {allocation.yasamDestegi}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust('yasamDestegi', 1)}
                disabled={isLocked || remainingBudget <= 0}
                className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface font-bold active:scale-95 transition-transform cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>

            <div className="text-right">
              <span className="font-label-status text-label-status text-on-surface-variant block font-medium">NET ETKİLİ GÜÇ</span>
              <span className="font-headline-sm text-headline-sm text-secondary-container font-black">
                {effectivePower.yasamDestegi} MW
              </span>
            </div>
          </div>
        </div>

        {/* İtki */}
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary-fixed text-[20px]">rocket_launch</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">İTKİ MOTORLARI</span>
            </div>
            <span className="font-label-telemetry text-label-telemetry text-error uppercase font-bold">
              HAT KAYBI: -{lineLosses.itki} MW
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust('itki', -1)}
                disabled={isLocked || allocation.itki <= 0}
                className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface font-bold active:scale-95 transition-transform cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="w-12 text-center font-headline-md text-headline-md font-extrabold text-on-surface">
                {allocation.itki}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust('itki', 1)}
                disabled={isLocked || remainingBudget <= 0}
                className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface font-bold active:scale-95 transition-transform cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>

            <div className="text-right">
              <span className="font-label-status text-label-status text-on-surface-variant block font-medium">NET ETKİLİ GÜÇ</span>
              <span className="font-headline-sm text-headline-sm text-secondary-fixed font-black">
                {effectivePower.itki} MW
              </span>
            </div>
          </div>
        </div>

        {/* Kalkan */}
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">GÖVDE KALKANI</span>
            </div>
            <span className="font-label-telemetry text-label-telemetry text-error uppercase font-bold">
              HAT KAYBI: -{lineLosses.kalkan} MW
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAdjust('kalkan', -1)}
                disabled={isLocked || allocation.kalkan <= 0}
                className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface font-bold active:scale-95 transition-transform cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="w-12 text-center font-headline-md text-headline-md font-extrabold text-on-surface">
                {allocation.kalkan}
              </span>
              <button
                type="button"
                onClick={() => handleAdjust('kalkan', 1)}
                disabled={isLocked || remainingBudget <= 0}
                className="w-10 h-10 rounded-lg bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface font-bold active:scale-95 transition-transform cursor-pointer disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>

            <div className="text-right">
              <span className="font-label-status text-label-status text-on-surface-variant block font-medium">NET ETKİLİ GÜÇ</span>
              <span className="font-headline-sm text-headline-sm text-primary-container font-black">
                {effectivePower.kalkan} MW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Requirement Preview */}
      <div className="p-space-sm rounded-lg bg-surface-container-lowest flex flex-col gap-1 text-[11px] font-mono">
        <span className="text-[#a59db8] uppercase font-bold">ROTALARIN GÜÇ ŞARTLARI (MÜHENDİS BİLGİSİ):</span>
        <div className="flex justify-between text-on-surface">
          <span>Rota Alfa: <strong className="text-secondary-fixed">4 İtki</strong>, <strong className="text-primary-container">2 Kalkan</strong></span>
          <span className={effectivePower.itki >= 4 && effectivePower.kalkan >= 2 ? 'text-emerald-400 font-bold' : 'text-error font-bold'}>
            {effectivePower.itki >= 4 && effectivePower.kalkan >= 2 ? '✓ UYGUN' : '✗ YETERSİZ'}
          </span>
        </div>
        <div className="flex justify-between text-on-surface">
          <span>Rota Beta: <strong className="text-secondary-fixed">3 İtki</strong>, <strong className="text-primary-container">3 Kalkan</strong></span>
          <span className={effectivePower.itki >= 3 && effectivePower.kalkan >= 3 ? 'text-emerald-400 font-bold' : 'text-error font-bold'}>
            {effectivePower.itki >= 3 && effectivePower.kalkan >= 3 ? '✓ UYGUN' : '✗ YETERSİZ'}
          </span>
        </div>
        <div className="flex justify-between text-on-surface">
          <span>Rota Gama: <strong className="text-secondary-fixed">2 İtki</strong>, <strong className="text-primary-container">4 Kalkan</strong></span>
          <span className={effectivePower.itki >= 2 && effectivePower.kalkan >= 4 ? 'text-emerald-400 font-bold' : 'text-error font-bold'}>
            {effectivePower.itki >= 2 && effectivePower.kalkan >= 4 ? '✓ UYGUN' : '✗ YETERSİZ'}
          </span>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-secondary-container/10 border border-secondary-container/30 text-xs font-mono text-secondary-container animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* Action Trigger */}
      <div className="pt-space-xs pb-4">
        {!isLocked ? (
          <button
            type="button"
            onClick={handleShareDraft}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-secondary-container to-secondary-fixed text-on-secondary-container font-headline-sm text-headline-sm font-bold shadow-[0_6px_0_#00686f,0_12px_24px_rgba(0,238,252,0.3)] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <span className="material-symbols-outlined text-[24px]">send</span>
            <span>ENERJİ TASLAĞINI KAPTANA PAYLAŞ</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvancePhase}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary-container to-surface-tint text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-[0_6px_0_#996500] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse uppercase"
          >
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
            <span>KAPTAN KİLİTLEDİ • KURTARMAYA GEÇ</span>
          </button>
        )}
      </div>
    </div>
  );
};
