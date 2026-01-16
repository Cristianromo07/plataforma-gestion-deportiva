import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const getReservas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { escenario_id } = req.query;
        let query = 'SELECT r.*, u.email as usuario_email, e.nombre as escenario_nombre FROM reservas r JOIN users u ON r.usuario_id = u.id JOIN escenarios e ON r.escenario_id = e.id';
        const params = [];
        if (escenario_id) { query += ' WHERE r.escenario_id = ?'; params.push(escenario_id); }
        query += ' ORDER BY r.fecha ASC, r.hora_inicio ASC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) { next(err); }
};

export const createReserva = async (req: Request, res: Response, next: NextFunction) => {
    const { escenario_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad } = req.body;
    const usuario_id = req.session.userId;

    try {
        const [overlaps]: any = await pool.query(
            'SELECT * FROM reservas WHERE escenario_id = ? AND fecha = ? AND (hora_inicio < ? AND hora_fin > ?)',
            [escenario_id, fecha, hora_fin, hora_inicio]
        );
        if (overlaps.length > 0) return res.status(409).json({ error: 'Conflicto de horario' });

        await pool.query(
            'INSERT INTO reservas (escenario_id, usuario_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [escenario_id, usuario_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad]
        );
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const updateReserva = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { escenario_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad } = req.body;

        const [overlaps]: any = await pool.query(
            'SELECT * FROM reservas WHERE escenario_id = ? AND fecha = ? AND (hora_inicio < ? AND hora_fin > ?) AND id != ?',
            [escenario_id, fecha, hora_fin, hora_inicio, id]
        );
        if (overlaps.length > 0) return res.status(409).json({ error: 'Conflicto de horario' });

        await pool.query(
            'UPDATE reservas SET escenario_id=?, fecha=?, hora_inicio=?, hora_fin=?, color=?, nombre_solicitante=?, telefono_solicitante=?, descripcion_actividad=? WHERE id=?',
            [escenario_id, fecha, hora_inicio, hora_fin, color, nombre_solicitante, telefono_solicitante, descripcion_actividad, id]
        );
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const deleteReserva = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const getEscenarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM escenarios ORDER BY nombre');
        res.json(rows);
    } catch (err) { next(err); }
};
