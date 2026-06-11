// app.js — entry point
(function () {
  const { getCurrentPlaylist, getArtisti, postFeedback } = window.EAWApi;
  const { hasFeedback, saveFeedback, cleanOldFeedback } = window.EAWStorage;
  const Player = window.EAWPlayer;

  const el = (id) => document.getElementById(id);
  const ui = {
    meta: el("playlist-meta"),
    loading: el("state-loading"),
    empty: el("state-empty"),
    card: el("card"),
    nav: el("nav"),
    cover: el("cover"),
    playerMount: el("player-mount"),
    playBtn: el("play-btn"),
    name: el("artist-name"),
    sub: el("artist-sub"),
    scheda: el("artist-scheda"),
    likeBtn: el("like-btn"),
    likeIcon: el("like-icon"),
    likeCount: el("like-count"),
    viewsCount: el("views-count"),
    ytLink: el("yt-link"),
    dots: el("dots"),
    prev: el("prev-btn"),
    next: el("next-btn"),
    retry: el("retry-btn"),
    stage: el("stage"),
  };

  let artisti = [];
  let idx = 0;
  let playing = false;

  // ---------- Bootstrap ----------
  async function init() {
    cleanOldFeedback();
    show(ui.loading, true); show(ui.empty, false); show(ui.card, false); show(ui.nav, false);

    try {
      const playlist = await getCurrentPlaylist();
      if (!playlist) return showEmpty();

      artisti = await getArtisti(playlist.id);
      if (!artisti.length) return showEmpty();

      ui.meta.textContent = buildMeta(playlist);
      show(ui.loading, false);
      show(ui.card, true);
      show(ui.nav, true);
      buildDots();
      render(0);
    } catch (err) {
      console.error(err);
      showEmpty();
    }
  }

  function showEmpty() {
    show(ui.loading, false);
    show(ui.card, false);
    show(ui.nav, false);
    show(ui.empty, true);
    ui.meta.textContent = "";
  }

  function buildMeta(playlist) {
    const lunedi = new Date(playlist.settimana + "T00:00:00");
    const fineSettimana = new Date(lunedi.getTime() + 6 * 86400000);
    const giorniRimasti = Math.max(
      0,
      Math.ceil((fineSettimana - new Date()) / 86400000)
    );
    const titolo = playlist.titolo || "Playlist della settimana";
    const giorni = giorniRimasti === 1 ? "1 giorno" : `${giorniRimasti} giorni`;
    return `${titolo} • ${giorni}`;
  }

  // ---------- Render ----------
  function render(newIdx, dir) {
    Player.stop();
    playing = false;
    show(ui.playerMount, false);
    show(ui.playBtn, true);

    idx = (newIdx + artisti.length) % artisti.length;
    const a = artisti[idx];

    ui.name.textContent = a.nome || "—";
    ui.sub.textContent = [a.genere, a.citta].filter(Boolean).join(" • ") || "";
    ui.scheda.textContent = a.scheda_editoriale || "";
    ui.cover.src =
      a.copertina_url ||
      `https://img.youtube.com/vi/${a.youtube_video_id}/hqdefault.jpg`;
    ui.cover.alt = a.nome || "";
    ui.ytLink.href =
      a.youtube_url || `https://www.youtube.com/watch?v=${a.youtube_video_id}`;

    ui.viewsCount.textContent = a.ascolti ?? 0;
    renderLike(a);

    updateDots();
    updateNavButtons();

    if (dir) {
      ui.card.classList.remove("swap-left", "swap-right");
      void ui.card.offsetWidth; // reflow per ri-triggerare l'animazione
      ui.card.classList.add(dir === "next" ? "swap-left" : "swap-right");
    }
  }

  function renderLike(a) {
    const liked = hasFeedback(a.id, "like");
    ui.likeBtn.classList.toggle("is-liked", liked);
    ui.likeBtn.setAttribute("aria-pressed", liked ? "true" : "false");
    ui.likeIcon.textContent = liked ? "♥" : "♡";
    ui.likeCount.textContent = a.like_count ?? 0;
  }

  // ---------- Dots ----------
  function buildDots() {
    ui.dots.innerHTML = "";
    artisti.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "dot";
      d.addEventListener("click", () => render(i));
      ui.dots.appendChild(d);
    });
  }
  function updateDots() {
    [...ui.dots.children].forEach((d, i) =>
      d.classList.toggle("is-active", i === idx)
    );
  }
  function updateNavButtons() {
    ui.prev.disabled = artisti.length <= 1;
    ui.next.disabled = artisti.length <= 1;
  }

  // ---------- Play ----------
  function startPlay() {
    const a = artisti[idx];
    show(ui.playBtn, false);
    show(ui.playerMount, true);
    Player.onFirstPlay(() => onAscolto(a));
    Player.load(a.youtube_video_id);
    playing = true;
  }

  async function onAscolto(a) {
    if (hasFeedback(a.id, "ascolto")) return;
    saveFeedback(a.id, "ascolto");
    a.ascolti = (a.ascolti ?? 0) + 1;
    if (artisti[idx] && artisti[idx].id === a.id) {
      ui.viewsCount.textContent = a.ascolti;
    }
    try { await postFeedback(a.id, "ascolto"); }
    catch (e) { console.warn("ascolto non registrato", e); }
  }

  // ---------- Like ----------
  async function onLike() {
    const a = artisti[idx];
    if (hasFeedback(a.id, "like")) return; // anti-spam: un like per artista
    saveFeedback(a.id, "like");
    a.like_count = (a.like_count ?? 0) + 1;
    renderLike(a);
    ui.likeBtn.classList.remove("bump");
    void ui.likeBtn.offsetWidth;
    ui.likeBtn.classList.add("bump");
    try { await postFeedback(a.id, "like"); }
    catch (e) { console.warn("like non registrato", e); }
  }

  // ---------- Navigation ----------
  const next = () => render(idx + 1, "next");
  const prev = () => render(idx - 1, "prev");

  // ---------- Swipe ----------
  let touchX = null, touchY = null;
  function onTouchStart(e) {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }
  function onTouchEnd(e) {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
    }
  }

  // ---------- Events ----------
  ui.playBtn.addEventListener("click", startPlay);
  ui.likeBtn.addEventListener("click", onLike);
  ui.next.addEventListener("click", next);
  ui.prev.addEventListener("click", prev);
  ui.retry.addEventListener("click", init);
  ui.stage.addEventListener("touchstart", onTouchStart, { passive: true });
  ui.stage.addEventListener("touchend", onTouchEnd, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  function show(node, visible) { node.hidden = !visible; }

  // ---------- Service worker ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    );
  }

  init();
})();
