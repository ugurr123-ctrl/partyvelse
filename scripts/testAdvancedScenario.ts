import { createInitialMissionState } from '../src/services/gameFactory';
import { applyAdvancedAction } from '../src/services/advancedScenarioLogic';
import { LostSignalRoom } from '../server/LostSignalRoom';
import { MissionState, Role } from '../src/types/game';

console.log('======================================================================');
console.log('🚀 PARTYVERSE - GELİŞMİŞ TAKTİK SENARYOSU: ÇÖKÜŞ EŞİĞİ DOĞRULAMA TESTİ');
console.log('======================================================================\n');

let passCount = 0;
const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    console.error(`  ❌ HATA: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}`);
  passCount++;
};

// -----------------------------------------------------------------------------
// [TEST 1] Senaryo Başlatma ve Mod Değişimi
// -----------------------------------------------------------------------------
console.log('▶ [TEST 1] Senaryo Başlatma ve Mod Değişimi...');
let state = createInitialMissionState('KYP-TEST', 'kayip_sinyal', 'Kaptan Ece');
assert(state.gameMode === 'standart', 'Varsayılan mod standart olarak başlar');
assert(!!state.advancedScenario, 'Gelişmiş senaryo veri modeli hazırlandı');

state = { ...state, gameMode: 'gelismis', status: 'phase_game' };
assert(state.gameMode === 'gelismis', 'Gelişmiş Taktik Moduna geçildi');

// -----------------------------------------------------------------------------
// [TEST 2] Eşzamanlı Sekmeler ve İlerlemenin Korunması
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 2] Eşzamanlı Sekmeler ve İlerlemenin Korunması...');
const tabRes1 = applyAdvancedAction(state, 'advanced_tab_change', { tab: 'sinyal' }, 'kaptan');
assert(tabRes1.nextState.advancedScenario?.activeSubsystemTab === 'sinyal', 'Sinyal sekmesine geçildi');

// Set airlock parameters on airlock tab
const alRes = applyAdvancedAction(tabRes1.nextState, 'advanced_airlock_params', { dialIndex: 2, vacuum: 75 }, 'muhendis');
assert(alRes.nextState.advancedScenario?.subsystems.hava_kilidi.currentDialIndex === 2, 'Hava kilidi kadranı (2) kaydedildi');
assert(alRes.nextState.advancedScenario?.subsystems.hava_kilidi.currentVacuum === 75, 'Hava kilidi vakumu (75) kaydedildi');

// Switch to reaktor tab and ensure airlock parameters remain untouched
const tabRes2 = applyAdvancedAction(alRes.nextState, 'advanced_tab_change', { tab: 'reaktor' }, 'kaptan');
assert(tabRes2.nextState.advancedScenario?.activeSubsystemTab === 'reaktor', 'Reaktör sekmesine geçildi');
assert(tabRes2.nextState.advancedScenario?.subsystems.hava_kilidi.currentDialIndex === 2, 'Sekme değişince hava kilidi kadranı kaybolmadı');
assert(tabRes2.nextState.advancedScenario?.subsystems.hava_kilidi.currentVacuum === 75, 'Sekme değişince hava kilidi vakumu kaybolmadı');

// -----------------------------------------------------------------------------
// [TEST 3] Bilgi Asimetrisi Doğrulaması (Kaptana Doğrudan Cevap Yok)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 3] Bilgi Asimetrisi Doğrulaması (Kaptana Doğrudan Cevap Yok)...');
const room = new LostSignalRoom();
room.missionState = { ...state, advancedScenario: tabRes2.nextState.advancedScenario };

const captainView = room.getFilteredStateForRole('kaptan');
const engineerView = room.getFilteredStateForRole('muhendis');

assert(captainView.advancedScenario?.subsystems.reaktor.targetBreaker === undefined, 'Kaptana doğru reaktör kesici cevabı GİZLENDİ');
assert(captainView.advancedScenario?.subsystems.sinyal.targetFrequency === '??? MHz', 'Kaptana doğru sinyal frekans cevabı GİZLENDİ');
assert(captainView.advancedScenario?.subsystems.hava_kilidi.targetDialIndex === -1, 'Kaptana hava kilidi doğru kadranı GİZLENDİ');
assert(captainView.advancedScenario?.subsystems.reaktor.liveTelemetry.coreTemp === 0, 'Kaptana canlı çekirdek ısı göstergesi GİZLENDİ (Mühendis okumalı)');

