import {
  MissionState,
  OmegaSectorTelemetry,
  OmegaTeamData,
  OperationTheme,
  Role,
  TeamOperationTheme,
} from '../types/game';
import { calculateFinalScore } from './gameFactory';

export const TEAM_OPERATION_THEMES: TeamOperationTheme[] = [
  'omega_ekip',
  'titan_maden',
  'siber_kale',
  'buzul_ussu',
];

export const OMEGA_ROLE_ORDER_3: Role[] = ['kaptan', 'muhendis', 'kriptolog'];
export const OMEGA_ROLE_ORDER_4: Role[] = ['kaptan', 'muhendis', 'kriptolog', 'guvenlik'];

export function isTeamOperationTheme(theme?: OperationTheme): theme is TeamOperationTheme {
  return Boolean(theme && TEAM_OPERATION_THEMES.includes(theme as TeamOperationTheme));
}

export function getTeamThemeFromCode(code: string): TeamOperationTheme | null {
  const upper = code.toUpperCase().trim();
  if (upper.startsWith('TTN')) return 'titan_maden';
  if (upper.startsWith('SBK')) return 'siber_kale';
  if (upper.startsWith('BZL')) return 'buzul_ussu';
  if (upper.startsWith('OMG')) return 'omega_ekip';
  return null;
}

export interface TeamOperationMeta {
  id: TeamOperationTheme;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  sectorLabel: string;
  codePrefix3: string;
  codePrefix4: string;
  codeTag: string;
  stageTitles: [string, string, string, string, string];
  telemetryUnits: {
    tempLabel: string;
    pressLabel: string;
    radLabel: string;
    vibLabel: string;
  };
  crisisPool: [string, string, string];
  defaultTimeSeconds: number;
}

export function getTeamOperationMeta(theme?: OperationTheme): TeamOperationMeta {
  switch (theme) {
    case 'titan_maden':
      return {
        id: 'titan_maden',
        title: 'TİTAN-9 // Abisal Kazı',
        shortTitle: 'TİTAN-9',
        subtitle: 'Derin Deniz Sondajı · 5 Aşamalı Basınç & Metan Krizi',
        description:
          'Okyanus tabanında 4.200 metre derinlikteki jeotermal sondaj kulesinde basınç çatlağı ve metan taşkını başladı.',
        sectorLabel: 'TİTAN-9 Çukuru (-4.200m) // Jeotermal Sondaj',
        codePrefix3: 'TTN3',
        codePrefix4: 'TTN4',
        codeTag: 'ABİS-9',
        stageTitles: [
          '1. Kuyu Sızdırmazlık',
          '2. Sonar Rezonans',
          '3. 12 MW Balast Matrisi',
          '4. Metan Patlaması',
          '5. Kapsül Yükselişi',
        ],
        telemetryUnits: {
          tempLabel: 'Magma Isısı (°C)',
          pressLabel: 'Kuyu Basıncı (bar)',
          radLabel: 'Metan (ppm)',
          vibLabel: 'Sismik (Hz)',
        },
        crisisPool: [
          'Kuzey Fay Hattı Metan Püskürmesi',
          'Ana Sondaj Başlığı Aşırı Basıncı',
          'Dış Balast Tankı Valf Kilitlenmesi',
        ],
        defaultTimeSeconds: 480,
      };
    case 'siber_kale':
      return {
        id: 'siber_kale',
        title: 'SİBER KALE // Sıfır Gün',
        shortTitle: 'SİBER KALE',
        subtitle: 'Kuantum Veri Merkezi · 5 Aşamalı Siber Savunma',
        description:
          'Ulusal kuantum veri merkezine sıfır gün saldırısı başlatıldı; 5 çekirdek düğüm ve kara kutu kurtarılmalı.',
        sectorLabel: 'SİBER KALE // Katman-7 Çekirdek Sunucular',
        codePrefix3: 'SBK3',
        codePrefix4: 'SBK4',
        codeTag: 'KATMAN-7',
        stageTitles: [
          '1. Düğüm Sızma Teşhisi',
          '2. Kuantum Dalga Kilidi',
          '3. 12 MW Sunucu Ağı',
          '4. Sıfır Gün Saldırısı',
          '5. Kara Kutu Tahliyesi',
        ],
        telemetryUnits: {
          tempLabel: 'İşlemci Isısı (°C)',
          pressLabel: 'Paket Akışı (Gb/s)',
          radLabel: 'İhlal Yükü (%)',
          vibLabel: 'Gecikme (ms)',
        },
        crisisPool: [
          'Çekirdek Kasa Fidye Şifrelemesi',
          'Yetkisiz Kök Sertifika Enjeksiyonu',
          'Optik Omurga DDoS Taşkını',
        ],
        defaultTimeSeconds: 480,
      };
    case 'buzul_ussu':
      return {
        id: 'buzul_ussu',
        title: 'KUZEY YILDIZI // Kriyo Çöküş',
        shortTitle: 'KUZEY YILDIZI',
        subtitle: 'Antarktika Buzul Üssü · 5 Aşamalı Kriyo & Biyo-Kilit',
        description:
          'Antarktika buzul altı istasyonunda kriyojenik soğutma halkası çatladı; donma sınırı öncesi konvoy kalkmalı.',
        sectorLabel: 'KUZEY YILDIZI Üssü (-62°C) // Buzul Reaktörü',
        codePrefix3: 'BZL3',
        codePrefix4: 'BZL4',
        codeTag: 'KRİYO-62',
        stageTitles: [
          '1. Kriyo Türbin Teşhisi',
          '2. Termal Rezonans',
          '3. 12 MW Isı Şebekesi',
          '4. Buzul Çatlağı Krizi',
          '5. Kar Aracı Tahliyesi',
        ],
        telemetryUnits: {
          tempLabel: 'Çekirdek Isısı (°C)',
          pressLabel: 'Kriyo Basıncı (bar)',
          radLabel: 'Aerosol Sızıntısı (%)',
          vibLabel: 'Buz Gerilimi (kN)',
        },
        crisisPool: [
          'Buzul Kalkanı 4. Sektör Çökmesi',
          'Ana Soğutucu Azot Taşması',
          'Yüzey İniş Pisti Kar Fırtınası Kilidi',
        ],
        defaultTimeSeconds: 480,
      };
    case 'omega_ekip':
    default:
      return {
        id: 'omega_ekip',
        title: 'OMEGA-4 // Kriz Ekibi',
        shortTitle: 'OMEGA-4',
        subtitle: 'Yörünge İstasyonu · 5 Aşamalı Reaktör & Tahliye Krizi',
        description:
          'Yörüngedeki OMEGA-4 araştırma üssünde 5 zincirleme sistem arızası başladı; tüm ekip sesli koordinasyonla tahliyeyi açmalı.',
        sectorLabel: 'OMEGA-4 Yörünge İstasyonu // Çekirdek Krizi',
        codePrefix3: 'OMG3',
        codePrefix4: 'OMG4',
        codeTag: 'OMG-4',
        stageTitles: [
          '1. Çekirdek Anomali',
          '2. Alt-Uzay Dalga',
          '3. 12 MW Güç Matrisi',
          '4. Plazma Taşkını',
          '5. Omega Tahliye',
        ],
        telemetryUnits: {
          tempLabel: 'Çekirdek Isısı (°C)',
          pressLabel: 'Basınç (bar)',
          radLabel: 'Radyasyon (mSv)',
          vibLabel: 'Titreşim (Hz)',
        },
        crisisPool: [
          'Manyetik Sınırlama Plazma Taşkını',
          'Yardımcı Soğutma Borusu Yırtılması',
          'Solar Fırtına İletişim Kararması',
        ],
        defaultTimeSeconds: 480,
      };
  }
}

export function getOmegaRolesForCount(playerCount: 2 | 3 | 4 = 4): Role[] {
  if (playerCount === 3) return OMEGA_ROLE_ORDER_3;
  if (playerCount === 4) return OMEGA_ROLE_ORDER_4;
  return ['kaptan', 'muhendis'];
}

export interface OmegaRoleMeta {
  role: Role;
  title: string;
  shortTitle: string;
  defaultName: string;
  waitingName: string;
  accentHex: string;
  summary: string;
}

