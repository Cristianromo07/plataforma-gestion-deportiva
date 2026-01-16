import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

export async function initDb() {
    try {
        const conn = await pool.getConnection();

        // Tablas básicas
        await conn.query(`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            reset_token VARCHAR(255),
            reset_token_expires DATETIME
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS escenarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) UNIQUE NOT NULL
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS reservas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT NOT NULL,
            usuario_id INT NOT NULL,
            fecha DATE NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fin TIME NOT NULL,
            color VARCHAR(7) DEFAULT '#3b82f6',
            nombre_solicitante VARCHAR(255),
            telefono_solicitante VARCHAR(20),
            descripcion_actividad TEXT,
            FOREIGN KEY (escenario_id) REFERENCES escenarios(id),
            FOREIGN KEY (usuario_id) REFERENCES users(id)
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS personal_horarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario VARCHAR(255) NOT NULL,
            escenario_id INT,
            fecha_inicio DATE,
            gestor_nombre VARCHAR(255) NOT NULL,
            contacto VARCHAR(255) DEFAULT '',
            lunes VARCHAR(255), martes VARCHAR(255), miercoles VARCHAR(255), jueves VARCHAR(255), viernes VARCHAR(255), sabado VARCHAR(255), domingo VARCHAR(255),
            UNIQUE KEY unique_gestor (escenario, gestor_nombre, fecha_inicio)
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS novedades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            escenario_id INT,
            escenario_nombre VARCHAR(255),
            tipo VARCHAR(255),
            descripcion TEXT,
            archivo_url VARCHAR(255),
            usuario_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Admin por defecto
        const [admin]: any = await conn.query('SELECT * FROM users WHERE email = "admin@test.com"');
        if (admin.length === 0) {
            const hashed = await bcrypt.hash(process.env.ADMIN_PWD || 'admin123', 10);
            await conn.query('INSERT INTO users (email, password, role) VALUES ("admin@test.com", ?, "admin")', [hashed]);
        }

        conn.release();
        console.log('DB Lista');
    } catch (e) {
        console.error('Error DB:', e);
        throw e;
    }
}

export { pool };
