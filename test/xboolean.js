/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');

describe('XBoolean', function() {

  var schema;

  beforeEach(function() {
    schema = new Schema();
  });

  it('should exist as default', function(done) {
    var typ1 = schema.get('boolean');
    assert.equal(typ1.name, 'Boolean');
    done();
  });

  it('should decode boolean value', function(done) {
    var typ1 = schema.get('boolean');
    const val = typ1.decode(true);
    assert.equal(typeof val, 'boolean');
    assert.deepEqual(val, true);
    done();
  });

  it('should decode number value', function(done) {
    var typ1 = schema.get('boolean');
    const val = typ1.decode(1);
    assert.equal(typeof val, 'boolean');
    assert.deepEqual(val, true);
    done();
  });

  it('should decode string value', function(done) {
    var typ1 = schema.get('boolean');
    const val = typ1.decode('false');
    assert.equal(typeof val, 'boolean');
    assert.deepEqual(val, false);
    assert.deepEqual(typ1.decode('true'), true);
    assert.deepEqual(typ1.decode('1'), true);
    assert.deepEqual(typ1.decode('0'), false);
    done();
  });

  it('should encode', function(done) {
    var typ1 = schema.get('boolean');
    const val = typ1.encode(true);
    assert.equal(typeof val, 'boolean');
    assert.equal(val, true);
    assert.equal(typ1.encode(true), true);
    assert.equal(typ1.encode(false), false);
    done();
  });

  it('should extend using string def', function(done) {
    var typ1 = schema.extend('typ1', 'boolean');
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('boolean'));
    assert.ok(typ1.isExtendedFrom('boolean'));
    assert.equal(typ1.required, undefined);
    assert.equal(typ1.pattern, undefined);
    done();
  });

  it('should not extend using string def with min,max values', function(done) {
    try {
      schema.extend('typ1', 'boolean(1-10)');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should extend using object def', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'boolean',
      required: true
    });
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('boolean'));
    assert.equal(typ1.required, true);
    assert.equal(typ1.pattern, undefined);
    done();
  });

  it('should not extend using different typeDef argument', function(done) {
    try {
      schema.extend('typ1', 123);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('extended type should decode boolean value', function(done) {
    var typ1 = schema.extend('typ1', 'boolean');
    const val = typ1.decode(true);
    assert.equal(typeof val, 'boolean');
    assert.deepEqual(val, true);
    done();
  });

  it('extended typeshould decode number value', function(done) {
    var typ1 = schema.extend('typ1', 'boolean');
    const val = typ1.decode(1);
    assert.equal(typeof val, 'boolean');
    assert.deepEqual(val, true);
    done();
  });

  it('extended type should decode string value', function(done) {
    var typ1 = schema.extend('typ1', 'boolean');
    const val = typ1.decode('false');
    assert.equal(typeof val, 'boolean');
    assert.deepEqual(val, false);
    assert.deepEqual(typ1.decode('true'), true);
    assert.deepEqual(typ1.decode('1'), true);
    assert.deepEqual(typ1.decode('0'), false);
    done();
  });

  it('extended type should not decode number value', function(done) {
    const typ1 = schema.extend('typ1', 'boolean');
    try {
      typ1.encode(123);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('extended type should encode', function(done) {
    var typ1 = schema.extend('typ1', 'boolean');
    const val = typ1.encode(true);
    assert.equal(typeof val, 'boolean');
    assert.equal(val, true);
    assert.equal(typ1.encode(true), true);
    assert.equal(typ1.encode(false), false);
    done();
  });

});