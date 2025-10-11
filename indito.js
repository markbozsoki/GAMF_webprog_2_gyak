var http = require('http');
var fs = require('fs');
var exp = require('express');
const app = exp();

var genuuid = require('uudi/v4');
const session = require('express-session');

var server_port = 8080
http.createServer(function (request, response) {
    var url = request.url;
    console.log(`request url path: ${url}`)

    if (url === '/' || url === '' || url === '/index.html') {
        fs.readFile('./pages/index.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
            response.end();
        });
    } else if (url === '/admin') {
        fs.readFile('./pages/admin.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
            response.end();
        });
    } else if (url === '/login') {
        fs.readFile('./pages/login.html', function (err, html) {
            if (err) {
                throw err;
            }
            response.write(html);
            response.end();
        });
    } else if (url.startsWith('/assets')) {
        var asset_path = url.split('?')[0]
        fs.readFile(`.${asset_path}`, function (err, asset) {
            if (err) {
                throw err;
            }
            response.write(asset);
            response.end();
        });
    }
})

app.listen(server_port, function () {
    console.log(`server start at port ${server_port}`)
});
