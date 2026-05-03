export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

export function getVisitorId() {
  let id = getCookie('libra_vid');
  if (!id) {
    id = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    setCookie('libra_vid', id, 365);
  }
  return id;
}

export function loadBookmarks() {
  const raw = getCookie('libra_bm_' + getVisitorId());
  try { return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; }
}

export function saveBookmarks(bm) {
  setCookie('libra_bm_' + getVisitorId(), JSON.stringify(bm), 365);
}

export function getBookmark(bookId) {
  return loadBookmarks()[bookId] || null;
}
