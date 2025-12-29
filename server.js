// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();

// Middleware para leer formularios
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos (CSS, JS)
app.use(express.static('public'));

// Configuración de sesiones
app.use(session({
  secret: 'mi-secreto', // cambia esto por algo más seguro
  resave: false,
  saveUninitialized: true
}));

// Configuración de conexión MySQL
const dbConfig = {
  host: 'localhost',
  user: 'login_user',   // usuario nuevo
  password: '1234',     // contraseña que definiste
  database: 'login_db'
};


// Middleware de Autenticación (verifica si está logueado)
const isAuthenticated = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  }
  res.redirect('/');
};

// Middleware de Autorización (verifica el rol)
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    // Si el usuario tiene uno de los roles permitidos, continúa
    if (req.session.role && allowedRoles.includes(req.session.role)) {
      return next();
    }
    // Si no tiene permiso, muestra mensaje de acceso denegado
    res.status(403).send('<h1>Acceso denegado 🚫</h1><p>No tienes permiso para ver esta sección.</p><a href="/dashboard">Volver al Dashboard</a>');
  };
};

// API para obtener info del usuario actual (para el frontend)
app.get('/api/user-info', (req, res) => {
  if (req.session.loggedIn) {
    res.json({
      loggedIn: true,
      role: req.session.role,
      name: 'Usuario' // Podrías agregar nombre en la DB
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// Ruta principal: login
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Ruta de login con Rol
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son obligatorios');
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).send('Email o contraseña incorrectos ❌');
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Guardar datos en sesión
      req.session.loggedIn = true;
      req.session.userId = user.id;
      req.session.role = user.role; // <--- IMPORTANTE: Guardamos el rol

      return res.redirect('/dashboard');
    } else {
      return res.status(401).send('Email o contraseña incorrectos ❌');
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send('Error de servidor');
  }
});

// Ruta de registro
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son obligatorios');
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Verificar si el usuario ya existe
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      await connection.end();
      return res.status(400).send('El usuario ya existe ❌');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Por defecto asignamos rol 'empleado' (o lo que decidas)
    // Asegúrate de que tu DB tenga un valor por defecto o incluye la columna 'role'
    // Aquí asumimos que la DB lo maneja o lo dejamos null si no es crítico ahora,
    // pero para seguridad mejor definir un default.
    // Para simplificar, insertamos solo email/pass como antes.
    await connection.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    await connection.end();

    res.send('Usuario registrado ✅. <a href="/">Inicia sesión</a>');

  } catch (err) {
    console.error(err);
    res.status(500).send('Error de servidor');
  }
});


// Dashboard protegido (Accesible para todos los logueados)
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// --- RUTAS ADMINISTRATIVAS ---
// Solo 'admin' puede ver Cultura, Fomento, Actividad, Schedule, etc.
app.get('/cultura', isAuthenticated, hasRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cultura.html'));
});

app.get('/fomento-deportivo', isAuthenticated, hasRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'fomento_deportivo.html'));
});

app.get('/actividad-fisica', isAuthenticated, hasRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'actividad_fisica.html'));
});

app.get('/schedule', isAuthenticated, hasRole(['admin', 'empleado']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'schedule.html'));
});


// --- RUTAS PERMITIDAS PARA EMPLEADO ---
// Escenarios y Perfil
app.get('/subgerencia-escenarios', isAuthenticated, hasRole(['admin', 'empleado']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'subgerencia_escenarios.html'));
});

app.get('/profile', isAuthenticated, hasRole(['admin', 'empleado']), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error al cerrar sesión');
    res.redirect('/');
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
