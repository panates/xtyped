/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');
const ValidateError = require('errorex').ValidateError;

describe('XType', function() {

  var schema;

  beforeEach(function() {
    schema = new Schema();
  });

  it('should exist as default', function(done) {
    var typ1 = schema.get('any');
    assert.equal(typ1.name, 'Any');
    done();
  });

  it('should extend using object def', function(done) {
    var t = 0;
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'any',
      onDecode: function(val) {
        t++;
        return 'decoded_' + val;
      },
      onEncode: function(val) {
        t++;
        return 'encoded_' + val;
      },
      onValidate: function(val) {
        t++;
      }
    });
    var val = typ1.decode('abc');
    assert.equal(val, 'decoded_abc');
    val = typ1.encode('abc');
    assert.equal(val, 'encoded_abc');
    assert.equal(t, 4);
    done();
  });

  it('should not extend using invalid object def', function(done) {
    var t = 0;
    try {
      schema.extend({
        name: 'typ1',
        base: 'any',
        onDecode: 1
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 1);
    try {
      schema.extend({
        name: 'typ1',
        base: 'any',
        onEncode: 2
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 2);
    try {
      schema.extend({
        name: 'typ1',
        base: 'any',
        onValidate: 3
      });
    } catch (e) {
      t++;
    }
    assert.equal(t, 3);
    done();
  });

  it('should onValidate must always throw Validate error-1', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'any',
      onValidate: function(val) {
        throw 'any error';
      }
    });
    try {
      typ1.decode(1);
    } catch (e) {
      if (e.name === 'ValidateError') {
        done();
        return;
      }
    }
    assert(0);
  });

  it('should onValidate must always throw Validate error-2', function(done) {
    var typ1 = schema.extend({
      name: 'typ1',
      base: 'any',
      onValidate: function(val) {
        throw new ValidateError('any error');
      }
    });
    try {
      typ1.decode(1);
    } catch (e) {
      if (e.name === 'ValidateError') {
        done();
        return;
      }
    }
    assert(0);
  });

  it('should validate "required"', function(done) {
    var typ1 = schema.extend('typ1', '!any');
    try {
      typ1.decode(null);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should validate "pattern"', function(done) {
    var typ1 = schema.extend('typ1', {
      base: 'any',
      pattern: /^\d+$/
    });
    typ1.decode('123');
    try {
      typ1.decode('a123');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

});