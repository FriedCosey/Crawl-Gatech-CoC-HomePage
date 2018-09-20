var Crawler = require("crawler");
var validUrl = require('valid-url');
var robotto = require('robotto');
const normalizeUrl = require('normalize-url');
var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var visited = [];
var urlQueue = [];
var counter = 0;
var result = [];
var level = 0;


var c1 = new Crawler({
    maxConnections : 10,
    rateLimit: 1000,

    callback : function (error, res, done) {
        if(level == 20) // No U
            level++;
        process.stdout.write(String.fromCharCode('A'.charCodeAt() + level) + "... ");
        level++;
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            if(typeof $ !== "undefined"){
                $("a").each(function(index, link){
                    var uri = link.attribs.href;
                    if (validUrl.isUri(uri)){
                        matchPeople(uri);
                    }
                    else{
                        if(uri != null){
                            uri = "https://www.cc.gatech.edu" + uri;
                            matchPeople(uri);
                        }

                    }
                });
            }
        }
        if(level == 26){
            process.stdout.write('\n');
            searchHomePage();
        }
            
        done();
    }
});

var c2 = new Crawler({
    maxConnections : 10,
    rateLimit: 1000,

    callback : function (error, res, done) {
        level++;
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            console.log($("title").text());
            let titleName = $("title").text();
            if(typeof $ !== "undefined"){
                $(".field-label").each(function(){
                    if($(this).text().match(/Personal Webpage/)){
                        console.log($(this).next().text());
                        if(validUrl.isUri($(this).next().text())){                
                            request($(this).next().text()).on('error', function(err){
    console.log(err)}).pipe(fs.createWriteStream("./tmp/" + titleName + ".html"));
                        }
                    }
                });

            }

        }
            
        done();
    }
});

function searchFaculty(){
    let init = 'https://www.cc.gatech.edu/people/faculty/A';
    console.log("Searching Faculty URLs ......");
    process.stdout.write("Fetching last name ending in: ");
    visited.push(init);
    checkRobot(init, c1);
}

function matchPeople(uri){
    if(uri.match(/\/people\//)){
        if(uri.match(/faculty/)){
            if(uri.match(/all/) || !uri.match(/faculty\/[A-Z]$/))
                return;
            if(visited.includes(uri));
            else{
                visited.push(uri);
                checkRobot(uri, c1);
            }
        }
        else{
            if(uri.match(/staff/) || uri.match(/expert/))
                return;
            counter++;
            result.push(uri);
        }
    }
}

function searchHomePage(){
    for(let i = 0; i < result.length; i++){
        checkRobot(result[i], c2);
    }
}


function checkRobot(uri, c){
    robotto.canCrawl('GatechCrawler', uri , function(err, isAllowed) {
        if (err) {
            console.error(err);
            return;
        }

        if (isAllowed) {
            c.queue(normalizeUrl(uri));
        } else {
            console.log('I am not allowed to crawl this url.');
        }
    });
}

mkdirp('./tmp/', function (err) {
    if (err) console.error(err)
    else{
        console.log('Created ./tmp folder!');
        searchFaculty();
    }
});

