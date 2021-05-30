'use strict';

RoCode.LiterallycanvasPainter = class LiterallycanvasPainter {
    constructor(view) {
        this.view = view;
        this.baseUrl = RoCode.painterBaseUrl;

        this.file = {
            id: RoCode.generateHash(),
            name: '새그림',
            modified: false,
            mode: 'new', // new or edit
        };

        this._keyboardEvents = [];

        RoCode.addEventListener('pictureImport', this.addPicture.bind(this));
        RoCode.addEventListener('run', this.detachKeyboardEvents.bind(this));
        RoCode.addEventListener('stop', this.attachKeyboardEvents.bind(this));

        //dropdown header dispose
        $('body').on('mouseup', '.active li', () => {
            $('.painterTopHeader.active').removeClass('active');
        });

        this.clipboard = null;
    }

    initialize() {
        if (this.lc) {
            return;
        }

        const that = this;

        const imgURL = that.baseUrl;
        const bgImage = new Image();
        bgImage.src = `${imgURL}/transparent-pattern.png`;

        const WIDTH = 960;
        const HEIGHT = 540;
        that.lc = LC.init(that.view, {
            imageURLPrefix: imgURL,
            zoomMax: 3.0,
            zoomMin: 0.5,
            toolbarPosition: 'bottom',
            imageSize: { width: WIDTH, height: HEIGHT },
            backgroundShapes: [
                LC.createShape('Rectangle', {
                    x: 0,
                    y: 0,
                    width: WIDTH,
                    height: HEIGHT,
                    strokeWidth: 0,
                    strokeColor: 'transparent',
                }),
            ],
        });
        //that.lc.respondToSizeChange();

        bgImage.onload = function() {
            that.lc.repaintLayer('background');
        };

        const watchFunc = function(e) {
            if (e && ((e.shape && !e.opts && e.shape.isPass) || (e.opts && e.opts.isPass))) {
                RoCode.do('processPicture', e, that.lc);
            } else {
                RoCode.do('editPicture', e, that.lc);
            }
            if (RoCode.stage.selectedObject) {
                that.file.modified = true;
            }
        };

        that.lc.on('clear', watchFunc);
        that.lc.on('remove', watchFunc);
        that.lc.on('shapeEdit', watchFunc);
        that.lc.on('shapeSave', watchFunc);

        that.lc.on('toolChange', that.updateEditMenu.bind(that));
        that.lc.on('lc-pointerdrag', that.stagemousemove.bind(that));
        that.lc.on('lc-pointermove', that.stagemousemove.bind(that));

        that.initTopBar();
        that.updateEditMenu();

        that.attachKeyboardEvents();
    }

    show() {
        if (!this.lc) {
            this.initialize();
        }
        this.isShow = true;
    }

    hide() {
        this.isShow = false;
    }

    changePicture(picture = {}) {
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
            RoCodelms.confirm(Lang.Menus.save_modified_shape).then((result) => {
                this.isConfirm = false;
                if (result === true) {
                    this.fileSave(true);
                } else {
                    this.file.modified = false;
                }

                if (!wasRun) {
                    this.afterModified(picture);
                } else {
                    RoCode.playground.injectPicture();
                }
            });
        }
        RoCode.stage.updateObject();
        this.file.isUpdate = true;
    }

    afterModified(picture) {
        const file = this.file;
        file.modified = false;
        this.lc.clear(false);

        if (picture.id) {
            file.id = picture.id || RoCode.generateHash();
            file.name = picture.name;
            file.mode = 'edit';
            file.objectId = picture.objectId;

            this.addPicture(picture, true);
        } else {
            file.id = RoCode.generateHash();
        }
        // INFO: picture 변경시마다 undoStack 리셋
        this.lc.undoStack = [];
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

    addPicture(picture, isOriginal) {
        const image = new Image();

        if (picture.fileurl) {
            image.src = picture.fileurl;
        } else {
            // deprecated
            image.src = `${RoCode.defaultPath}/uploads/${picture.filename.substring(
                0,
                2
            )}/${picture.filename.substring(2, 4)}/image/${picture.filename}.png`;
        }

        const dimension = picture.dimension;
        const shape = LC.createShape('Image', {
            x: 480,
            y: 270,
            width: dimension.width,
            height: dimension.height,
            image,
        });

        this.lc.saveShape(shape, !isOriginal);

        image.onload = function() {
            this.lc.setTool(this.lc.tools.SelectShape);
            this.lc.tool.setShape(this.lc, shape);
        }.bind(this);
    }

    copy() {
        if (this.lc.tool.name !== 'SelectShape' || !this.lc.tool.selectedShape) {
            return;
        }

        const shape = this.lc.tool.selectedShape;
        this.clipboard = {
            className: shape.className,
            data: shape.toJSON(),
        };
        this.updateEditMenu();
    }

    cut() {
        if (this.lc.tool.name !== 'SelectShape' || !this.lc.tool.selectedShape) {
            return;
        }

        this.copy();
        const shape = this.lc.tool.selectedShape;
        this.lc.removeShape(shape);
        this.lc.tool.setShape(this.lc, null);
    }

    paste() {
        if (!this.clipboard) {
            return;
        }

        const shape = this.lc.addShape(this.clipboard);
        this.lc.setTool(this.lc.tools.SelectShape);
        this.lc.tool.setShape(this.lc, shape);
    }

    updateEditMenu() {
        const isSelected = this.lc.tool.name === 'SelectShape' ? 'block' : 'none';
        // this._cutButton.style.display = isSelected;
        // this._copyButton.style.display = isSelected;
        // this._pasteButton.style.display = this.clipboard ? "block" : "none";
    }

    fileSave(taskParam) {
        if (!RoCode.stage.selectedObject) {
            return;
        }
        this.lc.trigger('dispose');
        const dataURL = this.lc.getImage().toDataURL();
        this.file_ = JSON.parse(JSON.stringify(this.file));
        RoCode.dispatchEvent('saveCanvasImage', {
            file: this.file_,
            image: dataURL,
            task: taskParam,
        });

        this.file.isUpdate = false;
        this.file.modified = false;
    }

    newPicture() {
        if (!RoCode.stage.selectedObject) {
            return;
        }
        const newPicture = {
            dimension: {
                height: 1,
                width: 1,
            },
            //filename: "_1x1",
            fileurl: `${RoCode.mediaFilePath}_1x1.png`,
            name: Lang.Painter.new_picture,
        };

        newPicture.id = RoCode.generateHash();
        if (this.file && this.file.objectId) {
            newPicture.objectId = this.file.objectId;
        }
        RoCode.playground.addPicture(newPicture, true);
    }

    _keyboardPressControl(e) {
        if (!this.isShow || RoCode.Utils.isInInput(e)) {
            return;
        }

        const keyCode = e.keyCode || e.which;
        const ctrlKey = e.ctrlKey;

        if (keyCode == 8 || keyCode == 46) {
            //destroy
            this.cut();
            e.preventDefault();
        } else if (ctrlKey) {
            if (keyCode == 67) {
                //copy
                this.copy();
            } else if (keyCode == 88) {
                //cut
                this.cut();
            }
        }

        if (ctrlKey && keyCode == 86) {
            //paste
            this.paste();
        }
        this.lc.trigger('keyDown', e);
    }

    _keyboardUpControl(e) {
        if (!this.isShow || RoCode.Utils.isInInput(e)) {
            return;
        }

        this.lc.trigger('keyUp', e);
    }

    toggleFullscreen(isFullscreen) {
        const { painter = {}, pictureView_ } = RoCode.playground;
        const { view = {} } = painter;
        const $view = $(view);
        if ((isFullscreen !== true && $view.hasClass('fullscreen')) || isFullscreen === false) {
            pictureView_.appendChild(view);
            $(view).removeClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.fullscreen);
            }
        } else {
            document.body.appendChild(view);
            $(view).addClass('fullscreen');
            if (this.fullscreenButton) {
                this.fullscreenButton.setAttribute('title', Lang.Painter.exit_fullscreen);
                this.fullscreenButton.setAttribute('alt', Lang.Painter.exit_fullscreen);
            }
        }
        $(view)
            .find('.lc-drawing.with-gui')
            .trigger('resize');
    }

    initTopBar() {
        const painter = this;

        const ce = RoCode.createElement;

        const painterTop = ce(document.getElementById('canvas-top-menu'));
        painterTop.addClass('RoCodePlaygroundPainterTop');
        painterTop.addClass('RoCodePainterTop');

        const painterTopFullscreenButton = ce('div', 'RoCodePainterTopFullscreenButton');
        painterTopFullscreenButton.setAttribute('title', Lang.Painter.fullscreen);
        painterTopFullscreenButton.setAttribute('alt', Lang.Painter.fullscreen);
        painterTopFullscreenButton.addClass('RoCodePlaygroundPainterFullscreenButton');
        painterTopFullscreenButton.bindOnClick(() => {
            this.toggleFullscreen();
        });
        this.fullscreenButton = painterTopFullscreenButton;
        painterTop.appendChild(painterTopFullscreenButton);

        const painterTopMenu = ce('nav', 'RoCodePainterTopMenu');
        painterTopMenu.addClass('RoCodePlaygroundPainterTopMenu');
        painterTop.appendChild(painterTopMenu);

        const painterTopMenuFileNew = ce('div', 'RoCodePainterTopMenuFileNew');
        painterTopMenuFileNew.bindOnClick(painter.newPicture.bind(this));
        painterTopMenuFileNew.addClass('RoCodePlaygroundPainterTopMenuFileNew');
        painterTopMenuFileNew.innerHTML = Lang.Painter.new_picture;
        painterTopMenu.appendChild(painterTopMenuFileNew);

        const painterTopMenuFile = ce('div', 'RoCodePainterTopMenuFile');
        painterTopMenuFile.addClass('RoCodePlaygroundPainterTopMenuFile painterTopHeader');
        painterTopMenuFile.innerHTML = Lang.Painter.file;
        const painterTopMenuFileDropdown = ce('div');

        painterTopMenuFileDropdown.addClass('RoCodePlaygroundPainterTopMenuFileDropdown');
        painterTopMenu.appendChild(painterTopMenuFile);
        painterTopMenuFile.appendChild(painterTopMenuFileDropdown);

        const painterTopMenuEdit = ce('div', 'RoCodePainterTopMenuEdit');
        painterTopMenuEdit.addClass('RoCodePlaygroundPainterTopMenuEdit painterTopHeader');
        painterTopMenuEdit.innerHTML = Lang.Painter.edit;
        painterTopMenu.appendChild(painterTopMenuEdit);

        const painterTopMenuFileSave = ce('div', 'RoCodePainterTopMenuFileSave');
        painterTopMenuFileSave.bindOnClick(() => {
            painter.fileSave(false);
        });
        painterTopMenuFileSave.addClass('RoCodePainterTopMenuFileSave');
        painterTopMenuFileSave.innerHTML = Lang.Painter.painter_file_save;
        painterTopMenuFileDropdown.appendChild(painterTopMenuFileSave);

        const painterTopMenuFileSaveAsLink = ce('div', 'RoCodePainterTopMenuFileSaveAs');
        painterTopMenuFileSaveAsLink.bindOnClick(() => {
            painter.file.mode = 'new';
            painter.fileSave(false);
        });
        painterTopMenuFileSaveAsLink.addClass('RoCodePlaygroundPainterTopMenuFileSaveAs');
        painterTopMenuFileSaveAsLink.innerHTML = Lang.Painter.painter_file_saveas;
        painterTopMenuFileDropdown.appendChild(painterTopMenuFileSaveAsLink);

        const painterTopMenuEditDropdown = ce('div');
        painterTopMenuEditDropdown.addClass('RoCodePlaygroundPainterTopMenuEditDropdown');
        painterTopMenuEdit.appendChild(painterTopMenuEditDropdown);

        const painterTopMenuEditImport = ce('div', 'RoCodePainterTopMenuEditImport');
        painterTopMenuEditImport.bindOnClick(() => {
            RoCode.dispatchEvent('openPictureImport');
        });
        painterTopMenuEditImport.addClass('RoCodePainterTopMenuEditImport');
        painterTopMenuEditImport.innerHTML = Lang.Painter.get_file;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditImport);

        const painterTopMenuEditCopy = ce('div', 'RoCodePainterTopMenuEditCopy');
        painterTopMenuEditCopy.bindOnClick(() => {
            painter.copy();
        });
        painterTopMenuEditCopy.addClass('RoCodePlaygroundPainterTopMenuEditCopy');
        painterTopMenuEditCopy.innerHTML = Lang.Painter.copy_file;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditCopy);

        const painterTopMenuEditCut = ce('div', 'RoCodePainterTopMenuEditCut');
        painterTopMenuEditCut.bindOnClick(() => {
            painter.cut();
        });
        painterTopMenuEditCut.addClass('RoCodePlaygroundPainterTopMenuEditCut');
        painterTopMenuEditCut.innerHTML = Lang.Painter.cut_picture;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditCut);

        const painterTopMenuEditPaste = ce('div', 'RoCodePainterTopMenuEditPaste');
        painterTopMenuEditPaste.bindOnClick(() => {
            painter.paste();
        });
        painterTopMenuEditPaste.addClass('RoCodePlaygroundPainterTopMenuEditPaste');
        painterTopMenuEditPaste.innerHTML = Lang.Painter.paste_picture;
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditPaste);

        const painterTopMenuEditEraseAll = ce('div', 'RoCodePainterTopMenuEditEraseAll');
        painterTopMenuEditEraseAll.addClass('RoCodePlaygroundPainterTopMenuEditEraseAll');
        painterTopMenuEditEraseAll.innerHTML = Lang.Painter.remove_all;
        painterTopMenuEditEraseAll.bindOnClick(() => {
            painter.lc.clear();
        });
        painterTopMenuEditDropdown.appendChild(painterTopMenuEditEraseAll);

        $(painterTopMenuFile).on('click tab', menuClickEvent);
        $(painterTopMenuEdit).on('click tab', menuClickEvent);
        $(document).on('click tap', (e) => {
            e.stopPropagation();
            $(painterTopMenuFile).removeClass('active');
            $(painterTopMenuEdit).removeClass('active');
        });

        const painterTopStageXY = ce('div', 'RoCodePainterTopStageXY');
        const RoCodePainterTopStageXYLabel = ce('span', 'RoCodePainterTopStageXYLabel');
        this.painterTopStageXY = RoCodePainterTopStageXYLabel;
        painterTopStageXY.addClass('RoCodePlaygroundPainterTopStageXY');
        RoCodePainterTopStageXYLabel.addClass('RoCodePainterTopStageXYLabel');
        painterTopStageXY.appendChild(RoCodePainterTopStageXYLabel);
        painterTop.appendChild(painterTopStageXY);

        RoCode.addEventListener('pictureSelected', this.changePicture.bind(this));

        function menuClickEvent(e) {
            $(painterTopMenuFile).removeClass('active');
            $(painterTopMenuEdit).removeClass('active');
            if (e.target === this) {
                e.stopImmediatePropagation();
                $(this).addClass('active');
            }
        }
    }

    stagemousemove(event) {
        this.painterTopStageXY.textContent = `x:${event.x.toFixed(1)}, y:${event.y.toFixed(1)}`;
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

    clear() {
        this.toggleFullscreen(false);
    }

    undo() {
        this.lc.undo();
    }

    redo() {
        if (this.lc.canRedo()) {
            this.lc.redo();
        }
    }
};
