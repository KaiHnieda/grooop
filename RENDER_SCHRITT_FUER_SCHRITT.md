# Render Deployment - Schritt für Schritt (GANZ EINFACH)

Diese Anleitung führt dich Schritt für Schritt durch das Deployment auf Render. Folge einfach jedem Schritt.

---

## TEIL 1: PostgreSQL-Datenbank erstellen

### Schritt 1: Postgres auswählen

1. Auf der Render-Seite siehst du verschiedene Karten
2. **Klicke auf die Karte "Postgres"** (die mit dem Datenbank-Symbol)
3. Klicke auf **"Neues Postgres →"**

### Schritt 2: Datenbank konfigurieren

Du siehst jetzt ein Formular. Fülle es so aus:

**Name:**
- Schreibe: `groop-db`
- (Oder einen anderen Namen, den du dir merken kannst)

**Database:**
- Schreibe: `groop`
- (Oder einen anderen Namen)

**User:**
- Schreibe: `groop_user`
- (Oder einen anderen Namen)

**Region:**
- Wähle eine Region aus (z.B. "Frankfurt" wenn du in Deutschland bist)
- **WICHTIG:** Merke dir diese Region! Du brauchst sie später.

**PostgreSQL Version:**
- Lass es auf der neuesten Version (z.B. "16")

**Plan:**
- Wähle **"Free"** (kostenlos)

### Schritt 3: Datenbank erstellen

1. Klicke auf **"Create Database"** (ganz unten)
2. Warte 1-2 Minuten, bis die Datenbank erstellt ist
3. Du siehst dann eine Übersichtsseite

### Schritt 4: DATABASE_URL kopieren

**WICHTIG - Das ist der wichtigste Schritt!**

1. Auf der Datenbank-Übersichtsseite findest du einen Bereich "Connections"
2. Suche nach **"Internal Database URL"**
3. Sie sieht so aus: `postgresql://user:password@host:5432/database`
4. **Klicke auf das Kopier-Symbol** (oder markiere und kopiere den Text)
5. **Speichere diese URL irgendwo** (Notepad, Notizen-App, etc.)
6. Du brauchst sie gleich!

**Fertig mit Teil 1! ✅**

---

## TEIL 2: Backend-Service erstellen

### Schritt 5: Zurück zur Hauptseite

1. Klicke oben links auf **"Projekte"** oder **"Mein Arbeitsbereich"**
2. Oder klicke auf **"+ Neu"** → **"Webdienst"**

### Schritt 6: Webdienst auswählen

1. Klicke auf die Karte **"Webdienste"** (die mit dem Globus-Symbol)
2. Klicke auf **"Neuer Webdienst →"**

### Schritt 7: GitHub-Repository verbinden

1. Du siehst eine Seite "Connect a repository"
2. Klicke auf **"Connect account"** oder **"Connect GitHub"**
3. Falls du noch nicht verbunden bist:
   - Render fragt nach GitHub-Berechtigung
   - Klicke auf **"Authorize"** oder **"Zulassen"**
4. Suche nach deinem Repository: `KaiHnieda/grooop`
5. **Klicke auf das Repository**, um es auszuwählen

### Schritt 8: Service konfigurieren

Jetzt siehst du ein großes Formular. Fülle es Schritt für Schritt aus:

**Name:**
- Schreibe: `groop-backend`
- (Oder einen anderen Namen)

**Region:**
- **WICHTIG:** Wähle die **gleiche Region** wie bei der Datenbank!
- (Z.B. "Frankfurt" wenn du das bei der Datenbank gewählt hast)

**Branch:**
- Schreibe: `main`
- (Oder lass es leer, dann nimmt Render automatisch `main`)

**Root Directory:**
- **WICHTIG:** Schreibe hier: `backend`
- Das sagt Render, dass dein Backend-Code im `backend`-Ordner liegt

**Environment:**
- Wähle: **"Node"**

**Build Command:**
- Schreibe: `npm install && npm run build && npx prisma generate`
- Das installiert Dependencies, baut das Projekt und generiert Prisma

**Start Command:**
- Schreibe: `npm start`
- Das startet deinen Server

**Plan:**
- Wähle: **"Free"** (kostenlos)

### Schritt 9: Environment Variables setzen

Scroll nach unten zu **"Environment Variables"**.

Hier musst du **5 Variablen** hinzufügen:

#### Variable 1: DATABASE_URL

1. Klicke auf **"Add Environment Variable"** oder **"+ Add"**
2. **Key:** `DATABASE_URL`
3. **Value:** Füge hier die **Internal Database URL** ein, die du in Schritt 4 kopiert hast
4. Klicke auf **"Save"** oder **"Add"**

#### Variable 2: JWT_SECRET

1. Klicke auf **"Add Environment Variable"**
2. **Key:** `JWT_SECRET`
3. **Value:** Du musst ein sicheres Secret generieren:
   - Öffne dein Terminal/PowerShell
   - Führe aus: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Kopiere den langen Text, der ausgegeben wird
   - Füge ihn als Value ein
