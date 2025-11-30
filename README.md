# Groop - Loop-ähnliche Kollaborations-App

Eine moderne Kollaborations-App ähnlich Microsoft Loop mit Echtzeit-Zusammenarbeit, Arbeitsbereichen und Seiten-Editor.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Echtzeit**: Socket.io
- **Authentifizierung**: JWT

## Projektstruktur

```
Groop/
├── frontend/     # React Frontend
├── backend/      # Express Backend
└── shared/       # Geteilte TypeScript-Typen
```

## Setup

Siehe [SETUP.md](SETUP.md) für eine detaillierte Schritt-für-Schritt-Anleitung.

### Kurzfassung:

1. **Dependencies installieren:**
```bash
npm run install:all
```

2. **PostgreSQL-Datenbank erstellen:**
```bash
createdb groop
# oder mit psql: CREATE DATABASE groop;
```

3. **Backend .env-Datei konfigurieren:**
```bash
cd backend
cp .env.example .env
# Bearbeite .env und passe DATABASE_URL und JWT_SECRET an
```

4. **Prisma Client generieren:**
```bash
cd backend
npm run prisma:generate
```

5. **Datenbank migrieren:**
```bash
cd backend
npm run prisma:migrate
```

6. **App starten:**
```bash
# Aus dem Root-Verzeichnis
npm run dev
```

## Entwicklung

- Frontend läuft auf: http://localhost:5173
- Backend läuft auf: http://localhost:3001

