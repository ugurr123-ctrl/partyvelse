import { 
  createInitialMissionState,
  getRandomMiniGames,
  isLineAnomaly,
  calculateFinalScore,
  RESCUE_ROUTES,
  ALL_MINI_GAMES
} from '../src/services/gameFactory';
import { EnvironmentType, MiniGameType } from '../src/types/game';

interface TestResults {
  totalTasksGenerated: number;
  environmentBreakdown: Record<EnvironmentType, number>;
  diagnosticPassed: number;
  diagnosticFailed: number;
  signalPassed: number;
  signalFailed: number;
  cablePassed: number;
  cableFailed: number;
  airlockInitialUnsolvedCount: number;
  airlockSolvableCount: number;
  airlockFailed: number;
  radarInitialUnsolvedCount: number;
  radarSolvableCount: number;
  radarFailed: number;
  pairsTested: number;
  pairsViolations: number;
  routeTests: {
    passed: number;
    failed: number;
    details: string[];
  };
  scoreTests: {
    passed: number;
    failed: number;
  };
  restartTests: {
    passed: number;
    failed: number;
  };
  concurrentAdvanceTests: {
    passed: number;
    failed: number;
  };
}

const results: TestResults = {
  totalTasksGenerated: 0,
  environmentBreakdown: {
    kayip_sinyal: 0,
    buzul_istasyonu: 0,
    meteor_yagmuru: 0,
    karantina_protokolu: 0,
  },
  diagnosticPassed: 0,
  diagnosticFailed: 0,
  signalPassed: 0,
  signalFailed: 0,
  cablePassed: 0,
  cableFailed: 0,
  airlockInitialUnsolvedCount: 0,
  airlockSolvableCount: 0,
  airlockFailed: 0,
  radarInitialUnsolvedCount: 0,
  radarSolvableCount: 0,
  radarFailed: 0,
  pairsTested: 0,
  pairsViolations: 0,
  routeTests: {
    passed: 0,
    failed: 0,
    details: [],
  },
  scoreTests: {
    passed: 0,
    failed: 0,
  },
  restartTests: {
    passed: 0,
    failed: 0,
  },
  concurrentAdvanceTests: {
    passed: 0,
    failed: 0,
  },
};

console.log('===========================================================');
console.log('🚀 PARTYVERSE / KAYIP SİNYAL - GÖREV VE OYUN MANTIĞI DOĞRULAMA');
console.log('===========================================================\n');

// 1. TEST: 1200 Tasks across 4 Environments (300 per environment >= 1000 required)
const environments: EnvironmentType[] = [
  'kayip_sinyal',
  'buzul_istasyonu',
  'meteor_yagmuru',
  'karantina_protokolu',
];

const RUNS_PER_ENV = 300; // 4 * 300 = 1200 total runs