export function getOmegaRoleMeta(role: Role, playerCount: 3 | 4 = 4): OmegaRoleMeta {
  switch (role) {
    case 'kaptan':
      return {
        role: 'kaptan',
        title: playerCount === 3 ? 'Komutan (Kural & Kalkan)' : 'Komutan (Kriz Lideri)',
        shortTitle: 'Komutan',
        defaultName: 'Komutan Ece',
        waitingName: 'Komutan Bekleniyor...',
        accentHex: '#ffb703',
        summary:
          playerCount === 3
            ? 'Tüm arıza kurallarını, hedef osilatör ve 12 MW güç planını yönetir; 3 kişilik ekipte savunma ve kapak kilitlerini de üstlenir.'
            : 'Tüm arıza kurallarını, hedef osilatör değerlerini, 12 MW güç dağılımını, kriz protokolünü ve tahliye rotasını koordine eder.',
      };
    case 'muhendis':
      return {
        role: 'muhendis',
        title: 'Sistem Mühendisi',
        shortTitle: 'Mühendis',
        defaultName: 'Mühendis Mert',
        waitingName: 'Mühendis Bekleniyor...',
        accentHex: '#00eefc',
        summary:
          '5 sektörün telemetrisini okur, valf/pompayı ayarlar, harmonik osilatörleri dengeler, 12 MW baraları ve sıralı kriz rölelerini yönetir.',
      };
    case 'kriptolog':
      return {
        role: 'kriptolog',
        title: 'Kriptolog & İletişim',
        shortTitle: 'Kriptolog',
        defaultName: 'Kriptolog Deniz',
        waitingName: 'Kriptolog Bekleniyor...',
        accentHex: '#dab5ff',
        summary:
          'Dönüşüm kurallı 4 glifli PIN’i, parazit-offsetli frekans kilidini, ağırlıklı 12 MW sağlama kodunu ve şalter/fırlatma sekanslarını çözer.',
      };
    case 'guvenlik':
      return {
        role: 'guvenlik',
        title: 'Güvenlik & Savunma Şefi',
        shortTitle: 'Güvenlik',
        defaultName: 'Güvenlik Baran',
        waitingName: 'Güvenlik Şefi Bekleniyor...',
        accentHex: '#34d399',
        summary:
          'Polarite + alt kanalı kilitler, parazit kaynağını izole eder, 4 seviyeli güvenlik duvarını, gövde yama tokenını ve son kapak mandalını mühürler.',
      };
  }
}

