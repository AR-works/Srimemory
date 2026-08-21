'use client';

import React, { useState, useEffect } from 'react';
import { EncouragementMessage } from '@/types';
import { getRotatingEncouragementMessage } from '@/data/encouragement-messages';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';

const TONE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  heartfelt: { bg: 'bg-purple-100/90 dark:bg-purple-900/80', text: 'text-purple-700 dark:text-purple-300', label: 'Heartfelt' },
  funny: { bg: 'bg-amber-100/90 dark:bg-amber-900/80', text: 'text-amber-800 dark:text-amber-300', label: 'Playful & True' },
  reassuring: { bg: 'bg-emerald-100/90 dark:bg-emerald-900/80', text: 'text-emerald-800 dark:text-emerald-300', label: 'Comfort & Love' },
  friendship: { bg: 'bg-indigo-100/90 dark:bg-indigo-900/80', text: 'text-indigo-800 dark:text-indigo-300', label: 'Friendship' },
  playful: { bg: 'bg-pink-100/90 dark:bg-pink-900/80', text: 'text-pink-800 dark:text-pink-300', label: 'A Little Teasing' },
  confidence: { bg: 'bg-violet-100/90 dark:bg-violet-900/80', text: 'text-violet-800 dark:text-violet-300', label: 'Confidence Boost' },
  teasing: { bg: 'bg-rose-100/90 dark:bg-rose-900/80', text: 'text-rose-800 dark:text-rose-300', label: 'Iconic Sri' },
  warm: { bg: 'bg-purple-100/90 dark:bg-purple-900/80', text: 'text-purple-800 dark:text-purple-300', label: 'Warm Hug' },
};

export const EncouragementBanner: React.FC = () => {
  const [message, setMessage] = useState<EncouragementMessage | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setMessage(getRotatingEncouragementMessage());
  }, []);

  const handleNextMessage = () => {
    setIsRotating(true);
    setTimeout(() => {
      setMessage((prev) => getRotatingEncouragementMessage(prev?.id));
      setIsRotating(false);
    }, 200);
  };

  if (!message) return null;

  const toneConfig = TONE_COLORS[message.tone] || TONE_COLORS.heartfelt;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 via-white to-pink-50/60 dark:from-purple-950/70 dark:via-purple-900/50 dark:to-indigo-950/60 p-6 sm:p-7 rounded-3xl border border-purple-200/80 dark:border-purple-700/60 shadow-soft-md">
      {/* Decorative background sparkle */}
      <div className="absolute top-2 right-3 pointer-events-none opacity-40 dark:opacity-20">
        <Sparkles className="w-16 h-16 text-purple-200 dark:text-purple-600" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2.5 mb-2.5">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300">
              <Heart className="w-3 h-3 fill-purple-400 text-purple-600 dark:text-purple-300 mr-1" />
              Daily Note for Sri
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${toneConfig.bg} ${toneConfig.text}`}
            >
              {toneConfig.label}
            </span>
          </div>

          <p
            className={`text-base sm:text-lg font-medium text-purple-950 dark:text-purple-50 leading-relaxed font-sans transition-opacity duration-200 ${
              isRotating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            &ldquo;{message.text}&rdquo;
          </p>
        </div>

        <button
          type="button"
          onClick={handleNextMessage}
          title="Get another encouragement note"
          className="flex-shrink-0 inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-700 dark:text-purple-200 hover:text-purple-900 bg-white dark:bg-purple-900/60 hover:bg-purple-100/60 dark:hover:bg-purple-800 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-700 shadow-soft-sm transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span>Give me another ✨</span>
        </button>
      </div>
    </div>
  );
};
