// Hemmings Bed Designer: selection state, panel UI, pricing and bag hand-off.
// Products come from data/catalogue.json; drawing lives in render.js; the bag in cart.js.
import { defsMarkup, fill, renderBed } from './render.js';
import { cart } from './cart.js';

const $ = (s) => document.querySelector(s);
const money = (n) => 'Rs. ' + n.toLocaleString('en-PK');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SAVE = 'hemmings.designer.v1';
const base = () => ({ size: 'queen', room: true, zoom: 1, sel: {}, pick: {}, open: ['bedsheets'], filters: { family: '', material: '', collection: '', price: '' }, lines: false });

let cat, state, note = null, busy = false, prevKeys = null;
const byId = {}, catOf = {}, pan = { x: 0, y: 0 };

init();

async function init() {
  cat = await (await fetch('data/catalogue.json')).json();
  for (const p of cat.products) { byId[p.id] = p; catOf[p.id] = cat.categories.find((c) => c.id === p.category); }
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SAVE)) || {}; } catch { /* start fresh */ }
  state = { ...base(), ...saved };
  for (const id of Object.keys(state.sel)) if (!byId[id]) delete state.sel[id];

  // A product page can open the designer with its product already on the bed: ?add=<product id>
  const add = new URLSearchParams(location.search).get('add');
  if (add && byId[add] && !state.sel[add]) { toggle(add); state.open = [byId[add].category]; }

  $('#defs').innerHTML = defsMarkup(cat.products.flatMap((p) => p.variants));
  const opts = (key) => [...new Set(cat.products.map((p) => p[key]))].sort().map((v) => `<option>${esc(v)}</option>`).join('');
  $('#filters').material.insertAdjacentHTML('beforeend', opts('material'));
  $('#filters').collection.insertAdjacentHTML('beforeend', opts('collection'));
  for (const [k, v] of Object.entries(state.filters)) $('#filters')[k].value = v;
  $('#bagLink').href = cart.bagUrl;
  $('#homeLink').href = cart.homeUrl;

  document.addEventListener('click', onClick);
  $('#filters').addEventListener('change', (e) => { state.filters[e.target.name] = e.target.value; draw(); });
  bindPan();
  draw();
  $('#bagCount').textContent = await cart.count();
}

/* ---------- state ---------- */

const priceOf = (p) => (typeof p.price === 'number' ? p.price : p.price[state.size]);
const pickOf = (p) => state.sel[p.id]?.v ?? state.pick[p.id] ?? 0;
const groupOf = (c) => c.group || c.id;
const catQty = (cid) => Object.entries(state.sel).reduce((n, [id, s]) => n + (catOf[id].id === cid ? s.q : 0), 0);

function toggle(id) {
  const p = byId[id], c = catOf[id];
  if (state.sel[id]) { delete state.sel[id]; return; }
  const v = state.pick[id] ?? 0;
  if (p.variants[v].soldOut) return;
  if (c.multi) {
    if (catQty(c.id) >= c.maxQty) { note = { err: `A bed holds up to ${c.maxQty} ${c.title.toLowerCase()}. Remove one to add another.` }; return; }
  } else {
    // One piece per layer: a new duvet cover replaces the old one, and a comforter replaces a duvet cover.
    for (const k of Object.keys(state.sel)) if (groupOf(catOf[k]) === groupOf(c)) delete state.sel[k];
  }
  state.sel[id] = { v, q: c.defaultQty || 1 };
}

function setQty(id, d) {
  const s = state.sel[id], c = catOf[id];
  if (!s) return;
  const room = c.multi ? c.maxQty - catQty(c.id) : (c.maxQty || 1) - s.q;
  if (d > 0 && room <= 0) return;
  s.q += d;
  if (s.q < 1) delete state.sel[id];
}

