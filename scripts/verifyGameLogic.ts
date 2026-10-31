import { 
  createInitialMissionState,
  getRandomMiniGames,
  isLineAnomaly,
  calculateFinalScore,
  RESCUE_ROUTES,
} from '../src/services/gameFactory';
import { 
  validateAndAdvancePhase, 
  validateRescueDecision, 
  isMiniGameCompleted 
} from '../src/services/phaseTransition';
import { EnvironmentType, MiniGameType, MissionState } from '../src/types/game';

console.log('======================================================================');
console.log('🚀 PARTYVERSE / KAYIP SİNYAL - KATI DOĞRULAMA VE UÇTAN UCA TEST MOTORU');
console.log('======================================================================\n');

// ---------------------------------------------------------------------------
// KATI TEST VE DOĞRULAMA ALT YAPISI (Assertion Engine)
// Hata durumunda işlemi kaydeder ve betiği process.exit(1) ile sonlandırır.
// ---------------------------------------------------------------------------
let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failureLog: string[] = [];

function assertTrue(condition: boolean, desc: string) {
  totalAssertions++;
  if (!condition) {
    failedAssertions++;
    failureLog.push(`FAIL: ${desc}`);
    console.error(`  ❌ HATA: ${desc}`);
  } else {
    passedAssertions++;
  }
}

function assertEqual<T>(actual: T, expected: T, desc: string) {
  totalAssertions++;
  if (actual !== expected) {
    failedAssertions++;
    const msg = `FAIL: ${desc} -> Beklenen: ${String(expected)}, Alınan: ${String(actual)}`;
    failureLog.push(msg);
    console.error(`  ❌ HATA: ${msg}`);
  } else {
    passedAssertions++;
  }
}

// ---------------------------------------------------------------------------
// GERÇEK BULMACA ÇÖZÜCÜLERİ (Gerçek Oyuncu Eylemlerini Simüle Eder)
// Uçtan uca senaryolar hazır veri koymak yerine bulmacaları prosedürel çözer.
// ---------------------------------------------------------------------------

function solveDiagnosticGame(state: MissionState) {
  const { diagnostic, activeEnvironment } = state;
  const lineKeys = ['anten', 'reaktor', 'sogutucu', 'yonlendirme'] as const;
  let identifiedFaultyLine = '';
  for (const key of lineKeys) {
    if (isLineAnomaly(activeEnvironment, diagnostic.lines[key])) {
      identifiedFaultyLine = key;
      break;
    }
  }
  assertTrue(identifiedFaultyLine === diagnostic.faultyLine, 'Arıza teşhisi: Telemetriden doğru hat tespit edildi');
  const targetBreaker = diagnostic.lineBreakerMap[diagnostic.faultyLine];
  assertTrue(targetBreaker === diagnostic.correctBreaker, 'Arıza teşhisi: Doğru kesici eşleşmesi sağlandı');

  // Mühendis ve kaptan eylemleri
  diagnostic.captainSelectedBreaker = targetBreaker;
  diagnostic.engineerActionTaken = true;
  diagnostic.isSolved = true;
}

function solveSignalGame(state: MissionState) {
  const { signal } = state;
  const matchingFreqObj = signal.frequencies.find(f => f.code === signal.computedCode);
  assertTrue(!!matchingFreqObj, `Sinyal: ${signal.computedCode} koduna karşılık gelen frekans bulundu`);
  
  // Mühendis frekansı ayarlar ve kilitler
  signal.engineerTunedFreq = matchingFreqObj!.freq;
  signal.isLocked = true;
  signal.isSolved = true;
}

function solveCableGame(state: MissionState) {
  const { cable } = state;
  // Kaptanın şemasındaki kablo kimliğine göre (requiredCableId) portlar bağlanır
  for (const port of cable.ports) {
    const matchingCable = cable.cables.find(c => c.id === port.requiredCableId);
    assertTrue(!!matchingCable, `Kablo: Port ${port.id} için ${port.requiredCableId} kablo bulundu`);
    cable.portAssignments[port.id] = matchingCable!.id;
  }
  cable.isSolved = true;
}

