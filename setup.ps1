# Groop Setup-Skript für Windows

Write-Host "=== Groop Setup ===" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob .env existiert
Write-Host "1. Prüfe Backend .env-Datei..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   ✓ .env existiert bereits" -ForegroundColor Green
} else {
    Write-Host "   ⚠ .env existiert nicht" -ForegroundColor Red
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "   ✓ .env wurde aus .env.example erstellt" -ForegroundColor Green
        Write-Host ""
        Write-Host "   WICHTIG: Bitte bearbeite backend\.env und passe folgende Werte an:" -ForegroundColor Yellow
        Write-Host "   - DATABASE_URL: Deine PostgreSQL-Verbindungszeichenkette" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET: Ein sicheres Secret (mindestens 32 Zeichen)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Drücke Enter, wenn du fertig bist..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "   ✗ .env.example nicht gefunden!" -ForegroundColor Red
        exit 1
    }
}

# Prüfe Prisma Client
Write-Host ""
Write-Host "2. Prüfe Prisma Client..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules\.prisma") {
    Write-Host "   ✓ Prisma Client ist generiert" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Prisma Client wird generiert..." -ForegroundColor Yellow
    Set-Location backend
    npm run prisma:generate
    Set-Location ..
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Prisma Client generiert" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Fehler beim Generieren des Prisma Clients" -ForegroundColor Red
        Write-Host "   Stelle sicher, dass die DATABASE_URL in backend\.env korrekt ist" -ForegroundColor Yellow
        exit 1
    }
}

# Datenbank-Migration
Write-Host ""
Write-Host "3. Führe Datenbank-Migration aus..." -ForegroundColor Yellow
Set-Location backend
npm run prisma:migrate
Set-Location ..
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Datenbank-Migration erfolgreich" -ForegroundColor Green
} else {
    Write-Host "   ✗ Fehler bei der Datenbank-Migration" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Mögliche Ursachen:" -ForegroundColor Yellow
    Write-Host "   - PostgreSQL läuft nicht" -ForegroundColor Yellow
    Write-Host "   - Datenbank 'groop' existiert nicht" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL in backend\.env ist falsch" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Lösungen:" -ForegroundColor Yellow
    Write-Host "   1. Erstelle die Datenbank: CREATE DATABASE groop;" -ForegroundColor Yellow
    Write-Host "   2. Prüfe die DATABASE_URL in backend\.env" -ForegroundColor Yellow
    Write-Host "   3. Stelle sicher, dass PostgreSQL läuft" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Setup abgeschlossen! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Starte die App mit: npm run dev" -ForegroundColor Cyan