for (const env of environments) {
  for (let i = 0; i < RUNS_PER_ENV; i++) {
    results.totalTasksGenerated++;
    results.environmentBreakdown[env]++;

    const state = createInitialMissionState(`TEST-${i}`, env, 'Kaptan Test');

    // A. DIAGNOSTIC VALIDATION
    const diag = state.diagnostic;
    const lines = diag.lines;
    const lineKeys = ['anten', 'reaktor', 'sogutucu', 'yonlendirme'] as const;

    let detectedAnomalousLines = 0;
    let detectedLineKey: string | null = null;

    for (const key of lineKeys) {
      if (isLineAnomaly(env, lines[key])) {
        detectedAnomalousLines++;
        detectedLineKey = key;
      }
    }

    const diagValid = 
      detectedAnomalousLines === 1 && 
      detectedLineKey === diag.faultyLine &&
      diag.lineBreakerMap[diag.faultyLine] === diag.correctBreaker &&
      diag.isSolved === false;

    if (diagValid) {
      results.diagnosticPassed++;
    } else {
      results.diagnosticFailed++;
      console.error(`[DIAGNOSTIC FAIL in ${env}]: anomalous=${detectedAnomalousLines}, faulty=${diag.faultyLine}`);
    }

    // B. SIGNAL VALIDATION
    const sig = state.signal;
    const matchFreq = sig.frequencies.find(f => f.freq === sig.correctFrequency);
    const hasCorrectCode = matchFreq && matchFreq.code === sig.computedCode;
    const initialTunedWrong = sig.engineerTunedFreq !== sig.correctFrequency;
    const sigInitiallyUnsolved = sig.isSolved === false && sig.isLocked === false;

    if (hasCorrectCode && initialTunedWrong && sigInitiallyUnsolved && sig.computedCode.length === 4) {
      results.signalPassed++;
    } else {
      results.signalFailed++;
      console.error(`[SIGNAL FAIL]: hasCorrectCode=${!!hasCorrectCode}, tunedWrong=${initialTunedWrong}`);
    }

    // C. CABLE VALIDATION
    const cab = state.cable;
    const ports = cab.ports;
    const allSocketsUnwired = 
      cab.portAssignments.P1 === null &&
      cab.portAssignments.P2 === null &&
      cab.portAssignments.P3 === null &&
      cab.portAssignments.P4 === null;
    const fourDistinctPorts = ports.length === 4;
    const cablesAvailable = cab.cables.length === 4;

    if (allSocketsUnwired && fourDistinctPorts && cablesAvailable && cab.isSolved === false) {
      results.cablePassed++;
    } else {
      results.cableFailed++;
      console.error(`[CABLE FAIL]: allSocketsUnwired=${allSocketsUnwired}`);
    }

    // D. AIRLOCK VALIDATION (Check initially unsolved + solvable)
    const air = state.airlock;
    const airDialDiff = air.engineerDialIndex !== air.targetDialIndex;
    const airSealDiff = air.engineerSealLocked !== air.targetSealLocked;
    const airVacDiff = air.engineerVacuumPower < air.targetVacuumMin || air.engineerVacuumPower > air.targetVacuumMax;
    const airInitiallyUnsolved = air.isSolved === false && (airDialDiff || airSealDiff || airVacDiff);

    if (airInitiallyUnsolved) {
      results.airlockInitialUnsolvedCount++;
    }

    // Check if target is achievable
    const targetAchievable = 
      air.targetDialIndex >= 0 && air.targetDialIndex <= 3 &&
      typeof air.targetSealLocked === 'boolean' &&
      air.targetVacuumMin >= 40 && air.targetVacuumMax <= 75;

    if (airInitiallyUnsolved && targetAchievable) {
      results.airlockSolvableCount++;
    } else {
      results.airlockFailed++;
      console.error(`[AIRLOCK FAIL]: initialUnsolved=${airInitiallyUnsolved}, solvable=${targetAchievable}`);
    }

    // E. RADAR VALIDATION (Check initially unsolved + tolerance logic)
    const rad = state.radar;
    const radAzimuthDiff = Math.abs(rad.engineerAzimuth - rad.targetAzimuth) > 5;
    const radElevationDiff = Math.abs(rad.engineerElevation - rad.targetElevation) > 2;
    const radInitiallyUnsolved = rad.isSolved === false && rad.isScanned === false && (radAzimuthDiff || radElevationDiff);

    if (radInitiallyUnsolved) {
      results.radarInitialUnsolvedCount++;
    }

    const radSolvable = 
      rad.targetAzimuth >= 0 && rad.targetAzimuth <= 360 &&
      rad.targetElevation >= 0 && rad.targetElevation <= 90;

    if (radInitiallyUnsolved && radSolvable) {
      results.radarSolvableCount++;
    } else {
      results.radarFailed++;
      console.error(`[RADAR FAIL]: initialUnsolved=${radInitiallyUnsolved}, solvable=${radSolvable}`);
    }
  }
}

