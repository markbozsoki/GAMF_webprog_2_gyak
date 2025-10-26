import mysql from "mysql2";
import crypto from 'crypto';

export const ADMIN_ROLE = "admin"
export const USER_ROLE = "user"

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

export const verifyCallback = (username, password, done) => {
    connection.query('SELECT * FROM users WHERE username = ? ', [username], function (error, results, fields) {
        if (error)
            return done(error);
        if (results.length == 0)
            return done(null, false);
        const isValid = validPassword(password, results[0].passwordHash);
        user = { id: results[0].id, username: results[0].username, hash: results[0].passwordHash };
        if (isValid)
            return done(null, user);
        else
            return done(null, false);
    });
}

function validPassword(passwordHash, hash) {
    return hash === crypto.createHash('sha512').update(passwordHash).digest('hex');
}

function genPassword(password) {
    return crypto.createHash('sha512').update(password).digest('hex');
}

export const userExists = function userExists(request_body) {
    connection.query('Select * from users where username=? ',
        [request_body.username],
        function (error, results, fields) {
            if (error) {
                console.log("Error during userExist query");
            }
            else if (results.length > 0) {
                console.log(`User ${request_body.username} already exists`);
                return true;
            }
            else {
                return false;
            }
        });
}

export const requireAdminRole = (request, response, next) => {
    if (request.session.userRole == ADMIN_ROLE) {
        next();
    } else {
        console.log(`Access denied to: ${request.path}, login required`);
        response.render("403")
    }
}

export const registerNewUser = function registerNewUser(request_body) {
    console.log('registering new user');
    connection.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${process.env.DB_DATABASE} for user registration`);
            return false;
        }
    });

    console.log('registration success')
    return true;
};
