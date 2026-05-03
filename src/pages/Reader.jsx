import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { getBookmark, saveBookmarks, loadBookmarks } from '../utils/helpers';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [zoomScale, setZoomScale] = useState(1.3);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
      if (error) throw error;
      setBook(data);
      const bm = getBookmark(id);
      if (bm?.manualPage) setIsBookmarked(true);
      loadPdf(data.pdf_url);
    } catch(err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadPdf = async (url) => {
    try {
      const resp = await fetch(url);
      const buffer = await resp.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({data: new Uint8Array(buffer)}).promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setLoading(false);
      renderAllPages(doc, 1.3);
    } catch(err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderAllPages = async (doc, scale) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    
    for (let i = 1; i <= doc.numPages; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'page-wrap';
      wrap.dataset.page = i;
      wrap.style.cssText = 'position:relative;display:flex;flex-direction:column;align-items:center;margin-bottom:16px;';
      
      const lbl = document.createElement('div');
      lbl.className = 'page-num-lbl';
      lbl.textContent = `— ${i} —`;
      
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas';
      canvas.style.cssText = 'display:block;box-shadow:0 4px 24px rgba(0,0,0,0.4);border-radius:2px;max-width:100%;background:#fff;';
      
      wrap.appendChild(canvas);
      wrap.appendChild(lbl);
      containerRef.current.appendChild(wrap);
      
      // Basic rendering without lazy load for simplicity in this React conversion
      // In a production app, use react-pdf or lazy loading hook
      try {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch(e) {
        console.error('Render error:', e);
      }
    }
  };

  const handleZoom = (delta) => {
    const newZoom = Math.max(0.4, Math.min(5, +(zoomScale + delta).toFixed(2)));
    setZoomScale(newZoom);
    if (pdfDoc) renderAllPages(pdfDoc, newZoom);
  };

  const toggleBookmark = () => {
    const bm = loadBookmarks();
    const entry = bm[id] || {};
    if (entry.manualPage) {
      delete entry.manualPage;
      setIsBookmarked(false);
      alert('Bookmark removed');
    } else {
      entry.manualPage = currentPage;
      entry.savedAt = Date.now();
      setIsBookmarked(true);
      alert(`Bookmark set at page ${currentPage}`);
    }
    bm[id] = entry;
    saveBookmarks(bm);
  };

  const downloadPdf = async () => {
    if (!book?.pdf_url) return;
    const a = document.createElement('a');
    a.href = book.pdf_url;
    a.download = `${book.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div style={{padding:'4rem',textAlign:'center'}}>Loading PDF...</div>;
  if (error) return <div style={{padding:'4rem',textAlign:'center',color:'red'}}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      <div className="reader-head">
        <button className="modal-x" style={{position:'relative',top:'auto',right:'auto'}} onClick={() => navigate(-1)}>✕</button>
        <div className="reader-head-info">
          <div className="reader-head-title">{book?.title}</div>
          <div className="reader-head-author">{book?.author}</div>
        </div>
        <div className="reader-head-actions">
          <button className={`icon-btn ${isBookmarked ? 'bookmarked' : ''}`} onClick={toggleBookmark}>
            🔖 <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
          <button className="icon-btn dl-btn" onClick={downloadPdf}>
            ⬇️ <span>Download</span>
          </button>
        </div>
      </div>
      
      <div className="reader-body" style={{ background: '#3a3d40', flex: 1, overflow: 'auto', padding: '2rem' }}>
        <div id="pages-container" ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}></div>
      </div>
      
      <div className="reader-foot">
        <span className="page-info">Page {currentPage} / {numPages}</span>
        <div className="sep"></div>
        <button className="zoom-btn" onClick={() => handleZoom(-0.15)}>−</button>
        <span className="zoom-pct">{Math.round(zoomScale * 100)}%</span>
        <button className="zoom-btn" onClick={() => handleZoom(+0.15)}>+</button>
      </div>
    </div>
  );
}
