'use client';

import React from 'react';
import Link from 'next/link';
import { FloralWreath } from '@/components/visuals/FloralWreath';
import { Heart, Sparkles, Send } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto relative">
      <div className="relative inline-flex items-center justify-center mb-6">
        <FloralWreath size={220} className="absolute -z-10 opacity-70 dark:opacity-40" />

        <div className="w-20 h-20 rounded-3xl bg-purple-100/90 dark:bg-purple-900/80 flex items-center justify-center animate-pulse-gentle shadow-soft-sm">
          <Heart className="w-10 h-10 fill-purple-400 text-purple-600 dark:text-purple-300" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-sparkle" />
      </div>

      <h3 className="text-2xl font-bold text-purple-950 dark:text-purple-50 mb-2">
        It&apos;s quiet in here...
      </h3>

      <p className="text-sm sm:text-base text-purple-700/80 dark:text-purple-300/80 mb-8 leading-relaxed">
        Give people a little time. They&apos;re cooking something special for you, Sri 💜
      </p>

      <div className="inline-flex">
        <Link
          href="/leave"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs sm:text-sm rounded-2xl shadow-soft-sm transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Leave a memory for Sri</span>
        </Link>
      </div>
    </div>
  );
};
