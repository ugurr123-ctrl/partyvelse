import React from 'react';
import { 
  Role, 
  GameStatus, 
  MiniGameType 
} from '../types/game';
import { 
  Radio, 
  ShieldAlert, 
  Zap, 
  Users, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Layers, 
  FileText, 
  ArrowRightLeft,
  Clock,
  Sparkles,
  Trophy
} from 'lucide-react';

interface Props {
  roomCode: string;
  myRole: Role;
  timeLeft: number;
  hullIntegrity: number;
  currentPhaseIndex: number;
  status: GameStatus;
  selectedMiniGames: [MiniGameType, MiniGameType];
  isDisconnected: boolean;
  operationTheme?: 'kayip_sinyal' | 'derin_basinc' | 'golge_protokolu' | 'karantina_2088';
  onToggleDisconnect: () => void;
  onSwitchRole: () => void;
  onOpenRules: () => void;
  onOpenScreenExplorer: () => void;
  onOpenOpening?: () => void;
  onTestEpicSuccess?: () => void;
  onOpenRadio?: () => void;
}

import { soundManager } from '../services/soundEffects';

export const ConsoleHeader: React.FC<Props> = ({
  roomCode,
  myRole,
  timeLeft,
  hullIntegrity,
  currentPhaseIndex,
  status,
  selectedMiniGames,
  isDisconnected,
  operationTheme = 'kayip_sinyal',
  onToggleDisconnect,
  onSwitchRole,
  onOpenRules,
  onOpenScreenExplorer,
  onOpenOpening,
  onTestEpicSuccess,
  onOpenRadio,
}) => {
  const isKarantina = operationTheme === 'karantina_2088';
  const isDerinBasinc = operationTheme === 'derin_basinc';
  const isGolgeProtokolu = operationTheme === 'golge_protokolu';
  const selectedGameName = isKarantina ? 'Karantina 2088' :
                           isDerinBasinc ? 'Derin Basınç' :
                           isGolgeProtokolu ? 'Gölge Protokolü' : 'Kayıp Sinyal';
  const [soundOn, setSoundOn] = React.useState(!soundManager.isMuted());

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseName = (idx: number) => {
    if (isKarantina) {
      if (idx === 0) return '1. Hücresel Analiz & UV';
      if (idx === 1) return '2. Panzehir & Santrifüj';
      if (idx === 2) return '3. Toksik Aerosol Vakumu';
      return '4. Biyo-İzolasyon Sonucu';
    }
    if (isGolgeProtokolu) {
      if (idx === 0) return '1. Güvenlik Duvarı Bypass';
      if (idx === 1) return '2. Lazer İntikali & Körleme';
      if (idx === 2) return '3. Kasa Şifresi & Biyometrik';
      return '4. Kusursuz Kaçış';
    }
    if (idx === 0) {
      return selectedMiniGames[0] === 'ariza_teshisi' ? '1. Arıza Teşhisi' :
             selectedMiniGames[0] === 'sinyal_cozumu' ? (isDerinBasinc ? '1. Sonar & Glif' : '1. Sinyal Çözümü') :
             selectedMiniGames[0] === 'kablo_baglantisi' ? '1. Kablo Bağlantısı' :
             selectedMiniGames[0] === 'hava_kilidi' ? (isDerinBasinc ? '1. Kabin Kilidi' : '1. Hava Kilidi') : '1. Radar';
    }
    if (idx === 1) {
      return selectedMiniGames[1] === 'ariza_teshisi' ? '2. Arıza Teşhisi' :
             selectedMiniGames[1] === 'sinyal_cozumu' ? (isDerinBasinc ? '2. Sonar & Glif' : '2. Sinyal Çözümü') :
             selectedMiniGames[1] === 'kablo_baglantisi' ? '2. Kablo Bağlantısı' :
             selectedMiniGames[1] === 'hava_kilidi' ? (isDerinBasinc ? '2. Kabin Kilidi' : '2. Hava Kilidi') : '2. Radar';
    }
    if (idx === 2) return isDerinBasinc ? '3. Enerji & Balast' : '3. Enerji Dağıtımı';
    return isDerinBasinc ? '4. Yüzeye Çıkış' : '4. Kurtarma Kararı';
  };

  return (
    <header className="sticky top-0 z-40 w-full overflow-hidden bg-[#120f2d]/90 backdrop-blur-md border-b border-white/10 shadow-lg text-[#e6dff9]">
      {/* Top telemetry bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2 text-xs">
        
        {/* Brand & Room Info */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          <button 
            onClick={onOpenOpening}
            title="Açılış Ekranı ve Tanıtım Kartlarına Dön"
            className="flex items-center gap-1.5 shrink-0 hover:opacity-90 transition-opacity cursor-pointer group text-left"
          >
            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm rotate-45 shadow-[0_0_8px] transition-transform group-hover:scale-125 ${
              isKarantina ? 'bg-[#ffb703] text-[#ffb703]' :
              isGolgeProtokolu ? 'bg-[#00eefc] text-[#00eefc]' :
              isDerinBasinc ? 'bg-[#00f0ff] text-[#00f0ff]' : 'bg-[#ffb703] text-[#ffb703]'
            }`}></span>
            
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#ffb703] tracking-wider font-sora text-xs sm:text-sm shrink-0">
                PARTYVERSE
              </span>
              <span className="text-white/30 text-xs hidden sm:inline font-mono">/</span>
              <span className={`font-sora font-extrabold text-xs sm:text-sm tracking-tight flex items-center gap-1 ${
                isKarantina ? 'text-[#ffb703]' :
                isGolgeProtokolu ? 'text-[#00eefc]' :
                isDerinBasinc ? 'text-[#00f0ff]' : 'text-amber-300'
              }`}>
                <span>{isKarantina ? '☣️' : isDerinBasinc ? '⚓' : isGolgeProtokolu ? '🕶️' : '🛸'}</span>
                <span>{selectedGameName}</span>
              </span>
            </div>

            {isKarantina && (
              <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/40 text-[9px] font-mono text-amber-300 font-bold hidden md:inline">
                SEC-04
              </span>
            )}
            {isDerinBasinc && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold hidden md:inline">
                HİDRO-04
              </span>
            )}
            {isGolgeProtokolu && (
              <span className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-[#00eefc]/40 text-[9px] font-mono text-[#00eefc] font-bold hidden md:inline">
                KAT 84
              </span>
            )}
          </button>
          <span className="text-white/20 hidden xs:inline">|</span>
          <div className="flex items-center gap-1 bg-[#1a163b] px-1.5 sm:px-2 py-0.5 rounded border border-white/10 shrink-0">
            <span className="text-[9px] sm:text-[10px] text-[#9e8f78] uppercase font-mono">ODA:</span>
            <span className="font-mono font-bold text-[10px] sm:text-xs text-[#00f0ff]">{roomCode}</span>
          </div>

          {/* Role badge */}
          <button
            onClick={onSwitchRole}
            title={
              isKarantina ? 'Rolü Değiştir (Biyolog ⇄ Güvenlik Şefi)' :
              isGolgeProtokolu ? 'Rolü Değiştir (Ajan ⇄ Hacker)' :
              isDerinBasinc ? 'Rolü Değiştir (Dümenci ⇄ Makinist)' : 'Rolü Değiştir (Kaptan ⇄ Mühendis)'
            }
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold transition-all shadow-sm shrink-0 ${
              myRole === 'kaptan' 
                ? 'bg-amber-500/20 text-[#ffb703] border border-[#ffb703]/40 hover:bg-amber-500/30' 
                : 'bg-cyan-500/20 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-cyan-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
            <span className="uppercase tracking-wider font-sora">
              {myRole === 'kaptan' 
                ? (isKarantina ? 'BAŞ BİYOLOG' : isGolgeProtokolu ? 'AJAN' : (isDerinBasinc ? 'DÜMENCİ' : 'KAPTAN')) 
                : (isKarantina ? 'GÜVENLİK ŞEFİ' : isGolgeProtokolu ? 'HACKER' : (isDerinBasinc ? 'MAKİNİST' : 'MÜHENDİS'))}
            </span>
            <ArrowRightLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70" />
          </button>
        </div>

        {/* Global Live Indicators (Timer, Hull Health, Phase) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          
          {/* Time Remaining */}
          <div className="flex items-center gap-1 bg-[#0b081a] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border border-white/10 font-mono text-[11px] sm:text-xs shrink-0">
            <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-[#ffb703]'}`} />
            <span className={`font-bold ${timeLeft < 60 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Hull Integrity Bar */}
          <div className="hidden md:flex items-center gap-2 bg-[#0b081a] px-2.5 py-1 rounded-md border border-white/10">
            <ShieldAlert className={`w-3.5 h-3.5 ${hullIntegrity < 40 ? 'text-rose-400 animate-bounce' : 'text-[#00f0ff]'}`} />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                <span className="text-[#9e8f78]">BÜTÜNLÜK</span>
                <span className={`font-bold ${hullIntegrity < 40 ? 'text-rose-400' : 'text-[#00f0ff]'}`}>
                  %{hullIntegrity}
                </span>
              </div>
              <div className="w-16 lg:w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    hullIntegrity > 60 ? 'bg-[#00f0ff]' :
                    hullIntegrity > 30 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, hullIntegrity))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Disconnect Simulation Toggle */}
          <button
            onClick={onToggleDisconnect}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono transition-colors border ${
              isDisconnected 
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50' 
                : 'bg-white/5 text-[#9e8f78] border-white/10 hover:text-white'
            }`}
            title="Bağlantı Kesintisini Test Et (Süreyi durdurur, kontrolleri kilitler)"
          >
            {isDisconnected ? <WifiOff className="w-3 h-3 text-rose-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span className="hidden lg:inline">{isDisconnected ? 'Bağlantı Koptu' : 'Canlı Bağlantı'}</span>
          </button>

          {/* Opening / Introduction Cards Trigger */}
          {onOpenOpening && (
            <button
              onClick={onOpenOpening}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#00eefc]/10 hover:bg-[#00eefc]/20 border border-[#00eefc]/40 text-[#00eefc] text-[10px] sm:text-xs font-medium transition-all shadow-sm active:scale-95 shrink-0"
              title="Açılış Ekranı ve Tanıtım Kartlarını Aç"
            >
              <Sparkles className="w-3 h-3 text-[#00eefc]" />
              <span className="font-sora font-semibold hidden sm:inline">Tanıtım Kartları</span>
              <span className="font-sora font-semibold sm:hidden">Tanıtım</span>
            </button>
          )}

          {/* Tactical Radio Comms Trigger */}
          {onOpenRadio && (
            <button
              onClick={onOpenRadio}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-[10px] sm:text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95 shrink-0 cursor-pointer"
              title="Taktik Telsiz Konsolunu Aç (142.85 MHz / Bas-Konuş)"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-sora font-semibold hidden sm:inline">Telsiz</span>
              <span className="font-mono text-[9px] text-emerald-400/90 hidden md:inline">142.85</span>
            </button>
          )}

          {/* Screen Explorer Trigger */}
          <button
            onClick={onOpenScreenExplorer}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#1a163b] hover:bg-[#231e48] border border-[#ffb703]/40 text-[#ffb703] text-[10px] sm:text-xs font-medium transition-all shadow-sm active:scale-95 shrink-0"
            title="Tüm 17 Ekranı İncele & Dışa Aktar"
          >
            <Layers className="w-3 h-3 text-[#ffb703]" />
            <span className="font-sora font-semibold hidden sm:inline">17 Ekran Gezgini</span>
            <span className="font-sora font-semibold sm:hidden">Gezgin</span>
          </button>

          {/* Epic Success Feedback Test Button */}
          {onTestEpicSuccess && (
            <button
              onClick={onTestEpicSuccess}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#ffb703]/20 hover:bg-[#ffb703]/30 border border-[#ffb703]/60 text-[#ffb703] text-[10px] sm:text-xs font-semibold transition-all shadow-[0_0_12px_rgba(255,183,3,0.3)] active:scale-95 shrink-0"
              title="Epik 'Görev Tamamlandı' Efektini Test Et (Altın Parlama & Ekran Sarsıntısı)"
            >
              <Trophy className="w-3 h-3 text-[#ffb703]" />
              <span className="font-sora font-semibold hidden sm:inline">Zafer Efekti</span>
              <span className="font-sora font-semibold sm:hidden">Zafer</span>
            </button>
          )}

          {/* Rule Evaluation Drawer Trigger */}
          <button
            onClick={onOpenRules}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs transition-colors"
            title="Oyun Kuralları & Çift Yönlü Akış Şeması"
          >
            <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden lg:inline">Kural Özeti</span>
          </button>

          {/* Audio toggle */}
          <button 
            onClick={() => {
              const muted = soundManager.toggleMute();
              setSoundOn(!muted);
            }}
            className="p-1 rounded text-white/50 hover:text-white transition-colors shrink-0 cursor-pointer"
            title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Phase progress ribbon (During in-game or rescue phases) */}
      {(status === 'phase_game' || status === 'phase_energy' || status === 'phase_rescue') && (
        <div className="bg-[#0b081a]/95 px-3 py-1.5 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[0, 1, 2, 3].map((stepIdx) => {
              const isActive = currentPhaseIndex === stepIdx;
              const isPast = currentPhaseIndex > stepIdx;
              return (
                <div 
                  key={stepIdx} 
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono shrink-0 transition-all ${
                    isActive 
                      ? 'bg-[#ffb703]/20 border border-[#ffb703] text-[#ffb703] font-bold shadow-[0_0_8px_rgba(255,183,3,0.3)]' 
                      : isPast 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-white/5 text-white/40 border border-white/5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#ffb703] animate-ping' : isPast ? 'bg-emerald-400' : 'bg-white/20'}`}></span>
                  <span>{getPhaseName(stepIdx)}</span>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#a59db8] font-mono shrink-0 ml-2">
            <span>Aşama {currentPhaseIndex + 1}/4</span>
            <span className="text-[#00f0ff]">• Gerçek Zamanlı Co-op</span>
          </div>
        </div>
      )}
    </header>
  );
};
