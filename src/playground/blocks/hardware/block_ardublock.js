'use strict';

RoCode.ardublock = {
    id: '1.8',
    name: 'ardublock',
    url: 'http://www.jkelec.co.kr/',
    imageName: 'ardublock.png',
    title: {
        ko: 'μλλΈλ­',
        en: 'ardublock',
    },
    setZero: function() {
        if (!RoCode.hw.sendQueue.SET) {
            RoCode.hw.sendQueue = {
                GET: {},
                SET: {},
            };
        } else {
            var keySet = Object.keys(RoCode.hw.sendQueue.SET);
            keySet.forEach(function(key) {
                RoCode.hw.sendQueue.SET[key].data = 0;
                RoCode.hw.sendQueue.SET[key].time = new Date().getTime();
            });
        }
        RoCode.hw.update();
    },
    sensorTypes: {
        ALIVE: 0,
        DIGITAL: 1,
        ANALOG: 2,
        PWM: 3,
        SERVO_PIN: 4,
        TONE: 5,
        PULSEIN: 6,
        ULTRASONIC: 7,
        TIMER: 8,
        MOTOR_LEFT: 9,
        MOTOR_RIGHT: 10,
    },
    toneTable: {
        '0': 0,
        C: 1,
        CS: 2,
        D: 3,
        DS: 4,
        E: 5,
        F: 6,
        FS: 7,
        G: 8,
        GS: 9,
        A: 10,
        AS: 11,
        B: 12,
    },
    toneMap: {
        '1': [33, 65, 131, 262, 523, 1046, 2093, 4186],
        '2': [35, 69, 139, 277, 554, 1109, 2217, 4435],
        '3': [37, 73, 147, 294, 587, 1175, 2349, 4699],
        '4': [39, 78, 156, 311, 622, 1245, 2849, 4978],
        '5': [41, 82, 165, 330, 659, 1319, 2637, 5274],
        '6': [44, 87, 175, 349, 698, 1397, 2794, 5588],
        '7': [46, 92, 185, 370, 740, 1480, 2960, 5920],
        '8': [49, 98, 196, 392, 784, 1568, 3136, 6272],
        '9': [52, 104, 208, 415, 831, 1661, 3322, 6645],
        '10': [55, 110, 220, 440, 880, 1760, 3520, 7040],
        '11': [58, 117, 233, 466, 932, 1865, 3729, 7459],
        '12': [62, 123, 247, 494, 988, 1976, 3951, 7902],
    },
    directionTable: {
        Forward: 0,
        Backward: 1,
    },
    highList: ['high', '1', 'on'],
    lowList: ['low', '0', 'off'],
    BlockState: {},
};

RoCode.ardublock.blockMenuBlocks = [
    'ardublock_get_analog_value',
    'ardublock_get_analog_value_map',
    'ardublock_get_ultrasonic_value',
    'ardublock_get_digital',
    'ardublock_toggle_led',
    'ardublock_digital_pwm',
    'ardublock_set_servo',
    'ardublock_set_tone',
    'ardublock_set_left_motor',
    'ardublock_set_right_motor',
    'ardublock_get_left_cds_analog_value',
    'ardublock_get_right_cds_analog_value',
    'ardublock_toggle_left_led',
    'ardublock_toggle_right_led',
    'ardublock_get_sound_analog_value',
];

