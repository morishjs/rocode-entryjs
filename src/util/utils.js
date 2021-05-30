'use strict';

import { GEHelper } from '../graphicEngine/GEHelper';
import _uniq from 'lodash/uniq';
import _intersection from 'lodash/intersection';
import _clamp from 'lodash/clamp';
import FontFaceOnload from 'fontfaceonload';
import DataTable from '../class/DataTable';
import RoCodeModuleLoader from '../class/RoCodeModuleLoader';
import { bignumber, chain } from 'mathjs';

RoCode.Utils = {};

RoCode.TEXT_ALIGN_CENTER = 0;

RoCode.TEXT_ALIGN_LEFT = 1;

RoCode.TEXT_ALIGN_RIGHT = 2;

RoCode.TEXT_ALIGNS = ['center', 'left', 'right'];

RoCode.clipboard = null;

/**
 * Load project
 * @param {*} project
 */
RoCode.loadProject = function(project) {
    if (!project) {
        project = RoCode.getStartProject(RoCode.mediaFilePath);
    }
    if (this.type === 'workspace') {
        RoCode.stateManager.startIgnore();
    }
    RoCode.projectId = project._id;
    RoCode.variableContainer.setVariables(RoCode.Utils.combineCloudVariable(project));
    RoCode.variableContainer.setMessages(project.messages);
    RoCode.variableContainer.setFunctions(project.functions);
    DataTable.setTables(project.tables);
    RoCode.aiLearning.load(project.learning);
    RoCode.scene.addScenes(project.scenes);
    RoCode.stage.initObjectContainers();
    RoCode.container.setObjects(project.objects);
    RoCode.FPS = project.speed ? project.speed : 60;
    GEHelper.Ticker.setFPS(RoCode.FPS);
    RoCode.aiUtilizeBlocks = project.aiUtilizeBlocks || [];
    if (RoCode.aiUtilizeBlocks.length > 0) {
        for (const type in RoCode.AI_UTILIZE_BLOCK_LIST) {
            if (RoCode.aiUtilizeBlocks.indexOf(type) > -1) {
                RoCode.AI_UTILIZE_BLOCK[type].init();
                if (RoCode.type === 'workspace' || RoCode.type === 'playground') {
                    RoCode.playground.blockMenu.unbanClass(type);
                }
            }
        }
    }

    RoCode.expansionBlocks = project.expansionBlocks || [];
    if (RoCode.expansionBlocks.length > 0) {
        for (const type in RoCode.EXPANSION_BLOCK_LIST) {
            if (RoCode.expansionBlocks.indexOf(type) > -1) {
                RoCode.EXPANSION_BLOCK[type].init();
                if (RoCode.type === 'workspace' || RoCode.type === 'playground') {
                    RoCode.playground.blockMenu.unbanClass(type);
                }
            }
        }
    }

    if (!RoCode.engine.projectTimer) {
        RoCode.variableContainer.generateTimer();
    }

    if (Object.keys(RoCode.container.inputValue).length === 0) {
        RoCode.variableContainer.generateAnswer();
    }
    RoCode.start();
    if (this.options.programmingMode) {
        let mode = this.options.programmingMode;
        if (RoCode.Utils.isNumber(mode)) {
            const pMode = mode;
            mode = {};

            this.mode = mode;
            if (pMode == 0) {
                mode.boardType = RoCode.Workspace.MODE_BOARD;
                mode.textType = -1;
            } else if (pMode == 1) {
                // Python in Text Coding
                mode.boardType = RoCode.Workspace.MODE_VIMBOARD;
                mode.textType = RoCode.Vim.TEXT_TYPE_PY;
                mode.runType = RoCode.Vim.WORKSPACE_MODE;
            } else if (pMode == 2) {
                // Javascript in Text Coding
                mode.boardType = RoCode.Workspace.MODE_VIMBOARD;
                mode.textType = RoCode.Vim.TEXT_TYPE_JS;
                mode.runType = RoCode.Vim.MAZE_MODE;
            }
            RoCode.getMainWS().setMode(mode);
        }
    }

    RoCode.Loader.isLoaded() && RoCode.Loader.handleLoad();

    if (this.type == 'workspace') {
        RoCode.stateManager.endIgnore();
    }

    if (project.interface && RoCode.options.loadInterface) {
        RoCode.loadInterfaceState(project.interface);
    }

    if (window.parent && window.parent.childIframeLoaded) {
        window.parent.childIframeLoaded();
    }
    return project;
};

RoCode.clearProject = function() {
    try {
        RoCode.stop();
        RoCode.projectId = null;
        RoCode.variableContainer.clear();
        RoCode.container.clear();
        RoCode.scene.clear();
        RoCode.stateManager.clear();
        DataTable.clear();
        GEHelper.resManager.clearProject();
        RoCode.Loader && (RoCode.Loader.loaded = false);

        if (RoCode.type !== 'invisible') {
            RoCode.playground && RoCode.playground.changeViewMode('code');
        }
    } catch (e) {
        console.warn('clearProject fail', e);
    }
};

/**
 * Export project
 * @param {?Project} project
 */
RoCode.exportProject = function(project) {
    if (!project) {
        project = {};
    }

    if (!RoCode.engine.isState('stop')) {
        RoCode.engine.toggleStop();
    }
    project.objects = RoCode.container.toJSON();
    const objects = project.objects;
    project.scenes = RoCode.scene.toJSON();
    project.variables = RoCode.variableContainer.getVariableJSON();
    project.messages = RoCode.variableContainer.getMessageJSON();
    project.functions = RoCode.variableContainer.getFunctionJSON();
    project.tables = DataTable.getTableJSON();
    project.speed = RoCode.FPS;
    project.interface = RoCode.captureInterfaceState();
    project.expansionBlocks = RoCode.expansionBlocks;
    project.aiUtilizeBlocks = RoCode.aiUtilizeBlocks;
    project.learning = RoCode.aiLearning.toJSON();
    project.externalModules = RoCodeModuleLoader.moduleList;

    if (!objects || !objects.length) {
        return false;
    }

    return project;
};

/**
 * inject blocks to RoCode menu.
 * Available block is different by object type.
 * @param {!string} objectType
 * @param {!xml} XML
 */
RoCode.setBlock = function(objectType, XML) {
    RoCode.playground.setMenuBlock(objectType, XML);
};

/**
 * This method is called when window closed;
 * @param {event} e
 */
RoCode.beforeUnload = function(e) {
    RoCode.dispatchEvent('RoCodeBeforeUnload');
    RoCode.hw.closeConnection();
    if (RoCode.type === 'workspace') {
        if (localStorage && RoCode.interfaceState) {
            localStorage.setItem(
                'workspace-interface',
                JSON.stringify(RoCode.captureInterfaceState())
            );
        }
        if (!RoCode.stateManager.isSaved()) {
            return Lang.Workspace.project_changed;
        }
    }
};

RoCode.captureInterfaceState = function() {
    const interfaceState = JSON.parse(JSON.stringify(RoCode.interfaceState));
    const playground = RoCode.playground;
    if (RoCode.type === 'workspace' && playground && playground.object) {
        interfaceState.object = playground.object.id;
    }

    return interfaceState;
};

/**
 * load interface state by localstorage
 */
RoCode.loadInterfaceState = function(interfaceState) {
    if (RoCode.type === 'workspace') {
        if (interfaceState) {
            RoCode.container.selectObject(interfaceState.object, true);
        } else if (localStorage && localStorage.getItem('workspace-interface')) {
            const interfaceModel = localStorage.getItem('workspace-interface');
            interfaceState = JSON.parse(interfaceModel);
        } else {
            interfaceState = {
                menuWidth: 280,
                canvasWidth: 480,
            };
        }
        this.resizeElement(interfaceState);
    }
};

/**
 * @return {Number} return up time time stamp
 */
RoCode.getUpTime = function() {
    return new Date().getTime() - this.startTime;
};

/**
 * @param {String} activityType
 */
RoCode.addActivity = function(activityType) {
    if (RoCode.stateManager) {
        RoCode.stateManager.addActivity(activityType);
    }
};

RoCode.startActivityLogging = function() {
    if (RoCode.reporter) {
        RoCode.reporter.start(
            RoCode.projectId,
            window.user ? window.user._id : null,
            RoCode.startTime
        );
    }
};

/**
 * return activity log
 * @return {object}
 */
RoCode.getActivityLog = function() {
    const log = {};
    if (RoCode.stateManager) {
        log.activityLog = RoCode.stateManager.activityLog_;
    }
    return log;
};
//block drag mode for RoCode.BlockView
RoCode.DRAG_MODE_NONE = 0;
RoCode.DRAG_MODE_MOUSEDOWN = 1;
RoCode.DRAG_MODE_DRAG = 2;

RoCode.cancelObjectEdit = function({ target, type }) {
    const object = RoCode.playground.object;
    if (!object) {
        return;
    }
    const objectView = object.view_;
    const isCurrent = $(objectView).find(target).length !== 0;
    const tagName = target.tagName.toUpperCase();
    if (!object.isEditing || (tagName === 'INPUT' && isCurrent) || type === 'touchstart') {
        return;
    }
    object.editObjectValues(false);
};

RoCode.getMainWS = function() {
    let ret;
    if (RoCode.mainWorkspace) {
        ret = RoCode.mainWorkspace;
    } else if (RoCode.playground && RoCode.playground.mainWorkspace) {
        ret = RoCode.playground.mainWorkspace;
    }
    return ret;
};

RoCode.getDom = function(query) {
    if (!query) {
        return this.view_;
    }

    query = JSON.parse(JSON.stringify(query));
    if (query.length > 1) {
        const key = query.shift();
        return this[key].getDom(query);
    } else {
    }
};

