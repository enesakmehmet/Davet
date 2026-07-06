import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Beklenmeyen bir render hatası tüm uygulamayı beyaz ekrana düşürmesin diye
 * en üst seviyede bir güvenlik ağı. Kullanıcıya "bir şeyler ters gitti" mesajı
 * ve sayfayı yenileme seçeneği sunar; hatanın kendisi konsola loglanır.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Beklenmeyen uygulama hatası:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: 24, fontFamily: 'Inter, system-ui, sans-serif', gap: 14,
        }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>Bir şeyler ters gitti</h1>
          <p style={{ color: '#666', maxWidth: 420, margin: 0 }}>
            Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi dene; sorun devam ederse bize bildir.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#d4af37', color: '#1a1a1a', border: 'none', borderRadius: 8,
              padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
