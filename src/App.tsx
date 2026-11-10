import React, { useState, useEffect, Suspense } from 'react';
import { 
  MissionState, 
  Role, 
  MiniGameType, 
  GameStatus,
  OperationTheme 
} from './types/game';
import { createInitialMissionState, calculateFinalScore, getRandomMiniGames, generateRoundId, generateKarantinaData } from './services/gameFactory';
import { validateAndAdvancePhase } from './services/phaseTransition';
import { applyLocalGameAction } from './services/localGameEngine';
import { syncService } from './services/multiplayerSync';
import { colyseusClient } from './services/colyseusClient';
import { ConsoleHeader } from './components/ConsoleHeader';
import { NetworkDisconnectModal } from './components/NetworkDisconnectModal';
import { RuleEvaluationDrawer } from './components/RuleEvaluationDrawer';
import { ScreenExplorerModal, ALL_17_SCREENS } from './components/ScreenExplorerModal';

// Tactical Comms & Radio
import { TacticalRadioModal } from './components/TacticalRadioModal';
import { TacticalRadioBanner } from './components/TacticalRadioBanner';

// Preloadable Lazy Screen Registry & Predictive Caching
import { Screens, preloadUpcomingScreens, preloadAllScreensProgressive } from './services/screenPreloader';
import { ConsoleScreenFallback } from './components/ConsoleScreenFallback';
import { EpicSuccessFeedback } from './components/EpicSuccessFeedback';

const {
  Screen00Opening,
  Screen01Entry,
  Screen02Lobby,
  Screen03CaptainRole,
  Screen04EngineerRole,
  Screen05ReactorCaptain,
  Screen06ReactorEngineer,
  Screen07SignalCaptain,
  Screen08SignalEngineer,
  Screen09CableCaptain,
  Screen10CableEngineer,
  Screen11AirlockCaptain,
  Screen12AirlockEngineer,
  Screen13RadarCaptain,
  Screen14RadarEngineer,
  Screen15EnergyCaptain,
  Screen16EnergyEngineer,
  Screen17ARescue,
  Screen17BResult,
  ScreenAdvancedMission,
  ScreenKarantinaPhase1Bio,
  ScreenKarantinaPhase1Sec,
  ScreenKarantinaPhase2Bio,
  ScreenKarantinaPhase2Sec,
  ScreenKarantinaPhase3Bio,
  ScreenKarantinaPhase3Sec,
  ScreenKarantinaResult,
} = Screens;

