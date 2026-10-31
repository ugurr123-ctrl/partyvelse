import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen10CableEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { cable } = state;
  const { isSolved, cables, ports } = cable;

  const [selectedCableId, setSelectedCableId] = useState<string>(cables[0]?.id || 'c1');
  const [portAssignments, setPortAssignments] = useState<Record<string, string | null>>(
    cable.portAssignments || { P1: null, P2: null, P3: null, P4: null }
  );

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
        const updated = { ...prev, [portId]: null };
        onAction?.('cable_assign_port', { portId, cableId: null });
        onUpdate(p => ({ ...p, cable: { ...p.cable, portAssignments: updated } }));
        return updated;
      } else {
        // Plug selected cable, remove from any other port
        const updated = { ...prev };
        Object.keys(updated).forEach(p => {
          if (updated[p] === selectedCableId) updated[p] = null;
        });
        updated[portId] = selectedCableId;
        onAction?.('cable_assign_port', { portId, cableId: selectedCableId });
        onUpdate(p => ({ ...p, cable: { ...p.cable, portAssignments: updated } }));
        return updated;
      }
    });
  };

  const handleLockCircuit = () => {
    if (isSolved) return;

    // Check if all 4 ports are plugged
    const connectedCount = Object.values(portAssignments).filter(Boolean).length;
    if (connectedCount < 4) {
      setFeedback({
        type: 'error',
        msg: 'EKSİK DEVRE HATTI! Lütfen tüm 4 port soketine uygun jumper kablosu takın.',
      });
      return;
    }

    if (onAction) {
      onAction('cable_test_connections', { portAssignments });
      return;
    }

    // Local fallback
    const isAllCorrect = ports.every(port => portAssignments[port.id] === port.requiredCableId);

    if (isAllCorrect) {
      setFeedback({
        type: 'success',
        msg: 'DEVRE KİLİTLENDİ! Akım dağılımı mükemmel senkronize edildi. Bütünlük korundu.',
      });
      onUpdate(prev => ({
        ...prev,
        cable: {
          ...prev.cable,
          portAssignments,
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

  const activeFeedback = state.feedbackMessage
    ? {
        type: (state.feedbackState === 'success' ? 'success' : state.feedbackState === 'error' ? 'error' : 'idle') as 'idle' | 'success' | 'error',
        msg: state.feedbackMessage,
      }
    : feedback;

  const getCableById = (id: string | null) => {
    if (!id) return null;
    return cables.find(c => c.id === id);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Header Directive */}
      <div className="pt-1 flex flex-col gap-1">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-[#00eefc]/15 text-[#00eefc] border border-[#00eefc]/30">
          <span className="material-symbols-outlined text-[15px]">cable</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">MÜHENDİS // JUMPER BAĞLANTISI</span>
        </div>
        <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">Devreleri bağla</h2>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Kaptanından gelen port gereksinimlerine göre kabloları seçip soketlere tak.
        </p>
      </div>

      {/* Cable Selector Rail */}
      <div className="mt-2 bg-[#201d30] p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
        <span className="text-[10px] font-mono text-[#d5c4ac] uppercase font-bold">KULLANILABİLİR JUMPER KABLOLARI</span>
        <div className="grid grid-cols-2 gap-2">
          {cables.map(cableItem => {
            const isSelected = selectedCableId === cableItem.id;
            return (
              <button
                key={cableItem.id}
                type="button"
                onClick={() => handleSelectCable(cableItem.id)}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'ring-1 shadow-md' 
                    : 'bg-[#0f0c1e] border-white/5 opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: isSelected ? cableItem.color : 'rgba(255,255,255,0.08)',
                  backgroundColor: isSelected ? `${cableItem.color}15` : undefined,
                }}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cableItem.color }}></span>
                <span className="text-xs font-mono font-bold truncate" style={{ color: cableItem.color }}>
                  {cableItem.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sockets / Ports Panel */}
      <div className="mt-2 bg-[#0f0c1e] p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2.5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#00eefc] uppercase font-bold">SOKET BAĞLANTI PANELİ</span>
          <span className="text-[9px] font-mono text-[#ffb703]">4 SOKET GEREKLİ</span>
        </div>

        <div className="flex flex-col gap-2">
          {ports.map(port => {
            const assignedCable = getCableById(portAssignments[port.id]);
            return (
              <div key={port.id} className="p-2.5 rounded-xl bg-[#1c192c] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#2b273b] font-mono text-xs font-bold text-white flex items-center justify-center">
                    {port.id}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-medium">{port.label}</span>
                    <span className="text-[10px] text-[#d5c4ac]">{port.functionLabel}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTogglePort(port.id)}
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    assignedCable 
                      ? 'shadow-sm' 
                      : 'bg-[#0f0c1e] border-dashed border-white/20 text-[#d5c4ac] hover:border-[#00eefc]'
                  }`}
                  style={assignedCable ? {
                    borderColor: assignedCable.color,
                    backgroundColor: `${assignedCable.color}20`,
                    color: assignedCable.color,
                  } : undefined}
                >
                  {assignedCable ? (
                    <>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignedCable.color }}></span>
                      <span>{assignedCable.label.split(' // ')[0]}</span>
                      <span className="text-[10px] opacity-60">✕</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[12px]">+</span>
                      <span>Kablo Tak</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Message */}
      {activeFeedback.msg && (
        <div className={`mt-2 p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          activeFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {activeFeedback.msg}
        </div>
      )}

      {/* Lock Trigger */}
      <div className="mt-2 flex flex-col gap-2">
        {!isSolved ? (
          <button
            onClick={handleLockCircuit}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            <span>Devreyi Kilitle ve Test Et</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>DEVRE KİLİTLENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
