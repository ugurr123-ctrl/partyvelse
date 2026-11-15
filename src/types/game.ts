/**
 * PARTYVERSE — Kayıp Sinyal (Lost Signal)
 * Game Types, State Definitions & Constants
 */

export type Role = 'kaptan' | 'muhendis' | 'kriptolog' | 'guvenlik';

export type TeamOperationTheme = 'omega_ekip' | 'titan_maden' | 'siber_kale' | 'buzul_ussu';

export type OperationTheme =
  | 'kayip_sinyal'
  | 'derin_basinc'
  | 'golge_protokolu'
  | 'karantina_2088'
  | TeamOperationTheme;

export interface KarantinaData {
  // Phase 1: Hücresel Analiz & UV İzolasyonu
  spectralFilterNm: number;
  selectedBase: string;
  bioPhase1Transmitted: boolean;
  selectedUvSector: number;
  selectedValve: 'A' | 'B' | 'C';
  phase1Solved: boolean;

  // Phase 2: Sentetik Panzehir Sentezi & Santrifüj
  polymerPct: number;
  enzymePct: number;
  neutroPct: number;
  bondFreqGhz: number;
  bioPhase2Injected: boolean;
  centrifugeRpm: number;
  coolingValvePct: number;
  pressureReliefActive: boolean;
  phase2Solved: boolean;

  // Phase 3: Dekontaminasyon Protokolü & Pnömatik Tahliye
  vacuumFlowRate: number;
  bioPhase3Started: boolean;
  selectedChimney: 'BACA-01' | 'BACA-02' | 'BACA-03';
  chimneyBar: number;
  safetyLatchUnlocked: boolean;
  phase3Solved: boolean;

  // Stats & Scoring
  immunityScore: number;
  selinAccuracy: number;
  baranValves: number;
}

export type MiniGameType = 
  | 'ariza_teshisi' 
  | 'sinyal_cozumu' 
  | 'kablo_baglantisi' 
  | 'hava_kilidi' 
  | 'radar_yonlendirme';

export type EnvironmentType = 
  | 'kayip_sinyal' 
  | 'buzul_istasyonu' 
  | 'meteor_yagmuru' 
  | 'karantina_protokolu';

export interface EnvironmentInfo {
  id: EnvironmentType;
  name: string;
  badge: string;
  desc: string;
  accentColor: string;
  tempOffset: number;
  conditionNote: string;
}

export const ENVIRONMENTS: Record<EnvironmentType, EnvironmentInfo> = {
  kayip_sinyal: {
    id: 'kayip_sinyal',
    name: 'Kayıp Sinyal Standart',
    badge: 'SUB-SEKTÖR 04',
    desc: 'Bozulan ana istasyon reaktörü ve derin uzay parazitleri.',
    accentColor: '#00f0ff',
    tempOffset: 0,
    conditionNote: 'Tüm 3 kritik eşik sağlanmalı (Isı ≥80°C, Basınç ≤40kPa, Parazit ≥65dB).',
  },
  buzul_istasyonu: {
    id: 'buzul_istasyonu',
    name: 'Buzul İstasyonu',
    badge: 'KUTUP SEKTÖRÜ',
    desc: 'Aşırı soğuma ve dondurucu sıvı nitrojen basınç terslenmesi.',
    accentColor: '#38bdf8',
    tempOffset: -40,
    conditionNote: 'Tersine kutup eşikleri: Isı ≤-10°C VE Basınç ≥70kPa VE Parazit ≥60dB birlikte aranır.',
  },
  meteor_yagmuru: {
    id: 'meteor_yagmuru',
    name: 'Meteor Yağmuru',
    badge: 'KİNETİK ALARM',
    desc: 'Gövde delinmeleri, ani basınç düşüşleri ve elektrik sıçramaları.',
    accentColor: '#f59e0b',
    tempOffset: 15,
    conditionNote: 'Kinetik delinme protokolü: En az 2 kritik koşulun (Isı ≥80°C, Basınç ≤40kPa, Parazit ≥65dB) sağlanması gerekir.',
  },
  karantina_protokolu: {
    id: 'karantina_protokolu',
    name: 'Karantina Protokolü',
    badge: 'BİYOLOJİK KİLİT',
    desc: 'Hava sirkülasyonu kilitli; aşırı ısınma ve sızıntı kontrolü.',
    accentColor: '#a855f7',
    tempOffset: 5,
    conditionNote: 'Biyolojik kilit protokolü: Isı ≥80°C VE Basınç ≤40kPa VE Parazit ≥65dB birlikte aranır.',
  },
};

