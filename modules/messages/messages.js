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
        var sql = `SELECT * FROM messages ORDER BY timestamp DESC;`;
        con.query(sql, function (err, result, fields) {
            if (err) throw err;

            var html = ``;
            result.forEach(row => {
                console.log(JSON.stringify(row))
                var datetime_string = `${new Date(row.timestamp * 1000)}`.substring(4,34)
                html += `<tr>
                            <td>${datetime_string}</td>
                            <td>${row.email}</td>
                            <td style="max-width:250px;">${row.subject}</td>
                            <td style="max-width:500px;">${row.message}</td>
                        </tr>`.trim();
            });

            callback(html);
            con.end();
        });
    });
};
