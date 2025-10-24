import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import exp from 'express';
import session from 'express-session';
import { registerNewUser, validateUserForLogin } from './modules/authentication/authentication.js';
import { getRecipes } from './modules/database/database.js';
import { crudIngredients } from "./modules/CRUD/crud.js";

const app = exp();
var PORT = process.env.APP_PORT || 8080;

app.use( // session middleware
    session(
        {
            name: 'SessionCookie',
            genid: function (request) {
                let session_id = uuidv4();
                //console.log(`session id created: ${session_id}`);
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

app.get('', (request, response) => loadMainPage(request, response));
app.get('/', (request, response) => loadMainPage(request, response));
function loadMainPage(request, response) {
    fs.readFile('./pages/index.html', function (error, html) {
        if (error) {
            throw error;
        }
        response.write(html);
        response.end();
    });
}

app.get('/login', (request, response) => {
    if (request.session.userId) {
        console.log(`User is already logged in as: ${request.session.userId}`);
        var error_msg = `Már be vagy jelentkezve, mint ${request.session.userId}! Jelentkezz ki a felhasználóváltáshoz!`
        response.send(`<script>alert("${error_msg}"); window.location.href = "/#homepage"; </script>`);

    } else {
        fs.readFile('./pages/login.html', function (error, html) {
            if (error) {
                throw error;
            }
            response.write(html);
            response.end();
        });
    }
});

const requireAuth = (request, response, next) => {
    if (request.session.userId) {
        next();
    } else {
        console.log(`Access denied to: ${request.path}, login required`);
        fs.readFile('./pages/403.html', function (error, html) {
            if (error) {
                throw error;
            }
            response.write(html);
            response.end();
        });
    }
}

app.get('/admin', requireAuth, (request, response) => {
    fs.readFile('./pages/admin.html', function (error, html) {
        if (error) {
            throw error;
        }
        response.write(html);
        response.end();
    });
});

app.get('/database', (request, response) => {
    getRecipes("recipe_database", (html) => {
        response.write(html);
        response.end();
    });
});

app.all('/ingredients', (request, response) => {
    crudIngredients(request, response);
});


// loading css, js, bitmaps and other resources for the page
app.get(/.assets*/, (request, response) => {
    //console.log(`Loading resource: ${request.path}`);
    fs.readFile(`.${request.path}`, function (error, resource) {
        if (error) {
            throw error;
        }
        response.write(resource);
        response.end();
    });
});

app.get(/.*/, (request, response) => {
    console.log(`Unrecognized path: ${request.path}`);
    fs.readFile('./pages/404.html', function (error, html) {
        if (error) {
            throw error;
        }
        response.write(html);
        response.end();
    });
});

app.post('/login', (request, response) => {
    var requested_method = request.query.method
    if (requested_method === "login") {
        login(request, response);
        response.redirect('/#homepage');
    }
    else if (requested_method === "register") {
        register(request, response);
        response.redirect('/login');
    }
    else {
        fs.readFile('./pages/403.html', function (error, html) {
            if (error) {
                throw error;
            }
            response.write(html);
            response.end();
        });
    }
});

function register(request, response) {
    console.log('registration initiated');
    var data = request.body;
    if (registerNewUser(data)) {
        response.send('<script>alert("Sikeres regisztráció!"); window.location.href = "/login"; </script>');
    } else {
        response.send('<script>alert("Regisztráció sikertelen!"); window.location.href = "/login"; </script>');
    }
}

function login(request, response) {
    console.log('logging in initiated');
    var data = request.body;
    if (validateUserForLogin(data)) {
        request.session.userId = "mockUserId";
    } else {
        response.send('<script>alert("Helytelen felhasználónév vagy jelszó!"); window.location.href = "/login"; </script>');
    }
}

app.post('/logout', (request, response) => {
    request.logout((error) => {
        if (error) {
            return next(error);
        }
        request.session.destroy(() => {
            response.redirect('');
        })
    })
});

app.listen(PORT, function () {
    console.log(`Server started at port: ${PORT} -> http://localhost:${PORT}`);
});
