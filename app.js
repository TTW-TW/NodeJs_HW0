// var content = require("./data");
// console.log(123);

// var a = 3;
// a++;

// console.log("a = ", a);
// console.log(content.data3);
// console.log(content);

var http = require("http");
http.createServer(function (request, response) {
    console.log(request);
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("hello~~~");
    response.end();
}).listen(8080);
