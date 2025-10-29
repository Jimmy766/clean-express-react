import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Client } from './Client.js';

interface WalletAttributes {
  id: string;
  clientId: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WalletCreationAttributes extends Optional<WalletAttributes, 'id' | 'balance' | 'createdAt' | 'updatedAt'> {}

class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: string;
  public clientId!: string;
  public balance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Client,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    }
  },
  {
    sequelize,
    modelName: 'Wallet',
    tableName: 'wallets',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId']
      }
    ]
  }
);


Wallet.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasOne(Wallet, { foreignKey: 'clientId', as: 'wallet' });

export { Wallet, WalletAttributes, WalletCreationAttributes };