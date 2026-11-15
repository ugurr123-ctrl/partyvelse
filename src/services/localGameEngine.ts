import { MissionState, Role } from '../types/game';
import { RESCUE_ROUTES, calculateFinalScore, generateKarantinaData, generateRoundId } from './gameFactory';
import { validateRescueDecision } from './phaseTransition';
import { applyAdvancedAction } from './advancedScenarioLogic';
import { applyOmegaAction } from './omegaGameEngine';

/**
 * Authoritative local action execution for offline demo mode and multi-screen Dual/Team View mode.
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

  if (actionType.startsWith('omega_')) {
    const result = applyOmegaAction(state, actionType, data, actingRole);
    return result.nextState;
  }

  // Helper to apply time, hull, and optional stealth penalties on incorrect actions
  const applyPenalty = (
    prevState: MissionState,
    reason: string,
    opts?: { timeLoss?: number; hullLoss?: number; stealthLoss?: number }
  ): MissionState => {
    const timeLoss = opts?.timeLoss ?? 15;
    const hullLoss = opts?.hullLoss ?? 10;
    const stealthLoss = opts?.stealthLoss ?? 0;
    const nextTime = Math.max(0, prevState.timeLeftSeconds - timeLoss);
    const nextHull = Math.max(0, prevState.hullIntegrity - hullLoss);
    const prevStealth = prevState.stealthLevel ?? 100;
    const nextStealth = Math.max(0, prevStealth - stealthLoss);
    const suffixParts: string[] = [];
    if (timeLoss > 0) suffixParts.push(`-${timeLoss}s Süre`);
    if (hullLoss > 0) suffixParts.push(`-%${hullLoss} Bütünlük`);
    if (stealthLoss > 0) suffixParts.push(`-%${stealthLoss} Sessizlik`);

    const penalized: MissionState = {
      ...prevState,
      timeLeftSeconds: nextTime,
      hullIntegrity: nextHull,
      stealthLevel: stealthLoss > 0 ? nextStealth : prevState.stealthLevel,
      feedbackState: 'error',
      feedbackMessage: suffixParts.length > 0 ? `${reason} (${suffixParts.join(', ')})` : reason,
    };

    if (nextTime <= 0 || nextHull <= 0 || (stealthLoss > 0 && nextStealth <= 0)) {
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
        feedbackMessage:
          stealthLoss > 0 && nextStealth <= 0
            ? 'Gizlilik tamamen deşifre oldu! Alarm sistemleri operasyonu kilitledi.'
            : nextHull <= 0
            ? 'İstasyon gövdesi kritik hasar alarak parçalandı!'
            : 'Süre tükendi!',
      };
    }
    return penalized;
  };

  const currentStatus = state.status;
  const isThemeCustom =
    state.operationTheme === 'derin_basinc' ||
    state.operationTheme === 'golge_protokolu';

  // ---------------------------------------------------------------------------
  // Phase Games (Phase 0 & 1)
  // ---------------------------------------------------------------------------
  if (currentStatus === 'phase_game') {
    const activeMiniGame = state.selectedMiniGames[state.currentPhaseIndex];

    if (actionType === 'captain_signal_ready') {
      if (actingRole !== 'kaptan') return state;
      return {
        ...state,
        feedbackState: 'idle',
        feedbackMessage: data?.message || 'Kaptan kılavuz verilerini operasyona aktardı.',
      };
    }

    if (isThemeCustom) {
      if (actionType === 'theme_apply_penalty') {
        return applyPenalty(
          state,
          data?.reason || 'Hatalı müdahale tespit edildi!',
          {
            timeLoss: typeof data?.timeLoss === 'number' ? data.timeLoss : 15,
            hullLoss: typeof data?.hullLoss === 'number' ? data.hullLoss : 10,
            stealthLoss: typeof data?.stealthLoss === 'number' ? data.stealthLoss : 0,
          }
        );
      }

      if (actionType === 'theme_diagnostic_captain_sync' && activeMiniGame === 'ariza_teshisi') {
        if (actingRole !== 'kaptan') return state;
        if (state.diagnostic.isSolved) return state;

        if (state.operationTheme === 'golge_protokolu') {
          const isVoltageTarget = typeof data?.voltage === 'number' && Math.abs(data.voltage - 24.5) <= 0.5;
          const isDeltaReady = data?.deltaCable === 'SARI';
          if (!isVoltageTarget || !isDeltaReady) {
            return applyPenalty(
              state,
              'VOLTAJ YA DA SOKET HATALI! Hackerın telsiz talimatlarını kontrol edip kablo ve voltajı yeniden ayarla.',
              { timeLoss: 10, hullLoss: 0, stealthLoss: 5 }
            );
          }
        }

        const breaker = state.diagnostic.correctBreaker;
        const shouldSolveNow = state.diagnostic.engineerActionTaken;
        const updatedLines = shouldSolveNow
          ? {
              ...state.diagnostic.lines,
              [state.diagnostic.faultyLine]: {
                ...state.diagnostic.lines[state.diagnostic.faultyLine],
                temp: 54,
                press: 50,
                noise: 36,
                status: 'stabil' as const,
              },
            }
          : state.diagnostic.lines;

        return {
          ...state,
          diagnostic: {
            ...state.diagnostic,
            lines: updatedLines,
            captainSelectedBreaker: breaker,
            unlockedBreaker: breaker,
            engineerActionTaken: shouldSolveNow ? true : state.diagnostic.engineerActionTaken,
            isSolved: shouldSolveNow,
          },
          feedbackState: shouldSolveNow ? 'success' : 'idle',
          feedbackMessage: shouldSolveNow
            ? state.operationTheme === 'golge_protokolu'
              ? 'GÜVENLİK DUVARI AŞILDI! Fiziksel panel bypass tamamlandı, faz kilidi açıldı.'
              : 'KOORDİNATLAR AKTARILDI VE DEVRE DENGELENDİ! Sonraki aşamaya geçebilirsiniz.'
            : state.operationTheme === 'golge_protokolu'
              ? 'FİZİKSEL PANEL KİLİTLENDİ! Hackerın Subnet Köprüsünü senkronize etmesi bekleniyor.'
              : 'Güvenlik kilidi açıldı ve koordinatlar makiniste aktarıldı!',
        };
      }

      if (actionType === 'theme_diagnostic_solve' && activeMiniGame === 'ariza_teshisi') {
        if (actingRole !== 'muhendis') return state;
        if (state.diagnostic.isSolved) return state;

        if (state.operationTheme === 'derin_basinc') {
          const tanksOk =
            Boolean(data?.tanks) &&
            !data.tanks[1] &&
            Boolean(data.tanks[2]) &&
            !data.tanks[3] &&
            Boolean(data.tanks[4]);
          const pressureOk = Number(data?.pressure) === 48;
          if (!tanksOk || !pressureOk) {
            return applyPenalty(state, 'Hatalı tank seçimi veya basınç değeri! Dümenciden telsizle doğrula.');
          }
        }

        if (state.operationTheme === 'golge_protokolu') {
          if (data?.activeNode !== 'BETA' && data?.activeNode !== 'DELTA') {
            return applyPenalty(
              state,
              'HATALI DÜĞÜM SEÇİMİ! Node-Beta veya Node-Delta köprüsünü seçmelisin.',
              { timeLoss: 10, hullLoss: 0, stealthLoss: 5 }
            );
          }
        }

        const breaker = state.diagnostic.correctBreaker;
        const shouldSolveNow =
          state.operationTheme === 'golge_protokolu'
            ? state.diagnostic.captainSelectedBreaker === breaker
            : true;
        const updatedLines = shouldSolveNow
          ? {
              ...state.diagnostic.lines,
              [state.diagnostic.faultyLine]: {
                ...state.diagnostic.lines[state.diagnostic.faultyLine],
                temp: 54,
                press: 50,
                noise: 36,
                status: 'stabil' as const,
              },
            }
          : state.diagnostic.lines;

        return {
          ...state,
          diagnostic: {
            ...state.diagnostic,
            lines: updatedLines,
            captainSelectedBreaker:
              state.operationTheme === 'golge_protokolu'
                ? state.diagnostic.captainSelectedBreaker
                : breaker,
            unlockedBreaker:
              state.operationTheme === 'golge_protokolu'
                ? state.diagnostic.unlockedBreaker
                : breaker,
            engineerActionTaken: true,
            engineerSuggestedLine: state.diagnostic.faultyLine,
            engineerValveAngle: state.diagnostic.targetValveAngle,
            engineerThrottleActive: true,
            isSolved: shouldSolveNow,
          },
          feedbackState: shouldSolveNow ? 'success' : 'idle',
          feedbackMessage: shouldSolveNow
            ? state.operationTheme === 'golge_protokolu'
              ? 'KÖPRÜ BAŞARIYLA KURULDU! Fiziksel panel ve güvenlik duvarı senkronize edildi.'
              : 'BALAST DENGELENDİ! Vana ve basınç protokolü başarıyla mühürlendi.'
            : 'KÖPRÜ SENKRONİZE EDİLDİ! Ajanın Port-Delta (Sarı) ve 24.5V panelini kilitlemesi bekleniyor.',
        };
      }

      if (actionType === 'theme_signal_solve' && activeMiniGame === 'sinyal_cozumu') {
        if (state.signal.isSolved) return state;

        if (state.operationTheme === 'golge_protokolu') {
          if (actingRole === 'kaptan') {
            const angle = Number(data?.prismAngle);
            if (typeof data?.prismAngle !== 'number' || (angle !== 45 && angle !== 225)) {
              return applyPenalty(
                state,
                'LAZER SENSÖRÜ UYARISI! Prizma mandalını Hackerın bildirdiği doğru açıya getirin.',
                { timeLoss: 10, hullLoss: 0, stealthLoss: 10 }
              );
            }
          } else {
            if (Number(data?.empFreq) !== 740) {
              return applyPenalty(
                state,
                'EMP DAMPER HATALI! Hedef rezonansı 740 THz seviyesine sabitleyin.',
                { timeLoss: 10, hullLoss: 0, stealthLoss: 10 }
              );
            }
          }
        } else if (state.operationTheme === 'derin_basinc') {
          if (actingRole !== 'muhendis') return state;
          const tubeOk = Number(data?.tube) === 2;
          const freqOk = typeof data?.torpFreq === 'number' && Math.abs(Number(data.torpFreq) - 433.8) < 0.05;
          if (!tubeOk || !freqOk) {
            return applyPenalty(state, 'Hatalı kovan veya frekans! Dümencinin sonarına danış.');
          }
        }

        return {
          ...state,
          signal: {
            ...state.signal,
            engineerTunedFreq: data?.freq || state.signal.correctFrequency,
            isLocked: true,
            frequencyMatched: true,
            isSolved: true,
          },
          feedbackState: 'success',
          feedbackMessage:
            state.operationTheme === 'golge_protokolu'
              ? 'OPTİK PRİZMA VE KÖR NOKTA KORİDORU SENKRONİZE EDİLDİ!'
              : 'MANYETİK TORPİDO SİNYALİ KİLİTLENDİ! İletişim başarıyla sağlandı.',
        };
      }

      if (actionType === 'theme_cable_solve' && activeMiniGame === 'kablo_baglantisi') {
        if (actingRole !== 'muhendis') return state;
        if (state.cable.isSolved) return state;

        const valveOk = Boolean(data?.valves?.C) && !data?.valves?.A && !data?.valves?.B;
        const switchOk =
          Boolean(data?.switches?.sw2) &&
          !data?.switches?.sw1 &&
          !data?.switches?.sw3 &&
          !data?.switches?.sw4;
        const clampOk = Number(data?.clampProgress) >= 65;
        if (!valveOk || !switchOk || !clampOk) {
          return applyPenalty(state, 'Hatalı valf, şalter veya kelepçe ayarı! Dümenciye telsizle sor.');
        }

        return {
          ...state,
          cable: {
            ...state.cable,
            isTested: true,
            isSolved: true,
          },
          feedbackState: 'success',
          feedbackMessage: 'Bölme yalıtım mührü hatasız kilitlendi!',
        };
      }

      if (actionType === 'theme_airlock_solve' && activeMiniGame === 'hava_kilidi') {
        if (actingRole !== 'muhendis') return state;
        if (state.airlock.isSolved) return state;

        const voltOk = Math.abs(Number(data?.volt) - 180) <= 5;
        const catOk = Number(data?.catalystPct) >= 60 && Number(data?.catalystPct) <= 70;
        const cellsOk =
          Boolean(data?.cellSwitches?.katotA) &&
          Boolean(data?.cellSwitches?.katotB) &&
          Boolean(data?.cellSwitches?.anotC);
        if (!voltOk || !catOk || !cellsOk) {
          return applyPenalty(state, 'Hatalı voltaj, katalizör veya hücre seçimi! Dümenciden telsizle doğrula.');
        }

        return {
          ...state,
          airlock: {
            ...state.airlock,
            isSolved: true,
          },
          feedbackState: 'success',
          feedbackMessage: 'Oksijen üretimi ve hücre voltajı stabilize edildi!',
        };
      }
    }

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
    if (isThemeCustom) {
      if (actionType === 'theme_apply_penalty') {
        return applyPenalty(
          state,
          data?.reason || 'Hatalı müdahale tespit edildi!',
          {
            timeLoss: typeof data?.timeLoss === 'number' ? data.timeLoss : 15,
            hullLoss: typeof data?.hullLoss === 'number' ? data.hullLoss : 10,
            stealthLoss: typeof data?.stealthLoss === 'number' ? data.stealthLoss : 0,
          }
        );
      }

      if (actionType === 'derin_basinc_transmit_core') {
        if (actingRole !== 'kaptan') return state;
        return {
          ...state,
          energy: {
            ...state.energy,
            isDraftShared: true,
          },
          feedbackState: 'idle',
          feedbackMessage: 'Çekirdek enerji koordinatları makiniste iletildi!',
        };
      }

      if (actionType === 'derin_basinc_seal_reactor') {
        if (actingRole !== 'muhendis') return state;
        if (state.energy.isLocked) return state;

        const rodOk = typeof data?.k02Position === 'number' && data.k02Position <= 20;
        const valveOk = data?.valve1Open === true;
        const pressureOk = data?.currentPressure === 28;

        if (rodOk && valveOk && pressureOk) {
          return {
            ...state,
            energy: {
              ...state.energy,
              engineerAllocation: { yasamDestegi: 5, itki: 5, kalkan: 5 },
              isDraftShared: true,
              isLocked: true,
            },
            feedbackState: 'success',
            feedbackMessage: 'Soğutma pompası çalıştırıldı ve K-02 mühürlendi!',
          };
        }
        return applyPenalty(state, 'Hatalı reaktör mühürleme parametreleri (K-02 %20, Boru-1 Açık ve 28 Bar olmalı)!');
      }

      if (actionType === 'golge_energy_solve') {
        if (state.energy.isLocked) return state;
        if (actingRole === 'muhendis') {
          return {
            ...state,
            energy: {
              ...state.energy,
              isDraftShared: true,
            },
            feedbackState: 'idle',
            feedbackMessage: 'Kasa şifre matrisi kırıldı! PIN (8429) Ajanın terminaline aktarıldı, Ajan onayı bekleniyor.',
          };
        }
        if (actingRole !== 'kaptan') return state;
        if (typeof data?.pin !== 'string' || data.pin.trim() !== '8429') {
          return applyPenalty(
            state,
            'Hatalı kasa PIN kodu! Hacker ile telsizden doğrula.',
            { timeLoss: 15, hullLoss: 0, stealthLoss: 10 }
          );
        }
        return {
          ...state,
          energy: {
            ...state.energy,
            engineerAllocation: { yasamDestegi: 5, itki: 5, kalkan: 5 },
            isDraftShared: true,
            isLocked: true,
          },
          feedbackState: 'success',
          feedbackMessage: 'Kasa şifresi kırıldı ve biyometrik veri başarıyla çekildi!',
        };
      }
    }

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
    if (isThemeCustom) {
      if (actionType === 'derin_basinc_transmit_vector') {
        if (actingRole !== 'kaptan') return state;
        const angleStr = String(data?.angle || '');
        const routeId = angleStr.includes('45') ? 'alfa' : angleStr.includes('15') ? 'gama' : 'beta';
        return {
          ...state,
          rescue: {
            ...state.rescue,
            selectedRouteId: routeId,
            captainApproved: true,
            validationError: null,
          },
          feedbackState: 'idle',
          feedbackMessage: 'Yükseliş vektörü makiniste aktarıldı!',
        };
      }

      if (actionType === 'derin_basinc_trigger_ascent') {
        if (actingRole !== 'muhendis') return state;
        if (!state.rescue.captainApproved) {
          return {
            ...state,
            feedbackState: 'error',
            feedbackMessage: 'Dümencinin yükseliş vektörünü aktarması bekleniyor!',
          };
        }
        const pressureOk = Number(data?.pressure) === 18;
        const angleOk = Number(data?.angle) === 28;
        const tanksOk =
          Boolean(data?.tanks) &&
          Boolean(data.tanks[1]) &&
          !data.tanks[2] &&
          Boolean(data.tanks[3]) &&
          !data.tanks[4];
        if (!pressureOk || !angleOk || !tanksOk) {
          return applyPenalty(state, 'Hatalı tahliye parametreleri! Balast basıncı, çıkış açısı ve tank sırası doğrulanamadı.');
        }
        const scoreData = calculateFinalScore(4, state.timeLeftSeconds, state.hullIntegrity, 10);
        return {
          ...state,
          rescue: {
            ...state.rescue,
            captainApproved: true,
            engineerApproved: true,
          },
          status: 'phase_result',
          outcomeType: 'tam_basari',
          rescuedCrewCount: 10,
          completedTasksCount: 4,
          finalScore: scoreData.total,
          scoreBreakdown: scoreData.breakdown,
          feedbackState: 'success',
          feedbackMessage: 'Acil yüzeye çıkış başarıyla tamamlandı!',
        };
      }

      if (actionType === 'golge_transmit_escape') {
        if (actingRole !== 'kaptan') return state;
        return {
          ...state,
          rescue: {
            ...state.rescue,
            captainApproved: true,
            selectedRouteId: data?.route === 'metro' ? 'alfa' : 'beta',
            validationError: null,
          },
          feedbackState: 'idle',
          feedbackMessage: 'Kaçış rotası koordinatları hacker terminaline aktarıldı!',
        };
      }

      if (actionType === 'golge_execute_extraction') {
        if (actingRole !== 'muhendis') return state;
        if (!state.rescue.captainApproved) {
          return {
            ...state,
            feedbackState: 'error',
            feedbackMessage: 'Ajanın kaçış rotasını onaylayıp aktarması bekleniyor!',
          };
        }
        const scoreData = calculateFinalScore(4, state.timeLeftSeconds, state.hullIntegrity, 10);
        return {
          ...state,
          rescue: {
            ...state.rescue,
            captainApproved: true,
            engineerApproved: true,
          },
          status: 'phase_result',
          outcomeType: 'tam_basari',
          rescuedCrewCount: 10,
          completedTasksCount: 4,
          finalScore: scoreData.total,
          scoreBreakdown: scoreData.breakdown,
          feedbackState: 'success',
          feedbackMessage: 'Gölge Protokolü tahliyesi iz bırakmadan tamamlandı!',
        };
      }
    }

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

  // ---------------------------------------------------------------------------
  // Karantina 2088 Actions
  // ---------------------------------------------------------------------------
  if (actionType.startsWith('karantina_')) {
    const kData = state.karantinaData || generateKarantinaData();

    const isBioAction =
      actionType === 'karantina_set_spectral_filter' ||
      actionType === 'karantina_phase1_bio_transmit' ||
      actionType === 'karantina_set_bond_freq' ||
      actionType === 'karantina_phase2_bio_inject' ||
      actionType === 'karantina_set_vacuum_flow' ||
      actionType === 'karantina_phase3_bio_start';

    const isSecAction =
      actionType.startsWith('karantina_phase1_sec_') ||
      actionType.startsWith('karantina_phase2_sec_') ||
      actionType.startsWith('karantina_phase3_sec_');

    if (isBioAction && actingRole !== 'kaptan') {
      return {
        ...state,
        feedbackState: 'error',
        feedbackMessage: 'Yalnızca Baş Biyolog bu işlemi gerçekleştirebilir.',
      };
    }
    if (isSecAction && actingRole !== 'muhendis') {
      return {
        ...state,
        feedbackState: 'error',
        feedbackMessage: 'Yalnızca Güvenlik Şefi bu işlemi gerçekleştirebilir.',
      };
    }

    if (actionType === 'karantina_set_spectral_filter') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          spectralFilterNm: data.value,
        },
      };
    }

    if (actionType === 'karantina_phase1_bio_transmit') {
      if (data?.spectralNm !== undefined || data?.base !== undefined) {
        const nmOk = Number(data?.spectralNm) === 415;
        const baseOk = !data?.base || data.base === 'sitozin-9';
        if (!nmOk || !baseOk) {
          return applyPenalty(
            state,
            'Spektral filtre (415 nm) veya mutasyon bazı (Sitozin-9) doğrulanamadı!'
          );
        }
      }
      return {
        ...state,
        karantinaData: {
          ...kData,
          spectralFilterNm: data?.spectralNm ?? kData.spectralFilterNm,
          selectedBase: data?.base ?? kData.selectedBase,
          bioPhase1Transmitted: true,
        },
        feedbackState: 'success',
        feedbackMessage: 'MUTASYON TEŞHİSİ GÜVENLİK ŞEFİNE İLETİLDİ! Telsiz kanalı SEC_CH-4 aktif.',
      };
    }

    if (actionType === 'karantina_phase1_sec_select_sector') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          selectedUvSector: data.sector,
        },
      };
    }

    if (actionType === 'karantina_phase1_sec_select_valve') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          selectedValve: data.valve,
        },
      };
    }

    if (actionType === 'karantina_phase1_sec_solve') {
      const sector = data.sector ?? kData.selectedUvSector;
      const valve = data.valve ?? kData.selectedValve;
      if (sector === 3 && valve === 'B') {
        return {
          ...state,
          currentPhaseIndex: 1,
          completedTasksCount: Math.max(state.completedTasksCount || 0, 1),
          karantinaData: {
            ...kData,
            selectedUvSector: 3,
            selectedValve: 'B',
            phase1Solved: true,
          },
          feedbackState: 'success',
          feedbackMessage: 'SEKTÖR 3 VE VANA-B MÜHÜRLENDİ! Sızıntı durduruldu. 2. Aşamaya geçildi.',
        };
      } else {
        return applyPenalty(state, 'Hatalı sektör veya vana mühürlendi! Virüs ana hava kanallarına sızıyor.');
      }
    }

    if (actionType === 'karantina_set_bond_freq') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          bondFreqGhz: data.value,
        },
      };
    }

    if (actionType === 'karantina_phase2_bio_inject') {
      if (data?.bondFreqGhz !== undefined && Math.abs(Number(data.bondFreqGhz) - 8.4) > 0.15) {
        return applyPenalty(state, 'Reaksiyon bağ frekansı 8.4 GHz hedefine sabitlenmedi!');
      }
      return {
        ...state,
        karantinaData: {
          ...kData,
          bondFreqGhz: data?.bondFreqGhz ?? kData.bondFreqGhz,
          bioPhase2Injected: true,
        },
        feedbackState: 'success',
        feedbackMessage: 'PANZEHİR REAKTÖRE ENJEKTE EDİLDİ! Güvenlik Şefinin santrifüj ve soğutma ayarlarını kilitlemesi bekleniyor.',
      };
    }

    if (actionType === 'karantina_phase2_sec_adjust_rpm') {
      const newRpm = Math.max(1000, Math.min(5000, (kData.centrifugeRpm ?? 2400) + (data.delta || 0)));
      return {
        ...state,
        karantinaData: {
          ...kData,
          centrifugeRpm: newRpm,
        },
      };
    }

    if (actionType === 'karantina_phase2_sec_set_cooling') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          coolingValvePct: data.pct,
        },
      };
    }

    if (actionType === 'karantina_phase2_sec_toggle_relief') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          pressureReliefActive: !kData.pressureReliefActive,
        },
      };
    }

    if (actionType === 'karantina_phase2_sec_solve') {
      const rpm = data.rpm ?? kData.centrifugeRpm;
      const cooling = data.coolingValvePct ?? kData.coolingValvePct;
      if (rpm === 3800 && cooling === 75) {
        return {
          ...state,
          currentPhaseIndex: 2,
          completedTasksCount: Math.max(state.completedTasksCount || 0, 2),
          karantinaData: {
            ...kData,
            centrifugeRpm: 3800,
            coolingValvePct: 75,
            phase2Solved: true,
          },
          feedbackState: 'success',
          feedbackMessage: 'SANTRİFÜJ 3800 RPM & %75 SOĞUTMA İLE KİLİTLENDİ! Antikor sentezlendi. 3. Aşamaya geçildi.',
        };
      } else {
        return applyPenalty(state, 'Santrifüj devri veya soğutma seviyesi hatalı! Antikor zinciri parçalanma tehlikesinde.');
      }
    }

    if (actionType === 'karantina_set_vacuum_flow') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          vacuumFlowRate: data.value,
        },
      };
    }

    if (actionType === 'karantina_phase3_bio_start') {
      if (data?.vacuumFlowRate !== undefined && Math.abs(Number(data.vacuumFlowRate) - 6.2) > 0.15) {
        return applyPenalty(state, 'Vakum akış hızı 6.2 L/dk kritik değerine ayarlanmadı!');
      }
      return {
        ...state,
        karantinaData: {
          ...kData,
          vacuumFlowRate: data?.vacuumFlowRate ?? kData.vacuumFlowRate,
          bioPhase3Started: true,
        },
        feedbackState: 'success',
        feedbackMessage: 'VAKUM DÖNGÜSÜ BAŞLATILDI! Güvenlik Şefinin doğru tahliye bacası ve basıncı ateşlemesi bekleniyor.',
      };
    }

    if (actionType === 'karantina_phase3_sec_select_chimney') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          selectedChimney: data.chimney,
        },
      };
    }

    if (actionType === 'karantina_phase3_sec_adjust_bar') {
      const newBar = Math.max(0, Math.min(25, Number(((kData.chimneyBar ?? 6.0) + (data.delta || 0)).toFixed(1))));
      return {
        ...state,
        karantinaData: {
          ...kData,
          chimneyBar: newBar,
        },
      };
    }

    if (actionType === 'karantina_phase3_sec_toggle_latch') {
      return {
        ...state,
        karantinaData: {
          ...kData,
          safetyLatchUnlocked: !kData.safetyLatchUnlocked,
        },
      };
    }

    if (actionType === 'karantina_phase3_sec_solve') {
      const chimney = data.chimney ?? kData.selectedChimney;
      const bar = data.bar ?? kData.chimneyBar;
      if (chimney === 'BACA-02' && Math.abs(bar - 12.0) < 0.1) {
        const immunityScore = Math.max(
          2500,
          Math.round(5500 + state.hullIntegrity * 25 + state.timeLeftSeconds * 12)
        );
        const selinAccuracy = Number(
          Math.min(99.9, Math.max(70.0, 75 + state.hullIntegrity * 0.24)).toFixed(1)
        );
        return {
          ...state,
          status: 'phase_result',
          outcomeType: 'tam_basari',
          rescuedCrewCount: 10,
          completedTasksCount: 3,
          finalScore: immunityScore,
          karantinaData: {
            ...kData,
            selectedChimney: 'BACA-02',
            chimneyBar: 12.0,
            phase3Solved: true,
            immunityScore,
            selinAccuracy,
            baranValves: 3,
          },
          feedbackState: 'success',
          feedbackMessage: 'SALGIN DURDURULDU! Sektör-09 başarıyla dezenfekte edildi.',
        };
      } else {
        return applyPenalty(state, 'Hatalı tahliye bacası veya yanlış pnömatik basınç! Zehirli gaz sızdı.');
      }
    }

    if (actionType === 'karantina_restart') {
      return {
        ...state,
        roundId: generateRoundId(),
        status: 'lobby',
        currentPhaseIndex: 0,
        timeLeftSeconds: 300,
        hullIntegrity: 100,
        completedTasksCount: 0,
        rescuedCrewCount: 0,
        finalScore: 0,
        scoreBreakdown: undefined,
        outcomeType: undefined,
        players: {
          ...state.players,
          kaptan: {
            ...state.players.kaptan,
            ready: false,
            roleConfirmed: false,
          },
          muhendis: {
            ...state.players.muhendis,
            ready: false,
            roleConfirmed: false,
          },
        },
        karantinaData: generateKarantinaData(),
        feedbackState: 'idle',
        feedbackMessage: '',
      };
    }
  }

  return state;
}
