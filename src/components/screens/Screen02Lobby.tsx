import React, { useState } from 'react';
import { 
  MissionState, 
  EnvironmentType, 
  ENVIRONMENTS,
  MiniGameType,
  GameMode
} from '../../types/game';
import { colyseusClient } from '../../services/colyseusClient';
import { getRandomMiniGames } from '../../services/gameFactory';
import { ScreenKarantinaLobby } from './karantina/ScreenKarantinaLobby';
import { soundManager } from '../../services/soundEffects';

export const getMiniGameIcon = (game: MiniGameType): string => {
  switch (game) {
    case 'ariza_teshisi': return '⚡';
    case 'sinyal_cozumu': return '📡';
    case 'kablo_baglantisi': return '🔌';
    case 'hava_kilidi': return '🚪';
    case 'radar_yonlendirme': return '🧭';
    default: return '🎯';
  }
};

export const getMiniGameTitle = (game: MiniGameType, isDerin: boolean, isGolge: boolean): string => {
  if (isDerin) {
    switch (game) {
      case 'ariza_teshisi': return 'Balast Valfi';
      case 'sinyal_cozumu': return 'Sonar & Glif';
      case 'kablo_baglantisi': return 'Veri Hattı';
      case 'hava_kilidi': return 'Basınç Kabini';
      case 'radar_yonlendirme': return 'Derin Radar';
      default: return game;
    }
  }
  if (isGolge) {
    switch (game) {
      case 'ariza_teshisi': return 'Güvenlik Duvarı';
      case 'sinyal_cozumu': return 'Kripto Şifre';
      case 'kablo_baglantisi': return 'Ağ Terminalleri';
      case 'hava_kilidi': return 'Kasa Kilidi';
      case 'radar_yonlendirme': return 'Ağ Düğümü';
      default: return game;
    }
  }
  switch (game) {
    case 'ariza_teshisi': return 'Arıza Teşhisi';
    case 'sinyal_cozumu': return 'Sinyal Çözümü';
    case 'kablo_baglantisi': return 'Kablo Bağlantısı';
    case 'hava_kilidi': return 'Hava Kilidi';
    case 'radar_yonlendirme': return 'Radar Kalibrasyon';
    default: return game;
  }
};

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onStartGame: () => void;
  isOnline?: boolean;
  isHost?: boolean;
  onToggleMyReady?: () => void;
}

