/*
 *
 */
'use strict';
class Executor {
    constructor(block, entity, code) {
        this.scope = new RoCode.Scope(block, this);
        this.isUpdateTime = 0;
        this.entity = entity;
        this.code = code;
        this._callStack = [];
        this.register = {};
        this.paused = false;
        this.parentExecutor = null;
        this.valueMap = {};
        this.valueState = {};
        this.id = RoCode.Utils.generateId();
    }

    execute(isFromOrigin) {
        if (RoCode.isTurbo && !this.isUpdateTime) {
            this.isUpdateTime = performance.now();
        }
        if (this.isEnd()) {
            return;
        }

        const executedBlocks = [];
        if (isFromOrigin) {
            RoCode.callStackLength = 0;
        }

        const entity = this.entity;

        while (true) {
            let returnVal = null;
            executedBlocks.push(this.scope.block);

            try {
                const schema = this.scope.block.getSchema();
                if (schema && RoCode.skeleton[schema.skeleton].executable) {
                    RoCode.dispatchEvent('blockExecute', this.scope.block && this.scope.block.view);
                    returnVal = this.scope.run(entity);
                    this.scope.key = RoCode.generateHash();
                }
            } catch (e) {
                returnVal = this.checkExecutorError(e);
            }

            //executor can be ended after block function call
            if (this.isEnd()) {
                return executedBlocks;
            }

            if (returnVal instanceof Promise) {
                this.paused = true;
                returnVal
                    .then((result) => {
                        this.checkExecutorResult(result);
                        this.paused = false;
                    })
                    .catch((e) => {
                        this.paused = false;
                        this.checkExecutorError(e);
                    });
                break;
            }
            const isBreak = this.checkExecutorResult(returnVal);
            if (isBreak) {
                break;
            }
        }
        return executedBlocks;
    }

    checkExecutorError(error) {
        if (error.name === 'AsyncError') {
            return RoCode.STATIC.BREAK;
        } else if (this.isFuncExecutor) {
            throw error;
        } else {
            RoCode.Utils.stopProjectWithToast(this.scope, undefined, error);
        }
    }

    checkExecutorResult(returnVal) {
        if (returnVal === undefined || returnVal === null || returnVal === RoCode.STATIC.PASS) {
            this.scope = new RoCode.Scope(this.scope.block.getNextBlock(), this);
            this.valueMap = {};
            this.valueState = {};
            if (this.scope.block === null) {
                if (this._callStack.length) {
                    const oldScope = this.scope;
                    this.scope = this._callStack.pop();
                    if (this.scope.isLooped !== oldScope.isLooped) {
                        this.isLooped = true;
                        return true;
                    }
                } else {
                    return true;
                }
            }
        } else if (returnVal === RoCode.STATIC.CONTINUE) {
            this.valueMap = {};
            this.valueState = {};
        } else if (returnVal === this.scope) {
            this.valueMap = {};
            this.valueState = {};
            return true;
        } else if (returnVal === RoCode.STATIC.BREAK) {
            return true;
        }
    }

    stepInto(thread) {
        if (!(thread instanceof RoCode.Thread)) {
            console.error('Must step in to thread');
        }

        const block = thread.getFirstBlock();
        if (!block) {
            return RoCode.STATIC.BREAK;
        }

        this._callStack.push(this.scope);

        this.scope = new RoCode.Scope(block, this);
        return RoCode.STATIC.CONTINUE;
    }

    break() {
        if (this._callStack.length) {
            this.scope = this._callStack.pop();
        }
        return RoCode.STATIC.PASS;
    }

    breakLoop() {
        if (this._callStack.length) {
            this.scope = this._callStack.pop();
        }
        while (this._callStack.length) {
            const schema = RoCode.block[this.scope.block.type];
            if (schema.class === 'repeat') {
                break;
            }
            this.scope = this._callStack.pop();
        }
        return RoCode.STATIC.PASS;
    }

    end() {
        RoCode.dispatchEvent('blockExecuteEnd', this.scope.block && this.scope.block.view);
        this.scope.block = null;
    }

    isPause() {
        return this.paused;
    }

    isEnd() {
        return this.scope.block === null;
    }
}

RoCode.Executor = Executor;
