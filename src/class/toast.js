/**
 * @fileoverview Toast object for notification
 */
'use strict';

/**
 * Constructor of toast
 * @constructor
 */
RoCode.Toast = class Toast {
    constructor() {
        this.toasts_ = [];
        /** @type {Element} */
        const exist = document.getElementById('RoCodeToastContainer');
        if (exist) {
            document.body.removeChild(exist);
        }
        this.body_ = RoCode.createElement('div', 'RoCodeToastContainer');
        this.body_.addClass('RoCodeToastContainer');
        document.body.appendChild(this.body_);
    }

    warning(title, message, isNotAutoDispose) {
        const toast = RoCode.createElement('div', 'RoCodeToast');
        toast.addClass('RoCodeToast');
        toast.addClass('RoCodeToastWarning');
        toast.bindOnClick(() => {
            RoCode.toast.body_.removeChild(toast);
        });
        const toastTitle = RoCode.createElement('div', 'RoCodeToast');
        toastTitle.addClass('RoCodeToastTitle');
        toastTitle.textContent = title;
        toast.appendChild(toastTitle);
        const toastMessage = RoCode.createElement('p', 'RoCodeToast');
        toastMessage.addClass('RoCodeToastMessage');
        toastMessage.textContent = message;
        toast.appendChild(toastMessage);
        this.toasts_.push(toast);
        this.body_.appendChild(toast);
        const f = () => {
            toast.style.opacity = 1;
            var timer = setInterval(() => {
                if (toast.style.opacity < 0.05) {
                    clearInterval(timer);
                    toast.style.display = 'none';
                    RoCode.removeElement(toast);
                }
                toast.style.opacity *= 0.9;
            }, 20);
        };
        if (!isNotAutoDispose) {
            window.setTimeout(f, 1000);
        }
    }

    success(title, message, isNotAutoDispose) {
        const toast = RoCode.createElement('div', 'RoCodeToast');
        toast.addClass('RoCodeToast');
        toast.addClass('RoCodeToastSuccess');
        toast.bindOnClick(() => {
            RoCode.toast.body_.removeChild(toast);
        });
        const toastTitle = RoCode.createElement('div', 'RoCodeToast');
        toastTitle.addClass('RoCodeToastTitle');
        toastTitle.textContent = title;
        toast.appendChild(toastTitle);
        const toastMessage = RoCode.createElement('p', 'RoCodeToast');
        toastMessage.addClass('RoCodeToastMessage');
        toastMessage.textContent = message;
        toast.appendChild(toastMessage);
        this.toasts_.push(toast);
        this.body_.appendChild(toast);
        const f = () => {
            toast.style.opacity = 1;
            var timer = setInterval(() => {
                if (toast.style.opacity < 0.05) {
                    clearInterval(timer);
                    toast.style.display = 'none';
                    RoCode.removeElement(toast);
                }
                toast.style.opacity *= 0.9;
            }, 20);
        };
        if (!isNotAutoDispose) {
            window.setTimeout(f, 1000);
        }
    }

    alert(title, message, isNotAutoDispose) {
        const toast = RoCode.createElement('div', 'RoCodeToast');
        let timer;
        toast.addClass('RoCodeToast');
        toast.addClass('RoCodeToastAlert');
        toast.bindOnClick(() => {
            RoCode.toast.body_.removeChild(toast);
            if (timer) {
                clearInterval(timer);
            }
        });
        const toastTitle = RoCode.createElement('div', 'RoCodeToast');
        toastTitle.addClass('RoCodeToastTitle');
        toastTitle.textContent = title;
        toast.appendChild(toastTitle);
        const toastMessage = RoCode.createElement('p', 'RoCodeToast');
        toastMessage.addClass('RoCodeToastMessage');

        if (Array.isArray(message)) {
            toastMessage.innerHTML = message.reduce(
                (total, current) => `${total}<br/>${current}`,
                ''
            );
        } else {
            toastMessage.textContent = message;
        }

        toast.appendChild(toastMessage);
        this.toasts_.push(toast);
        this.body_.appendChild(toast);
        const f = () => {
            toast.style.opacity = 1;
            timer = setInterval(() => {
                if (toast.style.opacity < 0.05) {
                    clearInterval(timer);
                    toast.style.display = 'none';
                    //check element already removed from parent
                    if (toast.parentElement) {
                        RoCode.toast.body_.removeChild(toast);
                    }
                }
                toast.style.opacity *= 0.9;
            }, 20);
        };
        if (!isNotAutoDispose) {
            window.setTimeout(f, 5000);
        }
        return toast;
    }

    isOpen(target) {
        const activated = this.toasts_.filter((toast) => toast.style.display !== 'none');
        if (target) {
            return activated.includes(target);
        }
        return activated.length > 0;
    }
};
