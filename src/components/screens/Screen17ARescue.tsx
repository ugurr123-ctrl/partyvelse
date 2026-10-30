import React, { useState } from 'react';
import { MissionState } from '../../types/game';
import { calculateFinalScore } from '../../services/gameFactory';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onFinalizeMission: () => void;
}

export const Screen17ARescue: React.FC<Props> = ({ state, onUpdate, onFinalizeMission }) => {
  const { rescue, energy, myRole, hullIntegrity, timeLeftSeconds } = state;
  const { selectedRouteId, captainApproved, engineerApproved, routes } = rescue;
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const netLife = Math.max(0, energy.engineerAllocation.yasamDestegi - energy.lineLosses.yasamDestegi);
  const netThrust = Math.max(0, energy.engineerAllocation.itki - energy.lineLosses.itki);
  const netShield = Math.max(0, energy.engineerAllocation.kalkan - energy.lineLosses.kalkan);

  const hasThrustPower = netThrust >= activeRoute.powerRequirements.itki;
  const hasShieldPower = netShield >= activeRoute.powerRequirements.kalkan;
  const hasLifePower = netLife >= 3;
  const hasEnoughTime = timeLeftSeconds >= activeRoute.travelTimeSeconds;
  const isEnergyLocked = energy.isLocked;

  const handleSelectRoute = (routeId: 'alfa' | 'beta' | 'gama') => {
    setValidationError(null);
    onUpdate((prev) => ({
      ...prev,
      rescue: {
        ...prev.rescue,
        selectedRouteId: routeId,
        captainApproved: false,
        engineerApproved: false,
      },
    }));
  };

  const handleToggleMyApproval = () => {
    setValidationError(null);
    onUpdate((prev) => {
      const isCaptain = prev.myRole === 'kaptan';
      return {
        ...prev,
        rescue: {
          ...prev.rescue,
          captainApproved: isCaptain ? !prev.rescue.captainApproved : prev.rescue.captainApproved,
          engineerApproved: !isCaptain ? !prev.rescue.engineerApproved : prev.rescue.engineerApproved,
        },
      };
    });
  };

  const handleSimulatePartnerApproval = () => {
    setValidationError(null);
    onUpdate((prev) => {
      const isCaptain = prev.myRole === 'kaptan';
      return {
        ...prev,
        rescue: {
          ...prev.rescue,
          captainApproved: !isCaptain ? !prev.rescue.captainApproved : prev.rescue.captainApproved,
          engineerApproved: isCaptain ? !prev.rescue.engineerApproved : prev.rescue.engineerApproved,
        },
      };
    });
  };

  const bothApproved = captainApproved && engineerApproved;

  const handleConfirmRescue = () => {
    setValidationError(null);

    // 1. Verify Energy Lock
    if (!isEnergyLocked) {
      setValidationError('HATA: Reaktör enerjisi kilitlenmedi! Önceki aşamada güç dağılımı onaylanmalıdır.');
      return;
    }

    // 2. Verify Life Support
    if (!hasLifePower) {
      setValidationError(`YETERSİZ YAŞAM DESTEĞİ! Net ${netLife} MW sağlandı (Asgari 3 MW gereklidir).`);
      return;
    }

    // 3. Verify Route Thrust Requirement
    if (!hasThrustPower) {
      setValidationError(`YETERSİZ İTKİ GÜCÜ! ${activeRoute.name} için net ${activeRoute.powerRequirements.itki} MW itki gerekiyor, sağlanan: ${netThrust} MW.`);
      return;
    }

    // 4. Verify Route Shield Requirement
    if (!hasShieldPower) {
      setValidationError(`YETERSİZ KALKAN GÜCÜ! ${activeRoute.name} için net ${activeRoute.powerRequirements.kalkan} MW kalkan gerekiyor, sağlanan: ${netShield} MW.`);
      return;
    }

    // 5. Verify Time Remaining vs Travel Time
    if (!hasEnoughTime) {
      // Failed due to running out of time during transit
      const scoreData = calculateFinalScore(3, 0, 0, 0);
      onUpdate((prev) => ({
        ...prev,
        status: 'phase_result',
        outcomeType: 'basarisizlik',
        rescuedCrewCount: 0,
        completedTasksCount: 3,
        timeLeftSeconds: 0,
        hullIntegrity: 0,
        finalScore: scoreData.total,
        scoreBreakdown: scoreData.breakdown,
      }));
      onFinalizeMission();
      return;
    }

    // All validation passed: calculate real score and determine outcome!
    const rescued = activeRoute.crewCount;
    const outcomeType = rescued === 10 ? 'tam_basari' : 'kismi_kurtarma';
    const remainingTimeAfterTravel = Math.max(0, timeLeftSeconds - activeRoute.travelTimeSeconds);
    const scoreData = calculateFinalScore(4, remainingTimeAfterTravel, hullIntegrity, rescued);

    onUpdate((prev) => ({
      ...prev,
      status: 'phase_result',
      outcomeType,
      rescuedCrewCount: rescued,
      completedTasksCount: 4,
      timeLeftSeconds: remainingTimeAfterTravel,
      finalScore: scoreData.total,
      scoreBreakdown: scoreData.breakdown,
    }));
    onFinalizeMission();
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Decision Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]">public</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">AŞAMA 4 // ORTAK KURTARMA KARARI</span>
        </div>
        <h2 className="font-display-hero-mobile text-2xl font-black text-on-surface tracking-tight leading-none mt-1">
          Son karar <span className="text-primary-container drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">sizin</span>
        </h2>
        <p className="text-xs text-[#d5c4ac] leading-snug">
          Tahsis edilen enerjiye ({netThrust} MW İtki, {netShield} MW Kalkan) uygun kaçış rotasını seçin ve onaylayın.
        </p>
      </div>

      {/* 3 Interactive Route Cards */}
      <div className="flex flex-col gap-2">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const meetsThrust = netThrust >= route.powerRequirements.itki;
          const meetsShield = netShield >= route.powerRequirements.kalkan;
          const isRouteViable = meetsThrust && meetsShield && hasLifePower;

          return (
            <div
              key={route.id}
              onClick={() => handleSelectRoute(route.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                isSelected 
                  ? 'bg-[#1c192c] border-[#ffb703] shadow-[0_0_16px_rgba(255,183,3,0.3)] ring-1 ring-[#ffb703]' 
                  : 'bg-[#0f0c1e] border-white/5 hover:bg-[#141123]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#ffb703] bg-[#ffb703]' : 'border-white/30'}`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                  </span>
                  <span className="font-sora text-sm font-bold text-white">{route.name}</span>
                </div>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  route.crewCount === 10 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                }`}>
                  {route.crewCount} / 10 KİŞİ
                </span>
              </div>

              {/* Details: Captain vs Engineer Perspectives */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-white/5">
                <div className="flex flex-col text-[#d5c4ac]">
                  <span>Yolculuk: <b className="text-white">{route.travelTimeMin}</b></span>
                  <span>Kurtarılan: <b className="text-white">{route.crewCount} Mürettebat</b></span>
                </div>
                <div className="flex flex-col text-[#d5c4ac]">
                  <span>Gereken İtki: <b className={meetsThrust ? 'text-emerald-400' : 'text-rose-400'}>{route.powerRequirements.itki} MW</b></span>
                  <span>Gereken Kalkan: <b className={meetsShield ? 'text-emerald-400' : 'text-rose-400'}>{route.powerRequirements.kalkan} MW</b></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-[#d5c4ac]">{route.dangerDesc}</span>
                <span className={`font-bold font-mono ${isRouteViable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isRouteViable ? '✓ GÜÇ UYGUN' : '⚠ YETERSİZ GÜÇ'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Energy Status Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0f0c1e] border border-white/10 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#d5c4ac] font-bold uppercase">KİLİTLENMİŞ NET ENERJİ</span>
          <span className={`font-bold ${isEnergyLocked ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isEnergyLocked ? 'KİLİTLENDİ // AKTİF' : 'KİLİTLENMEDİ'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5">
            <span className="text-[10px] text-[#d5c4ac] block">Yaşam</span>
            <span className={`font-bold ${netLife >= 3 ? 'text-emerald-400' : 'text-rose-400'}`}>{netLife} MW</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5">
            <span className="text-[10px] text-[#d5c4ac] block">İtki</span>
            <span className={`font-bold ${hasThrustPower ? 'text-emerald-400' : 'text-rose-400'}`}>{netThrust} MW</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5">
            <span className="text-[10px] text-[#d5c4ac] block">Kalkan</span>
            <span className={`font-bold ${hasShieldPower ? 'text-emerald-400' : 'text-rose-400'}`}>{netShield} MW</span>
          </div>
        </div>
      </div>

      {/* Team Approval Strip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <span className="text-[#d5c4ac] font-bold uppercase">HER İKİ OYUNCUNUN ONAYI</span>
          <span className="text-[#ffb703]">ÇİFT ONAY KURALI</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Captain Approval Button */}
          <button
            type="button"
            onClick={myRole === 'kaptan' ? handleToggleMyApproval : handleSimulatePartnerApproval}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
              captainApproved 
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                : 'bg-[#1c192c] border-white/5 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2b273b] flex items-center justify-center text-[#ffb703]">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs text-white font-bold">Kaptan Onayı</span>
              <span className={`text-[10px] font-mono font-bold ${captainApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {captainApproved ? 'ONAYLANDI' : 'BEKLENİYOR'}
              </span>
            </div>
          </button>

          {/* Engineer Approval Button */}
          <button
            type="button"
            onClick={myRole === 'muhendis' ? handleToggleMyApproval : handleSimulatePartnerApproval}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
              engineerApproved 
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                : 'bg-[#1c192c] border-white/5 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2b273b] flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[20px]">build</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs text-white font-bold">Mühendis Onayı</span>
              <span className={`text-[10px] font-mono font-bold ${engineerApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {engineerApproved ? 'ONAYLANDI' : 'BEKLENİYOR'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs leading-relaxed animate-fadeIn">
          {validationError}
        </div>
      )}

      {/* Final Action Trigger */}
      <div className="mt-1 pb-4">
        <button 
          type="button"
          onClick={handleConfirmRescue}
          disabled={!bothApproved}
          className={`w-full h-14 rounded-2xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            bothApproved
              ? 'bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 cursor-pointer'
              : 'bg-[#2b273b] text-[#d5c4ac] opacity-50 cursor-not-allowed border border-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">verified</span>
          <span>{bothApproved ? `Kurtarmayı Başlat (${activeRoute.name})` : 'İki Oyuncunun Onayı Bekleniyor'}</span>
        </button>
      </div>

    </div>
  );
};