function solveAirlockGame(state: MissionState) {
  const { airlock } = state;
  // Mühendis kadranı, sızdırmazlığı ve vakum gücünü ayarlar
  airlock.engineerDialIndex = airlock.targetDialIndex;
  airlock.engineerSealLocked = airlock.targetSealLocked;
  airlock.engineerVacuumPower = airlock.targetVacuumMin;
  airlock.isSolved = true;
}

function solveRadarGame(state: MissionState) {
  const { radar } = state;
  // Mühendis anteni hedef açıya odaklar
  radar.engineerAzimuth = radar.targetAzimuth;
  radar.engineerElevation = radar.targetElevation;
  radar.isScanned = true;
  radar.isSolved = true;
}

function solveMiniGame(state: MissionState, gameType: MiniGameType) {
  switch (gameType) {
    case 'ariza_teshisi':
      solveDiagnosticGame(state);
      break;
    case 'sinyal_cozumu':
      solveSignalGame(state);
      break;
    case 'kablo_baglantisi':
      solveCableGame(state);
      break;
    case 'hava_kilidi':
      solveAirlockGame(state);
      break;
    case 'radar_yonlendirme':
      solveRadarGame(state);
      break;
  }
}

// ---------------------------------------------------------------------------
// 1. TEST: 1200 Prosedürel Görev Üretimi & Başlangıç Çözülmemişlik Doğrulaması
// ---------------------------------------------------------------------------
console.log('📦 1. Prosedürel Görev Üretimi & Çözülebilirlik Doğrulaması (1200 Görev)');

const environments: EnvironmentType[] = [
  'kayip_sinyal',
  'buzul_istasyonu',
  'meteor_yagmuru',
  'karantina_protokolu',
];

let totalGenerated = 0;

for (const env of environments) {
  for (let i = 0; i < 300; i++) {
    totalGenerated++;
    const state = createInitialMissionState(`ROOM-${env}-${i}`, env, 'Kaptan Ece');

    // Diagnostic Check
    const diag = state.diagnostic;
    let anomalyCount = 0;
    let anomalyLine = '';
    const lineKeys = ['anten', 'reaktor', 'sogutucu', 'yonlendirme'] as const;
    for (const key of lineKeys) {
      if (isLineAnomaly(env, diag.lines[key])) {
        anomalyCount++;
        anomalyLine = key;
      }
    }
    assertTrue(anomalyCount === 1, `Ortam ${env} #${i}: Tam olarak 1 anomalili hat olmalı`);
    assertTrue(anomalyLine === diag.faultyLine, `Ortam ${env} #${i}: Tespit edilen hat faultyLine ile eşleşmeli`);
    assertTrue(diag.lineBreakerMap[diag.faultyLine] === diag.correctBreaker, `Ortam ${env} #${i}: Kesici eşleşmeli`);
    assertTrue(!diag.isSolved, `Ortam ${env} #${i}: Reaktör çözülmemiş başlamalı`);

    // Signal Check
    const sig = state.signal;
    const matchFreq = sig.frequencies.find(f => f.freq === sig.correctFrequency);
    assertTrue(!!matchFreq && matchFreq.code === sig.computedCode, `Sinyal frekans-kod eşleşmeli`);
    assertTrue(sig.engineerTunedFreq !== sig.correctFrequency, `Sinyal başlangıçta doğru frekansta olmamalı`);
    assertTrue(!sig.isSolved && !sig.isLocked, `Sinyal kilitlenmemiş başlamalı`);

    // Cable Check
    const cab = state.cable;
    const allSocketsEmpty = Object.values(cab.portAssignments).every(v => v === null);
    assertTrue(allSocketsEmpty, `Kablo soketleri başlangıçta boş olmalı`);
    assertTrue(!cab.isSolved, `Kablo çözülmemiş başlamalı`);

    // Airlock Check (Must NOT start solved)
    const air = state.airlock;
    const airDifferent = air.engineerDialIndex !== air.targetDialIndex || 
                         air.engineerSealLocked !== air.targetSealLocked || 
                         (air.engineerVacuumPower < air.targetVacuumMin || air.engineerVacuumPower > air.targetVacuumMax);
    assertTrue(airDifferent, `Hava kilidi hedef ayarlarda başlamamalı`);
    assertTrue(!air.isSolved, `Hava kilidi çözülmemiş başlamalı`);

    // Radar Check (Must NOT start solved)
    const rad = state.radar;
    const radDifferent = Math.abs(rad.engineerAzimuth - rad.targetAzimuth) > 5 || 
                         Math.abs(rad.engineerElevation - rad.targetElevation) > 2;
    assertTrue(radDifferent, `Radar hedef koordinatlarda başlamamalı`);
    assertTrue(!rad.isSolved && !rad.isScanned, `Radar çözülmemiş başlamalı`);
  }
}

