/**
 * Created by david on 10/5/16.
 */
/**
 *
 * @param {Object} list
 * @param {number} tenthLife 12 hours (12*60*60*1000) How long until a post with 100 votes is less interesting than one with 10 votes?
 * @param {number} dripPeriod 1 hour (60*60*1000) How often should a new story be pushed to the stream?
 * @param {String} thresholdKey key name for treshold
 */
export default (list, {
  tenthLife = 43200000 / 100000,
  dripPeriod = 3600000 / 100000,
  thresholdKey = 'dripStreamThreshold' } = {}) => {
  list.voteDrip = async({ member, creationDate, votes }) => {
    // const scoreM = await list.score(member);
    const points = votes + 1;
    const score = creationDate / tenthLife + Math.log10(points);
    const threshold = ((await list._redis.get(thresholdKey)) || score) + dripPeriod / tenthLife;
    if (score > threshold) {
      list._redis.set(thresholdKey, threshold + dripPeriod / tenthLife);

      // dict[post.id] = value
      const nowDate = new Date().getTime();
      list.add({ member, score: nowDate / 100000 });

      this.trim(10000);
    }
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
