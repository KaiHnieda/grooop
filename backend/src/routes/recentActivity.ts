import express from 'express';
import { prisma } from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get recent activity for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const activities = await prisma.recentActivity.findMany({
      where: {
        userId: req.userId!,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Fehler beim Laden der Aktivitäten',
    });
  }
});

export default router;


