import { 
  MissionState, 
  MiniGameType, 
  EnvironmentType, 
  ENVIRONMENTS,
  RescueRoute,
  DiagnosticData,
  SignalData,
  CableData,
  AirlockData,
  RadarData,
  EnergyData,
  RescueData,
  AdvancedScenarioData
} from '../types/game';

export const ALL_MINI_GAMES: MiniGameType[] = [
  'ariza_teshisi',
  'sinyal_cozumu',
  'kablo_baglantisi',
  'hava_kilidi',
  'radar_yonlendirme',
];

export function getRandomMiniGames(previousPair?: [MiniGameType, MiniGameType]): [MiniGameType, MiniGameType] {
  let candidate: [MiniGameType, MiniGameType];
  let attempts = 0;
  do {
    const shuffled = [...ALL_MINI_GAMES].sort(() => Math.random() - 0.5);
    candidate = [shuffled[0], shuffled[1]];
    attempts++;
  } while (
    attempts < 50 &&
    previousPair &&
    ((candidate[0] === previousPair[0] && candidate[1] === previousPair[1]) ||
     (candidate[0] === previousPair[1] && candidate[1] === previousPair[0]))
  );
  return candidate;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'KYP-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateRoundId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `RND-${timestamp}-${randomSuffix}`;
}

export const RESCUE_ROUTES: RescueRoute[] = [
  {
    id: 'alfa',
    name: 'Rota Alfa (Tahliye Filosu / Tam Kurtarma)',
    badge: 'TAM TAHLİYE // 10 KİŞİ',
    desc: 'Ağır tahliye filosu; tüm personeli kurtarır. Yüksek itki ve kalkan gerektirir.',
    crewCount: 10,
    travelTimeMin: '1.25 dk',
    travelTimeSeconds: 75,
    powerRequirements: { itki: 5, kalkan: 4, yasamDestegi: 3 },
    dangerRating: 'YÜKSEK ENERJİ TALEBİ',
    dangerDesc: '10 kişiyi kurtarır. Net 5 MW İtki, 4 MW Kalkan ve 75s seyahat süresi gerektirir.',
  },
  {
    id: 'beta',
    name: 'Rota Beta (Lagrange Denge Koridoru)',
    badge: 'DENGELİ // 8 KİŞİ',
    desc: 'Orta kapasiteli mekik; dengeli güç ve 50 saniyelik güvenli koridor.',
    crewCount: 8,
    travelTimeMin: '0.8 dk',
    travelTimeSeconds: 50,
    powerRequirements: { itki: 3, kalkan: 3, yasamDestegi: 3 },
    dangerRating: 'ORTA ENERJİ TALEBİ',
    dangerDesc: '8 kişiyi kurtarır. Net 3 MW İtki, 3 MW Kalkan ve 50s seyahat süresi gerektirir.',
  },
  {
    id: 'gama',
    name: 'Rota Gama (Acil Kaçış Podu / Hızlı Fırlatma)',
    badge: 'DARBOĞAZ // 6 KİŞİ',
    desc: 'Hafif kaçış podu; asgari güçle çalışır ve 30 saniyede süratle istasyondan ayrılır.',
    crewCount: 6,
    travelTimeMin: '0.5 dk',
    travelTimeSeconds: 30,
    powerRequirements: { itki: 2, kalkan: 2, yasamDestegi: 3 },
    dangerRating: 'DÜŞÜK GÜÇ // EN HIZLI',
    dangerDesc: '6 kişiyi kurtarır. Asgari net 2 MW İtki, 2 MW Kalkan ile 30s içinde tahliye tamamlanır.',
  },
];

// Helper to test if a line meets environment anomaly conditions
export function isLineAnomaly(
  env: EnvironmentType,
  telemetry: { temp: number; press: number; noise: number }
): boolean {
  const { temp, press, noise } = telemetry;
  switch (env) {
    case 'kayip_sinyal':
      return temp >= 80 && press <= 40 && noise >= 65;
    case 'buzul_istasyonu':
      return temp <= -10 && press >= 70 && noise >= 60;
    case 'meteor_yagmuru': {
      let count = 0;
      if (temp >= 80) count++;
      if (press <= 40) count++;
      if (noise >= 65) count++;
      return count >= 2;
    }
    case 'karantina_protokolu':
      return temp >= 80 && press <= 40 && noise >= 65;
  }
}

