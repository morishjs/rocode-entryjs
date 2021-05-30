import debounce from 'lodash/debounce';

class RoCodeBlockHelper {
    constructor() {
        this.visible = false;
        RoCode.addEventListener('workspaceChangeMode', () => {
            if (this._blockView) {
                this.renderBlock(this._blockView.type);
            }
        });
        this.resize = debounce(this.resize, 300);
    }

    generateView(parentView) {
        if (this.parentView_) {
            return;
        }
        /** @type {!Element} parent view */
        this.parentView_ = parentView;
        const helper = this;
        helper.blockHelpData = RoCodeStatic.blockInfo;
        const blockHelperWrapper = RoCode.createElement('div', 'RoCodeBlockHelperWorkspaceWrapper');
        const blockHelperView = RoCode.createElement('div', 'RoCodeBlockHelperWorkspace');
        blockHelperWrapper.appendChild(blockHelperView);
        this.view = blockHelperWrapper;
        if (RoCode.isForLecture) {
            blockHelperView.addClass('lecture');
        }
        helper.parentView_.appendChild(blockHelperWrapper);

        const blockHelperContent = RoCode.createElement('div', 'RoCodeBlockHelperContentWorkspace');
        this._contentView = blockHelperContent;

        const commandTitle = RoCode.createElement('div');
        commandTitle.addClass('RoCodeBlockHelperTitle textModeElem');
        commandTitle.innerHTML = 'Command';
        blockHelperContent.appendChild(commandTitle);

        blockHelperContent.addClass('RoCodeBlockHelperIntro');
        if (RoCode.isForLecture) {
            blockHelperContent.addClass('lecture');
        }
        blockHelperView.appendChild(blockHelperContent);
        helper.blockHelperContent_ = blockHelperContent;
        helper.blockHelperView_ = blockHelperView;

        const blockHelperBlock = RoCode.createElement('div', 'RoCodeBlockHelperBlockWorkspace');
        helper.blockHelperContent_.appendChild(blockHelperBlock);

        const descTitle = RoCode.createElement('div');
        descTitle.addClass('RoCodeBlockHelperTitle textModeElem');
        descTitle.innerHTML = 'Explanation';
        blockHelperContent.appendChild(descTitle);

        const blockHelperDescription = RoCode.createElement(
            'div',
            'RoCodeBlockHelperDescriptionWorkspace'
        );
        blockHelperDescription.addClass('RoCodeBlockHelperContent selectAble');
        helper.blockHelperContent_.appendChild(blockHelperDescription);
        blockHelperDescription.innerHTML = Lang.Helper.Block_click_msg;
        this.blockHelperDescription_ = blockHelperDescription;

        const elementsTitle = RoCode.createElement('div');
        elementsTitle.addClass('RoCodeBlockHelperTitle textModeElem');
        elementsTitle.innerHTML = 'Element';
        blockHelperContent.appendChild(elementsTitle);
        this._elementsTitle = elementsTitle;

        this._elementsContainer = RoCode.createElement('div', 'RoCodeBlockHelperElementsContainer');

        this._elementsContainer.addClass('RoCodeBlockHelperContent textModeElem selectAble');
        blockHelperContent.appendChild(this._elementsContainer);

        if (typeof CodeMirror !== 'undefined') {
            const codeMirrorTitle = RoCode.createElement('div');
            codeMirrorTitle.addClass('RoCodeBlockHelperTitle textModeElem');
            codeMirrorTitle.innerHTML = 'Example Code';
            blockHelperContent.appendChild(codeMirrorTitle);

            const codeMirrorView = RoCode.createElement(
                'div',
                'RoCodeBlockHelperCodeMirrorContainer'
            );
            codeMirrorView.addClass('textModeElem');
            blockHelperContent.appendChild(codeMirrorView);

            this.codeMirror = CodeMirror(codeMirrorView, {
                lineNumbers: true,
                value: '',
                mode: { name: 'python' },
                indentUnit: 4,
                theme: 'default',
                viewportMargin: 10,
                styleActiveLine: false,
                readOnly: true,
            });

            this._doc = this.codeMirror.getDoc();
            this._codeMirror = this.codeMirror;

            const codeMirrorDescTitle = RoCode.createElement('div');
            codeMirrorDescTitle.addClass('RoCodeBlockHelperTitle textModeElem');
            codeMirrorDescTitle.innerHTML = 'Example Explanation';
            blockHelperContent.appendChild(codeMirrorDescTitle);

            this._codeMirrorDesc = RoCode.createElement('div');
            this._codeMirrorDesc.addClass('RoCodeBlockHelperContent textModeElem selectAble');
            blockHelperContent.appendChild(this._codeMirrorDesc);
        }

        this._renderView = new RoCode.RenderView($(blockHelperBlock), 'LEFT_MOST');
        this.code = new RoCode.Code([]);
        this.code.isFor = 'blockHelper';
        this._renderView.changeCode(this.code);

        this.first = true;
    }