/**
 * Resize element's size.
 * @param {!json} interfaceModel
 */
RoCode.resizeElement = function(interfaceModel) {
    // 워크 스페이스에 style width / height 값을 임시로 막음.
    // return;
    const mainWorkspace = RoCode.getMainWS();
    if (!mainWorkspace) {
        return;
    }

    if (!interfaceModel) {
        interfaceModel = this.interfaceState;
    }

    if (RoCode.type === 'workspace') {
        const interfaceState = this.interfaceState;
        if (!interfaceModel.canvasWidth && interfaceState.canvasWidth) {
            interfaceModel.canvasWidth = interfaceState.canvasWidth;
        }
        if (!interfaceModel.menuWidth && this.interfaceState.menuWidth) {
            interfaceModel.menuWidth = interfaceState.menuWidth;
        }

        if (RoCode.engine.speedPanelOn) {
            RoCode.engine.toggleSpeedPanel();
        }

        let canvasSize = interfaceModel.canvasWidth;
        if (!canvasSize) {
            canvasSize = 324;
        } else if (canvasSize < 324) {
            canvasSize = 324;
        } else if (canvasSize > 640) {
            canvasSize = 640;
        }
        interfaceModel.canvasWidth = canvasSize;

        const engineContainer = RoCode.engine.view_.parentElement;
        engineContainer.style.width = `${canvasSize}px`;
        RoCode.engine.view_.style.width = `${canvasSize - 24}px`;
        RoCode.stage.canvas.canvas.style.width = `${canvasSize - 26}px`;

        let menuWidth = interfaceModel.menuWidth;
        if (!menuWidth) {
            menuWidth = 258;
        } else if (menuWidth < 258) {
            menuWidth = 258;
        } else if (menuWidth > 308) {
            menuWidth = 308;
        }
        interfaceModel.menuWidth = menuWidth;

        const blockMenu = mainWorkspace.blockMenu;
        const adjust = blockMenu.hasCategory() ? -64 : 0;

        $('.blockMenuContainer').css({ width: `${menuWidth + adjust}px` });
        $('.blockMenuContainer>div').css({ width: `${menuWidth + adjust - 2}px` });
        blockMenu.setWidth();
        $('.RoCodeWorkspaceBoard').css({ left: `${menuWidth - 4}px` });
        RoCode.playground.resizeHandle_.style.left = `${menuWidth - 4}px`;
        RoCode.playground.variableViewWrapper_.style.width = `${menuWidth - 4}px`;

        this.interfaceState = interfaceModel;
    }

    RoCode.windowResized.notify();
};

/**
 * override native prototype to add useful method.
 */
RoCode.overridePrototype = function() {
    /** modulo include negative number */
    Number.prototype.mod = function(n) {
        try {
            // 음수 보정을 위해서 존재하는 기능
            // INFO : https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
            const left = bignumber(this);
            const right = bignumber(n);
            return chain(left)
                .mod(right)
                .add(right)
                .mod(right)
                .value.toNumber();
        } catch (e) {
            return ((this % n) + n) % n;
        }
    };

    //polyfill
    if (!String.prototype.repeat) {
        String.prototype.repeat = function(count) {
            'use strict';
            if (this == null) {
                throw new TypeError(`can't convert ${this} to object`);
            }
            let str = `${this}`;
            count = +count;
            if (count != count) {
                count = 0;
            }
            if (count < 0) {
                throw new RangeError('repeat count must be non-negative');
            }
            if (count == Infinity) {
                throw new RangeError('repeat count must be less than infinity');
            }
            count = Math.floor(count);
            if (str.length == 0 || count == 0) {
                return '';
            }
            // Ensuring count is a 31-bit integer allows us to heavily optimize the
            // main part. But anyway, most current (August 2014) browsers can't handle
            // strings 1 << 28 chars or longer, so:
            if (str.length * count >= 1 << 28) {
                throw new RangeError('repeat count must not overflow maximum string size');
            }
            let rpt = '';
            for (;;) {
                if ((count & 1) == 1) {
                    rpt += str;
                }
                count >>>= 1;
                if (count == 0) {
                    break;
                }
                str += str;
            }
            // Could we try:
            // return Array(count + 1).join(this);
            return rpt;
        };
    }
};

// INFO: 기존에 사용하던 isNaN에는 숫자 체크의 문자가 있을수 있기때문에 regex로 체크하는 로직으로 변경
// isNaN 문제는 https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/isNaN
// 에서 확인.
RoCode.Utils.isNumber = function(num) {
    if (typeof num === 'number') {
        return true;
    }
    const reg = /^-?\d+\.?\d*$/;
    if (typeof num === 'string' && reg.test(num)) {
        return true;
    }
    return false;
};

RoCode.Utils.generateId = function() {
    return `0000${((Math.random() * Math.pow(36, 4)) << 0).toString(36)}`.substr(-4);
};

RoCode.Utils.randomColor = function() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

RoCode.Utils.isPointInMatrix = function(matrix, point, offset) {
    offset = offset === undefined ? 0 : offset;
    const x = matrix.offsetX ? matrix.x + matrix.offsetX : matrix.x;
    const y = matrix.offsetY ? matrix.y + matrix.offsety : matrix.y;
    return (
        x - offset <= point.x &&
        x + matrix.width + offset >= point.x &&
        y - offset <= point.y &&
        y + matrix.height + offset >= point.y
    );
};

RoCode.Utils.colorDarken = function(color, factor) {
    let r;
    let g;
    let b;
    if (color.length === 7) {
        r = parseInt(color.substr(1, 2), 16);
        g = parseInt(color.substr(3, 2), 16);
        b = parseInt(color.substr(5, 2), 16);
    } else {
        r = parseInt(color.substr(1, 2), 16);
        g = parseInt(color.substr(2, 2), 16);
        b = parseInt(color.substr(3, 2), 16);
    }

    factor = factor === undefined ? 0.7 : factor;
    r = inspect(Math.floor(r * factor).toString(16));
    g = inspect(Math.floor(g * factor).toString(16));
    b = inspect(Math.floor(b * factor).toString(16));

    function inspect(val) {
        if (val.length != 2) {
            val = `0${val}`;
        }
        return val;
    }

    return `#${r}${g}${b}`;
};

RoCode.Utils.colorLighten = function(color, amount) {
    function clamp01(val) {
        return Math.min(1, Math.max(0, val));
    }

    amount = amount === 0 ? 0 : amount || 20;
    const hsl = RoCode.Utils.hexToHsl(color);
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return RoCode.Utils.hslToHex(hsl);
};

RoCode.Utils.getEmphasizeColor = function(color) {
    return RoCodeStatic.colorSet.block.emphasize[color] || color;
};

