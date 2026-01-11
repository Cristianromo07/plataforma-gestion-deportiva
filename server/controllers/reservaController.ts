import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

interface GenerateDatesParams {
    fecha: string;
    repite?: string;
    intervalo?: string | number;
    dias_semana?: number[];
    fin_tipo?: string;
    fin_fecha?: string;
    fin_repeticiones?: string | number;
}

// Función auxiliar para fechas recurrentes
function generateDates(data: GenerateDatesParams): string[] {
    const dates: string[] = [];
    const start = new Date(data.fecha + 'T00:00:00');

    if (!data.repite || data.repite === 'nunca') return [data.fecha];

    let current = new Date(start);
    const interval = parseInt(data.intervalo as string) || 1;
    const maxRep = data.fin_tipo === 'repeticiones' ? parseInt(data.fin_repeticiones as string) : 1000;
    const endDate = data.fin_tipo === 'fecha' && data.fin_fecha ? new Date(data.fin_fecha + 'T23:59:59') : null;

    if (data.repite === 'diario') {
        while (dates.length < maxRep && (!endDate || current <= endDate)) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + interval);
        }
    } else if (data.repite === 'semanal' || data.repite === 'custom') {
        let weekCounter = 0;
        const selectedDays = Array.isArray(data.dias_semana) ? data.dias_semana : [];
        if (selectedDays.length === 0) return [data.fecha];

        while (dates.length < maxRep && (!endDate || current <= endDate)) {
            if (weekCounter % interval === 0) {
                if (selectedDays.includes(current.getDay())) {
                    dates.push(current.toISOString().split('T')[0]);
                }
            }
            const prevDay = current.getDay();
            current.setDate(current.getDate() + 1);
            if (prevDay === 0 && current.getDay() === 1) weekCounter++;
            // Limit to 2 years to avoid infinite loops
            if (current > new Date(start.getTime() + 730 * 24 * 60 * 60 * 1000)) break;
        }
    } else if (data.repite === 'mensual') {
        while (dates.length < maxRep && (!endDate || current <= endDate)) {
            dates.push(current.toISOString().split('T')[0]);
            current.setMonth(current.getMonth() + interval);
        }
    }
    return dates.length > 0 ? dates : [data.fecha];
}

export const getReservas = async (req: Request, res: Response, next: NextFunction) => {
    const { escenario_id } = req.query;
    try {
        let query = `
      SELECT r.*, u.email as usuario_email, e.nombre as escenario_nombre 
      FROM reservas r
      JOIN users u ON r.usuario_id = u.id
      JOIN escenarios e ON r.escenario_id = e.id
    `;
        const params: any[] = [];
        if (escenario_id) {
            query += ' WHERE r.escenario_id = ?';
            params.push(escenario_id);
        }
        query += ' ORDER BY r.fecha ASC, r.hora_inicio ASC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

export const createReserva = async (req: Request, res: Response, next: NextFunction) => {
    const {
        escenario_id, fecha, hora_inicio, hora_fin, color,
        repite, intervalo, dias_semana, fin_tipo, fin_fecha, fin_repeticiones,
        nombre_solicitante, telefono_solicitante, descripcion_actividad
    } = req.body;
    const usuario_id = req.session.userId;

    if (!escenario_id || !fecha || !hora_inicio || !hora_fin || !color) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const dates = generateDates({ fecha, repite, intervalo, dias_semana, fin_tipo, fin_fecha, fin_repeticiones });

        for (const d of dates) {
            const [overlaps]: any = await connection.query(`
        SELECT * FROM reservas 
        WHERE escenario_id = ? 
        AND fecha = ? 
        AND (hora_inicio < ? AND hora_fin > ?)
      `, [escenario_id, d, hora_fin, hora_inicio]);

            if (overlaps.length > 0) {
                await connection.rollback();
                return res.status(409).json({ error: `Conflicto de horario en la fecha: ${d}` });
            }

            await connection.query(`
        INSERT INTO reservas (
          escenario_id, usuario_id, fecha, hora_inicio, hora_fin, color, 
          nombre_solicitante, telefono_solicitante, descripcion_actividad
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                escenario_id, usuario_id, d, hora_inicio, hora_fin, color,
                nombre_solicitante, telefono_solicitante, descripcion_actividad
            ]);
        }

        await connection.commit();
        res.json({ success: true, message: `Se crearon ${dates.length} reserva(s) exitosamente` });

    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

export const updateReserva = async (req: Request, res: Response, next: NextFunction) => {
    const reservaId = req.params.id;
    const {
        escenario_id, fecha, hora_inicio, hora_fin, color,
        nombre_solicitante, telefono_solicitante, descripcion_actividad
    } = req.body;
    const userId = req.session.userId;
    const userRole = req.session.role;

    try {
        const [rows]: any = await pool.query('SELECT * FROM reservas WHERE id = ?', [reservaId]);
        if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });

        const reserva = rows[0];
        if (userRole !== 'admin' && reserva.usuario_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso' });
        }

        const [overlaps]: any = await pool.query(`
      SELECT * FROM reservas 
      WHERE escenario_id = ? AND fecha = ? AND (hora_inicio < ? AND hora_fin > ?) AND id != ?
    `, [escenario_id, fecha, hora_fin, hora_inicio, reservaId]);

        if (overlaps.length > 0) return res.status(409).json({ error: 'Solapamiento con otra reserva' });

        await pool.query(`
      UPDATE reservas 
      SET escenario_id=?, fecha=?, hora_inicio=?, hora_fin=?, color=?, 
          nombre_solicitante=?, telefono_solicitante=?, descripcion_actividad=? 
      WHERE id=?
    `, [
            escenario_id, fecha, hora_inicio, hora_fin, color,
            nombre_solicitante, telefono_solicitante, descripcion_actividad,
            reservaId
        ]);

        res.json({ success: true, message: 'Reserva actualizada' });

    } catch (err) {
        next(err);
    }
};

export const deleteReserva = async (req: Request, res: Response, next: NextFunction) => {
    const reservaId = req.params.id;
    const userId = req.session.userId;
    const userRole = req.session.role;

    try {
        const [rows]: any = await pool.query('SELECT * FROM reservas WHERE id = ?', [reservaId]);
        if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });

        const reserva = rows[0];
        if (userRole !== 'admin' && reserva.usuario_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta reserva' });
        }

        await pool.query('DELETE FROM reservas WHERE id = ?', [reservaId]);
        res.json({ success: true, message: 'Reserva eliminada' });

    } catch (err) {
        next(err);
    }
};

export const getEscenarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM escenarios ORDER BY nombre');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};
