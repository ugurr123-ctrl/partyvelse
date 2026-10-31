import http from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { LostSignalRoom } from '../server/LostSignalRoom';
import { MissionState } from '../src/types/game';

console.log('======================================================================');
console.log('🔍 PARTYVERSE - REGRESYON VE BULGU DOĞRULAMA TEST SETİ (5/5)');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assertTrue(cond: boolean, desc: string) {
  totalTests++;
  if (!cond) {
    failedTests++;
    failures.push(desc);
    console.error(`  ❌ HATA: ${desc}`);
  } else {
    passedTests++;
    console.log(`  ✓ ${desc}`);
  }
}

async function runRegressionTests() {
  const server = http.createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
  });

  gameServer.define('lost_signal', LostSignalRoom).filterBy(['roomCode']);

  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const actualPort = (server.address() as any).port;
  console.log(`📡 Colyseus Regresyon Test Sunucusu Başlatıldı (Port: ${actualPort})\n`);

  try {
    const clientA = new Client(`ws://localhost:${actualPort}`);
    const clientB = new Client(`ws://localhost:${actualPort}`);
    const clientC = new Client(`ws://localhost:${actualPort}`);

    // =========================================================================
    // BULGU 3: CREATE vs JOIN AYRIMI, MÜKERRER KOD VE BİLİNMEYEN/DOLU ODA KONTROLÜ
    // =========================================================================
    console.log('▶ [BULGU 3] Oda Ayrımı, Tekil Kod ve Hata Yönetimi...');
    const ROOM_CODE = 'KYP-REG1';

    let stateA: any = null;
    let stateB: any = null;

    // 1. clientA creates room ROOM_CODE
    const roomA = await clientA.create('lost_signal', {
      roomCode: ROOM_CODE,
      playerName: 'Kaptan Ece',
      role: 'kaptan',
      environment: 'kayip_sinyal',
      selectedMiniGames: ['sinyal_cozumu', 'kablo_baglantisi'],
    });
    roomA.onMessage('state_update', (msg: MissionState) => { stateA = msg; });
    roomA.onMessage('error_message', (msg: string) => { console.log('   [ROOM_A ERROR]:', msg); });
    assertTrue(!!roomA.roomId, 'Oda A oluşturuldu');

    // 2. Another client attempts to create a room with the SAME room code -> MUST fail (409)
    let duplicateCreateFailed = false;
    try {
      await clientC.create('lost_signal', {
        roomCode: ROOM_CODE,
        playerName: 'Taklitçi',
      });
    } catch {
      duplicateCreateFailed = true;
    }
    assertTrue(duplicateCreateFailed, 'Aynı oda koduyla ikinci kez create çağrısı reddedildi (409 Conflict)');

    // 3. Joining an UNKNOWN room code -> MUST fail without creating a new room
    let unknownJoinFailed = false;
    try {
      await clientB.join('lost_signal', {
        roomCode: 'KYP-9999',
        playerName: 'Gezgin',
      });
    } catch {
      unknownJoinFailed = true;
    }
    assertTrue(unknownJoinFailed, 'Bilinmeyen kodla join yapıldığında yeni oda açılmadı, hata fırlatıldı');

    // 4. clientB joins existing room ROOM_CODE
    const roomB = await clientB.join('lost_signal', {
      roomCode: ROOM_CODE,
      playerName: 'Mühendis Mert',
    });
    roomB.onMessage('state_update', (msg: MissionState) => { stateB = msg; });
    roomB.onMessage('error_message', (msg: string) => { console.log('   [ROOM_B ERROR]:', msg); });
    assertTrue(roomB.roomId === roomA.roomId, 'İkinci oyuncu doğru odaya katıldı');

    // 5. Third player attempts to join full room -> MUST fail
    let fullJoinFailed = false;
    try {
      await clientC.join('lost_signal', {
        roomCode: ROOM_CODE,
        playerName: 'Üçüncü',
      });
    } catch {
      fullJoinFailed = true;
    }
    assertTrue(fullJoinFailed, 'Dolu odaya (2/2) üçüncü oyuncunun girmesi engellendi');

    // Wait for initial sync
    await new Promise((r) => setTimeout(r, 100));

    // =========================================================================
    // BULGU 4: ROL ONAYINDA LİDER İSTİSNASI (İKİNCİ OYUNCU BEKLENMELİ)
    // =========================================================================
    console.log('\n▶ [BULGU 4] Rol Onayında İki Oyuncunun da Onayı Zorunluluğu...');
    // In lobby, both players must be ready, then host starts game to reach role_intro
    roomA.send('toggle_ready');
    roomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 60));
    roomA.send('start_game');
    await new Promise((r) => setTimeout(r, 80));

    assertTrue(stateA?.status === 'role_intro', 'Lobi hazırlığı sonrası role_intro aşamasına geçildi');

    // Only Kaptan confirms role
    roomA.send('confirm_role');
    await new Promise((r) => setTimeout(r, 80));

    assertTrue(stateA?.status === 'role_intro', 'Yalnızca Kaptan onay verince oyun BAŞLAMADI (Mühendis bekleniyor)');
    assertTrue(stateA?.players.kaptan.roleConfirmed === true, 'Kaptanın onay durumu kaydedildi');
    assertTrue(stateB?.players.muhendis.roleConfirmed === false, 'Mühendisin henüz onay vermediği görüldü');

    // Now Mühendis confirms role
    roomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 80));

    assertTrue(stateA?.status === 'phase_game', 'Her iki oyuncu da onay verince phase_game başladı');
    assertTrue(stateB?.status === 'phase_game', 'Mühendis ekranı da phase_game durumuna geçti');

    // =========================================================================
    // BULGU 1: GİZLİ CEVAPLARIN FİLTRELENMESİ VE MÜHENDİSİN SEÇİLEN PARAMETRELERİ GÖNDERMESİ
    // =========================================================================
    console.log('\n▶ [BULGU 1] Gizli Cevap Maskelemesi & Sunucu Taraflı Doğrulama...');
    // Sinyal, Hava Kilidi ve Radar gizlenmiş alanlarının mühendise maskeli gittiğini kontrol et
    assertTrue(stateB?.signal.correctFrequency === '??? MHz', 'Mühendise doğru frekans maskeli gönderildi (??? MHz)');
    assertTrue(stateB?.airlock.targetDialIndex === -1, 'Mühendise hava kilidi doğru kadranı maskeli gönderildi (-1)');
    assertTrue(stateB?.radar.targetAzimuth === 0 && stateB?.radar.targetElevation === 0, 'Mühendise radar hedef koordinatları maskeli gönderildi (0/0)');

    // Kaptan doğru frekansı görebiliyor mu?
    const captainFreq = stateA?.signal.correctFrequency;
    assertTrue(!!captainFreq && captainFreq !== '??? MHz', `Kaptan doğru sinyal frekansını görüyor: ${captainFreq}`);

    // Mühendis doğru frekansı (kaptanın telemetrisinden sözlü aldığı değeri) sunucuya gönderir
    // Sinyal görevi eylemi gönderelim
    roomB.send('action', {
      actionType: 'signal_engineer_tune',
      roundId: stateB!.roundId,
      phaseIndex: stateB!.currentPhaseIndex,
      data: { freq: captainFreq },
    });
    await new Promise((r) => setTimeout(r, 80));

    assertTrue(stateB?.signal.isSolved === true, 'Mühendisin gönderdiği doğru parametre sunucu tarafından çözüldü!');
    assertTrue(stateA?.signal.isSolved === true, 'Kaptan ekranında da sinyal çözüldü olarak güncellendi');

    // =========================================================================
    // BULGU 2: ROL VE GÖREV YETKİLERİ KONTROLÜ (KAPTAN MÜHENDİS EYLEMİNİ TETİKLEYEMEZ)
    // =========================================================================
    console.log('\n▶ [BULGU 2] Rol ve Görev Yetkileri Sınırlandırması...');
    // Kaptan mühendisin yetkisinde olan 'airlock_verify' eylemini çağırmaya çalışır -> REDDEDİLMELİ
    const airlockInitialSolved = stateA?.airlock.isSolved;
    roomA.send('action', {
      actionType: 'airlock_verify',
      roundId: stateA!.roundId,
      phaseIndex: stateA!.currentPhaseIndex,
      data: {},
    });
    await new Promise((r) => setTimeout(r, 80));
    assertTrue(stateA?.airlock.isSolved === airlockInitialSolved, 'Kaptanın mühendis hava kilidi onayını taklit etmesi reddedildi');

    // Kaptan mühendisin kurtarma onayını ('rescue_toggle_approval') değiştiremez
    // Geçiş: Phase 0 -> Phase 1 (kablo)
    roomA.send('advance_phase', { roundId: stateA!.roundId, expectedPhaseIndex: 0 });
    await new Promise((r) => setTimeout(r, 60));

    // Phase 1 (kablo_baglantisi) çözümü: Mühendis kabloları bağlar ve test eder
    for (const port of stateA!.cable.ports) {
      roomB.send('action', {
        actionType: 'cable_assign_port',
        roundId: stateB!.roundId,
        phaseIndex: 1,
        data: { portId: port.id, cableId: port.requiredCableId },
      });
    }
    roomB.send('action', {
      actionType: 'cable_test_connections',
      roundId: stateB!.roundId,
      phaseIndex: 1,
      data: {},
    });
    await new Promise((r) => setTimeout(r, 80));

    // Geçiş: Phase 1 -> Phase 2 (Energy)
    roomA.send('advance_phase', { roundId: stateA!.roundId, expectedPhaseIndex: 1 });
    await new Promise((r) => setTimeout(r, 60));

    // Mühendis taslağı iletir, Kaptan kilitler
    roomB.send('action', {
      actionType: 'energy_set_allocation',
      roundId: stateB!.roundId,
      phaseIndex: stateB!.currentPhaseIndex,
      data: { allocation: { yasamDestegi: 5, itki: 5, kalkan: 5 } },
    });
    roomB.send('action', {
      actionType: 'energy_share_draft',
      roundId: stateB!.roundId,
      phaseIndex: stateB!.currentPhaseIndex,
      data: {},
    });
    await new Promise((r) => setTimeout(r, 80));

    roomA.send('action', {
      actionType: 'energy_lock',
      roundId: stateA!.roundId,
      phaseIndex: stateA!.currentPhaseIndex,
      data: {},
    });
    await new Promise((r) => setTimeout(r, 80));

    // Phase Rescue
    roomA.send('advance_phase', { roundId: stateA!.roundId, expectedPhaseIndex: 2 });
    await new Promise((r) => setTimeout(r, 80));
    assertTrue(stateA?.status === 'phase_rescue', 'Aşama 4: Kurtarma rotası aşamasına geçildi');

    // Kaptan kendi onayını verir
    roomA.send('action', {
      actionType: 'rescue_toggle_approval',
      roundId: stateA!.roundId,
      phaseIndex: stateA!.currentPhaseIndex,
      data: { approved: true },
    });
    await new Promise((r) => setTimeout(r, 80));
    assertTrue(stateA?.rescue.captainApproved === true, 'Kaptan kendi onayını verdi');
    assertTrue(stateA?.rescue.engineerApproved === false, 'Kaptan onay verince mühendisin onayı DEĞİŞMEDİ');

    // =========================================================================
    // BULGU 5: GERİ BAĞLANMA DESTEĞİ VE AKTİF GÖREVDE GÖNÜLLÜ AYRILMA
    // =========================================================================
    console.log('\n▶ [BULGU 5] Geri Bağlanma ve Gönüllü Ayrılmada Görev Sonlandırma...');
    // 1. Beklenmeyen kopma (transport drop)
    const tokenB = roomB.reconnectionToken;
    (roomB as any).connection.transport.close();
    await new Promise((r) => setTimeout(r, 100));

    assertTrue(stateA?.isDisconnected === true, 'Beklenmeyen kopmada isDisconnected true oldu');
    assertTrue(stateA?.isPaused === true, 'Beklenmeyen kopmada sayaç ve kontroller duraklatıldı');

    // 2. Yeniden bağlanma (reconnect)
    const reconnectedB = await clientB.reconnect(tokenB);
    reconnectedB.onMessage('state_update', (msg: MissionState) => { stateB = msg; });
    await new Promise((r) => setTimeout(r, 100));
    assertTrue(reconnectedB.roomId === roomA.roomId, 'Oyuncu token ile odaya geri bağlandı');
    assertTrue(stateA?.isDisconnected === false, 'Geri bağlanınca isDisconnected false oldu');

    // 3. Gönüllü ayrılma (consented leave) aktif görevde görevi sonlandırmalıdır
    await reconnectedB.leave();
    await new Promise((r) => setTimeout(r, 100));

    assertTrue(stateA?.status === 'phase_result', 'Aktif görevde gönüllü ayrılma oyunu sonlandırdı (phase_result)');
    assertTrue(stateA?.outcomeType === 'basarisizlik', 'Görev başarısızlıkla neticelendirildi');
    assertTrue(
      stateA?.feedbackMessage?.includes('ayrıldı') || false,
      `Ayrılma açıklaması doğru iletildi: ${stateA?.feedbackMessage}`
    );

    // Clean up
    await roomA.leave();
  } finally {
    server.close();
  }

  console.log('\n======================================================================');
  console.log(`📊 BULGU VE REGRESYON TEST SONUCU: ${passedTests}/${totalTests} BAŞARILI`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} TEST BAŞARISIZ OLDU!`);
    process.exit(1);
  } else {
    console.log('✅ TÜM 5 BULGU GERÇEK COLYSEUS AĞINDA EKSİKSİZ DOĞRULANDI!');
    console.log('======================================================================\n');
  }
}

runRegressionTests().catch((err) => {
  console.error('Fatal Exception:', err);
  process.exit(1);
});
