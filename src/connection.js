/**
 * Created by david on 10/4/16.
 */
import Redis from 'ioredis';
export const defaultConnection = () => new Redis();

