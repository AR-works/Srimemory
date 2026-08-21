# For S 💜 — Srinithi's Birthday Memory Web App

A bespoke, handmade digital birthday gift created exclusively for **Srinithi (S)**.

This is a private, emotional memory box where friends can leave heartfelt notes, photographs, PDFs, and videos with zero authentication friction, and S can open a PIN-protected memory space containing everything her loved ones shared.

---

## 🌟 Core Features

### 💌 Contributor Experience (`/` & `/leave`)
- **Zero Authentication**: Friends do not need to register or create accounts.
- **Heartfelt Notes**: Extended textarea encouraging deep messages (up to 5,000 characters).
- **Flexible Identity**: Optional name input with an explicit **"Keep me anonymous"** toggle.
- **Multi-File Attachments**: Drag & drop dropzone supporting multiple photos (JPG, PNG, WebP, HEIC), PDFs, MP4/MOV videos, with real-time upload progress, thumbnail previews, and retry on failed uploads.
- **Preview & Celebration**: Instant card preview before submitting, followed by a warm confirmation with confetti (*"It's in 💜 S has one more reason to smile now."*).

### 🔒 S's Private Entrance & Digital Memory Box (`/s` & `/s/gallery`)
- **PIN Protected**: Secured with a secret PIN verified server-side with salted hashing and HTTP-only session cookies.
- **✨ 100 Rotating Encouragement Messages**: A curated collection of 100 distinct friendship notes (heartfelt, funny, teasing, reassuring, warm) that cycle smartly without immediate repeats, with a *"Give me another one ✨"* button.
- **🗂️ Memory Box Tabs**:
  - **All Stories**: Grouped submission views showcasing who sent what, along with their attached media.
  - **Letters & Notes**: Soft paper cards with subtle rotations and full letter modal reader.
  - **Photo Album**: Masonry grid with full aspect ratio preservation and an interactive fullscreen **Lightbox** (zoom, left/right keyboard navigation, download).
  - **PDFs & Media**: Dedicated document cards for PDFs with inline browser opening & downloading, plus embedded video player.
- **Search & Filter**: Search memories by contributor name or keywords.

---

## 🛠️ Tech Stack & Architecture

- **Frontend / Framework**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS
- **Animations & Icons**: Framer Motion, Lucide Icons, Canvas Confetti
- **Database**: Supabase PostgreSQL (or seamless local fallback store)
- **File Storage**: Google Drive API (organized into `Photos`, `Videos`, `PDFs`, `Other` subfolders) with automatic local fallback
- **Deployment**: Vercel ready

---

## 🚀 Quickstart (Run Locally in 2 Minutes)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser:
   - Contributor flow: [http://localhost:3000/leave](http://localhost:3000/leave)
   - S's secret entrance: [http://localhost:3000/s](http://localhost:3000/s) (Default dev PIN: `2024`)

*Note: The app is equipped with an automatic fallback storage & database provider. It works 100% out of the box with realistic seed memories and photo attachments even before connecting Supabase or Google Drive credentials!*

---

## ⚙️ Configuration & Production Setup

### 1. S's Private PIN
In `.env.local` or Vercel Environment Variables:
```env
# Plaintext PIN (easy setup):
S_PIN=2024

# Or SHA-256 hashed PIN with salt (maximum security):
# S_PIN_HASH=your_sha256_hash_here
# S_PIN_SALT=s_bday_salt

SESSION_SECRET=your_random_32_char_secret_key
```

### 2. Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the schema file located at:
   ```
   supabase/schema.sql
   ```
3. Copy your project credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 3. Google Drive Storage Setup
1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Google Drive API**.
2. Create a **Service Account** and generate a JSON key.
3. In Google Drive, create a folder named `S Birthday` and share it with the Service Account email (give **Editor** permissions).
4. Add the following to `.env.local`:
   ```env
   GOOGLE_DRIVE_ROOT_FOLDER_ID=your_drive_folder_id_from_url
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.example` in Vercel Project Settings.
4. Deploy! 🎉

---

## 💜 Dedicated to Srinithi
Made with love for an unforgettable birthday celebration! 🎂
