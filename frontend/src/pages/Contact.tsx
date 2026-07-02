import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { contactService } from '../services/api';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setResult(null);
    try {
      const r = await contactService.send({ name, email, message });
      setResult({ ok: true, text: r?.message || 'Mesajınız alındı, teşekkürler!' });
      setName(''); setEmail(''); setMessage('');
    } catch (err: any) {
      setResult({ ok: false, text: err?.response?.data?.message || 'Gönderilemedi, lütfen tekrar deneyin.' });
    } finally {
      setSending(false);
    }
  };

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
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={submit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Adınız Soyadınız</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} placeholder="Ahmet Yılmaz" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>E-posta Adresiniz</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} placeholder="ornek@email.com" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Mesajınız</label>
              <textarea rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-sans)' }} placeholder="Size nasıl yardımcı olabiliriz?"></textarea>
            </div>

            {result && (
              <p style={{ fontSize: 14, color: result.ok ? '#2e7d4f' : '#b3354b', background: result.ok ? '#e7f4ec' : '#fbe9ec', padding: '10px 14px', borderRadius: 8 }}>
                {result.text}
              </p>
            )}

            <button className="btn-primary" style={{ marginTop: '16px' }} disabled={sending}>
              {sending ? 'Gönderiliyor…' : 'Gönder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
