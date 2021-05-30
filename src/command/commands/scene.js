/*
 *
 */
'use strict';

const { createTooltip } = require('../command_util');

(function(c) {
    const COMMAND_TYPES = RoCode.STATIC.COMMAND_TYPES;

    c[COMMAND_TYPES.sceneAdd] = {
        /**
         * @param {!object|string} sceneId can be sceneId or scene object
         * @param {?number} sceneIndex
         * @param {?Array} objects will be add to new scene, for undo function
         */
        do(sceneId, sceneIndex, objects) {
            if (RoCode.expectedAction) {
                sceneId = RoCode.expectedAction[1][1];
            }
            RoCode.scene.addScene(sceneId, sceneIndex);
            if (objects) {
                RoCode.container.setObjects(objects);
            }
        },
        state(sceneId, sceneIndex) {
            if (!sceneIndex) {
                sceneIndex = RoCode.scene.getScenes().length;
            }
            if (RoCode.expectedAction) {
                sceneId = RoCode.expectedAction[1][1];
            }
            if (typeof sceneId !== 'string') {
                sceneId = sceneId.id;
            }
            return [sceneId];
        },
        log(sceneId) {
            if (RoCode.expectedAction) {
                sceneId = RoCode.expectedAction[1][1];
            }
            return [['sceneId', sceneId]];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['scene', 'addButton'],
        undo: 'sceneRemove',
    };

    c[COMMAND_TYPES.sceneRemove] = {
        do(sceneId) {
            RoCode.scene.removeScene(sceneId);
        },
        state(sceneId) {
            const scene = RoCode.scene.getSceneById(sceneId);
            const sceneJSON = {
                id: scene.id,
                name: scene.name,
            };
            const sceneIndex = RoCode.scene.getScenes().indexOf(scene);
            const objects = RoCode.container.getSceneObjects(scene).map((o) => o.toJSON());
            return [sceneJSON, sceneIndex, objects];
        },
        log(sceneId) {
            return [['sceneId', sceneId]];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['scene', 'removeButton', '&0'],
        undo: 'sceneAdd',
    };

    c[COMMAND_TYPES.sceneRename] = {
        do(sceneId, newName) {
            const scene = RoCode.scene.getSceneById(sceneId);
            scene.name = newName;
            scene.view.nameField.value = newName;
            setTimeout(() => {
                RoCode.scene.resize();
            }, 0);
        },
        state(sceneId) {
            const scene = RoCode.scene.getSceneById(sceneId);
            return [sceneId, scene.name];
        },
        log(sceneId, newName) {
            return [['sceneId', sceneId], ['newName', newName]];
        },
        restrict(data, domQuery, callback) {
            const {
                content: contentData,
                tooltip: { title, content },
            } = data;

            callback();
            const scene = RoCode.scene.getSceneById(contentData[1][1]);
            scene.view.nameField.focus();
            return createTooltip(title, content, domQuery, callback);
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['scene', 'nameField', '&0'],
        undo: 'sceneRename',
    };

    c[COMMAND_TYPES.sceneSelect] = {
        do(sceneId) {
            const scene = RoCode.scene.getSceneById(sceneId);
            RoCode.scene.selectScene(scene);
        },
        state(sceneId) {
            return [RoCode.scene.selectedScene.id];
        },
        log(sceneId) {
            return [['sceneId', sceneId]];
        },
        recordable: RoCode.STATIC.RECORDABLE.SUPPORT,
        dom: ['scene', 'view', '&0'],
        undo: 'sceneSelect',
    };
})(RoCode.Command);
