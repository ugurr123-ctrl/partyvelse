import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Code, 
  Copy, 
  Check, 
  Download, 
  X, 
  Eye, 
  ArrowRight, 
  Sliders, 
  AlertTriangle, 
  Clock, 
  WifiOff, 
  FileCode,
  Smartphone,
  ExternalLink,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { MissionState, Role } from '../types/game';

export interface ScreenMeta {
  id: number;
  name: string;
  role: 'kaptan' | 'muhendis' | 'ortak';
  category: string;
  desc: string;
  referencePath: string;
  htmlPath: string;
  statusKey: MissionState['status'];
  miniGameKey?: string;
  phaseIndex?: number;
}

export const ALL_17_SCREENS: ScreenMeta[] = [
  {
    id: 1,
    name: '1. Giriş (Oda Oluştur / Katıl)',
    role: 'ortak',
    category: 'Giriş & Eşleşme',
    desc: 'Oyuncu adı, oda oluşturma, 6 haneli oda koduyla katılma ve uzay istasyonu ana görseli.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_oda_olu_tur_ve_kat_l',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_oda_olu_tur_ve_kat_l/code.html',
    statusKey: 'entry',
  },
  {
    id: 2,
    name: '2. Parti Lobisi (Oda Bekleme)',
    role: 'ortak',
    category: 'Lobi & Hazırlık',
    desc: 'Oda kodu kopyalama, iki oyuncu kartı, hazır durumları, 4 görev ortamı seçimi ve görev havuzu.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_parti_lobisi_oda_bekleme',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_parti_lobisi_oda_bekleme/code.html',
    statusKey: 'lobby',
  },
  {
    id: 3,
    name: '3. Kaptan Rol Tanıtımı',
    role: 'kaptan',
    category: 'Rol Brifingi',
    desc: 'Kaptan portresi, gizli prosedür ve karar sorumluluğu, görev sırası ve "Rolümü anladım" onayı.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_gizli_rol_kaptan',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_gizli_rol_kaptan/code.html',
    statusKey: 'role_intro',
  },
  {
    id: 4,
    name: '4. Mühendis Rol Tanıtımı',
    role: 'muhendis',
    category: 'Rol Brifingi',
    desc: 'Mühendis portresi, konsolları ve canlı ölçümleri yönetme sorumluluğu, görev sırası ve hazır onayı.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_gizli_rol_m_hendis',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_gizli_rol_m_hendis/code.html',
    statusKey: 'role_intro',
  },
  {
    id: 5,
    name: '5. Arıza Teşhisi — Kaptan',
    role: 'kaptan',
    category: '1. Aşama Onarım',
    desc: '3 gizli arıza koşulu (Isı, Basınç, Parazit), devre bağlantı şeması, K1–K4 mekanik kesiciler ve müdahale.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kaptan_reakt_r_konsolu',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kaptan_reakt_r_konsolu/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'ariza_teshisi',
    phaseIndex: 0,
  },
  {
    id: 6,
    name: '6. Arıza Teşhisi — Mühendis',
    role: 'muhendis',
    category: '1. Aşama Onarım',
    desc: '4 hattın sıcaklık, basınç ve parazit canlı ölçümleri, arızalı hat tespiti ve "Teşhisi ilet".',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_m_hendis_reakt_r_konsolu',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_m_hendis_reakt_r_konsolu/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'ariza_teshisi',
    phaseIndex: 0,
  },
  {
    id: 7,
    name: '7. Sinyal Çözümü — Kaptan',
    role: 'kaptan',
    category: '2. Aşama Onarım',
    desc: '4 sembollü mesaj, sembol–sayı tablosu, turun permutasyon kuralı ve gizli şifre kılavuzu.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kaptan_ifre_paneli',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kaptan_ifre_paneli/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'sinyal_cozumu',
    phaseIndex: 1,
  },
  {
    id: 8,
    name: '8. Sinyal Çözümü — Mühendis',
    role: 'muhendis',
    category: '2. Aşama Onarım',
    desc: 'Spektrum dalgası, döner frekans kadranı, 4 frekans kanalı ve kodları, "Frekansı kilitle" aksiyonu.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_m_hendis_sinyal_konsolu',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_m_hendis_sinyal_konsolu/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'sinyal_cozumu',
    phaseIndex: 1,
  },
  {
    id: 9,
    name: '9. Kablo Bağlantısı — Kaptan',
    role: 'kaptan',
    category: 'Onarım Modülü',
    desc: 'Güneş, Ay ve Yıldız kablolarının darbe frekansları ve teknik bağlantı kılavuzu.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kablo_ba_lant_s_kaptan',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kablo_ba_lant_s_kaptan/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'kablo_baglantisi',
    phaseIndex: 0,
  },
  {
    id: 10,
    name: '10. Kablo Bağlantısı — Mühendis',
    role: 'muhendis',
    category: 'Onarım Modülü',
    desc: 'P1–P4 port terminalleri, gerilim/akım telemetri bandı, renkli jumper kablo yuvaları ve kilitleme.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kablo_ba_lant_s_m_hendis',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_kablo_ba_lant_s_m_hendis/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'kablo_baglantisi',
    phaseIndex: 0,
  },
  {
    id: 11,
    name: '11. Hava Kilidi — Kaptan',
    role: 'kaptan',
    category: 'Onarım Modülü',
    desc: 'İç kapak, ara hazne, dış kapak izometrik şeması ve 4 adımlı basınç tahliye protokol talimatları.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_hava_kilidi_kaptan',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_hava_kilidi_kaptan/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'hava_kilidi',
    phaseIndex: 1,
  },
  {
    id: 12,
    name: '12. Hava Kilidi — Mühendis',
    role: 'muhendis',
    category: 'Onarım Modülü',
    desc: 'Barometre oda basıncı göstergesi, döner birincil valf kadranı, sızdırmazlık mandalı ve vakum kaydırıcısı.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_hava_kilidi_m_hendis',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_hava_kilidi_m_hendis/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'hava_kilidi',
    phaseIndex: 1,
  },
  {
    id: 13,
    name: '13. Radar Yönlendirme — Kaptan',
    role: 'kaptan',
    category: 'Onarım Modülü',
    desc: 'Orbital radar matrisi, polar radyal ızgara, hedef şamandıra kerterizi (275° azimut, +42° elevasyon) ve Ku-band taşıyıcı.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_radar_y_nlendirme_kaptan',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_radar_y_nlendirme_kaptan/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'radar_yonlendirme',
    phaseIndex: 0,
  },
  {
    id: 14,
    name: '14. Radar Yönlendirme — Mühendis',
    role: 'muhendis',
    category: 'Onarım Modülü',
    desc: '360° döner azimut çanağı kadranı, dikey elevasyon kaydırıcısı, taşıyıcı dalga formu görselleştiricisi ve kilit.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_radar_y_nlendirme_m_hendis',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_radar_y_nlendirme_m_hendis/code.html',
    statusKey: 'phase_game',
    miniGameKey: 'radar_yonlendirme',
    phaseIndex: 0,
  },
  {
    id: 15,
    name: '15. Enerji Dağıtımı — Kaptan',
    role: 'kaptan',
    category: '3. Aşama Güç',
    desc: 'Asgari güç şartları gizli kılavuzu (Yaşam ≥3, İtki ≥3, Kalkan ≥4 MW), paylaşılan dağılım kontrolü ve kilit.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_ortak_kurtarma_paneli',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_ortak_kurtarma_paneli/code.html',
    statusKey: 'phase_energy',
    phaseIndex: 2,
  },
  {
    id: 16,
    name: '16. Enerji Dağıtımı — Mühendis',
    role: 'muhendis',
    category: '3. Aşama Güç',
    desc: '12 MW toplam reaktör bütçesi, Yaşam / İtki / Kalkan kademeli artış tuşları, hat kayıpları ve taslak paylaşımı.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_ortak_kurtarma_paneli',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_ortak_kurtarma_paneli/code.html',
    statusKey: 'phase_energy',
    phaseIndex: 2,
  },
  {
    id: 17,
    name: '17. Ortak Kurtarma Kararı (17A)',
    role: 'ortak',
    category: '4. Aşama Kurtarma',
    desc: 'Derin uzay yörünge haritası, 3 kurtarma rotası (Sığınak 6, Hızlı Geçiş 8, Konvoy 10), çift onay kuralı ve kalkış.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_ortak_kurtarma_paneli',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_ortak_kurtarma_paneli/code.html',
    statusKey: 'phase_rescue',
    phaseIndex: 3,
  },
  {
    id: 18,
    name: '18. Görev Sonucu & Zafer (17B)',
    role: 'ortak',
    category: 'Sonuç & İstatistik',
    desc: 'Birlikte Kurtuldunuz zafer ekranı, 10/10 kurtarılan mürettebat plaketi, Ece & Mert kartları ve interaktif stardust parçacıkları.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_g_rev_sonucu_ve_zafer',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_g_rev_sonucu_ve_zafer/code.html',
    statusKey: 'phase_result',
  },
  {
    id: 19,
    name: '19. Görev Başarısız & Süre Tükendi (17C)',
    role: 'ortak',
    category: 'Sonuç & İstatistik',
    desc: 'Sinyal koptu ve süre tükendi hata ekranı, 0/10 kayıp mürettebat, çevrimdışı Ece & Mert kartları, kritik olay raporu ve arcade tekrar dene.',
    referencePath: '/public/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_g_rev_basarisiz',
    htmlPath: '/assets/extracted_stitch/stitch_partyverse_mobile_game_experience/kay_p_sinyal_g_rev_basarisiz/code.html',
    statusKey: 'phase_result',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScreen: (screenMeta: ScreenMeta, role: Role) => void;
}

export const ScreenExplorerModal: React.FC<Props> = ({ isOpen, onClose, onNavigateToScreen }) => {
  const [selectedScreenId, setSelectedScreenId] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'info' | 'code' | 'preview'>('code');
  const [mockState, setMockState] = useState<'normal' | 'incomplete' | 'waiting' | 'error' | 'disconnected'>('normal');
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeCache, setCodeCache] = useState<Record<number, string>>({});
  const [loadingCode, setLoadingCode] = useState<boolean>(false);

  const currentScreen = ALL_17_SCREENS.find((s) => s.id === selectedScreenId) || ALL_17_SCREENS[0];

  // Fetch genuine code.html from the extracted stitch assets whenever screen changes
  useEffect(() => {
    if (!isOpen) return;

    if (codeCache[currentScreen.id]) {
      return;
    }

    let isMounted = true;
    setLoadingCode(true);

    fetch(currentScreen.htmlPath)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.text();
      })
      .then((htmlText) => {
        if (isMounted) {
          setCodeCache((prev) => ({ ...prev, [currentScreen.id]: htmlText }));
          setLoadingCode(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch screen HTML directly:', err);
        if (isMounted) {
          setLoadingCode(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentScreen.id, currentScreen.htmlPath, isOpen, codeCache]);

  if (!isOpen) return null;

  const activeHtmlCode = codeCache[currentScreen.id] || `<!-- PARTYVERSE — ${currentScreen.name} -->\n<!-- Kaynak dosya: ${currentScreen.htmlPath} -->\n<!-- Yükleniyor... -->`;

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(activeHtmlCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partyverse_screen_${currentScreen.id}_${currentScreen.role}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenLive = () => {
    const roleToUse: Role = currentScreen.role === 'muhendis' ? 'muhendis' : 'kaptan';
    onNavigateToScreen(currentScreen, roleToUse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#141123] border border-[#ffb703]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#e6dff9]">
        
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#1a163b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 border border-[#ffb703]/40 flex items-center justify-center text-[#ffb703] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase px-2 py-0.5 rounded bg-[#00f0ff]/10">
                  17+ EKRAN KATALOĞU & KOD GEZGİNİ
                </span>
                <span className="text-xs text-[#a59db8] hidden sm:inline">Kaptan & Mühendis Birebir Konsolları</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sora">
                PARTYVERSE — Kayıp Sinyal Tüm Ekranlar & Gerçek HTML Kodu
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Column Split: Screen Selector List (Left) & Inspector / Code (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: 18 Screens Scrollable Sidebar */}
          <div className="w-full md:w-80 border-r border-white/10 overflow-y-auto p-3 space-y-1.5 bg-[#0f0c1e]/60 shrink-0">
            <span className="text-[10px] font-mono text-[#9e8f78] uppercase px-2 block mb-1">
              EKRAN SEÇİN ({ALL_17_SCREENS.length} EKRAN):
            </span>

            {ALL_17_SCREENS.map((screen) => {
              const isSelected = selectedScreenId === screen.id;
              const roleBadgeColor = 
                screen.role === 'kaptan' ? 'text-[#ffb703] border-amber-500/30 bg-amber-500/10' :
                screen.role === 'muhendis' ? 'text-[#00f0ff] border-cyan-500/30 bg-cyan-500/10' :
                'text-purple-300 border-purple-500/30 bg-purple-500/10';

              return (
                <button
                  key={screen.id}
                  onClick={() => setSelectedScreenId(screen.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#201d30] border-[#ffb703] shadow-[0_0_12px_rgba(255,183,3,0.2)]'
                      : 'bg-[#141123] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-sora text-white truncate">
                      {screen.name}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${roleBadgeColor}`}>
                      {screen.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9e8f78] truncate">
                    {screen.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Screen Inspector, Tabs & Live Launcher */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#141123]">
            
            {/* Inspector Sub-Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#1c192c]/50">
              <div>
                <span className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-wider block">
                  {currentScreen.category} • {currentScreen.role.toUpperCase()}
                </span>
                <h3 className="text-sm sm:text-base font-bold font-sora text-white">
                  {currentScreen.name}
                </h3>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-1 bg-[#0f0c1e] p-1 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'code' ? 'bg-[#ffb703] text-black font-bold' : 'text-[#a59db8] hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Gerçek HTML Kodu</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'preview' ? 'bg-[#ffb703] text-black font-bold' : 'text-[#a59db8] hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Orijinal HTML Önizleme</span>
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'info' ? 'bg-[#ffb703] text-black font-bold' : 'text-[#a59db8] hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Kural & Detay</span>
                </button>
              </div>
            </div>

            {/* Sub-toolbar: Mock States (Normal, Eksik, Bekleniyor, Hata, Koptu) */}
            <div className="px-4 py-2 bg-[#0b081a] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 font-mono text-[11px]">
                <span className="text-[#9e8f78] text-[10px] mr-1">DURUM:</span>
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'incomplete', label: 'Eksik Seçim' },
                  { id: 'waiting', label: 'Arkadaş Bekleniyor' },
                  { id: 'error', label: 'Hatalı Müdahale' },
                  { id: 'disconnected', label: 'Bağlantı Koptu' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setMockState(st.id as any)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      mockState === st.id 
                        ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/40' 
                        : 'text-[#9e8f78] hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Launch live in active console */}
              <button
                onClick={handleOpenLive}
                className="px-3 py-1 rounded-md bg-gradient-to-r from-[#ffb703] to-[#ff9e00] text-black font-bold text-xs font-sora flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer ml-auto"
              >
                <span>Canlı Konsolda Aç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab 1: Real HTML Source Code & Export */}
            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#00f0ff] font-bold">
                      {currentScreen.htmlPath}
                    </span>
                    {loadingCode && (
                      <span className="flex items-center gap-1 text-[11px] text-[#ffb703]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Yükleniyor...</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#ffb703]" />}
                      <span>{copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1 rounded bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.HTML İndir</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-3 rounded-xl bg-[#0b081a] border border-white/10 font-mono text-[11px] text-cyan-300 overflow-y-auto leading-relaxed select-all">
                  <pre className="whitespace-pre-wrap font-mono">{activeHtmlCode}</pre>
                </div>
              </div>
            )}

            {/* Tab 2: Live HTML Iframe Preview */}
            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[#0b081a]">
                <div className="flex items-center justify-between w-full max-w-sm mb-2 text-xs font-mono text-[#a59db8]">
                  <span className="text-[#00f0ff]">390 × 844 Mobil Görünüm</span>
                  <a 
                    href={currentScreen.htmlPath} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#ffb703] hover:underline"
                  >
                    <span>Yeni Sekmede Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                {/* Smartphone Bezel */}
                <div className="relative w-full max-w-[390px] h-[720px] rounded-[36px] border-4 border-[#363246] bg-[#141123] shadow-2xl overflow-hidden flex flex-col">
                  {/* Speaker Notch */}
                  <div className="h-5 w-full bg-[#0f0c1e] flex items-center justify-center shrink-0 z-20">
                    <div className="w-20 h-3 rounded-full bg-black/60"></div>
                  </div>
                  
                  {/* Iframe */}
                  <iframe 
                    src={currentScreen.htmlPath} 
                    title={currentScreen.name}
                    className="w-full flex-1 border-0 bg-[#141123]"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Detailed Info & Asymmetric Rules */}
            {activeTab === 'info' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Description */}
                <div className="p-4 rounded-xl bg-[#1c192c] border border-white/5 space-y-2">
                  <span className="text-xs font-bold font-sora text-white block">Ekran Amacı & Açıklaması</span>
                  <p className="text-[#d1c8e6] leading-relaxed">
                    {currentScreen.desc}
                  </p>
                </div>

                {/* State simulation card */}
                <div className="p-4 rounded-xl bg-[#0f0c1e] border border-white/5 space-y-2">
                  <span className="text-xs font-bold font-sora text-[#00f0ff] block">
                    Seçili Durum Simülasyonu: <strong className="text-white uppercase font-mono">{mockState}</strong>
                  </span>
                  <p className="text-[11px] text-[#a59db8]">
                    {mockState === 'normal' && 'Tüm kontroller aktif, telemetri akışı nominal ve oyuncu eylemi bekleniyor.'}
                    {mockState === 'incomplete' && 'Örnek uyarı: "Eksik Seçim! Lütfen devreyi/kabloyu/frekansı belirleyip onaylayın."'}
                    {mockState === 'waiting' && 'Örnek durum: "Arkadaşın Bekleniyor... Kaptanın kesiciyi açması bekleniyor."'}
                    {mockState === 'error' && 'Örnek ceza: "Hatalı Müdahale! Gövde Bütünlüğü -%15, Süre -20 sn kayıp!"'}
                    {mockState === 'disconnected' && 'Örnek kopma: "Sub-Röle Bağlantısı Koptu! Süre duraklatıldı, kontroller kilitlendi."'}
                  </p>
                </div>

                {/* Reference design link */}
                <div className="p-3 rounded-xl bg-[#1c192c] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#ffb703]" />
                    <span className="text-white font-mono text-[11px]">
                      Referans Ekran Tasarımı: <code className="text-[#a59db8]">{currentScreen.referencePath}/screen.png</code>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">2.5D Piksel Sadık</span>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
