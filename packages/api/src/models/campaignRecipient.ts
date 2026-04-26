import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export type CrStatus = 'pending' | 'sent' | 'failed';

export class CampaignRecipient extends Model<
  InferAttributes<CampaignRecipient>,
  InferCreationAttributes<CampaignRecipient>
> {
  declare campaign_id: string;
  declare recipient_id: string;
  declare status: CreationOptional<CrStatus>;
  declare sent_at: Date | null;
  declare opened_at: Date | null;
}

CampaignRecipient.init(
  {
    campaign_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    recipient_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    sent_at: { type: DataTypes.DATE, allowNull: true },
    opened_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'campaign_recipients',
    timestamps: false,
  },
);
