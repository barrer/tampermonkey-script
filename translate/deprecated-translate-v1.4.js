// ==UserScript==
// @name         Translate
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  划词翻译调用“必应翻译（必应词典）、谷歌翻译、有道词典（有道翻译）、百度翻译”网页翻译
// @author       barrer
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @run-at document-end
// @connect      dict.youdao.com
// @connect      cn.bing.com
// @connect      translate.googleapis.com
// @connect      fanyi.baidu.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
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

    log('url:' + window.location.href);
    // 翻译图标
    var icon = document.createElement('div'), style = '' +
        'font-family:Arial,sans-serif!important;' +
        'font-weight:normal!important;' +
        'background:#f60!important;' +
        'color:#fff!important;' +
        'border-radius:3px!important;' +
        'font-size:13px!important;' +
        'line-height:100%!important;' +
        'padding:2px 4px!important;' +
        'margin:0 4px!important;' +
        'display:inline-block!important;' +
        'text-decoration:none!important;' +
        '';
    icon.innerHTML = '' +
        '<a href="javascript:void(0)" style="' + style + '"  type="bing">必应</a>' +
        '<a href="javascript:void(0)" style="' + style + '"  type="google">谷歌</a>' +
        '<a href="javascript:void(0)" style="' + style + '" type="youdao">有道</a>' +
        '<a href="javascript:void(0)" style="' + style + '"  type="baidu_translator">百度</a>' +
        '';
    icon.setAttribute('style', '' +
        'display:none!important;' +
        'position:absolute!important;' +
        'font-size:13px!important;' +
        'text-align:left!important;' +
        'z-index:2147483647!important;' +
        '');
    // 添加翻译图标到 DOM
    document.documentElement.appendChild(icon);
    // 鼠标事件：防止选中的文本消失
    document.addEventListener('mousedown', function (e) {
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) {// 点击了翻译图标
            e.preventDefault();
        }
    });
    // 选中变化事件：当点击已经选中的文本的时候，隐藏翻译图标和翻译面板（此时浏览器动作是：选中的文本已经取消选中了）
    document.addEventListener("selectionchange", function () {
        log('selectionchange:' + window.getSelection().toString());
        if (!window.getSelection().toString().trim()) {
            icon.style.display = 'none';
            server.containerDestroy();
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', function (e) {
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) {// 点击了翻译图标
            e.preventDefault();
            return;
        }
        for (var i = 0; i < server.rendered.length; i++) {// 点击了翻译内容面板
            if (e.target == server.rendered[i])
                return;// 不再创建翻译图标
        }
        var text = window.getSelection().toString().trim();
        log('text:' + text);
        if (text && icon.style.display == 'none') {
            log('show icon');
            log(text + '|' + e.pageX + '|' + e.pageY);
            icon.style.top = e.pageY + 10 + 'px';
            icon.style.left = e.pageX + 10 + 'px';
            icon.style.display = 'block';
        } else if (!text) {
            log('hide icon');
            icon.style.display = 'none';
            server.containerDestroy();// 销毁翻译内容面板
        }
    });
    // 翻译图标点击事件
    icon.addEventListener('click', function (e) {
        var text = window.getSelection().toString().trim();
        if (text) {
            log('click:' + text);
            server.containerDestroy();// 销毁翻译内容面板
            // 新建翻译内容面板
            var container = server.container();
            container.style.top = e.pageY + 16 + 'px';
            if (e.pageX + 250 + 16 <= document.body.clientWidth)// container 面板css最大宽度为250px
                container.style.left = e.pageX + 16 + 'px';
            else
                container.style.left = document.body.clientWidth - 250 + 'px';
            document.body.appendChild(container);
            server.rendered.push(container);
            // 判断用户选择的翻译引擎
            var engine = e.target.hasAttribute('type') ? e.target.getAttribute('type') : '';
            log('engine:' + engine);
            switch (engine) {
                case 'bing':
                    server.bing(text, container);
                    break;
                case 'google':
                    server.google(text, container);
                    break;
                case 'baidu_translator':
                    server.baidu_translator(text, container);
                    break;
                default:
                    server.youdao(text, container);
            }
        }
    });
    // 翻译server
    var server = {
        // 存放已经生成的翻译内容面板（销毁的时候用）
        rendered: [],
        // 有道翻译 引擎
        youdao: function (text, element) {
            this.ajax('http://dict.youdao.com/w/eng/' + encodeURIComponent(text), function (rst, ele) {
                var parser = new DOMParser(), doc = parser.parseFromString(rst, 'text/html'), html = '';
                var word = doc.querySelector('#phrsListTab .wordbook-js .keyword'),
                    pronounce = doc.querySelector('#phrsListTab .wordbook-js .baav'),
                    trans = doc.querySelector('#phrsListTab .trans-container'),
                    webTrans = doc.querySelectorAll('#tWebTrans .wt-container .title');
                if (!!!pronounce) // 中文拼音
                    pronounce = doc.querySelector('#phrsListTab .wordbook-js .phonetic');
                // 排版
                var pos = trans && trans.querySelectorAll('ul li,ul .wordGroup');
                for (var i = 0; pos && i < pos.length; i++) {
                    pos[i].innerHTML = pos[i].innerHTML + '▓';
                }
                html += word ? word.innerText.trim() : '';
                html += pronounce ? ' ' + pronounce.innerText.replace(/(\s)+/g, ' ').trim() : '';
                html += trans && trans.querySelector('ul') ? '\n' +
                    trans.querySelector('ul').innerText
                        .replace(/(\s)+/g, ' ')
                        .replace(/(▓)+/g, '\n').trim()
                    : '';
                html += trans && trans.querySelector('.additional') ?
                    '\n' + trans.querySelector('.additional').innerText.trim().replace(/\n/g, '') : '';
                if (!!webTrans.length) {
                    html += '\n网络释义：\n';
                    for (var j = 0; j < webTrans.length; j++) {
                        if (j !== 0)
                            html += '；';
                        html += webTrans[j].innerText.replace(/\n/g, '').trim();
                    }
                }
                ele.innerText = html;
                ele.style.display = 'block';// 显示结果
            }, function (rst, ele) {
                ele.innerText = '有道翻译 无法连接！';
                ele.style.display = 'block';// 显示结果
            }, element);
        },
        // Bing词典 引擎
        bing: function (text, element) {
            this.ajax('http://cn.bing.com/dict/search?q=' + encodeURIComponent(text), function (rst, ele) {
                var parser = new DOMParser(), doc = parser.parseFromString(rst, 'text/html'), html = '';
                var word = doc.querySelector('.hd_area'),
                    trans = doc.querySelector('.qdef ul'),
                    forms = doc.querySelector('.qdef .hd_if');
                // 排版
                var headword = doc.querySelector('#headword');
                if (headword)
                    headword.innerHTML = headword.innerHTML + '<br>';
                var pos = doc.querySelectorAll('.qdef ul li .pos');
                for (var i = 0; i < pos.length; i++) {
                    pos[i].innerText = '\n【' + pos[i].innerText + '】';
                }
                html += word ? word.innerText.replace(/\n/g, ' ').trim() : '';
                html += trans ? '\n' + trans.innerText.trim() : '';
                html += forms ? '\n' + forms.innerText.trim() : '';
                ele.innerText = html;
                ele.style.display = 'block';// 显示结果
            }, function (rst, ele) {
                ele.innerText = 'Bing词典 无法连接！';
                ele.style.display = 'block';// 显示结果
            }, element);
        },
        // 谷歌翻译 引擎
        google: function (text, element) {
            var apiUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&sl=en&tl=zh-CN&hl=en&q=';
            this.ajax(apiUrl + encodeURIComponent(text), function (rst, ele) {
                var json = JSON.parse(rst), html = '';
                for (var i = 0; i < json.sentences.length; i++) {
                    html += json.sentences[i].orig + '\n';
                    html += json.sentences[i].trans + '\n';
                }
                ele.innerText = html;
                ele.style.display = 'block';// 显示结果
            }, function (rst, ele) {
                ele.innerText = '谷歌翻译 无法连接！';
                ele.style.display = 'block';// 显示结果
            }, element);
        },
        // 百度翻译 引擎
        baidu_translator: function (text, element) {
            var data = new FormData();
            data.set('from', 'en');
            data.set('to', 'zh');
            data.set('query', text);
            this.ajax('http://fanyi.baidu.com/v2transapi', function (rst, ele) {
                    var json = JSON.parse(rst), html = '';
                    for (var i = 0; i < json.trans_result.data.length; i++) {
                        html += json.trans_result.data[i].src + '\n';
                        html += json.trans_result.data[i].dst + '\n';
                    }
                    ele.innerText = html;
                    ele.style.display = 'block';// 显示结果
                }, function (rst, ele) {
                    ele.innerText = '百度翻译 无法连接！';
                    ele.style.display = 'block';// 显示结果
                },
                element,
                'POST',
                data
            );
        },
        // ajax 跨域访问公共方法
        ajax: function (url, success, error, element, method, data, headers) {
            if (!!!method)
                method = 'GET';
            // >>>因为Tampermonkey跨域访问(a.com)时会自动携带对应域名(a.com)的对应cookie
            // 不会携带当前域名的cookie
            // 所以，GM_xmlhttpRequest【不存在】cookie跨域访问安全性问题
            // 以下设置默认headers不起作用<<<
            if (!!!headers)
                headers = {'cookie': ''};
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
        },
        // 销毁已经生成的翻译内容面板
        containerDestroy: function () {
            for (var i = this.rendered.length - 1; i >= 0; i--) {
                if (this.rendered[i] && this.rendered[i].parentNode) {
                    this.rendered[i].parentNode.removeChild(this.rendered[i]);
                }
            }
        },
        // 生成翻译结果面板 DOM （此时还未添加到页面）
        container: function () {
            var div = document.createElement('div');
            div.setAttribute('style', '' +
                'display:none!important;' +
                'position:absolute!important;' +
                'font-size:13px!important;' +
                'overflow:auto!important;' +
                'background:#fefee6!important;' +
                'font-family:Arial,sans-serif!important;' +
                'font-weight:normal!important;' +
                'text-align:left!important;' +
                'color:#000!important;' +
                'padding:0.5em 1em!important;' +
                'line-height:1.5em!important;' +
                'border-radius:5px!important;' +
                'border:1px solid #ccc!important;' +
                'max-width:250px!important;' +
                'max-height:150px!important;' +
                'z-index:2147483647!important;' +
                '');
            return div;
        }
    };// 翻译server结束
})();