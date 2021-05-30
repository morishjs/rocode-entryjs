import singleInstance from '../core/singleInstance';
import { Dropper } from '@RoCodelabs/tool';

class DropperExtension {
    #view = null;
    #dropper = null;
    constructor() {
        return this.#createView();
    }

    #createView() {
        this.#view = RoCode.Dom('div', {
            class: 'RoCodeDropper',
            parent: $('.RoCodeExtension'),
        });

        this.#dropper = new Dropper({
            isShow: false,
            container: this.#view[0],
        });

        return this.#dropper;
    }
}

export default singleInstance(DropperExtension);
