import { BaseTexture, resources } from 'pixi.js';

export class RoCodeBaseTexture extends BaseTexture {
    private _hasSource: boolean;

    updateSource(src: HTMLImageElement | HTMLCanvasElement) {
        if (!this.resource) {
            const resource = resources.autoDetectResource(src);
            this.setResource(resource);
            this.update();
        }
    }
}
