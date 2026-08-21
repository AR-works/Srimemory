import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HardDrive, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function GoogleDriveSetupPage() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-700 bg-white px-3.5 py-1.5 rounded-2xl border border-purple-100 shadow-soft-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-soft-lg border border-purple-200/80 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-950">Google Drive OAuth 2.0 Setup</h1>
            <p className="text-xs text-purple-600">
              Connect your personal Google account (100% Free & Unlimited Storage)
            </p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
          <div className="flex items-center space-x-2 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>How it works</span>
          </div>
          You authorize your Google account <strong>once</strong>. The app receives a permanent refresh token. From then on, any file uploaded by contributors is stored directly in your designated Google Drive folder. Contributors do not need to sign in!
        </div>

        <div className="space-y-4 text-sm text-purple-950">
          <div className="p-4 bg-white rounded-2xl border border-purple-100 shadow-soft-sm space-y-2">
            <h3 className="font-bold text-purple-900 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">1</span>
              <span>Create an OAuth 2.0 Client ID in Google Cloud</span>
            </h3>
            <p className="text-xs text-purple-700/80">
              1. Open <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-purple-600 underline font-semibold inline-flex items-center">Google Cloud Console <ExternalLink className="w-3 h-3 ml-0.5" /></a> and enable <strong>Google Drive API</strong>.
            </p>
            <p className="text-xs text-purple-700/80">
              2. Go to <strong>APIs & Services &gt; Credentials</strong> &gt; <strong>Create Credentials &gt; OAuth Client ID</strong> (Select <strong>Web application</strong>).
            </p>
            <p className="text-xs text-purple-700/80">
              3. Under <strong>Authorized redirect URIs</strong>, add:
            </p>
            <div className="p-2.5 bg-purple-50 rounded-xl font-mono text-xs text-purple-900 select-all border border-purple-100">
              http://localhost:3000/api/auth/google/callback
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-purple-100 shadow-soft-sm space-y-2">
            <h3 className="font-bold text-purple-900 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">2</span>
              <span>Add Client ID &amp; Secret to <code>.env.local</code></span>
            </h3>
            <div className="p-3 bg-purple-950 text-purple-100 rounded-xl font-mono text-xs space-y-1">
              <div>GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
              <div>GOOGLE_CLIENT_SECRET=your_client_secret</div>
              <div>GOOGLE_DRIVE_ROOT_FOLDER_ID=your_drive_folder_id_from_url</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-purple-100 shadow-soft-sm space-y-3">
            <h3 className="font-bold text-purple-900 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">3</span>
              <span>Authorize &amp; Generate Refresh Token</span>
            </h3>
            <p className="text-xs text-purple-700/80">
              Click the button below to authorize with your Google account. It will immediately generate your <code>GOOGLE_REFRESH_TOKEN</code>.
            </p>

            <a
              href="/api/auth/google/login"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl shadow-soft-md transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Connect Google Drive (OAuth 2.0)</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
