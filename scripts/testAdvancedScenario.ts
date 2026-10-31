import { createInitialMissionState } from '../src/services/gameFactory';
import { applyAdvancedAction } from '../src/services/advancedScenarioLogic';
import { LostSignalRoom } from '../server/LostSignalRoom';
import { MissionState, Role } from '../src/types/game';

console.log('======================================================================');
console.log('🚀 PARTYVERSE - GELİŞMİŞ TAKTİK SENARYOSU: KATI ZORUNLULUK & TEST SETİ');
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
// [TEST 4] Sınırlı Başlangıç Enerjisi (7 MW) & Güç Aktarımı Zorunluluğu
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 4] Sınırlı Başlangıç Enerjisi (7 MW) & Güç Aktarımı Zorunluluğu...');
assert(state.advancedScenario?.powerGrid.totalBudget === 7, 'Toplam enerji bütçesi 7 MW dır');
assert(state.advancedScenario?.powerGrid.coolingPumps === 4, 'Başlangıçta Soğutma 4 MW dır');
assert(state.advancedScenario?.powerGrid.antennaBooster === 2, 'Başlangıçta Anten 2 MW dır (< 3 MW eşiği)');
assert(state.advancedScenario?.powerGrid.airlockCompressor === 1, 'Başlangıçta Kompresör 1 MW dır (< 3 MW eşiği)');
assert(state.advancedScenario?.subsystems.sinyal.noiseLevel === 85, 'Anten 2 MW iken parazit %85 dir');

// 3 kritik sistemi aynı anda tam güçte (4 + 3 + 3 = 10 MW) çalıştırma denemesi reddedilmelidir
const overBudgetRes = applyAdvancedAction(
  state,
  'advanced_set_power',
  { coolingPumps: 4, antennaBooster: 3, airlockCompressor: 3 }, // 10 MW > 7 MW
  'kaptan'
);
assert(!!overBudgetRes.error, 'Aynı anda 3 sistemi besleme girişimi (10 MW > 7 MW) başarıyla engellendi');

// Anten başlangıçta 2 MW iken frekans kilitleme denemesi engellenmelidir
const startTuneAttempt = applyAdvancedAction(state, 'advanced_signal_tune', { freq: '143.6 MHz' }, 'muhendis');
assert(!!startTuneAttempt.error, 'Başlangıç gücünde (2 MW) sinyal kilitleme engellendi (Güç aktarımı şart)');

// -----------------------------------------------------------------------------
// [TEST 5] Kestirmelerin Reddedilmesi (Sıfır Hazırlık / Eksik Sistem Koruması)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 5] Kestirmelerin Reddedilmesi (Sıfır Hazırlık & Eksik Sistem Koruması)...');
let freshState = createInitialMissionState('KYP-FRESH', 'kayip_sinyal', 'Kaptan Ece');
freshState = { ...freshState, gameMode: 'gelismis', status: 'phase_game' };

