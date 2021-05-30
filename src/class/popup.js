/**
 * @fileoverview Popup object for generate popup.
 */
'use strict';

/**
 * Constructor of popup
 * @constructor
 */
RoCode.Popup = class Popup {
    constructor(className) {
        RoCode.assert(!window.popup, 'Popup exist');

        this.body_ = RoCode.createElement('div');
        this.body_.addClass('RoCodePopup');
        if (className) {
            this.body_.addClass(className);
        }
        this.body_.bindOnClick(function(e) {
            if (e.target == this) {
                this.popup.remove();
            }
        });
        this.body_.popup = this;
        document.body.appendChild(this.body_);
        this.window_ = RoCode.createElement('div');
        this.window_.addClass('RoCodePopupWindow');
        if (RoCode.targetChecker && !RoCode.targetChecker.statusViewDisabled) {
            this.window_.addClass('targetCheckerPopup');
        }
        // if (RoCode.device === 'tablet') this.window_.addClass('tablet');
        this.window_.bindOnClick(() => {});
        RoCode.addEventListener('windowResized', this.resize);
        window.popup = this;
        this.resize();
        this.body_.appendChild(this.window_);
    }
    /**
     * Remove this popup
     */
    remove() {
        while (this.window_.hasChildNodes()) {
            if (RoCode.type == 'workspace') {
                RoCode.engineContainer.insertBefore(
                    this.window_.firstChild,
                    RoCode.engineContainer.firstChild
                );
            } else if (RoCode.type == 'minimize') {
                const wrapper = RoCode.view_.querySelector('#RoCodeCanvasWrapper');
                wrapper.insertBefore(this.window_.lastChild, wrapper.firstChild);
            } else {
                RoCode.engineContainer.insertBefore(
                    this.window_.lastChild,
                    RoCode.engineContainer.firstChild
                );
            }
        }
        $('body').css('overflow', 'auto');
        RoCode.removeElement(this.body_);
        window.popup = null;
        RoCode.removeEventListener('windowResized', this.resize);
        RoCode.engine.popup = null;
        RoCode.windowResized.notify();
        if (
            RoCode.type === 'workspace' &&
            RoCode.targetChecker &&
            !RoCode.targetChecker.statusViewDisabled
        ) {
            RoCode.targetChecker.getStatusView().remove();
        }
    }

    /**
     * Resize this view size when window size modified
     * @param {event} e
     */
    resize(e) {
        const popup = window.popup;
        const popupWindow = popup.window_;
        const bottomOffset =
            RoCode.targetChecker && !RoCode.targetChecker.statusViewDisabled ? 91 + 48 : 48;
        let maxWidth = window.innerWidth * 0.9;
        let maxHeight = window.innerHeight * 0.9 - bottomOffset;
        if (maxWidth * 9 <= maxHeight * 16) {
            maxHeight = (maxWidth / 16) * 9;
            maxHeight += bottomOffset;
            popupWindow.style.width = `${String(maxWidth)}px`;
            popupWindow.style.height = `${String(maxHeight)}px`;
        } else {
            maxWidth = (maxHeight * 16) / 9;
            maxHeight += bottomOffset;
            popupWindow.style.width = `${String(maxWidth)}px`;
            popupWindow.style.height = `${String(maxHeight)}px`;
        }

        RoCode.stage && RoCode.stage.updateBoundRect();
    }

    removeMouseDispose(e) {
        this.body_.unBindOnClick();
    }
};
