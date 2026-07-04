/* =====================================================================
   SAJID AHMED — SECOND BRAIN 98
   A no-build, client-side wiki dressed as a Windows 98 desktop.
   Notes are markdown in /notes, indexed by /notes/index.json. Categories
   and notes open as draggable windows; a taskbar + Start menu drive it.
   ===================================================================== */

'use strict';

const MANIFEST_URL = 'notes/index.json';

/* App state — loaded once from the manifest. */
const state = {
    site: null,
    categories: [],
    notes: [],
    wiki: [],
    outputs: [],
    projects: [],
    bySlug: new Map(),
    byCategory: new Map(),
    tags: new Map(), // tag -> count
};

/* Window manager state. */
const openWindows = new Map(); // id -> { el, taskBtn }
let zCounter = 10;

/* -----------------------------------------------------------------------
   BOOT
   ----------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
    configureMarked();
    startClock();
    initStartButton();
    initLinkRouting();

    try {
        await loadManifest();
    } catch (err) {
        openWindow('error', { title: 'Error', icon: '⚠️', body: errorBody('Could not load the notes index.') });
        console.error(err);
        return;
    }

    buildDesktopIcons();
    buildStartMenu();
    buildWidgets();
    openAbout();                          // friendly welcome window
    setTimeout(initFakeVirus, 1800);      // the "totally legitimate" alert :)
});

/* Touch devices report a "coarse" pointer — open on a single tap there. */
const COARSE = window.matchMedia('(pointer: coarse)').matches;

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
    state.wiki = (data.wiki || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    state.outputs = (data.outputs || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    state.projects = (data.projects || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    state.byCategory = new Map(state.categories.map(c => [c.id, []]));
    for (const note of state.notes) {
        state.bySlug.set(note.slug, note);
        if (!state.byCategory.has(note.category)) state.byCategory.set(note.category, []);
        state.byCategory.get(note.category).push(note);
        for (const tag of note.tags || []) state.tags.set(tag, (state.tags.get(tag) || 0) + 1);
    }
    for (const item of [...state.wiki, ...state.outputs, ...state.projects]) {
        state.bySlug.set(item.slug, item);
        for (const tag of item.tags || []) state.tags.set(tag, (state.tags.get(tag) || 0) + 1);
    }
}

/* -----------------------------------------------------------------------
   DESKTOP ICONS
   ----------------------------------------------------------------------- */
function buildDesktopIcons() {
    const icons = [
        { id: 'about',    icon: '👤', label: 'About Me',    action: openAbout },
        { id: 'notes',    icon: '🗂️', label: 'My Notes',    action: openExplorer },
        ...state.categories.map(c => ({
            id: 'cat-' + c.id, icon: c.icon || '📁', label: c.label, action: () => openCategoryWindow(c.id),
        })),
        { id: 'wiki',     icon: '📎', label: 'Wiki',        action: openWikiWindow },
        { id: 'outputs',  icon: '📊', label: 'Outputs',     action: openOutputsWindow },
        { id: 'projects', icon: '📋', label: 'Projects',    action: openProjectsWindow },
        { id: 'graph',    icon: '🕸️', label: 'Brain Map',   action: openKnowledgeGraph },
        { id: 'recycle',  icon: '🗑️', label: 'Recycle Bin', action: openRecycleBin },
    ];

    const host = document.getElementById('desktop-icons');
    host.innerHTML = '';
    icons.forEach(def => {
        const el = document.createElement('button');
        el.className = 'desktop-icon';
        el.innerHTML = `<span class="di-glyph">${def.icon}</span><span class="di-label">${esc(def.label)}</span>`;
        if (COARSE) {
            // touch: a single tap opens
            el.addEventListener('click', def.action);
        } else {
            // desktop: single-click selects, double-click opens (authentic Win98)
            el.addEventListener('click', () => {
                host.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
            });
            el.addEventListener('dblclick', def.action);
        }
        host.appendChild(el);
    });
}

/* -----------------------------------------------------------------------
   DESKTOP WIDGETS — draggable Win98 photo frames (data-driven, decorative).
   Swap the images by editing the files in /images or `site.widgets`.
   ----------------------------------------------------------------------- */
function buildWidgets() {
    const widgets = (state.site && state.site.widgets) || [];
    const host = document.getElementById('desktop');
    const spots = [['67%', '13%'], ['80%', '45%'], ['58%', '64%']]; // scattered, right side

    widgets.forEach((w, i) => {
        if (!w.src) return;
        const el = document.createElement('div');
        el.className = 'desktop-widget';
        const pos = spots[i] || [(Math.random() * 55 + 30) + '%', (Math.random() * 60 + 10) + '%'];
        el.style.left = w.x || pos[0];
        el.style.top = w.y || pos[1];
        el.innerHTML = `
            <div class="widget-frame"><img src="${attr(w.src)}" alt="${attr(w.caption || '')}" draggable="false"></div>
            ${w.caption ? `<div class="widget-caption">${esc(w.caption)}</div>` : ''}`;
        host.appendChild(el);
        makeDraggable(el, el);
    });
}

/* -----------------------------------------------------------------------
   START MENU
   ----------------------------------------------------------------------- */
function initStartButton() {
    const btn = document.getElementById('start-btn');
    const menu = document.getElementById('start-menu');
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = menu.classList.toggle('hidden');
        btn.classList.toggle('pressed', !open);
    });
    document.addEventListener('click', e => {
        if (!menu.classList.contains('hidden') && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
            menu.classList.add('hidden');
            btn.classList.remove('pressed');
        }
    });
}

