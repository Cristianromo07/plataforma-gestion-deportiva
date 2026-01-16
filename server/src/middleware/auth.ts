import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
    interface SessionData {
        userId: number;
        email: string;
        role: string;
    }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'No autorizado. Inicie sesión.' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
};
