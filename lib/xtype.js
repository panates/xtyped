/* xtyped
 ------------------------
 (c) 2017-present Panates
 This file may be freely distributed under the MIT license.
 For details and documentation:
 https://github.com/panates/xtyped
 */
'use strict';

const errorex = require('errorex');
const isPlainObject = require('putil-isplainobject');
const merge = require('putil-merge');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

const parseTypeDefinition = require('./parsetypedef');

const ValidateError = errorex.ValidateError;
const ArgumentError = errorex.ArgumentError;

/**
 *
 * @param schema
 * @param name
 * @constructor
 */
function XType(schema, name) {
  this.schema = schema;
  this.name = name || 'Any';
}

// noinspection JSUnusedLocalSymbols
XType.prototype = {
  /**
   * Creates a new type based from this type
   * @param {Schema} schema
   * @param {String} name
   * @param {String|Object} typeDef
   * @param {boolean} [typeDef.required]
   * @param {RegExp} [typeDef.pattern]
   * @param {function} [typeDef.onDecode]
   * @param {function} [typeDef.onEncode]
   * @param {function} [typeDef.onValidate]
   * @return {Object}
   * @public
   */
  extend: function(schema, name, typeDef) {
    const ctor = Object.getPrototypeOf(this).constructor;
    const inst = new ctor(schema, name);
    inst.base = this;
    inst.definition = typeDef;

    // Assign attributes
    // required
    // noinspection PointlessBooleanExpressionJS
    inst.required = ((hasOwnProperty(typeDef, 'required')) ?
        !!typeDef.required : this.required);
    // pattern
    inst.pattern = (hasOwnProperty(typeDef, 'pattern')) ?
        typeDef.pattern : this.pattern;
    if (inst.pattern && !(inst.pattern instanceof RegExp))
      inst.pattern = new RegExp(inst.pattern);
    // onDecode
    inst.onDecode = (hasOwnProperty(typeDef, 'onDecode')) ?
        typeDef.onDecode : this.onDecode;
    if (inst.onDecode && typeof inst.onDecode !== 'function')
      throw new ArgumentError('Property `onDecode` must be a function');
    // onEncode
    inst.onEncode = (hasOwnProperty(typeDef, 'onEncode')) ?
        typeDef.onEncode : this.onEncode;
    if (inst.onEncode && typeof inst.onEncode !== 'function')
      throw new ArgumentError('Property `onEncode` must be a function');
    // onValidate
    inst.onValidate = (hasOwnProperty(typeDef, 'onValidate')) ?
        typeDef.onValidate : this.onValidate;
    if (inst.onValidate && typeof inst.onValidate !== 'function')
      throw new ArgumentError('Property `onValidate` must be a function');

    return inst;
  },

  isExtendedFrom: function(base) {
    var typ = this;
    base = base.toLowerCase();
    while (typ) {
      if (typ.name.toLowerCase() === base)
        return true;
      typ = typ.base;
    }
    return false;
  },

  /**
   * Decodes input JSON value to JS value
   * @param {*} value
   * @param {...*} varargs
   * @return {*}
   * @public
   */
  decode: function(value, varargs) {
    if (!isNull(value)) {
      // Call custom decode function
      if (this.onDecode && !this.onDecode._iscalling) {
        // Prevent circular calling
        this.onDecode._iscalling = 1;
        try {
          value = this.onDecode.apply(this, arguments);
        } finally {
          delete this.onDecode._iscalling;
        }
      } else {
        // Call internal decode function
        value = this._decode.apply(this, arguments);
      }
    }
    // Validate value
    this.validate.apply(this, [value].concat(Array.prototype.slice.call(arguments, 1)));
    return value;
  },

  /**
   * Encodes input JS value to JSON
   * @param {*} value
   * @param {...*} varargs
   * @return {*}
   * @public
   */
  encode: function(value, varargs) {
    // Validate value
    this.validate.apply(this, arguments);
    // Encode
    if (!isNull(value)) {
      // Call custom encode function
      if (this.onEncode && !this.onEncode._iscalling) {
        // Prevent circular calling
        this.onEncode._iscalling = 1;
        try {
          value = this.onEncode.apply(this, arguments);
        } finally {
          delete this.onEncode._iscalling;
        }
      } else {
        // Call internal encode function
        value = this._encode.apply(this, arguments);
      }
    }
    return value;
  },

  /**
   * Validates JS value
   * @param {*} value
   * @param {...*} varargs
   * @public
   */
  validate: function(value, varargs) {
    // Call custom validate function
    if (this.onValidate && !this.onValidate._iscalling) {
      // Prevent circular calling
      this.onValidate._iscalling = 1;
      try {
        try {
          this.onValidate.apply(this, arguments);
        } catch (e) {
          throw e && e.name === 'ValidateError' ? e : new ValidateError(e);
        }
      } finally {
        delete this.onValidate._iscalling;
      }
    }
    // Check required
    if (this.required && isNull(value))
      throw new ValidateError('`%s` is required', this.name);
    // Check pattern
    if (!isNull(value) && this.pattern && !String(value).match(this.pattern))
      throw new ValidateError('Validation error for `%s`. Value `%s` does not match required pattern',
          this.name, value);
    // Call internal validate function
    this._validate.apply(this, arguments);
  },

  /**
   * Decodes input JSON value to JS value
   * @param {*} value
   * @param {...*} varargs
   * @return {*}
   * @protected
   */
  _decode: function(value, varargs) {
    return value;
  },

  /**
   * Encodes input JS value to JSON
   * @param {*} value
   * @param {...*} varargs
   * @return {*}
   * @protected
   */
  _encode: function(value, varargs) {
    return value;
  },

  /**
   * Validates JS value
   * @param {*} value
   * @param {...*} varargs
   * @return {*}
   * @protected
   */
  _validate: function(value, varargs) {
    // Do nothing
  }
};
XType.prototype.constructor = XType;

