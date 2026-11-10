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

  const isDerinBasinc = state.operationTheme === 'derin_basinc';

  // Derin Basınç Sızıntı Onarım State
  const [valves, setValves] = useState({
    A: false,
    B: false,
    C: true, // Sealed
  });
  const [switches, setSwitches] = useState({
    sw1: false,
    sw2: true, // Enabled
    sw3: false,
    sw4: false,
  });
  const [clampProgress, setClampProgress] = useState(75);

  const toggleValve = (v: 'A' | 'B' | 'C') => {
    if (cable.isSolved) return;
    setValves(prev => ({ ...prev, [v]: !prev[v] }));
  };

  const toggleSwitch = (sw: 'sw1' | 'sw2' | 'sw3' | 'sw4') => {
    if (cable.isSolved) return;
    setSwitches(prev => ({ ...prev, [sw]: !prev[sw] }));
  };

  const executeSealProcess = () => {
    // Protocol requires: Valf-C sealed, Switch 2 active, Clamp tightly locked (e.g. >= 70%)
    const valveCorrect = valves.C && !valves.A && !valves.B;
    const switchCorrect = switches.sw2 && !switches.sw1 && !switches.sw3 && !switches.sw4;
    const clampCorrect = clampProgress >= 65;

    if (valveCorrect && switchCorrect && clampCorrect) {
      if (onAction) {
        // Also fire cable_test_connections if online so colyseus room resolves
        onAction('cable_test_connections', {});
      }
      onUpdate((prev) => ({
        ...prev,
        cable: {
          ...prev.cable,
          isTested: true,
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
        {/* Telemetry Sub-Status HUD Panel */}
        <div className="w-full bg-[#1c192c] rounded-xl p-2.5 shadow-xl border border-white/5 flex flex-col space-y-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse shadow-[0_0_8px_rgba(0,238,252,0.8)]"></span>
              <span className="font-mono text-[9px] text-[#00eefc] tracking-widest uppercase">TELSİZ CH-02 AKTİF</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#ffba27]">timer</span>
              <span className="font-mono text-[11px] text-[#ffba27] font-bold">
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1">
            <div className="flex flex-col items-center justify-center bg-[#201d30] rounded-lg p-1.5">
              <span className="font-mono text-[9px] text-[#d5c4ac]">GÖVDE</span>
              <span className="font-sora text-sm text-[#ffdba0] font-bold">%{state.hullIntegrity}</span>
              <div className="w-full bg-[#363246] h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#ffba27] h-full rounded-full" style={{ width: `${state.hullIntegrity}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#201d30] rounded-lg p-1.5">
              <span className="font-mono text-[9px] text-[#d5c4ac]">DERİNLİK</span>
              <span className="font-sora text-sm text-[#00eefc] font-bold">870m</span>
              <div className="w-full bg-[#363246] h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#00eefc] h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#201d30] rounded-lg p-1.5">
              <span className="font-mono text-[9px] text-[#d5c4ac]">TAHLİYE</span>
              <span className="font-sora text-sm text-[#00dbe9] font-bold">52 BAR</span>
              <div className="w-full bg-[#363246] h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#00dbe9] h-full rounded-full animate-pulse" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Operational Context */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-[#ffb703] text-[#271900] font-mono text-[10px] font-bold uppercase">
              ROL: MAKİNİST
            </span>
            <span className="font-mono text-[10px] text-[#d5c4ac]">SEKTÖR: TORPİDO DAİRESİ</span>
          </div>
          <h2 className="font-sora text-xl text-white font-extrabold tracking-tight">Bölme T-03 Sızıntısını Mühürle</h2>
          <p className="text-xs text-[#d5c4ac] leading-relaxed">
            Dümencinin telsizle bildirdiği sıraya göre baypas valflerini kapat ve hidrolik kelepçeyi kilitle.
          </p>
        </div>

        {/* Interactive Compartment Visual Feed */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-xl bg-[#0f0c1e] border border-white/5">
          <div
            className="relative w-full h-36 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1Uy0DA9w8fPEEckVcBYWGfYjQvYNG3Mv95I1fspA5ATpfP1xpFkHSmxEz7Fc_Us_Xc_xUEXKf1ijlXw3u21hIdybwpEDwooW-iyuqtl7GYHM8351OY6S4Mjh3FcGwy1e6YZDi9NnxE58yNhRrVLyM1n9fkNB5lxrzmvL6TGw-Dbgpc8YoWZb7GiKVjnVacKdaZ2TyVHUXYywUX-N1j_Dxhfw8J_WpP3cSGPGjfKg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#0f0c1e]/40 to-transparent"></div>
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-[#0f0c1e]/80 backdrop-blur-md border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping"></span>
              <span className="font-mono text-[9px] text-[#ffb4ab] uppercase font-bold">SIZINTI BÖLGESİ T-03</span>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[#0f0c1e]/80 backdrop-blur-md border border-white/5 font-mono text-[9px] text-[#00eefc]">
              KAM-04 // CANLI
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex flex-col space-y-1 bg-[#2b273b]/90 backdrop-blur-md p-1.5 rounded-lg border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[9px] text-[#d5c4ac] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#00eefc]">water_drop</span> BÖLME SU SEVİYESİ
                </span>
                <span className="font-mono text-[9px] text-[#00eefc] font-bold">%24 DÜŞÜŞTE</span>
              </div>
              <div className="w-full bg-[#0f0c1e] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#00eefc] to-[#00dbe9] h-full rounded-full w-[24%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Fiziksel Boru Hattı & Vana Konsolu */}
        <div className="flex flex-col bg-[#201d30] rounded-xl p-3 shadow-lg border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[18px]">valve</span>
              <span className="font-sora text-xs text-white font-bold">1. Mekanik Baypas Valfleri</span>
            </div>
            <span className="font-mono text-[9px] text-[#ffdba0] px-2 py-0.5 rounded bg-[#2b273b]">
              {valves.C ? 'VALF-C MÜHÜRLÜ' : 'MÜHÜR BEKLENİYOR'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['A', 'B', 'C'] as const).map(v => {
              const isSealed = valves[v];
              return (
                <div
                  key={v}
                  onClick={() => toggleValve(v)}
                  className={`flex flex-col items-center rounded-lg p-2 transition-all cursor-pointer active:scale-95 border ${
                    isSealed
                      ? 'bg-[#2b273b] border-[#ffba27] shadow-lg shadow-[#ffba27]/10'
                      : 'bg-[#1c192c] border-white/5'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-bold mb-1 ${isSealed ? 'text-[#ffdba0]' : 'text-[#d5c4ac]'}`}>
                    VALF-{v}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isSealed ? 'bg-[#0f0c1e] rotate-90 text-[#ffba27]' : 'bg-[#363246] text-zinc-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[28px]">settings</span>
                  </div>
                  <span className={`mt-1.5 font-mono text-[9px] font-bold uppercase tracking-wider ${isSealed ? 'text-[#ffdba0]' : 'text-[#ffb4ab]'}`}>
                    {isSealed ? 'MÜHÜRLÜ' : 'AÇIK'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Elektrikli Ağır Metal Şalter Paneli */}
        <div className="flex flex-col bg-[#201d30] rounded-xl p-3 shadow-lg border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px]">electric_bolt</span>
              <span className="font-sora text-xs text-white font-bold">2. Basınç Denge Şalterleri</span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] bg-[#2b273b] px-2 py-0.5 rounded">
              DÜMENCİ EMRİ: Ş-02
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['sw1', 'sw2', 'sw3', 'sw4'] as const).map((sw, idx) => {
              const active = switches[sw];
              return (
                <div
                  key={sw}
                  onClick={() => toggleSwitch(sw)}
                  className={`flex flex-col items-center rounded-lg py-2 px-1 cursor-pointer transition-all border ${
                    active
                      ? 'bg-[#2b273b] border-[#ffba27]/50 shadow-md'
                      : 'bg-[#1c192c] border-white/5'
                  }`}
                >
                  <span className={`font-mono text-[10px] font-bold ${active ? 'text-[#ffba27]' : 'text-[#d5c4ac]'}`}>
                    Ş-0{idx + 1}
                  </span>
                  <div className={`w-7 h-11 rounded-md my-1 p-1 flex flex-col ${active ? 'justify-start bg-[#ffb703]/20' : 'justify-end bg-[#0f0c1e]'}`}>
                    <div className={`w-5 h-4 rounded shadow-sm ${active ? 'bg-[#ffb703]' : 'bg-zinc-600'}`}></div>
                  </div>
                  <span className={`font-mono text-[8px] font-bold ${active ? 'text-[#ffdba0]' : 'text-zinc-500'}`}>
                    {active ? 'DEVREDE' : 'KAPALI'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Hidrolik Kelepçe Kızak Kilit */}
        <div className="flex flex-col bg-[#201d30] rounded-xl p-3 shadow-lg border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px]">lock_reset</span>
              <span className="font-sora text-xs text-white font-bold">3. Hidrolik Kelepçe Kızak Kilit</span>
            </div>
            <span className="font-mono text-[10px] text-[#00eefc] font-bold">%{clampProgress} SIKILDI</span>
          </div>
          <div className="relative w-full bg-[#0f0c1e] rounded-xl p-1 h-12 flex items-center border border-white/5">
            <div
              className="absolute left-1 top-1 bottom-1 bg-[#2b273b] rounded-lg transition-all duration-150"
              style={{ width: `${clampProgress}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={clampProgress}
              onChange={(e) => setClampProgress(Number(e.target.value))}
              className="w-full h-8 opacity-0 z-20 cursor-ew-resize"
            />
            <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none flex items-center justify-between px-3 z-10 text-[9px] font-mono">
              <span className="text-zinc-400">SERBEST</span>
              <span className="text-[#00eefc] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">tune</span>
              </span>
              <span className="text-[#ffdba0] font-bold">KİLİTLİ (%100)</span>
            </div>
          </div>
        </div>

        {/* Primary Action Trigger */}
        {!cable.isSolved ? (
          <div className="pt-1 flex flex-col items-center">
            <button
              onClick={executeSealProcess}
              className="w-full h-14 bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] rounded-xl flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_10px_20px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px] font-bold">verified_user</span>
              <span className="font-sora text-xs font-extrabold tracking-wide uppercase">
                MÜHÜRÜ KİLİTLE &amp; TANKI BASINÇLANDIR
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>SIZINTI MÜHÜRLENDİ • DEVAM ET</span>
          </button>
        )}
      </div>
    );
  }

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
