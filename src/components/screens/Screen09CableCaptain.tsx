import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
  onAdvancePhase: () => void;
}

export const Screen09CableCaptain: React.FC<Props> = ({ state, onAdvancePhase }) => {
  const [confirmed, setConfirmed] = useState(state.cable.isSolved);

  const handleConfirmSwitch = () => {
    setConfirmed(true);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-HUD Status Banner */}
      <div className="flex items-center justify-between bg-[#1c192c] px-4 py-2.5 rounded-2xl shadow-md border border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7df4ff] animate-ping"></span>
          <span className="font-mono text-[10px] text-[#7df4ff] tracking-wider uppercase font-bold">PARTYVERSE // CANLI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#363246]/80 px-2 py-0.5 rounded text-[10px] font-mono">
            <span className="material-symbols-outlined text-[#00dbe9] text-[13px]">timer</span>
            <span className="text-white">04:15</span>
          </div>
          <div className="flex items-center gap-1 bg-[#363246]/80 px-2 py-0.5 rounded text-[10px] font-mono">
            <span className="material-symbols-outlined text-[#ffb703] text-[13px]">shield</span>
            <span className="text-[#ffba27] font-bold">%{state.hullIntegrity} BÜTÜNLÜK</span>
          </div>
        </div>
      </div>

      {/* Role Identity & Directive Header */}
      <div className="flex flex-col gap-1 mt-3">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest font-bold uppercase">KAPTAN // KILAVUZ ŞEMASI</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">Devreyi doğru eşleştir</h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Mühendisine doğru soket ve kablo eşleşmelerini telsizden aktar. Yanlış hat kısa devre yaptırır.
        </p>
      </div>

      {/* Mühendis Live Link Telemetry Widget */}
      <div className="relative bg-[#201d30] p-3.5 rounded-2xl shadow-md overflow-hidden mt-3 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#00eefc]/20">
              <span className="material-symbols-outlined text-[#00eefc] text-[17px]">engineering</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00dbe9]"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-[#00eefc] tracking-wider font-bold">MÜHENDİS DURUMU</span>
              <span className="text-[10px] text-[#d5c4ac]">Operatör frekansı senkronize</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#2b273b] px-2 py-0.5 rounded border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-pulse"></span>
            <span className="font-mono text-[9px] text-[#ffb703] tracking-widest uppercase font-bold">
              {state.cable.isSolved ? 'TAMAMLANDI' : 'BEKLENİYOR'}
            </span>
          </div>
        </div>

        {/* Live Port Progress */}
        <div className="flex items-center justify-between pt-2 bg-[#0f0c1e]/60 px-3 py-2 rounded-xl border border-white/5 font-mono">
          <span className="text-[10px] text-white font-bold">BAĞLANTI İLERLEMESİ</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-[#ffba27]">
              {state.cable.isSolved ? '3' : '2'}
            </span>
            <span className="text-[10px] text-[#9e8f78]">/ 3 KABLO TAKILDI</span>
          </div>
        </div>
      </div>

      {/* 2.5D Schematic Terminal: Şifreli Devre Protokolü */}
      <div className="flex flex-col bg-[#1c192c] rounded-2xl shadow-xl overflow-hidden mt-3 border border-white/10">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2b273b]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffba27] text-[18px]">account_tree</span>
            <span className="font-sora text-xs font-bold text-white tracking-wide uppercase">Şifreli Devre Protokolü</span>
          </div>
          <span className="font-mono text-[9px] text-[#7df4ff] bg-[#0f0c1e] px-2 py-0.5 rounded font-bold">REV-09</span>
        </div>

        <div className="p-3.5 flex flex-col space-y-2">
          {/* Alfa Hattı (Güneş / Sarı) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201d30] shadow-sm border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-9 rounded-full bg-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.6)] flex items-center justify-center shrink-0"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-sora text-xs font-bold text-white">Güneş Hattı</span>
                  <span className="font-mono text-[8px] px-1.5 py-0.2 rounded bg-[#363246] text-[#ffba27] font-bold">240 Hz</span>
                </div>
                <span className="text-[10px] text-[#d5c4ac]">Öncelikli Güç Aktarımı</span>
              </div>
            </div>
            <div className="flex flex-col items-end font-mono">
              <span className="text-[9px] text-[#9e8f78]">HEDEF SOKET</span>
              <div className="flex items-center gap-1 bg-[#0f0c1e] px-2 py-0.5 rounded shadow-inner">
                <span className="text-xs font-bold text-[#ffba27] tracking-wider">PORT J2</span>
                <span className="material-symbols-outlined text-[#ffba27] text-[14px]">check_circle</span>
              </div>
            </div>
          </div>

          {/* Ay Hattı (Cyan) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201d30] shadow-sm border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-9 rounded-full bg-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.6)] flex items-center justify-center shrink-0"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-sora text-xs font-bold text-white">Ay Hattı</span>
                  <span className="font-mono text-[8px] px-1.5 py-0.2 rounded bg-[#363246] text-[#00eefc] font-bold">480 Hz</span>
                </div>
                <span className="text-[10px] text-[#d5c4ac]">İyon Şebekesi Regülasyonu</span>
              </div>
            </div>
            <div className="flex flex-col items-end font-mono">
              <span className="text-[9px] text-[#9e8f78]">HEDEF SOKET</span>
              <div className="flex items-center gap-1 bg-[#0f0c1e] px-2 py-0.5 rounded shadow-inner">
                <span className="text-xs font-bold text-[#00eefc] tracking-wider">PORT J4</span>
                <span className="material-symbols-outlined text-[#00eefc] text-[14px]">check_circle</span>
              </div>
            </div>
          </div>

          {/* Yıldız Hattı (Mor) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#201d30] shadow-sm border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-9 rounded-full bg-[#dab5ff] shadow-[0_0_12px_rgba(218,181,255,0.6)] flex items-center justify-center shrink-0"></div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-sora text-xs font-bold text-white">Yıldız Hattı</span>
                  <span className="font-mono text-[8px] px-1.5 py-0.2 rounded bg-[#363246] text-[#dab5ff] font-bold">120 Hz</span>
                </div>
                <span className="text-[10px] text-[#d5c4ac]">Tehlike Baypas İletkeni</span>
              </div>
            </div>
            <div className="flex flex-col items-end font-mono">
              <span className="text-[9px] text-[#9e8f78]">HEDEF SOKET</span>
              <div className="flex items-center gap-1 bg-[#0f0c1e] px-2 py-0.5 rounded shadow-inner">
                <span className="text-xs font-bold text-[#dab5ff] tracking-wider">PORT J1</span>
                <span className="material-symbols-outlined text-[#dab5ff] text-[14px]">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactile Signal Sparkline SVG */}
        <div className="px-4 py-2 bg-[#0f0c1e]/90 flex items-center justify-between border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#7df4ff] text-[16px]">graphic_eq</span>
            <span className="font-mono text-[9px] text-[#d5c4ac]">CANLI VERİ AKIŞI: 142.8 MHz</span>
          </div>
          <svg className="w-24 h-4 text-[#00dbe9]" fill="none" viewBox="0 0 100 20">
            <path d="M0 10 L15 10 L20 2 L25 18 L30 10 L45 10 L50 4 L55 16 L60 10 L75 10 L80 1 L85 19 L90 10 L100 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
          </svg>
        </div>
      </div>

      {/* Heavy Tactile Arcade Rocker Trigger / Şalter */}
      <div className="flex flex-col space-y-2 mt-3">
        {!state.cable.isSolved ? (
          <button 
            onClick={handleConfirmSwitch}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-sm shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.35)] transition-all active:translate-y-1 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">bolt</span>
            <span>AKIMI KONTROL ET VE ONAYLA</span>
          </button>
        ) : (
          <button 
            onClick={onAdvancePhase}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] transition-all active:translate-y-1 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer animate-bounce"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>KABLOLAR TAMAMLANDI • SONRAKİ GÖREV</span>
          </button>
        )}
      </div>

      {/* Tactical Caution Callout Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#2b273b] shadow-md border border-white/5 mt-2">
        <div className="w-7 h-7 rounded-lg bg-[#0f0c1e] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#ffb703] text-[18px]">warning</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[9px] text-[#ffba27] tracking-wider font-bold">ÖNEMLİ KILAVUZ NOTU</span>
          <p className="text-[11px] text-[#e6dff9] mt-0.5 leading-snug">
            Mühendis soketlerin Hz değerini görür; doğrudan port numaralarını (<span className="text-[#00eefc] font-bold">J1, J2, J4</span>) ilet!
          </p>
        </div>
      </div>

      {/* Comms Pulse Action Strip */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#201d30] shadow-sm border border-white/5 mt-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#7df4ff] text-[18px]">mic</span>
          <span className="text-xs text-white">Telsiz Frekansı Açık</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7df4ff] animate-ping"></div>
          <span className="font-mono text-[9px] text-[#7df4ff] tracking-widest uppercase font-bold">Kanal-01</span>
        </div>
      </div>

    </div>
  );
};
