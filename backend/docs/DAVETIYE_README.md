# 💒 Dijital Düğün Davetiyesi

Modern, mobil-öncelikli, kaydırmalı tek sayfa düğün davetiyesi.

## ✨ Özellikler

- 📱 **Mobil Öncelikli Tasarım** - 480px max-width, tüm cihazlarda mükemmel görünüm
- 🎨 **Lüks Tasarım** - Altın detaylar, zarif tipografi, premium renkler
- ⏱️ **Canlı Geri Sayım** - Düğün gününe kalan süreyi gerçek zamanlı gösterir
- 🎵 **Arka Plan Müziği** - Açma/kapatma butonu ile kontrol edilebilir
- 📝 **RSVP Formu** - Misafir katılım onayı için hazır form
- 🖼️ **Fotoğraf Galerisi** - 2 sütunlu responsive galeri
- ✨ **Animasyonlar** - Intersection Observer ile fade-in efektleri
- 🎭 **Splash Screen** - Davetiyeyi açma animasyonu
- 🗺️ **Google Maps Entegrasyonu** - Tek tıkla konum açılır

## 🎨 Tasarım Sistemi

### Renkler
- **Koyu Arka Plan**: `#1C1410` (koyu kahve/siyah)
- **Altın Vurgu**: `#C9A96A` (altın/bronz)
- **Krem Yazı**: `#F8F1E7` (koyu bölümlerde)
- **Beyaz Arka Plan**: `#FFFFFF` (açık bölümler)
- **Pembe Kart**: `#FBF0EA` (gelin/damat kartları)
- **Şeftali Arka Plan**: `#F4E3D3` (program/RSVP)

### Fontlar
- **Playfair Display** - Başlıklar ve büyük sayılar
- **Cormorant Garamond Italic** - İsimler ve alıntılar
- **Quicksand** - Etiketler ve gövde metinleri

## 📂 Dosya Yapısı

```
dugun-davetiyesi.html    # Ana HTML dosyası (tek dosya, tüm CSS ve JS dahil)
music.mp3                # Arka plan müziği (kullanıcı ekleyecek)
DAVETIYE_README.md       # Bu dosya
```

## 🚀 Kullanım

### 1. Kişiselleştirme

HTML dosyasının başındaki `CONFIG` objesini düzenleyin:

```javascript
const CONFIG = {
    // Çift Bilgileri
    GROOM_NAME: 'Ali',
    BRIDE_NAME: 'Ece',
    
    // Aile Bilgileri
    GROOM_FATHER: 'Levent',
    GROOM_MOTHER: 'Ayşe',
    BRIDE_FATHER: 'Hüseyin',
    BRIDE_MOTHER: 'Sevim',
    
    // Tarih Bilgileri
    WEDDING_DATE: '2026-07-15 19:00:00',
    HENNA_DATE: '2026-07-14 19:00:00',
    RSVP_DEADLINE: '1 Temmuz 2026',
    
    // Mekan Bilgileri
    WEDDING_VENUE: 'Hayal Düğün Salonu',
    WEDDING_ADDRESS: 'Fenerbahçe Mahallesi...',
    
    // Google Maps Linki
    MAPS_LINK: 'https://maps.google.com/?q=40.9829,29.0376'
};
```

### 2. Fotoğrafları Değiştir

- **Hero Arka Plan**: 31. satırdaki `background: url(...)` değiştirin
- **Galeri Görselleri**: 6 adet `<img src="...">` tag'lerini güncelleyin

### 3. Müzik Ekle

`music.mp3` dosyasını aynı klasöre koyun veya HTML'deki audio tag'inde yolu güncelleyin:

```html
<audio id="backgroundMusic" loop>
    <source src="path/to/your/music.mp3" type="audio/mpeg">
</audio>
```

### 4. Test Et

Dosyayı tarayıcıda açın ve test edin:
- ✅ Splash screen açılışı
- ✅ Müzik çalması (tıklama sonrası)
- ✅ Geri sayım çalışması
- ✅ Animasyonlar
- ✅ Form gönderimi

## 🔧 RSVP Form Entegrasyonu

Form şu anda `console.log()` ile veriyi yazdırıyor. Backend entegrasyonu için:

### Google Sheets Entegrasyonu

```javascript
rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        guestCount: document.getElementById('guestCount').value,
        attendance: document.getElementById('attendance').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
    };
    
    // Google Sheets Apps Script Web App URL'si
    const scriptURL = 'YOUR_GOOGLE_SCRIPT_URL';
    
    try {
        await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        successMessage.classList.add('show');
        rsvpForm.reset();
    } catch (error) {
        console.error('Form gönderme hatası:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
});
```

### Backend API Entegrasyonu

```javascript
const response = await fetch('/api/rsvp', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
});

if (response.ok) {
    successMessage.classList.add('show');
    rsvpForm.reset();
}
```

## 📱 Responsive Davranış

- **480px ve üzeri**: Ortalanmış telefon görünümü
- **390px ve altı**: Font boyutları otomatik küçülür
- **Tüm ekranlar**: Hero ve splash tam ekran

## 🎭 Bölümler

1. **Splash Screen** - Açılış animasyonu
2. **Hero** - Ana fotoğraf ve çift isimleri
3. **Ayet** - İslami alıntı
4. **Gelin & Damat** - Aile bilgileri
5. **Program** - Kına ve düğün detayları
6. **Geri Sayım** - Canlı countdown
7. **Lokasyon** - Adres ve harita
8. **RSVP** - Katılım formu
9. **Galeri** - Fotoğraf galerisi
10. **Kapanış** - Son mesaj

## 🎨 Özelleştirme İpuçları

### Renkleri Değiştir

CSS `:root` değişkenlerini düzenleyin:

```css
:root {
    --dark-bg: #1C1410;
    --gold: #C9A96A;
    --cream: #F8F1E7;
    /* ... */
}
```

### Fontları Değiştir

Google Fonts link'ini değiştirin ve CSS'te font-family'leri güncelleyin.

### Animasyonları Ayarla

Intersection Observer threshold'unu değiştirin:

```javascript
const observer = new IntersectionObserver((entries) => {
    // ...
}, {
    threshold: 0.1,  // 0-1 arası değer
    rootMargin: '0px 0px -50px 0px'
});
```

## 🌐 Deploy

### GitHub Pages
1. Repo'ya yükleyin
2. Settings → Pages → Source: main branch
3. Link: `https://username.github.io/repo-name/`

### Netlify
1. Drag & drop ile dosyayı yükleyin
2. Otomatik deploy olur
3. Özel domain ekleyebilirsiniz

### Vercel
```bash
vercel --prod
```

## 📝 Notlar

- Müzik otomatik başlamaz (tarayıcı kısıtlaması), kullanıcı butona tıklamalı
- Geri sayım kullanıcının saat dilimine göre hesaplanır
- Tüm metinler Türkçe
- SEO için meta taglar eklenebilir
- PWA yapılabilir (manifest.json + service worker)

## 🎁 Bonus Özellikler

Eklenebilecek özellikler:
- 💌 E-posta bildirimleri
- 🎥 Video ekleme
- 🎵 Şarkı isteme formu
- 💰 Hediye listesi
- 🏨 Otel önerileri
- 🚗 Ulaşım bilgileri
- 📸 Instagram hashtag'i
- 💬 Canlı chat

## 📞 Destek

Sorularınız için: [GitHub Issues](https://github.com/username/repo/issues)

---

**💝 Mutlu Günler Dileriz!**
