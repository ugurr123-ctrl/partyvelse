import http from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { LostSignalRoom } from '../server/LostSignalRoom';
import { MissionState, Role, TeamOperationTheme } from '../src/types/game';
import { createInitialMissionState } from '../src/services/gameFactory';
import {
  TEAM_OPERATION_THEMES,
  applyOmegaAction,
  filterOmegaStateForRole,
  generateOmegaData,
  getOmegaRolesForCount,
  getTeamOperationMeta,
} from '../src/services/omegaGameEngine';

console.log('======================================================================');
console.log('🚀 3 & 4 OYUNCULU 4 TAKIM OYUNU (5 AŞAMA) + 2P REGRESYON TESTİ');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assertTrue(cond: boolean, desc: string) {
  totalTests++;
  if (!cond) {
    failedTests++;
    failures.push(desc);
    console.error(`  ❌ HATA: ${desc}`);
  } else {
    passedTests++;
    console.log(`  ✓ ${desc}`);
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SECTOR_IDS = ['S1', 'S2', 'S3', 'S4', 'S5'] as const;

function computeStage1Answers(
  glyphTag: [string, string, string, string],
  faultySectorId: 'S1' | 'S2' | 'S3' | 'S4' | 'S5',
  cipherTable: Record<string, number>,
  cipherRuleType: 'swap_first_two' | 'reverse_last_two' | 'shift_plus_one'
) {
  const rawDigits = glyphTag.map((g) => cipherTable[g]);
  const transformed =
    cipherRuleType === 'swap_first_two'
      ? [rawDigits[1], rawDigits[0], rawDigits[2], rawDigits[3]]
      : cipherRuleType === 'reverse_last_two'
      ? [rawDigits[0], rawDigits[1], rawDigits[3], rawDigits[2]]
      : rawDigits.map((d) => (d + 1) % 10);
  const pin = transformed.join('');
  const pinSum = rawDigits.reduce((acc, d) => acc + d, 0);
  const valveAngle: 45 | 90 | 135 | 180 =
    pinSum % 4 === 0 ? 45 : pinSum % 4 === 1 ? 90 : pinSum % 4 === 2 ? 135 : 180;
  const pumpTier = ((pinSum % 5) + 1) as 1 | 2 | 3 | 4 | 5;
  const polarity = (['ALFA', 'BETA', 'GAMA'] as const)[pinSum % 3];
  const subChannel = (['X1', 'X2', 'X3'] as const)[(pinSum + SECTOR_IDS.indexOf(faultySectorId)) % 3];
  return { pin, valveAngle, pumpTier, polarity, subChannel };
}

function testProceduralAndFiltering() {
  console.log('▶ [BÖLÜM 1] 4 Takım Oyunu × (3P & 4P) Prosedürel Üretim ve Anti-Spoiler Filtreleme');

  for (const theme of TEAM_OPERATION_THEMES) {
    const meta = getTeamOperationMeta(theme);
    for (const count of [3, 4] as const) {
      const omega = generateOmegaData(count, theme);
      const faultySector = omega.stage1.sectors.find((s) => s.id === omega.stage1.faultySectorId)!;
      const s1Derived = computeStage1Answers(
        faultySector.glyphTag,
        omega.stage1.faultySectorId,
        omega.stage1.glyphCipherTable,
        omega.stage1.cipherRuleType
      );

      const s2FreqNum =
        omega.stage2.keyBaseFreqMap[omega.stage2.targetBandKey] +
        omega.stage2.measuredNoiseDb +
        omega.stage2.resonanceDrift;
      const s2Pulse = (['P-1', 'P-2', 'P-3'] as const)[s2FreqNum % 3];
      const s2Relay = (['F1', 'F2', 'F3'] as const)[(s2FreqNum + 1) % 3];

      const s3ChecksumVal =
        (omega.stage3.targetItki * 2 +
          omega.stage3.targetKalkan * 3 +
          omega.stage3.targetYasam * 5 +
          omega.stage3.targetSogutma * 7) *
        omega.stage3.checksumMultiplier;
      const s3Checksum = String((s3ChecksumVal % 900) + 100);
      const s4Proto = omega.stage4.protocolRelayBook[omega.stage4.protocolCode];
      const s5Launch = `${omega.stage5.routeLaunchCodes[omega.stage5.recommendedRoute]}-${omega.stage5.hatchPin}`;

      assertTrue(
        omega.themeId === theme && omega.playerCount === count && omega.activeStage === 1,
        `${meta.shortTitle} (${count}P): Tema, oyuncu sayısı ve activeStage=1 doğru`
      );
      assertTrue(
        omega.stage1.sectors.length === 5 && omega.stage1.sectors.every((s) => s.glyphTag.length === 4),
        `${meta.shortTitle} (${count}P): Aşama 1 -> 5 sektör × 4 glif üretildi`
      );
      assertTrue(
        omega.stage1.targetPin === s1Derived.pin &&
          omega.stage1.targetValveAngle === s1Derived.valveAngle &&
          omega.stage1.targetPumpTier === s1Derived.pumpTier &&
          omega.stage1.targetPolarity === s1Derived.polarity &&
          omega.stage1.targetSubChannel === s1Derived.subChannel,
        `${meta.shortTitle} (${count}P): Aşama 1 dönüşüm PIN + valf/pompa + polarite/alt-kanal formülleri tutarlı`
      );
      assertTrue(
        omega.stage2.targetFreqCode === String(s2FreqNum) &&
          omega.stage2.targetPulseMode === s2Pulse &&
          omega.stage2.requiredFilterRelay === s2Relay,
        `${meta.shortTitle} (${count}P): Aşama 2 frekans + darbe modu + filtre rölesi tutarlı`
      );
      assertTrue(
        omega.stage3.totalBudgetMw === 12 &&
          omega.stage3.targetItki +
            omega.stage3.targetKalkan +
            omega.stage3.targetYasam +
            omega.stage3.targetSogutma ===
            12 &&
          omega.stage3.targetChecksum === s3Checksum,
        `${meta.shortTitle} (${count}P): Aşama 3 -> 12 MW 4-baralı bütçe & ağırlıklı sağlama (${s3Checksum}) tutarlı`
      );
      assertTrue(
        s4Proto.token === omega.stage4.targetBreachToken &&
          s4Proto.seq.join(',') === omega.stage4.targetRelaySeq.join(','),
        `${meta.shortTitle} (${count}P): Aşama 4 protokol kitapçığı token ve 3'lü röle sırası tutarlı`
      );
      assertTrue(
        omega.stage5.targetLaunchCode === s5Launch,
        `${meta.shortTitle} (${count}P): Aşama 5 bileşik fırlatma kodu (${s5Launch}) tutarlı`
      );

      // Role isolation verification
      const fKap = filterOmegaStateForRole(omega, 'kaptan');
      const fMuh = filterOmegaStateForRole(omega, 'muhendis');
      const fKrip = filterOmegaStateForRole(omega, 'kriptolog');
      const fGuv = filterOmegaStateForRole(omega, 'guvenlik');

      assertTrue(
        fKap.stage1.targetPin === '????' &&
          fKap.stage1.sectors[0].temp === 0 &&
          fKap.stage1.sectors[0].glyphTag[0] !== '?' &&
          Object.keys(fKap.stage1.glyphCipherTable).length === 0,
        `${meta.shortTitle} (${count}P) Komutan izolasyonu: PIN/tablo/telemetri gizli, glif görünür`
      );
      assertTrue(
        fMuh.stage1.sectors[0].temp !== 0 &&
          fMuh.stage1.sectors[0].glyphTag[0] === '?' &&
          fMuh.stage5.obstructedHatch === omega.stage5.obstructedHatch &&
          fMuh.stage5.hatchPin === omega.stage5.hatchPin &&
          fMuh.stage5.targetFuelPct === 0,
        `${meta.shortTitle} (${count}P) Mühendis izolasyonu: Telemetri + kapak PIN görünür, glif/yakıt gizli`
      );
      assertTrue(
        Object.keys(fKrip.stage1.glyphCipherTable).length === 6 &&
          fKrip.stage3.requiredFirewallLevel === omega.stage3.requiredFirewallLevel &&
          fKrip.stage4.protocolRelayBook[omega.stage4.protocolCode].token === omega.stage4.targetBreachToken &&
          fKrip.stage3.targetItki === 0,
        `${meta.shortTitle} (${count}P) Kriptolog izolasyonu: Şifre tablosu/kitapçık görünür, hedef güç gizli`
      );
      if (count === 3) {
        assertTrue(
          fKap.stage3.threatQuadrant === omega.stage3.threatQuadrant &&
            fKap.stage4.breachedBulkhead === omega.stage4.breachedBulkhead,
          `${meta.shortTitle} (3P) Komutan: Tehdit kadranı ve hasarlı bölme erişimi aktif`
        );
      } else {
        assertTrue(
          fGuv.stage3.threatQuadrant === omega.stage3.threatQuadrant &&
            fGuv.stage4.breachedBulkhead === omega.stage4.breachedBulkhead &&
            fGuv.stage5.targetFuelPct === 0,
          `${meta.shortTitle} (4P) Güvenlik: Tehdit ve bölme görünür, yakıt/güç hedefleri gizli`
        );
      }
    }
  }
}

function testLocalEngineProgression() {
  console.log('\n▶ [BÖLÜM 2] Yerel 5 Aşamalı Oyun Motoru (4 Oyun × 3P/4P, Yetki, Ceza, Sıra Reset & Zafer)');

  for (const theme of TEAM_OPERATION_THEMES) {
    const meta = getTeamOperationMeta(theme);
    for (const count of [3, 4] as const) {
      let state = createInitialMissionState(
        `${count === 3 ? meta.codePrefix3 : meta.codePrefix4}-LOC`,
        'kayip_sinyal',
        'Komutan Ece'
      );
      state.operationTheme = theme;
      state.targetPlayerCount = count;
      state.status = 'phase_game';
      state.currentPhaseIndex = 0;
      state.timeLeftSeconds = 480;
      state.omegaData = generateOmegaData(count, theme);

      const omega0 = state.omegaData;
      const defenseRole: Role = count === 3 ? 'kaptan' : 'guvenlik';

      // Auth guards
      const wrongAuth = applyOmegaAction(
        state,
        'omega_s1_captain_select_sector',
        { sectorId: omega0.stage1.faultySectorId },
        'muhendis'
      );
      assertTrue(Boolean(wrongAuth.error), `${meta.shortTitle} (${count}P): Mühendis Komutan aksiyonunu tetikleyemez`);

      if (count === 4) {
        const capDefAttempt = applyOmegaAction(
          state,
          'omega_s1_defense_lock_shield',
          { polarity: omega0.stage1.targetPolarity, subChannel: omega0.stage1.targetSubChannel, unlock: true },
          'kaptan'
        );
        assertTrue(Boolean(capDefAttempt.error), `${meta.shortTitle} (4P): Güvenlik varken Komutan savunma kilitleyemez`);
      }

      // Wrong sector penalty
      const wrongSector = SECTOR_IDS.find((id) => id !== omega0.stage1.faultySectorId)!;
      const beforeTime = state.timeLeftSeconds;
      const beforeHull = state.hullIntegrity;
      state = applyOmegaAction(state, 'omega_s1_captain_select_sector', { sectorId: wrongSector }, 'kaptan').nextState;
      assertTrue(
        state.timeLeftSeconds === beforeTime - 15 &&
          state.hullIntegrity === beforeHull - 10 &&
          state.omegaData?.teamStats.mistakesCount === 1,
        `${meta.shortTitle} (${count}P): Yanlış sektör cezasında -15s / -%10 ve mistakesCount=1`
      );

      // Stage 1 solve
      state = applyOmegaAction(state, 'omega_s1_captain_select_sector', { sectorId: omega0.stage1.faultySectorId }, 'kaptan').nextState;
      state = applyOmegaAction(state, 'omega_s1_kriptolog_submit_pin', { pin: omega0.stage1.targetPin }, 'kriptolog').nextState;
      state = applyOmegaAction(
        state,
        'omega_s1_muhendis_set_valve',
        { angle: omega0.stage1.targetValveAngle, pumpTier: omega0.stage1.targetPumpTier, purge: true },
        'muhendis'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s1_defense_lock_shield',
        { polarity: omega0.stage1.targetPolarity, subChannel: omega0.stage1.targetSubChannel, unlock: true },
        defenseRole
      ).nextState;
      assertTrue(
        state.omegaData?.activeStage === 2 &&
          state.omegaData?.stage1.solved === true &&
          state.currentPhaseIndex === 1 &&
          state.status === 'phase_game',
        `${meta.shortTitle} (${count}P): Aşama 1 çözüldü -> Aşama 2`
      );

      // Stage 2 solve
      state = applyOmegaAction(state, 'omega_s2_captain_confirm_wave', {}, 'kaptan').nextState;
      state = applyOmegaAction(
        state,
        'omega_s2_muhendis_tune',
        { oscA: omega0.stage2.targetOscA, oscB: omega0.stage2.targetOscB, lock: true },
        'muhendis'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s2_kriptolog_sync',
        { freqCode: omega0.stage2.targetFreqCode, pulseMode: omega0.stage2.targetPulseMode, lock: true },
        'kriptolog'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s2_defense_isolate',
        { source: omega0.stage2.interferenceSource, filterRelay: omega0.stage2.requiredFilterRelay, lock: true },
        defenseRole
      ).nextState;
      assertTrue(
        state.omegaData?.activeStage === 3 &&
          state.omegaData?.stage2.solved === true &&
          state.status === 'phase_energy' &&
          state.currentPhaseIndex === 2,
        `${meta.shortTitle} (${count}P): Aşama 2 çözüldü -> Aşama 3 (phase_energy)`
      );

      // Stage 3 solve
      state = applyOmegaAction(state, 'omega_s3_captain_confirm_orders', {}, 'kaptan').nextState;
      state = applyOmegaAction(
        state,
        'omega_s3_muhendis_allocate',
        {
          itki: omega0.stage3.targetItki,
          kalkan: omega0.stage3.targetKalkan,
          yasam: omega0.stage3.targetYasam,
          sogutma: omega0.stage3.targetSogutma,
          lock: true,
        },
        'muhendis'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s3_kriptolog_unlock',
        { checksum: omega0.stage3.targetChecksum, band: omega0.stage3.carrierBand, lock: true },
        'kriptolog'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s3_defense_lock',
        {
          quadrant: omega0.stage3.threatQuadrant,
          firewallLevel: omega0.stage3.requiredFirewallLevel,
          cipherTag: omega0.stage3.secondaryCipherTag,
          lock: true,
        },
        defenseRole
      ).nextState;
      assertTrue(
        state.omegaData?.activeStage === 4 &&
          state.omegaData?.stage3.solved === true &&
          state.status === 'phase_game' &&
          state.currentPhaseIndex === 3,
        `${meta.shortTitle} (${count}P): Aşama 3 çözüldü -> Aşama 4 (Acil Kriz)`
      );

      // Stage 4 wrong relay sequence resets sequence + applies penalty
      const wrongSeq: ['R1' | 'R2' | 'R3', 'R1' | 'R2' | 'R3', 'R1' | 'R2' | 'R3'] = [
        omega0.stage4.targetRelaySeq[1],
        omega0.stage4.targetRelaySeq[0],
        omega0.stage4.targetRelaySeq[2],
      ];
      state = applyOmegaAction(
        state,
        'omega_s4_muhendis_stabilize',
        { relaySeq: wrongSeq, emergencyPsi: omega0.stage4.targetEmergencyPsi, lock: true },
        'muhendis'
      ).nextState;
      assertTrue(
        state.omegaData?.stage4.muhendisRelaySeq.length === 0 &&
          state.omegaData?.teamStats.mistakesCount === 2,
        `${meta.shortTitle} (${count}P): Aşama 4 yanlış şalter sırası diziyi sıfırlayıp ceza verdi`
      );

      // Stage 4 solve
      state = applyOmegaAction(state, 'omega_s4_captain_authorize', {}, 'kaptan').nextState;
      state = applyOmegaAction(
        state,
        'omega_s4_kriptolog_override',
        { token: omega0.stage4.targetBreachToken, lock: true },
        'kriptolog'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s4_muhendis_stabilize',
        { relaySeq: omega0.stage4.targetRelaySeq, emergencyPsi: omega0.stage4.targetEmergencyPsi, lock: true },
        'muhendis'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s4_defense_contain',
        { bulkhead: omega0.stage4.breachedBulkhead, tokenInput: omega0.stage4.targetBreachToken, lock: true },
        defenseRole
      ).nextState;
      assertTrue(
        state.omegaData?.activeStage === 5 &&
          state.omegaData?.stage4.solved === true &&
          state.status === 'phase_rescue' &&
          state.currentPhaseIndex === 4,
        `${meta.shortTitle} (${count}P): Aşama 4 çözüldü -> Aşama 5 (phase_rescue)`
      );

      // Stage 5 solve
      state = applyOmegaAction(
        state,
        'omega_s5_captain_route',
        { route: omega0.stage5.recommendedRoute, lock: true },
        'kaptan'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s5_muhendis_fuel',
        { fuelPct: omega0.stage5.targetFuelPct, auxPower: omega0.stage5.targetAuxPower, arm: true },
        'muhendis'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s5_kriptolog_beacon',
        { code: omega0.stage5.targetLaunchCode, send: true },
        'kriptolog'
      ).nextState;
      state = applyOmegaAction(
        state,
        'omega_s5_defense_hatch',
        { hatch: omega0.stage5.obstructedHatch, latch: omega0.stage5.targetLatchCode, seal: true },
        defenseRole
      ).nextState;

      assertTrue(
        state.status === 'phase_result' &&
          state.outcomeType === 'tam_basari' &&
          state.completedTasksCount === 5 &&
          state.rescuedCrewCount === (count === 4 ? 16 : 12) &&
          state.finalScore > 0,
        `${meta.shortTitle} (${count}P): 5/5 Aşama tamamlandı -> tam_basari (${state.rescuedCrewCount} personel, Puan: ${state.finalScore})`
      );
    }
  }
}

async function testColyseusRoomForTeamGame(
  actualPort: number,
  playerCount: 3 | 4,
  theme: TeamOperationTheme,
  roomCode: string
) {
  const meta = getTeamOperationMeta(theme);
  console.log(`\n▶ [COLYSEUS ${playerCount}P TESTİ] ${meta.shortTitle} // ${roomCode}`);

  const clients: Client[] = [];
  const rooms: any[] = [];
  const latestStates: Record<string, MissionState | null> = {};
  const expectedRoles = getOmegaRolesForCount(playerCount);

  for (let i = 0; i < playerCount; i++) {
    const c = new Client(`ws://localhost:${actualPort}`);
    clients.push(c);
    const joinOpts =
      i === 0
        ? {
            roomCode,
            playerName: `Oyuncu-${i + 1}`,
            role: 'kaptan',
            operationTheme: theme,
            targetPlayerCount: playerCount,
          }
        : {
            roomCode,
            playerName: `Oyuncu-${i + 1}`,
          };

    const r = await c.joinOrCreate('lost_signal', joinOpts);
    rooms.push(r);
    const key = expectedRoles[i];
    latestStates[key] = null;
    r.onMessage('state_update', (s: MissionState) => {
      latestStates[s.myRole] = s;
    });
  }

  await wait(120);

  const sameRoom = rooms.every((r) => r.roomId === rooms[0].roomId);
  assertTrue(sameRoom, `${roomCode}: Tüm ${playerCount} cihaz aynı odaya bağlandı`);
  assertTrue(
    latestStates.kaptan?.operationTheme === theme && latestStates.kaptan?.timeLeftSeconds === 480,
    `${roomCode}: Oda teması (${theme}) ve 480sn süre doğru`
  );
  assertTrue(
    expectedRoles.every((role) => latestStates[role]?.myRole === role),
    `${roomCode}: Her cihaza benzersiz rol atandı (${expectedRoles.join(', ')})`
  );

  // Extra client must be rejected
  const extraClient = new Client(`ws://localhost:${actualPort}`);
  let extraJoinedSameRoom = false;
  try {
    const extraRoom = await extraClient.joinOrCreate('lost_signal', {
      roomCode,
      playerName: 'Fazla Oyuncu',
    });
    if (extraRoom.roomId === rooms[0].roomId) extraJoinedSameRoom = true;
    await extraRoom.leave();
  } catch {
    extraJoinedSameRoom = false;
  }
  assertTrue(!extraJoinedSameRoom, `${roomCode}: ${playerCount + 1}. oyuncu maxClients=${playerCount} ile reddedildi`);

  // Start flow
  rooms[0].send('start_game');
  await wait(70);
  assertTrue(latestStates.kaptan?.status === 'lobby', `${roomCode}: Herkes hazır olmadan oyun başlamadı`);

  for (const r of rooms) r.send('toggle_ready');
  await wait(90);
  rooms[0].send('start_game');
  await wait(80);
  assertTrue(latestStates.kaptan?.status === 'role_intro', `${roomCode}: role_intro başladı`);

  for (const r of rooms) r.send('confirm_role');
  await wait(100);
  assertTrue(latestStates.kaptan?.status === 'phase_game', `${roomCode}: Tüm roller onaylandı, Aşama 1 başladı`);

  const kapS1 = latestStates.kaptan!;
  const muhS1 = latestStates.muhendis!;
  const kripS1 = latestStates.kriptolog!;
  const defRole: Role = playerCount === 3 ? 'kaptan' : 'guvenlik';
  const defRoom = playerCount === 3 ? rooms[0] : rooms[3];
  const roundId = kapS1.roundId;

  // Network isolation check
  assertTrue(
    kapS1.omegaData?.stage1.targetPin === '????' &&
      muhS1.omegaData?.stage1.sectors[0].glyphTag[0] === '?' &&
      Object.keys(kapS1.omegaData?.stage1.glyphCipherTable || {}).length === 0,
    `${roomCode} Network İzolasyon: Kaptan PIN/tablo görmüyor, Mühendis glif görmüyor`
  );

  // STAGE 1 via filtered per-client state ONLY
  const faultyId = kapS1.omegaData!.stage1.faultySectorId;
  const kapFaultySec = kapS1.omegaData!.stage1.sectors.find((s) => s.id === faultyId)!;
  const s1Answers = computeStage1Answers(
    kapFaultySec.glyphTag,
    faultyId,
    kripS1.omegaData!.stage1.glyphCipherTable,
    kripS1.omegaData!.stage1.cipherRuleType
  );

  rooms[0].send('game_action', {
    actionId: `${roomCode}-S1-KAP`,
    roundId,
    phaseIndex: 0,
    actionType: 'omega_s1_captain_select_sector',
    data: { sectorId: faultyId },
  });
  rooms[2].send('game_action', {
    actionId: `${roomCode}-S1-KRIP`,
    roundId,
    phaseIndex: 0,
    actionType: 'omega_s1_kriptolog_submit_pin',
    data: { pin: s1Answers.pin },
  });
  rooms[1].send('game_action', {
    actionId: `${roomCode}-S1-MUH`,
    roundId,
    phaseIndex: 0,
    actionType: 'omega_s1_muhendis_set_valve',
    data: { angle: s1Answers.valveAngle, pumpTier: s1Answers.pumpTier, purge: true },
  });
  defRoom.send('game_action', {
    actionId: `${roomCode}-S1-DEF`,
    roundId,
    phaseIndex: 0,
    actionType: 'omega_s1_defense_lock_shield',
    data: { polarity: s1Answers.polarity, subChannel: s1Answers.subChannel, unlock: true },
  });

  await wait(130);
  assertTrue(
    latestStates.kaptan?.omegaData?.activeStage === 2 && latestStates.kaptan?.currentPhaseIndex === 1,
    `${roomCode}: Aşama 1 çözüldü -> Aşama 2`
  );

  // STAGE 2 via filtered per-client state ONLY
  const s2Kap = latestStates.kaptan!.omegaData!.stage2;
  const s2Muh = latestStates.muhendis!.omegaData!.stage2;
  const s2Krip = latestStates.kriptolog!.omegaData!.stage2;
  const s2Def = latestStates[defRole]!.omegaData!.stage2;

  const s2FreqNum =
    s2Krip.keyBaseFreqMap[s2Kap.targetBandKey] + s2Muh.measuredNoiseDb + s2Muh.resonanceDrift;
  const s2Pulse = (['P-1', 'P-2', 'P-3'] as const)[s2FreqNum % 3];

  rooms[0].send('game_action', {
    actionId: `${roomCode}-S2-KAP`,
    roundId,
    phaseIndex: 1,
    actionType: 'omega_s2_captain_confirm_wave',
    data: {},
  });
  rooms[1].send('game_action', {
    actionId: `${roomCode}-S2-MUH`,
    roundId,
    phaseIndex: 1,
    actionType: 'omega_s2_muhendis_tune',
    data: { oscA: s2Kap.targetOscA, oscB: s2Kap.targetOscB, lock: true },
  });
  rooms[2].send('game_action', {
    actionId: `${roomCode}-S2-KRIP`,
    roundId,
    phaseIndex: 1,
    actionType: 'omega_s2_kriptolog_sync',
    data: { freqCode: String(s2FreqNum), pulseMode: s2Pulse, lock: true },
  });
  defRoom.send('game_action', {
    actionId: `${roomCode}-S2-DEF`,
    roundId,
    phaseIndex: 1,
    actionType: 'omega_s2_defense_isolate',
    data: { source: s2Def.interferenceSource, filterRelay: s2Krip.requiredFilterRelay, lock: true },
  });

  await wait(130);
  assertTrue(
    latestStates.kaptan?.omegaData?.activeStage === 3 &&
      latestStates.kaptan?.status === 'phase_energy' &&
      latestStates.kaptan?.currentPhaseIndex === 2,
    `${roomCode}: Aşama 2 çözüldü -> Aşama 3 (phase_energy)`
  );

  // STAGE 3 via filtered per-client state ONLY
  const s3Kap = latestStates.kaptan!.omegaData!.stage3;
  const s3Krip = latestStates.kriptolog!.omegaData!.stage3;
  const s3Def = latestStates[defRole]!.omegaData!.stage3;
  const s3Checksum = String(
    ((s3Kap.targetItki * 2 + s3Kap.targetKalkan * 3 + s3Kap.targetYasam * 5 + s3Kap.targetSogutma * 7) *
      s3Krip.checksumMultiplier) %
      900 +
      100
  );

  rooms[0].send('game_action', {
    actionId: `${roomCode}-S3-KAP`,
    roundId,
    phaseIndex: 2,
    actionType: 'omega_s3_captain_confirm_orders',
    data: {},
  });
  rooms[1].send('game_action', {
    actionId: `${roomCode}-S3-MUH`,
    roundId,
    phaseIndex: 2,
    actionType: 'omega_s3_muhendis_allocate',
    data: {
      itki: s3Kap.targetItki,
      kalkan: s3Kap.targetKalkan,
      yasam: s3Kap.targetYasam,
      sogutma: s3Kap.targetSogutma,
      lock: true,
    },
  });
  rooms[2].send('game_action', {
    actionId: `${roomCode}-S3-KRIP`,
    roundId,
    phaseIndex: 2,
    actionType: 'omega_s3_kriptolog_unlock',
    data: { checksum: s3Checksum, band: s3Kap.carrierBand, lock: true },
  });
  defRoom.send('game_action', {
    actionId: `${roomCode}-S3-DEF`,
    roundId,
    phaseIndex: 2,
    actionType: 'omega_s3_defense_lock',
    data: {
      quadrant: s3Def.threatQuadrant,
      firewallLevel: s3Krip.requiredFirewallLevel,
      cipherTag: s3Krip.secondaryCipherTag,
      lock: true,
    },
  });

  await wait(130);
  assertTrue(
    latestStates.kaptan?.omegaData?.activeStage === 4 &&
      latestStates.kaptan?.status === 'phase_game' &&
      latestStates.kaptan?.currentPhaseIndex === 3,
    `${roomCode}: Aşama 3 çözüldü -> Aşama 4 (Acil Kriz)`
  );

  // STAGE 4 via filtered per-client state ONLY
  const s4Kap = latestStates.kaptan!.omegaData!.stage4;
  const s4Krip = latestStates.kriptolog!.omegaData!.stage4;
  const s4Def = latestStates[defRole]!.omegaData!.stage4;
  const protoEntry = s4Krip.protocolRelayBook[s4Kap.protocolCode];

  rooms[0].send('game_action', {
    actionId: `${roomCode}-S4-KAP`,
    roundId,
    phaseIndex: 3,
    actionType: 'omega_s4_captain_authorize',
    data: {},
  });
  rooms[2].send('game_action', {
    actionId: `${roomCode}-S4-KRIP`,
    roundId,
    phaseIndex: 3,
    actionType: 'omega_s4_kriptolog_override',
    data: { token: protoEntry.token, lock: true },
  });
  rooms[1].send('game_action', {
    actionId: `${roomCode}-S4-MUH`,
    roundId,
    phaseIndex: 3,
    actionType: 'omega_s4_muhendis_stabilize',
    data: { relaySeq: protoEntry.seq, emergencyPsi: s4Kap.targetEmergencyPsi, lock: true },
  });
  defRoom.send('game_action', {
    actionId: `${roomCode}-S4-DEF`,
    roundId,
    phaseIndex: 3,
    actionType: 'omega_s4_defense_contain',
    data: { bulkhead: s4Def.breachedBulkhead, tokenInput: protoEntry.token, lock: true },
  });

  await wait(130);
  assertTrue(
    latestStates.kaptan?.omegaData?.activeStage === 5 &&
      latestStates.kaptan?.status === 'phase_rescue' &&
      latestStates.kaptan?.currentPhaseIndex === 4,
    `${roomCode}: Aşama 4 çözüldü -> Aşama 5 (phase_rescue)`
  );

  // STAGE 5 via filtered per-client state ONLY
  const s5Kap = latestStates.kaptan!.omegaData!.stage5;
  const s5Muh = latestStates.muhendis!.omegaData!.stage5;
  const s5Krip = latestStates.kriptolog!.omegaData!.stage5;
  const compoundCode = `${s5Krip.routeLaunchCodes[s5Kap.recommendedRoute]}-${s5Muh.hatchPin}`;

  rooms[0].send('game_action', {
    actionId: `${roomCode}-S5-KAP`,
    roundId,
    phaseIndex: 4,
    actionType: 'omega_s5_captain_route',
    data: { route: s5Kap.recommendedRoute, lock: true },
  });
  rooms[1].send('game_action', {
    actionId: `${roomCode}-S5-MUH`,
    roundId,
    phaseIndex: 4,
    actionType: 'omega_s5_muhendis_fuel',
    data: { fuelPct: s5Kap.targetFuelPct, auxPower: s5Kap.targetAuxPower, arm: true },
  });
  rooms[2].send('game_action', {
    actionId: `${roomCode}-S5-KRIP`,
    roundId,
    phaseIndex: 4,
    actionType: 'omega_s5_kriptolog_beacon',
    data: { code: compoundCode, send: true },
  });
  defRoom.send('game_action', {
    actionId: `${roomCode}-S5-DEF`,
    roundId,
    phaseIndex: 4,
    actionType: 'omega_s5_defense_hatch',
    data: { hatch: s5Muh.obstructedHatch, latch: s5Kap.targetLatchCode, seal: true },
  });

  await wait(140);
  assertTrue(
    latestStates.kaptan?.status === 'phase_result' &&
      latestStates.kaptan?.outcomeType === 'tam_basari' &&
      latestStates.kaptan?.completedTasksCount === 5 &&
      latestStates.kaptan?.rescuedCrewCount === (playerCount === 4 ? 16 : 12) &&
      (latestStates.kaptan?.finalScore || 0) > 0,
    `${roomCode}: 5/5 Aşama tamamlandı, tam_basari (Puan: ${latestStates.kaptan?.finalScore})`
  );

  // Rematch verification
  rooms[0].send('restart_round');
  await wait(120);
  assertTrue(
    latestStates.kaptan?.status === 'lobby' &&
      latestStates.kaptan?.roundId !== roundId &&
      latestStates.kaptan?.timeLeftSeconds === 480 &&
      latestStates.kaptan?.targetPlayerCount === playerCount &&
      expectedRoles.every(
        (role) => Boolean(latestStates.kaptan?.players[role]?.connected) && !latestStates.kaptan?.players[role]?.ready
      ),
    `${roomCode}: restart_round tüm ${playerCount} oyuncuyu koruyup 480sn ile yeni tura sıfırladı`
  );

  for (const r of rooms) {
    await r.leave();
  }
}

async function main() {
  testProceduralAndFiltering();
  testLocalEngineProgression();

  const server = http.createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
  });
  gameServer.define('lost_signal', LostSignalRoom).filterBy(['roomCode']);
  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const actualPort = (server.address() as any).port;
  console.log(`\n📡 Colyseus 4-Oyunlu Test Sunucusu Başlatıldı (Port: ${actualPort})`);

  try {
    await testColyseusRoomForTeamGame(actualPort, 3, 'omega_ekip', 'OMG3-TST1');
    await testColyseusRoomForTeamGame(actualPort, 4, 'titan_maden', 'TTN4-TST2');
    await testColyseusRoomForTeamGame(actualPort, 3, 'siber_kale', 'SBK3-TST3');
    await testColyseusRoomForTeamGame(actualPort, 4, 'buzul_ussu', 'BZL4-TST4');

    // Confirm legacy 2-player rooms remain strictly 2-player
    console.log('\n▶ [REGRESYON KONTROLÜ] Mevcut 2 Kişilik Oyun Kapasitesi Koruması');
    const c1 = new Client(`ws://localhost:${actualPort}`);
    const c2 = new Client(`ws://localhost:${actualPort}`);
    const c3 = new Client(`ws://localhost:${actualPort}`);
    const r1 = await c1.joinOrCreate('lost_signal', {
      roomCode: 'KYP-2REG',
      playerName: 'Kaptan',
      role: 'kaptan',
      operationTheme: 'kayip_sinyal',
    });
    const r2 = await c2.joinOrCreate('lost_signal', {
      roomCode: 'KYP-2REG',
      playerName: 'Mühendis',
    });
    let thirdBlocked = true;
    try {
      const r3 = await c3.joinOrCreate('lost_signal', {
        roomCode: 'KYP-2REG',
        playerName: 'Üçüncü',
      });
      if (r3.roomId === r1.roomId) thirdBlocked = false;
      await r3.leave();
    } catch {
      thirdBlocked = true;
    }
    assertTrue(
      r1.roomId === r2.roomId && thirdBlocked,
      'Mevcut 2 kişilik operasyonlar (KYP-*) hâlâ maksimum 2 oyuncuyla sınırlandırılmış durumda'
    );
    await r1.leave();
    await r2.leave();
  } finally {
    server.close();
  }

  console.log('\n======================================================================');
  console.log(`📊 4 TAKIM OYUNU + 5 AŞAMA TEST SONUCU: ${passedTests}/${totalTests} BAŞARILI`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} TEST BAŞARISIZ OLDU:`, failures);
    process.exit(1);
  }
  console.log('✅ TÜM 3 & 4 OYUNCULU 4 OYUN (5 AŞAMA) VE 2 OYUNCULU REGRESYON TESTLERİ GEÇTİ!');
  console.log('======================================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal Test Exception:', err);
  process.exit(1);
});
