// ============================================================
//  Tähetuled (Letter Lights) — Game Logic
// ============================================================

// ---- Lamp Colors ----
const LAMP_COLORS = [
    { bg: '#e03131', glow: 'rgba(224,49,49,.55)' },   // red
    { bg: '#f08c00', glow: 'rgba(240,140,0,.55)' },    // orange
    { bg: '#fcc419', glow: 'rgba(252,196,25,.55)' },   // yellow
    { bg: '#37b24d', glow: 'rgba(55,178,77,.55)' },    // green
    { bg: '#1c7ed6', glow: 'rgba(28,126,214,.55)' },   // blue
    { bg: '#9c36b5', glow: 'rgba(156,54,181,.55)' },   // purple
    { bg: '#f06595', glow: 'rgba(240,101,149,.55)' },  // pink
    { bg: '#0ca678', glow: 'rgba(12,166,120,.55)' },   // teal
];

// ---- Level Definitions ----
const LEVELS = [
    // --- Single vowels ---
    { id:1,  name:'Täishäälikud 1',    sub:'A, E, I',              lamps:3, timeout:7000, rounds:3, pool:['A','E','I'] },
    { id:2,  name:'Täishäälikud 2',    sub:'O, U',                 lamps:3, timeout:7000, rounds:3, pool:['A','E','I','O','U'] },
    { id:3,  name:'Täishäälikud 3',    sub:'Õ, Ä, Ö, Ü',          lamps:3, timeout:7000, rounds:3, pool:['Õ','Ä','Ö','Ü'] },
    { id:4,  name:'Kõik täishäälikud', sub:'Kõik täishäälikud',     lamps:3, timeout:6000, rounds:4, pool:['A','E','I','O','U','Õ','Ä','Ö','Ü'] },

    // --- Consonants ---
    { id:5,  name:'Kaashäälikud 1',    sub:'M, N, P',              lamps:3, timeout:6000, rounds:3, pool:['M','N','P'] },
    { id:6,  name:'Kaashäälikud 2',    sub:'T, K, S',              lamps:3, timeout:6000, rounds:3, pool:['T','K','S'] },
    { id:7,  name:'Kaashäälikud 3',    sub:'L, R, H, J',           lamps:3, timeout:5000, rounds:3, pool:['L','R','H','J'] },
    { id:8,  name:'Kaashäälikud 4',    sub:'V, G, B, D',           lamps:3, timeout:5000, rounds:3, pool:['V','G','B','D'] },
    { id:9,  name:'Kaashäälikud 5',    sub:'F, Š, Z, Ž',          lamps:3, timeout:5000, rounds:3, pool:['F','Š','Z','Ž'] },

    // --- Mixed single letters ---
    { id:10, name:'Segamini 1',        sub:'Segatud tähed',        lamps:3, timeout:5000, rounds:4, pool:['A','E','I','O','U','M','N','P','T','K','S'] },
    { id:11, name:'Segamini 2',        sub:'Kõik tähed, 3 tuld',   lamps:3, timeout:4000, rounds:4, pool:['A','E','I','O','U','Õ','Ä','Ö','Ü','B','D','F','G','H','J','K','L','M','N','P','R','S','Š','T','V','Z','Ž'] },

    // --- 4-lamp challenges ---
    { id:12, name:'4 tuld 1',          sub:'4 tuld – täishäälikud', lamps:4, timeout:6000, rounds:3, pool:['A','E','I','O','U','Õ','Ä','Ö','Ü'] },
    { id:13, name:'4 tuld 2',          sub:'4 tuld – segatud',     lamps:4, timeout:5000, rounds:4, pool:['A','E','I','O','U','M','N','P','T','K','S','L','R'] },

    // --- Simple syllables ---
    { id:14, name:'Silbid 1',          sub:'MA, PA, TA, SA…',      lamps:3, timeout:7000, rounds:3, pool:['MA','PA','TA','SA','NA','KA'] },
    { id:15, name:'Silbid 2',          sub:'MI, TU, KO, SE…',      lamps:3, timeout:7000, rounds:3, pool:['MI','TU','KO','SE','LA','RI'] },
    { id:16, name:'Silbid 3',          sub:'Segatud silbid',       lamps:3, timeout:6000, rounds:4, pool:['MA','ME','MI','MO','MU','PA','PE','PI','PO','PU','TA','TE','TI','TO','TU'] },
    { id:17, name:'Silbid 4',          sub:'Erikujulised silbid',  lamps:3, timeout:7000, rounds:3, pool:['MÕ','TÄ','KÖ','SÜ','LÕ','NÄ','PÖ','RÜ'] },

    // --- 4-lamp syllable challenge ---
    { id:18, name:'4 silpi',           sub:'4 silbituld',          lamps:4, timeout:7000, rounds:3, pool:['MA','PA','TA','SA','NA','KA','MI','TU','KO','SE','LA','RI'] },

    // --- 5-lamp expert ---
    { id:19, name:'Ekspert 1',         sub:'5 tuld – tähed',       lamps:5, timeout:5000, rounds:3, pool:['A','E','I','O','U','Õ','Ä','Ö','Ü','M','N','P','T','K','S','L','R','H'] },
    { id:20, name:'Ekspert 2',         sub:'5 tuld – silbid',      lamps:5, timeout:6000, rounds:3, pool:['MA','PA','TA','SA','NA','KA','MI','TU','KO','SE','LA','RI','MÕ','TÄ','KÖ','SÜ'] },
];

