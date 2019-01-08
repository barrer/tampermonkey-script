// ==UserScript==
// @name         划词翻译：有道词典，金山词霸，谷歌翻译
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  划词翻译调用“有道词典（有道翻译）、金山词霸、谷歌翻译”
// @author       https://github.com/barrer
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @run-at document-end
// @connect      dict.youdao.com
// @connect      open.iciba.com
// @connect      translate.google.cn
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    /**样式*/
    var style = document.createElement('style');
    style.textContent = `
    * {
        word-wrap: break-word !important
    }
    
    img {
        cursor: pointer;
        display: inline-block;
        width: 22px;
        height: 22px;
        border: 1px solid #dfe1e5;
        border-radius: 22px;
        background-color: rgba(255, 255, 255, 1);
        padding: 2px;
        margin: 0;
        margin-right: 5px;
        box-sizing: content-box;
        vertical-align: middle;
    }
    
    img:last-of-type {
        margin-right: auto;
    }
    
    img[activate],
    img:hover {
        border: 1px solid #c6c6c6;
        -webkit-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
        box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    tr-icon {
        display: none;
        position: absolute;
        padding: 1px;
        margin: 0;
        cursor: move;
        box-sizing: content-box;
        font-size: 13px;
        text-align: left;
        border: 0;
        color: black;
        z-index: 2147483647;
        background: #fff;
        border-radius: 2px;
        -webkit-box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
        box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
    }
    
    tr-audio {
        display: block;
    }
    
    tr-audio a {
        color: #36f;
        text-decoration: none;
        cursor: pointer;
        margin-right: 10px;
    }
    
    tr-audio a:last-of-type {
        margin-right: auto;
    }
    
    tr-audio a:hover {
        text-decoration: underline;
    }
    
    tr-content {
        display: block;
        max-width: 400px;
        max-height: 200px;
        overflow: auto;
        background: white;
        padding: 2px 8px;
        margin-top: 5px;
        box-sizing: content-box;
        font-family: "Helvetica Neue", "Helvetica", "Arial", "sans-serif";
        font-size: 14px;
        line-height: 18px;
    }
    
    #google .sentences,
    #google .trans,
    #google .orig,
    #google .dict,
    #google .pos,
    #none {
        display: block;
    }
    
    #google .backend,
    #google .entry,
    #google .base_form,
    #google .pos_enum,
    #google .src,
    #google .confidence,
    #google .ld_result,
    #none {
        display: none;
    }
    
    #google .orig {
        font-style: italic;
        color: #777;
    }
    
    #google .pos {
        margin-top: 1em;
    }
    
    #google .pos:before {
        content: "[";
    }
    
    #google .pos:after {
        content: "]";
    }
    
    #google .terms:before {
        content: "【";
    }
    
    #google .terms:after {
        content: "】";
    }
    
    #google .terms {
        margin-right: .2em;
    }
    
    #youdao .phone {
        color: #777;
    }
    
    #youdao .phone:before {
        content: "[";
    }
    
    #youdao .phone:after {
        content: "]";
    }
    
    #youdao .phrs:before {
        content: "[短语]";
        display: block;
    }
    
    #youdao .trs>.tr>.exam:before {
        content: "[例句]";
        display: block;
    }
    
    #youdao .trs>.tr>.l:before {
        content: "[释义]";
        display: block;
    }
    
    #youdao [class="#text"] {
        font-style: italic;
    }
    
    #youdao .return-phrase,
    #youdao [class="@action"],
    #none {
        display: none;
    }
    `;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = URL.createObjectURL(new Blob([style.textContent], {
        type: 'text/css;charset=UTF-8'
    }));
    // 图标数组
    var iconArray = [{
        name: '金山词霸',
        id: 'iciba',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEX////1AUv2DlT1A0z5ZpP2EVb/+fv2JGT1DFP+7/T//f7+4uv/9vn2HV/+6/H+5u32Gl3//P34ToH1CVH3LGn91eH8q8T4VYb2FVn6hqr/+/z5Y5D8p8H3Pnb4RHr4QXj3MW3+6e/5aZT1B0/3PXX6fqP5c5v7o776g6f4TID7n7v3KWf6iaz7lrX7jK78rMT9ztz2GFv9yNj1BE3+8fX4V4j3NG/4Rnz1BU7/8/f9w9X/+vv5a5b/9/n5Xo3+2+b8rsb8tsv8ssn9ytr8qcL+7fL90t/5W4v2HF79wtT3Kmj9xtf4UIP8vdD/9fj+2uX92OP8qsP+3+j/+Pr+4er+7vP2IWL+8vb+3ef5cJn8v9L7krL4WIj3OXL5bpj7nbr5bJf3L2v6gKX7mLb7k7P4SX78uM34U4X8t8z2ImL8u8/3N3H2IGH9wNP6dp76eJ/5cZr2H2D6iKv+5Oz/9Pf5apX6f6T+5+790+D91+P6eqD8tMr7j7D7m7j9zNv5Yo8kSjR+AAAAAXRSTlMAQObYZgAAA+lJREFUeF7t2mXP6koYheG1iru/7u7u7m7b3f24u/z1k+wEAnSGaUuB82GuP/DcaQaeoQGOaZo2SbGTbdTF1yuNnX+7pbHzD8cbOz860Nj5qTTFOuo0/5gSxhzqoZ1Sxj5qLvUvKzDm6vP85YxL1NTmBRUye6ih0ACVPH+jZiJZWjGIGplL0prFK9RCR4ZWLUXgutQfFBJXtVzCZfEuCp1ceyniaYWrzmOy9SP9ZljuhWvCrZWuH/40hWY/wiWJLooFHgIVCrixCjfcaqHYeASoXHD/FFU7fEqJpTjy/B8o4Q2hOjuzlOhasLQjZw9QhcQHyjT7UWKIMt2/waHwpEGZoTDKTFBm/vkhnJhbooznLcwO+inj+yEKu+JeD2WCexA59VEq9qYNdvinfJT66ghi2+OUC4zZSGj6RLmBXsgsjLKCwJsoLHn8jBV4/aqdKZdsvQelmWVW0K+6cO34WEnw5xvF+AtWEpuDyvYrVra80+Z0PJfjUIv2USE5+BAi54rxnpEwLJn2UaXzxQOUed+t6r6EVZFOKmWap6Mo8A/3UGE0DuvCUxmqnaXyK7c1SYX+J7Ant0Sl6Xxulg2RRt57NkLwLgq22ABTKMBhC+uupw1FOlgzBoU8+yiRptjWBqvU2zdPgecoFRGGBr7Aa1YJyI3SJLlg4d3vyrdXqD5AvOAPYDLAMp05wKUAYK90Ry7DLLfCYrPDgIsBCHecsSBzDYHiy8z8yxBcCzAn/AKRq0/M6z4CXA8AwtM9JMnAJoR287feJsC9AMHS/wiJZpIMjkRRuwBgv3kRMgmDnvYEUNMAIAypt11HKLMZEupjudaQGOwIw6pHLPcXXKIDdIAO0AFjrKUxKOkAHaADdIAO0AE6wB8qcys27PCHyajxujdUyg+7Is1kcMbRhWSYZOxFG6qxPhEkyWTEQcBdH0ly/ADOXZ7xM756YDsg3J1P69mFM4ljFqRTdgMmWMDOU9jXNmWwyDc2A2b6WezdDGxay7LUmK2A1QDLLN7Aht4tlutfsxPQTpP5PlgWjdFs9kfrAR2KPaD0p4dmX96xGnAdpNl3sGOKAu0WA+700Kwr5cLfFietBbykWeAQ9vg7SeFBVAc00czIwa74feFBVAfcBGni2YN9OUN4EFUBP2VpNgITpx+FIVXAMc2ewpkJmnjvKQKmRY8tCocWWSp7rj6ETQGW+f5XOLWaZZHMxDrUAVh/28JixhGc2/axYPS21V2wOhhkgWcX1djLH8STJjvbMOGdzwc8gV2i1/WeRws27wO/X/CzDVQrTXLpHwd3wrVnJN+lYBHr7bEO0AE6QAfoAB2gA/C/oGnaf/DSo5D7etMMAAAAAElFTkSuQmCC',
        trigger: function (text) {
            ajax('http://open.iciba.com/huaci_v3/dict.php?word=' + text, function (rst) {
                var html = parseIciba(rst);
                if (text.toLowerCase() != text) { // 再次翻译一遍小写的
                    ajax('http://open.iciba.com/huaci_v3/dict.php?word=' + text.toLowerCase(), function (rst) {
                        var reHtml = parseIciba(rst);
                        if (html !== reHtml) {
                            log(html, reHtml);
                            html += '<hr>' + reHtml;
                        }
                        showContent(html);
                    }, function (rst) {
                        showContent(html + '<hr>' + 'error: 无法连接翻译服务');
                    });
                } else {
                    showContent(html);
                }
            }, function (rst) {
                showContent('error: 无法连接翻译服务');
            });
        }
    }, {
        name: '有道词典',
        id: 'youdao',
        image: 'data:image/png;base64,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',
        trigger: function (text) {
            ajax('http://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=' + text, function (rst) {
                var html = parseYoudao(rst);
                if (text.toLowerCase() != text) { // 再次翻译一遍小写的
                    ajax('http://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=' + text.toLowerCase(), function (rst) {
                        var reHtml = parseYoudao(rst);
                        if (html !== reHtml) {
                            log(html, reHtml);
                            html += '<hr>' + reHtml;
                        }
                        showContent(html);
                    }, function (rst) {
                        showContent(html + '<hr>' + 'error: 无法连接翻译服务');
                    });
                } else {
                    showContent(html);
                }
            }, function (rst) {
                showContent('error: 无法连接翻译服务');
            });
        }
    }, {
        name: '谷歌翻译',
        id: 'google',
        image: 'data:image/png;base64,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',
        trigger: function (text) {
            var url = 'https://translate.google.cn/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto&tl=';
            if (hasChineseByRange(text))
                url += 'en&q=' + text;
            else
                url += 'zh-CN&q=' + text;
            ajax(url, function (rst) {
                var html = parseGoogle(rst);
                showContent(html);
            }, function (rst) {
                showContent('error: 无法连接翻译服务');
            });
        }
    }];
    // 翻译图标、内容面板、当前选中文本、当前翻译引擎
    var icon = document.createElement('tr-icon'),
        content = document.createElement('tr-content'),
        selected,
        engineId;
    // 绑定图标拖动事件
    var iconDrag = new Drag(icon);
    iconArray.forEach(function (obj) {
        var img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.setAttribute('id', obj.id);
        img.addEventListener('mouseup', function () {
            if (iconDrag.elementOriginalLeft == parseInt(icon.style.left) &&
                iconDrag.elementOriginalTop == parseInt(icon.style.top)) { // 没有拖动鼠标抬起的时候触发点击事件
                engineId = obj.id; // 翻译引擎 ID
                engineActivateShow(); // 显示翻译引擎指示器
                obj.trigger(selected); // 启动翻译引擎
            }
        });
        icon.appendChild(img);
    });
    icon.appendChild(content); // 内容面板放图标后面
    // 添加翻译图标到 DOM
    var root = document.createElement('div');
    document.documentElement.appendChild(root);
    var shadow = root.attachShadow({
        mode: 'open'
    });
    // 多种方式最大化兼容：Content Security Policy
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    shadow.appendChild(style); // 内部样式表
    shadow.appendChild(link); // 外部样式表
    // 翻译图标加入 Shadow
    shadow.appendChild(icon);
    // 鼠标事件：防止选中的文本消失
    document.addEventListener('mousedown', function (e) {
        log('mousedown event:', e);
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', function (e) {
        log('mouseup event:', e);
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
            return;
        }
        selected = window.getSelection().toString().trim(); // 当前选中文本
        log('click text:' + selected);
        if (selected && icon.style.display == 'none') {
            log('show icon');
            log(selected + ' | ' + e.pageX + ' | ' + e.pageY);
            icon.style.top = e.pageY + 10 + 'px';
            icon.style.left = e.pageX + 10 + 'px';
            icon.style.display = 'block';
            // 兼容部分 Content Security Policy
            icon.style.position = 'absolute';
            icon.style.zIndex = '2147483647';
        } else if (!selected) {
            log('hide icon');
            icon.style.display = 'none';
            content.style.display = 'none';
            engineActivateHide();
            // 强制设置鼠标拖动事件结束，防止由于网页本身的其它鼠标事件冲突而导致没有侦测到：mouseup
            iconDrag.dragging = false;
            iconDrag.unsetMouseMove();
        }
    });
    // 选中变化事件：当点击已经选中的文本的时候，隐藏翻译图标和翻译面板（此时浏览器动作是：选中的文本已经取消选中了）
    document.addEventListener("selectionchange", function (e) {
        log('selectionchange event:', e);
        log('selectionchange:' + window.getSelection().toString());
        if (!window.getSelection().toString().trim()) {
            icon.style.display = 'none';
            content.style.display = 'none';
            engineActivateHide();
        }
    });
    /**日志输出*/
    function log() {
        var debug = false;
        if (!debug)
            return;
        if (arguments) {
            for (var i = 0; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
        }
    }
    /**鼠标拖动*/
    function Drag(element) {
        this.dragging = false;
        this.mouseDownPositionX = 0;
        this.mouseDownPositionY = 0;
        this.elementOriginalLeft = 0;
        this.elementOriginalTop = 0;
        var ref = this;
        this.startDrag = function (e) {
            e.preventDefault();
            ref.dragging = true;
            ref.mouseDownPositionX = e.clientX;
            ref.mouseDownPositionY = e.clientY;
            ref.elementOriginalLeft = parseInt(element.style.left);
            ref.elementOriginalTop = parseInt(element.style.top);
            // set mousemove event
            window.addEventListener('mousemove', ref.dragElement);
            log('startDrag');
        };
        this.unsetMouseMove = function () {
            // unset mousemove event
            window.removeEventListener('mousemove', ref.dragElement);
        };
        this.stopDrag = function (e) {
            e.preventDefault();
            ref.dragging = false;
            ref.unsetMouseMove();
            log('stopDrag');
        };
        this.dragElement = function (e) {
            log('dragging');
            if (!ref.dragging)
                return;
            e.preventDefault();
            // move element
            element.style.left = ref.elementOriginalLeft + (e.clientX - ref.mouseDownPositionX) + 'px';
            element.style.top = ref.elementOriginalTop + (e.clientY - ref.mouseDownPositionY) + 'px';
            log('dragElement');
        };
        element.onmousedown = this.startDrag;
        element.onmouseup = this.stopDrag;
    }
    /**是否包含汉字*/
    function hasChineseByRange(str) {
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) >= 0x4E00 && str.charCodeAt(i) <= 0x9FBF) {
                return true;
            }
        }
        return false;
    }
    /**对象转 xml*/
    function objToXml(obj) {
        var xml = '';
        for (var prop in obj) {
            if (typeof obj[prop] === 'function') {
                continue;
            }
            xml += obj[prop] instanceof Array ? '' : '<' + prop + '>';
            if (obj[prop] instanceof Array) {
                for (var array in obj[prop]) {
                    if (typeof obj[prop][array] === 'function') {
                        continue;
                    }
                    xml += '<' + prop + '>';
                    xml += objToXml(new Object(obj[prop][array]));
                    xml += '</' + prop + '>';
                }
            } else if (typeof obj[prop] == 'object') {
                xml += objToXml(new Object(obj[prop]));
            } else {
                xml += obj[prop];
            }
            xml += obj[prop] instanceof Array ? '' : '</' + prop + '>';
        }
        var xml = xml.replace(/<\/?[0-9]{1,}>/g, '');
        return xml
    }
    /**xml 转 html*/
    function xmlToHtml(xml, tag) {
        return xml.replace(/<([^/]+?)>/g, '<' + tag + ' class="$1">')
            .replace(/<\/(.+?)>/g, '</' + tag + '>');
    }
    /**ajax 跨域访问公共方法*/
    function ajax(url, success, error, obj) {
        if (!!!obj)
            obj = {};
        if (!!!obj.method)
            obj.method = 'GET';
        // >>>因为Tampermonkey跨域访问(a.com)时会自动携带对应域名(a.com)的对应cookie
        // 不会携带当前域名的cookie
        // 所以，GM_xmlhttpRequest【不存在】cookie跨域访问安全性问题
        // 以下设置默认headers不起作用<<<
        if (!!!obj.headers)
            obj.headers = {
                'cookie': ''
            };
        GM_xmlhttpRequest({
            method: obj.method,
            url: url,
            headers: obj.headers,
            responseType: obj.responseType,
            data: obj.data,
            onload: function (res) {
                success(res.responseText, res, obj);
            },
            onerror: function (res) {
                error(res.responseText, res, obj);
            }
        });
    }
    /**显示内容面板*/
    function showContent(html) {
        // 发音
        var audio = document.createElement('tr-audio'),
            us = document.createElement('a'),
            uk = document.createElement('a');

        us.innerHTML = '♪US';
        us.setAttribute('href', 'javascript:void(0)');
        us.addEventListener('click', playUS);
        // us.addEventListener('mouseover', playUS);
        uk.innerHTML = '♪UK';
        uk.setAttribute('href', 'javascript:void(0)');
        uk.addEventListener('click', playUK);
        // uk.addEventListener('mouseover', playUK);
        audio.appendChild(us);
        audio.appendChild(uk);
        // 翻译内容
        content.innerHTML = '<div id="' + engineId + '">' + html + '</div>';
        if (engineId != 'google') { // 谷歌翻译不显示发音图标
            content.insertBefore(audio, content.childNodes[0]);
        }
        content.style.display = 'block';
    }
    /**隐藏翻译引擎指示器*/
    function engineActivateHide() {
        icon.querySelectorAll('img[activate]').forEach(function (ele) {
            ele.removeAttribute('activate');
        });
    }
    /**显示翻译引擎指示器*/
    function engineActivateShow() {
        engineActivateHide();
        icon.querySelector('img#' + engineId).setAttribute('activate', 'activate');
    }
    /**美式发音*/
    function playUS() {
        var url = 'http://dict.youdao.com/dictvoice?audio=' + selected + '&type=2';
        var audio = new Audio();
        ajax(url, function (rst, res) {
            audio.src = URL.createObjectURL(res.response);
            audio.play();
        }, function (rst) {
            log(rst);
        }, {
            responseType: 'blob'
        });
    }
    /**英式发音*/
    function playUK() {
        var url = 'http://dict.youdao.com/dictvoice?audio=' + selected + '&type=1';
        var audio = new Audio();
        ajax(url, function (rst, res) {
            audio.src = URL.createObjectURL(res.response);
            audio.play();
        }, function (rst) {
            log(rst);
        }, {
            responseType: 'blob'
        });
    }
    /**有道词典排版*/
    function parseYoudao(rst) {
        try {
            // if (true) return xmlToHtml(objToXml(JSON.parse(rst)), 'span');
            var rstJson = JSON.parse(rst),
                html = '',
                phoneStyle = 'color:#777;';
            if (rstJson.ec) {
                var word = rstJson.ec.word[0],
                    tr = '';
                var trs = word.trs,
                    ukphone = word.ukphone,
                    usphone = word.usphone,
                    phone = word.phone,
                    returnPhrase = word['return-phrase'];
                if (returnPhrase && returnPhrase.l && returnPhrase.l.i) {
                    html += '<div>' + returnPhrase.l.i + '</div>';
                }
                html += '<div>';
                if (ukphone && ukphone.length != 0) {
                    html += '<span style="' + phoneStyle + '">[英] [' + ukphone + '] </span>';
                }
                if (usphone && usphone.length != 0) {
                    html += '<span style="' + phoneStyle + '">[美] [' + usphone + '] </span>';
                }
                html += '</div>';
                if (phone && phone.length != 0) {
                    html += '<div style="' + phoneStyle + '">[' + phone + '] </div>';
                }
                trs.forEach(element => {
                    tr += '<div>' + element.tr[0].l.i[0] + '</div>';
                });
                html += tr;
            }
            // 中英翻译
            if (rstJson.ce_new && rstJson.ce_new.word) {
                html += '<div>' +
                    '《新汉英大辞典》<br>' + xmlToHtml(objToXml(rstJson.ce_new.word), 'div') +
                    '</div>';
            }
            // 中文翻译
            if (rstJson.hh && rstJson.hh.word) {
                html += '<div>' +
                    '《现代汉语大词典》<br>' + xmlToHtml(objToXml(rstJson.hh.word), 'span') +
                    '</div>';
            }
            // 长句翻译
            if (rstJson.fanyi && rstJson.fanyi.tran) {
                html += rstJson.fanyi.tran;
            }
            return html;
        } catch (error) {
            log(error);
            return error;
        }
    }
    /**金山词霸排版*/
    function parseIciba(rst) {
        try {
            rst = rst.replace(/class=\\"icIBahyI-prons\\"/g, '__mystyle__') // 音标
                .replace(/\\"/g, '"') // 引号
                // A标签
                .replace(/<a([^>]*)?>详细释义<\/a([^>]*)?>/g, '')
                .replace(/<a([^>]*)?>/g, '')
                .replace(/<\/a([^>]*)?>/g, '')
                // 清理属性、标签、多余空格
                .replace(/(?:class|id|style|xml:lang|lang)=\"([^"]*)\"/g, '')
                .replace(/(?:label>|strong>)/g, 'span>')
                .replace(/(?:<label|<strong)/g, '<span')
                .replace(/(?:p>)/g, 'div>')
                .replace(/[ ]+/g, ' ')
                // 音标
                .replace(/__mystyle__/g, ' style="color:#777;"');
            var match = /dict.innerHTML='(.*)?';/g.exec(rst);
            return match[1];
        } catch (error) {
            log(error);
            return error;
        }
    }
    /**谷歌翻译排版*/
    function parseGoogle(rst) {
        try {
            return xmlToHtml(objToXml(JSON.parse(rst)), 'span');
        } catch (error) {
            log(error);
            return error;
        }
    }
})();