import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTracker from './components/PageTracker';
import WhatsappButton from './components/WhatsappButton';
import CookieConsent from './components/CookieConsent';
import './index.css';

// Anasayfa (Home) hemen (statik) içe aktarılıyor — ilk ziyaretçinin göreceği sayfa bu,
// ekstra bir "lazy" ağ isteğiyle geciktirmeye gerek yok. Geri kalan TÜM sayfalar
// (özellikle Editör ve Dashboard — en ağır olanlar) tembel yükleniyor: eskiden hepsi
// tek bir JS paketinde birleşip anasayfayla birlikte indiriliyordu, bu da mobilde
// First/Largest Contentful Paint'i saniyelerce geciktiriyordu (PageSpeed Insights'ta
// görüldü). Artık anasayfayı açan biri Editör'ün/Dashboard'ın kodunu hiç indirmiyor.
const Templates = lazy(() => import('./pages/Templates'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Editor = lazy(() => import('./pages/Editor'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const DavetView = lazy(() => import('./pages/DavetView'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <PageTracker />
        <WhatsappButton />
        <CookieConsent />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="templates" element={<Templates />} />
              <Route path="hakkimizda" element={<About />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Public davet görüntüleyici */}
            <Route path="/davet/:slug" element={<DavetView />} />

            {/* Korumalı */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
