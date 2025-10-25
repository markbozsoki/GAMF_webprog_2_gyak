import mysql from "mysql2";

export function messagesIntegration(request, response, callback) {
    var con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    con.ping(function (err) {
        if (err) {
            console.error(`Cannot connect to: ${databaseName}`);
            callback(`<tr><td colspan='4'>Nem sikerült kapcsolódni az adatbázishoz.</td></tr>`);
            return;
        }
    });

    console.log("requesting messages table for view")
    con.connect(function (err) {
        if (err) throw err;
        var sql = `SELECT * FROM messages ORDER BY DESC timestamp;`;
        con.query(sql, function (err, result, fields) {
            if (err) throw err;

            var html = ``;
            result.forEach(row => {
                console.log(JSON.stringify(row))
                html += `<tr>
                            <td>${row.timestamp}</td>
                            <td>${row.email}</td>
                            <td>${row.subject}</td>
                            <td>${row.message}</td>
                        </tr>`.trim();
            });

            callback(html);
            con.end();
        });
    });
};
