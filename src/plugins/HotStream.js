/**
 * Created by david on 10/4/16.
 */
/**
 *
 * @param {Object} list
 * @param {number} tenthLife 12 hours (12*60*60*1000)
 * How long until a post with 100 votes is less interesting than one with 10 votes?
 */
export default (list, { tenthLife = 43200000 / 100000 } = {}) => {
  const halfTime = tenthLife * (Math.log(10) / Math.log(2));
  list.voteHot = ({ member, creationDate, votes }) => {
    const score = (creationDate / halfTime) + Math.log10(votes + 1);
    this.add({
      member,
      score,
    });
    this.trim(10000);
  };

  list.trim = async(amount) => {
    if (Math.random() < (2 / amount)) {
      await list.removeRangeByRank({
        min: 0,
        max: -amount,
      });
    }
  };
};
