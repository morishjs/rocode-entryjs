'use strict';

RoCode.Command = {};

(function(c) {
    c[RoCode.STATIC.COMMAND_TYPES.do] = {
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        log(objectId) {
            return [];
        },
        skipUndoStack: true,
    };

    c[RoCode.STATIC.COMMAND_TYPES.undo] = {
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        log(objectId) {
            return [];
        },
        skipUndoStack: true,
    };

    c[RoCode.STATIC.COMMAND_TYPES.redo] = {
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        log(objectId) {
            return [];
        },
        skipUndoStack: true,
    };
})(RoCode.Command);
