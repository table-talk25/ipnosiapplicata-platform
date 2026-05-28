# Architettura Piattaforma — IpnosiApplicata

Documento di visione e architettura tecnica della piattaforma ipnosiapplicata.it.  
Questa è la **fonte di verità del progetto**. Ogni decisione tecnica e di prodotto si riferisce a questo file.

**Ultimo aggiornamento:** 28 maggio 2026  
**Owner:** Cristian Lecca  
**Repo:** table-talk25/ipnosiapplicata-platform

---

## Visione

IpnosiApplicata non è un corso online. È una piattaforma di trasformazione personale guidata, dove ogni persona vive un percorso adattivo e personalizzato — non in base al tempo, ma in base a quello che fa.

L'obiettivo finale è accompagnare il maggior numero di persone possibile verso l'autoconsapevolezza di sé. La piattaforma è lo strumento. Il metodo IpnosiApplicata è il motore.

Nessuno viene lasciato solo. Il sistema interviene prima che il cliente si perda.

---

## Principi fondanti

- **Ecosistema chiuso** — il cliente non esce mai dalla piattaforma. Sessioni video, corsi, esercizi, induzioni audio: tutto dentro.
- **Progressione adattiva** — i contenuti si sbloccano in base alle azioni fatte, non al tempo trascorso.
- **Mappa viva** — ogni cliente ha una mappa personale che si aggiorna dopo ogni sessione. Non un report statico: una storyboard del percorso.
- **Supporto proattivo** — se un esercizio non viene completato, il sistema notifica e supporta prima che il cliente si perda.
- **Autonomia come obiettivo** — il percorso punta a rendere il cliente indipendente, non dipendente dalla piattaforma o dal coach.

---

## Livelli utente

| Livello | Chi è | Cosa accede |
|--------|-------|-------------|
| **Visitatore** | Non registrato | Landing pubbliche, contenuti gratuiti, quiz |
| **Studente** | Acquista corsi o abbonamento | Corsi, esercizi, induzioni audio, diario personale |
| **Cliente 1:1** | Lavora direttamente con Cristian | Tutto + sessioni video integrate, mappa personale, recap post-sessione, induzioni personalizzate |
| **Admin** | Cristian | Gestione clienti, caricamento contenuti, invio recap, gestione sessioni |

---

## Architettura pagine pubbliche

```
ipnosiapplicata.it/
├── Home                  → chi è Cristian, cos'è il metodo, CTA principale
├── Metodo                → filosofia IpnosiApplicata, discipline, pilastri
├── Corsi                 → catalogo corsi e programmi formativi
├── Sessioni 1:1          → Sessione di Svolta, percorsi individuali, candidatura
├── Accademia             → abbonamento alla piattaforma, cosa include
├── Blog / Contenuti      → articoli, risorse gratuite, podcast
└── Login / Registrazione
```

---

## Architettura area riservata

```
/dashboard
├── La mia Mappa
│     └── Documento vivo aggiornato dopo ogni sessione.
│         Mostra il territorio interiore del cliente: blocchi identificati,
│         credenze lavorate, progressi registrati.
│
├── Il mio Percorso
│     └── Storyboard cronologica completa.
│         Ogni sessione, ogni esercizio completato, ogni induzione ascoltata.
│         Il cliente vede da dove è partito e ogni passo fatto.
│
├── Sessioni
│     ├── Prossima sessione
│     │     └── Data, ora, accesso diretto alla video call (Twilio Video)
│     └── Sessioni passate
│           └── Recap testuale + mappa aggiornata + esercizi assegnati
│
├── Esercizi
│     ├── Da completare (con scadenza e notifica)
│     ├── Completati (con data e note)
│     └── In attesa di sblocco (con indicazione di cosa fare per sbloccare)
│
├── Induzioni Audio
│     ├── Personalizzate (generate da Cristian dopo la sessione, solo per questo cliente)
│     └── Generali (disponibili per tutti gli utenti attivi)
│
└── Corsi
      ├── In corso (modulo attivo)
      ├── Completati
      └── Bloccati (con indicazione prerequisito da completare)
```

---

## Logica di progressione

