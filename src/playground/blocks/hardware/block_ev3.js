'use strict';

RoCode.EV3 = {
    PORT_MAP: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        '1': undefined,
        '2': undefined,
        '3': undefined,
        '4': undefined,
    },
    motorMovementTypes: {
        Degrees: 0,
        Power: 1,
    },
    deviceTypes: {
        NxtTouch: 1,
        NxtLight: 2,
        NxtSound: 3,
        NxtColor: 4,
        NxtUltrasonic: 5,
        NxtTemperature: 6,
        LMotor: 7,
        MMotor: 8,
        Touch: 16,
        Color: 29,
        Ultrasonic: 30,
        Gyroscope: 32,
        Infrared: 33,
        Initializing: 0x7d,
        Empty: 0x7e,
        WrongPort: 0x7f,
        Unknown: 0xff,
    },
    colorSensorValue: ['', '000000', '0000FF', '00FF00', 'FFFF00', 'FF0000', 'FFFFFF', 'A52A2A'],
    timeouts: [],
    removeTimeout: function(id) {
        clearTimeout(id);
        var timeouts = this.timeouts;
        var index = timeouts.indexOf(id);
        if (index >= 0) {
            timeouts.splice(index, 1);
        }
    },
    removeAllTimeouts: function() {
        var timeouts = this.timeouts;
        for (var i in timeouts) {
            clearTimeout(timeouts[i]);
        }
        this.timeouts = [];
    },
    setZero: function() {
        var portMap = this.PORT_MAP;
        Object.keys(portMap).forEach(function(port) {
            var regex = /[A-D]/i;
            if (regex.test(port)) {
                RoCode.hw.sendQueue[port] = {
                    type: RoCode.EV3.motorMovementTypes.Power,
                    power: 0,
                };
            } else {
                RoCode.hw.sendQueue[port] = portMap[port];
            }
        });
        RoCode.hw.sendQueue.STATUS_COLOR = 'GREEN';
        RoCode.hw.update();
    },
    id: '12.1',
    name: 'EV3',
    url: 'http://www.lego.com/ko-kr/mindstorms/about-ev3',
    imageName: 'ev3.png',
    title: {
        ko: 'EV3',
        en: 'EV3',
    },
};

