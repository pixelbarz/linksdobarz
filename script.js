const destinations = document.querySelectorAll('.destination');
const siteShell = document.getElementById('siteShell');
const activeNumber = document.getElementById('activeNumber');
const activeCode = document.getElementById('activeCode');
const activeTitle = document.getElementById('activeTitle');
const activeDetail = document.getElementById('activeDetail');
const clock = document.getElementById('clock');
const track = document.getElementById('siteTrack');
const musicToggle = document.getElementById('musicToggle');
const musicPlayButton = document.getElementById('musicPlayButton');
const musicLabel = document.getElementById('musicLabel');
const playSymbol = document.getElementById('playSymbol');

track.volume = 0.22;

function selectDestination(link) {
  destinations.forEach((item) => item.classList.toggle('is-active', item === link));
  activeNumber.textContent = link.dataset.number;
  activeCode.textContent = link.dataset.code;
  activeTitle.textContent = link.dataset.title;
  activeDetail.textContent = link.dataset.detail;
  siteShell.dataset.active = link.dataset.code.toLowerCase();
}
destinations.forEach((link) => {
  link.addEventListener('mouseenter', () => selectDestination(link));
  link.addEventListener('focus', () => selectDestination(link));
  link.addEventListener('click', () => selectDestination(link));
});
function updateClock() { clock.textContent = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function syncPlayer() {
  const playing = !track.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicLabel.textContent = playing ? 'pausar faixa' : 'ouvir faixa';
  playSymbol.textContent = playing ? 'Ⅱ' : '▶';
}
async function toggleTrack() {
  if (track.paused) { try { await track.play(); } catch { } } else { track.pause(); }
}
musicToggle.addEventListener('click', toggleTrack);
musicPlayButton.addEventListener('click', toggleTrack);
track.addEventListener('play', syncPlayer);
track.addEventListener('pause', syncPlayer);
track.addEventListener('ended', syncPlayer);
updateClock(); setInterval(updateClock, 30000); syncPlayer();
