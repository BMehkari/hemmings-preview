// Hemmings Bed Designer: visualisation engine.
// Knows nothing about products, prices or the cart. It takes a plain "scene"
// (which fabric sits in which slot) and draws it, so it can be replaced by a
// photographic-layer or WebGL renderer without touching the rest of the app.

const WIDTH = { single: 0.62, queen: 0.86, king: 1 };
const CX = 600, Y0 = 335, Y1 = 600;

const patternId = (v) => (v.pattern && v.pattern !== 'solid' ? `p-${v.pattern}-${v.hex.slice(1)}-${(v.accent || 'x').replace('#', '')}` : null);

/** SVG paint for a catalogue variant: a flat colour or a generated weave pattern. */
export const fill = (v) => (patternId(v) ? `url(#${patternId(v)})` : v.hex);

function patternDef(id, v) {
  const a = v.accent || 'rgba(255,255,255,.4)';
  const p = (w, h, body) => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${v.hex}"/>${body}</pattern>`;
  switch (v.pattern) {
    case 'stripe': return p(18, 18, `<rect width="4" height="18" fill="${a}"/>`);
    case 'pinstripe': return p(11, 11, `<rect width="1.2" height="11" fill="${a}"/>`);
    case 'check': return p(30, 30, `<path d="M0 8H30M8 0V30" stroke="${a}" stroke-width="4" opacity=".75"/><path d="M0 22H30M22 0V30" stroke="${a}" stroke-width="1"/>`);
    case 'quilt': return p(46, 46, `<path d="M0 23L23 0L46 23L23 46Z" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1.6"/>`);
    case 'waffle': return p(12, 12, `<path d="M0 1H12M1 0V12" stroke="rgba(0,0,0,.17)" stroke-width="2"/>`);
    case 'herringbone': return p(20, 20, `<path d="M0 10L10 0L20 10M0 20L10 10L20 20" fill="none" stroke="${a}" stroke-width="2.2"/>`);
    default: return '';
  }
}

/** Shared <defs>: lighting gradients, the fabric grain filter and one pattern per patterned variant. */
export function defsMarkup(variants) {
  let out = `
<linearGradient id="g-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>
<linearGradient id="g-drop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
<linearGradient id="g-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
<radialGradient id="g-pillow" cx=".42" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>
<linearGradient id="g-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3EEE4"/><stop offset="1" stop-color="#E4DCCC"/></linearGradient>
<filter id="f-soft" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="f-fabric"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .34 0 0 0 -.09" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gg"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gg"/></feMerge></filter>`;
  const seen = new Set();
  for (const v of variants) {
    const id = patternId(v);
    if (id && !seen.has(id)) { seen.add(id); out += patternDef(id, v); }
  }
  return out;
}

/**
 * Draw a scene into an <svg viewBox="0 0 1200 800">.
 * scene: { size, room, frame:{style,hex}, mattress, flat, top:{kind,fill}, blanket, throw, pillows:[fill], cushions:[fill] }
 * changed: Set of slot names that should animate in.
 */
