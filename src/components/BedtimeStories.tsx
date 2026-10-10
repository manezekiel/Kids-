import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Moon, Volume2, Sparkles, Clock, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BEDTIME_STORIES, BedtimeStory, StoryPage } from '../data/storiesData';
import { soundEngine } from '../utils/soundEngine';

interface BedtimeStoriesProps {
  isNightMode: boolean;
  onSetNightMode: (night: boolean) => void;
}

export const BedtimeStories: React.FC<BedtimeStoriesProps> = ({
  isNightMode,
  onSetNightMode,
}) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isLullabyPlaying, setIsLullabyPlaying] = useState(false);
  const [nightlightActive, setNightlightActive] = useState(false);
  const [interactiveSparkles, setInteractiveSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const story = BEDTIME_STORIES[selectedStoryIndex];
  const page: StoryPage = story.pages[currentPageIndex];

  // Stop narration on unmount or story switch
  useEffect(() => {
    return () => {
      soundEngine.stopSpeaking();
      soundEngine.stopLullabyMusic();
    };
  }, []);

  const handleSelectStory = (idx: number) => {
    soundEngine.playSoundEffect('pop');
    soundEngine.stopSpeaking();
    setSelectedStoryIndex(idx);
    setCurrentPageIndex(0);
    setIsReadingAloud(false);
  };

  const turnPage = (direction: 'next' | 'prev') => {
    soundEngine.playSoundEffect('pop');
    soundEngine.stopSpeaking();
    setIsReadingAloud(false);

    if (direction === 'next') {
      if (currentPageIndex < story.pages.length - 1) {
        setCurrentPageIndex((prev) => prev + 1);
      } else {
        // Finished story!
        soundEngine.playSoundEffect('sparkle');
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      }
    } else {
      if (currentPageIndex > 0) {
        setCurrentPageIndex((prev) => prev - 1);
      }
    }
  };

  const toggleReadAloud = async () => {
    if (isReadingAloud) {
      soundEngine.stopSpeaking();
      setIsReadingAloud(false);
    } else {
      setIsReadingAloud(true);
      soundEngine.playSoundEffect('sparkle');
      // Gentle, slow narration rate for sleep time
      await soundEngine.speak(page.text, 0.78, 1.05);
      setIsReadingAloud(false);

      // Auto advance to next page if not on last page
      if (currentPageIndex < story.pages.length - 1) {
        setTimeout(() => {
          setCurrentPageIndex((prev) => prev + 1);
        }, 800);
      }
    }
  };

  const toggleLullaby = () => {
    if (isLullabyPlaying) {
      soundEngine.stopLullabyMusic();
      setIsLullabyPlaying(false);
    } else {
      soundEngine.startLullabyMusic();
      setIsLullabyPlaying(true);
    }
  };

  const handleSceneTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setInteractiveSparkles((prev) => [...prev.slice(-3), { id: Date.now(), x, y }]);
    soundEngine.playSoundEffect('sparkle');
  };

  return (
    <div className="space-y-6">
      {/* Story Selection Shelf */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {BEDTIME_STORIES.map((s, idx) => {
          const isCurrent = idx === selectedStoryIndex;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectStory(idx)}
              className={`flex-shrink-0 flex items-center gap-3 p-3.5 rounded-3xl transition-all active:scale-95 text-left border ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/40'
                  : isNightMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-800 border-amber-100 hover:bg-indigo-50/50 shadow-xs'
              }`}
            >
              <span className="text-3xl p-2 rounded-2xl bg-white/10">{s.coverIcon}</span>
              <div>
                <p className="font-bold text-sm leading-snug line-clamp-1">{s.title}</p>
                <p className={`text-xs ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {s.durationMinutes} min bedtime read
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Illustrated Storybook Frame */}
      <div
        className={`relative overflow-hidden rounded-3xl border shadow-xl transition-all duration-700 ${
          nightlightActive
            ? 'bg-indigo-950 border-indigo-900 shadow-indigo-950/60 brightness-90'
            : isNightMode
            ? 'bg-slate-900 border-slate-800 shadow-indigo-950/40'
            : 'bg-white border-indigo-100 shadow-indigo-100/50'
        }`}
      >
        {/* Story Illustration Scene */}
        <div
          onClick={handleSceneTap}
          className={`relative w-full aspect-[16/9] min-h-[320px] sm:min-h-[420px] bg-gradient-to-b ${story.bgGradient} flex flex-col justify-between p-6 sm:p-8 cursor-pointer select-none overflow-hidden`}
        >
          {/* Ambient Floating Stars in Night Sky */}
          {page.starPositions.map((star, i) => (
            <div
              key={i}
              className="absolute text-amber-200 animate-twinkle pointer-events-none"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                fontSize: `${star.size}px`,
                animationDelay: `${i * 0.7}s`,
              }}
            >
              ✦
            </div>
          ))}

          {/* Interactive Sparkle Touches */}
          {interactiveSparkles.map((sp) => (
            <div
              key={sp.id}
              className="absolute text-3xl animate-ping pointer-events-none"
              style={{ left: sp.x, top: sp.y }}
            >
              ✨
            </div>
          ))}

          {/* Top Header of the Book */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{story.coverIcon}</span>
              <span className="text-xs sm:text-sm font-bold text-indigo-200/90 tracking-wide uppercase">
                {story.title}
              </span>
            </div>

            {/* Page Count Indicator */}
            <div className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-white/90">
              Page {page.pageNumber} of {story.pages.length}
            </div>
          </div>

          {/* Central Animated Illustration Graphic */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <div className="text-8xl sm:text-9xl animate-float filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              {page.illustrationIcon}
            </div>
            <div className="mt-3 text-xs font-semibold text-indigo-200/80 bg-black/30 px-3 py-1 rounded-full border border-white/10">
              👉 {page.interactiveTapHint}
            </div>
          </div>

          {/* Calming Narrative Prose Panel */}
          <div className="relative z-10 w-full max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-center shadow-lg">
            <p className="text-base sm:text-xl font-bold text-indigo-50 leading-relaxed font-sans">
              "{page.text}"
            </p>
          </div>
        </div>

        {/* Story Controls Toolbar */}
        <div
          className={`p-4 flex flex-wrap items-center justify-between gap-3 border-t ${
            isNightMode
              ? 'bg-slate-900 border-slate-800 text-slate-200'
              : 'bg-indigo-50/50 border-indigo-100 text-slate-800'
          }`}
        >
          {/* Page Turn Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => turnPage('prev')}
              disabled={currentPageIndex === 0}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-700 transition-transform active:scale-95"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Read To Me Button */}
            <button
              onClick={toggleReadAloud}
              className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md ${
                isReadingAloud
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/30'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-900/30'
              }`}
            >
              {isReadingAloud ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>{isReadingAloud ? 'Pause Narration' : 'Read To Me'}</span>
            </button>

            <button
              onClick={() => turnPage('next')}
              disabled={currentPageIndex === story.pages.length - 1}
              className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 dark:hover:bg-slate-700 transition-transform active:scale-95"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Lullaby & Nightlight Toggles */}
          <div className="flex items-center gap-2">
            {/* Ambient Lullaby Music */}
            <button
              onClick={toggleLullaby}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
                isLullabyPlaying
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-black/10 dark:border-white/10'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{isLullabyPlaying ? '🎵 Lullaby Playing' : 'Play Lullaby Music'}</span>
            </button>

            {/* Nightlight Mode */}
            <button
              onClick={() => {
                soundEngine.playSoundEffect('sparkle');
                setNightlightActive(!nightlightActive);
                if (!isNightMode) {
                  onSetNightMode(true);
                }
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
                nightlightActive
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-black/10 dark:border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{nightlightActive ? '🌙 Nightlight On' : 'Nightlight'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
