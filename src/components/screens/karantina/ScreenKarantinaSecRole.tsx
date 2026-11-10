import React from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const ScreenKarantinaSecRole: React.FC<Props> = ({ onConfirmRole }) => {
  const helmetImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBilizEiIffwr8XJlo7TIJXj8YT9b25-lSyE7dR5UXD_y4jzqLVjhwbW_6wkDhNrNYU-uJ00aJesQWO4eIh9ZgfNd0-W-YAH4O8rhQApqV-nTT1Xoli3xXbpJ17J1wv3wVkidJCKkAP7ZJfgG0D_6S_oIMUIlJUZMsmVDB_sIm97mOFpHgpQPiEFM140wKiSMww6CuRnIdl5o5VNHNSa6P796rVpjCqPr-cdchB0AU';

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-[calc(100vh-80px)] bg-[#110e1e] text-[#e6dff9] flex flex-col justify-between select-none font-sans pb-6 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141123]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ffb703] uppercase">
              <span>KARANTİNA 2088 // PROTOKOLÜ</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] text-cyan-300 font-bold">
                ● SEC-4
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Taktik Görev Günlüğü</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Dossier Content */}
      <main className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Confidential Document HUD Strip */}
        <div className="flex items-center justify-between bg-[#1c192c] border border-white/5 px-3 py-2 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb703] animate-pulse"></span>
            <span className="font-bold text-amber-300 uppercase">SANA ÖZEL // GİZLİ GÖREV DOSYASI</span>
          </div>
          <div className="flex items-center gap-1 text-[#9e8f78]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>KLASİFİYE</span>
          </div>
        </div>

        {/* Hero Role Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[#ffb703] font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>OYUNCU 2 VERİ PANELİ</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#ffb703] tracking-tight leading-none uppercase mt-0.5">
            GÜVENLİK ŞEFİSİN
          </h2>
          <p className="text-xs text-[#d5c4ac] mt-1.5 leading-relaxed">
            Sektör kilitleri ve hava vanaları sende. Kritik biyolojik formül verileri ise yalnız <strong className="text-white">Biyologda</strong> saklıdır.
          </p>
        </div>

        {/* Visual Dossier Card */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-amber-500/30 shadow-xl bg-[#0a0815]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${helmetImg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#110e1e] via-[#110e1e]/40 to-transparent"></div>

          {/* Overlays */}
          <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-amber-400/40 text-[9px] font-mono text-amber-300 font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">shield</span>
              PROTOKOL: ZIRHLI SAVUNMA
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold uppercase">
              ● HUD AKTİF
            </span>
          </div>

          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb703] text-[18px]">verified_user</span>
              <div>
                <span className="text-[9px] font-mono text-[#9e8f78] uppercase block">KONSOL: BULKHEAD-04</span>
                <span className="text-xs font-bold text-white uppercase">YETKİ DERECESİ: SEVİYE 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prioritized Tasks (ÖNCELİKLİ GÖREVLERİN, 3 ADIM) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold px-1">
            <span className="text-white uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">checklist</span>
              <span>ÖNCELİKLİ GÖREVLERİN</span>
            </span>
            <span className="text-cyan-400">3 ADIM</span>
          </div>

          {/* Adım 1 */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Hava Kilitlerini Mühürle</span>
                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[8px] font-mono font-bold uppercase">KRİTİK</span>
              </div>
              <p className="text-[11px] text-[#d5c4ac] leading-snug mt-0.5">
                Sektör B-4 basınç kapılarını mekanik kilit ile tut. Kontrol dışı sızmaları manuellerle engelle.
              </p>
            </div>
          </div>

          {/* Adım 2 */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">UV Izgarasını Yönet</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-mono font-bold uppercase">KOORDİNASYON</span>
              </div>
              <p className="text-[11px] text-[#d5c4ac] leading-snug mt-0.5">
                Biyoloğun telsizden aktaracağı frekansta UV sterilizasyon akımını aç ve koridoru yak.
              </p>
            </div>
          </div>

          {/* Adım 3 */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">valve</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Tahliye Vanalarını Boşalt</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold uppercase">MANUEL</span>
              </div>
              <p className="text-[11px] text-[#d5c4ac] leading-snug mt-0.5">
                Oluşan toksik biyolojik basınç birikimini ana istasyondan dış bacaya kontrollü yönlendir.
              </p>
            </div>
          </div>
        </div>

        {/* Partner Connection Bar */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
              <span className="material-symbols-outlined text-[16px]">biotech</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-white">ORTAK BAĞLANTISI: CANLI</div>
              <div className="text-[10px] text-[#9e8f78] truncate">Biyolog mikroskop başında • Bağlantı aktif</div>
            </div>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase">((•)) 99.4%</span>
        </div>

        {/* Confirm Role Action Button */}
        <button
          type="button"
          onClick={onConfirmRole}
          className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110 mt-1"
        >
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span>ROLÜMÜ ANLADIM &gt;</span>
        </button>

        <div className="text-center text-[10px] font-mono text-[#9e8f78] flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[12px]">info</span>
          <span>HER İKİ OYUNCU HAZIR OLUNCA GERİ SAYIM BAŞLAR</span>
        </div>
      </main>
    </div>
  );
};
