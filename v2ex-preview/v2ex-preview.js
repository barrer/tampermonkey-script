// ==UserScript==
// @name         v2ex-preview
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  https://github.com/barrer/tampermonkey-script/tree/master/v2ex-preview
// @author       barrer
// @match        https://www.v2ex.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var interval = 3;// 秒，每隔几秒ajax GET下一个帖子（太频繁会被v2ex.com封IP，建议：大于等于3秒）
    function gAjaxGet(url, fnSuccess, fnError, element) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    fnSuccess(xmlhttp.responseText, element);
                } else {
                    fnError(xmlhttp.responseText, element);
                }
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    function appendHtml(response, element) {
        // console.log(response, element);
        // 获取返回内容正文
        var result = '';
        var parser = new DOMParser();
        var resultDoc = parser.parseFromString(response, 'text/html');
        var resultContent = resultDoc.querySelector('#Main .box .cell .topic_content');
        if(resultContent) {
            result = resultContent.innerText;
        }
        var resultSubContent = resultDoc.querySelector('#Main .box .subtle .topic_content');
        if(resultSubContent) {
            result += resultSubContent.innerText;
        }
        result = result.replace(/\n/g, '<br>');
        // 把正文插入标题后面
        var content = document.createElement('div');
        content.style.fontSize = '13px';
        content.style.marginTop = '1em';
        content.innerHTML = '<div>' + result + '</div>';
        element.parentElement.append(content);
    }

    var list = document.querySelectorAll('.item_title');
    list.forEach(function(item, index) {
        var a = item.querySelector('a');
        setTimeout(function() {
            gAjaxGet(a.getAttribute('href'), function(response, element) {
                // 获取内容成功
                appendHtml(response, element);
            }, function(response, element) {
                // 获取内容出错（添加自定义错误提示）
                appendHtml('<div id="Main"><div class="box"><div class="cell"><div class="topic_content">暂未能获取内容！（' +
                           response +
                           '）</div></div></div></div>', element);
            }, item);
        }, index * interval * 1000 + 2000);
    });
})();