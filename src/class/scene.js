/**
 * @fileoverview Scene controller for RoCode.
 */
'use strict';

import { Sortable } from '@RoCodelabs/tool';

/**
 * Class for a scene controller.
 * This have view for scenes.
 * @constructor
 */
const STATIC_SCENES_COUNT = 30;

RoCode.Scene = class {
    constructor() {
        this.scenes_ = [];
        this.selectedScene = null;
        this.maxCount = this.getMaxSceneCount() || 30;
        $(window).on('resize', this.resize.bind(this));

        this.disposeEvent = RoCode.disposeEvent.attach(this, (e) => {
            const elem = document.activeElement;
            if (e && elem && elem !== e.target && $(elem).hasClass('RoCodeSceneFieldWorkspace')) {
                elem.blur();
            }
        });
    }

    /**
     * Control bar view generator.
     * @param {!Element} sceneView sceneView from RoCode.
     * @param {?string} option for choose type of view.
     */
    generateView(sceneView, option) {
        this.view_ = sceneView;
        this.view_.addClass('RoCodeScene');
        if (!option || option === 'workspace' || option === 'playground') {
            this.view_.addClass('RoCodeSceneWorkspace');

            $(this.view_).on('mousedown touchstart', (e) => {
                const offset = $(this.view_).offset();
                const $window = $(window);

                const slope = -40 / 55;
                const selectedScene = this.selectedScene;
                const selectedLeft = $(selectedScene.view)
                    .find('.RoCodeSceneRemoveButtonCoverWorkspace')
                    .offset().left;

                const x = e.pageX - offset.left + $window.scrollLeft() - selectedLeft;
                const y = 40 - (e.pageY - offset.top + $window.scrollTop());

                if (x < selectedLeft || x > selectedLeft + 55) {
                    return;
                }
            });

            const listView = this.createListView();
            this.view_.appendChild(listView);
            this.listView_ = listView;

            if (RoCode.sceneEditable) {
                const addButton = this.createAddButton();
                this.view_.appendChild(addButton);
                this.addButton_ = addButton;

                const scenePrevButton = this.scenePrevButton();
                const sceneNextButton = this.sceneNextButton();
                this.view_.appendChild(scenePrevButton);
                this.view_.appendChild(sceneNextButton);

                this.scenePrevButton = scenePrevButton;
                this.sceneNextButton = sceneNextButton;

                this.prevButton_ = scenePrevButton;
                this.nextButton_ = sceneNextButton;

                this.sceneListWidth = RoCode.scene.listView_.offsetWidth;
                this.updateView();
            }
        }
    }

    createAddButton() {
        const addButton = RoCode.createElement('span').addClass(
            'RoCodeSceneElementWorkspace RoCodeSceneAddButtonWorkspace'
        );

        addButton.bindOnClick((e) => {
            if (RoCode.engine.isState('run')) {
                return;
            }
            RoCode.do('sceneAdd', RoCode.generateHash());
        });

        return addButton;
    }
    /**
     * prev scene button
     */
    scenePrevButton() {
        const prevButton = RoCode.createElement('span').addClass(
            'RoCodeSceneElementWorkspace RoCodeScenePrevButtonWorkspace'
        );

        const prevBtn = document.createElement('span').addClass('prevBtn');
        prevButton.bindOnClick((e) => {
            this.selectScene(RoCode.scene.getPrevScene());
        });

        prevButton.appendChild(prevBtn);

        return prevButton;
    }
    /**
     * next scene, add scene button
     */
    sceneNextButton() {
        const nextButton = RoCode.createElement('span').addClass(
            'RoCodeSceneElementWorkspace RoCodeSceneNextButtonWorkspace'
        );

        const nextBtn = document.createElement('span').addClass('nextBtn');
        nextBtn.bindOnClick((e) => {
            this.selectScene(RoCode.scene.getNextScene());
        });

        const addButton = document.createElement('span').addClass('addButton');
        addButton.bindOnClick((e) => {
            if (RoCode.engine.isState('run')) {
                return;
            }
            this.sceneListwidth = RoCode.scene.listView_.offsetWidth;

            RoCode.do('sceneAdd', RoCode.generateHash());
        });

        this.nextAddButton_ = addButton;
        nextButton.appendChild(nextBtn);
        nextButton.appendChild(addButton);

        return nextButton;
    }

    createListView() {
        const listView = RoCode.createElement('div');
        listView.addClass('RoCodeSceneListWorkspace');

        this.sceneSortableListWidget = new Sortable({
            data: {
                height: '100%',
                sortableTarget: ['RoCodeSceneRemoveButtonWorkspace', 'RoCodeSceneInputCover'],
                lockAxis: 'x',
                axis: 'x',
                items: this._getSortableSceneList(),
            },
            container: listView,
        });
        if (RoCode.sceneEditable) {
            this.sceneSortableListWidget.on('change', ([newIndex, oldIndex]) => {
                RoCode.scene.moveScene(newIndex, oldIndex);
            });
        }
        return listView;
    }

    updateSceneView() {
        const items = this._getSortableSceneList();
        if (this.sceneSortableListWidget) {
            setTimeout(() => this.sceneSortableListWidget.setData({ items }), 0);
        }
    }

    _getSortableSceneList() {
        if (!this.scenes_ || this.scenes_.length === 0) {
            return [];
        }

        return this.scenes_.map((value) => ({
            key: value.id,
            item: value.view,
        }));
    }

    /**
     * generate li element for scene
     * @param {!scene model} scene
     */
    generateElement(scene) {
        const viewTemplate = this.createViewTemplate(scene);
        RoCode.Utils.disableContextmenu(viewTemplate);

        const nameField = this.createNameField(scene);
        viewTemplate.nameField = nameField;

        const sceneLeft = this.createSceneLeft();
        viewTemplate.appendChild(sceneLeft);

        const divide = this.createSceneDivider();
        viewTemplate.appendChild(divide);
        scene.inputWrapper = divide;
        divide.appendChild(nameField);

        const removeButtonCover = this.createRemoveButtonCover();
        viewTemplate.appendChild(removeButtonCover);

        if (RoCode.sceneEditable) {
            scene.removeButton = this.createRemoveButton(scene, removeButtonCover);

            RoCode.ContextMenu.onContextmenu(viewTemplate, (coordinate) => {
                const options = [
                    {
                        text: Lang.Workspace.duplicate_scene,
                        enable: RoCode.engine.isState('stop') && !this.isMax(),
                        callback() {
                            RoCode.scene.cloneScene(scene);
                        },
                    },
                ];
                RoCode.ContextMenu.show(options, 'workspace-contextmenu', coordinate);
            });
        }

        scene.view = viewTemplate;

        return viewTemplate;
    }

    createRemoveButton(scene, removeButtonCover) {
        return RoCode.createElement('button')
            .addClass('RoCodeSceneRemoveButtonWorkspace')
            .bindOnClick((e) => {
                if (RoCode.engine.isState('run')) {
                    return;
                }
                const isDeletable = RoCode.scene.getScenes().length > 1;
                if (!isDeletable) {
                    RoCode.toast.alert(
                        Lang.Msgs.runtime_error,
                        Lang.Workspace.Scene_delete_error,
                        false
                    );
                    return;
                }
                RoCode.do('sceneRemove', scene.id);
            })
            .appendTo(removeButtonCover);
    }

    createRemoveButtonCover() {
        const removeButtonCover = RoCode.createElement('span');
        removeButtonCover.addClass('RoCodeSceneRemoveButtonCoverWorkspace');
        return removeButtonCover;
    }

    createSceneDivider() {
        const divide = RoCode.createElement('span');
        divide.addClass('RoCodeSceneInputCover');
        return divide;
    }

    createSceneLeft() {
        const sceneLeft = RoCode.createElement('span');
        sceneLeft.addClass('RoCodeSceneLeftWorkspace');
        return sceneLeft;
    }

    createNameField(scene) {
        const nameField = RoCode.createElement('input');
        nameField.addClass('RoCodeSceneFieldWorkspace');
        nameField.value = scene.name;

        nameField.addEventListener('keyup', ({ keyCode: code }) => {
            if (RoCode.isArrowOrBackspace(code)) {
                return;
            }

            const applyValue = (value) => {
                value !== scene.name && RoCode.do('sceneRename', scene.id, value);
                nameField.blur();
            };

            let value = nameField.value;

            if (code === 13) {
                applyValue(value);
            } else if (value.length > 10) {
                value = value.substring(0, 10);
                applyValue(value);
            }
        });
        nameField.addEventListener('blur', (e) => {
            if (nameField.value !== scene.name) {
                RoCode.do('sceneRename', scene.id, nameField.value);
            }

            const { playground = {} } = RoCode;
            const { mainWorkspace } = playground;
            if (mainWorkspace) {
                mainWorkspace.reDraw();
            }
        });

        if (!RoCode.sceneEditable) {
            nameField.disabled = 'disabled';
        }

        return nameField;
    }

    createViewTemplate(scene) {
        const viewTemplate = RoCode.createElement('div', scene.id);
        viewTemplate.addClass('RoCodeSceneElementWorkspace  RoCodeSceneButtonWorkspace minValue');
        $(viewTemplate).on('mousedown touchstart', (e) => {
            if (RoCode.engine.isState('run')) {
                return;
            }
            if (RoCode.scene.selectedScene !== scene) {
                RoCode.do('sceneSelect', scene.id);
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
            }
        });
        return viewTemplate;
    }

    updateView() {
        if (!RoCode.type || RoCode.type === 'workspace') {
            // var parent = this.listView_;
            // this.getScenes().forEach(({ view }) => parent.appendChild(view));
            const addBtnWidth = 44;
            const sceneListWidth = this.sceneListWidth + addBtnWidth;
            const browserWidth = RoCode.view_.offsetWidth;
            const maxSceneCount = RoCode.scene.scenes_.length || STATIC_SCENES_COUNT;
            if (this.addButton_) {
                if (maxSceneCount >= STATIC_SCENES_COUNT) {
                    this.addButton_.addClass('RoCodeRemove');
                    this.nextAddButton_.addClass('RoCodeRemove');
                } else {
                    this.addButton_.removeClass('RoCodeRemove');
                    this.prevButton_.removeClass('RoCodeRemove');
                    this.nextButton_.removeClass('RoCodeRemove');

                    if (sceneListWidth > browserWidth) {
                        this.addButton_.addClass('RoCodeRemove');
                        this.nextAddButton_.removeClass('RoCodeRemove');
                    } else {
                        this.nextButton_.addClass('RoCodeRemove');
                        this.prevButton_.addClass('RoCodeRemove');
                    }
                }
            }
        }
        this.updateSceneView();
        this.resize();
    }

    /**
     * add scenes
     * @param {Array<scene model>} scenes
     */
    addScenes(scenes) {
        this.scenes_ = scenes;
        if (!scenes || scenes.length === 0) {
            this.scenes_ = [];
            this.scenes_.push(this.createScene());
        } else {
            for (let i = 0, len = scenes.length; i < len; i++) {
                this.generateElement(scenes[i]);
            }
        }

        this.selectScene(this.getScenes()[0]);
    }
    /**
     * add scenes to this.scenes_
     * @param {scene model} scene
     */
    addScene(scene, index) {
        if (scene === undefined || typeof scene === 'string') {
            scene = this.createScene(scene);
        }

        if (!scene.view) {
            this.generateElement(scene);
        }

        if (!index && typeof index != 'number') {
            this.getScenes().push(scene);
        } else {
            this.getScenes().splice(index, 0, scene);
        }

        RoCode.stage.objectContainers.push(RoCode.stage.createObjectContainer(scene));
        this.selectScene(scene);

        if (RoCode.creationChangedEvent) {
            RoCode.creationChangedEvent.notify();
        }
        const { playground = {} } = RoCode || {};
        const { mainWorkspace } = playground;
        if (mainWorkspace) {
            mainWorkspace.reDraw();
        }
        return scene;
    }

    /**
     * remove scene from this.scenes_
     * @param {!scene model} scene
     */
    removeScene(scene) {
        if (this.getScenes().length <= 1) {
            RoCode.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_delete_error, false);
            return;
        }
        RoCode.Utils.forceStopSounds();
        scene = this.getSceneById(typeof scene === 'string' ? scene : scene.id);

        this.getScenes().splice(this.getScenes().indexOf(scene), 1);
        RoCode.container
            .getSceneObjects(scene)
            .forEach((object) => RoCode.container.removeObject(object, true));
        RoCode.stage.removeObjectContainer(scene);
        $(scene.view).remove();
        this.selectScene();
        this.updateView();
    }

    selectScene(scene) {
        const targetScene = scene || this.getScenes()[0];
        const container = RoCode.container;

        container.resetSceneDuringRun();

        if (this.selectedScene && this.selectedScene.id === targetScene.id) {
            return;
        }
        if (
            RoCode.playground.getViewMode() === 'picture' &&
            RoCode.playground.nameViewFocus &&
            RoCode.playground.nameViewBlur()
        ) {
            return;
        }

        const prevSelected = this.selectedScene;
        if (prevSelected) {
            const prevSelectedView = prevSelected.view;
            prevSelectedView.removeClass('selectedScene');
            const elem = document.activeElement;
            elem === prevSelectedView.nameField && elem.blur();
        }

        this.selectedScene = targetScene;
        targetScene.view.addClass('selectedScene');

        const stage = RoCode.stage;
        const playground = RoCode.playground;

        container.setCurrentObjects();

        stage.selectObjectContainer(targetScene);

        const targetObject = container.getCurrentObjects()[0];

        if (targetObject && RoCode.type !== 'minimize') {
            container.selectObject(targetObject.id);
            playground.refreshPlayground();
        } else {
            if (RoCode.isTextMode) {
                const workspace = RoCode.getMainWS();
                const vimBoard = workspace && workspace.vimBoard;
                if (vimBoard) {
                    const sObject = vimBoard._currentObject;
                    const sScene = vimBoard._currentScene;
                    const parser = vimBoard._parser;
                    try {
                        if (targetScene.id != sScene.id) {
                            workspace._syncTextCode();
                        }
                    } catch (e) {}

                    if (parser._onError) {
                        container.selectObject(sObject.id, true);
                        return;
                    }
                }
                vimBoard && vimBoard.clearText();
            }

            stage.selectObject(null);
            playground.flushPlayground();
            RoCode.variableContainer.selected = null;
            RoCode.variableContainer.updateList();
        }
        !container.listView_ && stage.sortZorder();

        container.updateListView();
        if (RoCode.type && RoCode.type !== 'minimize' && RoCode.scene.listView_) {
            this.sceneListWidth = RoCode.scene.listView_.offsetWidth;
        }
        this.updateView();
        RoCode.requestUpdate = true;
    }

    /**
     * convert this scenes data to JSON.
     * @return {JSON}
     */
    toJSON() {
        return this.getScenes().map((scene) => _.pick(scene, ['id', 'name']));
    }

    /**
     * Move scene in this.scenes_
     * this method is for sortable
     * @param {!number} start
     * @param {!number} end
     */
    moveScene(start, end) {
        this.getScenes().splice(end, 0, this.getScenes().splice(start, 1)[0]);
        RoCode.container.updateObjectsOrder();
        RoCode.stage.sortZorder();
        this.updateSceneView();
        //style properties are not removed sometimes
        $('.RoCodeSceneElementWorkspace').removeAttr('style');
    }

    /**
     * get scene by scene id
     * @param {!String} sceneId
     * @return {scene modal}
     */
    getSceneById(id) {
        return _.find(this.getScenes(), { id }) || false;
    }

    /**
     * @return {Array<RoCode scene>}
     */
    getScenes() {
        return this.scenes_;
    }

    /**
     * remember selectedScene before start
     * in order to reset when stopped
     */
    takeStartSceneSnapshot() {
        this.sceneBeforeRun = this.selectedScene;
    }

    /**
     * select selectedScene before start
     * before run start
     */
    loadStartSceneSnapshot() {
        this.selectScene(this.sceneBeforeRun);
        this.sceneBeforeRun = null;
    }
    /**
     * create scene
     * @return {scene modal} scene
     */
    createScene(sceneId) {
        const regex = /[0-9]/;
        let name = RoCode.getOrderedName(`${Lang.Blocks.SCENE} `, this.scenes_, 'name');
        if (!regex.test(name)) {
            name += '1';
        }
        const scene = {
            name,
            id: sceneId || RoCode.generateHash(),
        };

        this.generateElement(scene);
        return scene;
    }

    /**
     * clone scene by context menu
     * @param {!scene model} scene
     */
    cloneScene(scene) {
        if (this.isMax()) {
            RoCode.toast.alert(Lang.Msgs.runtime_error, Lang.Workspace.Scene_add_error, false);
            return;
        }

        const clonedScene = {
            name: (Lang.Workspace.cloned_scene + scene.name).substring(0, 10),
            id: RoCode.generateHash(),
        };

        this.generateElement(clonedScene);
        this.addScene(clonedScene);

        const container = RoCode.container;
        const objects = container.getSceneObjects(scene);

        try {
            const oldIds = [];
            const newIds = [];
            this.isSceneCloning = true;
            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                const ret = container.addCloneObject(obj, clonedScene.id, true);
                oldIds.push(obj.id);
                newIds.push(ret.id);
            }
            container.adjustClonedValues(oldIds, newIds);
            const WS = RoCode.getMainWS();
            WS && WS.board && WS.board.reDraw();
            this.isSceneCloning = false;
            container.setCurrentObjects();
            container.updateObjectsOrder();
            container.updateListView();
            container.selectObject(newIds[newIds.length - 1]);
            RoCode.variableContainer.updateViews();
        } catch (e) {
            console.log('error', e);
        }
    }

    /**
     * resize html element by window size
     * @param {!scene model} scene
     */
    resize() {
        const scenes = this.getScenes();
        const selectedScene = this.selectedScene;
        const addButton = this.addButton_;
        const firstScene = scenes[0];

        if (scenes.length === 0 || !firstScene) {
            return;
        }

        const startPos = $(firstScene.view).offset().left;
        const marginLeft = parseFloat($(selectedScene.view).css('margin-left'));
        let totalWidth = Math.floor($(this.view_).width() - startPos - 5);
        const LEFT_MARGIN = -40;

        let normWidth = startPos + 15;
        let diff = 0;
        let isSelectedView = false;
        let selectedViewWidth = 0;
        for (var i in scenes) {
            var scene = scenes[i];
            let view = scene.view;
            view.addClass('minValue');
            isSelectedView = view === this.selectedScene.view;
            view = $(view);

            const width = parseFloat(RoCode.computeInputWidth(scene.name));
            const adjusted = (width * 10) / 9;
            if (scene === this.selectedScene) {
                diff = adjusted - width;
            }
            // $(scene.inputWrapper).width(adjusted + 'px');
            const viewWidth = view.width();
            if (isSelectedView) {
                selectedViewWidth = viewWidth;
            }
            normWidth += viewWidth + LEFT_MARGIN;
        }

        if (normWidth > totalWidth) {
            align();
        }

        function align() {
            const dummyWidth = 30.5;
            const len = scenes.length - 1;
            totalWidth =
                totalWidth -
                Math.round(selectedViewWidth || $(selectedScene.view).width()) -
                dummyWidth * len -
                diff;

            const fieldWidth = Math.floor(totalWidth / len);
            for (i in scenes) {
                scene = scenes[i];
                if (selectedScene.id != scene.id) {
                    scene.view.removeClass('minValue');
                    // $(scene.inputWrapper).width(fieldWidth);
                } else {
                    scene.view.addClass('minValue');
                }
            }
        }
    }

    getPrevScene() {
        const scenes = this.getScenes();
        return scenes[scenes.indexOf(this.selectedScene) - 1];
    }

    getNextScene() {
        const scenes = this.getScenes();
        return scenes[scenes.indexOf(this.selectedScene) + 1];
    }

    getMaxSceneCount() {
        return STATIC_SCENES_COUNT;
    }

    isMax() {
        return RoCode.scene.scenes_.length >= STATIC_SCENES_COUNT;
    }

    clear() {
        this.scenes_.forEach((s) => RoCode.stage.removeObjectContainer(s));
        this.scenes_ = [];
        this.selectedScene = null;
        this.updateView();
    }

    getDom(query) {
        let scene;
        if (query.length > 1) {
            scene = this.getSceneById(query[1]);
        }

        switch (query[0]) {
            case 'addButton':
                return this.addButton_;
            case 'removeButton':
                return scene.removeButton;
            case 'nameField':
                return scene.view.nameField;
            case 'view':
                return scene.view;
            default:
                return;
        }
    }

    destroy() {
        // 우선 interface 만 정의함.
    }
};
