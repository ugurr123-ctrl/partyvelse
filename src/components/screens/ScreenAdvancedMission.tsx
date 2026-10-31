import React, { useState } from 'react';
import { 
  MissionState, 
  Role, 
  AdvancedSubsystemId 
} from '../../types/game';

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
  const [activeTab, setActiveTab] = useState<AdvancedSubsystemId>(
    adv?.activeSubsystemTab || 'reaktor'
  );

  // If advanced scenario data is not initialized
  if (!adv) {
    return (
      <div className="w-full max-w-[420px] mx-auto min-h-[880px] bg-[#0a0815] text-white flex items-center justify-center p-6 rounded-[36px] border border-white/10">
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

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-[915px] bg-[#080711] text-white flex flex-col justify-between p-4 rounded-[40px] border border-white/10 shadow-2xl relative select-none font-sans overflow-hidden animate-fadeIn">
      
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
                OPERASYON: ÇÖKÜŞ EŞİĞİ
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isCaptain 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {isCaptain ? '★ KAPTAN (PROTOKOL VE KURALLAR)' : '⚙ MÜHENDİS (ÖLÇÜM VE KONTROL)'}
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
            <span className="text-[10px] font-mono text-slate-400 uppercase">Gövde Bütünlüğü:</span>
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
      </header>

      {/* 2. Critical Event Banner: Plasma Surge */}
      {adv.event.isActive && !adv.event.isResolved && (
        <div className="relative z-20 mb-2 p-3 bg-red-950/80 border-2 border-red-500 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase text-red-200 tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              ⚠️ {adv.event.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300">
              Temas: ~{Math.max(0, state.timeLeftSeconds - adv.event.strikeTime)}s
            </span>
          </div>
          <p className="text-[11px] text-red-100 leading-tight mb-2">
            {adv.event.desc} Kaptan ve Mühendis ortak savunma kararı almalıdır!
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAction('advanced_event_react', { reaction: 'kalkan' })}
              className="py-1.5 px-2 bg-cyan-600/90 hover:bg-cyan-500 active:scale-95 text-white rounded-xl text-[10px] font-bold tracking-wide uppercase border border-cyan-400/50 cursor-pointer shadow"
              type="button"
            >
              🛡️ Kalkanlara 3 MW Ver (%100 Koruma)
            </button>
            <button
              onClick={() => onAction('advanced_event_react', { reaction: 'tahliye' })}
              className="py-1.5 px-2 bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-[10px] font-bold tracking-wide uppercase border border-amber-400/50 cursor-pointer shadow"
              type="button"
            >
              💨 Bacaları Aç (-%5 Gövde)
            </button>
          </div>
        </div>
      )}

      {/* 3. Subsystem Tactical Tabs */}
      <nav className="relative z-10 grid grid-cols-5 gap-1 mb-2">
        <button
          onClick={() => handleTabChange('reaktor')}
          className={`py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase flex flex-col items-center justify-center transition-all cursor-pointer border ${
            activeTab === 'reaktor'
              ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-[#151329] border-white/5 text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="text-xs">⚡</span>
          <span>Reaktör</span>
          <span className={`text-[8px] font-normal ${adv.subsystems.reaktor.isStabilized ? 'text-emerald-400' : 'text-slate-500'}`}>
            {adv.subsystems.reaktor.isStabilized ? 'STABİL' : 'KRİTİK'}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('sinyal')}
          className={`py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase flex flex-col items-center justify-center transition-all cursor-pointer border ${
            activeTab === 'sinyal'
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,238,252,0.3)]'
              : 'bg-[#151329] border-white/5 text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="text-xs">📡</span>
          <span>Sinyal</span>
          <span className={`text-[8px] font-normal ${adv.subsystems.sinyal.isLocked ? 'text-emerald-400' : 'text-slate-500'}`}>
            {adv.subsystems.sinyal.isLocked ? 'KİLİTLİ' : '%'+adv.subsystems.sinyal.noiseLevel+' PAR'}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('hava_kilidi')}
          className={`py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase flex flex-col items-center justify-center transition-all cursor-pointer border ${
            activeTab === 'hava_kilidi'
              ? 'bg-purple-500/25 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-[#151329] border-white/5 text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="text-xs">🚪</span>
          <span>Kilid</span>
          <span className={`text-[8px] font-normal ${adv.subsystems.hava_kilidi.isSealed ? 'text-emerald-400' : 'text-slate-500'}`}>
            {adv.subsystems.hava_kilidi.isSealed ? 'MÜHÜRLÜ' : 'AÇIK'}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('guc_matrisi')}
          className={`py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase flex flex-col items-center justify-center transition-all cursor-pointer border ${
            activeTab === 'guc_matrisi'
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-[#151329] border-white/5 text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="text-xs">🔋</span>
          <span>Güç</span>
          <span className="text-[8px] font-normal text-emerald-400">10 MW</span>
        </button>

        <button
          onClick={() => handleTabChange('tahliye')}
          className={`py-1.5 rounded-xl text-[10px] font-bold font-mono uppercase flex flex-col items-center justify-center transition-all cursor-pointer border ${
            activeTab === 'tahliye'
              ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              : 'bg-[#151329] border-white/5 text-slate-400 hover:text-white'
          }`}
          type="button"
        >
          <span className="text-xs">🛸</span>
          <span>Tahliye</span>
          <span className="text-[8px] font-normal text-rose-300">ROTA</span>
        </button>
      </nav>

      {/* 4. Active Subsystem Workspace */}
      <main className="relative z-10 flex-1 flex flex-col space-y-2 overflow-y-auto max-h-[560px] pr-0.5">

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
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-1.5">
                  <span className="text-amber-400 text-sm">📜</span>
                  <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide">
                    Teknik Yönerge: Reaktör Dengeleme Protokolü
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mühendisin telemetri ekranındaki canlı ölçümleri isteyin ve kurala göre doğru kesiciyi bildirin:
                </p>
                <div className="bg-[#0f0e20] p-2.5 rounded-xl border border-white/5 space-y-1.5 text-[11px] font-mono">
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">KURAL 1:</strong> Çekirdek Isısı &gt; 75°C ve Soğutucu Basıncı &lt; 45 kPa ise → <span className="text-cyan-300 font-bold">Kesici K2</span> devrededir.
                  </p>
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">KURAL 2:</strong> Çekirdek Isısı &lt; 70°C ve Gürültü &gt; 70 dB ise → <span className="text-cyan-300 font-bold">Kesici K3</span> devrededir.
                  </p>
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">TAHLİYE KURALI:</strong> Mühendisin ölçtüğü en yüksek gürültüye sahip hat derhal tahliye edilmelidir.
                  </p>
                  <p className="text-slate-300">
                    • <strong className="text-amber-300">GÜÇ ŞARTI:</strong> Soğutma Pompaları en az 4 MW beslenmelidir.
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">KESİCİ DEVREYE ALMA EMRİ:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['K1', 'K2', 'K3', 'K4'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => onAction('advanced_reactor_breaker', { breaker: k })}
                        disabled={adv.subsystems.reaktor.isStabilized}
                        className={`py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all cursor-pointer border ${
                          adv.subsystems.reaktor.breakerActivated && k === 'K2'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_#10b981]'
                            : 'bg-[#221f45] border-white/10 text-slate-200 hover:border-amber-400'
                        }`}
                        type="button"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#171433] border border-cyan-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-1.5">
                  <span className="text-cyan-400 text-sm">⚙</span>
                  <h4 className="text-xs font-bold font-sora text-cyan-200 uppercase tracking-wide">
                    Mühendis Canlı Telemetri &amp; Tahliye Kontrolü
                  </h4>
                </div>

                {/* Sensor Readouts */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#0f0e20] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-slate-400 block">ÇEKİRDEK ISISI</span>
                    <span className={`text-sm font-mono font-bold ${
                      adv.subsystems.reaktor.liveTelemetry.coreTemp > 75 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {adv.subsystems.reaktor.liveTelemetry.coreTemp || 84}°C
                    </span>
                  </div>
                  <div className="bg-[#0f0e20] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-slate-400 block">SOĞUTUCU BASINCI</span>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {adv.subsystems.reaktor.liveTelemetry.coolantPressure || 38} kPa
                    </span>
                  </div>
                  <div className="bg-[#0f0e20] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono text-slate-400 block">EN YÜKSEK GÜRÜLTÜ</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      Anten (76 dB)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300">
                  Bu değerleri Kaptana sesli okuyun. Kaptan kesiciyi seçtikten sonra doğru hattı tahliye edin:
                </p>

                <div className="space-y-1.5">
                  <button
                    onClick={() => onAction('advanced_reactor_purge', { line: 'anten' })}
                    disabled={adv.subsystems.reaktor.isStabilized}
                    className="w-full py-2 px-3 bg-[#1e293b] hover:bg-cyan-600 border border-cyan-400/30 rounded-xl text-xs font-mono font-bold text-left flex items-center justify-between cursor-pointer transition-all active:scale-98"
                    type="button"
                  >
                    <span>ANTEN HATTI (76 dB)</span>
                    <span className="text-[10px] text-cyan-300">TAHLİYE ET →</span>
                  </button>
                  <button
                    onClick={() => onAction('advanced_reactor_purge', { line: 'reaktor' })}
                    disabled={adv.subsystems.reaktor.isStabilized}
                    className="w-full py-2 px-3 bg-[#1e293b] hover:bg-red-600 border border-white/10 rounded-xl text-xs font-mono font-bold text-left flex items-center justify-between cursor-pointer transition-all active:scale-98"
                    type="button"
                  >
                    <span>REAKTÖR HATTI (42 dB)</span>
                    <span className="text-[10px] text-slate-400">TAHLİYE ET →</span>
                  </button>
                  <button
                    onClick={() => onAction('advanced_reactor_purge', { line: 'sogutucu' })}
                    disabled={adv.subsystems.reaktor.isStabilized}
                    className="w-full py-2 px-3 bg-[#1e293b] hover:bg-red-600 border border-white/10 rounded-xl text-xs font-mono font-bold text-left flex items-center justify-between cursor-pointer transition-all active:scale-98"
                    type="button"
                  >
                    <span>SOĞUTUCU HATTI (31 dB)</span>
                    <span className="text-[10px] text-slate-400">TAHLİYE ET →</span>
                  </button>
                </div>
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
              <div className="bg-[#171433] border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-1.5">
                  <span className="text-amber-400 text-sm">📜</span>
                  <h4 className="text-xs font-bold font-sora text-amber-200 uppercase tracking-wide">
                    Sinyal Şifre Çözüm Yönergesi
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  İstasyon feneri baz bandı <strong className="text-cyan-300">140.0 MHz</strong> dir. 
                  Kripto sembollerinin değerlerini toplayarak doğru frekansı Mühendise iletin:
                </p>

                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
                  <div className="bg-[#0f0e20] p-1.5 rounded-lg border border-white/5">
                    <span className="text-amber-400 font-bold block">Δ</span>
                    <span className="text-slate-300">+1.2</span>
                  </div>
                  <div className="bg-[#0f0e20] p-1.5 rounded-lg border border-white/5">
                    <span className="text-amber-400 font-bold block">Ω</span>
                    <span className="text-slate-300">+2.4</span>
                  </div>
                  <div className="bg-[#0f0e20] p-1.5 rounded-lg border border-white/5">
                    <span className="text-amber-400 font-bold block">Σ</span>
                    <span className="text-slate-300">-0.8</span>
                  </div>
                  <div className="bg-[#0f0e20] p-1.5 rounded-lg border border-white/5">
                    <span className="text-amber-400 font-bold block">λ</span>
                    <span className="text-slate-300">+0.8</span>
                  </div>
                </div>

                <div className="bg-[#0f0e20] p-2.5 rounded-xl border border-white/5 text-[11px] font-mono text-slate-300">
                  <p>• Formül: 140.0 + (1.2 + 2.4 - 0.8 + 0.8) MHz</p>
                  <p>• Toplam Kayma: <span className="text-emerald-400 font-bold">+3.6 MHz</span></p>
                  <p>• Hedef İletişim Bandı: <strong className="text-cyan-300">143.6 MHz</strong></p>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Not: Mühendisin frekansı kilitleyebilmesi için Güç Matrisinde Anten Güçlendiricinin en az 3 MW olması şarttır!
                </p>
              </div>
            ) : (
              <div className="bg-[#171433] border border-cyan-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-1.5">
                  <span className="text-cyan-400 text-sm">⚙</span>
                  <h4 className="text-xs font-bold font-sora text-cyan-200 uppercase tracking-wide">
                    Spektrum Ayarlayıcı &amp; Frekans Kilitleme
                  </h4>
                </div>

                {/* Oscilloscope simulation */}
                <div className="h-16 bg-[#090814] rounded-xl border border-cyan-500/30 flex items-center justify-center p-2 relative overflow-hidden">
                  <div className={`w-full h-1 bg-cyan-400 ${adv.subsystems.sinyal.noiseLevel > 50 ? 'animate-pulse blur-[1px]' : 'shadow-[0_0_8px_#00eefc]'}`}></div>
                  <span className="absolute top-1 left-2 text-[9px] font-mono text-cyan-400">
                    PARAZİT: %{adv.subsystems.sinyal.noiseLevel}
                  </span>
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
                    AKTF FREKANS: {adv.subsystems.sinyal.currentFrequency}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Kaptandan hesaplanan doğru frekansı öğrenin ve kilitleyin:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {['141.2 MHz', '142.4 MHz', '143.6 MHz', '144.8 MHz'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => onAction('advanced_signal_tune', { freq })}
                      disabled={adv.subsystems.sinyal.isLocked}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                        adv.subsystems.sinyal.currentFrequency === freq
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_#00eefc]'
                          : 'bg-[#1b1933] border-white/10 text-slate-200 hover:border-cyan-400'
                      }`}
                      type="button"
                    >
                      {freq} {adv.subsystems.sinyal.isLocked && freq === '143.6 MHz' ? '✓' : ''}
                    </button>
                  ))}
                </div>
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
                  TOPLAM: 10 MW
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Sınırlı 10 MW güç rezervini alt sistemler arasında paylaştırın. Her sistemin asgari besleme eşiği vardır:
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
            <div className="space-y-2">
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
                <p className="text-[10px] text-slate-300 leading-tight mb-1">
                  Ana tahliye rampası ve ağır filo. Tüm personeli kurtarır.
                </p>
                <div className="text-[10px] font-mono flex items-center gap-2">
                  <span className={adv.subsystems.hava_kilidi.isSealed ? 'text-emerald-400' : 'text-red-400'}>
                    {adv.subsystems.hava_kilidi.isSealed ? '✓ Hava Kilidi Mühürlü (Tam Başarı)' : '⚠️ Hava Kilidi Açık (Yırtılma Riski: Sadece 3 Kişi!)'}
                  </span>
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
                <p className="text-[10px] text-slate-300 leading-tight mb-1">
                  Hava kilidine ihtiyaç duymayan otonom kaçış mekiği. Dengeli ve güvenli tahliye.
                </p>
                <div className="text-[10px] font-mono text-emerald-400">
                  ✓ Güvenli Tahliye Garantisi (8 Kişi)
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
                <p className="text-[10px] text-slate-300 leading-tight mb-1">
                  Süratli fırlatma podu; asgari güçle derhal istasyondan ayrılır.
                </p>
                <div className="text-[10px] font-mono text-cyan-300">
                  ✓ Hızlı Darboğaz Tahliyesi (6 Kişi)
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
