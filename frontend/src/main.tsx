import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Not: Analitik (GA/Meta Pixel) burada değil, kullanıcı onayından sonra
// <CookieConsent /> bileşeninde başlatılır (bkz. src/components/CookieConsent.tsx).

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