const GLYPHS = ['Δ', 'Ω', 'Σ', 'Ψ', 'λ', 'Φ'];
const SECTOR_IDS: Array<'S1' | 'S2' | 'S3' | 'S4' | 'S5'> = ['S1', 'S2', 'S3', 'S4', 'S5'];
const POLARITIES: Array<'ALFA' | 'BETA' | 'GAMA'> = ['ALFA', 'BETA', 'GAMA'];
const SUB_CHANNELS: Array<'X1' | 'X2' | 'X3'> = ['X1', 'X2', 'X3'];
const QUADRANTS: Array<'KUZEY' | 'DOGU' | 'GUNEY' | 'BATI'> = ['KUZEY', 'DOGU', 'GUNEY', 'BATI'];
const CIPHER_TAGS: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
const ROUTES: Array<'ALFA' | 'BETA' | 'GAMA'> = ['ALFA', 'BETA', 'GAMA'];
const HATCHES: Array<'H1' | 'H2' | 'H3' | 'H4'> = ['H1', 'H2', 'H3', 'H4'];
const LATCH_CODES: Array<'M1' | 'M2' | 'M3'> = ['M1', 'M2', 'M3'];
const BULKHEADS: Array<'B1' | 'B2' | 'B3' | 'B4'> = ['B1', 'B2', 'B3', 'B4'];
const INTERFERENCE_SOURCES: Array<'IC_HAT' | 'DIS_HAT' | 'CAPRAZ_HAT'> = ['IC_HAT', 'DIS_HAT', 'CAPRAZ_HAT'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateOmegaData(
  playerCount: 3 | 4 = 4,
  themeId: TeamOperationTheme = 'omega_ekip'
): OmegaTeamData {
  const themeMeta = getTeamOperationMeta(themeId);

  // ---------------- STAGE 1: 5-Sector Anomaly + Offset 4-Glyph Cipher ----------------
  const shuffledGlyphs = [...GLYPHS].sort(() => Math.random() - 0.5);
  const glyphCipherTable: Record<string, number> = {};
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  shuffledGlyphs.forEach((g, idx) => {
    glyphCipherTable[g] = digits[idx];
  });

  const faultySectorId = pickRandom(SECTOR_IDS);
  const faultyIdx = SECTOR_IDS.indexOf(faultySectorId);
  const ruleVariant = Math.floor(Math.random() * 3);
  const ruleDescription =
    ruleVariant === 0
      ? 'Isısı ≥ 90°C VE Basıncı ≤ 34 VE Titreşimi ≥ 62 olan tek sektör arızalıdır.'
      : ruleVariant === 1
      ? 'Basıncı ≤ 32 VE Radyasyonu/Yükü ≥ 70 VE Titreşimi ≥ 60 olan tek sektör arızalıdır.'
      : 'Isısı ≥ 88°C VE Radyasyonu/Yükü ≥ 68 VE Titreşimi ≥ 65 olan tek sektör arızalıdır.';

  const nonFaultyIds = SECTOR_IDS.filter((id) => id !== faultySectorId);

  const sectors: OmegaSectorTelemetry[] = SECTOR_IDS.map((id, idx) => {
    const tag: [string, string, string, string] = [
      shuffledGlyphs[idx % shuffledGlyphs.length],
      shuffledGlyphs[(idx + 1) % shuffledGlyphs.length],
      shuffledGlyphs[(idx + 3) % shuffledGlyphs.length],
      shuffledGlyphs[(idx + 5) % shuffledGlyphs.length],
    ];
    if (id === faultySectorId) {
      return {
        id,
        label: `Sektör ${id}`,
        temp: 92 + Math.floor(Math.random() * 6),
        pressure: 26 + Math.floor(Math.random() * 5),
        rad: 74 + Math.floor(Math.random() * 12),
        vibration: 68 + Math.floor(Math.random() * 12),
        glyphTag: tag,
      };
    }
    const distractorPos = nonFaultyIds.indexOf(id);
    if (distractorPos === 0) {
      // High temp + low press, but safe vibration!
      return {
        id,
        label: `Sektör ${id}`,
        temp: 91 + Math.floor(Math.random() * 5),
        pressure: 28 + Math.floor(Math.random() * 4),
        rad: 71 + Math.floor(Math.random() * 8),
        vibration: 36 + Math.floor(Math.random() * 8),
        glyphTag: tag,
      };
    }
    if (distractorPos === 1) {
      // High vib + high rad, but temp too low and pressure high!
      return {
        id,
        label: `Sektör ${id}`,
        temp: 64 + Math.floor(Math.random() * 8),
        pressure: 54 + Math.floor(Math.random() * 8),
        rad: 75 + Math.floor(Math.random() * 10),
        vibration: 70 + Math.floor(Math.random() * 10),
        glyphTag: tag,
      };
    }
    if (distractorPos === 2) {
      // Low pressure + high vibration, but normal temp & low rad!
      return {
        id,
        label: `Sektör ${id}`,
        temp: 61 + Math.floor(Math.random() * 8),
        pressure: 29 + Math.floor(Math.random() * 3),
        rad: 38 + Math.floor(Math.random() * 10),
        vibration: 67 + Math.floor(Math.random() * 8),
        glyphTag: tag,
      };
    }
    return {
      id,
      label: `Sektör ${id}`,
      temp: 55 + Math.floor(Math.random() * 10),
      pressure: 48 + Math.floor(Math.random() * 10),
      rad: 29 + Math.floor(Math.random() * 12),
      vibration: 34 + Math.floor(Math.random() * 10),
      glyphTag: tag,
    };
  });

  const faultySector = sectors.find((s) => s.id === faultySectorId)!;
  const rawDigits = faultySector.glyphTag.map((g) => glyphCipherTable[g]);
  const cipherRuleOptions: Array<{
    type: 'swap_first_two' | 'reverse_last_two' | 'shift_plus_one';
    desc: string;
  }> = [
    { type: 'swap_first_two', desc: 'İlk 2 rakamın yerini değiştir (D2-D1-D3-D4).' },
    { type: 'reverse_last_two', desc: 'Son 2 rakamın yerini değiştir (D1-D2-D4-D3).' },
    { type: 'shift_plus_one', desc: 'Her rakama +1 (mod 10) ekle.' },
  ];
  const chosenCipher = pickRandom(cipherRuleOptions);
  const transformedDigits =
    chosenCipher.type === 'swap_first_two'
      ? [rawDigits[1], rawDigits[0], rawDigits[2], rawDigits[3]]
      : chosenCipher.type === 'reverse_last_two'
      ? [rawDigits[0], rawDigits[1], rawDigits[3], rawDigits[2]]
      : rawDigits.map((d) => (d + 1) % 10);

  const targetPin = transformedDigits.join('');
  const pinSum = rawDigits.reduce((acc, d) => acc + d, 0);
  const targetValveAngle: 45 | 90 | 135 | 180 =
    pinSum % 4 === 0 ? 45 : pinSum % 4 === 1 ? 90 : pinSum % 4 === 2 ? 135 : 180;
  const targetPumpTier = (((pinSum % 5) + 1) as 1 | 2 | 3 | 4 | 5);
  const targetPolarity = POLARITIES[pinSum % 3];
  const targetSubChannel = SUB_CHANNELS[(pinSum + faultyIdx) % 3];

  // ---------------- STAGE 2: Harmonic Frequency & Cross Interference ----------------
  const shuffledKeys = (['K1', 'K2', 'K3'] as const).slice().sort(() => Math.random() - 0.5);
  const bandKeyMap: Record<'DAR' | 'GENIS' | 'DARBE', 'K1' | 'K2' | 'K3'> = {
    DAR: shuffledKeys[0],
    GENIS: shuffledKeys[1],
    DARBE: shuffledKeys[2],
  };
  const targetBandMode = pickRandom(['DAR', 'GENIS', 'DARBE'] as const);
  const targetBandKey = bandKeyMap[targetBandMode];
  const targetOscA = 4 + Math.floor(Math.random() * 5); // 4..8
  const targetOscB = 2 + Math.floor(Math.random() * 6); // 2..7
  const measuredNoiseDb = pickRandom([18, 24, 30, 36] as const);
  const resonanceDrift = pickRandom([2, 4, 6] as const);
  const keyBaseFreqMap: Record<'K1' | 'K2' | 'K3', number> = {
    K1: 420,
    K2: 560,
    K3: 710,
  };
  const freqNumeric = keyBaseFreqMap[targetBandKey] + measuredNoiseDb + resonanceDrift;
  const targetFreqCode = String(freqNumeric);
  const targetPulseMode = (['P-1', 'P-2', 'P-3'] as const)[freqNumeric % 3];
  const requiredFilterRelay = (['F1', 'F2', 'F3'] as const)[(freqNumeric + 1) % 3];
  const interferenceSource = pickRandom(INTERFERENCE_SOURCES);

  // ---------------- STAGE 3: 12 MW 4-Bar Power Grid + Weighted Checksum ----------------
  const powerCombos: Array<{
    itki: number;
    kalkan: number;
    yasam: number;
    sogutma: number;
    band: 'HF-1' | 'HF-2' | 'HF-3' | 'HF-4';
    mult: number;
  }> = [
    { itki: 4, kalkan: 3, yasam: 3, sogutma: 2, band: 'HF-1', mult: 13 },
    { itki: 3, kalkan: 4, yasam: 2, sogutma: 3, band: 'HF-2', mult: 17 },
    { itki: 5, kalkan: 2, yasam: 3, sogutma: 2, band: 'HF-3', mult: 19 },
    { itki: 3, kalkan: 3, yasam: 4, sogutma: 2, band: 'HF-4', mult: 23 },
  ];
  const chosenPower = pickRandom(powerCombos);
  const checksumValue =
    (chosenPower.itki * 2 +
      chosenPower.kalkan * 3 +
      chosenPower.yasam * 5 +
      chosenPower.sogutma * 7) *
    chosenPower.mult;
  const targetChecksum = String((checksumValue % 900) + 100);
  const threatQuadrant = pickRandom(QUADRANTS);
  const requiredFirewallLevel = ((Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4);
  const secondaryCipherTag = pickRandom(CIPHER_TAGS);

  // ---------------- STAGE 4: Emergency Sequential Relay Chain & Bulkhead Containment ----------------
  const perm = (arr: Array<'R1' | 'R2' | 'R3'>) =>
    [...arr].sort(() => Math.random() - 0.5) as [
      'R1' | 'R2' | 'R3',
      'R1' | 'R2' | 'R3',
      'R1' | 'R2' | 'R3'
    ];
  const protocolRelayBook: OmegaTeamData['stage4']['protocolRelayBook'] = {
    'DELTA-3': { seq: perm(['R1', 'R2', 'R3']), token: `VX-${24 + (pinSum % 70)}` },
    'SIGMA-7': { seq: perm(['R1', 'R2', 'R3']), token: `KR-${31 + (freqNumeric % 60)}` },
    'OMEGA-9': { seq: perm(['R1', 'R2', 'R3']), token: `ZX-${15 + (checksumValue % 80)}` },
  };
  const protocolCode = pickRandom(['DELTA-3', 'SIGMA-7', 'OMEGA-9'] as const);
  const chosenProto = protocolRelayBook[protocolCode];
  const targetEmergencyPsi = pickRandom([60, 80, 100, 120] as const);
  const breachedBulkhead = pickRandom(BULKHEADS);
  const crisisTitle = pickRandom(themeMeta.crisisPool);

  // ---------------- STAGE 5: Compound Launch Beacon & Dual Hatch Lock ----------------
  const recommendedRoute = pickRandom(ROUTES);
  const hatchPin = String(14 + ((pinSum * 7 + freqNumeric) % 85)); // 2 digits
  const routeDetails: Record<
    'ALFA' | 'BETA' | 'GAMA',
    { fuel: number; aux: number; latch: 'M1' | 'M2' | 'M3'; summary: string; code: string; hatch: 'H1' | 'H2' | 'H3' | 'H4' }
  > = {
    ALFA: {
      fuel: 95,
      aux: 40,
      latch: 'M1',
      summary: 'Ağır Kurtarma Rotası: %95 Ana Yakıt, %40 Yardımcı İtki ve M1 Mandalı kilitlenmelidir.',
      code: `${4 + (pinSum % 5)}-A-${chosenPower.itki + 2}`,
      hatch: 'H1',
    },
    BETA: {
      fuel: 80,
      aux: 30,
      latch: 'M2',
      summary: 'Denge Tahliye Koridoru: %80 Ana Yakıt, %30 Yardımcı İtki ve M2 Mandalı kilitlenmelidir.',
      code: `${3 + (pinSum % 5)}-B-${chosenPower.kalkan + 3}`,
      hatch: 'H2',
    },
    GAMA: {
      fuel: 65,
      aux: 20,
      latch: 'M3',
      summary: 'Hızlı Acil Çıkış: %65 Ana Yakıt, %20 Yardımcı İtki ve M3 Mandalı kilitlenmelidir.',
      code: `${2 + (pinSum % 5)}-G-${chosenPower.yasam + 4}`,
      hatch: 'H4',
    },
  };
  const routeLaunchCodes: Record<'ALFA' | 'BETA' | 'GAMA', string> = {
    ALFA: routeDetails.ALFA.code,
    BETA: routeDetails.BETA.code,
    GAMA: routeDetails.GAMA.code,
  };
  const chosenRouteMeta = routeDetails[recommendedRoute];
  const targetLaunchCode = `${chosenRouteMeta.code}-${hatchPin}`;

  return {
    themeId,
    playerCount,
    activeStage: 1,
    stage1: {
      sectors,
      faultySectorId,
      ruleDescription,
      glyphCipherTable,
      cipherRuleType: chosenCipher.type,
      cipherRuleDescription: chosenCipher.desc,
      targetPin,
      targetValveAngle,
      targetPumpTier,
      targetPolarity,
      targetSubChannel,
      captainSelectedSector: null,
      kriptologSubmittedPin: '',
      muhendisValveAngle: 45,
      muhendisPumpTier: 1,
      muhendisPurgeReady: false,
      shieldPolarity: null,
      shieldSubChannel: null,
      shieldSafetyUnlocked: false,
      solved: false,
    },
    stage2: {
      targetBandMode,
      targetBandKey,
      bandKeyMap,
      targetOscA,
      targetOscB,
      measuredNoiseDb,
      resonanceDrift,
      keyBaseFreqMap,
      targetFreqCode,
      targetPulseMode,
      requiredFilterRelay,
      interferenceSource,
      captainWaveConfirmed: false,
      muhendisOscA: 3,
      muhendisOscB: 3,
      muhendisTuned: false,
      kriptologFreqCode: '',
      kriptologPulseMode: null,
      kriptologSynced: false,
      defenseSource: null,
      defenseFilterRelay: null,
      defenseIsolated: false,
      solved: false,
    },
    stage3: {
      totalBudgetMw: 12,
      targetItki: chosenPower.itki,
      targetKalkan: chosenPower.kalkan,
      targetYasam: chosenPower.yasam,
      targetSogutma: chosenPower.sogutma,
      priorityOrderText: `İtki ${chosenPower.itki} MW · Kalkan ${chosenPower.kalkan} MW · Yaşam ${chosenPower.yasam} MW · Soğutma ${chosenPower.sogutma} MW (Bant ${chosenPower.band})`,
      carrierBand: chosenPower.band,
      checksumMultiplier: chosenPower.mult,
      targetChecksum,
      threatQuadrant,
      requiredFirewallLevel,
      secondaryCipherTag,
      captainOrderConfirmed: false,
      muhendisItki: 3,
      muhendisKalkan: 3,
      muhendisYasam: 3,
      muhendisSogutma: 3,
      muhendisLocked: false,
      kriptologChecksum: '',
      kriptologBand: null,
      kriptologLocked: false,
      defenseQuadrant: null,
      defenseFirewallLevel: 1,
      defenseCipherTag: null,
      defenseLocked: false,
      solved: false,
    },
    stage4: {
      crisisTitle,
      protocolCode,
      targetEmergencyPsi,
      protocolRelayBook,
      targetRelaySeq: chosenProto.seq,
      targetBreachToken: chosenProto.token,
      breachedBulkhead,
      captainAuthorized: false,
      muhendisRelaySeq: [],
      muhendisEmergencyPsi: 60,
      muhendisStabilized: false,
      kriptologBreachToken: '',
      kriptologOverridden: false,
      defenseBulkhead: null,
      defenseTokenInput: '',
      defenseContained: false,
      solved: false,
    },
    stage5: {
      recommendedRoute,
      routeSummary: chosenRouteMeta.summary,
      targetFuelPct: chosenRouteMeta.fuel,
      targetAuxPower: chosenRouteMeta.aux,
      targetLatchCode: chosenRouteMeta.latch,
      routeLaunchCodes,
      obstructedHatch: chosenRouteMeta.hatch,
      hatchPin,
      targetLaunchCode,
      captainSelectedRoute: null,
      captainFinalLocked: false,
      muhendisFuelPct: 50,
      muhendisAuxPower: 20,
      muhendisThrusterArmed: false,
      kriptologLaunchCode: '',
      kriptologBeaconSent: false,
      defenseClearedHatch: null,
      defenseLatchCode: null,
      defenseFinalSealed: false,
      solved: false,
    },
    teamStats: {
      mistakesCount: 0,
      captainOps: 0,
      muhendisOps: 0,
      kriptologOps: 0,
      guvenlikOps: 0,
    },
  };
}

/**
 * Anti-spoiler state filtering across all 5 stages and all 4 roles.
 */
export function filterOmegaStateForRole(omega: OmegaTeamData, role: Role): OmegaTeamData {
  const s1 = omega.stage1;
  const s2 = omega.stage2;
  const s3 = omega.stage3;
  const s4 = omega.stage4;
  const s5 = omega.stage5;
  const isDef = role === 'guvenlik' || (omega.playerCount === 3 && role === 'kaptan');

  return {
    ...omega,
    stage1: {
      ...s1,
      sectors: s1.sectors.map((sec) => ({
        ...sec,
        temp: role === 'muhendis' ? sec.temp : 0,
        pressure: role === 'muhendis' ? sec.pressure : 0,
        rad: role === 'muhendis' ? sec.rad : 0,
        vibration: role === 'muhendis' ? sec.vibration : 0,
        glyphTag:
          role === 'kaptan'
            ? sec.glyphTag
            : (['?', '?', '?', '?'] as [string, string, string, string]),
      })),
      ruleDescription: role === 'kaptan' ? s1.ruleDescription : 'Kural Komutan konsolunda gizlidir.',
      faultySectorId: role === 'kaptan' ? s1.faultySectorId : 'S1',
      glyphCipherTable: role === 'kriptolog' ? s1.glyphCipherTable : {},
      cipherRuleDescription:
        role === 'kriptolog'
          ? s1.cipherRuleDescription
          : 'Dönüşüm kuralı Kriptolog ekranındadır.',
      targetPin: '????',
      targetValveAngle: 45,
      targetPumpTier: 1,
      targetPolarity: 'ALFA',
      targetSubChannel: 'X1',
    },
    stage2: {
      ...s2,
      targetBandMode: role === 'kaptan' ? s2.targetBandMode : 'DAR',
      targetBandKey: role === 'kaptan' ? s2.targetBandKey : 'K1',
      bandKeyMap:
        role === 'kaptan'
          ? s2.bandKeyMap
          : { DAR: 'K1', GENIS: 'K1', DARBE: 'K1' },
      targetOscA: role === 'kaptan' ? s2.targetOscA : 0,
      targetOscB: role === 'kaptan' ? s2.targetOscB : 0,
      measuredNoiseDb: role === 'muhendis' ? s2.measuredNoiseDb : 18,
      resonanceDrift: role === 'muhendis' ? s2.resonanceDrift : 2,
      keyBaseFreqMap:
        role === 'kriptolog'
          ? s2.keyBaseFreqMap
          : { K1: 0, K2: 0, K3: 0 },
      targetFreqCode: '???',
      targetPulseMode: 'P-1',
      requiredFilterRelay: role === 'kriptolog' ? s2.requiredFilterRelay : 'F1',
      interferenceSource: isDef ? s2.interferenceSource : 'IC_HAT',
    },
    stage3: {
      ...s3,
      targetItki: role === 'kaptan' ? s3.targetItki : 0,
      targetKalkan: role === 'kaptan' ? s3.targetKalkan : 0,
      targetYasam: role === 'kaptan' ? s3.targetYasam : 0,
      targetSogutma: role === 'kaptan' ? s3.targetSogutma : 0,
      priorityOrderText:
        role === 'kaptan'
          ? s3.priorityOrderText
          : 'Hedef 12 MW dağılım ve taşıyıcı bant Komutan ekranındadır.',
      carrierBand: role === 'kaptan' ? s3.carrierBand : 'HF-1',
      targetChecksum: '???',
      threatQuadrant: isDef ? s3.threatQuadrant : 'KUZEY',
      requiredFirewallLevel: role === 'kriptolog' ? s3.requiredFirewallLevel : 1,
      secondaryCipherTag: role === 'kriptolog' ? s3.secondaryCipherTag : 'A',
    },
    stage4: {
      ...s4,
      protocolCode: role === 'kaptan' ? s4.protocolCode : 'DELTA-3',
      targetEmergencyPsi: role === 'kaptan' ? s4.targetEmergencyPsi : 60,
      protocolRelayBook:
        role === 'kriptolog'
          ? s4.protocolRelayBook
          : {
              'DELTA-3': { seq: ['R1', 'R1', 'R1'], token: '??-??' },
              'SIGMA-7': { seq: ['R1', 'R1', 'R1'], token: '??-??' },
              'OMEGA-9': { seq: ['R1', 'R1', 'R1'], token: '??-??' },
            },
      targetRelaySeq: ['R1', 'R1', 'R1'],
      targetBreachToken: '??-??',
      breachedBulkhead: isDef ? s4.breachedBulkhead : 'B1',
    },
    stage5: {
      ...s5,
      recommendedRoute: role === 'kaptan' ? s5.recommendedRoute : 'ALFA',
      routeSummary:
        role === 'kaptan'
          ? s5.routeSummary
          : 'Tahliye rotası, yakıt ve mandal Komutan konsolundadır.',
      targetFuelPct: role === 'kaptan' ? s5.targetFuelPct : 0,
      targetAuxPower: role === 'kaptan' ? s5.targetAuxPower : 0,
      targetLatchCode: role === 'kaptan' ? s5.targetLatchCode : 'M1',
      routeLaunchCodes:
        role === 'kriptolog'
          ? s5.routeLaunchCodes
          : { ALFA: '?-?-?', BETA: '?-?-?', GAMA: '?-?-?' },
      obstructedHatch: role === 'muhendis' ? s5.obstructedHatch : 'H1',
      hatchPin: role === 'muhendis' ? s5.hatchPin : '??',
      targetLaunchCode: '?-?-?-??',
    },
  };
}

function applyOmegaPenalty(state: MissionState, reason: string): MissionState {
  const nextTime = Math.max(0, state.timeLeftSeconds - 15);
  const nextHull = Math.max(0, state.hullIntegrity - 10);
  const omega = state.omegaData;
  const nextOmega = omega
    ? {
        ...omega,
        teamStats: {
          ...omega.teamStats,
          mistakesCount: omega.teamStats.mistakesCount + 1,
        },
      }
    : undefined;

  const penalized: MissionState = {
    ...state,
    timeLeftSeconds: nextTime,
    hullIntegrity: nextHull,
    omegaData: nextOmega,
    feedbackState: 'error',
    feedbackMessage: `${reason} (-15s Süre, -%10 Bütünlük)`,
  };

  if (nextTime <= 0 || nextHull <= 0) {
    const finalHull = Math.max(0, penalized.hullIntegrity);
    const scoreData = calculateFinalScore(penalized.completedTasksCount || 0, 0, finalHull, 0);
    return {
      ...penalized,
      status: 'phase_result',
      outcomeType: 'basarisizlik',
      rescuedCrewCount: 0,
      timeLeftSeconds: 0,
      hullIntegrity: finalHull,
      finalScore: scoreData.total,
      scoreBreakdown: scoreData.breakdown,
      feedbackState: 'error',
      feedbackMessage:
        nextHull <= 0 ? 'İstasyon gövdesi kritik hasar alarak parçalandı!' : 'Süre tükendi!',
    };
  }
  return penalized;
}

export function applyOmegaAction(
  state: MissionState,
  actionType: string,
  data: any,
  actingRole: Role
): { nextState: MissionState; error?: string } {
  const omega = state.omegaData;
  if (!omega) {
    return { nextState: state, error: 'Takım operasyonu görev verisi başlatılmamış.' };
  }

  const bumpOp = (stats: OmegaTeamData['teamStats'], role: Role): OmegaTeamData['teamStats'] => ({
    ...stats,
    captainOps: stats.captainOps + (role === 'kaptan' ? 1 : 0),
    muhendisOps: stats.muhendisOps + (role === 'muhendis' ? 1 : 0),
    kriptologOps: stats.kriptologOps + (role === 'kriptolog' ? 1 : 0),
    guvenlikOps: stats.guvenlikOps + (role === 'guvenlik' ? 1 : 0),
  });

  const isDefenseRole = (r: Role) =>
    omega.playerCount === 3 ? r === 'kaptan' : r === 'guvenlik';

  // ==================== STAGE 1 ====================
  if (actionType === 'omega_s1_captain_select_sector') {
    if (actingRole !== 'kaptan') return { nextState: state, error: 'Sadece Komutan arızalı sektörü işaretleyebilir.' };
    if (omega.stage1.solved) return { nextState: state };
    const sectorId = data?.sectorId as 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
    if (!SECTOR_IDS.includes(sectorId)) return { nextState: state };

    if (sectorId !== omega.stage1.faultySectorId) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: { ...omega, teamStats: bumpOp(omega.teamStats, actingRole) },
          },
          `Yanlış sektör (${sectorId}) seçildi! Mühendisten 5 sektörün tüm değerlerini tekrar isteyin.`
        ),
      };
    }

    return {
      nextState: finalizeStage1IfReady(
        state,
        {
          ...omega,
          stage1: { ...omega.stage1, captainSelectedSector: sectorId },
          teamStats: bumpOp(omega.teamStats, actingRole),
        },
        `${sectorId} arızalı doğrulandı! 4 glif sembolünü Kriptologa okuyun.`
      ).nextState,
    };
  }

  if (actionType === 'omega_s1_kriptolog_submit_pin') {
    if (actingRole !== 'kriptolog') return { nextState: state, error: 'Sadece Kriptolog 4 haneli PIN kilidini girebilir.' };
    if (omega.stage1.solved) return { nextState: state };
    const pin = String(data?.pin || '').replace(/[^0-9]/g, '').slice(0, 4);
    if (pin.length < 4) {
      return { nextState: { ...state, feedbackState: 'incomplete', feedbackMessage: '4 haneli dönüştürülmüş PIN kodunu girin.' } };
    }

    if (pin !== omega.stage1.targetPin) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: { ...omega, teamStats: bumpOp(omega.teamStats, actingRole) },
          },
          'Glif matrisi veya dönüşüm kuralı hatalı! Komutan ile 4 sembolü yeniden kontrol edin.'
        ),
      };
    }

    return finalizeStage1IfReady(
      state,
      {
        ...omega,
        stage1: { ...omega.stage1, kriptologSubmittedPin: pin },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      '4 haneli PIN doğrulandı! Valf açısı + pompa debisini Mühendise, polarite + alt kanalı savunmaya bildirin.'
    );
  }

  if (actionType === 'omega_s1_muhendis_set_valve') {
    if (actingRole !== 'muhendis') return { nextState: state, error: 'Sadece Mühendis valf ve pompayı ayarlayabilir.' };
    if (omega.stage1.solved) return { nextState: state };
    const angle = Number(data?.angle) as 45 | 90 | 135 | 180;
    const pumpTier = Number(data?.pumpTier ?? omega.stage1.muhendisPumpTier) as 1 | 2 | 3 | 4 | 5;
    const purge = Boolean(data?.purge);
    const validAngle = [45, 90, 135, 180].includes(angle) ? angle : omega.stage1.muhendisValveAngle;
    const validPump = [1, 2, 3, 4, 5].includes(pumpTier) ? pumpTier : omega.stage1.muhendisPumpTier;

    if (purge && (validAngle !== omega.stage1.targetValveAngle || validPump !== omega.stage1.targetPumpTier)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage1: { ...omega.stage1, muhendisValveAngle: validAngle, muhendisPumpTier: validPump, muhendisPurgeReady: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Valf açısı veya pompa debisi yanlış! Kriptologdan açıyı ve pompa kademesini (1-5) teyit edin.'
        ),
      };
    }

    return finalizeStage1IfReady(
      state,
      {
        ...omega,
        stage1: { ...omega.stage1, muhendisValveAngle: validAngle, muhendisPumpTier: validPump, muhendisPurgeReady: purge },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      purge ? `Mühendis ${validAngle}° valf + Kademe-${validPump} pompayı kilitledi!` : `Valf ${validAngle}° / Pompa ${validPump} ayarlandı.`
    );
  }

  if (actionType === 'omega_s1_defense_lock_shield') {
    if (!isDefenseRole(actingRole)) {
      return { nextState: state, error: omega.playerCount === 3 ? '3 kişilik modda kalkan kilidini Komutan yönetir.' : 'Sadece Güvenlik Şefi kalkan kilidini açabilir.' };
    }
    if (omega.stage1.solved) return { nextState: state };
    const polarity = data?.polarity as 'ALFA' | 'BETA' | 'GAMA';
    const subChannel = (data?.subChannel || omega.stage1.shieldSubChannel) as 'X1' | 'X2' | 'X3';
    const unlock = Boolean(data?.unlock);
    if (!POLARITIES.includes(polarity)) return { nextState: state };

    if (unlock && (polarity !== omega.stage1.targetPolarity || subChannel !== omega.stage1.targetSubChannel)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage1: {
                ...omega.stage1,
                shieldPolarity: polarity,
                shieldSubChannel: SUB_CHANNELS.includes(subChannel) ? subChannel : omega.stage1.shieldSubChannel,
                shieldSafetyUnlocked: false,
              },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Yanlış polarite veya alt kanal seçildi!'
        ),
      };
    }

    return finalizeStage1IfReady(
      state,
      {
        ...omega,
        stage1: {
          ...omega.stage1,
          shieldPolarity: polarity,
          shieldSubChannel: SUB_CHANNELS.includes(subChannel) ? subChannel : omega.stage1.shieldSubChannel,
          shieldSafetyUnlocked: unlock,
        },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      unlock ? `Kalkan (${polarity} / ${subChannel}) kilitlendi!` : `Polarite ${polarity} seçildi.`
    );
  }

  // ==================== STAGE 2: Harmonik Frekans ====================
  if (actionType === 'omega_s2_captain_confirm_wave') {
    if (actingRole !== 'kaptan') return { nextState: state, error: 'Sadece Komutan dalga profilini onaylayabilir.' };
    if (omega.stage2.solved) return { nextState: state };
    return finalizeStage2IfReady(
      state,
      {
        ...omega,
        stage2: { ...omega.stage2, captainWaveConfirmed: true },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      'Komutan harmonik osilatör ve bant anahtarını onayladı.'
    );
  }

  if (actionType === 'omega_s2_muhendis_tune') {
    if (actingRole !== 'muhendis') return { nextState: state, error: 'Sadece Mühendis osilatörleri ayarlayabilir.' };
    if (omega.stage2.solved) return { nextState: state };
    const oscA = Math.max(1, Math.min(9, Math.round(Number(data?.oscA ?? omega.stage2.muhendisOscA))));
    const oscB = Math.max(1, Math.min(9, Math.round(Number(data?.oscB ?? omega.stage2.muhendisOscB))));
    const lock = Boolean(data?.lock);

    if (lock && (oscA !== omega.stage2.targetOscA || oscB !== omega.stage2.targetOscB)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage2: { ...omega.stage2, muhendisOscA: oscA, muhendisOscB: oscB, muhendisTuned: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Osilatör A/B harmonik değerleri Komutan hedefleriyle uyuşmuyor!'
        ),
      };
    }

    return finalizeStage2IfReady(
      state,
      {
        ...omega,
        stage2: { ...omega.stage2, muhendisOscA: oscA, muhendisOscB: oscB, muhendisTuned: lock },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Osilatörler senkronize edildi! Parazit ve sapma değerini Kriptologa okuyun.' : 'Osilatörler güncellendi.'
    );
  }

  if (actionType === 'omega_s2_kriptolog_sync') {
    if (actingRole !== 'kriptolog') return { nextState: state, error: 'Sadece Kriptolog rezonans frekansını kilitleyebilir.' };
    if (omega.stage2.solved) return { nextState: state };
    const freqCode = String(data?.freqCode || '').replace(/[^0-9]/g, '').slice(0, 3);
    const pulseMode = data?.pulseMode as 'P-1' | 'P-2' | 'P-3';
    const lock = Boolean(data?.lock);

    if (lock && (freqCode !== omega.stage2.targetFreqCode || pulseMode !== omega.stage2.targetPulseMode)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage2: { ...omega.stage2, kriptologFreqCode: freqCode, kriptologPulseMode: pulseMode || null, kriptologSynced: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Frekans kodu veya darbe modu (P-1/P-2/P-3) hatalı!'
        ),
      };
    }

    return finalizeStage2IfReady(
      state,
      {
        ...omega,
        stage2: { ...omega.stage2, kriptologFreqCode: freqCode, kriptologPulseMode: pulseMode || omega.stage2.kriptologPulseMode, kriptologSynced: lock },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Rezonans frekansı kilitlendi! Filtre rölesini (F1-F3) savunmaya iletin.' : 'Rezonans ayarları güncellendi.'
    );
  }

  if (actionType === 'omega_s2_defense_isolate') {
    if (!isDefenseRole(actingRole)) {
      return { nextState: state, error: omega.playerCount === 3 ? '3 kişilik modda filtre rölesini Komutan kilitler.' : 'Sadece Güvenlik Şefi parazit izolasyonunu kilitleyebilir.' };
    }
    if (omega.stage2.solved) return { nextState: state };
    const source = data?.source as 'IC_HAT' | 'DIS_HAT' | 'CAPRAZ_HAT';
    const filterRelay = data?.filterRelay as 'F1' | 'F2' | 'F3';
    const lock = Boolean(data?.lock);

    if (lock && (source !== omega.stage2.interferenceSource || filterRelay !== omega.stage2.requiredFilterRelay)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage2: { ...omega.stage2, defenseSource: source || null, defenseFilterRelay: filterRelay || null, defenseIsolated: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Parazit hattı veya filtre rölesi (F1-F3) yanlış!'
        ),
      };
    }

    return finalizeStage2IfReady(
      state,
      {
        ...omega,
        stage2: {
          ...omega.stage2,
          defenseSource: INTERFERENCE_SOURCES.includes(source) ? source : omega.stage2.defenseSource,
          defenseFilterRelay: ['F1', 'F2', 'F3'].includes(filterRelay) ? filterRelay : omega.stage2.defenseFilterRelay,
          defenseIsolated: lock,
        },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Parazit izolasyon rölesi kilitlendi!' : 'İzolasyon ayarları güncellendi.'
    );
  }

  // ==================== STAGE 3: 12 MW Güç & Savunma ====================
  if (actionType === 'omega_s3_captain_confirm_orders') {
    if (actingRole !== 'kaptan') return { nextState: state, error: 'Sadece Komutan 12 MW emrini onaylayabilir.' };
    if (omega.stage3.solved) return { nextState: state };
    return finalizeStage3IfReady(
      state,
      {
        ...omega,
        stage3: { ...omega.stage3, captainOrderConfirmed: true },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      'Komutan 12 MW güç dağılımını onayladı.'
    );
  }

  if (actionType === 'omega_s3_muhendis_allocate') {
    if (actingRole !== 'muhendis') return { nextState: state, error: 'Sadece Mühendis 12 MW baralarını ayarlayabilir.' };
    if (omega.stage3.solved) return { nextState: state };
    const itki = Math.max(0, Math.min(12, Math.round(Number(data?.itki ?? omega.stage3.muhendisItki))));
    const kalkan = Math.max(0, Math.min(12, Math.round(Number(data?.kalkan ?? omega.stage3.muhendisKalkan))));
    const yasam = Math.max(0, Math.min(12, Math.round(Number(data?.yasam ?? omega.stage3.muhendisYasam))));
    const sogutma = Math.max(0, Math.min(12, Math.round(Number(data?.sogutma ?? omega.stage3.muhendisSogutma))));
    const lock = Boolean(data?.lock);

    if (lock) {
      if (itki + kalkan + yasam + sogutma > omega.stage3.totalBudgetMw) {
        return {
          nextState: applyOmegaPenalty(
            { ...state, omegaData: { ...omega, teamStats: bumpOp(omega.teamStats, actingRole) } },
            `Toplam güç ${omega.stage3.totalBudgetMw} MW sınırını aştı!`
          ),
        };
      }
      if (
        itki !== omega.stage3.targetItki ||
        kalkan !== omega.stage3.targetKalkan ||
        yasam !== omega.stage3.targetYasam ||
        sogutma !== omega.stage3.targetSogutma
      ) {
        return {
          nextState: applyOmegaPenalty(
            {
              ...state,
              omegaData: {
                ...omega,
                stage3: { ...omega.stage3, muhendisItki: itki, muhendisKalkan: kalkan, muhendisYasam: yasam, muhendisSogutma: sogutma, muhendisLocked: false },
                teamStats: bumpOp(omega.teamStats, actingRole),
              },
            },
            '4 baralı 12 MW dağılımı Komutan planıyla eşleşmedi!'
          ),
        };
      }
    }

    return finalizeStage3IfReady(
      state,
      {
        ...omega,
        stage3: { ...omega.stage3, muhendisItki: itki, muhendisKalkan: kalkan, muhendisYasam: yasam, muhendisSogutma: sogutma, muhendisLocked: lock },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Mühendis 12 MW güç şebekesini kilitledi!' : 'Güç baraları güncellendi.'
    );
  }

  if (actionType === 'omega_s3_kriptolog_unlock') {
    if (actingRole !== 'kriptolog') return { nextState: state, error: 'Sadece Kriptolog veri köprüsünü açabilir.' };
    if (omega.stage3.solved) return { nextState: state };
    const checksum = String(data?.checksum || '').replace(/[^0-9]/g, '').slice(0, 3);
    const band = data?.band as 'HF-1' | 'HF-2' | 'HF-3' | 'HF-4';
    const lock = Boolean(data?.lock);

    if (lock && (band !== omega.stage3.carrierBand || checksum !== omega.stage3.targetChecksum)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage3: { ...omega.stage3, kriptologChecksum: checksum, kriptologBand: band || null, kriptologLocked: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Sağlama kodu veya taşıyıcı bant (HF-1..4) hatalı!'
        ),
      };
    }

    return finalizeStage3IfReady(
      state,
      {
        ...omega,
        stage3: {
          ...omega.stage3,
          kriptologChecksum: checksum,
          kriptologBand: ['HF-1', 'HF-2', 'HF-3', 'HF-4'].includes(band) ? band : omega.stage3.kriptologBand,
          kriptologLocked: lock,
        },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Kriptolog 12 MW veri köprüsünü kilitledi!' : 'Veri köprüsü değerleri güncellendi.'
    );
  }

  if (actionType === 'omega_s3_defense_lock') {
    if (!isDefenseRole(actingRole)) {
      return { nextState: state, error: omega.playerCount === 3 ? '3 kişilik modda tehdit savunmasını Komutan kilitler.' : 'Sadece Güvenlik Şefi savunma kalkanını kilitleyebilir.' };
    }
    if (omega.stage3.solved) return { nextState: state };
    const quadrant = data?.quadrant as 'KUZEY' | 'DOGU' | 'GUNEY' | 'BATI';
    const firewallLevel = Number(data?.firewallLevel) as 1 | 2 | 3 | 4;
    const cipherTag = data?.cipherTag as 'A' | 'B' | 'C' | 'D';
    const lock = Boolean(data?.lock);

    if (
      lock &&
      (quadrant !== omega.stage3.threatQuadrant ||
        firewallLevel !== omega.stage3.requiredFirewallLevel ||
        cipherTag !== omega.stage3.secondaryCipherTag)
    ) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage3: {
                ...omega.stage3,
                defenseQuadrant: QUADRANTS.includes(quadrant) ? quadrant : omega.stage3.defenseQuadrant,
                defenseFirewallLevel: [1, 2, 3, 4].includes(firewallLevel) ? firewallLevel : omega.stage3.defenseFirewallLevel,
                defenseCipherTag: CIPHER_TAGS.includes(cipherTag) ? cipherTag : omega.stage3.defenseCipherTag,
                defenseLocked: false,
              },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Tehdit kadranı, güvenlik duvarı (1-4) veya ikincil doğrulama etiketi (A-D) hatalı!'
        ),
      };
    }

    return finalizeStage3IfReady(
      state,
      {
        ...omega,
        stage3: {
          ...omega.stage3,
          defenseQuadrant: QUADRANTS.includes(quadrant) ? quadrant : omega.stage3.defenseQuadrant,
          defenseFirewallLevel: [1, 2, 3, 4].includes(firewallLevel) ? firewallLevel : omega.stage3.defenseFirewallLevel,
          defenseCipherTag: CIPHER_TAGS.includes(cipherTag) ? cipherTag : omega.stage3.defenseCipherTag,
          defenseLocked: lock,
        },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Sektör savunması ve ikincil kilit mühürlendi!' : 'Savunma parametreleri güncellendi.'
    );
  }

  // ==================== STAGE 4: Acil Kriz & Sıralı Röle ====================
  if (actionType === 'omega_s4_captain_authorize') {
    if (actingRole !== 'kaptan') return { nextState: state, error: 'Sadece Komutan acil kriz protokolünü onaylayabilir.' };
    if (omega.stage4.solved) return { nextState: state };
    return finalizeStage4IfReady(
      state,
      {
        ...omega,
        stage4: { ...omega.stage4, captainAuthorized: true },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      `Komutan ${omega.stage4.protocolCode} acil yetkisini verdi! Kriptologdan şalter sırasını alın.`
    );
  }

  if (actionType === 'omega_s4_kriptolog_override') {
    if (actingRole !== 'kriptolog') return { nextState: state, error: 'Sadece Kriptolog bypass tokenını girebilir.' };
    if (omega.stage4.solved) return { nextState: state };
    const token = String(data?.token || '').toUpperCase().trim();
    const lock = Boolean(data?.lock);

    if (lock && token !== omega.stage4.targetBreachToken) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage4: { ...omega.stage4, kriptologBreachToken: token, kriptologOverridden: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Protokol kodu yanlış veya geçersiz bypass token!'
        ),
      };
    }

    return finalizeStage4IfReady(
      state,
      {
        ...omega,
        stage4: { ...omega.stage4, kriptologBreachToken: token, kriptologOverridden: lock },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Bypass token kilitlendi! 3 şalter sırasını Mühendise, tokenı savunmaya okuyun.' : 'Token girildi.'
    );
  }

  if (actionType === 'omega_s4_muhendis_stabilize') {
    if (actingRole !== 'muhendis') return { nextState: state, error: 'Sadece Mühendis şalter zincirini kilitleyebilir.' };
    if (omega.stage4.solved) return { nextState: state };
    const relaySeq: Array<'R1' | 'R2' | 'R3'> = Array.isArray(data?.relaySeq)
      ? data.relaySeq.filter((r: any) => r === 'R1' || r === 'R2' || r === 'R3').slice(0, 3)
      : omega.stage4.muhendisRelaySeq;
    const psi = Number(data?.emergencyPsi ?? omega.stage4.muhendisEmergencyPsi);
    const lock = Boolean(data?.lock);

    if (lock) {
      const seqMatch =
        relaySeq.length === 3 &&
        relaySeq[0] === omega.stage4.targetRelaySeq[0] &&
        relaySeq[1] === omega.stage4.targetRelaySeq[1] &&
        relaySeq[2] === omega.stage4.targetRelaySeq[2];
      if (!seqMatch || psi !== omega.stage4.targetEmergencyPsi) {
        return {
          nextState: applyOmegaPenalty(
            {
              ...state,
              omegaData: {
                ...omega,
                stage4: { ...omega.stage4, muhendisRelaySeq: [], muhendisEmergencyPsi: psi, muhendisStabilized: false },
                teamStats: bumpOp(omega.teamStats, actingRole),
              },
            },
            '3 şalter sırası veya acil basınç (PSI) hatalı! Sıra sıfırlandı.'
          ),
        };
      }
    }

    return finalizeStage4IfReady(
      state,
      {
        ...omega,
        stage4: { ...omega.stage4, muhendisRelaySeq: relaySeq, muhendisEmergencyPsi: psi, muhendisStabilized: lock },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? 'Sıralı röle zinciri ve acil basınç stabilize edildi!' : 'Röle sırası güncellendi.'
    );
  }

  if (actionType === 'omega_s4_defense_contain') {
    if (!isDefenseRole(actingRole)) {
      return { nextState: state, error: omega.playerCount === 3 ? '3 kişilik modda gövde yamasını Komutan kilitler.' : 'Sadece Güvenlik Şefi gövde ihlalini izole edebilir.' };
    }
    if (omega.stage4.solved) return { nextState: state };
    const bulkhead = data?.bulkhead as 'B1' | 'B2' | 'B3' | 'B4';
    const tokenInput = String(data?.tokenInput || '').toUpperCase().trim();
    const lock = Boolean(data?.lock);

    if (lock && (bulkhead !== omega.stage4.breachedBulkhead || tokenInput !== omega.stage4.targetBreachToken)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage4: { ...omega.stage4, defenseBulkhead: bulkhead || null, defenseTokenInput: tokenInput, defenseContained: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Hasarlı bölme (B1-B4) veya Kriptolog ihlal tokenı yanlış!'
        ),
      };
    }

    return finalizeStage4IfReady(
      state,
      {
        ...omega,
        stage4: {
          ...omega.stage4,
          defenseBulkhead: BULKHEADS.includes(bulkhead) ? bulkhead : omega.stage4.defenseBulkhead,
          defenseTokenInput: tokenInput,
          defenseContained: lock,
        },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? `Bölme ${bulkhead} mühürlendi ve kriz bastırıldı!` : 'İhlal bölmesi güncellendi.'
    );
  }

  // ==================== STAGE 5: Çift Kilitli Tahliye ====================
  if (actionType === 'omega_s5_captain_route') {
    if (actingRole !== 'kaptan') return { nextState: state, error: 'Sadece Komutan tahliye rotasını kilitleyebilir.' };
    if (omega.stage5.solved) return { nextState: state };
    const route = data?.route as 'ALFA' | 'BETA' | 'GAMA';
    const lock = Boolean(data?.lock);

    if (lock && route !== omega.stage5.recommendedRoute) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage5: { ...omega.stage5, captainSelectedRoute: ROUTES.includes(route) ? route : null, captainFinalLocked: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Önerilen güvenli tahliye rotası dışında rota kilitlenemez!'
        ),
      };
    }

    return finalizeStage5IfReady(
      state,
      {
        ...omega,
        stage5: { ...omega.stage5, captainSelectedRoute: ROUTES.includes(route) ? route : omega.stage5.captainSelectedRoute, captainFinalLocked: lock },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      lock ? `Rota ${route} kilitlendi! Yakıt, yardımcı itki ve M-mandalını ekibe bildirin.` : `Tahliye rotası ${route} seçildi.`
    );
  }

  if (actionType === 'omega_s5_muhendis_fuel') {
    if (actingRole !== 'muhendis') return { nextState: state, error: 'Sadece Mühendis yakıt ve yardımcı itkiyi ayarlayabilir.' };
    if (omega.stage5.solved) return { nextState: state };
    const fuelPct = Math.max(20, Math.min(100, Math.round(Number(data?.fuelPct ?? omega.stage5.muhendisFuelPct))));
    const auxPower = Math.max(10, Math.min(60, Math.round(Number(data?.auxPower ?? omega.stage5.muhendisAuxPower))));
    const arm = Boolean(data?.arm);

    if (arm && (fuelPct !== omega.stage5.targetFuelPct || auxPower !== omega.stage5.targetAuxPower)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage5: { ...omega.stage5, muhendisFuelPct: fuelPct, muhendisAuxPower: auxPower, muhendisThrusterArmed: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Ana yakıt veya yardımcı itki yüzdesi seçilen rota gereksinimiyle uyuşmuyor!'
        ),
      };
    }

    return finalizeStage5IfReady(
      state,
      {
        ...omega,
        stage5: { ...omega.stage5, muhendisFuelPct: fuelPct, muhendisAuxPower: auxPower, muhendisThrusterArmed: arm },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      arm ? `Ana iticiler %${fuelPct} / Yardımcı %${auxPower} ile hazır! Kapak & PIN bilgisini ekibe iletin.` : 'İtki oranları güncellendi.'
    );
  }

  if (actionType === 'omega_s5_kriptolog_beacon') {
    if (actingRole !== 'kriptolog') return { nextState: state, error: 'Sadece Kriptolog tam fırlatma işaretçisini gönderebilir.' };
    if (omega.stage5.solved) return { nextState: state };
    const code = String(data?.code || '').toUpperCase().trim();
    const send = Boolean(data?.send);

    if (send && code !== omega.stage5.targetLaunchCode) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage5: { ...omega.stage5, kriptologLaunchCode: code, kriptologBeaconSent: false },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Bileşik fırlatma kodu hatalı! (Format: ROTA_KODU-KAPAK_PIN, örn: 6-A-6-48)'
        ),
      };
    }

    return finalizeStage5IfReady(
      state,
      {
        ...omega,
        stage5: { ...omega.stage5, kriptologLaunchCode: code, kriptologBeaconSent: send },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      send ? 'Tam fırlatma işaretçisi doğrulandı!' : 'İşaretçi kodu girildi.'
    );
  }

  if (actionType === 'omega_s5_defense_hatch') {
    if (!isDefenseRole(actingRole)) {
      return { nextState: state, error: omega.playerCount === 3 ? '3 kişilik modda tahliye kapağını Komutan mühürler.' : 'Sadece Güvenlik Şefi tahliye kapağını mühürleyebilir.' };
    }
    if (omega.stage5.solved) return { nextState: state };
    const hatch = data?.hatch as 'H1' | 'H2' | 'H3' | 'H4';
    const latch = (data?.latch || omega.stage5.defenseLatchCode) as 'M1' | 'M2' | 'M3';
    const seal = Boolean(data?.seal);

    if (seal && (hatch !== omega.stage5.obstructedHatch || latch !== omega.stage5.targetLatchCode)) {
      return {
        nextState: applyOmegaPenalty(
          {
            ...state,
            omegaData: {
              ...omega,
              stage5: {
                ...omega.stage5,
                defenseClearedHatch: HATCHES.includes(hatch) ? hatch : null,
                defenseLatchCode: LATCH_CODES.includes(latch) ? latch : omega.stage5.defenseLatchCode,
                defenseFinalSealed: false,
              },
              teamStats: bumpOp(omega.teamStats, actingRole),
            },
          },
          'Yanlış tahliye kapağı (H1-H4) veya yanlış güvenlik mandalı (M1-M3) seçildi!'
        ),
      };
    }

    return finalizeStage5IfReady(
      state,
      {
        ...omega,
        stage5: {
          ...omega.stage5,
          defenseClearedHatch: HATCHES.includes(hatch) ? hatch : omega.stage5.defenseClearedHatch,
          defenseLatchCode: LATCH_CODES.includes(latch) ? latch : omega.stage5.defenseLatchCode,
          defenseFinalSealed: seal,
        },
        teamStats: bumpOp(omega.teamStats, actingRole),
      },
      seal ? `Tahliye kapağı (${hatch} / ${latch}) mühürlendi!` : 'Kapak ayarları güncellendi.'
    );
  }

  return { nextState: state, error: `Bilinmeyen takım operasyonu aksiyonu: ${actionType}` };
}

