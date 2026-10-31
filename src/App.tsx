import React, { useState, useEffect } from 'react';
import { 
  MissionState, 
  Role, 
  MiniGameType, 
  GameStatus 
} from './types/game';
import { createInitialMissionState, calculateFinalScore, getRandomMiniGames, generateRoundId } from './services/gameFactory';
import { validateAndAdvancePhase } from './services/phaseTransition';
import { syncService } from './services/multiplayerSync';
import { colyseusClient } from './services/colyseusClient';
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

import { Columns2, Smartphone, ArrowRightLeft, Radio, Wifi } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<MissionState>(() => createInitialMissionState());
  const [isOnline, setIsOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [showRules, setShowRules] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [dualViewMode, setDualViewMode] = useState(false); // Side-by-side dual phone testing mode

  // 1. Subscribe to Colyseus Server updates
  useEffect(() => {
    const unsubState = colyseusClient.onState((serverState) => {
      setState(serverState);
      setIsOnline(true);
    });

    const unsubConn = colyseusClient.onConnection((status) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        setIsOnline(true);
      } else if (status === 'disconnected') {
        setIsOnline(false);
      }
    });

    const unsubError = colyseusClient.onError((err) => {
      console.warn('[Colyseus Client Warning]:', err);
    });

    return () => {
      unsubState();
      unsubConn();
      unsubError();
    };
  }, []);

  // 2. Demo fallback sync across tabs if not online
  useEffect(() => {
    const unsubscribe = syncService.subscribe((incomingState, sourceRole) => {
      if (!isOnline) {
        setState((prev) => ({
          ...incomingState,
          myRole: prev.myRole,
        }));
      }
    });
    return () => unsubscribe();
  }, [isOnline]);

  // State dispatcher: routes to Colyseus server in online mode, or local demo state
  const updateState = (updater: (prev: MissionState) => MissionState) => {
    setState((prev) => {
      const next = updater(prev);
      if (isOnline && colyseusClient.isConnected()) {
        colyseusClient.sendAction('sync_mission_step', next, prev.roundId, prev.currentPhaseIndex);
      } else {
        syncService.broadcast(next, next.myRole);
      }
      return next;
    });
  };

  // Local demo timer countdown (only active when NOT connected to server)
  useEffect(() => {
    if (isOnline) return; // Server manages authoritative timer in online mode

    const isGameRunning = 
      (state.status === 'phase_game' || state.status === 'phase_energy' || state.status === 'phase_rescue') &&
      !state.isPaused &&
      !state.isDisconnected;

    if (!isGameRunning) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeftSeconds <= 1 || prev.hullIntegrity <= 0) {
          const finalHull = Math.max(0, prev.hullIntegrity);
          const scoreData = calculateFinalScore(
            prev.completedTasksCount || 0,
            0,
            finalHull,
            0
          );
          const failNext: MissionState = {
            ...prev,
            status: 'phase_result',
            outcomeType: 'basarisizlik',
            rescuedCrewCount: 0,
            finalScore: scoreData.total,
            scoreBreakdown: scoreData.breakdown,
            timeLeftSeconds: 0,
            hullIntegrity: finalHull,
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
  }, [state.status, state.isPaused, state.isDisconnected, isOnline]);

  // Handle phase advance: Phase 0 -> Phase 1 -> Phase 2 (Energy) -> Phase 3 (Rescue)
  const handleAdvancePhase = (requestPayload?: { roundId?: string; expectedPhaseIndex?: number } | number | unknown) => {
    let targetRoundId = state.roundId;
    let targetExpected = state.currentPhaseIndex;

    if (typeof requestPayload === 'number') {
      targetExpected = requestPayload;
    } else if (
      requestPayload &&
      typeof requestPayload === 'object' &&
      !('nativeEvent' in requestPayload) &&
      !('target' in requestPayload)
    ) {
      const payload = requestPayload as { roundId?: string; expectedPhaseIndex?: number };
      if (typeof payload.roundId === 'string') {
        targetRoundId = payload.roundId;
      }
      if (typeof payload.expectedPhaseIndex === 'number') {
        targetExpected = payload.expectedPhaseIndex;
      }
    }

    if (isOnline && colyseusClient.isConnected()) {
      colyseusClient.advancePhase(targetRoundId, targetExpected);
    } else {
      updateState((prev) => {
        const result = validateAndAdvancePhase(prev, {
          roundId: targetRoundId,
          expectedPhaseIndex: targetExpected,
        });

        if (!result.success) {
          console.warn(`[Phase Advance Blocked]: ${result.error}`);
          return prev;
        }

        return result.nextState || prev;
      });
    }
  };

  const handleSwitchRole = () => {
    const nextRole = state.myRole === 'kaptan' ? 'muhendis' : 'kaptan';
    if (isOnline && state.status === 'lobby') {
      colyseusClient.selectRole(nextRole);
    } else {
      updateState((prev) => ({
        ...prev,
        myRole: nextRole,
      }));
    }
  };

  const handleToggleDisconnect = () => {
    updateState((prev) => ({
      ...prev,
      isDisconnected: !prev.isDisconnected,
      isPaused: !prev.isDisconnected,
    }));
  };

  const handleReconnect = async () => {
    if (isOnline) {
      const ok = await colyseusClient.attemptReconnect();
      if (!ok) {
        updateState((prev) => ({
          ...prev,
          isDisconnected: false,
          isPaused: false,
        }));
      }
    } else {
      updateState((prev) => ({
        ...prev,
        isDisconnected: false,
        isPaused: false,
      }));
    }
  };

  const handleRestartGame = () => {
    if (isOnline && colyseusClient.isConnected()) {
      colyseusClient.restartRound();
    } else {
      updateState((prev) => {
        const prevPair = prev.selectedMiniGames;
        const newPair = getRandomMiniGames(prevPair);
        const newRoundId = generateRoundId();
        const fresh = createInitialMissionState(
          prev.roomCode,
          prev.activeEnvironment,
          prev.players.kaptan.name,
          prevPair
        );
        fresh.roundId = newRoundId;
        fresh.selectedMiniGames = newPair;
        fresh.status = 'lobby';
        fresh.players.kaptan.name = prev.players.kaptan.name;
        fresh.players.muhendis.name = prev.players.muhendis.name;
        return fresh;
      });
    }
  };

  const handleNavigateFromExplorer = (screenMeta: typeof ALL_17_SCREENS[0], targetRole: Role) => {
    // Explorer runs in separate demo view
    setIsOnline(false);
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

  // Helper to determine if current client is the room leader (host)
  const isLeader = !isOnline || (
    colyseusClient.getSessionId() ? colyseusClient.getSessionId() === state.players.kaptan.id : true
  );

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
          isOnlineMode={true}
          onCreateOnlineRoom={async (code, name, preferredRole) => {
            await colyseusClient.createRoom(code, name, preferredRole);
          }}
          onJoinOnlineRoom={async (code, name) => {
            await colyseusClient.joinRoom(code, name);
          }}
        />
      );
    }

    // 2. Lobby Screen
    if (state.status === 'lobby') {
      return (
        <Screen02Lobby 
          state={currentState} 
          onUpdate={updateState} 
          onStartGame={() => {
            if (isOnline) {
              colyseusClient.startGame();
            } else {
              updateState((p) => ({ ...p, status: 'role_intro' }));
            }
          }}
          isOnline={isOnline}
          isHost={isLeader}
          onToggleMyReady={() => {
            if (isOnline) colyseusClient.toggleReady();
          }}
        />
      );
    }

    // 3 & 4. Role Intro
    if (state.status === 'role_intro') {
      const onConfirm = () => {
        if (isOnline) {
          colyseusClient.confirmRole();
        } else {
          updateState((p) => ({ ...p, status: 'phase_game', currentPhaseIndex: 0 }));
        }
      };

      if (role === 'kaptan') {
        return <Screen03CaptainRole state={currentState} onConfirmRole={onConfirm} />;
      } else {
        return <Screen04EngineerRole state={currentState} onConfirmRole={onConfirm} />;
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
          <Screen05ReactorCaptain 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        ) : (
          <Screen06ReactorEngineer 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        );
      }

      // Sinyal Çözümü
      if (activeGameType === 'sinyal_cozumu') {
        return role === 'kaptan' ? (
          <Screen07SignalCaptain 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        ) : (
          <Screen08SignalEngineer 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        );
      }

      // Kablo Bağlantısı
      if (activeGameType === 'kablo_baglantisi') {
        return role === 'kaptan' ? (
          <Screen09CableCaptain 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        ) : (
          <Screen10CableEngineer 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        );
      }

      // Hava Kilidi
      if (activeGameType === 'hava_kilidi') {
        return role === 'kaptan' ? (
          <Screen11AirlockCaptain 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        ) : (
          <Screen12AirlockEngineer 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        );
      }

      // Radar Yönlendirme
      if (activeGameType === 'radar_yonlendirme') {
        return role === 'kaptan' ? (
          <Screen13RadarCaptain 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        ) : (
          <Screen14RadarEngineer 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
          />
        );
      }
    }

    // 15 & 16. Phase 3: Energy Allocation
    if (state.status === 'phase_energy') {
      return role === 'kaptan' ? (
        <Screen15EnergyCaptain 
          state={currentState} 
          onUpdate={updateState} 
          onAdvancePhase={handleAdvancePhase} 
        />
      ) : (
        <Screen16EnergyEngineer 
          state={currentState} 
          onUpdate={updateState} 
          onAdvancePhase={handleAdvancePhase} 
        />
      );
    }

    // 17A. Phase 4: Rescue Choice
    if (state.status === 'phase_rescue') {
      return (
        <Screen17ARescue 
          state={currentState} 
          onUpdate={updateState} 
          onFinalizeMission={() => {
            if (isOnline) {
              colyseusClient.sendAction('sync_mission_step', state, state.roundId, state.currentPhaseIndex);
            } else {
              updateState((p) => ({ ...p, status: 'phase_result' }));
            }
          }} 
        />
      );
    }

    // 17B. Phase 4B: Final Result
    if (state.status === 'phase_result') {
      return (
        <Screen17BResult 
          state={currentState} 
          onRestartGame={handleRestartGame} 
          onLobbyReturn={handleRestartGame}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#070510] text-[#e6dff9] flex flex-col font-manrope antialiased">
      {/* Top Application Telemetry Navigation Bar */}
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

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col items-center justify-start">
        
        {/* Quick Testing Bar (Dual View & Role Indicator) */}
        <div className="w-full max-w-md md:max-w-4xl mx-auto mb-3 flex items-center justify-between text-xs px-2 py-1 bg-[#141123]/60 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`}></span>
            <span className="font-mono text-[11px] text-[#9e8f78]">
              {isOnline ? 'Çevrimiçi Oda (Colyseus)' : 'Yerel Demo Modu'}
            </span>
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