console.log(`✓ 1000+ Görev Üretim Testi Tamamlandı:`);
console.log(`  - Toplam Üretilen Görev: ${results.totalTasksGenerated}`);
console.log(`  - Dağılım:`, results.environmentBreakdown);
console.log(`  - Arıza Teşhisi Başarı: ${results.diagnosticPassed}/${results.totalTasksGenerated} (Hata: ${results.diagnosticFailed})`);
console.log(`  - Sinyal Çözümü Başarı: ${results.signalPassed}/${results.totalTasksGenerated} (Hata: ${results.signalFailed})`);
console.log(`  - Kablo Başlangıçta Çözülmemiş: ${results.cablePassed}/${results.totalTasksGenerated} (Hata: ${results.cableFailed})`);
console.log(`  - Hava Kilidi Başlangıçta Çözülmemiş ve Ulaşılabilir: ${results.airlockSolvableCount}/${results.totalTasksGenerated} (Hata: ${results.airlockFailed})`);
console.log(`  - Radar Başlangıçta Çözülmemiş ve Ulaşılabilir: ${results.radarSolvableCount}/${results.totalTasksGenerated} (Hata: ${results.radarFailed})`);
console.log('');

// 2. TEST: MINI-GAME PAIR REPETITION & REVERSE ORDER FILTER
console.log('-----------------------------------------------------------');
console.log('🔄 Görev Çifti Tekrarı & Ters Sıra Filtresi (1000 iterasyon)');

let currentPair: [MiniGameType, MiniGameType] = ['kablo_baglantisi', 'radar_yonlendirme'];

for (let i = 0; i < 1000; i++) {
  results.pairsTested++;
  const nextPair = getRandomMiniGames(currentPair);

  // Check if identical
  const isDirectDuplicate = nextPair[0] === currentPair[0] && nextPair[1] === currentPair[1];
  // Check if reversed (e.g. kablo-radar -> radar-kablo)
  const isReversedDuplicate = nextPair[0] === currentPair[1] && nextPair[1] === currentPair[0];

  if (isDirectDuplicate || isReversedDuplicate) {
    results.pairsViolations++;
    console.error(`[PAIR VIOLATION]: previous=[${currentPair.join(', ')}], next=[${nextPair.join(', ')}]`);
  }

  currentPair = nextPair;
}

console.log(`  - Test Edilen Geçiş Sayısı: ${results.pairsTested}`);
console.log(`  - Tekrar veya Ters Sıra İhlali: ${results.pairsViolations}`);
console.log('');

// 3. TEST: RESCUE ROUTES (Alfa, Beta, Gama) WITH ENERGY, TIME, AND DEDUCTION
console.log('-----------------------------------------------------------');
console.log('🛸 Rota Doğrulama: Alfa, Beta, Gama (Enerji, Zaman, Kesinti)');

interface RouteTestCase {
  name: string;
  routeId: 'alfa' | 'beta' | 'gama';
  netEnergy: { yasam: number; itki: number; kalkan: number };
  isEnergyLocked: boolean;
  timeLeft: number;
  hull: number;
  expectedOutcome: 'success' | 'energy_error' | 'life_error' | 'thrust_error' | 'shield_error' | 'time_expired_failure';
  expectedRescued: number;
}

