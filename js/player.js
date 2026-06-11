// player.js — wrapper attorno alla YouTube IFrame API
(function () {
  let player = null;
  let apiReady = false;
  let pendingVideoId = null;
  let onPlayCb = null;

  // Chiamata globale invocata dalla IFrame API quando e pronta.
  window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    if (pendingVideoId) {
      const id = pendingVideoId;
      pendingVideoId = null;
      load(id);
    }
  };

  function ensurePlayer() {
    if (player) return;
    player = new YT.Player("yt-player", {
      width: "100%",
      height: "100%",
      playerVars: {
        enablejsapi: 1,
        rel: 0,
        playsinline: 1,
        modestbranding: 1,
      },
      events: {
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING && typeof onPlayCb === "function") {
            onPlayCb();
          }
        },
      },
    });
  }

  function load(videoId) {
    if (!apiReady || typeof YT === "undefined" || !YT.Player) {
      pendingVideoId = videoId;
      return;
    }
    ensurePlayer();
    // Il player potrebbe non essere ancora completamente costruito.
    if (player && typeof player.loadVideoById === "function") {
      player.loadVideoById(videoId);
    } else {
      pendingVideoId = videoId;
      setTimeout(() => load(pendingVideoId), 250);
    }
  }

  function stop() {
    if (player && typeof player.stopVideo === "function") {
      try { player.stopVideo(); } catch {}
    }
  }

  // Registra un callback chiamato la prima volta che parte la riproduzione.
  function onFirstPlay(cb) { onPlayCb = cb; }

  window.EAWPlayer = { load, stop, onFirstPlay };
})();
