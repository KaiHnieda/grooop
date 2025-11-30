# Backend .env Konfiguration

## Erforderliche Umgebungsvariablen

Die `backend/.env` Datei muss folgende Variablen enthalten:

### 1. DATABASE_URL (Erforderlich)

**Für SQLite (Entwicklung - aktuell konfiguriert):**
```env
DATABASE_URL="file:./dev.db"
```

**Für PostgreSQL (Produktion empfohlen):**
```env
DATABASE_URL="postgresql://BENUTZER:PASSWORT@HOST:PORT/DATENBANKNAME"
```

**Beispiele:**
```env
# Lokal
DATABASE_URL="postgresql://postgres:meinpasswort@localhost:5432/groop"

# Ohne Passwort
DATABASE_URL="postgresql://postgres@localhost:5432/groop"

# Remote Server
DATABASE_URL="postgresql://user:pass@db.example.com:5432/groop"
```

### 2. JWT_SECRET (Erforderlich)

**WICHTIG:** Muss mindestens 32 Zeichen lang sein!

```env
JWT_SECRET="dein-super-sicheres-secret-mindestens-32-zeichen-lang"
```

**Sicheres Secret generieren:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Beispiel:**
```env
JWT_SECRET="8c7efde490cec64db6b170cb44c3a5a403759084dece8719f39eeb8e1194da11"
```

### 3. PORT (Optional)

Port auf dem der Backend-Server läuft. Standard: 3001

```env
PORT=3001
```

### 4. NODE_ENV (Optional)

Umgebung: `development` oder `production`

```env
NODE_ENV=development
```

### 5. FRONTEND_URL (Optional)

URL des Frontends für CORS. Standard: http://localhost:5173

```env
FRONTEND_URL="http://localhost:5173"
```

**Für Produktion:**
```env
FRONTEND_URL="https://deine-domain.com"
```

## Vollständige .env Beispiel-Datei

### Entwicklung (SQLite):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="8c7efde490cec64db6b170cb44c3a5a403759084dece8719f39eeb8e1194da11"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Produktion (PostgreSQL):
```env
DATABASE_URL="postgresql://groop_user:super_sicheres_passwort@localhost:5432/groop_prod"
JWT_SECRET="produktions-secret-mindestens-32-zeichen-lang-und-sehr-sicher"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://groop.example.com"
```

## Sicherheitshinweise

1. **JWT_SECRET**: 
   - Niemals im Code committen!
   - Für jede Umgebung unterschiedlich
   - Mindestens 32 Zeichen, besser 64+

2. **DATABASE_URL**:
   - Enthält Passwörter - niemals committen!
   - In Produktion starkes Passwort verwenden

3. **.env Datei**:
   - Steht bereits in `.gitignore`
   - Niemals in Git committen!

## Prüfen ob alles korrekt ist

```bash
cd backend
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓' : '✗'); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓' : '✗');"
```