// Take input from [0, n] and return it as [0, 1]
RoCode.Utils.bound01 = function(n, max) {
    function isOnePointZero(n) {
        return typeof n === 'string' && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    function isPercentage(n) {
        return typeof n === 'string' && n.indexOf('%') != -1;
    }

    if (isOnePointZero(n)) {
        n = '100%';
    }

    const processPercent = isPercentage(n);
    n = Math.min(max, Math.max(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if (Math.abs(n - max) < 0.000001) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
};

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
RoCode.Utils.hexToHsl = function(color) {
    let r;
    let g;
    let b;
    if (color.length === 7) {
        r = parseInt(color.substr(1, 2), 16);
        g = parseInt(color.substr(3, 2), 16);
        b = parseInt(color.substr(5, 2), 16);
    } else {
        r = parseInt(color.substr(1, 2), 16);
        g = parseInt(color.substr(2, 2), 16);
        b = parseInt(color.substr(3, 2), 16);
    }

    r = RoCode.Utils.bound01(r, 255);
    g = RoCode.Utils.bound01(g, 255);
    b = RoCode.Utils.bound01(b, 255);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    const hsl = { h, s, l };
    return { h: hsl.h * 360, s: hsl.s, l: hsl.l };
};

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
RoCode.Utils.hslToHex = function(color) {
    let r;
    let g;
    let b;

    const h = RoCode.Utils.bound01(color.h, 360);
    const s = RoCode.Utils.bound01(color.s, 1);
    const l = RoCode.Utils.bound01(color.l, 1);

    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }

    function pad2(c) {
        return c.length == 1 ? `0${c}` : `${c}`;
    }

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const rgb = { r: r * 255, g: g * 255, b: b * 255 };

    const hex = [
        pad2(Math.round(rgb.r).toString(16)),
        pad2(Math.round(rgb.g).toString(16)),
        pad2(Math.round(rgb.b).toString(16)),
    ];

    return `#${hex.join('')}`;
};

RoCode.Utils.setSVGDom = function(SVGDom) {
    RoCode.Utils.SVGDom = SVGDom;
};

RoCode.Utils.bindIOSDeviceWatch = function() {
    const Agent = RoCode.Utils.mobileAgentParser();
    if (Agent.apple.device) {
        let lastHeight = window.innerHeight || document.documentElement.clientHeight;
        let lastSVGDomHeight = 0;
        if (RoCode.Utils.SVGDom) {
            lastSVGDomHeight = RoCode.Utils.SVGDom.height();
        }

        setInterval(() => {
            const nowHeight = window.innerHeight || document.documentElement.clientHeight;
            let SVGDomCheck = false;
            if (RoCode.Utils.SVGDom) {
                const nowSVGDomHeight = RoCode.Utils.SVGDom.height();
                SVGDomCheck = lastSVGDomHeight != nowSVGDomHeight;
                lastSVGDomHeight = nowSVGDomHeight;
            }
            if (lastHeight != nowHeight || SVGDomCheck) {
                RoCode.windowResized.notify();
            }
            lastHeight = nowHeight;
        }, 1000);

        $(window).on('orientationchange', () => {
            RoCode.windowResized.notify();
        });

        window.addEventListener('pagehide', RoCode.beforeUnload);
    }
};

RoCode.Utils.bindGlobalEvent = function(options) {
    const doc = $(document);
    if (options === undefined) {
        options = ['resize', 'mousedown', 'mousemove', 'keydown', 'keyup', 'dispose'];
    }

    if (options.indexOf('resize') > -1) {
        if (RoCode.windowReszied) {
            $(window).off('resize');
            RoCode.windowReszied.clear();
        }
        RoCode.windowResized = new RoCode.Event(window);
        $(window).on('resize', (e) => {
            RoCode.windowResized.notify(e);
        });
        RoCode.Utils.bindIOSDeviceWatch();
    }

    if (options.indexOf('mousedown') > -1) {
        if (RoCode.documentMousedown) {
            doc.off('mousedown');
            RoCode.documentMousedown.clear();
        }
        RoCode.documentMousedown = new RoCode.Event(window);
        doc.on('mousedown', (e) => {
            const selectedBlock = document.querySelector('.selected');
            if (selectedBlock) {
                selectedBlock.classList.remove('selected');
            }
        });
    }

    if (options.indexOf('mousemove') > -1) {
        if (RoCode.documentMousemove) {
            doc.off('touchmove mousemove');
            RoCode.documentMousemove.clear();
        }

        RoCode.mouseCoordinate = {};
        RoCode.documentMousemove = new RoCode.Event(window);
        doc.on('touchmove mousemove', (e) => {
            if (e.originalEvent && e.originalEvent.touches) {
                e = e.originalEvent.touches[0];
            }
            RoCode.documentMousemove.notify(e);
            RoCode.mouseCoordinate.x = e.clientX;
            RoCode.mouseCoordinate.y = e.clientY;
        });
    }

    if (options.indexOf('keydown') > -1) {
        if (RoCode.keyPressed) {
            doc.off('keydown');
            RoCode.keyPressed.clear();
        }
        RoCode.pressedKeys = [];
        RoCode.keyPressed = new RoCode.Event(window);
        doc.on('keydown', (e) => {
            const keyCode = RoCode.Utils.inputToKeycode(e);
            if (!keyCode) {
                return;
            }
            if (RoCode.pressedKeys.indexOf(keyCode) < 0) {
                RoCode.pressedKeys.push(keyCode);
            }
            RoCode.keyPressed.notify(e);
        });
    }

    if (options.indexOf('keyup') > -1) {
        if (RoCode.keyUpped) {
            doc.off('keyup');
            RoCode.keyUpped.clear();
        }
        RoCode.keyUpped = new RoCode.Event(window);
        doc.on('keyup', (e) => {
            const keyCode = RoCode.Utils.inputToKeycode(e);
            if (!keyCode) {
                return;
            }
            const index = RoCode.pressedKeys.indexOf(keyCode);
            if (index > -1) {
                RoCode.pressedKeys.splice(index, 1);
            }
            RoCode.keyUpped.notify(e);
        });
    }

    if (options.indexOf('dispose') > -1) {
        if (RoCode.disposeEvent) {
            RoCode.disposeEvent.clear();
        }
        RoCode.disposeEvent = new RoCode.Event(window);
        if (RoCode.documentMousedown) {
            RoCode.documentMousedown.attach(this, (e) => {
                RoCode.disposeEvent.notify(e);
            });
        }
    }
};
RoCode.Utils.inputToKeycode = (e) => {
    //https://riptutorial.com/jquery/example/21119/originalevent
    const event = e.originalEvent || e;
    let keyCode = event.code == undefined ? event.key : event.code;
    if (!keyCode) {
        return null;
    }
    keyCode = keyCode.replace('Digit', '');
    keyCode = keyCode.replace('Numpad', '');
    if (keyCode.indexOf('Shift') > -1) {
        keyCode = keyCode.replace('Left', '');
        keyCode = keyCode.replace('Right', '');
    }
    return RoCode.KeyboardCode.codeToKeyCode[keyCode];
};

RoCode.Utils.makeActivityReporter = function() {
    RoCode.activityReporter = new RoCode.ActivityReporter();
    if (RoCode.commander) {
        RoCode.commander.addReporter(RoCode.activityReporter);
    }
    return RoCode.activityReporter;
};

/**
 * Raise error when assert condition fail.
 * @param {!boolean} condition assert condition.
 * @param {?string} message assert message will be shown when assert fail.
 */
RoCode.assert = function(condition, message) {
    if (!condition) {
        throw Error(message || 'Assert failed');
    }
};

/**
 * Parse Text to Xml
 * @param {!string} xmlText
 * @param {xml} doc
 */
RoCode.parseTexttoXML = function(xmlText) {
    let doc;
    if (window.ActiveXObject) {
        doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(xmlText);
    } else {
        const parser = new DOMParser();
        doc = parser.parseFromString(xmlText, 'text/xml');
    }
    return doc;
};

/**
 * Create html element with some method
 */
RoCode.createElement = function(type, elementId) {
    const element = type instanceof HTMLElement ? type : document.createElement(type);
    if (elementId) {
        element.id = elementId;
    }

    return element;
};

/**
 * Generate random hash
 * @return {string}
 */
RoCode.generateHash = function(length = 4) {
    return Math.random()
        .toString(36)
        .substr(2, length);
};

/**
 * Add two number properly.
 *
 * @return {number}
 *
 * @param {!number} a
 * @param {!number} b
 */
RoCode.addTwoNumber = function(a, b) {
    if (!RoCode.Utils.isNumber(a) || !RoCode.Utils.isNumber(b)) {
        return a + b;
    }
    a += '';
    b += '';

    const indexA = a.indexOf('.');
    const indexB = b.indexOf('.');
    let fixedA = 0;
    let fixedB = 0;
    if (indexA > 0) {
        fixedA = a.length - indexA - 1;
    }

    if (indexB > 0) {
        fixedB = b.length - indexB - 1;
    }

    if (fixedA > 0 || fixedB > 0) {
        if (fixedA >= fixedB) {
            return (parseFloat(a) + parseFloat(b)).toFixed(fixedA);
        } else {
            return (parseFloat(a) + parseFloat(b)).toFixed(fixedB);
        }
    } else {
        return parseInt(a) + parseInt(b);
    }
};

/*
 * HTML hex colour code to RGB colour value
 */
RoCode.hex2rgb = function(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

/*
 * RGB colour value to HTML hex colour code
 */
RoCode.rgb2hex = function(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 *
 * @param {number} r - 0~255 integer
 * @param {number} g - 0~255 integer
 * @param {number} b - 0~255 integer
 * @return {number} 0~0xffffff integer
 */
RoCode.rgb2Number = function(r, g, b) {
    return (r << 16) + (g << 8) + Number(b);
};

/*
 * Generate random rgb color object
 */
RoCode.generateRgb = function() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
    };
};

/*
 * Adjustment input value by max and min value
 * @param {!Number} value, min, max
 */
RoCode.adjustValueWithMaxMin = function(input, min, max) {
    if (input > max) {
        return max;
    } else if (input < min) {
        return min;
    } else {
        return input;
    }
};

/*
 * Inspect input value exists already in an array
 * @param {String} targetValue
 * @param {String} identifier
 * @param {Array} arr
 * @return {boolean} return true when target value exists already
 */
RoCode.isExist = function(targetValue, identifier, arr) {
    return !!_.find(arr, { [identifier]: targetValue });
};

RoCode.getColourCodes = function() {
    return [
        'transparent',
        '#660000',
        '#663300',
        '#996633',
        '#003300',
        '#003333',
        '#003399',
        '#000066',
        '#330066',
        '#660066',
        '#FFFFFF',
        '#990000',
        '#993300',
        '#CC9900',
        '#006600',
        '#336666',
        '#0033FF',
        '#000099',
        '#660099',
        '#990066',
        '#000000',
        '#CC0000',
        '#CC3300',
        '#FFCC00',
        '#009900',
        '#006666',
        '#0066FF',
        '#0000CC',
        '#663399',
        '#CC0099',
        '#333333',
        '#FF0000',
        '#FF3300',
        '#FFFF00',
        '#00CC00',
        '#009999',
        '#0099FF',
        '#0000FF',
        '#9900CC',
        '#FF0099',
        '#666666',
        '#CC3333',
        '#FF6600',
        '#FFFF33',
        '#00FF00',
        '#00CCCC',
        '#00CCFF',
        '#3366FF',
        '#9933FF',
        '#FF00FF',
        '#999999',
        '#FF6666',
        '#FF6633',
        '#FFFF66',
        '#66FF66',
        '#66CCCC',
        '#00FFFF',
        '#3399FF',
        '#9966FF',
        '#FF66FF',
        '#BBBBBB',
        '#FF9999',
        '#FF9966',
        '#FFFF99',
        '#99FF99',
        '#66FFCC',
        '#99FFFF',
        '#66CCff',
        '#9999FF',
        '#FF99FF',
        '#CCCCCC',
        '#FFCCCC',
        '#FFCC99',
        '#FFFFCC',
        '#CCFFCC',
        '#99FFCC',
        '#CCFFFF',
        '#99CCFF',
        '#CCCCFF',
        '#FFCCFF',
    ];
};

/*
 * Replacement for element.remove() method
 * @param {Element} targetElement
 * @return {boolean} return true when target element remove or not
 */
RoCode.removeElement = function(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
};

/*
 * parse string to number
 * @param {String||Number} value
 * @return {Boolean||Number} arr
 */
RoCode.parseNumber = function(value) {
    if (typeof value === 'string') {
        if (
            (RoCode.Utils.isNumber(value) && value[0] === '0') ||
            (value[0] === '0' && value[1].toLowerCase() === 'x')
        ) {
            return value;
        } else if (RoCode.Utils.isNumber(value)) {
            return Number(value);
        }
    } else if (typeof value === 'number' && RoCode.Utils.isNumber(value)) {
        return value;
    }

    return false;
};

/**
 * count length of string.
 * Hanguel character is count to two.
 * @param {!String} dataString
 * @return {Number}
 */
RoCode.countStringLength = function(dataString) {
    let p;
    let len = 0;
    for (p = 0; p < dataString.length; p++) {
        if (dataString.charCodeAt(p) > 255) {
            len += 2;
        } else {
            len++;
        }
    }
    return len;
};

/**
 * count length of string.
 * Hanguel character is count to two.
 * @param {!String} dataString
 * @param {!Number} stringLength
 * @return {String}
 */
RoCode.cutStringByLength = function(dataString, stringLength) {
    let p;
    let len = 0;
    for (p = 0; len < stringLength && p < dataString.length; p++) {
        if (dataString.charCodeAt(p) > 255) {
            len += 2;
        } else {
            len++;
        }
    }
    return dataString.substr(0, p);
};

/**
 * check to element is are parent child.
 * @param {Element} parent
 * @param {Element} child
 * @return {Boolean}
 */
RoCode.isChild = function(parent, child) {
    if (!child) {
        while (child.parentNode) {
            if ((child = child.parentNode) == parent) {
                return true;
            }
        }
    }
    return false;
};

/**
 * @param {Element} child
 */
RoCode.launchFullScreen = function(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFulScreen) {
        element.mozRequestFulScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullScreen) {
        element.msRequestFullScreen();
    }
};

RoCode.exitFullScreen = function() {
    if (document.exitFullScreen) {
        document.exitFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
};

RoCode.isPhone = function() {
    return false;
    //if (window.screen.availWidth > 480)
    //return false;
    //else
    //return true;
};

RoCode.getKeyCodeMap = function() {
    return {
        '8': 'backspace',
        '9': 'tab',
        '13': Lang.Blocks.START_press_some_key_enter,
        '16': 'shift',
        '17': 'ctrl',
        '18': 'alt',
        '27': 'esc',
        '32': Lang.Blocks.START_press_some_key_space,
        '37': Lang.Blocks.START_press_some_key_left,
        '38': Lang.Blocks.START_press_some_key_up,
        '39': Lang.Blocks.START_press_some_key_right,
        '40': Lang.Blocks.START_press_some_key_down,
        '48': '0',
        '49': '1',
        '50': '2',
        '51': '3',
        '52': '4',
        '53': '5',
        '54': '6',
        '55': '7',
        '56': '8',
        '57': '9',
        '65': 'a',
        '66': 'b',
        '67': 'c',
        '68': 'd',
        '69': 'e',
        '70': 'f',
        '71': 'g',
        '72': 'h',
        '73': 'i',
        '74': 'j',
        '75': 'k',
        '76': 'l',
        '77': 'm',
        '78': 'n',
        '79': 'o',
        '80': 'p',
        '81': 'q',
        '82': 'r',
        '83': 's',
        '84': 't',
        '85': 'u',
        '86': 'v',
        '87': 'w',
        '88': 'x',
        '89': 'y',
        '90': 'z',
        //special Characters
        '186': ';',
        '187': '=',
        '188': ',',
        '189': '-',
        '190': '.',
        '191': '/',
        '192': '~',
        '219': '[',
        '220': 'Backslash',
        '221': ']',
        '222': "'",
        // #2590 이슈 처리에 의해 주석처리
        // '45': 'Help',
        // '45': 'Insert',
        // '46': 'Delete',
        // '36': 'Home',
        // '35': 'End',
        // '33': 'PageUp',
        // '34': 'PageDown',
    };
};

RoCode.checkCollisionRect = function(rectA, rectB) {
    return !(
        rectA.y + rectA.height < rectB.y ||
        rectA.y > rectB.y + rectB.height ||
        rectA.x + rectA.width < rectB.x ||
        rectA.x > rectB.x + rectB.width
    );
};

RoCode.bindAnimationCallback = function(element, func) {
    element.addEventListener('webkitAnimationEnd', func, false);
    element.addEventListener('animationend', func, false);
    element.addEventListener('oanimationend', func, false);
};

RoCode.cloneSimpleObject = function(object) {
    return _.clone(object);
};

RoCode.computeInputWidth = (function() {
    let elem;
    const _cache = {};
    return function(value) {
        value = value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const cached = _cache[value];
        if (cached) {
            return cached;
        } else {
            elem = elem || document.getElementById('RoCodeInputForComputeWidth');
            if (!elem) {
                elem = document.createElement('span');
                elem.setAttribute('id', 'RoCodeInputForComputeWidth');
                elem.className = 'elem-element';
                document.body.appendChild(elem);
            }

            elem.innerHTML = value;
            const ret = `${Number(elem.offsetWidth + 10)}px`;

            if (window.fontLoaded) {
                _cache[value] = ret;
            }
            return ret;
        }
    };
})();

RoCode.isArrowOrBackspace = function(keyCode) {
    return !!~['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].indexOf(keyCode);
};

RoCode.hexStringToBin = function(hexString) {
    const bytes = [];
    let str;

    for (let i = 0; i < hexString.length - 1; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    str = String.fromCharCode(...bytes);
    return str;
};

//maybe deprecated
RoCode.findObjsByKey = function(arr, keyName, key) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][keyName] == key) {
            result.push(arr[i]);
        }
    }
    return result;
};

