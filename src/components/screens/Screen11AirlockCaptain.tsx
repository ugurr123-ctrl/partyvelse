import React, { useState } from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onAdvancePhase: () => void;
  onUpdate?: (updater: (prev: MissionState) => MissionState) => void;
}

export const Screen11AirlockCaptain: React.FC<Props> = ({ state, onAdvancePhase, onUpdate }) => {
  const { isSolved } = state.airlock;
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleAuthorize = () => {
    setIsAuthorized(true);
    if (onUpdate) {
      onUpdate(prev => ({
        ...prev,
        airlock: {
          ...prev.airlock,
          // Captain transmits safety clearance
        }
      }));
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* Top Telemetry Micro-HUD */}
      <div className="flex items-center justify-between bg-surface-container-lowest/80 px-space-md py-space-sm rounded-xl shadow-inner">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
          <span className="font-label-telemetry text-label-telemetry text-secondary-fixed">PARTYVERSE // CANLI</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <span className="font-label-status text-label-status text-on-surface-variant uppercase tracking-wider">Bütünlük</span>
          <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-lg">
            <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="font-label-telemetry text-label-telemetry text-primary font-bold">%{state.hullIntegrity}</span>
          </div>
        </div>
      </div>

      {/* Role Authorization Badge */}
      <div className="flex items-center">
        <div className="inline-flex items-center gap-space-xs px-3 py-1 bg-surface-container-high rounded-full shadow-sm">
          <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-label-telemetry text-label-telemetry text-primary tracking-widest uppercase">👑 KAPTAN // PROTOKOL KILAVUZU</span>
        </div>
      </div>

      {/* Tactical Mission Objective Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold">
          Basınç döngüsünü yönet
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Hava kilidi sızdırmazlık sırasını mühendise ilet. Adımları yanlış sıralamak ani oksijen kaybına yol açar.
        </p>
      </div>

      {/* Airlock Schematic Cutaway Card */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">view_in_ar</span>
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed tracking-wider uppercase">KAPAK DURUM ŞEMASI</span>
          </div>
          <span className="font-label-status text-label-status text-tertiary uppercase">MODÜL 11-B</span>
        </div>

        {/* Station Cross-Section Isometric Wireframe Canvas */}
        <div className="relative w-full h-36 bg-surface-container-lowest rounded-lg p-space-xs flex items-center justify-between gap-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary-fixed-dim/5 to-transparent pointer-events-none"></div>

          {/* Node 1: İç Kapak */}
          <div className="relative z-10 flex-1 h-full bg-surface-container/70 rounded flex flex-col items-center justify-between p-2">
            <div className="w-full flex items-center justify-between">
              <span className="font-label-status text-label-status text-on-surface-variant">İÇ KAPAK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim"></span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span className="font-label-telemetry text-label-telemetry text-primary mt-1 font-bold">MÜHÜRLÜ</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-full"></div>
            </div>
          </div>

          {/* Conduit Connector Pipe */}
          <div className="w-3 flex flex-col items-center justify-center gap-1">
            <span className="w-1 h-1 rounded-full bg-secondary-fixed-dim/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
            <span className="w-1 h-1 rounded-full bg-secondary-fixed-dim/40"></span>
          </div>

          {/* Node 2: Ara Hazne (Aktif Tahliye) */}
          <div className="relative z-10 flex-[1.4] h-full bg-surface-container/90 rounded flex flex-col items-center justify-between p-2 shadow-inner">
            <div className="w-full flex items-center justify-between">
              <span className="font-label-status text-label-status text-secondary-fixed font-bold">ARA HAZNE</span>
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-secondary-fixed text-[30px] animate-spin" style={{ animationDuration: '6s' }}>cyclone</span>
              <span className="font-label-telemetry text-label-telemetry text-secondary-fixed mt-1 font-bold">TAHLİYE OLUYOR</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden flex">
              <div className="bg-secondary-fixed-dim h-full w-[48%] animate-pulse"></div>
            </div>
          </div>

          {/* Conduit Connector Pipe */}
          <div className="w-3 flex flex-col items-center justify-center gap-1">
            <span className="w-1 h-1 rounded-full bg-outline-variant/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            <span className="w-1.5 h-1 rounded-full bg-outline-variant/40"></span>
          </div>

          {/* Node 3: Dış Kapak */}
          <div className="relative z-10 flex-1 h-full bg-surface-container/70 rounded flex flex-col items-center justify-between p-2">
            <div className="w-full flex items-center justify-between">
              <span className="font-label-status text-label-status text-on-surface-variant">DIŞ KAPAK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-error text-[28px]">lock_clock</span>
              <span className="font-label-telemetry text-label-telemetry text-error mt-1 font-bold">KİLİTLİ</span>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
              <div className="bg-error h-full w-[15%]"></div>
            </div>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex items-center justify-between bg-surface-container-highest/60 px-space-sm py-1 rounded">
          <span className="font-label-status text-label-status text-on-surface-variant">HAVA KİLİDİ BASINÇ DEĞERİ</span>
          <span className="font-label-telemetry text-label-telemetry text-secondary-fixed font-bold">2.84 BAR (DENGELEMEDE)</span>
        </div>
      </div>

      {/* Engineer Progress Telemetry Module */}
      <div className="bg-surface-container-high rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary-fixed text-[18px]">engineering</span>
            <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-wider uppercase font-bold">MÜHENDİSİN İLERLEMESİ</span>
          </div>
          <span className="font-label-telemetry text-label-telemetry text-primary-fixed-dim font-bold">
            {isSolved ? 'ADIM 4/4 TAMAMLANDI' : isAuthorized ? 'ADIM 3/4 TAMAMLANDI' : 'ADIM 2/4 TAMAMLANDI'}
          </span>
        </div>
        {/* Segmented Bar Meter */}
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          <div className="h-2 rounded bg-primary shadow-sm"></div>
          <div className="h-2 rounded bg-primary shadow-sm"></div>
          <div className={`h-2 rounded ${isAuthorized ? 'bg-primary shadow-sm' : 'bg-surface-container-highest animate-pulse'}`}></div>
          <div className={`h-2 rounded ${isSolved ? 'bg-primary shadow-sm' : 'bg-surface-container-highest'}`}></div>
        </div>
        <div className="flex justify-between items-center text-on-surface-variant font-label-status text-label-status mt-1">
          <span>Sinyal: Senkronize</span>
          <span className="text-secondary-fixed font-semibold">
            {isSolved ? 'Kapak açıldı' : isAuthorized ? 'Mühendis son kilidi açıyor' : 'Mühendis 3. Adımı bekliyor'}
          </span>
        </div>
      </div>

      {/* Protocol Execution Steps Card Stack */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between px-space-xs">
          <span className="font-label-telemetry text-label-telemetry text-on-surface tracking-widest uppercase font-bold">
            BASINÇ TAHLİYE VE KİLİT ADIMLARI
          </span>
          <span className="font-label-status text-label-status text-on-surface-variant font-semibold">SIRALAMA ŞARTI KRİTİK</span>
        </div>

        {/* Step 1 */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md shadow-sm opacity-90">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">1. Adım: Birincil Valf</span>
              <span className="font-label-status text-label-status text-primary uppercase font-bold">ONAYLANDI</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Valfi %50 Aç (Dış Basınç Dengeleme)
            </span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-md shadow-sm opacity-90">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">2. Adım: Sızdırmazlık Mandalları</span>
              <span className="font-label-status text-label-status text-primary uppercase font-bold">ONAYLANDI</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Mandalları Aktif Et (Kilit Açısı 90°)
            </span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-surface-container rounded-xl p-space-md flex items-center gap-space-md shadow-md">
          <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed font-bold">03</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-secondary-fixed font-semibold">3. Adım: Tahliye Pompası</span>
              <span className="font-label-status text-label-status text-secondary-fixed uppercase animate-pulse font-bold">SIRADAKİ</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface">
              Pompayı Düşük Güçte Çalıştır (2.4 Bar Hedef)
            </span>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md flex items-center gap-space-md shadow-inner opacity-60">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
            <span className="font-label-telemetry text-label-telemetry text-on-surface-variant font-bold">04</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface-variant font-semibold">4. Adım: Dış Kapak Kilidi</span>
              <span className="font-label-status text-label-status text-outline font-bold">KİLİTLİ</span>
            </div>
            <span className="font-body-sm text-body-sm text-outline-variant truncate">
              Dış Kapak Kilidini Çöz (Vakum Serbestliği)
            </span>
          </div>
        </div>
      </div>

      {/* Critical Tactical Safety Alert Notice */}
      <div className="bg-error-container/40 p-space-md rounded-xl flex items-start gap-space-sm shadow-sm border border-red-500/20">
        <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">warning</span>
        <div className="flex flex-col">
          <span className="font-label-telemetry text-label-telemetry text-error uppercase tracking-wider font-bold">HAYATİ RİSK PROTOKOLÜ</span>
          <span className="font-body-sm text-body-sm text-on-error-container leading-snug mt-0.5">
            Basınç 2.0 Bar altına inmeden dış kapağı kesinlikle serbest bırakma! Kabin içi dekompresyona uğrar.
          </span>
        </div>
      </div>

      {/* Tactile Push Trigger Button Action Container */}
      <div className="flex flex-col gap-space-xs pt-space-xs">
        {!isSolved ? (
          <button
            type="button"
            onClick={handleAuthorize}
            className="group relative w-full h-14 bg-gradient-to-r from-primary-container to-surface-tint rounded-xl shadow-lg flex items-center justify-center gap-space-sm transition-all active:scale-[0.98] select-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isAuthorized ? 'task_alt' : 'verified_user'}
            </span>
            <span className="font-headline-sm text-headline-sm text-on-primary tracking-wide uppercase font-bold">
              {isAuthorized ? 'ONAY İLETİLDİ // SENKRONİZE' : 'PROTOKOL GÜVENLİK ONAYI VER'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdvancePhase}
            className="w-full h-14 bg-gradient-to-r from-secondary-container to-secondary-fixed rounded-xl text-on-secondary-container shadow-lg flex items-center justify-center gap-space-sm transition-all active:scale-[0.98] cursor-pointer font-headline-sm text-headline-sm font-bold uppercase animate-pulse"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <span>HAVA KİLİDİ AÇILDI • DEVAM ET</span>
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
          <span className="font-label-status text-label-status text-on-surface-variant uppercase tracking-widest font-semibold">
            ŞİFRELİ VERİ HATTI // MÜHENDİS KONSOLUNA AKTARILMAYA HAZIR
          </span>
        </div>
      </div>
    </div>
  );
};
