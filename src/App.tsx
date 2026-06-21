import { useEffect } from "react";
import Home from "./pages/Home";
import PlayerBar from "./components/PlayerBar";
import { config } from "./lib/config";
import { applyAccent } from "./lib/theme";
import { lang, t } from "./lib/i18n";

export default function App() {
  useEffect(() => {
    applyAccent(config.artist.accentColor);
    document.title = config.artist.name;
    document.documentElement.lang = lang;
  }, []);

  return (
    <div className="min-h-dvh">
      <Home />
      <PlayerBar />
      <footer className="mx-auto max-w-3xl px-4 pb-28 pt-6 text-center text-xs text-dim">
        {t.footerBy(config.artist.name)}{" "}
        <a href="https://github.com/iltempe/palco" target="_blank" rel="noopener">
          Palco
        </a>
      </footer>
    </div>
  );
}
