# Design System — IpnosiApplicata.it

Documento operativo del design system per la piattaforma ipnosiapplicata.it.  
Questa è la **fonte di verità progettuale**. Ogni decisione visiva si riferisce a questo file.

**Derivato da:** `table-talk25/cristianlecca-site/design.md`  
IpnosiApplicata non è un brand separato — è una continuazione riconoscibile dello stesso ecosistema visivo.

---

## Principio fondante

cristianlecca.it e ipnosiapplicata.it devono sembrare due parti dello stesso universo, non due siti diversi.

- **Stessa palette** — vincolante, nessuna variazione.
- **Stessa tipografia** — Manrope + Inter, senza eccezioni.
- **Stesso tono visivo** — premium, sobrio, autorevole, empatico.
- **Componenti riconoscibili** — card, bottoni, spacing: stessa famiglia.

La differenza tra i due siti non è nel look — è nella funzione.
cristianlecca.it è il brand personale. ipnosiapplicata.it è la piattaforma operativa.

---

## Identità

**Brand:** Cristian Lecca  
**Sotto-brand:** IpnosiApplicata  
**Tone of voice:** premium, autorevole, sobrio, professionale, empatico.  
**Niente:** redesign creativo, template generici, stili SaaS anonimi.

---

## Palette colori — vincolante

Identica a cristianlecca.it. Nessuna eccezione.

| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#49C7A5` | CTA principale, stati attivi, highlight principali, progress bar |
| Secondary | `#3A63FF` | Elementi secondari, link, badge corso, enfasi controllate |
| Tertiary | `#C9A45C` | Badge premium, micro-highlight, livelli avanzati. Usare poco. |
| Text light | `#F5F7FA` | Testo chiaro, superfici chiare |
| Background | `#101416` | Base scura principale |
| Surface | `#1d2022` | Card, modali, pannelli interni |
| Surface high | `#272a2d` | Layer elevati, dropdown, tooltip |
| Outline variant | `#3d4944` | Bordi, divisori, linee |
| On-surface variant | `#bccac3` | Testo secondario, label, metadati |

### Regole d'uso colore

- `#49C7A5` = CTA primarie, progress, stati completati, highlight mappa.
- `#3A63FF` = badge corsi, link, enfasi UI secondaria.
- `#C9A45C` = badge livello avanzato, dettagli premium, milestone percorso.
- Mai viola, lilla, indaco, gradienti teal+purple.
- Mai glow eccessivi o palette inventate.

### Stato degli esercizi — colori funzionali

| Stato | Colore | Hex |
|-------|--------|-----|
| Completato | Primary teal | `#49C7A5` |
| In corso | Secondary blue | `#3A63FF` |
| In scadenza | Tertiary gold | `#C9A45C` |
| Bloccato | Outline variant | `#3d4944` |
| Non fatto / scaduto | Error red | `#ffb4ab` |

---

## Tipografia — identica a cristianlecca.it

| Ruolo | Font | Peso |
|-------|------|------|
| Display / Hero | Manrope | 700–800 |
| Heading sezioni | Manrope | 600–700 |
| Body text | Inter | 400 |
| UI / label / nav | Inter | 600 |
| Caption / metadati | Inter | 400–500 |

### Scale tipografica (identica a cristianlecca-site)

| Token | Size | Line height | Weight |
|-------|------|-------------|--------|
| display-lg | 64px | 1.1 | 700 |
| display-lg-mobile | 40px | 1.2 | 700 |
| headline-lg | 48px | 1.2 | 600 |
| headline-md | 32px | 1.3 | 600 |
| body-lg | 20px | 1.6 | 400 |
| body-md | 16px | 1.6 | 400 |
| label-md | 14px | 1.2 | 600 |

### Regole

- Non introdurre serif.
- Non cambiare font tra pagine pubbliche e area riservata.
- Non usare font decorativi.

---

## Header

### Pagine pubbliche — header standard

Identico nella struttura all'header di cristianlecca.it.

- Sinistra: logo IpnosiApplicata (o wordmark)
- Centro/destra: navigazione principale
- Destra: CTA primaria
- Sticky, dark semi-opaque, bordo inferiore leggero
- Stesso comportamento responsive con hamburger mobile

### Area riservata — header dashboard

Variante semplificata per l'interno della piattaforma:

- Sinistra: logo
- Centro: nome sezione corrente (breadcrumb leggero)
- Destra: avatar utente + notifiche + logout
- Stesso sfondo e stile visivo dell'header pubblico

### Regole

- Stesso look dell'header di cristianlecca.it.
- Niente header reinventati tra pagine.
- La transizione da sito pubblico ad area riservata deve sembrare naturale, non uno stacco.

---

## Navigazione pubblica

```
Home | Metodo | Corsi | Sessioni 1:1 | Accademia | [Accedi]
```