export interface PlayerInfo {
  id: string;
  name: string;
  role: Role;
  ready: boolean;
  roleConfirmed?: boolean;
  connected?: boolean;
}

export type GameStatus = 
  | 'opening'
  | 'entry'
  | 'lobby'
  | 'role_intro'
  | 'phase_game'      // Mini-game 1 or 2
  | 'phase_energy'    // Phase 3: Energy allocation
  | 'phase_rescue'    // Phase 4A: Rescue choice
  | 'phase_result';   // Phase 4B: Final result

export type FeedbackState = 'idle' | 'incomplete' | 'waiting_partner' | 'error' | 'success' | 'disconnected';

// State data for Arıza Teşhisi (Diagnostic)
export interface DiagnosticData {
  lines: {
    reaktor: { temp: number; press: number; noise: number; code: string; status?: 'stabil' | 'kritik' };
    sogutucu: { temp: number; press: number; noise: number; code: string; status?: 'stabil' | 'kritik' };
    anten: { temp: number; press: number; noise: number; code: string; status?: 'stabil' | 'kritik' };
    yonlendirme: { temp: number; press: number; noise: number; code: string; status?: 'stabil' | 'kritik' };
  };
  faultyLine: 'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme';
  lineBreakerMap: Record<'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme', 'K1' | 'K2' | 'K3' | 'K4'>;
  engineerSuggestedLine: 'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme' | null;
  captainSelectedBreaker: 'K1' | 'K2' | 'K3' | 'K4' | null;
  correctBreaker: 'K1' | 'K2' | 'K3' | 'K4';
  targetValveAngle: number; // e.g. 135
  targetThrottleActive: boolean; // true
  engineerValveAngle: number | null;
  engineerThrottleActive: boolean;
  engineerActionTaken: boolean;
  isSolved: boolean;
  unlockedBreaker?: 'K1' | 'K2' | 'K3' | 'K4' | null;
}

// State data for Sinyal Çözümü
export interface SignalData {
  symbols: string[]; // e.g. ['Δ', 'Ω', 'Σ', 'λ']
  ruleDescription: string;
  ruleType: 'duz' | 'ters' | 'ilk_sona' | 'cift_degis';
  symbolMap: Record<string, number>;
  computedCode: string; // e.g. "7492"
  correctFrequency: string; // e.g. "142.8 MHz"
  frequencies: Array<{ freq: string; code: string; label: string }>;
  engineerTunedFreq: string;
  frequencyMatched?: boolean;
  isLocked: boolean;
  isSolved: boolean;
}

// State data for Kablo Bağlantısı
export interface CableData {
  cables: Array<{
    id: string;
    label: string;
    color: string;
    dotColor: string;
    shadow: string;
    textColor: string;
    requiredHz?: number;
  }>;
  ports: Array<{
    id: string;
    label: string;
    requiredCableId: string;
    functionLabel: string;
  }>;
  portAssignments: Record<string, string | null>; // portId -> cableId
  isTested: boolean;
  isSolved: boolean;
}

// State data for Hava Kilidi
export interface AirlockData {
  rules: string[];
  targetDialIndex: number; // 0: %50 Dengede, 1: %75 Basınçlı, 2: %100 Tahliye, 3: %25 Düşük
  targetDialText: string;
  targetSealLocked: boolean;
  targetVacuumMin: number;
  targetVacuumMax: number;
  targetPressureRange: string;
  
  engineerDialIndex: number;
  engineerSealLocked: boolean;
  engineerVacuumPower: number;
  isSolved: boolean;
}

// State data for Radar Yönlendirme
export interface RadarData {
  targetAzimuth: number; // e.g. 275
  targetElevation: number; // e.g. 42
  beaconLabel: string; // e.g. "SEC-07 // 275°"
  
  engineerAzimuth: number;
  engineerElevation: number;
  isScanned: boolean;
  isSolved: boolean;
}

// State data for Enerji Dağıtımı
export interface EnergyData {
  totalBudget: number; // 15 MW
  engineerAllocation: {
    yasamDestegi: number;
    itki: number;
    kalkan: number;
  };
  lineLosses: {
    yasamDestegi: number; // 1 MW
    itki: number;         // 1 MW
    kalkan: number;       // 1 MW
  };
  captainMinRequirements: {
    yasamDestegi: number; // 3 MW (Net)
    itki: number;         // 2 MW (Net)
    kalkan: number;       // 2 MW (Net)
  };
  isDraftShared: boolean;
  isLocked: boolean;
}

