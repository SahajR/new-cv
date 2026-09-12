const SOUND_KEY = 'hey.sr:book-sound';
const SOUND_FILES = ['page-flick-1.mp3', 'page-flick-2.mp3', 'page-flick-3.mp3', 'cover-open.mp3'];

/** Short, optional foley. Audio never delays navigation or queues a late sound. */
export class BookAudio {
  readonly supported = typeof AudioContext !== 'undefined';
  enabled = true;
  private context?: AudioContext;
  private files?: Promise<(ArrayBuffer | null)[]>;
  private decoded?: Promise<void>;
  private buffers: (AudioBuffer | null)[] = [];
  private voices = new Set<AudioBufferSourceNode>();
  private generation = 0;
  private previous = -1;

  constructor() {
    try { this.enabled = localStorage.getItem(SOUND_KEY) !== 'off'; } catch { /* Optional preference. */ }
  }

  prepare() {
    if (!this.supported || !this.enabled || this.files) return;
    this.files = Promise.all(SOUND_FILES.map(async (file) => {
      try {
        const response = await fetch(`/audio/scrapbook/${file}`);
        return response.ok ? await response.arrayBuffer() : null;
      } catch { return null; }
    }));
  }

  // Call synchronously from a real click/key event; respect browser autoplay.
  unlock() {
    if (!this.supported || !this.enabled) return;
    try {
      const context = this.context ??= new AudioContext({ latencyHint: 'interactive' });
      if (context.state !== 'running') void context.resume().catch(() => {});
      if (this.decoded) return;
      this.prepare();
      this.decoded = this.files!.then(async (files) => {
        this.buffers = await Promise.all(files.map(async (file) => {
          if (!file) return null;
          try { return await context.decodeAudioData(file); } catch { return null; }
        }));
      });
    } catch { /* Unsupported/blocked audio leaves the book fully usable. */ }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    try { localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off'); } catch { /* Optional preference. */ }
    if (enabled) this.unlock();
  }

  async play(cover = false): Promise<number | undefined> {
    const context = this.context;
    if (!this.enabled || !context || document.hidden) return;
    const generation = this.generation;
    const requestedAt = performance.now();
    await this.decoded;
    if (!this.enabled || generation !== this.generation || document.hidden
      || context.state !== 'running' || performance.now() - requestedAt > 120) return;

    const available = (cover ? [3] : [0, 1, 2]).filter((index) => this.buffers[index]);
    const alternatives = available.filter((index) => index !== this.previous);
    const choices = alternatives.length ? alternatives : available;
    const index = choices[Math.floor(Math.random() * choices.length)];
    if (index === undefined) return;

    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = this.buffers[index];
      source.playbackRate.value = .98 + Math.random() * .04;
      // Balance the recordings without making the sharper flick intrusive.
      gain.gain.value = [.4, .85, .6, .7][index];
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        this.voices.delete(source);
        source.disconnect();
        gain.disconnect();
      };
      source.start();
      this.voices.add(source);
      if (!cover) this.previous = index;
      return index;
    } catch { return; }
  }

  stop() {
    this.generation++;
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
  }
}