// KESTİRME 1: Sıfır hazırlıkla Rota Alfa denemesi reddedilmelidir
freshState = applyAdvancedAction(freshState, 'advanced_rescue_select', { routeId: 'alfa' }, 'kaptan').nextState;
freshState = applyAdvancedAction(freshState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const alfaShortcut = applyAdvancedAction(freshState, 'advanced_rescue_approve', {}, 'muhendis');
assert(!!alfaShortcut.error, 'Sıfır hazırlıkla Rota Alfa denemesi REDDEDİLDİ');
assert(alfaShortcut.nextState.status === 'phase_game', 'Oyun sonuca geçmedi (kestirme engellendi)');

// KESTİRME 2: Sıfır hazırlıkla Rota Beta denemesi reddedilmelidir (Hiç görev yapmadan 8 kişi kurtarılamaz)
freshState = applyAdvancedAction(freshState, 'advanced_rescue_select', { routeId: 'beta' }, 'kaptan').nextState;
freshState = applyAdvancedAction(freshState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const betaShortcut = applyAdvancedAction(freshState, 'advanced_rescue_approve', {}, 'muhendis');
assert(!!betaShortcut.error, 'Sıfır hazırlıkla Rota Beta denemesi REDDEDİLDİ');
assert(betaShortcut.nextState.status === 'phase_game', 'Oyun sonuca geçmedi (Beta kestirmesi engellendi)');

// KESTİRME 3: Sıfır hazırlıkla Rota Gama denemesi reddedilmelidir (Sıfır hazırlıkla pod fırlatılamaz)
freshState = applyAdvancedAction(freshState, 'advanced_rescue_select', { routeId: 'gama' }, 'kaptan').nextState;
freshState = applyAdvancedAction(freshState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const gamaShortcut = applyAdvancedAction(freshState, 'advanced_rescue_approve', {}, 'muhendis');
assert(!!gamaShortcut.error, 'Sıfır hazırlıkla Rota Gama denemesi REDDEDİLDİ');
assert(gamaShortcut.nextState.status === 'phase_game', 'Oyun sonuca geçmedi (Gama kestirmesi engellendi)');

// KESTİRME 4: Yalnızca Hava Kilidi çözülmüşken Rota Alfa denemesi reddedilmelidir (Tek görevle Alfa olamaz)
let airlockOnlyState = { ...freshState };
airlockOnlyState.advancedScenario!.subsystems.hava_kilidi.isSealed = true; // Sadece hava kilidi mühürlü
airlockOnlyState = applyAdvancedAction(airlockOnlyState, 'advanced_rescue_select', { routeId: 'alfa' }, 'kaptan').nextState;
airlockOnlyState = applyAdvancedAction(airlockOnlyState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const alfaSingleTask = applyAdvancedAction(airlockOnlyState, 'advanced_rescue_approve', {}, 'muhendis');
assert(!!alfaSingleTask.error, 'Yalnızca Hava Kilidi mühürlüyken Rota Alfa REDDEDİLDİ (Tek görevle kurtarma engellendi)');

// KESTİRME 5: Yalnızca Reaktör çözülmüşken Rota Beta denemesi reddedilmelidir (Sinyal eksik)
let reactorOnlyState = { ...freshState };
reactorOnlyState.advancedScenario!.subsystems.reaktor.isStabilized = true; // Sadece reaktör dengeli
reactorOnlyState = applyAdvancedAction(reactorOnlyState, 'advanced_rescue_select', { routeId: 'beta' }, 'kaptan').nextState;
reactorOnlyState = applyAdvancedAction(reactorOnlyState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const betaReactorOnly = applyAdvancedAction(reactorOnlyState, 'advanced_rescue_approve', {}, 'muhendis');
assert(!!betaReactorOnly.error, 'Sinyal kilitli değilken Rota Beta REDDEDİLDİ (Reaktör + Sinyal zorunlu)');

// -----------------------------------------------------------------------------
// [TEST 6] Seyahat Süresi & Gövde Stresi Düşümü ve Sınır Kontrolleri
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 6] Seyahat Süresi & Gövde Stresi Düşümü ve Sınır Kontrolleri...');

// Hazır durumdaki bir rota (Alfa) için süre yetersizse zaman aşımı olmalı
let lowTimeState = createInitialMissionState('KYP-LOWTIME', 'kayip_sinyal', 'Kaptan Ece');
lowTimeState = { ...lowTimeState, gameMode: 'gelismis', status: 'phase_game', timeLeftSeconds: 40 }; // Alfa için 75s gerek!
lowTimeState.advancedScenario!.subsystems.reaktor.isStabilized = true;
lowTimeState.advancedScenario!.subsystems.sinyal.isLocked = true;
lowTimeState.advancedScenario!.subsystems.hava_kilidi.isSealed = true;

lowTimeState = applyAdvancedAction(lowTimeState, 'advanced_rescue_select', { routeId: 'alfa' }, 'kaptan').nextState;
lowTimeState = applyAdvancedAction(lowTimeState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const timeoutOutcome = applyAdvancedAction(lowTimeState, 'advanced_rescue_approve', {}, 'muhendis').nextState;

assert(timeoutOutcome.status === 'phase_result', 'Tahliye değerlendirildi');
assert(timeoutOutcome.outcomeType === 'basarisizlik', 'Kalan süre (40s) yolculuk süresinden (75s) az olduğu için BAŞARISIZLIK oluştu');
assert(timeoutOutcome.rescuedCrewCount === 0, 'Süre yetmediği için 0 mürettebat kurtarıldı');
assert(timeoutOutcome.timeLeftSeconds === 0, 'Kalan süre 0 olarak kaydedildi');

// Hazır durumdaki bir rota (Beta) için gövde yetersizse (örn. %3) gövde parçalanmalı
let lowHullState = createInitialMissionState('KYP-LOWHULL', 'kayip_sinyal', 'Kaptan Ece');
lowHullState = { ...lowHullState, gameMode: 'gelismis', status: 'phase_game', timeLeftSeconds: 200, hullIntegrity: 3 }; // Beta için -%5 stres
lowHullState.advancedScenario!.subsystems.reaktor.isStabilized = true;
lowHullState.advancedScenario!.subsystems.sinyal.isLocked = true;

lowHullState = applyAdvancedAction(lowHullState, 'advanced_rescue_select', { routeId: 'beta' }, 'kaptan').nextState;
lowHullState = applyAdvancedAction(lowHullState, 'advanced_rescue_approve', {}, 'kaptan').nextState;
const hullDestroyedOutcome = applyAdvancedAction(lowHullState, 'advanced_rescue_approve', {}, 'muhendis').nextState;

assert(hullDestroyedOutcome.status === 'phase_result', 'Tahliye değerlendirildi');
assert(hullDestroyedOutcome.outcomeType === 'basarisizlik', 'Gövde stresi (%3 <= %5) nedeniyle istasyon parçalandı');
assert(hullDestroyedOutcome.hullIntegrity === 0, 'Gövde bütünlüğü %0 olarak kaydedildi');

// -----------------------------------------------------------------------------
// [TEST 7] Çözüm Yolu 1: Rota Alfa (10 Kişi - Güç Aktarımları ile Tam Başarı)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 7] Çözüm Yolu 1: Rota Alfa (10 Kişi - Dinamik Güç Aktarımları ile Tam Başarı)...');
let path1 = createInitialMissionState('KYP-PATH1', 'kayip_sinyal', 'Kaptan Ece');
path1 = { ...path1, gameMode: 'gelismis', status: 'phase_game', timeLeftSeconds: 260, hullIntegrity: 100 };

// 1. Reaktör Çözümü: Başlangıçta Soğutma 4 MW hazır (4 + 2 + 1 = 7 MW)
path1 = applyAdvancedAction(path1, 'advanced_reactor_breaker', { breaker: 'K2' }, 'kaptan').nextState;
path1 = applyAdvancedAction(path1, 'advanced_reactor_purge', { line: 'anten' }, 'muhendis').nextState;
assert(path1.advancedScenario?.subsystems.reaktor.isStabilized === true, '1. Adım: Reaktör stabilize edildi (Isı: 58°C)');

// 2. Güç Aktarımı: Reaktör çözülünce soğutma 1 MW a indirilir, Antene 3 MW verilir (1 + 3 + 3 = 7 MW)
path1 = applyAdvancedAction(path1, 'advanced_set_power', { coolingPumps: 1, antennaBooster: 3, airlockCompressor: 3, shieldReserve: 0 }, 'kaptan').nextState;
assert(path1.advancedScenario?.subsystems.sinyal.noiseLevel === 4, 'Güç aktarımı sonrası Anten 3 MW oldu, parazit %4 e düştü');

// 3. Sinyal Çözümü: 143.6 MHz kilitlenir
path1 = applyAdvancedAction(path1, 'advanced_signal_tune', { freq: '143.6 MHz' }, 'muhendis').nextState;
assert(path1.advancedScenario?.subsystems.sinyal.isLocked === true, '2. Adım: Sinyal 143.6 MHz ile USS Aurora ya kilitlendi');

// 4. Hava Kilidi Çözümü: Kompresörde 3 MW var
path1 = applyAdvancedAction(path1, 'advanced_airlock_params', { dialIndex: 2, vacuum: 75 }, 'muhendis').nextState;
path1 = applyAdvancedAction(path1, 'advanced_airlock_seal', {}, 'muhendis').nextState;
assert(path1.advancedScenario?.subsystems.hava_kilidi.isSealed === true, '3. Adım: Hava kilidi başarıyla mühürlendi');

// 5. Tahliye: Rota Alfa (Gereksinim: 75s seyahat, -%5 gövde)
path1 = applyAdvancedAction(path1, 'advanced_rescue_select', { routeId: 'alfa' }, 'kaptan').nextState;
path1 = applyAdvancedAction(path1, 'advanced_rescue_approve', {}, 'kaptan').nextState;
path1 = applyAdvancedAction(path1, 'advanced_rescue_approve', {}, 'muhendis').nextState;

assert(path1.status === 'phase_result', 'Tüm şartlar sağlandığı için Rota Alfa onaylandı');
assert(path1.rescuedCrewCount === 10, '10 personelin tamamı kurtarıldı');
assert(path1.outcomeType === 'tam_basari', 'Görev sonucu: TAM BAŞARI');
assert(path1.timeLeftSeconds === 260 - 75, 'Seyahat süresi (75s) kalandan düşüldü (260 -> 185s)');
assert(path1.hullIntegrity === 100 - 5, 'Gövde stresi (-%5) düşüldü (100 -> 95%)');

// -----------------------------------------------------------------------------
// [TEST 8] Çözüm Yolu 2: Rota Beta (8 Kişi - Hava Kilidi Atlanarak Hızlı Kaçış)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 8] Çözüm Yolu 2: Rota Beta (8 Kişi - Hava Kilidi Atlanarak Hızlı Kaçış)...');
let path2 = createInitialMissionState('KYP-PATH2', 'kayip_sinyal', 'Kaptan Ece');
path2 = { ...path2, gameMode: 'gelismis', status: 'phase_game', timeLeftSeconds: 240, hullIntegrity: 100 };

// 1. Reaktör Çözümü: Soğutma 4 MW ile çözülür
path2 = applyAdvancedAction(path2, 'advanced_reactor_breaker', { breaker: 'K2' }, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_reactor_purge', { line: 'anten' }, 'muhendis').nextState;

// 2. Güç Aktarımı: Soğutma 1 MW, Anten 3 MW, Kalkan Rezervi 3 MW (1 + 3 + 0 + 3 = 7 MW)
path2 = applyAdvancedAction(path2, 'advanced_set_power', { coolingPumps: 1, antennaBooster: 3, airlockCompressor: 0, shieldReserve: 3 }, 'kaptan').nextState;

// 3. Sinyal Çözümü: 143.6 MHz kilitlenir
path2 = applyAdvancedAction(path2, 'advanced_signal_tune', { freq: '143.6 MHz' }, 'muhendis').nextState;

// Hava kilidi kasten yapılmadı
assert(path2.advancedScenario?.subsystems.hava_kilidi.isSealed === false, 'Hava kilidi atlandı (güç ve vakit tasarrufu)');

// 4. Tahliye: Rota Beta (Reaktör + Sinyal yeterli; 50s seyahat, -%5 gövde)
path2 = applyAdvancedAction(path2, 'advanced_rescue_select', { routeId: 'beta' }, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_rescue_approve', {}, 'kaptan').nextState;
path2 = applyAdvancedAction(path2, 'advanced_rescue_approve', {}, 'muhendis').nextState;

assert(path2.status === 'phase_result', 'Rota Beta başarıyla onaylandı');
assert(path2.rescuedCrewCount === 8, '8 mürettebat güvenle kurtarıldı');
assert(path2.outcomeType === 'tam_basari', 'Reaktör ve sinyal hazır olduğu için Rota Beta TAM BAŞARI verdi');
assert(path2.timeLeftSeconds === 240 - 50, 'Seyahat süresi (50s) kalandan düşüldü (240 -> 190s)');
assert(path2.hullIntegrity === 100 - 5, 'Gövde stresi (-%5) düşüldü (100 -> 95%)');

// -----------------------------------------------------------------------------
// [TEST 9] Acil Durum Yolu: Rota Gama (6 Kişi - Tek Sistemle Acil Kaçış Podu)
// -----------------------------------------------------------------------------
console.log('\n▶ [TEST 9] Acil Durum Yolu: Rota Gama (6 Kişi - Tek Sistemle Acil Kaçış Podu)...');
let path3 = createInitialMissionState('KYP-PATH3', 'kayip_sinyal', 'Kaptan Ece');
path3 = { ...path3, gameMode: 'gelismis', status: 'phase_game', timeLeftSeconds: 150, hullIntegrity: 80 };

// Sadece Reaktör çözülür, Sinyal ve Hava kilidi yok
path3 = applyAdvancedAction(path3, 'advanced_reactor_breaker', { breaker: 'K2' }, 'kaptan').nextState;
path3 = applyAdvancedAction(path3, 'advanced_reactor_purge', { line: 'anten' }, 'muhendis').nextState;

// Rota Gama seçilip onaylanır (30s seyahat, -%10 gövde)
path3 = applyAdvancedAction(path3, 'advanced_rescue_select', { routeId: 'gama' }, 'kaptan').nextState;
path3 = applyAdvancedAction(path3, 'advanced_rescue_approve', {}, 'kaptan').nextState;
path3 = applyAdvancedAction(path3, 'advanced_rescue_approve', {}, 'muhendis').nextState;

assert(path3.status === 'phase_result', 'Rota Gama onaylandı');
assert(path3.rescuedCrewCount === 6, '6 personel kaçış poduyla kurtarıldı');
assert(path3.outcomeType === 'kismi_kurtarma', 'Sonuç: Kısmi Kurtarma');
assert(path3.timeLeftSeconds === 150 - 30, 'Seyahat süresi (30s) kalandan düşüldü (150 -> 120s)');
assert(path3.hullIntegrity === 80 - 10, 'Pod ivmelenme stresi (-%10) düşüldü (80 -> 70%)');

console.log('\n======================================================================');
console.log(`📊 GELİŞMİŞ TAKTİK SENARYOSU DOĞRULAMA TEST SONUCU: ${passCount}/${passCount} BAŞARILI`);
console.log('✅ TÜM KESTİRMELER REDDEDİLDİ, SEYAHAT SÜRELERİ DÜŞÜLDÜ VE ŞARTLAR SAĞLANDIĞINDA ÇÖZÜMLER ÇALIŞTI!');
console.log('======================================================================');
