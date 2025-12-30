// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- CONFIGURACIÓN CORS ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow dev and prod
  credentials: true
}));

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'client/dist')));

// --- SESIONES ---
app.use(session({
  secret: 'mi-secreto-muy-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true si usas HTTPS
}));

// --- POOL DE MYSQL ---
const dbConfig = {
  host: 'localhost',
  user: 'login_user',
  password: '1234',
  database: 'login_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
const pool = mysql.createPool(dbConfig);

// Seed default admin user if not exists (or reset password)
(async () => {
  try {
    const adminEmail = 'admin@test.com';
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    const hashed = await bcrypt.hash('admin123', 10);
    if (rows.length === 0) {
      await pool.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashed, 'admin']);
      console.log('Default admin user created');
    } else {
      // Update password to known value
      await pool.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashed, 'admin', adminEmail]);
      console.log('Admin user password reset');
    }
  } catch (e) {
    console.error('Error creating/updating default admin user', e);
  }
})();

// --- MIDDLEWARES DE AUTENTICACIÓN ---
const isAuthenticated = (req, res, next) => {
  if (req.session.loggedIn) return next();
  res.status(401).json({ error: 'No autenticado' });
};

const hasRole = (roles) => (req, res, next) => {
  if (req.session.role && roles.includes(req.session.role)) return next();
  res.status(403).json({ error: 'Acceso denegado' });
};

// --- RUTAS API ---
// Escenarios
app.get('/api/escenarios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM escenarios ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener escenarios' });
  }
});

// Reservas
app.get('/api/reservas', async (req, res) => {
  try {
    let query = `
      SELECT r.*, e.nombre AS escenario_nombre, u.email AS usuario_email
      FROM reservas r
      JOIN escenarios e ON r.escenario_id = e.id
      JOIN users u ON r.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.escenario_id) {
      query += ' AND r.escenario_id = ?';
      params.push(req.query.escenario_id);
    }
    if (req.query.usuario_id) {
      query += ' AND r.usuario_id = ?';
      params.push(req.query.usuario_id);
    }
    if (req.query.start && req.query.end) {
      query += ' AND r.fecha BETWEEN ? AND ?';
      params.push(req.query.start, req.query.end);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Crear reserva
app.post('/api/reservas', isAuthenticated, async (req, res) => {
  const { escenario_id, fecha, hora_inicio, hora_fin, color } = req.body;
  const usuario_id = req.session.userId;

  if (!escenario_id || !fecha || !hora_inicio || !hora_fin || !color) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Validar solapamiento
    const [overlaps] = await pool.query(`
      SELECT * FROM reservas 
      WHERE escenario_id = ? 
      AND fecha = ? 
      AND (hora_inicio < ? AND hora_fin > ?)
    `, [escenario_id, fecha, hora_fin, hora_inicio]);

    if (overlaps.length > 0) {
      return res.status(409).json({ error: 'El escenario ya está reservado en ese horario.' });
    }

    await pool.query(`
      INSERT INTO reservas (escenario_id, usuario_id, fecha, hora_inicio, hora_fin, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [escenario_id, usuario_id, fecha, hora_inicio, hora_fin, color]);

    res.json({ success: true, message: 'Reserva creada exitosamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar reserva
app.put('/api/reservas/:id', isAuthenticated, async (req, res) => {
  const reservaId = req.params.id;
  const { escenario_id, fecha, hora_inicio, hora_fin, color } = req.body;
  const userId = req.session.userId;
  const userRole = req.session.role;

  try {
    const [rows] = await pool.query('SELECT * FROM reservas WHERE id = ?', [reservaId]);
    if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = rows[0];
    if (userRole !== 'admin' && reserva.usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    // Validar solapamiento excluyendo la propia reserva
    const [overlaps] = await pool.query(`
      SELECT * FROM reservas 
      WHERE escenario_id = ? AND fecha = ? AND (hora_inicio < ? AND hora_fin > ?) AND id != ?
    `, [escenario_id, fecha, hora_fin, hora_inicio, reservaId]);

    if (overlaps.length > 0) return res.status(409).json({ error: 'Solapamiento con otra reserva' });

    await pool.query(`
      UPDATE reservas SET escenario_id=?, fecha=?, hora_inicio=?, hora_fin=?, color=? WHERE id=?
    `, [escenario_id, fecha, hora_inicio, hora_fin, color, reservaId]);

    res.json({ success: true, message: 'Reserva actualizada' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Eliminar reserva
app.delete('/api/reservas/:id', isAuthenticated, async (req, res) => {
  const reservaId = req.params.id;
  const userId = req.session.userId;
  const userRole = req.session.role;

  try {
    const [rows] = await pool.query('SELECT * FROM reservas WHERE id = ?', [reservaId]);
    if (!rows.length) return res.status(404).json({ error: 'Reserva no encontrada' });

    const reserva = rows[0];
    if (userRole !== 'admin' && reserva.usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta reserva' });
    }

    await pool.query('DELETE FROM reservas WHERE id = ?', [reservaId]);
    res.json({ success: true, message: 'Reserva eliminada' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Información del usuario actual
app.get('/api/user-info', (req, res) => {
  if (req.session.loggedIn) {
    res.json({ loggedIn: true, role: req.session.role, userId: req.session.userId });
  } else {
    res.json({ loggedIn: false });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Email o contraseña incorrectos ❌' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Email o contraseña incorrectos ❌' });

    req.session.loggedIn = true;
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ success: true, user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'El usuario ya existe ❌' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

    res.json({ success: true, message: 'Usuario registrado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
    res.json({ success: true });
  });
});

// --- SPA Wildcard ---
// Debe ir al final
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
