"use strict";
const pages = [
  { id: "capa", title: "Capa do Mapa Didático", page: 1 },
  { id: "organiza", title: "Como os livros se organizam", page: 2 },
  { id: "genesis", title: "Gênesis: o livro das origens", page: 3 },
  { id: "capitulos", title: "Gênesis capítulo a capítulo", page: 4 },
  { id: "exodo", title: "Êxodo: da opressão à aliança", page: 6 },
  { id: "rute", title: "Rute: lealdade e recomeço", page: 21 },
  { id: "ester", title: "Ester: coragem na corte persa", page: 42 },
  { id: "salmos", title: "Salmos: oração em muitas vozes", page: 47 },
  { id: "proverbios", title: "Provérbios: sabedoria para o dia a dia", page: 54 },
  { id: "daniel", title: "Daniel: fidelidade no exílio", page: 73 },
  { id: "novo-testamento", title: "Como se organiza o Novo Testamento", page: 99 },
  { id: "mateus", title: "Mateus e o Reino", page: 100 },
  { id: "joao", title: "João: sinais para crer e viver", page: 106 },
  { id: "atos", title: "Atos: o testemunho se espalha", page: 108 },
  { id: "apocalipse", title: "Apocalipse capítulo a capítulo", page: 153 },
  { id: "simbolos", title: "Apocalipse: personagens e símbolos", page: 155 }
];
const wrapPage = value => (value + pages.length) % pages.length;
const pagePosition = id => pages.findIndex(item => item.id === id);
const pageAsset = (item, preview = false) => "assets/mapa-" + item.id + (preview ? "-mini" : "") + ".webp";
const pageFolio = item => item.id === "capa" ? "Capa" : "Pág. " + String(item.page).padStart(2, "0");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const captions = {
  book: "No papel, os mapas podem ser impressos e organizados lado a lado. Esta é uma simulação de como ficariam em um livro.",
  tablet: "No tablet, você pode ampliar o mapa com um gesto e consultar os detalhes das passagens.",
  phone: "No celular, amplie o trecho que quer ler ou gire a tela para ver a página na horizontal.",
  computer: "No computador, consulte o PDF em uma tela maior enquanto acompanha a leitura bíblica."
};
const stage = document.getElementById("device-stage");
const formatCaption = document.getElementById("format-caption");
const formats = Array.from(document.querySelectorAll("button[data-format]"));
formats.forEach(button => {
  button.addEventListener("click", () => {
    const format = button.dataset.format;
    if (!(format in captions)) return;
    stage.dataset.format = format;
    formatCaption.textContent = captions[format];
    formats.forEach(option => option.setAttribute("aria-pressed", String(option === button)));
  });
});
const viewer = document.getElementById("viewer");
const image = document.getElementById("viewer-image");
const title = document.getElementById("viewer-title");
const count = document.getElementById("viewer-count");
const canvas = document.getElementById("viewer-canvas");
const zoom = document.getElementById("zoom-page");
const close = document.getElementById("close-viewer");
let index = 0;
let trigger;
function resetZoom() {
  canvas.classList.remove("is-zoomed");
  zoom.setAttribute("aria-pressed", "false");
  zoom.firstChild.textContent = "Ampliar ";
  canvas.scrollTo(0, 0);
}
function showPage(next) {
  index = wrapPage(next);
  const item = pages[index];
  image.src = pageAsset(item);
  image.alt = item.title + ", página " + item.page + " do Mapa Didático da Bíblia";
  title.textContent = item.title;
  count.textContent = (index + 1) + " de " + pages.length + " · p. " + item.page;
  resetZoom();
}
function openPage(next, button) {
  if (next < 0) return;
  trigger = button;
  showPage(next);
  if (!viewer.open) {
    viewer.showModal();
    viewer.dispatchEvent(new Event("preview-open"));
  }
  document.body.classList.add("modal-open");
  close.focus();
}
document.querySelectorAll("[data-preview]").forEach(button => button.addEventListener("click", () => {
  openPage(pagePosition(button.dataset.preview), button);
}));
close.addEventListener("click", () => viewer.close());
document.getElementById("prev-page").addEventListener("click", () => showPage(index - 1));
document.getElementById("next-page").addEventListener("click", () => showPage(index + 1));
zoom.addEventListener("click", () => {
  const enlarged = canvas.classList.toggle("is-zoomed");
  zoom.setAttribute("aria-pressed", String(enlarged));
  zoom.firstChild.textContent = enlarged ? "Reduzir " : "Ampliar ";
});
viewer.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (trigger) trigger.focus({ preventScroll: true });
});
viewer.addEventListener("click", event => {
  if (event.target === viewer) viewer.close();
});
viewer.addEventListener("keydown", event => {
  if (event.target === canvas && canvas.classList.contains("is-zoomed")) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showPage(index + (event.key === "ArrowLeft" ? -1 : 1));
  }
});

