import React from 'react';
import { MissionState } from '../../types/game';
import { ScreenKarantinaBioRole } from './karantina/ScreenKarantinaBioRole';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const Screen03CaptainRole: React.FC<Props> = ({ state, onConfirmRole }) => {
  const isKarantina = state.operationTheme === 'karantina_2088';
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  if (isKarantina) {
    return <ScreenKarantinaBioRole state={state} onConfirmRole={onConfirmRole} />;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Gölge Protokolü — Gizli Rol: Sahadaki Ajan
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto min-h-screen bg-[#141123] text-[#e6dff9] flex flex-col justify-between pb-safe select-none overflow-x-hidden animate-fadeIn font-sans">
        {/* Screen Header */}
        <header className="relative w-full z-20 bg-[#141123]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2b273b]/60 text-[#d3fbff]">
                <span className="material-symbols-outlined text-[20px]">security</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-[#ffb703] tracking-widest uppercase font-bold">
                  GÖLGE PROTOKOLÜ // SİBER OPERASYON
                </span>
                <h1 className="font-sora text-sm font-bold text-white tracking-tight uppercase leading-none">
                  Konsol Terminali
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#363246]/60 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-pulse"></span>
                <span className="font-mono text-[9px] text-[#00eefc] uppercase font-bold">SESLİ HAT</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#ffdba0] text-[#422c00] flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full gap-3 px-4 pt-2 pb-6">
          {/* Confidentiality Protocol HUD Strip */}
          <div className="flex items-center justify-between bg-[#2b273b]/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping"></span>
              <span className="font-mono text-[9px] text-[#ffdba0] tracking-widest uppercase font-bold">
                SANA ÖZEL GİZLİ DOKÜMAN
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#0f0c1e] px-2 py-0.5 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-[13px] text-[#00eefc]">security</span>
              <span className="font-mono text-[9px] text-[#00eefc] tracking-widest uppercase font-bold">KOD ADI: AJAN</span>
            </div>
          </div>

          {/* Hero Operative Card */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#1c192c] shadow-xl border border-white/10">
            <div className="relative w-full h-64 bg-[#0f0c1e]">
              <img
                className="w-full h-full object-cover object-top"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAynh6heEml4rYm16GpBr-kb75gSGp1Svxj_u-RJkrycbcwxtRmn9aCMGXl0PL-yxVK-lzT7n9JJzkpUDDqkR3fOmBw7Fu_Myf0TvrjQgE6hpI8Ff6OCeZRz4gY9McJwUJgVO2Zd5jwZv5b1cQLTvPWpy7ALDywl_hnwQRNcQ9Tx9iHY-bRLZQ11MBbOpvxfHBWy0oDQRIp3_xnzNWNaOoXKZuUx9bzP9cZYUNzT7Q"
                alt="Sahadaki Ajan Sızma Uzmanı"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c192c] via-[#1c192c]/40 to-transparent"></div>
              
              {/* Telemetry HUD Badges Floating */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0f0c1e]/80 backdrop-blur-sm text-[#00eefc] font-mono text-[9px] border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse"></span>
                  SIZMA MODU: AKTİF
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0f0c1e]/80 backdrop-blur-sm text-[#ffba27] font-mono text-[9px] border border-white/5">
                  GİZLİLİK: %98.4
                </span>
              </div>
            </div>

            {/* Identity & Role Mission Statement */}
            <div className="p-3.5 flex flex-col gap-1 bg-[#1c192c]">
              <div className="flex items-center gap-1 text-[#ffb703]">
                <span className="material-symbols-outlined text-[18px]">theater_comedy</span>
                <span className="font-mono text-[9px] tracking-widest uppercase font-bold">GÖREV UNVANI</span>
              </div>
              <h2 className="font-sora text-base font-extrabold text-[#ffb703] uppercase tracking-tight">
                SAHADAKİ AJANSIN (SIZMA UZMANI)
              </h2>
              <p className="text-xs text-[#d5c4ac] leading-relaxed mt-0.5">
                Lazer koridorları, biyometrik paneller ve fiziksel kilitler yalnızca senin önünde. Dijital şifreleri göremezsin; telsizden Hacker'ın vereceği koordinatlara ve bypass kodlarına göre fiziksel donanımları tetikle.
              </p>
            </div>
          </div>

          {/* Squad Telemetry Link: Partner Hacker Status */}
          <div className="w-full bg-[#201d30] p-3 rounded-xl flex items-center justify-between shadow-md border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-10 h-10 rounded-xl bg-[#2b273b] flex items-center justify-center shrink-0 border border-white/10">
                <span className="material-symbols-outlined text-[#00eefc] text-[20px]">terminal</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00eefc]"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[9px] text-[#00eefc] uppercase">OPERASYONEL ORTAK</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-[#363246] text-[#7df4ff]">TELSİZ AÇIK</span>
                </div>
                <span className="font-sora text-xs font-bold text-white truncate">Gölge Hacker (Mert)</span>
                <span className="text-[10px] text-[#00eefc]/80 truncate">Şifreli Konsolda Hazır • Bağlantı Stabil</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="font-mono text-[8px] text-[#ffb703]">GECİKME</span>
              <span className="font-mono text-xs font-bold text-white">18ms</span>
            </div>
          </div>

          {/* Protocols Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1 text-[#ffb703]">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <h3 className="font-sora text-xs font-bold text-white uppercase tracking-tight">3 KRİTİK GÖREV PROTOKOLÜ</h3>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] tracking-widest">AŞAMA // 01-03</span>
          </div>

          {/* Protocols List */}
          <div className="flex flex-col gap-2">
            {/* Protocol 1 */}
            <div className="bg-[#201d30] p-3 rounded-xl flex items-start gap-3 border border-white/5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2b273b] text-[#ffb703] flex items-center justify-center font-sora text-xs font-bold shrink-0">
                01
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-sora text-xs font-bold text-white uppercase">Fiziksel Panel Erişimi</h4>
                  <span className="material-symbols-outlined text-[#00eefc] text-[16px]">cable</span>
                </div>
                <p className="text-[11px] text-[#d5c4ac] mt-0.5">
                  Terminal kutusunun kablolarını Hacker'ın söylediği voltaj sırasına göre bağla.
                </p>
              </div>
            </div>

            {/* Protocol 2 */}
            <div className="bg-[#201d30] p-3 rounded-xl flex items-start gap-3 border border-white/5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2b273b] text-[#ffb703] flex items-center justify-center font-sora text-xs font-bold shrink-0">
                02
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-sora text-xs font-bold text-white uppercase">Lazer Koridoru İntikali</h4>
                  <span className="material-symbols-outlined text-rose-400 text-[16px]">sensors</span>
                </div>
                <p className="text-[11px] text-[#d5c4ac] mt-0.5">
                  Hacker'ın telsizden saydığı saniye aralıklarında adım at ve kameraları atlat.
                </p>
              </div>
            </div>

            {/* Protocol 3 */}
            <div className="bg-[#201d30] p-3 rounded-xl flex items-start gap-3 border border-white/5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2b273b] text-[#ffb703] flex items-center justify-center font-sora text-xs font-bold shrink-0">
                03
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-sora text-xs font-bold text-white uppercase">Biyometrik Veri Çekme</h4>
                  <span className="material-symbols-outlined text-[#00eefc] text-[16px]">usb</span>
                </div>
                <p className="text-[11px] text-[#d5c4ac] mt-0.5">
                  Ana sunucu kasasına fiziksel flaş sürücüyü takıp veriyi kopyala.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Equipment Readout Footer */}
          <div className="bg-[#0f0c1e] p-2.5 rounded-xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2b273b] flex items-center justify-center text-[#ffdba0]">
                <span className="material-symbols-outlined text-[16px]">key</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[8px] text-[#9e8f78] uppercase">TEÇHİZAT ÇANTASI</span>
                <span className="text-xs text-white font-semibold">Taktik Maymuncuk & Kripto USB</span>
              </div>
            </div>
            <span className="font-mono text-[9px] text-[#00eefc] bg-[#201d30] px-2 py-0.5 rounded border border-white/10 font-bold">
              HAZIR
            </span>
          </div>

          {/* Arcade Action Trigger */}
          <div className="pt-2 flex flex-col gap-1.5">
            <button
              onClick={onConfirmRole}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,183,3,0.35)] active:translate-y-1 transition-all cursor-pointer"
              type="button"
            >
              <span>ROLÜMÜ ANLADIM & SAHAYA İN</span>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
            <div className="flex items-center justify-center gap-1 text-[#9e8f78]">
              <span className="material-symbols-outlined text-[13px]">lock</span>
              <span className="font-mono text-[9px] uppercase tracking-wider">
                SEÇİM YAPILDIKTAN SONRA ROL DEĞİŞTİRİLEMEZ
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If Derin Basınç is chosen, render the exact official Derin Basınç Dümenci assignment card
  if (isDerinBasinc) {
    return (
      <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#141123] text-[#e6dff9] relative flex flex-col justify-between overflow-hidden rounded-[40px] shadow-2xl border border-[#2b273b] antialiased select-none animate-fadeIn font-sans pb-6">
        
        {/* Fixed Top Bar */}
        <header className="w-full pt-4 px-4 bg-[#0f0c1e]/85 backdrop-blur-xl border-b border-white/5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2b273b] text-[#e6dff9] border border-white/5 shadow-inner">
                <span className="material-symbols-outlined text-[20px] text-[#00eefc]">anchor</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-[#00eefc] uppercase tracking-wider font-bold">
                    DERİN DALIP // PROTOKOL
                  </span>
                </div>
                <h1 className="font-sora text-sm text-white font-bold tracking-tight truncate max-w-[170px]">
                  Aktif Çatışma Operasyonu
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2b273b]/80 border border-white/10 font-mono">
                <span className="material-symbols-outlined text-[#ffb703] text-[16px] animate-pulse">timer</span>
                <span className="text-[11px] text-[#ffdba0] font-bold">
                  {formatTime(state.timeLeftSeconds)}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#ffdba0] text-[#422c00] flex items-center justify-center font-bold text-xs shadow-md">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body Dossier */}
        <div className="flex flex-col w-full px-4 pt-3 flex-1 justify-between">
          
          <div className="flex flex-col">
            {/* Status Chip & Secret Badge */}
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201d30] border border-[#00eefc]/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
                <span className="font-mono text-[10px] text-[#00eefc] tracking-widest uppercase font-bold">
                  GİZLİ BRİFİNG // SANA ÖZEL
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#ffb703]">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                <span className="font-mono text-[10px] tracking-wider uppercase text-[#d5c4ac] font-bold">
                  ŞİFRELİ KANAL
                </span>
              </div>
            </div>

            {/* Hero Role Holographic Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#1c192c] p-4 mb-3 shadow-xl border border-white/10">
              {/* Ambient glowing backdrop effect */}
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#ffb703]/15 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-12 bottom-0 w-44 h-44 rounded-full bg-[#00eefc]/10 blur-2xl pointer-events-none"></div>
              
              <div className="relative flex flex-col items-center text-center">
                {/* Tactical Commander Compass HUD Visual */}
                <div className="relative w-36 h-36 flex items-center justify-center my-1">
                  {/* Circular Sonar Grid Layers */}
                  <svg className="absolute inset-0 w-full h-full text-[#00eefc]/25 animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="46" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1"></circle>
                    <circle cx="50" cy="50" fill="none" r="34" stroke="currentColor" strokeWidth="0.75"></circle>
                    <circle cx="50" cy="50" fill="none" r="20" stroke="currentColor" strokeDasharray="2 2" strokeWidth="0.5"></circle>
                    <line stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.75" x1="50" x2="50" y1="4" y2="96"></line>
                    <line stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.75" x1="4" x2="96" y1="50" y2="50"></line>
                  </svg>
                  
                  {/* Sonar Sweep Pulse Wave */}
                  <div className="absolute w-28 h-28 rounded-full bg-[#00eefc]/10 animate-ping" style={{ animationDuration: '3.5s' }}></div>
                  
                  {/* Gold Compass Rose Node */}
                  <div className="relative z-10 w-24 h-24 rounded-full bg-[#363246] shadow-[0_4px_16px_rgba(255,183,3,0.35)] border border-[#ffb703]/40 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#201d30] flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-[44px] text-[#ffba27] drop-shadow-[0_2px_8px_rgba(255,186,39,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        explore
                      </span>
                    </div>
                    {/* Orbiting telemetry pip */}
                    <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_8px_#00eefc]"></div>
                  </div>
                  {/* Tactical Depth Markers */}
                  <span className="absolute bottom-0 right-1 font-mono text-[9px] text-[#00eefc]/80 tracking-tighter">
                    BATIMETRİ // 840m
                  </span>
                </div>

                {/* Role Designation Headers */}
                <span className="font-mono text-[10px] text-[#ffdba0] tracking-widest uppercase mb-1 mt-1 font-bold">
                  KİLİTLİ GÖREV ATAMASI
                </span>
                <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight mb-2">
                  DÜMENCİSİN <span className="text-[#ffb703]">(KILAVUZ)</span>
                </h2>

                {/* Narrative Mission Summary Box */}
                <div className="rounded-xl bg-[#201d30] px-3.5 py-2.5 mt-1 text-left shadow-inner border border-white/5 w-full">
                  <p className="font-manrope text-xs text-[#d5c4ac] leading-relaxed">
                    Harita ve sonar verileri yalnızca sende. <strong className="text-[#ffb703] font-semibold">Makinist dış dünyayı görmez</strong>; senin koordinatlarına göre vanaları ve motorları yönetir.
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Core Directives */}
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] text-[#00eefc] uppercase tracking-wider font-bold">
                  TEMEL PROTOKOL TALİMATLARI
                </span>
                <span className="font-mono text-[9px] text-[#d5c4ac]">3 ÖNCELİKLİ GÖREV</span>
              </div>

              {/* Protocol Item 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[#00eefc]/15 flex items-center justify-center shrink-0 border border-[#00eefc]/30">
                  <span className="material-symbols-outlined text-[22px] text-[#00eefc]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    radar
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[9px] text-[#00eefc] font-bold px-1 rounded bg-[#00eefc]/10">FAZ 01</span>
                    <h3 className="font-sora text-xs text-white font-bold truncate">Sonar Yankısını Oku</h3>
                  </div>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal">
                    Kayalıkları ve batıkları tespit et, açıları ve rotayı anlık olarak telsizden bildir.
                  </p>
                </div>
              </div>

              {/* Protocol Item 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[#ffb703]/15 flex items-center justify-center shrink-0 border border-[#ffb703]/30">
                  <span className="material-symbols-outlined text-[22px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    valve
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[9px] text-[#ffb703] font-bold px-1 rounded bg-[#ffb703]/10">FAZ 02</span>
                    <h3 className="font-sora text-xs text-white font-bold truncate">Balast Sırasını İlet</h3>
                  </div>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal">
                    Su tahliye basınç dizisini telsizden söyle, denge kaybını engelle.
                  </p>
                </div>
              </div>

              {/* Protocol Item 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[#00eefc]/15 flex items-center justify-center shrink-0 border border-[#00eefc]/30">
                  <span className="material-symbols-outlined text-[22px] text-[#00eefc]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    alt_route
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[9px] text-[#00eefc] font-bold px-1 rounded bg-[#00eefc]/10">FAZ 03</span>
                    <h3 className="font-sora text-xs text-white font-bold truncate">Kaçış Rotasını Çiz</h3>
                  </div>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal">
                    Kurtarma kapsülü için güvenli derinlik koridorunu belirle ve makiniste kılavuzluk yap.
                  </p>
                </div>
              </div>
            </div>

            {/* Tactical Partner Status Telemetry Card */}
            <div className="rounded-xl bg-[#1c192c] p-3 mb-3 shadow-md border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg bg-[#363246] flex items-center justify-center shrink-0 border border-white/10">
                    <span className="material-symbols-outlined text-[#ffba27] text-[22px]">engineering</span>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#00eefc] flex items-center justify-center shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#141123]"></span>
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-[9px] text-[#00eefc] tracking-wider uppercase font-bold">
                      MÜRETTEBAT EŞLEŞMESİ
                    </span>
                    <p className="font-manrope text-xs text-white font-medium truncate">
                      Makinist basınç odasında hazır bekliyor
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#ffb703] text-[18px] animate-pulse shrink-0">
                  wifi_tethering
                </span>
              </div>

              {/* Signal Integrity Segment Gauge */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
                <span className="font-mono text-[9px] text-[#9e8f78] uppercase">FREKANS GÜCÜ:</span>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-1.5 rounded-xs bg-[#00eefc]"></span>
                  <span className="w-3.5 h-1.5 rounded-xs bg-[#00eefc]"></span>
                  <span className="w-3.5 h-1.5 rounded-xs bg-[#00eefc]"></span>
                  <span className="w-3.5 h-1.5 rounded-xs bg-[#00eefc]/30"></span>
                </div>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold ml-auto">98.4 kHz</span>
              </div>
            </div>
          </div>

          {/* Primary Arcade Action Button */}
          <button
            onClick={onConfirmRole}
            className="w-full relative group cursor-pointer select-none rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] p-4 text-[#271900] font-sora text-sm font-extrabold tracking-wide uppercase transition-all duration-150 active:translate-y-1 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.35)] active:shadow-[0_2px_0_#6b4b00,0_4px_12px_rgba(255,183,3,0.2)] flex items-center justify-center gap-2 overflow-hidden"
            type="button"
          >
            <span className="absolute inset-x-0 top-0 h-1/2 bg-white/20 pointer-events-none rounded-t-xl"></span>
            <span className="material-symbols-outlined text-[22px] text-[#271900] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>radio</span>
            <span className="truncate">ROLÜMÜ ANLADIM & TELSİZE BAĞLAN</span>
            <span className="material-symbols-outlined text-[18px] text-[#271900] group-hover:translate-x-1 transition-transform shrink-0">chevron_right</span>
          </button>

        </div>
      </div>
    );
  }

  // Fallback / Space Mode (Kayıp Sinyal)
  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#0A0D18] text-slate-100 relative flex flex-col justify-between overflow-hidden rounded-[40px] shadow-2xl border border-slate-800/80 antialiased p-0 select-none animate-fadeIn">
      
      {/* Background Graphic Hero Artwork */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-[480px] bg-gradient-to-b from-amber-600/25 via-blue-900/30 to-transparent blur-3xl"></div>
        <div className="absolute -top-24 right-[-10%] w-72 h-72 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-800/40 blur-2xl"></div>
        <div className="absolute top-28 -right-16 w-64 h-64 border border-dashed border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '28s' }}></div>
        <div className="absolute top-36 -right-8 w-48 h-48 rounded-full border border-cyan-500/20"></div>
        <div className="absolute top-48 right-16 w-20 h-20 rounded-full border border-cyan-400/30"></div>
        
        {/* Hero Character Portlet */}
        <div className="absolute top-10 inset-x-0 h-[360px] flex flex-col justify-start items-center opacity-95 pointer-events-none">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mt-2 rounded-full p-1 bg-gradient-to-b from-amber-400 via-amber-600/40 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.45)] border-amber-300/80 border">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLbCVA7kytNnSKo-gaPE6NKFjpPbQRs2t25Ai3LLzN9z6Rs1jEhpygEPnnSIHuuVKNygcTWw7VWm1YfzXqvbYdp_OiQgaVWlkvpQM_u5T136mUlSKgIyXW-cLODBk_uj5ROs4BYSAYZfWN01cu1lH-RjGhCz3Cb6kqMKU1dNETrWmg4gKa3ED9YpA3HwDUSxH7gHneqXsRfTAXrkkKQI1k8ooNGS7rglu29_COf2U" 
              alt="Kaptan Portresi" 
              className="w-full h-full object-cover rounded-full shadow-inner"
            />
            <div className="absolute inset-0 rounded-full border border-amber-300/40 pointer-events-none"></div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/30 via-[#0A0D18]/80 to-[#0A0D18]"></div>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col justify-between min-h-[calc(100vh-80px)] px-5 pt-3 pb-6">
        
        {/* TopBar */}
        <header className="flex items-center justify-between w-full pt-1">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
              <div className="absolute inset-0 border border-amber-300/80 rounded-full rotate-[32deg] scale-x-125 scale-y-75"></div>
            </div>
            <span className="text-sm tracking-[0.2em] font-extrabold uppercase text-white drop-shadow font-sora">
              PARTYVERSE
            </span>
          </div>

          <div className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-md flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </div>
        </header>

        {/* Hero Role Dossier */}
        <section className="flex flex-col items-center text-center mt-36 sm:mt-40 mb-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#181C2E]/90 border border-amber-500/70 shadow-[0_0_14px_rgba(245,158,11,0.35)] backdrop-blur-md mb-2.5">
            <span className="material-symbols-outlined text-[14px] text-amber-300">lock</span>
            <span className="text-xs font-bold tracking-wider text-amber-300 uppercase font-mono">
              Sana Özel
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase scale-y-105 font-sora bg-gradient-to-b from-[#FFF6C4] via-[#FFD043] to-[#B45309] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.45)]">
            KAPTANSIN
          </h1>

          <div className="mt-2 text-sm sm:text-base font-medium text-slate-300 leading-snug">
            <p>Prosedürler sende.</p>
            <p className="text-slate-400 font-normal">Ölçümler mühendiste.</p>
          </div>
        </section>

        {/* 3 Tactical Tasks for Captain */}
        <section className="space-y-2.5 my-2">
          <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0F1424]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span className="material-symbols-outlined text-amber-400 text-[22px]">troubleshoot</span>
            </div>
            <div className="flex-1 text-left pr-1">
              <h2 className="text-sm font-semibold text-white tracking-wide font-sora">Arızayı yorumla</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">Gelen verileri değerlendir ve sorunun kaynağını bul.</p>
            </div>
          </div>

          <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0F1424]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-amber-950/30 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span className="material-symbols-outlined text-amber-400 text-[22px]">bolt</span>
            </div>
            <div className="flex-1 text-left pr-1">
              <h2 className="text-sm font-semibold text-white tracking-wide font-sora">Enerjiyi onayla</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">Reaktör ayarlarını kontrol et ve onay ver.</p>
            </div>
          </div>

          <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0F1424]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span className="material-symbols-outlined text-amber-400 text-[22px]">explore</span>
            </div>
            <div className="flex-1 text-left pr-1">
              <h2 className="text-sm font-semibold text-white tracking-wide font-sora">Rotayı belirle</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">Kurtarma gemisini seç ve güvenli tahliye rotasını başlat.</p>
            </div>
          </div>
        </section>

        {/* Partner Status and Action Footer */}
        <footer className="mt-2 space-y-3">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0C101D] border border-slate-800/90 shadow-inner">
            <div className="relative w-12 h-12 rounded-full bg-slate-900 border border-slate-700/80 flex flex-col items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px] text-slate-400">person</span>
              <div className="absolute -bottom-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '200ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 font-sora">
                <span>Mühendisin hazırlanıyor.</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Kısa süre içinde görevi birlikte başlatacaksınız.
              </p>
            </div>
          </div>

          <button
            onClick={onConfirmRole}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-[#FFDD55] via-[#FFB020] to-[#EA580C] shadow-[0_6px_0_#9A3412,0_10px_25px_rgba(249,115,22,0.45)] text-slate-950 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer transition-all"
            type="button"
          >
            <span className="font-black tracking-wide text-base sm:text-lg uppercase font-sora">
              Rolümü anladım
            </span>
            <span className="material-symbols-outlined text-[22px] font-black">
              arrow_forward
            </span>
          </button>
        </footer>

      </div>
    </div>
  );
};
