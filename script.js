const panel         = document.getElementById('panel');
const clockEl       = document.getElementById('clock');
const musicToggle   = document.getElementById('musicToggle');
const musicControl  = document.getElementById('musicControl');
const siteTrack     = document.getElementById('siteTrack');
const mpEq          = document.getElementById('mpEq');
const terminalOpenBtn  = document.getElementById('terminalOpenBtn');
const terminalOverlay  = document.getElementById('terminalOverlay');
const terminalPopup    = document.getElementById('terminalPopup');
const terminalCloseBtn = document.getElementById('terminalCloseBtn');
const terminalCloseDot = document.getElementById('terminalCloseDot');
const terminalOutput   = document.getElementById('terminalOutput');
const terminalForm     = document.getElementById('terminalForm');
const terminalInput    = document.getElementById('terminalInput');
const linkCards        = document.querySelectorAll('.link-card');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile      = window.matchMedia('(max-width: 700px)').matches || 'ontouchstart' in window;

const LINKS = {
  portfolio: 'https://josebraz.cc',
  site:      'https://josebraz.cc',
  x:         'https://x.com/pixelbarz',
  twitter:   'https://x.com/pixelbarz',
  github:    'https://github.com/pixelbarz',
  twitch:    'https://www.twitch.tv/pixelbarz',
};

const FORTUNES = [
  'ablublé.',
  'esqueci o conselho de hoje.',
  'faça algo legal hoje, vc merece :P.',
  'ehehe sem conselho hoje.',
];

const terminalHistory = [];
let historyIdx        = -1;
let terminalReady     = false;
let matrixTimer       = null;
let sessionStart      = Date.now();

function revealPage() {
  if (!panel) return;
  if (reducedMotion) {
    panel.classList.add('revealed');
    linkCards.forEach(c => c.classList.add('revealed'));
    return;
  }
  setTimeout(() => panel.classList.add('revealed'), 60);
  linkCards.forEach((c, i) => {
    setTimeout(() => c.classList.add('revealed'), 260 + i * 90);
  });
}

function tickClock() {
  if (!clockEl) return;
  clockEl.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function setMusicPlaying(playing) {
  if (!musicToggle) return;
  musicToggle.classList.toggle('is-playing', playing);
  musicToggle.setAttribute('aria-pressed', String(playing));
  if (musicControl) musicControl.textContent = playing ? '❚❚' : '▶';
  if (mpEq) mpEq.classList.toggle('active', playing);
}

async function togglePlayback(mode) {
  if (!siteTrack) return { ok: false, msg: 'player indisponivel.' };
  const m = (mode || 'toggle').toLowerCase();
  const shouldPlay = m === 'on' ? true : m === 'off' ? false : siteTrack.paused;
  if (shouldPlay) {
    try {
      await siteTrack.play();
      return { ok: true, msg: 'tocando agora.' };
    } catch {
      setMusicPlaying(false);
      return { ok: false, msg: 'navegador bloqueou o audio. clique em qualquer lugar e tente novamente.' };
    }
  }
  siteTrack.pause();
  return { ok: true, msg: 'musica pausada.' };
}

function initMusic() {
  if (!musicToggle || !siteTrack) return;
  setMusicPlaying(false);
  musicToggle.addEventListener('click', () => void togglePlayback('toggle'));
  siteTrack.addEventListener('play',  () => setMusicPlaying(true));
  siteTrack.addEventListener('pause', () => { if (!siteTrack.ended) setMusicPlaying(false); });
  siteTrack.addEventListener('ended', () => { siteTrack.currentTime = 0; setMusicPlaying(false); });
}

function createSparkle(e) {
  if (reducedMotion) return;
  const x   = e.clientX ?? e.touches?.[0]?.clientX ?? window.innerWidth / 2;
  const y   = e.clientY ?? e.touches?.[0]?.clientY ?? window.innerHeight / 2;
  const sz  = 3 + Math.random() * 5;
  const ang = Math.random() * Math.PI * 2;
  const dst = 18 + Math.random() * 36;
  const el  = document.createElement('span');
  el.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:99999',
    `width:${sz}px`,
    `height:${sz}px`,
    'border-radius:50%',
    'background:#4D7AFF',
    `left:${x}px`,
    `top:${y}px`,
    'transform:translate(-50%,-50%)',
    'box-shadow:0 0 8px #2B5CE6',
    'transition:all 0.55s cubic-bezier(0.16,1,0.3,1)',
    'opacity:1',
  ].join(';');
  document.body.append(el);
  requestAnimationFrame(() => {
    el.style.transform = `translate(calc(-50% + ${Math.cos(ang) * dst}px), calc(-50% + ${Math.sin(ang) * dst}px)) scale(0)`;
    el.style.opacity   = '0';
  });
  setTimeout(() => el.remove(), 600);
}

document.addEventListener('click', e => createSparkle(e));

