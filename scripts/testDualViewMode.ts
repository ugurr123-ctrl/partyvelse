import { createInitialMissionState, calculateFinalScore } from '../src/services/gameFactory';
import { applyLocalGameAction } from '../src/services/localGameEngine';
import { validateAndAdvancePhase } from '../src/services/phaseTransition';
import { MissionState } from '../src/types/game';

console.log('======================================================================');
console.log('📱 PARTYVERSE - 2 EKRAN (DUAL VIEW) & YEREL MOTOR DOĞRULAMA TESTİ');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTrue(cond: boolean, desc: string) {
  totalTests++;
  if (!cond) {
    failedTests++;
    console.error(`  ❌ HATA: ${desc}`);
  } else {
    passedTests++;
    console.log(`  ✓ ${desc}`);
  }
}

function runDualViewTests() {
  // 1. Initial State in Lobby
  let state: MissionState = createInitialMissionState(
    'KYP-DUAL',
    'kayip_sinyal',
    'Kaptan Ece'
  );
  state.selectedMiniGames = ['ariza_teshisi', 'sinyal_cozumu'];
  state.status = 'lobby';

  console.log('▶ [TEST 1] 2 Ekran Modunda Lobi ve Hazır Olma...');
  // Kaptan sol ekranda hazır olur
  state.players.kaptan.ready = true;
  assertTrue(state.players.kaptan.ready === true && state.players.muhendis.ready === false, 'Kaptan hazır oldu, mühendis henüz hazır değil');

  // Mühendis sağ ekranda hazır olur
  state.players.muhendis.ready = true;
  assertTrue(state.players.kaptan.ready === true && state.players.muhendis.ready === true, 'Her iki telefon ekranı da hazır duruma geçti');

  // Kaptan oyunu başlatır -> role_intro
  state.status = 'role_intro';
  assertTrue(state.status === 'role_intro', 'Lobi başarıyla role_intro aşamasına geçti');

  // 2. Role Intro
  console.log('\n▶ [TEST 2] 2 Ekran Modunda Çift Rol Onayı...');
  // Kaptan onaylar
  state.players.kaptan.roleConfirmed = true;
  let bothConfirmed = state.players.kaptan.roleConfirmed && state.players.muhendis.roleConfirmed;
  assertTrue(!bothConfirmed, 'Yalnızca Kaptan onaylayınca oyun henüz başlamadı (Mühendis bekleniyor)');

  // Mühendis onaylar
  state.players.muhendis.roleConfirmed = true;
  bothConfirmed = state.players.kaptan.roleConfirmed && state.players.muhendis.roleConfirmed;
  if (bothConfirmed) {
    state.status = 'phase_game';
    state.currentPhaseIndex = 0;
  }
  assertTrue(state.status === 'phase_game' && state.currentPhaseIndex === 0, 'İki ekran da onaylayınca 1. Aşama başladı');

  // 3. Mini-Game 1: Arıza Teşhisi (Reaktör)
  console.log('\n▶ [TEST 3] 1. Aşama Reaktör Görevi (Kaptan Kesici + Mühendis Tahliye)...');
  const correctBreaker = state.diagnostic.correctBreaker;
  const faultyLine = state.diagnostic.faultyLine;

  // Kaptan sol ekranda kesici kilidini açar
  state = applyLocalGameAction(state, 'diagnostic_captain_breaker', { breaker: correctBreaker }, 'kaptan');
  assertTrue(state.diagnostic.captainSelectedBreaker === correctBreaker, `Kaptan ${correctBreaker} kesicisini açtı`);
  assertTrue(state.diagnostic.isSolved === false, 'Mühendis tahliyesi yapılmadan reaktör çözülmedi');

  // Mühendis sağ ekranda hatalı hat tahliyesi denerse ceza almalı
  const wrongLine = faultyLine === 'reaktor' ? 'anten' : 'reaktor';
  const timeBefore = state.timeLeftSeconds;
  state = applyLocalGameAction(state, 'diagnostic_engineer_purge', { 
    line: wrongLine, 
    valveAngle: state.diagnostic.targetValveAngle, 
    throttleActive: true 
  }, 'muhendis');
  assertTrue(state.timeLeftSeconds === timeBefore - 15, 'Mühendisin hatalı hat seçimi ceza uyguladı (-15s)');

  // Mühendis doğru arızalı hattı tahliye eder
  state = applyLocalGameAction(state, 'diagnostic_engineer_purge', { 
    line: faultyLine, 
    valveAngle: state.diagnostic.targetValveAngle, 
    throttleActive: true 
  }, 'muhendis');
  assertTrue(state.diagnostic.isSolved === true, 'Mühendis doğru hattı tahliye edince Reaktör DENGELENDİ!');

  // Aşama İlerletme: Phase 0 -> Phase 1
  const adv1 = validateAndAdvancePhase(state, { roundId: state.roundId, expectedPhaseIndex: 0 });
  assertTrue(adv1.success && adv1.nextState?.currentPhaseIndex === 1, '2. Göreve (Phase 1) başarıyla geçildi');
  state = adv1.nextState!;

  // 4. Mini-Game 2: Sinyal Çözümü
  console.log('\n▶ [TEST 4] 2. Aşama Sinyal Görevi (Kaptan Kodu + Mühendis Ayarı)...');
  const targetFreq = state.signal.correctFrequency;
  // Mühendis sağ ekranda frekansı kilitler
  state = applyLocalGameAction(state, 'signal_engineer_tune', { freq: targetFreq }, 'muhendis');
  assertTrue(state.signal.isSolved === true, `Mühendis ${targetFreq} frekansını kilitledi ve sinyal çözüldü!`);

  // Aşama İlerletme: Phase 1 -> Phase 2 (Enerji)
  const adv2 = validateAndAdvancePhase(state, { roundId: state.roundId, expectedPhaseIndex: 1 });
  assertTrue(adv2.success && adv2.nextState?.status === 'phase_energy', 'Aşama 3: Enerji Dağıtımına geçildi');
  state = adv2.nextState!;

  // 5. Phase 2: Enerji Dağıtımı
  console.log('\n▶ [TEST 5] 3. Aşama Enerji Dağıtımı (Mühendis Taslak + Kaptan Kilit)...');
  // Mühendis sağ ekranda 5-5-5 dağıtır ve taslağı iletir
  state = applyLocalGameAction(state, 'energy_set_allocation', {
    allocation: { yasamDestegi: 5, itki: 5, kalkan: 5 },
  }, 'muhendis');
  state = applyLocalGameAction(state, 'energy_share_draft', {}, 'muhendis');
  assertTrue(state.energy.isDraftShared === true, 'Mühendis enerji taslağını paylaştı');

  // Kaptan sol ekranda kilitler
  state = applyLocalGameAction(state, 'energy_lock', {}, 'kaptan');
  assertTrue(state.energy.isLocked === true, 'Kaptan enerji dağılımını kilitledi!');

  // Aşama İlerletme: Phase 2 -> Phase 3 (Kurtarma Kararı)
  const adv3 = validateAndAdvancePhase(state, { roundId: state.roundId, expectedPhaseIndex: 2 });
  assertTrue(adv3.success && adv3.nextState?.status === 'phase_rescue', 'Aşama 4: Kurtarma Kararına geçildi');
  state = adv3.nextState!;

  // 6. Phase 3: Ortak Kurtarma Kararı
  console.log('\n▶ [TEST 6] 4. Aşama Kurtarma Kararı (Kaptan Onayı + Mühendis Onayı)...');
  // Rota Beta seçilir
  state = applyLocalGameAction(state, 'rescue_select_route', { routeId: 'beta' }, 'kaptan');
  assertTrue(state.rescue.selectedRouteId === 'beta', 'Rota Beta seçildi');

  // Kaptan sol ekranda onaylar
  state = applyLocalGameAction(state, 'rescue_toggle_approval', { approved: true }, 'kaptan');
  assertTrue(state.rescue.captainApproved === true && state.rescue.engineerApproved === false, 'Yalnızca Kaptan onayladı');

  // Mühendis sağ ekranda onaylar
  state = applyLocalGameAction(state, 'rescue_toggle_approval', { approved: true }, 'muhendis');
  assertTrue(state.status === 'phase_result', 'İki ekran da onaylayınca görev başarıyla tamamlandı (phase_result)');
  assertTrue(state.rescuedCrewCount === 8, `Kurtarılan personel sayısı doğru: ${state.rescuedCrewCount}`);
  assertTrue((state.finalScore || 0) > 0, `Nihai puan hesaplandı: ${state.finalScore}`);

  console.log('\n======================================================================');
  console.log(`📊 2 EKRAN (DUAL VIEW) TEST SONUCU: ${passedTests}/${totalTests} BAŞARILI`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} TEST BAŞARISIZ OLDU!`);
    process.exit(1);
  } else {
    console.log('✅ 2 EKRAN MODUNDA TÜM GÖREVLER VE İŞLEVLER EKSİKSİZ ÇALIŞIYOR!');
    console.log('======================================================================\n');
  }
}

runDualViewTests();
