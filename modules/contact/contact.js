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

    var timestamp = Date.now();
    var sender_email_address = request_body.email;
    var subject = request_body.subject;
    var message_body = request_body.body;
    if (sender_email_address == "" || subject == "" || message_body == "") {
        console.error("Some of the required field are empty")
        console.log(`${timestamp} + ${sender_email_address} + ${subject} + ${message_body}`);
        return false;
    }

    

    console.log('message is handling success');
    return true;
};