"""Prepare the India artwork guide from Survey of India's current outline ZIP.

Usage: python3 scripts/build-india-outline.py /path/to/Outline_of_India.zip
Source: https://surveyofindia.gov.in/pages/outline-maps-of-india
The source's Lambert conformal conic projection is preserved; no grid snapping.
"""
import json
import math
from pathlib import Path
import struct
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def simplify(points, tolerance):
    if len(points) <= 2:
        return points
    ax, ay = points[0]
    bx, by = points[-1]
    dx, dy = bx - ax, by - ay
    length = dx * dx + dy * dy
    maximum, split = 0, 0
    for i, (x, y) in enumerate(points[1:-1], 1):
        t = max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / length)) if length else 0
        distance = math.hypot(x - ax - t * dx, y - ay - t * dy)
        if distance > maximum:
            maximum, split = distance, i
    if maximum <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[:split + 1], tolerance)[:-1] + simplify(points[split:], tolerance)


with zipfile.ZipFile(sys.argv[1]) as archive:
    data = archive.read('Outline_of_India.shp')
assert struct.unpack_from('<i', data, 32)[0] == 5, 'Expected polygon shapefile'
xmin, ymin, xmax, ymax = struct.unpack_from('<4d', data, 36)
projection = {'west': xmin, 'north': ymax, 'unitsPerMeter': .0001, 'offset': [30, 15], 'viewBox': [0, 0, 360, 360]}
(ROOT / 'src/data/india-map-projection.json').write_text(json.dumps(projection, indent=2) + '\n')
paths = []
offset = 100
while offset < len(data):
    _, words = struct.unpack_from('>2i', data, offset)
    record = data[offset + 8:offset + 8 + words * 2]
    offset += 8 + words * 2
    if struct.unpack_from('<i', record)[0] == 0:
        continue
    parts, count = struct.unpack_from('<2i', record, 36)
    starts = list(struct.unpack_from(f'<{parts}i', record, 44)) + [count]
    vertices = list(struct.iter_unpack('<2d', record[44 + parts * 4:]))
    for begin, end in zip(starts, starts[1:]):
        points = [(30 + (x - xmin) / 10000, 15 + (ymax - y) / 10000) for x, y in vertices[begin:end]]
        area = abs(sum(a[0]*b[1] - b[0]*a[1] for a, b in zip(points, points[1:]))) / 2
        if area < .001:
            continue
        # Preserve small island shapes more closely than the mainland coast.
        points = simplify(points, min(.07, math.sqrt(area) / 10))
        if len(points) >= 4:
            paths.append('M' + 'L'.join(f'{x:.3f},{y:.3f}' for x, y in points[:-1]) + 'Z')
outline = ''.join(paths)
source = '// Survey of India, Outline_of_India (13 February 2026), retrieved 17 September 2026.\n'
source += '// https://surveyofindia.gov.in/pages/outline-maps-of-india\n'
source += '// Simplified in its native LCC WGS84 projection by scripts/build-india-outline.py.\n'
(ROOT / 'src/data/india-outline.ts').write_text(source + 'export const indiaOutline = ' + json.dumps(outline) + ';\n')
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="1200" height="1200">'
svg += f'<path fill="#a7b58b" fill-rule="evenodd" d="{outline}"/></svg>'
(ROOT / 'docs/references/travel-country-pages/india-geography-guide.svg').write_text(svg + '\n')
print(f'{len(paths)} land polygons; {len(outline):,} SVG bytes; native bounds {xmin, ymin, xmax, ymax}')
