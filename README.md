# Sistema de Billetera Virtual

Sistema completo de billetera virtual desarrollado con arquitectura de microservicios, que permite a los usuarios registrarse, recargar saldo, realizar pagos con confirmación por token y consultar su historial de transacciones.

## 🏗️ Arquitectura

El sistema está compuesto por 3 servicios independientes:

- **database-service** (Puerto 3001): Servicio con acceso exclusivo a MySQL usando Sequelize ORM
- **api-gateway** (Puerto 3000): API Gateway que consume el database-service y expone endpoints REST
- **client** (Puerto 5174): Cliente web React con Vite para la interfaz de usuario

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 18+ 
- MySQL 8.0+
- npm o yarn

### 1. Clonar e Instalar

```bash
# Clonar el repositorio
git clone <repository-url>
cd billetera-virtual

# Configuración automática (copia .env y instala dependencias)
npm run setup
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE billetera_virtual;
exit
```

### 3. Configurar Variables de Entorno

Editar los archivos `.env` generados automáticamente:

```bash
# Archivo principal .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=billetera_virtual
DB_USER=root
DB_PASSWORD=tu_password_mysql

# Configuración de Email (opcional para pruebas)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion
```

### 4. Iniciar el Sistema

```bash
# Iniciar todos los servicios
npm run dev

# O iniciar servicios individualmente
npm run dev:database  # Puerto 3001
npm run dev:gateway   # Puerto 3000  
npm run dev:client    # Puerto 5173
```

## 📋 Funcionalidades

### ✅ Registro de Clientes
- Validación de datos (documento, nombres, email, celular)
- Creación automática de billetera asociada
- Verificación de duplicados

### ✅ Recarga de Billetera
- Recarga de saldo por monto específico
- Registro de transacción automática
- Actualización de saldo en tiempo real

### ✅ Sistema de Pagos con Token
- Generación de token de 6 dígitos
- Envío por email (configurable)
- Expiración automática (5 minutos)
- Confirmación segura con token

### ✅ Consultas
- Consulta de saldo actual
- Historial completo de transacciones
- Filtros por tipo de transacción
- Paginación de resultados

## 🔧 Scripts Disponibles

```bash
# Configuración inicial
npm run setup          # Configuración completa (env + install)
npm run setup:env       # Solo copiar archivos .env
npm run install:all     # Instalar dependencias de todos los servicios

# Desarrollo
npm run dev            # Iniciar todos los servicios
npm run start          # Alias para npm run dev
npm run dev:client     # Solo cliente React
npm run dev:gateway    # Solo API Gateway
npm run dev:database   # Solo servicio de base de datos

# Construcción y verificación
npm run build          # Construir todos los servicios
npm run check          # Verificar TypeScript en todos los servicios
npm run test           # Ejecutar pruebas de API
npm run health:check   # Verificar estado de servicios

# Base de datos
npm run db:migrate     # Ejecutar migraciones
npm run db:seed        # Poblar datos de prueba

# Limpieza
npm run clean          # Limpiar node_modules
npm run reset          # Limpiar y reconfigurar todo
```

## 📡 API Endpoints

### Clientes
```bash
POST   /api/clients              # Crear cliente
GET    /api/clients/:id          # Obtener cliente por ID
GET    /api/clients/document/:doc # Obtener cliente por documento
PUT    /api/clients/:id          # Actualizar cliente
DELETE /api/clients/:id          # Eliminar cliente
```

### Billeteras
```bash
GET    /api/wallets/balance/:clientId           # Consultar saldo
POST   /api/wallets/recharge                    # Recargar billetera
GET    /api/wallets/transactions/:clientId      # Historial de transacciones
```

### Pagos
```bash
POST   /api/payments/initiate                   # Iniciar pago (generar token)
POST   /api/payments/confirm                    # Confirmar pago con token
GET    /api/payments/tokens/client/:clientId    # Obtener tokens del cliente
POST   /api/payments/tokens/cleanup             # Limpiar tokens expirados
```

### Sistema
```bash
GET    /api/health                              # Estado del sistema
```

## 📋 Colección de Postman

Para facilitar las pruebas de la API, se incluye una colección completa de Postman:

