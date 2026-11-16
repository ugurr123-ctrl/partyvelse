import React, { useState, useEffect } from 'react';
import { 
  OperationTheme 
} from '../../types/game';
import { PWAInstallButton } from '../PWAInstallButton';
import {
  TEAM_OPERATION_THEMES,
  isTeamOperationTheme,
  getTeamOperationMeta,
} from '../../services/omegaGameEngine';
import { 
  Compass, 
  Radio, 
  ShieldAlert, 
  Zap, 
  Users, 
  Columns2, 
  ArrowRight, 
  Play, 
  Layers, 
  FileText, 
  Waves, 
  Terminal, 
  Rocket, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Sliders,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FlaskConical
} from 'lucide-react';

interface Props {
  onStartGame: (theme?: OperationTheme) => void;
  onStartDualView: (theme?: OperationTheme) => void;
  onOpenRules: () => void;
  onOpenExplorer: () => void;
  currentTheme?: OperationTheme;
  onSelectTheme?: (theme: OperationTheme) => void;
}

export const Screen00Opening: React.FC<Props> = ({
  onStartGame,
  onStartDualView,
  onOpenRules,
  onOpenExplorer,
  currentTheme,
  onSelectTheme,
}) => {
  const [activeCardTab, setActiveCardTab] = useState<'asymmetric' | 'themes' | 'tasks' | 'power' | 'routes'>('asymmetric');
  const [selectedThemePreview, setSelectedThemePreview] = useState<OperationTheme>(currentTheme || 'derin_basinc');
  const [activeRoleView, setActiveRoleView] = useState<'all' | 'kaptan' | 'muhendis'>('all');

  // Keep selected theme preview synchronized if parent changes
  useEffect(() => {
    if (currentTheme && currentTheme !== selectedThemePreview) {
      setSelectedThemePreview(currentTheme);
    }
  }, [currentTheme]);

  const handleThemeChange = (theme: OperationTheme) => {
    setSelectedThemePreview(theme);
    if (onSelectTheme) {
      onSelectTheme(theme);
    }
  };

  const isTeamOp = isTeamOperationTheme(selectedThemePreview);
  const teamMeta = getTeamOperationMeta(selectedThemePreview);
  const isKarantina = selectedThemePreview === 'karantina_2088';
  const isDerin = selectedThemePreview === 'derin_basinc';
  const isGolge = selectedThemePreview === 'golge_protokolu';

  const themeDisplayTitle = isTeamOp ? teamMeta.title.toUpperCase() :
                            isKarantina ? 'KARANTİNA 2088 // HAREKÂT' :
                            isDerin ? 'DERİN BASINÇ // HAREKÂT' :
                            isGolge ? 'GÖLGE PROTOKOLÜ // HAREKÂT' : 'KAYIP SİNYAL // HAREKÂT';

  const themeBadgeText = isTeamOp
    ? `🛡️ 3–4 KİŞİLİK · 5 AŞAMA · ${teamMeta.shortTitle}`
    : isKarantina ? '☣️ 2 KİŞİLİK BİYOLOJİK İZOLASYON'
    : isDerin ? '⚓ 2 KİŞİLİK SU ALTI (-850M)'
    : isGolge ? '🕶️ 2 KİŞİLİK SİBER SIZMA'
    : '🛸 2 KİŞİLİK UZAY İSTASYONU';

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 sm:py-4 flex flex-col gap-4 sm:gap-6 animate-fadeIn text-[#e6dff9] select-none pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-8">
      
      {/* Hero Section - Optimized for Mobile & Desktop */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#181335] via-[#120e28] to-[#0a0718] border border-white/10 shadow-2xl p-4 sm:p-8">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-[#00eefc]/15 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-[#ffb703]/15 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex-1 flex flex-col items-start text-left">
            
            {/* Mission Type Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3 font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
              <span className={
                isTeamOp ? 'text-emerald-300' :
                isKarantina ? 'text-amber-300' :
                isDerin ? 'text-cyan-300' :
                isGolge ? 'text-purple-300' : 'text-[#ffb703]'
              }>
                {themeBadgeText}
              </span>
              <span className="text-white/25">·</span>
              <span className="text-[#00eefc]">ASİMETRİK İLETİŞİM</span>
              <span className="text-white/25 hidden xs:inline">·</span>
              <span className="text-emerald-300 hidden xs:inline">
                {isTeamOp ? '3 VEYA 4 CİHAZ · 5 AŞAMA' : '2 CİHAZ'}
              </span>
            </div>

            <h1 className="font-sora text-2xl xs:text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              VOKZA <br className="hidden sm:inline" />
              <span className={`transition-all duration-300 bg-clip-text text-transparent ${
                isTeamOp ? 'bg-gradient-to-r from-emerald-300 via-[#00eefc] to-[#ffb703]' :
                isKarantina ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-red-500' :
                isDerin ? 'bg-gradient-to-r from-[#00eefc] via-cyan-300 to-blue-500' :
                isGolge ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-[#00eefc]' :
                'bg-gradient-to-r from-[#00eefc] via-[#ffb703] to-[#ef4444]'
              }`}>
                {themeDisplayTitle}
              </span>
            </h1>

            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-[#c7beaf] max-w-2xl leading-relaxed">
              {isTeamOp
                ? 'Üç veya dört farklı telefon, bağımsız uzman rolleri ve sıfır ortak ekran! Komutan, Mühendis, Kriptolog ve Güvenlik birimleri telemetri ile şifreleri yalnızca telsizle paylaşır; 5 aşamalı krizi birlikte çözer.'
                : 'İki farklı telefon, iki bağımsız rol ve sıfır ortak ekran! Biri kılavuz ve kuralları incelerken diğeri kontrol panellerini ve telemetriyi yönetir. Ekranlara bakmak kesinlikle yasaktır; sadece sesli iletişimle sistemi kurtarın.'}
            </p>

            {/* Viral Rule #1 Hook Banner */}
            <div className="w-full mt-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-950/60 via-[#1e1329] to-amber-950/60 border border-amber-400/40 shadow-lg flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 flex-shrink-0 text-xl font-bold">
                ⚠️
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-[11px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span>KURAL #1: EKRANLARA BAKMAK KESİNLİKLE YASAKTIR!</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase">İLİŞKİ TESTİ</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug">
                  Yan yana veya uzaktan oynayın; arkadaşınızın ekranını görmeden <strong>yalnızca ses ve telsizle</strong> koordinasyon kurun. Sevgilinizle veya arkadaşınızla kavga etmeden bitirebilir misiniz?
                </p>
              </div>
            </div>

            {/* 3 Steps Zero-Barrier Explainer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full mt-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-[#00eefc] flex items-center justify-center font-bold text-xs font-mono flex-shrink-0">1</span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Odayı Kur & Davet Et</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Oda kodunu veya davetini arkadaşına gönder.</span>
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#ffb703] flex items-center justify-center font-bold text-xs font-mono flex-shrink-0">2</span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Ekranları Gizle</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Biri şifreyi çözer, diğeri vanaları kilitler.</span>
                </div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs font-mono flex-shrink-0">3</span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white">Telsizle Yönet</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Süre dolmadan bağırarak sistemi kurtarın!</span>
                </div>
              </div>
            </div>

            {/* Quick Hero Actions - Desktop & Tablet */}
            <div className="mt-4 sm:mt-6 hidden sm:flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onStartGame(selectedThemePreview)}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(255,183,3,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer whitespace-normal text-center"
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>
                  {isTeamOp ? `${teamMeta.shortTitle} (3–4 KİŞİ) ODA OLUŞTUR` :
                   isKarantina ? 'KARANTİNA 2088 (2 KİŞİ) BAŞLAT' :
                   isDerin ? 'DERİN BASINÇ (2 KİŞİ) BAŞLAT' :
                   isGolge ? 'GÖLGE PROTOKOLÜ (2 KİŞİ) BAŞLAT' :
                   'KAYIP SİNYAL (2 KİŞİ) BAŞLAT'}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

            </div>
          </div>

          {/* Theme Selector Widget - Mobile Horizontal, Desktop Vertical */}
          <div className="w-full lg:w-80 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e0b1c]/95 border border-white/10 shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs font-mono">
              <span className="text-[#9e8f78] uppercase font-bold text-[10px] sm:text-xs">OPERASYON SEÇ</span>
              <span className="text-emerald-300 font-bold text-[10px] sm:text-xs">4×(3–4P) &amp; 4×(2P)</span>
            </div>

            <div className="text-[9px] font-mono text-emerald-300/90 uppercase font-bold tracking-wider">
              3–4 Kişilik Takım Oyunları (5 Aşama)
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {TEAM_OPERATION_THEMES.map((tId) => {
                const meta = getTeamOperationMeta(tId);
                const selected = selectedThemePreview === tId;
                return (
                  <button
                    key={tId}
                    onClick={() => handleThemeChange(tId)}
                    className={`min-h-[44px] p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      selected
                        ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                        : 'bg-emerald-500/10 border-emerald-500/25 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold font-sora text-white truncate">{meta.shortTitle}</span>
                        <span className="text-[9px] text-emerald-300 font-mono truncate">3–4 Kişi · 5 Aşama</span>
                      </div>
                    </div>
                    {selected && <span className="text-emerald-400 text-xs shrink-0">●</span>}
                  </button>
                );
              })}
            </div>

            <div className="text-[9px] font-mono text-[#ffb703]/90 uppercase font-bold tracking-wider pt-1 border-t border-white/5">
              2 Kişilik Düello Oyunları (Mevcut)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {/* Theme 0: Karantina 2088 */}
              <button
                onClick={() => handleThemeChange('karantina_2088')}
                className={`min-h-[44px] p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                  selectedThemePreview === 'karantina_2088'
                    ? 'bg-amber-950/90 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold font-sora text-white truncate">Karantina</span>
                    <span className="text-[9px] text-amber-300 font-mono truncate">2P · KR88</span>
                  </div>
                </div>
              </button>

              {/* Theme 1: Derin Basınç */}
              <button
                onClick={() => handleThemeChange('derin_basinc')}
                className={`min-h-[44px] p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                  selectedThemePreview === 'derin_basinc'
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,238,252,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Waves className="w-3.5 h-3.5 text-[#00eefc] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold font-sora text-white truncate">Derin Basınç</span>
                    <span className="text-[9px] text-cyan-300 font-mono truncate">2P · 85 ATM</span>
                  </div>
                </div>
              </button>

              {/* Theme 2: Gölge Protokolü */}
              <button
                onClick={() => handleThemeChange('golge_protokolu')}
                className={`min-h-[44px] p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                  selectedThemePreview === 'golge_protokolu'
                    ? 'bg-purple-950/80 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Terminal className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold font-sora text-white truncate">Gölge</span>
                    <span className="text-[9px] text-purple-300 font-mono truncate">2P · Kat 84</span>
                  </div>
                </div>
              </button>

              {/* Theme 3: Kayıp Sinyal */}
              <button
                onClick={() => handleThemeChange('kayip_sinyal')}
                className={`min-h-[44px] p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                  selectedThemePreview === 'kayip_sinyal'
                    ? 'bg-amber-950/80 border-amber-400 text-white shadow-[0_0_12px_rgba(255,183,3,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Rocket className="w-3.5 h-3.5 text-[#ffb703] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold font-sora text-white truncate">Kayıp Sinyal</span>
                    <span className="text-[9px] text-amber-300 font-mono truncate">2P · Aurora</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tabular-nums">
              <span className="text-[#9e8f78]">Zaman Limiti:</span>
              <span className="text-[#ffb703] font-bold">
                {isTeamOp ? '8 Dakika (480s)' : '5 Dakika (300s)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tanıtım Kartları Navigasyon Sekmeleri - Thumb-zone & Scrollable on Mobile */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffb703]" />
            <h2 className="font-sora text-sm sm:text-xl font-bold text-white">
              Operasyon Kılavuzu & Tanıtım Kartları
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-[#00eefc] uppercase tracking-wider">
            {activeCardTab === 'asymmetric' ? '1/5 Roller' :
             activeCardTab === 'themes' ? '2/5 Operasyon' :
             activeCardTab === 'tasks' ? '3/5 Görevler' :
             activeCardTab === 'power' ? '4/5 Güç' : '5/5 Tahliye'}
          </span>
        </div>

        {/* Responsive Tabs: Horizontal swipeable on phone, 5-col grid on tablet/desktop */}
        <div className="flex sm:grid sm:grid-cols-5 gap-1.5 bg-[#120e28] p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveCardTab('asymmetric')}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-sora text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeCardTab === 'asymmetric'
                ? 'bg-[#ffb703] text-[#271900] shadow-[0_2px_10px_rgba(255,183,3,0.3)]'
                : 'text-[#9e8f78] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Asimetrik Roller</span>
          </button>

          <button
            onClick={() => setActiveCardTab('themes')}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-sora text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeCardTab === 'themes'
                ? 'bg-[#00eefc] text-[#002022] shadow-[0_2px_10px_rgba(0,238,252,0.3)]'
                : 'text-[#9e8f78] hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>8 Operasyon</span>
          </button>

          <button
            onClick={() => setActiveCardTab('tasks')}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-sora text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeCardTab === 'tasks'
                ? 'bg-purple-400 text-purple-950 shadow-[0_2px_10px_rgba(168,85,247,0.3)]'
                : 'text-[#9e8f78] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>5 Taktik Görev</span>
          </button>

          <button
            onClick={() => setActiveCardTab('power')}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-sora text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeCardTab === 'power'
                ? 'bg-amber-400 text-amber-950 shadow-[0_2px_10px_rgba(251,191,36,0.3)]'
                : 'text-[#9e8f78] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>Güç Matrisi</span>
          </button>

          <button
            onClick={() => setActiveCardTab('routes')}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-sora text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              activeCardTab === 'routes'
                ? 'bg-emerald-400 text-emerald-950 shadow-[0_2px_10px_rgba(52,211,153,0.3)]'
                : 'text-[#9e8f78] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Tahliye Rotaları</span>
          </button>
        </div>
      </div>

      {/* Tanıtım Kartları İçerik Alanı */}
      <div className="w-full">
        
        {/* KART 1: Asimetrik Oynanış ve Roller */}
        {activeCardTab === 'asymmetric' && (
          <div className="flex flex-col gap-3 sm:gap-4 animate-fadeIn">
            {/* Mobile Role Switcher for Easier Thumb Focus */}
            <div className="flex sm:hidden items-center gap-1 bg-[#120e28] p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => setActiveRoleView('all')}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-colors ${
                  activeRoleView === 'all' ? 'bg-white/20 text-white' : 'text-[#9e8f78]'
                }`}
              >
                Her İki Rol
              </button>
              <button
                onClick={() => setActiveRoleView('kaptan')}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-colors ${
                  activeRoleView === 'kaptan' ? 'bg-amber-500 text-black' : 'text-[#9e8f78]'
                }`}
              >
                Kaptan (Kılavuz)
              </button>
              <button
                onClick={() => setActiveRoleView('muhendis')}
                className={`flex-1 py-1.5 rounded-lg text-center font-bold transition-colors ${
                  activeRoleView === 'muhendis' ? 'bg-cyan-500 text-black' : 'text-[#9e8f78]'
                }`}
              >
                Mühendis (Kontrol)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Kaptan / Kılavuz Kartı */}
              {(activeRoleView === 'all' || activeRoleView === 'kaptan') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-amber-500/40 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-[#ffb703] border border-amber-500/30 flex items-center justify-center">
                        <Compass className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-[#ffb703] border border-amber-500/40 font-mono text-[9px] sm:text-[10px] font-bold uppercase">
                        1. ROL // KILAVUZ & STRATEJİ
                      </span>
                    </div>

                    <h3 className="font-sora text-base sm:text-lg font-bold text-white mb-1">
                      Kaptan / Dümenci / Sahadaki Ajan
                    </h3>
                    <p className="text-xs text-[#d5c4ac] leading-relaxed mb-3 sm:mb-4">
                      Sistemlerin teşhis protokolleri, kural dönüşüm algoritmaları, acil kesici kilitleri ve tahliye koordinatları yalnızca sizin ekranınızdadır.
                    </p>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-[#ffb703] shrink-0 mt-0.5" />
                        <span><strong>Gördükleri:</strong> Teşhis koşulları (Isı/Basınç/Parazit sınırları), Glif-Sayı şifre dönüşüm kuralları, K1-K4 kesici anahtarları, tahliye onay butonu.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span><strong>Göremedikleri:</strong> Sensör telemetrisi, frekans kadranı, vakum gücü ve kablo terminalleri. Mühendisin sözlü bildirimine muhtaçtır.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#9e8f78]">
                    <span>İletişim Kanalı: <strong>Sesli Telsiz</strong></span>
                    <span className="text-[#ffb703] font-bold">Kritik Karar Verici</span>
                  </div>
                </div>
              )}

              {/* Mühendis / Makinist Kartı */}
              {(activeRoleView === 'all' || activeRoleView === 'muhendis') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-cyan-500/40 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 text-[#00eefc] border border-cyan-500/30 flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-[#00eefc] border border-cyan-500/40 font-mono text-[9px] sm:text-[10px] font-bold uppercase">
                        2. ROL // KONTROL & TELEMETRİ
                      </span>
                    </div>

                    <h3 className="font-sora text-base sm:text-lg font-bold text-white mb-1">
                      Mühendis / Makinist / Gölge Hacker
                    </h3>
                    <p className="text-xs text-[#d5c4ac] leading-relaxed mb-3 sm:mb-4">
                      Geminin donanımı, canlı sensör telemetrisi, valf açıları, vakum kompresörleri ve frekans ayarlayıcıları parmaklarınızın ucundadır.
                    </p>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-[#00eefc] shrink-0 mt-0.5" />
                        <span><strong>Gördükleri:</strong> 4 devrenin canlı sıcaklık/basınç değerleri, 45°-180° valf anahtarları, frekans arama slider&apos;ı, kablo portları ve güç dağıtımı.</span>
                      </div>
                      <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span><strong>Göremedikleri:</strong> Hangi devrenin arızalı sayılacağı kuralı, gliflerin ne anlama geldiği ve acil durum kesici kilidinin hangisi olduğu.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#9e8f78]">
                    <span>Eylem Alanı: <strong>Fiziksel Panel</strong></span>
                    <span className="text-[#00eefc] font-bold">Uygulayıcı & Operatör</span>
                  </div>
                </div>
              )}
            </div>

            {/* Altın Kural Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-cyan-950/40 border border-white/15 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                🤫
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-sora text-xs sm:text-sm font-bold text-white leading-tight">
                  Altın Kural: Asla Birbirinizin Ekranına Bakmayın!
                </span>
                <span className="text-[11px] sm:text-xs text-[#c7beaf] mt-0.5 leading-snug">
                  Her iki oyuncu telefonlarını birbirine göstermeden tutmalıdır. Tüm koordinasyon ve problem çözme sadece konuşarak gerçekleştirilir.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* KART 2: 8 Farklı Operasyon Evreni (4×3-4P + 4×2P) */}
        {activeCardTab === 'themes' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {TEAM_OPERATION_THEMES.map((tId) => {
                const meta = getTeamOperationMeta(tId);
                return (
                  <div
                    key={tId}
                    className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.12)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold">
                          3–4 KİŞİ · 5 AŞAMA
                        </span>
                      </div>
                      <h3 className="font-sora text-sm sm:text-base font-bold text-white mb-1">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-[#c7beaf] leading-relaxed mb-3">
                        {meta.description}
                      </p>
                      <div className="space-y-1 text-[11px] font-mono text-emerald-200/80">
                        {meta.stageTitles.map((st, i) => (
                          <div key={i} className="truncate">• {st}</div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onStartGame(tId)}
                      className="mt-3 sm:mt-4 w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-xs font-sora font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <span>Bu Ekip Göreviyle Başla</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Tema 0: Karantina 2088 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[9px] font-bold">
                    SEVİYE 4 BİYO-TEHDİT
                  </span>
                </div>
                <h3 className="font-sora text-sm sm:text-base font-bold text-white mb-1">
                  Karantina 2088 // Protokol
                </h3>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-3">
                  Sektör-04 Derin İzolasyon Biyoloji Laboratuvarı. Baş Biyolog Selin patojen mutasyonunu ve sentetik panzehir formülünü çözerken Güvenlik Şefi Baran UV koridorlarını ve 12 Bar vanaları kilitler.
                </p>
                <div className="space-y-1 text-[11px] font-mono text-amber-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">🧬</span>
                    <span>Selin: Patojen DNA & Biyoreaktör</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">🛡️</span>
                    <span>Baran: UV Matris & 3800 RPM Tach</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">☣️</span>
                    <span>Zehirli Aerosol Gaz Odası Tahliyesi</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onStartGame('karantina_2088')}
                className="mt-3 sm:mt-4 w-full min-h-[44px] py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-sora font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Bu Operasyonla Başla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tema 1: Derin Basınç */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-cyan-400/50 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-[#00eefc]">
                    <Waves className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-[#00eefc] font-mono text-[9px] font-bold">
                    85.2 ATM ABİSAL
                  </span>
                </div>
                <h3 className="font-sora text-sm sm:text-base font-bold text-white mb-1">
                  Derin Basınç // Batış
                </h3>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-3">
                  HİDRO-04 Batiskap ile okyanusun -850 metre dibindeki volkanik hendekte çökme alarmı. Dümenci ve Makinist balast tankları ve sonar glifleri ile su üstüne çıkmalıdır.
                </p>
                <div className="space-y-1 text-[11px] font-mono text-cyan-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00eefc]">⚓</span>
                    <span>Dümenci: Sonar Kripto & Balast Kilit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00eefc]">🎛️</span>
                    <span>Makinist: Hidrolik Valf & Akustik Tarama</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00eefc]">🌊</span>
                    <span>Hendek Çökme Şoku Savunması</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onStartGame('derin_basinc')}
                className="mt-3 sm:mt-4 w-full min-h-[44px] py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00eefc] border border-cyan-400/40 text-xs font-sora font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Bu Operasyonla Başla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tema 2: Gölge Protokolü */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-purple-400/50 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[9px] font-bold">
                    KAT 84 SİBER SIZMA
                  </span>
                </div>
                <h3 className="font-sora text-sm sm:text-base font-bold text-white mb-1">
                  Gölge Protokolü // Sızma
                </h3>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-3">
                  Megacorp Merkezi Kat 84 Veri Kasası operasyonu. Sahadaki Ajan lazer bariyerleri aşarken Gölge Hacker güvenlik duvarlarını bypass eder ve şifreyi çözer.
                </p>
                <div className="space-y-1 text-[11px] font-mono text-purple-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-purple-300">🕶️</span>
                    <span>Ajan: Lazer Kodları & Biyometrik Kilit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-purple-300">💻</span>
                    <span>Hacker: Güvenlik Duvarı Bypass & Glifler</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-purple-300">🚨</span>
                    <span>%100 Gizlilik Alarm Seviyesi</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onStartGame('golge_protokolu')}
                className="mt-3 sm:mt-4 w-full min-h-[44px] py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs font-sora font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Bu Operasyonla Başla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tema 3: Kayıp Sinyal */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-amber-400/50 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-[#ffb703]">
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-[#ffb703] font-mono text-[9px] font-bold">
                    UZAY İSTASYONU
                  </span>
                </div>
                <h3 className="font-sora text-sm sm:text-base font-bold text-white mb-1">
                  Kayıp Sinyal // İstasyon
                </h3>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-3">
                  Aurora-7 yörünge istasyonunda reaktör erimesi ve iletişim kopması. Kaptan acil durum protokollerini yürütürken Mühendis aşırı ısınan çekirdeği tahliye eder.
                </p>
                <div className="space-y-1 text-[11px] font-mono text-amber-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#ffb703]">👨‍✈️</span>
                    <span>Kaptan: Reaktör Teşhis & Kesici Kilidi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#ffb703]">🔧</span>
                    <span>Mühendis: Valf Ayarı & Sinyal Frekansı</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#ffb703]">⚡</span>
                    <span>Plazma Fırtınası Savunması</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onStartGame('kayip_sinyal')}
                className="mt-3 sm:mt-4 w-full min-h-[44px] py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#ffb703] border border-amber-400/40 text-xs font-sora font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Bu Operasyonla Başla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          </div>
        )}

        {/* KART 3: 5 Taktik Prosedürel Görev */}
        {activeCardTab === 'tasks' && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Görev 1 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141128] border border-rose-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">🔴</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded">
                      GÖREV 1
                    </span>
                  </div>
                  <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                    Arıza Teşhisi & Reaktör
                  </h4>
                  <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                    Mühendis 4 devrenin sıcaklık, basınç ve gürültü telemetrisini okur. Kaptan arızalı hattı tespit edip doğru kesici kilidini (K1-K4) açar. Mühendis valfi çevirip tahliyeyi tamamlar.
                  </p>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                  Kritik Eşik: Isı ≥80°C · Basınç ≤40kPa
                </div>
              </div>

              {/* Görev 2 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141128] border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">📡</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded">
                      GÖREV 2
                    </span>
                  </div>
                  <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                    Sinyal / Sonar Frekans Kilidi
                  </h4>
                  <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                    Kaptana 4 yabancı glif sembolü gelir. Glif-rakam eşleme tablosu ve kural tipi (ters okuma, çift değiştirme, kaydırma) uygulanarak 4 haneli kod üretilir. Mühendis frekansı kilitler.
                  </p>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                  Kriptografik Glif Dönüşümü
                </div>
              </div>

              {/* Görev 3 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141128] border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">🔌</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded">
                      GÖREV 3
                    </span>
                  </div>
                  <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                    Veri Kablosu Bağlantısı
                  </h4>
                  <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                    Kırmızı, sarı, cyan ve neon veri hatları hasarlıdır. Kaptanın şemasına göre her kablonun frekans değeri doğru bağlantı terminaliyle eşleştirilmeli ve hat test edilmelidir.
                  </p>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                  4 Hat Onarımı & Frekans Testi
                </div>
              </div>

              {/* Görev 4 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141128] border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">🚪</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded">
                      GÖREV 4
                    </span>
                  </div>
                  <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                    Hava Kilidi & Kabin Basıncı
                  </h4>
                  <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                    Dış ortam basıncı ile iç bölme arasındaki vakum dengesi bozulur. Kaptanın güvenlik tablosundaki eşik aralığına göre mühendis vakum kompresör gücünü ve kadranı ayarlar.
                  </p>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                  Sızdırmazlık Mührü & Vakum
                </div>
              </div>

              {/* Görev 5 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141128] border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">🧭</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded">
                      GÖREV 5
                    </span>
                  </div>
                  <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                    Radar / Sonar Kalibrasyonu
                  </h4>
                  <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                    Kurtarma işaretçisi ile bağlantı kurmak için azimut (yatay açı) ve yükseliş (dikey açı) değerlerinin taranması ve hedef koordinata hassas kilitlenmesi gerekir.
                  </p>
                </div>
                <div className="text-[10px] sm:text-[11px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                  Azimut & Yükseliş Hizalaması
                </div>
              </div>

              {/* Otomatik Rastgelelik Notu */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-400/30 flex flex-col justify-center text-center">
                <span className="text-xl sm:text-2xl mb-1">🎲</span>
                <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                  Tam Otomatik Rastgele Görevler
                </h4>
                <p className="text-xs text-[#c7beaf] leading-tight">
                  Her yeni turda bu 5 taktik görev arasından sistem 2 görevi rastgele seçer. Her oyun bambaşka bir bulmaca kombinasyonu sunar!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KART 4: Güç Matrisi & Taktik Yönetim */}
        {activeCardTab === 'power' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#141128] border border-amber-500/30 shadow-xl flex flex-col gap-3 sm:gap-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-[#ffb703] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sora text-sm sm:text-base font-bold text-white leading-tight">
                    Sınırlı Güç Matrisi Yönetimi (7 MW / 15 MW)
                  </h3>
                  <span className="text-[11px] text-[#9e8f78]">
                    Tüm sistemleri aynı anda beslemek imkânsızdır; anlık önceliklendirme şart!
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-[#ffb703] border border-amber-500/40 font-mono text-[10px] sm:text-xs font-bold">
                DİNAMİK GÜÇ
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#d5c4ac] leading-relaxed">
              Gelişmiş Taktik Modunda reaktör pompaları, sinyal anten yükselticisi ve hava kilidi kompresörü aynı anda çalışır. Mühendis güç kaydırıcılarını kullanarak enerjiyi o an odaklanılan göreve aktarmalıdır.
            </p>

            {/* 2x2 Grid on Mobile, 4-col on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-1 font-mono text-xs">
              <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-rose-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-rose-400 font-bold block text-[11px] sm:text-xs mb-0.5">🔴 Reaktör</span>
                  <span className="text-[#9e8f78] text-[10px] block mb-1">İdeal: 4 MW</span>
                  <span className="text-white text-[10px] sm:text-[11px] leading-tight">Güç yetersiz kalırsa çekirdek ısınır.</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-cyan-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-cyan-400 font-bold block text-[11px] sm:text-xs mb-0.5">📡 Anten</span>
                  <span className="text-[#9e8f78] text-[10px] block mb-1">İdeal: 3 MW</span>
                  <span className="text-white text-[10px] sm:text-[11px] leading-tight">Güç düşükken parazit yükselir.</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-emerald-400 font-bold block text-[11px] sm:text-xs mb-0.5">🚪 Hava Kilidi</span>
                  <span className="text-[#9e8f78] text-[10px] block mb-1">İdeal: 3 MW</span>
                  <span className="text-white text-[10px] sm:text-[11px] leading-tight">Yetersizse vakum düşer.</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-purple-400 font-bold block text-[11px] sm:text-xs mb-0.5">🛡️ Kalkan</span>
                  <span className="text-[#9e8f78] text-[10px] block mb-1">Rezerv Güç</span>
                  <span className="text-white text-[10px] sm:text-[11px] leading-tight">Plazma fırtınasında gövdeyi korur.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KART 5: Tahliye Rotaları & Puanlama */}
        {activeCardTab === 'routes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 animate-fadeIn">
            {/* Rota Alfa */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-emerald-500/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] sm:text-[10px] font-bold">
                    ROTA ALFA
                  </span>
                  <span className="text-xs font-mono font-bold text-white">10 KİŞİ</span>
                </div>
                <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                  Tahliye Filosu (Tam Kurtarma)
                </h4>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                  Tüm mürettebatı tek seferde kurtarır. Ancak 75 saniye seyahat süresi ve yüksek güç (Net: 3/5/4 MW) gerektirir. Süre yetersizse mekiğe ulaşılamaz!
                </p>
                <div className="text-[11px] font-mono text-emerald-300 space-y-0.5">
                  <div>• Seyahat Süresi: <strong>75 Saniye</strong></div>
                  <div>• Güç: Yaşam: 4 MW · İtki: 6 MW · Kalkan: 5 MW</div>
                </div>
              </div>
              <span className="mt-3 text-[10px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                Başarı Durumu: <strong>TAM BAŞARI (+1000 Puan)</strong>
              </span>
            </div>

            {/* Rota Beta */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-amber-500/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-[#ffb703] font-mono text-[9px] sm:text-[10px] font-bold">
                    ROTA BETA
                  </span>
                  <span className="text-xs font-mono font-bold text-white">8 KİŞİ</span>
                </div>
                <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                  Lagrange Koridoru (Dengeli)
                </h4>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                  Orta vadeli dengeli kurtarma. 50 saniye intikal süresi ve dengeli güç (Net: 3/3/3 MW). Süre kısıtlı olduğunda en güvenilir tahliye seçeneğidir.
                </p>
                <div className="text-[11px] font-mono text-amber-300 space-y-0.5">
                  <div>• Seyahat Süresi: <strong>50 Saniye</strong></div>
                  <div>• Güç: Yaşam: 4 MW · İtki: 4 MW · Kalkan: 4 MW</div>
                </div>
              </div>
              <span className="mt-3 text-[10px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                Başarı Durumu: <strong>KISMİ KURTARMA (+600 Puan)</strong>
              </span>
            </div>

            {/* Rota Gama */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141128] border border-rose-500/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[9px] sm:text-[10px] font-bold">
                    ROTA GAMA
                  </span>
                  <span className="text-xs font-mono font-bold text-white">6 KİŞİ</span>
                </div>
                <h4 className="font-sora text-xs sm:text-sm font-bold text-white mb-1">
                  Acil Kaçış Podu (Hızlı Çıkış)
                </h4>
                <p className="text-xs text-[#c7beaf] leading-relaxed mb-2.5">
                  Süre 60 saniyenin altına düştüğünde tek çare. Yalnızca 30 saniye seyahat süresi ve minimum güç (Net: 3/2/2 MW) ister. 6 kişiyi sağ çıkarır.
                </p>
                <div className="text-[11px] font-mono text-rose-300 space-y-0.5">
                  <div>• Seyahat Süresi: <strong>30 Saniye</strong></div>
                  <div>• Güç: Yaşam: 4 MW · İtki: 3 MW · Kalkan: 3 MW</div>
                </div>
              </div>
              <span className="mt-3 text-[10px] font-mono text-[#9e8f78] pt-2 border-t border-white/5">
                Başarı Durumu: <strong>KISMİ KURTARMA (+400 Puan)</strong>
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Alt Bilgi & Hızlı Yardımcılar */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#100d24] border border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#00eefc]">Herkes kendi telefonundan oynar</span>
          <span className="text-white/20">·</span>
          <span className="text-[#9e8f78]">{isTeamOp ? 'Görev süresi 8 dakika (5 aşama)' : 'Görev süresi 5 dakika'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PWAInstallButton />


          <button
            onClick={onOpenRules}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#00eefc]" />
            <span>Kural Şeması</span>
          </button>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Thumb Zone - Ergonomic Launch Buttons) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0d0a21]/95 backdrop-blur-xl border-t border-white/15 flex items-center gap-2 sm:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => onStartGame(selectedThemePreview)}
          className="flex-1 min-h-[48px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ffb703] via-[#ffba27] to-[#ffb703] text-[#271900] font-sora font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(255,183,3,0.35)] active:scale-[0.98] transition-transform cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>
            {isTeamOp ? `${teamMeta.shortTitle} (3-4P)` :
             isKarantina ? 'KARANTİNA' :
             isDerin ? 'DERİN BASINÇ' :
             isGolge ? 'GÖLGE' :
             'KAYIP SİNYAL'}
          </span>
        </button>

      </div>

    </div>
  );
};