export function renderBed(svg, scene, changed = new Set()) {
  const w = WIDTH[scene.size] || WIDTH.queen;
  const hf = 255 * w, hn = 335 * w;
  const P = (u, v) => [CX + u * (hf + (hn - hf) * v), Y0 + (Y1 - Y0) * v];
  const pt = (a) => `${a[0].toFixed(1)},${a[1].toFixed(1)}`;
  const quad = (...pts) => `M${pts.map(pt).join('L')}Z`;
  const g = (slot, body) => `<g data-slot="${slot}"${changed.has(slot) ? ' class="enter"' : ''}>${body}</g>`;

  // A cover that lies on the bed from vTop to the foot and hangs over the front edge down to yb.
  const cover = (uTop, vTop, k, yb) => {
    const A = P(-uTop, vTop), B = P(uTop, vTop), xr = CX + hn * k, xl = CX - hn * k;
    const hang = `L${xr - 4},${yb - 14}Q${xr - 6},${yb} ${xr - 22},${yb}L${xl + 22},${yb}Q${xl + 6},${yb} ${xl + 4},${yb - 14}L${xl},${Y1}`;
    return {
      full: `M${pt(A)}L${pt(B)}L${xr},${Y1}${hang}Z`,
      top: `M${pt(A)}L${pt(B)}L${xr},${Y1}L${xl},${Y1}Z`,
      drop: `M${xr},${Y1}${hang}Z`,
      xl, xr,
    };
  };
  const lit = (c, paint) => `<path d="${c.full}" fill="${paint}"/><path d="${c.top}" fill="url(#g-top)"/><path d="${c.top}" fill="url(#g-side)"/><path d="${c.drop}" fill="url(#g-drop)"/><path d="M${c.xl},${Y1}H${c.xr}" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`;

  let room = `<rect width="1200" height="800" fill="#F7F4ED"/>`;
  if (scene.room) {
    room = `<rect width="1200" height="545" fill="url(#g-wall)"/>
<path d="M660 0H1200V400L930 545H520Z" fill="#fff" opacity=".28"/>
<rect y="545" width="1200" height="255" fill="#CFC2AA"/>
<path d="M0 600H1200M0 665H1200M0 740H1200" stroke="#000" stroke-opacity=".05"/>
<rect y="533" width="1200" height="12" fill="#F4EFE6"/>
<path d="M${CX - hn - 110},640H${CX + hn + 110}L${CX + hn + 180},775H${CX - hn - 180}Z" fill="#E8E0CF"/>`;
  }
  room += `<ellipse cx="${CX}" cy="738" rx="${hn + 50}" ry="20" fill="#000" opacity=".2" filter="url(#f-soft)"/>`;

  // Frame: headboard behind, rail and legs in front.
  const f = scene.frame, hx = CX - hf - 30, hw = (hf + 30) * 2;
  let head;
  if (f.style === 'arch') {
    head = `<path d="M${hx},${Y0 + 20}V250A${hw / 2},110 0 0 1 ${hx + hw},250V${Y0 + 20}Z" fill="${f.hex}"/>`;
  } else if (f.style === 'upholstered') {
    let channels = '';
    for (let i = 1; i < 7; i++) channels += `M${hx + (hw / 7) * i},178V${Y0 + 20}`;
    head = `<rect x="${hx}" y="165" width="${hw}" height="${Y0 - 145}" rx="34" fill="${f.hex}"/><path d="${channels}" stroke="#000" stroke-opacity=".13" stroke-width="2"/>`;
  } else {
    head = `<rect x="${hx}" y="195" width="${hw}" height="${Y0 - 175}" rx="4" fill="${f.hex}"/><path d="M${hx},240H${hx + hw}M${hx},285H${hx + hw}" stroke="#000" stroke-opacity=".1"/>`;
  }
  head += `<rect x="${hx}" y="160" width="${hw}" height="${Y0 - 140}" fill="url(#g-side)"/>`;
  const rail = `<rect x="${CX - hn - 14}" y="664" width="${hn * 2 + 28}" height="36" rx="3" fill="${f.hex}"/><rect x="${CX - hn - 14}" y="664" width="${hn * 2 + 28}" height="36" fill="url(#g-drop)"/>
<rect x="${CX - hn + 6}" y="700" width="18" height="34" fill="${f.hex}"/><rect x="${CX + hn - 24}" y="700" width="18" height="34" fill="${f.hex}"/><path d="M${CX - hn + 6},700h18v34h-18zM${CX + hn - 24},700h18v34h-18z" fill="#000" opacity=".22"/>`;

  // Mattress, dressed by the fitted sheet.
  const top = quad(P(-1, 0), P(1, 0), P(1, 1), P(-1, 1));
  const face = `M${CX - hn},${Y1}H${CX + hn}V660Q${CX + hn},668 ${CX + hn - 8},668H${CX - hn + 8}Q${CX - hn},668 ${CX - hn},660Z`;
  const mattress = `<path d="${top}" fill="${scene.mattress}"/><path d="${top}" fill="url(#g-top)"/><path d="${face}" fill="${scene.mattress}"/><path d="${face}" fill="url(#g-drop)"/>`;

  let flat = '';
  if (scene.flat) {
    const band = quad(P(-1.02, 0.3), P(1.02, 0.3), P(1.02, 0.41), P(-1.02, 0.41));
    const body = scene.top ? '' : lit(cover(1.02, 0.4, 1.03, 692), scene.flat);
    flat = `${body}<path d="${band}" fill="${scene.flat}"/><path d="${band}" fill="#fff" opacity=".22"/><path d="M${pt(P(-1.02, 0.41))}L${pt(P(1.02, 0.41))}" stroke="#000" stroke-opacity=".16" stroke-width="2"/>`;
  }

  let topLayer = '';
  if (scene.top) {
    const c = cover(1.05, 0.38, 1.06, 690);
    topLayer = lit(c, scene.top.fill);
    if (scene.top.kind === 'duvet') {
      const cuff = quad(P(-1.05, 0.38), P(1.05, 0.38), P(1.055, 0.47), P(-1.055, 0.47));
      topLayer += `<path d="${cuff}" fill="#fff" opacity=".3"/><path d="M${pt(P(-1.055, 0.47))}L${pt(P(1.055, 0.47))}" stroke="#000" stroke-opacity=".14" stroke-width="2"/>`;
    }
    for (const v of [0.62, 0.8]) {
      const a = P(-1, v), b = P(1, v);
      topLayer += `<path d="M${pt(a)}Q${CX},${a[1] + 16} ${pt(b)}" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="3"/>`;
    }
  }

  let blanket = '';
  if (scene.blanket) {
    const c = cover(1.075, 0.74, 1.085, 678);
    blanket = `${lit(c, scene.blanket)}<path d="M${pt(P(-1.075, 0.74))}L${pt(P(1.075, 0.74))}" stroke="#000" stroke-opacity=".2" stroke-width="2.5"/>`;
  }

  let thr = '';
  if (scene.throw) {
    const A = P(0.18, 0.66), B = P(0.8, 0.6), C = P(1.03, 1), F = P(0.32, 1), yb = 708;
    const d = `M${pt(A)}L${pt(B)}L${pt(C)}L${C[0] - 8},${yb}L${F[0] + 6},${yb}L${pt(F)}Z`;
    const hang = `M${pt(F)}L${pt(C)}L${C[0] - 8},${yb}L${F[0] + 6},${yb}Z`;
    thr = `<path d="${d}" fill="${scene.throw}"/><path d="${hang}" fill="url(#g-drop)"/><path d="M${pt(F)}L${pt(C)}" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/><path d="M${F[0] + 8},${yb + 5}H${C[0] - 10}" stroke="${scene.throw}" stroke-width="10" stroke-dasharray="2 4"/>`;
  }

  // Pillows: two across, back row first; cushions sit in front.
  const pw = hf * 0.9, ph = 96;
  const pillow = (cx, y, paint) => `<rect x="${cx - pw / 2}" y="${y}" width="${pw}" height="${ph}" rx="30" fill="${paint}"/><rect x="${cx - pw / 2}" y="${y}" width="${pw}" height="${ph}" rx="30" fill="url(#g-pillow)"/><rect x="${cx - pw / 2 + 7}" y="${y + 7}" width="${pw - 14}" height="${ph - 14}" rx="24" fill="none" stroke="#000" stroke-opacity=".07"/>`;
  const n = scene.pillows.length, off = hf * 0.5;
  const spots = [[], [[0, 262]], [[-off, 258], [off, 258]], [[-off, 250], [off, 250], [0, 292]], [[-off, 250], [off, 250], [-off * 0.96, 292], [off * 0.96, 292]]][Math.min(n, 4)];
  let pillows = n ? `<ellipse cx="${CX}" cy="${Y0 + 62}" rx="${hf * 0.95}" ry="12" fill="#000" opacity=".16" filter="url(#f-soft)"/>` : '';
  spots.forEach(([dx, y], i) => { pillows += pillow(CX + dx, y, scene.pillows[i]); });

  const cs = 86, cn = scene.cushions.length;
  const cspots = [[], [0], [-0.3, 0.3], [-0.5, 0, 0.5]][Math.min(cn, 3)];
  let cushions = '';
  cspots.forEach((u, i) => {
    const x = CX + u * hf - cs / 2, y = 338 + (u === 0 ? 8 : 0), r = [-5, 3, 6][i];
    cushions += `<g transform="rotate(${r} ${x + cs / 2} ${y + cs / 2})"><rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="16" fill="${scene.cushions[i]}"/><rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="16" fill="url(#g-pillow)"/></g>`;
  });

  svg.innerHTML = `${room}${g('frame', head)}<g filter="url(#f-fabric)">${g('mattress', mattress)}${g('flat', flat)}${g('top', topLayer)}${g('blanket', blanket)}</g>${g('frame', rail)}<g filter="url(#f-fabric)">${g('throw', thr)}${g('pillows', pillows)}${g('cushions', cushions)}</g>`;
}