// ---- Configuration ----
const CONFIG = {
    letterCase: 'upper',     // 'upper', 'lower', or 'mixed'
    timeoutOverride: null,   // null = use level default
    canvasSize: 100,         // CSS pixels for drawing canvas
    lineWidth: 6,
    strokeColor: '#1a1a2e',
};

// ---- Game State ----
let S = {
    screen: 'menu',
    levelIdx: 0,
    round: 0,
    phase: 'idle',       // idle | showing | playing | results
    currentLetters: [],
    score: 0,
    roundScore: 0,
    timerRAF: null,
    unlockedLevel: 0,
    levelStars: {},      // { levelId: stars }
};

let tesseractWorker = null;
let tesseractReady  = false;
let tesseractLoading = false;

// ---- Helpers ----
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Normalize an answer string: uppercase, strip all spaces */
function normalize(s) {
    return s.toUpperCase().replace(/\s+/g, '');
}

/** Transform a letter/syllable according to the current case setting */
function applyCase(s) {
    if (CONFIG.letterCase === 'lower') return s.toLowerCase();
    if (CONFIG.letterCase === 'mixed') return Math.random() < 0.5 ? s.toLowerCase() : s.toUpperCase();
    return s.toUpperCase();
}

/**
 * Check if an answer matches the expected value.
 * `raw` can be a string (fallback) or { top, alternatives } (OCR mode).
 * Strips mid-string spaces before comparing. Checks top + 2 alternatives.
 */
function matchAnswer(raw, expected) {
    const exp = normalize(expected);
    if (typeof raw === 'string') {
        return normalize(raw) === exp;
    }
    // OCR mode: raw = { top, alternatives }
    const candidates = [raw.top, ...(raw.alternatives || [])];
    return candidates.some(c => normalize(c) === exp);
}

function pick(arr, n) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a.slice(0, n);
}

// ============================================================
//  INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    loadSettings();
    renderLevelGrid();
    wireMenuEvents();
    wireGameEvents();
});

