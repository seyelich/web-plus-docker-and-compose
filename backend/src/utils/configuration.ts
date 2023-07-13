import 'dotenv/config';

const {
  PORT,
  JWT_SECRET,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_SCHEMA,
} = process.env;

export default () => ({
  server: {
    port: parseInt(PORT, 10) || 4000,
  },
  database: {
    host: POSTGRES_HOST || 'localhost',
    port: parseInt(POSTGRES_PORT, 10) || 5432,
    username: POSTGRES_USER || 'student',
    password: POSTGRES_PASSWORD || 'student',
    database: POSTGRES_DB || 'kupipodariday',
    schema: POSTGRES_SCHEMA || 'kupipodariday',
  },
  jwt_secret: JWT_SECRET || 'test-secret-key',
});
