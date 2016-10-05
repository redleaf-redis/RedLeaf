/**
 * Created by david on 9/27/16.
 */
/**
 *
 * @param {ZList} list
 */
export default (list) => {
  list.paginate = async function paginate({
    sinceId, maxId, limit = 1, reverse = false,
    filter,
  } = {}) {
    const range = {};
    // set the ranges to search on redis
    if (sinceId) {
      range.min = await list.score(sinceId);
    }
    if (maxId) {
      range.max = await list.score(maxId);
    }

    // get one more item on count, it is the nextCursor for pagination
    const limitRange = {
      count: limit + 1,
    };

    // get the members and scores with the filters
    const objectsFirstFound = await list.rangeByScore({
      range,
      reverse,
      limit: limitRange,
    });

    // if there is no objects found return empty
    if (!objectsFirstFound.length) {
      return {
        objects: [],
      };
    }
    // final objects to be returned goes here
    let objects = [];
    if (filter) {
      let objToFilter = objectsFirstFound;

      // loop once to apply the filter
      do {
        // filter objects found that has not been filtered
        const objectsFiltered = await Promise.resolve(objToFilter).filter(filter);

        // add filtered objects to final array
        objects = objects.concat(objectsFiltered);

        const lastIndex = objToFilter.length - 1;
        const lastScore = objToFilter[lastIndex].score;

        // set the limit to get the missing objects filtered
        limitRange.count -= objectsFiltered.length;
        range.max = parseInt(lastScore, 10) - 1;

        // get the new objects from the model list
        objToFilter = await list.rangeByScore({
          range,
          reverse,
          limit: limitRange,
        });

        // while the limit has items to get and the found objects to fetch and filter
      } while (limitRange.count > 0 && objToFilter.length > 0);
    } else {
      // if there is no filter set objects found
      objects = objectsFirstFound;
    }
    let nextMaxId;

    // if the objects has more than the limit, means it got the cursor to paginate
    if (objects.length > limit) {
      const last = objects.pop();
      nextMaxId = last.member;
    }
    return {
      objects,
      nextMaxId,
    };
  };
};
