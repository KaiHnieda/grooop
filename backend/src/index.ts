import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspaces.js';
import pageRoutes from './routes/pages.js';
import ideaRoutes from './routes/ideas.js';
import notificationRoutes from './routes/notifications.js';
import recentActivityRoutes from './routes/recentActivity.js';
import teamRoutes from './routes/teams.js';
import { setupSocketIO } from './services/socketService.js';
import { validateEnv } from './utils/validateEnv.js';

dotenv.config();

// Validiere Umgebungsvariablen beim Start
if (!validateEnv()) {
  console.error('Server wird nicht gestartet - fehlende Konfiguration');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

// CORS-Origins konfigurieren (für Netlify + lokale Entwicklung)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Erlaube Requests ohne Origin (z.B. Postman, mobile Apps)
    if (!origin) return callback(null, true);
    
    // Prüfe ob Origin erlaubt ist
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Nicht erlaubt durch CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recent-activity', recentActivityRoutes);
app.use('/api/teams', teamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Interner Serverfehler',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route nicht gefunden',
  });
});

// Setup Socket.io
setupSocketIO(io);

httpServer.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Konfiguriert' : 'FEHLT!'}`);
  console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Konfiguriert' : 'FEHLT!'}`);
});

