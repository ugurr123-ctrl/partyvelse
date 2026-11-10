import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  VolumeX, 
  Send, 
  Wifi, 
  ShieldCheck, 
  Activity, 
  Sparkles,
  PhoneCall,
  Terminal,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, OperationTheme } from '../types/game';
import { syncService, RadioTransmission } from '../services/multiplayerSync';
import { soundManager } from '../services/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  myRole: Role;
  operationTheme?: OperationTheme;
  playerName?: string;
}

export const FREQUENCIES = [
  { id: '142.85', label: '142.85 MHz', desc: 'Ana Müfreze Telsiz Hattı', code: 'CH-01' },
  { id: '108.40', label: '108.40 MHz', desc: 'Mühendislik & Reaktör', code: 'CH-02' },
  { id: '415.00', label: '415.00 MHz', desc: 'Biyo-Spektrum & UV', code: 'CH-03' },
  { id: '084.20', label: '084.20 MHz', desc: 'Gölge Şifreli Sızma', code: 'CH-04' },
];

export const TacticalRadioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  myRole,
  operationTheme = 'kayip_sinyal',
  playerName,
}) => {
  const [activeFreq, setActiveFreq] = useState('142.85');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [transmissions, setTransmissions] = useState<RadioTransmission[]>(() => [
    {
      id: 'init-1',
      senderRole: 'muhendis',
      senderName: operationTheme === 'karantina_2088' ? 'Güvenlik Şefi Baran' : 'Mühendis Mert',
      message: 'Telsiz frekansı bağlandı. Ses net alınıyor, tamam!',
      frequency: '142.85 MHz',
      timestamp: Date.now() - 35000,
    },
    {
      id: 'init-2',
      senderRole: 'kaptan',
      senderName: operationTheme === 'karantina_2088' ? 'Baş Biyolog Selin' : 'Kaptan Ece',
      message: 'Anlaşıldı. Operasyon parametrelerini takip ediyorum.',
      frequency: '142.85 MHz',
      timestamp: Date.now() - 15000,
    },
  ]);

  const pttTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to live radio transmissions from peer tabs/devices
  useEffect(() => {
    const unsub = syncService.subscribeRadio((transmission) => {
      setTransmissions((prev) => [transmission, ...prev.slice(0, 19)]);
    });
    return () => unsub();
  }, []);

  const getRoleDisplayName = (role: Role) => {
    if (playerName) return playerName;
    if (operationTheme === 'karantina_2088') {
      return role === 'kaptan' ? 'Baş Biyolog Selin' : 'Güvenlik Şefi Baran';
    }
    if (operationTheme === 'golge_protokolu') {
      return role === 'kaptan' ? 'Saha Ajanı' : 'Gölge Hacker';
    }
    if (operationTheme === 'derin_basinc') {
      return role === 'kaptan' ? 'Dümenci' : 'Makinist';
    }
    return role === 'kaptan' ? 'Kaptan Ece' : 'Mühendis Mert';
  };

  const getQuickMessages = () => {
    if (operationTheme === 'karantina_2088') {
      if (myRole === 'kaptan') {
        return [
          'Kritik mutasyon Sitözin-9 bağında! UV Sektör 3 ve Vana-B derhal kilitlenmeli!',
          'Santrifüjü tam 3800 RPM seviyesine getir ve soğutma valfini %75 aç!',
          'Toksik gaz BACA-02 hattında yoğunlaştı. Tahliye vanasını 12 Bar basınca ayarla!',
          'Panzehir formülü reaktöre enjekte edildi, stabiliteyi koru!',
        ];
      } else {
        return [
          'Anlaşıldı Biyolog! UV Sektör 3 mühürlendi ve Vana-B kilitlendi!',
          'Santrifüj 3800 RPM devrinde sabitlendi, soğutma %75 açık!',
          'BACA-02 tahliye sürgüsü 12 Bar basınca kilitlendi, gaz çekiliyor!',
          'Laboratuvar kilitleri devrede, biyo-tehdit seviyesi düşüyor!',
        ];
      }
    }

    if (operationTheme === 'derin_basinc') {
      if (myRole === 'kaptan') {
        return [
          'Derinlik 800 metreye iniyor, balast tankını hemen tahliye et!',
          'Sonar parazitini filtrele, hedef frekansı 480 Hz glifine sabitle!',
          'Bütünlük %60 altına indi! Acil sızdırmazlık pompalarını çalıştır!',
          'Güzergah Alfa rotasına yönel, kaçış podlarını devreye al!',
        ];
      } else {
        return [
          'Anlaşıldı Dümenci! Balast valfi açıldı, basınç dengeleniyor!',
          'Sonar glifi kilitlendi, sinyal net olarak okunuyor!',
          'Hidrolik pompalar devrede, su girişi engellendi!',
          'Reaktör rezonansı dengelendi, yüzeye çıkış için tam güç hazır!',
        ];
      }
    }

    if (operationTheme === 'golge_protokolu') {
      if (myRole === 'kaptan') {
        return [
          'Kasa dairesine ulaştım! Güvenlik duvarını hemen bypass et!',
          'Lazer sensörleri koridoru kilitledi, frekansı körle!',
          'Biyometrik kapı açıldı, veri kasası şifresini ilet!',
          'Alarm devreye girdi! Güvenlik kameralarını döngüye al!',
        ];
      } else {
        return [
          'Güvenlik duvarı çöktü! Koridor lazerleri 30 saniye devre dışı!',
          'Kasa şifresi: 4092! Kodu gir ve veriyi hemen çek!',
          'Kameralar döngüde, güvenlik şefinin görüşü sıfırlandı!',
          'Gölge sunucuya sızdım, çıkış kapısının kilidini açtım!',
        ];
      }
    }

    // Default: Kayıp Sinyal (Uzay İstasyonu)
    if (myRole === 'kaptan') {
      return [
        'Mühendis, reaktör aşırı ısınıyor! K2 kesicisini derhal aç!',
        'Sinyal frekansı 142.8 MHz bandında, paraziti temizle ve kilitle!',
        'Gövde sızıntısı var! Hava kilidini manuele al ve mühürle!',
        'Enerji dağılımında Yaşam Desteğine en az 3 MW aktar!',
      ];
    } else {
      return [
        'Anlaşıldı Kaptan! Arızalı devre tahliye edildi, ısı düşüyor!',
        'Sinyal kilitlendi! Telemetri verisi canlı olarak aktarılıyor!',
        'Hava kilidi mühürlendi, kabin basıncı 101 kPa seviyesinde!',
        'Enerji matrisi hazırlandı, kaptan onayına sunuldu!',
      ];
    }
  };

  const sendRadioMessage = (msgText: string) => {
    if (!msgText.trim()) return;

    soundManager.playRadioSquelch();
    setTimeout(() => {
      soundManager.playRogerBeep();
    }, 180);

    const transmission: RadioTransmission = {
      id: `radio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderRole: myRole,
      senderName: getRoleDisplayName(myRole),
      message: msgText.trim(),
      frequency: `${activeFreq} MHz`,
      timestamp: Date.now(),
    };

    syncService.broadcastRadio(transmission);
    setCustomMsg('');
  };

  const handleStartPTT = () => {
    setIsTransmitting(true);
    soundManager.playRadioSquelch();

    // Auto-release PTT after 6 seconds safety limit if held
    if (pttTimeoutRef.current) clearTimeout(pttTimeoutRef.current);
    pttTimeoutRef.current = setTimeout(() => {
      handleStopPTT();
    }, 6000);
  };

  const handleStopPTT = () => {
    if (!isTransmitting) return;
    setIsTransmitting(false);
    if (pttTimeoutRef.current) clearTimeout(pttTimeoutRef.current);

    soundManager.playRogerBeep();

    // Send a generic PTT radio ping voice transmission
    const callouts = [
      'Ses denemesi, anlaşıldı tamam!',
      'Gözüm telemetride, beklemedeyim tamam!',
      'Konsol kontrolleri aktif, devam et!',
      'Telsiz bağlantısı mükemmel, dinlemedeyim!',
    ];
    const picked = callouts[Math.floor(Math.random() * callouts.length)];
    const transmission: RadioTransmission = {
      id: `radio-ptt-${Date.now()}`,
      senderRole: myRole,
      senderName: getRoleDisplayName(myRole),
      message: `[CANLI SESLİ YAYIN] ${picked}`,
      frequency: `${activeFreq} MHz`,
      timestamp: Date.now(),
    };
    syncService.broadcastRadio(transmission);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-3xl bg-[#100d23] border-2 border-[#ffb703]/50 shadow-[0_0_50px_rgba(255,183,3,0.3)] flex flex-col overflow-hidden text-white font-manrope max-h-[92vh]"
      >
        {/* Walkie-Talkie Tactical Top Bar */}
        <div className="bg-[#191535] px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#ffb703]/20 border border-[#ffb703]/60 flex items-center justify-center text-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.3)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-sora font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase">
                  TAKTIK TELSİZ KONSOLU
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/40">
                  CANLI
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#a59db8] flex items-center gap-1">
                <span>ŞİFRELEME: AES-256</span>
                <span>•</span>
                <span className="text-[#00eefc]">KANAL: {activeFreq} MHz</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tactical Display & Frequency Bar */}
        <div className="p-3 bg-[#0d0a1d] border-b border-white/10 flex flex-col gap-2">
          
          {/* Signal & LED HUD */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-black/60 border border-white/5">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 font-bold">RADYO FREKANSI AKTİF</span>
            </div>
            
            {/* Signal Strength Meter Bars */}
            <div className="flex items-center gap-1" title="Sinyal Gücü: %99">
              <span className="h-1.5 w-1 rounded-sm bg-emerald-400"></span>
              <span className="h-2.5 w-1 rounded-sm bg-emerald-400"></span>
              <span className="h-3.5 w-1 rounded-sm bg-emerald-400"></span>
              <span className="h-4.5 w-1 rounded-sm bg-emerald-400"></span>
              <span className="h-5.5 w-1 rounded-sm bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[10px] text-white/60 ml-1">5G SİY</span>
            </div>
          </div>

          {/* Quick Frequency Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFreq(f.id);
                  soundManager.playClick();
                }}
                className={`px-2 py-1.5 rounded-xl border text-left font-mono text-[10px] transition-all cursor-pointer ${
                  activeFreq === f.id
                    ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703] font-bold shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{f.code}</span>
                  <span className="text-[9px] opacity-80">{f.label}</span>
                </div>
                <div className="text-[9px] truncate text-white/50">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Body: Transmissions Feed & Actions */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col gap-3 max-h-[46vh]">
          
          {/* Quick Messages Accordion */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-[#ffb703] font-bold uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>HIZLI TELSİZ KALIPLARI ({myRole === 'kaptan' ? 'KAPTAN / BİYOLOG' : 'MÜHENDİS / GÜVENLİK'})</span>
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              {getQuickMessages().map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => sendRadioMessage(msg)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ffb703]/50 text-left text-xs text-[#e6dff9] hover:text-white font-medium transition-all flex items-center justify-between group active:scale-98 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#ffb703] font-mono text-[10px] font-bold">#{idx + 1}</span>
                    <span className="leading-snug">{msg}</span>
                  </span>
                  <Send className="w-3.5 h-3.5 text-[#ffb703] opacity-50 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Sender Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendRadioMessage(customMsg);
            }}
            className="flex items-center gap-2 mt-1"
          >
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Telsizden sesli/metin mesajı ilet..."
              maxLength={120}
              className="flex-1 bg-black/60 border border-white/15 focus:border-[#ffb703] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 font-manrope outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!customMsg.trim()}
              className="px-4 py-2 rounded-xl bg-[#ffb703] hover:bg-[#ffc107] disabled:opacity-40 text-black font-sora font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>İlet</span>
            </button>
          </form>

          {/* Recent Transmissions Log */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="font-mono text-[10px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>SON TELSİZ YAYINLARI</span>
            </span>

            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {transmissions.map((t) => {
                const isMe = t.senderRole === myRole;
                return (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 text-xs ${
                      isMe
                        ? 'bg-[#ffb703]/10 border-[#ffb703]/30 text-white ml-4'
                        : 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-white mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`font-bold flex items-center gap-1 ${isMe ? 'text-[#ffb703]' : 'text-[#00f0ff]'}`}>
                        <Radio className="w-3 h-3" />
                        <span>{t.senderName}</span>
                      </span>
                      <span className="text-white/40">{t.frequency}</span>
                    </div>
                    <p className="font-manrope leading-snug">{t.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Walkie-Talkie Tactical Bottom: PTT (Bas-Konuş) Heavy Button */}
        <div className="bg-[#191535] p-4 border-t border-white/10 flex flex-col items-center justify-center gap-2">
          
          <button
            onMouseDown={handleStartPTT}
            onMouseUp={handleStopPTT}
            onTouchStart={handleStartPTT}
            onTouchEnd={handleStopPTT}
            className={`w-full py-4 rounded-2xl font-sora font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all select-none shadow-xl cursor-pointer ${
              isTransmitting
                ? 'bg-rose-500 text-white shadow-[0_0_35px_rgba(244,63,94,0.6)] scale-[0.98]'
                : 'bg-gradient-to-r from-[#ffb703] to-[#ff9800] hover:from-[#ffc107] hover:to-[#ffa726] text-black shadow-[0_0_20px_rgba(255,183,3,0.3)] active:scale-95'
            }`}
          >
            {isTransmitting ? (
              <>
                <Mic className="w-6 h-6 animate-pulse text-white" />
                <span className="tracking-widest">YAYINDA... (BASILI TUTUN)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-black" />
                <span>BAS-KONUŞ (PTT) TELSİZ YAYINI</span>
              </>
            )}
          </button>

          <span className="text-[10px] font-mono text-white/40 text-center">
            {isTransmitting 
              ? '🎙️ SES FREKANSI AKTARILIYOR // BIRAKILDIĞINDA ROGER BEEP İLETİLİR'
              : 'Basılı tutarak konuşun veya üstteki taktik kalıplardan doğrudan mesaj iletin.'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
