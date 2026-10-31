import React, { useState } from 'react';
import { MissionState } from '../../types/game';
import { isLineAnomaly } from '../../services/gameFactory';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
}

export const Screen06ReactorEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { diagnostic, activeEnvironment } = state;
  const [activeCartridge, setActiveCartridge] = useState<'CIR-01' | 'CIR-02' | 'CIR-03' | 'CIR-04'>('CIR-03');
  const [coolingValveAngle, setCoolingValveAngle] = useState(45);
  const [pressureThrottleToggled, setPressureThrottleToggled] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: diagnostic.isSolved ? 'success' : 'idle',
    msg: diagnostic.isSolved ? 'Reaktör basınca tahliye edildi! Devreler stabil.' : '',
  });

  const cartridgeToLineMap: Record<'CIR-01' | 'CIR-02' | 'CIR-03' | 'CIR-04', 'reaktor' | 'sogutucu' | 'anten' | 'yonlendirme'> = {
    'CIR-01': 'reaktor',
    'CIR-02': 'sogutucu',
    'CIR-03': 'anten',
    'CIR-04': 'yonlendirme',
  };

  const lineNames: Record<string, string> = {
    reaktor: 'Ana Reaktör',
    sogutucu: 'Soğutucu Çekirdek',
    anten: 'Yüksek Kazançlı Anten',
    yonlendirme: 'İtki ve Yönlendirme',
  };

  const selectedLineKey = cartridgeToLineMap[activeCartridge];
  const selectedTelemetry = diagnostic.lines[selectedLineKey];

  const handleRotateCooling = () => {
    setCoolingValveAngle((prev) => (prev === 45 ? 135 : prev === 135 ? -45 : 45));
  };

  const handleToggleThrottle = () => {
    setPressureThrottleToggled((prev) => !prev);
  };

  const handlePurgePressure = () => {
    if (diagnostic.isSolved) return;

    // Check if the currently selected cartridge corresponds to the actual faulty line
    const isAnomalous = isLineAnomaly(activeEnvironment, selectedTelemetry);
    const isTargetFaulty = selectedLineKey === diagnostic.faultyLine;

    if (isTargetFaulty && isAnomalous) {
      const willSolve = diagnostic.captainSelectedBreaker === diagnostic.correctBreaker;

      setFeedback({
        type: 'success',
        msg: willSolve 
          ? `MÜDAHALE TAMAMLANDI! ${lineNames[selectedLineKey]} hattı soğutuldu ve tahliye edildi. Reaktör dengelendi!`
          : `MÜDAHALE İLETİLDİ! ${lineNames[selectedLineKey]} izole edildi. Kaptanın ${diagnostic.correctBreaker} kesicisini açması bekleniyor.`,
      });

      onUpdate((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          engineerSuggestedLine: selectedLineKey,
          engineerActionTaken: true,
          isSolved: willSolve,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `HATALI HAT (${lineNames[selectedLineKey]})! Bu hatta anomali bulunmuyor. Yanlış tahliye: Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-header & Role Identification */}
      <div className="pt-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">build</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS KONSOLU</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#2b273b] border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping"></span>
            <span className="font-mono text-[9px] text-rose-300 font-bold uppercase">CANLI TELEMETRİ</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sora text-2xl font-bold text-white tracking-tight">Reaktörü</span>
          <span className="font-sora text-2xl font-extrabold text-[#00eefc] tracking-tight drop-shadow-[0_0_12px_rgba(0,238,252,0.4)]">dengele</span>
        </div>
      </div>

      {/* Reactor Centerpiece & Circuit Array Stage */}
      <div className="relative mt-2">
        <div className="relative w-full rounded-2xl bg-[#0f0c1e] overflow-hidden shadow-2xl p-2 border border-white/10">
          <div 
            className="w-full h-72 rounded-xl bg-cover bg-center relative overflow-hidden flex items-center justify-center shadow-inner" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQp7LKUYjGCeLCIyJBpt6ky7NN_yjlBF0LWkNy8c9HwNVHsUF4hKFGWKFjkaq3gTMS_G6gve35xaOn3HcZexf7iKy8dfbuX9ZiFQUjd8sWUqDFnEZvv3vXt4m4i7pEgX3sa5X7bBE0_0d0ss-pf6RwWTsVBlpurVqKGlINrYlem0nf8Ppqx3iFbouAojK0oQNh98_3VCl2leYdgrnOm6lcYasBaqTjJxp52rSyOl0')" }}
          >
            {/* 2.5D Core Turbine Center Hub */}
            <div className="relative z-20 w-20 h-20 rounded-full bg-[#2b273b] flex items-center justify-center shadow-[0_0_24px_rgba(255,183,3,0.45)] border border-[#ffb703]/50">
              <div className="w-14 h-14 rounded-full bg-[#0f0c1e] flex items-center justify-center">
                <span className="material-symbols-outlined text-[30px] text-[#ffb703] animate-spin" style={{ animationDuration: '9s' }}>cyclone</span>
              </div>
            </div>

            {/* CIR-01 Top */}
            <button 
              onClick={() => setActiveCartridge('CIR-01')}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-01' ? 'border-[#00eefc] ring-1 ring-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-01 (Reaktör)</span>
              </div>
            </button>

            {/* CIR-02 Top Left */}
            <button 
              onClick={() => setActiveCartridge('CIR-02')}
              className="absolute top-14 left-4 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-02' ? 'border-[#00eefc] ring-1 ring-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-02 (Soğutucu)</span>
              </div>
            </button>

            {/* CIR-03 Top Right */}
            <button 
              onClick={() => setActiveCartridge('CIR-03')}
              className="absolute top-14 right-4 z-20 flex flex-col items-end cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-03' ? 'border-[#00eefc] ring-1 ring-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-03 (Anten)</span>
              </div>
            </button>

            {/* CIR-04 Bottom Left */}
            <button 
              onClick={() => setActiveCartridge('CIR-04')}
              className="absolute bottom-6 left-6 z-20 flex flex-col items-center cursor-pointer"
            >
              <div className={`px-2 py-1 rounded bg-[#2b273b] shadow-md flex items-center gap-1 border ${activeCartridge === 'CIR-04' ? 'border-[#00eefc] ring-1 ring-[#00eefc]' : 'border-white/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">CIR-04 (Yönlendirme)</span>
              </div>
            </button>
          </div>

          {/* Real Live Telemetry of Selected Line */}
          <div className="w-full mt-2 bg-[#1c192c] p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{activeCartridge} // {lineNames[selectedLineKey]}</span>
              <span className="text-[#00eefc]">CANLI SENSÖR</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#201d30] p-2 flex flex-col items-center justify-center border border-white/5">
                <span className="text-[9px] text-[#d5c4ac] mb-0.5">SICAKLIK</span>
                <span className={`text-sm font-bold ${selectedTelemetry.temp >= 80 || selectedTelemetry.temp <= -10 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-[#ffdba0]'}`}>
                  {selectedTelemetry.temp}°C
                </span>
              </div>
              <div className="rounded-xl bg-[#201d30] p-2 flex flex-col items-center justify-center border border-white/5">
                <span className="text-[9px] text-[#d5c4ac] mb-0.5">BASINÇ</span>
                <span className={`text-sm font-bold ${selectedTelemetry.press <= 40 || selectedTelemetry.press >= 70 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-[#00eefc]'}`}>
                  {selectedTelemetry.press} kPa
                </span>
              </div>
              <div className="rounded-xl bg-[#201d30] p-2 flex flex-col items-center justify-center border border-white/5">
                <span className="text-[9px] text-[#d5c4ac] mb-0.5">PARAZİT</span>
                <span className={`text-sm font-bold ${selectedTelemetry.noise >= 65 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-[#dab5ff]'}`}>
                  {selectedTelemetry.noise} dB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mechanical Dual Controls */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {/* Rotary Knob Valve: Soğutma Valfi */}
        <div className="rounded-2xl bg-[#201d30] p-3 flex flex-col justify-between shadow-lg border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[16px]">mode_fan</span>
            </div>
            <span className="font-mono text-[10px] text-white uppercase font-bold">Soğutma Valfi</span>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <button 
              onClick={handleRotateCooling}
              className="w-16 h-16 rounded-full bg-[#2b273b] shadow-[0_4px_0_#0f0c1e] active:translate-y-1 flex items-center justify-center transition-transform cursor-pointer border border-white/10"
              type="button"
            >
              <div 
                className="w-3 h-8 rounded-full bg-[#3a374b] flex flex-col items-center justify-start pt-1 shadow transition-transform duration-300"
                style={{ transform: `rotate(${coolingValveAngle}deg)` }}
              >
                <div className="w-1.5 h-2 rounded bg-[#00eefc]"></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between px-1 font-mono text-[9px] text-[#d5c4ac]">
            <span>KONUM</span>
            <span className="text-[#00eefc] font-bold">{coolingValveAngle}° AÇIK</span>
          </div>
        </div>

        {/* Vertical Throttle: Basınç Tahliye */}
        <div className="rounded-2xl bg-[#201d30] p-3 flex flex-col justify-between shadow-lg border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703]">
              <span className="material-symbols-outlined text-[16px]">air</span>
            </div>
            <span className="font-mono text-[10px] text-white uppercase font-bold">Basınç Tahliye</span>
          </div>

          <div 
            onClick={handleToggleThrottle}
            className="relative w-full h-20 my-1 rounded-xl bg-[#0f0c1e] flex justify-center items-center shadow-inner overflow-hidden p-1 cursor-pointer"
          >
            <div className="w-12 h-10 rounded-lg bg-[#363246] shadow-[0_4px_0_#0f0c1e] flex flex-col items-center justify-center p-1 transition-all">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">
                {pressureThrottleToggled ? 'check' : 'keyboard_double_arrow_up'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 font-mono text-[9px] text-[#d5c4ac]">
            <span>DURUM</span>
            <span className="text-[#ffb703] font-bold">{pressureThrottleToggled ? 'TAHLİYE AKTİF' : 'BEKLEMEDE'}</span>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback.msg && (
        <div className={`mt-2 p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          feedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Action Trigger */}
      <div className="mt-2 flex flex-col gap-2">
        {!diagnostic.isSolved ? (
          <button
            onClick={handlePurgePressure}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">air</span>
            <span>{activeCartridge} İçin Tahliyeyi İlet</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>REAKTÖR DENGELENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
