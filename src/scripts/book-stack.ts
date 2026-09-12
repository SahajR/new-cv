/** The same physical depth is used by resting leaves and their animated poses. */
export function leafDepth(position: number, leaf: number, step: number) {
  return -Math.abs(position - leaf) * step;
}

export function leafPose(position: number, leaf: number, step: number) {
  return `translateZ(${leafDepth(position, leaf, step)}px) rotateY(${leaf < position ? -180 : 0}deg)`;
}

export function stackPose(position: number, step: number) {
  return `translateZ(${-position * step}px) rotateY(${position > 0 ? -180 : 0}deg)`;
}

/** Group real, permanently thick leaves; only the transform parent is temporary. */
export function createPageStack(volume: HTMLElement, leaves: HTMLElement[], step: number) {
  const stack = document.createElement('div');
  stack.className = 'sb-stack-turn';
  stack.setAttribute('aria-hidden', 'true');
  stack.inert = true;
  stack.style.setProperty('--stack-step', `${step}px`);
  stack.dataset.leaves = String(leaves.length);
  volume.insertBefore(stack, leaves[0]);
  leaves.forEach((leaf) => stack.append(leaf));
  return {
    element: stack,
    restore() {
      // Restore original leaf order before the controller exposes the target.
      leaves.forEach((leaf) => volume.insertBefore(leaf, stack));
      stack.remove();
    },
  };
}
