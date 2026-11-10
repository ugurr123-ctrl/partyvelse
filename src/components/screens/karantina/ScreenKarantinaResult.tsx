import React from 'react';
import { MissionState } from '../../../types/game';

interface Props {
  state: MissionState;
  onRestartGame: () => void;
  onBackToLobby?: () => void;
}

export const ScreenKarantinaResult: React.FC<Props> = ({
  state,
  onRestartGame,
  onBackToLobby,
}) => {
  const isSuccess = state.outcomeType === 'tam_basari' || (state.hullIntegrity > 0 && state.timeLeftSeconds > 0);
  const kData = state.karantinaData;

  const selinAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJxWZpXXTG3IVNha6Wp1S6HKkQeGKihQ-74RmrOmNT0qeJC5mB9zZj665TPHJPzyY-JpvmNMhw-Nr1ZJyzAgBoi7CA-lMBcFlO0y2EDvhZ8HVfVIlRPAm8tlq-NUUsqcL1PJk1eqyuc-b2nNeh-sYoomuQyY-RDh7L8OMLdFof-l0Xdie3jemYRygUV7iR3Nif6b9pm8F5azyt8EMqifc5EOPlRZYhSL4BAg12eHc';
  const baranAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIAgwGSA-euuAp5TlOVoIAlpkrP-8CfhQkPNmR5b-S1bVBlWoWTz7bFFjAYm4WDEXg3McTOJhtmTK041sz_P1US2DB_7t4GdZAUEZSHuWDAylIuW66pjcvyEnF1UOa-PI00PnoVvDzPO7Sb2XLddGTzXpqq_jVVL7wTaiuHBibx0eQtXJerTOjekkVS8gMuFec7tuQdFip_tujXIvrve0f1pPKs2tNOScV_Kwa8Pg';
  
  const successBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKU_VMf3GbI6E-YSoyO-nDggejLypcIeb3duN4RmZzYGQ7dwvMlTQIobkl1KUNJxDlPujuAegCDuxlgE34NGWdWYAP5odUkxVBM-luAuVAEKa8EoNNwAV31AB2Vo4aeLUXAhvi0-8kIFth-TDS20jlTWHocBtJ3aH8iXH0yL0NJiDWa_XataJRLDNnjbLIxmExWTigFrCrx1mrKOamoAIo3jNaZd0AwvWzg4r_FI0';
  const failBg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeJij_GPIbuA2DhG42gMGWZonW_bQ8l4cl_xlERHEweud5Kf_SRilpInIa0a0BpafememStS0SXp2mUrimowu3Ny3DvSKBA8IKFEWldZmMu0aYXMNiE90EZtNO72H8gFlg5VCvxmVzQUCpFyMEc6W8JV5U-E3lHUHAKwa85WJ-viafjcDQnzmvoLetxPyNqOmLPIaU3qe2pAo9k1LqHb9o0Co3j1MtC6ABszcTqNw';

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[440px] mx-auto min-h-[calc(100vh-80px)] bg-[#110e1e] text-[#e6dff9] flex flex-col font-sans select-none pb-12 shadow-2xl rounded-2xl overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#141123]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBackToLobby || onRestartGame}
            className="w-10 h-10 rounded-xl bg-[#201d30] border border-white/10 flex items-center justify-center text-cyan-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#ffb703] uppercase">
              <span>K2088</span>
              <span className="text-[#9e8f78]">//</span>
              <span className="text-cyan-400 font-bold">SEC-04</span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Taktiksel Konsol</h1>
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
          <span className="material-symbols-outlined text-[20px]">person</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-3 max-w-lg mx-auto w-full flex flex-col gap-3">
        {/* Status Sub-Header */}
        <section className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-cyan-400' : 'bg-red-400'} animate-ping`}></span>
            <span className={`font-bold uppercase ${isSuccess ? 'text-cyan-300' : 'text-red-400'}`}>
              {isSuccess ? 'OPERASYON BAŞARILI' : 'OPERASYON BAŞARISIZ'}
            </span>
          </div>
          <span className="text-[#9e8f78] uppercase text-[10px]">
            {isSuccess ? 'GÜVENLİK: MAKSİMUM' : 'KOD: KIRMIZI'}
          </span>
        </section>

        {/* Hero Banner Visual Card */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b0816]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${isSuccess ? successBg : failBg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#110e1e] via-[#110e1e]/60 to-transparent"></div>

          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-[#ffb703] uppercase w-fit mb-1">
              <span className="material-symbols-outlined text-[13px]">
                {isSuccess ? 'verified' : 'crisis_alert'}
              </span>
              <span>{isSuccess ? 'BİYO-KORUMA TEYİT EDİLDİ' : 'BİYO-SIZINTI ALARMI'}</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none uppercase">
              {isSuccess ? 'SALGIN DURDURULDU!' : 'İZOLASYON ÇÖKTÜ!'}
            </h2>

            <p className="text-xs text-[#d5c4ac] mt-1.5 leading-relaxed">
              {isSuccess
                ? 'Biyo-tehdit seviyesi sıfıra indirildi. Laboratuvar personeli ve tesis başarıyla karantinaya alındı.'
                : 'Biyo-güvenlik kalkanları aşıldı ve mutant suş ana kanallara yayıldı. Tesis imha protokolü tetiklendi.'}
            </p>
          </div>
        </div>

        {/* 3 Metric Tiles */}
        <div className="grid grid-cols-3 gap-2">
          {/* Tile 1: Kalan Süre */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">KALAN SÜRE</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb703]">timer</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-mono font-black text-white">
                {formatTimer(state.timeLeftSeconds > 0 ? state.timeLeftSeconds : 114)}
              </span>
              <span className="text-[8px] font-mono text-[#9e8f78] block">HEDEF: &gt; 01:00</span>
            </div>
          </div>

          {/* Tile 2: Bütünlük */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">BÜTÜNLÜK</span>
              <span className="material-symbols-outlined text-[14px] text-cyan-400">shield</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-mono font-black text-cyan-300">
                %{isSuccess ? Math.max(85, state.hullIntegrity) : 0}
              </span>
              <span className="text-[8px] font-mono text-[#9e8f78] block">KRİTİK EŞİK: %65</span>
            </div>
          </div>

          {/* Tile 3: İmmünite Skoru */}
          <div className="bg-[#1c192c] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">İMMÜNİTE</span>
              <span className="material-symbols-outlined text-[14px] text-amber-300">military_tech</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-mono font-black text-amber-300">
                {isSuccess ? (kData?.immunityScore || 10450).toLocaleString('en-US') : 0}
              </span>
              <span className="text-[8px] font-mono text-[#ffb703] block">+1,200 VIP XP</span>
            </div>
          </div>
        </div>

        {/* Squad Performance Card (2/2 Operatives) */}
        <div className="bg-[#1c192c] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-white uppercase">MÜFREZE PERFORMANSI (2/2 AJAN)</span>
            <span className="text-cyan-400">SENKRONİZASYON: %100</span>
          </div>

          {/* Selin (Baş Biyolog) */}
          <div className="bg-[#201d30] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-cyan-400/40">
                <img src={selinAvatar} alt="Selin" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{state.players?.kaptan?.name || 'Selin'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[8px] font-mono font-bold uppercase">
                    BAŞ BİYOLOG
                  </span>
                </div>
                <div className="text-[10px] text-[#9e8f78] mt-0.5">Panzehir Sentezi Kusursuz</div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">ANTİKOR DOĞRULUĞU</span>
              <span className="text-sm font-mono font-black text-cyan-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">biotech</span>
                %{kData?.selinAccuracy || 99.2}
              </span>
            </div>
          </div>

          {/* Baran (Güvenlik Şefi) */}
          <div className="bg-[#201d30] border border-white/5 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-amber-400/40">
                <img src={baranAvatar} alt="Baran" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#ffb703]"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{state.players?.muhendis?.name || 'Baran'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffb703] text-[8px] font-mono font-bold uppercase">
                    GÜVENLİK ŞEFİ
                  </span>
                </div>
                <div className="text-[10px] text-[#9e8f78] mt-0.5">UV İzolasyon &amp; 0 Sızıntı</div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-[#9e8f78] uppercase">VANA MÜHÜRLEME</span>
              <span className="text-sm font-mono font-black text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                {kData?.baranValves || 3}/3
              </span>
            </div>
          </div>
        </div>

        {/* Sector Reward Unlocked Card */}
        {isSuccess && (
          <div className="bg-gradient-to-r from-purple-950/40 via-[#1c192c] to-[#181528] border border-purple-500/30 rounded-xl p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-[20px]">lock_open</span>
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                  SEKTÖR ÖDÜLÜ AÇILDI
                </span>
                <span className="text-xs font-bold text-white">Biyolojik Zırh Boyası — Safir Kovan</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-[#ffb703]/20 border border-[#ffb703]/40 text-[10px] font-mono font-bold text-[#ffb703]">
              +350 K-KREDİ
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={onRestartGame}
            className="w-full py-4 px-4 rounded-xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-gradient-to-r from-[#ffb703] via-[#ffc72c] to-[#ffa000] text-[#271900] shadow-[0_4px_20px_rgba(255,183,3,0.35)] hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[20px]">replay</span>
            <span>AYNI EKİPLE YENİDEN OYNA</span>
          </button>

          <button
            type="button"
            onClick={onBackToLobby || onRestartGame}
            className="w-full py-3.5 px-4 rounded-xl font-sora font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-[#1c192c] border border-white/10 hover:border-white/20 text-[#e6dff9] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>LOBİYE DÖN</span>
          </button>
        </div>
      </main>
    </div>
  );
};