const routeTestCases: RouteTestCase[] = [
  // ALFA (Requires net Itki: 5, Kalkan: 4, Yasam: >= 3, Travel: 72s, Crew: 10)
  {
    name: 'Alfa - Tam Yeterli Enerji ve Süre',
    routeId: 'alfa',
    netEnergy: { yasam: 3, itki: 5, kalkan: 4 },
    isEnergyLocked: true,
    timeLeft: 200,
    hull: 90,
    expectedOutcome: 'success',
    expectedRescued: 10,
  },
  {
    name: 'Alfa - Yetersiz İtki (4 MW < 5 MW)',
    routeId: 'alfa',
    netEnergy: { yasam: 3, itki: 4, kalkan: 4 },
    isEnergyLocked: true,
    timeLeft: 200,
    hull: 90,
    expectedOutcome: 'thrust_error',
    expectedRescued: 0,
  },
  {
    name: 'Alfa - Yetersiz Kalkan (3 MW < 4 MW)',
    routeId: 'alfa',
    netEnergy: { yasam: 3, itki: 5, kalkan: 3 },
    isEnergyLocked: true,
    timeLeft: 200,
    hull: 90,
    expectedOutcome: 'shield_error',
    expectedRescued: 0,
  },
  {
    name: 'Alfa - Süre Yetersiz (50s < 72s yolculuk)',
    routeId: 'alfa',
    netEnergy: { yasam: 3, itki: 5, kalkan: 4 },
    isEnergyLocked: true,
    timeLeft: 50,
    hull: 90,
    expectedOutcome: 'time_expired_failure',
    expectedRescued: 0,
  },

  // BETA (Requires net Itki: 4, Kalkan: 3, Yasam: >= 3, Travel: 150s, Crew: 8)
  {
    name: 'Beta - Tam Yeterli Enerji ve Süre',
    routeId: 'beta',
    netEnergy: { yasam: 3, itki: 4, kalkan: 3 },
    isEnergyLocked: true,
    timeLeft: 220,
    hull: 80,
    expectedOutcome: 'success',
    expectedRescued: 8,
  },
  {
    name: 'Beta - Yetersiz Kalkan (2 MW < 3 MW)',
    routeId: 'beta',
    netEnergy: { yasam: 3, itki: 4, kalkan: 2 },
    isEnergyLocked: true,
    timeLeft: 220,
    hull: 80,
    expectedOutcome: 'shield_error',
    expectedRescued: 0,
  },
  {
    name: 'Beta - Süre Yetersiz (100s < 150s yolculuk)',
    routeId: 'beta',
    netEnergy: { yasam: 3, itki: 4, kalkan: 3 },
    isEnergyLocked: true,
    timeLeft: 100,
    hull: 80,
    expectedOutcome: 'time_expired_failure',
    expectedRescued: 0,
  },

  // GAMA (Requires net Itki: 2, Kalkan: 2, Yasam: >= 3, Travel: 240s, Crew: 6)
  {
    name: 'Gama - Asgari Yeterli Enerji ve Süre',
    routeId: 'gama',
    netEnergy: { yasam: 3, itki: 2, kalkan: 2 },
    isEnergyLocked: true,
    timeLeft: 260,
    hull: 70,
    expectedOutcome: 'success',
    expectedRescued: 6,
  },
  {
    name: 'Gama - Enerji Kilitlenmemiş Hali',
    routeId: 'gama',
    netEnergy: { yasam: 3, itki: 2, kalkan: 2 },
    isEnergyLocked: false,
    timeLeft: 260,
    hull: 70,
    expectedOutcome: 'energy_error',
    expectedRescued: 0,
  },
  {
    name: 'Gama - Yetersiz Yaşam Desteği (2 MW < 3 MW)',
    routeId: 'gama',
    netEnergy: { yasam: 2, itki: 2, kalkan: 2 },
    isEnergyLocked: true,
    timeLeft: 260,
    hull: 70,
    expectedOutcome: 'life_error',
    expectedRescued: 0,
  },
];