RoCode.EV3.setLanguage = function() {
    return {
        ko: {
            template: {
                ev3_get_sensor_value: '%1 의 값',
                ev3_touch_sensor: '%1 의 터치센서가 작동되었는가?',
                ev3_button_pressed: '%1 버튼이 눌려져있는가?',
                ev3_color_sensor: '%1 의 %2 값',
                ev3_motor_power: '%1 의 값을 %2 으로 출력 %3',
                ev3_motor_power_on_time: '%1 의 값을 %2 초 동안 %3 으로 출력 %4',
                ev3_motor_degrees: '%1 의 값을 %2 으로  %3 도 만큼 회전 %4',
                ev3_status_led: 'LED 색깔을 %1 (으)로 정하기 %2',
            },
            Blocks: {
                ev3_ccw: '반시계',
                ev3_cw: '시계',
            },
            Menus: {
                ev3: 'EV3',
            },
            Device: {
                ev3: 'EV3',
            },
        },
        en: {
            template: {
                ev3_get_sensor_value: "%1's value",
                ev3_touch_sensor: "%1's touch sensor activated?",
                ev3_button_pressed: "%1's button pressed?",
                ev3_color_sensor: "%1's %2 value",
                ev3_motor_power: "%1's value print as %2 %3",
                ev3_motor_power_on_time: "%1's value for %2seconds %3 printed %4",
                ev3_motor_degrees: "%1's value in %2 direction turn %3 degrees %4",
                ev3_status_led: 'Set status light to %1 %2',
            },
            Blocks: {
                ev3_ccw: 'CCW',
                ev3_cw: 'CW',
            },
            Menus: {
                ev3: 'EV3',
            },
            Device: {
                ev3: 'EV3',
            },
        },
    };
};
RoCode.EV3.blockMenuBlocks = [
    'ev3_get_sensor_value',
    'ev3_touch_sensor',
    'ev3_button_pressed',
    'ev3_color_sensor',
    'ev3_motor_power',
    'ev3_motor_power_on_time',
    'ev3_motor_degrees',
    'ev3_status_led',
];
RoCode.EV3.getBlocks = function() {
    return {
        //region ev3 이브이3
        ev3_color_sensor: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['RGB', 'RGB'],
                        ['R', 'R'],
                        ['G', 'G'],
                        ['B', 'B'],
                    ],
                    value: 'RGB',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'ev3_color_sensor',
            },
            paramsKeyMap: {
                PORT: 0,
                RGB: 1,
            },
            class: 'ev3_sensor',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var rgb = script.getStringField('RGB', script);
                var portData = RoCode.hw.getDigitalPortValue(script.getNumberField('PORT', script));
                var result = '';
                if (portData.type == RoCode.EV3.deviceTypes.Color) {
                    if (portData.siValue == 0) {
                        result = '';
                    } else {
                        switch (rgb) {
                            case 'RGB':
                                result = RoCode.EV3.colorSensorValue[portData.siValue];
                                break;
                            case 'R':
                                result = RoCode.EV3.colorSensorValue[portData.siValue].substring(
                                    0,
                                    2
                                );
                                break;
                            case 'G':
                                result = RoCode.EV3.colorSensorValue[portData.siValue].substring(
                                    2,
                                    4
                                );
                                break;
                            case 'B':
                                result = RoCode.EV3.colorSensorValue[portData.siValue].substring(
                                    4,
                                    6
                                );
                                break;
                        }
                    }
                } else {
                    result = '컬러 센서 아님';
                }
                return result;
            },
        },
        ev3_get_sensor_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'ev3_get_sensor_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ev3_sensor',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var portData = RoCode.hw.getDigitalPortValue(script.getNumberField('PORT', script));
                var result;
                if ($.isPlainObject(portData)) {
                    result = portData.siValue || 0;
                }
                return result;
            },
        },
        ev3_motor_degrees: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['A', 'A'],
                        ['B', 'B'],
                        ['C', 'C'],
                        ['D', 'D'],
                    ],
                    value: 'A',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ev3_cw, 'CW'],
                        [Lang.Blocks.ev3_ccw, 'CCW'],
                    ],
                    value: 'CW',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
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
                        type: 'angle',
                    },
                ],
                type: 'ev3_motor_degrees',
            },
            paramsKeyMap: {
                PORT: 0,
                DIRECTION: 1,
                DEGREE: 2,
            },
            class: 'ev3_output',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var degree = script.getValue('DEGREE', script);
                if (degree <= 0) {
                    degree = 0;
                } else if (degree >= 720) {
                    degree = 720;
                }
                var direction = script.getStringField('DIRECTION', script);
                RoCode.hw.sendQueue[port] = {
                    id: Math.floor(Math.random() * 100000, 0),
                    type: RoCode.EV3.motorMovementTypes.Degrees,
                    degree: degree,
                    power: direction == 'CW' ? 50 : -50,
                };
                return script.callReturn();
            },
        },
        ev3_motor_power: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['A', 'A'],
                        ['B', 'B'],
                        ['C', 'C'],
                        ['D', 'D'],
                    ],
                    value: 'A',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
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
                        type: 'number',
                        params: ['50'],
                    },
                ],
                type: 'ev3_motor_power',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ev3_output',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var value = script.getValue('VALUE', script);
                RoCode.hw.sendQueue[port] = {
                    id: Math.floor(Math.random() * 100000, 0),
                    type: RoCode.EV3.motorMovementTypes.Power,
                    power: value,
                };
                return script.callReturn();
            },
        },
        ev3_motor_power_on_time: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['A', 'A'],
                        ['B', 'B'],
                        ['C', 'C'],
                        ['D', 'D'],
                    ],
                    value: 'A',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
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
                        type: 'number',
                        params: ['2'],
                    },
                    {
                        type: 'number',
                        params: ['50'],
                    },
                ],
                type: 'ev3_motor_power_on_time',
            },
            paramsKeyMap: {
                PORT: 0,
                TIME: 1,
                VALUE: 2,
            },
            class: 'ev3_output',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                var sq = RoCode.hw.sendQueue;
                var port = script.getStringField('PORT', script);
                if (!script.isStart) {
                    var time = script.getValue('TIME', script);
                    var value = script.getValue('VALUE', script);
                    script.isStart = true;
                    script.timeFlag = 1;
                    RoCode.hw.sendQueue[port] = {
                        id: Math.floor(Math.random() * 100000, 0),
                        type: RoCode.EV3.motorMovementTypes.Power,
                        power: value,
                    };
                    var timeValue = time * 1000;
                    var timer = setTimeout(function() {
                        script.timeFlag = 0;
                        RoCode.EV3.removeTimeout(timer);
                    }, timeValue);
                    RoCode.EV3.timeouts.push(timer);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    delete script.isStart;
                    delete script.timeFlag;
                    RoCode.engine.isContinue = false;
                    RoCode.hw.sendQueue[port] = {
                        id: Math.floor(Math.random() * 100000, 0),
                        type: RoCode.EV3.motorMovementTypes.Power,
                        power: 0,
                    };
                    return script.callReturn();
                }
            },
        },
        ev3_touch_sensor: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'ev3_touch_sensor',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ev3_sensor',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var portData = RoCode.hw.getDigitalPortValue(script.getNumberField('PORT', script));
                var result = false;
                if (portData.type == RoCode.EV3.deviceTypes.Touch) {
                    if (Number(portData.siValue) >= 1) {
                        result = true;
                    }
                }

                return result;
            },
        },
        ev3_button_pressed: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['위', 'UP'],
                        ['아래', 'DOWN'],
                        ['왼쪽', 'LEFT'],
                        ['오른쪽', 'RIGHT'],
                        ['가운데', 'ENTER'],
                        ['뒤로', 'BACK'],
                    ],
                    value: 'UP',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'ev3_button_pressed',
            },
            paramsKeyMap: {
                BUTTON: 0,
            },
            class: 'ev3_sensor',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                const buttonValue = script.getStringField('BUTTON', script);
                var buttonData = RoCode.hw.getDigitalPortValue(buttonValue);
                var result = false;
                if (buttonData.pressed) {
                    return true;
                }

                return result;
            },
        },
        ev3_status_led: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['주황', 'ORANGE'],
                        ['끄기', 'OFF'],
                        ['초록', 'GREEN'],
                        ['빨강', 'RED'],
                        ['초록 깜박임', 'GREEN_FLASH'],
                        ['빨강 깜박임', 'RED_FLASH'],
                        ['주황 깜박임', 'ORANGE_FLASH'],
                        ['초록 진동', 'GREEN_PULSE'],
                        ['빨강 진동', 'RED_PULSE'],
                        ['주황 진동', 'ORANGE_PULSE'],
                    ],
                    value: 'ORANGE',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
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
                type: 'ev3_status_led',
            },
            paramsKeyMap: {
                COLOR: 0,
            },
            class: 'ev3_output',
            isNotFor: ['EV3'],
            func: function(sprite, script) {
                RoCode.hw.sendQueue.STATUS_COLOR = script.getStringField('COLOR', script);
            },
        },
        //endregion ev3 이브이3
    };
};

module.exports = RoCode.EV3;
