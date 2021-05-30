'use strict';

import { Destroyer } from './destroyer/Destroyer';
import { GEHelper } from '../graphicEngine/GEHelper';
import Expansion from '../class/Expansion';
import RoCodeBlockHelper from '../class/helper';
import AIUtilize from '../class/AIUtilize';
import AILearning from '../class/AILearning';
import Extension from '../extensions/extension';
import CloudVariable from '../extensions/CloudVariable';

import './utils';

/**
 * Initialize method with options.
 * @param {HTMLElement} container for RoCode workspace or others.
 * @param {Object} options for initialize.
 */
RoCode.init = function(container, options) {
    RoCode.assert(typeof options === 'object', 'Init option is not object');
    RoCode.assert(!!container, 'root container must be provided');

    this.events_ = {};
    this.interfaceState = {
        menuWidth: 264,
    };

    RoCode.Utils.bindGlobalEvent([
        'resize',
        'mousedown',
        'mousemove',
        'keydown',
        'keyup',
        'dispose',
    ]);

    this.options = options;
    this.parseOptions(options);
    setDefaultPathsFromOptions(options);
    this.cloudVariable = CloudVariable.getInstance();

    if (this.type === 'workspace' && this.isPhone()) {
        this.type = 'phone';
    }
    this.initialize_();
    this.initSoundQueue_();
    /** @type {!Element} */
    this.view_ = container;
    $(this.view_).addClass('RoCode');
    if (this.type === 'minimize') {
        $(this.view_).addClass(this.type);
    }
    // if (this.device === 'tablet') $(this.view_).addClass('tablet');

    RoCode.initFonts(options.fonts);
    setDefaultTheme(options);

    RoCode.paintMode = options.paintMode || 'literallycanvas';
    container && this.createDom(container, this.type);
    this.loadInterfaceState();
    this.overridePrototype();
    this.maxCloneLimit = 360;
    this.cloudSavable = true;
    this.startTime = new Date().getTime();

    document.onkeydown = function(e) {
        RoCode.dispatchEvent('keyPressed', e);
    };
    document.onkeyup = function(e) {
        RoCode.dispatchEvent('keyUpped', e);
    };
    window.onresize = function(e) {
        RoCode.dispatchEvent('windowResized', e);
    };
    window.onbeforeunload = this.beforeUnload;

    RoCode.addEventListener('saveWorkspace', () => {
        RoCode.addActivity('save');
    });

    RoCode.addEventListener('showBlockHelper', () => {
        RoCode.propertyPanel.select('helper');
    });

    // if (RoCode.getBrowserType().substr(0, 2) === 'IE' && !window.flashaudio) {
    //     createjs.FlashAudioPlugin.swfPath = `${this.mediaFilePath}media/`;
    //     createjs.Sound.registerPlugins([createjs.FlashAudioPlugin]);
    //     window.flashaudio = true;
    // } else {
    //     createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
    // }
    createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);

    RoCode.loadAudio_(
        [
            `${RoCode.mediaFilePath}sounds/click.mp3`,
            `${RoCode.mediaFilePath}sounds/click.wav`,
            `${RoCode.mediaFilePath}sounds/click.ogg`,
        ],
        'RoCodeMagneting'
    );
    RoCode.loadAudio_(
        [
            `${RoCode.mediaFilePath}sounds/delete.mp3`,
            `${RoCode.mediaFilePath}sounds/delete.ogg`,
            `${RoCode.mediaFilePath}sounds/delete.wav`,
        ],
        'RoCodeDelete'
    );

    createjs.Sound.stop();
    BigNumber.config({ ERRORS: false });
};

const setDefaultPathsFromOptions = function(options) {
    const {
        libDir = '/lib',
        defaultDir = '',
        soundDir = '',
        blockInjectDir = '',
        baseUrl = location.origin || 'https://playRoCode.org',
    } = options;

    RoCode.mediaFilePath = `${libDir}/RoCode-js/images/`;
    RoCode.painterBaseUrl = `${libDir}/literallycanvas-mobile/lib/img`;
    RoCode.defaultPath = defaultDir;
    RoCode.soundPath = soundDir;
    RoCode.blockInjectPath = blockInjectDir;

    RoCode.baseUrl = baseUrl.replace(/\/$/, '');
    RoCode.moduleBaseUrl = `${RoCode.baseUrl}/modules/`;
};

const setDefaultTheme = function(options) {
    const { theme = 'default' } = options;
    if (theme !== 'default') {
        try {
            RoCodeStatic.colorSet = require(`../theme/${theme}`);
            require('../playground/block_RoCode').assignBlocks();
        } catch (e) {
            console.log('not exist theme!', e);
        }
    }
};

