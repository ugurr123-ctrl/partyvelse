import React, { useState } from 'react';
import { 
  MissionState, 
  Role, 
  AdvancedSubsystemId,
  MiniGameType
} from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: MissionState;
  onUpdate: (updater: (prev: MissionState) => MissionState) => void;
  onAction: (actionType: string, data: any) => void;
  role: Role;
}

export const ScreenAdvancedMission: React.FC<Props> = ({
  state,
  onAction,
  role,
}) => {
  const adv = state.advancedScenario;
  const isCaptain = role === 'kaptan';
  const isDerinBasinc = state.operationTheme === 'derin_basinc';
  const [activeTab, setActiveTab] = useState<AdvancedSubsystemId>(
    adv?.activeSubsystemTab || 'reaktor'
  );

  React.useEffect(() => {
    if (adv?.activeSubsystemTab && adv.activeSubsystemTab !== activeTab) {
      setActiveTab(adv.activeSubsystemTab);
    }
  }, [adv?.activeSubsystemTab]);

  const selectedReactorLine = adv?.subsystems?.reaktor?.engineerSuggestedLine ?? null;
  const reactorCoolingAngle = adv?.subsystems?.reaktor?.engineerValveAngle ?? null;
  const reactorThrottleToggled = adv?.subsystems?.reaktor?.engineerThrottleActive ?? false;
  const selectedSignalFreq = adv?.subsystems?.sinyal?.engineerSelectedFrequency ?? null;

  // If advanced scenario data is not initialized
  if (!adv) {
    return (
      <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#0a0815] text-white flex items-center justify-center p-6 rounded-[36px] border border-white/10">
        <p className="text-sm font-mono text-cyan-400">Gelişmiş senaryo verisi yükleniyor...</p>
      </div>
    );
  }

  const handleTabChange = (tab: AdvancedSubsystemId) => {
    setActiveTab(tab);
    onAction('advanced_tab_change', { tab });
  };

  const handlePowerChange = (field: 'coolingPumps' | 'antennaBooster' | 'airlockCompressor' | 'shieldReserve', delta: number) => {
    const current = adv.powerGrid[field];
    const nextVal = Math.max(0, current + delta);
    const updatedGrid = { ...adv.powerGrid, [field]: nextVal };
    const total = updatedGrid.coolingPumps + updatedGrid.antennaBooster + updatedGrid.airlockCompressor + updatedGrid.shieldReserve;
    if (total <= adv.powerGrid.totalBudget) {
      onAction('advanced_set_power', updatedGrid);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const gameToSubsystem = (g: MiniGameType): AdvancedSubsystemId => {
    switch (g) {
      case 'ariza_teshisi': return 'reaktor';
      case 'sinyal_cozumu': return 'sinyal';
      case 'kablo_baglantisi': return 'kablo';
      case 'hava_kilidi': return 'hava_kilidi';
      case 'radar_yonlendirme': return 'radar';
    }
  };

  const getMiniGameLabel = (g: MiniGameType, isDerin: boolean): string => {
    if (isDerin) {
      switch (g) {
        case 'ariza_teshisi': return 'Balast Valfi';
        case 'sinyal_cozumu': return 'Sonar & Glif';
        case 'kablo_baglantisi': return 'Veri Hattı';
        case 'hava_kilidi': return 'Basınç Kabini';
        case 'radar_yonlendirme': return 'Derin Radar';
      }
    }
    switch (g) {
      case 'ariza_teshisi': return 'Reaktör Çekirdeği';
      case 'sinyal_cozumu': return 'Sinyal Çözümü';
      case 'kablo_baglantisi': return 'Kablo Bağlantısı';
      case 'hava_kilidi': return 'Hava Kilidi';
      case 'radar_yonlendirme': return 'Radar Hizalama';
    }
  };

  const getSubsystemSolved = (g: MiniGameType): boolean => {
    switch (g) {
      case 'ariza_teshisi': return !!adv?.subsystems.reaktor.isStabilized;
      case 'sinyal_cozumu': return !!adv?.subsystems.sinyal.isLocked;
      case 'hava_kilidi': return !!adv?.subsystems.hava_kilidi.isSealed;
      case 'kablo_baglantisi': return !!adv?.subsystems.kablo?.isRepaired;
      case 'radar_yonlendirme': return !!adv?.subsystems.radar?.isAligned;
      default: return false;
    }
  };

  const randomSubsystems: AdvancedSubsystemId[] = (state.selectedMiniGames || ['ariza_teshisi', 'sinyal_cozumu']).map(gameToSubsystem);
  const displayedTabs: AdvancedSubsystemId[] = [...randomSubsystems];
  if (['reaktor', 'sinyal', 'hava_kilidi', 'kablo', 'radar'].includes(activeTab) && !displayedTabs.includes(activeTab)) {
    displayedTabs.push(activeTab);
  }
  displayedTabs.push('guc_matrisi');
  displayedTabs.push('tahliye');

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[calc(100vh-80px)] bg-[#080711] text-white flex flex-col justify-between p-4 rounded-[40px] border border-white/10 shadow-2xl relative select-none font-sans overflow-hidden animate-fadeIn">
      
      {/* Background ambient light */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* 1. Header / HUD Telemetry Bar */}
      <header className="relative z-10 flex flex-col space-y-2 mb-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                {isDerinBasinc ? 'DERİN DALIP // PROTOKOLÜ' : 'OPERASYON: ÇÖKÜŞ EŞİĞİ'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isCaptain 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {isCaptain 
                  ? (isDerinBasinc ? '★ DÜMENCİ (KILAVUZ NAVİGASYON)' : '★ KAPTAN (PROTOKOL VE KURALLAR)')
                  : (isDerinBasinc ? '⚙ MAKİNİST (BALAST VE BASINÇ)' : '⚙ MÜHENDİS (ÖLÇÜM VE KONTROL)')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block tracking-wider">KALAN SÜRE</span>
            <span className={`text-lg font-mono font-black ${
              state.timeLeftSeconds < 60 ? 'text-red-400 animate-pulse' : 'text-amber-400'
            }`}>
              {formatTime(state.timeLeftSeconds)}
            </span>
          </div>
        </div>

        {/* Hull Integrity Bar */}
        <div className="bg-[#131124] border border-white/5 rounded-xl px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {isDerinBasinc ? 'Gövde Dayanımı (85.2 ATM):' : 'Gövde Bütünlüğü:'}
            </span>
            <span className={`text-xs font-mono font-bold ${
              state.hullIntegrity > 60 ? 'text-emerald-400' : state.hullIntegrity > 30 ? 'text-amber-400' : 'text-red-400'
            }`}>
              %{state.hullIntegrity}
            </span>
          </div>
          <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                state.hullIntegrity > 60 ? 'bg-emerald-500' : state.hullIntegrity > 30 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, state.hullIntegrity))}%` }}
            ></div>
          </div>
        </div>

        {/* System Randomized Tasks Indicator Ribbon */}
        <div className="bg-[#121026] border border-cyan-500/20 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-300 font-bold uppercase tracking-wider text-[9px]">
              🎲 AKTİF GÖREVLER:
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {state.selectedMiniGames?.map((g, idx) => {
              const solved = getSubsystemSolved(g);
              return (
                <span 
                  key={g}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold flex items-center gap-1 ${
                    solved 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}
                >
                  <span>{idx + 1}. {getMiniGameLabel(g, isDerinBasinc)}</span>
                  <span>{solved ? '✓' : '⚠️'}</span>
                </span>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. Critical Event Banner */}
      {adv.event.isActive && !adv.event.isResolved && (
        <div className="relative z-20 mb-2 p-3 bg-red-950/80 border-2 border-red-500 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase text-red-200 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              ⚠️ {isDerinBasinc ? 'ABİSAL SU BASINÇ DALGASI' : adv.event.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300">
              Temas: ~{Math.max(0, state.timeLeftSeconds - adv.event.strikeTime)}s
            </span>
          </div>
          <p className="text-[11px] text-red-100 leading-tight mb-2">
            {isDerinBasinc 
              ? 'Hendek çökme şoku tespit edildi! Dümenci ve Makinist ortak basınç koruma kararı almalıdır!'
              : `${adv.event.desc} Kaptan ve Mühendis ortak savunma kararı almalıdır!`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAction('advanced_event_react', { reaction: 'kalkan' })}
              className="py-1.5 px-2 bg-cyan-600/90 hover:bg-cyan-500 active:scale-95 text-white rounded-xl text-[10px] font-bold tracking-wide uppercase border border-cyan-400/50 cursor-pointer shadow"
              type="button"
            >
              {isDerinBasinc ? '🛡️ Basınç Kalkanı (3 MW)' : '🛡️ Kalkanlara 3 MW Ver (%100 Koruma)'}
            </button>
            <button
              onClick={() => onAction('advanced_event_react', { reaction: 'tahliye' })}
              className="py-1.5 px-2 bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-[10px] font-bold tracking-wide uppercase border border-amber-400/50 cursor-pointer shadow"
              type="button"
            >
              {isDerinBasinc ? '💨 Valfleri Tahliye Et (-%5 Gövde)' : '💨 Bacaları Aç (-%5 Gövde)'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Subsystem Tactical Tabs */}
      <nav 
        className="relative z-10 grid gap-1 mb-2"
        style={{ gridTemplateColumns: `repeat(${displayedTabs.length}, minmax(0, 1fr))` }}
      >
        {displayedTabs.map((tab) => {
          const isAct = activeTab === tab;
          let icon = '⚡';
          let label = 'Reaktör';
          let statusLabel = 'KRİTİK';
          let isSolved = false;

          if (tab === 'reaktor') {
            icon = isDerinBasinc ? '⚓' : '⚡';
            label = isDerinBasinc ? 'Balast' : 'Reaktör';
            isSolved = adv.subsystems.reaktor.isStabilized;
            statusLabel = isSolved ? (isDerinBasinc ? 'DENGEDE' : 'STABİL') : 'KRİTİK';
          } else if (tab === 'sinyal') {
            icon = '📡';
            label = isDerinBasinc ? 'Sonar' : 'Sinyal';
            isSolved = adv.subsystems.sinyal.isLocked;
            statusLabel = isSolved ? 'KİLİTLİ' : `%${adv.subsystems.sinyal.noiseLevel} PAR`;
          } else if (tab === 'hava_kilidi') {
            icon = '🚪';
            label = isDerinBasinc ? 'Kabin' : 'Kilid';
            isSolved = adv.subsystems.hava_kilidi.isSealed;
            statusLabel = isSolved ? 'MÜHÜRLÜ' : 'AÇIK';
          } else if (tab === 'kablo') {
            icon = '🔌';
            label = isDerinBasinc ? 'Veri' : 'Kablo';
            isSolved = !!adv.subsystems.kablo?.isRepaired;
            statusLabel = isSolved ? 'ONARILDI' : 'KOPUK';
          } else if (tab === 'radar') {
            icon = '🧭';
            label = isDerinBasinc ? 'Radar' : 'Radar';
            isSolved = !!adv.subsystems.radar?.isAligned;
            statusLabel = isSolved ? 'HİZALANDI' : 'SAPMA';
          } else if (tab === 'guc_matrisi') {
            icon = '🔋';
            label = isDerinBasinc ? 'Enerji' : 'Güç';
            isSolved = true;
            statusLabel = `${adv.powerGrid.totalBudget} MW`;
          } else if (tab === 'tahliye') {
            icon = isDerinBasinc ? '🌊' : '🛸';
            label = isDerinBasinc ? 'Yüzey' : 'Tahliye';
            isSolved = false;
            statusLabel = 'ROTA';
          }

          const activeBorderClass = 
            tab === 'reaktor' ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
            tab === 'sinyal' ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,238,252,0.3)]' :
            tab === 'hava_kilidi' ? 'bg-purple-500/25 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' :
            tab === 'kablo' ? 'bg-sky-500/25 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]' :
            tab === 'radar' ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]' :
            tab === 'guc_matrisi' ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
            'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]';

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase flex flex-col items-center justify-center transition-all cursor-pointer border ${
                isAct ? activeBorderClass : 'bg-[#151329] border-white/5 text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              <span className="text-xs">{icon}</span>
              <span className="truncate max-w-full px-0.5">{label}</span>
              <span className={`text-[7.5px] font-normal leading-tight ${isSolved ? 'text-emerald-400' : 'text-slate-500'}`}>
                {statusLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 4. Active Subsystem Workspace */}
      <main className="relative z-10 flex-1 flex flex-col space-y-2 overflow-y-auto max-h-[560px] pr-0.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col space-y-2"
          >

        {/* ================================================================= */}
        {/* TAB 1: REAKTÖR ÇEKİRDEĞİ                                          */}
        {/* ================================================================= */}
        {activeTab === 'reaktor' && (
          <div className="flex-1 flex flex-col space-y-3">
            {/* Status card */}
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-300 font-mono uppercase flex items-center gap-1.5">
                  ⚡ Reaktör Çekirdeği Durumu
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  adv.subsystems.reaktor.isStabilized 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                }`}>
                  {adv.subsystems.reaktor.isStabilized ? 'STABİLİZE EDİLDİ' : 'AŞIRI ISINMA ALARMI'}
                </span>
              </div>

              {/* Dependency indicator */}
              <div className="text-[11px] bg-[#1a1736] p-2 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Soğutma Pompaları Gücü:</span>
                <span className={`font-mono font-bold ${
                  adv.subsystems.reaktor.coolantPumpsPower >= 4 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {adv.subsystems.reaktor.coolantPumpsPower} MW / 4 MW {adv.subsystems.reaktor.coolantPumpsPower >= 4 ? '✓ (Yeterli)' : '⚠️ (Soğutma Yetersiz!)'}
                </span>
              </div>
            </div>

            {/* Asymmetric View: Captain (Manual & Rules) vs Engineer (Live Telemetry & Controls) */}
            {isCaptain ? (
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-1.5">
                  <span className="text-amber-400 text-sm">📜</span>
                  <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide">
                    Kaptan Devre Şeması &amp; Arıza Protokolü
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'reaktor' as const, code: 'CIR-01', name: 'Ana Reaktör', breaker: adv.subsystems.reaktor.lineBreakerMap?.reaktor || 'K1' },
                    { key: 'sogutucu' as const, code: 'CIR-02', name: 'Soğutucu Çekirdek', breaker: adv.subsystems.reaktor.lineBreakerMap?.sogutucu || 'K3' },
                    { key: 'anten' as const, code: 'CIR-03', name: 'Anten Ünitesi', breaker: adv.subsystems.reaktor.lineBreakerMap?.anten || 'K2' },
                    { key: 'yonlendirme' as const, code: 'CIR-04', name: 'İtki ve Yönlendirme', breaker: adv.subsystems.reaktor.lineBreakerMap?.yonlendirme || 'K4' },
                  ].map((mod) => (
                    <div key={mod.code} className="p-2 rounded-xl bg-[#0f0e20] border border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{mod.code}</span>
                        <span className="text-[9px] text-slate-300 truncate max-w-[90px]">{mod.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#2b273b] text-amber-300 border border-amber-500/30">
                        {mod.breaker}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Diagnostic Rule Plaque */}
                <div className="bg-[#0f0e20] p-2.5 rounded-xl border border-white/5 space-y-1.5 text-[11px] font-mono">
                  <p className="text-amber-200 font-bold">ARIZA TEŞHİS KURALI ({state.activeEnvironment.toUpperCase()}):</p>
                  <p className="text-slate-300">
                    {state.activeEnvironment === 'buzul_istasyonu' ? (
                      <>Bir devrede arıza kabul edilmesi için: <strong className="text-amber-300">Isı ≤ -10°C</strong> VE <strong className="text-cyan-300">Basınç ≥ 70 kPa</strong> VE <strong className="text-purple-300">Parazit ≥ 60 dB</strong> (üçü birlikte aranır).</>
                    ) : state.activeEnvironment === 'meteor_yagmuru' ? (
                      <>Bir devrede arıza kabul edilmesi için: <strong className="text-amber-300">Isı ≥ 80°C</strong>, <strong className="text-cyan-300">Basınç ≤ 40 kPa</strong>, <strong className="text-purple-300">Parazit ≥ 65 dB</strong> (En az 2 kritik eşik birlikte aranır).</>
                    ) : (
                      <>Bir devrede arıza kabul edilmesi için: <strong className="text-amber-300">Isı ≥ 80°C</strong> VE <strong className="text-cyan-300">Basınç ≤ 40 kPa</strong> VE <strong className="text-purple-300">Parazit ≥ 65 dB</strong> (üçü birlikte aranır).</>
                    )}
                  </p>
                  <p className="text-slate-300 pt-1 border-t border-white/5">
                    • <strong className="text-amber-300">TAHLİYE TALİMATI:</strong> Kesici açıldıktan sonra Soğutma Valfi <strong className="text-cyan-300">{adv.subsystems.reaktor.targetValveAngle ?? 135}°</strong> konumuna alınmalı ve <strong className="text-amber-300">Basınç Tahliyesi AKTİF</strong> edilmelidir.
                  </p>
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">GÜÇ ŞARTI:</strong> Soğutma Pompaları en az 4 MW beslenmelidir (Mevcut: {adv.subsystems.reaktor.coolantPumpsPower} MW).
                  </p>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400">GÜVENLİK KESİCİSİ DEVREYE ALMA:</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {adv.subsystems.reaktor.breakerActivated 
                        ? `KİLİT AÇIK (${adv.subsystems.reaktor.unlockedBreaker || 'AKTİF'})` 
                        : 'KİLİTLİ'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['K1', 'K2', 'K3', 'K4'] as const).map((k) => {
                      const isActivated = adv.subsystems.reaktor.breakerActivated && k === adv.subsystems.reaktor.unlockedBreaker;
                      return (
                        <button
                          key={k}
                          onClick={() => onAction('advanced_reactor_breaker', { breaker: k })}
                          disabled={adv.subsystems.reaktor.isStabilized}
                          className={`py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all cursor-pointer border ${
                            isActivated
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_#10b981]'
                              : 'bg-[#221f45] border-white/10 text-slate-200 hover:border-amber-400'
                          }`}
                          type="button"
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#171433] border border-cyan-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 text-sm">⚙</span>
                    <h4 className="text-xs font-bold font-sora text-cyan-200 uppercase tracking-wide">
                      Mühendis Telemetri &amp; Tahliye Kontrolü
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {selectedReactorLine ? `${selectedReactorLine.toUpperCase()} SEÇİLİ` : 'SEÇİM YOK'}
                  </span>
                </div>

                {/* 4 Circuits Live Telemetry Matrix - purely neutral numeric readouts (no spoiler red colors) */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'reaktor' as const, code: 'CIR-01', name: 'Ana Reaktör' },
                    { key: 'sogutucu' as const, code: 'CIR-02', name: 'Soğutucu Çekirdek' },
                    { key: 'anten' as const, code: 'CIR-03', name: 'Anten Ünitesi' },
                    { key: 'yonlendirme' as const, code: 'CIR-04', name: 'İtki ve Yönlendirme' },
                  ].map((mod) => {
                    const isSelected = selectedReactorLine === mod.key;
                    const lineData = adv.subsystems.reaktor.lines?.[mod.key] || {
                      temp: 60,
                      press: 50,
                      noise: 40,
                      code: mod.code,
                      status: 'stabil',
                    };
                    const isStabilized = adv.subsystems.reaktor.isStabilized && lineData.status === 'stabil';

                    return (
                      <button
                        key={mod.key}
                        type="button"
                        onClick={() => onAction('advanced_reactor_set_params', { line: mod.key })}
                        disabled={adv.subsystems.reaktor.isStabilized}
                        className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00eefc]/15 border-[#00eefc] shadow-[0_0_12px_rgba(0,238,252,0.3)] ring-1 ring-[#00eefc]'
                            : isStabilized
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-[#0f0e20] border-white/5 hover:bg-[#1a1736]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-cyan-400">{mod.code}</span>
                          <span className="text-[9px] text-slate-300 truncate max-w-[80px]">{mod.name}</span>
                        </div>

                        {/* Telemetry numbers - neutral theme styling without red highlight */}
                        <div className="grid grid-cols-3 gap-1 my-1.5 bg-[#171433] p-1 rounded-lg border border-white/5 text-center">
                          <div>
                            <span className="text-[8px] font-mono text-slate-400 block">ISI</span>
                            <span className={`text-[10px] font-mono font-bold ${isStabilized ? 'text-emerald-400' : 'text-amber-300'}`}>
                              {lineData.temp}°C
                            </span>
                          </div>
                          <div className="border-x border-white/5">
                            <span className="text-[8px] font-mono text-slate-400 block">BASINÇ</span>
                            <span className={`text-[10px] font-mono font-bold ${isStabilized ? 'text-emerald-400' : 'text-cyan-300'}`}>
                              {lineData.press}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-slate-400 block">PARAZİT</span>
                            <span className={`text-[10px] font-mono font-bold ${isStabilized ? 'text-emerald-400' : 'text-purple-300'}`}>
                              {lineData.noise}dB
                            </span>
                          </div>
                        </div>

                        <div className="text-[9px] font-mono text-right">
                          <span className={isStabilized ? 'text-emerald-400 font-bold' : isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                            {isStabilized ? 'STABİL' : isSelected ? 'SEÇİLDİ' : 'İNCELE'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mechanical Controls: Valve Angle & Pressure Throttle */}
                <div className="bg-[#0f0e20] p-2.5 rounded-xl border border-white/5 grid grid-cols-2 gap-2">
                  <div className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Soğutma Valfi</span>
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">
                        {reactorCoolingAngle !== null ? `${reactorCoolingAngle}°` : 'SEÇİLMEDİ'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 my-1">
                      {[45, 90, 135, 180].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => onAction('advanced_reactor_set_params', { valveAngle: deg })}
                          disabled={adv.subsystems.reaktor.isStabilized}
                          className={`py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                            reactorCoolingAngle === deg
                              ? 'bg-cyan-400 text-black shadow-[0_0_8px_rgba(0,238,252,0.4)]'
                              : 'bg-[#221f45] text-slate-300 hover:bg-[#2b2756]'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                    <span className="text-[8px] font-mono text-slate-400">Kaptan talimatına göre ayarla</span>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Tahliye Anahtarı</span>
                      <span className={`text-[9px] font-mono font-bold ${reactorThrottleToggled ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {reactorThrottleToggled ? 'AKTİF' : 'KAPALI'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAction('advanced_reactor_set_params', { throttleActive: !reactorThrottleToggled })}
                      disabled={adv.subsystems.reaktor.isStabilized}
                      className={`w-full py-1.5 my-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer border ${
                        reactorThrottleToggled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                          : 'bg-[#221f45] text-slate-300 border-white/5 hover:bg-[#2b2756]'
                      }`}
                    >
                      {reactorThrottleToggled ? 'TAHLİYE AKTİF' : 'TAHLİYE AÇ'}
                    </button>
                    <span className="text-[8px] font-mono text-slate-400">Tahliye vanasını devreye sokar</span>
                  </div>
                </div>

                {/* Purge Action Button */}
                <button
                  onClick={() => onAction('advanced_reactor_purge', {})}
                  disabled={adv.subsystems.reaktor.isStabilized || !selectedReactorLine}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    adv.subsystems.reaktor.isStabilized
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : !selectedReactorLine
                      ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60'
                      : reactorCoolingAngle === null
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 cursor-pointer'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 hover:opacity-95 shadow-[0_4px_12px_rgba(0,238,252,0.3)] active:scale-98 cursor-pointer'
                  }`}
                  type="button"
                >
                  <span>
                    {adv.subsystems.reaktor.isStabilized 
                      ? 'REAKTÖR STABİLİZE EDİLDİ' 
                      : !selectedReactorLine 
                      ? 'ÖNCE DEVRE / HAT SEÇİN' 
                      : reactorCoolingAngle === null
                      ? 'VALF AÇISINI AYARLAYIN'
                      : `${selectedReactorLine.toUpperCase()} DEVRESİNİ TAHLİYE ET`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SİNYAL VE İLETİŞİM                                         */}
        {/* ================================================================= */}
        {activeTab === 'sinyal' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-1.5">
                  📡 Sinyal Durumu: USS Aurora
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  adv.subsystems.sinyal.isLocked 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                }`}>
                  {adv.subsystems.sinyal.isLocked ? 'KİLİTLENDİ (TELEMETRİ HAZIR)' : 'PARAZİTLİ'}
                </span>
              </div>

              {/* Dependency indicator: Antenna Power */}
              <div className="text-[11px] bg-[#1a1736] p-2 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Anten Güçlendirici:</span>
                <span className={`font-mono font-bold ${
                  adv.subsystems.sinyal.antennaPower >= 3 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {adv.subsystems.sinyal.antennaPower} MW / 3 MW (Parazit: %{adv.subsystems.sinyal.noiseLevel})
                </span>
              </div>
            </div>

            {isCaptain ? (
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-1.5">
                  <span className="text-amber-400 text-sm">📜</span>
                  <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide">
                    Kaptan Sinyal Şifre Çözüm Kılavuzu
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mühendisin bildireceği 4 sembolü aşağıdaki tablodan bulun ve dönüştürme kuralını uygulayarak <strong className="text-amber-300">4 haneli kodu</strong> hesaplayıp Mühendise bildirin:
                </p>

                {/* Symbol-to-digit table */}
                <div className="grid grid-cols-6 gap-1.5 text-center font-mono text-[11px]">
                  {Object.entries(adv.subsystems.sinyal.symbolMap || {}).map(([sym, val]) => (
                    <div key={sym} className="bg-[#0f0e20] p-1.5 rounded-xl border border-white/5">
                      <span className="text-amber-300 font-bold text-sm block">{sym}</span>
                      <span className="text-cyan-300 font-extrabold text-xs">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Rule description */}
                <div className="bg-[#0f0e20] p-3 rounded-xl border border-white/5 space-y-1.5 text-[11px] font-mono">
                  <span className="text-amber-200 font-bold block uppercase">
                    Dönüşüm Kuralı:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-semibold">
                    {adv.subsystems.sinyal.ruleDescription || 'Kural yükleniyor...'}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                    • Baştaki sıfırlar korunmalıdır (Örn. 0429).<br />
                    • Mühendis sembolleri sırayla bildirdiğinde rakamlarını eşleştirin ve bu kuralı uygulayın.
                  </p>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Not: Gelen sembol sırası ve frekans seçenekleri yalnızca Mühendis ekranındadır. Mühendisin kilitlemesi için Anten Güçlendirici en az 3 MW olmalıdır.
                </p>
              </div>
            ) : (
              <div className="bg-[#171433] border border-cyan-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 text-sm">⚙</span>
                    <h4 className="text-xs font-bold font-sora text-cyan-200 uppercase tracking-wide">
                      Mühendis Alıcı &amp; Spektrum Kilitleme
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {selectedSignalFreq ? `${selectedSignalFreq} SEÇİLİ` : 'SEÇİM YOK'}
                  </span>
                </div>

                {/* Incoming 4 symbols message card */}
                <div className="bg-[#0f0e20] p-3 rounded-xl border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Gelen Kripto Sinyali (4 Sembol)
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${adv.subsystems.sinyal.antennaPower >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {adv.subsystems.sinyal.antennaPower >= 3 ? 'SİNYAL NET (%4 PARAZİT)' : `YÜKSEK PARAZİT (%${adv.subsystems.sinyal.noiseLevel})`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {(adv.subsystems.sinyal.incomingSymbols || adv.subsystems.sinyal.symbols || ['?', '?', '?', '?']).map((sym, idx) => (
                      <div key={idx} className="bg-[#171433] p-2 rounded-xl border border-white/10 shadow">
                        <span className="text-cyan-300 font-bold text-lg font-mono block">{sym}</span>
                        <span className="text-[8px] font-mono text-slate-500">#{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 text-center">
                    Bu 4 sembolü sırayla Kaptana okuyun ve hesaplanan 4 haneli kodu bekleyin.
                  </p>
                </div>

                {/* 6 Code-Frequency options */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Spektrum Kanalları (Kod Eşleşmesi):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(adv.subsystems.sinyal.frequencies || []).map((opt) => {
                      const isSelected = selectedSignalFreq === opt.freq;
                      return (
                        <button
                          key={opt.freq}
                          type="button"
                          onClick={() => onAction('advanced_signal_select', { freq: opt.freq })}
                          disabled={adv.subsystems.sinyal.isLocked}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_12px_rgba(0,238,252,0.3)] ring-1 ring-cyan-400'
                              : adv.subsystems.sinyal.isLocked && opt.freq === adv.subsystems.sinyal.targetFrequency
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-[#0f0e20] border-white/5 hover:bg-[#1a1736]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-slate-400">{opt.label}</span>
                            <span className="text-[11px] font-mono font-extrabold text-cyan-300">{opt.freq}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400 text-[9px]">KOD:</span>
                            <span className="font-bold text-amber-200 tracking-wider text-xs">{opt.code}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Signal Lock Button */}
                <button
                  type="button"
                  onClick={() => onAction('advanced_signal_lock', {})}
                  disabled={adv.subsystems.sinyal.isLocked || !selectedSignalFreq || adv.subsystems.sinyal.antennaPower < 3}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    adv.subsystems.sinyal.isLocked
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : adv.subsystems.sinyal.antennaPower < 3
                      ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60'
                      : !selectedSignalFreq
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 cursor-pointer'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 hover:opacity-95 shadow-[0_4px_12px_rgba(0,238,252,0.3)] active:scale-98 cursor-pointer'
                  }`}
                >
                  <span>
                    {adv.subsystems.sinyal.isLocked
                      ? 'SİNYAL KİLİTLENDİ (USS AURORA)'
                      : adv.subsystems.sinyal.antennaPower < 3
                      ? 'ANTEN GÜCÜ YETERSİZ (< 3 MW)'
                      : !selectedSignalFreq
                      ? 'ÖNCE FREKANS SEÇİN'
                      : `${selectedSignalFreq} FREKANSINI KİLİTLE`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: HAVA KİLİDİ VE MÜHÜR                                       */}
        {/* ================================================================= */}
        {activeTab === 'hava_kilidi' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-300 font-mono uppercase flex items-center gap-1.5">
                  🚪 Hava Kilidi &amp; Tahliye Dok Mührü
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  adv.subsystems.hava_kilidi.isSealed 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/40 animate-pulse'
                }`}>
                  {adv.subsystems.hava_kilidi.isSealed ? 'MÜHÜRLENDİ (ROTA ALFA AÇIK)' : 'BASINÇ EŞİTLENMEDİ'}
                </span>
              </div>

              {/* Dependency indicator: Compressor Power */}
              <div className="text-[11px] bg-[#1a1736] p-2 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Basınç Kompresörü:</span>
                <span className={`font-mono font-bold ${
                  adv.subsystems.hava_kilidi.compressorPower >= 3 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {adv.subsystems.hava_kilidi.compressorPower} MW / 3 MW {adv.subsystems.hava_kilidi.compressorPower >= 3 ? '✓ (Basınç Tutuyor)' : '⚠️ (Yetersiz!)'}
                </span>
              </div>
            </div>

            {isCaptain ? (
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-1.5">
                  <span className="text-amber-400 text-sm">📜</span>
                  <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide">
                    Hava Kilidi Mühürleme Protokolü
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mühendise dış sensör basıncını sorun. Basınca göre doğru kadranı ve vakum aralığını emredin:
                </p>

                <div className="bg-[#0f0e20] p-2.5 rounded-xl border border-white/5 space-y-1.5 text-[11px] font-mono">
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">Dış Basınç &lt; 40 kPa ise:</strong> <span className="text-purple-300 font-bold">Kadran 2 (%100 Tahliye)</span> seçilmeli, Vakum <strong className="text-emerald-400">75</strong> seviyesine kilitlenmelidir.
                  </p>
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">Dış Basınç &ge; 40 kPa ise:</strong> <span className="text-purple-300 font-bold">Kadran 1 (%75 Basınçlı)</span> seçilmeli, Vakum <strong className="text-emerald-400">60</strong> seviyesine kilitlenmelidir.
                  </p>
                  <p className="text-slate-300">
                    • <strong className="text-rose-400">KRİTİK BAĞIMLILIK:</strong> Hava kilidi mühürlenmezse <strong className="text-rose-300">Rota Alfa (10 Kişi)</strong> seçilemez; seçilirse hava kilidi patlar ve 7 personel kaybedilir!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#171433] border border-purple-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-purple-500/20 pb-1.5">
                  <span className="text-purple-400 text-sm">⚙</span>
                  <h4 className="text-xs font-bold font-sora text-purple-200 uppercase tracking-wide">
                    Kadran &amp; Vakum Mühürleme Konsolu
                  </h4>
                </div>

                <div className="bg-[#0f0e20] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">DIŞ BASINÇ SENSÖRÜ:</span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {adv.subsystems.hava_kilidi.externalPressureKpa || 36} kPa
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">MÜHÜR KADRANI:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { idx: 0, label: '0: %50 Denge' },
                      { idx: 1, label: '1: %75 Basınç' },
                      { idx: 2, label: '2: %100 Tahliye' },
                      { idx: 3, label: '3: %25 Düşük' },
                    ].map((d) => (
                      <button
                        key={d.idx}
                        onClick={() => onAction('advanced_airlock_params', { dialIndex: d.idx })}
                        disabled={adv.subsystems.hava_kilidi.isSealed}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                          adv.subsystems.hava_kilidi.currentDialIndex === d.idx
                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_#a855f7]'
                            : 'bg-[#1b1933] border-white/10 text-slate-300 hover:border-purple-400'
                        }`}
                        type="button"
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">VAKUM GÜCÜ:</span>
                    <span className="text-purple-300 font-bold">
                      {adv.subsystems.hava_kilidi.currentVacuum || 50}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adv.subsystems.hava_kilidi.currentVacuum || 50}
                    onChange={(e) => onAction('advanced_airlock_params', { vacuum: Number(e.target.value) })}
                    disabled={adv.subsystems.hava_kilidi.isSealed}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => onAction('advanced_airlock_seal', {})}
                  disabled={adv.subsystems.hava_kilidi.isSealed}
                  className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer ${
                    adv.subsystems.hava_kilidi.isSealed
                      ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/30'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-98 text-white'
                  }`}
                  type="button"
                >
                  {adv.subsystems.hava_kilidi.isSealed ? '✓ HAVA KİLİDİ MÜHÜRLENDİ' : 'HAVA KİLİDİNİ MÜHÜRLE VE KİLİTLE'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: KABLO BAĞLANTISI (VERİ HATLARI)                              */}
        {/* ================================================================= */}
        {activeTab === 'kablo' && (
          <div className="flex-1 flex flex-col space-y-3">
            {/* Status card */}
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-sky-300 font-mono uppercase flex items-center gap-1.5">
                  🔌 {isDerinBasinc ? 'Abisal Veri Hatları' : 'Veri Kablosu Ağı'}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  adv.subsystems.kablo?.isRepaired
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                }`}>
                  {adv.subsystems.kablo?.isRepaired ? 'ONARILDI & KİLİTLİ' : 'HATLAR KOPUK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Kaptan frekans kılavuzunu iletir; Mühendis veri kablolarını doğru terminallere bağlar.
              </p>
            </div>

            {isCaptain ? (
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide flex items-center gap-2">
                  <span>📜</span>
                  <span>Kaptan Terminal Kılavuzu &amp; Frekans Tablosu</span>
                </h4>
                <div className="space-y-2">
                  {state.cable.ports.map((p) => {
                    const reqCable = state.cable.cables.find(c => c.id === p.requiredCableId);
                    return (
                      <div key={p.id} className="p-2.5 rounded-xl bg-[#0f0e20] border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-white block">{p.label}</span>
                          <span className="text-[9px] text-slate-400">{p.functionLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-300 font-bold">
                            Hedef: {reqCable?.label || p.requiredCableId}
                          </span>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: reqCable?.dotColor || '#38bdf8' }}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-[#171433] border border-cyan-500/30 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-bold font-sora text-cyan-200 uppercase tracking-wide flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Mühendis Terminal Bağlantı Paneli</span>
                </h4>
                <div className="space-y-2">
                  {state.cable.ports.map((p) => {
                    const currentAssignment = adv.subsystems.kablo?.portAssignments[p.id] || null;
                    return (
                      <div key={p.id} className="p-2.5 rounded-xl bg-[#0f0e20] border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-cyan-300 block">{p.label}</span>
                          <span className="text-[9px] text-slate-400">{p.functionLabel}</span>
                        </div>
                        <select
                          value={currentAssignment || ''}
                          disabled={adv.subsystems.kablo?.isRepaired}
                          onChange={(e) => onAction('advanced_cable_assign', { portId: p.id, cableId: e.target.value || null })}
                          className="bg-[#1e1b38] text-white text-[11px] font-mono py-1 px-2 rounded-lg border border-white/10"
                        >
                          <option value="">-- Kablo Seçin --</option>
                          {state.cable.cables.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => onAction('advanced_cable_test', {})}
                  disabled={adv.subsystems.kablo?.isRepaired}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all ${
                    adv.subsystems.kablo?.isRepaired
                      ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/30 cursor-default'
                      : 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:brightness-110 active:scale-98 text-white'
                  }`}
                  type="button"
                >
                  {adv.subsystems.kablo?.isRepaired ? '✓ VERİ HATTI ONARILDI' : 'VERİ HATTINI TEST ET & KİLİTLE'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: RADAR VE YÖNLENDİRME                                         */}
        {/* ================================================================= */}
        {activeTab === 'radar' && (
          <div className="flex-1 flex flex-col space-y-3">
            {/* Status card */}
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-indigo-300 font-mono uppercase flex items-center gap-1.5">
                  🧭 {isDerinBasinc ? 'Derin Deniz Radarı & Sonar' : 'Radar ve Yönlendirme'}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  adv.subsystems.radar?.isAligned
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                }`}>
                  {adv.subsystems.radar?.isAligned ? 'HİZALANDI & KİLİTLİ' : 'KOORDİNAT SAPMASI'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Kaptan hedef kılavuz açı ve menzilini okur; Mühendis radarı hizalayıp koordinatı kilitler.
              </p>
            </div>

            {isCaptain ? (
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide flex items-center gap-2">
                  <span>📜</span>
                  <span>Kaptan Navigasyon &amp; Koordinat Kılavuzu</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-[#0f0e20] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">HEDEF AZİMUT (AÇI)</span>
                    <span className="text-xl font-mono font-black text-amber-300">
                      {state.radar.targetAzimuth}°
                    </span>
                  </div>
                  <div className="p-3 bg-[#0f0e20] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">HEDEF İRTİFA</span>
                    <span className="text-xl font-mono font-black text-cyan-300">
                      {state.radar.targetElevation}°
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#171433] border border-indigo-500/30 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-bold font-sora text-indigo-200 uppercase tracking-wide flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Mühendis Radar Kalibrasyon Konsolu</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-300">Azimut Açısı:</span>
                      <span className="font-bold text-amber-300">{adv.subsystems.radar?.currentAzimuth ?? 0}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      step="5"
                      disabled={adv.subsystems.radar?.isAligned}
                      value={adv.subsystems.radar?.currentAzimuth ?? 0}
                      onChange={(e) => onAction('advanced_radar_params', { azimuth: Number(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-300">İrtifa Açısı:</span>
                      <span className="font-bold text-cyan-300">{adv.subsystems.radar?.currentElevation ?? 10}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="90" 
                      step="2"
                      disabled={adv.subsystems.radar?.isAligned}
                      value={adv.subsystems.radar?.currentElevation ?? 10}
                      onChange={(e) => onAction('advanced_radar_params', { elevation: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  onClick={() => onAction('advanced_radar_lock', {})}
                  disabled={adv.subsystems.radar?.isAligned}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-all ${
                    adv.subsystems.radar?.isAligned
                      ? 'bg-emerald-600/50 text-emerald-200 border border-emerald-400/30 cursor-default'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 active:scale-98 text-white'
                  }`}
                  type="button"
                >
                  {adv.subsystems.radar?.isAligned ? '✓ RADAR KOORDİNATLARI KİLİTLİ' : 'RADARI HİZALA & KİLİTLE'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: YARDIMCI GÜÇ MATRİSİ (10 MW)                                */}
        {/* ================================================================= */}
        {activeTab === 'guc_matrisi' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-300 font-mono uppercase flex items-center gap-1.5">
                  🔋 İstasyon Yardımcı Güç Matrisi
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  TOPLAM: {adv.powerGrid.totalBudget} MW
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Sınırlı {adv.powerGrid.totalBudget} MW güç rezervi nedeniyle tüm sistemler aynı anda çalıştırılamaz. Sistemler çözüldükçe güç diğer hatlara aktarılmalıdır:
              </p>
            </div>

            <div className="space-y-2">
              {/* Cooling Pumps */}
              <div className="bg-[#171433] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-sora text-slate-200 block">🧊 Soğutma Pompaları</span>
                  <span className="text-[10px] text-slate-400 font-mono">Reaktör stabilizasyonu için en az 4 MW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePowerChange('coolingPumps', -1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >-</button>
                  <span className="w-8 text-center font-mono font-bold text-emerald-400">
                    {adv.powerGrid.coolingPumps}M
                  </span>
                  <button
                    onClick={() => handlePowerChange('coolingPumps', 1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >+</button>
                </div>
              </div>

              {/* Antenna Booster */}
              <div className="bg-[#171433] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-sora text-slate-200 block">📡 Anten Güçlendirici</span>
                  <span className="text-[10px] text-slate-400 font-mono">Paraziti temizlemek için en az 3 MW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePowerChange('antennaBooster', -1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >-</button>
                  <span className="w-8 text-center font-mono font-bold text-cyan-400">
                    {adv.powerGrid.antennaBooster}M
                  </span>
                  <button
                    onClick={() => handlePowerChange('antennaBooster', 1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >+</button>
                </div>
              </div>

              {/* Airlock Compressor */}
              <div className="bg-[#171433] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-sora text-slate-200 block">🚪 Basınç Kompresörü</span>
                  <span className="text-[10px] text-slate-400 font-mono">Hava kilidi mühürlemesi için en az 3 MW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePowerChange('airlockCompressor', -1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >-</button>
                  <span className="w-8 text-center font-mono font-bold text-purple-400">
                    {adv.powerGrid.airlockCompressor}M
                  </span>
                  <button
                    onClick={() => handlePowerChange('airlockCompressor', 1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >+</button>
                </div>
              </div>

              {/* Shield Reserve */}
              <div className="bg-[#171433] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-sora text-slate-200 block">🛡️ Kalkan Rezervi</span>
                  <span className="text-[10px] text-slate-400 font-mono">Plazma dalgası savunması için 3 MW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePowerChange('shieldReserve', -1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >-</button>
                  <span className="w-8 text-center font-mono font-bold text-amber-400">
                    {adv.powerGrid.shieldReserve}M
                  </span>
                  <button
                    onClick={() => handlePowerChange('shieldReserve', 1)}
                    className="w-8 h-8 rounded-lg bg-[#242145] text-white font-bold flex items-center justify-center hover:bg-slate-700 cursor-pointer"
                    type="button"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: TAHLİYE VE KURTARMA KARARI                                 */}
        {/* ================================================================= */}
        {activeTab === 'tahliye' && (
          <div className="flex-1 flex flex-col space-y-3">
            <div className="bg-[#141228] border border-white/10 rounded-2xl p-3 shadow-lg">
              <span className="text-xs font-bold text-rose-300 font-mono uppercase flex items-center gap-1.5 mb-1">
                🛸 Tahliye ve Kurtarma Planı
              </span>
              <p className="text-[11px] text-slate-300 leading-tight">
                Kurtarma sonucu, istasyon sistemlerinin kararlılık durumuna ve seçilen rotaya bağlıdır.
              </p>
            </div>

            {/* Routes */}
            <div className="space-y-2.5">
              {/* Route Alfa */}
              <div 
                onClick={() => onAction('advanced_rescue_select', { routeId: 'alfa' })}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  state.rescue.selectedRouteId === 'alfa'
                    ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-[#151329] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white font-sora">Rota Alfa (Tam Tahliye)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                    10 KİŞİ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>⏱️ Seyahat: 75s</span>
                  <span>•</span>
                  <span>🛡️ Gövde: -%5</span>
                </div>
                <div className="bg-[#0e0c1f] p-2 rounded-xl border border-white/5 space-y-1 text-[10px] font-mono">
                  <span className="text-slate-400 block font-bold">ZORUNLU ÖNKOŞULLAR (TAM OPERASYONEL):</span>
                  <div className="grid grid-cols-2 gap-1">
                    {state.selectedMiniGames?.map((g) => (
                      <span key={g} className={getSubsystemSolved(g) ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                        {getSubsystemSolved(g) ? `✓ ${getMiniGameLabel(g, isDerinBasinc)}` : `✗ ${getMiniGameLabel(g, isDerinBasinc)}`}
                      </span>
                    ))}
                    <span className={adv.subsystems.reaktor.isStabilized ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {adv.subsystems.reaktor.isStabilized ? '✓ Reaktör/Balast' : '✗ Reaktör/Balast'}
                    </span>
                    <span className={adv.subsystems.sinyal.isLocked ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {adv.subsystems.sinyal.isLocked ? '✓ Sinyal/Sonar' : '✗ Sinyal/Sonar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Beta */}
              <div 
                onClick={() => onAction('advanced_rescue_select', { routeId: 'beta' })}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  state.rescue.selectedRouteId === 'beta'
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-[#151329] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white font-sora">Rota Beta (Lagrange Denge Koridoru)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    8 KİŞİ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>⏱️ Seyahat: 50s</span>
                  <span>•</span>
                  <span>🛡️ Gövde: -%5</span>
                </div>
                <div className="bg-[#0e0c1f] p-2 rounded-xl border border-white/5 space-y-1 text-[10px] font-mono">
                  <span className="text-slate-400 block font-bold">ZORUNLU ÖNKOŞULLAR:</span>
                  <div className="grid grid-cols-2 gap-1">
                    <span className={adv.subsystems.reaktor.isStabilized ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {adv.subsystems.reaktor.isStabilized ? '✓ Reaktör Dengeli' : '✗ Reaktör Gerekli'}
                    </span>
                    <span className={adv.subsystems.sinyal.isLocked ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {adv.subsystems.sinyal.isLocked ? '✓ Sinyal Kilitli' : '✗ Sinyal Gerekli'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Gama */}
              <div 
                onClick={() => onAction('advanced_rescue_select', { routeId: 'gama' })}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  state.rescue.selectedRouteId === 'gama'
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                    : 'bg-[#151329] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white font-sora">Rota Gama (Acil Kaçış Podu)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    6 KİŞİ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>⏱️ Seyahat: 30s</span>
                  <span>•</span>
                  <span>🛡️ Gövde: -%10</span>
                </div>
                <div className="bg-[#0e0c1f] p-2 rounded-xl border border-white/5 space-y-1 text-[10px] font-mono">
                  <span className="text-slate-400 block font-bold">ASGARİ ÖNKOŞUL (EN AZ 1 SİSTEM):</span>
                  <div className="flex items-center justify-between">
                    <span className={(adv.subsystems.reaktor.isStabilized || adv.subsystems.sinyal.isLocked) ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {(adv.subsystems.reaktor.isStabilized || adv.subsystems.sinyal.isLocked) ? '✓ Sistem Hazırlığı Tamam' : '✗ Sıfır hazırlıkla fırlatılamaz (Reaktör veya Sinyal şart)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval status */}
            <div className="bg-[#121024] p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${state.rescue.captainApproved ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                <span className={state.rescue.captainApproved ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  Kaptan Onayı
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${state.rescue.engineerApproved ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                <span className={state.rescue.engineerApproved ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  Mühendis Onayı
                </span>
              </div>
            </div>

            <button
              onClick={() => onAction('advanced_rescue_approve', { routeId: state.rescue.selectedRouteId })}
              className={`w-full py-3 rounded-2xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-xl cursor-pointer ${
                (isCaptain ? state.rescue.captainApproved : state.rescue.engineerApproved)
                  ? 'bg-amber-600 text-white'
                  : 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:brightness-110 active:scale-98 text-white'
              }`}
              type="button"
            >
              {(isCaptain ? state.rescue.captainApproved : state.rescue.engineerApproved)
                ? '✓ ONAYINIZ VERİLDİ (DİĞER ROL BEKLENİYOR)'
                : `BU ROTAYI ONAYLA: ROTA ${state.rescue.selectedRouteId.toUpperCase()}`}
            </button>
          </div>
        )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5. Mission Evacuation Log Footer */}
      <footer className="relative z-10 mt-2 bg-[#0d0c1c] rounded-xl p-2 border border-white/5">
        <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">OPERASYON GÜNLÜĞÜ:</span>
        <div className="text-[10px] font-mono text-slate-300 truncate">
          {adv.evacuationLog[adv.evacuationLog.length - 1] || 'Sistemler izleniyor...'}
        </div>
      </footer>

    </div>
  );
};
