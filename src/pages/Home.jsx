import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { getBookmark } from '../utils/helpers';

const QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", author: "Jane Austen" },
  { text: "So it goes.", author: "Kurt Vonnegut" },
  { text: "The books that the world calls immoral are books that show the world its own shame.", author: "Oscar Wilde" },
  { text: "One must always be careful of books, and what is inside them, for words have the power to change us.", author: "Cassandra Clare" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "Outside of a dog, a book is man's best friend. Inside of a dog it's too dark to read.", author: "Groucho Marx" },
  { text: "We read to know we are not alone.", author: "C.S. Lewis" },
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [quote, setQuote] = useState(QUOTES[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
    showRandomQuote();
    
    const channel = supabase.channel('books-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => {
        fetchBooks();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('added_at', { ascending: false });
    setBooks(data || []);
  };

  const showRandomQuote = () => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[idx]);
  };

  const genres = [...new Set(books.map(b => b.genre).filter(Boolean))];
  const filteredBooks = books.filter(b => {
    return (genreFilter === 'all' || b.genre === genreFilter) &&
           (!search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <>
      <div className="hero-strip">
        <div className="hero-eyebrow">Moiz's Personal Collection</div>
        <h1 className="hero-title">Shelf of Moiz</h1>
        <p className="hero-sub">Browse the collection and read books directly in your browser — no downloads needed.</p>
        <div className="search-wrap">
          <input type="text" placeholder="Search by title, author or genre…" value={search} onChange={e => setSearch(e.target.value)} />
          <button>Search</button>
        </div>
        <div className="quote-block">
          <div className="quote-icon">"</div>
          <div className="quote-text">{quote.text}</div>
          <div className="quote-author">— {quote.author}</div>
          <button className="quote-refresh" onClick={showRandomQuote} title="New quote">↻</button>
        </div>
      </div>

      <div className="main">
        <div className="filter-bar">
          <span className="filter-label">Filter:</span>
          <button className={`chip ${genreFilter === 'all' ? 'active' : ''}`} onClick={() => setGenreFilter('all')}>All</button>
          {genres.map(g => (
            <button key={g} className={`chip ${genreFilter === g ? 'active' : ''}`} onClick={() => setGenreFilter(g)}>{g}</button>
          ))}
        </div>
        
        <div className="section-row">
          <h2 className="section-heading">Library Collection</h2>
          <span className="count-tag">{filteredBooks.length} books</span>
        </div>
        
        <div className="books-grid">
          {filteredBooks.length === 0 && (
            <div className="empty">
              <div className="ei">📚</div>
              <div className="et">Nothing found</div>
              <div className="es">Try a different search or filter.</div>
            </div>
          )}
          {filteredBooks.map((b, i) => {
            const bm = getBookmark(b.id);
            return (
              <div key={b.id} className="book-card" onClick={() => navigate(`/read/${b.id}`)} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="cover-wrap">
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} loading="lazy" />
                  ) : (
                    <div className="cover-ph"><div className="icon">📖</div><div className="pt">{b.title}</div><div className="pa">{b.author}</div></div>
                  )}
                  {i === 0 && <span className="new-badge">New</span>}
                  {bm?.manualPage ? (
                    <span className="bm-badge" title={`Bookmark: page ${bm.manualPage}`}>🔖 p.{bm.manualPage}</span>
                  ) : bm?.lastPage ? (
                    <span className="bm-badge" style={{ background: '#6b8caf' }} title={`Last read: page ${bm.lastPage}`}>📖 p.{bm.lastPage}</span>
                  ) : null}
                </div>
                <div className="card-body">
                  <div className="card-title">{b.title}</div>
                  <div className="card-author">{b.author}</div>
                  {b.genre && <span className="card-genre">{b.genre}</span>}
                  <div className="card-read-hint">{bm?.lastPage ? '▶ Continue Reading' : '▶ Read Now'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
