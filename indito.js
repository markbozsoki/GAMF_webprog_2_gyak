import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import exp from 'express';
import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import passport from 'passport';
import passportLocal from 'passport-local';
import bodyParser from 'body-parser';
import crypto from 'crypto';

const LocalStrategy = passportLocal.Strategy;
const MySQLStore = mysqlSession(session);

import { registerNewUser, validateUserForLogin } from './modules/authentication/authentication.js';
import { getRecipes } from './modules/database/database.js';
import { crudIngredients } from "./modules/CRUD/crud.js";

const app = exp();

const SESSION_NAME = "SessionCookie"
app.use( // session middleware
    session(
        {
            key: SESSION_NAME,
            secret: 'this_is_the_secret',
            store: new MySQLStore({
                host: process.env.DB_HOST,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            }),
            resave: false,
            saveUninitialized: false,
            cookie: {
                expires: 600_000 // miliseconds (10 min)
            }
        }
    )
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(exp.static('public'));
app.set("views", "pages")
app.set("view engine", "ejs");

const customFields = {
    usernameField: 'uname',
    passwordField: 'pw',
};

const verifyCallback = (username, password, done) => {
    var con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    con.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user authentication`);
            return false;
        }
    });
    con.query('SELECT * FROM users WHERE username = ? ', [username], function (error, results, fields) {
        if (error)
            return done(error);
        if (results.length == 0)
            return done(null, false);
        const isValid = validPassword(password, results[0].hash);
        user = { id: results[0].id, username: results[0].username, hash: results[0].hash };
        if (isValid)
            return done(null, user);
        else
            return done(null, false);
    });
}

const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

passport.serializeUser((user, done) => {
    console.log("inside serialize");
    done(null, user.id)
});

var PORT = process.env.APP_PORT || 8080;

const HOME_PAGE = "/#homepage"
const LOGIN_PAGE = "/login"
const LOGOUT_PAGE = "/logout"
const ADMIN_PAGE = "/admin"
const DATABASE_PAGE = "/database"
const INGREDIENTS_PAGE = "/ingredients"

const ADMIN_ROLE = "admin"
const USER_ROLE = "user"

app.get('', (request, response) => loadMainPage(request, response));
app.get('/', (request, response) => loadMainPage(request, response));
function loadMainPage(request, response) {

    const template_data = {
        userRole: request.session.userRole,
        isLogedIn: request.session.userId
    }
    response.render('index', template_data);

}

app.get(LOGIN_PAGE, (request, response) => {
    if (request.session.userId) {
        console.log(`User is already logged in as: ${request.session.userId}`);
        var error_msg = `Már be vagy jelentkezve, mint ${request.session.userId}! Jelentkezz ki a felhasználóváltáshoz!`
        response.send(`<script>alert("${error_msg}"); window.location.href = "${HOME_PAGE}"; </script>`);
    } else {
        response.render("login")
    }
});

app.get(LOGOUT_PAGE, (request, response) => {
    request.session.destroy(function (err) {
        response.clearCookie(SESSION_NAME);
        response.redirect(HOME_PAGE);
    });
});

const requireAdminRole = (request, response, next) => {
    if (request.session.userRole == ADMIN_ROLE) {

        next();
    } else {
        console.log(`Access denied to: ${request.path}, login required`);
        response.render("403")
    }
}

app.get(ADMIN_PAGE, requireAdminRole, (request, response) => {
    response.render("admin");
});

app.get(DATABASE_PAGE, (request, response) => {
    getRecipes("recipe_database", (html) => {
        response.write(html);
        response.end();
    });
});

app.all(INGREDIENTS_PAGE, (request, response) => {
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

app.get("/favicon.ico", (request, response) => {
    fs.readFile(`assets/img/${request.path}`, function (error, resource) {
        if (error) {
            throw error;
        }
        response.write(resource);
        response.end();
    });
});

app.get(/.*/, (request, response) => {
    console.log(`Unrecognized path: ${request.path}`);
    response.render("404");
});

app.post(LOGIN_PAGE, (request, response) => {
    var requested_method = request.query.method
    if (requested_method === "login") {
        login(request, response);
        response.redirect(HOME_PAGE);
    }
    else if (requested_method === "register") {
        register(request, response);
        response.redirect(LOGIN_PAGE);
    }
    else {
        response.render("403");
    }
});

function register(request, response) {
    var data = request.body;
    console.log(`registration initiated with ${JSON.stringify(data)}`);
    if (registerNewUser(data)) {
        response.send(`<script>alert("Sikeres regisztráció!"); window.location.href = "${LOGIN_PAGE}"; </script>`);
    } else {
        response.send(`<script>alert("Regisztráció sikertelen!"); window.location.href = "${LOGIN_PAGE}"; </script>`);
    }
}

function login(request, response) {
    var data = request.body;
    console.log(`logging in initiated with ${JSON.stringify(data)}`);
    if (validateUserForLogin(data)) {
        request.session.userId = "mockUserId";
        request.session.userRole = USER_ROLE;
        //request.session.userRole = ADMIN_ROLE;
    } else {
        response.send(`<script>alert("Helytelen felhasználónév vagy jelszó!"); window.location.href = "${LOGIN_PAGE}"; </script>`);
    }
}



app.listen(PORT, function () {
    console.log(`Server started at port: ${PORT} -> http://localhost:${PORT}`);
});
