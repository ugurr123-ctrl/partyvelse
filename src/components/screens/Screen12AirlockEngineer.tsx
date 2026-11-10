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

  const isDerinBasinc = state.operationTheme === 'derin_basinc';

  // Derin Basınç Elektroliz state
  const [derinVolt, setDerinVolt] = useState(180);
  const [catalystPct, setCatalystPct] = useState(65);
  const [cellSwitches, setCellSwitches] = useState({
    katotA: true,
    katotB: true,
    anotC: true,
  });

  const toggleCellSwitch = (cell: 'katotA' | 'katotB' | 'anotC') => {
    if (airlock.isSolved) return;
    setCellSwitches(prev => ({ ...prev, [cell]: !prev[cell] }));
  };

  const handleStartOxygenProduction = () => {
    // 180V (+- 5V), catalyst >= 60 && <= 70, all 3 cells active
    const voltOk = Math.abs(derinVolt - 180) <= 5;
    const catOk = catalystPct >= 60 && catalystPct <= 70;
    const cellsOk = cellSwitches.katotA && cellSwitches.katotB && cellSwitches.anotC;

    if (voltOk && catOk && cellsOk) {
      if (onAction) {
        onAction('airlock_verify', {
          dialIndex: airlock.targetDialIndex,
          sealLocked: airlock.targetSealLocked,
          vacuumPower: Math.floor((airlock.targetVacuumMin + airlock.targetVacuumMax) / 2),
        });
      }
      onUpdate((prev) => ({
        ...prev,
        airlock: {
          ...prev.airlock,
          isSolved: true,
        },
      }));
    } else {
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* HUD Top Bar Telemetry */}
        <div className="w-full bg-[#1c192c] rounded-xl p-2.5 shadow-md border border-white/5 mt-1">
          <div className="flex items-center justify-between gap-1 pb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[16px]">navigation</span>
              <span className="font-mono text-[9px] text-[#ffba27] uppercase">GÖREV AKIŞI: DERİN BASINÇ</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2b273b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase">TELSİZ CH-02 AKTİF</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1.5">
            <div className="flex flex-col bg-[#201d30] rounded-lg p-1 items-center justify-center">
              <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">DERİNLİK</span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold">-910 m</span>
            </div>
            <div className="flex flex-col bg-[#201d30] rounded-lg p-1 items-center justify-center">
              <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">KALAN SÜRE</span>
              <span className="font-mono text-[11px] text-[#ffba27] font-bold">
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col bg-[#201d30] rounded-lg p-1 items-center justify-center">
              <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">GÖVDE</span>
              <span className="font-mono text-[11px] text-[#dab5ff] font-bold">%{state.hullIntegrity}</span>
            </div>
          </div>
        </div>

        {/* Role Badge & Mission Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffb703] text-[#271900] shadow-sm">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
              <span className="font-mono text-[9px] font-bold tracking-wider uppercase">ROL: MAKİNİST</span>
            </span>
            <span className="font-mono text-[9px] text-[#00eefc] uppercase bg-[#201d30] px-2 py-0.5 rounded">HÜCRE BİRİMİ 03</span>
          </div>
          <h2 className="font-sora text-lg text-white font-bold tracking-tight">
            Elektroliz Voltajını Kilitle &amp; O₂ Üret
          </h2>
          <p className="text-xs text-[#d5c4ac] leading-relaxed">
            Dümencinin telsizden verdiği hedef voltaj (180V) ve katot sırasına göre şalterleri devreye sok.
          </p>
        </div>

        {/* Manometer & Gauge 2.5D Console Module */}
        <div className="w-full bg-[#201d30] rounded-xl p-3 shadow-lg border border-white/5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">speed</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">VOLTAJ &amp; AMPER DEĞERİ</span>
            </div>
            <span className="font-mono text-[9px] text-[#ffdba0] bg-[#ffb703]/20 px-2 py-0.5 rounded font-bold">2.5D MANOMETRE</span>
          </div>

          {/* Radial Dial */}
          <div className="relative w-40 h-40 my-1 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#0f0c1e] shadow-inner flex items-center justify-center border border-white/5">
              <div className="w-32 h-32 rounded-full bg-[#1c192c] flex items-center justify-center shadow-lg"></div>
            </div>
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 200 200">
              <circle cx="100" cy="100" fill="none" r="82" stroke="#201d30" strokeDasharray="450" strokeDashoffset="120" strokeLinecap="round" strokeWidth="12"></circle>
              <circle
                cx="100"
                cy="100"
                fill="none"
                r="82"
                stroke={Math.abs(derinVolt - 180) <= 5 ? '#00eefc' : '#ffb703'}
                strokeDasharray="515"
                strokeDashoffset={`${320 - ((derinVolt - 140) / 80) * 180}`}
                strokeLinecap="round"
                strokeWidth="12"
              ></circle>
            </svg>
            <div className="absolute flex flex-col items-center z-20">
              <span className="font-sora text-2xl font-extrabold text-[#ffba27] tracking-tight">{derinVolt}V</span>
              <span className="font-mono text-[8px] text-[#00eefc] uppercase font-bold tracking-wider">
                {Math.abs(derinVolt - 180) <= 5 ? 'KİLİTLİ (180V)' : 'KALİBRASYON'}
              </span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setDerinVolt(v => Math.max(140, v - 5))}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#2b273b] hover:bg-[#363246] active:scale-95 text-[#00eefc] border border-white/5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">remove_circle</span>
              <span className="font-mono text-xs font-bold">-5V DÜŞÜR</span>
            </button>
            <button
              onClick={() => setDerinVolt(v => Math.min(220, v + 5))}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#2b273b] hover:bg-[#363246] active:scale-95 text-[#ffba27] border border-white/5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span className="font-mono text-xs font-bold">+5V YÜKSELT</span>
            </button>
          </div>
        </div>

        {/* Catalyst Fluid Slide Injector */}
        <div className="w-full bg-[#1c192c] rounded-xl p-3 shadow-md border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">science</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">KATALİZÖR SIVI ENJEKSİYONU</span>
            </div>
            <span className="font-sora text-sm text-[#00eefc] font-bold">%{catalystPct}</span>
          </div>
          <div className="relative w-full h-10 bg-[#0f0c1e] rounded-lg p-1 flex items-center border border-white/5">
            <div
              className="h-full rounded bg-[#00eefc]/30 relative overflow-hidden transition-all duration-150"
              style={{ width: `${catalystPct}%` }}
            >
              <div className="absolute inset-0 bg-[#00eefc]/20 animate-pulse"></div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={catalystPct}
              onChange={(e) => setCatalystPct(Number(e.target.value))}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3 text-[8px] font-mono text-zinc-400">
              <span>%0</span>
              <span className="text-[#00eefc] font-bold">OPTİMAL: %60 - %70</span>
              <span>%100</span>
            </div>
          </div>
        </div>

        {/* Switches: Cathode & Anode Cell Matrix */}
        <div className="w-full bg-[#201d30] rounded-xl p-3 shadow-md border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[16px]">tune</span>
              <span className="font-mono text-[9px] text-white uppercase tracking-wider font-bold">HÜCRE SEÇİCİ ŞALTERLERİ</span>
            </div>
            <span className="font-mono text-[8px] text-[#d5c4ac] uppercase font-semibold">3 BAĞLANTI</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'katotA' as const, label: 'KATOT-A' },
              { id: 'anotC' as const, label: 'ANOT-C' },
              { id: 'katotB' as const, label: 'KATOT-B' },
            ].map(cell => {
              const active = cellSwitches[cell.id];
              return (
                <button
                  key={cell.id}
                  onClick={() => toggleCellSwitch(cell.id)}
                  className={`flex flex-col items-center justify-between p-2 rounded-lg transition-all border ${
                    active ? 'bg-[#2b273b] border-[#00eefc]/50 shadow-md' : 'bg-[#141123] border-white/5'
                  }`}
                  type="button"
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#d5c4ac] font-bold">{cell.label}</span>
                    <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#00eefc] shadow-[0_0_6px_#00eefc]' : 'bg-zinc-600'}`}></span>
                  </div>
                  <div className={`w-8 h-10 rounded my-1.5 p-1 flex flex-col ${active ? 'justify-start bg-[#00eefc]/20' : 'justify-end bg-[#0f0c1e]'}`}>
                    <div className={`w-full h-4 rounded shadow ${active ? 'bg-[#00eefc]' : 'bg-zinc-600'}`}></div>
                  </div>
                  <span className={`font-mono text-[9px] font-bold ${active ? 'text-[#00eefc]' : 'text-zinc-500'}`}>
                    {active ? 'DEVREDE' : 'KAPALI'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Action Push Button */}
        {!airlock.isSolved ? (
          <div className="w-full pt-1">
            <button
              onClick={handleStartOxygenProduction}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-b from-[#ffb703] to-[#ff8c00] active:translate-y-1 shadow-[0_6px_0_#9a5300,0_12px_24px_rgba(255,183,3,0.35)] flex items-center justify-center gap-2 text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span>OKSİJEN ÜRETİMİNİ BAŞLAT</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>OKSİJEN ÜRETİMİ STABİL • DEVAM ET</span>
          </button>
        )}
      </div>
    );
  }

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
