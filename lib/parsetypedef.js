/*
 * Copyright (c) 2017 - present, Panates Bilisim Ltd.
 */

const merge = require('putil-merge');
const errorex = require('errorex');

const ArgumentError = errorex.ArgumentError;

const TYPE_DEF_PATTERN = /^(!)?(?:([A-Za-z]\w*)\.)?([A-Za-z]\w*(?:<\w.+>)?)(?:\((?:(\d+)(?:-(\d+))?)?\))?(\[(?:(\d+)(?:-(\d+))?)?])?(\/[^/]*\/)?$/;
const TYPE_NAME_PATTERN = /^([A-Za-z]\w*)(?:<((?:\w+(?::\w+)?,? *)+)>)?$/;

/**
 * Parse string definition or parses obj.base property and merges properties to object
 *
 * @param {String} [name] Name of type
 * @param {String|Object} typeDef
 * @private
 * @return {Object}
 */
function parseTypeDefinition(name, typeDef) {
  if (!typeDef) {
    typeDef = name;
    name = null;
  }
  var opts = {};

  name = name || ((typeof typeDef === 'object') ? typeDef.name : '');
  // Validate and split name into name,generic args
  if (name) {
    const mName = name.match(TYPE_NAME_PATTERN);
    if (!mName)
      throw new ArgumentError('Invalid "name" parameter in type definition');
    opts.name = mName[1];
    // Has generic arguments defined in name?
    if (mName[2]) {
      opts.genericAliases = {};
      const a = mName[2].split(/\s*,\s*/);
      const names = {};
      a.forEach(function(s, idx) {
        const mm = s.match(/^([A-Za-z]\w*):?(\w*)/);
        if (!mm)
          throw new ArgumentError('Invalid generic alias name "%s"', name);
        if (names[mm[1]])
          throw new ArgumentError('Generic alias "%s" defined more than one time for type "%s"', mm[1], name);
        names[mm[1]] = !0;
        (opts.genericAliases[mm[1]] =
            parseTypeDefinition((mm[2] || 'any'))).index = idx;
      });
    }
  }

  var m;
  if (typeof typeDef === 'object') {
    m = typeDef.base ? typeDef.base.match(TYPE_DEF_PATTERN) : null;
    if (!m)
      throw new ArgumentError('"base" parameter is not valid');
  } else if (typeof typeDef === 'string') {
    m = typeDef.match(TYPE_DEF_PATTERN);
    if (!m)
      throw new ArgumentError('Type definition is not valid');
  } else
    throw new ArgumentError('Invalid typeDef argument');

  // Is required
  if (m[1])
    opts.required = true;
  if (m[2])
    opts.schema = m[2].substring(0, m[2].length);

  opts.base = m[3];

  // Has size limit or min, max values?
  if (m[4] !== undefined) {
    const base = opts.base.toLowerCase();

    if (base.match(/^(integer|long|number|double|date|timestamp|time)$/)) {
      if (m[5] !== undefined) {
        opts.minValue = m[4];
        opts.maxValue = m[5];
      } else {
        opts.minValue = undefined;
        opts.maxValue = m[4];
      }
    } else if (base === 'string') {
      if (m[5] !== undefined) {
        opts.minSize = parseInt(m[4]);
        opts.maxSize = parseInt(m[5]);
      } else {
        opts.minSize = 0;
        opts.maxSize = parseInt(m[4]);
      }
    } else
      throw new ArgumentError('Type definition is not valid. ' +
          'Min-Max values is not available for this base type');
  }

  // Is array?
  if (m[6]) {
    opts.subType = opts.base === 'array' ? 'any' : opts.base;
    opts.base = 'array';
    if (m[8] !== undefined) {
      opts.minOccurs = parseInt(m[7]);
      opts.maxOccurs = parseInt(m[8]);
    } else if (m[7] !== undefined) {
      opts.minOccurs = 0;
      opts.maxOccurs = parseInt(m[7]);
    } else {
      opts.minOccurs = 0;
      opts.maxOccurs = undefined;
    }
  }

  // Regex pattern
  if (m[9])
    opts.pattern = m[9].substring(1, m[9].length - 1);

  // Extending arguments
  var i = opts.base.indexOf('<');
  if (i >= 0) {
    const ex = opts.base.substr(i);
    opts.base = opts.base.substr(0, i);
    const extendArgs = [];
    var k = 0;
    var s = '';
    i = 0;
    while (++i < ex.length - 1) {
      const c = ex.charAt(i);
      if (c === ',' && !k) {
        if (s)
          extendArgs.push(s);
        s = '';
      } else {
        s += c.trim();
        if (c === '<') {
          k++;
        } else if (c === '>') {
          if (!--k)
            extendArgs.push(s);
          s = '';
        }
      }
    }
    if (s && !k)
      extendArgs.push(s);

    opts.extendArgs = extendArgs;
  }

  if (typeof typeDef === 'object')
    return merge({
      deep: true,
      filter: function(k, v) {
        return !(v === undefined);
      }
    }, typeDef, opts);

  return opts;
}

module.exports = parseTypeDefinition;