RoCode.changeContainer = function(container) {
    container.appendChild(this.view_);
};

RoCode.loadAudio_ = function(filenames, name) {
    if (!window.Audio || !filenames.length) {
        // No browser support for Audio.
        return;
    }

    for (let i = 0; i < filenames.length; i++) {
        const filename = filenames[i];
        RoCode.soundQueue.loadFile({
            id: name,
            src: filename,
            type: createjs.LoadQueue.SOUND,
        });
        break;
    }
};

/**
 * Initialize function for RoCode.
 * @private
 */
RoCode.initialize_ = function() {
    /** @type {Destroyer} */
    this._destroyer = this._destroyer || new Destroyer();
    this._destroyer.destroy();

    GEHelper.INIT(this.options.useWebGL);
    this.stage = new RoCode.Stage();
    this._destroyer.add(this.stage);

    if (RoCode.engine && RoCode.engine.projectTimer) {
        RoCode.engine.clearTimer();
    }

    this.engine = new RoCode.Engine();
    this._destroyer.add(this.engine);

    if (this.type !== 'minimize') {
        this.propertyPanel = new RoCode.PropertyPanel();
    }

    this.container = new RoCode.Container();
    this._destroyer.add(this.container);

    this.helper = new RoCodeBlockHelper();
    this.youtube = new RoCode.Youtube();
    // this.tvCast = new RoCode.TvCast();
    // this.doneProject = new RoCode.DoneProject();

    this.variableContainer = new RoCode.VariableContainer();

    if (this.type === 'workspace' || this.type === 'phone' || this.type === 'playground') {
        this.stateManager = new RoCode.StateManager();
    }
    this.commander = new RoCode.Commander(this.type, this.doNotSkipAny);

    this.scene = new RoCode.Scene();
    this._destroyer.add(this.scene);

    this.playground = new RoCode.Playground();
    this._destroyer.add(this.playground);

    this.expansion = new Expansion(this.playground);
    this._destroyer.add(this.expansion);

    this.aiUtilize = new AIUtilize(this.playground);
    this._destroyer.add(this.aiUtilize);

    this.aiLearning = new AILearning(this.playground, this.aiLearningEnable);
    this._destroyer.add(this.aiLearning);

    this.intro = new RoCode.Intro();

    this.toast = new RoCode.Toast();

    if (this.hw) {
        this.hw.closeConnection();
    }
    this.hw = new RoCode.HW();

    if (RoCode.enableActivityLogging) {
        this.reporter = new RoCode.Reporter(false);
    } else if (this.type === 'workspace' || this.type === 'phone') {
        this.reporter = new RoCode.Reporter(true);
    }
};

RoCode.disposeContainer = function() {
    while (this.view_.firstChild) {
        this.view_.removeChild(this.view_.firstChild);
    }
};

RoCode.initSoundQueue_ = function() {
    RoCode.soundQueue = new createjs.LoadQueue();
    RoCode.soundQueue.installPlugin(createjs.Sound);
    RoCode.soundInstances = [];
    RoCode.soundQueue.urls = new Set();
    RoCode.soundQueue.total = 0;
    RoCode.soundQueue.loadCallback = (src) => {
        if (!RoCode.soundQueue.urls.has(src)) {
            return;
        }
        RoCode.soundQueue.total = Math.max(RoCode.soundQueue.total, RoCode.soundQueue.urls.size);
        RoCode.soundQueue.urls.delete(src);
        const now = RoCode.soundQueue.urls.size;
        if (!RoCode.soundQueue.loadComplete && now < 1) {
            RoCode.soundQueue.loadComplete = true;
            RoCode.dispatchEvent('soundLoaded');
        }
    };
    RoCode.soundQueue.on('fileload', (event) => {
        RoCode.soundQueue.loadCallback(event.item.src);
    });
    RoCode.soundQueue.on('error', (event) => {
        console.error('load sound, error', event);
        RoCode.soundQueue.loadCallback(event.data.src);
    });
};
/**
 * Initialize html DOM view for RoCode.
 * This work differently with initialize option.
 * @param {HTMLElement} container for RoCode workspace or others.
 * @param {string} type for create dom by type.
 */
