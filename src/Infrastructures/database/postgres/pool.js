/* istanbul ignore file */
import { Pool } from 'pg';

const testConfig = {
  host: process.env.PGHOST_TEST,
  port: process.env.PGPORT_TEST,
  user: process.env.PGUSER_TEST,
  password: process.env.PGPASSWORD_TEST,
  database: process.env.PGDATABASE_TEST,
};

export const pool = process.env.NODE_ENV === 'test' ? new Pool(testConfig) : new Pool();