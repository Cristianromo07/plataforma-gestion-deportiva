import express from 'express';
import * as novedadController from '../controllers/novedadController';
import { isAuthenticated } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/novedades', novedadController.getNovedades);
router.post('/novedades', upload.single('archivo'), novedadController.createNovedad);

export default router;
