import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen15EnergyCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { energy } = state;
  const { engineerAllocation, lineLosses, captainMinRequirements, isDraftShared, isLocked } = energy;
  
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
        msg: 'Henüz Mühendisten onaylı enerji taslağı ulaşmadı! Mühendisin taslağı iletmesi bekleniyor.',
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
      let failDetail = 'YETERSİZ ENERJİ DAĞILIMI! ';
      if (!meetsLife) failDetail += `Net Yaşam Desteği (${effectivePower.yasamDestegi} MW) asgari 3 MW olmalı. `;
      if (!meetsThrust) failDetail += `Net İtki (${effectivePower.itki} MW) asgari 2 MW olmalı. `;
      if (!meetsShield) failDetail += `Net Kalkan (${effectivePower.kalkan} MW) asgari 2 MW olmalı. `;

      setFeedback({
        type: 'error',
        msg: `${failDetail}Mühendisten tahsisi artırmasını isteyin! Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // ENERJİ DOĞRULAMA</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Reaktör Gücünü Yönet
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Mühendisin 15 MW toplam bütçeden sunduğu güç dağılımını asgari güvenlik şartlarıyla kıyasla ve kilitle.
        </p>
      </div>

      {/* Secret Minimum Requirements Card */}
      <div className="p-4 rounded-2xl bg-[#201d30] border border-white/5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#ffb703]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold">ASGARİ GÜVENLİK SINIRLARI</span>
          </div>
          <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">GİZLİ KILAVUZ</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-[#00eefc] text-[18px] mb-1">ecg_heart</span>
            <span className="text-[10px] text-[#d5c4ac]">Net Yaşam</span>
            <span className="font-sora text-sm text-[#00eefc] font-bold">≥ {captainMinRequirements.yasamDestegi} MW</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-[#ffb703] text-[18px] mb-1">rocket_launch</span>
            <span className="text-[10px] text-[#d5c4ac]">Net İtki</span>
            <span className="font-sora text-sm text-[#ffb703] font-bold">≥ {captainMinRequirements.itki} MW</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-[#dab5ff] text-[18px] mb-1">shield</span>
            <span className="text-[10px] text-[#d5c4ac]">Net Kalkan</span>
            <span className="font-sora text-sm text-[#dab5ff] font-bold">≥ {captainMinRequirements.kalkan} MW</span>
          </div>
        </div>
      </div>

      {/* Engineer's Shared Draft Readout */}
      <div className="p-4 rounded-2xl bg-[#0f0c1e] border border-white/10 shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDraftShared ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`}></span>
            <span className="font-mono text-[10px] text-white uppercase font-bold">MÜHENDİSİN ENERJİ TASLAĞI</span>
          </div>
          <span className={`text-[10px] font-mono font-bold ${isDraftShared ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isDraftShared ? 'İLETİLDİ' : 'BEKLENİYOR'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mt-1">
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-[#d5c4ac]">Yaşam Desteği</span>
            <span className="font-sora text-lg font-bold text-white">{engineerAllocation.yasamDestegi} MW</span>
            <span className="text-[9px] text-emerald-400 font-mono">Net: {effectivePower.yasamDestegi} MW</span>
          </div>

          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-[#d5c4ac]">İtki Motorları</span>
            <span className="font-sora text-lg font-bold text-white">{engineerAllocation.itki} MW</span>
            <span className="text-[9px] text-emerald-400 font-mono">Net: {effectivePower.itki} MW</span>
          </div>

          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-[#d5c4ac]">Gövde Kalkanı</span>
            <span className="font-sora text-lg font-bold text-white">{engineerAllocation.kalkan} MW</span>
            <span className="text-[9px] text-emerald-400 font-mono">Net: {effectivePower.kalkan} MW</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#d5c4ac] text-center pt-1 border-t border-white/5">
          Toplam Tahsis: {engineerAllocation.yasamDestegi + engineerAllocation.itki + engineerAllocation.kalkan} / 15 MW (Hat Kaybı: her hatta -1 MW)
        </div>
      </div>

      {/* Feedback Message */}
      {feedback.msg && (
        <div className={`p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          feedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2 flex flex-col gap-2">
        {!isLocked ? (
          <button
            onClick={handleLockEnergy}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            <span>Enerji Dağılımını Onayla ve Kilitle</span>
          </button>
        ) : (
          <button
            onClick={onAdvancePhase}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>ENERJİ KİLİTLENDİ • KURTARMA ROTASI</span>
          </button>
        )}
      </div>

    </div>
  );
};
