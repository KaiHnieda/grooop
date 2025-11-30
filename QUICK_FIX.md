# Schnelle Lösung für 500-Fehler

## Problem: Datenbank nicht erreichbar

Die einfachste Lösung ist, SQLite für die Entwicklung zu verwenden.

### Schritt 1: Ändere das Prisma Schema

Öffne `backend/prisma/schema.prisma` und ändere Zeile 8-11:

**Von:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Zu:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Schritt 2: Stoppe den Server

Drücke `Strg+C` im Terminal, wo `npm run dev` läuft.

### Schritt 3: Lösche alte Migrationen (falls vorhanden)

```powershell
cd backend
Remove-Item -Recurse -Force prisma\migrations -ErrorAction SilentlyContinue
```

### Schritt 4: Generiere Prisma Client und führe Migration aus

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### Schritt 5: Starte den Server neu

```powershell
cd ..
npm run dev
```

### Fertig! 🎉

Die App sollte jetzt funktionieren. SQLite speichert die Daten in `backend/prisma/dev.db`.

**Hinweis:** SQLite ist nur für Entwicklung. Für Produktion solltest du PostgreSQL verwenden.