assert(engineerView.advancedScenario?.subsystems.reaktor.liveTelemetry.coreTemp === 84, 'Mühendise çekirdek ısısı (84°C) iletildi');
assert(engineerView.advancedScenario?.subsystems.reaktor.liveTelemetry.coolantPressure === 38, 'Mühendise soğutucu basıncı (38 kPa) iletildi');
assert(engineerView.advancedScenario?.subsystems.hava_kilidi.externalPressureKpa === 36, 'Mühendise dış sensör basıncı (36 kPa) iletildi');
assert(engineerView.advancedScenario?.subsystems.sinyal.symbols[0] === '?', 'Mühendise kaptanın şifre tablosu sembolleri GİZLENDİ');

// -----------------------------------------------------------------------------
// [TEST 4] Güç Matrisi & Sistem Bağımlılıkları
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 4] Güç Matrisi & Sistem Bağımlılıkları...');
// Total budget is 10 MW. Trying to set 12 MW should be rejected.
const overBudgetRes = applyAdvancedAction(
  state,
  'advanced_set_power',
  { coolingPumps: 5, antennaBooster: 4, airlockCompressor: 3 }, // 12 MW
  'kaptan'
);
assert(!!overBudgetRes.error, '10 MW üzeri aşırı güç tahsisi engellendi');

// If antenna is unpowered (< 3 MW), signal lock fails
const lowAntennaState = applyAdvancedAction(
  state,
  'advanced_set_power',
  { coolingPumps: 4, antennaBooster: 2, airlockCompressor: 3, shieldReserve: 1 },
  'kaptan'
).nextState;
assert(lowAntennaState.advancedScenario?.subsystems.sinyal.noiseLevel === 85, 'Anten < 3 MW iken parazit %85 oldu');

const lockAttempt = applyAdvancedAction(lowAntennaState, 'advanced_signal_tune', { freq: '143.6 MHz' }, 'muhendis');
assert(!!lockAttempt.error, 'Anten gücü yetersizken frekans kilitleme engellendi');

// Allocate sufficient antenna power (>= 3 MW)
const goodAntennaState = applyAdvancedAction(
  lowAntennaState,
  'advanced_set_power',
  { coolingPumps: 4, antennaBooster: 3, airlockCompressor: 3, shieldReserve: 0 },
  'kaptan'
).nextState;
assert(goodAntennaState.advancedScenario?.subsystems.sinyal.noiseLevel === 4, 'Anten 3 MW iken parazit %4 e düştü');

// -----------------------------------------------------------------------------
// [TEST 5] Önceden Uyarılan Olay (Plazma Dalgası) & Karara Tepki
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 5] Önceden Uyarılan Olay (Plazma Dalgası) & Karara Tepki...');
let eventState = { ...goodAntennaState };
eventState.advancedScenario!.event.isActive = true;

// Option B: Vent radiators (-5% hull)
const ventRes = applyAdvancedAction(eventState, 'advanced_event_react', { reaction: 'tahliye' }, 'muhendis');
assert(ventRes.nextState.advancedScenario?.event.isResolved === true, 'Plazma dalgası tahliye kararıyla çözüldü');
assert(ventRes.nextState.hullIntegrity === 95, 'Tahliye gövdede sadece %5 sürtünme hasarı bıraktı (100 -> 95)');

// Option A: Shield defense (requires 3 MW in reserve)
let shieldState = applyAdvancedAction(
  goodAntennaState,
  'advanced_set_power',
  { coolingPumps: 4, antennaBooster: 3, airlockCompressor: 0, shieldReserve: 3 },
  'kaptan'
).nextState;
shieldState.advancedScenario!.event.isActive = true;
const shieldRes = applyAdvancedAction(shieldState, 'advanced_event_react', { reaction: 'kalkan' }, 'kaptan');
assert(shieldRes.nextState.advancedScenario?.event.isResolved === true, 'Plazma dalgası kalkanla çözüldü');
assert(shieldRes.nextState.hullIntegrity === 100, 'Kalkan savunması gövdeye sıfır hasar verdi (%100 korundu)');

// -----------------------------------------------------------------------------
// [TEST 6] Çözüm Yolu 1: Rota Alfa (Tam Tahliye - 10 Mürettebat)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 6] Çözüm Yolu 1: Rota Alfa (Tam Tahliye - 10 Mürettebat)...');
let path1 = createInitialMissionState('KYP-PATH1', 'kayip_sinyal', 'Kaptan Ece');
path1 = { ...path1, gameMode: 'gelismis', status: 'phase_game' };

// 1. Set optimal power grid (Cooling: 4, Antenna: 3, Compressor: 3)
path1 = applyAdvancedAction(path1, 'advanced_set_power', { coolingPumps: 4, antennaBooster: 3, airlockCompressor: 3, shieldReserve: 0 }, 'kaptan').nextState;

