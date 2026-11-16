import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Send,
  Terminal,
  MessageSquare,
  Play,
  Square,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Role, OperationTheme } from '../types/game';
import { syncService, RadioTransmission } from '../services/multiplayerSync';
import { LiveRadio } from '../services/liveRadio';
import { soundManager } from '../services/soundEffects';
import { isTeamOperationTheme, getTeamOperationMeta } from '../services/omegaGameEngine';

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

const MAX_PTT_SECONDS = 8;

export const TacticalRadioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  myRole,
  operationTheme = 'kayip_sinyal',
  playerName,
}) => {
  const [activeFreq, setActiveFreq] = useState('142.85');
  const [liveReady, setLiveReady] = useState(false);
  const [liveTransmitting, setLiveTransmitting] = useState(false);
  const liveRadioRef = useRef<LiveRadio | null>(null);
  const talkRadioRef = useRef<LiveRadio | null>(null);
  const pressAttemptRef = useRef(0);

  useEffect(() => {
    const radio = new LiveRadio(activeFreq, setLiveReady);
    liveRadioRef.current = radio;
    return () => {
      liveRadioRef.current = null;
      radio.dispose();
    };
  }, [activeFreq]);

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceLevels, setVoiceLevels] = useState<number[]>([15, 25, 20, 30, 22, 18, 28, 16]);
  const [micStatus, setMicStatus] = useState<'idle' | 'denied' | 'unsupported' | 'too_short' | 'too_large'>('idle');
  const [autoPlayIncoming, setAutoPlayIncoming] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState('');
  const [transmissions, setTransmissions] = useState<RadioTransmission[]>([]);
  const [lastSeenByFreq, setLastSeenByFreq] = useState<Record<string, number>>(() => ({
    '142.85': Date.now(),
  }));

  const pttTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const activeRecordingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeFreqRef = useRef(activeFreq);
  const myRoleRef = useRef(myRole);

  useEffect(() => {
    activeFreqRef.current = activeFreq;
  }, [activeFreq]);

  useEffect(() => {
    myRoleRef.current = myRole;
  }, [myRole]);

  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    setPlayingId(null);
  };

  const playVoiceTransmission = (t: RadioTransmission) => {
    if (!t.audioDataUrl) return;
    stopAudioPlayback();
    try {
      const audio = new Audio(t.audioDataUrl);
      currentAudioRef.current = audio;
      setPlayingId(t.id);
      soundManager.playRadioSquelch();
      audio.onended = () => {
        soundManager.playRogerBeep();
        setPlayingId(null);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingId(null);
        currentAudioRef.current = null;
      };
      audio.play().catch(() => {
        setPlayingId(null);
      });
    } catch {
      setPlayingId(null);
    }
  };

  // Subscribe to live radio transmissions from peer tabs/devices
  useEffect(() => {
    const unsub = syncService.subscribeRadio((transmission) => {
      setTransmissions((prev) => {
        if (prev.some((item) => item.id === transmission.id)) return prev;
        return [transmission, ...prev.slice(0, 19)];
      });

      const isFromPartner =
        !syncService.isLocallySentRadio(transmission.id) &&
        transmission.senderRole !== myRoleRef.current;

      if (
        autoPlayIncoming &&
        !soundManager.isMuted() &&
        isFromPartner &&
        transmission.audioDataUrl &&
        syncService.tryClaimRadioAudioPlayback(transmission.id)
      ) {
        playVoiceTransmission(transmission);
      }
    });
    return () => unsub();
  }, [autoPlayIncoming]);

  const cleanupRecordingResources = () => {
    pressAttemptRef.current += 1;
    talkRadioRef.current?.stop();
    talkRadioRef.current = null;
    setLiveTransmitting(false);
    if (pttTimeoutRef.current) {
      clearTimeout(pttTimeoutRef.current);
      pttTimeoutRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    activeRecordingRef.current = false;
    setIsTransmitting(false);
    setRecordSeconds(0);
    setVoiceLevels([15, 25, 20, 30, 22, 18, 28, 16]);
  };

  // Mark active channel messages as read when opened or switched
  useEffect(() => {
    if (isOpen) {
      setLastSeenByFreq((prev) => ({
        ...prev,
        [activeFreq]: Date.now(),
      }));
    }
  }, [isOpen, activeFreq, transmissions.length]);

  // Clean up mic if modal closes mid-transmission
  useEffect(() => {
    if (!isOpen) {
      if (activeRecordingRef.current) {
        cleanupRecordingResources();
      }
      stopAudioPlayback();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      stopAudioPlayback();
    };
  }, []);

  const getRoleDisplayName = (role: Role) => {
    if (playerName) return playerName;
    if (isTeamOperationTheme(operationTheme)) {
      if (role === 'kaptan') return 'Komutan Ece';
      if (role === 'kriptolog') return 'Kriptolog Deniz';
      if (role === 'guvenlik') return 'Güvenlik Baran';
      return 'Mühendis Mert';
    }
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
    if (isTeamOperationTheme(operationTheme)) {
      if (myRole === 'kaptan') {
        return [
          'Aşama 1: Mühendis, 5 sektörün (S1-S5) ısı, basınç, yük ve titreşim değerlerini oku!',
          'Aşama 2: Osilatör A/B ve Bant Anahtarını (K1-K3) bildiriyorum; parazit dB ile sapmayı verin!',
          'Aşama 3: 12 MW 4 baralı güç matrisini (İtki/Kalkan/Yaşam/Soğutma) ve HF bandını iletiyorum!',
          'Aşama 4-5: Kriz protokol kodunu ve acil PSI hedefini açtım; tahliye rotasını kilitleyin!',
        ];
      }
      if (myRole === 'kriptolog') {
        return [
          'Aşama 1: Dönüşüm kuralıyla 4 haneli PIN çözüldü! Açıyı/pompayı Mühendise, polarite/kanalı savunmaya iletiyorum.',
          'Aşama 2: Baz + Parazit + Sapma toplamı kilitlendi; darbe modunu ve filtre rölesini (F1-F3) bildiriyorum!',
          'Aşama 3: Ağırlıklı 12 MW sağlama kodu hesaplandı; güvenlik duvarı seviyesi ve ikincil A-D etiketini ilettim!',
          'Aşama 4-5: 3 şalter sırasını (R1-R3) Mühendise, ihlal tokenını ve bileşik fırlatma kodunu ekibe verdim!',
        ];
      }
      if (myRole === 'guvenlik') {
        return [
          'Aşama 1: Kalkan polaritesi ve X1-X3 alt kanalı mühürlendi!',
          'Aşama 2: Tespit edilen parazit hattı kaynağını ve F1-F3 filtre rölesini izole ettim!',
          'Aşama 3-4: Tehdit kadranı, 4 seviyeli güvenlik duvarı, A-D etiketi ve hasarlı bölme tokenı kilitlendi!',
          'Aşama 5: Mühendis, tıkanan H1-H4 kapağını söyle; M1-M3 mandalıyla son mührü basıyorum!',
        ];
      }
      return [
        'Aşama 1: 5 sektörün ısı, basınç, radyasyon/yük ve titreşim telemetrilerini sırayla okuyorum!',
        'Aşama 2: Osilatör A/B ayarlandı! Ölçülen parazit dB ve rezonans sapmasını Kriptologa iletiyorum!',
        'Aşama 3: 12 MW (4 bara) güç dağılımı kilitlendi; toplam 12 MW dengelendi!',
        'Aşama 4-5: Şalter zinciri R1-R3 + PSI tamam; tıkanan kapak (H1-H4) ve 2 haneli kapak PIN’ini aktarıyorum!',
      ];
    }

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

  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return '';
  };

  const handleStartPTT = async () => {
    if (activeRecordingRef.current || mediaRecorderRef.current) return;
    setMicStatus('idle');

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setMicStatus('unsupported');
      return;
    }

    const attempt = ++pressAttemptRef.current;
    activeRecordingRef.current = true;
    setIsTransmitting(true);
    setRecordSeconds(0);
    recordStartRef.current = Date.now();
    audioChunksRef.current = [];
    soundManager.playRadioSquelch();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // If user already released button while permission prompt was open
      if (!activeRecordingRef.current || pressAttemptRef.current !== attempt) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;
      recordStartRef.current = Date.now();
      const transmitFrequency = activeFreqRef.current;
      const track = stream.getAudioTracks()[0];
      const liveRadio = liveRadioRef.current;
      if (track && liveRadio?.start(track)) {
        talkRadioRef.current = liveRadio;
        setLiveTransmitting(true);
      }

      // Setup live microphone visualizer
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
          audioContextRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 32;
          src.connect(analyser);
          const dataArr = new Uint8Array(analyser.frequencyBinCount);

          const updateBars = () => {
            if (!activeRecordingRef.current) return;
            analyser.getByteFrequencyData(dataArr);
            const bars = Array.from({ length: 8 }, (_, idx) => {
              const val = dataArr[idx % dataArr.length] || 0;
              return Math.max(12, Math.min(100, Math.round((val / 255) * 100)));
            });
            setVoiceLevels(bars);
            animFrameRef.current = requestAnimationFrame(updateBars);
          };
          animFrameRef.current = requestAnimationFrame(updateBars);
        }
      } catch {
        // Fallback if WebAudio analyser unavailable
      }

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 24000 })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const durationMs = Date.now() - recordStartRef.current;
        const chunks = audioChunksRef.current;
        const chosenMime = recorder.mimeType || mimeType || 'audio/webm';
        const sentLive = talkRadioRef.current?.stop();
        cleanupRecordingResources();
        if (sentLive) return;

        if (durationMs < 350 || chunks.length === 0) {
          setMicStatus('too_short');
          setTimeout(() => setMicStatus('idle'), 2600);
          return;
        }

        const audioBlob = new Blob(chunks, { type: chosenMime });
        if (audioBlob.size < 256) {
          setMicStatus('too_short');
          setTimeout(() => setMicStatus('idle'), 2600);
          return;
        }
        if (audioBlob.size > 320000) {
          setMicStatus('too_large');
          setTimeout(() => setMicStatus('idle'), 3200);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : '';
          if (!dataUrl) return;
          const secsLabel = (durationMs / 1000).toFixed(1);
          const transmission: RadioTransmission = {
            id: `radio-voice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderRole: myRoleRef.current,
            senderName: getRoleDisplayName(myRoleRef.current),
            message: `🎙️ Canlı Sesli Telsiz Yayını (${secsLabel} sn)`,
            frequency: `${transmitFrequency} MHz`,
            timestamp: Date.now(),
            isVoice: true,
            audioDataUrl: dataUrl,
            audioDurationMs: durationMs,
          };
          syncService.broadcastRadio(transmission);
          soundManager.playRogerBeep();
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.start(200);

      recordIntervalRef.current = setInterval(() => {
        const elapsed = Math.min(MAX_PTT_SECONDS, Math.floor((Date.now() - recordStartRef.current) / 1000));
        setRecordSeconds(elapsed);
      }, 200);

      pttTimeoutRef.current = setTimeout(() => {
        handleStopPTT();
      }, MAX_PTT_SECONDS * 1000);
    } catch {
      if (pressAttemptRef.current !== attempt) return;
      cleanupRecordingResources();
      setMicStatus('denied');
    }
  };

  const handleStopPTT = () => {
    if (!activeRecordingRef.current) return;
    activeRecordingRef.current = false;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        cleanupRecordingResources();
      }
    } else {
      cleanupRecordingResources();
    }
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
        <div className="bg-[#191535] px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#ffb703]/20 border border-[#ffb703]/60 flex items-center justify-center text-[#ffb703] shadow-[0_0_15px_rgba(255,183,3,0.3)] shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-sora font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase truncate">
                  SESLİ TELSİZ KONSOLU
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/40 shrink-0">
                  {liveReady ? 'CANLI TELSİZ' : 'KAYITLI TELSİZ MODU'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#a59db8] flex items-center gap-1 truncate">
                <span className="text-[#00eefc]">KANAL: {activeFreq} MHz</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setAutoPlayIncoming((v) => !v)}
              title={autoPlayIncoming ? 'Gelen sesleri otomatik oynat: AÇIK' : 'Gelen sesleri otomatik oynat: KAPALI'}
              className={`px-2 py-1.5 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                autoPlayIncoming
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}
            >
              {autoPlayIncoming ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{autoPlayIncoming ? 'OTO-SES' : 'SESSİZ'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tactical Display & Frequency Bar */}
        <div className="p-3 bg-[#0d0a1d] border-b border-white/10 flex flex-col gap-2">
          {/* Signal & LED HUD */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-black/60 border border-white/5">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isTransmitting ? 'bg-rose-500' : 'bg-emerald-400'} animate-ping`}></span>
              <span className={`${isTransmitting ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>
                {isTransmitting ? `MİKROFON YAYINDA (${recordSeconds}/${MAX_PTT_SECONDS}s)` : 'SES & METİN HATTI AKTİF'}
              </span>
            </div>

            {/* Signal Strength / Live Voice Spectrum */}
            <div className="flex items-end gap-1 h-5" title="Canlı Ses & Sinyal Düzeyi">
              {voiceLevels.map((lvl, idx) => (
                <span
                  key={idx}
                  style={{ height: isTransmitting ? `${Math.max(20, lvl)}%` : `${[35, 50, 70, 85, 100, 70, 55, 40][idx]}%` }}
                  className={`w-1 rounded-sm transition-all duration-75 ${
                    isTransmitting ? 'bg-rose-400' : 'bg-emerald-400/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Frequency Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {FREQUENCIES.map((f) => {
              const seenAt = lastSeenByFreq[f.id] || 0;
              const unreadCount =
                activeFreq === f.id
                  ? 0
                  : transmissions.filter(
                      (t) => t.frequency === `${f.id} MHz` && t.timestamp > seenAt
                    ).length;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFreq(f.id);
                    setLastSeenByFreq((prev) => ({ ...prev, [f.id]: Date.now() }));
                    soundManager.playClick();
                  }}
                  className={`relative px-2 py-1.5 rounded-xl border text-left font-mono text-[10px] transition-all cursor-pointer ${
                    activeFreq === f.id
                      ? 'bg-[#ffb703]/20 border-[#ffb703] text-[#ffb703] font-bold shadow-[0_0_10px_rgba(255,183,3,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shadow">
                      {unreadCount}
                    </span>
                  )}
                  <div className="font-bold flex items-center justify-between">
                    <span>{f.code}</span>
                    <span className="text-[9px] opacity-80">{f.label}</span>
                  </div>
                  <div className="text-[9px] truncate text-white/50">{f.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Body: Transmissions Feed & Actions */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col gap-3 max-h-[46vh]">
          {/* Quick Messages Accordion */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-[#ffb703] font-bold uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>
                HIZLI TELSİZ KALIPLARI (
                {myRole === 'kriptolog'
                  ? 'KRİPTOLOG'
                  : myRole === 'guvenlik'
                  ? 'GÜVENLİK ŞEFİ'
                  : myRole === 'kaptan'
                  ? 'KOMUTAN / BİYOLOG'
                  : 'MÜHENDİS'}
                )
              </span>
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
              placeholder="Telsizden metin mesajı ilet..."
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
              {(() => {
                const channelLogs = transmissions.filter(
                  (t) => t.frequency === `${activeFreq} MHz`
                );
                if (channelLogs.length === 0) {
                  return (
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-center text-[11px] font-mono text-white/50">
                      {activeFreq} MHz kanalında henüz yayın yok. Bas-Konuş veya hızlı kalıp ile yayın başlatın.
                    </div>
                  );
                }
                return channelLogs.map((t) => {
                  const isMe = t.senderRole === myRole;
                  const isPlaying = playingId === t.id;
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

                      {t.audioDataUrl ? (
                        <div className="flex items-center justify-between gap-2 mt-0.5 bg-black/35 rounded-lg p-1.5 border border-white/10">
                          <button
                            type="button"
                            onClick={() => (isPlaying ? stopAudioPlayback() : playVoiceTransmission(t))}
                            className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              isPlaying
                                ? 'bg-rose-500 text-white'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                            }`}
                          >
                            {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                            <span>{isPlaying ? 'DURDUR' : 'SESİ DİNLE'}</span>
                          </button>
                          <span className="font-mono text-[10px] text-white/70">
                            {t.audioDurationMs ? `${(t.audioDurationMs / 1000).toFixed(1)} sn` : 'Ses Kaydı'}
                          </span>
                        </div>
                      ) : (
                        <p className="font-manrope leading-snug">{t.message}</p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Walkie-Talkie Tactical Bottom: Real Voice PTT (Bas-Konuş) Heavy Button */}
        <div className="bg-[#191535] p-4 border-t border-white/10 flex flex-col items-center justify-center gap-2">
          {micStatus !== 'idle' && (
            <div className="w-full px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono text-[10px] flex items-center justify-center gap-1.5 text-center">
              <MicOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {micStatus === 'denied'
                  ? 'Mikrofon izni verilmedi — tarayıcıdan izin verin veya hızlı kalıpları kullanın.'
                  : micStatus === 'too_short'
                  ? 'Ses göndermek için butona en az 0.4 saniye basılı tutun.'
                  : micStatus === 'too_large'
                  ? 'Ses kaydı boyutu sınırı (320 KB) aşıldı, lütfen daha kısa kaydedin.'
                  : 'Bu cihazda mikrofon ses kaydı desteklenmiyor.'}
              </span>
            </div>
          )}

          <button
            type="button"
            onPointerDown={(e) => {
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Ignore if pointer capture is unsupported
              }
              handleStartPTT();
            }}
            onPointerUp={handleStopPTT}
            onPointerCancel={handleStopPTT}
            onLostPointerCapture={handleStopPTT}
            onBlur={handleStopPTT}
            onKeyDown={(event) => {
              if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
                event.preventDefault();
                void handleStartPTT();
              }
            }}
            onKeyUp={(event) => {
              if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                handleStopPTT();
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full py-4 rounded-2xl font-sora font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all select-none touch-none shadow-xl cursor-pointer ${
              isTransmitting
                ? 'bg-rose-500 text-white shadow-[0_0_35px_rgba(244,63,94,0.6)] scale-[0.98]'
                : 'bg-gradient-to-r from-[#ffb703] to-[#ff9800] hover:from-[#ffc107] hover:to-[#ffa726] text-black shadow-[0_0_20px_rgba(255,183,3,0.3)] active:scale-95'
            }`}
          >
            {isTransmitting ? (
              <>
                <Mic className="w-6 h-6 animate-pulse text-white" />
                <span className="tracking-widest">{liveTransmitting ? 'CANLI YAYINDA' : 'SES KAYDEDİLİYOR...'} ({recordSeconds}s)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-black" />
                <span>BAS-KONUŞ (GERÇEK SES AKTAR)</span>
              </>
            )}
          </button>

          <span className="text-[10px] font-mono text-white/40 text-center">
            {isTransmitting
              ? '🎙️ MİKROFON AKTİF // PARMAĞINI BIRAKTIĞINDA KARŞI CİHAZA İLETİLİR'
              : 'Basılı tutup konuşun; bıraktığınızda sesiniz anında arkadaşınızın cihazında çalar.'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