RoCode.factorial = _.memoize((n) => {
    if (n === 0 || n == 1) {
        return 1;
    }
    return RoCode.factorial(n - 1) * n;
});

RoCode.getListRealIndex = function(index, list) {
    if (!RoCode.Utils.isNumber(index)) {
        switch (index) {
            case 'FIRST':
                index = 1;
                break;
            case 'LAST':
                index = list.getArray().length;
                break;
            case 'RANDOM':
                index = Math.floor(Math.random() * list.getArray().length) + 1;
                break;
        }
    }
    return index;
};

RoCode.toRadian = function(angle) {
    return (angle * Math.PI) / 180;
};

RoCode.toDegrees = function(radians) {
    return (radians * 180) / Math.PI;
};

RoCode.getPicturesJSON = function(pictures = [], isClone) {
    return pictures.reduce((acc, p) => {
        const o = {};
        o._id = p._id;
        o.id = isClone ? RoCode.generateHash() : p.id;
        o.dimension = p.dimension;
        o.filename = p.filename;
        o.fileurl = p.fileurl;
        o.name = p.name;
        o.scale = p.scale;
        o.imageType = p.imageType || 'png';
        acc.push(o);
        return acc;
    }, []);
};

RoCode.getSoundsJSON = function(sounds = [], isClone) {
    return sounds.reduce((acc, s) => {
        const o = {};
        o._id = s._id;
        o.duration = s.duration;
        o.ext = s.ext;
        o.id = isClone ? RoCode.generateHash() : s.id;
        o.filename = s.filename;
        o.fileurl = s.fileurl;
        o.name = s.name;
        acc.push(o);
        return acc;
    }, []);
};

RoCode.cutDecimal = function(number) {
    return Math.round(number * 100) / 100;
};

RoCode.getBrowserType = function() {
    if (RoCode.userAgent) {
        return RoCode.userAgent;
    }
    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return `IE ${tem[1] || ''}`;
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) {
            return tem
                .slice(1)
                .join(' ')
                .replace('OPR', 'Opera');
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
        M.splice(1, 1, tem[1]);
    }
    const uaResult = M.join(' ');
    RoCode.userAgent = uaResult;
    return uaResult;
};

RoCode.setBasicBrush = function(sprite) {
    const isWebGL = GEHelper.isWebGL;
    const brush = GEHelper.brushHelper.newBrush();
    if (sprite.brush) {
        const parentBrush = sprite.brush;
        brush.thickness = parentBrush.thickness;
        brush.rgb = parentBrush.rgb;
        brush.opacity = parentBrush.opacity;
        brush.setStrokeStyle(brush.thickness);

        const rgb = brush.rgb;
        const opacity = 1 - brush.opacity / 100;

        if (isWebGL) {
            brush.beginStrokeFast(RoCode.rgb2Number(rgb.r, rgb.g, rgb.b), opacity);
        } else {
            brush.beginStroke(`rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`);
        }
    } else {
        brush.thickness = 1;
        brush.rgb = RoCode.hex2rgb('#ff0000');
        brush.opacity = 0;
        brush.setStrokeStyle(1);
        if (isWebGL) {
            brush.beginStrokeFast(0xff0000, 1);
        } else {
            brush.beginStroke('rgba(255,0,0,1)');
        }
    }

    brush.entity = sprite;
    const shape = GEHelper.brushHelper.newShape(brush);

    shape.entity = sprite;
    const selectedObjectContainer = RoCode.stage.selectedObjectContainer;
    selectedObjectContainer.addChildAt(shape, selectedObjectContainer.getChildIndex(sprite.object));

    sprite.brush = brush;

    sprite.shapes.push(shape);
};