RoCode.ardublock.setLanguage = function() {
    return {
        ko: {
            template: {
                ardublock_get_number_sensor_value: 'μλ λ‘κ·Έ %1 λ² μΌμκ°  ',
                ardublock_get_digital_value: 'λμ§νΈ %1 λ² μΌμκ°  ',
                ardublock_toggle_pwm: 'λμ§νΈ %1 λ² νμ %2 (μΌ)λ‘ μ νκΈ° %3',
                ardublock_convert_scale: '%1 κ°μ λ²μλ₯Ό %2 ~ %3 μμ %4 ~ %5 (μΌ)λ‘ λ°κΎΌκ°  ',
                ardublock_digital_pwm: 'λμ§νΈ %1 λ² νμ %2 (μΌ)λ‘ μ νκΈ° %3',
                ardublock_get_analog_value: 'μλ λ‘κ·Έ %1 λ² μΌμκ°',
                ardublock_get_analog_value_map: '%1 μ λ²μλ₯Ό %2 ~ %3 μμ %4 ~ %5 λ‘ λ°κΎΌκ°',
                ardublock_get_digital: 'λμ§νΈ %1 λ² μΌμκ°',
                ardublock_get_left_cds_analog_value: 'μΌμͺ½ μ‘°λμΌμ %1 μΌμκ°',
                ardublock_get_right_cds_analog_value: 'μ€λ₯Έμͺ½ μ‘°λμΌμ %1 μΌμκ°',
                ardublock_get_sound_analog_value: 'μ¬μ΄λ(μλ¦¬) μΌμ %1 μΌμκ°',
                ardublock_get_ultrasonic_value: 'μ΄μνμΌμ Trig %1 Echo %2 μΌμκ°',
                ardublock_set_left_motor: 'μΌμͺ½λͺ¨ν°λ₯Ό %1 μΌλ‘ %2 νμ  μλλ‘ μ νκΈ° %3',
                ardublock_set_right_motor: 'μ€λ₯Έμͺ½λͺ¨ν°λ₯Ό %1 μΌλ‘ %2 νμ  μλλ‘ μ νκΈ° %3',
                ardublock_set_servo: 'λμ§νΈ %1 λ² νμ μλ³΄λͺ¨ν°λ₯Ό %2 μ κ°λλ‘ μ νκΈ° %3',
                ardublock_set_tone: 'λμ§νΈ %1 λ² νμ λ²μ λ₯Ό %2 %3 μμΌλ‘ %4 μ΄ μ°μ£ΌνκΈ° %5',
                ardublock_toggle_led: 'λμ§νΈ %1 λ² ν %2 %3',
                ardublock_toggle_left_led: 'μΌμͺ½ λΌμ΄νΈ %1 λ² ν %2 %3',
                ardublock_toggle_right_led: 'μ€λ₯Έμͺ½ λΌμ΄νΈ %1 λ² ν %2 %3',
            },
            Blocks: {
                ardublock_motor_forward: 'μ',
                ardublock_motor_backward: 'λ€',
            },
            Menus: {
                ardublock: 'μλλΈλ­',
            },
        },
        en: {
            template: {
                ardublock_get_number_sensor_value: 'Analog %1 Sensor value  ',
                ardublock_get_digital_value: 'Digital %1 Sensor value  ',
                ardublock_toggle_pwm: 'Digital %1 Pin %2 %3',
                ardublock_convert_scale: 'Map Value %1 %2 ~ %3 to %4 ~ %5  ',
                ardublock_digital_pwm: 'Digital %1 Pin %2 %3',
                ardublock_get_analog_value: 'Analog %1 Sensor value',
                ardublock_get_analog_value_map: 'Map Value %1 %2 ~ %3 to %4 ~ %5',
                ardublock_get_digital: 'Digital %1 Sensor value',
                ardublock_get_left_cds_analog_value: 'Left CDS %1 Sensor value',
                ardublock_get_right_cds_analog_value: 'Left CDS  %1 Sensor value',
                ardublock_get_sound_analog_value: 'Analog Sound %1 Sensor value',
                ardublock_get_ultrasonic_value: 'Read ultrasonic sensor trig pin %1 echo pin %2',
                ardublock_set_left_motor: 'Left motor direction to %1 speed %2 set %3',
                ardublock_set_right_motor: 'Right motor direction to %1 speed %2 set %3',
                ardublock_set_servo: 'Set servo pin %1 angle as %2 %3',
                ardublock_set_tone: 'Play tone pin %1 on note %2 octave %3 beat %4 %5',
                ardublock_toggle_led: 'Digital %1 Pin %2 %3',
                ardublock_toggle_left_led: 'Left Light %1 Pin %2 %3',
                ardublock_toggle_right_led: 'Right Light %1 Pin %2 %3',
            },
            Blocks: {
                ardublock_motor_forward: 'Forward',
                ardublock_motor_backward: 'Backward',
            },
            Menus: {
                ardublock: 'ardublock',
            },
        },
    };
};