function buildStartMenu() {
    const items = [
        { icon: '👤', label: 'About Me', action: openAbout },
        { icon: '🗂️', label: 'My Notes', action: openExplorer },
        { sep: true },
        ...state.categories.map(c => ({ icon: c.icon || '📁', label: c.label, action: () => openCategoryWindow(c.id) })),
        { sep: true },
        { icon: '📎', label: 'Wiki', action: openWikiWindow },
        { icon: '📊', label: 'Outputs', action: openOutputsWindow },
        { icon: '📋', label: 'Projects', action: openProjectsWindow },
        { icon: '🕸️', label: 'Brain Map', action: openKnowledgeGraph },
        { icon: '🔍', label: 'Find Notes…', action: () => { openExplorer(); const i = document.getElementById('explorer-search'); if (i) i.focus(); } },
        { icon: '⏻', label: 'Shut Down…', action: openShutDown },
    ];

    const list = document.getElementById('start-list');
    list.innerHTML = '';
    items.forEach(it => {
        const li = document.createElement('li');
        if (it.sep) { li.className = 'start-sep'; list.appendChild(li); return; }
        li.className = 'start-item';
        li.innerHTML = `<span class="si-glyph">${it.icon}</span> ${esc(it.label)}`;
        li.addEventListener('click', () => {
            document.getElementById('start-menu').classList.add('hidden');
            document.getElementById('start-btn').classList.remove('pressed');
            it.action();
        });
        list.appendChild(li);
    });
}

/* -----------------------------------------------------------------------
   IN-CONTENT LINK ROUTING  (#/note/x, #/<cat>, #/tag/x — incl. wiki-links)
   ----------------------------------------------------------------------- */
function initLinkRouting() {
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#/"]');
        if (!a) return;
        e.preventDefault();
        const parts = a.getAttribute('href').replace(/^#\/?/, '').split('/').filter(Boolean);
        if (!parts.length) return openAbout();
        if (parts[0] === 'note') return openNoteWindow(parts[1]);
        if (parts[0] === 'wiki') return parts[1] ? openNoteWindow(parts[1]) : openWikiWindow();
        if (parts[0] === 'output') return parts[1] ? openNoteWindow(parts[1]) : openOutputsWindow();
        if (parts[0] === 'project') {
            if (!parts[1]) return openProjectsWindow();
            const proj = state.projects.find(p => p.slug === parts[1]);
            if (proj && proj.epics) return openProjectDetailWindow(proj);
            if (proj && proj.file) return openNoteWindow(parts[1]);
            return openProjectsWindow();
        }
        if (parts[0] === 'tag') return openTagWindow(decodeURIComponent(parts[1] || ''));
        if (state.byCategory.has(parts[0])) return openCategoryWindow(parts[0]);
    });
}

