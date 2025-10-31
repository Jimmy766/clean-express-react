import { Router } from 'express';
import { ClientController } from '../controllers/clientController.js';

const router = Router();

// Crear cliente
router.post('/', ClientController.createClient);

// Obtener todos los clientes (con paginación)
router.get('/', ClientController.getAllClients);

// Obtener cliente por ID
router.get('/:id', ClientController.getClientById);

// Obtener cliente por documento
router.get('/document/:documento', ClientController.getClientByDocument);

// Actualizar cliente
router.put('/:id', ClientController.updateClient);

// Eliminar cliente
router.delete('/:id', ClientController.deleteClient);

export default router;