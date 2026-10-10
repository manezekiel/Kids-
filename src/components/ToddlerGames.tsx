import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, RefreshCw, Trophy, Music, Disc3, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine, NOTE_FREQS } from '../utils/soundEngine';

interface ToddlerGamesProps {
  isNightMode: boolean;
}

interface PianoKey {
  note: string;
  name: string;
  color: string;
  animal: string;
  animalName: string;
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C4', name: 'DO', color: 'bg-rose-500 hover:bg-rose-600', animal: '🐮', animalName: 'Cow' },
  { note: 'D4', name: 'RE', color: 'bg-orange-500 hover:bg-orange-600', animal: '🐶', animalName: 'Puppy' },
  { note: 'E4', name: 'MI', color: 'bg-amber-400 hover:bg-amber-500 text-amber-950', animal: '🦆', animalName: 'Duck' },
  { note: 'F4', name: 'FA', color: 'bg-emerald-500 hover:bg-emerald-600', animal: '🐸', animalName: 'Frog' },
  { note: 'G4', name: 'SOL', color: 'bg-teal-500 hover:bg-teal-600', animal: '🐱', animalName: 'Kitty' },
  { note: 'A4', name: 'LA', color: 'bg-blue-500 hover:bg-blue-600', animal: '🐦', animalName: 'Bird' },
  { note: 'B4', name: 'TI', color: 'bg-indigo-500 hover:bg-indigo-600', animal: '🐑', animalName: 'Sheep' },
  { note: 'C5', name: 'DO', color: 'bg-purple-500 hover:bg-purple-600', animal: '🐷', animalName: 'Pig' },
];

const SONG_GUIDES = [
  {
    title: 'Twinkle Twinkle',
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'],
  },
  {
    title: 'Mary Had a Little Lamb',
    notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'D4', 'D4', 'E4', 'G4', 'G4'],
  },
  {
    title: 'Row Row Row Your Boat',
    notes: ['C4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'E4', 'F4', 'G4'],
  },
];

interface Bubble {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  content: string;
  type: 'letter' | 'color' | 'number';
  label: string;
  colorHex: string;
}

