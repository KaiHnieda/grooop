import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { createTeamInvitationNotification } from '../services/notificationService.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const teamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// Get all teams for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { ownerId: req.userId! },
          {
            members: {
              some: {
                userId: req.userId!,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            workspaces: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Teams',
    });
  }
});

// Get team by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { ownerId: req.userId! },
          {
            members: {
              some: {
              userId: req.userId!,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        workspaces: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team nicht gefunden',
      });
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden des Teams',
    });
  }
});

// Create team
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = teamSchema.parse(req.body);

    const team = await prisma.team.create({
      data: {
        ...data,
        ownerId: req.userId!,
        members: {
          create: {
            userId: req.userId!,
            role: 'owner',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Erstellen des Teams',
    });
  }
});

// Update team
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { ownerId: req.userId! },
          {
            members: {
              some: {
                userId: req.userId!,
                role: { in: ['owner', 'admin'] },
              },
            },
          },
        ],
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team nicht gefunden oder keine Berechtigung',
      });
    }

    const data = teamSchema.partial().parse(req.body);

    const updated = await prisma.team.update({
      where: { id: req.params.id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Aktualisieren des Teams',
    });
  }
});

// Add member to team
router.post('/:id/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { ownerId: req.userId! },
          {
            members: {
              some: {
                userId: req.userId!,
                role: { in: ['owner', 'admin'] },
              },
            },
          },
        ],
      },
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        error: 'Keine Berechtigung, Mitglieder hinzuzufügen',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Benutzer nicht gefunden',
      });
    }

    // Check if already member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: req.params.id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'Benutzer ist bereits Mitglied',
      });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: req.params.id,
        userId: user.id,
        role: 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification
    await createTeamInvitationNotification(user.id, team.id, team.name);

    res.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Hinzufügen des Mitglieds',
    });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { ownerId: req.userId! },
          {
            members: {
              some: {
                userId: req.userId!,
                role: { in: ['owner', 'admin'] },
              },
            },
          },
        ],
      },
    });

    if (!team) {
      return res.status(403).json({
        success: false,
        error: 'Keine Berechtigung',
      });
    }

    // Can't remove owner
    if (team.ownerId === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Der Besitzer kann nicht entfernt werden',
      });
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: req.params.id,
          userId: req.params.userId,
        },
      },
    });

    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Entfernen des Mitglieds',
    });
  }
});

// Delete team
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.userId!,
      },
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team nicht gefunden oder keine Berechtigung',
      });
    }

    await prisma.team.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Löschen des Teams',
    });
  }
});

export default router;

