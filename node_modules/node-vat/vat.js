"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.VAT = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {
      /* This Source Code Form is subject to the terms of the Mozilla Public
       * License, v. 2.0. If a copy of the MPL was not distributed with this
       * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

      /*global require, module*/

      'use strict'; //jshint ignore:line

      var _ = require('../utils');

      function toValidationError(value) {
        var err = new TypeError('validation error');
        err.value = value;
        return err;
      }

      module.exports = {
        _allowed: [],
        _renameTo: null,
        _transforms: [],
        _valid: [],
        _validators: [],

        _duplicate: function _duplicate(arrayName) {
          var duplicate = Object.create(this);

          // To help performance, take a copy-on-write approach
          // to copying over arrays. Only copy the array that is specified
          // as an input parameter.
          if (arrayName) {
            duplicate[arrayName] = [].concat(this[arrayName]);
          }

          return duplicate;
        },


        /**
         * Explicitly allow a value, before any conversion.
         * Accepts one or more arguments.
         *
         * @method allow
         * @param {variant} vals
         */
        allow: function allow() /*...vals*/{
          var duplicate = this._duplicate('_allowed');
          [].push.apply(duplicate._allowed, arguments);
          return duplicate;
        },


        /**
         * Create a clone of the current schema that can be extended.
         *
         * @method clone
         */
        clone: function clone() {
          return this._duplicate();
        },


        /**
         * Mix functions into the current schema.
         * __MODIFIES THE CURRENT SCHEMA__
         *
         * @method extendCurrent
         * @param {object} src - Object with additional functions.
         */
        extend: function extend(src) {
          _.extend(this, src);
          return this;
        },


        /**
         * Mark the field as optional. All fields are optional by default.
         *
         * @method optional
         */
        optional: function optional() {
          return this;
        },


        /**
         * Export the result as `name` in the results. If `name` is specified,
         * acts as a setter. If `name` is not specified, acts as a getter.
         *
         * @method renameTo
         * @param {string} [name] - if not specified, acts as a getter.
         * @returns {Schema} if acting as a setter, or
         *          {string} export name, only returned if acting as a getter.
         */
        renameTo: function renameTo(name) {
          if (arguments.length === 0) {
            return this._renameTo;
          }

          // no need to pass in an array name, none are being updated.
          var duplicate = this._duplicate();
          duplicate._renameTo = name;
          return duplicate;
        },


        /**
         * Mark the field as required
         *
         * @method required
         */
        required: function required() {
          var duplicate = this._duplicate();
          duplicate._isRequired = true;
          return duplicate;
        },


        /**
         * Remove current transforms
         *
         * @method strict
         */
        strict: function strict() {
          // no need to pass in `_transforms` since it'll be overwritten anyways
          var duplicate = this._duplicate();
          duplicate._transforms = [];
          return duplicate;
        },


        /**
         * Add a validation test function. Function will
         * be called with value being validated.
         *
         * @method test
         * @param {function} validator
         */
        test: function test(validator) {
          var duplicate = this._duplicate('_validators');
          duplicate._validators.push(validator);
          return duplicate;
        },


        /**
         * Add a transformer. A transformer is a function that accepts
         * a value and returns another value. Validation will occur
         * with the transformed value.
         *
         * @method transform
         * @param {function} transformer
         */
        transform: function transform(transformer) {
          var duplicate = this._duplicate('_transforms');
          duplicate._transforms.push(transformer);
          return duplicate;
        },


        /**
         * Create an exclusive allowed list of values.
         * Accepts one or more arguments.
         *
         * @method valid
         * @param {variant} ...vals
         */
        valid: function valid() /*...vals*/{
          var duplicate = this._duplicate('_valid');
          [].push.apply(duplicate._valid, arguments);
          return duplicate;
        },


        /**
         * Validate a value
         *
         * @method validate
         * @param {variant} val
         * @returns {object} result
         * @returns {Error} [result.error] - Present if any validation errors occur.
         * @returns {variant} result.value - The transformed value. Present if
         * validation succeeds. Same as `val` if no transformation is made.
         */
        validate: function validate(val) {
          var origValue = val;

          // Perform any transformations.
          val = this._transforms.reduce(function (val, transform) {
            return transform(val);
          }, val);

          // Check the exclusive allowed list first. If an exclusive allowed list
          // is defined and the value is not a member of list, throw
          // a validation error.
          if (this._valid.length) {
            if (_.contains(this._valid, val)) {
              return { value: val };
            } else if (!_.isUndefined(val)) {
              return { error: toValidationError(origValue) };
            }
          }

          // Check against the allowed list. If the value is not a member
          // of the allowed list, continue.
          if (_.contains(this._allowed, val)) {
            return { value: val };
          }

          // If an undefined value and field is optional, no
          // further validation is done.
          if (_.isUndefined(val)) {
            if (this._isRequired) {
              return { error: new ReferenceError('missing value') };
            } else {
              // If an undefined value and field is optional, no
              // further validation is done.
              return { value: val };
            }
          }

          // Finally, perform the validations.
          try {
            this._validators.forEach(function (validator) {
              if (!validator(val)) {
                throw toValidationError(origValue);
              }
            });
          } catch (e) {
            return { error: e };
          }

          return { value: val };
        }
      };
    }, { "../utils": 5 }], 2: [function (require, module, exports) {
      /* This Source Code Form is subject to the terms of the Mozilla Public
       * License, v. 2.0. If a copy of the MPL was not distributed with this
       * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

      /*global require, module*/

      'use strict'; //jshint ignore:line

      module.exports = function (vat) {
        var _ = vat.utils;
        return vat.any().transform(function (val) {
          if (val === 'true') {
            return true;
          }if (val === 'false') {
            return false;
          }

          return val;
        }).test(function (val) {
          return _.isBoolean(val) || _.isUndefined(val);
        });
      };
    }, {}], 3: [function (require, module, exports) {
      /* This Source Code Form is subject to the terms of the Mozilla Public
       * License, v. 2.0. If a copy of the MPL was not distributed with this
       * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

      /*global require, module*/

      'use strict'; //jshint ignore:line

      function toRangeError(value) {
        var err = new RangeError('invalid value');
        err.value = value;
        return err;
      }

      var number = {
        /**
         * Specifies the maximum acceptable value
         *
         * @method max
         * @param {number} limit
         */
        max: function max(limit) {
          return this.test(function (val) {
            if (val > limit) {
              throw toRangeError(val);
            }
            return true;
          });
        },


        /**
         * Specifies the minimum acceptable value
         *
         * @method min
         * @param {number} limit
         */
        min: function min(limit) {
          return this.test(function (val) {
            if (val < limit) {
              throw toRangeError(val);
            }
            return true;
          });
        }
      };

      module.exports = function (vat) {
        var _ = vat.utils;
        return vat.any().clone().extend(number).transform(function (val) {
          if (!_.isNumber(val)) {
            if (/^[+-]?\d+$/.test(val)) {
              return parseInt(val, 10);
            } else if (/^[+-]?\d*\.\d*$/.test(val)) {
              return parseFloat(val);
            } else if (/^[+-]?Infinity$/.test(val)) {
              if (val[0] === '-') {
                return -Infinity;
              }

              return Infinity;
            }
          }

          return val;
        }).test(function (val) {
          return _.isNumber(val) || _.isUndefined(val);
        });
      };
    }, {}], 4: [function (require, module, exports) {
      /* This Source Code Form is subject to the terms of the Mozilla Public
       * License, v. 2.0. If a copy of the MPL was not distributed with this
       * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

      /*global require, module*/

      'use strict'; //jshint ignore:line

      module.exports = function (vat) {

        var string = {
          /**
           * Specifies the exact string length required
           *
           * @method len
           * @param {number} limit
           */
          len: function len(limit) {
            return this.test(function (val) {
              return val.length === limit;
            });
          },


          /**
           * Specifies the maximum number of characters allowed (inclusive)
           *
           * @method max
           * @param {number} limit
           */
          max: function max(limit) {
            return this.test(function (val) {
              return val.length <= limit;
            });
          },


          /**
           * Specifies the minimum number of characters allowed (inclusive)
           *
           * @method min
           * @param {number} limit
           */
          min: function min(limit) {
            return this.test(function (val) {
              return val.length >= limit;
            });
          },


          /**
           * Override test to accept regular expressions
           *
           * @method test
           * @param {function|regexp} validator
           */
          test: function test(validator) {
            if (validator instanceof RegExp) {
              var regExp = validator;
              validator = function validator(val) {
                return regExp.test(val);
              };
            }
            return vat.any().test.call(this, validator);
          }
        };

        var _ = vat.utils;
        return vat.any().clone().extend(string).transform(function (val) {
          // trim strings by default
          if (_.isString(val)) {
            return val.trim();
          }

          return val;
        }).test(function (val) {
          return _.isString(val) || _.isUndefined(val);
        });
      };
    }, {}], 5: [function (require, module, exports) {
      /* This Source Code Form is subject to the terms of the Mozilla Public
       * License, v. 2.0. If a copy of the MPL was not distributed with this
       * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

      /*global module */

      'use strict'; //jshint ignore:line

      module.exports = {
        contains: function contains(array, item) {
          return array.indexOf(item) !== -1;
        },
        extend: function extend(target /*, ...src*/) {
          var sources = [].slice.call(arguments, 1);
          sources.forEach(function (source) {
            for (var key in source) {
              target[key] = source[key];
            }
          });
          return target;
        },
        isBoolean: function isBoolean(val) {
          return Object.prototype.toString.call(val) === '[object Boolean]';
        },
        isFunction: function isFunction(val) {
          return typeof val === 'function';
        },
        isNumber: function isNumber(val) {
          return Object.prototype.toString.call(val) === '[object Number]';
        },
        isString: function isString(val) {
          return Object.prototype.toString.call(val) === '[object String]';
        },
        isUndefined: function isUndefined(val) {
          return typeof val === 'undefined';
        },
        union: function union() /*...arrays*/{
          var arrays = [].slice.call(arguments, 0);

          var union = [];
          arrays.forEach(function (array) {
            array.forEach(function (item) {
              if (!module.exports.contains(union, item)) {
                union.push(item);
              }
            });
          });

          return union;
        }
      };
    }, {}], 6: [function (require, module, exports) {
      /* This Source Code Form is subject to the terms of the Mozilla Public
       * License, v. 2.0. If a copy of the MPL was not distributed with this
       * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

      /*global require, module*/

      'use strict'; //jshint ignore:line

      var _ = require('./utils');

      /**
       * Validate data against a schema
       *
       * @param {variant} data - data to validate
       * @param {Schema} schema - schema to use to validate
       * @param {Object} [options] - options
       *   @param {Boolean} [options.allowUnknown] - when true, allows object to contain unknown keys. Defaults to false.
       * @returns {object} result
       *   @returns {Error} result.error - any error thrown
       *   @returns {variant} result.value - transformed data
       */
      function validate(data, schema, options) {
        options = options || {};

        var error = null;
        var value = data;

        try {
          if (_.isUndefined(schema)) {
            var missingSchemaError = new ReferenceError('missing schema');
            missingSchemaError.value = data;
            throw missingSchemaError;
          }

          if (_.isFunction(schema.validate)) {
            return schema.validate(data);
          } else {
            // union ensures all data fields have a corresponding schema
            // and all schemas are validated against.
            var allKeys = _.union(Object.keys(data), Object.keys(schema));
            value = {};
            allKeys.forEach(function (key) {
              if (schema[key]) {
                var result = validate(data[key], schema[key], options);
                if (result.error) {
                  result.error.key = key;
                  throw result.error;
                }

                var targetKey = schema[key].renameTo() || key;
                // only add undefined values iff the value is required
                if (!_.isUndefined(result.value) || schema[key]._isRequired) {
                  value[targetKey] = result.value;
                }
              } else if (options.allowUnknown) {
                value[key] = data[key];
              } else {
                var _error = new ReferenceError("'" + key + "' is not allowed");
                _error.key = key;
                throw _error;
              }
            });
          }
        } catch (e) {
          error = e;
        }

        return {
          error: error,
          value: value
        };
      }

      module.exports = {
        register: register,
        unregister: unregister,
        utils: _,
        validate: validate
      };

      var reserved = Object.keys(module.exports);
      var types = {};

      /**
       * Register a type to be validated against a schema
       *
       * @param {string} typeName - name of type
       * @param {Schema} schema - schema used to validate
       */
      function register(typeName, schema) {
        if (_.contains(reserved, typeName)) {
          throw new Error("'" + typeName + "' is reserved");
        }

        if (types[typeName]) {
          throw new Error("'" + typeName + "' is already registered");
        }

        module.exports[typeName] = types[typeName] = function () {
          return schema;
        };
      }

      /**
       * Unregister a type
       *
       * @param {string} typeName - name of type
       */
      function unregister(typeName) {
        if (_.contains(reserved, typeName)) {
          throw new Error("'" + typeName + "' is reserved");
        }

        if (!types[typeName]) {
          throw new Error("'" + typeName + "' is already not registered");
        }

        delete module.exports[typeName];
        delete types[typeName];
      }

      register('any', require('./types/any'));
      register('boolean', require('./types/boolean')(module.exports));
      register('number', require('./types/number')(module.exports));
      register('string', require('./types/string')(module.exports));
    }, { "./types/any": 1, "./types/boolean": 2, "./types/number": 3, "./types/string": 4, "./utils": 5 }] }, {}, [6])(6);
});
//# sourceMappingURL=vat.js.map
