'use strict';

function AlbertSchoolController() {
    this.prevDirection = 0;
    this.prevDirectionFinal = 0;
    this.directionCount = 0;
    this.directionCountFinal = 0;
    this.positionCount = 0;
    this.positionCountFinal = 0;
    this.isBackward = false;
}

AlbertSchoolController.prototype.PI = 3.14159265;
AlbertSchoolController.prototype.PI2 = 6.2831853;
AlbertSchoolController.prototype.GAIN_ANGLE = 30;
AlbertSchoolController.prototype.GAIN_ANGLE_FINE = 30;
AlbertSchoolController.prototype.GAIN_POSITION_FINE = 30;
AlbertSchoolController.prototype.STRAIGHT_SPEED = 30;
AlbertSchoolController.prototype.MAX_BASE_SPEED = 30;
AlbertSchoolController.prototype.GAIN_BASE_SPEED = 1.5;
AlbertSchoolController.prototype.GAIN_POSITION = 52.5;
AlbertSchoolController.prototype.POSITION_TOLERANCE_FINE = 3;
AlbertSchoolController.prototype.POSITION_TOLERANCE_FINE_LARGE = 5;
AlbertSchoolController.prototype.POSITION_TOLERANCE_ROUGH = 5;
AlbertSchoolController.prototype.POSITION_TOLERANCE_ROUGH_LARGE = 10;
AlbertSchoolController.prototype.ORIENTATION_TOLERANCE_FINAL = 0.087;
AlbertSchoolController.prototype.ORIENTATION_TOLERANCE_FINAL_LARGE = 0.122;
AlbertSchoolController.prototype.ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE = 0.262;
AlbertSchoolController.prototype.ORIENTATION_TOLERANCE_ROUGH = 0.122;
AlbertSchoolController.prototype.ORIENTATION_TOLERANCE_ROUGH_LARGE = 0.262;
AlbertSchoolController.prototype.ORIENTATION_TOLERANCE_ROUGH_LARGE_LARGE = 0.524;
AlbertSchoolController.prototype.MINIMUM_WHEEL_SPEED = 18;
AlbertSchoolController.prototype.MINIMUM_WHEEL_SPEED_FINE = 15;

AlbertSchoolController.prototype.clear = function() {
    this.prevDirection = 0;
    this.prevDirectionFinal = 0;
    this.directionCount = 0;
    this.directionCountFinal = 0;
    this.positionCount = 0;
    this.positionCountFinal = 0;
};

AlbertSchoolController.prototype.setBackward = function(backward) {
    this.isBackward = backward;
};

AlbertSchoolController.prototype.controlAngleInitial = function(
    wheels,
    currentRadian,
    targetRadian
) {
    if (this.isBackward) {
        currentRadian += this.PI;
    }
    var diff = this.validateRadian(targetRadian - currentRadian);
    var mag = Math.abs(diff);
    if (mag < this.ORIENTATION_TOLERANCE_ROUGH) return true;

    var direction = diff > 0 ? 1 : -1;
    if (mag < this.ORIENTATION_TOLERANCE_ROUGH_LARGE && direction * this.prevDirection < 0)
        return true;
    this.prevDirection = direction;

    var value = 0;
    if (diff > 0) {
        value = Math.log(1 + mag) * this.GAIN_ANGLE;
        if (value < this.MINIMUM_WHEEL_SPEED) value = this.MINIMUM_WHEEL_SPEED;
    } else {
        value = -Math.log(1 + mag) * this.GAIN_ANGLE;
        if (value > -this.MINIMUM_WHEEL_SPEED) value = -this.MINIMUM_WHEEL_SPEED;
    }
    value = parseInt(value);
    wheels.left = -value;
    wheels.right = value;
    return false;
};

AlbertSchoolController.prototype.controlAngleFinal = function(wheels, currentRadian, targetRadian) {
    var diff = this.validateRadian(targetRadian - currentRadian);
    var mag = Math.abs(diff);
    if (mag < this.ORIENTATION_TOLERANCE_FINAL) return true;

    var direction = diff > 0 ? 1 : -1;
    if (mag < this.ORIENTATION_TOLERANCE_FINAL_LARGE && direction * this.prevDirectionFinal < 0)
        return true;
    if (
        mag < this.ORIENTATION_TOLERANCE_FINAL_LARGE_LARGE &&
        direction * this.prevDirectionFinal < 0
    ) {
        if (++this.directionCountFinal > 3) return true;
    }
    this.prevDirectionFinal = direction;

    var value = 0;
    if (diff > 0) {
        value = Math.log(1 + mag) * this.GAIN_ANGLE_FINE;
        if (value < this.MINIMUM_WHEEL_SPEED) value = this.MINIMUM_WHEEL_SPEED;
    } else {
        value = -Math.log(1 + mag) * this.GAIN_ANGLE_FINE;
        if (value > -this.MINIMUM_WHEEL_SPEED) value = -this.MINIMUM_WHEEL_SPEED;
    }
    value = parseInt(value);
    wheels.left = -value;
    wheels.right = value;
    return false;
};

AlbertSchoolController.prototype.controlPositionFine = function(
    wheels,
    currentX,
    currentY,
    currentRadian,
    targetX,
    targetY
) {
    var targetRadian = Math.atan2(targetY - currentY, targetX - currentX);
    if (this.isBackward) {
        currentRadian += this.PI;
    }
    var diff = this.validateRadian(targetRadian - currentRadian);
    var mag = Math.abs(diff);
    var ex = targetX - currentX;
    var ey = targetY - currentY;
    var dist = Math.sqrt(ex * ex + ey * ey);
    if (dist < this.POSITION_TOLERANCE_FINE) return true;
    if (dist < this.POSITION_TOLERANCE_FINE_LARGE) {
        if (++this.positionCountFinal > 5) {
            this.positionCountFinal = 0;
            return true;
        }
    }
    var value = 0;
    if (diff > 0) value = Math.log(1 + mag) * this.GAIN_POSITION_FINE;
    else value = -Math.log(1 + mag) * this.GAIN_POSITION_FINE;
    if (this.isBackward) {
        value = -value;
    }
    value = parseInt(value);
    wheels.left = this.MINIMUM_WHEEL_SPEED_FINE - value;
    wheels.right = this.MINIMUM_WHEEL_SPEED_FINE + value;
    if (this.isBackward) {
        wheels.left = -wheels.left;
        wheels.right = -wheels.right;
    }
    return false;
};

AlbertSchoolController.prototype.controlPosition = function(
    wheels,
    currentX,
    currentY,
    currentRadian,
    targetX,
    targetY
) {
    var targetRadian = Math.atan2(targetY - currentY, targetX - currentX);
    if (this.isBackward) {
        currentRadian += this.PI;
    }
    var diff = this.validateRadian(targetRadian - currentRadian);
    var mag = Math.abs(diff);
    var ex = targetX - currentX;
    var ey = targetY - currentY;
    var dist = Math.sqrt(ex * ex + ey * ey);
    if (dist < this.POSITION_TOLERANCE_ROUGH) return true;
    if (dist < this.POSITION_TOLERANCE_ROUGH_LARGE) {
        if (++this.positionCount > 10) {
            this.positionCount = 0;
            return true;
        }
    } else {
        this.positionCount = 0;
    }
    if (mag < 0.01) {
        wheels.left = this.STRAIGHT_SPEED;
        wheels.right = this.STRAIGHT_SPEED;
    } else {
        var base = (this.MINIMUM_WHEEL_SPEED + 0.5 / mag) * this.GAIN_BASE_SPEED;
        if (base > this.MAX_BASE_SPEED) base = this.MAX_BASE_SPEED;

        var value = 0;
        if (diff > 0) value = Math.log(1 + mag) * this.GAIN_POSITION;
        else value = -Math.log(1 + mag) * this.GAIN_POSITION;
        if (this.isBackward) {
            value = -value;
        }
        base = parseInt(base);
        value = parseInt(value);
        wheels.left = base - value;
        wheels.right = base + value;
    }
    if (this.isBackward) {
        wheels.left = -wheels.left;
        wheels.right = -wheels.right;
    }
    return false;
};

AlbertSchoolController.prototype.validateRadian = function(radian) {
    if (radian > this.PI) return radian - this.PI2;
    else if (radian < -this.PI) return radian + this.PI2;
    return radian;
};

AlbertSchoolController.prototype.toRadian = function(degree) {
    return (degree * 3.14159265) / 180.0;
};

function AlbertSchoolNavigator() {
    this.controller = new AlbertSchoolController();
    this.mode = 0;
    this.state = 0;
    this.initialized = false;
    this.boardWidth = 0;
    this.boardHeight = 0;
    this.currentX = -1;
    this.currentY = -1;
    this.currentTheta = -200;
    this.targetX = -1;
    this.targetY = -1;
    this.targetTheta = -200;
    this.wheels = { completed: false, left: 0, right: 0 };
}

AlbertSchoolNavigator.prototype.clear = function() {
    this.mode = 0;
    this.state = 0;
    this.initialized = false;
    this.currentX = -1;
    this.currentY = -1;
    this.currentTheta = -200;
    this.targetX = -1;
    this.targetY = -1;
    this.targetTheta = -200;
    this.wheels.completed = false;
    this.wheels.left = 0;
    this.wheels.right = 0;
    this.controller.clear();
};

AlbertSchoolNavigator.prototype.getBoardWidth = function() {
    return this.boardWidth;
};

AlbertSchoolNavigator.prototype.getBoardHeight = function() {
    return this.boardHeight;
};

AlbertSchoolNavigator.prototype.setBoardSize = function(width, height) {
    this.boardWidth = width;
    this.boardHeight = height;
};

AlbertSchoolNavigator.prototype.setBackward = function(backward) {
    this.controller.setBackward(backward);
};

AlbertSchoolNavigator.prototype.moveTo = function(x, y) {
    this.clear();
    this.targetX = x;
    this.targetY = y;
    this.state = 1;
    this.mode = 1;
};

AlbertSchoolNavigator.prototype.turnTo = function(deg) {
    this.clear();
    this.targetTheta = deg;
    this.state = 1;
    this.mode = 2;
};

