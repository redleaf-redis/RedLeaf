/**
 * Created by david on 10/3/16.
 */
import defaultConnection from './connection';
/* import _debug from 'debug';
 const debug = _debug('feedModule:zlist');*/

class Hash {
  constructor(key, redis) {
    this.key = key;
    this._preSet = [];
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
  preSet(promiseMiddleware) {
    this._preSet.push(promiseMiddleware);
  }
  preRem(promiseMiddleware) {
    this._preRem.push(promiseMiddleware);
  }
  /**
   * set value to a field
   * @param field
   * @param value
   * @return {Promise.<Boolean>}
   */
  async set({ field, value }) {
    for (const preSet of this._preSet) {
      await preSet(this, { field, value });
    }
    return redis.hset(this.key, field, JSON.stringify(value));
  }
  /**
   * get value of a field
   * @param field
   * @return {Promise.<string>}
   */
  async get(field) {
    const got = redis.hget(this.key, field);
    try {
      return JSON.parse(got);
    } catch (e) {
      return got;
    }
  }

  /**
   * Remove a member
   * @param field
   * @return {Promise.<Boolean>}
   */
  async remove(field) {
    for (const preRem of this._preRem) {
      await preRem(this, field);
    }
    return redis.hdel(this.key, field);
  }

}

export default Hash;