function finalizeStage1IfReady(
  state: MissionState,
  omega: OmegaTeamData,
  progressMsg: string
): { nextState: MissionState } {
  const s1 = omega.stage1;
  const isComplete =
    s1.captainSelectedSector === s1.faultySectorId &&
    s1.kriptologSubmittedPin === s1.targetPin &&
    s1.muhendisValveAngle === s1.targetValveAngle &&
    s1.muhendisPumpTier === s1.targetPumpTier &&
    s1.muhendisPurgeReady &&
    s1.shieldPolarity === s1.targetPolarity &&
    s1.shieldSubChannel === s1.targetSubChannel &&
    s1.shieldSafetyUnlocked;

  if (!isComplete) {
    return {
      nextState: {
        ...state,
        omegaData: omega,
        feedbackState: 'idle',
        feedbackMessage: progressMsg,
      },
    };
  }

  return {
    nextState: {
      ...state,
      currentPhaseIndex: 1,
      completedTasksCount: (state.completedTasksCount || 0) + 1,
      omegaData: {
        ...omega,
        activeStage: 2,
        stage1: { ...s1, solved: true },
      },
      feedbackState: 'success',
      feedbackMessage: 'AŞAMA 1 TAMAMLANDI! Sektör sabitlendi; Aşama 2 (Harmonik Frekans) açıldı.',
    },
  };
}

