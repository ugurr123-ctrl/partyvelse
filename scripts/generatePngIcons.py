import math
import os
import struct
import zlib


def hex_to_rgb(hex_str: str):
    h = hex_str.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * max(0.0, min(1.0, t))


def lerp_rgb(c1, c2, t: float):
    return (
        lerp(c1[0], c2[0], t),
        lerp(c1[1], c2[1], t),
        lerp(c1[2], c2[2], t),
    )


def blend(bg, fg, alpha: float):
    a = max(0.0, min(1.0, alpha))
    return (
        bg[0] * (1.0 - a) + fg[0] * a,
        bg[1] * (1.0 - a) + fg[1] * a,
        bg[2] * (1.0 - a) + fg[2] * a,
    )


def sd_rounded_box(px: float, py: float, bx: float, by: float, r: float) -> float:
    qx = abs(px) - bx + r
    qy = abs(py) - by + r
    return math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - r


def sd_hexagon(px: float, py: float, r: float) -> float:
    # Pointy-top regular hexagon
    kx, ky, kz = -0.866025404, 0.5, 0.577350269
    x = abs(px)
    y = abs(py)
    dot = min(kx * x + ky * y, 0.0)
    x -= 2.0 * dot * kx
    y -= 2.0 * dot * ky
    dot2 = min(kx * x + ky * y, 0.0)
    x -= 2.0 * dot2 * kx
    y -= 2.0 * dot2 * ky
    x -= max(-kz * r, min(kz * r, x))
    y -= r
    # Wait: rotate 90deg for pointy-top by passing (py, px) in caller
    return math.hypot(x, y) * (-1.0 if y < 0 else 1.0)


