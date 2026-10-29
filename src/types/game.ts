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
    conditionNote: 'Eşitsizlikler tersine işler: Isı ≤-10°C veya Basınç ≥70kPa kontrol edilir.',
  },
  meteor_yagmuru: {
    id: 'meteor_yagmuru',
    name: 'Meteor Yağmuru',
    badge: 'KİNETİK ALARM',
    desc: 'Gövde delinmeleri, ani basınç düşüşleri ve elektrik sıçramaları.',
    accentColor: '#f59e0b',
    tempOffset: 15,
    conditionNote: 'Herhangi 2 kritik koşulun sağlanması kesici müdahalesi için yeterlidir.',
  },
  karantina_protokolu: {
    id: 'karantina_protokolu',
    name: 'Karantina Protokolü',
    badge: 'BİYOLOJİK KİLİT',
    desc: 'Hava sirkülasyonu kilitli; tam filtreleme ve hassas mühür sıralaması zorunlu.',
    accentColor: '#a855f7',
    tempOffset: 5,
    conditionNote: 'Tam izolasyon için tek bir koşulun aşılması acil tahliyeyi tetikler.',
  },
};

export interface PlayerInfo {
  id: string;
  name: string;
  role: Role;
  ready: boolean;
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
    reaktor: { temp: number; press: number; noise: number; code: string };
    sogutucu: { temp: number; press: number; noise: number; code: string };
    anten: { temp: number; press: number; noise: number; code: string };
    yonlendirme: { temp: number; press: number; noise: number; code: string };
  };
  faultyLine: 'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme';
  engineerSuggestedLine: string | null;
  captainSelectedBreaker: 'K1' | 'K2' | 'K3' | 'K4' | null;
  correctBreaker: 'K3';
  isSolved: boolean;
}

// State data for Sinyal Çözümü
export interface SignalData {
  symbols: string[]; // e.g. ['Δ', 'Ω', 'Σ', 'λ']
  ruleDescription: string; // e.g. "Sembol çiftlerini yer değiştirin (1-2 ve 3-4)"
  ruleType: 'duz' | 'ters' | 'ilk_sona' | 'cift_degis';
  symbolMap: Record<string, number>; // e.g. Δ: 4, Ω: 7, Σ: 2, λ: 9
  computedCode: string; // e.g. "7492"
  frequencies: Array<{ freq: string; code: string; label: string }>;
  engineerTunedFreq: string;
  isLocked: boolean;
  isSolved: boolean;
}

// State data for Kablo Bağlantısı
export interface CableData {
  cables: Array<{ id: 'gunes' | 'ay' | 'yildiz'; name: string; color: string; requiredHz: number }>;
  sockets: Array<{ id: 'J1' | 'J2' | 'J3' | 'J4'; measuredHz: number }>;
  connections: Record<string, string | null>; // cableId -> socketId
  isTested: boolean;
  isSolved: boolean;
}

// State data for Hava Kilidi
export interface AirlockData {
  rules: string[]; // Kaptan 3 rules e.g. ["Pompa, Mühürden önce açılmalı", "Tahliye, Filtreden sonra açılmalı", "Mühür en son açılmalı"]
  correctSequence: Array<'V1' | 'V2' | 'V3' | 'V4'>;
  engineerSequence: Array<'V1' | 'V2' | 'V3' | 'V4'>;
  valves: Array<{ id: 'V1' | 'V2' | 'V3' | 'V4'; name: string; icon: string }>;
  isSolved: boolean;
}

// State data for Radar Yönlendirme
export interface RadarData {
  beaconId: 'L1' | 'L2' | 'L3';
  beaconCoord: { x: number; y: number }; // on 5x5 grid (0-4)
  directionsText: string; // e.g. "L2'den 2 hücre doğu, 1 hücre kuzey"
  targetCoord: { x: number; y: number };
  compassRotationDeg: number; // e.g. 90deg, 180deg
  engineerSelectedCoord: { x: number; y: number } | null;
  isScanned: boolean;
  isSolved: boolean;
}

// State data for Enerji Dağıtımı
export interface EnergyData {
  totalBudget: number; // 12
  engineerAllocation: {
    yasamDestegi: number;
    itki: number;
    kalkan: number;
  };
  lineLosses: {
    yasamDestegi: number; // -1
    itki: number;         // -1
    kalkan: number;       // -2
  };
  captainMinRequirements: {
    yasamDestegi: number; // 3
    itki: number;         // 3
    kalkan: number;       // 2
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
  crewCount: number;
  travelTimeMin: string;
  powerRequirements: { itki: number; kalkan: number };
  dangerRating: string;
}

export interface RescueData {
  selectedRouteId: 'alfa' | 'beta' | 'gama';
  captainApproved: boolean;
  engineerApproved: boolean;
  routes: RescueRoute[];
}

export interface MissionState {
  roomCode: string;
  status: GameStatus;
  activeEnvironment: EnvironmentType;
  selectedMiniGames: [MiniGameType, MiniGameType];
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

  // Final stats
  rescuedCrewCount: number;
  completedTasksCount: number;
  finalScore: number;
  outcomeType: 'tam_basari' | 'kismi_kurtarma' | 'basarisizlik';
}
