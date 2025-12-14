import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { createWorkspaceInvitationNotification } from '../services/notificationService.js';

const router = express.Router();

// Helper function to normalize color to 6-digit hex format
const normalizeColor = (color: string): string => {
  if (!color || color === '') return '';
  // Remove whitespace
  color = color.trim();
  // If it's a 3-digit hex, convert to 6-digit
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
  }
  // If it's already 6-digit, return uppercase
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color.toUpperCase();
  }
  return color;
};

const workspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z
    .union([
      z.string().url(),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  color: z
    .string()
    .refine(
      (val) => {
        if (!val || val === '') return true; // Empty string is valid
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val.trim());
      },
      { message: 'Farbe muss ein gültiger Hex-Farbwert sein (z.B. #FF0000 oder #F00)' }
    )
    .optional()
    .or(z.literal(''))
    .transform((val) => {
      if (!val || val === '') return '';
      return normalizeColor(val.trim());
    }),
  teamId: z.string().optional(),
});

// Get recent workspaces (last accessed + newest)
router.get('/recent', authenticate, async (req: AuthRequest, res) => {
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

    const accessFilter = {
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
    };

    // Get last accessed workspaces (sorted by lastAccessedAt DESC, limit 5)
    const lastAccessed = await prisma.workspace.findMany({
      where: {
        ...accessFilter,
        lastAccessedAt: { not: null },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        color: true,
        lastAccessedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    // Get newest workspaces (sorted by updatedAt DESC, limit 5)
    const newest = await prisma.workspace.findMany({
      where: accessFilter,
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        color: true,
        lastAccessedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        lastAccessed,
        newest,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Workspaces',
    });
  }
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
    console.log(`[Workspaces] GET /:id - Workspace ID: ${req.params.id}, User ID: ${req.userId}`);
    
    // Validate workspace ID format (basic check)
    if (!req.params.id || req.params.id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Workspace-ID',
      });
    }
    
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

    // Update lastAccessedAt
    await prisma.workspace.update({
      where: { id: req.params.id },
      data: { lastAccessedAt: new Date() },
    });

    // Track recent activity (delete old entry if exists, then create new)
    await prisma.recentActivity.deleteMany({
      where: {
        userId: req.userId!,
        type: 'workspace',
        entityId: workspace.id,
      },
    });
    await prisma.recentActivity.create({
      data: {
        userId: req.userId!,
        type: 'workspace',
        entityId: workspace.id,
        entityName: workspace.name,
      },
    });

    // Get updated workspace with lastAccessedAt
    const updatedWorkspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
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

    res.json({
      success: true,
      data: updatedWorkspace,
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
    // Check if user has permission (owner or admin)
    const workspace = await prisma.workspace.findFirst({
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
    // Check if user has permission (owner or admin)
    const workspace = await prisma.workspace.findFirst({
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

// Add member to workspace
router.post('/:id/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    // Check if user has permission (owner or admin)
    const workspace = await prisma.workspace.findFirst({
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

    if (!workspace) {
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
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.id,
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

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: req.params.id,
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
    await createWorkspaceInvitationNotification(user.id, workspace.id, workspace.name);

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

// Remove member from workspace
router.delete('/:id/members/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission (owner or admin)
    const workspace = await prisma.workspace.findFirst({
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

    if (!workspace) {
      return res.status(403).json({
        success: false,
        error: 'Keine Berechtigung',
      });
    }

    // Can't remove owner
    if (workspace.ownerId === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Der Besitzer kann nicht entfernt werden',
      });
    }

    // Can't remove yourself if you're the owner
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.id,
          userId: req.params.userId,
        },
      },
    });

    if (memberToRemove && memberToRemove.role === 'owner' && req.userId === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Du kannst dich nicht selbst entfernen',
      });
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.id,
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

export default router;


