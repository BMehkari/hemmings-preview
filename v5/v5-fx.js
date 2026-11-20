// Hemmings version 5: the effects layer over the version 4 homepage (styles in v5-fx.css). Runs after hm.js and v4-home.js.
// Scroll: progress line, header that hides on the way down, running fabric band, banners that widen, the pinned fabric story,
// rails that slide in, a breathing photo row, the footer wordmark. Pointer: hero depth, tilting tiles, magnetic buttons,
// a labelled pointer ring, draggable rails. All of it stands down for prefers-reduced-motion, and the pointer effects for touch.
(function () {
  var root = document.documentElement, $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---- headings: wrap each word so it can rise from behind a line ---- */
  function split(el) {
    var n = 0, wrap = document.createElement('span'); wrap.className = 'hw';
    (function walk(src, dst) {
      [].slice.call(src.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { dst.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'), i = document.createElement('i'); w.className = 'w'; i.style.setProperty('--i', n++); i.textContent = t; w.appendChild(i); dst.appendChild(w);
          });
        } else if (node.nodeType === 1) { var c = node.cloneNode(false); dst.appendChild(c); walk(node, c); }
      });
    })(el, wrap);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim()); el.textContent = ''; el.appendChild(wrap);
  }
  var heads = all('main .h, .slide h1, .slide .h1');
  heads.forEach(split);
  all('.why svg path').forEach(function (p) { p.setAttribute('pathLength', '1'); });
  var inv = all('main .h, .why');
  if (reduce || !('IntersectionObserver' in window)) inv.forEach(function (x) { x.classList.add('inv'); });
  else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('inv'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' }); inv.forEach(function (x) { io.observe(x); }); }

  /* ---- sheet tabs: the cards that remain step back in one after another ---- */
  $('tabs').addEventListener('click', function (e) {
    if (!e.target.closest('button')) return;
    all('#railSheets .card:not(.hide)').forEach(function (c, i) { c.classList.remove('pop'); c.style.setProperty('--n', i); void c.offsetWidth; c.classList.add('pop'); });
  });
  if (reduce) return;

  var bar = document.createElement('div'); bar.className = 'fx-bar'; document.body.appendChild(bar);
  var hd = $('hd'), hero = $('hero'), mq = $('mq'), story = $('story'), sList = all('#storyList li'), sImgs = all('#storyIm img'), sBar = $('storyBar');
  var bands = all('.band'), rails = all('.rail'), ugc = all('#ugcList li'), word = document.querySelector('.s-ft-word');
  var lastY = scrollY, mqX = 0, vel = 0, sIdx = -1;
  if (sImgs[0]) sImgs[0].classList.add('on');

  function frame() {
    var sy = scrollY, vh = innerHeight, max = root.scrollHeight - vh, dy = sy - lastY; lastY = sy;
    vel += (dy - vel) * .12;
    bar.style.setProperty('--p', max > 0 ? (sy / max).toFixed(4) : 0);
    // header: away on the way down, back on the way up (never while a menu is open)
    if (Math.abs(dy) > 2 && !document.querySelector('.s-nav > li.open')) hd.classList.toggle('hide', dy > 0 && sy > 300);
    hero.style.setProperty('--hs', clamp(sy / (vh * .7), 0, 1).toFixed(3));
    // fabric band: drifts on its own, hurries with the scroll and turns round when the page does
    if (mq) { mqX -= .6 + vel * .55; var half = mq.scrollWidth / 2 + 28; if (mqX < -half) mqX += half; if (mqX > 0) mqX -= half; mq.style.transform = 'translate3d(' + mqX.toFixed(1) + 'px,0,0)'; }
    bands.forEach(function (b) { var r = b.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; b.style.setProperty('--k', clamp((vh - r.top) / (vh * .75), 0, 1).toFixed(3)); });
    rails.forEach(function (el, i) { var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.setProperty('--rx', ((1 - clamp((vh - r.top) / (vh * .8), 0, 1)) * (i % 2 ? -140 : 140)).toFixed(1) + 'px'); });
    ugc.forEach(function (li, i) { var r = li.parentNode.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; li.style.setProperty('--u', (((r.top + r.height / 2) - vh / 2) / vh * (i % 2 ? 46 : -46)).toFixed(1) + 'px'); });
    if (story) {
      var sr = story.getBoundingClientRect(), p = clamp(-sr.top / (sr.height - vh), 0, 1), idx = Math.min(sList.length - 1, Math.floor(p * sList.length));
      sBar.style.setProperty('--sp', p.toFixed(3));
      if (idx !== sIdx) { sIdx = idx; sList.forEach(function (li, i) { li.classList.toggle('on', i === idx); }); sImgs.forEach(function (im, i) { im.classList.toggle('on', i <= idx); }); }
    }
    if (word) word.style.setProperty('--fw', (clamp((max - sy) / vh, 0, 1) * -160).toFixed(1) + 'px');
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // rails: drag with a mouse (touch already scrolls them)
  rails.forEach(function (rail) {
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.target.closest('button')) return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 6) { moved = true; rail.classList.add('drag'); } if (moved) rail.scrollLeft = sl - dx; });
    addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { rail.classList.remove('drag'); }, 0); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
  if (!fine) return;

  /* ---- pointer effects (mouse only) ---- */
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width - .5) * -26).toFixed(1) + 'px'); hero.style.setProperty('--my', (((e.clientY - r.top) / r.height - .5) * -16).toFixed(1) + 'px'); });
  hero.addEventListener('pointerleave', function () { hero.style.setProperty('--mx', '0px'); hero.style.setProperty('--my', '0px'); });

  // the pointer ring: names what a click will do over tiles, product pictures, banners and rails
  var cur = document.createElement('div'); cur.className = 'fx-cur'; cur.setAttribute('aria-hidden', 'true'); document.body.appendChild(cur);
  var label = [['.btn, .wish, .qa, .nb, .spot, .tabs, .hdots, .pick, .n', ''], ['.tile', 'Shop'], ['.card .ph', 'View'], ['.band', 'Explore'], ['.ugc li', 'Look'], ['.rail', 'Drag']];
  addEventListener('pointermove', function (e) {
    cur.style.setProperty('--x', e.clientX + 'px'); cur.style.setProperty('--y', e.clientY + 'px');
    var t = '', el = e.target;
    for (var i = 0; i < label.length; i++) if (el.closest && el.closest(label[i][0])) { t = label[i][1]; break; }
    if (cur.textContent !== t && t) cur.textContent = t;
    cur.classList.toggle('on', !!t);
  }, { passive: true });
  document.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
})();
