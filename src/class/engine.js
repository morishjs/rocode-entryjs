import { GEHelper } from '../graphicEngine/GEHelper';
import audioUtils from '../util/audioUtils';

const RoCodeEngineState = {
    stop: 'stop',
    pause: 'pause',
    run: 'run',
};

RoCode.Engine = class Engine {
    constructor() {
        this.execPromises = [];
        this.state = RoCodeEngineState.stop;
        this.popup = null;
        this.isUpdating = true;
        this.speeds = [1, 15, 30, 45, 60];

        this.attachKeyboardCapture();

        const _addEventListener = RoCode.addEventListener.bind(RoCode);

        _addEventListener('canvasClick', () => this.fireEvent('mouse_clicked'));
        _addEventListener('canvasClickCanceled', () => this.fireEvent('mouse_click_cancled'));
        _addEventListener('entityClick', (entity) =>
            this.fireEventOnEntity('when_object_click', entity)
        );
        _addEventListener('entityClickCanceled', (entity) =>
            this.fireEventOnEntity('when_object_click_canceled', entity)
        );

        if (RoCode.type !== 'phone' && RoCode.type !== 'playground') {
            _addEventListener(
                'stageMouseMove',
                _.throttle(this.updateMouseView.bind(this), 100, {
                    leading: false,
                })
            );
            _addEventListener('stageMouseOut', this.hideMouseView.bind(this));
        }

        const $win = $(window);
        _addEventListener('run', () => $win.bind('keydown', arrowHandler));
        _addEventListener('stop', () => $win.unbind('keydown', arrowHandler));

        function arrowHandler(e) {
            const code = e.keyCode || e.which;
            const input = RoCode.stage.inputField;

            if (code === 32 && input && input.hasFocus()) {
                return;
            }

            if (_.includes([37, 38, 39, 40, 32], code)) {
                e.preventDefault();
            }
        }

        RoCode.message = new RoCode.Event(window);
    }

    /**
     * Control bar view generator.
     * @param {!Element} controlView controlView from RoCode.
     * @param {?string} option for choose type of view.
     */
    generateView(controlView, option = 'workspace') {
        this.option = option;
        if (option === 'workspace') {
            /** @type {!Element} */
            this.view_ = controlView;
            this.view_.addClass('RoCodeEngine_w').addClass('RoCodeEngineWorkspace_w');

            this.speedButton = RoCode.createElement('button')
                .addClass(
                    'RoCodeSpeedButtonWorkspace',
                    'RoCodeEngineTopWorkspace',
                    'RoCodeEngineButtonWorkspace_w'
                )
                .appendTo(this.view_)
                .bindOnClick(function(e) {
                    RoCode.engine.toggleSpeedPanel();
                    this.blur();
                });

            this.maximizeButton = RoCode.createElement('button')
                .addClass(
                    'RoCodeEngineButtonWorkspace_w',
                    'RoCodeEngineTopWorkspace',
                    'RoCodeMaximizeButtonWorkspace_w'
                )
                .appendTo(this.view_)
                .bindOnClick(function(e) {
                    RoCode.engine.toggleFullScreen();
                    this.blur();
                });

            this.coordinateButton = RoCode.createElement('button')
                .addClass(
                    'RoCodeEngineButtonWorkspace_w',
                    'RoCodeEngineTopWorkspace',
                    'RoCodeCoordinateButtonWorkspace_w'
                )
                .appendTo(this.view_)
                .bindOnClick(function(e) {
                    if (this.hasClass('toggleOn')) {
                        this.removeClass('toggleOn');
                    } else {
                        this.addClass('toggleOn');
                    }

                    this.blur();
                    RoCode.stage.toggleCoordinator();
                });

            this.mouseView = RoCode.createElement('div')
                .addClass('RoCodeMouseViewWorkspace_w')
                .addClass('RoCodeHide')
                .appendTo(this.view_);

            this.mouseViewInput = RoCode.createElement('input').appendTo(this.mouseView);
            $(this.mouseViewInput).attr('readonly', 'readonly');

            this.buttonWrapper = RoCode.createElement('div')
                .addClass('RoCodeEngineButtonWrapper')
                .appendTo(this.view_);
            this.addButton = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodeAddButtonWorkspace_w')
                .bindOnClick(function() {
                    RoCode.do('addObjectButtonClick');
                    this.blur();
                })
                .appendTo(this.buttonWrapper);
            this.addButton.innerHTML = Lang.Workspace.add_object;
            if (!RoCode.objectAddable) {
                this.addButton.addClass('RoCodeRemove');
            }

            this.runButton = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodeRunButtonWorkspace_w')
                .bindOnClick(() => RoCode.do('toggleRun', 'runButton'))
                .appendTo(this.buttonWrapper);
            this.runButton.innerHTML = Lang.Workspace.run;

            this.runButton2 = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodeRunButtonWorkspace_w2')
                .appendTo(this.buttonWrapper)
                .bindOnClick(() => RoCode.engine.toggleRun());

            this.pauseButton = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodePauseButtonWorkspace_w')
                .addClass('RoCodeRemove')
                .appendTo(this.buttonWrapper)
                .bindOnClick(function(e) {
                    this.blur();
                    RoCode.engine.togglePause();
                });

            this.pauseButtonFull = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodePauseButtonWorkspace_full')
                .addClass('RoCodeRemove')
                .appendTo(this.buttonWrapper)
                .bindOnClick(function() {
                    this.blur();
                    RoCode.engine.togglePause();
                });

            this.stopButton = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodeStopButtonWorkspace_w')
                .addClass('RoCodeRemove')
                .bindOnClick(() => RoCode.do('toggleStop', 'stopButton'))
                .appendTo(this.buttonWrapper);
            this.stopButton.innerHTML = Lang.Workspace.stop;

            this.stopButton2 = RoCode.createElement('button')
                .addClass('RoCodeEngineButtonWorkspace_w')
                .addClass('RoCodeStopButtonWorkspace_w2')
                .addClass('RoCodeRemove')
                .bindOnClick(function() {
                    this.blur();
                    RoCode.engine.toggleStop();
                })
                .appendTo(this.buttonWrapper);
            this.stopButton2.innerHTML = Lang.Workspace.stop;
        } else if (option == 'minimize') {
            /** @type {!Element} */
            this.view_ = controlView;
            this.view_.addClass('RoCodeEngine');
            this.view_.addClass('RoCodeEngineMinimize');

            this.maximizeButton = RoCode.createElement('button');
            this.maximizeButton.addClass('RoCodeEngineButtonMinimize');
            this.maximizeButton.addClass('RoCodeMaximizeButtonMinimize');
            this.view_.appendChild(this.maximizeButton);
            this.maximizeButton.bindOnClick((e) => {
                RoCode.engine.toggleFullScreen();
            });

            this.coordinateButton = RoCode.createElement('button');
            this.coordinateButton.addClass('RoCodeEngineButtonMinimize');
            this.coordinateButton.addClass('RoCodeCoordinateButtonMinimize');
            this.view_.appendChild(this.coordinateButton);
            this.coordinateButton.bindOnClick(function(e) {
                if (this.hasClass('toggleOn')) {
                    this.removeClass('toggleOn');
                } else {
                    this.addClass('toggleOn');
                }
                RoCode.stage.toggleCoordinator();
            });

            this.stopButton = RoCode.createElement('button');
            this.stopButton.addClass('RoCodeEngineButtonMinimize');
            this.stopButton.addClass('RoCodeStopButtonMinimize');
            this.stopButton.addClass('RoCodeRemove');
            this.stopButton.innerHTML = Lang.Workspace.stop;
            this.view_.appendChild(this.stopButton);
            this.stopButton.bindOnClick(function(e) {
                this.blur();
                RoCode.engine.toggleStop();
            });

            this.pauseButton = RoCode.createElement('button');
            this.pauseButton.innerHTML = Lang.Workspace.pause;
            this.pauseButton.addClass('RoCodeEngineButtonMinimize');
            this.pauseButton.addClass('RoCodePauseButtonMinimize');
            this.pauseButton.addClass('RoCodeRemove');
            this.view_.appendChild(this.pauseButton);
            this.pauseButton.bindOnClick(function(e) {
                this.blur();
                RoCode.engine.togglePause();
            });

            this.mouseView = RoCode.createElement('div');
            this.mouseView.addClass('RoCodeMouseViewMinimize');
            this.mouseView.addClass('RoCodeHide');

            this.mouseViewInput = RoCode.createElement('input').appendTo(this.mouseView);
            $(this.mouseViewInput).attr('readonly', 'readonly');
            $(this.mouseViewInput).attr(
                'style',
                'border: none;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;line-height: normal'
            );

            this.view_.appendChild(this.mouseView);
            const setRunButton = (isLoaded) => {
                if (!isLoaded) {
                    return;
                }
                this.isLoaded = true;
                const isSoundEmpty = RoCode.soundQueue.urls.size < 1;
                if (isSoundEmpty || RoCode.soundQueue.loadComplete) {
                    this.runButtonCurtain = RoCode.Dom('div', {
                        class: 'RoCodeRunButtonBigMinimizeCurtain',
                        parent: $('#RoCodeCanvasWrapper'),
                    });
                    this.runButton = RoCode.Dom('div', {
                        class: 'RoCodeRunButtonBigMinimize',
                        parent: this.runButtonCurtain,
                    });
                    this.runButton.bindOnClick(() => RoCode.engine.toggleRun());
                }
            };

            RoCode.addEventListener('loadComplete', () => setRunButton(true));
            RoCode.addEventListener('soundLoaded', () => setRunButton(this.isLoaded));
        } else if (option == 'phone') {
            this.view_ = controlView;
            this.view_.addClass('RoCodeEngine', 'RoCodeEnginePhone');

            this.headerView_ = RoCode.createElement('div', 'RoCodeEngineHeader');
            this.headerView_.addClass('RoCodeEngineHeaderPhone');
            this.view_.appendChild(this.headerView_);

            this.maximizeButton = RoCode.createElement('button');
            this.maximizeButton.addClass('RoCodeEngineButtonPhone', 'RoCodeMaximizeButtonPhone');
            this.headerView_.appendChild(this.maximizeButton);
            this.maximizeButton.bindOnClick((e) => {
                RoCode.engine.footerView_.addClass('RoCodeRemove');
                RoCode.engine.headerView_.addClass('RoCodeRemove');
                RoCode.launchFullScreen(RoCode.engine.view_);
            });
            document.addEventListener('fullscreenchange', (e) => {
                RoCode.engine.exitFullScreen();
            });
            document.addEventListener('webkitfullscreenchange', (e) => {
                RoCode.engine.exitFullScreen();
            });
            document.addEventListener('mozfullscreenchange', (e) => {
                RoCode.engine.exitFullScreen();
            });

            this.footerView_ = RoCode.createElement('div', 'RoCodeEngineFooter');
            this.footerView_.addClass('RoCodeEngineFooterPhone');
            this.view_.appendChild(this.footerView_);

            this.runButton = RoCode.createElement('button');
            this.runButton.addClass('RoCodeEngineButtonPhone', 'RoCodeRunButtonPhone');
            if (RoCode.objectAddable) {
                this.runButton.addClass('small');
            }
            this.runButton.innerHTML = Lang.Workspace.run;

            this.footerView_.appendChild(this.runButton);
            this.runButton.bindOnClick((e) => {
                RoCode.engine.toggleRun();
            });

            this.stopButton = RoCode.createElement('button');
            this.stopButton.addClass(
                'RoCodeEngineButtonPhone',
                'RoCodeStopButtonPhone',
                'RoCodeRemove'
            );
            if (RoCode.objectAddable) {
                this.stopButton.addClass('small');
            }
            this.stopButton.innerHTML = Lang.Workspace.stop;

            this.footerView_.appendChild(this.stopButton);
            this.stopButton.bindOnClick((e) => {
                RoCode.engine.toggleStop();
            });
        }
    }

    toggleAudioShadePanel() {
        if (this.audioShadePanelOn) {
            this.audioShadePanelOn = false;
            $(this.audioShadePanel_).remove();
            delete this.audioShadePanel_;
        } else {
            this.audioShadePanelOn = true;
            this.audioShadePanel_ = RoCode.createElement('div', 'audioShadeCirclebox');
            this.audioShadePanel_.addClass('audioShadeCirclebox');
            const audioShadeMainCircle = RoCode.createElement('div', 'audioShadeCircle').addClass(
                'audioShadeCircle'
            );
            audioShadeMainCircle.appendChild(
                RoCode.createElement('div', 'audioShadeInner').addClass('audioShadeInner')
            );
            audioShadeMainCircle.appendChild(
                RoCode.createElement('div', 'audioShadeInner').addClass('audioShadeInner')
            );
            audioShadeMainCircle.appendChild(
                RoCode.createElement('div', 'audioShadeInner').addClass('audioShadeInner')
            );
            this.audioShadePanel_.appendChild(audioShadeMainCircle);
            const micImage = RoCode.createElement('img', 'audioShadeImg').addClass('audioShadeImg');
            micImage.src = `${RoCode.mediaFilePath}ic-audio-sensing-mic.svg`;
            audioShadeMainCircle.appendChild(micImage);

            const audioShadeText = RoCode.createElement('div', 'audioShadeText').addClass(
                'audioShadeText'
            );
            audioShadeText.innerHTML = Lang.Msgs.ai_utilize_audio_listening;
            this.audioShadePanel_.appendChild(audioShadeText);
            this.minimizedView_ = document.querySelector('#RoCodeCanvasWrapper');
            if (this.view_.classList[0] === 'RoCodeEngine') {
                this.minimizedView_.insertBefore(this.audioShadePanel_, RoCode.stage.canvas.canvas);
            } else {
                this.view_.insertBefore(this.audioShadePanel_, RoCode.stage.canvas.canvas);
            }
        }
    }

    toggleAudioProgressPanel() {
        if (this.audioShadePanelOn) {
            RoCode.engine.toggleAudioShadePanel();
        }
        if (this.audioProgressPanelOn) {
            this.audioProgressPanelOn = false;
            $(this.audioProgressPanel_).remove();
            delete this.audioProgressPanel_;
        } else {
            this.audioProgressPanelOn = true;
            this.audioProgressPanel_ = RoCode.createElement('div', 'audioShadeCirclebox');
            this.audioProgressPanel_.addClass('audioShadeCirclebox');
            const audioShadeMainCircle = RoCode.createElement('div', 'audioShadeCircle').addClass(
                'audioShadeCircle'
            );

            const audioProgressSpinner = RoCode.createElement(
                'canvas',
                'audioProgressCanvas'
            ).addClass('audioProgress');

            const ctx = audioProgressSpinner.getContext('2d');
            const circlesRotate = [0, 15, 30, 45, 60];
            audioProgressSpinner.width = 100;
            audioProgressSpinner.height = 100;
            function fnDraw() {
                audioProgressSpinner.width = audioProgressSpinner.width;
                fnCircle();
                window.requestAnimationFrame(fnDraw);
            }
            fnDraw();

            function fnReturnDeg(deg) {
                return (deg * Math.PI) / 180;
            }

            function fnCircle() {
                ctx.fillStyle = 'white';
                for (let i = 0; i < circlesRotate.length; i++) {
                    ctx.beginPath();
                    ctx.save();
                    ctx.translate(audioProgressSpinner.width / 2, audioProgressSpinner.height / 2);
                    ctx.rotate(fnReturnDeg(circlesRotate[i]));
                    ctx.arc(0, -audioProgressSpinner.height / 3, 7, Math.PI, 10);
                    ctx.fill();
                    ctx.restore();
                    if (circlesRotate[i] < 60 || circlesRotate[i] > 300) {
                        circlesRotate[i] += 3;
                    } else {
                        circlesRotate[i] += 7;
                    }
                    if (circlesRotate[i] > 360) {
                        circlesRotate[i] -= 360;
                    }
                }
            }
            audioShadeMainCircle.appendChild(audioProgressSpinner);

            this.audioProgressPanel_.appendChild(audioShadeMainCircle);

            // const audioShadeText = RoCode.createElement('div', 'audioShadeText').addClass(
            //     'audioShadeText'
            // );
            // audioShadeText.innerHTML = '진행중이에요';
            // this.audioProgressPanel_.appendChild(audioShadeText);
            this.minimizedView_ = document.querySelector('#RoCodeCanvasWrapper');
            if (this.view_.classList[0] === 'RoCodeEngine') {
                this.minimizedView_.insertBefore(this.audioShadePanel_, RoCode.stage.canvas.canvas);
            } else {
                this.view_.insertBefore(this.audioProgressPanel_, RoCode.stage.canvas.canvas);
            }
        }
    }

    hideAllAudioPanel() {
        if (this.audioShadePanelOn) {
            this.audioShadePanelOn = false;
            $(this.audioShadePanel_).remove();
            delete this.audioShadePanel_;
        }
        if (this.audioProgressPanelOn) {
            this.audioProgressPanelOn = false;
            $(this.audioProgressPanel_).remove();
            delete this.audioProgressPanel_;
        }
    }

    toggleSpeedPanel() {
        if (this.speedPanelOn) {
            this.speedPanelOn = false;
            this.speedButton.removeClass('on');

            $(this.speedLabel_)
                .parent()
                .remove();
            delete this.speedLabel_;
            $(this.speedProgress_).fadeOut(null, function(e) {
                $(this).remove();
                delete this.speedProgress_;
            });
            $(this.speedHandle_).remove();
            delete this.speedHandle_;
        } else {
            this.speedPanelOn = true;
            this.speedButton.addClass('on');

            const speedBox = RoCode.createElement('div', 'RoCodeSpeedBox');
            speedBox.addClass('RoCodeSpeedBox');
            this.view_.insertBefore(speedBox, RoCode.stage.canvas.canvas);

            this.speedLabel_ = RoCode.createElement('div', 'RoCodeSpeedLabelWorkspace');
            this.speedLabel_.innerHTML = Lang.Workspace.speed;
            speedBox.appendChild(this.speedLabel_);

            this.speedProgress_ = RoCode.createElement('table', 'RoCodeSpeedProgressWorkspace');
            const tr = RoCode.createElement('tr').appendTo(this.speedProgress_);

            this.speeds.forEach((speed, i) => {
                RoCode.createElement('td', `progressCell${i}`)
                    .addClass('progressCell')
                    .bindOnClick(() => {
                        this.setSpeedMeter(speed);
                    })
                    .appendTo(tr);
            });

            speedBox.appendChild(this.speedProgress_);
            this.setSpeedMeter(RoCode.FPS);
        }
    }

    setSpeedMeter(FPS) {
        let level = this.speeds.indexOf(FPS);
        if (level < 0) {
            return;
        }
        level = Math.min(4, level);
        level = Math.max(0, level);
        if (this.speedPanelOn) {
            const elements = document.querySelectorAll(`.progressCell`);
            Array.from(elements).forEach((element, i) => {
                if (level === i) {
                    element.className = 'progressCell on';
                } else if (element.className.indexOf('on') > -1) {
                    element.className = 'progressCell';
                }
            });
        }
        if (RoCode.FPS == FPS) {
            return;
        }
        clearInterval(this.ticker);
        RoCode.tickTime = Math.floor(1000 / FPS);
        this.ticker = setInterval(this.update, RoCode.tickTime);
        RoCode.FPS = FPS;
    }

    start() {
        GEHelper.Ticker.setFPS(RoCode.FPS);

        if (!this.ticker) {
            RoCode.tickTime = Math.floor(1000 / RoCode.FPS);
            this.ticker = setInterval(this.update, RoCode.tickTime);
        }
    }

    stop() {
        GEHelper.Ticker.reset();
        audioUtils.stopRecord();
        clearInterval(this.ticker);
        this.ticker = null;
    }

    /**
     * 매 틱당 실행되며, canvas, object 를 업데이트한다.
     * 추가로, 하드웨어의 데이터도 업데이트한다.
     */
    update = () => {
        if (RoCode.engine.isState('run')) {
            RoCode.container.mapObjectOnScene(this.computeFunction);
            if (RoCode.hw.communicationType !== 'manual') {
                RoCode.hw.update();
            }
        }
    };

    /**
     * Compute function for map. (Ntry 에 동일한 명칭의 함수가 있어 그대로 둠)
     */
    computeFunction({ script }) {
        script.tick();
    }

    /**
     * Check this state is same with argument
     * @param {string} state
     * @return {boolean}
     */
    isState(state) {
        return this.state.indexOf(state) > -1;
    }

    /**
     * Execute this function when click start button
     */
    run() {
        if (this.isState('run')) {
            this.toggleStop();
        } else if (this.isState('stop') || this.isState('pause')) {
            this.toggleRun();
        }
    }

    /**
     * toggle this engine state run
     */
    toggleRun(disableAchieve) {
        const isSupportWebAudio = window.AudioContext || window.webkitAudioContext;
        if (isSupportWebAudio && !this.isSoundInitialized) {
            createjs.WebAudioPlugin.playEmptySound();
            this.isSoundInitialized = true;
        }
        const variableContainer = RoCode.variableContainer;
        const container = RoCode.container;
        const WS = RoCode.getMainWS();

        if (this.state === RoCodeEngineState.pause) {
            return this.togglePause();
        }

        RoCode.Utils.blur();

        WS && WS.syncCode();

        RoCode.addActivity('run');

        if (this.state === RoCodeEngineState.stop) {
            container.mapEntity((entity) => {
                entity.takeSnapshot();
            });
            variableContainer.mapVariable((variable) => {
                variable.takeSnapshot();
            });
            variableContainer.mapList((variable) => {
                variable.takeSnapshot();
            });
            this.projectTimer.takeSnapshot();
            container.inputValue.takeSnapshot();

            container.takeSequenceSnapshot();
            RoCode.scene.takeStartSceneSnapshot();
            this.state = RoCodeEngineState.run;
            this.fireEvent('start');
            this.achieveEnabled = !(disableAchieve === false);
        }
        this.state = RoCodeEngineState.run;
        if (RoCode.type === 'mobile') {
            this.view_.addClass('RoCodeEngineBlueWorkspace');
        }

        if (this.runButton) {
            this.setPauseButton(this.option);
            this.runButton.addClass('run');
            this.runButton.addClass('RoCodeRemove');
            if (this.runButtonCurtain) {
                this.runButtonCurtain.addClass('RoCodeRemove');
            }
            this.stopButton.removeClass('RoCodeRemove');
            if (this.addButton) {
                this.addButton.addClass('RoCodeRemove');
                if (RoCode.objectAddable) {
                    this.pauseButton.removeClass('RoCodeRemove');
                }
            }
            if (this.pauseButton && (RoCode.type === 'minimize' || RoCode.objectAddable)) {
                this.pauseButton.removeClass('RoCodeRemove');
            }

            if (this.runButton2) {
                this.runButton2.addClass('RoCodeRemove');
            }
            if (this.stopButton2) {
                this.stopButton2.removeClass('RoCodeRemove');
            }
            if (this.pauseButtonFull) {
                this.pauseButtonFull.removeClass('RoCodeRemove');
            }
        }

        if (!this.isUpdating) {
            this.update();
            this.isUpdating = true;
        }

        this.setEnableInputField(true);

        this.selectedObject = RoCode.stage.selectedObject;
        RoCode.stage.selectObject();
        RoCode.dispatchEvent('run');
    }

    /**
     * toggle this engine state stop
     */
    async toggleStop() {
        RoCode.dispatchEvent('beforeStop');
        try {
            await Promise.all(this.execPromises);
        } catch (e) {}
        const container = RoCode.container;
        const variableContainer = RoCode.variableContainer;

        RoCode.Utils.blur();
        audioUtils.stopRecord();
        RoCode.addActivity('stop');

        container.mapEntity((entity) => {
            entity.loadSnapshot();
            entity.object.filters = [];
            entity.resetFilter();
            if (entity.dialog) {
                entity.dialog.remove();
            }
            if (entity.brush) {
                entity.removeBrush();
            }
        });

        variableContainer.mapVariable((variable) => {
            variable.loadSnapshot();
        });
        variableContainer.mapList((variable) => {
            variable.loadSnapshot();
        });
        this.stopProjectTimer();
        if (RoCode.timerInstances) {
            RoCode.timerInstances.forEach((instance) => {
                instance.destroy();
            });
        }
        container.clearRunningState();
        container.loadSequenceSnapshot();
        this.projectTimer.loadSnapshot();
        container.inputValue.loadSnapshot();
        RoCode.scene.loadStartSceneSnapshot();
        RoCode.Func.clearThreads();
        RoCode.Utils.setVolume(1);
        createjs.Sound.setVolume(1);
        createjs.Sound.stop();
        RoCode.soundInstances = [];
        RoCode.targetChecker && RoCode.targetChecker.clearListener();

        this.view_.removeClass('RoCodeEngineBlueWorkspace');
        if (this.runButton) {
            this.runButton.removeClass('RoCodeRemove');
            if (this.runButtonCurtain) {
                this.runButtonCurtain.removeClass('RoCodeRemove');
            }
            this.stopButton.addClass('RoCodeRemove');
            if (this.pauseButton) {
                this.pauseButton.addClass('RoCodeRemove');
            }
            if (this.pauseButtonFull) {
                this.pauseButtonFull.addClass('RoCodeRemove');
            }
            if (this.addButton && RoCode.objectAddable) {
                this.addButton.removeClass('RoCodeRemove');
            }

            if (this.runButton2) {
                this.runButton2.removeClass('RoCodeRemove');
            }
            if (this.stopButton2) {
                this.stopButton2.addClass('RoCodeRemove');
            }
        }

        this.state = RoCodeEngineState.stop;
        this.setEnableInputField(false);
        RoCode.dispatchEvent('stop');
        RoCode.stage.hideInputField();
        (function(w) {
            w && w.getMode() === RoCode.Workspace.MODE_VIMBOARD && w.codeToText();
        })(RoCode.getMainWS());
        RoCode.dispatchEvent('dispatchEventDidToggleStop');
        RoCode.stage.selectObject(this.selectedObject);
    }

    setEnableInputField(on) {
        const inputField = RoCode.stage.inputField;
        if (inputField) {
            inputField._readonly = !on;
            if (!inputField._isHidden) {
                on ? inputField.focus() : inputField.blur();
            }
        }
    }

    /**
     * toggle this engine state pause
     */
    togglePause({ visible = true } = {}) {
        const timer = RoCode.engine.projectTimer;
        if (this.state === RoCodeEngineState.pause) {
            this.setEnableInputField(true);
            timer.pausedTime += new Date().getTime() - timer.pauseStart;
            if (timer.isPaused) {
                timer.pauseStart = new Date().getTime();
            } else {
                delete timer.pauseStart;
            }
            this.state = RoCodeEngineState.run;
            RoCode.Utils.recoverSoundInstances();
            if (visible && this.runButton) {
                this.setPauseButton(this.option);
                if (this.runButton2) {
                    this.runButton2.addClass('RoCodeRemove');
                } else {
                    this.runButton.addClass('RoCodeRemove');
                    if (this.runButtonCurtain) {
                        this.runButtonCurtain.addClass('RoCodeRemove');
                    }
                }
            }

            if (RoCode.timerInstances) {
                RoCode.timerInstances.forEach((instance) => {
                    instance.resume();
                });
            }
        } else {
            this.state = RoCodeEngineState.pause;
            this.setEnableInputField(false);
            if (!timer.isPaused) {
                timer.pauseStart = new Date().getTime();
            } else {
                timer.pausedTime += new Date().getTime() - timer.pauseStart;
                timer.pauseStart = new Date().getTime();
            }
            RoCode.Utils.pauseSoundInstances();
            if (visible && this.runButton) {
                this.setPauseButton(this.option);
                this.stopButton.removeClass('RoCodeRemove');
                if (this.runButton2) {
                    this.runButton2.removeClass('RoCodeRemove');
                } else {
                    this.runButton.removeClass('RoCodeRemove');
                    if (this.runButtonCurtain) {
                        this.runButtonCurtain.removeClass('RoCodeRemove');
                    }
                }
            }

            if (RoCode.timerInstances) {
                RoCode.timerInstances.forEach((instance) => {
                    instance.pause();
                });
            }
        }
        RoCode.dispatchEvent('dispatchEventDidTogglePause');
    }

    setPauseButton() {
        if (this.state === RoCodeEngineState.pause) {
            if (this.pauseButton) {
                this.pauseButton.innerHTML = Lang.Workspace.restart;
                if (this.option !== 'minimize') {
                    this.pauseButton.removeClass('RoCodePauseButtonWorkspace_w');
                    this.pauseButton.addClass('RoCodeRestartButtonWorkspace_w');
                }
            }
            if (this.pauseButtonFull) {
                this.pauseButtonFull.innerHTML = Lang.Workspace.restart;
                if (this.option !== 'minimize') {
                    // workspace && buttonWrapper check
                    if (this.buttonWrapper) {
                        this.pauseButtonFull.addClass('RoCodePauseButtonWorkspace_full');
                    } else {
                        this.pauseButtonFull.removeClass('RoCodePauseButtonWorkspace_full');
                    }
                    this.pauseButtonFull.addClass('RoCodeRestartButtonWorkspace_full');
                }
            }
        } else {
            if (this.pauseButton) {
                this.pauseButton.innerHTML = Lang.Workspace.pause;
                if (this.option !== 'minimize') {
                    this.pauseButton.addClass('RoCodePauseButtonWorkspace_w');
                    this.pauseButton.removeClass('RoCodeRestartButtonWorkspace_w');
                }
            }
            if (this.pauseButtonFull) {
                this.pauseButtonFull.innerHTML = Lang.Workspace.pause;
                if (this.option !== 'minimize') {
                    this.pauseButtonFull.addClass('RoCodePauseButtonWorkspace_full');
                    this.pauseButtonFull.removeClass('RoCodeRestartButtonWorkspace_full');
                }
            }
        }
    }

    /**
     * @param {string} eventName
     */
    fireEvent(eventName) {
        if (this.state !== RoCodeEngineState.run) {
            return;
        }
        RoCode.container.mapEntityIncludeCloneOnScene(this.raiseEvent, eventName);
    }

    /**
     * this is callback function for map.
     * @param {RoCode.RoCodeObject} object
     * @param {string} eventName
     */
    raiseEvent = (entity, eventName) => {
        entity.parent.script.raiseEvent(eventName, entity);
    };

    /**
     * @param {string} eventName
     * @param {RoCode.EntityObject} entity
     */
    fireEventOnEntity(eventName, entity) {
        if (this.state === RoCodeEngineState.run) {
            RoCode.container.mapEntityIncludeCloneOnScene(this.raiseEventOnEntity, [
                entity,
                eventName,
            ]);
        }
    }

    /**
     * this is callback function for map.
     * @param {RoCode.RoCodeObject} object
     * @param {Array} param
     */
    raiseEventOnEntity(entity, param) {
        if (entity !== param[0]) {
            return;
        }
        const eventName = param[1];
        entity.parent.script.raiseEvent(eventName, entity);
    }

    /**
     * @param {KeyboardEvent} e
     * @param {boolean} isForce
     */
    captureKeyEvent(e, isForce) {
        const keyCode = RoCode.Utils.inputToKeycode(e);
        if (!keyCode) {
            return;
        }
        const isWorkspace = RoCode.type === 'workspace';

        if (RoCode.Utils.isInInput(e) && !isForce) {
            return;
        }

        //mouse shortcuts
        if (keyCode !== 17 && e.ctrlKey && isWorkspace) {
            if (keyCode === 83) {
                e.preventDefault();
                RoCode.dispatchEvent(e.shiftKey ? 'saveAsWorkspace' : 'saveWorkspace');
            } else if (keyCode === 82) {
                e.preventDefault();
                RoCode.engine.run();
            } else if (keyCode === 90) {
                e.preventDefault();
                RoCode.dispatchEvent(e.shiftKey ? 'redo' : 'undo');
            }
        } else if (RoCode.engine.isState('run')) {
            e.preventDefault && e.preventDefault();
            RoCode.container.mapEntityIncludeCloneOnScene(RoCode.engine.raiseKeyEvent, [
                'keyPress',
                keyCode,
            ]);
        }

        if (RoCode.engine.isState('stop')) {
            if (isWorkspace && keyCode >= 37 && keyCode <= 40) {
                RoCode.stage.moveSprite(e);
            }
        }
    }

    raiseKeyEvent(entity, [eventName, keyCode]) {
        return entity.parent.script.raiseEvent(eventName, entity, String(keyCode));
    }

    updateMouseView() {
        const { x, y } = RoCode.stage.mouseCoordinate;
        this.mouseViewInput.value = `X : ${x}, Y : ${y}`;
        this.mouseView.removeClass('RoCodeHide');
    }

    hideMouseView() {
        this.mouseView.addClass('RoCodeHide');
    }

    toggleFullScreen(popupClassName) {
        if (!this.popup) {
            this.popup = new RoCode.Popup(popupClassName);
            if (RoCode.engine.speedPanelOn) {
                RoCode.engine.toggleSpeedPanel();
            }
            if (RoCode.type !== 'workspace') {
                const $doc = $(document);
                const body = $(this.popup.body_);
                body.css('top', $doc.scrollTop());
                $('body').css('overflow', 'hidden');

                popup.window_.appendChild(RoCode.stage.canvas.canvas);
                popup.window_.appendChild(RoCode.engine.runButton[0]);
            }
            popup.window_.appendChild(RoCode.engine.view_);
            if (RoCode.type === 'workspace' && RoCode.targetChecker) {
                popup.window_.appendChild(RoCode.targetChecker.getStatusView()[0]);
            }
        } else {
            this.popup.remove();
            this.popup = null;
        }
        RoCode.windowResized.notify();
    }

    closeFullScreen() {
        if (this.popup) {
            this.popup.remove();
            this.popup = null;
        }

        RoCode.windowResized.notify();
    }

    exitFullScreen() {
        if (document.webkitIsFullScreen || document.mozIsFullScreen || document.isFullScreen) {
        } else {
            RoCode.engine.footerView_.removeClass('RoCodeRemove');
            RoCode.engine.headerView_.removeClass('RoCodeRemove');
        }
        RoCode.windowResized.notify();
    }

    showProjectTimer() {
        const timer = RoCode.engine.projectTimer;
        if (!timer) {
            return;
        }
        this.projectTimer.setVisible(true);
    }

    hideProjectTimer(removeBlock, notIncludeSelf) {
        const timer = this.projectTimer;
        if (!timer || !timer.isVisible() || this.isState('run')) {
            return;
        }
        const objects = RoCode.container.getAllObjects();

        const timerTypes = [
            'get_project_timer_value',
            'reset_project_timer',
            'set_visible_project_timer',
            'choose_project_timer_action',
        ];

        for (let i = 0, len = objects.length; i < len; i++) {
            const code = objects[i].script;
            for (let j = 0; j < timerTypes.length; j++) {
                const blocks = code.getBlockList(false, timerTypes[j]);
                if (notIncludeSelf) {
                    const index = blocks.indexOf(removeBlock);
                    if (index > -1) {
                        blocks.splice(index, 1);
                    }
                }
                if (blocks.length > 0) {
                    return;
                }
            }
        }
        timer.setVisible(false);
    }

    clearTimer() {
        clearInterval(this.ticker);
        clearInterval(this.projectTimer.tick);
    }

    startProjectTimer() {
        const timer = this.projectTimer;

        if (!timer) {
            return;
        }

        timer.start = new Date().getTime();
        timer.isInit = true;
        timer.isPaused = false;
        timer.pausedTime = 0;
        timer.tick = setInterval((e) => {
            RoCode.engine.updateProjectTimer();
        }, 1000 / 60);
    }

    stopProjectTimer() {
        const timer = this.projectTimer;
        if (!timer) {
            return;
        }
        this.updateProjectTimer(0);
        timer.isPaused = false;
        timer.isInit = false;
        timer.pausedTime = 0;
        clearInterval(timer.tick);
    }

    resetTimer() {
        const timer = this.projectTimer;
        if (!timer.isInit) {
            return;
        }
        const isPaused = timer.isPaused;

        delete timer.pauseStart;

        this.updateProjectTimer(0);
        timer.pausedTime = 0;

        timer.isPaused = isPaused;

        if (!isPaused) {
            return;
        }

        clearInterval(timer.tick);
        timer.isInit = false;
        delete timer.start;
    }

    updateProjectTimer(value) {
        const engine = RoCode.engine;
        const timer = engine.projectTimer;
        if (!timer) {
            return;
        }
        const current = new Date().getTime();
        if (typeof value == 'undefined') {
            if (!timer.isPaused && !engine.isState('pause')) {
                timer.setValue(
                    Math.max((current - (timer.start || current) - timer.pausedTime) / 1000, 0)
                );
            }
        } else {
            timer.setValue(value);
            timer.pausedTime = 0;
            timer.start = current;
        }
    }

    raiseMessage(value) {
        RoCode.message.notify(RoCode.variableContainer.getMessage(value));
        return RoCode.container.mapEntityIncludeCloneOnScene(this.raiseKeyEvent, [
            'when_message_cast',
            value,
        ]);
    }

    getDom(query) {
        if (query.length >= 1) {
            switch (query.shift()) {
                case 'runButton':
                    return this.runButton;
                case 'stopButton':
                    return this.stopButton;
                case 'objectAddButton':
                    return this.addButton;
            }
        } else {
        }
    }

    attachKeyboardCapture() {
        if (RoCode.keyPressed) {
            this._keyboardEvent && this.detachKeyboardCapture();
            this._keyboardEvent = RoCode.keyPressed.attach(this, this.captureKeyEvent);
        }
    }

    detachKeyboardCapture() {
        if (RoCode.keyPressed && this._keyboardEvent) {
            this._keyboardEvent.destroy();
            delete this._keyboardEvent;
        }
    }

    applyOption() {
        const SMALL = 'small';

        if (RoCode.objectAddable) {
            this.runButton.addClass(SMALL);
            this.stopButton.addClass(SMALL);
            this.addButton.removeClass('RoCodeRemove');
        } else {
            this.runButton.removeClass(SMALL);
            this.stopButton.removeClass(SMALL);
            this.addButton.addClass('RoCodeRemove');
        }
    }

    destroy() {
        // 우선 interface 만 정의함.
    }

    trimPromiseExecutor() {
        return this.execPromises.filter((promise) => promise instanceof Promise);
    }

    addPromiseExecutor(promises) {
        this.execPromises = this.trimPromiseExecutor();
        const index = this.execPromises.length;
        promises.forEach((promise, i) => {
            const execPromise = (async function() {
                const result = await promise;
                const j = RoCode.engine.execPromises.indexOf(execPromise);
                RoCode.engine.execPromises[j] = result;
            })();
            this.execPromises[index + i] = execPromise;
        });
    }
};

RoCode.Engine.computeThread = function(entity, script) {
    RoCode.engine.isContinue = true;
    let isSame = false;
    while (script && RoCode.engine.isContinue && !isSame) {
        RoCode.engine.isContinue = !script.isRepeat;
        const newScript = script.run();
        isSame = newScript && newScript === script;
        script = newScript;
    }
    return script;
};
