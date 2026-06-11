// api.js — chiamate REST a Supabase
(function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.EAW_CONFIG;
  const REST = `${SUPABASE_URL}/rest/v1`;

  const baseHeaders = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  function today() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  // Trova la playlist corrente: il lunedi piu recente <= oggi.
  async function getCurrentPlaylist() {
    const url = `${REST}/playlists?settimana=lte.${today()}&order=settimana.desc&limit=1`;
    const res = await fetch(url, { headers: baseHeaders });
    if (!res.ok) throw new Error(`playlists ${res.status}`);
    const rows = await res.json();
    return rows[0] || null;
  }

  // Artisti della playlist con contatori, ordinati.
  async function getArtisti(playlistId) {
    const url =
      `${REST}/artisti_con_contatori?playlist_id=eq.${playlistId}&order=ordine.asc`;
    const res = await fetch(url, { headers: baseHeaders });
    if (!res.ok) throw new Error(`artisti ${res.status}`);
    return res.json();
  }

  // Inserisce un feedback anonimo (ascolto | like).
  async function postFeedback(artistaId, tipo) {
    const res = await fetch(`${REST}/feedback`, {
      method: "POST",
      headers: {
        ...baseHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ artista_id: artistaId, tipo }),
    });
    if (!res.ok) throw new Error(`feedback ${res.status}`);
    return true;
  }

  window.EAWApi = { getCurrentPlaylist, getArtisti, postFeedback };
})();
