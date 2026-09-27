precision highp float;

uniform vec2 u_resolution;
uniform vec4 u_agents[3]; // border anchor x/y, emerged height, receiving pulse
uniform float u_edges[3]; // bottom, right, top, left
uniform vec2 u_softness[3]; // head lag along the border, vertical stretch
uniform vec2 u_gaze[3];
uniform float u_blink[3];
uniform vec4 u_packet;
uniform vec3 u_trail[20];
uniform float u_coordinator;
uniform float u_time;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float box(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}
float smoothUnion(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * .25;
}
float cover(float d) { return 1.0 - smoothstep(-.65, .65, d); }

// Convert world space into the character's own upright space. Local -Y always
// points into the rectangle, including for the inverted top-edge characters.
vec2 edgeLocal(vec2 p, float edge) {
  if (edge < .5) return p;
  if (edge < 1.5) return vec2(-p.y, p.x);
  if (edge < 2.5) return -p;
  return vec2(p.y, -p.x);
}

// Keep the foot attached to the rim while the softer head trails behind it.
// Reuse this space for the silhouette, shadow, and eyes so the face bends too.
vec2 gooSpace(vec2 local, float height, vec2 softness) {
  float depth = clamp(-local.y / max(height, 1.), 0., 1.);
  float headWeight = depth * depth * (3. - 2. * depth);
  local.x -= softness.x * headWeight;
  // A little waist and a fuller head make the shape feel poured, not extruded.
  float belly = 1. + .075 * sin(depth * 3.14159);
  local.x *= sqrt(softness.y) / belly;
  return local + vec2(0., height * .5);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
    mix(hash(i + vec2(0., 1.)), hash(i + vec2(1.)), f.x), f.y);
}

float cloudNoise(vec2 p) {
  float value = 0.;
  float amplitude = .55;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p = mat2(.8, -.6, .6, .8) * p * 2.05 + vec2(8.7, 3.2);
    amplitude *= .48;
  }
  return value;
}

vec3 starLayer(vec2 p, float spacing, float seed, float brightness, float radius) {
  vec2 cell = floor(p / spacing);
  vec2 local = mod(p, spacing);
  float id = hash(cell + seed);
  vec2 point = spacing * (.18 + .64 * vec2(hash(cell + seed + 3.7), hash(cell + seed + 17.2)));
  vec2 q = local - point;
  float distance = length(q);
  float twinkle = .82 + .18 * sin(u_time * (.7 + id) + id * 31.);
  float star = (1. - smoothstep(radius * .2, radius + .55, distance)) * step(.67, id);
  // Sparse foreground stars carry a soft halo; the far layer stays pin-sharp.
  float halo = exp(-distance * distance / (radius * radius * 12.)) * .11 * step(.9, id);
  vec3 tint = mix(vec3(.69, .78, .97), vec3(1., .86, .71), hash(cell + seed + 41.));
  return tint * (star + halo) * brightness * twinkle;
}

vec3 galaxy(vec2 p) {
  // The near layers travel farther than the distant stars: a very slow view
  // shift gives depth, while the spiral itself turns independently.
  vec2 view = vec2(sin(u_time * .065) * 9., cos(u_time * .048) * 6.);
  vec2 q = (p - vec2(320., 190.) + view * .4) / 230.;
  float angle = -.34 + u_time * .012;
  q = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * q;
  q.y *= 1.5;
  float radius = length(q);
  float theta = atan(q.y, q.x);
  vec2 drift = vec2(u_time * .012, -u_time * .008);
  float clouds = cloudNoise(q * 3.2 + drift);
  float fineDust = cloudNoise(q * 10.5 - drift * .6);
  float arms = pow(.5 + .5 * sin(theta * 2. - radius * 8.5 + clouds * 3. - u_time * .025), 2.8);
  float disc = exp(-radius * radius * 1.55);
  float wisps = smoothstep(.24, .74, clouds) * (.30 + fineDust * .9);

  vec3 color = vec3(.022, .029, .055);
  color += starLayer(p + view * .14, 13., 12.7, .34, .38);
  // A broad far haze, a luminous spiral, and an intervening dust lane.
  color += vec3(.105, .075, .16) * clouds * exp(-radius * radius * .6);
  color += mix(vec3(.19, .22, .37), vec3(.34, .18, .29), clouds)
    * disc * wisps * (.4 + arms * 1.4);
  color += vec3(.28, .34, .46) * pow(arms, 2.) * fineDust * disc * .8;
  float dustLane = smoothstep(.47, .75, fineDust) * (1. - arms) * disc;
  color *= 1. - dustLane * .63;
  color += vec3(.48, .38, .30) * exp(-radius * radius * 16.) * (.55 + clouds * .45);

  color += starLayer(p + view * .5 + vec2(23., 71.), 27., 39.1, .60, .63);
  // A nearby translucent veil crosses the stars more slowly than the core.
  float veil = cloudNoise(q * 2.1 + vec2(5.1, -3.2) - drift * .3);
  color = mix(color, vec3(.12, .095, .17), smoothstep(.52, .8, veil) * .17);
  color += starLayer(p + view * 1.1 + vec2(86., 19.), 53., 82.3, .92, 1.05);
  color += (hash(floor(p * 2.2)) - .5) * .012;
  float edge = max(abs((p.x - 320.) / 320.), abs((p.y - 190.) / 190.));
  color *= 1. - .25 * smoothstep(.65, 1., edge);
  return color;
}

