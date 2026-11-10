import React, { useState } from 'react';
import { MissionState, Role, MiniGameType, OperationTheme } from '../../types/game';
import { getRandomMiniGames, generateKarantinaData } from '../../services/gameFactory';
import { soundManager } from '../../services/soundEffects';
import { motion, AnimatePresence } from 'framer-motion';

export interface MiniGameOption {
  id: MiniGameType;
  title: string;
  tag: string;
  desc: string;
  icon: string;
  accent: string;
}

export const AVAILABLE_MINI_GAMES: MiniGameOption[] = [
  {
    id: 'ariza_teshisi',
    title: 'Arıza Teşhisi (Reaktör)',
    tag: 'ASİMETRİK TELEMETRİ',
    desc: 'Mühendiste 4 devre telemetrisi (ısı/basınç/parazit), Kaptanda kurallar & kesici kilidi, valf ve tahliye.',
    icon: 'cyclone',
    accent: '#ef4444',
  },
  {
    id: 'sinyal_cozumu',
    title: 'Sinyal Frekans Çözümü',
    tag: 'KRİPTOGRAFİK DÖNÜŞÜM',
    desc: '4 glif sembol dizisi, glif-rakam tablosu ve kural dönüşümü (ters/çift/kaydır) ile frekans kilitleme.',
    icon: 'settings_input_antenna',
    accent: '#00eefc',
  },
  {
    id: 'kablo_baglantisi',
    title: 'Kablo Bağlantısı',
    tag: 'VERİ HATTI ONARIMI',
    desc: 'Hasarlı veri hatları frekans eşleşmesine göre doğru terminallere bağlanır.',
    icon: 'cable',
    accent: '#f59e0b',
  },
  {
    id: 'hava_kilidi',
    title: 'Hava Kilidi Basınç',
    tag: 'BASINÇ İZOLASYONU',
    desc: 'Vakum kadranı ve hava kilidi kompresörü ile gövde sızdırmazlığının sağlanması.',
    icon: 'sensor_door',
    accent: '#10b981',
  },
  {
    id: 'radar_yonlendirme',
    title: 'Radar Kalibrasyonu',
    tag: 'KOORDİNAT KİLİTLEME',
    desc: 'Açı ve menzil taraması ile kaçış rotası işaretçisinin hizalanması.',
    icon: 'radar',
    accent: '#a855f7',
  },
];

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onStartLobby: () => void;
  onBackToOpening?: () => void;
  isOnlineMode?: boolean;
  onToggleOnlineMode?: () => void;
  onCreateOnlineRoom?: (roomCode: string, playerName: string, role: Role, sector: string) => Promise<void>;
  onJoinOnlineRoom?: (roomCode: string, playerName: string) => Promise<void>;
}

