/**
 * Created by david on 2/6/17.
 */
const hotStream = require('../lib/plugins/HotStream');
const Promise = require('bluebird');

const myList = {
  add: (...args) => {
    console.log(args);
  },
  execPre() {
    return Promise.resolve()
  }
};

hotStream.default(myList, {
  tenthLife: 24*60*60*1000
});

const creationDate = 1486413066000;
const tomorrow = creationDate + 24*60*60*1000;
console.log('HalfTime',myList._HotStreamHalfTime);
Promise.all([
    myList.voteHot({
      member: 'testMember2',
      creationDate,
      votes: 2
    }),
    myList.voteHot({
      member: 'testMember4',
      creationDate,
      votes: 4
    }),
    myList.voteHot({
      member: 'testMemberTomorrow',
      creationDate: tomorrow,
      votes: 2
    })
])
.then(() => {
  console.log('completed')
}).catch((err) => {
  console.error(err);
});
