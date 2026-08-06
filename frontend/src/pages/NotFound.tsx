import { Link } from 'react-router-dom';

/**
 * Tanımsız bir URL'e gidildiğinde (App.tsx'te path="*" eşleşir) gösterilir.
 * Öncesinde hiç 404 sayfası yoktu — geçersiz bir bağlantıya tıklayan ziyaretçi
 * navigasyonu/footer'ı olmayan bomboş bir sayfayla karşılaşıyordu.
 */
const NotFound = () => {
  return (
    <div
      className="container"
      style={{
        paddingTop: 120,
        paddingBottom: 120,
        maxWidth: 560,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, color: 'var(--color-accent-gold)', marginBottom: 10 }}>
        404
      </div>
      <h1 className="page-h1" style={{ marginBottom: 14 }}>Bu sayfa bulunamadı</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>
        Aradığınız sayfa kaldırılmış veya hiç var olmamış olabilir. Bağlantıyı kontrol edin
        ya da anasayfaya dönün.
      </p>
      <Link to="/" className="btn-primary-large">Anasayfaya Dön</Link>
    </div>
  );
};

export default NotFound;
