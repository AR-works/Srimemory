'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { triggerConfetti } from '@/components/ui/Confetti';
import { Heart, Sparkles, Home, PlusCircle } from 'lucide-react';

interface SuccessCelebrationProps {
  onReset: () => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ onReset }) => {
  useEffect(() => {
    triggerConfetti();
    const timer = setTimeout(() => {
      triggerConfetti();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto my-auto text-center py-10 px-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Floating Animated Heart */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/80 flex items-center justify-center animate-pulse-gentle shadow-glow-purple">
          <Heart className="w-12 h-12 text-purple-600 dark:text-purple-300 fill-purple-500 dark:fill-purple-400" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-amber-400 animate-sparkle" />
      </div>

      <h2 className="text-3xl font-bold text-purple-950 dark:text-purple-50 mb-3 tracking-tight">
        It&apos;s in 💜
      </h2>

      <p className="text-lg text-purple-800/90 dark:text-purple-200/90 font-medium mb-2 leading-relaxed">
        Sri has one more reason to smile now.
      </p>

      <p className="text-sm text-purple-600/70 dark:text-purple-400/80 mb-8 max-w-sm mx-auto leading-normal">
        Your note and attached memories have been tucked safely into her private birthday box. Thank you for being part of this gift!
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white dark:bg-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium rounded-2xl border border-purple-200/80 dark:border-purple-700/60 shadow-soft-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Leave another memory</span>
        </button>
      </div>
    </div>
  );
};