// 2. Solve Reactor (Breaker K2 + Purge Anten)
path1 = applyAdvancedAction(path1, 'advanced_reactor_breaker', { breaker: 'K2' }, 'kaptan').nextState;
path1 = applyAdvancedAction(path1, 'advanced_reactor_purge', { line: 'anten' }, 'muhendis').nextState;
assert(path1.advancedScenario?.subsystems.reaktor.isStabilized === true, 'Çözüm 1: Reaktör stabilize edildi (Isı: 58°C)');

// 3. Solve Signal (143.6 MHz)
path1 = applyAdvancedAction(path1, 'advanced_signal_tune', { freq: '143.6 MHz' }, 'muhendis').nextState;
assert(path1.advancedScenario?.subsystems.sinyal.isLocked === true, 'Çözüm 1: Sinyal USS Aurora ya kilitlendi');

// 4. Solve Airlock (Dial 2 + Vacuum 75)
path1 = applyAdvancedAction(path1, 'advanced_airlock_params', { dialIndex: 2, vacuum: 75 }, 'muhendis').nextState;
path1 = applyAdvancedAction(path1, 'advanced_airlock_seal', {}, 'muhendis').nextState;
assert(path1.advancedScenario?.subsystems.hava_kilidi.isSealed === true, 'Çözüm 1: Hava kilidi mühürlendi');

// 5. Dual approval on Route Alfa
path1 = applyAdvancedAction(path1, 'advanced_rescue_select', { routeId: 'alfa' }, 'kaptan').nextState;
path1 = applyAdvancedAction(path1, 'advanced_rescue_approve', {}, 'kaptan').nextState;
assert(path1.status === 'phase_game', 'Yalnızca Kaptan onaylayınca tahliye henüz başlamadı');

path1 = applyAdvancedAction(path1, 'advanced_rescue_approve', {}, 'muhendis').nextState;
assert(path1.status === 'phase_result', 'İki rol de onaylayınca tahliye tamamlandı (phase_result)');
assert(path1.rescuedCrewCount === 10, 'Rota Alfa ile 10 personelin tamamı kurtarıldı');
assert(path1.outcomeType === 'tam_basari', 'Görev sonucu: TAM BAŞARI');

// -----------------------------------------------------------------------------
// [TEST 7] Çözüm Yolu 2: Rota Beta (Hızlı Kaçış - 8 Mürettebat)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 7] Çözüm Yolu 2: Rota Beta (Hızlı Kaçış - 8 Mürettebat)...');
let path2 = createInitialMissionState('KYP-PATH2', 'kayip_sinyal', 'Kaptan Ece');
path2 = { ...path2, gameMode: 'gelismis', status: 'phase_game' };

// In Path 2, team does NOT repair the airlock, focusing power on Reactor (4 MW) and Antenna (3 MW) and Shield (3 MW)
path2 = applyAdvancedAction(path2, 'advanced_set_power', { coolingPumps: 4, antennaBooster: 3, airlockCompressor: 0, shieldReserve: 3 }, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_reactor_breaker', { breaker: 'K2' }, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_reactor_purge', { line: 'anten' }, 'muhendis').nextState;
path2 = applyAdvancedAction(path2, 'advanced_signal_tune', { freq: '143.6 MHz' }, 'muhendis').nextState;

assert(path2.advancedScenario?.subsystems.hava_kilidi.isSealed === false, 'Çözüm 2: Hava kilidi mühürlenmedi (zaman/güç tasarrufu)');

// Dual approval on Route Beta
path2 = applyAdvancedAction(path2, 'advanced_rescue_select', { routeId: 'beta' }, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_rescue_approve', {}, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_rescue_approve', {}, 'muhendis').nextState;

assert(path2.status === 'phase_result', 'Rota Beta başarıyla tamamlandı');
assert(path2.rescuedCrewCount === 8, 'Hava kilidine ihtiyaç duymadan 8 mürettebat kurtarıldı');
assert(path2.outcomeType === 'tam_basari', 'Stabil reaktör ve kilitli sinyal ile Rota Beta TAM BAŞARI sağladı');

console.log('\n======================================================================');
console.log(`📊 GELİŞMİŞ TAKTİK SENARYOSU DOĞRULAMA TEST SONUCU: ${passCount}/${passCount} BAŞARILI`);
console.log('✅ EŞZAMANLI SİSTEMLER, GÜÇ MATRİSİ, BİLGİ ASİMETRİSİ VE HER İKİ ÇÖZÜM YOLU ÇALIŞIYOR!');
console.log('======================================================================');
