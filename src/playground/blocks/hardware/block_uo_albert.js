'use strict';

function UoAlbertRobot(index) {
    this.sensory = {
        signalStrength: 0,
        leftProximity: 0,
        rightProximity: 0,
        accelerationX: 0,
        accelerationY: 0,
        accelerationZ: 0,
        positionX: -1,
        positionY: -1,
        light: 0,
        temperature: 0,
        touch: 0,
        oid: -1,
        pulseCount: 0,
        batteryState: 2,
        tilt: 0,
    };
    this.motoring = {
        group: 'uoalbert',
        module: 'uoalbert',
        index,
    };
    this.pulseId = 0;
    this.soundId = 0;
    this.motionId = 0;
    this.wheelStateId = -1;
    this.soundStateId = -1;
    this.clickedId = -1;
    this.longPressedId = -1;
    this.longLongPressedId = -1;
    this.blockId = 0;
    this.motionCallback = undefined;
    this.soundCallback = undefined;
    this.noteBlockId = 0;
    this.noteTimer1 = undefined;
    this.noteTimer2 = undefined;
    this.clicked = false;
    this.longPressed = false;
    this.longLongPressed = false;
    this.tempo = 60;
    this.timeouts = [];
}

UoAlbertRobot.prototype.__PORT_MAP = {
    group: 'uoalbert',
    module: 'uoalbert',
    leftWheel: 0,
    rightWheel: 0,
    leftRgb: '0,0,0',
    leftRed: 0,
    leftGreen: 0,
    leftBlue: 0,
    rightRgb: '0,0,0',
    rightRed: 0,
    rightGreen: 0,
    rightBlue: 0,
    buzzer: 0,
    pulse: 0,
    pulseId: 0,
    note: 0,
    sound: 0,
    soundRepeat: 1,
    soundId: 0,
    boardWidth: 0,
    boardHeight: 0,
    motionId: 0,
    motionType: 0,
    motionUnit: 0,
    motionSpeed: 0,
    motionValue: 0,
    motionRadius: 0,
};

UoAlbertRobot.prototype.setZero = function() {
    const portMap = this.__PORT_MAP;
    const motoring = this.motoring;
    for (const port in portMap) {
        motoring[port] = portMap[port];
    }
    this.pulseId = 0;
    this.soundId = 0;
    this.motionId = 0;
    this.wheelStateId = -1;
    this.soundStateId = -1;
    this.clickedId = -1;
    this.longPressedId = -1;
    this.longLongPressedId = -1;
    this.blockId = 0;
    this.motionCallback = undefined;
    this.soundCallback = undefined;
    this.noteBlockId = 0;
    this.noteTimer1 = undefined;
    this.noteTimer2 = undefined;
    this.clicked = false;
    this.longPressed = false;
    this.longLongPressed = false;
    this.tempo = 60;
    this.__removeAllTimeouts();
};

UoAlbertRobot.prototype.afterReceive = function(pd) {
    this.sensory = pd;
    this.handleSensory();
};

UoAlbertRobot.prototype.afterSend = function(sq) {
    this.clicked = false;
    this.longPressed = false;
    this.longLongPressed = false;
};

UoAlbertRobot.prototype.setMotoring = function(motoring) {
    this.motoring = motoring;
};

UoAlbertRobot.prototype.__setModule = function() {
    this.motoring.group = 'uoalbert';
    this.motoring.module = 'uoalbert';
};

UoAlbertRobot.prototype.__removeTimeout = function(id) {
    clearTimeout(id);
    const idx = this.timeouts.indexOf(id);
    if (idx >= 0) {
        this.timeouts.splice(idx, 1);
    }
};

UoAlbertRobot.prototype.__removeAllTimeouts = function() {
    const timeouts = this.timeouts;
    for (const i in timeouts) {
        clearTimeout(timeouts[i]);
    }
    this.timeouts = [];
};

UoAlbertRobot.prototype.__setPulse = function(pulse) {
    this.pulseId = (this.pulseId % 255) + 1;
    this.motoring.pulse = pulse;
    this.motoring.pulseId = this.pulseId;
};

UoAlbertRobot.prototype.__setMotion = function(type, unit, speed, value, radius) {
    this.motionId = (this.motionId % 255) + 1;
    const motoring = this.motoring;
    motoring.motionType = type;
    motoring.motionUnit = unit;
    motoring.motionSpeed = speed;
    motoring.motionValue = value;
    motoring.motionRadius = radius;
    motoring.motionId = this.motionId;
};

UoAlbertRobot.prototype.__cancelMotion = function() {
    this.motionCallback = undefined;
};

UoAlbertRobot.prototype.__runSound = function(sound, count) {
    if (typeof count != 'number') {
        count = 1;
    }
    if (count < 0) {
        count = -1;
    }
    if (count) {
        this.soundId = (this.soundId % 255) + 1;
        const motoring = this.motoring;
        motoring.sound = sound;
        motoring.soundRepeat = count;
        motoring.soundId = this.soundId;
    }
};

UoAlbertRobot.prototype.__cancelSound = function() {
    this.soundCallback = undefined;
};

UoAlbertRobot.prototype.__issueNoteBlockId = function() {
    this.noteBlockId = this.blockId = (this.blockId % 65535) + 1;
    return this.noteBlockId;
};

UoAlbertRobot.prototype.__cancelNote = function() {
    this.noteBlockId = 0;
    if (this.noteTimer1 !== undefined) {
        this.__removeTimeout(this.noteTimer1);
    }
    if (this.noteTimer2 !== undefined) {
        this.__removeTimeout(this.noteTimer2);
    }
    this.noteTimer1 = undefined;
    this.noteTimer2 = undefined;
};

UoAlbertRobot.prototype.handleSensory = function() {
    const self = this;
    const sensory = self.sensory;

    self.clicked = sensory.clicked == 1;
    self.longPressed = sensory.longPressed == 1;
    self.longLongPressed = sensory.longLongPressed == 1;

    if (self.motionCallback) {
        if (sensory.wheelStateId != self.wheelStateId) {
            self.wheelStateId = sensory.wheelStateId;
            if (sensory.wheelState == 0) {
                self.motoring.leftWheel = 0;
                self.motoring.rightWheel = 0;
                var callback = self.motionCallback;
                self.__cancelMotion();
                if (callback) {
                    callback();
                }
            }
        }
    }
    if (self.soundCallback) {
        if (sensory.soundStateId != self.soundStateId) {
            self.soundStateId = sensory.soundStateId;
            if (sensory.soundState == 0) {
                var callback = self.soundCallback;
                self.__cancelSound();
                if (callback) {
                    callback();
                }
            }
        }
    }
};

UoAlbertRobot.prototype.__SENSORS = {
    SIGNAL_STRENGTH: 'signalStrength',
    LEFT_PROXIMITY: 'leftProximity',
    RIGHT_PROXIMITY: 'rightProximity',
    ACCELERATION_X: 'accelerationX',
    ACCELERATION_Y: 'accelerationY',
    ACCELERATION_Z: 'accelerationZ',
    POSITION_X: 'positionX',
    POSITION_Y: 'positionY',
    LIGHT: 'light',
    TEMPERATURE: 'temperature',
    TOUCH: 'touch',
    OID: 'oid',
    PULSE_COUNT: 'pulseCount',
    BATTERY_STATE: 'batteryState',
    TILT: 'tilt',
};

UoAlbertRobot.prototype.getValue = function(script) {
    this.__setModule();
    const dev = script.getField('DEVICE');

    const sensor = this.__SENSORS[dev] || dev;
    return this.sensory[sensor];
};

UoAlbertRobot.prototype.checkBoolean = function(script) {
    this.__setModule();
    var sensory = this.sensory;
    var value = 0;
    var dev = script.getField('DEVICE');
    if(dev.startsWith('TILT')) {
        if(sensory.tilt === undefined) {
            if(sensory.accelerationZ < 2048 && sensory.accelerationX > 2048 && sensory.accelerationY > -1024 && sensory.accelerationY < 1024) value = 1;
            else if(sensory.accelerationZ < 2048 && sensory.accelerationX < -2048 && sensory.accelerationY > -1024 && sensory.accelerationY < 1024) value = -1;
            else if(sensory.accelerationZ < 2048 && sensory.accelerationY > 2048 && sensory.accelerationX > -1024 && sensory.accelerationX < 1024) value = 2;
            else if(sensory.accelerationZ < 2048 && sensory.accelerationY < -2048 && sensory.accelerationX > -1024 && sensory.accelerationX < 1024) value = -2;
            else if(sensory.accelerationZ > 3072 && sensory.accelerationX > -2048 && sensory.accelerationX < 2048 && sensory.accelerationY > -2048 && sensory.accelerationY < 2048) value = 3;
            else if(sensory.accelerationZ < -3072 && sensory.accelerationX > -1024 && sensory.accelerationX < 1024 && sensory.accelerationY > -1024 && sensory.accelerationY < 1024) value = -3;
            else value = 0;
        } else {
            value = sensory.tilt;
        }
        switch(dev) {
            case 'TILT_FORWARD': return value == 1;
            case 'TILT_BACKWARD': return value == -1;
            case 'TILT_LEFT': return value == 2;
            case 'TILT_RIGHT': return value == -2;
            case 'TILT_FLIP': return value == 3;
            case 'TILT_NOT': return value == -3;
        }
        return false;
    } else {
        switch (dev) {
            case 'BATTERY_NORMAL': return sensory.batteryState === 2;
            case 'BATTERY_LOW': return sensory.batteryState === 1;
            case 'BATTERY_EMPTY': return sensory.batteryState === 0;
        }
        return false;
    }
};

UoAlbertRobot.prototype.checkHandFound = function(script) {
    this.__setModule();
    var sensory = this.sensory;
    return sensory.handFound === undefined ? sensory.leftProximity > 40 || sensory.rightProximity > 40 : sensory.handFound;
};

UoAlbertRobot.prototype.checkTouchState = function(script) {
    this.__setModule();
    const state = script.getField('STATE');
    switch(state) {
        case 'CLICKED': return this.clicked;
        case 'LONG_PRESSED': return this.longPressed;
        case 'LONG_LONG_PRESSED': return this.longLongPressed;
    }
    return false;
};

UoAlbertRobot.prototype.checkOid = function(script) {
    this.__setModule();
    var value = script.getNumberValue('VALUE');
    return this.sensory.oid == value;
};

UoAlbertRobot.prototype.__motionUnit = function(type, unit, value, callback) {
    const motoring = this.motoring;
    this.__cancelMotion();

    motoring.leftWheel = 0;
    motoring.rightWheel = 0;
    this.__setPulse(0);
    value = parseFloat(value);
    if (value && value > 0) {
        this.__setMotion(type, unit, 0, value, 0); // type, unit, speed, value, radius
        this.motionCallback = callback;
    } else {
        this.__setMotion(0, 0, 0, 0, 0);
        callback();
    }
};

UoAlbertRobot.prototype.__UNITS = {
    CM: 1,
    DEG: 1,
    SEC: 2,
    PULSE: 3,
};