function lines() {
  return Object.entries(state.sel).map(([id, s]) => {
    const p = byId[id], v = p.variants[s.v], sized = typeof p.price !== 'number';
    const key = sized ? `${v.code}/${state.size}` : v.code;
    return {
      id, title: p.title, qty: s.q, price: priceOf(p), soldOut: !!v.soldOut,
      variant: sized ? `${v.name}, ${cat.sizes.find((z) => z.id === state.size).title}` : v.name,
      sku: `${p.sku}-${v.code}${sized ? '-' + state.size.toUpperCase() : ''}`,
      variantId: p.variantIds?.[key] ?? null,
    };
  });
}

function scene() {
  const one = (cid) => {
    const id = Object.keys(state.sel).find((k) => catOf[k].id === cid);
    return id ? { p: byId[id], paint: fill(byId[id].variants[state.sel[id].v]), q: state.sel[id].q, v: byId[id].variants[state.sel[id].v] } : null;
  };
  const fr = one('frames'), sh = one('bedsheets'), fi = one('fitted'), fl = one('flat'), dc = one('duvet-covers'), ins = one('inserts'),
    co = one('comforters'), bl = one('blankets'), pi = one('pillows'), pc = one('pillowcases'), th = one('throws');
  const n = Math.max(pi?.q || 0, pc?.q || 0);
  const cushions = [];
  for (const [id, s] of Object.entries(state.sel)) if (catOf[id].id === 'cushions') for (let i = 0; i < s.q; i++) cushions.push(fill(byId[id].variants[s.v]));
  return {
    size: state.size, room: state.room,
    frame: fr ? { style: fr.p.style, hex: fr.v.hex } : { style: 'platform', hex: '#CDBB9C' },
    mattress: fi?.paint || sh?.paint || '#F4F1EA',
    flat: fl?.paint || sh?.paint || null,
    top: dc ? { kind: 'duvet', fill: dc.paint } : co ? { kind: 'comforter', fill: co.paint } : ins ? { kind: 'duvet', fill: '#F6F3EC' } : null,
    blanket: bl?.paint || null,
    throw: th?.paint || null,
    pillows: Array.from({ length: n }, (_, i) => (i < (pc?.q || 0) ? pc.paint : '#F6F3EC')),
    cushions,
  };
}

/* ---------- drawing ---------- */

function draw() {
  const sc = scene();
  const keys = { frame: JSON.stringify(sc.frame), mattress: sc.mattress, flat: sc.flat, top: JSON.stringify(sc.top), blanket: sc.blanket, throw: sc.throw, pillows: sc.pillows.join(), cushions: sc.cushions.join(), size: sc.size };
  const changed = new Set();
  if (prevKeys && prevKeys.size === keys.size) for (const k of Object.keys(keys)) if (keys[k] !== prevKeys[k]) changed.add(k);
  prevKeys = keys;
  renderBed($('#bed'), sc, changed);
  if (state.zoom === 1) { pan.x = 0; pan.y = 0; }
  $('#bed').style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${state.zoom})`;
  $('#viewport').classList.toggle('pannable', state.zoom > 1);
  drawTools(); drawPanel(); drawDock();
  localStorage.setItem(SAVE, JSON.stringify(state));
}

function drawTools() {
  const has = Object.keys(state.sel).length > 0;
  $('#tools').innerHTML = `
