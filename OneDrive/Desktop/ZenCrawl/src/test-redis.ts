import Redis from 'ioredis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const redisHost = process.env.REDIS_HOST || '10.98.196.107';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

console.log(`Attempting to connect to Redis at ${redisHost}:${redisPort}`);

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
  redis.quit();
  process.exit(0);
});

redis.on('error', (err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

// Set a timeout to prevent hanging
setTimeout(() => {
  console.error('Connection attempt timed out');
  process.exit(1);
}, 15000); 