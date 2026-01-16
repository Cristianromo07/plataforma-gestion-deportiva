import 'dotenv/config';
import { initDb } from './config/db';
import app from './app';

const PORT = process.env.PORT || 3000;

// --- INICIALIZACIÓN ---
// Solo iniciamos el servidor si NO estamos en modo de prueba (test)
if (process.env.NODE_ENV !== 'test') {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        console.log(`${__dirname}`);
      });
    })
    .catch(err => {
      console.error('Error crítico: No se pudo inicializar la base de datos.');
      console.error(err);
      process.exit(1);
    });
}

export default app;
