# Espositore Tecnomat — custodie neve

Configuratore 3D (three.js) di un espositore su pallet EPAL 1 (EN 13698-1, 1200 × 800 × 144 mm).

Apri `index.html` nel browser: non serve build.

## Cosa fa
- Numero di pallet impilati (1–12), con quote in mm.
- Scaffale in pannelli antracite da 18 mm: pianta 1200 × 800, spina centrale, 3 vani sul fronte e 2 sul retro, livelli e altezza regolabili, piano superiore.
- Fianchi esterni che scendono sulle testate dei pallet fino a 100 mm da terra (aperture forche libere).
- Pannelli 6 mm sui lati lunghi.
- Insegna in forex 10 mm su profilo a U di alluminio, altezza regolabile al centimetro (default 32 cm: i cartelli A4 appoggiati sul profilo non sporgono).
- Montaggio passo-passo, vista esplosa, figura umana di 175 cm di riferimento.
- Distinta pezzi e ferramenta (confirmat 7 × 50, squadrette 40 × 40, viti) aggiornata dai parametri.

## File
- `index.html` — configuratore.
- `blender/pallet_epal.py` — script Blender che genera 3 pallet EPAL quotati (`Blender -b -P blender/pallet_epal.py -- <cartella>`).
- `blender/pallet_epal_x3.blend` — modello generato.
- `render/` — render isometrico e frontale dei pallet.
- `cartello.js` — disegno del cartello prezzo A4 (usato anche nel 3D, copiato in linea in `index.html`).
- `cartelli.html` — pagina di stampa dei 5 cartelli (S, M, L, XL, XXL).
- `stampa/cartelli-calze-neve-A4.pdf` — PDF A4 pronto da stampare, 5 pagine.