RoCode.setCloneBrush = function(sprite, parentBrush) {
    const isWebGL = GEHelper.isWebGL;
    const brush = GEHelper.brushHelper.newBrush();
    brush.thickness = parentBrush.thickness;
    brush.rgb = parentBrush.rgb;
    brush.opacity = parentBrush.opacity;
    brush.setStrokeStyle(brush.thickness);

    const rgb = brush.rgb;
    const opacity = 1 - brush.opacity / 100;
    if (isWebGL) {
        brush.beginStrokeFast(RoCode.rgb2Number(rgb.r, rgb.g, rgb.b), opacity);
    } else {
        brush.beginStroke(`rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})`);
    }

    const shape = GEHelper.brushHelper.newShape(brush);
    shape.entity = sprite;
    const selectedObjectContainer = RoCode.stage.selectedObjectContainer;
    selectedObjectContainer.addChildAt(shape, selectedObjectContainer.getChildIndex(sprite.object));

    brush.stop = parentBrush.stop;

    sprite.brush = brush;

    sprite.shapes.push(shape);
};

RoCode.isFloat = function(num) {
    return /\d+\.{1}\d+$/.test(num);
};

RoCode.isInteger = function(value) {
    return isFinite(value) && Math.floor(value) == value;
};

RoCode.getStringIndex = function(str) {
    if (!str) {
        return '';
    }
    const result = {
        string: str,
        index: 1,
    };
    let idx = 0;
    const num = [];
    const len = str.length;
    for (let i = len - 1; i > 0; --i) {
        const ch = str.charAt(i);
        if (RoCode.Utils.isNumber(ch)) {
            num.unshift(ch);
            idx = i;
        } else {
            break;
        }
    }

    if (idx > 0) {
        result.string = str.substring(0, idx);
        result.index = parseInt(num.join('')) + 1;
    }

    return result;
};

RoCode.getOrderedName = function(str, objects, field) {
    if (!str) {
        return 'untitled';
    }
    if (!objects || objects.length === 0) {
        return str;
    }
    if (!field) {
        field = 'name';
    }

    const maxNumber = RoCode.getOrderedNameNumber(str, objects, field);
    const source = RoCode.getStringIndex(str);
    if (maxNumber > 0) {
        return source.string + maxNumber;
    }
    return str;
};

RoCode.getOrderedNameNumber = function(str, objects, field) {
    const source = RoCode.getStringIndex(str);
    let maxNumber = 0;
    for (let i = 0, len = objects.length; i < len; i++) {
        const target = RoCode.getStringIndex(objects[i][field]);
        if (source.string === target.string && target.index > maxNumber) {
            maxNumber = target.index;
        }
    }
    return maxNumber;
};

RoCode.changeXmlHashId = function(xmlBlock) {
    const reg = /function_field/;
    if (reg.test(xmlBlock.getAttribute('type'))) {
        const mutations = xmlBlock.getElementsByTagName('mutation');
        for (let i = 0, len = mutations.length; i < len; i++) {
            mutations[i].setAttribute('hashid', RoCode.generateHash());
        }
    }
    return xmlBlock;
};

RoCode.getMaxFloatPoint = function(numbers) {
    let max = 0;
    for (let i = 0, len = numbers.length; i < len; i++) {
        const n = String(numbers[i]);
        const idx = n.indexOf('.');
        if (idx !== -1) {
            const tmp = n.length - (idx + 1);
            if (tmp > max) {
                max = tmp;
            }
        }
    }
    return Math.min(max, 20);
};

RoCode.convertToRoundedDecimals = function(value, decimals) {
    if (!RoCode.Utils.isNumber(value) || !this.isFloat(value)) {
        return value;
    } else {
        return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
    }
};

RoCode.attachEventListener = function(elem, eventType, func) {
    setTimeout(() => {
        elem.addEventListener(eventType, func);
    }, 0);
};

RoCode.deAttachEventListener = function(elem, eventType, func) {
    elem.removeEventListener(eventType, func);
};

RoCode.isEmpty = _.isEmpty;

RoCode.Utils.disableContextmenu = function(node) {
    if (!node) {
        return;
    }

    $(node).on('contextmenu', this.contextPreventFunction);
};

RoCode.Utils.contextPreventFunction = function(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
};

RoCode.Utils.enableContextmenu = function(node) {
    if (!node) {
        return;
    }

    $(node).off('contextmenu', this.contextPreventFunction);
};

RoCode.Utils.isRightButton = function(e) {
    return e.button == 2 || e.ctrlKey;
};

RoCode.Utils.isTouchEvent = function({ type }) {
    return type.toLowerCase().includes('touch');
};

RoCode.Utils.inherit = function(parent, child) {
    function F() {}

    F.prototype = parent.prototype;
    child.prototype = new F();
    return child;
};

RoCode.bindAnimationCallbackOnce = function($elem, func) {
    $elem.one('webkitAnimationEnd animationendo animationend', func);
};

RoCode.Utils.isInInput = function({ target: { type } }) {
    return type === 'textarea' || type === 'text' || type === 'number';
};

RoCode.Utils.addFilters = function(boardSvgDom, suffix, isOnlyBlock) {
    const defs = boardSvgDom.elem('defs');

    //trashcan filter
    const trashCanFilter = defs.elem('filter', {
        id: `RoCodeTrashcanFilter_${suffix}`,
    });
    trashCanFilter.elem('feGaussianBlur', {
        in: 'SourceAlpha',
        stdDeviation: 2,
        result: 'blur',
    });
    trashCanFilter.elem('feOffset', {
        in: 'blur',
        dx: 1,
        dy: 1,
        result: 'offsetBlur',
    });
    trashCanFilter.elem('feColorMatrix', {
        id: 'recolor',
        in: 'offsetBlur',
        type: 'matrix',
        values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0',
        result: 'colorMatrix',
    });
    const feMerge = trashCanFilter.elem('feMerge');
    feMerge.elem('feMergeNode', {
        in: 'colorMatrix',
    });
    feMerge.elem(
        'feMergeNode',
        {
            in: 'SourceGraphic',
        },
        feMerge
    );

    const blockSelectFilter = defs.elem('filter', {
        id: `RoCodeBlockSelectFilter_${suffix}`,
    });
    blockSelectFilter.elem('feGaussianBlur', {
        id: 'blur',
        in: 'SourceGraphic',
        stdDeviation: '1',
        result: 'blur',
    });
    const fct = blockSelectFilter.elem('feComponentTransfer', {
        in: 'blur',
        result: 'component',
    });
    fct.elem('feFuncA', {
        id: 'contour',
        type: 'table',
        tableValues: '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1',
    });
    blockSelectFilter.elem('feColorMatrix', {
        id: 'recolor',
        in: 'component',
        type: 'matrix',
        values: '0 0 0 0 1 0 0 0 0 0.902 0 0 0 0 0 0 0 0 1 0',
        result: 'colorMatrix',
    });
    const fm = blockSelectFilter.elem('feMerge');
    fm.elem('feMergeNode', {
        in: 'colorMatrix',
    });
    fm.elem('feMergeNode', {
        in: 'SourceGraphic',
    });

    const blockHighlightFilter = defs.elem('filter', {
        id: `RoCodeBlockHighlightFilter_${suffix}`,
    });
    blockHighlightFilter.elem('feOffset', {
        result: 'offOut',
        in: 'SourceGraphic',
        dx: 0,
        dy: 0,
    });
    blockHighlightFilter.elem('feColorMatrix', {
        result: 'matrixOut',
        in: 'offOut',
        type: 'matrix',
        values: '1.3 0 0 0 0 0 1.3 0 0 0 0 0 1.3 0 0 0 0 0 1 0',
    });

    defs.elem('filter', {
        id: `RoCodeBlockDarkenFilter_${suffix}`,
    }).elem('feColorMatrix', {
        type: 'matrix',
        values: '.45 0 0 0 0 0 .45 0 0 0 0 0 .45 0 0 0 0 0 1 0',
    });

    if (!isOnlyBlock) {
        const buttonShadow = defs.elem('filter', {
            id: 'RoCodeButtonShadowFilter',
        });
        buttonShadow.elem('feOffset', {
            result: 'offOut',
            in: 'SourceGraphic',
            dx: 1,
            dy: 1,
        });
        buttonShadow.elem('feColorMatrix', {
            result: 'matrixOut',
            in: 'offOut',
            type: 'matrix',
            values: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0',
        });
        buttonShadow.elem('feGaussianBlur', {
            result: 'blurOut',
            in: 'matrixOut',
            stdDeviation: '1',
        });
        buttonShadow.elem('feBlend', {
            in: 'SourceGraphic',
            in2: 'blurOut',
            mode: 'normal',
        });
    }
};

RoCode.Utils.addBlockPattern = function(boardSvgDom, suffix) {
    const pattern = boardSvgDom.elem('pattern', {
        id: `blockHoverPattern_${suffix}`,
        class: 'blockHoverPattern',
        patternUnits: 'userSpaceOnUse',
        patternTransform: 'translate(12, 0)',
        x: 0,
        y: 0,
        width: 48,
        height: 28,
        style: 'display: none',
    });

    const imagePath = `${RoCode.mediaFilePath}block_pattern_(order).svg`;
    const order = '(order)';
    for (let i = 1; i < 5; i++) {
        pattern.elem('image', {
            class: `pattern${i}`,
            href: imagePath.replace(order, i),
            x: 0,
            y: 0,
            width: 48,
            height: 28,
        });
    }

    return { pattern };
};

function handleOptionalBlocksActive(item) {
    const { expansionBlocks = [], aiUtilizeBlocks = [] } = item;
    if (expansionBlocks.length > 0) {
        RoCode.expansion.addExpansionBlocks(expansionBlocks);
    }
    if (aiUtilizeBlocks.length > 0) {
        RoCode.aiUtilize.addAIUtilizeBlocks(aiUtilizeBlocks);
    }
}

