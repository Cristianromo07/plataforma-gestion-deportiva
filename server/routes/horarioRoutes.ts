import express from 'express';
import * as horarioController from '../controllers/horarioController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get('/horarios', horarioController.getHorarios);
router.post('/horarios', isAuthenticated, horarioController.saveHorarios);
router.delete('/horarios/:escenario/:nombre', isAuthenticated, horarioController.deleteHorario);

export default router;
