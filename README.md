# RedLeaf 
[![Build Status](https://travis-ci.org/redleaf-redis/RedLeaf.svg?branch=master)](https://travis-ci.org/redleaf-redis/RedLeaf)
[![Test Coverage](https://codeclimate.com/github/redleaf-redis/RedLeaf/badges/coverage.svg)](https://codeclimate.com/github/redleaf-redis/RedLeaf)
[![Code Climate](https://codeclimate.com/github/luin/ioredis/badges/gpa.svg)](https://codeclimate.com/github/luin/ioredis)
[![codecov](https://codecov.io/gh/redleaf-redis/RedLeaf/branch/master/graph/badge.svg)](https://codecov.io/gh/redleaf-redis/RedLeaf)
[![npm](https://img.shields.io/npm/dm/redleaf.svg?maxAge=2592000)](https://www.npmjs.com/package/redleaf)
[![Dependency Status](https://david-dm.org/redleaf-redis/RedLeaf.svg)](https://david-dm.org/redleaf-redis/RedLeaf)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


## Installation

`npm install redleaf`

## Usage
```js
import redleaf from 'redleaf';
```
### ZList

create a sorted set

| Param | Type | Description |
| --- | --- | --- |
| key | `String` | key of the list |
| server | `ioredis` | server instance of ioredis |

```javascript
import { ZList } from 'redleaf';
import Redis from 'ioredis';

const redisServer = new Redis();
const list = new ZList('listKey', redisServer)
```
#### list.add({ score, member }) => ` Promise<0|1>`
[ZADD](http://redis.io/commands/zadd)

| Param | Type | Description |
| --- | --- | --- |
| score | `Number` | score of member |
| member | ` String ` | value to add on list |

```javascript
list.add({
	member: 'one',
	score: 1,
	})
list.add({
	member: 'two',
	score: 2,
	})
```

#### score(member) => ` Promise< Number > `
[ZSCORE](http://redis.io/commands/zscore)

| Param | Type | Description |
| --- | --- | --- |
| member | ` String ` | value to ask for its score |

```javascript
list.score('one') // 1
list.scrose('three') // -1
```

#### remove(member) => ` Promise<1|2> `
[ZREM](http://redis.io/commands/zrem)

| Param | Type | Description |
| --- | --- | --- |
| member | `String ` | value to remove from set |

```javascript
list.remove('one') // 1
list.remove('four') // 0
```
#### scan(cursor) => ` Promise< {pointer: String, data: [{ member, score }] } > `
[ZSCAN](http://redis.io/commands/zscan)

| Param | Type | Description |
| --- | --- | --- |
| cursor | `String` | to iterate over set |

#### rangeByScore(ops) => ` Promise<[{ member, score }]> `
[ZRANGEBYSCORE](http://redis.io/commands/zrangebyscore)

[ZREVRANGEBYSCORE](http://redis.io/commands/zrevrangebyscore)

| Param | Type | Default |Description |
| --- | --- | --- | --- |
| [ops] | `String` | `{}` | |
| [ops.range] | `String` | `{}` | range to get the items |
| [ops.range.min] | `String` | `"-inf"` | score minimun to get items |
| [ops.range.max] | `String` | `"+inf"` | score maximun to get items|
| [ops.limit] | ` String ` |  | ammount max to bring on request |
| [ops.reverse] | ` Boolean ` | `false` | to use ZREVRANGEBYSCORE or not |

```javascript
list.rangeByScore() // [ {member: 'one', score: 1 }, { member: 'two', score: 2 }]
list.rangeByScore({
	range: {
		min: 1,
		max: 5
	},
	limit: 1,
	reverse: true
}); // [ { member: 'two', score: 2 }]

```
## Features to have

### License: MIT

