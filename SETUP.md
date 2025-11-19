# Guía de Configuración - El Tambo Cañetano

Esta guía te ayudará a configurar y ejecutar tanto el backend como el frontend de la aplicación.

## Requisitos Previos

- **Node.js 18+** (Descarga desde https://nodejs.org)
- **npm 9+** o **yarn**
- **Docker y Docker Compose** (Opcional, para ejecutar con contenedores)
- **Git**
- **Cuenta Supabase** (Para la base de datos)
- **Cuenta Culqi** (Para procesamiento de pagos)

## Paso 1: Obtener Credenciales

### Supabase
1. Ve a https://supabase.com
2. Crea una nueva organización y proyecto
3. En Settings → API, copia:
   - `Project URL` → SUPABASE_URL
   - `anon public` → SUPABASE_ANON_KEY
   - `service_role secret` → SUPABASE_SERVICE_KEY
4. Ejecuta los scripts SQL de la base de datos (Tabla de creación de tablas)

### Culqi
1. Ve a https://culqi.com
2. Regístrate o inicia sesión
3. En tu dashboard, ve a Integración
4. Copia:
   - `Public Key` → CULQI_PUBLIC_KEY
   - `Secret Key` → CULQI_SECRET_KEY

### JWT Secret
Genera un string seguro para firmar tokens:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## Paso 2: Configurar Variables de Entorno

### Backend

Copia el archivo de ejemplo:
\`\`\`bash
cd backend
cp .env.example .env
\`\`\`

Edita `backend/.env` y completa:
\`\`\`
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

JWT_SECRET=tu_secret_muy_seguro_aqui_minimo_32_caracteres

CULQI_PUBLIC_KEY=pk_live_XXXXXXXXXXXXX
CULQI_SECRET_KEY=sk_live_XXXXXXXXXXXXX
CULQI_API_URL=https://api.culqi.com/v2
\`\`\`

### Frontend

Copia el archivo de ejemplo:
\`\`\`bash
cd frontend
cp .env.example .env.local
\`\`\`

Edita `frontend/.env.local`:
\`\`\`
# En desarrollo
REACT_APP_API_URL=http://localhost:5000/api

# En producción (cuando despliegues)
# REACT_APP_API_URL=https://tu-backend.railway.app/api
\`\`\`

## Paso 3: Ejecutar Localmente

### Opción A: Sin Docker (Más rápido para desarrollo)

#### Terminal 1 - Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

El backend estará en `http://localhost:5000`

#### Terminal 2 - Frontend
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

El frontend estará en `http://localhost:3000`

### Opción B: Con Docker Compose

\`\`\`bash
# En la raíz del proyecto
docker-compose up
\`\`\`

Esto iniciará ambos servicios:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Paso 4: Verificar la Instalación

### Backend
\`\`\`bash
curl http://localhost:5000/api/health
# Debe devolver algo como: {"status":"ok"}
\`\`\`

### Frontend
Abre `http://localhost:3000` en tu navegador. Debes ver la landing page.

## Paso 5: Probar la Aplicación

### Como Cliente
1. Ve a `http://localhost:3000`
2. Haz clic en "Comienza tu Experiencia"
3. Regístrate con un email de prueba
4. Navega el menú y agrega productos al carrito
5. Procede al pago
6. Usa tarjeta de prueba de Culqi: `4111 1111 1111 1111`
7. Verifica el pedido en admin

### Como Admin
1. Ve a `http://localhost:3000/admin/login`
2. Usa las credenciales del admin creadas en la BD:
   - Email: `admin@eltambocañetano.com`
   - Password: `Admin123` (o la que hayas seteado)
3. Deberías ver el dashboard con los pedidos
4. Prueba cambiar el estado de un pedido

## Estructura de Carpetas

\`\`\`
proyecto-restaurante/
├── backend/                    # Backend Node.js
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── frontend/                   # Frontend React
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml
├── SETUP.md                    # Este archivo
└── README.md
\`\`\`

## Solución de Problemas

### "Error: connect ECONNREFUSED 127.0.0.1:5432"
- **Problema**: No puede conectar a la base de datos
- **Solución**: Verifica que las credenciales de Supabase son correctas

### "CORS error" en la consola
- **Problema**: Backend no tiene CORS configurado para el frontend
- **Solución**: Verifica que FRONTEND_URL en backend .env es `http://localhost:3000`

### Frontend no carga productos
- **Problema**: API no respondiendo
- **Solución**: 
  1. Verifica que backend está ejecutándose: `curl http://localhost:5000/api/categorias`
  2. Verifica REACT_APP_API_URL en .env.local

### Culqi no funciona en pago
- **Problema**: Claves inválidas o configuración incorrecta
- **Solución**: 
  1. Verifica que las claves son para modo prueba/desarrollo
  2. En consola dev tools, busca errores de Culqi
  3. Usa tarjeta de prueba válida

### Docker no inicia
- **Problema**: Puerto ya está en uso
- **Solución**: Cambia los puertos en docker-compose.yml o mata el proceso que está usando el puerto:
  \`\`\`bash
  # En macOS/Linux
  lsof -i :5000  # Ver qué usa puerto 5000
  kill -9 PID

  # En Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  \`\`\`

### "npm ERR! code ERESOLVE"
- **Problema**: Conflicto de dependencias
- **Solución**:
  \`\`\`bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  \`\`\`

## Deploying a Railway

### Backend
1. Crea una nueva app en Railway
2. Conecta tu repositorio
3. En Settings → Environment Variables, agrega:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY
   - JWT_SECRET
   - CULQI_PUBLIC_KEY
   - CULQI_SECRET_KEY
   - NODE_ENV=production
   - PORT=5000
4. En Deploy, selecciona la rama main
5. Obtén la URL del backend (algo como `https://app-prod-xxxx.railway.app`)

### Frontend
1. Crea una nueva app en Railway
2. Conecta tu repositorio
3. En Settings → Environment Variables:
   - REACT_APP_API_URL=https://tu-backend.railway.app/api
4. Railway detectará que es React y hará build automáticamente
5. Una vez deployado, tendrás una URL del frontend

## Guía de Desarrollo

### Agregar una Nueva Categoría
1. Backend: Ejecuta SQL INSERT en tabla categorias
2. Frontend: Se carga automáticamente

### Crear un Nuevo Producto
1. Backend: Puede hacerse via API o SQL
2. Frontend: Admin dashboard → Productos → Agregar Producto

### Cambiar Estilos
Todos los estilos están en archivos `.css` individuales o en `App.css`

### Agregar Middleware de Seguridad
En `backend/src/middleware/security.js` agrega nuevos middlewares

## Contacto y Soporte

Si tienes problemas:
1. Revisa los logs del terminal
2. Abre la consola del navegador (F12)
3. Verifica que todas las credenciales sean correctas
4. Contacta al equipo de desarrollo

---

**Última actualización**: Noviembre 2025