AlbertSchoolNavigator.prototype.handleSensory = function(sensory) {
    if (this.mode == 1) {
        var x = sensory.positionX;
        var y = sensory.positionY;
        if (x >= 0) this.currentX = x;
        if (y >= 0) this.currentY = y;
        this.currentTheta = sensory.orientation;
        switch (this.state) {
            case 1: {
                if (this.initialized == false) {
                    if (this.currentX < 0 || this.currentY < 0) {
                        this.wheels.left = 20;
                        this.wheels.right = -20;
                    } else {
                        this.initialized = true;
                    }
                }
                if (this.initialized) {
                    var currentRadian = this.controller.toRadian(this.currentTheta);
                    var dx = this.targetX - this.currentX;
                    var dy = this.targetY - this.currentY;
                    var targetRadian = Math.atan2(dy, dx);
                    if (
                        this.controller.controlAngleInitial(
                            this.wheels,
                            currentRadian,
                            targetRadian
                        )
                    ) {
                        this.state = 2;
                    }
                }
                break;
            }
            case 2: {
                var currentRadian = this.controller.toRadian(this.currentTheta);
                if (
                    this.controller.controlPosition(
                        this.wheels,
                        this.currentX,
                        this.currentY,
                        currentRadian,
                        this.targetX,
                        this.targetY
                    )
                ) {
                    this.state = 3;
                }
                break;
            }
            case 3: {
                var currentRadian = this.controller.toRadian(this.currentTheta);
                if (
                    this.controller.controlPositionFine(
                        this.wheels,
                        this.currentX,
                        this.currentY,
                        currentRadian,
                        this.targetX,
                        this.targetY
                    )
                ) {
                    this.clear();
                    this.wheels.completed = true;
                }
                break;
            }
        }
    } else if (this.mode == 2) {
        this.currentTheta = sensory.orientation;
        switch (this.state) {
            case 1: {
                var currentRadian = this.controller.toRadian(this.currentTheta);
                var targetRadian = this.controller.toRadian(this.targetTheta);
                if (this.controller.controlAngleInitial(this.wheels, currentRadian, targetRadian)) {
                    this.state = 2;
                }
                break;
            }
            case 2: {
                var currentRadian = this.controller.toRadian(this.currentTheta);
                var targetRadian = this.controller.toRadian(this.targetTheta);
                if (this.controller.controlAngleFinal(this.wheels, currentRadian, targetRadian)) {
                    this.clear();
                    this.wheels.completed = true;
                }
                break;
            }
        }
    }
    return this.wheels;
};

function AlbertSchoolRobot(index) {
    this.sensory = {
        signalStrength: 0,
        leftProximity: 0,
        rightProximity: 0,
        accelerationX: 0,
        accelerationY: 0,
        accelerationZ: 0,
        positionX: -1,
        positionY: -1,
        orientation: -200,
        light: 0,
        temperature: 0,
        frontOid: -1,
        backOid: -1,
        batteryState: 2,
        tilt: 0,
    };
    this.motoring = {
        group: 'albertschool',
        module: 'albertschool',
        index,
    };
    this.blockId = 0;
    this.wheelBlockId = 0;
    this.wheelTimer = undefined;
    this.navigationCallback = undefined;
    this.navigator = undefined;
    this.noteBlockId = 0;
    this.noteTimer1 = undefined;
    this.noteTimer2 = undefined;
    this.tempo = 60;
    this.timeouts = [];
}

AlbertSchoolRobot.prototype.__PORT_MAP = {
    group: 'albertschool',
    module: 'albertschool',
    motion: 0,
    leftWheel: 0,
    rightWheel: 0,
    buzzer: 0,
    leftEye: 0,
    rightEye: 0,
    note: 0,
    bodyLed: 0,
    frontLed: 0,
    padWidth: 0,
    padHeight: 0,
};

AlbertSchoolRobot.prototype.setZero = function() {
    var portMap = this.__PORT_MAP;
    var motoring = this.motoring;
    for (var port in portMap) {
        motoring[port] = portMap[port];
    }
    this.blockId = 0;
    this.wheelBlockId = 0;
    this.wheelTimer = undefined;
    this.navigationCallback = undefined;
    this.navigator = undefined;
    this.noteBlockId = 0;
    this.noteTimer1 = undefined;
    this.noteTimer2 = undefined;
    this.tempo = 60;
    this.__removeAllTimeouts();
};

AlbertSchoolRobot.prototype.afterReceive = function(pd) {
    this.sensory = pd;
    this.handleSensory();
};

AlbertSchoolRobot.prototype.afterSend = function(sq) {};

AlbertSchoolRobot.prototype.setMotoring = function(motoring) {
    this.motoring = motoring;
};

AlbertSchoolRobot.prototype.__setModule = function() {
    this.motoring.group = 'albertschool';
    this.motoring.module = 'albertschool';
};

AlbertSchoolRobot.prototype.__removeTimeout = function(id) {
    clearTimeout(id);
    var idx = this.timeouts.indexOf(id);
    if (idx >= 0) {
        this.timeouts.splice(idx, 1);
    }
};

AlbertSchoolRobot.prototype.__removeAllTimeouts = function() {
    var timeouts = this.timeouts;
    for (var i in timeouts) {
        clearTimeout(timeouts[i]);
    }
    this.timeouts = [];
};

AlbertSchoolRobot.prototype.__issueWheelBlockId = function() {
    this.wheelBlockId = this.blockId = (this.blockId % 65535) + 1;
    return this.wheelBlockId;
};

AlbertSchoolRobot.prototype.__cancelWheel = function() {
    this.wheelBlockId = 0;
    if (this.wheelTimer !== undefined) {
        this.__removeTimeout(this.wheelTimer);
    }
    this.wheelTimer = undefined;
};

AlbertSchoolRobot.prototype.__getNavigator = function() {
    if (this.navigator == undefined) {
        this.navigator = new AlbertSchoolNavigator();
    }
    return this.navigator;
};

AlbertSchoolRobot.prototype.__cancelNavigation = function() {
    this.navigationCallback = undefined;
    if (this.navigator) {
        this.navigator.clear();
    }
};

AlbertSchoolRobot.prototype.__issueNoteBlockId = function() {
    this.noteBlockId = this.blockId = (this.blockId % 65535) + 1;
    return this.noteBlockId;
};

