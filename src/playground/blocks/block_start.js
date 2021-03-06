import { keyInputList } from './inputs/keyboard';

module.exports = {
    getBlocks() {
        return {
            when_run_button_click: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_play.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'when_run_button_click',
                },
                class: 'event',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'start',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_start():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            when_some_key_pressed: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_keyboard.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                    {
                        type: 'Keyboard',
                        options: keyInputList,
                        value: 'q',
                        fontSize: 10,
                        bgColor: RoCodeStatic.colorSet.block.darken.START,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                    },
                ],
                events: {},
                def: {
                    params: [null, '81'],
                    type: 'when_some_key_pressed',
                },
                pyHelpDef: {
                    params: [null, 'A&value'],
                    type: 'when_some_key_pressed',
                },
                paramsKeyMap: {
                    VALUE: 1,
                },
                class: 'event',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'keyPress',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_press_key(%2):',
                            passTest: true,
                            blockType: 'event',
                            textParams: [
                                undefined,
                                {
                                    type: 'Dropdown',
                                    value: 'q',
                                    options: keyInputList,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                                    converter: RoCode.block.converters.keyboardCode,
                                },
                            ],
                        },
                    ],
                },
            },
            mouse_clicked: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_mouse.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'mouse_clicked',
                },
                class: 'event',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'mouse_clicked',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_click_mouse_on():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            mouse_click_cancled: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_mouse.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'mouse_click_cancled',
                },
                class: 'event',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'mouse_click_cancled',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_click_mouse_off():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            when_object_click: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_mouse.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'when_object_click',
                },
                class: 'event',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'when_object_click',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_click_object_on():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            when_object_click_canceled: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_mouse.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'when_object_click_canceled',
                },
                class: 'event',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'when_object_click_canceled',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_click_object_off():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            when_message_cast: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_signal.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'messages',
                        fontSize: 10,
                        textColor: '#FFFFFF',
                        bgColor: RoCodeStatic.colorSet.block.darken.START,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                    },
                ],
                events: {
                    dataAdd: [
                        function(block) {
                            const vc = RoCode.variableContainer;
                            if (vc) {
                                vc.addRef('_messageRefs', block);
                            }
                        },
                    ],
                    viewDestroy: [
                        function(block) {
                            const vc = RoCode.variableContainer;
                            if (vc) {
                                vc.removeRef('_messageRefs', block);
                            }
                        },
                    ],
                },
                def: {
                    params: [null, null],
                    type: 'when_message_cast',
                },
                pyHelpDef: {
                    params: [null, 'A&value'],
                    type: 'when_message_cast',
                },
                paramsKeyMap: {
                    VALUE: 1,
                },
                class: 'message',
                isNotFor: ['message'],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'when_message_cast',

                //"syntax": {"js": [], "py": ["def RoCode_event_signal():\n\tif signal == %2:"]}
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_get_signal(%2):',
                            blockType: 'event',
                            passTest: true,
                            textParams: [
                                undefined,
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'messages',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                                    converter: RoCode.block.converters.returnStringKey,
                                },
                            ],
                        },
                    ],
                },
            },
            message_cast: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'messages',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.START,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon.svg',
                        size: 11,
                    },
                ],
                events: {
                    dataAdd: [
                        function(block) {
                            const vc = RoCode.variableContainer;
                            if (vc) {
                                vc.addRef('_messageRefs', block);
                            }
                        },
                    ],
                    viewDestroy: [
                        function(block) {
                            const vc = RoCode.variableContainer;
                            if (vc) {
                                vc.removeRef('_messageRefs', block);
                            }
                        },
                    ],
                },
                def: {
                    params: [null, null],
                    type: 'message_cast',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'message_cast',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'message',
                isNotFor: ['message'],
                func(sprite, script) {
                    const value = script.getField('VALUE', script);

                    const arr = RoCode.variableContainer.messages_;
                    const isExist = RoCode.isExist(value, 'id', arr);

                    if (value == 'null' || !isExist) {
                        throw new Error('value can not be null or undefined');
                    }

                    setTimeout(() => {
                        RoCode.engine.raiseMessage(value);
                    });
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.send_signal(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'messages',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                                    converter: RoCode.block.converters.returnStringKey,
                                    paramType: 'signal',
                                },
                                undefined,
                            ],
                        },
                    ],
                },
            },
            message_cast_wait: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'messages',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.START,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon.svg',
                        size: 11,
                    },
                ],
                events: {
                    dataAdd: [
                        function(block) {
                            const vc = RoCode.variableContainer;
                            if (vc) {
                                vc.addRef('_messageRefs', block);
                            }
                        },
                    ],
                    dataDestroy: [
                        function(block) {
                            const vc = RoCode.variableContainer;
                            if (vc) {
                                vc.removeRef('_messageRefs', block);
                            }
                        },
                    ],
                },
                def: {
                    params: [null, null],
                    type: 'message_cast_wait',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'message_cast_wait',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'message',
                isNotFor: ['message'],
                func(sprite, script) {
                    if (script.runningScript) {
                        const runningScript = script.runningScript;
                        const length = runningScript.length;
                        for (let i = 0; i < length; i++) {
                            const executor = runningScript.shift();
                            if (executor && !executor.isEnd()) {
                                runningScript.push(executor);
                            }
                        }
                        if (runningScript.length) {
                            return script;
                        } else {
                            return script.callReturn();
                        }
                    } else {
                        const value = script.getField('VALUE', script);
                        const arr = RoCode.variableContainer.messages_;
                        const isExist = RoCode.isExist(value, 'id', arr);
                        if (value == 'null' || !isExist) {
                            throw new Error('value can not be null or undefined');
                        }
                        const data = RoCode.engine.raiseMessage(value);
                        let runningScript = [];
                        while (data.length) {
                            const executor = data.shift();
                            if (executor) {
                                runningScript = runningScript.concat(executor);
                            }
                        }

                        script.runningScript = runningScript;
                        return script;
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.send_signal_wait(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'messages',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                                    converter: RoCode.block.converters.returnStringKey,
                                },
                            ],
                        },
                    ],
                },
            },
            when_scene_start: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_scene.svg',
                        size: 14,
                        position: {
                            x: 0,
                            y: -2,
                        },
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'when_scene_start',
                },
                class: 'scene',
                isNotFor: ['scene'],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'when_scene_start',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_start_scene():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            start_scene: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_without_next',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'scenes',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.START,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'start_scene',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'start_scene',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'scene',
                isNotFor: ['scene'],
                func(sprite, script) {
                    const value = script.getField('VALUE', script);
                    const scene = RoCode.scene.getSceneById(value);
                    if (scene) {
                        RoCode.scene.selectScene(scene);
                        RoCode.engine.fireEvent('when_scene_start');
                    }
                    return null;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.start_scene(%1)',
                            blockType: 'last',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'scenes',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                                    converter: RoCode.block.converters.returnStringKey,
                                },
                            ],
                        },
                    ],
                },
            },
            start_neighbor_scene: {
                color: RoCodeStatic.colorSet.block.default.START,
                outerLine: RoCodeStatic.colorSet.block.darken.START,
                skeleton: 'basic_without_next',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.SCENE_start_scene_next, 'next'],
                            [Lang.Blocks.SCENE_start_scene_pre, 'prev'],
                        ],
                        value: 'next',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.START,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'start_neighbor_scene',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'start_neighbor_scene',
                },
                paramsKeyMap: {
                    OPERATOR: 0,
                },
                class: 'scene',
                isNotFor: ['scene'],
                func(sprite, script) {
                    const currentScene = RoCode.scene.selectedScene;
                    const scenes = RoCode.scene.getScenes();
                    const index = scenes.indexOf(currentScene);
                    const o = script.getField('OPERATOR', script);
                    if (o == 'next') {
                        if (index + 1 < scenes.length) {
                            const nextScene = RoCode.scene.getSceneById(scenes[index + 1].id);
                            if (nextScene) {
                                RoCode.scene.selectScene(nextScene);
                                RoCode.engine.fireEvent('when_scene_start');
                            }
                        }
                    } else {
                        if (index > 0) {
                            const nextScene = RoCode.scene.getSceneById(scenes[index - 1].id);
                            if (nextScene) {
                                RoCode.scene.selectScene(nextScene);
                                RoCode.engine.fireEvent('when_scene_start');
                            }
                        }
                    }
                    return null;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.start_scene_of(%1)',
                            blockType: 'last',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.SCENE_start_scene_next, 'next'],
                                        [Lang.Blocks.SCENE_start_scene_pre, 'prev'],
                                    ],
                                    value: 'next',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.START,
                                    converter: RoCode.block.converters.returnStringValue,
                                    codeMap: 'RoCode.CodeMap.RoCode.start_neighbor_scene[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            check_object_property: {
                color: '#7C7C7C',
                skeleton: 'basic',
                template: '%1 ??? %2 %3 %4 %5 %6',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'sprites',
                        fontSize: 11,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['?????????', 0],
                            ['??????', 1],
                        ],
                        value: '0',
                        fontSize: 11,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['x', 'x'],
                            ['y', 'y'],
                            ['??????', 'size'],
                            ['??????', 'rotation'],
                            ['?????? ??????', 'direction'],
                            ['?????????', 'text'],
                        ],
                        value: 'x',
                        fontSize: 11,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['=', 'EQUAL'],
                            ['>', 'GREATER'],
                            ['<', 'LESS'],
                            ['???', 'GREATER_OR_EQUAL'],
                            ['???', 'LESS_OR_EQUAL'],
                        ],
                        value: 'EQUAL',
                        fontSize: 11,
                        noArrow: true,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                    },
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'check_object_property',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    const obj = RoCode.container.getObject(this.block.params[0]);
                    const flow = this.block.params[1];
                    let propertyKey = this.block.params[2];
                    const rightValue = this.getParam(4);
                    propertyKey = propertyKey[0].toUpperCase() + propertyKey.substr(1);
                    const leftValue = obj.entity[`get${propertyKey}`].call(obj.entity);
                    let returnVal;

                    switch (this.block.params[3]) {
                        case 'EQUAL':
                            returnVal = leftValue == rightValue;
                            break;
                        case 'GREATER':
                            returnVal = Number(leftValue) > Number(rightValue);
                            break;
                        case 'LESS':
                            returnVal = Number(leftValue) < Number(rightValue);
                            break;
                        case 'GREATER_OR_EQUAL':
                            returnVal = Number(leftValue) >= Number(rightValue);
                            break;
                        case 'LESS_OR_EQUAL':
                            returnVal = Number(leftValue) <= Number(rightValue);
                            break;
                    }
                    if (returnVal) {
                        return;
                    } else if (flow == 0) {
                        return RoCode.STATIC.BREAK;
                    } else {
                        this.die();
                    }
                },
            },
            check_block_execution: {
                color: '#7C7C7C',
                skeleton: 'basic_loop',
                template: '%1 ?????? ?????? ????????? %2 %3 ??? ?????????????????? %4',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'allSprites',
                        fontSize: 11,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['????????????', 0],
                            ['?????????', 1],
                        ],
                        value: '16',
                        fontSize: 11,
                    },
                    {
                        type: 'TextInput',
                        value: 1,
                    },
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null, 0, '1'],
                    type: 'check_block_execution',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    const { block = {} } = this;
                    const { data = {} } = block;
                    const { id = '' } = data;
                    if (this.entity.listener[id]) {
                        if (this.remainCheck === 0) {
                            this.entity.listener[id].destroy();
                            delete this.entity.listener[id];
                            return;
                        } else {
                            return RoCode.STATIC.BREAK;
                        }
                    }
                    const code = RoCode.container.getObject(this.block.params[0]).script;
                    const accuracy = this.block.params[1];
                    const statements = this.block.statements[0].getBlocks();
                    let lastBlock = null;
                    this.remainCheck = Number(this.block.params[2]);
                    let index = 0;
                    this.entity.listener[id] = code.watchEvent.attach(this, (blocks) => {
                        //dangerous
                        blocks = blocks.concat();
                        let block;
                        let isFirst = true;
                        while (blocks.length && index < statements.length) {
                            block = blocks.shift();
                            if (isFirst && block === lastBlock) {
                                continue;
                            }
                            if (accuracy === 0 && statements[index].type === block.type) {
                                index++;
                            } else if (accuracy === 1 && statements[index].isSameParamWith(block)) {
                                index++;
                            } else {
                                index = 0;
                            }
                            isFirst = false;
                        }
                        lastBlock = block;
                        if (index === statements.length) {
                            this.remainCheck = this.remainCheck - 1;
                            index = 0;
                        }
                    });
                    return RoCode.STATIC.BREAK;
                },
            },
            switch_scope: {
                color: '#7C7C7C',
                skeleton: 'basic',
                template: '%1 ???????????? ???????????? ???????????? %2',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'sprites',
                        fontSize: 11,
                    },
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'switch_scope',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    const obj = RoCode.container.getObject(this.block.params[0]);
                    this.executor.entity = obj.entity;
                },
            },
            is_answer_submited: {
                color: '#7C7C7C',
                skeleton: 'basic',
                template: '????????? ?????? ????????? ?????? ???????????? %1',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'is_answer_submited',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    if (this.isSubmitted) {
                        RoCode.removeEventListener('answerSubmitted', checkFunc);
                        return;
                    } else if (this.isSubmitted === false) {
                        return RoCode.STATIC.BREAK;
                    }
                    const checkFunc = function() {
                        that.isSubmitted = true;
                    };
                    this.isSubmitted = false;
                    const that = this;
                    RoCode.addEventListener('answerSubmitted', checkFunc);
                    return RoCode.STATIC.BREAK;
                },
            },
            check_lecture_goal: {
                color: '#7C7C7C',
                skeleton: 'basic',
                template: '?????? %1 %2 ( %3 ) %4',
                statements: [],
                params: [
                    {
                        type: 'TextInput',
                        value: 0,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['??????', 1],
                            ['??????', 0],
                        ],
                        fontSize: 11,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['??????', 1],
                            ['?????????', 0],
                        ],
                        value: 1,
                        fontSize: 11,
                    },
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {
                    dataAdd: [
                        function(block) {
                            RoCode.registerAchievement(block);
                        },
                    ],
                },
                def: {
                    params: [0, 1, 1],
                    type: 'check_lecture_goal',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    RoCode.targetChecker.achieveCheck(
                        this.block.params[1],
                        `${this.block.params[0]}`
                    );
                },
            },
            check_variable_by_name: {
                color: '#7C7C7C',
                skeleton: 'basic_string_field',
                template: '%1 ????????? ??????',
                statements: [],
                params: [
                    {
                        type: 'TextInput',
                        value: '?',
                    },
                ],
                events: {},
                def: {
                    params: ['??????'],
                    type: 'check_variable_by_name',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    const variableName = `${this.block.params[0]}`;
                    const variable = RoCode.variableContainer.getVariableByName(variableName);
                    if (variable) {
                        return variable.getValue();
                    } else {
                        return;
                    }
                },
            },
            show_prompt: {
                color: '#7C7C7C',
                skeleton: 'basic',
                template: '%1 ???????????? %2',
                statements: [],
                params: [
                    {
                        type: 'TextInput',
                        value: '',
                    },
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: [' '],
                    type: 'show_prompt',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    if (RoCode.targetChecker) {
                        RoCode.targetChecker.showStatusMessage(this.block.params[0]);
                    }
                },
            },
            check_goal_success: {
                color: '#7C7C7C',
                skeleton: 'basic_boolean_field',
                template: '?????? %1 ??? ???????',
                statements: [],
                params: [
                    {
                        type: 'TextInput',
                        value: '',
                    },
                ],
                events: {},
                def: {
                    params: ['0'],
                    type: 'check_goal_success',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    const goalName = `${this.block.params[0]}`;
                    return RoCode.targetChecker.checkGoal(goalName);
                },
            },
            positive_number: {
                color: '#7C7C7C',
                skeleton: 'basic_string_field',
                template: '??????',
                fontColor: '#fff',
                statements: [],
                params: ['positive'],
                events: {},
                def: {
                    params: ['positive'],
                    type: 'positive_number',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    return 'positive';
                },
            },
            negative_number: {
                color: '#7C7C7C',
                skeleton: 'basic_string_field',
                template: '??????',
                fontColor: '#fff',
                statements: [],
                params: ['negative'],
                events: {},
                def: {
                    params: ['negative'],
                    type: 'negative_number',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    return 'negative';
                },
            },
            wildcard_string: {
                color: '#7C7C7C',
                skeleton: 'basic_string_field',
                template: '    *    ',
                fontColor: '#fff',
                statements: [],
                params: [],
                events: {},
                def: {
                    params: [],
                    type: 'wildcard_string',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {},
            },
            wildcard_boolean: {
                color: '#7C7C7C',
                skeleton: 'basic_boolean_field',
                template: '    *    ',
                fontColor: '#fff',
                statements: [],
                params: [],
                events: {},
                def: {
                    params: [],
                    type: 'wildcard_boolean',
                },
                paramsKeyMap: {},
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {},
            },
            register_score: {
                color: '#7C7C7C',
                skeleton: 'basic',
                template: '%1??? %2??? ????????? %3',
                statements: [],
                params: [
                    {
                        type: 'TextInput',
                        value: 'score',
                    },
                    {
                        type: 'TextInput',
                        value: '1',
                    },
                    {
                        type: 'Indicator',
                        color: '#6B6B6B',
                        size: 12,
                    },
                ],
                events: {},
                def: {
                    params: ['score', 1],
                    type: 'register_score',
                },
                class: 'checker',
                isNotFor: ['checker'],
                func(sprite, script) {
                    const obj = {};
                    obj[this.block.params[0]] = this.block.params[1];
                    if (typeof RoCodelms !== 'undefined') {
                        RoCodelms.emit('registerScore', obj);
                    }
                    return script.callReturn();
                },
            },
        };
    },
};
