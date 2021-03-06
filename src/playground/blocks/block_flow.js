module.exports = {
    getBlocks() {
        return {
            wait_second: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['2'],
                        },
                        null,
                    ],
                    type: 'wait_second',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'wait_second',
                },
                paramsKeyMap: {
                    SECOND: 0,
                },
                class: 'delay',
                isNotFor: [],
                func(sprite, script) {
                    if (!script.isStart) {
                        script.isStart = true;
                        script.timeFlag = 1;
                        let timeValue = script.getNumberValue('SECOND', script);
                        const fps = RoCode.FPS || 60;
                        timeValue = (60 / fps) * timeValue * 1000;

                        const blockId = script.block.id;
                        RoCode.TimeWaitManager.add(
                            blockId,
                            () => {
                                script.timeFlag = 0;
                            },
                            timeValue
                        );

                        return script;
                    } else if (script.timeFlag == 1) {
                        return script;
                    } else {
                        delete script.timeFlag;
                        delete script.isStart;
                        RoCode.engine.isContinue = false;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.wait_for_sec(%1)',
                        },
                    ],
                },
            },
            repeat_basic: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'number',
                            params: ['10'],
                        },
                        null,
                    ],
                    type: 'repeat_basic',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'number',
                            params: ['A&value'],
                        },
                        null,
                    ],
                    type: 'repeat_basic',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                statementsKeyMap: {
                    DO: 0,
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    if (!script.isLooped) {
                        const iterNumber = script.getNumberValue('VALUE', script);
                        script.isLooped = true;
                        if (iterNumber < 0) {
                            throw new Error(Lang.Blocks.FLOW_repeat_basic_errorMsg);
                        }
                        script.iterCount = Math.floor(iterNumber);
                    }
                    if (script.iterCount !== 0 && !(script.iterCount < 0)) {
                        script.iterCount--;
                        return script.getStatement('DO', script);
                    } else {
                        delete script.isLooped;
                        delete script.iterCount;
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'for i in range(%1):\n$1',
                            template: 'for i in range(%1):',
                            idChar: ['i', 'j', 'k'],
                        },
                    ],
                },
            },
            repeat_inf: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                    {
                        type: 'Block',
                        accept: 'Boolean',
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'repeat_inf',
                },
                pyHelpDef: {
                    params: [
                        null,
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                    ],
                    type: 'repeat_inf',
                },
                statementsKeyMap: {
                    DO: 0,
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    script.isLooped = true;
                    return script.getStatement('DO');
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'while True:\n$1',
                            template: 'while %2\n:',
                            textParams: [
                                undefined,
                                {
                                    type: 'Block',
                                    accept: 'boolean',
                                },
                            ],
                        },
                    ],
                },
            },
            repeat_while_true: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.FLOW_repeat_while_true_until, 'until'],
                            [Lang.Blocks.FLOW_repeat_while_true_while, 'while'],
                        ],
                        value: 'until',
                        fontSize: 10,
                        bgColor: RoCodeStatic.colorSet.block.darken.FLOW,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                        null,
                    ],
                    type: 'repeat_while_true',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                        null,
                    ],
                    type: 'repeat_while_true',
                },
                paramsKeyMap: {
                    BOOL: 0,
                    OPTION: 1,
                },
                statementsKeyMap: {
                    DO: 0,
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    let value = script.getBooleanValue('BOOL', script);

                    if (script.getField('OPTION', script) === 'until') {
                        value = !value;
                    }
                    script.isLooped = value;

                    return value ? script.getStatement('DO', script) : script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'while %1 %2:\n$1',
                            template: 'while not %1:',
                        },
                    ],
                },
            },
            stop_repeat: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'stop_repeat',
                },
                class: 'repeat',
                isNotFor: [],
                func(sprite, script) {
                    return this.executor.breakLoop();
                },
                syntax: { js: [], py: ['break'] },
            },
            _if: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                    ],
                    type: '_if',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                    ],
                    type: '_if',
                },
                paramsKeyMap: {
                    BOOL: 0,
                },
                statementsKeyMap: {
                    STACK: 0,
                },
                class: 'condition',
                isNotFor: [],
                func(sprite, script) {
                    if (script.isCondition) {
                        delete script.isCondition;
                        return script.callReturn();
                    }
                    const value = script.getBooleanValue('BOOL', script);
                    if (value) {
                        script.isCondition = true;
                        return script.getStatement('STACK', script);
                    } else {
                        return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [{ syntax: 'if %1:\n$1', template: 'if %1:' }],
                },
            },
            if_else: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_double_loop',
                statements: [
                    {
                        accept: 'basic',
                    },
                    {
                        accept: 'basic',
                    },
                ],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                    {
                        type: 'LineBreak',
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                    ],
                    type: 'if_else',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                    ],
                    type: 'if_else',
                },
                paramsKeyMap: {
                    BOOL: 0,
                },
                statementsKeyMap: {
                    STACK_IF: 0,
                    STACK_ELSE: 1,
                },
                class: 'condition',
                isNotFor: [],
                func(sprite, script) {
                    if (script.isCondition) {
                        delete script.isCondition;
                        return script.callReturn();
                    }
                    const value = script.getBooleanValue('BOOL', script);
                    script.isCondition = true;
                    if (value) {
                        return script.getStatement('STACK_IF', script);
                    } else {
                        return script.getStatement('STACK_ELSE', script);
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'if %1:\n$1\nelse:\n$2',
                            template: 'if %1: %3 else:',
                            textParams: [
                                {
                                    type: 'Block',
                                    accept: 'boolean',
                                },
                                undefined,
                                {
                                    type: 'LineBreak',
                                },
                            ],
                        },
                    ],
                },
            },
            wait_until_true: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'boolean',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [
                        {
                            type: 'True',
                        },
                        null,
                    ],
                    type: 'wait_until_true',
                },
                pyHelpDef: {
                    params: [
                        {
                            type: 'boolean_shell',
                            params: ['A'],
                        },
                        null,
                    ],
                    type: 'wait_until_true',
                },
                paramsKeyMap: {
                    BOOL: 0,
                },
                class: 'wait',
                isNotFor: [],
                func(sprite, script) {
                    const value = script.getBooleanValue('BOOL', script);
                    if (value) {
                        return script.callReturn();
                    } else {
                        return script;
                    }
                },
                syntax: { js: [], py: ['RoCode.wait_until(%1)'] },
            },
            stop_object: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.FLOW_stop_object_all, 'all'],
                            [Lang.Blocks.FLOW_stop_object_this_object, 'thisOnly'],
                            [Lang.Blocks.FLOW_stop_object_this_thread, 'thisThread'],
                            [Lang.Blocks.FLOW_stop_object_other_thread, 'otherThread'],
                            [Lang.Blocks.FLOW_stop_object_other_objects, 'other_objects'],
                        ],
                        value: 'all',
                        fontSize: 10,
                        bgColor: RoCodeStatic.colorSet.block.darken.FLOW,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'stop_object',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'stop_object',
                },
                paramsKeyMap: {
                    TARGET: 0,
                },
                class: 'terminate',
                isNotFor: [],
                func(sprite, script) {
                    const object = sprite.parent;

                    switch (script.getField('TARGET', script)) {
                        case 'all':
                            RoCode.container.mapObject(function(obj) {
                                if (!obj.objectType) {
                                    return;
                                }

                                obj.script.clearExecutors();
                            });
                            return this.die();
                        case 'thisOnly':
                            object.script.clearExecutorsByEntity(sprite);
                            return this.die();
                        case 'thisObject':
                            object.script.clearExecutors();
                            return this.die();
                        case 'thisThread':
                            return this.die();
                        case 'otherThread': {
                            const executor = this.executor;
                            const code = object.script;
                            const executors = code.executors;
                            const spriteId = sprite.id;
                            for (let i = 0; i < executors.length; i++) {
                                const currentExecutor = executors[i];
                                if (
                                    currentExecutor !== executor &&
                                    currentExecutor.entity.id === spriteId
                                ) {
                                    code.removeExecutor(currentExecutor);
                                    --i;
                                }
                            }
                            return script.callReturn();
                        }
                        case 'other_objects':
                            RoCode.container.mapObject(function(obj) {
                                if (!obj.objectType || obj === object) {
                                    return;
                                }

                                obj.script.clearExecutors();
                            });
                            return script.callReturn();
                    }
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.stop_code(%1)',
                            textParams: [
                                {
                                    type: 'Dropdown',
                                    options: [
                                        [Lang.Blocks.FLOW_stop_object_all, 'all'],
                                        [Lang.Blocks.FLOW_stop_object_this_object, 'thisOnly'],
                                        [Lang.Blocks.FLOW_stop_object_this_thread, 'thisThread'],
                                        [Lang.Blocks.FLOW_stop_object_other_thread, 'otherThread'],
                                        [
                                            Lang.Blocks.FLOW_stop_object_other_objects,
                                            'other_objects',
                                        ],
                                    ],
                                    value: 'all',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.FLOW,
                                    converter: RoCode.block.converters.returnStringValue,
                                    codeMap: 'RoCode.CodeMap.RoCode.stop_object[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            restart_project: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_without_next',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'restart_project',
                },
                class: 'terminate',
                isNotFor: [],
                func(sprite, script) {
                    RoCode.engine.toggleStop().then(() => {
                        RoCode.engine.toggleRun();
                    });
                },
                syntax: { js: [], py: ['RoCode.start_again()'] },
            },
            when_clone_start: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_event',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/start_icon_clone.svg',
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
                    type: 'when_clone_start',
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    return script.callReturn();
                },
                event: 'when_clone_start',
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'def when_make_clone():',
                            blockType: 'event',
                        },
                    ],
                },
            },
            create_clone: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'DropdownDynamic',
                        value: null,
                        menuName: 'clone',
                        fontSize: 10,
                        textColor: '#fff',
                        bgColor: RoCodeStatic.colorSet.block.darken.FLOW,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.DEFAULT,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null, null],
                    type: 'create_clone',
                },
                pyHelpDef: {
                    params: ['A&value', null],
                    type: 'create_clone',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    const targetSpriteId = script.getField('VALUE', script);
                    const returnBlock = script.callReturn();
                    if (targetSpriteId === 'self') {
                        sprite.parent.addCloneEntity(sprite.parent, sprite, null);
                    } else {
                        const object = RoCode.container.getObject(targetSpriteId);
                        object.addCloneEntity(sprite.parent, null, null);
                    }
                    return returnBlock;
                },
                syntax: {
                    js: [],
                    py: [
                        {
                            syntax: 'RoCode.make_clone_of(%1)',
                            textParams: [
                                {
                                    type: 'DropdownDynamic',
                                    value: null,
                                    menuName: 'clone',
                                    fontSize: 11,
                                    arrowColor: RoCodeStatic.colorSet.arrow.default.FLOW,
                                    converter: RoCode.block.converters.returnStringKey,
                                    codeMap: 'RoCode.CodeMap.RoCode.create_clone[0]',
                                },
                            ],
                        },
                    ],
                },
            },
            delete_clone: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic_without_next',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'delete_clone',
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    if (!sprite.isClone) {
                        return script.callReturn();
                    }
                    sprite.removeClone();
                    return this.die();
                },
                syntax: { js: [], py: ['RoCode.remove_this_clone()'] },
            },
            remove_all_clones: {
                color: RoCodeStatic.colorSet.block.default.FLOW,
                outerLine: RoCodeStatic.colorSet.block.darken.FLOW,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Indicator',
                        img: 'block_icon/flow_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    params: [null],
                    type: 'remove_all_clones',
                },
                class: 'clone',
                isNotFor: [],
                func(sprite, script) {
                    let clonedEntities = sprite.parent.getClonedEntities();
                    clonedEntities.map(function(entity) {
                        entity.removeClone();
                    });
                    clonedEntities = null;

                    return script.callReturn();
                },
                syntax: { js: [], py: ['RoCode.remove_all_clone()'] },
            },
        };
    },
};
