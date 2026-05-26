import pg from 'pg';
const { Pool } = pg;

// database configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
};

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export default pool;