import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Lock, Unlock, Settings, Music, Sparkles, BookOpen, Gamepad2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface NavbarProps {
  currentTab: 'rhymes' | 'alphabet' | 'stories' | 'games';
  onSelectTab: (tab: 'rhymes' | 'alphabet' | 'stories' | 'games') => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  isToddlerLocked: boolean;
  onToggleToddlerLock: () => void;
  onOpenParentSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isNightMode,
  onToggleNightMode,
  isToddlerLocked,
  onToggleToddlerLock,
  onOpenParentSettings,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [lockHoldProgress, setLockHoldProgress] = useState(0);
  const [lockTimer, setLockTimer] = useState<number | null>(null);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playSoundEffect('bell');
    }
  };

  const handleTabClick = (tab: 'rhymes' | 'alphabet' | 'stories' | 'games') => {
    if (isToddlerLocked) return;
    soundEngine.playSoundEffect('pop');
    onSelectTab(tab);
  };

  const startUnlockHold = () => {
    if (!isToddlerLocked) {
      onToggleToddlerLock();
      soundEngine.playSoundEffect('sparkle');
      return;
    }

    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 10;
      setLockHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setLockTimer(null);
        setLockHoldProgress(0);
        onToggleToddlerLock();
        soundEngine.playSoundEffect('cheer');
      }
    }, 150);
    setLockTimer(interval);
  };

  const cancelUnlockHold = () => {
    if (lockTimer) {
      clearInterval(lockTimer);
      setLockTimer(null);
      setLockHoldProgress(0);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-500 border-b ${
        isNightMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-amber-100 text-slate-800 backdrop-blur-md shadow-xs'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform active:scale-95 cursor-pointer ${
              isNightMode ? 'bg-indigo-600 shadow-indigo-900/50' : 'bg-amber-400 shadow-amber-200'
            }`}
            onClick={() => {
              soundEngine.playSoundEffect('bounce');
            }}
          >
            {isNightMode ? '🌙' : '🌈'}
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-balance leading-none flex items-center gap-1.5">
              <span>Little Stars</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isNightMode ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Kids Fun
              </span>
            </h1>
            <p className={`text-xs mt-0.5 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Songs · ABCs · Bedtime · Games
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        {!isToddlerLocked && (
          <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
            <button
              onClick={() => handleTabClick('rhymes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                currentTab === 'rhymes'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : isNightMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/60'
              }`}
            >
              <Music className="w-4 h-4" />
              <span className="hidden xs:inline">Rhymes</span>
            </button>

            <button
              onClick={() => handleTabClick('alphabet')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                currentTab === 'alphabet'
                  ? 'bg-rose-400 text-rose-950 shadow-sm'
                  : isNightMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-100/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden xs:inline">ABCs</span>
            </button>

            <button
              onClick={() => handleTabClick('stories')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                currentTab === 'stories'
                  ? 'bg-indigo-400 text-indigo-950 shadow-sm'
                  : isNightMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-100/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden xs:inline">Stories</span>
            </button>

            <button
              onClick={() => handleTabClick('games')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                currentTab === 'games'
                  ? 'bg-emerald-400 text-emerald-950 shadow-sm'
                  : isNightMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-100/60'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden xs:inline">Games</span>
            </button>
          </nav>
        )}

        {/* Lock indicator banner when active */}
        {isToddlerLocked && (
          <div className="flex-1 max-w-xs mx-auto text-center px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold animate-pulse">
            🔒 Toddler Lock Active (Hold lock icon 2s to unlock)
          </div>
        )}

        {/* Quick Toddler & Parent Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
              isMuted
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                : isNightMode
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Night Mode Toggle */}
          <button
            onClick={() => {
              soundEngine.playSoundEffect('sparkle');
              onToggleNightMode();
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
              isNightMode
                ? 'bg-indigo-900/70 text-indigo-200 hover:bg-indigo-800'
                : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80'
            }`}
            title={isNightMode ? 'Day Mode' : 'Bedtime Night Mode'}
          >
            {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Toddler Lock Button (Hold for 2s if locked) */}
          <button
            onMouseDown={startUnlockHold}
            onMouseUp={cancelUnlockHold}
            onMouseLeave={cancelUnlockHold}
            onTouchStart={startUnlockHold}
            onTouchEnd={cancelUnlockHold}
            className={`relative overflow-hidden w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
              isToddlerLocked
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900'
                : isNightMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80'
            }`}
            title={isToddlerLocked ? 'Hold 2 seconds to Unlock' : 'Lock Screen for Toddler'}
          >
            {isToddlerLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {isToddlerLocked && lockHoldProgress > 0 && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-white/40 transition-all duration-100"
                style={{ height: `${lockHoldProgress}%` }}
              />
            )}
          </button>

          {/* Parents Settings Modal */}
          {!isToddlerLocked && (
            <button
              onClick={() => {
                soundEngine.playSoundEffect('pop');
                onOpenParentSettings();
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${
                isNightMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80'
              }`}
              title="Parent Controls & Sleep Timer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
