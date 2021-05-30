'use strict';

RoCode.BlockModel = class BlockModel {
    constructor(context) {
        RoCode.Model(this);
        this.schema = {
            id: null,
            x: 0,
            y: 0,
            type: null,
            params: {},
            statements: {},
            prev: null,
            next: null,
            view: null,
        };
    }
};
