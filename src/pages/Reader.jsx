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
  const [progressPct, setProgressPct] = useState(0);

  const containerRef = useRef(null);
  const areaRef = useRef(null);
  const trackRef = useRef(null);
  const observerRef = useRef(null);
  const scrollObserverRef = useRef(null);

  // Pinch-to-zoom refs
  const pinchRef = useRef({ pinching: false, startDist: 0, startZoom: 1, liveScale: 1 });

  useEffect(() => {
    fetchBook();
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (scrollObserverRef.current) scrollObserverRef.current.disconnect();
    };
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
      setLoading(true);
      const resp = await fetch(url);
      const buffer = await resp.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({data: new Uint8Array(buffer)}).promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setLoading(false);
      
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const availWidth = areaRef.current ? areaRef.current.clientWidth : window.innerWidth;
      
      let initialScale = availWidth / viewport.width;
      initialScale = Math.max(0.4, Math.min(5, +initialScale.toFixed(2)));
      setZoomScale(initialScale);
      
      // Delay to let DOM elements mount
      setTimeout(() => {
        renderAllPages(doc, initialScale);
        setupScrollTracking();
      }, 50);
    } catch(err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderSingleCanvas = async (canvas, pageNum, doc, scale) => {
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch(e) {
      if (e.name !== 'RenderingCancelledException') console.error(e);
    }
  };

  const lazyRenderSetup = (doc, scale) => {
    if (observerRef.current) observerRef.current.disconnect();
    const canvases = containerRef.current.querySelectorAll('.page-canvas');
    
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target._rendered) {
          entry.target._rendered = true;
          renderSingleCanvas(entry.target, entry.target._pageNum, doc, scale);
        }
      });
    }, { root: areaRef.current, rootMargin: '200px 0px', threshold: 0.01 });

    canvases.forEach(c => observerRef.current.observe(c));
  };

  const renderAllPages = (doc, scale) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    
    for (let i = 1; i <= doc.numPages; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'page-wrap';
      wrap.dataset.page = i;
      
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas';
      canvas._pageNum = i;
      canvas._rendered = false;
      
      wrap.appendChild(canvas);
      containerRef.current.appendChild(wrap);
    }
    
    lazyRenderSetup(doc, scale);
  };

  const setupScrollTracking = () => {
    if (scrollObserverRef.current) scrollObserverRef.current.disconnect();
    const wraps = containerRef.current.querySelectorAll('.page-wrap');
    
    scrollObserverRef.current = new IntersectionObserver((entries) => {
      let topmost = null, topmostY = Infinity;
      entries.forEach(e => {
        if (e.isIntersecting) {
          const rect = e.boundingClientRect;
          if (rect.top < topmostY) { topmostY = rect.top; topmost = e.target; }
        }
      });
      if (topmost) {
        const pg = parseInt(topmost.dataset.page, 10);
        setCurrentPage(pg);
        
        // Auto-save last read page logic (like original)
        const bm = loadBookmarks();
        const entry = bm[id] || {};
        entry.lastPage = pg;
        bm[id] = entry;
        saveBookmarks(bm);
      }
    }, { root: areaRef.current, threshold: 0.3 });

    wraps.forEach(w => scrollObserverRef.current.observe(w));
  };

  const handleScroll = () => {
    if (!areaRef.current) return;
    const area = areaRef.current;
    const max = area.scrollHeight - area.clientHeight;
    const pct = max > 0 ? area.scrollTop / max : 0;
    setProgressPct(pct);
  };

  const getDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current.pinching = true;
      pinchRef.current.startDist = getDist(e.touches);
      pinchRef.current.startZoom = zoomScale;
      pinchRef.current.liveScale = 1;
    }
  };

  const handleTouchMove = (e) => {
    if (!pinchRef.current.pinching || e.touches.length < 2) return;
    const dist = getDist(e.touches);
    const ratio = dist / pinchRef.current.startDist;
    const newZ = Math.max(0.4, Math.min(5, pinchRef.current.startZoom * ratio));
    
    pinchRef.current.liveScale = newZ / pinchRef.current.startZoom;
    if (containerRef.current) {
      containerRef.current.style.transformOrigin = 'top center';
      containerRef.current.style.transform = `scale(${pinchRef.current.liveScale})`;
    }
    setZoomScale(+newZ.toFixed(2));
  };

  const handleTouchEnd = (e) => {
    if (!pinchRef.current.pinching) return;
    if (e.touches.length < 2) {
      pinchRef.current.pinching = false;
      if (containerRef.current) containerRef.current.style.transform = '';
      if (pdfDoc) renderAllPages(pdfDoc, zoomScale);
    }
  };

  const changeZoom = (delta) => {
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

  const downloadBook = async () => {
    if (!book?.pdf_url) return;
    const a = document.createElement('a');
    a.href = book.pdf_url;
    a.download = `${book.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGaugeClick = (e) => {
    if (!pdfDoc || !trackRef.current || !areaRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const maxS = areaRef.current.scrollHeight - areaRef.current.clientHeight;
    areaRef.current.scrollTo({ top: Math.round(pct * maxS), behavior: 'smooth' });
  };

  if (loading) return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:'1rem'}}>
      <div className="spin" style={{borderTopColor: 'var(--accent)'}}></div>
      <div style={{color:'var(--text)'}}>Loading PDF...</div>
    </div>
  );
  if (error) return <div style={{padding:'4rem',textAlign:'center',color:'var(--red)'}}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: 'var(--bg2)' }}>
      <div className="reader-head" style={{flexShrink: 0}}>
        <button className="modal-x" style={{position:'relative',top:'auto',right:'auto'}} onClick={() => navigate(-1)}>✕</button>
        <div className="reader-head-info">
          <div className="reader-head-title">{book?.title}</div>
          <div className="reader-head-author">{book?.author}</div>
        </div>
        <div className="reader-head-actions">
          <button className={`icon-btn ${isBookmarked ? 'bookmarked' : ''}`} onClick={toggleBookmark}>
            🔖 <span>{isBookmarked ? `p.${currentPage} ✓` : 'Bookmark'}</span>
          </button>
          <button className="icon-btn dl-btn" onClick={downloadBook}>
            ⬇️ <span>Download</span>
          </button>
        </div>
      </div>
      
      <div className="read-progress-bar-wrap">
        <div className="read-progress-bar-fill" style={{ width: `${progressPct * 100}%` }}></div>
      </div>

      <div className="reader-body" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        <div className="scroll-gauge" title="Reading progress">
          <div className="gauge-track" ref={trackRef} onClick={handleGaugeClick}>
            <div className="gauge-thumb" style={{ top: `${progressPct * Math.max(0, (trackRef.current?.clientHeight || 200) - 28)}px` }}></div>
          </div>
          <div className="gauge-label">Progress</div>
        </div>

        <div 
          className="canvas-area" 
          id="canvas-area"
          ref={areaRef} 
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div id="pages-container" ref={containerRef}></div>
        </div>

      </div>

      <div className="reader-foot" style={{flexShrink: 0}}>
        <span className="page-info">Page {currentPage} / {numPages}</span>
        <div className="sep"></div>
        <button className="zoom-btn" onClick={() => changeZoom(-0.15)}>−</button>
        <span className="zoom-pct">{Math.round(zoomScale * 100)}%</span>
        <button className="zoom-btn" onClick={() => changeZoom(+0.15)}>+</button>
      </div>
    </div>
  );
}
