/*
 *
 */
'use strict';

(function(c) {
    var COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.editText] = {
        do: function(text, prevText) {
            RoCode.playground.object.setText(text);
            RoCode.playground.object.entity.setText(text);
            RoCode.dispatchEvent('textEdited');
        },
        state: function(text, prevText) {
            return [prevText, text];
        },
        log: function() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'editText',
    };
})(RoCode.Command);
