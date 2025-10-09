var http = require('http'),
    fs = require('fs');

var server_port = 8080
http.createServer(function (request, response) {
    var url = request.url;
    if (url === '/' || url === '') {
        response.writeHeader(200, { "Content-Type": "text/html" });
        fs.readFile('./pages/index.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
        });
    }
    if (url === '/admin') {
        response.writeHeader(200, { "Content-Type": "text/html" });
        fs.readFile('./pages/admin.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
        });
    } else if (url === '/login') {
        response.writeHeader(200, { "Content-Type": "text/html" });
        fs.readFile('./pages/login.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
        });
    } else {
        response.writeHeader(404, { "Content-Type": "text/html" });
        fs.readFile('./pages/404.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
        });
    }
    response.end();
}).listen(server_port, function () {
    console.log(`server start at port ${server_port}`)
});
