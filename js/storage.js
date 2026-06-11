// storage.js — anti-spam like/ascolto via localStorage
(function () {
  const STORAGE_KEY = "eaw_feedback";

  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }
  function write(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }

  function hasFeedback(artistaId, tipo) {
    return !!read()[`${artistaId}_${tipo}`];
  }

  function saveFeedback(artistaId, tipo) {
    const data = read();
    data[`${artistaId}_${tipo}`] = Date.now();
    write(data);
  }

  // Pulizia dati piu vecchi di 7 giorni (reset settimanale).
  function cleanOldFeedback() {
    const data = read();
    const settimanaFa = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, ts]) => ts > settimanaFa)
    );
    write(cleaned);
  }

  window.EAWStorage = { hasFeedback, saveFeedback, cleanOldFeedback };
})();
