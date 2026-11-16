import React from 'react';
import { 
  Role, 
  GameStatus, 
  MiniGameType,
  OperationTheme
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
  isOnline?: boolean;
  operationTheme?: OperationTheme;
  targetPlayerCount?: 2 | 3 | 4;
  onToggleDisconnect: () => void;
  onSwitchRole: () => void;
  onOpenRules: () => void;
  onOpenScreenExplorer: () => void;
  onOpenOpening?: () => void;
  onTestEpicSuccess?: () => void;
  onOpenRadio?: () => void;
}

import { soundManager } from '../services/soundEffects';
import { isTeamOperationTheme, getTeamOperationMeta } from '../services/omegaGameEngine';

export const ConsoleHeader: React.FC<Props> = ({
  roomCode,
  myRole,
  timeLeft,
  hullIntegrity,
  currentPhaseIndex,
  status,
  selectedMiniGames,
  isDisconnected,
  isOnline = false,
  operationTheme = 'kayip_sinyal',
  targetPlayerCount = 2,
  onToggleDisconnect,
  onSwitchRole,
  onOpenRules,
  onOpenScreenExplorer,
  onOpenOpening,
  onTestEpicSuccess,
  onOpenRadio,
}) => {
  const canNavigateToOpening =
    Boolean(onOpenOpening) &&
    (!isOnline || status === 'opening' || status === 'entry' || status === 'lobby');
  const isTeamOp = isTeamOperationTheme(operationTheme);
  const teamMeta = getTeamOperationMeta(operationTheme);
  const isKarantina = operationTheme === 'karantina_2088';
  const isDerinBasinc = operationTheme === 'derin_basinc';
  const isGolgeProtokolu = operationTheme === 'golge_protokolu';
  const selectedGameName = isTeamOp ? `${teamMeta.shortTitle} (${targetPlayerCount === 3 ? 3 : 4}P)` :
                           isKarantina ? 'Karantina 2088' :
                           isDerinBasinc ? 'Derin Basınç' :
                           isGolgeProtokolu ? 'Gölge Protokolü' : 'Kayıp Sinyal';
  const [soundOn, setSoundOn] = React.useState(!soundManager.isMuted());

  React.useEffect(() => {
    return soundManager.subscribeMute((muted) => setSoundOn(!muted));
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseName = (idx: number) => {
    if (isTeamOp) {
      return teamMeta.stageTitles[idx] || `${idx + 1}. Aşama`;
    }
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

  const totalPhasesCount = isTeamOp ? 5 : 4;
  const phaseSteps = isTeamOp ? [0, 1, 2, 3, 4] : [0, 1, 2, 3];
  const teamIcon =
    operationTheme === 'titan_maden' ? '⛏️' :
    operationTheme === 'siber_kale' ? '🛡️' :
    operationTheme === 'buzul_ussu' ? '❄️' : '🛰️';

  const inMission = status === 'phase_game' || status === 'phase_energy' || status === 'phase_rescue';

  return (
    <header className="shrink-0 z-40 w-full overflow-hidden bg-[#120f2d]/90 backdrop-blur-md border-b border-white/10 shadow-lg text-[#e6dff9]">
      {/* Top telemetry bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2 text-xs">
        
        {/* Brand & Room Info */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          <button 
            onClick={canNavigateToOpening ? onOpenOpening : undefined}
            disabled={!canNavigateToOpening}
            title={canNavigateToOpening ? 'Açılış Ekranı ve Tanıtım Kartlarına Dön' : 'Aktif görev sırasında açılışa dönülemez'}
            className={`flex items-center gap-1.5 shrink-0 transition-opacity group text-left ${
              canNavigateToOpening ? 'hover:opacity-90 cursor-pointer' : 'cursor-default'
            }`}
          >
            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm rotate-45 shadow-[0_0_8px] transition-transform group-hover:scale-125 ${
              isTeamOp ? 'bg-emerald-400 text-emerald-400' :
              isKarantina ? 'bg-[#ffb703] text-[#ffb703]' :
              isGolgeProtokolu ? 'bg-[#00eefc] text-[#00eefc]' :
              isDerinBasinc ? 'bg-[#00f0ff] text-[#00f0ff]' : 'bg-[#ffb703] text-[#ffb703]'
            }`}></span>
            
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#ffb703] tracking-wider font-sora text-xs sm:text-sm shrink-0">
                VOKZA
              </span>
            </div>
          </button>
          {inMission && (
          <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold transition-all shadow-sm shrink-0 ${
              myRole === 'kaptan'
                ? 'bg-amber-500/20 text-[#ffb703] border border-[#ffb703]/40 hover:bg-amber-500/30'
                : myRole === 'kriptolog'
                ? 'bg-purple-500/20 text-[#dab5ff] border border-purple-400/40 hover:bg-purple-500/30'
                : myRole === 'guvenlik'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-cyan-500/20 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-cyan-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
            <span className="uppercase tracking-wider font-sora">
              {myRole === 'kriptolog'
                ? 'KRİPTOLOG'
                : myRole === 'guvenlik'
                ? 'GÜVENLİK'
                : myRole === 'kaptan'
                ? (isTeamOp ? 'KOMUTAN' : isKarantina ? 'BAŞ BİYOLOG' : isGolgeProtokolu ? 'AJAN' : (isDerinBasinc ? 'DÜMENCİ' : 'KAPTAN'))
                : (isKarantina ? 'GÜVENLİK ŞEFİ' : isGolgeProtokolu ? 'HACKER' : (isDerinBasinc ? 'MAKİNİST' : 'MÜHENDİS'))}
            </span>
          </div>
          )}
        </div>

        {/* Global Live Indicators (Timer, Hull Health, Phase) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          
          {inMission && (<>
          {/* Time Remaining */}
          <div className="flex items-center gap-1 bg-[#0b081a] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border border-white/10 font-mono text-[11px] sm:text-xs shrink-0">
            <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-[#ffb703]'}`} />
            <span className={`font-bold tabular-nums ${timeLeft < 60 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Hull Integrity Bar */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#0b081a] px-2.5 py-1 rounded-md border border-white/10">
            <ShieldAlert className={`w-3.5 h-3.5 ${hullIntegrity < 40 ? 'text-rose-400 animate-bounce' : 'text-[#00f0ff]'}`} />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                <span className="hidden sm:inline text-[#9e8f78] mr-1">BÜTÜNLÜK</span>
                <span className={`font-bold tabular-nums ${hullIntegrity < 40 ? 'text-rose-400' : 'text-[#00f0ff]'}`}>
                  %{hullIntegrity}
                </span>
              </div>
              <div className="hidden sm:block w-16 lg:w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
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

          </>)}
          {/* Tactical Radio Comms Trigger */}
          {inMission && onOpenRadio && (
            <button
              onClick={onOpenRadio}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 text-[10px] sm:text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95 shrink-0 cursor-pointer"
              title="Taktik Telsiz Konsolunu Aç (142.85 MHz / Bas-Konuş)"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-sora font-semibold hidden sm:inline">Telsiz</span>
              
            </button>
          )}

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
            {phaseSteps.map((stepIdx) => {
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

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#a59db8] font-mono shrink-0 ml-2 tabular-nums">
            <span>Aşama {Math.min(totalPhasesCount, currentPhaseIndex + 1)}/{totalPhasesCount}</span>
          </div>
        </div>
      )}
    </header>
  );
};
