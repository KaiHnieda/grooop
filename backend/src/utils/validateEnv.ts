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
    console.error('\n=== DEBUG INFO ===');
    console.error('Verfügbare Environment Variables:');
    const envKeys = Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('JWT') || 
      key.includes('PORT') || 
      key.includes('NODE') ||
      key.includes('FRONTEND')
    );
    if (envKeys.length > 0) {
      envKeys.forEach(key => {
        const value = process.env[key];
        // Zeige nur die ersten/lasten Zeichen für Sicherheit
        if (key === 'JWT_SECRET' || key === 'DATABASE_URL') {
          console.error(`  ${key}: ${value ? value.substring(0, 10) + '...' + value.substring(value.length - 5) : 'NICHT GESETZT'}`);
        } else {
          console.error(`  ${key}: ${value || 'NICHT GESETZT'}`);
        }
      });
    } else {
      console.error('  KEINE Environment Variables gefunden!');
      console.error('  Stelle sicher, dass sie in Render gesetzt sind.');
    }
    console.error('==================\n');
    return false;
  }

  // Prüfe JWT_SECRET Länge
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('Warnung: JWT_SECRET sollte mindestens 32 Zeichen lang sein');
  }

  return true;
}


