const H = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '28px 0 12px', color: 'var(--color-text-primary)' }}>{children}</h3>
);

const About = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
      <h1 className="page-h1" style={{ marginBottom: '10px' }}>Hakkımızda</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 28 }}>
        Davetim, özel günlerinizi dakikalar içinde şık, animasyonlu bir dijital davetiyeye dönüştürmeniz için var.
      </p>

      <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: 15 }}>
        <H>Neden Davetim?</H>
        <p>
          Kağıt davetiye basmak hem pahalı hem de yavaş; kimin geleceğini takip etmek ayrı bir dert. Davetim'i,
          düğün, kına gecesi, doğum günü veya herhangi bir kutlama için bu süreci saniyeler içine sığdırmak
          amacıyla tasarladık: bir tema seçin, birkaç bilgi girin, linkinizi paylaşın. Misafirleriniz katılım
          durumunu bildirsin, yol tarifi alsın, hepsi tek bir sayfada.
        </p>

        <H>Neye önem veriyoruz</H>
        <p>
          <strong>Sadelik:</strong> Tasarım bilgisi gerektirmeden, üç adımda yayında olan bir davetiye deneyimi.
          <br />
          <strong>Şeffaflık:</strong> Gizli ücret, sürpriz abonelik veya küçük yazılarla gizlenmiş şartlar yok.
          <br />
          <strong>Gizlilik:</strong> Verileriniz yalnızca hizmeti sunmak için kullanılır; ayrıntılar için{' '}
          <a href="/privacy" style={{ color: 'var(--color-accent-gold)' }}>Gizlilik Politikamıza</a> bakabilirsiniz.
        </p>

        <H>Kimin için</H>
        <p>
          Çiftler, aileler, arkadaş grupları — özel bir anını sevdikleriyle paylaşmak isteyen herkes için.
          Düğün ve kına gecesinden doğum günü ve genel kutlamalara kadar, her davet türü için hazır temalar
          sunuyoruz ve yeni temalar eklemeye devam ediyoruz.
        </p>

        <H>Bize ulaşın</H>
        <p>
          Sorunuz, öneriniz veya geri bildiriminiz mi var? <a href="/contact" style={{ color: 'var(--color-accent-gold)' }}>İletişim sayfamızdan</a>{' '}
          bize yazabilir ya da sağ alttaki WhatsApp butonuyla doğrudan ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default About;
