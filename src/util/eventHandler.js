/**
 * Add event listener
 * @param {!string} eventName
 * @param {function} fn
 */
RoCode.addEventListener = function(eventName, fn) {
    if (!this.events_) {
        this.events_ = {};
    }

    if (!this.events_[eventName]) {
        this.events_[eventName] = [];
    }
    if (fn instanceof Function) {
        this.events_[eventName].push(fn);
    }

    return true;
};

/**
 * Dispatch event
 * @param {!string} eventName
 * @param {*} args
 */
RoCode.dispatchEvent = function(eventName, ...args) {
    if (!this.events_) {
        this.events_ = {};
        return;
    }

    const events = this.events_[eventName];
    if (_.isEmpty(events)) {
        return;
    }

    events.forEach((func) => func.apply(window, args));
};

/**
 * Remove event listener
 * @param {!string} eventName
 * @param {function} fn
 */
RoCode.removeEventListener = function(eventName, fn) {
    const events = this.events_[eventName];
    if (_.isEmpty(events)) {
        return;
    }
    this.events_[eventName] = events.filter((a) => fn !== a);
};

/**
 * Remove event listener
 * @param {!string} eventName
 */
RoCode.removeAllEventListener = function(eventName) {
    if (!this.events_ || !this.events_[eventName]) {
        return;
    }
    delete this.events_[eventName];
};
