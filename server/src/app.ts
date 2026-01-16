import express, { Express, Request, Response } from 'express';
import path from 'path';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import apiRoutes from './routes/index';
import errorHandler from './middleware/errorHandler';

const app: Express = express();

// Robust path calculation for dev and prod
// Robust path calculation for dev and prod
const projectRoot = __dirname.includes('dist')
    ? path.join(__dirname, '..')
    : path.join(__dirname, '../..');
const clientDistPath = path.join(projectRoot, 'client', 'dist');
const uploadsPath = path.join(projectRoot, 'server', 'uploads');

// --- SEGURIDAD Y LOGGING ---
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// --- CONFIGURACIÓN CORS ---
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(clientDistPath));

// --- SESIONES ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// --- RUTAS API ---
app.use('/api', apiRoutes);

// --- SPA FALLBACK & STATIC SERVING ---
// Only serve client files if the directory exists (Production/Build mode)
if (require('fs').existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get(/.*/, (req: Request, res: Response) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    // If client/dist doesn't exist, provide a basic feedback message for developers
    app.get('/', (req: Request, res: Response) => {
        res.status(200).json({
            message: "Backend is running. If you want to see the frontend, run 'npm run dev' to start Vite.",
            api_health: "/api/health"
        });
    });
}

// --- MANEJADOR DE ERRORES ---
app.use(errorHandler);

export default app;
