import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RhymePlayer } from './components/RhymePlayer';
import { AlphabetPlayground } from './components/AlphabetPlayground';
import { BedtimeStories } from './components/BedtimeStories';
import { ToddlerGames } from './components/ToddlerGames';
import { ParentalControlsModal } from './components/ParentalControlsModal';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'rhymes' | 'alphabet' | 'stories' | 'games'>('rhymes');
  const [isNightMode, setIsNightMode] = useState(false);
  const [isToddlerLocked, setIsToddlerLocked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Parental timer state
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [volumeLimit, setVolumeLimit] = useState(0.7);

  // Set up screen time countdown
  useEffect(() => {
    if (screenTimeMinutes > 0) {
      setRemainingSeconds(screenTimeMinutes * 60);
      setIsTimeUp(false);
    } else {
      setRemainingSeconds(0);
      setIsTimeUp(false);
    }
  }, [screenTimeMinutes]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          setIsNightMode(true);
          soundEngine.startLullabyMusic();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  return (
    <div
      className={`min-h-screen transition-colors duration-700 font-sans ${
        isNightMode ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/60 text-slate-900'
      }`}
    >
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {isNightMode ? (
          <>
            <div className="absolute top-10 left-10 text-3xl animate-twinkle opacity-60">✨</div>
            <div className="absolute top-20 right-20 text-2xl animate-twinkle opacity-40">⭐</div>
            <div className="absolute bottom-32 left-1/4 text-4xl animate-twinkle opacity-30">✦</div>
            <div className="absolute top-1/2 right-12 text-3xl animate-twinkle opacity-50">✨</div>
          </>
        ) : (
          <>
            <div className="absolute top-12 left-8 text-4xl animate-float opacity-40">☁️</div>
            <div className="absolute top-24 right-16 text-5xl animate-float opacity-30">☁️</div>
            <div className="absolute bottom-16 left-12 text-4xl animate-gentle-sway opacity-30">🎈</div>
          </>
        )}
      </div>

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        isToddlerLocked={isToddlerLocked}
        onToggleToddlerLock={() => setIsToddlerLocked(!isToddlerLocked)}
        onOpenParentSettings={() => setIsSettingsOpen(true)}
      />

      {/* Screen Time Finished Gentle Bedtime Banner */}
      {isTimeUp && (
        <div className="max-w-4xl mx-auto my-4 p-4 rounded-3xl bg-indigo-900/90 border border-indigo-700 text-white flex items-center justify-between shadow-xl z-20 relative">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce-gentle">🌙</span>
            <div>
              <p className="font-black text-sm">Bedtime Screen Timer Finished!</p>
              <p className="text-xs text-indigo-200">
                Time to snuggle in and listen to sweet dreams lullabies.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsTimeUp(false);
              setScreenTimeMinutes(0);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Interactive App Body */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {currentTab === 'rhymes' && <RhymePlayer isNightMode={isNightMode} />}
        {currentTab === 'alphabet' && <AlphabetPlayground isNightMode={isNightMode} />}
        {currentTab === 'stories' && (
          <BedtimeStories isNightMode={isNightMode} onSetNightMode={setIsNightMode} />
        )}
        {currentTab === 'games' && <ToddlerGames isNightMode={isNightMode} />}
      </main>

      {/* Parental Controls & Sleep Timer Modal */}
      <ParentalControlsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        screenTimeMinutes={screenTimeMinutes}
        onSetScreenTimeMinutes={setScreenTimeMinutes}
        volumeLimit={volumeLimit}
        onSetVolumeLimit={setVolumeLimit}
      />

      {/* Footer info */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-black/5 dark:border-white/5 mt-12">
        <p>Kids Songs & Nursery Rhymes · Designed for early toddler learning, singing & joy</p>
      </footer>
    </div>
  );
}
