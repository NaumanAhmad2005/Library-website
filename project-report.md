# Shelf of Moiz - Project Report

**Date:** March 30, 2026
**Project Type:** Personal Digital Library Web Application
**File:** `index.html` (Single-page application)

---

## Executive Summary

Shelf of Moiz is a personal digital library application designed to store, organize, and read PDF books directly in the browser. It's a single-file web application (~98KB) containing all HTML, CSS, and JavaScript bundled together.

---

## Architecture Overview

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| PDF Rendering | PDF.js (v3.11.174) |
| Backend/Database | Supabase (PostgreSQL + Storage) |
| Fonts | Google Fonts (Lora, DM Sans) |

### File Structure
```
web_library/
├── index.html      (Main application - 98KB)
├── README.md       (Project documentation)
└── project-report.md (This file)
```

---

## Features Analysis

### 1. User Interface Components

#### Top Navigation Bar
- **Brand Logo**: Book emoji (📚) with "Shelf of Moiz" title
- **Theme Toggle**: Switch between light/dark mode with animated toggle
- **Admin Access**: Login button for library management

#### Hero Section
- **Visual Design**: SVG bookshelf background (different for light/dark modes)
- **Search Functionality**: Real-time search by title, author, or genre
- **Quote Display**: Random literary quotes with refresh capability

#### Book Grid Display
- Responsive grid layout (auto-fill, min 175px)
- Book cards showing:
  - Cover image (or placeholder)
  - Title and author
  - Genre badge
  - "New" badge for recent additions
  - Bookmark/reading progress indicator

### 2. PDF Reader Features

| Feature | Implementation |
|---------|---------------|
| Rendering | PDF.js with canvas-based page rendering |
| View Mode | Continuous vertical scroll |
| Zoom | 0.4x to 5x scale with pinch-to-zoom support |
| Navigation | Page jump, scroll gauge, keyboard shortcuts |
| Progress | Visual progress bar + scroll gauge |
| Bookmarks | Manual bookmarking at specific pages |
| Resume | Auto-save last read position |
| Download | Direct PDF download capability |

### 3. Admin Panel Features

- **Upload Book**:
  - Title, Author, Genre, Description fields
  - PDF file upload
  - Optional cover image upload
  - Progress indicator

- **Manage Books**:
  - List view with thumbnails
  - Delete functionality with confirmation

- **Account Settings**:
  - Change username
  - Change password
  - Reset to defaults

---

## Technical Implementation

### State Management
```javascript
// Core state variables
let books = []          // Library collection
let isAdmin = false     // Authentication status
let currentGenre = 'all' // Active filter
let pdfDoc = null       // Currently loaded PDF
let currentPage = 1     // Reader position
let zoomScale = 1.3     // Reader zoom level
let activeBookId = null // Currently open book
```

### Data Storage

#### Supabase Integration
- **Table**: `books`
  - `id` (TEXT PRIMARY KEY)
  - `title` (TEXT)
  - `author` (TEXT)
  - `genre` (TEXT)
  - `description` (TEXT)
  - `pdf_url` (TEXT)
  - `cover_url` (TEXT)
  - `added_at` (TIMESTAMPTZ)

- **Storage Bucket**: `books`
  - Structure: `/{book_id}/book.pdf`
  - Structure: `/{book_id}/cover.{ext}`

#### Local Storage
- `libra_creds`: Admin credentials
- `libra_theme`: Theme preference
- `libra_vid`: Visitor ID (for bookmarks)
- `libra_bm_{visitor_id}`: Bookmarks (cookie-based)

### Bookmark System
Two-tier bookmarking:
1. **Auto-tracked (`lastPage`)**: Automatically saves reading position
2. **Manual (`manualPage`)**: User-set bookmark for important pages

---

## Code Structure

### CSS Organization
| Section | Lines | Description |
|---------|-------|-------------|
| CSS Variables | 16-32 | Theme colors (light/dark) |
| Theme Toggle | 36-57 | Dark mode switch styles |
| Hero Section | 70-155 | Light/dark bookshelf backgrounds |
| Main Layout | 157-168 | Container and filters |
| Book Grid | 168-187 | Card styling and animations |
| PDF Reader | 203-354 | Reader UI components |
| Admin Panel | 405-439 | Modal and tab styles |
| Mobile Responsive | 538-645 | Media queries |

### JavaScript Organization
| Section | Lines | Description |
|---------|-------|-------------|
| PDF.js Setup | 930-932 | Worker configuration |
| Cookie Helpers | 936-965 | Bookmark persistence |
| Credentials | 972-979 | Auth management |
| Supabase Config | 982-1021 | Database connection |
| State & Load | 1024-1052 | Data fetching |
| Rendering | 1089-1134 | Book grid display |
| PDF Reader | 1139-1435 | Full reader implementation |
| Auth & Admin | 1550-1802 | Admin features |
| Theme & Quotes | 1862-1916 | UI extras |

---

## Security Considerations

### Strengths
- Row Level Security (RLS) policies in Supabase
- Credentials stored in localStorage (not ideal but acceptable for personal use)
- Input sanitization via `esc()` function for XSS prevention

### Potential Improvements
- Move credentials to server-side session
- Add rate limiting for uploads
- Implement CSRF protection
- Add file type/size validation on client and server

---

## Performance Analysis

### Optimizations Implemented
1. **Lazy Rendering**: PDF pages render on-demand via IntersectionObserver
2. **Image Loading**: Cover images use `loading="lazy"`
3. **Animation Efficiency**: CSS animations with `transform` and `opacity`
4. **Scroll Performance**: Passive event listeners

### Bundle Size
- **HTML/CSS/JS**: ~98KB
- **External Dependencies**:
  - PDF.js: ~70KB (CDN)
  - Supabase SDK: ~45KB (CDN)
  - Fonts: ~ variable (Google Fonts)

---

## Mobile Compatibility

### Responsive Breakpoints
- **Mobile** (< 680px): 2-column grid, full-screen modals
- **Tablet** (681-900px): 3-column grid
- **Desktop** (> 900px): Auto-fill grid

### Touch Optimizations
- Minimum 44px touch targets
- Pinch-to-zoom in reader
- iOS scroll behavior fixes
- Prevent text zoom on focus

---

## Setup Requirements

### For Development/Deployment
1. **Supabase Account** (free tier)
2. **Database Setup**:
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
   ```
3. **Storage Bucket**: Create public "books" bucket
4. **Configure Credentials**: Update `SUPABASE_URL` and `SUPABASE_ANON` in code

---

## Recommendations

### Short-term Improvements
1. Add keyboard shortcuts for reader (arrow keys, spacebar)
2. Implement search highlighting
3. Add book sorting options (date, title, author)
4. Create loading skeletons for better perceived performance

### Long-term Enhancements
1. Add user accounts (multi-user support)
2. Implement book categories/tags beyond genre
3. Add reading statistics/analytics
4. Create offline mode with service worker
5. Add annotations/highlighting in PDF reader

---

## Conclusion

Shelf of Moiz is a well-structured, feature-complete personal library application. The single-file architecture makes it highly portable and easy to deploy, while the Supabase integration provides robust backend capabilities without server management. The PDF reader implementation is particularly impressive with its smooth scrolling, zoom controls, and bookmark system.

**Overall Assessment**: Production-ready for personal use with minor security enhancements recommended for multi-user scenarios.

---

*Report generated on March 30, 2026*
