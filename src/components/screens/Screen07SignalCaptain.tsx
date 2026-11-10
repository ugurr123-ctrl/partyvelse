import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
}

export const Screen07SignalCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase }) => {
  const { signal } = state;
  const [feedbackText, setFeedbackText] = useState('');

  const handleTransmit = () => {
    setFeedbackText(`DÖNÜŞÜM KURALI MÜHENDİSE AKTARILDI: "${signal.ruleDescription}"`);
    onUpdate((prev) => ({
      ...prev,
      signal: {
        ...prev.signal,
        isLocked: false,
      },
    }));

    setTimeout(() => {
      setFeedbackText('');
    }, 4000);
  };

  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  // Gölge Protokolü Phase 2 (Ajan: Lazer İntikali) state
  const [golgePrismAngle, setGolgePrismAngle] = useState(45);
  const [golgeDashMode, setGolgeDashMode] = useState<'surunme' | 'hamle' | 'atilma'>('hamle');
  const [golgeBarrierProgress, setGolgeBarrierProgress] = useState<number>(2); // 1 = reached barrier 1, 2 = barrier 2, 3 = all clear
  const [golgeNoiseLevel, setGolgeNoiseLevel] = useState<number>(12);

  const rotatePrism = (delta: number) => {
    setGolgePrismAngle(prev => (prev + delta + 360) % 360);
  };

  const handleGolgeLaserTrigger = () => {
    // If prism angle is 45° or 45/225 (diagonal refraction)
    const isAngleAligned = golgePrismAngle === 45 || golgePrismAngle === 225;
    if (isAngleAligned || golgeBarrierProgress >= 2) {
      setGolgeBarrierProgress(3);
      onUpdate((prev) => ({
        ...prev,
        signal: {
          ...prev.signal,
          isLocked: true,
          frequencyMatched: true,
        },
      }));
      setFeedbackText('KORİDOR KUSURSUZ GEÇİLDİ! Optik prizma söküldü, lazer ızgarası kapandı.');
    } else {
      setGolgeNoiseLevel(prev => Math.min(100, prev + 25));
      onUpdate((prev) => ({
        ...prev,
        stealthLevel: Math.max(0, (prev.stealthLevel ?? 100) - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 10),
      }));
      setFeedbackText('LAZER SENSÖRÜ UYARISI! Prizma mandalını 045° açısına getirin.');
    }
  };

  // Gölge Protokolü (Ajan - Lazer İntikali) UI (Lines 1476-1737 of template)
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Top Telemetry HUD */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#0f0c1e] border border-white/5 shadow-md">
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[#1c192c] text-center">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase">AŞAMA</span>
            <span className="font-mono text-[11px] text-[#ffb703] font-bold">02 / 04</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[#1c192c] text-center">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase">SESSİZLİK</span>
            <div className="flex items-center gap-0.5 text-[#00eefc] font-bold">
              <span className="material-symbols-outlined text-[13px]">mic_off</span>
              <span className="font-mono text-[11px]">%{state.stealthLevel ?? 98}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[#1c192c] text-center">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase">SÜRE</span>
            <span className="font-mono text-[11px] text-[#ffb4ab] font-bold tracking-tight">
              {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-[#1c192c] text-center">
            <span className="font-mono text-[9px] text-[#9e8f78] uppercase">KANAL</span>
            <div className="flex items-center gap-1 text-[#00eefc]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              <span className="font-mono text-[10px] font-bold">CH-01</span>
            </div>
          </div>
        </div>

        {/* Mission Header Banner */}
        <div className="flex flex-col gap-1 rounded-xl p-3.5 bg-[#201d30] border border-white/5 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#363246] text-[#00eefc] font-mono text-[9px] uppercase font-bold">
              <span className="material-symbols-outlined text-[12px]">security</span>
              ROL: SAHADAKİ AJAN // İNTİKAL
            </span>
            <span className="flex items-center gap-1 text-[#ffb4ab] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#93000a]/30">
              <span className="material-symbols-outlined text-[12px]">warning</span> LAZER AKTİF
            </span>
          </div>
          <h2 className="font-sora text-sm text-white font-bold tracking-tight uppercase mt-0.5">
            KORİDORDAN GEÇ & PRİZMAYI SESSİZCE SÖK
          </h2>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Hackerın telsizden saydığı saniye aralıklarında adımlarını at, lazer sensörlerine değmeden optik prizmayı al.
          </p>
        </div>

        {/* Optical Laser Corridor Visual Card */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-xl bg-[#0f0c1e] flex items-center justify-center border border-white/5">
          <img 
            className="w-full h-full object-cover opacity-60" 
            alt="Lazer Koridoru" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRRpj5KP0GDoTkLrLcBLaHphhuJPJaTnItESb-AOI3gX8idfITOA7xcYiB3D9F8mbTCzRz1kbmdFoMxR6qUnimvwCCn_D4XefRk_xK4U5qFtdZCf2grWmR81oYIOGCFB0N8OyHgVBpELLDGiidPtztmnwVzgDi2Jaehbe2JNgHfJktb2hkOPESGX9TLyk92vn1KEirjqwhxInmvI2rFHdBsig22VQpdaE92RoCICM"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-transparent to-[#0f0c1e]/60"></div>
          {/* Top Telemetry Inside Viewfinder */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0f0c1e]/90 backdrop-blur-md border border-white/5">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[13px]">sensors</span>
              <span className="font-mono text-[9px] text-[#ffb4ab] uppercase">SENSÖR: AKTİF</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0f0c1e]/90 backdrop-blur-md border border-white/5">
              <span className="material-symbols-outlined text-[#00eefc] text-[13px]">hearing</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase font-bold">HACKER DİNLENİYOR</span>
            </div>
          </div>
          {/* Safe Step Crosshair Reticle */}
          <div className="absolute bottom-3 flex flex-col items-center">
            <div className="px-2.5 py-0.5 rounded-full bg-[#00eefc]/20 text-[#00eefc] backdrop-blur-md flex items-center gap-1 shadow-lg mb-0.5 animate-bounce">
              <span className="material-symbols-outlined text-[13px]">center_focus_strong</span>
              <span className="font-mono text-[9px] uppercase font-bold">GÜVENLİ BASAMAK HİZALANDI</span>
            </div>
            <div className="w-16 h-2 rounded-full bg-[#00eefc]/30 blur-sm"></div>
          </div>
        </div>

        {/* Live Radio Telemetry (Hacker) */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#2b273b] border border-white/5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg bg-[#0f0c1e] flex items-center justify-center border border-[#00eefc]/20">
                <span className="material-symbols-outlined text-[#00eefc] text-[18px]">headset_mic</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#00eefc] font-bold uppercase">
                  {state.engineerName || 'HACKER MERT'} // CH-01
                </span>
                <span className="font-mono text-[9px] text-[#9e8f78]">KRİPTO TELSİZ BAĞLANTISI</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0f0c1e] text-[#00eefc] font-mono text-[9px]">
              <span className="w-1 h-3 bg-[#00eefc] rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-[#00eefc] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 h-2 bg-[#00eefc] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
          {/* Live Dialogue Box */}
          <div className="p-2.5 rounded-lg bg-[#0f0c1e] flex items-start gap-2 border border-white/5">
            <span className="material-symbols-outlined text-[#ffb703] text-[16px] shrink-0 mt-0.5">graphic_eq</span>
            <p className="font-manrope text-xs text-white font-medium leading-relaxed">
              “Bekle... Kırmızı ışın sönecek... 3.. 2.. 1.. <span className="text-[#ffb703] uppercase font-bold tracking-wide">ŞİMDİ SAĞA ADIM AT!</span>”
            </p>
          </div>
        </div>

        {/* Silent Step Meter (Noise Gauge) */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffba27] text-[15px]">volume_down</span>
              SESSİZ ADIM METRESİ (GÜRÜLTÜ)
            </span>
            <span className="font-mono text-[10px] text-[#ffba27] font-bold">%{golgeNoiseLevel} / EŞİK: %50</span>
          </div>
          {/* Meter Track */}
          <div className="w-full h-2.5 rounded-full bg-[#0f0c1e] overflow-hidden flex items-center p-0.5">
            <div 
              className="h-full rounded-full bg-[#00eefc] transition-all duration-300" 
              style={{ width: `${golgeNoiseLevel}%` }}
            ></div>
            <div className="h-full bg-[#93000a] w-1 ml-auto mr-[50%]"></div>
          </div>
          <div className="flex justify-between items-center text-[#9e8f78] font-mono text-[9px]">
            <span>TAM SESSİZLİK</span>
            <span className="text-[#ffb4ab] font-bold">ALARM EŞİĞİ</span>
          </div>
        </div>

        {/* Stride Progress (3 Bariyer) */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
          <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider font-bold">
            İNTİKAL İLERLEMESİ (3 BARİYER)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Bariyer 1 */}
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-[#2b273b] border border-[#00eefc]/30">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#00eefc] font-bold">01</span>
                <span className="material-symbols-outlined text-[#00eefc] text-[14px]">check_circle</span>
              </div>
              <span className="font-sora text-xs text-white font-semibold truncate">Bariyer 1</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase">Aşıldı</span>
            </div>
            {/* Bariyer 2 */}
            <div className={`flex flex-col gap-1 p-2 rounded-lg border ${
              golgeBarrierProgress >= 3
                ? 'bg-[#2b273b] border-[#00eefc]/30 text-[#00eefc]'
                : 'bg-[#2b273b] border-[#ffb703]/50 shadow-[0_0_10px_rgba(255,183,3,0.15)]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#ffba27] font-bold">02</span>
                <span className="material-symbols-outlined text-[#ffba27] text-[14px] animate-pulse">radio_button_checked</span>
              </div>
              <span className="font-sora text-xs text-white font-semibold truncate">Bariyer 2</span>
              <span className="font-mono text-[9px] text-[#ffba27] uppercase font-bold">
                {golgeBarrierProgress >= 3 ? 'Aşıldı' : 'Önünde'}
              </span>
            </div>
            {/* Bariyer 3 */}
            <div className={`flex flex-col gap-1 p-2 rounded-lg border ${
              golgeBarrierProgress >= 3
                ? 'bg-[#2b273b] border-emerald-500/50 text-emerald-300'
                : 'bg-[#1c192c] border-white/5 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold">03</span>
                <span className="material-symbols-outlined text-[14px]">
                  {golgeBarrierProgress >= 3 ? 'check_circle' : 'lock'}
                </span>
              </div>
              <span className="font-sora text-xs text-white font-semibold truncate">Bariyer 3</span>
              <span className="font-mono text-[9px] uppercase">
                {golgeBarrierProgress >= 3 ? 'Aşıldı' : 'Kilitli'}
              </span>
            </div>
          </div>
        </div>

        {/* Dash Speed Selector */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
          <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider font-bold">
            İNTİKAL MODU / HIZ SEÇİMİ
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button"
              onClick={() => setGolgeDashMode('surunme')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                golgeDashMode === 'surunme'
                  ? 'bg-[#ffb703] text-[#271900] border-[#ffb703] font-bold shadow-md'
                  : 'bg-[#2b273b] text-[#d5c4ac] border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">directions_walk</span>
              <span className="font-mono text-[10px] font-bold mt-0.5">Sürünme</span>
              <span className="font-mono text-[8px] opacity-80">Sessiz</span>
            </button>
            <button 
              type="button"
              onClick={() => setGolgeDashMode('hamle')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                golgeDashMode === 'hamle'
                  ? 'bg-[#ffb703] text-[#271900] border-[#ffb703] font-bold shadow-md'
                  : 'bg-[#2b273b] text-[#d5c4ac] border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span className="font-mono text-[10px] font-bold mt-0.5">Hızlı Hamle</span>
              <span className="font-mono text-[8px] opacity-80">0.8 sn</span>
            </button>
            <button 
              type="button"
              onClick={() => setGolgeDashMode('atilma')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                golgeDashMode === 'atilma'
                  ? 'bg-[#ffb703] text-[#271900] border-[#ffb703] font-bold shadow-md'
                  : 'bg-[#2b273b] text-[#d5c4ac] border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">sprint</span>
              <span className="font-mono text-[10px] font-bold mt-0.5">Atılma</span>
              <span className="font-mono text-[8px] opacity-80">Kritik</span>
            </button>
          </div>
        </div>

        {/* Mirror Prism Decoupler (Optik Prizma Mandalı) */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#2b273b] border border-white/5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#00eefc] font-bold uppercase">OPTİK PRİZMA MANDALI</span>
              <span className="font-manrope text-[11px] text-[#d5c4ac]">Titreşimsiz saat yönünde çevirerek gevşet</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0f0c1e] text-[#00eefc] border border-white/5">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span className="font-mono text-[10px] font-bold">{String(golgePrismAngle).padStart(3, '0')}°</span>
            </div>
          </div>
          {/* Tactile Dial Interaction Area */}
          <div className="flex items-center justify-around py-1">
            <button 
              type="button"
              onClick={() => rotatePrism(-15)}
              className="w-11 h-11 rounded-xl bg-[#0f0c1e] text-white hover:text-[#00eefc] flex items-center justify-center transition-all active:scale-90 border border-white/5"
            >
              <span className="material-symbols-outlined text-[22px]">rotate_left</span>
            </button>
            <div className="relative w-20 h-20 rounded-full bg-[#0f0c1e] flex items-center justify-center shadow-inner border border-white/5">
              <div className="absolute inset-1 rounded-full border-dashed border-2 border-white/20 pointer-events-none"></div>
              <div 
                className="w-14 h-14 rounded-full bg-[#201d30] flex flex-col items-center justify-center shadow-lg transition-transform duration-200 border border-[#00eefc]/40"
                style={{ transform: `rotate(${golgePrismAngle}deg)` }}
              >
                <span className="material-symbols-outlined text-[#ffb703] text-[22px]">diamond</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00eefc] mt-0.5"></div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => rotatePrism(15)}
              className="w-11 h-11 rounded-xl bg-[#0f0c1e] text-white hover:text-[#00eefc] flex items-center justify-center transition-all active:scale-90 border border-white/5"
            >
              <span className="material-symbols-outlined text-[22px]">rotate_right</span>
            </button>
          </div>
          <div className="flex justify-between items-center px-1 font-mono text-[9px] text-[#9e8f78]">
            <span>TİTREŞİM: %0 (İDEAL)</span>
            <span className="text-[#00eefc] font-bold">KİLİT HİZASI: HAZIR</span>
          </div>
        </div>

        {/* Feedback message */}
        {feedbackText && (
          <div className="p-3 rounded-xl bg-[#0f0c1e] border border-[#ffb703]/40 text-[#ffdba0] text-xs font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ffb703]">info</span>
            <span>{feedbackText}</span>
          </div>
        )}

        {/* Bottom Action Button */}
        <div className="pt-1 flex flex-col gap-1.5">
          {state.signal.frequencyMatched ? (
            <button
              onClick={() => onAdvancePhase({ roundId: state.currentRoundId || 'round1', expectedPhaseIndex: 1 })}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-sora text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] active:translate-y-1 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
              <span>FAZ 02 TAMAMLANDI // AŞAMA 3'E İLERLE</span>
            </button>
          ) : (
            <button
              onClick={handleGolgeLaserTrigger}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] text-[#271900] font-sora text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_0_#6b4b00,0_8px_16px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer select-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">play_arrow</span>
              <span>HAMLEYİ YAP & PRİZMAYI ETKİSİZ KIL</span>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          )}
          <span className="text-center font-mono text-[9px] text-[#9e8f78] uppercase">
            KRİTİK HAMLE: HACKERIN GERİ SAYIMINA ODAKLAN
          </span>
        </div>
      </div>
    );
  }

  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* HUD Mini Telemetry Strip */}
        <section className="pt-1">
          <div className="bg-[#0f0c1e]/90 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-white/5">
            <div className="flex items-center justify-between text-[#00eefc]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">explore</span>
                <span className="font-mono text-[9px] uppercase">GÖREV 04</span>
              </div>
              <div className="flex items-center gap-1 text-[#ffba27]">
                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                <span className="font-mono text-[10px] font-bold">-990M</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <span className="material-symbols-outlined text-[13px] text-[#ffb703]">timer</span>
                <span className="font-mono text-[11px] text-[#ffdba0] font-bold">
                  {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#00eefc]">
                <span className="material-symbols-outlined text-[13px]">shield</span>
                <span className="font-mono text-[10px] font-bold">%{state.hullIntegrity}</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#00eefc]/10 text-[#00eefc]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
                <span className="font-mono text-[8px]">CH-02</span>
              </div>
            </div>
            <div className="w-full bg-[#2b273b] rounded-full h-1 mt-1.5 overflow-hidden flex">
              <div className="bg-[#00eefc] h-full rounded-full transition-all duration-500" style={{ width: `${state.hullIntegrity}%` }}></div>
            </div>
          </div>
        </section>

        {/* Role Indicator & Briefing Header */}
        <section className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffb703]/15 text-[#ffba27] border border-[#ffb703]/30">
              <span className="material-symbols-outlined text-[13px]">fitbit_push_ups</span>
              <span className="font-mono text-[9px] tracking-wider uppercase font-bold">ROL: DÜMENCİ (KILAVUZ)</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#93000a]/20 text-[#ffb4ab] font-mono text-[9px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse"></span>
              <span>KRİTİK BASINÇ</span>
            </div>
          </div>
          <h2 className="font-sora text-xl text-white font-bold tracking-tight">Sualtı Tehdidini Kilitle</h2>
          <p className="text-xs text-[#d5c4ac] leading-relaxed">
            Yüksek frekanslı sonar haritasındaki abisal manyetik mayın koordinatlarını süz ve doğru deşarj frekansını makiniste telsizle bildir.
          </p>
        </section>

        {/* 360 Tactical Sonar Grid */}
        <section>
          <div className="bg-[#1c192c] rounded-xl p-2.5 relative overflow-hidden shadow-xl border border-white/5">
            <div className="flex items-center justify-between relative z-10 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[15px]">radar</span>
                <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">360° AKTİF SONAR TARAMA</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#201d30] text-[#ffdba0] font-mono text-[8px] font-bold">
                <span className="material-symbols-outlined text-[12px] text-[#ffba27]">gps_fixed</span>
                <span>HEDEF: M-02 (120M)</span>
              </div>
            </div>

            <div className="relative w-full aspect-square max-h-[260px] mx-auto rounded-full bg-[#0f0c1e] flex items-center justify-center overflow-hidden border border-white/5">
              <div className="absolute w-[86%] h-[86%] rounded-full shadow-[0_0_0_1px_rgba(0,238,252,0.12)]"></div>
              <div className="absolute w-[62%] h-[62%] rounded-full shadow-[0_0_0_1px_rgba(0,238,252,0.18)]"></div>
              <div className="absolute w-[36%] h-[36%] rounded-full shadow-[0_0_0_1px_rgba(0,238,252,0.25)]"></div>
              <div className="absolute w-full h-[1px] bg-[#00eefc]/10"></div>
              <div className="absolute h-full w-[1px] bg-[#00eefc]/10"></div>

              {/* Sweeping Cone */}
              <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] origin-center pointer-events-none opacity-30" style={{ background: 'conic-gradient(from 0deg, rgba(0,238,252,0.3) 0deg, rgba(0,238,252,0) 65deg)' }}></div>

              {/* Target M-02 Locked */}
              <div className="absolute top-[32%] right-[26%] flex flex-col items-center z-20">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-[#93000a]/30 animate-ping"></div>
                  <div className="w-6 h-6 rounded-full bg-[#ffb4ab]/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,180,171,0.8)]">
                    <span className="material-symbols-outlined text-[14px] text-[#ffb4ab] font-bold">crisis_alert</span>
                  </div>
                </div>
                <div className="mt-0.5 px-1.5 py-0.5 rounded bg-[#2b273b]/90 text-center border border-[#ffb4ab]/30">
                  <div className="font-mono text-[8px] text-[#ffb4ab] uppercase font-bold">M-02 [KİLİTLİ]</div>
                  <div className="font-mono text-[7px] text-[#ffba27]">120m • -14° AÇI</div>
                </div>
              </div>

              {/* Central Submarine Icon */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-[#ffb703] flex items-center justify-center text-[#271900] shadow-[0_0_12px_rgba(255,183,3,0.7)]">
                <span className="material-symbols-outlined text-[18px]">directions_boat</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sonar Frequency Analysis Banner */}
        <section>
          <div className="bg-[#201d30] rounded-xl p-2.5 shadow-md border border-white/5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00eefc]/15 flex items-center justify-center text-[#00eefc] shrink-0">
              <span className="material-symbols-outlined text-[18px] animate-pulse">graphic_eq</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">SONAR FREKANS ANALİZ ŞERİDİ</div>
              <div className="text-xs text-white truncate">Darbe Yankısı: <span className="text-[#ffba27] font-bold">Manyetik Kovan-2 Eşleşiyor</span></div>
            </div>
          </div>
        </section>

        {/* Secret Countermeasure Guide (PILOT ONLY) */}
        <section>
          <div className="bg-[#201d30] rounded-xl p-3 shadow-xl border border-[#ffb703]/20 relative overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-[#ffba27]">
                <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                <span className="font-mono text-[9px] tracking-wider uppercase font-bold">GİZLİ KARŞI TEDBİR KILAVUZU</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-[#93000a]/40 text-[#ffb4ab] font-mono text-[8px] font-bold uppercase">
                MAKİNİST GÖREMEZ!
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#141123] rounded-lg p-2 flex flex-col justify-between">
                <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">HEDEF KOVAN</span>
                <span className="font-sora text-sm text-[#ffba27] font-bold mt-1">KVN-2</span>
                <span className="font-mono text-[7px] text-[#00eefc]">Torpido Yuvası</span>
              </div>
              <div className="bg-[#141123] rounded-lg p-2 flex flex-col justify-between">
                <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">FREKANS</span>
                <span className="font-sora text-sm text-[#00eefc] font-bold mt-1">433.8</span>
                <span className="font-mono text-[7px] text-[#ffba27]">MHz Deşarj</span>
              </div>
              <div className="bg-[#141123] rounded-lg p-2 flex flex-col justify-between">
                <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">PÜSKÜRTME</span>
                <span className="font-sora text-sm text-white font-bold mt-1">+14°</span>
                <span className="font-mono text-[7px] text-[#00eefc]">Elevasyon</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Trigger */}
        <section className="pt-1 flex flex-col gap-2">
          <button
            onClick={handleTransmit}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-xs uppercase tracking-wider shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">send_to_mobile</span>
            <span>FIRLATMA VERİLERİNİ MAKİNİSTE AKTAR</span>
          </button>

          {feedbackText && (
            <div className="text-center font-mono text-[10px] text-[#00eefc] font-bold animate-fadeIn">
              {feedbackText}
            </div>
          )}

          {signal.isSolved && (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>TORPİDO ATEŞLENDİ • DEVAM ET</span>
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Narrative & Mission Directive */}
      <div className="pt-1 pb-3 flex flex-col text-center items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/30 mb-2">
          <span className="material-symbols-outlined text-[15px]">military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // SEMBOL VE KURAL ANAHTARI</span>
        </div>
        <h2 className="font-sora text-2xl font-bold text-white tracking-tight">
          Sinyali <span className="text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">çözümle</span>
        </h2>
        <p className="text-xs text-[#d5c4ac] max-w-[320px] mt-1">
          Gelen sembolleri kuralına göre dönüştür, ortaya çıkan 4 haneli kodu telsizden mühendisine oku!
        </p>
      </div>

      {/* Holographic Observation Terminal Hero */}
      <div className="mb-3">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#0f0c1e] border border-white/10">
          <div 
            className="bg-cover bg-center w-full h-[260px] relative" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDI2W-31llkaN9ktmfQRsTPpmzITOhsQqcuW3sNrE7tLpejdNe6nRPNX7EcDHd9qsGO61j9QbD7_bqF6d4V9iSpUygB0Au-2R0zZSEmNt_2wtI5RJ7w_MLl7MzOLBKl7dSRjPDvT-ezdjqeSXEhkXIl1ISGSIB29OVB68cbEPNGrPpMuH8Y76uEf2mI-cxc6MB9yM1TCfGm4tYeipLMtZGMrqkOJ5PBeS5yhhznL5I')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#141123]/60 to-[#141123]/40"></div>
            
            {/* Floating Holographic Data Surface */}
            <div className="absolute inset-2.5 rounded-xl bg-[#0f0c1e]/85 backdrop-blur-md p-3 flex flex-col justify-between shadow-2xl border border-white/10">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]"></span>
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-wider uppercase font-bold">HAM DİZİ GLİFLERİ</span>
                </div>
                <span className="font-mono text-[9px] text-[#ffdba0] tracking-widest uppercase font-bold">KAYIP SİNYAL</span>
              </div>

              {/* 4 Dynamic Symbol Slots Display */}
              <div className="my-auto py-1 grid grid-cols-4 gap-2">
                {signal.symbols.map((glyph, idx) => (
                  <div key={idx} className="aspect-square rounded-xl bg-[#201d30] border border-white/5 flex flex-col items-center justify-center p-1 shadow-inner">
                    <span className="text-2xl font-bold text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.5)]">
                      {glyph}
                    </span>
                    <span className="font-mono text-[10px] text-[#00eefc] mt-0.5 font-bold">
                      ={signal.symbolMap[glyph]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Waveform Visual */}
              <div className="pt-1 pb-1">
                <div className="h-6 w-full flex items-center justify-between gap-[2px] px-1 opacity-90">
                  {[3, 5, 8, 6, 4, 9, 7, 4, 6, 8, 6, 3, 7, 9, 5, 3, 8, 6, 4, 7, 5].map((val, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-[#ffb703]' : 'bg-[#00eefc]'}`}
                      style={{ height: `${val * 2.2}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between font-mono text-[9px] text-[#d5c4ac]">
                <span className="text-[#00eefc]">KOD PROTOKOLÜ: AKTİF</span>
                <span className="text-[#ffb703] font-bold">MÜHENDİSE OKU</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Cipher Rule Plaque */}
      <div className="mb-3">
        <div className="bg-[#2b273b] rounded-2xl p-3.5 shadow-lg flex flex-col gap-2 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ffdba0]">vpn_key</span>
              <span className="font-sora text-xs font-bold text-[#ffdba0]">Dönüşüm Kuralı (Yalnızca Sende)</span>
            </div>
            <span className="text-[9px] font-mono uppercase text-[#00eefc] font-bold">KAPTAN ŞİFRESİ</span>
          </div>

          <div className="bg-[#201d30] p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
            <span className="text-xs text-white font-semibold leading-relaxed">
              {signal.ruleDescription}
            </span>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 font-mono text-xs">
              <span className="text-[#d5c4ac]">Çözümlenmiş Kod:</span>
              <span className="text-[#ffb703] font-extrabold text-sm tracking-widest bg-[#ffb703]/10 px-2 py-0.5 rounded border border-[#ffb703]/30">
                {signal.computedCode}
              </span>
            </div>
          </div>

          <div className="bg-[#201d30]/70 rounded-xl px-3 py-2 flex items-center gap-2 border border-white/5">
            <span className="material-symbols-outlined text-[17px] text-[#ffdba0] shrink-0">info</span>
            <p className="text-[11px] text-[#d5c4ac] leading-relaxed">
              Mühendisin frekans tablosunda bu kodun ({signal.computedCode}) karşılık geldiği frekansı bulup kilitlemesi gerekiyor!
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Trigger */}
      <div className="mt-1 flex flex-col gap-2">
        <button
          onClick={handleTransmit}
          className="w-full h-14 rounded-2xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.4)] active:translate-y-1 transition-all cursor-pointer uppercase tracking-tight"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          <span>Kuralı Mühendise Telsizle</span>
        </button>

        {feedbackText && (
          <div className="text-center font-mono text-[10px] text-[#ffba27] font-bold animate-fadeIn">
            {feedbackText}
          </div>
        )}

        {signal.isSolved && (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>FREKANS KİLİTLENDİ • DEVAM ET</span>
          </button>
        )}
      </div>

    </div>
  );
};
