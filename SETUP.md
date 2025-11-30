# Setup-Anleitung für Groop

## Voraussetzungen

- Node.js (Version 18 oder höher)
- PostgreSQL (Version 14 oder höher)
- npm oder yarn

## Schritt-für-Schritt Setup

### 1. Dependencies installieren

```bash
npm run install:all
```

### 2. PostgreSQL-Datenbank erstellen

Erstelle eine neue PostgreSQL-Datenbank:

```bash
# Mit psql
psql -U postgres
CREATE DATABASE groop;
\q

# Oder mit einem anderen Benutzer
createdb -U dein_benutzer groop
```

### 3. Backend .env-Datei konfigurieren

Kopiere die Beispiel-Datei und passe sie an:

```bash
cd backend
cp .env.example .env
```

Bearbeite die `backend/.env` Datei und passe folgende Werte an:

```env
DATABASE_URL="postgresql://DEIN_BENUTZER:DEIN_PASSWORT@localhost:5432/groop"
JWT_SECRET="generiere-ein-sicheres-secret-mindestens-32-zeichen-lang"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Wichtig:**
- Ersetze `DEIN_BENUTZER` und `DEIN_PASSWORT` mit deinen PostgreSQL-Credentials
- Generiere ein sicheres JWT_SECRET (mindestens 32 Zeichen lang)
- Falls PostgreSQL auf einem anderen Port läuft, passe den Port an

### 4. Prisma Client generieren

```bash
cd backend
npm run prisma:generate
```

### 5. Datenbank migrieren

```bash
cd backend
npm run prisma:migrate
```

Oder direkt:

```bash
cd backend
npx prisma migrate dev --name init
```

Falls du einen Fehler bekommst, dass die Datenbank nicht erreichbar ist:
- Prüfe, ob PostgreSQL läuft: `pg_isready` oder `psql -U postgres -c "SELECT 1;"`
- Prüfe die DATABASE_URL in der .env-Datei
- Stelle sicher, dass die Datenbank existiert

### 6. App starten

Aus dem Root-Verzeichnis:

```bash
npm run dev
```

Dies startet sowohl Frontend (Port 5173) als auch Backend (Port 3001).

## Häufige Probleme

### Problem: "Error: P1001: Can't reach database server"

**Lösung:**
- Prüfe, ob PostgreSQL läuft
- Prüfe die DATABASE_URL in `backend/.env`
- Stelle sicher, dass der Benutzer und das Passwort korrekt sind

### Problem: "Error: P1003: Database does not exist"

**Lösung:**
- Erstelle die Datenbank: `CREATE DATABASE groop;`

### Problem: "Error: P1000: Authentication failed"

**Lösung:**
- Prüfe Benutzername und Passwort in der DATABASE_URL
- Prüfe die PostgreSQL-Konfiguration (pg_hba.conf)

### Problem: "Cannot find module '@groop/shared'"

**Lösung:**
- Stelle sicher, dass alle Dependencies installiert sind: `npm run install:all`
- Prüfe, ob das `shared`-Verzeichnis existiert

### Problem: Port bereits belegt

**Lösung:**
- Ändere den PORT in `backend/.env`
- Oder beende den Prozess, der den Port belegt

## Alternative: SQLite für Entwicklung

Falls du PostgreSQL nicht installieren möchtest, kannst du SQLite verwenden:

1. Ändere in `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Führe die Migration aus:
```bash
cd backend
npx prisma migrate dev --name init
```

**Hinweis:** SQLite wird für Produktion nicht empfohlen, ist aber für Entwicklung in Ordnung.

## Prisma Studio (Optional)

Um die Datenbank visuell zu betrachten:

```bash
cd backend
npm run prisma:studio
```

Dies öffnet Prisma Studio im Browser auf http://localhost:5555