function finalizeStage2IfReady(
  state: MissionState,
  omega: OmegaTeamData,
  progressMsg: string
): { nextState: MissionState } {
  const s2 = omega.stage2;
  const isComplete =
    s2.captainWaveConfirmed &&
    s2.muhendisTuned &&
    s2.muhendisOscA === s2.targetOscA &&
    s2.muhendisOscB === s2.targetOscB &&
    s2.kriptologSynced &&
    s2.kriptologFreqCode === s2.targetFreqCode &&
    s2.kriptologPulseMode === s2.targetPulseMode &&
    s2.defenseIsolated &&
    s2.defenseSource === s2.interferenceSource &&
    s2.defenseFilterRelay === s2.requiredFilterRelay;

  if (!isComplete) {
    return {
      nextState: {
        ...state,
        omegaData: omega,
        feedbackState: 'idle',
        feedbackMessage: progressMsg,
      },
    };
  }

  return {
    nextState: {
      ...state,
      status: 'phase_energy',
      currentPhaseIndex: 2,
      completedTasksCount: (state.completedTasksCount || 0) + 1,
      omegaData: {
        ...omega,
        activeStage: 3,
        stage2: { ...s2, solved: true },
      },
      feedbackState: 'success',
      feedbackMessage: 'AŞAMA 2 TAMAMLANDI! Dalga rezonansı sağlandı; Aşama 3 (12 MW Güç) açıldı.',
    },
  };
}