console.log(`  ✓ 1200 görev üretildi ve test edildi (${passedAssertions} kontrol geçti).`);
console.log('');

// ---------------------------------------------------------------------------
// 2. TEST: Görev Çifti Tekrarı ve Ters Sıra Filtresi (1000 Geçiş)
// ---------------------------------------------------------------------------
console.log('🔄 2. Görev Çifti Tekrarı & Ters Sıra Filtresi (1000 Geçiş)');

let currentPair: [MiniGameType, MiniGameType] = ['kablo_baglantisi', 'radar_yonlendirme'];

for (let i = 0; i < 1000; i++) {
  const nextPair = getRandomMiniGames(currentPair);
  const isDirect = nextPair[0] === currentPair[0] && nextPair[1] === currentPair[1];
  const isReverse = nextPair[0] === currentPair[1] && nextPair[1] === currentPair[0];
  assertTrue(!isDirect && !isReverse, `1000 Geçiş #${i}: Görev çifti doğrudan veya ters sırada tekrarlanamaz`);
  currentPair = nextPair;
}
console.log(`  ✓ 1000 geçişte 0 doğrudan tekrar veya ters sıra ihlali doğrulandı.`);
console.log('');

// ---------------------------------------------------------------------------
// 3. TEST: Aşama Geçişi, [object Object] Koruması & Çapraz Tur Koruması
// ---------------------------------------------------------------------------
console.log('🛡️ 3. Aşama Geçişi Doğrulaması (validateAndAdvancePhase)');
console.log('   • roundId ve expectedPhaseIndex birlikte doğrulanır.');
console.log('   • [object Object] veya click event gönderimi engellenir.');
console.log('   • Önceki turun isteği yeni turda aynı aşamada bile reddedilir.\n');

const testState = createInitialMissionState('KYP-ROOM1', 'kayip_sinyal', 'Kaptan Ece');
testState.selectedMiniGames = ['sinyal_cozumu', 'kablo_baglantisi'];

// 3.1: Henüz çözülmemiş görevden ilerleme isteği
const uncompletedAttempt = validateAndAdvancePhase(testState, {
  roundId: testState.roundId,
  expectedPhaseIndex: 0,
});
assertTrue(uncompletedAttempt.success === false, 'Tamamlanmamış görevden ilerleme reddedilmelidir');

// 3.2: [object Object] (MouseEvent) gönderilirse engellenmesi
const objectInjectionAttempt = validateAndAdvancePhase(testState, {
  roundId: testState.roundId,
  expectedPhaseIndex: { badEvent: true } as any,
});
assertTrue(objectInjectionAttempt.success === false, '[object Object] aşama indeksi reddedilmelidir');

// 3.3: Görevi çöz ve meşru ilerle
solveSignalGame(testState);
const legitimateAdvance1 = validateAndAdvancePhase(testState, {
  roundId: testState.roundId,
  expectedPhaseIndex: 0,
});
assertTrue(legitimateAdvance1.success === true, 'Çözülen görevden ilerleme kabul edilmelidir');
assertEqual(legitimateAdvance1.nextState?.currentPhaseIndex, 1, 'Faz 0 -> Faz 1 olmalıdır');

const stateAtPhase1 = legitimateAdvance1.nextState!;

