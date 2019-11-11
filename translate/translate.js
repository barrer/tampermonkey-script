// ==UserScript==
// @name         Translate
// @namespace    http://tampermonkey.net/
// @version      6.5
// @description  划词翻译调用“金山词霸、有道词典（有道翻译）、Google Translate（谷歌翻译）、沪江小D、搜狗翻译、必应词典（必应翻译）、Microsoft Translator（必应在线翻译）、海词词典、百度翻译、Oxford Learner's Dictionaries、Oxford Dictionaries、Merriam-Webster、PDF 划词翻译、Google Search、Bing Search（必应搜索）、百度搜索、Wikipedia Search（维基百科搜索）”网页翻译
// @author       https://github.com/barrer
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    /**样式*/
    var style = document.createElement('style');
    var zIndex = '2147473647'; // 渲染图层
    style.textContent = `
    :host{all:unset!important}
    :host{all:initial!important}
    *{word-wrap:break-word!important}
    img{cursor:pointer;display:inline-block;width:20px;height:20px;border:1px solid #dfe1e5;border-radius:4px;background-color:rgba(255,255,255,1);padding:2px;margin:0;margin-right:5px;box-sizing:content-box;vertical-align:middle}
    img:last-of-type{margin-right:auto}
    img:hover{border:1px solid #f90}
    img[is-more]{display:none}
    tr-icon{display:none;position:absolute;padding:0;margin:0;cursor:move;background:transparent;box-sizing:content-box;font-size:13px;text-align:left;border:0;color:black;z-index:${zIndex}}
    `;
    // iframe 工具库
    var iframe = document.createElement('iframe');
    var iframeWin = null;
    var iframeDoc = null;
    iframe.style.display = 'none';
    var gm = {
        TEXT: 'barrer.translate.data.transfer.text',
        REDIRECT_URL: 'barrer.translate.data.transfer.redirect_url',
        HIDE: 'barrer.translate.data.config.hide',
        SORT: 'barrer.translate.data.config.sort',
        reset: function () {
            GM_deleteValue(this.TEXT);
            GM_deleteValue(this.REDIRECT_URL);
            GM_deleteValue(this.HIDE);
            GM_deleteValue(this.SORT);
        },
        set: function (key, value) {
            GM_setValue(key, value);
        },
        get: function (key, myDefault) {
            var value = GM_getValue(key);
            return isNotNull(value) || !isNotNull(myDefault) ? value : myDefault;
        }
    }
    var dataTransfer = {
        beforePopup: function (popup) {
            var text = window.getSelection().toString().trim();
            gm.set(gm.TEXT, text);
            popup(text);
        },
        beforeCustom: function (custom) {
            var text = gm.get(gm.TEXT, '');
            gm.set(gm.TEXT, '');
            custom.forEach(function (cus) {
                cus(text);
            });
        }
    };
    var iconArray = [{
                name: 'Bing 词典',
                id: 'bingDict',
                image: 'data:image/png;base64,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',
                host: ['www.bing.com', 'cn.bing.com'],
                popup: function (text) {
                    popupCenter('https://cn.bing.com/dict/search?q=' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: '有道词典',
                id: 'youdao',
                image: 'data:image/png;base64,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',
                host: ['dict.youdao.com'],
                popup: function (text) {
                    popupCenter('https://dict.youdao.com/w/eng/' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'More...',
                id: 'more',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAABYmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgIHRpZmY6T3JpZW50YXRpb249IjYiLz4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz7UGE7IAAACClBMVEX///9VYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBVYIBzg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79zg79VYIBzg79VYIBzg79zg79VYIBzg79zg79zg79VYIBVYIBVYIBzg79VYIBVYIBzg79VYIBVYIBzg79z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',
                host: ['more.example.com'],
                popup: function (text) {
                    icon.querySelectorAll('img[is-more]').forEach(function (ele) {
                        if (ele.style.display == 'inline-block') {
                            ele.style.display = 'none';
                        } else {
                            ele.style.display = 'inline-block';
                        }
                    });
                },
                custom: function (text) {}
            },
            {
                name: 'Google Translate',
                id: 'googleCom',
                image: 'data:image/png;base64,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',
                host: ['translate.google.com'],
                popup: function (text) {
                    popupCenter('https://translate.google.com', null, 800, screen.height);
                },
                custom: function (text) {
                    var source = document.querySelector('#source');
                    source.value = text;
                    tiggerEvent(source, 'input');
                    tiggerEvent(source, 'keyup');
                }
            },
            {
                name: 'Microsoft Translator',
                id: 'bingTrans',
                image: 'data:image/png;base64,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',
                host: ['www.bing.com', 'cn.bing.com'],
                popup: function (text) {
                    popupCenter('https://cn.bing.com/translator', null, 800, screen.height);
                },
                custom: function (text) {
                    if (window.location.href.indexOf('bing.com/translator') != -1) {
                        if (hasChineseByRange(text)) {
                            document.querySelector('#tta_tgtsl').value = 'en';
                        } else {
                            document.querySelector('#tta_tgtsl').value = 'zh-Hans';
                        }
                        var source = document.querySelector('textarea');
                        source.value = text;
                        for (var i = 0; i < 10; i++) { // 最低延迟 5 秒
                            setTimeout(function () {
                                tiggerEvent(source, 'input');
                            }, 500 + i * 500);
                        }
                    }
                }
            },
            {
                name: '搜狗翻译',
                id: 'sougou',
                image: 'data:image/png;base64,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',
                host: ['fanyi.sogou.com'],
                popup: function (text) {
                    popupCenter('https://fanyi.sogou.com/#auto/zh-CHS/' + encodeURIComponent(text), null, 1024, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: '百度翻译',
                id: 'baidu',
                image: 'data:image/png;base64,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',
                host: ['fanyi.baidu.com'],
                popup: function (text) {
                    popupCenter('https://fanyi.baidu.com/#en/zh/' + encodeURIComponent(text), null, 1024, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: '谷歌翻译',
                id: 'googleCn',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAM1BMVEX///8hlvPx+P4vnfRLqvWr1/pnt/c9o/XH5fx1vvhZsPaQyvmd0frj8v3V6/253vuDxPifZv7YAAAAAXRSTlMAQObYZgAAAzNJREFUeF7tWduu2zAMMyXfc+v/f+2wARu6paEVHwfDAcznIqRpWaZV960w8Tr+L38BgoUg+PwUP1AM/ABe8hA/EMXAD6T8ED/gxcA/3ASp+APdm/zDTRCPN+hh4QdQRpmwJ/yNQPiJ1G5+xb8oFn5es3YEgHyY8A8y4YWP8EL4B5ogEReIJwEKYLQJu8cFipAfDzPhUFzg9dGuAmLCsO3n53CgCdulo5pJyyAmjLLf77Rqx5gg1/b7hpkrDCb0Vz+KvXP3m7DgEqvt7uTl0798zV9ewUvMy+flx5EVJ9hyQk4YUsab7zJBCq6xvBMc9SM20sYMTq4K4xkSbWsMShdzRvYwi47khrRUM/x22rQIgiiGnp/E3hahq33zgZWENBqXF8DS0mRREGhmIZln1aymK9WDoMrFI4VYYDiPK1kTKVh66etmP9qF7CpvvpmdFbHej/6UJIj9RKpNQVZyYKixC3ulUWd5IehuSoBpZ/xcAS+Ez8kktpO3q2iitIPS2v0GLjCgtEJmsbxCozB+jsKjWiVh4M/yg+P8HIVZ7KWdaOtm56/04Xa2UHmqihe7TxpavZPdF+TmMCYKq9BzQ5N0R8HWjMTZ3eEXdjkPxK4gJIFkuDEIhJ+8xtYB1DTWHOSADJzTSTQkmtj9kul/agZWpKSj3cQKwk8UDNoGiYSfKKCXev+UhDsriaTKwcvXnTSLYbV4KOG/O1hYblfCFm3Bk9dB/78Hi9J3SocCxM1OnxMPG30K1LoPWwVaD7q+EUcKFnryBdMdSxSQUrC9k6vJwwCGmrvp8bKPyLgESj9o0EpRw8e9b+jenB1SwJGC/ONaAcfScYtS6OttRaGCI+19OYIjZrL1ZLTZkaSordKSmvKA25w11V2HLJ/3VDqlOUBQl6+AuJuE9a7noTvt388j0NHL81hokngekSfK8eCp7nwU9AFDUitWrO8ZdsFwvHXcg0eZsjn3gADnZE00V4j/Tf+MgJ8IiY3pNv2VVp4U4NwRhWSp7NyzAvqHIlOA1nvwowVUdw95tIApYAqYAqaAKWAKmAKmgJkJp4ApYAqYAqaAKcDne1i/Sx6YAqaAKWBi4gcHHzTEXirPfgAAAABJRU5ErkJggg==',
                host: ['translate.google.cn'],
                popup: function (text) {
                    popupCenter('https://translate.google.cn', null, 800, screen.height);
                },
                custom: function (text) {
                    var source = document.querySelector('#source');
                    source.value = text;
                    tiggerEvent(source, 'input');
                    tiggerEvent(source, 'keyup');
                }
            },
            {
                name: '金山词霸',
                id: 'iciba',
                image: 'data:image/png;base64,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',
                host: ['www.iciba.com'],
                popup: function (text) {
                    popupCenter('http://www.iciba.com/' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: '海词词典',
                id: 'haici',
                image: 'data:image/png;base64,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',
                host: ['dict.cn', 'hanyu.dict.cn', 'abbr.dict.cn', 'ename.dict.cn'],
                popup: function (text) {
                    popupCenter('https://dict.cn/' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: '沪江小D',
                id: 'hjenglish',
                image: 'data:image/png;base64,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',
                host: ['dict.hjenglish.com'],
                popup: function (text) {
                    popupCenter('https://dict.hjenglish.com/w/' + encodeURIComponent(text), null, 1024, screen.height);
                },
                custom: function (text) {
                    document.querySelectorAll('.word-details-button-expand').forEach(function (ele) {
                        ele.click();
                    });
                }
            },
            {
                name: 'Oxford Learner\'s Dictionaries',
                id: 'oald',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAwFBMVEX////6+PPx7Mz00YDtxVPVsVfkrSOrrJvd3MzRmBzwuCfusRfdpBr6wi2scgMxNQf81TnT0a+8fQJiRwonJhe+hwmNag6xiy7NjgiioV6hZQHy75fv4OZoVxzdmwZ7YiGJbCuYezgQGQJeaS5yc12IVwNNTiY/Swno7IPJ0nS3xFSpuzSBmwPG00nc43LT3Vm3yC2XrSqSrQWlvAtsiAJ7jyxNZAFddwFCCRrhpL7VhqaSP13px9fFb5FuKUGvV3jbwFaYAAAAAXRSTlMAQObYZgAAEEJJREFUeAHsltGamzgMhZcA6liSDQMxOLQAyTRk9/1fcCUb0u3tkunVHAB939zon2OdiL++9Hp96UtZlp3yvCiKEsoiL7+9yR/+YHdpXhiDICKWal1V5vnpDyGcTnnJDBuAVACshaCGIj/9gfbvBph/A8BEUNSExWfbkOWladhI/w1gB8G6PZe1VCw+04VTaYz3uwPA2lkBUKqrqtKiyOafZUJWdq7xvQdIAKgEsUYEnQNLKCqy7HP6N87LHZ4OpMrSXm4DdbcT4GeYcLoE5703PvB/AXAH8GxjFj6JIDv5Pv77wWtj8zwCBYjy8kQPpBJS8VqC7N00ZVEakfccZyDEIRQWUAcQvNZ6kDQCotVBeGn/PjSXXPU91/YJQMQUnjOA0YNzEefgtQQ/xjB147ws176/FMxmA4gzYEyMoVEOsv2tEgJAghfGMTt31HyM4zyOyzjyryGUCwKjClLB3nRtEefAYv6q/j9vflrGeV5m6e9NAgjMJtU4A7wBgJVJLGqMepEF7+09uHUWgGVZfXgCgJQJDEMEMFYLGiG4r+qByL6E4K0fnJ8TgByAD9OkABqGSRgURBtzAmjYCkGbJtG+5BAuEv9uXUTXufJTjxinzycHOIAKjbEoSmEQD+q0F04vMKBzTVedq2ptx+pOk8mTSuaIYLQ9g+HUMUglaxOBPZ5FmcD2Ud1u55vqPLFZrtf+0peXEjcAVAK7DaH1oCA130YhsMctyN6qSpufz/oWA66rhEHu1iE/PwcQ00rQigpgeWmFwB7+PBADUuukMHnpv4gJq+uR43dJUACKAJBSINVCXSsB0VELflzvbdveh7tqCM3Hh/bvx449QlwF5gkQ5dGyAJhEIADfs2NLwDWDuzfNMDjnmrDE/telZeOJQa6wL0VIRxDSERhNYzvrJGaHDCjdMDSDV4CmCW4du6uo6ij0CBNPEUBE0YF9BqwCyFsJ6HSEIPONc4Pz7j4IgqRRLkljSxTK7295XtQlb0cAKLI7gGcbCZb6UBKz93Zs24e8KtGvYTRE17kvyzLP85pBtAEgmMhhA8QQwnmp7RGAS/V4PKrHurdPulsya1qO7Qy0A0AEsBtAbRVhvF3rIwA/14dc1RoN2BHOhsxH+m1euz7OwH4EYIyNBD7OgK6H6noEoO8612kCUg5TJD1Nc+o/t2hSCihEH5A3B/x2BEUN1eXAEAYvanxo3BAl7e8N8ZJ+jpbWU29AAJADxzMwOwBbFbCtYTmwiHzTSA7kiQDqwzAE2nbjImkkz9M0MU2BEPUkpt+HUHjq4sCniFc1IewWtAJgOoni2ko0RiIu87/zorCQVgLtSzEBIErB+gBAp5q7eW5FVSW36LYl4kxI01KW/+i3co4MhOKARVWcAYsQy/8H+CYRWOWRKCad02pKofSW6GMVI8ZlGaUTAaVfwDSEquMAsb28tbleN+2c1BJR/FIbxaDBWEDaj8BiwNcAzLP634k0gvLEonupcYGmlIZlrgxHAEIFoAQALwA4Be/1DsG7QQLonJShmaR7mIiWdYxxrJwNRttj2sokFfEJ8C+rVt6YqLMEf5rNYSTy8IqG1WwgyjHMwMj1vv8ne1U9/pRc768tB4G9qqanq3sg+5MLxkGW5dt8mwU/9ysxwZxfYsEZzTCfHQBxI+npxqfH1WS6n0ICt4TEuSX8LCDIVAEolefalFWVBw/fVcINMJcIzF8O4J5LCA7EfLeELRL2xkc2RzyL8MyFYFOEBTA87zsBo3Fmi5O1Klel0dWprk9EHoy+luLZbC04sCty8BBTLCMegD8Fnm/D4HcYhr+8KRXcgRgyXARuPr/ky0CdW2OMrh25AJKy8ddm5OAofX67L7pxuRQFG7hxclzIbnl7C3aAM6cPvLv/PD6Fn6ZvVWrKsgB37ZhxKGtLU+rqUzaM7hPnQ8fqcOQ1+fGR3ryfPh/51Lp79RcrenEgwPv8fDZKjWoqcBdF7chtqwwEVVWpy6o0448bEnicTjzsDgvggPNhfXihJVCVuUuce+gHxxheRHPeTWGGO5DSjZIDXILRcJevq/rUcPJNQ34kQVqeNOZeUYXOTfhRwYT9kDnoDDiHEQRQQB1zPChOQcwHx7fFAsknLnxiRaYCbNCGL2tGgaqBrjgVdWF1aSoF6hIiUl2UyAnFdRgqGN2uAPDThi+HGTDHDW/pChFwOB5ZDf8sfG+KvTJbEgWQH7vzD5vSoEHc61Ny0pnKQ85YmbSyRuvKjNPUmMqWZTqMwWg8dxEgJabP1rjfAHI/W+E5+UA3LnZ//MXEw0s0bwNN+81EtieIwHBL+FD7PVZAmzA1uqgqleKi1LZEAKgCKzAOQ2OGeTCerC51aI3xL3awpQz2RiJaek/szuOQb/EnFAAVG8+7rsCo0tssTZHvldYGYVcWC5CHYQpOq1PIadoS0dDVIG0CZHe8EyMSCc9ywJXnOuBf3Pj05/V5i63yww3CLxXZm15nk9txyGhbrVTIgKcmDateMQNTyijTqqM2KBksWwwnOn5HDUse5bRkMbhgDX6mI8ICS779mrIgoDxf3+CPdVNXIAV13nLmaZrCeTYLw7JrU5m6VgHY06w0g535ERHgv0vsXvnBEmA9Fmu3ScUApo6fT85//NnkDvz4lcldePmHDHx2ypB6xqBk6s6CEBey6M2y1Zh62bRBmukKCAZvaMQHSHsMblBdGqIjYkhrgjv3U0/4WQ7YnDwRgAhcM2DMmNuGicfM061N85hW0CA8HRVTIIyjtlSgryv7++rEzUQ2hQBdADUAN8oYECDlaEP++NXxH56ensmOMbm58Gd0Oybek5LrDCGtT3ZdpoZxyFAJl0lVC4rtoBixGs2FC2fh3+Mz30MWuHmBCByOO9Yj8DP0OCjgdnTxcyiWK9sEBchdY8UxYXy3W9gyr4jEBzkKpR62xuAcgRUEzPFxe4TZGuMg2cBtq+zXaIzFI5vTr193OD0+XGaRlTJXgyVulsqQToktw9BGkdW4VSySUVErnSEcw2JwC4Kz74/47M4N8mxN50chl60yy8Hbze8gDG+uGRj0LLhiPtNFCbRozSWBHp11UXcOfNXHOYyS5UqdstGgKzv7c+CK7E4Bbp2A6AKWg7sYVsR7lPHAS60Le45595GPJEtDk4EI9/iFxLXmut6alOyWHXrw1x9i0JEPzDuHVxmuIAKoxv/l8fI0ffLiI39r8TYo6a0flwwzZ2nfc9NGSa4rRdRVEfnoEFiRk79MrHKbhOIUDHdwzy9rvKpZz2d0AbFfrfauK2Bc7LhhAsawAz7bYRtWUVQjzJIFLL25H/WacggI4LpnJscidjXIBQ/DrhiuYDaMObnpATYdGTzmAOiFfxXHUo3eHgYCxhWyi1nA9c0R46ph2AkEXiEX8cvKIhaRX5zR5KOPP7KYgUNc6GhXFCJicEAXr5GA62Ms79UH/EBWd36/NYbcSoxW+Aw72PMsSw3I3fYoiaJG2DHsx60JKiLjTz4ye6SEHvf8vBZHrp/XfnRcsj29D/gBY1SC6FZCDlBA1OBS5QiJJbuj7aKoLxriswBgC79jILzYgGDsaEp5cqMz6BAY0e1Y3z8/g2SpjfyocOwiYOnD/JCRnKyQCy0FdLwi2i9PCtuYTILEDSkG0hsFrj0uj/ef/2Z+qivI60UA+azKA5OVbQRC3jcORR9FSXNG8UXAKHiPhT5mh2RF4heqE73o3Ojj8h3++QSFOfc+MrwgbJ4BuXVrHiHaF/TLqGv6/ocIUMLb82xFTGhHl5FMCdk3bvYvm/3td+9mFRKs8RldsrPSWYn6qYnA+FFA0vQAVTx8/78H7vBKBgPHFW6biP78+P1zpipEQFJlgLATzDRfYk4+oe2is4Cub7ejn36IeuuhDkzOfnD87iHy9vcPfycnnb/s3rf6yi7wZcpXQEDfdV1v8zwb//xfOILbO2/iYjCVMZl4t8HPPzS/x2Rb3+d0r9xA3yAJ/AF/h9uua7d5Zpst9yQ/Y4yf2txObp9vsQ3d3gfBP/8PAfMuj7HgsuJCfYm5z4DLIXqOmHxum667H/3z1zBi0qs6QS3wQX4FGSmAUcenS47vyJFWfuHhn78oIHcpFwH/Jtw1AmR2aLZlaRt3Gwd/U8D9ZcUjhvqKhAIESdL18ZHf7m47+l+7ZtCbOBJEYXwyNzSSL0h9Mgg0szPanUMY16uurv//r7ZftYMJsyuto3VOeShW4PI+13vVQYH/EyC15WYGV8bNifMnAMLv9PJCvio+q+qfi9x1gpT20PweguOtlXwYeYt3EWCshi9HHg+/AuBAgMPpbQU6TMhiOSUrBFj9za39r/A9tBteAOoLw6/jtx/fvtfo2QgSEOC4e1BKUkZPYpI6L3wlQ9IqhHSk3zPA9XYYzsevP6J48ZQAw/VwuDwMIGURTKMCJpIsAASQPq0h+HL6DeDK5L/++df3cG/RtxG8GUA2SMY0leIQ2VeALvFFqKd1LWgAQ73Ra7jdIvmwD/MF4HBKi7+bJJ+oApHkukvSZYiooltD8NIAxhsJDtdTPW//4Im3uPN9fwPYL/5wg5RSSGAie3duwwywiuDLnDH9ovY/efOkCfNqHwBU3z3M381QvExFlROwAEgEcPgagq6/Rcvr7GvyrP1b97gGwLm7nx9u5gY4MzDjBMwTkLsGYJDdCvUNoB6z19viTttF9E93ZnMngJlGALEFKvWaLABg6FYR8L9Jc9Pu9s8AzT/UF8DcAXACEAMjQM4BUFwAyKoi9udTxEyF+7MG+t/F4M0MIhFBA1DEBICYgJus+zD45x1guD5518d4fTxdegPL5yLnqcrFjeeApJxyA3BXyMo/S+dIgHr2r2Sn/eNAL0XdXYdStIzTiOSQhCKdSIIZAcyAvPYT8dPvBHH3w+Xt4ZqmGFRxk6z1tyLOLdDqj2wEEIuA1r87OA3DDEBjPsZDtd8/VXbk+UsKLQHsrQNcQZkB3KOGa5X250vtGx/hf7hczv3uWedSRjXTUoaKUkFi3ho5NAAQwBBzW8/Q93UnTpfT+dz3X9Lud5158+7qiC5OCheBas4CEEB5hSG//yvaaU/9ywhRAQpbaLCpSmGCUjxlAK8TIMEC8H6Sf2Iwr27qqmZOgAKSFGcFXgHM3wPwH0tjqrGG9wmYC4oqSDADUATYQgRwpQzzBBywAMAM0DLYEsAJMQO4OQBVgdEYbQIbAkDp3kqo0xgAxi2AAW5OgE0nIEp5GJXoQBXUE6r8IYK0EUB2jQRozIOomJmDlQhjvAJItxFAFwDmagZOYI6AHGHMyXhbgg1L0AB8AWjnXwPYsoPU/i2AGhG0oBG0Em6XAGVtC3i3MQGLCRjl5kUNGyZA7dmBBcDtHgFsjsBlt6WkTQAaESideQXg3gAs7TYVGsBElSkmHxgWk8G2AVDJ4iQsYxAQQItRHgD031ZdhqvPWxAzDwC4g0+5AVsrR9ZeAczvAOaEcklbA1Ap/MpYTK0B+ByB7D5IYq46ldhHvAK4ye7DlGEVQGcArzLLafeB6hI8ALgFbpCPtQ+ELiVE/y2npXsfD5G6br37pz71qb8BRUHIGKi3vsoAAAAASUVORK5CYII=',
                host: ['www.oxfordlearnersdictionaries.com'],
                popup: function (text) {
                    popupCenter('https://www.oxfordlearnersdictionaries.com/search/english/?q=' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'Oxford Dictionaries',
                id: 'ode',
                image: 'data:image/png;base64,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',
                host: ['en.oxforddictionaries.com'],
                popup: function (text) {
                    popupCenter('https://www.lexico.com/search?utf8=%E2%9C%93&filter=dictionary&dictionary=en&query=' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'Merriam-Webster',
                id: 'mwcd',
                image: 'data:image/png;base64,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',
                host: ['www.merriam-webster.com'],
                popup: function (text) {
                    popupCenter('https://www.merriam-webster.com/dictionary/' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'PDF 划词翻译',
                id: 'pdf',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAB0VBMVEX////i5efi5efi5efi5efi5efAxsvi5efi5efi5eewt73i5ee1u8G/xcrJztLb3+Gyub/N0dW+xMnW29/K0djxVkLxVkLxVkLxVkLwZFLsiHzk1tbxVkLwYlDxWkb2joD3m4/2jH/zcWDxWUXxV0Pzaljza1rzaVfxW0fza1nyX0zyY1H+7uz/////+/v5u7PyYk/1h3n96uf+9PL70873npPyZVL3pJn+8vD//Pv7zsjxXEn3oZb+8e/1in395uP/+vr2lon5ta3++Pfzbl3xW0j//v75sqnxWUb0e2z1g3T96OX+9PP82dT94d7829b839v/+vn70cv+8O74qqD6xb/yYE36x8H1iHr0dmb0dWX4p5z2joH94+D0fW73mY37ysT0fm74ppv0emr95uT83dj71dD1hHX7zcf5s6vzbFr96uj1gXL2k4b/+fj++PjyY1D3oJX5saj1hXf1iXv0fm/zcmH819PxWET2lIj+9fT1i33zdGP81dD95OHzb133mo73npL94t72kIP+8vH6v7j6w7z1gnT84Nz97Or0fGzyYU783Nj6xb7+8/L6xr/yXkv2lor84d3sbl/hopzta1vM0tjM09rS2N7M09ng4+XO9mvSAAAAHXRSTlMAJH6y5v/AAW71/7T///////////8apub/////6uVo/FUAAAMkSURBVHgBpM4FAcNAAASw0pXp37/YKRg1UZDmk7brhzw0Nmyalzy38mDaIlYezMEADtqFAzbo4gEa9BrQwaABHUQDOPAADjyAAw/gwAM48AAOPIADD+DAAzjwgA48gAMP4MADOPAADjyAAw/gIGjXQdCx4iDoXHEQdN04iCqrDcKqDeLKLYPEXefxEvm5kZVKQFgEOwAQOwdCAAAADIT8rXdJ7CPoFjBoAwZlwKANGLQBgzZgUAcM2oBBGzBoAwZtwKANGLQBgzZg0AYM2oBBGTBoAwZtwKANGLQBgzZg0AYM0gBjpx607AiiKAy/xGCP7Tlj27Zt2/aNnTxx6rRyO11xdUf9L+7F7+KUD/gDAaFh4XCpiMiobwNCo+FiMVHfBITB1SK/CQiHq0V8EwCX8wE+wAf4gJ8AxMbF6yUkJsEqOSVVKy0d9pIyUq0yVQCysskqJzcPevkFZFZYVFwCq9Iy+lR5ReWvA6oouOoacMm1FFxZPoxK6shW/a8DGshWYxNEzWSvpbUNWu1kr0MNoDOXq+giUXeyCejpFfX1k9aADDA4lKwGMAytkVESjZmAcXBJE5PlvKYsQF2zWTKgFIC2aTGGbABuhv+nBekWAFaqAZgVY84BwDzPBS8Ai2IsOQGoEHPZC0CcGCsSwCrfR7IHgDUx1iWANN4bBoA2jSq2FAOSh0i0LQEk7/B5OM5wd08RoG+fO+gj0eaIBNDGl3joANCREoCtlmNIACe80xyA0zPlgPIqyADnYl7AAJRfGl0BqgHXJ5ABzm74jXbxDGsbuMnLW0AKmOV558U7IAfc81/w4ew3AVIDc8StwnPAo0FRIek9hluAdSJ64gTYK9+Ha4Cnxv/L3jMK7vkLGL3cJXqlFoCG7Ncj+LyOZTJ68/A28A5W7/s+dHxs3wxSMATBIMqv/qS09eaamqdtHUFD0cds5l3AB64ceXqYSEACEriDPVQW9lRbyWP11qhzfaktXwQQ+Vs6W2CQBfZJFehj6tdMAhKQwHOB8DclmCefAG8bvWKcafaLST/T8BkTTdNvzLoYxu+YFPH5OP9/S/DudP8HpbfsWEKgc+EAAAAASUVORK5CYII=',
                host: ['pdf.example.com'],
                popup: function (text) {
                    openInNewTab('https://barrer.github.io/tools/pdfjs/web/viewer.html');
                },
                custom: function (text) {}
            },
            {
                name: 'Google',
                id: 'googleSearch',
                image: 'data:image/png;base64,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',
                host: ['www.google.com'],
                popup: function (text) {
                    popupCenter('https://www.google.com/search?q=' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'Bing',
                id: 'bingSearch',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAFUUlEQVR4AWL4//8/WZhhWkcBoL17gLElieIwnrVt27Y3Wtu2bdu2Hay98bNt27Z5X+6c/YJe1KJnXt2ZudXnn+T3/KZrbn3prh50YSLG4TMcavx5WmR5J/8sWAh9cDPWLfYLpwA+gf2PBfi8uGcFBfAdrJb64BadFfwGkFmIz3GYXnifAeisoAB0VlAA+WeF9XxOhgLILMQXPs8KCiDUF7f6PSsogPCscLDPiVIAmTLu8zpZCgAoY1OvE6YAgHN9T5wCuEiTBwUgCkAUgCgAUQCiAEQBiAIQBSAKQBSAKABRAKIARAGIAhAFUGgKgD/fFi3QGy1xrZMvKVcA/Nk6GAILLMb3OA0rF3cyFcDusBzT8HYxv79AAewAq4PBeATbKoDirAH6wuqoBm1wTfrfrq4AboFFWIzvcGqa6wUFsC4WwipgKt7GQQogjQCysX0Oq7BBeDiN9YICOBRWT2rQunrXCwogG18fWD1bhG9xSvWtFxTAzbAGNBVvVc96QQGsiwWwRjAID2EbBdA4AWRj/AzWiGrQCldjHQXQ8AEcAouX4npBAWTj7AWrMlPwJg5UAPUfwE2wKjawftcLCmAdLIBVuTJa4qr49YICCMf6KSwhi/ANTsZKCiA+gINhicrWCwcogJwAcsbbE5a4AXgQWyuAugdwIyxxEesFBbAO5sMKZiG+xnYKIH/MH8MKaiZ2UwD/P+aDYAX2lALIH3cPWEF9pwDyx3297wAUwNqY5zMABZCN/SPfASiAA/0GoACy8Xf3HYACOAFLYQlTAJERnFGgBaECiLgruA5dYYlTAJEx7If3MDv9ABRATAhr4Aq0Tz8ABRAbwx54AzPSD0ABxISwGi5CS9SkH4ACiIlhZ7yEKekHoABiQlgFN2KZswAUAMdfHQ9irqMzgALguCvgUox1tgZQABzzWHR3dhegADjWrvjN2W2gAuAYG+NdLIMlQAFU8J7/AcyBJUABVHCBdwnGwBKkACIm/xh0g6VGAcQv8H719/UA+oqgjfAOSrAEKYCIBd79mANLlwI4ezkWeBdjNKygvvISwDysXYexHo2usIK7z0sAL9VyjLvgF5gDnbGOhwA+xwq1WOC9jRKs4BbjCazm4fkAn2GFnAXefZgNc6ApdvbyhJBw8sMF3kUYDXNgEi709IygT/9n8o9GF5gDZbyLdf08JCqY/ODr8n6GOdEdB3l7TNwnWCE47oZ4CyWYA3NwG1Z09ZzAbPKDBd69mA1z4lts7vFJoR8Hk38hRsGcGI7j/T0rOJh8fj4KnWFOLMFTWM3rw6I/wgrYCT/BHGmOXTw/Lv4jbIQ3UYI5MRkXe98w4gvch1kwJ8p4D+t53zFkMkbDHOmJQ/ztGSRzcTtW8rdplHyPLfxtGycjcIK/jSNlCZ7B6v52DpUW2NXf3sEyBZf62zxayvgA6/vbPl564dDsdVEAfszDndk9vQLw5Qdsmb0WCsCPkTgpew28B/ABzImlePbv9/QK4GSYA62C/fgUALIIHsAyWAFNxWXh+6wAEESwF1oX7J7+o/x7egUQhnAxJsIS1huH5byvCiBng+bXErwszMPd2T29AogPYU+0giXgJ2yVjV0BVDaEi6r4sjAKp/zP+BVABTdlehWlKrqnfx5r5I9fARTtstAae2jS4wOIvSxMgDWgabgifvwKILXLQg0+xgaa6OoJINyRqyWsHvTBEZrgKg0gCOHCCl4W5uMerKzJTSCA4LLwSuRl4WdsHT8eBZDaZWE0TtVkJh5AEMIFtbgslPCC7umLFUB4WXgZJVigLfbUBBY0gCCE3fE9ZqALrtTEVc7vquRzBPZVAfAAAAAASUVORK5CYII=',
                host: ['cn.bing.com', 'www.bing.com'],
                popup: function (text) {
                    popupCenter('https://www.bing.com/search?q=' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: '百度',
                id: 'baiduSearch',
                image: 'data:image/png;base64,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',
                host: ['www.baidu.com'],
                popup: function (text) {
                    popupCenter('https://www.baidu.com/s?wd=' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'Wikipedia',
                id: 'wikipediaSearch',
                image: 'data:image/png;base64,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',
                host: ['en.wikipedia.org'],
                popup: function (text) {
                    popupCenter('https://en.wikipedia.org/wiki/' + encodeURIComponent(text), null, 800, screen.height);
                },
                custom: function (text) {}
            },
            {
                name: 'Settings',
                id: 'settings',
                image: 'data:image/png;base64,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',
                host: ['example.com'],
                popup: function (text) {
                    popupCenter('https://example.com', null, 800, screen.height);
                },
                custom: function (text) {
                    settings();
                }
            }
        ],
        hostCustomMap = {}, // {host: [method, ...]}
        customMadeIconArray = getCustomMadeIconArray(true);
    // id、host 唯一性校验
    var idMaps = {};
    var hostMaps = {};
    customMadeIconArray.forEach(function (obj) {
        if (obj.id in idMaps) {
            alert('Duplicate Id: ' + obj.id);
        } else {
            idMaps[obj.id] = obj.id;
        }
        obj.host.forEach(function (host) {
            if (host in hostMaps) {
                log('Duplicate Host: ' + host);
            } else {
                hostMaps[host] = host;
            }
        });
    });
    log('idMaps:', idMaps, 'hostMaps:', hostMaps);
    // 初始化 hostCustomMap
    customMadeIconArray.forEach(function (obj) {
        obj.host.forEach(function (host) { // 赋值DOM加载后的自定义方法Map
            if (host in hostCustomMap) {
                hostCustomMap[host].push(obj.custom);
            } else {
                hostCustomMap[host] = [obj.custom];
            }
        });
    });
    log('hostCustomMap:', hostCustomMap);
    var icon = document.createElement('tr-icon'), // 翻译图标
        selected, // 当前选中文本
        pageX, // 图标显示的 X 坐标
        pageY; // 图标显示的 Y 坐标
    // 绑定图标拖动事件
    var iconDrag = new Drag(icon);
    // 翻译引擎添加到图标
    var isIconImgMore = false;
    customMadeIconArray.forEach(function (obj) {
        var img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.addEventListener('mouseup', function () {
            dataTransfer.beforePopup(obj.popup);
        });
        if (isIconImgMore) {
            img.setAttribute('is-more', 'true');
        }
        if (obj.id == 'more') {
            isIconImgMore = true;
        }
        icon.appendChild(img);
    });
    // 翻译图标添加到 DOM
    var root = document.createElement('div');
    document.documentElement.appendChild(root);
    var shadow = root.attachShadow({
        mode: 'closed'
    });
    // iframe 工具库加入 Shadow
    shadow.appendChild(iframe);
    iframeWin = iframe.contentWindow;
    iframeDoc = iframe.contentDocument;
    // 外部样式表
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = createObjectURLWithTry(new Blob(['\ufeff', style.textContent], {
        type: 'text/css;charset=UTF-8'
    }));
    shadow.appendChild(style); // 内部样式表
    shadow.appendChild(link); // 外部样式表
    shadow.appendChild(icon); // 翻译图标加入 Shadow
    // 重定向前隐藏页面主体
    if (gm.get(gm.REDIRECT_URL, '') && window.location.host == 'example.com') {
        document.documentElement.style.display = 'none';;
    }
    window.addEventListener('DOMContentLoaded', (e) => {
        log('DOM fully loaded and parsed');
        // 重定向
        var redirect_url = gm.get(gm.REDIRECT_URL, '');
        log('redirect_url:' + redirect_url);
        if (redirect_url && window.location.host == 'example.com') {
            document.documentElement.style.display = 'none';
            document.body.innerHTML = '<a id="redirect_url" rel="noreferrer noopener" href="' + redirect_url + '">' + redirect_url + '</a>';
            document.querySelector('#redirect_url').click();
            gm.set(gm.REDIRECT_URL, '');
            return;
        }
        // 弹出后的新页面判断是否进行自动化处理
        var text = gm.get(gm.TEXT, '');
        log(gm.TEXT + ': ' + text);
        log('url: ' + window.location.href);
        log('host: ' + window.location.host);
        if (text && window.location.host in hostCustomMap) {
            dataTransfer.beforeCustom(hostCustomMap[window.location.host]);
        }
    });
    // 鼠标事件：防止选中的文本消失
    document.addEventListener('mousedown', function (e) {
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', showIcon);
    // 选中变化事件
    document.addEventListener('selectionchange', showIcon);
    document.addEventListener('touchend', showIcon);
    /**日志输出*/
    function log() {
        var debug = false;
        if (!debug) {
            return;
        }
        if (arguments) {
            for (var i = 0; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
        }
    }
    /**是否非空*/
    function isNotNull(obj) {
        return (obj != undefined && obj != null) || false;
    }
    /**转 int*/
    function myParseInt(str, myDefault) {
        var rst = parseInt(str);
        return isNaN(rst) ? (isNotNull(myDefault) ? myDefault : 0) : rst;
    }
    /**数组移动*/
    function arrayMove(arr, oldIndex, newIndex) {
        if (oldIndex < 0 || oldIndex >= arr.length || newIndex < 0 || newIndex >= arr.length) {
            return arr;
        }
        if (newIndex >= arr.length) {
            var k = newIndex - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
        return arr;
    };
    /**带异常处理的 createObjectURL*/
    function createObjectURLWithTry(blob) {
        try {
            return iframeWin.URL.createObjectURL(blob);
        } catch (error) {
            log(error);
        }
        return '';
    }
    /**触发事件*/
    function tiggerEvent(el, type) {
        if ('createEvent' in document) { // modern browsers, IE9+
            var e = document.createEvent('HTMLEvents');
            e.initEvent(type, true, true); // event.initEvent(type, bubbles, cancelable);
            el.dispatchEvent(e);
        } else { // IE 8
            var e = document.createEventObject();
            e.eventType = type;
            el.fireEvent('on' + e.eventType, e);
        }
    }
    /**弹出居中窗口*/
    function popupCenter(url, title, w, h) {
        gm.set(gm.REDIRECT_URL, url);
        url = 'https://example.com';
        w = w > screen.availWidth ? screen.availWidth : w;
        h = h > screen.availHeight ? screen.availHeight : h;
        var x = screen.availWidth / 2 - w / 2;
        var y = screen.availHeight / 2 - h / 2;
        x = x < 0 ? 0 : x;
        y = y < 0 ? 0 : y;
        var win;
        try {
            win = window.open('', title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + y + ', left=' + x);
            win.opener = null;
            win.location = url;
        } catch (e) {
            win = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + y + ', left=' + x);
            log(e);
        }
        if (window.focus) {
            win.focus();
        }
        return win;
    }
    /**打开新的标签页*/
    function openInNewTab(url) {
        gm.set(gm.REDIRECT_URL, url);
        var a = document.createElement('a');
        a.setAttribute('target', '_blank');
        a.setAttribute('href', 'https://example.com');
        a.style.display = 'none';
        shadow.appendChild(a);
        a.click();
    }
    /**是否包含汉字*/
    function hasChineseByRange(str) {
        return /[\u4e00-\u9fa5]/ig.test(str);
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
            ref.elementOriginalLeft = myParseInt(element.style.left);
            ref.elementOriginalTop = myParseInt(element.style.top);
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
            if (!ref.dragging) {
                return;
            }
            e.preventDefault();
            // move element
            element.style.left = ref.elementOriginalLeft + (e.clientX - ref.mouseDownPositionX) + 'px';
            element.style.top = ref.elementOriginalTop + (e.clientY - ref.mouseDownPositionY) + 'px';
            log('dragElement');
        };
        element.onmousedown = this.startDrag;
        element.onmouseup = this.stopDrag;
    }
    /**强制结束拖动*/
    function forceStopDrag() {
        // 强制设置鼠标拖动事件结束，防止由于网页本身的其它鼠标事件冲突而导致没有侦测到：mouseup
        if (iconDrag) {
            iconDrag.dragging = false;
            iconDrag.unsetMouseMove();
        }
    }
    /**显示 icon*/
    function showIcon(e) {
        log('showIcon event:', e);
        var offsetX = 4; // 横坐标翻译图标偏移
        var offsetY = 8; // 纵坐标翻译图标偏移
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
        log('selected:' + selected + ', pageX:' + pageX + ', pageY:' + pageY)
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) { // 点击了翻译图标
            e.preventDefault();
            return;
        }
        selected = window.getSelection().toString().trim(); // 当前选中文本
        log('selected:' + selected + ', icon display:' + icon.style.display);
        if (selected && icon.style.display != 'block' && pageX && pageY) { // 显示翻译图标
            log('show icon');
            icon.style.top = pageY + offsetY + 'px';
            icon.style.left = pageX + offsetX + 'px';
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
        pageX = 0;
        pageY = 0;
        icon.querySelectorAll('img[is-more]').forEach(function (ele) {
            ele.style.display = 'none';
        });
        forceStopDrag();
    }
    /**设置*/
    function settings() {
        var hideConfig = gm.get(gm.HIDE, {});
        var sortConfig = gm.get(gm.SORT, []);
        log('hideConfig: ', hideConfig);
        log('sortConfig: ', sortConfig);
        var allSortedIconArray = getCustomMadeIconArray(false);
        document.querySelectorAll('style,link,script').forEach(function (ele) {
            ele.remove();
        });
        document.querySelectorAll('title').forEach(function (ele) {
            ele.innerHTML = 'configuration page';
        });
        document.title = 'configuration page';
        document.body.innerHTML = '';
        document.body.style.padding = '20px';
        var desc = document.createElement('div');
        desc.innerHTML = '<h3>After the change, close the configuration page and refresh the current page, the new configuration will take effect.</h3>';
        var reset = document.createElement('button'); // 重置配置
        reset.innerHTML = 'reset settings';
        reset.addEventListener('click', function () {
            var r = confirm("Do you want to reset user settings?");
            if (r == true) {
                gm.reset();
                settings();
            }
        });
        document.body.appendChild(desc);
        document.body.appendChild(reset);
        document.body.appendChild(document.createElement('hr'));
        allSortedIconArray.forEach(function (obj, i) {
            var item = document.createElement('div'),
                name = document.createElement('span'),
                up = document.createElement('a'),
                down = document.createElement('a'),
                show = document.createElement('a'),
                span = document.createElement('span');
            name.innerHTML = obj.name;
            span.innerHTML = '&nbsp;&nbsp;';
            up.innerHTML = 'up';
            up.setAttribute('href', 'javascript:void(0)');
            up.setAttribute('index', i);
            up.addEventListener('click', function () {
                var index = myParseInt(this.getAttribute('index'));
                var newIconArray = arrayMove(allSortedIconArray, index, index - 1);
                var idArray = [];
                newIconArray.forEach(function (sObj) {
                    idArray.push(sObj.id);
                });
                gm.set(gm.SORT, idArray);
                settings();
            });
            down.innerHTML = 'down';
            down.setAttribute('href', 'javascript:void(0)');
            down.setAttribute('index', i);
            down.addEventListener('click', function () {
                var index = myParseInt(this.getAttribute('index'));
                var newIconArray = arrayMove(allSortedIconArray, index, index + 1);
                var idArray = [];
                newIconArray.forEach(function (sObj) {
                    idArray.push(sObj.id);
                });
                gm.set(gm.SORT, idArray);
                settings();
            });
            show.innerHTML = 'show';
            show.setAttribute('show-id', obj.id);
            if (isNotNull(hideConfig[obj.id])) {
                show.innerHTML = 'hide';
            }
            show.setAttribute('href', 'javascript:void(0)');
            show.addEventListener('click', function () {
                if (this.innerHTML == 'show') { // 隐藏
                    if (this.getAttribute('show-id') != 'settings') {
                        hideConfig[this.getAttribute('show-id')] = true;
                    }
                } else { // 显示
                    delete hideConfig[this.getAttribute('show-id')];
                }
                gm.set(gm.HIDE, hideConfig);
                settings();
            });
            item.appendChild(up);
            item.appendChild(span.cloneNode(true));
            item.appendChild(down);
            item.appendChild(span.cloneNode(true));
            item.appendChild(show);
            item.appendChild(span.cloneNode(true));
            item.appendChild(name);
            document.body.appendChild(item);
            document.body.appendChild(document.createElement('hr'));
        });
    }
    /**得到定制化的图标顺序*/
    function getCustomMadeIconArray(hide) {
        var hideConfig = gm.get(gm.HIDE, {});
        var sortConfig = gm.get(gm.SORT, []);
        log('hideConfig: ', hideConfig);
        log('sortConfig: ', sortConfig);
        var customMadeIconArray = [];
        var tempArray = [];
        // hide
        iconArray.forEach(function (obj) {
            if (hide && !isNotNull(hideConfig[obj.id])) {
                tempArray.push(obj);
            } else if (!hide) {
                tempArray.push(obj);
            }
        });
        // sort
        var sorted = {};
        sortConfig.forEach(function (id) {
            tempArray.forEach(function (tObj) {
                if (id == tObj.id) {
                    customMadeIconArray.push(tObj);
                    sorted[id] = true;
                }
            });
        });
        tempArray.forEach(function (tObj) {
            if (!isNotNull(sorted[tObj.id])) {
                customMadeIconArray.push(tObj);
            }
        });
        log('customMadeIconArray: ', customMadeIconArray);
        return customMadeIconArray;
    }
})();