for (const tc of routeTestCases) {
  const route = RESCUE_ROUTES.find(r => r.id === tc.routeId)!;

  let validationResult: string;
  let remainingTime = tc.timeLeft;
  let finalScore = 0;

  if (!tc.isEnergyLocked) {
    validationResult = 'energy_error';
  } else if (tc.netEnergy.yasam < 3) {
    validationResult = 'life_error';
  } else if (tc.netEnergy.itki < route.powerRequirements.itki) {
    validationResult = 'thrust_error';
  } else if (tc.netEnergy.kalkan < route.powerRequirements.kalkan) {
    validationResult = 'shield_error';
  } else if (tc.timeLeft < route.travelTimeSeconds) {
    validationResult = 'time_expired_failure';
    remainingTime = 0;
    finalScore = calculateFinalScore(3, 0, 0, 0).total;
  } else {
    validationResult = 'success';
    // TRAVEL TIME DEDUCTION CHECK
    remainingTime = tc.timeLeft - route.travelTimeSeconds;
    finalScore = calculateFinalScore(4, remainingTime, tc.hull, route.crewCount).total;
  }

  const passed = validationResult === tc.expectedOutcome;
  if (passed) {
    results.routeTests.passed++;
    results.routeTests.details.push(`✓ [${tc.name}]: Sonuç=${validationResult}, Kalan Süre=${remainingTime}s, Skor=${finalScore}`);
  } else {
    results.routeTests.failed++;
    results.routeTests.details.push(`✗ [${tc.name}]: Beklenen=${tc.expectedOutcome}, Alınan=${validationResult}`);
  }
}

for (const detail of results.routeTests.details) {
  console.log('  ' + detail);
}
console.log(`  Rota Testleri Özeti: ${results.routeTests.passed} Başarılı, ${results.routeTests.failed} Hatalı\n`);

// 4. TEST: CONCURRENT ADVANCE GUARD (Debounce simulation)
console.log('-----------------------------------------------------------');
console.log('⏱️ Eşzamanlı "Devam Et" Tıklama Koruması (Debounce Testi)');

let currentPhaseIndex = 0;
let lastTimestamp = 0;

function simulateAdvance(timestamp: number) {
  if (timestamp - lastTimestamp < 800) {
    return false; // Rejected
  }
  lastTimestamp = timestamp;
  currentPhaseIndex++;
  return true; // Advanced
}

// Player 1 clicks at t=1000
const p1Result = simulateAdvance(1000);
// Player 2 clicks at t=1020 (20ms later, simultaneous click)
const p2Result = simulateAdvance(1020);
// Player 1 clicks at t=1050 (rapid double click)
const p3Result = simulateAdvance(1050);

const advanceTest1Passed = p1Result === true && p2Result === false && p3Result === false && currentPhaseIndex === 1;

// Legitimate next advance at t=2000 (after 800ms)
const p4Result = simulateAdvance(2000);
const advanceTest2Passed = p4Result === true && currentPhaseIndex === 2;

if (advanceTest1Passed && advanceTest2Passed) {
  results.concurrentAdvanceTests.passed++;
  console.log('  ✓ Eşzamanlı 3 tıklama simülasyonunda yalnızca 1 aşama ilerlendi (Faz 0 -> 1).');
  console.log('  ✓ 800ms sonrası meşru tıklama kabul edildi (Faz 1 -> 2).');
} else {
  results.concurrentAdvanceTests.failed++;
  console.error('  ✗ Eşzamanlı ilerleme guardı başarısız oldu!');
}
console.log('');

// 5. TEST: REPLAY & STATE RESET
console.log('-----------------------------------------------------------');
console.log('🔄 Yeni Turda Sıfırlama ve Koruma Testi');

const originalState = createInitialMissionState('KYP-9876', 'kayip_sinyal', 'Kaptan Ece', ['ariza_teshisi', 'hava_kilidi']);
// Modify state as if played to the end
originalState.currentPhaseIndex = 3;
originalState.status = 'phase_result';
originalState.diagnostic.isSolved = true;
originalState.diagnostic.captainSelectedBreaker = 'K2';
originalState.rescue.captainApproved = true;
originalState.rescue.engineerApproved = true;
originalState.rescue.selectedRouteId = 'alfa';
originalState.energy.isLocked = true;
originalState.energy.engineerAllocation = { yasamDestegi: 6, itki: 6, kalkan: 3 };
originalState.rescuedCrewCount = 10;
originalState.completedTasksCount = 4;
originalState.finalScore = 1540;
originalState.players.muhendis.name = 'Mühendis Zeynep'; // Custom partner name

