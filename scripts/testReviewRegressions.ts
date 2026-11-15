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

    // =========================================================================
    // BULGU 6: DERİN BASINÇ & GÖLGE PROTOKOLÜ ÇEVRİMİÇİ EYLEMLERİ VE İZOLASYON
    // =========================================================================
    console.log('\n▶ [BULGU 6] Derin Basınç & Gölge Protokolü Online Akışı ve Kayıp Sinyal İzolasyonu...');

    // 6A. Kayıp Sinyal must NOT allow theme_signal_solve bypass
    const kypRoomA = await clientA.create('lost_signal', {
      roomCode: 'KYP-ISO1',
      playerName: 'Kaptan',
      role: 'kaptan',
      operationTheme: 'kayip_sinyal',
      selectedMiniGames: ['sinyal_cozumu', 'kablo_baglantisi'],
    });
    let kypStateA: any = null;
    kypRoomA.onMessage('state_update', (m: MissionState) => { kypStateA = m; });
    const kypRoomB = await clientB.join('lost_signal', { roomCode: 'KYP-ISO1', playerName: 'Mühendis' });
    await new Promise((r) => setTimeout(r, 60));
    kypRoomA.send('toggle_ready');
    kypRoomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 50));
    kypRoomA.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    kypRoomA.send('confirm_role');
    kypRoomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 60));
    kypRoomB.send('action', {
      actionType: 'theme_signal_solve',
      roundId: kypStateA.roundId,
      phaseIndex: 0,
      data: { freq: '740 THz' },
    });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(kypStateA?.signal.isSolved === false, 'Kayıp Sinyal odası theme_signal_solve atlamasını engelledi');
    await kypRoomA.leave();
    await kypRoomB.leave();

    // 6B. Derin Basınç full online cooperative flow
    const dpRoomA = await clientA.create('lost_signal', {
      roomCode: 'DP-8842',
      playerName: 'Dümenci',
      role: 'kaptan',
      operationTheme: 'derin_basinc',
      selectedMiniGames: ['ariza_teshisi', 'sinyal_cozumu'],
    });
    let dpStateA: any = null;
    let dpStateB: any = null;
    dpRoomA.onMessage('state_update', (m: MissionState) => { dpStateA = m; });
    const dpRoomB = await clientB.join('lost_signal', { roomCode: 'DP-8842', playerName: 'Makinist' });
    dpRoomB.onMessage('state_update', (m: MissionState) => { dpStateB = m; });
    await new Promise((r) => setTimeout(r, 60));
    dpRoomA.send('toggle_ready');
    dpRoomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 50));
    dpRoomA.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    dpRoomA.send('confirm_role');
    dpRoomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 60));

    dpRoomA.send('action', { actionType: 'theme_diagnostic_captain_sync', roundId: dpStateA.roundId, phaseIndex: 0, data: {} });
    dpRoomB.send('action', { actionType: 'theme_diagnostic_solve', roundId: dpStateB.roundId, phaseIndex: 0, data: { tanks: { 1: false, 2: true, 3: false, 4: true }, pressure: 48 } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(dpStateA?.diagnostic.isSolved === true, 'Derin Basınç Aşama 1 sunucuda çözüldü');
    dpRoomA.send('advance_phase', { roundId: dpStateA.roundId, expectedPhaseIndex: 0 });
    await new Promise((r) => setTimeout(r, 60));

    dpRoomB.send('action', { actionType: 'theme_signal_solve', roundId: dpStateB.roundId, phaseIndex: 1, data: { freq: '433.8 MHz', tube: 2, torpFreq: 433.8 } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(dpStateA?.signal.isSolved === true, 'Derin Basınç Aşama 2 (Torpido/Sinyal) sunucuda çözüldü');
    dpRoomA.send('advance_phase', { roundId: dpStateA.roundId, expectedPhaseIndex: 1 });
    await new Promise((r) => setTimeout(r, 60));

    dpRoomA.send('action', { actionType: 'derin_basinc_transmit_core', roundId: dpStateA.roundId, phaseIndex: 2, data: {} });
    dpRoomB.send('action', { actionType: 'derin_basinc_seal_reactor', roundId: dpStateB.roundId, phaseIndex: 2, data: { k02Position: 20, valve1Open: true, currentPressure: 28 } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(dpStateA?.energy.isLocked === true, 'Derin Basınç Aşama 3 (Reaktör Mühürleme) sunucuda kilitlendi');
    dpRoomA.send('advance_phase', { roundId: dpStateA.roundId, expectedPhaseIndex: 2 });
    await new Promise((r) => setTimeout(r, 60));

    dpRoomA.send('action', { actionType: 'derin_basinc_transmit_vector', roundId: dpStateA.roundId, phaseIndex: 3, data: { angle: '28° DİKEY İNTİKAL' } });
    dpRoomB.send('action', { actionType: 'derin_basinc_trigger_ascent', roundId: dpStateB.roundId, phaseIndex: 3, data: { pressure: 18, angle: 28, tanks: { 1: true, 2: false, 3: true, 4: false } } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(dpStateA?.status === 'phase_result' && dpStateA?.outcomeType === 'tam_basari', 'Derin Basınç yüzeye çıkış ile tam başarıya ulaştı');
    await dpRoomA.leave();
    await dpRoomB.leave();

    // 6C. Gölge Protokolü full online cooperative flow
    const gpRoomA = await clientA.create('lost_signal', {
      roomCode: 'SHDW-5K9M',
      playerName: 'Ajan',
      role: 'kaptan',
      operationTheme: 'golge_protokolu',
      selectedMiniGames: ['ariza_teshisi', 'sinyal_cozumu'],
    });
    let gpStateA: any = null;
    gpRoomA.onMessage('state_update', (m: MissionState) => { gpStateA = m; });
    const gpRoomB = await clientB.join('lost_signal', { roomCode: 'SHDW-5K9M', playerName: 'Hacker' });
    await new Promise((r) => setTimeout(r, 60));
    gpRoomA.send('toggle_ready');
    gpRoomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 50));
    gpRoomA.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    gpRoomA.send('confirm_role');
    gpRoomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 60));

    gpRoomA.send('action', { actionType: 'theme_diagnostic_captain_sync', roundId: gpStateA.roundId, phaseIndex: 0, data: { solve: true, voltage: 24.5, deltaCable: 'SARI' } });
    gpRoomB.send('action', { actionType: 'theme_diagnostic_solve', roundId: gpStateA.roundId, phaseIndex: 0, data: { activeNode: 'BETA' } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(gpStateA?.diagnostic.isSolved === true, 'Gölge Protokolü Aşama 1 sunucuda çözüldü');
    gpRoomA.send('advance_phase', { roundId: gpStateA.roundId, expectedPhaseIndex: 0 });
    await new Promise((r) => setTimeout(r, 60));

    gpRoomA.send('action', { actionType: 'theme_signal_solve', roundId: gpStateA.roundId, phaseIndex: 1, data: { freq: '740 THz', prismAngle: 45 } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(gpStateA?.signal.isSolved === true, 'Gölge Protokolü Aşama 2 sunucuda çözüldü');
    gpRoomA.send('advance_phase', { roundId: gpStateA.roundId, expectedPhaseIndex: 1 });
    await new Promise((r) => setTimeout(r, 60));

    gpRoomB.send('action', { actionType: 'golge_energy_solve', roundId: gpStateA.roundId, phaseIndex: 2, data: {} });
    gpRoomA.send('action', { actionType: 'golge_energy_solve', roundId: gpStateA.roundId, phaseIndex: 2, data: { pin: '8429' } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(gpStateA?.energy.isLocked === true, 'Gölge Protokolü Aşama 3 kasa şifresi sunucuda çözüldü');
    gpRoomA.send('advance_phase', { roundId: gpStateA.roundId, expectedPhaseIndex: 2 });
    await new Promise((r) => setTimeout(r, 60));

    gpRoomA.send('action', { actionType: 'golge_transmit_escape', roundId: gpStateA.roundId, phaseIndex: 3, data: { route: 'helipad' } });
    gpRoomB.send('action', { actionType: 'golge_execute_extraction', roundId: gpStateA.roundId, phaseIndex: 3, data: { route: 'helipad' } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(gpStateA?.status === 'phase_result' && gpStateA?.outcomeType === 'tam_basari', 'Gölge Protokolü kaçış tahliyesi tam başarıya ulaştı');
    await gpRoomA.leave();
    await gpRoomB.leave();

    // =========================================================================
    // BULGU 7: GELİŞMİŞ MOD KORUMASI, RESTART_ROUND SLOTLARI VE KAPTAN DIŞI HOST
    // =========================================================================
    console.log('\n▶ [BULGU 7] gameMode Koruması, restart_round ve Kaptan Dışı Kurucu Rolü...');
    const gmRoomA = await clientA.create('lost_signal', {
      roomCode: 'GM-9001',
      playerName: 'Uzman Selin',
      role: 'muhendis',
      gameMode: 'gelismis',
      operationTheme: 'kayip_sinyal',
      selectedMiniGames: ['sinyal_cozumu', 'kablo_baglantisi'],
    });
    let gmStateA: any = null;
    let gmStateB: any = null;
    gmRoomA.onMessage('state_update', (m: MissionState) => { gmStateA = m; });
    await new Promise((r) => setTimeout(r, 60));

    assertTrue(gmStateA?.gameMode === 'gelismis', 'Kurucu gameMode=gelismis seçimi oda state içinde korundu');
    assertTrue(gmStateA?.hostId === gmRoomA.sessionId, 'Host sessionId doğru kaydedildi');

    const gmRoomB = await clientB.join('lost_signal', {
      roomCode: 'GM-9001',
      playerName: 'Kaptan Deniz',
    });
    gmRoomB.onMessage('state_update', (m: MissionState) => { gmStateB = m; });
    await new Promise((r) => setTimeout(r, 60));

    assertTrue(
      gmStateA?.players.kaptan.name === 'Kaptan Deniz' && gmStateA?.players.muhendis.name === 'Uzman Selin',
      'Mühendis olarak oda açıldığında ikinci oyuncu otomatik Kaptan rolüne atandı'
    );
    assertTrue(
      gmStateB?.myRole === 'kaptan' && gmStateA?.myRole === 'muhendis',
      'Her iki oyuncuya kendi myRole değeri doğru maskelendi'
    );

    gmRoomA.send('toggle_ready');
    gmRoomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 60));
    gmRoomA.send('start_game');
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(gmStateA?.status === 'role_intro', 'Mühendis kurucu start_game ile oyunu başlatabildi');

    // restart_round must preserve gameMode, hostId, and live sessionIds/connected flags
    gmRoomA.send('restart_round');
    await new Promise((r) => setTimeout(r, 80));
    assertTrue(gmStateA?.status === 'lobby', 'restart_round sonrası lobi ekranına dönüldü');
    assertTrue(gmStateA?.gameMode === 'gelismis', 'restart_round sonrası gameMode=gelismis korundu');
    assertTrue(gmStateA?.hostId === gmRoomA.sessionId, 'restart_round sonrası hostId korundu');
    assertTrue(
      gmStateA?.players.kaptan.connected === true &&
        gmStateA?.players.muhendis.connected === true &&
        gmStateA?.players.kaptan.id === gmRoomB.sessionId &&
        gmStateA?.players.muhendis.id === gmRoomA.sessionId,
      'restart_round sonrası her iki oyuncunun gerçek sessionId ve connected durumu korundu'
    );

    await gmRoomA.leave();
    await gmRoomB.leave();

    // =========================================================================
    // BULGU 8: MOD DOĞRULAMA, ACTION-ID SIRALAMASI, TEMA CEZA VE İFLAS GEÇİŞİ
    // =========================================================================
    console.log('\n▶ [BULGU 8] Mod Doğrulama, ActionId Sıralaması & Tema İflas/Ceza Senkronu...');
    const thRoomA = await clientA.create('lost_signal', {
      roomCode: 'SHDW-R88',
      playerName: 'Ajan Kaya',
      role: 'kaptan',
      operationTheme: 'golge_protokolu',
      selectedMiniGames: ['ariza_teshisi', 'sinyal_cozumu'],
    });
    let thStateA: any = null;
    let thStateB: any = null;
    let thErrorsA: string[] = [];
    let thErrorsB: string[] = [];
    thRoomA.onMessage('state_update', (m: MissionState) => { thStateA = m; });
    thRoomA.onMessage('error_message', (msg: string) => { thErrorsA.push(msg); });

    const thRoomB = await clientB.join('lost_signal', {
      roomCode: 'SHDW-R88',
      playerName: 'Hacker Naz',
    });
    thRoomB.onMessage('state_update', (m: MissionState) => { thStateB = m; });
    thRoomB.onMessage('error_message', (msg: string) => { thErrorsB.push(msg); });
    await new Promise((r) => setTimeout(r, 70));

    // Invalid set_game_mode should be rejected without overwriting gameMode
    thRoomA.send('set_game_mode', { mode: 'invalid_mode' });
    await new Promise((r) => setTimeout(r, 50));
    assertTrue(thStateA?.gameMode === 'standart', 'Geçersiz set_game_mode değeri reddedildi (standart korundu)');

    thRoomA.send('toggle_ready');
    thRoomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 50));
    thRoomA.send('start_game');
    await new Promise((r) => setTimeout(r, 50));
    thRoomA.send('confirm_role');
    thRoomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 70));

    // Sending an actionId with wrong phaseIndex must NOT burn the actionId
    thRoomA.send('game_action', {
      actionId: 'ACT-REUSE-SAFE',
      roundId: thStateA!.roundId,
      phaseIndex: 99,
      actionType: 'theme_diagnostic_captain_sync',
      data: { solve: true, voltage: 24.5, deltaCable: 'SARI' },
    });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(thStateA?.diagnostic?.isSolved === false, 'Yanlış phaseIndex ile gönderilen aksiyon reddedildi');

    thRoomA.send('game_action', {
      actionId: 'ACT-REUSE-SAFE',
      roundId: thStateA!.roundId,
      phaseIndex: 0,
      actionType: 'theme_diagnostic_captain_sync',
      data: { solve: true, voltage: 24.5, deltaCable: 'SARI' },
    });
    thRoomB.send('game_action', {
      actionId: 'ACT-HACKER-BRIDGE',
      roundId: thStateB!.roundId,
      phaseIndex: 0,
      actionType: 'theme_diagnostic_solve',
      data: { activeNode: 'BETA' },
    });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(thStateA?.diagnostic?.isSolved === true, 'Yanlış fazda reddedilen actionId geçerli fazda tekrar kullanıldığında işlendi');

    // Wrong theme_signal_solve prismAngle applies penalty and does NOT solve
    thRoomA.send('advance_phase', { roundId: thStateA!.roundId, expectedPhaseIndex: 0 });
    await new Promise((r) => setTimeout(r, 50));
    const stealthBeforeWrong = thStateA!.stealthLevel ?? 100;
    thRoomA.send('game_action', {
      actionId: 'ACT-WRONG-PRISM',
      roundId: thStateA!.roundId,
      phaseIndex: 1,
      actionType: 'theme_signal_solve',
      data: { prismAngle: 90 },
    });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(
      thStateA?.signal?.isSolved === false && (thStateA?.stealthLevel ?? 100) < stealthBeforeWrong,
      'Gölge Protokolü yanlış prizma açısı gizlilik cezası uyguladı ve fazı çözmedi'
    );

    // Correct prismAngle + empFreq solves Phase 1, then repeated wrong golge_energy_solve PIN depletes stealthLevel -> basarisizlik
    thRoomA.send('game_action', {
      actionId: 'ACT-RIGHT-PRISM',
      roundId: thStateA!.roundId,
      phaseIndex: 1,
      actionType: 'theme_signal_solve',
      data: { prismAngle: 45 },
    });
    thRoomB.send('game_action', {
      actionId: 'ACT-RIGHT-EMP',
      roundId: thStateB!.roundId,
      phaseIndex: 1,
      actionType: 'theme_signal_solve',
      data: { empFreq: 740 },
    });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(thStateA?.signal?.isSolved === true, 'Gölge Protokolü doğru prizma + EMP ile Faz 1 çözüldü');

    thRoomA.send('advance_phase', { roundId: thStateA!.roundId, expectedPhaseIndex: 1 });
    await new Promise((r) => setTimeout(r, 50));

    // Exhaust stealthLevel with wrong PINs until basarisizlik
    for (let i = 0; i < 10; i++) {
      if (thStateA?.status === 'phase_result') break;
      thRoomA.send('game_action', {
        actionId: `ACT-BAD-PIN-${i}`,
        roundId: thStateA!.roundId,
        phaseIndex: 2,
        actionType: 'golge_energy_solve',
        data: { pin: '0000' },
      });
      await new Promise((r) => setTimeout(r, 35));
    }
    assertTrue(
      thStateA?.status === 'phase_result' && thStateA?.outcomeType === 'basarisizlik',
      'Gizlilik seviyesi sıfırlandığında Gölge Protokolü sunucuda otomatik başarısızlık sonucuna geçti'
    );
    await thRoomA.leave();
    await thRoomB.leave();

    // Online Karantina role check
    const krRoomA = await clientA.create('lost_signal', {
      roomCode: 'KR-REG8',
      playerName: 'Biyolog',
      role: 'kaptan',
      operationTheme: 'karantina_2088',
    });
    let krStateA: any = null;
    let krErrorsA: string[] = [];
    krRoomA.onMessage('state_update', (m: MissionState) => { krStateA = m; });
    krRoomA.onMessage('error_message', (msg: string) => { krErrorsA.push(msg); });
    const krRoomB = await clientB.join('lost_signal', { roomCode: 'KR-REG8', playerName: 'Güvenlik' });
    await new Promise((r) => setTimeout(r, 50));
    krRoomA.send('toggle_ready');
    krRoomB.send('toggle_ready');
    await new Promise((r) => setTimeout(r, 40));
    krRoomA.send('start_game');
    await new Promise((r) => setTimeout(r, 40));
    krRoomA.send('confirm_role');
    krRoomB.send('confirm_role');
    await new Promise((r) => setTimeout(r, 60));

    // Muhendis tries Bio transmit -> rejected; Kaptan tries Sec solve -> rejected
    krRoomB.send('action', { actionType: 'karantina_phase1_bio_transmit', roundId: krStateA!.roundId, phaseIndex: 0, data: { spectralNm: 415, base: 'sitozin-9' } });
    krRoomA.send('action', { actionType: 'karantina_phase1_sec_solve', roundId: krStateA!.roundId, phaseIndex: 0, data: { sector: 3, valve: 'B' } });
    await new Promise((r) => setTimeout(r, 60));
    assertTrue(
      krStateA?.karantinaData?.bioPhase1Transmitted === false && krStateA?.karantinaData?.phase1Solved === false && krErrorsA.length > 0,
      'Çevrimiçi Karantina modunda çapraz rol aksiyonları sunucu tarafından reddedildi'
    );
    await krRoomA.leave();
    await krRoomB.leave();
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
