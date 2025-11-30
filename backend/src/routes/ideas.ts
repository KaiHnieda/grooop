import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

const ideaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string().optional(),
});

// Get all ideas for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const ideas = await prisma.idea.findMany({
      where: {
        userId: req.userId!,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: ideas,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Ideen',
    });
  }
});

// Create idea
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = ideaSchema.parse(req.body);

    // If workspaceId is provided, check access
    if (data.workspaceId) {
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
          ],
        },
      });

      if (!workspace) {
        return res.status(403).json({
          success: false,
          error: 'Kein Zugriff auf diesen Arbeitsbereich',
        });
      }
    }

    const idea = await prisma.idea.create({
      data: {
        ...data,
        userId: req.userId!,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: idea,
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
      error: error.message || 'Fehler beim Erstellen der Idee',
    });
  }
});

// Update idea
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const idea = await prisma.idea.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea nicht gefunden',
      });
    }

    const data = ideaSchema.partial().parse(req.body);

    const updated = await prisma.idea.update({
      where: { id: req.params.id },
      data,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
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
      error: error.message || 'Fehler beim Aktualisieren der Idee',
    });
  }
});

// Delete idea
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const idea = await prisma.idea.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea nicht gefunden',
      });
    }

    await prisma.idea.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Löschen der Idee',
    });
  }
});

export default router;