function loadProgress() {
    try {
        const d = JSON.parse(localStorage.getItem('tahetuled-progress'));
        if (d) { S.unlockedLevel = d.unlockedLevel || 0; S.levelStars = d.levelStars || {}; }
    } catch {}
}
function saveProgress() {
    localStorage.setItem('tahetuled-progress', JSON.stringify({ unlockedLevel: S.unlockedLevel, levelStars: S.levelStars }));
}
function loadSettings() {
    try {
        const d = JSON.parse(localStorage.getItem('tahetuled-settings'));
        if (d) {
            if (d.letterCase) CONFIG.letterCase = d.letterCase;
            if (d.timeoutOverride) CONFIG.timeoutOverride = d.timeoutOverride;
        }
    } catch {}
    // Sync UI
    document.querySelectorAll('#case-toggle .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.case === CONFIG.letterCase));
    document.querySelectorAll('#timeout-toggle .toggle-btn').forEach(b => {
        const v = CONFIG.timeoutOverride ? String(CONFIG.timeoutOverride) : '7000';
        b.classList.toggle('active', b.dataset.timeout === v);
    });
}
function saveSettings() {
    localStorage.setItem('tahetuled-settings', JSON.stringify({ letterCase: CONFIG.letterCase, timeoutOverride: CONFIG.timeoutOverride }));
}

// ============================================================
//  MENU
// ============================================================
function renderLevelGrid() {
    const grid = $('#level-grid');
    grid.innerHTML = '';
    LEVELS.forEach((lv, i) => {
        const card = document.createElement('div');
        card.className = 'level-card' + (i > S.unlockedLevel ? ' locked' : '') + (i === S.levelIdx ? ' selected' : '');
        const stars = S.levelStars[lv.id] || 0;
        card.innerHTML = `<span class="lnum">${lv.id}</span><span class="lname">${lv.sub}</span>`
            + (stars > 0 ? `<span class="lstars">${'⭐'.repeat(stars)}</span>` : '');
        card.dataset.index = i;
        grid.appendChild(card);
    });
}

function wireMenuEvents() {
    // Level card selection
    $('#level-grid').addEventListener('click', e => {
        const card = e.target.closest('.level-card');
        if (!card || card.classList.contains('locked')) return;
        S.levelIdx = parseInt(card.dataset.index);
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    });

    // Case toggle
    $('#case-toggle').addEventListener('click', e => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        CONFIG.letterCase = btn.dataset.case;
        document.querySelectorAll('#case-toggle .toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
        saveSettings();
    });

    // Timeout toggle
    $('#timeout-toggle').addEventListener('click', e => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        CONFIG.timeoutOverride = parseInt(btn.dataset.timeout);
        document.querySelectorAll('#timeout-toggle .toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
        saveSettings();
    });

    // Start
    $('#start-btn').addEventListener('click', () => startLevel(S.levelIdx));
}

// ============================================================
//  SCREEN MANAGEMENT
// ============================================================
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(`#${name}-screen`).classList.add('active');
    S.screen = name;
}

// ============================================================
//  GAME FLOW
// ============================================================
function startLevel(idx) {
    S.levelIdx = idx;
    S.round = 0;
    S.score = 0;
    showScreen('game');
    updateHeader();

    // Lazy-init Tesseract for draw mode
    if (!tesseractReady && !tesseractLoading) {
        initTesseract();
    }

    startRound();
}

function startRound() {
    const lv = LEVELS[S.levelIdx];
    S.phase = 'showing';
    S.currentLetters = pick(lv.pool, lv.lamps).map(applyCase);
    S.roundScore = 0;

    updateHeader();
    showMessage('Vaata tähti! 👀');
    $('#check-btn').style.display = 'none';
    $('#next-btn').style.display = 'none';

    // Render street lights
    renderStreetLight($('#left-light'),  S.currentLetters, { showLetters: true });
    renderStreetLight($('#right-light'), S.currentLetters, { showLetters: false, interactive: true });

    // Disable right panel inputs until timer runs out
    setRightPanelEnabled(false);
    $('#left-label').textContent = '👀 Vaata!';
    $('#right-label').textContent = '✍️ Kirjuta!';

    // Start countdown
    const timeout = CONFIG.timeoutOverride || lv.timeout;
    startTimer(timeout, () => {
        onTimerDone();
    });
}

function onTimerDone() {
    S.phase = 'playing';
    // Hide letters on left
    document.querySelectorAll('#left-light .lamp-letter').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#left-light .lamp').forEach(el => el.classList.add('dim'));
    $('#left-label').textContent = '🫣 Peidetud!';

    // Enable right panel
    setRightPanelEnabled(true);
    showMessage('Kirjuta tähed! ✍️');
    $('#check-btn').style.display = '';
}

async function checkAnswers() {
    if (S.phase !== 'playing') return;
    S.phase = 'results';
    $('#check-btn').style.display = 'none';
    showMessage('Kontrollin… ⏳');

    const answers = await collectAnswers();
    const lv = LEVELS[S.levelIdx];
    let correct = 0;

    // Show result per lamp
    const rightLamps = document.querySelectorAll('#right-light .lamp');
    const leftLamps  = document.querySelectorAll('#left-light .lamp');

    S.currentLetters.forEach((expected, i) => {
        const raw = answers[i] ?? '';
        const isCorrect = matchAnswer(raw, expected);
        const lampR = rightLamps[i];
        const lampL = leftLamps[i];

        if (isCorrect) {
            correct++;
            lampR.classList.add('correct');
            addResultBadge(lampR, true);
        } else {
            lampR.classList.add('wrong');
            addResultBadge(lampR, false);
            addExpectedLabel(lampR, expected);
        }
        // Reveal left letter
        const letter = lampL.querySelector('.lamp-letter');
        if (letter) { letter.classList.remove('hidden'); }
        lampL.classList.remove('dim');
    });

    S.roundScore = correct;
    S.score += correct;
    updateHeader();

    const total = S.currentLetters.length;
    if (correct === total) {
        showMessage(`Suurepärane! Kõik õige! 🎉 ${correct}/${total}`);
        createConfetti(40);
    } else if (correct > 0) {
        showMessage(`Tubli! ${correct}/${total} õige! 👏`);
    } else {
        showMessage(`Proovi uuesti! 0/${total} 💪`);
    }

    $('#next-btn').style.display = '';
}