function openTerminal() {
  terminalOverlay.classList.add('is-open');
  terminalPopup.classList.add('is-open');
  terminalOverlay.setAttribute('aria-hidden', 'false');
  terminalPopup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!terminalReady) { bootTerminal(); terminalReady = true; }
  setTimeout(() => terminalInput && terminalInput.focus(), 320);
}

function closeTerminal() {
  terminalOverlay.classList.remove('is-open');
  terminalPopup.classList.remove('is-open');
  terminalOverlay.setAttribute('aria-hidden', 'true');
  terminalPopup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopMatrix();
}

terminalOpenBtn  && terminalOpenBtn.addEventListener('click', openTerminal);
terminalCloseBtn && terminalCloseBtn.addEventListener('click', closeTerminal);
terminalOverlay  && terminalOverlay.addEventListener('click', closeTerminal);

if (terminalCloseDot) {
  terminalCloseDot.addEventListener('click', closeTerminal);
  terminalCloseDot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeTerminal(); }
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && terminalPopup && terminalPopup.classList.contains('is-open')) closeTerminal();
});

function scrollBottom() {
  if (terminalOutput) terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function makeLine(text, cls) {
  const p = document.createElement('p');
  p.className = 't-line' + (cls ? ' ' + cls : '');
  p.textContent = text;
  return p;
}

function makeBlock(text, cls) {
  const pre = document.createElement('pre');
  pre.className = 't-block' + (cls ? ' ' + cls : '');
  pre.textContent = text;
  return pre;
}

function appendEntry(lines) {
  const entry = document.createElement('div');
  entry.className = 't-entry';
  lines.forEach(([txt, cls]) => entry.append(makeLine(txt, cls)));
  terminalOutput.append(entry);
  scrollBottom();
}

function appendCmdRow(rawCmd) {
  const entry = document.createElement('div');
  entry.className = 't-entry';
  const row = document.createElement('p');
  row.className = 't-cmd-row';
  const u  = document.createElement('span'); u.className = 'tp-user';   u.textContent = 'barz@linkboard';
  const s  = document.createElement('span'); s.className = 'tp-sep';    s.textContent = ':';
  const ph = document.createElement('span'); ph.className = 'tp-path';  ph.textContent = '~';
  const d  = document.createElement('span'); d.className = 'tp-dollar'; d.textContent = '$';
  const c  = document.createElement('span'); c.className = 't-cmd-text'; c.textContent = rawCmd;
  row.append(u, s, ph, d, c);
  entry.append(row);
  terminalOutput.append(entry);
  return entry;
}

function uptime() {
  const s = Math.floor((Date.now() - sessionStart) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${r}s` : `${r}s`;
}

function fastfetchText() {
  const song = siteTrack && !siteTrack.paused ? 'playing' : 'paused';
  return [
    ' ____  _          _ ',
    '|  _ \\(_)__  _____| |',
    '| |_) | \\ \\/ / _ \\ |',
    '|  __/| |>  <  __/ |',
    '|_|   |_/_/\\_\\___|_|',
    ' ____              ____',
    '| __ )  __ _ _ __|_  /',
    '|  _ \\ / _` | \'__|/ /',
    '| |_) | (_| | |  / /_',
    '|____/ \\__,_|_| /____|',
    '',
    `user   → barz@linkboard`,
    `os     → Pixel Linux 44`,
    `shell  → /bin/pixelsh`,
    `uptime → ${uptime()}`,
    `song   → ${song}`,
    `links  → 4 loaded`,
  ].join('\n');
}

function matrixFrame(rows, cols) {
  const chars = '01abcdef#$%*+-<>';
  let out = '';
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) line += chars[Math.floor(Math.random() * chars.length)];
    out += line + '\n';
  }
  return out.trimEnd();
}

function stopMatrix() {
  if (!matrixTimer) return;
  clearInterval(matrixTimer);
  matrixTimer = null;
}

function startMatrix(entry) {
  const block = makeBlock('', 'matrix');
  entry.append(block);
  let frame = 0;
  const limit = 40;
  const render = () => { block.textContent = matrixFrame(10, 42); scrollBottom(); };
  render();
  matrixTimer = setInterval(() => {
    frame++;
    render();
    if (frame >= limit) {
      stopMatrix();
      entry.append(makeLine('matrix encerrado.', 'muted'));
      scrollBottom();
    }
  }, 80);
}

