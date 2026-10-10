/**
 * Kid-friendly Web Audio Synthesizer & Sound FX Engine
 * Pure Web Audio API & Web Speech API — zero external audio dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private currentSongTimer: number | null = null;
  private isSongPlaying: boolean = false;
  private lullabyOscillators: OscillatorNode[] = [];
  private lullabyGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play a clean musical note with custom instrument timbre
   */
  public playNote(
    freq: number,
    duration = 0.4,
    instrument: 'marimba' | 'piano' | 'flute' | 'glockenspiel' | 'synth' = 'marimba',
    timeOffset = 0
  ) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const startTime = this.ctx.currentTime + timeOffset;
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    if (instrument === 'marimba') {
      // Warm marimba / wooden xylophone sound
      osc.type = 'triangle';
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    } else if (instrument === 'glockenspiel') {
      // Bright sparkly bell / glockenspiel
      osc.type = 'sine';
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 1.3);

      // Add high overtone
      const overtone = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.76, startTime);
      overtoneGain.gain.setValueAtTime(0.15, startTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.5);
      overtone.connect(overtoneGain);
      overtoneGain.connect(this.masterGain);
      overtone.start(startTime);
      overtone.stop(startTime + duration);
    } else if (instrument === 'piano') {
      // Warm electronic piano
      osc.type = 'sine';
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 1.5);
    } else if (instrument === 'flute') {
      // Soft woodwind
      osc.type = 'sine';
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.08);
      noteGain.gain.linearRampToValueAtTime(0.25, startTime + duration * 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    } else {
      osc.type = 'sawtooth';
      noteGain.gain.setValueAtTime(0.2, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    }

    osc.frequency.setValueAtTime(freq, startTime);
    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  /**
   * Sound effects for toddler actions
   */
  public playSoundEffect(
    type: 'pop' | 'sparkle' | 'horn' | 'quack' | 'bounce' | 'bell' | 'cheer' | 'snare' | 'kick' | 'cymbal' | 'clap'
  ) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'pop': {
        // Satisfying soap bubble pop sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450 + Math.random() * 200, t);
        osc.frequency.exponentialRampToValueAtTime(900 + Math.random() * 300, t + 0.08);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }
      case 'bounce': {
        // Cheerful cartoon boing
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(480, t + 0.15);
        osc.frequency.linearRampToValueAtTime(320, t + 0.25);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'horn': {
        // Bus horn beep beep (two quick tones)
        [0, 0.15].forEach((offset) => {
          const osc1 = this.ctx!.createOscillator();
          const osc2 = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc1.type = 'sawtooth';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(370, t + offset);
          osc2.frequency.setValueAtTime(440, t + offset);
          gain.gain.setValueAtTime(0.3, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.11);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain!);
          osc1.start(t + offset);
          osc2.start(t + offset);
          osc1.stop(t + offset + 0.12);
          osc2.stop(t + offset + 0.12);
        });
        break;
      }
      case 'sparkle': {
        // Magical fairy sparkle
        const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        freqs.forEach((freq, idx) => {
          this.playNote(freq, 0.25, 'glockenspiel', idx * 0.05);
        });
        break;
      }
      case 'bell': {
        this.playNote(880, 0.8, 'glockenspiel');
        break;
      }
      case 'cheer': {
        // Fanfare chord (C - E - G - high C)
        const chord = [261.63, 329.63, 392.0, 523.25];
        chord.forEach((freq) => {
          this.playNote(freq, 0.5, 'marimba');
        });
        setTimeout(() => {
          [329.63, 392.0, 523.25, 659.25].forEach((freq) => {
            this.playNote(freq, 0.8, 'marimba');
          });
        }, 180);
        break;
      }
      case 'kick': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'snare': {
        // Snare with noise buffer
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t);
        break;
      }
      case 'cymbal': {
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.8;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t);
        break;
      }
      default:
        this.playNote(440, 0.2, 'marimba');
    }
  }

  /**
   * Gentle ambient lullaby player for Bedtime mode
   */
  public startLullabyMusic() {
    if (this.isMuted) return;
    this.stopLullabyMusic();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.lullabyGain = this.ctx.createGain();
    this.lullabyGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.lullabyGain.connect(this.masterGain);

    // Dreamy pentatonic sequence: C, D, E, G, A
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25];
    let noteIdx = 0;

    const playNextLullabyNote = () => {
      if (!this.lullabyGain || !this.ctx) return;
      const freq = notes[noteIdx % notes.length];
      this.playNote(freq, 1.8, 'glockenspiel');
      noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1) % notes.length;
    };

    playNextLullabyNote();
    const interval = window.setInterval(playNextLullabyNote, 2200);
    this.currentSongTimer = interval;
  }

  public stopLullabyMusic() {
    if (this.currentSongTimer) {
      clearInterval(this.currentSongTimer);
      this.currentSongTimer = null;
    }
    if (this.lullabyGain && this.ctx) {
      this.lullabyGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      this.lullabyGain = null;
    }
  }

  /**
   * Toddler Voice & Phonics narration using Speech Synthesis
   */
  public speak(text: string, rate = 0.85, pitch = 1.2): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate; // Gentle, clear speed for toddlers
      utterance.pitch = pitch; // Cheerful, friendly pitch
      utterance.lang = 'en-US';

      // Pick sweet female or natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Zira') ||
            v.name.includes('Natural') ||
            v.name.includes('Google US English'))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();

// Musical note frequency mapping for Toddler Piano & Sequencer
export const NOTE_FREQS: Record<string, number> = {
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.0,
  'A4': 440.0,
  'B4': 493.88,
  'C5': 523.25,
  'D5': 587.33,
  'E5': 659.25,
  'F5': 698.46,
  'G5': 783.99,
};
