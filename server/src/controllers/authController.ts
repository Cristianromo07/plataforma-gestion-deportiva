import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/db';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const user = rows[0];
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.email = user.email;
        res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) { next(err); }
};

export const logout = (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
};

export const checkSession = (req: Request, res: Response) => {
    if (req.session?.userId) {
        res.json({ loggedIn: true, user: { id: req.session.userId, email: req.session.email, role: req.session.role } });
    } else {
        res.json({ loggedIn: false });
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000);
        await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expires, req.body.email]);
        res.json({ success: true, message: 'Instrucciones enviadas' });
    } catch (err) { next(err); }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed]);
        res.json({ success: true });
    } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;
        const [rows]: any = await pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, new Date()]);
        if (rows.length === 0) return res.status(400).json({ error: 'Token inválido' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashed, rows[0].id]);
        res.json({ success: true });
    } catch (err) { next(err); }
};
