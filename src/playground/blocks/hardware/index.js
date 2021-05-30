'use strict';

/*
 * ex)
 * '1.1': RoCode.Arduino,
 * '1.2': RoCode.SensorBoard,
 * '1.3': RoCode.CODEino,
 * '1.4': RoCode.joystick,
 * '1.5': RoCode.dplay
 * ...
 */
RoCode.HARDWARE_LIST = {};

/*
 * index.js 를 제외한 해당 폴더의 모든 모듈을 import 한다.
 * 모듈은 id 가 있어야 등록된다.
 * 등록된 모듈은 RoCode.HARDWARE_LIST 에 포함된다.
 */
const moduleListReq = require.context('.', false, /^(?!.*index.js)((.*\.(js\.*))[^.]*$)/im);
moduleListReq.keys().forEach((fileName) => {
    const module = moduleListReq(fileName);
    const addHardwareList = (module) => {
        if (typeof module.id === 'string') {
            RoCode.HARDWARE_LIST[module.id] = module;
        } else if (module.id instanceof Array) {
            module.id.forEach((id) => {
                RoCode.HARDWARE_LIST[id] = module;
            });
        }
    };

    if (module instanceof Array) {
        module.forEach(addHardwareList);
    } else {
        addHardwareList(module);
    }
});

function getHardwareModule(hardware, callback) {
    return new Promise((resolve) => {
        require.ensure([], function(require) {
            resolve(require('./' + hardware));
        });
    });
}

module.exports = {
    getHardwareModuleList() {
        return Object.values(RoCode.HARDWARE_LIST);
    },
};
