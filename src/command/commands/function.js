/*
 *
 */
'use strict';

const { createTooltip, returnEmptyArr, getExpectedData } = require('../command_util');

(function(c) {
    const COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.funcCreateStart] = {
        do(funcId) {
            RoCode.getMainWS().setMode(RoCode.Workspace.MODE_BOARD, 'cancelEdit');
            funcId = getExpectedData('funcId') || funcId;
            RoCode.playground.changeViewMode('code');
            const blockMenu = RoCode.variableContainer._getBlockMenu();
            if (blockMenu.lastSelector !== 'func') {
                blockMenu.selectMenu('func');
            }
            RoCode.variableContainer.createFunction({ id: funcId });
        },
        state(funcId) {
            return [getExpectedData('funcId', funcId), 'remove'];
        },
        log(funcId) {
            return [['funcId', getExpectedData('funcId') || funcId]];
        },
        restrict(data, domQuery, callback) {
            RoCode.playground.changeViewMode('variable');
            RoCode.variableContainer.selectFilter('func');

            const {
                tooltip: { title, content },
            } = data;
            return createTooltip(title, content, domQuery, callback);
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['variableContainer', 'functionAddButton'],
        undo: 'funcEditCancel',
    };

    c[COMMAND_TYPES.funcEditStart] = {
        do(id, json) {
            const func = RoCode.variableContainer.getFunction(id);
            if (func) {
                RoCode.Func.edit(id);
            } else {
                RoCode.variableContainer.createFunction({ id });
            }
            if (json) {
                RoCode.Func.targetFunc.content.load(json);
            }
        },
        state(id, json, type = 'cancel', isExist) {
            if (type === 'save' && id && !isExist) {
                RoCode.variableContainer.removeFunction({ id });
            }
            return [type];
        },
        log(funcId) {
            return [['funcId', funcId]];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['variableContainer', 'functionAddButton'],
        undo: 'funcEditEnd',
    };

    c[COMMAND_TYPES.funcEditEnd] = {
        do(type) {
            RoCode.Func.isEdit = false;
            if (type === 'save') {
                RoCode.getMainWS().setMode(RoCode.Workspace.MODE_BOARD, 'save');
            } else {
                RoCode.getMainWS().setMode(RoCode.Workspace.MODE_BOARD, 'cancelEdit');
            }
        },
        state(type) {
            const json = RoCode.Func.targetFunc.content.toJSON();
            const func = RoCode.variableContainer.getFunction(RoCode.Func.targetFunc.id);
            return [RoCode.Func.targetFunc.id, json, type, !!func];
        },
        log(type) {
            return [['funcId', RoCode.Func.targetFunc.id]];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['variableContainer', 'functionAddButton'],
        undo: 'funcEditStart',
    };

    c[COMMAND_TYPES.funcRemove] = {
        do({ id }) {
            RoCode.variableContainer.removeFunction({ id });
        },
        state({ id }) {
            const func = RoCode.variableContainer.getFunction(id);
            return [func];
        },
        log(func) {
            return [['funcId', func.id]];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['variableContainer', 'functionAddButton'],
        undo: 'funcCreate',
    };

    c[COMMAND_TYPES.funcCreate] = {
        do(func) {
            RoCode.variableContainer.saveFunction(func);
            RoCode.Func.registerFunction(func);
            RoCode.Func.updateMenu();
        },
        state({ id }) {
            return [{ id }];
        },
        log(func) {
            return [['funcId', func.id]];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['variableContainer', 'functionAddButton'],
        undo: 'funcRemove',
    };
})(RoCode.Command);