const preparedPages = new Map();
function preparePage(item) {
  const src = pageAsset(item, true);
  if (!preparedPages.has(src)) {
    const preview = new Image();
    preview.src = src;
    preparedPages.set(src, preview.decode().then(() => src, () => {
      preparedPages.delete(src);
      return "";
    }));
  }
  return preparedPages.get(src);
}

function createFlipbook(book) {
  const object = book.querySelector(".book-object");
  const sheet = book.querySelector(".book-sheet");
  const front = book.querySelector("[data-flip-front]");
  const back = book.querySelector("[data-flip-back]");
  const right = book.querySelector("[data-flip-image]");
  const left = book.querySelector("[data-flip-left]");
  const label = book.querySelector("[data-flip-label]");
  const folio = book.querySelector("[data-flip-folio]");
  const status = book.querySelector("[data-flip-status]");
  const open = book.querySelector("[data-flip-open]");
  const toggle = book.querySelector("[data-flip-toggle]");
  const picks = [...book.querySelectorAll("[data-flip-pick]")];
  const select = book.querySelector("[data-flip-select]");
  let current = Math.max(0, pagePosition(book.dataset.initialPage));
  let playing = !reducedMotion.matches;
  let visible = !("IntersectionObserver" in window);
  let busy = false;
  let queued = null;
  let timer;

  function updateCaption(announce = false) {
    const item = pages[current];
    label.textContent = item.title;
    folio.textContent = pageFolio(item);
    book.dataset.currentPage = item.id;
    open.setAttribute("aria-label", "Ampliar: " + item.title);
    picks.forEach(pick => pick.setAttribute("aria-pressed", String(pick.dataset.flipPick === item.id)));
    if (select) select.value = item.id;
    if (announce) status.textContent = pageFolio(item) + " · " + item.title;
  }
  function updatePlayback() {
    const action = playing ? "Pausar folheamento" : "Retomar folheamento";
    toggle.setAttribute("aria-label", action);
    toggle.title = action;
    toggle.querySelector("use").setAttribute("href", playing ? "#i-pause" : "#i-play");
  }
  const canPlay = () => playing && visible && !document.hidden && !viewer.open;
  function schedule() {
    clearTimeout(timer);
    if (!busy && canPlay()) {
      const next = wrapPage(current + 1);
      preparePage(pages[next]);
      timer = setTimeout(() => turnTo(next), 2200);
    }
  }
  async function turnTo(destination, manual = false, backwards = false) {
    const target = wrapPage(destination);
    if (busy) {
      if (manual) queued = [target, true, backwards];
      return;
    }
    if (target === current) {
      schedule();
      return;
    }
    clearTimeout(timer);
    busy = true;
    try {
      const spread = Boolean(left?.getClientRects().length);
      const previous = pages[wrapPage(target - 1)];
      const [nextSrc, previousSrc] = await Promise.all([
        preparePage(pages[target]),
        spread ? preparePage(previous) : Promise.resolve("")
      ]);
      if (!nextSrc || (!manual && !canPlay())) return;

      const currentSrc = pageAsset(pages[current], true);
      const leftSrc = previousSrc || pageAsset(previous, true);
      const fromLeft = spread && backwards && target === wrapPage(current - 1);
      if (!reducedMotion.matches && typeof sheet.animate === "function") {
        front.src = fromLeft ? nextSrc : currentSrc;
        back.src = fromLeft ? nextSrc : spread ? leftSrc : currentSrc;
        sheet.classList.toggle("from-left", fromLeft);
        sheet.classList.toggle("from-right-edge", backwards && !spread);
        if (fromLeft) left.src = leftSrc;
        else right.src = nextSrc;
        sheet.classList.add("is-turning");
        const turn = sheet.animate(
          [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${backwards ? 180 : -180}deg)` }],
          { duration: 860, easing: "cubic-bezier(.42,.05,.27,.99)", fill: "both" }
        );
        await turn.finished.catch(() => {});
        sheet.classList.remove("is-turning", "from-left", "from-right-edge");
        turn.cancel();
      }
      right.src = nextSrc;
      if (left) left.src = leftSrc;
      current = target;
      updateCaption(manual);
    } finally {
      busy = false;
      const next = queued;
      queued = null;
      if (next) turnTo(...next);
      else schedule();
    }
  }
  if (select) {
    pages.forEach(item => select.add(new Option(pageFolio(item) + " · " + item.title, item.id)));
    select.closest("label").hidden = false;
    select.addEventListener("change", () => turnTo(pagePosition(select.value), true));
  }
  book.querySelector("[data-flip-prev]").addEventListener("click", () => turnTo(current - 1, true, true));
  book.querySelector("[data-flip-next]").addEventListener("click", () => turnTo(current + 1, true));
  picks.forEach(pick => pick.addEventListener("click", () => turnTo(pagePosition(pick.dataset.flipPick), true)));
  toggle.addEventListener("click", () => {
    playing = !playing;
    updatePlayback();
    schedule();
  });
  open.addEventListener("click", () => openPage(current, open));
  book.addEventListener("keydown", event => {
    if (event.target.closest("select") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const backwards = event.key === "ArrowLeft";
    turnTo(current + (backwards ? -1 : 1), true, backwards);
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .18;
      schedule();
    }, { threshold: .18 }).observe(object);
  }
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) playing = false;
    updatePlayback();
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  viewer.addEventListener("preview-open", schedule);
  viewer.addEventListener("close", schedule);
  updateCaption();
  updatePlayback();
  book.setAttribute("data-ready", "");
  schedule();
}

document.querySelectorAll("[data-flipbook]").forEach(createFlipbook);

const readingViewport = document.getElementById("reading-viewport");
const readingTrack = readingViewport.querySelector(".reading-track");
const readingGroup = readingTrack.querySelector(".reading-group");
const readingToggle = document.querySelector(".reading-toggle");
const readingDuplicate = readingGroup.cloneNode(true);
readingDuplicate.setAttribute("aria-hidden", "true");
readingDuplicate.inert = true;
let readingPaused = false;
function setReadingMotion() {
  const moving = !reducedMotion.matches && !readingPaused;
  const transform = getComputedStyle(readingTrack).transform;
  const offset = transform === "none" ? 0 : -new DOMMatrixReadOnly(transform).m41;
  readingViewport.classList.toggle("is-moving", moving);
  readingToggle.hidden = reducedMotion.matches;
  readingToggle.textContent = moving ? "Pausar carrossel" : "Retomar carrossel";
  if (moving) {
    readingViewport.scrollLeft = 0;
    if (!readingDuplicate.isConnected) readingTrack.append(readingDuplicate);
  } else {
    readingDuplicate.remove();
    readingViewport.scrollLeft = offset;
  }
}
readingToggle.addEventListener("click", () => {
  readingPaused = !readingPaused;
  setReadingMotion();
});
reducedMotion.addEventListener("change", setReadingMotion);
setReadingMotion();

function createStudyPhotoGallery(gallery) {
  const viewport = gallery.querySelector("[data-photo-viewport]");
  const track = viewport.querySelector(".study-photo-track");
  const controls = gallery.querySelector(".study-photo-controls");
  const toggle = controls.querySelector("[data-photo-toggle]");
  const toggleIcon = toggle.querySelector("use");
  let playing = true, visible = false, hovering = false, focused = false, timer;

  function schedule() {
    clearTimeout(timer);
    if (!playing || !visible || hovering || focused || document.hidden || reducedMotion.matches) return;
    timer = setTimeout(() => {
      move(1);
      schedule();
    }, 3600);
  }

  function move(direction) {
    const first = track.children[0], second = track.children[1];
    const step = second.offsetLeft - first.offsetLeft;
    const max = viewport.scrollWidth - viewport.clientWidth;
    if (max <= 1 || step <= 0) return;
    const current = viewport.scrollLeft;
    const atEnd = current >= max - 2;
    const wraps = (direction > 0 && atEnd) || (direction < 0 && current <= 2);
    const next = wraps ? (direction > 0 ? 0 : max) :
      direction > 0 ? Math.min(max, (Math.floor((current + 2) / step) + 1) * step) :
        Math.max(0, (Math.ceil((current - 2) / step) - 1) * step);
    viewport.scrollTo({left: next, behavior: wraps || reducedMotion.matches ? "instant" : "smooth"});
  }

  function updateToggle() {
    toggle.hidden = reducedMotion.matches;
    toggle.setAttribute("aria-label", playing ? "Pausar rolagem" : "Retomar rolagem");
    toggleIcon.setAttribute("href", playing ? "#i-pause" : "#i-play");
  }

  controls.querySelector("[data-photo-prev]").addEventListener("click", () => move(-1));
  controls.querySelector("[data-photo-next]").addEventListener("click", () => move(1));
  toggle.addEventListener("click", () => { playing = !playing; updateToggle(); schedule(); });
  viewport.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse") return;
    playing = false;
    updateToggle();
    schedule();
  }, {passive:true});
  gallery.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") { hovering = true; schedule(); } });
  gallery.addEventListener("pointerleave", () => { hovering = false; schedule(); });
  gallery.addEventListener("focusin", event => { focused = viewport.contains(event.target); schedule(); });
  gallery.addEventListener("focusout", () => { focused = false; schedule(); });
  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", () => { updateToggle(); schedule(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, {threshold:.2}).observe(viewport);
  } else {
    playing = false;
  }
  updateToggle();
  controls.hidden = false;
}
document.querySelectorAll("[data-study-photos]").forEach(createStudyPhotoGallery);