<div class="seg" role="group" aria-label="Bed size">${cat.sizes.map((z) => `<button data-act="size" data-v="${z.id}" aria-pressed="${state.size === z.id}">${z.title}</button>`).join('')}</div>
<button class="tool" data-act="room" aria-pressed="${state.room}">${state.room ? 'Hide room' : 'Show room'}</button>
<div class="seg" role="group" aria-label="Zoom"><button data-act="zoom" data-v="-1" aria-label="Zoom out" ${state.zoom <= 1 ? 'disabled' : ''}>&minus;</button><button data-act="zoom" data-v="1" aria-label="Zoom in" ${state.zoom >= 2 ? 'disabled' : ''}>+</button></div>
<span class="spacer"></span>
${has ? '<button class="tool" data-act="clear">Clear pieces</button>' : ''}
<button class="tool" data-act="reset">Reset</button>`;
}

function passes(p) {
  const f = state.filters;
  if (f.family && !p.variants.some((v) => v.family === f.family)) return false;
  if (f.material && p.material !== f.material) return false;
  if (f.collection && p.collection !== f.collection) return false;
  if (f.price && priceOf(p) >= +f.price) return false;
  return true;
}

function drawPanel() {
  $('#chips').innerHTML = cat.categories.map((c) => `<button data-act="chip" data-v="${c.id}" aria-pressed="${state.open.includes(c.id)}">${c.title}</button>`).join('');
  $('#cats').innerHTML = cat.categories.map((c) => {
    const open = state.open.includes(c.id), n = catQty(c.id);
    const list = cat.products.filter((p) => p.category === c.id && (passes(p) || state.sel[p.id]));
    const rows = !open ? '' : `<ul class="rows" id="rows-${c.id}">${list.map((p) => row(p, c)).join('') || '<li class="empty">No pieces match these filters.</li>'}</ul>`;
    return `<section class="cat" id="cat-${c.id}"><button class="cat-btn" data-act="cat" data-v="${c.id}" aria-expanded="${open}" aria-controls="rows-${c.id}">${c.title}${n ? `<small>${n} on your bed</small>` : ''}<i></i></button>${rows}</section>`;
  }).join('');
}

function row(p, c) {
  const s = state.sel[p.id], vi = pickOf(p), v = p.variants[vi];
  const paint = c.id === 'frames' ? v.hex : fill(v);
  const dots = p.variants.map((x, i) => `<button class="dot${x.soldOut ? ' out' : ''}" data-act="pick" data-id="${p.id}" data-v="${i}" aria-pressed="${i === vi}" aria-label="${esc(x.name)}${x.soldOut ? ', sold out' : ''}" title="${esc(x.name)}"><b style="background:${x.accent && x.pattern !== 'herringbone' ? `linear-gradient(90deg, ${x.hex} 50%, ${x.accent} 50%)` : x.hex}"></b></button>`).join('');
  const max = c.multi ? s && catQty(c.id) >= c.maxQty : s && s.q >= (c.maxQty || 1);
  const qty = s && (c.maxQty || 1) > 1 ? `<div class="qty" role="group" aria-label="Quantity"><button data-act="qty" data-id="${p.id}" data-v="-1" aria-label="One fewer">&minus;</button><span>${s.q}</span><button data-act="qty" data-id="${p.id}" data-v="1" aria-label="One more" ${max ? 'disabled' : ''}>+</button></div>` : '';
  return `<li class="row${s ? ' on' : ''}">
<svg class="thumb" viewBox="0 0 56 56" aria-hidden="true"><rect width="56" height="56" fill="${paint}"/></svg>
<div><div class="row-title">${esc(p.title)}</div><div class="row-meta">${esc(p.material)}</div><div class="dots">${dots}</div><div class="vname">${esc(v.name)}${v.soldOut ? ' · sold out' : ''}</div></div>
<div class="row-side"><div class="price">${money(priceOf(p))}</div>${qty}<button class="add" data-act="toggle" data-id="${p.id}" ${v.soldOut && !s ? 'disabled' : ''}>${s ? 'Remove' : v.soldOut ? 'Sold out' : 'Add'}</button></div>
</li>`;
}

function drawDock() {
  const ls = lines(), pieces = ls.reduce((n, l) => n + l.qty, 0), total = ls.reduce((n, l) => n + l.qty * l.price, 0);
  const list = state.lines && ls.length ? `<div class="lines" id="lines">${ls.map((l) => `<div class="line"><div>${esc(l.title)}<small>${esc(l.variant)}</small></div><div>&times; ${l.qty}</div><div>${money(l.price * l.qty)}</div><button class="x" data-act="toggle" data-id="${l.id}" aria-label="Remove ${esc(l.title)}">Remove</button></div>`).join('')}</div>` : '';
  let msg = '';
  if (note?.ok) msg = `<div class="note" role="status"><span>${note.ok} ${note.ok === 1 ? 'piece' : 'pieces'} added to your bag.</span><button data-act="dismiss">Continue designing</button><a href="${cart.checkoutUrl}">Proceed to checkout</a></div>`;
  else if (note?.err) msg = `<div class="note err" role="alert"><span>${esc(note.err)}</span><button data-act="dismiss">Dismiss</button></div>`;
  $('#dock').innerHTML = `${list}${msg}<div class="dock-bar">
