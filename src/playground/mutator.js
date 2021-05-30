/*
 *
 */
'use strict';

/*
 *
 */
RoCode.Mutator = function() {};

(function(m) {
    m.mutate = function(blockType, schemaDiff, changeData) {
        var blockSchema = RoCode.block[blockType];
        if (blockSchema.changeEvent === undefined)
            blockSchema.changeEvent = new RoCode.Event();
        if (blockSchema.paramsBackupEvent === undefined)
            blockSchema.paramsBackupEvent = new RoCode.Event();
        if (blockSchema.destroyParamsBackupEvent === undefined)
            blockSchema.destroyParamsBackupEvent = new RoCode.Event();

        //statements params template
        blockSchema.template = schemaDiff.template;
        blockSchema.params = schemaDiff.params;

        blockSchema.changeEvent.notify(1, changeData);
    };
})(RoCode.Mutator);

(function(p) {})(RoCode.Mutator.prototype);
