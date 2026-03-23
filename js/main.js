/* =====================================================================
   SAJID AHMED — PORTFOLIO JS
   ===================================================================== */

'use strict';

/* -----------------------------------------------------------------------
   CONFIG — Update your Medium username to enable live article loading
   ----------------------------------------------------------------------- */
const CONFIG = {
    githubUsername: 'sajid-ahmed1',
    // Set your Medium username (e.g. '@sajid-ahmed') to load live articles
    // Leave empty to use the static placeholder articles below
    mediumUsername: '@sajid.ahmed',
};

/* -----------------------------------------------------------------------
   STATIC ARTICLE FALLBACK
   Replace / extend these with your actual Medium article data
   ----------------------------------------------------------------------- */
const STATIC_ARTICLES = [
    {
        title: 'Predicting Diabetes Risk with Machine Learning: A Cambridge Perspective',
        description: 'Applying logistic regression and ensemble methods to the Pima Indians Diabetes Dataset, with insights from Cambridge D100 Fundamentals of Data Science.',
        link: 'https://medium.com/',
        date: 'Jan 2025',
        readTime: '7 min read',
    },
    {
        title: 'Building Your First LLM Agent with LangChain: A Practical Guide',
        description: 'A step-by-step walkthrough of creating a custom LLM agent using LangChain — covering tools, memory, and chain-of-thought prompting.',
        link: 'https://medium.com/',
        date: 'Feb 2025',
        readTime: '9 min read',
    },
    {
        title: 'What Drives Airbnb Prices? Lessons from the Boston Dataset',
        description: 'Exploratory data analysis and regression modelling to uncover the features that most influence listing prices in Boston's Airbnb market.',
        link: 'https://medium.com/',
        date: 'Mar 2025',
        readTime: '6 min read',
    },
];

/* -----------------------------------------------------------------------
   CANVAS — PARTICLE NETWORK
   ----------------------------------------------------------------------- */
function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles;
    const PARTICLE_COUNT = 60;
    const MAX_DIST = 140;
    const COLORS = ['#6366f1', '#818cf8', '#06b6d4', '#22d3ee'];

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function randomParticle() {
        return {
            x:   Math.random() * W,
            y:   Math.random() * H,
            vx:  (Math.random() - 0.5) * 0.4,
            vy:  (Math.random() - 0.5) * 0.4,
            r:   Math.random() * 1.8 + 0.8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, randomParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update positions
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.35;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init);
}

/* -----------------------------------------------------------------------
   TYPING ANIMATION
   ----------------------------------------------------------------------- */
function initTyping() {
    const el = document.getElementById('typed-text');
    if (!el) return;

    const phrases = [
        'Data Scientist',
        'Gen AI Engineer',
        'Cambridge Researcher',
        'Insight Analyst @ Vodafone',
        'LLM Builder',
    ];

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let paused    = false;

    function tick() {
        const phrase = phrases[phraseIdx];

        if (paused) return;

        if (!deleting) {
            el.textContent = phrase.slice(0, charIdx + 1);
            charIdx++;
            if (charIdx === phrase.length) {
                paused = true;
                setTimeout(() => { deleting = true; paused = false; tick(); }, 2000);
                return;
            }
            setTimeout(tick, 70);
        } else {
            el.textContent = phrase.slice(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                setTimeout(tick, 400);
                return;
            }
            setTimeout(tick, 40);
        }
    }

    tick();
}

/* -----------------------------------------------------------------------
   NAVBAR — scroll behaviour & active link
   ----------------------------------------------------------------------- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const links  = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function onScroll() {
        // Shrink navbar
        navbar.classList.toggle('scrolled', window.scrollY > 20);

        // Active link highlight
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* -----------------------------------------------------------------------
   MOBILE MENU
   ----------------------------------------------------------------------- */
function initMobileMenu() {
    const btn   = document.getElementById('hamburger');
    const links = document.getElementById('nav-links');

    btn.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
    });

    // Close when a link is clicked
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            btn.classList.remove('open');
        });
    });
}

/* -----------------------------------------------------------------------
   SCROLL REVEAL
   ----------------------------------------------------------------------- */
function initReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger delay for grid children
                    const delay = (entry.target.dataset.delay || 0);
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el, i) => {
        // Stagger siblings in same parent
        const siblings = el.parentElement.querySelectorAll('.reveal');
        const idx = Array.from(siblings).indexOf(el);
        el.dataset.delay = idx * 80;
        observer.observe(el);
    });
}

/* -----------------------------------------------------------------------
   ARTICLES — load from Medium RSS or fall back to static
   ----------------------------------------------------------------------- */
async function loadArticles() {
    const grid = document.getElementById('articles-grid');
    const profileLink = document.getElementById('medium-profile-link');
    const contactLink = document.getElementById('medium-contact-link');
    if (!grid) return;

    let articles = STATIC_ARTICLES;

    if (CONFIG.mediumUsername) {
        const rssUrl = `https://medium.com/feed/${CONFIG.mediumUsername}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=6`;

        try {
            const resp = await fetch(apiUrl);
            const data = await resp.json();
            if (data.status === 'ok' && data.items?.length) {
                const mediumBase = `https://medium.com/${CONFIG.mediumUsername}`;
                if (profileLink) profileLink.href = mediumBase;
                if (contactLink) contactLink.href = mediumBase;

                articles = data.items.slice(0, 6).map(item => ({
                    title:       item.title,
                    description: item.description?.replace(/<[^>]+>/g, '').slice(0, 160) + '…',
                    link:        item.link,
                    date:        new Date(item.pubDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
                    readTime:    estimateReadTime(item.description || ''),
                }));
            }
        } catch (_) { /* use static fallback */ }
    }

    grid.innerHTML = articles.map((a, i) => `
        <div class="article-card reveal" style="animation-delay:${i * 0.1}s">
            <div class="article-meta">
                <i class="fab fa-medium"></i>
                <span>${a.date}</span>
                <span>·</span>
                <span>${a.readTime}</span>
            </div>
            <h3>${escapeHtml(a.title)}</h3>
            <p>${escapeHtml(a.description)}</p>
            <a href="${a.link}" target="_blank" rel="noopener" class="article-link">
                Read article <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `).join('');

    // Trigger reveal for newly added cards
    document.querySelectorAll('#articles-grid .reveal').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
    });
}

function estimateReadTime(html) {
    const words = html.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const mins  = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
}

function escapeHtml(str = '') {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* -----------------------------------------------------------------------
   SMOOTH SCROLL for anchor links
   ----------------------------------------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* -----------------------------------------------------------------------
   INIT
   ----------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initTyping();
    initNavbar();
    initMobileMenu();
    initReveal();
    initSmoothScroll();
    loadArticles();
});
