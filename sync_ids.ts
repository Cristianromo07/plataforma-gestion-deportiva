import 'dotenv/config';
import { pool } from './server/config/db';

async function syncIds() {
    try {
        console.log('Syncing escenario_id in personal_horarios...');
        await pool.query('UPDATE personal_horarios ph JOIN escenarios e ON ph.escenario = e.nombre SET ph.escenario_id = e.id');
        console.log('Sync complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

syncIds();
