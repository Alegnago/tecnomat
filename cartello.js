// Cartello prezzo A4 (210 × 297 mm) sullo schema del cartello "PREZZO STOCK!" del punto vendita.
// drawCartello(ctx, larghezzaPx, altezzaPx, { title, sub, price }) — coordinate in mm, scalate su W.
// Font: Anton (testata, IVA), Amatic SC 700 (testi a mano), Montserrat 700 (slogan).
function drawCartello(c, W, H, o) {
  const k = W / 210, mm = v => v * k;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // testo con altezza maiuscole in mm; se più largo di maxW lo stringe in orizzontale
  function txt(cx, s, t) {
    cx.save();
    const fam = `${t.weight || 400} 100px ${t.family}`;
    cx.font = fam;
    const asc = cx.measureText('H').actualBoundingBoxAscent || 72;
    const f = 100 * mm(t.capH) / asc;
    cx.font = `${t.weight || 400} ${f}px ${t.family}`;
    if (t.ls) cx.letterSpacing = `${mm(t.ls)}px`;
    const w = cx.measureText(s).width;
    const sx = Math.min(t.sx || 1, mm(t.maxW) / w);
    cx.translate(mm(t.x), mm(t.top + t.capH));
    if (t.rot) cx.rotate(t.rot);
    cx.scale(sx, 1);
    cx.textAlign = t.align || 'center';
    cx.textBaseline = 'alphabetic';
    cx.lineJoin = 'round';
    if (t.shadow) { cx.save(); cx.fillStyle = t.shadow; cx.fillText(s, mm(t.sdx || 0.8) / sx, mm(t.sdy || 0.8)); cx.restore(); }
    if (t.stroke) { cx.strokeStyle = t.stroke; cx.lineWidth = mm(t.strokeW) / sx * 2; cx.strokeText(s, 0, 0); }
    if (t.fill) { cx.fillStyle = t.fill; cx.fillText(s, 0, 0); }
    if (t.inner) { cx.strokeStyle = t.inner; cx.lineWidth = mm(t.innerW); cx.strokeText(s, 0, 0); cx.fillStyle = t.fill; cx.fillText(s, 0, 0); }
    cx.restore();
    return w * sx / k;                                 // larghezza in mm
  }

  // fondo giallo con velature
  c.fillStyle = '#f0e84c'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 320; i++) {
    const x = rnd() * W, y = rnd() * H, r = mm(3 + rnd() * 18), a = 0.04 + rnd() * 0.1;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    const tone = rnd() < 0.6 ? '255,253,200' : '214,200,40';
    g.addColorStop(0, `rgba(${tone},${a})`); g.addColorStop(1, `rgba(${tone},0)`);
    c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
  }

  // testata PREZZO STOCK! su livello a parte, con usura
  const hd = document.createElement('canvas'); hd.width = W; hd.height = Math.ceil(mm(70));
  const h = hd.getContext('2d');
  txt(h, 'PREZZO STOCK!', { family: 'Anton', capH: 44, top: 9, x: 105, maxW: 202, fill: '#f27744',
    stroke: '#3b1a0c', strokeW: 1.5, shadow: '#2a1208', sdx: 1.2, sdy: 1.4, rot: -0.012 });
  h.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 420; i++) {
    const x = rnd() * W, y = rnd() * mm(66), r = mm(0.15 + rnd() * 0.7);
    h.fillStyle = rnd() < 0.75 ? 'rgba(255,200,165,0.4)' : 'rgba(120,40,10,0.25)';
    h.beginPath(); h.arc(x, y, r, 0, Math.PI * 2); h.fill();
  }
  c.drawImage(hd, 0, 0);

  // titolo e sottotitolo, scritti a mano
  const hand = { family: '"Amatic SC"', weight: 700, fill: '#151515', stroke: '#151515' };
  const titleLines = o.title.length > 12 ? splitTwo(o.title) : [o.title];
  if (titleLines.length === 1) txt(c, titleLines[0], { ...hand, capH: 40, top: 76, x: 105, maxW: 150, strokeW: 0.7 });
  else {
    txt(c, titleLines[0], { ...hand, capH: 22, top: 71, x: 105, maxW: 176, strokeW: 0.6 });
    txt(c, titleLines[1], { ...hand, capH: 22, top: 97, x: 105, maxW: 176, strokeW: 0.6 });
  }
  txt(c, o.sub, { ...hand, capH: 11, top: 123, x: 105, maxW: 176, strokeW: 0.25 });

  // riquadro bianco del prezzo, bordi sfumati
  c.save();
  c.shadowColor = 'rgba(250,250,240,0.95)'; c.shadowBlur = mm(5);
  c.fillStyle = '#f3f3ee'; c.fillRect(mm(25), mm(139), mm(161), mm(104));
  c.restore();

  // prezzo: intero.decimali + € piccolo sopra le ultime cifre
  const [int, dec] = o.price.split('.');
  const pw = txt(c, `${int}.${dec}`, { ...hand, capH: 82, top: 147, x: 101, maxW: 140, strokeW: 1.2, ls: -3 });
  txt(c, '€', { ...hand, capH: 17, top: 140, x: 101 + pw / 2 - 2, maxW: 16, strokeW: 0.5 });

  // I.V.A. INCLUSA!
  txt(c, 'I.V.A. INCLUSA!', { family: 'Anton', capH: 10.5, top: 230, x: 185, align: 'right', maxW: 96,
    fill: '#e8674a', stroke: '#a3a39d', strokeW: 0.45, inner: '#ffffff', innerW: 0.45, sx: 1 });

  // riga in basso (facoltativa, come "2 BATTERIE 2Ah INCLUSE" e codice articolo)
  if (o.left) txt(c, o.left, { ...hand, capH: 12, top: 248, x: 26, align: 'left', maxW: 90, strokeW: 0.35 });
  if (o.code) txt(c, o.code, { ...hand, capH: 12, top: 248, x: 186, align: 'right', maxW: 60, strokeW: 0.35 });

  // slogan su fascia chiara
  c.fillStyle = 'rgba(236,234,214,0.92)'; c.fillRect(mm(37), mm(266), mm(150), mm(15));
  txt(c, 'PIÙ PROFESSIONALE, MENO CARO', { family: 'Montserrat', weight: 700, capH: 6.6, top: 270, x: 112,
    maxW: 144, fill: '#b9b8ad' });

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
  size: t, title: 'CALZE NEVE GRANDE', sub: `OMOLOGATE - MISURA ${t}`, price: '19.99',
}));
