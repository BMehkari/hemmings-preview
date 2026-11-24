// Hemmings versions 6 and 7: sign in and registration, the customer account (overview, orders, order detail and tracking,
// addresses, wishlist, profile) and checkout. Runs after hm.js. Styles: hm-account.css.
// PREVIEW ONLY. Everything is kept in this browser (localStorage) so the pages can be clicked through: no password is stored
// or sent anywhere, no payment is taken, and the three "sample" orders are there to show the layouts. The store's own
// customer accounts, checkout and order system replace all of this.
(function () {
  var HM = window.HM, S = HM.store, esc = HM.esc, page = HM.page, money = HM.money;
  var $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Other'];
  var PROV = ['Sindh', 'Punjab', 'Islamabad Capital Territory', 'Khyber Pakhtunkhwa', 'Balochistan', 'Azad Jammu & Kashmir', 'Gilgit-Baltistan'];
  var STEPS = [['placed', 'Order placed'], ['confirmed', 'Confirmed'], ['shipped', 'Shipped'], ['out', 'Out for delivery'], ['delivered', 'Delivered']];
  var LABEL = { placed: 'Order placed', confirmed: 'Confirmed', shipped: 'Shipped', out: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', returning: 'Return requested' };
  var OPEN = ['placed', 'confirmed', 'shipped', 'out'], RETURN_DAYS = 14, FREE_OVER = 5000;
  var DAY = 864e5, ago = function (d) { return new Date(Date.now() - d * DAY).toISOString(); };
  var fmt = function (iso) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  var arrow = HM.arrow || '', app;
  var field = function (id, label, type, val, extra) { return '<div class="fld' + (extra && extra.wide ? ' wide' : '') + '"><label for="' + id + '">' + label + (extra && extra.opt ? ' <span>(optional)</span>' : '') + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(val || '') + '"' + (extra && extra.auto ? ' autocomplete="' + extra.auto + '"' : '') + (extra && extra.opt ? '' : ' required') + '></div>'; };
  var pickList = function (id, label, list, val) { return '<div class="fld"><label for="' + id + '">' + label + '</label><select id="' + id + '">' + list.map(function (c) { return '<option' + (c === val ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>'; };
  var v = function (id) { return ($(id).value || '').trim(); };
  var okMail = function (s) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s); };
  var badge = function (st) { return '<span class="ac-badge ' + st + '">' + LABEL[st] + '</span>'; };
  var addrHtml = function (a) { return '<strong>' + esc(a.name) + '</strong><br>' + esc(a.line) + '<br>' + esc(a.city) + ', ' + esc(a.prov) + '<br>' + esc(a.phone); };

  /* ---------- sample data, so the account has something to show ---------- */
  function line(id, ci, size, qty) { var p = HM.byId(id), c = p.c[ci]; return { id: p.id, name: p.n, variant: c.n + (p.sized ? ', ' + size.charAt(0).toUpperCase() + size.slice(1) : ''), price: HM.price(p, size), qty: qty, img: p.img }; }
  function build(o) { o.sub = o.items.reduce(function (n, l) { return n + l.price * l.qty; }, 0); o.total = o.sub + o.ship; return o; }
  function seed(u) {
    if (S.orders.read().length) return;
    var a = { id: 'a1', label: 'Home', name: u.name, phone: u.phone || '0300 0000000', line: 'House 14, Street 9, Block 5, Clifton', city: 'Karachi', prov: 'Sindh', def: true, sample: true };
    if (!S.addresses.read().length) S.addresses.write([a]);
    S.orders.write([
      build({ id: 'HM-490217', date: ago(1), status: 'placed', sample: true, pay: 'Cash on Delivery', ship: 0, addr: a, items: [line('bath-towel', 0, '', 4), line('waffle-robe', 0, '', 1)], log: { placed: ago(1) } }),
      build({ id: 'HM-488075', date: ago(4), status: 'shipped', sample: true, pay: 'Cash on Delivery', ship: 0, addr: a, ref: 'PK-7714 0092 31', items: [line('washed-linen-duvet', 0, 'queen', 1)], log: { placed: ago(4), confirmed: ago(3.6), shipped: ago(1.5) } }),
      build({ id: 'HM-482113', date: ago(9), status: 'delivered', sample: true, pay: 'Debit / Credit Card', ship: 0, addr: a, ref: 'PK-7702 4410 08', items: [line('sateen-sheet-set', 0, 'queen', 1), line('sateen-pillowcases', 1, '', 2)], log: { placed: ago(9), confirmed: ago(8.7), shipped: ago(7.5), out: ago(6.2), delivered: ago(6) } })
    ]);
  }
  var orders = function () { return S.orders.read(); };
  var saveOrder = function (o) { S.orders.write(orders().map(function (x) { return x.id === o.id ? o : x; })); };

  /* ---------- sign in / create account ---------- */
  HM.loginPage = function () {
    app = $('app');
    if (HM.user.get()) { location.replace(page('account')); return; }
    var next = ''; try { next = sessionStorage.getItem('hemmings.next') || ''; } catch (e) {}
    var mode = location.hash === '#register' ? 'up' : 'in';
    function draw(note) {
      document.title = (mode === 'in' ? 'Sign In' : 'Create Account') + ' | Hemmings';
      app.innerHTML = '<div class="au"><div class="au-card"><div class="au-tabs" role="tablist"><button type="button" role="tab" data-mode="in" aria-selected="' + (mode === 'in') + '">Sign In</button><button type="button" role="tab" data-mode="up" aria-selected="' + (mode === 'up') + '">Create Account</button></div>' +
        (mode === 'in'
          ? '<h1 class="h">Welcome <em>back</em></h1><p class="au-sub">Sign in to track orders, reorder favourites and check out faster.</p><form id="auForm" novalidate>' + field('auMail', 'Email address', 'email', '', { auto: 'email' }) + field('auPass', 'Password', 'password', '', { auto: 'current-password' }) +
            '<div class="au-row"><label class="ck"><input type="checkbox" checked>Keep me signed in</label><button type="button" class="txt" data-forgot>Forgot password?</button></div><button type="submit" class="cta">Sign In ' + arrow + '</button></form>'
          : '<h1 class="h">Create your <em>account</em></h1><p class="au-sub">It takes a minute, and your orders and addresses are kept in one place.</p><form id="auForm" novalidate>' + field('auName', 'Full name', 'text', '', { auto: 'name' }) + field('auMail', 'Email address', 'email', '', { auto: 'email' }) + field('auPhone', 'Mobile number', 'tel', '', { auto: 'tel', opt: true }) + field('auPass', 'Password (6 characters or more)', 'password', '', { auto: 'new-password' }) +
            '<label class="ck"><input type="checkbox" id="auNews" checked>Send me new arrivals and offers by email</label><button type="submit" class="cta">Create Account ' + arrow + '</button><p class="fine">By creating an account you agree to the <a href="' + page('terms') + '">Terms &amp; Conditions</a> and <a href="' + page('privacy') + '">Privacy Policy</a>.</p></form>') +
        '<p class="au-note" id="auNote" role="status">' + (note || '') + '</p><p class="au-prev">Preview: any email and password work here. Nothing is sent, and the password is not kept.</p>' +
        (next ? '<a class="au-guest" href="' + page('checkout') + '?guest=1">Continue to checkout as a guest ' + arrow + '</a>' : '') + '</div>' +
        '<aside class="au-side"><span class="lab">Your Hemmings account</span><h2 class="h">Everything in <em>one place</em></h2><ul><li><b>Track every order</b><span>From confirmation to your door, with each step dated.</span></li><li><b>Reorder in two clicks</b><span>Your past orders, ready to go back in the bag.</span></li><li><b>Saved addresses</b><span>Home, office or a gift address, chosen at checkout.</span></li><li><b>Your wishlist</b><span>Keep the pieces you are considering, on any visit.</span></li></ul></aside></div>';
    }
    app.addEventListener('click', function (e) {
      var m = e.target.closest('[data-mode]'), f = e.target.closest('[data-forgot]');
      if (m) { mode = m.dataset.mode; draw(); }
      if (f) $('auNote').textContent = okMail(v('auMail')) ? 'If that address has an account, a reset link would be sent to it. (Not sent in this preview.)' : 'Enter your email address above and we will send a reset link.';
    });
    app.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = v('auMail'), pass = $('auPass').value, name = mode === 'up' ? v('auName') : '';
      if (mode === 'up' && name.length < 2) return void ($('auNote').textContent = 'Please enter your full name.');
      if (!okMail(mail)) return void ($('auNote').textContent = 'Please enter a valid email address.');
      if (pass.length < 6) return void ($('auNote').textContent = 'The password needs 6 characters or more.');
      var old = S.user.read(), u;
      if (mode === 'in' && old && old.email.toLowerCase() === mail.toLowerCase()) { u = old; u.out = false; }
      else { var guess = mail.split('@')[0].replace(/[._\d-]+/g, ' ').trim().replace(/\b\w/g, function (c) { return c.toUpperCase(); }) || 'Guest'; u = { name: name || guess, email: mail, phone: mode === 'up' ? v('auPhone') : '', since: new Date().toISOString(), news: mode === 'up' ? $('auNews').checked : true }; }
      S.user.write(u); seed(u);
      try { sessionStorage.removeItem('hemmings.next'); } catch (e2) {}
      location.href = next === 'checkout' ? page('checkout') : page('account');
    });
    draw();
  };

  /* ---------- the account ---------- */
  function itemsHtml(o) { return o.items.map(function (l) { return '<div class="ac-item"><a class="pic" href="' + page('product') + '#' + l.id + '"><img src="img/' + l.img + '.jpg" alt="" loading="lazy"></a><div><h3><a href="' + page('product') + '#' + l.id + '">' + esc(l.name) + '</a></h3><span>' + esc(l.variant) + '</span><span>Qty ' + l.qty + '</span></div><b>' + money(l.price * l.qty) + '</b></div>'; }).join(''); }
  function orderRow(o) {
    var n = o.items.reduce(function (t, l) { return t + l.qty; }, 0);
    return '<article class="ac-order"><header><div><a class="ac-id" href="#order/' + o.id + '">' + o.id + '</a><span>' + fmt(o.date) + ' &middot; ' + n + (n === 1 ? ' piece' : ' pieces') + (o.sample ? ' &middot; sample' : '') + '</span></div>' + badge(o.status) + '</header>' +
      '<div class="ac-row"><div class="ac-thumbs">' + o.items.slice(0, 4).map(function (l) { return '<span class="pic"><img src="img/' + l.img + '.jpg" alt="' + esc(l.name) + '" loading="lazy"></span>'; }).join('') + '</div><strong>' + money(o.total) + '</strong>' +
      '<div class="ac-acts"><a class="cta sm" href="#order/' + o.id + '">' + (OPEN.indexOf(o.status) > -1 ? 'Track Order' : 'View Order') + '</a><button type="button" class="cta sm ghost" data-reorder="' + o.id + '">Buy Again</button></div></div></article>';
  }
  function tracker(o) {
    if (o.status === 'cancelled') return '<p class="ac-flag">This order was cancelled on ' + fmt(o.log.cancelled) + '. Nothing was charged.</p>';
    var at = o.status === 'returning' ? 4 : STEPS.map(function (s) { return s[0]; }).indexOf(o.status);
    return '<ol class="ac-track" style="--at:' + at + '">' + STEPS.map(function (s, i) { return '<li class="' + (i < at ? 'done' : i === at ? 'done now' : '') + '"><i></i><b>' + s[1] + '</b><span>' + (o.log[s[0]] ? fmt(o.log[s[0]]) : i === at + 1 ? 'Next' : '') + '</span></li>'; }).join('') + '</ol>' +
      (o.status === 'returning' ? '<p class="ac-flag">Return requested on ' + fmt(o.log.returning) + (o.reason ? ' (' + esc(o.reason) + ')' : '') + '. A courier pickup is arranged within 2 working days.</p>' : '');
  }
  var VIEWS = {
    overview: function (u) {
      var os = orders(), open = os.filter(function (o) { return OPEN.indexOf(o.status) > -1; }), def = S.addresses.read().filter(function (a) { return a.def; })[0];
      return '<div class="ac-stats"><a href="#orders"><b>' + os.length + '</b><span>Orders</span></a><a href="#orders"><b>' + open.length + '</b><span>In progress</span></a><a href="#wishlist"><b>' + S.wish.read().length + '</b><span>Wishlist</span></a><a href="#addresses"><b>' + S.addresses.read().length + '</b><span>Addresses</span></a></div>' +
        '<div class="ac-h"><h2 class="h">Latest <em>order</em></h2><a class="go" href="#orders">All orders</a></div>' + (os[0] ? orderRow(os[0]) + (os[0].status !== 'cancelled' ? '<div class="ac-card">' + tracker(os[0]) + '</div>' : '') : '<p class="ac-empty">No orders yet. <a href="' + page('bedding') + '">Start with bedding</a>.</p>') +
        '<div class="ac-two"><div class="ac-card"><h3 class="lab">Default address</h3>' + (def ? '<p>' + addrHtml(def) + '</p>' : '<p>No address saved yet.</p>') + '<a class="go" href="#addresses">Manage addresses</a></div>' +
        '<div class="ac-card"><h3 class="lab">Profile</h3><p><strong>' + esc(u.name) + '</strong><br>' + esc(u.email) + (u.phone ? '<br>' + esc(u.phone) : '') + '<br>Member since ' + fmt(u.since) + '</p><a class="go" href="#profile">Edit profile</a></div></div>';
    },
    orders: function () {
      var f = st.filter, q = st.q.toLowerCase();
      var list = orders().filter(function (o) { return (f === 'all' || (f === 'open' && OPEN.indexOf(o.status) > -1) || (f === 'done' && o.status === 'delivered') || (f === 'closed' && (o.status === 'cancelled' || o.status === 'returning'))) && (!q || (o.id + ' ' + o.items.map(function (l) { return l.name; }).join(' ')).toLowerCase().indexOf(q) > -1); });
      return '<div class="ac-h"><h2 class="h">Order <em>history</em></h2></div><div class="ac-tools"><div class="tabs" role="group" aria-label="Filter orders">' + [['all', 'All'], ['open', 'In progress'], ['done', 'Delivered'], ['closed', 'Cancelled & returns']].map(function (x) { return '<button type="button" data-filter="' + x[0] + '" aria-pressed="' + (f === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<label class="sr" for="acQ">Search orders</label><input id="acQ" type="search" placeholder="Search by order number or product" value="' + esc(st.q) + '"></div>' +
        '<div id="acList">' + (list.map(orderRow).join('') || '<p class="ac-empty">No orders match.</p>') + '</div>';
    },
    order: function (u, id, flag) {
      var o = orders().filter(function (x) { return x.id === id; })[0];
      if (!o) return '<p class="ac-empty">We could not find order ' + esc(id) + ' in this browser. <a href="#track">Try another number</a>.</p>';
      var can = o.status === 'placed' || o.status === 'confirmed', back = o.status === 'delivered' && Date.now() - new Date(o.log.delivered) < RETURN_DAYS * DAY;
      return (flag === 'thanks' ? '<div class="ac-thanks"><h2 class="h">Thank you. Your order is <em>placed.</em></h2><p>A confirmation would be sent to ' + esc(o.email || (u && u.email) || 'your email address') + '. You can follow every step from this page.</p></div>' : '') +
        '<a class="ac-back" href="#orders">&larr; All orders</a><div class="ac-h"><div><h2 class="h">Order ' + o.id + '</h2><p>Placed on ' + fmt(o.date) + (o.sample ? ' &middot; sample order for this preview' : '') + '</p></div>' + badge(o.status) + '</div>' +
        '<div class="ac-card">' + tracker(o) + (o.ref && o.status !== 'cancelled' ? '<p class="ac-ref">Courier reference <b>' + o.ref + '</b></p>' : '') + '</div>' +
        '<div class="ac-split"><div class="ac-card"><h3 class="lab">Items</h3>' + itemsHtml(o) + '</div><div><div class="ac-card"><h3 class="lab">Summary</h3><dl class="ac-sum"><dt>Subtotal</dt><dd>' + money(o.sub) + '</dd><dt>Delivery</dt><dd>' + (o.ship ? money(o.ship) : 'Free') + '</dd><dt>Total</dt><dd>' + money(o.total) + '</dd></dl><p class="ac-pay">Payment: ' + esc(o.pay) + '</p></div>' +
        '<div class="ac-card"><h3 class="lab">Delivery address</h3><p>' + addrHtml(o.addr) + '</p></div></div></div>' +
        '<div class="ac-acts wide"><button type="button" class="cta" data-reorder="' + o.id + '">Buy Again</button>' + (can ? '<button type="button" class="cta ghost" data-cancel="' + o.id + '">Cancel Order</button>' : '') + (back ? '<button type="button" class="cta ghost" data-return="' + o.id + '">Return or Exchange</button>' : '') + '<button type="button" class="cta ghost" data-print>Print Invoice</button><a class="go" href="' + page('contact') + '">Need help with this order?</a></div><div id="acAsk"></div>';
    },
    addresses: function () {
      var list = S.addresses.read();
      if (st.edit) { var a = list.filter(function (x) { return x.id === st.edit; })[0] || {};
        return '<div class="ac-h"><h2 class="h">' + (a.id ? 'Edit' : 'Add an') + ' <em>address</em></h2></div><form class="ac-form" id="adForm" novalidate>' + field('adLabel', 'Label (Home, Office)', 'text', a.label || 'Home') + field('adName', 'Full name', 'text', a.name, { auto: 'name' }) + field('adPhone', 'Mobile number', 'tel', a.phone, { auto: 'tel' }) + field('adLine', 'House, street and area', 'text', a.line, { auto: 'street-address', wide: true }) + pickList('adCity', 'City', CITIES, a.city) + pickList('adProv', 'Province', PROV, a.prov) +
          '<label class="ck wide"><input type="checkbox" id="adDef"' + (a.def || !list.length ? ' checked' : '') + '>Use as my default delivery address</label><div class="ac-acts wide"><button type="submit" class="cta">Save Address</button><button type="button" class="cta ghost" data-edit="">Cancel</button></div><p class="au-note" id="adNote" role="status"></p></form>'; }
      return '<div class="ac-h"><h2 class="h">Saved <em>addresses</em></h2><button type="button" class="cta sm" data-edit="new">Add Address</button></div><div class="ac-two">' + (list.map(function (a) { return '<div class="ac-card"><h3 class="lab">' + esc(a.label) + (a.def ? ' &middot; default' : '') + (a.sample ? ' &middot; sample' : '') + '</h3><p>' + addrHtml(a) + '</p><div class="ac-links"><button type="button" class="txt" data-edit="' + a.id + '">Edit</button>' + (a.def ? '' : '<button type="button" class="txt" data-def="' + a.id + '">Make default</button>') + '<button type="button" class="txt" data-del="' + a.id + '">Remove</button></div></div>'; }).join('') || '<p class="ac-empty">No addresses saved yet.</p>') + '</div>';
    },
    wishlist: function () {
      var list = S.wish.read().map(HM.byId).filter(Boolean);
      return '<div class="ac-h"><h2 class="h">Your <em>wishlist</em></h2><span>' + list.length + (list.length === 1 ? ' piece' : ' pieces') + '</span></div>' + (list.length ? '<div class="pg four">' + list.map(function (p, i) { return HM.card(p, i); }).join('') + '</div>' : '<p class="ac-empty">Nothing saved yet. Tap the heart on any product to keep it here. <a href="' + page('new') + '">See what is new</a>.</p>');
    },
    profile: function (u) {
      return '<div class="ac-h"><h2 class="h">Your <em>profile</em></h2></div><form class="ac-form" id="pfForm" novalidate>' + field('pfName', 'Full name', 'text', u.name, { auto: 'name' }) + field('pfMail', 'Email address', 'email', u.email, { auto: 'email' }) + field('pfPhone', 'Mobile number', 'tel', u.phone, { auto: 'tel', opt: true }) +
        '<label class="ck wide"><input type="checkbox" id="pfNews"' + (u.news ? ' checked' : '') + '>Send me new arrivals and offers by email</label><div class="ac-acts wide"><button type="submit" class="cta">Save Changes</button></div><p class="au-note" id="pfNote" role="status"></p></form>' +
        '<div class="ac-two"><div class="ac-card"><h3 class="lab">Password</h3><p>Change the password you sign in with.</p><button type="button" class="txt" data-pass>Send me a reset link</button></div><div class="ac-card"><h3 class="lab">This preview</h3><p>Your account, orders, addresses and wishlist are kept in this browser only.</p><button type="button" class="txt" data-wipe>Clear everything and sign out</button></div></div>';
    },
    track: function () {
      return '<div class="ac-h"><h2 class="h">Track an <em>order</em></h2></div><form class="ac-form one" id="trForm" novalidate>' + field('trId', 'Order number (for example HM-488075)', 'text', '') + '<div class="ac-acts wide"><button type="submit" class="cta">Track Order ' + arrow + '</button></div><p class="au-note" id="trNote" role="status"></p></form>' +
        '<p class="ac-empty">Your order number is in your confirmation email and SMS. Signed in? <a href="#orders">See all your orders</a>.</p>';
    }
  };
  var st = { filter: 'all', q: '', edit: '' };
  var NAV = [['overview', 'Overview'], ['orders', 'Orders'], ['addresses', 'Addresses'], ['wishlist', 'Wishlist'], ['profile', 'Profile'], ['track', 'Track an Order']];
  HM.accountPage = function () {
    app = $('app');
    function route() {
      var u = HM.user.get(), parts = (location.hash.slice(1) || 'overview').split('/'), view = VIEWS[parts[0]] ? parts[0] : 'overview';
      if (!u && ['wishlist', 'track', 'order'].indexOf(view) < 0) { location.replace(page('login')); return; }
      if (view !== 'addresses') st.edit = '';
      document.title = 'My Account | Hemmings';
      app.innerHTML = '<div class="ac-top"><div><span class="lab">My account</span><h1 class="h">' + (u ? 'Hello, <em>' + esc(u.name.split(' ')[0]) + '</em>' : 'Your <em>Hemmings</em>') + '</h1></div>' + (u ? '<button type="button" class="txt" data-out>Sign out</button>' : '<a class="cta sm" href="' + page('login') + '">Sign In or Register</a>') + '</div>' +
        '<div class="ac"><nav class="ac-nav" aria-label="Account">' + NAV.filter(function (n) { return u || n[0] === 'wishlist' || n[0] === 'track'; }).map(function (n) { return '<a href="#' + n[0] + '"' + (n[0] === view || (view === 'order' && n[0] === 'orders') ? ' aria-current="page"' : '') + '>' + n[1] + '</a>'; }).join('') + '</nav><section class="ac-main" id="view">' + VIEWS[view](u, parts[1], parts[2]) + '</section></div>';
      window.scrollTo(0, 0);
    }
    function ask(html) { $('acAsk').innerHTML = '<div class="ac-card ask">' + html + '</div>'; $('acAsk').scrollIntoView({ block: 'nearest' }); }
    app.addEventListener('click', function (e) {
      var b = e.target.closest('button, a'); if (!b) return; var d = b.dataset, o;
      if (d.filter) { st.filter = d.filter; route(); }
      else if (d.reorder) { o = orders().filter(function (x) { return x.id === d.reorder; })[0]; var bag = HM.bag.read(); o.items.forEach(function (l) { var key = l.id + '/' + l.variant, hit = bag.filter(function (x) { return x.key === key; })[0]; if (hit) hit.qty += l.qty; else bag.push({ key: key, id: l.id, name: l.name, variant: l.variant, price: l.price, qty: l.qty, img: l.img }); }); HM.bag.write(bag); HM.toast('<span>' + o.items.length + (o.items.length === 1 ? ' item' : ' items') + ' added to your bag</span><a href="' + page('bag') + '">View bag</a>'); }
      else if (d.cancel) ask('<h3 class="lab">Cancel this order?</h3><p>It has not been dispatched yet, so it can be cancelled in full.</p><div class="ac-acts"><button type="button" class="cta" data-cancel-yes="' + d.cancel + '">Yes, Cancel Order</button><button type="button" class="cta ghost" data-ask-no>Keep Order</button></div>');
      else if (d.cancelYes) { o = orders().filter(function (x) { return x.id === d.cancelYes; })[0]; o.status = 'cancelled'; o.log.cancelled = new Date().toISOString(); saveOrder(o); route(); HM.toast('<span>Order ' + o.id + ' cancelled</span>'); }
      else if (d.return) ask('<h3 class="lab">Return or exchange</h3><p>Unused pieces in their original packaging can be returned within ' + RETURN_DAYS + ' days of delivery.</p><div class="fld"><label for="rtWhy">Reason</label><select id="rtWhy"><option>Wrong size</option><option>Colour is different from the photograph</option><option>Changed my mind</option><option>Arrived damaged or faulty</option></select></div><div class="ac-acts"><button type="button" class="cta" data-return-yes="' + d.return + '">Request Return</button><button type="button" class="cta ghost" data-ask-no>Not Now</button></div>');
      else if (d.returnYes) { o = orders().filter(function (x) { return x.id === d.returnYes; })[0]; o.status = 'returning'; o.reason = $('rtWhy').value; o.log.returning = new Date().toISOString(); saveOrder(o); route(); HM.toast('<span>Return requested for ' + o.id + '</span>'); }
      else if ('askNo' in d) $('acAsk').innerHTML = '';
      else if ('print' in d) window.print();
      else if ('edit' in d) { st.edit = d.edit; route(); }
      else if (d.def || d.del) { var list = S.addresses.read(); if (d.del) list = list.filter(function (a) { return a.id !== d.del; }); else list.forEach(function (a) { a.def = a.id === d.def; }); if (list.length && !list.some(function (a) { return a.def; })) list[0].def = true; S.addresses.write(list); route(); }
      else if ('pass' in d) HM.toast('<span>A reset link would be sent to your email. (Not sent in this preview.)</span>');
      else if ('out' in d) { var u = S.user.read(); u.out = true; S.user.write(u); location.href = page('login'); }
      else if ('wipe' in d) { ['user', 'orders', 'addresses', 'wish'].forEach(function (k) { S[k].write(null); }); location.href = page('login'); }
    });
    app.addEventListener('input', function (e) { if (e.target.id !== 'acQ') return; st.q = e.target.value; var pos = e.target.selectionStart; $('view').innerHTML = VIEWS.orders(); $('acQ').focus(); $('acQ').setSelectionRange(pos, pos); });
    app.addEventListener('submit', function (e) {
      e.preventDefault(); var id = e.target.id, u = HM.user.get();
      if (id === 'trForm') { var n = v('trId').toUpperCase().replace(/^(?!HM-)/, 'HM-'); if (orders().some(function (o) { return o.id === n; })) location.hash = 'order/' + n; else $('trNote').textContent = 'We could not find that order number. Please check it and try again.'; }
      else if (id === 'pfForm') { if (v('pfName').length < 2 || !okMail(v('pfMail'))) return void ($('pfNote').textContent = 'Please enter your name and a valid email address.'); u.name = v('pfName'); u.email = v('pfMail'); u.phone = v('pfPhone'); u.news = $('pfNews').checked; S.user.write(u); route(); HM.toast('<span>Profile saved</span>'); }
      else if (id === 'adForm') {
        if (!v('adName') || !v('adPhone') || v('adLine').length < 6) return void ($('adNote').textContent = 'Please add a name, a mobile number and the full street address.');
        var list = S.addresses.read(), a = { id: st.edit === 'new' ? 'a' + Date.now() : st.edit, label: v('adLabel') || 'Home', name: v('adName'), phone: v('adPhone'), line: v('adLine'), city: $('adCity').value, prov: $('adProv').value, def: $('adDef').checked };
        if (a.def) list.forEach(function (x) { x.def = false; });
        list = st.edit === 'new' ? list.concat(a) : list.map(function (x) { return x.id === a.id ? a : x; });
        if (!list.some(function (x) { return x.def; })) list[0].def = true;
        S.addresses.write(list); st.edit = ''; route(); HM.toast('<span>Address saved</span>');
      }
    });
    window.addEventListener('hashchange', route);
    route();
  };

  /* ---------- checkout ---------- */
  HM.checkoutPage = function () {
    app = $('app');
    var u = HM.user.get(), guest = /[?&]guest=1/.test(location.search), co = { addr: '', ship: 'std', pay: 'cod' };
    if (!u && !guest) { try { sessionStorage.setItem('hemmings.next', 'checkout'); } catch (e) {} location.replace(page('login')); return; }
    document.title = 'Checkout | Hemmings';
    var saved = u ? S.addresses.read() : []; co.addr = (saved.filter(function (a) { return a.def; })[0] || saved[0] || { id: 'new' }).id;
    function totals() { var b = HM.bag.read(), sub = b.reduce(function (n, l) { return n + l.qty * l.price; }, 0), ship = co.ship === 'exp' ? 500 : sub >= FREE_OVER ? 0 : 250; return { bag: b, sub: sub, ship: ship, total: sub + ship }; }
    function summary() {
      var t = totals();
      $('coSum').innerHTML = '<h2 class="h">Order <em>Summary</em></h2><div class="co-lines">' + t.bag.map(function (l) { return '<div class="ac-item"><span class="pic"><img src="img/' + l.img + '.jpg" alt=""><i>' + l.qty + '</i></span><div><h3>' + esc(l.name) + '</h3><span>' + esc(l.variant) + '</span></div><b>' + money(l.price * l.qty) + '</b></div>'; }).join('') + '</div>' +
        '<dl class="ac-sum"><dt>Subtotal</dt><dd>' + money(t.sub) + '</dd><dt>Delivery</dt><dd>' + (t.ship ? money(t.ship) : 'Free') + '</dd><dt>Total</dt><dd>' + money(t.total) + '</dd></dl><a class="go" href="' + page('bag') + '">Edit bag</a>';
    }
    var radio = function (name, val, title, sub, right) { return '<label class="co-opt"><input type="radio" name="' + name + '" value="' + val + '"' + (co[name] === val ? ' checked' : '') + '><span><b>' + title + '</b><small>' + sub + '</small></span>' + (right ? '<em>' + right + '</em>' : '') + '</label>'; };
    function draw() {
      var t = totals();
      if (!t.bag.length) { app.innerHTML = '<div class="ac-thanks"><h1 class="h">Your bag is <em>empty.</em></h1><p>Add something to your bag to check out.</p><a class="cta" href="' + page('bedding') + '">Shop Bedding</a></div>'; return; }
      app.innerHTML = '<div class="ac-top"><div><span class="lab">Secure checkout</span><h1 class="h">Checkout</h1></div><ol class="co-steps"><li class="done">Bag</li><li class="now">Details &amp; payment</li><li>Confirmation</li></ol></div>' +
        '<div class="co"><form id="coForm" novalidate>' +
        '<fieldset><legend><i>1</i>Contact</legend>' + (u ? '<p class="co-me">Signed in as <strong>' + esc(u.name) + '</strong> &middot; ' + esc(u.email) + '</p>' : '<p class="co-me">Checking out as a guest. <a href="' + page('login') + '">Sign in</a> for saved addresses and order history.</p><div class="ac-form">' + field('coMail', 'Email address', 'email', '', { auto: 'email', wide: true }) + '</div>') + '</fieldset>' +
        '<fieldset><legend><i>2</i>Delivery address</legend>' + saved.map(function (a) { return radio('addr', a.id, esc(a.label) + ' &middot; ' + esc(a.name), esc(a.line) + ', ' + esc(a.city) + ' &middot; ' + esc(a.phone)); }).join('') + (saved.length ? radio('addr', 'new', 'Use a new address', 'Enter it below') : '') +
        '<div class="ac-form" id="coNew"' + (co.addr === 'new' ? '' : ' hidden') + '>' + field('coName', 'Full name', 'text', u ? u.name : '', { auto: 'name' }) + field('coPhone', 'Mobile number', 'tel', u ? u.phone : '', { auto: 'tel' }) + field('coLine', 'House, street and area', 'text', '', { auto: 'street-address', wide: true }) + pickList('coCity', 'City', CITIES) + pickList('coProv', 'Province', PROV) + '</div></fieldset>' +
        '<fieldset><legend><i>3</i>Delivery</legend>' + radio('ship', 'std', 'Standard delivery', '3 to 5 working days, across Pakistan', t.sub >= FREE_OVER ? 'Free' : money(250)) + radio('ship', 'exp', 'Express delivery', '1 to 2 working days, major cities', money(500)) + '</fieldset>' +
        '<fieldset><legend><i>4</i>Payment</legend>' + radio('pay', 'cod', 'Cash on Delivery', 'Pay the courier when your order arrives') + radio('pay', 'card', 'Debit / Credit Card', 'Paid on the payment provider\'s secure page. Not taken in this preview.') + radio('pay', 'bank', 'Bank Transfer', 'Account details are sent with your confirmation') + '</fieldset>' +
        '<label class="ck"><input type="checkbox" id="coGift">This order is a gift: leave the prices off the packing slip</label>' +
        '<button type="submit" class="cta big">Place Order &middot; <span id="coTot">' + money(t.total) + '</span></button><p class="au-note" id="coNote" role="status"></p><p class="au-prev">Preview: placing the order saves it in this browser so you can see it in the account pages. Nothing is charged or sent.</p></form>' +
        '<aside class="co-sum" id="coSum" aria-label="Order summary"></aside></div>';
      summary();
    }
    app.addEventListener('change', function (e) {
      var t = e.target; if (t.type !== 'radio') return; co[t.name] = t.value;
      if (t.name === 'addr') $('coNew').hidden = t.value !== 'new';
      if (t.name === 'ship') { summary(); $('coTot').textContent = money(totals().total); }
    });
    app.addEventListener('submit', function (e) {
      e.preventDefault(); var t = totals(), a, mail = u ? u.email : v('coMail');
      if (!okMail(mail)) return void ($('coNote').textContent = 'Please enter a valid email address.');
      if (co.addr === 'new') {
        if (!v('coName') || v('coPhone').length < 7 || v('coLine').length < 6) return void ($('coNote').textContent = 'Please add your name, a mobile number and the full delivery address.');
        a = { id: 'a' + Date.now(), label: 'Home', name: v('coName'), phone: v('coPhone'), line: v('coLine'), city: $('coCity').value, prov: $('coProv').value, def: !saved.length };
        if (u) S.addresses.write(saved.concat(a));
      } else a = saved.filter(function (x) { return x.id === co.addr; })[0];
      var now = new Date().toISOString(), o = { id: 'HM-' + String(Date.now()).slice(-6), date: now, status: 'placed', email: mail, gift: $('coGift').checked, pay: { cod: 'Cash on Delivery', card: 'Debit / Credit Card', bank: 'Bank Transfer' }[co.pay], items: t.bag, sub: t.sub, ship: t.ship, total: t.total, addr: a, log: { placed: now } };
      S.orders.write([o].concat(orders())); HM.bag.write([]);
      location.href = page('account') + '#order/' + o.id + '/thanks';
    });
    draw();
  };
})();
