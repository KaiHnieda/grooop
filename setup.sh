#!/bin/bash

# Groop Setup-Skript für Linux/Mac

echo "=== Groop Setup ==="
echo ""

# Prüfe ob .env existiert
echo "1. Prüfe Backend .env-Datei..."
if [ -f "backend/.env" ]; then
    echo "   ✓ .env existiert bereits"
else
    echo "   ⚠ .env existiert nicht"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "   ✓ .env wurde aus .env.example erstellt"
        echo ""
        echo "   WICHTIG: Bitte bearbeite backend/.env und passe folgende Werte an:"
        echo "   - DATABASE_URL: Deine PostgreSQL-Verbindungszeichenkette"
        echo "   - JWT_SECRET: Ein sicheres Secret (mindestens 32 Zeichen)"
        echo ""
        read -p "   Drücke Enter, wenn du fertig bist..."
    else
        echo "   ✗ .env.example nicht gefunden!"
        exit 1
    fi
fi

# Prüfe Prisma Client
echo ""
echo "2. Prüfe Prisma Client..."
if [ -d "backend/node_modules/.prisma" ]; then
    echo "   ✓ Prisma Client ist generiert"
else
    echo "   ⚠ Prisma Client wird generiert..."
    cd backend
    npm run prisma:generate
    cd ..
    if [ $? -eq 0 ]; then
        echo "   ✓ Prisma Client generiert"
    else
        echo "   ✗ Fehler beim Generieren des Prisma Clients"
        echo "   Stelle sicher, dass die DATABASE_URL in backend/.env korrekt ist"
        exit 1
    fi
fi

# Datenbank-Migration
echo ""
echo "3. Führe Datenbank-Migration aus..."
cd backend
npm run prisma:migrate
cd ..
if [ $? -eq 0 ]; then
    echo "   ✓ Datenbank-Migration erfolgreich"
else
    echo "   ✗ Fehler bei der Datenbank-Migration"
    echo ""
    echo "   Mögliche Ursachen:"
    echo "   - PostgreSQL läuft nicht"
    echo "   - Datenbank 'groop' existiert nicht"
    echo "   - DATABASE_URL in backend/.env ist falsch"
    echo ""
    echo "   Lösungen:"
    echo "   1. Erstelle die Datenbank: CREATE DATABASE groop;"
    echo "   2. Prüfe die DATABASE_URL in backend/.env"
    echo "   3. Stelle sicher, dass PostgreSQL läuft"
    exit 1
fi

echo ""
echo "=== Setup abgeschlossen! ==="
echo ""
echo "Starte die App mit: npm run dev"



