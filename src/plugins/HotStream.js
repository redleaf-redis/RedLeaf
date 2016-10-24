/**
 * Created by david on 10/4/16.
 */
import _debug from 'debug';


const debugInfo = _debug('readLeaf:hotStream:info');
const debugTrimInfo = _debug('readLeaf:trim:info');
/**
 *
 * @param {Object} list
 * @param {number} tenthLife 12 hours (12*60*60*1000)
 * How long until a post with 100 votes is less interesting than one with 10 votes?
 */
export default (list, { tenthLife = 43200000 / 100000 } = {}) => {
  const halfTime = tenthLife * (Math.log(10) / Math.log(2));
  list.voteHot = function voteHot({ member, creationDate, votes }) {
    debugInfo(`will vote hot on list ${this.name}`, { member, creationDate, votes });
    return this.execPre('voteHot', { member, creationDate, votes })
      .then(() => {
        const score = (creationDate / halfTime) + Math.log10(votes);
        return this.add({
          member,
          score,
        });
      })
      .then((add) => {
        debugInfo(`added vote hot on list ${this.name}`, add);
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