/**
 *
 * @constructor
 */
function XBoolean(schema, name) {
  XType.call(this, schema, name || 'Boolean');
}

XBoolean.prototype = Object.create(XType.prototype);
XBoolean.prototype.constructor = XBoolean;

// noinspection JSUnusedLocalSymbols
XBoolean.prototype._decode = function(value, varargs) {
  return !!JSON.parse(value);
};

XBoolean.prototype._encode = function(value, varargs) {
  return this._decode.apply(this, arguments);
};

// noinspection JSUnusedLocalSymbols
XBoolean.prototype._validate = function(value, varargs) {
  if (!(isNull(value) || typeof value === 'boolean'))
    throw new ValidateError('`%s` is not a valid `%s` value', value, this.name);
};

/**
 *
 * @constructor
 */
function XNumber(schema, name) {
  XType.call(this, schema, name || 'Number');
}

XNumber.prototype = Object.create(XType.prototype);
XNumber.prototype.constructor = XNumber;

XNumber.prototype.extend = function(schema, name, typeDef) {
  // Call super function
  const inst = XType.prototype.extend.apply(this, arguments);

  // Assign attributes
  // minValue
  inst.minValue = hasOwnProperty(typeDef, 'minValue') ?
      parseFloat(typeDef.minValue) : this.minValue;
  if (!isNull(inst.minValue) && isNaN(inst.minValue))
    throw new ArgumentError('Property `minValue` can be a number only');
  // maxValue
  inst.maxValue = hasOwnProperty(typeDef, 'maxValue') ?
      parseFloat(typeDef.maxValue) : this.maxValue;
  if (!isNull(inst.maxValue) && isNaN(inst.maxValue))
    throw new ArgumentError('Property `maxValue` can be a number only');

  return inst;
};

// noinspection JSUnusedLocalSymbols
XNumber.prototype._decode = function(value, varargs) {
  return parseFloat(value);
};

XNumber.prototype._encode = function(value, varargs) {
  return this._decode.apply(this, arguments);
};

// noinspection JSUnusedLocalSymbols
XNumber.prototype._validate = function(value, varargs) {
  if (isNull(value)) return;
  // validate Type
  if (typeof value !== 'number' || isNaN(value))
    throw new ValidateError('Validation error for `%s`. `%s` is not a valid number value',
        this.name, value);
  // validate minValue
  if (!isNull(this.minValue) && value < this.minValue)
    throw new ValidateError('Validation error for `%s`. %d is lower than minimum value limit (%d)',
        this.name, value, this.minValue);
  if (!isNull(this.maxValue) && value > this.maxValue)
    throw new ValidateError('Validation error for `%s`. %d is greater than maximum value limit (%d)',
        this.name, value, this.maxValue);
};

/**
 *
 * @constructor
 */
function XInteger(schema, name) {
  XNumber.call(this, schema, name || 'Integer');
}

XInteger.prototype = Object.create(XNumber.prototype);
XInteger.prototype.constructor = XInteger;

XInteger.prototype.extend = function(schema, name, typeDef) {
  // Call super function
  const inst = XNumber.prototype.extend.apply(this, arguments);

  if (!isNull(inst.minValue))
    inst.minValue = Math.floor(inst.minValue);
  if (!isNull(inst.maxValue))
    inst.maxValue = Math.floor(inst.maxValue);
  return inst;
};