RoCode.Utils.addNewBlock = function(item) {
    const {
        script,
        functions,
        messages,
        variables,
        learning = {},
        tables = [],
        expansionBlocks = [],
        aiUtilizeBlocks = [],
    } = item;
    const parseScript = JSON.parse(script);
    if (!parseScript) {
        return;
    }

    if (
        RoCode.getMainWS().mode === RoCode.Workspace.MODE_VIMBOARD &&
        (!RoCode.TextCodingUtil.canUsePythonVariables(variables) ||
            !RoCode.TextCodingUtil.canUsePythonFunctions(functions))
    ) {
        return RoCodelms.alert(Lang.Menus.object_import_syntax_error);
    }

    const objectIdMap = {};
    variables.forEach((variable) => {
        const { object } = variable;
        if (object) {
            variable.object = _.get(RoCode, ['container', 'selectedObject', 'id'], '');
        }
    });
    DataTable.setTables(tables);
    RoCode.aiLearning.load(learning);
    handleOptionalBlocksActive(item);

    RoCode.variableContainer.appendMessages(messages);
    RoCode.variableContainer.appendVariables(variables);
    RoCode.variableContainer.appendFunctions(functions);
    if (!this?.editor?.board?.code) {
        if (RoCode.toast && !(this.objectAlert && RoCode.toast.isOpen(this.objectAlert))) {
            this.objectAlert = RoCode.toast.alert(
                Lang.Workspace.add_object_alert,
                Lang.Workspace.add_object_alert_msg
            );
        }
        return;
    }
    RoCode.do(
        'addThread',
        parseScript.map((block) => {
            block.id = RoCode.generateHash();
            return block;
        })
    );
};

RoCode.Utils.addNewObject = function(sprite) {
    if (sprite) {
        const {
            objects,
            functions,
            messages,
            variables,
            tables = [],
            expansionBlocks = [],
            aiUtilizeBlocks = [],
        } = sprite;

        if (
            RoCode.getMainWS().mode === RoCode.Workspace.MODE_VIMBOARD &&
            (!RoCode.TextCodingUtil.canUsePythonVariables(variables) ||
                !RoCode.TextCodingUtil.canUsePythonFunctions(functions))
        ) {
            return RoCodelms.alert(Lang.Menus.object_import_syntax_error);
        }
        const objectIdMap = {};
        DataTable.setTables(tables);
        handleOptionalBlocksActive(sprite);
        variables.forEach((variable) => {
            const { object } = variable;
            if (object) {
                const id = variable.id;
                const idMap = objectIdMap[object];
                variable.id = RoCode.generateHash();
                if (!idMap) {
                    variable.object = RoCode.generateHash();
                    objectIdMap[object] = {
                        objectId: variable.object,
                        variableOriginId: [id],
                        variableId: [variable.id],
                    };
                } else {
                    variable.object = idMap.objectId;
                    idMap.variableOriginId.push(id);
                    idMap.variableId.push(variable.id);
                }
            }
        });
        RoCode.variableContainer.appendMessages(messages);
        RoCode.variableContainer.appendVariables(variables);
        RoCode.variableContainer.appendFunctions(functions);

        objects.forEach((object) => {
            const idMap = objectIdMap[object.id];
            if (idMap) {
                let script = object.script;
                idMap.variableOriginId.forEach((id, idx) => {
                    const regex = new RegExp(id, 'gi');
                    script = script.replace(regex, idMap.variableId[idx]);
                });
                object.script = script;
                object.id = idMap.objectId;
            } else if (RoCode.container.getObject(object.id)) {
                object.id = RoCode.generateHash();
            }
            if (!object.objectType) {
                object.objectType = 'sprite';
            }
            RoCode.container.addObject(object, 0);
        });
    }
};

RoCode.Utils.COLLISION = {
    NONE: 0,
    UP: 1,
    RIGHT: 2,
    LEFT: 3,
    DOWN: 4,
};

RoCode.Utils.createMouseEvent = function(type, event) {
    const e = document.createEvent('MouseEvent');
    e.initMouseEvent(
        type,
        true,
        true,
        window,
        0,
        0,
        0,
        event.clientX,
        event.clientY,
        false,
        false,
        false,
        false,
        0,
        null
    );
    return e;
};

RoCode.Utils.stopProjectWithToast = async (scope, message, error) => {
    let block = scope.block;
    message = message || 'Runtime Error';
    const toast = error.toast;
    const engine = RoCode.engine;

    if (engine) {
        await engine.toggleStop();
    }
    if (RoCode.type === 'workspace') {
        if (scope.block && 'funcBlock' in scope.block) {
            block = scope.block.funcBlock;
        } else if (scope.funcExecutor) {
            block = scope.funcExecutor.scope.block;
            RoCode.Func.edit(scope.type);
        }

        if (block) {
            const id = block.getCode().object && block.getCode().object.id;
            if (id) {
                RoCode.container.selectObject(block.getCode().object.id, true);
            }
            const view = block.view;
            view && view.getBoard().activateBlock(block);
        }
    }

    if (message === 'IncompatibleError' && RoCode.toast) {
        RoCode.toast.alert(
            Lang.Msgs.warn,
            toast || [Lang.Workspace.check_runtime_error, Lang.Workspace.check_browser_error],
            true
        );
        RoCode.engine.hideAllAudioPanel();
    }
    if (message === 'OfflineError' && RoCode.toast) {
        RoCode.toast.alert(
            Lang.Msgs.warn,
            toast || [
                Lang.Workspace.check_runtime_error,
                Lang.Workspace.offline_not_compatible_error,
            ],
            true
        );
    } else if (RoCode.toast) {
        RoCode.toast.alert(Lang.Msgs.warn, Lang.Workspace.check_runtime_error, true);
    }

    if (error) {
        error.message = `${message}: ${error.message}`;
        throw error;
    }

    throw new Error(message);
};

RoCode.Utils.AsyncError = function(message) {
    this.name = 'AsyncError';
    this.message = message || 'Waiting for callback';
};

RoCode.Utils.AsyncError.prototype = new Error();
RoCode.Utils.AsyncError.prototype.constructor = RoCode.Utils.AsyncError;

RoCode.Utils.IncompatibleError = function(message, toast) {
    this.name = 'IncompatibleError';
    this.message = message || 'IncompatibleError';
    this.toast = toast || null;
};
RoCode.Utils.IncompatibleError.prototype = new Error();
RoCode.Utils.IncompatibleError.prototype.constructor = RoCode.Utils.IncompatibleError;

RoCode.Utils.OfflineError = function(message, toast) {
    this.name = 'OfflineError';
    this.message = message || 'OfflineError';
    this.toast = toast || null;
};
RoCode.Utils.OfflineError.prototype = new Error();
RoCode.Utils.OfflineError.prototype.constructor = RoCode.Utils.OfflineError;

RoCode.Utils.isChrome = function() {
    return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
};

RoCode.Utils.getUsedFonts = function(project) {
    if (!project) {
        return;
    }
    const getFamily = (x) =>
        x.entity.font
            .split(' ')
            .filter((t) => t.indexOf('bold') < 0 && t.indexOf('italic') < 0 && t.indexOf('px') < 0)
            .join(' ');
    return _uniq(project.objects.filter((x) => x.objectType === 'textBox').map(getFamily));
};

RoCode.Utils.waitForWebfonts = function(fonts, callback) {
    return Promise.all(
        fonts.map(
            (font) =>
                new Promise((resolve) => {
                    FontFaceOnload(font, {
                        success() {
                            resolve();
                        },
                        error() {
                            console.log('fail', font);
                            resolve();
                        },
                        timeout: 5000,
                    });
                })
        )
    ).then(() => {
        console.log('font loaded');
        callback && callback();
    });
};

