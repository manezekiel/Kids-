import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Sparkles, Volume2, Maximize2, Minimize2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NurseryRhyme, NURSERY_RHYMES } from '../data/rhymesData';
import { soundEngine, NOTE_FREQS } from '../utils/soundEngine';

interface RhymePlayerProps {
  isNightMode: boolean;
}

export const RhymePlayer: React.FC<RhymePlayerProps> = ({ isNightMode }) => {
  const [selectedRhymeIndex, setSelectedRhymeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Scene Interactive States
  const [busWheelSpin, setBusWheelSpin] = useState(false);
  const [busDoorOpen, setBusDoorOpen] = useState(false);
  const [wipersSwishing, setWipersSwishing] = useState(false);
  const [passengersBouncing, setPassengersBouncing] = useState(false);
  const [starSpinning, setStarSpinning] = useState(false);
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [activeDucks, setActiveDucks] = useState([true, true, true, true, true]);
  const [spiderPosition, setSpiderPosition] = useState<'bottom' | 'top'>('bottom');
  const [isRaining, setIsRaining] = useState(false);
  const [mousePosition, setMousePosition] = useState<'bottom' | 'top'>('bottom');
  const [farmAnimalMoods, setFarmAnimalMoods] = useState<Record<string, boolean>>({});

  const theaterRef = useRef<HTMLDivElement>(null);
  const playbackTimers = useRef<number[]>([]);

  const rhyme = NURSERY_RHYMES[selectedRhymeIndex];

  // Clear all timers on unmount or song switch
  const clearTimers = () => {
    playbackTimers.current.forEach((id) => clearTimeout(id));
    playbackTimers.current = [];
  };

  useEffect(() => {
    stopPlayback();
    return () => clearTimers();
  }, [selectedRhymeIndex]);

  const stopPlayback = () => {
    clearTimers();
    setIsPlaying(false);
    setCurrentLineIndex(0);
    setCurrentNoteIndex(0);
  };

  const startPlayback = () => {
    clearTimers();
    setIsPlaying(true);
    soundEngine.playSoundEffect('bell');

    // Melody sequencer
    let currentTime = 0;
    const beatSeconds = (60 / rhyme.tempo) / speedMultiplier;

    rhyme.melody.forEach((item, index) => {
      const noteDelay = currentTime * 1000;
      const noteDuration = item.duration * beatSeconds;

      const timerId = window.setTimeout(() => {
        setCurrentNoteIndex(index);
        const freq = NOTE_FREQS[item.note] || 440;
        soundEngine.playNote(freq, noteDuration * 0.9, rhyme.instrument);
      }, noteDelay);

      playbackTimers.current.push(timerId);
      currentTime += item.duration * beatSeconds;
    });

    // Lyric line progressor
    let lyricTime = 0;
    rhyme.lyrics.forEach((line, index) => {
      const lineDelay = (lyricTime / speedMultiplier) * 1000;
      const timerId = window.setTimeout(() => {
        setCurrentLineIndex(index);
        // Optional voice sing-along guide
        if (index === 0) {
          triggerCheerSparkle();
        }
      }, lineDelay);

      playbackTimers.current.push(timerId);
      lyricTime += line.duration;
    });

    // Loop or finish
    const totalDuration = (Math.max(currentTime, lyricTime) / speedMultiplier) * 1000;
    const finishTimer = window.setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      soundEngine.playSoundEffect('cheer');
      // Re-trigger or stop
      setIsPlaying(false);
      setCurrentLineIndex(0);
      setCurrentNoteIndex(0);
    }, totalDuration);

    playbackTimers.current.push(finishTimer);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const nextRhyme = () => {
    soundEngine.playSoundEffect('pop');
    setSelectedRhymeIndex((prev) => (prev + 1) % NURSERY_RHYMES.length);
  };

  const prevRhyme = () => {
    soundEngine.playSoundEffect('pop');
    setSelectedRhymeIndex((prev) => (prev - 1 + NURSERY_RHYMES.length) % NURSERY_RHYMES.length);
  };

  const triggerCheerSparkle = () => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
    });
  };

  // Toggle fullscreen theater
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      theaterRef.current?.requestFullscreen?.();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Song selector strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {NURSERY_RHYMES.map((item, idx) => {
          const isCurrent = idx === selectedRhymeIndex;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundEngine.playSoundEffect('pop');
                setSelectedRhymeIndex(idx);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl transition-all font-medium text-sm active:scale-95 ${
                isCurrent
                  ? 'bg-amber-400 text-amber-950 shadow-md font-bold ring-2 ring-amber-300'
                  : isNightMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-amber-50 shadow-xs border border-amber-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="whitespace-nowrap">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Animated Stage Container */}
      <div
        ref={theaterRef}
        className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all ${
          isNightMode
            ? 'bg-slate-900 border-slate-800 shadow-indigo-950/40'
            : 'bg-white border-amber-200 shadow-amber-200/40'
        }`}
      >
        {/* Interactive Animated Stage Canvas */}
        <div
          className={`relative w-full aspect-video min-h-[360px] sm:min-h-[440px] max-h-[580px] bg-gradient-to-b ${rhyme.bgGradient} flex flex-col justify-between overflow-hidden select-none p-4 sm:p-6`}
        >
          {/* Top Stage Header: Title & Actions */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl animate-bounce-gentle">{rhyme.icon}</span>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight drop-shadow-xs">
                  {rhyme.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700/80">
                  {rhyme.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullScreen}
                className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center transition-transform active:scale-90"
                title="Theater Fullscreen"
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* DYNAMIC ANIMATED SCENE PER RHYME */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            {/* 1. THE WHEELS ON THE BUS */}
            {rhyme.animationType === 'bus' && (
              <div className="relative w-full max-w-lg aspect-[16/9] flex items-center justify-center">
                {/* Sunny road background */}
                <div className="absolute inset-x-0 bottom-4 h-12 bg-slate-600 rounded-xl overflow-hidden flex items-center">
                  <div className="w-full border-t-2 border-dashed border-amber-300 opacity-80" />
                </div>

                {/* Sun in sky */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('sparkle');
                  }}
                  className="absolute top-2 right-4 text-5xl cursor-pointer hover:scale-125 transition-transform animate-spin-slow"
                  title="Tap the sun!"
                >
                  ☀️
                </div>

                {/* The Big Yellow Bus */}
                <div
                  className={`relative w-80 sm:w-96 h-48 bg-amber-400 rounded-3xl border-4 border-amber-600 shadow-xl flex flex-col justify-between p-3 transition-transform ${
                    passengersBouncing ? 'translate-y-[-12px]' : 'translate-y-0'
                  }`}
                >
                  {/* Roof & Windshield */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-black bg-amber-600 text-white px-2 py-0.5 rounded-full">
                      TOWN EXPRESS
                    </span>
                    <button
                      onClick={() => {
                        soundEngine.playSoundEffect('horn');
                      }}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs transition-transform active:scale-90 flex items-center gap-1 cursor-pointer"
                    >
                      <span>📢</span> Honk Horn!
                    </button>
                  </div>

                  {/* Windows with passengers */}
                  <div className="grid grid-cols-4 gap-2 my-2">
                    {/* Driver window */}
                    <div
                      onClick={() => {
                        soundEngine.playSoundEffect('bounce');
                        setPassengersBouncing(!passengersBouncing);
                      }}
                      className="h-16 bg-sky-100 rounded-xl border-2 border-amber-500 flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform"
                      title="Tap Driver Bear!"
                    >
                      🐻
                    </div>
                    {/* Passenger 1 */}
                    <div
                      onClick={() => {
                        soundEngine.playSoundEffect('bounce');
                        setPassengersBouncing(!passengersBouncing);
                      }}
                      className="h-16 bg-sky-100 rounded-xl border-2 border-amber-500 flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform"
                      title="Tap Passenger Bunny!"
                    >
                      🐰
                    </div>
                    {/* Passenger 2 */}
                    <div
                      onClick={() => {
                        soundEngine.playSoundEffect('bounce');
                        setPassengersBouncing(!passengersBouncing);
                      }}
                      className="h-16 bg-sky-100 rounded-xl border-2 border-amber-500 flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform"
                      title="Tap Kitty!"
                    >
                      🐱
                    </div>
                    {/* Bus Door */}
                    <div
                      onClick={() => {
                        soundEngine.playSoundEffect('pop');
                        setBusDoorOpen(!busDoorOpen);
                      }}
                      className={`h-16 rounded-xl border-2 border-amber-600 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        busDoorOpen ? 'bg-amber-700 text-white' : 'bg-amber-300 text-amber-900'
                      }`}
                      title="Tap door to open/shut!"
                    >
                      <span className="text-xs font-bold">{busDoorOpen ? 'OPEN' : 'SHUT'}</span>
                      <span className="text-sm">🚪</span>
                    </div>
                  </div>

                  {/* Windshield Wipers Button */}
                  <div className="flex justify-between items-center px-1">
                    <button
                      onClick={() => {
                        soundEngine.playSoundEffect('bounce');
                        setWipersSwishing(!wipersSwishing);
                      }}
                      className={`text-xs px-2 py-0.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                        wipersSwishing ? 'bg-sky-500 text-white border-sky-600' : 'bg-white/80 text-slate-800 border-amber-500'
                      }`}
                    >
                      {wipersSwishing ? '🌧️ Swish Swish!' : 'Wipers'}
                    </button>
                    <span className="text-xs font-black text-amber-900">🚌 WHEELS GO ROUND!</span>
                  </div>

                  {/* Bus Wheels */}
                  <div className="absolute -bottom-6 left-6 right-6 flex justify-between px-3">
                    {/* Front Wheel */}
                    <div
                      onClick={() => {
                        soundEngine.playSoundEffect('bounce');
                        setBusWheelSpin(!busWheelSpin);
                      }}
                      className={`w-14 h-14 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center cursor-pointer shadow-lg ${
                        isPlaying || busWheelSpin ? 'animate-spin-slow' : ''
                      }`}
                      title="Tap to spin!"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-slate-500 flex items-center justify-center text-xs font-black">
                        ⚙️
                      </div>
                    </div>

                    {/* Back Wheel */}
                    <div
                      onClick={() => {
                        soundEngine.playSoundEffect('bounce');
                        setBusWheelSpin(!busWheelSpin);
                      }}
                      className={`w-14 h-14 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center cursor-pointer shadow-lg ${
                        isPlaying || busWheelSpin ? 'animate-spin-slow' : ''
                      }`}
                      title="Tap to spin!"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-slate-500 flex items-center justify-center text-xs font-black">
                        ⚙️
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TWINKLE TWINKLE LITTLE STAR */}
            {rhyme.animationType === 'star' && (
              <div
                className="relative w-full h-72 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setShootingStars((prev) => [...prev.slice(-4), { id: Date.now(), x, y }]);
                  soundEngine.playSoundEffect('sparkle');
                }}
              >
                {/* Crescent Moon */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playSoundEffect('bell');
                  }}
                  className="absolute top-4 left-6 text-6xl animate-float cursor-pointer hover:scale-110 transition-transform"
                  title="Sleepy Moon"
                >
                  🌙
                </div>

                {/* Night Owl */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playSoundEffect('bounce');
                  }}
                  className="absolute bottom-6 right-8 text-5xl animate-gentle-sway cursor-pointer hover:scale-125 transition-transform"
                  title="Hoot Hoot Owl!"
                >
                  🦉
                </div>

                {/* Central Star */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setStarSpinning(true);
                    soundEngine.playSoundEffect('sparkle');
                    setTimeout(() => setStarSpinning(false), 1200);
                  }}
                  className={`relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                    starSpinning ? 'rotate-[360deg] scale-125 duration-1000' : 'hover:scale-110 duration-300'
                  }`}
                >
                  <div className="text-8xl sm:text-9xl filter drop-shadow-[0_0_35px_rgba(250,204,21,0.8)] animate-twinkle">
                    ⭐
                  </div>
                  <span className="mt-2 text-xs font-bold text-amber-200 bg-black/40 px-3 py-1 rounded-full border border-amber-400/30">
                    Tap me to twirl!
                  </span>
                </div>

                {/* Shooting star sparkles */}
                {shootingStars.map((s) => (
                  <div
                    key={s.id}
                    className="absolute text-2xl animate-ping pointer-events-none"
                    style={{ left: s.x, top: s.y }}
                  >
                    ✨
                  </div>
                ))}
              </div>
            )}

            {/* 3. FIVE LITTLE DUCKS */}
            {rhyme.animationType === 'ducks' && (
              <div className="relative w-full max-w-xl flex flex-col items-center justify-end h-72">
                {/* Grassy hills */}
                <div className="w-full flex justify-between px-6 mb-2">
                  <div className="text-4xl animate-gentle-sway">🌼</div>
                  <div className="text-4xl animate-gentle-sway">🌾</div>
                </div>

                {/* Blue Water Pond */}
                <div className="w-full h-36 bg-cyan-400/80 rounded-3xl border-4 border-cyan-500/80 shadow-inner p-3 flex items-center justify-around relative overflow-hidden">
                  {/* Water waves */}
                  <div className="absolute inset-0 bg-cyan-300/30 animate-pulse pointer-events-none" />

                  {/* Mother Duck */}
                  <div
                    onClick={() => {
                      soundEngine.playSoundEffect('bounce');
                    }}
                    className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform z-10"
                    title="Mother Duck (Quack!)"
                  >
                    <span className="text-5xl sm:text-6xl animate-bounce-gentle">🦆</span>
                    <span className="text-xs font-bold bg-white/90 text-cyan-900 px-2 py-0.5 rounded-full mt-1">
                      Mama Duck
                    </span>
                  </div>

                  {/* 5 Little Ducklings */}
                  {activeDucks.map((active, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        soundEngine.playSoundEffect('pop');
                        setActiveDucks((prev) => {
                          const updated = [...prev];
                          updated[i] = !updated[i];
                          return updated;
                        });
                      }}
                      className={`flex flex-col items-center cursor-pointer transition-all z-10 ${
                        active ? 'scale-100 opacity-100' : 'scale-50 opacity-30 translate-y-6'
                      }`}
                      title={`Duckling #${i + 1} - Tap to splash!`}
                    >
                      <span className="text-3xl sm:text-4xl hover:scale-125 transition-transform">
                        🐥
                      </span>
                      <span className="text-[10px] font-black bg-white/80 text-slate-800 px-1.5 rounded-full mt-0.5">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-xs font-bold text-cyan-900">
                  Tap ducklings to dive & splash!
                </div>
              </div>
            )}

            {/* 4. OLD MACDONALD'S FARM */}
            {rhyme.animationType === 'farm' && (
              <div className="relative w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto">
                {/* Cow */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('bounce');
                    setFarmAnimalMoods((prev) => ({ ...prev, cow: !prev.cow }));
                  }}
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border-2 border-emerald-400 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
                >
                  <div className="text-5xl mb-1 animate-bounce-gentle">🐮</div>
                  <div className="font-black text-sm text-emerald-950">Cow</div>
                  <div className="text-xs text-emerald-700 font-semibold">Moo Moo!</div>
                </div>

                {/* Pig */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('pop');
                    setFarmAnimalMoods((prev) => ({ ...prev, pig: !prev.pig }));
                  }}
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border-2 border-pink-400 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
                >
                  <div className="text-5xl mb-1 animate-bounce-gentle">🐷</div>
                  <div className="font-black text-sm text-pink-950">Pig</div>
                  <div className="text-xs text-pink-700 font-semibold">Oink Oink!</div>
                </div>

                {/* Sheep */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('bounce');
                    setFarmAnimalMoods((prev) => ({ ...prev, sheep: !prev.sheep }));
                  }}
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border-2 border-indigo-400 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
                >
                  <div className="text-5xl mb-1 animate-bounce-gentle">🐑</div>
                  <div className="font-black text-sm text-indigo-950">Sheep</div>
                  <div className="text-xs text-indigo-700 font-semibold">Baa Baa!</div>
                </div>

                {/* Red Tractor */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('horn');
                  }}
                  className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border-2 border-amber-400 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
                >
                  <div className="text-5xl mb-1 animate-float">🚜</div>
                  <div className="font-black text-sm text-amber-950">Tractor</div>
                  <div className="text-xs text-amber-700 font-semibold">Chug Chug!</div>
                </div>
              </div>
            )}

            {/* 5. BAA BAA BLACK SHEEP */}
            {rhyme.animationType === 'sheep' && (
              <div className="relative w-full max-w-lg flex flex-col items-center justify-center">
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('bounce');
                  }}
                  className="text-8xl sm:text-9xl cursor-pointer hover:scale-110 transition-transform animate-bounce-gentle"
                  title="Fluffy Black Sheep!"
                >
                  🐑
                </div>
                <div className="flex items-center gap-4 mt-3">
                  {['Bag 1: Master', 'Bag 2: Dame', 'Bag 3: Little Boy'].map((label, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        soundEngine.playSoundEffect('pop');
                      }}
                      className="bg-white/90 p-2.5 rounded-2xl border-2 border-pink-300 text-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                    >
                      <span className="text-3xl">🧶</span>
                      <p className="text-xs font-bold text-pink-900 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ITSY BITSY SPIDER */}
            {rhyme.animationType === 'spider' && (
              <div className="relative w-full max-w-md h-72 flex justify-between items-center px-8">
                {/* Sun */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('sparkle');
                    setIsRaining(false);
                  }}
                  className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                >
                  <span className="text-6xl animate-spin-slow">☀️</span>
                  <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full mt-1">
                    Warm Sun
                  </span>
                </div>

                {/* Waterspout with Climbing Spider */}
                <div className="relative w-20 h-64 bg-slate-400 rounded-2xl border-4 border-slate-600 flex flex-col justify-between items-center py-2 shadow-inner">
                  <div
                    onClick={() => {
                      soundEngine.playSoundEffect('bounce');
                      setSpiderPosition(spiderPosition === 'bottom' ? 'top' : 'bottom');
                    }}
                    className={`text-5xl cursor-pointer transition-all duration-700 ${
                      spiderPosition === 'top' ? 'translate-y-0' : 'translate-y-40'
                    }`}
                    title="Tap Spider to climb!"
                  >
                    🕷️
                  </div>
                  <span className="text-[10px] font-black text-slate-800">SPOUT</span>
                </div>

                {/* Rain Cloud */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('pop');
                    setIsRaining(!isRaining);
                  }}
                  className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                >
                  <span className="text-6xl animate-float">{isRaining ? '🌧️' : '☁️'}</span>
                  <span className="text-xs font-black text-sky-900 bg-sky-200/80 px-2 py-0.5 rounded-full mt-1">
                    {isRaining ? 'Raining!' : 'Tap Rain'}
                  </span>
                </div>
              </div>
            )}

            {/* 7. HICKORY DICKORY DOCK */}
            {rhyme.animationType === 'clock' && (
              <div className="relative w-full max-w-sm h-72 flex flex-col items-center justify-center">
                {/* Grandfather Clock */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('bell');
                  }}
                  className="w-36 h-60 bg-amber-800 rounded-3xl border-4 border-amber-950 flex flex-col items-center justify-between p-3 text-white shadow-xl cursor-pointer"
                >
                  {/* Clock Face */}
                  <div className="w-20 h-20 bg-amber-100 text-slate-900 rounded-full border-4 border-amber-900 flex items-center justify-center text-3xl font-black">
                    🕐
                  </div>

                  {/* Swinging Pendulum */}
                  <div className="text-2xl animate-gentle-sway">🔔</div>

                  {/* Clock Strike Chime Button */}
                  <span className="text-xs font-black bg-amber-900 text-amber-200 px-2 py-0.5 rounded-full">
                    CHIME 1:00
                  </span>
                </div>

                {/* Scurrying Mouse */}
                <div
                  onClick={() => {
                    soundEngine.playSoundEffect('bounce');
                    setMousePosition(mousePosition === 'bottom' ? 'top' : 'bottom');
                  }}
                  className={`absolute right-12 text-5xl cursor-pointer transition-all duration-500 ${
                    mousePosition === 'top' ? '-top-2' : 'bottom-6'
                  }`}
                  title="Little Mouse - Tap to run!"
                >
                  🐁
                </div>
              </div>
            )}

            {/* 8. ROW ROW ROW YOUR BOAT */}
            {rhyme.animationType === 'boat' && (
              <div className="relative w-full max-w-lg h-72 flex flex-col justify-end items-center">
                <div className="w-full flex justify-between px-6 mb-2">
                  <span className="text-5xl animate-float">🌈</span>
                  {/* Friendly smiling croc */}
                  <div
                    onClick={() => {
                      soundEngine.playSoundEffect('sparkle');
                    }}
                    className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                    title="Friendly crocodile waves hello!"
                  >
                    <span className="text-5xl animate-bounce-gentle">🐊</span>
                    <span className="text-[10px] font-black bg-white/90 text-emerald-900 px-2 py-0.5 rounded-full">
                      Friendly Croc!
                    </span>
                  </div>
                </div>

                {/* Sparkling River */}
                <div className="w-full h-32 bg-sky-400 rounded-3xl border-4 border-sky-500 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div
                    onClick={() => {
                      soundEngine.playSoundEffect('bounce');
                    }}
                    className="text-7xl cursor-pointer animate-gentle-sway hover:scale-110 transition-transform"
                    title="Row Boat!"
                  >
                    🚣
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Karaoke Lyrics Display Strip */}
          <div className="relative z-20 w-full max-w-2xl mx-auto mt-2 p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SING-ALONG KARAOKE</span>
            </div>
            <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {rhyme.lyrics[currentLineIndex]?.text || rhyme.title}
            </p>
            {rhyme.lyrics[currentLineIndex]?.subtext && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                {rhyme.lyrics[currentLineIndex].subtext}
              </p>
            )}
            {/* Interactive hint prompt */}
            {rhyme.lyrics[currentLineIndex]?.actionPrompt && (
              <div className="mt-1.5 inline-block text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-3 py-0.5 rounded-full">
                👉 {rhyme.lyrics[currentLineIndex].actionPrompt}
              </div>
            )}
          </div>
        </div>

        {/* Playback Controls Toolbar */}
        <div
          className={`p-4 flex flex-wrap items-center justify-between gap-3 border-t ${
            isNightMode
              ? 'bg-slate-900 border-slate-800 text-slate-200'
              : 'bg-amber-50/60 border-amber-100 text-slate-800'
          }`}
        >
          {/* Previous / Play / Next Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevRhyme}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs hover:bg-amber-100 dark:hover:bg-slate-700 transition-transform active:scale-90"
              title="Previous Rhyme"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`px-5 py-2.5 rounded-2xl font-black text-base flex items-center gap-2 transition-transform active:scale-95 shadow-md ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 dark:shadow-none'
                  : 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-amber-200 dark:shadow-none'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Song'}</span>
            </button>

            <button
              onClick={nextRhyme}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs hover:bg-amber-100 dark:hover:bg-slate-700 transition-transform active:scale-90"
              title="Next Rhyme"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={stopPlayback}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs hover:bg-amber-100 dark:hover:bg-slate-700 transition-transform active:scale-90"
              title="Reset Song"
            >
              <RotateCcw className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Speed / Tempo Options for Toddler */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
            <span className="text-xs font-bold px-2 text-slate-500 dark:text-slate-400 hidden sm:inline">
              Speed:
            </span>
            {[
              { label: '🐢 Slow', val: 0.8 },
              { label: '🌟 Normal', val: 1.0 },
              { label: '🚀 Fast', val: 1.3 },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => {
                  soundEngine.playSoundEffect('pop');
                  setSpeedMultiplier(spd.val);
                  if (isPlaying) {
                    stopPlayback();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  speedMultiplier === spd.val
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
