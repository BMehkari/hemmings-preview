// Cart adapter. The designer only ever calls cart.add(lines) / cart.count().
// On the Shopify storefront it posts real variants to the store's own cart
// (same cart and checkout as every other page). In this prototype it writes to
// the same browser bag the rest of the site uses, so a composition shows up on the bag page.

const KEY = 'hemmings.bag.v3';
const V = { 2: 2, 3: 3 }[document.documentElement.dataset.v] || 1;
const local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const sitePages = { bag: `../v${V}-bag.html`, home: V !== 1 && local ? '../index.html' : '../index.html' };

const shopifyCart = {
  mode: 'shopify',
  bagUrl: '/cart',
  checkoutUrl: '/checkout',
  homeUrl: '/',
  async add(lines) {
    const missing = lines.find((l) => !l.variantId);
    if (missing) throw new Error(`${missing.title} is not linked to a store variant yet.`);
    const composition = `bed-${Date.now().toString(36)}`;
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: lines.map((l) => ({ id: l.variantId, quantity: l.qty, properties: { _composition: composition } })) }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.description || err.message || 'The bag could not be updated.');
    }
  },
  async count() {
    const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    return res.ok ? (await res.json()).item_count : 0;
  },
};

let mem = [];
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || mem; } catch { return mem; } };

const localCart = {
  mode: 'local',
  bagUrl: sitePages.bag,
  checkoutUrl: sitePages.bag,
  homeUrl: sitePages.home,
  async add(lines) {
    const bag = read();
    for (const l of lines) {
      const hit = bag.find((b) => b.key === l.sku);
      if (hit) hit.qty += l.qty;
      else bag.push({ key: l.sku, id: '', name: l.title, variant: `${l.variant} · from your bed composition`, price: l.price, qty: l.qty, img: 'h_ivory' });
    }
    mem = bag;
    try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch { /* kept in memory for this visit */ }
  },
  async count() { return read().reduce((n, b) => n + b.qty, 0); },
};

export const cart = window.Shopify ? shopifyCart : localCart;
