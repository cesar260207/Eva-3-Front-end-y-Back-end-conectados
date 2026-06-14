# SportClub React


⚠️ **NOTA IMPORTANTE PARA LA EVALUACIÓN:** Este proyecto cuenta con una arquitectura dividida en Frontend y Backend. Por esta razón, **NO debe evaluarse a través de GitHub Pages**, ya que las plataformas de páginas estáticas no pueden ejecutar el servidor Node.js. Para revisar la aplicación, por favor siga las instrucciones de instalación local detalladas más abajo.

Aplicación frontend React para el proyecto SportClub, con autenticación, control de acceso por roles, dashboards diferenciados y módulo administrativo CRUD.

## Integrantes
- Proyecto individual.

## Tecnologías utilizadas
- React
- Vite
- React Router DOM
- React Bootstrap
- SweetAlert2
- Bootstrap

## Instalación
1. Abre una terminal en la carpeta:
   `Front end/sportclub react`
2. Ejecuta:
   `npm install`

## Ejecución del frontend
1. Abre una terminal en la carpeta:
   `Front end/sportclub react`
2. Ejecuta:
   `npm run dev`
3. Abre el navegador en la URL que indica Vite (por defecto `http://localhost:5173`).

## Backend requerido
El frontend consume una API backend en:
- `http://localhost:3000/api`

### Ejecución del backend
1. Abre una terminal en la carpeta:
   `Back end/FrontEnd-Backend-ClubDeportivo-main/FrontEnd-Backend-ClubDeportivo-main` si son 2 veces entrar a FrontEnd-Backend-ClubDeportivo-main preferi mantenerlo para que no se rompa la logica de nada del proyecto
2. Ejecuta:
   `npm install`
3. Ejecuta:
   `npm run dev`

## Estructura del proyecto
- `src/pages/` → páginas principales: Login, Register, AdminDashboard, CoachDashboard, UserDashboard.
- `src/layouts/` → layouts por rol con header y navegación.
- `src/routes/` → rutas protegidas y control de roles.
- `src/services/` → servicios de API y autenticación.

## Funcionalidades principales
- Login funcional conectado al backend.
- Registro funcional conectado al backend.
- Validaciones básicas de formularios.
- Persistencia de sesión con JWT.
- Cierre de sesión funcional.
- Rutas protegidas según sesión activa.
- Control de acceso por rol: user, coach y admin.
- Dashboards diferenciados por rol.
- Módulo CRUD de usuarios en el panel administrativo.
- Uso de React Bootstrap y SweetAlert2.

## Notas
- La sesión se mantiene al navegar dentro del sistema.
- El usuario solo puede acceder a las secciones autorizadas por su rol.
- El token se guarda en `localStorage` para persistencia.
