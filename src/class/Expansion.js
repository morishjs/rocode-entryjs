import ExtraBlockUtils from '../util/extrablockUtils';

export default class Expansion {
    constructor(playground) {
        this.playground = playground;
    }

    banAllExpansionBlock() {
        ExtraBlockUtils.banAllBlocks(this.playground, RoCode.EXPANSION_BLOCK_LIST);
    }

    banExpansionBlocks(expansionNames) {
        ExtraBlockUtils.banBlocks(expansionNames, RoCode.EXPANSION_BLOCK_LIST, (expansionTypes) =>
            RoCode.do('objectRemoveExpansionBlocks', expansionTypes).isPass(true)
        );
    }

    isActive(expansionName) {
        return ExtraBlockUtils.isActive(expansionName, RoCode.EXPANSION_BLOCK_LIST);
    }

    addExpansionBlocks(blockNames) {
        RoCode.do('objectAddExpansionBlocks', blockNames);
    }

    getExpansions(blockList) {
        return ExtraBlockUtils.getExtras(blockList, 'category_expansion');
    }

    destroy() {
        // 우선 interface 만 정의함.
    }
}