// State data for Kurtarma Rotası & Sonuç
export interface RescueRoute {
  id: 'alfa' | 'beta' | 'gama';
  name: string;
  badge: string;
  desc: string;
  crewCount: number; // 10, 8, or 6
  travelTimeMin: string;
  travelTimeSeconds: number;
  powerRequirements: { itki: number; kalkan: number; yasamDestegi: number };
  dangerRating: string;
  dangerDesc: string;
}

export interface RescueData {
  selectedRouteId: 'alfa' | 'beta' | 'gama';
  captainApproved: boolean;
  engineerApproved: boolean;
  routes: RescueRoute[];
  validationError: string | null;
}

export type GameMode = 'standart' | 'gelismis';

export type AdvancedSubsystemId = 'reaktor' | 'sinyal' | 'hava_kilidi' | 'kablo' | 'radar' | 'guc_matrisi' | 'tahliye';

export interface AdvancedEventData {
  id: 'plasma_surge';
  name: string;
  desc: string;
  warningTriggerTime: number; // e.g. at 210s left
  strikeTime: number; // e.g. at 170s left
  isActive: boolean;
  isResolved: boolean;
  chosenReaction?: 'kalkan' | 'tahliye' | 'ihmal';
  narrativeResult?: string;
}

export interface AdvancedPowerGrid {
  totalBudget: number; // 10 MW
  coolingPumps: number; // e.g. 4 MW needed for reactor stability
  antennaBooster: number; // e.g. 3 MW needed for clean signal
  airlockCompressor: number; // e.g. 3 MW needed for airlock seal
  shieldReserve: number; // Diverted power for deflector shield
}

export interface AdvancedScenarioData {
  subsystems: {
    reaktor: {
      isStabilized: boolean;
      coolantPumpsPower: number; // MW
      isPurged: boolean;
      breakerActivated: boolean;
      targetValveAngle?: number;
      targetThrottleActive?: boolean;
      engineerSuggestedLine?: 'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme' | null;
      engineerValveAngle?: number | null;
      engineerThrottleActive?: boolean;
      faultyLine?: 'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme';
      lineBreakerMap?: Record<'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme', 'K1' | 'K2' | 'K3' | 'K4'>;
      lines?: DiagnosticData['lines'];
      liveTelemetry: {
        coreTemp: number; // e.g. 88°C
        coolantPressure: number; // e.g. 39 kPa
        lineNoise: number; // e.g. 78 dB
        criticalLine: 'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme';
      };
      targetBreaker: 'K1' | 'K2' | 'K3' | 'K4';
      unlockedBreaker?: 'K1' | 'K2' | 'K3' | 'K4' | null;
      captainSelectedBreaker?: 'K1' | 'K2' | 'K3' | 'K4' | null;
    };
    sinyal: {
      isLocked: boolean;
      antennaPower: number; // MW
      noiseLevel: number; // %
      targetFrequency: string; // e.g. "143.60 MHz"
      currentFrequency?: string;
      engineerSelectedFrequency?: string | null;
      incomingSymbols?: string[];
      symbolMap?: Record<string, number>;
      ruleType?: 'ters' | 'cift_degis' | 'saga_kaydir';
      ruleDescription?: string;
      computedCode?: string;
      frequencies?: Array<{
        freq: string;
        code: string;
        label?: string;
      }>;
      symbols?: string[];
      symbolValueSum?: number;
    };
    hava_kilidi: {
      isSealed: boolean;
      compressorPower: number; // MW
      currentDialIndex: number;
      currentVacuum: number;
      targetDialIndex: number;
      targetVacuumMin: number;
      targetVacuumMax: number;
      externalPressureKpa: number;
    };
    kablo?: {
      isRepaired: boolean;
      cables: CableData['cables'];
      ports: CableData['ports'];
      portAssignments: Record<string, string | null>;
    };
    radar?: {
      isAligned: boolean;
      targetAzimuth: number;
      targetElevation: number;
      currentAzimuth: number;
      currentElevation: number;
    };
  };
  powerGrid: AdvancedPowerGrid;
  event: AdvancedEventData;
  activeSubsystemTab: AdvancedSubsystemId;
  evacuationUnlocked: boolean;
  evacuationLog: string[];
}

export interface OmegaSectorTelemetry {
  id: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  label: string;
  temp: number;
  pressure: number;
  rad: number;
  vibration: number;
  glyphTag: [string, string, string, string];
}

export interface OmegaTeamData {
  themeId: TeamOperationTheme;
  playerCount: 3 | 4;
  activeStage: 1 | 2 | 3 | 4 | 5;

