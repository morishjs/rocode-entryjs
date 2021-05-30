'use strict';

RoCode.ThreadModel = class ThreadModel {
    constructor() {
        this.schema = {
            id: 0,
            type: RoCode.STATIC.THREAD_MODEL,
            x: 0,
            y: 0,
            width: 0,
            minWidth: 0,
            height: 0,
        };
        RoCode.Model(this);
    }
};
