import { Redis } from '@upstash/redis';

// Initialize Redis client
// These environment variables are set in Vercel dashboard
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
