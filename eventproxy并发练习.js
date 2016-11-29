/**
 * Created by jiajiangyi on 2016/11/25.
 */

var express = require('express'),
    app = express(),
    superagent = require('superagent'),
    cheerio = require('cheerio'),
    eventproxy = require('eventproxy'),
    ep = new eventproxy(),
    url = require('url');

var cnodeUrl = "https://cnodejs.org/";

app.get("/", function (req, res, next) {
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    superagent.get(cnodeUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(sres.text);
            var topicUrls = [];
            $('#topic_list .topic_title').each(function (idx, element) {

                var $element = $(element);
                var hrefs = url.resolve(cnodeUrl, $element.attr('href'));
                topicUrls.push(hrefs);
            });


            ep.after('topic_html', topicUrls.length, function (topics) {
                topics = topics.map(function (topicPair) {
                    var topicUrl = topicPair[0];
                    var topicHtml = topicPair[1];
                    var $ = cheerio.load(topicHtml);
                    return ({
                        title: $('.topic_full_title').text().trim(),
                        htef: topicUrl,
                        content1: $('.reply_content').eq(0).text().trim()
                    });
                });

                console.log(topics);
            });

            topicUrls.forEach(function (topicUrl) {

                superagent.get(topicUrl)
                    .end(function (err, res) {
                        console.log('fetch', topicUrl, 'successful');
                        ep.emit('topic_html', [topicUrl, res.text]);
                    });
            });


            res.send(topicUrls);
        });
});

app.listen(3000, function () {
    console.log("server is running");
});
