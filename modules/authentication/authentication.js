import mysql from "mysql2";
import crypto from 'crypto';

export const validateUserForLogin = function validateUserForLogin(response, request, callback) {
    console.log('validateing userdata for login');
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    connection.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user authentication`);
            callback(response, request, false);
        }
    });

    connection.query('Select * from users where username=? ', [request.body.username], function (error, results, fields) {
        if (error){
            console.log("Error, user not found");
            return
        }
        else if (results.length != 1){
            console.log('validation fa{iled')
            callback(response, request, false);
        }
    });

    console.log('validation success')
    callback(response, request, true);
};

export const registerNewUser = function registerNewUser(request_body) {
    console.log('registering new user');
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    connection.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user registration`);
            return false;
        }
    });

    connection.query('Select * from users where username=? ', [request_body.username], function (error, results, fields) {
        if (error)
            console.log("Error");
        else if (results.length != 0)
            console.log('username already exists')
        return false;
    });

    const hash = genPassword(request_body.new_password);
    connection.query('Insert into users(firstname,lastname,username,passwordHash,role) values(?,?,?,?,1) ', [
        request_body.surname, request_body.forename, request_body.username, hash

    ], function (error, results, fields) {
        if (error)
            console.log("Error");
        else
            console.log("Successfully Entered");
    });

    console.log('registration success')
    return true;
};

export const genPassword = function genPassword(password) {
    return crypto.createHash('sha512').update(`${password}`).digest('hex');
}

export const validatePassword = function validatePassword(password, hash) {
    return hash === crypto.createHash('sha512').update(`${password}`).digest('hex');
}

export const passwordIsValid = function passwordIsValid(response, request, callback) {
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    connection.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user authentication`);
            callback(response, request, false);
        }
    });
    connection.query('Select * from users where username=? ', [request.body.username], function (error, results, fields) {
        if (error)
            console.log("Error");
        else if (results.length > 0) {
            if (validatePassword(request.body.current_password, results[0].passwordHash)) {
                console.log("Correct password");
                callback(response, request, true);
            }
            else {
                console.log("Incorrect password");
                callback(response, request, false);
            }
        }
        else
            callback(response, request, false);
    });
}

export const userRoleIsAdmin = function userRoleIsAdmin(response, request, callback) {
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    connection.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user authentication`);
            callback(response, request, false);
        }
    });
    connection.query('Select * from users where username=? ', [request.body.username], function (error, results, fields) {
        if (error)
            console.log("Error");
        else if (results.length > 0) {
            if (results[0].role == 2) {
                console.log("user is admin");
                callback(response, request, true);
                return
            }
            else if (results[0].role == 1) {
                console.log("user is not admin");
                callback(response, request, false);
                return
            }
        }
        else
            callback(response, request, false);
            return
    });
}