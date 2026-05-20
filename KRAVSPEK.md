# Kravspesifikasjon — Calisthenics Trainer

**Versjon:** 0.1 (utkast)
**Dato:** 2026-05-20
**Eier:** Sindre Furulund

---

## 1. Mål og visjon

Calisthenics Trainer er en **lightweight, moderne, mobil-først treningsapp** for calisthenics. Appen kjøres som en PWA fra iPhone-hjemskjermen og krever ingen innlogging, ingen backend og ingen kontoer.

Appen skal gjøre det **friksjonsfritt** å starte en timer-basert treningsøkt — særlig EMOM og (senere) AMRAP — med en levende oversikt over hvilken øvelse som er aktiv, hvor mange reps som skal gjøres, og hvor mye tid som er igjen.

### Designprinsipper

1. **Mobil-først, fullskjerm.** Designet for iPhone i portrettmodus.
2. **Få trykk, store flater.** Knapper og kontroller skal være lett trefbare under trening.
3. **Tydelig hierarki.** Det viktigste (gjenværende tid, aktiv øvelse) skal være størst.
4. **Ingen avhengighet av nett.** All state ligger lokalt. Skal fungere offline.
5. **Lavt rammeverk-fotavtrykk.** Ingen tunge UI-bibliotek. Rask innlasting.

---

## 2. Brukerroller

- **Solo-bruker (M0):** En enkelt person som trener selv. Ingen flerbruker-støtte i MVP.

---

## 3. Skjermer og navigasjon

### 3.1 Skjermkart

```
┌──────────────────────┐
│   Home (Velg økt)    │
└──────────┬───────────┘
           │
   ┌───────┴───────┬──────────────────┬─────────────────────┐
   ▼               ▼                  ▼                     ▼
┌──────────┐  ┌────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  EMOM    │  │  AMRAP     │  │  Climbing focus  │  │  (fremtidig)     │
│  Setup   │  │ (coming)   │  │  (coming)        │  │                  │
└────┬─────┘  └────────────┘  └──────────────────┘  └──────────────────┘
     │
     ▼
┌──────────────────────┐
│   EMOM Aktiv-økt     │
│   (timer kjører)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Sammendrag         │
│   (fullført økt)     │
└──────────────────────┘
```

### 3.2 Home / Startskjerm

**Formål:** La brukeren velge type treningsøkt.

**Innhold:**
- App-tittel / logo (lite, øverst).
- Liste med kort/knapper, én per økt-type:
  - **EMOM** — aktiv, klikkbar.
  - **AMRAP** — synlig, men disabled med badge "Coming soon".
  - **Climbing focused** — synlig, men disabled med badge "Coming soon".
- (Senere) Liste over lagrede/forhåndsdefinerte økter.

**Handlinger:**
- Trykk på EMOM-kort → naviger til EMOM Setup.
- Disabled kort viser ingen feedback utover en visuell "låst"-indikator.

### 3.3 EMOM Setup

**Formål:** La brukeren konfigurere og redigere økten *før* timeren startes.

**Innhold:**
- **Total varighet** (input): minutter — default 15. Justerbar med +/- knapper og/eller direkte input.
- **Liste over minutter** (én rad per minutt):
  - Minutt-nummer (badge / venstre).
  - Øvelsesnavn (tekst-input eller dropdown fra forhåndsdefinert øvelsesliste).
  - Antall reps (numerisk input).
  - **Drag-handle / pil opp / pil ned** for å endre rekkefølge.
  - **Slett-ikon** for å fjerne minuttet.
- **+ Legg til minutt** (knapp) — legger til en ny rad på slutten.
- **Spesielle øvelsestyper:**
  - "Pause" / "Rest" som førsteklasses valg (viser ingen rep-count).
- **Start-knapp** (stor, nederst, sticky) — starter timeren og navigerer til EMOM Aktiv.

**Eksempel-konfigurasjon (fra brukerens beskrivelse):**

| Minutt | Øvelse | Reps |
| ------ | ------ | ---- |
| 1      | Pull-ups | 5    |
| 2      | Push-ups | 10   |
| 3      | Pause   | —    |
| 4      | Pull-ups | 5    |
| ...    | ...     | ...  |

**Validering:**
- Total varighet må være ≥ 1 min.
- Listen kan være kortere enn total varighet → øvelsene **looper** til tiden er ute.
- Listen kan være lengre enn total varighet → økten avsluttes når tiden er ute (gjenværende minutter ignoreres).

**Persistence:**
- Siste konfigurasjon lagres i localStorage og prefilles ved neste åpning.

### 3.4 EMOM Aktiv-økt

**Formål:** Kjøre selve økten med live timer.

**Layout (top → bottom):**

