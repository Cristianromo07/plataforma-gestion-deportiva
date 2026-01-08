const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const novedadController = require('../controllers/novedadController');
const { isAuthenticated } = require('../middleware/auth');

// Configuración de Multer para almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpg, png, gif) y videos (mp4, mov, avi)'));
    }
});

router.post('/novedades', isAuthenticated, upload.single('archivo'), novedadController.createNovedad);
router.get('/novedades', isAuthenticated, novedadController.getNovedades);

module.exports = router;
