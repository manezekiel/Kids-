import React, { useState, useEffect } from 'react';
import { X, Clock, Volume2, Shield, Heart, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ParentalControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  screenTimeMinutes: number;
  onSetScreenTimeMinutes: (mins: number) => void;
  volumeLimit: number;
  onSetVolumeLimit: (vol: number) => void;
}

export const ParentalControlsModal: React.FC<ParentalControlsModalProps> = ({
  isOpen,
  onClose,
  isNightMode,
  onToggleNightMode,
  screenTimeMinutes,
  onSetScreenTimeMinutes,
  volumeLimit,
  onSetVolumeLimit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Parental Dashboard & Care
              </h2>
              <p className="text-xs text-slate-500">
                Safe screen time, volume guard & learning tips
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playSoundEffect('pop');
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center justify-center transition-transform active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Screen Time Limit / Bedtime Timer */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Screen Time / Bedtime Auto Timer</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 15, 30, 45].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  soundEngine.playSoundEffect('pop');
                  onSetScreenTimeMinutes(mins);
                }}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all ${
                  screenTimeMinutes === mins
                    ? 'bg-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mins === 0 ? 'No Limit' : `${mins} Mins`}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            When the timer finishes, screen smoothly transitions into soothing nightlight mode.
          </p>
        </div>

        {/* Setting 2: Volume Ceiling Limiter */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span>Hearing Protection Volume Level</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Gentle (40%)', val: 0.4 },
              { label: 'Normal (70%)', val: 0.7 },
              { label: 'Max (100%)', val: 1.0 },
            ].map((v) => (
              <button
                key={v.val}
                onClick={() => {
                  soundEngine.playSoundEffect('bell');
                  onSetVolumeLimit(v.val);
                  soundEngine.setMasterVolume(v.val);
                }}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all ${
                  volumeLimit === v.val
                    ? 'bg-emerald-500 text-white font-black shadow-xs ring-2 ring-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Night Starlight Theme */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Bedtime Night Mode
            </p>
            <p className="text-xs text-slate-500">
              Reduces blue light with soothing star palette
            </p>
          </div>
          <button
            onClick={() => {
              soundEngine.playSoundEffect('sparkle');
              onToggleNightMode();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              isNightMode
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isNightMode ? 'Active 🌙' : 'Turn On'}
          </button>
        </div>

        {/* Early Childhood Learning Tips Card */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Early Learning Benefits:</span>
          </div>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
            <li>Sing-along rhymes develop phonological awareness & speech fluency.</li>
            <li>Interactive tracing builds fine-motor control and penmanship muscle memory.</li>
            <li>Bedtime lullabies regulate the nervous system for deeper, restful sleep.</li>
          </ul>
        </div>

        <button
          onClick={() => {
            soundEngine.playSoundEffect('pop');
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-md transition-transform active:scale-98"
        >
          Return to Play
        </button>
      </div>
    </div>
  );
};
