'use strict';

RoCode.ActivityReporter = function() {
    this._activities = [];
};

(function(p) {
    p.add = function(data) {
        if (!data || data.length === 0) return;
        var activity;
        if (data instanceof RoCode.Activity) activity = data;
        else {
            var type = data.shift();
            activity = new RoCode.Activity(type, data);
        }

        this._activities.push(activity);
    };

    p.clear = function() {
        this._activities = [];
    };

    p.get = function() {
        return this._activities;
    };

    p.report = function() {};
})(RoCode.ActivityReporter.prototype);
