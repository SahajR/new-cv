export function clampPage(page: number, count: number) {
  return Number.isFinite(page) ? Math.max(0, Math.min(count, Math.trunc(page))) : 0;
}

export function pageSteps(from: number, to: number, count: number) {
  const start = clampPage(from, count);
  const end = clampPage(to, count);
  const direction = Math.sign(end - start);
  return Array.from({ length: Math.abs(end - start) }, (_, i) => start + direction * (i + 1));
}

/** Finish the current turn before considering the latest requested destination. */
export class BookNavigation {
  position: number;
  target: number;
  paused = true;
  running = false;
  private generation = 0;
  private count: number;
  private turn: (from: number, to: number) => Promise<void>;
  private settled: (page: number) => void;
  private activeStep: Promise<void> | undefined;
  private bundleOpening: boolean;
  private bundleClosing: boolean;

  constructor(count: number, initial: number, turn: (from: number, to: number) => Promise<void>, settled: (page: number) => void, options: { bundleOpening?: boolean; bundleClosing?: boolean } = {}) {
    this.count = count;
    this.position = this.target = clampPage(initial, count);
    this.turn = turn;
    this.settled = settled;
    this.bundleOpening = options.bundleOpening ?? false;
    this.bundleClosing = options.bundleClosing ?? false;
  }

  request(page: number) {
    this.target = clampPage(page, this.count);
    void this.drain();
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; void this.drain(); }
  whenStepSettles() { return this.activeStep ?? Promise.resolve(); }

  reset(page: number) {
    this.generation++;
    this.running = false;
    this.position = this.target = clampPage(page, this.count);
    this.settled(this.position);
  }

  private async drain() {
    if (this.running || this.paused) return;
    this.running = true;
    const generation = this.generation;
    try {
      while (!this.paused && this.position !== this.target) {
        // Cover transitions move the complete stack; country-to-country
        // navigation still follows individual physical leaves.
        const bundle = (this.bundleOpening && this.position === 0) || (this.bundleClosing && this.target === 0);
        const next = bundle ? this.target : this.position + Math.sign(this.target - this.position);
        this.activeStep = this.turn(this.position, next).then(() => {
          if (generation !== this.generation) return;
          this.position = next;
          this.settled(next);
        });
        await this.activeStep;
        if (generation !== this.generation) return;
        this.activeStep = undefined;
      }
    } finally {
      if (generation === this.generation) this.running = false;
    }
  }
}
