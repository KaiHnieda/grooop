# ⚠️ WICHTIG: Server stoppen erforderlich!

## Problem
Der Prisma Client kann nicht generiert werden, weil der Server noch läuft und die Dateien blockiert.

## Lösung

### Schritt 1: Server stoppen
1. Gehe zum Terminal, wo `npm run dev` läuft
2. Drücke **Strg+C** um den Server zu stoppen
3. Warte, bis der Server komplett gestoppt ist

### Schritt 2: Prisma Client generieren und Migration ausführen

Führe diese Befehle **nacheinander** aus:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
cd ..
npm run dev
```

### Schritt 3: Prüfe ob es funktioniert

1. Öffne http://localhost:5173
2. Versuche dich zu registrieren
3. Die Datenbank wird automatisch in `backend/prisma/dev.db` erstellt

## Falls es immer noch nicht funktioniert:

1. **Schließe alle Terminal-Fenster**
2. **Schließe alle Browser-Tabs mit der App**
3. **Warte 5 Sekunden**
4. **Führe die Befehle erneut aus**

## Alternative: Manuell löschen

Falls das Problem weiterhin besteht:

```powershell
cd backend
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
npm run prisma:generate
npm run prisma:migrate -- --name init
```