// 3.4: 20 ms sonra aynı aşama için mükerrer istek (partner basması)
const duplicate20ms = validateAndAdvancePhase(stateAtPhase1, {
  roundId: stateAtPhase1.roundId,
  expectedPhaseIndex: 0,
});
assertTrue(duplicate20ms.success === false, 'Faz 1 iken Faz 0 bekleyen istek reddedilmelidir');

// 3.5: 900 ms sonra aynı istek (debounce sonrası ağ gecikmesi)
const duplicate900ms = validateAndAdvancePhase(stateAtPhase1, {
  roundId: stateAtPhase1.roundId,
  expectedPhaseIndex: 0,
});
assertTrue(duplicate900ms.success === false, '900 ms sonra gelen eski faz isteği reddedilmelidir');

// 3.6: 3 saniye sonra aynı istek
const duplicate3000ms = validateAndAdvancePhase(stateAtPhase1, {
  roundId: stateAtPhase1.roundId,
  expectedPhaseIndex: 0,
});
assertTrue(duplicate3000ms.success === false, '3 sn sonra gelen eski faz isteği reddedilmelidir');

// 3.7: KRİTİK: Önceki turdan kalan bir isteğin yeni tur aynı aşamadayken bile reddedilmesi
const round1 = createInitialMissionState('KYP-SHARED-ROOM', 'kayip_sinyal', 'Kaptan Ece');
const round1Id = round1.roundId;

// Yeni tur başlatıldı (Aynı oda kodu 'KYP-SHARED-ROOM', ancak taze roundId)
const round2 = createInitialMissionState('KYP-SHARED-ROOM', 'kayip_sinyal', 'Kaptan Ece');
const round2Id = round2.roundId;

assertTrue(round1.roomCode === round2.roomCode, 'Oda kodu ekip aynı odadayken korunmalıdır');
assertTrue(round1Id !== round2Id, 'roundId her turda yeniden ve benzersiz üretilmelidir');

// Tur 1'den geciken paket Tur 2'ye (Faz 0) ulaştı:
const crossRoundStaleAttempt = validateAndAdvancePhase(round2, {
  roundId: round1Id,
  expectedPhaseIndex: 0,
});
assertTrue(crossRoundStaleAttempt.success === false, 'Önceki turun isteği yeni turda reddedilmelidir');

// 3.8: Faz 1'deki kablo görevini çöz ve Faz 2'ye geç
solveCableGame(stateAtPhase1);
const legitimateAdvance2 = validateAndAdvancePhase(stateAtPhase1, {
  roundId: stateAtPhase1.roundId,
  expectedPhaseIndex: 1,
});
assertTrue(legitimateAdvance2.success === true, 'Faz 1 çözülünce Faz 2 geçişi kabul edilmelidir');
assertEqual(legitimateAdvance2.nextState?.currentPhaseIndex, 2, 'Faz 1 -> Faz 2 (Enerji) olmalıdır');

const stateAtPhase2 = legitimateAdvance2.nextState!;

// 3.9: Enerji kilitlenmeden Faz 3'e geçmeye çalışma
const uncompletedEnergyAdvance = validateAndAdvancePhase(stateAtPhase2, {
  roundId: stateAtPhase2.roundId,
  expectedPhaseIndex: 2,
});
assertTrue(uncompletedEnergyAdvance.success === false, 'Kilitlenmemiş enerji ile kurtarmaya geçilemez');

// 3.10: Enerjiyi kilitle ve Faz 3'e geç
stateAtPhase2.energy.isLocked = true;
const legitimateAdvance3 = validateAndAdvancePhase(stateAtPhase2, {
  roundId: stateAtPhase2.roundId,
  expectedPhaseIndex: 2,
});
assertTrue(legitimateAdvance3.success === true, 'Kilitlenmiş enerji ile kurtarmaya geçilmelidir');
assertEqual(legitimateAdvance3.nextState?.currentPhaseIndex, 3, 'Faz 2 -> Faz 3 (Kurtarma Kararı) olmalıdır');

console.log('  ✓ Tüm aşama geçişi, [object Object] ve çapraz tur korumaları başarıyla doğrulandı.');
console.log('');