4. Klicke auf **"Save"**

#### Variable 3: PORT

1. Klicke auf **"Add Environment Variable"**
2. **Key:** `PORT`
3. **Value:** `3001`
4. Klicke auf **"Save"**

#### Variable 4: NODE_ENV

1. Klicke auf **"Add Environment Variable"**
2. **Key:** `NODE_ENV`
3. **Value:** `production`
4. Klicke auf **"Save"**

#### Variable 5: FRONTEND_URL

1. Klicke auf **"Add Environment Variable"**
2. **Key:** `FRONTEND_URL`
3. **Value:** Deine Netlify-URL (z.B. `https://voluble-sawine-19bcc7.netlify.app`)
   - **WICHTIG:** Kein Slash am Ende!
   - Keine Leerzeichen!
4. Klicke auf **"Save"**

### Schritt 10: Service erstellen

1. Scroll ganz nach unten
2. Klicke auf **"Create Web Service"** (großer Button)
3. Render startet jetzt automatisch den Build
4. Das dauert 3-5 Minuten

**Fertig mit Teil 2! ✅**

---

## TEIL 3: Datenbank-Migration ausführen

### Schritt 11: Warten auf erfolgreichen Build

1. Auf der Service-Seite siehst du "Deploying..." oder "Building..."
2. Warte, bis du "Live" oder "Deployed" siehst
3. Falls es Fehler gibt, schaue in die "Logs" (Tab oben)

### Schritt 12: Shell öffnen

1. Oben auf der Seite siehst du verschiedene Tabs: "Overview", "Logs", "Shell", etc.
2. Klicke auf den Tab **"Shell"**

### Schritt 13: Migration ausführen

1. In der Shell siehst du eine Eingabezeile
2. Tippe ein: `npx prisma migrate deploy`
3. Drücke Enter
4. Warte, bis du "All migrations have been successfully applied" siehst
5. Falls Fehler kommen, schreibe mir!

**Fertig mit Teil 3! ✅**

---

## TEIL 4: Backend-URL finden und in Netlify eintragen

### Schritt 14: Backend-URL kopieren

1. Auf der Service-Übersichtsseite (Tab "Overview")
2. Oben siehst du eine URL, z.B.: `https://groop-backend.onrender.com`
3. **Kopiere diese URL** (klicke auf das Kopier-Symbol)

### Schritt 15: In Netlify eintragen

1. Gehe zu deinem Netlify-Dashboard
2. Wähle deine Site aus
3. Gehe zu: **Site settings** → **Environment variables**
4. Klicke auf **"Add variable"**

#### Variable 1: VITE_API_URL

1. **Key:** `VITE_API_URL`
2. **Value:** `https://groop-backend.onrender.com/api`
   - Ersetze `groop-backend.onrender.com` mit deiner tatsächlichen Render-URL!
   - **WICHTIG:** Das `/api` am Ende muss bleiben!
3. Klicke auf **"Save"**

#### Variable 2: VITE_SOCKET_URL

1. Klicke auf **"Add variable"**
2. **Key:** `VITE_SOCKET_URL`
3. **Value:** `https://groop-backend.onrender.com`
   - Ersetze `groop-backend.onrender.com` mit deiner tatsächlichen Render-URL!
   - **KEIN** `/api` am Ende!
4. Klicke auf **"Save"**

### Schritt 16: Frontend neu deployen

1. In Netlify, gehe zu **"Deploys"**
2. Klicke auf **"Trigger deploy"** → **"Deploy site"**
3. Oder warte, bis Netlify automatisch neu deployed

**FERTIG! 🎉**

---

## Zusammenfassung - Was du gemacht hast:

1. ✅ PostgreSQL-Datenbank auf Render erstellt
2. ✅ Backend-Service auf Render erstellt
3. ✅ Environment Variables gesetzt
4. ✅ Datenbank-Migration ausgeführt
5. ✅ Backend-URL in Netlify eingetragen
6. ✅ Frontend neu deployed

**Deine App sollte jetzt funktionieren!**

---

## Falls etwas nicht funktioniert:

### Backend startet nicht:
- Prüfe die **Logs** in Render (Tab "Logs")
- Stelle sicher, dass alle Environment Variables gesetzt sind
- Prüfe, ob `Root Directory` auf `backend` gesetzt ist

### Datenbank-Fehler:
- Prüfe, ob `DATABASE_URL` die **Internal Database URL** ist (nicht die externe!)
- Führe nochmal `npx prisma migrate deploy` in der Shell aus

### Frontend kann Backend nicht erreichen:
- Prüfe, ob `VITE_API_URL` in Netlify korrekt ist
- Prüfe, ob das Backend läuft (öffne die Render-URL im Browser)
- Bei kostenlosen Services: Warte nach dem ersten Request (kann etwas dauern)

**Viel Erfolg! 🚀**

