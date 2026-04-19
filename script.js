const card = document.querySelector('#card');
const links = document.querySelectorAll('.link');
const clock = document.querySelector('#clock');
const musicToggle = document.querySelector('#musicToggle');
const musicControl = document.querySelector('#musicControl');
const siteTrack = document.querySelector('#siteTrack');
const statusDot = document.querySelector('#statusDot');
const terminalOverlay = document.querySelector('#terminalOverlay');
const terminalPopup = document.querySelector('#terminalPopup');
const terminalOpenBtn = document.querySelector('#terminalOpenBtn');
const terminalCloseBtn = document.querySelector('#terminalCloseBtn');
const terminalCloseDot = document.querySelector('#terminalCloseDot');
const terminalOutput = document.querySelector('#terminalOutput');
const terminalForm = document.querySelector('#terminalForm');
const terminalInput = document.querySelector('#terminalInput');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const terminalLinks = {
  portfolio: 'https://josebraz.cc',
  site: 'https://josebraz.cc',
  x: 'https://x.com/pixelbarz',
  twitter: 'https://x.com/pixelbarz',
  github: 'https://github.com/pixelbarz',
  twitch: 'https://www.twitch.tv/pixelbarz'
};

const terminalFortunes = [
  'ablublé.',
  'esqueci o conselho de hoje.',
  'faça algo legal hoje, vc merece :P.',
  'ehehe sem conselho hoje.'
];

const terminalHistory = [];
let terminalHistoryIndex = -1;
const sessionStartedAt = Date.now();
let matrixIntervalId = null;
let terminalInitialized = false;

function revealLayout() {
  if (!card) return;
  if (reduceMotion) {
    card.classList.add('reveal');
    links.forEach(l => l.classList.add('reveal'));
    return;
  }
  setTimeout(() => card.classList.add('reveal'), 80);
  links.forEach((link, i) => {
    setTimeout(() => link.classList.add('reveal'), 280 + i * 100);
  });
}

function updateClock() {
  if (!clock) return;
  clock.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function enableSpotlight() {
  if (!card || reduceMotion) return;
  const inner = card.querySelector('.card-inner');
  card.addEventListener('pointermove', e => {
    const rect = inner.getBoundingClientRect();
    inner.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    inner.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  });
  card.addEventListener('pointerleave', () => {
    inner.style.setProperty('--mx', '50%');
    inner.style.setProperty('--my', '50%');
  });
}

function setMusicState(isPlaying) {
  if (!musicToggle) return;
  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  if (musicControl) musicControl.textContent = isPlaying ? '❚❚' : '▶';
  if (statusDot) statusDot.style.display = isPlaying ? 'inline-block' : 'none';
}

async function setTrackPlayback(mode = 'toggle') {
  if (!siteTrack) return { ok: false, message: 'player indisponivel.' };
  const norm = mode.toLowerCase();
  const shouldPlay = norm === 'on' ? true : norm === 'off' ? false : siteTrack.paused;
  if (shouldPlay) {
    try {
      await siteTrack.play();
      return { ok: true, message: 'tocando agora.' };
    } catch (_) {
      setMusicState(false);
      return { ok: false, message: 'nao consegui tocar. navegador bloqueou o audio.' };
    }
  }
  siteTrack.pause();
  return { ok: true, message: 'musica pausada.' };
}

function enableMusicToggle() {
  if (!musicToggle || !siteTrack) return;
  setMusicState(false);
  musicToggle.addEventListener('click', () => void setTrackPlayback('toggle'));
  siteTrack.addEventListener('play', () => setMusicState(true));
  siteTrack.addEventListener('pause', () => { if (!siteTrack.ended) setMusicState(false); });
  siteTrack.addEventListener('ended', () => { siteTrack.currentTime = 0; setMusicState(false); });
}

function openTerminal() {
  terminalOverlay.classList.add('is-open');
  terminalPopup.classList.add('is-open');
  terminalOverlay.setAttribute('aria-hidden', 'false');
  terminalPopup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (!terminalInitialized) {
    initTerminal();
    terminalInitialized = true;
  }
  setTimeout(() => terminalInput && terminalInput.focus(), 350);
}

function closeTerminal() {
  terminalOverlay.classList.remove('is-open');
  terminalPopup.classList.remove('is-open');
  terminalOverlay.setAttribute('aria-hidden', 'true');
  terminalPopup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopMatrixAnimation();
}

terminalOpenBtn && terminalOpenBtn.addEventListener('click', openTerminal);
terminalCloseBtn && terminalCloseBtn.addEventListener('click', closeTerminal);
terminalCloseDot && terminalCloseDot.addEventListener('click', closeTerminal);
terminalCloseDot && terminalCloseDot.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeTerminal(); }
});
terminalOverlay && terminalOverlay.addEventListener('click', closeTerminal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && terminalPopup && terminalPopup.classList.contains('is-open')) closeTerminal();
});

