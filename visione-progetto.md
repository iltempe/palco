# Visione del Progetto — Media AI per Cantautori Emergenti

> Versione 0.3 — Giugno 2026

---

## Il Problema

Gli artisti emergenti hanno già strumenti per caricare musica. Il problema non è lo storage — è la scoperta. Su Spotify, YouTube e SoundCloud l'algoritmo premia chi ha già engagement, creando un circolo vizioso: serve visibilità per ottenere visibilità. Chi parte da zero non ha chance.

Gli ascoltatori, dal canto loro, sono passivi: l'algoritmo decide cosa sentono. Non esiste nessuna piattaforma che trasformi l'atto di scoprire un artista sconosciuto in qualcosa di significativo e gratificante.

---

## La Visione

Un **media automatizzato con AI** che va a cercare artisti emergenti dove già esistono — Spotify, YouTube — e li rilancia su tutti i canali dove stanno gli ascoltatori, con una narrativa editoriale curata.

Non aspettiamo che gli artisti si iscrivano. Andiamo noi a trovarli.

---

## Il Meccanismo Chiave — "First Listener"

Ogni artista pubblicato ha un contatore pubblico di fan che lo hanno endorsato. Il numero piccolo è il cuore del prodotto: vedere "7 fan" su un artista è un invito a essere l'ottavo.

**Per l'ascoltatore:**
- Endorsi un artista quando ha pochi fan → guadagni il badge permanente "Ero tra i primi fan di X"
- La tua reputazione da talent scout cresce con gli artisti che hai scoperto
- Il feed mostra prima gli artisti meno scoperti — freschezza garantita

**Per l'artista:**
- Viene scoperto e rilanciato senza fare nulla
- Vede chi sono i suoi primi fan, non solo un numero
- La crescita è documentata e condivisibile

---

## Architettura — Team di Agenti AI

Il sistema è orchestrato da **Claude API con tool use**. Un orchestratore intelligente coordina agenti specializzati, ragiona ad ogni step e gestisce i casi anomali — non è un flusso rigido come Make.com o n8n.

```
                    ┌─────────────────┐
                    │  ORCHESTRATORE  │
                    │     Claude      │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │    SCOUT     │ │   CURATOR    │ │  PUBLISHER   │
    │ Trova artisti│ │ Scrive scheda│ │ Pubblica     │
    │ 0-100 ascolti│ │ editoriale   │ │ multicanale  │
    └──────────────┘ └──────────────┘ └──────────────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                      Telegram           Instagram                X
```

### Agente Scout
- Interroga Spotify API e YouTube Data API
- Filtra artisti con meno di 100 ascolti / visualizzazioni
- Criteri di qualità: profilo completo, copertina, bio, almeno un brano
- Output: lista di artisti candidati con metadati

### Agente Curator
- Analizza ogni artista candidato
- Scrive una scheda editoriale — chi è, genere, città, perché vale la pena ascoltarlo
- Tono: caldo, diretto, come un amico che ti consiglia qualcosa
- Output: contenuto pronto per la pubblicazione

### Agente Publisher
- Adatta il contenuto per ogni canale (formato diverso per Telegram, Instagram, X)
- Pubblica tramite API ufficiali
- Allega embed o link al brano originale
- Output: post pubblicati con link di tracciamento

### Agente Analyst *(fase 2)*
- Monitora endorsement e crescita degli artisti nel tempo
- Segnala gli artisti che stanno decollando
- Alimenta le "storie di scoperta" — il marketing più potente della piattaforma

---

## Canali di Pubblicazione

| Canale | Formato | Note |
|---|---|---|
| Telegram | Post con bottone "⭐ Sono tra i primi fan" | Bot nativo, endorsement tracciabile |
| Instagram | Card grafica + storia | No link nei post, bio link |
| X | Post con embed + thread | Reach organica, retweet |

Il backend è unico — il contenuto viene scritto una volta e adattato per ogni canale.

---

## Come Funziona per l'Ascoltatore

Scorri il feed del canale che preferisci. Trovi un artista con 7 fan. Ascolti il brano via link/embed. Ti piace. Premi "Sono tra i primi fan". Sei l'ottavo. Vai avanti.

Quel numero piccolo è la cosa più importante del design — rende il momento di scoperta speciale e irripetibile.

---

## Strategia di Lancio

**Settimana 1-2 — Validazione manuale**
Trova a mano 10-15 artisti su Spotify/YouTube con meno di 100 ascolti. Pubblica su un canale Telegram e un profilo Instagram. Misura: le persone endorsano? Tornano?

**Settimana 3-4 — Automazione Scout + Curator**
Automatizza la ricerca e la scrittura delle schede con Claude API. La pubblicazione rimane manuale per controllare la qualità.

**Mese 2 — Publisher automatico**
Pubblicazione automatica multicanale. L'orchestratore gira ogni giorno, tu supervisioni.

**Mese 3+ — Analyst e storie di successo**
Monitora gli artisti rilanciati. Quando uno cresce, racconta la storia. Quella storia è la prova del concetto.

---

## Stack Tecnico

- **Orchestratore**: Claude API con tool use (Anthropic)
- **Dati artisti**: Spotify API + YouTube Data API — entrambe gratuite
- **Database**: Supabase — artisti processati, endorsement, pubblicazioni
- **Pubblicazione**: API di Telegram Bot, Instagram Graph API, X API
- **Hosting**: Supabase Edge Functions o un semplice cron su server

**Costi stimati:**
- Supabase Free → $0/mese nella fase iniziale
- Claude API → pochi centesimi per artista processato
- API social → gratuite nei tier base

---

## Cosa Rende Questo Diverso

| | Spotify | SoundCloud | Questo progetto |
|---|---|---|---|
| Chi trova gli artisti | Algoritmo | Algoritmo | Agenti AI + curatela |
| Ascoltatore | Passivo | Passivo | Talent scout attivo |
| Valore della scoperta | Zero | Zero | Badge permanente |
| Costo per artista | Tramite distributore | Freemium | Zero — viene trovato |
| Canali | Uno | Uno | Multicanale |

---

## Metriche di Successo (MVP)

- Artisti rilanciati per settimana
- Tasso di endorsement per artista pubblicato
- Retention degli ascoltatori sul canale
- Storie di successo — artisti rilanciati che poi crescono

---

*Documento di lavoro — aggiornato iterativamente durante lo sviluppo del progetto.*
