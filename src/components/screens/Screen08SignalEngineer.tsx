import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen08SignalEngineer: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const { signal } = state;
  const [currentFreq, setCurrentFreq] = useState(
    parseFloat(signal.engineerTunedFreq.replace(' MHz', '')) || 140.5
  );
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: signal.isSolved ? 'success' : 'idle',
    msg: signal.isSolved ? `FREKANS KİLİTLENDİ (${signal.engineerTunedFreq}) • SİNYAL YAKALANDI` : '',
  });

  const handleStepDown = () => {
    if (signal.isSolved) return;
    setCurrentFreq((prev) => Math.max(140.0, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleStepUp = () => {
    if (signal.isSolved) return;
    setCurrentFreq((prev) => Math.min(145.0, Math.round((prev + 0.1) * 10) / 10));
  };

  const formattedFreq = currentFreq.toFixed(1);

  const handleLockFrequency = () => {
    if (signal.isSolved) return;

    const tunedString = `${formattedFreq} MHz`;

    if (onAction) {
      onAction('signal_engineer_tune', { freq: tunedString });
      return;
    }

    // Local demo fallback
    const isCorrect = tunedString === signal.correctFrequency;
    if (isCorrect) {
      setFeedback({
        type: 'success',
        msg: `FREKANS KİLİTLENDİ (${tunedString})! Taşıyıcı dalga ile kod eşleşti. Sinyal başarıyla yakalandı!`,
      });
      onUpdate((prev) => ({
        ...prev,
        signal: {
          ...prev.signal,
          engineerTunedFreq: tunedString,
          isLocked: true,
          isSolved: true,
        },
      }));
    } else {
      setFeedback({
        type: 'error',
        msg: `FREKANS SAPMASI! ${tunedString} üzerinde aranan şifreli yayın bulunamadı. Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const activeFeedback = state.feedbackMessage
    ? {
        type: (state.feedbackState === 'success' ? 'success' : state.feedbackState === 'error' ? 'error' : 'idle') as 'idle' | 'success' | 'error',
        msg: state.feedbackMessage,
      }
    : feedback;

  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  // Gölge Protokolü Phase 2 (Hacker: Lazer Körleme) state
  const [golgeEmpFreq, setGolgeEmpFreq] = useState<number>(740);
  const [golgePulseActive, setGolgePulseActive] = useState<boolean>(false);
  const [golgeDamperReady, setGolgeDamperReady] = useState<boolean>(true);

  const handleGolgeEmpPulse = () => {
    setGolgePulseActive(true);
    setGolgeDamperReady(false);
    setTimeout(() => {
      setGolgePulseActive(false);
      setGolgeDamperReady(true);
    }, 1200);
  };

  const handleGolgeLaserTriggerAction = () => {
    if (onAction) {
      onAction('signal_engineer_tune', { freq: '740 THz' });
    }
    onUpdate((prev) => ({
      ...prev,
      signal: {
        ...prev.signal,
        engineerTunedFreq: '740 THz',
        isLocked: true,
        frequencyMatched: true,
        isSolved: true,
      },
    }));
    setFeedback({
      type: 'success',
      msg: 'KÖR NOKTA KORİDORU AÇILDI! 3.2 saniyelik güvenli geçiş penceresi ajana iletildi.',
    });
  };

  // Gölge Protokolü (Hacker - Lazer Körleme) UI (Lines 730-1007 of template)
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Top Mini HUD */}
        <div className="w-full bg-[#0f0c1e] rounded-xl p-2.5 shadow-md border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping"></span>
            <span className="font-mono text-[10px] text-[#ffba27] font-bold">AŞAMA 02 / 04</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#201d30]">
            <span className="material-symbols-outlined text-[13px] text-[#00eefc]">graphic_eq</span>
            <span className="font-mono text-[9px] text-[#00eefc]">CH-01 AKTİF</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#201d30]">
            <span className="material-symbols-outlined text-[13px] text-[#ffdba0]">timer</span>
            <span className="font-mono text-[10px] text-[#ffdba0] font-bold">
              {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#00eefc] font-bold">%{state.stealthLevel ?? 98} GİZLİ</span>
        </div>

        {/* Role Briefing */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#00eefc]/15 text-[#00eefc] font-mono text-[9px] font-bold tracking-wide">
              ROL: GÖLGE HACKER // KORİDOR ANALİZİ
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#93000a]/50 text-[#ffb4ab] font-mono text-[8px] font-bold uppercase">
              KRİTİK VERİ
            </span>
          </div>
          <h2 className="font-sora text-sm text-white font-bold tracking-tight uppercase mt-0.5">
            LAZER IZGARASINI KÖR ET & DÖNGÜYÜ ÇÖZ
          </h2>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Koridordaki kızılötesi ışın demetlerinin kapanma aralıklarını hesapla, kör noktayı ajana telsizden say.
          </p>
        </div>

        {/* Schematic Corridor Camera CAM-B2 */}
        <div className="w-full bg-[#1c192c] rounded-xl p-3 shadow-xl border border-white/5 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">videocam</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">
                KORİDOR KAMERASI // CAM-B2 (İZOMETRİK)
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0f0c1e] border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse"></span>
              <span className="font-mono text-[8px] text-[#ffb4ab] uppercase">CANLI DEŞİFRE</span>
            </div>
          </div>

          <div className="relative w-full h-36 rounded-lg bg-[#0f0c1e] overflow-hidden flex flex-col justify-between p-2.5 border border-white/5">
            <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-around">
              <div className="w-full h-px bg-[#00eefc]"></div>
              <div className="w-full h-px bg-[#00eefc]"></div>
              <div className="w-full h-px bg-[#00eefc]"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between font-mono text-[9px]">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-[#201d30] text-[#00eefc]">GİRİŞ (AJAN)</span>
                <span className="material-symbols-outlined text-[14px] text-[#ffb703] animate-bounce">arrow_forward</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffb703]/20 text-[#ffdba0] font-bold">
                <span className="material-symbols-outlined text-[12px]">shield</span>
                GÜVENLİ CEP ALANI
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#201d30] text-[#9e8f78]">ÇIKIŞ SİPERİ</span>
            </div>

            <div className="relative z-10 w-full flex items-center justify-around py-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-14 h-11 rounded-lg bg-[#201d30] flex flex-col items-center justify-center p-1 border border-red-500/30">
                  <span className="font-mono text-[9px] text-[#ffb4ab] font-bold">L-01</span>
                  <span className="font-mono text-[7px] text-[#9e8f78]">45° SALINIM</span>
                  <div className="w-full h-0.5 bg-red-500 rounded-full mt-0.5 animate-pulse"></div>
                </div>
                <span className="font-mono text-[8px] text-[#ffdba0]">1.8s KİLİTLİ</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="w-16 h-11 rounded-lg bg-[#00eefc]/15 border border-[#00eefc]/40 flex flex-col items-center justify-center p-1 shadow-md">
                  <span className="font-mono text-[9px] text-[#00eefc] font-bold">KÖR CEP</span>
                  <span className="font-mono text-[7px] text-[#00eefc]">PRİZMA ALANI</span>
                  <div className="w-full h-0.5 bg-[#00eefc] rounded-full mt-0.5"></div>
                </div>
                <span className="font-mono text-[8px] text-[#00eefc] font-bold">3.2s GEÇİŞ</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="w-14 h-11 rounded-lg bg-[#201d30] flex flex-col items-center justify-center p-1 border border-red-500/30">
                  <span className="font-mono text-[9px] text-[#ffb4ab] font-bold">L-02/L-03</span>
                  <span className="font-mono text-[7px] text-[#9e8f78]">ÇAPRAZ</span>
                  <div className="w-full h-0.5 bg-red-500 rounded-full mt-0.5 animate-pulse"></div>
                </div>
                <span className="font-mono text-[8px] text-[#ffb4ab]">EMP BEKLİYOR</span>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between font-mono text-[8px] text-[#9e8f78]">
              <span>X: 42.109 // Y: 18.042</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                <span className="text-[#00eefc]">ÖLÇEK: 1:50</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lazer Frekans Monitörü & Kare Dalga Boyu */}
        <div className="w-full bg-[#1c192c] rounded-xl p-3 shadow-xl border border-white/5 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">waves</span>
              <span className="font-mono text-[9px] text-[#ffba27] font-bold uppercase tracking-wider">
                LAZER FREKANS MONİTÖRÜ & KARE DALGA BOYU
              </span>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] px-2 py-0.5 rounded bg-[#0f0c1e] border border-white/5">
              740.2 THz KIZILÖTESİ
            </span>
          </div>

          <div className="w-full bg-[#0f0c1e] rounded-lg p-2.5 flex flex-col space-y-1.5 border border-white/5">
            <div className="w-full h-10 flex items-end">
              <svg className="w-full h-full text-[#00eefc]" fill="none" preserveAspectRatio="none" viewBox="0 0 320 50">
                <path d="M 0 45 L 30 45 L 30 8 L 80 8 L 80 45 L 140 45 L 140 8 L 190 8 L 190 45 L 250 45 L 250 8 L 300 8 L 300 45 L 320 45" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-[#201d30] rounded-lg p-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] text-[#9e8f78]">AÇIK KÖR GEÇİŞ</span>
                  <span className="text-xs text-[#00eefc] font-bold">3.2 SN</span>
                </div>
                <span className="material-symbols-outlined text-[#00eefc] text-[18px]">lock_open</span>
              </div>
              <div className="bg-[#201d30] rounded-lg p-2 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] text-[#9e8f78]">LAZER BARİYERİ</span>
                  <span className="text-xs text-[#ffb4ab] font-bold">1.8 SN</span>
                </div>
                <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">flash_on</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gizli Deşifre Dosyası - Secret Telemetry */}
        <div className="w-full bg-[#1c192c] rounded-xl p-3 shadow-xl border border-white/5 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[16px]">lock</span>
              <span className="font-mono text-[9px] text-white font-bold uppercase tracking-wider">
                GİZLİ DEŞİFRE DOSYASI
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#93000a]/50 text-[#ffb4ab] font-mono text-[8px] font-black uppercase">
              AJAN GÖREMEZ!
            </span>
          </div>

          <div className="space-y-1.5 font-manrope text-[11px]">
            <div className="bg-[#201d30] rounded-lg p-2 flex items-start gap-2 border border-white/5">
              <div className="w-5 h-5 rounded bg-[#ffb703] text-[#271900] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                1
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[9px] text-[#ffba27] font-bold">L-01 DÜŞÜK FREKANS KÖRLEMESİ</span>
                <p className="text-[#d5c4ac]">Bariyer salınımı 3. saniyede sıfırlanır. Ajan bu anda ilk cep bölgesine atlamalıdır.</p>
              </div>
            </div>
            <div className="bg-[#201d30] rounded-lg p-2 flex items-start gap-2 border border-white/5">
              <div className="w-5 h-5 rounded bg-[#00eefc] text-[#00363a] flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                2
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[9px] text-[#00eefc] font-bold">SAĞ DUVAR PRİZMASI AKTİF</span>
                <p className="text-[#d5c4ac]">Prizma mandalını 045° açısına getirt. Ajan sağ duvardaki niş alanda güvendedir.</p>
              </div>
            </div>
            <div className="bg-[#0f0c1e] rounded-lg p-2 flex items-start gap-2 border border-[#ffb703]/30">
              <span className="material-symbols-outlined text-[16px] text-[#ffb703] shrink-0 mt-0.5">campaign</span>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[9px] text-[#ffdba0] font-bold">TELSİZ TALİMATI (CH-01)</span>
                <p className="text-white font-semibold">
                  Ajana <span className="text-[#ffb703] font-bold">"3.. 2.. 1.. ŞİMDİ KOŞ!"</span> komutunu sesli olarak ver!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EMP Damper Kilit Modülü */}
        <div className="w-full bg-[#1c192c] rounded-xl p-3 shadow-xl border border-white/5 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">tune</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">
                EMP DAMPER KİLİT MODÜLÜ
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#ffba27] font-bold">
              KİLİT: {golgeEmpFreq} THz
            </span>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-[#9e8f78] font-mono text-[8px]">
              <span>600 THz</span>
              <span className="text-[#ffba27] font-bold">HEDEF REZONANS: 740 THz</span>
              <span>900 THz</span>
            </div>
            <input 
              type="range"
              min="600"
              max="900"
              value={golgeEmpFreq}
              onChange={(e) => setGolgeEmpFreq(parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-lg bg-[#0f0c1e] appearance-none cursor-pointer accent-[#ffb703]"
            />
            <div className="flex items-center gap-2 pt-1">
              <button 
                type="button"
                onClick={handleGolgeEmpPulse}
                className="flex-1 py-2 px-3 rounded-lg bg-[#2b273b] hover:bg-[#3a374b] active:scale-95 transition-transform flex items-center justify-center gap-1 text-[#00eefc] border border-white/5"
              >
                <span className="material-symbols-outlined text-[15px]">bolt</span>
                <span className="font-mono text-[9px] uppercase font-bold">EMP TEST DARBESİ</span>
              </button>
              <div className="px-2.5 py-1.5 rounded-lg bg-[#0f0c1e] font-mono text-[9px] text-[#d5c4ac] flex items-center gap-1 border border-white/5">
                <span className={`w-1.5 h-1.5 rounded-full ${golgePulseActive ? 'bg-[#ffb703] animate-ping' : 'bg-[#00eefc]'}`}></span>
                <span>{golgePulseActive ? 'SÖNÜMLENDİ' : 'HAZIR'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback text */}
        {feedback.msg && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-xs font-semibold leading-tight">{feedback.msg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          {signal.frequencyMatched ? (
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
              onClick={handleGolgeLaserTriggerAction}
              className="w-full py-4 px-3 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#FF8C00] shadow-[0_4px_0_#B26A00] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-[#271900] font-sora text-xs font-black uppercase tracking-tight cursor-pointer select-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">sensors_off</span>
              <span className="truncate">KÖR NOKTA KORİDORUNU AÇ & AJANA SAY ›</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Derin Basınç Manyetik Torpido State
  const [derinTorpFreq, setDerinTorpFreq] = useState(433.8);
  const [selectedTube, setSelectedTube] = useState<number>(2);

  const adjustFreq = (delta: number) => {
    if (signal.isSolved) return;
    setDerinTorpFreq(prev => Math.round((prev + delta) * 10) / 10);
  };

  const handleLaunchTorpedo = () => {
    // Kovan 2 and 433.8 MHz
    const tubeOk = selectedTube === 2;
    const freqOk = Math.abs(derinTorpFreq - 433.8) < 0.05;

    if (tubeOk && freqOk) {
      if (onAction) {
        onAction('signal_engineer_tune', { freq: signal.correctFrequency });
      }
      onUpdate((prev) => ({
        ...prev,
        signal: {
          ...prev.signal,
          engineerTunedFreq: prev.signal.correctFrequency,
          isLocked: true,
          isSolved: true,
        },
      }));
    } else {
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Telemetri Tepe Durum Şeridi */}
        <div className="pt-1 flex flex-col gap-1">
          <div className="flex items-center justify-between py-1.5 px-3 rounded-full bg-[#0f0c1e] text-[#00eefc] shadow-inner border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
              <span className="font-mono text-[9px] uppercase tracking-wider">DERİNLİK: -990m</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-[#ffdba0] uppercase">GÖVDE: %{state.hullIntegrity}</span>
              <span className="font-mono text-[10px] text-[#ffb4ab] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">timer</span>
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#00eefc]">
              <span className="material-symbols-outlined text-[13px]">cell_tower</span>
              <span className="font-mono text-[8px] uppercase">CH-02 ON</span>
            </div>
          </div>

          {/* Rol Etiketi & Konsol Görev Başlığı */}
          <div className="flex items-center justify-between mt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#201d30] text-[#ffba27] border border-[#ffb703]/30">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
              <span className="font-mono text-[9px] tracking-widest uppercase font-bold">ROL: MAKİNİST</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-[#ffb703]/20 text-[#ffdba0] font-mono text-[8px]">
              GÖREV 04 // TORPİDO
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="font-sora text-xl text-white font-extrabold tracking-tight">
              Karşı Tedbir Torpidosunu Ateşle
            </h2>
            <p className="text-xs text-[#d5c4ac] leading-relaxed">
              Dümencinin telsizle ilettiği kovan (KVN-2) ve 433.8 MHz frekansına göre kovanı hazırla ve ateşle.
            </p>
          </div>
        </div>

        {/* 1. 4'lü Ağır Torpido Kovan Matrisi */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#1c192c] shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">dataset</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">AĞIR TORPİDO MATRİSİ</span>
            </div>
            <span className="font-mono text-[8px] text-[#ffdba0] uppercase">OTO-DENGE AKTİF</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[1, 2, 3, 4].map(tubeNum => {
              const isSelected = selectedTube === tubeNum;
              return (
                <div
                  key={tubeNum}
                  onClick={() => !signal.isSolved && setSelectedTube(tubeNum)}
                  className={`relative flex flex-col p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#2b273b] border-[#ffba27] shadow-lg'
                      : 'bg-[#0f0c1e] border-white/5 opacity-60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-[#ffb703] text-[#271900] font-mono text-[7px] font-bold">
                      SEÇİLİ
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-[#ffba27]' : 'text-zinc-400'}`}>
                      KOVAN-0{tubeNum}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#00eefc] animate-pulse' : 'bg-zinc-600'}`}></span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className="material-symbols-outlined text-[18px] text-[#00eefc]">
                      {tubeNum === 2 ? 'waves' : 'lock'}
                    </span>
                    <span className="font-mono text-[8px] text-[#00eefc] font-bold">
                      {tubeNum === 2 ? 'SU ALMA TAMAM' : '0.0 BAR'}
                    </span>
                  </div>
                  <div className="w-full bg-[#363246] h-1 rounded-full overflow-hidden mt-1">
                    <div className={`h-full ${isSelected ? 'bg-[#ffba27] w-[100%]' : 'bg-zinc-600 w-[20%]'}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Frekans Akort Kadranı & Spektrum Monitörü */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#201d30] shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">graphic_eq</span>
              <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">MANYETİK AKORT KADRANI</span>
            </div>
            <span className="font-mono text-[8px] text-[#ffba27] bg-[#ffb703]/20 px-1.5 py-0.5 rounded font-bold">
              {Math.abs(derinTorpFreq - 433.8) < 0.05 ? 'KİLİTLENDİ' : 'AYARLANIYOR'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#0f0c1e] px-3 py-2.5 rounded-lg border border-white/5">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">HEDEF FREKANS</span>
              <div className="flex items-baseline gap-1">
                <span className={`font-sora text-2xl font-extrabold ${Math.abs(derinTorpFreq - 433.8) < 0.05 ? 'text-[#ffba27]' : 'text-white'}`}>
                  {derinTorpFreq.toFixed(1)}
                </span>
                <span className="font-mono text-[10px] text-[#00eefc]">MHz</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-[8px] text-[#00eefc]">MANYETİK REZONANS: %99.2</span>
            </div>
          </div>

          {/* İnce Ayar Butonları */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[-1.0, -0.1, 0.1, 1.0].map(step => (
              <button
                key={step}
                onClick={() => adjustFreq(step)}
                className="h-9 rounded bg-[#2b273b] hover:bg-[#363246] active:scale-95 text-white flex items-center justify-center font-mono text-xs font-bold border border-white/5"
                type="button"
              >
                {step > 0 ? `+${step.toFixed(1)}` : step.toFixed(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Pnömatik Güç Çubuğu */}
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#1c192c] shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-[#ffdba0] uppercase font-bold">PNÖMATİK PİSTON GÜCÜ</span>
            <span className="font-mono text-[9px] text-[#00eefc] font-bold">%100 HAZIR</span>
          </div>
          <div className="grid grid-cols-6 gap-1 py-0.5">
            <div className="h-2 rounded-sm bg-[#ffba27]"></div>
            <div className="h-2 rounded-sm bg-[#ffba27]"></div>
            <div className="h-2 rounded-sm bg-[#ffba27]"></div>
            <div className="h-2 rounded-sm bg-[#ffba27]"></div>
            <div className="h-2 rounded-sm bg-[#ffba27]"></div>
            <div className="h-2 rounded-sm bg-[#00eefc] animate-pulse"></div>
          </div>
        </div>

        {/* 4. Ateşleme Butonu */}
        {!signal.isSolved ? (
          <div className="pt-1 flex flex-col gap-1.5">
            <button
              onClick={handleLaunchTorpedo}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-b from-[#ffb703] to-[#e69500] text-[#271900] font-sora font-extrabold text-xs uppercase tracking-wide shadow-[0_6px_0_#8f5300,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              <span>TORPİDO KOVANINI FIRLAT &amp; İMHA ET</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>HEDEF İMHA EDİLDİ • DEVAM ET</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Background Visual Header */}
      <div className="relative w-full overflow-hidden rounded-b-2xl bg-[#0f0c1e] border border-white/10">
        <div 
          className="bg-cover bg-center w-full h-44 relative opacity-40" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-EHtsE9uXj77YZ38AYAxMAHhNErR6P7K3utAjJIu8w2ZWx4fDahXTu2XjkRsgnFGr5Dq1ASCvsGX0jA3bHuLtp2mpCNHd1CLwJVoik1nKGw-tyetG6Tn5qAwhQY04VhZc4ZQcYw5GdF_YYT6sYunhvE7zOyK2xfZcP-3PITnYzAMrOGzUoDcyqWyfKc9onLhrzhOCVI4kKyaRcH51sShcSdlpECPPJghLNiknmDY')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#141123]/40 via-[#141123]/80 to-[#141123]"></div>

        <div className="relative px-4 -mt-28 pb-4 z-10 flex flex-col gap-1 text-center items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2b273b]/80 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
            <span className="font-mono text-[10px] text-[#00eefc] tracking-widest uppercase font-bold">MÜHENDİS // FREKANS ANALİZİ</span>
          </div>
          <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight">
            Sinyali <span className="text-[#ffb703] drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">yakala</span>
          </h2>
          <p className="text-xs text-[#d5c4ac] max-w-[320px]">
            Kaptandan 4 haneli kodu al. Frekans tablosundaki doğru kanala ayarla ve kilitle.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 -mt-2">
        {/* Frequency & Code Matrix Table */}
        <div className="w-full bg-[#0f0c1e] rounded-2xl p-3 flex flex-col gap-2 shadow-xl border border-white/10">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[10px] text-[#00eefc] uppercase font-bold">RADYO FREKANS MATRİSİ</span>
            <span className="font-mono text-[9px] text-[#d5c4ac]">CANLI KANALLAR</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {signal.frequencies.map((item, idx) => {
              const isCurrent = `${formattedFreq} MHz` === item.freq;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (signal.isSolved) return;
                    setCurrentFreq(parseFloat(item.freq.replace(' MHz', '')));
                  }}
                  className={`p-2 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-[#00eefc]/15 border-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.3)]' 
                      : 'bg-[#201d30] border-white/5 hover:bg-[#2b273b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{item.freq}</span>
                    <span className="text-[9px] font-mono text-[#ffb703] bg-[#ffb703]/10 px-1 rounded">
                      Kod: {item.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#d5c4ac] mt-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine Tuning Slider & Stepper */}
        <div className="w-full bg-[#2b273b] rounded-2xl p-3.5 flex flex-col gap-2 shadow-md border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-sora text-xs font-bold text-white">İnce Frekans Ayarı</span>
            <span className="font-mono text-xs text-[#ffb703] font-bold bg-[#0f0c1e] px-2 py-0.5 rounded border border-white/10">
              {formattedFreq} MHz
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleStepDown}
              className="w-12 h-12 rounded-xl bg-[#0f0c1e] hover:bg-[#141123] flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_0_#0f0c1e] border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">remove</span>
            </button>

            <div className="flex-1 h-12 bg-[#0f0c1e] rounded-xl flex items-center px-3 relative overflow-hidden shadow-inner border border-white/10">
              <div className="w-full flex justify-between items-center opacity-40 px-1 font-mono text-[8px] text-[#d5c4ac]">
                <span>140</span>
                <span>141</span>
                <span>142</span>
                <span>143</span>
                <span>144</span>
                <span>145</span>
              </div>
              <div 
                className="absolute w-5 h-8 rounded bg-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.8)] flex items-center justify-center transition-all duration-150"
                style={{ left: `${Math.max(6, Math.min(94, ((currentFreq - 140) / 5) * 100))}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-0.5 h-5 bg-[#422c00] rounded-full"></div>
              </div>
            </div>

            <button
              onClick={handleStepUp}
              className="w-12 h-12 rounded-xl bg-[#0f0c1e] hover:bg-[#141123] flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_0_#0f0c1e] border border-white/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">add</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {activeFeedback.msg && (
          <div className={`p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
            activeFeedback.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {activeFeedback.msg}
          </div>
        )}

        {/* Lock Action Button */}
        <div className="w-full pt-1 flex flex-col gap-2">
          {!signal.isSolved ? (
            <button
              onClick={handleLockFrequency}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.4)] active:translate-y-1 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span>Frekansı Kilitle ({formattedFreq} MHz)</span>
            </button>
          ) : (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>FREKANS KİLİTLENDİ • DEVAM ET</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
