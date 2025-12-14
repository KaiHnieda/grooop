import { prisma } from '../utils/prisma.js';
import type { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function setNotificationIO(socketIO: SocketIOServer) {
  io = socketIO;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
      },
    });

    // Sende Echtzeit-Benachrichtigung über WebSocket
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    throw error;
  }
}

export async function createTeamInvitationNotification(
  userId: string,
  teamId: string,
  teamName: string
) {
  return createNotification(
    userId,
    'invitation',
    'Team-Einladung',
    `Du wurdest zu "${teamName}" eingeladen`,
    teamId
  );
}

export async function createWorkspaceInvitationNotification(
  userId: string,
  workspaceId: string,
  workspaceName: string
) {
  return createNotification(
    userId,
    'workspace_invitation',
    'Workspace-Einladung',
    `Du wurdest zu "${workspaceName}" eingeladen`,
    workspaceId
  );
}