function nextRound() {
    const lv = LEVELS[S.levelIdx];
    S.round++;
    if (S.round >= lv.rounds) {
        completeLevel();
    } else {
        startRound();
    }
}

function completeLevel() {
    const lv = LEVELS[S.levelIdx];
    const maxScore = lv.lamps * lv.rounds;
    const pct = S.score / maxScore;
    const stars = pct >= .95 ? 3 : pct >= .7 ? 2 : pct >= .4 ? 1 : 0;

    // Save progress
    const prev = S.levelStars[lv.id] || 0;
    if (stars > prev) S.levelStars[lv.id] = stars;
    if (S.levelIdx >= S.unlockedLevel && stars >= 1) {
        S.unlockedLevel = Math.min(S.levelIdx + 1, LEVELS.length - 1);
    }
    saveProgress();

    // Show overlay
    $('#complete-stars').textContent = stars > 0 ? '⭐'.repeat(stars) : '🌟';
    $('#complete-title').textContent = stars === 3 ? 'Suurepärane! 🏆' : stars >= 1 ? 'Tubli töö! 👏' : 'Proovi veel! 💪';
    $('#complete-message').textContent = `Tulemus: ${S.score}/${maxScore} (${Math.round(pct*100)}%)`;
    $('#complete-overlay').style.display = '';

    if (stars === 3) createConfetti(80);
    else if (stars >= 1) createConfetti(30);
}

// ============================================================
//  STREET LIGHT RENDERING
// ============================================================
function renderStreetLight(container, letters, opts = {}) {
    const { showLetters = true, interactive = false } = opts;
    container.innerHTML = '';

    const housing = document.createElement('div');
    housing.className = 'light-housing';

    letters.forEach((letter, i) => {
        const color = LAMP_COLORS[i % LAMP_COLORS.length];
        const lamp = document.createElement('div');
        lamp.className = 'lamp' + (showLetters ? ' lit' : '');
        lamp.style.backgroundColor = color.bg;
        lamp.style.setProperty('--lamp-glow', color.glow);
        lamp.dataset.index = i;

        if (showLetters && !interactive) {
            const span = document.createElement('span');
            span.className = 'lamp-letter';
            span.textContent = letter;
            lamp.appendChild(span);
        }

        if (interactive) {
            lamp.classList.add('lit');
            const wrap = document.createElement('div');
            wrap.className = 'lamp-canvas-wrap';
            const canvas = createDrawCanvas(CONFIG.canvasSize);
            canvas.className = 'lamp-canvas';
            wrap.appendChild(canvas);
            // Clear button
            const clrBtn = document.createElement('button');
            clrBtn.className = 'canvas-clear-btn';
            clrBtn.textContent = '✕';
            clrBtn.addEventListener('click', (e) => { e.stopPropagation(); clearCanvas(canvas); wrap.classList.remove('has-content'); });
            wrap.appendChild(clrBtn);
            lamp.appendChild(wrap);
            setupDrawEvents(canvas, wrap);
        }

        housing.appendChild(lamp);
    });

    const pole = document.createElement('div');
    pole.className = 'light-pole';
    const base = document.createElement('div');
    base.className = 'light-base';

    container.appendChild(housing);
    container.appendChild(pole);
    container.appendChild(base);
}

function setRightPanelEnabled(enabled) {
    document.querySelectorAll('#right-light .lamp-canvas').forEach(c => {
        c.style.pointerEvents = enabled ? 'auto' : 'none';
        c.classList.toggle('active-canvas', enabled);
    });
}

function addResultBadge(lamp, ok) {
    const badge = document.createElement('div');
    badge.className = 'lamp-result ' + (ok ? 'ok' : 'bad');
    badge.textContent = ok ? '✓' : '✗';
    lamp.appendChild(badge);
}

function addExpectedLabel(lamp, expected) {
    const lbl = document.createElement('div');
    lbl.className = 'lamp-expected';
    lbl.textContent = expected;
    lamp.appendChild(lbl);
}

