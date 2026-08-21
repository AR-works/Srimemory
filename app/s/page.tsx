'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { FloralWreath } from '@/components/visuals/FloralWreath';
import { Heart, Lock, KeyRound, ArrowRight, Loader2, Sparkles, ArrowLeft, Unlock, LogOut } from 'lucide-react';

export default function SPrivateEntrancePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    // Check if session cookie exists
    const hasCookie = document.cookie.includes('s_session=');
    setHasExistingSession(hasCookie);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Hmm, that's not the secret PIN. Try again 💜");
      }

      setUnlockedSuccess(true);
      setTimeout(() => {
        router.push('/s/gallery');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "That's not the secret PIN. Try again 💜"
      );
      setIsLoading(false);
    }
  };

  const handleLockSession = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setHasExistingSession(false);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative">
      {/* Top bar with back button & Theme Toggle */}
      <div className="max-w-md mx-auto w-full pt-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-purple-700 dark:text-purple-200 bg-white/80 dark:bg-purple-900/60 hover:bg-white px-3.5 py-1.5 rounded-2xl border border-purple-100 dark:border-purple-700/60 shadow-soft-sm backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <ThemeToggle />
      </div>

      {/* PIN Card with Rotating Floral Wreath */}
      <div className="max-w-md mx-auto w-full my-auto relative z-10 py-6">
        {/* Rotating Floral Ring behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10">
          <FloralWreath size={440} className="opacity-80 dark:opacity-40" />
        </div>

        <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-soft-lg border border-purple-200/80 dark:border-purple-700/60 text-center relative overflow-hidden">
          {unlockedSuccess ? (
            <div className="py-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/80 flex items-center justify-center text-purple-600 dark:text-purple-300 mb-4 animate-pulse-gentle shadow-glow-purple">
                <Heart className="w-10 h-10 fill-purple-500 dark:fill-purple-400 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-purple-950 dark:text-purple-50 mb-2">
                You&apos;re the best, Sri 💜
              </h2>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Opening your garden of memories...
              </p>
            </div>
          ) : hasExistingSession ? (
            /* Active Session Prompt */
            <div className="py-2 space-y-5 animate-in fade-in">
              <div className="relative inline-flex mb-2">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-purple-100 dark:bg-purple-900/80 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-soft-sm">
                  <Unlock className="w-9 h-9" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-sparkle" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-purple-950 dark:text-purple-50 tracking-tight">
                  Welcome back, Sri 💜
                </h1>
                <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300/80 mt-1">
                  Your session is currently unlocked.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/s/gallery"
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-all flex items-center justify-center space-x-2"
                >
                  <span>Open Memory Box</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleLockSession}
                  className="w-full py-2.5 px-4 bg-white/80 dark:bg-purple-900/40 hover:bg-white text-xs font-semibold text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock &amp; Enter PIN Again</span>
                </button>
              </div>
            </div>
          ) : (
            /* PIN Input Form */
            <>
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-200 to-pink-100 dark:from-purple-900 dark:to-pink-950 flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-soft-sm">
                  <Lock className="w-9 h-9" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-sparkle" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-purple-950 dark:text-purple-50 tracking-tight mb-2">
                Hey Sri 💜
              </h1>
              <p className="text-sm text-purple-700/80 dark:text-purple-300/80 mb-8">
                This secret corner is just for you. Enter your secret PIN to open your memory box.
              </p>

              {errorMessage && (
                <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-2xl text-xs font-medium animate-in shake">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter secret PIN"
                    autoFocus
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-purple-950/70 border border-purple-200 dark:border-purple-700 rounded-2xl text-center text-lg font-semibold tracking-widest text-purple-950 dark:text-purple-50 placeholder:font-normal placeholder:tracking-normal placeholder-purple-300 dark:placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !pin.trim()}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying secret key...</span>
                    </>
                  ) : (
                    <>
                      <span>Open Memory Box 💜</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-[11px] text-purple-500/70 dark:text-purple-400/70">
                Protected private vault • Only accessible with Sri&apos;s secret key
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="py-4 text-center text-xs text-purple-400/80 dark:text-purple-400/60 z-10">
        Dedicated to Srinithi (Sri) 🎂
      </div>
    </main>
  );
}
