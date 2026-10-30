import { MissionState, MiniGameType, RescueRoute } from '../types/game';
import { calculateFinalScore } from './gameFactory';

export interface AdvancePhaseRequest {
  roundId: string;           // Active round identifier (distinct from roomCode, unique per round)
  expectedPhaseIndex: number; // The current phase index that the caller expects to finish (0, 1, 2)
}

export interface PhaseTransitionResult {
  success: boolean;
  error?: string;
  nextState?: MissionState;
}

/**
 * Checks whether the mini-game assigned to a given phase is fully solved/completed.
 */
export function isMiniGameCompleted(state: MissionState, gameType: MiniGameType): boolean {
  switch (gameType) {
    case 'ariza_teshisi':
      return state.diagnostic.isSolved === true;
    case 'sinyal_cozumu':
      return state.signal.isSolved === true;
    case 'kablo_baglantisi':
      return state.cable.isSolved === true;
    case 'hava_kilidi':
      return state.airlock.isSolved === true;
    case 'radar_yonlendirme':
      return state.radar.isSolved === true;
    default:
      return false;
  }
}

/**
 * Validates and executes an advance from current phase to the next.
 * Ensures:
 * 1. Round ID matches the currently active round (guards against stale requests from previous rounds).
 * 2. Expected phase index matches the actual state (prevents duplicate advances whether 20ms or 3s later).
 * 3. The current phase's puzzle/task is genuinely completed.
 */
export function validateAndAdvancePhase(
  currentState: MissionState,
  request: AdvancePhaseRequest
): PhaseTransitionResult {
  // 1. Verify round ID (strictly matches currentState.roundId, decoupled from roomCode)
  if (request.roundId !== currentState.roundId) {
    return {
      success: false,
      error: `Geçersiz veya eski tur kimliği: Gönderilen '${request.roundId}', aktif tur: '${currentState.roundId}'.`,
    };
  }

  // 2. Strict phase index check:
  // If request expects phase X, but state is already X+1 (e.g., partner already triggered it),
  // reject immediately!
  if (request.expectedPhaseIndex !== currentState.currentPhaseIndex) {
    return {
      success: false,
      error: `Aşama uyumsuzluğu: Beklenen aşama ${request.expectedPhaseIndex}, mevcut aşama ${currentState.currentPhaseIndex}. İşlem engellendi.`,
    };
  }

  // 3. Verify task completion of the current phase
  if (currentState.currentPhaseIndex === 0) {
    const gameType = currentState.selectedMiniGames[0];
    if (!isMiniGameCompleted(currentState, gameType)) {
      return {
        success: false,
        error: `Aşama 1 (${gameType}) henüz tamamlanmadı! Görev çözülmeden ilerlenemez.`,
      };
    }
  } else if (currentState.currentPhaseIndex === 1) {
    const gameType = currentState.selectedMiniGames[1];
    if (!isMiniGameCompleted(currentState, gameType)) {
      return {
        success: false,
        error: `Aşama 2 (${gameType}) henüz tamamlanmadı! Görev çözülmeden ilerlenemez.`,
      };
    }
  } else if (currentState.currentPhaseIndex === 2) {
    // Phase 2 is energy allocation
    if (!currentState.energy.isLocked) {
      return {
        success: false,
        error: `Aşama 3 (Enerji Dağıtımı) kilitlenmedi! Reaktör bütçesi onaylanmadan ilerlenemez.`,
      };
    }
  } else if (currentState.currentPhaseIndex >= 3) {
    return {
      success: false,
      error: `Zaten son kurtarma aşamasındasınız.`,
    };
  }

  // 4. Advance phase cleanly
  const nextPhaseIdx = currentState.currentPhaseIndex + 1;
  const nextCompleted = currentState.currentPhaseIndex < 2 
    ? currentState.completedTasksCount + 1 
    : currentState.completedTasksCount;

  let nextStatus = currentState.status;
  if (nextPhaseIdx === 1) nextStatus = 'phase_game';
  else if (nextPhaseIdx === 2) nextStatus = 'phase_energy';
  else if (nextPhaseIdx === 3) nextStatus = 'phase_rescue';

  return {
    success: true,
    nextState: {
      ...currentState,
      currentPhaseIndex: nextPhaseIdx,
      completedTasksCount: nextCompleted,
      status: nextStatus,
    },
  };
}

export interface RescueValidationResult {
  success: boolean;
  outcomeType: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik';
  rescuedCrewCount: number;
  remainingTimeAfterTravel: number;
  score: {
    total: number;
    breakdown: {
      tasksScore: number;
      timeBonus: number;
      hullBonus: number;
      crewBonus: number;
    };
  };
  error?: string;
  nextState?: MissionState;
}

