import React, { useState } from 'react';
import { 
  MissionState, 
  EnvironmentType, 
  ENVIRONMENTS,
  MiniGameType,
  GameMode
} from '../../types/game';
import { colyseusClient } from '../../services/colyseusClient';

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
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const copyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const isBothReady = state.players.kaptan.ready && state.players.muhendis.ready;

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[915px] bg-[#0a0815] text-white flex flex-col justify-between pb-6 rounded-[42px] border border-white/10 shadow-2xl relative select-none overflow-hidden animate-fadeIn font-sans">
      
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#00eefc]/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#f59e0b]/15 rounded-full blur-[90px] pointer-events-none"></div>

      {/* TopBar / Header */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-6 pb-2">
        {/* Brand Logo & Title */}
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

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2.5">
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCR0yjFbJiiqtroQLKV2y0sAgrkg4pcUvJIu15SqGHH0MXFUSvSjGsOl6o-iZITWJCdU0FJKV2zkv-KyVquO_n9tktiCkvF5thupF9E9jh03uATTeL12UqevQJh7RpGdIMWZ_KGFVL4j2Lf01YIGfvCn7FAUHMLy7u8pDbxfFEyWd2VR4JgoyGVjqsQx4-jlPS1YH9fxpr80PbwCMR3Z7Dkx49OgtbtuTFtHePdLM" 
              alt="Uzay İstasyonu Hangar ve Reaktör Vitrini" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d1f] via-[#0e0d1f]/60 to-transparent"></div>
          </div>

          <div className="relative z-10 pt-20">
            <h1 className="text-3xl leading-[1.05] font-black tracking-tight font-sora">
              <span className="block text-white drop-shadow-md">Kayıp</span>
              <span className="block text-[#00eefc] drop-shadow-[0_0_16px_rgba(0,238,252,0.65)] tracking-normal">Sinyal</span>
            </h1>
            <p className="text-[12px] leading-snug text-slate-300 font-normal mt-1.5 max-w-[275px]">
              İstasyon sessiz. Reaktör dengesiz. Sinyali geri getirmek için birlikte çalışın.
            </p>
          </div>
        </section>

        {/* Room Code Card */}
        <section className="rounded-2xl px-4 py-3 bg-gradient-to-b from-[#1d1a34]/70 to-[#110f22]/85 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-slate-400 font-mono">ODA KODU</span>
              <div className="text-[25px] font-black tracking-wider text-[#fbbf24] font-sora -mt-0.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]">
                {state.roomCode.replace('KYP-', '') || 'PV7K2M'}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={copyCode}
                className="w-10 h-10 rounded-xl bg-[#1f1d38] border border-[#00eefc]/30 hover:border-[#00eefc] flex items-center justify-center text-cyan-300 active:scale-95 transition-all shadow-md cursor-pointer" 
                title="Kodu Kopyala" 
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
            {copied ? 'Kopyalandı! Arkadaşın bu kodla katılabilir.' : 'Arkadaşın bu kodla katılabilir ya da QR kodu paylaşabilirsin.'}
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
        </section>

        {/* Crew Selection Lobby (Player 1 & Player 2 Side-by-Side) */}
        <section className="grid grid-cols-2 gap-3">
          {/* Player 1: Ece (Leader - Kaptan) */}
          <div 
            onClick={state.myRole === 'kaptan' ? toggleMyReady : undefined}
            className={`relative rounded-2xl p-2.5 pb-2.5 bg-gradient-to-b from-[#241f42] to-[#121124] border-2 border-[#f59e0b]/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98 transition-all`}
          >
            <div className="absolute top-2 left-2 z-20 flex items-center space-x-1 bg-[#f59e0b] text-[#2b1700] px-2.5 py-0.5 rounded-full shadow-md font-bold text-[10px]">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M10 2l2.5 5 4.5-3-1.5 8H4.5L3 4l4.5 3L10 2z"></path>
              </svg>
              <span>Lider</span>
            </div>

            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 mb-2">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLbCVA7kytNnSKo-gaPE6NKFjpPbQRs2t25Ai3LLzN9z6Rs1jEhpygEPnnSIHuuVKNygcTWw7VWm1YfzXqvbYdp_OiQgaVWlkvpQM_u5T136mUlSKgIyXW-cLODBk_uj5ROs4BYSAYZfWN01cu1lH-RjGhCz3Cb6kqMKU1dNETrWmg4gKa3ED9YpA3HwDUSxH7gHneqXsRfTAXrkkKQI1k8ooNGS7rglu29_COf2U" 
                alt="Kaptan Ece" 
                className="w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121124] via-transparent to-transparent"></div>
            </div>

            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white font-sora">{state.players.kaptan.name}</h3>
              <span className="text-[10px] text-amber-300 font-mono">Kaptan</span>
            </div>

            <div className={`mt-1.5 w-full rounded-xl py-1 flex items-center justify-center space-x-1.5 border ${
              state.players.kaptan.ready 
                ? 'bg-[#0c1e1d] border-[#10b981]/50 text-emerald-400' 
                : 'bg-[#1c192c] border-white/10 text-white/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${state.players.kaptan.ready ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]' : 'bg-white/20'}`}></span>
              <span className="text-[11px] font-semibold">{state.players.kaptan.ready ? 'Hazır' : 'Bekliyor'}</span>
            </div>
          </div>

          {/* Player 2: Mert (Mühendis) */}
          <div 
            onClick={state.myRole === 'muhendis' ? toggleMyReady : undefined}
            className={`relative rounded-2xl p-2.5 pb-2.5 bg-gradient-to-b from-[#1b1e3b] to-[#101021] border border-cyan-500/30 shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98 transition-all`}
          >
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 mb-2">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoeQN2pLWf8Xj8TxKoQJTTjpc9CsSHTF5JxwfmESK0bsLl_Kyh6Iux2FofuEtAWJigxSdB3vVnrkTLj6hpBR59wJ-lzOi-ZYd2q6m5lU7yOlMZ6lvzGFY2r5Tp3yffa2XhDCZ2SykuiFajBooH6M_buYGjfh8bol08jD3Fc0bAjP_jT3sdW2u61qvqBk2uo1DrqLaecld0x7BSi6bHLhJudQW63uoFwue1Te-7sj8" 
                alt="Mühendis Mert" 
                className="w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101021] via-transparent to-transparent"></div>
            </div>

            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white font-sora">{state.players.muhendis.name}</h3>
              <span className="text-[10px] text-cyan-300 font-mono">Mühendis</span>
            </div>

            <div className={`mt-1.5 w-full rounded-xl py-1 flex items-center justify-center space-x-1.5 border ${
              state.players.muhendis.ready 
                ? 'bg-[#0c1e1d] border-[#10b981]/50 text-emerald-400' 
                : 'bg-[#1c192c] border-white/10 text-white/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${state.players.muhendis.ready ? 'bg-[#10b981] shadow-[0_0_6px_#10b981]' : 'bg-white/20'}`}></span>
              <span className="text-[11px] font-semibold">{state.players.muhendis.ready ? 'Hazır' : 'Bekliyor'}</span>
            </div>
          </div>
        </section>

        {/* Quick Facts Row */}
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

      </main>

      {/* Bottom Action Footer with Massive Tactile 3D Circular Launch Button */}
      <footer className="relative z-20 px-4 pt-2 flex flex-col items-center space-y-3.5">
        
        {/* Status Telemetry Pill above launch button */}
        <div className={`px-3.5 py-1 rounded-full border text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${
          isBothReady 
            ? 'bg-amber-500/20 border-[#ffb703] text-[#ffba27] shadow-[0_0_20px_rgba(255,183,3,0.45)]' 
            : 'bg-[#1c192c] border-white/10 text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isBothReady 
              ? 'bg-[#ffb703] animate-ping shadow-[0_0_8px_#ffb703]' 
              : 'bg-amber-400/50 animate-pulse'
          }`}></span>
          <span>
            {isBothReady ? 'SİSTEMLER HAZIR • FIRLATMAYA UYGUN' : 'BEKLENİYOR • İKİ OYUNCU DA HAZIR OLMALI'}
          </span>
        </div>

        {/* Massive Tactile 3D Circular Launch Button ("Görevi başlat") with Neon Glory */}
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
                    togglePartnerReady();
                  }
                }
              }}
              aria-label="Görevi başlat" 
              className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group focus:outline-none relative z-20 ${
                isBothReady && (!isOnline || isHost)
                  ? 'launch-btn-neon-active scale-100 cursor-pointer' 
                  : 'bg-[radial-gradient(circle_at_45%_35%,#544b36_0%,#3d3420_40%,#261d0f_80%,#140e06_100%)] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.8)] border border-amber-500/20 text-[#a89066] hover:brightness-110 active:scale-95'
              }`}
              type="button"
            >
              {/* Play Triangle Icon with Glow */}
              <div className="w-7 h-7 flex items-center justify-center mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                <svg className={`w-7 h-7 ${isBothReady ? 'text-[#291400] drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'text-[#8a7247]'} fill-current transform translate-x-0.5 transition-transform group-hover:scale-110`} viewBox="0 0 24 24">
                  <path d="M7 4.5v15l13-7.5-13-7.5z"></path>
                </svg>
              </div>
              
              {/* Button Typography */}
              <span className={`text-[13px] font-black leading-tight uppercase tracking-wide font-sora ${
                isBothReady && (!isOnline || isHost) ? 'text-[#251000] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]' : 'text-[#c2ab80]'
              }`}>
                {isOnline && isBothReady && !isHost ? (
                  <>Lideri<br />Bekliyor</>
                ) : (
                  <>Görevi<br />başlat</>
                )}
              </span>

              {/* Ready Indicator Hint if waiting */}
              {!isBothReady && (
                <span className="text-[8px] font-mono font-bold text-amber-400 mt-0.5 opacity-90">
                  {isOnline ? (state.players[state.myRole].ready ? '(Eşlikçi Bekleniyor)' : '(Hazır Ol)') : '(Hazırla)'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Action: Invite Friend ("+ Arkadaşını davet et") with Cyan Neon Glow */}
        <button 
          onClick={copyCode}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1c1a35] via-[#242145] to-[#1c1a35] border border-[#00eefc]/30 hover:border-[#00eefc] hover:shadow-[0_0_18px_rgba(0,238,252,0.3)] flex items-center justify-center space-x-2 text-slate-200 hover:text-white transition-all shadow-lg active:scale-[0.98] cursor-pointer" 
          type="button"
        >
          <svg className="w-4 h-4 text-[#00eefc] drop-shadow-[0_0_6px_#00eefc]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-[13px] font-bold tracking-wide font-sora">
            {copied ? '✓ Oda Kodu Kopyalandı!' : '+ Arkadaşını davet et'}
          </span>
        </button>

      </footer>

      {/* iOS Home Indicator Pill Bar */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-2 pointer-events-none"></div>

      {/* Simple QR Code Modal Preview */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
