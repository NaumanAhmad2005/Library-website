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

  if (loading) return <div style={{padding:'4rem',textAlign:'center'}}>Loading PDF...</div>;
  if (error) return <div style={{padding:'4rem',textAlign:'center',color:'var(--red)'}}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      <div className="reader-head">
        <button className="modal-x" style={{position:'relative',top:'auto',right:'auto',flexShrink:0}} onClick={() => navigate(-1)}>✕</button>
        <div className="reader-head-info">
          <div className="reader-head-title">{book?.title}</div>
          <div className="reader-head-author">{book?.author}</div>
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#525659' }}>
        <iframe 
          src={book?.pdf_url} 
          width="100%" 
          height="100%" 
          style={{ border: 'none', display: 'block' }}
          title={book?.title}
        />
      </div>
    </div>
  );
}
