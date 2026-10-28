# 3 pallet EPAL 1 (EN 13698-1) sovrapposti, con quote.
# Uso: Blender -b -P pallet_epal.py -- <out_dir>
# Assi: X = 1200 (lunghezza), Y = 800 (larghezza), Z = altezza. Origine = spigolo pallet base.
import bpy, sys, os, math
from mathutils import Matrix, Vector

MM = 0.001
OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.getcwd()

# --- Specifiche EPAL 1 (mm) ---
L, W, H = 1200, 800, 144
T = 22             # spessore tavole
BLOCK_H = 78
STACK = 3

# posizioni lungo X dei blocchi/traverse (145 larghi): testa, centro, coda
X_ROWS = [(0, 145), (527.5, 672.5), (1055, 1200)]
# posizioni lungo Y blocchi e tavole inferiori: 100 / 145 / 100
Y_ROWS = [(0, 100), (327.5, 472.5), (700, 800)]
# tavole superiori: 145,100,145,100,145 con 4 luci uguali = (800-635)/4 = 41.25
_g = (W - (3 * 145 + 2 * 100)) / 4
_top, _y = [], 0.0
for w in (145, 100, 145, 100, 145):
    _top.append((_y, _y + w)); _y += w + _g
TOP_BOARDS = _top

# --- reset scena ---
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
us = scene.unit_settings
us.system = 'METRIC'; us.length_unit = 'MILLIMETERS'; us.scale_length = 1.0

def coll(name):
    c = bpy.data.collections.new(name); scene.collection.children.link(c); return c

def mat(name, rgba):
    m = bpy.data.materials.new(name); m.diffuse_color = rgba
    return m

M_DECK = mat("Legno_tavole", (0.80, 0.62, 0.40, 1))
M_BLOCK = mat("Legno_blocchi", (0.66, 0.48, 0.30, 1))
M_DIM = mat("Quote", (0.85, 0.05, 0.05, 1))

def box(name, x0, x1, y0, y1, z0, z1, m, c):
    vs = [(x, y, z) for z in (z0, z1) for y in (y0, y1) for x in (x0, x1)]
    vs = [(x * MM, y * MM, z * MM) for x, y, z in vs]
    fs = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    me = bpy.data.meshes.new(name); me.from_pydata(vs, [], fs); me.update()
    me.materials.append(m)
    o = bpy.data.objects.new(name, me); c.objects.link(o); return o

def pallet(i):
    c = coll(f"Pallet_{i+1}")
    z = i * H
    n = 0
    # tavole inferiori (3): 1200 x 100/145/100 x 22
    for y0, y1 in Y_ROWS:
        n += 1; box(f"P{i+1}_TavInf_{n}", 0, L, y0, y1, z, z + T, M_DECK, c)
    # blocchi (9): 145x100x78 (6) e 145x145x78 (3)
    n = 0
    for x0, x1 in X_ROWS:
        for y0, y1 in Y_ROWS:
            n += 1; box(f"P{i+1}_Blocco_{n}", x0, x1, y0, y1, z + T, z + T + BLOCK_H, M_BLOCK, c)
    # traverse (3): 145 x 800 x 22
    n = 0
    zt = z + T + BLOCK_H
    for x0, x1 in X_ROWS:
        n += 1; box(f"P{i+1}_Traversa_{n}", x0, x1, 0, W, zt, zt + T, M_DECK, c)
    # tavole superiori (5): 1200 x 145/100 x 22
    n = 0
    zs = zt + T
    for y0, y1 in TOP_BOARDS:
        n += 1; box(f"P{i+1}_TavSup_{n}", 0, L, y0, y1, zs, zs + T, M_DECK, c)
    assert abs(zs + T - (z + H)) < 1e-9

for i in range(STACK):
    pallet(i)

# --- quote ---
QC = coll("Quote")
TXT = 45      # altezza testo mm
R = 1.6       # raggio linee quota mm

def line(name, pts):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = R * MM; cu.bevel_resolution = 2
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, v in zip(sp.points, pts):
        p.co = (v[0] * MM, v[1] * MM, v[2] * MM, 1)
    cu.materials.append(M_DIM)
    o = bpy.data.objects.new(name, cu); QC.objects.link(o); return o

def text(name, body, pos, rot, center_offset):
    cu = bpy.data.curves.new(name, 'FONT'); cu.body = body
    cu.size = TXT * MM; cu.align_x = 'CENTER'; cu.align_y = 'BOTTOM'
    cu.materials.append(M_DIM)
    o = bpy.data.objects.new(name, cu); QC.objects.link(o)
    o.matrix_world = Matrix.Translation(Vector(pos) * MM + Vector(center_offset) * MM) @ rot
    return o

