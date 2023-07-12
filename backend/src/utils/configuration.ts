export default () => ({
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DB_USER || 'student',
    password: process.env.DB_PASSWORD || 'student',
    database: process.env.DB_DATABASE || 'kupipodariday',
    schema: process.env.DB_SCHEMA || 'kupipodariday',
  },
  jwt_secret: process.env.JWT_SECRET || 'test-secret-key',
});