function scrollTerminalToBottom() {
  if (terminalOutput) terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function appendOutputLine(parent, text, tone = '') {
  const line = document.createElement('p');
  line.className = 'terminal-output-line' + (tone ? ' ' + tone : '');
  line.textContent = text;
  parent.append(line);
}

function appendOutputBlock(parent, text) {
  const block = document.createElement('pre');
  block.className = 'terminal-output-block';
  block.textContent = text;
  parent.append(block);
  return block;
}

function appendSystemMessage(lines) {
  if (!terminalOutput) return;
  const entry = document.createElement('div');
  entry.className = 'terminal-entry';
  lines.forEach((line, i) => appendOutputLine(entry, line, i === 0 ? 'is-accent' : 'is-muted'));
  terminalOutput.append(entry);
  scrollTerminalToBottom();
}

function appendCommandEntry(commandText) {
  if (!terminalOutput) return null;
  const entry = document.createElement('div');
  entry.className = 'terminal-entry';
  const row = document.createElement('p');
  row.className = 'terminal-command-row';
  const user = document.createElement('span');
  user.className = 'terminal-user';
  user.textContent = 'barz@linkboard';
  const path = document.createElement('span');
  path.className = 'terminal-path';
  path.textContent = '~';
  const cmd = document.createElement('span');
  cmd.className = 'terminal-command';
  cmd.textContent = commandText;
  row.append(user, ':', path, '$ ', cmd);
  entry.append(row);
  terminalOutput.append(entry);
  return entry;
}

function formatUptime(start) {
  const s = Math.floor((Date.now() - start) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function buildFastfetchText() {
  const songState = siteTrack && !siteTrack.paused ? 'playing' : 'paused';
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
    'user   → barz@linkboard',
    'os     → Pixel Linux 43',
    'shell  → /bin/pixelsh',
    `uptime → ${formatUptime(sessionStartedAt)}`,
    `song   → ${songState}`,
    'links  → 4 loaded',
  ].join('\n');
}

function buildMatrixBlock(rows = 10, cols = 42) {
  const chars = '01abcdef#$%*+-<>';
  let out = '';
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) line += chars[Math.floor(Math.random() * chars.length)];
    out += line + '\n';
  }
  return out.trimEnd();
}

function stopMatrixAnimation() {
  if (!matrixIntervalId) return;
  clearInterval(matrixIntervalId);
  matrixIntervalId = null;
}

function startMatrixAnimation(entry) {
  const block = appendOutputBlock(entry, '');
  block.classList.add('is-matrix');
  const limit = 40;
  let frame = 0;
  const render = () => { block.textContent = buildMatrixBlock(); scrollTerminalToBottom(); };
  render();
  matrixIntervalId = setInterval(() => {
    frame++;
    render();
    if (frame >= limit) {
      stopMatrixAnimation();
      appendOutputLine(entry, 'matrix encerrado.', 'is-muted');
      scrollTerminalToBottom();
    }
  }, 80);
}