export function generateDiagnostic(env: EnvironmentType): DiagnosticData {
  const lineKeys: Array<'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme'> = [
    'anten',
    'reaktor',
    'sogutucu',
    'yonlendirme',
  ];
  const faultyLine = lineKeys[Math.floor(Math.random() * lineKeys.length)];

  const breakerOptions: Array<'K1' | 'K2' | 'K3' | 'K4'> = ['K1', 'K2', 'K3', 'K4'];
  const shuffledBreakers = [...breakerOptions].sort(() => Math.random() - 0.5);

  const lineBreakerMap: Record<'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme', 'K1' | 'K2' | 'K3' | 'K4'> = {
    reaktor: shuffledBreakers[0],
    sogutucu: shuffledBreakers[1],
    anten: shuffledBreakers[2],
    yonlendirme: shuffledBreakers[3],
  };

  const correctBreaker = lineBreakerMap[faultyLine];
  // Target valve angle varies deterministically by breaker: K1/K3 require 90°, K2/K4 require 135°
  const targetValveAngle = (correctBreaker === 'K1' || correctBreaker === 'K3') ? 90 : 135;

  const lines: DiagnosticData['lines'] = {
    reaktor: { temp: 58, press: 52, noise: 40, code: 'CIR-01', status: 'stabil' },
    sogutucu: { temp: 48, press: 50, noise: 35, code: 'CIR-02', status: 'stabil' },
    anten: { temp: 52, press: 48, noise: 42, code: 'CIR-03', status: 'stabil' },
    yonlendirme: { temp: 60, press: 55, noise: 38, code: 'CIR-04', status: 'stabil' },
  };

  const distractorKeys = lineKeys.filter(k => k !== faultyLine);

  if (env === 'buzul_istasyonu') {
    // Kriter: temp <= -10 && press >= 70 && noise >= 60
    // Distractor 0: Sadece aşırı soğuk (Isı alarmı verir, basınç/parazit normal)
    lines[distractorKeys[0]].temp = -14 - Math.floor(Math.random() * 6);
    lines[distractorKeys[0]].press = 48 + Math.floor(Math.random() * 8);
    lines[distractorKeys[0]].noise = 38 + Math.floor(Math.random() * 8);

    // Distractor 1: Yüksek basınç ve yüksek parazit (2 kriter var, ama ısı normal)
    lines[distractorKeys[1]].temp = 18 + Math.floor(Math.random() * 10);
    lines[distractorKeys[1]].press = 74 + Math.floor(Math.random() * 8);
    lines[distractorKeys[1]].noise = 65 + Math.floor(Math.random() * 6);

    // Distractor 2: Sadece parazit alarmı
    lines[distractorKeys[2]].temp = 22 + Math.floor(Math.random() * 8);
    lines[distractorKeys[2]].press = 52 + Math.floor(Math.random() * 8);
    lines[distractorKeys[2]].noise = 68 + Math.floor(Math.random() * 8);

    // Arızalı Hat: 3 şartı da sağlar
    lines[faultyLine].temp = -16 - Math.floor(Math.random() * 8);
    lines[faultyLine].press = 78 + Math.floor(Math.random() * 8);
    lines[faultyLine].noise = 68 + Math.floor(Math.random() * 8);
    lines[faultyLine].status = 'kritik';
  } else if (env === 'meteor_yagmuru') {
    // Kriter: En az 2 kritik eşik (temp >= 80, press <= 40, noise >= 65)
    // Distractor 0: Sadece yüksek ısı (1 eşik, yetersiz)
    lines[distractorKeys[0]].temp = 84 + Math.floor(Math.random() * 6);
    lines[distractorKeys[0]].press = 55 + Math.floor(Math.random() * 8);
    lines[distractorKeys[0]].noise = 40 + Math.floor(Math.random() * 8);

    // Distractor 1: Sadece düşük basınç (1 eşik, yetersiz)
    lines[distractorKeys[1]].temp = 54 + Math.floor(Math.random() * 8);
    lines[distractorKeys[1]].press = 34 + Math.floor(Math.random() * 5);
    lines[distractorKeys[1]].noise = 45 + Math.floor(Math.random() * 8);

    // Distractor 2: Sadece yüksek parazit (1 eşik, yetersiz)
    lines[distractorKeys[2]].temp = 58 + Math.floor(Math.random() * 8);
    lines[distractorKeys[2]].press = 58 + Math.floor(Math.random() * 6);
    lines[distractorKeys[2]].noise = 70 + Math.floor(Math.random() * 8);

    // Arızalı Hat: Tüm eşikleri (3/3) sağlar
    lines[faultyLine].temp = 88 + Math.floor(Math.random() * 6);
    lines[faultyLine].press = 33 + Math.floor(Math.random() * 6);
    lines[faultyLine].noise = 72 + Math.floor(Math.random() * 8);
    lines[faultyLine].status = 'kritik';
  } else {
    // 'kayip_sinyal' veya 'karantina_protokolu':
    // Kriter: temp >= 80 && press <= 40 && noise >= 65 (Üçü de şart!)
    // Distractor 0: Sadece yüksek ısı (Isı tek başına arızayı göstermez)
    lines[distractorKeys[0]].temp = 83 + Math.floor(Math.random() * 6);
    lines[distractorKeys[0]].press = 56 + Math.floor(Math.random() * 8);
    lines[distractorKeys[0]].noise = 42 + Math.floor(Math.random() * 8);

    // Distractor 1: Düşük basınç VE yüksek parazit (2 kriter var, ısı normal)
    lines[distractorKeys[1]].temp = 55 + Math.floor(Math.random() * 8);
    lines[distractorKeys[1]].press = 34 + Math.floor(Math.random() * 5);
    lines[distractorKeys[1]].noise = 71 + Math.floor(Math.random() * 6);

    // Distractor 2: Sadece yüksek parazit (Parazit tek başına arızayı göstermez)
    lines[distractorKeys[2]].temp = 62 + Math.floor(Math.random() * 8);
    lines[distractorKeys[2]].press = 52 + Math.floor(Math.random() * 8);
    lines[distractorKeys[2]].noise = 69 + Math.floor(Math.random() * 8);

    // Arızalı Hat: Üç kriteri birden sağlar!
    lines[faultyLine].temp = 86 + Math.floor(Math.random() * 8);
    lines[faultyLine].press = 32 + Math.floor(Math.random() * 6);
    lines[faultyLine].noise = 74 + Math.floor(Math.random() * 8);
    lines[faultyLine].status = 'kritik';
  }

  // Double-check mathematical guarantee: EXACTLY ONE line must trigger isLineAnomaly
  let anomalyCount = 0;
  for (const key of lineKeys) {
    if (isLineAnomaly(env, lines[key])) {
      anomalyCount++;
    }
  }
  if (anomalyCount !== 1) {
    throw new Error(`Kritik arıza üretim anomalisi: ${anomalyCount} hat anomali verdi (tam olarak 1 olmalı).`);
  }

  return {
    lines,
    faultyLine,
    lineBreakerMap,
    engineerSuggestedLine: null,
    captainSelectedBreaker: null,
    correctBreaker,
    targetValveAngle,
    targetThrottleActive: true,
    engineerValveAngle: null,
    engineerThrottleActive: false,
    engineerActionTaken: false,
    isSolved: false,
    unlockedBreaker: null,
  };
}