export const Screen02Lobby: React.FC<Props> = ({ 
  state, 
  onUpdate, 
  onStartGame,
  isOnline = false,
  isHost = true,
  onToggleMyReady,
}) => {
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [radioTesting, setRadioTesting] = useState(false);

  const handleTestRadio = () => {
    setRadioTesting(true);
    soundManager.playRadioChirp();
    setTimeout(() => setRadioTesting(false), 2200);
  };

  const copyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyInviteLink = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      const cleanCode = state.roomCode.replace(/^(KYP|DP)-?/i, '');
      const url = new URL(window.location.href);
      url.searchParams.set('room', cleanCode);
      navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      copyCode();
    }
  };

  const toggleMyReady = () => {
    if (onToggleMyReady) {
      onToggleMyReady();
      return;
    }
    const currentRole = state.myRole;
    onUpdate((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [currentRole]: {
          ...prev.players[currentRole],
          ready: !prev.players[currentRole].ready,
        },
      },
    }));
  };

  const togglePartnerReady = () => {
    if (isOnline) {
      alert('Gerçek çevrimiçi odada partneriniz kendi cihazından hazır olmalıdır.');
      return;
    }
    const otherRole = state.myRole === 'kaptan' ? 'muhendis' : 'kaptan';
    onUpdate((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [otherRole]: {
          ...prev.players[otherRole],
          ready: !prev.players[otherRole].ready,
        },
      },
    }));
  };

  const handleRerollTasks = () => {
    const newGames = getRandomMiniGames(state.selectedMiniGames);
    onUpdate((prev) => ({
      ...prev,
      selectedMiniGames: newGames,
      advancedScenario: prev.advancedScenario
        ? {
            ...prev.advancedScenario,
            activeSubsystemTab: newGames[0] === 'ariza_teshisi' ? 'reaktor' :
                               newGames[0] === 'sinyal_cozumu' ? 'sinyal' :
                               newGames[0] === 'hava_kilidi' ? 'hava_kilidi' :
                               newGames[0] === 'kablo_baglantisi' ? 'kablo' : 'radar',
          }
        : undefined,
    }));
  };

  // Check if player 2 is really connected in online mode
  const isPlayer2Joined = isOnline 
    ? (state.players.muhendis.connected ?? (Boolean(state.players.muhendis.id) && state.players.muhendis.id !== 'player_muhendis' && state.players.muhendis.id !== ''))
    : true;

  const isBothReady = isPlayer2Joined && state.players.kaptan.ready && state.players.muhendis.ready;
  const isKarantina = state.operationTheme === 'karantina_2088';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  if (isKarantina) {
    return (
      <ScreenKarantinaLobby
        state={state}
        onUpdate={onUpdate}
        onStartGame={onStartGame}
        isOnline={isOnline}
        isHost={isHost}
        onToggleMyReady={onToggleMyReady}
      />
    );
  }

  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto min-h-screen bg-[#141123] text-[#e6dff9] flex flex-col justify-between pb-safe select-none overflow-x-hidden animate-fadeIn font-sans">
        {/* Screen Header */}
        <header className="relative w-full z-20 bg-[#141123]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                aria-label="Operasyondan Ayrıl"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2b273b]/60 text-[#d3fbff] hover:text-white transition-colors"
                onClick={() => onUpdate((prev) => ({ ...prev, status: 'entry' }))}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-[#ffb703] tracking-widest uppercase">
                  GÖLGE PROTOKOLÜ // SİBER OPERASYON
                </span>
                <h1 className="font-sora text-sm font-bold text-[#e6dff9] tracking-tight uppercase leading-none">
                  Konsol Terminali
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#363246]/60 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse"></span>
                <span className="font-mono text-[9px] text-[#00eefc] uppercase font-bold">SESLİ HAT: ŞİFRELİ</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#ffdba0] text-[#422c00] flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full gap-3 px-4 pt-3 pb-6">
          {/* Telemetry Sub-Header & Live Mission Radar HUD */}
          <section className="flex flex-col gap-2">
            <div className="bg-[#1c192c] rounded-xl p-3 shadow-md flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_8px_#00eefc]"></span>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[9px] text-[#ffb703] tracking-wider truncate font-bold uppercase">
                    KOD ADI // SIZMA
                  </span>
                  <span className="font-sora text-sm font-bold text-white truncate">OPERASYON: NEON KASA</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-[#2b273b] px-2.5 py-1 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-[#ffba27] text-[16px]">timer</span>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-[8px] text-[#9e8f78]">ZAMAN SINIRI</span>
                  <span className="font-mono text-xs text-[#ffdba0] font-bold">05:00</span>
                </div>
              </div>
            </div>

            {/* Sub-bar Telemetry */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#201d30] rounded-lg px-3 py-1.5 flex items-center justify-between border border-white/5">
                <span className="font-mono text-[9px] text-[#9e8f78] truncate">HEDEF: MEGACORP</span>
                <span className="material-symbols-outlined text-[#d3fbff] text-[14px]">corporate_fare</span>
              </div>
              <div className="bg-[#201d30] rounded-lg px-3 py-1.5 flex items-center justify-between border border-white/5">
                <span className="font-mono text-[9px] text-[#9e8f78] truncate">UYDU: SENKRON</span>
                <span className="font-mono text-[9px] text-[#00eefc] font-bold">99.8% GÜVENLİ</span>
              </div>
            </div>
          </section>

          {/* 2.5D Tactical Espionage Visual Blueprint Stage */}
          <section className="relative w-full h-44 rounded-2xl overflow-hidden shadow-xl bg-[#0f0c1e] border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDndKr82uZk6G0DPb27wnIcxhubv8ms_OuXZMlesBI4S0i7CY3Ag4v5N_-B6hrKmIayZEXmvT47jqT7bqorWysPYzNRLK7k3PAJntHdISVbfiHD9au2B7sqxqbXOaoCuFOD5eW0jB1QoLz4QFvK01WzCrHKrqHnH_KCh1zpmgs-bBZ7CCq969l-6mu6qarOhKvObVV6a_ccOTxBkGm678ej8mSlttDqhUNLb2B4xsQ')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#141123] via-[#141123]/60 to-transparent"></div>
            <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 bg-[#363246]/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                  <span className="material-symbols-outlined text-[#00eefc] text-[12px] animate-spin">cyclone</span>
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-widest font-bold">GÜVENLİK PROTOKOLÜ V.4</span>
                </div>
                <span className="bg-[#ffdba0]/20 text-[#ffba27] px-2 py-0.5 rounded font-mono text-[9px] font-bold">
                  SEKTÖR: 09-D
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-widest uppercase font-bold">
                    MEGACORP VERİ ÇEKİRDEĞİ
                  </span>
                  <span className="text-xs text-[#eed8ff]">Merkezi Bellek Kasası // Kat 84</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#2b273b]/90 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
                  <span className="font-mono text-[9px] text-white font-bold">RADAR: AKTİF</span>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Lobby Operatives Pod */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-[#9e8f78] tracking-wider uppercase font-bold">TAKIM ODASI</span>
                <span className="px-2 py-0.5 rounded-full bg-[#363246] text-[#ffdba0] font-mono text-[10px] font-bold border border-white/10">
                  KOD: {state.roomCode}
                </span>
              </div>
              <button
                className="text-[#00eefc] font-mono text-[10px] font-bold hover:text-white transition-colors cursor-pointer"
                onClick={copyCode}
                type="button"
              >
                {copied ? 'KOPYALANDI!' : 'KODU KOPYALA'}
              </button>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 gap-2">
              {/* Player 1: Sahadaki Ajan */}
              <div className="bg-[#201d30] rounded-xl p-3 shadow-md flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl bg-[#2b273b] overflow-hidden shrink-0 border border-white/10 shadow-inner">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDevmRBoJeZ2DYXEp2G2b1briE0qACLxBmTGpfKLMs4jV89J-ZbNX3TOR7npP6zq1R3uPURa4u1vh0bWsAh0Evl4zA12AJ8YqaESnkp4cXT5bMjDABYTetN6fqgAfR4wUuCEkBGlnItT5JfoqKmcWC-ctA-9h9iQsZNXCupcPa3EzFy1VnEjED9tJQc5UP8qJpr_hDBrc8bMQEnTlO8MvBlJBMxa2IxJVuEVvvT_gA"
                      alt="Sahadaki Ajan Ece"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00eefc] rounded-full shadow-[0_0_6px_#00eefc]"></span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sora text-sm font-bold text-white truncate">
                        {state.players.kaptan.name || 'Ece'}
                      </span>
                      <span className="font-mono text-[8px] px-1.5 py-0.2 bg-[#ffdba0]/20 text-[#ffba27] rounded font-bold">
                        LİDER
                      </span>
                    </div>
                    <span className="text-[11px] text-[#00eefc] font-mono truncate">
                      Sahadaki Ajan [Infiltrator]
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <button
                    onClick={state.myRole === 'kaptan' ? toggleMyReady : togglePartnerReady}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      state.players.kaptan.ready
                        ? 'bg-[#00eefc]/20 text-[#00eefc] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                        : 'bg-[#363246] text-[#9e8f78] border border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {state.players.kaptan.ready ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{state.players.kaptan.ready ? 'HAZIR' : 'BEKLİYOR'}</span>
                  </button>
                  <span className="font-mono text-[9px] text-[#9e8f78] mt-1">PİNG: 14ms</span>
                </div>
              </div>

              {/* Player 2: Gölge Hacker */}
              <div className="bg-[#201d30] rounded-xl p-3 shadow-md flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl bg-[#2b273b] overflow-hidden shrink-0 border border-white/10 shadow-inner">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9XvOIZt_5zEYmEnY25S1b0pghOqOmJzlPqqMab2oVJD0ioifXRVDRZS7zbaTpAF5LItCTJ5kkwrIwBY25Z87b8EWm8eWRJ1N9knqXZVdq6_SfJUsqshfzGt2mGlzm7UNCXg5I-5WSAICQ4iYAmeVzl9fYFod9ysqOt9UmehGDIlnw_QZjYbO0Xi-hFUkU2R5hO7Tb1_DnxBL_tpe27gE83s_BEBMiQFww8RwFYiw"
                      alt="Gölge Hacker Mert"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00eefc] rounded-full shadow-[0_0_6px_#00eefc]"></span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sora text-sm font-bold text-white truncate">
                        {state.players.muhendis.name || 'Mert'}
                      </span>
                      <span className="font-mono text-[8px] px-1.5 py-0.2 bg-[#dab5ff]/20 text-[#dab5ff] rounded font-bold">
                        ŞİFRE KIRICI
                      </span>
                    </div>
                    <span className="text-[11px] text-[#d3fbff] font-mono truncate">
                      Gölge Hacker [Netrunner]
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <button
                    onClick={state.myRole === 'muhendis' ? toggleMyReady : togglePartnerReady}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      state.players.muhendis.ready
                        ? 'bg-[#00eefc]/20 text-[#00eefc] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                        : 'bg-[#363246] text-[#9e8f78] border border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {state.players.muhendis.ready ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{state.players.muhendis.ready ? 'HAZIR' : 'BEKLİYOR'}</span>
                  </button>
                  <span className="font-mono text-[9px] text-[#9e8f78] mt-1">PİNG: 19ms</span>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Parameters Telemetry Grid */}
          <section className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 px-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">tune</span>
              <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider font-bold">
                OPERASYON PARAMETRELERİ
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1c192c] p-2.5 rounded-xl flex flex-col justify-between border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#9e8f78]">KADRO</span>
                  <span className="material-symbols-outlined text-[#ffdba0] text-[16px]">group</span>
                </div>
                <div className="mt-1">
                  <span className="font-sora text-xs font-semibold text-white block">2 Oyuncu</span>
                  <span className="font-mono text-[9px] text-[#00eefc]">TAM EŞZAMANLI</span>
                </div>
              </div>
              <div className="bg-[#1c192c] p-2.5 rounded-xl flex flex-col justify-between border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#9e8f78]">İLETİŞİM</span>
                  <span className="material-symbols-outlined text-[#00eefc] text-[16px]">cell_tower</span>
                </div>
                <div className="mt-1">
                  <span className="font-sora text-xs font-semibold text-white block">Asimetrik Şifreli</span>
                  <span className="font-mono text-[9px] text-[#ffba27]">KRİPTO TELSİZ</span>
                </div>
              </div>
              <div className="bg-[#1c192c] p-2.5 rounded-xl flex flex-col justify-between border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#9e8f78]">ENGEL DERECESİ</span>
                  <span className="material-symbols-outlined text-[#eed8ff] text-[16px]">key</span>
                </div>
                <div className="mt-1">
                  <span className="font-sora text-xs font-semibold text-white block">4 Aşama</span>
                  <span className="font-mono text-[9px] text-[#dab5ff]">GÜVENLİK KIRMA</span>
                </div>
              </div>
              <div className="bg-[#1c192c] p-2.5 rounded-xl flex flex-col justify-between border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#9e8f78]">SESSİZLİK</span>
                  <span className="material-symbols-outlined text-[#ffba27] text-[16px]">volume_off</span>
                </div>
                <div className="mt-1">
                  <span className="font-sora text-xs font-semibold text-white block">%100 Gizlilik</span>
                  <span className="font-mono text-[9px] text-[#ffb703]">SIFIR TESPİT</span>
                </div>
              </div>
            </div>
          </section>

          {/* Automated Randomized Mission Sequence Card for Gölge Protokolü */}
          {state.selectedMiniGames && (
            <section className="p-3 rounded-2xl bg-[#1c192c] border border-[#00eefc]/30 shadow-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#00eefc] font-bold">
                    🎲 SİSTEMİN OTOMATİK GÖREV SIRASI
                  </span>
                </div>
                {(!isOnline || isHost) && (
                  <button
                    onClick={handleRerollTasks}
                    type="button"
                    className="px-2 py-0.5 rounded-lg bg-[#00eefc]/15 hover:bg-[#00eefc]/25 active:scale-95 font-mono text-[9px] text-[#00eefc] border border-[#00eefc]/40 cursor-pointer flex items-center gap-1 font-bold shadow"
                    title="Görevleri Yeniden Karıştır"
                  >
                    <span>🎲</span>
                    <span>Yeniden Karıştır</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-2 rounded-xl bg-[#201d30] border border-[#00eefc]/20 flex flex-col items-center">
                  <span className="font-mono text-[8px] text-[#00eefc] font-bold uppercase">1. Aşama</span>
                  <span className="text-sm my-0.5">{getMiniGameIcon(state.selectedMiniGames[0])}</span>
                  <span className="font-sora text-[9px] font-semibold text-white leading-tight truncate max-w-full">
                    {getMiniGameTitle(state.selectedMiniGames[0], false, true)}
                  </span>
                  <span className="font-mono text-[7px] text-[#00eefc]/70 uppercase">Rastgele</span>
                </div>

                <div className="p-2 rounded-xl bg-[#201d30] border border-[#ffba27]/20 flex flex-col items-center">
                  <span className="font-mono text-[8px] text-[#ffba27] font-bold uppercase">2. Aşama</span>
                  <span className="text-sm my-0.5">{getMiniGameIcon(state.selectedMiniGames[1])}</span>
                  <span className="font-sora text-[9px] font-semibold text-white leading-tight truncate max-w-full">
                    {getMiniGameTitle(state.selectedMiniGames[1], false, true)}
                  </span>
                  <span className="font-mono text-[7px] text-[#ffba27]/70 uppercase">Rastgele</span>
                </div>

                <div className="p-2 rounded-xl bg-[#201d30] border border-[#dab5ff]/20 flex flex-col items-center">
                  <span className="font-mono text-[8px] text-[#dab5ff] font-bold uppercase">3. Aşama</span>
                  <span className="text-sm my-0.5">⚡</span>
                  <span className="font-sora text-[9px] font-semibold text-white leading-tight truncate max-w-full">
                    Kasa Şebekesi
                  </span>
                  <span className="font-mono text-[7px] text-[#dab5ff]/70 uppercase">Dağıtım</span>
                </div>

                <div className="p-2 rounded-xl bg-[#201d30] border border-[#ffb4ab]/20 flex flex-col items-center">
                  <span className="font-mono text-[8px] text-[#ffb4ab] font-bold uppercase">4. Aşama</span>
                  <span className="text-sm my-0.5">🛸</span>
                  <span className="font-sora text-[9px] font-semibold text-white leading-tight truncate max-w-full">
                    Siber Kaçış
                  </span>
                  <span className="font-mono text-[7px] text-[#ffb4ab]/70 uppercase">Tahliye</span>
                </div>
              </div>
            </section>
          )}

          {/* Live Audio Signal Telemetry Gauge */}
          <section className="bg-[#0f0c1e] p-2.5 rounded-xl flex flex-col gap-1.5 border border-white/5 shadow-inner">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[16px]">graphic_eq</span>
                <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider font-bold">
                  SESLİ HAT FREKANSI // 44.1 KHZ
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#00eefc] font-bold">SİNYAL: %98</span>
            </div>
            <div className="grid grid-cols-12 gap-1 h-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-[#00eefc] rounded-sm"></div>
              ))}
              <div className="bg-[#00eefc]/40 rounded-sm"></div>
              <div className="bg-[#363246] rounded-sm"></div>
            </div>
          </section>

          {/* Mission Dispatch Action Pod */}
          <section className="pt-2 flex flex-col gap-2">
            <button
              onClick={onStartGame}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] py-3.5 px-4 rounded-xl font-sora text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,183,3,0.35)] active:scale-[0.98] transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[#271900] text-[22px]">lock_open</span>
              <span>OPERASYONU BAŞLAT</span>
              <span className="material-symbols-outlined text-[#271900] text-[20px]">chevron_right</span>
            </button>

            <button
              onClick={handleTestRadio}
              className="w-full bg-[#2b273b] hover:bg-[#363246] text-[#00eefc] py-2.5 px-4 rounded-xl font-sora text-xs flex items-center justify-center gap-2 transition-colors border border-white/5 cursor-pointer"
              type="button"
            >
              <span className={`material-symbols-outlined text-[#00eefc] text-[18px] ${radioTesting ? 'animate-spin' : ''}`}>
                {radioTesting ? 'sync' : 'sensors'}
              </span>
              <span>{radioTesting ? 'KRİPTO-LİNK DOĞRULANIYOR... [OK]' : 'Şifreli Telsiz Bağlantısını Sına (Kripto-Link)'}</span>
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#0a0815] text-white flex flex-col justify-between pb-6 rounded-[42px] border border-white/10 shadow-2xl relative select-none overflow-hidden animate-fadeIn font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#00eefc]/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#f59e0b]/15 rounded-full blur-[90px] pointer-events-none"></div>

      {/* TopBar / Header */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-6 pb-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2">
          {isDerinBasinc ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-[#00eefc]">
                <span className="material-symbols-outlined text-[18px]">anchor</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-cyan-300 uppercase tracking-widest leading-none">
                  DERİN DALIP // PROTOKOLÜ
                </span>
                <h1 className="font-sora text-xs font-bold text-white tracking-tight leading-tight mt-0.5">
                  HİDRO-04 Dalış Kabini
                </h1>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center justify-center w-7 h-7">
                <svg className="w-6 h-6 text-[#f59e0b]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="#f59e0b" strokeWidth="2" transform="rotate(-30 12 12)"></ellipse>
                  <circle cx="12" cy="12" fill="none" r="5.5" stroke="#f59e0b" strokeWidth="2.2"></circle>
                </svg>
              </div>
              <span className="font-extrabold tracking-wider text-[15px] text-white/95 uppercase font-sora">
                PARTYVERSE
              </span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          {isDerinBasinc && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high/80 border border-white/10">
              <span className="material-symbols-outlined text-amber-400 text-[14px] animate-pulse">timer</span>
              <span className="font-mono text-[10px] text-[#ffba27] font-bold">04:32</span>
            </div>
          )}
          {!isOnline && (
            <button
              onClick={togglePartnerReady}
              title="Eşlikçi hazır durumunu değiştir (Tek cihazda test için)"
              className="w-9 h-9 rounded-xl bg-[#1d1b32]/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white shadow-inner active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-[#1d1b32]/80 border border-white/10 flex items-center justify-center text-slate-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-4 flex flex-col space-y-3 pt-1">
        
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[260px] flex flex-col justify-end p-4 shadow-xl">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img 
              src={
                isDerinBasinc
                  ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAaVqfH-Ps6RyTNUmw7Q8HWHtJ5dUrrQp7WMlBNMkfi_jZ4hZ-rFQdcu4gHHX2CKrMJs0Dn2-ABA8FhNKdXoZ6V-Rs5Gmi27TGrmL8upPQjYdZ4AmZjvwQZC3wCHpwNmg5p3RjibcYYt0gAEaT29wcJvTfvUfcQ7lawXjfOTj0e7N-HNAHkunniBrh0u6Ysr4TRu1nTud6WDNZ2IzdOMhk4mHgisqbb9SZmnvUjxvA"
                  : "https://lh3.googleusercontent.com/aida-public/AB6AXuBCR0yjFbJiiqtroQLKV2y0sAgrkg4pcUvJIu15SqGHH0MXFUSvSjGsOl6o-iZITWJCdU0FJKV2zkv-KyVquO_n9tktiCkvF5thupF9E9jh03uATTeL12UqevQJh7RpGdIMWZ_KGFVL4j2Lf01YIGfvCn7FAUHMLy7u8pDbxfFEyWd2VR4JgoyGVjqsQx4-jlPS1YH9fxpr80PbwCMR3Z7Dkx49OgtbtuTFtHePdLM"
              }
              alt={isDerinBasinc ? "HİDRO-04 Batiskap Abisal Hendek" : "Uzay İstasyonu Hangar ve Reaktör Vitrini"} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d1f] via-[#0e0d1f]/60 to-transparent"></div>
          </div>

          {/* Floating Badges for Deep Sea */}
          {isDerinBasinc && (
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e0d1f]/85 border border-cyan-400/30 backdrop-blur-md">
                <span className="font-mono text-[9px] text-[#ffba27] font-bold">KRİTİK BASINÇ: 85.2 ATM</span>
                <span className="text-white/40">•</span>
                <span className="font-mono text-[9px] text-cyan-300 font-bold">DERİNLİK: -850M</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-[#00eefc]/40 text-[#00eefc] font-mono text-[9px] font-bold">
                %98 İNTİBAK
              </span>
            </div>
          )}

          <div className="relative z-10 pt-16">
            {isDerinBasinc ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-mono text-[9px] font-bold uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>BATİSKAF SİNYALİ // AKTİF</span>
                </div>
                <h1 className="text-3xl leading-[1.05] font-black tracking-tight font-sora">
                  <span className="block text-white drop-shadow-md">Derin</span>
                  <span className="block text-[#00eefc] drop-shadow-[0_0_16px_rgba(0,238,252,0.65)] tracking-normal">Basınç // Batış</span>
                </h1>
                <p className="text-[12px] leading-snug text-slate-300 font-normal mt-1 max-w-[285px]">
                  Abisal hendekte -850 metrede batış. Kabin içi basınç kritik, dümenci ve makinist koordinasyonu şart.
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>SONAR: TEMAS BEKLENİYOR</span>
                  </div>
                  <span className="text-[#ffba27] font-bold">TRX-7</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl leading-[1.05] font-black tracking-tight font-sora">
                  <span className="block text-white drop-shadow-md">Kayıp</span>
                  <span className="block text-[#00eefc] drop-shadow-[0_0_16px_rgba(0,238,252,0.65)] tracking-normal">Sinyal</span>
                </h1>
                <p className="text-[12px] leading-snug text-slate-300 font-normal mt-1.5 max-w-[275px]">
                  İstasyon sessiz. Reaktör dengesiz. Sinyali geri getirmek için birlikte çalışın.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Room Code Card */}
        <section className="rounded-2xl px-4 py-3 bg-gradient-to-b from-[#1d1a34]/70 to-[#110f22]/85 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-slate-400 font-mono">
                {isDerinBasinc ? 'KATILIM KODU' : 'ODA KODU'}
              </span>
              <div className="text-[25px] font-black tracking-wider text-[#fbbf24] font-sora -mt-0.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">
                {state.roomCode || 'DP-9480'}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={copyInviteLink}
                className="px-2.5 h-10 rounded-xl bg-[#00eefc]/15 border border-[#00eefc]/40 hover:border-[#00eefc] flex items-center justify-center text-cyan-300 text-xs font-bold active:scale-95 transition-all shadow-md cursor-pointer gap-1.5" 
                title="Katılım Linkini Kopyala" 
                type="button"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Linki Kopyala</span>
              </button>
              <button 
                onClick={copyCode}
                className="w-10 h-10 rounded-xl bg-[#1f1d38] border border-[#00eefc]/30 hover:border-[#00eefc] flex items-center justify-center text-cyan-300 active:scale-95 transition-all shadow-md cursor-pointer" 
                title="Sadece Kodu Kopyala" 
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="13" rx="2" ry="2" width="13" x="9" y="9"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
              </button>
              <button 
                onClick={() => setShowQrModal(true)}
                className="w-10 h-10 rounded-xl bg-[#1f1d38] border border-[#00eefc]/30 hover:border-[#00eefc] flex items-center justify-center text-cyan-300 active:scale-95 transition-all shadow-md cursor-pointer" 
                title="QR Kodu Göster" 
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="7" rx="1" width="7" x="3" y="3"></rect>
                  <rect height="7" rx="1" width="7" x="14" y="3"></rect>
                  <rect height="7" rx="1" width="7" x="3" y="14"></rect>
                  <path d="M14 14h3v3h-3z"></path>
                  <path d="M19 14h2v2h-2z"></path>
                  <path d="M14 19h2v2h-2z"></path>
                  <path d="M19 19h2v2h-2z"></path>
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium leading-none">
            {copied ? '✓ Kopyalandı! Arkadaşına gönder, doğrudan bu odaya bağlansın.' : 'Linki veya kodu arkadaşına gönder; katıldığında burada görünecek.'}
          </p>
        </section>

        {/* Game Mode Selection Card */}
        <section className="rounded-2xl p-3 bg-gradient-to-r from-[#171333] to-[#121026] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-widest font-semibold uppercase text-cyan-400 font-mono">
              GÖREV SENARYO MODU
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase">
              {(state.gameMode || 'standart') === 'gelismis' ? 'EŞZAMANLI SİSTEMLER' : 'SIRALI AŞAMALAR'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Standart Mod Button */}
            <button
              onClick={() => {
                if (isOnline) {
                  colyseusClient.setGameMode('standart');
                }
                onUpdate((prev) => ({ ...prev, gameMode: 'standart' }));
              }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                (state.gameMode || 'standart') === 'standart'
                  ? 'bg-amber-500/20 border-[#ffb703] text-white shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                  : 'bg-[#1a1733] border-white/5 text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-xs">🌟</span>
                <span className="text-xs font-bold font-sora">Standart Mod</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Klasik 4 aşamalı sıralı görevler.
              </p>
            </button>

            {/* Gelişmiş Taktik Mod Button */}
            <button
              onClick={() => {
                if (isOnline) {
                  colyseusClient.setGameMode('gelismis');
                }
                onUpdate((prev) => ({ ...prev, gameMode: 'gelismis' }));
              }}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                state.gameMode === 'gelismis'
                  ? 'bg-cyan-500/20 border-[#00eefc] text-white shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                  : 'bg-[#1a1733] border-white/5 text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <span className="text-xs">⚡</span>
                <span className="text-xs font-bold font-sora text-cyan-300">Gelişmiş Taktik</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Operasyon Çöküş Eşiği: Eşzamanlı 3 sistem ve güç matrisi.
              </p>
            </button>
          </div>

          {/* Automated Randomized Mission Sequence Card */}
          {state.selectedMiniGames && (
            <div className="mt-3 p-3 rounded-2xl bg-[#110e24]/90 border border-cyan-500/30 shadow-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                    🎲 SİSTEMİN OTOMATİK GÖREV SIRASI
                  </span>
                </div>
                {(!isOnline || isHost) && (
                  <button
                    onClick={handleRerollTasks}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 active:scale-95 text-[10px] font-mono text-cyan-300 border border-cyan-500/40 cursor-pointer flex items-center gap-1 font-bold transition-all shadow"
                    title="Görevleri Yeniden Karıştır"
                  >
                    <span>🎲</span>
                    <span>Yeniden Karıştır</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {/* 1. Aşama */}
                <div className="p-2 rounded-xl bg-[#181530] border border-cyan-500/30 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">1. Aşama</span>
                  <span className="text-base my-0.5">{getMiniGameIcon(state.selectedMiniGames[0])}</span>
                  <span className="text-[10px] font-sora font-semibold text-white leading-tight truncate max-w-full">
                    {getMiniGameTitle(state.selectedMiniGames[0], isDerinBasinc, false)}
                  </span>
                  <span className="text-[8px] font-mono text-cyan-300/70 uppercase">Rastgele</span>
                </div>

                {/* 2. Aşama */}
                <div className="p-2 rounded-xl bg-[#181530] border border-amber-500/30 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">2. Aşama</span>
                  <span className="text-base my-0.5">{getMiniGameIcon(state.selectedMiniGames[1])}</span>
                  <span className="text-[10px] font-sora font-semibold text-white leading-tight truncate max-w-full">
                    {getMiniGameTitle(state.selectedMiniGames[1], isDerinBasinc, false)}
                  </span>
                  <span className="text-[8px] font-mono text-amber-300/70 uppercase">Rastgele</span>
                </div>

                {/* 3. Aşama */}
                <div className="p-2 rounded-xl bg-[#181530] border border-purple-500/30 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">3. Aşama</span>
                  <span className="text-base my-0.5">⚡</span>
                  <span className="text-[10px] font-sora font-semibold text-white leading-tight truncate max-w-full">
                    {isDerinBasinc ? 'Balast Gücü' : 'Güç Matrisi'}
                  </span>
                  <span className="text-[8px] font-mono text-purple-300/70 uppercase">Şebeke</span>
                </div>

                {/* 4. Aşama */}
                <div className="p-2 rounded-xl bg-[#181530] border border-rose-500/30 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-rose-400 font-bold uppercase">4. Aşama</span>
                  <span className="text-base my-0.5">🛸</span>
                  <span className="text-[10px] font-sora font-semibold text-white leading-tight truncate max-w-full">
                    {isDerinBasinc ? 'Yüzeye Çıkış' : 'Tahliye'}
                  </span>
                  <span className="text-[8px] font-mono text-rose-300/70 uppercase">Kurtarma</span>
                </div>
              </div>

              {state.gameMode === 'gelismis' && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span>⚡</span> Gelişmiş Taktik Modu:
                  </span>
                  <span className="text-[#00eefc]">
                    Görevler Güç Matrisi (7 MW) ile eşzamanlı aktifleşir
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Crew Selection Lobby (Player 1 & Player 2 Side-by-Side) */}
        <section className="grid grid-cols-2 gap-3">
          {/* Player 1: Ece (Leader - Kaptan / Dümenci) */}
          <div 
            onClick={state.myRole === 'kaptan' ? toggleMyReady : undefined}
            className={`relative rounded-2xl p-2.5 pb-2.5 bg-gradient-to-b from-[#241f42] to-[#121124] border-2 border-[#f59e0b]/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98 transition-all`}
          >
            <div className="absolute top-2 left-2 z-20 flex items-center space-x-1 bg-[#f59e0b] text-[#2b1700] px-2.5 py-0.5 rounded-full shadow-md font-bold text-[9px] uppercase tracking-wider font-mono">
              <span className="material-symbols-outlined text-[13px]">
                {isDerinBasinc ? 'scuba_diving' : 'star'}
              </span>
              <span>{isDerinBasinc ? 'LİDER DALGIÇ' : 'Lider'}</span>
            </div>

            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 mb-2">
              <img 
                src={
                  isDerinBasinc
                    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDoMlRTjls0FI3uCrh9Eq-EL4lzi-28Zte1Q_cn9oFdTpKl6l3HEztU3t-p43t04Eu1ywyUckY_xCraNlEjNsmIEroskTUD_4cIvq5TlMveo6bT4st0RA8McjRvx34qsp5C1UsTgLOgmE0-xActBQ3tAibRiiCVCDzLkcBEylzVfl_J1GTZvXbyJ-TyK3Njsy0K90zUBp1urG093euTDOCDaYTqHnNGA9rAFomdpbo"
                    : "https://lh3.googleusercontent.com/aida-public/AB6AXuCLbCVA7kytNnSKo-gaPE6NKFjpPbQRs2t25Ai3LLzN9z6Rs1jEhpygEPnnSIHuuVKNygcTWw7VWm1YfzXqvbYdp_OiQgaVWlkvpQM_u5T136mUlSKgIyXW-cLODBk_uj5ROs4BYSAYZfWN01cu1lH-RjGhCz3Cb6kqMKU1dNETrWmg4gKa3ED9YpA3HwDUSxH7gHneqXsRfTAXrkkKQI1k8ooNGS7rglu29_COf2U"
                } 
                alt="Kaptan / Dümenci Ece" 
                className="w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121124] via-transparent to-transparent"></div>
            </div>

            <div className="flex flex-col px-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-sora truncate">{state.players.kaptan.name}</h3>
                <span className="text-[10px] text-amber-300 font-mono font-bold">
                  {isDerinBasinc ? 'Dümenci' : 'Kaptan'}
                </span>
              </div>
              {isDerinBasinc && (
                <span className="text-[9px] text-[#00eefc]/90 font-mono">Kılavuz Navigasyon</span>
              )}
            </div>

            <div className={`mt-1.5 w-full rounded-xl py-1 flex items-center justify-center space-x-1.5 border ${
              state.players.kaptan.ready 
                ? 'bg-[#0c1e1d] border-[#10b981]/50 text-emerald-400' 
                : 'bg-[#1c192c] border-white/10 text-white/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${state.players.kaptan.ready ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]' : 'bg-white/20'}`}></span>
              <span className="text-[11px] font-semibold">
                {isDerinBasinc 
                  ? (state.players.kaptan.ready ? 'Kabin 01 • Hazır' : 'Kabin 01 • Bekliyor')
                  : (state.players.kaptan.ready ? 'Hazır' : 'Bekliyor')}
              </span>
            </div>
          </div>

          {/* Player 2: Mert (Mühendis / Makinist) */}
          {isPlayer2Joined ? (
            <div 
              onClick={state.myRole === 'muhendis' ? toggleMyReady : undefined}
              className={`relative rounded-2xl p-2.5 pb-2.5 bg-gradient-to-b from-[#1b1e3b] to-[#101021] border border-cyan-500/30 shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98 transition-all`}
            >
              {isDerinBasinc && (
                <div className="absolute top-2 left-2 z-20 flex items-center space-x-1 bg-cyan-500/20 text-[#00eefc] border border-cyan-400/40 px-2 py-0.5 rounded-full shadow-md font-bold text-[9px] uppercase tracking-wider font-mono">
                  <span className="material-symbols-outlined text-[12px]">build</span>
                  <span>TEKNİK EKİP</span>
                </div>
              )}

              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 mb-2">
                <img 
                  src={
                    isDerinBasinc
                      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBB7m8E0MiZbKzCB9mU7R1Jc8PPO0AY-6SQ5l-DKWzph5r1wcYsHPGAnTGonk-AeR-Jx2Ehr1taxWU1taKO-LE3u_bvfV8lQ_cH8nJWcmTwBVZHHYtqxGWzFiLuit9BcdfZOHCR2NnmFAVcse7wWgf2ElcEt8vhpBt5qTT-pURbFgj5VKshCdEWjh3syMX1MorWBb32TAJt9Y6bkJClkM0ppNo_JhGKkhdHABEKP1E"
                      : "https://lh3.googleusercontent.com/aida-public/AB6AXuAoeQN2pLWf8Xj8TxKoQJTTjpc9CsSHTF5JxwfmESK0bsLl_Kyh6Iux2FofuEtAWJigxSdB3vVnrkTLj6hpBR59wJ-lzOi-ZYd2q6m5lU7yOlMZ6lvzGFY2r5Tp3yffa2XhDCZ2SykuiFajBooH6M_buYGjfh8bol08jD3Fc0bAjP_jT3sdW2u61qvqBk2uo1DrqLaecld0x7BSi6bHLhJudQW63uoFwue1Te-7sj8"
                  } 
                  alt="Mühendis / Makinist Mert" 
                  className="w-full h-full object-cover object-top" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101021] via-transparent to-transparent"></div>
              </div>

              <div className="flex flex-col px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-sora truncate">{state.players.muhendis.name}</h3>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold">
                    {isDerinBasinc ? 'Makinist' : 'Mühendis'}
                  </span>
                </div>
                {isDerinBasinc && (
                  <span className="text-[9px] text-[#ffba27]/90 font-mono">Dalgıç Tamir Ünitesi</span>
                )}
              </div>

              <div className={`mt-1.5 w-full rounded-xl py-1 flex items-center justify-center space-x-1.5 border ${
                state.players.muhendis.ready 
                  ? 'bg-[#0c1e1d] border-[#10b981]/50 text-emerald-400' 
                  : 'bg-[#1c192c] border-white/10 text-white/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${state.players.muhendis.ready ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]' : 'bg-white/20'}`}></span>
                <span className="text-[11px] font-semibold">
                  {isDerinBasinc 
                    ? (state.players.muhendis.ready ? 'Kabin 02 • Hazır' : 'Kabin 02 • Bekliyor')
                    : (state.players.muhendis.ready ? 'Hazır' : 'Bekliyor')}
                </span>
              </div>
            </div>
          ) : (
            <div 
              onClick={copyInviteLink}
              className="relative rounded-2xl p-2.5 pb-2.5 bg-gradient-to-b from-[#13162e] to-[#0c0d1c] border-2 border-dashed border-[#00eefc]/40 shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer hover:border-[#00eefc] transition-all group"
            >
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900/60 mb-2 flex flex-col items-center justify-center border border-white/5">
                <div className="w-12 h-12 rounded-full bg-[#00eefc]/10 border border-[#00eefc]/30 flex items-center justify-center text-[#00eefc] mb-2 animate-pulse group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono font-bold tracking-wider uppercase">Katılım Bekleniyor</span>
              </div>

              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-slate-300 font-sora">Arkadaşın...</h3>
                <span className="text-[10px] text-cyan-400/80 font-mono">
                  {isDerinBasinc ? 'Makinist' : 'Mühendis'}
                </span>
              </div>

              <div className="mt-1.5 w-full rounded-xl py-1 flex items-center justify-center space-x-1.5 border bg-cyan-950/30 border-cyan-500/20 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-[10px] font-semibold">Linki Paylaş</span>
              </div>
            </div>
          )}
        </section>

        {/* Quick Facts / Parameter Grid */}
        {isDerinBasinc ? (
          <section className="grid grid-cols-4 gap-1.5">
            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <span className="font-mono text-[8px] text-[#9e8f78] uppercase font-bold">KADRO</span>
              <span className="text-[11px] font-bold text-white mt-0.5 leading-tight">2 Oyuncu</span>
              <span className="text-[8px] text-cyan-300 font-mono">Kooperatif</span>
            </div>
            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <span className="font-mono text-[8px] text-[#9e8f78] uppercase font-bold">PROTOKOL</span>
              <span className="text-[11px] font-bold text-[#ffba27] mt-0.5 leading-tight">8 Aşamalı</span>
              <span className="text-[8px] text-amber-300/80 font-mono">Derin Dalış</span>
            </div>
            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <span className="font-mono text-[8px] text-[#9e8f78] uppercase font-bold">DİNAMİK</span>
              <span className="text-[11px] font-bold text-white mt-0.5 leading-tight">Asimetrik</span>
              <span className="text-[8px] text-cyan-300 font-mono">Sesli İletişim</span>
            </div>
            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <span className="font-mono text-[8px] text-[#9e8f78] uppercase font-bold">HEDEF</span>
              <span className="text-[11px] font-bold text-cyan-300 mt-0.5 leading-tight">850 Metre</span>
              <span className="text-[8px] text-slate-400 font-mono">Abisal</span>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-3 gap-2">
            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <div className="w-6 h-6 mb-1 text-cyan-300 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-100 leading-tight">2 oyuncu</span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Sadece siz için tasarlandı.</span>
            </div>

            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <div className="w-6 h-6 mb-1 text-cyan-300 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-100 leading-tight">5 dakika</span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Kısa ve yoğun bir deneyim.</span>
            </div>

            <div className="bg-[#141329]/90 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center shadow-md">
              <div className="w-6 h-6 mb-1 text-cyan-300 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.414-.586l-4.243-4.243a2 2 0 010-2.828l2.828-2.829a2 2 0 012.829 0l1.414 1.414m0-4.672V4a2 2 0 012-2 2 2 0 012 2v4" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-100 leading-tight">İş birliği</span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">Kazanmak için birlikte düşünün.</span>
            </div>
          </section>
        )}

      </main>

      {/* Bottom Action Footer with Massive Tactile 3D Circular Launch Button */}
      <footer className="relative z-20 px-4 pt-2 flex flex-col items-center space-y-3">
        
        {/* Status Telemetry Pill above launch button */}
        <div className={`px-3.5 py-1 rounded-full border text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${
          isBothReady 
            ? 'bg-amber-500/20 border-[#ffb703] text-[#ffba27] shadow-[0_0_20px_rgba(255,183,3,0.45)]' 
            : !isPlayer2Joined
            ? 'bg-cyan-950/50 border-[#00eefc]/40 text-[#00eefc]'
            : 'bg-[#1c192c] border-white/10 text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isBothReady 
              ? 'bg-[#ffb703] animate-ping shadow-[0_0_8px_#ffb703]' 
              : !isPlayer2Joined
              ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#00eefc]'
              : 'bg-amber-400/50 animate-pulse'
          }`}></span>
          <span>
            {isBothReady 
              ? (isDerinBasinc ? 'KABİN BASINCI EŞİTLENDİ • DALIŞA HAZIR' : 'SİSTEMLER HAZIR • FIRLATMAYA UYGUN')
              : !isPlayer2Joined
              ? (isDerinBasinc ? 'EŞLİKÇİ DALGIÇ BEKLENİYOR (1/2) • LİNKİ PAYLAŞ' : 'ARKADAŞIN BEKLENİYOR (1/2) • LİNKİ PAYLAŞ')
              : 'BEKLENİYOR • İKİ OYUNCU DA HAZIR OLMALI'}
          </span>
        </div>

        {/* Massive Tactile 3D Circular Launch Button ("Dalışı Başlat" / "Görevi Başlat") with Neon Glory */}
        <div className="relative flex items-center justify-center my-1">
          
          {/* Ambient Outer Radial Neon Bloom */}
          <div className={`absolute w-52 h-52 rounded-full pointer-events-none transition-all duration-700 ${
            isBothReady 
              ? 'bg-[radial-gradient(circle,rgba(255,183,3,0.35)_0%,rgba(0,238,252,0.15)_45%,transparent_70%)] blur-2xl animate-pulse' 
              : 'bg-transparent'
          }`}></div>

          {/* Outer Mechanical Sci-Fi Housing with Deep Bevel */}
          <div className="w-40 h-40 rounded-full p-3 flex items-center justify-center relative bg-gradient-to-b from-[#2e294e] via-[#1a1633] to-[#0a0815] shadow-[inset_0_3px_8px_rgba(255,255,255,0.25),inset_0_-8px_16px_rgba(0,0,0,0.9),0_16px_36px_rgba(0,0,0,0.8),0_0_40px_rgba(255,183,3,0.3)] border border-[#ffb703]/30">
            
            {/* 4 Titanium Mechanical Locking Bolts at 12, 3, 6, 9 o'clock */}
            <div className="absolute -top-1 w-3.5 h-2 bg-gradient-to-b from-[#ffe066] to-[#b45309] rounded-sm shadow-[0_0_10px_#f59e0b] border border-amber-200/60 z-30"></div>
            <div className="absolute -bottom-1 w-3.5 h-2 bg-gradient-to-b from-[#ffe066] to-[#b45309] rounded-sm shadow-[0_0_10px_#f59e0b] border border-amber-200/60 z-30"></div>
            <div className="absolute -left-1 w-2 h-3.5 bg-gradient-to-r from-[#ffe066] to-[#b45309] rounded-sm shadow-[0_0_10px_#f59e0b] border border-amber-200/60 z-30"></div>
            <div className="absolute -right-1 w-2 h-3.5 bg-gradient-to-l from-[#ffe066] to-[#b45309] rounded-sm shadow-[0_0_10px_#f59e0b] border border-amber-200/60 z-30"></div>
            
            {/* Clockwise Segmented Energy Ring (Cyan/Gold) */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#00eefc]/50 animate-energy-ring pointer-events-none"></div>
            
            {/* Counter-Clockwise Outer Glow Halo */}
            <div className={`absolute inset-0 rounded-full border-2 border-[#ffb703]/60 animate-energy-ring-reverse pointer-events-none ${
              isBothReady ? 'shadow-[0_0_24px_rgba(255,183,3,0.7)]' : 'opacity-40'
            }`}></div>

            {/* Central Round Golden Neon Push Button */}
            <button 
              onClick={() => {
                if (isOnline) {
                  if (isBothReady) {
                    if (isHost) onStartGame();
                  } else {
                    toggleMyReady();
                  }
                } else {
                  if (isBothReady) {
                    onStartGame();
                  } else {
                    const partnerRole = state.myRole === 'kaptan' ? 'muhendis' : 'kaptan';
                    if (!state.players[state.myRole].ready) {
                      toggleMyReady();
                    } else if (!state.players[partnerRole].ready) {
                      togglePartnerReady();
                    } else {
                      onStartGame();
                    }
                  }
                }
              }}
              aria-label={isDerinBasinc ? "Dalışı Başlat" : "Görevi başlat"} 
              className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group focus:outline-none relative z-20 ${
                isBothReady && (!isOnline || isHost)
                  ? 'launch-btn-neon-active scale-100 cursor-pointer' 
                  : 'bg-[radial-gradient(circle_at_45%_35%,#544b36_0%,#3d3420_40%,#261d0f_80%,#140e06_100%)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.8)] border border-amber-500/20 text-[#a89066] hover:brightness-110 active:scale-95'
              }`}
              type="button"
            >
              {/* Play or Anchor Icon with Glow */}
              <div className="w-7 h-7 flex items-center justify-center mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                {isDerinBasinc ? (
                  <span className={`material-symbols-outlined text-[24px] ${isBothReady ? 'text-[#291400]' : 'text-[#8a7247]'} transition-transform group-hover:scale-110`}>
                    anchor
                  </span>
                ) : (
                  <svg className={`w-7 h-7 ${isBothReady ? 'text-[#291400] drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'text-[#8a7247]'} fill-current transform translate-x-0.5 transition-transform group-hover:scale-110`} viewBox="0 0 24 24">
                    <path d="M7 4.5v15l13-7.5-13-7.5z"></path>
                  </svg>
                )}
              </div>
              
              {/* Button Typography */}
              <span className={`text-[12px] font-black leading-tight uppercase tracking-wide font-sora ${
                isBothReady && (!isOnline || isHost) ? 'text-[#251000] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-[#c2ab80]'
              }`}>
                {isBothReady ? (
                  isOnline && !isHost ? <>Lideri<br />Bekliyor</> : (isDerinBasinc ? <>DALIŞI<br />BAŞLAT</> : <>Görevi<br />başlat</>)
                ) : !isPlayer2Joined ? (
                  state.players[state.myRole].ready ? <>Hazırsın<br />(Bekleniyor)</> : <>Hazır<br />Ol</>
                ) : (
                  state.players[state.myRole].ready ? <>Eşlikçi<br />Hazırla</> : <>Hazır<br />Ol</>
                )}
              </span>

              {/* Ready Indicator Hint if waiting */}
              {!isBothReady && (
                <span className="text-[8px] font-mono font-bold text-amber-400 mt-0.5 opacity-90">
                  {isOnline ? (
                    !isPlayer2Joined 
                      ? (state.players[state.myRole].ready ? '(Eşlikçi Bekle)' : '(Tıkla Hazır Ol)')
                      : (state.players[state.myRole].ready ? '(Eşlikçi Bekleniyor)' : '(Hazır Ol)')
                  ) : (
                    state.players[state.myRole].ready ? '(Eşlikçiyi Hazır Yap)' : '(Tıkla Hazır Ol)'
                  )}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Action: Deep Sea Radio Test Button */}
        {isDerinBasinc && (
          <button 
            onClick={handleTestRadio}
            className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.98] cursor-pointer ${
              radioTesting 
                ? 'bg-cyan-500/20 border-[#00eefc] text-[#00eefc] shadow-[0_0_15px_rgba(0,238,252,0.35)]' 
                : 'bg-gradient-to-r from-[#17142b] via-[#211d3d] to-[#17142b] border-cyan-400/30 text-cyan-200 hover:text-white'
            }`}
            type="button"
          >
            <span className={`material-symbols-outlined text-[17px] ${radioTesting ? 'text-[#00eefc] animate-spin' : 'text-cyan-400'}`}>
              cell_tower
            </span>
            <span className="text-xs font-bold tracking-wide font-sora">
              {radioTesting ? '✓ Telsiz Sinyali Aktif (142.8 MHz)' : 'Telsiz Frekansını Test Et (142.8 MHz)'}
            </span>
          </button>
        )}

        {/* Secondary Action: Invite Friend ("+ Arkadaşını davet et") with Cyan Neon Glow */}
        <button 
          onClick={copyInviteLink}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#1c1a35] via-[#242145] to-[#1c1a35] border border-[#00eefc]/30 hover:border-[#00eefc] hover:shadow-[0_0_18px_rgba(0,238,252,0.3)] flex items-center justify-center space-x-2 text-slate-200 hover:text-white transition-all shadow-lg active:scale-[0.98] cursor-pointer" 
          type="button"
        >
          <svg className="w-4 h-4 text-[#00eefc] drop-shadow-[0_0_6px_#00eefc]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-[12px] font-bold tracking-wide font-sora">
            {copied ? '✓ Davet Linki Kopyalandı!' : '+ Arkadaşını Davet Et (Linki Kopyala)'}
          </span>
        </button>

      </footer>

      {/* iOS Home Indicator Pill Bar */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2 pointer-events-none"></div>

      {/* Simple QR Code Modal Preview */}
      {showQrModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
        >
          <div className="p-6 rounded-2xl bg-[#141123] border border-[#00eefc]/40 flex flex-col items-center gap-3 text-center max-w-xs shadow-2xl">
            <span className="text-xs font-mono text-[#00eefc] uppercase font-bold">KAYIP SİNYAL ODA QR KODU</span>
            <div className="w-44 h-44 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
              {/* QR matrix mockup representation */}
              <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center p-2 text-center text-white">
                <span className="font-mono font-bold text-lg text-[#ffb703]">{state.roomCode}</span>
                <span className="text-[9px] text-[#00eefc] mt-1 font-mono">partyverse.app/{state.roomCode}</span>
              </div>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
