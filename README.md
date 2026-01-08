# Plataforma de Gestión Deportiva - PGD Itagüí

Sistema integral de Data Governance y Control Operativo diseñado para el Instituto Municipal de Cultura, Recreación y Deporte de Itagüí. Esta plataforma permite la gestión centralizada de escenarios deportivos, personal operativo, reservas y servicios institucionales, garantizando la transparencia y eficiencia en la toma de decisiones estratégicas.

---

## Características del Sistema

### Gestión de Personal (Horario Gestor EX)
Módulo avanzado para la administración de la programación semanal de los escenarios oficiales y la Ciclovía.
*   **Gestión Semanal Independiente**: Sistema de calendario que permite navegar entre semanas. Cada semana posee su propia programación, permitiendo históricos y planificación futura.
*   **Consolidación de Cobertura**: Capacidad de anotar gestores con "Sedes Cruzadas" (ej: `6:00 SAN JOSE+`) para cubrir múltiples escenarios sin duplicar registros, optimizando el espacio visual.
*   **Detección de Vacantes**: Sistema inteligente que identifica huecos de cobertura reales, ocultando sedes que ya están cubiertas indirectamente.
*   **Exportación Premium**: Generador de reportes en Excel (.xlsx) con estilos corporativos, cabeceras personalizadas y el rango de fechas de la semana actual.
*   **UI Ejecutiva (Sober Slate)**: Interfaz de alta densidad diseñada para profesionales, con una paleta de colores sobria y componentes compactos.

### Módulo de Novedades y Reportes
Sistema de reporte de incidencias en tiempo real para el mantenimiento de escenarios.
*   **Reportes Multimedia**: Soporte para carga de imágenes y videos como evidencia de fallos o mejoras.
*   **Historial Centralizado**: Vista detallada de todas las novedades reportadas con previsualización de archivos.
*   **Clasificación**: Categorización por tipo de daño (Luz, Aseo, Infraestructura, etc.).

### Sistema de Reservas de Escenarios
Gestión integral de espacios deportivos con un calendario interactivo a pantalla completa.
*   **Calendario Dinámico**: Integración con FullCalendar para una visualización clara de la ocupación por sede.
*   **Reservas Recurrentes**: Soporte para sesiones periódicas con validación automática de conflictos de horario.

### Seguridad y Perfiles
*   **Autenticación Robusta**: Gestión de sesiones protegidas y cookies seguras.
*   **Perfil de Usuario**: Visualización de datos de rango y rol del funcionario logueado.

---

## Stack Tecnológico

*   **Frontend**: React.js (Vite), Tailwind CSS, Lucide React, FullCalendar.
*   **Backend**: Node.js, Express.js.
*   **Base de Datos**: MySQL 8.0+.
*   **Exportación**: xlsx-js-style (Excel Premium), jsPDF (Reportes PDF).

---

## Organización del Proyecto

```text
pgd/
├── client/                 # Aplicación Frontend (React/Vite)
│   ├── src/
│   │   ├── pages/         # Vistas (HorarioGestor, Novedades, Subgerencia)
│   │   ├── components/    # Componentes UI (Formularios, Modales)
│   │   └── context/       # AuthContext y estados globales
├── server/                 # Aplicación Backend (Node/Express)
│   ├── controllers/       # Lógica de negocio (Horarios, Novedades)
│   ├── routes/            # Definición de Endpoints
│   └── uploads/           # Almacenamiento de archivos multimedia
├── data/                   # Recursos de Datos y Backups SQL
└── scripts/                # Migraciones y herramientas de DB
```

---

## Referencia de la API Principal

| Método | Ruta | Función |
| :--- | :--- | :--- |
| GET | /api/horarios?date=YYYY-MM-DD | Obtener horarios para una semana específica. |
| POST | /api/horarios | Guardar programación semanal (Persistencia por fecha). |
| GET | /api/novedades | Listar todos los reportes de novedades. |
| POST | /api/novedades | Crear reporte con upload de archivos (Multer). |
| POST | /api/reservas | Gestión de agenda de escenarios. |

---
*Desarrollado para potenciar la transparencia y eficiencia operativa del deporte.*
