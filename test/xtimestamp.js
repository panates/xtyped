/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');

describe('XTimestamp', function() {

  var schema;

  beforeEach(function() {
    schema = new Schema();
  });

  it('should exist as default', function(done) {
    var typ1 = schema.get('timestamp');
    assert.equal(typ1.name, 'Timestamp');
    done();
  });

  it('should not decode boolean value', function(done) {
    var typ1 = schema.get('timestamp');
    try {
      typ1.decode(true);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should decode number value', function(done) {
    var typ1 = schema.get('timestamp');
    const val = typ1.decode(-611587785000); // Date.UTC(1950, 7, 15, 10, 30, 15)
    assert.ok(val instanceof Date);
    assert.equal(val.getTime(), Date.UTC(1950, 7, 15, 10, 30, 15));
    done();
  });

  it('should decode string value', function(done) {
    var typ1 = schema.get('timestamp');
    const val = typ1.decode('1970-01-01T10:30:15.000Z');
    assert.ok(val instanceof Date);
    assert.equal(val.getTime(), Date.UTC(1970, 0, 1, 10, 30, 15));
    done();
  });

  it('should not decode NaN value', function(done) {
    var typ1 = schema.get('timestamp');
    try {
      typ1.decode(NaN);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should not decode Object value', function(done) {
    var typ1 = schema.get('timestamp');
    try {
      typ1.decode({});
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should not decode Array value', function(done) {
    var typ1 = schema.get('timestamp');
    try {
      typ1.decode([]);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should encode', function(done) {
    var typ1 = schema.get('timestamp');
    const d = new Date(Date.UTC(2017, 5, 25, 10, 30, 0));
    const val = typ1.encode(d);
    assert.equal(typeof val, 'string');
    assert.equal(val, '2017-06-25T10:30:00.000Z');
    done();
  });

  it('should encode null value', function(done) {
    var typ1 = schema.get('timestamp');
    const val = typ1.encode(null);
    assert.equal(val, null);
    done();
  });

  it('should extend using string def', function(done) {
    var typ1 = schema.extend('typ1', 'timestamp');
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('timestamp'));
    assert.equal(typ1.required, undefined);
    assert.equal(typ1.pattern, undefined);
    done();
  });

  it('should extend using object def with min,max values', function(done) {
    var typ1 = schema.extend('typ1', {
      base: 'timestamp',
      minValue: '2001-02-15 10:30:20',
      maxValue: '2015-03-01 11:20:30'
    });
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('timestamp'));
    assert.equal(typ1.required, undefined);
    assert.equal(typ1.pattern, undefined);
    assert.equal(typ1.minValue.getTime(), Date.UTC(2001, 1, 15, 10, 30, 20));
    assert.equal(typ1.maxValue.getTime(), Date.UTC(2015, 2, 1, 11, 20, 30));
    var t = 0;
    try {
      typ1.decode('1990-01-01');
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      typ1.decode('2015-03-02');
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    done();
  });

  it('should extend using object def', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'timestamp',
      required: true
    });
    assert.equal(typ1.name, 'typ1');
    assert.equal(typ1.base, schema.get('timestamp'));
    assert.ok(typ1.isExtendedFrom('timestamp'));
    assert.equal(typ1.required, true);
    assert.equal(typ1.pattern, undefined);
    done();
  });

  it('should not extend with invalid params', function(done) {
    var t = 0;
    try {
      schema.extend({
        name: 'typ1',
        base: 'timestamp',
        minValue: 'abc'
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      schema.extend({
        name: 'typ1',
        base: 'timestamp',
        maxValue: 'abc'
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    try {
      schema.extend({
        name: 'typ1',
        base: 'date',
        format: 123
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 3);

    done();
  });

  it('extended type should not decode boolean value', function(done) {
    var typ1 = schema.extend('typ1', 'number');
    try {
      typ1.decode(true);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('extended type should decode number value', function(done) {
    var typ1 = schema.extend('typ1', 'timestamp');
    const val = typ1.decode(-611587785000); // Date.UTC(1950, 7, 15, 10, 30, 15)
    assert.ok(val instanceof Date);
    assert.equal(val.getTime(), Date.UTC(1950, 7, 15, 10, 30, 15));
    done();
  });

  it('extended type should decode string value', function(done) {
    var typ1 = schema.extend('typ1', 'timestamp');
    const val = typ1.decode('1970-01-01T10:30:15.000Z');
    assert.ok(val instanceof Date);
    assert.equal(val.getTime(), Date.UTC(1970, 0, 1, 10, 30, 15));
    done();
  });

  it('extended type should encode', function(done) {
    var typ1 = schema.extend('typ1', 'timestamp');
    const d = new Date(Date.UTC(2017, 5, 25, 10, 30, 0));
    const val = typ1.encode(d);
    assert.equal(typeof val, 'string');
    assert.equal(val, '2017-06-25T10:30:00.000Z');
    done();
  });

  it('extended type should encode', function(done) {
    var typ1 = schema.extend('typ1', {
      base: 'timestamp',
      format: 'YYYY/MM/DD HH:mm:SS'
    });
    const d = new Date(Date.UTC(2017, 5, 25, 10, 30, 0));
    const val = typ1.encode(d);
    assert.equal(typeof val, 'string');
    assert.equal(val, '2017/06/25 10:30:00');
    done();
  });

});