void blackEyes(inout vec3 color, vec2 q, vec2 gaze, float blink, float visibility) {
  // Simple ink-black eyes: no white eyeballs, mouth, or coloured face details.
  vec2 eyeP = q - vec2(gaze.x * 1.2, -7. + gaze.y * 1.2);
  eyeP.x = abs(eyeP.x) - 8.;
  float eye = (length(eyeP / vec2(3.2, max(.65, 4.8 * blink))) - 1.) * 3.;
  color = mix(color, vec3(.015), cover(eye) * visibility);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x / u_resolution.x * 640., (1. - gl_FragCoord.y / u_resolution.y) * 380.);
  float fieldBounds = box(p - vec2(320., 190.), vec2(294.5, 164.5), 5.5);
  // Everything beyond the inner rim is opaque white, including the corners.
  if (fieldBounds > .65) {
    gl_FragColor = vec4(1.);
    return;
  }
  vec3 color = galaxy(p);
  color = mix(color, vec3(.065, .071, .085), (1. - smoothstep(0., 6., abs(fieldBounds))) * .22);

  for (int i = 0; i < 20; i++) {
    float d = length(p - u_trail[i].xy) - 1.;
    color = mix(color, vec3(.91, .93, .96), cover(d) * u_trail[i].z * .4);
  }

  // Merge the blobs and border into one white silhouette, so they rise from
  // the lining itself. The outer edge stays straight while the inner edge bulges.
  float silhouette = -fieldBounds;
  for (int i = 0; i < 3; i++) {
    vec4 agent = u_agents[i];
    vec2 local = edgeLocal(p - agent.xy, u_edges[i]);
    float height = agent.z * u_softness[i].y * (1. + agent.w * .10);
    if (height > .2 && abs(local.x) < 64. && local.y < 18. && local.y > -height - 16.) {
      vec2 halfSize = vec2(24. + (1. - smoothstep(5., 40., height)) * 3., height * .5);
      vec2 q = gooSpace(local, height, u_softness[i]);
      float radius = min(17., height * .48);
      float body = box(q, halfSize, radius);
      body = max(body, local.y - 1.5);
      float shadow = box(gooSpace(local - vec2(2., 3.), height, u_softness[i]), halfSize, radius);
      color = mix(color, vec3(.06, .066, .08), (1. - smoothstep(0., 9., shadow)) * .36);
      silhouette = smoothUnion(silhouette, body, 22.);
    }
  }
  // The rim and emerging agents share one uninterrupted, fully white fill.
  float whiteGrain = (hash(floor(p * 2.3)) - .5) * .012;
  color = mix(color, vec3(1.), cover(silhouette));

  for (int i = 0; i < 3; i++) {
    vec4 agent = u_agents[i];
    float height = agent.z * u_softness[i].y * (1. + agent.w * .10);
    if (height > 23.) {
      vec2 q = gooSpace(edgeLocal(p - agent.xy, u_edges[i]), height, u_softness[i]);
      blackEyes(color, q, edgeLocal(u_gaze[i], u_edges[i]), u_blink[i], smoothstep(23., 35., height));
    }
  }

  // A plain square is all the coordinator needs. Its small pulse marks a relay.
  vec2 hubP = p - vec2(320., 190.);
  vec2 size = vec2(29. + u_coordinator * 2.);
  float hub = box(hubP, size, 1.5);
  color = mix(color, vec3(.05, .055, .069), (1. - smoothstep(0., 11., box(hubP - vec2(2., 4.), size, 1.5))) * .35);
  color = mix(color, vec3(.99 + whiteGrain), cover(hub));

  if (u_packet.z > 0.) {
    vec2 q = p - u_packet.xy;
    float angle = u_packet.w;
    q = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * q;
    float packet = box(q, vec2(5.), 1.);
    color = mix(color, vec3(.05, .055, .069), (1. - smoothstep(0., 5., box(q - vec2(1., 2.), vec2(5.), 1.))) * .4 * u_packet.z);
    color = mix(color, vec3(1.), cover(packet) * u_packet.z);
  }
  gl_FragColor = vec4(color, 1.);
}
