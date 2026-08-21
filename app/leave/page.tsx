'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { UploadFileItem, ContributorSubmissionPayload } from '@/types';
import { UploadDropzone } from '@/components/contributor/UploadDropzone';
import { SuccessCelebration } from '@/components/contributor/SuccessCelebration';
import {
  Heart,
  ArrowLeft,
  Eye,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function LeaveMemoryPage() {
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUploadingFiles = files.some((f) => f.status === 'uploading');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!message.trim()) {
      setErrorMessage('Please write a little note for Sri before sending 💜');
      return;
    }

    if (isUploadingFiles) {
      setErrorMessage('Please wait a moment for your files to finish uploading ⏳');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedFiles = files
        .filter((f) => f.status === 'completed' && f.storageFileId)
        .map((f) => ({
          storageFileId: f.storageFileId!,
          originalFilename: f.name,
          mimeType: f.type,
          fileSize: f.size,
          storageProvider: f.storageProvider || 'google_drive',
        }));

      const payload: ContributorSubmissionPayload = {
        name: isAnonymous ? undefined : name.trim() || undefined,
        isAnonymous,
        message: message.trim(),
        files: uploadedFiles,
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit memory.');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong while saving that 💔 Try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setIsAnonymous(false);
    setMessage('');
    setFiles([]);
    setShowPreview(false);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <SuccessCelebration onReset={handleReset} />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 md:py-14 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-900 bg-white/80 dark:bg-purple-900/60 hover:bg-white px-4 py-2 rounded-2xl border border-purple-100 dark:border-purple-700/60 shadow-soft-sm backdrop-blur-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-purple-500 dark:text-purple-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>For Sri</span>
            </div>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-2.5 rounded-2xl bg-purple-100/90 dark:bg-purple-900/70 text-purple-600 dark:text-purple-300 mb-3 shadow-inner">
            <Heart className="w-6 h-6 fill-purple-400 text-purple-600 dark:text-purple-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-950 dark:text-purple-50 tracking-tight">
            Leave something for Sri 💜
          </h1>
          <p className="text-sm sm:text-base text-purple-700/80 dark:text-purple-300/80 mt-2 max-w-md mx-auto">
            Write a birthday note, share an inside joke, or attach favorite memories, photos, and files.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-soft-lg border border-purple-100/90 dark:border-purple-700/60 relative">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-2xl text-sm flex items-center space-x-2.5 animate-in fade-in">
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contributor Name */}
            <div>
              <label
                htmlFor="contributor-name"
                className="block text-sm font-semibold text-purple-950 dark:text-purple-100 mb-2 flex items-center justify-between"
              >
                <span>Your Name (Optional)</span>
                <span className="text-xs font-normal text-purple-500/80 dark:text-purple-400/80">
                  Leave blank or toggle anonymous
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="contributor-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? 'Submitting anonymously' : 'Your name (optional)'}
                  className={`w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-purple-950/70 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
                    isAnonymous
                      ? 'border-purple-100 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/30 text-purple-400 cursor-not-allowed'
                      : 'border-purple-200 dark:border-purple-700 text-purple-950 dark:text-purple-50 placeholder-purple-300 dark:placeholder-purple-500'
                  }`}
                  maxLength={100}
                />
              </div>

              {/* Anonymity Toggle */}
              <div className="mt-3 flex items-center justify-between p-3 bg-purple-50/60 dark:bg-purple-900/40 rounded-2xl border border-purple-100/70 dark:border-purple-800/60">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-200">
                    Keep me anonymous
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-purple-200 dark:bg-purple-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-purple-950 dark:text-purple-100"
                >
                  Your Message for Sri <span className="text-purple-500">*</span>
                </label>
                <span className="text-xs text-purple-400 font-mono">
                  {message.length}/5000
                </span>
              </div>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                maxLength={5000}
                placeholder="Write something heartfelt for Sri... A funny memory, a thank you note, an inside joke, or pure birthday love 💜"
                className="w-full p-4 bg-white/95 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-700 rounded-2xl text-sm text-purple-950 dark:text-purple-50 placeholder-purple-300 dark:placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all leading-relaxed"
              />
            </div>

            {/* Multi-file Attachments */}
            <div>
              <label className="block text-sm font-semibold text-purple-950 dark:text-purple-100 mb-2">
                Add Memories & Files (Optional)
              </label>
              <UploadDropzone files={files} setFiles={setFiles} />
            </div>

            {/* Preview Toggle */}
            {message.trim().length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 bg-purple-100/60 dark:bg-purple-900/60 hover:bg-purple-100 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showPreview ? 'Hide preview' : 'Preview how Sri will see this'}</span>
                </button>

                {showPreview && (
                  <div className="mt-4 p-5 bg-purple-50/90 dark:bg-purple-900/50 rounded-2xl border border-purple-200/80 dark:border-purple-700 animate-in fade-in">
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                      Card Preview
                    </p>
                    <p className="text-sm text-purple-950 dark:text-purple-100 whitespace-pre-wrap leading-relaxed font-sans">
                      &ldquo;{message}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-purple-600 dark:text-purple-300 font-medium">
                      <span>— {isAnonymous ? 'Anonymous' : name.trim() || 'Anonymous'}</span>
                      <span>Just now</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingFiles || !message.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-soft-md hover:shadow-soft-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving your memory...</span>
                  </>
                ) : isUploadingFiles ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading attachments...</span>
                  </>
                ) : (
                  <>
                    <span>Send to Sri&apos;s Memory Box 💜</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
