'use strict';

RoCode.Recorder = function() {
    this._recordData = [];
    RoCode.commander.addReporter(this);
};

(function(p) {
    p.add = function(data) {
        var commandType = data[0];
        if (!commandType) return;
        var command = RoCode.Command[commandType];
        switch (command.recordable) {
            case RoCode.STATIC.RECORDABLE.SUPPORT:
                this._recordData.push(data);
                RoCode.toast.warning('Record', Lang.Command[commandType + '']);
                return;
            case RoCode.STATIC.RECORDABLE.SKIP:
                return;
            case RoCode.STATIC.RECORDABLE.ABANDON:
                RoCode.toast.alert('지원하지 않음');
                return;
        }
    };

    p.getData = function() {
        return this._recordData;
    };
})(RoCode.Recorder.prototype);