function finalizeStage3IfReady(
  state: MissionState,
  omega: OmegaTeamData,
  progressMsg: string
): { nextState: MissionState } {
  const s3 = omega.stage3;
  const isComplete =
    s3.captainOrderConfirmed &&
    s3.muhendisLocked &&
    s3.muhendisItki === s3.targetItki &&
    s3.muhendisKalkan === s3.targetKalkan &&
    s3.muhendisYasam === s3.targetYasam &&
    s3.muhendisSogutma === s3.targetSogutma &&
    s3.kriptologLocked &&
    s3.kriptologChecksum === s3.targetChecksum &&
    s3.kriptologBand === s3.carrierBand &&
    s3.defenseLocked &&
    s3.defenseQuadrant === s3.threatQuadrant &&
    s3.defenseFirewallLevel === s3.requiredFirewallLevel &&
    s3.defenseCipherTag === s3.secondaryCipherTag;

  if (!isComplete) {
    return {
      nextState: {
        ...state,
        omegaData: omega,
        feedbackState: 'idle',
        feedbackMessage: progressMsg,
      },
    };
  }

  return {
    nextState: {
      ...state,
      status: 'phase_game',
      currentPhaseIndex: 3,
      completedTasksCount: (state.completedTasksCount || 0) + 1,
      omegaData: {
        ...omega,
        activeStage: 4,
        stage3: { ...s3, solved: true },
      },
      feedbackState: 'success',
      feedbackMessage: 'AŞAMA 3 TAMAMLANDI! 12 MW ağ dengelendi; Aşama 4 (Acil Kriz Müdahalesi) başladı!',
    },
  };
}

