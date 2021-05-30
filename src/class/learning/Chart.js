import { BillBoard } from '@RoCodelabs/tool';

export default class LearningChart {
    constructor(modalData) {
        this.modal = this.createChart(modalData);
        this.modal.show();
    }

    show() {
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    destroy() {
        this.modal.hide();
        this.modal = null;
    }

    load(data) {
        this.modal.setData(data);
    }

    createChart({ title = '', description = '', source }) {
        const container = RoCode.Dom('div', {
            class: 'RoCode-learning-chart',
            parent: $('body'),
        })[0];

        return new BillBoard({
            data: {
                source,
                title,
                description,
                togglePause: () => RoCode.engine.togglePause(),
                stop: () => RoCode.engine.toggleStop(),
                isIframe: self !== top,
            },
            container,
        });
    }
}
