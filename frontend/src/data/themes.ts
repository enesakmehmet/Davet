/**
 * Tek doğru kaynak (single source of truth): tüm hazır davetiye temaları.
 *
 * Önceden bu liste Templates.tsx ve Editor.tsx içinde ayrı ayrı elle kopyalanmıştı
 * ve zamanla birbirinden sapmıştı (ör. "gazete" temasının vurgu rengi iki dosyada
 * farklıydı). Artık her iki sayfa da bu tek dosyadan besleniyor.
 *
 * Renkler davet-preview.html'deki gerçek tema tanımlarıyla (accent/soft) eşleşecek
 * şekilde tutulmalıdır — burayı değiştirirken oradaki THEMES tanımına da bakın.
 */

export type ThemeCategory = 'dugun' | 'dini' | 'dogumgunu' | 'kutlama';

export const CATEGORY_LABEL: Record<ThemeCategory, string> = {
  dugun: 'Düğün',
  dini: 'Dini Düğün',
  dogumgunu: 'Doğum Günü',
  kutlama: 'Kutlama',
};

export interface ThemeDef {
  key: string;
  name: string;
  c1: string;
  c2: string;
  category: ThemeCategory;
  dark: boolean;
  isNew?: boolean;
}

export const THEMES: ThemeDef[] = [
  // ===== Düğün =====
  { key: 'altin', name: 'Zarif Altın', c1: '#9c7a31', c2: '#e8d6a8', category: 'dugun', dark: false },
  { key: 'gul', name: 'Romantik Gül', c1: '#b35a72', c2: '#f6dbe2', category: 'dugun', dark: false },
  { key: 'minimal', name: 'Modern Minimal', c1: '#1a1a1a', c2: '#d8d8d8', category: 'dugun', dark: false },
  { key: 'bohem', name: 'Bohem Kır', c1: '#5f7050', c2: '#cdbfa6', category: 'dugun', dark: false },
  { key: 'lacivert', name: 'Lacivert Gece', c1: '#0e1a33', c2: '#c9a14e', category: 'dugun', dark: true },
  { key: 'lavanta', name: 'Lavanta Bahçe', c1: '#6f54a0', c2: '#e3d6f3', category: 'dugun', dark: false },
  { key: 'sonbahar', name: 'Sonbahar', c1: '#8a3d1c', c2: '#ecd9bf', category: 'dugun', dark: false },
  { key: 'deniz', name: 'Deniz Kıyısı', c1: '#1c7484', c2: '#bfe6ec', category: 'dugun', dark: false },
  { key: 'tropikal', name: 'Tropikal', c1: '#136443', c2: '#bfe6cf', category: 'dugun', dark: true },
  { key: 'havai', name: 'Gece Havai Fişek', c1: '#070912', c2: '#cbab53', category: 'dugun', dark: true },
  { key: 'sinematik', name: 'Altın Sinematik', c1: '#0b0b0d', c2: '#c9a14e', category: 'dugun', dark: true },
  { key: 'zumrut', name: 'Zümrüt Saray', c1: '#0d3b2a', c2: '#d4b455', category: 'dugun', dark: true, isNew: true },
  { key: 'gececicek', name: 'Gece Çiçeği', c1: '#2b0d1d', c2: '#e58bb1', category: 'dugun', dark: true, isNew: true },
  { key: 'pudra', name: 'Pudra Şıklığı', c1: '#c07f6d', c2: '#f6e3da', category: 'dugun', dark: false, isNew: true },
  { key: 'yildizharitasi', name: 'Yıldız Haritası', c1: '#080b18', c2: '#9bb8ff', category: 'dugun', dark: true, isNew: true },
  { key: 'gazete', name: 'Düğün Gazetesi', c1: '#f6f2e6', c2: '#1a1a1a', category: 'dugun', dark: false, isNew: true },
  { key: 'biniskarti', name: 'Biniş Kartı', c1: '#0e5a8a', c2: '#dce9f2', category: 'dugun', dark: true, isNew: true },
  { key: 'mumisigi', name: 'Mum Işığı', c1: '#120a04', c2: '#e8b45a', category: 'dugun', dark: true, isNew: true },
  { key: 'sakurazen', name: 'Sakura Zen', c1: '#c96f87', c2: '#faf7f4', category: 'dugun', dark: false, isNew: true },
  { key: 'askmektubu', name: 'Aşk Mektubu', c1: '#8a5a3b', c2: '#f9f3e6', category: 'dugun', dark: false, isNew: true },
  { key: 'filmseridi', name: 'Film Şeridi', c1: '#101010', c2: '#e8c15a', category: 'dugun', dark: true, isNew: true },
  { key: 'muze', name: 'Müze', c1: '#7a6a4f', c2: '#f4f1ea', category: 'dugun', dark: false, isNew: true },
  { key: 'parsomen', name: 'Parşömen', c1: '#7a4a1f', c2: '#f3e6c8', category: 'dugun', dark: false, isNew: true },
  { key: 'denizalti', name: 'Deniz Altı', c1: '#062430', c2: '#5fd4d0', category: 'dugun', dark: true, isNew: true },
  { key: 'sinemaafisi', name: 'Sinema Afişi', c1: '#0c0a08', c2: '#d4af37', category: 'dugun', dark: true, isNew: true },
  { key: 'kristal', name: 'Kristal', c1: '#6f93c9', c2: '#f8fafd', category: 'dugun', dark: false, isNew: true },
  { key: 'pusula', name: 'Pusula & Seyahat', c1: '#3d6b5c', c2: '#f2ead8', category: 'dugun', dark: false, isNew: true },
  { key: 'sato', name: 'Masal Şatosu', c1: '#120c22', c2: '#c9a86e', category: 'dugun', dark: true, isNew: true },
  { key: 'notakagidi', name: 'Nota Kağıdı', c1: '#4a4440', c2: '#faf7f0', category: 'dugun', dark: false, isNew: true },
  { key: 'gunbatimi', name: 'Gün Batımı Plajı', c1: '#f2825e', c2: '#7a4a78', category: 'dugun', dark: false, isNew: true },
  { key: 'yagliboya', name: 'Yağlı Boya', c1: '#8a4a5e', c2: '#f5efe4', category: 'dugun', dark: false, isNew: true },
  { key: 'ayna', name: 'Gümüş Ayna', c1: '#7a8294', c2: '#f5f6f8', category: 'dugun', dark: false, isNew: true },
  // ===== Dini Düğün =====
  { key: 'dini', name: 'Zarif Besmele', c1: '#b08a3e', c2: '#f0e2bd', category: 'dini', dark: false, isNew: true },
  { key: 'diniYesil', name: 'Zümrüt Dua', c1: '#2e6b4f', c2: '#dcead9', category: 'dini', dark: false, isNew: true },
  // ===== Doğum Günü =====
  { key: 'balon', name: 'Renkli Balon', c1: '#e84393', c2: '#ffd6e8', category: 'dogumgunu', dark: false },
  { key: 'konfeti', name: 'Konfeti Partisi', c1: '#120a24', c2: '#f5c542', category: 'dogumgunu', dark: true },
  // ===== Kutlama =====
  { key: 'kutlamaPop', name: 'Renkli Kutlama', c1: '#ff5e8a', c2: '#ffd1e0', category: 'kutlama', dark: false },
  { key: 'kutlamaGece', name: 'Işıltılı Gece', c1: '#0f0a22', c2: '#ffd86b', category: 'kutlama', dark: true },
  { key: 'kutlamaPastel', name: 'Pastel Kutlama', c1: '#7aa6b8', c2: '#d8ecf2', category: 'kutlama', dark: false },
  { key: 'kutlamaAltin', name: 'Altın Zarafet', c1: '#b8923f', c2: '#ecd9a8', category: 'kutlama', dark: false },
  { key: 'kutlamaCocuk', name: 'Çocuk Partisi', c1: '#ff7a3d', c2: '#ffe0b8', category: 'kutlama', dark: false },
  { key: 'kutlamaDisko', name: 'Disko Gecesi', c1: '#0a0118', c2: '#ff2ec4', category: 'kutlama', dark: true },
  { key: 'kutlamaNeon', name: 'Neon Parti', c1: '#0a0a1f', c2: '#00e5ff', category: 'kutlama', dark: true, isNew: true },
  { key: 'kutlamaSakura', name: 'Bahar Çiçeği', c1: '#e77fa1', c2: '#fde9f1', category: 'kutlama', dark: false, isNew: true },
  { key: 'kutlamaMasal', name: 'Masal Dünyası', c1: '#8f6fd6', c2: '#efe6ff', category: 'kutlama', dark: false, isNew: true },
];

export const findTheme = (key: string) => THEMES.find((t) => t.key === key);
