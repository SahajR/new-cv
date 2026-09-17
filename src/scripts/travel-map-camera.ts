export interface MapCameraTransform { x: number; y: number; scale: number }
export interface MapViewBox { x: number; y: number; width: number; height: number }

// The mobile map eases into a 2× view when it docks, then pans between stops.
// A new stop retargets from the current frame, even during an unfinished pan.
export const MAP_CAMERA = { zoom: 2, duration: 420, cityDuration: 760 } as const;
export const MAP_CAMERA_HOME: MapCameraTransform = { x: 0, y: 0, scale: 1 };

export function focusMapTransform(view: MapViewBox, point: { x: number; y: number }, zoom: number = MAP_CAMERA.zoom): MapCameraTransform {
  return {
    x: view.x + view.width / 2 - point.x * zoom,
    y: view.y + view.height / 2 - point.y * zoom,
    scale: zoom,
  };
}

export function createMapCamera(layer: SVGGElement, onRender?: (value: MapCameraTransform) => void) {
  let current = { ...MAP_CAMERA_HOME };
  let target = { ...MAP_CAMERA_HOME };
  let frame = 0;

  function render(value: MapCameraTransform) {
    current = value;
    layer.setAttribute('transform', `translate(${value.x} ${value.y}) scale(${value.scale})`);
    onRender?.(value);
  }

  function move(next: MapCameraTransform, animate: boolean) {
    if (animate && next.x === target.x && next.y === target.y && next.scale === target.scale) return;
    cancelAnimationFrame(frame);
    frame = 0;
    target = { ...next };
    if (!animate) {
      render(target);
      return;
    }
    const from = { ...current };
    const duration = Math.max(from.scale, target.scale) > 10 ? MAP_CAMERA.cityDuration : MAP_CAMERA.duration;
    let started: number | undefined;
    const tick = (time: number) => {
      started ??= time;
      const progress = Math.min(1, (time - started) / duration);
      const ease = 1 - (1 - progress) ** 4;
      // Country → street scale spans three orders of magnitude. Interpolate
      // zoom logarithmically, keeping translation on the same camera path.
      const deepZoom = Math.max(from.scale / target.scale, target.scale / from.scale) > 8;
      const scale = deepZoom ? from.scale * (target.scale / from.scale) ** ease : from.scale + (target.scale - from.scale) * ease;
      const pan = deepZoom ? (scale - from.scale) / (target.scale - from.scale) : ease;
      render({
        x: from.x + (target.x - from.x) * pan,
        y: from.y + (target.y - from.y) * pan,
        scale,
      });
      frame = progress < 1 ? requestAnimationFrame(tick) : 0;
    };
    frame = requestAnimationFrame(tick);
  }

  return {
    move,
    cleanup() {
      cancelAnimationFrame(frame);
      frame = 0;
      current = { ...MAP_CAMERA_HOME };
      target = { ...MAP_CAMERA_HOME };
      layer.removeAttribute('transform');
      onRender?.(MAP_CAMERA_HOME);
    },
  };
}
