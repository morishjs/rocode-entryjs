/*
 *
 */
'use strict';

const { returnEmptyArr, createTooltip } = require('../command_util');
import VideoUtils from '../../util/videoUtils';

(function(c) {
    const COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.selectObject] = {
        do(objectId) {
            return RoCode.container.selectObject(objectId);
        },
        state(objectId) {
            const playground = RoCode.playground;
            if (playground && playground.object) {
                return [playground.object.id];
            }
        },
        log(objectId) {
            return [objectId];
        },
        undo: 'selectObject',
    };

    c[COMMAND_TYPES.objectEditButtonClick] = {
        do(objectId) {
            RoCode.container.getObject(objectId).toggleEditObject();
        },
        state(objectId) {
            return [];
        },
        log(objectId) {
            return [
                ['objectId', objectId],
                ['objectIndex', RoCode.container.getObjectIndex(objectId)],
            ];
        },
        skipUndoStack: true,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['container', 'objectIndex', '&1', 'editButton'],
        undo: 'selectObject',
    };

    c[COMMAND_TYPES.objectAddPicture] = {
        do(objectId, picture, isSelect = true) {
            const hashId = c[COMMAND_TYPES.objectAddPicture].hashId;
            if (hashId) {
                picture.id = hashId;
                delete c[COMMAND_TYPES.objectAddPicture].hashId;
            }
            RoCode.container.getObject(objectId).addPicture(picture);
            RoCode.playground.injectPicture(isSelect);
            isSelect && RoCode.playground.selectPicture(picture);
            RoCode.dispatchEvent('dismissModal');
        },
        state(objectId, picture) {
            return [objectId, picture];
        },
        log(objectId, picture) {
            const o = {};
            o._id = picture._id;
            o.id = picture.id;
            o.dimension = picture.dimension;
            o.filename = picture.filename;
            o.fileurl = picture.fileurl;
            o.name = picture.name;
            o.scale = picture.scale;
            return [
                ['objectId', objectId],
                ['picture', o],
            ];
        },
        dom: ['.btn_confirm_modal'],
        restrict(data, domQuery, callback) {
            this.hashId = data.content[2][1].id;

            const tooltip = new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: '.btn_confirm_modal',
                    },
                ],
                {
                    restrict: true,
                    dimmed: true,
                    render: false,
                    callBack: callback,
                }
            );

            const event = RoCode.getMainWS().widgetUpdateEvent;

            if (!data.skip) {
                RoCode.dispatchEvent(
                    'openPictureManager',
                    data.content[2][1]._id,
                    event.notify.bind(event)
                );
            }

            return tooltip;
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectRemovePicture',
    };

    c[COMMAND_TYPES.objectRemovePicture] = {
        do(objectId, picture) {
            RoCode.container.getObject(objectId).removePicture(picture.id);
        },
        state(objectId, picture) {
            return [objectId, picture];
        },
        log(objectId, picture) {
            return [
                ['objectId', objectId],
                ['pictureId', picture._id],
            ];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectAddPicture',
    };

    c[COMMAND_TYPES.objectAddSound] = {
        do(objectId, sound) {
            const hashId = c[COMMAND_TYPES.objectAddSound].hashId;
            if (hashId) {
                sound.id = hashId;
                delete c[COMMAND_TYPES.objectAddSound].hashId;
            }
            RoCode.container.getObject(objectId).addSound(sound);
            RoCode.dispatchEvent('dismissModal');
        },
        state(objectId, sound) {
            return [objectId, sound];
        },
        log(objectId, sound) {
            const o = {};
            o._id = sound._id;
            o.duration = sound.duration;
            o.ext = sound.ext;
            o.id = sound.id;
            o.filename = sound.filename;
            o.fileurl = sound.fileurl;
            o.name = sound.name;
            return [
                ['objectId', objectId],
                ['sound', o],
            ];
        },
        dom: ['.btn_confirm_modal'],
        restrict(data, domQuery, callback) {
            this.hashId = data.content[2][1].id;

            const tooltip = new RoCode.Tooltip(
                [
                    {
                        title: data.tooltip.title,
                        content: data.tooltip.content,
                        target: '.btn_confirm_modal',
                    },
                ],
                {
                    callBack: callback,
                    dimmed: true,
                    restrict: true,
                    render: false,
                }
            );

            const event = RoCode.getMainWS().widgetUpdateEvent;

            if (!data.skip) {
                RoCode.dispatchEvent(
                    'openSoundManager',
                    data.content[2][1]._id,
                    event.notify.bind(event)
                );
            }
            return tooltip;
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectRemoveSound',
    };

    c[COMMAND_TYPES.objectRemoveSound] = {
        do(objectId, sound) {
            return RoCode.container.getObject(objectId).removeSound(sound.id);
        },
        state(objectId, sound) {
            return [objectId, sound];
        },
        log(objectId, sound) {
            return [
                ['objectId', objectId],
                ['soundId', sound._id],
            ];
        },
        dom: ['.btn_confirm_modal'],
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        validate: false,
        undo: 'objectAddSound',
    };

    c[COMMAND_TYPES.objectAddExpansionBlocks] = {
        do(blockNames) {
            blockNames.forEach((blockName) => {
                if (
                    typeof RoCode.EXPANSION_BLOCK !== 'undefined' &&
                    typeof RoCode.EXPANSION_BLOCK[blockName] !== 'undefined'
                ) {
                    RoCode.EXPANSION_BLOCK[blockName].init();
                    if (typeof RoCode.expansionBlocks == 'undefined') {
                        RoCode.expansionBlocks = [];
                    }
                    RoCode.expansionBlocks = _.union(RoCode.expansionBlocks, [blockName]);
                }
                RoCode.playground.blockMenu.unbanClass(blockName);
            });
            // RoCode.dispatchEvent('dismissModal');
        },
        state(blockNames) {
            return [blockNames];
        },
        log(blockNames) {
            return [['blockName', blockNames]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectRemoveExpansionBlocks',
    };

    c[COMMAND_TYPES.objectRemoveExpansionBlocks] = {
        do(blockNames) {
            // 사용된 블록 전체에서 검색가능해질때 사용가능.
            blockNames.forEach((blockName) => {
                RoCode.playground.blockMenu.banClass(blockName);
            });
            RoCode.expansionBlocks = _.pullAll(RoCode.expansionBlocks, blockNames);
        },
        state(blockNames) {
            return [blockNames];
        },
        log(blockNames) {
            return [['blockName', blockNames]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectAddExpansionBlocks',
    };
    c[COMMAND_TYPES.objectAddAIUtilizeBlocks] = {
        do(blockNames) {
            blockNames.forEach((blockName) => {
                if (
                    typeof RoCode.AI_UTILIZE_BLOCK !== 'undefined' &&
                    typeof RoCode.AI_UTILIZE_BLOCK[blockName] !== 'undefined'
                ) {
                    RoCode.AI_UTILIZE_BLOCK[blockName].init();
                    if (typeof RoCode.aiUtilizeBlocks == 'undefined') {
                        RoCode.aiUtilizeBlocks = [];
                    }
                    RoCode.aiUtilizeBlocks = _.union(RoCode.aiUtilizeBlocks, [blockName]);
                }
                RoCode.playground.blockMenu.unbanClass(blockName);
            });
            // RoCode.dispatchEvent('dismissModal');
        },
        state(blockName) {
            return [blockName];
        },
        log(blockName) {
            return [['blockName', blockName]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectRemoveAIUtilizeBlocks',
    };

    c[COMMAND_TYPES.objectRemoveAIUtilizeBlocks] = {
        do(blockNames) {
            // 사용된 블록 전체에서 검색가능해질때 사용가능.
            // RoCode.expansionBlocks = _.pull(RoCode.expansionBlocks, blockName);
            // 사용된 블록 전체에서 검색가능해질때 사용가능.
            blockNames.forEach((blockName) => {
                if (blockName === 'video') {
                    VideoUtils.destroy();
                }
                RoCode.playground.blockMenu.banClass(blockName);
            });
            RoCode.aiUtilizeBlocks = _.pullAll(RoCode.aiUtilizeBlocks, blockNames);
        },
        state(blockName) {
            return [blockName];
        },
        log(blockName) {
            return [['blockName', blockName]];
        },
        dom: ['.btn_confirm_modal'],
        recordable: RoCode.STATIC.RECORDABLE.SKIP,
        validate: false,
        undo: 'objectAddAIUtilizeBlocks',
    };

    c[COMMAND_TYPES.objectNameEdit] = {
        do(objectId, newName) {
            const object = RoCode.container.getObject(objectId);
            object.setName(newName);
            object.setInputBlurred('nameInput');
            RoCode.playground.reloadPlayground();
        },
        state(objectId, newName) {
            const object = RoCode.container.getObject(objectId);
            return [objectId, object.getName()];
        },
        log(objectId, newName) {
            const object = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newName', newName],
            ];
        },
        dom: ['container', 'objectId', '&0', 'nameInput'],
        restrict: _inputRestrictor,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectNameEdit',
    };

    c[COMMAND_TYPES.objectReorder] = {
        do(newIndex, oldIndex) {
            RoCode.container.moveElement(newIndex, oldIndex);
        },
        state(newIndex, oldIndex) {
            return [oldIndex, newIndex];
        },
        log(newIndex, oldIndex) {
            return [
                ['newIndex', newIndex],
                ['oldIndex', oldIndex],
            ];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectReorder',
    };

    c[COMMAND_TYPES.objectUpdatePosX] = {
        do(objectId, newX = 0) {
            const object = RoCode.container.getObject(objectId);
            object.entity.setX(Number(newX));
            object.updateCoordinateView();
            object.setInputBlurred('xInput');
            RoCode.stage.updateObject();
        },
        state(objectId, newX) {
            const { entity } = RoCode.container.getObject(objectId);
            return [objectId, entity.getX()];
        },
        log(objectId, newX) {
            const { entity } = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newX', newX],
            ];
        },
        dom: ['container', 'objectId', '&0', 'xInput'],
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict: _inputRestrictor,
        undo: 'objectUpdatePosX',
    };

    c[COMMAND_TYPES.objectUpdatePosY] = {
        do(objectId, newY = 0) {
            const object = RoCode.container.getObject(objectId);
            object.entity.setY(Number(newY));
            object.updateCoordinateView();
            object.setInputBlurred('yInput');
            RoCode.stage.updateObject();
        },
        state(objectId, newY) {
            const { entity } = RoCode.container.getObject(objectId);
            return [objectId, entity.getY()];
        },
        log(objectId, newY) {
            const { entity } = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newY', newY],
            ];
        },
        dom: ['container', 'objectId', '&0', 'yInput'],
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict: _inputRestrictor,
        undo: 'objectUpdatePosY',
    };

    c[COMMAND_TYPES.objectUpdateSize] = {
        do(objectId, newSize = 0) {
            const object = RoCode.container.getObject(objectId);
            object.entity.setSize(Number(newSize));
            object.updateCoordinateView();
            object.setInputBlurred('sizeInput');
            RoCode.stage.updateObject();
        },
        state(objectId, newSize) {
            const { entity } = RoCode.container.getObject(objectId);
            return [objectId, entity.getSize()];
        },
        log(objectId, newSize) {
            const { entity } = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newSize', newSize],
            ];
        },
        dom: ['container', 'objectId', '&0', 'sizeInput'],
        restrict: _inputRestrictor,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectUpdateSize',
    };

    c[COMMAND_TYPES.objectUpdateRotationValue] = {
        do(objectId, newValue = 0) {
            const object = RoCode.container.getObject(objectId);
            object.entity.setRotation(Number(newValue));
            object.updateCoordinateView();
            object.setInputBlurred('rotationInput');
            RoCode.stage.updateObject();
        },
        state(objectId, newValue) {
            const { entity } = RoCode.container.getObject(objectId);
            return [objectId, entity.getRotation()];
        },
        log(objectId, newValue) {
            const { entity } = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newRotationValue', newValue],
            ];
        },
        dom: ['container', 'objectId', '&0', 'rotationInput'],
        restrict: _inputRestrictor,
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectUpdateRotationValue',
    };

    c[COMMAND_TYPES.objectUpdateDirectionValue] = {
        do(objectId, newValue = 0) {
            const object = RoCode.container.getObject(objectId);
            object.entity.setDirection(Number(newValue));
            object.updateCoordinateView();
            object.setInputBlurred('directionInput');
            RoCode.stage.updateObject();
        },
        state(objectId, newValue) {
            const { entity } = RoCode.container.getObject(objectId);
            return [objectId, entity.getDirection()];
        },
        log(objectId, newValue) {
            const { entity } = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newDirectionValue', newValue],
            ];
        },
        dom: ['container', 'objectId', '&0', 'directionInput'],
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        restrict: _inputRestrictor,
        undo: 'objectUpdateDirectionValue',
    };

    c[COMMAND_TYPES.objectUpdateRotateMethod] = {
        do(objectId, newMethod, rotation) {
            const object = RoCode.container.getObject(objectId);
            object.initRotateValue(newMethod);
            object.setRotateMethod(newMethod);
            if (rotation !== undefined) {
                object.entity.setRotation(rotation);
            }
            RoCode.stage.updateObject();
        },
        state(objectId, newMethod) {
            const { entity, rotateMethod } = RoCode.container.getObject(objectId);
            return [objectId, rotateMethod, entity.getRotation()];
        },
        log(objectId, newValue) {
            const { entity } = RoCode.container.getObject(objectId);
            return [
                ['objectId', objectId],
                ['newDirectionValue', newValue],
            ];
        },
        dom: ['container', 'objectId', '&0', 'rotationMethod', '&1'],
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'objectUpdateRotateMethod',
    };

    c[COMMAND_TYPES.entitySetModel] = {
        do(objectId, newModel, oldModel) {
            const { entity } = RoCode.container.getObject(objectId);
            entity.setModel(newModel);
        },
        state(objectId, newModel, oldModel) {
            return [objectId, oldModel, newModel];
        },
        log(objectId, newModel, oldModel) {
            return [
                ['objectId', objectId],
                ['newModel', newModel],
                ['oldModel', oldModel],
            ];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        undo: 'entitySetModel',
    };

    function _inputRestrictor({ tooltip, content }, domQuery, callback) {
        const { title: tooltipTitle, content: tooltipContent } = tooltip;
        _activateEdit(content[1][1], domQuery, callback);
        return createTooltip(tooltipTitle, tooltipContent, domQuery, callback);
    }

    function _activateEdit(objectId, domQuery, callback) {
        const object = RoCode.container.getObject(objectId);

        if (!object.isEditing) {
            object.editObjectValues(true);
        }

        if (!_.isEmpty(domQuery)) {
            domQuery = RoCode.getDom(domQuery);
            if (domQuery && !RoCode.Utils.isDomActive(domQuery)) {
                domQuery.focus();
                callback();
            }
        }
    }
})(RoCode.Command);
