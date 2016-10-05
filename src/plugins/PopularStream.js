/**
 * Created by david on 10/4/16.
 */
/**
 *
 * @param {Object} list
 * @param {number} halfLife
 * @param {number} epoch
 */
export default (list, {
  halfLife = 86400000 / 100000,
  epoch = new Date(2015, 10, 1).getTime() / 100000 } = {}) => {

  list.votePopular = (member) => {
    this.incrementBy({ member, by: 2 * ((new Date().getTime() - epoch) / halfLife) });
    this.trim(10000);
  };

  list.trim = async (amount) => {
    if (Math.random() < (2 / amount)) {
      await list.removeRangeByRank({
        min: 0,
        max: -amount,
      });
    }
  };
};
