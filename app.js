var Crawler = require("crawler");
var validUrl = require('valid-url');
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
            if(typeof $ !== "undefined"){
                $(".field-label").each(function(){
                    if($(this).text().match(/Personal Webpage/)){
                        console.log($(this).next().text());
                    }
                });

            }

        }
            
        done();
    }
});

function searchFaculty(){
    console.log("Searching Faculty URLs ......");
    process.stdout.write("Fetching last name ending in: ");
    visited.push('https://www.cc.gatech.edu/people/faculty/A');
    c1.queue('https://www.cc.gatech.edu/people/faculty/A');
}

function matchPeople(uri){
    if(uri.match(/\/people\//)){
        if(uri.match(/faculty/)){
            if(uri.match(/all/) || !uri.match(/faculty\/[A-Z]$/))
                return;
            if(visited.includes(uri));
            else{
                visited.push(uri);
                c1.queue(uri);
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
        c2.queue(result[i]);
    }
}

searchFaculty();