    bindWorkspace(workspace) {
        if (!workspace) {
            return;
        }

        if (this._blockViewObserver) {
            this._blockViewObserver.destroy();
        }

        this.workspace = workspace;
        if (this._renderView) {
            this._renderView.workspace = workspace;
        }
        this._blockViewObserver = workspace.observe(this, '_updateSelectedBlock', [
            'selectedBlockView',
        ]);
    }

    renderBlock(type) {
        const description = Lang.Helper[type];
        if (!type || !this.visible || !description || RoCode.block[type].isPrimitive) {
            return;
        }

        if (this.first) {
            this.blockHelperContent_.removeClass('RoCodeBlockHelperIntro');
            this.first = false;
        }

        const code = this.code;
        code.clear();
        let def = RoCode.block[type].def || { type };

        if (this.workspace.getMode() === RoCode.Workspace.MODE_VIMBOARD) {
            this._contentView.addClass('textMode');
            this.blockHelperDescription_.innerHTML = Lang.PythonHelper[`${type}_desc`];

            let elements = Lang.PythonHelper[`${type}_elements`];
            this._elementsContainer.innerHTML = '';
            if (elements) {
                this._elementsTitle.removeClass('RoCodeRemove');
                elements = elements.split('%next');
                while (elements.length) {
                    (function(elems) {
                        const contents = elems.split('-- ');
                        const box = RoCode.createElement('div');
                        box.addClass('RoCodeBlockHelperElementsContainer');
                        const left = RoCode.createElement('div');

                        left.innerHTML = contents[0];
                        left.addClass('elementLeft');

                        const right = RoCode.createElement('div');
                        right.addClass('elementRight');
                        right.innerHTML = contents[1];
                        box.appendChild(left);
                        box.appendChild(right);
                        this._elementsContainer.appendChild(box);
                    }.bind(this)(elements.shift()));
                }
            } else {
                this._elementsTitle.addClass('RoCodeRemove');
            }
            this._codeMirrorDesc.innerHTML = Lang.PythonHelper[`${type}_exampleDesc`];

            const exampleCode = Lang.PythonHelper[`${type}_exampleCode`];
            this._codeMirror.setValue(exampleCode);
            this.codeMirror.refresh();
            def = RoCode.block[type].pyHelpDef || def;
        } else {
            this._contentView.removeClass('textMode');
            this.blockHelperDescription_.innerHTML = description;
        }

        code.createThread([def]);

        code.board.align();
        code.board.resize();

        this._renderView.align();
        this._renderView.setDomSize();
    }

    getView() {
        return this.view;
    }

    resize() {
        this.codeMirror && this.codeMirror.refresh();
    }

    _updateSelectedBlock() {
        const blockView = this.workspace.selectedBlockView;
        // noinspection EqualityComparisonWithCoercionJS
        if (!blockView || !this.visible || blockView == this._blockView) {
            return;
        }

        const type = blockView.block.type;
        this._blockView = blockView;
        this.renderBlock(type);
    }
}

export default RoCodeBlockHelper;