AlbertSchoolRobot.prototype.__cancelNote = function() {
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

AlbertSchoolRobot.prototype.handleSensory = function() {
    if (this.navigationCallback) {
        if (this.navigator) {
            var result = this.navigator.handleSensory(this.sensory);
            this.motoring.leftWheel = result.left;
            this.motoring.rightWheel = result.right;
            if (result.completed) {
                var callback = this.navigationCallback;
                this.__cancelNavigation();
                if (callback) callback();
            }
        }
    }
};

AlbertSchoolRobot.prototype.__SENSORS = {
    SIGNAL_STRENGTH: 'signalStrength',
    LEFT_PROXIMITY: 'leftProximity',
    RIGHT_PROXIMITY: 'rightProximity',
    ACCELERATION_X: 'accelerationX',
    ACCELERATION_Y: 'accelerationY',
    ACCELERATION_Z: 'accelerationZ',
    POSITION_X: 'positionX',
    POSITION_Y: 'positionY',
    ORIENTATION: 'orientation',
    LIGHT: 'light',
    TEMPERATURE: 'temperature',
    FRONT_OID: 'frontOid',
    REAR_OID: 'backOid',
    BATTERY_STATE: 'batteryState',
    TILT: 'tilt',
};

AlbertSchoolRobot.prototype.getValue = function(script) {
    this.__setModule();
    var dev = script.getField('DEVICE');

    var sensor = this.__SENSORS[dev] || dev;
    return this.sensory[sensor];
};

AlbertSchoolRobot.prototype.checkBoolean = function(script) {
    this.__setModule();
    var sensory = this.sensory;
    var value = 0;
    var dev = script.getField('DEVICE');
    if (dev.startsWith('TILT')) {
        if (sensory.tilt === undefined) {
            if (
                sensory.accelerationZ < 2048 &&
                sensory.accelerationX > 2048 &&
                sensory.accelerationY > -1024 &&
                sensory.accelerationY < 1024
            )
                value = 1;
            else if (
                sensory.accelerationZ < 2048 &&
                sensory.accelerationX < -2048 &&
                sensory.accelerationY > -1024 &&
                sensory.accelerationY < 1024
            )
                value = -1;
            else if (
                sensory.accelerationZ < 2048 &&
                sensory.accelerationY > 2048 &&
                sensory.accelerationX > -1024 &&
                sensory.accelerationX < 1024
            )
                value = 2;
            else if (
                sensory.accelerationZ < 2048 &&
                sensory.accelerationY < -2048 &&
                sensory.accelerationX > -1024 &&
                sensory.accelerationX < 1024
            )
                value = -2;
            else if (
                sensory.accelerationZ > 3072 &&
                sensory.accelerationX > -2048 &&
                sensory.accelerationX < 2048 &&
                sensory.accelerationY > -2048 &&
                sensory.accelerationY < 2048
            )
                value = 3;
            else if (
                sensory.accelerationZ < -3072 &&
                sensory.accelerationX > -1024 &&
                sensory.accelerationX < 1024 &&
                sensory.accelerationY > -1024 &&
                sensory.accelerationY < 1024
            )
                value = -3;
            else value = 0;
        } else {
            value = sensory.tilt;
        }
        switch (dev) {
            case 'TILT_FORWARD':
                return value == 1;
            case 'TILT_BACKWARD':
                return value == -1;
            case 'TILT_LEFT':
                return value == 2;
            case 'TILT_RIGHT':
                return value == -2;
            case 'TILT_FLIP':
                return value == 3;
            case 'TILT_NOT':
                return value == -3;
        }
        return false;
    } else {
        switch (dev) {
            case 'BATTERY_NORMAL':
                return sensory.batteryState === 2;
            case 'BATTERY_LOW':
                return sensory.batteryState === 1;
            case 'BATTERY_EMPTY':
                return sensory.batteryState === 0;
        }
        return false;
    }
};

AlbertSchoolRobot.prototype.checkHandFound = function(script) {
    this.__setModule();
    var sensory = this.sensory;
    return sensory.handFound === undefined
        ? sensory.leftProximity > 40 || sensory.rightProximity > 40
        : sensory.handFound;
};

AlbertSchoolRobot.prototype.checkOid = function(script) {
    this.__setModule();
    var sensory = this.sensory;
    var oid = script.getField('OID', script);
    var value = script.getNumberValue('VALUE');
    if (oid == 'FRONT') return sensory.frontOid == value;
    else return sensory.backOid == value;
};

AlbertSchoolRobot.prototype.__motion = function(type, leftVelocity, rightVelocity, secs, callback) {
    var self = this;
    var motoring = self.motoring;
    self.__cancelNavigation();
    self.__cancelWheel();

    secs = parseFloat(secs);
    if (secs && secs > 0) {
        var id = self.__issueWheelBlockId();
        motoring.leftWheel = leftVelocity;
        motoring.rightWheel = rightVelocity;
        motoring.motion = type;
        self.wheelTimer = setTimeout(() => {
            if (self.wheelBlockId == id) {
                motoring.leftWheel = 0;
                motoring.rightWheel = 0;
                motoring.motion = 0;
                self.__cancelWheel();
                callback();
            }
        }, secs * 1000);
        self.timeouts.push(self.wheelTimer);
    } else {
        motoring.leftWheel = 0;
        motoring.rightWheel = 0;
        motoring.motion = 0;
        callback();
    }
};

AlbertSchoolRobot.prototype.moveForwardSecs = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;
        var secs = script.getNumberValue('SECS');
        if (secs < 0) {
            this.__motion(2, -30, -30, -secs, () => {
                script.isMoving = false;
            });
        } else {
            this.__motion(1, 30, 30, secs, () => {
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

AlbertSchoolRobot.prototype.moveBackwardSecs = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;
        var secs = script.getNumberValue('SECS');
        if (secs < 0) {
            this.__motion(1, 30, 30, -secs, () => {
                script.isMoving = false;
            });
        } else {
            this.__motion(2, -30, -30, secs, () => {
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

AlbertSchoolRobot.prototype.turnSecs = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;
        var direction = script.getField('DIRECTION');
        var secs = script.getNumberValue('SECS');
        if (direction == 'LEFT') {
            if (secs < 0) {
                this.__motion(4, 30, -30, -secs, () => {
                    script.isMoving = false;
                });
            } else {
                this.__motion(3, -30, 30, secs, () => {
                    script.isMoving = false;
                });
            }
        } else {
            if (secs < 0) {
                this.__motion(3, -30, 30, -secs, () => {
                    script.isMoving = false;
                });
            } else {
                this.__motion(4, 30, -30, secs, () => {
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

AlbertSchoolRobot.prototype.setWheels = function(script) {
    var motoring = this.motoring;
    this.__setModule();
    this.__cancelNavigation();
    this.__cancelWheel();

    var leftVelocity = script.getNumberValue('LEFT');
    var rightVelocity = script.getNumberValue('RIGHT');

    leftVelocity = parseFloat(leftVelocity);
    rightVelocity = parseFloat(rightVelocity);
    if (typeof leftVelocity == 'number') {
        motoring.leftWheel = leftVelocity;
    }
    if (typeof rightVelocity == 'number') {
        motoring.rightWheel = rightVelocity;
    }
    motoring.motion = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.changeWheels = function(script) {
    var motoring = this.motoring;
    this.__setModule();
    this.__cancelNavigation();
    this.__cancelWheel();

    var leftVelocity = script.getNumberValue('LEFT');
    var rightVelocity = script.getNumberValue('RIGHT');

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
    motoring.motion = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.setWheel = function(script) {
    var motoring = this.motoring;
    this.__setModule();
    this.__cancelNavigation();
    this.__cancelWheel();

    var wheel = script.getField('WHEEL');
    var velocity = script.getNumberValue('VELOCITY');

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
    motoring.motion = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.changeWheel = function(script) {
    var motoring = this.motoring;
    this.__setModule();
    this.__cancelNavigation();
    this.__cancelWheel();

    var wheel = script.getField('WHEEL');
    var velocity = script.getNumberValue('VELOCITY');

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
    motoring.motion = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.stop = function(script) {
    this.__setModule();
    this.__cancelNavigation();
    this.__cancelWheel();

    var motoring = this.motoring;
    motoring.leftWheel = 0;
    motoring.rightWheel = 0;
    motoring.motion = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.setBoardSize = function(script) {
    var motoring = this.motoring;
    this.__setModule();

    var width = script.getNumberValue('WIDTH');
    var height = script.getNumberValue('HEIGHT');
    width = parseInt(width);
    height = parseInt(height);
    if (width && height && width > 0 && height > 0) {
        var navi = this.__getNavigator();
        navi.setBoardSize(width, height);
        motoring.padWidth = width;
        motoring.padHeight = height;
    }
    return script.callReturn();
};

AlbertSchoolRobot.prototype.moveToOnBoard = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;
        this.__cancelNavigation();
        this.__cancelWheel();
        var toward = script.getField('TOWARD');
        var x = script.getNumberValue('X');
        var y = script.getNumberValue('Y');
        x = parseInt(x);
        y = parseInt(y);
        var navi = this.__getNavigator();
        if (
            typeof x == 'number' &&
            typeof y == 'number' &&
            x >= 0 &&
            x < navi.getBoardWidth() &&
            y >= 0 &&
            y < navi.getBoardHeight()
        ) {
            this.motoring.motion = 0;
            navi.setBackward(toward == 'BACKWARD');
            navi.moveTo(x, y);
            this.navigationCallback = () => {
                script.isMoving = false;
            };
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

AlbertSchoolRobot.prototype.setOrientationToOnBoard = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isMoving = true;
        this.__cancelNavigation();
        this.__cancelWheel();
        var degree = script.getNumberValue('DEGREE');
        degree = parseInt(degree);
        if (typeof degree == 'number') {
            var navi = this.__getNavigator();
            this.motoring.motion = 0;
            navi.setBackward(false);
            navi.turnTo(degree);
            this.navigationCallback = () => {
                script.isMoving = false;
            };
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

AlbertSchoolRobot.prototype.__COLORS = {
    RED: 4,
    ORANGE: 4,
    YELLOW: 6,
    GREEN: 2,
    SKY_BLUE: 3,
    BLUE: 1,
    VIOLET: 5,
    PURPLE: 5,
    WHITE: 7,
    '4': 4,
    '6': 6,
    '2': 2,
    '3': 3,
    '1': 1,
    '5': 5,
    '7': 7,
};

AlbertSchoolRobot.prototype.setEye = function(script) {
    this.__setModule();
    var eye = script.getField('EYE');
    var color = script.getField('COLOR');
    color = parseInt(this.__COLORS[color]);

    if (color && color > 0) {
        if (eye == 'LEFT') {
            this.motoring.leftEye = color;
        } else if (eye == 'RIGHT') {
            this.motoring.rightEye = color;
        } else {
            this.motoring.leftEye = color;
            this.motoring.rightEye = color;
        }
    }
    return script.callReturn();
};

AlbertSchoolRobot.prototype.clearEye = function(script) {
    this.__setModule();
    var eye = script.getField('EYE');

    if (eye == 'LEFT') {
        this.motoring.leftEye = 0;
    } else if (eye == 'RIGHT') {
        this.motoring.rightEye = 0;
    } else {
        this.motoring.leftEye = 0;
        this.motoring.rightEye = 0;
    }
    return script.callReturn();
};

AlbertSchoolRobot.prototype.turnBodyLed = function(script) {
    this.__setModule();
    var value = script.getField('VALUE');
    this.motoring.bodyLed = value == 'ON' ? 1 : 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.turnFrontLed = function(script) {
    this.__setModule();
    var value = script.getField('VALUE');
    this.motoring.frontLed = value == 'ON' ? 1 : 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.__runBeep = function(count, id, callback) {
    if (count) {
        var self = this;
        var motoring = self.motoring;
        motoring.buzzer = 440;
        motoring.note = 0;
        self.noteTimer1 = setTimeout(() => {
            if (!id || self.noteBlockId == id) {
                motoring.buzzer = 0;
                if (self.noteTimer1 !== undefined) {
                    self.__removeTimeout(self.noteTimer1);
                }
                self.noteTimer1 = undefined;
            }
        }, 100);
        self.timeouts.push(self.noteTimer1);
        self.noteTimer2 = setTimeout(() => {
            if (!id || self.noteBlockId == id) {
                motoring.buzzer = 0;
                if (self.noteTimer2 !== undefined) {
                    self.__removeTimeout(self.noteTimer2);
                }
                self.noteTimer2 = undefined;
                if (count < 0) {
                    self.__runBeep(-1, id, callback);
                } else if (count == 1) {
                    self.__cancelNote();
                    if (id && callback) {
                        callback();
                    }
                } else {
                    self.__runBeep(count - 1, id, callback);
                }
            }
        }, 200);
        self.timeouts.push(self.noteTimer2);
    }
};

AlbertSchoolRobot.prototype.beep = function(script) {
    this.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isPlaying = true;
        this.__cancelNote();
        var id = this.__issueNoteBlockId();
        this.__runBeep(1, id, () => {
            script.isPlaying = false;
        });
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

AlbertSchoolRobot.prototype.setBuzzer = function(script) {
    this.__setModule();
    this.__cancelNote();
    var hz = script.getNumberValue('HZ');

    hz = parseFloat(hz);
    if (typeof hz == 'number') {
        this.motoring.buzzer = hz;
    }
    this.motoring.note = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.changeBuzzer = function(script) {
    this.__setModule();
    this.__cancelNote();
    var hz = script.getNumberValue('HZ');

    var motoring = this.motoring;
    hz = parseFloat(hz);
    if (typeof hz == 'number') {
        motoring.buzzer = motoring.buzzer != undefined ? motoring.buzzer + hz : hz;
    }
    motoring.note = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.clearBuzzer = function(script) {
    this.__setModule();
    this.__cancelNote();
    this.motoring.buzzer = 0;
    this.motoring.note = 0;
    return script.callReturn();
};

AlbertSchoolRobot.prototype.__NOTES = {
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

AlbertSchoolRobot.prototype.playNote = function(script) {
    this.__setModule();
    this.__cancelNote();

    var note = script.getField('NOTE');
    var octave = script.getNumberField('OCTAVE');

    note = parseInt(this.__NOTES[note]);
    octave = parseInt(octave);
    var motoring = this.motoring;
    motoring.buzzer = 0;
    if (note && octave && octave > 0 && octave < 8) {
        motoring.note = note + (octave - 1) * 12;
    } else {
        motoring.note = 0;
    }
    return script.callReturn();
};

AlbertSchoolRobot.prototype.playNoteBeat = function(script) {
    var self = this;
    self.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isPlaying = true;
        self.__cancelNote();

        var motoring = self.motoring;
        var note = script.getField('NOTE');
        var octave = script.getNumberField('OCTAVE');
        var beat = script.getNumberValue('BEAT');

        note = parseInt(this.__NOTES[note]);
        octave = parseInt(octave);
        beat = parseFloat(beat);
        motoring.buzzer = 0;
        if (note && octave && octave > 0 && octave < 8 && beat && beat > 0 && self.tempo > 0) {
            var id = self.__issueNoteBlockId();
            note += (octave - 1) * 12;
            motoring.note = note;
            var timeValue = (beat * 60 * 1000) / self.tempo;
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
        } else {
            motoring.note = 0;
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

AlbertSchoolRobot.prototype.restBeat = function(script) {
    var self = this;
    self.__setModule();
    if (!script.isStart) {
        script.isStart = true;
        script.isPlaying = true;
        self.__cancelNote();
        var beat = script.getNumberValue('BEAT');

        var motoring = self.motoring;
        beat = parseFloat(beat);
        motoring.buzzer = 0;
        motoring.note = 0;
        if (beat && beat > 0 && self.tempo > 0) {
            var id = self.__issueNoteBlockId();
            var timeValue = (beat * 60 * 1000) / self.tempo;
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

AlbertSchoolRobot.prototype.setTempo = function(script) {
    this.__setModule();
    var bpm = script.getNumberValue('BPM');

    bpm = parseFloat(bpm);
    if (typeof bpm == 'number') {
        this.tempo = bpm;
        if (this.tempo < 1) {
            this.tempo = 1;
        }
    }
    return script.callReturn();
};

AlbertSchoolRobot.prototype.changeTempo = function(script) {
    this.__setModule();
    var bpm = script.getNumberValue('BPM');

    bpm = parseFloat(bpm);
    if (typeof bpm == 'number') {
        this.tempo += bpm;
        if (this.tempo < 1) {
            this.tempo = 1;
        }
    }
    return script.callReturn();
};

RoCode.Albert = {
    robot: undefined,
    getRobot() {
        if (RoCode.Albert.robot == undefined) RoCode.Albert.robot = new AlbertSchoolRobot(0);
        RoCode.Albert.robot.setMotoring(RoCode.hw.sendQueue);
        return RoCode.Albert.robot;
    },
    setZero() {
        if (RoCode.Albert.robot) RoCode.Albert.robot.setZero();
        RoCode.hw.update();
    },
    afterReceive(pd) {
        var robot = RoCode.Albert.getRobot();
        if (robot) robot.afterReceive(pd);
    },
    id: '2.5',
    name: 'albert',
    url: 'http://albert.school',
    imageName: 'albertschool.png',
    title: {
        ko: '????????? ??????',
        en: 'Albert School',
        jp: '???????????????????????????',
        vn: 'Albert School',
    },
    monitorTemplate: {
        imgPath: 'hw/albert.png',
        width: 387,
        height: 503,
        listPorts: {
            accelerationX: {
                name: Lang.Blocks.ALBERT_sensor_acceleration_x,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            accelerationY: {
                name: Lang.Blocks.ALBERT_sensor_acceleration_y,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            accelerationZ: {
                name: Lang.Blocks.ALBERT_sensor_acceleration_z,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            frontOid: {
                name: Lang.Blocks.ALBERT_sensor_front_oid,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            backOid: {
                name: Lang.Blocks.ALBERT_sensor_back_oid,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            positionX: {
                name: Lang.Blocks.ALBERT_sensor_position_x,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            positionY: {
                name: Lang.Blocks.ALBERT_sensor_position_y,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            orientation: {
                name: Lang.Blocks.ALBERT_sensor_orientation,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            temperature: {
                name: Lang.Blocks.ALBERT_sensor_temperature,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            signalStrength: {
                name: Lang.Blocks.ALBERT_sensor_signal_strength,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            buzzer: {
                name: Lang.Hw.buzzer,
                type: 'output',
                pos: { x: 0, y: 0 },
            },
            note: { name: Lang.Hw.note, type: 'output', pos: { x: 0, y: 0 } },
        },
        ports: {
            leftProximity: {
                name: Lang.Blocks.ALBERT_sensor_left_proximity,
                type: 'input',
                pos: { x: 178, y: 401 },
            },
            rightProximity: {
                name: Lang.Blocks.ALBERT_sensor_right_proximity,
                type: 'input',
                pos: { x: 66, y: 359 },
            },
            light: {
                name: Lang.Blocks.ALBERT_sensor_light,
                type: 'input',
                pos: { x: 127, y: 391 },
            },
            leftWheel: {
                name: Lang.Hw.leftWheel,
                type: 'output',
                pos: { x: 299, y: 406 },
            },
            rightWheel: {
                name: Lang.Hw.rightWheel,
                type: 'output',
                pos: { x: 22, y: 325 },
            },
            leftEye: {
                name: Lang.Hw.leftEye,
                type: 'output',
                pos: { x: 260, y: 26 },
            },
            rightEye: {
                name: Lang.Hw.rightEye,
                type: 'output',
                pos: { x: 164, y: 13 },
            },
            bodyLed: {
                name: Lang.Hw.body + ' ' + Lang.Hw.led_en,
                type: 'output',
                pos: { x: 367, y: 308 },
            },
            frontLed: {
                name: Lang.Hw.front + ' ' + Lang.Hw.led_en,
                pos: { x: 117, y: 410 },
            },
        },
        mode: 'both',
    },
};

RoCode.Albert.setLanguage = () => ({
    ko: {
        template: {
            albert_value: '%1',
            albert_hand_found: '??? ???????',
            albert_is_oid_value: '%1 OID??? %2???????',
            albert_boolean: '%1?',
            albert_move_forward_for_secs: '????????? %1??? ???????????? %2',
            albert_move_backward_for_secs: '?????? %1??? ???????????? %2',
            albert_turn_for_secs: '%1 ?????? %2??? ?????? %3',
            albert_change_both_wheels_by: '?????? ?????? %1 ????????? ?????? %2 ?????? ????????? %3',
            albert_set_both_wheels_to: '?????? ?????? %1 ????????? ?????? %2 (???)??? ????????? %3',
            albert_change_wheel_by: '%1 ?????? %2 ?????? ????????? %3',
            albert_set_wheel_to: '%1 ?????? %2 (???)??? ????????? %3',
            albert_stop: '???????????? %1',
            albert_set_pad_size_to: '?????? ????????? ??? %1 ?????? %2(???)??? ????????? %3',
            albert_move_to_x_y_on_board: '?????? %1 x: %2 y: %3 ????????? ???????????? %4',
            albert_set_orientation_on_board: '?????? %1??? ???????????? ?????? %2',
            albert_set_eye_to: '%1 ?????? %2 ?????? ????????? %3',
            albert_clear_eye: '%1 ??? ?????? %2',
            albert_body_led: '?????? LED %1 %2',
            albert_front_led: '?????? LED %1 %2',
            albert_beep: '??? ???????????? %1',
            albert_change_buzzer_by: '?????? ?????? %1 ?????? ????????? %2',
            albert_set_buzzer_to: '?????? ?????? %1 (???)??? ????????? %2',
            albert_clear_buzzer: '?????? ?????? %1',
            albert_play_note: '%1 %2 ?????? ???????????? %3',
            albert_play_note_for: '%1 %2 ?????? %3 ?????? ???????????? %4',
            albert_rest_for: '%1 ?????? ?????? %2',
            albert_change_tempo_by: '?????? ????????? %1 ?????? ????????? %2',
            albert_set_tempo_to: '?????? ????????? %1 BPM?????? ????????? %2',
            albert_move_forward: '????????? ???????????? %1',
            albert_move_backward: '?????? ???????????? %1',
            albert_turn_around: '%1 ?????? ?????? %2',
            albert_set_led_to: '%1 %2 ?????? ????????? %3',
            albert_clear_led: '%1 %2',
            albert_change_wheels_by: '%1 %2 %3',
            albert_set_wheels_to: '%1 %2 %3',
        },
        Helper: {
            albert_value:
                '?????? ?????? ??????: ?????? ?????? ????????? ??? (?????? ??????: 0 ~ 255, ?????????: 0)<br/>????????? ?????? ??????: ????????? ?????? ????????? ??? (?????? ??????: 0 ~ 255, ?????????: 0)<br/>x??? ?????????: ????????? ????????? X??? ??? (?????? ??????: -8192 ~ 8191, ?????????: 0) ????????? ???????????? ????????? X?????? ?????? ???????????????.<br/>y??? ?????????: ????????? ????????? Y??? ??? (?????? ??????: -8192 ~ 8191, ?????????: 0) ????????? ?????? ????????? Y?????? ?????? ???????????????.<br/>z??? ?????????: ????????? ????????? Z??? ??? (?????? ??????: -8192 ~ 8191, ?????????: 0) ????????? ?????? ????????? Z?????? ?????? ???????????????.<br/>?????? OID: ?????? OID ????????? ??? (?????? ??????: -1 ~ 65535, ?????????: -1)<br/>?????? OID: ?????? OID ????????? ??? (?????? ??????: -1 ~ 65535, ?????????: -1)<br/>x ??????: ?????? ????????? ????????? ?????? x?????? ??? (?????? ??????: -1 ~ 39999, ?????????: -1)<br/>y ??????: ?????? ????????? ????????? ?????? y?????? ??? (?????? ??????: -1 ~ 39999, ?????????: -1)<br/>??????: ?????? ????????? ????????? ?????? ??? (?????? ??????: -179 ~ 180, ?????????: -200)<br/>??????: ?????? ????????? ??? (?????? ??????: 0 ~ 65535, ?????????: 0) ?????? ?????? ?????? ????????????.<br/>??????: ?????? ????????? ?????? ??? (?????? ??????: ?????? -40 ~ 88???, ?????????: 0)<br/>?????? ??????: ???????????? ?????? ????????? ?????? ?????? (?????? ??????: -128 ~ 0 dBm, ?????????: 0) ????????? ????????? ????????? ?????? ????????????.',
            albert_hand_found:
                "?????? ?????? ?????? ??? ?????? ????????? ????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            albert_is_oid_value:
                "??????/?????? OID ????????? ????????? OID ?????? ????????? ????????? ????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            albert_boolean:
                "????????? ?????????: ????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>?????? ?????????: ?????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>???????????? ?????????: ???????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>??????????????? ?????????: ??????????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ?????????: ????????? ??????????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>???????????? ??????: ???????????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ??????: ????????? ????????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ??????: ????????? ????????? ???????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.<br/>????????? ??????: ????????? ????????? ????????? '???'?????? ????????????, ????????? '??????'?????? ???????????????.",
            albert_move_forward_for_secs: '????????? ??????(???)?????? ????????? ???????????????.',
            albert_move_backward_for_secs: '????????? ??????(???)?????? ?????? ???????????????.',
            albert_turn_for_secs: '????????? ??????(???)?????? ??????/????????? ???????????? ??????????????? ???????????????.',
            albert_change_both_wheels_by:
                '????????? ????????? ????????? ?????? ?????? ???(%)??? ????????? ?????? ?????? ????????????. ?????? ????????? ?????? ????????? ????????? ????????? ????????????, ?????? ????????? ?????? ???????????????.',
            albert_set_both_wheels_to:
                '????????? ????????? ????????? ????????? ????????? ???(-100 ~ 100%)?????? ?????? ???????????????. ?????? ?????? ???????????? ????????? ????????? ????????????, ?????? ?????? ???????????? ?????? ???????????????. ?????? 0??? ???????????? ???????????????.',
            albert_change_wheel_by:
                '??????/?????????/?????? ????????? ?????? ?????? ???(%)??? ????????? ?????? ????????????. ?????? ????????? ?????? ????????? ????????? ????????? ????????????, ?????? ????????? ?????? ???????????????.',
            albert_set_wheel_to:
                '??????/?????????/?????? ????????? ????????? ????????? ???(-100 ~ 100%)?????? ???????????????. ?????? ?????? ???????????? ????????? ????????? ????????????, ?????? ?????? ???????????? ?????? ???????????????. ?????? 0??? ???????????? ???????????????.',
            albert_stop: '?????? ????????? ???????????????.',
            albert_set_pad_size_to: '????????? ?????? ????????? ????????? ????????? ???????????????.',
            albert_move_to_x_y_on_board: '?????? ????????? ????????? x, y ????????? ???????????????.',
            albert_set_orientation_on_board: '?????? ????????? ????????? ?????? ???????????? ???????????????.',
            albert_set_eye_to: '??????/?????????/?????? ?????? ????????? ????????? ?????????.',
            albert_clear_eye: '??????/?????????/?????? ?????? ?????????.',
            albert_body_led: '?????? LED??? ????????? ?????????.',
            albert_front_led: '?????? LED??? ????????? ?????????.',
            albert_beep: '?????? ????????? ?????? ?????????.',
            albert_change_buzzer_by:
                '?????? ????????? ?????? ??? ??????(Hz)??? ????????? ?????? ????????????. ????????? ?????? ???????????? ????????? ??? ????????????.',
            albert_set_buzzer_to:
                '?????? ????????? ??? ????????? ????????? ???(Hz)?????? ???????????????. ????????? ?????? ???????????? ????????? ??? ????????????. ?????? 0??? ???????????? ?????? ????????? ?????????.',
            albert_clear_buzzer: '?????? ????????? ?????????.',
            albert_play_note: '????????? ???????????? ???????????? ?????? ?????? ?????? ?????????.',
            albert_play_note_for: '????????? ???????????? ???????????? ?????? ????????? ???????????? ?????? ?????????.',
            albert_rest_for: '????????? ???????????? ?????????.',
            albert_change_tempo_by:
                '??????????????? ?????? ????????? ?????? BPM(?????? ?????? ???)??? ????????? ?????? ????????????.',
            albert_set_tempo_to: '??????????????? ?????? ????????? ????????? BPM(?????? ?????? ???)?????? ???????????????.',
        },
        Blocks: {
            ROBOID_sensor_left_proximity: '?????? ?????? ??????',
            ROBOID_sensor_right_proximity: '????????? ?????? ??????',
            ROBOID_sensor_acceleration_x: 'x??? ?????????',
            ROBOID_sensor_acceleration_y: 'y??? ?????????',
            ROBOID_sensor_acceleration_z: 'z??? ?????????',
            ROBOID_sensor_front_oid: '?????? OID',
            ROBOID_sensor_rear_oid: '?????? OID',
            ROBOID_sensor_position_x: 'x ??????',
            ROBOID_sensor_position_y: 'y ??????',
            ROBOID_sensor_orientation: '??????',
            ROBOID_sensor_light: '??????',
            ROBOID_sensor_temperature: '??????',
            ROBOID_sensor_signal_strength: '?????? ??????',
            ROBOID_left: '??????',
            ROBOID_right: '?????????',
            ROBOID_both: '??????',
            ROBOID_front: '??????',
            ROBOID_rear: '??????',
            ROBOID_forward2: '?????????',
            ROBOID_backward2: '??????',
            ROBOID_tilt_forward: '????????? ?????????',
            ROBOID_tilt_backward: '?????? ?????????',
            ROBOID_tilt_left: '???????????? ?????????',
            ROBOID_tilt_right: '??????????????? ?????????',
            ROBOID_tilt_flip: '????????? ?????????',
            ROBOID_tilt_not: '???????????? ??????',
            ROBOID_battery_normal: '????????? ??????',
            ROBOID_battery_low: '????????? ??????',
            ROBOID_battery_empty: '????????? ??????',
            ROBOID_color_red: '?????????',
            ROBOID_color_yellow: '?????????',
            ROBOID_color_green: '?????????',
            ROBOID_color_sky_blue: '?????????',
            ROBOID_color_blue: '?????????',
            ROBOID_color_purple: '?????????',
            ROBOID_color_white: '?????????',
            ROBOID_turn_on: '??????',
            ROBOID_turn_off: '??????',
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
        Menus: {
            albert: '?????????',
        },
    },
    en: {
        template: {
            albert_value: '%1',
            albert_hand_found: 'hand found?',
            albert_is_oid_value: '%1 oid %2?',
            albert_boolean: '%1?',
            albert_move_forward_for_secs: 'move forward %1 secs %2',
            albert_move_backward_for_secs: 'move backward %1 secs %2',
            albert_turn_for_secs: 'turn %1 %2 secs %3',
            albert_change_both_wheels_by: 'change wheels by left: %1 right: %2 %3',
            albert_set_both_wheels_to: 'set wheels to left: %1 right: %2 %3',
            albert_change_wheel_by: 'change %1 wheel by %2 %3',
            albert_set_wheel_to: 'set %1 wheel to %2 %3',
            albert_stop: 'stop %1',
            albert_set_pad_size_to: 'set board size to width: %1 height: %2 %3',
            albert_move_to_x_y_on_board: 'move %1 to x: %2 y: %3 on board %4',
            albert_set_orientation_on_board: 'turn towards %1 degrees on board %2',
            albert_set_eye_to: 'set %1 eye to %2 %3',
            albert_clear_eye: 'clear %1 eye %2',
            albert_body_led: 'turn body led %1 %2',
            albert_front_led: 'turn front led %1 %2',
            albert_beep: 'beep %1',
            albert_change_buzzer_by: 'change buzzer by %1 %2',
            albert_set_buzzer_to: 'set buzzer to %1 %2',
            albert_clear_buzzer: 'clear buzzer %1',
            albert_play_note: 'play note %1 %2 %3',
            albert_play_note_for: 'play note %1 %2 for %3 beats %4',
            albert_rest_for: 'rest for %1 beats %2',
            albert_change_tempo_by: 'change tempo by %1 %2',
            albert_set_tempo_to: 'set tempo to %1 bpm %2',
            albert_move_forward: 'move forward %1',
            albert_move_backward: 'move backward %1',
            albert_turn_around: 'turn %1 %2',
            albert_set_led_to: 'set %1 led %2 %3',
            albert_clear_led: 'clear %1 led %2',
            albert_change_wheels_by: '%1 %2 %3',
            albert_set_wheels_to: '%1 %2 %3',
        },
        Helper: {
            albert_value:
                "left proximity: value of left proximity sensor (range: 0 to 255, initial value: 0)<br/>right proximity: value of right proximity sensor (range: 0 to 255, initial value: 0)<br/>x acceleration: x-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The direction in which the robot moves forward is the positive direction of the x axis.<br/>y acceleration: y-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The left direction of the robot is the positive direction of the y axis.<br/>z acceleration: z-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The upward direction of the robot is the positive direction of the z axis.<br/>front oid: value of front oid sensor (range: -1 ~ 65535, initial value: -1)<br/>rear oid: value of rear oid sensor (range: -1 ~ 65535, initial value: -1)<br/>x position: x-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>y position: y-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>orientation: orientation angle value (degree) of robot on the board (range: -179 ~ 180, initial value: -200)<br/>light: value of light sensor (range: 0 to 65535, initial value: 0) The brighter, the larger the value.<br/>temperature: temperature value inside the robot (range: -40 to 88 degrees Celsius, initial value: 0)<br/>signal strength: signal strength of Bluetooth communication (range: -128 to 0 dBm, initial value: 0) As the signal strength increases, the value increases.",
            albert_hand_found:
                'If there is a hand or object in front of the proximity sensor, true, otherwise false',
            albert_is_oid_value:
                'If the oid value detected by the oid sensor is equal to the entered number, true, otherwise false.',
            albert_boolean:
                'tilt forward: If tilted forward, true, otherwise false<br/>tilt backward: If tilted backward, true, otherwise false<br/>tilt left: If tilted to the left, true, otherwise false<br/>tilt right: If tilted to the right, true, otherwise false<br/>tilt flip: If upside-down, true, otherwise false<br/>not tilt: If not tilted, true, otherwise false<br/>battery normal: If the battery is enough, true, otherwise false<br/>battery low: If the battery is low, true, otherwise false<br/>battery empty: If the battery is empty, true, otherwise false',
            albert_move_forward_for_secs: 'Moves forward for the entered seconds.',
            albert_move_backward_for_secs: 'Moves backward for the entered seconds.',
            albert_turn_for_secs: 'Turns left/right in place for the entered seconds.',
            albert_change_both_wheels_by:
                'Adds the entered values to the current velocity values (%) of the left and right wheels respectively. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            albert_set_both_wheels_to:
                'Sets the velocity of the left and right wheels to the entered values (-100 to 100%), respectively. If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            albert_change_wheel_by:
                'Adds the entered value to the current velocity value (%) of the left/right/both wheels. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            albert_set_wheel_to:
                'Sets the velocity of the left/right/both wheels to the entered value (-100 to 100%). If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            albert_stop: 'Stops both wheels.',
            albert_set_pad_size_to: 'Sets the width and height of the board.',
            albert_move_to_x_y_on_board: 'Moves to the entered x, y position on the board.',
            albert_set_orientation_on_board:
                'Turns toward the entered angle (degrees) on the board.',
            albert_set_eye_to: 'Turns left/right/both eyes to the selected color.',
            albert_clear_eye: 'Turns off the left/right/both eyes.',
            albert_body_led: 'Turns on/off the body led.',
            albert_front_led: 'Turns on/off the front led.',
            albert_beep: 'Plays beep sound.',
            albert_change_buzzer_by:
                'Adds the entered value to the current pitch (Hz) of the buzzer sound. You can enter up to two decimal places.',
            albert_set_buzzer_to:
                'Sets the pitch of the buzzer sound to the entered value (Hz). You can enter up to two decimal places. Entering the number 0 turns off the buzzer sound.',
            albert_clear_buzzer: 'Turns off buzzer sound.',
            albert_play_note: 'It sounds the selected tone and octave.',
            albert_play_note_for:
                'It sounds the selected tone and octave as much as the beat you entered.',
            albert_rest_for: 'Rests as much as the beat you entered.',
            albert_change_tempo_by:
                'Adds the entered value to the current BPM (beats per minute) of the playing or resting speed.',
            albert_set_tempo_to:
                'Sets the playing or resting speed to the entered BPM (beats per minute).',
        },
        Blocks: {
            ROBOID_sensor_left_proximity: 'left proximity',
            ROBOID_sensor_right_proximity: 'right proximity',
            ROBOID_sensor_acceleration_x: 'x acceleration',
            ROBOID_sensor_acceleration_y: 'y acceleration',
            ROBOID_sensor_acceleration_z: 'z acceleration',
            ROBOID_sensor_front_oid: 'front oid',
            ROBOID_sensor_rear_oid: 'rear oid',
            ROBOID_sensor_position_x: 'x position',
            ROBOID_sensor_position_y: 'y position',
            ROBOID_sensor_orientation: 'orientation',
            ROBOID_sensor_light: 'light',
            ROBOID_sensor_temperature: 'temperature',
            ROBOID_sensor_signal_strength: 'signal strength',
            ROBOID_left: 'left',
            ROBOID_right: 'right',
            ROBOID_both: 'both',
            ROBOID_front: 'front',
            ROBOID_rear: 'rear',
            ROBOID_forward2: 'forward',
            ROBOID_backward2: 'backward',
            ROBOID_tilt_forward: 'tilt forward',
            ROBOID_tilt_backward: 'tilt backward',
            ROBOID_tilt_left: 'tilt left',
            ROBOID_tilt_right: 'tilt right',
            ROBOID_tilt_flip: 'tilt flip',
            ROBOID_tilt_not: 'not tilt',
            ROBOID_battery_normal: 'battery normal',
            ROBOID_battery_low: 'battery low',
            ROBOID_battery_empty: 'battery empty',
            ROBOID_color_red: 'red',
            ROBOID_color_yellow: 'yellow',
            ROBOID_color_green: 'green',
            ROBOID_color_sky_blue: 'sky blue',
            ROBOID_color_blue: 'blue',
            ROBOID_color_purple: 'purple',
            ROBOID_color_white: 'white',
            ROBOID_turn_on: 'on',
            ROBOID_turn_off: 'off',
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
        Menus: {
            albert: 'albert',
        },
    },
    jp: {
        template: {
            albert_value: '%1',
            albert_hand_found: '??????????????????????',
            albert_is_oid_value: '%1 OID??? %2??????????',
            albert_boolean: '%1?',
            albert_move_forward_for_secs: '??????%1??????????????? %2',
            albert_move_backward_for_secs: '?????????%1??????????????? %2',
            albert_turn_for_secs: '%1???%2????????? %3',
            albert_change_both_wheels_by: '????????????%1????????????%2??????????????? %3',
            albert_set_both_wheels_to: '????????????%1????????????%2????????? %3',
            albert_change_wheel_by: '%1?????????%2??????????????? %3',
            albert_set_wheel_to: '%1?????????%2????????? %3',
            albert_stop: '???????????? %1',
            albert_set_pad_size_to: '??????????????????%1?????????%2????????? %3',
            albert_move_to_x_y_on_board: '?????????????????? %1 x: %2 y: %3 ????????????????????? %4',
            albert_set_orientation_on_board: '?????????????????? %1 ??????????????? %2',
            albert_set_eye_to: '%1??????%2????????? %3',
            albert_clear_eye: '%1???????????? %2',
            albert_body_led: '??????LED??? %1 %2',
            albert_front_led: '??????LED??? %1 %2',
            albert_beep: '????????? %1',
            albert_change_buzzer_by: '???????????????%1??????????????? %2',
            albert_set_buzzer_to: '???????????????%1????????? %2',
            albert_clear_buzzer: '????????????????????? %1',
            albert_play_note: '%1%2??????????????? %3',
            albert_play_note_for: '%1%2??????%3???????????? %4',
            albert_rest_for: '%1????????? %2',
            albert_change_tempo_by: '????????????%1??????????????? %2',
            albert_set_tempo_to: '????????????%1BPM????????? %2',
        },
        Helper: {
            albert_value:
                "left proximity: value of left proximity sensor (range: 0 to 255, initial value: 0)<br/>right proximity: value of right proximity sensor (range: 0 to 255, initial value: 0)<br/>x acceleration: x-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The direction in which the robot moves forward is the positive direction of the x axis.<br/>y acceleration: y-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The left direction of the robot is the positive direction of the y axis.<br/>z acceleration: z-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The upward direction of the robot is the positive direction of the z axis.<br/>front oid: value of front oid sensor (range: -1 ~ 65535, initial value: -1)<br/>rear oid: value of rear oid sensor (range: -1 ~ 65535, initial value: -1)<br/>x position: x-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>y position: y-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>orientation: orientation angle value (degree) of robot on the board (range: -179 ~ 180, initial value: -200)<br/>light: value of light sensor (range: 0 to 65535, initial value: 0) The brighter, the larger the value.<br/>temperature: temperature value inside the robot (range: -40 to 88 degrees Celsius, initial value: 0)<br/>signal strength: signal strength of Bluetooth communication (range: -128 to 0 dBm, initial value: 0) As the signal strength increases, the value increases.",
            albert_hand_found:
                'If there is a hand or object in front of the proximity sensor, true, otherwise false',
            albert_is_oid_value:
                'If the oid value detected by the oid sensor is equal to the entered number, true, otherwise false.',
            albert_boolean:
                'tilt forward: If tilted forward, true, otherwise false<br/>tilt backward: If tilted backward, true, otherwise false<br/>tilt left: If tilted to the left, true, otherwise false<br/>tilt right: If tilted to the right, true, otherwise false<br/>tilt flip: If upside-down, true, otherwise false<br/>not tilt: If not tilted, true, otherwise false<br/>battery normal: If the battery is enough, true, otherwise false<br/>battery low: If the battery is low, true, otherwise false<br/>battery empty: If the battery is empty, true, otherwise false',
            albert_move_forward_for_secs: 'Moves forward for the entered seconds.',
            albert_move_backward_for_secs: 'Moves backward for the entered seconds.',
            albert_turn_for_secs: 'Turns left/right in place for the entered seconds.',
            albert_change_both_wheels_by:
                'Adds the entered values to the current velocity values (%) of the left and right wheels respectively. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            albert_set_both_wheels_to:
                'Sets the velocity of the left and right wheels to the entered values (-100 to 100%), respectively. If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            albert_change_wheel_by:
                'Adds the entered value to the current velocity value (%) of the left/right/both wheels. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            albert_set_wheel_to:
                'Sets the velocity of the left/right/both wheels to the entered value (-100 to 100%). If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            albert_stop: 'Stops both wheels.',
            albert_set_pad_size_to: 'Sets the width and height of the board.',
            albert_move_to_x_y_on_board: 'Moves to the entered x, y position on the board.',
            albert_set_orientation_on_board:
                'Turns toward the entered angle (degrees) on the board.',
            albert_set_eye_to: 'Turns left/right/both eyes to the selected color.',
            albert_clear_eye: 'Turns off the left/right/both eyes.',
            albert_body_led: 'Turns on/off the body led.',
            albert_front_led: 'Turns on/off the front led.',
            albert_beep: 'Plays beep sound.',
            albert_change_buzzer_by:
                'Adds the entered value to the current pitch (Hz) of the buzzer sound. You can enter up to two decimal places.',
            albert_set_buzzer_to:
                'Sets the pitch of the buzzer sound to the entered value (Hz). You can enter up to two decimal places. Entering the number 0 turns off the buzzer sound.',
            albert_clear_buzzer: 'Turns off buzzer sound.',
            albert_play_note: 'It sounds the selected tone and octave.',
            albert_play_note_for:
                'It sounds the selected tone and octave as much as the beat you entered.',
            albert_rest_for: 'Rests as much as the beat you entered.',
            albert_change_tempo_by:
                'Adds the entered value to the current BPM (beats per minute) of the playing or resting speed.',
            albert_set_tempo_to:
                'Sets the playing or resting speed to the entered BPM (beats per minute).',
        },
        Blocks: {
            ROBOID_sensor_left_proximity: '?????????????????????',
            ROBOID_sensor_right_proximity: '?????????????????????',
            ROBOID_sensor_acceleration_x: 'x????????????',
            ROBOID_sensor_acceleration_y: 'y????????????',
            ROBOID_sensor_acceleration_z: 'z????????????',
            ROBOID_sensor_front_oid: '???OID',
            ROBOID_sensor_rear_oid: '???OID',
            ROBOID_sensor_position_x: 'x??????',
            ROBOID_sensor_position_y: 'y??????',
            ROBOID_sensor_orientation: '??????',
            ROBOID_sensor_light: '??????',
            ROBOID_sensor_temperature: '??????',
            ROBOID_sensor_signal_strength: '????????????',
            ROBOID_left: '???',
            ROBOID_right: '???',
            ROBOID_both: '???',
            ROBOID_front: '???',
            ROBOID_rear: '???',
            ROBOID_forward2: '??????',
            ROBOID_backward2: '?????????',
            ROBOID_tilt_forward: '??????????????????',
            ROBOID_tilt_backward: '??????????????????',
            ROBOID_tilt_left: '??????????????????',
            ROBOID_tilt_right: '??????????????????',
            ROBOID_tilt_flip: '?????????????????????',
            ROBOID_tilt_not: '?????????????????????',
            ROBOID_battery_normal: '??????????????????',
            ROBOID_battery_low: '????????????????????????',
            ROBOID_battery_empty: '??????????????????',
            ROBOID_color_red: '??????',
            ROBOID_color_yellow: '??????',
            ROBOID_color_green: '??????',
            ROBOID_color_sky_blue: '??????',
            ROBOID_color_blue: '??????',
            ROBOID_color_purple: '??????',
            ROBOID_color_white: '??????',
            ROBOID_turn_on: '??????',
            ROBOID_turn_off: '??????',
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
            albert_value: '%1',
            albert_hand_found: 'hand found?',
            albert_is_oid_value: '%1 oid %2?',
            albert_boolean: '%1?',
            albert_move_forward_for_secs: 'move forward %1 secs %2',
            albert_move_backward_for_secs: 'move backward %1 secs %2',
            albert_turn_for_secs: 'turn %1 %2 secs %3',
            albert_change_both_wheels_by: 'change wheels by left: %1 right: %2 %3',
            albert_set_both_wheels_to: 'set wheels to left: %1 right: %2 %3',
            albert_change_wheel_by: 'change %1 wheel by %2 %3',
            albert_set_wheel_to: 'set %1 wheel to %2 %3',
            albert_stop: 'stop %1',
            albert_set_pad_size_to: 'set board size to width: %1 height: %2 %3',
            albert_move_to_x_y_on_board: 'move %1 to x: %2 y: %3 on board %4',
            albert_set_orientation_on_board: 'turn towards %1 degrees on board %2',
            albert_set_eye_to: 'set %1 eye to %2 %3',
            albert_clear_eye: 'clear %1 eye %2',
            albert_body_led: 'turn %1 body led %2',
            albert_front_led: 'turn %1 front led %2',
            albert_beep: 'beep %1',
            albert_change_buzzer_by: 'change buzzer by %1 %2',
            albert_set_buzzer_to: 'set buzzer to %1 %2',
            albert_clear_buzzer: 'clear buzzer %1',
            albert_play_note: 'play note %1 %2 %3',
            albert_play_note_for: 'play note %1 %2 for %3 beats %4',
            albert_rest_for: 'rest for %1 beats %2',
            albert_change_tempo_by: 'change tempo by %1 %2',
            albert_set_tempo_to: 'set tempo to %1 bpm %2',
        },
        Helper: {
            albert_value:
                "left proximity: value of left proximity sensor (range: 0 to 255, initial value: 0)<br/>right proximity: value of right proximity sensor (range: 0 to 255, initial value: 0)<br/>x acceleration: x-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The direction in which the robot moves forward is the positive direction of the x axis.<br/>y acceleration: y-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The left direction of the robot is the positive direction of the y axis.<br/>z acceleration: z-axis value of acceleration sensor (range: -8192 to 8191, initial value: 0) The upward direction of the robot is the positive direction of the z axis.<br/>front oid: value of front oid sensor (range: -1 ~ 65535, initial value: -1)<br/>rear oid: value of rear oid sensor (range: -1 ~ 65535, initial value: -1)<br/>x position: x-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>y position: y-coordinate value of robot's position on the board (range: -1 ~ 39999, initial value: -1)<br/>orientation: orientation angle value (degree) of robot on the board (range: -179 ~ 180, initial value: -200)<br/>light: value of light sensor (range: 0 to 65535, initial value: 0) The brighter, the larger the value.<br/>temperature: temperature value inside the robot (range: -40 to 88 degrees Celsius, initial value: 0)<br/>signal strength: signal strength of Bluetooth communication (range: -128 to 0 dBm, initial value: 0) As the signal strength increases, the value increases.",
            albert_hand_found:
                'If there is a hand or object in front of the proximity sensor, true, otherwise false',
            albert_is_oid_value:
                'If the oid value detected by the oid sensor is equal to the entered number, true, otherwise false.',
            albert_boolean:
                'tilt forward: If tilted forward, true, otherwise false<br/>tilt backward: If tilted backward, true, otherwise false<br/>tilt left: If tilted to the left, true, otherwise false<br/>tilt right: If tilted to the right, true, otherwise false<br/>tilt flip: If upside-down, true, otherwise false<br/>not tilt: If not tilted, true, otherwise false<br/>battery normal: If the battery is enough, true, otherwise false<br/>battery low: If the battery is low, true, otherwise false<br/>battery empty: If the battery is empty, true, otherwise false',
            albert_move_forward_for_secs: 'Moves forward for the entered seconds.',
            albert_move_backward_for_secs: 'Moves backward for the entered seconds.',
            albert_turn_for_secs: 'Turns left/right in place for the entered seconds.',
            albert_change_both_wheels_by:
                'Adds the entered values to the current velocity values (%) of the left and right wheels respectively. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            albert_set_both_wheels_to:
                'Sets the velocity of the left and right wheels to the entered values (-100 to 100%), respectively. If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            albert_change_wheel_by:
                'Adds the entered value to the current velocity value (%) of the left/right/both wheels. If the result is positive, the wheel rotates forward; if negative, the wheel rotates backward.',
            albert_set_wheel_to:
                'Sets the velocity of the left/right/both wheels to the entered value (-100 to 100%). If you enter a positive value, the wheel rotates forward. If you enter a negative value, the wheel rotates backward. Entering the number 0 stops it.',
            albert_stop: 'Stops both wheels.',
            albert_set_pad_size_to: 'Sets the width and height of the board.',
            albert_move_to_x_y_on_board: 'Moves to the entered x, y position on the board.',
            albert_set_orientation_on_board:
                'Turns toward the entered angle (degrees) on the board.',
            albert_set_eye_to: 'Turns left/right/both eyes to the selected color.',
            albert_clear_eye: 'Turns off the left/right/both eyes.',
            albert_body_led: 'Turns on/off the body led.',
            albert_front_led: 'Turns on/off the front led.',
            albert_beep: 'Plays beep sound.',
            albert_change_buzzer_by:
                'Adds the entered value to the current pitch (Hz) of the buzzer sound. You can enter up to two decimal places.',
            albert_set_buzzer_to:
                'Sets the pitch of the buzzer sound to the entered value (Hz). You can enter up to two decimal places. Entering the number 0 turns off the buzzer sound.',
            albert_clear_buzzer: 'Turns off buzzer sound.',
            albert_play_note: 'It sounds the selected tone and octave.',
            albert_play_note_for:
                'It sounds the selected tone and octave as much as the beat you entered.',
            albert_rest_for: 'Rests as much as the beat you entered.',
            albert_change_tempo_by:
                'Adds the entered value to the current BPM (beats per minute) of the playing or resting speed.',
            albert_set_tempo_to:
                'Sets the playing or resting speed to the entered BPM (beats per minute).',
        },
        Blocks: {
            ROBOID_sensor_left_proximity: 'left proximity',
            ROBOID_sensor_right_proximity: 'right proximity',
            ROBOID_sensor_acceleration_x: 'x acceleration',
            ROBOID_sensor_acceleration_y: 'y acceleration',
            ROBOID_sensor_acceleration_z: 'z acceleration',
            ROBOID_sensor_front_oid: 'front oid',
            ROBOID_sensor_rear_oid: 'rear oid',
            ROBOID_sensor_position_x: 'x position',
            ROBOID_sensor_position_y: 'y position',
            ROBOID_sensor_orientation: 'orientation',
            ROBOID_sensor_light: 'light',
            ROBOID_sensor_temperature: 'temperature',
            ROBOID_sensor_signal_strength: 'signal strength',
            ROBOID_left: 'left',
            ROBOID_right: 'right',
            ROBOID_both: 'both',
            ROBOID_front: 'front',
            ROBOID_rear: 'rear',
            ROBOID_forward2: 'forward',
            ROBOID_backward2: 'backward',
            ROBOID_tilt_forward: 'tilt forward',
            ROBOID_tilt_backward: 'tilt backward',
            ROBOID_tilt_left: 'tilt left',
            ROBOID_tilt_right: 'tilt right',
            ROBOID_tilt_flip: 'tilt flip',
            ROBOID_tilt_not: 'not tilt',
            ROBOID_battery_normal: 'battery normal',
            ROBOID_battery_low: 'battery low',
            ROBOID_battery_empty: 'battery empty',
            ROBOID_color_red: 'red',
            ROBOID_color_yellow: 'yellow',
            ROBOID_color_green: 'green',
            ROBOID_color_sky_blue: 'sky blue',
            ROBOID_color_blue: 'blue',
            ROBOID_color_purple: 'purple',
            ROBOID_color_white: 'white',
            ROBOID_turn_on: 'on',
            ROBOID_turn_off: 'off',
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

RoCode.Albert.blockMenuBlocks = [
    'albert_value',
    'albert_hand_found',
    'albert_is_oid_value',
    'albert_boolean',
    'albert_move_forward_for_secs',
    'albert_move_backward_for_secs',
    'albert_turn_for_secs',
    'albert_change_both_wheels_by',
    'albert_set_both_wheels_to',
    'albert_change_wheel_by',
    'albert_set_wheel_to',
    'albert_stop',
    'albert_set_pad_size_to',
    'albert_move_to_x_y_on_board',
    'albert_set_orientation_on_board',
    'albert_set_eye_to',
    'albert_clear_eye',
    'albert_body_led',
    'albert_front_led',
    'albert_beep',
    'albert_change_buzzer_by',
    'albert_set_buzzer_to',
    'albert_clear_buzzer',
    'albert_play_note',
    'albert_play_note_for',
    'albert_rest_for',
    'albert_change_tempo_by',
    'albert_set_tempo_to',
];

RoCode.Albert.getBlocks = function() {
    return {
        albert_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_sensor_left_proximity, 'leftProximity'],
                        [Lang.Blocks.ROBOID_sensor_right_proximity, 'rightProximity'],
                        [Lang.Blocks.ROBOID_sensor_acceleration_x, 'accelerationX'],
                        [Lang.Blocks.ROBOID_sensor_acceleration_y, 'accelerationY'],
                        [Lang.Blocks.ROBOID_sensor_acceleration_z, 'accelerationZ'],
                        [Lang.Blocks.ROBOID_sensor_front_oid, 'frontOid'],
                        [Lang.Blocks.ROBOID_sensor_rear_oid, 'backOid'],
                        [Lang.Blocks.ROBOID_sensor_position_x, 'positionX'],
                        [Lang.Blocks.ROBOID_sensor_position_y, 'positionY'],
                        [Lang.Blocks.ROBOID_sensor_orientation, 'orientation'],
                        [Lang.Blocks.ROBOID_sensor_light, 'light'],
                        [Lang.Blocks.ROBOID_sensor_temperature, 'temperature'],
                        [Lang.Blocks.ROBOID_sensor_signal_strength, 'signalStrength'],
                    ],
                    value: 'leftProximity',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'albert_value',
            },
            paramsKeyMap: {
                DEVICE: 0,
            },
            class: 'albert_sensor',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                if (robot) return robot.getValue(script);
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.sensor_value(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_sensor_left_proximity, 'leftProximity'],
                                    [Lang.Blocks.ROBOID_sensor_right_proximity, 'rightProximity'],
                                    [Lang.Blocks.ROBOID_sensor_acceleration_x, 'accelerationX'],
                                    [Lang.Blocks.ROBOID_sensor_acceleration_y, 'accelerationY'],
                                    [Lang.Blocks.ROBOID_sensor_acceleration_z, 'accelerationZ'],
                                    [Lang.Blocks.ROBOID_sensor_front_oid, 'frontOid'],
                                    [Lang.Blocks.ROBOID_sensor_rear_oid, 'backOid'],
                                    [Lang.Blocks.ROBOID_sensor_position_x, 'positionX'],
                                    [Lang.Blocks.ROBOID_sensor_position_y, 'positionY'],
                                    [Lang.Blocks.ROBOID_sensor_orientation, 'orientation'],
                                    [Lang.Blocks.ROBOID_sensor_light, 'light'],
                                    [Lang.Blocks.ROBOID_sensor_temperature, 'temperature'],
                                    [Lang.Blocks.ROBOID_sensor_signal_strength, 'signalStrength'],
                                ],
                                value: 'leftProximity',
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
        albert_hand_found: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [],
            events: {},
            def: {
                params: [],
                type: 'albert_hand_found',
            },
            class: 'albert_sensor',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.checkHandFound(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.hand_found()',
                        blockType: 'param',
                    },
                ],
            },
        },
        albert_is_oid_value: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_front, 'FRONT'],
                        [Lang.Blocks.ROBOID_rear, 'BACK'],
                    ],
                    value: 'FRONT',
                    fontSize: 11,
                    bgColor: RoCodeStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: RoCodeStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'number',
                        params: ['0'],
                    },
                ],
                type: 'albert_is_oid_value',
            },
            paramsKeyMap: {
                OID: 0,
                VALUE: 1,
            },
            class: 'albert_sensor',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.checkOid(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.is_oid(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_front, 'FRONT'],
                                    [Lang.Blocks.ROBOID_rear, 'BACK'],
                                ],
                                value: 'FRONT',
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
                        blockType: 'param',
                    },
                ],
            },
        },
        albert_boolean: {
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
                type: 'albert_boolean',
            },
            paramsKeyMap: {
                DEVICE: 0,
            },
            class: 'albert_sensor',
            isNotFor: ['albert'],
            func(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.checkBoolean(script) : false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.boolean_value(%1)',
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
        albert_move_forward_for_secs: {
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
                        params: ['1'],
                    },
                    null,
                ],
                type: 'albert_move_forward_for_secs',
            },
            paramsKeyMap: {
                SECS: 0,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.moveForwardSecs(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.move_forward(%1)',
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
        albert_move_backward_for_secs: {
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
                        params: ['1'],
                    },
                    null,
                ],
                type: 'albert_move_backward_for_secs',
            },
            paramsKeyMap: {
                SECS: 0,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.moveBackwardSecs(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.move_backward(%1)',
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
        albert_turn_for_secs: {
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
                type: 'albert_turn_for_secs',
                id: 'como',
            },
            paramsKeyMap: {
                DIRECTION: 0,
                SECS: 1,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.turnSecs(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.turn(%1, %2)',
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
                        ],
                    },
                ],
            },
        },
        albert_change_both_wheels_by: {
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
                type: 'albert_change_both_wheels_by',
            },
            paramsKeyMap: {
                LEFT: 0,
                RIGHT: 1,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.changeWheels(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.add_wheels(%1, %2)',
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
        albert_set_both_wheels_to: {
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
                        params: ['30'],
                    },
                    {
                        type: 'text',
                        params: ['30'],
                    },
                    null,
                ],
                type: 'albert_set_both_wheels_to',
            },
            paramsKeyMap: {
                LEFT: 0,
                RIGHT: 1,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setWheels(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_wheels(%1, %2)',
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
        albert_change_wheel_by: {
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
                type: 'albert_change_wheel_by',
            },
            paramsKeyMap: {
                WHEEL: 0,
                VELOCITY: 1,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.changeWheel(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.add_wheel(%1, %2)',
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
        albert_set_wheel_to: {
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
                        params: ['30'],
                    },
                    null,
                ],
                type: 'albert_set_wheel_to',
            },
            paramsKeyMap: {
                WHEEL: 0,
                VELOCITY: 1,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setWheel(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_wheel(%1, %2)',
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
        albert_stop: {
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
                type: 'albert_stop',
                id: '4adb',
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.stop(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.stop()',
                    },
                ],
            },
        },
        albert_set_pad_size_to: {
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
                type: 'albert_set_pad_size_to',
                id: '5mhg',
            },
            paramsKeyMap: {
                WIDTH: 0,
                HEIGHT: 1,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setBoardSize(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_board_size(%1, %2)',
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
        albert_move_to_x_y_on_board: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_forward2, 'FORWARD'],
                        [Lang.Blocks.ROBOID_backward2, 'BACKWARD'],
                    ],
                    value: 'FORWARD',
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
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    null,
                ],
                type: 'albert_move_to_x_y_on_board',
            },
            paramsKeyMap: {
                TOWARD: 0,
                X: 1,
                Y: 2,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.moveToOnBoard(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.move_to(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_forward2, 'FORWARD'],
                                    [Lang.Blocks.ROBOID_backward2, 'BACKWARD'],
                                ],
                                value: 'FORWARD',
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
                        ],
                    },
                ],
            },
        },
        albert_set_orientation_on_board: {
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
                        type: 'number',
                        params: ['0'],
                    },
                    null,
                ],
                type: 'albert_set_orientation_on_board',
            },
            paramsKeyMap: {
                DEGREE: 0,
            },
            class: 'albert_wheel',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setOrientationToOnBoard(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_orientation(%1)',
                        blockType: 'param',
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
        albert_set_eye_to: {
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
                        [Lang.Blocks.ROBOID_color_red, '4'],
                        [Lang.Blocks.ROBOID_color_yellow, '6'],
                        [Lang.Blocks.ROBOID_color_green, '2'],
                        [Lang.Blocks.ROBOID_color_sky_blue, '3'],
                        [Lang.Blocks.ROBOID_color_blue, '1'],
                        [Lang.Blocks.ROBOID_color_purple, '5'],
                        [Lang.Blocks.ROBOID_color_white, '7'],
                    ],
                    value: '4',
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
                type: 'albert_set_eye_to',
            },
            paramsKeyMap: {
                EYE: 0,
                COLOR: 1,
            },
            class: 'albert_led',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setEye(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_eye(%1, %2)',
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
                                    [Lang.Blocks.ROBOID_color_red, '4'],
                                    [Lang.Blocks.ROBOID_color_yellow, '6'],
                                    [Lang.Blocks.ROBOID_color_green, '2'],
                                    [Lang.Blocks.ROBOID_color_sky_blue, '3'],
                                    [Lang.Blocks.ROBOID_color_blue, '1'],
                                    [Lang.Blocks.ROBOID_color_purple, '5'],
                                    [Lang.Blocks.ROBOID_color_white, '7'],
                                ],
                                value: '4',
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
        albert_clear_eye: {
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
                type: 'albert_clear_eye',
            },
            paramsKeyMap: {
                EYE: 0,
            },
            class: 'albert_led',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.clearEye(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.clear_eye(%1)',
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
        albert_body_led: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_turn_on, 'ON'],
                        [Lang.Blocks.ROBOID_turn_off, 'OFF'],
                    ],
                    value: 'ON',
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
                type: 'albert_body_led',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'albert_led',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.turnBodyLed(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.body_led(%1)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_turn_on, 'ON'],
                                    [Lang.Blocks.ROBOID_turn_off, 'OFF'],
                                ],
                                value: 'ON',
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
        albert_front_led: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_turn_on, 'ON'],
                        [Lang.Blocks.ROBOID_turn_off, 'OFF'],
                    ],
                    value: 'ON',
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
                type: 'albert_front_led',
            },
            paramsKeyMap: {
                VALUE: 0,
            },
            class: 'albert_led',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.turnFrontLed(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.front_led(%1)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_turn_on, 'ON'],
                                    [Lang.Blocks.ROBOID_turn_off, 'OFF'],
                                ],
                                value: 'ON',
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
        albert_beep: {
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
                type: 'albert_beep',
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.beep(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.beep()',
                    },
                ],
            },
        },
        albert_change_buzzer_by: {
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
                type: 'albert_change_buzzer_by',
            },
            paramsKeyMap: {
                HZ: 0,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.changeBuzzer(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.add_buzzer(%1)',
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
        albert_set_buzzer_to: {
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
                type: 'albert_set_buzzer_to',
            },
            paramsKeyMap: {
                HZ: 0,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setBuzzer(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_buzzer(%1)',
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
        albert_clear_buzzer: {
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
                type: 'albert_clear_buzzer',
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.clearBuzzer(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.clear_buzzer()',
                        params: [null],
                    },
                ],
            },
        },
        albert_play_note: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_note_c, '4'],
                        [Lang.Blocks.ROBOID_note_c_sharp, '5'],
                        [Lang.Blocks.ROBOID_note_d, '6'],
                        [Lang.Blocks.ROBOID_note_d_sharp, '7'],
                        [Lang.Blocks.ROBOID_note_e, '8'],
                        [Lang.Blocks.ROBOID_note_f, '9'],
                        [Lang.Blocks.ROBOID_note_f_sharp, '10'],
                        [Lang.Blocks.ROBOID_note_g, '11'],
                        [Lang.Blocks.ROBOID_note_g_sharp, '12'],
                        [Lang.Blocks.ROBOID_note_a, '13'],
                        [Lang.Blocks.ROBOID_note_a_sharp, '14'],
                        [Lang.Blocks.ROBOID_note_b, '15'],
                    ],
                    value: '4',
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
                type: 'albert_play_note',
            },
            paramsKeyMap: {
                NOTE: 0,
                OCTAVE: 1,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.playNote(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.play_note(%1, %2)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_note_c, '4'],
                                    [Lang.Blocks.ROBOID_note_c_sharp, '5'],
                                    [Lang.Blocks.ROBOID_note_d, '6'],
                                    [Lang.Blocks.ROBOID_note_d_sharp, '7'],
                                    [Lang.Blocks.ROBOID_note_e, '8'],
                                    [Lang.Blocks.ROBOID_note_f, '9'],
                                    [Lang.Blocks.ROBOID_note_f_sharp, '10'],
                                    [Lang.Blocks.ROBOID_note_g, '11'],
                                    [Lang.Blocks.ROBOID_note_g_sharp, '12'],
                                    [Lang.Blocks.ROBOID_note_a, '13'],
                                    [Lang.Blocks.ROBOID_note_a_sharp, '14'],
                                    [Lang.Blocks.ROBOID_note_b, '15'],
                                ],
                                value: '4',
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
        albert_play_note_for: {
            color: RoCodeStatic.colorSet.block.default.HARDWARE,
            outerLine: RoCodeStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ROBOID_note_c, '4'],
                        [Lang.Blocks.ROBOID_note_c_sharp, '5'],
                        [Lang.Blocks.ROBOID_note_d, '6'],
                        [Lang.Blocks.ROBOID_note_d_sharp, '7'],
                        [Lang.Blocks.ROBOID_note_e, '8'],
                        [Lang.Blocks.ROBOID_note_f, '9'],
                        [Lang.Blocks.ROBOID_note_f_sharp, '10'],
                        [Lang.Blocks.ROBOID_note_g, '11'],
                        [Lang.Blocks.ROBOID_note_g_sharp, '12'],
                        [Lang.Blocks.ROBOID_note_a, '13'],
                        [Lang.Blocks.ROBOID_note_a_sharp, '14'],
                        [Lang.Blocks.ROBOID_note_b, '15'],
                    ],
                    value: '4',
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
                type: 'albert_play_note_for',
            },
            paramsKeyMap: {
                NOTE: 0,
                OCTAVE: 1,
                BEAT: 2,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.playNoteBeat(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.play_note_beat(%1, %2, %3)',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ROBOID_note_c, '4'],
                                    [Lang.Blocks.ROBOID_note_c_sharp, '5'],
                                    [Lang.Blocks.ROBOID_note_d, '6'],
                                    [Lang.Blocks.ROBOID_note_d_sharp, '7'],
                                    [Lang.Blocks.ROBOID_note_e, '8'],
                                    [Lang.Blocks.ROBOID_note_f, '9'],
                                    [Lang.Blocks.ROBOID_note_f_sharp, '10'],
                                    [Lang.Blocks.ROBOID_note_g, '11'],
                                    [Lang.Blocks.ROBOID_note_g_sharp, '12'],
                                    [Lang.Blocks.ROBOID_note_a, '13'],
                                    [Lang.Blocks.ROBOID_note_a_sharp, '14'],
                                    [Lang.Blocks.ROBOID_note_b, '15'],
                                ],
                                value: '4',
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
        albert_rest_for: {
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
                type: 'albert_rest_for',
            },
            paramsKeyMap: {
                BEAT: 0,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.restBeat(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.rest_beat(%1)',
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
        albert_change_tempo_by: {
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
                type: 'albert_change_tempo_by',
            },
            paramsKeyMap: {
                BPM: 0,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.changeTempo(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.add_tempo(%1)',
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
        albert_set_tempo_to: {
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
                type: 'albert_set_tempo_to',
            },
            paramsKeyMap: {
                BPM: 0,
            },
            class: 'albert_buzzer',
            isNotFor: ['albert'],
            func: function(sprite, script) {
                var robot = RoCode.Albert.getRobot();
                return robot ? robot.setTempo(script) : script;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Albert.set_tempo(%1)',
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

module.exports = RoCode.Albert;
