/**
 * A simple synthesizer-based audio engine.
 * No external assets required.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;

  constructor() {
    // Context is initialized on first user interaction to comply with browser policies
  }

  init(_?: any) {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; // Global volume
    this.masterGain.connect(this.ctx.destination);
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume = 1, slideTo: number | null = null) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoise(duration: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    
    // Filter the noise for a "thud" or "explosion" sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  // --- SFX Methods ---

  playShoot(isUpgraded = false) {
    this.init();
    // Pew pew sound
    const startFreq = isUpgraded ? 880 : 600;
    const endFreq = isUpgraded ? 300 : 200;
    this.playTone(startFreq, 'square', 0.1, 0.3, endFreq);
  }

  playEnemyHit() {
    this.init();
    this.playTone(200, 'sawtooth', 0.1, 0.2, 50);
  }

  playEnemyDie() {
    this.init();
    // Pop sound
    this.playTone(400, 'sine', 0.05, 0.4, 800);
    setTimeout(() => this.playNoise(0.1), 50);
  }

  playPlayerDamage() {
    this.init();
    // Crunch sound
    this.playTone(100, 'sawtooth', 0.3, 0.5, 50);
    this.playNoise(0.3);
  }

  playReload() {
    this.init();
    // Click clack
    this.playTone(800, 'square', 0.05, 0.2);
    setTimeout(() => this.playTone(1200, 'square', 0.05, 0.2), 200);
  }

  playUpgrade() {
    this.init();
    // Power up jingle
    this.playTone(440, 'sine', 0.1, 0.3);
    setTimeout(() => this.playTone(554, 'sine', 0.1, 0.3), 100);
    setTimeout(() => this.playTone(659, 'sine', 0.2, 0.3), 200);
  }

  playUiClick(_?: any) {
    this.init();
    this.playTone(800, 'sine', 0.05, 0.1);
  }

  // --- Simple BGM ---
  // Very basic loop to add atmosphere
  startBgm() {
    if (this.bgmOscillators.length > 0) return; // Already playing
    this.init();
    
    // We'll use a simple interval for BGM to avoid complex scheduling logic for now
    // In a real production app, we'd use audioContext scheduling.
  }

  stopBgm() {
    // Placeholder if we implemented full BGM
  }
}

export const audio = new AudioEngine();