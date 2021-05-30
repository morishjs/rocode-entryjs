import Extension from '../extensions/extension';

let RoCodePaint;
RoCode.Painter = class Painter {
    constructor(view) {
        this.view = view;
        this.cache = [];

        this.file = {
            id: RoCode.generateHash(),
            name: '새그림',
            modified: false,
            mode: 'new', // new or edit
        };

        this.dropper = Extension.getExtension('Dropper');
        this.isShow = false;
        this.clipboard = null;
        this._keyboardEvents = [];
        RoCode.addEventListener('pictureImport', this.addPicture.bind(this));
        RoCode.addEventListener('run', this.detachKeyboardEvents.bind(this));
        RoCode.addEventListener('stop', this.attachKeyboardEvents.bind(this));
        this.importRoCodePaint();
    }

    async importRoCodePaint() {
        RoCodePaint = window.RoCodePaint.default;
        if (this.requestShow) {
            this.initialize();
        }
    }

    get graphicsMode() {
        return this.RoCodePaint.graphicsMode;
    }

    initialize() {
        if (this.RoCodePaint || !RoCodePaint) {
            this.requestShow = true;
            return;
        }

        this.isShow = true;

        this.RoCodePaint = RoCodePaint.create({ parent: this.view, mode: 'RoCode' });
        this.RoCodePaint.setDropper && this.RoCodePaint.setDropper(this.dropper);

        this.isImport = true;
        this.RoCodePaint.on('SNAPSHOT_SAVED', (e) => {
            if (!this.isImport && RoCode.stage.selectedObject) {
                RoCode.do('editPicture', e, this.RoCodePaint);
                this.file.modified = true;
            }
            this.isImport = false;
        });
        this.RoCodePaint.on('NEW_PICTURE', this.newPicture.bind(this));
        this.RoCodePaint.on('IMPORT_IMAGE', () => {
            RoCode.dispatchEvent('openPictureImport');
        });
        this.RoCodePaint.on('SAVE_PICTURE', () => {
            this.fileSave(false);
        });
        this.RoCodePaint.on('SAVE_NEW_PICTURE', () => {
            this.file.mode = 'new';
            this.fileSave(false);
        });
        this.RoCodePaint.on('FULL_SCREEN_ON', () => {
            this.toggleFullscreen(true);
        });
        this.RoCodePaint.on('FULL_SCREEN_OFF', () => {
            this.toggleFullscreen(false);
        });

        RoCode.addEventListener('pictureSelected', this.changePicture.bind(this));
    }

    show() {
        if (!this.isShow) {
            this.initialize();
        }
        this.realign && RoCode.windowResized.detach(this.realign);
        this.realign = RoCode.windowResized.attach(this.view, this.RoCodePaint.realign);
    }

    hide() {
        this.alertSaveModifiedPicture();
        this.RoCodePaint && RoCode.windowResized.detach(this.realign);
    }

    newPicture() {
        const newPicture = {
            dimension: {
                height: 1,
                width: 1,
            },
            fileurl: `${RoCode.mediaFilePath}_1x1.png`,
            name: Lang.Painter.new_picture,
            imageType: 'png',
        };

        newPicture.id = RoCode.generateHash();
        if (this.file && this.file.objectId) {
            newPicture.objectId = this.file.objectId;
        }
        RoCode.playground.addPicture(newPicture, true);
    }

    changePicture(picture = {}, removed) {
        if (this.file && this.file.id === picture.id) {
            if (!this.file.isUpdate) {
                RoCode.stage.updateObject();
                this.file.isUpdate = true;
            }
            return;
        } else if (!this.file.modified) {
            this.afterModified(picture);
        } else {
            if (this.isConfirm) {
                return;
            }

            this.isConfirm = true;
            let wasRun = false;
            if (RoCode.engine.state === 'run') {
                RoCode.engine.toggleStop();
                wasRun = true;
            }

            if (removed) {
                this.updatePicture(picture);
            } else {
                this.alertSaveModifiedPicture(picture, wasRun);
            }
        }
        RoCode.stage.updateObject();
        this.file.isUpdate = true;
    }

    updatePicture(picture = {}, wasRun = true, result = true) {
        this.isConfirm = false;
        result ? this.fileSave(true) : (this.file.modified = false);
        wasRun ? RoCode.playground.injectPicture() : this.afterModified(picture);
        RoCode.stage.updateObject();
    }

    alertSaveModifiedPicture(picture, wasRun) {
        if (!this.file.modified) {
            return;
        }

        RoCodelms.confirm(Lang.Menus.save_modified_shape).then((result) => {
            this.updatePicture(picture, wasRun, result);
        });
    }

    afterModified(picture) {
        const file = this.file;
        file.modified = false;
        this.isImport = true;

        if (picture.id) {
            file.id = picture.id || RoCode.generateHash();
            file.name = picture.name;
            file.mode = 'edit';
            file.objectId = picture.objectId;

            this.addPicture(picture, true);
        } else {
            file.id = RoCode.generateHash();
            this.RoCodePaint.reset();
        }

        RoCode.stateManager.removeAllPictureCommand();
    }

    getImageSrc(picture) {
        const { fileurl } = picture || {};
        if (fileurl) {
            return fileurl;
        }

        const { imageType = 'png', filename } = picture || {};
        return `${RoCode.defaultPath}/uploads/${filename.substring(0, 2)}/${filename.substring(
            2,
            4
        )}/image/${filename}.${imageType}`;
    }

    addPicture(picture = {}, isChangeShape) {
        picture.imageType = picture.imageType || 'png';
        const { imageType } = picture;
        const imageSrc = this.getImageSrc(picture);

        isChangeShape && (this.isImport = true);

        switch (imageType) {
            case 'png':
                this.RoCodePaint.addBitmap(imageSrc, {
                    graphicsMode: this.isImport ? this.graphicsMode.BITMAP : '',
                });
                break;
            case 'svg':
                this.RoCodePaint.addSVG(imageSrc, {
                    graphicsMode: this.isImport ? this.graphicsMode.VECTOR : '',
                });
                break;
        }
    }

    _getImageType() {
        if (this.RoCodePaint.mode === this.graphicsMode.VECTOR) {
            return 'svg';
        } else {
            return 'png';
        }
    }

    fileSave(taskParam) {
        if (!RoCode.stage.selectedObject) {
            return;
        }
        const dataURL = this.RoCodePaint.getDataURL();
        if (this.RoCodePaint.mode === this.graphicsMode.VECTOR) {
            this.file.svg = this.RoCodePaint.exportSVG();
        } else {
            delete this.file.svg;
        }
        this.file.ext = this._getImageType();
        const file = JSON.parse(JSON.stringify(this.file));
        RoCode.dispatchEvent('saveCanvasImage', {
            file,
            image: dataURL,
            task: taskParam,
        });
        this.file.isUpdate = false;
        this.file.modified = false;
    }

    attachKeyboardEvents() {
        this.detachKeyboardEvents();

        const events = this._keyboardEvents;

        let evt = RoCode.keyPressed;
        evt && events.push(evt.attach(this, this._keyboardPressControl));

        evt = RoCode.keyUpped;
        evt && events.push(evt.attach(this, this._keyboardUpControl));
    }

    detachKeyboardEvents() {
        const events = this._keyboardEvents;
        if (!events || !events.length) {
            return;
        }

        while (events.length) {
            const evt = events.pop();
            evt.destroy && evt.destroy();
        }
    }

    _keyboardUpControl(e) {}
    _keyboardPressControl(e) {}

    toggleFullscreen(isFullscreen) {
        const { pictureView_ } = RoCode.playground;
        const $view = $(this.view);
        if ((isFullscreen !== true && $view.hasClass('fullscreen')) || isFullscreen === false) {
            pictureView_.appendChild(this.view);
            $view.removeClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.fullscreen);
            }
        } else {
            document.body.appendChild(this.view);
            $view.addClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.exit_fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.exit_fullscreen);
            }
        }
        this.RoCodePaint && this.RoCodePaint.realign();
    }

    clear() {
        this.toggleFullscreen(false);
    }

    undo() {
        this.RoCodePaint.undo();
    }

    redo() {
        this.RoCodePaint.redo();
    }
};
