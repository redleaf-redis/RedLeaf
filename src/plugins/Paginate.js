/**
 * Created by david on 9/27/16.
 */
import Promise from 'bluebird';
import _debug from 'debug';

const debug = _debug('rpaginate');
/**
 *
 * @param {ZList} list
 */
export default (list) => {
  list.paginate = async function paginate({
    sinceId, maxId, limit = 1, reverse = false,
    filter,
  } = {}) {
    debug('paginate', { sinceId, maxId, limit, reverse });
    const limitNumber = parseInt(limit, 10) || 1;
    const range = {};
    // set the ranges to search on redis
    if (sinceId) {
      range.max = await this.score(sinceId);
    }
    if (maxId) {
      range.min = await this.score(maxId);
    }

    // get one more item on count, it is the nextCursor for pagination
    const limitRange = {
      count: limitNumber + 1,
    };

    // get the members and scores with the filters
    let objectsFirstFound = await this.rangeByScore({
      range,
      reverse,
      limit: limitRange,
    });
    objectsFirstFound = objectsFirstFound.slice();

    // if there is no objects found return empty
    if (!objectsFirstFound.length) {
      return {
        objects: [],
      };
    }
    let last;

    if (objectsFirstFound.length > limitNumber) {
      last = objectsFirstFound.pop();
    }
    // final objects to be returned goes here
    let objects = [];
    if (filter) {
      let objToFilter = objectsFirstFound;
      debug('objToFilter.length', objToFilter.length);
      let missingObjectsAmount = objects.length - limitNumber;

      // loop once to apply the filter
      do {
        // filter objects found that has not been filtered
        const objectsFiltered = await Promise.filter(objToFilter, filter);

        // add filtered objects to final array
        objects = objects.concat(objectsFiltered);

        missingObjectsAmount = limitNumber - objects.length;
        debug('missingObjectsAmount', missingObjectsAmount);
        if (last && missingObjectsAmount > 0) {
          const lastIndex = objToFilter.length - 1;
          const lastScore = objToFilter[lastIndex].score;

          // set the limit to get the missing objects filtered
          limitRange.count = missingObjectsAmount;
          if (lastScore === '-inf') {
            range.max = '-inf';
          } else {
            range.max = (parseInt(lastScore, 10) - 1) || '+inf';
          }

          // get the new objects from the model list
          objToFilter = await this.rangeByScore({
            range,
            reverse,
            limit: limitRange,
          });
          objToFilter = [last].concat(objToFilter);
          debug('objToFilter.length', objToFilter.length);
          last = objToFilter.pop();
        }

        // while the limit has items to get and the found objects to fetch and filter
      } while (last && missingObjectsAmount > 0 && objToFilter.length > 0);
    } else {
      // if there is no filter set objects found
      objects = objectsFirstFound;
    }
    let nextMaxId;

    // if the objects has more than the limit, means it got the cursor to paginate
    if (last) {
      nextMaxId = last.member;
    }
    return {
      objects,
      nextMaxId,
    };
  };
};