CTA primaria header:
- **Inizia il percorso** (pagine generali)
- **Accedi** (quando l'utente è già registrato)

---

## Navigazione area riservata (sidebar o top nav)

```
Dashboard
La mia Mappa
Il mio Percorso
Sessioni
Esercizi
Induzioni Audio
Corsi
[Impostazioni]
[Esci]
```

### Regole navigazione interna

- Voce attiva: `text-primary border-l-2 border-primary` (sidebar) o `border-b-2 border-primary` (top nav)
- Voci inattive: `text-on-surface-variant hover:text-primary transition-colors`
- Stessa logica di stato attivo di cristianlecca-site

---

## Footer

### Pagine pubbliche — footer standard

Stessa struttura del footer di cristianlecca.it, adattata ai contenuti della piattaforma.

| Colonna | Contenuto |
|---------|-----------|
| Brand | Logo + descrizione IpnosiApplicata |
| Piattaforma | Home, Metodo, Corsi, Sessioni 1:1, Accademia |
| Percorso | Quiz del Coraggio, Reset Notturno, Sessione di Svolta |
| Legale | Privacy Policy, Cookie Policy |

Riga finale:
```
© 2026 Cristian Lecca — IpnosiApplicata. Tutti i diritti riservati. P.IVA IT12632010018
```

### Area riservata — footer minimale

- Solo P.IVA + link Privacy + link Cookie
- Niente navigazione completa nell'area riservata

---

## CTA system

Label vincolanti — non inventare varianti.

| Tipo | Testo esatto | Contesto |
|------|-------------|----------|
| Primary pubblica | **Inizia il percorso** | Hero, landing corsi |
| Sessione | **Prenota la Sessione di Svolta** | Pagina sessioni 1:1 |
| Quiz | **Fai il Quiz del Coraggio** | Cross-link da cristian lecca.it |
| Accesso | **Accedi alla piattaforma** | Header, CTA login |
| Iscrizione | **Crea il tuo account** | Pagina registrazione |
| Esercizio | **Completa l'esercizio** | Card esercizio |
| Sessione video | **Entra nella sessione** | Dashboard, prossima sessione |

---

## Componenti UI

### Glass card (identica a cristianlecca-site)

```css
background: rgba(29,32,34,0.4);
backdrop-filter: blur(12px);
border: 1px solid rgba(245,247,250,0.1);
transition: all 0.3s ease-in-out;
```

Hover:
```css
border-color: rgba(73,199,165,0.3);
background: rgba(73,199,165,0.05);
```

### Gradient text

```css
background: linear-gradient(135deg, #49C7A5, #3A63FF);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Progress bar

- Track: `#3d4944` (outline-variant)
- Fill: `#49C7A5` (primary)
- Border radius: full
- Usata per: progressione corso, completamento esercizi, avanzamento percorso

### Badge stato

| Stato | Background | Testo |
|-------|------------|-------|
| Completato | `#49C7A5/15` | `#49C7A5` |
| In corso | `#3A63FF/15` | `#3A63FF` |
| In scadenza | `#C9A45C/15` | `#C9A45C` |
| Bloccato | `#3d4944/40` | `#bccac3` |

### Notifica / alert

- Stessa logica glass card
- Bordo sinistro colorato (2px) per indicare il tipo
- Primary teal = informazione / completamento
- Gold = scadenza imminente
- Red (`#ffb4ab`) = scaduto / richiede azione urgente

### Card corso

- Glass card base
- Thumbnail video (ratio 16:9)
- Badge stato in alto a destra
- Titolo + descrizione breve + progress bar
- CTA in basso

### Card esercizio

- Glass card base
- Icona tipo esercizio (Material Symbols)
- Titolo + istruzioni brevi
- Scadenza (se presente)
- CTA: **Completa l'esercizio** o **Vedi esercizio completato**

### Card sessione

- Glass card con bordo primary/20
- Data + ora in evidenza
- CTA: **Entra nella sessione** (solo se è il giorno della sessione)
- Recap se sessione passata

---

## Mappa personale — visual

La mappa è il componente più identitario della piattaforma. Va trattata con cura.

- Background: `surface-container` scuro
- Aggiornamenti evidenziati in primary teal
- Struttura a sezioni (blocco identificato, credenza lavorata, progressi)
- Ogni aggiornamento ha timestamp e è collegato alla sessione che lo ha generato
- Tono visivo: documento premium, non interfaccia tecnica

---

## Spacing system

Identico a cristianlecca-site:

| Token | Valore |
|-------|--------|
| section-v-desktop | 104px |
| section-v-mobile | 64px |
| stack-lg | 32px |
| stack-md | 16px |
| stack-sm | 8px |
| gutter | 24px |
| container-max | 1280px |

---

## Tailwind config

Identica a cristianlecca-site. Da copiare in ogni pagina senza modifiche.
Il file `partials.md` di questo repo conterrà la config completa e i blocchi canonici.

---

## Regole operative

1. **Prima di creare qualsiasi pagina** — leggere questo file.
2. **Palette** — nessuna variazione, nessun colore inventato.
3. **Tipografia** — Manrope + Inter, sempre.
4. **Componenti** — derivare da cristian lecca-site, estendere solo se necessario.
5. **Niente SaaS generico** — questo non è un template. È una piattaforma con un'identità precisa.
6. **Coerenza pubblico ↔ area riservata** — l'utente non deve sentire uno stacco visivo quando fa login.
7. **Ogni nuovo componente** — va documentato qui prima di essere usato.

---

## Relazione con cristianlecca-site

| Aspetto | cristianlecca.it | ipnosiapplicata.it |
|---------|-----------------|--------------------|
| Palette | Fonte originale | Identica |
| Tipografia | Fonte originale | Identica |
| Header/footer | Fonte originale | Derivati, adattati |
| Componenti base | Fonte originale | Ereditati + estesi |
| Tono visivo | Premium, sobrio | Premium, sobrio |
| Funzione | Brand, trust, ingresso | Piattaforma, percorso, ecosistema |

Se su cristianlecca-site viene aggiornato un componente base (colore, font, header),  
valutare se propagare l'aggiornamento anche qui.
