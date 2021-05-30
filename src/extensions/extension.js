import Dropper from './dropper';

export default class Extension {
    #view = null;
    constructor() {
        this.renderView();
    }

    renderView() {
        if (!this.#view) {
            this.#view = RoCode.Dom('div', {
                class: 'RoCodeExtension',
                parent: $('body'),
            });
        }
    }

    static getExtension(key) {
        switch (key) {
            case 'Dropper':
                return Dropper.getInstance();
        }
    }
}
