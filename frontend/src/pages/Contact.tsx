import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="page-h1" style={{ marginBottom: '16px' }}>Bizimle İletişime Geçin</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Sorularınız, önerileriniz veya destek talepleriniz için buradayız.
        </p>
      </div>

      <div className="contact-grid">
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '24px' }}>Bize Ulaşın</h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
            <MapPin color="var(--color-accent-gold)" />
            <div>
              <h4 style={{ marginBottom: '4px' }}>Ofis Adresimiz</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Levent, Büyükdere Cd. No:1<br/>Beşiktaş / İstanbul</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
            <Mail color="var(--color-accent-gold)" />
            <div>
              <h4 style={{ marginBottom: '4px' }}>E-posta</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>hello@davetim.com</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Phone color="var(--color-accent-gold)" />
            <div>
              <h4 style={{ marginBottom: '4px' }}>Telefon</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>+90 (850) 123 45 67</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Adınız Soyadınız</label>
              <input type="text" style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} placeholder="Ahmet Yılmaz" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>E-posta Adresiniz</label>
              <input type="email" style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} placeholder="ornek@email.com" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Mesajınız</label>
              <textarea rows={5} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-sans)' }} placeholder="Size nasıl yardımcı olabiliriz?"></textarea>
            </div>
            
            <button className="btn-primary" style={{ marginTop: '16px' }}>Gönder</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
