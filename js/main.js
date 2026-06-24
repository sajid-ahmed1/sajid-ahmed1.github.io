/* =====================================================================
   SAJID AHMED — SECOND BRAIN
   A no-build, client-side wiki. Notes are markdown files in /notes,
   indexed by /notes/index.json. This script loads the manifest, routes
   on the URL hash, and renders markdown in the browser.
   ===================================================================== */

'use strict';

const MANIFEST_URL = 'notes/index.json';

/* App state — populated once from the manifest, then read by the router. */
const state = {
    site: null,
    categories: [],
    notes: [],
    bySlug: new Map(),
    byCategory: new Map(),
    tags: new Map(), // tag -> count
};

/* -----------------------------------------------------------------------
   BOOT
   ----------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    configureMarked();
    initMobileMenu();
    initSearch();

    try {
        await loadManifest();
    } catch (err) {
        renderError('Could not load the notes index.', err);
        return;
    }

    window.addEventListener('hashchange', router);
    router();

    // The "totally legitimate" system alert :)
    setTimeout(initFakeVirus, 1500);
});

/* -----------------------------------------------------------------------
   MANIFEST
   ----------------------------------------------------------------------- */
async function loadManifest() {
    const resp = await fetch(MANIFEST_URL, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    state.site = data.site || {};
    state.categories = data.categories || [];
    state.notes = (data.notes || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    state.byCategory = new Map(state.categories.map(c => [c.id, []]));
    for (const note of state.notes) {
        state.bySlug.set(note.slug, note);
        if (!state.byCategory.has(note.category)) state.byCategory.set(note.category, []);
        state.byCategory.get(note.category).push(note);
        for (const tag of note.tags || []) {
            state.tags.set(tag, (state.tags.get(tag) || 0) + 1);
        }
    }
}

/* -----------------------------------------------------------------------
   ROUTER  —  #/                 home / curiosity map
                #/<category>       category listing (work | study | personal)
                #/note/<slug>      a single rendered note
                #/tag/<tag>        notes filtered by a tag
   ----------------------------------------------------------------------- */
function router() {
    const hash = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);
    setActiveNav(parts[0] || 'home');
    window.scrollTo(0, 0);

    if (parts.length === 0) return renderHome();
    if (parts[0] === 'note') return renderNote(parts[1]);
    if (parts[0] === 'tag') return renderTag(decodeURIComponent(parts[1] || ''));
    if (state.byCategory.has(parts[0])) return renderCategory(parts[0]);

    renderError('Page not found.', new Error(location.hash));
}

function setActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.route === route);
    });
}

/* -----------------------------------------------------------------------
   VIEW: HOME / CURIOSITY MAP
   ----------------------------------------------------------------------- */
function renderHome() {
    const s = state.site;
    const links = s.links || {};
    const recent = state.notes.slice(0, 6);

    const app = document.getElementById('app');
    app.innerHTML = `
        <header class="hero">
            <div class="hero-inner container">
                <img class="hero-avatar" src="${attr(s.avatar)}" alt="${attr(s.name)}">
                <h1>${esc(s.name)}<span class="gradient-text">.</span></h1>
                <p class="hero-tagline">${esc(s.tagline)}</p>
                <div class="hero-links">
                    ${links.github ? socialLink(links.github, 'fab fa-github', 'GitHub') : ''}
                    ${links.linkedin ? socialLink(links.linkedin, 'fab fa-linkedin', 'LinkedIn') : ''}
                    ${links.medium ? socialLink(links.medium, 'fab fa-medium', 'Medium') : ''}
                </div>
            </div>
        </header>

        <section class="section container">
            <h2 class="section-title">The <span class="gradient-text">Curiosity Map</span></h2>
            <p class="section-subtitle">Three places my attention goes. Pick a thread.</p>
            <div class="category-tiles">
                ${state.categories.map(categoryTile).join('')}
            </div>
        </section>

        <section class="section container">
            <h2 class="section-title">Tag <span class="gradient-text">cloud</span></h2>
            <p class="section-subtitle">Sized by how often a topic shows up.</p>
            <div class="tag-cloud">${tagCloud()}</div>
        </section>

        <section class="section container">
            <h2 class="section-title">Recently <span class="gradient-text">written</span></h2>
            <div class="note-grid">
                ${recent.map(noteCard).join('') || emptyMsg('No notes yet.')}
            </div>
        </section>
    `;
}

function categoryTile(cat) {
    const count = (state.byCategory.get(cat.id) || []).length;
    return `
        <a class="category-tile" href="#/${esc(cat.id)}">
            <div class="tile-icon">${esc(cat.icon || '📓')}</div>
            <h3>${esc(cat.label)}</h3>
            <p>${esc(cat.blurb || '')}</p>
            <span class="tile-count">${count} note${count === 1 ? '' : 's'}</span>
        </a>`;
}

