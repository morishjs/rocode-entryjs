/*
 *
 */
'use strict';

(function(c) {
    const COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.playgroundChangeViewMode] = {
        do(newType, oldType) {
            RoCode.variableContainer.selected = null;
            RoCode.variableContainer.updateList();
            RoCode.playground.changeViewMode(newType);
            if (RoCode.disposeEvent) {
                RoCode.disposeEvent.notify();
            }
            RoCode.Utils.forceStopSounds();
        },
        state(newType, oldType) {
            return [oldType, newType];
        },
        log(newType, oldType) {
            oldType = oldType || 'code';
            return [
                ['newType', newType],
                ['oldType', oldType],
            ];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'playgroundChangeViewMode',
        dom: ['playground', 'tabViewElements', '&0'],
    };

    c[COMMAND_TYPES.playgroundClickAddPicture] = {
        do() {
            RoCode.dispatchEvent('openPictureManager');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        //skipUndoStack: true,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict(data, domQuery, callback, restrictor) {
            RoCode.dispatchEvent('dismissModal');
            const tooltip = new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: domQuery,
                    },
                ],
                {
                    restrict: true,
                    dimmed: true,
                    callBack: callback,
                }
            );
            return tooltip;
        },
        undo: 'playgroundClickAddPictureCancel',
        dom: ['playground', 'pictureAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddPictureCancel] = {
        do() {
            RoCode.dispatchEvent('dismissModal');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        //skipUndoStack: true,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: '',
        dom: ['playground', 'pictureAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddSound] = {
        do() {
            RoCode.dispatchEvent('openSoundManager');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict(data, domQuery, callback, restrictor) {
            RoCode.dispatchEvent('dismissModal');
            const tooltip = new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: domQuery,
                    },
                ],
                {
                    restrict: true,
                    dimmed: true,
                    callBack: callback,
                }
            );
            return tooltip;
        },
        undo: 'playgroundClickAddSoundCancel',
        dom: ['playground', 'soundAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddSoundCancel] = {
        do() {
            RoCode.dispatchEvent('dismissModal');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: '',
        dom: ['playground', 'soundAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddTable] = {
        do() {
            RoCode.dispatchEvent('openTableManager');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        undo: 'playgroundClickAddTableCancel',
        dom: ['playground', 'tableAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddTableCancel] = {
        do() {
            RoCode.dispatchEvent('dismissModal');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: '',
        dom: ['playground', 'tableAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddExpansionBlock] = {
        do() {
            RoCode.dispatchEvent('openExpansionBlockManager');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict(data, domQuery, callback, restrictor) {
            RoCode.dispatchEvent('dismissModal');
            const tooltip = new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: domQuery,
                    },
                ],
                {
                    restrict: true,
                    dimmed: true,
                    callBack: callback,
                }
            );
            return tooltip;
        },
        undo: 'playgroundClickAddExpansionBlockCancel',
        dom: ['playground', 'soundAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddExpansionBlockCancel] = {
        do() {
            RoCode.dispatchEvent('dismissModal');
        },
        state() {
            return [];
        },
        log() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: '',
        dom: ['playground', 'soundAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddAIUtilizeBlock] = {
        do: function() {
            RoCode.dispatchEvent('openAIUtilizeBlockManager');
        },
        state: function() {
            return [];
        },
        log: function() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict: function(data, domQuery, callback, restrictor) {
            RoCode.dispatchEvent('dismissModal');
            var tooltip = new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: domQuery,
                    },
                ],
                {
                    restrict: true,
                    dimmed: true,
                    callBack: callback,
                }
            );
            return tooltip;
        },
        undo: 'playgroundClickAddAIUtilizeBlockCancel',
        dom: ['playground', 'soundAddButton'],
    };

    c[COMMAND_TYPES.playgroundClickAddAIUtilizeBlockCancel] = {
        do: function() {
            RoCode.dispatchEvent('dismissModal');
        },
        state: function() {
            return [];
        },
        log: function() {
            return [];
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: '',
        dom: ['playground', 'soundAddButton'],
    };
})(RoCode.Command);
