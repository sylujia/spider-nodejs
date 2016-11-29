/**
 * Created by jiajiangyi on 2016/11/28.
 */

var async = require('async'),
    express = require('express'),
    app = express(),
    superagent = require('superagent'),
    cheerio = require('cheerio'),
    url = require('url');

var baseUrl = "https://cnodejs.org/";
var topicUrls = [];//要爬的的url集合


app.get("/", function (req, res) {
    superagent.get(baseUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            $('#topic_list .topic_title').each(function (idx, element) {

                var $element = $(element);
                var hrefs = url.resolve(baseUrl, $element.attr('href'));
                topicUrls.push(hrefs);
            });

            // 并发量控制为 5
            async.mapLimit(topicUrls, 5, function (url, callback) {
                //抓取网页内容
                fetchUrl(url, callback);
            }, function (err, result) {
                console.log('final:');
                console.log(result);
                res.send('final:' + JSON.stringify(result));
            });
        });
});

// 并发连接数的计数器
var concurrencyCount = 0;
//抓取网页内容
var fetchUrl = function (url, callback) {
    concurrencyCount++;
    console.log("当前是第", concurrencyCount, "个并发连接");
    superagent.get(url)
        .end(function (err, res) {
            concurrencyCount--;
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            // 页面分析，返回需要的数据
            var result = analyze(url, res.text);
            callback(null, result);//null表示没有错误
        });
};

//页面分析
var analyze = function (url, page) {
    var $ = cheerio.load(page);
    return ({
        title: $('.topic_full_title').text().trim(),
        htef: url,
        content1: $('.reply_content').eq(0).text().trim()
    });
};

app.listen(3000, function () {
    console.log("servier is running ");
});