function tagCloud() {
    const tags = [...state.tags.entries()].sort((a, b) => b[1] - a[1]);
    if (!tags.length) return emptyMsg('No tags yet.');
    const max = tags[0][1];
    return tags.map(([tag, count]) => {
        const size = 0.85 + (count / max) * 0.9; // rem scale
        return `<a class="tag-chip" style="font-size:${size.toFixed(2)}rem" href="#/tag/${encodeURIComponent(tag)}">#${esc(tag)}</a>`;
    }).join('');
}

/* -----------------------------------------------------------------------
   VIEW: CATEGORY
   ----------------------------------------------------------------------- */
function renderCategory(catId) {
    const cat = state.categories.find(c => c.id === catId) || { label: catId, icon: '📓', blurb: '' };
    const notes = state.byCategory.get(catId) || [];
    const app = document.getElementById('app');
    app.innerHTML = `
        <section class="section container view-pad">
            <div class="page-head">
                <div class="page-head-icon">${esc(cat.icon || '📓')}</div>
                <div>
                    <h1 class="section-title left">${esc(cat.label)}</h1>
                    <p class="section-subtitle left">${esc(cat.blurb || '')}</p>
                </div>
            </div>
            <div class="note-grid">
                ${notes.map(noteCard).join('') || emptyMsg('Nothing here yet — check back soon.')}
            </div>
        </section>`;
}

/* -----------------------------------------------------------------------
   VIEW: TAG
   ----------------------------------------------------------------------- */
function renderTag(tag) {
    const notes = state.notes.filter(n => (n.tags || []).includes(tag));
    const app = document.getElementById('app');
    app.innerHTML = `
        <section class="section container view-pad">
            <a class="back-link" href="#/"><i class="fas fa-arrow-left"></i> Home</a>
            <h1 class="section-title left">#${esc(tag)}</h1>
            <p class="section-subtitle left">${notes.length} note${notes.length === 1 ? '' : 's'} tagged.</p>
            <div class="note-grid">
                ${notes.map(noteCard).join('') || emptyMsg('No notes with this tag.')}
            </div>
        </section>`;
}

/* -----------------------------------------------------------------------
   VIEW: SINGLE NOTE
   ----------------------------------------------------------------------- */
