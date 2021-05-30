/**
 * @fileoverview stamp entity object is class for RoCode stamp entity canvas view.
 */

'use strict';

import { GEHelper } from '../graphicEngine/GEHelper';

/**
 * Construct stamp entity class
 * @param {!RoCode.RoCodeObject} object
 * @param {!RoCode.EntityObject} entity
 * @constructor
 */
RoCode.StampEntity = class StampEntity extends RoCode.EntityObject {
    constructor(object, entity) {
        /** @type {!string} */
        super(object);
        this.parent = object;
        this.type = object.objectType;
        this.isClone = true;
        this.isStamp = true;
        this.width = entity.getWidth();
        this.height = entity.getHeight();
        if (this.type == 'sprite') {
            this.object = GEHelper.cloneStamp(entity);
            if (entity.effect) {
                this.effect = _.clone(entity.effect);
                this.applyFilter();
            }
        } else if (this.type == 'textBox') {
        }

        this.object.entity = entity;
    }
};
