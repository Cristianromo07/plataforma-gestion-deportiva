const { pool } = require('../config/db');

exports.getHorarios = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM personal_horarios');
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

        const sql = `
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
    `;

        for (const entry of entries) {
            await connection.query(sql, [
                entry.escenario,
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
