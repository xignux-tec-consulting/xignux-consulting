import numpy as np
from PIL import Image, ImageFilter

W, H = 1024, 1024
# Clean off-white paper
BASE = np.array([242, 240, 235], dtype=np.float32)

# Layer 1: fine fiber noise (organic, not periodic)
fiber = np.random.randn(H, W).astype(np.float32)
# Stretch fibers horizontally (paper fibers run mostly horizontal)
fiber_img = Image.fromarray(np.clip((fiber + 1) * 127, 0, 255).astype(np.uint8))
fiber_h = fiber_img.filter(ImageFilter.GaussianBlur(radius=1.8))
fiber_v = fiber_img.filter(ImageFilter.GaussianBlur(radius=0.5))
# Blend: mostly horizontal fiber, some vertical
fiber = (np.array(fiber_h, dtype=np.float32) * 0.6 + np.array(fiber_v, dtype=np.float32) * 0.4) / 127.0 - 1.0
heightmap = fiber * 0.8

# Layer 2: medium clumps (paper pulp variation)
clump = np.random.randn(H // 4, W // 4).astype(np.float32)
clump_img = Image.fromarray(np.clip((clump + 1) * 127, 0, 255).astype(np.uint8))
clump_img = clump_img.resize((W, H), Image.BILINEAR)
clump_img = clump_img.filter(ImageFilter.GaussianBlur(radius=2))
heightmap += (np.array(clump_img, dtype=np.float32) / 127.0 - 1.0) * 0.5

# Layer 3: large-scale surface undulation (gentle hills)
roll = np.random.randn(H // 96, W // 96).astype(np.float32) * 0.6
roll_img = Image.fromarray(np.clip((roll + 1) * 127, 0, 255).astype(np.uint8))
roll_img = roll_img.resize((W, H), Image.BILINEAR)
heightmap += (np.array(roll_img, dtype=np.float32) / 127.0 - 1.0) * 0.35

# Layer 4: tiny speckle noise (dust / cellulose bits)
speckle = np.random.randn(H, W).astype(np.float32) * 0.2
heightmap += speckle

# Directional lighting for depth
dx = np.gradient(heightmap, axis=1)
dy = np.gradient(heightmap, axis=0)
light = np.array([-0.25, -0.2, 1.0], dtype=np.float32)
light /= np.linalg.norm(light)
denom = np.sqrt(dx ** 2 + dy ** 2 + 1.0)
shade = (-dx * light[0] - dy * light[1] + light[2]) / denom
shade = np.clip(shade, 0.0, 1.0)

# Gentle contrast — paper is subtle
intensity = 0.88 + 0.12 * shade

# Very slight warm color drift
cv = np.random.randn(H // 48, W // 48).astype(np.float32)
cv_img = Image.fromarray(np.clip((cv + 1) * 127, 0, 255).astype(np.uint8))
cv_img = cv_img.resize((W, H), Image.BILINEAR)
cv = (np.array(cv_img, dtype=np.float32) / 127.0 - 1.0) * 1.5

rgb = np.zeros((H, W, 3), dtype=np.uint8)
for c in range(3):
    ch = BASE[c] * intensity + cv * (1.0 - c * 0.1)
    rgb[:, :, c] = np.clip(ch, 0, 255).astype(np.uint8)

Image.fromarray(rgb).save('public/paper-texture.png', optimize=True)
print(f'OK  {W}x{H}')
