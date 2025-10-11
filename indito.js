var http = require('http');
var fs = require('fs');
var exp = require('express');
const app = exp();

var genuuid = require('uudi/v4');
const session = require('express-session');

var server_port = 8080

app.use( // session middleware
    session(
        {
            name: 'SessionCookie',
            genid: function (request) {
                let session_id = genuuid();
                console.log(`session id created: ${session_id}`);
                return session_id;
            },
            secret: 'this_is_the_secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                expires: 600_000 // miliseconds (10 min)
            }
        }
    )
);

app.get('', (request, response) => loadMainPage(request, response))
app.get('/', (request, response) => loadMainPage(request, response));
function loadMainPage(request, response) {
    fs.readFile('./pages/index.html', function (erroror, html) {
        if (erroror) {
            throw erroror;
        }
        response.write(html);
        response.end();
    });
}

app.get('/login', (request, response) => {
    fs.readFile('./pages/login.html', function (error, html) {
        if (error) {
            throw error;
        }
        response.write(html);
        response.end();
    });
})

app.get('/admin', (request, response) => {
    fs.readFile('./pages/admin.html', function (error, html) {
        if (error) {
            throw error;
        }
        response.write(html);
        response.end();
    });
})

// loading css, js, bitmaps and other resources for the page
app.get(/.assets*/, (request, response) => {
    var asset_path = url.split('?')[0]
    fs.readFile(`.${asset_path}`, function (error, resource) {
        if (error) {
            throw error;
        }
        response.write(resource);
        response.end();
    });
})

app.listen(server_port, function () {
    console.log(`server start at port ${server_port}`)
});
