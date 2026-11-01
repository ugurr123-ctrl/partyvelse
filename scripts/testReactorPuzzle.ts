import { createInitialMissionState, isLineAnomaly, generateDiagnostic } from '../src/services/gameFactory';
import { applyLocalGameAction } from '../src/services/localGameEngine';
import { EnvironmentType, MissionState } from '../src/types/game';

console.log('======================================================================');
console.log('🧪 PARTYVERSE - ARIZA TEŞHİSİ / REAKTÖR DENGELEME BULMACA TESTİ');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTrue(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ HATA: ${message}`);
  }
}

// --------------------------------------------------------------------
// TEST 1: Başlangıçta Seçim Olmaması ve Boş Müdahale Engeli
// --------------------------------------------------------------------
console.log('▶ [TEST 1] Başlangıçta Seçim Olmaması ve Boş Müdahale Koruması...');
const initialState = createInitialMissionState();
initialState.status = 'phase_game';
initialState.currentPhaseIndex = 0;
initialState.selectedMiniGames = ['ariza_teshisi', 'sinyal_cozumu'];
assertTrue(initialState.diagnostic.captainSelectedBreaker === null, 'Başlangıçta hiçbir kesici seçili değil (null)');
assertTrue(initialState.diagnostic.engineerSuggestedLine === null, 'Başlangıçta hiçbir hat/devre seçili değil (null)');
assertTrue(initialState.diagnostic.engineerActionTaken === false, 'Başlangıçta mühendis eylemi alınmamış');
assertTrue(initialState.diagnostic.isSolved === false, 'Başlangıçta reaktör dengelenmiş değil');

// Seçim yapılmadan müdahale denenirse
const stateAfterEmptyBreaker = applyLocalGameAction(initialState, 'diagnostic_captain_breaker', { breaker: null }, 'kaptan');
assertTrue(stateAfterEmptyBreaker.diagnostic.captainSelectedBreaker === null, 'Seçim olmadan kesici müdahalesi yok sayıldı');
assertTrue(stateAfterEmptyBreaker.diagnostic.isSolved === false, 'Seçim olmadan görev çözülemez');

const stateAfterEmptyLine = applyLocalGameAction(initialState, 'diagnostic_engineer_purge', { line: null }, 'muhendis');
assertTrue(stateAfterEmptyLine.feedbackState === 'error', 'Hat seçilmeden tahliye yapılınca açıklayıcı hata verildi');
assertTrue(stateAfterEmptyLine.diagnostic.isSolved === false, 'Hat seçilmeden tahliye uygulanamaz');

// --------------------------------------------------------------------
// TEST 2: Tek Ölçümle Ayırt Edilemeyen Çok Parametreli Çeldiriciler
// --------------------------------------------------------------------
console.log('\n▶ [TEST 2] Çok Parametreli Çeldiriciler & Birden Fazla Kural Zorunluluğu...');
const envs: EnvironmentType[] = ['kayip_sinyal', 'buzul_istasyonu', 'meteor_yagmuru', 'karantina_protokolu'];

for (const env of envs) {
  const diag = generateDiagnostic(env);
  const lineKeys: Array<'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme'> = ['anten', 'reaktor', 'sogutucu', 'yonlendirme'];
  
  let highTempCount = 0;
  let criticalPressCount = 0;
  let highNoiseCount = 0;

  for (const k of lineKeys) {
    const l = diag.lines[k];
    if (env === 'buzul_istasyonu') {
      if (l.temp <= -10) highTempCount++;
      if (l.press >= 70) criticalPressCount++;
      if (l.noise >= 60) highNoiseCount++;
    } else {
      if (l.temp >= 80) highTempCount++;
      if (l.press <= 40) criticalPressCount++;
      if (l.noise >= 65) highNoiseCount++;
    }
  }

  assertTrue(highTempCount >= 2, `${env}: En az 2 hatta sıcaklık alarmı var (Yalnızca ısıya bakarak doğru hat bulunamaz)`);
  assertTrue(criticalPressCount >= 2, `${env}: En az 2 hatta kritik basınç var (Yalnızca basınca bakarak doğru hat bulunamaz)`);
  assertTrue(highNoiseCount >= 2, `${env}: En az 2 hatta yüksek parazit var (Yalnızca parazite bakarak doğru hat bulunamaz)`);
}

// --------------------------------------------------------------------
// TEST 3: Monte-Carlo Üretim Doğrulaması (200 Örnekte Tek Çözüm Garantisi)
// --------------------------------------------------------------------
console.log('\n▶ [TEST 3] Monte-Carlo 200 Tur Üretim Testi (Tek Çözüm ve Rastgelelik)...');
let allSingleSolution = true;
const breakerOccurrences: Record<string, number> = { K1: 0, K2: 0, K3: 0, K4: 0 };
const faultyLineOccurrences: Record<string, number> = { anten: 0, reaktor: 0, sogutucu: 0, yonlendirme: 0 };

for (let i = 0; i < 200; i++) {
  const randomEnv = envs[i % envs.length];
  const diag = generateDiagnostic(randomEnv);
  
  let anomalyMatches = 0;
  const lineKeys: Array<'anten' | 'reaktor' | 'sogutucu' | 'yonlendirme'> = ['anten', 'reaktor', 'sogutucu', 'yonlendirme'];
  for (const k of lineKeys) {
    if (isLineAnomaly(randomEnv, diag.lines[k])) {
      anomalyMatches++;
    }
  }

  if (anomalyMatches !== 1) {
    allSingleSolution = false;
  }

  breakerOccurrences[diag.correctBreaker]++;
  faultyLineOccurrences[diag.faultyLine]++;
}

assertTrue(allSingleSolution, '200 rastgele turun tamamında TAM OLARAK 1 adet arızalı hat üretildi');
assertTrue(breakerOccurrences.K1 > 15 && breakerOccurrences.K2 > 15 && breakerOccurrences.K3 > 15 && breakerOccurrences.K4 > 15,
  'K1–K4 kesici eşleşmeleri dengeli ve dinamik olarak her tur değişiyor');
assertTrue(faultyLineOccurrences.anten > 15 && faultyLineOccurrences.reaktor > 15 && faultyLineOccurrences.sogutucu > 15,
  'Arızalı hatlar her modülde dinamik olarak üretiliyor');

// --------------------------------------------------------------------
// TEST 4: Yanlış Müdahalelerin Reddedilmesi & Açıklayıcı Hata Mesajları
// --------------------------------------------------------------------
console.log('\n▶ [TEST 4] Hatalı Müdahalelerin Reddedilmesi & Güvenlik Kilitleri...');
let mission = createInitialMissionState();
mission.status = 'phase_game';
mission.currentPhaseIndex = 0;
mission.selectedMiniGames = ['ariza_teshisi', 'sinyal_cozumu'];
const correctBreaker = mission.diagnostic.correctBreaker;
const faultyLine = mission.diagnostic.faultyLine;
const targetValveAngle = mission.diagnostic.targetValveAngle;
const wrongBreaker = (['K1', 'K2', 'K3', 'K4'] as const).find(b => b !== correctBreaker)!;
const wrongLine = (['anten', 'reaktor', 'sogutucu', 'yonlendirme'] as const).find(l => l !== faultyLine)!;

// 4.1 Yanlış Kesici Seçimi
const initialHull = mission.hullIntegrity;
const initialTime = mission.timeLeftSeconds;
mission = applyLocalGameAction(mission, 'diagnostic_captain_breaker', { breaker: wrongBreaker }, 'kaptan');
assertTrue(mission.hullIntegrity === initialHull - 10, 'Yanlış kesici bütünlükten -%10 düşürdü');
assertTrue(mission.timeLeftSeconds === initialTime - 15, 'Yanlış kesici süreden -15s düşürdü');
assertTrue(mission.diagnostic.isSolved === false, 'Yanlış kesici reaktörü çözmedi');
assertTrue(
  mission.feedbackMessage.includes('Hatalı kesici seçimi') && !mission.feedbackMessage.includes(correctBreaker),
  'Hata mesajında doğru kesici gizlendi (ifşa edilmedi)'
);

// 4.2 Kesici Açılmadan Mühendisin Doğru Hatta Tahliye Denemesi
mission = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  valveAngle: targetValveAngle,
  throttleActive: true,
}, 'muhendis');
assertTrue(mission.diagnostic.isSolved === false, 'Kaptan kesiciyi açmadan mühendisin tahliyesi kilitlendi');
assertTrue(mission.feedbackMessage.includes('Güvenlik kilidi devrede'), 'Kesici açılmadığı için kilit uyarısı verildi');

// 4.3 Kaptan Doğru Kesiciyi Açar
mission = applyLocalGameAction(mission, 'diagnostic_captain_breaker', { breaker: correctBreaker }, 'kaptan');
assertTrue(mission.diagnostic.captainSelectedBreaker === correctBreaker, `Kaptan doğru kesiciyi (${correctBreaker}) açtı`);
assertTrue(mission.diagnostic.unlockedBreaker === correctBreaker, 'Kesici güvenlik kilidi açıldı');
assertTrue(mission.diagnostic.isSolved === false, 'Yalnızca kesiciyi açmak görevi bitirmedi (Mühendis bekleniyor)');

// 4.4 Mühendis Yanlış Hattı Tahliye Eder
const timeBeforeWrongPurge = mission.timeLeftSeconds;
mission = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: wrongLine,
  valveAngle: targetValveAngle,
  throttleActive: true,
}, 'muhendis');
assertTrue(mission.timeLeftSeconds === timeBeforeWrongPurge - 15, 'Mühendisin sağlam hatta müdahalesi ceza uyguladı (-15s)');
assertTrue(mission.diagnostic.isSolved === false, 'Sağlam hatta tahliye reaktörü çözmedi');
assertTrue(!mission.feedbackMessage.includes(faultyLine), 'Hata mesajında doğru arızalı hat ifşa edilmedi');

// 4.5 Mühendis Doğru Hat Ama Yanlış Valf Açısı Seçer (Örn: 45° yerine 135°)
const wrongAngle = targetValveAngle === 135 ? 45 : 135;
mission = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  valveAngle: wrongAngle,
  throttleActive: true,
}, 'muhendis');
assertTrue(mission.diagnostic.isSolved === false, 'Hatalı soğutma valfi açısı ile tahliye reddedildi');
assertTrue(mission.feedbackMessage.includes('Soğutma valfi doğru açıda değil'), 'Valf hatası açıklandı');

// 4.6 Mühendis Doğru Hat Ama valveAngle Eksik Gönderirse (undefined/null)
const stateMissingValve = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  throttleActive: true,
}, 'muhendis');
assertTrue(stateMissingValve.diagnostic.isSolved === false, 'valveAngle eksik olduğunda işlem reddedildi (otomatik doldurulmadı)');
assertTrue(stateMissingValve.feedbackState === 'error', 'valveAngle eksikliği hata durumuna geçti');
assertTrue(stateMissingValve.feedbackMessage.includes('Soğutma valfi açısı belirtilmedi'), 'Eksik valf açısı uyarısı verildi');

// 4.7 Mühendis Doğru Hat Ama throttleActive Eksik Gönderirse (undefined/null)
const stateMissingThrottle = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  valveAngle: targetValveAngle,
}, 'muhendis');
assertTrue(stateMissingThrottle.diagnostic.isSolved === false, 'throttleActive eksik olduğunda işlem reddedildi (otomatik doldurulmadı)');
assertTrue(stateMissingThrottle.feedbackState === 'error', 'throttleActive eksikliği hata durumuna geçti');
assertTrue(stateMissingThrottle.feedbackMessage.includes('Basınç tahliye anahtarı konumu belirtilmedi'), 'Eksik tahliye anahtarı uyarısı verildi');

// 4.8 Mühendis Doğru Hat, Doğru Valf Ama Basınç Tahliyesini Açmaz (false)
mission = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  valveAngle: targetValveAngle,
  throttleActive: false,
}, 'muhendis');
assertTrue(mission.diagnostic.isSolved === false, 'Basınç tahliyesi devre dışı olmadan işlem reddedildi');
assertTrue(mission.feedbackMessage.includes('Basınç tahliyesi devre dışı'), 'Tahliye anahtarı hatası açıklandı');

// --------------------------------------------------------------------
// TEST 5: Başarılı İki Rol Eylemi & Ölçümlerin Gerçekten Güncellenmesi
// --------------------------------------------------------------------
console.log('\n▶ [TEST 5] Başarılı Koordinasyon & Canlı Telemetrinin Kararlı Hale Gelmesi...');
mission = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  valveAngle: targetValveAngle,
  throttleActive: true,
}, 'muhendis');

assertTrue(mission.diagnostic.isSolved === true, 'İki rolün doğru koordinasyonu ile Reaktör DENGELENDİ!');
assertTrue(mission.feedbackState === 'success', 'Geri bildirim başarı durumuna geçti');

const updatedTelemetry = mission.diagnostic.lines[faultyLine];
assertTrue(updatedTelemetry.temp === 54, `Arızalı hat sıcaklığı kararlı değere düştü: ${updatedTelemetry.temp}°C`);
assertTrue(updatedTelemetry.press === 50, `Arızalı hat basıncı normale döndü: ${updatedTelemetry.press} kPa`);
assertTrue(updatedTelemetry.noise === 36, `Arızalı hat paraziti filtrelendi: ${updatedTelemetry.noise} dB`);
assertTrue(updatedTelemetry.status === 'stabil', 'Devre durumu STABİL olarak güncellendi');

// --------------------------------------------------------------------
// TEST 6: Tekrarlanan Onayların İkinci Kez Puan/İşlem Vermemesi (Idempotency)
// --------------------------------------------------------------------
console.log('\n▶ [TEST 6] İdempotens (Tekrarlanan Eylemlerin Çift Sayılmaması)...');
const timeAfterSolve = mission.timeLeftSeconds;
const hullAfterSolve = mission.hullIntegrity;

// Çözüldükten sonra tekrar butonlara basılırsa
mission = applyLocalGameAction(mission, 'diagnostic_captain_breaker', { breaker: correctBreaker }, 'kaptan');
mission = applyLocalGameAction(mission, 'diagnostic_engineer_purge', {
  line: faultyLine,
  valveAngle: targetValveAngle,
  throttleActive: true,
}, 'muhendis');

assertTrue(mission.timeLeftSeconds === timeAfterSolve, 'Çözüldükten sonraki tıklamalar süreye etki etmedi');
assertTrue(mission.hullIntegrity === hullAfterSolve, 'Çözüldükten sonraki tıklamalar gövdeye etki etmedi');
assertTrue(mission.diagnostic.isSolved === true, 'Durum kararlı olarak korundu');

console.log('\n======================================================================');
console.log(`📊 REAKTÖR BULMACA TEST RAPORU: ${passedTests}/${totalTests} BAŞARILI`);
if (failedTests > 0) {
  console.error(`❌ ${failedTests} TEST BAŞARISIZ!`);
  process.exit(1);
} else {
  console.log('🏁 TÜM ARIZA TEŞHİSİ VE REAKTÖR DENGELEME BULMACA TESTLERİ EKSİKSİZ GEÇTİ!');
  console.log('======================================================================');
}