window.requestAnimFrame = (function() {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();

RoCode.isMobile = function() {
    if (RoCode.device) {
        return RoCode.device === 'tablet';
    }

    const platform = window.platform;
    const ret =
        platform && platform.type && (platform.type === 'tablet' || platform.type === 'mobile');

    if (ret) {
        RoCode.device = 'tablet';
        return true;
    } else {
        RoCode.device = 'desktop';
        return false;
    }
};

RoCode.Utils.mobileAgentParser = function(userAgent) {
    const applePhone = /iPhone/i;
    const appleIpod = /iPod/i;
    const appleTablet = /iPad/i;
    const androidPhone = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i; // Match 'Android' AND 'Mobile'
    const androidTablet = /Android/i;
    const amazonPhone = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i;
    const amazonTablet = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i;
    const windowsPhone = /Windows Phone/i;
    const windowsTablet = /(?=.*\bWindows\b)(?=.*\bARM\b)/i; // Match 'Windows' AND 'ARM'
    const otherBlackberry = /BlackBerry/i;
    const otherBlackberry10 = /BB10/i;
    const otherOpera = /Opera Mini/i;
    const otherChrome = /(CriOS|Chrome)(?=.*\bMobile\b)/i;
    const otherFirefox = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i; // Match 'Firefox' AND 'Mobile'
    const sevenInch = new RegExp(
        '(?:' + // Non-capturing group
        'Nexus 7' + // Nexus 7
        '|' + // OR
        'BNTV250' + // B&N Nook Tablet 7 inch
        '|' + // OR
        'Kindle Fire' + // Kindle Fire
        '|' + // OR
        'Silk' + // Kindle Fire, Silk Accelerated
        '|' + // OR
        'GT-P1000' + // Galaxy Tab 7 inch
            ')', // End non-capturing group

        'i'
    ); // Case-insensitive matching

    const match = function(regex, userAgent) {
        return regex.test(userAgent);
    };

    let ua = userAgent || navigator.userAgent;

    // Facebook mobile app's integrated browser adds a bunch of strings that
    // match everything. Strip it out if it exists.
    let tmp = ua.split('[FBAN');
    if (typeof tmp[1] !== 'undefined') {
        ua = tmp[0];
    }

    // Twitter mobile app's integrated browser on iPad adds a "Twitter for
    // iPhone" string. Same probable happens on other tablet platforms.
    // This will confuse detection so strip it out if it exists.
    tmp = ua.split('Twitter');
    if (typeof tmp[1] !== 'undefined') {
        ua = tmp[0];
    }

    this.apple = {
        phone: match(applePhone, ua),
        ipod: match(appleIpod, ua),
        tablet: !match(applePhone, ua) && match(appleTablet, ua),
        device: match(applePhone, ua) || match(appleIpod, ua) || match(appleTablet, ua),
    };
    this.amazon = {
        phone: match(amazonPhone, ua),
        tablet: !match(amazonPhone, ua) && match(amazonTablet, ua),
        device: match(amazonPhone, ua) || match(amazonTablet, ua),
    };
    this.android = {
        phone: match(amazonPhone, ua) || match(androidPhone, ua),
        tablet:
            !match(amazonPhone, ua) &&
            !match(androidPhone, ua) &&
            (match(amazonTablet, ua) || match(androidTablet, ua)),
        device:
            match(amazonPhone, ua) ||
            match(amazonTablet, ua) ||
            match(androidPhone, ua) ||
            match(androidTablet, ua),
    };
    this.windows = {
        phone: match(windowsPhone, ua),
        tablet: match(windowsTablet, ua),
        device: match(windowsPhone, ua) || match(windowsTablet, ua),
    };
    this.other = {
        blackberry: match(otherBlackberry, ua),
        blackberry10: match(otherBlackberry10, ua),
        opera: match(otherOpera, ua),
        firefox: match(otherFirefox, ua),
        chrome: match(otherChrome, ua),
        device:
            match(otherBlackberry, ua) ||
            match(otherBlackberry10, ua) ||
            match(otherOpera, ua) ||
            match(otherFirefox, ua) ||
            match(otherChrome, ua),
    };
    this.seven_inch = match(sevenInch, ua);
    this.any =
        this.apple.device ||
        this.android.device ||
        this.windows.device ||
        this.other.device ||
        this.seven_inch;

    // excludes 'other' devices and ipods, targeting touchscreen phones
    this.phone = this.apple.phone || this.android.phone || this.windows.phone;

    // excludes 7 inch devices, classifying as phone or tablet is left to the user
    this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

    return this;
};

RoCode.Utils.convertMouseEvent = function(e) {
    if (e.originalEvent && e.originalEvent.touches) {
        return e.originalEvent.touches[0];
    } else if (e.changedTouches) {
        return e.changedTouches[0];
    } else {
        return e;
    }
};

RoCode.Utils.hasSpecialCharacter = function(str) {
    const reg = /!|@|#|\$|%|\^|&|\*|\(|\)|\+|=|-|\[|\]|\\|\'|;|,|\.|\/|{|}|\||\"|:|<|>|\?/g;
    return reg.test(str);
};

RoCode.Utils.getBlockCategory = (function() {
    const map = {};
    let allBlocks;
    return function(blockType) {
        if (!blockType) {
            return;
        }

        if (map[blockType]) {
            return map[blockType];
        }

        if (!allBlocks) {
            allBlocks = RoCodeStatic.getAllBlocks();
        }

        for (let i = 0; i < allBlocks.length; i++) {
            const data = allBlocks[i];
            const category = data.category;
            if (data.blocks.indexOf(blockType) > -1) {
                map[blockType] = category;
                return category;
            }
        }
    };
})();

RoCode.Utils.getUniqObjectsBlocks = function(objects) {
    const _typePicker = _.partial(_.result, _, 'type');

    return _.chain(objects || RoCode.container.objects_)
        .map(({ script }) => {
            if (!(script instanceof RoCode.Code)) {
                script = new RoCode.Code(script);
            }
            return script.getBlockList().map(_typePicker);
        })
        .flatten()
        .uniq()
        .value();
};

RoCode.Utils.getObjectsBlocks = function(objects) {
    const _typePicker = _.partial(_.result, _, 'type');

    return _.chain(objects || RoCode.container.objects_)
        .map(({ script }) => {
            if (!(script instanceof RoCode.Code)) {
                script = new RoCode.Code(script);
            }
            return script.getBlockList(true).map(_typePicker);
        })
        .flatten()
        .value();
};

RoCode.Utils.makeCategoryDataByBlocks = function(blockArr) {
    if (!blockArr) {
        return;
    }
    const that = this;

    const data = RoCodeStatic.getAllBlocks();
    const categoryIndexMap = {};
    for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        datum.blocks = [];
        categoryIndexMap[datum.category] = i;
    }

    blockArr.forEach((b) => {
        const category = that.getBlockCategory(b);
        const index = categoryIndexMap[category];
        if (index === undefined) {
            return;
        }
        data[index].blocks.push(b);
    });

    const allBlocks = RoCodeStatic.getAllBlocks();
    return allBlocks
        .map((block) => {
            const { category, blocks } = block;
            if (category === 'func') {
                return { blocks: [] };
            }
            return {
                category,
                blocks: _intersection(blockArr, blocks),
            };
        })
        .filter(({ blocks }) => blocks.length);
};

RoCode.Utils.blur = function() {
    const elem = document.activeElement;
    elem && elem.blur && elem.blur();
};

RoCode.Utils.getWindow = function(hashId) {
    if (!hashId) {
        return;
    }
    for (let i = 0; i < window.frames.length; i++) {
        const frame = window.frames[i];
        if (frame.RoCode && frame.RoCode.hashId === hashId) {
            return frame;
        }
    }
};

RoCode.Utils.restrictAction = function(exceptions = [], callback, noDispose) {
    const that = this;
    exceptions = exceptions.map(_.head);

    const handler = function(e) {
        e = e || window.event;
        const target = e.target || e.srcElement;
        if (!that.isRightButton(e)) {
            for (let i = 0; i < exceptions.length; i++) {
                const exception = exceptions[i];
                if (exception === target || $.contains(exception, target)) {
                    if (!noDispose) {
                        callback(e);
                    } else {
                        target.focus && target.focus();
                    }
                    return;
                }
            }
        }

        if (!e.preventDefault) {
            //IE quirks
            e.returnValue = false;
            e.cancelBubble = true;
        }
        e.preventDefault();
        e.stopPropagation();
    };

    this._restrictHandler = handler;

    const RoCodeDom = RoCode.getDom();
    RoCode.Utils.disableContextmenu(RoCodeDom);
    if (RoCodeDom.addEventListener) {
        RoCodeDom.addEventListener('click', handler, true);
        RoCodeDom.addEventListener('mousedown', handler, true);
        RoCodeDom.addEventListener('mouseup', handler, true);
        RoCodeDom.addEventListener('touchstart', handler, true);
    } else {
        RoCodeDom.attachEvent('onclick', handler);
        RoCodeDom.attachEvent('onmousedown', handler);
        RoCodeDom.attachEvent('onmouseup', handler);
        RoCodeDom.attachEvent('ontouchstart', handler);
    }
};

RoCode.Utils.allowAction = function() {
    const RoCodeDom = RoCode.getDom();
    RoCode.Utils.enableContextmenu(RoCodeDom);
    if (this._restrictHandler) {
        if (RoCodeDom.addEventListener) {
            RoCodeDom.removeEventListener('click', this._restrictHandler, true);
            RoCodeDom.removeEventListener('mousedown', this._restrictHandler, true);
            RoCodeDom.removeEventListener('mouseup', this._restrictHandler, true);
            RoCodeDom.removeEventListener('touchstart', this._restrictHandler, true);
        } else {
            RoCodeDom.detachEvent('onclick', this._restrictHandler);
            RoCodeDom.detachEvent('onmousedown', this._restrictHandler);
            RoCodeDom.detachEvent('onmouseup', this._restrictHandler);
            RoCodeDom.detachEvent('ontouchstart', this._restrictHandler);
        }
        delete this._restrictHandler;
    }
};

RoCode.Utils.glideBlock = function(svgGroup, x, y, callback) {
    const rect = svgGroup.getBoundingClientRect();
    const svgDom = RoCode.Dom(
        $(
            '<svg id="globalSvg" width="10" height="10"' +
                'version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
        ),
        { parent: $(document.body) }
    );
    svgGroup = $(svgGroup.cloneNode(true));
    svgGroup.attr({ transform: 'translate(8,0)' });
    svgDom.append(svgGroup);
    svgDom.css({
        top: rect.top,
        left: rect.left,
    });
    svgDom.velocity(
        {
            top: y,
            left: x - 8,
        },
        {
            duration: 1200,
            complete() {
                setTimeout(() => {
                    svgDom.remove();
                    callback();
                }, 500);
            },
            easing: 'ease-in-out',
        }
    );
};

RoCode.Utils.getScrollPos = function() {
    return {
        left: window.pageXOffset || document.documentElement.scrollLeft,
        top: window.pageYOffset || document.documentElement.scrollTop,
    };
};

RoCode.Utils.isPointInRect = ({ x, y }, { top, bottom, left, right }) =>
    _.inRange(x, left, right) && _.inRange(y, top, bottom);

RoCode.Utils.getBoundingClientRectMemo = _.memoize((target, offset = {}) => {
    const rect = target.getBoundingClientRect();
    const result = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
    };
    Object.keys(offset).forEach((key) => {
        result[key] += offset[key];
    });
    return result;
});

RoCode.Utils.clearClientRectMemo = () => {
    RoCode.Utils.getBoundingClientRectMemo.cache = new _.memoize.Cache();
};

RoCode.Utils.getPosition = (event) => {
    const position = {
        x: 0,
        y: 0,
    };
    if (event.touches && event.touches[0]) {
        const touch = event.touches[0];
        position.x = touch.pageX;
        position.y = touch.pageY;
    } else {
        position.x = event.pageX;
        position.y = event.pageY;
    }
    return position;
};

