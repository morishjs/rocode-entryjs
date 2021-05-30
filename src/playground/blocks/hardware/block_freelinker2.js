'use strict';

RoCode.freelinker = {
    id: '25.2',
    name: 'freelinker2',
    url: 'http://www.koreadigital.com/kr/main.asp',
    imageName: 'FreeLinker2.png',
    title: {
        'ko': '프리링커2',
        'en': 'freelinker2',
    },
    /*setZero: function() {

        RoCode.hw.sendQueue['data'] = 0;

        RoCode.hw.update();


    },*/
};
RoCode.freelinker.setLanguage = () => {
    return {
        ko: {
            template: {
                A_channel: 'A_channel',
                B_channel: 'B_channel',
                C_channel: 'C_channel',
                D_channel: 'D_channel',
            },
        },
        en: {
            template: {
                A_channel: 'A_channel',
                B_channel: 'B_channel',
                C_channel: 'C_channel',
                D_channel: 'D_channel',
            },
        },
    };
};

RoCode.freelinker.blockMenuBlocks = [
    //sciencecube start
    'A_channel',
    'B_channel',
    'C_channel',
    'D_channel',
    //sciencecube end
];

RoCode.freelinker.getBlocks = () => {
    return {
        A_channel: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'A_channel',
                text: 'A채널',
            }, ],
            def: {
                type: 'A_channel',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'FreeLinker2',
            isNotFor: ['freelinker2'],
            func: function(sprite, script) {
                RoCode.hw.update();
                RoCode.hw.sendQueue['data'] = 'A';
                var result = RoCode.hw.portData['A'];

                result /= 10000;

                if (result < 0) {
                    result = 0;
                }

                return result;
            },
        },
        B_channel: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'B_channel',
                text: 'B채널',
            }, ],
            def: {
                type: 'B_channel',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'FreeLinker2',
            isNotFor: ['freelinker2'],
            func: function(sprite, script) {
                RoCode.hw.update();
                RoCode.hw.sendQueue['data'] = 'B';
                var result = RoCode.hw.portData['B'];

                result /= 10000;

                if (result < 0) {
                    result = 0;
                }

                return result;
            },
        },
        C_channel: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'C_channel',
                text: 'C채널',
            }, ],
            def: {
                type: 'C_channel',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'FreeLinker2',
            isNotFor: ['freelinker2'],
            func: function(sprite, script) {
                RoCode.hw.update();
                RoCode.hw.sendQueue['data'] = 'C';
                var result = RoCode.hw.portData['C'];

                result /= 10000;

                if (result < 0) {
                    result = 0;
                }

                return result;
            },
        },
        D_channel: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [{
                type: 'D_channel',
                text: 'D채널',
            }, ],
            def: {
                type: 'D_channel',
            },
            paramsKeyMap: {
                VALUE: 0,
                sensor: 1,
            },
            events: {},
            class: 'FreeLinker2',
            isNotFor: ['freelinker2'],
            func: function(sprite, script) {
                RoCode.hw.update();
                RoCode.hw.sendQueue['data'] = 'D';
                var result = RoCode.hw.portData['D'];

                result /= 10000;

                if (result < 0) {
                    result = 0;
                }

                return result;
            },
        },
    };
};

module.exports = RoCode.freelinker;
