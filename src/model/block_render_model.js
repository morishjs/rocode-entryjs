'use strict';

RoCode.BlockRenderModel = class BlockRenderModel {
    constructor() {
        this.schema = {
            id: 0,
            type: RoCode.STATIC.BLOCK_RENDER_MODEL,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            magneting: false,
        };
        RoCode.Model(this);
    }
};
