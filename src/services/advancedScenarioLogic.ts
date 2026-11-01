import { 
  MissionState, 
  Role, 
  AdvancedScenarioData,
  AdvancedSubsystemId,
  RescueRoute
} from '../types/game';
import { calculateFinalScore, RESCUE_ROUTES } from './gameFactory';

export interface ActionResult {
  nextState: MissionState;
  error?: string;
  penaltyApplied?: boolean;
}

export function applyAdvancedAction(
  state: MissionState,
  actionType: string,
  data: any,
  actingRole: Role
): ActionResult {
  if (!state.advancedScenario) {
    return { nextState: state, error: 'Gelişmiş senaryo verisi bulunamadı.' };
  }

  // Deep clone advanced scenario to avoid mutation
  const adv: AdvancedScenarioData = JSON.parse(JSON.stringify(state.advancedScenario));
  let hull = state.hullIntegrity;
  let timeLeft = state.timeLeftSeconds;
  let feedbackState = state.feedbackState;
  let feedbackMessage = state.feedbackMessage;
  let penaltyApplied = false;

  // Helper penalty applicator
  const applyPenalty = (msg: string, timeSec: number = 10, hullDmg: number = 5) => {
    timeLeft = Math.max(0, timeLeft - timeSec);
    hull = Math.max(1, hull - hullDmg);
    feedbackState = 'error';
    feedbackMessage = msg;
    penaltyApplied = true;
    adv.evacuationLog.push(`[Ceza] ${msg} (-${timeSec}s, -%${hullDmg} Gövde)`);
  };

  // 1. Tab Change
  if (actionType === 'advanced_tab_change') {
    if (data.tab) {
      adv.activeSubsystemTab = data.tab as AdvancedSubsystemId;
    }
    return {
      nextState: {
        ...state,
        advancedScenario: adv,
      },
    };
  }

  // 2. Power Distribution
  if (actionType === 'advanced_set_power') {
    const cooling = Math.max(0, Number(data.coolingPumps ?? adv.powerGrid.coolingPumps));
    const antenna = Math.max(0, Number(data.antennaBooster ?? adv.powerGrid.antennaBooster));
    const compressor = Math.max(0, Number(data.airlockCompressor ?? adv.powerGrid.airlockCompressor));
    const shield = Math.max(0, Number(data.shieldReserve ?? adv.powerGrid.shieldReserve));

    const total = cooling + antenna + compressor + shield;
    if (total > adv.powerGrid.totalBudget) {
      return {
        nextState: state,
        error: `Toplam güç (${total} MW), azami ${adv.powerGrid.totalBudget} MW sınırını aşıyor!`,
      };
    }

    adv.powerGrid.coolingPumps = cooling;
    adv.powerGrid.antennaBooster = antenna;
    adv.powerGrid.airlockCompressor = compressor;
    adv.powerGrid.shieldReserve = shield;

    // Apply immediate inter-system effects
    adv.subsystems.reaktor.coolantPumpsPower = cooling;
    adv.subsystems.sinyal.antennaPower = antenna;
    adv.subsystems.sinyal.noiseLevel = antenna >= 3 ? 4 : 85;
    adv.subsystems.hava_kilidi.compressorPower = compressor;

    adv.evacuationLog.push(`[Güç Matrisi] Soğutma: ${cooling}MW | Anten: ${antenna}MW | Kompresör: ${compressor}MW | Kalkan: ${shield}MW`);

    return {
      nextState: {
        ...state,
        advancedScenario: adv,
        feedbackState: 'idle',
        feedbackMessage: 'Yardımcı güç dağılımı güncellendi.',
      },
    };
  }

  // 3. Reactor Breaker
  if (actionType === 'advanced_reactor_breaker') {
    if (actingRole !== 'kaptan') {
      return { nextState: state, error: 'Yalnızca Kaptan reaktör güvenlik kesicisini devreye alabilir.' };
    }

    if (adv.subsystems.reaktor.isStabilized) {
      return { nextState: state };
    }

    const breaker = data.breaker;
    adv.subsystems.reaktor.captainSelectedBreaker = breaker;

    if (adv.subsystems.reaktor.coolantPumpsPower < 4) {
      applyPenalty('Soğutma pompaları yetersiz (< 4 MW)! Aşırı ısınan kesici ark yaptı!');
      return {
        nextState: {
          ...state,
          hullIntegrity: hull,
          timeLeftSeconds: timeLeft,
          feedbackState,
          feedbackMessage,
          advancedScenario: adv,
        },
        penaltyApplied: true,
      };
    }

    if (breaker === adv.subsystems.reaktor.targetBreaker) {
      adv.subsystems.reaktor.breakerActivated = true;
      adv.subsystems.reaktor.unlockedBreaker = breaker;
      adv.evacuationLog.push(`[Reaktör] Kesici ${breaker} başarıyla devreye alındı.`);
      feedbackState = 'success';
      feedbackMessage = `GÜVENLİK KİLİDİ AÇILDI (${breaker})! Devre akımı kesildi. Mühendisin soğutma valfi ve basınç tahliyesi bekleniyor.`;
    } else {
      adv.subsystems.reaktor.breakerActivated = false;
      adv.subsystems.reaktor.unlockedBreaker = null;
      applyPenalty(`Hatalı kesici (${breaker}) seçildi! İzole edilen hatta anomali bulunmuyor.`);
    }

    return {
      nextState: {
        ...state,
        hullIntegrity: hull,
        timeLeftSeconds: timeLeft,
        feedbackState,
        feedbackMessage,
        advancedScenario: adv,
      },
      penaltyApplied,
    };
  }

  // 4. Reactor Purge
  if (actionType === 'advanced_reactor_purge') {
    if (actingRole !== 'muhendis') {
      return { nextState: state, error: 'Yalnızca Mühendis reaktör hat tahliyesi yapabilir.' };
    }

    if (adv.subsystems.reaktor.isStabilized) {
      return { nextState: state };
    }

    if (!data.line) {
      return {
        nextState: {
          ...state,
          feedbackState: 'error',
          feedbackMessage: 'Müdahale için önce canlı sensörlerde arızalı devreyi tespit edip işaretleyin.',
        },
        error: 'Müdahale için önce canlı sensörlerde arızalı devreyi tespit edip işaretleyin.',
      };
    }

    if (!adv.subsystems.reaktor.breakerActivated) {
      applyPenalty('Güvenlik kilidi devrede! Kaptan ana şebekeden kesiciyi açmadan tahliye vanası çalıştırılamaz.');
      return {
        nextState: {
          ...state,
          hullIntegrity: hull,
          timeLeftSeconds: timeLeft,
          feedbackState,
          feedbackMessage,
          advancedScenario: adv,
        },
        penaltyApplied: true,
      };
    }

    if (adv.subsystems.reaktor.coolantPumpsPower < 4) {
      applyPenalty('Soğutma pompaları yetersiz (< 4 MW)! Çekirdek ısısı düşürülemedi.');
      return {
        nextState: {
          ...state,
          hullIntegrity: hull,
          timeLeftSeconds: timeLeft,
          feedbackState,
          feedbackMessage,
          advancedScenario: adv,
        },
        penaltyApplied: true,
      };
    }

    // Reject if valveAngle or throttleActive is missing (do not auto-fill with correct answer!)
    if (data.valveAngle === undefined || data.valveAngle === null) {
      return {
        nextState: {
          ...state,
          feedbackState: 'error',
          feedbackMessage: 'Müdahale başarısız: Soğutma valfi açısı belirtilmedi. Lütfen valf açısını ayarlayın.',
        },
        error: 'Müdahale başarısız: Soğutma valfi açısı belirtilmedi. Lütfen valf açısını ayarlayın.',
      };
    }

    if (data.throttleActive === undefined || data.throttleActive === null) {
      return {
        nextState: {
          ...state,
          feedbackState: 'error',
          feedbackMessage: 'Müdahale başarısız: Basınç tahliye anahtarı konumu belirtilmedi. Lütfen tahliye anahtarını ayarlayın.',
        },
        error: 'Müdahale başarısız: Basınç tahliye anahtarı konumu belirtilmedi. Lütfen tahliye anahtarını ayarlayın.',
      };
    }

    const line = data.line;
    const targetLine = adv.subsystems.reaktor.faultyLine || adv.subsystems.reaktor.liveTelemetry.criticalLine;
    if (line !== targetLine) {
      applyPenalty('Hatalı hat tahliyesi! Seçilen devrede çoklu arıza koşulları oluşmamış. Sağlam devreye müdahale edildi.');
      return {
        nextState: {
          ...state,
          hullIntegrity: hull,
          timeLeftSeconds: timeLeft,
          feedbackState,
          feedbackMessage,
          advancedScenario: adv,
        },
        penaltyApplied: true,
      };
    }

    const targetAngle = adv.subsystems.reaktor.targetValveAngle || 135;
    if (data.valveAngle !== targetAngle) {
      applyPenalty('Müdahale başarısız: Soğutma valfi doğru açıda değil. Termal şok riski nedeniyle tahliye emniyet valfi tarafından durduruldu.');
      return {
        nextState: {
          ...state,
          hullIntegrity: hull,
          timeLeftSeconds: timeLeft,
          feedbackState,
          feedbackMessage,
          advancedScenario: adv,
        },
        penaltyApplied: true,
      };
    }

    if (!data.throttleActive) {
      applyPenalty('Müdahale başarısız: Basınç tahliyesi devre dışı. Hat basıncı boşaltılmadan devre açılamaz.');
      return {
        nextState: {
          ...state,
          hullIntegrity: hull,
          timeLeftSeconds: timeLeft,
          feedbackState,
          feedbackMessage,
          advancedScenario: adv,
        },
        penaltyApplied: true,
      };
    }

    // All passed!
    adv.subsystems.reaktor.isPurged = true;
    adv.subsystems.reaktor.isStabilized = true;
    adv.subsystems.reaktor.liveTelemetry.coreTemp = 58;
    adv.subsystems.reaktor.liveTelemetry.coolantPressure = 50;
    adv.subsystems.reaktor.liveTelemetry.lineNoise = 36;
    if (adv.subsystems.reaktor.lines && adv.subsystems.reaktor.lines[targetLine]) {
      adv.subsystems.reaktor.lines[targetLine] = {
        ...adv.subsystems.reaktor.lines[targetLine],
        temp: 54,
        press: 50,
        noise: 36,
        status: 'stabil',
      };
    }
    adv.evacuationLog.push(`✅ [Reaktör] Kritik devre (${line}) başarıyla tahliye edildi ve soğutuldu. Çekirdek ısısı 58°C ye stabilize oldu.`);
    feedbackState = 'success';
    feedbackMessage = 'MÜDAHALE TAMAMLANDI! Reaktör çekirdeği dengelendi. İtki gücü hazır.';

    return {
      nextState: {
        ...state,
        hullIntegrity: hull,
        timeLeftSeconds: timeLeft,
        completedTasksCount: (state.completedTasksCount || 0) + (adv.subsystems.reaktor.isStabilized ? 1 : 0),
        feedbackState,
        feedbackMessage,
        advancedScenario: adv,
      },
      penaltyApplied: false,
    };
  }

  // 5. Signal Tune & Lock
  if (actionType === 'advanced_signal_tune') {
    if (actingRole !== 'muhendis') {
      return { nextState: state, error: 'Yalnızca Mühendis sinyal frekansını ayarlayabilir.' };
    }

    if (adv.subsystems.sinyal.antennaPower < 3) {
      return {
        nextState: state,
        error: 'Anten güçlendirici yetersiz (< 3 MW)! Parazit %85 iken frekans kilitlenemez.',
      };
    }

    const freq = data.freq;
    adv.subsystems.sinyal.currentFrequency = freq;

    if (freq === adv.subsystems.sinyal.targetFrequency) {
      adv.subsystems.sinyal.isLocked = true;
      adv.evacuationLog.push(`✅ [Sinyal] ${freq} frekansında USS Aurora kurtarma gemisine kilitlenildi!`);
      feedbackState = 'success';
      feedbackMessage = 'Sinyal frekansı kilitlendi! Telemetri veri akışı kuruldu.';
    } else {
      applyPenalty(`Hatalı frekans (${freq})! Taşıyıcı dalga yankısı parazit yarattı.`);
    }

    return {
      nextState: {
        ...state,
        hullIntegrity: hull,
        timeLeftSeconds: timeLeft,
        completedTasksCount: (state.completedTasksCount || 0) + (adv.subsystems.sinyal.isLocked ? 1 : 0),
        feedbackState,
        feedbackMessage,
        advancedScenario: adv,
      },
      penaltyApplied,
    };
  }

  // 6. Airlock Params
  if (actionType === 'advanced_airlock_params') {
    if (actingRole !== 'muhendis') return { nextState: state };
    if (data.dialIndex !== undefined) adv.subsystems.hava_kilidi.currentDialIndex = data.dialIndex;
    if (data.vacuum !== undefined) adv.subsystems.hava_kilidi.currentVacuum = data.vacuum;

    return {
      nextState: {
        ...state,
        advancedScenario: adv,
      },
    };
  }

  // 7. Airlock Seal
  if (actionType === 'advanced_airlock_seal') {
    if (actingRole !== 'muhendis') {
      return { nextState: state, error: 'Yalnızca Mühendis hava kilidini mühürleyebilir.' };
    }

    if (adv.subsystems.hava_kilidi.compressorPower < 3) {
      return {
        nextState: state,
        error: 'Basınç kompresörü yetersiz (< 3 MW)! Mühürleme için en az 3 MW gereklidir.',
      };
    }

    const { currentDialIndex, currentVacuum, targetDialIndex, targetVacuumMin, targetVacuumMax } = adv.subsystems.hava_kilidi;
    const dialOk = currentDialIndex === targetDialIndex;
    const vacOk = currentVacuum >= targetVacuumMin && currentVacuum <= targetVacuumMax;

    if (dialOk && vacOk) {
      adv.subsystems.hava_kilidi.isSealed = true;
      adv.evacuationUnlocked = true;
      adv.evacuationLog.push('✅ [Hava Kilidi] Basınç odası mühürlendi. Ana tahliye doku ve Rota Alfa (10 Kişi) açıldı!');
      feedbackState = 'success';
      feedbackMessage = 'Hava kilidi mühürlendi! Rota Alfa (Tam Tahliye) erişilebilir.';
    } else {
      applyPenalty('Hava kilidi parametreleri uyuşmuyor! Basınç kaçağı ve mikro yırtılma oluştu.');
    }

    return {
      nextState: {
        ...state,
        hullIntegrity: hull,
        timeLeftSeconds: timeLeft,
        completedTasksCount: (state.completedTasksCount || 0) + (adv.subsystems.hava_kilidi.isSealed ? 1 : 0),
        feedbackState,
        feedbackMessage,
        advancedScenario: adv,
      },
      penaltyApplied,
    };
  }

  // 8. Event Reaction (Plasma Surge)
  if (actionType === 'advanced_event_react') {
    const reaction = data.reaction as 'kalkan' | 'tahliye';
    if (reaction === 'kalkan') {
      if (adv.powerGrid.shieldReserve < 3) {
        return {
          nextState: state,
          error: 'Deflektör kalkanı için Güç Matrisinde en az 3 MW Kalkan Rezervi ayrılmış olmalıdır!',
        };
      }
      adv.event.isResolved = true;
      adv.event.isActive = false;
      adv.event.chosenReaction = 'kalkan';
      adv.event.narrativeResult = 'Deflektör kalkanları plazma dalgasını %100 absorbe etti! Gövde hasar almadı.';
      adv.evacuationLog.push('🛡️ [Olay] Plazma dalgası deflektör kalkanı tarafından tamamen sönümlendi.');
      feedbackState = 'success';
      feedbackMessage = 'Kalkanlar plazma dalgasını engelledi! Gövde bütünlüğü korundu.';
    } else if (reaction === 'tahliye') {
      adv.event.isResolved = true;
      adv.event.isActive = false;
      adv.event.chosenReaction = 'tahliye';
      adv.event.narrativeResult = 'Plazma acil radyatör bacalarından tahliye edildi (-%5 Gövde hasarı).';
      hull = Math.max(1, hull - 5);
      adv.evacuationLog.push('💨 [Olay] Plazma radyatör bacalarından tahliye edildi (-%5 Gövde sürtünmesi).');
      feedbackState = 'idle';
      feedbackMessage = 'Plazma bacalardan boşaltıldı (-%5 Gövde). Olay bertaraf edildi.';
    }

    return {
      nextState: {
        ...state,
        hullIntegrity: hull,
        timeLeftSeconds: timeLeft,
        feedbackState,
        feedbackMessage,
        advancedScenario: adv,
      },
    };
  }

  // 9. Rescue Selection & Dual Confirmation
  if (actionType === 'advanced_rescue_select') {
    if (data.routeId) {
      state.rescue.selectedRouteId = data.routeId;
      state.rescue.captainApproved = false;
      state.rescue.engineerApproved = false;
      adv.evacuationLog.push(`[Tahliye Planı] Rota ${data.routeId.toUpperCase()} seçildi. Her iki rolün onayı bekleniyor.`);
    }
    return {
      nextState: {
        ...state,
        rescue: {
          ...state.rescue,
          selectedRouteId: data.routeId,
          captainApproved: false,
          engineerApproved: false,
          validationError: null,
        },
        advancedScenario: adv,
      },
    };
  }

  if (actionType === 'advanced_rescue_approve') {
    const isCaptain = actingRole === 'kaptan';
    const nextCap = isCaptain ? !state.rescue.captainApproved : state.rescue.captainApproved;
    const nextEng = !isCaptain ? !state.rescue.engineerApproved : state.rescue.engineerApproved;

    const nextRescue = {
      ...state.rescue,
      captainApproved: nextCap,
      engineerApproved: nextEng,
    };

    adv.evacuationLog.push(`[Tahliye Onayı] ${isCaptain ? 'Kaptan' : 'Mühendis'} ${nextRescue.selectedRouteId.toUpperCase()} rotasını ${isCaptain ? nextCap : nextEng ? 'onayladı' : 'geri çekti'}.`);

    // When both approve, validate prerequisites and compute outcome
    if (nextCap && nextEng) {
      const routeId = nextRescue.selectedRouteId;

      // 1. Strict Prerequisite Validations
      if (routeId === 'alfa') {
        const missing: string[] = [];
        if (!adv.subsystems.reaktor.isStabilized) missing.push('Reaktör');
        if (!adv.subsystems.sinyal.isLocked) missing.push('Sinyal');
        if (!adv.subsystems.hava_kilidi.isSealed) missing.push('Hava Kilidi');

        if (missing.length > 0) {
          const err = `Rota Alfa (Tam Tahliye) için tüm sistemler (Reaktör, Sinyal ve Hava Kilidi) tamamlanmalıdır! Eksikler: ${missing.join(', ')}`;
          nextRescue.captainApproved = false;
          nextRescue.engineerApproved = false;
          nextRescue.validationError = err;
          adv.evacuationLog.push(`[Reddedildi] Rota Alfa önkoşulları eksik: ${missing.join(', ')}`);
          return {
            nextState: {
              ...state,
              feedbackState: 'error',
              feedbackMessage: err,
              rescue: nextRescue,
              advancedScenario: adv,
            },
            error: err,
          };
        }
      } else if (routeId === 'beta') {
        const missing: string[] = [];
        if (!adv.subsystems.reaktor.isStabilized) missing.push('Reaktör');
        if (!adv.subsystems.sinyal.isLocked) missing.push('Sinyal');

        if (missing.length > 0) {
          const err = `Rota Beta (Lagrange Koridoru) için Reaktör dengelenmiş ve Sinyal kilitlenmiş olmalıdır! Eksikler: ${missing.join(', ')}`;
          nextRescue.captainApproved = false;
          nextRescue.engineerApproved = false;
          nextRescue.validationError = err;
          adv.evacuationLog.push(`[Reddedildi] Rota Beta önkoşulları eksik: ${missing.join(', ')}`);
          return {
            nextState: {
              ...state,
              feedbackState: 'error',
              feedbackMessage: err,
              rescue: nextRescue,
              advancedScenario: adv,
            },
            error: err,
          };
        }
      } else if (routeId === 'gama') {
        const hasAtLeastOne = adv.subsystems.reaktor.isStabilized || adv.subsystems.sinyal.isLocked;
        if (!hasAtLeastOne) {
          const err = 'Rota Gama (Acil Kaçış Podu) için en az bir sistemin (Reaktör veya Sinyal) çalışır durumda olması gerekir. Sıfır hazırlıkla fırlatma yapılamaz!';
          nextRescue.captainApproved = false;
          nextRescue.engineerApproved = false;
          nextRescue.validationError = err;
          adv.evacuationLog.push('[Reddedildi] Rota Gama önkoşulu eksik: En az Reaktör veya Sinyal hazırlanmalıdır.');
          return {
            nextState: {
              ...state,
              feedbackState: 'error',
              feedbackMessage: err,
              rescue: nextRescue,
              advancedScenario: adv,
            },
            error: err,
          };
        }
      }

      // 2. Travel Time & Hull Checks
      const travelTime = routeId === 'alfa' ? 75 : routeId === 'beta' ? 50 : 30;
      const travelHullStress = routeId === 'gama' ? 10 : 5;

      const tasksCompleted = 
        (adv.subsystems.reaktor.isStabilized ? 1 : 0) +
        (adv.subsystems.sinyal.isLocked ? 1 : 0) +
        (adv.subsystems.hava_kilidi.isSealed ? 1 : 0);

      // Check Time Constraint
      if (timeLeft < travelTime) {
        adv.evacuationLog.push(`💥 [Zaman Aşımı] ${routeId.toUpperCase()} rotası için gereken süre (${travelTime}s) kalan süreden (${timeLeft}s) fazla! Süre tükendi.`);
        const scoreData = calculateFinalScore(tasksCompleted, 0, Math.max(0, hull), 0);
        return {
          nextState: {
            ...state,
            status: 'phase_result',
            rescuedCrewCount: 0,
            completedTasksCount: tasksCompleted,
            timeLeftSeconds: 0,
            hullIntegrity: Math.max(0, hull),
            finalScore: scoreData.total,
            scoreBreakdown: scoreData.breakdown,
            outcomeType: 'basarisizlik',
            feedbackState: 'error',
            feedbackMessage: `Tahliye yolculuğu için süre (${travelTime}s) yetmedi! Mekik ulaşamadan süre tükendi.`,
            rescue: nextRescue,
            advancedScenario: adv,
          },
        };
      }

      // Deduct travel time
      timeLeft = timeLeft - travelTime;
      adv.evacuationLog.push(`⏱️ [Yolculuk Süresi] ${travelTime}s seyahat süresi düşüldü. Kalan süre: ${timeLeft}s.`);

      // Check Hull Constraint
      if (hull <= travelHullStress) {
        adv.evacuationLog.push(`💥 [Gövde Parçalandı] Tahliye manevrası sırasında gövde kritik yapısal hasar aldı (%0).`);
        const scoreData = calculateFinalScore(tasksCompleted, timeLeft, 0, 0);
        return {
          nextState: {
            ...state,
            status: 'phase_result',
            rescuedCrewCount: 0,
            completedTasksCount: tasksCompleted,
            timeLeftSeconds: timeLeft,
            hullIntegrity: 0,
            finalScore: scoreData.total,
            scoreBreakdown: scoreData.breakdown,
            outcomeType: 'basarisizlik',
            feedbackState: 'error',
            feedbackMessage: 'Tahliye manevrası sırasında gövde bütünlüğü sıfırlandı! İstasyon parçalandı.',
            rescue: nextRescue,
            advancedScenario: adv,
          },
        };
      }

      // Deduct hull stress
      hull = hull - travelHullStress;
      adv.evacuationLog.push(`🛡️ [Gövde Stresi] Tahliye manevrası gövdede -%${travelHullStress} yapısal hasar bıraktı (Kalan: %${hull}).`);

      // 3. Successful Rescue Outcome
      let crewSaved = 0;
      let outcome: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik' = 'kismi_kurtarma';

      if (routeId === 'alfa') {
        crewSaved = 10;
        outcome = 'tam_basari';
        adv.evacuationLog.push('🚀 [Tam Tahliye Başarılı] 10 personelin tamamı ağır tahliye filosuyla kurtarıldı!');
      } else if (routeId === 'beta') {
        crewSaved = 8;
        outcome = 'tam_basari';
        adv.evacuationLog.push('🚀 [Tahliye Başarılı] Lagrange otonom mekiğiyle 8 mürettebat sıfır riskle kurtarıldı.');
      } else if (routeId === 'gama') {
        crewSaved = 6;
        outcome = 'kismi_kurtarma';
        adv.evacuationLog.push('🚀 [Acil Tahliye] Acil kaçış poduyla 6 personel güvenli bölgeye ulaştırıldı.');
      }

      const scoreData = calculateFinalScore(tasksCompleted, timeLeft, hull, crewSaved);
      const signalBonus = adv.subsystems.sinyal.isLocked ? 200 : 0;
      const reactorBonus = adv.subsystems.reaktor.isStabilized ? 200 : 0;
      const totalScore = scoreData.total + signalBonus + reactorBonus;

      return {
        nextState: {
          ...state,
          status: 'phase_result',
          rescuedCrewCount: crewSaved,
          completedTasksCount: tasksCompleted,
          timeLeftSeconds: timeLeft,
          hullIntegrity: hull,
          finalScore: totalScore,
          scoreBreakdown: {
            ...scoreData.breakdown,
            tasksScore: scoreData.breakdown.tasksScore + signalBonus + reactorBonus,
          },
          outcomeType: outcome,
          feedbackState: 'success',
          feedbackMessage: outcome === 'tam_basari'
            ? `Tebrikler! ${crewSaved} personel başarıyla kurtarıldı (Tam Başarı).`
            : `Tahliye tamamlandı! ${crewSaved} personel kurtarıldı (Kısmi Kurtarma).`,
          rescue: nextRescue,
          advancedScenario: adv,
        },
      };
    }

    return {
      nextState: {
        ...state,
        rescue: nextRescue,
        advancedScenario: adv,
      },
    };
  }

  return { nextState: state };
}
