import { Router } from 'express';
import { WalletController } from '../controllers/walletController.js';

const router = Router();


router.get('/balance/:clientId', WalletController.getWalletBalance);


router.post('/recharge', WalletController.rechargeWallet);


router.post('/debit', WalletController.debitWallet);


router.get('/transactions/:clientId', WalletController.getTransactionHistory);

export default router;