1. **Total-tid igjen** (stor, monospace): `MM:SS` — teller ned fra total varighet.
2. **Progress bar** for hele økten.
3. **Aktivt minutt** (svært stort):
   - Øvelsesnavn (XL font).
   - "× N reps" (stor, sekundær).
   - Eller "PAUSE" hvis hviletype.
4. **Tid igjen i nåværende minutt** (medium, monospace): `0:42`.
5. **Neste opp** (lite, dempet): "Neste: 10 push-ups".
6. **Kontroller** (bunn):
   - **Pause / Resume** (toggle, stor sentral knapp).
   - **Stopp** (sekundær — bekreftelse før reset).
   - **Hopp over minutt** (sekundær — går til neste minutt umiddelbart).

**Oppførsel:**
- Når timeren starter: minutt 1 vises, total nedteller starter, klokke er "wall-clock-presis" (bruker `Date.now()`-baseline, ikke akkumulerende `setInterval`).
- Ved hvert hele minutt-skifte: bytt til neste øvelse + gi feedback (se 4.3).
- Når total tid når 0: naviger til Sammendrag.
- Skjermen skal **ikke** sove under aktiv økt (Wake Lock API der mulig — fallback: be brukeren slå av autolås).

### 3.5 Sammendrag

**Formål:** Vise resultat etter fullført økt.

**Innhold:**
- "Fullført!" / kort positiv tilbakemelding.
- Total varighet kjørt.
- Antall fullførte minutter (eks. fra hopp over).
- Liste over øvelser gjennomført med totalt antall reps per øvelse.
- Knapper: **Tilbake til start** | **Kjør samme økt igjen**.

---

## 4. Funksjonelle krav

### 4.1 EMOM-motor

| ID    | Krav                                                                                         | Prioritet |
| ----- | -------------------------------------------------------------------------------------------- | --------- |
| F-1.1 | Bruker kan starte en EMOM-økt fra Setup-skjermen.                                            | MUST      |
| F-1.2 | Timeren er presis: drift ≤ 0,5 s over 20 minutter.                                           | MUST      |
| F-1.3 | Bruker kan pause og gjenoppta økten.                                                         | MUST      |
| F-1.4 | Bruker kan avbryte økten med bekreftelses-dialog.                                            | MUST      |
| F-1.5 | Bruker kan hoppe over til neste minutt manuelt.                                              | SHOULD    |
| F-1.6 | Hvis øvelseslisten er kortere enn total varighet, loopes listen.                             | MUST      |
| F-1.7 | Pause-minutter behandles som en gyldig "øvelsestype".                                        | MUST      |
| F-1.8 | Timer fortsetter korrekt selv om appen ligger i bakgrunnen (best effort på iOS).             | SHOULD    |

### 4.2 Øvelses-konfigurasjon

| ID    | Krav                                                                                | Prioritet |
| ----- | ----------------------------------------------------------------------------------- | --------- |
| F-2.1 | Bruker kan legge til en øvelse i økten.                                             | MUST      |
| F-2.2 | Bruker kan fjerne en øvelse fra økten.                                              | MUST      |
| F-2.3 | Bruker kan endre antall reps for en øvelse.                                         | MUST      |
| F-2.4 | Bruker kan endre rekkefølge på øvelsene (drag-and-drop eller opp/ned-piler).        | MUST      |
| F-2.5 | Bruker kan endre øvelsesnavn (fri tekst).                                           | MUST      |
| F-2.6 | Bruker kan endre total varighet for økten.                                          | MUST      |
| F-2.7 | Forhåndsdefinert øvelsesliste foreslås som autocomplete (pull-up, push-up, ...).    | NICE      |

### 4.3 Feedback under økt

| ID    | Krav                                                                                | Prioritet |
| ----- | ----------------------------------------------------------------------------------- | --------- |
| F-3.1 | Ved hvert minuttskifte gis det visuell tilbakemelding (farge-pulse / flash).        | MUST      |
| F-3.2 | Ved hvert minuttskifte gis det lydsignal.                                           | SHOULD    |
| F-3.3 | Ved hvert minuttskifte gis det haptisk feedback (vibrasjon) der støttet.            | SHOULD    |
| F-3.4 | De siste 3 sekundene før minuttskifte: nedtellingstone / visuell countdown.         | NICE      |
| F-3.5 | Skjerm holdes våken under aktiv økt (Wake Lock API).                                | SHOULD    |

### 4.4 Persistens

| ID    | Krav                                                                                | Prioritet |
| ----- | ----------------------------------------------------------------------------------- | --------- |
| F-4.1 | Siste EMOM-konfigurasjon huskes mellom sessions (localStorage).                     | MUST      |
| F-4.2 | Brukeren kan lagre flere navngitte EMOM-presets.                                    | NICE      |
| F-4.3 | Historikk over fullførte økter lagres lokalt.                                       | NICE      |

