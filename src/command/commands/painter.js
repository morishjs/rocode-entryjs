/*
 *
 */
'use strict';

(function(c) {
    const COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.editPicture] = {
        do() {
            RoCode.playground.painter.redo();
        },
        state() {},
        log(objectId) {
            return [objectId];
        },
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        undo: 'uneditPicture',
    };

    c[COMMAND_TYPES.uneditPicture] = {
        type: RoCode.STATIC.COMMAND_TYPES.uneditPicture,
        do() {
            RoCode.playground.painter.undo();
        },
        state() {},
        log(objectId) {
            return [objectId];
        },
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        undo: 'editPicture',
    };

    c[COMMAND_TYPES.processPicture] = {
        do() {
            RoCode.playground.painter.redo();
        },
        state() {},
        log(objectId) {
            return [objectId];
        },
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        undo: 'unprocessPicture',
        isPass: true,
    };

    c[COMMAND_TYPES.unprocessPicture] = {
        do() {
            RoCode.playground.painter.undo();
        },
        state() {},
        log(objectId) {
            return [objectId];
        },
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        undo: 'processPicture',
        isPass: true,
    };
})(RoCode.Command);
