# Netlify Deployment Anleitung

## Übersicht

Diese App besteht aus zwei Teilen:
- **Frontend**: Wird auf Netlify gehostet
- **Backend**: Muss separat gehostet werden (z.B. Railway, Render, Heroku)

## Frontend auf Netlify deployen

### 1. Vorbereitung

1. Erstelle ein Repository auf GitHub/GitLab
2. Committe deinen Code
3. Gehe zu [Netlify](https://www.netlify.com) und verbinde dein Repository

### 2. Build-Einstellungen in Netlify

**WICHTIG für Monorepo/Workspace-Setup:**

Da diese App ein Monorepo mit Workspace-Packages (`@groop/shared`) verwendet, muss der Build-Befehl zuerst im Root installieren, bevor das Frontend gebaut wird.

**In Netlify UI (Site settings → Build & deploy → Build settings):**

- **Build command**: 
  ```
  npm install && cd frontend && npm run build
  ```
  ⚠️ **NICHT** `cd frontend && npm install && npm run build` - das würde `@groop/shared` nicht finden!

- **Publish directory**: 
  ```
  frontend/dist
  ```

- **Base directory**: (leer lassen)

**Alternative:** Wenn du die `netlify.toml` verwenden möchtest (sie liegt im Root), lösche die Build-Einstellungen in der UI, damit die `netlify.toml` verwendet wird.

- **Branch to deploy**: 
  - **Option 1**: Prüfe auf GitHub/GitLab, welcher Branch tatsächlich existiert und trage diesen Namen ein (meistens `main` oder `master`)
  - **Option 2**: Wenn Netlify den Wert nicht akzeptiert:
    1. Klicke auf "Skip to deploy" oder "Deploy site" (ohne das Feld auszufüllen)
    2. Netlify wird automatisch den Standard-Branch verwenden
    3. Nach dem ersten Deploy kannst du in den Einstellungen den Branch ändern
  - **Option 3**: Erstelle zuerst einen Commit und pushe zu GitHub, dann sollte Netlify die Branches erkennen

**Wichtig**: 
- Branch-Namen sind **case-sensitive** (Groß-/Kleinschreibung ist wichtig)
- Meistens: `main` (klein geschrieben)
- Wenn Netlify das Feld nicht akzeptiert, lass es einfach **leer** - das funktioniert auch!

### 3. Environment Variables in Netlify

Gehe zu **Site settings > Environment variables** und füge hinzu:

```
VITE_API_URL=https://deine-backend-url.com/api
VITE_SOCKET_URL=https://deine-backend-url.com
```

**Wichtig**: Ersetze `deine-backend-url.com` mit der tatsächlichen URL deines Backend-Servers!

### 4. Deploy

Netlify baut automatisch bei jedem Push. Oder klicke auf "Deploy site".

## Backend hosten

### Option 1: Railway (Empfohlen)

1. Gehe zu [Railway](https://railway.app)
2. Erstelle ein neues Projekt
3. Verbinde dein GitHub-Repository
4. Wähle das `backend`-Verzeichnis
5. Setze Environment Variables:
   ```
   DATABASE_URL=file:./dev.db
   JWT_SECRET=<generiere-ein-sicheres-secret>
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://deine-netlify-url.netlify.app
   ```
6. Railway startet automatisch den Server

### Option 2: Render

1. Gehe zu [Render](https://render.com)
2. Erstelle einen neuen "Web Service"
3. Verbinde dein Repository
4. Konfiguration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Setze Environment Variables (wie oben)

### Option 3: Heroku

1. Installiere Heroku CLI
2. `cd backend`
3. `heroku create deine-app-name`
4. `heroku config:set DATABASE_URL=... JWT_SECRET=... FRONTEND_URL=...`
5. `git push heroku main`

## Wichtige Konfigurationen

### Backend .env für Produktion

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<mindestens-32-zeichen-langes-secret>
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://deine-netlify-url.netlify.app
```

**Hinweis**: Für Produktion sollte eine PostgreSQL-Datenbank verwendet werden, nicht SQLite!

### Frontend Environment Variables

In Netlify unter **Site settings > Environment variables**:

```
VITE_API_URL=https://deine-backend-url.com/api
VITE_SOCKET_URL=https://deine-backend-url.com
```

## Zusammenarbeit aktivieren

Die App unterstützt Echtzeit-Zusammenarbeit über Socket.io. Stelle sicher, dass:

1. ✅ Backend Socket.io korrekt konfiguriert ist
2. ✅ CORS im Backend die Netlify-URL erlaubt
3. ✅ `VITE_SOCKET_URL` in Netlify gesetzt ist
4. ✅ WebSocket-Verbindungen vom Hosting-Provider erlaubt sind

## Troubleshooting

### Frontend kann Backend nicht erreichen

- Prüfe `VITE_API_URL` in Netlify
- Prüfe CORS-Einstellungen im Backend
- Prüfe ob Backend läuft

### Socket.io Verbindung schlägt fehl

- Prüfe `VITE_SOCKET_URL` in Netlify
- Stelle sicher, dass der Hosting-Provider WebSockets unterstützt
- Prüfe Browser-Konsole auf Fehler

### 404 Fehler beim Navigieren

- Stelle sicher, dass `_redirects` in `frontend/public/` existiert
- Prüfe `netlify.toml` Konfiguration

