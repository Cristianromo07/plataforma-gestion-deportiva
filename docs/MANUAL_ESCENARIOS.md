# Gestión de Escenarios de PGD

Este documento explica cómo administrar (añadir o eliminar) los escenarios deportivos que aparecen en el sistema.

## Arquitectura Dinámica

El sistema ha sido actualizado para que la lista de escenarios no esté "quemada" (hardcoded) en el código del cliente. En su lugar, el cliente consulta el backend (`/api/horarios-escenarios`), el cual a su vez consulta la base de datos para obtener todos los escenarios únicos que existen en la tabla `personal_horarios`.

Esto significa que para "crear" un nuevo escenario visible en la gestión de horarios, simplemente debe existir al menos un registro (gestor) asignado a ese escenario en la base de datos.

## Cómo Añadir un Nuevo Escenario

Dado que la tabla `personal_horarios` vincula gestores con escenarios, para que un escenario aparezca en el listado, debes insertar un registro inicial.

Puedes hacerlo ejecutando una consulta SQL directamente en la base de datos:

```sql
INSERT INTO personal_horarios 
(escenario, gestor_nombre, contacto, lunes, martes, miercoles, jueves, viernes, sabado, domingo)
VALUES 
('NOMBRE_DEL_NUEVO_ESCENARIO', 'VACANTE', '', 'DESCANSO', 'DESCANSO', 'DESCANSO', 'DESCANSO', 'DESCANSO', 'DESCANSO', 'DESCANSO');
```

**Pasos:**
1.  Accede a tu gestor de base de datos (MySQL Workbench, phpMyAdmin, DBeaver, o línea de comandos).
2.  Ejecuta el comando SQL anterior, reemplazando `'NOMBRE_DEL_NUEVO_ESCENARIO'` por el nombre real (ej: `'Cancha Nueva Norte'`).
3.  Refresca la página en el navegador. El nuevo escenario aparecerá automáticamente en el listado.

## Cómo Eliminar un Escenario

Para que un escenario deje de aparecer, debes eliminar todos los registros asociados a ese escenario en la tabla `personal_horarios`.

```sql
DELETE FROM personal_horarios WHERE escenario = 'NOMBRE_DEL_ESCENARIO';
```

**Nota:** Si eliminas todos los gestores de un escenario desde la interfaz gráfica del sistema, el escenario dejará de aparecer en el filtro una vez que se refresque la página, ya que no quedarán registros de él en la base de datos.
