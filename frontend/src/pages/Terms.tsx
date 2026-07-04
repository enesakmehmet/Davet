const H = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '28px 0 12px', color: 'var(--color-text-primary)' }}>{children}</h3>
);

const Terms = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 className="page-h1" style={{ marginBottom: '10px' }}>Kullanım Şartları</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 28 }}>Son güncelleme: Temmuz 2026</p>

      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: 15 }}>
        <p>
          Davetim platformunu ("Platform") kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
          Lütfen hizmeti kullanmadan önce bu metni dikkatlice okuyun.
        </p>

        <H>1. Hizmetin Tanımı</H>
        <p>
          Platform; düğün, kına, doğum günü ve benzeri etkinlikler için dijital davetiye oluşturma, paylaşma,
          RSVP (katılım) toplama, misafir albümü ve ilgili istatistik hizmetleri sunar. Yayınlanan her davetiye,
          oluşturulma tarihinden itibaren <strong>1 yıl</strong> boyunca yayında kalır.
        </p>

        <H>2. Hesap ve Sorumluluk</H>
        <p>
          Hesap açarken doğru bilgi vermek ve hesap güvenliğinizi (şifrenizi) korumak sizin sorumluluğunuzdadır.
          Davetiye yayınlayabilmek için e-posta adresinizin doğrulanmış olması gerekir. Hesabınız üzerinden
          yapılan tüm işlemlerden siz sorumlusunuz.
        </p>

        <H>3. İçerik Kuralları</H>
        <p>
          Davetiyelerinize eklediğiniz tüm içeriklerin (metin, fotoğraf, müzik) size ait olduğunu veya kullanım
          hakkına sahip olduğunuzu beyan edersiniz. Hukuka aykırı, hakaret içeren, telif hakkı ihlali oluşturan
          veya üçüncü kişilerin kişilik haklarını zedeleyen içerikler yayınlanamaz; bu tür içerikler tespit
          edildiğinde önceden bildirim yapılmaksızın kaldırılabilir ve ilgili hesap askıya alınabilir.
          Misafir albümüne yüklenen fotoğraflardan yükleyen misafir sorumludur; davet sahibi albümü yönetme
          (fotoğraf silme) hakkına sahiptir.
        </p>

        <H>4. Ücretlendirme</H>
        <p>
          Hizmet şu an lansmana özel olarak ücretsizdir. Ücretli paketlere geçilmesi durumunda fiyatlar ve
          kapsam, satın alma öncesinde açıkça gösterilir; mevcut yayındaki davetiyeler bundan etkilenmez.
          Ücretli işlemlerde yasal cayma hakkı ve iade koşulları satın alma sayfasında belirtilir.
        </p>

        <H>5. Hizmet Sürekliliği ve Sorumluluk Sınırı</H>
        <p>
          Platformun kesintisiz çalışması için makul özen gösterilir; ancak bakım, güncelleme veya bizden
          kaynaklanmayan altyapı sorunları nedeniyle yaşanabilecek geçici kesintilerden, veri kaybına karşı
          düzenli yedek almamanızdan veya davetiyenin üçüncü kişilerce kötüye kullanılmasından Platform sorumlu
          tutulamaz. Davetiye bağlantınızı kimlerle paylaştığınız sizin kontrolünüzdedir; hassas etkinlikler
          için şifre koruması özelliğini kullanmanızı öneririz.
        </p>

        <H>6. Fesih</H>
        <p>
          Hesabınızı dilediğiniz an ayarlar sayfasından silebilirsiniz; bu durumda tüm davetiyeleriniz ve
          verileriniz kalıcı olarak silinir. Platform, bu şartların ihlali hâlinde hesabı askıya alma veya
          sonlandırma hakkını saklı tutar.
        </p>

        <H>7. Değişiklikler ve İletişim</H>
        <p>
          Bu şartlar güncellenebilir; önemli değişiklikler Platform üzerinden duyurulur. Sorularınız için{' '}
          <a href="/contact" style={{ color: 'var(--color-accent-gold)' }}>iletişim sayfamızı</a> kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Terms;