function finalizeStage4IfReady(
  state: MissionState,
  omega: OmegaTeamData,
  progressMsg: string
): { nextState: MissionState } {
  const s4 = omega.stage4;
  const isComplete =
    s4.captainAuthorized &&
    s4.kriptologOverridden &&
    s4.kriptologBreachToken === s4.targetBreachToken &&
    s4.muhendisStabilized &&
    s4.muhendisEmergencyPsi === s4.targetEmergencyPsi &&
    s4.muhendisRelaySeq.length === 3 &&
    s4.muhendisRelaySeq[0] === s4.targetRelaySeq[0] &&
    s4.muhendisRelaySeq[1] === s4.targetRelaySeq[1] &&
    s4.muhendisRelaySeq[2] === s4.targetRelaySeq[2] &&
    s4.defenseContained &&
    s4.defenseBulkhead === s4.breachedBulkhead &&
    s4.defenseTokenInput === s4.targetBreachToken;

  if (!isComplete) {
    return {
      nextState: {
        ...state,
        omegaData: omega,
        feedbackState: 'idle',
        feedbackMessage: progressMsg,
      },
    };
  }

  return {
    nextState: {
      ...state,
      status: 'phase_rescue',
      currentPhaseIndex: 4,
      completedTasksCount: (state.completedTasksCount || 0) + 1,
      omegaData: {
        ...omega,
        activeStage: 5,
        stage4: { ...s4, solved: true },
      },
      feedbackState: 'success',
      feedbackMessage: 'AŞAMA 4 TAMAMLANDI! Kriz bastırıldı; Son Tahliye (Aşama 5) açıldı.',
    },
  };
}

