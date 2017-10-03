/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');

describe('XInteger', function() {

  var schema;

  beforeEach(function() {
    schema = new Schema();
  });

  it('should exist as default', function(done) {
    var typ1 = schema.get('integer');
    assert.equal(typ1.name, 'Integer');
    done();
  });

  it('should not decode boolean value', function(done) {
    var typ1 = schema.get('integer');
    try {
      typ1.decode(true);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should decode number value', function(done) {
    var typ1 = schema.get('integer');
    const val = typ1.decode(1234.5);
    assert.equal(typeof val, 'number');
    assert.equal(val, 1234);
    done();
  });

  it('should decode string value', function(done) {
    var typ1 = schema.get('integer');
    const val = typ1.decode('1234.5');
    assert.equal(typeof val, 'number');
    assert.equal(val, 1234);
    assert.equal(typ1.decode(null), null);
    done();
  });

  it('should not decode NaN value', function(done) {
    var typ1 = schema.get('integer');
    try {
      typ1.decode(NaN);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should not decode Object value', function(done) {
    var typ1 = schema.get('integer');
    try {
      typ1.decode({});
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should not decode Array value', function(done) {
    var typ1 = schema.get('integer');
    try {
      typ1.decode([]);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should encode', function(done) {
    var typ1 = schema.get('integer');
    const val = typ1.encode(1234);
    assert.equal(typeof val, 'number');
    assert.deepEqual(val, 1234);
    done();
  });

  it('should not encode double value', function(done) {
    var typ1 = schema.get('integer');
    try {
      typ1.encode(1234.5);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should extend using string def', function(done) {
    var typ1 = schema.extend('typ1', '!integer');
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('integer'));
    assert.equal(typ1.required, true);
    assert.equal(typ1.pattern, undefined);
    try {
      typ1.decode(null);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should extend using string def with min,max values', function(done) {
    var typ1 = schema.extend('typ1', 'integer(5-10)');
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('integer'));
    assert.equal(typ1.required, undefined);
    assert.equal(typ1.pattern, undefined);
    assert.equal(typ1.minValue, 5);
    assert.equal(typ1.maxValue, 10);
    var t = 0;
    try {
      typ1.decode('4');
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      typ1.decode(11);
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    assert.equal(typ1.decode(8), 8);
    done();
  });

  it('should extend using object def', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'integer',
      required: true
    });
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('integer'));
    assert.ok(!typ1.isExtendedFrom('number'));
    assert.ok(typ1.isExtendedFrom('integer'));
    assert.equal(typ1.required, true);
    assert.equal(typ1.pattern, undefined);
    done();
  });

  it('should not extend with invalid params', function(done) {
    var t = 0;
    try {
      schema.extend({
        name: 'typ1',
        base: 'integer',
        minValue: 'abc'
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      schema.extend({
        name: 'typ1',
        base: 'integer',
        maxValue: 'abc'
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    done();
  });

  it('extended type should decode boolean value', function(done) {
    var typ1 = schema.extend('typ1', 'integer');
    try {
      typ1.decode(true);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('extended type should decode number value', function(done) {
    var typ1 = schema.extend('typ1', 'integer');
    const val = typ1.decode(1234.5);
    assert.equal(typeof val, 'number');
    assert.equal(val, 1234);
    done();
  });

  it('extended type should decode string value', function(done) {
    var typ1 = schema.extend('typ1', 'integer');
    const val = typ1.decode('1234.5');
    assert.equal(typeof val, 'number');
    assert.equal(val, 1234);
    done();
  });

  it('extended type should encode', function(done) {
    var typ1 = schema.extend('typ1', 'integer');
    const val = typ1.encode(1234);
    assert.equal(typeof val, 'number');
    assert.equal(val, 1234);
    done();
  });

});