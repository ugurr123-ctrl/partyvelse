import { 
  MissionState, 
  MiniGameType, 
  EnvironmentType, 
  ENVIRONMENTS,
  RescueRoute
} from '../types/game';

const ALL_MINI_GAMES: MiniGameType[] = [
  'ariza_teshisi',
  'sinyal_cozumu',
  'kablo_baglantisi',
  'hava_kilidi',
  'radar_yonlendirme',
];

export function getRandomMiniGames(): [MiniGameType, MiniGameType] {
  const shuffled = [...ALL_MINI_GAMES].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'KYP-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const RESCUE_ROUTES: RescueRoute[] = [
  {
    id: 'alfa',
    name: 'Rota Alfa (Süper-İtki Koridoru)',
    badge: 'HIZLI & YÜKSEK RİSK',
    desc: 'Plazma kuyruğu içinden süratli geçiş. Yüksek itki ve reaktör kararlılığı gerektirir.',
    crewCount: 18,
    travelTimeMin: '1.2 dk',
    powerRequirements: { itki: 4, kalkan: 2 },
    dangerRating: 'YÜKSEK',
  },
  {
    id: 'beta',
    name: 'Rota Beta (Lagrange Yolu)',
    badge: 'STANDART DENGELİ',
    desc: 'Yerçekimi sapanı desteğiyle istasyon çevresinden orta süreli güvenli geçiş.',
    crewCount: 12,
    travelTimeMin: '2.5 dk',
    powerRequirements: { itki: 3, kalkan: 3 },
    dangerRating: 'ORTA',
  },
  {
    id: 'gama',
    name: 'Rota Gama (Gölge Yörünge)',
    badge: 'AĞIR & ZIRHLI',
    desc: 'Enkaza karşı tam kalkan korumalı, uzun süreli ancak minimum riskli tahliye rotası.',
    crewCount: 6,
    travelTimeMin: '4.0 dk',
    powerRequirements: { itki: 2, kalkan: 4 },
    dangerRating: 'DÜŞÜK',
  },
];

export function createInitialMissionState(
  roomCode: string = generateRoomCode(),
  env: EnvironmentType = 'kayip_sinyal',
  playerName: string = 'Kaptan Ece'
): MissionState {
  const selectedGames = getRandomMiniGames();

  return {
    roomCode,
    status: 'entry',
    activeEnvironment: env,
    selectedMiniGames: selectedGames,
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

    // 1. Arıza Teşhisi
    diagnostic: {
      lines: {
        reaktor: { temp: 68, press: 48, noise: 42, code: 'CIR-01' },
        sogutucu: { temp: 45, press: 52, noise: 30, code: 'CIR-02' },
        anten: { temp: 84, press: 38, noise: 68, code: 'CIR-03' }, // Meets all 3 thresholds!
        yonlendirme: { temp: 58, press: 62, noise: 35, code: 'CIR-04' },
      },
      faultyLine: 'anten',
      engineerSuggestedLine: null,
      captainSelectedBreaker: null,
      correctBreaker: 'K3',
      isSolved: false,
    },

    // 2. Sinyal Çözümü
    signal: {
      symbols: ['Δ', 'Ω', 'Σ', 'λ'],
      ruleDescription: 'Sembol çiftlerini yer değiştirin (1-2 ve 3-4)',
      ruleType: 'cift_degis',
      symbolMap: { 'Δ': 4, 'Ω': 7, 'Σ': 2, 'λ': 9 },
      // Original: 4, 7, 2, 9 -> Pairs swapped: 7, 4, 9, 2 => "7492"
      computedCode: '7492',
      frequencies: [
        { freq: '142.4 MHz', code: '4729', label: 'Alfa Kanalı' },
        { freq: '148.8 MHz', code: '7492', label: 'Acil Yardım Taşıyıcı' }, // Correct!
        { freq: '154.2 MHz', code: '9274', label: 'Yedek Röle' },
        { freq: '162.0 MHz', code: '2947', label: 'Gezegen Telsiz' },
      ],
      engineerTunedFreq: '142.4 MHz',
      isLocked: false,
      isSolved: false,
    },

    // 3. Kablo Bağlantısı
    cable: {
      cables: [
        { id: 'gunes', name: 'Güneş Kablosu (Sarı)', color: '#ffb703', requiredHz: 240 },
        { id: 'ay', name: 'Ay Kablosu (Cyan)', color: '#00f0ff', requiredHz: 480 },
        { id: 'yildiz', name: 'Yıldız Kablosu (Mor)', color: '#dab5ff', requiredHz: 120 },
      ],
      sockets: [
        { id: 'J1', measuredHz: 120 }, // Yıldız
        { id: 'J2', measuredHz: 240 }, // Güneş
        { id: 'J3', measuredHz: 360 }, // Boş / Yanlış
        { id: 'J4', measuredHz: 480 }, // Ay
      ],
      connections: {
        gunes: null,
        ay: null,
        yildiz: null,
      },
      isTested: false,
      isSolved: false,
    },

    // 4. Hava Kilidi
    airlock: {
      rules: [
        '1. Pompa çalıştırmadan önce Tahliye hattı açılmalıdır.',
        '2. Filtreleme her zaman Tahliye öncesinde devreye girmelidir.',
        '3. Mühür kilidi daima en son aktif edilmelidir.',
      ],
      // Correct order based on rules: V2 (Filtre) -> V3 (Tahliye) -> V1 (Pompa) -> V4 (Mühür)
      correctSequence: ['V2', 'V3', 'V1', 'V4'],
      engineerSequence: [],
      valves: [
        { id: 'V1', name: 'Basınç Pompası', icon: 'air' },
        { id: 'V2', name: 'Hava Filtresi', icon: 'filter_alt' },
        { id: 'V3', name: 'Gaz Tahliyesi', icon: 'mode_fan' },
        { id: 'V4', name: 'Bölme Mührü', icon: 'lock' },
      ],
      isSolved: false,
    },

    // 5. Radar Yönlendirme
    radar: {
      beaconId: 'L2',
      beaconCoord: { x: 1, y: 1 }, // L2 is at (1,1) in 0-indexed 5x5 grid
      directionsText: "L2 işaretçisinden 2 hücre DOĞUYA, 1 hücre KUZEYE",
      // If North is up: y - 1 = 0; East is right: x + 2 = 3. Target is (3, 0)
      targetCoord: { x: 3, y: 0 },
      compassRotationDeg: 0,
      engineerSelectedCoord: null,
      isScanned: false,
      isSolved: false,
    },

    // 6. Enerji Dağıtımı (Aşama 3)
    energy: {
      totalBudget: 12,
      engineerAllocation: {
        yasamDestegi: 4,
        itki: 4,
        kalkan: 4,
      },
      lineLosses: {
        yasamDestegi: 1, // Net = 4 - 1 = 3
        itki: 1,         // Net = 4 - 1 = 3
        kalkan: 2,       // Net = 4 - 2 = 2
      },
      captainMinRequirements: {
        yasamDestegi: 3,
        itki: 3,
        kalkan: 2,
      },
      isDraftShared: false,
      isLocked: false,
    },

    // 7. Ortak Kurtarma Kararı (Aşama 4A & 4B)
    rescue: {
      selectedRouteId: 'beta',
      captainApproved: false,
      engineerApproved: false,
      routes: RESCUE_ROUTES,
    },

    rescuedCrewCount: 12,
    completedTasksCount: 4,
    finalScore: 880,
    outcomeType: 'tam_basari',
  };
}
