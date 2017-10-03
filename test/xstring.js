/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');

describe('XString', function() {

  var schema;

  beforeEach(function() {
    schema = new Schema();
  });

  it('should exist as default', function(done) {
    var typ1 = schema.get('string');
    assert.equal(typ1.name, 'String');
    done();
  });

  it('should decode boolean value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode(true);
    assert.equal(typeof val, 'string');
    assert.equal(val, 'true');
    done();
  });

  it('should decode number value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode(1234.5);
    assert.equal(typeof val, 'string');
    assert.equal(val, '1234.5');
    done();
  });

  it('should decode null value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode(null);
    assert.equal(val, null);
    done();
  });

  it('should decode string value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode('1234.5');
    assert.equal(typeof val, 'string');
    assert.equal(val, '1234.5');
    done();
  });

  it('should decode Nan value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode(NaN);
    assert.equal(typeof val, 'string');
    assert.equal(val, 'NaN');
    done();
  });

  it('should decode Object value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode({});
    assert.equal(typeof val, 'string');
    assert.equal(val, '{}');
    done();
  });

  it('should decode Array value', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.decode([]);
    assert.equal(typeof val, 'string');
    assert.equal(val, '[]');
    done();
  });

  it('should encode', function(done) {
    var typ1 = schema.get('string');
    const val = typ1.encode('1234.5');
    assert.equal(typeof val, 'string');
    assert.equal(val, '1234.5');
    done();
  });

  it('should not encode with invalid value', function(done) {
    var typ1 = schema.get('string');
    try {
      typ1.encode(1234);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });


  it('should extend using string def', function(done) {
    var typ1 = schema.extend('typ1', 'string');
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('string'));
    assert.equal(typ1.required, undefined);
    assert.equal(typ1.pattern, undefined);
    done();
  });

  it('should extend using string def with min,max size', function(done) {
    var typ1 = schema.extend('typ1', 'string(5-10)');
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('string'));
    assert.equal(typ1.required, undefined);
    assert.equal(typ1.pattern, undefined);
    assert.equal(typ1.minSize, 5);
    assert.equal(typ1.maxSize, 10);
    var t = 0;
    try {
      typ1.decode('1234');
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      typ1.decode('12345678901');
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    assert.equal(typ1.decode('12345678'), '12345678');
    done();
  });

  it('should extend using object def', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'string',
      required: true,
      pattern: /\w+/
    });
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('string'));
    assert.equal(typ1.required, true);
    assert.deepEqual(typ1.pattern, /\w+/);
    done();
  });

  it('should not extend with invalid params', function(done) {
    var t = 0;
    try {
      schema.extend({
        name: 'typ1',
        base: 'string',
        minSize: 'abc'
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      schema.extend({
        name: 'typ1',
        base: 'string',
        maxSize: 'abc'
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    done();
  });

  it('extended type should decode boolean value', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'string',
      pattern: 'true|false'
    });
    const val = typ1.decode(true);
    assert.equal(typeof val, 'string');
    assert.ok(isNaN(val));
    done();
  });

  it('extended type should decode number value', function(done) {
    var typ1 = schema.extend('typ1', 'string');
    const val = typ1.decode(1234.5);
    assert.equal(typeof val, 'string');
    assert.equal(val, '1234.5');
    done();
  });

  it('extended type should decode string value', function(done) {
    var typ1 = schema.extend('typ1', 'string');
    const val = typ1.decode('1234.5');
    assert.equal(typeof val, 'string');
    assert.equal(val, '1234.5');
    done();
  });

  it('extended type should encode', function(done) {
    var typ1 = schema.extend('typ1', 'string');
    const val = typ1.encode('1234.5');
    assert.equal(typeof val, 'string');
    assert.equal(val, '1234.5');
    done();
  });

});