const { pool } = require('../config/db');

exports.getHorarios = async (req, res, next) => {
    const { date } = req.query; // Esperamos fecha del lunes YYYY-MM-DD
    try {
        let sql = 'SELECT * FROM personal_horarios';
        const params = [];
        if (date) {
            sql += ' WHERE fecha_inicio = ?';
            params.push(date);
        }
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.saveHorarios = async (req, res, next) => {
    const { entries } = req.body;
    if (!entries || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Query movido al bucle para resolver ID individual
        /*const sql = `
      INSERT INTO personal_horarios 
      (escenario, gestor_nombre, contacto, lunes, martes, miercoles, jueves, viernes, sabado, domingo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      contacto = VALUES(contacto),
      lunes = VALUES(lunes),
      martes = VALUES(martes),
      miercoles = VALUES(miercoles),
      jueves = VALUES(jueves),
      viernes = VALUES(viernes),
      sabado = VALUES(sabado),
      domingo = VALUES(domingo)
    `;*/

        for (const entry of entries) {
            const [escRows] = await connection.query('SELECT id FROM escenarios WHERE nombre = ?', [entry.escenario]);
            const escenarioId = escRows.length > 0 ? escRows[0].id : null;

            await connection.query(`
                    INSERT INTO personal_horarios 
                    (escenario, escenario_id, fecha_inicio, gestor_nombre, contacto, lunes, martes, miercoles, jueves, viernes, sabado, domingo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    escenario_id = VALUES(escenario_id),
                    contacto = VALUES(contacto),
                    lunes = VALUES(lunes),
                    martes = VALUES(martes),
                    miercoles = VALUES(miercoles),
                    jueves = VALUES(jueves),
                    viernes = VALUES(viernes),
                    sabado = VALUES(sabado),
                    domingo = VALUES(domingo)
                `, [
                entry.escenario,
                escenarioId,
                entry.fecha_inicio,
                entry.gestor_nombre,
                entry.contacto || '',
                entry.turnos[0],
                entry.turnos[1],
                entry.turnos[2],
                entry.turnos[3],
                entry.turnos[4],
                entry.turnos[5],
                entry.turnos[6]
            ]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Horarios guardados correctamente' });
    } catch (err) {
        await connection.rollback();
        next(err);
    } finally {
        connection.release();
    }
};

exports.deleteHorario = async (req, res, next) => {
    const { escenario, nombre } = req.params;
    try {
        await pool.query('DELETE FROM personal_horarios WHERE escenario = ? AND gestor_nombre = ?', [escenario, nombre]);
        res.json({ success: true, message: 'Gestor eliminado del escenario' });
    } catch (err) {
        next(err);
    }
};


