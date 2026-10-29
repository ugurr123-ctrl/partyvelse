import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen05ReactorCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const [selectedBreaker, setSelectedBreaker] = useState<'K1' | 'K2' | 'K3' | 'K4'>(
    state.diagnostic.captainSelectedBreaker || 'K3'
  );
  const [activeModule, setActiveModule] = useState<'reaktor' | 'anten' | 'yasam' | 'kargo'>('reaktor');
  const [isUnlocked, setIsUnlocked] = useState(state.diagnostic.isSolved);
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: state.diagnostic.isSolved ? 'success' : 'idle',
    msg: state.diagnostic.isSolved ? 'K3 Kesicisi Devre Dışı Bırakıldı • Reaktör Kararlı' : '',
  });

  const handleSelectBreaker = (id: 'K1' | 'K2' | 'K3' | 'K4') => {
    if (state.diagnostic.isSolved) return;
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
    if (selectedBreaker === 'K3') {
      setIsUnlocked(true);
      setFeedback({
        type: 'success',
        msg: 'GÜVENLİK KİLİDİ AÇILDI! K3 kesicisi Anten hattını başarıyla izole etti.',
      });
      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          isSolved: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `HATALI KESİCİ (${selectedBreaker})! Yanlış devre açıldı. Bütünlük -%15, Süre -20 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 15),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 20),
      }));
    }
  };

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
              <span className="font-mono text-[10px] text-white">Anten</span>
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
              <span className="font-mono text-[10px] text-white">Yaşam Modülü</span>
            </button>

            {/* Node: Reaktör (Bottom-Left, ACTIVE) */}
            <div 
              onClick={() => setActiveModule('reaktor')}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#363246] shadow-[0_0_16px_rgba(255,183,3,0.4)] border border-[#ffb703] cursor-pointer"
            >
              <div className="w-6 h-6 rounded bg-[#ffb703] text-[#422c00] flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>detector_battery</span>
              </div>
              <span className="font-mono text-[10px] text-[#ffb703] font-bold">Reaktör</span>
              <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping ml-0.5"></span>
            </div>

            {/* Node: Kargo (Bottom-Right) */}
            <button 
              onClick={() => setActiveModule('kargo')}
              className={`group absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer ${
                activeModule === 'kargo' ? 'bg-cyan-500/30 border border-[#00eefc]' : 'bg-[#2b273b]/90 border border-white/10'
              }`} 
              type="button"
            >
              <div className="w-6 h-6 rounded bg-[#363246] flex items-center justify-center text-[#d5c4ac]">
                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              </div>
              <span className="font-mono text-[10px] text-[#d5c4ac]">Kargo</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Criteria Plaque (Captain Telemetry Specs) */}
        <div className="w-full rounded-2xl bg-[#1c192c] p-3.5 flex flex-col gap-2.5 shadow-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#ffb703]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffdba0] font-bold">ARIZA KOŞULLARI</span>
            </div>
            <span className="font-mono text-[9px] text-[#d5c4ac] uppercase tracking-widest">KAPTAN DOKÜMANI</span>
          </div>

          {/* 3 Diagnostic Pills */}
          <div className="grid grid-cols-3 gap-2">
            {/* Temp */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#ffdba0] text-[20px] mb-0.5">thermostat</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Isı</span>
              <span className="font-sora text-sm text-[#ffdba0] font-bold">≥ 80°C</span>
            </div>
            {/* Pressure */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#00eefc] text-[20px] mb-0.5">speed</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Basınç</span>
              <span className="font-sora text-sm text-[#00eefc] font-bold">≤ 40 kPa</span>
            </div>
            {/* Parazit */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#201d30] shadow-inner border border-white/5">
              <span className="material-symbols-outlined text-[#dab5ff] text-[20px] mb-0.5">airwave</span>
              <span className="font-mono text-[9px] text-[#d5c4ac] mb-0.5">Parazit</span>
              <span className="font-sora text-sm text-[#dab5ff] font-bold">≥ 65 dB</span>
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
              <span className="text-[10px] text-[#d5c4ac]">Bağlantılı Görevli</span>
              <span className="font-mono text-xs font-bold text-white">
                Mühendis: <span className="text-[#00eefc]">{state.diagnostic.engineerSuggestedLine ? state.diagnostic.engineerSuggestedLine.toUpperCase() + ' hattı' : 'Anten hattı'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#d5c4ac]">
            <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </div>

        {/* Power Circuit Schematic Console (GÜÇ DEVRESİ ŞEMASI) */}
        <div className="w-full rounded-2xl bg-[#0f0c1e] p-3.5 flex flex-col gap-3 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ffb703]/10 blur-3xl pointer-events-none rounded-full"></div>
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] uppercase text-[#d5c4ac] tracking-wider font-bold">GÜÇ DEVRESİ ŞEMASI</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></span>
              <span className="font-mono text-[9px] text-[#ffb703] font-bold uppercase">CANLI AKIM</span>
            </div>
          </div>

          {/* Core & Circuit Schematic Visual Canvas */}
          <div className="relative w-full flex flex-col items-center z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#2b273b] flex items-center justify-center shadow-[0_0_24px_rgba(255,183,3,0.4)] relative border border-[#ffb703]/50">
              <div className="absolute inset-1 rounded-xl bg-[#ffb703]/20 animate-pulse"></div>
              <span className="material-symbols-outlined text-[24px] text-[#ffb703] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>detector_battery</span>
            </div>

            {/* Bus Conduit Lines (Inline SVG) */}
            <svg className="w-full h-14 stroke-current" fill="none" viewBox="0 0 320 64" xmlns="http://www.w3.org/2000/svg">
              <path className="text-[#ffb703]" d="M160 0 V24" strokeLinecap="round" strokeWidth="4"></path>
              <path className="text-[#363246]" d="M40 24 H280" strokeLinecap="round" strokeWidth="3"></path>
              <path className="text-[#363246]" d="M40 24 V64" strokeLinecap="round" strokeWidth="3"></path>
              <path className="text-[#363246]" d="M120 24 V64" strokeLinecap="round" strokeWidth="3"></path>
              <path className="text-[#ffb703]" d="M160 24 H200 V64" strokeDasharray="4 2" strokeLinecap="round" strokeWidth="4"></path>
              <path className="text-[#00eefc]/40" d="M280 24 V64" strokeLinecap="round" strokeWidth="3"></path>
            </svg>

            {/* 4 Breaker / Switch Pods (K1, K2, K3, K4) */}
            <div className="grid grid-cols-4 gap-2 w-full pt-1">
              {(['K1', 'K2', 'K3', 'K4'] as const).map((id) => {
                const isSelected = selectedBreaker === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectBreaker(id)}
                    className={`breaker-card flex flex-col items-center py-2.5 px-1 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ffb703]/20 shadow-[0_0_18px_rgba(255,183,3,0.35)] border border-[#ffb703]'
                        : 'bg-[#2b273b] hover:bg-[#363246] border border-white/5 active:translate-y-1'
                    }`}
                    type="button"
                  >
                    <div className={`w-7 h-14 rounded-md flex flex-col items-center p-1 ${
                      isSelected 
                        ? 'bg-[#ffb703] justify-end shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]' 
                        : 'bg-[#201d30] justify-start shadow-inner'
                    }`}>
                      <div className={`w-5 h-7 rounded ${isSelected ? 'bg-[#422c00] flex items-center justify-center' : 'bg-[#363246]'}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#ffdba0] animate-ping"></span>}
                      </div>
                    </div>
                    <span className={`font-mono text-xs font-bold mt-1.5 uppercase ${isSelected ? 'text-[#ffb703]' : 'text-[#d5c4ac]'}`}>
                      {id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback Alert if any */}
        {feedback.msg && (
          <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
            feedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Primary Action Button */}
        {!state.diagnostic.isSolved ? (
          <div className="w-full flex flex-col items-center gap-1.5 pt-1">
            <button
              onClick={handleUnlockAction}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#6b4b00] transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isUnlocked ? 'lock_open' : 'lock'}
              </span>
              <span>{isUnlocked ? 'Kilit Açıldı (Devre İzole)' : 'Güvenlik kilidini aç'}</span>
            </button>
            <div className="flex items-center gap-1.5 text-rose-400 mt-0.5">
              <span className="material-symbols-outlined text-[15px]">report</span>
              <span className="text-[11px] font-mono">Yanlış müdahale bütünlüğü azaltır</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onAdvancePhase}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}

        {/* Tactical Sector Switcher Dock (4 Bottom Station Navigation Tabs) */}
        <div className="w-full rounded-xl bg-[#1c192c] p-1.5 grid grid-cols-4 gap-1 shadow-xl border border-white/5">
          <button 
            onClick={() => setActiveModule('reaktor')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeModule === 'reaktor' ? 'bg-[#363246] text-[#ffb703] shadow-md font-bold' : 'text-[#d5c4ac] hover:bg-[#201d30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">adjust</span>
            <span className="font-mono text-[9px] mt-0.5">Reaktör</span>
          </button>
          <button 
            onClick={() => setActiveModule('anten')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeModule === 'anten' ? 'bg-[#363246] text-[#00eefc] shadow-md font-bold' : 'text-[#d5c4ac] hover:bg-[#201d30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings_input_antenna</span>
            <span className="font-mono text-[9px] mt-0.5">Anten</span>
          </button>
          <button 
            onClick={() => setActiveModule('yasam')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeModule === 'yasam' ? 'bg-[#363246] text-[#00eefc] shadow-md font-bold' : 'text-[#d5c4ac] hover:bg-[#201d30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">spa</span>
            <span className="font-mono text-[9px] mt-0.5">Yaşam</span>
          </button>
          <button 
            onClick={() => setActiveModule('kargo')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
              activeModule === 'kargo' ? 'bg-[#363246] text-[#00eefc] shadow-md font-bold' : 'text-[#d5c4ac] hover:bg-[#201d30]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span className="font-mono text-[9px] mt-0.5">Kargo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
