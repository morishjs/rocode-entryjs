class PropertyPanel {
    public modes: any = {};
    public selected: string = undefined;

    private _view: RoCodeDom;
    private _tabView: RoCodeDom;
    private _contentView: RoCodeDom;
    private _cover: RoCodeDom & { _isVisible?: boolean };

    generateView(parentDom: HTMLElement) {
        const container = $(parentDom);
        this._view = RoCode.Dom('div', {
            class: 'propertyPanel',
            parent: container,
        });

        this._tabView = RoCode.Dom('div', {
            class: 'propertyTab',
            parent: this._view,
        });

        this._contentView = RoCode.Dom('div', {
            class: 'propertyContent',
            parent: this._view,
        });

        this._cover = RoCode.Dom('div', {
            classes: ['propertyPanelCover', 'RoCodeRemove'],
            parent: this._view,
        });

        const splitter = RoCode.Dom('div', {
            class: 'RoCodeObjectSelectedImgWorkspace',
            parent: container,
        });
        this._initializeSplitter(splitter);
    }

    addMode(mode: string, contentObj: any) {
        if (this.modes[mode]) {
            this.removeMode(mode);
        }

        let contentDom = contentObj.getView();
        // will be removed after apply new Dom class
        contentDom = RoCode.Dom(contentDom, {
            parent: this._contentView,
        });

        const tabDom = RoCode.Dom(`<div>${Lang.Menus[mode]}</div>`, {
            classes: ['propertyTabElement', `propertyTab${mode}`],
            parent: this._tabView,
        });
        tabDom.bind('click', () => {
            this.select(mode);
        });

        if (mode === 'console') {
            contentObj.codeMirror.refresh();
        }

        this._removeDom(mode);

        this.modes[mode] = {
            obj: contentObj,
            tabDom,
            contentDom,
        };

        if (mode === 'hw') {
            $('.propertyTabhw').bind('dblclick', () => {
                RoCode.dispatchEvent('hwModeChange');
            });
        }
    }

    removeMode(mode: string) {
        this._removeDom(mode);

        const keys = Object.keys(this.modes);
        if (keys && keys.length > 0) {
            this.select(keys[0]);
        }
    }

    resize(canvasSize: number) {
        const selected = this.selected;
        if (!selected) {
            return;
        }
        const canvasHeight = (canvasSize * 9) / 16;
        this._view.css({
            width: `${canvasSize}px`,
            top: `${canvasHeight + 35 + 40 + 48 - 22}px`,
        });
        if (canvasSize >= 430) {
            this._view.removeClass('collapsed');
        } else {
            this._view.addClass('collapsed');
        }

        RoCode.dispatchEvent('windowResized');

        const obj = this.modes[selected].obj;
        if (selected === 'hw') {
            if (this.modes.hw.obj.listPorts) {
                obj.resizeList();
            } else {
                obj.resize && obj.resize();
            }
        } else {
            obj.resize && obj.resize();
        }
    }

    select(modeName: string) {
        for (const key in this.modes) {
            const mode = this.modes[key];
            mode.tabDom.removeClass('selected');
            mode.contentDom.addClass('RoCodeRemove');
            $(mode.contentDom).detach();
            mode.obj.visible = false;
        }

        const selected = this.modes[modeName];
        $(this._contentView).append(selected.contentDom);
        selected.tabDom.addClass('selected');
        selected.contentDom.removeClass('RoCodeRemove');
        if (selected.obj.resize) {
            selected.obj.resize();
        }
        selected.obj.visible = true;
        this.selected = modeName;
    }

    private _initializeSplitter(splitter: RoCodeDom) {
        splitter.bind('mousedown touchstart', (e) => {
            e.preventDefault();
            if (RoCode.disposeEvent) {
                RoCode.disposeEvent.notify();
            }
            const container = RoCode.container;
            this._cover.removeClass('RoCodeRemove');
            this._cover._isVisible = true;
            container.splitterEnable = true;
            if (RoCode.documentMousemove) {
                container.resizeEvent = RoCode.documentMousemove.attach(this, (e: any) => {
                    if (container.splitterEnable) {
                        RoCode.resizeElement({
                            canvasWidth: e.clientX || e.x,
                        });
                    }
                });
            }
            $(document).bind('mouseup.container:splitter touchend.container:splitter', () => {
                const container = RoCode.container;
                const listener = container.resizeEvent;
                if (listener) {
                    container.splitterEnable = false;
                    listener.destroy();
                    delete container.resizeEvent;
                }
                if (this._cover._isVisible) {
                    this._cover._isVisible = false;
                    this._cover.addClass('RoCodeRemove');
                }
                $(document).unbind('.container:splitter');
            });
        });
    }

    private _removeDom(mode: string) {
        if (this.modes[mode]) {
            this.modes[mode].tabDom.remove();
            this.modes[mode].contentDom.remove();
            if (mode === 'hw') {
                $(this.modes).removeClass('.propertyTabhw');
                $('.propertyTabhw').unbind('dblclick');
            }
        }
    }
}

export default PropertyPanel;
RoCode.PropertyPanel = PropertyPanel;