RoCode.Utils.copy = function(target) {
    return JSON.parse(JSON.stringify(target));
};

//helper function for development and debug
RoCode.Utils.getAllObjectsBlockList = function() {
    return RoCode.container.objects_.reduce(
        (prev, { script }) => prev.concat(script.getBlockList()),
        []
    );
};

RoCode.Utils.toFixed = function(value, len) {
    const length = len || 1;
    const powValue = Math.pow(10, length);

    let retValue = Math.round(value * powValue) / powValue;

    if (RoCode.isFloat(retValue)) {
        return String(retValue);
    } else {
        retValue += '.';
        for (let i = 0; i < length; i++) {
            retValue += '0';
        }
        return retValue;
    }
};

RoCode.Utils.setVolume = function(volume) {
    this._volume = _clamp(volume, 0, 1);

    RoCode.soundInstances
        .filter(({ soundType }) => !soundType)
        .forEach((instance) => {
            instance.volume = this._volume;
        });
};

RoCode.Utils.getVolume = function() {
    if (this._volume || this._volume === 0) {
        return this._volume;
    }
    return 1;
};

RoCode.Utils.forceStopSounds = function() {
    _.each(RoCode.soundInstances, (instance) => {
        instance?.dispatchEvent?.('complete');
        instance?.stop?.();
    });
    RoCode.soundInstances = [];
};

RoCode.Utils.playSound = function(id, option = {}) {
    return createjs.Sound.play(id, Object.assign({ volume: this._volume }, option));
};

RoCode.Utils.addSoundInstances = function(instance) {
    RoCode.soundInstances.push(instance);
    instance.on('complete', () => {
        const index = RoCode.soundInstances.indexOf(instance);
        if (index > -1) {
            RoCode.soundInstances.splice(index, 1);
        }
    });
};

RoCode.Utils.pauseSoundInstances = function() {
    RoCode.soundInstances.map((instance) => {
        instance.paused = true;
    });
};

RoCode.Utils.recoverSoundInstances = function() {
    RoCode.soundInstances.map((instance) => {
        instance.paused = false;
    });
};

RoCode.Utils.hasClass = (elem, name) => ` ${elem.getAttribute('class')} `.indexOf(` ${name} `) >= 0;

RoCode.Utils.addClass = (elem, name) => {
    if (!RoCode.Utils.hasClass(elem, name)) {
        elem.setAttribute('class', (elem.getAttribute('class') ? `${elem.className} ` : '') + name);
    }
};

RoCode.Utils.toggleClass = (elem, name, force) => {
    if (force || (typeof force === 'undefined' && !RoCode.Utils.hasClass(elem, name))) {
        RoCode.Utils.addClass(elem, name);
    } else {
        RoCode.Utils.removeClass(elem, name);
    }
};

RoCode.Utils.removeClass = (elem, name) => {
    let set = ` ${elem.getAttribute('class')} `;

    while (set.indexOf(` ${name} `) >= 0) {
        set = set.replace(` ${name} `, ' ');
    }

    const result = typeof set.trim === 'function' ? set.trim() : set.replace(/^\s+|\s+$/g, '');
    elem.setAttribute('class', result);
};

RoCode.Utils.bindBlockViewHoverEvent = function(board, dom) {
    if (RoCode.isMobile()) {
        return;
    }

    dom.on('mouseenter mouseleave', 'path', function({ type }) {
        if (this.getAttribute('class') !== 'blockPath') {
            return;
        }
        const block = board.code.findById(this.getAttribute('blockId'));
        if (!block) {
            return;
        }
        const blockView = block.view;

        if (!blockView._mouseEnable) {
            return;
        }

        blockView.setHoverBlockView({
            that: blockView,
            blockView: type === 'mouseenter' ? blockView : undefined,
        });
    });
};

RoCode.Utils.bindBlockExecuteFocusEvents = function() {
    RoCode.addEventListener('blockExecute', (view) => {
        if (!view) {
            return;
        }
        this.focusBlockView(view.getBoard(), view);
    });

    RoCode.addEventListener('blockExecuteEnd', this.focusBlockView);
};

RoCode.Utils.focusBlockView = (() => {
    let _last;

    function _getAllElem(elem) {
        return $(elem).find('*:not(g)');
    }

    return (board, blockView) => {
        const { svgGroup, suffix } = board || RoCode.getMainWS().board || {};

        if (!svgGroup || !suffix || (_last && _last === blockView)) {
            return;
        }

        if (blockView) {
            //darken all
            _getAllElem(svgGroup).attr('filter', `url(#RoCodeBlockDarkenFilter_${suffix})`);

            //brighten only block
            const { _path, contentSvgGroup } = blockView;
            $(_path).removeAttr('filter');
            $(contentSvgGroup)
                .find('*:not(g)')
                .removeAttr('filter');
        } else {
            //brighten all
            _getAllElem(svgGroup).removeAttr('filter');
        }

        _last = blockView;
    };
})();

RoCode.Utils.isDomActive = function(dom) {
    return !!(dom && document.activeElement === dom);
};

RoCode.Utils.when = function(predicate, fn) {
    return function(...args) {
        if (predicate.apply(this, args)) {
            return fn && fn.apply(this, args);
        }
    };
};

RoCode.Utils.whenEnter = function(fn) {
    return RoCode.Utils.when(({ keyCode, repeat }) => keyCode === 13 && !repeat, fn);
};

RoCode.Utils.blurWhenEnter = RoCode.Utils.whenEnter(function() {
    this.blur();
});

RoCode.Utils.whenWithTimeout = function(predicate, fn, time = 200) {
    return function(...args) {
        if (this._timer) {
            clearTimeout(this._timer);
            delete this._timer;
        }
        this._timer = setTimeout(() => {
            if (predicate.apply(this, args)) {
                return fn.apply(this, args);
            }
        }, time);
    };
};

RoCode.Utils.setBlurredTimer = function(func) {
    return RoCode.Utils.whenWithTimeout(function() {
        if (this._focused) {
            this._focused = false;
            return true;
        }
        return false;
    }, func);
};

RoCode.Utils.setFocused = function() {
    if (this._timer) {
        clearTimeout(this._timer);
        delete this._timer;
    }
    this._focused = true;
};

RoCode.Utils.focusIfNotActive = function(dom) {
    if (Array.isArray(dom)) {
        dom = RoCode.getDom(dom);
    }
    if (!dom) {
        return;
    }
    if (!RoCode.Utils.isDomActive(dom)) {
        dom.focus && dom.focus();
    }
};

// 터치와 마우스의 이벤트를 맞춰주는 함수
RoCode.Utils.getMouseEvent = function(event) {
    let mouseEvent;
    if (event.originalEvent && event.originalEvent.touches) {
        mouseEvent = event.originalEvent.touches[0];
    } else if (event.touches) {
        mouseEvent = event.touches[0];
    } else {
        mouseEvent = event;
    }
    return mouseEvent;
};

RoCode.Utils.removeBlockByType = function(blockType, callback) {
    const objects = RoCode.container.getAllObjects();
    objects.forEach(({ id, script }) => {
        RoCode.do('selectObject', id).isPass(true);
        script.getBlockList(false, blockType).forEach((b, index) => {
            RoCode.do('destroyBlock', b).isPass(true);
        });
    });
    RoCode.variableContainer.removeBlocksInFunctionByType(blockType);

    if (callback) {
        callback();
    }
};

RoCode.Utils.removeBlockByType2 = function(blockType, callback) {
    RoCode.variableContainer.removeBlocksInFunctionByType(blockType);
    const objects = RoCode.container.getAllObjects();
    objects.forEach(({ id, script }) => {
        script.getBlockList(false, blockType).forEach((block, index) => {
            block.destroy();
        });
    });

    if (callback) {
        callback();
    }
};

RoCode.Utils.sleep = (time = 0) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

RoCode.Utils.runAsync = async (func) => {
    await RoCode.Utils.sleep();
    await func();
};

RoCode.Utils.runAsyncCurry = (func, time = 0) => async (...args) => {
    await RoCode.Utils.sleep(time);
    await func(...args);
};

RoCode.Utils.removeBlockByTypeAsync = async (blockType, callback) => {
    RoCode.dispatchEvent('removeFunctionsStart');
    await RoCode.variableContainer.removeBlocksInFunctionByTypeAsync(blockType);
    const objects = RoCode.container.getAllObjects();
    await Promise.all(
        objects.map(async ({ script }) => {
            await Promise.all(
                script.getBlockList(false, blockType).map(
                    RoCode.Utils.runAsyncCurry(async (block) => {
                        block.destroy();
                    })
                )
            );
        })
    );
    RoCode.dispatchEvent('removeFunctionsEnd');
    if (callback) {
        callback();
    }
};

RoCode.Utils.isUsedBlockType = function(blockType) {
    const objects = RoCode.container.getAllObjects();
    const usedInObject = objects.some(
        ({ script }) => !!script.getBlockList(false, blockType).length
    );
    if (usedInObject) {
        return true;
    }
    return RoCode.variableContainer.isUsedBlockTypeInFunction(blockType);
};

RoCode.Utils.combineCloudVariable = ({ variables, cloudVariable }) => {
    let items;
    if (typeof cloudVariable === 'string') {
        try {
            items = JSON.parse(cloudVariable);
        } catch (e) {}
    }
    if (!Array.isArray(items)) {
        return variables;
    }
    return variables.map((variable) => {
        const cloud = items.find(({ id }) => id === variable.id);
        if (cloud) {
            return { ...variable, ...cloud };
        }
        return variable;
    });
};
