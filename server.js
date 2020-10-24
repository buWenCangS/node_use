var http = require("http");
var fs = require("fs");
var mime = require("mime");
var path = require("path");  // 文件路径模块提供了一些处理文件路径的接口
var cache = {}

var server = http.createServer(function(request, response) {
    var filePath = false;
    if(request.url == "/"){
        filePath = 'public/index.html';
    }else{
        
        filePath = 'public' + request.url;
    }
    var absPath = "./" + filePath;
    // console.log("mime : " , mime);
    // console.log("mime : " , mime.charsets);
    // console.log("mime : " , mime.lookup);
    serverStatic(response, cache, absPath);
});

server.listen(3000, function () {
    console.log("server listening on port 3000");
});

function send404(response) {
    response.writeHead(404, {'Content-Type':'text/plain'});
    response.write("Error 404 : resource not found!");
    response.end();
}

// 访问缓存比访问文件系统要快的多，所以一般会将数据写入到缓存中，下次访问如果缓存中有东西就直接使用缓存的
// 否则就是用文件系统去读取相关的文件，然后再写入缓存系统
// 给客户端发送相关相应数据，包含文件信息和mime类型
function sendFile(response , filePath, fileContent) {
    let contentType = mime.lookup(path.basename(filePath));
    console.log("contentType : " + contentType);
    response.writeHead(200, {'Content-Type': contentType});
    response.end(fileContent);
}

function serverStatic(response , cache , absPath) {
    if(cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    }else{
        let time = Date.now();
        console.log("开始检查文件是否存在");
        let isExists = fs.existsSync(absPath); // 检查文件是否存在
        console.log("检测时间 ： " + (Date.now() - time));
        time = Date.now();
        if(isExists){
            let data = fs.readFileSync(absPath);
            console.log("读取时间 ： " + (Date.now() - time));
            cache[absPath] = data;
            sendFile(response, absPath, data);
        }else{
            send404(response);
        }
    }
}