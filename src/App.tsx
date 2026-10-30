import React, { useState, useEffect } from 'react';
import { 
  MissionState, 
  Role, 
  MiniGameType, 
  GameStatus 
} from './types/game';
import { createInitialMissionState } from './services/gameFactory';
import { syncService } from './services/multiplayerSync';
import { ConsoleHeader } from './components/ConsoleHeader';
import { NetworkDisconnectModal } from './components/NetworkDisconnectModal';
import { RuleEvaluationDrawer } from './components/RuleEvaluationDrawer';
import { ScreenExplorerModal, ALL_17_SCREENS } from './components/ScreenExplorerModal';

// Screens
import { Screen01Entry } from './components/screens/Screen01Entry';
import { Screen02Lobby } from './components/screens/Screen02Lobby';
import { Screen03CaptainRole } from './components/screens/Screen03CaptainRole';
import { Screen04EngineerRole } from './components/screens/Screen04EngineerRole';
import { Screen05ReactorCaptain } from './components/screens/Screen05ReactorCaptain';
import { Screen06ReactorEngineer } from './components/screens/Screen06ReactorEngineer';
import { Screen07SignalCaptain } from './components/screens/Screen07SignalCaptain';
import { Screen08SignalEngineer } from './components/screens/Screen08SignalEngineer';
import { Screen09CableCaptain } from './components/screens/Screen09CableCaptain';
import { Screen10CableEngineer } from './components/screens/Screen10CableEngineer';
import { Screen11AirlockCaptain } from './components/screens/Screen11AirlockCaptain';
import { Screen12AirlockEngineer } from './components/screens/Screen12AirlockEngineer';
import { Screen13RadarCaptain } from './components/screens/Screen13RadarCaptain';
import { Screen14RadarEngineer } from './components/screens/Screen14RadarEngineer';
import { Screen15EnergyCaptain } from './components/screens/Screen15EnergyCaptain';
import { Screen16EnergyEngineer } from './components/screens/Screen16EnergyEngineer';
import { Screen17ARescue } from './components/screens/Screen17ARescue';
import { Screen17BResult } from './components/screens/Screen17BResult';

