import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('added_at', { ascending: false });
    setBooks(data || []);
    setLoading(false);
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?\nThis will permanently remove the book for all users.`)) return;

    try {
      const { error } = await supabase.from('books').delete().eq('id', book.id);
      if (error) throw error;

      await supabase.storage.from('books').remove([`${book.id}/book.pdf`]).catch(() => {});
      if (book.cover_url) {
        const ext = book.cover_url.split('/').pop().split('?')[0].split('.').pop() || 'jpg';
        await supabase.storage.from('books').remove([`${book.id}/cover.${ext}`]).catch(() => {});
      }
      
      setBooks(books.filter(b => b.id !== book.id));
      alert('✓ Book deleted from library');
    } catch(err) {
      alert('Delete failed: ' + err.message);
    }
  };

  if (loading) return <div>Loading books...</div>;

  if (books.length === 0) {
    return <p style={{ textAlign: 'center', color: 'var(--text3)', padding: '3rem 0', fontSize: '0.85rem' }}>No books in the library yet.</p>;
  }

  return (
    <div className="mgmt-list">
      {books.map(b => (
        <div key={b.id} className="mgmt-item">
          {b.cover_url ? (
            <img className="mgmt-thumb" src={b.cover_url} alt="" loading="lazy" />
          ) : (
            <div className="mgmt-ph">📖</div>
          )}
          <div className="mgmt-info">
            <div className="mgmt-title" title={b.title}>{b.title}</div>
            <div className="mgmt-meta">{b.author} · {b.genre}</div>
          </div>
          <button className="del-btn" onClick={() => handleDelete(b)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
