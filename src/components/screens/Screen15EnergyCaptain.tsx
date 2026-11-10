import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen15EnergyCaptain: React.FC<Props> = ({ state, onUpdate, onAdvancePhase, onAction }) => {
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const { energy, hullIntegrity, timeLeftSeconds } = state;
  const { engineerAllocation, lineLosses, captainMinRequirements, isDraftShared, isLocked } = energy;

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(isDraftShared);
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: isLocked ? 'success' : 'idle',
    msg: isLocked ? 'Enerji dağılımı kilitlendi! Tüm hayati sistemler nominal sınırlarda.' : '',
  });

  const minutes = Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeLeftSeconds % 60).toString().padStart(2, '0');

  const effectivePower = {
    yasamDestegi: Math.max(0, engineerAllocation.yasamDestegi - lineLosses.yasamDestegi),
    itki: Math.max(0, engineerAllocation.itki - lineLosses.itki),
    kalkan: Math.max(0, engineerAllocation.kalkan - lineLosses.kalkan),
  };

  const handleTransmitDerinBasinc = () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    if (onAction) {
      onAction('derin_basinc_transmit_core', {});
    }
    setTimeout(() => {
      setTransmitted(true);
      setIsTransmitting(false);
      onUpdate((prev) => ({
        ...prev,
        energy: {
          ...prev.energy,
          isDraftShared: true,
        },
      }));
    }, 1200);
  };

  const handleLockEnergy = () => {
    if (onAction) {
      onAction('energy_lock', {});
      return;
    }

    if (!isDraftShared) {
      setFeedback({
        type: 'error',
        msg: 'Henüz Mühendisten onaylı enerji taslağı ulaşmadı! Mühendisin taslağı iletmesi bekleniyor.',
      });
      return;
    }

    const meetsLife = effectivePower.yasamDestegi >= captainMinRequirements.yasamDestegi;
    const meetsThrust = effectivePower.itki >= captainMinRequirements.itki;
    const meetsShield = effectivePower.kalkan >= captainMinRequirements.kalkan;

    if (meetsLife && meetsThrust && meetsShield) {
      setFeedback({
        type: 'success',
        msg: 'ENERJİ KİLİTLENDİ! Dağılım tüm hayati sistemlerin asgari sınırlarını karşılıyor. Kurtarma rotası açıldı!',
      });
      onUpdate((prev) => ({
        ...prev,
        energy: {
          ...prev.energy,
          isLocked: true,
        },
      }));
    } else {
      let failDetail = 'YETERSİZ ENERJİ DAĞILIMI! ';
      if (!meetsLife) failDetail += `Net Yaşam Desteği (${effectivePower.yasamDestegi} MW) asgari 3 MW olmalı. `;
      if (!meetsThrust) failDetail += `Net İtki (${effectivePower.itki} MW) asgari 2 MW olmalı. `;
      if (!meetsShield) failDetail += `Net Kalkan (${effectivePower.kalkan} MW) asgari 2 MW olmalı. `;

      setFeedback({
        type: 'error',
        msg: `${failDetail}Mühendisten tahsisi artırmasını isteyin! Bütünlük -%10, Süre -15 sn!`,
      });
      onUpdate((prev) => ({
        ...prev,
        hullIntegrity: Math.max(0, prev.hullIntegrity - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';
  const [golgePin, setGolgePin] = useState<string>('');
  const [golgeUsbAttached, setGolgeUsbAttached] = useState<boolean>(true);
  const [golgeProgress, setGolgeProgress] = useState<number>(84);

  const handleGolgeKeypad = (digit: string) => {
    if (energy.isLocked) return;
    if (golgePin.length < 4) {
      setGolgePin(prev => prev + digit);
    }
  };

  const handleGolgeClear = () => {
    if (energy.isLocked) return;
    setGolgePin('');
  };

  const handleGolgeExtractData = () => {
    // Correct PIN from hacker terminal: 8429
    if (golgePin === '8429' || golgePin.length === 4) {
      setGolgeProgress(100);
      if (onAction) {
        onAction('energy_lock', {});
      }
      onUpdate((prev) => ({
        ...prev,
        energy: {
          ...prev.energy,
          isDraftShared: true,
          isLocked: true,
        },
      }));
      setFeedback({
        type: 'success',
        msg: 'BİYOMETRİK VERİ BAŞARIYLA ÇEKİLDİ! 128 TB kriptolu veri diske aktarıldı, kasa boşaltıldı.',
      });
    } else {
      setFeedback({
        type: 'error',
        msg: 'GÜVENLİK PIN HATASI! Hackerın ilettiği 4 haneli kodu girin (8429).',
      });
      onUpdate((prev) => ({
        ...prev,
        stealthLevel: Math.max(0, (prev.stealthLevel ?? 100) - 10),
        timeLeftSeconds: Math.max(0, prev.timeLeftSeconds - 15),
      }));
    }
  };

  // ================= GÖLGE PROTOKOLÜ — BİYOMETRİK VERİ ÇEKME (AJAN) =================
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* Top Telemetry Sub-HUD */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 rounded-xl bg-[#0f0c1e] border border-white/5 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-[#ffb703] text-[#271900] font-mono text-[9px] uppercase font-bold">
              AŞAMA 03 / 04
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px] text-[#00eefc]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              SESSİZLİK %{state.stealthLevel ?? 96} GİZLİ
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <div className="flex items-center gap-1 text-[#ffba27]">
              <span className="material-symbols-outlined text-[13px]">timer</span>
              <span>
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[#9e8f78]">CH-01</span>
          </div>
        </div>

        {/* Role Badge & Header Directives */}
        <div className="flex flex-col space-y-1">
          <div className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded bg-[#201d30] border border-white/5">
            <span className="material-symbols-outlined text-[#00eefc] text-[15px]">fingerprint</span>
            <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold">
              ROL: SAHADAKİ AJAN // FİZİKSEL ÇEKİRDEK KASASI
            </span>
          </div>
          <h2 className="font-sora text-sm text-white uppercase tracking-tight font-bold mt-0.5">
            BİYOMETRİK VERİYİ ÇEK & FLAŞ DİSKİ DOLDUR
          </h2>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Hacker'ın telsizden fısıldadığı 4 haneli güvenlik PIN sırasını gir, kriyojenik sürücüyü yuvaya kitle ve veri transferini sessizce tamamla.
          </p>
        </div>

        {/* Hacker Comm Stream (Telsiz Dinleme Kutusu) */}
        <div className="relative overflow-hidden p-3 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
          <div className="flex items-start gap-2.5 relative z-10">
            <div className="relative flex shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#0f0c1e] flex items-center justify-center text-[#00eefc] border border-[#00eefc]/30">
                <span className="material-symbols-outlined text-[18px]">headset_mic</span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00eefc]"></span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#ffba27] tracking-wider uppercase font-bold">
                  {state.engineerName || 'MERT (GÖLGE HACKER)'}
                </span>
                <span className="font-mono text-[8px] text-[#00eefc] bg-[#0f0c1e] px-1.5 py-0.5 rounded">TELSİZ</span>
              </div>
              <p className="font-manrope text-xs text-white font-medium mt-0.5 leading-snug">
                “Kasa deşifre edildi! PIN: <span className="text-[#ffb703] font-bold tracking-widest font-mono">8 - 4 - 2 - 9</span>. Hemen tuşla ve diski kitle!”
              </p>
            </div>
          </div>
        </div>

        {/* 2.5D Kasa & Sürücü Yuvası Visual Card */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-xl bg-[#0f0c1e] border border-white/5 flex items-center justify-center">
          <img 
            className="w-full h-full object-cover" 
            alt="Kasa & Veri Çekme" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaqmbRRBJADbPwqOECQ5GA5h6rxtfsiytAFe96DdBz4-TjbUItT-PpF98VWeK1yFnoLrOIdVoJXoAF25tOYABet9Ws5MZGr_qtdb7LlTiXDBIP-tad9CxipsLMUuCcgVsJrBQstzhEHQQtOx6SwcYF_wvuHqxWuXiQEeHwmOvqLqlZPCI_fYMAC2Wqbq229d2YC8yIL2OI_DY9wrVvxOCFOQWE6osR3JiM1IdNKvM"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-transparent to-[#0f0c1e]/40"></div>
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0f0c1e]/80 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></span>
            <span className="font-mono text-[9px] text-white">KRİYO SÜRÜCÜ: AKTİF</span>
          </div>
          <div className="absolute bottom-2 inset-x-3 flex items-center justify-between">
            <span className="font-mono text-[9px] text-[#00eefc] bg-[#201d30]/90 px-2 py-0.5 rounded">
              VERİ TRANSFERİ: %{golgeProgress}
            </span>
            <span className="font-mono text-[9px] text-[#ffba27] bg-[#201d30]/90 px-2 py-0.5 rounded">
              28°C / 1.2 BAR
            </span>
          </div>
        </div>

        {/* Touchscreen Security PIN Keypad */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#1c192c] border border-white/5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffba27] text-[16px]">pin</span>
              GÜVENLİK PIN GİRİŞİ
            </span>
            <span className="font-mono text-[10px] text-[#00eefc] bg-[#0f0c1e] px-2 py-0.5 rounded border border-white/5 tracking-widest font-black">
              {golgePin ? golgePin.split('').join(' ') : '_ _ _ _'}
            </span>
          </div>

          {/* 3x4 Keypad Grid */}
          <div className="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleGolgeKeypad(num)}
                className="h-10 rounded-lg bg-[#2b273b] hover:bg-[#3a374b] active:scale-95 text-white font-mono text-sm font-bold border border-white/5 flex items-center justify-center transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleGolgeClear}
              className="h-10 rounded-lg bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] font-mono text-xs font-bold border border-red-500/20 flex items-center justify-center transition-all"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleGolgeKeypad('0')}
              className="h-10 rounded-lg bg-[#2b273b] hover:bg-[#3a374b] active:scale-95 text-white font-mono text-sm font-bold border border-white/5 flex items-center justify-center transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleGolgeExtractData}
              className="h-10 rounded-lg bg-[#ffb703] hover:bg-[#ffba27] active:scale-95 text-[#271900] font-mono text-xs font-black border border-[#ffb703] flex items-center justify-center transition-all"
            >
              OK
            </button>
          </div>
        </div>

        {/* Feedback message if any */}
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

        {/* Bottom Arcade Action Button */}
        <div className="pt-1 flex flex-col gap-1.5">
          {energy.isLocked ? (
            <button
              onClick={() => onAdvancePhase({ roundId: state.currentRoundId || 'round1', expectedPhaseIndex: 2 })}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-sora text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(16,185,129,0.35)] active:translate-y-1 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
              <span>FAZ 03 TAMAMLANDI // KAÇIŞ TAHLİYESİNE GEÇ</span>
            </button>
          ) : (
            <button
              onClick={handleGolgeExtractData}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] text-[#271900] font-sora text-xs font-black uppercase tracking-tight flex items-center justify-center gap-2 shadow-[0_4px_0_#6b4b00,0_8px_16px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer select-none"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span className="truncate">BİYOMETRİK VERİYİ ÇEK & TERMİNALİ BOŞALT ›</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ================= DERİN BASINÇ — REAKTÖR ÇEKİRDEĞİ (DÜMENCİ) =================
  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
        
        {/* Mission Header Briefing Card */}
        <div className="bg-[#2b273b] rounded-xl p-space-md shadow-md flex flex-col space-y-space-xs relative overflow-hidden mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-space-xs">
              <span className="w-2 h-2 rounded-full bg-[#ffb703]"></span>
              <span className="font-mono text-[11px] text-[#ffba27] uppercase tracking-wider font-bold">GÖREV 05 // 06</span>
            </div>
            <span className="bg-[#363246] px-space-xs py-0.5 rounded font-mono text-[10px] text-[#d3fbff] tracking-widest uppercase font-bold">
              DÜMENCİ KOKPİTİ
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="font-sora text-[22px] font-bold text-[#e6dff9]">TERMAL KRİTİK SEVİYE</h2>
            <p className="text-[12px] text-[#d5c4ac] leading-relaxed">
              Reaktör çekirdeği kritik sıcaklıkta! Radyasyon ve soğutma akış verilerini incele, acil çubuk sırasını ve soğutucu boru hattını telsizle makiniste bildir.
            </p>
          </div>
          <div className="flex items-center space-x-space-xs pt-1">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[16px]">warning</span>
            <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">REAKTÖR ÇEKİRDEK ERİME RİSKİ: YÜKSEK</span>
          </div>
        </div>

        {/* 2.5D Reaktör Kesit Göstergesi (Circular Core HUD) */}
        <div className="bg-[#201d30] rounded-xl p-space-md shadow-lg flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-space-sm">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#d3fbff] text-[18px]">motion_sensor_active</span>
              <span className="font-mono text-[10px] text-[#d3fbff] uppercase font-bold">2.5D ÇEKİRDEK KESİTİ</span>
            </div>
            <div className="flex items-center space-x-space-xs bg-[#0f0c1e] px-space-xs py-0.5 rounded">
              <span className="font-mono text-[11px] text-[#ffba27]">SICAKLIK:</span>
              <span className="font-mono text-[11px] text-[#ffb4ab] font-bold animate-pulse">890°C</span>
            </div>
          </div>

          {/* Interactive Circular Core Canvas Representation */}
          <div className="relative w-64 h-64 flex items-center justify-center my-space-xs">
            {/* Outer Orbit Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle className="stroke-[#363246]" cx="100" cy="100" fill="none" r="86" strokeWidth="6"></circle>
              {/* Segment 1: K-01 Stabil */}
              <circle className="stroke-[#00dbe9]" cx="100" cy="100" fill="none" r="86" strokeDasharray="125 500" strokeDashoffset="0" strokeWidth="6"></circle>
              {/* Segment 2: K-02 Critical Aşırı Yüklü */}
              <circle className="stroke-[#ffb4ab]" cx="100" cy="100" fill="none" r="86" strokeDasharray="125 500" strokeDashoffset="-135" strokeLinecap="round" strokeWidth="8"></circle>
              {/* Segment 3: K-03 Tıkalı */}
              <circle className="stroke-[#ffb703]" cx="100" cy="100" fill="none" r="86" strokeDasharray="125 500" strokeDashoffset="-270" strokeWidth="6"></circle>
              {/* Segment 4: K-04 Stabil */}
              <circle className="stroke-[#00dbe9]" cx="100" cy="100" fill="none" r="86" strokeDasharray="125 500" strokeDashoffset="-405" strokeWidth="6"></circle>
            </svg>

            {/* Mid Radiation Halo Ring */}
            <div className="absolute w-44 h-44 rounded-full bg-[#93000a]/20 flex items-center justify-center animate-pulse">
              <div className="w-36 h-36 rounded-full bg-[#0f0c1e]/80 flex items-center justify-center">
                {/* Inner Core Core Visual */}
                <div className="w-24 h-24 rounded-full bg-[#ffb703]/30 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                  <span className="material-symbols-outlined text-[#ffb703] text-[28px] animate-spin" style={{ animationDuration: '12s' }}>
                    cyclone
                  </span>
                  <span className="font-mono text-[11px] text-[#e6dff9] mt-0.5 font-bold">890°C</span>
                  <span className="font-mono text-[10px] text-[#ffb4ab] uppercase font-bold">KRİTİK</span>
                </div>
              </div>
            </div>

            {/* Sector Overlays K-01 to K-04 */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#2b273b] px-space-xs py-0.5 rounded shadow">
              <span className="font-mono text-[11px] text-[#d3fbff] font-bold">K-01</span>
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#93000a] px-space-xs py-0.5 rounded shadow">
              <span className="font-mono text-[11px] text-[#ffdad6] font-bold">K-02 %94</span>
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#2b273b] px-space-xs py-0.5 rounded shadow">
              <span className="font-mono text-[11px] text-[#ffb703] font-bold">K-03</span>
            </div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-[#2b273b] px-space-xs py-0.5 rounded shadow">
              <span className="font-mono text-[11px] text-[#d3fbff] font-bold">K-04</span>
            </div>
          </div>

          {/* 4 Rod Status Breakdown Chips */}
          <div className="grid grid-cols-2 gap-space-xs w-full mt-space-sm">
            <div className="bg-[#0f0c1e] p-space-xs rounded flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]"></span>
                <span className="font-mono text-[11px] text-[#e6dff9]">K-01</span>
              </div>
              <span className="font-mono text-[10px] text-[#00dbe9] font-bold">STABİL</span>
            </div>
            <div className="bg-[#93000a]/40 p-space-xs rounded flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-ping"></span>
                <span className="font-mono text-[11px] text-[#ffb4ab]">K-02</span>
              </div>
              <span className="font-mono text-[10px] text-[#ffb4ab] uppercase font-bold">AŞIRI (%94)</span>
            </div>
            <div className="bg-[#0f0c1e] p-space-xs rounded flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]"></span>
                <span className="font-mono text-[11px] text-[#e6dff9]">K-03</span>
              </div>
              <span className="font-mono text-[10px] text-[#ffb703] font-bold">TIKALI</span>
            </div>
            <div className="bg-[#0f0c1e] p-space-xs rounded flex items-center justify-between">
              <div className="flex items-center space-x-space-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]"></span>
                <span className="font-mono text-[11px] text-[#e6dff9]">K-04</span>
              </div>
              <span className="font-mono text-[10px] text-[#00dbe9] font-bold">STABİL</span>
            </div>
          </div>
        </div>

        {/* Radyasyon & Soğutma Manometreleri Grid */}
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Manometre 1: Radyasyon */}
          <div className="bg-[#2b273b] rounded-xl p-space-md flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">arrows_outward</span>
              <span className="font-mono text-[10px] text-[#ffb4ab] uppercase font-bold">TEHLİKE</span>
            </div>
            <div className="my-space-xs flex flex-col">
              <span className="font-sora text-[18px] text-[#ffb4ab] font-bold">420</span>
              <span className="font-mono text-[11px] text-[#d5c4ac]">mSv/h SIZINTI</span>
            </div>
            <div className="w-full bg-[#0f0c1e] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#ffb4ab] h-full rounded-full w-[84%]"></div>
            </div>
            <span className="font-mono text-[10px] text-[#d5c4ac] mt-1">EŞİK: 300 mSv/h</span>
          </div>

          {/* Manometre 2: Soğutucu Sıvı */}
          <div className="bg-[#2b273b] rounded-xl p-space-md flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#00dbe9] text-[20px]">water_drop</span>
              <span className="font-mono text-[10px] text-[#d3fbff] uppercase font-bold">DÜŞÜŞTE</span>
            </div>
            <div className="my-space-xs flex flex-col">
              <div className="flex items-baseline space-x-space-xs">
                <span className="font-sora text-[18px] text-[#e6dff9] font-bold">14.2</span>
                <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">BAR</span>
              </div>
              <span className="font-mono text-[11px] text-[#d5c4ac]">SOĞUTUCU AKIŞI</span>
            </div>
            <div className="w-full bg-[#0f0c1e] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#00dbe9] h-full rounded-full w-[38%]"></div>
            </div>
            <span className="font-mono text-[10px] text-[#ffba27] mt-1">HEDEF: 28.0 BAR</span>
          </div>
        </div>

        {/* Gizli Müdahale Protokolü (Navigator Only) */}
        <div className="bg-[#0f0c1e] rounded-xl p-space-md shadow-xl relative overflow-hidden border border-white/5">
          <div className="flex items-center justify-between mb-space-sm pb-space-xs">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#ffba27] text-[18px]">lock</span>
              <span className="font-sora text-[18px] text-[#ffdba0] font-bold">GİZLİ PROTOKOL</span>
            </div>
            <div className="bg-[#93000a] text-[#ffdad6] px-space-xs py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider">
              MAKİNİST GÖREMEZ
            </div>
          </div>

          {/* Step Sequences */}
          <div className="flex flex-col space-y-space-xs mb-space-sm">
            <span className="font-mono text-[10px] text-[#d3fbff] uppercase tracking-wider font-bold">ÖNCELİKLİ ÇUBUK VE VALF SIRASI</span>
            <div className="bg-[#201d30] p-space-xs rounded flex items-center space-x-space-xs">
              <span className="w-5 h-5 rounded bg-[#ffb703] text-[#6b4b00] font-mono text-[11px] flex items-center justify-center font-bold">1</span>
              <span className="text-[14px] text-[#e6dff9] font-semibold">K-02 ÇUBUĞUNU İNDİR</span>
              <span className="material-symbols-outlined text-[#ffba27] text-[14px] ml-auto">arrow_forward</span>
            </div>
            <div className="bg-[#201d30] p-space-xs rounded flex items-center space-x-space-xs">
              <span className="w-5 h-5 rounded bg-[#2b273b] text-[#e6dff9] font-mono text-[11px] flex items-center justify-center">2</span>
              <span className="text-[14px] text-[#e6dff9]">BORU-3 SIVI TAHLİYE VALFİ</span>
              <span className="material-symbols-outlined text-[#d5c4ac] text-[14px] ml-auto">arrow_forward</span>
            </div>
            <div className="bg-[#201d30] p-space-xs rounded flex items-center space-x-space-xs">
              <span className="w-5 h-5 rounded bg-[#2b273b] text-[#e6dff9] font-mono text-[11px] flex items-center justify-center">3</span>
              <span className="text-[14px] text-[#e6dff9]">BORU-1 SOĞUTMA ENJEKTE</span>
              <span className="material-symbols-outlined text-[#d3fbff] text-[14px] ml-auto">check_circle</span>
            </div>
          </div>

          {/* Warning / Instruction Callout */}
          <div className="bg-[#2b273b] rounded p-space-xs flex flex-col space-y-space-xs">
            <div className="flex items-center space-x-space-xs">
              <span className="material-symbols-outlined text-[#ffba27] text-[16px]">record_voice_over</span>
              <span className="font-mono text-[11px] text-[#ffba27] uppercase font-bold">TELSİZ TALİMATI</span>
            </div>
            <p className="text-[12px] text-[#7df4ff] italic">
              "Makiniste K-02 çubuğunu 28 Bar soğutma akışıyla eşlemesini söyle. 28 Bar limitinin aşılması erimeye yol açar!"
            </p>
          </div>
        </div>

        {/* Mürettebat Telsiz Durumu */}
        <div className="bg-[#2b273b] rounded-xl p-space-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-space-sm">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#0f0c1e] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#d3fbff] text-[22px]">engineering</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00dbe9] ring-2 ring-[#2b273b] animate-ping"></span>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00dbe9] ring-2 ring-[#2b273b]"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-space-xs">
                <span className="font-sora text-[16px] font-bold text-[#e6dff9]">Mert (Makinist)</span>
                <span className="bg-[#00eefc]/20 text-[#00eefc] px-1 rounded font-mono text-[10px] font-bold">BAĞLI</span>
              </div>
              <span className="text-[12px] text-[#d5c4ac]">Reaktör Soğutma Odasında • CH-02 Dinlemede</span>
            </div>
          </div>
          <div className="flex items-center space-x-space-xs bg-[#201d30] px-space-xs py-1 rounded">
            <span className="material-symbols-outlined text-[#00dbe9] text-[16px]">volume_up</span>
            <span className="font-mono text-[11px] text-[#00dbe9]">0dB</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="w-full pt-space-xs">
          {!isLocked ? (
            <button
              onClick={handleTransmitDerinBasinc}
              disabled={isTransmitting}
              className={`w-full py-space-md px-space-lg rounded-xl font-sora font-extrabold text-[15px] flex items-center justify-center space-x-space-sm shadow-lg active:translate-y-1 transition-all select-none cursor-pointer ${
                transmitted
                  ? 'bg-[#00eefc] text-[#002022] shadow-[0_4px_0_#00686f]'
                  : 'bg-[#ffb703] text-[#422c00] shadow-[0_4px_0_#7d5800,0_8px_16px_rgba(255,183,3,0.3)]'
              }`}
              type="button"
            >
              {isTransmitting ? (
                <>
                  <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                  <span className="tracking-wide">CH-02 TELSİZE AKTARILIYOR...</span>
                </>
              ) : transmitted ? (
                <>
                  <span className="material-symbols-outlined text-[24px]">check_circle</span>
                  <span className="tracking-wide">VERİLER AKTARILDI (MAKİNİST BEKLENİYOR)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">mic</span>
                  <span className="tracking-wide">TERMAL VERİLERİ MAKİNİSTE AKTAR</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full py-space-md px-space-lg rounded-xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-[15px] uppercase tracking-wider flex items-center justify-center space-x-space-sm shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <span>REAKTÖR KİLİTLENDİ • KAÇIŞ ROTASINA GEÇ</span>
            </button>
          )}
        </div>

      </div>
    );
  }

  // ================= STANDARD (KAYIP SİNYAL) PROTOCOL =================
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // ENERJİ DOĞRULAMA</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Reaktör Gücünü Yönet
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Mühendisin 15 MW toplam bütçeden sunduğu güç dağılımını asgari güvenlik şartlarıyla kıyasla ve kilitle.
        </p>
      </div>

      {/* Secret Minimum Requirements Card */}
      <div className="p-4 rounded-2xl bg-[#201d30] border border-white/5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#ffb703]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold">ASGARİ GÜVENLİK SINIRLARI</span>
          </div>
          <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">GİZLİ KILAVUZ</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-[#00eefc] text-[18px] mb-1">ecg_heart</span>
            <span className="text-[10px] text-[#d5c4ac]">Net Yaşam</span>
            <span className="font-sora text-sm text-[#00eefc] font-bold">≥ {captainMinRequirements.yasamDestegi} MW</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-[#ffb703] text-[18px] mb-1">rocket_launch</span>
            <span className="text-[10px] text-[#d5c4ac]">Net İtki</span>
            <span className="font-sora text-sm text-[#ffb703] font-bold">≥ {captainMinRequirements.itki} MW</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex flex-col items-center">
            <span className="material-symbols-outlined text-[#dab5ff] text-[18px] mb-1">shield</span>
            <span className="text-[10px] text-[#d5c4ac]">Net Kalkan</span>
            <span className="font-sora text-sm text-[#dab5ff] font-bold">≥ {captainMinRequirements.kalkan} MW</span>
          </div>
        </div>
      </div>

      {/* Engineer's Shared Draft Readout */}
      <div className="p-4 rounded-2xl bg-[#0f0c1e] border border-white/10 shadow-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDraftShared ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`}></span>
            <span className="font-mono text-[10px] text-white uppercase font-bold">MÜHENDİSİN ENERJİ TASLAĞI</span>
          </div>
          <span className={`text-[10px] font-mono font-bold ${isDraftShared ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isDraftShared ? 'İLETİLDİ' : 'BEKLENİYOR'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mt-1">
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-[#d5c4ac]">Yaşam Desteği</span>
            <span className="font-sora text-lg font-bold text-white">{engineerAllocation.yasamDestegi} MW</span>
            <span className="text-[9px] text-emerald-400 font-mono">Net: {effectivePower.yasamDestegi} MW</span>
          </div>

          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-[#d5c4ac]">İtki Motorları</span>
            <span className="font-sora text-lg font-bold text-white">{engineerAllocation.itki} MW</span>
            <span className="text-[9px] text-emerald-400 font-mono">Net: {effectivePower.itki} MW</span>
          </div>

          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5 flex flex-col items-center">
            <span className="text-[10px] text-[#d5c4ac]">Gövde Kalkanı</span>
            <span className="font-sora text-lg font-bold text-white">{engineerAllocation.kalkan} MW</span>
            <span className="text-[9px] text-emerald-400 font-mono">Net: {effectivePower.kalkan} MW</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#d5c4ac] text-center pt-1 border-t border-white/5">
          Toplam Tahsis: {engineerAllocation.yasamDestegi + engineerAllocation.itki + engineerAllocation.kalkan} / 15 MW (Hat Kaybı: her hatta -1 MW)
        </div>
      </div>

      {/* Feedback Message */}
      {(state.feedbackMessage || feedback.msg) && (
        <div className={`p-2.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
          (state.feedbackState === 'success' || (!state.feedbackState && feedback.type === 'success'))
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
        }`}>
          {state.feedbackMessage || feedback.msg}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2 flex flex-col gap-2">
        {!isLocked ? (
          <button
            onClick={handleLockEnergy}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">lock</span>
            <span>Enerji Dağılımını Onayla ve Kilitle</span>
          </button>
        ) : (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00dbe9] via-[#00eefc] to-[#7df4ff] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#00686f,0_0_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>ENERJİ KİLİTLENDİ • KURTARMA ROTASI</span>
          </button>
        )}
      </div>

    </div>
  );
};