import { Columns2, Smartphone, ArrowRightLeft, Radio, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from './services/soundEffects';

export default function App() {
  const [state, setState] = useState<MissionState>(() => ({
    ...createInitialMissionState(),
    status: 'opening',
  }));
  const [isOnline, setIsOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [showRules, setShowRules] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [dualViewMode, setDualViewMode] = useState(false); // Side-by-side dual phone testing mode
  const [showRadio, setShowRadio] = useState(false); // Tactical walkie-talkie modal
  const [showEpicSuccess, setShowEpicSuccess] = useState(false);
  const [epicSuccessData, setEpicSuccessData] = useState<{ title: string; subtitle: string }>({
    title: 'GÖREV BAŞARIYLA TAMAMLANDI!',
    subtitle: 'Tüm kritik sistemler stabilize edildi • Tam İzolasyon Sağlandı',
  });
  const [isShaking, setIsShaking] = useState(false);

  // Trigger epic golden flash and screen shake animation
  const triggerEpicSuccess = (customTitle?: string, customSubtitle?: string) => {
    if (customTitle || customSubtitle) {
      setEpicSuccessData({
        title: customTitle || 'GÖREV BAŞARIYLA TAMAMLANDI!',
        subtitle: customSubtitle || 'Tüm kritik sistemler stabilize edildi • Tam İzolasyon Sağlandı',
      });
    }
    setShowEpicSuccess(true);
    setIsShaking(true);
    soundManager.playSuccess();
    setTimeout(() => setIsShaking(false), 550);
  };

  // 1. Yerel Çalışma Modu: Colyseus sunucu bağımlılığı olmadan sekmeler arası canlı senkronizasyon (BroadcastChannel + LocalStorage)
  useEffect(() => {
    const unsubscribe = syncService.subscribe((incomingState, sourceRole) => {
      setState((prev) => ({
        ...incomingState,
        myRole: prev.myRole,
      }));
    });
    return () => unsubscribe();
  }, []);

  // 1B. Çevrimiçi Mod: Colyseus WebSocket sunucu canlı senkronizasyonu
  useEffect(() => {
    const unsubState = colyseusClient.onState((incomingState) => {
      setState((prev) => {
        const sessionId = colyseusClient.getSessionId();
        let myRole = prev.myRole;
        if (incomingState.players.kaptan.id === sessionId) {
          myRole = 'kaptan';
        } else if (incomingState.players.muhendis.id === sessionId) {
          myRole = 'muhendis';
        }
        return {
          ...incomingState,
          myRole,
        };
      });
    });

    const unsubConn = colyseusClient.onConnection((status) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        setIsOnline(true);
      } else if (status === 'disconnected') {
        setIsOnline(false);
      }
    });

    return () => {
      unsubState();
      unsubConn();
    };
  }, []);

  // 2. Ön Yükleme Stratejisi: Durum/aşama değiştikçe bir sonraki ekranları önceden belleğe al
  useEffect(() => {
    preloadUpcomingScreens(state);
  }, [state.status, state.currentPhaseIndex, state.operationTheme, state.selectedMiniGames, state.gameMode]);

  // 3. Arka Planda Kademeli Ön Bellekleme: Tüm ekranları idle zamanında V8 belleğine al
  useEffect(() => {
    preloadAllScreensProgressive(600);
  }, []);

  // State dispatcher: routes to local state and local broadcast across tabs
  const updateState = (updater: (prev: MissionState) => MissionState) => {
    setState((prev) => {
      const next = updater(prev);
      syncService.broadcast(next, next.myRole);
      return next;
    });
  };

  // Authoritative local or online action dispatcher for single view, tab sync, or dual view
  const handleAction = (actionType: string, data: any, actingRole: Role = state.myRole) => {
    if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
      colyseusClient.sendAction(actionType, data, state.roundId, state.currentPhaseIndex);
      return;
    }

    updateState((prev) => {
      const next = applyLocalGameAction(prev, actionType, data, actingRole);
      if (next.feedbackState === 'error') {
        soundManager.playError();
      } else if (next.feedbackState === 'success') {
        soundManager.playSuccess();
        if (next.status === 'phase_result' && next.outcomeType === 'tam_basari') {
          triggerEpicSuccess('OPERASYON BAŞARILI!', 'Salgın durduruldu ve tüm biyo-bütünlük sağlandı!');
        } else {
          triggerEpicSuccess('AŞAMA BAŞARIYLA TAMAMLANDI!', next.feedbackMessage || 'Kritik sistem parametresi mühürlendi ve kilitlendi.');
        }
      } else {
        soundManager.playClick();
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

        if (prev.timeLeftSeconds === 30 || prev.timeLeftSeconds === 10) {
          soundManager.playWarning();
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

    if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
      colyseusClient.advancePhase(targetRoundId, targetExpected);
    } else {
      updateState((prev) => {
        const result = validateAndAdvancePhase(prev, {
          roundId: targetRoundId,
          expectedPhaseIndex: targetExpected,
        });

        if (!result.success) {
          console.warn(`[Phase Advance Blocked]: ${result.error}`);
          soundManager.playError();
          return prev;
        }

        soundManager.playSuccess();
        triggerEpicSuccess('PROTOKOL AŞAMASI GEÇİLDİ!', 'Sonraki kritik operasyon modülüne başarıyla bağlanıldı.');
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

  // Auto trigger epic victory feedback when entering full success outcome
  useEffect(() => {
    if (state.status === 'phase_result' && state.outcomeType === 'tam_basari') {
      triggerEpicSuccess('OPERASYON BAŞARILI!', 'Müfreze tüm protokolleri başarıyla tamamladı.');
    }
  }, [state.status, state.outcomeType]);

  const handleRestartGame = () => {
    if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
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
        fresh.operationTheme = prev.operationTheme;
        if (prev.operationTheme === 'karantina_2088') {
          fresh.karantinaData = generateKarantinaData();
          fresh.players.kaptan.name = prev.players.kaptan.name || 'Baş Biyolog Selin';
          fresh.players.muhendis.name = prev.players.muhendis.name || 'Güvenlik Şefi Baran';
        } else {
          fresh.players.kaptan.name = prev.players.kaptan.name;
          fresh.players.muhendis.name = prev.players.muhendis.name;
        }
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

      if (screenMeta.theme) {
        updated.operationTheme = screenMeta.theme;
        if (screenMeta.theme === 'karantina_2088' && !updated.karantinaData) {
          updated.karantinaData = generateKarantinaData();
          if (updated.players?.kaptan) updated.players.kaptan.name = 'Baş Biyolog Selin';
          if (updated.players?.muhendis) updated.players.muhendis.name = 'Güvenlik Şefi Baran';
        }
      }

      if (screenMeta.id === 19 || screenMeta.id === 30) {
        updated.outcomeType = 'basarisizlik';
        updated.rescuedCrewCount = 0;
        updated.timeLeftSeconds = 0;
        updated.hullIntegrity = 0;
      } else if (screenMeta.id === 18 || screenMeta.id === 29) {
        updated.outcomeType = 'tam_basari';
        updated.rescuedCrewCount = 10;
        updated.timeLeftSeconds = 114;
        updated.hullIntegrity = 92;
      }

      preloadUpcomingScreens(updated);
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
    const roleAction = (actionType: string, data: any) => handleAction(actionType, data, role);

    // 0. Game Opening & Showcase Cards Screen
    if (state.status === 'opening') {
      return (
        <Screen00Opening
          onStartGame={(theme?: OperationTheme) => {
            updateState((p) => ({
              ...p,
              operationTheme: theme || p.operationTheme || 'derin_basinc',
              status: 'entry',
            }));
          }}
          onStartDualView={(theme?: OperationTheme) => {
            setDualViewMode(true);
            updateState((p) => ({
              ...p,
              operationTheme: theme || p.operationTheme || 'derin_basinc',
              status: 'entry',
            }));
          }}
          onOpenRules={() => setShowRules(true)}
          onOpenExplorer={() => setShowExplorer(true)}
        />
      );
    }

    // 1. Entry Screen
    if (state.status === 'entry') {
      return (
        <Screen01Entry 
          state={currentState} 
          onUpdate={updateState} 
          onStartLobby={() => updateState((p) => ({ ...p, status: 'lobby' }))}
          onBackToOpening={() => updateState((p) => ({ ...p, status: 'opening' }))}
          isOnlineMode={!dualViewMode}
          onCreateOnlineRoom={async (roomCode: string, playerName: string, role: Role, _sector: string) => {
            setIsOnline(true);
            await colyseusClient.createRoom(roomCode, playerName, role, state.activeEnvironment, state.operationTheme);
          }}
          onJoinOnlineRoom={async (roomCode: string, playerName: string) => {
            setIsOnline(true);
            await colyseusClient.joinRoom(roomCode, playerName);
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
            if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
              colyseusClient.startGame();
            } else {
              updateState((p) => ({ ...p, status: 'role_intro' }));
            }
          }}
          isOnline={isOnline && !dualViewMode}
          isHost={isLeader}
          onToggleMyReady={() => {
            if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
              colyseusClient.toggleReady();
            } else {
              updateState((prev) => ({
                ...prev,
                players: {
                  ...prev.players,
                  [role]: {
                    ...prev.players[role],
                    ready: !prev.players[role].ready,
                  },
                },
              }));
            }
          }}
        />
      );
    }

    // 3 & 4. Role Intro
    if (state.status === 'role_intro') {
      const onConfirm = () => {
        if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
          colyseusClient.confirmRole();
          return;
        }

        updateState((prev) => {
          const nextPlayers = {
            ...prev.players,
            [role]: {
              ...prev.players[role],
              roleConfirmed: true,
            },
          };
          const bothConfirmed = dualViewMode
            ? (nextPlayers.kaptan.roleConfirmed && nextPlayers.muhendis.roleConfirmed)
            : true;
          return {
            ...prev,
            players: nextPlayers,
            status: bothConfirmed ? 'phase_game' : 'role_intro',
            currentPhaseIndex: 0,
          };
        });
      };

      if (role === 'kaptan') {
        return <Screen03CaptainRole state={currentState} onConfirmRole={onConfirm} />;
      } else {
        return <Screen04EngineerRole state={currentState} onConfirmRole={onConfirm} />;
      }
    }

    // 5 to 14. Phase Games (Phase Index 0 & 1)
    if (state.status === 'phase_game') {
      if (state.operationTheme === 'karantina_2088') {
        if (state.currentPhaseIndex === 0) {
          return role === 'kaptan' ? (
            <ScreenKarantinaPhase1Bio 
              state={currentState} 
              onUpdate={updateState} 
              onAdvancePhase={handleAdvancePhase} 
              onAction={roleAction}
            />
          ) : (
            <ScreenKarantinaPhase1Sec 
              state={currentState} 
              onUpdate={updateState} 
              onAdvancePhase={handleAdvancePhase} 
              onAction={roleAction}
            />
          );
        } else if (state.currentPhaseIndex === 1) {
          return role === 'kaptan' ? (
            <ScreenKarantinaPhase2Bio 
              state={currentState} 
              onUpdate={updateState} 
              onAdvancePhase={handleAdvancePhase} 
              onAction={roleAction}
            />
          ) : (
            <ScreenKarantinaPhase2Sec 
              state={currentState} 
              onUpdate={updateState} 
              onAdvancePhase={handleAdvancePhase} 
              onAction={roleAction}
            />
          );
        } else {
          return role === 'kaptan' ? (
            <ScreenKarantinaPhase3Bio 
              state={currentState} 
              onUpdate={updateState} 
              onAdvancePhase={handleAdvancePhase} 
              onAction={roleAction}
            />
          ) : (
            <ScreenKarantinaPhase3Sec 
              state={currentState} 
              onUpdate={updateState} 
              onAdvancePhase={handleAdvancePhase} 
              onAction={roleAction}
            />
          );
        }
      }

      if (state.gameMode === 'gelismis') {
        return (
          <ScreenAdvancedMission
            state={currentState}
            onUpdate={updateState}
            onAction={roleAction}
            role={role}
          />
        );
      }

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
            onAction={roleAction}
          />
        ) : (
          <Screen06ReactorEngineer 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
            onAction={roleAction}
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
            onAction={roleAction}
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
            onAction={roleAction}
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
            onAction={roleAction}
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
            onAction={roleAction}
          />
        );
      }
    }

    // 15 & 16. Phase 3: Energy Allocation
    if (state.status === 'phase_energy') {
      if (state.operationTheme === 'karantina_2088') {
        return role === 'kaptan' ? (
          <ScreenKarantinaPhase3Bio 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
            onAction={roleAction}
          />
        ) : (
          <ScreenKarantinaPhase3Sec 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
            onAction={roleAction}
          />
        );
      }
      return role === 'kaptan' ? (
        <Screen15EnergyCaptain 
          state={currentState} 
          onUpdate={updateState} 
          onAdvancePhase={handleAdvancePhase} 
          onAction={roleAction}
        />
      ) : (
        <Screen16EnergyEngineer 
          state={currentState} 
          onUpdate={updateState} 
          onAdvancePhase={handleAdvancePhase} 
          onAction={roleAction}
        />
      );
    }

    // 17A. Phase 4: Rescue Choice
    if (state.status === 'phase_rescue') {
      if (state.operationTheme === 'karantina_2088') {
        return role === 'kaptan' ? (
          <ScreenKarantinaPhase3Bio 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
            onAction={roleAction}
          />
        ) : (
          <ScreenKarantinaPhase3Sec 
            state={currentState} 
            onUpdate={updateState} 
            onAdvancePhase={handleAdvancePhase} 
            onAction={roleAction}
          />
        );
      }
      return (
        <Screen17ARescue 
          state={currentState} 
          onUpdate={updateState} 
          onAction={roleAction}
          onFinalizeMission={() => {
            if (!isOnline || dualViewMode) {
              updateState((p) => ({ ...p, status: 'phase_result' }));
            }
          }} 
        />
      );
    }

    // 17B. Phase 4B: Final Result
    if (state.status === 'phase_result') {
      if (state.operationTheme === 'karantina_2088') {
        return (
          <ScreenKarantinaResult 
            state={currentState} 
            onRestartGame={handleRestartGame} 
            onBackToLobby={() => updateState((p) => ({
              ...p,
              status: 'lobby',
              currentPhaseIndex: 0,
              timeLeftSeconds: 300,
              hullIntegrity: 100,
              karantinaData: generateKarantinaData(),
            }))}
          />
        );
      }
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
        operationTheme={state.operationTheme}
        onToggleDisconnect={handleToggleDisconnect}
        onSwitchRole={handleSwitchRole}
        onOpenRules={() => setShowRules(true)}
        onOpenScreenExplorer={() => setShowExplorer(true)}
        onOpenOpening={() => updateState((p) => ({ ...p, status: 'opening' }))}
        onTestEpicSuccess={() => triggerEpicSuccess()}
        onOpenRadio={() => setShowRadio(true)}
      />

      {/* Main Container with subtle screen shake */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col items-center justify-start overflow-hidden">
        <motion.div
          animate={isShaking ? {
            x: [0, -8, 8, -6, 6, -3, 3, 0],
            y: [0, 5, -5, 3, -3, 1, 0],
          } : { x: 0, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full flex-1 flex flex-col items-center justify-start"
        >
        
        {/* Quick Testing Bar (Dual View & Role Indicator) - Hidden on Opening Screen */}
        {state.status !== 'opening' && (
          <div className="w-full max-w-md md:max-w-4xl mx-auto mb-3 flex flex-wrap items-center justify-between gap-2 text-xs px-3 py-1.5 bg-[#141123]/80 rounded-xl border border-white/10 backdrop-blur-md shadow-md">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-cyan-400 shadow-[0_0_8px_#00eefc]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'} animate-pulse`}></span>
              <span className={`font-mono text-xs font-bold ${isOnline ? 'text-cyan-300' : 'text-emerald-300'}`}>
                {isOnline ? '🌐 Çevrimiçi Çok Oyunculu (Canlı WebSocket)' : '⚡ Yerel Mod (Colyseus Bağımsız • Anında Çalışır)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSwitchRole}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[#e6dff9] font-mono text-[11px] transition-colors cursor-pointer"
                title="Rolü Kaptan / Mühendis arasında değiştir"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#ffb703]" />
                <span>
                  Rol: <strong className="text-[#00f0ff] uppercase">
                    {state.myRole === 'kaptan' 
                      ? (state.operationTheme === 'karantina_2088' ? 'BAŞ BİYOLOG' : state.operationTheme === 'golge_protokolu' ? 'AJAN' : state.operationTheme === 'derin_basinc' ? 'DÜMENCİ' : 'KAPTAN') 
                      : (state.operationTheme === 'karantina_2088' ? 'GÜVENLİK ŞEFİ' : state.operationTheme === 'golge_protokolu' ? 'HACKER' : state.operationTheme === 'derin_basinc' ? 'MAKİNİST' : 'MÜHENDİS')}
                  </strong>
                </span>
              </button>

              <button
                onClick={() => setDualViewMode(!dualViewMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono transition-colors shadow-sm cursor-pointer ${
                  dualViewMode 
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]' 
                    : 'bg-white/5 text-[#a59db8] border-white/10 hover:text-white'
                }`}
                title="Kaptan ve Mühendis ekranlarını yan yana 2 telefon gibi gösterir"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>{dualViewMode ? 'Tek Telefon Görünümü' : 'İkili Telefon (Dual View)'}</span>
              </button>

              <button
                onClick={() => setShowRadio(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all shadow-sm cursor-pointer bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)] active:scale-95"
                title="Taktik Telsiz Konsolunu Aç (142.85 MHz / Bas-Konuş)"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Telsiz (PTT)</span>
              </button>
            </div>
          </div>
        )}

        {/* View Layout: Single Screen or Dual Phone Split */}
        {dualViewMode && state.status !== 'opening' ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start justify-center">
            {/* Left Phone: Kaptan */}
            <div className="w-full max-w-md mx-auto p-1 rounded-3xl bg-[#141123] border-2 border-amber-500/40 shadow-2xl flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#ffb703] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ffb703]"></span>
                  1. CİHAZ • {state.operationTheme === 'karantina_2088' ? 'BAŞ BİYOLOG' : state.operationTheme === 'golge_protokolu' ? 'SAHADAKİ AJAN' : state.operationTheme === 'derin_basinc' ? 'DÜMENCİ' : 'KAPTAN'} GÖRÜNÜMÜ
                </span>
                <span className="text-[#9e8f78]">SOL TELEFON</span>
              </div>
              <div className="p-2 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`kaptan_${state.status}_${state.currentPhaseIndex}_${state.operationTheme}_${state.selectedMiniGames[state.currentPhaseIndex] || ''}_${state.gameMode}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <Suspense fallback={<ConsoleScreenFallback role="kaptan" theme={state.operationTheme} />}>
                      {renderScreenForRole('kaptan')}
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Phone: Mühendis */}
            <div className="w-full max-w-md mx-auto p-1 rounded-3xl bg-[#141123] border-2 border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#00f0ff] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff]"></span>
                  2. CİHAZ • {state.operationTheme === 'karantina_2088' ? 'GÜVENLİK ŞEFİ' : state.operationTheme === 'golge_protokolu' ? 'GÖLGE HACKER' : state.operationTheme === 'derin_basinc' ? 'MAKİNİST' : 'MÜHENDİS'} GÖRÜNÜMÜ
                </span>
                <span className="text-[#9e8f78]">SAĞ TELEFON</span>
              </div>
              <div className="p-2 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`muhendis_${state.status}_${state.currentPhaseIndex}_${state.operationTheme}_${state.selectedMiniGames[state.currentPhaseIndex] || ''}_${state.gameMode}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <Suspense fallback={<ConsoleScreenFallback role="muhendis" theme={state.operationTheme} />}>
                      {renderScreenForRole('muhendis')}
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${state.myRole}_${state.status}_${state.currentPhaseIndex}_${state.operationTheme}_${state.selectedMiniGames[state.currentPhaseIndex] || ''}_${state.gameMode}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex justify-center"
              >
                <Suspense fallback={<ConsoleScreenFallback role={state.myRole} theme={state.operationTheme} />}>
                  {renderScreenForRole(state.myRole)}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        </motion.div>
      </main>

      {/* Epic Mission Complete & Success Feedback Overlay */}
      <EpicSuccessFeedback
        show={showEpicSuccess}
        title={epicSuccessData.title}
        subtitle={epicSuccessData.subtitle}
        onComplete={() => setShowEpicSuccess(false)}
      />

      {/* Disconnect Simulation Modal */}
      <NetworkDisconnectModal
        isOpen={state.isDisconnected}
        onReconnect={handleReconnect}
        countdownSeconds={(() => {
          const matchSec = state.feedbackMessage?.match(/(\d+)s/);
          return matchSec ? parseInt(matchSec[1], 10) : 45;
        })()}
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

      {/* Floating Tactical Walkie-Talkie Button on Mobile */}
      {state.status !== 'opening' && (
        <button
          onClick={() => setShowRadio(true)}
          className="fixed bottom-5 right-5 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-[#191535] to-[#25204d] text-emerald-300 border-2 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.45)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
          title="Telsiz İletişim Hattını Aç [142.85 MHz]"
        >
          <Radio className="w-6 h-6 text-emerald-400 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0b081a] animate-ping" />
          <span className="sr-only">Telsiz</span>
        </button>
      )}

      {/* Incoming Radio Transmission Dropdown Banner */}
      <TacticalRadioBanner onOpenRadio={() => setShowRadio(true)} />

      {/* Tactical Radio Comms Modal (PTT / Walkie-Talkie) */}
      <TacticalRadioModal
        isOpen={showRadio}
        onClose={() => setShowRadio(false)}
        myRole={state.myRole}
        operationTheme={state.operationTheme}
        playerName={state.myRole === 'kaptan' ? state.players.kaptan.name : state.players.muhendis.name}
      />

    </div>
  );
}
