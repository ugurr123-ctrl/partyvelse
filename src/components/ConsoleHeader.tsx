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
  Sparkles
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
  onToggleDisconnect: () => void;
  onSwitchRole: () => void;
  onOpenRules: () => void;
  onOpenScreenExplorer: () => void;
}

export const ConsoleHeader: React.FC<Props> = ({
  roomCode,
  myRole,
  timeLeft,
  hullIntegrity,
  currentPhaseIndex,
  status,
  selectedMiniGames,
  isDisconnected,
  onToggleDisconnect,
  onSwitchRole,
  onOpenRules,
  onOpenScreenExplorer,
}) => {
  const [soundOn, setSoundOn] = React.useState(true);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseName = (idx: number) => {
    if (idx === 0) {
      return selectedMiniGames[0] === 'ariza_teshisi' ? '1. Arıza Teşhisi' :
             selectedMiniGames[0] === 'sinyal_cozumu' ? '1. Sinyal Çözümü' :
             selectedMiniGames[0] === 'kablo_baglantisi' ? '1. Kablo Bağlantısı' :
             selectedMiniGames[0] === 'hava_kilidi' ? '1. Hava Kilidi' : '1. Radar';
    }
    if (idx === 1) {
      return selectedMiniGames[1] === 'ariza_teshisi' ? '2. Arıza Teşhisi' :
             selectedMiniGames[1] === 'sinyal_cozumu' ? '2. Sinyal Çözümü' :
             selectedMiniGames[1] === 'kablo_baglantisi' ? '2. Kablo Bağlantısı' :
             selectedMiniGames[1] === 'hava_kilidi' ? '2. Hava Kilidi' : '2. Radar';
    }
    if (idx === 2) return '3. Enerji Dağıtımı';
    return '4. Kurtarma Kararı';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#120f2d]/90 backdrop-blur-md border-b border-white/10 shadow-lg text-[#e6dff9]">
      {/* Top telemetry bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Brand & Room Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ffb703] rotate-45 shadow-[0_0_8px_#ffb703]"></span>
            <span className="font-extrabold text-[#ffb703] tracking-widest font-sora text-sm">PARTYVERSE</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1 bg-[#1a163b] px-2 py-0.5 rounded-md border border-white/10">
            <span className="text-[10px] text-[#9e8f78] uppercase font-mono">ODA:</span>
            <span className="font-mono font-bold text-[#00f0ff]">{roomCode}</span>
          </div>

          {/* Role badge */}
          <button
            onClick={onSwitchRole}
            title="Rolü Değiştir (Kaptan ⇄ Mühendis)"
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold transition-all shadow-sm ${
              myRole === 'kaptan' 
                ? 'bg-amber-500/20 text-[#ffb703] border border-[#ffb703]/40 hover:bg-amber-500/30' 
                : 'bg-cyan-500/20 text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-cyan-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
            <span className="uppercase tracking-wider font-sora">
              {myRole === 'kaptan' ? 'KAPTAN' : 'MÜHENDİS'}
            </span>
            <ArrowRightLeft className="w-3 h-3 ml-0.5 opacity-70" />
          </button>
        </div>

        {/* Global Live Indicators (Timer, Hull Health, Phase) */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          
          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 bg-[#0b081a] px-2.5 py-1 rounded-md border border-white/10 font-mono text-xs">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-[#ffb703]'}`} />
            <span className={`font-bold ${timeLeft < 60 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Hull Integrity Bar */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0b081a] px-2.5 py-1 rounded-md border border-white/10">
            <ShieldAlert className={`w-3.5 h-3.5 ${hullIntegrity < 40 ? 'text-rose-400 animate-bounce' : 'text-[#00f0ff]'}`} />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono leading-none">
                <span className="text-[#9e8f78]">BÜTÜNLÜK</span>
                <span className={`font-bold ${hullIntegrity < 40 ? 'text-rose-400' : 'text-[#00f0ff]'}`}>
                  %{hullIntegrity}
                </span>
              </div>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
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
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-colors border ${
              isDisconnected 
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50' 
                : 'bg-white/5 text-[#9e8f78] border-white/10 hover:text-white'
            }`}
            title="Bağlantı Kesintisini Test Et (Süreyi durdurur, kontrolleri kilitler)"
          >
            {isDisconnected ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline">{isDisconnected ? 'Bağlantı Koptu' : 'Canlı Bağlantı'}</span>
          </button>

          {/* Screen Explorer Trigger */}
          <button
            onClick={onOpenScreenExplorer}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1a163b] hover:bg-[#231e48] border border-[#ffb703]/40 text-[#ffb703] text-xs font-medium transition-all shadow-sm active:scale-95"
            title="Tüm 17 Ekranı İncele & Dışa Aktar"
          >
            <Layers className="w-3.5 h-3.5 text-[#ffb703]" />
            <span className="font-sora font-semibold">17 Ekran Gezgini</span>
          </button>

          {/* Rule Evaluation Drawer Trigger */}
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs transition-colors"
            title="Oyun Kuralları & Çift Yönlü Akış Şeması"
          >
            <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden lg:inline">Kural Özeti</span>
          </button>

          {/* Audio toggle */}
          <button 
            onClick={() => setSoundOn(!soundOn)}
            className="p-1 rounded text-white/50 hover:text-white transition-colors"
            title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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
