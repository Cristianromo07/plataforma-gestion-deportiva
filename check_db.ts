import 'dotenv/config';
import { pool } from './server/config/db';

async function checkData() {
    try {
        const [rows] = await pool.query('SELECT * FROM personal_horarios LIMIT 10');
        console.log('--- DATA IN personal_horarios ---');
        console.log(JSON.stringify(rows, null, 2));

        const [escenarios] = await pool.query('SELECT * FROM escenarios');
        console.log('--- ESCENARIOS ---');
        console.log(JSON.stringify(escenarios, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
