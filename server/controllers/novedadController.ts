import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const getNovedades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM novedades ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const createNovedad = async (req: Request, res: Response, next: NextFunction) => {
    const { escenario_id, escenario_nombre, tipo, descripcion } = req.body;
    const usuario_id = req.session.userId;
    const archivo_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await pool.query(
            'INSERT INTO novedades (escenario_id, escenario_nombre, tipo, descripcion, archivo_url, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
            [escenario_id || null, escenario_nombre, tipo, descripcion, archivo_url, usuario_id || null]
        );
        res.json({ success: true, message: 'Novedad registrada' });
    } catch (err) {
        next(err);
    }
};
