import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const pageSchema = z.object({
  title: z.string().min(1),
  workspaceId: z.string(),
  content: z.any().optional(),
});

// Get pages by workspace
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const workspaceId = req.query.workspaceId as string;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: 'workspaceId ist erforderlich',
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
    const teamIds = userTeams.map(t => t.id);

    // Check if user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
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
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        error: 'Kein Zugriff auf diesen Arbeitsbereich',
      });
    }

    const pages = await prisma.page.findMany({
      where: { workspaceId },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Seiten',
    });
  }
});

// Get page by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.id },
      include: {
        workspace: true,
      },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Seite nicht gefunden',
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
    const teamIds = userTeams.map(t => t.id);

    // Check access
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: page.workspaceId,
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
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        error: 'Kein Zugriff auf diese Seite',
      });
    }

    // Update last accessed
    await prisma.page.update({
      where: { id: req.params.id },
      data: { lastAccessedAt: new Date() },
    });

    // Track recent activity
    await prisma.recentActivity.create({
      data: {
        userId: req.userId!,
        type: 'page',
        entityId: page.id,
        entityName: page.title,
      },
    });

    // Parse content from string to JSON for frontend
    const pageWithParsedContent = {
      ...page,
      content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content,
    };

    res.json({
      success: true,
      data: pageWithParsedContent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Seite',
    });
  }
});

// Create page
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = pageSchema.parse(req.body);

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
    const teamIds = userTeams.map(t => t.id);

    // Check workspace access
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: data.workspaceId,
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
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        error: 'Kein Zugriff auf diesen Arbeitsbereich',
      });
    }

    const page = await prisma.page.create({
      data: {
        title: data.title,
        workspaceId: data.workspaceId,
        createdById: req.userId!,
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content || {}),
      },
    });

    // Parse content from string to JSON for frontend
    const pageWithParsedContent = {
      ...page,
      content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content,
    };

    res.json({
      success: true,
      data: pageWithParsedContent,
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
      error: error.message || 'Fehler beim Erstellen der Seite',
    });
  }
});

// Update page
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.id },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Seite nicht gefunden',
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
    const teamIds = userTeams.map(t => t.id);

    // Check access
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: page.workspaceId,
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
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        error: 'Kein Zugriff auf diese Seite',
      });
    }

    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.content !== undefined) {
      updateData.content = typeof req.body.content === 'string' 
        ? req.body.content 
        : JSON.stringify(req.body.content);
    }

    const updated = await prisma.page.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Parse content from string to JSON for frontend
    const updatedWithParsedContent = {
      ...updated,
      content: typeof updated.content === 'string' ? JSON.parse(updated.content) : updated.content,
    };

    res.json({
      success: true,
      data: updatedWithParsedContent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Aktualisieren der Seite',
    });
  }
});

// Delete page
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.id },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Seite nicht gefunden',
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
                role: { in: ['owner', 'admin'] },
              },
            },
          },
        ],
      },
      select: { id: true },
    });
    const teamIds = userTeams.map(t => t.id);

    // Check if user is creator or workspace owner or team admin
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: page.workspaceId,
        OR: [
          { ownerId: req.userId! },
          {
            teamId: {
              in: teamIds,
            },
          },
        ],
      },
    });

    if (!workspace && page.createdById !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Keine Berechtigung zum Löschen',
      });
    }

    await prisma.page.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Löschen der Seite',
    });
  }
});

export default router;

