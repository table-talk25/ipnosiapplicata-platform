# Briefing per Cowork — IpnosiApplicata Platform
**Data:** 6 giugno 2026  
**Repository:** table-talk25/ipnosiapplicata-platform  
**Obiettivo sessione:** aggiornare il codice frontend per comunicare correttamente con PocketBase, e preparare i workflow N8N

---

## Contesto del progetto

IpnosiApplicata è una piattaforma di trasformazione personale creata da Cristian Lecca. Non è un semplice sito di videocorsi — è un ecosistema chiuso dove il cliente vive il suo percorso personalizzato.

**Stack tecnologico reale:**
- Frontend: HTML statico + Alpine.js + Tailwind CSS via CDN
- Backend: PocketBase (https://api.ipnosiapplicata.it)
- Automazioni: N8N
- Email: Brevo (SMTP configurato su PocketBase)
- Pagamenti: Stripe
- Dominio sito: ipnosiapplicata.it
- Dominio API: api.ipnosiapplicata.it

---

## Stato del database PocketBase

Le seguenti collection sono state aggiornate o create oggi. Questa è la struttura attuale e definitiva.

### Collection esistenti — aggiornate

**`users`** — campi aggiunti: `last_name`, `status` (lead/active/paused/cancelled), `consent_privacy`, `quiz_completed_at`. OTP disabilitato. listRule corretta.

**`quiz_responses`** — aggiunto campo `funnel_stage` (quiz_entered/email_sent/platform_accessed/purchased). `maxSelect` corretto a 1 su `profile_result`.

**`purchases`** — campo si chiama `product` (NON `product_id`). Aggiunto valore `active` ai valori di status. Status validi: `pending`, `active`, `completed`, `refunded`, `expired`. Aggiunti campi `stripe_customer_id`, `currency`, `expires_at`. `updateRule` impostata a null.

**`progress`** — aggiunti campi `completed_at` e `last_activity`. Aggiunto indice univoco su `user + product_id`.

**`journey`** — aggiunti campi `description`, `note`, `ref_id`, `ref_collection`, `link`. `updateRule` e `deleteRule` impostate a null — è uno storico immutabile.

### Collection nuove — create oggi

**`sessions`** — sessioni 1:1 tra utente e Cristian. Campi principali: `user`, `number`, `title`, `scheduled_at`, `status` (scheduled/live/completed/cancelled), `video_url`, `recap_argomenti`, `recap_progressi`, `recap_followup`, `map_updated`, `recording_url`, `transcript_url`. Solo admin può creare/modificare.

**`exercises`** — esercizi assegnati da Cristian dopo le sessioni. Campi: `user`, `session` (relation), `title`, `description`, `icon`, `due_at`, `completed`, `completed_at`, `notes`. L'utente può aggiornare (per segnare completed e aggiungere notes) ma non creare o cancellare.

**`audio_tracks`** — induzioni audio. Campi: `user`, `session` (relation), `title`, `description`, `type` (general/personalized), `product_id`, `day`, `file`, `duration_seconds`. File protetto. Solo admin può creare/modificare.

**`maps`** — mappa personale, una per utente. Campi: `user`, `profilo`, `profilo_tags` (JSON), `last_session`, `last_updated_by`. Solo admin può creare/modificare.

**`map_updates`** — ogni aggiornamento alla mappa è un record separato. Campi: `map` (relation con cascadeDelete), `user`, `session_number`, `type` (blocco/credenza/progresso/profilo), `title`, `content`, `content_before`, `content_after`, `status` (in_corso/lavorato). Solo admin può creare/modificare.

---

## Decisioni importanti prese

1. **Il campo acquisto si chiama `product`** — non `product_id`. Tutti i riferimenti nel codice vanno allineati a `product`.

2. **Lo status acquisto valido è `active`** — non `completed`. Quando Stripe conferma il pagamento, N8N crea il record con `status: active`.

3. **Magic link rimosso** — la pagina login usa solo email e password. Il magic link è stato eliminato.

4. **SDK PocketBase** — alcuni file sono stati aggiornati a 0.25.1 da uno strumento esterno. Verificare che tutti i file usino la stessa versione. La versione minima raccomandata è 0.22.0.

5. **Account dormiente** — quando un utente completa il quiz, N8N crea subito un account in `users` con `status: lead`. Quando acquista, N8N lo attiva con `status: active`.

---

## Modifiche al codice da fare — PRIORITÀ ALTA

### 1. `login/index.html` — rimuovere magic link

Rimuovere completamente:
- I due tab "Email e password" / "Link magico"
- L'intera sezione `<div x-show="mode === 'magic'">` con tutto il contenuto
- Il bottone "Accedi con link magico" e il divisore "oppure" dentro il form password
- Aggiornare "Password dimenticata?" da button Alpine a link mailto

```html
<!-- Password dimenticata? — PRIMA -->
<button type="button" @click="mode = 'magic'; form.email = form.email" class="text-xs text-primary hover:text-primary/80 transition-colors">Password dimenticata?</button>

<!-- Password dimenticata? — DOPO -->
<a href="mailto:info@cristianlecca.it" class="text-xs text-primary hover:text-primary/80 transition-colors">Password dimenticata?</a>
```

Nello script rimuovere: `mode`, `magicSent`, `sendMagicLink()`, `handleOTPCallback()` e tutto il codice OTP.

---

### 2. `dashboard/index.html` — allineare campo purchases

Nella funzione `loadAll()` trovare questo:
```javascript
activePurchases = purchasesRes.items.filter(function(p) { return p.status === 'completed'; }).map(function(p) { return p.product; })
```

Cambiare `status === 'completed'` in `status === 'active'`:
```javascript
activePurchases = purchasesRes.items.filter(function(p) { return p.status === 'active'; }).map(function(p) { return p.product; })
```

---

### 3. `corsi/index.html` — allineare campo purchases

Nella funzione `loadUserData()` trovare:
```javascript
pb.collection('purchases').getList(1, 50, { filter: `user="${uid}" && status="active"` })
```
Questo è già corretto per lo status. Verificare che il mapping usi `p.product_id` e cambiarlo in `p.product`:
```javascript
this.purchases = purchasesRes.value.items.map(p => p.product);
```

---

### 4. `reset-notturno/dashboard.html` — allineare campo purchases

Trovare:
```javascript
filter: `user='${uid}' && product='${PRODUCT_ID}' && status='completed'`
```

Cambiare `status='completed'` in `status='active'`:
```javascript
filter: `user='${uid}' && product='${PRODUCT_ID}' && status='active'`
```

---

### 5. `reset-notturno/giorno.html` — salvare diario su PocketBase

Attualmente le risposte del diario vengono salvate solo in localStorage. Aggiungere il salvataggio su PocketBase nella collection `journal_entries` (se esiste) oppure aggiungere un campo `journal_data` JSON alla collection `progress`.

La funzione `saveDay()` attuale salva solo il progress. Aggiungere dopo il salvataggio del progress:

```javascript
// Salva il diario su PocketBase
try {
  await pb.collection('journal_entries').create({
    user: uid,
    product_id: PRODUCT_ID,
    day: this.day.num,
    s1: this.journal.p1,
    s2a: this.journal.p2a,
    s2b: this.journal.p2b,
    s3: this.journal.p3,
    s4: this.journal.p4,
    completed: true,
    completed_at: new Date().toISOString()
  });
} catch(e) {
  console.warn('Salvataggio diario PocketBase fallito:', e.message);
  // Il fallback localStorage è già stato salvato sopra
}
```

Nota: la collection `journal_entries` va creata in PocketBase se non esiste ancora.

---

### 6. `mappa/index.html` — collegare al database reale

Attualmente usa dati fake hardcoded ("Marco Bianchi"). Sostituire la funzione `init()` con chiamate reali a PocketBase:

```javascript
async init() {
  if (!pb.authStore.isValid) { window.location.href = '/login/'; return; }
  try { await pb.collection('users').authRefresh(); }
  catch(e) { pb.authStore.clear(); window.location.href = '/login/'; return; }
  
  this.user = pb.authStore.model;
  const uid = this.user.id;
  
  // Carica mappa
  try {
    const mapRecord = await pb.collection('maps').getFirstListItem(`user='${uid}'`);
    this.map.profilo = mapRecord.profilo || '';
    this.map.profiloTags = mapRecord.profilo_tags || [];
    this.lastUpdate = mapRecord.updated ? new Date(mapRecord.updated).toLocaleDateString('it-IT', {day:'numeric', month:'long', year:'numeric'}) : '—';
  } catch(e) {
    console.warn('Mappa non trovata:', e.message);
  }
  
  // Carica aggiornamenti mappa
  try {
    const updates = await pb.collection('map_updates').getFullList({ filter: `user='${uid}'`, sort: '-created' });
    this.map.blocchi = updates.filter(u => u.type === 'blocco').map(u => ({
      id: u.id, title: u.title, lavorato: u.status === 'lavorato',
      desc: u.content, session: 'Sessione ' + (u.session_number || '—')
    }));
    this.map.credenze = updates.filter(u => u.type === 'credenza').map(u => ({
      id: u.id, before: u.content_before, after: u.content_after,
      session: u.session_number || '—', date: new Date(u.created).toLocaleDateString('it-IT')
    }));
    this.map.progressi = updates.filter(u => u.type === 'progresso').map(u => ({
      id: u.id, text: u.content,
      session: u.session_number || '—', date: new Date(u.created).toLocaleDateString('it-IT')
    }));
    this.sessionCount = Math.max(...updates.map(u => u.session_number || 0), 0);
  } catch(e) {
    console.warn('Aggiornamenti mappa non trovati:', e.message);
  }
  
  // Scroll reveal
  setTimeout(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }, 80);
}
```

---

### 7. `percorso/index.html` — collegare al database reale

Attualmente usa eventi hardcoded. Sostituire i dati statici con chiamate a PocketBase `journey`:

Nella funzione `init()` aggiungere dopo l'auth check:

```javascript
// Carica journey reale
try {
  const journeyRes = await pb.collection('journey').getFullList({
    filter: `user='${uid}'`,
    sort: '-created'
  });
  
  this.events = journeyRes.map(j => ({
    id: j.id,
    month: new Date(j.created).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
    type: j.type,
    typeLabel: {
      quiz: 'Quiz', acquisto: 'Acquisto', reset_giorno: 'Esercizio',
      sessione: 'Sessione 1:1', esercizio: 'Esercizio', audio: 'Audio', sistema: 'Sistema'
    }[j.type] || j.type,
    chipColor: { sessione: 'blue', acquisto: 'teal', reset_giorno: 'teal', audio: 'gold', quiz: 'teal', sistema: 'grey' }[j.type] || 'grey',
    nodeColor: { sessione: 'blue', acquisto: 'teal', reset_giorno: 'teal', audio: 'gold', quiz: 'teal', sistema: 'grey' }[j.type] || 'grey',
    iconColor: { sessione: '#3A63FF', acquisto: '#49C7A5', reset_giorno: '#49C7A5', audio: '#C9A45C', quiz: '#49C7A5', sistema: '#bccac3' }[j.type] || '#bccac3',
    icon: j.icon || 'circle',
    title: j.title,
    time: new Date(j.created).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    desc: j.description || '',
    note: j.note || null,
    link: j.link || null
  }));
  
  // Statistiche
  this.stats.sessions = this.events.filter(e => e.type === 'sessione').length;
  this.stats.exercises = this.events.filter(e => e.type === 'esercizio' || e.type === 'reset_giorno').length;
  this.stats.audio = this.events.filter(e => e.type === 'audio').length;
  if (this.events.length > 0) {
    const first = new Date(journeyRes[journeyRes.length - 1].created);
    const now = new Date();
    this.stats.days = Math.floor((now - first) / (1000 * 60 * 60 * 24));
    this.startDate = first.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }
} catch(e) {
  console.warn('Journey non trovata:', e.message);
}
```

---

### 8. `index.html` — modale "Da dove vuoi iniziare"

Aggiungere la modale prima del tag `</body>` e sostituire tutti i bottoni "Inizia il percorso" con `<button onclick="apriModale()">`.

Il codice completo della modale è già stato preparato in una sessione precedente — cercarlo nella cronologia della conversazione o richiedere che venga rigenerato.

---

### 9. `dashboard/profilo-quiz/index.html` — aggiungere esercizi profilo D

Il blocco placeholder del profilo D va sostituito con il codice completo degli esercizi. Il codice è già stato preparato — cercarlo nella cronologia o richiedere che venga rigenerato.

---

## Workflow N8N da aggiornare/creare

### Workflow 1 — Quiz Coraggio (AGGIORNARE quello esistente)

Aggiungere dopo il nodo "PocketBase – Salva Quiz Response" un nuovo nodo HTTP Request che crea l'utente dormiente:

**Nodo: "PocketBase – Crea Utente Dormiente"**
- Metodo: POST
- URL: `https://api.ipnosiapplicata.it/api/collections/users/records`
- Headers: `Authorization: Bearer {{ $('PocketBase – Login').item.json.token }}`
- Body:
```json
{
  "email": "{{ $('Edit Fields1').item.json.email }}",
  "first_name": "{{ $('Edit Fields1').item.json.first_name }}",
  "quiz_profile": "{{ $('Edit Fields1').item.json.profile_result }}",
  "quiz_completed_at": "{{ $('Edit Fields1').item.json.submitted_at }}",
  "status": "lead",
  "source": "quiz",
  "consent_privacy": {{ $('Edit Fields1').item.json.consent_privacy }},
  "consent_marketing": {{ $('Edit Fields1').item.json.consent_marketing }},
  "password": "{{ $randomString(32) }}",
  "passwordConfirm": "{{ $randomString(32) }}"
}
```

**Attenzione:** password e passwordConfirm devono essere la stessa stringa casuale. Usare un nodo Set prima per generare la password una volta sola e riutilizzarla.

Aggiungere anche gestione del caso "utente già esistente" — se l'email esiste già, aggiornare il record invece di crearne uno nuovo.

---

### Workflow 2 — Stripe Webhook (CREARE DA ZERO)

Trigger: Webhook POST da Stripe
Evento da gestire: `checkout.session.completed`

Nodi da creare in sequenza:
1. Webhook — riceve evento Stripe
2. Verifica firma Stripe (opzionale ma consigliato)
3. Estrai email e product dall'evento Stripe
4. PocketBase Login (stesso nodo del workflow quiz)
5. Cerca utente per email in PocketBase
6. Se utente trovato: aggiorna status a `active`
7. Se utente non trovato: crea utente nuovo con status `active`
8. Crea record in `purchases` con `status: active`
9. Crea record in `progress` per il prodotto acquistato
10. Crea record in `journey` con `type: acquisto`
11. Manda email Brevo di benvenuto con accesso alla piattaforma
12. Notifica Telegram a Cristian

---

### Workflow 3 — Post Sessione (CREARE DA ZERO — da fare dopo Twilio)

Da costruire quando Twilio Video è configurato. Il flusso sarà:
1. Fine sessione Twilio → webhook
2. Download registrazione
3. Trascrizione (Whisper API o servizio esterno)
4. Riassunto AI (Claude API)
5. Popola `sessions.recap_argomenti`, `sessions.recap_progressi`, `sessions.recap_followup`
6. Crea esercizi in `exercises`
7. Crea record in `journey`
8. Notifica utente via email
9. Notifica Cristian via Telegram

---

## Credenziale da mettere in sicurezza — URGENTE

Nel workflow N8N del quiz, il nodo "PocketBase – Login" ha la password admin in chiaro:
```
identity: info@cristianlecca.it  
password: Criswolf25!
```

Spostare immediatamente in una variabile d'ambiente N8N:
- Vai in N8N → Settings → Variables
- Crea variabile `PB_ADMIN_EMAIL` = `info@cristianlecca.it`
- Crea variabile `PB_ADMIN_PASSWORD` = `Criswolf25!`
- Nel nodo sostituire con `{{ $env.PB_ADMIN_EMAIL }}` e `{{ $env.PB_ADMIN_PASSWORD }}`

---

## Ordine di esecuzione consigliato

1. Sicurezza — spostare credenziali N8N in variabili ambiente
2. Login page — rimuovere magic link
3. Acquisti — allineare `product` e `status: active` in tutti i file
4. Homepage — aggiungere modale
5. Profilo D — aggiungere esercizi
6. Mappa e Percorso — collegare al database reale
7. N8N Quiz — aggiungere nodo utente dormiente
8. N8N Stripe — creare workflow pagamento
9. Diario Reset — salvare su PocketBase
