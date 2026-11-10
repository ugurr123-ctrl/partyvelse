import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen11AirlockCaptain: React.FC<Props> = ({ state, onAdvancePhase }) => {
  const { airlock } = state;
  const [transmitted, setTransmitted] = useState(false);

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3000);
  };

  const isDerinBasinc = state.operationTheme === 'derin_basinc';

  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* HUD Mini Telemetry Bar */}
        <section className="pt-1">
          <div className="bg-[#1c192c] rounded-xl p-2.5 shadow-md border border-white/5 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">waves</span>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">DERİNLİK</span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold">-910m</span>
              </div>
            </div>
            <div className="w-px h-5 bg-[#363246]"></div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[#ffba27] text-[16px]">timer</span>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">SÜRE</span>
                <span className="font-mono text-[10px] text-[#ffba27] font-bold">
                  {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="w-px h-5 bg-[#363246]"></div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[#dab5ff] text-[16px]">shield</span>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[8px] text-[#d5c4ac] uppercase">GÖVDE</span>
                <span className="font-mono text-[10px] text-[#dab5ff] font-bold">%{state.hullIntegrity}</span>
              </div>
            </div>
            <div className="w-px h-5 bg-[#363246]"></div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
              <span className="font-mono text-[9px] text-[#00eefc] font-bold">CH-02</span>
            </div>
          </div>
        </section>

        {/* Mission Stage & Role Banner */}
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#201d30] border border-[#ffb703]/30">
              <span className="material-symbols-outlined text-[#ffb703] text-[13px]">military_tech</span>
              <span className="font-mono text-[9px] text-[#ffdba0] font-bold tracking-wider">ROL: DÜMENCİ (KILAVUZ)</span>
            </div>
            <span className="font-mono text-[9px] text-[#d5c4ac] uppercase tracking-widest">AŞAMA 02 // ELEKTROLİZ</span>
          </div>
          <div className="bg-[#201d30] rounded-xl p-3 shadow-md border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px]">air</span>
              <h2 className="font-sora text-base text-white font-bold tracking-tight">Oksijen Hücrelerini Teşhis Et</h2>
            </div>
            <p className="text-xs text-[#d5c4ac] leading-relaxed">
              Spektrometre gaz seviyelerini analiz et, kritik 180V voltajını ve katot sıralamasını makiniste telsizden bildir.
            </p>
          </div>
        </section>

        {/* 2.5D Spectrometer Console */}
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[9px] text-[#d5c4ac] uppercase tracking-wider font-bold">GAZ SPEKTROMETRE MODÜLÜ</span>
            <span className="font-mono text-[9px] text-[#00eefc] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
              2.5D HİDRO-STATİK
            </span>
          </div>

          <div className="bg-[#1c192c] rounded-xl p-3 shadow-lg border border-white/5 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2 items-end pt-1">
              {/* O2 */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-full h-28 bg-[#0f0c1e] rounded-lg p-1.5 flex flex-col justify-end overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-[#93000a]/10 animate-pulse pointer-events-none"></div>
                  <div className="w-full bg-gradient-to-t from-[#93000a] to-[#ffb4ab] rounded transition-all duration-700 shadow-[0_0_12px_rgba(255,180,171,0.5)] h-[28%]"></div>
                  <span className="absolute top-1 right-1 font-mono text-[9px] text-[#ffb4ab] font-bold">%18.2</span>
                </div>
                <div className="text-center">
                  <span className="font-sora text-sm text-white font-bold leading-tight block">O₂</span>
                  <span className="font-mono text-[8px] text-[#ffb4ab] font-bold uppercase">KRİTİK DÜŞÜK</span>
                </div>
              </div>
              {/* CO2 */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-full h-28 bg-[#0f0c1e] rounded-lg p-1.5 flex flex-col justify-end overflow-hidden border border-white/5">
                  <div className="w-full bg-gradient-to-t from-[#ffb703] to-[#ffdba0] rounded transition-all duration-700 shadow-[0_0_12px_rgba(255,183,3,0.35)] h-[64%]"></div>
                  <span className="absolute top-1 right-1 font-mono text-[9px] text-[#ffdba0] font-bold">%4.8</span>
                </div>
                <div className="text-center">
                  <span className="font-sora text-sm text-white font-bold leading-tight block">CO₂</span>
                  <span className="font-mono text-[8px] text-[#ffdba0] font-bold uppercase">YÜKSEK</span>
                </div>
              </div>
              {/* N2 */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-full h-28 bg-[#0f0c1e] rounded-lg p-1.5 flex flex-col justify-end overflow-hidden border border-white/5">
                  <div className="w-full bg-gradient-to-t from-[#00686f] to-[#00eefc] rounded transition-all duration-700 shadow-[0_0_12px_rgba(0,238,252,0.35)] h-[82%]"></div>
                  <span className="absolute top-1 right-1 font-mono text-[9px] text-[#00eefc] font-bold">%77.0</span>
                </div>
                <div className="text-center">
                  <span className="font-sora text-sm text-white font-bold leading-tight block">N₂</span>
                  <span className="font-mono text-[8px] text-[#00eefc] font-bold uppercase">STABİL</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Confidential Protocol Panel (Kılavuz Özel) */}
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[#ffb703] text-[16px]">lock</span>
              <span className="font-mono text-[9px] text-[#ffba27] uppercase font-bold tracking-wider">GİZLİ ELEKTROLİZ PROTOKOLÜ</span>
            </div>
            <span className="font-mono text-[8px] text-[#ffb4ab] font-bold px-1.5 py-0.5 rounded-full bg-[#93000a]/30">MAKİNİST GÖREMEZ</span>
          </div>
          <div className="bg-[#201d30] rounded-xl p-3 shadow-lg border border-[#ffb703]/20 flex flex-col gap-1.5">
            {/* Hedef Voltaj */}
            <div className="bg-[#141123] rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2b273b] flex items-center justify-center text-[#ffba27]">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">HEDEF VOLTAJ</span>
                  <span className="text-xs text-white font-semibold">Ana Kalibrasyon</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-sora text-base text-[#ffba27] font-extrabold">180V</span>
                <span className="block font-mono text-[8px] text-zinc-400">(± 5V TOLERANS)</span>
              </div>
            </div>

            {/* Hücre Sırası */}
            <div className="bg-[#141123] rounded-lg p-2 flex flex-col gap-1">
              <span className="font-mono text-[9px] text-[#d5c4ac] uppercase font-semibold">KRİTİK HÜCRE DİZİLİM SIRASI</span>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div className="flex-1 bg-[#2b273b] rounded p-1 text-center font-mono text-[11px] text-[#00eefc] font-bold">
                  KATOT-A
                </div>
                <span className="text-zinc-500">➔</span>
                <div className="flex-1 bg-[#2b273b] rounded p-1 text-center font-mono text-[11px] text-[#ffdba0] font-bold">
                  ANOT-C
                </div>
                <span className="text-zinc-500">➔</span>
                <div className="flex-1 bg-[#2b273b] rounded p-1 text-center font-mono text-[11px] text-[#00eefc] font-bold">
                  KATOT-B
                </div>
              </div>
            </div>

            {/* Eşik Basıncı */}
            <div className="bg-[#141123] rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2b273b] flex items-center justify-center text-[#00eefc]">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">BASINÇ EŞİĞİ</span>
                  <span className="text-xs text-white font-semibold">Emniyet Sınırı</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-sora text-base text-[#00eefc] font-extrabold">35 Bar</span>
                <span className="block font-mono text-[8px] text-[#ffb4ab] font-bold">AŞILAMAZ</span>
              </div>
            </div>
          </div>
        </section>

        {/* Transmit Trigger */}
        <section className="pt-1 flex flex-col gap-2">
          <button
            onClick={handleTransmit}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-xs tracking-wider uppercase shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <span>{transmitted ? 'PROTOKOL MAKİNİSTE AKTARILDI' : 'PROTOKOLÜ MAKİNİSTE AKTAR'}</span>
          </button>

          {airlock.isSolved && (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>OKSİJEN DENGELENDİ • DEVAM ET</span>
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Role Authorization Badge */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">KAPTAN // HAVA KİLİDİ PROTOKOLÜ</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">
          Basınç döngüsünü yönet
        </h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Hava kilidi sızdırmazlık prosedürünü mühendise ilet. Adımları yanlış sıralamak kabin basıncını düşürür.
        </p>
      </div>

      {/* Protocol Directive Cards */}
      <div className="p-4 rounded-2xl bg-[#201d30] border border-white/5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#ffb703]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold">ZORUNLU SIRALAMA</span>
          </div>
          <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-widest font-bold">KAPTAN DOKÜMANI</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {airlock.rules.map((rule, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0f0c1e] border border-white/5 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#2b273b] text-[#ffb703] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="text-xs text-white leading-relaxed font-medium">
                {rule}
              </span>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-xl bg-[#0f0c1e]/60 border border-white/5 flex items-center justify-between text-xs font-mono">
          <span className="text-[#d5c4ac]">Hedef Basınç Bandı:</span>
          <span className="text-[#00eefc] font-bold">{airlock.targetPressureRange}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleTransmit}
          className="w-full h-12 rounded-xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#00686f] active:translate-y-1 transition-all cursor-pointer uppercase"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>{transmitted ? 'Prosedür Telsizle Aktarıldı' : 'Protokolü Mühendise İlet'}</span>
        </button>

        {airlock.isSolved && (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>HAVA KİLİDİ AKTİF • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
