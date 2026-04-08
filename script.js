const card = document.querySelector('.card');
const links = document.querySelectorAll('.link');
const clock = document.querySelector('#clock');
const musicToggle = document.querySelector('#musicToggle');
const musicControl = document.querySelector('#musicControl');
const siteTrack = document.querySelector('#siteTrack');
const tabButtons = document.querySelectorAll('.panel-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
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

function revealLayout() {
  if (!card) {
    return;
  }

  card.classList.remove('reveal');
  links.forEach((link) => link.classList.remove('reveal'));

  if (reduceMotion) {
    card.classList.add('reveal');
    links.forEach((link) => link.classList.add('reveal'));
    return;
  }

  window.setTimeout(() => {
    card.classList.add('reveal');
  }, 70);

  links.forEach((link, index) => {
    window.setTimeout(() => {
      link.classList.add('reveal');
    }, 180 + index * 90);
  });
}

function updateClock() {
  if (!clock) {
    return;
  }

  const now = new Date();
  clock.textContent = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function enableSpotlight() {
  if (!card || reduceMotion) {
    return;
  }

  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  });
}

function setMusicState(isPlaying) {
  if (!musicToggle || !musicControl) {
    return;
  }

  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicControl.textContent = isPlaying ? '❚❚' : '▶';
}

async function setTrackPlayback(mode = 'toggle') {
  if (!siteTrack) {
    return {
      ok: false,
      message: 'player de musica indisponivel.'
    };
  }

  const normalizedMode = mode.toLowerCase();
  const shouldPlay = normalizedMode === 'on' ? true : normalizedMode === 'off' ? false : siteTrack.paused;

  if (shouldPlay) {
    try {
      await siteTrack.play();
      return {
        ok: true,
        message: 'tocando agora.'
      };
    } catch (_) {
      setMusicState(false);
      return {
        ok: false,
        message: 'nao consegui tocar. talvez o navegador bloqueou o audio.'
      };
    }
  }

  siteTrack.pause();
  return {
    ok: true,
    message: 'musica pausada.'
  };
}

function enableMusicToggle() {
  if (!musicToggle || !musicControl || !siteTrack) {
    return;
  }

  setMusicState(false);

  musicToggle.addEventListener('click', () => {
    void setTrackPlayback('toggle');
  });

  siteTrack.addEventListener('play', () => {
    setMusicState(true);
  });

  siteTrack.addEventListener('pause', () => {
    if (!siteTrack.ended) {
      setMusicState(false);
    }
  });

  siteTrack.addEventListener('ended', () => {
    siteTrack.currentTime = 0;
    setMusicState(false);
  });
}

function setActiveTab(targetPanelId, options = {}) {
  if (!targetPanelId) {
    return;
  }

  const activePanel = Array.from(tabPanels).find((panel) => !panel.hidden);
  const activePanelId = activePanel ? activePanel.id : '';

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === targetPanelId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === targetPanelId;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });

  if (activePanelId === 'terminalTabPanel' && targetPanelId !== 'terminalTabPanel') {
    clearTerminalSession();
  }

  if (options.focusTerminal && targetPanelId === 'terminalTabPanel' && terminalInput) {
    terminalInput.focus();
  }
}

function clearTerminalSession() {
  if (!terminalOutput) {
    return;
  }

  stopMatrixAnimation();
  terminalOutput.textContent = '';
  terminalHistory.length = 0;
  terminalHistoryIndex = -1;

  if (terminalInput) {
    terminalInput.value = '';
  }
}

function enablePanelTabs() {
  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      setActiveTab(button.dataset.tabTarget, {
        focusTerminal: button.dataset.tabTarget === 'terminalTabPanel'
      });
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
      }

      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
      const nextButton = tabButtons[nextIndex];

      setActiveTab(nextButton.dataset.tabTarget, {
        focusTerminal: nextButton.dataset.tabTarget === 'terminalTabPanel'
      });
      nextButton.focus();
    });
  });
}

