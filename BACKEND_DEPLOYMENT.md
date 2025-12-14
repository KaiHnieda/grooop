# Backend Deployment Anleitung - RENDER (KOSTENLOS)

Diese Anleitung zeigt dir Schritt für Schritt, wie du das Backend **kostenlos** auf Render deployen kannst.

**Render Free Plan:**
- ✅ 750 Stunden Laufzeit pro Monat (genug für 24/7 Betrieb)
- ✅ Kostenlose PostgreSQL-Datenbank
- ✅ Automatische Deployments von GitHub
- ✅ SSL-Zertifikate inklusive

---

## Schritt 1: Render-Account erstellen

1. Gehe zu [Render](https://render.com)
2. Klicke auf **"Get Started for Free"**
3. Melde dich mit GitHub an (empfohlen)

## Schritt 2: PostgreSQL-Datenbank erstellen

**Wichtig:** Erstelle zuerst die Datenbank, damit du die `DATABASE_URL` später kopieren kannst.

1. Im Render Dashboard, klicke auf **"New +"** → **"PostgreSQL"**
2. Konfiguration:
   - **Name**: `groop-db` (oder wie du möchtest)
   - **Database**: `groop` (oder wie du möchtest)
   - **User**: `groop_user` (oder wie du möchtest)
   - **Region**: Wähle die Region, die am nächsten zu dir ist
   - **PostgreSQL Version**: `16` (oder neueste)
   - **Plan**: **Free** (kostenlos)
3. Klicke auf **"Create Database"**
4. Warte, bis die Datenbank erstellt ist (ca. 1-2 Minuten)
5. **WICHTIG:** Kopiere die **"Internal Database URL"** - du brauchst sie gleich!

## Schritt 3: Backend-Service erstellen

1. Klicke auf **"New +"** → **"Web Service"**
2. Verbinde dein GitHub-Repository: `KaiHnieda/grooop`
3. Wähle das Repository aus

## Schritt 4: Service konfigurieren

Fülle folgende Felder aus:

- **Name**: `groop-backend` (oder wie du möchtest)
- **Region**: Wähle die gleiche Region wie bei der Datenbank
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **WICHTIG!**
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm start`
- **Plan**: **Free** (kostenlos)

## Schritt 5: Environment Variables setzen

Scroll nach unten zu **"Environment Variables"** und füge hinzu:

1. **DATABASE_URL**: 
   - Füge die **Internal Database URL** ein, die du in Schritt 2 kopiert hast
   - Format: `postgresql://user:password@host:5432/database`

2. **JWT_SECRET**: 
   - Generiere ein sicheres Secret (mindestens 32 Zeichen)
   - Führe lokal aus:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Kopiere den generierten Wert und füge ihn ein

3. **PORT**: 
   - `3001` (oder lass es leer, Render setzt es automatisch)

4. **NODE_ENV**: 
   - `production`

5. **FRONTEND_URL**: 
   - Deine Netlify-URL (z.B. `https://voluble-sawine-19bcc7.netlify.app`)
   - **Wichtig:** Kein Slash am Ende!

## Schritt 6: Service erstellen

1. Klicke auf **"Create Web Service"**
2. Render startet automatisch den Build-Prozess
3. Warte, bis der Build fertig ist (ca. 3-5 Minuten)

## Schritt 7: Prisma Migration ausführen

Nach dem ersten Deployment musst du die Datenbank-Migration ausführen:

1. Gehe zu deinem Backend-Service in Render
2. Klicke auf den Tab **"Shell"** (oben rechts)
3. Führe aus:
   ```bash
   npx prisma migrate deploy
   ```
4. Warte, bis die Migration erfolgreich ist

**Alternative:** Du kannst auch lokal die Migration ausführen, wenn du die `DATABASE_URL` temporär setzt.

## Schritt 8: Backend-URL finden

1. Nach erfolgreichem Deployment zeigt Render eine URL an
2. Format: `https://groop-backend.onrender.com`
3. **Kopiere diese URL** - du brauchst sie für Netlify

**Hinweis:** Bei kostenlosen Services kann es beim ersten Aufruf etwas länger dauern (Cold Start), da der Service nach Inaktivität "einschläft".

## Schritt 9: Environment Variables in Netlify setzen

1. Gehe zu deinem Netlify-Dashboard
2. Öffne: **Site settings → Environment variables**
3. Füge hinzu:
   ```
   VITE_API_URL=https://groop-backend.onrender.com/api
   VITE_SOCKET_URL=https://groop-backend.onrender.com
   ```
4. Ersetze `groop-backend.onrender.com` mit deiner tatsächlichen Render-URL

## Schritt 10: Frontend neu deployen

Netlify deployt automatisch neu, oder klicke auf **"Trigger deploy"** → **"Deploy site"**

---

## Wichtige Hinweise

### JWT_SECRET generieren

Führe diesen Befehl lokal aus, um ein sicheres Secret zu generieren:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### DATABASE_URL Format

Die `DATABASE_URL` von Render sieht so aus:
```
postgresql://user:password@host:5432/database
```

**Wichtig:** Verwende die **Internal Database URL**, nicht die externe URL!

### Prisma Migration

**Wichtig**: Nach dem ersten Deployment musst du die Migration ausführen:
```bash
npx prisma migrate deploy
```

Du kannst das in der Render Shell machen (siehe Schritt 7).

### CORS-Konfiguration

Das Backend ist bereits so konfiguriert, dass es die Frontend-URL aus `FRONTEND_URL` verwendet. Stelle sicher, dass diese Variable korrekt gesetzt ist.

### Free Plan Limits

- **750 Stunden Laufzeit pro Monat** (genug für 24/7)
- Service "schläft" nach 15 Minuten Inaktivität (wacht beim nächsten Request auf)
- Erster Request kann etwas länger dauern (Cold Start)

---

## Troubleshooting

### Backend startet nicht

- Prüfe die **Logs** in Render (Tab "Logs")
- Stelle sicher, dass alle Environment Variables gesetzt sind
- Prüfe, ob `DATABASE_URL` korrekt ist
- Prüfe, ob `Root Directory` auf `backend` gesetzt ist

### Datenbank-Verbindung fehlgeschlagen

- Prüfe, ob die PostgreSQL-Datenbank läuft
- Stelle sicher, dass `DATABASE_URL` die **Internal Database URL** ist
- Führe `npx prisma migrate deploy` aus (siehe Schritt 7)

### Frontend kann Backend nicht erreichen

- Prüfe, ob `VITE_API_URL` in Netlify korrekt gesetzt ist
- Prüfe, ob das Backend läuft (öffne die URL im Browser)
- Prüfe CORS-Einstellungen im Backend
- Bei kostenlosen Services: Warte nach dem ersten Request (Cold Start)

### Build schlägt fehl

- Prüfe, ob `Root Directory` auf `backend` gesetzt ist
- Prüfe die Build-Logs in Render
- Stelle sicher, dass alle Dependencies in `package.json` vorhanden sind

---

## Nächste Schritte

Nach erfolgreichem Deployment:
1. ✅ Backend läuft auf Render (kostenlos)
2. ✅ PostgreSQL-Datenbank läuft (kostenlos)
3. ✅ Environment Variables in Netlify gesetzt
4. ✅ Frontend deployed auf Netlify
5. ✅ App sollte jetzt funktionieren!

**Viel Erfolg! 🚀**

---

## Alternative: Andere kostenlose Optionen

Falls Render nicht funktioniert, hier sind andere kostenlose Alternativen:

### Fly.io
- Kostenloser Plan verfügbar
- Ähnlich wie Render
- Website: https://fly.io

### Supabase (nur für Datenbank)
- Kostenlose PostgreSQL-Datenbank
- Website: https://supabase.com

### PlanetScale (nur für Datenbank)
- Kostenlose MySQL-Datenbank
- Website: https://planetscale.com