/**
 * Validates the rescue decision based on real power allocations, travel times, and approvals.
 * Deducts travelTimeSeconds from timeLeftSeconds upon valid transit.
 */
export function validateRescueDecision(
  state: MissionState,
  route: RescueRoute
): RescueValidationResult {
  const { energy, rescue, timeLeftSeconds, hullIntegrity } = state;
  const netLife = Math.max(0, energy.engineerAllocation.yasamDestegi - energy.lineLosses.yasamDestegi);
  const netThrust = Math.max(0, energy.engineerAllocation.itki - energy.lineLosses.itki);
  const netShield = Math.max(0, energy.engineerAllocation.kalkan - energy.lineLosses.kalkan);

  // 1. Partner Approvals Check
  if (!rescue.captainApproved || !rescue.engineerApproved) {
    return {
      success: false,
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      remainingTimeAfterTravel: timeLeftSeconds,
      score: calculateFinalScore(3, 0, 0, 0),
      error: 'İki oyuncunun onayı bekleniyor (Kaptan ve Mühendis çift onayı zorunludur).',
    };
  }

  // 2. Energy Lock Check
  if (!energy.isLocked) {
    return {
      success: false,
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      remainingTimeAfterTravel: timeLeftSeconds,
      score: calculateFinalScore(3, 0, 0, 0),
      error: 'HATA: Reaktör enerjisi kilitlenmedi! Önceki aşamada güç dağılımı onaylanmalıdır.',
    };
  }

  // 3. Life Support Check
  if (netLife < 3) {
    return {
      success: false,
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      remainingTimeAfterTravel: timeLeftSeconds,
      score: calculateFinalScore(3, 0, 0, 0),
      error: `YETERSİZ YAŞAM DESTEĞİ! Net ${netLife} MW sağlandı (Asgari 3 MW gereklidir).`,
    };
  }

  // 4. Thrust Requirement Check
  if (netThrust < route.powerRequirements.itki) {
    return {
      success: false,
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      remainingTimeAfterTravel: timeLeftSeconds,
      score: calculateFinalScore(3, 0, 0, 0),
      error: `YETERSİZ İTKİ GÜCÜ! ${route.name} için net ${route.powerRequirements.itki} MW itki gerekiyor, sağlanan: ${netThrust} MW.`,
    };
  }

  // 5. Shield Requirement Check
  if (netShield < route.powerRequirements.kalkan) {
    return {
      success: false,
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      remainingTimeAfterTravel: timeLeftSeconds,
      score: calculateFinalScore(3, 0, 0, 0),
      error: `YETERSİZ KALKAN GÜCÜ! ${route.name} için net ${route.powerRequirements.kalkan} MW kalkan gerekiyor, sağlanan: ${netShield} MW.`,
    };
  }

  // 6. Time Remaining vs Travel Time Check
  if (timeLeftSeconds < route.travelTimeSeconds) {
    const failScore = calculateFinalScore(3, 0, 0, 0);
    return {
      success: false,
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      remainingTimeAfterTravel: 0,
      score: failScore,
      error: `SÜRE YETERSİZ! Yolculuk ${route.travelTimeSeconds}s sürer ancak kalan süre ${timeLeftSeconds}s. Tahliye süresi tükendi.`,
      nextState: {
        ...state,
        status: 'phase_result',
        outcomeType: 'basarisizlik',
        rescuedCrewCount: 0,
        completedTasksCount: 3,
        timeLeftSeconds: 0,
        hullIntegrity: 0,
        finalScore: failScore.total,
        scoreBreakdown: failScore.breakdown,
      },
    };
  }

  // All checks passed! Deduct travel time from remaining time
  const remainingTimeAfterTravel = timeLeftSeconds - route.travelTimeSeconds;
  const rescued = route.crewCount;
  const outcomeType = rescued === 10 ? 'tam_basari' : 'kismi_kurtarma';
  const scoreData = calculateFinalScore(4, remainingTimeAfterTravel, hullIntegrity, rescued);

  return {
    success: true,
    outcomeType,
    rescuedCrewCount: rescued,
    remainingTimeAfterTravel,
    score: scoreData,
    nextState: {
      ...state,
      status: 'phase_result',
      outcomeType,
      rescuedCrewCount: rescued,
      completedTasksCount: 4,
      timeLeftSeconds: remainingTimeAfterTravel,
      finalScore: scoreData.total,
      scoreBreakdown: scoreData.breakdown,
    },
  };
}
