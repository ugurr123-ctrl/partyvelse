import React, { useState } from 'react';
import { MissionState, Role } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onStartLobby: () => void;
  isOnlineMode?: boolean;
  onToggleOnlineMode?: () => void;
  onCreateOnlineRoom?: (roomCode: string, playerName: string, role: Role, sector: string) => Promise<void>;
  onJoinOnlineRoom?: (roomCode: string, playerName: string) => Promise<void>;
}

export const Screen01Entry: React.FC<Props> = ({ 
  state, 
  onUpdate, 
  onStartLobby,
  isOnlineMode = true,
  onToggleOnlineMode,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(state.players[state.myRole].name || 'Kaptan Ece');
  const [pinDigits, setPinDigits] = useState<string[]>(['P', 'V', '7', 'K', '', '']);
  const [stationSector, setStationSector] = useState('Aurora-7 Çekirdek Güvertesi');
  const [selectedRole, setSelectedRole] = useState<Role>(state.myRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.toUpperCase().slice(-1);
    const next = [...pinDigits];
    next[index] = char;
    setPinDigits(next);
  };

  const handleCreateRoom = async () => {
    setErrorMsg(null);
    if (isOnlineMode && onCreateOnlineRoom) {
      setIsLoading(true);
      try {
        await onCreateOnlineRoom(state.roomCode, playerName.trim() || 'Kaptan Ece', selectedRole, stationSector);
      } catch (err: any) {
        setErrorMsg(err.message || 'Sunucuya bağlanılamadı.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      myRole: selectedRole,
      players: {
        ...prev.players,
        [selectedRole]: {
          ...prev.players[selectedRole],
          name: playerName.trim() || 'Kaptan Ece',
        },
      },
      status: 'lobby',
    }));
    onStartLobby();
  };

  const handleJoinRoom = async () => {
    setErrorMsg(null);
    const entered = pinDigits.join('').trim();
    const targetCode = entered.length >= 4 ? entered : state.roomCode;

    if (isOnlineMode && onJoinOnlineRoom) {
      setIsLoading(true);
      try {
        await onJoinOnlineRoom(targetCode, playerName.trim() || 'Mühendis Mert');
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
      myRole: partnerRole,
      players: {
        ...prev.players,
        [partnerRole]: {
          ...prev.players[partnerRole],
          name: playerName.trim() || 'Mühendis Mert',
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
    <div className="w-full max-w-[420px] mx-auto min-h-[900px] bg-[#141123] text-[#e6dff9] flex flex-col justify-between pb-6 rounded-[36px] border border-white/10 shadow-2xl overflow-hidden relative select-none animate-fadeIn">
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
            <h1 className="font-sora font-semibold text-sm text-white leading-none">Kayıp Sinyal Match</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-white/70">
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#ffdba0] text-[#422c00] flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 flex flex-col gap-3.5 pt-1">
        
        {/* Dynamic Atmospheric Hero Header */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#0f0c1e] shadow-[0_12px_36px_rgba(15,12,30,0.85)] border border-white/10">
          <div className="relative w-full h-48 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4vmlWxlRgzYFWt-nn1ue6kGo5v1CSw5mNcmwoivdDPi3BuGu4uO5C7Y4XRgvN0TrxP18BE2wh2EMzNZGbFT8Xl9ccmQdYfLLPK0TXluP4-Sd7r2vfTOBYaYbhRVeg6wmXrHCqjctaG4284WazoOI0-u8n6zcp5-om_g_wKyUfyY00hP0EGzyiplCG8EWA5Z-Do3Al5jtJeuifS_G-7Ra2tOEOh-VReblmopcmsVc')" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#0f0c1e]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0c1e]/90 via-transparent to-[#0f0c1e]/40"></div>
            
            {/* Telemetry live pings */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141123]/80 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]"></span>
              <span className="font-mono text-[10px] text-[#00eefc] uppercase tracking-widest font-bold">SUB-SEKTÖR 04 // PROTOKOL AKTİF</span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141123]/80 backdrop-blur-md border border-white/10">
              <span className="material-symbols-outlined text-[#ffba27] text-[14px]">wifi_tethering</span>
              <span className="font-mono text-[10px] text-[#ffba27] font-bold">MS: 24</span>
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#ffb703] text-black font-mono font-bold text-[9px] uppercase tracking-wider">
                  CO-OP GÖREVİ
                </span>
                <span className="font-mono text-[10px] text-[#9e8f78] tracking-wider">MODÜL NO: #702</span>
              </div>
              <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(0,238,252,0.3)]">
                Kayıp <span className="text-[#00eefc]">Sinyal</span>
              </h2>
              <p className="text-xs text-[#d5c4ac] line-clamp-2 mt-1 leading-snug">
                İki oyunculu eş zamanlı asimetrik uzay görevi. Yeni bir oda aç veya mevcut koda katıl.
              </p>
            </div>
          </div>
        </div>

        {/* Player Name Field */}
        <div className="p-3 rounded-xl bg-[#1c192c] border border-white/10 flex flex-col gap-1.5 shadow-md">
          <label className="text-[10px] font-mono text-[#9e8f78] uppercase font-bold tracking-wider flex items-center justify-between">
            <span>ASTRONOT ÇAĞRI ADI</span>
            <span className="text-[#ffb703]">OTOMATİK</span>
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0f0c1e] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#00eefc] font-manrope transition-colors"
            placeholder="Çağrı adını girin..."
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

        {/* TAB VIEW 1: Oda Kur Panel */}
        {mode === 'create' && (
          <div className="flex flex-col gap-3 w-full animate-fadeIn">
            {/* Mission Telemetry Card */}
            <div className="w-full rounded-2xl bg-[#1c192c] p-4 flex flex-col gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2b273b] border border-white/10 flex items-center justify-center text-[#ffdba0] shadow-[0_0_12px_rgba(255,187,39,0.2)]">
                    <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sora text-sm font-bold text-white">2 Oyunculu Asimetrik</span>
                    <span className="text-[11px] text-[#d5c4ac]">Takım tabanlı canlı senkronizasyon</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#201d30] text-[#00eefc] text-[10px] font-mono font-bold uppercase border border-cyan-500/30">
                  KAPALI DEVRE
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
                    <span className="font-mono text-[9px] text-[#9e8f78] uppercase">İSTASYON KONUMU</span>
                    <span className="font-sora text-xs font-semibold text-white">{stationSector}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setStationSector(stationSector.includes('Aurora') ? 'Vortex-9 Reaktör Güvertesi' : 'Aurora-7 Çekirdek Güvertesi')}
                  className="w-7 h-7 rounded-lg bg-[#2b273b] hover:bg-[#363246] flex items-center justify-center text-white/80 hover:text-[#00eefc] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </button>
              </div>
            </div>

            {/* Arcade 3D Push Launch Button */}
            <button
              onClick={handleCreateRoom}
              className="relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_28px_rgba(255,183,3,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#6b4b00,0_4px_12px_rgba(255,183,3,0.3)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              <span>YENİ ODA OLUŞTUR</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}

        {/* TAB VIEW 2: Odaya Katıl Panel */}
        {mode === 'join' && (
          <div className="flex flex-col gap-3 w-full animate-fadeIn">
            <div className="w-full rounded-2xl bg-[#1c192c] p-4 flex flex-col gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-[#00eefc] tracking-wider uppercase font-bold">DOĞRUDAN BAĞLANTI</span>
                  <h3 className="font-sora text-sm font-bold text-white">Oda Kodunu Girin</h3>
                </div>
                <span className="material-symbols-outlined text-[#9e8f78] text-[22px]">dialpad</span>
              </div>

              {/* Segmented PIN Input Slots */}
              <div className="grid grid-cols-6 gap-2 my-1">
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    className="h-12 text-center bg-[#0f0c1e] text-[#00eefc] font-sora text-lg font-bold rounded-xl border border-white/15 focus:border-[#00eefc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_rgba(0,238,252,0.2)] focus:outline-none uppercase"
                  />
                ))}
              </div>

              {/* Quick Action Utilities */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPinDigits(['K', 'Y', 'P', '7', '0', '2'])}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#201d30] hover:bg-[#2b273b] text-white flex items-center justify-center gap-1.5 transition-colors border border-white/5 text-xs font-mono"
                >
                  <span className="material-symbols-outlined text-[#00eefc] text-[16px]">qr_code_scanner</span>
                  <span>QR Tara</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPinDigits(['K', 'Y', 'P', '8', '8', 'A'])}
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
              className="relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00eefc] via-[#00dbe9] to-[#00eefc] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_28px_rgba(0,238,252,0.35)] active:translate-y-1 active:shadow-[0_2px_0_#004f54,0_4px_12px_rgba(0,238,252,0.2)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">cell_tower</span>
              <span>ODAYA BAĞLAN</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}

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