// ---------------------------------------------------------------------------
// 4. TEST: Gövde %0, Süre Bitiş Korumaları & Sıfır Görevle Başarısızlık
// ---------------------------------------------------------------------------
console.log('💥 4. Gövde Bütünlüğü (%0), Süre Tükenişi & Sıfır Görevle Başarısızlık');

const alfaRoute = RESCUE_ROUTES.find(r => r.id === 'alfa')!;

// 4.1: KRİTİK: Sıfır tamamlanan görev (completedTasksCount = 0) ve gövde %0 durumu
// Sıfır geçerli bir değerdir, 3 ile değiştirilmemelidir!
const zeroTasksZeroHullState = createInitialMissionState('KYP-ZERO-TASKS', 'kayip_sinyal', 'Kaptan');
zeroTasksZeroHullState.completedTasksCount = 0; // SIFIR TAMAMLANAN GÖREV
zeroTasksZeroHullState.hullIntegrity = 0; // GÖVDE %0
zeroTasksZeroHullState.timeLeftSeconds = 180;
zeroTasksZeroHullState.energy.isLocked = true;
zeroTasksZeroHullState.energy.engineerAllocation = { yasamDestegi: 4, itki: 6, kalkan: 5 };
zeroTasksZeroHullState.rescue.captainApproved = true;
zeroTasksZeroHullState.rescue.engineerApproved = true;

const zeroTasksRescue = validateRescueDecision(zeroTasksZeroHullState, alfaRoute);
assertTrue(zeroTasksRescue.success === false, 'Sıfır görev ve gövde %0 iken kurtarma başarısız olmalıdır');
assertEqual(zeroTasksRescue.outcomeType, 'basarisizlik', 'Sonuç türü basarisizlik olmalıdır');
assertEqual(zeroTasksRescue.rescuedCrewCount, 0, 'Kurtarılan mürettebat 0 olmalıdır');
assertEqual(zeroTasksRescue.nextState?.completedTasksCount, 0, 'Tamamlanan görev 0 olarak korunmalı, 3 ile değiştirilmemelidir');
assertEqual(zeroTasksRescue.score.total, 0, 'Sıfır görev ve gövde %0 iken nihai skor tam 0 olmalıdır');
assertEqual(zeroTasksRescue.score.breakdown.tasksScore, 0, 'Görev puanı 0 olmalıdır');

// 4.2: Sıfır görevle süre tükenişi (completedTasksCount = 0, timeLeftSeconds = 0, hull = 50)
const zeroTasksTimeoutState = createInitialMissionState('KYP-ZERO-TIMEOUT', 'kayip_sinyal', 'Kaptan');
zeroTasksTimeoutState.completedTasksCount = 0; // SIFIR GÖREV
zeroTasksTimeoutState.timeLeftSeconds = 0; // SÜRE BİTTİ
zeroTasksTimeoutState.hullIntegrity = 50;

const zeroTasksTimeoutScore = calculateFinalScore(zeroTasksTimeoutState.completedTasksCount, 0, 50, 0);
assertEqual(zeroTasksTimeoutScore.total, (0 * 200) + (50 * 3), 'Sıfır görevde süre bitişi skoru sadece gövde puanı (150) olmalıdır');
assertEqual(zeroTasksTimeoutScore.breakdown.tasksScore, 0, 'Görev puanı kesinlikle 0 olmalıdır');

// 4.3: 3 görev tamamlanmışken gövde %0 durumu
const threeTasksZeroHullState = createInitialMissionState('KYP-HULL0-T3', 'kayip_sinyal', 'Kaptan');
threeTasksZeroHullState.completedTasksCount = 3;
threeTasksZeroHullState.hullIntegrity = 0;
threeTasksZeroHullState.timeLeftSeconds = 180;
threeTasksZeroHullState.energy.isLocked = true;
threeTasksZeroHullState.energy.engineerAllocation = { yasamDestegi: 4, itki: 6, kalkan: 5 };
threeTasksZeroHullState.rescue.captainApproved = true;
threeTasksZeroHullState.rescue.engineerApproved = true;

