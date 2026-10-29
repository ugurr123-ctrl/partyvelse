import React from 'react';
import { MissionState } from '../../types/game';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onFinalizeMission: () => void;
}

export const Screen17ARescue: React.FC<Props> = ({ state, onUpdate, onFinalizeMission }) => {
  const { rescue, energy, myRole, hullIntegrity, timeLeftSeconds } = state;
  const { selectedRouteId, captainApproved, engineerApproved } = rescue;

  const handleSelectRoute = (routeId: 'alfa' | 'beta' | 'gama') => {
    onUpdate((prev) => ({
      ...prev,
      rescue: {
        ...prev.rescue,
        selectedRouteId: routeId,
        captainApproved: false,
        engineerApproved: false,
      },
    }));
  };

  const handleToggleMyApproval = () => {
    onUpdate((prev) => {
      const isCaptain = prev.myRole === 'kaptan';
      return {
        ...prev,
        rescue: {
          ...prev.rescue,
          captainApproved: isCaptain ? !prev.rescue.captainApproved : prev.rescue.captainApproved,
          engineerApproved: !isCaptain ? !prev.rescue.engineerApproved : prev.rescue.engineerApproved,
        },
      };
    });
  };

  const handleSimulatePartnerApproval = () => {
    onUpdate((prev) => {
      const isCaptain = prev.myRole === 'kaptan';
      return {
        ...prev,
        rescue: {
          ...prev.rescue,
          captainApproved: !isCaptain ? !prev.rescue.captainApproved : prev.rescue.captainApproved,
          engineerApproved: isCaptain ? !prev.rescue.engineerApproved : prev.rescue.engineerApproved,
        },
      };
    });
  };

  const bothApproved = captainApproved && engineerApproved;

  const handleConfirmRescue = () => {
    let rescued = 10;
    if (selectedRouteId === 'alfa') rescued = 6;
    else if (selectedRouteId === 'beta') rescued = 8;
    else rescued = 10;

    onUpdate((prev) => ({
      ...prev,
      status: 'phase_result',
      outcomeType: 'tam_basari',
      rescuedCrewCount: rescued,
      completedTasksCount: 3,
      finalScore: 940,
    }));
    onFinalizeMission();
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9]">
      {/* Telemetry Sub-HUD */}
      <div className="flex items-center justify-between py-space-xs px-space-sm bg-surface-container-lowest/80 rounded-xl backdrop-blur-md shadow-md mt-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
          <span className="font-label-telemetry text-label-telemetry text-on-surface uppercase tracking-wider font-bold">PARTYVERSE</span>
        </div>
        <div className="flex items-center gap-space-md">
          {/* Tactical Timer */}
          <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-lg bg-surface-container-high/90">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
            <span className="font-headline-sm text-headline-sm text-primary-fixed tracking-wider font-bold" id="countdown-timer">
              {Math.floor(timeLeftSeconds / 60).toString().padStart(2, '0')}:
              {(timeLeftSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          {/* Sector Integrity Gauge */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <span className="font-label-status text-label-status text-on-surface-variant">BÜTÜNLÜK</span>
              <span className="font-label-telemetry text-label-telemetry text-secondary-container font-bold">%{hullIntegrity}</span>
            </div>
            <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex">
              <div className="h-full bg-secondary-container rounded-full" style={{ width: `${hullIntegrity}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Header */}
      <div className="flex flex-col gap-1 mt-1">
        <h2 className="font-display-hero-mobile text-display-hero-mobile text-on-surface tracking-tight leading-none font-black">
          Son karar <span className="text-primary-container drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">sizin</span>
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[92%] leading-snug">
          Kurtarma kapsüllerine giden rotayı seçin ve enerjiyi dağıtın.
        </p>
      </div>

      {/* 2.5D Deep Space Orbital Rescue Vector Map */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-surface-container-lowest shadow-xl flex items-center justify-center">
        <div 
          className="bg-cover bg-center absolute inset-0 opacity-45 mix-blend-screen pointer-events-none" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBTFgRxTb9oT2eOzps306S14o9MozAPPqZZqoMSaJf74cD-RdXeo4RWcDgTr8Uj5Bm0kZ7NWvvGpUHLerc7dGQeH-7G57r1ZPXqHpMLV0EcY667RaBmXMJLWxeX-REwvuheIDG__DSaiwWnoGWaZIoQfsmbc1FUocT51if5Fb4hkqpLMwa0kPWhiJ2dYLhk6a9jVSZhiMmh6xMEbhTvRRrgyRwGukgPDd_qY1JWkYE')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-surface-dim/70 pointer-events-none"></div>

        {/* Station & Flight Path Holographic Vectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 380 320">
          {/* Damaged Station Anchor Rings */}
          <circle className="text-outline-variant/40" cx="85" cy="205" r="54" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1.5"></circle>
          <circle className="text-primary/30" cx="85" cy="205" r="38" stroke="currentColor" strokeWidth="2"></circle>
          <circle className="text-surface-container-highest" cx="85" cy="205" fill="currentColor" r="16"></circle>
          <circle className="text-primary-container" cx="85" cy="205" fill="currentColor" r="8"></circle>

          {/* Route 1: Sığınak (Cyan Dash) */}
          <path className="text-secondary-container" d="M 85 160 C 90 90, 130 75, 175 70" stroke="currentColor" strokeDasharray="4 3" strokeLinecap="round" strokeWidth={selectedRouteId === 'alfa' ? 3.5 : 2}></path>
          <circle className="text-secondary-container" cx="175" cy="70" fill="currentColor" r="4"></circle>

          {/* Route 2: Hızlı Geçiş (Soft Blue Arc) */}
          <path className="text-secondary-fixed-dim" d="M 115 175 C 170 145, 230 140, 275 110" stroke="currentColor" strokeDasharray="5 4" strokeLinecap="round" strokeWidth={selectedRouteId === 'beta' ? 3.5 : 2}></path>
          <circle className="text-secondary-fixed-dim" cx="275" cy="110" fill="currentColor" r="4"></circle>

          {/* Route 3: Konvoy (Active Warm Gold Solid Path) */}
          <path className="text-primary-container" d="M 125 215 C 190 220, 230 200, 270 210" stroke="currentColor" strokeLinecap="round" strokeWidth={selectedRouteId === 'gama' ? 4 : 2.5}></path>
          <path className="text-primary-fixed" d="M 125 215 C 190 220, 230 200, 270 210" stroke="currentColor" strokeDasharray="2 6" strokeWidth="1"></path>
        </svg>

        {/* Pod 1: Sığınak */}
        <button 
          type="button"
          onClick={() => handleSelectRoute('alfa')}
          className={`route-selector absolute top-5 left-32 px-space-sm py-1 rounded-lg backdrop-blur-md shadow-md text-left transition-transform active:scale-95 flex flex-col items-center cursor-pointer ${
            selectedRouteId === 'alfa' 
              ? 'bg-surface-container-high ring-2 ring-secondary-container shadow-[0_0_15px_rgba(0,238,252,0.4)]' 
              : 'bg-surface-container-high/90 hover:bg-surface-container-highest'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span className="font-label-telemetry text-label-telemetry text-secondary-container font-bold">Sığınak</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">6 kişi</span>
        </button>

        {/* Pod 2: Hızlı Geçiş */}
        <button 
          type="button"
          onClick={() => handleSelectRoute('beta')}
          className={`route-selector absolute top-16 right-7 px-space-sm py-1 rounded-lg backdrop-blur-md shadow-md text-left transition-transform active:scale-95 flex flex-col items-center cursor-pointer ${
            selectedRouteId === 'beta' 
              ? 'bg-surface-container-high ring-2 ring-secondary-fixed shadow-[0_0_15px_rgba(125,244,255,0.4)]' 
              : 'bg-surface-container-high/90 hover:bg-surface-container-highest'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim"></span>
            <span className="font-label-telemetry text-label-telemetry text-secondary-fixed font-bold">Hızlı geçiş</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">8 kişi</span>
        </button>

        {/* Pod 3: Konvoy (Selected State) */}
        <button 
          type="button"
          onClick={() => handleSelectRoute('gama')}
          className={`route-selector absolute bottom-12 right-6 px-space-md py-1.5 rounded-lg backdrop-blur-md text-left transition-transform active:scale-95 flex flex-col items-center cursor-pointer ${
            selectedRouteId === 'gama'
              ? 'bg-surface-container-high/95 ring-2 ring-primary shadow-[0_0_20px_rgba(255,183,3,0.4)]'
              : 'bg-surface-container-high/90 hover:bg-surface-container-highest'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-telemetry text-label-telemetry text-primary-container font-bold">Konvoy</span>
          </div>
          <span className="font-body-sm text-body-sm text-primary font-bold">10 kişi</span>
        </button>

        {/* Orbit Telemetry Stamp */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/80 font-label-status text-label-status text-on-surface-variant">
          <span className="material-symbols-outlined text-[12px] text-primary-container">radar</span>
          <span className="font-bold">YÖRÜNGE: 104-E SEKTÖRÜ</span>
        </div>
      </div>

      {/* Enerji Dağılımı Panel (Console Module) */}
      <div className="flex flex-col bg-surface-container-low rounded-xl p-space-md shadow-lg gap-space-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[20px] text-primary-container">bolt</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">Enerji dağılımı</h3>
          </div>
          <div className="px-space-sm py-0.5 rounded-lg bg-surface-container-highest">
            <span className="font-label-telemetry text-label-telemetry text-on-surface font-bold">12 / 12 ENERJİ</span>
          </div>
        </div>

        {/* 3 Equalized Power Columns */}
        <div className="grid grid-cols-3 gap-space-sm">
          {/* Column 1: Yaşam */}
          <div className="flex flex-col items-center p-space-sm rounded-lg bg-surface-container-high/80 gap-space-xs shadow-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-container/15 flex items-center justify-center text-secondary-container">
              <span className="material-symbols-outlined text-[18px]">ecg_heart</span>
            </div>
            <span className="font-headline-sm text-[13px] leading-4 text-on-surface font-semibold">Yaşam</span>
            <span className="font-label-telemetry text-[11px] text-secondary-container font-bold">3 / 12</span>
            {/* Segment Meter */}
            <div className="flex flex-col-reverse w-full gap-1 pt-1.5 px-space-xs">
              <div className="h-3 w-full rounded bg-secondary-container shadow-[0_0_8px_rgba(0,238,252,0.6)]"></div>
              <div className="h-3 w-full rounded bg-secondary-container shadow-[0_0_8px_rgba(0,238,252,0.6)]"></div>
              <div className="h-3 w-full rounded bg-secondary-container shadow-[0_0_8px_rgba(0,238,252,0.6)]"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
            </div>
          </div>

          {/* Column 2: İtki */}
          <div className="flex flex-col items-center p-space-sm rounded-lg bg-surface-container-high/80 gap-space-xs shadow-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed/15 flex items-center justify-center text-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            </div>
            <span className="font-headline-sm text-[13px] leading-4 text-on-surface font-semibold">İtki</span>
            <span className="font-label-telemetry text-[11px] text-secondary-fixed font-bold">3 / 12</span>
            {/* Segment Meter */}
            <div className="flex flex-col-reverse w-full gap-1 pt-1.5 px-space-xs">
              <div className="h-3 w-full rounded bg-secondary-fixed shadow-[0_0_8px_rgba(125,244,255,0.6)]"></div>
              <div className="h-3 w-full rounded bg-secondary-fixed shadow-[0_0_8px_rgba(125,244,255,0.6)]"></div>
              <div className="h-3 w-full rounded bg-secondary-fixed shadow-[0_0_8px_rgba(125,244,255,0.6)]"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
            </div>
          </div>

          {/* Column 3: Kalkan */}
          <div className="flex flex-col items-center p-space-sm rounded-lg bg-surface-container-high/80 gap-space-xs shadow-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="font-headline-sm text-[13px] leading-4 text-on-surface font-semibold">Kalkan</span>
            <span className="font-label-telemetry text-[11px] text-primary-container font-bold">6 / 12</span>
            {/* Segment Meter */}
            <div className="flex flex-col-reverse w-full gap-1 pt-1.5 px-space-xs">
              <div className="h-3 w-full rounded bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]"></div>
              <div className="h-3 w-full rounded bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]"></div>
              <div className="h-3 w-full rounded bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]"></div>
              <div className="h-3 w-full rounded bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]"></div>
              <div className="h-3 w-full rounded bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]"></div>
              <div className="h-3 w-full rounded bg-primary-container shadow-[0_0_10px_rgba(255,183,3,0.7)]"></div>
              <div className="h-3 w-full rounded bg-surface-container-highest/80"></div>
            </div>
          </div>
        </div>

        {/* Hazard Lock Strip */}
        <div className="w-full flex items-center justify-center gap-space-sm py-2 px-space-md rounded-lg bg-surface-container-highest/60 text-on-surface-variant font-label-telemetry text-label-telemetry">
          <span className="material-symbols-outlined text-[16px] text-primary-container">lock</span>
          <span className="uppercase tracking-wider font-bold">DAĞILIM KİLİTLENDİ // HAZIR</span>
        </div>
      </div>

      {/* Ekip Onayı (Team Approval Strip) */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-1">
          <span className="font-label-status text-label-status text-on-surface-variant uppercase tracking-wider font-bold">EKİP ONAY DURUMU</span>
          <span className="font-label-telemetry text-label-telemetry text-secondary-container font-bold">
            {bothApproved ? '2 / 2 ONAYLANDI' : (captainApproved || engineerApproved) ? '1 / 2 ONAYLANDI' : '0 / 2 ONAYLANDI'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Player 1: Ece (Kaptan) */}
          <button
            type="button"
            onClick={myRole === 'kaptan' ? handleToggleMyApproval : handleSimulatePartnerApproval}
            className={`flex items-center gap-space-sm p-space-sm rounded-xl transition-all cursor-pointer text-left ${
              captainApproved 
                ? 'bg-surface-container-low ring-1 ring-emerald-400 shadow-md' 
                : 'bg-surface-container-lowest opacity-70 hover:opacity-100'
            }`}
          >
            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
              <img 
                className="w-full h-full object-cover" 
                alt="Ece" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqV6wpQu49Mh8hEqjkq68jgVaUm2F4-nPXEKVk7Ln7KvYH95qA486nRV_Hj4LUCg63CLQ5PXWHCbbK4rtnyn9zHCtgLL3YSH2ZLpPdOvM5syoXrmXjoduaP8SMQN77ciaxQDPB7MC_G3rjHcAjnsIS8TRPip--b7RL9Wd_CezN6y9VLFidVi13QGLx6H1F-PNbY2b1pVQjEQL-A9A_SfaJbTsTt8lX_aBMySlFFJA" 
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${captainApproved ? 'bg-secondary-container' : 'bg-surface-variant'}`}></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-sm text-on-surface truncate font-semibold">Ece (Kaptan)</span>
              {captainApproved ? (
                <div className="flex items-center gap-1 text-[#4ade80]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span className="font-label-telemetry text-[11px] font-bold">Onayladı</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-primary-container">
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  <span className="font-label-telemetry text-[11px] font-bold">Bekleniyor</span>
                </div>
              )}
            </div>
          </button>

          {/* Player 2: Mert (Mühendis) */}
          <button
            type="button"
            onClick={myRole === 'muhendis' ? handleToggleMyApproval : handleSimulatePartnerApproval}
            className={`flex items-center gap-space-sm p-space-sm rounded-xl transition-all cursor-pointer text-left ${
              engineerApproved 
                ? 'bg-surface-container-low ring-1 ring-emerald-400 shadow-md' 
                : 'bg-surface-container-lowest opacity-70 hover:opacity-100'
            }`}
          >
            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
              <img 
                className="w-full h-full object-cover" 
                alt="Mert" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaLZj2-7nEMaRm40oDtlsYHLzAHXb7QXUJmKyukh5AIIEZq4Vi7JMEuAJzR4PhGaFBNxiXEkBWrLcd72vhAKvvWmTq-2-agyhva7I7NPMWMO2E27nJwyBUoGSfltP0FziDASvTnkCHBUnovLcM4jjv-ackVbbuDeIcVc0imrtWlsYEIM3txRPJKUidEc9usQlQNYM979h5gsYt5b4rTXyy-mWw9bMeVoTKZbUfTTc" 
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${engineerApproved ? 'bg-secondary-container' : 'bg-primary-container animate-pulse'}`}></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-sm text-on-surface truncate font-semibold">Mert (Müh.)</span>
              {engineerApproved ? (
                <div className="flex items-center gap-1 text-[#4ade80]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span className="font-label-telemetry text-[11px] font-bold">Onayladı</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-primary-container">
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  <span className="font-label-telemetry text-[11px] font-bold">Bekleniyor</span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Heavy Arcade Push Trigger (Kurtarmayı Onayla) */}
      <div className="pt-space-xs pb-4">
        <button 
          type="button"
          onClick={handleConfirmRescue}
          disabled={!bothApproved}
          className={`w-full relative group h-14 rounded-xl text-on-primary-container font-headline-sm text-headline-sm font-bold flex items-center justify-between px-space-lg overflow-hidden transition-all ${
            bothApproved
              ? 'bg-gradient-to-r from-primary-container to-[#ff8c00] shadow-[0_6px_0_#995c00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 active:shadow-[0_2px_0_#995c00] cursor-pointer'
              : 'bg-surface-container-highest text-on-surface-variant opacity-60 cursor-not-allowed'
          }`}
          id="confirm-rescue-btn"
        >
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-space-sm z-10">
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <span className="tracking-wide uppercase font-extrabold">
              {bothApproved ? 'Kurtarmayı onayla' : 'Her iki onay bekleniyor'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-on-primary-container/15 flex items-center justify-center z-10 group-hover:translate-x-1 transition-transform">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </div>
        </button>
      </div>
    </div>
  );
};
