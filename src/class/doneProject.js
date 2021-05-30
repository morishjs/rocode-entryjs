'use strict';

require('../util/static');

RoCode.DoneProject = class DoneProject {
    constructor(id) {
        this.generateView(id);
    }
    init(projectId) {
        this.projectId = projectId;
    }

    generateView(doneProject) {
        // this.youtubeTab.removeClass('RoCodeRemove');

        const doneContainer = RoCode.createElement('div');
        doneContainer.addClass('RoCodeContainerDoneWorkspace');
        // var parentcontainer = document.getElementById('RoCodeContainerWorkspaceId');

        this.doneContainer = doneContainer;
        const view = this.doneContainer;
        // var width = parentcontainer.offsetWidth;

        const url = '/api/iframe/project/';
        const iframe = RoCode.createElement('iframe');
        iframe.setAttribute('id', 'doneProjectframe');
        iframe.setAttribute('frameborder', 0);
        iframe.setAttribute('src', url + doneProject);
        this.doneProjectFrame = iframe;
        this.doneContainer.appendChild(iframe);
        doneContainer.addClass('RoCodeRemove');
    }

    getView() {
        return this.doneContainer;
    }

    resize() {
        const iframe = document.getElementById('doneProjectframe');
        const w = this.doneContainer.offsetWidth;

        iframe.width = `${w}px`;
        iframe.height = `${(w * 9) / 16}px`;
    }
};