import { Columns2, Smartphone, ArrowRightLeft } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<MissionState>(() => createInitialMissionState());
  const [showRules, setShowRules] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [dualViewMode, setDualViewMode] = useState(false); // Side-by-side dual phone testing mode

  // Sync subscription across tabs / windows
  useEffect(() => {
    const unsubscribe = syncService.subscribe((incomingState, sourceRole) => {
      // If message came from another role, adopt state but keep local role view preference
      setState((prev) => ({
        ...incomingState,
        myRole: prev.myRole, // preserve local role view
      }));
    });
    return () => unsubscribe();
  }, []);

  // Broadcast state changes
  const updateState = (updater: (prev: MissionState) => MissionState) => {
    setState((prev) => {
      const next = updater(prev);
      syncService.broadcast(next, next.myRole);
      return next;
    });
  };

  // 1-second mission timer countdown
  useEffect(() => {
    const isGameRunning = 
      (state.status === 'phase_game' || state.status === 'phase_energy' || state.status === 'phase_rescue') &&
      !state.isPaused &&
      !state.isDisconnected;

    if (!isGameRunning) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeftSeconds <= 1 || prev.hullIntegrity <= 0) {
          // Mission Failure!
          const failNext: MissionState = {
            ...prev,
            status: 'phase_result',
            outcomeType: 'basarisizlik',
            rescuedCrewCount: 0,
            finalScore: 120,
            timeLeftSeconds: 0,
          };
          syncService.broadcast(failNext, failNext.myRole);
          return failNext;
        }

        return {
          ...prev,
          timeLeftSeconds: prev.timeLeftSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.status, state.isPaused, state.isDisconnected]);

  const lastAdvanceTimestampRef = React.useRef<number>(0);

  // Handle phase advance: Phase 0 -> Phase 1 -> Phase 2 (Energy) -> Phase 3 (Rescue)
  // Debounce guard prevents double-advancing if both players click simultaneously
  const handleAdvancePhase = () => {
    const now = Date.now();
    if (now - lastAdvanceTimestampRef.current < 800) {
      return; // Ignore concurrent / duplicate advance signals
    }
    lastAdvanceTimestampRef.current = now;

    updateState((prev) => {
      const nextPhaseIdx = prev.currentPhaseIndex + 1;
      const nextCompleted = prev.currentPhaseIndex < 2 ? prev.completedTasksCount + 1 : prev.completedTasksCount;
      if (nextPhaseIdx === 1) {
        return {
          ...prev,
          currentPhaseIndex: 1,
          completedTasksCount: nextCompleted,
          status: 'phase_game',
        };
      }
      if (nextPhaseIdx === 2) {
        return {
          ...prev,
          currentPhaseIndex: 2,
          completedTasksCount: nextCompleted,
          status: 'phase_energy',
        };
      }
      if (nextPhaseIdx >= 3) {
        return {
          ...prev,
          currentPhaseIndex: 3,
          completedTasksCount: nextCompleted,
          status: 'phase_rescue',
        };
      }
      return prev;
    });
  };

  const handleSwitchRole = () => {
    updateState((prev) => ({
      ...prev,
      myRole: prev.myRole === 'kaptan' ? 'muhendis' : 'kaptan',
    }));
  };

  const handleToggleDisconnect = () => {
    updateState((prev) => ({
      ...prev,
      isDisconnected: !prev.isDisconnected,
      isPaused: !prev.isDisconnected, // pause timer if disconnected
    }));
  };

  const handleReconnect = () => {
    updateState((prev) => ({
      ...prev,
      isDisconnected: false,
      isPaused: false,
    }));
  };

  const handleNavigateFromExplorer = (screenMeta: typeof ALL_17_SCREENS[0], targetRole: Role) => {
    updateState((prev) => {
      const updated: MissionState = {
        ...prev,
        myRole: targetRole,
        status: screenMeta.statusKey,
      };

      if (screenMeta.phaseIndex !== undefined) {
        updated.currentPhaseIndex = screenMeta.phaseIndex;
      }
      if (screenMeta.miniGameKey) {
        // Place selected mini-game in active phase
        const newSelected = [...prev.selectedMiniGames] as [MiniGameType, MiniGameType];
        if (screenMeta.phaseIndex === 0) {
          newSelected[0] = screenMeta.miniGameKey as MiniGameType;
        } else if (screenMeta.phaseIndex === 1) {
          newSelected[1] = screenMeta.miniGameKey as MiniGameType;
        }
        updated.selectedMiniGames = newSelected;
      }

      if (screenMeta.id === 19) {
        updated.outcomeType = 'basarisizlik';
        updated.rescuedCrewCount = 0;
        updated.timeLeftSeconds = 0;
        updated.hullIntegrity = 0;
      } else if (screenMeta.id === 18) {
        updated.outcomeType = 'tam_basari';
        updated.rescuedCrewCount = 10;
        updated.timeLeftSeconds = 162;
        updated.hullIntegrity = 84;
      }

      return updated;
    });
  };

  // Helper to render active screen for a specific role
  const renderScreenForRole = (role: Role) => {
    const currentState = { ...state, myRole: role };

    // 1. Entry Screen
    if (state.status === 'entry') {
      return (
        <Screen01Entry 
          state={currentState} 
          onUpdate={updateState} 
          onStartLobby={() => updateState((p) => ({ ...p, status: 'lobby' }))} 
        />
      );
    }

    // 2. Lobby Screen
    if (state.status === 'lobby') {
      return (
        <Screen02Lobby 
          state={currentState} 
          onUpdate={updateState} 
          onStartGame={() => updateState((p) => ({ ...p, status: 'role_intro' }))} 
        />
      );
    }

    // 3 & 4. Role Intro
    if (state.status === 'role_intro') {
      if (role === 'kaptan') {
        return (
          <Screen03CaptainRole 
            state={currentState} 
            onConfirmRole={() => updateState((p) => ({ ...p, status: 'phase_game', currentPhaseIndex: 0 }))} 
          />
        );
      } else {
        return (
          <Screen04EngineerRole 
            state={currentState} 
            onConfirmRole={() => updateState((p) => ({ ...p, status: 'phase_game', currentPhaseIndex: 0 }))} 
          />
        );
      }
    }

    // 5 to 14. Phase Games (Phase Index 0 & 1)
    if (state.status === 'phase_game') {
      const activeGameType = state.currentPhaseIndex === 0 
        ? state.selectedMiniGames[0] 
        : state.selectedMiniGames[1];

      // Arıza Teşhisi (Reaktör)
      if (activeGameType === 'ariza_teshisi') {
        return role === 'kaptan' ? (
          <Screen05ReactorCaptain state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        ) : (
          <Screen06ReactorEngineer state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        );
      }

      // Sinyal Çözümü
      if (activeGameType === 'sinyal_cozumu') {
        return role === 'kaptan' ? (
          <Screen07SignalCaptain state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        ) : (
          <Screen08SignalEngineer state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        );
      }

      // Kablo Bağlantısı
      if (activeGameType === 'kablo_baglantisi') {
        return role === 'kaptan' ? (
          <Screen09CableCaptain state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        ) : (
          <Screen10CableEngineer state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        );
      }

      // Hava Kilidi
      if (activeGameType === 'hava_kilidi') {
        return role === 'kaptan' ? (
          <Screen11AirlockCaptain state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        ) : (
          <Screen12AirlockEngineer state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        );
      }

      // Radar Yönlendirme
      if (activeGameType === 'radar_yonlendirme') {
        return role === 'kaptan' ? (
          <Screen13RadarCaptain state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        ) : (
          <Screen14RadarEngineer state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
        );
      }
    }

    // 15 & 16. Phase 3: Energy Allocation
    if (state.status === 'phase_energy') {
      return role === 'kaptan' ? (
        <Screen15EnergyCaptain state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
      ) : (
        <Screen16EnergyEngineer state={currentState} onUpdate={updateState} onAdvancePhase={handleAdvancePhase} />
      );
    }

    // 17A. Phase 4A: Shared Rescue Decision
    if (state.status === 'phase_rescue') {
      return (
        <Screen17ARescue 
          state={currentState} 
          onUpdate={updateState} 
          onFinalizeMission={() => updateState((p) => ({ ...p, status: 'phase_result' }))} 
        />
      );
    }

    // 17B. Phase 4B: Final Mission Result & Victory / Failure
    if (state.status === 'phase_result') {
      return (
        <Screen17BResult 
          state={currentState} 
          onRestartGame={() => updateState((p) => {
            const nextState = createInitialMissionState(
              p.roomCode,
              p.activeEnvironment,
              p.players.kaptan.name,
              p.selectedMiniGames
            );
            return {
              ...nextState,
              players: {
                kaptan: { ...p.players.kaptan, ready: true },
                muhendis: { ...p.players.muhendis, ready: true },
              },
              status: 'phase_game',
              currentPhaseIndex: 0,
            };
          })} 
          onLobbyReturn={() => updateState((p) => {
            const nextState = createInitialMissionState(
              p.roomCode,
              p.activeEnvironment,
              p.players.kaptan.name,
              p.selectedMiniGames
            );
            return {
              ...nextState,
              players: {
                kaptan: { ...p.players.kaptan, ready: false },
                muhendis: { ...p.players.muhendis, ready: false },
              },
              status: 'lobby',
            };
          })}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#0b081a] text-[#e6dff9] flex flex-col font-manrope selection:bg-[#ffb703] selection:text-black">
      
      {/* Space Station Telemetry & Navigation Header */}
      <ConsoleHeader
        roomCode={state.roomCode}
        myRole={state.myRole}
        timeLeft={state.timeLeftSeconds}
        hullIntegrity={state.hullIntegrity}
        currentPhaseIndex={state.currentPhaseIndex}
        status={state.status}
        selectedMiniGames={state.selectedMiniGames}
        isDisconnected={state.isDisconnected}
        onToggleDisconnect={handleToggleDisconnect}
        onSwitchRole={handleSwitchRole}
        onOpenRules={() => setShowRules(true)}
        onOpenScreenExplorer={() => setShowExplorer(true)}
      />

      {/* Main Game Stage Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-2 sm:p-4 flex flex-col items-center">
        
        {/* Dual Phone View Controller (For Single Device testing of both players side-by-side) */}
        <div className="w-full max-w-md flex items-center justify-between px-2 mb-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#9e8f78]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Yerel Eşzamanlı Co-op</span>
          </div>

          <button
            onClick={() => setDualViewMode(!dualViewMode)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono transition-colors ${
              dualViewMode 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40 shadow-sm' 
                : 'bg-white/5 text-[#a59db8] border-white/10 hover:text-white'
            }`}
            title="Kaptan ve Mühendis ekranlarını yan yana 2 telefon gibi gösterir"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{dualViewMode ? 'Tek Ekran Modu' : 'İkili Telefon Görünümü (Dual View)'}</span>
          </button>
        </div>

        {/* View Layout: Single Screen or Dual Phone Split */}
        {dualViewMode ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start justify-center">
            {/* Left Phone: Kaptan */}
            <div className="w-full max-w-md mx-auto p-1 rounded-3xl bg-[#141123] border-2 border-amber-500/40 shadow-2xl flex flex-col">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#ffb703] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ffb703]"></span>
                  1. CİHAZ • KAPTAN GÖRÜNÜMÜ
                </span>
                <span className="text-[#9e8f78]">SOL TELEFON</span>
              </div>
              <div className="p-2">
                {renderScreenForRole('kaptan')}
              </div>
            </div>

            {/* Right Phone: Mühendis */}
            <div className="w-full max-w-md mx-auto p-1 rounded-3xl bg-[#141123] border-2 border-cyan-500/40 shadow-2xl flex flex-col">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#00f0ff] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff]"></span>
                  2. CİHAZ • MÜHENDİS GÖRÜNÜMÜ
                </span>
                <span className="text-[#9e8f78]">SAĞ TELEFON</span>
              </div>
              <div className="p-2">
                {renderScreenForRole('muhendis')}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            {renderScreenForRole(state.myRole)}
          </div>
        )}
      </main>

      {/* Disconnect Simulation Modal */}
      <NetworkDisconnectModal
        isOpen={state.isDisconnected}
        onReconnect={handleReconnect}
      />

      {/* Rule Evaluation Drawer */}
      <RuleEvaluationDrawer
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

      {/* 17 Screen Explorer & Exporter Modal */}
      <ScreenExplorerModal
        isOpen={showExplorer}
        onClose={() => setShowExplorer(false)}
        onNavigateToScreen={handleNavigateFromExplorer}
      />

    </div>
  );
}
