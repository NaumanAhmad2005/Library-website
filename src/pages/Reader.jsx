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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div className="reader-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>←</button>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <div className="reader-head-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book?.title}</div>
            <div className="reader-head-author" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--muted)' }}>{book?.author}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--muted)' }}>Reading</span>
          <div className="desktop-only" style={{ display: 'flex', gap: '4px' }}>
            <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>A-</button>
            <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>A+</button>
          </div>
        </div>
      </div>
      
      {/* Amber Progress Bar */}
      <div style={{ width: '100%', height: '2px', background: 'var(--border)' }}>
        <div style={{ width: '35%', height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }}></div>
      </div>

      {/* Reader Area */}
      <div className="desktop-reader" style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: '800px', height: '100%', background: 'var(--elevated)', boxShadow: 'var(--shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <iframe 
            src={book?.pdf_url} 
            width="100%" 
            height="100%" 
            style={{ border: 'none', display: 'block', background: 'transparent' }}
            title={book?.title}
          />
        </div>
      </div>

      {/* Mobile Fallback */}
      <div className="mobile-reader" style={{ flex: 1, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--bg)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem', fontSize: '1.5rem', lineHeight: '1.3', color: 'var(--text)' }}>{book?.title}</h2>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>By {book?.author}</p>
        
        <a 
          href={book?.pdf_url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            background: 'var(--accent)',
            color: '#0f0b07',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            width: '100%',
            maxWidth: '300px',
            border: 'none',
            transition: 'var(--transition)'
          }}
        >
          Open Book in Browser
        </a>
        <p style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '1.5rem', lineHeight: '1.5', fontFamily: 'Inter, sans-serif' }}>
          Mobile browsers prevent PDFs from loading smoothly inside websites. Tap the button to open it in your device's native high-quality PDF reader.
        </p>
      </div>

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