def dim(name, a, b, off, normal_txt, rot, label=None, ext_from=None):
    """Quota lineare da a a b (mm), linea spostata di 'off' (vettore mm).
    ext_from: punti origine linee di richiamo (default a, b)."""
    a, b, off = Vector(a), Vector(b), Vector(off)
    pa, pb = a + off, b + off
    d = (b - a).normalized(); o = off.normalized()
    ea, eb = ext_from or (a, b)
    ea, eb = Vector(ea), Vector(eb)
    # linee di richiamo (oltre la linea di quota di 20 mm, staccate 10 mm dal pezzo)
    line(name + "_rich_a", [ea + o * 10, pa + o * 20])
    line(name + "_rich_b", [eb + o * 10, pb + o * 20])
    line(name + "_linea", [pa - d * 20, pb + d * 20])
    # tick architettonici a 45°
    t = (d + o).normalized() * 18
    line(name + "_tick_a", [pa - t, pa + t]); line(name + "_tick_b", [pb - t, pb + t])
    val = (b - a).length
    lbl = label or f"{val:g}"
    text(name + "_txt", lbl, (pa + pb) / 2, rot, Vector(normal_txt))

R_FRONT_H = Matrix.Rotation(math.pi / 2, 4, 'X')                                   # piano XZ, legge +X
R_FRONT_V = Matrix.Rotation(math.pi / 2, 4, 'X') @ Matrix.Rotation(math.pi / 2, 4, 'Z')  # piano XZ, legge +Z
R_SIDE_H = Matrix.Rotation(math.pi / 2, 4, 'Y') @ Matrix.Rotation(math.pi / 2, 4, 'Z')   # piano YZ, legge +Y

# lunghezza 1200 (fronte, a terra)
dim("Q_lunghezza", (0, 0, 0), (L, 0, 0), (0, 0, -180), (0, -1, 8), R_FRONT_H)
# larghezza 800 (fianco destro, a terra)
dim("Q_larghezza", (L, 0, 0), (L, W, 0), (0, 0, -180), (1, 0, 8), R_SIDE_H)
# altezze parziali 144 x3 (fronte, lato sinistro)
for i in range(STACK):
    dim(f"Q_altezza_P{i+1}", (0, 0, i * H), (0, 0, (i + 1) * H), (-180, 0, 0), (-10, -1, 0), R_FRONT_V)
# altezza totale 432
dim("Q_altezza_tot", (0, 0, 0), (0, 0, STACK * H), (-360, 0, 0), (-10, -1, 0), R_FRONT_V)

# --- camera, luce, render ---
cam_d = bpy.data.cameras.new("Cam"); cam_d.type = 'ORTHO'; cam_d.ortho_scale = 2.3
cam = bpy.data.objects.new("Camera_iso", cam_d); scene.collection.objects.link(cam)
target = Vector((L / 2, W / 2, STACK * H / 2)) * MM
cam.location = target + Vector((1.6, -2.4, 1.5))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

scene.render.engine = 'BLENDER_WORKBENCH'
sh = scene.display.shading
sh.light = 'STUDIO'; sh.color_type = 'MATERIAL'
sh.show_object_outline = True; sh.show_cavity = True
scene.render.resolution_x = 1800; scene.render.resolution_y = 1400
scene.render.film_transparent = False
world = bpy.data.worlds.new("W"); scene.world = world
world.color = (1, 1, 1)
scene.view_settings.view_transform = 'Standard'

def render(path):
    scene.render.filepath = path; bpy.ops.render.render(write_still=True)

render(os.path.join(OUT, "pallet_iso.png"))

# vista frontale ortogonale (piano XZ)
cam.location = Vector((L / 2 - 120, -3000, STACK * H / 2)) * MM
cam.rotation_euler = (math.pi / 2, 0, 0); cam_d.ortho_scale = 1.9
render(os.path.join(OUT, "pallet_fronte.png"))

# ripristina iso e salva
cam.location = target + Vector((1.6, -2.4, 1.5))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam_d.ortho_scale = 2.3
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "pallet_epal_x3.blend"))

# verifica dimensioni
pts = [o.matrix_world @ Vector(c) for o in bpy.data.objects if o.type == 'MESH' for c in o.bound_box]
mn = [min(p[k] for p in pts) / MM for k in range(3)]
mx = [max(p[k] for p in pts) / MM for k in range(3)]
print("BBOX_MM", [round(mx[k] - mn[k], 3) for k in range(3)],
      "PEZZI", sum(1 for o in bpy.data.objects if o.type == 'MESH'))
