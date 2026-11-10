import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: (payload?: { roundId: string; expectedPhaseIndex: number }) => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen09CableCaptain: React.FC<Props> = ({ state, onAdvancePhase }) => {
  const { cable } = state;
  const [transmitted, setTransmitted] = useState(false);

  const getCableById = (id: string) => cable.cables.find(c => c.id === id);

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3000);
  };

  const isDerinBasinc = state.operationTheme === 'derin_basinc';

  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans space-y-3">
        {/* HUD TELEMETRY BAR */}
        <section className="pt-1 flex flex-col gap-1">
          <div className="grid grid-cols-4 gap-1">
            <div className="flex flex-col p-1.5 rounded-xl bg-[#2b273b] shadow-sm border border-white/5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#ffb4ab]">timer</span>
                <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">SÜRE</span>
              </div>
              <span className="font-mono text-xs text-[#ffb4ab] font-bold mt-0.5">
                {Math.floor(state.timeLeftSeconds / 60)}:{String(state.timeLeftSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex flex-col p-1.5 rounded-xl bg-[#2b273b] shadow-sm border border-white/5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#ffba27]">shield</span>
                <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">GÖVDE</span>
              </div>
              <span className="font-mono text-xs text-[#ffdba0] font-bold mt-0.5">%{state.hullIntegrity}</span>
            </div>
            <div className="flex flex-col p-1.5 rounded-xl bg-[#2b273b] shadow-sm border border-white/5">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#00eefc]">navigation</span>
                <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">DERİNLİK</span>
              </div>
              <span className="font-mono text-xs text-[#00eefc] font-bold mt-0.5">870m</span>
            </div>
            <div className="flex flex-col p-1.5 rounded-xl bg-[#2b273b] shadow-sm border border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#d5c4ac] uppercase">TELSİZ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse"></span>
              </div>
              <span className="font-mono text-[10px] text-[#00eefc] font-bold mt-0.5">CH-02 ON</span>
            </div>
          </div>

          {/* MISSION INSTRUCTION PANEL */}
          <div className="mt-1 p-3 rounded-xl bg-[#201d30] border border-[#ffb4ab]/30 shadow-md">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-lg bg-[#0f0c1e] text-[#00eefc] font-mono text-[9px] tracking-widest uppercase font-bold">
                ROL: DÜMENCİ (KILAVUZ)
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#93000a] text-[#ffdad6] font-mono text-[9px] font-bold uppercase">
                TEHLİKE UYARISI
              </span>
            </div>
            <h2 className="font-sora text-lg font-bold text-white tracking-tight">Sızıntı Bölmesini Tespit Et</h2>
            <p className="text-xs text-[#d5c4ac] mt-0.5 leading-snug">
              Akustik hidrofon dinleme verilerini analiz et, çatlayan kompartıman kodunu (T-03) makiniste söyle.
            </p>
          </div>
        </section>

        {/* 1. DENİZALTI GÖVDE KESİT ŞEMASI */}
        <section className="flex flex-col p-3 rounded-xl bg-[#1c192c] shadow-lg border border-white/5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px]">subway</span>
              <span className="font-mono text-[10px] text-[#00eefc] tracking-wider uppercase font-bold">GÖVDE KESİT ŞEMASI</span>
            </div>
            <span className="font-mono text-[9px] text-[#d5c4ac]">SİSMİK TARAMA: CANLI</span>
          </div>

          <div className="relative w-full rounded-xl bg-[#0f0c1e] p-2 mt-1 border border-white/5 overflow-hidden">
            <svg className="w-full h-28" fill="none" viewBox="0 0 340 130" xmlns="http://www.w3.org/2000/svg">
              <line className="text-zinc-700 opacity-50" stroke="currentColor" strokeDasharray="2 4" x1="0" x2="340" y1="65" y2="65"></line>
              <line className="text-zinc-700 opacity-30" stroke="currentColor" strokeDasharray="2 4" x1="170" x2="170" y1="0" y2="130"></line>
              <path className="text-zinc-600" d="M25 65 C25 35, 60 20, 150 20 L270 24 C310 26, 325 50, 330 65 C325 80, 310 104, 270 106 L150 110 C60 110, 25 95, 25 65 Z" fill="#201D30" stroke="currentColor" strokeWidth="2"></path>
              <path d="M175 20 L185 5 L215 5 L225 20 Z" fill="#2B273B"></path>
              {/* Compartment 1: T-03 Sızıntı */}
              <g>
                <path className="animate-pulse" d="M30 65 C30 42, 55 25, 100 22 L100 108 C55 105, 30 88, 30 65 Z" fill="#93000A" opacity="0.8"></path>
                <circle className="animate-ping" cx="65" cy="65" fill="#FFB4AB" fillOpacity="0.3" r="14"></circle>
                <circle cx="65" cy="65" fill="#FFB4AB" r="6"></circle>
                <text fill="#E6DFF9" fontFamily="Sora" fontSize="9" fontWeight="700" textAnchor="middle" x="65" y="42">T-03</text>
                <text fill="#FFB4AB" fontFamily="Sora" fontSize="8" fontWeight="700" textAnchor="middle" x="65" y="98">SIZINTI</text>
              </g>
              <line stroke="#FFBA27" strokeDasharray="3 2" strokeWidth="2" x1="102" x2="102" y1="22" y2="108"></line>
              {/* Compartment 2: R-01 */}
              <g>
                <rect fill="#2B273B" height="88" opacity="0.6" width="70" x="106" y="21"></rect>
                <circle cx="141" cy="65" fill="#00EEFC" r="5"></circle>
                <text fill="#E6DFF9" fontFamily="Sora" fontSize="9" fontWeight="600" textAnchor="middle" x="141" y="45">R-01</text>
                <text fill="#D3FBFF" fontFamily="Manrope" fontSize="7" textAnchor="middle" x="141" y="95">REAKTÖR</text>
              </g>
              <line stroke="#514532" strokeWidth="1.5" x1="178" x2="178" y1="18" y2="110"></line>
              {/* Compartment 3: B-02 */}
              <g>
                <rect fill="#2B273B" height="87" opacity="0.6" width="68" x="182" y="21"></rect>
                <circle cx="216" cy="65" fill="#00EEFC" r="5"></circle>
                <text fill="#E6DFF9" fontFamily="Sora" fontSize="9" fontWeight="600" textAnchor="middle" x="216" y="45">B-02</text>
                <text fill="#D3FBFF" fontFamily="Manrope" fontSize="7" textAnchor="middle" x="216" y="95">BALAST</text>
              </g>
              <line stroke="#514532" strokeWidth="1.5" x1="252" x2="252" y1="24" y2="106"></line>
              {/* Compartment 4: K-04 */}
              <g>
                <path d="M254 24 L275 25 C305 28, 320 52, 324 65 C320 78, 305 102, 275 105 L254 106 Z" fill="#2B273B" opacity="0.6"></path>
                <circle cx="282" cy="65" fill="#00EEFC" r="5"></circle>
                <text fill="#E6DFF9" fontFamily="Sora" fontSize="9" fontWeight="600" textAnchor="middle" x="282" y="45">K-04</text>
                <text fill="#D3FBFF" fontFamily="Manrope" fontSize="7" textAnchor="middle" x="282" y="95">DÜMEN</text>
              </g>
            </svg>
            <div className="grid grid-cols-4 gap-1 mt-1 text-center">
              <div className="p-1 rounded bg-[#93000a]/40 text-[#ffb4ab] font-mono text-[9px] font-bold">BURUN (T-03): SIZINTI</div>
              <div className="p-1 rounded bg-[#2b273b] text-[#00eefc] font-mono text-[9px]">R-01: STABİL</div>
              <div className="p-1 rounded bg-[#2b273b] text-[#00eefc] font-mono text-[9px]">B-02: STABİL</div>
              <div className="p-1 rounded bg-[#2b273b] text-[#00eefc] font-mono text-[9px]">K-04: STABİL</div>
            </div>
          </div>
        </section>

        {/* 2. AKUSTİK HİDROFON SES FREKANS OSİLOSKOPU */}
        <section className="flex flex-col p-3 rounded-xl bg-[#1c192c] shadow-md border border-white/5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[18px]">graphic_eq</span>
              <span className="font-mono text-[10px] text-[#00eefc] tracking-wider uppercase font-bold">HİDROFON FREKANS OSİLOSKOPU</span>
            </div>
            <span className="font-mono text-[9px] text-[#ffdba0] bg-[#5e4100] px-1.5 py-0.5 rounded">CANLI TAYF</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0f0c1e] flex flex-col gap-1 border border-white/5">
            <div className="relative w-full h-16 flex items-center justify-center overflow-hidden rounded-lg bg-[#201d30]">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 300 80">
                <path d="M0 40 Q 25 38, 45 41 T 90 39 T 130 41 L 140 15 L 148 68 L 158 8 L 168 74 L 176 22 L 186 52 L 194 38 L 220 40 T 260 41 T 300 40" stroke="#FFB703" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                <path d="M0 40 Q 30 42, 60 40 T 120 40 L 145 25 L 155 58 L 165 20 L 175 60 L 185 30 L 210 40 T 300 40" opacity="0.4" stroke="#00EEFC" strokeLinecap="round" strokeWidth="1.2"></path>
              </svg>
              <div className="absolute right-2 top-2 px-1.5 py-0.5 rounded bg-[#93000a]/50 text-[#ffb4ab] font-mono text-[9px]">
                1.2 kHz ÇATLAMA REZONANSI
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-[#2b273b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[16px]">sensors</span>
              <span className="text-[11px] text-[#ffb4ab] font-bold">KRİTİK HATA: BÖLME T-03 (TORPİDO KAPAĞI)</span>
            </div>
          </div>
        </section>

        {/* 3. DÜMENCİYE ÖZEL GİZLİ KILAVUZ */}
        <section className="flex flex-col p-3 rounded-xl bg-[#201d30] shadow-xl border border-[#ffb703]/20 relative overflow-hidden">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffba27] text-[18px]">lock</span>
              <span className="font-mono text-[10px] text-[#ffba27] uppercase font-bold tracking-wider">GİZLİ KILAVUZ (DÜMENCİ PROTOKOLÜ)</span>
            </div>
            <span className="font-mono text-[9px] text-[#271900] bg-[#ffb703] px-1.5 py-0.5 rounded font-bold uppercase">MAKİNİST GÖREMEZ</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141123]">
              <span className="text-xs text-[#d5c4ac]">HASARLI KOMPARTIMAN:</span>
              <span className="font-sora text-sm text-[#ffb4ab] font-bold">T-03</span>
            </div>
            <div className="flex flex-col p-2 rounded-lg bg-[#141123]">
              <span className="text-[10px] text-[#d5c4ac] mb-1">TAHLİYE BYPASS EŞLEŞME SIRASI:</span>
              <div className="flex items-center justify-between gap-1">
                <span className="flex-1 text-center py-1 rounded bg-[#2b273b] font-mono text-xs text-[#00eefc] font-bold">VALF-C</span>
                <span className="text-zinc-500">➔</span>
                <span className="flex-1 text-center py-1 rounded bg-[#2b273b] font-mono text-xs text-[#00eefc] font-bold">ŞALTER-02</span>
                <span className="text-zinc-500">➔</span>
                <span className="flex-1 text-center py-1 rounded bg-[#2b273b] font-mono text-xs text-[#ffdba0] font-bold">ACİL KELEPÇE</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141123]">
              <span className="text-xs text-[#d5c4ac]">KRİTİK BASINÇ TOLERANSI:</span>
              <span className="font-sora text-sm text-[#ffdba0] font-bold">52 BAR</span>
            </div>
          </div>
        </section>

        {/* 4. Transmit Button */}
        <section className="pt-1 flex flex-col gap-2">
          <button
            onClick={handleTransmit}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-xs tracking-wider uppercase shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <span>{transmitted ? 'PROTOKOL MAKİNİSTE AKTARILDI (CH-02)' : 'PROTOKOLÜ MAKİNİSTE TELSİZLE BİLDİR'}</span>
          </button>

          {cable.isSolved && (
            <button
              onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00eefc] to-[#00dbe9] text-[#002022] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#004f54,0_12px_24px_rgba(0,238,252,0.35)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>SIZINTI MÜHÜRLENDİ • DEVAM ET</span>
            </button>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col text-on-surface select-none pb-8 animate-fadeIn font-sans">
      
      {/* Sub-HUD Role Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-mono text-[10px] tracking-widest font-bold uppercase">KAPTAN // KABLO BAĞLANTI ŞEMASI</span>
        </div>
        <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight mt-1">Devreyi doğru eşleştir</h1>
        <p className="text-xs text-[#d5c4ac] leading-relaxed">
          Mühendisine port soketleri (P1–P4) ile doğru kabloların eşleşmesini telsizden aktar. Yanlış hat kısa devre yaptırır.
        </p>
      </div>

      {/* Guide Schematic Card */}
      <div className="relative bg-[#201d30] p-3.5 rounded-2xl shadow-md overflow-hidden mt-3 border border-white/5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#00eefc] tracking-wider font-bold uppercase">
            GİZLİ DEVRE EŞLEŞTİRME KILAVUZU
          </span>
          <span className="text-[9px] font-mono text-[#ffb703] font-bold">4 PORT</span>
        </div>

        <div className="flex flex-col gap-2">
          {cable.ports.map((port) => {
            const reqCable = getCableById(port.requiredCableId);
            return (
              <div key={port.id} className="p-2.5 rounded-xl bg-[#0f0c1e] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#2b273b] font-mono text-xs font-bold text-white flex items-center justify-center border border-white/10">
                    {port.id}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-white font-semibold">{port.functionLabel}</span>
                    <span className="text-[10px] text-[#d5c4ac]">{port.label}</span>
                  </div>
                </div>

                {reqCable && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border" style={{ borderColor: reqCable.color, backgroundColor: `${reqCable.color}15` }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: reqCable.color }}></span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: reqCable.color }}>
                      {reqCable.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transmit Action */}
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleTransmit}
          className="w-full h-12 rounded-xl bg-[#00eefc] text-[#002022] font-sora font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#00686f] active:translate-y-1 transition-all cursor-pointer uppercase"
        >
          <span className="material-symbols-outlined text-[18px]">cell_tower</span>
          <span>{transmitted ? 'Şema Bilgisi Telsizden Gönderildi' : 'Şemayı Mühendise Telsizle'}</span>
        </button>

        {cable.isSolved && (
          <button
            onClick={() => onAdvancePhase({ roundId: state.roundId, expectedPhaseIndex: state.currentPhaseIndex })}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 transition-all cursor-pointer animate-bounce mt-2"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>DEVRE KİLİTLENDİ • SONRAKİ AŞAMA</span>
          </button>
        )}
      </div>

    </div>
  );
};
