/**
 * Created by James on 26/09/16.
 */
const Redis = require('ioredis');
import { defaultConnection } from './connection';
/**
 * @param array
 * @returns {Array}
 */
function castToObject(array) {
  const objects = [];
  for (let i = 0; i < array.length; i += 2) {
    objects.push(
      {
        member: array[i],
        score: array[i + 1],
      });
  }
  return objects;
}
class ZList {
  constructor(name, redis) {
    this.name = name;
    this._preAdds = [];
    this._preRem = [];
    this._redis = redis || defaultConnection();
  }
  /**
   * add a plugin to the list
   * @param {Function} plugin
   * @param {[Object]} opts
   * @return {ZList}
   */
  static plugin(plugin, opts) {
    plugin(this.prototype, opts);
    return this;
  }

  /**
   * add a plugin to the list
   * @param {Function} plugin
   * @param {[Object]} opts
   * @return {ZList}
   */
  plugin(plugin, opts) {
    plugin(this, opts);
    return this;
  }
  /**
 * add a plugin to the list
 * @param {Function} promiseMiddleware
 * @return {ZList}
 */
  preAdd(promiseMiddleware) {
    this._preAdds.push(promiseMiddleware);
  }
  preRem(promiseMiddleware) {
    this._preRem.push(promiseMiddleware);
  }
  /**
   * add a member with a score
   * @param score
   * @param member
   * @return {Promise.<Boolean>}
   */
  add({ score, member }) {
    return Redis.Promise.resolve(this._preAdds)
      .each((preAdd) => preAdd(this, { score, member }))
      .then(() => this._redis.zadd(this.name, score, member));
  }

  /**
   * Get the score of a member
   * @param member
   * @returns {Promise.<String>}
   */
  score(member) {
    return this._redis.zscore(this.name, member);
  }

  /**
   * Remove a member
   * @param {String} member
   * @return {Promise.<Boolean>|*}
   */
  remove(member) {
    return Redis.Promise.resolve(this._preRem)
      .each((preRem) => preRem(this, member))
      .then(() => this._redis.zrem(this.name, member));
  }

  /**
   * @param {String} cursor
   * @returns {{pointer, data: Array}}
   */
  scan(cursor) {
    return this._redis.zscan(this.name, cursor)
      .then(([pointer, listOfKeys]) => {
        const data = castToObject(listOfKeys);
        return {
          pointer,
          data,
        };
      });
  }

  /**
   * list the members ordered by the score
   * @param min
   * @param max
   * @param limit
   * @param reverse
   * @return {Promise.<[{member, score}]>}
   */
  rangeByScore({
    range: { min = '-inf', max = '+inf' } = {},
    limit, reverse = false,
  } = {}) {
    const redisArgs = [];
    if (limit) {
      const { offset = 0, count = 1 } = limit;
      redisArgs.push('LIMIT');
      redisArgs.push(offset);
      redisArgs.push(count);
    }
    let promiseFind;
    if (reverse) {
      promiseFind = this._redis.zrevrangebyscore(this.name, max, min, ...redisArgs, 'WITHSCORES');
    } else {
      promiseFind = this._redis.zrangebyscore(this.name, min, max, ...redisArgs, 'WITHSCORES');
    }
    return promiseFind.then(castToObject);
  }

  /**
   * increse the
   * @param member
   * @param by
   * @return {Promise|any}
   */
  incrementBy({ member, by } = {}) {
    return this._redis.zincrby(this.name, by, member);
  }
  removeRangeByRank({ start, stop } = {}) {
    return this._redis.zremrangebyrank(this.name, start, stop);
  }
}

export default ZList;