RoCode.createDom = function(container, type) {
    const textCanvasContainer = RoCode.createElement('div', 'textCanvasContainer');
    textCanvasContainer.style.display = 'none';
    container.appendChild(textCanvasContainer);

    switch (type) {
        case 'minimize': {
            const canvas = _createCanvasElement(['RoCodeCanvasWorkspace', 'minimize']);
            const canvasWrapper = RoCode.createElement('div', 'RoCodeCanvasWrapper');
            canvasWrapper.appendChild(canvas);
            container.appendChild(canvasWrapper);

            this.canvas_ = canvas;
            this.stage.initStage(this.canvas_);

            const engineView = RoCode.createElement('div');
            container.appendChild(engineView);
            this.engineView = engineView;
            this.engine.generateView(this.engineView, type);
            break;
        }
        case 'phone': {
            this.stateManagerView = RoCode.createElement('div');
            this.stateManager.generateView(this.stateManagerView, type);

            const engineView = RoCode.createElement('div');
            container.appendChild(engineView);
            this.engineView = engineView;
            this.engine.generateView(this.engineView, type);

            const canvas = _createCanvasElement('RoCodeCanvasPhone');

            engineView.insertBefore(canvas, this.engine.footerView_);
            this.canvas_ = canvas;
            this.stage.initStage(this.canvas_);

            const containerView = RoCode.createElement('div');
            container.appendChild(containerView);
            this.containerView = containerView;
            this.container.generateView(this.containerView);

            const playgroundView = RoCode.createElement('div');
            container.appendChild(playgroundView);
            this.playgroundView = playgroundView;
            this.playground.generateView(this.playgroundView, type);
            break;
        }
        case 'playground': {
            const playgroundView = RoCode.createElement('div');
            container.appendChild(playgroundView);
            this.playgroundView = playgroundView;
            this.playground.generateView(this.playgroundView, type);
            break;
        }
        case 'invisible': {
            // 아무런 뷰도 그리지 않는다.
            break;
        }
        case 'workspace':
        default: {
            RoCode.documentMousedown.attach(this, this.cancelObjectEdit);

            const sceneView = RoCode.createElement('div');
            container.appendChild(sceneView);
            this.sceneView = sceneView;
            this.scene.generateView(this.sceneView, type);

            const stateManagerView = RoCode.createElement('div');
            this.sceneView.appendChild(stateManagerView);
            this.stateManagerView = stateManagerView;
            this.stateManager.generateView(this.stateManagerView, type);

            const engineContainer = RoCode.createElement('div');
            engineContainer.classList.add('engineContainer');
            container.appendChild(engineContainer);
            const engineView = RoCode.createElement('div');
            engineContainer.appendChild(engineView);
            this.engineContainer = engineContainer;
            this.engineView = engineView;
            this.engine.generateView(this.engineView, type);

            const canvas = _createCanvasElement('RoCodeCanvasWorkspace');
            engineView.insertBefore(canvas, this.engine.buttonWrapper);

            canvas.addEventListener('mousewheel', (evt) => {
                const mousePosition = RoCode.stage.mouseCoordinate;
                const tempList = RoCode.variableContainer.getListById(mousePosition);
                const wheelDirection = evt.wheelDelta > 0;

                for (let i = 0; i < tempList.length; i++) {
                    const list = tempList[i];
                    if (wheelDirection) {
                        if (list.scrollButton_.y >= 46) {
                            list.scrollButton_.y -= 23;
                        } else {
                            list.scrollButton_.y = 23;
                        }
                    } else {
                        list.scrollButton_.y += 23;
                    }
                    list.updateView();
                }
            });

            this.canvas_ = canvas;
            this.extension = new Extension();
            this.stage.initStage(this.canvas_);

            const containerView = RoCode.createElement('div');
            this.propertyPanel.generateView(engineContainer, type);
            this.containerView = containerView;
            this.container.generateView(this.containerView);
            this.propertyPanel.addMode('object', this.container);

            this.helper.generateView(this.containerView, type);
            this.propertyPanel.addMode('helper', this.helper);

            const introView = RoCode.createElement('div');
            container.appendChild(introView);
            this.introView = introView;
            this.intro.generateView(this.introView, type);

            const playgroundView = RoCode.createElement('div');
            container.appendChild(playgroundView);
            this.playgroundView = playgroundView;
            this.playground.generateView(this.playgroundView, type);

            this.propertyPanel.select('object');
            this.helper.bindWorkspace(this.playground.mainWorkspace);
        }
    }
};

/**
 * @param className {string|string[]}
 * @private
 */
const _createCanvasElement = (className) => {
    const canvas = RoCode.createElement('canvas');
    canvas.id = 'RoCodeCanvas';
    canvas.width = 640;
    canvas.height = 360;

    if (Array.isArray(className)) {
        canvas.className = className.join(' ');
    } else {
        canvas.addClass(className);
    }

    return canvas;
};

