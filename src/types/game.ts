/**
 * PARTYVERSE — Kayıp Sinyal (Lost Signal)
 * Game Types, State Definitions & Constants
 */

export type Role = 'kaptan' | 'muhendis';

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
}

export type GameStatus = 
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

export type AdvancedSubsystemId = 'reaktor' | 'sinyal' | 'hava_kilidi' | 'guc_matrisi' | 'tahliye';

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
  };
  powerGrid: AdvancedPowerGrid;
  event: AdvancedEventData;
  activeSubsystemTab: AdvancedSubsystemId;
  evacuationUnlocked: boolean;
  evacuationLog: string[];
}

export interface MissionState {
  roomCode: string;
  roundId: string; // Unique identifier regenerated on each new round
  status: GameStatus;
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
  };
  myRole: Role;
  isPaused: boolean;
  isDisconnected: boolean;
  feedbackState: FeedbackState;
  feedbackMessage: string;

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
  outcomeType: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik';
}
