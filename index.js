/**
 * Created by jiajiangyi on 2016/11/25.
 */

var express = require('express'),
    app = express(),
    superagent = require('superagent'),
    cheerio = require('cheerio'),
    url = require('url');

var cnodeUrl = "https://cnodejs.org/";

app.get("/",function (req,res,next) {
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
            var content="";
            $('#topic_list .cell').each(function (idx, element) {

                var $element = $(element);
                var titles = $element.find(".topic_title").attr('title');
                var hrefs = url.resolve(cnodeUrl,$element.find('.topic_title').attr('href'));
                var author = $element.find('.user_avatar').children().first().attr('title');
                content+='<a href="'+hrefs+'" target="_blank">'+titles+'</a>&nbsp;&nbsp;作者：'+author+'<br><br>';

            });

            res.send(content);
        });
});

app.listen(3000,function () {
    console.log("server is running");
});
