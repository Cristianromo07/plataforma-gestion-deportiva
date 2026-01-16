import { Router } from 'express';
import authRoutes from './authRoutes';
import reservaRoutes from './reservaRoutes';
import horarioRoutes from './horarioRoutes';
import novedadRoutes from './novedadRoutes';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use(authRoutes);
router.use(reservaRoutes);
router.use(horarioRoutes);
router.use(novedadRoutes);

export default router;
