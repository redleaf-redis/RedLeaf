/**
 * Created by david on 9/27/16.
 */
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import 'sinon-as-promised';
import { it, afterEach } from 'arrow-mocha/es5';
import * as RedLeaf from '../lib';
import * as Plugins from '../lib/plugins';

/*

 import _debug from 'debug';
 const debug = _debug('feedModule:test');
 */


chai.use(chaiAsPromised);
chai.use(dirtyChai);


describe('Redis Paginate', () => {
  const listTest = new RedLeaf.ZList('testTimeLine');
  listTest.plugin(Plugins.paginate);
  const stubListRangeByScore = sinon.stub(listTest, 'rangeByScore').returns([
    { member: '78c1cc103acff2bdce8c54cc9a4b3dac', score: '1007519' },
    { member: '116108ed2402d66aeb50f041ec1fd38b', score: '1007516' },
    { member: 'fcdd3747b192c032cfcd1ebeff2c1ab2', score: '1007514' },
  ]);
  afterEach(() => stubListRangeByScore.reset());
  it('must paginate with no values', async() => {
    await listTest.paginate();
    sinon.assert.calledOnce(stubListRangeByScore);
    sinon.assert.calledWithExactly(stubListRangeByScore, {
      range: {},
      reverse: false, limit: {
        count: 2,
      } });
  });
  it('must paginate with all values', async() => {
    const stubListGetScoreById = sinon.stub(listTest, 'score');

    stubListGetScoreById.withArgs('sinceIdTest').returns('scoreSince');
    stubListGetScoreById.withArgs('maxIdTest').returns('scoreMax');
    await listTest.paginate({
      sinceId: 'sinceIdTest',
      maxId: 'maxIdTest',
      limit: 30,
      reverse: true,
    });
    sinon.assert.calledOnce(stubListRangeByScore);
    sinon.assert.calledWithExactly(stubListRangeByScore, {
      range: {
        min: 'scoreSince',
        max: 'scoreMax',
      },
      reverse: true, limit: {
        count: 31,
      } });
  });
  it('should return a cursor if limit is less than the objects amount', async () => {
    stubListRangeByScore.returns([
      { member: '78c1cc103acff2bdce8c54cc9a4b3dac', score: '1007519' },
      { member: '116108ed2402d66aeb50f041ec1fd38b', score: '1007516' },
      { member: 'fcdd3747b192c032cfcd1ebeff2c1ab2', score: '1007514' },
    ]);
    const paged = await listTest.paginate({
      limit: 2,
    });
    expect(paged).to.exist();
    expect(paged.nextMaxId).to.equals('fcdd3747b192c032cfcd1ebeff2c1ab2');
    expect(paged.objects).to.eql([
      { member: '78c1cc103acff2bdce8c54cc9a4b3dac', score: '1007519' },
      { member: '116108ed2402d66aeb50f041ec1fd38b', score: '1007516' },
    ]);
  });
  it('should not return a cursor if limit is higher or equal than the objects amount', async () => {
    stubListRangeByScore.returns([
      { member: '78c1cc103acff2bdce8c54cc9a4b3dac', score: '1007519' },
      { member: '116108ed2402d66aeb50f041ec1fd38b', score: '1007516' },
      { member: 'fcdd3747b192c032cfcd1ebeff2c1ab2', score: '1007514' },
    ]);
    const paged = await listTest.paginate({
      limit: 3,
    });
    expect(paged).to.exist();
    expect(paged.nextMaxId).to.not.exist();
    expect(paged.objects).to.eql([
      { member: '78c1cc103acff2bdce8c54cc9a4b3dac', score: '1007519' },
      { member: '116108ed2402d66aeb50f041ec1fd38b', score: '1007516' },
      { member: 'fcdd3747b192c032cfcd1ebeff2c1ab2', score: '1007514' },
    ]);
  });
});
