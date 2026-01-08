# Informe de Redundancias y Duplicidades del Proyecto

Este informe detalla las áreas del proyecto donde se detectaron duplicidad de código, rutas redundantes o inconsistencias arquitectónicas, junto con recomendaciones para su optimización.

## 1. Redundancia Conceptual en Endpoints de "Escenarios"

**Estado Actual:**
Existen dos rutas que devuelven información sobre "Escenarios", pero consultan fuentes de datos diferentes:

1.  **`/api/escenarios`** (Controlador: `reservaController.getEscenarios`)
    *   **Fuente**: Tabla maestra `escenarios`.
    *   **Datos devueltos**: Objetos completos (ID, nombre, tipo, capacidad, horario).
    *   **Propósito**: Usado presumiblemente para el sistema de reservas.

2.  **`/api/horarios-escenarios`** (Controlador: `horarioController.getEscenarios`)
    *   **Fuente**: Tabla transaccional `personal_horarios` (usando `DISTINCT escenario`).
    *   **Datos devueltos**: Lista simple de nombres (Strings).
    *   **Propósito**: Usado para filtrar la vista `HorarioGestor`.

**El Problema:**
Existe una desconexión lógica. La tabla `personal_horarios` almacena el nombre del escenario como texto (`VARCHAR`) en lugar de usar una llave foránea (`INT`) que apunte a la tabla `escenarios`.
Esto causa problemas de integridad de datos:
*   Si se cambia el nombre de un escenario en la tabla maestra `escenarios`, no se actualiza automáticamente en `personal_horarios`.
*   Un error tipográfico en `personal_horarios` crea un "nuevo" escenario fantasma.

**Recomendación:**
Refactorizar la base de datos para que `personal_horarios` use `escenario_id` (ForeignKey) en lugar de `escenario` (Texto). Unificar los endpoints para que tanto Reservas como Horarios consuman la lista maestra de `/api/escenarios`.

## 2. Redundancias en Rutas (Backend)

*   **Logout**: Existe una ruta `/logout` en el raíz (`server/index.js`) que simplemente redirige a `/api/logout`.
    *   *Veredicto*: Es una redundancia menor "de conveniencia", pero se podría eliminar si el frontend siempre llama a la API correctamente.
*   **Gestión de Errores**: El manejo de errores en los controladores es repetitivo (`try/catch` llamando a `next(err)` en cada función).
    *   *Recomendación*: Usar un wrapper de componentes de orden superior (Higher-Order Function) para manejar los `try/catch` automáticamente en todas las rutas asíncronas (`express-async-handler`).

## 3. Duplicidad en Lógica de Cliente

*   **Validación y Normalización de Textos**:
    *   La función `normalize` en `HorarioGestor.jsx` (líneas 18-25) es lógica de utilidad que probablemente sea necesaria en otras partes del sistema (búsquedas, filtros).
    *   *Recomendación*: Mover esta función a un archivo `client/src/utils/stringUtils.js` para ser reutilizada.

## 4. Archivos Potencialmente No Utilizados

*   `scripts/test_rate_limit.sh` (Eliminado previamente).
*   `DOC_BASE_DATOS.md` (Contenido fusionado en `docs/DATABASE.md` y eliminado).

## Resumen

El proyecto tiene una estructura limpia en general, pero la arquitectura de base de datos presenta una debilidad importante al no normalizar la relación entre `personal_horarios` y `escenarios`. Esto fue la causa raíz del problema que experimentó anteriormente (datos inconsistentes o invisibles).
