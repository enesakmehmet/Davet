const Privacy = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 className="page-h1" style={{ marginBottom: '32px' }}>Gizlilik Politikası</h1>
      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '24px' }}>
          Davetim olarak gizliliğinize büyük önem veriyoruz. Bu gizlilik politikası, hizmetlerimizi kullanırken bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
        </p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>1. Toplanan Bilgiler</h3>
        <p style={{ marginBottom: '24px' }}>
          Platformumuzu kullandığınızda adınız, e-posta adresiniz, fatura bilgileriniz ve oluşturduğunuz davetiyeler ile LCV (RSVP) listeleri gibi verileri kaydediyoruz.
        </p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>2. Verilerin Kullanımı</h3>
        <p style={{ marginBottom: '24px' }}>
          Topladığımız verileri hizmet kalitemizi artırmak, size daha iyi bir deneyim sunmak ve işlemlerinizi güvenle gerçekleştirmek için kullanıyoruz. Davetli listenizi kesinlikle üçüncü parti reklamcılarla paylaşmıyoruz.
        </p>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>3. İletişim</h3>
        <p>
          Gizlilik ile ilgili tüm sorularınız için bizimle iletişime geçebilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