/* =======================================================================
   WINDOW MANAGER
   ======================================================================= */
function openWindow(id, { title, icon, body, width }) {
    if (openWindows.has(id)) return focusWindow(id);

    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = ++zCounter;
    if (width) win.style.width = width;
    const n = openWindows.size;
    win.style.left = Math.min(60 + n * 26, window.innerWidth - 320) + 'px';
    win.style.top = Math.min(40 + n * 26, window.innerHeight - 260) + 'px';

    win.innerHTML = `
        <div class="title-bar">
            <span class="title-bar-text">${icon || ''} ${esc(title)}</span>
            <div class="title-bar-controls">
                <button class="tb-btn tb-min" aria-label="Minimize">_</button>
                <button class="tb-btn tb-close" aria-label="Close">✕</button>
            </div>
        </div>
        <div class="window-body">${body}</div>`;
    document.getElementById('windows').appendChild(win);

    const taskBtn = document.createElement('button');
    taskBtn.className = 'task-btn';
    taskBtn.innerHTML = `${icon || ''} ${esc(title)}`;
    taskBtn.addEventListener('click', () => toggleWindow(id));
    document.getElementById('task-buttons').appendChild(taskBtn);

    openWindows.set(id, { el: win, taskBtn });

    win.addEventListener('mousedown', () => focusWindow(id));
    win.querySelector('.tb-close').addEventListener('click', e => { e.stopPropagation(); closeWindow(id); });
    win.querySelector('.tb-min').addEventListener('click', e => { e.stopPropagation(); minimizeWindow(id); });
    makeDraggable(win, win.querySelector('.title-bar'));

    win.querySelectorAll('pre code').forEach(b => { try { hljs.highlightElement(b); } catch (_) {} });
    focusWindow(id);
    return win;
}

function focusWindow(id) {
    const rec = openWindows.get(id);
    if (!rec) return;
    rec.el.style.display = 'flex';
    rec.el.style.zIndex = ++zCounter;
    rec.el.classList.remove('minimized');
    for (const [, r] of openWindows) {
        r.el.classList.toggle('inactive', r !== rec);
        r.taskBtn.classList.toggle('active', r === rec);
    }
}

function minimizeWindow(id) {
    const rec = openWindows.get(id);
    if (!rec) return;
    rec.el.style.display = 'none';
    rec.taskBtn.classList.remove('active');
}

function toggleWindow(id) {
    const rec = openWindows.get(id);
    if (!rec) return;
    const hidden = rec.el.style.display === 'none';
    const focused = rec.taskBtn.classList.contains('active');
    if (hidden || !focused) focusWindow(id); else minimizeWindow(id);
}

function closeWindow(id) {
    const rec = openWindows.get(id);
    if (!rec) return;
    rec.el.remove();
    rec.taskBtn.remove();
    openWindows.delete(id);
}