async function renderNote(slug) {
    const note = state.bySlug.get(slug);
    const app = document.getElementById('app');
    if (!note) return renderError('Note not found.', new Error(slug));

    app.innerHTML = `<div class="loading"><span class="spinner"></span> Loading note…</div>`;

    let md;
    try {
        const resp = await fetch(note.file, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        md = await resp.text();
    } catch (err) {
        return renderError('Could not load this note.', err);
    }

    const cat = state.categories.find(c => c.id === note.category);
    const html = DOMPurify.sanitize(marked.parse(resolveWikiLinks(md)));

    app.innerHTML = `
        <article class="section container note view-pad">
            <a class="back-link" href="#/${esc(note.category)}">
                <i class="fas fa-arrow-left"></i> ${esc(cat ? cat.label : note.category)}
            </a>
            <div class="note-meta">
                <span><i class="far fa-calendar"></i> ${esc(formatDate(note.date))}</span>
                ${(note.tags || []).map(t => `<a class="tag-chip sm" href="#/tag/${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}
            </div>
            <div class="markdown-body">${html}</div>
        </article>`;

    app.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
}

/* -----------------------------------------------------------------------
   SEARCH (client-side over the manifest)
   ----------------------------------------------------------------------- */
function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;
    let panel = document.getElementById('search-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'search-panel';
        panel.className = 'search-panel';
        document.querySelector('.nav-search').appendChild(panel);
    }

    const close = () => { panel.classList.remove('open'); panel.innerHTML = ''; };

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) return close();
        const hits = state.notes.filter(n => {
            const hay = `${n.title} ${n.summary} ${(n.tags || []).join(' ')} ${n.category}`.toLowerCase();
            return hay.includes(q);
        }).slice(0, 8);

        panel.innerHTML = hits.length
            ? hits.map(n => `
                <a class="search-hit" href="#/note/${esc(n.slug)}">
                    <strong>${esc(n.title)}</strong>
                    <span>${esc(n.category)} · ${esc(n.summary || '')}</span>
                </a>`).join('')
            : `<div class="search-empty">No matches for "${esc(input.value)}"</div>`;
        panel.classList.add('open');
    });

    panel.addEventListener('click', e => { if (e.target.closest('a')) { input.value = ''; close(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.nav-search')) close(); });
}

/* -----------------------------------------------------------------------
   MOBILE MENU
   ----------------------------------------------------------------------- */
function initMobileMenu() {
    const btn = document.getElementById('hamburger');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => { links.classList.remove('open'); btn.classList.remove('open'); }));
}

/* -----------------------------------------------------------------------
   FAKE "VIRUS" POPUP — a tongue-in-cheek Win98 alert plugging Medium.
   Closing it spawns another at a random spot (classic gag), capped so it
   never becomes genuinely annoying.
   ----------------------------------------------------------------------- */
const MAX_POPUPS = 4;
let popupCount = 0;

function initFakeVirus() {
    const popup = state.site && state.site.popup;
    if (!popup || !popup.topic) return;
    spawnPopup(popup);
}

function spawnPopup(popup) {
    popupCount++;
    const link = attr(popup.link || (state.site.links && state.site.links.medium) || '#');

    const el = document.createElement('div');
    el.className = 'win98-popup';
    // Random-ish position so multiples scatter across the screen.
    const x = popupCount === 1 ? 50 : Math.random() * 60 + 5;   // vw
    const y = popupCount === 1 ? 50 : Math.random() * 50 + 10;  // vh
    el.style.left = popupCount === 1 ? '50%' : `${x}vw`;
    el.style.top = popupCount === 1 ? '38%' : `${y}vh`;
    if (popupCount === 1) el.style.transform = 'translate(-50%, -50%)';

    el.innerHTML = `
        <div class="win98-titlebar">
            <span><i class="fas fa-triangle-exclamation"></i> System Alert</span>
            <button class="win98-x" aria-label="Close">✕</button>
        </div>
        <div class="win98-body">
            <div class="win98-icon">⚠️</div>
            <div class="win98-text">
                <p><strong>WARNING:</strong> Your curiosity may be at risk!</p>
                <p>Check my latest Medium post on <strong>${esc(popup.topic)}</strong>.</p>
            </div>
        </div>
        <div class="win98-actions">
            <a class="win98-btn win98-primary" href="${link}" target="_blank" rel="noopener">Read it!</a>
            <button class="win98-btn win98-close">Close</button>
        </div>`;

    document.body.appendChild(el);

    const remove = (spawnNext) => {
        el.remove();
        if (spawnNext && popupCount < MAX_POPUPS) spawnPopup(popup);
    };
    el.querySelector('.win98-x').addEventListener('click', () => remove(true));
    el.querySelector('.win98-close').addEventListener('click', () => remove(true));
    el.querySelector('.win98-primary').addEventListener('click', () => remove(false));
}

/* -----------------------------------------------------------------------
   RENDER HELPERS
   ----------------------------------------------------------------------- */
function noteCard(n) {
    const cat = state.categories.find(c => c.id === n.category);
    return `
        <a class="note-card" href="#/note/${esc(n.slug)}">
            <div class="note-card-cat">${esc(cat ? cat.icon : '📓')} ${esc(cat ? cat.label : n.category)}</div>
            <h3>${esc(n.title)}</h3>
            <p>${esc(n.summary || '')}</p>
            <div class="note-card-foot">
                <span class="note-date">${esc(formatDate(n.date))}</span>
                <div class="note-card-tags">${(n.tags || []).slice(0, 3).map(t => `<span class="tag-chip sm">#${esc(t)}</span>`).join('')}</div>
            </div>
        </a>`;
}

function socialLink(href, icon, label) {
    return `<a class="hero-link" href="${attr(href)}" target="_blank" rel="noopener"><i class="${icon}"></i> ${esc(label)}</a>`;
}

function renderError(msg, err) {
    console.error(msg, err);
    document.getElementById('app').innerHTML = `
        <section class="section container view-pad">
            <div class="error-box">
                <h1>🤔 ${esc(msg)}</h1>
                <p>If you're opening the file directly, run a local server instead — <code>fetch</code> needs HTTP:</p>
                <pre><code>python3 -m http.server 8000</code></pre>
                <a class="back-link" href="#/"><i class="fas fa-arrow-left"></i> Back home</a>
            </div>
        </section>`;
}

function emptyMsg(text) { return `<p class="empty-msg">${esc(text)}</p>`; }

/* Turn [[slug]] into links to the matching note (falls back to plain text). */
function resolveWikiLinks(md) {
    return md.replace(/\[\[([^\]]+)\]\]/g, (m, slug) => {
        const key = slug.trim();
        const note = state.bySlug.get(key);
        return note ? `[${note.title}](#/note/${key})` : `**${key}**`;
    });
}

function configureMarked() {
    if (window.marked) marked.setOptions({ breaks: false, gfm: true });
}

function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/* For href/src attributes — block javascript: and other risky schemes. */
function attr(url = '') {
    const s = String(url).trim();
    return /^(https?:|mailto:|\/|#|data:image\/)/i.test(s) ? esc(s) : '#';
}
