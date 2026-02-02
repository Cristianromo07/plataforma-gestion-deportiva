# PGD - Plataforma de Gestion Deportiva

## Descripcion del Proyecto

La Plataforma de Gestion Deportiva (PGD) es un sistema empresarial desarrollado para el Instituto Municipal de Cultura, Recreacion y Deporte de Itagui. Su proposito principal es centralizar la administracion de activos publicos, optimizar la asignacion de recursos humanos y facilitar la planificacion de infraestructuras deportivas.

El sistema implementa una arquitectura monolitica modular con separacion de responsabilidades (SoC), diseñada para garantizar mantenibilidad, escalabilidad y facilidad de pruebas. La aplicacion consta de un cliente React y un servidor Express.js, ambos desarrollados integramente en TypeScript.

### Caracteristicas Principales

- **Administracion de Horarios Operativos**: Programacion dinamica con navegacion semanal, persistencia de historicos y proyeccion de turnos futuros.
- **Gestion de Reservas**: Calendario interactivo con soporte para sesiones recurrentes y validacion automatica de conflictos.
- **Control de Acceso RBAC**: Modelo de autenticacion basado en roles (Administrador y Operador).
- **Exportacion de Reportes**: Generacion de reportes en formato XLSX con estilos personalizados.

---

## Requisitos Previos

Antes de iniciar la instalacion, asegurese de contar con los siguientes componentes:

| Componente | Version Minima | Verificacion |
|------------|----------------|--------------|
| Node.js | 18.x LTS o superior | `node --version` |
| npm | 9.x o superior | `npm --version` |
| MySQL/MariaDB | 8.0+ / 10.5+ | `mysql --version` |
| Git | 2.x | `git --version` |

---

## Guia de Instalacion

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd pgd
```

### 2. Configurar Variables de Entorno

Copie el archivo de ejemplo y configure las variables segun su entorno:

```bash
cp .env.example .env
```

Edite el archivo `.env` con los siguientes parametros:

```env
# Configuracion de Base de Datos
DB_HOST=localhost
DB_USER=<usuario_mysql>
DB_PASSWORD=<contraseña_mysql>
DB_NAME=<nombre_base_datos>
DB_CONN_LIMIT=10

# Configuracion del Servidor
PORT=3000
SESSION_SECRET=<clave_secreta_segura>
ADMIN_PWD=<contraseña_administrador>
```

**Nota**: Genere un valor seguro para `SESSION_SECRET` utilizando un generador de claves aleatorias (minimo 32 caracteres).

### 3. Configurar la Base de Datos

Cree la base de datos y el usuario en MySQL/MariaDB:

```sql
CREATE DATABASE login_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'login_user'@'localhost' IDENTIFIED BY 'su_contraseña';
GRANT ALL PRIVILEGES ON login_db.* TO 'login_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Instalar Dependencias

Instale las dependencias del proyecto raiz y del cliente:

```bash
# Dependencias del proyecto raiz (incluye servidor)
npm install

# Dependencias del cliente
cd client
npm install
cd ..
```

### 5. Compilar el Proyecto (Opcional para Produccion)

Si desea ejecutar en modo produccion:

```bash
npm run build
```

---

## Guia de Uso

### Modo Desarrollo

Para ejecutar el servidor y el cliente de forma concurrente en modo desarrollo:

```bash
npm run dev
```

Este comando inicia:
- **Servidor**: `http://localhost:3000` (Express.js con hot-reload via nodemon)
- **Cliente**: `http://localhost:5173` (Vite dev server)

### Ejecutar Componentes Individualmente

**Solo servidor:**

```bash
npm run server
```

**Solo cliente:**

```bash
npm run client
```

### Modo Produccion

1. Compile el proyecto TypeScript:

```bash
npm run build
```

2. Inicie el servidor en modo produccion:

```bash
npm start
```

---

## Estructura del Proyecto

```
pgd/
├── client/                 # Aplicacion frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Componentes React reutilizables
│   │   ├── hooks/          # Hooks personalizados
│   │   └── services/       # Servicios de comunicacion con API
│   └── package.json
├── server/                 # Aplicacion backend (Express.js)
│   ├── src/
│   │   ├── config/         # Configuracion de base de datos
│   │   ├── controllers/    # Logica de negocio
│   │   ├── middleware/     # Autenticacion y manejo de errores
│   │   └── routes/         # Definicion de endpoints API
│   └── .env.example
├── docs/                   # Documentacion tecnica
├── data/                   # Datos de referencia
├── package.json            # Configuracion raiz del proyecto
└── tsconfig.json           # Configuracion de TypeScript
```

---

## Stack Tecnologico

### Frontend
- React 18
- Vite
- Tailwind CSS
- TypeScript

### Backend
- Express.js 5
- Express Session
- MySQL2 (Pool de conexiones)
- Morgan / Helmet
- TypeScript

### Base de Datos
- MySQL 8.0+ / MariaDB 10.5+

---

## Documentacion Adicional

Consulte la carpeta `docs/` para documentacion detallada:

- `ARCHITECTURE.md` - Arquitectura del sistema
- `DATABASE.md` - Esquema de base de datos
- `MANUAL_TECNICO.md` - Manual tecnico completo
- `MANUAL_USUARIO.md` - Manual de usuario

---

## Scripts Disponibles

| Script | Comando | Descripcion |
|--------|---------|-------------|
| `dev` | `npm run dev` | Inicia servidor y cliente en modo desarrollo |
| `server` | `npm run server` | Inicia solo el servidor con hot-reload |
| `client` | `npm run client` | Inicia solo el cliente |
| `build` | `npm run build` | Compila TypeScript para produccion |
| `start` | `npm start` | Ejecuta el servidor en modo produccion |

---

