/*
 *
 */
"use strict";

RoCode.JsToBlockParser = function(syntax, parentParser) {
    this._type ="JsToBlockParser";
    this.syntax = syntax;

    this.scopeChain = [];
    this.scope = null;

    this._blockCount = 0;
    this._blockInfo = {};
    this._parentParser = parentParser;
};

(function(p){
    p.Program = function(astArr) {
        var code = [];
        var thread = [];

        thread.push({
            type: this.syntax.Program
        });

        for(var index in astArr) {
            var node = astArr[index];
            if(node.type != 'Program') return;

            //block statement
            var separatedBlocks = this.initScope(node);
            var blocks = this.BlockStatement(node);

            for(var i in blocks) {
                var block = blocks[i];

                thread.push(block);
            }

            this.unloadScope();
            if(thread.length != 0)
                code.push(thread);
        }
        return code;
    };

    p.Identifier = function(node) {
        return node.name;
    };

    p.Literal = function(node, type) {
        if(node.value === true)
            return {type:'True'};
        else if(node.value === false)
            return {type:'False'};

        if(type == "ai_distance_value")
            return node.value;
        else if(type == "ai_boolean_object")
            return node.value;
        else
            return {type: 'text', params: [node.value] };
    };

    // Statement
    p.ExpressionStatement = function(node) {
        var expression = node.expression;
        return this[expression.type](expression);
    };

    p.ForStatement = function(node) {
        var init = node.init,
            test = node.test,
            update = node.update,
            body = node.body;

        var contents = "";

        var blockType = this.syntax.ForStatement;

        if (!blockType) {
            body = this[body.type](body);

            var startVal = init.declarations[0].init.value;
            var test = test;
            var op = test.operator;
            var endVal = test.right.value;
            var updateOp = update.operator;

            var res = 0;
            if(!(updateOp == '++')){
                var temp = startVal;
                var startVal = endVal;
                var endVal = temp;
            }

            switch (op) {
                case '<':
                    res = endVal - startVal;
                break;

                case '<=':
                    res = ((endVal+1) - startVal);
                break;

                case '>':
                    res =  startVal - endVal;
                break;

                case '>=':
                    res = ((startVal+ 1) - endVal);
                break;
            }

            return this.BasicIteration(node, res, body);
        } else {
            throw {
                message : '???????????? ?????? ????????? ?????????.',
                node : node
            };
        }
    };

    p.BlockStatement = function(node) {
        var blocks = [];
        var body = node.body;

        for (var i = 0; i < body.length; i++) {
            var bodyData = body[i];
            var block = this[bodyData.type](bodyData);

            if(!RoCode.TextCodingUtil.hasBlockInfo(bodyData, this._blockInfo))
                this._blockCount++;

            RoCode.TextCodingUtil.updateBlockInfo(bodyData, this._blockInfo);

            if(!block) continue;
            else if (block.type === undefined) {
                throw {
                    title : '???????????? ??????',
                    message : '???????????? ?????? ???????????????.',
                    node : bodyData,
                    blockCount : this._blockCount
                };
            } else if (RoCode.TextCodingUtil.isParamBlock(block)) {
            } else if (block) {
                blocks.push(block);
            }
        }

        return blocks;
    };

    p.EmptyStatement = function(node) {
        throw {
            message : 'empty??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.DebuggerStatement = function(node) {
        throw {
            message : 'debugger??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.WithStatement = function(node) {
        var object = node.object,
            body = node.body;

        throw {
            message : 'with??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    //control flow
    p.ReturnStaement = function(node) {
        var args = node.arguments;

        throw {
            message : 'return??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.LabeledStatement = function(node) {
        var label = node.label,
            body = node.body;

        throw {
            message : 'label??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.BreakStatement = function(node) {
        var label = node.label;

        throw {
            message : 'break??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.ContinueStatement = function(node) {
        var label = node.label;

        throw {
            message : 'continue??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.IfStatement = function(node) {
        var test = node.test,
            consequent = node.consequent,
            alternate  = node.alternate;

        var blockType = this.syntax.BasicIf;
        if (blockType) {
            return this.BasicIf(node);
        } else {
            throw {
                message : 'if??? ???????????? ?????? ????????? ?????????.',
                node : node
            };
        }

    };

    p.SwitchStatement = function(node) {
        var discriminant = node.discriminant,
            cases = node.cases;

        throw {
            message : 'switch??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.SwitchCase = function(node) {
        var test = node.test,
            consequent = node.consequent;

        throw {
            message : 'switch ~ case??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    //throwstatement

    p.ThrowStatement = function(node) {
        var args = node.arguments;

        throw {
            message : 'throw??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.TryStatement = function(node) {
        var block = node.block,
            handler = node.handler,
            finalizer = node.finalizer;

        throw {
            message : 'try??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.CatchClause = function(node) {
        var param = node.param,
            body = node.body;

        throw {
            message : 'catch??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.WhileStatement = function(node) {
        var test = node.test,
            body = node.body;
        var blockType = this.syntax.WhileStatement;
        body = this[body.type](body);

        if (!blockType) {
            return this.BasicWhile(node, body);
        } else {

            throw {
                message : 'while??? ???????????? ?????? ????????? ?????????.',
                node : node
            };
        }
    };

    p.DoWhileStatement = function(node) {
        var body = node.body,
            test = node.test;

        throw {
            message : 'do ~ while??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };


    p.ForInStatement = function(node) {
        var left = node.left,
            right = node.right,
            body = node.body;

        throw {
            message : 'for ~ in??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    //Declaration

    p.FunctionDeclaration = function(node) {
        var id = node.id;

        var blockType = this.syntax.FunctionDeclaration;

        if (!blockType) {
            return null;
        } else {
            throw {
                message : 'function??? ???????????? ?????? ????????? ?????????.',
                node : node
            };
        }
    };

    p.VariableDeclaration = function(node) {
        var declaration = node.declarations,
            kind = node.kind;

        throw {
            message : 'var??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    // Expression
    p.ThisExpression = function(node) {
        return this.scope.this;
    };

    p.ArrayExpression = function(node) {
        var elements = node.elements;

        throw {
            message : 'array??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.ObjectExpression = function(node) {
        var property = node.property;

        throw {
            message : 'object??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.Property = function(node) {
        var key = node.key,
            value = node.value,
            kind = node.kind;

        throw {
            message : 'init, get, set??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.FunctionExpression = function(node) {
        throw {
            message : 'function??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };
    // unary expression

    p.UnaryExpression = function(node) {
        var operator = node.operator,
            prefix = node.prefix,
            args  = node.argument;

        throw {
            message : operator + '???(???) ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.UnaryOperator = function(){
        return  ["-" , "+" , "!" , "~" , "typeof" , "void" , "delete"];
    };

    p.updateOperator = function() {
        return ["++" , "--"];
    };

    //Binary expression
    p.BinaryOperator = function() {
        return [
            "==" , "!=" , "===" , "!==",
            "<" , "<=" , ">" , ">=",
            "<<" , ">>" , ">>>",
            "+" , "-" , "*" , "/" , "%",
            "," , "^" , "&" , "in",
            "instanceof"
        ];
    };

    p.AssignmentExpression = function(node) {
        var operator = node.operator,
            left = node.left,
            right = node.right;

        throw {
            message : operator + '???(???) ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.AssignmentOperator = function() {
        return [
            "=" , "+=" , "-=" , "*=" , "/=" , "%=",
            "<<=" , ">>=" , ">>>=",
            ",=" , "^=" , "&="
        ];
    };

    p.BinaryExpression = function(node) {
        var result = {};
        var structure = {};
        var operator = String(node.operator);
        var nodeLeftName = node.left.name;

        switch(operator){
            case "==":
                if(nodeLeftName == "object_up" || nodeLeftName == "object_right" || nodeLeftName == "object_down")
                    var type = "ai_boolean_object";
                else if(nodeLeftName == "radar_up" || nodeLeftName == "radar_right" || nodeLeftName == "radar_down")
                    var type = "ai_boolean_distance";
                else
                    var type = null;
                break;
            case "<":
                var type = "ai_boolean_distance";
                break;
            case "<=":
                var type = "ai_boolean_distance";
                break;
            case ">":
                var type = "ai_boolean_distance";
                break;
            case ">=":
                var type = "ai_boolean_distance";
                break;

            default:
                operator = operator;
        }

        if(type) {
            var params = [];
            var left = node.left;

            if(left.type == "Literal" || left.type == "Identifier") {
                var args = [];
                args.push(left);
                var paramsMeta = RoCode.block[type].params;

                for(var p in paramsMeta) {
                    var paramType = paramsMeta[p].type;
                    if(paramType == "Indicator") {
                        var pendingArg = {raw: null, type: "Literal", value: null};
                        if(p < args.length)
                            args.splice(p, 0, pendingArg);
                    }
                    else if(paramType == "Text") {
                        var pendingArg = {raw: "", type: "Literal", value: ""};
                        if(p < args.length)
                            args.splice(p, 0, pendingArg);
                    }
                }

                for(var i in args) {
                    var argument = args[i];

                    var param = this[argument.type](argument);
                    param = RoCode.TextCodingUtil.radarVariableConvertor(param);

                    if(param && param != null)
                        params.push(param);
                }
            } else {
                param = this[left.type](left);
                param = RoCode.TextCodingUtil.radarVariableConvertor(param);
                if(param)
                    params.push(param);
            }

            operator = String(node.operator);
            if(operator) {
                operator = RoCode.TextCodingUtil.jTobBinaryOperatorConvertor(operator);
                param = operator;
                if(param)
                    params.push(param);

                structure.operator = operator;
            }

            var right = node.right;

            if(right.type == "Literal" || right.type == "Identifier") {
                var args = [];
                args.push(right);
                var paramsMeta = RoCode.block[type].params;

                for(var p in paramsMeta) {
                    var paramType = paramsMeta[p].type;
                    if(paramType == "Indicator") {
                        var pendingArg = {raw: null, type: "Literal", value: null};
                        if(p < args.length)
                            args.splice(p, 0, pendingArg);
                    }
                    else if(paramType == "Text") {
                        var pendingArg = {raw: "", type: "Literal", value: ""};
                        if(p < args.length)
                            args.splice(p, 0, pendingArg);
                    }
                }

                for(var i in args) {
                    var argument = args[i];
                    var param = this[argument.type](argument);

                    if(typeof param == "string") {
                        var nameTokens = param.split("_");

                        if(nameTokens[0] == 'radar') {
                            var result = {};
                            result.type = "ai_distance_value";
                            result.params = [];
                            result.params.push(nameTokens[1].toUpperCase());
                            param = result;
                        }
                    }

                    if(param && param != null) {
                        if(type == "ai_boolean_object") {
                            param = param.params[0];
                            params.splice(1, 1);
                        }

                        param = RoCode.TextCodingUtil.tTobDropdownValueConvertor(param);
                        params.push(param);

                        if(params[2] && params[2].type != "text" && params[2].type != "ai_distance_value") {
                           throw {
                                message : '???????????? ?????? ????????? ?????????.',
                                node : node.test
                            };
                        }
                    }
                }
            } else {
                param = this[right.type](right);
                if(type == "ai_boolean_object") {
                    param = param.params[0];
                    params.splice(1, 1);
                }

                if(param)
                    params.push(param);
            }

            structure.type = type;
            structure.params = params;
        } else {
            throw {
                message : '???????????? ?????? ????????? ?????????.',
                node : node.test
            };
        }

        result = structure;

        return result;
    };

    p.LogicalExpression = function(node) {
        var result;
        var structure = {};

        var operator = String(node.operator);

        switch(operator){
            case '&&':
                var type = "ai_boolean_and";
                break;
            default:
                var type = "ai_boolean_and";
                break;
        }

        var params = [];
        var left = node.left;

        if(left.type == "Literal" || left.type == "Identifier") {
            var args = [];
            args.push(left);
            var paramsMeta = RoCode.block[type].params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if(paramType == "Indicator") {
                    var pendingArg = {raw: null, type: "Literal", value: null};
                    if(p < args.length)
                        args.splice(p, 0, pendingArg);
                }
                else if(paramType == "Text") {
                    var pendingArg = {raw: "", type: "Literal", value: ""};
                    if(p < args.length)
                        args.splice(p, 0, pendingArg);
                }
            }

            for(var i in args) {
                var argument = args[i];
                var param = this[argument.type](argument);
                if(param && param != null)
                    params.push(param);
            }
        } else {
            param = this[left.type](left);
            if(param)
                params.push(param);
        }

        operator = String(node.operator);
        if(operator) {
            operator = RoCode.TextCodingUtil.logicalExpressionConvert(operator);
            param = operator;
            params.push(param);
        }

        var right = node.right;

        if(right.type == "Literal" || right.type == "Identifier") {
            var args = [];
            args.push(right);
            var paramsMeta = RoCode.block[type].params;
            //var paramsDefMeta = RoCode.block[type].def.params;

            for(var p in paramsMeta) {
                var paramType = paramsMeta[p].type;
                if(paramType == "Indicator") {
                    var pendingArg = {raw: null, type: "Literal", value: null};
                    if(p < args.length)
                        args.splice(p, 0, pendingArg);
                }
                else if(paramType == "Text") {
                    var pendingArg = {raw: "", type: "Literal", value: ""};
                    if(p < args.length)
                        args.splice(p, 0, pendingArg);
                }
            }

            for(var i in args) {
                var argument = args[i];
                var param = this[argument.type](argument);

                if(param && param != null)
                    params.push(param);
            }

            if(params[0].type != "True" &&
                params[0].type != "ai_boolean_distance" &&
                params[0].type != "ai_boolean_object" &&
                params[0].type != "ai_boolean_and" &&
                params[0].type != "ai_distance_value")
            {
                throw {
                    message : '???????????? ?????? ????????? ?????????.',
                    node : node
                }
            }

            if(params[2].type != "True" &&
                params[2].type != "ai_boolean_distance" &&
                params[2].type != "ai_boolean_object" &&
                params[2].type != "ai_boolean_and" &&
                params[2].type != "ai_distance_value")
            {
                throw {
                    message : '???????????? ?????? ????????? ?????????.',
                    node : node
                }
            }
        } else {
            param = this[right.type](right);
            if(param)
                params.push(param);
        }

        structure.type = type;
        structure.params = params;

        result = structure;
        return result;
    };

    p.LogicalOperator = function() {
        return ["||" , "&&"];
    };

    p.MemberExpression = function(node) {
        var object = node.object,
            property = node.property,
            computed = node.computed;

        object = this[object.type](object);

        property = this[property.type](property, object);

        if(!(Object(object) === object && Object.getPrototypeOf(object) === Object.prototype)) {
            throw {
                message : object + '???(???) ????????? ?????? ???????????????.',
                node : node
            };
        }

        var blockType = property;
        if(!blockType) {
            throw {
                message : property + '???(???) ???????????? ????????????.',
                node : node
            };
        }
        return blockType;
    };

    p.ConditionalExpression = function(node) {
        var test = node.test,
            alternate = node.alternate,
            consequent = node.consequent;

        throw {
            message : '???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.UpdateExpression = function(node) {
        var operator = node.operator,
            args = node.argument,
            prefix = node.prefix;

        throw {
            message : operator + '???(???) ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.CallExpression = function(node) {
        var callee = node.callee,
            args = node.arguments;
        var params = [];
        var blockType = this[callee.type](callee);

        var type = this.syntax.Scope[blockType];
        var block = RoCode.block[type];
        var blockParams = block.params;

        for(var i = 0; i < args.length; i++) {
            var arg = args[i];
            var value = this[arg.type](arg, type);
            var paramType = blockParams[i].type;

            if (paramType == "Dropdown") {
                params.push(value);
            } else if (paramType === 'Block') {
                var paramBlock;
                if (typeof value == 'string') {
                    paramBlock = {type: 'text', params:[value]};
                } else if (typeof value == 'number') {
                    paramBlock = {type: 'number', params:[value]};
                } else {
                    paramBlock = value;
                }
                params.push(paramBlock);
            } else {
                params.push(value);
            }

            if (value.type !== paramType && this._parentParser) {
                var title = Lang.Msgs.warn;
                //lineNubmer start from 0
                var lineNumber = this._parentParser
                                    .getLineNumber(node.start, node.end)
                                    .from.line + 1;
                var content = Lang.TextCoding.warn_unnecessary_arguments;
                content = content
                    .replace('&(calleeName)', callee.name)
                    .replace('&(lineNumber)', lineNumber);
                RoCode.toast.warning(title, content);
            }
        }

        return {
            type: type,
            params: params
        };
    };

    p.NewExpression = function(node) {
        throw {
            message : 'new??? ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    p.SequenceExpression = function(node) {
        var expressions = node.expressions;

        throw {
            message : 'SequenceExpression ???????????? ?????? ????????? ?????????.',
            node : node
        };
    };

    // scope method
    p.initScope = function(node) {
        if (this.scope === null) {
            var scoper = function() {};
            scoper.prototype = this.syntax.Scope;
            this.scope = new scoper();
        } else {
            var scoper = function() {};
            scoper.prototype = this.scope;
            this.scope = new scoper();
        }

        this.scopeChain.push(this.scope);
        return this.scanDefinition(node);
    };

    p.unloadScope = function() {
        this.scopeChain.pop();
        if (this.scopeChain.length)
            this.scope = this.scopeChain[this.scopeChain.length - 1];
        else
            this.scope = null;
    };

    p.scanDefinition = function(node) {
        var body = node.body;
        var separatedBlocks = [];
        for (var i = 0; i < body.length; i++) {
            var childNode = body[i];
            if (childNode.type === "FunctionDeclaration") {
                this.scope[childNode.id.name] = this.scope.promise;
                if (this.syntax.BasicFunction) {
                    var childBody = childNode.body;
                    separatedBlocks.push([{
                        type: this.syntax.BasicFunction,
                        statements: [this[childBody.type](childBody)]
                    }]);
                }
            }
        }
        return separatedBlocks;
    };

    p.BasicFunction = function(node, body) {
        return null;
    };

    // custom node parser
    p.BasicIteration = function(node, iterCount, body) {
        if(iterCount > 10) {
            throw {
                message : '?????? ???????????? 10??? ????????? ????????????.',
                node : node.test
            };
        }

        var blockType = this.syntax.BasicIteration;
        if (!blockType)
            throw {
                message : '???????????? ?????? ????????? ?????????.',
                node : node
            };
        return {
            params: [iterCount],
            type: blockType,
            statements: [body]
        };
    };

    p.BasicWhile = function(node, body) {
        var raw = node.test.raw;
        if (this.syntax.BasicWhile[raw]) {
            return {
                type: this.syntax.BasicWhile[raw],
                statements: [body]
            }
        } else {
            throw {
                message : '???????????? ?????? ????????? ?????????.',
                node : node.test
            };
        }
    };

    p.BasicIf = function(node) {
        var result = {};
        result.params = [];
        result.statements = [];
        var type;
        var stmtCons = [];
        var stmtAlt = [];
        var params = [];
        var cons = node.consequent;
        if(cons)
            var consequent = this[cons.type](cons);

        var alt = node.alternate;
        if(alt)
            var alternate = this[alt.type](alt);

        try{
            var test = '';
            if(node.test.operator)
                var operator = (node.test.operator === '===') ? '==' : node.test.operator;
            else
                var operator = null;

            if(node.test.left && node.test.right)
                var testCondition = node.test.left.name + node.test.right.value;
            else
                var testCondition = null;

            if(testCondition == "frontwall" && (operator == "==")) {
                test = "front == \'wall\'";
                type = this.syntax.BasicIf[test];
            } else if(testCondition == "fronthump" && (operator == "==")) {
                test = "front == \'hump\'";
                type = this.syntax.BasicIf[test];
            } else if(testCondition == "frontstone" && (operator == "==")) {
                test = "front == \'stone\'";
                type = this.syntax.BasicIf[test];
            } else if(testCondition == "frontbee" && (operator == "==")) {
                test = "front == \'bee\'";
                type = this.syntax.BasicIf[test];
            } else {
                if(node.test.value || (node.test.left && node.test.right)) {
                    type = "ai_if_else";
                    var callExData = this[node.test.type](node.test, this.syntax.Scope);
                    var value = callExData.params[2];
                    params.push(callExData);
                } else {
                    throw {
                        message : '???????????? ?????? ????????? ?????????.',
                        node : node.test
                    };
                }
            }

            if (type) {
                if(consequent && consequent.length != 0){
                    stmtCons = consequent;
                    result.statements.push(stmtCons);
                }

                if(alternate && alternate.length != 0) {
                    stmtAlt = alternate;
                    result.statements.push(stmtAlt);
                }

                if(type)
                    result.type = type;
                if(params && params.length != 0)
                    result.params = params;

                return result;
            } else {
                if(consequent && consequent.length != 0)
                    stmtCons = consequent;

                if(alternate && alternate.length != 0)
                    stmtAlt = alternate;

                if(type)
                    result.type = type;
                if(params && params.length != 0)
                    result.params = params;

                result.statements = [stmtCons, stmtAlt];

                return result;
                //throw new Error();
            }
        } catch (e) {
            throw {
                message : '???????????? ?????? ????????? ?????????.',
                node : node.test
            };
        }
    };

    p.searchSyntax = function(datum) { return null; };
})(RoCode.JsToBlockParser.prototype);