// noinspection JSUnusedLocalSymbols
XInteger.prototype._decode = function(value, varargs) {
  return parseInt(value, 10);
};

// noinspection JSUnusedLocalSymbols
XInteger.prototype._validate = function(value, varargs) {
  if (isNull(value)) return;
  XNumber.prototype._validate.apply(this, arguments);
  if (value !== parseInt(value, 10))
    throw new ValidateError('Validation error for `%s`. `%s` is not a valid integer value', this.name, value);
};

/**
 *
 * @constructor
 */
function XString(schema, name) {
  XType.call(this, schema, name || 'String');
}

XString.prototype = Object.create(XType.prototype);
XString.prototype.constructor = XString;

XString.prototype.extend = function(schema, name, typeDef) {
  // Call super function
  const inst = XType.prototype.extend.apply(this, arguments);

  // Assign attributes
  // minSize
  inst.minSize = hasOwnProperty(typeDef, 'minSize') ?
      parseFloat(typeDef.minSize) : this.minSize;
  if (!isNull(inst.minSize) && isNaN(inst.minSize))
    throw new ArgumentError('Property `minSize` can be a number only');
  // maxSize
  inst.maxSize = hasOwnProperty(typeDef, 'maxSize') ?
      parseFloat(typeDef.maxSize) : this.maxSize;
  if (!isNull(inst.maxSize) && isNaN(inst.maxSize))
    throw new ArgumentError('Property `maxSize` can be a number only');

  return inst;
};

