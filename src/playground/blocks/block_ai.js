module.exports = {
    getBlocks() {
        return {
            ai_noti_img: {
                skeleton: 'basic_text',
                color: RoCodeStatic.colorSet.common.TRANSPARENT,
                template: '%1',
                params: [
                    {
                        type: 'Indicator',
                        img: '/block_icon/working_hard_RoCode.svg',
                        class: 'notice',
                        size: 50,
                        position: {
                            x: 55,
                            y: 20,
                        },
                        align: 'center',
                    },
                ],
                class: 'notice_info',
            },
            ai_noti_text: {
                skeleton: 'basic_text',
                skeletonOptions: {
                    box: {
                        offsetX: -18,
                        offsetY: -25,
                    },
                },
                color: RoCodeStatic.colorSet.common.TRANSPARENT,
                template: '%1',
                params: [
                    {
                        type: 'Text',
                        text: Lang.Workspace.blocks_comming_soon,
                        color: RoCodeStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                class: 'notice_info',
                isNotFor: [],
                events: {},
            },
        };
    },
};
