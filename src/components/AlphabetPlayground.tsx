import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Sparkles, RefreshCw, Trophy, Play, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALPHABET_DATA, AlphabetItem } from '../data/alphabetData';
import { soundEngine, NOTE_FREQS } from '../utils/soundEngine';

interface AlphabetPlaygroundProps {
  isNightMode: boolean;
}

export const AlphabetPlayground: React.FC<AlphabetPlaygroundProps> = ({ isNightMode }) => {
  const [selectedLetter, setSelectedLetter] = useState<AlphabetItem>(ALPHABET_DATA[0]);
  const [mode, setMode] = useState<'learn' | 'trace' | 'quiz'>('learn');

  // Quiz Mode State
  const [quizTarget, setQuizTarget] = useState<AlphabetItem>(ALPHABET_DATA[0]);
  const [quizOptions, setQuizOptions] = useState<AlphabetItem[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Tracing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracePoints, setTracePoints] = useState<number>(0);

  // Init or switch letter
  const handleSelectLetter = (item: AlphabetItem) => {
    soundEngine.playSoundEffect('pop');
    setSelectedLetter(item);
    clearCanvas();
    // Speak letter phonics
    soundEngine.speak(`${item.letter}. ${item.mainWord.word}. ${item.phonicsHint}`);
  };

  // Play Phonics Audio
  const playPhonicsAudio = (item = selectedLetter) => {
    soundEngine.playSoundEffect('bell');
    soundEngine.speak(
      `${item.letter}! ${item.phonicsHint}. ${item.mainWord.word}! ${item.mainWord.description}`
    );
  };

  // Sing the ABC Song
  const playAbcSong = () => {
    soundEngine.playSoundEffect('sparkle');
    // Sequence of notes for ABC song: A B C D E F G...
    const abcNotes: Array<{ note: string; dur: number; letter: string }> = [
      { note: 'C4', dur: 0.5, letter: 'A' },
      { note: 'C4', dur: 0.5, letter: 'B' },
      { note: 'G4', dur: 0.5, letter: 'C' },
      { note: 'G4', dur: 0.5, letter: 'D' },
      { note: 'A4', dur: 0.5, letter: 'E' },
      { note: 'A4', dur: 0.5, letter: 'F' },
      { note: 'G4', dur: 1.0, letter: 'G' },
      { note: 'F4', dur: 0.5, letter: 'H' },
      { note: 'F4', dur: 0.5, letter: 'I' },
      { note: 'E4', dur: 0.5, letter: 'J' },
      { note: 'E4', dur: 0.5, letter: 'K' },
      { note: 'D4', dur: 0.5, letter: 'L' },
      { note: 'D4', dur: 0.5, letter: 'M' },
      { note: 'C4', dur: 1.0, letter: 'N' },
    ];

    let delay = 0;
    abcNotes.forEach((step) => {
      setTimeout(() => {
        const freq = NOTE_FREQS[step.note] || 440;
        soundEngine.playNote(freq, step.dur * 0.9, 'marimba');
      }, delay * 1000);
      delay += step.dur;
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Start new Quiz Round
  const startNewQuiz = () => {
    const randomTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    // Pick 2 random distractors
    const others = ALPHABET_DATA.filter((i) => i.letter !== randomTarget.letter);
    const shuffled = [...others].sort(() => 0.5 - Math.random()).slice(0, 2);
    const all = [randomTarget, ...shuffled].sort(() => 0.5 - Math.random());

    setQuizTarget(randomTarget);
    setQuizOptions(all);
    setQuizFeedback(null);
    soundEngine.speak(`Can you find the letter ${randomTarget.letter}? As in ${randomTarget.mainWord.word}!`);
  };

  // Check Quiz Answer
  const handleQuizAnswer = (item: AlphabetItem) => {
    if (item.letter === quizTarget.letter) {
      soundEngine.playSoundEffect('cheer');
      setQuizFeedback('🎉 Yay! That is right!');
      setQuizScore((prev) => prev + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        startNewQuiz();
      }, 1800);
    } else {
      soundEngine.playSoundEffect('bounce');
      setQuizFeedback(`Oops! Try again! Find letter ${quizTarget.letter}`);
      soundEngine.speak(`Try again! Find letter ${quizTarget.letter}`);
    }
  };

  // Canvas Drawing Handlers for Rainbow Tracing
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTracePoints(0);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * (canvas.width / rect.width),
      y: ((e as React.MouseEvent).clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    soundEngine.playSoundEffect('pop');
  };

  const continueTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Rainbow gradient stroke
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'];
    const color = colors[tracePoints % colors.length];

    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.lineTo(x, y);
    ctx.stroke();

    setTracePoints((prev) => {
      const next = prev + 1;
      if (next === 30 || next === 60) {
        soundEngine.playSoundEffect('sparkle');
      }
      return next;
    });
  };

  const stopTracing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (tracePoints > 20) {
      soundEngine.playSoundEffect('sparkle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-rose-300 dark:shadow-none">
            Aa
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Alphabet & Phonics Playground
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              Interactive letters, phonics sounds, rainbow tracing & fun quizzes!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sing ABC Song Button */}
          <button
            onClick={playAbcSong}
            className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Sing ABC Song</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
            <button
              onClick={() => {
                soundEngine.playSoundEffect('pop');
                setMode('learn');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'learn'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              📖 Explore
            </button>
            <button
              onClick={() => {
                soundEngine.playSoundEffect('pop');
                setMode('trace');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'trace'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              ✏️ Rainbow Trace
            </button>
            <button
              onClick={() => {
                soundEngine.playSoundEffect('pop');
                setMode('quiz');
                startNewQuiz();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'quiz'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              🎯 Letter Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Mode */}
      {mode === 'learn' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Letter Showcase (Left/Top) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  Phonics Card
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-7xl sm:text-8xl font-black text-slate-900 dark:text-white leading-none">
                    {selectedLetter.letter}
                  </span>
                  <span className="text-5xl font-black text-rose-500 leading-none">
                    {selectedLetter.lower}
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-sm font-bold">
                  <span>Phonics:</span>
                  <span>{selectedLetter.phonicsHint}</span>
                </div>
              </div>

              {/* Pronounce Button */}
              <button
                onClick={() => playPhonicsAudio()}
                className="w-14 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-300 dark:shadow-none flex items-center justify-center transition-transform active:scale-90"
                title="Hear Phonics Sound"
              >
                <Volume2 className="w-7 h-7" />
              </button>
            </div>

            {/* Mascot Word Illustration */}
            <div className="my-6 text-center py-6 px-4 rounded-2xl bg-amber-50 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700">
              <div
                onClick={() => {
                  soundEngine.playSoundEffect('bounce');
                  soundEngine.speak(selectedLetter.mainWord.word);
                }}
                className="text-8xl sm:text-9xl cursor-pointer hover:scale-110 transition-transform animate-bounce-gentle mx-auto"
              >
                {selectedLetter.mainWord.icon}
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {selectedLetter.mainWord.word}
              </h3>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                {selectedLetter.mainWord.description}
              </p>
            </div>

            {/* Bonus Words for Early Readers */}
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                More {selectedLetter.letter} Words:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {selectedLetter.bonusWords.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      soundEngine.playSoundEffect('pop');
                      soundEngine.speak(b.word);
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-center transition-transform active:scale-95 cursor-pointer"
                  >
                    <span className="text-2xl block">{b.icon}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 block truncate">
                      {b.word}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* A to Z Letter Keyboard Grid (Right/Bottom) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Tap Any Letter to Learn!
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  26 Early Phonics Letters
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
                {ALPHABET_DATA.map((item) => {
                  const isCurrent = item.letter === selectedLetter.letter;
                  return (
                    <button
                      key={item.letter}
                      onClick={() => handleSelectLetter(item)}
                      className={`h-16 rounded-2xl flex flex-col items-center justify-center font-black text-xl transition-all active:scale-90 ${
                        isCurrent
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-300 dark:shadow-none ring-4 ring-rose-200 scale-105'
                          : isNightMode
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                          : 'bg-amber-50 hover:bg-amber-100 text-slate-800 border border-amber-200/70 shadow-xs'
                      }`}
                    >
                      <span className="leading-none">{item.letter}</span>
                      <span className="text-xs font-normal opacity-75">{item.mainWord.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/70 border border-amber-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tip: Switch to "Rainbow Trace" mode to practice writing with sparkling finger paint!
                </p>
              </div>
              <button
                onClick={() => {
                  soundEngine.playSoundEffect('sparkle');
                  setMode('trace');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 active:scale-95"
              >
                Trace Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAINBOW TRACING MODE */}
      {mode === 'trace' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Trace Letter {selectedLetter.letter}!
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Use your finger or mouse to draw along the lines
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playSoundEffect('cheer');
                  confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Celebrate!</span>
              </button>
            </div>
          </div>

          {/* Interactive Tracing Canvas Box with Background Letter Stencil */}
          <div className="relative w-full aspect-square max-w-md mx-auto rounded-3xl border-4 border-dashed border-rose-300 dark:border-rose-700 bg-amber-50/50 dark:bg-slate-800/50 overflow-hidden shadow-inner flex items-center justify-center">
            {/* SVG Background Guidelines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30"
              viewBox="0 0 100 100"
            >
              {selectedLetter.tracingPaths.map((path, idx) => (
                <polyline
                  key={idx}
                  points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-800 dark:text-white"
                />
              ))}
            </svg>

            {/* Giant Watermark Letter */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[220px] font-black text-rose-500/15 dark:text-rose-400/10 leading-none">
                {selectedLetter.letter}
              </span>
            </div>

            {/* Foreground Draw Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              onMouseDown={startTracing}
              onMouseMove={continueTracing}
              onMouseUp={stopTracing}
              onMouseLeave={stopTracing}
              onTouchStart={startTracing}
              onTouchMove={continueTracing}
              onTouchEnd={stopTracing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{selectedLetter.mainWord.icon}</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {selectedLetter.encouragement}
            </span>
          </div>

          {/* Quick letter strip to switch while in tracing mode */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none pt-2">
            {ALPHABET_DATA.map((item) => (
              <button
                key={item.letter}
                onClick={() => handleSelectLetter(item)}
                className={`w-10 h-10 flex-shrink-0 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  item.letter === selectedLetter.letter
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LETTER QUIZ MODE */}
      {mode === 'quiz' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <span className="text-base font-black text-slate-900 dark:text-white">
                Score: {quizScore} Stars ⭐
              </span>
            </div>
            <button
              onClick={startNewQuiz}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200 transition-colors"
            >
              Skip Question
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Can you find the letter:
            </p>
            <div className="text-7xl sm:text-8xl my-3 animate-bounce-gentle">
              {quizTarget.mainWord.icon}
            </div>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400">
              "{quizTarget.mainWord.word}" begins with which letter?
            </p>
          </div>

          {/* 3 Large Toddler-Friendly Answer Buttons */}
          <div className="grid grid-cols-3 gap-4">
            {quizOptions.map((opt) => (
              <button
                key={opt.letter}
                onClick={() => handleQuizAnswer(opt)}
                className="h-28 rounded-3xl bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-5xl shadow-md border-2 border-amber-300 dark:border-slate-600 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              >
                {opt.letter}
              </button>
            ))}
          </div>

          {/* Feedback message banner */}
          {quizFeedback && (
            <div className="text-base font-black text-rose-600 dark:text-rose-400 animate-pulse">
              {quizFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
