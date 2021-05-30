module.exports = {
    getBlocks() {
        return {
            functionAddButton: {
                skeleton: 'basic_button',
                color: RoCodeStatic.colorSet.common.BUTTON_BACKGROUND,
                isNotFor: ['functionInit'],
                params: [
                    {
                        type: 'Text',
                        text: Lang.Workspace.function_create,
                        color: RoCodeStatic.colorSet.common.BUTTON,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'functionAddButton',
                },
                events: {
                    mousedown: [
                        function() {
                            RoCode.do('funcEditStart', RoCode.generateHash());
                        },
                    ],
                },
            },
        };
    },
};
