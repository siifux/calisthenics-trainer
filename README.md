# Calisthenics Trainer

En liten, moderne og lett React-app for calisthenics-trening. Fokus på timer-basert trening: **EMOM** (Every Minute On the Minute), **AMRAP** (As Many Rounds As Possible — *coming soon*) og **Climbing focused** (*coming soon*).

Appen er bygget som en **PWA** (Progressive Web App), slik at den kan legges til på hjemskjermen på iPhone og oppleves som en native app — fullskjerm, offline-vennlig, ingen Safari-chrome.

> Se [KRAVSPEK.md](./KRAVSPEK.md) for en full kravspesifikasjon av appen.

---

## Tech stack

| Lag           | Valg                              | Begrunnelse                                                  |
| ------------- | --------------------------------- | ------------------------------------------------------------ |
| Build tool    | **Vite**                          | Lynrask dev-server, minimal config, perfekt for små SPA-er.  |
| UI            | **React 18 + TypeScript**         | Modent, type-sikkert, lite friksjon.                         |
| Styling       | **CSS Modules** (eller Tailwind)  | Holdes lett — ingen tunge UI-rammeverk.                      |
| State         | **React state + Zustand**         | Liten footprint, ingen Redux-boilerplate.                    |
| Persistence   | **localStorage**                  | All data ligger lokalt på enheten — ingen backend.           |
| PWA           | **vite-plugin-pwa**               | Auto-genererer manifest + service worker for hjemskjerm.     |
| Hosting       | **GitHub Pages**                  | Gratis, statisk. Server fra `docs/`-mappa på `main`.         |
| CI/CD         | *(ingen — bygg lokalt)*           | Vi bygger lokalt og committer `docs/`. Bytt til Actions senere ved behov. |

---

## Deployment-flyt

Vi bygger lokalt og committer `docs/`-mappa til `main`. GitHub Pages serverer `docs/` direkte. Ingen CI nødvendig.

```
┌─────────────┐   npm run    ┌──────────────────┐   git push    ┌──────────────────┐
│  Local dev  │ ───build──▶  │  docs/ (built)   │ ────────────▶ │  GitHub Pages    │
│  npm run    │              │  + commit        │               │  serves docs/    │
│  dev        │              │                  │               │  on main         │
└─────────────┘              └──────────────────┘               └──────────────────┘
                                                                         │
                                                                         ▼
                                                                 ┌──────────────────┐
                                                                 │  iPhone PWA      │
                                                                 │  (hjemskjerm)    │
                                                                 └──────────────────┘
```

### 1. Lokal utvikling

```bash
# Installer dependencies
npm install

# Start dev-server (http://localhost:5173)
npm run dev

# Lag produksjonsbygg lokalt (output i docs/)
npm run build

# Forhåndsvis produksjonsbygget lokalt
npm run preview
```

Dev-serveren har hot reload — endringer vises umiddelbart i nettleseren.

### 2. Bygg og deploy

```bash
# Bygg produksjonsbundle (output i docs/)
npm run build

# Commit både kildekode og bygget output
git add .
git commit -m "Update app + rebuild"
git push origin main
```

Pages henter den nye versjonen automatisk innen ~1 minutt etter push.

> **OBS — `base`-path i Vite:** Når appen ligger på `https://<user>.github.io/calisthenics-trainer/`, må `vite.config.ts` settes med `base: '/calisthenics-trainer/'` for at assets skal lastes riktig. Hvis du bytter til custom domain eller bruker-/org-side (`<user>.github.io`), endre til `base: '/'`.

### 3. Aktiver GitHub Pages (engangsoppsett)

I GitHub-repoet:

1. **Settings → Pages**
2. **Source:** *Deploy from a branch*
3. **Branch:** `main` / `docs`
4. Trykk **Save**

URL: `https://<github-brukernavn>.github.io/calisthenics-trainer/`

> Hvis du senere ønsker automatisk deploy (slik at du slipper å bygge lokalt), kan du gå tilbake til GitHub Actions-modellen — se commit-historikk for tidligere workflow-eksempel.

### 4. Legg til på iPhone-hjemskjerm

1. Åpne URL-en i **Safari** på iPhone.
2. Trykk Del-knappen → *Legg til på Hjem-skjerm*.
3. Appen får eget ikon og kjører i fullskjerm uten Safari-UI.

For at PWA-en skal fungere skikkelig på iOS:

- `manifest.webmanifest` med `display: standalone`, `theme_color`, og ikoner i 192×192 og 512×512.
- `apple-touch-icon` (180×180) i `<head>`.
- `apple-mobile-web-app-capable` meta-tag for fullskjerm.
- HTTPS — GitHub Pages gir dette gratis.

---

## Prosjektstruktur (forventet)

```
calisthenics-trainer/
├── docs/                       # Bygget output (committes — Pages serverer herfra)
├── public/
│   ├── .nojekyll               # Hindrer Jekyll-prosessering på Pages
│   ├── favicon.svg
│   └── apple-touch-icon.png    # (legg inn 180×180 PNG)
├── src/
│   ├── screens/                # Toppnivå-skjermer (Home, EmomSetup, EmomActive, Summary)
│   ├── store/                  # Zustand store
│   ├── lib/                    # timer, audio, wakeLock, persistence, uuid
│   ├── types/                  # TypeScript-typer
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── KRAVSPEK.md                 # Kravspesifikasjon
├── README.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Roadmap

- [ ] **MVP**: EMOM-økt med start/stopp, øvelsesliste, live timer, redigerbare reps og varighet
- [ ] PWA-oppsett (manifest, ikoner, service worker)
- [ ] GitHub Actions deploy-pipeline
- [ ] AMRAP-modus
- [ ] Climbing focused-modus
- [ ] Treningshistorikk (lagre fullførte økter lokalt)
- [ ] Lyd/vibrasjon ved minutt-skifte i EMOM

---

## Lisens

Privat prosjekt — ingen lisens spesifisert.
