'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Submission, FileMetadata } from '@/types';
import { EncouragementBanner } from '@/components/gallery/EncouragementBanner';
import { MessageCard } from '@/components/gallery/MessageCard';
import { MessageModal } from '@/components/gallery/MessageModal';
import { PhotoMasonry } from '@/components/gallery/PhotoMasonry';
import { FileCard } from '@/components/gallery/FileCard';
import { VideoModal } from '@/components/gallery/VideoModal';
import { StoryCard } from '@/components/gallery/StoryCard';
import { Lightbox } from '@/components/gallery/Lightbox';
import { EmptyState } from '@/components/gallery/EmptyState';
import { DeleteConfirmModal } from '@/components/gallery/DeleteConfirmModal';
import {
  Heart,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Layers,
  Search,
  LogOut,
  Loader2,
  Plus,
} from 'lucide-react';

type TabType = 'stories' | 'letters' | 'photos' | 'files';

export default function SGalleryPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('stories');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedMessage, setSelectedMessage] = useState<Submission | null>(null);
  const [activeVideo, setActiveVideo] = useState<{
    file: FileMetadata;
    submission?: Submission;
  } | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    index: number;
    photos: Array<{ file: FileMetadata; submission?: Submission }>;
  } | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'submission' | 'file';
    id: string;
    name?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const res = await fetch('/api/submissions');
        if (res.status === 401) {
          router.push('/s');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch memories');
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMemories();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/s');
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'submission') {
        const res = await fetch(`/api/submissions?id=${deleteTarget.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        }
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Aggregated files
  const allPhotos = useMemo(() => {
    const list: Array<{ file: FileMetadata; submission: Submission }> = [];
    submissions.forEach((sub) => {
      (sub.files || []).forEach((f) => {
        if (
          f.mime_type.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(f.original_filename)
        ) {
          list.push({ file: f, submission: sub });
        }
      });
    });
    return list;
  }, [submissions]);

  const allDocumentsAndMedia = useMemo(() => {
    const list: Array<{ file: FileMetadata; submission: Submission }> = [];
    submissions.forEach((sub) => {
      (sub.files || []).forEach((f) => {
        if (
          !f.mime_type.startsWith('image/') &&
          !/\.(jpg|jpeg|png|webp|gif|heic)$/i.test(f.original_filename)
        ) {
          list.push({ file: f, submission: sub });
        }
      });
    });
    return list;
  }, [submissions]);

  // Filtered submissions based on search query
  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const query = searchQuery.toLowerCase();
    return submissions.filter((sub) => {
      const matchName = sub.display_name?.toLowerCase().includes(query);
      const matchMsg = sub.message.toLowerCase().includes(query);
      const matchFile = (sub.files || []).some((f) =>
        f.original_filename.toLowerCase().includes(query)
      );
      return matchName || matchMsg || matchFile;
    });
  }, [submissions, searchQuery]);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return allPhotos;
    const query = searchQuery.toLowerCase();
    return allPhotos.filter(
      (item) =>
        item.file.original_filename.toLowerCase().includes(query) ||
        item.submission.display_name?.toLowerCase().includes(query)
    );
  }, [allPhotos, searchQuery]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return allDocumentsAndMedia;
    const query = searchQuery.toLowerCase();
    return allDocumentsAndMedia.filter(
      (item) =>
        item.file.original_filename.toLowerCase().includes(query) ||
        item.submission.display_name?.toLowerCase().includes(query)
    );
  }, [allDocumentsAndMedia, searchQuery]);

  const handleSelectPhotoFromStory = (
    file: FileMetadata,
    submission: Submission
  ) => {
    const idx = allPhotos.findIndex((p) => p.file.id === file.id);
    if (idx !== -1) {
      setLightboxPhoto({ index: idx, photos: allPhotos });
    } else {
      setLightboxPhoto({ index: 0, photos: [{ file, submission }] });
    }
  };

  return (
    <main className="min-h-screen py-6 sm:py-8 md:py-12 px-3 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-200/60 dark:border-purple-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-soft-md flex-shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-950 dark:text-purple-50 tracking-tight">
                  Hey Sri 💜
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
                  Your Memory Box
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                People who love you left these memories here for you.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            <Link
              href="/leave"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-700 dark:text-purple-200 hover:text-purple-900 bg-white dark:bg-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-800 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-soft-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-600 dark:text-purple-300 hover:text-rose-700 bg-white/80 dark:bg-purple-900/40 hover:bg-rose-50 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-purple-100 dark:border-purple-800 shadow-soft-sm transition-all cursor-pointer"
              title="Lock memory box"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </header>

        {/* 100 Rotating Encouragement Message Banner */}
        <EncouragementBanner />

        {/* Search & Tabs Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 pt-1">
          {/* Mobile Scrollable Tabs */}
          <div className="flex items-center p-1 bg-purple-100/70 dark:bg-purple-950/70 rounded-2xl border border-purple-200/60 dark:border-purple-800/60 overflow-x-auto scrollbar-none no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-white dark:bg-purple-900 text-purple-950 dark:text-purple-50 shadow-soft-sm'
                  : 'text-purple-700/80 dark:text-purple-300/80 hover:text-purple-950'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Stories ({submissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('letters')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'letters'
                  ? 'bg-white dark:bg-purple-900 text-purple-950 dark:text-purple-50 shadow-soft-sm'
                  : 'text-purple-700/80 dark:text-purple-300/80 hover:text-purple-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Letters ({submissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-white dark:bg-purple-900 text-purple-950 dark:text-purple-50 shadow-soft-sm'
                  : 'text-purple-700/80 dark:text-purple-300/80 hover:text-purple-950'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Photos ({allPhotos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-white dark:bg-purple-900 text-purple-950 dark:text-purple-50 shadow-soft-sm'
                  : 'text-purple-700/80 dark:text-purple-300/80 hover:text-purple-950'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Media ({allDocumentsAndMedia.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories or friends..."
              className="w-full pl-10 pr-4 py-2 bg-white/90 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-700 rounded-2xl text-xs sm:text-sm text-purple-950 dark:text-purple-50 placeholder-purple-300 dark:placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Gallery Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Loading memories for Sri...</p>
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="min-h-[350px]">
            {/* 1. All Stories View */}
            {activeTab === 'stories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredSubmissions.map((sub) => (
                  <StoryCard
                    key={sub.id}
                    submission={sub}
                    onSelectPhoto={handleSelectPhotoFromStory}
                    onSelectMessage={(s) => setSelectedMessage(s)}
                    onPlayVideo={(f, s) => setActiveVideo({ file: f, submission: s })}
                    onDelete={(id) => setDeleteTarget({ type: 'submission', id })}
                  />
                ))}
              </div>
            )}

            {/* 2. Letters & Notes View */}
            {activeTab === 'letters' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredSubmissions.map((sub, index) => (
                  <MessageCard
                    key={sub.id}
                    submission={sub}
                    index={index}
                    onSelect={(s) => setSelectedMessage(s)}
                    onDelete={(id) => setDeleteTarget({ type: 'submission', id })}
                  />
                ))}
              </div>
            )}

            {/* 3. Photo Masonry View */}
            {activeTab === 'photos' && <PhotoMasonry photos={filteredPhotos} />}

            {/* 4. PDFs & Media View */}
            {activeTab === 'files' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredDocs.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-purple-600/70 dark:text-purple-400/70 text-sm">
                    No documents or media files found.
                  </div>
                ) : (
                  filteredDocs.map((item) => (
                    <FileCard
                      key={item.file.id}
                      file={item.file}
                      submission={item.submission}
                      onPlayVideo={(f, s) => setActiveVideo({ file: f, submission: s })}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Modal */}
        <MessageModal
          submission={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />

        {/* Video Player Modal */}
        <VideoModal
          file={activeVideo?.file || null}
          submission={activeVideo?.submission}
          isOpen={activeVideo !== null}
          onClose={() => setActiveVideo(null)}
        />

        {/* Lightbox for Photos */}
        {lightboxPhoto && (
          <Lightbox
            photos={lightboxPhoto.photos}
            currentIndex={lightboxPhoto.index}
            isOpen={lightboxPhoto !== null}
            onClose={() => setLightboxPhoto(null)}
            onIndexChange={(idx) =>
              setLightboxPhoto((prev) => (prev ? { ...prev, index: idx } : null))
            }
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={deleteTarget !== null}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </main>
  );
}
