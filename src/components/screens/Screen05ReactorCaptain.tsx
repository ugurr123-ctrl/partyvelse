import React, { useState } from 'react';
import { MissionState, ENVIRONMENTS } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen05ReactorCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { diagnostic, activeEnvironment } = state;
  const envInfo = ENVIRONMENTS[activeEnvironment];

  const [selectedBreaker, setSelectedBreaker] = useState<'K1' | 'K2' | 'K3' | 'K4'>(
    diagnostic.captainSelectedBreaker || diagnostic.correctBreaker
  );
  const [activeModule, setActiveModule] = useState<'reaktor' | 'anten' | 'yasam' | 'kargo'>('reaktor');
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: diagnostic.isSolved ? 'success' : 'idle',
    msg: diagnostic.isSolved ? `${diagnostic.correctBreaker} Kesicisi Devre Dışı Bırakıldı • Reaktör Kararlı` : '',
  });

  const handleSelectBreaker = (id: 'K1' | 'K2' | 'K3' | 'K4') => {
    if (diagnostic.isSolved) return;
    setSelectedBreaker(id);
    onUpdate((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        captainSelectedBreaker: id,
      },
    }));
  };

  const handleUnlockAction = () => {
    if (diagnostic.isSolved) return;

    if (onAction) {
      onAction('diagnostic_captain_breaker', { breaker: selectedBreaker });
      return;
    }

    if (selectedBreaker === diagnostic.correctBreaker) {
      const willSolve = diagnostic.engineerActionTaken;
      setFeedback({
        type: 'success',
        msg: willSolve 
          ? `GÜVENLİK KİLİDİ AÇILDI! ${selectedBreaker} kesicisi arızalı hattı başarıyla izole etti. Reaktör dengelendi!`
          : `GÜVENLİK KİLİDİ AÇILDI (${selectedBreaker})! Mühendisin fiziksel soğutma/tahliye müdahalesi bekleniyor.`,
      });
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          captainSelectedBreaker: selectedBreaker,
          isSolved: willSolve,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `HATALI KESİCİ (${selectedBreaker})! Arızalı hat yerine sağlam hat kesildi. Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const isUnlocked = diagnostic.captainSelectedBreaker === diagnostic.correctBreaker;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      <div className="w-full flex flex-col gap-3.5 pt-1">
        
        {/* Sub-header & Role Indicator */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.3)]">
              <span className="material-symbols-outlined text-[16px]">military_tech</span>
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN</span>
            </div>
            <span className="text-[10px] font-mono text-[#00eefc] px-2 py-0.5 rounded bg-[#00eefc]/10">
              {envInfo.badge}
            </span>
          </div>
          <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight leading-tight">
            Arızayı <span className="text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.5)]">birlikte</span> bulun
          </h2>
        </div>

        {/* Isometric Space Station Orbital Schematic Card */}
        <div className="relative w-full rounded-2xl bg-[#0f0c1e] overflow-hidden shadow-2xl border border-white/10">
          <div className="relative w-full aspect-[4/3] bg-[#0f0c1e]">
            <img 
              className="w-full h-full object-cover opacity-85" 
              alt="Orbital space station schematic" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIHMEgC5C7kGHcn_HJmOd7MlHuA_nJBzKWk36tzUwESgxtCLKnICNBKYG0j99Mj0Pwn2CZTVxcumWrlk3Dute3DbgvDT8fRUq-9IZqTNYhxxsVxnaFf6F_i1IDO5qyydtu0sl5XqzVRsj0TB-AnjkM01MZ8wFhtUPk5ngYvLptut4V1Yw_2tjHhdq7U8FR5RtX8RV7YjuGL-dMXlMv_dpbNyj01qpD8z6DcncrRq0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-transparent to-transparent"></div>

            {/* Node: Anten (Top-Left) */}
            <button 
              onClick={() => setActiveModule('anten')}
              className={`group absolute top-5 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer ${
                activeModule === 'anten' ? 'bg-cyan-500/30 border border-[#00eefc]' : 'bg-[#2b273b]/90 border border-white/10'
              }`} 
              type="button"
            >
              <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-[#00eefc]">
                <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
              </div>
              <span className="font-mono text-[10px] text-white">Anten ({diagnostic.lineBreakerMap.anten})</span>
            </button>

            {/* Node: Yaşam Modülü (Top-Right) */}
            <button 
              onClick={() => setActiveModule('yasam')}
              className={`group absolute top-6 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer ${
                activeModule === 'yasam' ? 'bg-cyan-500/30 border border-[#00eefc]' : 'bg-[#2b273b]/90 border border-white/10'
              }`} 
              type="button"
            >
              <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-[#00eefc]">
                <span className="material-symbols-outlined text-[14px]">eco</span>
              </div>
              <span className="font-mono text-[10px] text-white">Soğutma ({diagnostic.lineBreakerMap.sogutucu})</span>
            </button>

            {/* Node: Reaktör (Bottom-Left) */}
            <div 
              onClick={() => setActiveModule('reaktor')}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#363246] shadow-[0_0_16px_rgba(255,183,3,0.4)] border border-[#ffb703] cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-[#ffb703] text-[#422c00] flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>detector_battery</span>
              </div>
              <span className="font-mono text-[10px] text-[#ffb703] font-bold">Reaktör ({diagnostic.lineBreakerMap.reaktor})</span>
              <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping ml-0.5"></span>
            </div>

            {/* Node: Kargo/Yönlendirme (Bottom-Right) */}
            <button 
              onClick={() => setActiveModule('kargo')}
              className={`group absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer ${
                activeModule === 'kargo' ? 'bg-cyan-500/30 border border-[#00eefc]' : 'bg-[#2b273b]/90 border border-white/10'
              }`} 
              type="button"
            >
              <div className="w-6 h-6 rounded bg-[#363246] flex items-center justify-center text-[#d5c4ac]">
                <span className="material-symbols-outlined text-[14px]">grid_view</span>
              </div>
              <span className="font-mono text-[10px] text-[#d5c4ac]">Yönlendirme ({diagnostic.lineBreakerMap.yonlendirme})</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Criteria Plaque (Dynamic according to Station Environment) */}
        <div className="w-full rounded-2xl bg-[#1c192c] p-3.5 flex flex-col gap-2.5 shadow-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#ffb703]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffdba0] font-bold">
                {envInfo.name.toUpperCase()} ARIZA KURALI
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">
              KAPTAN KILAVUZU
            </span>
          </div>

          <div className="text-xs text-[#e6dff9] font-medium leading-relaxed bg-[#201d30] p-2.5 rounded-xl border border-white/5">
            {envInfo.conditionNote}
          </div>

          {/* 3 Diagnostic Reference Pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#ffdba0] text-[18px] mb-0.5">thermostat</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Isı Kriteri</span>
              <span className="font-sora text-xs text-[#ffdba0] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≤ -10°C' : '≥ 80°C'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px] mb-0.5">speed</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Basınç Kriteri</span>
              <span className="font-sora text-xs text-[#00eefc] font-bold">
                {activeEnvironment === 'buzul_istasyonu' ? '≥ 70 kPa' : '≤ 40 kPa'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#dab5ff] text-[18px] mb-0.5">airwave</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Parazit Kriteri</span>
              <span className="font-sora text-xs text-[#dab5ff] font-bold">≥ 65 dB</span>
            </div>
          </div>
        </div>

        {/* Partner Banner / Remote Teammate Readout */}
        <div className="w-full px-4 py-2.5 rounded-xl bg-[#2b273b] flex items-center justify-between shadow-md border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00eefc]/20 flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[18px]">build</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#d5c4ac]">Mühendis Durumu</span>
              <span className="font-mono text-xs font-bold text-white">
                {diagnostic.engineerActionTaken ? (
                  <span className="text-emerald-400">
                    Fiziksel Tahliye Uygulandı ({diagnostic.engineerSuggestedLine?.toUpperCase() || ''})
                  </span>
                ) : (
                  <span className="text-[#00eefc]">Ölçüm alıyor / İletişim bekleniyor</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#d5c4ac]">
            <span className={`w-2 h-2 rounded-full ${diagnostic.engineerActionTaken ? 'bg-emerald-400' : 'bg-[#00eefc] animate-ping'}`}></span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </div>

        {/* Breaker Selection Console */}
        <div className="w-full rounded-2xl bg-[#0f0c1e] p-3.5 flex flex-col gap-3 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] uppercase text-[#d5c4ac] tracking-wider font-bold">KESİCİ MATRİSİ (K1 - K4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></span>
              <span className="font-mono text-[9px] text-[#ffb703] font-bold uppercase">GÜVENLİK KİLİDİ</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 z-10">
            {(['K1', 'K2', 'K3', 'K4'] as const).map((id) => {
              const isSelected = selectedBreaker === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectBreaker(id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#ffb703]/20 border-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.4)]' 
                      : 'bg-[#201d30] border-white/5 text-[#d5c4ac] hover:bg-[#2b273b]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#ffb703]">
                    {isSelected ? 'toggle_on' : 'toggle_off'}
                  </span>
                  <span className={`font-mono text-xs font-bold mt-1 uppercase ${isSelected ? 'text-[#ffb703]' : 'text-white'}`}>
                    {id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alert if any */}
        {(state.feedbackMessage || feedback.msg) && (
          <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
            (state.feedbackState === 'success' || (!state.feedbackState && feedback.type === 'success'))
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {state.feedbackMessage || feedback.msg}
          </div>
        )}

        {/* Primary Action Button */}
        {!diagnostic.isSolved ? (
          <div className="w-full flex flex-col items-center gap-1.5 pt-1">
            <button
              onClick={handleUnlockAction}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#6b4b00] transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isUnlocked ? 'lock_open' : 'lock'}
              </span>
              <span>{isUnlocked ? `${selectedBreaker} Açıldı (Mühendis Bekleniyor)` : `${selectedBreaker} Güvenlik Kilidini Aç`}</span>
            </button>
            <div className="flex items-center gap-1.5 text-rose-400 mt-0.5">
              <span className="material-symbols-outlined text-[15px]">report</span>
              <span className="text-[11px] font-mono">Yanlış kesici bütünlüğü ve süreyi düşürür</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}

      </div>
    </div>
  );
};
