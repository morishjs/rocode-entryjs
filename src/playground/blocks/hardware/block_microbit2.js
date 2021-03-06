'use strict';

const _set = require('lodash/set');
const _get = require('lodash/get');
const _merge = require('lodash/merge');
const _clamp = require('lodash/clamp');
const { version } = require('@babel/core');

RoCode.Microbit2 = new (class Microbit2 {
    constructor() {
        this.functionKeys = {
            GET_ANALOG: 'get-analog',
            GET_DIGITAL: 'get-digital',
            SET_ANALOG: 'set-analog',
            SET_DIGITAL: 'set-digital',
            SET_LED: 'set-pixel',
            GET_LED: 'get-pixel',
            RESET: 'reset',
            PRESET_IMAGE: 'pre-image',
            SET_CUSTOM_IMAGE: 'custom-image',
            SET_STRING: 'print',
            RESET_SCREEN: 'display-clear',
            DISPLAY_ON: 'display-on',
            DISPLAY_OFF: 'display-off',
            SPEAKER_ON: 'speaker-on',
            SPEAKER_OFF: 'speaker-off',
            PLAY_TONE: 'play-tone',
            PLAY_SOUND: 'pre-sound',
            PLAY_MELODY: 'pre-melody',
            GET_BTN: 'get-btn',
            CHANGE_TEMPO: 'change-tempo',
            GET_LOGO: 'get-touch',
            GET_ACC: 'get-acc',
            GET_GESTURE: 'get-gesture',
            GET_DIRECTION: 'direction',
            GET_FIELD_STRENGTH: 'field-strength',
            GET_FIELD_STRENGTH_AXIS: 'field-axis-strength',
            GET_LIGHT_LEVEL: 'light-level',
            GET_TEMPERATURE: 'temperature',
            GET_SOUND_LEVEL: 'sound-level',
            SET_RADIO: 'radio-send',
            GET_RADIO: 'radio-receive',
            RADIO_ON: 'radio-on',
            RADIO_OFF: 'radio-off',
            SETTING_RADIO: 'radio-setting',
            SET_SERVO_MILLI: 'write-period',
            SET_SERVO_MICRO: 'write-micro-period',
            SET_SERVO_ANGLE: 'servo-write',
        };

        this.presetImage = [
            // Image.HEART
            '09090:99999:99999:09990:00900',
            // Image.HEART_SMALL,
            '00000:09090:09990:00900:00000',
            // Image.HAPPY,
            '00000:09090:00000:90009:09990',
            // Image.SMILE,
            '00000:00000:00000:90009:09990',
            // Image.SAD,
            '00000:09090:00000:09990:90009',
            // Image.CONFUSED,
            '00000:09090:00000:09090:90909',
            // Image.ANGRY,
            '90009:09090:00000:99999:90909',
            // Image.ASLEEP,
            '00000:99099:00000:09990:00000',
            // Image.SURPRISED,
            '09090:00000:00900:09090:00900',
            // Image.SILLY,
            '90009:00000:99999:00909:00999',
            // Image.FABULOUS,
            '99999:99099:00000:09090:09990',
            // Image.MEH,
            '09090:00000:00090:00900:09000',
            // Image.YES,
            '00000:00009:00090:90900:09000',
            // Image.NO,
            '90009:09090:00900:09090:90009',
            // Image.CLOCK1,
            '00090:00090:00900:00000:00000',
            // Image.CLOCK2,
            '00000:00990:00900:00000:00000',
            // Image.CLOCK3,
            '00000:00000:00999:00000:00000',
            // Image.CLOCK4,
            '00000:00000:00900:00990:00000',
            // Image.CLOCK5,
            '00000:00000:00900:00090:00090',
            // Image.CLOCK6,
            '00000:00000:00900:00900:00900',
            // Image.CLOCK7,
            '00000:00000:00900:09000:09000',
            // Image.CLOCK8,
            '00000:00000:00900:99000:00000',
            // Image.CLOCK9,
            '00000:00000:99900:00000:00000',
            // Image.CLOCK10,
            '00000:09900:00900:00000:00000',
            // Image.CLOCK11,
            '09000:09000:00900:00000:00000',
            // Image.CLOCK12,
            '00900:00900:00900:00000:00000',
            // Image.ARROW_N,
            '00900:09990:90909:00900:00900',
            // Image.ARROW_NE,
            '00999:00099:00909:09000:90000',
            // Image.ARROW_E,
            '00900:00090:99999:00090:00900',
            // Image.ARROW_SE,
            '90000:09000:00909:00099:00999',
            // Image.ARROW_S,
            '00900:00900:90909:09990:00900',
            // Image.ARROW_SW,
            '00009:00090:90900:99000:99900',
            // Image.ARROW_W,
            '00900:09000:99999:09000:00900',
            // Image.ARROW_NW,
            '99900:99000:90900:00090:00009',
            // Image.TRIANGLE,
            '00000:00900:09090:99999:00000',
            // Image.TRIANGLE_LEFT,
            '90000:99000:90900:90090:99999',
            // Image.CHESSBOARD,
            '09090:90909:09090:90909:09090',
            // Image.DIAMOND,
            '00900:09090:90009:09090:00900',
            // Image.DIAMOND_SMALL,
            '00000:00900:09090:00900:00000',
            // Image.SQUARE,
            '99999:90009:90009:90009:99999',
            // Image.SQUARE_SMALL,
            '00000:09990:09090:09990:00000',
            // Image.RABBIT,
            '90900:90900:99990:99090:99990',
            // Image.COW,
            '90009:90009:99999:09990:00900',
            // Image.MUSIC_CROTCHET,
            '00900:00900:00900:99900:99900',
            // Image.MUSIC_QUAVER,
            '00900:00990:00909:99900:99900',
            // Image.MUSIC_QUAVERS,
            '09999:09009:09009:99099:99099',
            // Image.PITCHFORK,
            '90909:90909:99999:00900:00900',
            // Image.XMAS,
            '00900:09990:00900:09990:99999',
            // Image.PACMAN,
            '099999:99090:99900:99990:09999',
            // Image.TARGET,
            '00900:09990:99099:09990:00900',
            // Image.TSHIRT,
            '99099:99999:09990:09990:09990',
            // Image.ROLLERSKATE,
            '00099:00099:99999:99999:09090',
            // Image.DUCK,
            '00990:99900:09999:09990:00000',
            // Image.HOUSE,
            '00900:09990:99999:09990:09090',
            // Image.TORTOISE,
            '00000:09990:99999:09090:00000',
            // Image.BUTTERFLY,
            '99099:99999:00900:99999:99099',
            // Image.STICKFIGURE,
            '00900:99999:00900:09090:90009',
            // Image.GHOST,
            '99999:90909:99999:99999:90909',
            // Image.SWORD,
            '00900:00900:00900:09990:00900',
            // Image.GIRAFFE,
            '99000:09000:09000:09990:09090',
            // Image.SKULL,
            '09990:90909:99999:09990:09990',
            // Image.UMBRELLA,
            '09990:99999:00900:90900:09900',
            // Image.SNAKE,
            '99000:99099:09090:09990:00000',
        ];
        this.id = '22.3';
        this.url = 'http://microbit.org/ko/';
        this.imageName = 'microbit2.png';
        this.title = {
            en: 'Microbit v2',
            ko: '?????????????????? v2',
        };
        this.name = 'microbit2';
        this.communicationType = 'manual';
        this.commandStatus = {};
        this.commandValue = {};
        this.digitalPins = [
            ['P8', 8],
            ['P9', 9],
            ['P12', 12],
            ['P13', 13],
            ['P14', 14],
            ['P15', 15],
            ['P16', 16],
        ];
        this.analogPins = [
            ['P0', 0],
            ['P1', 1],
            ['P2', 2],
            ['P3', 3],
            ['P4', 4],
            ['P10', 10],
        ];
        this.majorPins = [
            ['P0', 0],
            ['P1', 1],
            ['P2', 2],
        ];
        this.ledRows = [
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ];
        this.defaultLed = [
            [0, 0, 0, 0, 0],
            [0, 9, 0, 9, 0],
            [0, 0, 0, 0, 0],
            [9, 0, 0, 0, 9],
            [0, 9, 9, 9, 0],
        ];
        this.blockMenuBlocks = [
            'microbit2_common_title',
            'microbit2_get_analog',
            'microbit2_set_analog',
            'microbit2_get_digital',
            'microbit2_set_digital',
            'microbit2_screen_toggle',
            'microbit2_set_led',
            'microbit2_get_led',
            'microbit2_show_preset_image',
            'microbit2_show_custom_image',
            'microbit2_show_string',
            'microbit2_reset_screen',
            'microbit2_radio_toggle',
            'microbit2_radio_setting',
            'microbit2_radio_send',
            'microbit2_radio_received',
            'microbit2_change_tempo',
            'microbit2_set_tone',
            'microbit2_play_preset_music',
            'microbit2_get_btn',
            'microbit2_get_acc',
            'microbit2_get_gesture',
            'microbit2_get_direction',
            'microbit2_get_field_strength_axis',
            'microbit2_get_light_level',
            'microbit2_get_temperature',
            'microbit2_set_servo',
            'microbit2_set_pwm',
            'microbit2_v2_title',
            'microbit2_get_logo',
            'microbit2_speaker_toggle',
            'microbit2_play_sound_effect',
            'microbit2_get_sound_level',
        ];
        this.version = '2';
    }

    setZero() {
        // ????????? ????????? ???????????? ????????? ??????
        this.requestCommand(this.functionKeys.RESET);
        this.commandStatus = {};
        this.commandValue = {};
    }

    // will not use in this module
    requestCommand(type, payload) {
        RoCode.hw.sendQueue = {
            type,
            payload,
        };
        RoCode.hw.update();
    }
    waitMilliSec(milli) {
        this.blockReq = true;
        setTimeout(() => {
            this.blockReq = false;
        }, milli);
    }

    /**
     * command ?????? ??? ????????? ???????????? ?????? ????????? ????????????.
     * @param type
     * @param payload
     */
    requestCommandWithResponse({ id, command: type, payload }) {
        if (this.blockReq) {
            throw new RoCode.Utils.AsyncError();
        }
        const codeId = this.generateCodeId(id, type, payload);
        if (!this.commandStatus[codeId]) {
            // ??? ????????? ????????? AsyncError
            RoCode.hw.sendQueue = {
                type,
                payload,
            };

            this.commandStatus[codeId] = 'pending';
            RoCode.hw.sendQueue.codeId = codeId;
            RoCode.hw.update();
            throw new RoCode.Utils.AsyncError();
        } else if (this.commandStatus[codeId] === 'pending') {
            // ??? ?????? ????????? ?????????????????? ????????? ?????? ????????? ?????? ??????
            throw new RoCode.Utils.AsyncError();
        } else if (this.commandStatus[codeId] === 'completed') {
            // ??? ?????? ????????? ?????????????????? pending ??? ?????? ??????
            // ?????? func ???????????? ?????? ???????????? ????????????.
            delete this.commandStatus[codeId];
        }
    }

    generateCodeId(entityId, type, payload) {
        return `${entityId}-${type}${payload ? '-' + payload : ''}`;
    }

    afterReceive(portData) {
        if (portData) {
            let codeId = portData.recentlyWaitDone;
            let value = portData.result;
            if (value && value.indexOf('localdata') > -1) {
                const version = value.split(';')[1];
                if (!version) {
                    return;
                }
                const major = version[0];
                if (this.version !== major) {
                    this.version = major;
                }
            } else if (codeId) {
                if (codeId.indexOf('reset') > -1) {
                    this.commandStatus = {};
                    this.commandValue = {};
                    return;
                }
                this.commandStatus[codeId] = 'completed';
                this.commandValue[codeId] = value || 'DONE';
            }
        }

        if (!RoCode.engine.isState('run')) {
            this.commandStatus = {};
        }
    }

    // ?????? ??????
    setLanguage() {
        return {
            ko: {
                template: {
                    microbit2_get_analog: '??? %1 ??? ???????????? ???',
                    microbit2_set_analog: '??? %1 ??? ???????????? ??? %2 ??? ???????????? %3',
                    microbit2_get_digital: '??? %1 ??? ????????? ???',
                    microbit2_set_digital: '??? %1 ??? ????????? ??? %2 ??? ???????????? %3',
                    microbit2_screen_toggle: 'LED ?????? %1 %2',
                    microbit2_set_led: 'LED??? X: %1 Y: %2 ??? ?????? %3 (???)??? ?????? %4',
                    microbit2_get_led: 'LED??? X: %1 Y: %2 ?????? ???',
                    microbit2_show_preset_image: 'LED??? %1 ?????? ???????????? %2',
                    microbit2_show_custom_image: 'LED %1 ?????? %2',
                    microbit2_show_string: 'LED??? %1 ???(???) ???????????? %2',
                    microbit2_reset_screen: 'LED ?????? ????????? %1',
                    microbit2_radio_toggle: '????????? ?????? %1 %2',
                    microbit2_radio_setting: '????????? ????????? %1 (???)??? ????????? %2',
                    microbit2_radio_send: '???????????? %1 ???????????? %2',
                    microbit2_radio_received: '????????? ?????? ???',
                    microbit2_speaker_toggle: '????????? ?????? %1 %2',
                    microbit2_change_tempo: '?????? ????????? %1 ?????? %2 BPM?????? ????????? %3',
                    microbit2_set_tone: '%1 ?????? %2 ????????? ???????????? %3',
                    microbit2_play_preset_music: '%1 ????????? ???????????? %2',
                    microbit2_play_sound_effect: '%1 ???????????? ???????????? %2',
                    microbit2_get_btn: '%1 ????????? ?????????????',
                    microbit2_get_logo: '????????? ????????????????',
                    microbit2_get_gesture: '???????????? %1 ???????',
                    microbit2_get_acc: '%1 ??? ????????? ???',
                    microbit2_get_direction: '????????? ??????',
                    microbit2_get_field_strength_axis: '%1 ??? ????????? ?????? ???',
                    microbit2_get_light_level: '??? ?????? ???',
                    microbit2_get_temperature: '?????? ???',
                    microbit2_get_sound_level: '????????? ?????? ?????? ???',
                    microbit2_set_servo: '??? %1 ??? ?????? ?????? ????????? %2 ??? ????????? %3',
                    microbit2_set_pwm: '??? %1 ??? ?????? ?????? ?????? %2 %3?????? ????????? %4',
                    microbit2_common_title: '?????????????????? ??????',
                    microbit2_v2_title: '?????????????????? V2 ??????',
                },
                Blocks: {
                    octave: '?????????',
                    scalar: '?????????',
                    xAxis: 'X???',
                    yAxis: 'Y???',
                    zAxis: 'Z???',
                    up: '???',
                    down: '??????',
                    left: '??????',
                    right: '?????????',
                    face_up: '??????',
                    face_down: '??????',
                    freefall: '?????? ??????',
                    '3g': '3G',
                    '6g': '6G',
                    '8g': '8G',
                    shake: '?????????',
                    DADADADUM: '?????? ?????????',
                    ENTERTAINER: '???????????????',
                    PRELUDE: '?????? ???????????? 1???',
                    ODE: '?????? ?????????',
                    NYAN: '??????',
                    RINGTONE: '?????????',
                    FUNK: '??????',
                    BLUES: '?????????',
                    BIRTHDAY: '?????? ???????????????',
                    WEDDING: '?????? ?????????',
                    FUNERAL: '????????? ??????',
                    PUNCHLINE: '????????????',
                    PYTHON: '?????????',
                    BADDY: '??????',
                    CHASE: '?????????',
                    BA_DING: '?????? GET',
                    WAWAWAWAA: '??????',
                    JUMP_UP: '?????? ??????',
                    JUMP_DOWN: '????????? ??????',
                    POWER_UP: '??????',
                    POWER_DOWN: '??????',
                    GIGGLE: '??????',
                    HAPPY: '??????',
                    HELLO: '??????',
                    MYSTERIOUS: '????????????',
                    SAD: '??????',
                    SLIDE: '????????????',
                    SOARING: '??????',
                    SPRING: '???',
                    TWINKLE: '????????????',
                    YAWN: '??????',
                    plot: '??????',
                    unplot: '??????',
                    on: '??????',
                    off: '??????',
                    microbit_2_HEART: '??????',
                    microbit_2_HEART_SMALL: '?????? ??????',
                    microbit_2_HAPPY: '??????',
                    microbit_2_SMILE: '??????',
                    microbit_2_SAD: '??????',
                    microbit_2_CONFUSED: '??????',
                    microbit_2_ANGRY: '??????',
                    microbit_2_ASLEEP: '??????',
                    microbit_2_SURPRISED: '??????',
                    microbit_2_SILLY: '?????????',
                    microbit_2_FABULOUS: '????????????',
                    microbit_2_MEH: '??????',
                    microbit_2_YES: '??????',
                    microbit_2_NO: '???',
                    microbit_2_TRIANGLE: '?????????',
                    microbit_2_TRIANGLE_LEFT: '?????? ?????????',
                    microbit_2_CHESSBOARD: '?????????',
                    microbit_2_DIAMOND: '???????????????',
                    microbit_2_DIAMOND_SMALL: '?????? ???????????????',
                    microbit_2_SQUARE: '?????????',
                    microbit_2_SQUARE_SMALL: '?????? ?????????',
                    microbit_2_RABBIT: '??????',
                    microbit_2_COW: '???',
                    microbit_2_MUSIC_CROTCHET: '4?????????',
                    microbit_2_MUSIC_QUAVER: '8?????????',
                    microbit_2_MUSIC_QUAVERS: '8????????? 2???',
                    microbit_2_PITCHFORK: '?????????',
                    microbit_2_XMAS: '??????????????? ??????',
                    microbit_2_PACMAN: '??????',
                    microbit_2_TARGET: '??????',
                    microbit_2_TSHIRT: '?????????',
                    microbit_2_ROLLERSKATE: '??????????????????',
                    microbit_2_DUCK: '??????',
                    microbit_2_HOUSE: '???',
                    microbit_2_TORTOISE: '?????????',
                    microbit_2_BUTTERFLY: '??????',
                    microbit_2_STICKFIGURE: '?????????',
                    microbit_2_GHOST: '??????',
                    microbit_2_SWORD: '???',
                    microbit_2_GIRAFFE: '??????',
                    microbit_2_SKULL: '??????',
                    microbit_2_UMBRELLA: '??????',
                    microbit_2_SNAKE: '???',
                    microbit_2_CLOCK1: '1???',
                    microbit_2_CLOCK2: '2???',
                    microbit_2_CLOCK3: '3???',
                    microbit_2_CLOCK4: '4???',
                    microbit_2_CLOCK5: '5???',
                    microbit_2_CLOCK6: '6???',
                    microbit_2_CLOCK7: '7???',
                    microbit_2_CLOCK8: '8???',
                    microbit_2_CLOCK9: '9???',
                    microbit_2_CLOCK10: '10???',
                    microbit_2_CLOCK11: '11???',
                    microbit_2_CLOCK12: '12???',
                    microbit_2_ARROW_N: '??????',
                    microbit_2_ARROW_NE: '?????????',
                    microbit_2_ARROW_E: '??????',
                    microbit_2_ARROW_SE: '?????????',
                    microbit_2_ARROW_S: '??????',
                    microbit_2_ARROW_SW: '?????????',
                    microbit_2_ARROW_W: '??????',
                    microbit_2_ARROW_NW: '?????????',
                },
                Helper: {
                    microbit2_get_analog: '????????? ?????? ???????????? ????????????. (0 ~ 1023)',
                    microbit2_set_analog: '????????? ?????? ????????? ???????????? ?????? ???????????????. (0 ~ 1023)',
                    microbit2_get_digital: '????????? ?????? ????????? ????????????. (0, 1)',
                    microbit2_set_digital: '????????? ?????? ????????? ????????? ?????? ???????????????. (0, 1)',
                    microbit2_screen_toggle: 'LED ????????? ????????? ?????????.',
                    microbit2_set_led: 'X, Y ????????? ????????? LED??? ????????? ????????? ?????????.',
                    microbit2_get_led: 'X, Y ????????? ????????? LED??? ?????? ????????????.',
                    microbit2_show_preset_image: 'LED??? ?????? ???????????? ?????? ????????? ???????????????.',
                    microbit2_show_custom_image:
                        '???????????? ????????? LED??? ????????? ????????? ?????????. ????????? ?????? LED??? ????????? ??? ????????????.',
                    microbit2_show_string: '????????? ???????????? LED??? ???????????? ???????????????.',
                    microbit2_reset_screen: 'LED??? ????????? ????????? ?????? ????????????.',
                    microbit2_radio_toggle: '????????? ????????? ????????? ?????????.',
                    microbit2_radio_setting: '????????? ????????? ????????? ????????? ????????????.',
                    microbit2_radio_send: '???????????? ????????? ????????? ????????? ???????????????.',
                    microbit2_radio_received: '???????????? ????????? ????????????.',
                    microbit2_speaker_toggle: '????????? ????????? ????????? ?????????.',
                    microbit2_change_tempo: '?????? ????????? ????????? ????????? BPM?????? ????????????.',
                    microbit2_set_tone:
                        '????????? ?????? ????????? ????????? ???????????????. 1~5????????? ????????? ????????? ????????? ??? ????????????.',
                    microbit2_play_preset_music: '?????? ???????????? ?????? ????????? ???????????????.',
                    microbit2_play_sound_effect: '?????? ???????????? ?????? ???????????? ???????????????.',
                    microbit2_get_btn: "????????? ????????? ???????????? '???'?????? ???????????????.",
                    microbit2_get_logo: "????????? ??????????????? '???'?????? ???????????????.",
                    microbit2_get_gesture: "????????? ???????????? ???????????? '???'?????? ???????????????.",
                    microbit2_get_acc: '????????? ?????? ????????? ????????????.',
                    microbit2_get_direction: '????????? ?????? ????????????. (0~360) ',
                    microbit2_get_field_strength_axis: '????????? ?????? ????????? ?????? ????????????.',
                    microbit2_get_light_level: '??? ????????? ????????????.',
                    microbit2_get_temperature: '?????? ?????? ????????????. (???)',
                    microbit2_get_sound_level: '????????? ?????? ?????? ????????????.',
                    microbit2_set_servo: '????????? ?????? ?????? ?????? ????????? ????????? ????????? ????????????.',
                    microbit2_set_pwm: '????????? ?????? ?????? ???????????? ????????? ???????????? ????????????.',
                },
                Msgs: {
                    microbit2_compatible_error: '?????????????????? V2????????? ????????? ??? ?????? ???????????????.',
                },
            },
            en: {
                template: {
                    microbit2_get_analog: 'analog read pin %1',
                    microbit2_set_analog: 'analog write pin %1 to %2 %3',
                    microbit2_get_digital: 'digital read pin %1',
                    microbit2_set_digital: 'digital write pin %1 to %2 %3',
                    microbit2_screen_toggle: '%1 LED',
                    microbit2_set_led: 'plot X: %1 Y:%2 brightness %3 %4',
                    microbit2_get_led: 'point X: %1 Y: %2 brightness of LED',
                    microbit2_show_preset_image: 'show icon %1 on LED %2',
                    microbit2_show_custom_image: 'Show %1 on LED %2',
                    microbit2_show_string: 'show string %1 on LED %2',
                    microbit2_reset_screen: 'clear LED screen %1',
                    microbit2_radio_toggle: '%1 radio %2',
                    microbit2_radio_setting: 'radio change channel to %1 %2',
                    microbit2_radio_send: 'radio send %1 %2',
                    microbit2_radio_received: 'radio received value',
                    microbit2_speaker_toggle: '%1 speaker %2',
                    microbit2_change_tempo: 'set tempo to %2 BPM per %1 beat %3',
                    microbit2_set_tone: 'play melody %1 for %2 beat %3',
                    microbit2_play_preset_music: 'play music %1 %2',
                    microbit2_play_sound_effect: 'play sound %1 %2',
                    microbit2_get_btn: '%1 button pressed?',
                    microbit2_get_logo: 'logo touched?',
                    microbit2_get_gesture: 'Is the movement %1?',
                    microbit2_get_acc: 'acceleration value of %1',
                    microbit2_get_direction: 'compass direction',
                    microbit2_get_field_strength_axis: 'magnetic field strength value of %1 ',
                    microbit2_get_light_level: 'Light sensor value',
                    microbit2_get_temperature: 'temperature value',
                    microbit2_get_sound_level: 'microphone volume value',
                    microbit2_set_servo: 'set servo pin %1 angle to %2 %3',
                    microbit2_set_pwm: 'set servo pin %1 pulse to %2 %3 %4',
                    microbit2_common_title: 'Common Blocks',
                    microbit2_v2_title: 'v2 Only',
                },
                Blocks: {
                    octave: 'octave',
                    scalar: 'scalar',
                    xAxis: 'X-axis',
                    yAxis: 'Y-axis',
                    zAxis: 'Z-axis',
                    up: 'up',
                    down: 'down',
                    left: 'left',
                    right: 'right',
                    face_up: 'face up',
                    face_down: 'face down',
                    freefall: 'freefall',
                    '3g': '3G',
                    '6g': '6G',
                    '8g': '8G',
                    shake: 'shake',
                    DADADADUM: 'DADADADUM',
                    ENTERTAINER: 'ENTERTAINER',
                    PRELUDE: 'PRELUDE',
                    ODE: 'ODE',
                    NYAN: 'NYAN',
                    RINGTONE: 'RINGTONE',
                    FUNK: 'FUNK',
                    BLUES: 'BLUES',
                    BIRTHDAY: 'BIRTHDAY',
                    WEDDING: 'WEDDING',
                    FUNERAL: 'FUNERAL',
                    PUNCHLINE: 'PUNCHLINE',
                    PYTHON: 'PYTHON',
                    BADDY: 'BADDY',
                    CHASE: 'CHASE',
                    BA_DING: 'BA_DING',
                    WAWAWAWAA: 'WAWAWAWAA',
                    JUMP_UP: 'JUMP_UP',
                    JUMP_DOWN: 'JUMP DOWN',
                    POWER_UP: 'POWER UP',
                    POWER_DOWN: 'POWER DOWN',
                    GIGGLE: 'GIGGLE',
                    HAPPY: 'HAPPY',
                    HELLO: 'HELLO',
                    MYSTERIOUS: 'MYSTERIOUS',
                    SAD: 'SAD',
                    SLIDE: 'SLIDE',
                    SOARING: 'SOARING',
                    SPRING: 'SPRING',
                    TWINKLE: 'TWINKLE',
                    YAWN: 'YAWN',
                    plot: 'plot',
                    unplot: 'unplot',
                    on: 'turn on',
                    off: 'turn off',
                    microbit_2_HEART: 'HEART',
                    microbit_2_HEART_SMALL: 'HEART_SMALL',
                    microbit_2_HAPPY: 'HAPPY',
                    microbit_2_SMILE: 'SMILE',
                    microbit_2_SAD: 'SAD',
                    microbit_2_CONFUSED: 'CONFUSEd',
                    microbit_2_ANGRY: 'ANGRY',
                    microbit_2_ASLEEP: 'ASLEEP',
                    microbit_2_SURPRISED: 'SURPRISED',
                    microbit_2_SILLY: 'SILLY',
                    microbit_2_FABULOUS: 'FABULOUS',
                    microbit_2_MEH: 'MEH',
                    microbit_2_YES: 'YES',
                    microbit_2_NO: 'NO',
                    microbit_2_TRIANGLE: 'TRIANGLE',
                    microbit_2_TRIANGLE_LEFT: 'TRIANGLE LEFT',
                    microbit_2_CHESSBOARD: 'CHESSBOARD',
                    microbit_2_DIAMOND: 'DIAMOND',
                    microbit_2_DIAMOND_SMALL: 'DIAMOND SMALL',
                    microbit_2_SQUARE: 'SQUARE',
                    microbit_2_SQUARE_SMALL: 'SQUARE SMALL',
                    microbit_2_RABBIT: 'RABBIT',
                    microbit_2_COW: 'COW',
                    microbit_2_MUSIC_CROTCHET: 'CROCHET',
                    microbit_2_MUSIC_QUAVER: 'QUAVER',
                    microbit_2_MUSIC_QUAVERS: 'QUAVERS',
                    microbit_2_PITCHFORK: 'PITCHFORK',
                    microbit_2_XMAS: 'XMAS',
                    microbit_2_PACMAN: 'PACMAN',
                    microbit_2_TARGET: 'TARGET',
                    microbit_2_TSHIRT: 'TSHIRT',
                    microbit_2_ROLLERSKATE: 'ROLLERSKATE',
                    microbit_2_DUCK: 'DUCK',
                    microbit_2_HOUSE: 'HOUSE',
                    microbit_2_TORTOISE: 'TORTOISE',
                    microbit_2_BUTTERFLY: 'BUTTERFLY',
                    microbit_2_STICKFIGURE: 'STICKFIGURE',
                    microbit_2_GHOST: 'GHOST',
                    microbit_2_SWORD: 'SWORD',
                    microbit_2_GIRAFFE: 'GIRAFFE',
                    microbit_2_SKULL: 'SKULL',
                    microbit_2_UMBRELLA: 'UMBRELLA',
                    microbit_2_SNAKE: 'SNAKE',
                    microbit_2_CLOCK1: 'CLOCK 1',
                    microbit_2_CLOCK2: 'CLOCK 2',
                    microbit_2_CLOCK3: 'CLOCK 3',
                    microbit_2_CLOCK4: 'CLOCK 4',
                    microbit_2_CLOCK5: 'CLOCK 5',
                    microbit_2_CLOCK6: 'CLOCK 6',
                    microbit_2_CLOCK7: 'CLOCK 7',
                    microbit_2_CLOCK8: 'CLOCK 8',
                    microbit_2_CLOCK9: 'CLOCK 9',
                    microbit_2_CLOCK10: 'CLOCK 10',
                    microbit_2_CLOCK11: 'CLOCK 11',
                    microbit_2_CLOCK12: 'CLOCK 12',
                    microbit_2_ARROW_N: 'ARROW_N',
                    microbit_2_ARROW_NE: 'ARROW_NE',
                    microbit_2_ARROW_E: 'ARROW_E',
                    microbit_2_ARROW_SE: 'ARROW_SE',
                    microbit_2_ARROW_S: 'ARROW_S',
                    microbit_2_ARROW_SW: 'ARROW_SW',
                    microbit_2_ARROW_W: 'ARROW_W',
                    microbit_2_ARROW_NW: 'ARROW_NW',
                },
                Helper: {
                    microbit2_get_analog:
                        'Reads an analog signal from the pin you choose. (0 ~ 1023)',
                    microbit2_set_analog:
                        'Writes an analog signal to the pin you choose. (0 ~ 1023)',
                    microbit2_get_digital:
                        'Reads a digital signal from the pin you choose. (0 ~ 1)',
                    microbit2_set_digital: 'Writes a digital signal to the pin you choose. (0 ~ 1)',
                    microbit2_screen_toggle: 'Turns on or turns off the LED screen.',
                    microbit2_set_led:
                        'Turns on the LED light of the entered X, Y coordinate with the selected brightness.',
                    microbit2_get_led:
                        'The LED light brightness value of the entered X, Y coordinate.',
                    microbit2_show_preset_image: 'Shows the selected icon on the LED screen.',
                    microbit2_show_custom_image:
                        'Shows the selected LED and brightness. You can manipulate all the LEDs at once.',
                    microbit2_show_string: 'Shows the entered string in order on the LED screen.',
                    microbit2_reset_screen: 'Clears all LED screen.',
                    microbit2_radio_toggle: 'Turns on or turns off the radio.',
                    microbit2_radio_setting: 'Changes the radio channel to the number entered.',
                    microbit2_radio_send: 'Sends the number or the string entered to the radio.',
                    microbit2_radio_received: 'Value received by the radio.',
                    microbit2_speaker_toggle: 'Turns on or turns off the speaker.',
                    microbit2_change_tempo: 'Sets the tempo to the entered beat and BPM.',
                    microbit2_set_tone:
                        'Plays the entered melody for the entered beat. You can choose a scale between 1 and 5 octaves.',
                    microbit2_play_preset_music: 'Plays preset music.',
                    microbit2_play_sound_effect: 'Plays preset sound.',
                    microbit2_get_btn: "If the selected button is pressed, it is judged as 'True'.",
                    microbit2_get_logo: "If the logo is touched, it is judged as 'True'.",
                    microbit2_get_gesture:
                        "When the selected movement is detected, it is judged as 'True'.",
                    microbit2_get_acc: 'The acceleration value of the selected axis.',
                    microbit2_get_direction: 'The compass direction value. (0~360)',
                    microbit2_get_field_strength_axis:
                        'The magnetic field strength value of the selected axis.',
                    microbit2_get_light_level: 'The value of the light sensor.',
                    microbit2_get_temperature: 'The current temperature value. (???)',
                    microbit2_get_sound_level: 'The microphone volume value.',
                    microbit2_set_servo:
                        'Sets the servo motor angle to the entered value on the selected pin.',
                    microbit2_set_pwm:
                        'Sets the servo pulse to the entered time on the selected pin.',
                },
                Msgs: {
                    microbit2_compatible_error:
                        'The corresponding block is not compatible to Microbit V1',
                },
            },
            jp: {
                template: {
                    microbit2_get_analog: '?????? %1 ??????????????????',
                    microbit2_set_analog: '?????? %1 ?????????????????? ???2 ??????????????? %3',
                    microbit2_get_digital: '?????? %1 ??????????????????',
                    microbit2_set_digital: '?????? ???1??? ??????????????? ???2 ??????????????? %3',
                    microbit2_screen_toggle: 'LED????????? ???1 %2',
                    microbit2_set_led: 'LED??? X: %1 Y: %2 ???????????? ???3 ????????? %4',
                    microbit2_get_led: 'LED??? X: %1 Y: %2 ????????????',
                    microbit2_show_preset_image: 'LED??? ???1 ??????????????????????????? %2',
                    microbit2_show_custom_image: 'LED %1??????????????? %2',
                    microbit2_show_string: 'LED??? ???1 ??????????????? %2',
                    microbit2_reset_screen: 'LED??????????????? %1',
                    microbit2_radio_toggle: '?????????????????? ???1 %2',
                    microbit2_radio_setting: '??????????????????????????? ???1 ??????????????? %2',
                    microbit2_radio_send: '???????????? ???1 ???????????? %2',
                    microbit2_radio_received: '??????????????????',
                    microbit2_speaker_toggle: '????????????????????? ???1 %2',
                    microbit2_change_tempo: '???????????? ???1 ?????? ???2 BPM????????? %3',
                    microbit2_set_tone: '???1 ?????? ???2 ??????????????? %3',
                    microbit2_play_preset_music: '???1 ????????????????????? %2',
                    microbit2_play_sound_effect: '???1 ???????????????????????? %2',
                    microbit2_get_btn: '???1 ?????????????????????k????',
                    microbit2_get_logo: '???????????????????????????????',
                    microbit2_get_gesture: '????????? ???1 ??????????',
                    microbit2_get_acc: '%1 ????????????',
                    microbit2_get_direction: '??????????????????',
                    microbit2_get_field_strength_axis: '%1 ???????????????',
                    microbit2_get_light_level: '??????????????????',
                    microbit2_get_temperature: '?????????',
                    microbit2_get_sound_level: '????????????????????????',
                    microbit2_set_servo: '?????? ???1 ??? ????????????????????????????????? ???2 ??????????????? %3',
                    microbit2_set_pwm: '?????? ???1 ???????????????????????????2????????? %4',
                    microbit2_common_title: 'Common Blocks',
                    microbit2_v2_title: 'v2 Only',
                },
                Blocks: {
                    octave: '???????????????',
                    scalar: '????????????',
                    xAxis: 'X???',
                    yAxis: 'Y???',
                    zAxis: 'Z???',
                    up: '???',
                    down: '???',
                    left: '???',
                    right: '???',
                    face_up: '??????',
                    face_down: '??????',
                    freefall: '????????????',
                    '3g': '3G',
                    '6g': '6G',
                    '8g': '8G',
                    shake: '??????',
                    DADADADUM: '???????????????',
                    ENTERTAINER: '????????????????????????',
                    PRELUDE: '????????????????????????????????1???',
                    ODE: '???????????????',
                    NYAN: '?????????????????????',
                    RINGTONE: '??????????????????',
                    FUNK: '????????????',
                    BLUES: '????????????',
                    BIRTHDAY: '???????????????????????????',
                    WEDDING: '???????????????',
                    FUNERAL: '????????????',
                    PUNCHLINE: '??????????????????',
                    PYTHON: '????????????',
                    BADDY: '??????',
                    CHASE: '?????????',
                    BA_DING: '?????????GET',
                    WAWAWAWAA: '????????????',
                    JUMP_UP: '??????????????????',
                    JUMP_DOWN: '??????????????????',
                    POWER_UP: '?????????',
                    POWER_DOWN: '??????',
                    GIGGLE: '??????',
                    HAPPY: '??????',
                    HELLO: '??????',
                    MYSTERIOUS: '?????????',
                    SAD: '?????????',
                    SLIDE: '????????????',
                    SOARING: '??????',
                    SPRING: '???',
                    TWINKLE: '????????????',
                    YAWN: '?????????',
                    plot: '???????????????',
                    unplot: '???????????????',
                    on: '???????????????',
                    off: '???????????????',
                    microbit_2_HEART: '?????????',
                    microbit_2_HEART_SMALL: '??????????????????',
                    microbit_2_HAPPY: '??????',
                    microbit_2_SMILE: '??????',
                    microbit_2_SAD: '?????????',
                    microbit_2_CONFUSED: '??????',
                    microbit_2_ANGRY: '??????',
                    microbit_2_ASLEEP: '??????',
                    microbit_2_SURPRISED: '??????',
                    microbit_2_SILLY: '?????????',
                    microbit_2_FABULOUS: '????????????',
                    microbit_2_MEH: '??????',
                    microbit_2_YES: '?????????',
                    microbit_2_NO: '??????',
                    microbit_2_TRIANGLE: '?????????',
                    microbit_2_TRIANGLE_LEFT: '????????????',
                    microbit_2_CHESSBOARD: '???????????????',
                    microbit_2_DIAMOND: '??????????????????',
                    microbit_2_DIAMOND_SMALL: '???????????????????????????',
                    microbit_2_SQUARE: '?????????',
                    microbit_2_SQUARE_SMALL: '??????????????????',
                    microbit_2_RABBIT: '?????????',
                    microbit_2_COW: '???',
                    microbit_2_MUSIC_CROTCHET: '4?????????',
                    microbit_2_MUSIC_QUAVER: '8?????????',
                    microbit_2_MUSIC_QUAVERS: '8?????????2???',
                    microbit_2_PITCHFORK: '????????????',
                    microbit_2_XMAS: '????????????????????????',
                    microbit_2_PACMAN: '???????????????',
                    microbit_2_TARGET: '??????',
                    microbit_2_TSHIRT: 'T?????????',
                    microbit_2_ROLLERSKATE: '????????????????????????',
                    microbit_2_DUCK: '?????????',
                    microbit_2_HOUSE: '???',
                    microbit_2_TORTOISE: '???',
                    microbit_2_BUTTERFLY: '???',
                    microbit_2_STICKFIGURE: '?????????????????????',
                    microbit_2_GHOST: '??????',
                    microbit_2_SWORD: '?????????',
                    microbit_2_GIRAFFE: '?????????',
                    microbit_2_SKULL: '??????',
                    microbit_2_UMBRELLA: '???',
                    microbit_2_SNAKE: '???',
                    microbit_2_CLOCK1: '1???',
                    microbit_2_CLOCK2: '2???',
                    microbit_2_CLOCK3: '3???',
                    microbit_2_CLOCK4: '4???',
                    microbit_2_CLOCK5: '5???',
                    microbit_2_CLOCK6: '6???',
                    microbit_2_CLOCK7: '7???',
                    microbit_2_CLOCK8: '8???',
                    microbit_2_CLOCK9: '9???',
                    microbit_2_CLOCK10: '10???',
                    microbit_2_CLOCK11: '11???',
                    microbit_2_CLOCK12: '12???',
                    microbit_2_ARROW_N: '???',
                    microbit_2_ARROW_NE: '??????',
                    microbit_2_ARROW_E: '???',
                    microbit_2_ARROW_SE: '??????',
                    microbit_2_ARROW_S: '???',
                    microbit_2_ARROW_SW: '??????',
                    microbit_2_ARROW_W: '???',
                    microbit_2_ARROW_NW: '??????',
                },
                Helper: {
                    microbit2_get_analog: '?????????????????????????????????????????????(0 ~ 1023)',
                    microbit2_set_analog:
                        '?????????????????????????????????????????????????????????????????????(0 ~ 1023)',
                    microbit2_get_digital: '?????????????????????????????????????????????(0, 1)',
                    microbit2_set_digital: '?????????????????????????????????????????????????????????????????????(0, 1)',
                    microbit2_screen_toggle: 'LED?????????????????????????????????????????????',
                    microbit2_set_led: 'X???Y?????????????????????LED??????????????????????????????????????????',
                    microbit2_get_led: 'X???Y?????????????????????LED?????????????????????',
                    microbit2_show_preset_image: 'LED???????????????????????????????????????????????????',
                    microbit2_show_custom_image:
                        '???????????????????????????LED?????????????????????????????????????????? ?????????????????????LED????????????????????????',
                    microbit2_show_string: '????????????????????????LED??????????????????????????????',
                    microbit2_reset_screen: 'LED????????????????????????????????????????????????',
                    microbit2_radio_toggle: '??????????????????????????????????????????????????????',
                    microbit2_radio_setting: '???????????????????????????????????????????????????????????????',
                    microbit2_radio_send: '??????????????????????????????????????????????????????',
                    microbit2_radio_received: '????????????????????????????????????',
                    microbit2_speaker_toggle: '????????????????????????????????????????????????????????????',
                    microbit2_change_tempo: '?????????????????????????????????BPM?????????????????????',
                    microbit2_set_tone:
                        '????????????????????????????????????????????????????????? 1~5?????????????????????????????????????????????',
                    microbit2_play_preset_music: '??????????????????????????????????????????????????????',
                    microbit2_play_sound_effect: '?????????????????????????????????????????????????????????',
                    microbit2_get_btn: '?????????????????????????????????????????????True????????????????????????',
                    microbit2_get_logo: '?????????????????????????????????True????????????????????????',
                    microbit2_get_gesture: '??????????????????????????????????????????True????????????????????????',
                    microbit2_get_acc: '???????????????????????????????????????',
                    microbit2_get_direction: '????????????????????????????????? (0~360)',
                    microbit2_get_field_strength_axis: '?????????????????????????????????????????????',
                    microbit2_get_light_level: '??????????????????????????????',
                    microbit2_get_temperature: '???????????????????????? (???)',
                    microbit2_get_sound_level: '???????????????????????????????????????',
                    microbit2_set_servo:
                        '??????????????????????????????????????????????????????????????????????????????????????????',
                    microbit2_set_pwm: '???????????????????????????????????????????????????????????????????????????',
                },
                Msgs: {
                    microbit2_compatible_error: '???????????????????????????MicrobitV1??????????????????????????????',
                },
            },
        };
    }

    getResponse({ id, command, payload }) {
        const codeId = this.generateCodeId(id, command, payload);
        const parsedResponse = this.commandValue[codeId].split(';');
        return parsedResponse;
    }

    getBlocks = function() {
        return {
            microbit2_common_title: {
                skeleton: 'basic_text',
                color: RoCodeStatic.colorSet.common.TRANSPARENT,
                fontColor: '#333333',
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.microbit2_common_title,
                        color: '#333333',
                        align: 'center',
                    },
                ],
                def: {
                    type: 'microbit2_common_title',
                },
                class: 'microbit2_title',
                isNotFor: ['microbit2'],
                events: {},
            },
            microbit2_v2_title: {
                skeleton: 'basic_text',
                color: RoCodeStatic.colorSet.common.TRANSPARENT,
                fontColor: '#333333',
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.microbit2_v2_title,
                        color: '#333333',
                        align: 'center',
                    },
                ],
                def: {
                    type: 'microbit2_v2_title',
                },
                class: 'microbit2_title',
                isNotFor: ['microbit2'],
                events: {},
            },
            microbit2_get_analog: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: this.analogPins,
                        value: 0,
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                ],
                events: {},
                class: 'microbit2Pin',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_analog',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = script.getValue('VALUE');
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_ANALOG,
                        payload: value,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_digital: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: this.digitalPins,
                        value: 8,
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                ],
                events: {},
                class: 'microbit2Pin',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_digital',
                },
                paramsKeyMap: { VALUE: 0 },
                func: (sprite, script) => {
                    const value = script.getValue('VALUE');
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_DIGITAL,
                        payload: value,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_set_analog: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: this.analogPins,
                        value: 0,
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
                class: 'microbit2Pin',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_set_analog',
                },
                paramsKeyMap: {
                    PIN: 0,
                    VALUE: 1,
                },
                func: (sprite, script) => {
                    const pin = script.getValue('PIN');
                    const value = Math.round(_clamp(script.getNumberValue('VALUE'), 0, 1023));

                    const parsedPayload = `${pin};${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_ANALOG,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return;
                },
            },
            microbit2_set_digital: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: this.digitalPins,
                        value: 8,
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            [0, 0],
                            [1, 1],
                        ],
                        value: 0,
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
                class: 'microbit2Pin',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_set_digital',
                },
                paramsKeyMap: { PIN: 0, VALUE: 1 },
                func: (sprite, script) => {
                    const pin = script.getValue('PIN');
                    const value = script.getValue('VALUE');
                    const parsedPayload = `${pin};${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_DIGITAL,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return;
                },
            },
            microbit2_set_led: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: 0,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: 0,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: 9,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['0'],
                        },
                        {
                            type: 'text',
                            params: ['0'],
                        },
                        {
                            type: 'text',
                            params: ['9'],
                        },
                    ],
                    type: 'microbit2_set_led',
                },
                paramsKeyMap: {
                    X: 0,
                    Y: 1,
                    VALUE: 2,
                },
                func: (sprite, script) => {
                    const value = script.getNumberValue('VALUE');
                    const x = script.getNumberValue('X');
                    const y = script.getNumberValue('Y');
                    if (x < 0 || y < 0 || x > 4 || y > 4 || value < 0 || value > 9) {
                        return;
                    }
                    const data = {
                        type: this.functionKeys.SET_LED,
                        data: {
                            x,
                            y,
                            value,
                        },
                    };

                    const parsedPayload = `${x};${y};${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_LED,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_get_led: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: 0,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: 0,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['0'],
                        },
                        {
                            type: 'text',
                            params: ['0'],
                        },
                    ],
                    type: 'microbit2_get_led',
                },
                paramsKeyMap: {
                    X: 0,
                    Y: 1,
                },
                func: (sprite, script) => {
                    const x = script.getNumberValue('X');
                    const y = script.getNumberValue('Y');
                    if (x < 0 || y < 0 || x > 4 || y > 4) {
                        return -1;
                    }
                    const parsedPayload = `${x};${y}`;

                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_LED,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);

                    if (parsedResponse[1] == 0) {
                        return 0;
                    } else if (parsedResponse[1] == 1) {
                        return 1;
                    }

                    return Math.round(Math.log2(parsedResponse[1] * 2));
                },
            },
            microbit2_show_preset_image: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.microbit_2_HEART, 0],
                            [Lang.Blocks.microbit_2_HEART_SMALL, 1],
                            [Lang.Blocks.microbit_2_HAPPY, 2],
                            [Lang.Blocks.microbit_2_SMILE, 3],
                            [Lang.Blocks.microbit_2_SAD, 4],
                            [Lang.Blocks.microbit_2_CONFUSED, 5],
                            [Lang.Blocks.microbit_2_ANGRY, 6],
                            [Lang.Blocks.microbit_2_ASLEEP, 7],
                            [Lang.Blocks.microbit_2_SURPRISED, 8],
                            [Lang.Blocks.microbit_2_SILLY, 9],
                            [Lang.Blocks.microbit_2_FABULOUS, 10],
                            [Lang.Blocks.microbit_2_MEH, 11],
                            [Lang.Blocks.microbit_2_YES, 12],
                            [Lang.Blocks.microbit_2_NO, 13],
                            [Lang.Blocks.microbit_2_TRIANGLE, 34],
                            [Lang.Blocks.microbit_2_TRIANGLE_LEFT, 35],
                            [Lang.Blocks.microbit_2_CHESSBOARD, 36],
                            [Lang.Blocks.microbit_2_DIAMOND, 37],
                            [Lang.Blocks.microbit_2_DIAMOND_SMALL, 38],
                            [Lang.Blocks.microbit_2_SQUARE, 39],
                            [Lang.Blocks.microbit_2_SQUARE_SMALL, 40],
                            [Lang.Blocks.microbit_2_RABBIT, 41],
                            [Lang.Blocks.microbit_2_COW, 42],
                            [Lang.Blocks.microbit_2_MUSIC_CROTCHET, 43],
                            [Lang.Blocks.microbit_2_MUSIC_QUAVER, 44],
                            [Lang.Blocks.microbit_2_MUSIC_QUAVERS, 45],
                            [Lang.Blocks.microbit_2_PITCHFORK, 46],
                            [Lang.Blocks.microbit_2_XMAS, 47],
                            [Lang.Blocks.microbit_2_PACMAN, 48],
                            [Lang.Blocks.microbit_2_TARGET, 49],
                            [Lang.Blocks.microbit_2_TSHIRT, 50],
                            [Lang.Blocks.microbit_2_ROLLERSKATE, 51],
                            [Lang.Blocks.microbit_2_DUCK, 52],
                            [Lang.Blocks.microbit_2_HOUSE, 53],
                            [Lang.Blocks.microbit_2_TORTOISE, 54],
                            [Lang.Blocks.microbit_2_BUTTERFLY, 55],
                            [Lang.Blocks.microbit_2_STICKFIGURE, 56],
                            [Lang.Blocks.microbit_2_GHOST, 57],
                            [Lang.Blocks.microbit_2_SWORD, 58],
                            [Lang.Blocks.microbit_2_GIRAFFE, 59],
                            [Lang.Blocks.microbit_2_SKULL, 60],
                            [Lang.Blocks.microbit_2_UMBRELLA, 61],
                            [Lang.Blocks.microbit_2_SNAKE, 62],
                            [Lang.Blocks.microbit_2_CLOCK1, 14],
                            [Lang.Blocks.microbit_2_CLOCK2, 15],
                            [Lang.Blocks.microbit_2_CLOCK3, 16],
                            [Lang.Blocks.microbit_2_CLOCK4, 17],
                            [Lang.Blocks.microbit_2_CLOCK5, 18],
                            [Lang.Blocks.microbit_2_CLOCK6, 19],
                            [Lang.Blocks.microbit_2_CLOCK7, 20],
                            [Lang.Blocks.microbit_2_CLOCK8, 21],
                            [Lang.Blocks.microbit_2_CLOCK9, 22],
                            [Lang.Blocks.microbit_2_CLOCK10, 23],
                            [Lang.Blocks.microbit_2_CLOCK11, 24],
                            [Lang.Blocks.microbit_2_CLOCK12, 25],
                            [Lang.Blocks.microbit_2_ARROW_N, 26],
                            [Lang.Blocks.microbit_2_ARROW_NE, 27],
                            [Lang.Blocks.microbit_2_ARROW_E, 28],
                            [Lang.Blocks.microbit_2_ARROW_SE, 29],
                            [Lang.Blocks.microbit_2_ARROW_S, 30],
                            [Lang.Blocks.microbit_2_ARROW_SW, 31],
                            [Lang.Blocks.microbit_2_ARROW_W, 32],
                            [Lang.Blocks.microbit_2_ARROW_NW, 33],
                        ],
                        value: 0,
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
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_show_preset_image',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = _clamp(script.getNumberValue('VALUE'), 0, 62);
                    const parsedPayload = `${this.presetImage[value]}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_CUSTOM_IMAGE,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_show_custom_image: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Led2',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_show_custom_image',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = script.getField('VALUE');
                    const processedValue = [];
                    for (const i in value) {
                        processedValue[i] = value[i].join();
                    }
                    const parsedPayload = `${processedValue.join(':').replace(/,/gi, '')}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_CUSTOM_IMAGE,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_show_string: {
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
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['Hello!'],
                            accept: 'string',
                        },
                    ],
                    type: 'microbit2_show_string',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    let payload = script.getStringValue('VALUE');
                    payload = payload.replace(
                        /[^A-Za-z0-9_\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\\\{\}\[\]\'\"\;\:\<\,\>\.\?\/\s]/gim,
                        ''
                    );
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_STRING,
                        payload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_reset_screen: {
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
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_reset_screen',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.RESET_SCREEN,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_screen_toggle: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.plot, this.functionKeys.DISPLAY_ON],
                            [Lang.Blocks.unplot, this.functionKeys.DISPLAY_OFF],
                        ],
                        value: this.functionKeys.DISPLAY_ON,
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
                class: 'microbit2Led',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_screen_toggle',
                },
                paramsKeyMap: { VALUE: 0 },
                func: (sprite, script) => {
                    const command = script.getField('VALUE');
                    const reqOptions = {
                        id: script.entity.id,
                        command,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },

            microbit2_change_tempo: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
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
                class: 'microbit2Sound',
                isNotFor: ['microbit2'],
                def: {
                    params: [
                        {
                            type: 'text',
                            params: ['4'],
                        },
                        {
                            type: 'text',
                            params: ['120'],
                        },
                    ],
                    type: 'microbit2_change_tempo',
                },
                paramsKeyMap: {
                    BEAT: 0,
                    BPM: 1,
                },
                func: (sprite, script) => {
                    const beat = Math.round(_clamp(script.getNumberValue('BEAT'), 0, 4));
                    const bpm = Math.round(_clamp(script.getNumberValue('BPM'), 1, 230));

                    const parsedPayload = `${beat};${bpm}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.CHANGE_TEMPO,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_set_tone: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'MusicScale',
                    },
                    {
                        type: 'Dropdown',
                        options: [
                            ['4', 16],
                            ['2', 8],
                            ['1', 4],
                            ['1/2', 2],
                            ['1/4', 1],
                        ],
                        value: 4,
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
                class: 'microbit2Sound',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_set_tone',
                },
                paramsKeyMap: {
                    SCALE: 0,
                    NOTE: 1,
                },
                func: (sprite, script) => {
                    const scale = script.getField('SCALE');
                    const note = script.getField('NOTE');
                    const parsedPayload = `${scale}:${note}`;

                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.PLAY_TONE,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_play_preset_music: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.DADADADUM, 0],
                            [Lang.Blocks.ENTERTAINER, 1],
                            [Lang.Blocks.PRELUDE, 2],
                            [Lang.Blocks.ODE, 3],
                            [Lang.Blocks.NYAN, 4],
                            [Lang.Blocks.RINGTONE, 5],
                            [Lang.Blocks.FUNK, 6],
                            [Lang.Blocks.BLUES, 7],
                            [Lang.Blocks.BIRTHDAY, 8],
                            [Lang.Blocks.WEDDING, 9],
                            [Lang.Blocks.FUNERAL, 10],
                            [Lang.Blocks.PUNCHLINE, 11],
                            [Lang.Blocks.PYTHON, 12],
                            [Lang.Blocks.BADDY, 13],
                            [Lang.Blocks.CHASE, 14],
                            [Lang.Blocks.BA_DING, 15],
                            [Lang.Blocks.WAWAWAWAA, 16],
                            [Lang.Blocks.JUMP_UP, 17],
                            [Lang.Blocks.JUMP_DOWN, 18],
                            [Lang.Blocks.POWER_UP, 19],
                            [Lang.Blocks.POWER_DOWN, 20],
                        ],
                        value: 0,
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
                class: 'microbit2Sound',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_play_preset_music',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = _clamp(script.getNumberValue('VALUE'), 0, 20);
                    const parsedPayload = `${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.PLAY_MELODY,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    this.waitMilliSec(500);
                },
            },
            microbit2_radio_toggle: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.on, this.functionKeys.RADIO_ON],
                            [Lang.Blocks.off, this.functionKeys.RADIO_OFF],
                        ],
                        value: this.functionKeys.RADIO_ON,
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
                class: 'microbit2Radio',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_radio_toggle',
                },
                paramsKeyMap: { VALUE: 0 },
                func: (sprite, script) => {
                    const command = script.getField('VALUE');
                    const reqOptions = {
                        id: script.entity.id,
                        command,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_radio_setting: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                        value: 7,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/hardware_icon.svg',
                        size: 12,
                    },
                ],
                events: {},
                class: 'microbit2Radio',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_radio_setting',
                },
                paramsKeyMap: { RATE: 0, CHANNEL: 1 },
                func: (sprite, script) => {
                    if (!RoCode.Utils.isNumber(script.getNumberValue('CHANNEL'))) {
                        return;
                    }
                    const channel = Math.round(_clamp(script.getNumberValue('CHANNEL'), 0, 83));
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SETTING_RADIO,
                        payload: channel,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_radio_send: {
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
                class: 'microbit2Radio',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_radio_send',
                },
                paramsKeyMap: { VALUE: 0 },
                func: (sprite, script) => {
                    const value = script.getStringValue('VALUE');
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_RADIO,
                        payload: value,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_radio_received: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                class: 'microbit2Radio',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_radio_received',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_RADIO,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_btn: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_boolean_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            ['A', 'a'],
                            ['B', 'b'],
                            ['A+B', 'ab'],
                        ],
                        value: 'a',
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                ],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_btn',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    const value = script.getField('VALUE');

                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_BTN,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);

                    if (parsedResponse[1] == '1' && value == 'a') {
                        return 1;
                    } else if (parsedResponse[1] == '2' && value == 'b') {
                        return 1;
                    } else if (parsedResponse[1] == '3' && value == 'ab') {
                        return 1;
                    } else return 0;
                },
            },
            microbit2_get_acc: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.xAxis, 'x'],
                            [Lang.Blocks.yAxis, 'y'],
                            [Lang.Blocks.zAxis, 'z'],
                            [Lang.Blocks.scalar, 'mag'],
                        ],
                        value: 'x',
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                ],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_acc',
                },
                paramsKeyMap: {
                    AXIS: 0,
                },
                func: (sprite, script) => {
                    const axis = script.getField('AXIS');
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_ACC,
                        payload: axis,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_gesture: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_boolean_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.up, 'up'],
                            [Lang.Blocks.down, 'down'],
                            [Lang.Blocks.left, 'left'],
                            [Lang.Blocks.right, 'right'],
                            [Lang.Blocks.face_up, 'face up'],
                            [Lang.Blocks.face_down, 'face down'],
                            [Lang.Blocks.freefall, 'freefall'],
                            [Lang.Blocks['3g'], '3g'],
                            [Lang.Blocks['6g'], '6g'],
                            [Lang.Blocks['8g'], '8g'],
                            [Lang.Blocks['shake'], 'shake'],
                        ],
                        value: 'up',
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                ],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_gesture',
                },
                paramsKeyMap: { GESTURE: 0 },
                func: (sprite, script) => {
                    const gesture = script.getField('GESTURE');

                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_GESTURE,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    if (gesture === parsedResponse[1]) {
                        return true;
                    }
                    return false;
                },
            },
            microbit2_get_direction: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_direction',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_DIRECTION,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_field_strength_axis: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.xAxis, 'x'],
                            [Lang.Blocks.yAxis, 'y'],
                            [Lang.Blocks.zAxis, 'z'],
                            [Lang.Blocks.scalar, 'mag'],
                        ],
                        value: 'x',
                        fontSize: 11,
                        bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                        arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                    },
                ],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_field_strength_axis',
                },
                paramsKeyMap: {
                    AXIS: 0,
                },
                func: (sprite, script) => {
                    const axis = script.getField('AXIS');
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_FIELD_STRENGTH,
                        payload: axis,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_light_level: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_light_level',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_LIGHT_LEVEL,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_temperature: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                class: 'microbit2Sensor',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_temperature',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_TEMPERATURE,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_get_sound_level: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_string_field',
                statements: [],
                params: [],
                events: {},
                class: 'microbit2v2',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_sound_level',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_SOUND_LEVEL,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return parsedResponse[1];
                },
            },
            microbit2_set_pwm: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: this.analogPins,
                        value: 0,
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
                        type: 'Dropdown',
                        options: [
                            ['ms', 'milli'],
                            ['??s', 'micro'],
                        ],
                        value: 'milli',
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
                class: 'microbit2Servo',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_set_pwm',
                },
                paramsKeyMap: {
                    PIN: 0,
                    VALUE: 1,
                    UNIT: 2,
                },
                func: (sprite, script) => {
                    const pin = script.getValue('PIN');
                    const unit = script.getValue('UNIT');
                    const value = Math.round(_clamp(script.getNumberValue('VALUE'), 0, 1023));
                    const command =
                        unit === 'milli'
                            ? this.functionKeys.SET_SERVO_MILLI
                            : this.functionKeys.SET_SERVO_MICRO;

                    const parsedPayload = `${pin};${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_SERVO_MILLI,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return;
                },
            },
            microbit2_set_servo: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: this.majorPins,
                        value: 0,
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
                class: 'microbit2Servo',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_set_servo',
                },
                paramsKeyMap: {
                    PIN: 0,
                    VALUE: 1,
                },
                func: (sprite, script) => {
                    const pin = script.getValue('PIN');
                    const value = Math.round(_clamp(script.getNumberValue('VALUE'), 0, 180));

                    const parsedPayload = `${pin};${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.SET_SERVO_ANGLE,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                    return;
                },
            },
            microbit2_get_logo: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic_boolean_field',
                statements: [],
                params: [],
                events: {},
                class: 'microbit2v2',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_get_logo',
                },
                paramsKeyMap: {},
                func: (sprite, script) => {
                    if (this.version === '1') {
                        throw new RoCode.Utils.IncompatibleError('IncompatibleError', [
                            Lang.Msgs.microbit2_compatible_error,
                        ]);
                    }
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.GET_LOGO,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);

                    if (parsedResponse[1] == '1') {
                        return 1;
                    } else return 0;
                },
            },
            microbit2_speaker_toggle: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.on, this.functionKeys.SPEAKER_ON],
                            [Lang.Blocks.off, this.functionKeys.SPEAKER_OFF],
                        ],
                        value: this.functionKeys.SPEAKER_ON,
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
                class: 'microbit2v2',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_speaker_toggle',
                },
                paramsKeyMap: { VALUE: 0 },
                func: (sprite, script) => {
                    if (this.version === '1') {
                        throw new RoCode.Utils.IncompatibleError('IncompatibleError', [
                            Lang.Msgs.microbit2_compatible_error,
                        ]);
                    }
                    const command = script.getField('VALUE');
                    const reqOptions = {
                        id: script.entity.id,
                        command,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
            microbit2_play_sound_effect: {
                color: RoCodeStatic.colorSet.block.default.HARDWARE,
                outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
                fontColor: '#ffffff',
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.Blocks.GIGGLE, 21],
                            [Lang.Blocks.HAPPY, 22],
                            [Lang.Blocks.HELLO, 23],
                            [Lang.Blocks.MYSTERIOUS, 24],
                            [Lang.Blocks.SAD, 25],
                            [Lang.Blocks.SLIDE, 26],
                            [Lang.Blocks.SOARING, 27],
                            [Lang.Blocks.SPRING, 28],
                            [Lang.Blocks.TWINKLE, 29],
                            [Lang.Blocks.YAWN, 30],
                        ],
                        value: 21,
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
                class: 'microbit2v2',
                isNotFor: ['microbit2'],
                def: {
                    type: 'microbit2_play_sound_effect',
                },
                paramsKeyMap: {
                    VALUE: 0,
                },
                func: (sprite, script) => {
                    if (this.version === '1') {
                        throw new RoCode.Utils.IncompatibleError('IncompatibleError', [
                            Lang.Msgs.microbit2_compatible_error,
                        ]);
                    }
                    const value = _clamp(script.getNumberValue('VALUE'), 21, 30);
                    const parsedPayload = `${value}`;
                    const reqOptions = {
                        id: script.entity.id,
                        command: this.functionKeys.PLAY_SOUND,
                        payload: parsedPayload,
                    };
                    this.requestCommandWithResponse(reqOptions);
                    const parsedResponse = this.getResponse(reqOptions);
                },
            },
        };
    };
})();

module.exports = RoCode.Microbit2;
