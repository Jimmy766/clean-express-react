import { Router } from 'express';
import { ClientController } from '../controllers/clientController.js';

const router = Router();

router.post('/', ClientController.createClient);

router.get('/', ClientController.getAllClients);

router.get('/:id', ClientController.getClientById);

router.get('/document/:documento', ClientController.getClientByDocument);

router.put('/:id', ClientController.updateClient);

router.delete('/:id', ClientController.deleteClient);

export default router;