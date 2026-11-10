import React from 'react';
import { MissionState } from '../../types/game';
import { ScreenKarantinaSecRole } from './karantina/ScreenKarantinaSecRole';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const Screen04EngineerRole: React.FC<Props> = ({ state, onConfirmRole }) => {
  const isKarantina = state.operationTheme === 'karantina_2088';
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';

  if (isKarantina) {
    return <ScreenKarantinaSecRole state={state} onConfirmRole={onConfirmRole} />;
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If Gölge Protokolü is chosen, render the exact official Gölge Hacker assignment card
  if (isGolgeProtokolu) {
    return (
      <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#141123] text-[#e6dff9] relative flex flex-col justify-between overflow-hidden rounded-[40px] shadow-2xl border border-[#2b273b] antialiased select-none animate-fadeIn font-sans pb-6">
        
        {/* Fixed Top Bar */}
        <header className="w-full pt-4 px-4 bg-[#141123]/80 backdrop-blur-xl border-b border-white/5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2b273b] text-[#00eefc] border border-white/5 shadow-inner">
                <span className="material-symbols-outlined text-[20px]">terminal</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-[#ffb703] tracking-widest uppercase font-bold">
                  GÖLGE PROTOKOLÜ // SİBER OPERASYON
                </span>
                <h1 className="font-sora text-sm text-white font-bold tracking-tight uppercase leading-none">
                  Konsol Terminali
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2b273b]/80 border border-white/10 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse"></span>
                <span className="text-[10px] text-[#00eefc] font-bold">
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
            {/* Confidentiality Protocol Banner */}
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201d30] border border-[#ffb703]/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-ping"></span>
                <span className="font-mono text-[10px] text-[#ffdba0] tracking-widest uppercase font-bold">
                  SANA ÖZEL GİZLİ DOKÜMAN
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#0f0c1e] px-2.5 py-0.5 rounded-full border border-white/5">
                <span className="material-symbols-outlined text-[14px] text-[#00eefc]">terminal</span>
                <span className="font-mono text-[10px] text-[#00eefc] font-bold tracking-wider">
                  KOD ADI: NETRUNNER
                </span>
              </div>
            </div>

            {/* Hero Role Dossier Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#1c192c] p-3 shadow-xl border border-white/10 mb-3">
              {/* Cyber Visual Stage */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#0f0c1e] mb-3 flex items-center justify-center shadow-inner border border-white/5">
                <img 
                  className="w-full h-full object-cover object-center" 
                  alt="Gölge Hacker" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGCys5don7Poe4bz7VyE-7lh-YtcyAhSmgxYeor26aq82Z1O1Mnx2l0YlezrLvFLSo-b7u29MND8itQdfDVK7xXF3T4MntdKyZNTPovW8NAWqNhtFupHdkKn3MU-X9CO4nmnMpCyq547MukPZ0Eyr3A9zq6cO7dz4h0kusV68lJipoZ6LzjV696JE2CmglQ48ODS-qM5pnUKzVsOe17qLUYMBQ3C0nhdWTOmGAnkU"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c192c] via-transparent to-transparent"></div>

                {/* Telemetry Floating Overlays */}
                <div className="absolute top-2 left-2 bg-[#0f0c1e]/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md border border-white/5">
                  <span className="material-symbols-outlined text-[#00eefc] text-[14px]">visibility_off</span>
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-widest uppercase font-bold">GİZLİ ATAMA #04</span>
                </div>
                <div className="absolute top-2 right-2 bg-[#0f0c1e]/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]"></span>
                  <span className="font-mono text-[9px] text-[#00eefc] tracking-wider uppercase font-bold">GECİKME: 4ms</span>
                </div>

                {/* Live Sync Metric Wave */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-[#201d30]/90 backdrop-blur-lg px-2.5 py-1 rounded-lg border border-white/5 shadow-md">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#ffb703] text-[15px]">hub</span>
                    <span className="font-mono text-[9px] text-white uppercase font-bold">NÖRAL MATRİKS: SENKRON</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 rounded bg-[#00eefc]"></span>
                    <span className="w-1 h-4 rounded bg-[#00eefc]"></span>
                    <span className="w-1 h-2 rounded bg-[#00eefc]"></span>
                    <span className="w-1 h-4.5 rounded bg-[#ffb703]"></span>
                    <span className="w-1 h-2.5 rounded bg-[#00eefc]"></span>
                  </div>
                </div>
              </div>

              {/* Title & Identity Brief */}
              <div className="flex flex-col gap-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] text-[#ffba27] tracking-widest uppercase bg-[#2b273b] px-2 py-0.5 rounded font-bold">
                    SİBER BRİFİNG
                  </span>
                  <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider">
                    // ROL PROTOKOLÜ
                  </span>
                </div>
                <h2 className="font-sora text-xl font-extrabold text-white uppercase tracking-tight flex items-center justify-between">
                  GÖLGE HACKERSIN
                  <span className="text-[#ffb703] text-xs font-mono">(SİSTEM UZMANI)</span>
                </h2>
              </div>
              <p className="font-manrope text-xs text-[#d5c4ac] leading-relaxed">
                Sunucu mimarisi, güvenlik duvarları ve kamera döngüleri yalnızca senin ekranında. Sahadaki ajanın gözü kulağı sensin; ona lazer koordinatlarını ve kapı bypass şifrelerini telsizden aktar.
              </p>
            </div>

            {/* Operational Core Protocols */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="font-mono text-[10px] text-[#ffba27] tracking-wider uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">tune</span>
                3 TEMEL OPERASYON PROTOKOLÜ
              </span>
              <span className="font-mono text-[9px] text-[#9e8f78]">3 ADIM // KRİTİK</span>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              {/* Protocol 1 */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-9 h-9 rounded-lg bg-[#0f0c1e] flex-shrink-0 flex items-center justify-center text-[#00eefc] shadow-inner">
                  <span className="material-symbols-outlined text-[20px]">vpn_key</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sora text-xs text-[#00eefc] font-bold uppercase">Güvenlik Duvarı Bypass</h3>
                    <span className="font-mono text-[9px] text-[#ffb703] bg-[#0f0c1e] px-1.5 py-0.5 rounded">FAZ 01</span>
                  </div>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal mt-0.5">
                    Subnet portlarını ve sinyal frekanslarını sahadaki ajanın erişim kartına senkronize et.
                  </p>
                </div>
              </div>

              {/* Protocol 2 */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-9 h-9 rounded-lg bg-[#0f0c1e] flex-shrink-0 flex items-center justify-center text-[#ffba27] shadow-inner">
                  <span className="material-symbols-outlined text-[20px]">pattern</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sora text-xs text-[#ffba27] font-bold uppercase">Lazer Sensör Körleme</h3>
                    <span className="font-mono text-[9px] text-[#ffb703] bg-[#0f0c1e] px-1.5 py-0.5 rounded">FAZ 02</span>
                  </div>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal mt-0.5">
                    Koridordaki ızgara lazerlerin kapanma periyotlarını hesapla ve ajana adım zamanlamasını söyle.
                  </p>
                </div>
              </div>

              {/* Protocol 3 */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-9 h-9 rounded-lg bg-[#0f0c1e] flex-shrink-0 flex items-center justify-center text-[#00eefc] shadow-inner">
                  <span className="material-symbols-outlined text-[20px]">lock_open</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sora text-xs text-[#00eefc] font-bold uppercase">Kasa Şifre Çözümü</h3>
                    <span className="font-mono text-[9px] text-[#ffb703] bg-[#0f0c1e] px-1.5 py-0.5 rounded">FAZ 03</span>
                  </div>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal mt-0.5">
                    Çok katmanlı şifrelemeyi kırıp nihai çekirdek anahtarını üret.
                  </p>
                </div>
              </div>
            </div>

            {/* Field Partner Telemetry Card */}
            <div className="rounded-xl bg-[#0f0c1e] p-3 mb-3 shadow-lg border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2b273b] flex items-center justify-center border border-[#00eefc]/30">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Sahadaki Ajan" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhDAz7ojM5jXB_V1b9RjaCKjqFZqDtMfMxiorWj5aWpdgxel9q6_dYK7E1NaqL-SoRrnchk-nrXHzaQCw9eUb3aK0_G3jp7z49szdy6gxlVn56R2dwnK_SVQSwSJG5gmQmkcFXDWHYygNRklDyUk2f0y0_PUQKuhLJ1KU4169rteCDpGzMzH8-lCii2gzj9suLqOUlbmMidqWh7PvtCbfxVlKP0-T7_okAEez6vj0"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_6px_#00eefc]"></span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[9px] text-[#9e8f78] uppercase tracking-wider font-bold">CANLI SAHA BAĞLANTISI</span>
                  <span className="font-sora text-xs text-white font-semibold truncate">
                    {state.captainName || 'Ajan Ece'}: Havalandırmada Bekliyor
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#201d30] px-2 py-1 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-[#00eefc] text-[15px] animate-pulse">mic</span>
                <span className="font-mono text-[9px] text-[#00eefc] font-bold">AKTİF</span>
              </div>
            </div>
          </div>

          {/* Primary Arcade Launch Action Shelf */}
          <button
            onClick={onConfirmRole}
            className="w-full relative group cursor-pointer select-none rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] p-4 text-[#271900] font-sora text-sm font-extrabold tracking-wide uppercase transition-all duration-150 active:translate-y-1 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.35)] active:shadow-[0_2px_0_#6b4b00,0_4px_12px_rgba(255,183,3,0.2)] flex items-center justify-between overflow-hidden"
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#271900]" style={{ fontVariationSettings: "'FILL' 1" }}>
                terminal
              </span>
              <span className="truncate">ROLÜMÜ ANLADIM & TERMİNALE SIZ</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#271900] group-hover:translate-x-1 transition-transform shrink-0">
              arrow_forward_ios
            </span>
          </button>
        </div>
      </div>
    );
  }

  // If Derin Basınç is chosen, render the exact official Derin Basınç Makinist assignment card
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
            {/* Confidentiality Protocol Banner */}
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201d30] border border-[#00eefc]/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00eefc] animate-ping"></span>
                <span className="font-mono text-[10px] text-[#00eefc] tracking-widest uppercase font-bold">
                  GİZLİ BRİFİNG // SANA ÖZEL
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#0f0c1e] px-2.5 py-0.5 rounded-full border border-white/5">
                <span className="material-symbols-outlined text-[14px] text-[#ffb703]">lock</span>
                <span className="font-mono text-[10px] text-[#ffba27] font-bold tracking-wider">
                  KOD: MKN-09
                </span>
              </div>
            </div>

            {/* Role Reveal Card (Tactical Engineering Badge) */}
            <div className="relative overflow-hidden rounded-2xl bg-[#201d30] p-3.5 shadow-xl border border-white/10 mb-3">
              {/* Atmospheric Ambient Glows */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#ffb703]/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#00eefc]/10 blur-2xl pointer-events-none"></div>

              {/* Illustrated Hero Badge */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#0f0c1e] mb-3 flex items-center justify-center shadow-inner border border-white/5">
                <img 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-85" 
                  alt="Makinist Taktik Rozeti" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxL1ES_2GAsXwawfmG8lmMHpDaBPKYMLC87yevDIeVH-tFaOn5KBlCYrj3Cf5v3aowj3onXzJt052Ou6mj2NDxLKK3VwpMAVyWso9HbCpLu6rVgOU3WSyMmzM6HDqvVUovn0iPGiGnNNW7D3yDcXv8dWq63ibKXATlr5zFpK5nAspwmvUV8d3l3jkt_2QH2fFxjk1GTvframNRKKoqQ0JZFm1D34sGxCBjdKZlNBY" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1e] via-[#0f0c1e]/30 to-transparent"></div>

                {/* Telemetry Overlay Grid & HUD elements */}
                <div className="absolute inset-x-3 top-2.5 flex justify-between items-center z-10">
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#201d30]/90 text-[#00eefc] border border-[#00eefc]/30 font-bold shadow-sm">
                    BASINÇ: 48.2 BAR
                  </span>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#ffb703] text-[#271900] font-black tracking-wider shadow-sm">
                    AKTİF DALIŞ
                  </span>
                </div>

                {/* Center Hologram Stamp Effect */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#201d30]/90 border border-[#00eefc]/40 flex items-center justify-center shadow-[0_4px_16px_rgba(0,238,252,0.35)]">
                    <span className="material-symbols-outlined text-[36px] text-[#ffba27]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      precision_manufacturing
                    </span>
                  </div>
                </div>

                {/* Segmented Status Bar bottom line */}
                <div className="absolute bottom-2 inset-x-4 flex gap-1 z-10">
                  <div className="h-1 flex-1 bg-[#00eefc] rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#00eefc] rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#00eefc] rounded-full"></div>
                  <div className="h-1 flex-1 bg-[#ffb703] rounded-full animate-pulse"></div>
                  <div className="h-1 flex-1 bg-[#363246] rounded-full"></div>
                </div>
              </div>

              {/* Title and Core Mission Statement */}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ffba27]">shield_with_heart</span>
                  <span className="font-mono text-[10px] text-[#9e8f78] tracking-wider uppercase font-bold">ATANAN ROL</span>
                </div>
                <h2 className="font-sora text-2xl font-extrabold text-white tracking-tight flex items-center justify-between">
                  MAKİNİSTSİN
                  <span className="font-mono text-[10px] bg-[#363246] text-[#ffdba0] px-2 py-0.5 rounded tracking-widest font-bold">
                    (DALGIÇ)
                  </span>
                </h2>
              </div>
              <p className="font-manrope text-xs text-[#d5c4ac] leading-relaxed">
                Mekanik kontroller ve vanalar yalnızca sende. Dümenci fiziksel düğmeleri göremez; sana telsizden ileteceği basınç ve açı değerlerine göre sistemi yönet.
              </p>
            </div>

            {/* Responsibilities Header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[17px]">build_circle</span>
                <span className="font-mono text-[10px] text-[#00eefc] uppercase tracking-wider font-bold">
                  GÖREV PROTOKOLÜ VE DİREKTİFLER
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#9e8f78]">3 FAZ</span>
            </div>

            {/* Key Responsibilities List (Cards) */}
            <div className="flex flex-col gap-2 mb-3">
              {/* Item 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[#2b273b] flex-shrink-0 flex items-center justify-center border border-[#00eefc]/30 shadow-inner">
                  <span className="material-symbols-outlined text-[#00eefc] text-[22px]">valve</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-[#00eefc] font-bold px-1 rounded bg-[#00eefc]/10">01. PROTOKOL</span>
                  </div>
                  <h3 className="font-sora text-xs text-white font-bold tracking-tight mt-0.5 mb-0.5">
                    Balast Vanalarını Çevir
                  </h3>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal">
                    Dümencinin verdiği bar değerlerine göre hidroliği ayarla.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[#2b273b] flex-shrink-0 flex items-center justify-center border border-[#ffb703]/30 shadow-inner">
                  <span className="material-symbols-outlined text-[#ffba27] text-[22px]">plumbing</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-[#ffba27] font-bold px-1 rounded bg-[#ffb703]/10">02. PROTOKOL</span>
                  </div>
                  <h3 className="font-sora text-xs text-white font-bold tracking-tight mt-0.5 mb-0.5">
                    Basınç Sızıntısını Kapat
                  </h3>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal">
                    Aşırı yük binen kompartımanlara bypass hattı çek.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#201d30] border border-white/5 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-[#2b273b] flex-shrink-0 flex items-center justify-center border border-[#00eefc]/30 shadow-inner">
                  <span className="material-symbols-outlined text-[#00eefc] text-[22px]">battery_charging_full</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-[#00eefc] font-bold px-1 rounded bg-[#00eefc]/10">03. PROTOKOL</span>
                  </div>
                  <h3 className="font-sora text-xs text-white font-bold tracking-tight mt-0.5 mb-0.5">
                    Akü Hücrelerini Dengele
                  </h3>
                  <p className="font-manrope text-[11px] text-[#d5c4ac] leading-normal">
                    Elektroliz ünitelerini güvenli voltaja kitle.
                  </p>
                </div>
              </div>
            </div>

            {/* Partner Status Card */}
            <div className="rounded-xl bg-[#1c192c] p-3 mb-3 shadow-md border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00eefc]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px] text-[#00eefc]">radar</span>
                  </div>
                  <span className="font-mono text-[9px] text-white tracking-wide uppercase font-bold">
                    MÜRETTEBAT EŞLEŞMESİ
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#201d30] border border-[#00eefc]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-ping"></span>
                  <span className="font-mono text-[9px] text-[#00eefc] font-bold">BAĞLANDI</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative w-11 h-11 rounded-lg bg-[#363246] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 shadow-sm">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Dümenci" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVfvNnGeMahCJG7x9OlscLF3JgNRiUzADUT7u4wPBfSoofWw6qXO47emWj7VV3_Rq-VZ6tBdLttLDNBI0oU2IMhSEHlz6jTdwjPmZwRehNHO0oxUyJT-UwPYQsaK8LCJlEy4BOL3QbKdQDLSiKPpfGZjodQB9rlaLH6jDSBsJ1J8td0ACRDl4ldEBRRTB_rUIpPinz-bZ14vkTFEezEE3qvG1m1Q8wRK6BSFEOKqI" 
                  />
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-[#00eefc]"></div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-sora text-xs text-white font-bold truncate">
                    DÜMENCİ (KAPTAN KÖŞKÜ)
                  </span>
                  <p className="font-manrope text-[11px] text-[#00eefc] italic truncate">
                    Dümenci sonar başında koordinatları hazırlıyor
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Arcade Action Button */}
          <button
            onClick={onConfirmRole}
            className="w-full relative group cursor-pointer select-none rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] p-4 text-[#271900] font-sora text-sm font-extrabold tracking-wide uppercase transition-all duration-150 active:translate-y-1 shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.35)] active:shadow-[0_2px_0_#6b4b00,0_4px_12px_rgba(255,183,3,0.2)] flex items-center justify-between overflow-hidden"
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#271900]" style={{ fontVariationSettings: "'FILL' 1" }}>
                power_settings_new
              </span>
              <span className="truncate">ROLÜMÜ ANLADIM & KONSOLA GEÇ</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#271900] group-hover:translate-x-1 transition-transform shrink-0">
              arrow_forward_ios
            </span>
          </button>

        </div>
      </div>
    );
  }

  // Fallback / Space Mode (Kayıp Sinyal)
  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#120f24] text-white relative flex flex-col justify-between overflow-hidden rounded-[44px] shadow-2xl border border-[#272347] antialiased select-none animate-fadeIn font-sans">
      
      {/* Background Blueprint / Holo Grid Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#00eefc_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Top Cyan Radial Atmospheric Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00eefc]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col flex-1 pb-6 justify-between">
        
        {/* TopBar */}
        <header className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.7)]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <ellipse cx="12" cy="12" rx="7" ry="7"></ellipse>
                <ellipse cx="12" cy="12" rx="11" ry="3.8" transform="rotate(-30 12 12)"></ellipse>
              </svg>
            </div>
            <span className="font-black text-sm tracking-[0.2em] text-white uppercase drop-shadow-sm font-sora">
              PARTYVERSE
            </span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-[#1d1938]/80 border border-white/10 flex items-center space-x-1.5 text-xs text-cyan-300 font-mono">
            <span>🛰 AURORA-7</span>
          </div>
        </header>

        {/* Hero Character Section */}
        <section className="relative w-full h-[270px] flex items-center justify-center overflow-visible mt-1">
          <div className="absolute inset-0 mx-4 rounded-3xl overflow-hidden bg-gradient-to-b from-[#14122d] via-[#101c38] to-[#0c0a1a] border border-cyan-500/20">
            <div className="absolute -top-12 -right-8 w-56 h-56 rounded-full bg-gradient-to-bl from-cyan-400/30 via-indigo-600/20 to-transparent blur-md"></div>
            <div className="absolute top-8 left-4 w-32 h-32 rounded-full border border-cyan-400/20 pointer-events-none"></div>
            <div className="absolute top-12 left-8 w-24 h-24 rounded-full border border-dashed border-cyan-400/30 animate-spin pointer-events-none" style={{ animationDuration: '30s' }}></div>
            <svg className="absolute top-2 right-2 w-44 h-44 text-cyan-400/30 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 200 200">
              <rect height="40" rx="4" strokeDasharray="2 3" width="60" x="20" y="20"></rect>
              <circle cx="120" cy="50" r="28"></circle>
              <circle cx="120" cy="50" r="10"></circle>
              <path d="M 80 40 L 92 40 L 100 50 L 120 50"></path>
              <path d="M 120 78 L 120 110 L 150 110"></path>
              <circle cx="150" cy="110" fill="currentColor" r="3"></circle>
              <path d="M 40 60 L 40 100 L 70 130"></path>
              <circle cx="70" cy="130" fill="currentColor" r="2.5"></circle>
            </svg>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#120f24] via-[#120f24]/85 to-transparent"></div>
          </div>

          <div className="relative z-10 w-52 h-52 flex items-center justify-center transform translate-y-1">
            <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(0,238,252,0.35)]">
              <img 
                alt="Mühendis Mert" 
                className="w-full h-full object-cover object-top select-none" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoeQN2pLWf8Xj8TxKoQJTTjpc9CsSHTF5JxwfmESK0bsLl_Kyh6Iux2FofuEtAWJigxSdB3vVnrkTLj6hpBR59wJ-lzOi-ZYd2q6m5lU7yOlMZ6lvzGFY2r5Tp3yffa2XhDCZ2SykuiFajBooH6M_buYGjfh8bol08jD3Fc0bAjP_jT3sdW2u61qvqBk2uo1DrqLaecld0x7BSi6bHLhJudQW63uoFwue1Te-7sj8" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120f24] via-transparent to-transparent opacity-60 pointer-events-none"></div>
              <div className="absolute inset-0 border border-cyan-300/30 rounded-3xl pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Role Identity Title Section */}
        <section className="flex flex-col items-center text-center -mt-4 z-20 px-6">
          <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-[#2a1d0f] via-[#452e0e] to-[#2a1d0f] border border-[#ffb703]/70 shadow-[0_0_16px_rgba(255,183,3,0.25)] mb-2">
            <svg className="w-3.5 h-3.5 text-[#ffb703]" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 00-7.5 0v3h7.5z" fillRule="evenodd"></path>
            </svg>
            <span className="text-[11px] font-black tracking-widest text-[#ffb703] uppercase font-mono">
              SANA ÖZEL
            </span>
          </div>

          <h1 className="text-4xl sm:text-[42px] font-sora font-extrabold uppercase tracking-wide bg-gradient-to-b from-[#f0fdff] via-[#8df9ff] to-[#00c8e0] bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(0,238,252,0.55)] leading-tight">
            MÜHENDİSSİN
          </h1>
          <p className="text-sm font-medium text-slate-300/95 tracking-wide mt-1">
            Ölçümler sende. Prosedürler kaptanda.
          </p>
        </section>

        {/* 3 Structured Responsibility Cards */}
        <section className="mt-3 px-5 space-y-2.5">
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141227]/90 border border-cyan-400/25 backdrop-blur-md shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#0a1e30] border border-cyan-400/50 flex-shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.45)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="text-sm font-bold text-white tracking-wide font-sora">
                Ölçümleri oku
              </h2>
              <p className="text-[12px] leading-snug text-slate-300">
                Sensör, frekans ve reaktör değerlerini kaptana aktar.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141227]/90 border border-cyan-400/25 backdrop-blur-md shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#0a1e30] border border-cyan-400/50 flex-shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.45)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="4" x2="4" y1="21" y2="14"></line>
                <line x1="4" x2="4" y1="10" y2="3"></line>
                <line x1="12" x2="12" y1="21" y2="12"></line>
                <line x1="12" x2="12" y1="8" y2="3"></line>
                <line x1="20" x2="20" y1="21" y2="16"></line>
                <line x1="20" x2="20" y1="12" y2="3"></line>
                <line x1="1" x2="7" y1="14" y2="14"></line>
                <line x1="9" x2="15" y1="8" y2="8"></line>
                <line x1="17" x2="23" y1="16" y2="16"></line>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="text-sm font-bold text-white tracking-wide font-sora">
                Sistemleri yönet
              </h2>
              <p className="text-[12px] leading-snug text-slate-300">
                Kaptanın talimatlarına göre vanaları ve kabloları bağla.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141227]/90 border border-cyan-400/25 backdrop-blur-md shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#0a1e30] border border-cyan-400/50 flex-shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(0,238,252,0.45)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="text-sm font-bold text-white tracking-wide font-sora">
                Enerjiyi paylaştır
              </h2>
              <p className="text-[12px] leading-snug text-slate-300">
                Hat kayıplarını hesaplayıp reaktör dengesini kur.
              </p>
            </div>
          </div>
        </section>

        {/* Partner Status Strip */}
        <section className="mt-3 px-5">
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#1a162b]/90 border border-amber-500/25 shadow-md">
            <div className="relative w-12 h-12 rounded-full bg-[#201c38] border border-amber-500/40 flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400/90" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2a8 8 0 0 0-8 8v3a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6v-3a8 8 0 0 0-8-8Z"></path>
                <path d="M8 11h8a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-1a2 2 0 0 1 2-2Z"></path>
                <line x1="9" x2="15" y1="22" y2="22"></line>
              </svg>
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#120f24] rounded-full"></span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white tracking-wide font-sora">
                Kaptanın hazırlanıyor.
              </h3>
              <p className="text-[11.5px] leading-snug text-slate-300">
                Telsiz bağlantısı kuruldu, görev brifingi bekleniyor.
              </p>
              
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]/70 animate-pulse" style={{ animationDelay: '200ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703]/40 animate-pulse" style={{ animationDelay: '400ms' }}></span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <footer className="mt-4 px-5 pt-1">
          <button 
            onClick={onConfirmRole}
            className="w-full h-14 rounded-2xl bg-gradient-to-b from-[#ffcf25] via-[#f59e0b] to-[#d97706] shadow-[0_8px_0_#b45309,0_12px_25px_rgba(251,191,36,0.38),inset_0_2px_2px_rgba(255,255,255,0.6)] active:translate-y-1 active:shadow-[0_4px_0_#b45309] flex items-center justify-center space-x-2 text-stone-950 font-black text-lg tracking-wide uppercase transition-transform select-none cursor-pointer" 
            type="button"
          >
            <span className="drop-shadow-sm font-extrabold tracking-wider font-sora">
              Rolümü anladım
            </span>
            <svg className="w-5 h-5 text-stone-950 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </footer>

      </div>

      {/* Bottom Home Indicator Bar (iOS Style) */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mb-2 pointer-events-none"></div>
    </div>
  );
};