RoCode.start = function() {
    if (RoCode.type === 'invisible') {
        return;
    }
    /** @type {number} */
    if (!this.FPS) {
        this.FPS = 60;
    }
    RoCode.assert(typeof this.FPS === 'number', 'FPS must be number');
    RoCode.engine.start(this.FPS);
};

RoCode.stop = function() {
    if (RoCode.type === 'invisible') {
        return;
    }
    this.FPS = null;
    RoCode?.engine?.stop();
};

/**
 * Parse init options
 * @param {!object} options for parse
 */
RoCode.parseOptions = function(options) {
    /** @type {string} */
    this.type = options.type || this.type;

    this.hashId = options.hashId || this.hashId;

    if (options.device) {
        this.device = options.device;
    }

    this.projectSaveable = options.projectsaveable;
    if (this.projectSaveable === undefined) {
        this.projectSaveable = true;
    }

    this.objectAddable = options.objectaddable;
    if (this.objectAddable === undefined) {
        this.objectAddable = true;
    }

    this.objectEditable = options.objectEditable;
    if (this.objectEditable === undefined) {
        this.objectEditable = true;
    }
    if (!this.objectEditable) {
        this.objectAddable = false;
    }

    this.objectDeletable = options.objectdeletable;
    if (this.objectDeletable === undefined) {
        this.objectDeletable = true;
    }

    this.soundEditable = options.soundeditable;
    if (this.soundEditable === undefined) {
        this.soundEditable = true;
    }

    this.pictureEditable = options.pictureeditable;
    if (this.pictureEditable === undefined) {
        this.pictureEditable = true;
    }

    this.sceneEditable = options.sceneEditable;
    if (this.sceneEditable === undefined) {
        this.sceneEditable = true;
    }

    this.functionEnable = options.functionEnable;
    if (this.functionEnable === undefined) {
        this.functionEnable = true;
    }

    this.messageEnable = options.messageEnable;
    if (this.messageEnable === undefined) {
        this.messageEnable = true;
    }

    this.variableEnable = options.variableEnable;
    if (this.variableEnable === undefined) {
        this.variableEnable = true;
    }

    this.aiLearningEnable = options.aiLearningEnable;
    if (this.aiLearningEnable === undefined) {
        this.aiLearningEnable = true;
    }

    this.hardwareEnable = options.hardwareEnable;
    if (this.hardwareEnable === undefined) {
        this.hardwareEnable = true;
    }

    this.listEnable = options.listEnable;
    if (this.listEnable === undefined) {
        this.listEnable = true;
    }

    this.doCommandAll = options.doCommandAll;
    if (this.doCommandAll === undefined) {
        this.doCommandAll = false;
    }

    this.hasVariableManager = options.hasvariablemanager;
    if (!(this.variableEnable || this.messageEnable || this.listEnable || this.functionEnable)) {
        this.hasVariableManager = false;
    } else if (this.hasVariableManager === undefined) {
        this.hasVariableManager = true;
    }

    this.readOnly = options.readOnly || false;
    if (this.readOnly) {
        this.soundEditable = false;
        this.sceneEditable = false;
        this.objectAddable = false;
    }

    if (options.isForLecture) {
        this.isForLecture = options.isForLecture;
    }
    if (options.textCodingEnable) {
        this.textCodingEnable = options.textCodingEnable;
    }
};

RoCode.initFonts = function(fonts) {
    this.fonts = fonts;
    if (!fonts) {
        this.fonts = [];
    }
};

RoCode.reloadOption = function(options) {
    this.options = options;
    this.parseOptions(options);
    this.playground.applyTabOption();
    this.variableContainer.applyOption();
    this.engine.applyOption();
    this.commander.applyOption();
};

RoCode.Utils.initRoCodeEvent_ = function() {
    if (!RoCode.events_) {
        RoCode.events_ = [];
    }
};

/**
 * initialize sound
 * @param {object} sound
 */
RoCode.initSound = function(sound) {
    if (!sound || !sound.duration || sound.duration == 0) {
        return;
    }
    sound.path =
        sound.fileurl ||
        `${RoCode.defaultPath}/uploads/${sound.filename.substring(0, 2)}/${sound.filename.substring(
            2,
            4
        )}/${RoCode.soundPath}${sound.filename}${sound.ext || '.mp3'}`;
    RoCode.soundQueue.urls.add(sound.path);
    RoCode.soundQueue.loadFile({
        id: sound.id,
        src: sound.path,
        type: createjs.LoadQueue.SOUND,
    });
    setTimeout(() => {
        RoCode.soundQueue.loadCallback(sound.path);
    }, 3000);
};