def sd_segment(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
    pax, pay = px - ax, py - ay
    bax, bay = bx - ax, by - ay
    h = max(0.0, min(1.0, (pax * bax + pay * bay) / (bax * bax + bay * bay)))
    return math.hypot(pax - bax * h, pay - bay * h)


def render_icon(size: int, maskable: bool = False, rounded_corners: bool = True) -> bytes:
    bg_center = hex_to_rgb('#1f1842')
    bg_edge = hex_to_rgb('#070510')
    hex_fill = hex_to_rgb('#141123')
    gold_a = hex_to_rgb('#ffe066')
    gold_b = hex_to_rgb('#fb8500')
    cyan_a = hex_to_rgb('#00f0ff')
    cyan_b = hex_to_rgb('#00a8ff')

    scale = 0.78 if maskable else 1.0
    aa = 1.5 / (size / 512.0)

    raw_rows = bytearray()
    for y in range(size):
        raw_rows.append(0)  # PNG filter type 0 (None)
        ny = (y + 0.5) / size * 512.0 - 256.0
        for x in range(size):
            nx = (x + 0.5) / size * 512.0 - 256.0

            # Radial background glow
            dist_center = math.hypot(nx, ny) / 256.0
            col = lerp_rgb(bg_center, bg_edge, min(1.0, dist_center))

            # Optional outer rounded border (not for maskable full-bleed)
            alpha_out = 255
            if not maskable and rounded_corners:
                d_box = sd_rounded_box(nx, ny, 256.0, 256.0, 118.0)
                if d_box > aa:
                    alpha_out = 0
                elif d_box > -aa:
                    alpha_out = int(max(0.0, min(1.0, 0.5 - d_box / (2.0 * aa))) * 255)

                # Outer gold rim
                d_rim = abs(sd_rounded_box(nx, ny, 246.0, 246.0, 110.0)) - 3.5
                if d_rim < aa:
                    t_g = ((nx + 256.0) + (ny + 256.0)) / 1024.0
                    col = blend(col, lerp_rgb(gold_a, gold_b, t_g), 0.75 * max(0.0, min(1.0, 0.5 - d_rim / (2.0 * aa))))

            # Scaled tactical symbol coordinates
            sx = nx / scale
            sy = ny / scale

            # Pointy-top Hexagon (swap sx/sy for pointy top)
            d_hex = sd_hexagon(sy, sx, 168.0)
            if d_hex < aa:
                a_hex = max(0.0, min(1.0, 0.5 - d_hex / (2.0 * aa)))
                col = blend(col, hex_fill, a_hex)

            # Hex gold stroke
            d_hex_stroke = abs(d_hex) - 7.0 / scale
            if d_hex_stroke < aa:
                t_g = ((sx + 256.0) + (sy + 256.0)) / 1024.0
                a_hs = max(0.0, min(1.0, 0.5 - d_hex_stroke / (2.0 * aa)))
                col = blend(col, lerp_rgb(gold_a, gold_b, t_g), a_hs)

            # Inner hex cyan dashed accent ring
            d_inner_hex = abs(sd_hexagon(sy, sx, 140.0)) - 2.0 / scale
            if d_inner_hex < aa:
                ang = math.atan2(sy, sx)
                if math.sin(ang * 12.0) > -0.2:
                    a_ih = max(0.0, min(1.0, 0.5 - d_inner_hex / (2.0 * aa))) * 0.45
                    col = blend(col, cyan_a, a_ih)

            # Radar rings
            r_dist = math.hypot(sx, sy)
            d_ring1 = abs(r_dist - 108.0) - 2.5 / scale
            if d_ring1 < aa:
                col = blend(col, cyan_a, 0.35 * max(0.0, min(1.0, 0.5 - d_ring1 / (2.0 * aa))))

            d_ring2 = abs(r_dist - 70.0) - 4.0 / scale
            if d_ring2 < aa:
                t_c = (sx + 100.0) / 200.0
                col = blend(col, lerp_rgb(cyan_a, cyan_b, t_c), 0.85 * max(0.0, min(1.0, 0.5 - d_ring2 / (2.0 * aa))))

            # Crosshairs
            d_cross_v = sd_segment(sx, sy, 0.0, -124.0, 0.0, 124.0) - 2.5 / scale
            d_cross_h = sd_segment(sx, sy, -124.0, 0.0, 124.0, 0.0) - 2.5 / scale
            d_cross = min(d_cross_v, d_cross_h)
            if d_cross < aa:
                col = blend(col, cyan_a, 0.6 * max(0.0, min(1.0, 0.5 - d_cross / (2.0 * aa))))

            # Center gold core
            d_core = r_dist - 30.0
            if d_core < aa:
                t_g = ((sx + 40.0) + (sy + 40.0)) / 80.0
                col = blend(col, lerp_rgb(gold_a, gold_b, t_g), max(0.0, min(1.0, 0.5 - d_core / (2.0 * aa))))

            # 4 Beacon points
            beacons = [
                (0.0, -86.0, gold_a),
                (76.0, 0.0, cyan_a),
                (-76.0, 0.0, gold_b),
                (0.0, 86.0, cyan_a),
            ]
            for bx, by, bcol in beacons:
                db = math.hypot(sx - bx, sy - by) - 7.5
                if db < aa:
                    col = blend(col, bcol, max(0.0, min(1.0, 0.5 - db / (2.0 * aa))))

            raw_rows.extend((
                int(max(0, min(255, round(col[0])))),
                int(max(0, min(255, round(col[1])))),
                int(max(0, min(255, round(col[2])))),
                alpha_out,
            ))

    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_rows), level=9)
    return b'\x89PNG\r\n\x1a\n' + png_chunk(b'IHDR', ihdr) + png_chunk(b'IDAT', idat) + png_chunk(b'IEND', b'')


def main():
    os.makedirs('public', exist_ok=True)
    specs = [
        ('public/pwa-192x192.png', 192, False, True),
        ('public/pwa-512x512.png', 512, False, True),
        ('public/pwa-maskable-512x512.png', 512, True, False),
        ('public/apple-touch-icon.png', 180, False, False),
    ]
    for path, size, maskable, rounded in specs:
        png_bytes = render_icon(size, maskable=maskable, rounded_corners=rounded)
        with open(path, 'wb') as f:
            f.write(png_bytes)
        print(f'Generated {path} ({size}x{size}, {len(png_bytes)} bytes)')


if __name__ == '__main__':
    main()