async function runCmd(raw) {
  if (!raw.trim()) return;
  const parts   = raw.trim().split(/\s+/);
  const cmd     = parts[0].toLowerCase();
  const args    = parts.slice(1);

  if (cmd === 'clear') { stopMatrix(); terminalOutput.textContent = ''; return; }

  const entry = appendCmdRow(raw);

  switch (cmd) {
    case 'help':
      entry.append(makeLine('comandos disponíveis:', 'accent'));
      entry.append(makeLine('help  fastfetch  ls  open <nome|url>'));
      entry.append(makeLine('whoami  date  music [on|off]  clear'));
      entry.append(makeLine('easter: sudo  matrix  fortune  hack', 'muted'));
      break;

    case 'fastfetch':
    case 'neofetch':
      entry.append(makeBlock(fastfetchText()));
      break;

    case 'ls':
      entry.append(makeLine('portfolio  x  github  twitch', 'accent'));
      entry.append(makeLine('use: open github', 'muted'));
      break;

    case 'open': {
      if (!args.length) { entry.append(makeLine('uso: open <portfolio|x|github|twitch|url>')); break; }
      const target = args.join(' ').trim();
      const url    = LINKS[target.toLowerCase()] || (/^https?:\/\//i.test(target) ? target : '');
      if (!url) { entry.append(makeLine(`"${target}" nao encontrado. use "ls".`)); break; }
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      entry.append(makeLine(w ? `abrindo ${url}` : 'popup bloqueado pelo navegador.', w ? 'accent' : ''));
      break;
    }

    case 'whoami':
      entry.append(makeLine('Despite everything, its still you.'));
      break;

    case 'date':
      entry.append(makeLine(new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' })));
      break;

    case 'music': {
      const mode   = (args[0] || 'toggle').toLowerCase();
      if (!['toggle','on','off'].includes(mode)) { entry.append(makeLine('uso: music [on|off]')); break; }
      const result = await togglePlayback(mode);
      entry.append(makeLine(result.msg, result.ok ? 'accent' : ''));
      break;
    }

    case 'sudo':
      entry.append(makeLine('sudo: permissao negada. KKKKKKKKKKKK'));
      break;

    case 'matrix':
    case 'cmatrix':
      stopMatrix();
      entry.append(makeLine('bootando matrix...'));
      startMatrix(entry);
      break;

    case 'fortune':
      entry.append(makeLine(FORTUNES[Math.floor(Math.random() * FORTUNES.length)], 'muted'));
      break;

    case 'hack':
      entry.append(makeLine('iniciando protocolo ultra-secret...'));
      entry.append(makeLine('[##........] 23%'));
      entry.append(makeLine('[#####.....] 58%'));
      entry.append(makeLine('[##########] 100%'));
      entry.append(makeLine('ih negou aqui irmão pkkkkk.', 'accent'));
      break;

    default:
      entry.append(makeLine(`${parts[0]}: command not found`));
      entry.append(makeLine('digite "help" para listar comandos.', 'muted'));
  }

  scrollBottom();
}

async function typeInto(el, text, speed) {
  if (reducedMotion || isMobile) { el.textContent = text; return; }
  for (let i = 0; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    await new Promise(r => setTimeout(r, speed));
  }
}

async function bootTerminal() {
  const lines = [
    ['PixelShell 2.0 — inicializado.', 'accent'],
    ['digite "help" para listar os comandos.', 'muted'],
    ['dica: tente "fastfetch" ou "matrix".', 'muted'],
  ];
  const entry = document.createElement('div');
  entry.className = 't-entry';
  terminalOutput.append(entry);

  if (!reducedMotion && !isMobile) {
    for (const [text, cls] of lines) {
      const p = makeLine('', cls);
      entry.append(p);
      await typeInto(p, text, 16);
      scrollBottom();
      await new Promise(r => setTimeout(r, 100));
    }
  } else {
    lines.forEach(([text, cls]) => entry.append(makeLine(text, cls)));
    scrollBottom();
  }

  terminalForm.addEventListener('submit', e => {
    e.preventDefault();
    const val = terminalInput.value.trim();
    if (!val) return;
    terminalHistory.push(val);
    historyIdx = -1;
    terminalInput.value = '';
    void runCmd(val);
  });

  terminalInput.addEventListener('keydown', e => {
    if (!terminalHistory.length) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      historyIdx = historyIdx === -1 ? terminalHistory.length - 1 : Math.max(0, historyIdx - 1);
      terminalInput.value = terminalHistory[historyIdx];
      terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      historyIdx++;
      if (historyIdx >= terminalHistory.length) { historyIdx = -1; terminalInput.value = ''; return; }
      terminalInput.value = terminalHistory[historyIdx];
      terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
    }
  });

  terminalOutput.addEventListener('click', () => terminalInput.focus());
}

let wasPlayingBeforeHide = false;

document.addEventListener('visibilitychange', () => {
  if (!siteTrack) return;

  if (document.hidden) {
    wasPlayingBeforeHide = !siteTrack.paused;
    if (wasPlayingBeforeHide) siteTrack.pause();
  } else {
    if (wasPlayingBeforeHide) {
      siteTrack.play().catch(() => {
        setMusicPlaying(false);
      });
    }
  }
});

tickClock();
setInterval(tickClock, 30000);
initMusic();
revealPage();