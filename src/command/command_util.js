'use strict';

const COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

const obj = {
    createTooltip(title, content, target, callback, option = {}) {
        return new RoCode.Tooltip(
            [
                {
                    title,
                    content,
                    target,
                },
            ],
            Object.assign(
                {
                    restrict: true,
                    dimmed: true,
                    callBack: callback,
                },
                option
            )
        );
    },
    returnEmptyArr() {
        return [];
    },
    getExpectedData(name, defaultValue) {
        const expected = (RoCode.expectedAction || []).concat();
        if (!name || _.isEmpty(expected)) {
            return defaultValue;
        }

        expected.shift();

        const ret = _.find(expected, ([key]) => key === name);
        if (ret) {
            return ret[1];
        }

        return defaultValue;
    },
};

RoCode.Command[COMMAND_TYPES.dismissModal] = {
    do() {
        RoCode.dispatchEvent('dismissModal');
    },
    state: obj.returnEmptyArr,
    log: obj.returnEmptyArr,
    undo: 'dismissModal',
    recordable: RoCode.STATIC.RECORDABLE.SKIP,
    validate: false,
    dom: [],
};

module.exports = obj;