<button class="sum-btn" data-act="lines" aria-expanded="${state.lines && ls.length > 0}" ${ls.length ? '' : 'disabled'}>${pieces ? `Your composition · ${pieces} ${pieces === 1 ? 'piece' : 'pieces'}` : 'Your composition is empty'}${ls.length ? '<i></i>' : ''}</button>
<div class="total"><small>Total</small><strong>${money(total)}</strong></div>
<button class="cta" data-act="bag" ${!ls.length || busy ? 'disabled' : ''}>${busy ? 'Adding…' : 'Add Your Composition to Bag'}</button></div>`;
}

/* ---------- events ---------- */

function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const { act, id, v } = b.dataset;
  if (act !== 'bag') note = null;
  if (act === 'toggle') toggle(id);
  else if (act === 'pick') { state.pick[id] = +v; if (state.sel[id] && !byId[id].variants[+v].soldOut) state.sel[id].v = +v; }
  else if (act === 'qty') setQty(id, +v);
  else if (act === 'cat') state.open = state.open.includes(v) ? state.open.filter((x) => x !== v) : [...state.open, v];
  else if (act === 'chip') { state.open = [v]; }
  else if (act === 'size') state.size = v;
  else if (act === 'room') state.room = !state.room;
  else if (act === 'zoom') state.zoom = Math.min(2, Math.max(1, state.zoom + 0.25 * +v));
  else if (act === 'clear') state.sel = {};
  else if (act === 'reset') { state = base(); for (const k of Object.keys(state.filters)) $('#filters')[k].value = ''; }
  else if (act === 'lines') state.lines = !state.lines;
  else if (act === 'bag') return addToBag();
  draw();
  if (act === 'chip') document.getElementById(`cat-${v}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

async function addToBag() {
  const ls = lines();
  if (!ls.length) return;
  const out = ls.find((l) => l.soldOut);
  if (out) { note = { err: `${out.title} in ${out.variant} is sold out. Choose another colour or remove it.` }; return draw(); }
  busy = true; note = null; draw();
  try {
    await cart.add(ls);
    note = { ok: ls.reduce((n, l) => n + l.qty, 0) };
    $('#bagCount').textContent = await cart.count();
  } catch (err) {
    note = { err: err.message };
  }
  busy = false; draw();
}

function bindPan() {
  const vp = $('#viewport');
  let from = null;
  vp.addEventListener('pointerdown', (e) => { if (state.zoom > 1) { from = { x: e.clientX - pan.x, y: e.clientY - pan.y }; vp.setPointerCapture(e.pointerId); } });
  vp.addEventListener('pointermove', (e) => {
    if (!from) return;
    const lim = (vp.clientWidth * (state.zoom - 1)) / 2, limY = (vp.clientHeight * (state.zoom - 1)) / 2;
    pan.x = Math.max(-lim, Math.min(lim, e.clientX - from.x));
    pan.y = Math.max(-limY, Math.min(limY, e.clientY - from.y));
    $('#bed').style.transition = 'none';
    $('#bed').style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${state.zoom})`;
  });
  const end = () => { from = null; $('#bed').style.transition = ''; };
  vp.addEventListener('pointerup', end);
  vp.addEventListener('pointercancel', end);
}
