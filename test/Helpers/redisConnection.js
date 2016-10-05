/**
 * Created by david on 10/4/16.
 */
import Redis from 'ioredis';
const config = {
  port: 6379,
  host: '127.0.0.1',
  family: 4,
  // password: '',
  // db: 0
};
export const redis = new Redis(config);
