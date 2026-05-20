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
| Hosting       | **GitHub Pages**                  | Gratis, statisk, enkel deploy via Actions.                   |
| CI/CD         | **GitHub Actions**                | Bygger og deployer automatisk på push til `main`.            |

---

## Deployment-flyt

Hele opplegget er en enkel **GitOps-loop**: skriv kode lokalt → commit → push til `main` → GitHub Actions bygger → GitHub Pages serverer ny versjon → iPhone-PWA henter oppdateringen ved neste åpning.

```
┌─────────────┐   git push    ┌──────────────────┐   build+deploy   ┌──────────────────┐
│  Local dev  │ ────────────▶ │  GitHub (main)   │ ───────────────▶ │  GitHub Pages    │
│  npm run    │               │  Actions runner  │   gh-pages /     │  https://<user>. │
│  dev        │               │  (vite build)    │   artifact       │  github.io/...   │
└─────────────┘               └──────────────────┘                  └──────────────────┘
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

# Lag produksjonsbygg lokalt (sjekk at det bygger)
npm run build

# Forhåndsvis produksjonsbygget lokalt
npm run preview
```

Dev-serveren har hot reload — endringer vises umiddelbart i nettleseren.

### 2. Git-flyt

```bash
# Lag en feature-branch
git checkout -b feature/emom-timer

# Commit underveis
git add .
git commit -m "Add EMOM timer skeleton"

# Push til GitHub
git push -u origin feature/emom-timer

# Når funksjonen er klar: åpne PR, merge til main
# (eller, for solo-prosjekt: bare push direkte til main)
git checkout main
git merge feature/emom-timer
git push origin main
```

### 3. GitHub Actions (automatisk deploy)

Hver push til `main` trigger `.github/workflows/deploy.yml`, som:

1. Sjekker ut koden
2. Installerer Node + dependencies (`npm ci`)
3. Bygger appen (`npm run build`) → output i `dist/`
4. Publiserer `dist/` til GitHub Pages

Eksempel-workflow (legges inn senere når repoet er satt opp):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - uses: actions/deploy-pages@v4
```

> **OBS — `base`-path i Vite:** Når appen ligger på `https://<user>.github.io/calisthenics-trainer/`, må `vite.config.ts` settes med `base: '/calisthenics-trainer/'` for at assets skal lastes riktig. Hvis du bruker en custom domain (CNAME) eller bruker-/org-side (`<user>.github.io`), settes `base: '/'`.

### 4. Aktiver GitHub Pages

Engangsoppsett i GitHub-repoet:

1. **Settings → Pages → Source**: velg *GitHub Actions*.
2. Første push til `main` deployer automatisk.
3. URL: `https://<github-brukernavn>.github.io/calisthenics-trainer/`

### 5. Legg til på iPhone-hjemskjerm

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
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD til GitHub Pages
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── components/             # Gjenbrukbare UI-komponenter
│   ├── screens/                # Toppnivå-skjermer (Home, EmomSession, ...)
│   ├── features/
│   │   └── emom/               # EMOM-spesifikk logikk og UI
│   ├── store/                  # Zustand stores
│   ├── lib/                    # Hjelpefunksjoner (timer, persistence)
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
