require('../util/utils');

export default class PopupHelper {
    private popupList: any = {};
    private nextPopupList: string[] = [];
    private nowContent: any = undefined;
    private body_: any;
    private window_: any;
    private popupWrapper_: any;

    constructor(reset: boolean) {
        if (reset) {
            $('.RoCodePopup.popupHelper').remove();
            window.popupHelper = null;
        }
        RoCode.assert(!window.popupHelper, 'Popup exist');

        const ignoreCloseType = ['confirm', 'spinner'];
        const spanArea = [
            'RoCodePopupHelperTopSpan',
            'RoCodePopupHelperBottomSpan',
            'RoCodePopupHelperLeftSpan',
            'RoCodePopupHelperRightSpan',
        ];

        this.body_ = RoCode.Dom('div', {
            classes: ['RoCodePopup', 'hiddenPopup', 'popupHelper'],
        });

        const popupClickEvent = (e: JQuery.ClickEvent) => {
            if (this.nowContent && ignoreCloseType.indexOf(this.nowContent.prop('type')) > -1) {
                return;
            }
            const $target = $(e.target);
            spanArea.forEach((className) => {
                if ($target.hasClass(className)) {
                    this.hide();
                }
            });
            if (e.target == this) {
                this.hide();
            }
        };

        this.body_.bindOnClick(popupClickEvent);

        window.popupHelper = this;
        this.body_.prop('popup', this);

        RoCode.Dom('div', {
            class: 'RoCodePopupHelperTopSpan',
            parent: this.body_,
        });
        const middle = RoCode.Dom('div', {
            class: 'RoCodePopupHelperMiddleSpan',
            parent: this.body_,
        });
        RoCode.Dom('div', {
            class: 'RoCodePopupHelperBottomSpan',
            parent: this.body_,
        });
        RoCode.Dom('div', {
            class: 'RoCodePopupHelperLeftSpan',
            parent: middle,
        });
        this.window_ = RoCode.Dom('div', {
            class: 'RoCodePopupHelperWindow',
            parent: middle,
        });
        RoCode.Dom('div', {
            class: 'RoCodePopupHelperRightSpan',
            parent: middle,
        });

        $('body').append(this.body_);
    }

    clearPopup() {
        const maxCnt = this.popupWrapper_.children.length - 1;
        for (let i = maxCnt; i > 2; i--) {
            this.popupWrapper_.removeChild(this.popupWrapper_.children[i]);
        }
    }

    addPopup(key: string, popupObject: any) {
        const content_ = RoCode.Dom('div');

        const titleButton_ = RoCode.Dom('div', {
            class: 'RoCodePopupHelperCloseButton',
        });

        titleButton_.bindOnClick(() => {
            if (popupObject.closeEvent) {
                popupObject.closeEvent(this);
            }
            this.hide();
        });

        const popupWrapper_ = RoCode.Dom('div', {
            class: 'RoCodePopupHelperWrapper',
        });

        popupWrapper_.append(titleButton_);

        if (popupObject.title) {
            const title_ = RoCode.Dom('div', {
                class: 'RoCodePopupHelperTitle',
            });
            popupWrapper_.append(title_);
            title_.text(popupObject.title);
        }

        content_.addClass(key);
        content_.append(popupWrapper_);

        // @ts-ignore
        content_.popupWrapper_ = popupWrapper_;
        content_.prop('type', popupObject.type);

        if (typeof popupObject.setPopupLayout === 'function') {
            popupObject.setPopupLayout(content_);
        }

        // @ts-ignore
        content_._obj = popupObject;

        this.popupList[key] = content_;
    }

    hasPopup(key: string) {
        return !!this.popupList[key];
    }

    remove(key: string) {
        if (key) {
            this.window_.find(`> .${key}`).remove();
        } else if (this.window_.children().length > 0) {
            this.window_.children().remove();
        }
        // ???????????? ????????? ???????????? ???????????? ?????????. ?????????? ??????????????? ??????.
        // this.window_.remove();
        delete this.popupList[key];

        if (this.nowContent && this.nowContent.hasClass(key)) {
            this.nowContent = undefined;
            this.body_.addClass('hiddenPopup');
            if (this.nextPopupList.length > 0) {
                this.show(this.nextPopupList.shift());
            }
        }
    }

    // ????????? ???????????? ???????????? ????????????. ???????????? ?????? ???????????? ???
    resize(e: any) {}

    show(key: string, isNext?: boolean) {
        const that = this;

        function showContent(key: string) {
            that.window_.append(that.popupList[key]);
            that.nowContent = that.popupList[key];
            that.body_.removeClass('hiddenPopup');
        }

        if (!isNext) {
            this.window_.children().detach();
            showContent(key);
        } else {
            if (this.window_.children().length > 0) {
                this.nextPopupList.push(key);
            } else {
                this.window_.children().detach();
                showContent(key);
            }
        }
        if (this.nowContent && this.nowContent._obj && this.nowContent._obj.onShow) {
            this.nowContent._obj.onShow();
        }
    }

    hide() {
        const popup = this.nowContent && this.nowContent._obj;
        if (popup && 'closeEvent' in popup) {
            popup.closeEvent(this);
        }
        this.nowContent = undefined;
        this.body_.addClass('hiddenPopup');
        this.window_.children().detach();
        if (this.nextPopupList.length > 0) {
            this.show(this.nextPopupList.shift());
        }
    }

    addClass(className?: string) {
        className && this.body_.addClass(className);
    }
}

// RoCode Legacy ?????? ?????? ???
RoCode.popupHelper = PopupHelper;
