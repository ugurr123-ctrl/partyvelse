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
    const breaker = data.breaker;
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
      adv.evacuationLog.push(`[Reaktör] Kesici ${breaker} başarıyla devreye alındı.`);
      feedbackState = 'success';
      feedbackMessage = `Kesici ${breaker} devrede. Şimdi sorunlu hattı tahliye edin.`;
    } else {
      adv.subsystems.reaktor.breakerActivated = false;
      applyPenalty(`Hatalı kesici (${breaker}) seçildi! Yüksek rezonans aşırı yüklemesi.`);
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

    if (!adv.subsystems.reaktor.breakerActivated) {
      applyPenalty('Kesici devresi açık olmadan tahliye yapılamaz!');
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

    const line = data.line;
    if (line === adv.subsystems.reaktor.liveTelemetry.criticalLine) {
      adv.subsystems.reaktor.isPurged = true;
      adv.subsystems.reaktor.isStabilized = true;
      adv.subsystems.reaktor.liveTelemetry.coreTemp = 58;
      adv.evacuationLog.push('✅ [Reaktör] Kritik hat tahliye edildi. Çekirdek ısısı 58°C ye stabilize oldu.');
      feedbackState = 'success';
      feedbackMessage = 'Reaktör çekirdeği dengelendi! İtki gücü hazır.';
    } else {
      applyPenalty(`Hatalı hat (${line}) tahliye edildi! Soğutucu sıvısı ziyan oldu.`);
    }

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
      penaltyApplied,
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

    // When both approve, compute final multi-factor outcome!
    if (nextCap && nextEng) {
      const routeId = nextRescue.selectedRouteId;
      let crewSaved = 0;
      let outcome: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik' = 'kismi_kurtarma';
      const tasksCompleted = 
        (adv.subsystems.reaktor.isStabilized ? 1 : 0) +
        (adv.subsystems.sinyal.isLocked ? 1 : 0) +
        (adv.subsystems.hava_kilidi.isSealed ? 1 : 0);

      if (routeId === 'alfa') {
        if (adv.subsystems.hava_kilidi.isSealed) {
          crewSaved = 10;
          outcome = 'tam_basari';
          adv.evacuationLog.push('🚀 [Tahliye Başarılı] Mühürlü hava kilidinden 10 personelin tamamı tahliye filosuna aktarıldı!');
        } else {
          crewSaved = 3;
          outcome = 'kismi_kurtarma';
          adv.evacuationLog.push('⚠️ [Tahliye Zayiatı] Hava kilidi mühürlenmediği için basınç patlaması oldu; 7 personel kaybedildi, yalnızca 3 kişi kurtarılabildi.');
        }
      } else if (routeId === 'beta') {
        crewSaved = 8;
        outcome = (adv.subsystems.reaktor.isStabilized && adv.subsystems.sinyal.isLocked) ? 'tam_basari' : 'kismi_kurtarma';
        adv.evacuationLog.push('🚀 [Tahliye Başarılı] Lagrange otonom mekiğiyle 8 mürettebat güvenle tahliye edildi.');
      } else if (routeId === 'gama') {
        crewSaved = 6;
        outcome = 'kismi_kurtarma';
        adv.evacuationLog.push('🚀 [Acil Tahliye] Kaçış podu fırlatıldı; 6 personel kurtarıldı.');
      }

      // Calculate score
      const taskScore = tasksCompleted * 250;
      const timeBonus = Math.max(0, timeLeft * 2);
      const hullBonus = Math.round(hull * 3);
      const crewBonus = crewSaved * 60;
      const signalBonus = adv.subsystems.sinyal.isLocked ? 200 : 0;
      const reactorBonus = adv.subsystems.reaktor.isStabilized ? 200 : 0;
      const totalScore = taskScore + timeBonus + hullBonus + crewBonus + signalBonus + reactorBonus;

      return {
        nextState: {
          ...state,
          status: 'phase_result',
          rescuedCrewCount: crewSaved,
          completedTasksCount: tasksCompleted,
          finalScore: totalScore,
          scoreBreakdown: {
            tasksScore: taskScore + signalBonus + reactorBonus,
            timeBonus,
            hullBonus,
            crewBonus,
          },
          outcomeType: outcome,
          feedbackState: outcome === 'tam_basari' ? 'success' : 'idle',
          feedbackMessage: outcome === 'tam_basari' 
            ? 'Tebrikler! Görev tam başarıyla sonuçlandı.' 
            : 'Tahliye tamamlandı. Kısmi kurtarma sağlandı.',
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
