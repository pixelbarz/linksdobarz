const app = document.getElementById("app");
const stage = document.getElementById("view-stage");
const transitionSwipe = document.getElementById("transitionSwipe");
const nav = document.querySelector(".section-nav");
const navLinks = [...document.querySelectorAll(".nav-item")];
const viewLinks = [...document.querySelectorAll("[data-view-link]")];
const views = [...document.querySelectorAll("[data-view]")];
const viewStatus = document.getElementById("viewStatus");

const track = document.getElementById("siteTrack");
const musicToggle = document.getElementById("musicToggle");
const musicPlayButton = document.getElementById("musicPlayButton");
const musicLabel = document.getElementById("musicLabel");
const playSymbol = document.getElementById("playSymbol");
const clock = document.getElementById("clock");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const viewNames = {
  home: "Início",
  socials: "Social",
  gaming: "Gaming",
  projects: "Projetos",
  about: "Sobre",
};

let currentView = "home";
let transitionTimer = null;

track.volume = 0.22;

function isValidView(id) {
  return Object.hasOwn(viewNames, id);
}

function updateNavigation(id) {
  const activeIndex = navLinks.findIndex((link) => link.dataset.viewLink === id);

  navLinks.forEach((link, index) => {
    const selected = link.dataset.viewLink === id;
    link.classList.toggle("is-active", selected);
    if (selected) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }

    if (selected) link.style.setProperty("--active-index", index);
  });

  nav.style.setProperty("--nav-y", `${(activeIndex - 2) * 55}px`);
  viewStatus.textContent = viewNames[id];
  document.title = `pixelbarz | ${viewNames[id]}`;
}

function prepareView(view, active) {
  view.classList.toggle("is-active", active);
  view.setAttribute("aria-hidden", String(!active));
  view.inert = !active;
  view.scrollTop = 0;
}

function showViewImmediately(id) {
  views.forEach((view) => prepareView(view, view.dataset.view === id));
  currentView = id;
  updateNavigation(id);
}

function runTransitionLayer() {
  transitionSwipe.classList.remove("is-moving");
  void transitionSwipe.offsetWidth;
  transitionSwipe.classList.add("is-moving");
}

function showView(id) {
  if (!isValidView(id) || id === currentView) return;

  window.clearTimeout(transitionTimer);

  const outgoing = document.querySelector(`[data-view="${currentView}"]`);
  const incoming = document.querySelector(`[data-view="${id}"]`);
  const instant = reduceMotion.matches;

  views.forEach((view) => {
    view.classList.remove("is-leaving", "is-entering");
    if (view !== outgoing) prepareView(view, false);
  });

  updateNavigation(id);
  currentView = id;

  if (instant) {
    views.forEach((view) => prepareView(view, view === incoming));
    return;
  }

  runTransitionLayer();
  outgoing.classList.add("is-leaving");
  outgoing.setAttribute("aria-hidden", "true");
  outgoing.inert = true;

  incoming.classList.add("is-active", "is-entering");
  incoming.setAttribute("aria-hidden", "false");
  incoming.inert = false;
  incoming.scrollTop = 0;

  transitionTimer = window.setTimeout(() => {
    outgoing.classList.remove("is-active", "is-leaving");
    incoming.classList.remove("is-entering");
    transitionSwipe.classList.remove("is-moving");
  }, 570);
}

function navigateTo(id, replace = false) {
  if (!isValidView(id)) return;

  const url = `${window.location.pathname}${window.location.search}#${id}`;
  if (replace) {
    history.replaceState({ view: id }, "", url);
  } else if (id !== currentView) {
    history.pushState({ view: id }, "", url);
  }

  showView(id);
}

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(link.dataset.viewLink);
  });
});

navLinks.forEach((link, index) => {
  link.addEventListener("keydown", (event) => {
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";

    if (!forward && !backward && event.key !== "Home" && event.key !== "End") return;

    event.preventDefault();

    let nextIndex = index;
    if (forward) nextIndex = (index + 1) % navLinks.length;
    if (backward) nextIndex = (index - 1 + navLinks.length) % navLinks.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = navLinks.length - 1;

    navLinks[nextIndex].focus();
  });
});

window.addEventListener("popstate", () => {
  const id = window.location.hash.slice(1);
  showView(isValidView(id) ? id : "home");
});

window.addEventListener("hashchange", () => {
  const id = window.location.hash.slice(1);
  showView(isValidView(id) ? id : "home");
});

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function syncPlayer() {
  const playing = !track.paused;
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicLabel.textContent = playing ? "pausar faixa" : "ouvir faixa";
  playSymbol.textContent = playing ? "Ⅱ" : "▶";
  musicPlayButton.setAttribute(
    "aria-label",
    playing ? "Pausar Full Moon Full Life" : "Tocar Full Moon Full Life",
  );
}

async function toggleTrack() {
  if (track.paused) {
    try {
      await track.play();
    } catch {
      syncPlayer();
    }
  } else {
    track.pause();
  }
}

musicToggle.addEventListener("click", toggleTrack);
musicPlayButton.addEventListener("click", toggleTrack);
track.addEventListener("play", syncPlayer);
track.addEventListener("pause", syncPlayer);
track.addEventListener("ended", syncPlayer);

const initialHash = window.location.hash.slice(1);
const initialView = isValidView(initialHash) ? initialHash : "home";

try {
  localStorage.setItem("pixelbarz-intro-seen", "true");
} catch {
  // The experience still works when storage is unavailable.
}

showViewImmediately(initialView);
navigateTo(initialView, true);
updateClock();
syncPlayer();

window.setInterval(updateClock, 30000);
requestAnimationFrame(() => document.body.classList.add("is-ready"));