function scrollTerminalToBottom() {
  if (!terminalOutput) {
    return;
  }

  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function appendOutputLine(parent, text, tone = '') {
  const line = document.createElement('p');
  line.className = 'terminal-output-line';
  if (tone) {
    line.classList.add(tone);
  }
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
  if (!terminalOutput) {
    return;
  }

  const entry = document.createElement('div');
  entry.className = 'terminal-entry';
  lines.forEach((line, index) => {
    appendOutputLine(entry, line, index === 0 ? 'is-accent' : 'is-muted');
  });

  terminalOutput.append(entry);
  scrollTerminalToBottom();
}

function appendCommandEntry(commandText) {
  if (!terminalOutput) {
    return null;
  }

  const entry = document.createElement('div');
  entry.className = 'terminal-entry';

  const commandRow = document.createElement('p');
  commandRow.className = 'terminal-command-row';

  const user = document.createElement('span');
  user.className = 'terminal-user';
  user.textContent = 'barz@linkboard';

  const path = document.createElement('span');
  path.className = 'terminal-path';
  path.textContent = '~';

  const command = document.createElement('span');
  command.className = 'terminal-command';
  command.textContent = commandText;

  commandRow.append(user, ':', path, '$ ', command);
  entry.append(commandRow);
  terminalOutput.append(entry);

  return entry;
}

function formatUptime(startTimestamp) {
  const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function buildFastfetchText() {
  const currentTime = new Date().toLocaleString('pt-BR', {
    hour12: false
  });
  const songState = siteTrack && !siteTrack.paused ? 'playing' : 'paused';

  return [
    ' ____  _          _ ',
    '|  _ \\(_)__  _____| |',
    "| |_) | \\ \\/ / _ \\ |",
    '|  __/| |>  <  __/ |',
    '|_|   |_/_/\\_\\___|_|',
    ' ____              ____',
    '| __ )  __ _ _ __|_  /',
    "|  _ \\ / _` | '__|/ /",
    '| |_) | (_| | |  / /_',
    '|____/ \\__,_|_| /____|',
    '',
    'user: barz@linkboard',
    'os: Pixel Linux 43',
    'kernel: Linux 6.19.10',
    'shell: /bin/pixelsh',
    `uptime: ${formatUptime(sessionStartedAt)}`,
    `song: ${songState}`,
    'links: 4 loaded',
    `time: ${currentTime}`
  ].join('\n');
}

function buildMatrixBlock(rows = 8, columns = 34) {
  const chars = '01abcdef#$%*+-';
  let output = '';

  for (let row = 0; row < rows; row += 1) {
    let line = '';
    for (let col = 0; col < columns; col += 1) {
      line += chars[Math.floor(Math.random() * chars.length)];
    }
    output += `${line}\n`;
  }

  return output.trimEnd();
}

function stopMatrixAnimation() {
  if (!matrixIntervalId) {
    return;
  }

  window.clearInterval(matrixIntervalId);
  matrixIntervalId = null;
}

function startMatrixAnimation(entry) {
  const block = appendOutputBlock(entry, '');
  block.classList.add('is-matrix');

  const framesLimit = 36;
  let frame = 0;

  const render = () => {
    block.textContent = buildMatrixBlock(10, 38);
    scrollTerminalToBottom();
  };

  render();
  matrixIntervalId = window.setInterval(() => {
    frame += 1;
    render();

    if (frame >= framesLimit) {
      stopMatrixAnimation();
      appendOutputLine(entry, 'matrix encerrado. rode "matrix" novamente.', 'is-muted');
      scrollTerminalToBottom();
    }
  }, 90);
}

function getFortune() {
  const index = Math.floor(Math.random() * terminalFortunes.length);
  return terminalFortunes[index];
}

async function runTerminalCommand(rawValue) {
  if (!terminalOutput) {
    return;
  }

  const commandLine = rawValue.trim();
  if (!commandLine) {
    return;
  }

  const [rawCommand, ...args] = commandLine.split(/\s+/);
  const command = rawCommand.toLowerCase();

  if (command === 'clear') {
    stopMatrixAnimation();
    terminalOutput.textContent = '';
    return;
  }

  const entry = appendCommandEntry(commandLine);
  if (!entry) {
    return;
  }

  switch (command) {
    case 'help':
      appendOutputLine(entry, 'comandos:', 'is-accent');
      appendOutputLine(entry, 'help | fastfetch | ls | open <nome|url>');
      appendOutputLine(entry, 'whoami | date | music [on|off] | clear');
      appendOutputLine(entry, 'easter eggs: sudo, matrix, cmatrix, fortune, hack', 'is-muted');
      break;
    case 'fastfetch':
    case 'neofetch':
      appendOutputBlock(entry, buildFastfetchText());
      break;
    case 'ls':
      appendOutputLine(entry, 'portfolio  x  github  twitch', 'is-accent');
      appendOutputLine(entry, 'dica: use "open github"', 'is-muted');
      break;
    case 'open': {
      if (!args.length) {
        appendOutputLine(entry, 'uso: open <portfolio|x|github|twitch|url>');
        break;
      }

      const target = args.join(' ').trim();
      const alias = target.toLowerCase();
      const url = terminalLinks[alias] || (/^https?:\/\//i.test(target) ? target : '');

      if (!url) {
        appendOutputLine(entry, `link "${target}" nao encontrado. use "ls".`);
        break;
      }

      const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (openedWindow) {
        appendOutputLine(entry, `abrindo ${url}`, 'is-accent');
      } else {
        appendOutputLine(entry, 'popup bloqueado pelo navegador.');
      }
      break;
    }
    case 'whoami':
      appendOutputLine(entry, 'Despite everything, its still you.');
      break;
    case 'date':
      appendOutputLine(entry, new Date().toLocaleString('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'medium'
      }));
      break;
    case 'music': {
      const mode = args[0] ? args[0].toLowerCase() : 'toggle';
      if (!['toggle', 'on', 'off'].includes(mode)) {
        appendOutputLine(entry, 'uso: music [on|off]');
        break;
      }
      const result = await setTrackPlayback(mode);
      appendOutputLine(entry, result.message, result.ok ? 'is-accent' : '');
      break;
    }
    case 'sudo':
      appendOutputLine(entry, 'sudo: permissao negada. KKKKKKKKKKKKKKKKKKKK');
      break;
    case 'matrix':
    case 'cmatrix':
      stopMatrixAnimation();
      appendOutputLine(entry, 'bootando matrix...');
      startMatrixAnimation(entry);
      break;
    case 'fortune':
      appendOutputLine(entry, getFortune(), 'is-muted');
      break;
    case 'hack':
      appendOutputLine(entry, 'iniciando protocolo ultra-secret... WOAH');
      appendOutputLine(entry, '[##........] 23%');
      appendOutputLine(entry, '[#####.....] 58%');
      appendOutputLine(entry, '[##########] 100%');
      appendOutputLine(entry, 'ih negou aqui, vai entrar nao pokkkkkk.', 'is-accent');
      break;
    default:
      appendOutputLine(entry, `${rawCommand}: command not found`);
      appendOutputLine(entry, 'digite "help" para ver os comandos.', 'is-muted');
      break;
  }

  scrollTerminalToBottom();
}

function handleTerminalHistory(direction) {
  if (!terminalInput || !terminalHistory.length) {
    return;
  }

  if (direction === 'up') {
    if (terminalHistoryIndex === -1) {
      terminalHistoryIndex = terminalHistory.length - 1;
    } else {
      terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
    }
  }

  if (direction === 'down') {
    if (terminalHistoryIndex === -1) {
      return;
    }
    terminalHistoryIndex += 1;
    if (terminalHistoryIndex >= terminalHistory.length) {
      terminalHistoryIndex = -1;
      terminalInput.value = '';
      return;
    }
  }

  if (terminalHistoryIndex >= 0) {
    terminalInput.value = terminalHistory[terminalHistoryIndex];
    terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
  }
}

function enableTerminal() {
  if (!terminalForm || !terminalInput || !terminalOutput) {
    return;
  }

  appendSystemMessage([
    'PixelShell 1.0 inicializado.',
    'digite "help" para listar os comandos.',
    'dica: tente "fastfetch".'
  ]);

  terminalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = terminalInput.value.trim();
    if (!value) {
      return;
    }

    terminalHistory.push(value);
    terminalHistoryIndex = -1;
    terminalInput.value = '';
    void runTerminalCommand(value);
  });

  terminalInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleTerminalHistory('up');
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleTerminalHistory('down');
    }
  });

  terminalOutput.addEventListener('click', () => {
    terminalInput.focus();
  });
}

revealLayout();
updateClock();
enableSpotlight();
enableMusicToggle();
enablePanelTabs();
enableTerminal();
window.setInterval(updateClock, 30000);
