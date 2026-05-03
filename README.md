# 📚 Shelf of Moiz — Digital Library

A fully functional personal digital library web application where an admin can upload books and anyone can read them online — directly in the browser, no downloads required.

Originally built as a single HTML file, this project has been fully upgraded to a modern, robust **React + Vite** single-page application (SPA) with **React Router** for seamless page navigation.

---

## ✨ Features

### For Readers
- 📖 **Read PDFs in-browser** — Dedicated reader page using PDF.js
- 🔍 **Search** books by title, author, or genre
- 🏷️ **Filter by genre** — auto-populated from uploaded books
- 🔖 **Bookmarks** — manually set a bookmark on any page; saved locally
- ⬇️ **Download** any book as a PDF
- 🌙 **Dark / Light mode** — toggle with memory between sessions
- 💬 **Random quotes** — literary quotes on the homepage, refreshable
- 📱 **Fully mobile-friendly** — responsive design, clean UI

### For Admin
- 📤 **Upload books** — PDF + optional cover image, stored securely in Supabase
- 🗑️ **Delete books** — removes from database and storage
- 🔐 **Password-protected admin panel** — change username and password
- 🔄 **Real-time updates** — books uploaded by admin appear instantly on all devices via Supabase subscriptions
- 📊 **Upload progress** — visual indicators during book uploading

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | [React](https://react.dev/) via [Vite](https://vitejs.dev/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Styling | Vanilla CSS (`src/index.css`) |
| PDF Rendering | [PDF.js](https://mozilla.github.io/pdf.js/) |
| Database & Backend | [Supabase](https://supabase.com) (PostgreSQL) — free tier |
| File Storage | Supabase Storage — free tier (1GB) |
| Fonts | Google Fonts (Lora + DM Sans) |

---

## 🚀 Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shelf-of-moiz.git
cd shelf-of-moiz
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (no credit card needed)
2. Click **New Project** and give it a name

### 4. Create the books table

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

### 5. Create a storage bucket

1. Go to **Storage → New bucket**
2. Name it exactly: `books`
3. Check ✅ **Public bucket**
4. Click **Create bucket**

### 6. Add your Supabase credentials

Open `src/supabase.js` and find these two lines:

```js
const SUPABASE_URL  = "https://your-project-id.supabase.co";
const SUPABASE_ANON = "your-anon-public-key";
```

Replace them with your actual values from **Project Settings → API** in the Supabase dashboard.

### 7. Run the development server

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

### 8. Build for Production

```bash
npm run build
```
This generates a `dist/` folder that can be deployed to any static host (Netlify, Vercel, GitHub Pages).

---

## 🔐 Default Admin Credentials

When logging in to the `/login` route for the first time:
```
Username: admin
Password: library123
```
*(You can change these in the Account settings page after logging in).*

---

## 📁 Project Structure

```
shelf-of-moiz/
│
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI (Navbar, etc.)
│   ├── context/         # React Context (AuthContext)
│   ├── pages/           # Route views (Home, Admin, Login, Reader, etc.)
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Router configuration
│   ├── index.css        # Global CSS styles
│   ├── main.jsx         # React entry point
│   └── supabase.js      # Supabase client initialization
│
├── old_index.html       # The original legacy vanilla JS/HTML version
├── package.json         # NPM dependencies
└── vite.config.js       # Vite configuration
```

---

## 📄 License

This project is open source and free to use for personal or educational purposes.

---

> *"A reader lives a thousand lives before he dies. The man who never reads lives only one."* — George R.R. Martin