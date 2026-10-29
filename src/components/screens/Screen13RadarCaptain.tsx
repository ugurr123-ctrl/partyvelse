import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: () => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen13RadarCaptain: React.FC<Props> = ({ state, onAdvancePhase, onUpdate }) => {
  const { isSolved } = state.radar;
  const [transmitted, setTransmitted] = useState(false);

  const handleTransmit = () => {
    setTransmitted(true);
    if (onUpdate) {
      onUpdate(prev => ({
        ...prev,
        radar: {
          ...prev.radar,
          // Transmit coordinates
        }
      }));
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* Top Telemetry & Role Sub-Badge */}
      <div className="flex items-center justify-between gap-space-xs mt-space-sm">
        <div className="flex items-center gap-space-xs bg-surface-container-high px-3 py-1.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-label-telemetry text-label-telemetry text-primary tracking-wider uppercase font-bold">👑 KAPTAN // HEDEF KOORDİNATLARI</span>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-inner">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-ping"></span>
          <span className="font-label-status text-label-status text-secondary tracking-widest uppercase font-bold">CANLI BAĞLANTI</span>
        </div>
      </div>

      {/* Briefing Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-extrabold uppercase drop-shadow-sm">
          Sinyal Kerterizini Ver
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant leading-snug">
          Radar çanağının kilitlenmesi gereken frekans açısı ve azimut değerlerini mühendise söyle.
        </p>
      </div>

      {/* 2.5D Holographic Orbital Radar Display Module */}
      <div className="relative w-full rounded-xl bg-surface-container-lowest p-space-sm shadow-xl overflow-hidden flex flex-col items-center justify-center">
        {/* Glow Gradients */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-primary-container/15 blur-3xl pointer-events-none"></div>

        {/* Header Label Inside Radar */}
        <div className="w-full flex items-center justify-between px-2 pt-1 pb-2 z-10">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[16px]">radar</span>
            <span className="font-label-status text-label-status text-secondary tracking-widest uppercase font-bold">ORBİTAL RADAR MATRİSİ</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded">
            <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-wider font-bold">SEC-07 // 275°</span>
          </div>
        </div>

        {/* Radar SVG Interface */}
        <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center my-1">
          <svg className="w-full h-full select-none" id="radar-display" viewBox="0 0 300 300">
            <defs>
              <radialGradient cx="50%" cy="50%" id="radarSweepGlow" r="50%">
                <stop offset="0%" stopColor="#00eefc" stopOpacity="0.35"></stop>
                <stop offset="60%" stopColor="#00dbe9" stopOpacity="0.08"></stop>
                <stop offset="100%" stopColor="#00dbe9" stopOpacity="0"></stop>
              </radialGradient>
              <filter height="160%" id="blipGlow" width="160%" x="-30%" y="-30%">
                <feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
                <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
              </filter>
            </defs>
            {/* Polar Radial Concentric Grids */}
            <circle cx="150" cy="150" fill="none" r="130" stroke="#363246" strokeDasharray="4 4" strokeWidth="1.2"></circle>
            <circle cx="150" cy="150" fill="none" r="95" stroke="#2b273b" strokeWidth="1"></circle>
            <circle cx="150" cy="150" fill="none" r="60" stroke="#363246" strokeDasharray="2 4" strokeWidth="1"></circle>
            <circle cx="150" cy="150" fill="#1c192c" r="25" stroke="#514532" strokeWidth="1"></circle>
            {/* Crosshairs Axes */}
            <line stroke="#363246" strokeWidth="1" x1="20" x2="280" y1="150" y2="150"></line>
            <line stroke="#363246" strokeWidth="1" x1="150" x2="150" y1="20" y2="280"></line>
            {/* Cardinal Labels */}
            <text fill="#9e8f78" fontFamily="Sora" fontSize="9" fontWeight="700" textAnchor="middle" x="150" y="14">0° K</text>
            <text fill="#9e8f78" fontFamily="Sora" fontSize="9" fontWeight="700" textAnchor="middle" x="290" y="153">90° D</text>
            <text fill="#9e8f78" fontFamily="Sora" fontSize="9" fontWeight="700" textAnchor="middle" x="150" y="295">180° G</text>
            <text fill="#ffba27" fontFamily="Sora" fontSize="9" fontWeight="700" textAnchor="middle" x="10" y="153">270° B</text>
            {/* Current Engineer Vector Line (260 Degrees) */}
            <line opacity="0.6" stroke="#eed8ff" strokeDasharray="3 2" strokeWidth="1.8" x1="150" x2="24" y1="150" y2="128"></line>
            <circle cx="24" cy="128" fill="#eed8ff" opacity="0.8" r="3.5"></circle>
            {/* Target Vector Axis (275 Degrees) */}
            <line opacity="0.4" stroke="#ffba27" strokeWidth="1.5" x1="150" x2="50" y1="150" y2="141"></line>
            {/* Animated Radar Sweep Cone */}
            <g className="origin-center animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '150px 150px' }}>
              <path d="M 150 150 L 150 20 A 130 130 0 0 1 242 58 Z" fill="url(#radarSweepGlow)"></path>
            </g>
            {/* Target Beacon Blip (Azimut: 275°, Elevasyon: +42°) */}
            <g transform="translate(55, 142)">
              <circle className="animate-ping" cx="0" cy="0" fill="#ffb703" fillOpacity="0.15" r="14" style={{ animationDuration: '2s' }}></circle>
              <circle cx="0" cy="0" fill="#ffba27" filter="url(#blipGlow)" r="7"></circle>
              <circle cx="0" cy="0" fill="#141123" r="2.5"></circle>
              <rect fill="none" height="20" stroke="#ffb703" strokeDasharray="4 2" strokeWidth="1" width="20" x="-10" y="-10"></rect>
            </g>
            {/* Marker Text Label Pin */}
            <g transform="translate(52, 122)">
              <rect fill="#141123" fillOpacity="0.9" height="13" rx="2" stroke="none" width="62" x="-3" y="-10"></rect>
              <text fill="#ffba27" fontFamily="Sora" fontSize="8" fontWeight="700" x="0" y="0">HEDEF: 275°</text>
            </g>
          </svg>
          {/* Compass Overlay Badge */}
          <div className="absolute bottom-1 right-2 bg-surface-container-high/90 px-2 py-1 rounded flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span className="font-label-telemetry text-label-telemetry text-primary-fixed-dim font-bold">SİNYAL KİLİDİ: %68</span>
          </div>
        </div>

        {/* Quick Legend Strip */}
        <div className="w-full flex items-center justify-around py-1.5 bg-surface-container/50 rounded-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="font-label-status text-label-status text-on-surface-variant font-medium">Hedef Şamandıra</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-label-status text-label-status text-on-surface-variant font-medium">Müh. Çanağı (260°)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>
            <span className="font-label-status text-label-status text-on-surface-variant font-medium">Taşıyıcı 8.4GHz</span>
          </div>
        </div>
      </div>

      {/* 1. Hedef Telemetri Dosyası (Captain's Classified Coordinates Bento) */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-1">
          <span className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight flex items-center gap-1 font-bold">
            <span className="material-symbols-outlined text-primary text-[18px]">folder_special</span>
            Hedef Telemetri Dosyası
          </span>
          <span className="font-label-telemetry text-label-telemetry text-secondary uppercase bg-surface-container px-2 py-0.5 rounded font-bold">
            GİZLİ // S-07
          </span>
        </div>
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Target Name Node */}
          <div className="col-span-2 bg-surface-container p-3 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex flex-col min-w-0">
              <span className="font-label-status text-label-status text-on-surface-variant uppercase font-medium">Hedef Tanımlayıcı</span>
              <span className="font-headline-sm text-headline-sm text-primary tracking-wide truncate font-bold">SEKTÖR-7 KURTARMA ŞAMANDIRASI</span>
            </div>
            <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center shrink-0 ml-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">share_location</span>
            </div>
          </div>
          {/* Azimuth Tile */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-status text-label-status text-on-surface-variant uppercase font-medium">Azimut Açısı</span>
              <span className="material-symbols-outlined text-secondary-fixed-dim text-[16px]">explore</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-secondary-fixed font-black">275°</span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-wider font-bold">BATI-KUZEYBATI</span>
            </div>
          </div>
          {/* Elevation Tile */}
          <div className="bg-surface-container p-3 rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-status text-label-status text-on-surface-variant uppercase font-medium">Yükseliş Açısı</span>
              <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">vertical_align_top</span>
            </div>
            <div className="flex flex-col mt-2">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-fixed-dim font-black">+42°</span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-wider font-bold">ELEVASYON KİLİDİ</span>
            </div>
          </div>
          {/* Carrier Frequency Tile */}
          <div className="col-span-2 bg-surface-container-low px-3 py-2.5 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">waves</span>
              <div className="flex flex-col">
                <span className="font-label-status text-label-status text-on-surface-variant uppercase font-medium">Taşıyıcı Dalga</span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">8.4 GHz KU-BANDI</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-highest px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
              <span className="font-label-telemetry text-label-telemetry text-on-surface font-bold">SENKRONİZE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mühendis Anten Hizalaması (Co-Op Realtime Sync Bar) */}
      <div className="bg-surface-container p-space-md rounded-xl flex flex-col gap-space-xs shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]">build_circle</span>
            <span className="font-headline-sm text-headline-sm text-tertiary uppercase font-bold">Mühendis Anten Hizalaması</span>
          </div>
          <span className="font-label-telemetry text-label-telemetry text-error uppercase bg-error-container/40 px-2 py-0.5 rounded font-bold">
            {isSolved ? 'KİLİTLENDİ' : 'Zayıf Sinyal'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-body-md text-body-md text-on-surface">Mevcut Hiza:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline-md text-headline-md text-tertiary-fixed font-bold">{isSolved ? '275°' : '260°'}</span>
            <span className="font-label-telemetry text-label-telemetry text-error font-semibold">
              {isSolved ? '(0° Fark - TAM KİLİT)' : '(15° Fark var)'}
            </span>
          </div>
        </div>
        {/* Progress Track */}
        <div className="w-full flex flex-col gap-1 mt-1">
          <div className="flex justify-between items-center text-label-status font-label-status text-on-surface-variant font-medium">
            <span>200°</span>
            <span className="text-tertiary font-bold">▲ Çanak ({isSolved ? '275°' : '260°'})</span>
            <span className="text-primary font-bold">★ Hedef (275°)</span>
            <span>320°</span>
          </div>
          <div className="w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden flex relative p-0.5">
            <div className="h-full bg-gradient-to-r from-tertiary-container/30 to-tertiary rounded-full transition-all duration-300" style={{ width: isSolved ? '62.5%' : '50%' }}></div>
            <div className="absolute top-0 bottom-0 w-1.5 bg-primary-container rounded-sm shadow-md" style={{ left: '62.5%' }}></div>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 italic">
          Mühendise telsizden kerterizi bildir: Azimut 275° ve Elevasyon +42° seviyesine yükseltmesini iste.
        </p>
      </div>

      {/* 4. Tactile Arcade Action Trigger */}
      <div className="w-full pt-1 pb-1">
        {!isSolved ? (
          <button
            type="button"
            onClick={handleTransmit}
            className="w-full group relative flex items-center justify-center gap-space-sm bg-gradient-to-r from-primary-container to-surface-tint active:scale-[0.98] py-4 px-6 rounded-xl shadow-lg transition-transform duration-100 cursor-pointer overflow-hidden"
            style={{ boxShadow: '0 4px 0 #7d5800, inset 0 1px 0 rgba(255,255,255,0.4)' }}
          >
            <span className="material-symbols-outlined text-on-primary font-bold text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              track_changes
            </span>
            <span className="font-headline-sm text-headline-sm text-on-primary font-extrabold uppercase tracking-wide">
              {transmitted ? 'KERTERİZ İLETİLDİ! ✓' : 'Hedef Kerterizini Radara İşle'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvancePhase}
            className="w-full group relative flex items-center justify-center gap-space-sm bg-gradient-to-r from-secondary-container to-secondary-fixed active:scale-[0.98] py-4 px-6 rounded-xl shadow-lg cursor-pointer animate-pulse"
          >
            <span className="material-symbols-outlined text-on-secondary-container font-bold text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              task_alt
            </span>
            <span className="font-headline-sm text-headline-sm text-on-secondary-container font-extrabold uppercase tracking-wide">
              RADAR KİLİTLENDİ • DEVAM ET
            </span>
          </button>
        )}
      </div>

      {/* 5. Bottom Hint Banner */}
      <div className="flex items-start gap-space-xs bg-surface-container-low px-3.5 py-2.5 rounded-lg mb-space-md shadow-sm">
        <span className="material-symbols-outlined text-primary-fixed-dim text-[18px] shrink-0 mt-0.5">tips_and_updates</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
          <strong className="text-primary-fixed-dim font-bold">KAPTAN TAKTİĞİ:</strong> Sinyal gürültüsünü aşmak için elevatör açısını unutma! Mühendis çanağı 275° seviyesine aldığında +42° dikey ekseni eşzamanlı kilitlemeli.
        </p>
      </div>
    </div>
  );
};
