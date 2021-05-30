/*
 *
 */
'use strict';
import DataTable from '../../class/DataTable';

(function(c) {
    const { COMMAND_TYPES, RECORDABLE } = RoCode.STATIC;

    c[COMMAND_TYPES.dataTableAddSource] = {
        do(table) {
            RoCode.playground.selectTable(table);
        },
        state(table) {
            return [table];
        },
        log(table) {
            return [['table', table]];
        },
        recordable: RECORDABLE.SUPPORT,
        validate: false,
        undo: 'dataTableRemoveSource',
        dom: ['playground', 'tableAddButton'],
    };

    c[COMMAND_TYPES.dataTableRemoveSource] = {
        do(table = {}) {
            const index = DataTable.getIndex(table);
            if (index < 0) {
                console.warn('not found table', table);
                return;
            }
            DataTable.tables.splice(index, 1);
            const isWorkspace = RoCode.type === 'workspace';
            if (isWorkspace) {
                RoCode.playground.reloadPlayground();
                RoCode.playground.refreshPlayground();
                !DataTable.tables.length && DataTable.banAllBlock();
            }
        },
        state(table) {
            return [table];
        },
        log(table) {
            return [['table', table]];
        },
        recordable: RECORDABLE.SUPPORT,
        validate: false,
        undo: 'dataTableAddSource',
        dom: ['playground', 'tableAddButton'],
    };
})(RoCode.Command);
