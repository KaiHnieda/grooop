# Fehlerbehebung - 500 Internal Server Error

## Problem: 500-Fehler beim Registrieren/Login

### Häufige Ursachen und Lösungen:

### 1. Prisma Client nicht generiert

**Symptom:** `Cannot find module '@prisma/client'` oder ähnliche Fehler

**Lösung:**
```powershell
# Stoppe den Server (Strg+C)
cd backend
npm run prisma:generate
```

**Falls EPERM-Fehler auftritt:**
- Stoppe den Server komplett
- Schließe alle Terminal-Fenster
- Versuche es erneut

### 2. Datenbank nicht erreichbar

**Symptom:** `Can't reach database server at localhost:5432`

**Lösung:**

**Option A: PostgreSQL installieren und starten**
1. Installiere PostgreSQL von https://www.postgresql.org/download/
2. Starte den PostgreSQL-Service
3. Erstelle die Datenbank:
```sql
CREATE DATABASE groop;
```

**Option B: SQLite für Entwicklung verwenden (einfacher)**

1. Ändere `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Führe Migration aus:
```powershell
cd backend
npm run prisma:migrate
```

### 3. JWT_SECRET nicht konfiguriert

**Symptom:** `JWT_SECRET ist nicht konfiguriert`

**Lösung:**
1. Öffne `backend/.env`
2. Stelle sicher, dass JWT_SECRET gesetzt ist:
```env
JWT_SECRET="dein-sicheres-secret-mindestens-32-zeichen-lang"
```

3. Generiere ein neues Secret:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Datenbank-Migration nicht ausgeführt

**Symptom:** `Table 'users' does not exist`

**Lösung:**
```powershell
cd backend
npm run prisma:migrate
```

### 5. Umgebungsvariablen nicht geladen

**Symptom:** `DATABASE_URL is not defined`

**Lösung:**
1. Prüfe, ob `backend/.env` existiert
2. Stelle sicher, dass die Datei korrekt formatiert ist (keine Leerzeichen um das `=`)
3. Starte den Server neu

## Schritt-für-Schritt Debugging

1. **Prüfe Backend-Logs:**
   - Schaue in das Terminal, wo der Backend-Server läuft
   - Suche nach Fehlermeldungen

2. **Prüfe Browser-Konsole:**
   - Öffne Developer Tools (F12)
   - Schaue in die Console und Network-Tabs
   - Prüfe die genaue Fehlermeldung

3. **Teste die Datenbank-Verbindung:**
```powershell
cd backend
npx prisma db pull
```

4. **Prüfe Prisma Client:**
```powershell
cd backend
npm run prisma:generate
npx prisma studio
```

## Schnelle Lösung: SQLite verwenden

Falls PostgreSQL Probleme macht, verwende SQLite für die Entwicklung:

1. **Ändere `backend/prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. **Führe Migration aus:**
```powershell
cd backend
npm run prisma:migrate
```

3. **Starte den Server neu:**
```powershell
npm run dev
```

**Hinweis:** SQLite ist nur für Entwicklung geeignet, nicht für Produktion!



