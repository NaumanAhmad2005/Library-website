import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function AddBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [desc, setDesc] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleUpload = async () => {
    setError('');
    setSuccess('');
    
    if (!title || !author || !genre) {
      setError('Please fill Title, Author and Genre.');
      return;
    }
    if (!pdfFile) {
      setError('Please select a PDF file.');
      return;
    }
    
    setUploading(true);
    setProgress(5);
    setStatusText('Uploading PDF...');

    try {
      const id = 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);

      const { error: pdfErr } = await supabase.storage.from('books').upload(`${id}/book.pdf`, pdfFile, { contentType: 'application/pdf', upsert: false });
      if (pdfErr) throw pdfErr;
      
      setProgress(75);
      setStatusText('PDF uploaded...');
      const { data: pdfData } = supabase.storage.from('books').getPublicUrl(`${id}/book.pdf`);
      const pdfUrl = pdfData.publicUrl;

      let coverUrl = null;
      if (coverFile) {
        setProgress(80);
        setStatusText('Uploading cover...');
        const ext = coverFile.name.split('.').pop().toLowerCase() || 'jpg';
        const { error: covErr } = await supabase.storage.from('books').upload(`${id}/cover.${ext}`, coverFile, { contentType: coverFile.type, upsert: false });
        if (!covErr) {
          const { data: covData } = supabase.storage.from('books').getPublicUrl(`${id}/cover.${ext}`);
          coverUrl = covData.publicUrl;
        }
      }

      setProgress(92);
      setStatusText('Saving to database...');

      const { error: dbErr } = await supabase.from('books').insert({
        id, title, author, genre,
        description: desc,
        pdf_url: pdfUrl,
        cover_url: coverUrl,
        added_at: new Date().toISOString()
      });
      if (dbErr) throw dbErr;

      setProgress(100);
      setStatusText('Done!');
      setSuccess('✓ Book added — visible to all users now!');
      
      // Reset form
      setTitle(''); setAuthor(''); setGenre(''); setDesc('');
      setPdfFile(null); setCoverFile(null);
      
    } catch(err) {
      setError('Upload failed: ' + (err.message || JSON.stringify(err)));
      console.error(err);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 2500);
    }
  };

  return (
    <div>
      <div className="field-row">
        <div className="field"><label>Title *</label><input type="text" placeholder="Book title" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div className="field"><label>Author *</label><input type="text" placeholder="Author name" value={author} onChange={e => setAuthor(e.target.value)} /></div>
      </div>
      <div className="field">
        <label>Genre *</label>
        <select value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">Choose genre…</option>
          <option>Fiction</option><option>Non-Fiction</option><option>Science</option>
          <option>History</option><option>Philosophy</option><option>Poetry</option>
          <option>Mystery</option><option>Biography</option><option>Religion</option>
          <option>Technology</option><option>Children</option><option>Other</option>
        </select>
      </div>
      <div className="field"><label>Description</label><textarea placeholder="Short description…" value={desc} onChange={e => setDesc(e.target.value)}></textarea></div>
      <div className="field-row">
        <div className="field">
          <label>Cover Image (optional)</label>
          <div className="upload-zone">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/*" onChange={e => setCoverFile(e.target.files[0])} />
            <div className="upload-zone-icon">🖼️</div>
            <div className="upload-zone-text">Tap to choose cover image</div>
            <div className="upload-zone-file">{coverFile ? coverFile.name : ''}</div>
          </div>
        </div>
        <div className="field">
          <label>PDF File *</label>
          <div className="upload-zone">
            <input type="file" accept=".pdf,application/pdf" onChange={e => setPdfFile(e.target.files[0])} />
            <div className="upload-zone-icon">📄</div>
            <div className="upload-zone-text">Tap to choose PDF from storage</div>
            <div className="upload-zone-file">{pdfFile ? pdfFile.name : ''}</div>
          </div>
        </div>
      </div>
      {error && <div className="err-msg" style={{display: 'block'}}>{error}</div>}
      {success && <div className="ok-msg" style={{display: 'block'}}>{success}</div>}
      
      {uploading && (
        <div id="upload-progress-wrap" style={{marginTop: '0.75rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
            <span style={{fontSize: '0.78rem', color: 'var(--text2)'}}>{statusText}</span>
            <span style={{fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600}}>{progress}%</span>
          </div>
          <div style={{width: '100%', height: '6px', background: 'var(--border2)', borderRadius: '3px', overflow: 'hidden'}}>
            <div style={{height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.2s', borderRadius: '3px'}}></div>
          </div>
        </div>
      )}
      <button className="btn-full" disabled={uploading} onClick={handleUpload}>
        {uploading ? 'Uploading…' : 'Add to Library'}
      </button>
    </div>
  );
}
