import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!book) return;
    const originalTitle = document.title;
    document.title = `${book.title} – Shelf of Moiz`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute('content', `Read ${book.title} online on Shelf of Moiz, a personal library website.`);
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', originalDesc);
    };
  }, [book]);

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
      if (error) throw error;
      setBook(data);
      setLoading(false);
    } catch(err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding:'4rem',textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{padding:'4rem',textAlign:'center',color:'red'}}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: 'var(--bg2)' }}>
      <div className="reader-head">
        <button className="modal-x" style={{position:'relative',top:'auto',right:'auto'}} onClick={() => navigate(-1)}>✕</button>
        <div className="reader-head-info">
          <div className="reader-head-title">{book?.title}</div>
          <div className="reader-head-author">{book?.author}</div>
        </div>
        <div className="reader-head-actions desktop-only">
          <a href={book?.pdf_url} target="_blank" rel="noopener noreferrer" className="icon-btn">
            ↗️ <span>Open Fullscreen</span>
          </a>
        </div>
      </div>
      
      {/* Desktop: Iframe (Native Viewer) */}
      <div className="desktop-reader" style={{ flex: 1, overflow: 'hidden', backgroundColor: '#525659' }}>
        <iframe 
          src={book?.pdf_url} 
          width="100%" 
          height="100%" 
          style={{ border: 'none', display: 'block' }}
          title={book?.title}
        />
      </div>

      {/* Mobile: Big Button (Opens native viewer) */}
      <div className="mobile-reader" style={{ flex: 1, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
        <h2 style={{ fontFamily: 'Lora, serif', marginBottom: '0.5rem', fontSize: '1.5rem', lineHeight: '1.3' }}>{book?.title}</h2>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem' }}>By {book?.author}</p>
        
        <a 
          href={book?.pdf_url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            background: 'var(--accent)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '1.1rem',
            width: '100%',
            maxWidth: '300px'
          }}
        >
          Open Book in Browser
        </a>
        <p style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--text3)', marginTop: '1.5rem', lineHeight: '1.5' }}>
          Mobile browsers prevent PDFs from loading smoothly inside websites. Tap the button to open it in your device's native high-quality PDF reader.
        </p>
      </div>

      {/* CSS injected here to avoid editing index.css again */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-reader { display: none !important; }
          .mobile-reader { display: flex !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
