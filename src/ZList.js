/**
 * Created by David on 26/09/16.
 */
import defaultConnection from './connection';

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
    this._preFuncs = {};
    this._redis = redis || defaultConnection();
  }

  pre(name, func) {
    if (!this._preFuncs[name]) {
      this._preFuncs[name] = [];
    }
    this._preFuncs[name].push(func);
  }

  execPre(name, data) {
    const functionsPre = this._preFuncs[name] || [];
    return Promise
      .all(functionsPre.map(func => func(this, data)));
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
    this.pre('add', promiseMiddleware);
  }

  preRem(promiseMiddleware) {
    this.pre('remove', promiseMiddleware);
  }

  /**
   * add a member with a score
   * @param score
   * @param member
   * @return {Promise.<Boolean>}
   */
  add({ score, member }) {
    return this.execPre('add',{ score, member })
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
    return this.execPre('remove', member)
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
