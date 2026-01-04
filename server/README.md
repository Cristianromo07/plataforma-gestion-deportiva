# Arquitectura del Servidor PGD

Este servidor ha sido refactorizado siguiendo una arquitectura por capas (Layered Architecture) para cumplir con los estándares de mantenibilidad, escalabilidad y responsabilidades del SENA.

## Estructura de Directorios

- **`/config`**: Configuración centralizada. Incluye `db.js` para la conexión al pool de MySQL y scripts de migración/seeding inicial.
- **`/middleware`**: Funciones intermedias para interceptar peticiones.
    - `auth.js`: Protección de rutas y validación de roles de usuario.
    - `errorHandler.js`: Centralizador de errores para respuestas HTTP estandarizadas.
- **`/controllers`**: Capa de lógica de negocio. Procesa los datos y decide qué responder.
- **`/routes`**: Definición de endpoints de la API, delegando la lógica a los controladores.
- **`index.js`**: Punto de entrada minimalista que inicializa Express y carga los módulos.

## Decisiones Técnicas

1. **Separación de Responsabilidades**: Se eliminó el monolitismo para facilitar pruebas unitarias y refactorizaciones futuras.
2. **Seguridad**: Uso de `express-session` para persistencia y `bcrypt` para el hashing de contraseñas.
3. **Robustez**: Se implementó un middleware global de errores para evitar fugas de información y normalizar los mensajes hacia el cliente.
4. **Escalabilidad**: El uso de un Pool de conexiones (`mysql2/promise`) permite manejar múltiples peticiones concurrentes de manera eficiente.
