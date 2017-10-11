/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');

describe('XArray', function() {

  describe('General', function() {
    var schema;

    beforeEach(function() {
      schema = new Schema();
    });

    it('should exist as default', function(done) {
      var typ1 = schema.get('array');
      assert.equal(typ1.name, 'Array');
      done();
    });

    it('should decode array value', function(done) {
      var typ1 = schema.get('array');
      const val = typ1.decode([1, 2, '3']);
      assert.ok(Array.isArray(val));
      assert.deepEqual(val, [1, 2, '3']);
      done();
    });

    it('should decode boolean value', function(done) {
      var typ1 = schema.get('array');
      const val = typ1.decode(true);
      assert.ok(Array.isArray(val));
      assert.deepEqual(val, [true]);
      done();
    });

    it('should decode number value', function(done) {
      var typ1 = schema.get('array');
      const val = typ1.decode(1);
      assert.ok(Array.isArray(val));
      assert.deepEqual(val, [1]);
      done();
    });

    it('should decode string value', function(done) {
      var typ1 = schema.get('array');
      const val = typ1.decode('a');
      assert.ok(Array.isArray(val));
      assert.deepEqual(val, ['a']);
      done();
    });

    it('should encode', function(done) {
      var typ1 = schema.get('array');
      const val = typ1.encode([1, 2, '3']);
      assert.ok(Array.isArray(val));
      assert.deepEqual(val, [1, 2, '3']);
      done();
    });

    it('should encode null value', function(done) {
      var typ1 = schema.get('array');
      const val = typ1.encode(null);
      assert.equal(val, null);
      done();
    });

    it('should extend using string def', function(done) {
      var typ1 = schema.extend('typ1', 'number[]');
      assert.equal(typ1.name, 'typ1');
      assert.equal(typ1.base, schema.get('array'));
      assert.ok(typ1.isExtendedFrom('array'));
      assert.equal(typ1.required, undefined);
      assert.equal(typ1.pattern, undefined);
      done();
    });

    it('should extend from extended type', function(done) {
      schema.define('typ1', 'number[]');
      var typ2 = schema.extend('typ2', 'typ1');
      assert.equal(typ2.name, 'typ2');
      assert.equal(typ2.base, schema.get('typ1'));
      assert.ok(typ2.isExtendedFrom('array'));
      done();
    });

    it('should extend using string def with min,max items', function(done) {
      var typ1 = schema.extend('typ1', 'integer[2-4]');
      assert.ok(typ1.isExtendedFrom('array'));
      assert.equal(typ1.required, undefined);
      assert.equal(typ1.pattern, undefined);
      assert.equal(typ1.items.base.name, 'Integer');
      assert.equal(typ1.minOccurs, 2);
      assert.equal(typ1.maxOccurs, 4);
      var t = 0;
      try {
        typ1.decode([1]);
      } catch (e) {
        t++;
      }
      assert.equal(t, 1);
      try {
        typ1.decode([1, 2, 3, 4, 5]);
      } catch (e) {
        t++;
      }
      assert.equal(t, 2);
      done();
    });

    it('should not extend using string def with min,max values', function(done) {
      try {
        schema.extend('typ1', 'array(1-10)');
      } catch (e) {
        done();
        return;
      }
      assert(0);
    });

    it('should extend using object def', function(done) {
      var typ1 = schema.extend({
        name: 'typ1',
        base: 'array',
        items: 'integer',
        required: true,
        minOccurs: 2,
        maxOccurs: 6
      });
      assert.equal(typ1.name, 'typ1');
      assert.equal(typ1.base, schema.get('array'));
      assert.equal(typ1.required, true);
      assert.equal(typ1.minOccurs, 2);
      assert.equal(typ1.maxOccurs, 6);
      done();
    });

    it('should not extend using invalid object def', function(done) {
      var t = 0;
      try {
        schema.extend({
          name: 'typ1',
          base: 'array',
          items: 'integer',
          minOccurs: 'a'
        });
      } catch (e) {
        t++;
      }
      assert.equal(t, 1);
      try {
        schema.extend({
          name: 'typ1',
          base: 'array',
          items: 'integer',
          maxOccurs: 'a'
        });
      } catch (e) {
        t++;
      }
      assert.equal(t, 2);
      done();
    });

    it('extended type should decode boolean array value', function(done) {
      var typ1 = schema.extend('typ1', 'boolean[]');
      const val = typ1.decode(['true', true, false]);
      assert.deepEqual(val, [true, true, false]);
      done();
    });

    it('extended typeshould decode number array value', function(done) {
      var typ1 = schema.extend('typ1', 'number[]');
      const val = typ1.decode(['1.5', 2, 3]);
      assert.deepEqual(val, [1.5, 2, 3]);
      done();
    });

    it('extended type should decode string value', function(done) {
      var typ1 = schema.extend('typ1', 'string[]');
      const val = typ1.decode(['1.5', 2, 3]);
      assert.deepEqual(val, ['1.5', '2', '3']);
      done();
    });

    it('extended type should encode', function(done) {
      var typ1 = schema.extend('typ1', 'string[]');
      const val = typ1.encode(['1.5', '2', '3']);
      assert.deepEqual(val, ['1.5', '2', '3']);
      done();
    });
  });

  describe('Generics', function() {
    var schema;

    beforeEach(function() {
      schema = new Schema();
    });

    it('should define a generic type', function(done) {
      schema.define('gen1<x>', {
        base: 'array',
        items: 'x'
      });
      var typ1 = schema.extend('typ1', 'gen1<string>');
      var val = typ1.decode([1, 2, 3]);
      assert.deepEqual(val, ['1', '2', '3']);
      done();
    });

    it('should extend a generic type', function(done) {
      schema.define('gen1<x, y>', {
        base: 'object',
        items: {
          a: 'x',
          b: 'y'
        }
      });
      var typ1 = schema.extend('typ1', 'gen1<number, string>');
      assert.equal(typ1.name, 'typ1');
      assert.ok(typ1.isExtendedFrom('object'));
      assert.ok(typ1.items.a.base.isExtendedFrom('number'));
      assert.ok(typ1.items.b.base.isExtendedFrom('string'));
      done();
    });

  });

});