import { ImageRect } from '../../../maxrect-packer/geom/ImageRect';
import { RoCodeBaseTexture } from './RoCodeBaseTexture';
import { RoCodeTextureBase } from './RoCodeTextureBase';

export class RoCodeTexture extends RoCodeTextureBase {
    constructor(baseTexture: RoCodeBaseTexture, imageRect: ImageRect) {
        super(baseTexture, imageRect);
    }

    getBaseTexture(): RoCodeBaseTexture {
        return this.baseTexture as RoCodeBaseTexture;
    }
}