export function generateSignal(): SignalData {
  const glyphPool = ['Δ', 'Ω', 'Σ', 'λ', 'Ψ', 'Φ'];
  const shuffledGlyphs = [...glyphPool].sort(() => Math.random() - 0.5).slice(0, 4);

  const digits = [2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  const symbolMap: Record<string, number> = {};
  shuffledGlyphs.forEach((g, i) => {
    symbolMap[g] = digits[i];
  });

  const ruleTypes: Array<'cift_degis' | 'ters' | 'ilk_sona'> = ['cift_degis', 'ters', 'ilk_sona'];
  const ruleType = ruleTypes[Math.floor(Math.random() * ruleTypes.length)];

  let ruleDescription = '';
  let computedDigits: number[] = [];

  const rawDigits = shuffledGlyphs.map(g => symbolMap[g]);

  if (ruleType === 'cift_degis') {
    ruleDescription = 'Sembol çiftlerini yer değiştirin (1-2 ve 3-4)';
    computedDigits = [rawDigits[1], rawDigits[0], rawDigits[3], rawDigits[2]];
  } else if (ruleType === 'ters') {
    ruleDescription = 'Sembol sırasını tersten okuyun (4-3-2-1)';
    computedDigits = [rawDigits[3], rawDigits[2], rawDigits[1], rawDigits[0]];
  } else {
    ruleDescription = 'İlk sembolü en sona kaydırın (2-3-4-1)';
    computedDigits = [rawDigits[1], rawDigits[2], rawDigits[3], rawDigits[0]];
  }

  const computedCode = computedDigits.join('');

  // 4 Frequencies between 141.0 and 144.5 MHz
  const freqList = ['141.2 MHz', '142.8 MHz', '143.6 MHz', '144.4 MHz'];
  const correctFreqIndex = Math.floor(Math.random() * freqList.length);
  const correctFrequency = freqList[correctFreqIndex];

  const frequencies = freqList.map((freq, idx) => {
    if (idx === correctFreqIndex) {
      return {
        freq,
        code: computedCode,
        label: 'Acil Yardım Taşıyıcı',
      };
    }
    // Generate dummy code
    const fakeCode = String(Math.floor(1000 + Math.random() * 9000));
    return {
      freq,
      code: fakeCode === computedCode ? '9812' : fakeCode,
      label: idx === 0 ? 'Alfa Kanalı' : idx === 2 ? 'Yedek Röle' : 'Gezegen Telsiz',
    };
  });

  return {
    symbols: shuffledGlyphs,
    ruleDescription,
    ruleType,
    symbolMap,
    computedCode,
    correctFrequency,
    frequencies,
    engineerTunedFreq: '140.5 MHz', // Intentionally wrong initial state
    isLocked: false,
    isSolved: false,
  };
}

export function generateCable(): CableData {
  const cables = [
    { id: 'c1', label: 'KIRMIZI // YÜK', color: '#ffb4ab', dotColor: 'bg-error-container', shadow: 'shadow-[0_0_8px_#ffb4ab]', textColor: 'text-error', requiredHz: 120 },
    { id: 'c2', label: 'NEON // KORUMA', color: '#00dbe9', dotColor: 'bg-secondary-fixed-dim', shadow: 'shadow-[0_0_8px_#00dbe9]', textColor: 'text-secondary-fixed', requiredHz: 240 },
    { id: 'c3', label: 'SARI // İYON', color: '#ffb703', dotColor: 'bg-primary-container', shadow: 'shadow-[0_0_8px_#ffb703]', textColor: 'text-primary-container', requiredHz: 360 },
    { id: 'c4', label: 'CYAN // ANA GÜÇ', color: '#00eefc', dotColor: 'bg-secondary-container', shadow: 'shadow-[0_0_8px_#00eefc]', textColor: 'text-secondary-container', requiredHz: 480 },
  ];

  // Random assignment of 4 cables to 4 ports
  const shuffledCableIds = ['c1', 'c2', 'c3', 'c4'].sort(() => Math.random() - 0.5);

  const functionLabels = [
    'Birincil Soğutma Koruması',
    'Yedek İyon Regülatörü',
    'Ana Güç Dağıtım Hattı',
    'Acil Durum Baypas Yükü',
  ];

  const ports = [
    { id: 'P1', label: 'PORT-01', requiredCableId: shuffledCableIds[0], functionLabel: functionLabels[0] },
    { id: 'P2', label: 'PORT-02', requiredCableId: shuffledCableIds[1], functionLabel: functionLabels[1] },
    { id: 'P3', label: 'PORT-03', requiredCableId: shuffledCableIds[2], functionLabel: functionLabels[2] },
    { id: 'P4', label: 'PORT-04', requiredCableId: shuffledCableIds[3], functionLabel: functionLabels[3] },
  ];

  // Intentionally start with EMPTY/UNWIRED sockets so players must solve it
  return {
    cables,
    ports,
    portAssignments: {
      P1: null,
      P2: null,
      P3: null,
      P4: null,
    },
    isTested: false,
    isSolved: false,
  };
}

export function generateAirlock(): AirlockData {
  // Dial levels: 0: %50 DENGEDE, 1: %75 BASINÇLI, 2: %100 TAHLİYE, 3: %25 DÜŞÜK
  const targetDialIndex = Math.floor(Math.random() * 4);
  const dialTexts = ['%50 DENGEDE', '%75 BASINÇLI', '%100 TAHLİYE', '%25 DÜŞÜK'];
  const targetDialText = dialTexts[targetDialIndex];

  const targetSealLocked = Math.random() > 0.4; // true or false

  // Vacuum target range
  const vacuumTargets = [
    { min: 40, max: 50, rangeStr: '2.20 - 2.40 Bar', nominal: 45 },
    { min: 65, max: 75, rangeStr: '2.65 - 2.85 Bar', nominal: 70 },
  ];
  const chosenVac = vacuumTargets[Math.floor(Math.random() * vacuumTargets.length)];

  const rules = [
    `1. Birincil döngü valfi [${targetDialText}] konumuna getirilmelidir.`,
    `2. Sızdırmazlık mandalı [${targetSealLocked ? 'KİLİTLİ (Yukarı)' : 'SERBEST (Aşağı)'}] durumda olmalıdır.`,
    `3. Vakum pompası nominal seviyeye (${chosenVac.nominal} güç / ${chosenVac.rangeStr}) kilitlenmelidir.`,
  ];

  // Initial engineer state MUST be incorrect
  const initialDial = (targetDialIndex + 2) % 4;
  const initialSeal = !targetSealLocked;
  const initialVac = chosenVac.nominal > 50 ? 20 : 85;

  return {
    rules,
    targetDialIndex,
    targetDialText,
    targetSealLocked,
    targetVacuumMin: chosenVac.min,
    targetVacuumMax: chosenVac.max,
    targetPressureRange: chosenVac.rangeStr,
    engineerDialIndex: initialDial,
    engineerSealLocked: initialSeal,
    engineerVacuumPower: initialVac,
    isSolved: false,
  };
}

export function generateRadar(): RadarData {
  const azimuthTargets = [45, 90, 135, 180, 225, 275, 315];
  const elevationTargets = [25, 35, 42, 50, 60];

  const targetAzimuth = azimuthTargets[Math.floor(Math.random() * azimuthTargets.length)];
  const targetElevation = elevationTargets[Math.floor(Math.random() * elevationTargets.length)];

  const beaconLabel = `SEC-0${Math.floor(1 + Math.random() * 9)} // ${targetAzimuth}°`;

  // Start at incorrect angle
  const initialAzimuth = (targetAzimuth + 90) % 360;
  const initialElevation = 15;

  return {
    targetAzimuth,
    targetElevation,
    beaconLabel,
    engineerAzimuth: initialAzimuth,
    engineerElevation: initialElevation,
    isScanned: false,
    isSolved: false,
  };
}

export function generateEnergy(): EnergyData {
  return {
    totalBudget: 15, // 15 MW total budget
    engineerAllocation: {
      yasamDestegi: 4,
      itki: 3,
      kalkan: 3,
    },
    lineLosses: {
      yasamDestegi: 1, // Net = 4 - 1 = 3 MW (Meets min 3 MW)
      itki: 1,         // Net = 3 - 1 = 2 MW (Meets min 2 MW)
      kalkan: 1,       // Net = 3 - 1 = 2 MW (Meets min 2 MW)
    },
    captainMinRequirements: {
      yasamDestegi: 3,
      itki: 2,
      kalkan: 2,
    },
    isDraftShared: false,
    isLocked: false,
  };
}

export function generateRescue(): RescueData {
  return {
    selectedRouteId: 'beta',
    captainApproved: false,
    engineerApproved: false,
    routes: RESCUE_ROUTES,
    validationError: null,
  };
}

export function calculateFinalScore(
  completedTasks: number,
  timeLeftSeconds: number,
  hullIntegrity: number,
  rescuedCrew: number
) {
  const tasksScore = completedTasks * 200;
  const timeBonus = Math.max(0, timeLeftSeconds * 2);
  const hullBonus = Math.max(0, Math.round(hullIntegrity * 3));
  const crewBonus = rescuedCrew * 50;
  const total = tasksScore + timeBonus + hullBonus + crewBonus;
  return {
    total,
    breakdown: {
      tasksScore,
      timeBonus,
      hullBonus,
      crewBonus,
    },
  };
}

export function generateAdvancedScenario(): AdvancedScenarioData {
  return {
    subsystems: {
      reaktor: {
        isStabilized: false,
        coolantPumpsPower: 4,
        isPurged: false,
        breakerActivated: false,
        liveTelemetry: {
          coreTemp: 84,
          coolantPressure: 38,
          lineNoise: 76,
          criticalLine: 'anten',
        },
        targetBreaker: 'K2',
      },
      sinyal: {
        isLocked: false,
        antennaPower: 2,
        noiseLevel: 85,
        targetFrequency: '143.6 MHz',
        currentFrequency: '140.0 MHz',
        symbols: ['Δ', 'Ω', 'Σ', 'λ'],
        symbolValueSum: 3.6,
      },
      hava_kilidi: {
        isSealed: false,
        compressorPower: 1,
        currentDialIndex: 0,
        currentVacuum: 50,
        targetDialIndex: 2,
        targetVacuumMin: 70,
        targetVacuumMax: 85,
        externalPressureKpa: 36,
      },
    },
    powerGrid: {
      totalBudget: 7,
      coolingPumps: 4,
      antennaBooster: 2,
      airlockCompressor: 1,
      shieldReserve: 0,
    },
    event: {
      id: 'plasma_surge',
      name: 'Yaklaşan Plazma Fırtınası Dalgası',
      desc: 'İstasyon gövdesine doğru ilerleyen yüksek yoğunluklu plazma cephesi tespit edildi.',
      warningTriggerTime: 210,
      strikeTime: 175,
      isActive: false,
      isResolved: false,
    },
    activeSubsystemTab: 'reaktor',
    evacuationUnlocked: false,
    evacuationLog: [
      'OPERASYON ÇÖKÜŞ EŞİĞİ BAŞLATILDI.',
      'Yardımcı Güç Matrisi: 7 MW sınırlı rezerv (Aynı anda tüm sistemler beslenemez).',
      'Öncelik seçimi zorunlu: Sistemler dengelendikçe güç diğer hatlara aktarılmalıdır.',
    ],
  };
}

export function createInitialMissionState(
  roomCode: string = generateRoomCode(),
  env: EnvironmentType = 'kayip_sinyal',
  playerName: string = 'Kaptan Ece',
  previousPair?: [MiniGameType, MiniGameType]
): MissionState {
  const selectedGames = getRandomMiniGames(previousPair);

  return {
    roomCode,
    roundId: generateRoundId(),
    status: 'entry',
    gameMode: 'standart',
    activeEnvironment: env,
    selectedMiniGames: selectedGames,
    previousMiniGames: previousPair,
    currentPhaseIndex: 0,
    timeLeftSeconds: 300, // 5 minutes
    hullIntegrity: 100,
    players: {
      kaptan: {
        id: 'player_kaptan',
        name: playerName || 'Kaptan Ece',
        role: 'kaptan',
        ready: false,
      },
      muhendis: {
        id: 'player_muhendis',
        name: 'Mühendis Can',
        role: 'muhendis',
        ready: false,
      },
    },
    myRole: 'kaptan',
    isPaused: false,
    isDisconnected: false,
    feedbackState: 'idle',
    feedbackMessage: '',

    diagnostic: generateDiagnostic(env),
    signal: generateSignal(),
    cable: generateCable(),
    airlock: generateAirlock(),
    radar: generateRadar(),
    energy: generateEnergy(),
    rescue: generateRescue(),
    advancedScenario: generateAdvancedScenario(),

    rescuedCrewCount: 0,
    completedTasksCount: 0,
    finalScore: 0,
    outcomeType: 'tam_basari',
  };
}
