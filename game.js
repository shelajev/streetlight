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
    canvasSize: 200,         // CSS pixels for drawing canvas
    lineWidth: 8,
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
 * `raw` is a string or { top, alternatives }.
 */
function matchAnswer(raw, expected) {
    const exp = normalize(expected);
    if (typeof raw === 'string') {
        const norm = normalize(raw);
        console.log(`[HWR-match] "${raw}" → "${norm}" vs expected "${exp}" → ${norm === exp}`);
        return norm === exp;
    }
    const candidates = [raw.top, ...(raw.alternatives || [])];
    const result = candidates.some(c => normalize(c) === exp);
    console.log(`[HWR-match] top="${raw.top}" alts=[${(raw.alternatives||[]).join(',')}] vs expected "${exp}" → ${result}`);
    return result;
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
            clrBtn.textContent = '↺';
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
//  CANVAS DRAWING  (with stroke recording for Google HWR)
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
    // Stroke data for handwriting recognition
    canvas._strokes = [];   // [ { xs:[], ys:[], ts:[] }, … ]
    canvas._cssSize = size;
    return canvas;
}

function clearCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    canvas._strokes = [];
}

function setupDrawEvents(canvas, wrap) {
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let currentStroke = null;

    function pos(e) {
        const r = canvas.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    function start(e) {
        e.preventDefault();
        drawing = true;
        const p = pos(e);
        currentStroke = { xs: [p.x], ys: [p.y], ts: [Date.now()] };
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }
    function move(e) {
        e.preventDefault();
        if (!drawing) return;
        const p = pos(e);
        currentStroke.xs.push(p.x);
        currentStroke.ys.push(p.y);
        currentStroke.ts.push(Date.now());
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        wrap.classList.add('has-content');
    }
    function end() {
        if (drawing && currentStroke && currentStroke.xs.length > 1) {
            canvas._strokes.push(currentStroke);
        }
        drawing = false;
        currentStroke = null;
    }

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove',  move,  { passive: false });
    canvas.addEventListener('touchend',   end);
    canvas.addEventListener('mousedown',  start);
    canvas.addEventListener('mousemove',  move);
    canvas.addEventListener('mouseup',    end);
    canvas.addEventListener('mouseleave', end);
}

// ============================================================
//  ANSWER COLLECTION  (Google Handwriting Recognition API)
// ============================================================
async function collectAnswers() {
    const canvases = [...document.querySelectorAll('#right-light .lamp-canvas')];
    const lv = LEVELS[S.levelIdx];
    const results = [];

    console.log(`[HWR] collectAnswers: ${canvases.length} canvases`);

    for (let ci = 0; ci < canvases.length; ci++) {
        const canvas = canvases[ci];
        const strokes = canvas._strokes || [];
        console.log(`[HWR] Canvas ${ci}: ${strokes.length} strokes, points=[${strokes.map(s => s.xs.length).join(',')}]`);

        if (strokes.length === 0) {
            console.log(`[HWR] Canvas ${ci}: empty (nothing drawn)`);
            results.push({ top: '', alternatives: [] });
            continue;
        }

        try {
            const candidates = await googleHandwritingRecognize(strokes, canvas._cssSize);
            console.log(`[HWR] Canvas ${ci}: Google API returned candidates:`, candidates);

            if (candidates.length > 0) {
                // Filter/rank by pool membership
                const poolSet = new Set(lv.pool.map(p => normalize(p)));
                const poolMatch = candidates.find(c => poolSet.has(normalize(c)));
                const top = poolMatch || candidates[0];
                const alts = candidates.filter(c => c !== top).slice(0, 3);

                console.log(`[HWR] Canvas ${ci}: RESULT top="${top}" alts=[${alts.join(',')}] (poolMatch=${!!poolMatch})`);
                results.push({ top: normalize(top), alternatives: alts.map(normalize) });
            } else {
                console.log(`[HWR] Canvas ${ci}: no candidates returned`);
                results.push({ top: '', alternatives: [] });
            }
        } catch (err) {
            console.error(`[HWR] Canvas ${ci}: recognition failed:`, err);
            results.push({ top: '', alternatives: [] });
        }
    }
    return results;
}

/**
 * Call Google's handwriting recognition API with stroke data.
 * Returns an array of candidate strings, best first.
 */
async function googleHandwritingRecognize(strokes, canvasSize) {
    // Build ink array: each stroke → [ [x1,x2,…], [y1,y2,…], [t1,t2,…] ]
    // Coords must be rounded ints, timestamps must be relative (ms from 0)
    const t0 = strokes[0].ts[0];
    const ink = strokes.map(s => [
        s.xs.map(x => Math.round(x)),
        s.ys.map(y => Math.round(y)),
        s.ts.map(t => t - t0)
    ]);

    const payload = {
        input_type: 0,
        options: 'enable_pre_space',
        requests: [{
            writing_guide: {
                writing_area_width: Math.round(canvasSize),
                writing_area_height: Math.round(canvasSize)
            },
            ink: ink,
            pre_context: '',
            max_num_results: 10,
            max_completions: 0
        }]
    };

    console.log(`[HWR-google] Sending ${strokes.length} strokes, canvasSize=${canvasSize}, totalPoints=${ink.reduce((a,s)=>a+s[0].length,0)}`);

    const resp = await fetch(
        'https://inputtools.google.com/request?itc=en-t-i0-handwrit&app=chromeos',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );

    if (!resp.ok) {
        throw new Error(`Google HWR HTTP ${resp.status}`);
    }

    const data = await resp.json();
    console.log(`[HWR-google] Response:`, JSON.stringify(data));

    // Response format: ["SUCCESS", [["", ["A","a","4",…], [], {…}]]]
    if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
        return data[1][0][1]; // array of candidate strings
    }

    console.warn(`[HWR-google] Unexpected response format:`, data);
    return [];
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
