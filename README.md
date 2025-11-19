# El Tambo Cañetano - Aplicación Web de Restaurante

Sistema completo de compra en línea para el restaurante "El Tambo Cañetano", especializado en comida criolla peruana.

## Características

### Para Clientes
- Landing page elegante con información del restaurante
- Registro sin necesidad de contraseña
- Navegación por categorías de productos
- Carrito de compras intuitivo
- Integración con Culqi para pagos seguros con tarjeta
- Confirmación de pedido en tiempo real
- Historial de pedidos

### Para Administradores
- Panel de control protegido con autenticación
- Visualización de todos los pedidos recibidos
- Actualización de estado de pedidos (pendiente → confirmado → preparando → listo)
- CRUD completo de productos
- Agregar nuevas especialidades del restaurante
- Filtrado de pedidos por estado

## Tecnologías Utilizadas

### Frontend
- **React 19.2** - Biblioteca UI
- **React Router v6** - Enrutamiento
- **Context API** - Gestión de estado global
- **CSS3** - Estilos con animaciones suaves
- **Fetch API** - Comunicación con backend

### Backend (Incluido)
- **Node.js 20+** - Runtime JavaScript
- **Express.js 5** - Framework web
- **PostgreSQL/Supabase** - Base de datos
- **JWT** - Autenticación de admin
- **Bcrypt** - Hashing de contraseñas
- **Culqi** - Procesamiento de pagos

## Instalación

### Requisitos Previos
- Node.js 18+ instalado
- npm o yarn
- Backend ejecutándose en `http://localhost:5000`

### Pasos de Instalación

1. **Clonar el repositorio**
   \`\`\`bash
   git clone <repository-url>
   cd frontend
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar variables de entorno**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edita `.env.local` y establece:
   \`\`\`
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`

4. **Ejecutar en desarrollo**
   \`\`\`bash
   npm start
   \`\`\`
   
   La aplicación se abrirá en `http://localhost:3000`

## Estructura del Proyecto

\`\`\`
src/
├── context/
│   └── AppContext.jsx          # Estado global y acciones
├── services/
│   └── api.js                  # Servicio centralizado de API
├── pages/
│   ├── Landing.jsx             # Página de inicio
│   ├── Landing.css
│   ├── Register.jsx            # Registro de usuarios
│   ├── Register.css
│   ├── Menu.jsx                # Catálogo de productos
│   ├── Menu.css
│   ├── Pago.jsx                # Página de pago
│   ├── Pago.css
│   ├── Confirmacion.jsx        # Confirmación de pedido
│   ├── Confirmacion.css
│   ├── AdminLogin.jsx          # Login de admin
│   ├── AdminLogin.css
│   ├── AdminDashboard.jsx      # Panel admin
│   └── AdminDashboard.css
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── product/
│   │   ├── ProductCard.jsx
│   │   └── ProductCard.css
│   ├── cart/
│   │   ├── Cart.jsx
│   │   └── Cart.css
│   ├── common/
│   │   ├── Notification.jsx
│   │   └── Notification.css
│   └── admin/
│       ├── PedidosTab.jsx
│       ├── PedidosTab.css
│       ├── ProductosTab.jsx
│       └── ProductosTab.css
├── App.jsx
├── App.css
├── index.jsx
└── index.css
\`\`\`

## Rutas de la Aplicación

### Públicas
- `/` - Página de inicio (landing page)
- `/registro` - Registro de usuario

### Para Usuarios Autenticados
- `/menu` - Catálogo de productos
- `/pago` - Página de pago
- `/confirmacion` - Confirmación de pedido

### Para Admin
- `/admin/login` - Login de administrador
- `/admin/dashboard` - Panel de administración

## Flujo de Usuario

### Cliente
1. Accede a la landing page
2. Se registra con nombre, email y teléfono
3. Navega por categorías de productos
4. Agrega productos al carrito
5. Procede al pago
6. Ingresa datos de tarjeta (Culqi)
7. Recibe confirmación del pedido
8. Admin prepara el pedido
9. Cliente retira en el restaurante

### Administrador
1. Accede a `/admin/login`
2. Ingresa email y contraseña
3. Ve dashboard con todos los pedidos
4. Actualiza estado de pedidos según se preparan
5. Puede agregar/editar/eliminar productos

## Características de Seguridad

- Validación de inputs en cliente y servidor
- Protección contra inyección SQL con parámetros preparados
- Rate limiting en endpoints críticos
- JWT para autenticación de admin
- Bcrypt para hashing de contraseñas
- CORS configurado
- Helmet para headers de seguridad
- Mensajes de error genéricos para no exponer detalles del sistema

## Integración con Culqi

La aplicación usa Culqi como pasarela de pago. Para pruebas:

### Tarjetas de Prueba
- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **Mes/Año**: Cualquier fecha futura
- **CVV**: Cualquier número de 3 dígitos

## Variables de Entorno Requeridas

### Frontend (.env.local)
\`\`\`
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

### Backend (.env)
\`\`\`
PORT=5000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
JWT_SECRET=tu_secret_muy_seguro
CULQI_PUBLIC_KEY=tu_public_key
CULQI_SECRET_KEY=tu_secret_key
CULQI_API_URL=https://api.culqi.com/v2
\`\`\`

## Deployment en Railway

### Frontend
1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Railway detectará que es una aplicación Node/React
4. Haz push a main para desplegar

### Backend
1. Crea una nueva aplicación en Railway
2. Conecta el repositorio del backend
3. Agrega las variables de entorno
4. Obtén la URL de Railway
5. Actualiza `REACT_APP_API_URL` en frontend

## Scripts Disponibles

\`\`\`bash
# Ejecutar en desarrollo
npm start

# Build para producción
npm run build

# Ejecutar tests
npm test

# Eject (no recomendado)
npm run eject
\`\`\`

## Patrones de Diseño Utilizados

- **Context API Pattern**: Gestión centralizada de estado
- **Service Locator**: Servicio centralizado de API
- **Presentational Components**: Componentes sin lógica de negocio
- **Container Components**: Componentes que manejan lógica
- **Custom Hooks**: Reutilización de lógica (useApp)
- **Protected Routes**: Rutas con autenticación

## Animaciones y UX

- Transiciones suaves en cambio de estados
- Indicadores visuales de carga
- Notificaciones emergentes
- Hover effects en botones
- Animaciones de entrada para modales

## Resolución de Problemas

### Error: "Cannot GET /api/..."
- Verifica que el backend está ejecutándose
- Comprueba que `REACT_APP_API_URL` es correcto
- En consola: `console.log(process.env.REACT_APP_API_URL)`

### Error: "403 CORS"
- Verifica que el backend tiene CORS configurado
- Backend debe incluir `http://localhost:3000` en CORS

### Culqi no funciona
- Verifica que tienes las claves de Culqi válidas
- En desarrollo, usa tarjetas de prueba
- Revisa la consola del navegador para detalles

## Contribuciones

Este proyecto es para uso del restaurante El Tambo Cañetano.

## Licencia

Privada - Uso exclusivo de El Tambo Cañetano

## Soporte

Para problemas técnicos, contacta al equipo de desarrollo.

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
