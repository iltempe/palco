import { useEffect, useState } from "react";
import { t } from "../lib/i18n";

// Evento non standard supportato da Chrome/Edge/Android.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPhone|iPad|iPod/.test(ua);
  // iPadOS 13+ si maschera da Mac: lo riconosciamo dal touch
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

export default function InstallApp() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [iosHelp, setIosHelp] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  // Android / desktop: prompt nativo
  if (deferred) {
    return (
      <button onClick={install} className="chip">
        <span aria-hidden>📲</span> {t.install}
      </button>
    );
  }

  // iPhone / iPad: istruzioni manuali (iOS non espone il prompt)
  if (isIOS()) {
    return (
      <div className="relative inline-block">
        <button onClick={() => setIosHelp((v) => !v)} className="chip" aria-expanded={iosHelp}>
          <span aria-hidden>📲</span> {t.install}
        </button>
        {iosHelp && (
          <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-elev bg-surface p-3 text-left text-xs leading-relaxed text-dim shadow-xl">
            {t.ios.before} <b className="text-[#f3f3f6]">{t.ios.share}</b>{" "}
            <span aria-hidden>􀈂</span> {t.ios.middle}{" "}
            <b className="text-[#f3f3f6]">{t.ios.addHome}</b>.
          </div>
        )}
      </div>
    );
  }

  // Browser senza supporto all'installazione: non mostrare nulla.
  return null;
}
