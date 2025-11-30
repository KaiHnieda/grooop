# Render: Environment Variables Problem beheben

## Problem
Der Fehler zeigt: "Fehlende Umgebungsvariablen: DATABASE_URL, JWT_SECRET"

Das bedeutet, dass Render die Environment Variables nicht erkennt.

## Lösung: Environment Variables in Render prüfen und setzen

### Schritt 1: Gehe zu deinem Backend-Service in Render

1. Öffne dein Render-Dashboard
2. Klicke auf deinen Backend-Service (z.B. `groop-backend`)

### Schritt 2: Prüfe die Environment Variables

1. Klicke auf den Tab **"Environment"** (oben in der Navigation)
2. Oder scroll nach unten zu **"Environment Variables"**

**Was du sehen solltest:**
- Eine Liste mit allen gesetzten Environment Variables
- Jede Variable sollte einen **Key** und einen **Value** haben

### Schritt 3: Prüfe, ob DATABASE_URL und JWT_SECRET vorhanden sind

**Falls sie NICHT da sind:**
- Siehe Schritt 4

**Falls sie DA sind, aber der Fehler trotzdem kommt:**
- Prüfe, ob die Werte korrekt sind (keine Leerzeichen, keine Anführungszeichen)
- Siehe Schritt 5

### Schritt 4: Environment Variables hinzufügen

Falls die Variablen fehlen, füge sie hinzu:

#### DATABASE_URL hinzufügen:

1. Klicke auf **"Add Environment Variable"** oder **"+ Add"**
2. **Key:** `DATABASE_URL`
   - **WICHTIG:** Genau so schreiben, keine Leerzeichen!
3. **Value:** 
   - Gehe zu deiner PostgreSQL-Datenbank in Render
   - Kopiere die **"Internal Database URL"**
   - Sie sieht so aus: `postgresql://user:password@host:5432/database`
   - **WICHTIG:** Keine Anführungszeichen, keine Leerzeichen!
4. Klicke auf **"Save"** oder **"Add"**

#### JWT_SECRET hinzufügen:

1. Klicke auf **"Add Environment Variable"**
2. **Key:** `JWT_SECRET`
   - **WICHTIG:** Genau so schreiben, keine Leerzeichen!
3. **Value:** 
   - Öffne dein Terminal/PowerShell lokal
   - Führe aus: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Kopiere den langen Text, der ausgegeben wird
   - **WICHTIG:** Keine Anführungszeichen, keine Leerzeichen!
4. Klicke auf **"Save"**

#### Weitere Variablen (optional, aber empfohlen):

**PORT:**
- Key: `PORT`
- Value: `3001`

**NODE_ENV:**
- Key: `NODE_ENV`
- Value: `production`

**FRONTEND_URL:**
- Key: `FRONTEND_URL`
- Value: Deine Netlify-URL (z.B. `https://voluble-sawine-19bcc7.netlify.app`)
- **WICHTIG:** Kein Slash am Ende!

### Schritt 5: Service neu deployen

Nachdem du die Environment Variables gesetzt hast:

1. Gehe zurück zur Übersichtsseite deines Services
2. Klicke auf **"Manual Deploy"** → **"Deploy latest commit"**
3. Oder warte, bis Render automatisch neu deployed (bei Git Push)

### Schritt 6: Prüfe die Logs

Nach dem Deployment:

1. Klicke auf den Tab **"Logs"**
2. Prüfe, ob der Fehler noch kommt
3. Falls ja, siehe "Häufige Fehler" unten

---

## Häufige Fehler und Lösungen

### Fehler 1: "Fehlende Umgebungsvariablen" kommt immer noch

**Lösung:**
- Prüfe, ob die Keys **genau** so geschrieben sind: `DATABASE_URL` und `JWT_SECRET`
- Keine Leerzeichen vor oder nach dem Key!
- Keine Anführungszeichen im Value!
- Stelle sicher, dass du auf **"Save"** geklickt hast

### Fehler 2: DATABASE_URL ist falsch

**Lösung:**
- Verwende die **Internal Database URL**, nicht die externe!
- Format: `postgresql://user:password@host:5432/database`
- Keine Leerzeichen, keine Anführungszeichen

### Fehler 3: JWT_SECRET ist zu kurz

**Lösung:**
- JWT_SECRET muss mindestens 32 Zeichen lang sein
- Generiere ein neues Secret mit: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Fehler 4: Environment Variables werden nicht übernommen

**Lösung:**
- Nach dem Setzen der Variablen **muss** der Service neu deployed werden
- Klicke auf **"Manual Deploy"** → **"Deploy latest commit"**
- Oder pushe einen neuen Commit zu GitHub

---

## Checkliste

Bevor du den Service neu deployst, prüfe:

- [ ] DATABASE_URL ist gesetzt (Internal Database URL)
- [ ] JWT_SECRET ist gesetzt (mindestens 32 Zeichen)
- [ ] PORT ist gesetzt (optional, aber empfohlen: `3001`)
- [ ] NODE_ENV ist gesetzt (optional, aber empfohlen: `production`)
- [ ] FRONTEND_URL ist gesetzt (deine Netlify-URL, kein Slash am Ende)
- [ ] Alle Keys haben keine Leerzeichen
- [ ] Alle Values haben keine Anführungszeichen
- [ ] Du hast auf "Save" geklickt

---

## Noch immer Probleme?

Falls es immer noch nicht funktioniert:

1. **Prüfe die Logs** in Render (Tab "Logs")
2. **Prüfe die Environment Variables** nochmal (Tab "Environment")
3. **Lösche den Service** und erstelle ihn neu (als letzter Ausweg)

**Oder schreibe mir:**
- Welche Environment Variables du gesetzt hast (ohne die Werte zu zeigen!)
- Was in den Logs steht
- Welcher Fehler genau kommt

