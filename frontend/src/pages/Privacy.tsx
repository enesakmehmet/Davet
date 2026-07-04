const H = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '28px 0 12px', color: 'var(--color-text-primary)' }}>{children}</h3>
);

const Privacy = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 className="page-h1" style={{ marginBottom: '10px' }}>Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 28 }}>Son güncelleme: Temmuz 2026</p>

      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: 15 }}>
        <p>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, Davetim platformunu
          ("Platform") kullanan üyelerin ve davet sayfalarını ziyaret eden misafirlerin kişisel verilerinin
          nasıl işlendiğini açıklamak amacıyla veri sorumlusu sıfatıyla hazırlanmıştır.
        </p>

        <H>1. İşlenen Kişisel Veriler</H>
        <p>
          <strong>Üyeler için:</strong> ad soyad, e-posta adresi, şifre (geri döndürülemez şekilde şifrelenmiş),
          oluşturduğunuz davetiye içerikleri (isimler, tarihler, mekan bilgileri, fotoğraflar, müzik dosyaları)
          ve ödeme yapmanız halinde işlem kayıtları. <strong>Misafirler için:</strong> RSVP formunda paylaştığınız
          ad soyad, katılım durumu, kişi sayısı, yemek tercihi, alerji notu ve mesaj; anı albümüne yüklediğiniz
          fotoğraflar ve isteğe bağlı isminiz; ayrıca davet sayfası açıldığında yaklaşık konum (şehir düzeyinde),
          cihaz türü ve tarayıcı bilgisi gibi anonim istatistik verileri.
        </p>

        <H>2. İşleme Amaçları ve Hukuki Sebep</H>
        <p>
          Verileriniz; üyelik sözleşmesinin kurulması ve ifası (KVKK m.5/2-c), hizmetin sunulması (davetiyenin
          yayınlanması, RSVP yanıtlarının davet sahibine iletilmesi), yasal yükümlülüklerin yerine getirilmesi
          (KVKK m.5/2-ç) ve hizmet kalitesinin ölçülmesi için meşru menfaat (KVKK m.5/2-f) hukuki sebeplerine
          dayanılarak işlenir. Verileriniz reklam amacıyla üçüncü kişilerle <strong>paylaşılmaz</strong>.
        </p>

        <H>3. Verilerin Aktarımı ve Saklama</H>
        <p>
          Veriler, hizmetin teknik olarak sunulabilmesi için yurt dışında sunucuları bulunan barındırma
          (Railway) ve e-posta iletim (Resend) hizmet sağlayıcılarının altyapısında, KVKK m.9 kapsamında
          saklanır. Davetiyeler yayın süresi (1 yıl) boyunca; yayından kaldırılan davetler 30 gün boyunca
          (geri alma imkânı için) saklanır ve sonrasında kalıcı olarak silinir. Hesabınızı sildiğinizde tüm
          verileriniz derhal ve kalıcı olarak silinir.
        </p>

        <H>4. Çerezler</H>
        <p>
          Platform, oturumunuzu sürdürmek için zorunlu çerezler/yerel depolama (giriş anahtarları) ve davet
          sayfalarında tekil ziyaretçi sayımı için anonim bir yerel işaret kullanır. Bunlar hizmetin çalışması
          için zorunludur ve onay gerektirmez. Ayrıca, açıkça onay vermeniz hâlinde Google Analytics ve/veya
          Meta (Facebook) Pixel gibi analiz araçları etkinleşebilir; bu araçlar yalnızca onay verdiğinizde
          yüklenir ve istediğiniz zaman onayınızı geri çekebilirsiniz.
        </p>

        <H>5. Misafir Fotoğrafları (Anı Albümü)</H>
        <p>
          Anı albümüne fotoğraf yükleyen misafir, fotoğrafın ilgili davet sayfasında yayınlanmasına onay vermiş
          sayılır. Davet sahibi, albümdeki herhangi bir fotoğrafı silme hakkına sahiptir. Uygunsuz içerik
          bildirimleri için iletişim sayfamızı kullanabilirsiniz.
        </p>

        <H>6. KVKK Kapsamındaki Haklarınız</H>
        <p>
          KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya
          silinmesini isteme, aktarıldığı üçüncü kişileri bilme ve zarara uğramanız hâlinde giderilmesini talep
          etme haklarına sahipsiniz. Taleplerinizi iletişim sayfası üzerinden veya hesap ayarlarındaki
          "Hesabı Sil" ve "Verilerimi İndir" seçenekleriyle kullanabilirsiniz. Başvurular en geç 30 gün içinde
          yanıtlanır.
        </p>

        <H>7. İletişim</H>
        <p>
          Gizlilikle ilgili tüm sorularınız için <a href="/contact" style={{ color: 'var(--color-accent-gold)' }}>iletişim sayfamızdan</a> bize ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
