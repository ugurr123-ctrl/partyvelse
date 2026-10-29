import React from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onConfirmRole: () => void;
}

export const Screen03CaptainRole: React.FC<Props> = ({ state, onConfirmRole }) => {
  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[920px] bg-[#0A0D18] text-slate-100 relative flex flex-col justify-between overflow-hidden rounded-[40px] shadow-2xl border border-slate-800/80 antialiased p-0 select-none animate-fadeIn">
      
      {/* Background Graphic Hero Artwork */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep space ambient glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-[480px] bg-gradient-to-b from-amber-600/25 via-blue-900/30 to-transparent blur-3xl"></div>
        {/* Distant planetary orb & atmosphere */}
        <div className="absolute -top-24 right-[-10%] w-72 h-72 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-800/40 blur-2xl"></div>
        {/* Holographic Sci-Fi HUD rings & targeting reticles */}
        <div className="absolute top-28 -right-16 w-64 h-64 border border-dashed border-amber-500/30 rounded-full animate-spin" style={{ animationDuration: '28s' }}></div>
        <div className="absolute top-36 -right-8 w-48 h-48 rounded-full border border-amber-500/20"></div>
        <div className="absolute top-48 right-16 w-20 h-20 rounded-full border border-amber-400/30"></div>
        
        {/* Hero Character Vector Silhouette & Flight Suit Glow Artwork */}
        <div className="absolute top-10 inset-x-0 h-[360px] flex flex-col justify-start items-center opacity-95 pointer-events-none">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mt-2 rounded-full p-1 bg-gradient-to-b from-amber-400 via-amber-600/40 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.45)] border border-amber-300/80">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLbCVA7kytNnSKo-gaPE6NKFjpPbQRs2t25Ai3LLzN9z6Rs1jEhpygEPnnSIHuuVKNygcTWw7VWm1YfzXqvbYdp_OiQgaVWlkvpQM_u5T136mUlSKgIyXW-cLODBk_uj5ROs4BYSAYZfWN01cu1lH-RjGhCz3Cb6kqMKU1dNETrWmg4gKa3ED9YpA3HwDUSxH7gHneqXsRfTAXrkkKQI1k8ooNGS7rglu29_COf2U" 
              alt="Kaptan Portresi" 
              className="w-full h-full object-cover rounded-full shadow-inner"
            />
            <div className="absolute inset-0 rounded-full border border-amber-300/40 pointer-events-none"></div>
          </div>
        </div>

        {/* Vignette and dark gradient bottom mask for content clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070913]/30 via-[#0A0D18]/80 to-[#0A0D18]"></div>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col justify-between min-h-[920px] px-5 pt-3 pb-6">
        
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
        </header>

        {/* Hero Role Dossier */}
        <section className="flex flex-col items-center text-center mt-36 sm:mt-40 mb-3">
          {/* Private Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#181C2E]/90 border border-amber-500/70 shadow-[0_0_14px_rgba(245,158,11,0.35)] backdrop-blur-md mb-2.5">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" fillRule="evenodd"></path>
            </svg>
            <span className="text-xs font-bold tracking-wider text-amber-300 uppercase font-mono">Sana Özel</span>
          </div>

          {/* Role Title Headline */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase scale-y-105 font-sora bg-gradient-to-b from-[#FFF6C4] via-[#FFD043] to-[#B45309] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.45)]">
            KAPTANSIN
          </h1>

          {/* Role Instruction Tagline */}
          <div className="mt-2 text-sm sm:text-base font-medium text-slate-300 leading-snug">
            <p>Prosedürler sende.</p>
            <p className="text-slate-400 font-normal">Ölçümler mühendiste.</p>
          </div>
        </section>

        {/* 3 Tactical Tasks for the Captain */}
        <section className="space-y-2.5 my-2">
          {/* Task 1: Diagnose */}
          <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0F1424]/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M12 6a6 6 0 0 1 6 6" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle cx="12" cy="12" fill="currentColor" r="2.5"></circle>
                <path d="M12 12L7 17" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <div className="flex-1 text-left pr-1">
              <h2 className="text-sm font-semibold text-white tracking-wide font-sora">Arızayı yorumla</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">Gelen verileri değerlendir ve sorunun kaynağını bul.</p>
            </div>
          </div>

          {/* Task 2: Confirm Energy */}
          <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0F1424]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-amber-950/30 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"></path>
              </svg>
            </div>
            <div className="flex-1 text-left pr-1">
              <h2 className="text-sm font-semibold text-white tracking-wide font-sora">Enerjiyi onayla</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">Reaktör ayarlarını kontrol et ve onay ver.</p>
            </div>
          </div>

          {/* Task 3: Route Selection */}
          <div className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#0F1424]/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-md backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L3 20L12 16.5L21 20L12 2Z"></path>
              </svg>
            </div>
            <div className="flex-1 text-left pr-1">
              <h2 className="text-sm font-semibold text-white tracking-wide font-sora">Rotayı seç</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">İstasyonu güvenli bölgeye yönlendir.</p>
            </div>
          </div>
        </section>

        {/* Partner Status and Action Footer */}
        <footer className="mt-2 space-y-3">
          {/* Co-op Partner Status Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0C101D] border border-slate-800/90 shadow-inner">
            <div className="relative w-12 h-12 rounded-full bg-slate-900 border border-slate-700/80 flex flex-col items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <circle cx="12" cy="11" r="7" strokeLinecap="round"></circle>
                <path d="M7 11c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 4-5 4-5-1.2-5-4z" fill="#1E293B" stroke="none"></path>
                <path d="M6 18c0-1.8 2.7-3 6-3s6 1.2 6 3" strokeLinecap="round"></path>
              </svg>
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

          {/* Arcade Primary Action Button */}
          <button
            onClick={onConfirmRole}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-[#FFDD55] via-[#FFB020] to-[#EA580C] shadow-[0_6px_0_#9A3412,0_10px_25px_rgba(249,115,22,0.45),inset_0_1px_2px_rgba(255,255,255,0.65)] active:translate-y-1 active:shadow-[0_2px_0_#9A3412] flex items-center justify-center gap-2 cursor-pointer transition-all"
            type="button"
          >
            <span className="text-slate-950 font-black tracking-wide text-base sm:text-lg uppercase font-sora">
              Rolümü anladım
            </span>
            <svg className="w-5 h-5 text-slate-950 font-black" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </footer>

      </div>
    </div>
  );
};
