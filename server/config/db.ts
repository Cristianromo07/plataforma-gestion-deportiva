import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '10'),
    queueLimit: 0
};

// Validación crítica de seguridad
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('❌ ERROR CRÍTICO: Variables de entorno de base de datos faltantes.');
    console.error('Por favor configure el archivo .env basado en .env.example');
    process.exit(1);
}

// Crear el pool inmediatamente
const pool = mysql.createPool(dbConfig);

export async function initDb(): Promise<void> {
    try {
        const conn = await pool.getConnection();
        await conn.ping();

        // 1. Crear tabla de Usuarios (esencial para login)
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                reset_token VARCHAR(255) NULL,
                reset_token_expires DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Crear tabla de Escenarios (para Reservas)
        await conn.query(`
            CREATE TABLE IF NOT EXISTS escenarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Crear tabla de Reservas (Entidad independiente)
        await conn.query(`
            CREATE TABLE IF NOT EXISTS reservas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                escenario_id INT NOT NULL,
                usuario_id INT NOT NULL,
                fecha DATE NOT NULL,
                hora_inicio TIME NOT NULL,
                hora_fin TIME NOT NULL,
                color VARCHAR(7) DEFAULT '#3b82f6',
                nombre_solicitante VARCHAR(255) NULL,
                telefono_solicitante VARCHAR(20) NULL,
                descripcion_actividad TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (escenario_id) REFERENCES escenarios(id),
                FOREIGN KEY (usuario_id) REFERENCES users(id)
            )
        `);

        // 4. Crear tabla de Personal Horarios (Entidad independiente del Horario Gestor)
        await conn.query(`
            CREATE TABLE IF NOT EXISTS personal_horarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                escenario VARCHAR(255) NOT NULL,
                escenario_id INT NULL,
                fecha_inicio DATE NULL,
                gestor_nombre VARCHAR(255) NOT NULL,
                contacto VARCHAR(255) DEFAULT '',
                lunes VARCHAR(255),
                martes VARCHAR(255),
                miercoles VARCHAR(255),
                jueves VARCHAR(255),
                viernes VARCHAR(255),
                sabado VARCHAR(255),
                domingo VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_gestor_escenario_fecha (escenario, gestor_nombre, fecha_inicio)
            )
        `);

        // 5. Crear tabla de Novedades
        await conn.query(`
            CREATE TABLE IF NOT EXISTS novedades (
                id INT AUTO_INCREMENT PRIMARY KEY,
                escenario_id INT NULL,
                escenario_nombre VARCHAR(255),
                tipo VARCHAR(255),
                descripcion TEXT,
                archivo_url VARCHAR(255),
                usuario_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed escenarios básicos si no hay ninguno
        const [escRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM escenarios');
        if (escRows[0].cnt === 0) {
            const sedes = ['Sede Norte', 'Sede Sur', 'Estadio Central', 'Ciclovía'];
            for (const sede of sedes) {
                await conn.query('INSERT INTO escenarios (nombre) VALUES (?)', [sede]);
            }
            console.log('Sedes iniciales creadas');
        }

        // Migraciones de columnas existentes (para seguridad)
        const [columns]: any = await conn.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map((c: any) => c.Field);
        if (!columnNames.includes('reset_token')) {
            await conn.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
        }

        // Sembrado de personal_horarios desde JSON si está vacío
        const [horarioCount]: any = await conn.query('SELECT COUNT(*) as cnt FROM personal_horarios');
        if (horarioCount[0].cnt === 0) {
            const jsonPath = path.join(__dirname, '..', '..', 'client/src/data/horarioGestoresFull.json');
            if (fs.existsSync(jsonPath)) {
                try {
                    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    const insertSql = `
                        INSERT INTO personal_horarios 
                        (escenario, gestor_nombre, contacto, lunes, martes, miercoles, jueves, viernes, sabado, domingo, fecha_inicio)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const d = new Date();
                    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
                    const currentMonday = new Date(d.setDate(diff)).toISOString().split('T')[0];

                    for (const esc of jsonData) {
                        if (esc.gestores) {
                            for (const g of esc.gestores) {
                                if (g.nombre === 'CONTACTO') continue;
                                await conn.query(insertSql, [
                                    esc.escenario, g.nombre, g.contacto || '',
                                    g.turnos[0] || '', g.turnos[1] || '', g.turnos[2] || '', g.turnos[3] || '', g.turnos[4] || '', g.turnos[5] || '', g.turnos[6] || '',
                                    currentMonday
                                ]);
                            }
                        }
                    }
                    console.log('Sembrado de horarios completado');
                } catch (e) { console.error('Error en seed JSON:', e); }
            }
        }

        // Admin seed
        const adminEmail = 'admin@test.com';
        const hashed = await bcrypt.hash(process.env.ADMIN_PWD || 'admin123', 10);
        const [adminExists]: any = await conn.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
        if (adminExists.length === 0) {
            await conn.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashed, 'admin']);
            console.log('Usuario admin creado');
        }

        conn.release();
        console.log('Base de datos inicializada y conectada');
    } catch (e: any) {
        console.error('Error inicializando la base de datos:', e.message);
        throw e;
    }
}

export { pool };
