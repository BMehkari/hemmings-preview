// Hemmings inner pages: shared catalogue, bag, palette, page chrome and page logic for both design versions.
// The version comes from <html data-v="1|2|3">; each version has its own stylesheet, page chrome and layout.
// SAMPLE DATA: product names, prices, specifications and stock are illustrative, modelled on a typical
// premium bedding range. The store catalogue replaces this list.
(function () {
  var root = document.documentElement, V = +root.dataset.v >= 1 && +root.dataset.v <= 5 ? +root.dataset.v : 2, $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var HM = window.HM = { v: V };
  var page = function (n) { return 'v' + (V === 5 ? 4 : V) + '-' + n + '.html'; }, local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  // Deployed, each version's homepage is its folder's index page; in the source folder v2 and v3 are v2.html and v3.html.
  var home = V === 1 || !local ? 'index.html' : 'index.html';
  HM.money = function (n) { return 'Rs. ' + n.toLocaleString('en-PK'); };

  var C = { ivory: { n: 'Ivory', h: '#F4F0E6', f: 'neutral' }, oat: { n: 'Oat', h: '#DDD2BC', f: 'neutral' }, stone: { n: 'Stone', h: '#B9B2A3', f: 'neutral' }, sage: { n: 'Sage', h: '#9DAA94', f: 'green' }, forest: { n: 'Forest', h: '#2F4F42', f: 'green' }, clay: { n: 'Clay', h: '#B98566', f: 'earth' }, sand: { n: 'Sand', h: '#CDB894', f: 'earth' }, mist: { n: 'Mist', h: '#AEBBC2', f: 'blue' }, char: { n: 'Charcoal', h: '#3A3D38', f: 'dark' } };
  var S = function (a, b, c) { return { single: a, queen: b, king: c }; };
  HM.depts = {
    bedding: { t: 'Bedding', d: 'Sheets, duvet covers and layers in long-staple cotton and washed linen, in a palette made to be mixed.', img: 'r_bedding', sized: true, cats: [['all', 'All bedding'], ['sheets', 'Bedsheets'], ['duvets', 'Duvet Covers'], ['comforters', 'Comforters & Quilts'], ['blankets', 'Blankets'], ['pillows', 'Pillows']] },
    bath: { t: 'Bath', d: 'Towels, mats and robes in dense, absorbent cotton that softens with every wash.', img: 'r_towels', cats: [['all', 'All bath'], ['towels', 'Towels'], ['mats', 'Bath Mats'], ['robes', 'Robes']] },
    curtains: { t: 'Curtains', d: 'Sheer, linen and lined curtains that filter the light and finish the room.', img: 'r_curtain', cats: [['all', 'All curtains'], ['sheer', 'Sheer'], ['linen', 'Linen'], ['lined', 'Lined & Blackout']] },
    cushions: { t: 'Cushions', d: 'Cushions and covers in velvet, linen and boucle, to layer on the bed or the sofa.', img: 'r_cushion', cats: [['all', 'All cushions'], ['covers', 'Cushion Covers'], ['filled', 'Filled Cushions']] },
    living: { t: 'Living', d: 'Throws and sofa covers for the rooms where the day slows down.', img: 'r_living', cats: [['all', 'All living'], ['throws', 'Throws'], ['sofa', 'Sofa Covers']] },
    new: { t: 'New Arrivals', d: 'The newest pieces across bedding, bath, curtains, cushions and living.', img: 'r_layering', cats: [['all', 'All new arrivals']] }
  };
  HM.products = [
    { id: 'washed-linen-duvet', n: 'Washed Linen Duvet Cover', col: 'Washed Linen', cat: 'duvets', mat: 'Washed linen', price: S(11500, 14500, 16800), c: ['oat', 'clay', 'char'], img: 'r_duvet', img2: 'r_comfort', tag: 'New', d: 'Stone-washed for a soft, lived-in hand from the first night. Finished with a hidden button closure and inner corner ties.' },
    { id: 'sateen-duvet', n: 'Sateen Duvet Cover', col: 'Sateen Classics', cat: 'duvets', mat: 'Cotton sateen', price: S(7800, 9800, 11200), c: ['ivory', 'sage', 'forest'], img: 'r_comfort', img2: 'r_sheets', d: 'A smooth, quietly lustrous sateen that drapes close and feels cool to the touch.' },
    { id: 'percale-sheet-set', n: 'Crisp Percale Sheet Set', col: 'Sateen Classics', cat: 'sheets', mat: 'Cotton percale', price: S(5600, 7400, 8400), c: ['ivory', 'mist', 'stone'], img: 'r_sheets2', img2: 'r_sheets', d: 'Matte, breathable and crisp, like a freshly pressed shirt. Fitted sheet, flat sheet and two pillowcases.' },
    { id: 'sateen-sheet-set', n: 'Sateen Sheet Set', col: 'Sateen Classics', cat: 'sheets', mat: 'Cotton sateen', price: S(5200, 6900, 7900), c: ['ivory', 'sand', 'sage'], img: 'r_sheets', img2: 'r_duvet', tag: 'New', d: 'Long-staple cotton in a sateen weave for a soft, smooth finish. Fitted sheet, flat sheet and two pillowcases.' },
    { id: 'linen-sheet-set', n: 'Washed Linen Sheet Set', col: 'Washed Linen', cat: 'sheets', mat: 'Washed linen', price: S(9800, 12600, 14400), c: ['oat', 'clay'], img: 'r_room', img2: 'r_fabric', d: 'Airy linen that softens with every wash. Fitted sheet, flat sheet and two pillowcases.' },
    { id: 'quilted-comforter', n: 'Diamond Quilted Comforter', col: 'Sateen Classics', cat: 'comforters', mat: 'Cotton sateen', price: S(9800, 12400, 14200), c: ['ivory', 'sage', 'sand'], img: 'r_quilt', img2: 'r_bedding', d: 'A light, evenly filled comforter stitched in a fine diamond pattern.' },
    { id: 'heritage-bedspread', n: 'Heritage Quilted Bedspread', col: 'Heritage Weave', cat: 'comforters', mat: 'Cotton percale', price: S(10800, 13600, 15400), c: ['oat', 'stone'], img: 'r_bedding', img2: 'r_quilt', d: 'A generous bedspread with a matelassé-style quilted face, made to fall to the floor.' },
    { id: 'wool-blanket', n: 'Brushed Wool Blanket', col: 'Heritage Weave', cat: 'blankets', mat: 'Wool blend', price: S(8200, 9900, 11400), c: ['stone', 'char'], img: 'r_blankets', img2: 'r_knit', d: 'Brushed on both faces for warmth without weight.' },
    { id: 'waffle-blanket', n: 'Waffle Cotton Blanket', col: 'Washed Linen', cat: 'blankets', mat: 'Cotton', price: S(5400, 6800, 7600), c: ['oat', 'forest', 'clay'], img: 'r_knit', img2: 'r_blankets', d: 'A deep waffle weave that traps air, for a layer that works in every season.' },
    { id: 'fringed-throw', n: 'Fringed Cotton Throw', col: 'Heritage Weave', dept: 'living', cat: 'throws', mat: 'Cotton', price: 6400, c: ['oat', 'sand'], img: 'r_throw', img2: 'r_knit', out: true, d: 'A loosely woven throw with a hand-knotted fringe.' },
    { id: 'soft-pillow', n: 'Soft Support Pillow', col: 'Sateen Classics', cat: 'pillows', mat: 'Down alternative', price: 2800, c: ['ivory'], img: 'r_layering', img2: 'r_pillows', d: 'A plush, even fill in a cotton shell. Suits front and back sleepers.' },
    { id: 'sateen-pillowcases', n: 'Sateen Pillowcase Pair', col: 'Sateen Classics', cat: 'pillows', mat: 'Cotton sateen', price: 2400, c: ['ivory', 'sage', 'forest', 'sand'], img: 'r_pillows', img2: 'r_layering', d: 'A pair of envelope-closure pillowcases in smooth cotton sateen.' },

    { id: 'bath-towel', n: 'Combed Cotton Bath Towel', col: 'Soft Essentials', dept: 'bath', cat: 'towels', mat: 'Combed cotton', price: 2200, c: ['ivory', 'stone', 'sage'], img: 'r_towels', img2: 'r_bath2', tag: 'New', d: 'A dense, quick-drying loop pile with a flat woven border.' },
    { id: 'hand-towel-pair', n: 'Hand Towel Pair', col: 'Soft Essentials', dept: 'bath', cat: 'towels', mat: 'Combed cotton', price: 1600, c: ['ivory', 'sage', 'char'], img: 'r_care', img2: 'r_bath4', d: 'Two hand towels in the same dense loop as the bath towel.' },
    { id: 'bath-sheet', n: 'Oversized Bath Sheet', col: 'Soft Essentials', dept: 'bath', cat: 'towels', mat: 'Combed cotton', price: 3400, c: ['ivory', 'stone'], img: 'r_bath3', img2: 'r_towels', d: 'A generous sheet for wrapping up completely.' },
    { id: 'ribbed-towel-set', n: 'Ribbed Towel Set', col: 'Soft Essentials', dept: 'bath', cat: 'towels', mat: 'Cotton', price: 5800, c: ['sage', 'ivory'], img: 'r_bath4', img2: 'r_bath5', d: 'Bath towel, hand towel and face cloth with a ribbed texture.' },
    { id: 'bath-mat', n: 'Tufted Cotton Bath Mat', col: 'Soft Essentials', dept: 'bath', cat: 'mats', mat: 'Cotton', price: 2600, c: ['stone', 'char'], img: 'r_bath2', img2: 'r_bath3', d: 'Thick tufted cotton that stays soft underfoot.' },
    { id: 'waffle-robe', n: 'Waffle Cotton Robe', col: 'Soft Essentials', dept: 'bath', cat: 'robes', mat: 'Cotton', price: 6900, c: ['ivory', 'oat'], img: 'r_bath5', img2: 'r_care', d: 'A light waffle-weave robe with deep pockets and a shawl collar.' },

    { id: 'sheer-linen-curtain', n: 'Sheer Linen Curtain', col: 'Washed Linen', dept: 'curtains', cat: 'sheer', mat: 'Linen blend', price: 7200, c: ['ivory', 'oat'], img: 'r_curtain', img2: 'r_cur6', tag: 'New', d: 'A fine, open weave that softens daylight without closing the room. Sold as a pair.' },
    { id: 'cotton-voile-curtain', n: 'Cotton Voile Curtain', col: 'Soft Essentials', dept: 'curtains', cat: 'sheer', mat: 'Cotton', price: 5400, c: ['ivory'], img: 'r_cur6', img2: 'r_window', d: 'Light cotton voile with a gentle drape. Sold as a pair.' },
    { id: 'washed-linen-curtain', n: 'Washed Linen Curtain', col: 'Washed Linen', dept: 'curtains', cat: 'linen', mat: 'Washed linen', price: 9200, c: ['oat', 'sand', 'sage'], img: 'r_curtain2', img2: 'r_cur4', d: 'Stone-washed linen that pools softly on the floor. Sold as a pair.' },
    { id: 'pleated-linen-curtain', n: 'Pleated Linen Curtain', col: 'Washed Linen', dept: 'curtains', cat: 'linen', mat: 'Washed linen', price: 10400, c: ['oat', 'stone'], img: 'r_cur5', img2: 'r_window', d: 'Pinch-pleated heading for full, even folds. Sold as a pair.' },
    { id: 'blackout-curtain', n: 'Lined Blackout Curtain', col: 'Heritage Weave', dept: 'curtains', cat: 'lined', mat: 'Cotton', price: 11800, c: ['stone', 'char'], img: 'r_cur3', img2: 'r_cur7', d: 'A heavy cotton face with a blackout lining for the bedroom. Sold as a pair.' },
    { id: 'textured-curtain', n: 'Textured Weave Curtain', col: 'Heritage Weave', dept: 'curtains', cat: 'lined', mat: 'Cotton', price: 9800, c: ['mist', 'stone'], img: 'r_cur7', img2: 'r_cur5', d: 'A slubbed weave with a cotton lining. Sold as a pair.' },

    { id: 'velvet-cushion-cover', n: 'Velvet Cushion Cover', col: 'Heritage Weave', dept: 'cushions', cat: 'covers', mat: 'Cotton velvet', price: 2600, c: ['forest', 'sand', 'clay'], img: 'r_cushion', img2: 'r_sofa1', d: 'Dense cotton velvet with a concealed zip.' },
    { id: 'linen-cushion-cover', n: 'Washed Linen Cushion Cover', col: 'Washed Linen', dept: 'cushions', cat: 'covers', mat: 'Washed linen', price: 2200, c: ['oat', 'sage'], img: 'r_sofa3', img2: 'r_sofa2', tag: 'New', d: 'Soft washed linen with a self-piped edge.' },
    { id: 'striped-cushion-cover', n: 'Woven Stripe Cushion Cover', col: 'Heritage Weave', dept: 'cushions', cat: 'covers', mat: 'Cotton', price: 2400, c: ['stone', 'ivory'], img: 'r_pillows', img2: 'r_layering', d: 'A broad woven stripe in two quiet tones.' },
    { id: 'boucle-cushion', n: 'Boucle Cushion', col: 'Heritage Weave', dept: 'cushions', cat: 'filled', mat: 'Wool blend', price: 3800, c: ['ivory', 'stone'], img: 'r_chair', img2: 'r_cushion', d: 'A looped boucle face, supplied filled.' },
    { id: 'quilted-cushion', n: 'Quilted Sateen Cushion', col: 'Sateen Classics', dept: 'cushions', cat: 'filled', mat: 'Cotton sateen', price: 3400, c: ['ivory', 'sand'], img: 'r_layering', img2: 'r_sofa1', d: 'Channel-quilted sateen, supplied filled.' },

    { id: 'knit-throw', n: 'Chunky Knit Throw', col: 'Heritage Weave', dept: 'living', cat: 'throws', mat: 'Wool blend', price: 7800, c: ['oat', 'stone'], img: 'r_knit', img2: 'r_knit3', tag: 'New', d: 'A heavy, open knit for the end of the bed or the arm of a sofa.' },
    { id: 'cable-throw', n: 'Cable Knit Throw', col: 'Heritage Weave', dept: 'living', cat: 'throws', mat: 'Cotton', price: 6900, c: ['sand', 'char'], img: 'r_knit2', img2: 'r_knit3', d: 'A close cable knit in soft cotton.' },
    { id: 'linen-throw', n: 'Fringed Linen Throw', col: 'Washed Linen', dept: 'living', cat: 'throws', mat: 'Washed linen', price: 5600, c: ['ivory', 'oat'], img: 'r_throw2', img2: 'r_chair', d: 'A light linen throw finished with a knotted fringe.' },
    { id: 'sofa-cover-two', n: 'Fitted Sofa Cover, Two Seater', col: 'Soft Essentials', dept: 'living', cat: 'sofa', mat: 'Cotton', price: 12500, c: ['stone', 'oat'], img: 'r_sofa1', img2: 'r_living', d: 'A tailored cotton cover with elasticated hems.' },
    { id: 'sofa-cover-three', n: 'Fitted Sofa Cover, Three Seater', col: 'Soft Essentials', dept: 'living', cat: 'sofa', mat: 'Cotton', price: 15500, c: ['stone', 'oat', 'char'], img: 'r_living', img2: 'r_sofa3', d: 'A tailored cotton cover with elasticated hems.' },
    { id: 'sofa-cover-corner', n: 'Fitted Sofa Cover, Corner', col: 'Soft Essentials', dept: 'living', cat: 'sofa', mat: 'Cotton', price: 19500, c: ['stone'], img: 'r_sofa3', img2: 'r_sofa2', out: true, d: 'A tailored cotton cover for corner sofas.' }
  ];
  HM.products.forEach(function (p) { p.c = p.c.map(function (k) { return C[k]; }); p.sized = typeof p.price !== 'number'; p.dept = p.dept || 'bedding'; });
  HM.byId = function (id) { return HM.products.filter(function (p) { return p.id === id; })[0]; };
  HM.price = function (p, size) { return p.sized ? p.price[size || 'queen'] : p.price; };

  /* ---------- bag (kept in this browser; the store's own cart replaces it) ---------- */
  var KEY = 'hemmings.bag.v3', mem = null;
  HM.bag = {
    read: function () { try { var b = JSON.parse(localStorage.getItem(KEY)); return b || mem || []; } catch (e) { return mem || []; } },
    seeded: function () { try { return localStorage.getItem(KEY) !== null; } catch (e) { return mem !== null; } },
    write: function (b) { mem = b; try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} HM.bag.paint(); },
    add: function (p, ci, size, qty) {
      var b = HM.bag.read(), c = p.c[ci || 0], key = p.id + '/' + c.n + (p.sized ? '/' + size : ''), hit = b.filter(function (l) { return l.key === key; })[0];
      if (hit) hit.qty += qty || 1;
      else b.push({ key: key, id: p.id, name: p.n, variant: c.n + (p.sized ? ', ' + size.charAt(0).toUpperCase() + size.slice(1) : ''), price: HM.price(p, size), qty: qty || 1, img: p.img });
      HM.bag.write(b);
    },
    count: function () { return HM.bag.read().reduce(function (n, l) { return n + l.qty; }, 0); },
    paint: function () { all('.bagN').forEach(function (s) { s.textContent = HM.bag.count(); }); }
  };

  /* ---------- chrome ---------- */
  var ICON = { search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>', heart: '<path d="M12 20s-7-4.4-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.6 12 20 12 20z"/>', bag: '<path d="M6 8h12l1 12H5L6 8zM9 8V6.5a3 3 0 0 1 6 0V8"/>', menu: '<path d="M3 9h18M3 15h18"/>' };
  var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>'; };
  HM.heart = svg('heart');
  var dept = root.dataset.dept || '', designer = 'designer/index.html#v' + V;
  var links = [['New Arrivals', page('new'), 'new'], ['Bedding', page('bedding'), 'bedding'], ['Bath', page('bath'), 'bath'], ['Curtains', page('curtains'), 'curtains'], ['Cushions', page('cushions'), 'cushions'], ['Living', page('living'), 'living'], ['Collections', home + '#collections'], ['The Bed Designer', designer]];
  HM.designer = designer;
  var li = function (x) { return '<li><a href="' + x[1] + '"' + (x[2] && x[2] === dept ? ' aria-current="true"' : '') + '>' + x[0] + '</a></li>'; };
  var tools = '<a href="' + home + '" aria-label="Search">' + svg('search') + '</a><a href="' + home + '" aria-label="Account">' + svg('user') + '</a><a href="' + home + '" aria-label="Wishlist">' + svg('heart') + '</a><a class="bag" href="' + page('bag') + '" aria-label="Shopping bag">' + svg('bag') + '<span class="bagN">0</span></a>';
  var palette = '<div class="pal" role="group" aria-label="Colour palette"><span class="lab" id="palName">Forest</span>' +
    [['forest', 'Forest Green and Antique Gold', '#183B32', '#B49A62'], ['burgundy', 'Burgundy and Champagne', '#481C2C', '#D6B98C'], ['navy', 'Midnight Navy and Platinum', '#101D35', '#A8ADB5'], ['sage', 'Truffle with Sage accents', '#2C2420', '#A6C090'], ['sagemain', 'Ink with Sage', '#1F2A30', '#8FA287']].map(function (p) { return '<button type="button" data-set="' + p[0] + '" aria-pressed="false" aria-label="' + p[1] + '"><i style="background:linear-gradient(90deg,' + p[2] + ' 50%,' + p[3] + ' 50%)"></i></button>'; }).join('') + '</div>';
  var cols = '<div><h3>Shop</h3><ul>' + links.slice(0, 6).map(li).join('') + '</ul></div><div><h3>Customer Support</h3><ul><li><a href="' + page('contact') + '">Contact</a></li><li><a href="' + page('terms') + '">Shipping and Returns</a></li><li><a href="' + page('contact') + '">Track an Order</a></li></ul></div><div><h3>About Hemmings</h3><ul><li><a href="' + home + '">Our Story</a></li><li><a href="' + home + '">The Journal</a></li><li><a href="' + designer + '">The Bed Designer</a></li></ul></div><div><h3>Follow</h3><ul><li><a href="' + home + '">Instagram</a></li><li><a href="' + home + '">Facebook</a></li><li><a href="' + home + '">Pinterest</a></li></ul></div>';
  var legal = '<span>&copy; 2026 Hemmings</span><a href="' + page('privacy') + '">Privacy Policy</a><a href="' + page('terms') + '">Terms and Conditions</a>';
  var top, foot;
  if (V >= 4) {
    // Versions 4 and 5: the storefront chrome (utility bar, header with menus, drawer, newsletter band, footer). Styles: v4-chrome.css.
    var ico = function (d, box, cls) { return '<svg class="si' + (cls || '') + '" viewBox="0 0 ' + (box || '24 24') + '" aria-hidden="true">' + d + '</svg>'; }, chev = ico('<path d="M2.5 4.5 6 8l3.5-3.5"/>', '12 12', ' chev'), arrow = '<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var A = function (t, h) { return '<li><a href="' + h + '">' + t + '</a></li>'; }, bed = page('bedding'), des = 'designer/index.html#v1';
    HM.designer = des; HM.arrow = arrow;
    top = '<div class="s-util" role="region" aria-label="Store information"><ul class="s-wrap">' +
      '<li>' + ico('<path d="M2 7h11v9H2zM13 10h4l4 3v3h-8zM6.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM17 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z"/>') + 'Free Delivery Across Pakistan</li>' +
      '<li>' + ico('<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4M12 8v4l2.5 2"/>') + 'Easy Returns</li>' +
      '<li>' + ico('<path d="M6 10V7.5a6 6 0 0 1 12 0V10M5 10h14v10H5zM12 14v2.5"/>') + 'Cash on Delivery &amp; Secure Payments</li></ul></div>' +
      '<header class="s-hd" id="hd"><div class="s-hd-in s-wrap">' +
      '<button class="s-burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="sheet">' + ico('<path d="M3 8h18M3 16h18"/>') + '</button>' +
      '<nav aria-label="Main"><ul class="s-nav">' +
      '<li><button type="button" aria-expanded="false"' + (dept === 'bedding' ? ' aria-current="true"' : '') + '>Bedding ' + chev + '</button><div class="s-mega"><div class="s-mega-in s-wrap">' +
      '<div><h3>Shop Bedding</h3><ul>' + A('All Bedding', bed) + A('Sheet Sets', bed) + A('Fitted Sheets', bed) + A('Pillowcases', bed) + A('Blankets', bed) + '</ul></div>' +
      '<div><h3>By Fabric</h3><ul>' + A('Crisp Percale', bed) + A('Smooth Sateen', bed) + A('Washed Linen', bed) + A('Pure Cotton', bed) + '</ul></div>' +
      '<div><h3>By Style</h3><ul>' + A('Solids', home + '#sheets') + A('Prints', home + '#sheets') + A('Ultra Luxury', home + '#sheets') + A('New Arrivals', page('new')) + '</ul></div>' +
      '<a class="s-mega-f" href="' + des + '"><img src="img/r_comfort.jpg" alt="" loading="lazy"><span>Make Your Own Bed</span></a></div></div></li>' +
      A('Duvets &amp; Comforters', bed) + A('Quilts', bed) + '</ul></nav>' +
      '<a class="s-wm" href="' + home + '" aria-label="Hemmings home">HEMMINGS</a>' +
      '<div class="s-right"><nav aria-label="More"><ul class="s-nav">' +
      '<li><button type="button" aria-expanded="false">Decor ' + chev + '</button><div class="s-mega sm"><div class="s-mega-in s-wrap">' +
      '<div><h3>Living</h3><ul>' + A('Cushions', page('cushions')) + A('Throws', page('living')) + A('Sofa Covers', page('living')) + '</ul></div>' +
      '<div><h3>Around the Home</h3><ul>' + A('Curtains', page('curtains')) + A('Bath', page('bath')) + '</ul></div>' +
      '<a class="s-mega-f" href="' + page('living') + '"><img src="img/r_knit.jpg" alt="" loading="lazy"><span>Throws for Cooler Nights</span></a><span></span></div></div></li>' +
      A('Gifting', home + '#gifting') + A('Our Story', home + '#why') + '</ul></nav>' +
      '<div class="s-tools"><a href="' + bed + '" aria-label="Search">' + svg('search') + '</a><a class="opt" href="' + page('contact') + '" aria-label="Account">' + svg('user') + '</a><a class="opt" href="' + home + '#best" aria-label="Wishlist">' + svg('heart') + '</a><a href="' + page('bag') + '" aria-label="Shopping bag">' + svg('bag') + '<span class="bagN">0</span></a></div></div>' +
      '</div></header>' +
      '<div class="s-drawer" id="sheet"><nav aria-label="Menu"><button class="x" type="button" aria-label="Close menu">' + ico('<path d="M5 5l14 14M19 5 5 19"/>') + '</button><ul>' +
      A('Bedding', bed) + A('Duvets &amp; Comforters', bed) + A('Quilts', bed) + A('Pillows &amp; Cushions', page('cushions')) + A('Throws &amp; More', page('living')) + A('Curtains', page('curtains')) + A('Bath', page('bath')) + A('Gifting', home + '#gifting') + A('Make Your Own Bed', des) +
      '</ul><h3>Help</h3><ul class="sub">' + A('Contact Us', page('contact')) + A('Delivery &amp; Returns', page('terms')) + A('Track an Order', page('contact')) + '</ul></nav></div>';
    foot = '<section class="s-news" aria-labelledby="newsH"><div class="s-wrap"><div><h2 id="newsH">Join the Hemmings list</h2><p>New arrivals, seasonal edits and care advice. No clutter.</p></div>' +
      '<form id="news"><label class="sr" for="mail">Email address</label><input id="mail" type="email" required placeholder="Email address" autocomplete="email"><button class="s-btn" type="submit">Subscribe</button></form></div></section>' +
      '<footer class="s-ft"><div class="s-wrap"><div class="s-ft-g"><div><a class="s-wm big" href="' + home + '" aria-label="Hemmings home">HEMMINGS</a><p>Premium bed and home textiles, crafted for the way you live.</p></div>' +
      '<div><h3>Shop</h3><ul>' + A('Bedding', bed) + A('Duvets &amp; Comforters', bed) + A('Quilts', bed) + A('Pillows &amp; Cushions', page('cushions')) + A('Throws &amp; More', page('living')) + '</ul></div>' +
      '<div><h3>Help</h3><ul>' + A('Contact Us', page('contact')) + A('Delivery &amp; Returns', page('terms')) + A('Track an Order', page('contact')) + A('Privacy Policy', page('privacy')) + '</ul></div>' +
      '<div><h3>Hemmings</h3><ul>' + A('Our Story', home + '#why') + A('Gifting', home + '#gifting') + A('Make Your Own Bed', des) + '</ul></div>' +
      '<div><h3>Follow</h3><ul>' + A('Instagram', home) + A('Facebook', home) + A('Pinterest', home) + '</ul></div></div>' +
      '<div class="s-ft-e"><span>&copy; 2026 Hemmings. All rights reserved.</span><div><a href="' + page('privacy') + '">Privacy Policy</a><a href="' + page('terms') + '">Terms &amp; Conditions</a></div></div></div><div class="s-ft-word" aria-hidden="true">HEMMINGS</div></footer>' +
      '<div class="s-toast" id="toast" role="status"></div>' + palette;
  } else if (V === 3) {
    top = '<nav class="mx" id="sheet" aria-label="Menu"><div class="mx-in wrap"><ol class="mx-list">' + links.map(function (x, i) { return '<li><a href="' + x[1] + '"><span class="n">0' + (i + 1) + '</span><span class="t">' + x[0] + '</span></a></li>'; }).join('') + '</ol>' +
      '<div class="mx-side"><span class="lab">Hemmings, home textiles</span><p>Complimentary delivery across Pakistan on orders over Rs. 5,000.</p><p class="mx-tools"><a href="' + home + '">Search</a><a href="' + home + '">Account</a><a href="' + home + '">Wishlist</a><a href="' + page('contact') + '">Contact</a></p></div></div></nav>' +
      '<header class="hx" id="hd"><div class="hx-in wrap"><a class="wm" href="' + home + '" aria-label="Hemmings home"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M24 84V46A26 26 0 0 1 76 46V84M33 84V46A17 17 0 0 1 67 46V84M18 84H82M24 91H76M50 29V50M50 66V84M50 50L57 58L50 66L43 58Z"/><circle cx="50" cy="11" r="1.8" fill="currentColor" stroke="none"/></svg>HEMMINGS</a><ul class="hx-nav">' + links.slice(0, 6).map(li).join('') + '</ul>' +
      '<div class="hx-r"><a class="bag" href="' + page('bag') + '" aria-label="Shopping bag">Bag (<span class="bagN">0</span>)</a><button class="mbtn" id="burger" type="button" aria-expanded="false"><span class="o">Menu</span><span class="c">Close</span><i></i></button></div></div></header>';
    foot = '<footer class="fx dark"><div class="wrap"><div class="fx-top"><h2 class="h">Stay <em>close.</em></h2><form class="fx-form"><label class="sr" for="fxMail">Email address</label><input id="fxMail" type="email" placeholder="Email address" autocomplete="email"><button type="submit" class="lab">Subscribe</button></form></div>' +
      '<div class="ft-cols">' + cols + '</div><div class="fx-end"><div class="legal">' + legal + '</div><span class="lab">Home textiles, Pakistan</span></div></div><div class="fx-word" aria-hidden="true">HEMMINGS</div></footer>' + palette;
  } else if (V === 2) {
    top = '<nav class="sheet wrap" id="sheet" aria-label="Menu">' + links.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</nav>' +
      '<header class="hd" id="hd"><div class="hd-in wrap"><div class="ic left"><button class="burger" id="burger" aria-label="Menu" aria-expanded="false">' + svg('menu') + '</button></div>' +
      '<ul class="nv">' + links.slice(0, 5).map(li).join('') + '</ul><a class="lock" href="' + home + '" aria-label="Hemmings home">HEMMINGS</a>' +
      '<ul class="nv r">' + links.slice(5).map(li).join('') + '<li class="ic" style="display:flex">' + tools + '</li></ul><div class="ic right">' + '<a class="bag" href="' + page('bag') + '" aria-label="Shopping bag">' + svg('bag') + '<span class="bagN">0</span></a></div></div></header>';
    foot = '<footer class="ft dark"><div class="wrap"><div class="ft-cols">' + cols + '</div><div class="ft-end"><a class="lock" href="' + home + '" aria-label="Hemmings home">HEMMINGS</a><div class="legal">' + legal + '</div></div></div></footer>' + palette;
  } else {
    top = '<header class="top" id="hd"><div class="announce">Complimentary delivery across Pakistan on orders over Rs. 5,000</div><div class="bar wrap"><a class="brand" href="' + home + '" aria-label="Hemmings home">HE<span>M</span>MINGS</a>' +
      '<ul class="nav" id="sheet">' + links.map(li).join('') + '</ul><div class="tools">' + tools + '<button class="menu" id="burger" aria-label="Menu" aria-expanded="false">' + svg('menu') + '</button></div></div></header>';
    foot = '<footer class="foot"><div class="wrap"><div class="foot-grid"><div><a class="brand" href="' + home + '">HE<span>M</span>MINGS</a><p>Thoughtfully crafted essentials for the spaces you call home.</p></div>' + cols + '</div><div class="legal">' + legal + '</div></div><div class="foot-word" aria-hidden="true">HEMMINGS</div></footer>' + palette;
  }
  $('hm-top').innerHTML = top; $('hm-foot').innerHTML = foot;
  HM.fixHome = function (scope) { all('a[href^="v2.html"]', scope).forEach(function (a) { a.setAttribute('href', a.getAttribute('href').replace('v2.html', home)); }); };
  HM.fixHome();
  HM.bag.paint();

  /* ---------- palette ---------- */
  var PAL = { forest: { name: 'Forest', main: 'h_forest', mid: 'm_emerald', accent: 'h_gold' }, burgundy: { name: 'Burgundy', main: 'h_burgundy', mid: 'm_rose', accent: 'h_champagne' }, navy: { name: 'Navy', main: 'h_navy', mid: 'm_slate', accent: 'h_platinum' }, sage: { name: 'Sage Accent', main: 'h_truffle', mid: 'm_taupe', accent: 'h_sage' }, sagemain: { name: 'Ink & Sage', main: 'h_ink', mid: 'm_sage', accent: 'h_champagne' } };
  HM.setPalette = function (id, save) {
    if (!PAL[id]) id = 'forest';
    if (id === 'forest') root.removeAttribute('data-palette'); else root.setAttribute('data-palette', id);
    all('[data-pal]').forEach(function (im) { var src = 'img/' + PAL[id][im.dataset.pal] + '.jpg'; if (im.getAttribute('src') !== src) im.setAttribute('src', src); });
    all('.pal button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.set === id); });
    $('palName').textContent = PAL[id].name;
    if (save) try { localStorage.setItem('hemmings.palette', id); } catch (e) {}
  };
  HM.setPalette(root.getAttribute('data-palette') || 'forest');
  document.querySelector('.pal').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) HM.setPalette(b.dataset.set, true); });
  if (window.HM_LOCK) { document.querySelector('.pal').style.display = 'none'; root.classList.add('locked'); }

  /* ---------- shared behaviour ---------- */
  var hd = $('hd'), burger = $('burger'), sheet = $('sheet');
  burger.addEventListener('click', function () { var o = !sheet.classList.contains('open'); sheet.classList.toggle('open', o); hd.classList.toggle('open', o); hd.classList.toggle('over', o && V !== 1); burger.setAttribute('aria-expanded', o); });
  var onScroll = function () { hd.classList.toggle('solid', window.scrollY > 80); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (V >= 4) {
    var shut = function () { sheet.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    var menus = function (keep) { all('.s-nav > li.open').forEach(function (x) { if (x !== keep) { x.classList.remove('open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); } }); };
    burger.addEventListener('click', function () { document.body.style.overflow = sheet.classList.contains('open') ? 'hidden' : ''; });
    sheet.addEventListener('click', function (e) { var a = e.target.closest('a'); if (e.target === sheet || e.target.closest('.x') || (a && a.getAttribute('href').indexOf('#') > -1)) shut(); });
    all('.s-nav > li > button').forEach(function (b) { b.addEventListener('click', function () { var li = b.parentNode, o = !li.classList.contains('open'); menus(li); li.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { menus(); shut(); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('.s-nav')) menus(); });
    var toastT; HM.toast = function (html) { var t = $('toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 3600); };
    $('news').addEventListener('submit', function (e) { e.preventDefault(); this.reset(); HM.toast('<span>Thank you. You are on the list.</span>'); });
  }
  HM.reveal = function () {
    var t = all('.rv:not(.in)');
    if (!('IntersectionObserver' in window)) return t.forEach(function (x) { x.classList.add('in'); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    t.forEach(function (x) { io.observe(x); });
  };
  document.addEventListener('submit', function (e) { if (e.target.classList.contains('fx-form')) { e.preventDefault(); e.target.querySelector('button').textContent = 'Thank you'; } });
  document.addEventListener('click', function (e) {
    var w = e.target.closest('.wish'), q = e.target.closest('[data-quick]');
    if (w) w.setAttribute('aria-pressed', w.getAttribute('aria-pressed') !== 'true');
    if (q && !q.disabled) { HM.bag.add(HM.byId(q.dataset.quick), 0, 'queen', 1); var t = q.textContent; q.textContent = 'Added to bag'; setTimeout(function () { q.textContent = t; }, 1500); }
  });

  HM.card = function (p, i, size) {
    var href = page('product') + '#' + p.id;
    return '<article class="pc" style="--d:' + ((i % 6) * 0.07).toFixed(2) + 's"><a class="pic" href="' + href + '"><img src="img/' + p.img + '.jpg" alt="' + esc(p.n) + '" loading="lazy"><img class="alt" src="img/' + p.img2 + '.jpg" alt="" loading="lazy"></a>' +
      (p.out ? '<span class="tag">Sold out</span>' : p.tag ? '<span class="tag">' + p.tag + '</span>' : '') +
      '<button class="wish" type="button" aria-pressed="false" aria-label="Add ' + esc(p.n) + ' to wishlist">' + HM.heart + '</button>' +
      '<div class="quick"><button type="button" data-quick="' + p.id + '"' + (p.out ? ' disabled' : '') + '>' + (p.out ? 'Sold out' : 'Quick add') + '</button></div>' +
      '<span class="lab m">' + esc(p.mat) + '</span><h3><a href="' + href + '">' + esc(p.n) + '</a></h3><div class="price"><span>' + (p.sized && !size ? 'From ' + HM.money(p.price.single) : HM.money(HM.price(p, size))) + '</span><span class="dots">' + p.c.map(function (c) { return '<i style="background:' + c.h + '" title="' + c.n + '"></i>'; }).join('') + '</span></div></article>';
  };

  /* ---------- listing ---------- */
  HM.listing = function () {
    var st = { cat: 'all', fam: '', mats: {}, size: 'queen', max: '', stock: false, sort: 'featured' };
    var D = HM.depts[dept] || HM.depts.bedding, isNew = dept === 'new';
    var pool = HM.products.filter(function (p) { return isNew ? p.tag === 'New' : p.dept === (dept || 'bedding'); });
    document.title = D.t + ' | Hemmings';
    $('deptTitle').textContent = D.t; $('deptDesc').textContent = D.d; $('deptCrumb').textContent = D.t;
    $('deptImg').src = 'img/' + D.img + '.jpg';
    var mats = pool.map(function (p) { return p.mat; }).filter(function (m, i, a) { return a.indexOf(m) === i; }).sort();
    var fams = [['neutral', 'Neutrals', '#E6DFD0'], ['green', 'Greens', '#6F8872'], ['earth', 'Earth', '#C09A78'], ['blue', 'Blues', '#AEBBC2'], ['dark', 'Dark', '#3A3D38']];
    function draw() {
      $('tabs').innerHTML = D.cats.map(function (c) { return '<button type="button" data-cat="' + c[0] + '" aria-pressed="' + (st.cat === c[0]) + '">' + c[1] + '</button>'; }).join('');
      $('filters').innerHTML =
        '<div class="fg"><h3 class="lab">Colour</h3><div class="sw">' + fams.map(function (f) { return '<button type="button" data-fam="' + f[0] + '" aria-pressed="' + (st.fam === f[0]) + '" aria-label="' + f[1] + '" title="' + f[1] + '"><i style="background:' + f[2] + '"></i></button>'; }).join('') + '</div></div>' +
        '<div class="fg"><h3 class="lab">Material</h3>' + mats.map(function (m) { return '<label class="ck"><input type="checkbox" data-mat="' + esc(m) + '"' + (st.mats[m] ? ' checked' : '') + '>' + esc(m) + '</label>'; }).join('') + '</div>' +
        (D.sized ? '<div class="fg"><h3 class="lab">Size</h3><div class="seg">' + ['single', 'queen', 'king'].map(function (s) { return '<button type="button" data-size="' + s + '" aria-pressed="' + (st.size === s) + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="fg"><h3 class="lab">Price</h3><label class="sr" for="fMax">Maximum price</label><select id="fMax" data-max><option value="">Any price</option><option value="5000">Under Rs. 5,000</option><option value="10000">Under Rs. 10,000</option><option value="15000">Under Rs. 15,000</option></select></div>' +
        '<div class="fg"><h3 class="lab">Availability</h3><label class="ck"><input type="checkbox" data-stock' + (st.stock ? ' checked' : '') + '>In stock only</label><button type="button" class="clear" data-clear>Clear all filters</button></div>';
      $('fMax').value = st.max;
      var list = pool.filter(function (p) {
        if (st.cat !== 'all' && p.cat !== st.cat) return false;
        if (st.fam && !p.c.some(function (c) { return c.f === st.fam; })) return false;
        if (Object.keys(st.mats).length && !st.mats[p.mat]) return false;
        if (st.max && HM.price(p, st.size) >= +st.max) return false;
        if (st.stock && p.out) return false;
        return true;
      });
      if (st.sort === 'low') list.sort(function (a, b) { return HM.price(a, st.size) - HM.price(b, st.size); });
      if (st.sort === 'high') list.sort(function (a, b) { return HM.price(b, st.size) - HM.price(a, st.size); });
      if (st.sort === 'new') list.sort(function (a, b) { return (b.tag ? 1 : 0) - (a.tag ? 1 : 0); });
      var n = Object.keys(st.mats).length + (st.fam ? 1 : 0) + (st.max ? 1 : 0) + (st.stock ? 1 : 0);
      $('count').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
      if ($('fN')) $('fN').textContent = n ? ' (' + n + ')' : '';
      var html = list.map(function (p, i) { return HM.card(p, i, st.size); });
      var promo = $('promo'); if (promo && dept === 'bedding' && list.length > 4) html.splice(4, 0, promo.innerHTML);
      $('grid').innerHTML = html.join('') || '<p class="none">No pieces match these filters. <button type="button" class="clear" data-clear>Clear all filters</button></p>';
      HM.setPalette(root.getAttribute('data-palette') || 'forest'); HM.fixHome($('grid'));
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat],[data-fam],[data-size],[data-clear],[data-ftoggle]'); if (!b) return;
      if (b.dataset.cat) st.cat = b.dataset.cat;
      else if (b.dataset.fam) st.fam = st.fam === b.dataset.fam ? '' : b.dataset.fam;
      else if (b.dataset.size) st.size = b.dataset.size;
      else if ('clear' in b.dataset) { st.fam = ''; st.mats = {}; st.max = ''; st.stock = false; st.cat = 'all'; }
      else if ('ftoggle' in b.dataset) { var o = $('filters').hidden; $('filters').hidden = !o; b.setAttribute('aria-expanded', o); return; }
      draw();
    });
    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.dataset.mat) { if (t.checked) st.mats[t.dataset.mat] = 1; else delete st.mats[t.dataset.mat]; }
      else if ('stock' in t.dataset) st.stock = t.checked;
      else if ('max' in t.dataset) st.max = t.value;
      else if (t.id === 'sort') st.sort = t.value;
      else return;
      draw();
    });
    draw(); HM.reveal();
  };

  /* ---------- product ---------- */
  HM.product = function () {
    var st = { c: 0, size: 'queen', q: 1, shot: 0 }, p;
    function row(x) { return '<article class="lrow"><a class="pic" href="' + page('product') + '#' + x.id + '"><img src="img/' + x.img + '.jpg" alt="' + esc(x.n) + '" loading="lazy"></a><div><span class="lab m">' + esc(x.mat) + '</span><h3><a href="' + page('product') + '#' + x.id + '">' + esc(x.n) + '</a></h3><div class="price"><span>' + (x.sized ? 'From ' + HM.money(x.price.single) : HM.money(x.price)) + '</span></div><button type="button" class="txt" data-quick="' + x.id + '"' + (x.out ? ' disabled' : '') + '>' + (x.out ? 'Sold out' : 'Quick add') + '</button></div></article>'; }
    function draw(full) {
      var c = p.c[st.c], shots = [p.img, p.img2, 'r_fabric', 'r_room'].filter(function (s, i, a) { return a.indexOf(s) === i; });
      document.title = p.n + ' | Hemmings';
      if (full) {
        $('crumb').innerHTML = '<a href="' + home + '">Home</a><span>/</span><a href="' + page(p.dept) + '">' + HM.depts[p.dept].t + '</a><span>/</span><span>' + esc(p.n) + '</span>';
        $('gal').innerHTML = V !== 1 && V < 4
          ? shots.map(function (s, i) { return '<button type="button" class="pic shot' + (i === 0 ? ' wide' : '') + '" data-zoom aria-label="Zoom image ' + (i + 1) + '"><img src="img/' + s + '.jpg" alt="' + esc(p.n) + ', view ' + (i + 1) + '"></button>'; }).join('')
          : '<button type="button" class="pic shot main" data-zoom aria-label="Zoom image"><img id="mainShot" src="img/' + shots[0] + '.jpg" alt="' + esc(p.n) + '"></button><div class="thumbs">' + shots.map(function (s, i) { return '<button type="button" class="pic" data-shot="' + s + '" aria-pressed="' + (i === 0) + '" aria-label="View ' + (i + 1) + '"><img src="img/' + s + '.jpg" alt=""></button>'; }).join('') + '</div>';
        var others = HM.products.filter(function (x) { return x.id !== p.id; }).sort(function (a, b) { return (b.dept === p.dept) - (a.dept === p.dept); });
        $('look').innerHTML = HM.products.filter(function (x) { return x.dept !== p.dept; }).filter(function (x, i) { return i % 5 === p.id.length % 5; }).slice(0, 3).map(row).join('');
        $('also').innerHTML = others.filter(function (x) { return x.cat === p.cat; }).concat(others).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 4).map(function (x, i) { return HM.card(x, i); }).join('');
      }
      $('info').innerHTML =
        '<span class="lab m">' + esc(p.col) + ' Collection</span><h1 class="h">' + esc(p.n) + '</h1><div class="pprice">' + HM.money(HM.price(p, st.size)) + '</div><p class="pdesc">' + esc(p.d) + '</p>' +
        '<div class="opt"><div class="optl"><span>Colour</span><strong>' + c.n + '</strong></div><div class="sw">' + p.c.map(function (x, i) { return '<button type="button" data-c="' + i + '" aria-pressed="' + (i === st.c) + '" aria-label="' + x.n + '" title="' + x.n + '"><i style="background:' + x.h + '"></i></button>'; }).join('') + '</div></div>' +
        (p.sized ? '<div class="opt"><div class="optl"><span>Size</span><strong>' + st.size.charAt(0).toUpperCase() + st.size.slice(1) + '</strong><a href="#">Size guide</a></div><div class="seg">' + ['single', 'queen', 'king'].map(function (s) { return '<button type="button" data-size="' + s + '" aria-pressed="' + (st.size === s) + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="buy"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="-1" aria-label="One fewer">&minus;</button><span>' + st.q + '</span><button type="button" data-q="1" aria-label="One more">+</button></div><button type="button" class="cta" data-add' + (p.out ? ' disabled' : '') + '>' + (p.out ? 'Sold out' : 'Add to Bag') + '</button><button class="wish box" type="button" aria-pressed="false" aria-label="Add to wishlist">' + HM.heart + '</button></div>' +
        '<p class="added" id="added" role="status"></p>' +
        '<a class="design" href="' + designer + '"><span>See it on your bed in the Bed Designer</span><span aria-hidden="true">&rarr;</span></a>' +
        '<p class="ship">' + (p.out ? 'Currently sold out.' : 'In stock.') + ' Delivery in 3 to 5 working days. Cash on delivery available.</p>' +
        '<div class="acc"><details open><summary>Material and details</summary><dl><dt>Fabric</dt><dd>' + esc(p.mat) + '</dd><dt>Collection</dt><dd>' + esc(p.col) + '</dd><dt>Colours</dt><dd>' + p.c.map(function (x) { return x.n; }).join(', ') + '</dd></dl></details>' +
        '<details><summary>Specifications</summary><p>Sizes: ' + (p.sized ? 'Single, Queen and King.' : 'One size.') + ' Full dimensions for each size are listed in the size guide.</p></details>' +
        '<details><summary>Care instructions</summary><p>Machine wash cool with like colours. Tumble dry low or line dry in shade. Warm iron if needed. Do not bleach.</p></details>' +
        '<details><summary>Delivery and returns</summary><p>Complimentary delivery on orders over Rs. 5,000. Unused pieces can be returned in their original packaging.</p></details></div>';
    }
    function load() { p = HM.byId(location.hash.slice(1)) || HM.products[0]; st = { c: 0, size: 'queen', q: 1 }; draw(true); window.scrollTo(0, 0); }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-c],[data-size],[data-q],[data-add],[data-shot],[data-zoom]'); if (!b) return;
      if (b.dataset.c) st.c = +b.dataset.c;
      else if (b.dataset.size) st.size = b.dataset.size;
      else if (b.dataset.q) st.q = Math.max(1, Math.min(10, st.q + +b.dataset.q));
      else if ('add' in b.dataset) { HM.bag.add(p, st.c, st.size, st.q); draw(); $('added').innerHTML = st.q + (st.q === 1 ? ' piece' : ' pieces') + ' added to your bag. <a href="' + page('bag') + '">View bag</a>'; return; }
      else if (b.dataset.shot) { $('mainShot').src = 'img/' + b.dataset.shot + '.jpg'; all('.thumbs button').forEach(function (t) { t.setAttribute('aria-pressed', t === b); }); return; }
      else if ('zoom' in b.dataset) { var on = b.classList.toggle('zoomed'); if (!on) b.querySelector('img').style.transformOrigin = ''; return; }
      draw();
    });
    document.addEventListener('pointermove', function (e) {
      var z = e.target.closest && e.target.closest('.shot.zoomed'); if (!z) return;
      var r = z.getBoundingClientRect(); z.querySelector('img').style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '% ' + ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%';
    });
    window.addEventListener('hashchange', load);
    load(); HM.reveal();
  };

  /* ---------- contact, privacy policy, terms and conditions ---------- */
  // DRAFT TEXT for layout and review. Bracketed items need the company's details; a lawyer should confirm the policies before launch.
  var DOCS = {
    privacy: { t: 'Privacy Policy', intro: 'This policy explains what personal information Hemmings collects when you visit or buy from us, how we use it, and the choices you have.', parts: [
      ['Who we are', 'Hemmings is operated by [LEGAL ENTITY NAME], [REGISTERED ADDRESS]. For any question about this policy, write to [PRIVACY EMAIL].'],
      ['Information we collect', 'When you place an order or create an account we collect your name, delivery and billing address, phone number, email address and order details. When you browse the site we collect basic device and usage information, such as pages viewed and the products you add to your bag.'],
      ['How we use it', 'We use your information to process and deliver orders, take payment, answer your questions, keep your account, and prevent fraud. With your consent we also send news of new collections and offers. You can unsubscribe at any time from any email.'],
      ['Payments', 'Card payments are handled by our payment provider, [PAYMENT PROVIDER]. We do not store full card numbers. For cash on delivery, the courier collects payment and confirms it to us.'],
      ['Who we share it with', 'We share only what is needed with the companies that help us run the store: our e-commerce platform, payment provider, couriers, and email and analytics services. We do not sell your personal information.'],
      ['Cookies', 'We use cookies that are needed for the bag and checkout to work, and, with your consent, cookies that help us understand how the site is used. You can change your cookie choices at any time in your browser.'],
      ['How long we keep it', 'We keep order records for as long as the law requires for tax and accounting purposes, and account details until you ask us to close your account.'],
      ['Your choices', 'You can ask to see, correct or delete the personal information we hold about you by writing to [PRIVACY EMAIL]. We will reply within [RESPONSE TIME].'],
      ['Changes to this policy', 'If we change this policy we will post the new version here and update the date below. Last updated: [DATE].']
    ] },
    terms: { t: 'Terms & Conditions', intro: 'These terms apply to every order placed with Hemmings. Please read them before you buy.', parts: [
      ['About us', 'This website is operated by [LEGAL ENTITY NAME], [REGISTERED ADDRESS], registration number [NUMBER].'],
      ['Orders', 'An order is accepted when we send you a confirmation by email or SMS. We may decline an order if a piece is out of stock, a price was shown in error, or payment cannot be confirmed, and we will tell you if so.'],
      ['Prices and payment', 'Prices are shown in Pakistani rupees and include applicable taxes. We accept [PAYMENT METHODS] and cash on delivery in the areas our couriers serve.'],
      ['Delivery', 'We deliver within Pakistan. Orders are usually dispatched within [DISPATCH TIME] and delivered within [DELIVERY TIME]. Delivery is complimentary on orders over [FREE DELIVERY THRESHOLD]; below that a charge of [DELIVERY CHARGE] applies.'],
      ['Returns and exchanges', 'If you are not satisfied, you may return unused pieces in their original packaging within [RETURN WINDOW] of delivery for an exchange or refund. Pieces that have been washed or used, and made-to-measure curtains, cannot be returned unless faulty.'],
      ['Faulty or incorrect pieces', 'If a piece arrives damaged, faulty or different from what you ordered, contact us within [CLAIM WINDOW] with your order number and a photograph, and we will replace it or refund you.'],
      ['Colours and sizes', 'We photograph our fabrics as accurately as we can, but colours vary slightly between screens and between dye lots. Sizes are listed on each product page.'],
      ['The Bed Designer', 'The Bed Designer is an illustration to help you choose. The pieces it adds to your bag are the same products, at the same prices, as elsewhere on the site.'],
      ['Our content', 'The text, photographs and designs on this site belong to Hemmings or its licensors and may not be reused without permission.'],
      ['Governing law', 'These terms are governed by the laws of Pakistan. Last updated: [DATE].']
    ] }
  };
  HM.info = function (kind) {
    var doc = DOCS[kind], el = $('doc');
    if (kind === 'contact') {
      document.title = 'Contact Us | Hemmings';
      $('docTitle').innerHTML = 'Contact <em>Us</em>';
      $('docIntro').textContent = 'Questions about an order, a fabric or a size? Write to us and we will reply within [RESPONSE TIME].';
      el.innerHTML = '<div class="contact"><form id="contactForm" novalidate><div class="fld"><label for="cName">Your name</label><input id="cName" type="text" autocomplete="name" required></div><div class="fld"><label for="cEmail">Email address</label><input id="cEmail" type="email" autocomplete="email" required></div><div class="fld"><label for="cOrder">Order number <span>(optional)</span></label><input id="cOrder" type="text"></div><div class="fld"><label for="cTopic">Topic</label><select id="cTopic"><option>An existing order</option><option>Delivery and returns</option><option>Product advice</option><option>The Bed Designer</option><option>Something else</option></select></div><div class="fld wide"><label for="cMsg">Message</label><textarea id="cMsg" rows="6" required></textarea></div><button type="submit" class="cta">Send Message</button><p class="formNote" id="formNote" role="status"></p></form>' +
        '<aside class="reach"><div><h3 class="lab m">Customer care</h3><p>[PHONE NUMBER]<br>[CUSTOMER CARE EMAIL]</p></div><div><h3 class="lab m">Hours</h3><p>[DAYS AND HOURS]</p></div><div><h3 class="lab m">Head office</h3><p>[COMPANY NAME]<br>[STREET ADDRESS]<br>[CITY], Pakistan</p></div><div><h3 class="lab m">Follow</h3><p>Instagram &nbsp;·&nbsp; Facebook &nbsp;·&nbsp; Pinterest</p></div></aside></div>';
      $('contactForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = $('cName').value.trim() && /.+@.+\..+/.test($('cEmail').value) && $('cMsg').value.trim();
        $('formNote').textContent = ok ? 'Thank you. In this preview the message is not sent anywhere.' : 'Please add your name, a valid email address and a message.';
        if (ok) e.target.reset();
      });
    } else {
      document.title = doc.t + ' | Hemmings';
      $('docTitle').innerHTML = doc.t.replace(/(Policy|Conditions)/, '<em>$1</em>');
      $('docIntro').textContent = doc.intro;
      el.innerHTML = '<div class="legaldoc"><nav class="toc" aria-label="On this page"><h3 class="lab m">On this page</h3>' + doc.parts.map(function (p, i) { return '<a href="#s' + (i + 1) + '">' + p[0] + '</a>'; }).join('') + '</nav><article><p class="draft">Draft for review. Bracketed items need your company details, and a lawyer should confirm this text before launch.</p>' + doc.parts.map(function (p, i) { return '<section id="s' + (i + 1) + '"><h2 class="h">' + p[0] + '</h2><p>' + p[1] + '</p></section>'; }).join('') + '</article></div>';
    }
    HM.reveal();
  };

  /* ---------- bag ---------- */
  HM.bagPage = function () {
    if (!HM.bag.seeded()) { var s = HM.products; HM.bag.add(s[0], 1, 'queen', 1); HM.bag.add(s[2], 0, 'queen', 1); HM.bag.add(s[11], 1, 'queen', 2); }
    var note = '';
    function draw() {
      var b = HM.bag.read(), sub = b.reduce(function (n, l) { return n + l.qty * l.price; }, 0), free = sub >= 5000;
      $('lines').innerHTML = b.length ? b.map(function (l, i) {
        return '<div class="line"><a class="pic" href="' + page('product') + '#' + l.id + '"><img src="img/' + l.img + '.jpg" alt="' + esc(l.name) + '"></a><div class="ln"><h3><a href="' + page('product') + '#' + l.id + '">' + esc(l.name) + '</a></h3><span>' + esc(l.variant) + '</span><button type="button" class="txt" data-rm="' + i + '">Remove</button></div>' +
          '<div class="qty" role="group" aria-label="Quantity"><button type="button" data-i="' + i + '" data-d="-1" aria-label="One fewer">&minus;</button><span>' + l.qty + '</span><button type="button" data-i="' + i + '" data-d="1" aria-label="One more">+</button></div><div class="lp">' + HM.money(l.price * l.qty) + '</div></div>';
      }).join('') : '<div class="empty"><h2 class="h">Your bag is <em>empty.</em></h2><p>Begin with the bedding collection, or compose a whole bed in the Bed Designer.</p><a class="cta" href="' + page('bedding') + '">Shop Bedding</a></div>';
      $('summary').hidden = !b.length;
      $('summary').innerHTML = '<h2 class="h">Order <em>Summary</em></h2><dl><dt>Subtotal</dt><dd>' + HM.money(sub) + '</dd><dt>Shipping</dt><dd>' + (free ? 'Complimentary' : 'Calculated at checkout') + '</dd><dt>Discount</dt><dd>&minus; Rs. 0</dd></dl>' +
        '<form id="code"><label class="sr" for="codeIn">Discount code</label><input id="codeIn" type="text" placeholder="Discount code" autocomplete="off"><button type="submit" class="txt">Apply</button></form><p class="cnote" role="status">' + note + '</p>' +
        '<div class="tot"><span class="lab">Total</span><strong>' + HM.money(sub) + '</strong></div><button type="button" class="cta" data-checkout>Proceed to Checkout</button><p class="fine">Check out as a guest or sign in. Cash on delivery and card payment available.</p>';
      $('bagCount').textContent = HM.bag.count() + (HM.bag.count() === 1 ? ' piece' : ' pieces');
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rm],[data-d],[data-checkout]'); if (!b) return;
      var bag = HM.bag.read();
      if (b.dataset.rm) bag.splice(+b.dataset.rm, 1);
      else if (b.dataset.d) { var l = bag[+b.dataset.i]; l.qty += +b.dataset.d; if (l.qty < 1) bag.splice(+b.dataset.i, 1); }
      else { note = 'Checkout opens on the store itself. This preview stops here.'; draw(); return; }
      HM.bag.write(bag); draw();
    });
    document.addEventListener('submit', function (e) { if (e.target.id !== 'code') return; e.preventDefault(); note = 'Codes are checked at checkout on the store.'; draw(); });
    draw(); HM.reveal();
  };
})();
