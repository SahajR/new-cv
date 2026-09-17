"""Build the sparse city detail from a local Overpass JSON export.
Usage: python3 scripts/build-shanghai-detail.py /tmp/shanghai-osm.json
Source: OpenStreetMap contributors, ODbL. No runtime map service or API key.
The download covers a general metro rectangle, never photo locations.
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Public visitor destinations, used only to trim the downloaded geometry locally.
CENTERS = [(31.2375, 121.486), (31.1936, 121.3638), (31.228, 121.4874),
           (31.1461, 121.6556), (31.2047, 121.5535), (31.1093, 121.1741)]


def simplify(points, tolerance=.0008):
    if len(points) <= 2:
        return points
    ax, ay = points[0]
    bx, by = points[-1]
    dx, dy = bx-ax, by-ay
    length = dx*dx + dy*dy
    distances = []
    for x, y in points[1:-1]:
        t = max(0, min(1, ((x-ax)*dx + (y-ay)*dy) / length)) if length else 0
        distances.append(math.hypot(x-ax-t*dx, y-ay-t*dy))
    maximum = max(distances, default=0)
    if maximum <= tolerance:
        return [points[0], points[-1]]
    split = distances.index(maximum) + 1
    return simplify(points[:split+1])[:-1] + simplify(points[split:])


paths = {key: [] for key in ('water', 'river', 'canal', 'road')}
for feature in json.load(open(sys.argv[1]))['elements']:
    geometry, tags = feature.get('geometry', []), feature.get('tags', {})
    if not any(abs(p['lat']-lat) < .045 and abs(p['lon']-lon) < .06
               for p in geometry for lat, lon in CENTERS):
        continue
    points = [(110 + (p['lon']-74)*8.5 - 510, 360-(p['lat']-18)*7.5 - 258) for p in geometry]
    if len(points) < 2:
        continue
    closed = points[0] == points[-1]
    if tags.get('natural') == 'water':
        if not closed:
            continue
        kind = 'water'
    elif 'waterway' in tags:
        kind = 'river' if '黄浦' in tags.get('name', '') else 'canal'
    else:
        kind = 'road'
    points = simplify(points)
    d = 'M' + 'L'.join(f'{x:.5f},{y:.5f}' for x, y in points) + ('Z' if closed else '')
    paths[kind].append(d)

styles = {
    'water': 'fill="#9fb7ac" fill-opacity=".58" stroke="none"',
    'river': 'fill="none" stroke="#93b1a8" stroke-width=".025" stroke-opacity=".6"',
    'canal': 'fill="none" stroke="#93b1a8" stroke-width=".0035" stroke-opacity=".6"',
    'road': 'fill="none" stroke="#aaa17f" stroke-width=".0009" stroke-opacity=".5"',
}
output = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 5">\n'
output += '<!-- Map data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright -->\n'
for kind in ('road', 'water', 'river', 'canal'):
    output += f'<path {styles[kind]} stroke-linecap="round" stroke-linejoin="round" d="'+''.join(paths[kind])+'"/>\n'
output += '</svg>\n'
destination = ROOT / 'public/images/travel/china-map/shanghai-detail.svg'
destination.write_text(output)
print(f'{destination.name}: {len(output):,} bytes; {sum(map(len, paths.values())):,} simplified features')