1. **Importar**: Abre Postman e importa el archivo `postman-collection.json`
2. **Variables**: La colección incluye variables automáticas para IDs y tokens
3. **Tests**: Cada request incluye tests automáticos para validar respuestas
4. **Flujo Completo**: Carpeta con secuencia completa de pruebas end-to-end

### Carpetas Incluidas:
- **Sistema**: Health checks de los servicios
- **Clientes**: CRUD completo de clientes
- **Billeteras**: Operaciones de saldo, recarga e historial
- **Pagos**: Flujo completo de pagos con tokens
- **Flujo Completo**: Pruebas automatizadas end-to-end

Para más detalles, consulta `POSTMAN_GUIDE.md`.

## 🧪 Pruebas con cURL

### 1. Crear Cliente
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "documento": "12345678",
    "nombres": "Juan Carlos",
    "email": "juan.carlos@test.com",
    "celular": "3001234567"
  }'
```

### 2. Recargar Billetera
```bash
curl -X POST http://localhost:3000/api/wallets/recharge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientId": "CLIENT_UUID",
    "amount": 100000,
    "description": "Recarga inicial"
  }'
```

### 3. Iniciar Pago
```bash
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientId": "CLIENT_UUID",
    "amount": 50000,
    "description": "Pago de prueba"
  }'
```

### 4. Confirmar Pago
```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "SESSION_UUID",
    "token": "123456"
  }'
```

## 🔒 Autenticación

El sistema utiliza Bearer Token para autenticación. Incluir en todas las peticiones:

```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📊 Estructura de Respuestas

Todas las respuestas siguen el formato estándar:

```json
{
  "success": true|false,
  "message": "Descripción del resultado",
  "data": { /* Datos de respuesta */ },
  "error": null|"Descripción del error"
}
```

## 🗄️ Modelo de Base de Datos

### Tabla: clients
- `id` (UUID, PK)
- `documento` (VARCHAR, UNIQUE)
- `nombres` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `celular` (VARCHAR)
- `createdAt`, `updatedAt`

### Tabla: wallets
- `id` (UUID, PK)
- `clientId` (UUID, FK → clients.id)
- `balance` (DECIMAL)
- `createdAt`, `updatedAt`

### Tabla: transactions
- `id` (UUID, PK)
- `walletId` (UUID, FK → wallets.id)
- `type` (ENUM: 'recarga', 'pago')
- `amount` (DECIMAL)
- `status` (ENUM: 'pendiente', 'completada', 'fallida')
- `description` (TEXT)
- `sessionId` (UUID, nullable)
- `createdAt`, `updatedAt`

### Tabla: payment_tokens
- `id` (UUID, PK)
- `clientId` (UUID, FK → clients.id)
- `token` (VARCHAR(6))
- `amount` (DECIMAL)
- `status` (ENUM: 'activo', 'usado', 'expirado')
- `expiresAt` (DATETIME)
- `sessionId` (UUID, UNIQUE)
- `createdAt`, `updatedAt`

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
# Verificar que MySQL esté ejecutándose
sudo service mysql start

# Verificar credenciales en .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
```

### Error de Puertos Ocupados
```bash
# Verificar puertos en uso
lsof -i :3000
lsof -i :3001
lsof -i :5173

# Cambiar puertos en archivos .env si es necesario
```

### Problemas con Email
```bash
# Para pruebas, el sistema funciona sin configuración de email
# Los tokens se pueden obtener via API:
GET /api/payments/tokens/client/:clientId
```

## 📝 Desarrollo

### Estructura del Proyecto
```
billetera-virtual/
├── client/                 # React + Vite frontend
├── api-gateway/           # Express.js API Gateway
├── database-service/      # Express.js + Sequelize service
├── .env.example          # Plantilla de variables de entorno
├── package.json          # Scripts del monorepo
└── README.md            # Esta documentación
```

### Agregar Nuevas Funcionalidades
1. Definir endpoint en `api-gateway/routes/`
2. Implementar controlador en `api-gateway/controllers/`
3. Agregar lógica de base de datos en `database-service/`
4. Actualizar modelos Sequelize si es necesario
5. Agregar validaciones con Joi

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear issue en el repositorio
- Revisar la documentación de API
- Verificar logs de servicios con `npm run dev`