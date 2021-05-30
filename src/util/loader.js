'use strict';

RoCode.Loader = {
    queueCount: 0,
    totalCount: 0,
    loaded: false,
};

RoCode.Loader.addQueue = function(type) {
    if (!this.queueCount) RoCode.dispatchEvent('loadStart');
    this.queueCount++;
    this.totalCount++;
};

RoCode.Loader.removeQueue = function(type) {
    this.queueCount--;
    if (!this.queueCount) {
        this.totalCount = 0;
        this.handleLoad();
    }
};

RoCode.Loader.getLoadedPercent = function() {
    if (this.totalCount === 0) return 1;
    else return this.queueCount / this.totalCount;
};

RoCode.Loader.isLoaded = function() {
    return !this.queueCount && !this.totalCount;
};

RoCode.Loader.handleLoad = function() {
    if (this.loaded) return;
    this.loaded = true;
    RoCode.dispatchEvent('loadComplete');
};
