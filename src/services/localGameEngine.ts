import { MissionState, Role } from '../types/game';
import { RESCUE_ROUTES, calculateFinalScore } from './gameFactory';
import { validateRescueDecision } from './phaseTransition';
import { applyAdvancedAction } from './advancedScenarioLogic';

/**
 * Authoritative local action execution for offline demo mode and 2-screen Dual View mode.
 * Applies the exact same rules, validation, feedback messages, and penalties as the Colyseus server.
 */
export function applyLocalGameAction(
  state: MissionState,
  actionType: string,
  data: any,
  actingRole: Role = state.myRole
): MissionState {
  if (actionType === 'set_game_mode') {
    return {
      ...state,
      gameMode: data.mode,
    };
  }

  if (actionType.startsWith('advanced_')) {
    const result = applyAdvancedAction(state, actionType, data, actingRole);
    return result.nextState;
  }

  // Helper to apply 15s time and 10% hull penalties on incorrect actions
  const applyPenalty = (prevState: MissionState, reason: string): MissionState => {
    const nextTime = Math.max(0, prevState.timeLeftSeconds - 15);
    const nextHull = Math.max(0, prevState.hullIntegrity - 10);
    const penalized: MissionState = {
      ...prevState,
      timeLeftSeconds: nextTime,
      hullIntegrity: nextHull,
      feedbackState: 'error',
      feedbackMessage: `${reason} (-15s Süre, -%10 Bütünlük)`,
    };

    if (nextTime <= 0 || nextHull <= 0) {
      const finalHull = Math.max(0, penalized.hullIntegrity);
      const scoreData = calculateFinalScore(penalized.completedTasksCount || 0, 0, finalHull, 0);
      return {
        ...penalized,
        status: 'phase_result',
        outcomeType: 'basarisizlik',
        rescuedCrewCount: 0,
        timeLeftSeconds: 0,
        hullIntegrity: finalHull,
        finalScore: scoreData.total,
        scoreBreakdown: scoreData.breakdown,
        feedbackState: 'error',
        feedbackMessage: nextHull <= 0 ? 'İstasyon gövdesi kritik hasar alarak parçalandı!' : 'Süre tükendi!',
      };
    }
    return penalized;
  };

  const currentStatus = state.status;

  // ---------------------------------------------------------------------------
  // Phase Games (Phase 0 & 1)
  // ---------------------------------------------------------------------------
  if (currentStatus === 'phase_game') {
    const activeMiniGame = state.selectedMiniGames[state.currentPhaseIndex];

    // Arıza Teşhisi (Reaktör)
    if (activeMiniGame === 'ariza_teshisi') {
      if (actionType === 'diagnostic_captain_breaker') {
        if (actingRole !== 'kaptan') return state;
        if (state.diagnostic.isSolved) return state;
        if (!data.breaker) return state;

        const isCorrect = data.breaker === state.diagnostic.correctBreaker;
        if (isCorrect) {
          const willSolve = state.diagnostic.engineerActionTaken && 
            state.diagnostic.engineerSuggestedLine === state.diagnostic.faultyLine;

          const updatedLines = willSolve ? {
            ...state.diagnostic.lines,
            [state.diagnostic.faultyLine]: {
              ...state.diagnostic.lines[state.diagnostic.faultyLine],
              temp: 54,
              press: 50,
              noise: 36,
              status: 'stabil' as const,
            },
          } : state.diagnostic.lines;

          return {
            ...state,
            diagnostic: {
              ...state.diagnostic,
              lines: updatedLines,
              captainSelectedBreaker: data.breaker,
              unlockedBreaker: data.breaker,
              isSolved: willSolve,
            },
            feedbackState: willSolve ? 'success' : 'idle',
            feedbackMessage: willSolve
              ? `GÜVENLİK KİLİDİ AÇILDI! ${data.breaker} kesicisi arızalı devreyi başarıyla izole etti. Reaktör kararlı.`
              : `GÜVENLİK KİLİDİ AÇILDI (${data.breaker})! Devre akımı kesildi. Mühendisin soğutma valfi ve basınç tahliyesi müdahalesi bekleniyor.`,
          };
        } else {
          return applyPenalty(
            {
              ...state,
              diagnostic: {
                ...state.diagnostic,
                captainSelectedBreaker: data.breaker,
              },
            },
            `Hatalı kesici seçimi (${data.breaker})! İzole edilen hatta aktif bir anomali bulunmuyor; sağlam sistemin enerjisi kesildi. Bütünlük -%10, Süre -15 sn!`
          );
        }
      }

      if (actionType === 'diagnostic_engineer_select_line') {
        if (actingRole !== 'muhendis') return state;
        if (state.diagnostic.isSolved) return state;

        return {
          ...state,
          diagnostic: {
            ...state.diagnostic,
            engineerSuggestedLine: data.line,
          },
          feedbackState: 'idle',
          feedbackMessage: `Mühendis ${data.line ? data.line.toUpperCase() : ''} devresini inceleme için işaretledi.`,
        };
      }

      if (actionType === 'diagnostic_engineer_purge') {
        if (actingRole !== 'muhendis') return state;
        if (state.diagnostic.isSolved) return state;
        if (!data.line) {
          return {
            ...state,
            feedbackState: 'error',
            feedbackMessage: 'Müdahale için önce canlı sensörlerde arızalı devreyi tespit edip işaretleyin.',
          };
        }

        const isBreakerUnlocked = state.diagnostic.captainSelectedBreaker === state.diagnostic.correctBreaker;
        if (!isBreakerUnlocked) {
          return {
            ...state,
            diagnostic: {
              ...state.diagnostic,
              engineerSuggestedLine: data.line,
            },
            feedbackState: 'error',
            feedbackMessage: 'Güvenlik kilidi devrede! Kaptan ana şebekeden bu hattın güvenlik kesicisini açmadan tahliye vanası çalıştırılamaz.',
          };
        }

        const isCorrectLine = data.line === state.diagnostic.faultyLine;
        if (!isCorrectLine) {
          return applyPenalty(
            {
              ...state,
              diagnostic: {
                ...state.diagnostic,
                engineerSuggestedLine: data.line,
              },
            },
            'Hatalı hat tahliyesi! Seçilen devrede çoklu arıza koşulları oluşmamış. Sağlam hatta müdahale edildi. Bütünlük -%10, Süre -15 sn!'
          );
        }

        // Reject if valveAngle or throttleActive is missing (do not auto-fill with correct answer!)
        if (data.valveAngle === undefined || data.valveAngle === null) {
          return {
            ...state,
            diagnostic: {
              ...state.diagnostic,
              engineerSuggestedLine: data.line,
            },
            feedbackState: 'error',
            feedbackMessage: 'Müdahale başarısız: Soğutma valfi açısı belirtilmedi. Lütfen valf açısını ayarlayın.',
          };
        }

        if (data.throttleActive === undefined || data.throttleActive === null) {
          return {
            ...state,
            diagnostic: {
              ...state.diagnostic,
              engineerSuggestedLine: data.line,
            },
            feedbackState: 'error',
            feedbackMessage: 'Müdahale başarısız: Basınç tahliye anahtarı konumu belirtilmedi. Lütfen tahliye anahtarını ayarlayın.',
          };
        }

        if (data.valveAngle !== state.diagnostic.targetValveAngle) {
          return {
            ...state,
            diagnostic: {
              ...state.diagnostic,
              engineerSuggestedLine: data.line,
              engineerValveAngle: data.valveAngle,
            },
            feedbackState: 'error',
            feedbackMessage: 'Müdahale başarısız: Soğutma valfi doğru açıda değil. Termal şok riski nedeniyle tahliye emniyet valfi tarafından durduruldu.',
          };
        }

        if (!data.throttleActive) {
          return {
            ...state,
            diagnostic: {
              ...state.diagnostic,
              engineerSuggestedLine: data.line,
              engineerThrottleActive: false,
            },
            feedbackState: 'error',
            feedbackMessage: 'Müdahale başarısız: Basınç tahliyesi devre dışı. Hat basıncı boşaltılmadan devre açılamaz.',
          };
        }

        const valveAngle = data.valveAngle;
        const throttleActive = data.throttleActive;

        // All checks succeeded!
        const updatedLines = {
          ...state.diagnostic.lines,
          [state.diagnostic.faultyLine]: {
            ...state.diagnostic.lines[state.diagnostic.faultyLine],
            temp: 54,
            press: 50,
            noise: 36,
            status: 'stabil' as const,
          },
        };

        return {
          ...state,
          diagnostic: {
            ...state.diagnostic,
            lines: updatedLines,
            engineerActionTaken: true,
            engineerSuggestedLine: data.line,
            engineerValveAngle: valveAngle,
            engineerThrottleActive: throttleActive,
            isSolved: true,
          },
          feedbackState: 'success',
          feedbackMessage: `MÜDAHALE TAMAMLANDI! ${data.line.toUpperCase()} devresi başarıyla soğutuldu ve tahliye edildi. Reaktör dengelendi!`,
        };
      }
    }

    // Sinyal Çözümü
    if (activeMiniGame === 'sinyal_cozumu') {
      if (actionType === 'signal_engineer_tune') {
        if (actingRole !== 'muhendis') return state;
        if (state.signal.isSolved) return state;

        const isCorrect = data.freq === state.signal.correctFrequency;
        if (isCorrect) {
          return {
            ...state,
            signal: {
              ...state.signal,
              engineerTunedFreq: data.freq,
              isLocked: true,
              isSolved: true,
            },
            feedbackState: 'success',
            feedbackMessage: 'Sinyal frekansı kilitlendi! İletişim sağlandı.',
          };
        } else {
          return applyPenalty(
            {
              ...state,
              signal: {
                ...state.signal,
                engineerTunedFreq: data.freq,
                isLocked: true,
              },
            },
            'Hatalı frekans seçimi! Parazit rezonansı gövdeyi sarstı.'
          );
        }
      }
    }

    // Kablo Bağlantısı
    if (activeMiniGame === 'kablo_baglantisi') {
      if (actionType === 'cable_assign_port') {
        if (actingRole !== 'muhendis') return state;
        return {
          ...state,
          cable: {
            ...state.cable,
            portAssignments: {
              ...state.cable.portAssignments,
              [data.portId]: data.cableId,
            },
          },
        };
      }

      if (actionType === 'cable_test_connections') {
        if (actingRole !== 'muhendis') return state;
        if (state.cable.isSolved) return state;

        let allCorrect = true;
        for (const port of state.cable.ports) {
          if (state.cable.portAssignments[port.id] !== port.requiredCableId) {
            allCorrect = false;
            break;
          }
        }

        if (allCorrect) {
          return {
            ...state,
            cable: {
              ...state.cable,
              isTested: true,
              isSolved: true,
            },
            feedbackState: 'success',
            feedbackMessage: 'Kablo devresi başarıyla bağlandı ve akım sağlandı!',
          };
        } else {
          return applyPenalty(
            {
              ...state,
              cable: {
                ...state.cable,
                isTested: true,
              },
            },
            'Hatalı kablo dizilimi! Kısa devre gövdeye elektrik sıçrattı.'
          );
        }
      }
    }

    // Hava Kilidi
    if (activeMiniGame === 'hava_kilidi') {
      if (actionType === 'airlock_set_params') {
        if (actingRole !== 'muhendis') return state;
        return {
          ...state,
          airlock: {
            ...state.airlock,
            engineerDialIndex: data.dialIndex !== undefined ? data.dialIndex : state.airlock.engineerDialIndex,
            engineerSealLocked: data.sealLocked !== undefined ? data.sealLocked : state.airlock.engineerSealLocked,
            engineerVacuumPower: data.vacuumPower !== undefined ? data.vacuumPower : state.airlock.engineerVacuumPower,
          },
        };
      }

      if (actionType === 'airlock_verify') {
        if (actingRole !== 'muhendis') return state;
        if (state.airlock.isSolved) return state;

        const al = state.airlock;
        const dialCorrect = al.engineerDialIndex === al.targetDialIndex;
        const sealCorrect = al.engineerSealLocked === al.targetSealLocked;
        const vacuumCorrect = al.engineerVacuumPower >= al.targetVacuumMin && al.engineerVacuumPower <= al.targetVacuumMax;

        if (dialCorrect && sealCorrect && vacuumCorrect) {
          return {
            ...state,
            airlock: {
              ...state.airlock,
              isSolved: true,
            },
            feedbackState: 'success',
            feedbackMessage: 'Hava kilidi basıncı dengelendi ve mühürlendi!',
          };
        } else {
          return applyPenalty(
            state,
            'Hava kilidi parametreleri uyumsuz! Basınç kaçağı meydana geldi.'
          );
        }
      }
    }

    // Radar Yönlendirme
    if (activeMiniGame === 'radar_yonlendirme') {
      if (actionType === 'radar_set_coordinates') {
        if (actingRole !== 'muhendis') return state;
        return {
          ...state,
          radar: {
            ...state.radar,
            engineerAzimuth: data.azimuth !== undefined ? data.azimuth : state.radar.engineerAzimuth,
            engineerElevation: data.elevation !== undefined ? data.elevation : state.radar.engineerElevation,
          },
        };
      }

      if (actionType === 'radar_scan') {
        if (actingRole !== 'muhendis') return state;
        if (state.radar.isSolved) return state;

        const r = state.radar;
        const azDiff = Math.abs(r.engineerAzimuth - r.targetAzimuth);
        const elDiff = Math.abs(r.engineerElevation - r.targetElevation);

        if (azDiff <= 5 && elDiff <= 5) {
          return {
            ...state,
            radar: {
              ...state.radar,
              isScanned: true,
              isSolved: true,
            },
            feedbackState: 'success',
            feedbackMessage: 'Kurtarma feneri radarda tespit edildi!',
          };
        } else {
          return applyPenalty(
            {
              ...state,
              radar: {
                ...state.radar,
                isScanned: true,
              },
            },
            'Radar taraması hedef koordinatlardan saptı! Parazit arttı.'
          );
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Phase 2: Enerji Dağıtımı
  // ---------------------------------------------------------------------------
  if (currentStatus === 'phase_energy') {
    if (actionType === 'energy_set_allocation') {
      if (actingRole !== 'muhendis') return state;
      if (state.energy.isLocked) return state;

      const alloc = data.allocation;
      const sum = alloc.yasamDestegi + alloc.itki + alloc.kalkan;
      if (sum <= state.energy.totalBudget) {
        return {
          ...state,
          energy: {
            ...state.energy,
            engineerAllocation: alloc,
            isDraftShared: false,
          },
        };
      }
      return state;
    }

    if (actionType === 'energy_share_draft') {
      if (actingRole !== 'muhendis') return state;
      return {
        ...state,
        energy: {
          ...state.energy,
          isDraftShared: true,
        },
        feedbackState: 'idle',
        feedbackMessage: 'Enerji taslağı Kaptana başarıyla iletildi! Kaptanın onayı ve kilitlemesi bekleniyor.',
      };
    }

    if (actionType === 'energy_lock') {
      if (actingRole !== 'kaptan') return state;
      if (!state.energy.isDraftShared) {
        return {
          ...state,
          feedbackState: 'error',
          feedbackMessage: 'Mühendisten onaylı taslak gelmeden kilitlenemez.',
        };
      }
      if (state.energy.isLocked) return state;

      const e = state.energy;
      const netLife = Math.max(0, e.engineerAllocation.yasamDestegi - e.lineLosses.yasamDestegi);
      const netThrust = Math.max(0, e.engineerAllocation.itki - e.lineLosses.itki);
      const netShield = Math.max(0, e.engineerAllocation.kalkan - e.lineLosses.kalkan);

      const meetsLife = netLife >= e.captainMinRequirements.yasamDestegi;
      const meetsThrust = netThrust >= e.captainMinRequirements.itki;
      const meetsShield = netShield >= e.captainMinRequirements.kalkan;

      if (meetsLife && meetsThrust && meetsShield) {
        return {
          ...state,
          energy: {
            ...state.energy,
            isLocked: true,
          },
          feedbackState: 'success',
          feedbackMessage: 'Enerji dağılımı kilitlendi ve ana hatta aktarıldı!',
        };
      } else {
        return applyPenalty(state, 'Enerji dağılımı kritik güvenlik eşiklerinin altında kaldı!');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Phase 3: Kurtarma Kararı
  // ---------------------------------------------------------------------------
  if (currentStatus === 'phase_rescue') {
    if (actionType === 'rescue_select_route') {
      return {
        ...state,
        rescue: {
          ...state.rescue,
          selectedRouteId: data.routeId,
          captainApproved: false,
          engineerApproved: false,
          validationError: null,
        },
      };
    }

    if (actionType === 'rescue_toggle_approval') {
      const isCaptain = actingRole === 'kaptan';
      const nextCaptainApproved = isCaptain ? !state.rescue.captainApproved : state.rescue.captainApproved;
      const nextEngineerApproved = !isCaptain ? !state.rescue.engineerApproved : state.rescue.engineerApproved;

      const candidateState: MissionState = {
        ...state,
        rescue: {
          ...state.rescue,
          captainApproved: nextCaptainApproved,
          engineerApproved: nextEngineerApproved,
          validationError: null,
        },
      };

      if (nextCaptainApproved && nextEngineerApproved) {
        const selectedRoute = RESCUE_ROUTES.find((r) => r.id === candidateState.rescue.selectedRouteId)!;
        const validation = validateRescueDecision(candidateState, selectedRoute);
        if (validation.success && validation.nextState) {
          return validation.nextState;
        } else {
          return {
            ...candidateState,
            rescue: {
              ...candidateState.rescue,
              captainApproved: false,
              engineerApproved: false,
              validationError: validation.error || 'Kurtarma planı doğrulanamadı.',
            },
          };
        }
      }
      return candidateState;
    }
  }

  return state;
}
