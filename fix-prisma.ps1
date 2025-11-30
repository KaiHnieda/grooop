# Prisma Fix-Skript
# Stoppe zuerst den Server (Strg+C), dann führe dieses Skript aus

Write-Host "=== Prisma Fix ===" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path "backend\prisma\schema.prisma")) {
    Write-Host "Fehler: Führe dieses Skript aus dem Root-Verzeichnis (Groop) aus!" -ForegroundColor Red
    exit 1
}

Write-Host "1. Lösche blockierte Prisma-Dateien..." -ForegroundColor Yellow
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    try {
        Remove-Item -Recurse -Force $prismaPath -ErrorAction Stop
        Write-Host "   ✓ Prisma-Dateien gelöscht" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ Konnte nicht alle Dateien löschen (möglicherweise noch blockiert)" -ForegroundColor Yellow
        Write-Host "   Versuche es trotzdem..." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ Keine Prisma-Dateien gefunden" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Lösche alte Migrationen..." -ForegroundColor Yellow
$migrationsPath = "backend\prisma\migrations"
if (Test-Path $migrationsPath) {
    Remove-Item -Recurse -Force $migrationsPath -ErrorAction SilentlyContinue
    Write-Host "   ✓ Alte Migrationen gelöscht" -ForegroundColor Green
} else {
    Write-Host "   ✓ Keine alten Migrationen gefunden" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Lösche alte Datenbank..." -ForegroundColor Yellow
$dbPath = "backend\prisma\dev.db"
if (Test-Path $dbPath) {
    Remove-Item -Force $dbPath -ErrorAction SilentlyContinue
    Write-Host "   ✓ Alte Datenbank gelöscht" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Generiere Prisma Client..." -ForegroundColor Yellow
Set-Location backend
try {
    npm run prisma:generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Prisma Client generiert" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Fehler beim Generieren" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "   ✗ Fehler: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "5. Führe Migration aus..." -ForegroundColor Yellow
try {
    npm run prisma:migrate -- --name init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Migration erfolgreich" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Fehler bei der Migration" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "   ✗ Fehler: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "=== Fertig! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Starte jetzt den Server mit: npm run dev" -ForegroundColor Cyan



