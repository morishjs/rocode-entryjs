'use strict';
RoCode.FieldTrashcan = class FieldTrashcan {
    constructor(board) {
        if (board) {
            this.setBoard(board);
        }
        this.dragBlock = null;
        this.dragBlockObserver = null;
        this.isOver = false;
        if (RoCode.windowResized) {
            RoCode.windowResized.attach(this, this.setPosition);
        }
    }

    _generateView() {
        this.svgGroup = this.board.svg.elem('g');
        this.renderStart();
        this._addControl();
    }

    renderStart() {
        const path = `${RoCode.mediaFilePath}delete_`;
        this.svgGroup.elem('image', {
            href: `${path}body.svg`,
            y: 19,
            width: 61,
            height: 70,
        });
        this.trashcanTop = this.svgGroup.elem('image', {
            href: `${path}cover.svg`,
            width: 60,
            height: 27,
        });
    }

    _addControl() {
        $(this.svgGroup).bind('mousedown', function(e) {
            if (RoCode.Utils.isRightButton(e)) {
                e.stopPropagation();
                $('#RoCodeWorkspaceBoard').css('background', 'white');
            }
        });
    }

    updateDragBlock() {
        const block = this.board.dragBlock;
        const observer = this.dragBlockObserver;

        if (observer) {
            observer.destroy();
            this.dragBlockObserver = null;
        }

        if (block) {
            if (block instanceof RoCode.Comment) {
                this.dragBlockObserver = block.observe(this, 'checkBlock', ['moveX', 'moveY']);
            } else {
                this.dragBlockObserver = block.observe(this, 'checkBlock', ['x', 'y']);
            }
        } else {
            if (this.isOver && this.dragBlock) {
                if (this.dragBlock instanceof RoCode.BlockView) {
                    const prevBlock = this.dragBlock.block.getPrevBlock();
                    if (!prevBlock) {
                        RoCode.do('destroyThread', this.dragBlock.block.thread, 'trashcan').isPass(
                            true,
                            true
                        );
                        RoCode.Utils.playSound('RoCodeDelete');
                    }
                } else if (this.dragBlock instanceof RoCode.Comment) {
                    RoCode.do('removeComment', this.dragBlock).isPass(true, true);
                }
            }
            this.tAnimation(false);
        }
        this.dragBlock = block;
    }

    checkBlock() {
        const dragBlock = this.dragBlock;
        if (!dragBlock || (dragBlock.block && !dragBlock.block.isDeletable())) {
            return;
        }

        const boardOffset = this.board.offset();
        const position = this.getPosition();
        const trashcanX = position.x + boardOffset.left;
        const trashcanY = position.y + boardOffset.top;

        let mouseX;
        let mouseY;
        const instance = dragBlock.dragInstance;
        if (instance) {
            mouseX = instance.offsetX;
            mouseY = instance.offsetY;
        }
        const isOver = mouseX >= trashcanX && mouseY >= trashcanY;
        this.tAnimation(isOver);
    }

    align() {
        const position = this.getPosition();
        const transform = `translate(${position.x},${position.y})`;

        this.svgGroup.attr({
            transform,
        });
    }

    setPosition() {
        if (!this.board) {
            return;
        }
        const svgDom = this.board.svgDom;
        this._x = svgDom.width() - 83.5;
        this._y = svgDom.height() - 110;
        this.align();
    }

    getPosition() {
        return {
            x: this._x,
            y: this._y,
        };
    }

    tAnimation(isOver) {
        if (isOver === this.isOver) {
            return;
        }

        isOver = isOver === undefined ? true : isOver;
        const trashTop = this.trashcanTop;
        if (isOver) {
            $(trashTop).attr('transform', 'translate(20, -25) rotate(30)');
            // $(trashTop).attr('class', 'trashcanOpen');
        } else {
            $(trashTop).attr('transform', 'translate(0, 0) rotate(0)');
            // $(trashTop).attr('class', 'trashcanClose');
        }

        this.isOver = isOver;
    }

    setBoard(board) {
        if (this._dragBlockObserver) {
            this._dragBlockObserver.destroy();
        }
        this.board = board;
        if (!this.svgGroup) {
            this._generateView();
        }

        //control z-index
        const svg = board.svg;
        const firstChild = svg.firstChild;
        if (firstChild) {
            svg.insertBefore(this.svgGroup, firstChild);
        } else {
            svg.appendChild(this.svgGroup);
        }

        this._dragBlockObserver = board.observe(this, 'updateDragBlock', ['dragBlock']);
        this.svgGroup.attr({
            filter: `url(#RoCodeTrashcanFilter_${board.suffix})`,
        });
        this.setPosition();
    }
};
