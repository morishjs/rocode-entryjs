/*
 *
 */
'use strict';

RoCode.JsAstGenerator = function() {};

(function(p) {
    p.generate = function(code) {
        return arcon.parse(code);
    };
})(RoCode.JsAstGenerator.prototype);