  // Stage 1: 5-Sektör Anomali Teşhisi & Offsetli 4-Glif Şifreleme + Çift Alt Kanal Kilidi
  stage1: {
    sectors: OmegaSectorTelemetry[];
    faultySectorId: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
    ruleDescription: string;
    glyphCipherTable: Record<string, number>;
    cipherRuleType: 'swap_first_two' | 'reverse_last_two' | 'shift_plus_one';
    cipherRuleDescription: string;
    targetPin: string; // 4-digit transformed PIN
    targetValveAngle: 45 | 90 | 135 | 180;
    targetPumpTier: 1 | 2 | 3 | 4 | 5;
    targetPolarity: 'ALFA' | 'BETA' | 'GAMA';
    targetSubChannel: 'X1' | 'X2' | 'X3';

    captainSelectedSector: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | null;
    kriptologSubmittedPin: string;
    muhendisValveAngle: 45 | 90 | 135 | 180;
    muhendisPumpTier: 1 | 2 | 3 | 4 | 5;
    muhendisPurgeReady: boolean;
    shieldPolarity: 'ALFA' | 'BETA' | 'GAMA' | null;
    shieldSubChannel: 'X1' | 'X2' | 'X3' | null;
    shieldSafetyUnlocked: boolean;
    solved: boolean;
  };

  // Stage 2: Harmonik Frekans Kalibrasyonu & Çapraz Parazit İzolasyonu
  stage2: {
    targetBandMode: 'DAR' | 'GENIS' | 'DARBE';
    targetBandKey: 'K1' | 'K2' | 'K3';
    bandKeyMap: Record<'DAR' | 'GENIS' | 'DARBE', 'K1' | 'K2' | 'K3'>;
    targetOscA: number; // 2..9
    targetOscB: number; // 1..8
    measuredNoiseDb: 18 | 24 | 30 | 36;
    resonanceDrift: 2 | 4 | 6;
    keyBaseFreqMap: Record<'K1' | 'K2' | 'K3', number>;
    targetFreqCode: string; // 3-digit base + noise + drift
    targetPulseMode: 'P-1' | 'P-2' | 'P-3';
    requiredFilterRelay: 'F1' | 'F2' | 'F3';
    interferenceSource: 'IC_HAT' | 'DIS_HAT' | 'CAPRAZ_HAT';

    captainWaveConfirmed: boolean;
    muhendisOscA: number;
    muhendisOscB: number;
    muhendisTuned: boolean;
    kriptologFreqCode: string;
    kriptologPulseMode: 'P-1' | 'P-2' | 'P-3' | null;
    kriptologSynced: boolean;
    defenseSource: 'IC_HAT' | 'DIS_HAT' | 'CAPRAZ_HAT' | null;
    defenseFilterRelay: 'F1' | 'F2' | 'F3' | null;
    defenseIsolated: boolean;
    solved: boolean;
  };

  // Stage 3: 12 MW Dinamik 4-Baralı Güç Matrisi, Ağırlıklı Sağlama & Çift Doğrulamalı Savunma
  stage3: {
    totalBudgetMw: number; // 12 MW
    targetItki: number;
    targetKalkan: number;
    targetYasam: number;
    targetSogutma: number;
    priorityOrderText: string;
    carrierBand: 'HF-1' | 'HF-2' | 'HF-3' | 'HF-4';
    checksumMultiplier: number;
    targetChecksum: string; // 3-digit weighted checksum
    threatQuadrant: 'KUZEY' | 'DOGU' | 'GUNEY' | 'BATI';
    requiredFirewallLevel: 1 | 2 | 3 | 4;
    secondaryCipherTag: 'A' | 'B' | 'C' | 'D';

    captainOrderConfirmed: boolean;
    muhendisItki: number;
    muhendisKalkan: number;
    muhendisYasam: number;
    muhendisSogutma: number;
    muhendisLocked: boolean;
    kriptologChecksum: string;
    kriptologBand: 'HF-1' | 'HF-2' | 'HF-3' | 'HF-4' | null;
    kriptologLocked: boolean;
    defenseQuadrant: 'KUZEY' | 'DOGU' | 'GUNEY' | 'BATI' | null;
    defenseFirewallLevel: 1 | 2 | 3 | 4;
    defenseCipherTag: 'A' | 'B' | 'C' | 'D' | null;
    defenseLocked: boolean;
    solved: boolean;
  };