// ============================================================
//  CANVAS DRAWING
// ============================================================
function createDrawCanvas(size) {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.strokeStyle = CONFIG.strokeColor;
    return canvas;
}

function clearCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function setupDrawEvents(canvas, wrap) {
    const ctx = canvas.getContext('2d');
    let drawing = false;

    function pos(e) {
        const r = canvas.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    function start(e) {
        e.preventDefault();
        drawing = true;
        const p = pos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }
    function move(e) {
        e.preventDefault();
        if (!drawing) return;
        const p = pos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        wrap.classList.add('has-content');
    }
    function end() { drawing = false; }

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove',  move,  { passive: false });
    canvas.addEventListener('touchend',   end);
    canvas.addEventListener('mousedown',  start);
    canvas.addEventListener('mousemove',  move);
    canvas.addEventListener('mouseup',    end);
    canvas.addEventListener('mouseleave', end);
}

// ============================================================
//  ANSWER COLLECTION & RECOGNITION
// ============================================================
async function collectAnswers() {
    const canvases = [...document.querySelectorAll('#right-light .lamp-canvas')];
    const results = [];

    if (!tesseractReady) {
        showMessage('OCR laadib… ⏳');
        // Wait up to 15s for Tesseract
        for (let i = 0; i < 30 && !tesseractReady; i++) await sleep(500);
    }

    if (!tesseractReady) {
        // Fallback: ask user to re-enter via prompt
        showMessage('OCR pole saadaval.');
        return canvases.map(() => prompt('Sisesta täht:') || '');
    }

    // Set whitelist based on current level pool
    const lv = LEVELS[S.levelIdx];
    const poolChars = [...new Set(lv.pool.join(''))].join('');
    try {
        await tesseractWorker.setParameters({
            tessedit_char_whitelist: poolChars + poolChars.toLowerCase(),
            tessedit_pageseg_mode: lv.pool[0].length > 1 ? '7' : '10',
        });
    } catch (err) {
        console.warn('Tesseract setParameters error:', err);
    }

    for (const canvas of canvases) {
        const processed = preprocessCanvas(canvas);
        if (!processed) { results.push({ top: '', alternatives: [] }); continue; }
        try {
            const { data } = await tesseractWorker.recognize(processed);
            const top = data.text.trim().toUpperCase();

            // Collect alternative readings from symbol-level choices (top 3)
            // Tesseract.js nests symbols under words; flatten them
            const symbols = (data.symbols && data.symbols.length > 0)
                ? data.symbols
                : (data.words || []).flatMap(w => w.symbols || []);
            const alternatives = [];
            if (symbols.length > 0) {
                // For single-char recognition, use symbol choices directly
                if (symbols.length === 1 && symbols[0].choices) {
                    symbols[0].choices.slice(0, 3).forEach(ch => {
                        const alt = ch.text.trim().toUpperCase();
                        if (alt && alt !== top) alternatives.push(alt);
                    });
                } else {
                    // For multi-char (syllables), build alternatives by
                    // combining each symbol's top choices
                    const perSymbol = symbols.map(sym =>
                        (sym.choices || []).slice(0, 3).map(ch => ch.text.trim().toUpperCase())
                    );
                    // Add full-word alternatives from first choice per position
                    for (let ci = 0; ci < 3; ci++) {
                        const alt = perSymbol.map(choices => choices[ci] || choices[0] || '').join('');
                        if (alt && alt !== top) alternatives.push(alt);
                    }
                }
            }

            results.push({ top, alternatives: [...new Set(alternatives)].slice(0, 2) });
        } catch (err) {
            console.warn('OCR error:', err);
            results.push({ top: '', alternatives: [] });
        }
    }
    return results;
}

function preprocessCanvas(canvas) {
    // Find bounding box of drawn pixels
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d');
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    let x1=w, y1=h, x2=0, y2=0;
    for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] > 30) {
            const x = (i/4) % w, y = Math.floor((i/4)/w);
            if (x < x1) x1 = x; if (x > x2) x2 = x;
            if (y < y1) y1 = y; if (y > y2) y2 = y;
        }
    }
    if (x2 <= x1 || y2 <= y1) return null; // nothing drawn

    const bw = x2-x1, bh = y2-y1;
    const size = 200;
    const padding = 30;
    const inner = size - 2*padding;
    const scale = Math.min(inner/bw, inner/bh);

    const out = document.createElement('canvas');
    out.width = size; out.height = size;
    const oc = out.getContext('2d');
    oc.fillStyle = '#fff';
    oc.fillRect(0, 0, size, size);
    const dx = padding + (inner - bw*scale)/2;
    const dy = padding + (inner - bh*scale)/2;
    oc.drawImage(canvas, x1, y1, bw, bh, dx, dy, bw*scale, bh*scale);

    // Binarize
    const od = oc.getImageData(0, 0, size, size);
    for (let i = 0; i < od.data.length; i += 4) {
        const avg = (od.data[i]+od.data[i+1]+od.data[i+2])/3;
        const v = avg < 140 ? 0 : 255;
        od.data[i]=v; od.data[i+1]=v; od.data[i+2]=v; od.data[i+3]=255;
    }
    oc.putImageData(od, 0, 0);
    return out;
}

