import 'dotenv/config';
import { pool } from './server/config/db';

async function fixDates() {
    try {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const currentMonday = new Date(d.setDate(diff)).toISOString().split('T')[0];
        console.log(`Setting all personal_horarios to Monday: ${currentMonday}`);
        await pool.query('UPDATE personal_horarios SET fecha_inicio = ?', [currentMonday]);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDates();