  // Stage 4: Acil Kriz Müdahalesi & Sıralı Şalter Zinciri
  stage4: {
    crisisTitle: string;
    protocolCode: 'DELTA-3' | 'SIGMA-7' | 'OMEGA-9';
    targetEmergencyPsi: 60 | 80 | 100 | 120;
    protocolRelayBook: Record<'DELTA-3' | 'SIGMA-7' | 'OMEGA-9', { seq: ['R1' | 'R2' | 'R3', 'R1' | 'R2' | 'R3', 'R1' | 'R2' | 'R3']; token: string }>;
    targetRelaySeq: ['R1' | 'R2' | 'R3', 'R1' | 'R2' | 'R3', 'R1' | 'R2' | 'R3'];
    targetBreachToken: string;
    breachedBulkhead: 'B1' | 'B2' | 'B3' | 'B4';

    captainAuthorized: boolean;
    muhendisRelaySeq: Array<'R1' | 'R2' | 'R3'>;
    muhendisEmergencyPsi: number;
    muhendisStabilized: boolean;
    kriptologBreachToken: string;
    kriptologOverridden: boolean;
    defenseBulkhead: 'B1' | 'B2' | 'B3' | 'B4' | null;
    defenseTokenInput: string;
    defenseContained: boolean;
    solved: boolean;
  };

  // Stage 5: Çift Kilitli Tahliye, Yardımcı İtki & Fırlatma Sekansı
  stage5: {
    recommendedRoute: 'ALFA' | 'BETA' | 'GAMA';
    routeSummary: string;
    targetFuelPct: number; // 65 | 80 | 95
    targetAuxPower: number; // 20 | 30 | 40
    targetLatchCode: 'M1' | 'M2' | 'M3';
    routeLaunchCodes: Record<'ALFA' | 'BETA' | 'GAMA', string>;
    obstructedHatch: 'H1' | 'H2' | 'H3' | 'H4';
    hatchPin: string; // 2-digit pin read by Mühendis
    targetLaunchCode: string; // e.g. "7-A-5-48"

    captainSelectedRoute: 'ALFA' | 'BETA' | 'GAMA' | null;
    captainFinalLocked: boolean;
    muhendisFuelPct: number;
    muhendisAuxPower: number;
    muhendisThrusterArmed: boolean;
    kriptologLaunchCode: string;
    kriptologBeaconSent: boolean;
    defenseClearedHatch: 'H1' | 'H2' | 'H3' | 'H4' | null;
    defenseLatchCode: 'M1' | 'M2' | 'M3' | null;
    defenseFinalSealed: boolean;
    solved: boolean;
  };

  teamStats: {
    mistakesCount: number;
    captainOps: number;
    muhendisOps: number;
    kriptologOps: number;
    guvenlikOps: number;
  };
}

export interface MissionState {
  roomCode: string;
  roundId: string; // Unique identifier regenerated on each new round
  status: GameStatus;
  operationTheme?: OperationTheme;
  targetPlayerCount?: 2 | 3 | 4;
  gameMode?: GameMode; // 'standart' (classic) or 'gelismis' (interdependent tactical)
  activeEnvironment: EnvironmentType;
  selectedMiniGames: [MiniGameType, MiniGameType];
  previousMiniGames?: [MiniGameType, MiniGameType];
  currentPhaseIndex: number; // 0, 1, 2, 3
  timeLeftSeconds: number; // 300
  hullIntegrity: number; // 100
  players: {
    kaptan: PlayerInfo;
    muhendis: PlayerInfo;
    kriptolog?: PlayerInfo;
    guvenlik?: PlayerInfo;
  };
  myRole: Role;
  hostId?: string;
  isPaused: boolean;
  isDisconnected: boolean;
  feedbackState: FeedbackState;
  feedbackMessage: string;
  captainName?: string;
  engineerName?: string;
  stealthLevel?: number;
  currentRoundId?: string;

  // Mini-game payloads
  diagnostic: DiagnosticData;
  signal: SignalData;
  cable: CableData;
  airlock: AirlockData;
  radar: RadarData;
  energy: EnergyData;
  rescue: RescueData;

  // Advanced interdependent scenario payload
  advancedScenario?: AdvancedScenarioData;

  // Karantina 2088 payload
  karantinaData?: KarantinaData;

  // Omega 3 & 4 Player Team Operation payload
  omegaData?: OmegaTeamData;

  // Final stats
  rescuedCrewCount: number;
  completedTasksCount: number;
  finalScore: number;
  scoreBreakdown?: {
    tasksScore: number;
    timeBonus: number;
    hullBonus: number;
    crewBonus: number;
  };
  outcomeType?: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik';
}
