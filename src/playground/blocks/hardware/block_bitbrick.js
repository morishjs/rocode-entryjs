'use strict';

RoCode.Bitbrick = {
    SENSOR_MAP: {
        1: 'light',
        2: 'IR',
        3: 'touch',
        4: 'potentiometer',
        5: 'MIC',
        6: 'ultrasonicSensor',
        10: 'vibrationSensor',
        21: 'UserSensor',
        11: 'UserInput',
        20: 'LED',
        19: 'SERVO',
        18: 'DC',
    },
    PORT_MAP: {
        buzzer: 2,
        '5': 4,
        '6': 6,
        '7': 8,
        '8': 10,
        LEDR: 12,
        LEDG: 14,
        LEDB: 16,
    },
    INEQ_SIGN: [
        ["<", "<"],
        [">", ">"],
        ["=", "="]
    ],
    sensorList: function() {
        var list = [];
        var portData = RoCode.hw.portData;
        for (var i = 1; i < 5; i++) {
            var data = portData[i];
            if (data && (data.value || data.value === 0)) {
                list.push([i + ' - ' + Lang.Blocks['BITBRICK_' + data.type], i.toString()]);
            }
        }

        if (list.length == 0) return [[Lang.Blocks.no_target, 'null']];
        return list;
    },
    touchList: function() {
        var list = [];
        var portData = RoCode.hw.portData;
        for (var i = 1; i < 5; i++) {
            var data = portData[i];
            if (data && data.type === 'touch') list.push([i.toString(), i.toString()]);
        }
        if (list.length == 0) return [[Lang.Blocks.no_target, 'null']];
        return list;
    },
    servoList: function() {
        var list = [];
        var portData = RoCode.hw.portData;
        for (var i = 5; i < 9; i++) {
            var data = portData[i];
            if (data && data.type === 'SERVO') list.push(['ABCD'[i - 5], i.toString()]);
        }
        if (list.length == 0) return [[Lang.Blocks.no_target, 'null']];
        return list;
    },
    dcList: function() {
        var list = [];
        var portData = RoCode.hw.portData;
        for (var i = 5; i < 9; i++) {
            var data = portData[i];
            if (data && data.type === 'DC') list.push(['ABCD'[i - 5], i.toString()]);
        }
        if (list.length == 0) return [[Lang.Blocks.no_target, 'null']];
        return list;
    },
    /**
     * ???????????? ?????? ?????? ????????????.
     */
    setZero: function() {
        let sq = RoCode.hw.sendQueue;
        for (let port in RoCode.Bitbrick.PORT_MAP) {
            let portData    = RoCode.hw.portData[port];
            if( portData != null ) {
                if( portData.type == RoCode.Bitbrick.SENSOR_MAP[18] ) {     // DC?????? ??? ??????, 129??? ???????????? ?????? ?????????
                    sq[port] = 129;
                } else {
                    sq[port] = 0;
                }
            } else {
                sq[port] = 0;
            }
        }
        RoCode.hw.update();
    },
    id: '3.1',
    name: 'bitbrick',
    url: 'http://www.bitbrick.cc/',
    imageName: 'bitbrick.png',
    title: {
        ko: '????????????',
        en: 'bitbrick',
    },
    servoMaxValue: 181,
    servoMinValue: 1,
    dcMaxValue: 100,
    dcMinValue: -100,
    monitorTemplate: {
        keys: ['value'],
        imgPath: 'hw/bitbrick.png',
        width: 400,
        height: 400,
        listPorts: {
            '1': {
                name: Lang.Hw.port_en + ' 1 ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '2': {
                name: Lang.Hw.port_en + ' 2 ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '3': {
                name: Lang.Hw.port_en + ' 3 ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '4': {
                name: Lang.Hw.port_en + ' 4 ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            A: {
                name: Lang.Hw.port_en + ' A ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            B: {
                name: Lang.Hw.port_en + ' B ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            C: {
                name: Lang.Hw.port_en + ' C ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            D: {
                name: Lang.Hw.port_en + ' D ' + Lang.Hw.port_ko,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
        },
        // },
        // ports : {
        //     "1":{name: "light", type: "input", pos: {x: 0, y: 0}},
        //     "2":{name: "IR", type: "input", pos: {x : 0, y: 0}},
        //     "3":{name: "touch", type: "input", pos: {x: 0, y: 0}},
        //     "4":{name: "potentiometer", type: "input", pos: {x: 0, y: 0}},
        //     "5":{name: "MIC", type: "input", pos: {x: 0, y: 0}},
        //     "21":{name: "UserSensor", type: "input", pos: {x: 0, y: 0}},
        //     "11":{name: "USER INPUT", type: "input", pos: {x: 0, y: 0}},
        //     "20":{name: "LED", type: "input", pos: {x: 0, y: 0}},
        //     "19":{name: "SERVO", type: "input", pos: {x: 0, y: 0}},
        //     "18":{name: "DC", type: "input", pos: {x: 0, y: 0}},
        //     "buzzer":{name: "??????", type: "input", pos: {x: 0, y: 0}},
        //     "LEDR":{name: "LEDR", type: "output", pos: {x: 0, y: 0}},
        //     "LEDG":{name: "LEDG", type: "output", pos: {x: 0, y: 0}},
        //     "LEDB":{name: "LEDG", type: "output", pos: {x: 0, y: 0}}
        // },
        mode: 'both',
    },
    /**
     * ?????? ??????. ???????????? ?????? ???????????? ?????????.
     * @param {*} pd
     */
    afterReceive(pd) {
        for( let i = 1; i < 5; i++ ) {      // ?????? ????????? ??????
            let obj = pd[ i ];              // ex) null or { type: "touch", value: 1023 }
            if( obj != null ) {
                if( obj.type == 'touch' && obj.value == 0 ) {
                    RoCode.engine.fireEvent('bitbrickButtonEventReceive');
                }
                RoCode.engine.fireEvent('bitbrickSensorGetValueEventReceive');
            }
        }
    },
    calculateDCMotorValue: function( value ) {
        let val = 0;
        if ( value > 0 ) {
            val  = Math.floor( ( value * 0.8 ) + 16 );
        } else if ( value < 0 ) {
            val  = Math.ceil( ( value * 0.8 ) - 19 );
        } else {
            val  = 0;
        }
        // DC_MOTOR_ADJUSTMENT  128
        val = 128 + val;
        if ( val == 128 ) {
            val = 129;
        }
        return val;
    }
};

RoCode.Bitbrick.blockMenuBlocks = [
    'bitbrick_when_button_pressed',
    'bitbrick_when_sensor_get_value',
    'bitbrick_sensor_value',
    'bitbrick_convert_scale',
    'bitbrick_is_touch_pressed',
    'bitbrick_turn_off_color_led',
    'bitbrick_turn_on_color_led_by_rgb',
    'bitbrick_turn_on_color_led_by_picker',
    'bitbrick_turn_on_color_led_by_value',
    'bitbrick_buzzer',
    'bitbrick_turn_off_all_motors',
    'bitbrick_dc_speed',
    'bitbrick_dc_direction_speed',
    'bitbrick_servomotor_angle',
];

RoCode.Bitbrick.getBlocks = function() {
    return {
        //region bitbrick ????????????
        bitbrick_when_button_pressed: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_event',
            statements: [],
            params: [
                // {
                //     type: 'Indicator',
                //     img: 'block_icon/start_icon_play.svg',
                //     size: 14,
                //     position: {
                //         x: 0,
                //         y: -2,
                //     },
                // },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                    position: {
                        x: 0,
                        y: 0
                    }
                },
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    menuName: RoCode.Bitbrick.touchList,
                },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'bitbrick_when_button_pressed',
            },
            paramsKeyMap: {
                DUMMY: 0,
                PORT: 1,
            },
            class: 'event',
            isNotFor: ['bitbrick'],
            event: 'bitbrickButtonEventReceive',
            func: function(sprite, script) {
                if( script.values.length > 0 ) {
                    let selectedSensor  = script.values[ 1 ];
                    let port = script.getStringField('PORT');
                    let type = RoCode.hw.portData[port].type;
                    let val  = RoCode.hw.portData[port].value;
                    if( selectedSensor == port && val == 0 ) {
                        return script.callReturn();
                    } else {
                        return this.die();
                    }
                } else {
                    return this.die();
                }
            },
            syntax: { js: [], py: ['Bitbrick.when_button_pressed(%2)'] },
        },
        bitbrick_when_sensor_get_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_event',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                    position: {
                        x: 0,
                        y: 0
                    }
                },
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    menuName: RoCode.Bitbrick.sensorList,
                },
                {
                    type: 'Dropdown',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    options: RoCode.Bitbrick.INEQ_SIGN,
                    value: '<',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    null,
                    null,
                    {
                        type: 'text',
                        params: ['50'],
                    }
                ],
                type: 'bitbrick_when_sensor_get_value',
            },
            paramsKeyMap: {
                DUMMY: 0,
                PORT: 1,
                INEQ_SIGN: 2,
                VALUE: 3
            },
            class: 'event',
            isNotFor: ['bitbrick'],
            event: 'bitbrickSensorGetValueEventReceive',
            func: function(sprite, script) {
                let selectedPort    = script.values[ 1 ];
                let ineqSign        = script.values[ 2 ];
                let value           = script.values[ 3 ];
                let port    = script.getStringField('PORT');
                let val     = RoCode.hw.portData[port].value;
                if( selectedPort == port && ineqSign == '<' && val < value ) {
                    return script.callReturn();
                } else if( selectedPort == port && ineqSign == '>' && val > value ) {
                    return script.callReturn();
                } else if( selectedPort == port && ineqSign == '=' && val == value ) {
                    return script.callReturn();
                } else {
                    return this.die();
                }
            },
            syntax: { js: [], py: ['Bitbrick.when_sensor_get_value(%2,%3,%4)'] },
        },
        bitbrick_sensor_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    menuName: RoCode.Bitbrick.sensorList,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'bitbrick_sensor_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'button',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                return RoCode.hw.portData[port].value;
            },
            syntax: { js: [], py: ['Bitbrick.sensor_value(%1)'] },
        },
        bitbrick_convert_scale: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    menuName: RoCode.Bitbrick.sensorList,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['1023'],
                    },
                    {
                        type: 'number',
                        params: ['-100'],
                    },
                    {
                        type: 'number',
                        params: ['100'],
                    },
                ],
                type: 'bitbrick_convert_scale',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE2: 1,
                VALUE3: 2,
                VALUE4: 3,
                VALUE5: 4,
            },
            class: 'button',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var port = script.getNumberField('PORT');
                var value1 = RoCode.hw.portData[port].value;
                var value2 = script.getNumberValue('VALUE2', script);
                var value3 = script.getNumberValue('VALUE3', script);
                var value4 = script.getNumberValue('VALUE4', script);
                var value5 = script.getNumberValue('VALUE5', script);
                var result = value1;

                if (value4 > value5) {
                    var swap = value4;
                    value4 = value5;
                    value5 = swap;
                }

                result -= value2;
                result = result * ((value5 - value4) / (value3 - value2));
                result += value4;
                result = Math.min(value5, result);
                result = Math.max(value4, result);
                return Math.round(result);
            },
            syntax: {
                js: [],
                py: ['Bitbrick.convert_scale(%1, %2, %3, %4, %5)'],
            },
        },
        bitbrick_is_touch_pressed: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    menuName: RoCode.Bitbrick.touchList,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'bitbrick_is_touch_pressed',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'button',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                return RoCode.hw.portData[script.getStringField('PORT')].value === 0;
            },
            syntax: { js: [], py: ['Bitbrick.is_touch_pressed(%1)'] },
        },
        bitbrick_turn_off_color_led: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'bitbrick_turn_off_color_led',
                id: 'i3je',
            },
            class: 'led',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                RoCode.hw.sendQueue['LEDR'] = 0;
                RoCode.hw.sendQueue['LEDG'] = 0;
                RoCode.hw.sendQueue['LEDB'] = 0;
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.turn_off_color_led()'] },
        },
        bitbrick_turn_on_color_led_by_rgb: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['255'],
                    },
                    {
                        type: 'text',
                        params: ['255'],
                    },
                    {
                        type: 'text',
                        params: ['255'],
                    },
                    null,
                ],
                type: 'bitbrick_turn_on_color_led_by_rgb',
            },
            paramsKeyMap: {
                rValue: 0,
                gValue: 1,
                bValue: 2,
            },
            class: 'led',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var red = script.getNumberValue('rValue'),
                    green = script.getNumberValue('gValue'),
                    blue = script.getNumberValue('bValue'),
                    min = 0,
                    max = 255,
                    adjustor = RoCode.adjustValueWithMaxMin,
                    sq = RoCode.hw.sendQueue;

                sq['LEDR'] = adjustor(red, min, max);
                sq['LEDG'] = adjustor(green, min, max);
                sq['LEDB'] = adjustor(blue, min, max);
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.color_led_by_rgb(%1, %2, %3)'] },
        },
        bitbrick_turn_on_color_led_by_picker: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Color',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'bitbrick_turn_on_color_led_by_picker',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'led',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var port = script.getStringField('VALUE');
                RoCode.hw.sendQueue['LEDR'] = parseInt(port.substr(1, 2), 16);
                RoCode.hw.sendQueue['LEDG'] = parseInt(port.substr(3, 2), 16);
                RoCode.hw.sendQueue['LEDB'] = parseInt(port.substr(5, 2), 16);
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.color_led_by_picker(%1)'] },
        },
        bitbrick_turn_on_color_led_by_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    null,
                ],
                type: 'bitbrick_turn_on_color_led_by_value',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'led',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var value = script.getNumberValue('VALUE');
                var red, green, blue;
                value = value % 200;
                if (value < 67) {
                    red = 200 - value * 3;
                    green = value * 3;
                    blue = 0;
                } else if (value < 134) {
                    value = value - 67;
                    red = 0;
                    green = 200 - value * 3;
                    blue = value * 3;
                } else if (value < 201) {
                    value = value - 134;
                    red = value * 3;
                    green = 0;
                    blue = 200 - value * 3;
                }
                RoCode.hw.sendQueue['LEDR'] = red;
                RoCode.hw.sendQueue['LEDG'] = green;
                RoCode.hw.sendQueue['LEDB'] = blue;
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.color_led_by_value(%1)'] },
        },
        bitbrick_buzzer: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['60'],
                    },
                    null,
                ],
                type: 'bitbrick_buzzer',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'buzzer',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                if (!script.isStart) {
                    var value = script.getNumberValue('VALUE');
                    RoCode.hw.sendQueue['buzzer'] = value;
                    script.isStart = true;
                    return script;
                } else {
                    RoCode.hw.sendQueue['buzzer'] = 0;
                    delete script.isStart;
                    return script.callReturn();
                }
            },
            syntax: { js: [], py: ['Bitbrick.buzzer(%1)'] },
        },
        bitbrick_turn_off_all_motors: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'bitbrick_turn_off_all_motors',
            },
            class: 'motor',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var sq = RoCode.hw.sendQueue;
                var bitbrick = RoCode.Bitbrick;
                bitbrick.servoList().map(function(servo) {
                    sq[servo[1]] = 0;
                });
                bitbrick.dcList().map(function(dc) {
                    sq[dc[1]] = 129;
                });
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.turn_off_all_motors()'] },
        },
        bitbrick_dc_speed: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    menuName: RoCode.Bitbrick.dcList,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['100'],
                    },
                    null,
                ],
                type: 'bitbrick_dc_speed',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'motor',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var value = script.getNumberValue('VALUE');
                value = Math.min(value, RoCode.Bitbrick.dcMaxValue);
                value = Math.max(value, RoCode.Bitbrick.dcMinValue);
                let val = RoCode.Bitbrick.calculateDCMotorValue( value );
                RoCode.hw.sendQueue[script.getStringField('PORT')] = val;
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.dc_speed(%1, %2)'] },
        },
        bitbrick_dc_direction_speed: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    menuName: RoCode.Bitbrick.dcList,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.BITBRICK_dc_direction_cw, 'CW'],
                        [Lang.Blocks.BITBRICK_dc_direction_ccw, 'CCW'],
                    ],
                    value: 'CW',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    null,
                    {
                        type: 'text',
                        params: ['100'],
                    },
                    null,
                ],
                type: 'bitbrick_dc_direction_speed',
            },
            paramsKeyMap: {
                PORT: 0,
                DIRECTION: 1,
                VALUE: 2,
            },
            class: 'motor',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                let isFront = script.getStringField('DIRECTION') === 'CW';
                let value   = script.getNumberValue('VALUE');
                value = Math.min(value, RoCode.Bitbrick.dcMaxValue);
                value = Math.max(value, 0);
                if ( !isFront ) {
                    value = -1 * value;
                }
                let val = RoCode.Bitbrick.calculateDCMotorValue( value );
                RoCode.hw.sendQueue[script.getStringField('PORT')] = val;
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.dc_direction_speed(%1, %2, %3)'] },
        },
        bitbrick_servomotor_angle: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    fontSize: 11,
                    menuName: RoCode.Bitbrick.servoList,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    null,
                ],
                type: 'bitbrick_servomotor_angle',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'motor',
            isNotFor: ['bitbrick'],
            func: function(sprite, script) {
                var value = RoCode.Bitbrick.servoMaxValue - (script.getNumberValue('VALUE') + 1);
                value = Math.min(value, RoCode.Bitbrick.servoMaxValue);
                value = Math.max(value, RoCode.Bitbrick.servoMinValue);
                RoCode.hw.sendQueue[script.getStringField('PORT')] = value;
                return script.callReturn();
            },
            syntax: { js: [], py: ['Bitbrick.servomotor_angle(%1, %2)'] },
        },
        //endregion bitbrick ????????????
    };
};
// ?????? ??????
RoCode.Bitbrick.setLanguage = function() {
    return {
        ko: {
            // ko.js??? ???????????? ??????
            template: {
                bitbrick_when_button_pressed: '%1 ?????? %2 ???????????? ???',
                bitbrick_when_sensor_get_value: '%1 %2 ??? %3 %4 ??? ???',
                bitbrick_sensor_value: '%1  ???',
                bitbrick_is_touch_pressed: '?????? %1 ???(???) ?????????????',
                bitbrick_turn_off_color_led: '????????? ?????? %1',
                bitbrick_turn_on_color_led_by_rgb: '????????? ?????? %1 ?????? %2 ?????? %3 %4',
                bitbrick_turn_on_color_led_by_picker: '????????? ???  %1 ??? ????????? %2',
                bitbrick_turn_on_color_led_by_value: '????????? ??? %1 ??? ????????? %2',
                bitbrick_buzzer: '?????????  %1 ?????? %2',
                bitbrick_turn_off_all_motors: '?????? ?????? ?????? %1',
                bitbrick_dc_speed: '???????????? %1  ?????? %2 %3',
                bitbrick_dc_direction_speed: '???????????? %1   %2  ??????  ?????? %3 %4',
                bitbrick_servomotor_angle: '???????????? %1  ?????? %2 %3',
                bitbrick_convert_scale: '?????? %1 ??? %2 ~ %3 ?????? %4 ~ %5',
            },
            Blocks: {
                BITBRICK_light: '????????????',
                BITBRICK_IR: '????????????',
                BITBRICK_touch: '??????',
                BITBRICK_ultrasonicSensor: '???????????????',
                BITBRICK_vibrationSensor: '????????????',
                BITBRICK_potentiometer: '????????????',
                BITBRICK_MIC: '????????????',
                BITBRICK_UserSensor: '???????????????',
                BITBRICK_UserInput: '???????????????',
                BITBRICK_dc_direction_ccw: '?????????',
                BITBRICK_dc_direction_cw: '??????',
            },
            Menus: {
                bitbrick: '????????????',
            },
            Device: {
                bitbrick: '????????????',
            },
        },
        en: {
            // en.js??? ???????????? ??????
            template: {
                bitbrick_when_button_pressed: '%1 When button %2 pressed',
                bitbrick_when_sensor_get_value: '%1 When %2 value %3 %4',
                bitbrick_sensor_value: 'Value %1',
                bitbrick_is_touch_pressed: 'Pressed %1 button? ',
                bitbrick_turn_off_color_led: 'Turn off color LED %1',
                bitbrick_turn_on_color_led_by_rgb: 'Color LED R %1 G %2 B %3 %4',
                bitbrick_turn_on_color_led_by_picker: 'Select %1 for color LED %2',
                bitbrick_turn_on_color_led_by_value: 'Color LED, select %1 %2',
                bitbrick_buzzer: 'Buzz for %1 secs %2',
                bitbrick_turn_off_all_motors: 'Turn off all motors %1',
                bitbrick_dc_speed: 'DC motor %1 speed %2 %3',
                bitbrick_dc_direction_speed: 'DC motor %1 %2 direction speed %3 %4',
                bitbrick_servomotor_angle: 'Servo motor %1 angle %2 %3',
                bitbrick_convert_scale: 'Convert %1 value from %2~%3 to %4~%4',
            },
            Blocks: {
                BITBRICK_light: 'light',
                BITBRICK_IR: 'IR',
                BITBRICK_touch: 'touch',
                BITBRICK_ultrasonicSensor: 'ultrasonicSenso',
                BITBRICK_vibrationSensor: 'vibrationSensor',
                BITBRICK_potentiometer: 'potentiometer',
                BITBRICK_MIC: 'MIC',
                BITBRICK_UserSensor: 'UserSensor',
                BITBRICK_UserInput: 'UserInput',
                BITBRICK_dc_direction_ccw: 'CCW',
                BITBRICK_dc_direction_cw: 'CW',
            },
            Menus: {
                bitbrick: 'bitbrick',
            },
        },
    };
};

module.exports = RoCode.Bitbrick;
