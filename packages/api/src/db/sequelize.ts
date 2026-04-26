import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (msg) => console.log(`[sql] ${msg}`) : false,
  pool: { max: 10, min: 0, acquire: 30_000, idle: 10_000 },
  define: {
    underscored: true,
    timestamps: false,
  },
});
