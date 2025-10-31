import { Request, Response, NextFunction } from 'express';
import { httpService } from '../services/httpService.js';
import Joi from 'joi';


const rechargeWalletSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  amount: Joi.number().positive().min(0.01).required(),
  description: Joi.string().max(255).optional()
});

export class WalletController {

  static async getWalletBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const response = await httpService.get(`/db/wallets/balance/${clientId}`);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async rechargeWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = rechargeWalletSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: error.details[0].message
        });
      }

      const response = await httpService.post('/db/wallets/recharge', value);
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }


  static async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      const { page, limit, type } = req.query;
      
      const response = await httpService.get(`/db/wallets/transactions/${clientId}`, {
        page,
        limit,
        type
      });
      
      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }
}