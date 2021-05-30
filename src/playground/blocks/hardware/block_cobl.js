'use strict';

RoCode.Cobl = {
    id: '1.A',
    name: 'cobl',
    url: 'http://www.cobl.co.kr/',
    imageName: 'cobl.png',
    title: {
        ko: '코블',
        en: 'Cobl',
    },
    setZero: function() {
        for (var port = 0; port < 14; port++) {
            RoCode.hw.sendQueue[port] = 0;
        }
        RoCode.hw.update();
    },
};
RoCode.Cobl.blockMenuBlocks = [
    'cobl_read_ultrason',
    'cobl_read_potenmeter',
    'cobl_read_irread1',
    'cobl_read_irread2',
    'cobl_read_joyx',
    'cobl_read_joyy',
    //"cobl_read_sens1",
    //"cobl_read_sens2",
    'cobl_read_tilt',
    'cobl_read_temps',
    'cobl_read_light',
    'cobl_read_btn',
    'cobl_led_control',
    'cobl_rgb_boardled',
    'cobl_servo_angle_control',
    'cobl_melody',
    'cobl_dcmotor',
    'cobl_extention_port',
    'cobl_external_RainBowled',
    'cobl_external_led',
    'cobl_7_segment',
];
RoCode.Cobl.setLanguage = function() {
    return {
        ko: {
            Menus: {
                cobl: '코블',
            },
        },
        en: {
            Menus: {
                cobl: 'Cobl',
            },
        },
    };
};
RoCode.Cobl.getBlocks = function() {
    return {
        //region cobl 코블
        cobl_read_ultrason: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '1. 초음파거리(0~400)',
            def: {
                type: 'cobl_read_ultrason',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('ultrason');
            },
        },
        cobl_read_potenmeter: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '2.가변저항(0~1023)',
            def: {
                type: 'cobl_read_potenmeter',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('potenmeter');
            },
        },
        cobl_read_irread1: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '3.적외선센서1(0~1023)',
            def: {
                type: 'cobl_read_irread1',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('irread1');
            },
        },
        cobl_read_irread2: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '4.적외선센서2(0~1023)',
            def: {
                type: 'cobl_read_irread2',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('irread2');
            },
        },
        cobl_read_joyx: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '5.조이스틱X축(1, 0, -1)',
            def: {
                type: 'cobl_read_joyx',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('joyx');
            },
        },
        cobl_read_joyy: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '6.조이스틱Y축(1, 0, -1)',
            def: {
                type: 'cobl_read_joyy',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('joyy');
            },
        },
        cobl_read_tilt: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '7.기울기센서(0~4)',
            def: {
                type: 'cobl_read_tilt',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('tilt');
            },
        },
        cobl_read_color: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '8.색상센서',
            def: {
                type: 'cobl_read_color',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var colorval = RoCode.hw.getAnalogPortValue('color');

                if (colorval == 1) return '빨강';
                else if (colorval == 2) return '녹색';
                else if (colorval == 3) return '파랑';
                else return '알수없음';
            },
        },
        cobl_read_humid: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '9.습도센서',
            def: {
                type: 'cobl_read_humid',
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                return RoCode.hw.getAnalogPortValue('humid');
            },
        },
        cobl_read_temps: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '10.온도센서@포트%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            def: {
                params: ['1'],
                type: 'cobl_read_temps',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                //    console.log("-----temptest------")
                var signal = script.getField('VALUE', script);
                if (signal == 1) {
                    //    console.log("-----temp1 selected ");
                    return RoCode.hw.getAnalogPortValue('temps1');
                }

                if (signal == 2) {
                    //     console.log("-----temp2 selected ");
                    return RoCode.hw.getAnalogPortValue('temps2');
                }
            },
        },
        cobl_read_light: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            template: '11.빛센서@포트%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            def: {
                params: ['1'],
                type: 'cobl_read_light',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var signal = script.getField('VALUE', script);
                if (signal == 1) {
                    return RoCode.hw.getAnalogPortValue('light1');
                }

                if (signal == 2) {
                    return RoCode.hw.getAnalogPortValue('light2');
                }
            },
        },
        cobl_read_btn: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            template: '12.버튼스위치@포트%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            def: {
                params: ['1'],
                type: 'cobl_read_btn',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var signal = script.getField('VALUE', script);
                if (signal == 1) {
                    return RoCode.hw.getDigitalPortValue('btn1');
                }

                if (signal == 2) {
                    return RoCode.hw.getDigitalPortValue('btn2');
                }
            },
        },
        cobl_led_control: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '13-1.무지개LED%1%2 %3',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['OFF', 'OFF'],
                        ['빨강', 'Red'],
                        ['주황', 'Orange'],
                        ['노랑', 'Yellow'],
                        ['초록', 'Green'],
                        ['파랑', 'Blue'],
                        ['남색', 'Dark Blue'],
                        ['보라', 'Purple'],
                        ['흰색', 'White'],
                    ],
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
            def: {
                params: ['1', 'OFF'],
                type: 'cobl_led_control',
            },
            paramsKeyMap: {
                PORT: 0,
                OPERATOR: 1,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                var value = script.getStringField('OPERATOR');
                RoCode.hw.setDigitalPortValue('RainBowLED_' + port, value);
                RoCode.hw.update();
                delete RoCode.hw.sendQueue['RainBowLED_' + port];
                return script.callReturn();
            },
        },
        cobl_rgb_boardled: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '13-2.무지개LED%1R%2G%3B%4 %5',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                        ['8', '8'],
                        ['9', '9'],
                        ['10', '10'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                        ['8', '8'],
                        ['9', '9'],
                        ['10', '10'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                        ['8', '8'],
                        ['9', '9'],
                        ['10', '10'],
                    ],
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
            def: {
                params: ['1', '1', '1', '1'],
                type: 'cobl_rgb_boardled',
            },
            paramsKeyMap: {
                LED: 0,
                RED: 1,
                GREEN: 2,
                BLUE: 3,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var led = script.getNumberField('LED');
                var r = script.getStringField('RED');
                var g = script.getStringField('GREEN');
                var b = script.getStringField('BLUE');

                RoCode.hw.setDigitalPortValue('BLED_IDX', led);
                RoCode.hw.setDigitalPortValue('BLED_R', r);
                RoCode.hw.setDigitalPortValue('BLED_G', g);
                RoCode.hw.setDigitalPortValue('BLED_B', b);
                RoCode.hw.update();

                delete RoCode.hw.sendQueue['BLED_IDX'];
                delete RoCode.hw.sendQueue['BLED_R'];
                delete RoCode.hw.sendQueue['BLED_G'];
                delete RoCode.hw.sendQueue['BLED_B'];

                return script.callReturn();
            },
        },
        cobl_servo_angle_control: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '14.각도모터 각도%1(15~165) %2',
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
            def: {
                params: ['90'],
                type: 'cobl_servo_angle_control',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var value = script.getNumberValue('VALUE');
                value = Math.round(value);
                value = Math.max(value, 15);
                value = Math.min(value, 165);

                RoCode.hw.setDigitalPortValue('Servo1', value);
                RoCode.hw.update();
                delete RoCode.hw.sendQueue['Servo1'];

                return script.callReturn();
            },
        },
        cobl_melody: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '15.멜로디%1 시간%2(초) %3',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['(낮은)솔', 'L_So'],
                        ['(낮은)솔#', 'L_So#'],
                        ['(낮은)라', 'L_La'],
                        ['(낮은)라#', 'L_La#'],
                        ['(낮은)시', 'L_Ti'],
                        ['도', 'Do'],
                        ['도#', 'Do#'],
                        ['레', 'Re'],
                        ['레#', 'Re#'],
                        ['미', 'Mi'],
                        ['파', 'Fa'],
                        ['파#', 'Fa#'],
                        ['솔', 'So'],
                        ['솔#', 'So#'],
                        ['라', 'La'],
                        ['라#', 'La#'],
                        ['시', 'Ti'],
                        ['(높은)도', 'H_Do'],
                        ['(높은)도#', 'H_Do#'],
                        ['(높은)레', 'H_Re'],
                        ['(높은)레#', 'H_Re#'],
                        ['(높은)미', 'H_Mi'],
                        ['(높은)파', 'H_Fa'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                    value: 1,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            def: {
                params: ['Do', '1'],
                type: 'cobl_melody',
            },
            paramsKeyMap: {
                MELODY: 0,
                DURATION: 1,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var melody = script.getStringField('MELODY');
                var duration = script.getNumberValue('DURATION');

                RoCode.hw.setDigitalPortValue('Melody', melody);
                RoCode.hw.setDigitalPortValue('Melody_DUR', duration);

                RoCode.hw.update();
                delete RoCode.hw.sendQueue['Melody'];
                delete RoCode.hw.sendQueue['Melody_DUR'];

                return script.callReturn();
            },
        },
        cobl_dcmotor: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '16.회전모터%1%2속도%3 %4',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['1.시계방향', '1'],
                        ['2.반시계방향', '2'],
                        ['3.정지', '3'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                    ],
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
            def: {
                params: ['1', '1', '1'],
                type: 'cobl_dcmotor',
            },
            paramsKeyMap: {
                MOTOR: 0,
                DIRECTION: 1,
                SPEED: 2,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var motor = script.getStringField('MOTOR');
                var direction = script.getStringField('DIRECTION');
                var speed = script.getStringField('SPEED');

                if (motor == 1) {
                    RoCode.hw.setDigitalPortValue('DC1_DIR', direction);
                    RoCode.hw.setDigitalPortValue('DC1_SPEED', speed);
                    RoCode.hw.update();
                    delete RoCode.hw.sendQueue['DC1_DIR'];
                    delete RoCode.hw.sendQueue['DC1_SPEED'];
                }

                if (motor == 2) {
                    RoCode.hw.setDigitalPortValue('DC2_DIR', direction);
                    RoCode.hw.setDigitalPortValue('DC2_SPEED', speed);
                    RoCode.hw.update();
                    delete RoCode.hw.sendQueue['DC2_DIR'];
                    delete RoCode.hw.sendQueue['DC2_SPEED'];
                }

                return script.callReturn();
            },
        },
        cobl_extention_port: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '17.USB포트%1단계%2 %3',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                    ],
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
            def: {
                params: ['1', '0'],
                type: 'cobl_extention_port',
            },
            paramsKeyMap: {
                PORT: 0,
                LEVEL: 1,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                var level = script.getStringField('LEVEL');

                if (port == 1) {
                    RoCode.hw.setDigitalPortValue('EXUSB1', level);
                    RoCode.hw.update();
                    delete RoCode.hw.sendQueue['EXUSB1'];
                }

                if (port == 2) {
                    RoCode.hw.setDigitalPortValue('EXUSB2', level);
                    RoCode.hw.update();
                    delete RoCode.hw.sendQueue['EXUSB2'];
                }
                return script.callReturn();
            },
        },
        cobl_external_RainBowled: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '18-1.외부LED%1 (1~64)%2 %3',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    value: 0,
                    fontSize: 11,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['OFF', 'OFF'],
                        ['빨강', 'Red'],
                        ['주황', 'Orange'],
                        ['노랑', 'Yellow'],
                        ['초록', 'Green'],
                        ['파랑', 'Blue'],
                        ['남색', 'Dark Blue'],
                        ['보라', 'Purple'],
                        ['흰색', 'White'],
                    ],
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
            def: {
                params: ['1', 'OFF'],
                type: 'cobl_external_RainBowled',
            },
            paramsKeyMap: {
                PORT: 0,
                OPERATOR: 1,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var led = script.getNumberValue('PORT');
                var value = script.getStringField('OPERATOR');

                RoCode.hw.setDigitalPortValue('ELED_IDX', led);

                if (value == 'OFF') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 0);
                    RoCode.hw.setDigitalPortValue('ELED_G', 0);
                    RoCode.hw.setDigitalPortValue('ELED_B', 0);
                } else if (value == 'Red') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 10);
                    RoCode.hw.setDigitalPortValue('ELED_G', 0);
                    RoCode.hw.setDigitalPortValue('ELED_B', 0);
                } else if (value == 'Orange') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 10);
                    RoCode.hw.setDigitalPortValue('ELED_G', 3);
                    RoCode.hw.setDigitalPortValue('ELED_B', 0);
                } else if (value == 'Yellow') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 10);
                    RoCode.hw.setDigitalPortValue('ELED_G', 10);
                    RoCode.hw.setDigitalPortValue('ELED_B', 0);
                } else if (value == 'Green') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 0);
                    RoCode.hw.setDigitalPortValue('ELED_G', 10);
                    RoCode.hw.setDigitalPortValue('ELED_B', 0);
                } else if (value == 'Blue') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 0);
                    RoCode.hw.setDigitalPortValue('ELED_G', 0);
                    RoCode.hw.setDigitalPortValue('ELED_B', 10);
                } else if (value == 'Dark Blue') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 0);
                    RoCode.hw.setDigitalPortValue('ELED_G', 7);
                    RoCode.hw.setDigitalPortValue('ELED_B', 10);
                } else if (value == 'Purple') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 10);
                    RoCode.hw.setDigitalPortValue('ELED_G', 0);
                    RoCode.hw.setDigitalPortValue('ELED_B', 10);
                } else if (value == 'White') {
                    RoCode.hw.setDigitalPortValue('ELED_R', 10);
                    RoCode.hw.setDigitalPortValue('ELED_G', 10);
                    RoCode.hw.setDigitalPortValue('ELED_B', 10);
                }
                RoCode.hw.update();

                delete RoCode.hw.sendQueue['ELED_IDX'];
                delete RoCode.hw.sendQueue['ELED_R'];
                delete RoCode.hw.sendQueue['ELED_G'];
                delete RoCode.hw.sendQueue['ELED_B'];
            },
        },
        cobl_external_led: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '18-2.외부LED%1(1~64)R%2G%3B%4 %5',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    value: 0,
                    fontSize: 11,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                        ['8', '8'],
                        ['9', '9'],
                        ['10', '10'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                        ['8', '8'],
                        ['9', '9'],
                        ['10', '10'],
                    ],
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['0', '0'],
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                        ['8', '8'],
                        ['9', '9'],
                        ['10', '10'],
                    ],
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
            def: {
                params: ['1', '1', '1', '1'],
                type: 'cobl_external_led',
            },
            paramsKeyMap: {
                LED: 0,
                RED: 1,
                GREEN: 2,
                BLUE: 3,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var led = script.getNumberValue('LED');
                var r = script.getStringField('RED');
                var g = script.getStringField('GREEN');
                var b = script.getStringField('BLUE');

                RoCode.hw.setDigitalPortValue('ELED_IDX', led);
                RoCode.hw.setDigitalPortValue('ELED_R', r);
                RoCode.hw.setDigitalPortValue('ELED_G', g);
                RoCode.hw.setDigitalPortValue('ELED_B', b);
                RoCode.hw.update();

                delete RoCode.hw.sendQueue['ELED_IDX'];
                delete RoCode.hw.sendQueue['ELED_R'];
                delete RoCode.hw.sendQueue['ELED_G'];
                delete RoCode.hw.sendQueue['ELED_B'];

                return script.callReturn();
            },
        },
        cobl_7_segment: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            template: '19.숫자전광판%1(0~9999) %2',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    value: 0,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            def: {
                params: ['0'],
                type: 'cobl_7_segment',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'cobl',
            isNotFor: ['cobl'],
            func: function(sprite, script) {
                var value = script.getNumberValue('VALUE');
                var value_s = value.toString();
                var value_c = value_s.substring(0, 4);
                RoCode.hw.setDigitalPortValue('7SEG', value_c);
                RoCode.hw.update();
                delete RoCode.hw.sendQueue['7SEG'];
                return script.callReturn();
            },
        },
        //endregion cobl 코블
    };
};

module.exports = RoCode.Cobl;