async function runTerminalCommand(rawValue) {
  if (!terminalOutput) return;
  const commandLine = rawValue.trim();
  if (!commandLine) return;
  const [rawCmd, ...args] = commandLine.split(/\s+/);
  const command = rawCmd.toLowerCase();

  if (command === 'clear') {
    stopMatrixAnimation();
    terminalOutput.textContent = '';
    return;
  }

  const entry = appendCommandEntry(commandLine);
  if (!entry) return;

  switch (command) {
    case 'help':
      appendOutputLine(entry, 'comandos disponíveis:', 'is-accent');
      appendOutputLine(entry, 'help  fastfetch  ls  open <nome|url>');
      appendOutputLine(entry, 'whoami  date  music [on|off]  clear');
      appendOutputLine(entry, 'easter: sudo  matrix  fortune  hack', 'is-muted');
      break;
    case 'fastfetch':
    case 'neofetch':
      appendOutputBlock(entry, buildFastfetchText());
      break;
    case 'ls':
      appendOutputLine(entry, 'portfolio  x  github  twitch', 'is-accent');
      appendOutputLine(entry, 'use: open github', 'is-muted');
      break;
    case 'open': {
      if (!args.length) { appendOutputLine(entry, 'uso: open <portfolio|x|github|twitch|url>'); break; }
      const target = args.join(' ').trim();
      const url = terminalLinks[target.toLowerCase()] || (/^https?:\/\//i.test(target) ? target : '');
      if (!url) { appendOutputLine(entry, `"${target}" nao encontrado. use "ls".`); break; }
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      appendOutputLine(entry, w ? `abrindo ${url}` : 'popup bloqueado pelo navegador.', w ? 'is-accent' : '');
      break;
    }
    case 'whoami':
      appendOutputLine(entry, 'Despite everything, its still you.');
      break;
    case 'date':
      appendOutputLine(entry, new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' }));
      break;
    case 'music': {
      const mode = args[0] ? args[0].toLowerCase() : 'toggle';
      if (!['toggle', 'on', 'off'].includes(mode)) { appendOutputLine(entry, 'uso: music [on|off]'); break; }
      const result = await setTrackPlayback(mode);
      appendOutputLine(entry, result.message, result.ok ? 'is-accent' : '');
      break;
    }
    case 'sudo':
      appendOutputLine(entry, 'sudo: permissao negada. KKKKKKKKKKKK');
      break;
    case 'matrix':
    case 'cmatrix':
      stopMatrixAnimation();
      appendOutputLine(entry, 'bootando matrix...');
      startMatrixAnimation(entry);
      break;
    case 'fortune':
      appendOutputLine(entry, terminalFortunes[Math.floor(Math.random() * terminalFortunes.length)], 'is-muted');
      break;
    case 'hack':
      appendOutputLine(entry, 'iniciando protocolo ultra-secret...');
      appendOutputLine(entry, '[##........] 23%');
      appendOutputLine(entry, '[#####.....] 58%');
      appendOutputLine(entry, '[##########] 100%');
      appendOutputLine(entry, 'ih negou aqui irmão pkkkkk.', 'is-accent');
      break;
    default:
      appendOutputLine(entry, `${rawCmd}: command not found`);
      appendOutputLine(entry, 'digite "help" para listar comandos.', 'is-muted');
  }

  scrollTerminalToBottom();
}

function handleTerminalHistory(direction) {
  if (!terminalInput || !terminalHistory.length) return;
  if (direction === 'up') {
    terminalHistoryIndex = terminalHistoryIndex === -1
      ? terminalHistory.length - 1
      : Math.max(0, terminalHistoryIndex - 1);
  } else {
    if (terminalHistoryIndex === -1) return;
    terminalHistoryIndex++;
    if (terminalHistoryIndex >= terminalHistory.length) {
      terminalHistoryIndex = -1;
      terminalInput.value = '';
      return;
    }
  }
  terminalInput.value = terminalHistory[terminalHistoryIndex];
  terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
}

function initTerminal() {
  appendSystemMessage([
    'PixelShell 2.0 — inicializado.',
    'digite "help" para listar os comandos.',
    'dica: tente "fastfetch" ou "matrix".'
  ]);

  terminalForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = terminalInput.value.trim();
    if (!value) return;
    terminalHistory.push(value);
    terminalHistoryIndex = -1;
    terminalInput.value = '';
    void runTerminalCommand(value);
  });

  terminalInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { e.preventDefault(); handleTerminalHistory('up'); }
    if (e.key === 'ArrowDown') { e.preventDefault(); handleTerminalHistory('down'); }
  });

  terminalOutput.addEventListener('click', () => terminalInput.focus());
}

revealLayout();
updateClock();
enableSpotlight();
enableMusicToggle();
setInterval(updateClock, 30000);