/* Pointer Events → works for both mouse and touch. */
function makeDraggable(el, handle) {
    let sx, sy, ox, oy, dragging = false, pid = null;
    handle.addEventListener('pointerdown', e => {
        if (e.target.closest('.title-bar-controls')) return;
        dragging = true; pid = e.pointerId;
        sx = e.clientX; sy = e.clientY;
        ox = el.offsetLeft; oy = el.offsetTop;
        el.style.transform = 'none';      // drop any centering transform once moved
        try { handle.setPointerCapture(pid); } catch (_) {}
        document.body.style.userSelect = 'none';
    });
    handle.addEventListener('pointermove', e => {
        if (!dragging) return;
        const nx = Math.max(0, Math.min(ox + e.clientX - sx, window.innerWidth - 60));
        const ny = Math.max(0, Math.min(oy + e.clientY - sy, window.innerHeight - 50));
        el.style.left = nx + 'px';
        el.style.top = ny + 'px';
    });
    const end = () => {
        if (!dragging) return;
        dragging = false;
        document.body.style.userSelect = '';
        try { handle.releasePointerCapture(pid); } catch (_) {}
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
}

/* =======================================================================
   WINDOW CONTENTS
   ======================================================================= */
function openAbout() {
    const s = state.site, links = s.links || {};
    const cv = s.cv || '';
    const body = `
        <div class="about-pane">
            <img class="about-avatar" src="${attr(s.avatar)}" alt="${attr(s.name)}">
            <h2>${esc(s.name)}</h2>
            <p class="about-tagline">${esc(s.tagline)}</p>
            <div class="hero-links">
                ${links.github ? socialLink(links.github, 'fab fa-github', 'GitHub') : ''}
                ${links.linkedin ? socialLink(links.linkedin, 'fab fa-linkedin', 'LinkedIn') : ''}
                ${links.medium ? socialLink(links.medium, 'fab fa-medium', 'Medium') : ''}
                ${cv ? socialLink(cv, 'fas fa-file-pdf', 'My CV') : ''}
            </div>
            <p class="about-hint">Tip: double-click the desktop icons, or hit <strong>Start</strong>.</p>
        </div>`;
    openWindow('about', { title: 'About Me', icon: '👤', body, width: '440px' });
}

function openExplorer() {
    const body = `
        <div class="explorer">
            <div class="explorer-bar">
                <span>🔍</span>
                <input type="search" id="explorer-search" placeholder="Filter notes by title, tag, or topic…">
            </div>
            <div class="explorer-tags">${tagCloud()}</div>
            <div class="note-grid" id="explorer-grid">${state.notes.map(noteCard).join('') || emptyMsg('No notes yet.')}</div>
        </div>`;
    openWindow('notes', { title: 'My Notes', icon: '🗂️', body, width: '760px' });

    const input = document.getElementById('explorer-search');
    const grid = document.getElementById('explorer-grid');
    if (input && grid) {
        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            const hits = !q ? state.notes : state.notes.filter(n =>
                `${n.title} ${n.summary} ${(n.tags || []).join(' ')} ${n.category}`.toLowerCase().includes(q));
            grid.innerHTML = hits.map(noteCard).join('') || emptyMsg('No matching notes.');
        });
    }
}

function openCategoryWindow(catId) {
    const cat = state.categories.find(c => c.id === catId) || { label: catId, icon: '📁', blurb: '' };
    const notes = state.byCategory.get(catId) || [];
    const body = `
        <div class="page-head">
            <div class="page-head-icon">${esc(cat.icon || '📁')}</div>
            <div>
                <h2>${esc(cat.label)}</h2>
                <p class="muted">${esc(cat.blurb || '')}</p>
            </div>
        </div>
        <div class="note-grid">${notes.map(noteCard).join('') || emptyMsg('Nothing here yet — check back soon.')}</div>`;
    openWindow('cat-' + catId, { title: cat.label, icon: cat.icon || '📁', body, width: '720px' });
}

function openTagWindow(tag) {
    const notes = state.notes.filter(n => (n.tags || []).includes(tag));
    const body = `
        <h2 class="tag-head">#${esc(tag)}</h2>
        <p class="muted">${notes.length} note${notes.length === 1 ? '' : 's'} tagged.</p>
        <div class="note-grid">${notes.map(noteCard).join('') || emptyMsg('No notes with this tag.')}</div>`;
    openWindow('tag-' + tag, { title: '#' + tag, icon: '🏷️', body, width: '700px' });
}

