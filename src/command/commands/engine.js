/*
 *
 */
'use strict';

(function(c) {
    var COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.toggleRun] = {
        do: function(callerName) {
            RoCode.engine.toggleRun();
        },
        state: function() {
            return [];
        },
        log: function(callerName) {
            return [['callerName', callerName]];
        },
        restrict: function(data, domQuery, callback, restrictor) {
            var engine = RoCode.engine;
            if (!engine.isState('stop')) engine.toggleStop();

            var isDone = false;
            return new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: domQuery,
                    },
                ],
                {
                    dimmed: true,
                    restrict: true,
                    callBack: function(isFromInit) {},
                }
            );
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'toggleStop',
        dom: ['engine', '&0'],
    };

    c[COMMAND_TYPES.toggleStop] = {
        do: function(callerName) {
            RoCode.engine.toggleStop();
        },
        state: function() {
            return [];
        },
        log: function(callerName) {
            return [['callerName', callerName]];
        },
        restrict: function(data, domQuery, callback, restrictor) {
            var engine = RoCode.engine;
            if (RoCode.engine.popup) RoCode.engine.closeFullScreen();
            if (!engine.isState('run')) engine.toggleRun(false);

            return new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: domQuery,
                    },
                ],
                {
                    dimmed: true,
                    restrict: true,
                    callBack: function(isFromInit) {
                        callback();
                    },
                }
            );
        },
        validate: false,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'toggleRun',
        dom: ['engine', '&0'],
    };
})(RoCode.Command);
