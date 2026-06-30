/* ============================================================
   Ortak Davet Modülü
   Her davetiyeye eklenen ortak özellikler:
   - Arka plan müziği (aç/kapa, dosyasız Web Audio melodisi)
   - Fotoğraf galerisi (otomatik slayt)
   - Aile isimleri bölümü
   - Hikayemiz (zaman tüneli) — sayfada yoksa eklenir
   - Paylaş butonu (WhatsApp / link)
   - Takvime Ekle (.ics) — sayfada yoksa eklenir
   Yapılandırma: window.DAVET nesnesi (her davet dosyasında tanımlı)
   ============================================================ */
(function () {
  var D = window.DAVET || {};
  var dark = !!D.dark;
  var accent = D.accent || '#b08d28';
  var accentSoft = D.accentSoft || '#e6d4a8';

  /* ---- Tema değişkenleri ---- */
  var v = {
    accent: accent,
    accentSoft: accentSoft,
    text: dark ? '#e8e6df' : '#4a443c',
    sub: dark ? '#aaa597' : '#7b7264',
    surface: dark ? 'rgba(255,255,255,.05)' : '#ffffff',
    border: dark ? 'rgba(255,255,255,.14)' : (accentSoft),
    secBg: dark ? 'transparent' : 'rgba(0,0,0,.015)'
  };

  /* ---- Stiller ---- */
  var css = '' +
  '.dx-sec{padding:70px 28px;text-align:center;position:relative;opacity:0;transform:translateY(34px);transition:opacity .9s ease,transform .9s ease}' +
  '.dx-sec.dx-show{opacity:1;transform:none}' +
  '.dx-sec h2{font-family:inherit;font-size:32px;font-weight:600;color:' + v.accent + ';margin:0 0 6px}' +
  '.dx-sub{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:' + v.sub + ';margin-bottom:28px}' +
  /* galeri */
  '.dx-gal{max-width:560px;margin:0 auto;position:relative;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.18);background:' + v.surface + ';border:1px solid ' + v.border + '}' +
  '.dx-gal .dx-slide{position:absolute;inset:0;opacity:0;transition:opacity 1s ease;background-size:cover;background-position:center}' +
  '.dx-gal .dx-slide.dx-on{opacity:1}' +
  '.dx-gal .dx-frame{padding-top:66%}' +
  '.dx-dots{display:flex;gap:8px;justify-content:center;margin-top:16px}' +
  '.dx-dots span{width:9px;height:9px;border-radius:50%;background:' + v.border + ';cursor:pointer;transition:.3s}' +
  '.dx-dots span.dx-on{background:' + v.accent + ';transform:scale(1.25)}' +
  '.dx-gal-note{font-size:12px;color:' + v.sub + ';margin-top:14px}' +
  /* aile */
  '.dx-fam{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;max-width:600px;margin:0 auto}' +
  '.dx-fam .dx-card{flex:1;min-width:210px;max-width:280px;background:' + v.surface + ';border:1px solid ' + v.border + ';border-radius:16px;padding:26px 22px}' +
  '.dx-fam .dx-side{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:' + v.sub + ';margin-bottom:8px}' +
  '.dx-fam .dx-names{font-size:20px;color:' + v.text + ';line-height:1.5}' +
  '.dx-fam .dx-heart{color:' + v.accent + ';font-size:22px;margin:14px 0 0}' +
  /* hikaye */
  '.dx-tl{max-width:520px;margin:0 auto;text-align:left;position:relative;padding-left:34px}' +
  '.dx-tl::before{content:"";position:absolute;left:9px;top:6px;bottom:6px;width:2px;background:' + v.border + '}' +
  '.dx-tl .dx-it{position:relative;margin-bottom:26px}' +
  '.dx-tl .dx-it::before{content:"";position:absolute;left:-31px;top:4px;width:13px;height:13px;border-radius:50%;background:' + v.accent + '}' +
  '.dx-tl .dx-it h4{margin:0;font-size:20px;color:' + v.accent + '}' +
  '.dx-tl .dx-it .dx-when{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + v.sub + '}' +
  '.dx-tl .dx-it p{margin:4px 0 0;font-size:15px;color:' + v.sub + ';line-height:1.6}' +
  /* eylem butonları */
  '.dx-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px}' +
  '.dx-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:40px;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;cursor:pointer;border:1px solid ' + v.accent + ';background:transparent;color:' + v.accent + ';font-family:inherit;font-weight:600;transition:.3s}' +
  '.dx-btn:hover{background:' + v.accent + ';color:' + (dark ? '#14110f' : '#fff') + '}' +
  /* yüzen butonlar */
  '.dx-fab{position:fixed;right:18px;z-index:9999;width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;background:' + v.accent + ';color:' + (dark ? '#14110f' : '#fff') + ';font-size:20px;box-shadow:0 8px 22px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;transition:transform .25s}' +
  '.dx-fab:hover{transform:scale(1.08)}' +
  '.dx-fab.dx-music{bottom:20px}' +
  '.dx-fab.dx-share{bottom:80px}' +
  '.dx-music.dx-playing{animation:dxspin 4s linear infinite}' +
  '@keyframes dxspin{to{transform:rotate(360deg)}}' +
  '.dx-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:' + v.accent + ';color:#fff;padding:12px 22px;border-radius:30px;font-size:13px;z-index:10000;opacity:0;transition:.3s;pointer-events:none}' +
  '.dx-toast.dx-show{opacity:1;transform:translateX(-50%) translateY(0)}' +
  /* ====== MOBİL UYUM (tüm davetlere uygulanır) ====== */
  '@media(max-width:560px){' +
    'section{padding:52px 18px}' +
    '.dx-sec{padding:52px 18px}' +
    '.countdown{gap:9px}' +
    '.cd-box{min-width:0;flex:1 1 60px;padding:14px 4px}' +
    '.cd-num{font-size:32px}' +
    '.cd-lab{font-size:10px;letter-spacing:1px}' +
    '.cards{gap:12px}' +
    '.card{min-width:100%;max-width:100%}' +
    '.rsvp-card{padding:28px 18px}' +
    '.dx-fam .dx-card{min-width:100%;max-width:100%}' +
    '.map-frame iframe{height:260px}' +
    '.btnrow .btn,.dx-actions .dx-btn{flex:1 1 auto;justify-content:center}' +
    '.dx-fab{width:44px;height:44px;font-size:17px;right:14px}' +
    '.dx-fab.dx-music{bottom:16px}.dx-fab.dx-share{bottom:70px}' +
    '.dx-gal{max-width:100%}' +
    '.timeline,.dx-tl{padding-left:30px}' +
    '.choice{flex-direction:column;gap:8px}' +
    '.choice button{width:100%;min-width:0;padding:14px;font-size:14px;text-align:center}' +
  '}' +
  '@media(max-width:380px){' +
    '.cd-num{font-size:26px}' +
    '.cards .card{border-right:none}' +
  '}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var footer = document.querySelector('footer') || document.body;

  /* ---- Hikayemiz (sayfada zaten yoksa) ---- */
  if ((!document.querySelector('.tl') && !document.querySelector('.timeline')) &&
       D.story && D.story.length) {
    var sSec = el('section', 'dx-sec');
    sSec.appendChild(el('h2', null, 'Hikayemiz'));
    sSec.appendChild(el('div', 'dx-sub', 'Nasıl başladı?'));
    var tl = el('div', 'dx-tl');
    D.story.forEach(function (s) {
      var it = el('div', 'dx-it');
      it.innerHTML = '<div class="dx-when">' + (s.when || '') + '</div><h4>' + (s.title || '') +
                     '</h4><p>' + (s.text || '') + '</p>';
      tl.appendChild(it);
    });
    sSec.appendChild(tl);
    /* hikayeyi giriş bölümünün hemen ardına koy */
    var lead = document.querySelector('.lead');
    var anchor = lead ? lead.closest('section') : null;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sSec, anchor.nextSibling);
    else footer.parentNode.insertBefore(sSec, footer);
  }

  /* ---- Fotoğraf Galerisi ---- */
  if (D.photos && D.photos.length) {
    var gSec = el('section', 'dx-sec');
    gSec.appendChild(el('h2', null, 'Fotoğraf Galerisi'));
    gSec.appendChild(el('div', 'dx-sub', 'Birlikte güzel anlar'));
    var gal = el('div', 'dx-gal');
    gal.appendChild(el('div', 'dx-frame'));
    D.photos.forEach(function (src, i) {
      var sl = el('div', 'dx-slide' + (i === 0 ? ' dx-on' : ''));
      sl.style.backgroundImage = 'url("' + src + '")';
      gal.appendChild(sl);
    });
    gSec.appendChild(gal);
    var dots = el('div', 'dx-dots');
    D.photos.forEach(function (_, i) {
      var dot = el('span', i === 0 ? 'dx-on' : '');
      dot.addEventListener('click', function () { go(i); });
      dots.appendChild(dot);
    });
    gSec.appendChild(dots);
    gSec.appendChild(el('div', 'dx-gal-note', 'Fotoğrafları değiştirmek için DAVET.photos bağlantılarını güncelleyin.'));
    footer.parentNode.insertBefore(gSec, footer);

    var slides = gal.querySelectorAll('.dx-slide');
    var ds = dots.querySelectorAll('span');
    var cur = 0, timer;
    function go(i) {
      slides[cur].classList.remove('dx-on'); ds[cur].classList.remove('dx-on');
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add('dx-on'); ds[cur].classList.add('dx-on');
      restart();
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 3800); }
    restart();
  }

  /* ---- Aile İsimleri ---- */
  if (D.families && D.families.length) {
    var fSec = el('section', 'dx-sec');
    fSec.appendChild(el('h2', null, 'Ailelerimiz'));
    fSec.appendChild(el('div', 'dx-sub', 'Mutluluğumuzu paylaşan'));
    var fam = el('div', 'dx-fam');
    D.families.forEach(function (f) {
      var c = el('div', 'dx-card');
      c.innerHTML = '<div class="dx-side">' + (f.side || '') + ' Ailesi</div><div class="dx-names">' +
                    (f.names || '') + '</div>';
      fam.appendChild(c);
    });
    fSec.appendChild(fam);
    fSec.appendChild(el('div', 'dx-heart', '♥'));
    footer.parentNode.insertBefore(fSec, footer);
  }

  /* ---- Takvime Ekle + Paylaş (sayfada yoksa, galeri/aile altına) ---- */
  function fmtICS(d) { return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; }
  function downloadICS() {
    var start = new Date(D.date), end = new Date(start.getTime() + 5 * 3600000);
    var ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:' + fmtICS(start) +
      '\nDTEND:' + fmtICS(end) + '\nSUMMARY:' + (D.couple || '') + ' Düğünü\nLOCATION:' +
      (D.venue || '') + '\nDESCRIPTION:Düğünümüze davetlisiniz!\nEND:VEVENT\nEND:VCALENDAR';
    var a = el('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'dugun.ics'; a.click();
    toast('Takvim dosyası indirildi');
  }
  function doShare() {
    var data = { title: (D.couple || '') + ' Düğün Davetiyesi',
                 text: (D.couple || '') + ' düğününe davetlisiniz!', url: location.href };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else { window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + location.href), '_blank'); }
  }

  /* eğer sayfada zaten takvim butonu yoksa bir eylem satırı ekle */
  if (!document.getElementById('calBtn') && D.date) {
    var aSec = el('section', 'dx-sec');
    aSec.appendChild(el('h2', null, 'Bu Günü Kaçırmayın'));
    aSec.appendChild(el('div', 'dx-sub', 'Takvime ekleyin veya paylaşın'));
    var row = el('div', 'dx-actions');
    var cb = el('button', 'dx-btn', '📅 Takvime Ekle'); cb.addEventListener('click', downloadICS);
    var sb = el('button', 'dx-btn', '🔗 Paylaş'); sb.addEventListener('click', doShare);
    row.appendChild(cb); row.appendChild(sb);
    aSec.appendChild(row);
    footer.parentNode.insertBefore(aSec, footer);
  }

  /* ---- Yüzen Paylaş butonu ---- */
  var shareFab = el('button', 'dx-fab dx-share', '🔗');
  shareFab.title = 'Paylaş'; shareFab.addEventListener('click', doShare);
  document.body.appendChild(shareFab);

  /* ---- Arka Plan Müziği (Web Audio, dosyasız) ---- */
  var musicFab = el('button', 'dx-fab dx-music', '🎵');
  musicFab.title = 'Müziği aç/kapat';
  document.body.appendChild(musicFab);

  var actx = null, playing = false, loop = null, master = null;
  /* yumuşak akor arpejleri (Hz) */
  var seq = [
    [392.00, 493.88, 587.33], /* G  */
    [329.63, 392.00, 493.88], /* Em */
    [261.63, 329.63, 392.00], /* C  */
    [293.66, 369.99, 440.00]  /* D  */
  ];
  var step = 0;
  function note(freq, t, dur) {
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function playChord() {
    if (!actx) return;
    var t = actx.currentTime, chord = seq[step % seq.length];
    chord.forEach(function (f, i) { note(f, t + i * 0.16, 1.6); });
    note(chord[0] / 2, t, 1.8); /* bas */
    step++;
  }
  var audioEl = null;
  function startMusic() {
    // DAVET.musicUrl varsa MP3 çal
    if (D.musicUrl) {
      if (!audioEl) { audioEl = new Audio(); audioEl.loop = true; }
      audioEl.src = D.musicUrl;
      audioEl.play().catch(function () {});
      playing = true; musicFab.classList.add('dx-playing'); musicFab.textContent = '🔊';
      return;
    }
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    master = actx.createGain(); master.gain.value = 0.5; master.connect(actx.destination);
    playChord(); loop = setInterval(playChord, 1700);
    playing = true; musicFab.classList.add('dx-playing'); musicFab.textContent = '🔊';
  }
  function stopMusic() {
    clearInterval(loop);
    if (audioEl) { try { audioEl.pause(); } catch (e) {} }
    if (master && actx) { try { master.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.4); } catch (e) {} }
    playing = false; musicFab.classList.remove('dx-playing'); musicFab.textContent = '🎵';
  }
  musicFab.addEventListener('click', function () { playing ? stopMusic() : startMusic(); });

  /* ---- Toast ---- */
  var toastEl = el('div', 'dx-toast');
  document.body.appendChild(toastEl);
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('dx-show');
    setTimeout(function () { toastEl.classList.remove('dx-show'); }, 2200);
  }

  /* ---- Eklenen bölümler için görünürlük animasyonu ---- */
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('dx-show'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.dx-sec').forEach(function (s) { obs.observe(s); });
})();
