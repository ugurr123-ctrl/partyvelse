import React, { useEffect, useRef, useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onRestartGame: () => void;
}

export const Screen17BResult: React.FC<Props> = ({ state, onRestartGame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [replayRotate, setReplayRotate] = useState(0);

  const { rescuedCrewCount, timeLeftSeconds, hullIntegrity } = state;

  const minutes = Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0');
  const seconds = (timeLeftSeconds % 60).toString().padStart(2, '0');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 700);

    const colors = ['#FFB703', '#FFDBA0', '#00EEFC', '#D3FBFF', '#DAB5FF'];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }> = [];

    for (let i = 0; i < 42; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.7 - 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * 0.003 + p.size) * 0.01;

        if (p.y < 0) {
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
  }, []);

  const handleReplayClick = () => {
    setReplayRotate(prev => prev + 360);
    setTimeout(() => {
      onRestartGame();
    }, 300);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col relative overflow-hidden select-none animate-fadeIn text-[#e6dff9] pb-8">
      {/* Interactive Stardust Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 w-full h-full opacity-70" />

      {/* Ambient Cinematic Glows */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary-container/20 blur-[100px] z-10"></div>
      <div className="pointer-events-none absolute top-48 left-1/4 w-72 h-72 rounded-full bg-secondary-container/15 blur-[90px] z-10"></div>

      {/* Hero Space Vista Background Card */}
      <div className="relative w-full overflow-hidden flex flex-col justify-end px-margin pb-6 pt-8">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDB5PMnrENFEBX_4_Mx2ng-zsSNRYqs8cQjvvNs1NFqsvBgF13Uecoxse0KnNOrll-BZ6eZnBINmmVgmSVVC_GHJvJvE7krXBhNfqwAUx-9-WB1gR8g3o8040FEih9Bca3nQRjCPLr2PHhJx7H82iVIol8H4vFRx-ftgOWWLaonLtkxk22wMtEiWEAwgu_hLgtNYjraQiFc1mR3k7qAiXHxzPz6Cv6NjFPawPcXRT8')" 
          }}
        ></div>
        {/* Scrim Overlays for Depth and Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dim/80 via-surface-dim/40 to-surface z-0"></div>
        <div className="absolute inset-0 bg-radial-at-t from-primary/10 via-transparent to-surface z-0"></div>

        {/* Dynamic Status Banner & Titles */}
        <div className="relative z-10 flex flex-col items-center text-center mt-4">
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
          {/* Top Subtle Edge Glow Highlight */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
          {/* Corner Hardware Accents */}
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
            onClick={onRestartGame}
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
    </div>
  );
};
