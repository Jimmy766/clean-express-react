# Guía de Uso - Colección Postman

## Importar la Colección

1. Abre Postman
2. Haz clic en "Import" en la esquina superior izquierda
3. Selecciona el archivo `postman-collection.json` desde la raíz del proyecto
4. La colección "Billetera Virtual API" aparecerá en tu workspace

## Variables de Entorno

La colección incluye las siguientes variables que se configuran automáticamente:

- `base_url`: http://localhost:3000 (API Gateway)
- `database_url`: http://localhost:3001 (Database Service)
- `bearer_token`: Token de autenticación proporcionado
- `client_id`: Se establece automáticamente al crear un cliente
- `session_id`: Se establece automáticamente al iniciar un pago
- `payment_token`: Se establece automáticamente al obtener tokens

## Estructura de la Colección

### 1. Sistema
- **Health Check - API Gateway**: Verifica que el API Gateway esté funcionando
- **Health Check - Database Service**: Verifica que el servicio de base de datos esté funcionando

### 2. Clientes
- **Crear Cliente**: Registra un nuevo cliente y guarda automáticamente el `client_id`
- **Obtener Cliente por ID**: Busca un cliente usando su ID
- **Obtener Cliente por Documento**: Busca un cliente usando su número de documento
- **Actualizar Cliente**: Modifica los datos de un cliente existente

### 3. Billeteras
- **Consultar Saldo**: Obtiene el saldo actual de la billetera del cliente
- **Recargar Billetera**: Añade fondos a la billetera del cliente
- **Historial de Transacciones**: Obtiene el historial de transacciones con paginación

### 4. Pagos
- **Iniciar Pago**: Inicia un proceso de pago y guarda automáticamente el `session_id`
- **Obtener Tokens del Cliente**: Obtiene los tokens activos y guarda automáticamente el `payment_token`
- **Confirmar Pago**: Confirma el pago usando el token de 6 dígitos
- **Limpiar Tokens Expirados**: Elimina tokens que han expirado

### 5. Flujo Completo
Una secuencia completa de pruebas que incluye:
1. Crear un cliente nuevo
2. Recargar su billetera
3. Iniciar un pago
4. Obtener el token
5. Confirmar el pago
6. Verificar el saldo final
7. Ver el historial completo

## Uso Recomendado

### Para Pruebas Individuales
1. Ejecuta primero los Health Checks para verificar que los servicios estén funcionando
2. Crea un cliente usando "Crear Cliente"
3. Recarga la billetera del cliente
4. Realiza pagos según sea necesario

### Para Pruebas Automatizadas
1. Ejecuta toda la carpeta "Flujo Completo" para una prueba end-to-end
2. Los tests automáticos verificarán que cada paso se complete correctamente

## Scripts de Test Incluidos

Cada request importante incluye scripts de test que:
- Verifican que la respuesta sea exitosa
- Validan la estructura de los datos
- Guardan automáticamente variables necesarias para requests posteriores
- Verifican valores específicos (como saldos después de transacciones)

## Personalización

### Cambiar Datos de Prueba
Puedes modificar los datos en el body de los requests:
- Documentos de cliente
- Nombres y emails
- Montos de recarga y pago
- Descripciones de transacciones

### Agregar Nuevos Tests
Para agregar validaciones adicionales, edita la pestaña "Tests" de cualquier request y añade:

```javascript
pm.test("Nombre del test", function () {
    const response = pm.response.json();
    pm.expect(response.data.campo).to.equal(valorEsperado);
});
```

## Troubleshooting

### Error de Conexión
- Verifica que los servicios estén ejecutándose en los puertos correctos
- Ejecuta `npm run dev` en la raíz del proyecto

### Token Expirado
- Los tokens de pago expiran después de 10 minutos
- Usa "Limpiar Tokens Expirados" si es necesario
- Inicia un nuevo pago para generar un token fresco

### Variables No Guardadas
- Asegúrate de ejecutar los requests en orden
- Los scripts automáticos guardan las variables necesarias
- Verifica que los tests pasen correctamente

## Ejemplos de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos específicos de la operación
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos del error",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Autenticación

La colección está configurada para usar Bearer Token automáticamente. El token está incluido en las variables de la colección y se aplica a todos los requests que lo requieran.

## Soporte

Para reportar problemas o sugerir mejoras en la colección de Postman, consulta la documentación principal del proyecto en `README.md`.