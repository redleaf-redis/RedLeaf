/**
 * Created by david on 10/4/16.
 */
import _debug from 'debug';

const debugInfo = _debug('readLeaf:hotStream:info');
const debugTrimInfo = _debug('readLeaf:trim:info');
/**
 *
 * @param {Object} list
 * @param {number} halfLife
 * @param {number} epoch
 */
export default (list, {
  halfLife = 86400000 / 100000,
  epoch = new Date(2015, 10, 1).getTime() / 100000,
} = {}) => {
  list.votePopular = (member) => {
    debugInfo(`will vote popular on list ${this.name}`, member);

    // exec pre votes
    return this.execPre('votePopular', member)

      // increment the vote on one with formula: add 2**((now - epoch) / half_life)
      .then(() => this.incrementBy({
        member,
        by: 2 * ((new Date().getTime() - epoch) / halfLife),
      }))
      .then((add) => {
        debugInfo(`added vote popular on list ${this.name}`, add);
        this.trim(10000);
      });
  };

  if (!list.trim) {
    list.trim = function trim(amount) {
      this.execPre('trim', amount)
        .then(() => {
          if (Math.random() < (2 / amount)) {
            debugTrimInfo(`trimming ${this.name} with amount`, amount);
            return this.removeRangeByRank({
              min: 0,
              max: -amount,
            });
          }
          return null;
        });
    };
  }
};
