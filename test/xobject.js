/* eslint-disable */
const assert = require('assert');
const Schema = require('../lib/schema');

describe('XObject', function() {

  describe('General', function() {

    var schema;

    beforeEach(function() {
      schema = new Schema();
    });

    it('should exist as default', function(done) {
      var typ1 = schema.get('object');
      assert.equal(typ1.name, 'Object');
      done();
    });

    it('should decode object value', function(done) {
      var typ1 = schema.get('object');
      const val = typ1.decode({a: 1, b: 'b'});
      assert.deepEqual(val, {a: 1, b: 'b'});
      done();
    });

    it('should not decode array value', function(done) {
      var typ1 = schema.get('object');
      try {
        typ1.decode([1, 2, '3']);
      } catch (e) {
        done();
        return;
      }
      assert(0);
    });

    it('should not decode boolean value', function(done) {
      var typ1 = schema.get('object');
      try {
        typ1.decode(true);
      } catch (e) {
        done();
        return;
      }
      assert(0);
    });

    it('should decode not number value', function(done) {
      var typ1 = schema.get('object');
      try {
        typ1.decode(123);
      } catch (e) {
        done();
        return;
      }
      assert(0);
    });

    it('should decode not string value', function(done) {
      var typ1 = schema.get('object');
      try {
        typ1.decode('abc');
      } catch (e) {
        done();
        return;
      }
      assert(0);
    });

    it('should encode', function(done) {
      var typ1 = schema.get('object');
      const val = typ1.encode({a: 1, b: 'b'});
      assert.deepEqual(val, {a: 1, b: 'b'});
      done();
    });

    it('should encode null value', function(done) {
      var typ1 = schema.get('object');
      const val = typ1.encode(null);
      assert.equal(val, null);
      done();
    });

    it('should extend using string def', function(done) {
      var typ1 = schema.extend('typ1', 'object');
      assert.equal(typ1.name, 'typ1');
      assert.equal(typ1.base, schema.get('object'));
      assert.ok(typ1.isExtendedFrom('object'));
      assert.equal(typ1.required, undefined);
      done();
    });

    it('should extend from defined type', function(done) {
      schema.define('typ1', 'object');
      var typ2 = schema.extend('typ2', 'typ1');
      assert.equal(typ2.name, 'typ2');
      assert.equal(typ2.base, schema.get('typ1'));
      assert.ok(typ2.isExtendedFrom('object'));
      done();
    });

    it('should extend from defined type, remove item', function(done) {
      schema.define({
        name: 'typ1',
        base: 'object',
        items: {
          a: 'number',
          b: 'string'
        }
      });
      var typ2 = schema.extend('typ2', {
        base: 'typ1',
        items: {
          a: 'number',
          b: undefined
        }
      });
      assert.equal(typ2.name, 'typ2');
      assert.equal(typ2.base, schema.get('typ1'));
      assert.ok(typ2.isExtendedFrom('object'));
      assert.ok(!typ2.items.hasOwnProperty('b'));
      done();
    });

    it('should not extend using string def with min,max values', function(done) {
      try {
        schema.extend('typ1', 'object(1-10)');
      } catch (e) {
        done();
        return;
      }
      assert(0);
    });

    it('should extend using object def', function(done) {
      var typ1 = schema.extend({
        name: 'typ1',
        base: 'object',
        items: {
          a: 'number',
          b: 'string'
        }
      });
      assert.equal(typ1.name, 'typ1');
      assert.equal(typ1.base, schema.get('object'));
      assert.equal(typ1.items.a.base, schema.get('number'));
      assert.equal(typ1.items.b.base, schema.get('string'));
      done();
    });

    it('should extend type decode', function(done) {
      var typ1 = schema.extend({
        name: 'typ1',
        base: 'object',
        items: {
          a: 'number',
          b: 'string'
        }
      });
      const val = typ1.decode({a: '1', b: undefined});
      assert.deepEqual(val, {a: 1});
      done();
    });

    it('should extend type encode simple object', function(done) {
      var typ1 = schema.extend({
        name: 'typ1',
        base: 'object'
      });
      const val = typ1.encode({a: new Date(1), b: {a: 1}});
      assert.deepEqual(val, {a: '1970-01-01T00:00:00.001Z', b: {a: 1}});
      done();
    });

    it('should extend type encode non simple object', function(done) {
      var typ1 = schema.extend({
        name: 'typ1',
        base: 'object',
        items: {
          a: 'number',
          b: 'string'
        }
      });
      const val = typ1.encode({a: 1, b: undefined});
      assert.deepEqual(val, {a: 1});
      done();
    });

  });

  describe('Generics', function() {

    var schema;

    beforeEach(function() {
      schema = new Schema();
    });

    it('should define a generic type', function(done) {
      var typ1 = schema.define('typ1<x:number, y:string>', {
        base: 'object',
        items: {
          a: 'x',
          b: 'y'
        }
      });
      assert.equal(typ1.name, 'typ1');
      assert.ok(typ1.isExtendedFrom('object'));
      assert.ok(typ1.items.a.base.isExtendedFrom('number'));
      assert.ok(typ1.items.b.base.isExtendedFrom('string'));
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