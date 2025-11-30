# Backend Deployment Anleitung

Diese Anleitung zeigt dir Schritt für Schritt, wie du das Backend auf Railway oder Render deployen kannst.

## Option 1: Railway (Empfohlen - Einfachste Option)

### Schritt 1: Railway-Account erstellen

1. Gehe zu [Railway](https://railway.app)
2. Klicke auf "Start a New Project"
3. Melde dich mit GitHub an (empfohlen) oder erstelle einen Account

### Schritt 2: Neues Projekt erstellen

1. Klicke auf "New Project"
2. Wähle "Deploy from GitHub repo"
3. Wähle dein Repository: `KaiHnieda/grooop`
4. Railway erkennt automatisch, dass es ein Monorepo ist

### Schritt 3: Backend-Service konfigurieren

1. Railway fragt, welchen Service du deployen möchtest
2. Wähle **"Configure Service"** oder **"Add Service"**
3. Wähle **"Empty Service"** oder **"Node.js"**
4. In den Service-Einstellungen:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`

### Schritt 4: Environment Variables setzen

1. Gehe zu den **Variables** in deinem Railway-Service
2. Füge folgende Environment Variables hinzu:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<generiere-ein-sicheres-secret-mindestens-32-zeichen>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://deine-netlify-url.netlify.app
```

**Wichtig:**
- **DATABASE_URL**: Railway bietet eine PostgreSQL-Datenbank an. Klicke auf "Add PostgreSQL" im Service, dann wird die `DATABASE_URL` automatisch gesetzt
- **JWT_SECRET**: Generiere ein sicheres Secret (mindestens 32 Zeichen). Du kannst z.B. verwenden:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **FRONTEND_URL**: Ersetze mit deiner tatsächlichen Netlify-URL (z.B. `https://voluble-sawine-19bcc7.netlify.app`)

### Schritt 5: PostgreSQL-Datenbank hinzufügen

1. In deinem Railway-Service, klicke auf **"Add Service"**
2. Wähle **"PostgreSQL"**
3. Railway erstellt automatisch eine Datenbank
4. Die `DATABASE_URL` wird automatisch als Environment Variable gesetzt

### Schritt 6: Prisma Migration ausführen

1. Öffne die **Railway CLI** oder verwende das **Railway Dashboard**
2. Führe die Migration aus:
   ```bash
   railway run --service backend npx prisma migrate deploy
   ```
   Oder im Railway Dashboard:
   - Gehe zu deinem Backend-Service
   - Klicke auf "Deployments" → "Latest"
   - Öffne die "Shell" oder "Logs"
   - Führe aus: `npx prisma migrate deploy`

### Schritt 7: Backend-URL finden

1. Nach dem Deployment zeigt Railway eine URL an (z.B. `https://backend-production-xxxx.up.railway.app`)
2. Kopiere diese URL - du brauchst sie für Netlify

### Schritt 8: Environment Variables in Netlify setzen

1. Gehe zu deinem Netlify-Dashboard
2. Öffne: **Site settings → Environment variables**
3. Füge hinzu:
   ```
   VITE_API_URL=https://deine-railway-url.up.railway.app/api
   VITE_SOCKET_URL=https://deine-railway-url.up.railway.app
   ```
4. Ersetze `deine-railway-url.up.railway.app` mit deiner tatsächlichen Railway-URL

### Schritt 9: Frontend neu deployen

Netlify deployt automatisch neu, oder klicke auf "Trigger deploy" → "Deploy site"

---

## Option 2: Render (Alternative)

### Schritt 1: Render-Account erstellen

1. Gehe zu [Render](https://render.com)
2. Melde dich mit GitHub an

### Schritt 2: Neues Web Service erstellen

1. Klicke auf **"New +"** → **"Web Service"**
2. Verbinde dein GitHub-Repository: `KaiHnieda/grooop`
3. Wähle das Repository aus

### Schritt 3: Service konfigurieren

- **Name**: `groop-backend` (oder wie du möchtest)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm start`

### Schritt 4: Environment Variables setzen

Füge folgende Environment Variables hinzu:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<generiere-ein-sicheres-secret>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://deine-netlify-url.netlify.app
```

### Schritt 5: PostgreSQL-Datenbank hinzufügen

1. Klicke auf **"New +"** → **"PostgreSQL"**
2. Render erstellt eine Datenbank
3. Kopiere die **Internal Database URL** und setze sie als `DATABASE_URL`

### Schritt 6: Prisma Migration

Nach dem ersten Deployment:
1. Öffne die **Shell** in Render
2. Führe aus: `npx prisma migrate deploy`

### Schritt 7: Backend-URL finden

Render gibt dir eine URL wie: `https://groop-backend.onrender.com`

### Schritt 8: Environment Variables in Netlify setzen

Wie bei Railway, setze in Netlify:
```
VITE_API_URL=https://groop-backend.onrender.com/api
VITE_SOCKET_URL=https://groop-backend.onrender.com
```

---

## Wichtige Hinweise

### JWT_SECRET generieren

Führe diesen Befehl lokal aus, um ein sicheres Secret zu generieren:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### DATABASE_URL Format

Für PostgreSQL sollte die URL so aussehen:
```
postgresql://username:password@host:5432/database
```

Railway und Render setzen diese automatisch, wenn du ihre PostgreSQL-Datenbank verwendest.

### Prisma Migration

**Wichtig**: Nach dem ersten Deployment musst du die Migration ausführen:
```bash
npx prisma migrate deploy
```

Oder in Railway/Render Shell:
```bash
npx prisma migrate deploy
```

### CORS-Konfiguration

Das Backend ist bereits so konfiguriert, dass es die Frontend-URL aus `FRONTEND_URL` verwendet. Stelle sicher, dass diese Variable korrekt gesetzt ist.

---

## Troubleshooting

### Backend startet nicht

- Prüfe die Logs in Railway/Render
- Stelle sicher, dass alle Environment Variables gesetzt sind
- Prüfe, ob `DATABASE_URL` korrekt ist

### Datenbank-Verbindung fehlgeschlagen

- Prüfe, ob die PostgreSQL-Datenbank läuft
- Stelle sicher, dass `DATABASE_URL` korrekt ist
- Führe `npx prisma migrate deploy` aus

### Frontend kann Backend nicht erreichen

- Prüfe, ob `VITE_API_URL` in Netlify korrekt gesetzt ist
- Prüfe, ob das Backend läuft (öffne die URL im Browser)
- Prüfe CORS-Einstellungen im Backend

---

## Nächste Schritte

Nach erfolgreichem Deployment:
1. ✅ Backend läuft auf Railway/Render
2. ✅ Environment Variables in Netlify gesetzt
3. ✅ Frontend deployed auf Netlify
4. ✅ App sollte jetzt funktionieren!

Viel Erfolg! 🚀

