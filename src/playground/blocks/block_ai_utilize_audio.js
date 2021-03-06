import AudioUtils from '../../util/audioUtils';

RoCode.AI_UTILIZE_BLOCK.audio = {
    name: 'audio',
    imageName: 'audio.svg',
    sponserText: 'Powered by NAVER Clova',
    title: {
        ko: '오디오 감지',
        en: 'Audio Detection',
        jp: 'オーディオ検出',
    },
    titleKey: 'template.audio_title_text',
    description: Lang.Msgs.ai_utilize_audio_description,
    descriptionKey: 'Msgs.ai_utilize_audio_description',
    isInitialized: false,
    async init() {
        await AudioUtils.initialize();
        RoCode.AI_UTILIZE_BLOCK.audio.isInitialized = true;
    },
};

RoCode.AI_UTILIZE_BLOCK.audio.getBlocks = function() {
    return {
        audio_title: {
            skeleton: 'basic_text',
            color: RoCodeStatic.colorSet.common.TRANSPARENT,
            params: [
                {
                    type: 'Text',
                    text: Lang.template.audio_title_text,
                    color: RoCodeStatic.colorSet.common.TEXT,
                    align: 'center',
                },
            ],
            def: {
                type: 'audio_title',
            },
            class: 'audio',
            isNotFor: ['audio'],
            events: {},
        },
        check_microphone: {
            color: RoCodeStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: RoCodeStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'check_microphone',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'audio',
            isNotFor: ['audio'],
            async func(sprite, script) {
                if (!AudioUtils.isInitialized) {
                    await AudioUtils.initialize();
                }
                return AudioUtils.audioInputList.length > 0;
            },
            syntax: {
                js: [],
                py: [],
            },
        },

        speech_to_text_convert: {
            color: RoCodeStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: RoCodeStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/ai_utilize_icon.svg',
                    size: 11,
                },
            ],
            events: {},
            def: {
                type: 'speech_to_text_convert',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'audio',
            isNotFor: ['audio'],
            async func(sprite, script) {
                if (!AudioUtils.isInitialized) {
                    await AudioUtils.initialize();
                }
                if (AudioUtils.isRecording) {
                    return;
                }
                try {
                    AudioUtils.isRecording = true;
                    RoCode.container.enableSttValue();
                    const result = await AudioUtils.startRecord(60 * 1000);
                    RoCode.dispatchEvent('audioRecordingDone');
                    RoCode.container.setSttValue(result || 0);
                } catch (e) {
                    RoCode.container.setSttValue(0);
                    throw e;
                }
            },
            syntax: {
                js: [],
                py: [],
            },
        },

        speech_to_text_get_value: {
            color: RoCodeStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: RoCodeStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'speech_to_text_get_value',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'audio',
            isNotFor: ['audio'],
            func(sprite, script) {
                return RoCode.container.getSttValue();
            },
            syntax: {
                js: [],
                py: [],
            },
        },

        get_microphone_volume: {
            color: RoCodeStatic.colorSet.block.default.AI_UTILIZE,
            outerLine: RoCodeStatic.colorSet.block.darken.AI_UTILIZE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [],
            events: {},
            def: {
                type: 'get_microphone_volume',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'audio',
            isNotFor: ['audio'],
            async func(sprite, script) {
                if (!AudioUtils.isInitialized) {
                    await AudioUtils.initialize();
                }
                return AudioUtils.currentVolume;
            },
            syntax: {
                js: [],
                py: [],
            },
        },
    };
};
