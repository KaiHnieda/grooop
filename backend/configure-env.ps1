# PowerShell-Skript zur Konfiguration der .env-Datei

Write-Host "=== Konfiguriere backend/.env ===" -ForegroundColor Green
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

# Generiere ein sicheres JWT_SECRET (64 Zeichen)
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Erstelle .env-Inhalt
$envContent = @"
# Datenbank-URL (SQLite für Entwicklung)
DATABASE_URL="file:./dev.db"

# JWT Secret für Token-Verschlüsselung (mindestens 32 Zeichen)
JWT_SECRET="$jwtSecret"

# Server Port
PORT=3001

# Umgebung
NODE_ENV=development

# Frontend URL für CORS
FRONTEND_URL="http://localhost:5173"
"@

# Schreibe die .env-Datei
try {
    $envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
    Write-Host "[OK] .env-Datei erfolgreich erstellt/aktualisiert!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Konfigurierte Werte:" -ForegroundColor Cyan
    Write-Host "  DATABASE_URL: file:./dev.db" -ForegroundColor White
    Write-Host "  JWT_SECRET: $jwtSecret" -ForegroundColor White
    Write-Host "  PORT: 3001" -ForegroundColor White
    Write-Host "  NODE_ENV: development" -ForegroundColor White
    Write-Host "  FRONTEND_URL: http://localhost:5173" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[FEHLER] Fehler beim Erstellen der .env-Datei: $_" -ForegroundColor Red
    exit 1
}

