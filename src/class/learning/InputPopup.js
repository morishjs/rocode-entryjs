import PopupHelper from '../popup_helper';

export default class InputPopup {
    #popupKey = 'ai_learning';
    result = [];

    constructor(source) {
        this.generatePopupView(source);
    }

    open() {
        this.popupHelper.show(this.#popupKey);
    }

    getResult() {
        return this.result;
    }

    generatePopupView({url, labels, type, recordTime}) {
        if (!this.popupHelper) {
            if (window.popupHelper) {
                this.popupHelper = window.popupHelper;
            } else {
                this.popupHelper = new PopupHelper(true);
            }
        }
        let isPauseClicked = false;
        this.popupHelper.addPopup(this.#popupKey, {
            type: 'confirm',
            title: Lang.Blocks.learn_popup_title,
            onShow: () => {
                this.popupHelper.addClass('learning_popup');
                isPauseClicked = false;
                localStorage.setItem(this.#popupKey, JSON.stringify({url, labels, type, recordTime}));
                this.isLoading = true;
                this.result = [];
                if(RoCode.engine.state == 'run') {
                    RoCode.engine.togglePause({visible:false});
                }
            },
            closeEvent: () => {
                this.isLoading = false;
                if(RoCode.engine.state == 'pause' && !isPauseClicked) {
                    RoCode.engine.togglePause({visible:false});
                }
            },
            setPopupLayout: (popup) => {
                const content = RoCode.Dom('div', {
                    class: 'contentArea',
                });
                const iframe = RoCode.Dom('iframe', {
                    class: `learningInputPopup ${type}`,
                    src: `/learning/popup/${type}`
                });
                $(iframe).on('load', ({target}) => {
                    target.contentWindow.addEventListener("message", ({data:eventData = {}}) => {
                        const { key, data } = JSON.parse(eventData);
                        if(key === 'predict') {
                            this.result = data;
                            this.popupHelper.hide();
                        }
                        if(key === 'stop') {
                            this.popupHelper.hide();
                            RoCode.engine.toggleStop()
                        }
                        if(key === 'pause') {
                            if(!isPauseClicked) {
                                isPauseClicked = true;
                                RoCode.engine.togglePause({visible:false});
                            }
                            RoCode.engine.togglePause();
                        }
                        if(key === 'error') {
                            this.popupHelper.hide();
                            this.toastError();
                        }
                    }, false);
                });
                content.append(iframe);
                popup.append(content);
            },
        });
    }

    toastError() {
        RoCode.toast.alert(Lang.Msgs.warn, Lang.Msgs.ai_utilize_train_pop_error, true);
    }
}
