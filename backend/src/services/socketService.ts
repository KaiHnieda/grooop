import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';

interface SocketUser {
  userId: string;
  socketId: string;
}

const activeUsers = new Map<string, SocketUser[]>();

export function setupSocketIO(io: Server) {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentifizierung erforderlich'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return next(new Error('Benutzer nicht gefunden'));
      }

      (socket as any).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Ungültiger Token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    socket.on('join-page', async (pageId: string) => {
      socket.join(`page:${pageId}`);

      // Track active user
      if (!activeUsers.has(pageId)) {
        activeUsers.set(pageId, []);
      }
      const users = activeUsers.get(pageId)!;
      if (!users.find((u) => u.userId === userId)) {
        users.push({ userId, socketId: socket.id });
        activeUsers.set(pageId, users);
      }

      // Notify others
      socket.to(`page:${pageId}`).emit('user-joined', { userId });
    });

    socket.on('leave-page', (pageId: string) => {
      socket.leave(`page:${pageId}`);

      const users = activeUsers.get(pageId);
      if (users) {
        const filtered = users.filter((u) => u.userId !== userId);
        activeUsers.set(pageId, filtered);
      }

      socket.to(`page:${pageId}`).emit('user-left', { userId });
    });

    socket.on('cursor-update', (data: { pageId: string; position: number }) => {
      socket.to(`page:${data.pageId}`).emit('cursor-update', {
        userId,
        position: data.position,
      });
    });

    socket.on('content-update', async (data: { pageId: string; content: any }) => {
      // Broadcast to others
      socket.to(`page:${data.pageId}`).emit('content-update', {
        userId,
        content: data.content,
      });

      // Save to database (debounced in real implementation)
      try {
        await prisma.page.update({
          where: { id: data.pageId },
          data: { content: data.content },
        });
      } catch (error) {
        console.error('Fehler beim Speichern:', error);
      }
    });

    socket.on('disconnect', () => {
      // Remove user from all pages
      for (const [pageId, users] of activeUsers.entries()) {
        const filtered = users.filter((u) => u.socketId !== socket.id);
        activeUsers.set(pageId, filtered);
        if (filtered.length === 0) {
          activeUsers.delete(pageId);
        } else {
          io.to(`page:${pageId}`).emit('user-left', { userId });
        }
      }
    });
  });
}


