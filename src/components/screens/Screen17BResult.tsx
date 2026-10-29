import React, { useEffect, useRef, useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onRestartGame: () => void;
  onLobbyReturn?: () => void;
}

export const Screen17BResult: React.FC<Props> = ({ state, onRestartGame, onLobbyReturn }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [replayRotate, setReplayRotate] = useState(0);
  
  // Local toggle to allow previewing both Victory and Failure in real-time
  const [previewOutcome, setPreviewOutcome] = useState<'basarisizlik' | 'tam_basari'>(
    state.outcomeType === 'basarisizlik' ? 'basarisizlik' : 'tam_basari'
  );

  const isFailure = previewOutcome === 'basarisizlik';

  const { rescuedCrewCount, timeLeftSeconds, hullIntegrity } = state;

  const minutes = Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeLeftSeconds % 60).toString().padStart(2, '0');

  // Interactive Particle Canvas (Golden Stardust for Victory, Red Ash / Sparks for Failure)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 700);

    const victoryColors = ['#FFB703', '#FFDBA0', '#00EEFC', '#D3FBFF', '#DAB5FF'];
    const failureColors = ['#FF5252', '#FFB4AB', '#93000A', '#FF7961', '#4D1B1B'];
    const activeColors = isFailure ? failureColors : victoryColors;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }> = [];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: isFailure ? (Math.random() * 0.6 + 0.2) : (-Math.random() * 0.7 - 0.2),
        color: activeColors[Math.floor(Math.random() * activeColors.length)],
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * 0.003 + p.size) * 0.01;

        if (isFailure && p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        } else if (!isFailure && p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isFailure]);

  const handleReplayClick = () => {
    setReplayRotate(prev => prev + 360);
    setTimeout(() => {
      onRestartGame();
    }, 300);
  };

  const handleLobbyClick = () => {
    if (onLobbyReturn) {
      onLobbyReturn();
    } else {
      onRestartGame();
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col relative overflow-hidden select-none animate-fadeIn text-[#e6dff9] pb-8">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 w-full h-full opacity-60" />

      {/* Outcome Switcher Bar for Quick Evaluation / Testing */}
      <div className="relative z-40 px-margin pt-2 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant">
          SONUÇ PROTOKOLÜ:
        </div>
        <div className="flex items-center gap-1 bg-surface-container-highest/80 p-0.5 rounded-lg border border-surface-variant/40 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPreviewOutcome('basarisizlik')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              isFailure 
                ? 'bg-error-container text-on-error-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Süre Bitti / Hata
          </button>
          <button
            type="button"
            onClick={() => setPreviewOutcome('tam_basari')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              !isFailure 
                ? 'bg-primary-container text-on-primary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Zafer / Kurtarma
          </button>
        </div>
      </div>

      {isFailure ? (
        /* ================= FAILURE & TIME EXPIRED SCREEN (17C) ================= */
        <>
          {/* Ambient Red Glows */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-error-container/25 blur-[100px] z-10"></div>
          <div className="pointer-events-none absolute top-48 left-1/4 w-72 h-72 rounded-full bg-error/15 blur-[90px] z-10"></div>

          {/* Hero Disaster Background Card */}
          <div className="relative w-full overflow-hidden flex flex-col justify-end px-margin pb-6 pt-6">
            <div 
              className="absolute inset-0 bg-cover bg-center filter grayscale-[30%] brightness-75 contrast-125" 
              style={{ 
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYYRGcO-qooDGua9vJuMZ2UEE08MvX5onD4i79wD2nvA3dJx_NAS9TVasc1xx7SyqUqQ81wencqyzUcSsWmO4yW2SqXX62FN40vwns_ZtNVO5CTYbm9JpYpR5cbXGRInJoxSk4kGHMGy2qgUNTXc0e_4FhyvKE-B44ZGvRhhXA_aVVSUN23Cl7w0yybN7HKHcS3N9U2V_BBVophbF86YGvun2K3eA-XeEkNYF-3DE')" 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface-dim/90 via-surface-dim/60 to-surface z-0"></div>
            <div className="absolute inset-0 bg-radial-at-t from-error/20 via-transparent to-surface z-0"></div>

            {/* Badges & Titles */}
            <div className="relative z-10 flex flex-col items-center text-center mt-2">
              <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-error-container/40 border border-error/30 backdrop-blur-md mb-3 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                <span className="material-symbols-outlined text-[15px] text-error">sensors_off</span>
                <span className="font-label-telemetry text-label-telemetry text-error uppercase tracking-widest font-bold">
                  PROTOKOL İHLALİ // FAULT-99
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="font-display-hero-mobile text-display-hero-mobile text-transparent bg-clip-text bg-gradient-to-b from-error via-red-400 to-red-600 uppercase tracking-tight drop-shadow-[0_4px_16px_rgba(255,180,171,0.35)] font-black">
                GÖREV BAŞARISIZ
              </h2>
              <span className="font-label-status text-label-status text-error/90 uppercase tracking-widest font-bold mt-1">
                TAHLİYE BAŞARISIZ // SÜRE TÜKENDİ
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[290px] mt-2 font-medium leading-relaxed">
                Sinyal tamamen koptu. İstasyon gövdesi parçalandı ve kaçış kapsülü rota dışına savruldu.
              </p>
            </div>
          </div>

          {/* Failure Plaque Console Frame */}
          <div className="relative z-30 px-margin flex flex-col gap-space-md -mt-2 pb-8">
            <div className="relative w-full rounded-xl bg-surface-container-high/90 border border-error/20 backdrop-blur-xl p-5 shadow-2xl flex flex-col items-center overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-error to-transparent opacity-90"></div>
              <div className="absolute top-2 left-2 w-2 h-2 rounded bg-error/40"></div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded bg-error/40"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded bg-error/40"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded bg-error/40"></div>

              {/* Zero Rescued Stat Display */}
              <div className="flex flex-col items-center">
                <div className="w-13 h-13 rounded-2xl bg-error-container/30 border border-error/40 flex items-center justify-center text-error mb-1 shadow-inner">
                  <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    running_with_errors
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display-hero-mobile text-display-hero-mobile text-error drop-shadow-[0_2px_12px_rgba(255,180,171,0.5)] font-black">
                    0
                  </span>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant/70 font-bold">
                    / 10
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm text-error/90 font-semibold tracking-wide uppercase mt-0.5">
                  Kişi Kurtarıldı
                </span>
              </div>

              {/* Offline Crew Members Section */}
              <div className="w-full grid grid-cols-2 gap-space-md mt-5 pt-4 border-t border-surface-variant/40">
                {/* Ece Offline Card */}
                <div className="flex flex-col items-center bg-surface-container-low/90 border border-error/20 rounded-lg p-3 group transition-transform active:scale-95 shadow-sm">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg mb-2 grayscale brightness-75">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Ece" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjneeJLFuxwZXqCp9n0nolhcFqV8kIP4eP-bUHd_IS7Q56A2X1NsM_e7NpsGLqiH7V5QrjjzpODzs5lrX4cklFH9pE_2TWW3o-Vky9Bh5x5m5eB4kagmjjFkp8VmwGC2abL5fOIrUDXQli8anUR_1d-X19wWdQHYpuu9S90yPmwsRRs6lq-bTSQEYMKg3QUN4x7S_gVJDosZoXIEWN4Q_k6i1PGRLr6CCJ1AJDNb0" 
                    />
                    <div className="absolute inset-0 bg-red-950/40"></div>
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[13px] font-bold">close</span>
                    </div>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface/90 tracking-tight font-bold">
                    {state.players.kaptan.name || 'Ece'}
                  </span>
                  <span className="font-label-telemetry text-label-telemetry text-error uppercase mt-0.5 px-2 py-0.5 rounded-full bg-error-container/20 font-bold">
                    KAYIP // ÇEVRİMDIŞI
                  </span>
                </div>

                {/* Mert Offline Card */}
                <div className="flex flex-col items-center bg-surface-container-low/90 border border-error/20 rounded-lg p-3 group transition-transform active:scale-95 shadow-sm">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg mb-2 grayscale brightness-75">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Mert" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSDGyHEo6C57QfHLfzHn6fHpATwZ_E4dRftmOaQg_x3YXnw8n7tnNeqdE0gOgdK4VaiihLM8bAzh7zjRdQTf2oT_bgIlocy1EBKvKWfyuPCVDxlhRBYRDtYYxvKlhwJBCILE5AC2lTlb9bHIVuVNyegbFuVtMWeYkciEfgUS4vXS62n5FqJqbZrC-1o66H4IPlTdRWp4LXOQ-1UtYt-Lpi5fl3prglhdDKxNsDJo8" 
                    />
                    <div className="absolute inset-0 bg-red-950/40"></div>
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-[13px] font-bold">close</span>
                    </div>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface/90 tracking-tight font-bold">
                    {state.players.muhendis.name || 'Mert'}
                  </span>
                  <span className="font-label-telemetry text-label-telemetry text-error uppercase mt-0.5 px-2 py-0.5 rounded-full bg-error-container/20 font-bold">
                    KAYIP // ÇEVRİMDIŞI
                  </span>
                </div>
              </div>

              {/* Telemetry Divider Strip */}
              <div className="w-full my-4 h-[1px] bg-surface-variant/40"></div>

              {/* Mission Failure Metrics Row */}
              <div className="w-full grid grid-cols-3 gap-space-xs text-center">
                {/* Metric 1: Tasks */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container/60 border border-error/15">
                  <span className="material-symbols-outlined text-[18px] text-error mb-1">warning</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">2/3</span>
                  <span className="font-label-status text-label-status text-error uppercase mt-0.5">kısmi</span>
                </div>
                {/* Metric 2: Time Left */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container/60 border border-error/15">
                  <span className="material-symbols-outlined text-[18px] text-error mb-1">timer_off</span>
                  <span className="font-headline-sm text-headline-sm text-error font-bold">00:00</span>
                  <span className="font-label-status text-label-status text-on-surface-variant uppercase mt-0.5">tükendi</span>
                </div>
                {/* Metric 3: Integrity */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container/60 border border-error/15">
                  <span className="material-symbols-outlined text-[18px] text-error mb-1">heart_broken</span>
                  <span className="font-headline-sm text-headline-sm text-error font-bold">
                    %{hullIntegrity <= 0 ? 0 : hullIntegrity}
                  </span>
                  <span className="font-label-status text-label-status text-error uppercase mt-0.5">kritik</span>
                </div>
              </div>

              {/* Critical Incident Breakdown Note */}
              <div className="w-full mt-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-left">
                <div className="flex items-center gap-1.5 text-error font-bold font-label-telemetry text-label-telemetry uppercase mb-1">
                  <span className="material-symbols-outlined text-[15px]">report_problem</span>
                  <span>KRİTİK OLAY RAPORU</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Tahsis edilen 5 dakikalık kurtarma penceresi doldu veya gövde bütünlüğü kritik seviyenin altına indi. Yaşam destek üniteleri devre dışı kaldı.
                </p>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col gap-space-sm pt-2">
              {/* Arcade Retry Button */}
              <button 
                type="button"
                onClick={handleReplayClick}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 via-error to-rose-600 text-on-error font-headline-sm text-headline-sm uppercase tracking-wide flex items-center justify-center gap-space-sm shadow-[0_6px_0_#690005,0_12px_24px_rgba(255,180,171,0.25)] transition-all active:translate-y-[4px] active:shadow-[0_2px_0_#690005] active:scale-[0.99] cursor-pointer font-bold"
              >
                <span>Tekrar dene (Aynı ekiple)</span>
                <span 
                  className="material-symbols-outlined text-[22px] transition-transform duration-500"
                  style={{ transform: `rotate(${replayRotate}deg)` }}
                >
                  replay
                </span>
              </button>

              {/* Secondary Dark Glass Button */}
              <button 
                type="button"
                onClick={handleLobbyClick}
                className="w-full py-3.5 px-6 rounded-xl bg-surface-container-high/70 backdrop-blur-md text-on-surface-variant hover:text-on-surface font-headline-sm text-headline-sm uppercase tracking-wide flex items-center justify-center gap-space-xs transition-all active:scale-[0.98] shadow-md hover:bg-surface-container-highest cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                <span>Lobiye dön</span>
              </button>
            </div>

            {/* Tip Note */}
            <div className="flex items-center justify-center gap-2 pt-2 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase font-bold text-center">
                İPUCU: KAPTAN VE MÜHENDİS DAHA HIZLI BİLGİ ALIŞVERİŞİ YAPMALIDIR
              </span>
            </div>
          </div>
        </>
      ) : (
        /* ================= VICTORY & RESCUE SCREEN (17B) ================= */
        <>
          {/* Ambient Cinematic Glows */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-container/20 blur-[100px] z-10"></div>
          <div className="pointer-events-none absolute top-48 left-1/4 w-72 h-72 rounded-full bg-secondary-container/15 blur-[90px] z-10"></div>

          {/* Hero Space Vista Background Card */}
          <div className="relative w-full overflow-hidden flex flex-col justify-end px-margin pb-6 pt-6">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDB5PMnrENFEBX_4_Mx2ng-zsSNRYqs8cQjvvNs1NFqsvBgF13Uecoxse0KnNOrll-BZ6eZnBINmmVgmSVVC_GHJvJvE7krXBhNfqwAUx-9-WB1gR8g3o8040FEih9Bca3nQRjCPLr2PHhJx7H82iVIol8H4vFRx-ftgOWWLaonLtkxk22wMtEiWEAwgu_hLgtNYjraQiFc1mR3k7qAiXHxzPz6Cv6NjFPawPcXRT8')" 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface-dim/80 via-surface-dim/40 to-surface z-0"></div>
            <div className="absolute inset-0 bg-radial-at-t from-primary/10 via-transparent to-surface z-0"></div>

            {/* Dynamic Status Banner & Titles */}
            <div className="relative z-10 flex flex-col items-center text-center mt-2">
              <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md mb-3 shadow-md">
                <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span className="font-label-telemetry text-label-telemetry text-primary uppercase tracking-widest font-bold">GÖREV PROTOKOLÜ: BAŞARILI</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-display-hero-mobile text-display-hero-mobile text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary-container to-amber-500 uppercase tracking-tight drop-shadow-[0_4px_16px_rgba(255,183,3,0.35)] font-black">
                BİRLİKTE KURTULDUNUZ
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] mt-2 font-medium leading-relaxed">
                Doğru kararlar, daha fazla hayat.<br />Harika bir ekip oldunuz.
              </p>
            </div>
          </div>

          {/* Content Stream Container */}
          <div className="relative z-30 px-margin flex flex-col gap-space-md -mt-2 pb-8">
            {/* Achievement Plaque Console Frame */}
            <div className="relative w-full rounded-xl bg-surface-container-high/90 backdrop-blur-xl p-5 shadow-2xl flex flex-col items-center overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
              <div className="absolute top-2 left-2 w-2 h-2 rounded bg-surface-variant"></div>
              <div className="absolute top-2 right-2 w-2 h-2 rounded bg-surface-variant"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded bg-surface-variant"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded bg-surface-variant"></div>

              {/* Luminous Crew Icon & Stat Display */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest/90 flex items-center justify-center text-primary mb-1 shadow-inner">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display-hero-mobile text-display-hero-mobile text-primary drop-shadow-[0_2px_12px_rgba(255,183,3,0.45)] font-black">
                    {rescuedCrewCount || 10}
                  </span>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant/80 font-bold">
                    / 10
                  </span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-wide uppercase mt-0.5">
                  Kişi kurtarıldı
                </span>
              </div>

              {/* Crew Members Section */}
              <div className="w-full grid grid-cols-2 gap-space-md mt-5 pt-4">
                {/* Ece Card */}
                <div className="flex flex-col items-center bg-surface-container-low/90 rounded-lg p-3 group transition-transform active:scale-95 shadow-sm">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg mb-2">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Ece" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8HeSYo673QadE9iujWg5y8fNY5tzXBH6nEayboG5fIqGOeKiKl4kRcrn-DyTOCVDe3hsyQDaOoYCTLDS1r8dZCKfJ4zin33Gq1CbMr2DX7u3Qj6RSQqx1se24WeMOhge0xPuxIaI9lAozwUYAlPb6-oPKkIBvsBCxGJt9L-UuZyfRNK7_jL2q48qK0C2mnCgt4qGv4SKgfXUKxecpQ31J0O-EmTUCMch0dnTINxI" 
                    />
                    <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                    {state.players.kaptan.name || 'Ece'}
                  </span>
                  <span className="font-label-telemetry text-label-telemetry text-primary-container uppercase mt-0.5 px-2 py-0.5 rounded-full bg-primary-container/10 font-bold">
                    Kaptan
                  </span>
                </div>

                {/* Mert Card */}
                <div className="flex flex-col items-center bg-surface-container-low/90 rounded-lg p-3 group transition-transform active:scale-95 shadow-sm">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg mb-2">
                    <img 
                      className="w-full h-full object-cover" 
                      alt="Mert" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2iAGhlp6-v_GFPVueTh7PYwi4aNcIGrud478QQQ1QFTB16uM3yuXvxWr-wn2mEAxqqSeWlGcWZdpforkWZqSkqrRHAh4iXPwzv5IKJ__NIPKe63-bbFPQxrsN7n5v6qnpetn8zrJFeEW2QfpoEhBjmkDVAB_AihUw-alJycpruXItHR0InKAXcuHOsFaQ-r-DcHxPXpZECqciAbubXavQRDGnw-1F5MYW0FMQtKE" 
                    />
                    <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                    {state.players.muhendis.name || 'Mert'}
                  </span>
                  <span className="font-label-telemetry text-label-telemetry text-secondary uppercase mt-0.5 px-2 py-0.5 rounded-full bg-secondary-container/10 font-bold">
                    Mühendis
                  </span>
                </div>
              </div>

              {/* Telemetry Divider Strip */}
              <div className="w-full my-4 h-[1px] bg-surface-variant/40"></div>

              {/* Mission Metrics Row */}
              <div className="w-full grid grid-cols-3 gap-space-xs text-center">
                {/* Metric 1: Tasks */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container/60">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant mb-1">assignment</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">3</span>
                  <span className="font-label-status text-label-status text-on-surface-variant uppercase mt-0.5">görev</span>
                </div>
                {/* Metric 2: Time Left */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container/60">
                  <span className="material-symbols-outlined text-[18px] text-primary-container mb-1">timer</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">
                    {minutes}:{seconds}
                  </span>
                  <span className="font-label-status text-label-status text-on-surface-variant uppercase mt-0.5">kaldı</span>
                </div>
                {/* Metric 3: Integrity */}
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container/60">
                  <span className="material-symbols-outlined text-[18px] text-secondary mb-1">shield</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    %{hullIntegrity}
                  </span>
                  <span className="font-label-status text-label-status text-on-surface-variant uppercase mt-0.5">bütünlük</span>
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col gap-space-sm pt-2">
              {/* Primary Tactile Gold Arcade Push Button */}
              <button 
                type="button"
                onClick={handleReplayClick}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#FFB703] via-primary-container to-[#FF8C00] text-on-primary font-headline-sm text-headline-sm uppercase tracking-wide flex items-center justify-center gap-space-sm shadow-[0_6px_0_#995c00,0_12px_24px_rgba(255,183,3,0.35)] transition-all active:translate-y-[4px] active:shadow-[0_2px_0_#995c00] active:scale-[0.99] cursor-pointer font-bold"
                id="btn-replay"
              >
                <span>Aynı ekiple yeniden oyna</span>
                <span 
                  className="material-symbols-outlined text-[22px] transition-transform duration-500" 
                  style={{ transform: `rotate(${replayRotate}deg)` }}
                >
                  replay
                </span>
              </button>

              {/* Secondary Dark Glass Button */}
              <button 
                type="button"
                onClick={handleLobbyClick}
                className="w-full py-3.5 px-6 rounded-xl bg-surface-container-high/70 backdrop-blur-md text-secondary hover:text-on-surface font-headline-sm text-headline-sm uppercase tracking-wide flex items-center justify-center gap-space-xs transition-all active:scale-[0.98] shadow-md hover:bg-surface-container-highest cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                <span>Lobiye dön</span>
              </button>
            </div>

            {/* VIP Honor Note */}
            <div className="flex items-center justify-center gap-2 pt-2 opacity-75">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface-variant uppercase font-bold">
                TAKIM PERFORMANSI: KUSURSUZ TAHLİYE
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
