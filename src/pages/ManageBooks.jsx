import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', genre: '', description: '' });

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

  const handleEditClick = (book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      description: book.description || ''
    });
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: editForm.title,
          author: editForm.author,
          genre: editForm.genre,
          description: editForm.description
        })
        .eq('id', editingBook.id);

      if (error) throw error;

      setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...editForm } : b));
      setEditingBook(null);
      alert('✓ Book updated successfully');
    } catch (err) {
      alert('Update failed: ' + err.message);
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleEditClick(b)}>Edit</button>
            <button className="del-btn" onClick={() => handleDelete(b)}>Delete</button>
          </div>
        </div>
      ))}

      {editingBook && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999 }} onClick={() => setEditingBook(null)}></div>
          <div className="modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, maxWidth: '400px', width: '90%', margin: 0 }}>
            <button className="modal-x" onClick={() => setEditingBook(null)}>✕</button>
            <h3 style={{ marginTop: 0, marginBottom: '1.2rem', fontSize: '1.2rem' }}>Edit Book Details</h3>
            
            <div className="field">
              <label>Title</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
            </div>
            
            <div className="field">
              <label>Author</label>
              <input type="text" value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} />
            </div>

            <div className="field">
              <label>Genre</label>
              <select value={editForm.genre} onChange={e => setEditForm({...editForm, genre: e.target.value})}>
                <option value="">Choose genre…</option>
                <option>Fiction</option><option>Non-Fiction</option><option>Science</option>
                <option>History</option><option>Philosophy</option><option>Poetry</option>
                <option>Mystery</option><option>Biography</option><option>Religion</option>
                <option>Technology</option><option>Children</option><option>Law</option><option>Other</option>
              </select>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
            </div>

            <button className="btn-full" style={{ marginTop: '1rem' }} onClick={handleUpdate}>Save Changes</button>
          </div>
        </>
      )}
    </div>
  );
}
