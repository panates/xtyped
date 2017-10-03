/* eslint-disable */
const assert = require('assert');
const Schema = require('../');

describe('Schema', function() {

  it('should set uri', function(done) {
    var schema = new Schema();
    schema.uri = 'http://tempuri.org';
    assert.equal(schema.uri, 'http://tempuri.org');
    done();
  });

  it('should not set invalid uri', function(done) {
    var schema = new Schema();
    try {
      schema.uri = 'temp..uri';
    } catch (e) {
      done();
      return;
    }
    throw new Error('Failed');
  });

  it('should define', function(done) {
    var schema = new Schema();
    schema.define('typ1', 'number');
    done();
  });

  it('should defineAll', function(done) {
    var schema = new Schema();
    schema.defineAll({
      typ1: 'number',
      typ2: 'string'
    });
    done();
  });

  it('should not extend unknown type', function(done) {
    var schema = new Schema();
    try {
      schema.extend('typ1', 'xyz');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should link an other schema', function(done) {
    var schema = new Schema();
    var schema2 = new Schema();
    schema.link('s2', schema2);
    schema2.define('rate', '!number(1-100)');
    var typ1 = schema.extend('typ1', 's2.rate');
    var val = typ1.decode('5');
    assert.equal(val, 5);
    typ1 = schema.get('s2.rate');
    assert.equal(typ1.name, 'rate');
    typ1 = schema.get('rate');
    assert.equal(typ1.name, 'rate');
    typ1 = schema.get('number');
    assert.equal(typ1.name, 'Number');
    done();
  });

  it('should throw error when type not found', function(done) {
    var schema = new Schema();
    try {
      schema.get('s2.rate');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should throw error when type not found', function(done) {
    var schema = new Schema();
    var schema2 = new Schema();
    schema.link('s2', schema2);
    try {
      schema.get('s2.rate');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should not link an other schema when ns is not valid', function(done) {
    var schema = new Schema();
    var schema2 = new Schema();
    try {
      schema.link('-s2', schema2);
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

});