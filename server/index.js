// server/index.js - Entry point for the refactored layered architecture
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const novedadRoutes = require('./routes/novedadRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- SEGURIDAD Y LOGGING ---
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP si causa conflictos con scripts inline o externos de React en dev
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permitir carga de recursos cruzados (imágenes, etc.)
}));
app.use(morgan('dev')); // 'dev' para logs coloridos en consola, 'combined' para producción

// --- CONFIGURACIÓN CORS ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'client/dist')));

// --- SESIONES ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambiar a true si usas HTTPS
}));

// --- RUTAS API ---
app.use('/api', authRoutes);
app.use('/api', reservaRoutes);
app.use('/api', horarioRoutes);
app.use('/api', novedadRoutes);

// --- LOGOUT ROOT ALIAS (Opcional, para compatibilidad) ---
// --- LOGOUT ROOT ALIAS (Redundante, eliminado) ---
// app.get('/logout', (req, res) => res.redirect('/api/logout'));

// --- SPA FALLBACK ---
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/dist', 'index.html'));
});

// --- MANEJADOR DE ERRORES (Debe ir después de las rutas) ---
app.use(errorHandler);

// --- INICIALIZACIÓN ---
// Solo iniciamos el servidor si NO estamos en modo de prueba (test)
if (process.env.NODE_ENV !== 'test') {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('No se pudo inicializar la base de datos, saliendo.');
      process.exit(1);
    });
}

module.exports = app;
