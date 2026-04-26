import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export class Recipient extends Model<
  InferAttributes<Recipient>,
  InferCreationAttributes<Recipient>
> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare name: string | null;
  declare created_at: CreationOptional<Date>;
}

Recipient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: { type: DataTypes.TEXT, allowNull: false, unique: true },
    name: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'recipients',
    timestamps: false,
  },
);
