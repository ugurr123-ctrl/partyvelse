import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen15EnergyCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { engineerAllocation, lineLosses, captainMinRequirements, isDraftShared, isLocked } = state.energy;
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isLocked ? 'success' : 'idle',
    msg: isLocked ? 'Enerji dağılımı kilitlendi! Tüm hayati sistemler nominal sınırlarda.' : '',
  });

  const effectivePower = {
    yasamDestegi: Math.max(0, engineerAllocation.yasamDestegi - lineLosses.yasamDestegi),
    itki: Math.max(0, engineerAllocation.itki - lineLosses.itki),
    kalkan: Math.max(0, engineerAllocation.kalkan - lineLosses.kalkan),
  };

  const handleLockEnergy = () => {
    if (!isDraftShared) {
      setFeedback({
        type: 'error',
        msg: 'Henüz Mühendisten onaylı enerji taslağı ulaşmadı! Mühendisin taslağı paylaşması bekleniyor.',
      });
      return;
    }

    const meetsLife = effectivePower.yasamDestegi >= captainMinRequirements.yasamDestegi;
    const meetsThrust = effectivePower.itki >= captainMinRequirements.itki;
    const meetsShield = effectivePower.kalkan >= captainMinRequirements.kalkan;

    if (meetsLife && meetsThrust && meetsShield) {
      setFeedback({
        type: 'success',
        msg: 'ENERJİ KİLİTLENDİ! Dağılım tüm hayati sistemlerin asgari sınırlarını karşılıyor. Kurtarma rotası açıldı!',
      });
      onUpdate((prev) => ({
        ...prev,
        energy: {
          ...prev.energy,
          isLocked: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: 'YETERSİZ ENERJİ DAĞILIMI! Mühendisin paylaştığı net güç asgari eşikleri karşılamıyor. Mühendise güçleri artırmasını söyleyin! (Gövde Bütünlüğü -%10, Süre -15 sn)',
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* Top Telemetry & Role Pill */}
      <div className="flex items-center justify-between gap-space-xs mt-space-sm">
        <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-label-telemetry text-label-telemetry text-primary tracking-wider uppercase font-bold">👑 KAPTAN // ENERJİ MATRİSİ</span>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></span>
          <span className="font-label-status text-label-status text-secondary tracking-widest uppercase font-bold">CANLI BAĞLANTI</span>
        </div>
      </div>

      {/* Briefing Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold uppercase">
          Reaktör Gücünü Yönet
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
          Mühendisin taslağını gizli asgari gereksinimlerle karşılaştır ve onay ver.
        </p>
      </div>

      {/* Secret Minimum Requirements Card */}
      <div className="p-space-md rounded-xl bg-surface-container-low shadow-xl flex flex-col gap-space-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary-container">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span className="font-label-telemetry text-label-telemetry uppercase tracking-wider font-bold">ASGARİ GÜÇ ŞARTLARI</span>
          </div>
          <span className="font-label-status text-label-status text-on-surface-variant uppercase tracking-widest font-semibold">GİZLİ KILAVUZ</span>
        </div>

        <div className="grid grid-cols-3 gap-space-xs text-center">
          <div className="p-space-sm rounded-lg bg-surface-container shadow-inner flex flex-col items-center">
            <span className="material-symbols-outlined text-secondary-container text-[20px] mb-1">ecg_heart</span>
            <span className="font-label-status text-label-status text-on-surface-variant mb-0.5">Yaşam</span>
            <span className="font-headline-sm text-headline-sm text-secondary-container font-bold">≥ {captainMinRequirements.yasamDestegi} MW</span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container shadow-inner flex flex-col items-center">
            <span className="material-symbols-outlined text-secondary-fixed text-[20px] mb-1">rocket_launch</span>
            <span className="font-label-status text-label-status text-on-surface-variant mb-0.5">İtki</span>
            <span className="font-headline-sm text-headline-sm text-secondary-fixed font-bold">≥ {captainMinRequirements.itki} MW</span>
          </div>
          <div className="p-space-sm rounded-lg bg-surface-container shadow-inner flex flex-col items-center">
            <span className="material-symbols-outlined text-primary-container text-[20px] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-label-status text-label-status text-on-surface-variant mb-0.5">Kalkan</span>
            <span className="font-headline-sm text-headline-sm text-primary-container font-bold">≥ {captainMinRequirements.kalkan} MW</span>
          </div>
        </div>
      </div>

      {/* Engineer's Shared Live Allocation */}
      <div className="flex flex-col bg-surface-container-low rounded-xl p-space-md shadow-lg gap-space-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[20px] text-primary-container">sync</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">Mühendisin Dağılımı</h3>
          </div>
          <div className="px-space-sm py-0.5 rounded-lg bg-surface-container-highest">
            <span className={`font-label-telemetry text-label-telemetry font-bold ${isDraftShared ? 'text-secondary-fixed' : 'text-primary'}`}>
              {isDraftShared ? 'TASLAK AKTİF' : 'BEKLENİYOR'}
            </span>
          </div>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-3 gap-space-sm">
          {/* Yaşam */}
          <div className="flex flex-col items-center p-space-sm rounded-lg bg-surface-container-high/80 gap-space-xs shadow-sm">
            <span className="font-headline-sm text-[13px] leading-4 text-on-surface font-semibold">Yaşam</span>
            <span className={`font-label-telemetry text-[12px] font-bold ${
              effectivePower.yasamDestegi >= captainMinRequirements.yasamDestegi ? 'text-secondary-container' : 'text-error'
            }`}>
              {effectivePower.yasamDestegi} MW
            </span>
            <div className="flex flex-col-reverse w-full gap-1 pt-1.5 px-space-xs">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2.5 w-full rounded ${
                    i < effectivePower.yasamDestegi ? 'bg-secondary-container shadow-[0_0_8px_rgba(0,238,252,0.6)]' : 'bg-surface-container-highest/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* İtki */}
          <div className="flex flex-col items-center p-space-sm rounded-lg bg-surface-container-high/80 gap-space-xs shadow-sm">
            <span className="font-headline-sm text-[13px] leading-4 text-on-surface font-semibold">İtki</span>
            <span className={`font-label-telemetry text-[12px] font-bold ${
              effectivePower.itki >= captainMinRequirements.itki ? 'text-secondary-fixed' : 'text-error'
            }`}>
              {effectivePower.itki} MW
            </span>
            <div className="flex flex-col-reverse w-full gap-1 pt-1.5 px-space-xs">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2.5 w-full rounded ${
                    i < effectivePower.itki ? 'bg-secondary-fixed shadow-[0_0_8px_rgba(125,244,255,0.6)]' : 'bg-surface-container-highest/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Kalkan */}
          <div className="flex flex-col items-center p-space-sm rounded-lg bg-surface-container-high/80 gap-space-xs shadow-sm">
            <span className="font-headline-sm text-[13px] leading-4 text-on-surface font-semibold">Kalkan</span>
            <span className={`font-label-telemetry text-[12px] font-bold ${
              effectivePower.kalkan >= captainMinRequirements.kalkan ? 'text-primary-container' : 'text-error'
            }`}>
              {effectivePower.kalkan} MW
            </span>
            <div className="flex flex-col-reverse w-full gap-1 pt-1.5 px-space-xs">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2.5 w-full rounded ${
                    i < effectivePower.kalkan ? 'bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]' : 'bg-surface-container-highest/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <span className="text-[10px] text-center text-on-surface-variant font-medium">
          Mühendisin hat kayıpları düşüldükten sonra sisteme ulaşan net güçler gösterilmektedir.
        </span>
      </div>

      {/* Routes Preview */}
      <div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm">
        <span className="font-label-telemetry text-label-telemetry text-primary uppercase font-bold">
          TAHLİYE ROTALARI (KAPTAN BİLGİSİ)
        </span>
        <div className="flex flex-col gap-1.5 mt-1 font-body-sm text-body-sm">
          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
            <span className="font-semibold text-white">Rota Alfa (Sığınak)</span>
            <span className="text-secondary-container font-bold">6 Kişi • 1.2 dk</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
            <span className="font-semibold text-white">Rota Beta (Hızlı Geçiş)</span>
            <span className="text-secondary-fixed font-bold">8 Kişi • 2.5 dk</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
            <span className="font-semibold text-white">Rota Gama (Konvoy)</span>
            <span className="text-primary-container font-bold">10 Kişi • 4.0 dk</span>
          </div>
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

      {/* Action Trigger */}
      <div className="pt-space-xs pb-4">
        {!isLocked ? (
          <button
            type="button"
            onClick={handleLockEnergy}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary-container to-surface-tint text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-[0_6px_0_#996500,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#996500] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <span className="material-symbols-outlined text-[24px]">lock</span>
            <span>ENERJİYİ AKTAR VE KİLİTLE</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvancePhase}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-secondary-container to-secondary-fixed text-on-secondary-container font-headline-sm text-headline-sm font-bold shadow-[0_6px_0_#00686f] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse uppercase"
          >
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <span>4. AŞAMA KURTARMAYA GEÇ</span>
          </button>
        )}
      </div>
    </div>
  );
};