const threeTasksRescue = validateRescueDecision(threeTasksZeroHullState, alfaRoute);
assertTrue(threeTasksRescue.success === false, '3 görevle gövde %0 iken kurtarma başarısız olmalıdır');
assertEqual(threeTasksRescue.score.total, (3 * 200), '3 görevle gövde %0 skoru 600 olmalıdır');
assertEqual(threeTasksRescue.nextState?.completedTasksCount, 3, 'Tamamlanan görev 3 olarak korunmalıdır');

// 4.4: Süre 0 iken kurtarma kararı verilmeye çalışılması
const zeroTimeState = createInitialMissionState('KYP-TIME0', 'kayip_sinyal', 'Kaptan');
zeroTimeState.completedTasksCount = 3;
zeroTimeState.hullIntegrity = 80;
zeroTimeState.timeLeftSeconds = 0; // SÜRE TÜKENMİŞ
zeroTimeState.energy.isLocked = true;
zeroTimeState.energy.engineerAllocation = { yasamDestegi: 4, itki: 6, kalkan: 5 };
zeroTimeState.rescue.captainApproved = true;
zeroTimeState.rescue.engineerApproved = true;

const zeroTimeRescue = validateRescueDecision(zeroTimeState, alfaRoute);
assertTrue(zeroTimeRescue.success === false, 'Süre 0 iken kurtarma başarılı olamaz');
assertEqual(zeroTimeRescue.outcomeType, 'basarisizlik', 'Süre 0 iken sonuç basarisizlik olmalıdır');
assertEqual(zeroTimeRescue.rescuedCrewCount, 0, 'Süre 0 iken 0 kişi kurtarılmalıdır');
assertEqual(zeroTimeRescue.score.total, (3 * 200) + (80 * 3), 'Süre 0 iken skor görev + gövde puanı olmalıdır');

// 4.5: Sayaç süresi bittiğinde skorun formülle hesaplanması (Sabit 120 DEĞİL!)
const timeoutStateTasks2Hull70 = calculateFinalScore(2, 0, 70, 0);
const expectedTimeoutScore = (2 * 200) + (0 * 2) + (70 * 3) + (0 * 50); // 400 + 210 = 610
assertEqual(timeoutStateTasks2Hull70.total, expectedTimeoutScore, 'Sayaç bitişinde skor formülle hesaplanmalıdır');
assertTrue(timeoutStateTasks2Hull70.total !== 120, 'Sayaç bitişinde skor sabit 120 olmamalıdır');

console.log('  ✓ Gövde %0, süre tükenişi ve sıfır görevle başarısızlık kontrolleri başarıyla doğrulandı.');
console.log('');

// ---------------------------------------------------------------------------
// 5. TEST: Uçtan Uca Görev Çözümü & Gerçek Senaryo Simülasyonu
// Hazır veri koymak yerine, oyuncu gibi bulmacaları adım adım çözer.
// ---------------------------------------------------------------------------
console.log('🛸 5. Uçtan Uca Prosedürel Görev Simülasyonu & Rota Dengesi');
console.log('   ⚠️ ENERJİ DAĞILIM SIRASI: Yaşam / İtki / Kalkan (Life Support / Thrust / Shield)');
console.log('   • Alfa Brüt: 4 / 6 / 5 MW (Hat kaybı: -1/-1/-1 MW -> Net: 3 / 5 / 4 MW, 75s seyahat, 10 kişi)');
console.log('   • Beta Brüt: 4 / 4 / 4 MW (Hat kaybı: -1/-1/-1 MW -> Net: 3 / 3 / 3 MW, 50s seyahat, 8 kişi)');
console.log('   • Gama Brüt: 4 / 3 / 3 MW (Hat kaybı: -1/-1/-1 MW -> Net: 3 / 2 / 2 MW, 30s seyahat, 6 kişi)\n');

interface EndToEndScenario {
  name: string;
  env: EnvironmentType;
  games: [MiniGameType, MiniGameType];
  solveTimeSeconds: number; // Bulmacaları çözmek için harcanan süre
  grossAllocation: { yasam: number; itki: number; kalkan: number }; // Sıra: Yaşam / İtki / Kalkan
  chosenRouteId: 'alfa' | 'beta' | 'gama';
  hullIntegrity: number;
  expectedSuccess: boolean;
  expectedRescued: number;
  expectedOutcome: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik';
}

