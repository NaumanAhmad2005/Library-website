# 📚 Shelf of Moiz — Digital Library

A fully functional personal digital library website where an admin can upload books and anyone can read them online — directly in the browser, no downloads required.

Built as a single HTML file. No frameworks, no build tools, no server needed.

---

## ✨ Features

### For Readers
- 📖 **Read PDFs in-browser** — continuous scroll reading mode (like a webpage)
- 🔍 **Search** books by title, author, or genre
- 🏷️ **Filter by genre** — auto-populated from uploaded books
- 🔖 **Bookmarks** — manually set a bookmark on any page; saved in browser cookies per user
- 📍 **Go to Bookmark** — jump back to your saved page instantly
- 📖 **Resume Reading** — automatically remembers the last page you read
- ⬇️ **Download** any book as a PDF
- 🌙 **Dark / Light mode** — toggle with memory between sessions
- 💬 **Random quotes** — literary quotes on the homepage, refreshable
- 📱 **Fully mobile-friendly** — pinch to zoom, tap to open books, bottom-sheet modals

### For Admin
- 📤 **Upload books** — PDF + optional cover image, stored in Supabase
- 🗑️ **Delete books** — removes from database and storage
- 🔐 **Password-protected admin panel** — change username and password
- 🔄 **Real-time updates** — books uploaded by admin appear instantly on all devices
- 📊 **Upload progress bar** — live percentage while uploading

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (single file) |
| PDF Rendering | [PDF.js](https://mozilla.github.io/pdf.js/) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) — free tier |
| File Storage | Supabase Storage — free tier (1GB) |
| Fonts | Google Fonts (Lora + DM Sans) |
| Hosting | GitHub Pages / Netlify / any static host |

---

## 🚀 Setup Guide

### 1. Fork or download this repo

```bash
git clone https://github.com/your-username/shelf-of-moiz.git
```

### 2. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (no credit card needed)
2. Click **New Project** and give it a name

### 3. Create the books table

In your Supabase dashboard, go to **SQL Editor** and run:

```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT,
  description TEXT,
  pdf_url TEXT,
  cover_url TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable row level security (public library, no auth needed)
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
```

### 4. Create a storage bucket

1. Go to **Storage → New bucket**
2. Name it exactly: `books`
3. Check ✅ **Public bucket**
4. Click **Create bucket**

### 5. Add your Supabase credentials

Open `index.html` (or `library.html`) and find these two lines:

```js
const SUPABASE_URL  = "";
const SUPABASE_ANON = "";
```

Replace with your values from **Project Settings → API**:

```js
const SUPABASE_URL  = "https://your-project-id.supabase.co";
const SUPABASE_ANON = "your-anon-public-key";
```

### 6. Deploy

**Option A — GitHub Pages (free)**
- Push the file to your repo
- Go to **Settings → Pages → Source: main branch**
- Your site will be live at `https://your-username.github.io/shelf-of-moiz`

**Option B — Netlify (free)**
- Drag and drop the HTML file at [netlify.com/drop](https://netlify.com/drop)
- Done in seconds

---

## 🔐 Default Admin Credentials

```
Username: admin
Password: library123
```

---

## 📱 Mobile Support

- Tap any book card to open the reader
- Pinch with two fingers to zoom in/out on PDF pages
- Swipe up to scroll continuously through pages
- Admin panel opens as a bottom sheet
- Upload PDFs directly from your phone's Files app, Google Drive, or iCloud

---

## 📁 Project Structure

```
shelf-of-moiz/
│
├── index.html       # The entire app — HTML + CSS + JS in one file
└── README.md        # This file
```

---

## 📄 License

This project is open source and free to use for personal or educational purposes.

---

> *"A reader lives a thousand lives before he dies. The man who never reads lives only one."* — George R.R. Martin