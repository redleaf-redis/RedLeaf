/**
 * Created by david on 10/4/16.
 */
const Redis = require('ioredis');
/**
 *
 * @param {ZList|Object} list
 * @param {number} halfLife
 * @param {number} epoch
 */
export default (list, { halfLife = 1, epoch = new Date(2015, 10, 1).getTime() / 100000 } = {}) => {

  list.vote = (member) => {
    this.incrementBy({ member, by: 2 * ((new Date().getTime() - epoch) / halfLife) });
    this.trim(10000);
  };

  list.trim = (ammount) => {
    if (Math.random() < (2 / ammount)) {
      list.removeRangeByRank({
        min: 0,
        max: -ammount,
      });
    }
  };

};
