// Hemmings versions 4 and 5: homepage behaviour (product rails, hero slideshow, sheet tabs, colour preview, parallax, reveal).
// Runs after hm.js, which supplies the header, footer, palette control, bag and toast.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ARR = '<svg class="arr"><use href="#arrow"/></svg>', V5 = document.documentElement.dataset.v === '5';

  /* ---- sample products (ids match the shared sample catalogue in hm.js, so product pages and the bag work) ---- */
  var best = [
    { id: 'sateen-sheet-set', n: 'Sateen Sheet Set', mat: 'Cotton sateen', p: 5200, from: 1, img: 'r_sheets', img2: 'r_duvet', tag: 'Bestseller', sw: ['#F4F0E6', '#CDB894', '#9DAA94'] },
    { id: 'quilted-comforter', n: 'Diamond Quilted Comforter', mat: 'Cotton sateen', p: 9800, from: 1, img: 'r_quilt', img2: 'r_bedding', sw: ['#F4F0E6', '#9DAA94', '#CDB894'] },
    { id: 'washed-linen-duvet', n: 'Washed Linen Duvet Cover', mat: 'Washed linen', p: 11500, from: 1, img: 'r_duvet', img2: 'r_comfort', tag: 'New', sw: ['#DDD2BC', '#B98566', '#3A3D38'] },
    { id: 'heritage-bedspread', n: 'Heritage Quilted Bedspread', mat: 'Cotton percale', p: 10800, from: 1, img: 'r_bedding', img2: 'r_quilt', sw: ['#DDD2BC', '#B9B2A3'] },
    { id: 'quilted-cushion', n: 'Quilted Sateen Cushion', mat: 'Cotton sateen', p: 3400, img: 'r_layering', img2: 'r_sofa1', sw: ['#F4F0E6', '#CDB894'] },
    { id: 'percale-sheet-set', n: 'Crisp Percale Sheet Set', mat: 'Cotton percale', p: 5600, from: 1, img: 'r_sheets2', img2: 'r_sheets', sw: ['#F4F0E6', '#AEBBC2', '#B9B2A3'] },
    { id: 'knit-throw', n: 'Chunky Knit Throw', mat: 'Wool blend', p: 7800, img: 'r_knit', img2: 'r_knit3', tag: 'New', sw: ['#DDD2BC', '#B9B2A3'] },
    { id: 'sateen-pillowcases', n: 'Sateen Pillowcase Pair', mat: 'Cotton sateen', p: 2400, img: 'r_pillows', img2: 'r_layering', sw: ['#F4F0E6', '#9DAA94', '#2F4F42', '#CDB894'] }
  ];
  // solid colours are a photograph of white sheets with a colour laid over it (t), until product photography arrives
  var sheets = [
    { id: 'percale-sheet-set', n: 'Classic White Percale Sheet Set', v: 'Ivory', mat: 'Cotton percale', p: 5600, img: 'r_sheets', f: 'solids cotton percale' },
    { id: 'percale-sheet-set', n: 'Sand Percale Sheet Set', v: 'Stone', mat: 'Cotton percale', p: 5600, img: 'r_duvet', t: '#E2D0B4', f: 'solids cotton percale' },
    { id: 'sateen-sheet-set', n: 'Blush Sateen Sheet Set', v: 'Sand', mat: 'Cotton sateen', p: 5200, img: 'r_sheets', t: '#EBCBC1', f: 'solids cotton sateen' },
    { id: 'percale-sheet-set', n: 'Stone Percale Sheet Set', v: 'Mist', mat: 'Cotton percale', p: 5600, img: 'r_sheets2', t: '#C3C7CE', f: 'solids cotton percale' },
    { id: 'sateen-sheet-set', n: 'Ivory Sateen Sheet Set', v: 'Ivory', mat: 'Cotton sateen', p: 6900, img: 'r_duvet', t: '#F3E8D2', f: 'solids cotton sateen luxury', tag: 'Ultra Luxury' },
    { id: 'percale-sheet-set', n: 'Woven Stripe Percale Sheet Set', v: 'Stone', mat: 'Cotton percale', p: 6200, img: 'r_pillows', f: 'prints cotton percale' },
    { id: 'sateen-sheet-set', n: 'Sage Sateen Sheet Set', v: 'Sage', mat: 'Cotton sateen', p: 5200, img: 'r_sheets2', t: '#C5D0B6', f: 'solids cotton sateen' },
    { id: 'linen-sheet-set', n: 'Washed Linen Sheet Set', v: 'Oat', mat: 'Washed linen', p: 9800, img: 'r_room', f: 'solids luxury', tag: 'Ultra Luxury' },
    { id: 'percale-sheet-set', n: 'Sage Stripe Percale Sheet Set', v: 'Stone', mat: 'Cotton percale', p: 6200, img: 'r_pillows', t: '#D3DCC6', f: 'prints cotton percale' }
  ];
  function card(p, i) {
    return '<article class="card" data-f="' + (p.f || '') + '">' +
      '<div class="ph' + (p.t ? ' tint" style="--t:' + p.t : '') + '"><img src="img/' + p.img + '.jpg" alt="" loading="lazy">' +
      (p.img2 ? '<img class="alt" src="img/' + p.img2 + '.jpg" alt="" loading="lazy">' : '') +
      (p.tag ? '<span class="tag">' + p.tag + '</span>' : '') +
      '<button class="wish" aria-pressed="false" aria-label="Save ' + p.n + ' to wishlist"><svg viewBox="0 0 24 24"><use href="#heart"/></svg></button>' +
      '<button class="qa" data-add="' + i + '">Quick Add</button></div>' +
      '<div class="meta"><span class="mat">' + p.mat + '</span><h3 class="nm"><a href="v4-product.html#' + p.id + '">' + p.n + '</a></h3>' +
      '<div class="row"><span class="pr">' + (p.from ? 'From ' : '') + HM.money(p.p) + '</span>' +
      (p.sw ? '<span class="sw" aria-label="' + p.sw.length + ' colours">' + p.sw.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' : '') + '</div></div></article>';
  }
  function rail(el, list) {
    el.innerHTML = list.map(card).join('');
    el._list = list;
    var w = el.parentNode;
    ['p', 'n'].forEach(function (d) {
      var b = document.createElement('button'); b.className = 'nb ' + d; b.setAttribute('aria-label', d === 'p' ? 'Previous products' : 'More products');
      b.innerHTML = ARR; b.onclick = function () { el.scrollBy({ left: (d === 'p' ? -1 : 1) * el.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' }); };
      w.appendChild(b);
    });
    var sync = function () { w.querySelector('.nb.p').disabled = el.scrollLeft < 8; w.querySelector('.nb.n').disabled = el.scrollLeft + el.clientWidth > el.scrollWidth - 8; };
    el.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); el._sync = sync; sync();
  }
  rail($('railBest'), best); rail($('railSheets'), sheets);

  // quick add: the same bag the inner pages read
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-add]'); if (!q) return;
    var p = q.closest('.rail')._list[+q.dataset.add], sized = !!p.from || /sheet-set/.test(p.id), variant = (p.v || 'Ivory') + (sized ? ', Queen' : '');
    var b = HM.bag.read(), key = p.id + '/' + variant + '/' + p.n, hit = b.filter(function (l) { return l.key === key; })[0];
    if (hit) hit.qty++; else b.push({ key: key, id: p.id, name: p.n, variant: variant, price: p.p, qty: 1, img: p.img });
    HM.bag.write(b); HM.toast('<span>Added: ' + p.n + '</span><a href="v4-bag.html">View bag</a>');
  });

  /* ---- hero slideshow ---- */
  var hero = $('hero'), slides = all('.slide', hero), dots = all('.hdots .d', hero), cur = 0, timer;
  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
    dots.forEach(function (d, k) { if (k === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    var im = slides[(cur + 1) % slides.length].querySelector('img'); if (im) im.loading = 'eager';
    clearTimeout(timer); if (hero.classList.contains('play')) timer = setTimeout(function () { go(cur + 1); }, 6500);
  }
  dots.forEach(function (d, k) { d.onclick = function () { go(k); }; });
  $('pp').onclick = function () { var on = hero.classList.toggle('play'); this.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow'); go(cur); };
  if (reduce) hero.classList.remove('play');
  go(0);

  /* ---- sheets by style ---- */
  var names = { all: 'All Sheets', solids: 'Solids', prints: 'Prints', luxury: 'Ultra Luxury', cotton: 'Cotton', percale: 'Percale', sateen: 'Sateen' };
  $('tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    all('button', this).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    var f = b.dataset.f, r = $('railSheets');
    all('.card', r).forEach(function (c) { c.classList.toggle('hide', f !== 'all' && c.dataset.f.split(' ').indexOf(f) < 0); });
    r.scrollLeft = 0; r._sync();
    $('sheetsCta').firstElementChild.textContent = 'Shop ' + names[f];
  });

  /* ---- make your own bed: colour preview ---- */
  $('pick').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    all('button', this).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    $('myoImg').style.setProperty('--t', b.dataset.t || 'transparent'); $('pickN').textContent = b.getAttribute('aria-label');
  });

  /* ---- parallax: pictures drift inside their frames, the ornaments drift behind the page ---- */
  var px = all('.px[data-plx]'), deco = all('.deco'), K = V5 ? 1.7 : 1, tick = false;
  function plx() {
    tick = false;
    var vh = innerHeight, sy = scrollY;
    px.forEach(function (el) {
      if (el.dataset.plx === 'hero') { if (sy < vh * 1.2) el.style.setProperty('--py', (sy * (V5 ? .3 : .2)).toFixed(1) + 'px'); return; }
      var r = el.parentNode.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
      var max = r.height * .085, y = ((r.top + r.height / 2) - vh / 2) * -(+el.dataset.plx) * K;
      el.style.setProperty('--py', Math.max(-max, Math.min(max, y)).toFixed(1) + 'px');
    });
    deco.forEach(function (el, i) { el.style.transform = 'translate3d(0,' + (sy * +el.dataset.drift * K).toFixed(1) + 'px,0) rotate(' + ((i % 2 ? -1 : 1) * sy * .004).toFixed(2) + 'deg)'; });
  }
  if (!reduce) { addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(plx); } }, { passive: true }); addEventListener('resize', plx); plx(); }

  /* ---- hover effects that follow the pointer (mouse only): tilting tiles, buttons that lean toward the pointer ---- */
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    all('.tile').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        if (!t.classList.contains('in')) return;
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, big = t.classList.contains('big') ? 3 : 7;
        t.classList.add('tilt'); t.style.transform = 'rotateY(' + ((x - .5) * big).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * big).toFixed(2) + 'deg) translateZ(0)';
        t.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); t.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      t.addEventListener('pointerleave', function () { t.classList.remove('tilt'); t.style.transform = ''; });
    });

    all('main .btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1), background .3s, color .3s'; b.style.transform = ''; setTimeout(function () { b.style.transition = ''; }, 500); });
    });
  }

  /* ---- reveal on scroll ---- */
  var rv = all('.rv');
  if (reduce || !('IntersectionObserver' in window)) rv.forEach(function (x) { x.classList.add('in'); });
  else { var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' }); rv.forEach(function (x) { io.observe(x); }); }
})();
