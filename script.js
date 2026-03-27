const card = document.querySelector('.card');
const links = document.querySelectorAll('.link');
const clock = document.querySelector('#clock');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

revealLayout();
updateClock();
enableSpotlight();
window.setInterval(updateClock, 30000);
