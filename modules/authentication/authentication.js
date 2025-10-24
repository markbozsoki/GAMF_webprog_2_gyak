export const validateUserForLogin = function validateUserForLogin(request_body) {
    console.log('validateing userdata for login');
    var con = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME, 
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    
    con.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user authentication`);
            return;
        }
    });

    return true;
};

export const registerNewUser = function registerNewUser(request_body) {
    console.log('registering new user');
var con = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME, 
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    
    con.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for user registration`);
            return;
        }
    });
    

    return true;
};
