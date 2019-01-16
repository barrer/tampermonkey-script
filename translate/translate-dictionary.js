// ==UserScript==
// @name         划词翻译：多词典查询
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  划词翻译调用“有道词典（有道翻译）、金山词霸、Bing 词典（必应词典）、沪江小D、谷歌翻译”
// @author       https://github.com/barrer
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @run-at document-end
// @connect      dict.youdao.com
// @connect      open.iciba.com
// @connect      translate.google.cn
// @connect      hjenglish.com
// @connect      hjapi.com
// @connect      hjfile.cn
// @connect      cn.bing.com
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
    
    a {
        color: #36f;
        text-decoration: none;
        cursor: pointer;
    }
    
    a:hover {
        text-decoration: underline;
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
    
    img:hover {
        border: 1px solid #c6c6c6;
        -webkit-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
        box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    img[activate] {
        border: 1px solid transparent;
        -webkit-box-shadow: 0px 0px 0px 1px #f90;
        box-shadow: 0px 0px 0px 1px #f90;
    }
    
    tr-icon {
        display: none;
        position: absolute;
        padding: 2px;
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
    
    a.audio-button{
        color: #36f;
        text-decoration: none;
        cursor: pointer;
        margin-right: 10px;
    }
    
    a.audio-button:last-of-type {
        margin-right: auto;
    }
    
    a.audio-button:hover {
        text-decoration: underline;
    }

    .br {
        border-top: 1px dashed #777;
        margin: .5em auto .3em auto;
    }
    
    .list-title~.list-title {
        margin-top: 1em;
    }
    
    .list-title {
        color: #00c;
    }
    
    .google .sentences,
    .google .trans,
    .google .orig,
    .google .dict,
    .google .pos,
    .none {
        display: block;
    }
    
    .google .backend,
    .google .entry,
    .google .base_form,
    .google .pos_enum,
    .google .src,
    .google .confidence,
    .google .ld_result,
    .none {
        display: none;
    }
    
    .google .orig {
        font-style: italic;
        color: #777;
    }
    
    .google .pos {
        margin-top: 1em;
    }
    
    .google .pos:before {
        content: "[";
    }
    
    .google .pos:after {
        content: "]";
    }
    
    .google .terms:before {
        content: "【";
    }
    
    .google .terms:after {
        content: "】";
    }
    
    .google .terms {
        margin-right: .2em;
    }
    
    .youdao .phone {
        color: #777;
    }
    
    .youdao .phone:before {
        content: "[";
    }
    
    .youdao .phone:after {
        content: "]";
    }
    
    .youdao .phrs:before {
        content: "[短语]";
        display: block;
    }
    
    .youdao .trs>.tr>.exam:before {
        content: "[例句]";
        display: block;
    }
    
    .youdao .trs>.tr>.l:before {
        content: "[释义]";
        display: block;
    }
    
    .youdao [class="#text"] {
        font-style: italic;
    }
    
    .youdao .return-phrase,
    .youdao [class="@action"],
    .none {
        display: none;
    }
    
    .hjenglish dl,
    .hjenglish dt,
    .hjenglish dd,
    .hjenglish p,
    .hjenglish ul,
    .hjenglish li,
    .hjenglish h3 {
        margin: 0;
        padding: 0;
        margin-block-start: 0px;
        margin-block-end: 0px;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
    }
    
    .hjenglish h3 {
        font-size: 1em;
        font-weight: normal;
    }
    
    .hjenglish .detail-pron,
    .hjenglish .pronounces {
        color: #777;
    }
    
    .hjenglish ul {
        margin-left: 2em;
    }
    
    /*例句*/
    .hjenglish .def-sentence-from,
    .hjenglish .def-sentence-to {
        display: none;
    }
    
    .hjenglish .detail-groups dd h3:before {
        counter-increment: eq;
        content: counter(eq) ".";
        display: block;
        width: 22px;
        float: left;
    }
    
    .hjenglish .detail-groups dl {
        counter-reset: eq;
        margin-bottom: .5em;
        clear: both;
    }
    
    .hjenglish ol,
    .hjenglish ul {
        list-style: none;
    }

    .bing h1,
    .bing strong {
        font-size: 1em;
        font-weight: normal;
        margin: 0;
        padding: 0;
    }

    .bing .concise ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .bing .concise .pos {
        margin-right: .2em;
    }

    .bing .concise .web {
        margin-right: auto;
    }

    .bing .concise .web:after {
        content: "："
    }

    .bing .oald {
        margin-top: .4em;
    }

    .bing .hd_tf_lh div {
        display: inline;
        color: #777;
    }
    
    .bing #authid td:first-child {
        width: 22px;
        margin: 0;
        padding: 0;
    }
    
    .bing .def_row {
        vertical-align: top;
    }
    
    .bing .bil_dis,
    .bing .val_dis {
        padding-right: .25em;
    }
    
    /*例句*/
    .bing .li_exs {
        display: none;
    }
    
    .bing .li_id {
        border: 1px solid #ebebeb;
        padding: .2em;
    }
    
    .bing .infor,
    .bing .sen_com,
    .bing .com_sep,
    .bing .bil,
    .bing .gra {
        padding-right: .25em;
    }

    .bing .infor,
    .bing .label {
        padding-left: .25em;
    }
    
    .bing .each_seg+.each_seg {
        margin-top: .5em;
    }
    
    .bing .de_co div {
        display: inline;
    }
    `;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = URL.createObjectURL(new Blob([style.textContent], {
        type: 'text/css;charset=UTF-8'
    }));
    // 翻译图标、内容面板、当前选中文本、当前翻译引擎
    var icon = document.createElement('tr-icon'),
        content = document.createElement('tr-content'),
        selected,
        engineId;
    // 发音引擎
    var audioEngines = []; // [{name: 'abc', url: 'http://*.mp3', ...}, ...]
    // 翻译引擎结果集
    var engineResult = {}; // id: DOM 
    // ID 类别
    var ids = {
        ICIBA: 'iciba',
        ICIBA_LOWER_CASE: 'icibaLowerCase',
        YOUDAO: 'youdao',
        YOUDAO_LOWER_CASE: 'youdaoLowerCase',
        BING: 'bing',
        BING_LOWER_CASE: 'bingLowerCase',
        HJENGLISH: 'hjenglish',
        GOOGLE: 'google'
    };
    var idsExtension = {
        LIST_DICT: [ids.ICIBA, ids.YOUDAO, ids.BING, ids.HJENGLISH],
        LIST_DICT_LOWER_CASE: [ids.ICIBA, ids.ICIBA_LOWER_CASE, ids.YOUDAO, ids.YOUDAO_LOWER_CASE, ids.BING, ids.BING_LOWER_CASE, ids.HJENGLISH],
        LIST_GOOGLE: [ids.GOOGLE],
        lowerCaseMap: (function () {
            var obj = {};
            obj[ids.ICIBA_LOWER_CASE] = ids.ICIBA;
            obj[ids.YOUDAO_LOWER_CASE] = ids.YOUDAO;
            obj[ids.BING_LOWER_CASE] = ids.BING;
            return obj;
        })(),
        names: (function () {
            var obj = {};
            obj[ids.ICIBA] = '《金山词霸》';
            obj[ids.ICIBA_LOWER_CASE] = '';
            obj[ids.YOUDAO] = '《有道词典》';
            obj[ids.YOUDAO_LOWER_CASE] = '';
            obj[ids.BING] = '《Bing 词典》';
            obj[ids.BING_LOWER_CASE] = '';
            obj[ids.HJENGLISH] = '《沪江小D》';
            obj[ids.GOOGLE] = '';
            return obj;
        })()
    }
    // 绑定图标拖动事件
    var iconDrag = new Drag(icon);
    // 图标数组
    var iconArray = [{
        name: '多词典查询',
        id: 'icon-dict',
        image: 'data:image/png;base64,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',
        trigger: function (text) {
            var idsType = idsExtension.LIST_DICT;
            if (text != text.toLowerCase()) {
                idsType = idsExtension.LIST_DICT_LOWER_CASE;
            }
            ajax('http://open.iciba.com/huaci_v3/dict.php?word=' + encodeURIComponent(text), function (rst) {
                engineResult[ids.ICIBA] = parseIciba(rst);
                showContent(idsType);
            }, function (rst) {
                engineResult[ids.ICIBA] = htmlToDom('error: 无法连接翻译服务');
                showContent(idsType);
            });
            ajax('http://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=' + encodeURIComponent(text), function (rst) {
                engineResult[ids.YOUDAO] = parseYoudao(rst);
                showContent(idsType);
            }, function (rst) {
                engineResult[ids.YOUDAO] = htmlToDom('error: 无法连接翻译服务');
                showContent(idsType);
            });
            ajax('https://cn.bing.com/dict/search?q=' + encodeURIComponent(text), function (rst) {
                engineResult[ids.BING] = parseBing(rst);
                showContent(idsType);
            }, function (rst) {
                engineResult[ids.BING] = htmlToDom('error: 无法连接翻译服务');
                showContent(idsType);
            });
            ajax('https://dict.hjenglish.com/w/' + encodeURIComponent(text), function (rst) {
                engineResult[ids.HJENGLISH] = parseHjenglish(rst);
                showContent(idsType);
            }, function (rst) {
                engineResult[ids.HJENGLISH] = htmlToDom('error: 无法连接翻译服务');
                showContent(idsType);
            }, {
                headers: {
                    'Cookie': 'HJ_SID=' + uuid() + '; HJ_SSID_3=' + uuid() + '; HJ_CST=1; HJ_CSST_3=1; HJ_UID=' + uuid()
                }
            });
            if (text != text.toLowerCase()) { // 小写再请求一次
                ajax('http://open.iciba.com/huaci_v3/dict.php?word=' + encodeURIComponent(text.toLowerCase()), function (rst) {
                    engineResult[ids.ICIBA_LOWER_CASE] = parseIciba(rst);
                    showContent(idsType);
                }, function (rst) {
                    engineResult[ids.ICIBA_LOWER_CASE] = htmlToDom('error: 无法连接翻译服务');
                    showContent(idsType);
                });
                ajax('http://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=' + encodeURIComponent(text.toLowerCase()), function (rst) {
                    engineResult[ids.YOUDAO_LOWER_CASE] = parseYoudao(rst);
                    showContent(idsType);
                }, function (rst) {
                    engineResult[ids.YOUDAO_LOWER_CASE] = htmlToDom('error: 无法连接翻译服务');
                    showContent(idsType);
                });
                ajax('https://cn.bing.com/dict/search?q=' + encodeURIComponent(text.toLowerCase()), function (rst) {
                    engineResult[ids.BING_LOWER_CASE] = parseBing(rst);
                    showContent(idsType);
                }, function (rst) {
                    engineResult[ids.BING_LOWER_CASE] = htmlToDom('error: 无法连接翻译服务');
                    showContent(idsType);
                });
            }
        }
    }, {
        name: '谷歌翻译',
        id: 'icon-google',
        image: 'data:image/png;base64,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',
        trigger: function (text) {
            var url = 'https://translate.google.cn/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto';
            url += '&tk=' + token(text);
            if (hasChineseByRange(text))
                url += '&tl=en&q=' + text;
            else
                url += '&tl=zh-CN&q=' + text;
            ajax(url, function (rst) {
                engineResult[ids.GOOGLE] = parseGoogle(rst);
                showContent(idsExtension.LIST_GOOGLE);
            }, function (rst) {
                engineResult[ids.GOOGLE] = htmlToDom('error: 无法连接翻译服务');
                showContent(idsExtension.LIST_GOOGLE);
            });
        }
    }];
    // 添加翻译引擎图标
    iconArray.forEach(function (obj) {
        var img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.setAttribute('icon-id', obj.id);
        img.addEventListener('mouseup', function () {
            if (!isDrag()) { // 没有拖动鼠标抬起的时候触发点击事件
                if (engineId == obj.id)
                    return; // 已经是当前翻译引擎
                engineId = obj.id; // 翻译引擎 ID
                engineActivateShow(); // 显示翻译引擎指示器
                audioEngines = []; // 清空发音引擎
                engineResult = {}; // 清空翻译引擎结果集
                obj.trigger(selected); // 启动翻译引擎
            }
        });
        icon.appendChild(img);
    });
    // 添加内容面板（放图标后面）
    icon.appendChild(content);
    // 添加样式、翻译图标到 DOM
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
        if (selected && icon.style.display == 'none') { // 显示翻译图标
            log('show icon');
            log(selected + ' | ' + e.pageX + ' | ' + e.pageY);
            icon.style.top = e.pageY + 10 + 'px';
            icon.style.left = e.pageX + 10 + 'px';
            icon.style.display = 'block';
            // 兼容部分 Content Security Policy
            icon.style.position = 'absolute';
            icon.style.zIndex = '2147483647';
        } else if (!selected) { // 隐藏翻译图标
            log('hide icon:mouseup');
            hideIcon();
        }
    });
    // 选中变化事件：当点击已经选中的文本的时候，隐藏翻译图标（此时浏览器动作是：选中的文本已经取消选中了）
    document.addEventListener('selectionchange', function (e) {
        log('selectionchange event:', e);
        log('selectionchange:' + window.getSelection().toString());
        if (!window.getSelection().toString().trim()) {
            log('hide icon:selectionchange');
            hideIcon();
        }
    });
    // 内容面板滚动事件
    content.addEventListener('scroll', function (e) {
        if (content.scrollHeight - content.scrollTop === content.clientHeight) {
            log('scroll bottom', e);
            e.preventDefault();
            e.stopPropagation();
        } else if (content.scrollTop === 0) {
            log('scroll top', e);
            e.preventDefault();
            e.stopPropagation();
        }
    });
    /**日志输出*/
    function log() {
        var debug = true;
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
        this.startDragTime = 0;
        this.stopDragTime = 0;
        this.mouseDownPositionX = 0;
        this.mouseDownPositionY = 0;
        this.elementOriginalLeft = parseInt(element.style.left);
        this.elementOriginalTop = parseInt(element.style.top);
        var ref = this;
        this.startDrag = function (e) {
            e.preventDefault();
            ref.dragging = true;
            ref.startDragTime = new Date().getTime();
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
            ref.stopDragTime = new Date().getTime();
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
    /**是否拖动图标*/
    function isDrag() {
        return iconDrag.elementOriginalLeft != parseInt(icon.style.left) ||
            iconDrag.elementOriginalTop != parseInt(icon.style.top);
    }
    /**强制结束拖动*/
    function forceStopDrag() {
        if (iconDrag) {
            // 强制设置鼠标拖动事件结束，防止由于网页本身的其它鼠标事件冲突而导致没有侦测到：mouseup
            iconDrag.dragging = false;
            iconDrag.unsetMouseMove();
        }
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
    /**uuid*/
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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
    // html 字符串转 DOM
    function htmlToDom(htmlStr) {
        var div = document.createElement('div');
        div.innerHTML = htmlStr;
        return div;
    }
    /**清理 html*/
    function cleanHtml(htmlStr) {
        return htmlStr.replace(/<script[\s\S]*?<\/script>/ig, '')
            .replace(/<link[\s\S]*?>/ig, '')
            .replace(/<style[\s\S]*?<\/style>/ig, '')
            .replace(/<img[\s\S]*?>/ig, '')
            .replace(/on[a-z]*=".*?"/ig, '');
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
        // 以下设置的cookie会添加到已有cookie的后面<<<
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
            },
            onabort: function (res) {
                error('the request was aborted', res, obj);
            },
            ontimeout: function (res) {
                error('the request failed due to a timeout', res, obj);
            },
            onreadystatechange: function () {
                log('ajax:', arguments);
            }
        });
    }
    /**翻译引擎结果集状态判断*/
    function isAllDone(idsType) {
        var rst = false;
        idsType.forEach(function (id, i) {
            if (i == 0)
                rst = true;
            if (!(id in engineResult)) {
                log('isAllDone(not found):' + id);
                rst = false;
                return rst;
            }
        });
        return rst;
    }
    /**显示内容面板*/
    function showContent(idsType) {
        log('showContent:', idsType, engineResult);
        if (!isAllDone(idsType)) {
            log('showContent return');
            return;
        }
        log('showContent rendering');
        // 发音
        audioEngines.push({
            name: '♪US',
            url: 'http://dict.youdao.com/dictvoice?audio=' + selected + '&type=2'
        });
        audioEngines.push({
            name: '♪UK',
            url: 'http://dict.youdao.com/dictvoice?audio=' + selected + '&type=1'
        });
        var audio = document.createElement('tr-audio');
        audioEngines.forEach(function (obj) {
            audio.appendChild(getPlayButton(obj));
        });
        // 翻译内容
        content.innerHTML = '';
        // 比较大小写内容
        var needDel = {};
        for (var key in idsExtension.lowerCaseMap) {
            if (engineResult[key] &&
                engineResult[idsExtension.lowerCaseMap[key]] &&
                engineResult[key].innerHTML == engineResult[idsExtension.lowerCaseMap[key]].innerHTML) {
                needDel[key] = key;
            }
        }
        idsType.forEach(function (id) {
            if (!(id in needDel)) {
                if (idsExtension.names[id]) {
                    var title = document.createElement('div');
                    title.innerHTML = idsExtension.names[id];
                    title.setAttribute('class', 'list-title');
                    content.appendChild(title);
                }
                content.appendChild(engineResult[id]);
            }
        });
        if (engineId != 'icon-google') { // 谷歌翻译不显示发音图标
            content.insertBefore(audio, content.childNodes[0]);
        }
        content.style.display = 'block';
        content.scrollTop = 0;
        content.scrollLeft = 0;
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
        icon.querySelector('img[icon-id="' + engineId + '"').setAttribute('activate', 'activate');
    }
    /**隐藏 icon*/
    function hideIcon() {
        icon.style.display = 'none';
        content.style.display = 'none';
        engineId = '';
        audioEngines = [];
        engineResult = {};
        engineActivateHide();
        forceStopDrag();
    }
    /**发音*/
    function play(obj) {
        if (isDrag()) { // 拖动时候不触发发音
            return;
        }
        var audio = new Audio();
        ajax(obj.url, function (rst, res) {
            audio.src = URL.createObjectURL(res.response);
            audio.play();
        }, function (rst) {
            log(rst);
        }, {
            responseType: 'blob'
        });
    }
    /**得到发音按钮*/
    function getPlayButton(obj) {
        var type = document.createElement('a');
        type.innerHTML = obj.name;
        type.setAttribute('href', 'javascript:void(0)');
        type.setAttribute('class', 'audio-button');
        type.addEventListener('mouseup', function () {
            play(obj);
        });
        return type;
    }
    /**有道词典排版*/
    function parseYoudao(rst) {
        var html = '';
        try {
            var rstJson = JSON.parse(rst),
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
        } catch (error) {
            log(error);
            html += error;
        }
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.YOUDAO);
        dom.innerHTML = html;
        return dom;
    }
    /**金山词霸排版*/
    function parseIciba(rst) {
        var html = '';
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
            html += match[1];
            if (html.indexOf('去爱词霸官网翻译') != -1)
                html = '';
        } catch (error) {
            log(error);
            html += error;
        }
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.ICIBA);
        dom.innerHTML = html;
        return dom;
    }
    /**沪江小D排版*/
    function parseHjenglish(rst) {
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.HJENGLISH);
        try {
            var doc = htmlToDom(cleanHtml(rst));
            var entry = doc.querySelector('.word-text h2');
            var pronounces = doc.querySelector('.pronounces');
            var collins = doc.querySelector('div[data-id="detail"] .word-details-item-content .detail-groups');
            if (entry) {
                var entryDom = document.createElement('div');
                entryDom.setAttribute('class', 'entry');
                entryDom.innerHTML = entry.innerHTML;
                dom.appendChild(entryDom);
                if (pronounces) {
                    var pronounceDom = document.createElement('div');
                    pronounces.querySelectorAll('.pronounces [class="word-audio"]').forEach(function (ele) {
                        pronounceDom.appendChild(getPlayButton({
                            name: '♪US',
                            url: ele.getAttribute('data-src')
                        }));
                    });
                    pronounces.querySelectorAll('.pronounces [class="word-audio word-audio-en"]').forEach(function (ele) {
                        pronounceDom.appendChild(getPlayButton({
                            name: '♪UK',
                            url: ele.getAttribute('data-src')
                        }));
                    });
                    dom.appendChild(pronounceDom);
                    dom.appendChild(pronounces);
                }
                if (collins) {
                    dom.appendChild(htmlToDom('<div>《权威词典》</div>'));
                    dom.appendChild(collins);
                }
            }
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**必应词典排版*/
    function parseBing(rst) {
        var html = '';
        try {
            rst = cleanHtml(rst).replace(/(?:a>)/ig, 'span>')
                .replace(/(?:<a)/ig, '<span');
            var doc = htmlToDom(rst);
            doc.querySelectorAll('.hw_ti').forEach(function (ele) { // 牛津词头（不准）
                ele.remove();
            });
            var entry = doc.querySelector('.qdef .hd_area');
            var concise = doc.querySelector('.qdef ul');
            var tense = doc.querySelector('.qdef .hd_div1');
            var oald = doc.querySelector('#authid');
            if (entry) {
                html += '<div class="entry">' + entry.innerHTML + '</div>';
                if (concise)
                    html += '<div class="concise">' + concise.outerHTML + '</div>';
                if (tense)
                    html += '<div class="tense">' + tense.outerHTML + '</div>';
                if (oald)
                    html += '<div class="oald">《牛津高阶英汉双解词典第八版》<br>' + oald.outerHTML + '</div>';
            }
        } catch (error) {
            log(error);
            html += error;
        }
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.BING);
        dom.innerHTML = html;
        return dom;
    }
    /**谷歌翻译排版*/
    function parseGoogle(rst) {
        var dom = document.createElement('div');
        dom.setAttribute('class', ids.GOOGLE);
        try {
            // 发音
            // 内容
            dom.appendChild(htmlToDom(xmlToHtml(objToXml(JSON.parse(rst)), 'span')));
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**
     * 谷歌翻译 token 计算
     * https://github.com/hujingshuang/MTrans
     * */
    function token(a) {
        var k = "";
        var b = 406644;
        var b1 = 3293161072;

        var jd = ".";
        var sb = "+-a^+6";
        var Zb = "+-3^+b+-f";

        for (var e = [], f = 0, g = 0; g < a.length; g++) {
            var m = a.charCodeAt(g);
            128 > m ? e[f++] = m : (2048 > m ? e[f++] = m >> 6 | 192 : (55296 == (m & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (m = 65536 + ((m & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = m >> 18 | 240, e[f++] = m >> 12 & 63 | 128) : e[f++] = m >> 12 | 224, e[f++] = m >> 6 & 63 | 128), e[f++] = m & 63 | 128)
        }
        a = b;
        for (f = 0; f < e.length; f++) a += e[f],
            a = RL(a, sb);
        a = RL(a, Zb);
        a ^= b1 || 0;
        0 > a && (a = (a & 2147483647) + 2147483648);
        a %= 1E6;
        return a.toString() + jd + (a ^ b)
    };

    function RL(a, b) {
        var t = "a";
        var Yb = "+";
        for (var c = 0; c < b.length - 2; c += 3) {
            var d = b.charAt(c + 2),
                d = d >= t ? d.charCodeAt(0) - 87 : Number(d),
                d = b.charAt(c + 1) == Yb ? a >>> d : a << d;
            a = b.charAt(c) == Yb ? a + d & 4294967295 : a ^ d
        }
        return a
    }
})();