var Crawler = require("crawler");
var validUrl = require('valid-url');
var visited = [];
var urlQueue = [];
var counter = 0;

var c = new Crawler({
    maxConnections : 10,
    rateLimit: 2000,

    callback : function (error, res, done) {
        if(error){
            //console.log(error);
        }else{
            var $ = res.$;
            console.log("--------------------");
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
        console.log("Num Faculty: " + counter);
        done();
    }
});

// Queue just one URL, with default callback
c.maxDepth = 1;
visited.push('https://www.cc.gatech.edu/people/faculty/A');
c.queue('https://www.cc.gatech.edu/people/faculty/A');

function matchPeople(uri){

    if(uri.match(/\/people\//)){
        if(uri.match(/faculty/)){
            if(uri.match(/all/) || !uri.match(/faculty\/[A-Z]$/))
                return;
            if(visited.includes(uri));
            else{
                visited.push(uri);
                c.queue(uri);
            }
        }
        else{
            if(uri.match(/staff/) || uri.match(/expert/))
                return;
            counter++;
            console.log(uri);
        }
    }
}