const e2eScenarios: EndToEndScenario[] = [
  {
    name: 'Senaryo 1: Hızlı Ekip (120s harcandı) -> Rota Alfa Tam Tahliye',
    env: 'kayip_sinyal',
    games: ['ariza_teshisi', 'sinyal_cozumu'],
    solveTimeSeconds: 120, // 300 - 120 = 180s kaldı
    grossAllocation: { yasam: 4, itki: 6, kalkan: 5 }, // Net: 3 / 5 / 4 MW (Alfa'yı karşılar)
    chosenRouteId: 'alfa', // 75s seyahat, 10 kişi
    hullIntegrity: 92,
    expectedSuccess: true,
    expectedRescued: 10,
    expectedOutcome: 'tam_basari',
  },
  {
    name: 'Senaryo 2: Standart Ekip (175s harcandı) -> Rota Beta Dengeli Kurtarma',
    env: 'buzul_istasyonu',
    games: ['kablo_baglantisi', 'hava_kilidi'],
    solveTimeSeconds: 175, // 300 - 175 = 125s kaldı
    grossAllocation: { yasam: 4, itki: 4, kalkan: 4 }, // Net: 3 / 3 / 3 MW (Beta'yı karşılar)
    chosenRouteId: 'beta', // 50s seyahat, 8 kişi
    hullIntegrity: 80,
    expectedSuccess: true,
    expectedRescued: 8,
    expectedOutcome: 'kismi_kurtarma',
  },
  {
    name: 'Senaryo 3: Darboğaz Ekip (240s harcandı, sadece 60s var!) -> Rota Gama',
    env: 'meteor_yagmuru',
    games: ['radar_yonlendirme', 'ariza_teshisi'],
    solveTimeSeconds: 240, // 300 - 240 = 60s kaldı (Alfa 75s olduğu için patlar, Gama 30s pod kurtarır)
    grossAllocation: { yasam: 4, itki: 3, kalkan: 3 }, // Net: 3 / 2 / 2 MW (Gama'yı karşılar)
    chosenRouteId: 'gama', // 30s seyahat, 6 kişi
    hullIntegrity: 65,
    expectedSuccess: true,
    expectedRescued: 6,
    expectedOutcome: 'kismi_kurtarma',
  },
  {
    name: 'Senaryo 4: Darboğaz Ekibin Süresi Yetmediği Halde Alfa Seçmesi',
    env: 'karantina_protokolu',
    games: ['sinyal_cozumu', 'kablo_baglantisi'],
    solveTimeSeconds: 240, // 60s kaldı ancak Alfa 75s ister!
    grossAllocation: { yasam: 4, itki: 6, kalkan: 5 }, // Güç tam olsa bile
    chosenRouteId: 'alfa',
    hullIntegrity: 65,
    expectedSuccess: false,
    expectedRescued: 0,
    expectedOutcome: 'basarisizlik',
  },
];