UoAlbertRobot.prototype.moveForwardUnit = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;

        const value = script.getNumberValue('VALUE');
        const unit = script.getField('UNIT');

        if (value < 0) {
            this.__motionUnit(2, this.__UNITS[unit], -value, () => {
                script.isMoving = false;
            });
        } else {
            this.__motionUnit(1, this.__UNITS[unit], value, () => {
                script.isMoving = false;
            });
        }
        return script;
    } else if (script.isMoving) {
        return script;
    } else {
        delete script.isStart;
        delete script.isMoving;
        RoCode.engine.isContinue = false;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.moveBackwardUnit = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;

        const value = script.getNumberValue('VALUE');
        const unit = script.getField('UNIT');

        if (value < 0) {
            this.__motionUnit(1, this.__UNITS[unit], -value, () => {
                script.isMoving = false;
            });
        } else {
            this.__motionUnit(2, this.__UNITS[unit], value, () => {
                script.isMoving = false;
            });
        }
        return script;
    } else if (script.isMoving) {
        return script;
    } else {
        delete script.isStart;
        delete script.isMoving;
        RoCode.engine.isContinue = false;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.turnUnit = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;

        const direction = script.getField('DIRECTION');
        const value = script.getNumberValue('VALUE');
        const unit = script.getField('UNIT');

        if (direction == 'LEFT') {
            if (value < 0) {
                this.__motionUnit(4, this.__UNITS[unit], -value, () => {
                    script.isMoving = false;
                });
            } else {
                this.__motionUnit(3, this.__UNITS[unit], value, () => {
                    script.isMoving = false;
                });
            }
        } else {
            if (value < 0) {
                this.__motionUnit(3, this.__UNITS[unit], -value, () => {
                    script.isMoving = false;
                });
            } else {
                this.__motionUnit(4, this.__UNITS[unit], value, () => {
                    script.isMoving = false;
                });
            }
        }
        return script;
    } else if (script.isMoving) {
        return script;
    } else {
        delete script.isStart;
        delete script.isMoving;
        RoCode.engine.isContinue = false;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.pivotUnit = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;

        const wheel = script.getField('WHEEL');
        const value = script.getNumberValue('VALUE');
        let unit = script.getField('UNIT');
        const toward = script.getField('TOWARD');

        unit = this.__UNITS[unit];
        if (wheel == 'LEFT') {
            if (toward == 'FORWARD') {
                if (value < 0) {
                    this.__motionUnit(6, unit, -value, () => {
                        script.isMoving = false;
                    });
                } else {
                    this.__motionUnit(5, unit, value, () => {
                        script.isMoving = false;
                    });
                }
            } else {
                if (value < 0) {
                    this.__motionUnit(5, unit, -value, () => {
                        script.isMoving = false;
                    });
                } else {
                    this.__motionUnit(6, unit, value, () => {
                        script.isMoving = false;
                    });
                }
            }
        } else {
            if (toward == 'FORWARD') {
                if (value < 0) {
                    this.__motionUnit(8, unit, -value, () => {
                        script.isMoving = false;
                    });
                } else {
                    this.__motionUnit(7, unit, value, () => {
                        script.isMoving = false;
                    });
                }
            } else {
                if (value < 0) {
                    this.__motionUnit(7, unit, -value, () => {
                        script.isMoving = false;
                    });
                } else {
                    this.__motionUnit(8, unit, value, () => {
                        script.isMoving = false;
                    });
                }
            }
        }
        return script;
    } else if (script.isMoving) {
        return script;
    } else {
        delete script.isStart;
        delete script.isMoving;
        RoCode.engine.isContinue = false;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.setWheels = function(script) {
    const motoring = this.motoring;
    this.__setModule();
    this.__cancelMotion();

    let leftVelocity = script.getNumberValue('LEFT');
    let rightVelocity = script.getNumberValue('RIGHT');

    leftVelocity = parseFloat(leftVelocity);
    rightVelocity = parseFloat(rightVelocity);
    if (typeof leftVelocity == 'number') {
        motoring.leftWheel = leftVelocity;
    }
    if (typeof rightVelocity == 'number') {
        motoring.rightWheel = rightVelocity;
    }
    this.__setPulse(0);
    this.__setMotion(0, 0, 0, 0, 0);
    return script.callReturn();
};

UoAlbertRobot.prototype.changeWheels = function(script) {
    const motoring = this.motoring;
    this.__setModule();
    this.__cancelMotion();

    let leftVelocity = script.getNumberValue('LEFT');
    let rightVelocity = script.getNumberValue('RIGHT');

    leftVelocity = parseFloat(leftVelocity);
    rightVelocity = parseFloat(rightVelocity);
    if (typeof leftVelocity == 'number') {
        motoring.leftWheel =
            motoring.leftWheel !== undefined ? motoring.leftWheel + leftVelocity : leftVelocity;
    }
    if (typeof rightVelocity == 'number') {
        motoring.rightWheel =
            motoring.rightWheel !== undefined ? motoring.rightWheel + rightVelocity : rightVelocity;
    }
    this.__setPulse(0);
    this.__setMotion(0, 0, 0, 0, 0);
    return script.callReturn();
};

UoAlbertRobot.prototype.setWheel = function(script) {
    const motoring = this.motoring;
    this.__setModule();
    this.__cancelMotion();

    const wheel = script.getField('WHEEL');
    let velocity = script.getNumberValue('VELOCITY');

    velocity = parseFloat(velocity);
    if (typeof velocity == 'number') {
        if (wheel == 'LEFT') {
            motoring.leftWheel = velocity;
        } else if (wheel == 'RIGHT') {
            motoring.rightWheel = velocity;
        } else {
            motoring.leftWheel = velocity;
            motoring.rightWheel = velocity;
        }
    }
    this.__setPulse(0);
    this.__setMotion(0, 0, 0, 0, 0);
    return script.callReturn();
};

UoAlbertRobot.prototype.changeWheel = function(script) {
    const motoring = this.motoring;
    this.__setModule();
    this.__cancelMotion();

    const wheel = script.getField('WHEEL');
    let velocity = script.getNumberValue('VELOCITY');

    velocity = parseFloat(velocity);
    if (typeof velocity == 'number') {
        if (wheel == 'LEFT') {
            motoring.leftWheel =
                motoring.leftWheel != undefined ? motoring.leftWheel + velocity : velocity;
        } else if (wheel == 'RIGHT') {
            motoring.rightWheel =
                motoring.rightWheel != undefined ? motoring.rightWheel + velocity : velocity;
        } else {
            motoring.leftWheel =
                motoring.leftWheel != undefined ? motoring.leftWheel + velocity : velocity;
            motoring.rightWheel =
                motoring.rightWheel != undefined ? motoring.rightWheel + velocity : velocity;
        }
    }
    this.__setPulse(0);
    this.__setMotion(0, 0, 0, 0, 0);
    return script.callReturn();
};

UoAlbertRobot.prototype.stop = function(script) {
    this.__setModule();
    this.__cancelMotion();

    const motoring = this.motoring;
    motoring.leftWheel = 0;
    motoring.rightWheel = 0;
    this.__setPulse(0);
    this.__setMotion(0, 0, 0, 0, 0);
    return script.callReturn();
};

UoAlbertRobot.prototype.setBoardSize = function(script) {
    const motoring = this.motoring;
    this.__setModule();

    let width = script.getNumberValue('WIDTH');
    let height = script.getNumberValue('HEIGHT');

    width = parseInt(width);
    height = parseInt(height);
    if(width && height && width > 0 && height > 0) {
        motoring.boardWidth = width;
        motoring.boardHeight = height;
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.__RGB_COLORS = {
    RED: [255, 0, 0],
    ORANGE: [255, 63, 0],
    YELLOW: [255, 255, 0],
    GREEN: [0, 255, 0],
    SKY_BLUE: [0, 255, 255],
    BLUE: [0, 0, 255],
    VIOLET: [63, 0, 255],
    PURPLE: [255, 0, 255],
    WHITE: [255, 255, 255],
};

UoAlbertRobot.prototype.setEyeColor = function(script) {
    this.__setModule();
    const eye = script.getField('EYE');
    const color = script.getField('COLOR');

    const rgb = this.__RGB_COLORS[color];
    if (rgb) {
        const motoring = this.motoring;
        if (eye == 'LEFT') {
            motoring.leftRgb = `${rgb[0]},${rgb[1]},${rgb[2]}`;
            motoring.leftRed = rgb[0];
            motoring.leftGreen = rgb[1];
            motoring.leftBlue = rgb[2];
        } else if (eye == 'RIGHT') {
            motoring.rightRgb = `${rgb[0]},${rgb[1]},${rgb[2]}`;
            motoring.rightRed = rgb[0];
            motoring.rightGreen = rgb[1];
            motoring.rightBlue = rgb[2];
        } else {
            motoring.leftRgb = `${rgb[0]},${rgb[1]},${rgb[2]}`;
            motoring.leftRed = rgb[0];
            motoring.leftGreen = rgb[1];
            motoring.leftBlue = rgb[2];
            motoring.rightRgb = `${rgb[0]},${rgb[1]},${rgb[2]}`;
            motoring.rightRed = rgb[0];
            motoring.rightGreen = rgb[1];
            motoring.rightBlue = rgb[2];
        }
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.pickEyeColor = function(script) {
    this.__setModule();
    const eye = script.getField('EYE');
    const color = script.getField('COLOR');

    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);

    const motoring = this.motoring;
    if (eye == 'LEFT') {
        motoring.leftRgb = `${red},${green},${blue}`;
        motoring.leftRed = red;
        motoring.leftGreen = green;
        motoring.leftBlue = blue;
    } else if (eye == 'RIGHT') {
        motoring.rightRgb = `${red},${green},${blue}`;
        motoring.rightRed = red;
        motoring.rightGreen = green;
        motoring.rightBlue = blue;
    } else {
        motoring.leftRgb = `${red},${green},${blue}`;
        motoring.leftRed = red;
        motoring.leftGreen = green;
        motoring.leftBlue = blue;
        motoring.rightRgb = `${red},${green},${blue}`;
        motoring.rightRed = red;
        motoring.rightGreen = green;
        motoring.rightBlue = blue;
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.setEyeRgb = function(script) {
    this.__setModule();
    const eye = script.getField('EYE');
    let red = script.getNumberValue('RED');
    let green = script.getNumberValue('GREEN');
    let blue = script.getNumberValue('BLUE');

    const motoring = this.motoring;
    red = parseInt(red);
    green = parseInt(green);
    blue = parseInt(blue);
    if (eye == 'LEFT') {
        if (typeof red == 'number') {
            motoring.leftRed = red;
        }
        if (typeof green == 'number') {
            motoring.leftGreen = green;
        }
        if (typeof blue == 'number') {
            motoring.leftBlue = blue;
        }
        motoring.leftRgb = `${motoring.leftRed},${motoring.leftGreen},${motoring.leftBlue}`;
    } else if (eye == 'RIGHT') {
        if (typeof red == 'number') {
            motoring.rightRed = red;
        }
        if (typeof green == 'number') {
            motoring.rightGreen = green;
        }
        if (typeof blue == 'number') {
            motoring.rightBlue = blue;
        }
        motoring.rightRgb = `${motoring.rightRed},${motoring.rightGreen},${motoring.rightBlue}`;
    } else {
        if (typeof red == 'number') {
            motoring.leftRed = red;
            motoring.rightRed = red;
        }
        if (typeof green == 'number') {
            motoring.leftGreen = green;
            motoring.rightGreen = green;
        }
        if (typeof blue == 'number') {
            motoring.leftBlue = blue;
            motoring.rightBlue = blue;
        }
        motoring.leftRgb = `${motoring.leftRed},${motoring.leftGreen},${motoring.leftBlue}`;
        motoring.rightRgb = `${motoring.rightRed},${motoring.rightGreen},${motoring.rightBlue}`;
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.changeEyeRgb = function(script) {
    this.__setModule();
    const eye = script.getField('EYE');
    let red = script.getNumberValue('RED');
    let green = script.getNumberValue('GREEN');
    let blue = script.getNumberValue('BLUE');

    const motoring = this.motoring;
    red = parseInt(red);
    green = parseInt(green);
    blue = parseInt(blue);
    if (eye == 'LEFT') {
        if (typeof red == 'number') {
            motoring.leftRed += red;
        }
        if (typeof green == 'number') {
            motoring.leftGreen += green;
        }
        if (typeof blue == 'number') {
            motoring.leftBlue += blue;
        }
        motoring.leftRgb = `${motoring.leftRed},${motoring.leftGreen},${motoring.leftBlue}`;
    } else if (eye == 'RIGHT') {
        if (typeof red == 'number') {
            motoring.rightRed += red;
        }
        if (typeof green == 'number') {
            motoring.rightGreen += green;
        }
        if (typeof blue == 'number') {
            motoring.rightBlue += blue;
        }
        motoring.rightRgb = `${motoring.rightRed},${motoring.rightGreen},${motoring.rightBlue}`;
    } else {
        if (typeof red == 'number') {
            motoring.leftRed += red;
            motoring.rightRed += red;
        }
        if (typeof green == 'number') {
            motoring.leftGreen += green;
            motoring.rightGreen += green;
        }
        if (typeof blue == 'number') {
            motoring.leftBlue += blue;
            motoring.rightBlue += blue;
        }
        motoring.leftRgb = `${motoring.leftRed},${motoring.leftGreen},${motoring.leftBlue}`;
        motoring.rightRgb = `${motoring.rightRed},${motoring.rightGreen},${motoring.rightBlue}`;
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.clearEye = function(script) {
    this.__setModule();
    const eye = script.getField('EYE');

    const motoring = this.motoring;
    if (eye == 'LEFT') {
        motoring.leftRgb = '0,0,0';
        motoring.leftRed = 0;
        motoring.leftGreen = 0;
        motoring.leftBlue = 0;
    } else if (eye == 'RIGHT') {
        motoring.rightRgb = '0,0,0';
        motoring.rightRed = 0;
        motoring.rightGreen = 0;
        motoring.rightBlue = 0;
    } else {
        motoring.leftRgb = '0,0,0';
        motoring.leftRed = 0;
        motoring.leftGreen = 0;
        motoring.leftBlue = 0;
        motoring.rightRgb = '0,0,0';
        motoring.rightRed = 0;
        motoring.rightGreen = 0;
        motoring.rightBlue = 0;
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.__SOUNDS = {
    BEEP: 1,
    SIREN: 2,
    ENGINE: 3,
    ROBOT: 4,
    MARCH: 5,
    BIRTHDAY: 6,
    DIBIDIBIDIP: 7,
};

UoAlbertRobot.prototype.playSound = function(script) {
    this.__setModule();
    this.__cancelNote();
    this.__cancelSound();

    let sound = script.getField('SOUND');
    let count = script.getNumberValue('COUNT');

    sound = this.__SOUNDS[sound];
    count = parseInt(count);
    this.motoring.buzzer = 0;
    this.motoring.note = 0;
    if (sound && count) {
        this.__runSound(sound, count);
    } else {
        this.__runSound(0);
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.playSoundUntil = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isPlaying = true;
        this.__cancelNote();
        this.__cancelSound();

        let sound = script.getField('SOUND');
        let count = script.getNumberValue('COUNT');

        sound = this.__SOUNDS[sound];
        count = parseInt(count);
        this.motoring.buzzer = 0;
        this.motoring.note = 0;
        if (sound && count) {
            this.__runSound(sound, count);
            this.soundCallback = function() {
                script.isPlaying = false;
            };
        } else {
            this.__runSound(0);
            script.isPlaying = false;
        }
        return script;
    } else if (script.isPlaying) {
        return script;
    } else {
        delete script.isStart;
        delete script.isPlaying;
        RoCode.engine.isContinue = false;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.setBuzzer = function(script) {
    this.__setModule();
    this.__cancelNote();
    this.__cancelSound();
    let hz = script.getNumberValue('HZ');

    hz = parseFloat(hz);
    if (typeof hz == 'number') {
        this.motoring.buzzer = hz;
    }
    this.motoring.note = 0;
    this.__runSound(0);
    return script.callReturn();
};

UoAlbertRobot.prototype.changeBuzzer = function(script) {
    this.__setModule();
    this.__cancelNote();
    this.__cancelSound();
    let hz = script.getNumberValue('HZ');

    const motoring = this.motoring;
    hz = parseFloat(hz);
    if (typeof hz == 'number') {
        motoring.buzzer = motoring.buzzer != undefined ? motoring.buzzer + hz : hz;
    }
    motoring.note = 0;
    this.__runSound(0);
    return script.callReturn();
};

UoAlbertRobot.prototype.clearSound = function(script, motoring) {
    this.__setModule();
    this.__cancelNote();
    this.__cancelSound();

    this.motoring.buzzer = 0;
    this.motoring.note = 0;
    this.__runSound(0);
    return script.callReturn();
};

UoAlbertRobot.prototype.__NOTES = {
    C: 4,
    'C#': 5,
    Db: 5,
    D: 6,
    'D#': 7,
    Eb: 7,
    E: 8,
    F: 9,
    'F#': 10,
    Gb: 10,
    G: 11,
    'G#': 12,
    Ab: 12,
    A: 13,
    'A#': 14,
    Bb: 14,
    B: 15,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    '11': 11,
    '12': 12,
    '13': 13,
    '14': 14,
    '15': 15,
};

UoAlbertRobot.prototype.playNote = function(script) {
    this.__setModule();
    this.__cancelNote();
    this.__cancelSound();

    let note = script.getField('NOTE');
    let octave = script.getNumberField('OCTAVE');

    note = parseInt(this.__NOTES[note]);
    octave = parseInt(octave);
    const motoring = this.motoring;
    motoring.buzzer = 0;
    if (note && octave && octave > 0 && octave < 8) {
        motoring.note = note + (octave - 1) * 12;
    } else {
        motoring.note = 0;
    }
    this.__runSound(0);
    return script.callReturn();
};

UoAlbertRobot.prototype.playNoteBeat = function(script) {
    const self = this;
    self.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isPlaying = true;
        self.__cancelNote();
        self.__cancelSound();

        const motoring = self.motoring;
        let note = script.getField('NOTE');
        let octave = script.getNumberField('OCTAVE');
        let beat = script.getNumberValue('BEAT');

        note = parseInt(this.__NOTES[note]);
        octave = parseInt(octave);
        beat = parseFloat(beat);
        motoring.buzzer = 0;
        if (note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
            const id = self.__issueNoteBlockId();
            note += (octave - 1) * 12;
            motoring.note = note;
            const timeValue = (beat * 60 * 1000) / self.tempo;
            if (timeValue > 100) {
                self.noteTimer1 = setTimeout(() => {
                    if (self.noteBlockId == id) {
                        motoring.note = 0;
                        if (self.noteTimer1 !== undefined) {
                            self.__removeTimeout(self.noteTimer1);
                        }
                        self.noteTimer1 = undefined;
                    }
                }, timeValue - 100);
                self.timeouts.push(self.noteTimer1);
            }
            self.noteTimer2 = setTimeout(() => {
                if (self.noteBlockId == id) {
                    motoring.note = 0;
                    self.__cancelNote();
                    script.isPlaying = false;
                }
            }, timeValue);
            self.timeouts.push(self.noteTimer2);
            self.__runSound(0);
        } else {
            motoring.note = 0;
            self.__runSound(0);
            script.isPlaying = false;
        }
        return script;
    } else if (script.isPlaying) {
        return script;
    } else {
        delete script.isStart;
        delete script.isPlaying;
        RoCode.engine.isContinue = false;
        self.motoring.note = 0;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.restBeat = function(script) {
    const self = this;
    self.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isPlaying = true;
        self.__cancelNote();
        self.__cancelSound();
        let beat = script.getNumberValue('BEAT');

        const motoring = self.motoring;
        beat = parseFloat(beat);
        motoring.buzzer = 0;
        motoring.note = 0;
        self.__runSound(0);
        if (beat && beat > 0 && self.tempo > 0) {
            const id = self.__issueNoteBlockId();
            const timeValue = (beat * 60 * 1000) / self.tempo;
            self.noteTimer1 = setTimeout(() => {
                if (self.noteBlockId == id) {
                    self.__cancelNote();
                    script.isPlaying = false;
                }
            }, timeValue);
            self.timeouts.push(self.noteTimer1);
        } else {
            script.isPlaying = false;
        }
        return script;
    } else if (script.isPlaying) {
        return script;
    } else {
        delete script.isStart;
        delete script.isPlaying;
        RoCode.engine.isContinue = false;
        return script.callReturn();
    }
};

UoAlbertRobot.prototype.setTempo = function(script) {
    this.__setModule();
    let bpm = script.getNumberValue('BPM');

    bpm = parseFloat(bpm);
    if (typeof bpm == 'number') {
        this.tempo = bpm;
        if (this.tempo < 1) {
            this.tempo = 1;
        }
    }
    return script.callReturn();
};

UoAlbertRobot.prototype.changeTempo = function(script) {
    this.__setModule();
    let bpm = script.getNumberValue('BPM');

    bpm = parseFloat(bpm);
    if (typeof bpm == 'number') {
        this.tempo += bpm;
        if (this.tempo < 1) {
            this.tempo = 1;
        }
    }
    return script.callReturn();
};

RoCode.UoAlbert = {
    robot: undefined,
    getRobot() {
        if(RoCode.UoAlbert.robot == undefined) RoCode.UoAlbert.robot = new UoAlbertRobot(0);
        RoCode.UoAlbert.robot.setMotoring(RoCode.hw.sendQueue);
        return RoCode.UoAlbert.robot;
    },
    setZero() {
        if(RoCode.UoAlbert.robot) RoCode.UoAlbert.robot.setZero();
        RoCode.hw.update();
    },
    afterReceive(pd) {
        const robot = RoCode.UoAlbert.getRobot();
        if(robot) robot.afterReceive(pd);
    },
    afterSend(sq) {
        const robot = RoCode.UoAlbert.getRobot();
        if(robot) robot.afterSend(sq);
    },
    id: '2.7',
    name: 'uoalbert',
    url: 'http://albert.school',
    imageName: 'uoalbert.png',
    title: {
        en: 'UO Albert',
        ko: 'UO ?????????',
        jp: 'UO???????????????',
        vn: 'UO Albert',
    },
    monitorTemplate: () => ({
        imgPath: 'hw/uoalbert.png',
        width: 300,
        height: 434,
        listPorts: {
            accelerationX: {
                name: Lang.Blocks.ROBOID_sensor_acceleration_x,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            accelerationY: {
                name: Lang.Blocks.ROBOID_sensor_acceleration_y,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            accelerationZ: {
                name: Lang.Blocks.ROBOID_sensor_acceleration_z,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            oid: {
                name: Lang.Blocks.ROBOID_sensor_oid,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            positionX: {
                name: Lang.Blocks.ROBOID_sensor_position_x,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            positionY: {
                name: Lang.Blocks.ROBOID_sensor_position_y,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            temperature: {
                name: Lang.Blocks.ROBOID_sensor_temperature,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            signalStrength: {
                name: Lang.Blocks.ROBOID_sensor_signal_strength,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            buzzer: {
                name: Lang.Blocks.ROBOID_monitor_buzzer,
                type: 'output',
                pos: { x: 0, y: 0 },
            },
            note: {
                name: Lang.Blocks.ROBOID_monitor_note,
                type: 'output',
                pos: { x: 0, y: 0 },
            },
        },
        ports: {
            leftProximity: {
                name: Lang.Blocks.ROBOID_sensor_left_proximity,
                type: 'input',
                pos: { x: 150, y: 358 },
            },
            rightProximity: {
                name: Lang.Blocks.ROBOID_sensor_right_proximity,
                type: 'input',
                pos: { x: 39, y: 322 },
            },
            touch: {
                name: Lang.Blocks.ROBOID_sensor_touch,
                type: 'input',
                pos: { x: 103, y: 228 },
            },
            light: {
                name: Lang.Blocks.ROBOID_sensor_light,
                type: 'input',
                pos: { x: 91, y: 343 },
            },
            leftWheel: {
                name: Lang.Blocks.ROBOID_monitor_left_wheel,
                type: 'output',
                pos: { x: 208, y: 411 },
            },
            rightWheel: {
                name: Lang.Blocks.ROBOID_monitor_right_wheel,
                type: 'output',
                pos: { x: 31, y: 349 },
            },
            leftRgb: {
                name: Lang.Blocks.ROBOID_monitor_left_eye,
                type: 'output',
                pos: { x: 230, y: 64 },
            },
            rightRgb: {
                name: Lang.Blocks.ROBOID_monitor_right_eye,
                type: 'output',
                pos: { x: 124, y: 44 },
            },
        },
        mode: 'both',
    }),
};

RoCode.UoAlbert.setLanguage = () => ({
    ko: {
        template: {
            uoalbert_value: '%1',
            uoalbert_hand_found: '??? ???????',
            uoalbert_touch_state: '?????? ????????? %1 ?',
            uoalbert_is_oid: 'OID??? %1???????',
            uoalbert_boolean: '%1?',
            uoalbert_move_forward_unit: '????????? %1 %2 ???????????? %3',
            uoalbert_move_backward_unit: '?????? %1 %2 ???????????? %3',
            uoalbert_turn_unit_in_place: '%1 ?????? %2 %3 ????????? ?????? %4',
            uoalbert_pivot_around_unit_in_direction: '%1 ?????? ???????????? %2 %3 %4 ???????????? ?????? %5',
            uoalbert_change_both_wheels_by: '?????? ?????? %1 ????????? ?????? %2 ?????? ????????? %3',
            uoalbert_set_both_wheels_to: '?????? ?????? %1 ????????? ?????? %2 (???)??? ????????? %3',
            uoalbert_change_wheel_by: '%1 ?????? %2 ?????? ????????? %3',
            uoalbert_set_wheel_to: '%1 ?????? %2 (???)??? ????????? %3',
            uoalbert_stop: '???????????? %1',
            uoalbert_set_board_size: '?????? ????????? ??? %1 ?????? %2(???)??? ????????? %3',
            uoalbert_set_eye_to: '%1 ?????? %2 ?????? ????????? %3',
            uoalbert_pick_eye: '%1 ?????? %2??? ????????? %3',
            uoalbert_change_eye_by_rgb: '%1 ?????? R: %2 G: %3 B: %4 ?????? ????????? %5',
            uoalbert_set_eye_to_rgb: '%1 ?????? R: %2 G: %3 B: %4 (???)??? ????????? %5',
            uoalbert_clear_eye: '%1 ??? ?????? %2',
            uoalbert_play_sound_times: '%1 ?????? %2 ??? ???????????? %3',
            uoalbert_play_sound_times_until_done: '%1 ?????? %2 ??? ???????????? ???????????? %3',
            uoalbert_change_buzzer_by: '?????? ?????? %1 ?????? ????????? %2',
            uoalbert_set_buzzer_to: '?????? ?????? %1 (???)??? ????????? %2',
            uoalbert_clear_sound: '?????? ?????? %1',
            uoalbert_play_note: '%1 %2 ?????? ???????????? %3',
            uoalbert_play_note_for: '%1 %2 ?????? %3 ?????? ???????????? %4',
            uoalbert_rest_for: '%1 ?????? ?????? %2',
            uoalbert_change_tempo_by: '?????? ????????? %1 ?????? ????????? %2',
            uoalbert_set_tempo_to: '?????? ????????? %1 BPM?????? ????????? %2',
        },
        Helper: {
            uoalbert_value: '?????? ?????? ??????: ?????? ?????? ????????? ??? (?????? ??????: 0 ~ 255, ?????????: 0)<br/>????????? ?????? ??????: ????????? ?????? ????????? ??? (?????? ??????: 0 ~ 255, ?????????: 0)<br/>x??? ?????????: ????????? ????????? X??? ??? (?????? ??????: -8192 ~ 8191, ?????????: 0) ????????? ???????????? ????????? X?????? ?????? ???????????????.<br/>y??? ?????????: ????????? ????????? Y??? ??? (?????? ??????: -8192 ~ 8191, ?????????: 0) ????????? ?????? ????????? Y?????? ?????? ???????????????.<br/>z??? ?????????: ????????? ????????? Z??? ??? (?????? ??????: -8192 ~ 8191, ?????????: 0) ????????? ?????? ????????? Z?????? ?????? ???????????????.<br/>??????: ?????? ????????? ??? (???????????? 1, ????????? 0, ?????????: 0)<br/>OID: OID ????????? ??? (?????? ??????: -1 ~ 65535, ?????????: -1)<br/>x ??????: ?????? ????????? ????????? ?????? x?????? ??? (?????? ??????: -1 ~ 39999, ?????????: -1)<br/>y ??????: ?????? ????????? ????????? ?????? y?????? ??? (?????? ??????: -1 ~ 39999, ?????????: -1)<br/>??????: ?????? ????????? ??? (?????? ??????: 0 ~ 65535, ?????????: 0) ?????? ?????? ?????? ????????????.<br/>??????: ?????? ????????? ?????? ??? (?????? ??????: ?????? -40 ~ 88???, ?????????: 0)<br/>?????? ??????: ???????????? ?????? ????????? ?????? ?????? (?????? ??????: -128 ~ 0 dBm, ?????????: 0) ????????? ????????? ????????? ?????? ????????????.',
            uoalbert_hand_found: "?????? ?????? ?????? ??? ?????? ????????? ????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            uoalbert_touch_state: "?????? ????????? ???????????????/?????? ????????????/?????? ?????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            uoalbert_is_oid: "OID ????????? ????????? OID ?????? ????????? ????????? ????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            uoalbert_boolean: "????????? ?????????: ????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>?????? ?????????: ?????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>???????????? ?????????: ???????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>??????????????? ?????????: ??????????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ?????????: ????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>???????????? ??????: ???????????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ??????: ????????? ????????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ??????: ????????? ????????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ??????: ????????? ????????? ????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            uoalbert_move_forward_unit: '????????? ??????(cm)/??????(???)/???????????? ????????? ???????????????.',
            uoalbert_move_backward_unit: '????????? ??????(cm)/??????(???)/???????????? ?????? ???????????????.',
            uoalbert_turn_unit_in_place: '????????? ??????(???)/??????(???)/???????????? ??????/????????? ???????????? ??????????????? ???????????????.',
            uoalbert_pivot_around_unit_in_direction: '??????/????????? ?????? ???????????? ????????? ??????(???)/??????(???)/???????????? ??????/?????? ???????????? ???????????????.',
            uoalbert_change_both_wheels_by: '????????? ????????? ????????? ?????? ?????? ???(%)??? ????????? ?????? ?????? ????????????. ?????? ????????? ?????? ????????? ????????? ????????? ????????????, ?????? ????????? ?????? ???????????????.',
            uoalbert_set_both_wheels_to: '????????? ????????? ????????? ????????? ????????? ???(-100 ~ 100%)?????? ?????? ???????????????. ?????? ?????? ???????????? ????????? ????????? ????????????, ?????? ?????? ???????????? ?????? ???????????????. ?????? 0??? ???????????? ???????????????.',
            uoalbert_change_wheel_by: '??????/?????????/?????? ????????? ?????? ?????? ???(%)??? ????????? ?????? ????????????. ?????? ????????? ?????? ????????? ????????? ????????? ????????????, ?????? ????????? ?????? ???????????????.',
            uoalbert_set_wheel_to: '??????/?????????/?????? ????????? ????????? ????????? ???(-100 ~ 100%)?????? ???????????????. ?????? ?????? ???????????? ????????? ????????? ????????????, ?????? ?????? ???????????? ?????? ???????????????. ?????? 0??? ???????????? ???????????????.',
            uoalbert_stop: '?????? ????????? ???????????????.',
            uoalbert_set_board_size: '????????? ?????? ????????? ????????? ????????? ???????????????.',
            uoalbert_set_eye_to: '??????/?????????/?????? ?????? ????????? ????????? ?????????.',
            uoalbert_pick_eye: '??????/?????????/?????? ?????? ????????? ????????? ?????????.',
            uoalbert_change_eye_by_rgb: '??????/?????????/?????? ?????? ?????? R, G, B ?????? ????????? ?????? ?????? ????????????.',
            uoalbert_set_eye_to_rgb: '??????/?????????/?????? ?????? R, G, B ?????? ????????? ????????? ?????? ???????????????.',
            uoalbert_clear_eye: '??????/?????????/?????? ?????? ?????????.',
            uoalbert_play_sound_times: '????????? ????????? ????????? ???????????? ???????????????.',
            uoalbert_play_sound_times_until_done: '????????? ????????? ????????? ???????????? ????????????, ????????? ????????? ????????? ???????????????.',
            uoalbert_change_buzzer_by: '?????? ????????? ?????? ??? ??????(Hz)??? ????????? ?????? ????????????. ????????? ?????? ???????????? ????????? ??? ????????????.',
            uoalbert_set_buzzer_to: '?????? ????????? ??? ????????? ????????? ???(Hz)?????? ???????????????. ????????? ?????? ???????????? ????????? ??? ????????????. ?????? 0??? ???????????? ?????? ????????? ?????????.',
            uoalbert_clear_sound: '????????? ?????????.',
            uoalbert_play_note: '????????? ???????????? ???????????? ?????? ?????? ?????? ?????????.',
            uoalbert_play_note_for: '????????? ???????????? ???????????? ?????? ????????? ???????????? ?????? ?????????.',
            uoalbert_rest_for: '????????? ???????????? ?????????.',
            uoalbert_change_tempo_by: '??????????????? ?????? ????????? ?????? BPM(?????? ?????? ???)??? ????????? ?????? ????????????.',
            uoalbert_set_tempo_to: '??????????????? ?????? ????????? ????????? BPM(?????? ?????? ???)?????? ???????????????.',
        },
        Blocks: {
            ROBOID_monitor_left_wheel: '?????? ??????',
            ROBOID_monitor_right_wheel: '????????? ??????',
            ROBOID_monitor_left_eye: '?????? ???',
            ROBOID_monitor_right_eye: '????????? ???',
            ROBOID_monitor_buzzer: '??????',
            ROBOID_monitor_note: '??????',
            ROBOID_sensor_signal_strength: '?????? ??????',
            ROBOID_sensor_left_proximity: '?????? ?????? ??????',
            ROBOID_sensor_right_proximity: '????????? ?????? ??????',
            ROBOID_sensor_acceleration_x: 'x??? ?????????',
            ROBOID_sensor_acceleration_y: 'y??? ?????????',
            ROBOID_sensor_acceleration_z: 'z??? ?????????',
            ROBOID_sensor_position_x: 'x ??????',
            ROBOID_sensor_position_y: 'y ??????',
            ROBOID_sensor_light: '??????',
            ROBOID_sensor_temperature: '??????',
            ROBOID_sensor_touch: '??????',
            ROBOID_sensor_oid: 'OID',
            ROBOID_button_clicked: '???????????????',
            ROBOID_button_long_pressed: '?????? ????????????(1.5???)',
            ROBOID_button_long_long_pressed: '?????? ?????? ????????????(3???)',
            ROBOID_tilt_forward: '????????? ?????????',
            ROBOID_tilt_backward: '?????? ?????????',
            ROBOID_tilt_left: '???????????? ?????????',
            ROBOID_tilt_right: '??????????????? ?????????',
            ROBOID_tilt_flip: '????????? ?????????',
            ROBOID_tilt_not: '???????????? ??????',
            ROBOID_battery_normal: '????????? ??????',
            ROBOID_battery_low: '????????? ??????',
            ROBOID_battery_empty: '????????? ??????',
            ROBOID_unit_cm: 'cm',
            ROBOID_unit_sec: '???',
            ROBOID_unit_pulse: '??????',
            ROBOID_unit_deg: '???',
            ROBOID_left: '??????',
            ROBOID_right: '?????????',
            ROBOID_both: '??????',
            ROBOID_forward: '??????',
            ROBOID_backward: '??????',
            ROBOID_color_red: '?????????',
            ROBOID_color_orange: '?????????',
            ROBOID_color_yellow: '?????????',
            ROBOID_color_green: '?????????',
            ROBOID_color_sky_blue: '?????????',
            ROBOID_color_blue: '?????????',
            ROBOID_color_violet: '?????????',
            ROBOID_color_purple: '?????????',
            ROBOID_color_white: '?????????',
            ROBOID_sound_beep: '???',
            ROBOID_sound_siren: '?????????',
            ROBOID_sound_engine: '??????',
            ROBOID_sound_robot: '??????',
            ROBOID_sound_dibidibidip: '???????????????',
            ROBOID_sound_march: '??????',
            ROBOID_sound_birthday: '??????',
            ROBOID_note_c: '???',
            ROBOID_note_c_sharp: '??????(??????)',
            ROBOID_note_d: '???',
            ROBOID_note_d_sharp: '??????(??????)',
            ROBOID_note_e: '???',
            ROBOID_note_f: '???',
            ROBOID_note_f_sharp: '??????(??????)',
            ROBOID_note_g: '???',
            ROBOID_note_g_sharp: '??????(??????)',
            ROBOID_note_a: '???',
            ROBOID_note_a_sharp: '??????(??????)',
            ROBOID_note_b: '???',
        },
    },
    en: {
        template: {
            uoalbert_value: '%1',
            uoalbert_hand_found: 'hand found?',
            uoalbert_touch_state: 'touch sensor %1 ?',
            uoalbert_is_oid: 'oid %1?',
            uoalbert_boolean: '%1?',
            uoalbert_move_forward_unit: 'move forward %1 %2 %3',
            uoalbert_move_backward_unit: 'move backward %1 %2 %3',
            uoalbert_turn_unit_in_place: 'turn %1 %2 %3 in place %4',
            uoalbert_pivot_around_unit_in_direction: 'pivot around %1 wheel %2 %3 in %4 direction %5',
            uoalbert_change_both_wheels_by: 'change wheels by left: %1 right: %2 %3',
            uoalbert_set_both_wheels_to: 'set wheels to left: %1 right: %2 %3',
            uoalbert_change_wheel_by: 'change %1 wheel by %2 %3',
            uoalbert_set_wheel_to: 'set %1 wheel to %2 %3',
            uoalbert_stop: 'stop %1',
            uoalbert_set_board_size: 'set board size to width: %1 height: %2 %3',
            uoalbert_set_eye_to: 'set %1 eye to %2 %3',
            uoalbert_pick_eye: 'set %1 eye to %2 %3',
            uoalbert_change_eye_by_rgb: 'change %1 eye by r: %2 g: %3 b: %4 %5',
            uoalbert_set_eye_to_rgb: 'set %1 eye to r: %2 g: %3 b: %4 %5',
            uoalbert_clear_eye: 'clear %1 eye %2',
            uoalbert_play_sound_times: 'play sound %1 %2 times %3',
            uoalbert_play_sound_times_until_done: 'play sound %1 %2 times until done %3',
            uoalbert_change_buzzer_by: 'change buzzer by %1 %2',
            uoalbert_set_buzzer_to: 'set buzzer to %1 %2',
            uoalbert_clear_sound: 'clear sound %1',
            uoalbert_play_note: 'play note %1 %2 %3',
            uoalbert_play_note_for: 'play note %1 %2 for %3 beats %4',
            uoalbert_rest_for: 'rest for %1 beats %2',
            uoalbert_change_tempo_by: 'change tempo by %1 %2',
            uoalbert_set_tempo_to: 'set tempo to %1 bpm %2',
        },
        Helper: {
            uoalbert_value: "left proximity: value of left proximity sensor (range: 0 to 255, initial value: 0)<br/>right proximity: value of right proximity sensor (range: 0 to 255, initial value: 0)<br/>x acceleration: x-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The direction in which the robot moves forward is the positive direction of the x axis.<br/>y acceleration: y-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The left direction of the robot is the positive direction of the y axis.<br/>z acceleration: z-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The upward direction of the robot is the positive direction of the z axis.<br/>touch: value of touch sensor (when touched 1, otherwise 0, initial value: 0)<br/>oid: value of oid sensor (range: -1 ~ 65535, initial value: -1)<br/>x position: x-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>y position: y-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>light: value of light sensor (range: 0 to 65535, initial value: 0) The brighter, the larger the value.<br/>temperature: temperature value inside the robot (range: -40 to 88 degrees Celsius, initial value: 0)<br/>signal strength: signal strength of Bluetooth communication (range: -128 to 0 dBm, initial value: 0) As the signal strength increases, the value increases.",
            uoalbert_hand_found: 'If there is a hand or object in front of the proximity sensor, true, otherwise false',
            uoalbert_touch_state: 'If the touch sensor clicked/long-pressed/long-long-pressed, true, otherwise false.',
            uoalbert_is_oid: 'If the oid value detected by the oid sensor is equal to the entered number, true, otherwise false.',
            uoalbert_boolean: "tilt forward: If tilted forward, true, otherwise false<br/>tilt backward: If tilted backward, true, otherwise false<br/>tilt left: If tilted to the left, true, otherwise false<br/>tilt right: If tilted to the right, true, otherwise false<br/>tilt flip: If upside-down, true, otherwise false<br/>not tilt: If not tilted, true, otherwise false<br/>battery normal: If the battery is enough, true, otherwise false<br/>battery low: If the battery is low, true, otherwise false<br/>battery empty: If the battery is empty, true, otherwise false",
            uoalbert_move_forward_unit: 'Moves forward for the number of cm/seconds/pulses entered.',
            uoalbert_move_backward_unit: 'Moves backward for the number of cm/seconds/pulses entered.',
            uoalbert_turn_unit_in_place: 'Turns left/right in place for the number of degrees/seconds/pulses entered.',
            uoalbert_pivot_around_unit_in_direction: 'Pivots around the left/right wheel in the forward/backward direction for the number of degrees/seconds/pulses entered.',
            uoalbert_change_both_wheels_by: 'Adds the entered values to the current velocity values (%) of the left and right wheels respectively. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            uoalbert_set_both_wheels_to: 'Sets the velocity of the left and right wheels to the entered values (-100 to 100%), respectively. If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            uoalbert_change_wheel_by: 'Adds the entered value to the current velocity value (%) of the left/right/both wheels. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            uoalbert_set_wheel_to: 'Sets the velocity of the left/right/both wheels to the entered value (-100 to 100%). If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            uoalbert_stop: 'Stops both wheels.',
            uoalbert_set_board_size: 'Sets the width and height of the board.',
            uoalbert_set_eye_to: 'Turns left/right/both eyes to the selected color.',
            uoalbert_pick_eye: 'Turns left/right/both eyes to the selected color.',
            uoalbert_change_eye_by_rgb: 'Adds the entered values to the current R, G, B values of left/right/both eyes, respectively.',
            uoalbert_set_eye_to_rgb: 'Sets the R, G, B values of left/right/both eyes to the entered values.',
            uoalbert_clear_eye: 'Turns off the left/right/both eyes.',
            uoalbert_play_sound_times: 'Plays the selected sound as many times as entered.',
            uoalbert_play_sound_times_until_done: 'Plays the selected sound as many times as entered, and waits for completion.',
            uoalbert_change_buzzer_by: 'Adds the entered value to the current pitch (Hz) of the buzzer sound. You can enter up to two decimal places.',
            uoalbert_set_buzzer_to: 'Sets the pitch of the buzzer sound to the entered value (Hz). You can enter up to two decimal places. Entering the number 0 turns off the buzzer sound.',
            uoalbert_clear_sound: 'Turns off sound.',
            uoalbert_play_note: 'It sounds the selected tone and octave.',
            uoalbert_play_note_for: 'It sounds the selected tone and octave as much as the beat you entered.',
            uoalbert_rest_for: 'Rests as much as the beat you entered.',
            uoalbert_change_tempo_by: 'Adds the entered value to the current BPM (beats per minute) of the playing or resting speed.',
            uoalbert_set_tempo_to: 'Sets the playing or resting speed to the entered BPM (beats per minute).',
        },
        Blocks: {
            ROBOID_monitor_left_wheel: 'left wheel',
            ROBOID_monitor_right_wheel: 'right wheel',
            ROBOID_monitor_left_eye: 'left eye',
            ROBOID_monitor_right_eye: 'right eye',
            ROBOID_monitor_buzzer: 'buzzer',
            ROBOID_monitor_note: 'note',
            ROBOID_sensor_signal_strength: 'signal strength',
            ROBOID_sensor_left_proximity: 'left proximity',
            ROBOID_sensor_right_proximity: 'right proximity',
            ROBOID_sensor_acceleration_x: 'x acceleration',
            ROBOID_sensor_acceleration_y: 'y acceleration',
            ROBOID_sensor_acceleration_z: 'z acceleration',
            ROBOID_sensor_position_x: 'x position',
            ROBOID_sensor_position_y: 'y position',
            ROBOID_sensor_light: 'light',
            ROBOID_sensor_temperature: 'temperature',
            ROBOID_sensor_touch: 'touch',
            ROBOID_sensor_oid: 'oid',
            ROBOID_button_clicked: 'clicked',
            ROBOID_button_long_pressed: 'long-pressed (1.5 secs)',
            ROBOID_button_long_long_pressed: 'long-long-pressed (3 secs)',
            ROBOID_tilt_forward: 'tilt forward',
            ROBOID_tilt_backward: 'tilt backward',
            ROBOID_tilt_left: 'tilt left',
            ROBOID_tilt_right: 'tilt right',
            ROBOID_tilt_flip: 'tilt flip',
            ROBOID_tilt_not: 'not tilt',
            ROBOID_battery_normal: 'battery normal',
            ROBOID_battery_low: 'battery low',
            ROBOID_battery_empty: 'battery empty',
            ROBOID_unit_cm: 'cm',
            ROBOID_unit_sec: 'seconds',
            ROBOID_unit_pulse: 'pulses',
            ROBOID_unit_deg: 'degrees',
            ROBOID_left: 'left',
            ROBOID_right: 'right',
            ROBOID_both: 'both',
            ROBOID_forward: 'forward',
            ROBOID_backward: 'backward',
            ROBOID_color_red: 'red',
            ROBOID_color_orange: 'orange',
            ROBOID_color_yellow: 'yellow',
            ROBOID_color_green: 'green',
            ROBOID_color_sky_blue: 'sky blue',
            ROBOID_color_blue: 'blue',
            ROBOID_color_violet: 'violet',
            ROBOID_color_purple: 'purple',
            ROBOID_color_white: 'white',
            ROBOID_sound_beep: 'beep',
            ROBOID_sound_siren: 'siren',
            ROBOID_sound_engine: 'engine',
            ROBOID_sound_robot: 'robot',
            ROBOID_sound_dibidibidip: 'dibidibidip',
            ROBOID_sound_march: 'march',
            ROBOID_sound_birthday: 'birthday',
            ROBOID_note_c: 'C',
            ROBOID_note_c_sharp: 'C???(D???)',
            ROBOID_note_d: 'D',
            ROBOID_note_d_sharp: 'D???(E???)',
            ROBOID_note_e: 'E',
            ROBOID_note_f: 'F',
            ROBOID_note_f_sharp: 'F???(G???)',
            ROBOID_note_g: 'G',
            ROBOID_note_g_sharp: 'G???(A???)',
            ROBOID_note_a: 'A',
            ROBOID_note_a_sharp: 'A???(B???)',
            ROBOID_note_b: 'B',
        },
    },
    jp: {
        template: {
            uoalbert_value: '%1',
            uoalbert_hand_found: '??????????????????????',
            uoalbert_touch_state: '???????????????????????? %1 ?',
            uoalbert_is_oid: 'OID??? %1??????????',
            uoalbert_boolean: '%1?',
            uoalbert_move_forward_unit: '??????%1%2???????????? %3',
            uoalbert_move_backward_unit: '?????????%1%2???????????? %3',
            uoalbert_turn_unit_in_place: '%1???%2%3?????????????????? %4',
            uoalbert_pivot_around_unit_in_direction: '%1??????????????????%2%3%4??????????????? %5',
            uoalbert_change_both_wheels_by: '????????????%1????????????%2??????????????? %3',
            uoalbert_set_both_wheels_to: '????????????%1????????????%2????????? %3',
            uoalbert_change_wheel_by: '%1?????????%2??????????????? %3',
            uoalbert_set_wheel_to: '%1?????????%2????????? %3',
            uoalbert_stop: '???????????? %1',
            uoalbert_set_board_size: '??????????????????%1?????????%2????????? %3',
            uoalbert_set_eye_to: '%1??????%2????????? %3',
            uoalbert_pick_eye: '%1??????%2????????? %3',
            uoalbert_change_eye_by_rgb: '%1??????R:%2G:%3B:%4??????????????? %5',
            uoalbert_set_eye_to_rgb: '%1??????R:%2G:%3B:%4????????? %5',
            uoalbert_clear_eye: '%1???????????? %2',
            uoalbert_play_sound_times: '%1??????%2???????????? %3',
            uoalbert_play_sound_times_until_done: '???????????????%1??????%2???????????? %3',
            uoalbert_change_buzzer_by: '???????????????%1??????????????? %2',
            uoalbert_set_buzzer_to: '???????????????%1????????? %2',
            uoalbert_clear_sound: '???????????? %1',
            uoalbert_play_note: '%1%2??????????????? %3',
            uoalbert_play_note_for: '%1%2??????%3???????????? %4',
            uoalbert_rest_for: '%1????????? %2',
            uoalbert_change_tempo_by: '????????????%1??????????????? %2',
            uoalbert_set_tempo_to: '????????????%1BPM????????? %2',
        },
        Helper: {
            uoalbert_value: "left proximity: value of left proximity sensor (range: 0 to 255, initial value: 0)<br/>right proximity: value of right proximity sensor (range: 0 to 255, initial value: 0)<br/>x acceleration: x-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The direction in which the robot moves forward is the positive direction of the x axis.<br/>y acceleration: y-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The left direction of the robot is the positive direction of the y axis.<br/>z acceleration: z-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The upward direction of the robot is the positive direction of the z axis.<br/>touch: value of touch sensor (when touched 1, otherwise 0, initial value: 0)<br/>oid: value of oid sensor (range: -1 ~ 65535, initial value: -1)<br/>x position: x-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>y position: y-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>light: value of light sensor (range: 0 to 65535, initial value: 0) The brighter, the larger the value.<br/>temperature: temperature value inside the robot (range: -40 to 88 degrees Celsius, initial value: 0)<br/>signal strength: signal strength of Bluetooth communication (range: -128 to 0 dBm, initial value: 0) As the signal strength increases, the value increases.",
            uoalbert_hand_found: 'If there is a hand or object in front of the proximity sensor, true, otherwise false',
            uoalbert_touch_state: 'If the touch sensor clicked/long-pressed/long-long-pressed, true, otherwise false.',
            uoalbert_is_oid: 'If the oid value detected by the oid sensor is equal to the entered number, true, otherwise false.',
            uoalbert_boolean: "tilt forward: If tilted forward, true, otherwise false<br/>tilt backward: If tilted backward, true, otherwise false<br/>tilt left: If tilted to the left, true, otherwise false<br/>tilt right: If tilted to the right, true, otherwise false<br/>tilt flip: If upside-down, true, otherwise false<br/>not tilt: If not tilted, true, otherwise false<br/>battery normal: If the battery is enough, true, otherwise false<br/>battery low: If the battery is low, true, otherwise false<br/>battery empty: If the battery is empty, true, otherwise false",
            uoalbert_move_forward_unit: 'Moves forward for the number of cm/seconds/pulses entered.',
            uoalbert_move_backward_unit: 'Moves backward for the number of cm/seconds/pulses entered.',
            uoalbert_turn_unit_in_place: 'Turns left/right in place for the number of degrees/seconds/pulses entered.',
            uoalbert_pivot_around_unit_in_direction: 'Pivots around the left/right wheel in the forward/backward direction for the number of degrees/seconds/pulses entered.',
            uoalbert_change_both_wheels_by: 'Adds the entered values to the current velocity values (%) of the left and right wheels respectively. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            uoalbert_set_both_wheels_to: 'Sets the velocity of the left and right wheels to the entered values (-100 to 100%), respectively. If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            uoalbert_change_wheel_by: 'Adds the entered value to the current velocity value (%) of the left/right/both wheels. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            uoalbert_set_wheel_to: 'Sets the velocity of the left/right/both wheels to the entered value (-100 to 100%). If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            uoalbert_stop: 'Stops both wheels.',
            uoalbert_set_board_size: 'Sets the width and height of the board.',
            uoalbert_set_eye_to: 'Turns left/right/both eyes to the selected color.',
            uoalbert_pick_eye: 'Turns left/right/both eyes to the selected color.',
            uoalbert_change_eye_by_rgb: 'Adds the entered values to the current R, G, B values of left/right/both eyes, respectively.',
            uoalbert_set_eye_to_rgb: 'Sets the R, G, B values of left/right/both eyes to the entered values.',
            uoalbert_clear_eye: 'Turns off the left/right/both eyes.',
            uoalbert_play_sound_times: 'Plays the selected sound as many times as entered.',
            uoalbert_play_sound_times_until_done: 'Plays the selected sound as many times as entered, and waits for completion.',
            uoalbert_change_buzzer_by: 'Adds the entered value to the current pitch (Hz) of the buzzer sound. You can enter up to two decimal places.',
            uoalbert_set_buzzer_to: 'Sets the pitch of the buzzer sound to the entered value (Hz). You can enter up to two decimal places. Entering the number 0 turns off the buzzer sound.',
            uoalbert_clear_sound: 'Turns off sound.',
            uoalbert_play_note: 'It sounds the selected tone and octave.',
            uoalbert_play_note_for: 'It sounds the selected tone and octave as much as the beat you entered.',
            uoalbert_rest_for: 'Rests as much as the beat you entered.',
            uoalbert_change_tempo_by: 'Adds the entered value to the current BPM (beats per minute) of the playing or resting speed.',
            uoalbert_set_tempo_to: 'Sets the playing or resting speed to the entered BPM (beats per minute).',
        },
        Blocks: {
            ROBOID_monitor_left_wheel: '?????????',
            ROBOID_monitor_right_wheel: '?????????',
            ROBOID_monitor_left_eye: '??????',
            ROBOID_monitor_right_eye: '??????',
            ROBOID_monitor_buzzer: '?????????',
            ROBOID_monitor_note: '??????',
            ROBOID_sensor_signal_strength: '????????????',
            ROBOID_sensor_left_proximity: '?????????????????????',
            ROBOID_sensor_right_proximity: '?????????????????????',
            ROBOID_sensor_acceleration_x: 'x????????????',
            ROBOID_sensor_acceleration_y: 'y????????????',
            ROBOID_sensor_acceleration_z: 'z????????????',
            ROBOID_sensor_position_x: 'x??????',
            ROBOID_sensor_position_y: 'y??????',
            ROBOID_sensor_light: '??????',
            ROBOID_sensor_temperature: '??????',
            ROBOID_sensor_touch: '?????????',
            ROBOID_sensor_oid: 'OID',
            ROBOID_button_clicked: '?????????????????????',
            ROBOID_button_long_pressed: '??????????????????(1.5???)',
            ROBOID_button_long_long_pressed: '???????????????????????????(3???)',
            ROBOID_tilt_forward: '??????????????????',
            ROBOID_tilt_backward: '??????????????????',
            ROBOID_tilt_left: '??????????????????',
            ROBOID_tilt_right: '??????????????????',
            ROBOID_tilt_flip: '?????????????????????',
            ROBOID_tilt_not: '?????????????????????',
            ROBOID_battery_normal: '??????????????????',
            ROBOID_battery_low: '????????????????????????',
            ROBOID_battery_empty: '??????????????????',
            ROBOID_unit_cm: 'cm',
            ROBOID_unit_sec: '???',
            ROBOID_unit_pulse: '?????????',
            ROBOID_unit_deg: '???',
            ROBOID_left: '???',
            ROBOID_right: '???',
            ROBOID_both: '???',
            ROBOID_forward: '???',
            ROBOID_backward: '???',
            ROBOID_color_red: '??????',
            ROBOID_color_orange: '??????',
            ROBOID_color_yellow: '??????',
            ROBOID_color_green: '??????',
            ROBOID_color_sky_blue: '??????',
            ROBOID_color_blue: '??????',
            ROBOID_color_violet: '?????????',
            ROBOID_color_purple: '??????',
            ROBOID_color_white: '??????',
            ROBOID_sound_beep: '?????????',
            ROBOID_sound_siren: '????????????',
            ROBOID_sound_engine: '????????????',
            ROBOID_sound_robot: '????????????',
            ROBOID_sound_dibidibidip: '??????????????????????????????',
            ROBOID_sound_march: '??????',
            ROBOID_sound_birthday: '??????',
            ROBOID_note_c: '???',
            ROBOID_note_c_sharp: '??????(??????)',
            ROBOID_note_d: '???',
            ROBOID_note_d_sharp: '??????(??????)',
            ROBOID_note_e: '???',
            ROBOID_note_f: '??????',
            ROBOID_note_f_sharp: '?????????(??????)',
            ROBOID_note_g: '???',
            ROBOID_note_g_sharp: '??????(??????)',
            ROBOID_note_a: '???',
            ROBOID_note_a_sharp: '??????(??????)',
            ROBOID_note_b: '???',
        },
    },
    vn: {
        template: {
            uoalbert_value: '%1',
            uoalbert_hand_found: 'hand found?',
            uoalbert_touch_state: 'touch sensor %1 ?',
            uoalbert_is_oid: 'oid %1?',
            uoalbert_boolean: '%1?',
            uoalbert_move_forward_unit: 'move forward %1 %2 %3',
            uoalbert_move_backward_unit: 'move backward %1 %2 %3',
            uoalbert_turn_unit_in_place: 'turn %1 %2 %3 in place %4',
            uoalbert_pivot_around_unit_in_direction: 'pivot around %1 wheel %2 %3 in %4 direction %5',
            uoalbert_change_both_wheels_by: 'change wheels by left: %1 right: %2 %3',
            uoalbert_set_both_wheels_to: 'set wheels to left: %1 right: %2 %3',
            uoalbert_change_wheel_by: 'change %1 wheel by %2 %3',
            uoalbert_set_wheel_to: 'set %1 wheel to %2 %3',
            uoalbert_stop: 'stop %1',
            uoalbert_set_board_size: 'set board size to width: %1 height: %2 %3',
            uoalbert_set_eye_to: 'set %1 eye to %2 %3',
            uoalbert_pick_eye: 'set %1 eye to %2 %3',
            uoalbert_change_eye_by_rgb: 'change %1 eye by r: %2 g: %3 b: %4 %5',
            uoalbert_set_eye_to_rgb: 'set %1 eye to r: %2 g: %3 b: %4 %5',
            uoalbert_clear_eye: 'clear %1 eye %2',
            uoalbert_play_sound_times: 'play sound %1 %2 times %3',
            uoalbert_play_sound_times_until_done: 'play sound %1 %2 times until done %3',
            uoalbert_change_buzzer_by: 'change buzzer by %1 %2',
            uoalbert_set_buzzer_to: 'set buzzer to %1 %2',
            uoalbert_clear_sound: 'clear sound %1',
            uoalbert_play_note: 'play note %1 %2 %3',
            uoalbert_play_note_for: 'play note %1 %2 for %3 beats %4',
            uoalbert_rest_for: 'rest for %1 beats %2',
            uoalbert_change_tempo_by: 'change tempo by %1 %2',
            uoalbert_set_tempo_to: 'set tempo to %1 bpm %2',
        },
        Helper: {
            uoalbert_value: "left proximity: value of left proximity sensor (range: 0 to 255, initial value: 0)<br/>right proximity: value of right proximity sensor (range: 0 to 255, initial value: 0)<br/>x acceleration: x-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The direction in which the robot moves forward is the positive direction of the x axis.<br/>y acceleration: y-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The left direction of the robot is the positive direction of the y axis.<br/>z acceleration: z-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The upward direction of the robot is the positive direction of the z axis.<br/>touch: value of touch sensor (when touched 1, otherwise 0, initial value: 0)<br/>oid: value of oid sensor (range: -1 ~ 65535, initial value: -1)<br/>x position: x-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>y position: y-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>light: value of light sensor (range: 0 to 65535, initial value: 0) The brighter, the larger the value.<br/>temperature: temperature value inside the robot (range: -40 to 88 degrees Celsius, initial value: 0)<br/>signal strength: signal strength of Bluetooth communication (range: -128 to 0 dBm, initial value: 0) As the signal strength increases, the value increases.",
            uoalbert_hand_found: 'If there is a hand or object in front of the proximity sensor, true, otherwise false',
            uoalbert_touch_state: 'If the touch sensor clicked/long-pressed/long-long-pressed, true, otherwise false.',
            uoalbert_is_oid: 'If the oid value detected by the oid sensor is equal to the entered number, true, otherwise false.',
            uoalbert_boolean: "tilt forward: If tilted forward, true, otherwise false<br/>tilt backward: If tilted backward, true, otherwise false<br/>tilt left: If tilted to the left, true, otherwise false<br/>tilt right: If tilted to the right, true, otherwise false<br/>tilt flip: If upside-down, true, otherwise false<br/>not tilt: If not tilted, true, otherwise false<br/>battery normal: If the battery is enough, true, otherwise false<br/>battery low: If the battery is low, true, otherwise false<br/>battery empty: If the battery is empty, true, otherwise false",
            uoalbert_move_forward_unit: 'Moves forward for the number of cm/seconds/pulses entered.',
            uoalbert_move_backward_unit: 'Moves backward for the number of cm/seconds/pulses entered.',
            uoalbert_turn_unit_in_place: 'Turns left/right in place for the number of degrees/seconds/pulses entered.',
            uoalbert_pivot_around_unit_in_direction: 'Pivots around the left/right wheel in the forward/backward direction for the number of degrees/seconds/pulses entered.',
            uoalbert_change_both_wheels_by: 'Adds the entered values to the current velocity values (%) of the left and right wheels respectively. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            uoalbert_set_both_wheels_to: 'Sets the velocity of the left and right wheels to the entered values (-100 to 100%), respectively. If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            uoalbert_change_wheel_by: 'Adds the entered value to the current velocity value (%) of the left/right/both wheels. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            uoalbert_set_wheel_to: 'Sets the velocity of the left/right/both wheels to the entered value (-100 to 100%). If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            uoalbert_stop: 'Stops both wheels.',
            uoalbert_set_board_size: 'Sets the width and height of the board.',
            uoalbert_set_eye_to: 'Turns left/right/both eyes to the selected color.',
            uoalbert_pick_eye: 'Turns left/right/both eyes to the selected color.',
            uoalbert_change_eye_by_rgb: 'Adds the entered values to the current R, G, B values of left/right/both eyes, respectively.',
            uoalbert_set_eye_to_rgb: 'Sets the R, G, B values of left/right/both eyes to the entered values.',
            uoalbert_clear_eye: 'Turns off the left/right/both eyes.',
            uoalbert_play_sound_times: 'Plays the selected sound as many times as entered.',
            uoalbert_play_sound_times_until_done: 'Plays the selected sound as many times as entered, and waits for completion.',
            uoalbert_change_buzzer_by: 'Adds the entered value to the current pitch (Hz) of the buzzer sound. You can enter up to two decimal places.',
            uoalbert_set_buzzer_to: 'Sets the pitch of the buzzer sound to the entered value (Hz). You can enter up to two decimal places. Entering the number 0 turns off the buzzer sound.',
            uoalbert_clear_sound: 'Turns off sound.',
            uoalbert_play_note: 'It sounds the selected tone and octave.',
            uoalbert_play_note_for: 'It sounds the selected tone and octave as much as the beat you entered.',
            uoalbert_rest_for: 'Rests as much as the beat you entered.',
            uoalbert_change_tempo_by: 'Adds the entered value to the current BPM (beats per minute) of the playing or resting speed.',
            uoalbert_set_tempo_to: 'Sets the playing or resting speed to the entered BPM (beats per minute).',
        },
        Blocks: {
            ROBOID_monitor_left_wheel: 'left wheel',
            ROBOID_monitor_right_wheel: 'right wheel',
            ROBOID_monitor_left_eye: 'left eye',
            ROBOID_monitor_right_eye: 'right eye',
            ROBOID_monitor_buzzer: 'buzzer',
            ROBOID_monitor_note: 'note',
            ROBOID_sensor_signal_strength: 'signal strength',
            ROBOID_sensor_left_proximity: 'left proximity',
            ROBOID_sensor_right_proximity: 'right proximity',
            ROBOID_sensor_acceleration_x: 'x acceleration',
            ROBOID_sensor_acceleration_y: 'y acceleration',
            ROBOID_sensor_acceleration_z: 'z acceleration',
            ROBOID_sensor_position_x: 'x position',
            ROBOID_sensor_position_y: 'y position',
            ROBOID_sensor_light: 'light',
            ROBOID_sensor_temperature: 'temperature',
            ROBOID_sensor_touch: 'touch',
            ROBOID_sensor_oid: 'oid',
            ROBOID_button_clicked: 'clicked',
            ROBOID_button_long_pressed: 'long-pressed (1.5 secs)',
            ROBOID_button_long_long_pressed: 'long-long-pressed (3 secs)',
            ROBOID_tilt_forward: 'tilt forward',
            ROBOID_tilt_backward: 'tilt backward',
            ROBOID_tilt_left: 'tilt left',
            ROBOID_tilt_right: 'tilt right',
            ROBOID_tilt_flip: 'tilt flip',
            ROBOID_tilt_not: 'not tilt',
            ROBOID_battery_normal: 'battery normal',
            ROBOID_battery_low: 'battery low',
            ROBOID_battery_empty: 'battery empty',
            ROBOID_unit_cm: 'cm',
            ROBOID_unit_sec: 'seconds',
            ROBOID_unit_pulse: 'pulses',
            ROBOID_unit_deg: 'degrees',
            ROBOID_left: 'left',
            ROBOID_right: 'right',
            ROBOID_both: 'both',
            ROBOID_forward: 'forward',
            ROBOID_backward: 'backward',
            ROBOID_color_red: 'red',
            ROBOID_color_orange: 'orange',
            ROBOID_color_yellow: 'yellow',
            ROBOID_color_green: 'green',
            ROBOID_color_sky_blue: 'sky blue',
            ROBOID_color_blue: 'blue',
            ROBOID_color_violet: 'violet',
            ROBOID_color_purple: 'purple',
            ROBOID_color_white: 'white',
            ROBOID_sound_beep: 'beep',
            ROBOID_sound_siren: 'siren',
            ROBOID_sound_engine: 'engine',
            ROBOID_sound_robot: 'robot',
            ROBOID_sound_dibidibidip: 'dibidibidip',
            ROBOID_sound_march: 'march',
            ROBOID_sound_birthday: 'birthday',
            ROBOID_note_c: 'C',
            ROBOID_note_c_sharp: 'C???(D???)',
            ROBOID_note_d: 'D',
            ROBOID_note_d_sharp: 'D???(E???)',
            ROBOID_note_e: 'E',
            ROBOID_note_f: 'F',
            ROBOID_note_f_sharp: 'F???(G???)',
            ROBOID_note_g: 'G',
            ROBOID_note_g_sharp: 'G???(A???)',
            ROBOID_note_a: 'A',
            ROBOID_note_a_sharp: 'A???(B???)',
            ROBOID_note_b: 'B',
        },
    },
});

RoCode.UoAlbert.blockMenuBlocks = [
    'uoalbert_value',
    'uoalbert_hand_found',
    'uoalbert_touch_state',
    'uoalbert_is_oid',
    'uoalbert_boolean',
    'uoalbert_move_forward_unit',
    'uoalbert_move_backward_unit',
    'uoalbert_turn_unit_in_place',
    'uoalbert_pivot_around_unit_in_direction',
    'uoalbert_change_both_wheels_by',
    'uoalbert_set_both_wheels_to',
    'uoalbert_change_wheel_by',
    'uoalbert_set_wheel_to',
    'uoalbert_stop',
    'uoalbert_set_board_size',
    'uoalbert_set_eye_to',
    'uoalbert_pick_eye',
    'uoalbert_change_eye_by_rgb',
    'uoalbert_set_eye_to_rgb',
    'uoalbert_clear_eye',
    'uoalbert_play_sound_times',
    'uoalbert_play_sound_times_until_done',
    'uoalbert_change_buzzer_by',
    'uoalbert_set_buzzer_to',
    'uoalbert_clear_sound',
    'uoalbert_play_note',
    'uoalbert_play_note_for',
    'uoalbert_rest_for',
    'uoalbert_change_tempo_by',
    'uoalbert_set_tempo_to',
];

RoCode.UoAlbert.getBlocks = function() {
    return {
        uoalbert_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_sensor_left_proximity, 'LEFT_PROXIMITY'],
                        [Lang.Blocks.ROBOID_sensor_right_proximity, 'RIGHT_PROXIMITY'],
                        [Lang.Blocks.ROBOID_sensor_acceleration_x, 'ACCELERATION_X'],
                        [Lang.Blocks.ROBOID_sensor_acceleration_y, 'ACCELERATION_Y'],
                        [Lang.Blocks.ROBOID_sensor_acceleration_z, 'ACCELERATION_Z'],
                        [Lang.Blocks.ROBOID_sensor_touch, 'TOUCH'],
                        [Lang.Blocks.ROBOID_sensor_oid, 'OID'],
                        [Lang.Blocks.ROBOID_sensor_position_x, 'POSITION_X'],
                        [Lang.Blocks.ROBOID_sensor_position_y, 'POSITION_Y'],
                        [Lang.Blocks.ROBOID_sensor_light, 'LIGHT'],
                        [Lang.Blocks.ROBOID_sensor_temperature, 'TEMPERATURE'],
                        [Lang.Blocks.ROBOID_sensor_signal_strength, 'SIGNAL_STRENGTH'],
                    ],
                    value: 'LEFT_PROXIMITY',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'uoalbert_value',
            },
            paramsKeyMap: {
                DEVICE: 0,
            },
            class: 'uoalbert_sensor',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                if (robot) {
                    return robot.getValue(script);
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.sensor_value(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_sensor_left_proximity, 'LEFT_PROXIMITY'],
                                    [Lang.Blocks.ROBOID_sensor_right_proximity, 'RIGHT_PROXIMITY'],
                                    [Lang.Blocks.ROBOID_sensor_acceleration_x, 'ACCELERATION_X'],
                                    [Lang.Blocks.ROBOID_sensor_acceleration_y, 'ACCELERATION_Y'],
                                    [Lang.Blocks.ROBOID_sensor_acceleration_z, 'ACCELERATION_Z'],
                                    [Lang.Blocks.ROBOID_sensor_touch, 'TOUCH'],
                                    [Lang.Blocks.ROBOID_sensor_oid, 'OID'],
                                    [Lang.Blocks.ROBOID_sensor_position_x, 'POSITION_X'],
                                    [Lang.Blocks.ROBOID_sensor_position_y, 'POSITION_Y'],
                                    [Lang.Blocks.ROBOID_sensor_light, 'LIGHT'],
                                    [Lang.Blocks.ROBOID_sensor_temperature, 'TEMPERATURE'],
                                    [Lang.Blocks.ROBOID_sensor_signal_strength, 'SIGNAL_STRENGTH'],
                                ],
                                value: 'LEFT_PROXIMITY',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_hand_found: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                params: [],
                type: 'uoalbert_hand_found',
            },
            class: 'uoalbert_sensor',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.checkHandFound(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.hand_found()',
                        blockType: 'param',
                    },
                ],
            },
        },
        uoalbert_touch_state: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_button_clicked, 'CLICKED'],
                        [Lang.Blocks.ROBOID_button_long_pressed, 'LONG_PRESSED'],
                        [Lang.Blocks.ROBOID_button_long_long_pressed, 'LONG_LONG_PRESSED'],
                    ],
                    value: 'CLICKED',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [],
                type: 'uoalbert_touch_state',
            },
            paramsKeyMap: {
                STATE: 0,
            },
            class: 'uoalbert_sensor',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.checkTouchState(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.is_touch(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_button_clicked, 'CLICKED'],
                                    [Lang.Blocks.ROBOID_button_long_pressed, 'LONG_PRESSED'],
                                    [Lang.Blocks.ROBOID_button_long_long_pressed, 'LONG_LONG_PRESSED'],
                                ],
                                value: 'CLICKED',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_is_oid: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['0'],
                    },
                ],
                type: 'uoalbert_is_oid',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'uoalbert_sensor',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.checkOid(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.is_oid(%1)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                        blockType: 'param',
                    },
                ],
            },
        },
        uoalbert_boolean: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_tilt_forward, 'TILT_FORWARD'],
                        [Lang.Blocks.ROBOID_tilt_backward, 'TILT_BACKWARD'],
                        [Lang.Blocks.ROBOID_tilt_left, 'TILT_LEFT'],
                        [Lang.Blocks.ROBOID_tilt_right, 'TILT_RIGHT'],
                        [Lang.Blocks.ROBOID_tilt_flip, 'TILT_FLIP'],
                        [Lang.Blocks.ROBOID_tilt_not, 'TILT_NOT'],
                        [Lang.Blocks.ROBOID_battery_normal, 'BATTERY_NORMAL'],
                        [Lang.Blocks.ROBOID_battery_low, 'BATTERY_LOW'],
                        [Lang.Blocks.ROBOID_battery_empty, 'BATTERY_EMPTY'],
                    ],
                    value: 'TILT_FORWARD',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'uoalbert_boolean',
            },
            paramsKeyMap: {
                DEVICE: 0,
            },
            class: 'uoalbert_sensor',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.checkBoolean(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.boolean_value(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_tilt_forward, 'TILT_FORWARD'],
                                    [Lang.Blocks.ROBOID_tilt_backward, 'TILT_BACKWARD'],
                                    [Lang.Blocks.ROBOID_tilt_left, 'TILT_LEFT'],
                                    [Lang.Blocks.ROBOID_tilt_right, 'TILT_RIGHT'],
                                    [Lang.Blocks.ROBOID_tilt_flip, 'TILT_FLIP'],
                                    [Lang.Blocks.ROBOID_tilt_not, 'TILT_NOT'],
                                    [Lang.Blocks.ROBOID_battery_normal, 'BATTERY_NORMAL'],
                                    [Lang.Blocks.ROBOID_battery_low, 'BATTERY_LOW'],
                                    [Lang.Blocks.ROBOID_battery_empty, 'BATTERY_EMPTY'],
                                ],
                                value: 'TILT_FORWARD',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_move_forward_unit: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_unit_cm, 'CM'],
                        [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                        [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                    ],
                    value: 'CM',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['5'],
                    },
                    null,
                    null,
                ],
                type: 'uoalbert_move_forward_unit',
            },
            paramsKeyMap: {
                VALUE: 0,
                UNIT: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.moveForwardUnit(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.move_forward(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_unit_cm, 'CM'],
                                    [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                                    [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                                ],
                                value: 'CM',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_move_backward_unit: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_unit_cm, 'CM'],
                        [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                        [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                    ],
                    value: 'CM',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['5'],
                    },
                    null,
                    null,
                ],
                type: 'uoalbert_move_backward_unit',
            },
            paramsKeyMap: {
                VALUE: 0,
                UNIT: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.moveBackwardUnit(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.move_backward(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_unit_cm, 'CM'],
                                    [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                                    [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                                ],
                                value: 'CM',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_turn_unit_in_place: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_unit_deg, 'DEG'],
                        [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                        [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                    ],
                    value: 'DEG',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['90'],
                    },
                    null,
                    null,
                ],
                type: 'uoalbert_turn_unit_in_place',
            },
            paramsKeyMap: {
                DIRECTION: 0,
                VALUE: 1,
                UNIT: 2,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.turnUnit(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.turn(%1, %2, %3)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_unit_deg, 'DEG'],
                                    [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                                    [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                                ],
                                value: 'DEG',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_pivot_around_unit_in_direction: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_unit_deg, 'DEG'],
                        [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                        [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                    ],
                    value: 'DEG',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_forward, 'FORWARD'],
                        [Lang.Blocks.ROBOID_backward, 'BACKWARD'],
                    ],
                    value: 'FORWARD',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['90'],
                    },
                    null,
                    null,
                    null,
                ],
                type: 'uoalbert_pivot_around_unit_in_direction',
            },
            paramsKeyMap: {
                WHEEL: 0,
                VALUE: 1,
                UNIT: 2,
                TOWARD: 3,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.pivotUnit(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.pivot(%1, %2, %3, %4)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_unit_deg, 'DEG'],
                                    [Lang.Blocks.ROBOID_unit_sec, 'SEC'],
                                    [Lang.Blocks.ROBOID_unit_pulse, 'PULSE'],
                                ],
                                value: 'DEG',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_forward, 'FORWARD'],
                                    [Lang.Blocks.ROBOID_backward, 'BACKWARD'],
                                ],
                                value: 'FORWARD',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_change_both_wheels_by: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['10'],
                    },
                    {
                        type: 'text',
                        params: ['10'],
                    },
                    null,
                ],
                type: 'uoalbert_change_both_wheels_by',
            },
            paramsKeyMap: {
                LEFT: 0,
                RIGHT: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.changeWheels(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.add_wheels(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_set_both_wheels_to: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['50'],
                    },
                    {
                        type: 'text',
                        params: ['50'],
                    },
                    null,
                ],
                type: 'uoalbert_set_both_wheels_to',
            },
            paramsKeyMap: {
                LEFT: 0,
                RIGHT: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setWheels(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_wheels(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_change_wheel_by: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['10'],
                    },
                    null,
                ],
                type: 'uoalbert_change_wheel_by',
            },
            paramsKeyMap: {
                WHEEL: 0,
                VELOCITY: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.changeWheel(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.add_wheel(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_set_wheel_to: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['50'],
                    },
                    null,
                ],
                type: 'uoalbert_set_wheel_to',
            },
            paramsKeyMap: {
                WHEEL: 0,
                VELOCITY: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setWheel(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_wheel(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_stop: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'uoalbert_stop',
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.stop(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.stop()',
                    },
                ],
            },
        },
        uoalbert_set_board_size: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['108'],
                    },
                    {
                        type: 'text',
                        params: ['76'],
                    },
                    null,
                ],
                type: 'uoalbert_set_board_size',
            },
            paramsKeyMap: {
                WIDTH: 0,
                HEIGHT: 1,
            },
            class: 'uoalbert_wheel',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setBoardSize(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_board_size(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_set_eye_to: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_color_red, 'RED'],
                        [Lang.Blocks.ROBOID_color_orange, 'ORANGE'],
                        [Lang.Blocks.ROBOID_color_yellow, 'YELLOW'],
                        [Lang.Blocks.ROBOID_color_green, 'GREEN'],
                        [Lang.Blocks.ROBOID_color_sky_blue, 'SKY_BLUE'],
                        [Lang.Blocks.ROBOID_color_blue, 'BLUE'],
                        [Lang.Blocks.ROBOID_color_violet, 'VIOLET'],
                        [Lang.Blocks.ROBOID_color_purple, 'PURPLE'],
                        [Lang.Blocks.ROBOID_color_white, 'WHITE'],
                    ],
                    value: 'RED',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null, null, null],
                type: 'uoalbert_set_eye_to',
            },
            paramsKeyMap: {
                EYE: 0,
                COLOR: 1,
            },
            class: 'uoalbert_eye',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setEyeColor(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_eye(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_color_red, 'RED'],
                                    [Lang.Blocks.ROBOID_color_orange, 'ORANGE'],
                                    [Lang.Blocks.ROBOID_color_yellow, 'YELLOW'],
                                    [Lang.Blocks.ROBOID_color_green, 'GREEN'],
                                    [Lang.Blocks.ROBOID_color_sky_blue, 'SKY_BLUE'],
                                    [Lang.Blocks.ROBOID_color_blue, 'BLUE'],
                                    [Lang.Blocks.ROBOID_color_violet, 'VIOLET'],
                                    [Lang.Blocks.ROBOID_color_purple, 'PURPLE'],
                                    [Lang.Blocks.ROBOID_color_white, 'WHITE'],
                                ],
                                value: 'RED',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_pick_eye: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Color',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null, null, null],
                type: 'uoalbert_pick_eye',
            },
            paramsKeyMap: {
                EYE: 0,
                COLOR: 1,
            },
            class: 'uoalbert_eye',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.pickEyeColor(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.pick_eye(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Color',
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_change_eye_by_rgb: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['10'],
                    },
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    null,
                ],
                type: 'uoalbert_change_eye_by_rgb',
            },
            paramsKeyMap: {
                EYE: 0,
                RED: 1,
                GREEN: 2,
                BLUE: 3,
            },
            class: 'uoalbert_eye',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.changeEyeRgb(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.add_rgb(%1, %2, %3, %4)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_set_eye_to_rgb: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['255'],
                    },
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    {
                        type: 'text',
                        params: ['0'],
                    },
                    null,
                ],
                type: 'uoalbert_set_eye_to_rgb',
            },
            paramsKeyMap: {
                EYE: 0,
                RED: 1,
                GREEN: 2,
                BLUE: 3,
            },
            class: 'uoalbert_eye',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setEyeRgb(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_rgb(%1, %2, %3, %4)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_clear_eye: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_left, 'LEFT'],
                        [Lang.Blocks.ROBOID_right, 'RIGHT'],
                        [Lang.Blocks.ROBOID_both, 'BOTH'],
                    ],
                    value: 'LEFT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'uoalbert_clear_eye',
            },
            paramsKeyMap: {
                EYE: 0,
            },
            class: 'uoalbert_eye',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.clearEye(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.clear_eye(%1)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_left, 'LEFT'],
                                    [Lang.Blocks.ROBOID_right, 'RIGHT'],
                                    [Lang.Blocks.ROBOID_both, 'BOTH'],
                                ],
                                value: 'LEFT',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_play_sound_times: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_sound_beep, 'BEEP'],
                        [Lang.Blocks.ROBOID_sound_siren, 'SIREN'],
                        [Lang.Blocks.ROBOID_sound_engine, 'ENGINE'],
                        [Lang.Blocks.ROBOID_sound_robot, 'ROBOT'],
                        [Lang.Blocks.ROBOID_sound_dibidibidip, 'DIBIDIBIDIP'],
                        [Lang.Blocks.ROBOID_sound_march, 'MARCH'],
                        [Lang.Blocks.ROBOID_sound_birthday, 'BIRTHDAY'],
                    ],
                    value: 'BEEP',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['1'],
                    },
                    null,
                ],
                type: 'uoalbert_play_sound_times',
            },
            paramsKeyMap: {
                SOUND: 0,
                COUNT: 1,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.playSound(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.play_sound(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_sound_beep, 'BEEP'],
                                    [Lang.Blocks.ROBOID_sound_siren, 'SIREN'],
                                    [Lang.Blocks.ROBOID_sound_engine, 'ENGINE'],
                                    [Lang.Blocks.ROBOID_sound_robot, 'ROBOT'],
                                    [Lang.Blocks.ROBOID_sound_dibidibidip, 'DIBIDIBIDIP'],
                                    [Lang.Blocks.ROBOID_sound_march, 'MARCH'],
                                    [Lang.Blocks.ROBOID_sound_birthday, 'BIRTHDAY'],
                                ],
                                value: 'BEEP',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_play_sound_times_until_done: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_sound_beep, 'BEEP'],
                        [Lang.Blocks.ROBOID_sound_siren, 'SIREN'],
                        [Lang.Blocks.ROBOID_sound_engine, 'ENGINE'],
                        [Lang.Blocks.ROBOID_sound_robot, 'ROBOT'],
                        [Lang.Blocks.ROBOID_sound_dibidibidip, 'DIBIDIBIDIP'],
                        [Lang.Blocks.ROBOID_sound_march, 'MARCH'],
                        [Lang.Blocks.ROBOID_sound_birthday, 'BIRTHDAY'],
                    ],
                    value: 'BEEP',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'text',
                        params: ['1'],
                    },
                    null,
                ],
                type: 'uoalbert_play_sound_times_until_done',
            },
            paramsKeyMap: {
                SOUND: 0,
                COUNT: 1,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.playSoundUntil(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.play_sound_until_done(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_sound_beep, 'BEEP'],
                                    [Lang.Blocks.ROBOID_sound_siren, 'SIREN'],
                                    [Lang.Blocks.ROBOID_sound_engine, 'ENGINE'],
                                    [Lang.Blocks.ROBOID_sound_robot, 'ROBOT'],
                                    [Lang.Blocks.ROBOID_sound_dibidibidip, 'DIBIDIBIDIP'],
                                    [Lang.Blocks.ROBOID_sound_march, 'MARCH'],
                                    [Lang.Blocks.ROBOID_sound_birthday, 'BIRTHDAY'],
                                ],
                                value: 'BEEP',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_change_buzzer_by: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['10'],
                    },
                    null,
                ],
                type: 'uoalbert_change_buzzer_by',
            },
            paramsKeyMap: {
                HZ: 0,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.changeBuzzer(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.add_buzzer(%1)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_set_buzzer_to: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['1000'],
                    },
                    null,
                ],
                type: 'uoalbert_set_buzzer_to',
            },
            paramsKeyMap: {
                HZ: 0,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setBuzzer(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_buzzer(%1)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_clear_sound: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'uoalbert_clear_sound',
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.clearSound(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.clear_sound()',
                        params: [null],
                    },
                ],
            },
        },
        uoalbert_play_note: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_note_c, 'C'],
                        [Lang.Blocks.ROBOID_note_c_sharp, 'C#'],
                        [Lang.Blocks.ROBOID_note_d, 'D'],
                        [Lang.Blocks.ROBOID_note_d_sharp, 'D#'],
                        [Lang.Blocks.ROBOID_note_e, 'E'],
                        [Lang.Blocks.ROBOID_note_f, 'F'],
                        [Lang.Blocks.ROBOID_note_f_sharp, 'F#'],
                        [Lang.Blocks.ROBOID_note_g, 'G'],
                        [Lang.Blocks.ROBOID_note_g_sharp, 'G#'],
                        [Lang.Blocks.ROBOID_note_a, 'A'],
                        [Lang.Blocks.ROBOID_note_a_sharp, 'A#'],
                        [Lang.Blocks.ROBOID_note_b, 'B'],
                    ],
                    value: 'C',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [null, '4', null],
                type: 'uoalbert_play_note',
            },
            paramsKeyMap: {
                NOTE: 0,
                OCTAVE: 1,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.playNote(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.play_note(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_note_c, 'C'],
                                    [Lang.Blocks.ROBOID_note_c_sharp, 'C#'],
                                    [Lang.Blocks.ROBOID_note_d, 'D'],
                                    [Lang.Blocks.ROBOID_note_d_sharp, 'D#'],
                                    [Lang.Blocks.ROBOID_note_e, 'E'],
                                    [Lang.Blocks.ROBOID_note_f, 'F'],
                                    [Lang.Blocks.ROBOID_note_f_sharp, 'F#'],
                                    [Lang.Blocks.ROBOID_note_g, 'G'],
                                    [Lang.Blocks.ROBOID_note_g_sharp, 'G#'],
                                    [Lang.Blocks.ROBOID_note_a, 'A'],
                                    [Lang.Blocks.ROBOID_note_a_sharp, 'A#'],
                                    [Lang.Blocks.ROBOID_note_b, 'B'],
                                ],
                                value: 'C',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['1', '1'],
                                    ['2', '2'],
                                    ['3', '3'],
                                    ['4', '4'],
                                    ['5', '5'],
                                    ['6', '6'],
                                    ['7', '7'],
                                ],
                                value: '1',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringOrNumberByValue,
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_play_note_for: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_note_c, 'C'],
                        [Lang.Blocks.ROBOID_note_c_sharp, 'C#'],
                        [Lang.Blocks.ROBOID_note_d, 'D'],
                        [Lang.Blocks.ROBOID_note_d_sharp, 'D#'],
                        [Lang.Blocks.ROBOID_note_e, 'E'],
                        [Lang.Blocks.ROBOID_note_f, 'F'],
                        [Lang.Blocks.ROBOID_note_f_sharp, 'F#'],
                        [Lang.Blocks.ROBOID_note_g, 'G'],
                        [Lang.Blocks.ROBOID_note_g_sharp, 'G#'],
                        [Lang.Blocks.ROBOID_note_a, 'A'],
                        [Lang.Blocks.ROBOID_note_a_sharp, 'A#'],
                        [Lang.Blocks.ROBOID_note_b, 'B'],
                    ],
                    value: 'C',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                        ['7', '7'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    '4',
                    {
                        type: 'text',
                        params: ['0.5'],
                    },
                    null,
                ],
                type: 'uoalbert_play_note_for',
            },
            paramsKeyMap: {
                NOTE: 0,
                OCTAVE: 1,
                BEAT: 2,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.playNoteBeat(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.play_note_beat(%1, %2, %3)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_note_c, 'C'],
                                    [Lang.Blocks.ROBOID_note_c_sharp, 'C#'],
                                    [Lang.Blocks.ROBOID_note_d, 'D'],
                                    [Lang.Blocks.ROBOID_note_d_sharp, 'D#'],
                                    [Lang.Blocks.ROBOID_note_e, 'E'],
                                    [Lang.Blocks.ROBOID_note_f, 'F'],
                                    [Lang.Blocks.ROBOID_note_f_sharp, 'F#'],
                                    [Lang.Blocks.ROBOID_note_g, 'G'],
                                    [Lang.Blocks.ROBOID_note_g_sharp, 'G#'],
                                    [Lang.Blocks.ROBOID_note_a, 'A'],
                                    [Lang.Blocks.ROBOID_note_a_sharp, 'A#'],
                                    [Lang.Blocks.ROBOID_note_b, 'B'],
                                ],
                                value: 'C',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['1', '1'],
                                    ['2', '2'],
                                    ['3', '3'],
                                    ['4', '4'],
                                    ['5', '5'],
                                    ['6', '6'],
                                    ['7', '7'],
                                ],
                                value: '1',
                                fontSize: 11,
                                bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                                converter: RoCode.block.converters.returnStringOrNumberByValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_rest_for: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['0.25'],
                    },
                    null,
                ],
                type: 'uoalbert_rest_for',
            },
            paramsKeyMap: {
                BEAT: 0,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.restBeat(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.rest_beat(%1)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_change_tempo_by: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['20'],
                    },
                    null,
                ],
                type: 'uoalbert_change_tempo_by',
            },
            paramsKeyMap: {
                BPM: 0,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.changeTempo(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.add_tempo(%1)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
        uoalbert_set_tempo_to: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'text',
                        params: ['60'],
                    },
                    null,
                ],
                type: 'uoalbert_set_tempo_to',
            },
            paramsKeyMap: {
                BPM: 0,
            },
            class: 'uoalbert_sound',
            isNotFor: ['uoalbert'],
            func(sprite, script) {
                const robot = RoCode.UoAlbert.getRobot();
                return robot ? robot.setTempo(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'UoAlbert.set_tempo(%1)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
            },
        },
    };
};

module.exports = RoCode.UoAlbert;
