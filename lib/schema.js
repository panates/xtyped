/* xtyped
 ------------------------
 (c) 2017-present Panates
 This file may be freely distributed under the MIT license.
 For details and documentation:
 https://github.com/panates/xtyped
 */
'use strict';

const util = require('util');
const errorex = require('errorex');
const xtype = require('./xtype');
const parseTypeDefinition = require('./parsetypedef');
const merge = require('putil-merge');

const URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/;
const NS_PATTERN = /^[A-Za-z]\w*$/;
const ArgumentError = errorex.ArgumentError;

const builtinTypes = {
  any: new xtype.XType(),
  array: new xtype.XArray(),
  boolean: new xtype.XBoolean(),
  timestamp: new xtype.XTimestamp(),
  date: new xtype.XDate(),
  time: new xtype.XTime(),
  double: new xtype.XNumber(),
  integer: new xtype.XInteger(),
  int: new xtype.XInteger(),
  long: new xtype.XInteger(),
  number: new xtype.XNumber(),
  object: new xtype.XObject(),
  string: new xtype.XString()
};

/**
 * @constructor
 * @public
 */
function Schema() {
  this._items = {};
  this._links = {};
}

Schema.prototype = {

  get uri() {
    return this._uri;
  },

  set uri(uri) {
    if (!(uri && typeof uri === 'string' && uri.match(URL_PATTERN)))
      throw new ArgumentError('Url is invalid');
    this._uri = uri;
  },

  /**
   * Assigns types from source schema
   * @param {Schema} src Source schema
   * @public
   */
  assign: function(src) {
    const self = this;
    this._items = {};
    this._links = Object.assign({}, src._links);
    Object.getOwnPropertyNames(src._items).forEach(function(key) {
      const srcItem = src._items[key];
      const proto = Object.getPrototypeOf(srcItem);
      const item = Object.create(proto);
      merge.descriptor(item, srcItem);
      item.schema = self;
      self._items[key] = item;
    });
  },

  /**
   * Adds new type to schema
   * @param {String} name Name schema item
   * @param {String|Object} typeDef string representation or object definition
   * @return {Schema}
   * @public
   */
  define: function(name, typeDef) {
    const NewType = this.extend(name, typeDef);
    return this._items[NewType.name.toLowerCase()] = NewType;
  },

  /**
   * Adds new type to schema
   * @param {Object} typeDefs
   * @public
   */
  defineAll: function(typeDefs) {
    const self = this;
    Object.getOwnPropertyNames(typeDefs).forEach(function(n) {
      self.define(n, typeDefs[n]);
    });
  },

  /**
   * Creates new type extending from given base type, but doesn't adds to schema
   * @param {String|Object} name Name schema item
   * @param {String|Object} typeDef string representation or object definition
   * @return {Schema}
   * @public
   */
  extend: function(name, typeDef) {
    typeDef = parseTypeDefinition(name, typeDef);
    const superType = this.get(typeDef.schema, typeDef.base);
    return superType.extend(this, typeDef.name, typeDef);
  },

  /**
   * Returns the schema item
   *
   * @param {String} [ns] - Namespace of schema
   * @param {string} typeName - Name of the type item
   * @return {XType}
   * @public
   */
  get: function(ns, typeName) {
    var self = this;
    var item;
    if (!typeName) {
      typeName = ns;
      if (typeName.includes('.')) {
        const a = typeName.split(/\./);
        ns = a[0];
        typeName = a[1];
      } else
        ns = null;
    }

    if (ns) {
      const schema = self._links[ns.toLowerCase()];
      if (!schema)
        throw new ArgumentError(util.format('Schema not found for ns "%s"', ns));
      return schema.get(typeName);
    } else {
      // Lookup for self
      var tn = typeName.toLowerCase();
      item = self._items[tn];
      if (item)
        return item;

      // Lookup for linked schemas
      const keys = Object.getOwnPropertyNames(self._links);
      for (var i in keys) {
        const schema = self._links[keys[i]];
        item = schema._items[tn];
        if (item)
          return item;
      }

      // lookup for build in data types
      item = builtinTypes[tn];
      if (item)
        return item;
    }

    throw new ArgumentError('Type "%s" not found', typeName);
  },

  /**
   * Links an other schema with this one
   *
   * @param {String} ns - Namespace for schema
   * @param {Schema} schema - Schema to be linked
   * @public
   */
  link: function(ns, schema) {
    if (!(ns && typeof ns === 'string' && ns.match(NS_PATTERN)))
      throw new ArgumentError('Parameter "ns" is invalid');
    this._links[ns.toLowerCase()] = schema;
  }

};

module.exports = Schema;