RoCode.ardublock.getBlocks = function() {
    return {
        //region ardublock μλλΈλ‘
        ardublock_analog_list: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['A0', '0'],
                        ['A1', '1'],
                        ['A2', '2'],
                        ['A3', '3'],
                        ['A4', '4'],
                        ['A5', '5'],
                    ],
                    value: '0',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                PORT: 0,
            },
            func: function(sprite, script) {
                return script.getField('PORT');
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_analog_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_analog_list',
                    },
                ],
                type: 'ardublock_get_analog_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getValue('PORT', script);
                var ANALOG = RoCode.hw.portData.ANALOG;
                if (port[0] === 'A') port = port.substring(1);
                return ANALOG ? ANALOG[port] || 0 : 0;
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_analog_value_map: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
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
                    {
                        type: 'ardublock_get_analog_value',
                        params: [
                            {
                                type: 'arduino_ext_analog_list',
                            },
                        ],
                    },
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
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['100'],
                    },
                ],
                type: 'ardublock_get_analog_value_map',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE2: 1,
                VALUE3: 2,
                VALUE4: 3,
                VALUE5: 4,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var result = script.getValue('PORT', script);
                var ANALOG = RoCode.hw.portData.ANALOG;
                var value2 = script.getNumberValue('VALUE2', script);
                var value3 = script.getNumberValue('VALUE3', script);
                var value4 = script.getNumberValue('VALUE4', script);
                var value5 = script.getNumberValue('VALUE5', script);

                if (value2 > value3) {
                    var swap = value2;
                    value2 = value3;
                    value3 = swap;
                }
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

                return result;
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_ultrasonic_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
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
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['13'],
                    },
                    {
                        type: 'arduino_get_port_number',
                        params: ['12'],
                    },
                ],
                type: 'ardublock_get_ultrasonic_value',
            },
            paramsKeyMap: {
                PORT1: 0,
                PORT2: 1,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port1 = script.getNumberValue('PORT1', script);
                var port2 = script.getNumberValue('PORT2', script);

                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }
                delete RoCode.hw.sendQueue['SET'][port1];
                delete RoCode.hw.sendQueue['SET'][port2];

                if (!RoCode.hw.sendQueue['GET']) {
                    RoCode.hw.sendQueue['GET'] = {};
                }
                RoCode.hw.sendQueue['GET'][RoCode.ardublock.sensorTypes.ULTRASONIC] = {
                    port: [port1, port2],
                    time: new Date().getTime(),
                };
                return RoCode.hw.portData.ULTRASONIC || 0;
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_digital: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                    },
                ],
                type: 'ardublock_get_digital',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getNumberValue('PORT', script);
                var DIGITAL = RoCode.hw.portData.DIGITAL;
                if (!RoCode.hw.sendQueue['GET']) {
                    RoCode.hw.sendQueue['GET'] = {};
                }
                RoCode.hw.sendQueue['GET'][RoCode.ardublock.sensorTypes.DIGITAL] = {
                    port: port,
                    time: new Date().getTime(),
                };
                return DIGITAL ? DIGITAL[port] || 0 : 0;
            },
            syntax: { js: [], py: [] },
        },
        ardublock_toggle_led: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                    },
                    {
                        type: 'arduino_get_digital_toggle',
                        params: ['on'],
                    },
                    null,
                ],
                type: 'ardublock_toggle_led',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getNumberValue('PORT');
                var value = script.getValue('VALUE');

                if (typeof value === 'string') {
                    value = value.toLowerCase();
                }
                if (RoCode.ardublock.highList.indexOf(value) > -1) {
                    value = 255;
                } else if (RoCode.ardublock.lowList.indexOf(value) > -1) {
                    value = 0;
                } else {
                    throw new Error();
                }
                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }
                RoCode.hw.sendQueue['SET'][port] = {
                    type: RoCode.ardublock.sensorTypes.DIGITAL,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_digital_pwm: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_pwm_port_number',
                    },
                    {
                        type: 'text',
                        params: ['255'],
                    },
                    null,
                ],
                type: 'ardublock_digital_pwm',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getNumberValue('PORT');
                var value = script.getNumberValue('VALUE');
                value = Math.round(value);
                value = Math.max(value, 0);
                value = Math.min(value, 255);
                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }
                RoCode.hw.sendQueue['SET'][port] = {
                    type: RoCode.ardublock.sensorTypes.PWM,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_tone_list: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.silent, '0'],
                        [Lang.Blocks.do_name, 'C'],
                        [Lang.Blocks.do_sharp_name, 'CS'],
                        [Lang.Blocks.re_name, 'D'],
                        [Lang.Blocks.re_sharp_name, 'DS'],
                        [Lang.Blocks.mi_name, 'E'],
                        [Lang.Blocks.fa_name, 'F'],
                        [Lang.Blocks.fa_sharp_name, 'FS'],
                        [Lang.Blocks.sol_name, 'G'],
                        [Lang.Blocks.sol_sharp_name, 'GS'],
                        [Lang.Blocks.la_name, 'A'],
                        [Lang.Blocks.la_sharp_name, 'AS'],
                        [Lang.Blocks.si_name, 'B'],
                    ],
                    value: 'C',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                NOTE: 0,
            },
            func: function(sprite, script) {
                return script.getField('NOTE');
            },
            syntax: { js: [], py: [] },
        },
        ardublock_tone_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'ardublock_tone_list',
                    },
                ],
                type: 'ardublock_tone_value',
            },
            paramsKeyMap: {
                NOTE: 0,
            },
            func: function(sprite, script) {
                return script.getNumberValue('NOTE');
            },
            syntax: { js: [], py: [] },
        },
        ardublock_octave_list: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                    ],
                    value: '3',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                OCTAVE: 0,
            },
            func: function(sprite, script) {
                return script.getField('OCTAVE');
            },
            syntax: { js: [], py: [] },
        },
        ardublock_set_tone: {
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
                        type: 'arduino_get_port_number',
                        value: 4,
                        params: ['11'],
                    },
                    {
                        type: 'ardublock_tone_list',
                    },
                    {
                        type: 'ardublock_octave_list',
                    },
                    {
                        type: 'text',
                        params: ['1'],
                    },
                    null,
                ],
                type: 'ardublock_set_tone',
            },
            paramsKeyMap: {
                PORT: 0,
                NOTE: 1,
                OCTAVE: 2,
                DURATION: 3,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var sq = RoCode.hw.sendQueue;
                var port = script.getNumberValue('PORT', script);

                if (!script.isStart) {
                    var note = script.getValue('NOTE', script);
                    if (!RoCode.Utils.isNumber(note)) note = RoCode.ardublock.toneTable[note];

                    if (note < 0) {
                        note = 0;
                    } else if (note > 12) {
                        note = 12;
                    }

                    var duration = script.getNumberValue('DURATION', script);

                    if (duration < 0) {
                        duration = 0;
                    }

                    if (!sq['SET']) {
                        sq['SET'] = {};
                    }

                    if (duration === 0) {
                        sq['SET'][port] = {
                            type: RoCode.ardublock.sensorTypes.TONE,
                            data: 0,
                            time: new Date().getTime(),
                        };
                        return script.callReturn();
                    }

                    var octave = script.getNumberValue('OCTAVE', script) - 1;
                    if (octave < 0) {
                        octave = 0;
                    } else if (octave > 5) {
                        octave = 5;
                    }

                    var value = 0;

                    if (note != 0) {
                        value = RoCode.ardublock.toneMap[note][octave];
                    }

                    duration = duration * 1000;
                    script.isStart = true;
                    script.timeFlag = 1;

                    sq['SET'][port] = {
                        type: RoCode.ardublock.sensorTypes.TONE,
                        data: {
                            value: value,
                            duration: duration,
                        },
                        time: new Date().getTime(),
                    };

                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration + 32);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    delete script.timeFlag;
                    delete script.isStart;
                    sq['SET'][port] = {
                        type: RoCode.ardublock.sensorTypes.TONE,
                        data: 0,
                        time: new Date().getTime(),
                    };
                    RoCode.engine.isContinue = false;
                    return script.callReturn();
                }
            },
            syntax: { js: [], py: [] },
        },
        ardublock_set_servo: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['10'],
                    },
                    null,
                ],
                type: 'ardublock_set_servo',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var sq = RoCode.hw.sendQueue;
                var port = script.getNumberValue('PORT', script);
                var value = script.getNumberValue('VALUE', script);
                value = Math.min(180, value);
                value = Math.max(0, value);

                if (!sq['SET']) {
                    sq['SET'] = {};
                }
                sq['SET'][port] = {
                    type: RoCode.ardublock.sensorTypes.SERVO_PIN,
                    data: value,
                    time: new Date().getTime(),
                };

                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_motor_direction_list: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ardublock_motor_forward, '0'],
                        [Lang.Blocks.ardublock_motor_backward, '1'],
                    ],
                    value: '0',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                MOTOR_DIRECTION: 0,
            },
            func: function(sprite, script) {
                return script.getField('MOTOR_DIRECTION');
            },
            syntax: { js: [], py: [] },
        },
        ardublock_set_left_motor: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'ardublock_motor_direction_list',
                    },
                    {
                        type: 'text',
                        params: ['100'],
                    },
                    null,
                ],
                type: 'ardublock_set_left_motor',
            },
            paramsKeyMap: {
                MOTOR_DIRECTION: 0,
                MOTOR_SPEED: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                // var sq = RoCode.hw.sendQueue;
                var direction = script.getValue('MOTOR_DIRECTION', script);
                if (!RoCode.Utils.isNumber(direction))
                    direction = RoCode.ardublock.directionTable[direction];

                if (direction < 0) {
                    direction = 0;
                } else if (direction > 1) {
                    direction = 1;
                }

                var speed = script.getNumberValue('MOTOR_SPEED', script) - 1;
                if (speed < 0) {
                    speed = 0;
                } else if (speed > 254) {
                    speed = 254;
                }
                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }

                RoCode.hw.sendQueue['SET'][0] = {
                    type: RoCode.ardublock.sensorTypes.MOTOR_LEFT,
                    data: {
                        direction: direction,
                        speed: speed,
                    },
                    time: new Date().getTime(),
                };

                setTimeout(function() {
                    script.timeFlag = 0;
                }, 10);

                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_set_right_motor: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'ardublock_motor_direction_list',
                    },
                    {
                        type: 'text',
                        params: ['100'],
                    },
                    null,
                ],
                type: 'ardublock_set_right_motor',
            },
            paramsKeyMap: {
                MOTOR_DIRECTION: 0,
                MOTOR_SPEED: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                // var sq = RoCode.hw.sendQueue;
                var direction = script.getValue('MOTOR_DIRECTION', script);
                if (!RoCode.Utils.isNumber(direction))
                    direction = RoCode.ardublock.directionTable[direction];

                if (direction < 0) {
                    direction = 0;
                } else if (direction > 1) {
                    direction = 1;
                }

                var speed = script.getNumberValue('MOTOR_SPEED', script) - 1;
                if (speed < 0) {
                    speed = 0;
                } else if (speed > 254) {
                    speed = 254;
                }

                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }

                RoCode.hw.sendQueue['SET'][1] = {
                    type: RoCode.ardublock.sensorTypes.MOTOR_RIGHT,
                    data: {
                        direction: direction,
                        speed: speed,
                    },
                    time: new Date().getTime(),
                };

                setTimeout(function() {
                    script.timeFlag = 0;
                }, 10);

                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_left_cds_analog_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_analog_list',
                        params: ['0'],
                    },
                ],
                type: 'ardublock_get_left_cds_analog_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getValue('PORT', script);
                var ANALOG = RoCode.hw.portData.ANALOG;
                if (port[0] === 'A') port = port.substring(1);
                return ANALOG ? ANALOG[port] || 0 : 0;
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_right_cds_analog_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_analog_list',
                        params: ['1'],
                    },
                ],
                type: 'ardublock_get_right_cds_analog_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getValue('PORT', script);
                var ANALOG = RoCode.hw.portData.ANALOG;
                if (port[0] === 'A') port = port.substring(1);
                return ANALOG ? ANALOG[port] || 0 : 0;
            },
            syntax: { js: [], py: [] },
        },
        ardublock_toggle_left_led: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['3'],
                    },
                    {
                        type: 'arduino_get_digital_toggle',
                        params: ['on'],
                    },
                    null,
                ],
                type: 'ardublock_toggle_left_led',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getNumberValue('PORT');
                var value = script.getValue('VALUE');

                if (typeof value === 'string') {
                    value = value.toLowerCase();
                }
                if (RoCode.ardublock.highList.indexOf(value) > -1) {
                    value = 255;
                } else if (RoCode.ardublock.lowList.indexOf(value) > -1) {
                    value = 0;
                } else {
                    throw new Error();
                }
                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }
                RoCode.hw.sendQueue['SET'][port] = {
                    type: RoCode.ardublock.sensorTypes.DIGITAL,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_toggle_right_led: {
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['9'],
                    },
                    {
                        type: 'arduino_get_digital_toggle',
                        params: ['on'],
                    },
                    null,
                ],
                type: 'ardublock_toggle_right_led',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ardublock',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getNumberValue('PORT');
                var value = script.getValue('VALUE');

                if (typeof value === 'string') {
                    value = value.toLowerCase();
                }
                if (RoCode.ardublock.highList.indexOf(value) > -1) {
                    value = 255;
                } else if (RoCode.ardublock.lowList.indexOf(value) > -1) {
                    value = 0;
                } else {
                    throw new Error();
                }
                if (!RoCode.hw.sendQueue['SET']) {
                    RoCode.hw.sendQueue['SET'] = {};
                }
                RoCode.hw.sendQueue['SET'][port] = {
                    type: RoCode.ardublock.sensorTypes.DIGITAL,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: { js: [], py: [] },
        },
        ardublock_get_sound_analog_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_analog_list',
                        params: ['2'],
                    },
                ],
                type: 'ardublock_get_sound_analog_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ardublockGet',
            isNotFor: ['ardublock'],
            func: function(sprite, script) {
                var port = script.getValue('PORT', script);
                var ANALOG = RoCode.hw.portData.ANALOG;
                if (port[0] === 'A') port = port.substring(1);
                return ANALOG ? ANALOG[port] || 0 : 0;
            },
            syntax: { js: [], py: [] },
        },
        //endregion ardublock μλλΈλ‘
    };
};

module.exports = RoCode.ardublock;
