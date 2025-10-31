import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';

const router = Router();


router.post('/tokens', PaymentController.generatePaymentToken);


router.post('/tokens/validate', PaymentController.validatePaymentToken);


router.patch('/tokens/:tokenId/used', PaymentController.markTokenAsUsed);


router.get('/tokens/client/:clientId', PaymentController.getTokensByClient);


router.post('/tokens/cleanup', PaymentController.cleanExpiredTokens);

export default router;