// ==UserScript==
// @name         划词翻译：多词典查询
// @namespace    http://tampermonkey.net/
// @version      10.13
// @description  划词翻译调用“有道词典（有道翻译）、金山词霸、Bing 词典（必应词典）、剑桥高阶、沪江小D、谷歌翻译”
// @author       https://github.com/barrer
// @license      https://www.apache.org/licenses/LICENSE-2.0
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @connect      youdao.com
// @connect      iciba.com
// @connect      translate.google.com
// @connect      hjenglish.com
// @connect      bing.com
// @connect      chinacloudapi.cn
// @connect      cambridge.org
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/*
 * Copyright 2019-2022 https://github.com/barrer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(() => {
    'use strict';

    // Your code here...
    /**联网权限*/
    // @connect      youdao.com             有道词典
    // @connect      iciba.com              金山词霸
    // @connect      translate.google.com   谷歌翻译
    // @connect      hjenglish.com          沪江小D
    // @connect      bing.com               必应词典
    // @connect      chinacloudapi.cn       必应词典-发音
    // @connect      cambridge.org          剑桥高阶
    // 注意：自定义变量修改后把 “@version” 版本号改为 “10000” 防止自动更新
    // >---- 可以自定义的变量 -----
    const fontSize = 14; // 字体大小[可自定义]
    const iconWidth = 300; // 整个面板宽度[可自定义]
    const iconHeight = 400; // 整个面板高度[可自定义]
    // ----- 可以自定义的变量 ----<
    /**样式*/
    const style = document.createElement('style');
    const trContentWidth = iconWidth - 16; // 整个面板宽度 - 边距间隔 = 翻译正文宽度
    const trContentHeight = iconHeight - 35; // 整个面板高度 - 边距间隔 = 翻译正文高度
    const zIndex = '2147483647'; // 渲染图层
    style.textContent = `
    /*组件样式*/
    :host{all:unset!important}
    :host{all:initial!important}
    *{word-wrap:break-word!important;word-break:break-word!important}
    a{color:#326891;text-decoration:none;cursor:pointer}
    a:hover{text-decoration:none}
    a:active{text-decoration:none}
    img{cursor:pointer;display:inline-block;width:20px;height:20px;border:1px solid #dfe1e5;border-radius:4px;background-color:rgba(255,255,255,1);padding:2px;margin:0;margin-right:5px;box-sizing:content-box;vertical-align:middle}
    img:last-of-type{margin-right:auto}
    img:hover{border:1px solid #ff9900}
    img[activate]{border:1px solid #ff9900}
    img[activate]:hover{border:1px solid #ff9900}
    tr-icon{display:none;position:absolute;padding:0;margin:0;cursor:move;box-sizing:content-box;font-size:${fontSize}px;text-align:left;border:0;border-radius:4px;z-index:${zIndex};background:transparent}
    tr-icon[activate]{color:#121212;background:#ffffff;-webkit-box-shadow:0 3px 8px 0 rgba(0,0,0,0.2),0 0 0 0 rgba(0,0,0,0.08);box-shadow:0 3px 8px 0 rgba(0,0,0,0.2),0 0 0 0 rgba(0,0,0,0.08)}
    tr-audio{display:block;margin-bottom:5px}
    tr-audio a{margin-right:1em;font-size:80%}
    tr-audio a:last-of-type{margin-right:auto}
    tr-content{display:none;width:${trContentWidth}px;height:${trContentHeight}px;overflow-x:hidden;overflow-y:scroll;padding:2px 8px;margin-top:5px;box-sizing:content-box;font-family:"Helvetica Neue","Helvetica","Microsoft Yahei","微软雅黑","Arial","sans-serif";font-size:${fontSize}px;font-weight:normal;line-height:normal;-webkit-font-smoothing:auto;font-smoothing:auto;text-rendering:auto}
    tr-engine~tr-engine{margin-top:1em}
    tr-engine .title{color:#121212;display:inline-block;font-size:110%;font-weight:bold}
    /*各引擎样式*/
    .google .sentences,.google .trans,.google .orig,.google .dict,.google .pos,.none{display:block}
    .google .backend,.google .entry,.google .base_form,.google .pos_enum,.google .src,.google .confidence,.google .ld_result,.google .translation_engine_debug_info,.none{display:none}
    .google .orig{color:#808080}
    .google .pos{margin-top:1em}
    .google .pos:before{content:"<"}
    .google .pos:after{content:">"}
    .google .terms:before{content:"〔"}
    .google .terms:after{content:"〕"}
    .google .terms{margin-right:.2em}
    .youdao .pron{margin-right:1em}
    .youdao .phone{color:#808080;margin-right:1em}
    .youdao .phone:before{content:"["}
    .youdao .phone:after{content:"]"}
    .youdao .pos:before{content:"<"}
    .youdao .pos:after{content:">"}
    .youdao .phrs{display:none}
    .youdao .trs>.tr>.exam{display:none}
    .youdao .trs>.tr>.l{display:block}
    .youdao [class="#text"]{font-style:italic}
    .youdao [class="@action"],.none{display:none}
    .hjenglish dl,.hjenglish dt,.hjenglish dd,.hjenglish p,.hjenglish ul,.hjenglish li,.hjenglish h3{margin:0;padding:0;margin-block-start:0;margin-block-end:0;margin-inline-start:0;margin-inline-end:0}
    .hjenglish h3{font-size:1em;font-weight:normal}
    .hjenglish .detail-pron,.hjenglish .pronounces{color:#808080}
    .hjenglish .def-sentence-from,.hjenglish .def-sentence-to{display:none}
    .hjenglish .detail-groups dd h3:before{counter-increment:eq;content:counter(eq) ".";display:inline}
    .hjenglish .detail-groups dd h3 p{display:inline}
    .hjenglish .detail-groups dd:first-of-type:last-of-type h3:before{content:""}
    .hjenglish .detail-groups dl{counter-reset:eq;margin-bottom:.5em;clear:both}
    .hjenglish ol,.hjenglish ul{list-style:none}
    .hjenglish dd>p{display:none}
    .bing h1,.bing strong,.bing td{font-size:1em;font-weight:normal;margin:0;padding:0}
    .bing .concise ul{list-style:none;margin:0;padding:0}
    .bing .hd_tf{margin-right:1em}
    .bing .concise .pos{margin-right:.2em}
    .bing .concise .web{margin-right:auto}
    .bing .concise .web:after{content:"："}
    .bing .oald{margin-top:.4em}
    .bing .hd_tf_lh div{display:inline;color:#808080}
    .bing .def_row{vertical-align:top}
    .bing .se_d{display:inline;margin-right:.25em}
    .bing #authid .only .se_d{display:none}
    .bing .bil_dis,.bing .val_dis{padding-right:.25em}
    .bing .li_sens div{display:inline}
    .bing .li_sens div.li_exs,.bing .li_exs{display:none}
    .bing .li_id{border:0;padding:.2em}
    .bing .infor,.bing .sen_com,.bing .com_sep,.bing .bil,.bing .gra{padding-right:.25em}
    .bing .infor,.bing .label{padding-left:.25em}
    .bing .each_seg+.each_seg{margin-top:.5em}
    .bing .de_co,.bing .de_co div{display:inline}
    .bing .idm_seg,.bing .li_ids_co{margin-left:1em}
    .bing .sim{display:inline}
    .bing .val{display:none}
    .cambridge .entry~.entry{margin-top:1em}
    .cambridge p,.cambridge h2,.cambridge h3{padding:0;margin:0}
    .cambridge h2,.cambridge h3{font-size:1em;font-weight:normal}
    .cambridge .headword .hw{display:block}
    .cambridge .pron{color:#808080;margin-right:1em}
    .cambridge b.def{font-weight:normal}
    .cambridge .examp,.cambridge .extraexamps,.cambridge .cols,.cambridge .xref,.cambridge .fcdo,.cambridge div[fallback],.cambridge .i-volume-up,.cambridge .daccord{display:none}
    .cambridge .entry-body__el+.entry-body__el{margin-top:1em}
    .cambridge .epp-xref,.cambridge .db,.cambridge .bb,.cambridge .i-caret-right,.cambridge .dsense_h{display:none}
    .cambridge .dphrase-block{margin-left:1em}
    .cambridge .dphrase-title b{font-weight:normal}
    .cambridge .ddef_h,.cambridge .def-body{display:inline}
    .iciba h1,.iciba p{margin:0;padding:0;font-size:1em;font-weight:normal}
    .iciba ul{list-style:none;margin:0;padding:0}
    .iciba li>i{font-style:normal}
    .iciba ul[class^="Mean_symbols"] li{display:inline;color:#808080;margin-right:1em}
    .iciba ul[class^="Mean_part"] li>i{margin-right:0.2em}
    .iciba ul[class^="Mean_part"] li>div{display:inline}
    `;
    // iframe 工具库
    const iframe = document.createElement('iframe');
    let iframeWin = null;
    let iframeDoc = null;
    iframe.style.display = 'none';
    const icon = document.createElement('tr-icon');//翻译图标
    const content = document.createElement('tr-content');// 内容面板
    const contentList = document.createElement('div');//翻译内容结果集（HTML内容）列表
    let selected;// 当前选中文本
    let engineId;// 当前翻译引擎
    let engineTriggerTime;// 引擎触发时间（milliseconds）
    let idsType;// 当前翻译面板内容列表数组
    let pageX;// 图标显示的 X 坐标
    let pageY; // 图标显示的 Y 坐标
    // 初始化内容面板
    content.appendChild(contentList);
    // 发音缓存
    let audioCache = {}; // {'mp3 download url': data}
    // 翻译引擎结果集
    let engineResult = {}; // id: DOM
    // 唯一 ID
    const ids = {
        ICIBA: 'iciba',
        ICIBA_LOWER_CASE: 'icibaLowerCase',
        YOUDAO: 'youdao',
        YOUDAO_LOWER_CASE: 'youdaoLowerCase',
        BING: 'bing',
        HJENGLISH: 'hjenglish',
        GOOGLE: 'google',
        CAMBRIDGE: 'cambridge'
    };
    // 唯一 ID 扩展
    const idsExtension = {
        // ID 组
        LIST_DICT: [ids.ICIBA, ids.YOUDAO, ids.BING, ids.HJENGLISH, ids.CAMBRIDGE],
        LIST_DICT_LOWER_CASE: [ids.ICIBA, ids.ICIBA_LOWER_CASE, ids.YOUDAO, ids.YOUDAO_LOWER_CASE, ids.BING, ids.HJENGLISH, ids.CAMBRIDGE],
        LIST_GOOGLE: [ids.GOOGLE],
        // 去重比对（大小写翻译可能一样）
        lowerCaseMap: (() => {
            const obj = {};
            obj[ids.ICIBA_LOWER_CASE] = ids.ICIBA;
            obj[ids.YOUDAO_LOWER_CASE] = ids.YOUDAO;
            return obj;
        })(),
        // 标题
        names: (() => {
            const obj = {};
            obj[ids.ICIBA] = '金山词霸';
            obj[ids.ICIBA_LOWER_CASE] = '';
            obj[ids.YOUDAO] = '有道词典';
            obj[ids.YOUDAO_LOWER_CASE] = '';
            obj[ids.BING] = 'Bing 词典';
            obj[ids.HJENGLISH] = '沪江小D';
            obj[ids.GOOGLE] = '谷歌翻译';
            obj[ids.CAMBRIDGE] = '剑桥高阶';
            return obj;
        })(),
        // 跳转到网站（“%q%”占位符或者 function text -> return URL）
        links: (() => {
            const obj = {};
            obj[ids.ICIBA] = 'https://www.iciba.com/word?w=%q%';
            obj[ids.ICIBA_LOWER_CASE] = '';
            obj[ids.YOUDAO] = 'https://dict.youdao.com/w/eng/%q%';
            obj[ids.YOUDAO_LOWER_CASE] = '';
            obj[ids.BING] = 'https://cn.bing.com/dict/search?q=%q%';
            obj[ids.HJENGLISH] = 'https://dict.hjenglish.com/w/%q%';
            obj[ids.GOOGLE] = text => {
                let rst = '';
                if (hasChineseByRange(text)) {
                    rst = `https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=${encodeURIComponent(text)}`;
                } else {
                    rst = `https://translate.google.com/#view=home&op=translate&sl=auto&tl=zh-CN&text=${encodeURIComponent(text)}`;
                }
                return rst;
            };
            obj[ids.CAMBRIDGE] = 'https://dictionary.cambridge.org/search/english-chinese-simplified/direct/?q=%q%';
            return obj;
        })(),
        // 翻译引擎
        engines: (() => {
            const obj = {};
            obj[ids.ICIBA] = (text, time) => {
                ajax(`https://www.iciba.com/word?w=${encodeURIComponent(text)}`, rst => {
                    putEngineResult(ids.ICIBA, parseIciba(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.ICIBA, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.ICIBA_LOWER_CASE] = (text, time) => {
                ajax(`https://www.iciba.com/word?w=${encodeURIComponent(text.toLowerCase())}`, rst => {
                    putEngineResult(ids.ICIBA_LOWER_CASE, parseIciba(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.ICIBA_LOWER_CASE, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.YOUDAO] = (text, time) => {
                ajax(`https://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=${encodeURIComponent(text)}`, rst => {
                    putEngineResult(ids.YOUDAO, parseYoudao(rst), time)
                    showContent();
                }, rst => {
                    putEngineResult(ids.YOUDAO, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.YOUDAO_LOWER_CASE] = (text, time) => {
                ajax(`https://dict.youdao.com/jsonapi?xmlVersion=5.1&jsonversion=2&q=${encodeURIComponent(text.toLowerCase())}`, rst => {
                    putEngineResult(ids.YOUDAO_LOWER_CASE, parseYoudao(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.YOUDAO_LOWER_CASE, htmlToDom('error: 无法连接翻译服务'), time)
                    showContent();
                });
            };
            obj[ids.BING] = (text, time) => {
                ajax(`https://cn.bing.com/dict/search?q=${encodeURIComponent(text)}`, rst => {
                    putEngineResult(ids.BING, parseBing(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.BING, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                }, {
                    headers: {
                        'Accept-Language': 'zh-CN,zh;q=0.9'
                    }
                });
            };
            obj[ids.HJENGLISH] = (text, time) => {
                ajax(`https://dict.hjenglish.com/w/${encodeURIComponent(text)}`, rst => {
                    putEngineResult(ids.HJENGLISH, parseHjenglish(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.HJENGLISH, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                }, {
                    headers: {
                        'Cookie': `HJ_SID=${uuid()}; HJ_SSID_3=${uuid()}; HJ_CST=1; HJ_CSST_3=1; HJ_UID=${uuid()}`,
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
                    }
                });
            };
            obj[ids.GOOGLE] = (text, time) => {
                let url = 'https://translate.google.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&source=input&hl=zh-CN&sl=auto';
                url += `&tk=${token(text)}`;
                if (hasChineseByRange(text)) {
                    url += `&tl=en&q=${encodeURIComponent(text)}`;
                } else {
                    url += `&tl=zh-CN&q=${encodeURIComponent(text)}`;
                }
                ajax(url, rst => {
                    putEngineResult(ids.GOOGLE, parseGoogle(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.GOOGLE, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            obj[ids.CAMBRIDGE] = (text, time) => {
                const url = `https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${encodeURIComponent(text)}`;
                ajax(url, rst => {
                    putEngineResult(ids.CAMBRIDGE, parseCambridge(rst), time);
                    showContent();
                }, rst => {
                    putEngineResult(ids.CAMBRIDGE, htmlToDom('error: 无法连接翻译服务'), time);
                    showContent();
                });
            };
            return obj;
        })()
    };
    // 绑定图标拖动事件
    const iconDrag = new Drag(icon);
    const dragFluctuation = 16;// 当拖动多少像素以上时不触发查询
    // 图标数组
    const iconArray = [{
        name: '多词典查询',
        id: 'icon-dict',
        image: 'data:image/png;base64,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',
        trigger(text, time) {
            idsType = idsExtension.LIST_DICT;
            if (text != text.toLowerCase()) {
                idsType = idsExtension.LIST_DICT_LOWER_CASE; // 改为大小写 ID 组（大小写各请求一次）
            }
            idsType.forEach(id => {
                idsExtension.engines[id](text, time);
            });
            initContent(); // 初始化翻译面板
            displayContent(); // 立马显示翻译面板
        }
    }, {
        name: '谷歌翻译',
        id: 'icon-google',
        image: 'data:image/png;base64,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',
        trigger(text, time) {
            idsType = idsExtension.LIST_GOOGLE;
            idsType.forEach(id => {
                idsExtension.engines[id](text, time);
            });
            initContent(); // 初始化翻译面板
            displayContent(); // 立马显示翻译面板
        }
    }];
    // 添加翻译引擎图标
    iconArray.forEach(obj => {
        const img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.setAttribute('icon-id', obj.id);
        img.addEventListener('mouseup', () => {
            if (engineId == obj.id) {
                // 已经是当前翻译引擎，不做任何处理
            } else if (!isDrag(dragFluctuation)) {
                icon.setAttribute('activate', 'activate'); // 标注面板展开
                engineId = obj.id; // 翻译引擎 ID
                engineTriggerTime = new Date().getTime(); // 引擎触发时间
                engineActivateShow(); // 显示翻译引擎指示器
                audioCache = {}; // 清空发音缓存
                engineResult = {}; // 清空翻译引擎结果集
                obj.trigger(selected, engineTriggerTime); // 启动翻译引擎
            }
        });
        icon.appendChild(img);
    });
    // 添加内容面板（放图标后面）
    icon.appendChild(content);
    // 添加样式、翻译图标到 DOM
    const root = document.createElement('div');
    document.documentElement.appendChild(root);
    const shadow = root.attachShadow({
        mode: 'closed'
    });
    // iframe 工具库加入 Shadow
    shadow.appendChild(iframe);
    iframeWin = iframe.contentWindow;
    iframeDoc = iframe.contentDocument;
    // 外部样式表
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = createObjectURLWithTry(new Blob(['\ufeff', style.textContent], {
        type: 'text/css;charset=UTF-8'
    }));
    // 多种方式最大化兼容：Content Security Policy
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
    shadow.appendChild(style); // 内部样式表
    shadow.appendChild(link); // 外部样式表
    adoptedStyleSheets(shadow, style.textContent); // CSSStyleSheet 样式
    // 翻译图标加入 Shadow
    shadow.appendChild(icon);
    // 鼠标事件：防止选中的文本消失
    document.addEventListener('mousedown', e => {
        log('mousedown event:', e);
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', showIcon);
    // 选中变化事件
    document.addEventListener('selectionchange', showIcon);
    document.addEventListener('touchend', showIcon);
    // 内容面板滚动事件
    content.addEventListener('scroll', e => {
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
    function log(...args) {
        const debug = false;
        if (!debug) {
            return;
        }
        if (args) {
            for (let i = 0; i < args.length; i++) {
                console.log(args[i]);
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
        this.backAndForthLeftMax = 0;
        this.backAndForthTopMax = 0;
        const ref = this;
        this.startDrag = e => {
            e.preventDefault();
            ref.dragging = true;
            ref.startDragTime = new Date().getTime();
            ref.mouseDownPositionX = e.clientX;
            ref.mouseDownPositionY = e.clientY;
            ref.elementOriginalLeft = parseInt(element.style.left);
            ref.elementOriginalTop = parseInt(element.style.top);
            ref.backAndForthLeftMax = 0;
            ref.backAndForthTopMax = 0;
            // set global mouse events
            window.addEventListener('mousemove', ref.dragElement);
            window.addEventListener('mouseup', ref.stopDrag);
            log('startDrag');
        };
        this.unsetMouseMove = () => {
            // unset global mouse events
            window.removeEventListener('mousemove', ref.dragElement);
            window.removeEventListener('mouseup', ref.stopDrag);
        };
        this.stopDrag = e => {
            e.preventDefault();
            ref.dragging = false;
            ref.stopDragTime = new Date().getTime();
            ref.unsetMouseMove();
            log('stopDrag');
        };
        this.dragElement = e => {
            log('dragging');
            if (!ref.dragging) {
                return;
            }
            e.preventDefault();
            // move element
            element.style.left = `${ref.elementOriginalLeft + (e.clientX - ref.mouseDownPositionX)}px`;
            element.style.top = `${ref.elementOriginalTop + (e.clientY - ref.mouseDownPositionY)}px`;
            // get max move
            let left = Math.abs(ref.elementOriginalLeft - parseInt(element.style.left));
            let top = Math.abs(ref.elementOriginalTop - parseInt(element.style.top));
            if (left > ref.backAndForthLeftMax) ref.backAndForthLeftMax = left;
            if (top > ref.backAndForthTopMax) ref.backAndForthTopMax = top;
            log('dragElement');
        };
        element.onmousedown = this.startDrag;
        element.onmouseup = this.stopDrag;
    }
    /**
     * 是否拖动图标
     * @param fluctuate 位移波动允许范围
    */
    function isDrag(fluctuate) {
        return (iconDrag.elementOriginalLeft != parseInt(icon.style.left)
            && Math.abs(iconDrag.elementOriginalLeft - parseInt(icon.style.left)) >= fluctuate) ||
            (iconDrag.elementOriginalTop != parseInt(icon.style.top)
                && Math.abs(iconDrag.elementOriginalTop - parseInt(icon.style.top)) >= fluctuate) ||
            iconDrag.backAndForthLeftMax >= fluctuate ||
            iconDrag.backAndForthTopMax >= fluctuate;
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
        return /[\u4e00-\u9fa5]/ig.test(str);
    }
    /**uuid*/
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**遍历删除元素*/
    function iterElementRemove(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] !== undefined && arr[i] !== null && arr[i] instanceof Element) {
                arr[i].remove();
            }
        }
    }
    /**对象转 xml*/
    function objToXml(obj) {
        let xml = '';
        for (const prop in obj) {
            if (obj[prop] instanceof iframeWin.Function) {
                continue;
            }
            xml += obj[prop] instanceof iframeWin.Array ? '' : `<${prop}>`;
            if (obj[prop] instanceof iframeWin.Array) {
                for (const array in obj[prop]) {
                    if (obj[prop][array] instanceof iframeWin.Function) {
                        continue;
                    }
                    xml += `<${prop}>`;
                    xml += objToXml(new iframeWin.Object(obj[prop][array]));
                    xml += `</${prop}>`;
                }
            } else if (obj[prop] instanceof iframeWin.Object) {
                xml += objToXml(new iframeWin.Object(obj[prop]));
            } else {
                xml += obj[prop];
            }
            xml += obj[prop] instanceof iframeWin.Array ? '' : `</${prop}>`;
        }
        return xml.replace(/<\/?[0-9]{1,}>/g, '');
    }
    /**xml 转 html*/
    function xmlToHtml(xml, tag) {
        return xml.replace(/<([^/]+?)>/g, `<${tag} class="$1">`)
            .replace(/<\/(.+?)>/g, `</${tag}>`);
    }
    /**html 字符串转 DOM*/
    function htmlToDom(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div;
    }
    /**替换html标签
     * @param tag 匹配的时候不区分大小写
    */
    function replaceHtmlTag(str, tag, newTag) {
        if (true) { // 开始标签
            let newStr = '';
            let index = 0;
            let matches = str.matchAll(/<(((?![<\/>])[\S])+)(((?![<>])[\S\s])*)>/g);
            for (const match of matches) {
                if (tag.toLowerCase() !== match[1].toLowerCase()) continue;
                newStr += str.substring(index, match.index);
                newStr += match[3] ? `<${newTag}${match[3]}>` : `<${newTag}>`;
                index = match.index + match[0].length;
            }
            newStr += str.substring(index, str.length);
            str = newStr;
        }
        if (true) { // 结束标签
            let newStr = '';
            let index = 0;
            let matches = str.matchAll(/<\/(((?![<>])[\S])+)(((?![<>])[\S\s])*)>/g);
            for (const match of matches) {
                if (tag.toLowerCase() !== match[1].toLowerCase()) continue;
                newStr += str.substring(index, match.index);
                newStr += `</${newTag}>`;
                index = match.index + match[0].length;
            }
            newStr += str.substring(index, str.length);
            str = newStr;
        }
        return str;
    }
    /**清理 html*/
    function cleanHtml(html) {
        html = html.replace(/<script[\s\S]*?<\/script>/ig, '')
            .replace(/<meta[\s\S]*?>/ig, '')
            .replace(/<title[\s\S]*?<\/title>/ig, '')
            .replace(/<head[\s\S]*?<\/head>/ig, '')
            .replace(/<link[\s\S]*?>/ig, '')
            .replace(/<style[\s\S]*?<\/style>/ig, '')
            .replace(/<audio[\s\S]*?<\/audio>/ig, '')
            .replace(/<audio[\s\S]*?>/ig, '')
            .replace(/<video[\s\S]*?<\/video>/ig, '')
            .replace(/<video[\s\S]*?>/ig, '')
            .replace(/<iframe[\s\S]*?<\/iframe>/ig, '')
            .replace(/<iframe[\s\S]*?>/ig, '')
            .replace(/<img[\s\S]*?>/ig, '');
        html = cleanAttr(html, /on[a-z]*/ig);
        return html;
    }
    /**
     * 清理指定属性（忽略大小写）
     * @param rmAttrKey 正则表达式
     */
    function cleanAttr(html, rmAttrKey) {// @param rmAttrKey 如“/on[a-z]*/ig”，表示清理“on”、“ON”开头的属性：onclick、onmove等
        let str = html;
        // 开始标签中的属性
        let newStr = '';
        let index = 0;
        let matches = str.matchAll(/<(((?![<\/>])[\S])+)(((?![<>])[\S\s])*)>/g);
        for (const match of matches) {
            // 属性匹配
            let attrStr = match[0];
            let attrNewStr = '';
            let attrIndex = 0;
            let attrMs = attrStr
                .matchAll( // 此正则会匹配“key=value”[1]这种形式，属性中仅有单“key”[2]不匹配，属性中混合[1][2]仅匹配[1]且[2]会算作其之前邻近[1]的value
                    /([\s][a-zA-Z0-9-]+(((?![=<>])[\s])*))=(((?!([\s][a-zA-Z0-9-]+(((?![=<>])[\s])*))=)(?![<>])[\s\S])*)/g
                )
            for (const am of attrMs) {
                let key = am[1].trim();
                let value = am[4].trim();
                if (rmAttrKey.test(key)) {
                    attrNewStr += attrStr.substring(attrIndex, am.index);
                    attrIndex = am.index + am[0].length;
                }
            }
            attrNewStr += attrStr.substring(attrIndex, attrStr.length);
            attrStr = attrNewStr;
            // 删减属性后更新标签
            if (match[0] === attrStr) continue; // 无删减属性
            newStr += str.substring(index, match.index);
            newStr += attrStr;
            index = match.index + match[0].length;
        }
        newStr += str.substring(index, str.length);
        str = newStr;
        return str;
    }
    /**带异常处理的 createObjectURL*/
    function createObjectURLWithTry(blob) {
        try {
            return iframeWin.URL.createObjectURL(blob);
        } catch (error) {
            log(error);
        }
        return '';
    }
    /**解决 Content-Security-Policy 样式文件加载问题（Chrome 实验功能）*/
    function adoptedStyleSheets(bindDocumentOrShadowRoot, cssText) {
        try {
            if (bindDocumentOrShadowRoot.adoptedStyleSheets) {
                cssText = cssText.replace(/\/\*.*?\*\//ig, ''); // remove CSS comments
                const cssSheet = new CSSStyleSheet();
                const styleArray = cssText.split('\n');
                for (let i = 0; i < styleArray.length; i++) {
                    const line = styleArray[i].trim();
                    if (line.length > 0) {
                        cssSheet.insertRule(line);
                    }
                }
                bindDocumentOrShadowRoot.adoptedStyleSheets = [cssSheet];
            }
        } catch (error) {
            log(error);
        }
    }
    /**ajax 跨域访问公共方法*/
    function ajax(url, success, error, obj) {
        if (!!!obj) {
            obj = {};
        }
        if (!!!obj.method) {
            obj.method = 'GET';
        }
        if (!!!obj.headers) {
            obj.headers = {};
        }
        // Tampermonkey（其它浏览器扩展同理）代理跨域访问（a.com）时会自动携带对应域名（a.com）的对应cookie，
        // 不会携带当前域名的cookie，GM_xmlhttpRequest【不存在】cookie跨域访问安全性问题。
        if (!!!obj.anonymous) {
            obj.anonymous = true;// 默认不发送cookie
        }
        GM_xmlhttpRequest({
            method: obj.method,
            url,
            headers: obj.headers,
            anonymous: obj.anonymous,
            responseType: obj.responseType,
            data: obj.data,
            onload(res) {
                success(res.responseText, res, obj);
            },
            onerror(res) {
                error(res.responseText, res, obj);
            },
            onabort(res) {
                error('the request was aborted', res, obj);
            },
            ontimeout(res) {
                error('the request failed due to a timeout', res, obj);
            },
            onreadystatechange(...args) {
                log('ajax:', args);
            }
        });
    }
    /**放入翻译引擎结果集*/
    function putEngineResult(id, value, time) {
        if (time == engineTriggerTime) { // 是本次触发的异步ajax请求
            engineResult[id] = value;
        }
    }
    /**初始化面板*/
    function initContent() {
        contentList.innerHTML = ''; // 清空翻译内容列表
        // 发音
        const audio = document.createElement('tr-audio');
        audio.appendChild(getPlayButton({
            name: 'US',
            url: `https://dict.youdao.com/dictvoice?audio=${selected}&type=2`
        }));
        audio.appendChild(getPlayButton({
            name: 'UK',
            url: `https://dict.youdao.com/dictvoice?audio=${selected}&type=1`
        }));
        if (engineId != 'icon-google') { // 谷歌翻译不显示发音图标
            contentList.appendChild(audio);
        }
        // 初始化翻译引擎结构（此时内容暂未填充）
        idsType.forEach(id => {
            if (id in idsExtension.names) {
                const engine = document.createElement('tr-engine');
                engine.setAttribute('data-id', id);
                engine.style.display = 'none'; // 暂无内容默认隐藏
                // 标题
                if (idsExtension.names[id]) {
                    const title = document.createElement('a');
                    title.innerHTML = idsExtension.names[id];
                    title.setAttribute('class', 'title');
                    let href = 'javascript:void(0)';
                    if (idsExtension.links[id]) {
                        const link = idsExtension.links[id];
                        if (typeof link == 'string') {
                            if (link.length > 0) {
                                href = link.replace(/%q%/ig, encodeURIComponent(selected));
                            }
                        } else if (typeof link == 'function') {
                            const fnHref = link(selected);
                            if (fnHref.length > 0) {
                                href = fnHref;
                            }
                        }
                    }
                    title.setAttribute('rel', 'noreferrer noopener');
                    title.setAttribute('target', '_blank');
                    title.setAttribute('href', href);
                    title.setAttribute('title', '打开源网站');
                    title.addEventListener('click', e => {
                        if (isDrag(dragFluctuation)) {
                            e.preventDefault();
                        }
                    });
                    engine.appendChild(title);
                }
                contentList.appendChild(engine);
            }
        });
    }
    /**显示内容面板*/
    function displayContent() {
        const panelWidth = iconWidth + 8; // icon 展开后总宽度(8:冗余距离)
        const panelHeight = iconHeight + 8; // icon 展开后总高度(8:冗余距离)
        // 计算位置
        log('content position:',
            'window.scrollY', window.scrollY,
            'document.documentElement.scrollTop', document.documentElement.scrollTop,
            'document.body.scrollTop', document.body.scrollTop,
            'window.innerHeight', window.innerHeight,
            'document.documentElement.clientHeight', document.documentElement.clientHeight,
            'document.body.clientHeight', document.body.clientHeight,
            'icon.style.top', icon.style.top,
            'window.scrollX', window.scrollX,
            'document.documentElement.scrollLeft', document.documentElement.scrollLeft,
            'document.body.scrollLeft', document.body.scrollLeft,
            'window.innerWidth', window.innerWidth,
            'document.documentElement.clientWidth', document.documentElement.clientWidth,
            'document.body.clientWidth', document.body.clientWidth,
            'icon.style.left', icon.style.left
        );
        const scrollTop = Math.max(parseInt(document.documentElement.scrollTop), parseInt(document.body.scrollTop));
        const scrollLeft = Math.max(parseInt(document.documentElement.scrollLeft), parseInt(document.body.scrollLeft));
        let clientHeight = [parseInt(document.documentElement.clientHeight), parseInt(document.body.clientHeight)].filter(x => x <= parseInt(window.innerHeight)).sort((a, b) => a > b ? -1 : (a == b ? 0 : 1))[0]; // 找出最大值且小于等于 window 的高度
        if (!clientHeight) { // 网页缩放导致可能数组为空（[0] 为 undefined）
            clientHeight = parseInt(window.innerHeight);
        }
        let clientWidth = [parseInt(document.documentElement.clientWidth), parseInt(document.body.clientWidth)].filter(x => x <= parseInt(window.innerWidth)).sort((a, b) => a > b ? -1 : (a == b ? 0 : 1))[0]; // 找出最大值且小于等于 window 的宽度
        if (!clientWidth) { // 网页缩放导致可能数组为空（[0] 为 undefined）
            clientWidth = parseInt(window.innerWidth);
        }
        // 设置新的位置
        let iconNewTop = -1;
        if (parseInt(icon.style.top) < scrollTop) { // 面板在滚动条顶部可见部分之上（隐藏了部分或全部）
            log('Y adjust top');
            iconNewTop = scrollTop; // 设置为滚动条顶部可见部分位置
        } else if (parseInt(icon.style.top) + panelHeight > scrollTop + clientHeight) { // 面板在滚动条滚到最底部时之下（隐藏了部分或全部）
            log('Y adjust bottom');
            iconNewTop = parseInt(scrollTop + clientHeight - panelHeight); // 设置面板底部不超过滚动条滚到最底部时可见部分位置
            if (iconNewTop < scrollTop) { // 如果此时又出现：面板在滚动条顶部可见部分之上（隐藏了部分或全部）
                log('Y adjust bottom top');
                iconNewTop = scrollTop; // 设置为滚动条顶部可见部分位置
            }
        }
        if (iconNewTop != -1 && Math.abs(iconNewTop - parseInt(icon.style.top)) <= panelHeight) {
            log('Y set iconNewTop', iconNewTop);
            icon.style.top = `${iconNewTop}px`;
        }
        let iconNewLeft = -1;
        if (parseInt(icon.style.left) < scrollLeft) {
            log('X adjust left');
            iconNewLeft = scrollLeft;
        } else if (parseInt(icon.style.left) + panelWidth > scrollLeft + clientWidth) {
            log('X adjust right');
            iconNewLeft = parseInt(scrollLeft + clientWidth - panelWidth);
            if (iconNewLeft < scrollLeft) {
                log('X adjust right left');
                iconNewLeft = scrollLeft;
            }
        }
        if (iconNewLeft != -1 && Math.abs(iconNewLeft - parseInt(icon.style.left)) <= panelWidth) {
            log('X set iconNewLeft', iconNewLeft);
            icon.style.left = `${iconNewLeft}px`;
        }
        content.scrollTop = 0; // 翻译面板滚动到顶端
        content.scrollLeft = 0; // 翻译面板滚动到左端
        content.style.display = 'block';
    }
    /**内容面板填充数据*/
    function showContent() {
        // 填充已有结果集引擎内容
        idsType.forEach(id => {
            if (engineResult[id] && !(id in idsExtension.lowerCaseMap)) { // 跳过小写的内容填充
                const engine = contentList.querySelector(`tr-engine[data-id="${id}"]`);
                if (engine) {
                    engine.appendChild(engineResult[id]);
                    engine.removeAttribute('data-id');
                    engine.style.display = 'block';
                }
            }
        });
        // 比较大小写内容
        for (const id in idsExtension.lowerCaseMap) {
            if (engineResult[id] &&
                engineResult[idsExtension.lowerCaseMap[id]] &&
                engineResult[id].innerHTML != engineResult[idsExtension.lowerCaseMap[id]].innerHTML &&
                engineResult[id].innerHTML.toLowerCase() != engineResult[idsExtension.lowerCaseMap[id]].innerHTML.toLowerCase()) {
                const engine = contentList.querySelector(`tr-engine[data-id="${id}"]`);
                if (engine) {
                    engine.appendChild(engineResult[id]);
                    engine.removeAttribute('data-id');
                    engine.style.display = 'block';
                }
            }
        }
    }
    /**隐藏翻译引擎指示器*/
    function engineActivateHide() {
        icon.querySelectorAll('img[activate]').forEach(ele => {
            ele.removeAttribute('activate');
        });
    }
    /**显示翻译引擎指示器*/
    function engineActivateShow() {
        engineActivateHide();
        icon.querySelector(`img[icon-id="${engineId}"]`).setAttribute('activate', 'activate');
    }
    /**显示 icon*/
    function showIcon(e) {
        log('showIcon event:', e);
        let offsetX = 4; // 横坐标翻译图标偏移
        let offsetY = 8; // 纵坐标翻译图标偏移
        // 更新翻译图标 X、Y 坐标
        if (e.pageX && e.pageY) { // 鼠标
            log('mouse pageX/Y');
            pageX = e.pageX;
            pageY = e.pageY;
        }
        if (e.changedTouches) { // 触屏
            if (e.changedTouches.length > 0) { // 多点触控选取第 1 个
                log('touch pageX/Y');
                pageX = e.changedTouches[0].pageX;
                pageY = e.changedTouches[0].pageY;
                // 触屏修改翻译图标偏移（Android、iOS 选中后的动作菜单一般在当前文字顶部，翻译图标则放到底部）
                offsetX = -26; // 单个翻译图标块宽度
                offsetY = 16 * 3; // 一般字体高度的 3 倍，距离系统自带动作菜单、选择光标太近会导致无法点按
            }
        }
        log(`selected:${selected}, pageX:${pageX}, pageY:${pageY}`)
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
            return;
        }
        selected = window.getSelection().toString().trim(); // 当前选中文本
        log(`selected:${selected}, icon display:${icon.style.display}`);
        if (selected && icon.style.display != 'block' && pageX && pageY) { // 显示翻译图标
            log('show icon');
            icon.style.top = `${pageY + offsetY}px`;
            icon.style.left = `${pageX + offsetX}px`;
            icon.style.display = 'block';
            // 兼容部分 Content Security Policy
            icon.style.position = 'absolute';
            icon.style.zIndex = zIndex;
        } else if (!selected) { // 隐藏翻译图标
            log('hide icon');
            hideIcon();
        }
    }
    /**隐藏 icon*/
    function hideIcon() {
        icon.style.display = 'none';
        icon.removeAttribute('activate'); // 标注面板关闭
        content.style.display = 'none';
        engineId = '';
        engineTriggerTime = 0;
        pageX = 0;
        pageY = 0;
        engineActivateHide();
        audioCache = {};
        engineResult = {};
        forceStopDrag();
    }
    /**发音*/
    function play(obj) {
        if (obj.url in audioCache) { // 查找缓存
            log('audio in cache', obj, audioCache);
            playArrayBuffer(audioCache[obj.url]); // 播放
        } else {
            ajax(obj.url, (rst, { response }) => {
                audioCache[obj.url] = response; // 放入缓存
                playArrayBuffer(audioCache[obj.url]); // 播放
            }, rst => {
                log(rst);
            }, {
                responseType: 'arraybuffer'
            });
        }
    }
    /**播放 ArrayBuffer 音频*/
    function playArrayBuffer(arrayBuffer) {
        const context = new iframeWin.AudioContext() || new iframeWin.webkitAudioContext();
        context.decodeAudioData(arrayBuffer.slice(0), audioBuffer => { // `slice(0)`克隆一份（`decodeAudioData`后原数组清空）
            const bufferSource = context.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(context.destination);
            bufferSource.start();
        });
    }
    /**得到发音按钮*/
    function getPlayButton(obj) {
        const type = document.createElement('a');
        type.innerHTML = obj.name;
        type.setAttribute('href', 'javascript:void(0)');
        type.setAttribute('class', 'audio-button');
        type.setAttribute('title', '点击发音');
        type.addEventListener('mouseup', () => {
            if (!isDrag(dragFluctuation)) {
                play(obj);
            }
        });
        return type;
    }
    /**有道词典排版*/
    function parseYoudao(rst) {
        let html = '';
        try {
            const rstJson = iframeWin.JSON.parse(rst);
            const phoneStyle = 'color:#808080;';
            if (rstJson.ec) {
                const word = rstJson.ec.word[0];
                let tr = '';
                const trs = word.trs;
                const ukphone = word.ukphone;
                const usphone = word.usphone;
                const phone = word.phone;
                const returnPhrase = word['return-phrase'];
                if (returnPhrase && returnPhrase.l && returnPhrase.l.i) {
                    html += `<div>${returnPhrase.l.i}</div>`;
                }
                html += '<div>';
                if (ukphone && ukphone.length != 0) {
                    html += `<span class="pron" style="${phoneStyle}">英 [${ukphone}] </span>`;
                }
                if (usphone && usphone.length != 0) {
                    html += `<span class="pron" style="${phoneStyle}">美 [${usphone}] </span>`;
                }
                html += '</div>';
                if (phone && phone.length != 0) {
                    html += `<div class="pron" style="${phoneStyle}">[${phone}] </div>`;
                }
                trs.forEach(element => {
                    tr += `<div>${element.tr[0].l.i[0]}</div>`;
                });
                html += tr;
            }
            // 网络释义
            if (rstJson.web_trans &&
                rstJson.web_trans['web-translation'] &&
                rstJson.web_trans['web-translation'].length > 0 &&
                rstJson.web_trans['web-translation'][0]['@same'] &&
                rstJson.web_trans['web-translation'][0]['@same'] == 'true' &&
                rstJson.web_trans['web-translation'][0].trans &&
                rstJson.web_trans['web-translation'][0].trans.length > 0) {
                let webTrans = '网络：';
                rstJson.web_trans['web-translation'][0].trans.forEach(({ value, cls }, i) => {
                    if (value) {
                        if (cls && cls.cl && cls.cl.length > 0) {
                            cls.cl.forEach(cl => {
                                webTrans += `[${cl}]`;
                            });
                        }
                        webTrans += value;
                        if (rstJson.web_trans['web-translation'][0].trans.length - 1 != i) {
                            webTrans += '；';
                        }
                    }
                });
                html += `<div>${webTrans}</div>`;
            }
            // 中英翻译
            if (rstJson.ce_new && rstJson.ce_new.word) {
                const arr = new iframeWin.Array();
                rstJson.ce_new.word.forEach(d => {
                    if (d.phone) {
                        const obj = new iframeWin.Object();
                        obj['phone'] = d.phone;
                        arr.push(objToXml(obj));
                    }
                    if (d['return-phrase']) {
                        const obj = new iframeWin.Object();
                        obj['return-phrase'] = d['return-phrase'];
                        arr.push(objToXml(obj));
                    }
                    if (d.trs) {
                        const obj = new iframeWin.Object();
                        obj['trs'] = d.trs;
                        arr.push(objToXml(obj));
                    }
                });
                html += `<div>《${rstJson.ce_new.source && rstJson.ce_new.source.name ? rstJson.ce_new.source.name : ''}》<br>${xmlToHtml(objToXml(arr), 'div')}</div>`;
            }
            // 中文翻译
            if (rstJson.hh && rstJson.hh.word) {
                html += `<div>《现代汉语大词典》<br>${xmlToHtml(objToXml(rstJson.hh.word), 'span')}</div>`;
            }
            // 长句翻译
            if (rstJson.fanyi && rstJson.fanyi.tran) {
                html += rstJson.fanyi.tran;
            }
        } catch (error) {
            log(error);
            html += error;
        }
        const dom = document.createElement('div');
        dom.setAttribute('class', ids.YOUDAO);
        dom.innerHTML = html;
        return dom;
    }
    /**金山词霸排版*/
    function parseIciba(rst) {
        let dom = document.createElement('div');
        dom.setAttribute('class', ids.ICIBA);
        try {
            let doc = htmlToDom(cleanHtml(rst));
            let mean = doc.querySelector('div[class^="Mean_mean"]');
            if (mean) {
                mean.querySelectorAll('ul[class^="Mean_symbols"] li').forEach(el => {
                    el.innerHTML = el.innerHTML.replace(/英/g, '英 ').replace(/美/g, '美 ');
                });
                let mt = mean.querySelector('p[class^="Mean_desc"]')
                    && mean.querySelector('p[class^="Mean_desc"]').innerHTML.includes('以上结果来自机器翻译。')
                    ? ',p[class^="Mean_desc"],h2[class^="Mean_sentence"]' : '';
                iterElementRemove(mean.querySelectorAll(`p[class^="Mean_tag"],p[class^="Mean_else"],ul[class^="TabList_tab"],h3[class^="Mean_title"]${mt}`));// 其它
                let ky = [];
                mean.querySelectorAll('a[href^="https://kuaiyi.wps.cn"]').forEach(el => ky.push(el.parentElement));// 快译
                iterElementRemove(ky);
                mean.innerHTML = mean.innerHTML.replace(/<li><\/li>/g, '');// GNU、MODE
                dom.appendChild(mean);
            }
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**沪江小D排版*/
    function parseHjenglish(rst) {
        let dom = document.createElement('div');
        dom.setAttribute('class', ids.HJENGLISH);
        try {
            rst = cleanHtml(rst);
            let doc = htmlToDom(rst);
            let label = doc.querySelector('.word-details-item-content header');
            let entry = doc.querySelector('.word-text h2');
            let collins = doc.querySelector('div[data-id="detail"] .word-details-item-content .detail-groups');
            if (entry) {
                let entryDom = document.createElement('div');
                entryDom.setAttribute('class', 'entry');
                entryDom.innerHTML = entry.innerHTML;
                dom.appendChild(entryDom);
                if (collins) {
                    if (label) {
                        let regex = /(《.*?》)/ig;
                        let match = regex.exec(label.innerHTML);
                        if (match && match[1]) {
                            dom.appendChild(htmlToDom(`<div>${match[1]}</div>`));
                        }
                    }
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
        let html = '';
        try {
            rst = rst.replace(/onmouseover/ig, 'data-sound'); // 发音链接预处理
            rst = cleanHtml(rst)
                .replace(/(?:a>)/ig, 'span>')
                .replace(/(?:<a)/ig, '<span');
            let doc = htmlToDom(rst);
            iterElementRemove(doc.querySelectorAll('.hw_ti'));// 牛津词头（不准）
            let entry = doc.querySelector('.qdef .hd_area');
            let concise = doc.querySelector('.qdef ul');
            let tense = doc.querySelector('.qdef .hd_div1');
            let oald = doc.querySelector('#authid');
            if (entry) {
                html += `<div class="entry">${entry.innerHTML}</div>`;
                if (concise) {
                    html += `<div class="concise">${concise.outerHTML}</div>`;
                }
                if (tense) {
                    html += `<div class="tense">${tense.outerHTML}</div>`;
                }
                if (oald) {
                    // 单条释义不显示序号
                    oald.querySelectorAll('.se_lis').forEach(({ parentElement, classList }) => {
                        if (parentElement.querySelectorAll('.se_lis').length == 1) {
                            classList.add('only');
                        }
                    });
                    let oaldHtml = oald.outerHTML;
                    oaldHtml = replaceHtmlTag(oaldHtml, 'table', 'div');
                    oaldHtml = replaceHtmlTag(oaldHtml, 'tbody', 'div');
                    oaldHtml = replaceHtmlTag(oaldHtml, 'tr', 'div');
                    oaldHtml = replaceHtmlTag(oaldHtml, 'td', 'span');
                    html += `<div class="oald">《牛津高阶英汉双解词典第八版》<br>${oaldHtml}</div>`;
                }
            }
            // 计算机翻译
            let machineTrans = doc.querySelector('.smt_hw');
            if (machineTrans && (machineTrans.innerHTML.includes('计算机翻译') || machineTrans.innerHTML.includes('Machine Translation'))) {
                let parent = machineTrans.parentNode;
                let zhText = parent.querySelector('.p1-11');
                if (zhText) {
                    html += `<div class="machine-trans">${zhText.outerHTML}</div>`;
                }
            }
        } catch (error) {
            log(error);
            html += error;
        }
        let dom = document.createElement('div');
        dom.setAttribute('class', ids.BING);
        dom.innerHTML = html;
        // 发音
        dom.querySelectorAll('[data-sound]').forEach(ele => {
            let str = ele.getAttribute('data-sound');
            let regex = /'(https:\/\/.*?)'/ig;
            let match = regex.exec(str);
            if (match && match.length >= 1) {
                ele.appendChild(getPlayButton({
                    name: '♫',
                    url: match[1]
                }));
            }
        });
        return dom;
    }
    /**谷歌翻译排版*/
    function parseGoogle(rst) {
        const dom = document.createElement('div');
        dom.setAttribute('class', ids.GOOGLE);
        try {
            dom.appendChild(htmlToDom(xmlToHtml(objToXml(iframeWin.JSON.parse(rst)), 'span')));
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**剑桥高阶排版*/
    function parseCambridge(rst) {
        const dom = document.createElement('div');
        dom.setAttribute('class', ids.CAMBRIDGE);
        try {
            rst = cleanHtml(rst).replace(/(?:a>)/ig, 'span>')
                .replace(/(?:<a)/ig, '<span');
            const doc = htmlToDom(rst);
            // 发音
            doc.querySelectorAll('[type="audio/mpeg"]').forEach(ele => {
                ele.appendChild(getPlayButton({
                    name: '♫',
                    url: `https://dictionary.cambridge.org/${ele.getAttribute('src')}`
                }));
            });
            // 内容
            doc.querySelectorAll('.entry').forEach(ele => {
                dom.appendChild(ele);
            });
        } catch (error) {
            log(error);
            dom.appendChild(htmlToDom(error));
        }
        return dom;
    }
    /**
     * 谷歌翻译 token 计算
     * 
     * function token(a), Copyright 2021 https://github.com/hujingshuang/MTrans.
     * “
     * 目前，本项目免费开源，开发者可基于此进行二次开发。
     * （English Translation: Currently, this project is free and open source, developers can be based on this project for secondary development.）
     * ”
     * */
    function token(a) {
        const b = 406644;
        const b1 = 3293161072;
        const jd = ".";
        const sb = "+-a^+6";
        const Zb = "+-3^+b+-f";
        let e = [];
        let f = 0;
        let g = 0;
        for (e = [], f = 0, g = 0; g < a.length; g++) {
            let m = a.charCodeAt(g);
            128 > m ? e[f++] = m : (2048 > m ? e[f++] = m >> 6 | 192 : (55296 == (m & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (m = 65536 + ((m & 1023) << 10) + (a.charCodeAt(++g) & 1023), e[f++] = m >> 18 | 240, e[f++] = m >> 12 & 63 | 128) : e[f++] = m >> 12 | 224, e[f++] = m >> 6 & 63 | 128), e[f++] = m & 63 | 128)
        }
        a = b;
        for (f = 0; f < e.length; f++) a += e[f],
            a = RL(a, sb);
        a = RL(a, Zb);
        a ^= b1 || 0;
        0 > a && (a = (a & 2147483647) + 2147483648);
        a %= 1E6;
        return a.toString() + jd + (a ^ b);
    }
    /**
     * 谷歌翻译 token 计算
     * 
     * function RL(a, b), Copyright 2021 https://github.com/hujingshuang/MTrans.
     * “
     * 目前，本项目免费开源，开发者可基于此进行二次开发。
     * （English Translation: Currently, this project is free and open source, developers can be based on this project for secondary development.）
     * ”
     * */
    function RL(a, b) {
        const t = "a";
        const Yb = "+";
        for (let c = 0; c < b.length - 2; c += 3) {
            let d = b.charAt(c + 2);
            d = d >= t ? d.charCodeAt(0) - 87 : Number(d);
            d = b.charAt(c + 1) == Yb ? a >>> d : a << d;
            a = b.charAt(c) == Yb ? a + d & 4294967295 : a ^ d;
        }
        return a;
    }
})();