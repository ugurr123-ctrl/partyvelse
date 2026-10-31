import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen12AirlockEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { airlock } = state;
  const { isSolved } = airlock;

  // Dial Levels: 0: %50 DENGEDE, 1: %75 BASINÇLI, 2: %100 TAHLİYE, 3: %25 DÜŞÜK
  const dialLevels = [
    { deg: 0, text: '%50 DENGEDE', val: 50 },
    { deg: 90, text: '%75 BASINÇLI', val: 75 },
    { deg: 180, text: '%100 TAHLİYE', val: 100 },
    { deg: 270, text: '%25 DÜŞÜK', val: 25 },
  ];

  // Starts from engineer initial settings (which are intentionally NOT the target!)
  const [dialIndex, setDialIndex] = useState(airlock.engineerDialIndex >= 0 ? airlock.engineerDialIndex : 2);
  const [isSealLocked, setIsSealLocked] = useState(airlock.engineerSealLocked ?? false);
  const [vacuumPower, setVacuumPower] = useState(airlock.engineerVacuumPower ?? 20);

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isSolved ? 'success' : 'idle',
    msg: isSolved ? 'Hava kilidi valf ve mandalları başarıyla devreye sokuldu!' : '',
  });

  const handleRotateDial = () => {
    if (isSolved) return;
    const nextIdx = (dialIndex + 1) % dialLevels.length;
    setDialIndex(nextIdx);
    onAction?.('airlock_set_params', { dialIndex: nextIdx, sealLocked: isSealLocked, vacuumPower });
  };

  const handleToggleLever = () => {
    if (isSolved) return;
    const nextSeal = !isSealLocked;
    setIsSealLocked(nextSeal);
    onAction?.('airlock_set_params', { dialIndex, sealLocked: nextSeal, vacuumPower });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSolved) return;
    const nextPower = Number(e.target.value);
    setVacuumPower(nextPower);
    onAction?.('airlock_set_params', { dialIndex, sealLocked: isSealLocked, vacuumPower: nextPower });
  };

  const calculatedPressure = (1.5 + (vacuumPower / 100) * 1.8).toFixed(2);

  const handleEngageAirlock = () => {
    if (isSolved) return;

    if (onAction) {
      onAction('airlock_verify', {
        dialIndex,
        sealLocked: isSealLocked,
        vacuumPower,
      });
      return;
    }

    // Local demo fallback
    const isDialOk = dialIndex === airlock.targetDialIndex;
    const isLeverOk = isSealLocked === airlock.targetSealLocked;
    const isVacuumOk = vacuumPower >= airlock.targetVacuumMin && vacuumPower <= airlock.targetVacuumMax;

    if (isDialOk && isLeverOk && isVacuumOk) {
      setFeedback({
        type: 'success',
        msg: 'VALF VE KİLİT SENKRONİZE EDİLDİ! Dış kapak güvenle çözüldü, dekompresyon sağlandı.',
      });
      onUpdate((prev) => ({
        ...prev,
        airlock: {
          ...prev.airlock,
          engineerDialIndex: dialIndex,
          engineerSealLocked: isSealLocked,
          engineerVacuumPower: vacuumPower,
          isSolved: true,
        },
      }));
    } else {
      let reason = 'BASINÇ HATASI! ';
      if (!isDialOk) reason += `Valf yanlış konumda (Mevcut: ${dialLevels[dialIndex].text}). `;
      if (!isLeverOk) reason += `Sızdırmazlık mandalı ${isSealLocked ? 'serbest bırakılmalı' : 'kilitlenmeli'}. `;
      if (!isVacuumOk) reason += `Vakum gücü hatalı (Hedef aralık: ${airlock.targetVacuumMin}-${airlock.targetVacuumMax}). `;

      setFeedback({
        type: 'error',
        msg: `${reason}Kabin bütünlüğü -%10, Süre -15 sn!`,
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

  const currentDial = dialLevels[dialIndex];

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Sub-header */}
      <div className="pt-1 flex flex-col gap-1">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30">
          <span className="material-symbols-outlined text-[15px]">mode_fan</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS // BASINÇ VE VALF KONTROLÜ</span>
        </div>
        <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">Hava kilidini kur</h2>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Kaptanından aldığın prosedür talimatlarına göre döngü valfini, mandalı ve vakumu ayarla.
        </p>
      </div>

      {/* Control Console */}
      <div className="mt-2 bg-[#0f0c1e] p-3.5 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-xl">
        
        {/* Dial & Lever Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Dial */}
          <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center justify-between">
            <span className="text-[10px] font-mono text-[#d5c4ac] uppercase font-bold">BİRİNCİL DÖNGÜ VALFİ</span>
            <button
              type="button"
              onClick={handleRotateDial}
              className="w-18 h-18 rounded-full bg-[#2b273b] border border-white/10 shadow-[0_4px_0_#0f0c1e] active:translate-y-1 flex items-center justify-center cursor-pointer my-2 transition-transform"
            >
              <div 
                className="w-3 h-9 rounded-full bg-[#3a374b] flex flex-col items-center justify-start pt-1 shadow transition-transform duration-300"
                style={{ transform: `rotate(${currentDial.deg}deg)` }}
              >
                <div className="w-1.5 h-2 rounded bg-[#00eefc]"></div>
              </div>
            </button>
            <span className="font-mono text-xs font-bold text-[#00eefc]">{currentDial.text}</span>
          </div>

          {/* Seal Lever */}
          <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center justify-between">
            <span className="text-[10px] font-mono text-[#d5c4ac] uppercase font-bold">SIZDIRMAZLIK MANDALI</span>
            <button
              type="button"
              onClick={handleToggleLever}
              className={`w-14 h-20 rounded-xl p-1 flex flex-col items-center transition-all cursor-pointer border ${
                isSealLocked ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'
              }`}
            >
              <div className={`w-full h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isSealLocked ? 'bg-emerald-500 text-black' : 'bg-transparent text-white/30'
              }`}>
                KİLİT
              </div>
              <div className={`w-full h-8 rounded-lg flex items-center justify-center font-bold text-xs mt-auto ${
                !isSealLocked ? 'bg-rose-500 text-white' : 'bg-transparent text-white/30'
              }`}>
                AÇIK
              </div>
            </button>
            <span className={`font-mono text-xs font-bold ${isSealLocked ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isSealLocked ? 'KİLİTLİ (YUKARI)' : 'SERBEST (AŞAĞI)'}
            </span>
          </div>
        </div>

        {/* Vacuum Power Slider */}
        <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#d5c4ac] uppercase font-bold">VAKUM POMPASI GÜCÜ</span>
            <span className="font-mono text-xs text-[#ffb703] font-bold">
              %{vacuumPower} ({calculatedPressure} Bar)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={vacuumPower}
            onChange={handleSliderChange}
            className="w-full accent-[#ffb703] cursor-pointer"
          />

          <div className="flex items-center justify-between text-[9px] font-mono text-[#d5c4ac]">
            <span>0% Düşük</span>
            <span>Nominal: {airlock.targetVacuumMin > 0 ? `${airlock.targetVacuumMin} - ${airlock.targetVacuumMax}%` : 'Kaptanın Belirttiği Aralık'}</span>
            <span>100% Aşırı</span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {activeFeedback.msg && (
        <div className={`mt-2 p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          activeFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {activeFeedback.msg}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2 flex flex-col gap-2">
        {!isSolved ? (
          <button
            onClick={handleEngageAirlock}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">air</span>
            <span>Basınç Döngüsünü Devreye Sok</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>HAVA KİLİDİ AKTİF • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
