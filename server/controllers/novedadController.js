const { pool } = require('../config/db');
const path = require('path');

exports.createNovedad = async (req, res, next) => {
    try {
        const { scenario, scenario_id, type, description } = req.body;
        const usuario_id = req.session.userId;

        let archivo_url = null;
        if (req.file) {
            // Guardamos la ruta relativa para poder servirla después
            archivo_url = `/uploads/${req.file.filename}`;
        }

        const [result] = await pool.query(
            'INSERT INTO novedades (escenario_id, escenario_nombre, tipo, descripcion, archivo_url, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
            [scenario_id || null, scenario, type, description, archivo_url, usuario_id || null]
        );

        res.status(201).json({
            success: true,
            message: 'Novedad reportada con éxito',
            novedadId: result.insertId,
            archivo_url
        });
    } catch (err) {
        next(err);
    }
};

exports.getNovedades = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM novedades ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        next(err);
    }
};
