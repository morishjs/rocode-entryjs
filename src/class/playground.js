/**
 * Playground is block construct area.
 * @fileoverview This manage playground.
 */
'use strict';

import { Backpack, ColorPicker, Dropdown, Sortable } from '@RoCodelabs/tool';
import Toast from '../playground/toast';
import RoCodeEvent from '@RoCodelabs/event';
import { Destroyer } from '../util/destroyer/Destroyer';
import { saveAs } from 'file-saver';
import DataTable from './DataTable';

const RoCode = require('../RoCode');

/**
 * Class for a playground.
 * This manage all view related with block.
 * @constructor
 */
RoCode.Playground = class Playground {
    constructor() {
        this._destroyer = this._destroyer || new Destroyer();
        this._destroyer.destroy();
        this.isTextBGMode_ = false;
        this.dataTable = DataTable;

        /**
         * playground's current view type
         * View types are 'default', 'code', 'picture', 'text', sound'
         * @type {string}
         */
        this.viewMode_ = 'default';
        RoCode.addEventListener('textEdited', () => {
            this.injectText();
        });
        RoCode.addEventListener('commentVisibleChanged', this.toggleCommentButtonVisible.bind(this));

        RoCode.windowResized.attach(this, this.clearClientRectMemo.bind(this));
    }

    setMode(mode) {
        this.mainWorkspace.setMode(mode);
    }

    /**
     * Control bar view generator.
     * @param {!Element} playgroundView playgroundView from RoCode.
     * @param {?string} option for choose type of view.
     */
    generateView(playgroundView, option = 'workspace') {
        /** @type {!Element} */
        this.view_ = playgroundView;
        this.view_.addClass('RoCodePlayground');
        if (option === 'workspace' || option === 'playground') {
            this.view_.addClass('RoCodePlaygroundWorkspace');

            const tabView = RoCode.createElement('div', 'RoCodeCategoryTab')
                .addClass('RoCodePlaygroundTabWorkspace')
                .appendTo(this.view_);
            this.generateTabView(tabView);
            this.tabView_ = tabView;

            const tabButtonView = RoCode.createElement('div', 'RoCodeButtonTab')
                .addClass('RoCodePlaygroundButtonTabWorkspace')
                .appendTo(this.view_);
            this.tabButtonView_ = tabButtonView;
            this.createButtonTabView(tabButtonView);

            const curtainView = RoCode.createElement('div', 'RoCodeCurtain')
                .addClass('RoCodePlaygroundCurtainWorkspace RoCodeRemove')
                .appendTo(this.view_);
            curtainView.innerHTML = Lang.Workspace.cannot_edit_click_to_stop;
            curtainView.addEventListener('click', () => {
                RoCode.engine.toggleStop();
            });
            this.curtainView_ = curtainView;

            const pictureView = RoCode.createElement('div', 'RoCodePicture')
                .addClass('RoCodePlaygroundPictureWorkspace RoCodeRemove')
                .appendTo(this.view_);
            this.generatePictureView(pictureView);
            this.pictureView_ = pictureView;

            const pictureCurtainView = RoCode.createElement('div', 'RoCodePictureCurtain')
                .addClass('RoCodePlaygroundPictureCurtainWorkspace RoCodeRemove')
                .appendTo(pictureView);
            this.pictureCurtainView_ = pictureCurtainView;

            const pictureCurtainText = RoCode.createElement('span', 'RoCodePictureCurtainText')
                .addClass('RoCodePlaygroundPictureCurtainWorkspaceText')
                .appendTo(pictureCurtainView);
            pictureCurtainText.innerHTML = Lang.Workspace.add_object_before_edit;

            const textView = RoCode.createElement('div', 'RoCodeText')
                .addClass('RoCodePlaygroundTextWorkspace RoCodeRemove')
                .appendTo(this.view_);
            this.generateTextView(textView);
            this.textView_ = textView;

            const soundView = RoCode.createElement('div', 'RoCodeSound')
                .addClass('RoCodePlaygroundSoundWorkspace RoCodeRemove')
                .appendTo(this.view_);
            this.generateSoundView(soundView);
            this.soundView_ = soundView;

            const defaultView = RoCode.createElement('div', 'RoCodeDefault')
                .addClass('RoCodePlaygroundDefaultWorkspace')
                .appendTo(this.view_);
            this.generateDefaultView(defaultView);
            this.defaultView_ = defaultView;

            //Code view must be append at last.
            const codeView = RoCode.createElement('div', 'RoCodeCode')
                .addClass('RoCodePlaygroundCodeWorkspace RoCodeRemove')
                .appendTo(this.view_);
            this.generateCodeView(codeView);
            this.codeView_ = codeView;

            const backPackView = RoCode.createElement('div', 'RoCodeBackPackView')
                .addClass('RoCodePlaygroundBackPackView')
                .appendTo(this.view_);
            this.backPackView = backPackView;
            this.createBackPackView(backPackView);

            const resizeHandle = RoCode.createElement('div')
                .addClass('RoCodePlaygroundResizeWorkspace', 'RoCodeRemove')
                .appendTo(codeView);
            this.resizeHandle_ = resizeHandle;
            this.initializeResizeHandle(resizeHandle);

            /** @type {!Element} */
            this.codeView_ = codeView;

            RoCode.addEventListener('run', () => {
                RoCode.playground.curtainView_.removeClass('RoCodeRemove');
            });
            RoCode.addEventListener('stop', () => {
                RoCode.playground.curtainView_.addClass('RoCodeRemove');
            });
            this.applyTabOption();
        }
    }

    /**
     * Generate default view.
     * default view is shown when object is not selected.
     * @param {!Element} defaultView
     * @return {Element}
     */
    generateDefaultView(defaultView) {
        return defaultView;
    }

    /**
     * generate tab menus
     * @param {!Element} tabView
     * @return {Element}
     */
    generateTabView(tabView) {
        const that = this;
        const tabList = RoCode.createElement('ul').addClass('RoCodeTabListWorkspace');
        this.tabList_ = tabList;
        tabView.appendChild(tabList);

        this.tabViewElements = {};
        const codeTab = RoCode.createElement('li', 'RoCodeCodeTab')
            .addClass('RoCodeTabListItemWorkspace RoCodeTabSelected')
            .bindOnClick(() => {
                RoCode.do('playgroundChangeViewMode', 'code', that.selectedViewMode);
            })
            .appendTo(tabList);
        codeTab.innerHTML = Lang.Workspace.tab_code;
        this.tabViewElements.code = codeTab;
        this._codeTab = codeTab;

        const pictureTab = RoCode.createElement('li', 'RoCodePictureTab')
            .addClass('RoCodeTabListItemWorkspace')
            .bindOnClick(() => {
                RoCode.do('playgroundChangeViewMode', 'picture', that.selectedViewMode);
            })
            .appendTo(tabList);
        pictureTab.innerHTML = Lang.Workspace.tab_picture;
        this.tabViewElements.picture = pictureTab;
        this.pictureTab = pictureTab;

        const textboxTab = RoCode.createElement('li', 'RoCodeTextboxTab')
            .addClass('RoCodeTabListItemWorkspace RoCodeRemove')
            .appendTo(tabList)
            .bindOnClick(() => {
                RoCode.do('playgroundChangeViewMode', 'text', that.selectedViewMode);
            });
        textboxTab.innerHTML = Lang.Workspace.tab_text;
        this.tabViewElements.text = textboxTab;
        this.textboxTab = textboxTab;

        const soundTab = RoCode.createElement('li', 'RoCodeSoundTab')
            .addClass('RoCodeTabListItemWorkspace')
            .appendTo(tabList)
            .bindOnClick(() => {
                RoCode.do('playgroundChangeViewMode', 'sound', that.selectedViewMode);
            });
        soundTab.innerHTML = Lang.Workspace.tab_sound;
        this.tabViewElements.sound = soundTab;
        this.soundTab = soundTab;

        const variableTab = RoCode.createElement('li', 'RoCodeVariableTab')
            .addClass('RoCodeTabListItemWorkspace RoCodeVariableTabWorkspace')
            .appendTo(tabList)
            .bindOnClick(() => {
                RoCode.do('playgroundChangeViewMode', 'variable', that.selectedViewMode);
            });
        variableTab.innerHTML = Lang.Workspace.tab_attribute;
        this.tabViewElements.variable = variableTab;
        this.variableTab = variableTab;
    }

    createButtonTabView(tabButtonView) {
        const { options = {} } = RoCode;
        const { commentDisable, backpackDisable } = options;

        if (!commentDisable) {
            const commentToggleButton = RoCode.createElement('div')
                .addClass('RoCodePlaygroundCommentButtonWorkspace showComment')
                .appendTo(tabButtonView);
            commentToggleButton.setAttribute('alt', Lang.Blocks.show_all_comment);
            commentToggleButton.setAttribute('title', Lang.Blocks.show_all_comment);

            this.commentToggleButton_ = commentToggleButton;
            commentToggleButton.bindOnClick(() => {
                this.toggleCommentButton();
            });
        }

        // TODO: 백팩(나의보관함) 숨김처리
        if (!backpackDisable) {
            const backPackButton = RoCode.createElement('div')
                .addClass('RoCodePlaygroundBackPackButtonWorkspace')
                .appendTo(tabButtonView);
            backPackButton.setAttribute('alt', Lang.Workspace.my_storage);
            backPackButton.setAttribute('title', Lang.Workspace.my_storage);

            this.backPackButton_ = backPackButton;
            backPackButton.bindOnClick(() => {
                RoCode.dispatchEvent('openBackPack');
            });
        }
    }

    createBackPackView(backPackView) {
        this.backPack = new Backpack({
            isShow: false,
            data: {
                items: [],
                onClose: () => {
                    RoCode.dispatchEvent('closeBackPack');
                },
                onRemoveItem: (id) => {
                    RoCode.dispatchEvent('removeBackPackItem', id);
                },
                onChangeTitle: (id, title) => {
                    RoCode.dispatchEvent('changeBackPackTitle', id, title);
                },
                onCustomDragEnter: ({ type, value, onDragEnter }) => {
                    if (RoCode.GlobalSvg.isShow && RoCode.GlobalSvg.canAddStorageBlock) {
                        const { _view = {} } = RoCode.GlobalSvg;
                        onDragEnter({
                            type: 'block',
                            value: _view,
                        });
                    } else if (RoCode.container.isObjectDragging) {
                        onDragEnter({
                            type: 'object',
                            value: RoCode.container.dragObjectKey,
                        });
                    }
                },
                onDropItem: ({ type, value }) => {
                    if (type === 'object') {
                        const object = RoCode.container.getObject(value);
                        object.addStorage();
                    } else if (type === 'block') {
                        if (value.addStorage) {
                            value.addStorage();
                        }
                    }
                },
            },
            container: this.backPackView,
        });
        this.blockBackPackArea = RoCode.Dom('div')
            .addClass('blockBackPackDrop')
            .appendTo(backPackView);
        this.objectBackPackArea = RoCode.Dom('div')
            .addClass('objectBackPackDrop')
            .appendTo(backPackView);
        const icon = RoCode.Dom('div', {
            class: 'blockBackPackIcon',
        });
        const desc = RoCode.Dom('div', {
            class: 'blockBackPackDesc',
            text: Lang.Workspace.playground_block_drop,
        });
        const desc2 = RoCode.Dom('div', {
            class: 'objectBackPackDesc',
            text: Lang.Workspace.container_object_drop,
        });
        this.blockBackPackArea.append(icon);
        this.blockBackPackArea.append(desc);
        this.objectBackPackArea.append(icon.clone());
        this.objectBackPackArea.append(desc2);

        const { view: blockView } = this.board || {};
        if (blockView) {
            const dom = blockView[0];
            const eventDom = new RoCodeEvent(dom);
            this.blockBackPackEvent = eventDom;
            const areaDom = new RoCodeEvent(this.blockBackPackArea[0]);
            this.blockBackPackAreaEvent = areaDom;
            areaDom.on('dropitem', (e) => {
                const data = this.backPack.getData('data');
                RoCode.dispatchEvent('addBackPackToRoCode', 'block', data);
                this.blockBackPackArea.css({
                    display: 'none',
                });
            });
            eventDom.on('enteritem', () => {
                const isDragging = this.backPack.getData('isDragging');
                const type = this.backPack.getData('dragType');
                if (isDragging && type === 'block') {
                    const { width, height, top, left } = blockView[0].getBoundingClientRect();
                    this.blockBackPackArea.css({
                        width: width - 134,
                        height,
                        top,
                        left,
                        display: 'flex',
                    });
                }
            });
            areaDom.on('leaveitem', (e) => {
                this.blockBackPackArea.css({
                    display: 'none',
                });
            });
        }

        const { modes = {} } = RoCode.propertyPanel || {};
        const { object = {} } = modes;
        const { contentDom: objectView } = object;
        if (objectView) {
            const dom = objectView[0];
            const eventDom = new RoCodeEvent(dom);
            this.objectBackPackEvent = eventDom;
            const areaDom = new RoCodeEvent(this.objectBackPackArea[0]);
            this.objectBackPackAreaEvent = areaDom;

            areaDom.on('dropitem', (e) => {
                const data = this.backPack.getData('data');
                RoCode.dispatchEvent('addBackPackToRoCode', 'object', data);
                this.objectBackPackArea.css({
                    display: 'none',
                });
            });

            eventDom.on('enteritem', () => {
                const isDragging = this.backPack.getData('isDragging');
                const type = this.backPack.getData('dragType');
                if (isDragging && type === 'object') {
                    const { width, height, top, left } = objectView[0].getBoundingClientRect();
                    this.objectBackPackArea.css({
                        width,
                        height,
                        top,
                        left,
                        display: 'flex',
                    });
                }
            });

            areaDom.on('leaveitem', (e) => {
                this.objectBackPackArea.css({
                    display: 'none',
                });
            });
        }

        const globalEvent = new RoCodeEvent(document);
        globalEvent.data = {};
        this.globalEvent = globalEvent;

        this.backPack.on('onChangeDragging', (isDragging) => {
            if (isDragging) {
                globalEvent.off().on(
                    'touchmove.itemdrag mousemove.itemdrag',
                    (e) => {
                        const isDragging = this.backPack.getData('isDragging');
                        if (isDragging) {
                            const point = RoCode.Utils.getPosition(e);
                            const { data } = globalEvent;
                            const { dom: objectDom } = this.objectBackPackEvent;
                            const { dom: blockDom } = this.blockBackPackEvent;
                            const objectRect = this.getBoundingClientRectMemo(objectDom);
                            const blockRect = this.getBoundingClientRectMemo(blockDom, {
                                width: -134,
                                right: -134,
                            });
                            if (
                                !data.isObjectMouseEnter &&
                                RoCode.Utils.isPointInRect(point, objectRect)
                            ) {
                                data.isObjectMouseEnter = true;
                                this.objectBackPackEvent.trigger('enteritem');
                            } else if (
                                data.isObjectMouseEnter &&
                                !RoCode.Utils.isPointInRect(point, objectRect)
                            ) {
                                data.isObjectMouseEnter = false;
                                this.objectBackPackAreaEvent.trigger('leaveitem');
                            }
                            if (RoCode.getMainWS().mode === RoCode.Workspace.MODE_BOARD) {
                                if (
                                    !data.isBlockMouseEnter &&
                                    RoCode.Utils.isPointInRect(point, blockRect)
                                ) {
                                    data.isBlockMouseEnter = true;
                                    this.blockBackPackEvent.trigger('enteritem');
                                } else if (
                                    data.isBlockMouseEnter &&
                                    !RoCode.Utils.isPointInRect(point, blockRect)
                                ) {
                                    data.isBlockMouseEnter = false;
                                    this.blockBackPackAreaEvent.trigger('leaveitem');
                                }
                            }
                        } else {
                            this.objectBackPackAreaEvent.trigger('leaveitem');
                            this.blockBackPackAreaEvent.trigger('leaveitem');
                        }
                    },
                    { passive: false }
                );
            } else {
                globalEvent.off();
            }
        });

        this.backPack.data = {
            draggableOption: {
                lockAxis: 'y',
                distance: 30,
                onDropItem: (e) => {
                    const { data } = globalEvent;
                    if (data.isObjectMouseEnter) {
                        data.isObjectMouseEnter = false;
                        this.objectBackPackAreaEvent.trigger('dropitem');
                    } else if (data.isBlockMouseEnter) {
                        data.isBlockMouseEnter = false;
                        this.blockBackPackAreaEvent.trigger('dropitem');
                    }
                },
            },
        };
    }

    setBackpackPointEvent(canPointEvent) {
        this.backPack.data = {
            canPointEvent,
        };
    }

    getBoundingClientRectMemo = _.memoize((target, offset = {}) => {
        const rect = target.getBoundingClientRect();
        const result = {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
        };
        Object.keys(offset).forEach((key) => {
            result[key] += offset[key];
        });
        return result;
    });

    clearClientRectMemo() {
        this.getBoundingClientRectMemo.cache = new _.memoize.Cache();
    }

    showBackPack(args) {
        this.backPack.setData({ ...args });
        this.backPack.show();
        this.backPackView.removeClass('RoCodeRemove');
    }

    hideBackPack() {
        this.backPack.hide();
        this.backPackView.addClass('RoCodeRemove');
    }

    toggleCommentButton() {
        if (this.board.isVisibleComment) {
            this.toast.show(Lang.Blocks.hide_all_comment);
            RoCode.do('hideAllComment', this.board);
        } else {
            this.toast.show(Lang.Blocks.show_all_comment);
            RoCode.do('showAllComment', this.board);
        }
        this.toggleCommentButtonVisible();
    }

    toggleCommentButtonVisible() {
        const button = this.commentToggleButton_;

        if (this.board.isVisibleComment) {
            button.addClass('showComment');
            button.setAttribute('alt', Lang.Blocks.show_all_comment);
            button.setAttribute('title', Lang.Blocks.show_all_comment);
        } else {
            button.removeClass('showComment');
            button.setAttribute('alt', Lang.Blocks.hide_all_comment);
            button.setAttribute('title', Lang.Blocks.hide_all_comment);
        }
    }

    /**
     * Inject and generate code view
     * @param {!Element} codeView
     * @return {Element}
     */
    generateCodeView(codeView) {
        const variableView = this.createVariableView();
        codeView.appendChild(variableView);
        this.variableView_ = variableView;

        codeView = RoCode.Dom(codeView);
        const boardView = RoCode.Dom('div', {
            parent: codeView,
            id: 'RoCodeWorkspaceBoard',
            class: 'RoCodeWorkspaceBoard',
        });

        const blockMenuView = RoCode.Dom('div', {
            parent: codeView,
            id: 'RoCodeWorkspaceBlockMenu',
            class: 'RoCodeWorkspaceBlockMenu',
        });

        const initOpts = {
            blockMenu: {
                dom: blockMenuView,
                align: 'LEFT',
                categoryData: RoCodeStatic.getAllBlocks(),
                scroll: true,
            },
            board: {
                dom: boardView,
            },
            readOnly: RoCode.readOnly,
        };
        if (RoCode.textCodingEnable) {
            initOpts.vimBoard = { dom: boardView };
        }

        this.mainWorkspace = new RoCode.Workspace(initOpts);
        this.blockMenu = this.mainWorkspace.blockMenu;
        this.board = this.mainWorkspace.board;
        this.toast = new Toast(this.board);
        this.blockMenu.banClass('checker');
        RoCode.expansion.banAllExpansionBlock();
        RoCode.aiUtilize.banAllAIUtilizeBlock();
        DataTable.banAllBlock();
        RoCode.aiLearning.banBlocks();
        this.vimBoard = this.mainWorkspace.vimBoard;

        this._destroyer.add(this.mainWorkspace);
        this._destroyer.add(this.toast);

        if (RoCode.hw) {
            RoCode.hw.refreshHardwareBlockMenu();
        }
    }

    /**
     * Generate picture view.
     * @param {!Element} pictureView
     * @return {Element}
     */
    generatePictureView(PictureView) {
        if (RoCode.type === 'workspace') {
            const pictureAdd = RoCode.createElement('div', 'RoCodeAddPicture')
                .addClass('RoCodePlaygroundAddPicture')
                .appendTo(PictureView);

            const innerPictureAdd = RoCode.createElement('div', 'RoCodeAddPictureInner')
                .addClass('RoCodePlaygroundAddPictureInner')
                .bindOnClick(() => {
                    if (!RoCode.container || RoCode.container.isSceneObjectsExist()) {
                        RoCode.do('playgroundClickAddPicture');
                    } else {
                        RoCode.toast.alert(
                            Lang.Workspace.add_object_alert,
                            Lang.Workspace.add_object_alert_msg
                        );
                    }
                })
                .appendTo(pictureAdd);
            innerPictureAdd.innerHTML = Lang.Workspace.picture_add;
            this._pictureAddButton = innerPictureAdd;

            this.pictureListView_ = RoCode.createElement('ul', 'RoCodePictureList')
                .addClass('RoCodePlaygroundPictureList')
                .appendTo(PictureView);

            const painterDom = RoCode.createElement('div', 'RoCodePainter')
                .addClass('RoCodePlaygroundPainter')
                .appendTo(PictureView);

            switch (RoCode.paintMode) {
                case 'RoCode-paint':
                    this.painter = new RoCode.Painter(painterDom);
                    break;
                case 'literallycanvas':
                    this.painter = new RoCode.LiterallycanvasPainter(painterDom);
                    break;
            }
        }
    }

    initSortablePictureWidget() {
        if (this.pictureSortableListWidget) {
            return;
        }

        this.pictureSortableListWidget = new Sortable({
            data: {
                height: '100%',
                sortableTarget: ['RoCodePlaygroundPictureThumbnail'],
                lockAxis: 'y',
                items: this._getSortablePictureList(),
            },
            container: this.pictureListView_,
        }).on('change', ([newIndex, oldIndex]) => {
            RoCode.playground.movePicture(newIndex, oldIndex);
        });
    }

    updatePictureView() {
        if (this.pictureSortableListWidget) {
            this.pictureSortableListWidget.setData({
                items: this._getSortablePictureList(),
            });
        }
        this.reloadPlayground();
    }

    _getSortablePictureList() {
        if (!this.object || !this.object.pictures) {
            return [];
        }
        const id = this.object.id;
        return this.object.pictures.map((value) => ({
            key: `${id}-${value.id}`,
            item: value.view,
        }));
    }

    /**
     * Generate text view.
     * @param {!Element} textView
     * @return {Element}
     */
    generateTextView(textView) {
        const that = this;
        const wrap = RoCode.createElement('div')
            .addClass('write_box')
            .appendTo(textView);
        const writeSet = RoCode.createElement('div').addClass('write_set');
        const inputArea = RoCode.createElement('div').addClass('input_box');
        wrap.appendChild(writeSet);
        wrap.appendChild(inputArea);

        //write set 글 속성 탭
        const fontSelect = RoCode.createElement('div').addClass('pop_selectbox');
        const fontLink = RoCode.createElement('a', 'RoCodeTextBoxAttrFontName').addClass(
            'select_link imico_pop_select_arr_down'
        );

        fontLink.bindOnClick(() => {
            const options = RoCodeStatic.fonts
                .filter((font) => font.visible)
                .map((font) => [font.name, font, font.style]);
            fontLink.addClass('imico_pop_select_arr_up');
            fontLink.removeClass('imico_pop_select_arr_down');
            this.openDropDown(
                options,
                fontLink,
                (value) => {
                    let font = value[1];
                    let textValue = textEditInput.value;
                    if (that.object.entity.getLineBreak()) {
                        textValue = textEditArea.value;
                    }
                    const { options = {} } = RoCode;
                    const { textOptions = {} } = options;
                    const { hanjaEnable } = textOptions;
                    if (!hanjaEnable) {
                        if (/[\u4E00-\u9FFF]/.exec(textValue) != null) {
                            font = options[0][1];
                            RoCodelms.alert(Lang.Menus.not_supported_text);
                        }
                    }
                    fontLink.innerText = font.name;
                    this.textEditArea.style.fontFamily = font.family;
                    this.textEditInput.style.fontFamily = font.family;
                    $('#RoCodeTextBoxAttrFontName').data('font', font);
                    this.object.entity.setFontType(font.family);
                },
                () => {
                    fontLink.removeClass('imico_pop_select_arr_up');
                    fontLink.addClass('imico_pop_select_arr_down');
                }
            );
        });
        fontSelect.appendChild(fontLink);
        writeSet.appendChild(fontSelect);

        //스타일 박스
        const alignBox = RoCode.createElement('div').addClass('font_style_box');
        writeSet.appendChild(alignBox);

        const alignLeft = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_align_left')
            .bindOnClick(() => {
                RoCode.playground.setFontAlign(RoCode.TEXT_ALIGN_LEFT);
            });
        alignLeft.setAttribute('title', Lang.Workspace.align_left);
        alignBox.appendChild(alignLeft);
        this.alignLeftBtn = alignLeft;
        const alignMiddle = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_align_middle')
            .bindOnClick(() => {
                RoCode.playground.setFontAlign(RoCode.TEXT_ALIGN_CENTER);
            });
        alignMiddle.setAttribute('title', Lang.Workspace.align_center);
        alignBox.appendChild(alignMiddle);
        this.alignCenterBtn = alignMiddle;
        const alignRight = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_align_right')
            .bindOnClick(() => {
                RoCode.playground.setFontAlign(RoCode.TEXT_ALIGN_RIGHT);
            });
        alignRight.setAttribute('title', Lang.Workspace.align_right);
        alignBox.appendChild(alignRight);
        this.alignRightBtn = alignRight;

        const styleBox = RoCode.createElement('div').addClass('font_style_box');
        writeSet.appendChild(styleBox);

        const bold = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_bold')
            .bindOnClick((e) => {
                $(e.currentTarget).toggleClass('on');
                RoCode.playground.object.entity.toggleFontBold();
                $(this.textEditArea).toggleClass('bold');
                $(this.textEditInput).toggleClass('bold');
            });
        bold.setAttribute('title', Lang.Workspace.bold);
        styleBox.appendChild(bold);

        const underLine = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_underline')
            .bindOnClick((e) => {
                const underLineState = !RoCode.playground.object.entity.getUnderLine() || false;
                $(e.currentTarget).toggleClass('on');
                RoCode.playground.object.entity.setUnderLine(underLineState);

                const effect = `${underLineState ? 'underline' : ''} ${
                    RoCode.playground.object.entity.getStrike() ? 'line-through' : ''
                }`.trim();
                this.textEditArea.style.textDecoration = effect;
                this.textEditInput.style.textDecoration = effect;
            });
        underLine.setAttribute('title', Lang.Workspace.font_underline);
        styleBox.appendChild(underLine);

        const italic = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_italic')
            .bindOnClick((e) => {
                $(e.currentTarget).toggleClass('on');
                RoCode.playground.object.entity.toggleFontItalic();
                $(this.textEditArea).toggleClass('italic');
                $(this.textEditInput).toggleClass('italic');
            });
        italic.setAttribute('title', Lang.Workspace.font_tilt);
        styleBox.appendChild(italic);

        const through = RoCode.createElement('a')
            .addClass('style_link imbtn_pop_font_through')
            .bindOnClick((e) => {
                $(e.currentTarget).toggleClass('on');
                const strikeState = !RoCode.playground.object.entity.getStrike() || false;
                RoCode.playground.object.entity.setStrike(strikeState);

                const effect = `${strikeState ? 'line-through' : ''} ${
                    RoCode.playground.object.entity.getUnderLine() ? 'underline' : ''
                }`.trim();
                this.textEditArea.style.textDecoration = effect;
                this.textEditInput.style.textDecoration = effect;
            });
        through.setAttribute('title', Lang.Workspace.font_cancel);
        styleBox.appendChild(through);

        const color = RoCode.createElement('a').addClass('imbtn_pop_font_color');
        color.appendChild(RoCode.createElement('em'));
        color.bindOnClick(() =>
            this.openColourPicker(
                color,
                this.object.entity.getColour(),
                false,
                this.setTextColour.bind(this)
            )
        );
        color.setAttribute('title', Lang.Workspace.font_color);
        styleBox.appendChild(color);

        const backgroundColor = RoCode.createElement('a').addClass('imbtn_pop_font_backgroundcolor');
        backgroundColor.setAttribute('title', Lang.Workspace.font_fill);
        backgroundColor.appendChild(RoCode.createElement('em'));
        backgroundColor.bindOnClick(() =>
            this.openColourPicker(
                backgroundColor,
                this.object.entity.getBGColour(),
                true,
                this.setBackgroundColour.bind(this)
            )
        );
        styleBox.appendChild(backgroundColor);

        const writeTypeBox = RoCode.createElement('div').addClass('write_type_box');
        const singleLine = RoCode.createElement('a');
        singleLine.innerText = Lang.Buttons.single_line;
        singleLine.bindOnClick(() => RoCode.playground.toggleLineBreak(false));
        const multiLine = RoCode.createElement('a');
        multiLine.innerText = Lang.Buttons.multi_line;
        multiLine.bindOnClick(() => RoCode.playground.toggleLineBreak(true));
        writeTypeBox.appendChild(singleLine);
        writeTypeBox.appendChild(multiLine);
        inputArea.appendChild(writeTypeBox);

        //글자 크기 조절 슬라이드.
        const fontSizeWrapper = RoCode.createElement('div').addClass(
            'RoCodePlaygroundFontSizeWrapper multi'
        );
        inputArea.appendChild(fontSizeWrapper);
        this.fontSizeWrapper = fontSizeWrapper;

        const fontSizeLabel = RoCode.createElement('div').addClass('RoCodePlaygroundFontSizeLabel');
        fontSizeLabel.innerHTML = Lang.General.font_size;
        fontSizeWrapper.appendChild(fontSizeLabel);

        const fontSizeSlider = RoCode.createElement('div').addClass('RoCodePlaygroundFontSizeSlider');
        fontSizeWrapper.appendChild(fontSizeSlider);

        const fontSizeIndiciator = RoCode.createElement('div').addClass(
            'RoCodePlaygroundFontSizeIndicator'
        );
        fontSizeSlider.appendChild(fontSizeIndiciator);
        this.fontSizeIndiciator = fontSizeIndiciator;

        const fontSizeKnob = RoCode.createElement('div').addClass('RoCodePlaygroundFontSizeKnob');
        fontSizeSlider.appendChild(fontSizeKnob);
        this.fontSizeKnob = fontSizeKnob;

        $(fontSizeKnob).bind('mousedown.fontKnob touchstart.fontKnob', () => {
            const resizeOffset = $(fontSizeSlider).offset().left;

            const doc = $(document);
            doc.bind('mousemove.fontKnob touchmove.fontKnob', onMouseMove);
            doc.bind('mouseup.fontKnob touchend.fontKnob', onMouseUp);

            function onMouseMove(e) {
                let x = e.pageX;
                if (!x) {
                    x = e.originalEvent.touches[0].pageX;
                }
                let left = x - resizeOffset;
                left = Math.max(left, 5);
                left = Math.min(left, 136);
                fontSizeKnob.style.left = `${left}px`;
                left /= 1.36;
                fontSizeIndiciator.style.width = `${left}%`;
                RoCode.playground.object.entity.setFontSize(left);
            }

            function onMouseUp() {
                $(document).unbind('.fontKnob');
            }
        });

        const inputInner = RoCode.createElement('div').addClass('input_inner');
        inputArea.appendChild(inputInner);

        const textEditInput = RoCode.createElement('input').addClass(
            'RoCodePlayground_textBox single'
        );
        textEditInput.type = 'text';
        textEditInput.placeholder = Lang.Workspace.textbox_input;
        const textChangeApply = function() {
            const object = RoCode.playground.object;
            const entity = object.entity;
            const selected = $('#RoCodeTextBoxAttrFontName').data('font');
            const defaultFont = RoCodeStatic.fonts[0];
            const { options = {} } = RoCode;
            const { textOptions = {} } = options;
            const { hanjaEnable } = textOptions;
            if (
                !hanjaEnable &&
                (selected.family === 'Nanum Pen Script' || selected.family === 'Jeju Hallasan')
            ) {
                if (/[\u4E00-\u9FFF]/.exec(this.value) != null) {
                    $('#RoCodeTextBoxAttrFontName').text(defaultFont.name);
                    entity.setFontType(defaultFont.family);
                    RoCodelms.alert(Lang.Menus.not_supported_text);
                }
            }
            object.setText(this.value);
            entity.setText(this.value);
        };
        textEditInput.onkeyup = textChangeApply;
        textEditInput.onchange = textChangeApply;

        textEditInput.addEventListener('focusin', () => {
            textEditInput.prevText = textEditInput.value;
        });
        textEditInput.onblur = function() {
            if (textEditInput.value !== textEditInput.prevText) {
                RoCode.do('editText', textEditInput.value, textEditInput.prevText);
            }
            // RoCode.dispatchEvent('textEdited');
        };
        this.textEditInput = textEditInput;
        inputInner.appendChild(textEditInput);

        const textEditArea = RoCode.createElement('textarea');
        textEditArea.placeholder = Lang.Workspace.textbox_input;
        textEditArea.addClass('RoCodePlayground_textArea multi');
        textEditArea.style.display = 'none';
        textEditArea.onkeyup = textChangeApply;
        textEditArea.onchange = textChangeApply;

        textEditArea.addEventListener('focusin', () => {
            textEditArea.prevText = textEditArea.value;
        });
        textEditArea.onblur = function() {
            if (textEditArea.value !== textEditArea.prevText) {
                RoCode.do('editText', textEditArea.value, textEditArea.prevText);
            }
        };
        this.textEditArea = textEditArea;
        inputInner.appendChild(textEditArea);

        const singleDesc = RoCode.createElement('ul').addClass('list single');
        singleDesc.appendChild(RoCode.createElement('li').text(Lang.Menus.linebreak_off_desc_1));
        singleDesc.appendChild(RoCode.createElement('li').text(Lang.Menus.linebreak_off_desc_2));
        singleDesc.appendChild(RoCode.createElement('li').text(Lang.Menus.linebreak_off_desc_3));

        const multiDesc = RoCode.createElement('ul').addClass('list multi');
        multiDesc.appendChild(RoCode.createElement('li').text(Lang.Menus.linebreak_on_desc_1));
        multiDesc.appendChild(RoCode.createElement('li').text(Lang.Menus.linebreak_on_desc_2));
        multiDesc.appendChild(RoCode.createElement('li').text(Lang.Menus.linebreak_on_desc_3));

        inputArea.appendChild(singleDesc);
        inputArea.appendChild(multiDesc);
    }

    /**
     * 소리 편집 기능 신규 개발시 해당 로직 삭제
     * @private
     */
    _createSoundEditView() {
        const soundEditView = RoCode.createElement('div', 'RoCodeSoundEdit').addClass(
            'RoCodePlaygroundSoundEdit'
        );

        const tempNotificationWrapper = RoCode.createElement('div').addClass(
            'RoCodePlaygroundSoundEditWrapper'
        );

        const tempImage = RoCode.createElement('div').addClass('RoCodePlaygroundSoundEditImage');

        const tempNotification = RoCode.createElement('span').addClass(
            'RoCodePlaygroundSoundEditText'
        );
        tempNotification.innerHTML = Lang.Menus.sound_edit_warn;

        tempNotificationWrapper.appendChild(tempImage);
        tempNotificationWrapper.appendChild(tempNotification);

        soundEditView.appendChild(tempNotificationWrapper);

        return soundEditView;
    }

    /**
     * Generate sound view.
     * default view is shown when object is not selected.
     * @return {Element}
     * @param soundView
     */
    generateSoundView(soundView) {
        if (RoCode.type === 'workspace') {
            const soundAdd = RoCode.createElement('div', 'RoCodeAddSound');
            soundAdd.addClass('RoCodePlaygroundAddSound');
            const innerSoundAdd = RoCode.createElement('div', 'RoCodeAddSoundInner').addClass(
                'RoCodePlaygroundAddSoundInner'
            );
            innerSoundAdd.bindOnClick(() => {
                if (!RoCode.container || RoCode.container.isSceneObjectsExist()) {
                    RoCode.do('playgroundClickAddSound');
                } else {
                    RoCode.toast.alert(
                        Lang.Workspace.add_object_alert,
                        Lang.Workspace.add_object_alert_msg
                    );
                }
            });
            innerSoundAdd.innerHTML = Lang.Workspace.sound_add;
            soundAdd.appendChild(innerSoundAdd);
            soundView.appendChild(soundAdd);
            const soundList = RoCode.createElement('ul', 'RoCodeSoundList').addClass(
                'RoCodePlaygroundSoundList'
            );

            soundView.appendChild(soundList);
            this.soundListView_ = soundList;
            this._soundAddButton = innerSoundAdd;

            const soundEditView = this._createSoundEditView();
            soundView.appendChild(soundEditView);
        }
    }

    initSortableSoundWidget() {
        if (this.soundSortableListWidget) {
            return;
        }

        this.soundSortableListWidget = new Sortable({
            data: {
                height: '100%',
                sortableTarget: ['RoCodePlaygroundSoundThumbnail'],
                lockAxis: 'y',
                items: this._getSortableSoundList(),
            },
            container: this.soundListView_,
        }).on('change', ([newIndex, oldIndex]) => {
            RoCode.playground.moveSound(newIndex, oldIndex);
        });
    }

    updateSoundsView() {
        if (this.soundSortableListWidget) {
            this.soundSortableListWidget.setData({
                items: this._getSortableSoundList(),
            });
        }
        this.reloadPlayground();
    }

    _getSortableSoundList() {
        if (!this.object || !this.object.sounds) {
            return [];
        }
        const id = this.object.id;
        return this.object.sounds.map((value) => ({
            key: `${id}-${value.id}`,
            item: value.view,
        }));
    }

    /**
     * Inject object
     * @param {?RoCode.RoCodeObject} object
     */
    injectObject(object) {
        /** @type {RoCode.RoCodeobject} */
        if (!object) {
            this.object = null; //[박봉배-2018.11.12] - 아래 위치에 있으면 죽은 object의 메서드를 호출함. 그래서 위로 올림.
            this.changeViewMode('code');
            return;
        }
        if (object === this.object) {
            return;
        }

        this.object = object;

        const objectType = object.objectType;
        this.setMenu(objectType);

        this.injectCode();

        const { text: textTab, picture: pictureTab } = this.tabViewElements;
        if (objectType === 'sprite' && RoCode.pictureEditable) {
            if (textTab) {
                textTab.addClass('RoCodeRemove');
            }
            if (pictureTab) {
                pictureTab.removeClass('RoCodeRemove');
            }
        } else if (objectType === 'textBox') {
            if (pictureTab) {
                pictureTab.addClass('RoCodeRemove');
            }
            if (textTab) {
                textTab.removeClass('RoCodeRemove');
            }
        }

        const viewMode = this.viewMode_;
        if (viewMode === 'default') {
            this.changeViewMode('code');
        } else if (viewMode === 'variable') {
            this.changeViewMode('variable');
        } else if ((viewMode === 'picture' || viewMode === 'text') && objectType === 'textBox') {
            this.changeViewMode('text');
        } else if ((viewMode === 'text' || viewMode === 'picture') && objectType === 'sprite') {
            this.changeViewMode('picture');
        } else if (viewMode === 'sound') {
            this.changeViewMode('sound');
        }

        _.result(this.blockMenu, 'clearRendered');
        this.reloadPlayground();
    }

    /**
     * Inject object
     * @param {?RoCode.RoCodeObject} object
     */
    injectEmptyObject() {
        this.object = null;
    }

    /**
     * Inject code
     */
    injectCode() {
        const workspace = RoCode.getMainWS();
        if (!workspace) {
            return;
        }

        const object = this.object;
        const vimBoard = workspace.vimBoard;

        if (vimBoard && RoCode.textCodingEnable && !vimBoard._parser._onError) {
            vimBoard._changedObject = object;
            vimBoard._currentScene = object.scene;
        }

        const board = workspace.getBoard();
        const engine = RoCode.engine;
        workspace.changeBoardCode(
            object.script,
            engine && engine.isState('run') ? undefined : board.adjustThreadsPosition.bind(board)
        );
    }

    /**
     * Inject picture
     */
    injectPicture(isSelect = true) {
        const view = this.pictureListView_;
        if (!view) {
            return;
        }

        if (!this.object) {
            this.painter.lc && this.painter.lc.pointerDown();
            delete RoCode.stage.selectedObject;
            RoCode.dispatchEvent('pictureSelected');
        } else {
            (this.object.pictures || []).forEach((picture, i) => {
                !picture.view && RoCode.playground.generatePictureElement(picture);
                const element = picture.view;
                element.orderHolder.innerHTML = i + 1;
            });

            isSelect && this.selectPicture(this.object.selectedPicture);
        }

        this.updatePictureView();
    }

    /**
     * Add picture
     * @param {picture model} picture
     */
    addPicture(picture, isNew, isSelect = true) {
        const tempPicture = _.clone(picture);

        if (isNew === true) {
            delete tempPicture.id;
        }
        delete tempPicture.view;

        picture = RoCode.Utils.copy(tempPicture);
        if (!picture.id) {
            picture.id = RoCode.generateHash();
        }

        picture.name = RoCode.getOrderedName(picture.name, this.object.pictures);

        this.generatePictureElement(picture);

        RoCode.do('objectAddPicture', picture.objectId || this.object.id, picture, isSelect);
    }

    /**
     * set picture
     * @param {picture}
     */
    setPicture(picture) {
        const element = RoCode.container.getPictureElement(picture.id, picture.objectId);
        const $element = $(element);
        if (element) {
            picture.view = element;
            element.picture = picture;

            const thumbnailView = $element.find(`#t_${picture.id}`)[0];
            if (picture.fileurl) {
                thumbnailView.style.backgroundImage = `url("${picture.fileurl}")`;
            } else {
                // deprecated
                const fileName = picture.filename;
                thumbnailView.style.backgroundImage = `url("${
                    RoCode.defaultPath
                }/uploads/${fileName.substring(0, 2)}/${fileName.substring(
                    2,
                    4
                )}/thumb/${fileName}.png")`;
            }
            const sizeView = $element.find(`#s_${picture.id}`)[0];
            sizeView.innerHTML = `${picture.dimension.width} X ${picture.dimension.height}`;
        }

        RoCode.container.setPicture(picture);
        // RoCode.playground.object.setPicture(picture);
    }

    /**
     * Download a picture
     * @param {!String} pictureId
     */
    downloadPicture(pictureId) {
        const picture = RoCode.playground.object.getPicture(pictureId);
        const { imageType = 'png' } = picture;
        RoCode.dispatchEvent('downloadPicture', picture);
    }

    /**
     * Clone picture
     * @param {!String} pictureId
     */
    clonePicture(pictureId) {
        const sourcePicture = RoCode.playground.object.getPicture(pictureId);
        this.addPicture(sourcePicture, true);
    }

    /**
     * Select picture
     * @param {picture}
     */
    selectPicture(picture, removed) {
        const pictures = this.object.pictures;
        for (let i = 0, len = pictures.length; i < len; i++) {
            const target = pictures[i];
            const view = target.view;
            if (target.id === picture.id) {
                view.addClass('RoCodePictureSelected');
            } else {
                view.removeClass('RoCodePictureSelected');
            }
        }

        let objectId_;
        if (picture && picture.id) {
            objectId_ = RoCode.container.selectPicture(picture.id, picture.objectId);
        }

        if (this.object.id === objectId_) {
            if (!picture.objectId) {
                picture.objectId = this.object.id;
            }
            RoCode.dispatchEvent('pictureSelected', picture, removed);
        }
    }

    /**
     * Move picture in this.object.pictures
     * this method is for sortable
     * @param {!number} start
     * @param {!number} end
     */
    movePicture(start, end) {
        this.object.pictures.splice(end, 0, this.object.pictures.splice(start, 1)[0]);
        this.injectPicture();
    }

    /**
     * Inject text
     */
    injectText() {
        const object = this.object;

        if (!object) {
            return;
        }
        const entity = object.entity;

        const text = entity.getText();
        this.textEditInput.value = text;
        this.textEditArea.value = text;

        const font = RoCodeStatic.fonts
            .filter((font) => font.visible)
            .find((font) => font.family === entity.getFontName());
        if (font) {
            $('#RoCodeText #RoCodeTextBoxAttrFontName').text(font.name);
            $('#RoCodeText #RoCodeTextBoxAttrFontName').data('font', font);
        } else {
            $('#RoCodeText #RoCodeTextBoxAttrFontName').text('');
            $('#RoCodeText #RoCodeTextBoxAttrFontName').data('font', RoCodeStatic.fonts[0]);
        }

        $('.style_link.imbtn_pop_font_bold').toggleClass('on', entity.fontBold);
        $('.style_link.imbtn_pop_font_italic').toggleClass('on', entity.fontItalic);
        $('.style_link.imbtn_pop_font_underline').toggleClass('on', entity.getUnderLine());
        $('.style_link.imbtn_pop_font_through').toggleClass('on', entity.getStrike());

        if (entity.colour) {
            this.setTextColour(entity.colour, true);
        }
        if (entity.bgColor) {
            this.setBackgroundColour(entity.bgColor, true);
        }

        this.toggleLineBreak(entity.getLineBreak());

        if (entity.getLineBreak()) {
            const LANG = Lang.Menus;
            $('.RoCodePlaygroundLinebreakDescription > p').html(LANG.linebreak_on_desc_1);
            const pDoms = $('.RoCodePlaygroundLinebreakDescription > ul > li');
            pDoms.eq(0).text(LANG.linebreak_on_desc_2);
            pDoms.eq(1).text(LANG.linebreak_on_desc_3);
            this._setFontFontUI();
        }

        this.setFontAlign(entity.getTextAlign());
        RoCode.stage.updateForce();
    }

    _setFontFontUI() {
        const fontSize = this.object.entity.getFontSize();
        this.fontSizeIndiciator.style.width = `${fontSize}%`;
        this.fontSizeKnob.style.left = `${fontSize * 1.36}px`;
    }

    /**
     * Inject sound
     */
    injectSound() {
        const view = this.soundListView_;
        if (!view) {
            return;
        }

        if (!this.object) {
            delete RoCode.stage.selectedObject;
        } else {
            (this.object.sounds || []).forEach((sound, i) => {
                !sound.view && RoCode.playground.generateSoundElement(sound);
                const element = sound.view;
                element.orderHolder.innerHTML = i + 1;
            });
        }

        this.updateSoundsView();
    }

    /**
     * Move sound in this.object.sounds
     * this method is for sortable
     * @param {!number} start
     * @param {!number} end
     */
    moveSound(start, end) {
        if (this.object.sounds) {
            this.object.sounds.splice(end, 0, this.object.sounds.splice(start, 1)[0]);
            this.injectSound();
        }
    }

    addExpansionBlocks(items) {
        RoCode.expansion.addExpansionBlocks(items.map(({ name }) => name));
    }

    removeExpansionBlocks(items) {
        RoCode.expansion.banExpansionBlocks(items.map(({ name }) => name));
    }

    addAIUtilizeBlocks(items) {
        RoCode.aiUtilize.addAIUtilizeBlocks(items.map(({ name }) => name));
    }

    removeAIUtilizeBlocks(items) {
        RoCode.aiUtilize.banAIUtilizeBlocks(items.map(({ name }) => name));
    }

    setAiLearningBlock(url, info) {
        RoCode.aiLearning.removeLearningBlocks();
        RoCode.aiLearning.load({ url, ...info });
    }

    /**
     * Add sound
     * @param {sound model} sound
     * @param {boolean} NotForView if this is true, add element into object also.
     */
    addSound(sound, NotForView, isNew) {
        const tempSound = _.clone(sound);
        delete tempSound.view;
        if (isNew === true) {
            delete tempSound.id;
        }

        sound = RoCode.Utils.copy(tempSound);
        if (!sound.id) {
            sound.id = RoCode.generateHash();
        }
        sound.name = RoCode.getOrderedName(sound.name, this.object.sounds);

        this.generateSoundElement(sound);
        RoCode.do('objectAddSound', this.object.id, sound);
        this.injectSound();
    }

    downloadSound(soundId) {
        const sound = RoCode.playground.object.getSound(soundId);
        RoCode.dispatchEvent('downloadSound', sound);
    }

    /**
     * select view mode
     * @param {string} viewType
     */
    changeViewMode(viewType) {
        if (!this.tabViewElements) {
            return;
        }
        for (const i in this.tabViewElements) {
            this.tabViewElements[i].removeClass('RoCodeTabSelected');
        }
        if (viewType !== 'default') {
            this.tabViewElements[viewType].addClass('RoCodeTabSelected');
        }
        if (viewType === 'variable') {
            RoCode.playground.toggleOnVariableView();
            this.tabViewElements.code.removeClass('RoCodeTabSelected');
            this.tabViewElements[viewType].addClass('RoCodeTabSelected');
            return;
        }
        const views = this.view_.children;
        for (let i = 0; i < views.length; i++) {
            const view = views[i];
            if (view.id.toUpperCase().indexOf(viewType.toUpperCase()) > -1) {
                view.removeClass('RoCodeRemove');
            } else {
                view.addClass('RoCodeRemove');
            }
        }

        if (RoCode.pictureEditable) {
            if (viewType === 'picture') {
                this.painter.show();
                this.initSortablePictureWidget();
                if (!this.pictureView_.object || this.pictureView_.object != this.object) {
                    this.pictureView_.object = this.object;
                    this.injectPicture();
                } else if (
                    this.object &&
                    this.pictureListView_ &&
                    !this.pictureListView_.hasChildNodes()
                ) {
                    const pictures = this.object.pictures;
                    if (pictures && pictures.length) {
                        this.injectPicture();
                    }
                }
            } else {
                this.painter.hide();
            }
        }

        if (viewType === 'sound') {
            this.initSortableSoundWidget();
            if (!this.soundView_.object || this.soundView_.object != this.object) {
                this.soundView_.object = this.object;
                this.injectSound();
            } else if (this.object && this.soundListView_ && !this.soundListView_.hasChildNodes()) {
                const sounds = this.object.sounds;
                if (sounds && sounds.length) {
                    this.injectSound();
                }
            }
        }

        if (
            (viewType === 'text' && this.object.objectType === 'textBox') ||
            this.textView_.object != this.object
        ) {
            this.textView_.object = this.object;
            this.injectText();
        }

        if (viewType === 'code') {
            this.resizeHandle_ && this.resizeHandle_.removeClass('RoCodeRemove');
            this.tabButtonView_ && this.tabButtonView_.addClass('RoCodeCode');
            this.blockMenu.reDraw();
        } else {
            this.tabButtonView_ && this.tabButtonView_.removeClass('RoCodeCode');
        }

        if (RoCode.engine.isState('run')) {
            this.curtainView_.removeClass('RoCodeRemove');
        }
        this.viewMode_ = viewType;
        this.selectedViewMode = viewType;
        this.toggleOffVariableView();
    }

    /**
     * render variable view
     * @return {!Element}
     */
    createVariableView() {
        const view = RoCode.createElement('div');
        if (!RoCode.type || RoCode.type === 'workspace') {
            view.addClass('RoCodeVariablePanelWorkspace');
        } else if (RoCode.type === 'phone') {
            view.addClass('RoCodeVariablePanelPhone');
        }
        this.variableViewWrapper_ = view;
        RoCode.variableContainer.createDom(view);
        return view;
    }

    /**
     * toggle on variable view
     */
    toggleOnVariableView() {
        RoCode.playground.changeViewMode('code');
        this.hideBlockMenu();
        this.variableView_.removeClass('RoCodeRemove');
        this.resizeHandle_.removeClass('RoCodeRemove');
        this.viewMode_ = 'variable';
        this.selectedViewMode = 'variable';
    }

    toggleOffVariableView() {
        this.showBlockMenu();
        this.variableView_.addClass('RoCodeRemove');
    }

    /**
     * Generate category menu with object type.
     * @param {!string} objectType
     */
    setMenu(objectType) {
        if (this.currentObjectType == objectType) {
            return;
        }

        const blockMenu = this.blockMenu;
        blockMenu.unbanClass(this.currentObjectType, true);
        blockMenu.banClass(objectType, true);
        blockMenu.setMenu(true);
        this.currentObjectType = objectType;
    }

    hideTabs() {
        ['picture', 'text', 'sound', 'variable'].forEach(this.hideTab.bind(this));
    }

    hideTab(item) {
        if (this.tabViewElements[item]) {
            this.tabViewElements[item].addClass('hideTab');
            this.tabViewElements[item].removeClass('showTab');
        }
    }

    showTabs() {
        ['picture', 'text', 'sound', 'variable'].forEach(this.showTab.bind(this));
    }

    showTab(item) {
        if (this.tabViewElements[item]) {
            this.tabViewElements[item].addClass('showTab');
            this.tabViewElements[item].removeClass('hideTab');
        }
    }

    /**
     * Handle is resizing playground handle.
     * This add mouse move and mouse up event to document.
     * @param {!Element} handle
     */
    initializeResizeHandle(handle) {
        let listener;
        const that = this;
        $(handle).bind('mousedown touchstart', function(e) {
            e.preventDefault();
            if (RoCode.disposeEvent) {
                RoCode.disposeEvent.notify();
            }
            that.resizing = true;
            if (RoCode.documentMousemove) {
                listener = RoCode.documentMousemove.attach(this, ({ clientX }) => {
                    if (that.resizing) {
                        RoCode.resizeElement({
                            menuWidth: clientX - RoCode.interfaceState.canvasWidth,
                        });
                    }
                });
            }
            $(document).bind('mouseup.resizeHandle touchend.resizeHandle', () => {
                $(document).unbind('.resizeHandle');
                if (listener) {
                    that.resizing = false;
                    listener.destroy();
                    listener = undefined;
                }
            });
        });
    }

    /**
     * Reload playground
     */
    reloadPlayground() {
        const engine = RoCode.engine;

        if (engine && engine.isState('run')) {
            return;
        }
        _.result(this.mainWorkspace, 'dReDraw');
    }

    /**
     * flush playground when object is not exist
     */
    flushPlayground() {
        this.object = null;
        if (RoCode.playground && RoCode.playground.view_) {
            this.injectPicture();
            this.injectSound();

            const mainWS = RoCode.getMainWS();
            if (mainWS) {
                const board = mainWS.getBoard();
                board.clear();
                board.changeCode(null);
            }
        }
    }

    refreshPlayground() {
        if (RoCode.playground && RoCode.playground.view_) {
            if (this.getViewMode() === 'picture') {
                this.injectPicture();
            }
            if (this.getViewMode() === 'sound') {
                this.injectSound();
            }
        }
    }

    clear() {
        this.flushPlayground();
        if (this.painter) {
            this.painter.clear();
        }
    }

    nameViewBlur() {
        if (!RoCode.playground.nameViewFocus) {
            return;
        }
        if (this.nameView.value.trim() === '') {
            RoCodelms.alert(Lang.Workspace.enter_the_name).on('hide', () => {
                this.nameView.focus();
            });
            return true;
        }

        let nameViewArray = $('.RoCodePlaygroundPictureName');
        if (nameViewArray.length !== RoCode.playground.object.pictures.length) {
            nameViewArray = nameViewArray.slice(0, -1); // pop last element (드래그 시 발생하는 임시 엘리먼트임)
        }

        for (let i = 0; i < nameViewArray.length; i++) {
            if (
                nameViewArray.eq(i).val() == this.nameView.value &&
                nameViewArray[i] != this.nameView
            ) {
                RoCodelms.alert(Lang.Workspace.name_already_exists).on('hide', () => {
                    this.nameView.focus();
                });
                return true;
            }
        }
        const newValue = this.nameView.value;
        this.nameView.picture.name = newValue;
        const playground = RoCode.playground;
        if (playground) {
            if (playground.object) {
                const pic = playground.object.getPicture(this.nameView.picture.id);
                if (pic) {
                    pic.name = newValue;
                }
            }
            const painter = playground.painter;
            if (painter && painter.file) {
                painter.file.name = newValue;
            }

            playground.reloadPlayground();
        }
        RoCode.dispatchEvent('pictureNameChanged', this.nameView.picture);
        RoCode.playground.nameViewFocus = false;
    }

    isDuplicatedTableName(name, selectedIndex = -1) {
        let nameViewArray = $('.RoCodePlaygroundTableName');
        if (nameViewArray.length !== RoCode.playground.dataTable.tables.length) {
            nameViewArray = nameViewArray.slice(0, -1);
        }

        for (let i = 0; i < nameViewArray.length; i++) {
            if (nameViewArray.eq(i).val() == name && i != selectedIndex) {
                return true;
            }
        }

        return false;
    }

    generatePictureElement(picture) {
        const element = RoCode.createElement('li', picture.id)
            .addClass('RoCodePlaygroundPictureElement')
            .bindOnClick(function() {
                RoCode.playground.selectPicture(this.picture);
            });
        picture.view = element;
        element.picture = picture;

        RoCode.Utils.disableContextmenu(picture.view);
        RoCode.ContextMenu.onContextmenu(picture.view, (coordinate) => {
            const options = [
                {
                    text: Lang.Workspace.context_rename,
                    callback() {
                        nameView.focus();
                    },
                },
                {
                    text: Lang.Workspace.context_duplicate,
                    callback() {
                        RoCode.playground.clonePicture(picture.id);
                    },
                },
                {
                    text: Lang.Workspace.context_remove,
                    callback() {
                        RoCode.playground._removePicture(picture, element);
                    },
                },
                {
                    text: Lang.Workspace.context_download,
                    callback() {
                        RoCode.playground.downloadPicture(picture.id);
                    },
                },
            ];
            RoCode.ContextMenu.show(options, 'workspace-contextmenu', coordinate);
        });

        element.orderHolder = RoCode.createElement('div')
            .addClass('RoCodePlaygroundPictureOrder')
            .appendTo(element);

        const thumbnailView = RoCode.createElement('div', `t_${picture.id}`).addClass(
            'RoCodePlaygroundPictureThumbnail'
        );

        thumbnailView.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        if (picture.fileurl) {
            thumbnailView.style.backgroundImage = `url("${picture.fileurl}")`;
        } else {
            // deptecated
            const fileName = picture.filename;
            thumbnailView.style.backgroundImage = `url("${
                RoCode.defaultPath
            }/uploads/${fileName.substring(0, 2)}/${fileName.substring(
                2,
                4
            )}/thumb/${fileName}.png")`;
        }
        element.appendChild(thumbnailView);
        const nameView = RoCode.createElement('input')
            .addClass('RoCodePlaygroundPictureName')
            .addClass('RoCodeEllipsis');
        nameView.picture = picture;
        nameView.value = picture.name;
        RoCode.attachEventListener(nameView, 'blur', this.nameViewBlur.bind(this));
        RoCode.attachEventListener(nameView, 'focus', (e) => {
            this.nameView = e.target;
            this.nameViewFocus = true;
        });

        nameView.onkeypress = RoCode.Utils.blurWhenEnter;
        element.appendChild(nameView);
        RoCode.createElement('div', `s_${picture.id}`)
            .addClass('RoCodePlaygroundPictureSize')
            .appendTo(
                element
            ).innerHTML = `${picture.dimension.width} X ${picture.dimension.height}`;

        const removeButton = RoCode.createElement('div').addClass('RoCodePlayground_del');
        const { Buttons = {} } = Lang || {};
        const { delete: delText = '삭제' } = Buttons;
        removeButton.appendTo(element).innerText = delText;
        removeButton.bindOnClick((e) => {
            try {
                e.stopPropagation();
                this._removePicture(picture, element);
            } catch (e) {
                RoCode.toast.alert(
                    Lang.Workspace.shape_remove_fail,
                    Lang.Workspace.shape_remove_fail_msg
                );
            }
        });
    }

    _removePicture(picture, element) {
        if (RoCode.playground.object.pictures.length > 1) {
            RoCode.do('objectRemovePicture', picture.objectId, picture);
            RoCode.removeElement(element);
            RoCode.toast.success(
                Lang.Workspace.shape_remove_ok,
                `${picture.name} ${Lang.Workspace.shape_remove_ok_msg}`
            );
        } else {
            RoCode.toast.alert(
                Lang.Workspace.shape_remove_fail,
                Lang.Workspace.shape_remove_fail_msg
            );
        }
    }

    generateSoundElement(sound) {
        const element = RoCode.createElement('sound', sound.id).addClass(
            'RoCodePlaygroundSoundElement'
        );
        sound.view = element;
        element.sound = sound;

        RoCode.Utils.disableContextmenu(sound.view);
        RoCode.ContextMenu.onContextmenu(sound.view, (coordinate) => {
            const options = [
                {
                    text: Lang.Workspace.context_rename,
                    callback() {
                        nameView.focus();
                    },
                },
                {
                    text: Lang.Workspace.context_duplicate,
                    callback() {
                        RoCode.playground.addSound(sound, true, true);
                    },
                },
                {
                    text: Lang.Workspace.context_remove,
                    callback() {
                        const result = RoCode.do(
                            'objectRemoveSound',
                            RoCode.playground.object.id,
                            sound
                        );
                        if (result) {
                            RoCode.removeElement(element);
                            RoCode.dispatchEvent('removeSound', sound);
                            RoCode.toast.success(
                                Lang.Workspace.sound_remove_ok,
                                `${sound.name} ${Lang.Workspace.sound_remove_ok_msg}`
                            );
                        } else {
                            RoCode.toast.alert(Lang.Workspace.sound_remove_fail, '');
                        }
                        RoCode.removeElement(element);
                    },
                },
                {
                    text: Lang.Workspace.context_download,
                    callback() {
                        RoCode.playground.downloadSound(sound.id);
                    },
                },
            ];
            RoCode.ContextMenu.show(options, 'workspace-contextmenu', coordinate);
        });

        element.orderHolder = RoCode.createElement('div')
            .addClass('RoCodePlaygroundSoundOrder')
            .appendTo(element);

        const thumbnailView = RoCode.createElement('div')
            .addClass('RoCodePlaygroundSoundThumbnail RoCodePlaygroundSoundPlay')
            .appendTo(element);
        let isPlaying = false;
        let soundInstance;

        element.bindOnClick(() => {
            this.selectSound(sound);
        });

        thumbnailView.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        thumbnailView.bindOnClick(() => {
            this.selectSound(sound);

            if (isPlaying) {
                isPlaying = false;
                thumbnailView.removeClass('RoCodePlaygroundSoundStop');
                thumbnailView.addClass('RoCodePlaygroundSoundPlay');
                soundInstance.stop();
                return;
            } else {
                isPlaying = true;
                thumbnailView.removeClass('RoCodePlaygroundSoundPlay');
                thumbnailView.addClass('RoCodePlaygroundSoundStop');
                soundInstance = RoCode.Utils.playSound(sound.id);
                RoCode.Utils.addSoundInstances(soundInstance);
            }

            soundInstance.addEventListener('complete', () => {
                thumbnailView.removeClass('RoCodePlaygroundSoundStop');
                thumbnailView.addClass('RoCodePlaygroundSoundPlay');
                isPlaying = false;
            });
        });

        const nameView = RoCode.createElement('input')
            .addClass('RoCodePlaygroundSoundName')
            .appendTo(element);
        nameView.sound = sound;
        nameView.value = sound.name;

        RoCode.attachEventListener(nameView, 'blur', nameViewBlur);

        function nameViewBlur() {
            if (this.value.trim() === '') {
                return RoCodelms.alert(Lang.Workspace.enter_the_name).on('hide', () => {
                    nameView.focus();
                });
            }

            let nameViewArray = $('.RoCodePlaygroundSoundName');
            if (nameViewArray.length !== RoCode.playground.object.sounds.length) {
                nameViewArray = nameViewArray.slice(0, -1); // pop last element (드래그 시 발생하는 임시 엘리먼트임)
            }

            for (let i = 0; i < nameViewArray.length; i++) {
                if (nameViewArray.eq(i).val() == nameView.value && nameViewArray[i] != this) {
                    return RoCodelms.alert(Lang.Workspace.name_already_exists).on('hide', () => {
                        nameView.focus();
                    });
                }
            }
            const newValue = this.value;
            this.sound.name = newValue;
            RoCode.playground.reloadPlayground();
        }

        nameView.onkeypress = RoCode.Utils.blurWhenEnter;
        RoCode.createElement('div')
            .addClass('RoCodePlaygroundSoundLength')
            .appendTo(element).innerHTML = `${sound.duration} ${Lang.General.second}`;
        const removeButton = RoCode.createElement('div').addClass('RoCodePlayground_del');
        const { Buttons = {} } = Lang || {};
        const { delete: delText = '삭제' } = Buttons;
        removeButton.appendTo(element).innerText = delText;
        removeButton.bindOnClick(() => {
            try {
                RoCode.Utils.forceStopSounds();
                const result = RoCode.do('objectRemoveSound', RoCode.playground.object.id, sound);
                if (result) {
                    RoCode.dispatchEvent('removeSound', sound);
                    RoCode.toast.success(
                        Lang.Workspace.sound_remove_ok,
                        `${sound.name} ${Lang.Workspace.sound_remove_ok_msg}`
                    );
                } else {
                    RoCode.toast.alert(Lang.Workspace.sound_remove_fail, '');
                }
                RoCode.removeElement(element);
            } catch (e) {
                RoCode.toast.alert(Lang.Workspace.sound_remove_fail, '');
            }
        });
    }

    openDropDown = (options, target, callback, closeCallback) => {
        const containers = $('.RoCode-widget-dropdown');
        if (containers.length > 0) {
            closeCallback();
            return containers.remove();
        }

        const container = RoCode.Dom('div', {
            class: 'RoCode-widget-dropdown',
            parent: $('body'),
        })[0];

        const dropdownWidget = new Dropdown({
            data: {
                items: options,
                positionDom: target,
                outsideExcludeDom: [target],
                onOutsideClick: () => {
                    if (dropdownWidget) {
                        closeCallback();
                        dropdownWidget.hide();
                        dropdownWidget.remove();
                    }
                    if (container) {
                        container.remove();
                    }
                },
            },
            container,
        }).on('select', (item) => {
            callback(item);
            closeCallback();
            dropdownWidget.hide();
        });
        return dropdownWidget;
    };

    openColourPicker = (target, color, canTransparent, callback) => {
        const containers = $('.RoCode-color-picker');
        if (containers.length > 0) {
            $(target).removeClass('on');
            return containers.remove();
        }
        const container = RoCode.Dom('div', {
            class: 'RoCode-color-picker',
            parent: $('body'),
        })[0];
        $(target).addClass('on');
        const colorPicker = new ColorPicker({
            data: {
                color,
                positionDom: target,
                canTransparent,
                outsideExcludeDom: [target],
                onOutsideClick: (color) => {
                    if (colorPicker) {
                        $(target).removeClass('on');
                        colorPicker.hide();
                        colorPicker.remove();
                    }

                    if (container) {
                        container.remove();
                    }
                },
            },
            container,
        }).on('change', (color) => {
            if (color) {
                callback(color, true);
            }
        });
        return colorPicker;
    };

    selectSound(sound) {
        this.object.sounds.forEach((item) => {
            if (item.id !== sound.id) {
                item.view.removeClass('RoCodeSoundSelected');
            } else {
                item.view.addClass('RoCodeSoundSelected');
            }
        });
    }

    setTextColour(colour) {
        $('.imbtn_pop_font_color em').css('background-color', colour);
        this.object.entity.setColour(colour);
        this.textEditArea.style.color = colour;
        this.textEditInput.style.color = colour;
    }

    setBackgroundColour(colour) {
        $('.imbtn_pop_font_backgroundcolor em').css('background-color', colour);
        $('.imbtn_pop_font_backgroundcolor').toggleClass(
            'clear',
            colour === 'transparent' || colour === '#ffffff'
        );
        this.object.entity.setBGColour(colour);
        this.textEditArea.style.backgroundColor = colour;
        this.textEditInput.style.backgroundColor = colour;
    }

    isTextBGMode() {
        return this.isTextBGMode_;
    }

    checkVariables() {
        if (RoCode.forEBS) {
            return;
        }
        const blockMenu = this.blockMenu;
        const { lists_, variables_ } = RoCode.variableContainer;

        if (lists_.length) {
            blockMenu.unbanClass('listNotExist');
        } else {
            blockMenu.banClass('listNotExist');
        }

        if (variables_.length) {
            blockMenu.unbanClass('variableNotExist');
        } else {
            blockMenu.banClass('variableNotExist');
        }
    }

    getViewMode() {
        return this.viewMode_;
    }

    banExpansionBlock() {
        const blockMenu = _.result(this.mainWorkspace, 'blockMenu');
        if (!blockMenu) {
            return;
        }

        Object.values(RoCode.EXPANSION_BLOCK_LIST).forEach((block) => {
            blockMenu.banClass(block.name, true);
            blockMenu.banClass(`${block.name}_legacy`, true);
        });
    }

    banAIUtilizeBlock() {
        const blockMenu = _.result(this.mainWorkspace, 'blockMenu');
        if (!blockMenu) {
            return;
        }

        Object.values(RoCode.AI_UTILIZE_BLOCK_LIST).forEach((block) => {
            blockMenu.banClass(block.name, true);
            blockMenu.banClass(`${block.name}_legacy`, true);
        });
    }

    toggleLineBreak(isLineBreak) {
        const { objectType, entity } = this.object || {};
        if (objectType !== 'textBox') {
            return;
        }

        $('.write_type_box a').removeClass('on');
        if (isLineBreak) {
            entity.setLineBreak(true);
            $('.input_inner').height('228px');
            $('.write_type_box a')
                .eq(1)
                .addClass('on');
            $('.input_box .single').hide();
            $('.input_box .multi').show();
            this._setFontFontUI();
        } else {
            entity.setLineBreak(false);
            $('.input_inner').height('40px');
            $('.write_type_box a')
                .eq(0)
                .addClass('on');
            $('.input_box .multi').hide();
            $('.input_box .single').show();
        }
    }

    setFontAlign(fontAlign) {
        if (this.object.objectType !== 'textBox') {
            return;
        }
        this.alignLeftBtn.removeClass('on');
        this.alignCenterBtn.removeClass('on');
        this.alignRightBtn.removeClass('on');
        switch (fontAlign) {
            case RoCode.TEXT_ALIGN_LEFT:
                this.alignLeftBtn.addClass('on');
                break;
            case RoCode.TEXT_ALIGN_CENTER:
                this.alignCenterBtn.addClass('on');
                break;
            case RoCode.TEXT_ALIGN_RIGHT:
                this.alignRightBtn.addClass('on');
                break;
        }
        this.object.entity.setTextAlign(fontAlign);
    }

    showPictureCurtain() {
        this.pictureCurtainView_ && this.pictureCurtainView_.removeClass('RoCodeRemove');
    }

    hidePictureCurtain() {
        this.pictureCurtainView_ && this.pictureCurtainView_.addClass('RoCodeRemove');
    }

    hideBlockMenu() {
        this.mainWorkspace.getBlockMenu().hide();
    }

    showBlockMenu() {
        this.mainWorkspace.getBlockMenu().show();
    }

    getDom(query) {
        if (query.length) {
            switch (query.shift()) {
                case 'tabViewElements':
                    return this.tabViewElements[query.shift()];
                case 'blockMenu':
                    return this.blockMenu.getDom(query);
                case 'board':
                case 'overlayBoard':
                    return this.mainWorkspace.getCurrentBoard().getDom(query);
                case 'pictureAddButton':
                    return this._pictureAddButton;
                case 'soundAddButton':
                    return this._soundAddButton;
            }
        } else {
        }
    }

    applyTabOption() {
        this.textboxTab.addClass('RoCodeRemove');
        this.pictureTab.addClass('RoCodeRemove');
        this.soundTab.addClass('RoCodeRemove');
        this.variableTab.addClass('RoCodeRemove');
        if (RoCode.pictureEditable) {
            this.pictureTab.removeClass('RoCodeRemove');
            this.textboxTab.removeClass('RoCodeRemove');
        }
        if (RoCode.soundEditable) {
            this.soundTab.removeClass('RoCodeRemove');
        }
        if (RoCode.hasVariableManager) {
            this.variableTab.removeClass('RoCodeRemove');
        }
    }

    destroy() {
        this.commentToggleButton_ && this.commentToggleButton_.unBindOnClick();
        this.backPackButton_ && this.backPackButton_.unBindOnClick();
        this.blockBackPackEvent && this.blockBackPackEvent.off();
        this.blockBackPackAreaEvent && this.blockBackPackAreaEvent.off();
        this.objectBackPackEvent && this.objectBackPackEvent.off();
        this.objectBackPackAreaEvent && this.objectBackPackAreaEvent.off();
        this.globalEvent && this.globalEvent.destroy();
        this._destroyer.destroy();
    }
};