for (const sc of e2eScenarios) {
  // 1. Sıfırdan görev üret
  const mission = createInitialMissionState('KYP-SIM', sc.env, 'Kaptan Ece');
  mission.selectedMiniGames = sc.games;
  mission.timeLeftSeconds = 300 - sc.solveTimeSeconds;
  mission.hullIntegrity = sc.hullIntegrity;

  // 2. Faz 0 bulmacasını prosedürel olarak çöz
  solveMiniGame(mission, sc.games[0]);
  const adv1 = validateAndAdvancePhase(mission, {
    roundId: mission.roundId,
    expectedPhaseIndex: 0,
  });
  assertTrue(adv1.success === true, `${sc.name}: Faz 0 çözüldükten sonra Faz 1'e ilerlemelidir`);
  const mPhase1 = adv1.nextState!;

  // 3. Faz 1 bulmacasını prosedürel olarak çöz
  solveMiniGame(mPhase1, sc.games[1]);
  const adv2 = validateAndAdvancePhase(mPhase1, {
    roundId: mPhase1.roundId,
    expectedPhaseIndex: 1,
  });
  assertTrue(adv2.success === true, `${sc.name}: Faz 1 çözüldükten sonra Faz 2'ye ilerlemelidir`);
  const mPhase2 = adv2.nextState!;

  // 4. Faz 2: Enerji dağılımı yap ve kilitle
  mPhase2.energy.engineerAllocation = {
    yasamDestegi: sc.grossAllocation.yasam,
    itki: sc.grossAllocation.itki,
    kalkan: sc.grossAllocation.kalkan,
  };
  mPhase2.energy.isLocked = true;

  const adv3 = validateAndAdvancePhase(mPhase2, {
    roundId: mPhase2.roundId,
    expectedPhaseIndex: 2,
  });
  assertTrue(adv3.success === true, `${sc.name}: Enerji kilitlendikten sonra Kurtarmaya ilerlemelidir`);
  const mPhase3 = adv3.nextState!;

  // 5. Faz 3: Rota seçimi ve iki oyuncunun onayı
  mPhase3.rescue.selectedRouteId = sc.chosenRouteId;
  mPhase3.rescue.captainApproved = true;
  mPhase3.rescue.engineerApproved = true;

  const targetRoute = RESCUE_ROUTES.find(r => r.id === sc.chosenRouteId)!;
  const rescueRes = validateRescueDecision(mPhase3, targetRoute);

  assertEqual(rescueRes.success, sc.expectedSuccess, `${sc.name}: Kurtarma başarı durumu eşleşmelidir`);
  assertEqual(rescueRes.rescuedCrewCount, sc.expectedRescued, `${sc.name}: Kurtarılan kişi sayısı eşleşmelidir`);
  assertEqual(rescueRes.outcomeType, sc.expectedOutcome, `${sc.name}: Sonuç türü eşleşmelidir`);

  if (rescueRes.success) {
    const expectedRemaining = mission.timeLeftSeconds - targetRoute.travelTimeSeconds;
    assertEqual(rescueRes.remainingTimeAfterTravel, expectedRemaining, `${sc.name}: Seyahat süresi kalan süreden düşülmelidir`);
    const expectedScore = calculateFinalScore(4, expectedRemaining, sc.hullIntegrity, sc.expectedRescued).total;
    assertEqual(rescueRes.score.total, expectedScore, `${sc.name}: Skor tam formülle eşleşmelidir`);
  }

  console.log(`  ✓ [${sc.name}]`);
  console.log(`     Enerji [Yaşam / İtki / Kalkan]: Brüt=${sc.grossAllocation.yasam}/${sc.grossAllocation.itki}/${sc.grossAllocation.kalkan} MW -> Net=${Math.max(0, sc.grossAllocation.yasam - 1)}/${Math.max(0, sc.grossAllocation.itki - 1)}/${Math.max(0, sc.grossAllocation.kalkan - 1)} MW`);
  console.log(`     Sonuç: ${rescueRes.outcomeType.toUpperCase()} | Kurtarılan=${rescueRes.rescuedCrewCount} Kişi | Skor=${rescueRes.score.total}\n`);
}

// ---------------------------------------------------------------------------
// 6. TEST SONUCU RAPORLAMASI & ÇIKIŞ KODU DENETİMİ
// ---------------------------------------------------------------------------
console.log('======================================================================');
console.log(`📊 TEST KOŞUM RAPORU:`);
console.log(`   Toplam Doğrulama Kontrolü: ${totalAssertions}`);
console.log(`   Başarılı Kontroller:       ${passedAssertions}`);
console.log(`   Başarısız Kontroller:      ${failedAssertions}`);
console.log('======================================================================');

if (failedAssertions > 0) {
  console.error(`\n💥 DOĞRULAMA BAŞARISIZ OLDU! (${failedAssertions} hata bulundu):`);
  failureLog.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
  process.exit(1);
} else {
  console.log('\n🏁 TÜM KONTROLLER EKSİKSİZ VE HATASIZ GEÇTİ (ÇIKIŞ KODU: 0)');
  process.exit(0);
}