1. Il cliente completa una sessione 1:1
2. Cristian invia il recap dalla sua area admin
3. La mappa del cliente si aggiorna automaticamente
4. Vengono assegnati esercizi ad hoc e induzioni personalizzate
5. Il cliente riceve notifica (push su app, email come fallback)
6. Il cliente completa gli esercizi → si sblocca la sessione successiva
7. Se gli esercizi non vengono completati entro la scadenza → notifica di supporto
8. Ogni esercizio completato viene registrato nella storyboard

**Regola fondante:** nessun contenuto si sblocca solo per il passare del tempo.
Si sblocca perché la persona ha fatto qualcosa.

---

## Sistema di notifiche

| Trigger | Canale | Messaggio |
|---------|--------|-----------|
| Esercizio in scadenza oggi | Push + email | Promemoria con descrizione esercizio |
| Sessione domani | Push + email | Promemoria con link accesso |
| Nuova induzione disponibile | Push | Notifica con titolo induzione |
| Esercizio sbloccato | Push | "Nuovo esercizio disponibile" |
| Mappa aggiornata dopo sessione | Push + email | "La tua mappa è stata aggiornata" |

---

## Stack tecnologico

| Componente | Tecnologia | Motivazione |
|-----------|------------|-------------|
| Frontend web | Next.js (React) | Scalabile, SEO-ready, app-ready |
| Database + Auth | Supabase (PostgreSQL) | Open source, real-time, auth integrata |
| Video call 1:1 | Twilio Video | Già in uso nell'ecosistema, API mature |
| Audio/Video contenuti | Mux o Cloudflare Stream | Streaming ottimizzato, DRM disponibile |
| Notifiche push | Expo + Firebase Cloud Messaging | Unifica web e mobile |
| App mobile | React Native / Expo | Stesso codice per iOS, Android e web |
| Pagamenti + abbonamenti | Stripe | Standard di mercato, abbonamenti nativi |
| Email transazionali | Resend o SendGrid | Affidabilità e deliverability |
| Storage file | Supabase Storage o Cloudflare R2 | Audio, PDF, materiali sessione |

**Nota strategica:** la scelta React Native + Expo permette di scrivere il codice una volta e distribuirlo su iOS, Android e web. Quando la piattaforma web è stabile, il passaggio agli store non richiede riscrittura.

---

## Roadmap per fasi

### Fase 1 — Fondamenta pubbliche
- Landing pubbliche: Home, Metodo, Corsi, Sessioni 1:1, Accademia
- Design system (palette, tipografia, componenti) allineato a cristianlecca.it
- SEO base e meta tag
- Integrazione Stripe per pagamenti

### Fase 2 — Autenticazione e area base
- Login / Registrazione / Recupero password
- Dashboard utente base
- Area corsi: acquisto, accesso moduli, progressione
- Gestione abbonamenti via Stripe

### Fase 3 — Mappa personale e progressione
- Mappa personale (documento vivo aggiornabile da admin)
- Storyboard percorso
- Sistema esercizi: assegnazione, completamento, sblocco
- Sistema notifiche (email prima, push dopo integrazione app)

### Fase 4 — Sessioni integrate
- Video call 1:1 via Twilio Video dentro l'area riservata
- Area admin per Cristian: gestione sessioni, invio recap, aggiornamento mappa
- Induzioni audio personalizzate per cliente
- Recap post-sessione con aggiornamento automatico mappa

### Fase 5 — App mobile
- Porting su React Native / Expo
- Notifiche push native
- Player audio offline (induzioni scaricabili)
- Pubblicazione su App Store e Google Play

---

## Domini e relazione con cristianlecca.it

| Sito | Ruolo |
|------|-------|
| **cristianlecca.it** | Brand personale, autorevolezza, trust, contenuti, sessioni 1:1 — porta d'ingresso |
| **ipnosiapplicata.it** | Piattaforma, metodo, formazione, corsi, abbonamenti, area riservata — ecosistema |

I due domini sono complementari, non concorrenti.  
cristianlecca.it porta traffico e fiducia → ipnosiapplicata.it converte e trattiene.

---

## Note operative

- Ogni decisione tecnica rilevante va documentata in questo file prima di essere implementata.
- Ogni nuova feature va collocata nella roadmap prima di essere sviluppata.
- Il design system di ipnosiapplicata.it sarà documentato in un file `design.md` separato (da creare in Fase 1).
- Le API Twilio già in uso nell'ecosistema vanno mappate in un file `integrations.md` (da creare in Fase 2).
