import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen10CableEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { isSolved } = state.cable;
  
  // Available jumper cables
  const cables = [
    { id: 'c1', label: 'KIRMIZI // YÜK', color: '#ffb4ab', dotColor: 'bg-error-container', shadow: 'shadow-[0_0_8px_#ffb4ab]', textColor: 'text-error' },
    { id: 'c2', label: 'NEON // KORUMA', color: '#00dbe9', dotColor: 'bg-secondary-fixed-dim', shadow: 'shadow-[0_0_8px_#00dbe9]', textColor: 'text-secondary-fixed' },
    { id: 'c3', label: 'SARI // İYON', color: '#ffb703', dotColor: 'bg-primary-container', shadow: 'shadow-[0_0_8px_#ffb703]', textColor: 'text-primary-container' },
    { id: 'c4', label: 'CYAN // ANA GÜÇ', color: '#00eefc', dotColor: 'bg-secondary-container', shadow: 'shadow-[0_0_8px_#00eefc]', textColor: 'text-secondary-container' },
  ];

  // Port sockets
  const [selectedCableId, setSelectedCableId] = useState<string>('c2');
  const [portAssignments, setPortAssignments] = useState<Record<string, string | null>>({
    P1: 'c3', // Port 1 has Sarı / İyon
    P2: null, // Empty
    P3: 'c4', // Port 3 has Cyan / Ana Güç
    P4: null, // Empty
  });

  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isSolved ? 'success' : 'idle',
    msg: isSolved ? 'Devre kilitlendi! Tüm kutuplar stabil akım taşıyor.' : '',
  });

  const handleSelectCable = (id: string) => {
    if (isSolved) return;
    setSelectedCableId(id);
  };

  const handleTogglePort = (portId: string) => {
    if (isSolved) return;
    setPortAssignments(prev => {
      const current = prev[portId];
      if (current) {
        // Unplug
        return { ...prev, [portId]: null };
      } else {
        // Plug selected cable, remove from other ports
        const next = { ...prev };
        Object.keys(next).forEach(p => {
          if (next[p] === selectedCableId) next[p] = null;
        });
        next[portId] = selectedCableId;
        return next;
      }
    });
  };

  const handleLockCircuit = () => {
    // Check if ports are all wired
    const connectedCount = Object.values(portAssignments).filter(Boolean).length;
    if (connectedCount < 4) {
      setFeedback({
        type: 'error',
        msg: 'EKSİK DEVRE HATTI! Lütfen tüm port soketlerine uygun jumper kablosu takın.',
      });
      return;
    }

    // Required: P1=c3 (İyon), P2=c2 (Soğutma Koruma), P3=c4 (Ana Güç), P4=c1 (Baypas Yük)
    const isCorrect = portAssignments.P1 === 'c3' &&
                      portAssignments.P2 === 'c2' &&
                      portAssignments.P3 === 'c4' &&
                      portAssignments.P4 === 'c1';

    if (isCorrect) {
      setFeedback({
        type: 'success',
        msg: 'DEVRE KİLİTLENDİ! Akım dağılımı mükemmel senkronize edildi. Bütünlük korundu.',
      });
      onUpdate(prev => ({
        ...prev,
        cable: {
          ...prev.cable,
          isTested: true,
          isSolved: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: 'KISA DEVRE KIVILCIMI! Ters kutuplama nedeniyle ana hat sigortası attı. Bütünlük -%10, Süre -15 sn!',
      });
      onUpdate(prev => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const connectedCount = Object.values(portAssignments).filter(Boolean).length;

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin space-y-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* HUD Sub-Banner Status */}
      <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-md">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
          <span className="font-label-telemetry text-label-telemetry text-secondary-fixed tracking-wider uppercase">PARTYVERSE // CANLI</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <span className="font-label-telemetry text-label-telemetry text-primary tracking-widest bg-surface-container px-2 py-0.5 rounded">
            {Math.floor(state.timeLeftSeconds / 60).toString().padStart(2, '0')}:
            {(state.timeLeftSeconds % 60).toString().padStart(2, '0')}
          </span>
          <span className="font-label-status text-label-status text-on-surface-variant">
            BÜTÜNLÜK <strong className="text-secondary-fixed">%{state.hullIntegrity}</strong>
          </span>
        </div>
      </div>

      {/* Role Badge & Header Directives */}
      <div className="flex flex-col space-y-space-xs">
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded bg-surface-container-high">
          <span className="material-symbols-outlined text-[14px] text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
          <span className="font-label-status text-label-status text-primary uppercase tracking-wider">MÜHENDİS // DEVRE SOKETLERİ</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold">Kabloları soketlere bağla</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Kaptanından gelen port ve hat talimatına göre fiziksel jumper kablolarını eşleştirerek yerleştir.
        </p>
      </div>

      {/* Telemetry V/A Diagnostic Strip */}
      <div className="grid grid-cols-3 gap-space-xs bg-surface-container-lowest p-space-sm rounded-xl shadow-inner">
        <div className="flex flex-col bg-surface-container/60 p-2 rounded-lg">
          <span className="font-label-status text-label-status text-outline uppercase tracking-wider">GERİLİM</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-headline-sm text-headline-sm text-secondary-fixed font-bold">220</span>
            <span className="font-label-telemetry text-label-telemetry text-on-surface-variant">V</span>
          </div>
          <span className="font-label-status text-label-status text-secondary-fixed-dim mt-0.5">Dengeli</span>
        </div>
        <div className="flex flex-col bg-surface-container/60 p-2 rounded-lg">
          <span className="font-label-status text-label-status text-outline uppercase tracking-wider">AKIM DEBİSİ</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">14.2</span>
            <span className="font-label-telemetry text-label-telemetry text-on-surface-variant">A</span>
          </div>
          <span className="font-label-status text-label-status text-primary-fixed-dim mt-0.5">Akış Aktif</span>
        </div>
        <div className="flex flex-col bg-surface-container/60 p-2 rounded-lg">
          <span className="font-label-status text-label-status text-outline uppercase tracking-wider">KISA DEVRE</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-headline-sm text-headline-sm text-secondary font-bold">DÜŞÜK</span>
          </div>
          <span className="font-label-status text-label-status text-outline mt-0.5">%4 Tolerans</span>
        </div>
      </div>

      {/* Interactive 2.5D Wire Patching Console */}
      <div className="relative flex flex-col bg-surface-container-low rounded-xl p-space-md shadow-xl overflow-hidden">
        {/* Console Backdrop Grid / Ambient Circuit Glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00eefc_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Terminals Rack Header */}
        <div className="flex items-center justify-between mb-space-sm z-10">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed">developer_board</span>
            <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-widest uppercase">ANA DAĞITIM MATRİSİ</span>
          </div>
          <span className="font-label-status text-label-status text-secondary-fixed-dim bg-surface-container-high px-2 py-0.5 rounded font-bold">
            {connectedCount}/4 BAĞLI
          </span>
        </div>

        {/* Dynamic Sockets */}
        <div className="relative flex flex-col gap-space-md z-10 py-1" id="patch-bay">
          {/* PORT 01 */}
          {(() => {
            const cableId = portAssignments.P1;
            const cable = cables.find(c => c.id === cableId);
            return (
              <div 
                onClick={() => handleTogglePort('P1')}
                className="flex items-center justify-between bg-surface-container p-space-sm rounded-lg shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="font-label-telemetry text-label-telemetry text-primary font-bold">P1</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">İYON (60 Hz)</span>
                    <span className="font-label-status text-label-status text-primary">KUTUP KİLİTLİ · 380 kVA</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {cable ? (
                    <>
                      <span className="px-2 py-1 rounded bg-primary-container/20 text-primary-fixed-dim font-label-status text-label-status font-bold">BAĞLANDI</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner">
                        <div className={`w-5 h-5 rounded-full ${cable.dotColor} ${cable.shadow} flex items-center justify-center`}>
                          <span className="w-2 h-2 rounded-full bg-on-primary-container"></span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-status text-label-status">BOŞ SOKET</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PORT 02 */}
          {(() => {
            const cableId = portAssignments.P2;
            const cable = cables.find(c => c.id === cableId);
            return (
              <div 
                onClick={() => handleTogglePort('P2')}
                className="flex items-center justify-between bg-surface-container p-space-sm rounded-lg shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="font-label-telemetry text-label-telemetry text-outline font-bold">P2</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">SOĞUTMA</span>
                    <span className="font-label-status text-label-status text-on-surface-variant">BEKLEMEDE · BOŞ HAT</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {cable ? (
                    <>
                      <span className="px-2 py-1 rounded bg-secondary-container/20 text-secondary-fixed font-label-status text-label-status font-bold">BAĞLANDI</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner">
                        <div className={`w-5 h-5 rounded-full ${cable.dotColor} ${cable.shadow} flex items-center justify-center`}>
                          <span className="w-2 h-2 rounded-full bg-on-secondary-container"></span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-status text-label-status">BOŞ SOKET</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PORT 03 */}
          {(() => {
            const cableId = portAssignments.P3;
            const cable = cables.find(c => c.id === cableId);
            return (
              <div 
                onClick={() => handleTogglePort('P3')}
                className="flex items-center justify-between bg-surface-container p-space-sm rounded-lg shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="font-label-telemetry text-label-telemetry text-secondary-fixed font-bold">P3</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">ANA GÜÇ</span>
                    <span className="font-label-status text-label-status text-secondary-fixed">KUTUP KİLİTLİ · 1.2 GW</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {cable ? (
                    <>
                      <span className="px-2 py-1 rounded bg-secondary-container/20 text-secondary-fixed font-label-status text-label-status font-bold">BAĞLANDI</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner">
                        <div className={`w-5 h-5 rounded-full ${cable.dotColor} ${cable.shadow} flex items-center justify-center`}>
                          <span className="w-2 h-2 rounded-full bg-on-secondary-container"></span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-status text-label-status">BOŞ SOKET</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PORT 04 */}
          {(() => {
            const cableId = portAssignments.P4;
            const cable = cables.find(c => c.id === cableId);
            return (
              <div 
                onClick={() => handleTogglePort('P4')}
                className="flex items-center justify-between bg-surface-container p-space-sm rounded-lg shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="font-label-telemetry text-label-telemetry text-outline font-bold">P4</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate font-semibold">BAYPAS</span>
                    <span className="font-label-status text-label-status text-on-surface-variant">BEKLEMEDE · BOŞ HAT</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  {cable ? (
                    <>
                      <span className="px-2 py-1 rounded bg-error-container/20 text-error font-label-status text-label-status font-bold">BAĞLANDI</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner">
                        <div className={`w-5 h-5 rounded-full ${cable.dotColor} ${cable.shadow} flex items-center justify-center`}>
                          <span className="w-2 h-2 rounded-full bg-on-error-container"></span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-label-status text-label-status">BOŞ SOKET</span>
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Jumper Cable Selector Dock */}
        <div className="mt-space-md pt-space-sm bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-space-xs z-10">
          <div className="flex items-center justify-between">
            <span className="font-label-status text-label-status text-on-surface-variant uppercase tracking-wider font-bold">
              KULLANILABİLİR KABLOLAR (SEÇ VE SOKETE DOKUN)
            </span>
            <span className="font-label-telemetry text-label-telemetry text-primary font-bold">
              {4 - connectedCount} BOŞTA
            </span>
          </div>
          <div className="grid grid-cols-2 gap-space-sm mt-1">
            {cables.map(c => {
              const isSelected = selectedCableId === c.id;
              const isAssigned = Object.values(portAssignments).includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCable(c.id)}
                  className={`flex items-center gap-2.5 p-2 rounded transition-all text-left cursor-pointer active:scale-95 ${
                    isSelected 
                      ? 'bg-surface-container-high ring-2 ring-primary shadow-md' 
                      : 'bg-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <div className={`w-3.5 h-3.5 rounded-full ${c.dotColor} ${c.shadow}`}></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-label-telemetry text-label-telemetry ${c.textColor} tracking-wider uppercase truncate font-bold`}>
                      {c.label}
                    </span>
                    <span className="font-label-status text-label-status text-outline">
                      {isAssigned ? 'Sokete Takılı' : 'Kablo Hazır'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback status */}
      {feedback.msg && (
        <div className={`p-3 rounded-xl text-xs font-mono border leading-relaxed animate-fadeIn ${
          feedback.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Primary Arcade Push Trigger */}
      <div className="flex flex-col space-y-space-xs pt-1">
        {!isSolved ? (
          <button
            type="button"
            onClick={handleLockCircuit}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-secondary-container to-secondary-fixed-dim text-on-secondary-container rounded-lg font-headline-sm text-headline-sm font-bold shadow-[0_4px_0_#00686f] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
            <span className="tracking-wide uppercase">DEVRE BAĞLANTISINI KİLİTLE</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvancePhase}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary-container to-surface-tint text-on-primary-container rounded-lg font-headline-sm text-headline-sm font-bold shadow-[0_4px_0_#996500] active:translate-y-1 transition-all cursor-pointer animate-pulse"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <span className="tracking-wide uppercase">GÖREV TAMAMLANDI // DEVAM ET</span>
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 py-1 text-center">
          <span className="material-symbols-outlined text-[16px] text-outline">radio_button_checked</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Kaptanının onay vermesini bekle veya eşleşmeyi tamamla.
          </p>
        </div>
      </div>
    </div>
  );
};
