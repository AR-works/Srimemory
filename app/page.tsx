import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { FloralWreath } from '@/components/visuals/FloralWreath';
import { Heart, Sparkles, Send, Lock, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      {/* Top Bar with gentle title & Theme Toggle */}
      <header className="py-6 px-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-soft-sm">
            <Heart className="w-4 h-4 fill-purple-400 text-purple-600 dark:text-purple-300" />
          </div>
          <span className="font-bold text-lg text-purple-950 dark:text-purple-100 tracking-tight">
            For Sri.
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            href="/s"
            className="text-xs font-medium text-purple-600/90 dark:text-purple-200 bg-white/70 dark:bg-purple-900/50 hover:bg-white dark:hover:bg-purple-900 px-3.5 py-1.5 rounded-full border border-purple-100/80 dark:border-purple-700/60 shadow-soft-sm backdrop-blur-sm transition-all flex items-center space-x-1.5"
          >
            <Lock className="w-3 h-3" />
            <span>Sri&apos;s Entrance</span>
          </Link>
        </div>
      </header>

      {/* Hero Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-10 max-w-3xl mx-auto my-auto relative">
        {/* Animated Cute Icon Badge with Rotating Floral Wreath */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <FloralWreath className="absolute w-44 h-44 sm:w-56 sm:h-56 -z-10 opacity-70 dark:opacity-50" />

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-200 via-purple-100 to-pink-100 dark:from-purple-900 dark:via-purple-800 dark:to-pink-900 flex items-center justify-center shadow-soft-md animate-float-slow">
            <Heart className="w-12 h-12 sm:w-14 sm:h-14 text-purple-600 dark:text-purple-300 fill-purple-400/90 dark:fill-purple-400/70" />
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/80 flex items-center justify-center shadow-soft-sm animate-sparkle">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/80 flex items-center justify-center shadow-soft-sm">
            <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-purple-950 dark:text-purple-50 tracking-tight leading-tight sm:leading-tight mb-4">
          This little corner of the internet is for <span className="text-purple-600 dark:text-purple-400 underline decoration-purple-300 dark:decoration-purple-500 decoration-wavy decoration-2">Sri</span> 💜
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-purple-800/80 dark:text-purple-200/80 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          A bespoke birthday memory space made by the people who cherish, adore, and celebrate Srinithi.
        </p>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
          <Link
            href="/leave"
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold text-base sm:text-lg rounded-2xl shadow-soft-lg hover:shadow-glow-purple transition-all duration-300 flex items-center justify-center space-x-3 group cursor-pointer"
          >
            <span>Leave something for Sri</span>
            <Send className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Reassuring note */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-purple-600/70 dark:text-purple-300/70">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>No accounts needed • Share notes, photos, PDFs & videos</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-purple-500/80 dark:text-purple-400/70">
        <p className="mb-2">Made with heartfelt love for Srinithi&apos;s Birthday 🎂</p>
        <Link
          href="/s"
          className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 underline underline-offset-4 transition-colors font-medium"
        >
          Hey Sri? Secret entrance this way 💜
        </Link>
      </footer>
    </div>
  );
}
