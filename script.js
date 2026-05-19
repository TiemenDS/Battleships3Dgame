/* ═══════════════════════════════════════════════════════════
   ZEESLAG GAME — SHOWCASE SCRIPT
   Bevat: loader · cursor · navbar · canvas · particles
          battle grids · gallery · code editor · accordion
          scroll reveal · smooth scroll · end canvas
═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   HELPER: DOM query shortcuts
────────────────────────────────────────────────────────── */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ══════════════════════════════════════════════════════════
   1. LOADING SCREEN
══════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader  = $('#loader');
  const bar     = $('.loader-bar');
  const pct     = $('.loader-pct');
  let progress  = 0;

  // Simulate loading progress
  const interval = setInterval(() => {
    progress += Math.random() * 14 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      bar.style.width = '100%';
      pct.textContent  = '100%';

      setTimeout(() => {
        loader.classList.add('hidden');
        // Trigger hero entrance animations
        $$('.hero-content .reveal-up').forEach(el => el.classList.add('visible'));
      }, 600);
    }
    bar.style.width = progress + '%';
    pct.textContent  = Math.floor(progress) + '%';
  }, 80);
})();

/* ══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════════════════════ */
(function initCursor() {
  const cursor = $('#cursor');
  const trail  = $('#cursor-trail');
  if (!cursor || !trail) return;

  let cx = -100, cy = -100; // start off-screen
  let tx = cx, ty = cy;

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  // Trail follows with slight lag
  function animateTrail() {
    tx += (cx - tx) * 0.14;
    ty += (cy - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Grow cursor on interactive elements
  document.querySelectorAll('a, button, .card, .gal-item, .tech-card, .acc-header').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
})();

/* ══════════════════════════════════════════════════════════
   3. NAVBAR — scroll behaviour + mobile toggle
══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const nav    = $('#navbar');
  const toggle = $('#navToggle');
  const links  = $('.nav-links');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  toggle?.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close menu on link click
  $$('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
})();

/* ══════════════════════════════════════════════════════════
   4. HERO CANVAS — animated ocean / sonar grid
══════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, tick = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Wave lines
  function drawWaves() {
    const waveCount = 6;
    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      const offset = (tick * 0.4 + w * 60) % H;
      ctx.moveTo(0, offset);
      for (let x = 0; x <= W; x += 6) {
        const y = offset + Math.sin((x / W) * Math.PI * 4 + tick * 0.015 + w) * 18;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(0,180,255,${0.03 + w * 0.007})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }

  // Horizontal scan line
  function drawScanLine() {
    const y = ((tick * 0.5) % H);
    const grad = ctx.createLinearGradient(0, y - 20, 0, y + 4);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,212,255,0.07)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 20, W, 24);
  }

  // Radar blips
  const blips = Array.from({ length: 8 }, () => ({
    x: Math.random() * 1,
    y: Math.random() * 1,
    life: Math.random(),
    speed: 0.003 + Math.random() * 0.004,
  }));

  function drawBlips() {
    blips.forEach(b => {
      b.life += b.speed;
      if (b.life > 1) { b.life = 0; b.x = Math.random(); b.y = Math.random(); }
      const alpha = Math.sin(b.life * Math.PI) * 0.6;
      ctx.beginPath();
      ctx.arc(b.x * W, b.y * H, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${alpha})`;
      ctx.fill();
      // Ripple
      ctx.beginPath();
      ctx.arc(b.x * W, b.y * H, 3 + b.life * 18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawWaves();
    drawScanLine();
    drawBlips();
    tick++;
    requestAnimationFrame(render);
  }
  render();
})();

/* ══════════════════════════════════════════════════════════
   5. PARTICLES
══════════════════════════════════════════════════════════ */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;
  const count = 50;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      --dur:  ${6 + Math.random() * 10}s;
      --del: -${Math.random() * 12}s;
      --dx:   ${(Math.random() - 0.5) * 80}px;
      width:  ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
    `;
    container.appendChild(p);
  }
})();

/* ══════════════════════════════════════════════════════════
   6. BATTLE GRIDS (gameplay section)
══════════════════════════════════════════════════════════ */
(function initBattleGrids() {
  const COLS = 8, ROWS = 6;

  // Player grid with ships
  const playerGrid = $('#battleGrid');
  if (!playerGrid) return;

  const ships = [
    [0,0],[0,1],[0,2],         // 3-ship horizontal
    [2,3],[3,3],[4,3],[5,3],   // 4-ship vertical
    [1,5],[2,5],               // 2-ship
  ];
  const shipSet = new Set(ships.map(([r,c]) => `${r},${c}`));

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (shipSet.has(`${r},${c}`) ? ' ship' : '');
      playerGrid.appendChild(cell);
    }
  }

  // Enemy grid with click demo
  const enemyGrid = $('#enemyGrid');
  if (!enemyGrid) return;

  const hitCells  = new Set();
  const missCells = new Set([[1,2],[3,4],[0,5],[4,1]]);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      const key  = `${r},${c}`;
      cell.className = 'cell';
      if (missCells.has(key)) cell.classList.add('miss');
      cell.addEventListener('click', () => {
        if (cell.classList.contains('hit') || cell.classList.contains('miss')) return;
        // ~40% chance of hit for demo
        const isHit = Math.random() < 0.4;
        cell.classList.add(isHit ? 'hit' : 'miss');
      });
      enemyGrid.appendChild(cell);
    }
  }

  // Animated hits on player grid for visual interest
  const playerCells = $$('.cell', playerGrid);
  const animHits = [[0,4],[1,2],[3,1]];
  animHits.forEach(([r,c], i) => {
    const idx = r * COLS + c;
    setTimeout(() => {
      playerCells[idx]?.classList.add('hit');
    }, 2000 + i * 800);
  });
})();

/* ══════════════════════════════════════════════════════════
   7. SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');

  // Exclude hero elements (animated on load)
  const toObserve = els.filter(el => !el.closest('#hero'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  toObserve.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════
   8. TECH CARDS — mouse parallax
══════════════════════════════════════════════════════════ */
(function initTechParallax() {
  const section = $('#tech');
  if (!section) return;

  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
    const my = (e.clientY - rect.top  - rect.height / 2) / rect.height;

    $$('.tech-card', section).forEach((card, i) => {
      const depth = 1 + (i % 3) * 0.5;
      card.style.transform = `translateY(${my * -12 * depth}px) translateX(${mx * 6 * depth}px)`;
    });
  });

  section.addEventListener('mouseleave', () => {
    $$('.tech-card', section).forEach(card => {
      card.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   9. GALLERY
══════════════════════════════════════════════════════════ */
let galIndex = 0;
const GAL_VISIBLE = 3;

function updateGallery() {
  const items = $$('.gal-item');
  const track = $('#galleryTrack');
  if (!track) return;
  // Slide by moving item width
  const itemW = items[0]?.offsetWidth + 20 || 300;
  track.style.transform = `translateX(-${galIndex * itemW}px)`;
  track.style.transition = 'transform 0.5s cubic-bezier(0.25,0.8,0.25,1)';
}

document.addEventListener('DOMContentLoaded', () => {
  const galleryTrack = $('#galleryTrack');
  if (galleryTrack) galleryTrack.style.transition = 'transform 0.5s cubic-bezier(0.25,0.8,0.25,1)';

  $('#galPrev')?.addEventListener('click', () => {
    const items = $$('.gal-item');
    if (galIndex > 0) { galIndex--; updateGallery(); }
  });

  $('#galNext')?.addEventListener('click', () => {
    const items = $$('.gal-item');
    const max   = Math.max(0, items.length - GAL_VISIBLE);
    if (galIndex < max) { galIndex++; updateGallery(); }
  });
});

/* ── MODAL ──────────────────────────────────────────────── */
let modalIdx = 0;
const TOTAL_GAL = 6;

function openModal(idx) {
  modalIdx = idx;
  renderModal();
  $('#modalOverlay')?.classList.add('open');
}

function closeModal() {
  $('#modalOverlay')?.classList.remove('open');
}

function modalNav(dir) {
  modalIdx = (modalIdx + dir + TOTAL_GAL) % TOTAL_GAL;
  renderModal();
}

function renderModal() {
  const content = $('#modalContent');
  const counter = $('#modalCounter');
  if (!content) return;
  content.innerHTML = `<span style="font-size:40px">🖼️</span>
    <p style="color:var(--text-dim);font-size:14px;margin-top:10px">Screenshot ${modalIdx + 1} placeholder</p>`;
  if (counter) counter.textContent = `${modalIdx + 1} / ${TOTAL_GAL}`;
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ══════════════════════════════════════════════════════════
   10. CODE EDITOR — syntax-highlighted snippets + typing
══════════════════════════════════════════════════════════ */
const CODE_SNIPPETS = {
  js: `<span class="cm">// Spellogica — Zeeslag Game</span>
<span class="cm">// Placeholder: vervang met echte code</span>

<span class="kw">class</span> <span class="fn">ZeeslagGame</span> {
  <span class="fn">constructor</span>() {
    <span class="kw">this</span>.<span class="nm">board</span>    = <span class="kw">new</span> <span class="fn">Array</span>(<span class="nb">10</span>).<span class="fn">fill</span>(<span class="kw">null</span>)
                        .<span class="fn">map</span>(() => <span class="kw">new</span> <span class="fn">Array</span>(<span class="nb">10</span>).<span class="fn">fill</span>(<span class="nb">0</span>));
    <span class="kw">this</span>.<span class="nm">ships</span>    = [];
    <span class="kw">this</span>.<span class="nm">turn</span>     = <span class="str">'player'</span>;
    <span class="kw">this</span>.<span class="nm">gameOver</span> = <span class="kw">false</span>;
  }

  <span class="fn">placeShip</span>(<span class="nm">row</span>, <span class="nm">col</span>, <span class="nm">length</span>, <span class="nm">horizontal</span>) {
    <span class="kw">if</span> (!<span class="kw">this</span>.<span class="fn">isValidPlacement</span>(<span class="nm">row</span>, <span class="nm">col</span>, <span class="nm">length</span>, <span class="nm">horizontal</span>)) {
      <span class="kw">return false</span>;
    }
    <span class="kw">const</span> <span class="nm">ship</span> = { <span class="nm">row</span>, <span class="nm">col</span>, <span class="nm">length</span>, <span class="nm">horizontal</span>, <span class="nm">hits</span>: <span class="nb">0</span> };
    <span class="kw">this</span>.<span class="nm">ships</span>.<span class="fn">push</span>(<span class="nm">ship</span>);
    <span class="kw">return true</span>;
  }

  <span class="fn">shoot</span>(<span class="nm">row</span>, <span class="nm">col</span>) {
    <span class="kw">if</span> (<span class="kw">this</span>.<span class="nm">board</span>[<span class="nm">row</span>][<span class="nm">col</span>] !== <span class="nb">0</span>) <span class="kw">return</span> <span class="str">'already_shot'</span>;

    <span class="kw">const</span> <span class="nm">hit</span> = <span class="kw">this</span>.<span class="nm">ships</span>.<span class="fn">some</span>(<span class="nm">s</span> => <span class="kw">this</span>.<span class="fn">hitsShip</span>(<span class="nm">s</span>, <span class="nm">row</span>, <span class="nm">col</span>));
    <span class="kw">this</span>.<span class="nm">board</span>[<span class="nm">row</span>][<span class="nm">col</span>] = <span class="nm">hit</span> ? <span class="str">'hit'</span> : <span class="str">'miss'</span>;

    <span class="fn">animateCell</span>(<span class="nm">row</span>, <span class="nm">col</span>, <span class="nm">hit</span>);

    <span class="kw">if</span> (<span class="kw">this</span>.<span class="fn">checkWin</span>()) {
      <span class="kw">this</span>.<span class="nm">gameOver</span> = <span class="kw">true</span>;
      <span class="fn">showWinScreen</span>(<span class="kw">this</span>.<span class="nm">turn</span>);
    }
    <span class="kw">return</span> <span class="nm">hit</span> ? <span class="str">'hit'</span> : <span class="str">'miss'</span>;
  }

  <span class="fn">checkWin</span>() {
    <span class="kw">return this</span>.<span class="nm">ships</span>.<span class="fn">every</span>(<span class="nm">s</span> => <span class="nm">s</span>.<span class="nm">hits</span> >= <span class="nm">s</span>.<span class="nm">length</span>);
  }
}`,

  html: `<span class="cm">&lt;!-- Zeeslag spelbord — placeholder HTML --&gt;</span>

<span class="kw">&lt;div</span> <span class="nm">id</span>=<span class="str">"game-container"</span><span class="kw">&gt;</span>

  <span class="kw">&lt;header</span> <span class="nm">class</span>=<span class="str">"game-header"</span><span class="kw">&gt;</span>
    <span class="kw">&lt;h1&gt;</span>ZEESLAG GAME<span class="kw">&lt;/h1&gt;</span>
    <span class="kw">&lt;div</span> <span class="nm">class</span>=<span class="str">"turn-indicator"</span><span class="kw">&gt;</span>
      <span class="kw">&lt;span</span> <span class="nm">id</span>=<span class="str">"current-turn"</span><span class="kw">&gt;</span>Jouw beurt<span class="kw">&lt;/span&gt;</span>
    <span class="kw">&lt;/div&gt;</span>
  <span class="kw">&lt;/header&gt;</span>

  <span class="kw">&lt;main</span> <span class="nm">class</span>=<span class="str">"boards-container"</span><span class="kw">&gt;</span>
    <span class="kw">&lt;section</span> <span class="nm">class</span>=<span class="str">"board player-board"</span><span class="kw">&gt;</span>
      <span class="kw">&lt;h2&gt;</span>Jouw vloot<span class="kw">&lt;/h2&gt;</span>
      <span class="kw">&lt;div</span> <span class="nm">id</span>=<span class="str">"player-grid"</span> <span class="nm">class</span>=<span class="str">"grid"</span><span class="kw">&gt;&lt;/div&gt;</span>
    <span class="kw">&lt;/section&gt;</span>

    <span class="kw">&lt;section</span> <span class="nm">class</span>=<span class="str">"board enemy-board"</span><span class="kw">&gt;</span>
      <span class="kw">&lt;h2&gt;</span>Vijandelijk<span class="kw">&lt;/h2&gt;</span>
      <span class="kw">&lt;div</span> <span class="nm">id</span>=<span class="str">"enemy-grid"</span> <span class="nm">class</span>=<span class="str">"grid"</span><span class="kw">&gt;&lt;/div&gt;</span>
    <span class="kw">&lt;/section&gt;</span>
  <span class="kw">&lt;/main&gt;</span>

  <span class="kw">&lt;div</span> <span class="nm">id</span>=<span class="str">"message-box"</span> <span class="nm">class</span>=<span class="str">"hidden"</span><span class="kw">&gt;&lt;/div&gt;</span>

<span class="kw">&lt;/div&gt;</span>`,

  css: `<span class="cm">/* Zeeslag Game — stijl placeholder */</span>

<span class="nm">:root</span> {
  <span class="nm">--ocean-dark</span>:  <span class="nb">#03070f</span>;
  <span class="nm">--ocean-blue</span>:  <span class="nb">#00d4ff</span>;
  <span class="nm">--ship-color</span>:  <span class="nb">#0080ff</span>;
  <span class="nm">--hit-color</span>:   <span class="nb">#ff3c5a</span>;
  <span class="nm">--miss-color</span>:  <span class="nb">#1a3a5c</span>;
}

<span class="nm">.grid</span> {
  <span class="kw">display</span>: <span class="op">grid</span>;
  <span class="kw">grid-template-columns</span>: <span class="fn">repeat</span>(<span class="nb">10</span>, <span class="nb">1fr</span>);
  <span class="kw">gap</span>: <span class="nb">3px</span>;
  <span class="kw">width</span>: <span class="nb">320px</span>;
}

<span class="nm">.cell</span> {
  <span class="kw">aspect-ratio</span>: <span class="nb">1</span>;
  <span class="kw">border</span>: <span class="nb">1px</span> <span class="op">solid</span> <span class="fn">rgba</span>(<span class="nb">0,212,255,0.1</span>);
  <span class="kw">background</span>: <span class="fn">rgba</span>(<span class="nb">0,50,80,0.3</span>);
  <span class="kw">border-radius</span>: <span class="nb">2px</span>;
  <span class="kw">cursor</span>: <span class="op">pointer</span>;
  <span class="kw">transition</span>: background <span class="nb">0.3s</span>, box-shadow <span class="nb">0.3s</span>;
}

<span class="nm">.cell.ship</span>  { <span class="kw">background</span>: <span class="kw">var</span>(<span class="nm">--ship-color</span>); }
<span class="nm">.cell.hit</span>   { <span class="kw">background</span>: <span class="kw">var</span>(<span class="nm">--hit-color</span>); }
<span class="nm">.cell.miss</span>  { <span class="kw">background</span>: <span class="kw">var</span>(<span class="nm">--miss-color</span>); }`,
};

let typingAnim = null;
let currentTab = 'js';

function switchTab(btn, lang) {
  $$('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentTab = lang;
  renderCode(lang);
}

function renderCode(lang) {
  const el   = $('#codeContent');
  const nums = $('#lineNums');
  if (!el || !nums) return;

  if (typingAnim) clearInterval(typingAnim);

  const html  = CODE_SNIPPETS[lang] || '';
  el.innerHTML = '';

  // Count actual lines
  const raw   = html.replace(/<[^>]+>/g, ''); // strip tags for line count
  const lines = raw.split('\n').length;

  nums.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('\n');

  // Typing animation: inject chars of the raw text, but show syntax-coloured version
  // For simplicity, reveal the full HTML in one smooth fade
  el.innerHTML = html;
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.4s';
  requestAnimationFrame(() => { el.style.opacity = '1'; });
}

document.addEventListener('DOMContentLoaded', () => renderCode('js'));

/* ══════════════════════════════════════════════════════════
   11. ACCORDION
══════════════════════════════════════════════════════════ */
function toggleAcc(btn) {
  const item = btn.parentElement;
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');

  // Close all
  $$('.acc-header').forEach(b => b.classList.remove('open'));
  $$('.acc-body').forEach(b  => b.classList.remove('open'));

  // Open clicked (unless it was already open)
  if (!isOpen) {
    btn.classList.add('open');
    body.classList.add('open');
  }
}

/* ══════════════════════════════════════════════════════════
   12. SMOOTH SCROLL HELPER
══════════════════════════════════════════════════════════ */
function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════════
   13. END CANVAS — animated radar sweep
══════════════════════════════════════════════════════════ */
(function initEndCanvas() {
  const canvas = $('#endCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, tick = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Concentric circles
    const cx = W / 2, cy = H / 2;
    [0.15, 0.28, 0.42, 0.58].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * Math.min(W, H), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${0.03 + i * 0.015})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Sweep
    const angle = (tick * 0.008) % (Math.PI * 2);
    const maxR  = 0.6 * Math.min(W, H);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(0, 0, maxR, 0);
    grad.addColorStop(0,   'rgba(0,212,255,0.0)');
    grad.addColorStop(0.6, 'rgba(0,212,255,0.08)');
    grad.addColorStop(1,   'rgba(0,212,255,0.25)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxR, -0.3, 0.3);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Grid lines
    const step = 80;
    for (let x = cx % step; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H);
      ctx.strokeStyle = 'rgba(0,212,255,0.03)'; ctx.lineWidth = 1; ctx.stroke();
    }
    for (let y = cy % step; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.strokeStyle = 'rgba(0,212,255,0.03)'; ctx.lineWidth = 1; ctx.stroke();
    }

    tick++;
    requestAnimationFrame(render);
  }
  render();
})();

/* ══════════════════════════════════════════════════════════
   14. TIMELINE step animations (enhanced)
══════════════════════════════════════════════════════════ */
(function initTimeline() {
  const line = $('.timeline-line');
  if (!line) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const dots = $$('.tl-dot');
        dots.forEach((d, i) => {
          setTimeout(() => {
            d.style.boxShadow = '0 0 24px rgba(0,212,255,0.7), 0 0 48px rgba(0,212,255,0.3)';
            d.style.background = 'rgba(0,212,255,0.15)';
          }, i * 300);
        });
      }
    });
  }, { threshold: 0.3 });

  const tl = $('#timeline');
  if (tl) observer.observe(tl);
})();

/* ══════════════════════════════════════════════════════════
   15. PARALLAX on hero content
══════════════════════════════════════════════════════════ */
(function initHeroParallax() {
  const hero    = $('#hero');
  const content = $('.hero-content');
  if (!hero || !content) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      content.style.transform = `translateY(${scrolled * 0.25}px)`;
      content.style.opacity   = 1 - scrolled / (window.innerHeight * 0.85);
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   16. NAV active link highlight on scroll
══════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav-links a');

  window.addEventListener('scroll', () => {
    const y = window.scrollY + 100;
    let active = '';
    sections.forEach(s => {
      if (s.offsetTop <= y) active = s.id;
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${active}` ? 'var(--accent)' : '';
    });
  });
})();