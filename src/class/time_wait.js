'use strict';

RoCode.TimeWaitManager = {
    add(id, cb, ms) {
        if (!RoCode.timerInstances) {
            RoCode.timerInstances = [];
        }

        const instance = new RoCode.TimeWait(id, cb, ms);
        RoCode.timerInstances.push(instance);
    },
    remove(id) {
        if (!RoCode.timerInstances || RoCode.timerInstances.length == 0) {
            return;
        }
        RoCode.timerInstances = RoCode.timerInstances.filter((instance) => {
            if (instance.id === id) {
                return false;
            } else {
                return true;
            }
        });
    },
};

RoCode.TimeWait = class TimeWait {
    constructor(id, cb, ms) {
        this.id = id;
        this.cb = cb;
        this.ms = ms;
        this.startTime = performance.now();
        this.timer = setTimeout(this.callback.bind(this), ms);
    }

    callback() {
        if (this.cb) {
            this.cb();
            this.destroy();
        }
    }

    pause() {
        if (this.timer) {
            this.ms = this.ms - (performance.now() - this.startTime);
            clearTimeout(this.timer);
        }
    }

    resume() {
        this.timer = setTimeout(this.callback.bind(this), this.ms);
        this.startTime = performance.now();
    }

    destroy() {
        delete this.timer;
        delete this.cb;
        delete this.ms;
        delete this.startTime;
        RoCode.TimeWaitManager.remove(this.id);
    }
};