async function openNoteWindow(slug) {
    const note = state.bySlug.get(slug);
    if (!note) return openWindow('note-missing', { title: 'Not found', icon: '⚠️', body: errorBody('Note not found.') });
    const id = 'note-' + slug;
    if (openWindows.has(id)) return focusWindow(id);

    let md;
    try {
        const resp = await fetch(note.file, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        md = await resp.text();
    } catch (err) {
        console.error(err);
        return openWindow(id, { title: note.title, icon: '📄', body: errorBody('Could not load this note.') });
    }

    const cat = state.categories.find(c => c.id === note.category);
    const html = DOMPurify.sanitize(marked.parse(resolveWikiLinks(md)));
    const body = `
        <div class="note-meta">
            <span><i class="far fa-calendar"></i> ${esc(formatDate(note.date))}</span>
            <span class="muted">in ${esc(cat ? cat.label : note.category)}</span>
            ${(note.tags || []).map(t => `<a class="tag-chip sm" href="#/tag/${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}
        </div>
        <div class="markdown-body">${html}</div>`;
    openWindow(id, { title: note.title, icon: '📄', body, width: '640px' });
}

function openWikiWindow() {
    const items = state.wiki;
    const body = `
        <div class="page-head">
            <div class="page-head-icon">📎</div>
            <div>
                <h2>Wiki</h2>
                <p class="muted">Links, tools, and resources I've saved. Dumped here, cleaned up by AI, and linked to my notes via tags.</p>
            </div>
        </div>
        <div class="note-grid">${items.map(n => wikiCard(n)).join('') || emptyMsg('Nothing here yet — dump me a link and I\'ll file it.')}</div>`;
    openWindow('wiki', { title: 'Wiki', icon: '📎', body, width: '720px' });
}

function openOutputsWindow() {
    const items = state.outputs;
    const body = `
        <div class="page-head">
            <div class="page-head-icon">📊</div>
            <div>
                <h2>Outputs</h2>
                <p class="muted">Synthesised briefs, comparisons, and analysis that pull from multiple sources. The hard thinking.</p>
            </div>
        </div>
        <div class="note-grid">${items.map(n => outputCard(n)).join('') || emptyMsg('No outputs yet — ask me a hard question and I\'ll research it.')}</div>`;
    openWindow('outputs', { title: 'Outputs', icon: '📊', body, width: '720px' });
}

const PROJECT_COLUMNS = [
    { id: 'backlog',     label: 'Backlog',     icon: '🗒️' },
    { id: 'in-progress', label: 'In Progress', icon: '🚧' },
    { id: 'done',        label: 'Done',        icon: '✅' },
];

function openProjectsWindow() {
    const body = `
        <div class="page-head">
            <div class="page-head-icon">📋</div>
            <div>
                <h2>Projects</h2>
                <p class="muted">What I'm building, right now. Moves left to right as it progresses.</p>
            </div>
        </div>
        <div class="kanban-board">${PROJECT_COLUMNS.map(col => {
            const items = state.projects.filter(p => p.status === col.id);
            return `
                <div class="kanban-col">
                    <div class="kanban-col-head">${esc(col.icon)} ${esc(col.label)} <span class="kanban-count">${items.length}</span></div>
                    <div class="kanban-col-body">${items.map(projectCard).join('') || emptyMsg('Nothing here yet.')}</div>
                </div>`;
        }).join('')}</div>`;
    openWindow('projects', { title: 'Projects', icon: '📋', body, width: '780px' });
}

function projectCard(p) {
    const doneCount = (p.epics || []).reduce((n, e) => n + (e.stories || []).filter(s => s.status === 'done').length, 0);
    const totalCount = (p.epics || []).reduce((n, e) => n + (e.stories || []).length, 0);
    const progress = totalCount ? `<span class="kanban-prog">${doneCount}/${totalCount} done</span>` : '';
    const inner = `
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary || '')}</p>
        <div class="note-card-foot">
            <span class="note-date">${esc(formatDate(p.date))}</span>
            <div class="note-card-tags">${(p.tags || []).slice(0, 3).map(t => `<span class="tag-chip sm">#${esc(t)}</span>`).join('')}${progress}</div>
        </div>`;
    const href = p.epics ? `#/project/${esc(p.slug)}` : (p.file ? `#/note/${esc(p.slug)}` : null);
    return href
        ? `<a class="note-card kanban-card" href="${href}">${inner}</a>`
        : `<div class="note-card kanban-card">${inner}</div>`;
}

