const { type } = Lang || {};
const filename = type === 'ko' ? 'text_icon_ko.svg' : 'text_icon.svg';
module.exports = {
    getBlocks() {
        return {
            text_read: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                fontColor: RoCodeStatic.colorSet.common.WHITE,
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'textBoxWithSelf',
                        fontSize: 10,
                        bgColor: RoCodeStatic.colorSet.block.darken.TEXT,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.DEFAULT,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'text_read',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'text_read',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const targetId = script.getField('VALUE', script);
                    let targetEntity;
                    if (targetId === 'self') {
                        console.log(sprite);
                        if (sprite.type !== 'textBox') {
                            throw new Error('textBox가 아닙니다.');
                        }
                        targetEntity = sprite;
                    } else {
                        targetEntity = RoCode.container.getEntity(targetId);
                    }
                    let value = targetEntity.getText() || '';
                    value = value.replace(/\n/gim, ' ');
                    return value;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.contents_of_textbox(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'textBoxWithSelf',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.TEXT,
                                    converter: RoCode.block.converters.returnStringKey,
                                    codeMap: 'RoCode.CodeMap.RoCode.text_read[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            text_write: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.Blocks.RoCode],
                        },
                        null,
                    ],
                    type: 'text_write',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'text_write',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const text = script.getStringValue('VALUE', script);
                    sprite.setText(text);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.write_text(%1)'] },
            },
            text_append: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.Blocks.RoCode],
                        },
                        null,
                    ],
                    type: 'text_append',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'text_append',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const text = script.getStringValue('VALUE', script);
                    sprite.setText(`${sprite.getText()}${text}`);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.append_text(%1)'] },
            },
            text_prepend: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'text',
                            params: [Lang.Blocks.RoCode],
                        },
                        null,
                    ],
                    type: 'text_prepend',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'text',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'text_prepend',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const text = script.getStringValue('VALUE', script);
                    sprite.setText(`${text}${sprite.getText()}`);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.prepend_text(%1)'] },
            },
            text_change_effect: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            // display, actual value
                            [Lang.Workspace.font_textblock_strikethrough, 'strike'],
                            [Lang.Workspace.font_textblock_underline, 'underLine'],
                            [Lang.Workspace.font_textblock_italic, 'fontItalic'],
                            [Lang.Workspace.font_textblock_bold, 'fontBold'],
                        ],
                        value: 'strike',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.LOOKS,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.General.apply, 'on'],
                            [Lang.General.clear, 'off'],
                        ],
                        value: 'on',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.LOOKS,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'text_change_effect',
                },
                paramsKeyMap: {
                    EFFECT: 0,
                    MODE: 1,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const effect = script.getField('EFFECT');
                    const mode = script.getField('MODE');
                    sprite.setTextEffect(effect, mode);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.changeTextEffect(%1, %2)'] },
            },
            text_change_font: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'fonts',
                        fontSize: 11,
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'text_change_font',
                },
                paramsKeyMap: {
                    FONT: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const font = script.getField('FONT');
                    sprite.setFontWithLog(`${sprite.getFontSize()} ${font}`, false);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.text_change_font(%1)'] },
            },
            text_change_font_color: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Color',
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'text_change_font_color',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const color = script.getField('VALUE', script);
                    sprite.setColorWithLog(color);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.text_change_font_color(%1)'] },
            },
            text_change_bg_color: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Color',
                    },
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'text_change_bg_color',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    const color = script.getField('VALUE', script);
                    sprite.setBGColourWithLog(color);
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.text_change_bg_color(%1)'] },
            },
            text_flush: {
                color: RoCodeStatic.colorSet.block.default.TEXT,
                outerLine: RoCodeStatic.colorSet.block.darken.TEXT,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: `block_icon/${filename}`,
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'text_flush',
                },
                class: 'text',
                isNotFor: ['sprite'],
                func(sprite, script) {
                    sprite.setText('');
                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.clear_text()'] },
            },
        };
    },
};
