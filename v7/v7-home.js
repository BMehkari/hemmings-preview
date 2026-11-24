// Hemmings version 7 homepage: product selections, the index of the house (each line shows its room), slow parallax. Runs after hm.js.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = function (el, list) { el.innerHTML = list.map(function (id, i) { return HM.card(HM.byId(id), i); }).join(''); };
  cards($('selGrid'), ['washed-linen-duvet', 'sateen-sheet-set', 'heritage-bedspread', 'knit-throw', 'quilted-comforter', 'percale-sheet-set', 'velvet-cushion-cover', 'washed-linen-curtain']);
  cards($('bathGrid'), ['bath-towel', 'waffle-robe', 'ribbed-towel-set', 'bath-sheet']);
  cards($('newGrid'), ['sheer-linen-curtain', 'linen-cushion-cover', 'cable-throw', 'linen-sheet-set', 'boucle-cushion', 'pleated-linen-curtain']);

  /* promotional banners: the photograph drifts inside its frame as the page scrolls; the words stay where they are */
  var plx = all('.plx');
  function drift() {
    var vh = innerHeight;
    plx.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < -80 || r.top > vh + 80) return;
      var p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
      el.style.setProperty('--py', (-p * r.height * (+el.dataset.plx || .16)).toFixed(1) + 'px');
    });
  }

  /* the index: pointing at a line brings its photograph forward */
  var idx = $('idx'), frame = $('idxIm'), links = all('a', idx);
  frame.innerHTML = links.map(function (a, i) { return '<img src="img/' + a.dataset.im + '.jpg" alt="" loading="lazy"' + (i ? '' : ' class="on"') + '>'; }).join('');
  var ims = all('img', frame);
  links.forEach(function (a, i) {
    var show = function () { all('li', idx).forEach(function (li, k) { li.classList.toggle('on', k === i); }); ims.forEach(function (im, k) { im.classList.toggle('on', k === i); }); };
    a.addEventListener('pointerenter', show); a.addEventListener('focus', show);
  });

  /* slow parallax: the opening photograph and the story photograph drift as the page moves */
  var hero = $('heroIm'), story = $('storyIm'), tick = false;
  function move() {
    tick = false; var y = scrollY, vh = innerHeight;
    if (y < vh * 1.2) { hero.style.setProperty('--y', (y * .22).toFixed(1) + 'px'); hero.parentNode.style.setProperty('--f', Math.min(1, y / (vh * .7)).toFixed(3)); }
    var r = story.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) story.style.setProperty('--y', (((r.top + r.height / 2) - vh / 2) * -.07).toFixed(1) + 'px');
    drift();
  }
  if (!reduce) addEventListener('resize', drift);
  if (!reduce) { addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(move); } }, { passive: true }); move(); }
  setTimeout(function () { $('hero').classList.add('in'); }, 60);

  if (HM.user.get()) { $('servAcc').textContent = 'My Orders'; $('servAcc').href = HM.page('account') + '#orders'; }
  HM.reveal();
})();
