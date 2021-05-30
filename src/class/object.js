/**;
 * @fileoverview Object for RoCode.
 */
'use strict';

import DomUtils from '../../src/util/domUtils';
import { GEHelper } from '../graphicEngine/GEHelper';

const _findIndex = require('lodash/findIndex');

/**
 * Class for RoCode object.
 * @param {?object model} model for object
 * @constructor
 */
RoCode.RoCodeObject = class {
    constructor(model) {
        if (model) {
            this.id = model.id;
            this.name = model.name || model.sprite.name;
            this.text = model.text || this.name;
            this.objectType = model.objectType || 'sprite';
            this.script = new RoCode.Code(model.script || [], this);
            this.pictures = RoCode.Utils.copy(model.sprite.pictures || []);
            this.sounds = RoCode.Utils.copy(model.sprite.sounds || []);

            this._setFocused = RoCode.Utils.setFocused;
            this._setBlurredTimer = RoCode.Utils.setBlurredTimer;
            this.editObjectValueWhenEnterPress = RoCode.Utils.whenEnter(() => {
                this.editObjectValues(false);
            });

            this.sounds.forEach((s) => {
                if (!s.id) {
                    s.id = RoCode.generateHash();
                }
                RoCode.initSound(s);
            });

            this.lock = model.lock ? model.lock : false;
            this.isEditing = false;

            if (this.objectType === 'sprite') {
                this.selectedPicture = !model.selectedPictureId
                    ? this.pictures[0]
                    : this.getPicture(model.selectedPictureId);
            }

            this.scene = RoCode.scene.getSceneById(model.scene) || RoCode.scene.selectedScene;

            this.setRotateMethod(model.rotateMethod);

            //entity
            this.entity = new RoCode.EntityObject(this);
            this.entity.injectModel(
                this.selectedPicture ? this.selectedPicture : null,
                model.entity ? model.entity : this.initEntity(model)
            );

            this.clonedEntities = [];

            RoCode.stage.loadObject(this);

            const pictures = this.pictures;

            for (const i in pictures) {
                const picture = pictures[i];
                picture.objectId = this.id;
                if (!picture.id) {
                    picture.id = RoCode.generateHash();
                }
                GEHelper.resManager.reqResource(null, this.scene.id, picture);
            }
            RoCode.requestUpdate = true;
        }

        this._isContextMenuEnabled = true;

        this.isFolded = false;
    }

    /**
     * View generator for workspace or others.
     * RoCode.type === 'phone' 관련 뷰 삭제
     * @return {!Element}
     */
    generateView() {
        return this.generateWorkspaceView();
    }

    /**
     * Object name setter
     * @param {!string} name
     */
    setName(name) {
        RoCode.assert(typeof name === 'string', 'object name must be string');

        this.name = name;
        if (this.nameView_) {
            this.nameView_.value = name;
        }
    }

    getName() {
        return this.name;
    }

    /**
     * Object text setter
     * @param {!string} name
     */
    setText(text) {
        RoCode.assert(typeof text === 'string', 'object text must be string');
        this.text = text;
    }

    /**
     * Object script setter
     * @param {!xml script} script
     */
    setScript(script) {
        this.script = script;
    }

    /**
     * Object script getter
     * @return {!xml script} script
     */
    getScriptText() {
        return this.script.stringify();
    }

    /**
     * Initialize entity model if not exist
     * @param {!object model} model for object
     * @return {entity model}
     */
    initEntity(model) {
        const json = {};
        json.rotation = json.x = json.y = 0;
        json.direction = 90;

        if (this.objectType == 'sprite') {
            const dimension = model.sprite.pictures[0].dimension;
            json.regX = dimension.width / 2;
            json.regY = dimension.height / 2;
            let scale;
            const mainCategory = model.sprite.category.main;
            if (mainCategory == 'background' || mainCategory == 'new') {
                scale = Math.max(270 / dimension.height, 480 / dimension.width);
            } else if (mainCategory == 'new') {
                scale = 1;
            } else {
                scale = 200 / (dimension.width + dimension.height);
            }

            json.scaleX = json.scaleY = scale;
            json.width = dimension.width;
            json.height = dimension.height;
        } else if (this.objectType == 'textBox') {
            json.regX = 25;
            json.regY = 12;
            json.scaleX = json.scaleY = 1.5;
            json.width = 50;
            json.height = 24;
            json.text = model.text;
            if (model.options) {
                const options = model.options;
                let fontStyle = '';
                const {
                    fontSize = 20,
                    textAlign = 0,
                    scaleX = 1.5,
                    regX,
                    regY,
                    width,
                    height,
                } = options;
                if (options.bold) {
                    fontStyle += 'bold ';
                }
                if (options.italic) {
                    fontStyle += 'italic ';
                }

                json.underLine = options.underLine;
                json.strike = options.strike;
                if (typeof options.font === 'string') {
                    json.font = options.font;
                } else {
                    json.font = `${fontStyle}${fontSize}px ${options.font.family}`;
                }
                json.colour = options.colour;
                json.bgColor = options.bgColor || options.background;
                json.lineBreak = options.lineBreak;
                json.textAlign = textAlign;
                json.scaleX = json.scaleY = scaleX;
                if (options.lineBreak) {
                    json.width = width || 256;
                    json.height = height || json.width * 0.5625;
                    json.regX = regX || json.width / 2;
                    json.regY = regY || json.height / 2;
                }
            } else {
                json.underLine = false;
                json.strike = false;
                json.font = '20px Nanum Gothic';
                json.colour = '#000000';
                json.bgColor = '#ffffff';
            }
        }

        return json;
    }

    /**
     * Update thumbnail view;
     */
    updateThumbnailView() {
        const thumb = this.thumbnailView_;
        const picture = this.entity.picture;
        const objectType = this.objectType;
        this.thumbUrl = '';
        if (objectType === 'sprite') {
            if (picture.fileurl) {
                this.thumbUrl = picture.fileurl;
            } else {
                const fileName = picture.filename;
                this.thumbUrl = `${RoCode.defaultPath}/uploads/${fileName.substring(
                    0,
                    2
                )}/${fileName.substring(2, 4)}/thumb/${fileName}.png`;
            }
            thumb.style.backgroundImage = `url(${encodeURI(this.thumbUrl)})`;
        } else if (objectType === 'textBox') {
            const { type } = Lang || {};
            const filename = type === 'ko' ? 'text_icon_ko.svg' : 'text_icon.svg';
            this.thumbUrl = `${RoCode.mediaFilePath}${filename}`;
            $(thumb).addClass('RoCodeObjectTextBox');
        }
    }

    /**
     * Update coordinate view;
     */
    updateCoordinateView(isForced) {
        if (!this.isSelected() && !isForced) {
            return;
        }

        const view = this.coordinateView_;
        if (view && view.xInput_ && view.yInput_) {
            const originX = view.xInput_.value;
            const originY = view.yInput_.value;
            const size = view.sizeInput_.value;
            const entity = this.entity;
            const newX = entity.getX(1);
            const newY = entity.getY(1);
            const newSize = entity.getSize(1);

            if (originX != newX) {
                view.xInput_.value = newX;
            }
            if (originY != newY) {
                view.yInput_.value = newY;
            }
            if (size != newSize) {
                view.sizeInput_.value = newSize;
            }
        }
    }

    /**
     * Update rotation view;
     */
    updateRotationView(isForced) {
        if ((!this.isSelected() || !this.view_) && !isForced) {
            return;
        }
        const rotateMethod = this.getRotateMethod();
        const entity = this.entity;
        const className = 'RoCodeRemove';

        if (rotateMethod === 'free') {
            this.rotateSpan_.removeClass(className);
            this.rotateInput_.removeClass(className);

            this.rotateInput_.value = `${entity.getRotation(1)}`;
            this.directionInput_.value = `${entity.getDirection(1)}`;
        } else {
            this.rotateSpan_.addClass(className);
            this.rotateInput_.addClass(className);
            this.directionInput_.value = `${entity.getDirection(1)}`;
        }
    }

    /**
     * Add picture object by picture model.
     * @param {picture model} picture
     */
    addPicture(picture, index) {
        picture.objectId = this.id;

        if (typeof index === 'undefined') {
            this.pictures.push(picture);
        } else {
            this.pictures.splice(index, 0, picture);
        }

        RoCode.playground.injectPicture(this);
    }

    /**
     * Remove picture object.
     * @param {string} pictureId
     * @return {boolean} return true if success
     */
    removePicture(pictureId) {
        const pictures = this.pictures;
        if (pictures.length < 2) {
            return;
        }

        const playground = RoCode.playground;
        const picture = this.getPicture(pictureId);

        pictures.splice(pictures.indexOf(picture), 1);
        if (picture === this.selectedPicture) {
            playground.selectPicture(pictures[0], true);
        }
        GEHelper.resManager.imageRemoved('EntityObject::removePicture');
        playground.injectPicture(this);
        playground.reloadPlayground();
    }

    /**
     * Get picture object by Id.
     * @param {?string} pictureId
     * @return {picture object}
     */
    getPicture(value) {
        //priority
        //1. pictureId
        //2. pictureName
        //3. index
        if (!value) {
            return this.selectedPicture;
        }

        value = `${value}`.trim();
        const pictures = this.pictures;
        const len = pictures.length;

        for (let i = 0; i < len; i++) {
            if (pictures[i].id == value) {
                return pictures[i];
            }
        }

        for (let i = 0; i < len; i++) {
            if (pictures[i].name == value) {
                return pictures[i];
            }
        }

        const checker = RoCode.parseNumber(value);
        if (!(checker === false && typeof checker === 'boolean') && len >= checker && checker > 0) {
            return pictures[checker - 1];
        }
        return null;
    }

    getPictureIndex(value) {
        return this.pictures.indexOf(this.getPicture(value));
    }

    /**
     * Get previous picture object by Id.
     * @param {?string} pictureId
     * @return {picture object}
     */
    getPrevPicture(pictureId) {
        const pictures = this.pictures;
        let idx = this.getPictureIndex(pictureId);
        return pictures[idx === 0 ? pictures.length - 1 : --idx];
    }

    /**
     * Get next picture object by Id.
     * @param {?string} pictureId
     * @return {picture object}
     */
    getNextPicture(pictureId) {
        const pictures = this.pictures;
        const len = pictures.length;
        let idx = this.getPictureIndex(pictureId);
        return pictures[idx == len - 1 ? 0 : ++idx];
    }

    /**
     * Select picture object by Id.
     * @param {!string} pictureId
     * @return {picture object}
     */
    selectPicture(pictureId) {
        const picture = this.getPicture(pictureId);
        if (!picture) {
            throw new Error(`No picture with pictureId : ${pictureId}`);
        }

        this.selectedPicture = picture;
        this.entity.setImage(picture);
        this.updateThumbnailView();
    }

    /**
     * Add sound to object
     * @param {sound model} sound
     */
    addSound(sound, index) {
        if (!sound.id) {
            sound.id = RoCode.generateHash();
        }

        RoCode.initSound(sound, index);

        if (typeof index === 'undefined') {
            this.sounds.push(sound);
        } else {
            this.sounds.splice(index, 0, sound);
        }
        RoCode.playground.injectSound();
    }

    /**
     * Remove sound object.
     * @param {string} soundId
     */
    removeSound(soundId) {
        const index = _findIndex(this.sounds, (sound) => sound.id === soundId);
        this.sounds.splice(index, 1);
        RoCode.playground.reloadPlayground();
        RoCode.playground.injectSound();
    }

    /**
     * rotate method getter
     * @return {string}
     */
    getRotateMethod() {
        if (!this.rotateMethod) {
            this.rotateMethod = 'free';
        }

        return this.rotateMethod;
    }

    /**
     * rotate method setter
     * @param {string} rotateMethod
     */
    setRotateMethod(rotateMethod = 'free') {
        /** @type {string} */
        this.rotateMethod = rotateMethod;
        this.updateRotateMethodView();

        const stage = RoCode.stage;
        const entity = stage.selectedObject && stage.selectedObject.entity;

        if (entity) {
            stage.updateObject();
            stage.updateHandle();
        }
    }

    initRotateValue(rotateMethod) {
        if (this.rotateMethod === rotateMethod) {
            return;
        }

        const entity = this.entity;
        const direction = entity.direction;
        entity.direction = direction !== undefined ? direction : 90.0;
        entity.rotation = 0.0;
        entity.flip = false;
    }

    updateRotateMethodView() {
        if (!this.rotateModeAView_) {
            return;
        }

        const SELECTED = 'selected';

        this.rotateModeAView_.removeClass(SELECTED);
        this.rotateModeBView_.removeClass(SELECTED);
        this.rotateModeCView_.removeClass(SELECTED);

        const rotateMethod = this.rotateMethod;
        if (rotateMethod === 'free') {
            this.rotateModeAView_.addClass(SELECTED);
        } else if (rotateMethod === 'vertical') {
            this.rotateModeBView_.addClass(SELECTED);
        } else {
            this.rotateModeCView_.addClass(SELECTED);
        }

        this.updateRotationView();
    }

    /**
     * Add clone entity for clone block
     * If parameter given, this clone the parameter entity itself.
     * Otherwise, this clone this object's entity.
     * @param {?RoCode.RoCodeObject} object
     * @param {?RoCode.EntityObject} entity
     * @param {?xml block} script
     */
    addCloneEntity(object, entity, script) {
        if (this.clonedEntities.length > RoCode.maxCloneLimit) {
            return;
        }

        const clonedEntity = new RoCode.EntityObject(this);
        clonedEntity.isClone = true;

        entity = entity || this.entity;

        clonedEntity.injectModel(entity.picture || null, entity.toJSON());
        clonedEntity.snapshot_ = entity.snapshot_;

        if (entity.effect) {
            clonedEntity.effect = _.clone(entity.effect);
            clonedEntity.applyFilter();
        }

        RoCode.engine.raiseEventOnEntity(clonedEntity, [clonedEntity, 'when_clone_start']);

        clonedEntity.isStarted = true;
        this.addCloneVariables(
            this,
            clonedEntity,
            entity ? entity.variables : null,
            entity ? entity.lists : null
        );

        this.clonedEntities.push(clonedEntity);
        let targetIndex = RoCode.stage.selectedObjectContainer.getChildIndex(entity.object);
        targetIndex -= (entity.shapes.length ? 1 : 0) + entity.stamps.length;
        RoCode.stage.loadEntity(clonedEntity, targetIndex);

        if (entity.brush) {
            RoCode.setCloneBrush(clonedEntity, entity.brush);
        }
    }

    /**
     * return true when object is selected
     * @return {Boolean}
     */
    isSelected() {
        return this.isSelected_;
    }

    /**
     * convert this object's data to JSON.
     * @return {JSON}
     */
    toJSON(isClone) {
        const json = {};
        json.id = isClone ? RoCode.generateHash() : this.id;
        json.name = this.name;
        json.script = this.getScriptText();
        json.objectType = this.objectType;
        json.rotateMethod = this.getRotateMethod();
        json.scene = this.scene.id;
        json.sprite = {
            pictures: RoCode.getPicturesJSON(this.pictures, isClone),
            sounds: RoCode.getSoundsJSON(this.sounds, isClone),
        };
        if (this.objectType === 'textBox') {
            json.text = this.text;
        } else {
            json.selectedPictureId =
                json.sprite.pictures[this.pictures.indexOf(this.selectedPicture)].id;
        }
        json.lock = this.lock;
        json.entity = this.entity.toJSON();
        return json;
    }

    /**
     * destroy this object
     */
    destroy() {
        this.entity && this.entity.destroy();
        RoCode.removeElement(this.view_);
    }

    /**
     * Get sound object by Id.
     * @param {?string} soundId
     * @return {sound object}
     */
    getSound(value) {
        //priority
        //1. soundId
        //2. soundName
        //3. index
        value = String(value).trim();
        const sounds = this.sounds;
        const len = sounds.length;

        for (let i = 0; i < len; i++) {
            if (sounds[i].id == value) {
                return sounds[i];
            }
        }

        for (let i = 0; i < len; i++) {
            if (sounds[i].name == value) {
                return sounds[i];
            }
        }

        const checker = RoCode.parseNumber(value);
        if (!(checker === false && typeof checker === 'boolean') && len >= checker && checker > 0) {
            return sounds[checker - 1];
        }

        return null;
    }

    addCloneVariables({ id }, entity, variables, lists) {
        const _whereFunc = _.partial(_.filter, _, { object_: id });
        const _cloneFunc = (v) => v.clone();
        const { variables_, lists_ } = RoCode.variableContainer;

        entity.variables = (variables || _whereFunc(variables_)).map(_cloneFunc);
        entity.lists = (lists || _whereFunc(lists_)).map(_cloneFunc);
    }

    getLock() {
        return this.lock;
    }

    setLock(bool) {
        this.lock = bool;
        RoCode.stage.updateObject();
        return bool;
    }

    updateInputViews(isLocked) {
        isLocked = isLocked || this.getLock();
        const inputs = [
            this.nameView_,
            this.coordinateView_.xInput_,
            this.coordinateView_.yInput_,
            this.rotateInput_,
            this.directionInput_,
            this.coordinateView_.sizeInput_,
        ];

        if (isLocked) {
            inputs.forEach((input) => {
                input.setAttribute('disabled', 'disabled');
            });
        } else {
            inputs.forEach((input) => {
                input.removeAttribute('disabled');
            });
        }

        this.isEditing = !isLocked;
    }

    editObjectValues(activate) {
        const inputs = [
            this.nameView_,
            this.coordinateView_.xInput_,
            this.coordinateView_.yInput_,
            this.rotateInput_,
            this.directionInput_,
            this.coordinateView_.sizeInput_,
        ];

        if (activate && !this.isEditing) {
            this.isEditing = true;
        } else {
            inputs.forEach((input) => {
                input.blur(true);
            });

            this.isEditing = false;
        }
    }

    /**
     *  get only clonedEntities among clonedEntities except for stamp entity
     *  @return {Array<clone Entity> } entities
     */
    getClonedEntities() {
        return this.clonedEntities.concat();
    }

    clearExecutor() {
        this.script.clearExecutors();

        const clonedEntities = this.clonedEntities;
        for (let j = clonedEntities.length - 1; j >= 0; j--) {
            clonedEntities[j].removeClone(true);
        }
        this.entity.removeStamps();
    }

    _rightClick(e) {
        if (!this.isContextMenuEnabled()) {
            return;
        }
        e.stopPropagation();

        const { options = {} } = RoCode;
        const { backpackDisable } = options;
        const object = this;
        const container = RoCode.container;
        const contextMenus = [
            {
                text: Lang.Workspace.context_duplicate,
                enable: !RoCode.engine.isState('run'),
                callback() {
                    container.addCloneObject(object);
                },
            },
            {
                text: Lang.Workspace.context_remove,
                enable: !RoCode.engine.isState('run') && !this.getLock(),
                callback: () => {
                    if (this.getLock()) {
                        return true;
                    }
                    RoCode.dispatchEvent('removeObject', object);
                    const { id } = object;
                    RoCode.do('removeObject', id);
                    RoCode.Utils.forceStopSounds();
                },
            },
            {
                text: Lang.Workspace.copy_file,
                callback() {
                    container.setCopiedObject(object);
                },
            },
            {
                text: Lang.Blocks.Paste_blocks,
                enable: !RoCode.engine.isState('run') && !!container.copiedObject,
                callback() {
                    const container = RoCode.container;
                    if (container.copiedObject) {
                        container.addCloneObject(container.copiedObject);
                    } else {
                        RoCode.toast.alert(
                            Lang.Workspace.add_object_alert,
                            Lang.Workspace.object_not_found_for_paste
                        );
                    }
                },
            },
        ];

        if (!backpackDisable) {
            contextMenus.push({
                text: Lang.Blocks.add_my_storage,
                enable: !RoCode.engine.isState('run') && !!window.user,
                callback: () => {
                    this.addStorage();
                },
            });
        }

        contextMenus.push({
            text: Lang.Blocks.export_object,
            callback() {
                RoCode.dispatchEvent('exportObject', object);
            },
        });

        const { clientX: x, clientY: y } = RoCode.Utils.convertMouseEvent(e);
        RoCode.ContextMenu.show(contextMenus, 'workspace-contextmenu', { x, y });
    }

    addStorage() {
        RoCode.dispatchEvent('addStorage', {
            type: 'object',
            data: this,
        });
    }

    enableContextMenu() {
        this._isContextMenuEnabled = true;
    }

    disableContextMenu() {
        this._isContextMenuEnabled = false;
    }

    isContextMenuEnabled() {
        return this._isContextMenuEnabled && RoCode.objectEditable;
    }

    toggleEditObject() {
        if (this.isEditing || RoCode.engine.isState('run')) {
            return;
        }

        this.editObjectValues(true);
        if (RoCode.playground.object !== this) {
            RoCode.container.selectObject(this.id);
        }
    }

    getDom(query) {
        if (_.isEmpty(query)) {
            return this.view_;
        }

        switch (query.shift()) {
            case 'editButton':
                return this.editView_;
            case 'nameInput':
                return this.nameView_;
            case 'removeButton':
                return this.deleteView_;
            case 'xInput':
                return this.coordinateView_.xInput_;
            case 'yInput':
                return this.coordinateView_.yInput_;
            case 'sizeInput':
                return this.coordinateView_.sizeInput_;
            case 'directionInput':
                return this.directionInput_;
            case 'rotationInput':
                return this.rotateInput_;
            case 'rotationMethod':
                return this._getRotateView(query.shift());
        }
    }

    setInputBlurred(...target) {
        target = this.getDom(target);
        if (!target) {
            return;
        }
        target._focused = false;
    }

    generateWorkspaceView() {
        const exceptionsForMouseDown = [];

        const that = this;
        const objectId = this.id;

        this.view_ = this.createObjectView(objectId, exceptionsForMouseDown); // container
        if (!RoCode.objectEditable) {
            this.view_.addClass('RoCodeDisabled');
        }
        this.view_.appendChild(this.createObjectInfoView()); // visible, lock

        const thumbnailView = this.createThumbnailView(objectId); // thumbnail
        this.thumbnailView_ = thumbnailView;
        this.view_.appendChild(thumbnailView);

        this.view_.appendChild(this.createWrapperView()); // name space

        const deleteView = this.createDeleteView(exceptionsForMouseDown, that); // delete
        this.deleteView_ = deleteView;
        this.view_.appendChild(deleteView);

        const rotationWrapperView = this.createRotationWrapperView();
        this.view_.appendChild(rotationWrapperView);

        this.updateThumbnailView();
        this.updateRotateMethodView();
        this.updateInputViews();

        this.updateCoordinateView(true);
        this.updateRotationView(true);

        return this.view_;
    }

    createRotationMethodWrapperView() {
        const rotationMethodWrapper = RoCode.createElement('div').addClass('rotationMethodWrapper');

        const rotateMethodLabelView = RoCode.createElement('span').addClass(
            'RoCodeObjectRotateMethodLabelWorkspace'
        );
        rotationMethodWrapper.appendChild(rotateMethodLabelView);
        rotateMethodLabelView.innerHTML = `${Lang.Workspace.rotate_method}`;

        const rotateModeAView = RoCode.createElement('div').addClass(
            'RoCodeObjectRotateModeWorkspace RoCodeObjectRotateModeAWorkspace'
        );
        this.rotateModeAView_ = rotateModeAView;
        rotationMethodWrapper.appendChild(rotateModeAView);
        rotationMethodWrapper.appendChild(rotateModeAView);
        rotateModeAView.bindOnClick(
            this._whenRotateEditable(() => {
                RoCode.do('objectUpdateRotateMethod', this.id, 'free');
            }, this)
        );

        const rotateModeBView = RoCode.createElement('div').addClass(
            'RoCodeObjectRotateModeWorkspace RoCodeObjectRotateModeBWorkspace'
        );
        this.rotateModeBView_ = rotateModeBView;
        rotationMethodWrapper.appendChild(rotateModeBView);
        rotateModeBView.bindOnClick(
            this._whenRotateEditable(() => {
                RoCode.do('objectUpdateRotateMethod', this.id, 'vertical');
            }, this)
        );

        const rotateModeCView = RoCode.createElement('div').addClass(
            'RoCodeObjectRotateModeWorkspace RoCodeObjectRotateModeCWorkspace'
        );
        this.rotateModeCView_ = rotateModeCView;
        rotationMethodWrapper.appendChild(rotateModeCView);
        rotateModeCView.bindOnClick(
            this._whenRotateEditable(() => {
                RoCode.do('objectUpdateRotateMethod', this.id, 'none');
            }, this)
        );

        return rotationMethodWrapper;
    }

    createRotateLabelWrapperView() {
        const rotateLabelWrapperView = RoCode.createElement('div').addClass(
            'RoCodeObjectRotateLabelWrapperWorkspace'
        );

        const rotateSpan = RoCode.createElement('span').addClass('RoCodeObjectRotateSpanWorkspace');
        rotateSpan.innerHTML = `${Lang.Workspace.rotation}`;
        const rotateInput = RoCode.createElement('input').addClass(
            'RoCodeObjectRotateInputWorkspace'
        );
        rotateInput.setAttribute('type', 'number');
        rotateInput.onkeypress = this.editObjectValueWhenEnterPress;
        rotateInput.onfocus = this._setFocused;
        rotateInput.onblur = this._setBlurredTimer(() => {
            const object = RoCode.container.getObject(this.id);
            if (!object) {
                return;
            }
            let value = rotateInput.value;
            const idx = value.indexOf('˚');
            if (~idx) {
                value = value.substring(0, idx);
            }

            RoCode.do(
                'objectUpdateRotationValue',
                this.id,
                RoCode.Utils.isNumber(value) ? value : this.entity.getRotation()
            );
        });

        this.rotateSpan_ = rotateSpan;
        this.rotateInput_ = rotateInput;

        const directionSpan = RoCode.createElement('span').addClass(
            'RoCodeObjectDirectionSpanWorkspace'
        );
        directionSpan.innerHTML = `${Lang.Workspace.direction}`;
        const directionInput = RoCode.createElement('input').addClass(
            'RoCodeObjectDirectionInputWorkspace'
        );
        directionInput.setAttribute('type', 'number');
        directionInput.onkeypress = this.editObjectValueWhenEnterPress;
        directionInput.onfocus = this._setFocused;
        directionInput.onblur = this._setBlurredTimer(() => {
            const object = RoCode.container.getObject(this.id);
            if (!object) {
                return;
            }
            let value = directionInput.value;
            const idx = value.indexOf('˚');
            if (~idx) {
                value = value.substring(0, idx);
            }

            RoCode.do(
                'objectUpdateDirectionValue',
                this.id,
                RoCode.Utils.isNumber(value) ? value : this.entity.getDirection()
            );
        });

        this.directionInput_ = directionInput;
        rotateLabelWrapperView.appendChild(rotateSpan);
        rotateLabelWrapperView.appendChild(rotateInput);
        rotateLabelWrapperView.appendChild(directionSpan);
        rotateLabelWrapperView.appendChild(directionInput);
        rotateLabelWrapperView.rotateInput_ = rotateInput;
        rotateLabelWrapperView.directionInput_ = directionInput;

        return rotateLabelWrapperView;
    }

    createCoordinationView() {
        const coordinationView = RoCode.createElement('span').addClass(
            'RoCodeObjectCoordinateWorkspace'
        );

        const xCoordi = RoCode.createElement('span').addClass('RoCodeObjectCoordinateSpanWorkspace');
        xCoordi.innerHTML = 'X';
        const xInput = RoCode.createElement('input').addClass('RoCodeObjectCoordinateInputWorkspace');
        xInput.setAttribute('type', 'number');
        xInput.onkeypress = this.editObjectValueWhenEnterPress;
        xInput.onfocus = this._setFocused;
        xInput.onblur = this._setBlurredTimer(() => {
            const object = RoCode.container.getObject(this.id);
            if (!object) {
                return;
            }

            const value = xInput.value;
            RoCode.do(
                'objectUpdatePosX',
                this.id,
                RoCode.Utils.isNumber(value) ? value : this.entity.getX()
            );
        });

        const yCoordi = RoCode.createElement('span').addClass('RoCodeObjectCoordinateSpanWorkspace');
        yCoordi.innerHTML = 'Y';
        const yInput = RoCode.createElement('input').addClass(
            'RoCodeObjectCoordinateInputWorkspace RoCodeObjectCoordinateInputWorkspace_right'
        );
        yInput.setAttribute('type', 'number');
        yInput.onkeypress = this.editObjectValueWhenEnterPress;
        yInput.onfocus = this._setFocused;
        yInput.onblur = this._setBlurredTimer(() => {
            const object = RoCode.container.getObject(this.id);
            if (!object) {
                return;
            }
            const value = yInput.value;
            RoCode.do(
                'objectUpdatePosY',
                this.id,
                RoCode.Utils.isNumber(value) ? value : this.entity.getY()
            );
        });

        const sizeSpan = RoCode.createElement('span').addClass('RoCodeObjectCoordinateSizeWorkspace');
        sizeSpan.innerHTML = `${Lang.Workspace.Size}`;
        const sizeInput = RoCode.createElement('input').addClass(
            'RoCodeObjectCoordinateInputWorkspace',
            'RoCodeObjectCoordinateInputWorkspace_size'
        );
        sizeInput.setAttribute('type', 'number');
        sizeInput.onkeypress = this.editObjectValueWhenEnterPress;
        sizeInput.onfocus = this._setFocused;
        sizeInput.onblur = this._setBlurredTimer(() => {
            const object = RoCode.container.getObject(this.id);
            if (!object) {
                return;
            }
            const value = sizeInput.value;
            RoCode.do(
                'objectUpdateSize',
                this.id,
                RoCode.Utils.isNumber(value) ? value : this.entity.getSize()
            );
        });

        coordinationView.appendChild(xCoordi);
        coordinationView.appendChild(xInput);
        coordinationView.appendChild(yCoordi);
        coordinationView.appendChild(yInput);
        coordinationView.appendChild(sizeSpan);
        coordinationView.appendChild(sizeInput);
        coordinationView.xInput_ = xInput;
        coordinationView.yInput_ = yInput;
        coordinationView.sizeInput_ = sizeInput;

        return coordinationView;
    }

    createRotationWrapperView() {
        const rotationWrapperView = RoCode.createElement('div').addClass(
            'RoCodeObjectRotationWrapperWorkspace'
        );

        const coordinationView = this.createCoordinationView();
        this.coordinateView_ = coordinationView;
        rotationWrapperView.appendChild(coordinationView);

        const rotateLabelWrapperView = this.createRotateLabelWrapperView();
        rotationWrapperView.appendChild(rotateLabelWrapperView);

        const rotationMethodWrapperView = this.createRotationMethodWrapperView();
        rotationWrapperView.appendChild(rotationMethodWrapperView);
        this.rotationMethodWrapper_ = rotationMethodWrapperView;

        return rotationWrapperView;
    }

    setObjectFold(isFold, isPass) {
        const $view = $(this.view_);
        if (isFold) {
            $view.addClass('fold');
        } else {
            $view.removeClass('fold');
        }
        if (!isPass) {
            this.isFolded = isFold;
        }
    }

    resetObjectFold() {
        this.setObjectFold(this.isFolded);
    }

    createInformationView() {
        const informationView = RoCode.createElement('div').addClass(
            'RoCodeObjectInformationWorkspace'
        );
        informationView.bindOnClick(() => {
            const $view = $(this.view_);
            if ($view.hasClass('selectedObject')) {
                this.setObjectFold(!this.isFolded);
            }
        });
        return informationView;
    }

    createDeleteView(exceptionsForMouseDown) {
        const deleteView = RoCode.createElement('div').addClass('RoCodeObjectDeleteWorkspace');
        exceptionsForMouseDown.push(deleteView);
        if (RoCode.objectEditable && RoCode.objectDeletable) {
            deleteView.bindOnClick((e) => {
                e.stopPropagation();
                if (this.getLock() || RoCode.engine.isState('run')) {
                    return;
                }
                RoCode.do('removeObject', this.id);
            });
        }
        return deleteView;
    }

    createNameView() {
        const nameView = RoCode.createElement('input').addClass('RoCodeObjectNameWorkspace');
        nameView.addEventListener('click', (e) => {
            if (!_.includes(this.view_.classList, 'selectedObject')) {
                e.preventDefault();
            }
        });

        const onKeyPressed = RoCode.Utils.whenEnter(() => {
            this.editObjectValues(false);
        });

        nameView.onkeypress = onKeyPressed;

        nameView.onfocus = RoCode.Utils.setFocused;

        const nameViewBlur = this._setBlurredTimer(() => {
            const object = RoCode.container.getObject(this.id);
            if (!object) {
                return;
            } else if (nameView.value.trim() === '') {
                return RoCodelms.alert(Lang.Workspace.enter_the_name).on('hide', () => {
                    nameView.focus();
                });
            }
            RoCode.do('objectNameEdit', this.id, nameView.value);
        });

        RoCode.attachEventListener(nameView, 'blur', nameViewBlur);
        nameView.value = this.name;
        return nameView;
    }

    createWrapperView() {
        const wrapperView = RoCode.createElement('div').addClass('RoCodeObjectWrapperWorkspace');

        const nameView = this.createNameView();
        wrapperView.appendChild(nameView);
        this.nameView_ = nameView;

        const informationView = this.createInformationView();
        wrapperView.appendChild(informationView);
        this.informationView_ = informationView;

        return wrapperView;
    }

    createThumbnailView(objectId) {
        const thumbnail = RoCode.createElement('div').addClass('RoCodeObjectThumbnailWorkspace');

        DomUtils.addEventListenerMultiple(thumbnail, 'mousedown touchstart', (e) => {
            RoCode.do('containerSelectObject', objectId);
        });

        thumbnail.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        return thumbnail;
    }

    createObjectInfoView() {
        const objectInfoView = RoCode.createElement('ul').addClass('objectInfoView');
        const objectInfoVisible = RoCode.createElement('li').addClass('objectInfo_visible');
        if (!this.entity.getVisible()) {
            objectInfoVisible.addClass('objectInfo_unvisible');
        }

        const objectInfoLock = RoCode.createElement('li').addClass('objectInfo_unlock');
        if (this.getLock()) {
            objectInfoLock.addClass('objectInfo_lock');
        }

        if (RoCode.objectEditable) {
            objectInfoVisible.bindOnClick(() => {
                if (RoCode.engine.isState('run')) {
                    return;
                }

                const entity = this.entity;
                const visible = entity.setVisible(!entity.getVisible());
                if (visible) {
                    objectInfoVisible.removeClass('objectInfo_unvisible');
                } else {
                    objectInfoVisible.addClass('objectInfo_unvisible');
                }
            });

            objectInfoLock.bindOnClick(() => {
                if (RoCode.engine.isState('run')) {
                    return;
                }

                if (this.setLock(!this.getLock())) {
                    objectInfoLock.addClass('objectInfo_lock');
                } else {
                    objectInfoLock.removeClass('objectInfo_lock');
                }

                this.updateInputViews(this.getLock());
            });
        }

        objectInfoView.appendChild(objectInfoVisible);
        objectInfoView.appendChild(objectInfoLock);
        return objectInfoView;
    }

    createObjectView(objectId, exceptionsForMouseDown) {
        const objectView = RoCode.createElement('li', objectId).addClass(
            'RoCodeContainerListElementWorkspace'
        );

        $(objectView).on('dragstart', (e) => {
            // e.originalEvent.dataTransfer.setDragImage(canvas, 25, 25);
            e.originalEvent.dataTransfer.setData('text', objectId);
        });
        const fragment = document.createDocumentFragment();
        fragment.appendChild(objectView);
        // generate context menu
        RoCode.Utils.disableContextmenu(objectView);

        objectView.addEventListener('click', (e) => {
            const isFirstClick = !_.includes(this.view_.classList, 'selectedObject');
            if (isFirstClick && RoCode.isMobile()) {
                e.preventDefault();
                document.activeElement.blur();
            }

            if (
                RoCode.container.getObject(objectId) &&
                !_.includes(exceptionsForMouseDown, e.target)
            ) {
                RoCode.do('selectObject', objectId);
            }
        });

        const longPressEvent = (e) => {
            const doc = $(document);
            const touchEvent = RoCode.Utils.convertMouseEvent(e);
            const mouseDownCoordinate = { x: touchEvent.clientX, y: touchEvent.clientY };
            let longPressTimer = null;

            longPressTimer = setTimeout(() => {
                if (longPressTimer) {
                    longPressTimer = null;
                    this._rightClick(e);
                }
            }, 1000);

            doc.bind('mousemove.object touchmove.object', (e) => {
                const touchEvent = RoCode.Utils.convertMouseEvent(e);

                const diff = Math.sqrt(
                    Math.pow(touchEvent.pageX - mouseDownCoordinate.x, 2) +
                        Math.pow(touchEvent.pageY - mouseDownCoordinate.y, 2)
                );

                if (diff > 5 && longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
            doc.bind('mouseup.object touchend.object', (e) => {
                e.stopPropagation();
                doc.unbind('.object');
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
        };

        objectView.addEventListener('mousedown', (e) => {
            if (RoCode.Utils.isRightButton(e)) {
                e.stopPropagation();
                this._rightClick(e);
            }

            if (RoCode.isMobile()) {
                e.stopPropagation();
                longPressEvent(e);
            }
        });

        objectView.addEventListener('touchstart', (e) => {
            e.eventFromRoCodeObject = true;
            RoCode.documentMousedown.notify(e);
            longPressEvent(e);
        });

        return objectView;
    }

    _getRotateView(type = 'free') {
        if (type === 'free') {
            return this.rotateModeAView_;
        } else if (type === 'none') {
            return this.rotateModeCView_;
        } else {
            return this.rotateModeBView_;
        }
    }

    getIndex() {
        return RoCode.container.getObjectIndex(this.id);
    }

    _whenRotateEditable(func, obj) {
        return RoCode.Utils.when(() => !(RoCode.engine.isState('run') || obj.getLock()), func);
    }
};
