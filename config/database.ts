import { config } from 'dotenv';

// Load environment variables
config();

interface DatabaseConfig {
  development: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect: 'postgres';
    logging: boolean;
  };
  test: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect: 'postgres';
    logging: boolean;
  };
  production: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect: 'postgres';
    logging: boolean;
    ssl: boolean;
  };
}

const databaseConfig: DatabaseConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'aeturnis_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
  },
  test: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'aeturnis_test',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: false,
  },
  production: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'aeturnis_prod',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: false,
    ssl: true,
  },
};

export default databaseConfig;