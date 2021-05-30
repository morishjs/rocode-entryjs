'use strict';

RoCode.BoxModel = class BoxModel {
    constructor() {
        this.schema = {
            id: 0,
            type: RoCode.STATIC.BOX_MODEL,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        RoCode.Model(this);
    }
};
