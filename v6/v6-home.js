// Hemmings version 6 homepage: promotional slider, tabbed product grid, department columns. Runs after hm.js.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, P = HM.products, page = HM.page;
  var ids = function (list) { return list.map(HM.byId); };

  /* ---- slider ---- */
  var slider = $('slider'), slides = all('.t-slide', slider), cur = 0, timer;
  $('dots').innerHTML = slides.map(function (s, i) { return '<button type="button" aria-label="Slide ' + (i + 1) + '"></button>'; }).join('');
  var dots = all('button', $('dots'));
  function go(i, user) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
    clearTimeout(timer); if (!reduce && !user) timer = setTimeout(function () { go(cur + 1); }, 6000);
  }
  dots.forEach(function (d, k) { d.onclick = function () { go(k, true); }; });
  slider.querySelector('.t-arr.p').onclick = function () { go(cur - 1, true); };
  slider.querySelector('.t-arr.n').onclick = function () { go(cur + 1, true); };
  slider.addEventListener('mouseenter', function () { clearTimeout(timer); });
  slider.addEventListener('mouseleave', function () { go(cur); });
  go(0);

  /* ---- tabbed products ---- */
  var TABS = {
    best: ['Bestsellers', page('bedding'), ids(['sateen-sheet-set', 'quilted-comforter', 'washed-linen-duvet', 'bath-towel', 'velvet-cushion-cover', 'percale-sheet-set', 'knit-throw', 'sateen-pillowcases', 'washed-linen-curtain', 'heritage-bedspread'])],
    new: ['New Arrivals', page('new'), P.filter(function (p) { return p.tag === 'New'; }).concat(ids(['waffle-robe', 'cable-throw', 'boucle-cushion', 'pleated-linen-curtain']))],
    bedding: ['Bedding', page('bedding'), P.filter(function (p) { return p.dept === 'bedding'; })],
    bath: ['Bath', page('bath'), P.filter(function (p) { return p.dept === 'bath'; })],
    living: ['Living', page('living'), P.filter(function (p) { return (p.dept === 'living' || p.dept === 'cushions') && !p.out; })]
  };
  function fill(el, list, rows) {
    var cols = getComputedStyle(el).gridTemplateColumns.split(' ').length, n = Math.min(list.length, cols * rows); if (n > cols) n -= n % cols;
    el.innerHTML = list.slice(0, n).map(function (p, i) { return HM.card(p, i); }).join('');
  }
  var tab = 'best';
  function picks() { var t = TABS[tab]; fill($('pickGrid'), t[2], 2); $('pickAll').textContent = 'View All ' + t[0]; $('pickAll').href = t[1]; }
  $('pickTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; all('button', this).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); picks(); });
  function news() {
    fill($('newGrid'), ids(['sheer-linen-curtain', 'linen-cushion-cover', 'waffle-robe', 'wool-blanket', 'linen-sheet-set', 'ribbed-towel-set', 'cable-throw', 'boucle-cushion', 'sateen-duvet', 'soft-pillow']), 2);
    fill($('bathGrid'), ids(['bath-towel', 'ribbed-towel-set', 'waffle-robe', 'bath-sheet', 'hand-towel-pair', 'bath-mat']), 1);
    fill($('livGrid'), ids(['knit-throw', 'velvet-cushion-cover', 'linen-throw', 'sofa-cover-two', 'boucle-cushion', 'cable-throw', 'striped-cushion-cover', 'sofa-cover-three', 'linen-cushion-cover', 'waffle-blanket']), 2);
  }

  /* ---- promotional banners: the photograph drifts inside its frame as the page scrolls; the words stay where they are ---- */
  var plx = all('.plx'), tick = false;
  function drift() {
    tick = false; var vh = innerHeight;
    plx.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < -80 || r.top > vh + 80) return;
      var p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
      el.style.setProperty('--py', (-p * r.height * (+el.dataset.plx || .12)).toFixed(1) + 'px');
    });
  }
  if (!reduce) { addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(drift); } }, { passive: true }); addEventListener('resize', drift); drift(); }
  picks(); news();
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { picks(); news(); }, 150); });

  /* ---- department columns ---- */
  $('depts').innerHTML = ['bedding', 'bath', 'curtains', 'living'].map(function (k, i) {
    var D = HM.depts[k];
    return '<article class="t-dept rv" style="--d:' + (i * .07) + 's"><a class="t-dept-h" href="' + page(k) + '"><img src="img/' + D.img + '.jpg" alt="" loading="lazy"><b>' + D.t + '</b></a><ul>' +
      P.filter(function (p) { return p.dept === k && !p.out; }).slice(0, 3).map(function (p) { return '<li><a href="' + page('product') + '#' + p.id + '"><img src="img/' + p.img + '.jpg" alt="" loading="lazy"><span><b>' + HM.esc(p.n) + '</b><i>' + (p.sized ? 'From ' + HM.money(p.price.single) : HM.money(p.price)) + '</i></span></a></li>'; }).join('') +
      '</ul><a class="go" href="' + page(k) + '">View all ' + D.t.toLowerCase() + '</a></article>';
  }).join('');

  /* ---- signed in: the account prompt points at the account ---- */
  var u = HM.user.get();
  if (u) { $('joinA').textContent = 'My Orders'; $('joinA').href = page('account') + '#orders'; $('joinB').textContent = 'Account Overview'; $('joinB').href = page('account'); }
  HM.reveal();
})();
