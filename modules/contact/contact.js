import mysql from "mysql2";

export const handleNewMessage = function handleNewMessage(request_body) {
    console.log('new message handling started');
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    connection.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName} for message handling`);
            return false;
        }
    });

    var timestamp = parseInt(Date.now().toString().substring(0, 10));
    var sender_email_address = request_body.email;
    var subject = request_body.subject;
    var message_body = request_body.body;
    console.log(`${timestamp} + ${sender_email_address} + ${subject} + ${message_body}`);

    if (
        sender_email_address == "" ||
        sender_email_address.trim() === "" ||
        subject == "" ||
        subject.trim() === "" ||
        message_body == "" ||
        message_body.trim() === ""
    ) {
        console.error("Some of the required field are empty");
        console.log(`${timestamp} + ${sender_email_address} + ${subject} + ${message_body}`);
        return false;
    }

    try {
        connection.query(
            "INSERT INTO messages (timestamp, email, subject, message) VALUES (?, ?, ?, ?)",
            [timestamp, sender_email_address, subject, message_body],
            (err, result) => {
                if (err) {
                    console.error(`failed to save message: ${err}`);
                    return false;
                }
            }
        );
    } catch (err) {
        console.error(`failed to save message: ${err}`);
        return false;
    }

    console.log('message is handling success');
    return true;
};
