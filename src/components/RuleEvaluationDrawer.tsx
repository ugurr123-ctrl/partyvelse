import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  Layers, 
  Radio, 
  ShieldAlert, 
  Zap, 
  Wifi, 
  X,
  Compass,
  Cable,
  Activity,
  Flame
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleEvaluationDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141123] border border-[#ffb703]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#e6dff9]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#1a163b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 border border-[#ffb703]/40 flex items-center justify-center text-[#ffb703]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                  OYUN MİMARİSİ RAPORU
                </span>
                <span className="text-xs text-[#a59db8]">v2.4 Spesifikasyon</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sora">
                Kayıp Sinyal: Oyun Mantığı Değerlendirmesi & Bilgi/Eylem Akışı
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-[#d1c8e6]">
          
          {/* Section 1: Belirsizlik ve Çelişki Değerlendirmesi */}
          <div className="p-4 rounded-xl bg-[#1c192c] border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-sora text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>1. Oyun Mantığındaki Belirsizlik ve Çelişkilerin Tespiti</span>
            </div>
            <p className="text-xs text-[#b8aecf]">
              Kullanıcı brifindeki kurallar incelendiğinde oyun zevkini ve çok oyunculu dengeyi etkileyebilecek 3 temel çelişki tespit edilmiş ve çözülmüştür:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#201d30] border border-white/5 space-y-1.5">
                <div className="text-xs font-semibold text-amber-300">Çelişki A: Aşama Sıralaması & Görev Havuzu</div>
                <p className="text-[11px] text-[#9e8f78] leading-normal">
                  Başlangıçta "1. Reaktör, 2. Sinyal, 3. Kurtarma" denirken, devamında 5 mini-oyundan 2'sinin rastgele seçileceği ve toplam 4 aşama olacağı belirtilmiştir.
                </p>
                <div className="text-[11px] text-[#00f0ff] font-medium pt-1 border-t border-white/5">
                  ✓ Çözüm: Oyun 4 aşamalı döngüye oturtuldu. Tur başında 5 onarım arasından 2'si rastgele seçilir; 3. aşamada Enerji Dağıtımı, 4. aşamada Kurtarma Kararı oynanır.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#201d30] border border-white/5 space-y-1.5">
                <div className="text-xs font-semibold text-amber-300">Çelişki B: Bilgi Asimetrisi & Pasif Oyuncu Riski</div>
                <p className="text-[11px] text-[#9e8f78] leading-normal">
                  Kaptanın yalnızca kılavuz okuyup mühendisin tuşlara bastığı geleneksel asimetrilerde kılavuz okuyan taraf sıkılır, diğer taraf ise ezbere basar.
                </p>
                <div className="text-[11px] text-[#00f0ff] font-medium pt-1 border-t border-white/5">
                  ✓ Çözüm: Çift yönlü bağımlılık kuralı konuldu. Mühendis ölçüm ve verileri okur; Kaptan teşhis kuralını çözer; Kaptan onaylar, Mühendis fiziksel kesici/vana çevirir.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#201d30] border border-white/5 space-y-1.5">
                <div className="text-xs font-semibold text-amber-300">Çelişki C: Enerji Dağıtımının Kurtarma Sonucuna Etkisi</div>
                <p className="text-[11px] text-[#9e8f78] leading-normal">
                  Enerji kararlarının rotaları nasıl etkileyeceği belirsizdi (12 enerjinin hat kayıpları ve rota gereksinimleri bağı kopabilirdi).
                </p>
                <div className="text-[11px] text-[#00f0ff] font-medium pt-1 border-t border-white/5">
                  ✓ Çözüm: 3 sistem (İtki, Kalkan, Yaşam Desteği) için ayrılan net güç, 4. aşamadaki Rota Alfa (4 İtki), Beta (3 İtki/3 Kalkan) ve Gama (4 Kalkan) erişimini doğrudan kilitler.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 4 Aşamalı Oyun Döngüsü */}
          <div className="p-4 rounded-xl bg-[#1c192c] border border-[#00f0ff]/20 space-y-3">
            <div className="flex items-center gap-2 text-[#00f0ff] font-bold font-sora text-sm sm:text-base">
              <Layers className="w-5 h-5 text-[#00f0ff] shrink-0" />
              <span>2. Tutarlı 4 Aşamalı Oyun Döngüsü Mimarisi (Yaklaşık 5 Dakika)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg bg-[#201d30] border-l-2 border-[#00f0ff]">
                <span className="text-[10px] font-mono text-[#00f0ff] font-bold uppercase">AŞAMA 1 (1.5 DK)</span>
                <h4 className="text-xs font-bold text-white mt-0.5">1. Onarım Görevi</h4>
                <p className="text-[11px] text-[#a59db8] mt-1">
                  Havuzdan rastgele 1. mini oyun (örn. Arıza Teşhisi, Radar veya Kablo). Hata durumunda gövde bütünlüğü %15 düşer.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#201d30] border-l-2 border-[#ffb703]">
                <span className="text-[10px] font-mono text-[#ffb703] font-bold uppercase">AŞAMA 2 (1.5 DK)</span>
                <h4 className="text-xs font-bold text-white mt-0.5">2. Onarım Görevi</h4>
                <p className="text-[11px] text-[#a59db8] mt-1">
                  Havuzdan rastgele 2. mini oyun (örn. Sinyal Çözümü veya Hava Kilidi). Zaman baskısı ve sinyal paraziti artar.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#201d30] border-l-2 border-[#dcb8ff]">
                <span className="text-[10px] font-mono text-[#dcb8ff] font-bold uppercase">AŞAMA 3 (1.0 DK)</span>
                <h4 className="text-xs font-bold text-white mt-0.5">Enerji Dağıtımı</h4>
                <p className="text-[11px] text-[#a59db8] mt-1">
                  Toplam 12 birim enerji. Mühendis hat kayıplarını hesaplayıp taslak iletir; Kaptan gizli asgari eşiklerle onaylayıp kilitler.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#201d30] border-l-2 border-emerald-400">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">AŞAMA 4 (1.0 DK)</span>
                <h4 className="text-xs font-bold text-white mt-0.5">Kurtarma & Sonuç</h4>
                <p className="text-[11px] text-[#a59db8] mt-1">
                  3 tahliye rotasından biri seçilir. Kaptan süre/kişi, Mühendis güç uygunluğunu doğrular. Çift onay şarttır.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: 5 Onarım Oyununun Karşılıklı Eylem Akışı */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-sora flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#ffb703]" />
              3. Kaptan ↔ Mühendis Çift Yönlü Bilgi ve Eylem Matrisi
            </h3>

            <div className="space-y-2">
              {/* Game 1: Arıza */}
              <div className="p-3 rounded-lg bg-[#1c192c] border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex items-center gap-1.5 text-[#ffb703] font-bold text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Arıza Teşhisi (Reaktör)</span>
                  </div>
                  <span className="text-[10px] text-[#a59db8]">Isı / Basınç / Kesici Hatları</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-[11px]">
                  <div className="bg-[#201d30] p-2 rounded border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold block mb-0.5">MÜHENDİS:</span>
                    4 hattın sıcaklık, basınç ve parazitini canlı okur (örn: Anten 84°C, 38kPa, 68dB). Şüpheli hattı işaretleyip Kaptana iletir.
                  </div>
                  <div className="bg-[#201d30] p-2 rounded border border-amber-500/20">
                    <span className="text-amber-400 font-bold block mb-0.5">KAPTAN:</span>
                    Gizli arıza koşullarını bilir (Isı ≥80°C & Basınç ≤40kPa & Parazit ≥65dB). Devre şemasından Anten hattını besleyen K3 kesicisini açar.
                  </div>
                </div>
              </div>

              {/* Game 2: Sinyal */}
              <div className="p-3 rounded-lg bg-[#1c192c] border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex items-center gap-1.5 text-[#00f0ff] font-bold text-xs">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Sinyal Çözümü</span>
                  </div>
                  <span className="text-[10px] text-[#a59db8]">Spektrum & Şifre Deşifre</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-[11px]">
                  <div className="bg-[#201d30] p-2 rounded border border-amber-500/20">
                    <span className="text-amber-400 font-bold block mb-0.5">KAPTAN:</span>
                    4 sembollü mesajı, sayı tablosunu ve o turun kuralını görür (Örn: Çiftleri değiştir). Elde ettiği 4 haneli şifreyi (7492) sesli söyler.
                  </div>
                  <div className="bg-[#201d30] p-2 rounded border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold block mb-0.5">MÜHENDİS:</span>
                    Döner frekans kadranıyla spektrumu tarar. 4 kanaldan 7492 kodunu taşıyan 148.8 MHz frekansını bulup kilitler.
                  </div>
                </div>
              </div>

              {/* Game 3: Kablo */}
              <div className="p-3 rounded-lg bg-[#1c192c] border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <Cable className="w-3.5 h-3.5" />
                    <span>Kablo Bağlantısı</span>
                  </div>
                  <span className="text-[10px] text-[#a59db8]">Darbe & Soket Patchleme</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-[11px]">
                  <div className="bg-[#201d30] p-2 rounded border border-amber-500/20">
                    <span className="text-amber-400 font-bold block mb-0.5">KAPTAN:</span>
                    Teknik kılavuzdan Güneş (240Hz), Ay (480Hz) ve Yıldız (120Hz) için gereken darbe sayılarını söyler.
                  </div>
                  <div className="bg-[#201d30] p-2 rounded border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold block mb-0.5">MÜHENDİS:</span>
                    J1–J4 soketlerinin frekans osiloskoplarını ölçer. Kabloya sonra sokete dokunarak renkli hatları bağlar ve testi başlatır.
                  </div>
                </div>
              </div>

              {/* Game 4: Hava Kilidi */}
              <div className="p-3 rounded-lg bg-[#1c192c] border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Hava Kilidi</span>
                  </div>
                  <span className="text-[10px] text-[#a59db8]">Basınç & Vana Sıralaması</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-[11px]">
                  <div className="bg-[#201d30] p-2 rounded border border-amber-500/20">
                    <span className="text-amber-400 font-bold block mb-0.5">KAPTAN:</span>
                    Karışık 3 güvenlik kuralını okuyarak doğru adımı çıkarır: Filtre (V2) → Tahliye (V3) → Pompa (V1) → Mühür (V4).
                  </div>
                  <div className="bg-[#201d30] p-2 rounded border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold block mb-0.5">MÜHENDİS:</span>
                    Vana panelinden bu sıralamayı 4 adımlı tampona dokunarak ekler, gerekirse geri alır ve kilidi patlatmadan açar.
                  </div>
                </div>
              </div>

              {/* Game 5: Radar */}
              <div className="p-3 rounded-lg bg-[#1c192c] border border-white/5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="w-full sm:w-48 shrink-0">
                  <div className="flex items-center gap-1.5 text-violet-400 font-bold text-xs">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Radar Yönlendirme</span>
                  </div>
                  <span className="text-[10px] text-[#a59db8]">Koordinat & Yön Pusulası</span>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-[11px]">
                  <div className="bg-[#201d30] p-2 rounded border border-amber-500/20">
                    <span className="text-amber-400 font-bold block mb-0.5">KAPTAN:</span>
                    Referans işareti ve yön formülünü okur: "L2 işaretçisinden 2 hücre doğuya, 1 hücre kuzeye".
                  </div>
                  <div className="bg-[#201d30] p-2 rounded border border-cyan-500/20">
                    <span className="text-cyan-400 font-bold block mb-0.5">MÜHENDİS:</span>
                    Her tur rotasyonu değişebilen pusulaya bakar; 5×5 ızgarada L2'yi bulup hesaplanan hücreyi seçerek tarar.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Gerçek Bağlantı vs Simülasyon Ayrımı */}
          <div className="p-4 rounded-xl bg-[#0f0c1e] border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-[#00f0ff] font-bold font-sora text-sm">
              <Wifi className="w-4 h-4 text-[#00f0ff]" />
              <span>4. Simülasyon ile Gerçek Bağlantı Ayrımı</span>
            </div>
            <p className="text-xs text-[#a59db8]">
              Kullanıcı brifine harfiyen uyularak çalışmayan harici sunucular varmış gibi yanıltıcı göstergeler eklenmemiştir:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-[#d1c8e6]">
              <li><strong className="text-white">Çift Cihaz / Çift Sekme Gerçek Senkronizasyonu:</strong> Tarayıcı <code className="text-[#00f0ff]">BroadcastChannel</code> ve <code className="text-[#00f0ff]">localStorage</code> kanalı üzerinden iki ayrı sekme veya pencere açıldığında oda kodu ve hamleler anında birbirine iletilir.</li>
              <li><strong className="text-white">Simülatör / Solo Modu:</strong> Tek başına oynayan kullanıcılar için üst panelde "Rol Değiştir (Kaptan ⇄ Mühendis)" düğmesi ve otomatik partner simülasyonu mevcuttur.</li>
              <li><strong className="text-white">Bağlantı Kesintisi Simülasyonu:</strong> "Bağlantıyı Kes" anahtarıyla süre dondurulur, panolar kilitlenir ve "Yeniden Bağlan" kurtarma durumu gerçekçi olarak test edilebilir.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#1a163b]/70 flex items-center justify-between">
          <span className="text-xs text-[#9e8f78]">PARTYVERSE Kayıp Sinyal • Oyun Motoru Çekirdeği</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#ff9e00] text-black font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Anladım, Konsola Dön
          </button>
        </div>

      </div>
    </div>
  );
};
