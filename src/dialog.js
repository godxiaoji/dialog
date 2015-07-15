/**
 * Dialog(兼容ie版本)
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.0.2
 */
(function() {
    var html = document.documentElement,
        body = document.body;

    // 事件绑定
    function addEvent(elem, type, fn) {
        if (elem.addEventListener) {
            elem.addEventListener(type, fn, false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + type, function() {
                var event = window.event;

                if (!event.target) {
                    event.target = event.srcElement || document;
                }

                if (!event.preventDefault) {
                    event.preventDefault = function() {
                        this.returnValue = false;
                    };
                }
                if (!event.stopPropagation) {
                    event.stopPropagation = function() {
                        this.cancelBubble = true;
                    };
                }
                fn.call(elem, event);
            });
        }
    }

    // 检查是否存在class
    function hasClass(elem, className) {
        return elem.nodeType === 1 && (" " + elem.className + " ").indexOf(" " + className + " ") >= 0;
    }

    // 查找元素
    function querySelectorAll(selector, parentNode) {
        if (!parentNode) {
            parentNode = document;
        }
        if (parentNode.querySelectorAll) {
            return parentNode.querySelectorAll(selector);
        }
        var rTagClass = /^\.([\w-]+)$/,
            match = rTagClass.exec(selector),
            elems, rets, i;

        if (match && match[1]) {
            elems = parentNode.getElementsByTagName("*");
            for (i = 0; i < elems.length; i++) {
                if (hasClass(elems[i], match[1])) {
                    rets.push(elems[i]);
                }
            }
            return rets;
        }
        return [];
    }

    function querySelector(selector, parentNode) {
        var elems = querySelectorAll(selector, parentNode);
        return elems[0] || null;
    }

    // 获取窗口高
    function getScrollHeight() {
        return Math.max(html.scrollHeight, body.scrollHeight);
    }
    function getScrollTop() {
        return html.scrollTop || body.scrollTop;
    }
    function getClientHeight() {
        return Math.min(html.clientHeight, body.clientHeight);
    }

    function Dialog(config) {
        if (!Dialog.multi) {
            Dialog.clear();
        }
        var d = new Init(config);
        return Dialog.list[d.id] = d;
    }

    Dialog.guid = 0;
    Dialog.multi = false;
    Dialog.list = {};
    Dialog.clear = function() {
        for (var i in Dialog.list) {
            if(Dialog.list.hasOwnProperty(i)) {
                Dialog.list[i].remove();
            }
        }
    };
    Dialog.getDialog = function(config) {
        var d = document.createElement("div");

        d.id = config.id ? config.id : "J_Dialog" + (++Dialog.guid);
        d.className = 'dialog';
        d.style.display = "none";
        d.innerHTML = [
            '<div class="dialog-mask"></div>',
            '<div class="dialog-wrap ' + (config.wrapClass || '') + '" style="opacity: 0">',
            '<div class="dialog-inner">',
            '<div class="dialog-hd"><a class="dialog-x" href="javascript:void(0);" style="' + (config.hideClose ? 'display:none;' : '') + '">×</a><span>' + (config.title != null ? config.title : '提示') + '</span></div>',
            '<div class="dialog-bd">' + (config.content != null ? config.content : '内容') + '</div>',
            '<div class="dialog-ft"><a class="dialog-btn dialog-cancel" href="javascript:void(0);" style="' + (config.cancel != null ? '' : 'display:none;') + '">' + (config.cancelValue != null ? config.cancelValue : '取消') + '</a><a class="dialog-btn dialog-ok" href="javascript:void(0);" style="' + (config.ok != null ? '' : 'display:none;') + '">' + (config.okValue != null ? config.okValue : '确定') + '</a></div>',
            '</div>',
            '</div>'
        ].join("");
        body.appendChild(d);
        return d;
    };

    function Init(config) {
        var self = this,
            d;

        if (typeof config === "string" || typeof config === "number") {
            config = {
                content: config
            };
        } else {
            config = config || {};
        }
        d = Dialog.getDialog(config);
        self.id = d.id;
        self.elem = d;
        self.wrap = querySelector(".dialog-wrap", self.elem);

        // 关闭事件
        var closeEvent = function(e) {
            var noClose = typeof config.cancel === "function" ? config.cancel() : false;
            !noClose && self.remove();
            e.stopPropagation();
            e.preventDefault();
        };

        var maskElem = querySelector(".dialog-mask", self.elem),
            okElem = querySelector(".dialog-ok", self.elem),
            cancelElem = querySelector(".dialog-cancel", self.elem),
            closeElem = querySelector(".dialog-x", self.elem);

        // 绑定事件
        addEvent(okElem, "click", function(e) {
            var noClose = typeof config.ok === "function" ? config.ok() : false;
            !noClose && self.remove();
            e.stopPropagation();
            // 防点透
            e.preventDefault();
        });

        if(window.addEventListener) {
            self.elem.addEventListener("touchmove", function(e) {
                e.preventDefault();
            }, false);
            /* self.elem.querySelector(".dialog-mask").addEventListener("touchmove", function(e) {
                e.preventDefault();
            }, false); */
        }

        addEvent(cancelElem, "click", closeEvent);
        addEvent(closeElem, "click", closeEvent);
        config.quickClose && addEvent(maskElem, "click", closeEvent);
        (config.autoShow !== false) && self.show();
        return this;
    }

    Init.prototype = {
        hide: function() {
            this.elem.style.opacity = 0;
            this.status = "hide";
            var i, showSign = false;
            for (i in Dialog.list) {
                if (Dialog.list[i].status === "show") {
                    showSign = true;
                }
            }
            //html.style.overflow = showSign ? "hidden" : "";
            return this;
        },
        adapt: function() {
            this.wrap.style.top = (getScrollTop() + Math.max((getClientHeight() - this.wrap.offsetHeight) / 2, 0)) + "px";
            this.elem.style.height = getScrollHeight() + "px";
        },
        show: function() {
            this.status = "show";
            //html.style.overflow = "hidden";
            this.elem.style.cssText = [
                "position: absolute",
                "top: 0",
                "left: 0",
                "width: 100%",
                "height: 0"
            ].join(";");
            this.wrap.style.cssText = [
                "position: absolute",
                "top: 0",
                "left: 0",
                "width: 100%"
            ].join(";");
            this.adapt();
            return this;
        },
        remove: function() {
            this.hide();
            this.elem.parentNode.removeChild(this.elem);
            delete Dialog.list[this.id];
            return this;
        }
    };

    // 动态适应
    var resizeTimer;
    addEvent(window, "resize", function(e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            for (var i in Dialog.list) {
                if(Dialog.list.hasOwnProperty(i)) {
                    Dialog.list[i].adapt();
                }
            }
        }, 100);
    });

    window.Dialog = Dialog;
})();