import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const workspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  teamId: z.string().optional(),
});

// Get all workspaces for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get user's teams
    const userTeams = await prisma.team.findMany({
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
      select: { id: true },
    });
    const teamIds = userTeams.map((t: { id: string }) => t.id);

    const workspaces = await prisma.workspace.findMany({
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
          {
            teamId: {
              in: teamIds,
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
        team: {
          select: {
            id: true,
            name: true,
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: workspaces,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Arbeitsbereiche',
    });
  }
});

// Get workspace by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get user's teams for access check
    const userTeams = await prisma.team.findMany({
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
      select: { id: true },
    });
    const teamIds = userTeams.map((t: { id: string }) => t.id);

    const workspace = await prisma.workspace.findFirst({
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
          {
            teamId: {
              in: teamIds,
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
        team: {
          select: {
            id: true,
            name: true,
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
        pages: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Arbeitsbereich nicht gefunden',
      });
    }

    res.json({
      success: true,
      data: workspace,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden des Arbeitsbereichs',
    });
  }
});

// Create workspace
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = workspaceSchema.parse(req.body);

    // If teamId is provided, check if user has access to team
    if (data.teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: data.teamId,
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
      });

      if (!team) {
        return res.status(403).json({
          success: false,
          error: 'Kein Zugriff auf dieses Team',
        });
      }
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        ownerId: req.userId!,
        teamId: data.teamId,
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
      data: workspace,
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
      error: error.message || 'Fehler beim Erstellen des Arbeitsbereichs',
    });
  }
});

// Update workspace
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.userId!,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Arbeitsbereich nicht gefunden oder keine Berechtigung',
      });
    }

    const data = workspaceSchema.partial().parse(req.body);

    const updated = await prisma.workspace.update({
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
      error: error.message || 'Fehler beim Aktualisieren des Arbeitsbereichs',
    });
  }
});

// Delete workspace
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.userId!,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Arbeitsbereich nicht gefunden oder keine Berechtigung',
      });
    }

    await prisma.workspace.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Löschen des Arbeitsbereichs',
    });
  }
});

export default router;


