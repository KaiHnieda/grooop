export function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('Fehlende Umgebungsvariablen:', missing.join(', '));
    console.error('Bitte prüfe deine .env-Datei im backend-Verzeichnis');
    return false;
  }

  // Prüfe JWT_SECRET Länge
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('Warnung: JWT_SECRET sollte mindestens 32 Zeichen lang sein');
  }

  return true;
}