// ============================================================
//  TESSERACT INITIALIZATION (lazy)
// ============================================================
async function initTesseract() {
    if (tesseractLoading || tesseractReady) return;
    tesseractLoading = true;

    // Show loading indicator
    const ind = document.createElement('div');
    ind.className = 'ocr-loading';
    ind.id = 'ocr-indicator';
    ind.innerHTML = '<span class="spinner"></span> OCR laadib…';
    document.body.appendChild(ind);

    try {
        tesseractWorker = await Tesseract.createWorker('eng', 1, {
            logger: m => {
                if (m.status === 'recognizing text') {
                    // progress
                }
            }
        });
        tesseractReady = true;
        console.log('Tesseract ready');
    } catch (err) {
        console.error('Tesseract init failed:', err);
    }
    tesseractLoading = false;
    const el = document.getElementById('ocr-indicator');
    if (el) el.remove();
}

// ============================================================
//  TIMER
// ============================================================
function startTimer(duration, onDone) {
    cancelTimer();
    const bar = $('#timer-bar');
    const start = performance.now();
    function tick(now) {
        const elapsed = now - start;
        const pct = Math.max(0, 1 - elapsed / duration);
        bar.style.width = (pct * 100) + '%';
        if (pct > 0) {
            S.timerRAF = requestAnimationFrame(tick);
        } else {
            onDone();
        }
    }
    S.timerRAF = requestAnimationFrame(tick);
}
function cancelTimer() {
    if (S.timerRAF) { cancelAnimationFrame(S.timerRAF); S.timerRAF = null; }
}

// ============================================================
//  UI UPDATES
// ============================================================
function updateHeader() {
    const lv = LEVELS[S.levelIdx];
    $('#level-label').textContent = `Tase ${lv.id}: ${lv.name}`;
    $('#round-label').textContent = `Voor ${S.round + 1}/${lv.rounds}`;
    $('#score-label').textContent = `⭐ ${S.score}`;
}

function showMessage(text) {
    const el = $('#game-message');
    el.textContent = text;
    el.style.opacity = 0;
    requestAnimationFrame(() => el.style.opacity = 1);
}

// ============================================================
//  GAME SCREEN EVENTS
// ============================================================
function wireGameEvents() {
    $('#back-btn').addEventListener('click', () => {
        cancelTimer();
        S.phase = 'idle';
        showScreen('menu');
        renderLevelGrid();
    });

    $('#check-btn').addEventListener('click', () => checkAnswers());

    $('#next-btn').addEventListener('click', () => nextRound());

    $('#complete-next-btn').addEventListener('click', () => {
        $('#complete-overlay').style.display = 'none';
        if (S.levelIdx + 1 < LEVELS.length) {
            startLevel(S.levelIdx + 1);
        } else {
            showScreen('menu');
            renderLevelGrid();
        }
    });

    $('#complete-menu-btn').addEventListener('click', () => {
        $('#complete-overlay').style.display = 'none';
        showScreen('menu');
        renderLevelGrid();
    });
}

// ============================================================
//  CONFETTI
// ============================================================
function createConfetti(count = 50) {
    const container = $('#confetti-container');
    const colors = LAMP_COLORS.map(c => c.bg);
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.left = (Math.random() * 100) + 'vw';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--delay', (Math.random() * 1.5) + 's');
        p.style.setProperty('--duration', (2 + Math.random() * 2) + 's');
        p.style.setProperty('--rot', (360 + Math.random() * 720) + 'deg');
        p.style.width = (6 + Math.random() * 8) + 'px';
        p.style.height = (10 + Math.random() * 14) + 'px';
        container.appendChild(p);
    }
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}