export const Screen01Entry: React.FC<Props> = ({ 
  state, 
  onUpdate, 
  onStartLobby,
  onBackToOpening,
  isOnlineMode = true,
  onToggleOnlineMode,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
}) => {
  const getUrlRoom = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('room') || params.get('code') || params.get('oda');
      if (code) {
        return code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(KYP|DP)/, '');
      }
    }
    return null;
  };

  const initialUrlRoom = getUrlRoom();
  const [mode, setMode] = useState<'create' | 'join'>(initialUrlRoom ? 'join' : 'create');
  const [selectedTheme, setSelectedTheme] = useState<OperationTheme>(
    state.operationTheme || 'derin_basinc'
  );
  const [playerName, setPlayerName] = useState(
    state.players[state.myRole].name || (
      state.operationTheme === 'golge_protokolu' ? 'Ajan Ece' :
      state.operationTheme === 'derin_basinc' ? 'Dümenci Ece' : 'Kaptan Ece'
    )
  );
  const [selectedGameMode, setSelectedGameMode] = useState<'gelismis' | 'standart'>(
    state.gameMode || 'gelismis'
  );
  const [pinDigits, setPinDigits] = useState<string[]>(() => {
    const raw = initialUrlRoom || (state.roomCode || '9480').replace(/^(SHDW|KYP|DP)-?/i, '');
    const chars = raw.slice(0, 4).toUpperCase().split('');
    while (chars.length < 4) chars.push('');
    return chars;
  });
  const [stationSector, setStationSector] = useState(
    (state.operationTheme || 'derin_basinc') === 'golge_protokolu'
      ? 'Megacorp Kat 84 // Neon Kasa'
      : (state.operationTheme || 'derin_basinc') === 'derin_basinc'
        ? 'HİDRO-04 Abisal Hendek (-850m)' 
        : 'Aurora-7 Çekirdek Güvertesi'
  );
  const [selectedRole, setSelectedRole] = useState<Role>(initialUrlRoom ? 'muhendis' : state.myRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const applyNormalizedCode = (codeStr: string) => {
    const cleaned = codeStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const suffix = cleaned.startsWith('KYP') ? cleaned.slice(3) : cleaned;
    const digits = suffix.slice(0, 4).split('');
    while (digits.length < 4) digits.push('');
    setPinDigits(digits);
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.toUpperCase().slice(-1);
    const next = [...pinDigits];
    next[index] = char;
    setPinDigits(next);

    // Auto advance to next slot if a character was entered
    if (char && index < 3) {
      const nextInput = document.getElementById(`pin-slot-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const prevInput = document.getElementById(`pin-slot-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      applyNormalizedCode(pasted);
    }
  };

  const handleCreateRoom = async () => {
    setErrorMsg(null);
    const prefix = selectedTheme === 'karantina_2088' 
      ? 'KR88' 
      : (selectedTheme === 'golge_protokolu' ? 'SHDW' : (selectedTheme === 'derin_basinc' ? 'DP' : 'KYP'));
    const randomDigits = selectedTheme === 'karantina_2088'
      ? 'Z9'
      : (selectedTheme === 'golge_protokolu' ? '77' : String(Math.floor(1000 + Math.random() * 9000)));
    const newRoomCode = `${prefix}-${randomDigits}`;

    const defaultLeaderName = selectedTheme === 'karantina_2088'
      ? 'Baş Biyolog Selin'
      : (selectedTheme === 'golge_protokolu' ? 'Ajan Ece' : (selectedTheme === 'derin_basinc' ? 'Dümenci Ece' : 'Kaptan Ece'));
    const defaultPartnerName = selectedTheme === 'karantina_2088'
      ? 'Güvenlik Şefi Baran'
      : (selectedTheme === 'golge_protokolu' ? 'Hacker Mert' : (selectedTheme === 'derin_basinc' ? 'Makinist Mert' : 'Mühendis Mert'));

    // Fully automated random task sequence generated by system
    const randomizedMiniGames: [MiniGameType, MiniGameType] = getRandomMiniGames(state.selectedMiniGames);

    if (isOnlineMode && onCreateOnlineRoom) {
      setIsLoading(true);
      try {
        await onCreateOnlineRoom(newRoomCode, playerName.trim() || defaultLeaderName, selectedRole, stationSector);
      } catch (err: any) {
        setErrorMsg(err.message || 'Sunucuya bağlanılamadı.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const partnerRole: Role = selectedRole === 'kaptan' ? 'muhendis' : 'kaptan';
    onUpdate((prev) => ({
      ...prev,
      roomCode: newRoomCode,
      operationTheme: selectedTheme,
      gameMode: selectedGameMode,
      selectedMiniGames: randomizedMiniGames,
      myRole: selectedRole,
      karantinaData: selectedTheme === 'karantina_2088' ? (prev.karantinaData || generateKarantinaData()) : prev.karantinaData,
      players: {
        ...prev.players,
        [selectedRole]: {
          ...prev.players[selectedRole],
          name: playerName.trim() || (selectedRole === 'kaptan' ? defaultLeaderName : defaultPartnerName),
          connected: true,
          ready: false,
        },
        [partnerRole]: {
          ...prev.players[partnerRole],
          name: prev.players[partnerRole].name || (partnerRole === 'muhendis' ? defaultPartnerName : defaultLeaderName),
          connected: true,
          ready: false,
        },
      },
      status: 'lobby',
    }));
    onStartLobby();
  };

  const handleJoinRoom = async () => {
    setErrorMsg(null);
    const rawInput = pinDigits.join('').trim().toUpperCase();
    if (rawInput.length < 2) {
      setErrorMsg('Lütfen oda kodunu eksiksiz girin (Örn: KR88-Z9, SHDW-77, DP-9480 veya KYP-7024).');
      return;
    }

    // Detect theme from prefix if player enters KR88, SHDW, DP or KYP
    const isKarantina = rawInput.startsWith('KR') || (selectedTheme === 'karantina_2088' && !rawInput.startsWith('KYP') && !rawInput.startsWith('DP') && !rawInput.startsWith('SHDW'));
    const isShadow = !isKarantina && (rawInput.startsWith('SHDW') || (selectedTheme === 'golge_protokolu' && !rawInput.startsWith('KYP') && !rawInput.startsWith('DP')));
    const isDerin = !isKarantina && !isShadow && (rawInput.startsWith('DP') || (selectedTheme === 'derin_basinc' && !rawInput.startsWith('KYP')));
    const detectedTheme: OperationTheme = isKarantina 
      ? 'karantina_2088' 
      : (isShadow ? 'golge_protokolu' : (isDerin ? 'derin_basinc' : 'kayip_sinyal'));
    const cleanDigits = rawInput.replace(/^(KR88|SHDW|DP|KYP)-?/, '').slice(0, 4);
    const targetCode = `${isKarantina ? 'KR88' : isShadow ? 'SHDW' : (isDerin ? 'DP' : 'KYP')}-${cleanDigits || (isKarantina ? 'Z9' : '77')}`;

    const defaultPartnerName = detectedTheme === 'karantina_2088'
      ? 'Güvenlik Şefi Baran'
      : (detectedTheme === 'golge_protokolu' ? 'Hacker Mert' : (detectedTheme === 'derin_basinc' ? 'Makinist Mert' : 'Mühendis Mert'));
    const defaultLeaderName = detectedTheme === 'karantina_2088'
      ? 'Baş Biyolog Selin'
      : (detectedTheme === 'golge_protokolu' ? 'Ajan Ece' : (detectedTheme === 'derin_basinc' ? 'Dümenci Ece' : 'Kaptan Ece'));

    if (isOnlineMode && onJoinOnlineRoom) {
      setIsLoading(true);
      try {
        await onJoinOnlineRoom(targetCode, playerName.trim() || defaultPartnerName);
      } catch (err: any) {
        setErrorMsg(err.message || 'Odaya bağlanılamadı.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const partnerRole: Role = selectedRole === 'kaptan' ? 'muhendis' : 'kaptan';
    onUpdate((prev) => ({
      ...prev,
      roomCode: targetCode,
      operationTheme: detectedTheme,
      myRole: partnerRole,
      karantinaData: detectedTheme === 'karantina_2088' ? (prev.karantinaData || generateKarantinaData()) : prev.karantinaData,
      players: {
        ...prev.players,
        [partnerRole]: {
          ...prev.players[partnerRole],
          name: playerName.trim() || (partnerRole === 'muhendis' ? defaultPartnerName : defaultLeaderName),
          connected: true,
          ready: false,
        },
        [selectedRole]: {
          ...prev.players[selectedRole],
          name: prev.players[selectedRole].name || (selectedRole === 'kaptan' ? defaultLeaderName : defaultPartnerName),
          connected: true,
          ready: false,
        },
      },
      status: 'lobby',
    }));
    onStartLobby();
  };

  const handleInviteRecent = (name: string, role: Role) => {
    setPlayerName(name);
    setSelectedRole(role);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#141123] text-[#e6dff9] flex flex-col justify-between pb-6 rounded-[36px] border border-white/10 shadow-2xl overflow-hidden relative select-none animate-fadeIn">
      {/* Background radial glows */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#00eefc]/15 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#ffb703]/15 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.25)]">
            <svg className="w-6 h-6 text-[#ffb703]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="#ffb703" strokeWidth="2" transform="rotate(-30 12 12)" />
              <circle cx="12" cy="12" fill="none" r="5.5" stroke="#ffb703" strokeWidth="2.2" />
            </svg>
          </div>
          <div className="flex flex-col ml-0.5">
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#ffba27] uppercase">PARTYVERSE</span>
            <h1 className="font-sora font-semibold text-sm text-white leading-none">
              {selectedTheme === 'karantina_2088' ? 'Karantina 2088 Match' :
               selectedTheme === 'derin_basinc' ? 'Derin Basınç Match' :
               selectedTheme === 'golge_protokolu' ? 'Gölge Protokolü Match' : 'Kayıp Sinyal Match'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToOpening && (
            <button
              onClick={onBackToOpening}
              className="px-2.5 py-1 rounded-lg bg-[#201d30] hover:bg-[#2b273b] border border-white/10 text-[#00eefc] font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Açılış Ekranı ve Tanıtım Kartlarına Dön"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span className="hidden sm:inline">Tanıtım</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              soundManager.toggleMute();
              // force re-render
              setPlayerName((n) => n);
            }}
            className="w-9 h-9 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            title={soundManager.isMuted() ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundManager.isMuted() ? 'volume_off' : 'volume_up'}
            </span>
          </button>
          <div className="w-9 h-9 rounded-full bg-[#ffdba0] text-[#422c00] flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 flex flex-col gap-3.5 pt-1">
        
        {/* Dynamic Atmospheric Hero Header */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#0f0c1e] shadow-[0_12px_36px_rgba(15,12,30,0.85)] border border-white/10">
          <div 
            className="relative w-full h-48 bg-cover bg-center transition-all duration-500" 
            style={{ 
              backgroundImage: selectedTheme === 'golge_protokolu'
                ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDndKr82uZk6G0DPb27wnIcxhubv8ms_OuXZMlesBI4S0i7CY3Ag4v5N_-B6hrKmIayZEXmvT47jqT7bqorWysPYzNRLK7k3PAJntHdISVbfiHD9au2B7sqxqbXOaoCuFOD5eW0jB1QoLz4QFvK01WzCrHKrqHnH_KCh1zpmgs-bBZ7CCq969l-6mu6qarOhKvObVV6a_ccOTxBkGm678ej8mSlttDqhUNLb2B4xsQ')"
                : selectedTheme === 'derin_basinc'
                  ? "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaVqfH-Ps6RyTNUmw7Q8HWHtJ5dUrrQp7WMlBNMkfi_jZ4hZ-rFQdcu4gHHX2CKrMJs0Dn2-ABA8FhNKdXoZ6V-Rs5Gmi27TGrmL8upPQjYdZ4AmZjvwQZC3wCHpwNmg5p3RjibcYYt0gAEaT29wcJvTfvUfcQ7lawXjfOTj0e7N-HNAHkunniBrh0u6Ysr4TRu1nTud6WDNZ2IzdOMhk4mHgisqbb9SZmnvUjxvA')"
                  : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4vmlWxlRgzYFWt-nn1ue6kGo5v1CSw5mNcmwoivdDPi3BuGu4uO5C7Y4XRgvN0TrxP18BE2wh2EMzNZGbFT8Xl9ccmQdYfLLPK0TXluP4-Sd7r2vfTOBYaYbhRVeg6wmXrHCqjctaG4284WazoOI0-u8n6zcp5-om_g_wKyUfyY00hP0EGzyiplCG8EWA5Z-Do3Al5jtJeuifS_G-7Ra2tOEOh-VReblmopcmsVc')" 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#0f0c1e]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0c1e]/90 via-transparent to-[#0f0c1e]/40"></div>
            
            {/* Telemetry live pings */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141123]/80 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]"></span>
              <span className="font-mono text-[10px] text-[#00eefc] uppercase tracking-widest font-bold">
                {selectedTheme === 'golge_protokolu' 
                  ? 'MEGACORP MERKEZİ // KAT 84 • SİBER SIZMA'
                  : selectedTheme === 'derin_basinc' 
                    ? 'ABİSAL HENDEK // -850M • 85.2 ATM' 
                    : 'SUB-SEKTÖR 04 // PROTOKOL AKTİF'}
              </span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141123]/80 backdrop-blur-md border border-white/10">
              <span className="material-symbols-outlined text-[#ffba27] text-[14px]">
                {selectedTheme === 'golge_protokolu' ? 'security' : (selectedTheme === 'derin_basinc' ? 'waves' : 'wifi_tethering')}
              </span>
              <span className="font-mono text-[10px] text-[#ffba27] font-bold">
                {selectedTheme === 'golge_protokolu' ? 'SHD-904' : (selectedTheme === 'derin_basinc' ? 'TRX-7' : 'MS: 24')}
              </span>
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded ${
                  selectedTheme === 'golge_protokolu' ? 'bg-[#ffb703] text-black' :
                  selectedTheme === 'derin_basinc' ? 'bg-[#00eefc] text-[#002022]' : 'bg-[#ffb703] text-black'
                } font-mono font-bold text-[9px] uppercase tracking-wider`}>
                  {selectedTheme === 'golge_protokolu' ? 'SİBER SIZMA // NEON KASA' :
                   selectedTheme === 'derin_basinc' ? 'CO-OP DALIŞ PROTOKOLÜ' : 'CO-OP GÖREVİ'}
                </span>
                <span className="font-mono text-[10px] text-[#9e8f78] tracking-wider">
                  {selectedTheme === 'golge_protokolu' ? 'KAT 84 VERİ ÇEKİRDEĞİ' :
                   selectedTheme === 'derin_basinc' ? 'HİDRO-04 DALIŞ KABİNİ' : 'MODÜL NO: #702'}
                </span>
              </div>
              <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(0,238,252,0.3)]">
                {selectedTheme === 'golge_protokolu' ? (
                  <>Gölge <span className="text-[#00eefc]">Protokolü // Sızma</span></>
                ) : selectedTheme === 'derin_basinc' ? (
                  <>Derin <span className="text-[#00eefc]">Basınç // Batış</span></>
                ) : (
                  <>Kayıp <span className="text-[#00eefc]">Sinyal</span></>
                )}
              </h2>
              <p className="text-xs text-[#d5c4ac] line-clamp-2 mt-1 leading-snug">
                {selectedTheme === 'golge_protokolu'
                  ? 'Megacorp kat 84 veri kasası siber sızma operasyonu. Sahadaki Ajan ve Gölge Hacker ile %100 gizlilik.'
                  : selectedTheme === 'derin_basinc'
                    ? 'Abisal hendekte iki dalgıç eş zamanlı asimetrik dalış ve basınç dengeleme operasyonu. Yeni dalış kabini aç veya koda katıl.'
                    : 'İki oyunculu eş zamanlı asimetrik uzay görevi. Yeni bir oda aç veya mevcut koda katıl.'}
              </p>
            </div>
          </div>
        </div>

        {/* Player Name Field */}
        <div className="p-3 rounded-xl bg-[#1c192c] border border-white/10 flex flex-col gap-1.5 shadow-md">
          <label className="text-[10px] font-mono text-[#9e8f78] uppercase font-bold tracking-wider flex items-center justify-between">
            <span>
              {selectedTheme === 'golge_protokolu' ? 'OPERATÖR KOD ADI' :
               selectedTheme === 'derin_basinc' ? 'DALGIÇ ÇAĞRI ADI' : 'ASTRONOT ÇAĞRI ADI'}
            </span>
            <span className="text-[#ffb703]">OTOMATİK</span>
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0f0c1e] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#00eefc] font-manrope transition-colors"
            placeholder={
              selectedTheme === 'golge_protokolu' ? 'Ajan / Hacker kod adı (Örn: Ajan Ece)...' :
              selectedTheme === 'derin_basinc' ? 'Dalgıç çağrı adı (Örn: Dümenci Ece)...' : 'Astronot çağrı adını girin...'
            }
          />
        </div>

        {/* Tactical Mode Switcher (Oda Kur / Odaya Katıl) */}
        <div className="w-full bg-[#0f0c1e] p-1.5 rounded-xl border border-white/10 flex items-center gap-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-sora text-xs font-bold uppercase tracking-wider cursor-pointer ${
              mode === 'create'
                ? 'bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] shadow-[0_4px_16px_rgba(255,183,3,0.35)]'
                : 'bg-transparent text-[#d5c4ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">add_circle</span>
            <span>Oda Kur</span>
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-sora text-xs font-bold uppercase tracking-wider cursor-pointer ${
              mode === 'join'
                ? 'bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] shadow-[0_4px_16px_rgba(0,238,252,0.35)]'
                : 'bg-transparent text-[#d5c4ac] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">meeting_room</span>
            <span>Odaya Katıl</span>
          </button>
        </div>

        {/* Error or Status Banner */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] text-rose-400">warning</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Invited via Link Banner */}
        {initialUrlRoom && (
          <div className="p-3 rounded-2xl bg-cyan-950/70 border border-cyan-400/50 text-cyan-200 text-xs flex items-center gap-2.5 animate-fadeIn shadow-lg">
            <span className="text-xl">🚀</span>
            <div className="flex flex-col">
              <span className="font-bold text-white font-sora">
                Oda Daveti: <span className="font-mono text-[#ffba27]">{`KYP-${initialUrlRoom}`}</span>
              </span>
              <span className="text-[11px] text-cyan-300/80">
                Takım arkadaşın bu odayı açtı. İsmini yazıp doğrudan bağlanabilirsin.
              </span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 w-full"
            >
              {/* Main Operation / Game Selection Card */}
            <div className="w-full rounded-2xl bg-gradient-to-b from-[#1c192c] to-[#120f22] p-3.5 flex flex-col gap-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00eefc] text-[18px]">videogame_asset</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-cyan-300">
                    ANA OYUN & OPERASYON SEÇİMİ
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#ffba27] font-bold">
                  {selectedTheme === 'karantina_2088'
                    ? '☣️ KARANTİNA 2088 (YENİ)'
                    : selectedTheme === 'golge_protokolu' 
                      ? '🕶️ GÖLGE PROTOKOLÜ' 
                      : (selectedTheme === 'derin_basinc' ? '🌊 BATİSKAP' : '🛰️ UZAY İSTASYONU')}
                </span>
              </div>

              {/* Game Selection Cards */}
              <div className="grid grid-cols-1 gap-2">
                {/* 0: Karantina 2088 // Protokolü (SEC-04) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme('karantina_2088');
                    setStationSector('Sektör-09 Derin İzolasyon // SEC-04');
                    if (playerName === 'Kaptan Ece' || playerName === 'Dümenci Ece' || playerName === 'Ajan Ece' || !playerName) {
                      setPlayerName('Baş Biyolog Selin');
                    }
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedTheme === 'karantina_2088'
                      ? 'bg-gradient-to-r from-amber-950/60 via-[#1f1a14] to-[#141123] border-[#ffb703] shadow-[0_0_20px_rgba(255,183,3,0.3)]'
                      : 'bg-[#151226]/80 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl ${
                      selectedTheme === 'karantina_2088' 
                        ? 'bg-amber-500/20 text-[#ffb703] border border-amber-400/40 shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">biotech</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sora text-xs font-bold text-white tracking-wide">
                          KARANTİNA 2088 // PROTOKOLÜ
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-mono text-[9px] font-black uppercase">
                          YENİ
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-200/90 leading-tight mt-0.5">
                        Sektör-09 Derin İzolasyon • SEC-04
                      </span>
                      <span className="text-[10px] text-[#9e8f78] font-mono mt-0.5">
                        Biyolojik Kilit • Baş Biyolog Selin &amp; Güvenlik Şefi Baran
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      selectedTheme === 'karantina_2088'
                        ? 'bg-[#ffb703] text-[#271900] border-[#ffb703]'
                        : 'border-white/20 text-transparent'
                    }`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </span>
                  </div>
                </button>

                {/* 1: Gölge Protokolü // Siber Operasyon (Neon Kasa) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme('golge_protokolu');
                    setStationSector('Megacorp Kat 84 // Neon Kasa');
                    if (playerName === 'Kaptan Ece' || playerName === 'Dümenci Ece' || playerName === 'Baş Biyolog Selin' || !playerName) {
                      setPlayerName('Ajan Ece');
                    }
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedTheme === 'golge_protokolu'
                      ? 'bg-gradient-to-r from-purple-950/70 via-[#201d30] to-[#120f22] border-[#00eefc] shadow-[0_0_20px_rgba(0,238,252,0.3)]'
                      : 'bg-[#151226]/80 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl ${
                      selectedTheme === 'golge_protokolu' 
                        ? 'bg-purple-500/20 text-[#00eefc] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">terminal</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sora text-xs font-bold text-white tracking-wide">
                          GÖLGE PROTOKOLÜ // SİBER OPERASYON
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#ffb703] text-[#271900] font-mono text-[9px] font-black uppercase">
                          NEON KASA
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-200/90 leading-tight mt-0.5">
                        Megacorp Merkezi Kat 84 • Veri Çekirdeği
                      </span>
                      <span className="text-[10px] text-[#9e8f78] font-mono mt-0.5">
                        %100 Gizlilik • Sahadaki Ajan & Gölge Hacker
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      selectedTheme === 'golge_protokolu'
                        ? 'bg-[#00eefc] text-[#002022] border-[#00eefc]'
                        : 'border-white/20 text-transparent'
                    }`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </span>
                  </div>
                </button>

                {/* 2: Derin Basınç // Batış */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme('derin_basinc');
                    setStationSector('HİDRO-04 Abisal Hendek (-850m)');
                    if (playerName === 'Kaptan Ece' || playerName === 'Ajan Ece' || playerName === 'Baş Biyolog Selin' || !playerName) {
                      setPlayerName('Dümenci Ece');
                    }
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedTheme === 'derin_basinc'
                      ? 'bg-gradient-to-r from-cyan-950/60 to-[#1d1b33] border-[#00eefc] shadow-[0_0_20px_rgba(0,238,252,0.25)]'
                      : 'bg-[#151226]/80 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl ${
                      selectedTheme === 'derin_basinc' 
                        ? 'bg-cyan-500/20 text-[#00eefc] border border-cyan-400/40 shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">anchor</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sora text-xs font-bold text-white tracking-wide">
                          DERİN BASINÇ // BATIŞ
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-[#002022] font-mono text-[9px] font-black uppercase">
                          BATİSKAP
                        </span>
                      </div>
                      <span className="text-[11px] text-cyan-200/90 leading-tight mt-0.5">
                        HİDRO-04 Batiskap • -850m Abisal Hendek
                      </span>
                      <span className="text-[10px] text-[#9e8f78] font-mono mt-0.5">
                        85.2 ATM Kritik Basınç • Dümenci & Makinist
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      selectedTheme === 'derin_basinc'
                        ? 'bg-[#00eefc] text-[#002022] border-[#00eefc]'
                        : 'border-white/20 text-transparent'
                    }`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </span>
                  </div>
                </button>

                {/* 3: Kayıp Sinyal (Uzay İstasyonu) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme('kayip_sinyal');
                    setStationSector('Aurora-7 Çekirdek Güvertesi');
                    if (playerName === 'Dümenci Ece' || playerName === 'Ajan Ece' || playerName === 'Baş Biyolog Selin' || !playerName) {
                      setPlayerName('Kaptan Ece');
                    }
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedTheme === 'kayip_sinyal'
                      ? 'bg-gradient-to-r from-amber-950/50 to-[#1d1b33] border-[#ffb703] shadow-[0_0_20px_rgba(255,183,3,0.25)]'
                      : 'bg-[#151226]/80 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl ${
                      selectedTheme === 'kayip_sinyal' 
                        ? 'bg-amber-500/20 text-[#ffb703] border border-amber-400/40 shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sora text-xs font-bold text-white tracking-wide">
                          KAYIP SİNYAL // İSTASYON
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-[#271900] font-mono text-[9px] font-black uppercase">
                          UZAY MODU
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-200/90 leading-tight mt-0.5">
                        Aurora-7 Çekirdek Güvertesi • Uzay İstasyonu
                      </span>
                      <span className="text-[10px] text-[#9e8f78] font-mono mt-0.5">
                        Reaktör & Sinyal Matrisi • Kaptan & Mühendis
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      selectedTheme === 'kayip_sinyal'
                        ? 'bg-[#ffb703] text-[#271900] border-[#ffb703]'
                        : 'border-white/20 text-transparent'
                    }`}>
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mission Telemetry Card */}
            <div className="w-full rounded-2xl bg-[#1c192c] p-4 flex flex-col gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2b273b] border border-white/10 flex items-center justify-center text-[#ffdba0] shadow-[0_0_12px_rgba(255,187,39,0.2)]">
                    <span className="material-symbols-outlined text-[22px]">
                      {selectedTheme === 'golge_protokolu' ? 'terminal' : selectedTheme === 'derin_basinc' ? 'scuba_diving' : 'rocket_launch'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sora text-sm font-bold text-white">
                      {selectedTheme === 'golge_protokolu' ? '2 Ajan Siber Sızma' : selectedTheme === 'derin_basinc' ? '2 Dalgıç Asimetrik' : '2 Astronot Asimetrik'}
                    </span>
                    <span className="text-[11px] text-[#d5c4ac]">
                      {selectedTheme === 'golge_protokolu' ? 'Megacorp kat 84 veri kasası operasyonu' : selectedTheme === 'derin_basinc' ? 'Abisal hendek canlı senkronizasyonu' : 'Takım tabanlı canlı senkronizasyon'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#201d30] text-[#00eefc] text-[10px] font-mono font-bold uppercase border border-cyan-500/30">
                  {selectedTheme === 'golge_protokolu' ? '%100 GİZLİLİK' : selectedTheme === 'derin_basinc' ? '85.2 ATM KRİTİK' : 'KAPALI DEVRE'}
                </span>
              </div>

              {/* Parameter Badges Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center py-2 px-1.5 rounded-xl bg-[#0f0c1e] border border-white/5 text-center">
                  <span className="material-symbols-outlined text-[#00eefc] text-[18px] mb-0.5">timer</span>
                  <span className="font-mono text-[9px] text-[#9e8f78] uppercase font-bold">SÜRE</span>
                  <span className="font-sora text-[11px] font-bold text-white mt-0.5">5 Dakika</span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1.5 rounded-xl bg-[#0f0c1e] border border-white/5 text-center">
                  <span className="material-symbols-outlined text-[#ffba27] text-[18px] mb-0.5">network_node</span>
                  <span className="font-mono text-[9px] text-[#9e8f78] uppercase font-bold">ZORLUK</span>
                  <span className="font-sora text-[11px] font-bold text-[#ffba27] mt-0.5">Standart</span>
                </div>
                <div className="flex flex-col items-center justify-center py-2 px-1.5 rounded-xl bg-[#0f0c1e] border border-white/5 text-center">
                  <span className="material-symbols-outlined text-[#dab5ff] text-[18px] mb-0.5">shuffle</span>
                  <span className="font-mono text-[9px] text-[#9e8f78] uppercase font-bold">ROL ATAMA</span>
                  <span className="font-sora text-[11px] font-bold text-white mt-0.5">Seçimli</span>
                </div>
              </div>

              {/* Sector Selection Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201d30] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00eefc] text-[18px]">radar</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] text-[#9e8f78] uppercase">
                      {selectedTheme === 'golge_protokolu' ? 'HEDEF SEKTÖR' : selectedTheme === 'derin_basinc' ? 'DALIŞ BÖLGESİ' : 'İSTASYON KONUMU'}
                    </span>
                    <span className="font-sora text-xs font-semibold text-white">{stationSector}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (selectedTheme === 'golge_protokolu') {
                      setStationSector(stationSector.includes('Kat 84') ? 'Megacorp Kat 92 // Güvenlik Çekirdeği' : 'Megacorp Kat 84 // Neon Kasa');
                    } else if (selectedTheme === 'derin_basinc') {
                      setStationSector(stationSector.includes('-850m') ? 'HİDRO-04 Termal Baca (-1200m)' : 'HİDRO-04 Abisal Hendek (-850m)');
                    } else {
                      setStationSector(stationSector.includes('Aurora') ? 'Vortex-9 Reaktör Güvertesi' : 'Aurora-7 Çekirdek Güvertesi');
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-[#2b273b] hover:bg-[#363246] flex items-center justify-center text-white/80 hover:text-[#00eefc] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </button>
              </div>
            </div>

            {/* Mission & Scenario Mode Selector Card */}
            <div className="w-full rounded-2xl bg-[#1c192c] p-4 flex flex-col gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00eefc] text-[18px]">tune</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase font-bold text-cyan-300">
                    GÖREV VE SENARYO SEÇİMİ
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#ffba27] font-bold">
                  {selectedGameMode === 'gelismis' ? '3 EŞZAMANLI SİSTEM' : '2 AŞAMA GÖREVİ'}
                </span>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* Gelişmiş Taktik Mod Button */}
                <button
                  type="button"
                  onClick={() => setSelectedGameMode('gelismis')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedGameMode === 'gelismis'
                      ? 'bg-cyan-500/20 border-[#00eefc] text-white shadow-[0_0_16px_rgba(0,238,252,0.3)]'
                      : 'bg-[#151226] border-white/5 text-[#9e8f78] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">⚡</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-[#00eefc] border border-cyan-500/30">
                      ÖNERİLEN
                    </span>
                  </div>
                  <div className="font-sora text-xs font-bold text-white mb-0.5">
                    Gelişmiş Taktik
                  </div>
                  <p className="text-[9px] text-[#b0a596] leading-tight">
                    Reaktör, Sinyal ve Hava Kilidi eşzamanlı; 7 MW güç matrisi ve tahliye rotaları.
                  </p>
                </button>

                {/* Standart Mod Button */}
                <button
                  type="button"
                  onClick={() => setSelectedGameMode('standart')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedGameMode === 'standart'
                      ? 'bg-amber-500/20 border-[#ffb703] text-white shadow-[0_0_16px_rgba(255,183,3,0.3)]'
                      : 'bg-[#151226] border-white/5 text-[#9e8f78] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">🌟</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-[#ffba27] border border-amber-500/30">
                      4 AŞAMA
                    </span>
                  </div>
                  <div className="font-sora text-xs font-bold text-white mb-0.5">
                    Standart Sıralı
                  </div>
                  <p className="text-[9px] text-[#b0a596] leading-tight">
                    Seçeceğin 2 görev sırayla oynanır, ardından Enerji ve Kurtarma gelir.
                  </p>
                </button>
              </div>

              {/* Mode Specific Sub-Panel */}
              {selectedGameMode === 'standart' ? (
                <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                  <div className="p-3 rounded-xl bg-[#0f0c1e] border border-amber-500/30 flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-400 text-[18px]">shuffle</span>
                        <span className="font-mono text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                          Aşama Görevleri: Rastgele Atanır
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                        OTOMATİK
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      Her turda aşama görevleri otomatik olarak rastgele belirlenir. Oyuncuların önceden görev seçmesi gerekmez.
                    </p>

                    <div className="px-2.5 py-1.5 rounded-lg bg-[#18152e] border border-white/5 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Atama Kuralı:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-300 font-bold">1. Faz: Rastgele</span>
                        <span className="text-white/30">➔</span>
                        <span className="text-amber-300 font-bold">2. Faz: Rastgele</span>
                        <span className="text-white/30">➔</span>
                        <span className="text-emerald-300 font-bold">Enerji</span>
                        <span className="text-white/30">➔</span>
                        <span className="text-rose-300 font-bold">Kurtarma</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Gelişmiş Taktik Mod İçerik Önizlemesi */
                <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
                  <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-cyan-500/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                        Eşzamanlı 3 Operasyon Sistemi
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-500/30">
                        7 MW GÜÇ LİMİTİ
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                      <div className="p-1.5 rounded-lg bg-[#18152e] border border-rose-500/30 flex flex-col items-center">
                        <span className="text-rose-400 font-bold">🔴 Reaktör</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Telemetri & Valf</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#18152e] border border-cyan-500/30 flex flex-col items-center">
                        <span className="text-cyan-400 font-bold">📡 Sinyal</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Glif Kriptosu</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#18152e] border border-emerald-500/30 flex flex-col items-center">
                        <span className="text-emerald-400 font-bold">🚪 Hava Kilidi</span>
                        <span className="text-[8px] text-slate-400 mt-0.5">Basınç & Tahliye</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#c7beaf] leading-relaxed">
                      Sistemler serbestçe gezilebilir, ilerlemeler kaybolmaz. Görevleri çözüp enerjiyi yönlendirerek Alfa, Beta veya Gama tahliye rotalarından birine ulaşın.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Arcade 3D Push Launch Button */}
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className={`relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r ${
                selectedTheme === 'karantina_2088'
                  ? 'from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_6px_0_#6b4b00,0_12px_28px_rgba(255,183,3,0.4)]'
                  : selectedTheme === 'golge_protokolu'
                    ? 'from-[#00eefc] via-[#a855f7] to-[#00eefc] text-stone-950 shadow-[0_6px_0_#4c1d95,0_12px_28px_rgba(168,85,247,0.4)]'
                    : selectedTheme === 'derin_basinc'
                      ? 'from-[#00eefc] via-[#00dbe9] to-[#00eefc] text-[#002022] shadow-[0_6px_0_#004f54,0_12px_28px_rgba(0,238,252,0.4)]'
                      : 'from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] shadow-[0_6px_0_#6b4b00,0_12px_28px_rgba(255,183,3,0.4)]'
              } font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer ${
                isLoading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading 
                  ? 'progress_activity' 
                  : (selectedTheme === 'karantina_2088' ? 'biotech' : selectedTheme === 'golge_protokolu' ? 'terminal' : selectedTheme === 'derin_basinc' ? 'anchor' : 'rocket_launch')}
              </span>
              <span>
                {isLoading 
                  ? 'OPERASYON HAZIRLANIYOR...' 
                  : (selectedTheme === 'karantina_2088' ? 'KARANTİNA PROTOKOLÜNÜ BAŞLAT' : selectedTheme === 'golge_protokolu' ? 'SİBER OPERASYONU BAŞLAT' : selectedTheme === 'derin_basinc' ? 'DALIŞ ODASINI OLUŞTUR' : 'YENİ ODA OLUŞTUR')}
              </span>
              {!isLoading && <span className="material-symbols-outlined text-[18px]">chevron_right</span>}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3 w-full"
          >
            <div className="w-full rounded-2xl bg-[#1c192c] p-4 flex flex-col gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#00eefc] tracking-wider uppercase font-bold">DOĞRUDAN BAĞLANTI</span>
                  <h3 className="font-sora text-sm font-bold text-white">Oda Kodunu Girin</h3>
                </div>
                <span className="material-symbols-outlined text-[#9e8f78] text-[22px]">dialpad</span>
              </div>

              {/* Segmented PIN Input Slots with Dynamic Prefix */}
              <div className="flex items-center justify-center gap-2 my-2 font-mono">
                <div className="h-12 px-3 rounded-xl bg-[#0f0c1e] border border-[#00eefc]/30 flex items-center justify-center font-bold text-[#00eefc] text-sm tracking-widest select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {selectedTheme === 'karantina_2088' ? 'KR88 -' : (selectedTheme === 'golge_protokolu' ? 'SHDW -' : (selectedTheme === 'derin_basinc' ? 'DP -' : 'KYP -'))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {pinDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`pin-slot-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      placeholder="•"
                      className="w-12 h-12 text-center bg-[#0f0c1e] text-[#00eefc] font-sora text-lg font-bold rounded-xl border border-white/15 focus:border-[#00eefc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_rgba(0,238,252,0.2)] focus:outline-none uppercase placeholder:text-white/20"
                    />
                  ))}
                </div>
              </div>

              {/* Quick Action Utilities */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => applyNormalizedCode('7024')}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#201d30] hover:bg-[#2b273b] text-white flex items-center justify-center gap-1.5 transition-colors border border-white/5 text-xs font-mono"
                >
                  <span className="material-symbols-outlined text-[#00eefc] text-[16px]">restart_alt</span>
                  <span>Varsayılan Kod</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (navigator?.clipboard?.readText) {
                        const clip = await navigator.clipboard.readText();
                        if (clip) applyNormalizedCode(clip);
                      }
                    } catch {
                      applyNormalizedCode(state.roomCode);
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#201d30] hover:bg-[#2b273b] text-white flex items-center justify-center gap-1.5 transition-colors border border-white/5 text-xs font-mono"
                >
                  <span className="material-symbols-outlined text-[#ffba27] text-[16px]">content_paste</span>
                  <span>Yapıştır</span>
                </button>
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleJoinRoom}
              disabled={isLoading}
              className={`relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00eefc] via-[#00dbe9] to-[#00eefc] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_28px_rgba(0,238,252,0.35)] active:translate-y-1 active:shadow-[0_2px_0_#004f54,0_4px_12px_rgba(0,238,252,0.2)] transition-all cursor-pointer ${
                isLoading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'progress_activity' : 'cell_tower'}
              </span>
              <span>{isLoading ? 'ODAYA BAĞLANILIYOR...' : 'ODAYA BAĞLAN'}</span>
              {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Recent Crew Section */}
        <div className="flex flex-col mt-2 w-full">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[17px]">groups_2</span>
              <span className="font-mono text-[10px] text-white uppercase tracking-wider font-bold">Son Takım Arkadaşları</span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] uppercase font-bold">2 AKTİF DOK</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* Member 1: Ece */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c192c] hover:bg-[#201d30] transition-colors border border-white/5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full bg-[#2b273b] border border-amber-400/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ffba27] text-[20px]">female</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_6px_#00eefc]"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sora text-xs font-bold text-white">Ece</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffba27] font-mono text-[8px] uppercase font-bold">
                      Mühendis
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9e8f78]">Son görev: 12 dk önce • Başarılı</span>
                </div>
              </div>
              <button 
                onClick={() => handleInviteRecent('Ece', 'muhendis')}
                className="py-1.5 px-2.5 rounded-lg bg-[#201d30] hover:bg-[#00eefc] text-[#00eefc] hover:text-black transition-colors flex items-center gap-1 font-mono text-[10px] font-bold border border-white/10"
              >
                <span className="material-symbols-outlined text-[14px]">forward_to_inbox</span>
                <span>Davet Et</span>
              </button>
            </div>

            {/* Member 2: Mert */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c192c] hover:bg-[#201d30] transition-colors border border-white/5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full bg-[#2b273b] border border-cyan-400/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00eefc] text-[20px]">male</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_6px_#00eefc]"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sora text-xs font-bold text-white">Mert</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[#00eefc] font-mono text-[8px] uppercase font-bold">
                      Kaptan
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9e8f78]">Son görev: 44 dk önce • Başarılı</span>
                </div>
              </div>
              <button 
                onClick={() => handleInviteRecent('Mert', 'kaptan')}
                className="py-1.5 px-2.5 rounded-lg bg-[#201d30] hover:bg-[#ffb703] text-[#ffba27] hover:text-black transition-colors flex items-center gap-1 font-mono text-[10px] font-bold border border-white/10"
              >
                <span className="material-symbols-outlined text-[14px]">forward_to_inbox</span>
                <span>Davet Et</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* iOS Home Indicator Pill Bar */}
      <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-3 pointer-events-none"></div>
    </div>
  );
};
