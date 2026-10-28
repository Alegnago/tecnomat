// Cartello prezzo A4 (210 × 297 mm) sullo schema del cartello arancione del punto vendita.
// drawCartello(ctx, larghezzaPx, altezzaPx, { title, lines, price, code }) — coordinate in mm, scalate su W.
// Font: Amatic SC 700 (testi a mano), Anton (IVA), Montserrat 700 (slogan).
function drawCartello(c, W, H, o) {
  const k = W / 210, mm = v => v * k;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ORANGE = '#e9572a', INK = '#2a1310';

  // testo con altezza maiuscole in mm; se più largo di maxW lo stringe in orizzontale
  function txt(s, t) {
    c.save();
    c.font = `${t.weight || 400} 100px ${t.family}`;
    const asc = c.measureText('H').actualBoundingBoxAscent || 72;
    const f = 100 * mm(t.capH) / asc;
    c.font = `${t.weight || 400} ${f}px ${t.family}`;
    if (t.ls) c.letterSpacing = `${mm(t.ls)}px`;
    const w = c.measureText(s).width;
    const sx = Math.min(t.sx || 1, mm(t.maxW) / w);
    if (t.measure) { c.restore(); return w * sx / k; }
    c.translate(mm(t.x), mm(t.base));
    c.scale(sx, 1);
    c.textAlign = t.align || 'center';
    c.textBaseline = 'alphabetic';
    c.lineJoin = 'round';
    if (t.shadow) { c.save(); c.fillStyle = t.shadow; c.fillText(s, mm(0.5) / sx, mm(0.6)); c.restore(); }
    if (t.stroke) { c.strokeStyle = t.stroke; c.lineWidth = mm(t.strokeW) / sx * 2; c.strokeText(s, 0, 0); }
    if (t.fill) { c.fillStyle = t.fill; c.fillText(s, 0, 0); }
    c.restore();
    return w * sx / k;                                 // larghezza in mm
  }
  const hand = { family: '"Amatic SC"', weight: 700, fill: INK, stroke: INK };

  // fondo arancione con velature e puntinatura
  c.fillStyle = ORANGE; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W, y = rnd() * H, r = mm(4 + rnd() * 22), a = 0.04 + rnd() * 0.09;
    const tone = rnd() < 0.55 ? '246,128,72' : '196,62,24';
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${tone},${a})`); g.addColorStop(1, `rgba(${tone},0)`);
    c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 2500; i++) {
    c.fillStyle = rnd() < 0.5 ? 'rgba(255,170,120,0.18)' : 'rgba(150,40,10,0.14)';
    c.fillRect(rnd() * W, rnd() * H, mm(0.2 + rnd() * 0.5), mm(0.2 + rnd() * 0.5));
  }

  // riquadro chiaro con bordi strappati: morsi arancioni verso l'interno, schizzi bianchi verso l'esterno
  function roughRect(x0, y0, x1, y1, fill, bite) {
    c.fillStyle = fill; c.fillRect(mm(x0), mm(y0), mm(x1 - x0), mm(y1 - y0));
    for (let i = 0; i < 520; i++) {
      const side = Math.floor(rnd() * 4), t = rnd(), d = rnd() * bite, l = 0.6 + rnd() * 4.5;
      let x, y, w, h;
      if (side === 0) { x = x0 + t * (x1 - x0); y = y0 - 0.3; w = l; h = d; }
      else if (side === 1) { x = x0 + t * (x1 - x0); y = y1 - d + 0.3; w = l; h = d; }
      else if (side === 2) { x = x0 - 0.3; y = y0 + t * (y1 - y0); w = d; h = l; }
      else { x = x1 - d + 0.3; y = y0 + t * (y1 - y0); w = d; h = l; }
      c.fillStyle = `rgba(233,87,42,${0.55 + rnd() * 0.45})`;
      c.fillRect(mm(x), mm(y), mm(w), mm(h));
    }
    for (let i = 0; i < 260; i++) {
      const side = Math.floor(rnd() * 4), t = rnd(), d = rnd() * bite * 0.8;
      let x, y;
      if (side === 0) { x = x0 + t * (x1 - x0); y = y0 - d; }
      else if (side === 1) { x = x0 + t * (x1 - x0); y = y1 + d * 0.6; }
      else if (side === 2) { x = x0 - d; y = y0 + t * (y1 - y0); }
      else { x = x1 + d * 0.6; y = y0 + t * (y1 - y0); }
      c.fillStyle = `rgba(250,248,244,${0.5 + rnd() * 0.5})`;
      c.fillRect(mm(x), mm(y), mm(0.4 + rnd() * 2.5), mm(0.3 + rnd() * 1.2));
    }
  }

  // titolo e righe descrittive
  const tl = o.title.length > 11 ? splitTwo(o.title) : [o.title];
  if (tl.length === 1) txt(tl[0], { ...hand, capH: 54, base: 66, x: 105, maxW: 150, strokeW: 0.5 });
  else {
    txt(tl[0], { ...hand, capH: 30, base: 38, x: 105, maxW: 160, strokeW: 0.45 });
    txt(tl[1], { ...hand, capH: 30, base: 73, x: 105, maxW: 160, strokeW: 0.45 });
  }
  (o.lines || []).slice(0, 2).forEach((l, i) => txt(l, { ...hand, capH: 19, base: 102 + i * 27, x: 105, maxW: 150, strokeW: 0.3 }));

  roughRect(16, 139, 197, 258, '#f7f6f2', 3.2);

  // prezzo: intero grande, decimali più piccoli con € sopra
  const [int, dec] = o.price.split('.');
  const P = { ...hand, fill: '#1b1b1b', stroke: '#1b1b1b' };
  const wi = txt(int, { ...P, capH: 86, maxW: 110, measure: true, ls: -2 });
  const wd = txt('.' + dec, { ...P, capH: 46, maxW: 70, measure: true });
  const x0 = 104 - (wi + 2 + wd) / 2;
  txt(int, { ...P, capH: 86, base: 236, x: x0, align: 'left', maxW: 110, strokeW: 0.9, ls: -2 });
  txt('.' + dec, { ...P, capH: 46, base: 236, x: x0 + wi + 2, align: 'left', maxW: 70, strokeW: 0.6 });
  txt('€', { ...P, capH: 19, base: 175, x: x0 + wi + 2 + wd * 0.6, maxW: 16, strokeW: 0.45 });

  // I.V.A. INCLUSA!
  txt('I.V.A. INCLUSA!', { family: 'Anton', capH: 7.5, base: 251, x: 192, align: 'right', maxW: 80,
    fill: '#6e2216', stroke: '#ffffff', strokeW: 0.35, shadow: 'rgba(80,80,80,0.45)', sx: 1 });

  // codice articolo (facoltativo), a mano sotto il riquadro
  if (o.code) txt(o.code, { ...hand, capH: 9, base: 269, x: 194, align: 'right', maxW: 60, strokeW: 0.2 });

  // slogan su fascia chiara
  roughRect(26, 274, 199, 290, '#f7f6f2', 0.9);
  txt('PIÙ PROFESSIONALE, MENO CARO', { family: 'Montserrat', weight: 700, capH: 6.4, base: 285.6, x: 112.5,
    maxW: 160, fill: '#d4573a' });

  function splitTwo(s) {
    const w = s.split(' '); let best = [s, ''], d = 1e9;
    for (let i = 1; i < w.length; i++) {
      const a = w.slice(0, i).join(' '), b = w.slice(i).join(' ');
      if (Math.abs(a.length - b.length) < d) { d = Math.abs(a.length - b.length); best = [a, b]; }
    }
    return best;
  }
}
const CARTELLI = ['S', 'M', 'L', 'XL', 'XXL'].map(t => ({
  size: t, title: 'CALZE NEVE', lines: ['OMOLOGATE', `MISURA ${t}`], price: '19.99',
}));
