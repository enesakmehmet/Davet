const Terms = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 className="page-h1" style={{ marginBottom: '32px' }}>Kullanım Şartları</h1>
      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '24px' }}>
          Davetim hizmetlerini kullanarak aşağıdaki şartları ve koşulları kabul etmiş sayılırsınız. Lütfen hizmetlerimizi kullanmadan önce bu metni dikkatlice okuyun.
        </p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>1. Hizmetin Kullanımı</h3>
        <p style={{ marginBottom: '24px' }}>
          Kullanıcılar platformumuz üzerinden kendi tasarımlarını oluşturabilir, başkaları tarafından oluşturulan ücretsiz veya ücretli şablonları kullanabilir. Platformumuzun yasa dışı etkinlikler için kullanılması yasaktır.
        </p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>2. Fikri Mülkiyet</h3>
        <p style={{ marginBottom: '24px' }}>
          Davetim üzerinde yer alan tüm temel tasarımlar, grafikler ve altyapı kodları şirketimize aittir. Kullanıcıların yüklediği özel resimler ve metinler ise kullanıcıların kendi mülkiyetindedir.
        </p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>3. İptal ve İade</h3>
        <p>
          Premium şablon satın alımları dijital ürün statüsünde olduğu için indirildikten/kullanıldıktan sonra iade edilemez. Ancak sistemden kaynaklı bir hata tespit edilirse destek ekibimiz iade sağlayabilir.
        </p>
      </div>
    </div>
  );
};

export default Terms;