function finalizeStage5IfReady(
  state: MissionState,
  omega: OmegaTeamData,
  progressMsg: string
): { nextState: MissionState } {
  const s5 = omega.stage5;
  const isComplete =
    s5.captainFinalLocked &&
    s5.captainSelectedRoute === s5.recommendedRoute &&
    s5.muhendisThrusterArmed &&
    s5.muhendisFuelPct === s5.targetFuelPct &&
    s5.muhendisAuxPower === s5.targetAuxPower &&
    s5.kriptologBeaconSent &&
    s5.kriptologLaunchCode === s5.targetLaunchCode &&
    s5.defenseFinalSealed &&
    s5.defenseClearedHatch === s5.obstructedHatch &&
    s5.defenseLatchCode === s5.targetLatchCode;

  if (!isComplete) {
    return {
      nextState: {
        ...state,
        omegaData: omega,
        feedbackState: 'idle',
        feedbackMessage: progressMsg,
      },
    };
  }

  const crewCount = omega.playerCount === 4 ? 16 : 12;
  const completedCount = 5;
  const scoreData = calculateFinalScore(
    completedCount,
    state.timeLeftSeconds,
    state.hullIntegrity,
    crewCount
  );
  const meta = getTeamOperationMeta(omega.themeId);

  return {
    nextState: {
      ...state,
      status: 'phase_result',
      currentPhaseIndex: 5,
      completedTasksCount: completedCount,
      rescuedCrewCount: crewCount,
      outcomeType: 'tam_basari',
      finalScore: scoreData.total,
      scoreBreakdown: scoreData.breakdown,
      omegaData: {
        ...omega,
        stage5: { ...s5, solved: true },
      },
      feedbackState: 'success',
      feedbackMessage: `${meta.shortTitle} TAHLİYE BAŞARILI! ${omega.playerCount} kişilik ekip 5/5 görevi tamamladı.`,
    },
  };
}
