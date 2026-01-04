// server/index.js - Entry point for the refactored layered architecture
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');

const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN CORS ---
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
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

// --- LOGOUT ROOT ALIAS (Opcional, para compatibilidad) ---
app.get('/logout', (req, res) => res.redirect('/api/logout'));

// --- SPA FALLBACK ---
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/dist', 'index.html'));
});

// --- MANEJADOR DE ERRORES (Debe ir después de las rutas) ---
app.use(errorHandler);

// --- INICIALIZACIÓN ---
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
