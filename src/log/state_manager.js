class RoCodeStateManager {
    constructor() {
        this.undoStack_ = [];
        this.redoStack_ = [];

        /** prevent add command when undo and redo */
        this.isRestore = false;
        this._isRedoing = false;
        this.isIgnore = false;
        RoCode.addEventListener('cancelLastCommand', (e) => {
            this.cancelLastCommand();
        });
        RoCode.addEventListener('saveWorkspace', (e) => {
            this.addStamp();
        });
        RoCode.addEventListener('undo', (e) => {
            this.undo();
        });
        RoCode.addEventListener('redo', (e) => {
            this.redo();
        });
    }

    generateView(stateManagerView, option) {
        console.warn('this method is nothing to do. please consider remove logic');
    }

    addCommand(type, caller, func, params) {
        if (this.isIgnoring()) {
            return;
        }
        const state = new RoCode.State();
        RoCode.State.prototype.constructor.apply(state, Array.prototype.slice.call(arguments));

        if (this.isRestoring()) {
            this.redoStack_.push(state);
        } else {
            this.undoStack_.push(state);
            if (!this._isRedoing) {
                this.redoStack_ = [];
            }
        }
        if (RoCode.reporter) {
            RoCode.reporter.report(state);
        }
        if (RoCode.creationChangedEvent) {
            RoCode.creationChangedEvent.notify();
        }
        return state;
    }

    cancelLastCommand() {
        if (!this.canUndo()) {
            return;
        }
        this.undoStack_.pop();
        if (RoCode.creationChangedEvent) {
            RoCode.creationChangedEvent.notify();
        }
    }

    getLastCommand() {
        return this.undoStack_[this.undoStack_.length - 1];
    }

    getLastCommandById(id) {
        const undoStack = this.undoStack_;
        const len = undoStack.length - 1;
        for (let i = len; i >= 0; i--) {
            const state = undoStack[i];
            if (state.id === id) {
                return state;
            }
        }
    }

    getLastRedoCommand() {
        return this.redoStack_[this.redoStack_.length - 1];
    }

    removeAllPictureCommand() {
        this.undoStack_ = this.undoStack_.filter(
            (stack) => !(stack.message >= 400 && stack.message < 500)
        );
        this.redoStack_ = this.redoStack_.filter(
            (stack) => !(stack.message >= 400 && stack.message < 500)
        );
    }

    undo(count) {
        if (!this.canUndo() || this.isRestoring()) {
            return;
        }
        this.addActivity('undo');
        this.startRestore();
        let isFirst = true;
        while (this.undoStack_.length) {
            const state = this.undoStack_.pop();
            state.func.apply(state.caller, state.params);

            const command = this.getLastRedoCommand();

            if (isFirst) {
                command.isPass = false;
                isFirst = !isFirst;
            } else {
                command.isPass = true;
            }

            if (count) {
                count--;
            }

            if (!count && state.isPass !== true) {
                break;
            }
        }
        this.endRestore();
        if (RoCode.disposeEvent) {
            RoCode.disposeEvent.notify();
        }
        if (RoCode.creationChangedEvent) {
            RoCode.creationChangedEvent.notify();
        }
    }

    redo() {
        if (!this.canRedo() || this.isRestoring()) {
            return;
        }

        this._isRedoing = true;
        this.addActivity('undo');
        this.addActivity('redo');
        let isFirst = true;
        while (this.redoStack_.length) {
            const state = this.redoStack_.pop();
            const ret = state.func.apply(state.caller, state.params);

            if (isFirst) {
                ret.isPass(false);
                isFirst = !isFirst;
            } else {
                ret.isPass(true);
            }

            if (state.isPass !== true) {
                break;
            }
        }
        this._isRedoing = false;
        if (RoCode.creationChangedEvent) {
            RoCode.creationChangedEvent.notify();
        }
    }

    updateView() {
        return;
        if (this.undoButton && this.redoButton) {
            if (this.canUndo()) {
                this.undoButton.addClass('active');
            } else {
                this.undoButton.removeClass('active');
            }

            if (this.canRedo()) {
                this.redoButton.addClass('active');
            } else {
                this.redoButton.removeClass('active');
            }
        }
    }

    startRestore() {
        this.isRestore = true;
    }

    endRestore() {
        this.isRestore = false;
    }

    isRestoring() {
        return this.isRestore;
    }

    startIgnore() {
        this.isIgnore = true;
    }

    endIgnore() {
        this.isIgnore = false;
    }

    isIgnoring() {
        return this.isIgnore;
    }

    canUndo() {
        return this.undoStack_.length > 0 && RoCode.engine.isState('stop');
    }

    canRedo() {
        return this.redoStack_.length > 0 && RoCode.engine.isState('stop');
    }

    /**
     * mark state which one saved
     */
    addStamp() {
        this.stamp = RoCode.generateHash();
        if (this.undoStack_.length) {
            this.undoStack_[this.undoStack_.length - 1].stamp = this.stamp;
        }
    }

    /**
     * @return {!boolean} return true when project is up-to-date
     */
    isSaved() {
        return (
            this.undoStack_.length === 0 ||
            (this.undoStack_[this.undoStack_.length - 1].stamp == this.stamp &&
                typeof this.stamp == 'string')
        );
    }

    /**
     * @param {String} activityType
     */
    addActivity(activityType) {
        if (RoCode.reporter) {
            RoCode.reporter.report(new RoCode.State(activityType));
        }
    }

    getUndoStack() {
        return this.undoStack_.slice(0);
    }

    changeLastCommandType(type) {
        const cmd = this.getLastCommand();
        if (cmd) {
            cmd.message = type;
        }
        return cmd;
    }

    clear() {
        while (this.undoStack_.length) {
            this.undoStack_.pop();
        }
        while (this.redoStack_.length) {
            this.redoStack_.pop();
        }

        if (RoCode.creationChangedEvent) {
            RoCode.creationChangedEvent.notify();
        }
    }
}

RoCode.StateManager = RoCodeStateManager;
