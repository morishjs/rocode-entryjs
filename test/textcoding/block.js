describe('RoCodePython', function(){
    var allCategories = RoCodeStatic.getAllBlocks();

    RoCode.init(null, {type: "invisible"});

    RoCode.loadProject(RoCode.getStartProject());
    RoCode.playground.object = RoCode.container.objects_[0];

    //RoCode.variableContainer.addVariable({"name": "testVar"})

    function pairConvertTest(blockType) {
        it (blockType, function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            var parser = new RoCode.Parser(RoCode.Vim.WORKSPACE_MODE);
            var syntax = parser.mappingSyntax(RoCode.Vim.WORKSPACE_MODE);
            var blockToPyParser = new RoCode.BlockToPyParser(syntax);
            var pyToBlockParser = new RoCode.PyToBlockParser(syntax);
            blockToPyParser._parseMode = RoCode.Parser.PARSE_GENERAL;
            var options = { locations: true, ranges: true };
            var code = {
                registerEvent: function() {},
                registerBlock: function() {}
            };

            var blockSchema = RoCode.block[blockType];
            var pythonOutput = blockToPyParser.Thread(new RoCode.Thread([blockSchema.def], code));
            var blockOutput = pyToBlockParser.processPrograms([filbert.parse(pythonOutput, options)]);

            blockToPyParser = new RoCode.BlockToPyParser(syntax);
            blockToPyParser._parseMode = RoCode.Parser.PARSE_GENERAL;

            var secondPythonOutput = blockToPyParser.Thread(new RoCode.Thread(blockOutput[0], code));
            if (pythonOutput !== secondPythonOutput)
                console.log(
                    pythonOutput,
                    secondPythonOutput,
                    blockOutput
                );

            assert.equal(pythonOutput, secondPythonOutput);
            RoCode.clearProject();
        });
    }

    describe('should convert block', function(){
        for (var i = 0; i < allCategories.length; i++) {
            var blocks = allCategories[i].blocks;
            for (var j = 0; j < blocks.length; j++) {
                var blockType = blocks[j];
                var blockSchema = RoCode.block[blockType];

                if (blockSchema &&
                    blockSchema.syntax &&
                    blockSchema.syntax.py &&
                    blockSchema.def) {
                    if (i === 11 &&
                        ["arduino", "ArduinoExt", "hamster"].indexOf(blockSchema.isNotFor[0]) < 0)
                        continue;
                    if (blockSchema.syntax.py[0] &&
                        blockSchema.syntax.py[0].passTest)
                        continue;
                    pairConvertTest(blockType);
                }
            }
        }
    });

    describe('should convert block', function(){
        it ("move direction", function() {
            assert.ok(Test.pythonToBlock(
                "RoCode.move_to_direction(10)",
                [[{
                    type: "move_direction",
                    params: [{
                        params: ["10"]
                    }]
                }]]
            ));
        });
    });

    describe('should convert block', function() {
        it("move_x" , function() {
            assert.ok(Test.pythonToBlock(
                "RoCode.add_x(10)" ,
                [[{
                    "type": "move_x",
                    "params": [{
                        params : ["10"]
                    }]
                }]]
            ));
        });
    });

    describe('minus / plus test', function() {
        it("move_x" , function() {
            assert.ok(Test.pythonToBlock(
                "RoCode.add_x(-10)" ,
                [[{
                    "type": "move_x",
                    "params": [{
                        params : ["-10"]
                    }]
                }]]
            ));
        });
    });

    describe('String merge and add block test', function() { // variable add ,
        it("calc_basic" , function() {
            assert.ok(Test.pythonToBlock(
                "('안녕' + '하세요')",
                [[{
                    "type": "calc_basic",
                    "params": [
                        {
                            params : ["안녕"]
                        },
                        "PLUS",
                        {
                            params : ["하세요"]
                        }
                    ]
                }]]
            ));
        });

    });

    describe('convert float and integer block test', function() { // variable add ,
        it("calc_basic" , function() {
            assert.ok(Test.pythonToBlock(
                "('10.12345' - '10.0003')",
                [[{
                    "type": "calc_basic",
                    "params": [
                        {
                            params : ["10.12345"]
                        },
                        "MINUS",
                        {
                            params : ["10.0003"]
                        }
                    ]
                }]]
            ));
        });

        it("quotient_and_mod" , function() {
            assert.ok(Test.pythonToBlock(
                "(11.0002 // 10.0003)",
                [[{
                    "type": "quotient_and_mod",
                    "params": [
                        null,
                        {
                            params : ["11.0002"]
                        },
                        null,
                        {
                            params : ["10.0003"]
                        }
                    ]
                }]]
            ));
        });

        it("Minus action use variable" , function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "abcd" , "value" : "11.0002"
            });
            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "abce" , "value" : "10.0003"
            });
            assert.ok(Test.pythonToBlock(
                "(테스트변수1 - 테스트변수2)",
                [[{
                    "type": "calc_basic",
                    "params": [
                        {
                            type: "get_variable",
                            params: [
                                "abcd"
                            ]
                        },
                        "MINUS",
                        {
                            type: "get_variable",
                            params: [
                                "abce"
                            ]
                        }
                    ]
                }]]
            ));
            RoCode.clearProject();
        });
    });

    describe('should convert block', function(){
        it ("get_variable", function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            })


            assert.ok(Test.pythonToBlock(
                "테스트변수1",
                [[{
                    type: "get_variable",
                    params: [
                        "asdf"
                    ]
                }]]
            ));

            RoCode.clearProject();
        });
    });

    describe('parameter process test' , function() {

        it("dialog block test", function() { // (테스트변수)를 말하기 블록
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            })

            assert.ok(Test.pythonToBlock(
                "RoCode.print(테스트변수1)",
                [[{
                    type: "dialog",
                    params: [
                        {
                            type: "get_variable",
                            params: [
                                "asdf"
                            ]
                        }
                    ]
                }]]
            ));
            RoCode.clearProject();
        });



        it("dialog time block test", function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            })

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "asde"
            })

            assert.ok(Test.pythonToBlock(
                "RoCode.print_for_sec(테스트변수1 , 테스트변수2)",
                [[{
                    type: "dialog_time",
                    params: [
                        {
                            type: "get_variable",
                            params: [
                                "asdf"
                            ]
                        },
                        {
                            type: "get_variable",
                            params: [
                                "asde"
                            ]
                        }
                    ]
                }]]
            ));

            RoCode.clearProject();
        });


        it("while not block test", function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "asde"
            });


            assert.ok(Test.pythonToBlock(
                "while not (테스트변수1 == 테스트변수2):",
                [[{
                    type : "repeat_while_true",
                    params : [
                        {
                            "type" : "boolean_basic_operator",
                            "params" : [
                                {
                                    "type": "get_variable",
                                    "params" : [
                                        "asdf"
                                    ]
                                },
                                "EQUAL",
                                {
                                    "type": "get_variable",
                                    "params" : [
                                        "asde"
                                    ]
                                }
                            ]
                        }
                    ]
                }]]
            ));

            RoCode.clearProject();
        });

        it("set x, y block test", function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "asde"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수3", "id": "asdh"
            });

            assert.ok(Test.pythonToBlock(
                "RoCode.set_xy_for_sec(테스트변수2, 테스트변수3, 테스트변수1)",
                [[{
                    type : "locate_xy_time",
                    params : [
                        {
                            type: "get_variable",
                            params : ['asdf']
                        },
                        {
                            type: "get_variable",
                            params : ['asde']
                        },
                        {
                            type: "get_variable",
                            params : ['asdh']
                        }
                    ]
                }]]
            ));

            RoCode.clearProject();
        });

        it("add_brush_size block test", function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            });

            assert.ok(Test.pythonToBlock(
                "RoCode.add_brush_size(테스트변수1)",
                [[{
                    type : "change_thickness",
                    params : [
                        {
                            type: "get_variable",
                            params : ['asdf']
                        }
                    ]
                }]]
            ));

            RoCode.clearProject();
        });

        it("play_sound_from_to block test", function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];


            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "asdf"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "abce"
            });

            assert.ok(Test.pythonToBlock(
                "RoCode.play_sound_from_to('강아지 짖는소리', 테스트변수1, 테스트변수2)",
                [[{
                    type : "sound_from_to",
                    params : [
                        {
                            type: "get_sounds",
                            params : ['8el5']
                        },
                        {
                            type: "get_variable",
                            params : ['asdf']
                        },
                        {
                            type: "get_variable",
                            params : ['abce']
                        }
                    ]
                }]]
            ));

            RoCode.clearProject();
        });
    })


    describe('list index change block is ', function(){
        it("value_of_index_from_list block", function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addList({
                "type": "list", "name": "테스트리스트", "id": "asdf"
            });
            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수", "id": "asde"
            });


            assert.ok(Test.pythonToBlock(
                "테스트리스트[테스트변수-1]",
                [[{
                    type : "value_of_index_from_list",
                    params : [
                        null,
                        'asdf',
                        null,
                       {
                            type: "get_variable",
                            params : ['asde']
                        }
                    ]
                }]]
            ));

            RoCode.clearProject();

        });

        it("remove_value_from_list block", function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addList({
                "type": "list", "name": "테스트리스트", "id": "asdf"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수", "id": "asde"
            });

            assert.ok(Test.pythonToBlock(
                "테스트리스트.pop(테스트변수-1)",
                [[{
                    type : "remove_value_from_list",
                    params : [
                       {
                            type: "get_variable",
                            params: ['asde']
                       },
                       'asdf'
                    ]
                }]]
            ));

            RoCode.clearProject();

        });

        it("insert_value_to_list block", function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addList({
                "type": "list", "name": "테스트리스트", "id": "asdf"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수", "id": "asde"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "asdz"
            });


            assert.ok(Test.pythonToBlock(
                "테스트리스트.insert(테스트변수2-1 , 테스트변수)",
                [[{
                    type : "insert_value_to_list",
                    params : [
                       {
                            type: "get_variable",
                            params: ['asde']
                       },
                       'asdf',
                       {
                            type: "get_variable",
                            params: ['asdz']
                       }
                    ]
                }]]
            ));

            RoCode.clearProject();

        });

        it("change_value_list_index block", function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addList({
                "type": "list", "name": "테스트리스트", "id": "asdf"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수", "id": "asde"
            });

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수2", "id": "asdz"
            });


            assert.ok(Test.pythonToBlock(
                "테스트리스트 = []\n\n테스트리스트[테스트변수2-1] = 테스트변수",
                [[{
                    type : "change_value_list_index",
                    params : [
                       'asdf',
                       {
                            type: "get_variable",
                            params: ['asdz']
                       },
                       {
                            type: "get_variable",
                            params: ['asde']
                       }
                    ]
                }]]
            ));

            RoCode.clearProject();
        });

    });

    describe('declare', function(){

        it("variable" , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            var resultBlock = Test.parsePython("test = 2");
            var variable = RoCode.variableContainer.variables_[0];

            assert.ok(variable);
            assert.equal(variable.name_ , 'test');
            assert.equal(variable.value_ , '2');

            RoCode.clearProject();

        });

        it("list" , function() {

            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            var resultBlock = Test.parsePython("test = ['2']");
            var list = RoCode.variableContainer.lists_[0];

            assert.ok(list);
            assert.equal(list.name_ , 'test');
            assert.equal(list.array_[0].data , '2');

            RoCode.clearProject();

        });

    });

    describe('parse', function(){

        it("sound" , function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            assert.ok(Test.pythonToBlock(
                "RoCode.play_sound('강아지 짖는소리')",
                [[{
                    type : "sound_something_with_block",
                    params : [
                       {
                            type: "get_sounds",
                            params: ['8el5']
                       },
                       null
                    ]
                }]]
            ));
            RoCode.clearProject();
        });

        it("picture" , function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            assert.ok(Test.pythonToBlock(
                "RoCode.change_shape('엔트리봇_걷기2')",
                [[{
                    type : "change_to_some_shape",
                    params : [
                       {
                            type: "get_pictures",
                            params: ["4t48"]
                       },
                       null
                    ]
                }]]
            ));
            RoCode.clearProject();
        });

        it("object" , function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            assert.ok(Test.pythonToBlock(
                'RoCode.make_clone_of("엔트리봇")',
                [[{
                    type : "create_clone",
                    params : [
                        "7y0y"
                    ]
                }]]
            ));
            RoCode.clearProject();
        });
    });

    describe('create ' , function() {
        it('local variable' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "테스트변수1", "id": "abcd" , object_ : "7y0y"

            });


            assert.ok(Test.pythonToBlock(
                "테스트변수1",
                [[{
                    type : 'get_variable',
                    params : [ 'abcd' ]
                }]]
            ));

            RoCode.clearProject();
        })
    });

    describe('call' , function() {
        describe('variable' , function() {
            it('ask_and_wait method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addVariable({
                    "type": "variable", "name": "테스트변수1", "id": "abcd"
                });

                assert.ok(Test.pythonToBlock(
                    'RoCode.input(테스트변수1)',
                    [[{
                        "type" : "ask_and_wait",
                        "params" : [
                            {
                                type : 'get_variable',
                                params : ["abcd"]
                            }
                        ]
                    }]]
                ));

                RoCode.clearProject();
            });

            it('show_variable method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addVariable({
                    "type": "variable", "name": "테스트변수1", "id": "abcd"
                });

                assert.ok(Test.pythonToBlock(
                    'RoCode.show_variable("테스트변수1")',
                    [[{
                        "type" : "show_variable",
                        "params" : [
                            "abcd"
                        ]
                    }]]
                ));

                RoCode.clearProject();

            });

            it('hide_variable method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addVariable({
                    "type": "variable", "name": "테스트변수1", "id": "abcd"
                });

                assert.ok(Test.pythonToBlock(
                    "RoCode.hide_variable('테스트변수1')",
                    [[{
                        type : 'hide_variable',
                        params: [
                            'abcd'
                        ]
                    }]]
                ));

                RoCode.clearProject();

            });

            it('change_variable method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];
                RoCode.variableContainer.addVariable({
                    "type": "variable", "name": "test", "id": "abcd"
                });
                var resultBlock = Test.parsePython("test=0\n\ntest += 10");

                assert.ok(Test.pythonToBlock(
                    "test=0\n\ntest += 10",
                    [
                       [
                          {
                             "type":"change_variable",
                             "params":[
                                "abcd",
                                {
                                   "type":"number",
                                   "params":[
                                      "10"
                                   ]
                                }
                             ]
                          }
                       ]
                    ]
                ));
                RoCode.clearProject();
            })

            it('char_at method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];
                RoCode.variableContainer.addVariable({
                    "type": "variable", "name": "test", "id": "abcd"
                });
                assert.ok(Test.pythonToBlock(
                    "test=\"asdf\"\n\ntest[0]",
                    [
                       [
                          {
                             "type":"char_at",
                             "params":[
                                 undefined,
                                 {
                                    type: "get_variable",
                                    params: [ "abcd" ]
                                 },
                                 undefined,
                                 {
                                    type: "number",
                                    params: [ 1 ]
                                 }
                             ]
                          }
                       ]
                    ]
                ));
                RoCode.clearProject();
            })

            it('char_at answer method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];
                assert.ok(Test.pythonToBlock(
                    "RoCode.answer()[0]",
                    [
                       [
                          {
                             "type":"char_at",
                             "params":[
                                 undefined,
                                 {
                                    type: "get_canvas_input_value"
                                 },
                                 undefined,
                                 {
                                    type: "number",
                                    params: [ 1 ]
                                 }
                             ]
                          }
                       ]
                    ]
                ));
                RoCode.clearProject();
            })
        });

        describe('list method' , function() {
            it('show_list method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addList({
                    "type": "list", "name": "테스트리스트", "id": "asdf"
                });

                assert.ok(Test.pythonToBlock(
                    "RoCode.show_list('테스트리스트')",
                    [[{
                        type: 'show_list',
                        params : ['asdf']
                    }]]
                ));
                RoCode.clearProject();
            });

            it('hide_list method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addList({
                    "type": "list", "name": "테스트리스트", "id": "asdf"
                });

                assert.ok(Test.pythonToBlock(
                    "RoCode.hide_list('테스트리스트')",
                    [[{
                        type: 'hide_list',
                        params : ['asdf']
                    }]]
                ));
                RoCode.clearProject();
            });

            it('add_value_to_list method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addList({
                    "type": "list", "name": "테스트리스트", "id": "asdf"
                });

                assert.ok(Test.pythonToBlock(
                    "테스트리스트.append('10')",
                    [[{
                        type: "add_value_to_list",
                        params : [
                            {
                                type : "text",
                                params : ["10"]
                            },
                            "asdf"
                        ]
                    }]]
                ));
                RoCode.clearProject();
            });

            it('is_included_in_list method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addList({
                    "type": "list", "name": "테스트리스트", "id": "asdf"
                });


                assert.ok(Test.pythonToBlock(
                    "'10' in 테스트리스트",
                    [[{
                        type : "is_included_in_list",
                        params : [
                            null ,
                            "asdf",
                            null,
                            {
                                type : 'text',
                                params : ['10']
                            }
                        ]
                    }]]
                ));
                RoCode.clearProject();

            });

            it('length_of_list method' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                RoCode.variableContainer.addList({
                    "type": "list", "name": "테스트리스트", "id": "asdf"
                });


                assert.ok(Test.pythonToBlock(
                    "len(테스트리스트)",
                    [[{
                        type : "length_of_list",
                        params : [
                            null ,
                            "asdf"
                        ]
                    }]]
                ));
                RoCode.clearProject();
            })
        });

        describe('recursive', function(){
            it('add block',function(){

                assert.ok(Test.pythonToBlock(
                    "((('10'+'10') + '10')+'10')",
                    [[{
                        "type" : "calc_basic",
                        "params" : [
                            {
                                "type" : "calc_basic",
                                "params" : [
                                    {
                                        "type" : "calc_basic",
                                        "params" : [
                                            {
                                                "type" : "number",
                                                "params" : ["10"]
                                            },
                                            "PLUS",
                                            {
                                                "type" : "number",
                                                "params" : ["10"]
                                            }

                                        ]
                                    },
                                    "PLUS",
                                    {
                                        "type": "number",
                                        "params": ["10"]
                                    }

                                ]
                            },
                            "PLUS",
                            {
                                "type": "number",
                                "params" : ["10"]
                            }
                        ]
                    }]]
                ));
            });

            it('minus block',function(){
                assert.ok(Test.pythonToBlock(
                    "((('10'-'10') - '10')-'10')",
                    [[{
                        "type" : "calc_basic",
                        "params" : [
                            {
                                "type" : "calc_basic",
                                "params" : [
                                    {
                                        "type" : "calc_basic",
                                        "params" : [
                                            {
                                                "type" : "number",
                                                "params" : ["10"]
                                            },
                                            "MINUS",
                                            {
                                                "type" : "number",
                                                "params" : ["10"]
                                            }

                                        ]
                                    },
                                    "MINUS",
                                    {
                                        "type": "number",
                                        "params": ["10"]
                                    }

                                ]
                            },
                            "MINUS",
                            {
                                "type": "number",
                                "params" : ["10"]
                            }
                        ]
                    }]]
                ));
            })


            it('calc_operation block',function(){
                assert.ok(Test.pythonToBlock(
                    "((('10'**2)**2)**2)",
                    [[{
                        "type" : "calc_operation",
                        "params" : [
                            null,
                            {
                                type: "calc_operation",
                                params: [
                                    null,
                                    {
                                        type: 'calc_operation',
                                        params : [
                                            null,
                                            {
                                                "type": "number",
                                                "params" : [ "10" ]
                                            },
                                            null,
                                            null
                                        ]
                                    },
                                    null,
                                    null
                                ]
                            },
                            null,
                            null
                        ]
                    }]]
                ));
            })
        });

        describe('about function python mode' , function() {
            it('define' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];
                Test.parsePython("def 함수(param1, param2):\n    RoCode.move_to_direction(10)");
                var functions = RoCode.variableContainer.functions_;
                var functionKey = Object.keys(functions)[0];
                var func = functions[functionKey];

                assert.equal(func.description.trim().substr(0, 2) , '함수');
                assert.equal(func.content._data[0]._data[1].data.type , 'move_direction');
                assert.equal(func.content._data[0]._data[1].data.params[0].data.params[0] , '10');

                RoCode.clearProject();
            });

            it('params convert' , function(){
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];

                var resultBlock = Test.parsePython("def 함수(param1, param2):\n    RoCode.move_to_direction(10)\n\n함수(10,True)");
                var functions = RoCode.variableContainer.functions_;
                var functionKey = Object.keys(functions)[0];
                var func = functions[functionKey];

                assert.ok(Test.objectSimilarCheck(resultBlock[0][0],
                    {
                        "type": 'func_' + functionKey,
                        "params" : [
                            {
                                "type" : 'number',
                                "params" : ["10"]
                            },
                            {
                                "type" : "True"
                            }
                        ]
                    }
                ));
                RoCode.clearProject();
            });

            it('params' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];
                var resultBlock = Test.parsePython("def 함수(param1):\n    함수(param1)\n함수(10)");
                var functions = RoCode.variableContainer.functions_;
                var functionKey = Object.keys(functions)[0];
                var func = functions[functionKey];
                var functionContent = func.content.toJSON();

                assert.equal(functionContent[0][0].params[0].params[1].params[0].type , functionContent[0][1].params[0].type);

                RoCode.clearProject();
            })

            it('recursive' , function() {
                RoCode.loadProject(RoCode.getStartProject());
                RoCode.playground.object = RoCode.container.objects_[0];
                var resultBlock = Test.parsePython("def 함수(param1):\n    함수(param1)\n함수(10)");
                var functions = RoCode.variableContainer.functions_;
                var functionKey = Object.keys(functions)[0];
                var func = functions[functionKey];
                var functionData = func.content._data[0];
                var functionDefineParam = functionData._data[1].data.type;

                assert.ok(functionDefineParam.indexOf('func_') > -1);


            })
        })
    });

    describe('indent' , function(){
        it('block' , function(){
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];
            var resultBlock = Test.parsePython("while True:\n    if True:\n    RoCode.move_to_direction(0)");

            assert.ok(Test.pythonToBlock(
                "while True:\n    if True:\n    RoCode.move_to_direction(0)",
                [[{
                    "statements":[
                       [
                          {
                             "statements":[

                             ],
                             "type":"_if",
                             "params":[
                                {
                                   "type":"True"
                                }
                             ]
                          },
                          {
                             "type":"move_direction",
                             "params":[
                                {
                                   "type":"number",
                                   "params":[
                                      "0"
                                   ]
                                },
                                null
                             ]
                          }
                       ]
                    ],
                    "type":"repeat_inf"
                }]]
            ));
            RoCode.clearProject();


        })
    });

    describe('check' , function(){
        it('hardware block' , function() {
            // var resultBlock = Test.parsePython("Hamster.left_led(Hamster.LED_RED)");

            assert.ok(Test.pythonToBlock('Hamster.io_modes(Hamster.IO_MODE_DIGITAL_INPUT)',
                [[{
                    "type":"hamster_set_port_to",
                    "params":["AB","1",null]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.io_modes(Hamster.IO_MODE_SERVO_OUTPUT)',
                [[{
                    "type":"hamster_set_port_to",
                    "params":["AB","8",null]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.io_modes(Hamster.IO_MODE_PWM_OUTPUT)',
                [[{
                    "type":"hamster_set_port_to",
                    "params":["AB","9",null]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.io_modes(Hamster.IO_MODE_DIGITAL_OUTPUT)',
                [[{
                    "type":"hamster_set_port_to",
                    "params":["AB","10",null]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.note(0,0.25)',
                [[{
                    "type":"hamster_rest_for",
                    "params":[
                            {
                                "type":"text",
                                "params":["0.25"]
                            },
                                null
                        ]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.note(HAMSTER.NOTE_C, 4, 0.5)',
                [[{
                    "type":"hamster_play_note_for",
                    "params":[
                            4,
                            "4",
                            {
                                "type":"text","params":["0.5"]
                            }
                            ,null
                        ]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.left_led(Hamster.LED_RED)',
                [[{
                    "type":"hamster_set_led_to",
                    "params": [
                            "LEFT",
                            "4",
                            null
                        ]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.left_led(Hamster.LED_YELLOW)',
                [[{
                    "type":"hamster_set_led_to",
                    "params": [
                            "LEFT",
                            "6",
                            null
                        ]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.line_tracer_mode(Hamster.LINE_TRACER_MODE_BLACK_LEFT_SENSOR)',
                [[{
                    "type":"hamster_follow_line_using",
                    "params":[
                        "BLACK",
                        "LEFT",
                        null
                    ]
                }]]
            ));

            assert.ok(Test.pythonToBlock('Hamster.line_tracer_mode(Hamster.LINE_TRACER_MODE_BLACK_TURN_LEFT)',
                [[{
                    "type":"hamster_follow_line_until",
                    "params":[
                        "BLACK",
                        "LEFT",
                        null
                    ]
                }]]
            ));
        });
    });

    describe('def' , function() {
        it('when_start_click block' , function() {

            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            assert.ok(Test.pythonToBlock('def when_start():\n    RoCode.move_to_direction(10)',
                [
                   [
                      {
                         "type":"when_run_button_click"
                      },
                      {
                         "type":"move_direction",
                         "params":[
                            {
                               "type":"number",
                               "params":[
                                  "10"
                               ]
                            },
                            null
                         ]
                      }
                   ]
                ]
            ));
        });

        it('repeat basic block' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];
            // var resultBlock = Test.parsePython("def when_start():\n    for i in range(10):\n        RoCode.move_to_direction(10)");

            assert.ok(Test.pythonToBlock(
                "def when_start():\n    for i in range(10):\n        RoCode.move_to_direction(10)",
                [
                   [
                      {
                         "type":"when_run_button_click"
                      },
                      {
                         "type":"repeat_basic",
                         "params":[
                            {
                               "type":"number",
                               "params":[
                                  "10"
                               ]
                            }
                         ],
                         "statements":[
                            [
                               {
                                  "type":"move_direction",
                                  "params":[
                                     {
                                        "type":"number",
                                        "params":[
                                           "10"
                                        ]
                                     },
                                     null
                                  ]
                               }
                            ]
                         ]
                      }
                   ]
                ]
            ));
        });

        it('if else block' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];
            var resultBlock = Test.parsePython("def when_start():\n    if (True and True):\n        RoCode.add_x(10)\n    else:\n        RoCode.bounce_on_edge()");

            assert.ok(Test.parsePython(
                "def when_start():\n    if (True and True):\n        RoCode.add_x(10)\n    else:\n        RoCode.bounce_on_edge()" ,
                [
                   [
                      {
                         "type":"when_run_button_click",
                         "params":[
                            null
                         ],
                         "contents":[
                            {
                               "type":"if_else",
                               "params":[
                                  {
                                     "type":"boolean_and",
                                     "params":[
                                        {
                                           "type":"True"
                                        },
                                        null,
                                        {
                                           "type":"True"
                                        }
                                     ]
                                  }
                               ],
                               "statements":[
                                  [
                                     {
                                        "type":"move_x",
                                        "params":[
                                           {
                                              "type":"number",
                                              "params":[
                                                 "10"
                                              ]
                                           },
                                           null
                                        ]
                                     }
                                  ],
                                  [
                                     {
                                        "type":"bounce_wall",
                                        "params":[
                                           null
                                        ]
                                     }
                                  ]
                               ]
                            }
                         ]
                      },
                      {
                         "type":"if_else",
                         "params":[
                            {
                               "type":"boolean_and",
                               "params":[
                                  {
                                     "type":"True"
                                  },
                                  null,
                                  {
                                     "type":"True"
                                  }
                               ]
                            }
                         ],
                         "statements":[
                            [
                               {
                                  "type":"move_x",
                                  "params":[
                                     {
                                        "type":"number",
                                        "params":[
                                           "10"
                                        ]
                                     },
                                     null
                                  ]
                               }
                            ],
                            [
                               {
                                  "type":"bounce_wall",
                                  "params":[
                                     null
                                  ]
                               }
                            ]
                         ]
                      }
                   ]
                ]
                ));
        });
        it('while block ' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];
            var resultBlock = Test.parsePython("def when_start():\n    while True:\n        for i in range(10):\n            RoCode.move_to_direction(10)");

            assert.ok(Test.pythonToBlock(
                "def when_start():\n    while True:\n        for i in range(10):\n            RoCode.move_to_direction(10)" ,
                [
                   [
                      {
                         "type":"when_run_button_click"
                      },
                      {
                         "type":"repeat_inf",
                         "statements":[
                            [
                               {
                                  "statements":[
                                     [
                                        {
                                           "type":"move_direction",
                                           "params":[
                                              {
                                                 "type":"number",
                                                 "params":[
                                                    "10"
                                                 ]
                                              },
                                              null
                                           ]
                                        }
                                     ]
                                  ],
                                  "params":[
                                     {
                                        "type":"number",
                                        "params":[
                                           "10"
                                        ]
                                     }
                                  ],
                                  "type":"repeat_basic"
                               }
                            ]
                         ]
                      }
                   ]
                ]
            ));
        });

        it('Do while block ' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            var resultBlock = Test.parsePython("def when_start():\n    while not (10 > 10):\n       RoCode.move_to_direction(10)");

            assert.ok(Test.pythonToBlock(
                "def when_start():\n    while not (10 > 10):\n        RoCode.move_to_direction(10)" ,
                [
                   [
                        {
                         "type":"when_run_button_click"
                        },
                        {
                         "type":"repeat_while_true",
                         "params":[
                            {
                               "type":"boolean_basic_operator",
                               "params":[
                                  {
                                     "type":"number",
                                     "params":[
                                        "10"
                                     ]
                                  },
                                  "GREATER",
                                  {
                                     "type":"number",
                                     "params":[
                                        "10"
                                     ]
                                  }
                               ]
                            }
                        ],
                        "statements":[
                            [
                               {
                                  "type":"move_direction",
                                  "params":[
                                     {
                                        "type":"number",
                                        "params":[
                                           "10"
                                        ]
                                     }
                                  ]
                               }
                            ]
                        ]
                    }
                ]
            ]
        ));
    });


        it('set variable block ' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            RoCode.variableContainer.addVariable({
                "type": "variable", "name": "test", "id": "abcd"
            });

            var resultBlock = Test.parsePython("test = 0\n\ndef when_start():\n    test = 22");

            assert.ok(Test.pythonToBlock(
                "def when_start():\n    test = 22" ,
                [
                   [
                      {
                         "type":"when_run_button_click"
                      },
                      {
                         "type":"set_variable",
                         "params":[
                            "abcd",
                            {
                               "type":"number",
                               "params":[
                                  "22"
                               ]
                            }
                         ]
                      }
                   ]
                ]
            ));
        });

        it('when press key ' , function() {
            RoCode.loadProject(RoCode.getStartProject());
            RoCode.playground.object = RoCode.container.objects_[0];

            var resultBlock = Test.parsePython('def when_press_key(space):');

            assert.ok(Test.pythonToBlock(
                'def when_press_key(space):',
               [
                   [
                      {
                         "type":"when_some_key_pressed",
                         "params":[
                            null,
                            32
                         ]
                      }
                   ]
                ]
            ));
        });

    });
});
