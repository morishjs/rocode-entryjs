'use strict';

RoCode.sciencecube = {
    id: '25.1',
    name: 'sciencecube',
    url: 'http://www.koreadigital.com/kr/main.asp',
    imageName: 'sciencecube.png',
    value: {},
    title: {
        'ko': '사이언스큐브',
        'en': 'sciencecube',
    },
    setZero: function() {},
    dataHandler: function(data) {

        RoCode.hw.sendQueue.data = {};

        if (data['tempData']) {
            this.value['tempData'] = data['tempData'];
        } else if (data['pressueData']) {
            this.value['pressueData'] = data['pressueData'];
        } else if (data['currentData']) {
            this.value['currentData'] = data['currentData'];
        } else if (data['voltageData']) {
            this.value['voltageData'] = data['voltageData'];
        } else if (data['phData']) {
            this.value['phData'] = data['phData'];
        } else if (data['motionData']) {
            this.value['motionData'] = data['motionData'];
        } else if (data['forceData']) {
            this.value['forceData'] = data['forceData'];
        }
    },
};
RoCode.sciencecube.setLanguage = () => {
    return {
        ko: {
            template: {
                sciencecube_temper: '온도 센서값',
                sciencecube_current: '전류 센서값',
                sciencecube_pressue: '압력 센서값',
                sciencecube_voltage: '전압 센서값',
                sciencecube_ph: 'ph 센서값',
                sciencecube_force: '힘 센서값',
                sciencecube_motion: '운동 센서값',
            },
        },
        en: {
            template: {
                sciencecube_temper: 'temper sensor',
                sciencecube_current: 'current sensor',
                sciencecube_pressue: 'pressue sensor',
                sciencecube_voltage: 'voltage sensor',
                sciencecube_ph: 'ph sensor',
                sciencecube_force: 'force sensor',
                sciencecube_motion: 'motion sensor',
            },
        },
    };
};

RoCode.sciencecube.blockMenuBlocks = [
    //sciencecube start
    'sciencecube_temper',
    'sciencecube_voltage',
    'sciencecube_current',
    'sciencecube_pressue',
    'sciencecube_ph',
    'sciencecube_force',
    'sciencecube_motion',
    //sciencecube end
];

RoCode.sciencecube.getBlocks = () => {
    return {
        sciencecube_temper: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: '온도 센서값',
            }, ],
            def: {
                type: 'sciencecube_temper',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['tempData']) {
                    return RoCode.sciencecube.value['tempData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
        sciencecube_current: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: '전류 센서값',
            }, ],
            def: {
                type: 'sciencecube_current',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['currentData']) {
                    return RoCode.sciencecube.value['currentData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
        sciencecube_pressue: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: '압력 센서값',
            }, ],
            def: {
                type: 'sciencecube_pressue',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['pressueData']) {
                    return RoCode.sciencecube.value['pressueData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
        sciencecube_voltage: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: '전압 센서값',
            }, ],
            def: {
                type: 'sciencecube_voltage',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['voltageData']) {
                    return RoCode.sciencecube.value['voltageData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
        sciencecube_ph: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: 'ph 센서값',
            }, ],
            def: {
                type: 'sciencecube_ph',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['phData']) {
                    return RoCode.sciencecube.value['phData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
        sciencecube_force: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: '힘 센서값',
            }, ],
            def: {
                type: 'sciencecube_force',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['forceData']) {
                    return RoCode.sciencecube.value['forceData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
        sciencecube_motion: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'Text',
                text: '운동 센서값',
            }, ],
            def: {
                type: 'sciencecube_motion',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'sciencecubeBlock',
            isNotFor: ['sciencecube'],
            func: function(sprite, script) {
                RoCode.hw.update();
                if (RoCode.sciencecube.value['motionData']) {
                    return RoCode.sciencecube.value['motionData'].toFixed(2);
                } else return '현재 센서와 다릅니다. 다시 연결해주세요.';
            },
        },
    };
};

module.exports = RoCode.sciencecube;
