// Hemmings versions 4 and 5: the floating silk cloth, shared (version 3 carries its own copy inline in v3.html).
// One loose square of silk drifts down the page with the scroll, carrying the arch emblem and the HEMMINGS wordmark,
// tinted to the palette accent (--metal) with the mark in the palette main colour (--deep). It needs <canvas id="silk">.
// window.HM_SILK = { scale: 1.2 } makes the cloth larger.
(function silk() {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, opt = window.HM_SILK || {}, MF = opt.font || 'Libre Caslon Display', K = (opt.scale || 1) * 0.65;   // 0.65: the cloth was made 35% smaller at the client's request (2026-11-20)
  var cv = document.getElementById('silk'), gl = null;
  if (!cv) return;
  try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, depth: true }); } catch (e) {}
  if (!gl) { cv.style.display = 'none'; return; }
  var VS = [
    'attribute vec2 a;',
    'uniform vec2 uRes,uC,uM,uOff;',
    'uniform vec3 uRot;',
    'uniform float uS,uT,uPh,uFlat,uBend,uMAmp,uSh,uAsp;',
    'uniform vec3 uClk[4];',
    'varying vec3 vN;varying vec2 vUv;varying float vZ;',
    // the cloth: a flat square pushed into slow folds, one large bend, a swell under the pointer and rings from a click
    'vec3 def(vec2 p){',
    '  float w=1.-uFlat*.3;',
    '  float f1=sin(p.x*1.9+p.y*1.2+uT*.8+uPh),f2=sin(p.y*3.3-p.x*1.9+uT*1.1-uPh*.7),f3=sin(p.x*5.2+p.y*2.6+uT*1.5+uPh*2.),f4=sin(p.y*7.4-p.x*4.3-uT*1.2+uPh);',
    '  float z=w*(.24*f1+.13*f2*abs(f2)+.06*f3+.028*f4)+(.3+.7*w)*.03*sin(p.x*9.+p.y*6.+uPh*3.);',
    '  float cr=p.x*p.x*p.y*p.y;z-=w*.3*cr*(.6+.4*sin(uT*.9+p.x*2.+p.y*3.));',
    '  float ax=p.x*cos(uPh*.6)+p.y*sin(uPh*.6);',
    '  z+=uBend*ax*ax*.5;',
    '  vec2 dm=p-uM;z+=uMAmp*.3*exp(-dot(dm,dm)*2.4);',
    '  for(int i=0;i<4;i++){vec2 dc=p-uClk[i].xy;float dd=length(dc),age=uT-uClk[i].z;',
    '    if(age>0.&&age<3.5){z+=.13*sin(dd*8.-age*9.)*exp(-age*1.5)*smoothstep(age*2.4+.2,age*2.4-.9,dd);}}',
    '  vec2 xy=p*vec2(1.,uAsp);',
    '  xy+=w*.075*vec2(sin(p.y*2.6+uT*.6+uPh),sin(p.x*2.2+uT*.5-uPh));',
    '  xy*=1.-.05*z*z;',
    '  return vec3(xy,z);}',
    'vec3 rot(vec3 v){',
    '  float c=cos(uRot.y),s=sin(uRot.y);v=vec3(v.x*c+v.z*s,v.y,-v.x*s+v.z*c);',
    '  c=cos(uRot.x);s=sin(uRot.x);v=vec3(v.x,v.y*c-v.z*s,v.y*s+v.z*c);',
    '  c=cos(uRot.z);s=sin(uRot.z);return vec3(v.x*c-v.y*s,v.x*s+v.y*c,v.z);}',
    'void main(){',
    '  vec3 d0=def(a),dx=def(a+vec2(.02,0.))-d0,dy=def(a+vec2(0.,.02))-d0;',
    '  vN=rot(normalize(cross(dx,dy)));vUv=a;vZ=d0.z;',
    '  vec3 r=rot(d0);',
    '  float k=mix(1./(1.-r.z*.2*(1.-uFlat*.7)),1.,uSh);',
    '  vec2 sc=uC+r.xy*uS*k+uOff*uSh*(1.+r.z*.6);',
    '  gl_Position=vec4(sc.x/uRes.x*2.-1.,1.-sc.y/uRes.y*2.,-r.z*.3,1.);',
    '}'].join('\n');
  var FS = [
    'precision highp float;',
    'varying vec3 vN;varying vec2 vUv;varying float vZ;',
    'uniform vec3 uCol,uShade;',
    'uniform float uFade,uSh;',
    'uniform sampler2D tA,tB;',
    'uniform vec3 uInk;',
    'void main(){',
    '  vec2 e=1.-abs(vUv);',
    '  if(uSh>.5){float s=smoothstep(0.,.55,e.x)*smoothstep(0.,.55,e.y);gl_FragColor=vec4(0.,0.,0.,.2*s*uFade);return;}',
    '  vec3 n=normalize(vN);float back=step(n.z,0.);n*=1.-2.*back;',
    '  vec3 L=normalize(vec3(-.45,-.6,.66));',
    '  float dif=dot(n,L)*.5+.5;',
    '  float nh=max(dot(n,normalize(L+vec3(0.,0.,1.))),0.);float sp=.6*pow(nh,10.)+.6*pow(nh,60.);',
    '  float rim=pow(1.-n.z,2.);',
    '  float la=dot(texture2D(tA,vUv*.42+.5).rgb,vec3(.3,.59,.11));',
    '  float t=clamp((dif-.5)*1.7+.3+(la-.62)*.95+sp*.4+vZ*.22,0.,1.);',
    '  vec3 hi=mix(uCol,vec3(1.),.5);',
    '  vec3 col=mix(uShade*.8,uCol,smoothstep(.04,.6,t));',
    '  col=mix(col,hi,clamp(smoothstep(.66,1.,t)*.5+sp*.22,0.,1.));',
    '  col+=hi*rim*.1;',
    '  col*=1.-.24*back;',
    // the mark, stitched into the face of the cloth: the arch emblem over the Hemmings wordmark
    '  vec2 lu=vUv*.5+.5;float mk=texture2D(tB,lu).a,mh=texture2D(tB,lu+vec2(.0022)).a;',
    '  col=mix(col,uInk*(.8+.45*t),mk*mix(.92,.14,back));',
    '  col+=hi*.2*clamp(mh-mk,0.,1.)*(1.-back);',
    '  float m=min(e.x,e.y);col+=hi*.05*(smoothstep(.004,.01,m)-smoothstep(.016,.024,m));',   // hem
    '  gl_FragColor=vec4(col*uFade,uFade);',
    '}'].join('\n');
  function sh(type, src) { var x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(x)); return null; } return x; }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS), pr = gl.createProgram();
  if (!vs || !fs) { cv.style.display = 'none'; return; }
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.style.display = 'none'; return; }
  gl.useProgram(pr);
  document.documentElement.classList.add('silk');
  // the mesh: a fine grid, so folds and edges stay smooth
  var G = 80, vtx = new Float32Array((G + 1) * (G + 1) * 2), idx = new Uint16Array(G * G * 6), n = 0, m = 0;
  for (var gy = 0; gy <= G; gy++) for (var gx = 0; gx <= G; gx++) { vtx[n++] = gx / G * 2 - 1; vtx[n++] = gy / G * 2 - 1; }
  for (gy = 0; gy < G; gy++) for (gx = 0; gx < G; gx++) { var i0 = gy * (G + 1) + gx; idx[m++] = i0; idx[m++] = i0 + 1; idx[m++] = i0 + G + 1; idx[m++] = i0 + 1; idx[m++] = i0 + G + 2; idx[m++] = i0 + G + 1; }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, vtx, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uRes', 'uC', 'uM', 'uOff', 'uRot', 'uS', 'uT', 'uPh', 'uFlat', 'uBend', 'uMAmp', 'uSh', 'uAsp', 'uClk', 'uCol', 'uShade', 'uFade', 'tA', 'tB', 'uInk'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // The photograph. Nothing is drawn until it is in; then the cloth fades up.
  var loaded = false, tIn = 0, im = new Image();
  im.onload = function () {
    var src = im, big = Math.max(im.naturalWidth, im.naturalHeight), maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (big > maxTex) { var k = maxTex / big, c = document.createElement('canvas'); c.width = Math.floor(im.naturalWidth * k); c.height = Math.floor(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); src = c; }
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    loaded = true; tIn = performance.now();
  };
  im.src = 'img/r_silk_hang.jpg';
  gl.uniform1i(U.tA, 0);

  // The mark on the cloth: drawn once to a canvas (emblem and wordmark from the house lockup) and laid on as a second texture.
  var texB = gl.createTexture();
  function markTex(src) {
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
  }
  function drawMark() {
    var c = document.createElement('canvas'), N = 1024; c.width = c.height = N; var x = c.getContext('2d');
    x.translate(N / 2, N / 2); x.scale(1.22, 1.22 / 1.1); x.fillStyle = x.strokeStyle = '#fff';
    // emblem
    x.save(); x.translate(-125, -330); x.scale(2.5, 2.5); x.lineWidth = 1.5; x.lineCap = 'round'; x.lineJoin = 'round';
    x.stroke(new Path2D('M24 84V46A26 26 0 0 1 76 46V84M33 84V46A17 17 0 0 1 67 46V84M18 84H82M24 91H76M50 29V50M50 66V84M50 50L57 58L50 66L43 58Z'));
    x.beginPath(); x.arc(50, 11, 1.8, 0, 6.2832); x.fill(); x.restore();
    // wordmark, letter-spaced by hand
    var word = 'HEMMINGS', fs = 92, sp = fs * 0.18, w = 0, i; x.font = fs + 'px "' + MF + '", "Times New Roman", serif'; x.textBaseline = 'alphabetic';
    for (i = 0; i < word.length; i++) w += x.measureText(word[i]).width + (i < word.length - 1 ? sp : 0);
    var px = -w / 2; for (i = 0; i < word.length; i++) { x.fillText(word[i], px, 60); px += x.measureText(word[i]).width + sp; }
    markTex(c);
  }
  var blank = document.createElement('canvas'); blank.width = blank.height = 2; markTex(blank);
  gl.uniform1i(U.tB, 1);
  if (document.fonts && document.fonts.load) document.fonts.load('92px "' + MF + '"', 'HEMMINGS').then(drawMark, drawMark); else drawMark();

  var W = 0, H = 0, dpr = 1, probe = document.createElement('i'), fade = 0;
  probe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden'; document.body.appendChild(probe);
  function rgb(v) { probe.style.color = 'var(' + v + ')'; return (getComputedStyle(probe).color.match(/[\d.]+/g) || [128, 128, 128]).slice(0, 3).map(function (x) { return x / 255; }); }
  var col = rgb('--metal'), shade = rgb('--deep'), colT = col, shadeT = shade;
  function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); gl.viewport(0, 0, cv.width, cv.height); }
  size(); window.addEventListener('resize', size);
  var mouse = [-9999, -9999], mAmp = 0, mTarget = 0, sm = window.scrollY, ox = 0, oy = 0, vx = 0, vy = 0, cur = { x: 0, y: 0, S: 1, rz: 0, rx: 1, ry: 0 };
  var clicks = new Float32Array(12), ci = 0, t0 = performance.now(), last = t0, lastPal = 0;
  for (var i = 0; i < 4; i++) clicks[i * 3 + 2] = -100;
  // a point on the screen, in the cloth's own coordinates (roughly: its turn and tilt undone)
  function local(px, py) {
    var dx = (px - cur.x) / cur.S, dy = (py - cur.y) / cur.S, c = Math.cos(-cur.rz), s = Math.sin(-cur.rz);
    return [(dx * c - dy * s) / Math.max(0.35, Math.cos(cur.ry)), (dx * s + dy * c) / Math.max(0.35, Math.cos(cur.rx)) / 1.1];
  }
  window.addEventListener('pointermove', function (e) { mouse = [e.clientX, e.clientY]; mTarget = 1; });
  window.addEventListener('pointerdown', function (e) {
    var p = local(e.clientX, e.clientY); clicks[ci * 3] = p[0]; clicks[ci * 3 + 1] = p[1]; clicks[ci * 3 + 2] = (performance.now() - t0) / 1000; ci = (ci + 1) % 4;
    var dx = cur.x - e.clientX, dy = cur.y - e.clientY, d = Math.sqrt(dx * dx + dy * dy) + 1;
    if (!reduce && d < cur.S * 1.6) { vx += dx / d * 240; vy += dy / d * 240; }
  });
  function mix(a, b, k) { return a + (b - a) * k; }
  function draw(now) {
    var time = reduce ? 0 : (now - t0) / 1000, prev = last, dt = Math.min(0.05, (now - last) / 1000), sy = window.scrollY; last = now;
    sm = reduce ? sy : sm + (sy - sm) * (1 - Math.exp(-Math.min(0.4, (now - prev) / 1000) * 3.2));
    var lag = sy - sm, phone = W < 900;
    mTarget *= 0.975; mAmp += (mTarget - mAmp) * 0.07;
    if (loaded) fade = Math.min(1, (now - tIn) / 900);
    if (now - lastPal > 400) { lastPal = now; colT = rgb('--metal'); shadeT = rgb('--deep'); }
    for (var j = 0; j < 3; j++) { col[j] += (colT[j] - col[j]) * 0.06; shade[j] += (shadeT[j] - shade[j]) * 0.06; }

    // floating: a slow pendulum across the screen, tilting into each swing
    var S = (phone ? W * 0.27 : Math.max(150, Math.min(250, W * 0.15))) * K;
    var ph = sm / H * 2.2 + 1.3 + 0.12 * Math.sin(time * 0.35);
    var fx = W * (0.5 + (phone ? 0.2 : 0.31) * Math.sin(ph));
    var fy = H * (0.45 + 0.09 * Math.sin(ph * 2 + 0.6)) - Math.max(-H * 0.35, Math.min(H * 0.35, lag * 0.55)) + 7 * Math.sin(time * 0.7);
    var rz = 0.45 * Math.cos(ph) + 0.06 * Math.sin(time * 0.5);
    var rx = 0.75 + 0.3 * Math.sin(ph * 1.3 + time * 0.15);
    var ry = 0.55 * Math.cos(ph) + 0.15 * Math.sin(time * 0.4);
    var bend = 0.5 * Math.sin(ph * 0.9 + time * 0.2) + Math.max(-0.35, Math.min(0.35, lag / H * 0.9));
    // landing: over the last stretch of the page the cloth leaves its swing and settles at the foot of the page
    var room = document.documentElement.scrollHeight - H - sm, bottom = H + (document.documentElement.scrollHeight - H - sy);
    var Lk = Math.max(0, Math.min(1, 1 - room / (H * 0.7))); Lk = Lk * Lk * (3 - 2 * Lk);
    var cx = mix(fx, W * 0.5, Lk), cy = mix(fy, bottom - S * (phone ? 1.05 : 0.92), Lk);
    rz = mix(rz, -0.22, Lk); rx = mix(rx, 0.9, Lk); ry = mix(ry, 0.06, Lk); bend *= 1 - Lk;
    // the pointer's draught nudges it aside; it drifts back
    if (!reduce) {
      var dx = cx + ox - mouse[0], dy = cy + oy - mouse[1], d = Math.sqrt(dx * dx + dy * dy) + 1, push = Math.max(0, 1 - d / (S * 1.5)) * mAmp * 900 * (1 - Lk * 0.8);
      vx += (dx / d * push - ox * 7 - vx * 3.2) * dt; vy += (dy / d * push - oy * 7 - vy * 3.2) * dt; ox += vx * dt; oy += vy * dt;
    }
    cur.x = cx + ox; cur.y = cy + oy; cur.S = S; cur.rz = rz; cur.rx = rx; cur.ry = ry;
    var lm = local(mouse[0], mouse[1]);

    gl.uniform2f(U.uRes, W, H); gl.uniform2f(U.uC, cur.x, cur.y); gl.uniform2f(U.uM, lm[0], lm[1]);
    gl.uniform2f(U.uOff, S * mix(0.16, 0.05, Lk), S * mix(0.3, 0.09, Lk));
    gl.uniform3f(U.uRot, rx, ry, rz);
    gl.uniform1f(U.uS, S); gl.uniform1f(U.uT, time); gl.uniform1f(U.uPh, ph); gl.uniform1f(U.uFlat, Lk); gl.uniform1f(U.uBend, bend);
    gl.uniform1f(U.uMAmp, reduce ? 0 : mAmp); gl.uniform1f(U.uAsp, 1.1); gl.uniform1f(U.uFade, fade);
    gl.uniform3f(U.uCol, col[0], col[1], col[2]); gl.uniform3f(U.uInk, shade[0], shade[1], shade[2]);
    gl.uniform3f(U.uShade, col[0] * 0.52 + shade[0] * 0.1, col[1] * 0.52 + shade[1] * 0.1, col[2] * 0.52 + shade[2] * 0.1);
    gl.uniform3fv(U.uClk, clicks);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (fade > 0) {
      gl.disable(gl.DEPTH_TEST); gl.uniform1f(U.uSh, 1); gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);   // its shadow
      gl.enable(gl.DEPTH_TEST); gl.uniform1f(U.uSh, 0); gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);    // the cloth
    }
    if (!document.hidden) requestAnimationFrame(draw);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { last = performance.now(); requestAnimationFrame(draw); } });
  requestAnimationFrame(draw);
})();
