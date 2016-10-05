import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import 'sinon-as-promised';
import { it, before, afterEach } from 'arrow-mocha/es5';
import * as RedLeaf from '../lib';
import slugid from 'slugid';


/*
import _debug from 'debug';
const debug = _debug('feedModule:test');
*/


chai.use(chaiAsPromised);
chai.use(dirtyChai);

describe('Redis Zlist', () => {
  const member = slugid.v4();
  const score = 1;
  const zlist = new RedLeaf.ZList('test_redis');
  console.log(zlist._redis);
  describe('add', () => {
    let zListAddStub;
    before(() => {
      zListAddStub = sinon.stub(zlist._redis, 'zadd').resolves('test_add');
    });
    afterEach(() => zListAddStub.reset());
    after(() => zListAddStub.restore());
    it('should call zadd from redis', async () => {
      const add = await zlist.add({ score, member });
      expect(add).equal('test_add');
      sinon.assert.calledOnce(zListAddStub);
      sinon.assert.calledWithExactly(zListAddStub, 'test_redis', score, member);
    });
  });
  describe('score', () => {
    let zListScoreStub;
    before(() => {
      zListScoreStub = sinon.stub(zlist._redis, 'zscore').resolves('test_score');
    });
    afterEach(() => zListScoreStub.reset());
    after(() => zListScoreStub.restore());
    it('should call zscore from redis', async () => {
      const scoreFetch = await zlist.score(member);
      expect(scoreFetch).equal('test_score');
      sinon.assert.calledOnce(zListScoreStub);
      sinon.assert.calledWithExactly(zListScoreStub, 'test_redis', member);
    });
  });
  describe('remove', () => {
    let zListRemoveStub;
    before(() => {
      zListRemoveStub = sinon.stub(zlist._redis, 'zrem').resolves('test_remove');
    });
    afterEach(() => zListRemoveStub.reset());
    after(() => zListRemoveStub.restore());
    it('should call zrem from redis', async () => {
      const remove = await zlist.remove(member);
      expect(remove).equal('test_remove');
      sinon.assert.calledOnce(zListRemoveStub);
      sinon.assert.calledWithExactly(zListRemoveStub, 'test_redis', member);
    });
  });
  describe('scan', () => {
    let zListScanStub;
    const cursor = 0;
    before(() => {
      zListScanStub = sinon.stub(zlist._redis, 'zscan')
        .resolves(['testPointer', ['testMember', 'testScore']]);
    });
    afterEach(() => zListScanStub.reset());
    after(() => zListScanStub.restore());
    it('should call zscan from redis', async () => {
      const scan = await zlist.scan(cursor);
      expect(scan).eql({
        pointer: 'testPointer',
        data: [{ member: 'testMember', score: 'testScore' }],
      });
      sinon.assert.calledOnce(zListScanStub);
      sinon.assert.calledWithExactly(zListScanStub, 'test_redis', cursor);
    });
  });
  describe('rangeByScore', () => {
    let zListRangeStub;
    before(() => {
      zListRangeStub = sinon.stub(zlist._redis, 'zrangebyscore')
        .resolves(['test_member1', 'test_member2', 'test_member3']);
    });
    afterEach(() => {
      zListRangeStub.reset();
    });
    it('should call zrangebyscore from redis', async () => {
      const range = {
        min: 0,
        max: '+inf',
      };
      const limit = {
        offset: 0,
        count: 2,
      };
      await zlist.rangeByScore({ range, limit });
      sinon.assert.calledOnce(zListRangeStub);
      sinon.assert.calledWithExactly(zListRangeStub,
        zlist.name, range.min, range.max, 'LIMIT', limit.offset, limit.count, 'WITHSCORES');
    });
    it('should call zrange with defaults', async () => {
      await zlist.rangeByScore();
      sinon.assert.calledOnce(zListRangeStub);
      sinon.assert.calledWithExactly(zListRangeStub, zlist.name, '-inf', '+inf', 'WITHSCORES');
    });
    it('should cast members to objects', async () => {
      zListRangeStub.resolves(['memberTest', 55, 'memberTest2', 66]);
      const datas = await zlist.rangeByScore();
      expect(datas).to.eql([
        { member: 'memberTest', score: 55 },
        { member: 'memberTest2', score: 66 },
      ]);
    });
    it('should call Reverse Range from redis', async () => {
      const zListRangeRevStub = sinon.stub(zlist._redis, 'zrevrangebyscore')
        .resolves(['test_member1', 'test_member2', 'test_member3']);
      await zlist.rangeByScore({ reverse: true });
      sinon.assert.neverCalledWith(zListRangeStub);
      sinon.assert.calledWithExactly(zListRangeRevStub, zlist.name, '+inf', '-inf', 'WITHSCORES');
    });
  });

  describe('plugin', () => {
    let zListPluginStub;
    before(() => {
      zListPluginStub = sinon.stub();
    });
    afterEach(() => {
      zListPluginStub.reset();
    });
    it('should call plugin with it self and options', () => {
      const optionsMock = {
        testKey: 12,
        key: 'testAttribute',
      };
      zlist.plugin(zListPluginStub, optionsMock);
      sinon.assert.calledOnce(zListPluginStub);
      sinon.assert.calledWithExactly(zListPluginStub, zlist, optionsMock);
    });
  });
  describe('static plugin', () => {
    let zListPluginStub;
    before(() => {
      zListPluginStub = sinon.stub();
    });
    afterEach(() => {
      zListPluginStub.reset();
    });
    it('should call plugin with it self and options', () => {
      // RedLeaf.ZList('test_redis2');
      const optionsMock = {
        testKey: 12,
        key: 'testAttribute',
      };
      RedLeaf.ZList.plugin(zListPluginStub, optionsMock);
      sinon.assert.calledOnce(zListPluginStub);
      sinon.assert.calledWithExactly(zListPluginStub, RedLeaf.ZList.prototype, optionsMock);
    });
  });
  describe('preAdd', () => {
    let zListPreAddStub;
    let zListAddStub;
    before(() => {
      zListAddStub = sinon.stub(zlist._redis, 'zadd').resolves('test_add');
    });
    before(() => {
      zListPreAddStub = sinon.stub();
    });
    afterEach(() => {
      zListPreAddStub.reset();
      zListAddStub.reset();
    });
    after(() => zListAddStub.restore());
    it('should call preAdds queued when add is triggered', async () => {
      zlist.preAdd(zListPreAddStub);
      zlist.preAdd(zListPreAddStub);
      sinon.assert.notCalled(zListPreAddStub);
      const toAdd = { score: 'scoreMock', member: 'memberTest' };
      await zlist.add(toAdd);
      sinon.assert.calledTwice(zListPreAddStub);
      sinon.assert.calledWithExactly(zListPreAddStub, zlist, toAdd);
    });
  });
  describe('preRem', () => {
    let zlistPreRemStub;
    let zlistRemStub;
    before(() => {
      zlistRemStub = sinon.stub(zlist._redis, 'zrem')
        .returns('remTest');
      zlistPreRemStub = sinon.stub();
    });
    afterEach(() => {
      zlistRemStub.reset();
      zlistPreRemStub.reset();
    });

    it('should call preRem queue when rem is triggered', async () => {
      zlist.preRem(zlistPreRemStub);
      const memberToRem = 'testUser';
      await zlist.remove(memberToRem);
      sinon.assert.calledOnce(zlistRemStub);
      sinon.assert.calledOnce(zlistPreRemStub);
    });
  });
});