// noinspection JSUnusedLocalSymbols
XString.prototype._decode = function(value, varargs) {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

// noinspection JSCheckFunctionSignatures
XString.prototype._encode = function(value, varargs) {
  return this._decode.apply(this, arguments);
};

// noinspection JSUnusedLocalSymbols
XString.prototype._validate = function(value, varargs) {
  if (isNull(value)) return;
  // validate Type
  if (typeof value !== 'string')
    throw new ValidateError('Validation error for `%s`. `%s` is not a valid string value',
        this.name, value);
  // validate minSize
  if (!isNull(this.minSize) && value.length < this.minSize)
    throw new ValidateError('Validation error. `%s` requires at least %d character(s)',
        this.name, this.minSize);
  if (!isNull(this.maxSize) && value.length > this.maxSize)
    throw new ValidateError('Validation error `%s`. Value exceeds character limit (%d)',
        this.name, this.maxSize);
};

/**
 *
 * @constructor
 */
function XTimestamp(schema, name) {
  XType.call(this, schema, name || 'Timestamp');
}

XTimestamp.prototype = Object.create(XType.prototype);
XTimestamp.prototype.constructor = XTimestamp;

XTimestamp.prototype.extend = function(schema, name, typeDef) {
  // Call super function
  const inst = XType.prototype.extend.apply(this, arguments);

  // Assign attributes
  // minValue
  inst.minValue = hasOwnProperty(typeDef, 'minValue') ?
      this._decode(typeDef.minValue) : this.minValue;
  if (!isNull(inst.minValue) && isNaN(inst.minValue.getTime()))
    throw new ArgumentError('Property `minValue` can be a date');
  // maxValue
  inst.maxValue = hasOwnProperty(typeDef, 'maxValue') ?
      this._decode(typeDef.maxValue) : this.maxValue;
  if (!isNull(inst.maxValue) && isNaN(inst.maxValue.getTime()))
    throw new ArgumentError('Property `maxValue `an be a date');
  // format
  inst.format = hasOwnProperty(typeDef, 'format') ?
      typeDef.format : this.format;
  if (!isNull(inst.format) && typeof inst.format !== 'string')
    throw new ArgumentError('Property `format` can be a string');

  return inst;
};

// noinspection JSUnusedLocalSymbols
XTimestamp.prototype._decode = function(value, varargs) {
  if (value instanceof Date)
    return value;
  if (typeof value === 'number')
    return new Date(value);
  if (typeof value === 'string') {
    const format = this.format || this._defaultFormat;
    return (format ? moment.parseZone(value, format) : moment.parseZone(value)).toDate();
  }
  return value;
};

XTimestamp.prototype._encode = function(value, varargs) {
  value = this._decode.apply(this, arguments);
  const format = this.format || this._defaultFormat;
  return format ? moment.utc(value).format(format) : value.toISOString();
};

XTimestamp.prototype._validate = function(value) {
  if (isNull(value)) return;

  if (!(value instanceof Date) || isNaN(value.getTime()))
    throw new ValidateError('Validation error for `%s`. `%s` is not a valid date value',
        this.name, value);

  // validate minValue
  if (!isNull(this.minValue) && value < this.minValue)
    throw new ValidateError('Validation error for `%s`. `%s` is earlier than minimum date limit (%s)',
        this.name, this._encode(value), this._encode(this.minValue));
  if (!isNull(this.maxValue) && value > this.maxValue)
    throw new ValidateError('Validation error for `%s`. `%s` is later than maximum date limit (%s)',
        this.name, this._encode(value), this._encode(this.maxValue));
};

/**
 *
 * @constructor
 */
function XDate(schema, name) {
  XTimestamp.call(this, schema, name || 'Date');
  this._defaultFormat = 'YYYY-MM-DD';
}

XDate.prototype = Object.create(XTimestamp.prototype);
XDate.prototype.constructor = XDate;

XDate.prototype._decode = function(value, varargs) {
  value = XTimestamp.prototype._decode.apply(this, arguments);
  if (!isNaN(value.getTime()))
    value.setUTCHours(0, 0, 0, 0);
  return value;
};

/**
 *
 * @constructor
 */
function XTime(schema, name) {
  XTimestamp.call(this, schema, name || 'Time');
  this._defaultFormat = 'HH:mm:ss';
}

XTime.prototype = Object.create(XTimestamp.prototype);
XTime.prototype.constructor = XTime;

XTime.prototype._decode = function(value, varargs) {
  value = XTimestamp.prototype._decode.apply(this, arguments);
  if (!isNaN(value.getTime()))
    value.setUTCFullYear(1900, 0, 1);
  return value;
};

/**
 *
 * @constructor
 */
function XArray(schema, name) {
  XType.call(this, schema, name || 'Array');
}

XArray.prototype = Object.create(XType.prototype);
XArray.prototype.constructor = XArray;

XArray.prototype.extend = function(schema, name, typeDef) {
  // Call super function
  const inst = XType.prototype.extend.apply(this, arguments);

  // Assign attributes
  // minOccurs
  inst.minOccurs = hasOwnProperty(typeDef, 'minOccurs') ?
      typeDef.minOccurs : this.minOccurs;
  if (inst.minOccurs && typeof inst.minOccurs !== 'number')
    throw new ArgumentError('Property `minOccurs` can be a number only');
  // maxOccurs
  inst.maxOccurs = hasOwnProperty(typeDef, 'maxOccurs') ?
      typeDef.maxOccurs : this.maxOccurs;
  if (inst.maxOccurs && typeof inst.maxOccurs !== 'number')
    throw new ArgumentError('Property `maxOccurs` can be a number only');

  // Set default subType as self subType
  inst.subType = this.subType || anyType;

  // Change subType if defined in typeDef
  var t = (typeDef && typeDef.subType);
  if (t) {
    if (typeDef.genericAliases !== undefined)
      inst.genericAliases = typeDef.genericAliases;
    if (t instanceof XType)
      inst.subType = t;
    else {
      var def = parseTypeDefinition((inst.name || '') + 'Item', t);
      t = def.base === 'array' ? def.subType : def.base;
      var gen;
      if (typeDef.genericAliases) {
        gen = typeDef.genericAliases[t];
        if (gen)
          t = gen.base;
      } else if (this.genericAliases) {
        gen = this.genericAliases[t];
        if (gen) {
          if (typeDef.extendArgs)
            t = typeDef.extendArgs[gen.index] || t;
          else t = gen.base;
        }
      }
      if (def.base === 'array')
        def.subType = t;
      else def.base = t;

      inst.subType = schema.extend(def);
    }
  }
  return inst;
};

XArray.prototype._decode = function(value, varargs) {
  value = Array.isArray(value) ? value : [value];
  const subType = this.subType || anyType;
  const args = Array.prototype.slice.call(arguments, 1);
  value.forEach(function(v, idx) {
    value[idx] = subType.decode.apply(subType, [v].concat(args));
  });
  return value;
};

XArray.prototype._encode = function(value, varargs) {
  const subType = this.subType || anyType;
  const args = Array.prototype.slice.call(arguments, 1);
  value.forEach(function(v, idx) {
    value[idx] = subType.encode.apply(subType, [v].concat(args));
  });
  return value;
};

// noinspection JSUnusedLocalSymbols
XArray.prototype._validate = function(value, varargs) {
  if (isNull(value)) return;
  // minOccurs
  if (!isNull(this.minOccurs) && value.length < this.minOccurs)
    throw new ValidateError('Validation error. `%s` requires at least %d item(s)',
        this.name, this.minOccurs);
  // maxOccurs
  if (!isNull(this.maxOccurs) && value.length > this.maxOccurs)
    throw new ValidateError('Validation error `%s`. Value exceeds item limit (%d)',
        this.name, this.maxSize);
};

/**
 *
 * @constructor
 */
function XObject(schema, name) {
  XType.call(this, schema, name || 'Object');
  this.items = {};
}

XObject.prototype = Object.create(XType.prototype);
XObject.prototype.constructor = XObject;

XObject.prototype.extend = function(schema, name, typeDef) {
  // Call super function
  const inst = XType.prototype.extend.apply(this, arguments);

  const self = this;
  if (typeDef.genericAliases !== undefined)
    inst.genericAliases = typeDef.genericAliases;

  // Copy self items into new instance items
  Object.assign(inst.items, self.items);

  const getGenericType = function(name, value, genericAliases, extendArgs) {
    var def = parseTypeDefinition(name, value);
    var t = def.base === 'array' ? def.subType : def.base;
    const gen = genericAliases && genericAliases[t];
    if (!gen)
      return;
    // merge gen to def
    merge({
      deep: true,
      filter: function(k, v) {
        return !(v === undefined);
      }
    }, def, gen);

    t = def.base === 'array' ? def.subType : def.base;
    if (extendArgs)
      t = extendArgs[gen.index] || t;

    if (def.base === 'array')
      def.subType = t; else def.base = t;

    return def;
  };

  // Recreate generic aliased properties for given args in <arg,arg>
  const itemsDef = self.definition && self.definition.items;
  if (itemsDef && self.genericAliases) {
    Object.getOwnPropertyNames(itemsDef).forEach(function(key) {
      // Skip if re defined in typeDef
      if (typeDef && typeDef.items && typeDef.items[key])
        return;
      const def = getGenericType(key, itemsDef[key],
          self.genericAliases, typeDef && typeDef.extendArgs);
      if (def)
        inst.items[key] = schema.extend(key, def);
    });
  }

  if (typeDef && typeDef.items) {
    Object.getOwnPropertyNames(typeDef.items).forEach(function(key) {
      const v = typeDef.items[key];
      if (!v)
        return delete inst.items[key];
      const def = getGenericType(key, v, inst.genericAliases) || v;
      inst.items[key] = schema.extend(key, def);
    });
  }
  return inst;
};

XObject.prototype._decode = function(value) {
  const keys = Object.getOwnPropertyNames(this.items);
  if (!keys.length)
    return value;
  const self = this;
  const result = {};
  const args = Array.prototype.slice.call(arguments, 1);
  keys.forEach(function(n) {
    const item = self.items[n];
    const v = item.decode.apply(item, [value[n]].concat(args));
    if (v !== undefined)
      result[n] = v;
  });
  return result;
};

XObject.prototype._encode = function(value) {
  const self = this;
  const keys = Object.getOwnPropertyNames(self.items);
  const args = Array.prototype.slice.call(arguments, 1);
  if (!keys.length) {
    Object.getOwnPropertyNames(value).forEach(function(n) {
      const v = value[n];
      if (v instanceof Date)
        value[n] = timestampType.encode.apply(timestampType, [v].concat(args));
      else if (isPlainObject(v))
        value[n] = objectType.encode.apply(objectType, [v].concat(args));
    });
    return value;
  }
  const result = {};
  keys.forEach(function(n) {
    const item = self.items[n];
    const v = item.encode.apply(item, [value[n]].concat(args));
    if (v !== undefined)
      result[n] = v;
  });
  return result;
};

// noinspection JSUnusedLocalSymbols
XObject.prototype._validate = function(value, varargs) {
  if (isNull(value)) return;
  // Validate type
  if (typeof value !== 'object' || Array.isArray(value))
    throw new ValidateError('Validation error for `%s`. `%s` is not a valid object value',
        this.name, value);
};

/**
 * module variables
 */
const timestampType = new XTimestamp();
const objectType = new XObject();
const anyType = new XType();

function isNull(value) {
  return value === undefined || value === null;
}

function hasOwnProperty(obj, property) {
  return typeof obj === 'object' && obj.hasOwnProperty(property);
}

/**
 * expose module
 */
module.exports = {
  XType: XType,
  XArray: XArray,
  XBoolean: XBoolean,
  XTimestamp: XTimestamp,
  XDate: XDate,
  XTime: XTime,
  XInteger: XInteger,
  XNumber: XNumber,
  XObject: XObject,
  XString: XString
};