const STORY_STATUS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const STORY_CLS    = { todo: 'story-todo', 'in-progress': 'story-inprogress', done: 'story-done' };
const PROJ_STATUS  = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

function openProjectDetailWindow(p) {
    const epicsHtml = (p.epics || []).map(epic => {
        const total = (epic.stories || []).length;
        const done  = (epic.stories || []).filter(s => s.status === 'done').length;
        const stories = (epic.stories || []).map(s => `
            <div class="story-row">
                <span class="story-id">${esc(s.id)}</span>
                <span class="story-title">${esc(s.title)}</span>
                <span class="story-status ${STORY_CLS[s.status] || ''}">${STORY_STATUS[s.status] || esc(s.status)}</span>
            </div>`).join('');
        return `
            <div class="epic-block">
                <div class="epic-head">
                    <span class="epic-label">Epic</span>
                    <span class="epic-title">${esc(epic.title)}</span>
                    <span class="epic-prog">${done}/${total}</span>
                </div>
                ${epic.notes ? `<p class="epic-notes">${esc(epic.notes)}</p>` : ''}
                <div class="story-list">${stories}</div>
            </div>`;
    }).join('');

    const statusCls = (p.status || '').replace('-', '-');
    const body = `
        <div class="proj-detail-head">
            <div style="flex:1">
                <h2 style="margin:0 0 4px">${esc(p.title)}</h2>
                <p class="muted">${esc(p.summary || '')}</p>
            </div>
            <span class="proj-status-badge status-${esc(p.status || '')}">${PROJ_STATUS[p.status] || esc(p.status)}</span>
        </div>
        <div class="note-card-tags" style="margin-bottom:14px">${(p.tags || []).map(t => `<span class="tag-chip sm">#${esc(t)}</span>`).join('')}</div>
        <div class="epic-list">${epicsHtml || emptyMsg('No epics yet.')}</div>`;

    openWindow('proj-' + p.slug, { title: p.title, icon: '📋', body, width: '700px' });
}

function openRecycleBin() {
    openWindow('recycle', {
        title: 'Recycle Bin', icon: '🗑️', width: '380px',
        body: `<div class="about-pane">
            <div style="font-size:3rem">🗑️</div>
            <p>The Recycle Bin is empty.</p>
            <p class="muted">Everything I write here is public &amp; curated — nothing to hide, nothing to delete.</p>
        </div>`,
    });
}

/* -----------------------------------------------------------------------
   KNOWLEDGE GRAPH — interactive vis-network rendering data/graph.json
   ----------------------------------------------------------------------- */
const GRAPH_COLORS = {
    navigation:     { bg: '#000080', border: '#000060', font: '#ffffff' },
    work:           { bg: '#c0c000', border: '#808000', font: '#000000' },
    study:          { bg: '#008000', border: '#006000', font: '#ffffff' },
    personal:       { bg: '#800080', border: '#600060', font: '#ffffff' },
    'tech-interests': { bg: '#c06000', border: '#804000', font: '#ffffff' },
    wiki:           { bg: '#1565c0', border: '#0d47a1', font: '#ffffff' },
    output:         { bg: '#c62828', border: '#b71c1c', font: '#ffffff' },
};
const GRAPH_DEFAULT_COLOR = { bg: '#808080', border: '#404040', font: '#ffffff' };

async function openKnowledgeGraph() {
    const id = 'knowledge-graph';
    if (openWindows.has(id)) return focusWindow(id);

    const body = `
        <div class="graph-toolbar">
            <span class="graph-legend">
                <span class="gl-dot" style="background:#000080"></span> Index
                <span class="gl-dot" style="background:#c0c000"></span> Work
                <span class="gl-dot" style="background:#008000"></span> Study
                <span class="gl-dot" style="background:#800080"></span> Personal
                <span class="gl-dot" style="background:#c06000"></span> Tech
                <span class="gl-dot" style="background:#1565c0"></span> Wiki
                <span class="gl-dot" style="background:#c62828"></span> Output
            </span>
        </div>
        <div id="graph-container" class="sunken" style="height:420px;background:#000;cursor:grab;"></div>
        <div class="graph-hint muted">Click a node to open that note. Drag to pan, scroll to zoom.</div>
        <div class="graph-edge-legend">
            <span><span class="edge-line solid"></span> Direct reference</span>
            <span><span class="edge-line dashed"></span> Shared topic</span>
        </div>`;
    const win = openWindow(id, { title: 'Brain Map', icon: '🕸️', body, width: '720px' });

    let graphData;
    try {
        const resp = await fetch('data/graph.json', { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        graphData = await resp.json();
    } catch (err) {
        console.error(err);
        const c = win.querySelector('#graph-container');
        if (c) c.innerHTML = '<p style="color:#ccc;padding:2rem;text-align:center">Could not load graph data.</p>';
        return;
    }

    const nodes = (graphData.nodes || []).map(n => {
        const c = GRAPH_COLORS[n.group] || GRAPH_DEFAULT_COLOR;
        return {
            id: n.id,
            label: n.label,
            color: { background: c.bg, border: c.border, highlight: { background: c.bg, border: '#ffffff' } },
            font: { color: c.font, size: n.id === 'index' ? 16 : 13, face: 'Tahoma, sans-serif' },
            size: n.id === 'index' ? 28 : 20,
            shape: n.id === 'index' ? 'diamond' : 'dot',
            borderWidth: 2,
        };
    });

    const edges = (graphData.links || []).map((l, i) => ({
        id: i,
        from: l.source,
        to: l.target,
        color: { color: '#556666', highlight: '#00ffff' },
        width: l.type === 'wiki-link' ? 2 : 1,
        dashes: l.type === 'thematic',
        arrows: l.type === 'wiki-link' ? { to: { enabled: true, scaleFactor: 0.5 } } : undefined,
    }));

    const container = win.querySelector('#graph-container');
    if (!container) return;

    const network = new vis.Network(container, { nodes, edges }, {
        physics: {
            forceAtlas2Based: { gravitationalConstant: -40, centralGravity: 0.008, springLength: 140 },
            solver: 'forceAtlas2Based',
            stabilization: { iterations: 80 },
        },
        interaction: { hover: true, tooltipDelay: 200, zoomView: true, dragView: true },
    });

    network.on('click', params => {
        if (!params.nodes.length) return;
        const nodeId = params.nodes[0];
        if (nodeId === 'index') return openExplorer();
        if (state.bySlug.has(nodeId)) openNoteWindow(nodeId);
    });

    network.on('hoverNode', () => { container.style.cursor = 'pointer'; });
    network.on('blurNode', () => { container.style.cursor = 'grab'; });
}

function openShutDown() {
    openWindow('shutdown', {
        title: 'Shut Down', icon: '⏻', width: '360px',
        body: `<div class="about-pane">
            <div style="font-size:2.4rem">💾</div>
            <p>It is now safe to close this tab.</p>
            <p class="muted">…but there are more notes to read. Are you sure?</p>
        </div>`,
    });
}

/* =======================================================================
   FAKE "VIRUS" POPUP — tongue-in-cheek Win98 alert plugging Medium.
   Closing it spawns another at a random spot (classic gag), capped.
   ======================================================================= */
const MAX_POPUPS = 1;
let popupCount = 0;

function initFakeVirus() {
    const popup = state.site && state.site.popup;
    if (popup && popup.topic) spawnPopup(popup);
}

function spawnPopup(popup) {
    popupCount++;
    const link = attr(popup.link || (state.site.links && state.site.links.medium) || '#');

    const el = document.createElement('div');
    el.className = 'win98-popup';
    el.style.zIndex = 2000;
    if (popupCount === 1) {
        el.style.left = '50%'; el.style.top = '34%'; el.style.transform = 'translate(-50%, -50%)';
    } else {
        el.style.left = (Math.random() * 60 + 5) + 'vw';
        el.style.top = (Math.random() * 45 + 8) + 'vh';
    }

    el.innerHTML = `
        <div class="title-bar virus">
            <span class="title-bar-text"><i class="fas fa-triangle-exclamation"></i> System Alert</span>
            <button class="tb-btn tb-close" aria-label="Close">✕</button>
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
            <button class="win98-btn win98-dismiss">Close</button>
        </div>`;
    document.body.appendChild(el);

    const remove = () => { el.remove(); };
    el.querySelector('.tb-close').addEventListener('click', remove);
    el.querySelector('.win98-dismiss').addEventListener('click', remove);
    el.querySelector('.win98-primary').addEventListener('click', () => remove(false));
}

/* =======================================================================
   TASKBAR CLOCK
   ======================================================================= */
function startClock() {
    const el = document.getElementById('clock');
    const tick = () => { el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
    tick();
    setInterval(tick, 15000);
}

/* =======================================================================
   RENDER HELPERS
   ======================================================================= */
function noteCard(n) {
    const cat = state.categories.find(c => c.id === n.category);
    return `
        <a class="note-card" href="#/note/${esc(n.slug)}">
            <div class="note-card-cat">${esc(cat ? cat.icon : '📄')} ${esc(cat ? cat.label : n.category)}</div>
            <h3>${esc(n.title)}</h3>
            <p>${esc(n.summary || '')}</p>
            <div class="note-card-foot">
                <span class="note-date">${esc(formatDate(n.date))}</span>
                <div class="note-card-tags">${(n.tags || []).slice(0, 3).map(t => `<span class="tag-chip sm">#${esc(t)}</span>`).join('')}</div>
            </div>
        </a>`;
}

function wikiCard(n) {
    return `
        <a class="note-card wiki-card" href="#/note/${esc(n.slug)}">
            <div class="note-card-head">
                <div class="note-card-cat">📎 Wiki</div>
                <span class="kind-badge saved">🔗 Saved</span>
            </div>
            <h3>${esc(n.title)}</h3>
            <p>${esc(n.summary || '')}</p>
            <div class="note-card-foot">
                <span class="note-date">${esc(formatDate(n.date))}</span>
                <div class="note-card-tags">${(n.tags || []).slice(0, 3).map(t => `<span class="tag-chip sm">#${esc(t)}</span>`).join('')}</div>
            </div>
        </a>`;
}

function outputCard(n) {
    return `
        <a class="note-card output-card" href="#/note/${esc(n.slug)}">
            <div class="note-card-head">
                <div class="note-card-cat">📊 Output</div>
                <span class="kind-badge output">🧠 Synthesis</span>
            </div>
            <h3>${esc(n.title)}</h3>
            <p>${esc(n.summary || '')}</p>
            <div class="note-card-foot">
                <span class="note-date">${esc(formatDate(n.date))}</span>
                <div class="note-card-tags">${(n.tags || []).slice(0, 3).map(t => `<span class="tag-chip sm">#${esc(t)}</span>`).join('')}</div>
            </div>
        </a>`;
}

function tagCloud() {
    const tags = [...state.tags.entries()].sort((a, b) => b[1] - a[1]);
    if (!tags.length) return '';
    const max = tags[0][1];
    return tags.map(([tag, count]) => {
        const size = 0.8 + (count / max) * 0.6;
        return `<a class="tag-chip" style="font-size:${size.toFixed(2)}rem" href="#/tag/${encodeURIComponent(tag)}">#${esc(tag)}</a>`;
    }).join('');
}

function socialLink(href, icon, label) {
    return `<a class="hero-link" href="${attr(href)}" target="_blank" rel="noopener"><i class="${icon}"></i> ${esc(label)}</a>`;
}

function errorBody(msg) {
    return `<div class="about-pane">
        <div style="font-size:2.2rem">🤔</div>
        <p>${esc(msg)}</p>
        <p class="muted">If you opened the file directly, run a local server — <code>fetch</code> needs HTTP:</p>
        <pre><code>python3 -m http.server 8000</code></pre>
    </div>`;
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

function configureMarked() { if (window.marked) marked.setOptions({ breaks: false, gfm: true }); }

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
