import mysql from "mysql2";

export const handleNewMessage = function handleNewMessage(request_body) {
    console.log('new message handling started');
    var con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    con.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for message handling`);
            return false;
        }
    });

    

    console.log('message is handling success')
    return true;
};