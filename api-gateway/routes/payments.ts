import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = Router();


router.post('/initiate', PaymentController.initiatePayment);


router.post('/confirm', PaymentController.confirmPayment);


router.get('/tokens/client/:clientId', PaymentController.getTokensByClient);


router.post('/tokens/cleanup', PaymentController.cleanExpiredTokens);

export default router;