import { sequelize } from '../config/database.js';
import { Client } from './Client.js';
import { Wallet } from './Wallet.js';
import { Transaction, TransactionType, TransactionStatus } from './Transaction.js';
import { PaymentToken, TokenStatus } from './PaymentToken.js';

const models = {
  Client,
  Wallet,
  Transaction,
  PaymentToken
};

export const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Todos los modelos sincronizados correctamente');
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    throw error;
  }
};

export {
  sequelize,
  Client,
  Wallet,
  Transaction,
  PaymentToken,
  TransactionType,
  TransactionStatus,
  TokenStatus
};

export default models;