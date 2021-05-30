class RoCodeCommander {
    constructor() {
        RoCode.do = this.do.bind(this);

        RoCode.undo = this.undo.bind(this);

        this.editor = {};

        this.reporters = [];

        RoCode.Command.editor = this.editor;

        this.doEvent = new RoCode.Event(this);
        this.logEvent = new RoCode.Event(this);

        this.doCommandAll = RoCode.doCommandAll;
        this._storage = null;
    }

    do(commandType, ...args) {
        const {
            stateManager,
            Command: RoCodeCommand,
            STATIC: { COMMAND_TYPES, getCommandName },
        } = RoCode;

        if (typeof commandType === 'string') {
            commandType = COMMAND_TYPES[commandType];
        }

        //intentionally delay reporting
        this.report(COMMAND_TYPES.do);
        this.report(commandType, args);

        const command = RoCodeCommand[commandType];

        console.log('commandType', commandType, getCommandName(commandType));

        let state;

        if (stateManager && !this._checkIsSkip(commandType)) {
            state = stateManager.addCommand(
                ...[commandType, this, this.do, command.undo].concat(
                    command.state.apply(this, args)
                )
            );
        }
        const value = command.do.apply(this, args);
        this.doEvent.notify(commandType, args);
        const id = state ? state.id : null;

        return {
            value,
            isPass: function(isPass, skipCount) {
                this.isPassById(id, isPass, skipCount);
            }.bind(this),
        };
    }

    undo(commandType, ...args) {
        this.report(RoCode.STATIC.COMMAND_TYPES.undo);

        const command = RoCode.Command[commandType];

        let state;
        if (RoCode.stateManager && command.skipUndoStack !== true) {
            state = RoCode.stateManager.addCommand.apply(
                RoCode.stateManager,
                [commandType, this, this.do, command.undo].concat(command.state.apply(this, args))
            );
        }
        return {
            value: command.do.apply(this, args),
            isPass: function(isPass) {
                this.isPassById(state.id, isPass);
            }.bind(this),
        };
    }

    redo(commandType, ...args) {
        this.report(RoCode.STATIC.COMMAND_TYPES.redo);

        const command = RoCode.Command[commandType];

        if (RoCode.stateManager && command.skipUndoStack !== true) {
            RoCode.stateManager.addCommand.apply(
                RoCode.stateManager,
                [commandType, this, this.undo, commandType].concat(command.state.apply(null, args))
            );
        }
        command.undo.apply(this, args);
    }

    setCurrentEditor(key, object) {
        this.editor[key] = object;
    }

    isPass(isPass = true) {
        if (!RoCode.stateManager) {
            return;
        }

        const lastCommand = RoCode.stateManager.getLastCommand();
        if (lastCommand) {
            lastCommand.isPass = isPass;
        }
    }

    isPassById(id, isPass = true, skipCount = 0) {
        if (!id || !RoCode.stateManager) {
            return;
        }

        const lastCommand = RoCode.stateManager.getLastCommandById(id);
        if (lastCommand) {
            lastCommand.isPass = isPass;
            if (skipCount) {
                lastCommand.skipCount = !!skipCount;
            }
        }
    }

    addReporter(reporter) {
        reporter.logEventListener = this.logEvent.attach(reporter, reporter.add);
    }

    removeReporter(reporter) {
        if (reporter.logEventListener) {
            this.logEvent.detatch(reporter.logEventListener);
        }
        delete reporter.logEventListener;
    }

    report(commandType, argumentsArray) {
        let data;

        if (commandType && RoCode.Command[commandType] && RoCode.Command[commandType].log) {
            data = RoCode.Command[commandType].log.apply(this, argumentsArray);
        } else {
            data = argumentsArray;
        }
        data.unshift(commandType);
        this.logEvent.notify(data);
    }

    applyOption() {
        this.doCommandAll = RoCode.doCommandAll;
    }

    _checkIsSkip(commandType) {
        const { skipUndoStack } = RoCode.Command[commandType];
        return (
            skipUndoStack === true ||
            (!RoCode.doCommandAll && _.includes(RoCode.STATIC.COMMAND_TYPES_NOT_ALWAYS, commandType))
        );
    }
}

RoCode.Commander = RoCodeCommander;
