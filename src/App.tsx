import React, { useState, useEffect, Suspense } from 'react';
import { 
  MissionState, 
  Role, 
  MiniGameType, 
  GameStatus,
  OperationTheme 
} from './types/game';
import { createInitialMissionState, calculateFinalScore, getRandomMiniGames, generateRoundId, generateKarantinaData, generateAdvancedScenario } from './services/gameFactory';
import {
  isTeamOperationTheme,
  getTeamThemeFromCode,
  getTeamOperationMeta,
  generateOmegaData,
  getOmegaRolesForCount,
  getOmegaRoleMeta,
} from './services/omegaGameEngine';
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
import { Screen00Opening } from './components/screens/Screen00Opening';
import { ConsoleScreenFallback } from './components/ConsoleScreenFallback';
import { EpicSuccessFeedback } from './components/EpicSuccessFeedback';
import { OfflineIndicator } from './components/PWAInstallButton';

const {
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
  ScreenOmegaRoleIntro,
  ScreenOmegaPlay,
  ScreenOmegaResult,
} = Screens;

import { Columns2, Smartphone, ArrowRightLeft, Radio, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [localReconnectCountdown, setLocalReconnectCountdown] = useState(45);

  const isOnlineRef = React.useRef(isOnline);
  const dualViewModeRef = React.useRef(dualViewMode);
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);
  useEffect(() => {
    dualViewModeRef.current = dualViewMode;
  }, [dualViewMode]);

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
    const unsubscribe = syncService.subscribe((incomingState) => {
      if (isOnlineRef.current && !dualViewModeRef.current) return;
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
        // Trigger online SFX on authoritative server state transitions
        if (
          prev.status !== incomingState.status &&
          (incomingState.status === 'phase_energy' ||
            incomingState.status === 'phase_rescue' ||
            incomingState.status === 'phase_game')
        ) {
          soundManager.playSuccess();
        } else if (incomingState.currentPhaseIndex > prev.currentPhaseIndex) {
          soundManager.playSuccess();
        } else if (
          incomingState.feedbackState === 'success' &&
          (prev.feedbackState !== 'success' || prev.feedbackMessage !== incomingState.feedbackMessage)
        ) {
          soundManager.playSuccess();
        } else if (
          incomingState.feedbackState === 'error' &&
          (prev.feedbackState !== 'error' || prev.feedbackMessage !== incomingState.feedbackMessage)
        ) {
          soundManager.playError();
        }

        if (
          (incomingState.timeLeftSeconds === 30 || incomingState.timeLeftSeconds === 10) &&
          prev.timeLeftSeconds !== incomingState.timeLeftSeconds &&
          (incomingState.status === 'phase_game' || incomingState.status === 'phase_energy' || incomingState.status === 'phase_rescue')
        ) {
          soundManager.playWarning();
        }

        const sessionId = colyseusClient.getSessionId();
        let myRole = prev.myRole;
        if (incomingState.players.kaptan.id === sessionId) {
          myRole = 'kaptan';
        } else if (incomingState.players.muhendis.id === sessionId) {
          myRole = 'muhendis';
        } else if (incomingState.players.kriptolog?.id === sessionId) {
          myRole = 'kriptolog';
        } else if (incomingState.players.guvenlik?.id === sessionId) {
          myRole = 'guvenlik';
        }
        return {
          ...incomingState,
          myRole,
        };
      });
    });

    const unsubConn = colyseusClient.onConnection((status) => {
      setConnectionStatus(status);
      if (status === 'connected' || status === 'reconnecting') {
        setIsOnline(true);
      } else if (status === 'disconnected') {
        setIsOnline(false);
      }
    });

    const unsubErr = colyseusClient.onError((msg) => {
      soundManager.playError();
      setState((prev) => ({
        ...prev,
        feedbackState: 'error',
        feedbackMessage: msg,
      }));
    });

    return () => {
      unsubState();
      unsubConn();
      unsubErr();
    };
  }, []);

  // 1B-2. Local reconnect countdown & instant retry when browser network returns
  useEffect(() => {
    if (connectionStatus !== 'reconnecting') {
      setLocalReconnectCountdown(45);
      return;
    }
    const timer = setInterval(() => {
      setLocalReconnectCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    const handleOnline = () => {
      colyseusClient.retryReconnectNow().catch(() => false);
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
    };
  }, [connectionStatus]);

  // 1C. Auto-reconnect if page reloads mid-session (unless user opened an explicit invite link ?room=)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hasExplicitInvite = Boolean(params.get('room') || params.get('code') || params.get('oda'));
    if (hasExplicitInvite) return;
    if (colyseusClient.getReconnectionToken()) {
      colyseusClient.attemptReconnect({ keepTokenOnTransientError: true }).catch(() => false);
    }
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
      soundManager.playClick();
      colyseusClient.sendAction(actionType, data, state.roundId, state.currentPhaseIndex);
      return;
    }

    updateState((prev) => {
      const next = applyLocalGameAction(prev, actionType, data, actingRole);
      if (next.feedbackState === 'error') {
        soundManager.playError();
      } else if (next.feedbackState === 'success') {
        soundManager.playSuccess();
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
        return result.nextState || prev;
      });
    }
  };

  const handleSwitchRole = () => {
    if (isOnline && !dualViewMode && state.status !== 'lobby') {
      soundManager.playError();
      return;
    }
    let nextRole: Role;
    if (isTeamOperationTheme(state.operationTheme)) {
      const pCount = state.targetPlayerCount === 3 ? 3 : 4;
      const roles = getOmegaRolesForCount(pCount);
      const curIdx = roles.indexOf(state.myRole);
      nextRole = roles[(curIdx + 1) % roles.length];
    } else {
      nextRole = state.myRole === 'kaptan' ? 'muhendis' : 'kaptan';
    }
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
    if (connectionStatus === 'reconnecting' || (isOnline && !colyseusClient.isConnected())) {
      await colyseusClient.retryReconnectNow();
      return;
    }
    if (isOnline && colyseusClient.isConnected()) {
      return;
    }
    updateState((prev) => ({
      ...prev,
      isDisconnected: false,
      isPaused: false,
    }));
  };

  // Auto trigger epic victory feedback when entering full success outcome
  useEffect(() => {
    if (state.status === 'phase_result' && state.outcomeType === 'tam_basari') {
      const subtitle =
        isTeamOperationTheme(state.operationTheme)
          ? `${getTeamOperationMeta(state.operationTheme).shortTitle} ekibi 5/5 aşamayı kilitledi ve tahliyeyi tamamladı!`
          : state.operationTheme === 'karantina_2088'
          ? 'Salgın durduruldu ve tüm biyo-bütünlük sağlandı!'
          : state.operationTheme === 'derin_basinc'
          ? 'HİDRO-04 denizaltısı güvenli yüzeye ulaştı!'
          : state.operationTheme === 'golge_protokolu'
          ? 'Veri sızdırıldı ve iz bırakmadan tahliye tamamlandı!'
          : 'Mürettebat kurtarma rotasına başarıyla kilitlendi!';
      triggerEpicSuccess('OPERASYON BAŞARILI!', subtitle);
    }
  }, [state.status, state.outcomeType, state.operationTheme]);

  const handleLeaveToEntry = async () => {
    if (isOnline || colyseusClient.isConnected() || connectionStatus !== 'disconnected') {
      try {
        await colyseusClient.leaveRoom();
      } catch {
        // ignore leave error
      }
      setIsOnline(false);
      setConnectionStatus('disconnected');
    }
    updateState((p) => ({
      ...p,
      status: 'entry',
      isDisconnected: false,
      isPaused: false,
    }));
  };

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
        fresh.gameMode = prev.gameMode;
        fresh.status = 'lobby';
        fresh.operationTheme = prev.operationTheme;
        fresh.targetPlayerCount = prev.targetPlayerCount || 2;
        if (isTeamOperationTheme(prev.operationTheme)) {
          const pCount: 3 | 4 = prev.targetPlayerCount === 3 ? 3 : 4;
          fresh.targetPlayerCount = pCount;
          fresh.timeLeftSeconds = 480;
          fresh.omegaData = generateOmegaData(pCount, prev.operationTheme);
          const roles = getOmegaRolesForCount(pCount);
          for (const r of roles) {
            const oldSlot = prev.players[r];
            const meta = getOmegaRoleMeta(r, pCount);
            fresh.players[r] = {
              id: oldSlot?.id || `local_${r}`,
              name: oldSlot?.name || meta.defaultName,
              role: r,
              ready: false,
              connected: oldSlot?.connected ?? true,
              roleConfirmed: false,
            };
          }
          return fresh;
        }
        if (prev.operationTheme === 'karantina_2088') {
          fresh.karantinaData = generateKarantinaData();
          fresh.players.kaptan.name = prev.players.kaptan.name || 'Baş Biyolog Selin';
          fresh.players.muhendis.name = prev.players.muhendis.name || 'Güvenlik Şefi Baran';
        } else {
          fresh.players.kaptan.name = prev.players.kaptan.name;
          fresh.players.muhendis.name = prev.players.muhendis.name;
        }
        fresh.players.kaptan.connected = prev.players.kaptan.connected;
        fresh.players.muhendis.connected = prev.players.muhendis.connected;
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
        feedbackState: 'idle',
        feedbackMessage: '',
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

      if (screenMeta.gameMode) {
        updated.gameMode = screenMeta.gameMode;
        if (screenMeta.gameMode === 'gelismis' && !updated.advancedScenario) {
          updated.advancedScenario = generateAdvancedScenario();
        }
      } else if (screenMeta.statusKey === 'phase_game' && !isTeamOperationTheme(screenMeta.theme) && screenMeta.theme !== 'karantina_2088') {
        updated.gameMode = 'standart';
      }

      if (screenMeta.theme) {
        updated.operationTheme = screenMeta.theme;
        if (isTeamOperationTheme(screenMeta.theme)) {
          const pCount: 3 | 4 = prev.targetPlayerCount === 3 ? 3 : 4;
          updated.targetPlayerCount = pCount;
          updated.timeLeftSeconds = 480;
          updated.omegaData = generateOmegaData(pCount, screenMeta.theme);
          const nextPlayers = { ...prev.players };
          for (const r of getOmegaRolesForCount(pCount)) {
            const meta = getOmegaRoleMeta(r, pCount);
            nextPlayers[r] = nextPlayers[r] || {
              id: `local_${r}`,
              name: meta.defaultName,
              role: r,
              ready: true,
              connected: true,
              roleConfirmed: true,
            };
          }
          updated.players = nextPlayers;
        } else if (screenMeta.theme === 'karantina_2088' && !updated.karantinaData) {
          updated.targetPlayerCount = 2;
          updated.karantinaData = generateKarantinaData();
          if (updated.players?.kaptan) updated.players.kaptan.name = 'Baş Biyolog Selin';
          if (updated.players?.muhendis) updated.players.muhendis.name = 'Güvenlik Şefi Baran';
        } else {
          updated.targetPlayerCount = 2;
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
    colyseusClient.getSessionId() ? colyseusClient.getSessionId() === (state.hostId || state.players.kaptan.id) : true
  );

  // Helper to render active screen for a specific role
  const renderScreenForRole = (role: Role) => {
    const currentState = { ...state, myRole: role };
    const roleAction = (actionType: string, data: any) => handleAction(actionType, data, role);

    // 0. Game Opening & Showcase Cards Screen
    if (state.status === 'opening') {
      return (
        <Screen00Opening
          currentTheme={state.operationTheme}
          onSelectTheme={(theme: OperationTheme) => {
            updateState((p) => ({
              ...p,
              operationTheme: theme,
            }));
          }}
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
          onCreateOnlineRoom={async (
            roomCode: string,
            playerName: string,
            role: Role,
            _sector: string,
            gameMode?: 'standart' | 'gelismis',
            targetPlayerCount?: 2 | 3 | 4
          ) => {
            setIsOnline(true);
            const inferredTheme: OperationTheme =
              getTeamThemeFromCode(roomCode) || state.operationTheme || 'kayip_sinyal';
            await colyseusClient.createRoom(
              roomCode,
              playerName,
              role,
              state.activeEnvironment,
              inferredTheme,
              gameMode,
              targetPlayerCount
            );
          }}
          onJoinOnlineRoom={async (roomCode: string, playerName: string, preferredRole?: Role) => {
            setIsOnline(true);
            await colyseusClient.joinRoom(roomCode, playerName, preferredRole);
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
          onLeaveToEntry={handleLeaveToEntry}
          onStartGame={() => {
            if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
              colyseusClient.startGame();
            } else {
              updateState((p) => ({ ...p, status: 'role_intro' }));
            }
          }}
          isOnline={isOnline && !dualViewMode}
          isHost={isLeader}
          onSelectRole={(targetRole: Role) => {
            if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
              colyseusClient.selectRole(targetRole);
            } else {
              updateState((prev) => ({ ...prev, myRole: targetRole }));
            }
          }}
          onToggleMyReady={() => {
            if (isOnline && colyseusClient.isConnected() && !dualViewMode) {
              colyseusClient.toggleReady();
            } else {
              updateState((prev) => {
                const slot = prev.players[role];
                if (!slot) return prev;
                return {
                  ...prev,
                  players: {
                    ...prev.players,
                    [role]: {
                      ...slot,
                      ready: !slot.ready,
                    },
                  },
                };
              });
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
          const prevSlot = prev.players[role] || {
            id: `local_${role}`,
            name: role,
            role,
            ready: true,
            connected: true,
          };
          const nextPlayers = {
            ...prev.players,
            [role]: {
              ...prevSlot,
              roleConfirmed: true,
            },
          };
          let allConfirmed = true;
          if (dualViewMode) {
            if (isTeamOperationTheme(prev.operationTheme)) {
              const roles = getOmegaRolesForCount(prev.targetPlayerCount === 3 ? 3 : 4);
              allConfirmed = roles.every((r) => Boolean(nextPlayers[r]?.roleConfirmed));
            } else {
              allConfirmed = Boolean(nextPlayers.kaptan.roleConfirmed && nextPlayers.muhendis.roleConfirmed);
            }
          }
          return {
            ...prev,
            players: nextPlayers,
            status: allConfirmed ? 'phase_game' : 'role_intro',
            currentPhaseIndex: 0,
          };
        });
      };

      if (isTeamOperationTheme(state.operationTheme)) {
        return <ScreenOmegaRoleIntro state={currentState} onConfirmRole={onConfirm} />;
      }

      if (role === 'kaptan') {
        return <Screen03CaptainRole state={currentState} onConfirmRole={onConfirm} />;
      } else {
        return <Screen04EngineerRole state={currentState} onConfirmRole={onConfirm} />;
      }
    }

    // 5 to 14. Phase Games (Stages 1, 2, 4 for team ops)
    if (state.status === 'phase_game') {
      if (isTeamOperationTheme(state.operationTheme)) {
        return <ScreenOmegaPlay state={currentState} onAction={roleAction} />;
      }
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
        ? (state.selectedMiniGames[0] || 'ariza_teshisi')
        : (state.selectedMiniGames[1] || state.selectedMiniGames[0] || 'sinyal_cozumu');

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
            onAction={roleAction}
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
            onAction={roleAction}
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
            onAction={roleAction}
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
            onAction={roleAction}
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

    // 15 & 16. Phase 3: Energy Allocation (and Team Ops Stage 3: 12 MW Grid)
    if (state.status === 'phase_energy') {
      if (isTeamOperationTheme(state.operationTheme)) {
        return <ScreenOmegaPlay state={currentState} onAction={roleAction} />;
      }
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

    // 17A. Phase 4: Rescue Choice (and Team Ops Stage 5: Dual Evacuation)
    if (state.status === 'phase_rescue') {
      if (isTeamOperationTheme(state.operationTheme)) {
        return <ScreenOmegaPlay state={currentState} onAction={roleAction} />;
      }
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
          isOnline={isOnline && !dualViewMode}
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
      if (isTeamOperationTheme(state.operationTheme)) {
        return (
          <ScreenOmegaResult
            state={currentState}
            onRestartGame={handleRestartGame}
            onBackToEntry={handleLeaveToEntry}
          />
        );
      }
      if (state.operationTheme === 'karantina_2088') {
        return (
          <ScreenKarantinaResult 
            state={currentState} 
            onRestartGame={handleRestartGame} 
            onBackToLobby={handleLeaveToEntry}
          />
        );
      }
      return (
        <Screen17BResult 
          state={currentState} 
          onRestartGame={handleRestartGame} 
          onLobbyReturn={handleLeaveToEntry}
        />
      );
    }

    return (
      <Screen02Lobby
        state={currentState}
        onUpdate={updateState}
        onLeaveToEntry={handleLeaveToEntry}
        onStartGame={() => updateState((p) => ({ ...p, status: 'role_intro' }))}
        isOnline={isOnline && !dualViewMode}
        isHost={isLeader}
      />
    );
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
        isOnline={isOnline && !dualViewMode}
        operationTheme={state.operationTheme}
        targetPlayerCount={state.targetPlayerCount}
        onToggleDisconnect={handleToggleDisconnect}
        onSwitchRole={handleSwitchRole}
        onOpenRules={() => setShowRules(true)}
        onOpenScreenExplorer={() => setShowExplorer(true)}
        onOpenOpening={() => updateState((p) => ({ ...p, status: 'opening' }))}
        onTestEpicSuccess={() => triggerEpicSuccess()}
        onOpenRadio={() => setShowRadio(true)}
      />

      {/* Main Container with subtle screen shake */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col items-center justify-start overflow-x-hidden">
        <motion.div
          animate={isShaking ? {
            x: [0, -8, 8, -6, 6, -3, 3, 0],
            y: [0, 5, -5, 3, -3, 1, 0],
          } : { x: 0, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full flex-1 flex flex-col items-center justify-start"
        >
        
        {/* View Layout: Single Screen or Multi-Phone Split */}
        {dualViewMode && state.status !== 'opening' ? (
          isTeamOperationTheme(state.operationTheme) ? (
            <div
              className={`w-full grid grid-cols-1 ${
                state.targetPlayerCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              } gap-4 items-start justify-center`}
            >
              {getOmegaRolesForCount(state.targetPlayerCount === 3 ? 3 : 4).map((phoneRole, idx) => {
                const pMeta = getOmegaRoleMeta(phoneRole, state.targetPlayerCount === 3 ? 3 : 4);
                const phoneBorderClass =
                  phoneRole === 'kaptan'
                    ? 'border-[#ffb703]/45'
                    : phoneRole === 'muhendis'
                    ? 'border-[#00eefc]/45'
                    : phoneRole === 'kriptolog'
                    ? 'border-[#dab5ff]/45'
                    : 'border-emerald-400/45';
                const phoneTextClass =
                  phoneRole === 'kaptan'
                    ? 'text-[#ffb703]'
                    : phoneRole === 'muhendis'
                    ? 'text-[#00eefc]'
                    : phoneRole === 'kriptolog'
                    ? 'text-[#dab5ff]'
                    : 'text-emerald-300';
                return (
                  <div
                    key={phoneRole}
                    className={`w-full max-w-md mx-auto p-1 rounded-3xl bg-[#141123] border-2 ${phoneBorderClass} shadow-2xl flex flex-col overflow-hidden`}
                  >
                    <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className={`font-bold flex items-center gap-1.5 ${phoneTextClass}`}>
                        <span>{idx + 1}. CİHAZ · {pMeta.shortTitle.toUpperCase()}</span>
                      </span>
                      <span className="text-[#9e8f78]">{state.players[phoneRole]?.name || pMeta.defaultName}</span>
                    </div>
                    <div
                      key={`${phoneRole}_${state.roundId}_${state.status}_${state.currentPhaseIndex}_${state.operationTheme}`}
                      className="p-2 overflow-hidden"
                    >
                      <Suspense fallback={<ConsoleScreenFallback role={phoneRole} theme={state.operationTheme} />}>
                        {renderScreenForRole(phoneRole)}
                      </Suspense>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
              <div className="p-2 overflow-x-hidden">
                <motion.div
                  key={`kaptan_${state.roundId}_${state.status}_${state.operationTheme}_${state.status === 'phase_game' ? state.currentPhaseIndex : ''}`}
                  initial={{ opacity: 0.72, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <Suspense fallback={<ConsoleScreenFallback role="kaptan" theme={state.operationTheme} />}>
                    {renderScreenForRole('kaptan')}
                  </Suspense>
                </motion.div>
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
              <div className="p-2 overflow-x-hidden">
                <motion.div
                  key={`muhendis_${state.roundId}_${state.status}_${state.operationTheme}_${state.status === 'phase_game' ? state.currentPhaseIndex : ''}`}
                  initial={{ opacity: 0.72, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <Suspense fallback={<ConsoleScreenFallback role="muhendis" theme={state.operationTheme} />}>
                    {renderScreenForRole('muhendis')}
                  </Suspense>
                </motion.div>
              </div>
            </div>
          </div>
          )
        ) : (
          <div className="w-full flex justify-center overflow-x-hidden">
            <motion.div
              key={`${state.roundId}_${state.status}_${state.operationTheme}_${state.status === 'phase_game' ? state.currentPhaseIndex : ''}`}
              initial={{ opacity: 0.72, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <Suspense fallback={<ConsoleScreenFallback role={state.myRole} theme={state.operationTheme} />}>
                {renderScreenForRole(state.myRole)}
              </Suspense>
            </motion.div>
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

      {/* Disconnect Simulation / Auto-Reconnect Modal */}
      <NetworkDisconnectModal
        isOpen={state.isDisconnected || connectionStatus === 'reconnecting'}
        isOwnConnectionLost={connectionStatus === 'reconnecting'}
        onReconnect={handleReconnect}
        countdownSeconds={
          connectionStatus === 'reconnecting'
            ? localReconnectCountdown
            : (() => {
                const matchSec = state.feedbackMessage?.match(/(\d+)s/);
                return matchSec ? parseInt(matchSec[1], 10) : 45;
              })()
        }
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

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Incoming Radio Transmission Dropdown Banner */}
      <TacticalRadioBanner onOpenRadio={() => setShowRadio(true)} myRole={state.myRole} />

      {/* Tactical Radio Comms Modal (PTT / Walkie-Talkie) */}
      <TacticalRadioModal
        isOpen={showRadio}
        onClose={() => setShowRadio(false)}
        myRole={state.myRole}
        operationTheme={state.operationTheme}
        playerName={state.players[state.myRole]?.name || state.players.kaptan.name}
      />

    </div>
  );
}
