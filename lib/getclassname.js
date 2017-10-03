/* xtyped
 ------------------------
 (c) 2017-present Panates
 This file may be freely distributed under the MIT license.
 For details and documentation:
 https://github.com/panates/xtyped
 */

function getClassName(obj) {
  if (obj === undefined)
    return 'undefined';
  if (obj === null)
    return 'null';
  if (obj.prototype && obj.prototype.constructor &&
      obj.prototype.constructor.name)
    return obj.prototype.constructor.name;
  return Object.prototype.toString.call(obj)
      .match(/^\[object\s(.*)\]$/)[1];
}

module.exports = getClassName;