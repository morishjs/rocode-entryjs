import { ISceneTextures } from './ISceneTextures';
import { AtlasImageLoadingInfo } from './loader/AtlasImageLoadingInfo';
import { PrimitiveMap } from './structure/PrimitiveMap';
import { ImageRect } from '../../maxrect-packer/geom/ImageRect';
import { AtlasImageLoader } from './loader/AtlasImageLoader';
import { RoCodeTextureOption } from './RoCodeTextureOption';
import { RoCodeTexture } from './texture/RoCodeTexture';
import { RoCodeBaseTexture } from './texture/RoCodeBaseTexture';
import { IRawPicture } from './model/IRawPicture';
import { PIXIAtlasHelper } from './PIXIAtlasHelper';
import { clog } from '../utils/logs';
import { PrimitiveSet } from './structure/PrimitiveSet';
import { TimeoutTimer } from '../utils/TimeoutTimer';

export class SceneTextures implements ISceneTextures {
    private _path_tex_map: PrimitiveMap<RoCodeTexture> = new PrimitiveMap();
    private _activated: boolean;
    private _gcTimer: TimeoutTimer = new TimeoutTimer();

    constructor(
        public sceneID: string,
        private _option: RoCodeTextureOption,
        private _loader: AtlasImageLoader
    ) {}

    _internal_imageRemoved(): void {
        if (this._gcTimer.isRunning) {
            return;
        }
        this._gcTimer.timeout(500, () => {
            this._gcTexture();
        });
    }

    _gcTexture(): void {
        const usedPathSet: PrimitiveSet = PIXIAtlasHelper.getScenePathSet(this.sceneID);
        let deleteCnt = 0;
        this._path_tex_map.each((tex: RoCodeTexture, path: string) => {
            if (usedPathSet.hasValue(path)) {
                return;
            }
            tex.destroy(true);
            this._path_tex_map.remove(path);
            deleteCnt++;
        });
        if (deleteCnt) {
            clog(`[SceneTextures] ${deleteCnt} textures deleted`);
        }
    }

    activate(): void {
        this._activated = true;
        this._path_tex_map.each((tex: RoCodeTexture, path: string) => {
            const info = this._loader.getImageInfo(path);
            if (!info || !info.isReady) {
                return;
            }
            this.putImage(info, false);
        });
    }

    addPicInfo(pic: IRawPicture): void {
        const path = PIXIAtlasHelper.getRawPath(pic);
        const map = this._path_tex_map;
        if (map.hasValue(path)) {
            return;
        }

        const info = this._loader.getImageInfo(path);
        const rect: ImageRect = PIXIAtlasHelper.getNewImageRect(pic, this._option.texMaxRect);
        if (!info) {
            this._loader.load(pic, rect);
        }
        const tex = this._newTexture(path, rect);
        map.add(path, tex);
        if (info && info.isReady) {
            this.putImage(info, false);
        }
    }

    private _newTexture(path: string, rect: ImageRect): RoCodeTexture {
        const baseTex: RoCodeBaseTexture = new RoCodeBaseTexture();
        baseTex.width = rect.width;
        baseTex.height = rect.height;
        baseTex.mipmap = this._option.mipmap;
        baseTex.scaleMode = this._option.scaleMode;
        const tex = new RoCodeTexture(baseTex, rect);
        this._path_tex_map.add(path, tex);
        return tex;
    }

    deactivate(): void {
        this._activated = false;
        this._path_tex_map.each((tex: RoCodeTexture, path: string) => {
            tex.getBaseTexture().dispose();
        });
    }

    getTexture(path: string): RoCodeTexture {
        return this._path_tex_map.getValue(path);
    }

    putImage(info: AtlasImageLoadingInfo, forceUpdateBaseTexture: boolean): void {
        const tex: RoCodeTexture = this._path_tex_map.getValue(info.path);
        if (!tex) {
            return;
        }
        const baseTex = tex.getBaseTexture();
        const source = info.source();

        // protected 값에대한 직접접근입니다. 타입체크 하지않습니다.
        // @ts-ignore
        if (tex._frame) {
            // @ts-ignore
            const textureFrame = tex._frame;
            if (textureFrame.height != info.srcHeight) {
                textureFrame.height = info.srcHeight;
            }
            if (textureFrame.width != info.srcWidth) {
                textureFrame.width = info.srcWidth;
            }
        }
        baseTex.updateSource(source);

        RoCode.requestUpdate = true;
    }

    destroy(): void {
        clog('destroy', this.sceneID);
        this._gcTimer.reset();
        this._gcTimer = null;

        this._path_tex_map.each((tex: RoCodeTexture, path: string) => {
            tex.destroy(true);
        });
        this._path_tex_map.destroy();
        this._path_tex_map = null;
    }
}