export const ToddlerGames: React.FC<ToddlerGamesProps> = ({ isNightMode }) => {
  const [activeGame, setActiveGame] = useState<'piano' | 'bubbles' | 'drums' | 'detective'>('piano');

  // --- PIANO GAME STATE ---
  const [instrument, setInstrument] = useState<'marimba' | 'glockenspiel' | 'piano'>('marimba');
  const [selectedGuideIndex, setSelectedGuideIndex] = useState<number | null>(null);
  const [guideStep, setGuideStep] = useState(0);
  const [activeKeyEffect, setActiveKeyEffect] = useState<string | null>(null);

  // --- BUBBLE POP GAME STATE ---
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const bubbleFrameRef = useRef<number | null>(null);

  // --- DRUM GAME STATE ---
  const [activeDrumPad, setActiveDrumPad] = useState<string | null>(null);
  const [isGroovePlaying, setIsGroovePlaying] = useState(false);
  const grooveTimerRef = useRef<number | null>(null);

  // --- ANIMAL DETECTIVE STATE ---
  const detectiveAnimals = [
    { name: 'Cow', sound: 'Moo Moo', icon: '🐮', prompt: 'Who makes the sound "Moo Moo"?' },
    { name: 'Duck', sound: 'Quack Quack', icon: '🦆', prompt: 'Who swims in the pond and says "Quack Quack"?' },
    { name: 'Frog', sound: 'Ribbit Ribbit', icon: '🐸', prompt: 'Who hops on water lily pads and says "Ribbit"?' },
    { name: 'Sheep', sound: 'Baa Baa', icon: '🐑', prompt: 'Who gives fluffy warm wool and says "Baa Baa"?' },
    { name: 'Pig', sound: 'Oink Oink', icon: '🐷', prompt: 'Who loves muddy puddles and says "Oink Oink"?' },
    { name: 'Cat', sound: 'Meow Meow', icon: '🐱', prompt: 'Who purrs and drinks milk and says "Meow"?' },
  ];
  const [detectiveTargetIndex, setDetectiveTargetIndex] = useState(0);
  const [detectiveScore, setDetectiveScore] = useState(0);
  const [detectiveFeedback, setDetectiveFeedback] = useState<string | null>(null);

  // Piano Key Press Handler
  const handlePianoKey = (k: PianoKey) => {
    setActiveKeyEffect(k.note);
    setTimeout(() => setActiveKeyEffect(null), 300);

    const freq = NOTE_FREQS[k.note] || 440;
    soundEngine.playNote(freq, 0.6, instrument);

    // Guide progression check
    if (selectedGuideIndex !== null) {
      const currentSong = SONG_GUIDES[selectedGuideIndex];
      const targetNote = currentSong.notes[guideStep];
      if (k.note === targetNote) {
        if (guideStep + 1 >= currentSong.notes.length) {
          // Finished Song!
          soundEngine.playSoundEffect('cheer');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          setGuideStep(0);
        } else {
          setGuideStep((prev) => prev + 1);
        }
      }
    }
  };

  // --- BUBBLE POP GENERATION & ANIMATION LOOP ---
  useEffect(() => {
    if (activeGame !== 'bubbles') {
      if (bubbleFrameRef.current) cancelAnimationFrame(bubbleFrameRef.current);
      return;
    }

    const bubblePalette = [
      { content: 'A', label: 'Letter A', type: 'letter' as const, color: '#EF4444' },
      { content: 'B', label: 'Letter B', type: 'letter' as const, color: '#3B82F6' },
      { content: 'C', label: 'Letter C', type: 'letter' as const, color: '#F59E0B' },
      { content: '🔴', label: 'Red Color', type: 'color' as const, color: '#EF4444' },
      { content: '🟡', label: 'Yellow Color', type: 'color' as const, color: '#EAB308' },
      { content: '🟢', label: 'Green Color', type: 'color' as const, color: '#10B981' },
      { content: '1', label: 'Number 1', type: 'number' as const, color: '#8B5CF6' },
      { content: '2', label: 'Number 2', type: 'number' as const, color: '#EC4899' },
      { content: '3', label: 'Number 3', type: 'number' as const, color: '#06B6D4' },
    ];

    // Seed bubbles
    const initial: Bubble[] = Array.from({ length: 7 }, (_, i) => {
      const item = bubblePalette[Math.floor(Math.random() * bubblePalette.length)];
      return {
        id: Math.random(),
        x: 10 + Math.random() * 80,
        y: 40 + Math.random() * 50,
        speed: 0.25 + Math.random() * 0.4,
        size: 70 + Math.random() * 30,
        content: item.content,
        type: item.type,
        label: item.label,
        colorHex: item.color,
      };
    });
    setBubbles(initial);

    let lastTime = performance.now();
    const animateBubbles = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setBubbles((prev) =>
        prev.map((b) => {
          let newY = b.y - b.speed * dt * 35;
          if (newY < -15) {
            newY = 105;
            b.x = 10 + Math.random() * 80;
          }
          return { ...b, y: newY };
        })
      );

      bubbleFrameRef.current = requestAnimationFrame(animateBubbles);
    };

    bubbleFrameRef.current = requestAnimationFrame(animateBubbles);
    return () => {
      if (bubbleFrameRef.current) cancelAnimationFrame(bubbleFrameRef.current);
    };
  }, [activeGame]);

  const popBubble = (bubble: Bubble) => {
    soundEngine.playSoundEffect('pop');
    soundEngine.speak(bubble.label);
    setPoppedCount((prev) => prev + 1);

    confetti({
      particleCount: 15,
      spread: 40,
      origin: { x: bubble.x / 100, y: bubble.y / 100 },
      colors: [bubble.colorHex],
    });

    // Respawn bubble at bottom
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === bubble.id
          ? {
              ...b,
              y: 110,
              x: 10 + Math.random() * 80,
            }
          : b
      )
    );
  };

  // --- DRUM KIT SOUNDS & GROOVE ---
  const handleDrumHit = (drum: 'kick' | 'snare' | 'cymbal' | 'bongo1' | 'bongo2') => {
    setActiveDrumPad(drum);
    setTimeout(() => setActiveDrumPad(null), 200);

    if (drum === 'kick') soundEngine.playSoundEffect('kick');
    else if (drum === 'snare') soundEngine.playSoundEffect('snare');
    else if (drum === 'cymbal') soundEngine.playSoundEffect('cymbal');
    else if (drum === 'bongo1') soundEngine.playNote(220, 0.2, 'marimba');
    else if (drum === 'bongo2') soundEngine.playNote(330, 0.2, 'marimba');
  };

  const toggleDrumGroove = () => {
    if (isGroovePlaying) {
      if (grooveTimerRef.current) clearInterval(grooveTimerRef.current);
      setIsGroovePlaying(false);
    } else {
      setIsGroovePlaying(true);
      let step = 0;
      const interval = window.setInterval(() => {
        if (step % 4 === 0) handleDrumHit('kick');
        else if (step % 4 === 2) handleDrumHit('snare');
        else handleDrumHit('bongo1');
        step = (step + 1) % 8;
      }, 350);
      grooveTimerRef.current = interval;
    }
  };

  // Detective Quiz handler
  const handleDetectiveChoice = (idx: number) => {
    if (idx === detectiveTargetIndex) {
      soundEngine.playSoundEffect('cheer');
      setDetectiveFeedback('🌟 Correct! Great job listening!');
      setDetectiveScore((prev) => prev + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => {
        const nextTarget = Math.floor(Math.random() * detectiveAnimals.length);
        setDetectiveTargetIndex(nextTarget);
        setDetectiveFeedback(null);
        soundEngine.speak(detectiveAnimals[nextTarget].prompt);
      }, 1500);
    } else {
      soundEngine.playSoundEffect('bounce');
      setDetectiveFeedback('Listen closely and try again!');
      soundEngine.speak(detectiveAnimals[detectiveTargetIndex].prompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'piano', label: 'Rainbow Piano', icon: '🎹', color: 'bg-emerald-500' },
          { id: 'bubbles', label: 'Bubble Pop', icon: '🫧', color: 'bg-cyan-500' },
          { id: 'drums', label: 'Little Drum Kit', icon: '🥁', color: 'bg-amber-500' },
          { id: 'detective', label: 'Animal Sounds', icon: '🦁', color: 'bg-purple-500' },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => {
              soundEngine.playSoundEffect('pop');
              setActiveGame(g.id as any);
            }}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
              activeGame === g.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none'
                : isNightMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-700 hover:bg-emerald-50 border border-emerald-100 shadow-xs'
            }`}
          >
            <span className="text-xl">{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* 1. RAINBOW PIANO / XYLOPHONE GAME */}
      {activeGame === 'piano' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Rainbow Animal Piano & Xylophone
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Tap the colorful keys or follow the song guide lights!
              </p>
            </div>

            {/* Instrument switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
              {[
                { id: 'marimba', label: '🪵 Xylophone' },
                { id: 'glockenspiel', label: '✨ Bells' },
                { id: 'piano', label: '🎹 Piano' },
              ].map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    soundEngine.playSoundEffect('pop');
                    setInstrument(inst.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    instrument === inst.id
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
          </div>

          {/* Song Guide Selector */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 overflow-x-auto">
            <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex-shrink-0">
              🎵 Follow Lights:
            </span>
            {SONG_GUIDES.map((song, idx) => (
              <button
                key={song.title}
                onClick={() => {
                  soundEngine.playSoundEffect('sparkle');
                  setSelectedGuideIndex(idx);
                  setGuideStep(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
                  selectedGuideIndex === idx
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {song.title}
              </button>
            ))}
            {selectedGuideIndex !== null && (
              <button
                onClick={() => setSelectedGuideIndex(null)}
                className="text-xs text-slate-500 underline ml-auto flex-shrink-0"
              >
                Free Play
              </button>
            )}
          </div>

          {/* The 8 Rainbow Keys */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-3 h-64 sm:h-80 select-none">
            {PIANO_KEYS.map((k) => {
              const isTargetNext =
                selectedGuideIndex !== null &&
                SONG_GUIDES[selectedGuideIndex].notes[guideStep] === k.note;
              const isPressed = activeKeyEffect === k.note;

              return (
                <button
                  key={k.note}
                  onClick={() => handlePianoKey(k)}
                  className={`relative rounded-2xl sm:rounded-3xl flex flex-col justify-between items-center py-4 sm:py-6 text-white font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                    k.color
                  } ${isPressed ? 'scale-95 brightness-110 shadow-inner' : ''} ${
                    isTargetNext
                      ? 'ring-4 ring-amber-300 ring-offset-2 animate-bounce-gentle'
                      : ''
                  }`}
                >
                  {/* Animal mascot at top */}
                  <span className="text-2xl sm:text-4xl animate-bounce-gentle">
                    {k.animal}
                  </span>

                  {/* Highlight halo when it's the target note */}
                  {isTargetNext && (
                    <span className="text-xs font-black bg-white text-slate-900 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      TAP!
                    </span>
                  )}

                  {/* Solfege name & note */}
                  <div className="text-center">
                    <span className="text-base sm:text-xl block leading-none">{k.name}</span>
                    <span className="text-[10px] sm:text-xs opacity-75">{k.animalName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. BUBBLE POP PHONICS & COLORS GAME */}
      {activeGame === 'bubbles' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Bubble Pop Safari
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Pop floating bubbles to discover letters, colors, and numbers!
              </p>
            </div>
            <div className="flex items-center gap-2 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300 px-4 py-2 rounded-2xl font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Popped: {poppedCount} ⭐</span>
            </div>
          </div>

          {/* Floating Bubble Aquarium Canvas */}
          <div className="relative w-full h-[420px] rounded-3xl bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-100 dark:from-slate-950 dark:via-sky-950 dark:to-slate-900 border-4 border-cyan-200 dark:border-cyan-900 overflow-hidden shadow-inner select-none">
            {bubbles.map((b) => (
              <div
                key={b.id}
                onClick={() => popBubble(b)}
                className="absolute flex items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-75 shadow-lg backdrop-blur-xs border-2 border-white/60 dark:border-white/30"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  backgroundColor: `${b.colorHex}33`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Bubble highlight reflection */}
                <div className="absolute top-1.5 left-2.5 w-3 h-2 bg-white/70 rounded-full rotate-[-30deg]" />
                <span className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-xs">
                  {b.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LITTLE DRUM KIT GAME */}
      {activeGame === 'drums' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Little Beats Drum Circle
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Tap each drum pad to feel the rhythm beat!
              </p>
            </div>
            <button
              onClick={toggleDrumGroove}
              className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 ${
                isGroovePlaying
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-amber-400 text-amber-950 shadow-xs'
              }`}
            >
              <Disc3 className={`w-4 h-4 ${isGroovePlaying ? 'animate-spin' : ''}`} />
              <span>{isGroovePlaying ? 'Stop Groove' : 'Play Beat Groove'}</span>
            </button>
          </div>

          {/* Drum Kit Interactive Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* Bass Kick */}
            <button
              onClick={() => handleDrumHit('kick')}
              className={`h-36 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg flex flex-col items-center justify-center p-4 shadow-md transition-all active:scale-90 ${
                activeDrumPad === 'kick' ? 'scale-95 ring-4 ring-amber-300' : ''
              }`}
            >
              <span className="text-5xl animate-bounce-gentle">🐻</span>
              <span className="mt-2 text-base font-black">Bass Kick</span>
              <span className="text-xs opacity-75">BOOM BOOM</span>
            </button>

            {/* Snappy Snare */}
            <button
              onClick={() => handleDrumHit('snare')}
              className={`h-36 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white font-black text-lg flex flex-col items-center justify-center p-4 shadow-md transition-all active:scale-90 ${
                activeDrumPad === 'snare' ? 'scale-95 ring-4 ring-rose-300' : ''
              }`}
            >
              <span className="text-5xl animate-bounce-gentle">🐰</span>
              <span className="mt-2 text-base font-black">Snare Drum</span>
              <span className="text-xs opacity-75">KA-POW</span>
            </button>

            {/* Shimmering Cymbal */}
            <button
              onClick={() => handleDrumHit('cymbal')}
              className={`h-36 rounded-3xl bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-lg flex flex-col items-center justify-center p-4 shadow-md transition-all active:scale-90 ${
                activeDrumPad === 'cymbal' ? 'scale-95 ring-4 ring-yellow-200' : ''
              }`}
            >
              <span className="text-5xl animate-spin-slow">🟡</span>
              <span className="mt-2 text-base font-black">Crash Cymbal</span>
              <span className="text-xs opacity-75">TSHHH</span>
            </button>

            {/* Bongo 1 */}
            <button
              onClick={() => handleDrumHit('bongo1')}
              className={`h-36 rounded-3xl bg-teal-500 hover:bg-teal-600 text-white font-black text-lg flex flex-col items-center justify-center p-4 shadow-md transition-all active:scale-90 ${
                activeDrumPad === 'bongo1' ? 'scale-95 ring-4 ring-teal-300' : ''
              }`}
            >
              <span className="text-5xl animate-gentle-sway">🐵</span>
              <span className="mt-2 text-base font-black">High Bongo</span>
              <span className="text-xs opacity-75">TAK TAK</span>
            </button>

            {/* Bongo 2 */}
            <button
              onClick={() => handleDrumHit('bongo2')}
              className={`h-36 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg flex flex-col items-center justify-center p-4 shadow-md transition-all active:scale-90 ${
                activeDrumPad === 'bongo2' ? 'scale-95 ring-4 ring-emerald-300' : ''
              }`}
            >
              <span className="text-5xl animate-gentle-sway">🐒</span>
              <span className="mt-2 text-base font-black">Low Bongo</span>
              <span className="text-xs opacity-75">TOK TOK</span>
            </button>

            {/* Fun Clapper */}
            <button
              onClick={() => {
                soundEngine.playSoundEffect('bounce');
                confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
              }}
              className="h-36 rounded-3xl bg-purple-500 hover:bg-purple-600 text-white font-black text-lg flex flex-col items-center justify-center p-4 shadow-md transition-all active:scale-90 cursor-pointer"
            >
              <span className="text-5xl animate-bounce-gentle">👏</span>
              <span className="mt-2 text-base font-black">Clap Hands!</span>
              <span className="text-xs opacity-75">YAY!</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. ANIMAL SOUND DETECTIVE */}
      {activeGame === 'detective' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Animal Sound Detective
            </h3>
            <span className="text-sm font-black text-purple-600 dark:text-purple-400">
              Stars: {detectiveScore} ⭐
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <button
              onClick={() =>
                soundEngine.speak(detectiveAnimals[detectiveTargetIndex].prompt)
              }
              className="w-14 h-14 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white mx-auto flex items-center justify-center shadow-md active:scale-90 transition-transform mb-3 cursor-pointer"
              title="Hear Prompt Again"
            >
              <Volume2 className="w-7 h-7" />
            </button>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {detectiveAnimals[detectiveTargetIndex].prompt}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {detectiveAnimals.map((animal, idx) => (
              <button
                key={animal.name}
                onClick={() => handleDetectiveChoice(idx)}
                className="h-32 rounded-3xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-700 hover:border-purple-400 flex flex-col items-center justify-center p-3 transition-transform active:scale-90 cursor-pointer shadow-xs"
              >
                <span className="text-5xl">{animal.icon}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {animal.name}
                </span>
              </button>
            ))}
          </div>

          {detectiveFeedback && (
            <p className="text-base font-black text-purple-600 dark:text-purple-400 animate-pulse">
              {detectiveFeedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
