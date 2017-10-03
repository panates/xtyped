/* eslint-disable */
const assert = require('assert');
const parseTypeDefinition = require('../lib/parsetypedef');

describe('parseTypeDefinition', function() {

  it('should validate type name', function(done) {
    try {
      parseTypeDefinition('-aaa', 'string');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should validate generic alias name', function(done) {
    try {
      parseTypeDefinition('aaa<1x>', 'string');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should check generic alias defined once', function(done) {
    try {
      parseTypeDefinition('aaa<x,x>', 'string');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should base property match TYPE_DEF_PATTERN', function(done) {
    try {
      parseTypeDefinition('aaa', {
        base: '1x'
      });
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should base property match TYPE_DEF_PATTERN', function(done) {
    try {
      parseTypeDefinition('aaa', {
        base: null
      });
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should string definition match TYPE_DEF_PATTERN', function(done) {
    try {
      parseTypeDefinition('aaa', '1x');
    } catch (e) {
      done();
      return;
    }
    assert(0);
  });

  it('should parse max value', function(done) {
    var def = parseTypeDefinition('aaa', 'number(5)');
    assert.equal(def.maxValue, 5);
    done();
  });

  it('should parse min-max value', function(done) {
    var def = parseTypeDefinition('aaa', 'number(5-8)');
    assert.equal(def.minValue, 5);
    assert.equal(def.maxValue, 8);
    done();
  });

  it('should parse max size', function(done) {
    var def = parseTypeDefinition('aaa', 'string(5)');
    assert.equal(def.maxSize, 5);
    done();
  });

  it('should parse min-max size', function(done) {
    var def = parseTypeDefinition('aaa', 'string(5-8)');
    assert.equal(def.minSize, 5);
    assert.equal(def.maxSize, 8);
    done();
  });

  it('should parse max occurs', function(done) {
    var def = parseTypeDefinition('aaa', 'array[5]');
    assert.equal(def.base, 'array');
    assert.equal(def.subType, 'any');
    assert.equal(def.minOccurs, 0);
    assert.equal(def.maxOccurs, 5);
    done();
  });

  it('should parse min-max occurs', function(done) {
    var def = parseTypeDefinition('aaa', 'string[5-8]');
    assert.equal(def.base, 'array');
    assert.equal(def.subType, 'string');
    assert.equal(def.minOccurs, 5);
    assert.equal(def.maxOccurs, 8);
    done();
  });

  it('should parse pattern', function(done) {
    var def = parseTypeDefinition('aaa', 'string' + /\w+/);
    assert.equal(def.base, 'string');
    assert.equal(def.pattern, '\\w+');
    done();
  });

  it('should parse extend arguments', function(done) {
    var def = parseTypeDefinition('aaa', 'string<string<x>, number<x>>');
    assert.equal(def.base, 'string');
    assert.deepEqual(def.extendArgs, ['string<x>', 'number<x>']);
    done();
  });

});