// ==UserScript==
// @name         Translate
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  划词翻译调用“必应词典（必应翻译）、有道词典（有道翻译）、Google Translate（谷歌翻译）、Microsoft Translator（必应在线翻译）、金山词霸、海词词典、百度翻译、Oxford Learner's Dictionaries、Oxford Dictionaries、Merriam-Webster”网页翻译
// @author       https://github.com/barrer
// @match        http://*/*
// @include      https://*/*
// @include      file:///*
// @run-at document-end
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    var dataTransfer = {
        beforePopup: function (popup) {
            var text = window.getSelection().toString().trim();
            GM_setValue('barrer.translate.data.transfer.text', text);
            popup(text);
        },
        beforeCustom: function (custom) {
            var text = GM_getValue('barrer.translate.data.transfer.text');
            GM_setValue('barrer.translate.data.transfer.text', '');
            custom(text);
        },
        backAndForward: function () {
            var backAndForwardDiv = document.createElement('div'),
                backBtn = document.createElement('a'),
                forwardBtn = document.createElement('a'),
                closeBtn = document.createElement('a'),
                btnStyle = '' +
                    'text-decoration:none!important;' +
                    'font-size:16px!important;' +
                    'cursor:pointer!important;' +
                    'display:inline!important;' +
                    'padding:0!important;' +
                    'margin:0!important;' +
                    'margin-right:4px!important;' +
                    '';
            backAndForwardDiv.setAttribute('style', '' +
                'display:block!important;' +
                'position:fixed!important;' +
                'top:0!important;' +
                'left:0!important;' +
                'padding:0!important;' +
                'margin:0!important;' +
                'font-size:16px!important;' +
                'text-align:left!important;' +
                'border:0!important;' +
                'background:transparent!important;' +
                'z-index:2147483647!important;' +
                '');
            backBtn.setAttribute('onclick', 'window.history.back()');
            forwardBtn.setAttribute('onclick', 'window.history.forward()');
            closeBtn.setAttribute('onclick', 'window.close()');
            backBtn.setAttribute('style', btnStyle);
            forwardBtn.setAttribute('style', btnStyle);
            closeBtn.setAttribute('style', btnStyle);
            backBtn.innerHTML = '⬅️';
            forwardBtn.innerHTML = '➡️';
            closeBtn.innerHTML = '↪️️';
            backAndForwardDiv.appendChild(backBtn);
            backAndForwardDiv.appendChild(forwardBtn);
            backAndForwardDiv.appendChild(closeBtn);
            document.documentElement.appendChild(backAndForwardDiv);
            new Drag(backAndForwardDiv);
        }
    };
    var iconArray = [
        {
            name: 'Bing 词典',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEX///8NhIQNgoIWiYn8/v4RhYUcjIwUh4cOhIQhjo4pkpLt9vb7/f3z+fkwlpZYqqrV6urq9fWr1dUlkJCYy8uEwcHi8PA1mJjd7u49nJx7vLz5/PxAnp72+/vg7+9dra05mpq329twtrYtlJSgz89IoqKNxMTw9/d1urrn8/NBoaFps7P0+voZiorI4+PC4OBOpKTJ5OS12dnN5eW63Ny83d2a09Pl9fXl8vJksLCBv7+Lzc1UqKjF4uIPhYXZ6+uk0dGRx8eFyclfsbENgYGx19cRg4MOgoLQ5+cei4sOgIDy+Pjd8fFSp6dcq6vZ7Owtk5Nwvb294uLS6Oi+3t4MhIQumJjL6em8398Oh4dNoqI7nJwhkZFarq5hra1Wqqo7l5cPhIQOfX1VqalhuLim3d16xcUslpZUqqofkJAajIwmlJS95+c4paWy2NiWzc0PiIgch4e929u139+z398nmZlXrq70/f1ErKzH5OROqKi34eEki4uq2NhRqKjA39/oIzviAAAAAXRSTlMAQObYZgAABIVJREFUeF7t2oVu7DgUgOFzHIRhZmYqMzMzXGbGZaZXX1VV1Z1o7nTGAa/U+7+APzmS7cSBtkKjZWBaXXHV15zArkFESQnXs0lg1N484oUhWvmeZwW4jPPXXh/zDAGIhFNrsQGGACQEuXxxes5ugC7ONTg9wNsO0BuCAw6wpdk2gG4ebJ4BfVImwBaA+MDuR6DPxTMGhNkCCPlkA+BFV4CDKQDxnGcMcDluOyAcv+0A11dA8tYDGrcA8KQrwMka8BWwwxiQL/9fADwrgAaXTdypOh0sASk1XBmedMaZAaAiIG7tFxaccd5WgPcKEFHxovXi8lA5zjMAQF26eoM/PPrR6zDP4O4GOLwGjKh4FSFKejHE2wyAFaHNxhVLmw7LAWr1GvDxw2qbQJ7nwpW7TvsA/N+oTxa4/JRvwkrAJFzn8yN2Mrx7u+SxBRAvYucEToy+Pk5aDoCAgl9KlsRw3TdhPiAE/+mXT9vYJUl883PgwEoAzHyH3RNEfzHYMhHgbwdUM2d4Y01/NPe5bBYgBW3FOOwlTgmvFFJWABbC2GOC4pqduWMcEIG2+KNvCfac+KYYG3WaCoDfXDL2HCHIqbWjxZSJAEf9DPuLrPujjwMaLeAAdGVVpEh5u2MWoJFGmoR/zALAoiJTADgfJWAB9GmzVIDPlIAO+2xApAEMmweo3icUgKx5AChxG/0DRikBJx0Au78+ZwuAP54yBkArFiWkP8CYUYCeECxKTAEAkaVZZbV3wCklYBO+nLb4Mt8zgHIpVjahW3w2lyHEyhlQRuCGWrEah4QhAGC3VHxoHWAIeqhcSKsyNeCJcQCAtj/PElDNTolWzUALbsz78fEG9UJkHKC16vdktA4wB13b2cxJhFBuRsYBzpNYEy9iA2gcBEVEqwED8IWSkdJDJMwA8cmAiqSvQykloOMm5vAWXKjLKsBph+Gdr54SZAbg48M1pDgVr9HdGypj+vHHikgI7auZccDcCwmp4kbNAIy4ORmpkjNOSsB/4J6X758hXfJ+CigB2SvAQW5LQMoya0kwCAhVFAkpE0uaA4wBqjE/9fBnU54kgCGAtpznkC6CiewOgAHAu2O+5GoibUrA6wBDAKmWeI8EqSLPcrrZpwDgPNL2/Pdjjfp3PuOR8/EJAHYAKeaJAzuA7B4r0//UarxwIQTADEC2pk94uIjNIyArlxcEbGZgmyQWJwFYAQj5KbgJwApAUKofx4EdYHvwlQbADCC7ZhYA2AHE3AAAOwCZ9TWAvkEBjRVdSoGRghtoIKLmhsBYIfc9pI57tAaG8wbzlAsPSSx5wYyG91YJxfjnlRMwqVDsQ7/Do/joBzCxv4rYV+u1bxpgapG60s+JrxIB0ytEsbdWFfddsCJPWsSbI1xi3AHWxC+5br7/OKxMgHW19prYNcU9B5aWXPZ3AXAPCmB5owkOOyeoMQ1sSMsp2ClxfwRsyhcWCOriMj6wr1C62S4QlOkG2Jlj/E/hGjDfTHvA7k7uS9dfKYaBQc7g5VdJwV9KAptOM4Isc1O7wCxvRR20Ytv5F1aNwb4yuFDOAAAAAElFTkSuQmCC',
            host: ['cn.bing.com'],
            popup: function (text) {
                popupCenter('https://cn.bing.com/dict/search?q=' + encodeURIComponent(text), null, 800, screen.height);
            },
            custom: function (text) {
            }
        },
        {
            name: '有道词典',
            image: 'data:image/png;base64,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',
            host: ['dict.youdao.com'],
            popup: function (text) {
                popupCenter('https://dict.youdao.com/w/eng/' + encodeURIComponent(text), null, 800, screen.height);
            },
            custom: function (text) {
            }
        },
        {
            name: 'Google Translate',
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
                document.querySelector('#gt-submit').click();
            }
        },
        {
            name: 'Microsoft Translator',
            image: 'data:image/png;base64,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',
            host: ['www.bing.com', 'cn.bing.com'],
            popup: function (text) {
                popupCenter('https://www.bing.com/translator', null, 800, screen.height);
            },
            custom: function (text) {
                if (window.location.href.indexOf('bing.com/translator') != -1) {
                    document.querySelector('#t_tl').value = 'zh-CHS';
                    var source = document.querySelector('#t_sv');
                    source.value = text;
                    tiggerEvent(source, 'input');
                }
            }
        },
        {
            name: '金山词霸',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEX////1AUv2DlT1A0z5ZpP2EVb/+fv2JGT1DFP+7/T//f7+4uv/9vn2HV/+6/H+5u32Gl3//P34ToH1CVH3LGn91eH8q8T4VYb2FVn6hqr/+/z5Y5D8p8H3Pnb4RHr4QXj3MW3+6e/5aZT1B0/3PXX6fqP5c5v7o776g6f4TID7n7v3KWf6iaz7lrX7jK78rMT9ztz2GFv9yNj1BE3+8fX4V4j3NG/4Rnz1BU7/8/f9w9X/+vv5a5b/9/n5Xo3+2+b8rsb8tsv8ssn9ytr8qcL+7fL90t/5W4v2HF79wtT3Kmj9xtf4UIP8vdD/9fj+2uX92OP8qsP+3+j/+Pr+4er+7vP2IWL+8vb+3ef5cJn8v9L7krL4WIj3OXL5bpj7nbr5bJf3L2v6gKX7mLb7k7P4SX78uM34U4X8t8z2ImL8u8/3N3H2IGH9wNP6dp76eJ/5cZr2H2D6iKv+5Oz/9Pf5apX6f6T+5+790+D91+P6eqD8tMr7j7D7m7j9zNv5Yo8kSjR+AAAAAXRSTlMAQObYZgAAA+lJREFUeF7t2mXP6koYheG1iru/7u7u7m7b3f24u/z1k+wEAnSGaUuB82GuP/DcaQaeoQGOaZo2SbGTbdTF1yuNnX+7pbHzD8cbOz860Nj5qTTFOuo0/5gSxhzqoZ1Sxj5qLvUvKzDm6vP85YxL1NTmBRUye6ih0ACVPH+jZiJZWjGIGplL0prFK9RCR4ZWLUXgutQfFBJXtVzCZfEuCp1ceyniaYWrzmOy9SP9ZljuhWvCrZWuH/40hWY/wiWJLooFHgIVCrixCjfcaqHYeASoXHD/FFU7fEqJpTjy/B8o4Q2hOjuzlOhasLQjZw9QhcQHyjT7UWKIMt2/waHwpEGZoTDKTFBm/vkhnJhbooznLcwO+inj+yEKu+JeD2WCexA59VEq9qYNdvinfJT66ghi2+OUC4zZSGj6RLmBXsgsjLKCwJsoLHn8jBV4/aqdKZdsvQelmWVW0K+6cO34WEnw5xvF+AtWEpuDyvYrVra80+Z0PJfjUIv2USE5+BAi54rxnpEwLJn2UaXzxQOUed+t6r6EVZFOKmWap6Mo8A/3UGE0DuvCUxmqnaXyK7c1SYX+J7Ant0Sl6Xxulg2RRt57NkLwLgq22ABTKMBhC+uupw1FOlgzBoU8+yiRptjWBqvU2zdPgecoFRGGBr7Aa1YJyI3SJLlg4d3vyrdXqD5AvOAPYDLAMp05wKUAYK90Ry7DLLfCYrPDgIsBCHecsSBzDYHiy8z8yxBcCzAn/AKRq0/M6z4CXA8AwtM9JMnAJoR287feJsC9AMHS/wiJZpIMjkRRuwBgv3kRMgmDnvYEUNMAIAypt11HKLMZEupjudaQGOwIw6pHLPcXXKIDdIAO0AFjrKUxKOkAHaADdIAO0AE6wB8qcys27PCHyajxujdUyg+7Is1kcMbRhWSYZOxFG6qxPhEkyWTEQcBdH0ly/ADOXZ7xM756YDsg3J1P69mFM4ljFqRTdgMmWMDOU9jXNmWwyDc2A2b6WezdDGxay7LUmK2A1QDLLN7Aht4tlutfsxPQTpP5PlgWjdFs9kfrAR2KPaD0p4dmX96xGnAdpNl3sGOKAu0WA+700Kwr5cLfFietBbykWeAQ9vg7SeFBVAc00czIwa74feFBVAfcBGni2YN9OUN4EFUBP2VpNgITpx+FIVXAMc2ewpkJmnjvKQKmRY8tCocWWSp7rj6ETQGW+f5XOLWaZZHMxDrUAVh/28JixhGc2/axYPS21V2wOhhkgWcX1djLH8STJjvbMOGdzwc8gV2i1/WeRws27wO/X/CzDVQrTXLpHwd3wrVnJN+lYBHr7bEO0AE6QAfoAB2gA/C/oGnaf/DSo5D7etMMAAAAAElFTkSuQmCC',
            host: ['www.iciba.com'],
            popup: function (text) {
                popupCenter('http://www.iciba.com/' + encodeURIComponent(text), null, 800, screen.height);
            },
            custom: function (text) {
            }
        },
        {
            name: '海词词典',
            image: 'data:image/png;base64,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',
            host: ['dict.cn', 'hanyu.dict.cn', 'abbr.dict.cn', 'ename.dict.cn'],
            popup: function (text) {
                popupCenter('https://dict.cn/' + encodeURIComponent(text), null, 800, screen.height);
            },
            custom: function (text) {
            }
        },
        {
            name: '百度翻译',
            image: 'data:image/png;base64,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',
            host: ['fanyi.baidu.com'],
            popup: function (text) {
                popupCenter('https://fanyi.baidu.com/#en/zh/' + encodeURIComponent(text), null, 1024, screen.height);
            },
            custom: function (text) {
            }
        },
        {
            name: 'Oxford Learner\'s Dictionaries',
            image: 'data:image/png;base64,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',
            host: ['www.oxfordlearnersdictionaries.com'],
            popup: function (text) {
                popupCenter('https://www.oxfordlearnersdictionaries.com/definition/english', null, 800, screen.height);
            },
            custom: function (text) {
                document.querySelector('.searchfield_input').value = text;
                document.querySelector('#search-btn input').click();
            }
        },
        {
            name: 'Oxford Dictionaries',
            image: 'data:image/png;base64,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',
            host: ['en.oxforddictionaries.com'],
            popup: function (text) {
                popupCenter('https://en.oxforddictionaries.com', null, 800, screen.height);
            },
            custom: function (text) {
                document.querySelector('#query').value = text;
                document.querySelector('button[data-value="Launch search"]').click();
            }
        },
        {
            name: 'Merriam-Webster',
            image: 'data:image/png;base64,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',
            host: ['www.merriam-webster.com'],
            popup: function (text) {
                popupCenter('https://www.merriam-webster.com', null, 800, screen.height);
            },
            custom: function (text) {
                document.querySelector('#s-term').value = text;
                document.querySelector('.s-frm').submit();
            }
        }
    ], hostCustomMap = {};
    iconArray.forEach(function (obj) {
        obj.host.forEach(function (host) {// 赋值DOM加载后的自定义方法Map
            hostCustomMap[host] = obj.custom;
        });
    });
    var text = GM_getValue('barrer.translate.data.transfer.text');
    log('barrer.translate.data.transfer.text: ' + text);
    if (text && window.location.host in hostCustomMap) {
        dataTransfer.beforeCustom(hostCustomMap[window.location.host]);
    }
    if (window.location.host in hostCustomMap) {
        document.onkeydown = escExit;
        dataTransfer.backAndForward();// add back and forward button
    }

    log('url: ' + window.location.href);
    // 翻译图标
    var icon = document.createElement('div');
    // 绑定图标拖动事件
    var iconDrag = new Drag(icon);
    iconArray.forEach(function (obj) {
        var img = document.createElement('img');
        img.setAttribute('src', obj.image);
        img.setAttribute('alt', obj.name);
        img.setAttribute('title', obj.name);
        img.addEventListener('mouseup', function () {
            if (iconDrag.elementOriginalLeft == parseInt(icon.style.left)
                && iconDrag.elementOriginalTop == parseInt(icon.style.top))// 没有拖动鼠标抬起的时候触发点击事件
                dataTransfer.beforePopup(obj.popup);
        });
        img.setAttribute('style', '' +
            'cursor:pointer!important;' +
            'display:inline-block!important;' +
            'width:22px!important;' +
            'height:22px!important;' +
            'border:0!important;' +
            'background-color:rgba(255,255,255,1)!important;' +
            'padding:0!important;' +
            'margin:0!important;' +
            'margin-right:5px!important;' +
            '');
        icon.appendChild(img);
    });
    icon.setAttribute('style', '' +
        'display:none!important;' +
        'position:absolute!important;' +
        'padding:0!important;' +
        'margin:0!important;' +
        'font-size:13px!important;' +
        'text-align:left!important;' +
        'border:0!important;' +
        'background:transparent!important;' +
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
        }
    });
    // 鼠标事件：防止选中的文本消失；显示、隐藏翻译图标
    document.addEventListener('mouseup', function (e) {
        if (e.target == icon || (e.target.parentNode && e.target.parentNode == icon)) {// 点击了翻译图标
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

    /**Esc键关闭窗口*/
    function escExit(e) {
        e = e || window.event;
        var isEscape = false;
        if ("key" in e)
            isEscape = (e.key == "Escape" || e.key == "Esc");
        else
            isEscape = (e.keyCode == 27);
        if (isEscape)
            window.close();
    }

    /**触发事件*/
    function tiggerEvent(el, type) {
        if ('createEvent' in document) {// modern browsers, IE9+
            var e = document.createEvent('HTMLEvents');
            e.initEvent(type, false, true);// event.initEvent(type, bubbles, cancelable);
            el.dispatchEvent(e);
        } else {// IE 8
            var e = document.createEventObject();
            e.eventType = type;
            el.fireEvent('on' + e.eventType, e);
        }
    }

    /**弹出居中窗口*/
    function popupCenter(url, title, w, h) {
        var x = screen.width / 2 - w / 2;
        var y = screen.height / 2 - h / 2;
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
})();