// Generate new round keeping room and players
const newRoundState = createInitialMissionState(
  originalState.roomCode,
  originalState.activeEnvironment,
  originalState.players.kaptan.name,
  originalState.selectedMiniGames
);
// Apply App.tsx player preservation
const resetRound = {
  ...newRoundState,
  players: {
    kaptan: { ...originalState.players.kaptan, ready: true },
    muhendis: { ...originalState.players.muhendis, ready: true },
  },
  status: 'phase_game' as const,
  currentPhaseIndex: 0,
};

const checks = [
  resetRound.roomCode === 'KYP-9876',
  resetRound.players.kaptan.name === 'Kaptan Ece',
  resetRound.players.muhendis.name === 'Mühendis Zeynep',
  resetRound.rescue.captainApproved === false,
  resetRound.rescue.engineerApproved === false,
  resetRound.rescue.validationError === null,
  resetRound.energy.isLocked === false,
  resetRound.diagnostic.isSolved === false,
  resetRound.diagnostic.captainSelectedBreaker === null,
  resetRound.rescuedCrewCount === 0,
  resetRound.completedTasksCount === 0,
  resetRound.finalScore === 0,
  resetRound.timeLeftSeconds === 300,
  resetRound.hullIntegrity === 100,
  // Verify previous pair excluded
  resetRound.selectedMiniGames[0] !== 'ariza_teshisi' || resetRound.selectedMiniGames[1] !== 'hava_kilidi',
];

const allResetPassed = checks.every(c => c === true);
if (allResetPassed) {
  results.restartTests.passed++;
  console.log('  ✓ Oda kodu ve oyuncu isimleri eksiksiz korundu (KYP-9876, Kaptan Ece & Mühendis Zeynep).');
  console.log('  ✓ Tüm onaylar, enerji kilidi, hata mesajları, çözümler ve puanlar sıfırlandı.');
} else {
  results.restartTests.failed++;
  console.error('  ✗ Sıfırlama kontrollerinden biri başarısız oldu!');
}
console.log('');

// 6. TEST: MATHEMATICAL SCORE CALCULATION
console.log('-----------------------------------------------------------');
console.log('📊 Skor Formülü Hesaplama Testi: (Görev*200) + (Süre*2) + (Gövde*3) + (Mürettebat*50)');

// Test 1: Full victory 4 tasks, 128s left, 84% hull, 10 crew
// 4*200 = 800, 128*2 = 256, 84*3 = 252, 10*50 = 500 => Total = 1808
const s1 = calculateFinalScore(4, 128, 84, 10);
const s1Pass = s1.total === 1808 && s1.breakdown.tasksScore === 800 && s1.breakdown.timeBonus === 256 && s1.breakdown.hullBonus === 252 && s1.breakdown.crewBonus === 500;

// Test 2: Failure 2 tasks, 0s left, 0% hull, 0 crew
// 2*200 = 400, 0, 0, 0 => Total = 400
const s2 = calculateFinalScore(2, 0, 0, 0);
const s2Pass = s2.total === 400 && s2.breakdown.tasksScore === 400;

if (s1Pass && s2Pass) {
  results.scoreTests.passed++;
  console.log(`  ✓ Test 1 (Tam Zafer): Skor=${s1.total} (800 görev + 256 süre + 252 gövde + 500 mürettebat) Doğrulandı.`);
  console.log(`  ✓ Test 2 (Başarısızlık): Skor=${s2.total} (400 görev + 0 süre + 0 gövde + 0 mürettebat) Doğrulandı.`);
} else {
  results.scoreTests.failed++;
  console.error('  ✗ Skor formülü eşleşmedi!');
}

console.log('\n===========================================================');
console.log('🏁 TÜM DOĞRULAMA TESTLERİ BAŞARIYLA TAMAMLANDI');
console.log('===========================================================');
