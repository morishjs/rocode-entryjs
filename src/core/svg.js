/**
 * @fileoverview View element constructor
 * @author Kyumin Sim
 * @version 0.2
 */
'use strict';

/**
 * Function for construct html dom element.
 * @function
 * @param {string} tag or html to construct dom element.
 * @param {?object} options include id, classes, parent etc.
 */
RoCode.SVG = function(id, svgDom) {
    const element = svgDom ? svgDom : document.getElementById(id);
    return RoCode.SVG.createElement(element);
};

RoCode.SVG.NS = 'http://www.w3.org/2000/svg';
RoCode.SVG.NS_XLINK = 'http://www.w3.org/1999/xlink';

RoCode.SVG.createElement = function(tag, options) {
    let el;
    if (typeof tag === 'string') {
        el = document.createElementNS(RoCode.SVG.NS, tag);
    } else {
        el = tag;
    }

    if (options) {
        if (options.href) {
            el.setAttributeNS(RoCode.SVG.NS_XLINK, 'href', options.href);
            delete options.href;
        }

        for (const key in options) {
            el.setAttribute(key, options[key]);
        }
    }

    //add util functions
    el.elem = RoCode.SVG.createElement;
    el.prepend = RoCode.SVG.prepend;
    el.attr = RoCode.SVG.attr;
    el.addClass = RoCode.SVG.addClass;
    el.removeClass = RoCode.SVG.removeClass;
    el.hasClass = RoCode.SVG.hasClass;
    el.remove = RoCode.SVG.remove;
    el.removeAttr = RoCode.SVG.removeAttr;

    if (tag === 'text') {
        el.setAttributeNS(
            'http://www.w3.org/XML/1998/namespace',
            'xml:space',
            'preserve'
        );
    }

    if (this instanceof SVGElement) {
        this.appendChild(el);
    }

    return el;
};

RoCode.SVG.prepend = function(tag) {
    let el;
    if (typeof tag === 'string') {
        el = document.createElementNS(RoCode.SVG.NS, tag);
    } else {
        el = tag;
    }
    //add util functions
    el.elem = RoCode.SVG.createElement;
    el.prepend = RoCode.SVG.prepend;
    el.attr = RoCode.SVG.attr;
    el.addClass = RoCode.SVG.addClass;
    el.removeClass = RoCode.SVG.removeClass;
    el.hasClass = RoCode.SVG.hasClass;
    el.remove = RoCode.SVG.remove;
    el.removeAttr = RoCode.SVG.removeAttr;

    if (this instanceof SVGElement) {
        if (this.childNodes.length) {
            this.insertBefore(el, this.childNodes[0]);
        } else {
            this.appendChild(el);
        }
    }
    return el;
};

RoCode.SVG.attr = function(options, property) {
    if (typeof options === 'string') {
        const o = {};
        o[options] = property;
        options = o;
    }

    if (options) {
        if (options.href) {
            this.setAttributeNS(RoCode.SVG.NS_XLINK, 'href', options.href);
            delete options.href;
        }
        for (const key in options) {
            this.setAttribute(key, options[key]);
        }
    }

    return this;
};

RoCode.SVG.addClass = function(...classes) {
    const className = classes.reduce((acc, className) => {
        if (!this.hasClass(className)) {
            acc += ` ${  className}`;
        }
        return acc;
    }, this.getAttribute('class'));
    this.setAttribute('class', className.replace(/\s+/g, ' '));
    return this;
};

RoCode.SVG.removeClass = function(...classes) {
    const className = classes.reduce((acc, className) => {
        if (this.hasClass(className)) {
            acc = acc.replace(
                new RegExp(`(\\s|^)${  className  }(\\s|$)`),
                ' '
            );
        }
        return acc;
    }, this.getAttribute('class'));
    if (className) {
        this.setAttribute('class', className.replace(/\s+/g, ' '));
    }
    return this;
};

RoCode.SVG.hasClass = function(className) {
    const attr = this.getAttribute('class');
    if (!attr) {
        return false;
    } else {
        return attr.match(new RegExp(`(\\s|^)${  className  }(\\s|$)`));
    }
};

RoCode.SVG.remove = function() {
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
};

RoCode.SVG.removeAttr = function(attrName) {
    this.removeAttribute(attrName);
};
