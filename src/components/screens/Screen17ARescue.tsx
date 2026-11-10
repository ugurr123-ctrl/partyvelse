import React, { useState } from 'react';
import { MissionState } from '../../types/game';
import { validateRescueDecision } from '../../services/phaseTransition';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onFinalizeMission: () => void;
  onAction?: (actionType: string, data: any) => void;
}

export const Screen17ARescue: React.FC<Props> = ({ state, onUpdate, onFinalizeMission, onAction }) => {
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const { rescue, energy, myRole, hullIntegrity, timeLeftSeconds } = state;
  const { selectedRouteId, captainApproved, engineerApproved, routes } = rescue;
  const [validationError, setValidationError] = useState<string | null>(null);

  // Derin Basınç Dümenci state
  const [activeVectorIndex, setActiveVectorIndex] = useState(1); // 1 = Mercan Koridoru (28°)
  const [transmittedCaptain, setTransmittedCaptain] = useState(captainApproved);

  // Derin Basınç Makinist state
  const [pressure, setPressure] = useState(18);
  const [angle, setAngle] = useState(28);
  const [tanks, setTanks] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: true, 4: false });
  const [isFiring, setIsFiring] = useState(false);

  const vectors = [
    { name: "Doğu Fayı (45°)", angle: "45° ACİL DİKEY İNTİKAL", d: "M10,60 C60,40 120,20 330,5", pts: "10,60 80,35 180,18 330,5 330,65 10,65", desc: "Eğim: 45° • Tahmini Süre: 1 dk 10 sn • Kaya Çökmesi", badge: "Kritik", badgeClass: "bg-[#93000a] text-[#ffdad6]" },
    { name: "Mercan Koridoru (28°)", angle: "28° DİKEY İNTİKAL", d: "M10,60 C90,52 180,38 330,8", pts: "10,60 120,48 240,24 330,8 330,65 10,65", desc: "Eğim: 28° • Optimal Süre: 1 dk 45 sn • Akıntı Düşük", badge: "GÜVENLİ / ÖNERİLEN", badgeClass: "bg-[#ffb703] text-[#422c00]" },
    { name: "Ana Kanyon (15°)", angle: "15° YATAY KORİDOR", d: "M10,60 C120,58 240,50 330,30", pts: "10,60 140,58 260,45 330,30 330,65 10,65", desc: "Eğim: 15° • Yavaş: 2 dk 30 sn • Yüksek Sürüklenme", badge: "Türbülans", badgeClass: "bg-[#363246] text-[#d5c4ac]" }
  ];

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const netLife = Math.max(0, energy.engineerAllocation.yasamDestegi - energy.lineLosses.yasamDestegi);
  const netThrust = Math.max(0, energy.engineerAllocation.itki - energy.lineLosses.itki);
  const netShield = Math.max(0, energy.engineerAllocation.kalkan - energy.lineLosses.kalkan);

  const hasThrustPower = netThrust >= activeRoute.powerRequirements.itki;
  const hasShieldPower = netShield >= activeRoute.powerRequirements.kalkan;
  const hasLifePower = netLife >= 3;
  const isEnergyLocked = energy.isLocked;

  const handleSelectRoute = (routeId: 'alfa' | 'beta' | 'gama') => {
    setValidationError(null);
    if (onAction) {
      onAction('rescue_select_route', { routeId });
      return;
    }
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
    setValidationError(null);
    if (onAction) {
      const isCaptain = myRole === 'kaptan';
      const current = isCaptain ? captainApproved : engineerApproved;
      onAction('rescue_toggle_approval', { approved: !current });
      return;
    }
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
    if (onAction) {
      return;
    }
    setValidationError(null);
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
    setValidationError(null);

    const validation = validateRescueDecision(state, activeRoute);
    if (!validation.success) {
      if (validation.nextState) {
        onUpdate(() => validation.nextState!);
        onFinalizeMission();
        return;
      }
      setValidationError(validation.error || 'Kurtarma doğrulaması başarısız oldu.');
      return;
    }

    onUpdate(() => validation.nextState!);
    onFinalizeMission();
  };

  // Derin Basınç Dümenci transmit
  const handleTransmitDümenci = () => {
    setTransmittedCaptain(true);
    if (onAction) {
      onAction('derin_basinc_transmit_vector', {
        vector: vectors[activeVectorIndex].name,
        angle: vectors[activeVectorIndex].angle,
      });
    }
    onUpdate((prev) => ({
      ...prev,
      rescue: {
        ...prev.rescue,
        captainApproved: true,
        selectedRouteId: activeVectorIndex === 0 ? 'alfa' : activeVectorIndex === 1 ? 'beta' : 'gama',
      },
    }));
  };

  // Derin Basınç Makinist trigger ascent
  const handleTriggerAscent = () => {
    setIsFiring(true);
    if (onAction) {
      onAction('derin_basinc_trigger_ascent', {
        pressure,
        angle,
        tanks,
      });
    }

    setTimeout(() => {
      onUpdate((prev) => ({
        ...prev,
        rescue: {
          ...prev.rescue,
          engineerApproved: true,
          captainApproved: true,
        },
      }));
      onFinalizeMission();
    }, 600);
  };

  // Toggle Tank handler
  const handleToggleTank = (id: number) => {
    setTanks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isGolgeProtokolu = state.operationTheme === 'golge_protokolu';
  const [golgeEscapeRoute, setGolgeEscapeRoute] = useState<'helipad' | 'metro'>('helipad');
  const [golgeCaptainTransmitted, setGolgeCaptainTransmitted] = useState<boolean>(captainApproved);

  const handleGolgeCaptainTransmit = () => {
    setGolgeCaptainTransmitted(true);
    if (onAction) {
      onAction('golge_transmit_escape', { route: golgeEscapeRoute });
    }
    onUpdate((prev) => ({
      ...prev,
      rescue: {
        ...prev.rescue,
        captainApproved: true,
        selectedRouteId: 'beta',
      },
    }));
  };

  const handleGolgeExecuteExtraction = () => {
    if (onAction) {
      onAction('golge_execute_extraction', { route: golgeEscapeRoute });
    }
    onUpdate((prev) => ({
      ...prev,
      rescue: {
        ...prev.rescue,
        engineerApproved: true,
        captainApproved: true,
      },
    }));
    onFinalizeMission();
  };

  // ================= GÖLGE PROTOKOLÜ — TAHLİYE (AJAN / KAPTAN) =================
  if (isGolgeProtokolu && myRole === 'kaptan') {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-4 px-margin gap-3 gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-[#ffb703] uppercase tracking-wider font-bold bg-[#201d30] px-2.5 py-0.5 rounded-full border border-white/5">
              FAZ 04 // TAHLİYE & ÇIKIŞ
            </span>
            <span className="font-mono text-[9px] text-[#00eefc] bg-[#201d30] px-2 py-0.5 rounded-full">
              %{state.stealthLevel ?? 98} GİZLİLİK
            </span>
          </div>
          <h2 className="font-sora text-xl font-bold text-white tracking-tight mt-1">
            ÇATI HELİPADİNE ÇIK // GİZLİ SIZMA KAÇIŞI
          </h2>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Kasa verisi çantada. Koridoru hızla tırman, çatıdaki hayalet hovercrafta ulaşmak için en güvenli rotayı seç ve hacker'a aktar.
          </p>
        </div>

        {/* 2 Routes Selection */}
        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={() => setGolgeEscapeRoute('helipad')}
            className={`p-3 rounded-xl border text-left transition-all ${
              golgeEscapeRoute === 'helipad'
                ? 'bg-[#0f0c1e] border-[#ffb703] shadow-[0_0_16px_rgba(255,183,3,0.25)]'
                : 'bg-[#201d30] border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sora text-xs text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffb703] text-[16px]">flight_takeoff</span>
                ÇATI HELİPADİ // HAYALET HOVERCRAFT
              </span>
              <span className="font-mono text-[8px] bg-[#ffb703] text-[#271900] px-2 py-0.5 rounded font-black">
                ÖNERİLEN
              </span>
            </div>
            <p className="font-manrope text-[11px] text-[#d5c4ac] mt-1">
              Hava sahası körleme altında. 120 saniyede radar izi bırakmadan temiz tahliye.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setGolgeEscapeRoute('metro')}
            className={`p-3 rounded-xl border text-left transition-all ${
              golgeEscapeRoute === 'metro'
                ? 'bg-[#0f0c1e] border-[#00eefc] shadow-[0_0_16px_rgba(0,238,252,0.25)]'
                : 'bg-[#201d30] border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-sora text-xs text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[16px]">subway</span>
                METRO TÜNELİ // SERVİS ASANSÖRÜ
              </span>
              <span className="font-mono text-[8px] bg-[#93000a]/50 text-[#ffb4ab] px-2 py-0.5 rounded font-bold">
                YÜKSEK RİSK
              </span>
            </div>
            <p className="font-manrope text-[11px] text-[#d5c4ac] mt-1">
              Hızlı fakat kameralar aktif olabilir. Güvenlik devriyeleriyle temas riski var.
            </p>
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGolgeCaptainTransmit}
            className={`w-full py-4 px-4 rounded-xl font-sora text-xs font-black uppercase tracking-tight flex items-center justify-center gap-2 shadow-xl active:translate-y-1 transition-all cursor-pointer ${
              golgeCaptainTransmitted
                ? 'bg-[#00eefc] text-[#002022] shadow-[0_4px_0_#00686f]'
                : 'bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#f59e0b] text-[#271900] shadow-[0_4px_0_#6b4b00]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {golgeCaptainTransmitted ? 'check_circle' : 'cell_tower'}
            </span>
            <span>
              {golgeCaptainTransmitted
                ? 'ROTA HACKER’A AKTARILDI // ONAY BEKLENİYOR'
                : 'TAHLİYE ROTASINI HACKER’A AKTAR'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ================= GÖLGE PROTOKOLÜ — TAHLİYE (HACKER / MÜHENDİS) =================
  if (isGolgeProtokolu && myRole === 'muhendis') {
    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-4 px-margin gap-3 gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-[#00eefc] uppercase tracking-wider font-bold bg-[#201d30] px-2.5 py-0.5 rounded-full border border-white/5">
              FAZ 04 // SİBER TAHLİYE PROTOKOLÜ
            </span>
            <span className="font-mono text-[9px] text-[#ffb703] bg-[#201d30] px-2 py-0.5 rounded-full">
              SİNYAL: GİZLİ
            </span>
          </div>
          <h2 className="font-sora text-xl font-bold text-white tracking-tight mt-1">
            HAVA SAHASI RADARINI KÖR ET & ÇIKIŞ SİNYALİ VER
          </h2>
          <p className="font-manrope text-[11px] text-[#d5c4ac] leading-relaxed">
            Megacorp hava savunma radarını karıştır, sahadaki ajanın kaçış hovercraftına sinyal koridoru aç ve sunucu loglarını sil.
          </p>
        </div>

        {/* Tactical Extraction Radar Status Box */}
        <div className="bg-[#1c192c] rounded-xl p-3 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white font-bold uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">radar</span>
              HAVA SAHASI DEŞİFRE RADARI
            </span>
            <span className="font-mono text-[9px] text-emerald-400 font-bold">%0 İZ // TEMİZ</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f0c1e] border border-white/5 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-white">
              <span className="text-[#9e8f78]">Hava Savunma Droneları:</span>
              <span className="text-[#00eefc] font-bold">KÖRLEŞTİRİLDİ</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-[#9e8f78]">Seçilen Kaçış Koridoru:</span>
              <span className="text-[#ffb703] font-bold">Çatı Helipad Hovercraft</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="text-[#9e8f78]">Siber İz Silinmesi:</span>
              <span className="text-emerald-400 font-bold">TAMAMLANDI</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGolgeExecuteExtraction}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#FF8C00] shadow-[0_4px_0_#B26A00] active:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-[#271900] font-sora text-xs font-black uppercase tracking-tight cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            <span>GÖLGE TAHLİYEYİ TETİKLE & SİBER İZLERİ SİL ›</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= DERİN BASINÇ — KAÇIŞ ROTASI (DÜMENCİ) =================
  if (isDerinBasinc && myRole === 'kaptan') {
    const curVector = vectors[activeVectorIndex];

    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
        
        {/* Mission Brief Status Header */}
        <div className="flex flex-col gap-space-xs mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs bg-[#2b273b] px-space-sm py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-ping"></span>
              <span className="font-mono text-[11px] text-[#ffdba0] tracking-wider uppercase font-bold">ROL: DÜMENCİ // KILAVUZ</span>
            </div>
            <div className="flex items-center gap-space-xs bg-[#201d30] px-space-sm py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px] text-[#d3fbff]">radar</span>
              <span className="font-mono text-[11px] text-[#d3fbff] uppercase font-bold">SONAR AKTİF</span>
            </div>
          </div>
          <h2 className="font-sora text-[24px] font-extrabold text-[#ffdba0] tracking-tight mt-1">
            Kaçış Rotasını Çiz
          </h2>
          <p className="text-[12px] text-[#d5c4ac] leading-relaxed">
            Abisal hendekten acil yüzeye çıkış koridorunu belirle. Güvenli balast tahliye açısını telsizden makiniste aktar.
          </p>
        </div>

        {/* 2.5D Sonar Trench Cross-Section Card */}
        <div className="relative bg-[#1c192c] rounded-xl overflow-hidden shadow-2xl p-space-md flex flex-col gap-space-md border border-white/5">
          {/* Top Sonar Telemetry Overlay Bar */}
          <div className="relative z-10 flex items-center justify-between bg-[#0f0c1e]/90 px-space-sm py-space-xs rounded-lg backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#00eefc] animate-spin" style={{ animationDuration: '4s' }}>
                motion_photos_on
              </span>
              <span className="font-mono text-[10px] uppercase text-[#00eefc] font-bold">3D DİKEY KESİT // HANDEK -1250M</span>
            </div>
            <span className="font-mono text-[11px] text-[#ffb703] font-bold">EĞİM VEKTÖRÜ: ±5°</span>
          </div>

          {/* Interactive Ascent Vector Selector Map */}
          <div className="relative z-10 flex flex-col gap-space-sm">
            {vectors.map((vec, idx) => {
              const isSelected = activeVectorIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveVectorIndex(idx)}
                  className={`w-full text-left p-space-sm rounded-lg transition-all flex items-center justify-between shadow-md active:scale-[0.99] cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#363246] shadow-xl ring-1 ring-[#ffb703]'
                      : 'bg-[#2b273b]/85 hover:bg-[#3a374b]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#00eefc] via-[#ffb703] to-[#00eefc]"></div>
                  )}
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#0f0c1e] flex items-center justify-center shrink-0">
                      <span className={`material-symbols-outlined text-[18px] ${idx === 0 ? 'text-[#ffb4ab]' : idx === 1 ? 'text-[#ffb703]' : 'text-[#9e8f78]'}`}>
                        {idx === 0 ? 'warning' : idx === 1 ? 'recommend' : 'air'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-sora text-[15px] font-bold truncate ${isSelected ? 'text-[#ffdea9]' : 'text-[#e6dff9]'}`}>
                          {vec.name}
                        </span>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${vec.badgeClass}`}>
                          {vec.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#d5c4ac] truncate">{vec.desc}</span>
                    </div>
                  </div>
                  <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${isSelected ? 'bg-[#ffb703]' : 'bg-[#363246]'}`}>
                    <span className={`material-symbols-outlined text-[16px] ${isSelected ? 'text-[#422c00] font-bold' : 'text-[#9e8f78] opacity-40'}`}>
                      {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Real-time SVG Vector Elevation Projection Graphic */}
          <div className="relative z-10 w-full h-24 bg-[#0f0c1e] rounded-lg p-space-xs overflow-hidden flex flex-col justify-between border border-white/5">
            <div className="flex items-center justify-between px-space-xs pt-1">
              <span className="font-mono text-[10px] uppercase text-[#9e8f78]">ROTASYON DİYAGRAMI // DERİNLİK PROFİLİ</span>
              <span className="font-mono text-[11px] text-[#00eefc] font-bold">{curVector.angle}</span>
            </div>
            <svg className="w-full h-14" preserveAspectRatio="none" viewBox="0 0 340 70">
              <defs>
                <linearGradient id="grad-path" x1="0%" x2="100%" y1="100%" y2="0%">
                  <stop offset="0%" stopColor="#00eefc" stopOpacity="0.2"></stop>
                  <stop offset="100%" stopColor="#ffb703" stopOpacity="0.9"></stop>
                </linearGradient>
                <linearGradient id="grad-area" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffb703" stopOpacity="0.15"></stop>
                  <stop offset="100%" stopColor="#ffb703" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <line stroke="#363246" strokeDasharray="3 3" strokeWidth="0.7" x1="0" x2="340" y1="20" y2="20"></line>
              <line stroke="#363246" strokeDasharray="3 3" strokeWidth="0.7" x1="0" x2="340" y1="45" y2="45"></line>
              <path d="M0,65 Q80,55 170,62 T340,58 L340,70 L0,70 Z" fill="#201d30"></path>
              <polygon fill="url(#grad-area)" points={curVector.pts}></polygon>
              <path d={curVector.d} fill="none" stroke="url(#grad-path)" strokeLinecap="round" strokeWidth="3"></path>
              <circle cx="10" cy="60" fill="#00eefc" r="3.5"></circle>
              <circle cx="170" cy="38" fill="#ffb703" r="3"></circle>
              <circle className="animate-pulse" cx="330" cy="8" fill="#ffdba0" r="4.5"></circle>
            </svg>
          </div>
        </div>

        {/* Classified Tactical Instructions Box (Pilot-only Secret) */}
        <div className="relative bg-[#201d30] rounded-xl p-space-md shadow-lg overflow-hidden border border-white/5">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <span className="font-mono text-[11px] text-[#ffb703] uppercase tracking-wider font-bold">GİZLİ KILAVUZ VERİSİ</span>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#ffb4ab] font-bold px-1.5 py-0.5 rounded bg-[#93000a]/40">
              MAKİNİST GÖREMEZ
            </span>
          </div>
          <p className="text-[12px] text-[#d5c4ac] mb-space-sm">
            Aşağıdaki parametreleri telsizden doğrudan mühendis ortağına sesli bildir veya sisteme onayla:
          </p>
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between bg-[#1c192c] px-space-sm py-2 rounded-lg">
              <span className="text-[12px] text-[#e6dff9]">Önerilen Koridor:</span>
              <span className="font-mono text-[11px] text-[#00eefc] uppercase font-bold">{curVector.name}</span>
            </div>
            <div className="flex items-center justify-between bg-[#1c192c] px-space-sm py-2 rounded-lg">
              <span className="text-[12px] text-[#e6dff9]">Tahliye İhtiyacı:</span>
              <span className="font-mono text-[11px] text-[#ffdba0] uppercase font-bold">Tank 1 & 3 (%100 Boşaltım)</span>
            </div>
            <div className="flex items-center justify-between bg-[#1c192c] px-space-sm py-2 rounded-lg">
              <span className="text-[12px] text-[#e6dff9]">Kritik Basınç Sınırı:</span>
              <span className="font-mono text-[11px] text-[#ffb703] font-bold">18 BAR DEKOMPRESYON</span>
            </div>
          </div>
        </div>

        {/* Crew Co-Op Voice Link Status Widget */}
        <div className="bg-[#1c192c] rounded-xl p-space-sm flex items-center justify-between shadow-md border border-white/5">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#2b273b] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00eefc] text-[22px]">engineering</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00eefc] ring-2 ring-[#1c192c]"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-sora text-[15px] font-bold text-[#e6dff9] truncate">Makinist Mert</span>
                <span className="material-symbols-outlined text-[14px] text-[#00eefc]">mic</span>
              </div>
              <span className="text-[11px] text-[#d5c4ac] truncate">Kabin: Balast valfleri başında emir bekliyor</span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1 bg-[#2b273b] px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse"></span>
            <span className="font-mono text-[10px] text-[#00eefc] font-bold">CANLI</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-space-xs flex flex-col gap-space-xs pb-4">
          <button
            type="button"
            onClick={handleTransmitDümenci}
            className={`w-full py-3.5 px-space-lg rounded-xl font-sora font-extrabold text-[15px] tracking-wide uppercase flex items-center justify-center gap-space-sm shadow-xl active:translate-y-1 transition-all cursor-pointer ${
              transmittedCaptain
                ? 'bg-[#00eefc] text-[#002022] shadow-[0_6px_0_#00686f]'
                : 'bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#422c00] shadow-[0_6px_0_#6b4b00,0_8px_20px_rgba(255,183,3,0.3)]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {transmittedCaptain ? 'check_circle' : 'cell_tower'}
            </span>
            <span>{transmittedCaptain ? 'Makiniste Aktarıldı (Bağlantı Kuruldu)' : 'Kaçış Verilerini Makiniste Aktar'}</span>
          </button>
          <span className="font-mono text-[10px] text-center text-[#9e8f78] uppercase tracking-wider block">
            Onay verildiğinde rotasyon koordinatları eşzamanlı aktarılır
          </span>
        </div>

      </div>
    );
  }

  // ================= DERİN BASINÇ — ACİL TAHLİYE (MAKİNİST) =================
  if (isDerinBasinc && myRole === 'muhendis') {
    const activeTanksCount = Object.values(tanks).filter(Boolean).length;

    return (
      <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin space-y-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
        
        {/* Mission Briefing & Persona HUD banner */}
        <div className="relative overflow-hidden rounded-xl bg-[#1c192c] p-space-md shadow-xl border border-white/5 mt-1">
          <div className="flex items-center justify-between gap-space-sm mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ffb703] animate-ping"></span>
              <span className="font-mono text-[11px] text-[#ffb703] tracking-wider uppercase font-bold">KRİTİK BASINÇ SEVİYESİ</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#363246]">
              <span className="material-symbols-outlined text-[14px] text-[#d3fbff]">build</span>
              <span className="font-mono text-[10px] text-[#d3fbff] uppercase font-bold">ROL: MAKİNİST</span>
            </div>
          </div>
          <h2 className="font-sora text-[22px] font-black text-[#ffdba0] tracking-tight mb-1">
            ACİL BALAST TAHLİYESİ
          </h2>
          <p className="text-[12px] text-[#d5c4ac] leading-relaxed">
            Dümencinin telsizle bildirdiği kaçış rotası açısını ve balast tahliye sırasını eşle, acil azot tahliyesini senkronize et.
          </p>

          {/* Cockpit Live Audio Callout Feed */}
          <div className="mt-space-sm rounded-lg bg-[#201d30] p-space-sm flex items-start gap-space-sm border border-white/5">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#3a374b] flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-[#ffb703] text-[24px]">navigation</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00dbe9]"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-mono text-[11px] text-[#00eefc] uppercase tracking-wider font-bold">TELSİZ // DÜMENCİ (ECE)</span>
                <span className="font-mono text-[10px] text-[#d5c4ac]">CANLI SES</span>
              </div>
              <p className="text-[12px] text-[#e6dff9] italic font-medium leading-tight">
                “Makinist! 28° açıyla Mercan Koridoruna kilitlen, Tank 1 ve Tank 3'ü tam tahliye et!”
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Submarine Hull Preview */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#0f0c1e] flex items-center justify-center shadow-md border border-white/5 p-4">
          <div className="relative z-10 w-full flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-[#d5c4ac] uppercase font-bold">BALAST DURUMU</span>
              <div className="flex items-center gap-1.5">
                <span className="font-sora text-[20px] text-[#00eefc] font-black">{activeTanksCount} / 4 AKTİF</span>
                <span className="material-symbols-outlined text-[#00eefc] text-[18px] animate-bounce">arrow_upward</span>
              </div>
              <span className="font-mono text-[11px] text-[#ffb703] font-bold">KORİDOR: MERCAN H-28</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] text-[#9e8f78] uppercase font-bold">TAHMİNİ YÜKSELİŞ HIZI</span>
              <span className="font-sora text-[18px] text-[#ffdba0] font-bold">14.8 M/SN</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d3fbff]"></span>
                <span className="font-mono text-[10px] text-[#d3fbff] uppercase font-bold">İTİCİ HAZIR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Subsystem: Hidrolik Balast Tankları */}
        <div className="rounded-xl bg-[#201d30] p-space-md space-y-space-sm shadow-xl border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[#d3fbff] text-[20px]">water_voc</span>
              <h3 className="font-sora text-[16px] font-bold text-[#e6dff9]">BALAST TANK KONTROLÜ</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#363246] font-mono text-[11px] text-[#d3fbff] uppercase font-bold">
              TAM AKIŞ
            </span>
          </div>

          {/* 4 Tanks 2x2 Grid */}
          <div className="grid grid-cols-2 gap-space-sm">
            {[1, 2, 3, 4].map(id => {
              const active = tanks[id];
              return (
                <div
                  key={id}
                  onClick={() => handleToggleTank(id)}
                  className={`cursor-pointer transition-all active:scale-95 rounded-lg p-space-sm space-y-2 relative overflow-hidden shadow-md ${
                    active ? 'bg-[#2b273b] ring-1 ring-[#00eefc]' : 'bg-[#1c192c] opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#e6dff9] uppercase font-bold">TANK-0{id}</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                      active ? 'bg-[#00eefc]/20 text-[#00eefc]' : 'bg-[#363246] text-[#9e8f78]'
                    }`}>
                      {active ? 'TAHLİYE %100' : 'KİLİTLİ %30'}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#0f0c1e] overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${active ? 'bg-[#00eefc] w-full' : 'bg-[#514532] w-[30%]'}`}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#d5c4ac]">
                    <span>VALF: {active ? 'AÇIK' : 'KAPALI'}</span>
                    <span className={`material-symbols-outlined text-[16px] ${active ? 'text-[#00eefc]' : 'text-[#9e8f78]'}`}>
                      {active ? 'mode_fan' : 'lock'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary Interactive Modules Grid: Azot Manometresi & Açı Levyesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          
          {/* Azot Basınç Manometresi */}
          <div className="rounded-xl bg-[#201d30] p-space-md space-y-space-sm shadow-xl flex flex-col justify-between border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[#ffb703] text-[18px]">speed</span>
                <span className="font-sora text-[15px] text-[#e6dff9] font-bold">AZOT BASINCI</span>
              </div>
              <span className="font-mono text-[10px] text-[#ffdba0] px-2 py-0.5 rounded bg-[#363246] uppercase font-bold">
                HEDEF: 18 BAR
              </span>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32 rounded-full bg-[#0f0c1e] flex items-center justify-center p-3 shadow-inner">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-[#363246]" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="210" strokeDashoffset="40" strokeLinecap="round" strokeWidth="7"></circle>
                  <circle 
                    className="text-[#ffb703] transition-all duration-300" 
                    cx="50" 
                    cy="50" 
                    fill="none" 
                    r="40" 
                    stroke="currentColor" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={210 - ((pressure - 10) / 20 * 170)} 
                    strokeLinecap="round" 
                    strokeWidth="7"
                  ></circle>
                </svg>
                <div className="relative z-10 text-center flex flex-col items-center">
                  <span className="font-sora text-[28px] text-[#ffdba0] font-black leading-none">{pressure}</span>
                  <span className="font-mono text-[10px] text-[#d5c4ac] uppercase mt-1">BAR // OPTİMAL</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-xs pt-1">
              <button
                type="button"
                onClick={() => setPressure(p => Math.max(10, p - 1))}
                className="w-full py-2 rounded-lg bg-[#2b273b] text-[#e6dff9] active:scale-95 flex items-center justify-center gap-1 transition-all shadow font-bold text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
                <span>-1 BAR</span>
              </button>
              <button
                type="button"
                onClick={() => setPressure(p => Math.min(30, p + 1))}
                className="w-full py-2 rounded-lg bg-[#2b273b] text-[#ffdba0] active:scale-95 flex items-center justify-center gap-1 transition-all shadow font-bold text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>+1 BAR</span>
              </button>
            </div>
          </div>

          {/* Yükseliş Açı Levyesi */}
          <div className="rounded-xl bg-[#201d30] p-space-md space-y-space-sm shadow-xl flex flex-col justify-between border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[#00dbe9] text-[18px]">navigation</span>
                <span className="font-sora text-[15px] text-[#e6dff9] font-bold">BURUN AÇISI</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                angle === 28 ? 'bg-[#00eefc]/20 text-[#00eefc]' : 'bg-[#93000a]/40 text-[#ffb4ab]'
              }`}>
                {angle === 28 ? '28° MERCAN ROTA' : `${angle}° SAPMA`}
              </span>
            </div>

            <div className="bg-[#0f0c1e] p-space-sm rounded-lg flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#9e8f78] px-1">
                <span>0° (YATAY)</span>
                <span className="text-[#ffb703] font-bold">28° (HEDEF KİLİT)</span>
                <span>45° (DİK)</span>
              </div>
              <div className="relative w-full h-8 bg-[#2b273b] rounded-full p-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-transparent cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#e6dff9] px-1 font-mono">
                <span className="text-[#d5c4ac]">AKINTI ETKİSİ: -3°</span>
                <span className="text-[#00eefc] font-bold uppercase">SEÇİLEN: +{angle}°</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs pt-1">
              <button 
                type="button" 
                onClick={() => setAngle(15)} 
                className="py-1.5 rounded bg-[#2b273b] text-[#d5c4ac] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                15° GÜVENLİ
              </button>
              <button 
                type="button" 
                onClick={() => setAngle(28)} 
                className="py-1.5 rounded bg-[#ffb703] text-[#422c00] font-mono text-[10px] font-extrabold uppercase transition-all shadow cursor-pointer"
              >
                28° HEDEF
              </button>
              <button 
                type="button" 
                onClick={() => setAngle(40)} 
                className="py-1.5 rounded bg-[#2b273b] text-[#d5c4ac] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                40° ACİL
              </button>
            </div>
          </div>

        </div>

        {/* Team Synchronization Ready Check bar */}
        <div className="rounded-xl bg-[#2b273b] p-space-sm flex items-center justify-between shadow-lg border border-white/5">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-[#00eefc] text-[#002022] flex items-center justify-center font-sora font-bold text-[14px]">
              M
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#9e8f78] uppercase block">MAKİNİST HAZIRLIĞI</span>
              <span className="text-[12px] text-[#e6dff9] font-semibold">Tüm Parametreler Eşlendi</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f0c1e]">
            <span className="material-symbols-outlined text-[#00eefc] text-[16px]">wifi_tethering</span>
            <span className="font-mono text-[10px] text-[#00eefc] uppercase font-bold">KOKPİT ÇİFT ONAY</span>
          </div>
        </div>

        {/* Giant Physical Beveled Arcade Trigger Button */}
        <div className="pt-space-xs pb-4">
          <button
            type="button"
            disabled={isFiring}
            onClick={handleTriggerAscent}
            className="relative w-full py-4 px-space-md rounded-xl bg-gradient-to-b from-[#ffb703] to-amber-600 text-[#422c00] shadow-2xl active:translate-y-1 transition-all flex items-center justify-center gap-space-sm uppercase overflow-hidden cursor-pointer shadow-[0_6px_0_#6b4b00]"
          >
            <span className="material-symbols-outlined text-[28px] text-[#422c00]" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
            <div className="flex flex-col text-left">
              <span className="font-sora text-[16px] font-black tracking-wider leading-tight">
                {isFiring ? 'ATEŞLENİYOR...' : 'ACİL BALASTLARI ATEŞLE'}
              </span>
              <span className="font-mono text-[10px] text-[#5e4100] font-bold tracking-widest">
                YÜZEYE DOĞRU DİK İTİŞ BAŞLAT
              </span>
            </div>
            <span className="material-symbols-outlined text-[24px] text-[#422c00] ml-auto">chevron_right</span>
          </button>
        </div>

      </div>
    );
  }

  // ================= STANDARD (KAYIP SİNYAL) PROTOCOL =================
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col pb-safe px-margin gap-space-md select-none animate-fadeIn text-[#e6dff9] font-sans">
      
      {/* Decision Header */}
      <div className="flex flex-col gap-1 mt-2">
        <div className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-[#ffb703]/20 text-[#ffba27] border border-[#ffb703]/30 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[15px] text-[#ffb703]">public</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold">AŞAMA 4 // ORTAK KURTARMA KARARI</span>
        </div>
        <h2 className="font-display-hero-mobile text-2xl font-black text-on-surface tracking-tight leading-none mt-1">
          Son karar <span className="text-primary-container drop-shadow-[0_0_12px_rgba(255,183,3,0.4)]">sizin</span>
        </h2>
        <p className="text-xs text-[#d5c4ac] leading-snug">
          Tahsis edilen enerjiye ({netThrust} MW İtki, {netShield} MW Kalkan) uygun kaçış rotasını seçin ve onaylayın.
        </p>
      </div>

      {/* 3 Interactive Route Cards */}
      <div className="flex flex-col gap-2">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const meetsThrust = netThrust >= route.powerRequirements.itki;
          const meetsShield = netShield >= route.powerRequirements.kalkan;
          const isRouteViable = meetsThrust && meetsShield && hasLifePower;

          return (
            <div
              key={route.id}
              onClick={() => handleSelectRoute(route.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                isSelected 
                  ? 'bg-[#1c192c] border-[#ffb703] shadow-[0_0_16px_rgba(255,183,3,0.3)] ring-1 ring-[#ffb703]' 
                  : 'bg-[#0f0c1e] border-white/5 hover:bg-[#141123]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#ffb703] bg-[#ffb703]' : 'border-white/30'}`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black"></span>}
                  </span>
                  <span className="font-sora text-sm font-bold text-white">{route.name}</span>
                </div>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  route.crewCount === 10 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                }`}>
                  {route.crewCount} / 10 KİŞİ
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-white/5">
                <div className="flex flex-col text-[#d5c4ac]">
                  <span>Yolculuk: <b className="text-white">{route.travelTimeMin}</b></span>
                  <span>Kurtarılan: <b className="text-white">{route.crewCount} Mürettebat</b></span>
                </div>
                <div className="flex flex-col text-[#d5c4ac]">
                  <span>Gereken İtki: <b className={meetsThrust ? 'text-emerald-400' : 'text-rose-400'}>{route.powerRequirements.itki} MW</b></span>
                  <span>Gereken Kalkan: <b className={meetsShield ? 'text-emerald-400' : 'text-rose-400'}>{route.powerRequirements.kalkan} MW</b></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-[#d5c4ac]">{route.dangerDesc}</span>
                <span className={`font-bold font-mono ${isRouteViable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isRouteViable ? '✓ GÜÇ UYGUN' : '⚠ YETERSİZ GÜÇ'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Energy Status Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0f0c1e] border border-white/10 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#d5c4ac] font-bold uppercase">KİLİTLENMİŞ NET ENERJİ</span>
          <span className={`font-bold ${isEnergyLocked ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isEnergyLocked ? 'KİLİTLENDİ // AKTİF' : 'KİLİTLENMEDİ'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5">
            <span className="text-[10px] text-[#d5c4ac] block">Yaşam</span>
            <span className={`font-bold ${netLife >= 3 ? 'text-emerald-400' : 'text-rose-400'}`}>{netLife} MW</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5">
            <span className="text-[10px] text-[#d5c4ac] block">İtki</span>
            <span className={`font-bold ${hasThrustPower ? 'text-emerald-400' : 'text-rose-400'}`}>{netThrust} MW</span>
          </div>
          <div className="p-2 rounded-xl bg-[#1c192c] border border-white/5">
            <span className="text-[10px] text-[#d5c4ac] block">Kalkan</span>
            <span className={`font-bold ${hasShieldPower ? 'text-emerald-400' : 'text-rose-400'}`}>{netShield} MW</span>
          </div>
        </div>
      </div>

      {/* Team Approval Strip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <span className="text-[#d5c4ac] font-bold uppercase">HER İKİ OYUNCUNUN ONAYI</span>
          <span className="text-[#ffb703]">ÇİFT ONAY KURALI</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={myRole === 'kaptan' ? handleToggleMyApproval : handleSimulatePartnerApproval}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
              captainApproved 
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                : 'bg-[#1c192c] border-white/5 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2b273b] flex items-center justify-center text-[#ffb703]">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs text-white font-bold">Kaptan Onayı</span>
              <span className={`text-[10px] font-mono font-bold ${captainApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {captainApproved ? 'ONAYLANDI' : 'BEKLENİYOR'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={myRole === 'muhendis' ? handleToggleMyApproval : handleSimulatePartnerApproval}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
              engineerApproved 
                ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                : 'bg-[#1c192c] border-white/5 opacity-75 hover:opacity-100'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2b273b] flex items-center justify-center text-[#00eefc]">
              <span className="material-symbols-outlined text-[20px]">build</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs text-white font-bold">Mühendis Onayı</span>
              <span className={`text-[10px] font-mono font-bold ${engineerApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {engineerApproved ? 'ONAYLANDI' : 'BEKLENİYOR'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Validation Error Message */}
      {(state.rescue.validationError || validationError) && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs leading-relaxed animate-fadeIn">
          {state.rescue.validationError || validationError}
        </div>
      )}

      {/* Final Action Trigger */}
      <div className="mt-1 pb-4">
        <button 
          type="button"
          onClick={handleConfirmRescue}
          disabled={!bothApproved}
          className={`w-full h-14 rounded-2xl font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            bothApproved
              ? 'bg-gradient-to-r from-[#ffb703] to-[#ffba27] text-[#271900] shadow-[0_6px_0_#6b4b00,0_12px_24px_rgba(255,183,3,0.3)] active:translate-y-1 cursor-pointer'
              : 'bg-[#2b273b] text-[#d5c4ac] opacity-50 cursor-not-allowed border border-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">verified</span>
          <span>{bothApproved ? `Kurtarmayı Başlat (${activeRoute.name})` : 'İki Oyuncunun Onayı Bekleniyor'}</span>
        </button>
      </div>

    </div>
  );
};
