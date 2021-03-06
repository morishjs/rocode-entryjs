import debounce from 'lodash/debounce';
import _get from 'lodash/get';
import Hammer from 'hammerjs';

RoCode.BlockView = class BlockView {
    schema = {
        id: 0,
        type: RoCode.STATIC.BLOCK_RENDER_MODEL,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
        contentWidth: 0,
        contentHeight: 0,
        topFieldHeight: 0,
        marginBottom: 0,
        magneting: false,
        visible: true,
        animating: false,
        shadow: true,
        display: true,
    };

    constructor(block, board, mode) {
        const that = this;
        RoCode.Model(this, false);
        this.block = block;
        this._lazyUpdatePos = debounce(block._updatePos.bind(block), 200);
        this.mouseUpEvent = new RoCode.Event(this);
        this.disableMouseEvent = false;

        this.dAlignContent = this.alignContent;
        this._board = board;
        this._observers = [];
        this.set(block);
        const hash = RoCode.generateHash();
        this.svgGroup = board.svgBlockGroup.elem('g');
        this.svgGroup.attr('id', hash);
        this.svgGroup.blockView = this;
        if (block.isCommentable() && board.svgCommentGroup) {
            this.svgCommentGroup = board.svgCommentGroup.elem('g');
            this.svgCommentGroup.attr('id', `${hash}C`);
            this.svgCommentGroup.blockView = this;
        }

        this._schema = RoCode.skinContainer.getSkin(block);

        if (this._schema === undefined) {
            this.block.destroy(false, false);
            return;
        }

        if (mode === undefined) {
            const workspace = this.getBoard().workspace;
            if (workspace && workspace.getBlockViewRenderMode) {
                this.renderMode = workspace.getBlockViewRenderMode();
            } else {
                this.renderMode = RoCode.BlockView.RENDER_MODE_BLOCK;
            }
        } else {
            this.renderMode = RoCode.BlockView.RENDER_MODE_BLOCK;
        }

        if (this._schema.deletable) {
            this.block.setDeletable(this._schema.deletable);
        }
        if (this._schema.copyable) {
            this.block.setCopyable(this._schema.copyable);
        }
        if (this._schema.display === false || block.display === false) {
            this.set({ display: false });
        }
        this._skeleton = RoCode.skeleton[this._schema.skeleton];
        const skeleton = this._skeleton;
        this._contents = [];
        this._statements = [];
        this._extensions = [];
        this.magnet = {};
        this._paramMap = {};

        if (skeleton.magnets && skeleton.magnets(this).next) {
            this.svgGroup.nextMagnet = this.block;
            this._nextGroup = this.svgGroup.elem('g');
            this._nextCommentGroup = this.svgCommentGroup && this.svgCommentGroup.elem('g');
            this._observers.push(this.observe(this, '_updateMagnet', ['contentHeight']));
        }

        this.isInBlockMenu = this.getBoard() instanceof RoCode.BlockMenu;
        this.mouseHandler = function(e) {
            (_.result(that.block.events, 'mousedown') || []).forEach((fn) => {
                if (RoCode.documentMousedown) {
                    RoCode.documentMousedown.notify(e);
                }
                return fn(that);
            });
            that.onMouseDown(...arguments);
        };

        this._startRender(block, mode);

        // observe
        const thisBlock = this.block;
        this._observers.push(thisBlock.observe(this, '_setMovable', ['movable']));
        this._observers.push(thisBlock.observe(this, '_setReadOnly', ['movable']));
        this._observers.push(thisBlock.observe(this, '_setCopyable', ['copyable']));
        this._observers.push(thisBlock.observe(this, '_updateColor', ['deletable'], false));
        this._observers.push(this.observe(this, '_updateBG', ['magneting'], false));

        this._observers.push(this.observe(this, '_updateOpacity', ['visible'], false));
        this._observers.push(this.observe(this, '_updateDisplay', ['display']));
        this._observers.push(this.observe(this, '_updateMagnet', ['offsetY']));
        this._observers.push(board.code.observe(this, '_setBoard', ['board'], false));

        this.dragMode = RoCode.DRAG_MODE_NONE;
        RoCode.Utils.disableContextmenu(this.svgGroup.node);
        const events = block.events.viewAdd || [];
        if (RoCode.type === 'workspace' && this._board instanceof RoCode.Board) {
            events.forEach((fn) => {
                if (_.isFunction(fn)) {
                    fn(block);
                }
            });
        }

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    _startRender(block, mode) {
        const skeleton = this._skeleton;
        const attr = { class: 'block' };

        if (this.display === false) {
            attr.display = 'none';
        }

        const svgGroup = this.svgGroup;

        svgGroup.attr(attr);

        (skeleton.classes || []).forEach((c) => svgGroup.addClass(c));

        const path = skeleton.path(this);

        this.pathGroup = svgGroup.prepend('g');
        this._updateMagnet();

        this._path = this.pathGroup.elem('path');

        let fillColor = this._schema.color;
        const { deletable, emphasized } = this.block;

        if (deletable === RoCode.Block.DELETABLE_FALSE_LIGHTEN || emphasized) {
            fillColor = this._schema.emphasizedColor || RoCode.Utils.getEmphasizeColor(fillColor);
        }

        this._fillColor = fillColor;

        const pathStyle = {
            d: path,
            fill: fillColor,
            class: 'blockPath',
            blockId: this.id,
        };

        const blockSchema = this._schema;
        const { outerLine } = blockSchema;
        pathStyle.stroke = outerLine || skeleton.outerLine;
        pathStyle['stroke-linejoin'] = 'round';
        pathStyle['stroke-linecap'] = 'round';

        if (skeleton.stroke) {
            pathStyle['stroke-width'] = '1';
        }
        this._path.attr(pathStyle);
        this.moveTo(this.x, this.y, false);
        this._startContentRender(mode);
        this._startExtension(mode);
        if (this._board.disableMouseEvent !== true) {
            this._addControl();
        }

        const guide = this.guideSvgGroup;
        guide && svgGroup.insertBefore(guide, svgGroup.firstChild);

        this.bindPrev();
    }

    _startContentRender(mode) {
        mode = _.isUndefined(mode) ? this.renderMode : mode;

        const _removeFunc = _.partial(_.result, _, 'remove');

        _removeFunc(this.contentSvgGroup);
        _removeFunc(this.statementSvgGroup);
        if (this.statementCommentGroup) {
            _removeFunc(this.statementCommentGroup);
        }

        this.contentSvgGroup = this.svgGroup.elem('g');
        this._contents = [];

        const schema = this._schema;
        const statements = schema.statements;

        if (!_.isEmpty(statements)) {
            this.statementSvgGroup = this.svgGroup.elem('g');
            this.statementCommentGroup = this.svgCommentGroup && this.svgCommentGroup.elem('g');
        }

        const reg = /(%\d+)/im;
        const parsingReg = /%(\d+)/im;
        let parsingRet;

        let template = this._getTemplate(mode) || '';
        const params = this._getSchemaParams(mode);

        if (mode === RoCode.BlockView.RENDER_MODE_TEXT) {
            if (
                /(if)+(.|\n)+(else)+/gim.test(template) &&
                !reg.test(template) &&
                this.isInBlockMenu
            ) {
                template = template.replace('else', `%${params.length} else`);
            }
        }

        const _renderMode = mode || this.renderMode;
        template &&
            template.split(reg).forEach((param, i) => {
                if (param[0] === ' ') {
                    param = param.substring(1);
                }
                if (param[param.length - 1] === ' ') {
                    param = param.substring(0, param.length - 1);
                }
                if (!param?.length) {
                    return;
                }

                parsingRet = parsingReg.exec(param);
                if (parsingRet) {
                    const paramIndex = parsingRet[1] - 1;
                    param = params[paramIndex];
                    // params[paramIndex]= null||undefined ??? ??? ?????? ????????? ?????? ?????? ??????
                    if (!param) {
                        return;
                    }
                    const field = new RoCode[`Field${param.type}`](
                        param,
                        this,
                        paramIndex,
                        _renderMode,
                        i
                    );
                    this._contents.push(field);
                    this._paramMap[paramIndex] = field;
                } else {
                    this._contents.push(
                        new RoCode.FieldText({ text: param, color: schema.fontColor }, this)
                    );
                }
            });

        (schema.statements || []).forEach((s, i) => {
            this._statements.push(new RoCode.FieldStatement(s, this, i));
        });

        this.alignContent(false);
    }

    _startExtension(mode) {
        this._extensions = this.block.extensions.map(
            (e) => new RoCode[`Ext${e.type}`](e, this, mode)
        );
    }

    _updateSchema = this._startContentRender;

    changeType(type) {
        this._schema = RoCode.block[type || this.type];
        this._updateSchema();
    }

    alignContent(animate) {
        this.resetBackgroundPath();
        if (animate !== true) {
            animate = false;
        }
        const cursor = { x: 0, y: 0, height: 0 };
        let statementIndex = 0;
        let width = 0;
        let secondLineHeight = 0;

        for (let i = 0; i < this._contents.length; i++) {
            const c = this._contents[i];
            if (c instanceof RoCode.FieldLineBreak) {
                this._alignStatement(animate, statementIndex);
                c.align(statementIndex);
                statementIndex++;
                cursor.y = c.box.y;
                cursor.x = 8;
            } else {
                c.align(cursor.x, cursor.y, animate);
                // space between content
                if (
                    i !== this._contents.length - 1 &&
                    !(c instanceof RoCode.FieldText && c._text.length === 0)
                ) {
                    cursor.x += RoCode.BlockView.PARAM_SPACE;
                }
            }

            const box = c.box;
            if (statementIndex !== 0) {
                secondLineHeight = Math.max(Math.round(box.height) * 1000000, secondLineHeight);
            } else {
                cursor.height = Math.max(box.height, cursor.height);
            }

            cursor.x += box.width;
            width = Math.max(width, cursor.x);
            if (this.contentWidth !== width || this.contentHeight !== cursor.height) {
                this.set({
                    contentWidth: width,
                    contentHeight: cursor.height,
                });
            }
        }

        if (secondLineHeight) {
            this.set({
                contentHeight: cursor.height + secondLineHeight,
            });
        }

        if (this._statements.length != statementIndex) {
            this._alignStatement(animate, statementIndex);
        }

        const contentPos = this.getContentPos();
        this.contentSvgGroup.attr('transform', `translate(${contentPos.x},${contentPos.y})`);
        this.contentPos = contentPos;
        this._render();
        const comment = this.block.comment;
        if (comment instanceof RoCode.Comment) {
            comment.updateParentPos();
        }

        this._updateMagnet();
        const ws = this.getBoard().workspace;
        if (ws && (this.isFieldEditing() || ws.widgetUpdateEveryTime)) {
            ws.widgetUpdateEvent.notify();
        }
    }

    isFieldEditing() {
        const contents = this._contents;
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i] || {};
            if (content.isEditing && content.isEditing()) {
                return true;
            }
        }
        return false;
    }

    _alignStatement(animate, index) {
        const positions = this._skeleton.statementPos ? this._skeleton.statementPos(this) : [];
        const statement = this._statements[index];
        if (!statement) {
            return;
        }
        const pos = positions[index];
        if (pos) {
            statement.align(pos.x, pos.y, animate);
        }
    }

    _render() {
        this._renderPath();
        this.set(this._skeleton.box(this));
    }

    _renderPath() {
        const newPath = this._skeleton.path(this);

        //no change occured
        if (this._path.getAttribute('d') === newPath) {
            return;
        }

        if (false && RoCode.ANIMATION_DURATION !== 0) {
            const that = this;
            setTimeout(() => {
                that._path.animate({ d: newPath }, RoCode.ANIMATION_DURATION, mina.easeinout);
            }, 0);
        } else {
            this._path.attr({ d: newPath });
            this.animating === true && this.set({ animating: false });
        }
    }

    _setPosition() {
        const board = this.getBoard();
        const { scale = 1 } = board || {};
        if (!(this.x || this.y)) {
            this.svgGroup.removeAttr('transform');
            this.svgCommentGroup && this.svgCommentGroup.removeAttr('transform');
        } else {
            const transform = `translate(${this.x / scale},${this.y / scale})`;
            this.svgGroup.attr('transform', transform);
            this.svgCommentGroup && this.svgCommentGroup.attr('transform', transform);
        }
    }

    moveTo(x, y, animate, doNotUpdatePos) {
        const thisX = this.x;
        const thisY = this.y;
        if (!this.display) {
            x = -99999;
            y = -99999;
        }
        if (thisX !== x || thisY !== y) {
            this.set({ x, y });
        }

        doNotUpdatePos !== true && this._lazyUpdatePos();

        if (this.visible && this.display) {
            this._setPosition(animate);
        }
    }

    moveBy(x, y, animate, doNotUpdatePos) {
        return this.moveTo(this.x + x, this.y + y, animate, doNotUpdatePos);
    }

    _addControl() {
        this._mouseEnable = true;

        const dblclick = _.result(this.block.events, 'dblclick');
        if (dblclick) {
            const hammer = new Hammer(this.pathGroup);
            hammer.on('doubletap', () => {
                if (this._board.readOnly) {
                    return;
                }
                dblclick.forEach((fn) => {
                    if (fn) {
                        fn(this);
                    }
                });
            });
            $(this.pathGroup).dblclick(() => {
                if (this._board.readOnly) {
                    return;
                }
                dblclick.forEach((fn) => {
                    if (fn) {
                        fn(this);
                    }
                });
            });
        }

        $(this.svgGroup).bind(
            'mousedown.blockViewMousedown touchstart.blockViewMousedown',
            this.mouseHandler
        );
    }

    removeControl() {
        this._mouseEnable = false;
        $(this.svgGroup).unbind('.blockViewMousedown');
    }

    setSelectedBlock(board) {
        const { workspace } = board;
        const { selectedBlockView } = workspace;
        const wsBoard = selectedBlockView ? selectedBlockView.getBoard() : board;
        if (board !== wsBoard) {
            wsBoard.setSelectedBlock(null);
        } else {
            board.setSelectedBlock(this);
        }
    }

    onMouseDown(e) {
        if (!this.isInBlockMenu && e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        if (e.which == 2) {
            console.log('mouse wheel click disabled');
            return;
        }
        if (e.button == 1) {
            return;
        }
        if (RoCode.disposeEvent) {
            RoCode.disposeEvent.notify();
        }

        this.longPressTimer = null;

        const board = this.getBoard();
        if (board.workingEvent) {
            return;
        }

        if (this.readOnly || board.viewOnly) {
            return;
        }

        board.workingEvent = true;
        this.setSelectedBlock(board);

        //left mousedown
        if (
            (e.button === 0 || (e.originalEvent && e.originalEvent.touches) || e.touches) &&
            !this._board.readOnly
        ) {
            const eventType = e.type;
            let mouseEvent;
            if (e.originalEvent && e.originalEvent.touches) {
                mouseEvent = e.originalEvent.touches[0];
            } else if (e.touches) {
                mouseEvent = e.touches[0];
            } else {
                mouseEvent = e;
            }

            this.mouseDownCoordinate = {
                x: mouseEvent.pageX,
                y: mouseEvent.pageY,
            };
            const $doc = $(document);

            if (!this.disableMouseEvent) {
                $doc.bind('mousemove.block', this.onMouseMove);
                document.addEventListener('touchmove', this.onMouseMove, { passive: false });
            }
            $doc.bind('mouseup.block', this.onMouseUp);
            document.addEventListener('touchend', this.onMouseUp);
            this.dragInstance = new RoCode.DragInstance({
                startX: mouseEvent.pageX,
                startY: mouseEvent.pageY,
                offsetX: mouseEvent.pageX,
                offsetY: mouseEvent.pageY,
                height: 0,
                mode: true,
            });
            board.set({ dragBlock: this });
            this.addDragging();
            this.dragMode = RoCode.DRAG_MODE_MOUSEDOWN;

            if (eventType === 'touchstart' || RoCode.isMobile()) {
                this.longPressTimer = setTimeout(() => {
                    if (this.longPressTimer) {
                        this.longPressTimer = null;
                        this.onMouseUp(e);
                        this._rightClick(e, 'longPress');
                    }
                }, 700);
            }
        } else if (RoCode.Utils.isRightButton(e)) {
            this._rightClick(e);
        }

        if (board.workspace.getMode() === RoCode.Workspace.MODE_VIMBOARD && e) {
            document
                .getElementsByClassName('CodeMirror')[0]
                .dispatchEvent(RoCode.Utils.createMouseEvent('dragStart', e));
        }
    }

    getVerticalMove(mouseEvent, dragInstance) {
        const dx = Math.abs(mouseEvent.pageX - dragInstance.offsetX);
        const dy = Math.abs(mouseEvent.pageY - dragInstance.offsetY);
        return dy / dx > 1.75;
    }

    onMouseMove(e) {
        e.stopPropagation();
        e.preventDefault();
        const board = this.getBoard();
        const workspaceMode = board.workspace.getMode();

        let mouseEvent;
        if (workspaceMode === RoCode.Workspace.MODE_VIMBOARD) {
            this.vimBoardEvent(e, 'dragOver');
        }
        if (e.originalEvent && e.originalEvent.touches) {
            mouseEvent = e.originalEvent.touches[0];
        } else if (e.touches) {
            mouseEvent = e.touches[0];
        } else {
            mouseEvent = e;
        }

        const mouseDownCoordinate = this.mouseDownCoordinate;
        const diff = Math.sqrt(
            Math.pow(mouseEvent.pageX - mouseDownCoordinate.x, 2) +
                Math.pow(mouseEvent.pageY - mouseDownCoordinate.y, 2)
        );
        if (this.dragMode == RoCode.DRAG_MODE_DRAG || diff > RoCode.BlockView.DRAG_RADIUS) {
            const blockView = this;
            if (
                (blockView.isInBlockMenu &&
                    this.longPressTimer &&
                    this.getVerticalMove(mouseEvent, blockView.dragInstance)) ||
                this.isVerticalMove
            ) {
                this.isVerticalMove = true;
                return;
            } else {
                $(document).unbind('.blockMenu');
            }

            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            if (!this.movable) {
                return;
            }

            if (!this.isInBlockMenu) {
                let isFirst = false;

                if (this.dragMode != RoCode.DRAG_MODE_DRAG) {
                    this._toGlobalCoordinate(undefined, true);
                    this.dragMode = RoCode.DRAG_MODE_DRAG;
                    this.block.getThread().changeEvent.notify();
                    RoCode.GlobalSvg.setView(this, workspaceMode);
                    isFirst = true;
                    this.fromBlockMenu = this.dragInstance && this.dragInstance.isNew;
                }

                if (this.animating) {
                    this.set({ animating: false });
                }

                if (this.dragInstance.height === 0) {
                    const height = -1 + this.height;
                    this.dragInstance.set({ height });
                }

                const dragInstance = this.dragInstance;
                this.moveBy(
                    mouseEvent.pageX - dragInstance.offsetX,
                    mouseEvent.pageY - dragInstance.offsetY,
                    false,
                    true
                );
                RoCode.GlobalSvg.position();

                dragInstance.set({
                    offsetX: mouseEvent.pageX,
                    offsetY: mouseEvent.pageY,
                });

                if (!this.originPos) {
                    this.originPos = {
                        x: this.x,
                        y: this.y,
                    };
                }
                if (isFirst) {
                    board.generateCodeMagnetMap();
                }
                this._updateCloseBlock();
            } else {
                board.cloneToGlobal(e);
                // this.terminateEvent();
            }
        }
    }

    terminateEvent() {
        const $doc = $(document);
        document.removeEventListener('touchmove', this.onMouseMove, { passive: false });
        document.removeEventListener('touchend', this.onMouseUp);
        $doc.unbind('.block', this.onMouseUp);
        $doc.unbind('.block', this.onMouseMove);
    }

    onMouseUp(e) {
        if (e.which == 2) {
            console.log('mouse wheel click disabled');
            return;
        }
        if (e.button == 1) {
            return;
        }
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.terminateEvent();
        this.terminateDrag(e);
        const board = this.getBoard();
        if (board) {
            board.set({ dragBlock: null });
            delete board.workingEvent;
        }
        this._setHoverBlockView({ that: this });
        RoCode.GlobalSvg.remove();
        this.mouseUpEvent.notify();

        delete this.isVerticalMove;
        delete this.mouseDownCoordinate;
        delete this.dragInstance;
    }

    vimBoardEvent(event, type, block) {
        if (!event) {
            return;
        }
        const dragEvent = RoCode.Utils.createMouseEvent(type, event);
        if (block) {
            dragEvent.block = block;
        }
        $('.RoCodeVimBoard>.CodeMirror')[0].dispatchEvent(dragEvent);
    }

    terminateDrag(e) {
        const gs = RoCode.GlobalSvg;
        const board = this.getBoard();
        const dragMode = this.dragMode;
        const block = this.block;
        const workspaceMode = board.workspace.getMode();
        this.removeDragging();
        this.set({ visible: true });
        this.dragMode = RoCode.DRAG_MODE_NONE;

        const gsRet = gs.terminateDrag(this);

        if (workspaceMode === RoCode.Workspace.MODE_VIMBOARD) {
            if (board instanceof RoCode.BlockMenu) {
                board.terminateDrag();
                gsRet === gs.DONE && this.vimBoardEvent(e, 'dragEnd', block);
            } else {
                board.clear();
            }
        } else {
            const fromBlockMenu = this.dragInstance && this.dragInstance.isNew;
            if (dragMode === RoCode.DRAG_MODE_DRAG) {
                let ripple = false;
                const prevBlock = this.block.getPrevBlock(this.block);
                let suffix = this._board.workspace.trashcan.isOver ? 'ForDestroy' : '';
                switch (gsRet) {
                    case gs.DONE: {
                        let closeBlock = board.magnetedBlockView;
                        if (closeBlock instanceof RoCode.BlockView) {
                            closeBlock = closeBlock.block;
                        }
                        if (prevBlock && !closeBlock) {
                            RoCode.do(`separateBlock${suffix}`, block);
                        } else if (!prevBlock && !closeBlock && !fromBlockMenu) {
                            if (!block.getThread().view.isGlobal()) {
                                RoCode.do(`separateBlock${suffix}`, block);
                            } else {
                                RoCode.do(`moveBlock${suffix}`, block);
                                this.dominate();
                            }
                        } else {
                            suffix = fromBlockMenu ? 'FromBlockMenu' : '';
                            if (closeBlock) {
                                if (closeBlock.view.magneting === 'next') {
                                    this.dragMode = dragMode;
                                    const targetPointer = closeBlock.pointer();
                                    targetPointer[3] = -1;
                                    RoCode.do(`insertBlock${suffix}`, block, targetPointer).isPass(
                                        fromBlockMenu
                                    );

                                    RoCode.ConnectionRipple.setView(closeBlock.view).dispose();
                                    this.dragMode = RoCode.DRAG_MODE_NONE;
                                } else {
                                    if (closeBlock.getThread) {
                                        const thread = closeBlock.getThread();
                                        const closeBlockType = closeBlock.type;
                                        if (
                                            closeBlockType &&
                                            thread instanceof RoCode.FieldBlock &&
                                            !RoCode.block[closeBlockType].isPrimitive
                                        ) {
                                            suffix += 'FollowSeparate';
                                        }
                                    }
                                    RoCode.do(`insertBlock${suffix}`, block, closeBlock).isPass(
                                        fromBlockMenu
                                    );
                                    ripple = true;
                                }
                                RoCode.Utils.playSound('RoCodeMagneting');
                            } else {
                                RoCode.do(`moveBlock${suffix}`, block).isPass(fromBlockMenu);
                                this.dominate();
                            }
                        }
                        break;
                    }
                    case gs.RETURN: {
                        const block = this.block;
                        if (fromBlockMenu) {
                            RoCode.do('destroyBlockBelow', this.block).isPass(true);
                        } else {
                            if (prevBlock) {
                                this.set({ animating: false });
                                RoCode.Utils.playSound('RoCodeMagneting');
                                this.bindPrev(prevBlock);
                                block.insert(prevBlock);
                            } else {
                                const parent = block.getThread().view.getParent();

                                if (!(parent instanceof RoCode.Board)) {
                                    RoCode.Utils.playSound('RoCodeMagneting');
                                    RoCode.do('insertBlock', block, parent);
                                } else {
                                    const originPos = this.originPos;
                                    this.moveTo(originPos.x, originPos.y, false);
                                    this.dominate();
                                }
                            }
                        }
                        break;
                    }
                    case gs.REMOVE:
                        RoCode.Utils.playSound('RoCodeDelete');
                        RoCode.do('destroyBlockBelow', this.block).isPass(fromBlockMenu);
                        break;
                }

                board.setMagnetedBlock(null);
                if (ripple) {
                    RoCode.ConnectionRipple.setView(block.view).dispose();
                }
            } else if (
                gsRet === gs.REMOVE &&
                fromBlockMenu &&
                dragMode === RoCode.DRAG_MODE_MOUSEDOWN
            ) {
                RoCode.do('destroyBlockBelow', this.block).isPass(true);
            }
        }

        this.destroyShadow();
        delete this.originPos;
    }

    _updateCloseBlock() {
        if (!this._skeleton.magnets) {
            return;
        }

        const board = this.getBoard();
        const { scale = 1 } = board || {};
        const x = this.x / scale;
        const y = this.y / scale;
        for (const type in this.magnet) {
            const view = _.result(
                board.getNearestMagnet(x, type === 'next' ? y + this.getBelowHeight() : y, type),
                'view'
            );

            if (view) {
                return board.setMagnetedBlock(view, type);
            }
        }
        board.setMagnetedBlock(null);
    }

    dominate() {
        this.block.getThread().view.dominate();
        const board = this.getBoard();
        board.scroller.resizeScrollBar.call(board.scroller);
    }

    getSvgRoot() {
        const svgBlockGroup = this.getBoard().svgBlockGroup;
        let node = this.svgGroup;
        while (node.parentNode !== svgBlockGroup) {
            node = node.parentNode;
        }
        return node;
    }

    getBoard() {
        return this._board;
    }

    getComment() {
        return this.block.comment;
    }

    _setBoard() {
        this._board = this._board.code.board;
    }

    destroy(animate) {
        this.block.set({ view: null });
        $(this.svgGroup).unbind('.blockViewMousedown');
        this._destroyObservers();
        const svgGroup = this.svgGroup;

        const _destroyFunc = _.partial(_.result, _, 'destroy');

        if (animate) {
            $(svgGroup).fadeOut(100, () => svgGroup.remove());
        } else {
            svgGroup.remove();
        }
        this.svgCommentGroup && this.svgCommentGroup.remove();

        (this._contents || []).forEach(_destroyFunc);
        (this._statements || []).forEach(_destroyFunc);

        const block = this.block;
        if (RoCode.type === 'workspace' && !this.isInBlockMenu) {
            (block.events.viewDestroy || []).forEach((fn) => {
                if (_.isFunction(fn)) {
                    fn(block);
                }
            });
        }
    }

    getShadow() {
        if (!this._shadow) {
            this._shadow = RoCode.SVG.createElement(this.svgGroup.cloneNode(true), { opacity: 0.5 });
            this.getBoard().svgGroup.appendChild(this._shadow);
        }
        return this._shadow;
    }

    destroyShadow() {
        _.result(this._shadow, 'remove');
        delete this._shadow;
    }

    _updateMagnet() {
        if (!this._skeleton.magnets) {
            return;
        }
        const magnet = this._skeleton.magnets(this);

        if (magnet.next) {
            this._nextGroup.attr('transform', `translate(${magnet.next.x},${magnet.next.y})`);
            this._nextCommentGroup &&
                this._nextCommentGroup.attr(
                    'transform',
                    `translate(${magnet.next.x},${magnet.next.y})`
                );
        }
        this.magnet = magnet;
        this.block.getThread().changeEvent.notify();
    }

    _updateBG() {
        const dragBlock = this._board.dragBlock;
        if (!dragBlock || !dragBlock.dragInstance) {
            return;
        }

        const blockView = this;
        const svgGroup = blockView.svgGroup;
        if (!(this.magnet.next || this.magnet.previous)) {
            // field block
            if (this.magneting) {
                svgGroup.attr({
                    filter: `url(#RoCodeBlockHighlightFilter_${this.getBoard().suffix})`,
                });
                svgGroup.addClass('outputHighlight');
            } else {
                svgGroup.removeClass('outputHighlight');
                svgGroup.removeAttr('filter');
            }
            return;
        }
        const magneting = blockView.magneting;
        if (magneting) {
            const shadow = dragBlock.getShadow();
            const pos = this.getAbsoluteCoordinate();
            let magnet;
            let transform;
            if (magneting === 'previous') {
                magnet = this.magnet.next;
                transform = `translate(${pos.scaleX + magnet.x},${pos.scaleY + magnet.y})`;
            } else if (magneting === 'next') {
                magnet = this.magnet.previous;
                const dragHeight = dragBlock.getBelowHeight();
                const nextX = _get(dragBlock, 'magnet.next.x');
                transform = `translate(${pos.scaleX + magnet.x - nextX},${pos.scaleY +
                    magnet.y -
                    dragHeight})`;
            }

            const $shadow = $(shadow);
            $shadow.attr({
                transform,
            });
            $shadow.removeAttr('display');

            this._clonedShadow = shadow;

            if (blockView.background) {
                blockView.background.remove();
                blockView.nextBackground.remove();
                delete blockView.background;
                delete blockView.nextBackground;
            }

            if (magneting === 'previous' && dragBlock.block.thread instanceof RoCode.Thread) {
                const height = dragBlock.getBelowHeight() + this.offsetY;
                blockView.originalHeight = blockView.offsetY;
                blockView.set({
                    offsetY: height,
                });
            }
        } else {
            if (this._clonedShadow) {
                this._clonedShadow.attr({
                    display: 'none',
                });
                delete this._clonedShadow;
            }

            const height = blockView.originalHeight;
            if (height !== undefined) {
                if (blockView.background) {
                    blockView.background.remove();
                    blockView.nextBackground.remove();
                    delete blockView.background;
                    delete blockView.nextBackground;
                }
                blockView.set({
                    offsetY: height,
                });
                delete blockView.originalHeight;
            }
        }

        _.result(blockView.block.thread.changeEvent, 'notify');
    }

    addDragging() {
        this.svgGroup.addClass('dragging');
        RoCode.playground.setBackpackPointEvent(true);
    }

    removeDragging() {
        this.svgGroup.removeClass('dragging');
        RoCode.playground.setBackpackPointEvent(false);
    }

    addSelected() {
        document?.activeElement?.blur();
        $(this.pathGroup).insertAfter(this._nextGroup);
        this.svgGroup.removeClass('activated');
        this.svgGroup.addClass('selected');
    }

    removeSelected() {
        $(this.pathGroup).insertBefore(this._nextGroup);
        this.svgGroup.removeClass('selected');
    }

    addActivated() {
        $(this.pathGroup).insertAfter(this._nextGroup);
        this.svgGroup.removeClass('selected');
        this.svgGroup.addClass('activated');
    }

    removeActivated() {
        $(this.pathGroup).insertBefore(this._nextGroup);
        this.svgGroup.removeClass('activated');
    }

    getSkeleton() {
        return this._skeleton;
    }

    getContentPos() {
        return this._skeleton.contentPos(this);
    }

    renderText() {
        this.renderMode = RoCode.BlockView.RENDER_MODE_TEXT;
        this._startContentRender(RoCode.BlockView.RENDER_MODE_TEXT);
    }

    renderBlock() {
        this.renderMode = RoCode.BlockView.RENDER_MODE_BLOCK;
        this._startContentRender(RoCode.BlockView.RENDER_MODE_BLOCK);
    }

    renderByMode(mode, isReDraw) {
        if (this.isRenderMode(mode) && !isReDraw) {
            return;
        }

        this.renderMode = mode;
        this._startContentRender(mode);
    }

    _updateOpacity() {
        if (this.visible === false) {
            this.svgGroup.attr({ opacity: 0 });
            this.svgCommentGroup && this.svgCommentGroup.attr({ opacity: 0 });
        } else {
            this.svgGroup.removeAttr('opacity');
            this.svgCommentGroup && this.svgCommentGroup.removeAttr('opacity');
            this._setPosition();
        }
    }

    _setMovable() {
        if (this.block.isMovable() !== null) {
            this.movable = this.block.isMovable();
        } else if (this._skeleton.movable !== undefined) {
            this.movable = this._skeleton.movable;
        } else {
            this.movable = true;
        }
    }

    _setReadOnly() {
        if (this.block.isReadOnly() !== null) {
            this.readOnly = this.block.isReadOnly();
        } else if (this._skeleton.readOnly !== undefined) {
            this.readOnly = this._skeleton.readOnly;
        } else {
            this.readOnly = false;
        }
    }

    _setCopyable() {
        if (this.block.isCopyable() !== null) {
            this.copyable = this.block.isCopyable();
        } else if (this._skeleton.copyable !== undefined) {
            this.copyable = this._skeleton.copyable;
        } else {
            this.copyable = true;
        }
    }

    bumpAway(distance = 15, delay) {
        const that = this;
        if (delay) {
            const oldX = this.x;
            const oldY = this.y;
            window.setTimeout(() => {
                //only when position not changed
                if (oldX === that.x && oldY === that.y) {
                    that.moveBy(distance, distance, false);
                }
            }, delay);
        } else {
            that.moveBy(distance, distance, false);
        }
    }

    _toLocalCoordinate(view) {
        this.disableMouseEvent = false;
        this.moveTo(0, 0, false);
        const { _nextGroup: parentSvgGroup, _nextCommentGroup: parentCommentGroup } = view;
        parentSvgGroup.appendChild(this.svgGroup);
        parentCommentGroup && parentCommentGroup.appendChild(this.svgCommentGroup);
    }

    _toGlobalCoordinate(dragMode, doNotUpdatePos) {
        this.disableMouseEvent = false;
        const { x, y } = this.getAbsoluteCoordinate(dragMode);
        this.moveTo(x, y, false, doNotUpdatePos);
        this.getBoard().svgBlockGroup.appendChild(this.svgGroup);
        this.svgCommentGroup && this.getBoard().svgCommentGroup.appendChild(this.svgCommentGroup);
    }

    bindPrev(prevBlock, isDestroy) {
        if (prevBlock) {
            this._toLocalCoordinate(prevBlock.view);
            const nextBlock = prevBlock.getNextBlock();
            if (nextBlock) {
                if (nextBlock && nextBlock !== this.block) {
                    const endBlock = this.block.getLastBlock();
                    if (isDestroy) {
                        nextBlock.view._toLocalCoordinate(prevBlock.view);
                    } else if (endBlock.view.magnet.next) {
                        nextBlock.view._toLocalCoordinate(endBlock.view);
                    } else {
                        nextBlock.view._toGlobalCoordinate();
                        nextBlock.separate();
                        nextBlock.view.bumpAway(null, 100);
                    }
                }
            }
        } else {
            prevBlock = this.block.getPrevBlock();
            if (prevBlock) {
                const prevBlockView = prevBlock.view;
                this._toLocalCoordinate(prevBlockView);
                const nextBlock = this.block.getNextBlock();
                if (nextBlock && nextBlock.view) {
                    nextBlock.view._toLocalCoordinate(this);
                }
            }
        }
    }

    getAbsoluteCoordinate(dragMode) {
        const board = this.getBoard();
        const { scale = 1 } = board || {};
        dragMode = dragMode !== undefined ? dragMode : this.dragMode;
        if (dragMode === RoCode.DRAG_MODE_DRAG) {
            return {
                x: this.x,
                y: this.y,
                scaleX: this.x / scale,
                scaleY: this.y / scale,
            };
        }

        const pos = this.block.getThread().view.requestAbsoluteCoordinate(this);
        pos.x += this.x;
        pos.y += this.y;
        pos.scaleX = pos.x / scale;
        pos.scaleY = pos.y / scale;
        return pos;
    }

    getBelowHeight() {
        return this.block.getThread().view.requestPartHeight(this);
    }

    _updateDisplay() {
        if (this.display) {
            $(this.svgGroup).removeAttr('display');
            this._setPosition();
        } else {
            this.svgGroup.attr({
                display: 'none',
            });
        }
    }

    _updateColor() {
        let fillColor = this._schema.color;
        const { deletable, emphasized } = this.block;

        if (deletable === RoCode.Block.DELETABLE_FALSE_LIGHTEN || emphasized) {
            const emphasizedColor = this._schema.emphasizedColor;
            if (!emphasizedColor) {
                fillColor = RoCode.Utils.getEmphasizeColor(fillColor);
            } else {
                fillColor = emphasizedColor;
            }
        }
        this._fillColor = fillColor;
        this._path.attr({ fill: fillColor });
        this._updateContents();
    }

    _updateContents(isReDraw) {
        const params = [undefined, undefined, this.renderMode, isReDraw];
        this._contents.forEach((c) => c.renderStart(...params));
        this.alignContent(false);
    }

    _destroyObservers() {
        const observers = this._observers;
        while (observers.length) {
            observers.pop().destroy();
        }
    }

    reDraw() {
        if (!(this.visible && this.display)) {
            return;
        }

        this._updateContents(true);

        //?????? ????????? ?????? ??????????????? ?????? ????????? ?????? ????????? ??????. indicator(undefined), string ??? ??????
        (this.block.data.params || []).forEach((param) => {
            if (_get(param, 'data.view')) {
                param.data.view.reDraw();
            }
        });
        (this.block.statements || []).forEach(({ view }) => view.reDraw());
        (this._extensions || []).forEach((ext) => _.result(ext, 'updatePos'));
    }

    getParam(index) {
        return this._paramMap[index];
    }

    getDataUrl(notClone, notPng) {
        return new Promise((resolve, reject) => {
            const svgGroup = notClone ? this.svgGroup : this.svgGroup.cloneNode(true);
            const svgCommentGroup = notClone
                ? this.svgCommentGroup
                : this.svgCommentGroup && this.svgCommentGroup.cloneNode(true);

            if (!notClone) {
                svgGroup.removeAttribute('opacity');
                svgGroup.setAttribute('class', 'block selected');
            }
            const box = this._skeleton.box(this);
            const scale = notPng ? 1 : 1.5;
            let fontWeight = this.isWindow7() ? 0.9 : 0.95;
            if (this.type.indexOf('func_') > -1) {
                fontWeight *= 0.99;
            }
            svgGroup.setAttribute(
                'transform',
                'scale(%SCALE) translate(%X,%Y)'
                    .replace('%X', -box.offsetX)
                    .replace('%Y', -box.offsetY)
                    .replace('%SCALE', scale)
            );
            this.svgCommentGroup &&
                svgCommentGroup.setAttribute(
                    'transform',
                    'scale(%SCALE) translate(%X,%Y)'
                        .replace('%X', -box.offsetX)
                        .replace('%Y', -box.offsetY)
                        .replace('%SCALE', scale)
                );

            const defs = this.getBoard().svgDom.find('defs');

            const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.setAttribute('type', 'text/css');
            style.textContent = `
                @font-face {
                    font-family: RoCodeNG;
                    src: local(NanumGothic),
                        local(????????????),
                        local(???????????? Regular),
                        local(Noto Sans JP Regular),
                        local(Noto Sans JP);
                    font-weight: normal;
                    font-style: normal;
                }`;

            defs.append(style);
            const images = svgGroup.getElementsByTagName('image');
            const texts = svgGroup.getElementsByTagName('text');

            const fontFamily = RoCodeStatic.getDefaultFontFamily();
            const boldTypes = ['???', '???'];
            const notResizeTypes = ['???', '???', '-', '>', '<', '=', '+', '-', 'x', '/'];

            _.toArray(texts).forEach((text) => {
                text.setAttribute('font-family', fontFamily);
                const size = parseInt(text.getAttribute('font-size'), 10);
                const content = $(text).text();
                if (_.includes(boldTypes, content)) {
                    text.setAttribute('font-weight', '500');
                }

                // if (content == 'q') {
                //     const y = parseInt(text.getAttribute('y'), 10);
                //     text.setAttribute('y', y - 1);
                // }

                if (_.includes(notResizeTypes, content)) {
                    text.setAttribute('font-size', `${size}px`);
                }
                // else {
                //     text.setAttribute('font-size', `${size * fontWeight}px`);
                // }
                text.setAttribute('alignment-baseline', 'auto');
            });

            let counts = 0;
            if (!images.length) {
                this.processSvg(svgGroup, scale, defs, notPng)
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                _.toArray(images).forEach((img) => {
                    const href = img.getAttribute('href');
                    this.loadImage(
                        href,
                        img.getAttribute('width'),
                        img.getAttribute('height'),
                        notPng
                    ).then((src) => {
                        img.setAttribute('href', src);
                        if (++counts == images.length) {
                            this.processSvg(svgGroup, scale, defs, notPng)
                                .then((data) => {
                                    resolve(data);
                                })
                                .catch((err) => {
                                    reject(err);
                                });
                        }
                    });
                });
            }
        });
    }

    downloadAsImage(i) {
        this.getDataUrl().then((data) => {
            const download = document.createElement('a');
            download.href = data.src;
            let name = Lang.Workspace.download_image_name;
            if (i) {
                name += i;
            }
            download.download = `${name}.png`;
            download.click();
        });
    }

    _rightClick(e, eventSource) {
        const disposeEvent = RoCode.disposeEvent;
        if (disposeEvent) {
            disposeEvent.notify(e);
        }

        const block = this.block;
        const board = this.getBoard();
        delete board.workingEvent;
        //if long pressed block is function_general block
        //edit function
        if (this.isInBlockMenu && eventSource === 'longPress' && block.getFuncId()) {
            return this._schema.events.dblclick[0](this);
        }

        const { clientX: x, clientY: y } = RoCode.Utils.convertMouseEvent(e);

        return RoCode.ContextMenu.show(_getOptions(this), null, { x, y });

        //helper functon get get context options
        function _getOptions(blockView) {
            const isBoardReadOnly = blockView._board.readOnly;
            const { block, isInBlockMenu, copyable } = blockView;
            const { options: RoCodeOptions = {} } = RoCode;
            const {
                Blocks: { Duplication_option, CONTEXT_COPY_option, Delete_Blocks },
                Menus: { save_as_image },
            } = Lang;

            const copyAndPaste = {
                text: Duplication_option,
                enable: copyable && !isBoardReadOnly,
                callback() {
                    RoCode.do('cloneBlock', block.copy());
                },
            };

            const copy = {
                text: CONTEXT_COPY_option,
                enable: copyable && !isBoardReadOnly,
                callback() {
                    block.copyToClipboard();
                },
            };

            const remove = {
                text: Delete_Blocks,
                enable: block.isDeletable() && !isBoardReadOnly,
                callback() {
                    RoCode.do('destroyBlock', block);
                },
            };

            const addStorage = !RoCodeOptions.backpackDisable && {
                text: Lang.Blocks.add_my_storage,
                enable: copyable && !isBoardReadOnly && !!window.user,
                callback() {
                    RoCode.dispatchEvent('addStorage', {
                        type: 'block',
                        data: block,
                    });
                },
            };

            const download = {
                text: save_as_image,
                callback() {
                    blockView.downloadAsImage();
                },
            };

            const hasComment = !!block._comment;
            const comment = !RoCodeOptions.commentDisable && {
                text: hasComment ? Lang.Blocks.delete_comment : Lang.Blocks.add_comment,
                enable: block.isCommentable(),
                callback() {
                    hasComment
                        ? RoCode.do('removeComment', block._comment)
                        : RoCode.do('createComment', { id: RoCode.Utils.generateId() }, board, block);
                },
            };

            let options = [];
            if (_isDownloadable()) {
                options.push(download);
            }

            if (!isInBlockMenu) {
                options = [copyAndPaste, copy, remove, addStorage, ...options, comment].filter(
                    (x) => x
                );
            }

            return options;

            function _isDownloadable() {
                return RoCode.Utils.isChrome() && RoCode.type === 'workspace' && !RoCode.isMobile();
            }
        }
    }

    addStorage() {
        if (this.block.view) {
            RoCode.dispatchEvent('addStorage', {
                type: 'block',
                data: this.block,
            });
        }
    }

    clone() {
        return this.svgGroup.cloneNode(true);
    }

    setBackgroundPath() {
        const board = this.getBoard();
        if (board.dragBlock) {
            return;
        }

        this.resetBackgroundPath();

        const originPath = this._path;

        const clonedPath = originPath.cloneNode(true);
        clonedPath.setAttribute('class', 'blockBackgroundPath');
        clonedPath.setAttribute('fill', this._fillColor);

        this._backgroundPath = clonedPath;
        this.pathGroup.insertBefore(clonedPath, originPath);

        board.enablePattern();
        originPath.attr({
            fill: `url(#blockHoverPattern_${board.suffix})`,
        });
    }

    resetBackgroundPath() {
        const board = this.getBoard();
        if (!this._backgroundPath || !board || !board.disablePattern) {
            return;
        }

        board.disablePattern();
        _.result($(this._backgroundPath), 'remove');
        this._backgroundPath = null;
        this._path.attr({ fill: this._fillColor });
    }

    _getTemplate(renderMode) {
        let template;

        if (renderMode === RoCode.BlockView.RENDER_MODE_TEXT) {
            const board = this.getBoard();
            let syntax;
            const workspace = board.workspace;
            if (workspace && workspace.vimBoard) {
                syntax = workspace.vimBoard.getBlockSyntax(this);
            } else {
                if (board.getBlockSyntax) {
                    syntax = board.getBlockSyntax(this, renderMode);
                }
            }

            if (syntax) {
                if (typeof syntax === 'string') {
                    template = syntax;
                } else {
                    template = syntax.template;
                }
            }
        }

        return template || this._schema.template || Lang.template[this.block.type];
    }

    _getSchemaParams(mode) {
        let params = this._schema.params;
        if (mode === RoCode.BlockView.RENDER_MODE_TEXT) {
            const workspace = this.getBoard().workspace;
            if (workspace && workspace.vimBoard) {
                const syntax = workspace.vimBoard.getBlockSyntax(this);
                if (syntax && syntax.textParams) {
                    params = syntax.textParams;
                }
            }
        }
        return params;
    }

    detach() {
        this.svgGroup.remove();
    }

    attach(target) {
        (target || this._board.svgBlockGroup).appendChild(this.svgGroup);
    }

    getMagnet(query) {
        const selector = query.shift() || 'next';
        let halfWidth = query.shift();
        if (halfWidth === undefined) {
            halfWidth = 20;
        }
        return {
            getBoundingClientRect: function() {
                const coord = this.getAbsoluteCoordinate();
                const boardOffset = this._board.relativeOffset;
                const magnet = this.magnet[selector];

                return {
                    top: coord.y + boardOffset.top + magnet.y - halfWidth,
                    left: coord.x + boardOffset.left + magnet.x - halfWidth,
                    width: 2 * halfWidth,
                    height: 2 * halfWidth,
                };
            }.bind(this),
        };
    }

    isRenderMode(mode) {
        return this.renderMode === mode;
    }

    _setHoverBlockView(data) {
        if (!data) {
            return;
        }

        const { that, blockView } = data;

        const target = _.result(that.getBoard(), 'workspace');
        if (!target) {
            return;
        }
        target.setHoverBlockView(blockView);
    }

    setHoverBlockView = this._setHoverBlockView;

    getFields() {
        if (!this._schema) {
            return [];
        }

        const THREAD = RoCode.Thread;
        const FIELD_BLOCK = RoCode.FieldBlock;
        const FIELD_OUTPUT = RoCode.FieldOutput;

        return (this._statements || []).reduce(
            (fields, statement) => {
                statement = statement && statement._thread;
                if (!(statement instanceof THREAD)) {
                    return fields;
                }

                return fields.concat(statement.view.getFields());
            },
            (this._contents || []).reduce((fields, c) => {
                if (!c) {
                    return fields;
                }

                fields.push(c);

                if (c instanceof FIELD_BLOCK || c instanceof FIELD_OUTPUT) {
                    //some output block doesn't have value block
                    const valueBlock = c.getValueBlock && c.getValueBlock();
                    if (!valueBlock) {
                        return fields;
                    }
                    fields = fields.concat(valueBlock.view.getFields());
                }

                return fields;
            }, [])
        );
    }

    processSvg(svgGroup, scale = 1, defs, notPng) {
        return new Promise((resolve, reject) => {
            let svgData =
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %W %H">(svgGroup)(defs)</svg>';
            const bBox = this.svgGroup.getBoundingClientRect();
            const board = this.getBoard();
            const { scale: blockScale = scale } = board;
            // console.log(this);
            const boxWidth = bBox.width / blockScale;
            const boxHeight = bBox.height / blockScale;
            svgData = svgData
                .replace('(svgGroup)', new XMLSerializer().serializeToString(svgGroup))
                .replace('%W', boxWidth * scale + 20)
                .replace('%H', boxHeight * scale + 5)
                .replace('(defs)', new XMLSerializer().serializeToString(defs[0]))
                .replace(/>\s+/g, '>')
                .replace(/\s+</g, '<');
            svgData = svgData.replace(/NS\d+:href/gi, 'href');
            let src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
            svgData = null;
            if (notPng) {
                resolve({
                    src,
                    width: boxWidth,
                    height: boxHeight,
                });
                svgGroup = null;
            } else {
                this.loadImage(src, boxWidth, boxHeight, notPng, 1.5).then(
                    (src) => {
                        svgGroup = null;
                        resolve({
                            src,
                            width: boxWidth,
                            height: boxHeight,
                        });
                    },
                    (err) => {
                        reject('error occured');
                    }
                );
            }
            src = null;
        });
    }

    loadImage(src, width, height, notPng, multiplier = 1) {
        return new Promise((resolve, reject) => {
            if (RoCode.BlockView.pngMap[src] !== undefined) {
                return resolve(RoCode.BlockView.pngMap[src]);
            }

            if (notPng) {
                return resolve(`${location.origin}${src}`);
            }

            width *= multiplier;
            height *= multiplier;
            //float point cropped
            width = Math.ceil(width);
            height = Math.ceil(height);

            const img = document.createElement('img');
            img.crossOrigin = 'Anonymous';
            const canvas = document.createElement('canvas');

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            img.onload = function() {
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    const data = canvas.toDataURL('image/png');
                    if (/\.png$/.test(src)) {
                        RoCode.BlockView.pngMap[src] = data;
                    }
                    return resolve(data);
                } catch (e) {
                    return reject('error occured');
                }
            };

            img.onerror = function() {
                return reject('error occured');
            };
            img.src = src;
        });
    }

    isWindow7() {
        const platform = window.platform;
        if (platform && platform.name.toLowerCase() === 'windows' && platform.version[0] === '7') {
            return true;
        }
        return false;
    }
};

RoCode.BlockView.PARAM_SPACE = 7;
RoCode.BlockView.DRAG_RADIUS = 5;
RoCode.BlockView.pngMap = {};

RoCode.BlockView.RENDER_MODE_BLOCK = 1;
RoCode.BlockView.RENDER_MODE_TEXT = 2;
