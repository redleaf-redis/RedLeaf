# mongoose-paginate-cursor 
[![Build Status](https://travis-ci.org/redleaf-redis/RedLeaf.svg?branch=master)](https://travis-ci.org/redleaf-redis/RedLeaf)
[![Test Coverage](https://codeclimate.com/github/redleaf-redis/RedLeaf/badges/coverage.svg)](https://codeclimate.com/github/redleaf-redis/RedLeaf)
[![Code Climate](https://codeclimate.com/github/luin/ioredis/badges/gpa.svg)](https://codeclimate.com/github/luin/ioredis)
[![codecov](https://codecov.io/gh/redleaf-redis/RedLeaf/branch/master/graph/badge.svg)](https://codecov.io/gh/redleaf-redis/RedLeaf)
[![npm](https://img.shields.io/npm/dm/RedLeaf.svg?maxAge=2592000)](https://www.npmjs.com/package/RedLeaf)
[![Dependency Status](https://david-dm.org/redleaf-redis/RedLeaf.svg)](https://david-dm.org/redleaf-redis/RedLeaf)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


## Installation

`npm install redleaf`

## Usage
```js
// body parser
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-cursor');

var ModelSchema = mongoose.Schema({
  title: String,
  count: Number
});

ModelSchema.plugin(mongoosePaginate,{
  // name: 'paged' // custom name of paginate function
})

var Model = mongoose.model('MyModel', ModelSchema);

var paged = await Model.paginate({
  sinceId, // from what value to get documents (default: null)
  maxId, // to what value to get documents (default: null)
  limit, //amount of documents to get on search (default: 1)
  select, //what values get on request
  where, // query to match the search
  keyPaginated, //key to paginate on document (ejm: 'count' ) (default: '_id')
  reverse, //tell the pagination to reverse the search
});

paged.objects // objects found
paged.nextCursor // the key value of the next cursor
```
`.paginate()` returns a promise, or can be used with a callback
`.paginate({},callback)`

## Features to have
- [ ] Map: *let the user map the documents*
- [ ] QueryMap: *let the user map the query to add chain calls*
- [ ] Filter: *filter documents and search more to reach the limit*
- [ ] beforeCursor: *cursor for before request*

### License: MIT

