# Schema PocketBase — IpnosiApplicata

Fonte di verità per tutte le collection del database.  
Ogni campo, tipo, relazione e regola di accesso è documentato qui.  
**Aggiornare questo file prima di modificare lo schema in produzione.**

**Ultimo aggiornamento:** 30 maggio 2026  
**PocketBase URL (produzione):** https://api.ipnosiapplicata.it

---

## Indice collection

1. [users](#1-users)
2. [maps](#2-maps)
3. [map_updates](#3-map_updates)
4. [purchases](#4-purchases)
5. [progress](#5-progress)
6. [journal_entries](#6-journal_entries)
7. [sessions](#7-sessions)
8. [exercises](#8-exercises)
9. [audio_tracks](#9-audio_tracks)
10. [journey](#10-journey)

---

## 1. users

Estende la collection `_pb_users_auth_` nativa di PocketBase.  
Creato da N8N al completamento del quiz oppure alla registrazione diretta.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | PocketBase nativo |
| `email` | Email | ✅ | Unico, usato per auth |
| `name` | Text | ✅ | Nome completo |
| `avatar` | File | — | Immagine profilo opzionale |
| `phone` | Text | — | Facoltativo |
| `source` | Select | ✅ | `quiz` / `direct` / `stripe` |
| `quiz_score` | Number | — | Punteggio grezzo dal Quiz del Coraggio |
| `quiz_profile` | Select | — | `guerriero` / `esploratore` / `costruttore` / `risvegliato` (da definire con Cristian) |
| `quiz_answers` | JSON | — | Risposte raw del quiz, archiviate per riferimento |
| `quiz_completed_at` | DateTime | — | Timestamp completamento quiz |
| `created` | DateTime | ✅ | Auto |
| `updated` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** solo API key (N8N, Stripe webhook)
- **Read:** utente stesso + admin
- **Update:** utente stesso (name, avatar, phone) + admin (tutti i campi)
- **Delete:** solo admin

---

## 2. maps

La mappa personale dell'utente. Un record per utente.  
Creato da N8N post-quiz con il profilo di partenza. Aggiornato da Cristian (admin) dopo ogni sessione.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | Unico (max 1 mappa per utente) |
| `profilo` | Text (long) | ✅ | Descrizione narrativa del profilo di partenza |
| `profilo_tags` | JSON | — | Array di `{icon, label, value}` — generato da N8N dal quiz |
| `last_session` | Number | — | Numero dell'ultima sessione che ha aggiornato la mappa |
| `last_updated_by` | Text | — | `n8n` / `admin` / `system` |
| `created` | DateTime | ✅ | Auto — coincide con completamento quiz |
| `updated` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** solo API key (N8N)
- **Read:** utente stesso + admin
- **Update:** solo admin (Cristian aggiorna via pannello)
- **Delete:** solo admin

---

## 3. map_updates

Ogni aggiornamento alla mappa è un record separato.  
Permette la storia completa della mappa e i blocchi/credenze/progressi distinti per sessione.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `map` | Relation → maps | ✅ | |
| `user` | Relation → users | ✅ | Denormalizzato per query veloci |
| `session_number` | Number | — | Numero sessione di riferimento (null = da quiz) |
| `type` | Select | ✅ | `blocco` / `credenza` / `progresso` / `profilo` |
| `title` | Text | ✅ | Titolo breve dell'aggiornamento |
| `content` | Text (long) | ✅ | Corpo del testo |
| `content_before` | Text (long) | — | Solo per tipo `credenza`: la credenza limitante |
| `content_after` | Text (long) | — | Solo per tipo `credenza`: la nuova verità |
| `status` | Select | — | Solo per tipo `blocco`: `in_corso` / `lavorato` |
| `created` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** solo admin
- **Read:** utente owner + admin
- **Update:** solo admin
- **Delete:** solo admin

---

## 4. purchases

Ogni acquisto di un prodotto. Creato da Stripe webhook → N8N.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | |
| `product_id` | Select | ✅ | `reset-notturno` / `autostima-21` / `sessioni-1to1` / `accademia` |
| `stripe_payment_id` | Text | ✅ | ID transazione Stripe |
| `stripe_customer_id` | Text | — | Per abbonamenti ricorrenti |
| `amount` | Number | ✅ | Importo in centesimi |
| `currency` | Text | ✅ | Default: `eur` |
| `status` | Select | ✅ | `active` / `expired` / `refunded` / `paused` |
| `expires_at` | DateTime | — | Per accessi a tempo (es. abbonamenti) |
| `created` | DateTime | ✅ | Auto — data acquisto |

### Regole di accesso
- **Create:** solo API key (Stripe webhook → N8N)
- **Read:** utente stesso + admin
- **Update:** solo admin + API key
- **Delete:** solo admin

### Logica sblocco contenuti
```
Frontend chiama: GET /api/collections/purchases/records
  filter: user = CURRENT_USER_ID && status = "active"
Risposta: lista product_id acquistati
Frontend mostra solo quelli nella dashboard
```

---

## 5. progress

Avanzamento dell'utente in ogni corso/programma. Un record per coppia utente+prodotto.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | |
| `product_id` | Text | ✅ | Es: `reset-notturno` |
| `current_step` | Number | ✅ | Es: giorno corrente (1-7 per Reset Notturno) |
| `completed_steps` | JSON | — | Array di step completati: `[1, 2, 3]` |
| `completed_at` | DateTime | — | Data completamento totale del programma |
| `last_activity` | DateTime | — | Ultima azione registrata |
| `created` | DateTime | ✅ | Auto |
| `updated` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** utente stesso + API key
- **Read:** utente stesso + admin
- **Update:** utente stesso + admin
- **Delete:** solo admin

---

## 6. journal_entries

Ogni compilazione del diario (una per giorno del Reset Notturno).

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | |
| `product_id` | Text | ✅ | Es: `reset-notturno` |
| `day` | Number | ✅ | Giorno di riferimento (1-7) |
| `s1` | Text (long) | — | Il Respiro del Risveglio |
| `s2a` | Text (long) | — | Il Vecchio Seme (credenza limitante) |
| `s2b` | Text (long) | — | La Nuova Verità (riformulazione) |
| `s3` | Text (long) | — | L'Evidenza del Cambiamento |
| `s4` | Text (long) | — | L'Ancoraggio e il Sigillo |
| `completed` | Bool | ✅ | Default: false |
| `completed_at` | DateTime | — | Timestamp completamento |
| `created` | DateTime | ✅ | Auto |
| `updated` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** utente stesso
- **Read:** utente stesso + admin
- **Update:** utente stesso (entro 24h) + admin
- **Delete:** solo admin

### Indice unico
`user + product_id + day` → unico (un solo diario per giorno per utente)

---

## 7. sessions

Sessioni 1:1 tra utente e Cristian.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | |
| `number` | Number | ✅ | Numero progressivo sessione (1, 2, 3...) |
| `title` | Text | ✅ | Es: "Sessione 2 — Ancoraggio del Valore" |
| `scheduled_at` | DateTime | ✅ | Data e ora della sessione |
| `status` | Select | ✅ | `scheduled` / `live` / `completed` / `cancelled` |
| `video_link` | URL | — | Link Twilio Video (generato prima della sessione) |
| `recap` | Text (long) | — | Testo recap scritto da Cristian post-sessione |
| `exercises_assigned` | Relation → exercises | — | Esercizi assegnati in questa sessione |
| `audio_assigned` | Relation → audio_tracks | — | Induzioni assegnate in questa sessione |
| `map_updated` | Bool | — | Flag: Cristian ha aggiornato la mappa dopo questa sessione |
| `created` | DateTime | ✅ | Auto |
| `updated` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** solo admin
- **Read:** utente owner + admin
- **Update:** admin (recap, map_updated, status) + sistema (status live/completed)
- **Delete:** solo admin

---

## 8. exercises

Esercizi assegnati da Cristian dopo le sessioni.

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | |
| `session` | Relation → sessions | — | Sessione che ha generato l'esercizio |
| `title` | Text | ✅ | |
| `description` | Text (long) | ✅ | Istruzioni complete |
| `icon` | Text | — | Material Symbol name (es: `self_improvement`) |
| `due_at` | DateTime | — | Scadenza |
| `completed` | Bool | ✅ | Default: false |
| `completed_at` | DateTime | — | |
| `notes` | Text (long) | — | Note dell'utente al completamento |
| `created` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** solo admin
- **Read:** utente owner + admin
- **Update:** utente owner (completed, notes) + admin
- **Delete:** solo admin

---

## 9. audio_tracks

Induzioni audio — sia generali (per tutti) che personalizzate (per singolo utente).

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `title` | Text | ✅ | |
| `description` | Text (long) | — | |
| `file` | File | ✅ | Audio MP3/M4A — PocketBase Storage |
| `duration_seconds` | Number | — | Durata in secondi |
| `type` | Select | ✅ | `general` / `personalized` |
| `product_id` | Text | — | Es: `reset-notturno` (null = non legato a corso) |
| `day` | Number | — | Solo per audio di corsi giornalieri (es. Giorno 1-7) |
| `user` | Relation → users | — | Null se general, valorizzato se personalized |
| `session` | Relation → sessions | — | Sessione che ha generato l'audio personalizzato |
| `created` | DateTime | ✅ | Auto |

### Regole di accesso
- **Create:** solo admin
- **Read (general):** qualsiasi utente con purchase attivo del product_id
- **Read (personalized):** solo utente owner + admin
- **Update:** solo admin
- **Delete:** solo admin

### URL audio firmati
Il frontend non usa mai l'URL diretto del file.  
Chiama sempre: `GET /api/files/audio_tracks/{record_id}/{filename}?token=JWT`  
Il token JWT è quello dell'utente autenticato — PocketBase lo valida automaticamente.

---

## 10. journey

Log cronologico di ogni azione dell'utente. Alimenta `/percorso.html`.  
Scritto automaticamente dal sistema (mai dall'utente).

| Campo | Tipo | Obbligatorio | Note |
|-------|------|:---:|------|
| `id` | ID auto | ✅ | |
| `user` | Relation → users | ✅ | |
| `type` | Select | ✅ | `sessione` / `esercizio` / `audio` / `corso` / `acquisto` / `sistema` |
| `title` | Text | ✅ | Testo breve visualizzato nella timeline |
| `description` | Text (long) | — | Testo esteso |
| `note` | Text (long) | — | Nota di Cristian (solo per sessioni) |
| `icon` | Text | — | Material Symbol name |
| `link` | URL | — | Link diretto alla risorsa correlata |
| `ref_id` | Text | — | ID del record sorgente (es. ID sessione, ID esercizio) |
| `ref_collection` | Text | — | Nome collection sorgente |
| `created` | DateTime | ✅ | Auto — usato come timestamp nella timeline |

### Chi scrive nella journey
| Evento | Trigger |
|--------|---------|
| Acquisto prodotto | Stripe webhook → N8N |
| Sessione completata | Admin (Cristian) |
| Esercizio completato | Frontend (utente) |
| Audio ascoltato | Frontend (utente, al 90% della traccia) |
| Giorno corso completato | Frontend (utente) |
| Mappa aggiornata | Admin (Cristian) |

### Regole di accesso
- **Create:** utente stesso + admin + API key
- **Read:** utente owner + admin
- **Update:** solo admin
- **Delete:** solo admin

---

## Flusso completo Quiz → Mappa

```
1. Utente completa Quiz del Coraggio su cristianlecca.it/quiz/
2. N8N riceve le risposte via webhook
3. N8N calcola profilo (quiz_profile) e punteggio (quiz_score)
4. N8N → POST /api/collections/users/records
     { email, name, source: "quiz", quiz_score, quiz_profile, quiz_answers }
5. N8N → POST /api/collections/maps/records
     { user: USER_ID, profilo: TESTO_GENERATO, profilo_tags: TAGS_GENERATI }
6. N8N → POST /api/collections/journey/records
     { user: USER_ID, type: "sistema", title: "Profilo di partenza creato dal Quiz del Coraggio" }
7. N8N → requestOTP(email) → manda magic link a /login.html
8. Utente clicca → accede → vede mappa già popolata
```

---

## Flusso Acquisto → Sblocco contenuto

```
1. Utente acquista Reset Notturno su Stripe
2. Stripe webhook → N8N
3. N8N → POST /api/collections/purchases/records
     { user: USER_ID, product_id: "reset-notturno", stripe_payment_id, amount, status: "active" }
4. N8N → POST /api/collections/progress/records
     { user: USER_ID, product_id: "reset-notturno", current_step: 1, completed_steps: [] }
5. N8N → POST /api/collections/journey/records
     { type: "acquisto", title: "Reset Notturno sbloccato" }
6. N8N → manda email con magic link a /reset-notturno/dashboard.html
7. Utente accede → vede dashboard con Giorno 1 attivo
```

---

## Note tecniche

- **Auth:** PocketBase gestisce JWT nativamente. Il frontend usa `pb.authStore.token` per tutte le chiamate autenticate.
- **OTP (magic link):** `pb.collection('users').requestOTP(email)` → PocketBase manda l'email con il token.
- **File protetti:** tutti i file audio usano l'auth JWT di PocketBase — non servono URL firmati separati.
- **Admin API:** Cristian accede al pannello admin PocketBase su `https://api.ipnosiapplicata.it/_/` per aggiornare mappe, scrivere recap sessioni, assegnare esercizi.
- **Backup:** PocketBase supporta backup automatici su S3/R2 — configurare su Coolify.
