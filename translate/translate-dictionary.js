// ==UserScript==
// @name         划词翻译：有道词典，金山词霸
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  划词翻译调用“有道词典（有道翻译）、金山词霸”
// @author       https://github.com/barrer
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @run-at document-end
// @connect      dict.youdao.com
// @connect      open.iciba.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    var iconArray = [{
        name: '金山词霸',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEX////1AUv2DlT1A0z5ZpP2EVb/+fv2JGT1DFP+7/T//f7+4uv/9vn2HV/+6/H+5u32Gl3//P34ToH1CVH3LGn91eH8q8T4VYb2FVn6hqr/+/z5Y5D8p8H3Pnb4RHr4QXj3MW3+6e/5aZT1B0/3PXX6fqP5c5v7o776g6f4TID7n7v3KWf6iaz7lrX7jK78rMT9ztz2GFv9yNj1BE3+8fX4V4j3NG/4Rnz1BU7/8/f9w9X/+vv5a5b/9/n5Xo3+2+b8rsb8tsv8ssn9ytr8qcL+7fL90t/5W4v2HF79wtT3Kmj9xtf4UIP8vdD/9fj+2uX92OP8qsP+3+j/+Pr+4er+7vP2IWL+8vb+3ef5cJn8v9L7krL4WIj3OXL5bpj7nbr5bJf3L2v6gKX7mLb7k7P4SX78uM34U4X8t8z2ImL8u8/3N3H2IGH9wNP6dp76eJ/5cZr2H2D6iKv+5Oz/9Pf5apX6f6T+5+790+D91+P6eqD8tMr7j7D7m7j9zNv5Yo8kSjR+AAAAAXRSTlMAQObYZgAAA+lJREFUeF7t2mXP6koYheG1iru/7u7u7m7b3f24u/z1k+wEAnSGaUuB82GuP/DcaQaeoQGOaZo2SbGTbdTF1yuNnX+7pbHzD8cbOz860Nj5qTTFOuo0/5gSxhzqoZ1Sxj5qLvUvKzDm6vP85YxL1NTmBRUye6ih0ACVPH+jZiJZWjGIGplL0prFK9RCR4ZWLUXgutQfFBJXtVzCZfEuCp1ceyniaYWrzmOy9SP9ZljuhWvCrZWuH/40hWY/wiWJLooFHgIVCrixCjfcaqHYeASoXHD/FFU7fEqJpTjy/B8o4Q2hOjuzlOhasLQjZw9QhcQHyjT7UWKIMt2/waHwpEGZoTDKTFBm/vkhnJhbooznLcwO+inj+yEKu+JeD2WCexA59VEq9qYNdvinfJT66ghi2+OUC4zZSGj6RLmBXsgsjLKCwJsoLHn8jBV4/aqdKZdsvQelmWVW0K+6cO34WEnw5xvF+AtWEpuDyvYrVra80+Z0PJfjUIv2USE5+BAi54rxnpEwLJn2UaXzxQOUed+t6r6EVZFOKmWap6Mo8A/3UGE0DuvCUxmqnaXyK7c1SYX+J7Ant0Sl6Xxulg2RRt57NkLwLgq22ABTKMBhC+uupw1FOlgzBoU8+yiRptjWBqvU2zdPgecoFRGGBr7Aa1YJyI3SJLlg4d3vyrdXqD5AvOAPYDLAMp05wKUAYK90Ry7DLLfCYrPDgIsBCHecsSBzDYHiy8z8yxBcCzAn/AKRq0/M6z4CXA8AwtM9JMnAJoR287feJsC9AMHS/wiJZpIMjkRRuwBgv3kRMgmDnvYEUNMAIAypt11HKLMZEupjudaQGOwIw6pHLPcXXKIDdIAO0AFjrKUxKOkAHaADdIAO0AE6wB8qcys27PCHyajxujdUyg+7Is1kcMbRhWSYZOxFG6qxPhEkyWTEQcBdH0ly/ADOXZ7xM756YDsg3J1P69mFM4ljFqRTdgMmWMDOU9jXNmWwyDc2A2b6WezdDGxay7LUmK2A1QDLLN7Aht4tlutfsxPQTpP5PlgWjdFs9kfrAR2KPaD0p4dmX96xGnAdpNl3sGOKAu0WA+700Kwr5cLfFietBbykWeAQ9vg7SeFBVAc00czIwa74feFBVAfcBGni2YN9OUN4EFUBP2VpNgITpx+FIVXAMc2ewpkJmnjvKQKmRY8tCocWWSp7rj6ETQGW+f5XOLWaZZHMxDrUAVh/28JixhGc2/axYPS21V2wOhhkgWcX1djLH8STJjvbMOGdzwc8gV2i1/WeRws27wO/X/CzDVQrTXLpHwd3wrVnJN+lYBHr7bEO0AE6QAfoAB2gA/C/oGnaf/DSo5D7etMMAAAAAElFTkSuQmCC',
        host: ['www.iciba.com'],
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
    }];
    // 翻译图标、内容面板
    var icon = document.createElement('div'),
        content = document.createElement('div');
    // 绑定图标拖动事件
    var iconDrag = new Drag(icon);
    iconArray.forEach(function (obj) {
        var img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.addEventListener('mouseup', function () {
            if (iconDrag.elementOriginalLeft == parseInt(icon.style.left) &&
                iconDrag.elementOriginalTop == parseInt(icon.style.top)) // 没有拖动鼠标抬起的时候触发点击事件
                obj.trigger(window.getSelection().toString().trim()); // 启动翻译引擎
        });
        img.setAttribute('style', '' +
            'cursor:pointer!important;' +
            'display:inline-block!important;' +
            'width:22px!important;' +
            'height:22px!important;' +
            'border:1px solid #FFCC66!important;' +
            'border-radius:22px!important;' +
            'background-color:rgba(255,255,255,1)!important;' +
            'padding:2px!important;' +
            'margin:0!important;' +
            'margin-right:5px!important;' +
            'box-sizing:content-box!important;' +
            'vertical-align:middle!important;' +
            '');
        icon.appendChild(img);
    });
    icon.appendChild(content); // 内容放图标后面
    icon.setAttribute('style', '' +
        'display:none!important;' +
        'position:absolute!important;' +
        'padding:0!important;' +
        'margin:0!important;' +
        'box-sizing:content-box!important;' +
        'font-size:13px!important;' +
        'text-align:left!important;' +
        'border:0!important;' +
        'background:transparent!important;' +
        'z-index:2147483647!important;' +
        '');
    content.setAttribute('style', '' +
        'border: 1px solid #FFCC66!important;' +
        'background: white!important;' +
        'border-radius: 3px!important;' +
        'padding: 2px 8px!important;' +
        'margin-top:5px!important;' +
        'box-sizing:content-box!important;' +
        'font-family:"Helvetica Neue","Helvetica","Arial","sans-serif"!important;' +
        'font-size:14px!important;' +
        'line-height:18px!important;' +
        '');
    // 添加翻译图标到 DOM
    document.documentElement.appendChild(icon);
    // 鼠标事件：防止选中的文本消失
    document.addEventListener('mousedown', function (e) {
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
        }
    });
    // 选中变化事件：当点击已经选中的文本的时候，隐藏翻译图标和翻译面板（此时浏览器动作是：选中的文本已经取消选中了）
    document.addEventListener("selectionchange", function () {
        log('selectionchange:' + window.getSelection().toString());
        if (!window.getSelection().toString().trim()) {
            icon.style.display = 'none';
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', function (e) {
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
            return;
        }
        var text = window.getSelection().toString().trim();
        log('click text:' + text);
        log(e);
        if (text && icon.style.display == 'none') {
            log('show icon');
            log(text + ' | ' + e.pageX + ' | ' + e.pageY);
            icon.style.top = e.pageY + 10 + 'px';
            icon.style.left = e.pageX + 10 + 'px';
            content.style.display = 'none'; // 内容先隐藏，因为还没有点击翻译引擎
            icon.style.display = 'block';
        } else if (!text) {
            log('hide icon');
            icon.style.display = 'none';
            // 强制设置鼠标拖动事件结束，防止由于网页本身的其它鼠标事件冲突而导致没有侦测到：mouseup
            iconDrag.dragging = false;
            iconDrag.unsetMouseMove();
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

    /**ajax 跨域访问公共方法*/
    function ajax(url, success, error, element, method, data, headers) {
        if (!!!method)
            method = 'GET';
        // >>>因为Tampermonkey跨域访问(a.com)时会自动携带对应域名(a.com)的对应cookie
        // 不会携带当前域名的cookie
        // 所以，GM_xmlhttpRequest【不存在】cookie跨域访问安全性问题
        // 以下设置默认headers不起作用<<<
        if (!!!headers)
            headers = {
                'cookie': ''
            };
        GM_xmlhttpRequest({
            method: method,
            url: url,
            headers: headers,
            data: data,
            onload: function (res) {
                success(res.responseText, element);
            },
            onerror: function (res) {
                error(res.responseText, element);
            }
        });
    }
    /**显示内容面板*/
    function showContent(html) {
        content.innerHTML = html;
        content.style.display = 'block';
    }
    /**有道词典排版*/
    function parseYoudao(rst) {
        try {
            var rstJson = JSON.parse(rst),
                html = '';
            if (rstJson.ec) {
                var word = rstJson.ec.word[0],
                    tr = '';
                var trs = word.trs,
                    ukphone = word.ukphone,
                    usphone = word.usphone,
                    phone = word.phone;
                var phoneStyle = 'color:#777!important;';
                if (ukphone && ukphone.length != 0) {
                    html += '<span style="' + phoneStyle + '">英[' + ukphone + '] </span>';
                }
                if (usphone && usphone.length != 0) {
                    html += '<span style="' + phoneStyle + '">美[' + usphone + '] </span>';
                }
                if (html.length != 0) {
                    html += '<br>';
                } else if (phone && phone.length != 0) {
                    html += '<span style="' + phoneStyle + '">[' + phone + '] </span><br>';
                }
                trs.forEach(element => {
                    tr += element.tr[0].l.i[0] + '<br>';
                });
                html += tr;
            }
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
        rst = rst.replace(/\\"/g, '"')
            .replace(/<a.*?<\/a>/g, '')
            .replace(/(?:class|id|style|xml:lang|lang)=\"([^"]*)\"/g, '')
            .replace(/(?:label>|strong>)/g, 'span>')
            .replace(/(?:<label|<strong)/g, '<span')
            .replace(/(?:p>)/g, 'div>')
            .replace(/[ ]+/g, ' ');
        var match = /dict.innerHTML='(.*)?';/g.exec(rst);
        return match[1];
    }
})();