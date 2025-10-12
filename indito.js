import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import exp from 'express';
import session from 'express-session';

const app = exp();
var PORT = 8080;

app.use( // session middleware
    session(
        {
            name: 'SessionCookie',
            genid: function (request) {
                let session_id = uuidv4();
                console.log(`session id created: ${session_id}`);
                return session_id;
            },
            secret: 'this_is_the_secret',
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                expires: 600_000 // miliseconds (10 min)
            }
        }
    )
);

app.get('', (request, response) => loadMainPage(request, response));
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

const requireAuth = (request, response, next) => {
    if (request.session.userId) {
        next();
    } else {
        console.log(`Access denied to: ${request.path}, login required`);
        response.redirect('/login?error=' + encodeURIComponent('ACCESS_DENIED'));
    }
}

app.get('/login', (request, response) => {
    if (request.session.userId) {
        console.log(`User is already logged in: ${request.session.userId}`);
        response.redirect('');
    } else {
        fs.readFile('./pages/login.html', function (error, html) {
            if (error) {
                throw error;
            }
            response.write(html);
            response.end();
        });
    }
})

app.get('/admin', requireAuth, (request, response) => {
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
    console.log(`Loading resource: ${request.path}`);
    fs.readFile(`.${request.path}`, function (error, resource) {
        if (error) {
            throw error;
        }
        response.write(resource);
        response.end();
    });
})

app.get(/.*/, (request, response) => {
    console.log(`Unrecognized path: ${request.path}`);
    fs.readFile('./pages/404.html', function (error, html) {
        if (error) {
            throw error;
        }
        response.write(html);
        response.end();
    });
})

app.listen(PORT, function () {
    console.log(`server start at port ${PORT}`);
});