### 4.5 PWA / hjemskjerm

| ID    | Krav                                                                                | Prioritet |
| ----- | ----------------------------------------------------------------------------------- | --------- |
| F-5.1 | Appen har gyldig `manifest.webmanifest` og kan installeres på iPhone-hjemskjerm.    | MUST      |
| F-5.2 | Appen kjører i `display: standalone`-modus (uten Safari-chrome).                    | MUST      |
| F-5.3 | App-ikon vises korrekt på hjemskjermen (apple-touch-icon 180×180).                  | MUST      |
| F-5.4 | Appen fungerer offline etter første lasting (service worker cache).                 | SHOULD    |

### 4.6 Coming soon-moduser

| ID    | Krav                                                                                | Prioritet |
| ----- | ----------------------------------------------------------------------------------- | --------- |
| F-6.1 | AMRAP-kortet vises på startskjerm med "Coming soon"-badge og er ikke trykkbart.     | MUST      |
| F-6.2 | Climbing focused-kortet vises tilsvarende.                                          | MUST      |

---

## 5. Ikke-funksjonelle krav

| ID    | Krav                                                                                | Mål      |
| ----- | ----------------------------------------------------------------------------------- | -------- |
| N-1   | First Contentful Paint på iPhone over 4G                                            | < 2 s    |
| N-2   | Total JS-bundle (gzippet) for MVP                                                   | < 100 KB |
| N-3   | Tilgjengelig på alle moderne mobile nettlesere (iOS Safari 16+, Chrome Android).    | —        |
| N-4   | Ingen analytics, tracking eller tredjeparts-cookies.                                | —        |
| N-5   | Tilgjengelighet: tekst-kontrast ≥ WCAG AA, trefområder ≥ 44×44 px.                  | —        |
| N-6   | Mørkt tema som default (best for trening i halvmørke rom / kveld).                  | —        |
| N-7   | Kodekvalitet: TypeScript strict mode, ingen `any` i forretningslogikk.              | —        |

---

## 6. Datamodell (utkast)

```ts
type ExerciseKind = "work" | "rest";

interface ExerciseSlot {
  id: string;          // uuid
  kind: ExerciseKind;
  name: string;        // f.eks. "Pull-ups" eller "Pause"
  reps: number | null; // null for rest
}

interface EmomConfig {
  id: string;
  name?: string;             // valgfri (for presets)
  totalMinutes: number;      // total varighet
  slots: ExerciseSlot[];     // looper hvis kortere enn totalMinutes
  updatedAt: number;         // epoch ms
}

interface SessionLog {
  id: string;
  configId: string;
  startedAt: number;
  endedAt: number;
  completedMinutes: number;
  skippedMinutes: number;
}
```

---

## 7. Avgrensninger (ute av scope for MVP)

- Ingen brukerkontoer, ingen sky-sync.
- Ingen sosiale funksjoner (deling, leaderboards).
- Ingen video- eller bildebibliotek for øvelser.
- Ingen AMRAP- eller Climbing-modus i MVP (kun "Coming soon"-kort).
- Ingen flerspråklig støtte — norsk + engelsk-blandet tekst er OK i MVP.
- Ingen integrasjoner mot Apple Health / Strava / lignende.

---

## 8. Åpne spørsmål

1. **Lydeffekter:** Egen-genererte (Web Audio oscillator) eller forhåndsinnspilte mp3-er?
2. **Tema:** Bare dark mode, eller også light?
3. **Drag-and-drop:** Bruke et lite bibliotek (`@dnd-kit/core`) eller bygge selv med opp/ned-piler i MVP?
4. **Preset-økter:** Skal MVP ha noen innebygde eksempler (f.eks. "Push/Pull 15 min")?
5. **Skjerm-orientering:** Lås til portrait, eller støtt rotasjon?

---

## 9. Aksept-kriterier for MVP

MVP er "ferdig" når en bruker kan:

1. ✅ Åpne appen fra iPhone-hjemskjerm i fullskjerm.
2. ✅ Velge EMOM fra startskjerm.
3. ✅ Konfigurere en økt med minst 3 øvelser inkl. én pause.
4. ✅ Endre reps, rekkefølge, antall øvelser og total varighet.
5. ✅ Starte økten og se en live, presis timer telle ned.
6. ✅ Få tydelig feedback ved minuttskifte (visuelt + lyd eller vibrasjon).
7. ✅ Pause/resume og avbryte økten.
8. ✅ Se et sammendrag etter fullført økt.
9. ✅ Komme tilbake til appen senere og finne siste konfigurasjon prefilled.
