import http from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { LostSignalRoom } from '../server/LostSignalRoom';
import { MissionState } from '../src/types/game';

console.log('======================================================================');
console.log('🚀 PARTYVERSE / KAYIP SİNYAL - COLYSEUS GERÇEK MULTIPLAYER TEST MOTORU');
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

async function runMultiplayerTests() {
  const server = http.createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
  });

  gameServer.define('lost_signal', LostSignalRoom).filterBy(['roomCode']);

  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const actualPort = (server.address() as any).port;
  console.log(`📡 Colyseus Test Sunucusu Başlatıldı (Port: ${actualPort})\n`);

  try {
    const clientA = new Client(`ws://localhost:${actualPort}`);
    const clientB = new Client(`ws://localhost:${actualPort}`);
    const clientC = new Client(`ws://localhost:${actualPort}`);

    const TEST_ROOM_CODE = 'KYP-MLT1';

    // -------------------------------------------------------------------------
    // TEST 1: ODA OLUŞTURMA VE BAĞLANTI (Player 1 - Kaptan)
    // -------------------------------------------------------------------------
    console.log('▶ [TEST 1] Oyuncu 1 Odayı Oluşturuyor...');
    let stateA: any = null;
    const roomA = await clientA.joinOrCreate('lost_signal', {
      roomCode: TEST_ROOM_CODE,
      playerName: 'Kaptan Ece',
      role: 'kaptan',
      selectedMiniGames: ['sinyal_cozumu', 'kablo_baglantisi'],
    });

    roomA.onMessage('state_update', (msg: MissionState) => {
      stateA = msg;
    });

    // Wait for first state update
    await new Promise((r) => setTimeout(r, 100));
    assertTrue(!!roomA.sessionId, 'Oyuncu 1 sunucuya bağlandı ve sessionId aldı');
    assertTrue(stateA !== null, 'Oyuncu 1 sunucu durumunu aldı');
    assertTrue(stateA?.roomCode === TEST_ROOM_CODE, `Oda kodu eşleşti: ${stateA?.roomCode}`);
    assertTrue(stateA?.myRole === 'kaptan', 'Oyuncu 1 Kaptan rolüne atandı');

    // -------------------------------------------------------------------------
    // TEST 2: İKİNCİ TELEFONDAN KODLA KATILMA (Player 2 - Mühendis)
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 2] Oyuncu 2 Başka Cihazdan Kodla Katılıyor...');
    let stateB: any = null;
    const roomB = await clientB.joinOrCreate('lost_signal', {
      roomCode: TEST_ROOM_CODE,
      playerName: 'Mühendis Can',
    });

    roomB.onMessage('state_update', (msg: MissionState) => {
      stateB = msg;
    });

    await new Promise((r) => setTimeout(r, 100));
    assertTrue(roomA.roomId === roomB.roomId, 'İki oyuncu da aynı odaya katıldı (roomId eşleşti)');
    assertTrue(stateB?.myRole === 'muhendis', 'Oyuncu 2 otomatik olarak Mühendis rolüne atandı');
    assertTrue(stateA?.players.muhendis.name === 'Mühendis Can', 'Oyuncu 1 ekranında Mühendis Can göründü');

    // -------------------------------------------------------------------------
    // TEST 3: ODA KAPASİTESİ (Maksimum 2 Oyuncu İzolasyonu)
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 3] 3. Oyuncunun Aynı Odaya Katılmasının Engellenmesi...');
    let player3JoinedSameRoom = false;
    try {
      const roomC = await clientC.joinOrCreate('lost_signal', {
        roomCode: TEST_ROOM_CODE,
        playerName: 'Davetsiz Misafir',
      });
      if (roomC.roomId === roomA.roomId) {
        player3JoinedSameRoom = true;
      }
      await roomC.leave();
    } catch {
      player3JoinedSameRoom = false;
    }
    assertTrue(!player3JoinedSameRoom, 'Oda kapasitesi 2 ile sınırlandırıldı, 3. oyuncu aynı odaya dahil edilmedi');

    // -------------------------------------------------------------------------
    // TEST 4: ROL GİZLİLİK VE VERİ İZOLASYONU (Role-based Secret Filtering)
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 4] Rol Tabanlı Gizli Bilgi İzolasyonu...');
    // Kaptan doğru kesiciyi ve beklenen frekansı görürken, mühendis göremez
    assertTrue(stateA?.diagnostic.correctBreaker !== null, 'Kaptan doğru reaktör kesici bilgisini görüyor');
    assertTrue(stateB?.diagnostic.correctBreaker === null, 'Mühendise kaptanın doğru kesici cevabı GİZLENDİ');
    assertTrue(stateA?.signal.computedCode !== '????', 'Kaptan sinyal çözüm kodunu görüyor');
    assertTrue(stateB?.signal.computedCode === '????', 'Mühendise sinyal çözüm kodu GİZLENDİ');
    assertTrue(stateB?.signal.correctFrequency === '??? MHz', 'Mühendise doğru frekans cevabı GİZLENDİ');

    // -------------------------------------------------------------------------
    // TEST 5: HAZIR OLMA VE ODA LİDERİ BAŞLATMA KONTROLÜ
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 5] Hazır Durumu ve Oda Lideri Yetkisi...');
    // Sadece oda lideri başlatabilir
    let errorFromNonHost = '';
    roomB.onMessage('error_message', (err: string) => {
      errorFromNonHost = err;
    });

    roomB.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA?.status === 'lobby', 'Oyuncu 2 (misafir) tek başına oyunu başlatamadı');

    // Oyuncu 1 hazır durumunu değiştirir
    roomA.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA?.players.kaptan.ready === true, 'Oyuncu 1 kendi hazır durumunu değiştirdi');
    assertTrue(stateA?.players.muhendis.ready === false, 'Oyuncu 2 henüz hazır değil');

    // Lider iki oyuncu hazır olmadan başlatamaz
    roomA.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA?.status === 'lobby', 'İki oyuncu da hazır olmadan lider başlatamadı');

    // Oyuncu 2 hazır olur
    roomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateB?.players.muhendis.ready === true, 'Oyuncu 2 kendi hazır durumunu değiştirdi');

    // Artık lider başlatabilir
    roomA.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA?.status === 'role_intro', 'Lider oyunu role_intro aşamasına başlattı');

    // Rol onayları
    roomA.send('confirm_role');
    roomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA?.status === 'phase_game', 'Rol onaylarından sonra 1. aşama oyunu başladı');

    // -------------------------------------------------------------------------
    // TEST 6: TUR KİMLİĞİ VE İŞLEM KİMLİĞİ KORUMASI (Deduplication & Staleness)
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 6] Tur/Aşama/İşlem Kimliği ile Eski ve Tekrarlanan Eylemlerin Engellenmesi...');
    const actionId1 = 'ACT-TEST-001';
    const currentRoundId = stateA!.roundId;
    const currentPhase = stateA!.currentPhaseIndex;

    // Hatalı frekans gönderilince ceza uygulanır
    const initialTime = stateA!.timeLeftSeconds;
    const initialHull = stateA!.hullIntegrity;

    roomB.send('game_action', {
      actionId: actionId1,
      roundId: currentRoundId,
      phaseIndex: currentPhase,
      actionType: 'signal_engineer_tune',
      data: { freq: '999.9 MHz' }, // Yanlış frekans
    });

    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA!.timeLeftSeconds === initialTime - 15, 'Hatalı frekans için -15 sn süre cezası uygulandı');
    assertTrue(stateA!.hullIntegrity === initialHull - 10, 'Hatalı frekans için -%10 bütünlük cezası uygulandı');

    // Aynı actionId tekrar gönderilince ikinci kez ceza UYGULANMAMALI
    roomB.send('game_action', {
      actionId: actionId1, // Aynı ID!
      roundId: currentRoundId,
      phaseIndex: currentPhase,
      actionType: 'signal_engineer_tune',
      data: { freq: '999.9 MHz' },
    });
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA!.timeLeftSeconds === initialTime - 15, 'Tekrarlanan işlem (aynı actionId) reddedildi, 2. kez ceza uygulanmadı');

    // Eski/yanlış roundId ile gönderilen istek reddedilmeli
    roomB.send('game_action', {
      actionId: 'ACT-TEST-002',
      roundId: 'RND-OLD-EXPIRED',
      phaseIndex: currentPhase,
      actionType: 'signal_engineer_tune',
      data: { freq: '999.9 MHz' },
    });
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(stateA!.timeLeftSeconds === initialTime - 15, 'Eski tur kimliğiyle gönderilen eylem reddedildi');

    // -------------------------------------------------------------------------
    // TEST 7: BAĞLANTI KOPMASI VE 45 SANİYE YENİDEN BAĞLANMA
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 7] Bağlantı Kopması (45s Süre ve Yeniden Bağlanma)...');
    const tokenB = roomB.reconnectionToken;
    assertTrue(!!tokenB, 'Oyuncu 2 reconnection token aldı');

    // Oyuncu 2'nin bağlantısı aniden kopar (close transport without consent)
    (roomB as any).connection.transport.close();
    await new Promise((r) => setTimeout(r, 100));

    assertTrue(stateA?.isPaused === true, 'Oyuncu kopunca görev sayacı ve kontroller duraklatıldı');
    assertTrue(stateA?.isDisconnected === true, 'Kopma durumu bildirim olarak yayınlandı');

    // Oyuncu 2 45 saniye dolmadan token ile yeniden bağlanır
    const reconnectedClientB = new Client(`ws://localhost:${actualPort}`);
    const reconnectedRoomB = await reconnectedClientB.reconnect(tokenB);
    await new Promise((r) => setTimeout(r, 100));

    assertTrue(reconnectedRoomB.roomId === roomA.roomId, 'Oyuncu 2 aynı odaya başarıyla yeniden bağlandı');
    assertTrue(stateA?.isPaused === false, 'Yeniden bağlanınca görev duraklatması kaldırıldı');
    assertTrue(stateA?.isDisconnected === false, 'Kopma alarmı kaldırıldı');

    // -------------------------------------------------------------------------
    // TEST 8: AYNI EKİPLE YENİDEN OYNAMA (Rematch - Room & Players Preserved)
    // -------------------------------------------------------------------------
    console.log('\n▶ [TEST 8] Aynı Ekiple Yeniden Oynama (Oda ve Oyuncular Korunur)...');
    roomA.send('restart_round');
    await new Promise((r) => setTimeout(r, 100));

    assertTrue(stateA?.roomCode === TEST_ROOM_CODE, 'Oda kodu korundu');
    assertTrue(stateA?.roundId !== currentRoundId, `Yeni tur kimliği üretildi: ${stateA?.roundId}`);
    assertTrue(stateA?.status === 'lobby', 'Lobiye dönüldü');
    assertTrue(stateA?.players.kaptan.name === 'Kaptan Ece', 'Kaptan korundu');
    assertTrue(stateA?.players.muhendis.name === 'Mühendis Can', 'Mühendis korundu');
    assertTrue(stateA?.players.kaptan.ready === false, 'Hazır durumları sıfırlandı');

    // Cleanup
    await roomA.leave();
    await reconnectedRoomB.leave();
  } finally {
    server.close();
  }

  console.log('\n======================================================================');
  console.log(`📊 COLYSEUS MULTIPLAYER TEST SONUCU: ${passedTests}/${totalTests} BAŞARILI`);
  if (failedTests > 0) {
    console.error(`❌ ${failedTests} TEST BAŞARISIZ OLDU!`);
    process.exit(1);
  } else {
    console.log('✅ TÜM COLYSEUS GERÇEK ÇOK OYUNCULU KONTROLLERİ EKSİKSİZ GEÇTİ!');
    console.log('======================================================================\n');
  }
}

runMultiplayerTests().catch((err) => {
  console.error('Fatal Test Exception:', err);
  process.exit(1);
});
