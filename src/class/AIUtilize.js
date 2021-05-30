import ExtraBlockUtils from '../util/extrablockUtils';

export default class AIUtilize {
    constructor(playground) {
        this.playground = playground;
    }

    banAllAIUtilizeBlock() {
        ExtraBlockUtils.banAllBlocks(this.playground, RoCode.AI_UTILIZE_BLOCK_LIST);
    }

    banAIUtilizeBlocks(aiUtilizeNames = []) {
        ExtraBlockUtils.banBlocks(aiUtilizeNames, RoCode.AI_UTILIZE_BLOCK_LIST, (aiUtilizeTypes) =>
            RoCode.do('objectRemoveAIUtilizeBlocks', aiUtilizeTypes).isPass(true)
        );
    }

    isActive(aiUtilizeName) {
        return ExtraBlockUtils.isActive(aiUtilizeName, RoCode.AI_UTILIZE_BLOCK_LIST);
    }

    addAIUtilizeBlocks(blockNames) {
        RoCode.do('objectAddAIUtilizeBlocks', blockNames);
    }

    getAIUtilizes(blockList) {
        return ExtraBlockUtils.getExtras(blockList, 'category_ai_utilize');
    }

    destroy() {
        // 우선 interface 만 정의함.
    }
}
